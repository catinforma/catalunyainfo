import { addDays, isIsoDate } from "@/lib/programmatic/employment/dates";

import { DAYS, MAX_BASE_2026, MAX_BASE_YEAR, MONTH_DIVISOR, OVERTIME_DIVISOR, PCT, REFORM_FROM } from "./rules";

/**
 * The sick-leave pay engine (incapacidad temporal, Régimen General): pure,
 * client-safe, every figure from rules.ts.
 *
 * Day 1 is the day of the baja. Each calendar day gets a kind (unpaid, the
 * employer's full salary, or the benefit at a percentage of the daily base
 * reguladora), a payer and, when the user enters a convenio top-up, the
 * employer's complement; consecutive days with the same attributes form a
 * band. Amounts are rounded to cents per band.
 */

export type Contingency = "common" | "professional" | "special";
/** LGSS art. 169.1.a): "pregnancy" is termination of pregnancy or pregnancy from week 39. */
export type SpecialKind = "menstruation" | "pregnancy" | "menopause" | "violence" | "donation";
export const SPECIAL_KINDS: readonly SpecialKind[] = ["menstruation", "pregnancy", "menopause", "violence", "donation"];
export const CONTINGENCIES: readonly Contingency[] = ["common", "professional", "special"];

/** Which text of the LGSS applies: the baja's first day decides. */
export type Regime = "until-nov-2026" | "from-dec-2026";

export type DayKind = "unpaid" | "salary" | "benefit";
/** Who bears the benefit: the employer (common contingencies, days 4–15) or the INSS / mutua ("entity"). */
export type Payer = "none" | "employer" | "entity";

export interface SickLeaveInput {
  contingency: Contingency;
  special: SpecialKind;
  /** Monthly contribution base of the reference month, euros (common contingencies; professional: without overtime). */
  base: number;
  /** Days that base covers: 30 for a monthly salary and a whole month. */
  baseDays: number;
  /** Professional contingencies: overtime contributed in the year before, euros (÷ 365). */
  overtime: number;
  /** First day of the baja (ISO). */
  start: string;
  /** Calendar days of baja, the first and the last included. */
  days: number;
  /** Convenio top-up: the employer pays up to this % of the daily base (0 = none). */
  complementPct: number;
  /** The top-up starts on this day of the baja. */
  complementFrom: number;
}

export interface Band {
  from: number;
  to: number;
  days: number;
  startDate: string;
  endDate: string;
  kind: DayKind;
  /** Benefit percentage of the base reguladora (0 when unpaid or salary). */
  pct: number;
  payer: Payer;
  /** Benefit for the band, euros (0 when unpaid or salary). */
  amount: number;
  /** Extra percentage the convenio top-up adds, paid by the employer. */
  complementPct: number;
  complement: number;
  /** Days 366 to 545: the extension (prórroga) only the INSS can grant. */
  extension: boolean;
}

export interface SickLeaveResult {
  regime: Regime;
  /** The month whose contribution base counts. */
  referenceMonth: { year: number; month: number };
  baseUsed: number;
  /** The base typed was above the maximum and was lowered to it. */
  clamped: boolean;
  /** False when the reference month is in a year whose maximum base is not loaded. */
  maxBaseKnown: boolean;
  /** Base reguladora per day, euros (unrounded). */
  dailyBase: number;
  /** Days counted (at most 545). */
  days: number;
  /** More days were typed than the 545 the law allows. */
  capped: boolean;
  endDate: string;
  bands: Band[];
  totals: {
    /** Public benefit for all days. */
    benefit: number;
    /** Part of the benefit the employer bears (common contingencies, days 4–15). */
    employer: number;
    /** Part the INSS or the mutua bears. */
    entity: number;
    /** Convenio top-up (employer). */
    complement: number;
    /** Benefit + complement. */
    total: number;
    /** Days on full salary paid by the employer (day of the baja), not counted above. */
    salaryDays: number;
  };
  /** Menopause or gender-violence baja started before 1 Dec 2026: not yet a special situation, calculated as common illness. */
  specialNotYet: boolean;
}

export const DEFAULT_INPUT: SickLeaveInput = {
  contingency: "common",
  special: "menstruation",
  base: 1800,
  baseDays: MONTH_DIVISOR,
  overtime: 0,
  start: REFORM_FROM,
  days: 30,
  complementPct: 0,
  complementFrom: 1,
};

const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;

export function regimeFor(start: string): Regime {
  return start >= REFORM_FROM ? "from-dec-2026" : "until-nov-2026";
}

/** Until 30 Nov 2026 the month before the baja's (Decreto 1646/1972 art. 13); from 1 Dec 2026 the month before that (LGSS art. 171.2). */
export function referenceMonth(start: string): { year: number; month: number } {
  const [y, m] = start.split("-").map(Number) as [number, number];
  const back = regimeFor(start) === "from-dec-2026" ? 2 : 1;
  const total = y * 12 + (m - 1) - back;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

/** A rough contribution base from the gross annual salary: a twelfth (extra payments prorated), at most the maximum base. */
export function baseFromAnnualGross(annual: number): number {
  if (!(annual > 0)) return 0;
  return round2(Math.min(annual / 12, MAX_BASE_2026));
}

interface DayRule {
  kind: DayKind;
  pct: number;
  payer: Payer;
}

const UNPAID: DayRule = { kind: "unpaid", pct: 0, payer: "none" };
const SALARY: DayRule = { kind: "salary", pct: 0, payer: "employer" };
const benefit = (pct: number, payer: Payer): DayRule => ({ kind: "benefit", pct, payer });

/** Common illness or non-work accident: LGSS art. 173.1, RD 53/1980, Decreto 3158/1966 art. 2.1. */
function commonDay(d: number): DayRule {
  if (d < DAYS.commonFirstPaid) return UNPAID;
  const pct = d <= DAYS.earlyLast ? PCT.early : PCT.standard;
  return benefit(pct, d <= DAYS.employerLast ? "employer" : "entity");
}

/** The rule of one day of the baja. */
export function dayRule(input: Pick<SickLeaveInput, "contingency" | "special" | "start">, d: number): DayRule {
  const regime = regimeFor(input.start);
  if (input.contingency === "common") return commonDay(d);
  if (input.contingency === "professional") return d === 1 ? SALARY : benefit(PCT.standard, "entity");
  const kind = input.special;
  const scaled = (day: number) => benefit(day <= DAYS.earlyLast ? PCT.early : PCT.standard, "entity");
  if (regime === "until-nov-2026") {
    // LGSS art. 173.1 as in force until 30 Nov 2026 (Ley 6/2024); percentages per the Seguridad Social.
    if (kind === "menopause" || kind === "violence") return commonDay(d);
    if (kind === "donation") return benefit(PCT.donation, "entity");
    if (kind === "menstruation") return scaled(d);
    return d === 1 ? SALARY : scaled(d);
  }
  // From 1 Dec 2026 (RDL 31/2026): every special situation from the day after the baja, the employer paying that day's salary.
  if (d === 1) return SALARY;
  return kind === "donation" ? benefit(PCT.donation, "entity") : scaled(d);
}

export function calculateSickLeave(input: SickLeaveInput): SickLeaveResult {
  const start = isIsoDate(input.start) ? input.start : DEFAULT_INPUT.start;
  const regime = regimeFor(start);
  const ref = referenceMonth(start);
  const maxBaseKnown = ref.year <= MAX_BASE_YEAR;
  const typed = Math.max(0, Number.isFinite(input.base) ? input.base : 0);
  const baseUsed = maxBaseKnown ? Math.min(typed, MAX_BASE_2026) : typed;
  const clamped = maxBaseKnown && typed > MAX_BASE_2026;
  const baseDays = input.baseDays >= 1 && input.baseDays <= 31 ? Math.round(input.baseDays) : MONTH_DIVISOR;
  const overtime = input.contingency === "professional" && input.overtime > 0 ? input.overtime : 0;
  const dailyBase = baseUsed / baseDays + overtime / OVERTIME_DIVISOR;

  const typedDays = Number.isFinite(input.days) ? Math.max(1, Math.round(input.days)) : 1;
  const days = Math.min(typedDays, DAYS.absoluteMax);
  const cPct = Math.min(100, Math.max(0, Number.isFinite(input.complementPct) ? input.complementPct : 0));
  const cFrom = Math.max(1, Math.round(Number.isFinite(input.complementFrom) ? input.complementFrom : 1));
  const rulesInput = { ...input, start };

  const bands: Band[] = [];
  for (let d = 1; d <= days; d++) {
    const r = dayRule(rulesInput, d);
    const complementPct = r.kind !== "salary" && cPct > 0 && d >= cFrom ? Math.max(0, cPct - r.pct) : 0;
    const extension = d > DAYS.ordinaryMax;
    const last = bands[bands.length - 1];
    if (last && last.kind === r.kind && last.pct === r.pct && last.payer === r.payer && last.complementPct === complementPct && last.extension === extension) {
      last.to = d;
      last.days += 1;
    } else {
      bands.push({ from: d, to: d, days: 1, startDate: "", endDate: "", kind: r.kind, pct: r.pct, payer: r.payer, amount: 0, complementPct, complement: 0, extension });
    }
  }
  for (const b of bands) {
    b.startDate = addDays(start, b.from - 1);
    b.endDate = addDays(start, b.to - 1);
    b.amount = b.kind === "benefit" ? round2(b.days * dailyBase * (b.pct / 100)) : 0;
    b.complement = round2(b.days * dailyBase * (b.complementPct / 100));
  }

  const sum = (f: (b: Band) => number) => round2(bands.reduce((s, b) => s + f(b), 0));
  const benefitTotal = sum((b) => b.amount);
  const complement = sum((b) => b.complement);
  return {
    regime,
    referenceMonth: ref,
    baseUsed,
    clamped,
    maxBaseKnown,
    dailyBase,
    days,
    capped: typedDays > DAYS.absoluteMax,
    endDate: addDays(start, days - 1),
    bands,
    totals: {
      benefit: benefitTotal,
      employer: sum((b) => (b.payer === "employer" && b.kind === "benefit" ? b.amount : 0)),
      entity: sum((b) => (b.payer === "entity" ? b.amount : 0)),
      complement,
      total: round2(benefitTotal + complement),
      salaryDays: bands.filter((b) => b.kind === "salary").reduce((s, b) => s + b.days, 0),
    },
    specialNotYet: input.contingency === "special" && regime === "until-nov-2026" && (input.special === "menopause" || input.special === "violence"),
  };
}
