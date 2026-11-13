import {
  BANDS_2026,
  CORPORATE_MIN_BASE,
  FLAT_RATE,
  GENERIC_EXPENSES,
  MAX_BASE,
  MIN_BASE,
  RATES,
  RATE_KEYS,
  SMI_ANNUAL,
  TOTAL_RATE,
  type Band,
  type RateKey,
} from "./rules-2026";

/**
 * Self-employed contributions (RETA) 2026: from expected income and expenses
 * to the band of net earnings, its minimum and maximum base, the monthly
 * contribution on the chosen base, the tarifa plana, and what the yearly
 * regularisation would do if the chosen base falls outside the band.
 * Pure and deterministic: the page renders it on the server, the calculator
 * in the browser, the tests against the BOE tables.
 *
 *   computable = (income − expenses) − 7 % (3 % corporate)   LGSS 308.1.c 2.ª
 *   monthly earnings = computable / 12                       LGSS 308.1.a 1.ª
 *   band = the table row whose range holds it                Orden PJC/297/2026 art. 18.1
 *   contribution = base × 31,50 %                            art. 18.2, 37.5, 37.6
 *
 * Out of scope, and said so on the page: part-year registration (the
 * regularisation prorates by days), several activities with different tax
 * methods, pluriactivity refunds, the agrarian special system, sea workers,
 * collaborating family members, religious orders, artists' reduced base,
 * other reductions and bonuses (birth, care, Cuenca/Soria/Teruel).
 */

export type Period = "annual" | "monthly";
/** "first": the first 12 months; "second": the 12-month extension for earnings below the annual minimum wage. */
export type FlatRate = "none" | "first" | "second";

export interface SelfEmployedInput {
  /** Whether `income` and `expenses` are for the year or per month. */
  period: Period;
  /** Expected income from the activity (without VAT). */
  income: number;
  /** Deductible expenses, WITHOUT your own self-employed contributions (the TGSS adds them back). */
  expenses: number;
  /** Partner/director of a company (LGSS 305.2 b) or of a sociedad laboral (305.2 e): 3 % and the 1.424,40 € floor. */
  corporate: boolean;
  flatRate: FlatRate;
  /** The monthly base you pay (or will choose); null = the band's minimum. */
  base: number | null;
}

export const DEFAULT_INPUT: SelfEmployedInput = {
  period: "annual",
  income: 30000,
  expenses: 6000,
  corporate: false,
  flatRate: "none",
  base: null,
};

export interface ContributionLine {
  key: RateKey;
  rate: number;
  monthly: number;
}

export type RegularisationKind = "none" | "pay" | "refund" | "flat-rate" | "flat-rate-lost";

export interface SelfEmployedResult {
  input: SelfEmployedInput;
  annual: {
    income: number;
    expenses: number;
    /** income − expenses, never below 0. */
    net: number;
    genericPct: number;
    genericDeduction: number;
    /** What the bands use (rendimiento computable). */
    computable: number;
  };
  /** computable / 12, to the cent. */
  monthlyEarnings: number;
  band: Band;
  /** The base range for this person: the band's, with the corporate floor. */
  range: { min: number; max: number };
  /** The base the contribution is worked out on. */
  base: number;
  /** "minimum" when no base was given; "clamped" when the one given was outside the legal limits. */
  baseSource: "minimum" | "chosen" | "clamped";
  /** The chosen base sits inside `range`: nothing to regularise. */
  inRange: boolean;
  /** Contribution on `base` at the full 31,50 %. */
  full: { monthly: number; annual: number; lines: ContributionLine[] };
  /** Contributions at the range's minimum and maximum base. */
  bandMonthly: { min: number; max: number };
  /** What is actually paid each month (the tarifa plana, if it applies). */
  pay: { monthly: number; annual: number; flatRate: boolean };
  flat: {
    asked: FlatRate;
    /** Second period: earnings under the annual minimum wage. */
    eligible: boolean;
  };
  regularisation: {
    kind: RegularisationKind;
    /** The base the TGSS would settle on. */
    definitiveBase: number;
    /** Positive = you pay; negative = refund. For a 12-month year. */
    annual: number;
  };
}

export function round2(x: number): number {
  return Math.round((x + Math.sign(x) * Number.EPSILON) * 100) / 100;
}

function clean(x: number): number {
  return Number.isFinite(x) && x > 0 ? x : 0;
}

/** The band of the 2026 tables for an average monthly net earnings figure. */
export function bandFor(monthlyEarnings: number): Band {
  const m = round2(Math.max(0, monthlyEarnings));
  for (const b of BANDS_2026) {
    if (b.upTo === null) return b;
    if (b.upToInclusive ? m <= b.upTo : m < b.upTo) return b;
  }
  return BANDS_2026.at(-1)!;
}

/** Monthly contribution on a base at the full rate. */
export function contribution(base: number): number {
  return round2((base * TOTAL_RATE) / 100);
}

export function contributionLines(base: number): ContributionLine[] {
  return RATE_KEYS.map((key) => ({ key, rate: RATES[key], monthly: round2((base * RATES[key]) / 100) }));
}

/** LGSS 308.1.c 2.ª: the earnings the bands are read on. */
export function computableEarnings(annualNet: number, corporate: boolean): { pct: number; deduction: number; computable: number } {
  const pct = corporate ? GENERIC_EXPENSES.corporate : GENERIC_EXPENSES.general;
  const net = Math.max(0, annualNet);
  const deduction = round2((net * pct) / 100);
  return { pct, deduction, computable: round2(net - deduction) };
}

export function calculateSelfEmployed(raw: SelfEmployedInput): SelfEmployedResult {
  const input: SelfEmployedInput = { ...raw, income: clean(raw.income), expenses: clean(raw.expenses) };
  const k = input.period === "monthly" ? 12 : 1;
  const income = round2(input.income * k);
  const expenses = round2(input.expenses * k);
  const net = round2(Math.max(0, income - expenses));
  const { pct, deduction, computable } = computableEarnings(net, input.corporate);
  const monthlyEarnings = round2(computable / 12);
  const band = bandFor(monthlyEarnings);

  const floor = input.corporate ? CORPORATE_MIN_BASE : MIN_BASE;
  const range = { min: Math.max(band.minBase, input.corporate ? CORPORATE_MIN_BASE : 0), max: Math.max(band.maxBase, input.corporate ? CORPORATE_MIN_BASE : 0) };

  let base: number;
  let baseSource: SelfEmployedResult["baseSource"];
  const asked = input.base !== null && Number.isFinite(input.base) && input.base > 0 ? round2(input.base) : null;
  if (asked === null) {
    base = range.min;
    baseSource = "minimum";
  } else if (asked < floor || asked > MAX_BASE) {
    base = Math.min(MAX_BASE, Math.max(floor, asked));
    baseSource = "clamped";
  } else {
    base = asked;
    baseSource = "chosen";
  }
  const inRange = base >= range.min && base <= range.max;

  const monthly = contribution(base);
  const full = { monthly, annual: round2(monthly * 12), lines: contributionLines(base) };
  const bandMonthly = { min: contribution(range.min), max: contribution(range.max) };

  const eligibleSecond = computable < SMI_ANNUAL;
  const flatApplies = input.flatRate === "first" || (input.flatRate === "second" && eligibleSecond);
  const pay = flatApplies
    ? { monthly: FLAT_RATE.totalWithMei, annual: round2(FLAT_RATE.totalWithMei * 12), flatRate: true }
    : { monthly: full.monthly, annual: full.annual, flatRate: false };

  let regularisation: SelfEmployedResult["regularisation"];
  if (flatApplies) {
    // Art. 38 ter.6: no regularisation in the first period, nor in the second while earnings stay under the SMI.
    regularisation = { kind: "flat-rate", definitiveBase: base, annual: 0 };
  } else {
    const definitiveBase = base < range.min ? range.min : base > range.max ? range.max : base;
    if (input.flatRate === "second") {
      // Earnings at or above the SMI: the TGSS claims back what the reduced fee left unpaid (art. 38 ter.6; TGSS guide, "Prórroga Tarifa Plana").
      regularisation = { kind: "flat-rate-lost", definitiveBase, annual: round2((contribution(definitiveBase) - FLAT_RATE.totalWithMei) * 12) };
    } else {
      const diff = round2((contribution(definitiveBase) - monthly) * 12);
      regularisation = { kind: diff > 0 ? "pay" : diff < 0 ? "refund" : "none", definitiveBase, annual: diff };
    }
  }

  return {
    input,
    annual: { income, expenses, net, genericPct: pct, genericDeduction: deduction, computable },
    monthlyEarnings,
    band,
    range,
    base,
    baseSource,
    inRange,
    full,
    bandMonthly,
    pay,
    flat: { asked: input.flatRate, eligible: input.flatRate === "second" ? eligibleSecond : input.flatRate === "first" },
    regularisation,
  };
}

/** Every band with its minimum and maximum contribution, for the page's table. */
export function bandTable(): { band: Band; minMonthly: number; maxMonthly: number }[] {
  return BANDS_2026.map((band) => ({ band, minMonthly: contribution(band.minBase), maxMonthly: contribution(band.maxBase) }));
}

/** The band's lower edge, for the table ("> 670", "≥ 1.166,70", "—" for the first). */
export function bandFrom(band: Band): { value: number; inclusive: boolean } | null {
  const i = BANDS_2026.indexOf(band);
  if (i <= 0) return null;
  const prev = BANDS_2026[i - 1]!;
  return { value: prev.upTo!, inclusive: !prev.upToInclusive };
}
