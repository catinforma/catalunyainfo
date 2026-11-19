import {
  BURDENS_CEILING_SS,
  BURDENS_PERCENT,
  COMPLEMENT_CAP,
  GENERAL_PERCENT,
  INCOME_LIMIT,
  MAX_PENSION,
  PAYMENTS_ORDINARY,
  PAYMENTS_WORK_ACCIDENT,
  SENIOR_AGE,
  SENIOR_PERCENT,
  WIDOW_MINIMUMS,
  burdensCeiling,
  minimumRow,
  round2,
  type Percent,
  type WidowMinimumId,
} from "./rules";

/**
 * "Pensión de viudedad": who is entitled (LGSS arts. 217, 219 to 222), the
 * percentage of the base reguladora (Decreto 3158/1966 art. 31, RD 900/2018),
 * the amount when the base is known (capped by art. 57 and, for separated or
 * divorced people, by the compensatory pension, art. 220.1) and the 2026
 * minimum it is compared with (RD 241/2026 anexo I and art. 9; LGSS art. 59).
 * Pure: every figure comes from rules.ts. Client-safe.
 *
 * Money is in euros, the pension a month (the base reguladora is monthly)
 * and every income a year, as the rules count them.
 */

export type Relationship = "married" | "partner" | "separated";
export const RELATIONSHIPS: readonly Relationship[] = ["married", "partner", "separated"];

/**
 * The deceased on the day of death: a contributory retirement or permanent
 * incapacity pensioner (art. 217.1.c); in alta or an equivalent situation
 * with, or without, 500 days in the last five years (art. 219.1); not in
 * alta, with or without 15 years contributed (art. 219.1, second paragraph).
 */
export type DeceasedStatus = "pensioner" | "alta-500" | "alta-short" | "no-alta-15" | "no-alta-short";
export const DECEASED_STATUSES: readonly DeceasedStatus[] = ["pensioner", "alta-500", "alta-short", "no-alta-15", "no-alta-short"];

/** Common illness (or any other common cause), a non-work accident, or a work accident or occupational illness. */
export type Cause = "common" | "accident" | "work";
export const CAUSES: readonly Cause[] = ["common", "accident", "work"];

export type Cohabitation = "5-plus" | "2-to-5" | "under-2";
export const COHABITATIONS: readonly Cohabitation[] = ["5-plus", "2-to-5", "under-2"];
export type Registration = "2-plus" | "under-2" | "none";
export const REGISTRATIONS: readonly Registration[] = ["2-plus", "under-2", "none"];

export interface WidowInput {
  relationship: Relationship;
  status: DeceasedStatus;
  cause: Cause;
  /** Married, common illness: the illness that caused the death existed before the wedding (art. 219.2). */
  illnessBefore: boolean;
  /** …and one of: a year of marriage, common children, or cohabitation before + marriage over two years. */
  marriageCondition: boolean;
  /** Pareja de hecho (art. 221.2). */
  commonChildren: boolean;
  cohabitation: Cohabitation;
  registration: Registration;
  /** Separated or divorced (art. 220): remarried or a new pareja de hecho since. */
  remarried: boolean;
  /** Receiving a compensatory pension that ends with the death. */
  compensatory: boolean;
  /** A woman who was a victim of gender violence at the separation or divorce. */
  genderViolence: boolean;
  /** The compensatory pension, euros a year (null: unknown). */
  compensatoryAnnual: number | null;
  /** The survivor. */
  age: number;
  disability65: boolean;
  /** Family burdens in the sense of art. 31.2 (children under 26 or with a disability, or fostered; per-member income under 75 % of the SMI). */
  familyBurdens: boolean;
  /** Income a year besides this widow's pension (work, capital, activities, gains and any other pension). */
  otherIncome: number;
  /** Any of it from work (employed or self-employed). */
  workIncome: boolean;
  /** Entitled to another public pension, Spanish or foreign. */
  otherPension: boolean;
  /** Base reguladora, euros a month (null: unknown). */
  baseReguladora: number | null;
}

export type InvalidReason = "age" | "income" | "base" | "compensatory";
export const MIN_AGE = 14;
export const MAX_AGE = 110;
/** A check on typos: no monthly base reguladora this high. */
export const MAX_BASE = 20_000;

/* -------------------------------------------------------------------------- */
/* Access                                                                     */
/* -------------------------------------------------------------------------- */

export type NoneReason = "contributions" | "partner-cohabitation" | "partner-registration" | "remarried" | "compensatory";
export type TemporalReason = "marriage" | "registration";

export type Access =
  | { kind: "pension"; articles: readonly string[] }
  | { kind: "temporal"; reason: TemporalReason; articles: readonly string[] }
  | { kind: "none"; reason: NoneReason; articles: readonly string[] };

/** The deceased can cause the pension (arts. 217.1 and 219.1). */
export function deceasedQualifies(status: DeceasedStatus, cause: Cause): boolean {
  if (status === "pensioner" || status === "alta-500" || status === "no-alta-15") return true;
  // In alta: no period when the death comes from an accident (work or not) or an occupational illness.
  if (status === "alta-short") return cause !== "common";
  return false;
}

export function access(i: WidowInput): Access {
  if (!deceasedQualifies(i.status, i.cause)) return { kind: "none", reason: "contributions", articles: ["217.1", "219.1"] };
  if (i.relationship === "married") {
    if (i.cause === "common" && i.illnessBefore && !i.marriageCondition) return { kind: "temporal", reason: "marriage", articles: ["219.2", "222"] };
    return { kind: "pension", articles: ["219"] };
  }
  if (i.relationship === "partner") {
    if (i.commonChildren) {
      // RDL 31/2026: two years' cohabitation (padrón), no registration.
      return i.cohabitation === "under-2" ? { kind: "none", reason: "partner-cohabitation", articles: ["221.2"] } : { kind: "pension", articles: ["221.2"] };
    }
    if (i.cohabitation !== "5-plus") return { kind: "none", reason: "partner-cohabitation", articles: ["221.2"] };
    if (i.registration === "2-plus") return { kind: "pension", articles: ["221.2"] };
    if (i.registration === "under-2") return { kind: "temporal", reason: "registration", articles: ["221.2", "222"] };
    return { kind: "none", reason: "partner-registration", articles: ["221.2", "222"] };
  }
  if (i.remarried) return { kind: "none", reason: "remarried", articles: ["220.1"] };
  if (!i.compensatory && !i.genderViolence) return { kind: "none", reason: "compensatory", articles: ["220.1", "DT 13ª"] };
  return { kind: "pension", articles: ["220.1"] };
}

/* -------------------------------------------------------------------------- */
/* Percentage                                                                 */
/* -------------------------------------------------------------------------- */

export interface SeniorCheck {
  age: boolean;
  noPension: boolean;
  noWork: boolean;
  /** Capital, activities and gains within the income limit (RD 900/2018 art. 2.d). */
  income: boolean;
  met: boolean;
}

export interface BurdensCheck {
  burdens: boolean;
  /** Art. 31.2's ceiling as the BOE words it (the age's minimum) and as the Seguridad Social does (with family burdens). */
  ceiling: number;
  ceilingSS: number;
  /** "met": within the BOE ceiling; "check": between the two; "over": above both. */
  income: "met" | "check" | "over";
  /** The pension (with any complement) is at least half of all income; null without a base reguladora. */
  mainSource: boolean | null;
  /** The 70 % applies for sure. */
  met: boolean;
  /** It might: every condition met or unknown, and none failed. */
  possible: boolean;
}

export function seniorCheck(i: WidowInput): SeniorCheck {
  const c = { age: i.age >= SENIOR_AGE, noPension: !i.otherPension, noWork: !i.workIncome, income: i.otherIncome <= INCOME_LIMIT };
  return { ...c, met: c.age && c.noPension && c.noWork && c.income };
}

function burdensIncome(i: WidowInput): BurdensCheck["income"] {
  if (i.otherIncome <= burdensCeiling(i.age)) return "met";
  return i.otherIncome <= BURDENS_CEILING_SS ? "check" : "over";
}

/* -------------------------------------------------------------------------- */
/* Amount                                                                     */
/* -------------------------------------------------------------------------- */

export interface Amount {
  /** The percentage applied (the 70 % may be reduced by art. 31.3). */
  percent: Percent;
  /** Payments a year: 14, or 12 for work accidents and occupational illness. */
  payments: number;
  /** BR × percentage, a month and a year, before any cap. */
  monthlyGross: number;
  /** After art. 31.3 (70 %), art. 57 (maximum) and art. 220.1 (compensatory pension). */
  monthly: number;
  annual: number;
  reducedBy313: boolean;
  cappedByMaximum: boolean;
  cappedByCompensatory: boolean;
}

export type ComplementOutcome =
  | { status: "none-needed" }
  | { status: "full"; annual: number; monthly: number }
  | { status: "partial"; annual: number; monthly: number }
  | { status: "over-limit" }
  | { status: "other-pension" }
  | { status: "compensatory" }
  /** The prestación temporal: the minimums table is for pensions, and no text says it is complemented. */
  | { status: "temporal" };

export interface Minimum {
  row: WidowMinimumId;
  annual: number;
  /** A month in the pension's payments. */
  monthly: number;
}

export interface WidowResult {
  status: "ok";
  input: WidowInput;
  access: Access;
  senior: SeniorCheck;
  burdens: BurdensCheck;
  /** The percentage that applies for sure: 70, 60 or 52 (60 and 70 never together). */
  percent: Percent;
  minimum: Minimum;
  /** With a base reguladora: the amount, the complement and the total; null otherwise. */
  amount: Amount | null;
  complement: ComplementOutcome | null;
  /** Pension + complement, a month and a year. */
  total: { monthly: number; annual: number } | null;
  /** What pension + complement reach at least, given the other income (with or without a base reguladora). */
  floor: Floor;
}

/**
 * The floor the minimum guarantees (RD 241/2026 art. 9.2): the whole minimum
 * when the other income is within the limit; the limit + minimum − income
 * when it is above, while positive. The complement itself never exceeds the
 * non-contributory pension (LGSS art. 59.4), so a very low pension may stay
 * under the floor: the page says so.
 */
export type Floor =
  | { status: "full" | "partial"; annual: number; monthly: number }
  | { status: "over-limit" | "other-pension" | "temporal" };

export type WidowCheck = WidowResult | { status: "invalid"; reason: InvalidReason };

export function validate(i: WidowInput): InvalidReason | null {
  if (!Number.isInteger(i.age) || i.age < MIN_AGE || i.age > MAX_AGE) return "age";
  if (!Number.isFinite(i.otherIncome) || i.otherIncome < 0) return "income";
  if (i.baseReguladora !== null && !(Number.isFinite(i.baseReguladora) && i.baseReguladora > 0 && i.baseReguladora <= MAX_BASE)) return "base";
  if (i.compensatoryAnnual !== null && !(Number.isFinite(i.compensatoryAnnual) && i.compensatoryAnnual >= 0)) return "compensatory";
  return null;
}

const paymentsFor = (cause: Cause) => (cause === "work" ? PAYMENTS_WORK_ACCIDENT : PAYMENTS_ORDINARY);

/** The annual amount for a percentage, before the caps. */
const annualAt = (base: number, percent: number, payments: number) => round2(round2((base * percent) / 100) * payments);

/**
 * The complement to the minimum (LGSS art. 59, RD 241/2026 art. 9): the
 * difference up to the minimum when the other income is within the limit;
 * when it is above, the difference between (limit + minimum) and (income +
 * pension), if positive; never above the non-contributory pension. Not with
 * another public pension (concurrence rules) nor for a pension cut to the
 * compensatory one (see rules.ts).
 */
export function complementFor(pensionAnnual: number, minimumAnnual: number, i: WidowInput, cappedByCompensatory: boolean, payments: number): ComplementOutcome {
  if (i.otherPension) return { status: "other-pension" };
  if (pensionAnnual >= minimumAnnual) return { status: "none-needed" };
  if (cappedByCompensatory) return { status: "compensatory" };
  const room = round2(INCOME_LIMIT + minimumAnnual - i.otherIncome - pensionAnnual);
  if (room <= 0) return { status: "over-limit" };
  const annual = round2(Math.min(minimumAnnual - pensionAnnual, room, COMPLEMENT_CAP));
  return { status: i.otherIncome <= INCOME_LIMIT ? "full" : "partial", annual, monthly: round2(annual / payments) };
}

export function floorFor(i: WidowInput, minimum: Minimum, payments: number, temporal: boolean): Floor {
  if (temporal) return { status: "temporal" };
  if (i.otherPension) return { status: "other-pension" };
  const annual = round2(Math.min(minimum.annual, INCOME_LIMIT + minimum.annual - i.otherIncome));
  if (annual <= 0) return { status: "over-limit" };
  return { status: i.otherIncome <= INCOME_LIMIT ? "full" : "partial", annual, monthly: round2(annual / payments) };
}

function amountFor(i: WidowInput, base: number, senior: SeniorCheck, burdensMet: boolean, payments: number): Amount {
  // Candidates: 52 % always; 60 % with RD 900/2018; 70 % (reduced by art. 31.3 if needed). The more favourable wins (RD 900/2018 art. 7).
  const candidates: { percent: Percent; annual: number; reduced: boolean; gross: number }[] = [{ percent: GENERAL_PERCENT as Percent, annual: annualAt(base, GENERAL_PERCENT, payments), reduced: false, gross: annualAt(base, GENERAL_PERCENT, payments) }];
  if (senior.met) candidates.push({ percent: SENIOR_PERCENT as Percent, annual: annualAt(base, SENIOR_PERCENT, payments), reduced: false, gross: annualAt(base, SENIOR_PERCENT, payments) });
  if (burdensMet) {
    const gross = annualAt(base, BURDENS_PERCENT, payments);
    const room = Math.max(0, round2(burdensCeiling(i.age) - i.otherIncome));
    candidates.push({ percent: BURDENS_PERCENT as Percent, annual: Math.min(gross, room), reduced: room < gross, gross });
  }
  const best = candidates.reduce((a, b) => (b.annual > a.annual ? b : a));
  let annual = best.annual;
  // Art. 57: the maximum is a yearly amount too (3.359,60 € × 14), whatever the number of payments.
  const maxAnnual = MAX_PENSION.annual;
  const cappedByMaximum = annual > maxAnnual;
  if (cappedByMaximum) annual = maxAnnual;
  const cappedByCompensatory = i.relationship === "separated" && i.compensatory && i.compensatoryAnnual !== null && annual > i.compensatoryAnnual;
  if (cappedByCompensatory) annual = i.compensatoryAnnual!;
  return {
    percent: best.percent,
    payments,
    monthlyGross: round2(best.gross / payments),
    monthly: round2(annual / payments),
    annual: round2(annual),
    reducedBy313: best.reduced,
    cappedByMaximum,
    cappedByCompensatory,
  };
}

export function calculate(i: WidowInput): WidowCheck {
  const reason = validate(i);
  if (reason) return { status: "invalid", reason };
  const payments = paymentsFor(i.cause);
  const row = minimumRow(i.age, i.familyBurdens, i.disability65);
  const minimum: Minimum = { row, annual: WIDOW_MINIMUMS[row], monthly: round2(WIDOW_MINIMUMS[row] / payments) };
  const senior = seniorCheck(i);
  const income = burdensIncome(i);

  let amount: Amount | null = null;
  let complement: ComplementOutcome | null = null;
  let mainSource: boolean | null = i.otherIncome === 0 ? true : null;
  const base = i.baseReguladora;
  if (base !== null) {
    // Main source (art. 31.2): the pension at 70 %, with any complement, at least half of all income. Checked before
    // the art. 31.3 cut, which only applies once the 70 % is granted.
    const gross70 = annualAt(base, BURDENS_PERCENT, payments);
    const c70 = complementFor(gross70, minimum.annual, i, false, payments);
    const withComplement = gross70 + ("annual" in c70 ? c70.annual : 0);
    mainSource = withComplement * 100 >= (withComplement + i.otherIncome) * 50;
  }
  const burdensMet = i.familyBurdens && income === "met" && mainSource === true;
  const possible = i.familyBurdens && income !== "over" && mainSource !== false && !burdensMet;
  const burdens: BurdensCheck = { burdens: i.familyBurdens, ceiling: burdensCeiling(i.age), ceilingSS: BURDENS_CEILING_SS, income, mainSource, met: burdensMet, possible };
  const percent: Percent = burdensMet ? (BURDENS_PERCENT as Percent) : senior.met ? (SENIOR_PERCENT as Percent) : (GENERAL_PERCENT as Percent);

  const acc = access(i);
  const temporal = acc.kind === "temporal";
  if (base !== null) {
    amount = amountFor(i, base, senior, burdensMet, payments);
    complement = temporal ? { status: "temporal" } : complementFor(amount.annual, minimum.annual, i, amount.cappedByCompensatory, payments);
  }
  const total = amount
    ? (() => {
        const annual = round2(amount.annual + (complement && "annual" in complement ? complement.annual : 0));
        return { annual, monthly: round2(annual / payments) };
      })()
    : null;
  return { status: "ok", input: i, access: acc, senior, burdens, percent: amount ? amount.percent : percent, minimum, amount, complement, total, floor: floorFor(i, minimum, payments, temporal) };
}

export function calculateOk(i: WidowInput): WidowResult {
  const r = calculate(i);
  if (r.status !== "ok") throw new Error(`invalid input: ${r.reason}`);
  return r;
}

/** A case, with the defaults of the page's calculator. */
export function widowCase(p: Partial<WidowInput> = {}): WidowInput {
  return {
    relationship: "married",
    status: "pensioner",
    cause: "common",
    illnessBefore: false,
    marriageCondition: true,
    commonChildren: false,
    cohabitation: "5-plus",
    registration: "2-plus",
    remarried: false,
    compensatory: true,
    genderViolence: false,
    compensatoryAnnual: null,
    age: 66,
    disability65: false,
    familyBurdens: false,
    otherIncome: 0,
    workIncome: false,
    otherPension: false,
    baseReguladora: 1600,
    ...p,
  };
}
