import { regionById, type Regime } from "./regions";
import { IRPF, SOCIAL_SECURITY } from "./rules-2026";

/**
 * Net salary 2026 for an employee in Spain: the worker's Social Security
 * contributions (Orden PJC/297/2026) and the IRPF withholding the employer
 * must apply, step by step as the AEAT's 2026 retention algorithm writes it
 * (variable names in the comments are the algorithm's). Pure and
 * deterministic: the page renders it on the server, the calculator in the
 * browser, the tests against the AEAT's own service.
 *
 * Out of scope, and said so on the page: ascendants, disabled descendants,
 * irregular income (art. 18 LIRPF), maintenance and compensatory payments,
 * regularisation during the year, pensioners and the unemployed, special
 * employment relations, the foral systems of Navarra and the Basque Country.
 */

export type FamilySituation = 1 | 2 | 3;
export type AgeBand = "under65" | "65to74" | "75plus";
export type Disability = "none" | "33" | "33mobility" | "65";
/** "short" = fixed-term under one year (2 % minimum withholding); both fixed-term kinds pay the 1.60 % unemployment rate. */
export type Contract = "open-ended" | "fixed-term" | "short";

export interface SalaryInput {
  /** Gross annual pay, money and in kind (RETRIB). */
  gross: number;
  payments: 12 | 14;
  region: string;
  age: AgeBand;
  /** SITUFAM: 1 single parent living only with the children, 2 married with a spouse earning ≤ 1,500 €, 3 any other case. */
  family: FamilySituation;
  /** Descendants under 25 living with the worker. */
  children: number;
  /** Of them, born in 2024 or later (under 3 in 2026). */
  childrenUnder3: number;
  /** Counted in full ("por entero": only the worker is entitled) instead of half. */
  childrenWhole: boolean;
  disability: Disability;
  contract: Contract;
  /** Moved home for a new job in another municipality (movilidad geográfica, +2,000 € expenses). */
  mobility?: boolean;
  /** Paying a home loan from before 2013 that gives the deduction (2 % less withholding under 33,007.20 €). */
  housingLoan?: boolean;
}

export interface SocialSecurityLine {
  key: "commonContingencies" | "unemployment" | "vocationalTraining" | "intergenerationalEquity" | "solidarity";
  /** Worker's rate, % (null for solidarity, which is banded). */
  rate: number | null;
  monthly: number;
  annual: number;
}

export interface SalaryResult {
  input: SalaryInput;
  regime: Regime;
  /** False for Navarra and the Basque Country: nothing below is computed. */
  supported: boolean;
  ss: {
    /** Monthly contribution base: pay / 12 (extra payments prorated), capped. */
    baseMonthly: number;
    capped: boolean;
    /** Under the full-time minimum base (groups 4 to 11): only possible part-time. */
    belowMinimum: boolean;
    lines: SocialSecurityLine[];
    monthly: number;
    annual: number;
  };
  irpf: {
    /** RNT: pay − contributions. */
    netIncome: number;
    /** RED20. */
    workReduction: number;
    /** OTROSGASTOS. */
    otherExpenses: number;
    /** BASE (RNTREDU − REDU). */
    base: number;
    /** MINPERFA. */
    minimum: number;
    cuota1: number;
    cuota2: number;
    /** After the 43 % limit, before Ceuta/Melilla and the housing loan. */
    cuota: number;
    exempt: boolean;
    limited: boolean;
    reducedByCeuta: boolean;
    housingReduction: number;
    minimumRateApplied: boolean;
    /** TIPO, %, truncated to two decimals. */
    rate: number;
    /** IMPORTE: annual withholding. */
    annual: number;
  };
  net: {
    annual: number;
    /** Each ordinary payment (12 or 14 a year). */
    perPayment: number;
    /** Each of the two extra payments when paid in 14: no contributions are taken from them. */
    extraPayment: number | null;
    /** Annual net / 12. */
    monthlyAverage: number;
  };
  /** (contributions + withholding) / gross, %. */
  effectiveRate: number;
}

/** REDONDEAR1: two decimals, 0.005 up. */
export function round2(x: number): number {
  return Math.sign(x) * Math.round(Number((Math.abs(x) * 100).toFixed(6))) / 100;
}

/** TRUNCAR: two decimals, down (with a guard against binary noise: 16.42 must not read 16.41). */
export function trunc2(x: number): number {
  return Math.floor(Number((x * 100).toFixed(6))) / 100;
}

/** ESCALA (TABLA 2). */
export function scale(base: number): number {
  if (base <= 0) return 0;
  let row: readonly [number, number, number] = IRPF.scale[0];
  for (const r of IRPF.scale) if (base >= r[0]) row = r;
  return row[1] + (base - row[0]) * (row[2] / 100);
}

/** RED20, rounded. */
export function workReduction(rnt: number): number {
  const w = IRPF.workReduction;
  let red: number;
  if (rnt <= w.upTo) red = w.full;
  else if (rnt <= w.secondTo) red = w.full - w.secondSlope * (rnt - w.upTo);
  else if (rnt < w.thirdTo) red = w.thirdBase - w.thirdSlope * (rnt - w.secondTo);
  else red = 0;
  return round2(Math.max(0, red));
}

/** The TABLA 1 threshold for this family (null: situation 1 with no descendant, not a valid case). */
export function exemptThreshold(family: FamilySituation, descendants: number): number | null {
  const row = IRPF.exemptUpTo[family];
  return row[Math.min(descendants, 2)] ?? null;
}

/** Inputs as the engine can use them: whole numbers, in range, consistent. */
export function normalise(input: SalaryInput): SalaryInput {
  const gross = Number.isFinite(input.gross) ? Math.min(Math.max(round2(input.gross), 0), 10_000_000) : 0;
  const children = Math.min(Math.max(Math.trunc(input.children) || 0, 0), 16);
  const childrenUnder3 = Math.min(Math.max(Math.trunc(input.childrenUnder3) || 0, 0), children);
  // Situation 1 needs at least one descendant (algorithm validation 14): with none, it is situation 3.
  const family: FamilySituation = input.family === 1 && children === 0 ? 3 : input.family;
  return {
    ...input,
    gross,
    payments: input.payments === 12 ? 12 : 14,
    children,
    childrenUnder3,
    family,
    mobility: Boolean(input.mobility),
    housingLoan: Boolean(input.housingLoan),
  };
}

function socialSecurity(gross: number, contract: Contract): SalaryResult["ss"] {
  const S = SOCIAL_SECURITY;
  const monthlyPay = gross / 12;
  const baseMonthly = round2(Math.min(monthlyPay, S.maxBaseMonthly));
  const unemployment = contract === "open-ended" ? S.rates.unemploymentOpenEnded : S.rates.unemploymentFixedTerm;
  const line = (key: SocialSecurityLine["key"], rate: number): SocialSecurityLine => {
    const monthly = round2((baseMonthly * rate) / 100);
    return { key, rate, monthly, annual: round2(monthly * 12) };
  };
  const lines: SocialSecurityLine[] = [
    line("commonContingencies", S.rates.commonContingencies),
    line("unemployment", unemployment),
    line("vocationalTraining", S.rates.vocationalTraining),
    line("intergenerationalEquity", S.rates.intergenerationalEquity),
  ];
  // Solidarity: the worker's share on the monthly pay above the maximum base, band by band.
  let solidarity = 0;
  let from: number = S.maxBaseMonthly;
  for (const [to, rate] of S.solidarity) {
    if (monthlyPay <= from) break;
    solidarity += ((Math.min(monthlyPay, to) - from) * rate) / 100;
    from = to;
  }
  if (solidarity > 0) {
    const monthly = round2(solidarity);
    lines.push({ key: "solidarity", rate: null, monthly, annual: round2(monthly * 12) });
  }
  const monthly = round2(lines.reduce((s, l) => s + l.monthly, 0));
  return {
    baseMonthly,
    capped: monthlyPay > S.maxBaseMonthly,
    belowMinimum: gross > 0 && monthlyPay < S.minBaseMonthly,
    lines,
    monthly,
    annual: round2(lines.reduce((s, l) => s + l.annual, 0)),
  };
}

/** The AEAT algorithm, from RETRIB and COTIZACIONES to TIPO and IMPORTE. */
export function withholding(input: SalaryInput, contributions: number, regime: Regime): SalaryResult["irpf"] {
  const retrib = input.gross;
  const n = input.children;
  const share = input.childrenWhole ? 1 : 0.5;
  const age = input.age;

  // Gastos deducibles (page 21).
  let other = IRPF.otherExpenses + (input.mobility ? IRPF.mobilityExpenses : 0);
  if (input.disability === "65" || input.disability === "33mobility") other += IRPF.disabilityExpenses65;
  else if (input.disability === "33") other += IRPF.disabilityExpenses33;
  const afterContributions = retrib - contributions;
  if (afterContributions < 0) other = 0;
  else if (other > afterContributions) other = afterContributions;

  // Rendimiento neto, reducción art. 20, rendimiento neto reducido (pages 21-22).
  const rnt = Math.max(0, retrib - contributions);
  const red20 = workReduction(rnt);
  const rntredu = Math.max(0, rnt - other - red20);
  const redu = n > 2 ? IRPF.moreThanTwoChildren : 0;
  const base = rntredu > redu ? rntredu - redu : 0;

  // Mínimo personal y familiar (pages 23-27).
  const mincon = IRPF.personalMinimum + (age !== "under65" ? IRPF.over65 : 0) + (age === "75plus" ? IRPF.over75 : 0);
  let mindesg = 0;
  for (let i = 0; i < n; i++) mindesg += IRPF.childMinimum[Math.min(i, 3)]! * share;
  const mindes = round2(mindesg) + round2(input.childrenUnder3 * IRPF.childUnder3 * share);
  let mindisc = 0;
  if (input.disability === "65") mindisc = IRPF.disabilityMinimum65 + IRPF.assistance;
  else if (input.disability === "33mobility") mindisc = IRPF.disabilityMinimum33 + IRPF.assistance;
  else if (input.disability === "33") mindisc = IRPF.disabilityMinimum33;
  const minimum = mincon + mindes + mindisc;

  const empty = { netIncome: rnt, workReduction: red20, otherExpenses: other, base, minimum, cuota1: 0, cuota2: 0, cuota: 0, limited: false, reducedByCeuta: false, housingReduction: 0, minimumRateApplied: false };

  // Rendimientos exentos (TABLA 1).
  const threshold = exemptThreshold(input.family, n);
  if (threshold !== null && retrib <= threshold) return { ...empty, exempt: true, rate: 0, annual: 0 };

  // Cuota (pages 29-30).
  const cuota1 = scale(base);
  const cuota2 = scale(minimum);
  let cuota = cuota1 > cuota2 ? cuota1 - cuota2 : 0;
  let limited = false;
  if (retrib <= IRPF.limitPayUpTo && threshold !== null) {
    const limit = (retrib - threshold) * IRPF.limitRate;
    if (cuota > limit) {
      cuota = limit;
      limited = true;
    }
  }

  // Ceuta, Melilla, La Palma; housing loan (page 31).
  const reducedByCeuta = regime === "ceuta-melilla";
  const housingReduction = input.housingLoan && retrib < IRPF.housingPayUnder ? trunc2(IRPF.housingRate * retrib) : 0;
  const positive = Math.max(0, (reducedByCeuta ? cuota * IRPF.ceutaFactor : cuota) - housingReduction);

  // Tipo and importe (page 32). The 2 % floor of short contracts is 0.80 % in Ceuta and Melilla.
  let rate = retrib > 0 ? trunc2((positive / retrib) * 100) : 0;
  let minimumRateApplied = false;
  const floor = reducedByCeuta ? 0.8 : IRPF.minRateShortContract;
  if (input.contract === "short" && rate < floor) {
    rate = floor;
    minimumRateApplied = true;
  }
  const annual = round2((retrib * rate) / 100);
  return { ...empty, cuota1, cuota2, cuota, exempt: false, limited, reducedByCeuta, housingReduction, minimumRateApplied, rate, annual };
}

export function calculateNetSalary(raw: SalaryInput): SalaryResult {
  const input = normalise(raw);
  const regime: Regime = regionById(input.region)?.regime ?? "common";
  const ss = socialSecurity(input.gross, input.contract);
  const irpf = withholding(input, ss.annual, regime);
  const supported = regime !== "foral";
  const annual = round2(input.gross - ss.annual - irpf.annual);
  const p = input.payments;
  const grossPayment = input.gross / p;
  const irpfPayment = (grossPayment * irpf.rate) / 100;
  const perPayment = round2(grossPayment - irpfPayment - ss.annual / 12);
  const extraPayment = p === 14 ? round2(grossPayment - irpfPayment) : null;
  return {
    input,
    regime,
    supported,
    ss,
    irpf,
    net: { annual, perPayment, extraPayment, monthlyAverage: round2(annual / 12) },
    effectiveRate: input.gross > 0 ? round2(((ss.annual + irpf.annual) / input.gross) * 100) : 0,
  };
}

/** The page's default example: 30,000 € in Catalonia, single, no children, open-ended contract, 14 payments. */
export const DEFAULT_INPUT: SalaryInput = {
  gross: 30000,
  payments: 14,
  region: "cataluna",
  age: "under65",
  family: 3,
  children: 0,
  childrenUnder3: 0,
  childrenWhole: false,
  disability: "none",
  contract: "open-ended",
  mobility: false,
  housingLoan: false,
};
