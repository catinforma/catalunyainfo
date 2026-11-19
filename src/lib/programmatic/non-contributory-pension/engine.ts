import {
  DISABILITY_MIN,
  DISABILITY_THIRD_PERSON,
  FREE_INCOME,
  INVALIDITY_MIN_AGE,
  MINIMUM_ANNUAL,
  PNC_ANNUAL,
  RENT_SUPPLEMENT,
  RESIDENCE_YEARS,
  RETIREMENT_AGE,
  THIRD_PERSON_ANNUAL,
  WORK_LIMIT,
  householdLimit,
  individualAmount,
  monthly,
  round2,
} from "./rules";

/**
 * "Pensión no contributiva" (PNC): who is entitled to the retirement
 * (LGSS art. 369) or invalidity (art. 363) one, the household limit
 * (art. 363.2-4), the amount (art. 364: the individual amount, the own
 * income above 35 %, the household cut, the 25 % floor and the third-person
 * complement), and whether the 525 € rent supplement may apply (RD 241/2026
 * art. 21.2, RD 1191/2012 art. 2). Pure: every figure comes from rules.ts.
 * Client-safe. Money in euros a year, as the rules count it; months in 14
 * payments.
 */

export type PncType = "retirement" | "invalidity";
export const PNC_TYPES: readonly PncType[] = ["retirement", "invalidity"];

export interface PncInput {
  type: PncType;
  age: number;
  /** Recognised degree of disability or chronic illness, % (invalidity). */
  disability: number;
  /** Needs another person for the most essential acts of life (art. 364.6). */
  thirdPerson: boolean;
  /** Years of legal residence in Spain (for retirement, counted from age 16). */
  residenceYears: number;
  /** The two years right before applying, in a row, in Spain. */
  lastTwoYears: boolean;
  /** People in the household unit including you: you + spouse + blood relatives to the second degree you live with (art. 363.4). */
  members: number;
  /** Among them a parent or a child of yours (art. 363.3: × 2,5). */
  firstDegree: boolean;
  /** How many of them (including you) get or apply for a PNC (art. 364.1). */
  beneficiaries: number;
  /** Your own income a year (work, pensions, benefits, capital; not the home you live in). */
  ownIncome: number;
  /** The other members' income a year, together, without their non-contributory pensions. */
  householdIncome: number;
  /** Rent supplement (RD 1191/2012 art. 2). */
  renting: boolean;
  rentHolder: boolean;
  ownsHome: boolean;
  landlordKin: boolean;
  /** Lease of a year or more and 180 days living there. */
  rentHabitual: boolean;
}

export type InvalidReason = "age" | "disability" | "residence" | "members" | "beneficiaries" | "income";
export const MAX_AGE = 110;
export const MAX_MEMBERS = 12;

export type CheckId = "age" | "disability" | "residence" | "recent" | "own-income" | "household";
export interface Check {
  id: CheckId;
  ok: boolean;
  /** The LGSS article. */
  article: string;
}

export type RentReason = "not-holder" | "owns-home" | "kin" | "not-habitual";
export type RentOutcome =
  | { status: "no-pension" }
  | { status: "not-renting" }
  | { status: "may"; annual: number; shared: boolean }
  | { status: "no"; reasons: RentReason[] };

export interface Amount {
  /** The individual full amount: the PNC, or the art. 364.1 share with several beneficiaries. */
  full: number;
  /** Art. 364.2: own income above 35 % of the PNC, deducted. */
  ownCut: number;
  /** Art. 364.3: the household cut on this pension (the excess over the limit ÷ beneficiaries). */
  householdCut: number;
  /** Art. 364.4: the 25 % floor was applied. */
  floorApplied: boolean;
  /** The pension before the complement, a year. */
  pension: number;
  /** Art. 364.6: the third-person complement, a year (0 without it). */
  complement: number;
  annual: number;
  monthly: number;
  /** The household cut ran with the third-person limits (a reading of IMSERSO's guide). */
  thirdPersonHousehold: boolean;
}

export interface PncResult {
  status: "ok";
  input: PncInput;
  eligible: boolean;
  checks: Check[];
  /** The household limit that applies, a year (null when you live alone or only with people outside the unit). */
  limit: number | null;
  /** Everyone's income in the unit, a year (yours + the others'). */
  unitIncome: number;
  /** The third-person complement applies (invalidity, 75 % and a third person). */
  thirdPerson: boolean;
  amount: Amount | null;
  rent: RentOutcome;
  /** The other type fits better: 65 or over asks for retirement; under 65 with a 65 % disability, for invalidity. */
  suggest: PncType | null;
}

export type PncCheck = PncResult | { status: "invalid"; reason: InvalidReason };

export function validate(i: PncInput): InvalidReason | null {
  if (!Number.isInteger(i.age) || i.age < 0 || i.age > MAX_AGE) return "age";
  if (!Number.isFinite(i.disability) || i.disability < 0 || i.disability > 100) return "disability";
  if (!Number.isFinite(i.residenceYears) || i.residenceYears < 0 || i.residenceYears > i.age) return "residence";
  if (!Number.isInteger(i.members) || i.members < 1 || i.members > MAX_MEMBERS) return "members";
  if (!Number.isInteger(i.beneficiaries) || i.beneficiaries < 1 || i.beneficiaries > i.members) return "beneficiaries";
  if (!Number.isFinite(i.ownIncome) || i.ownIncome < 0 || !Number.isFinite(i.householdIncome) || i.householdIncome < 0) return "income";
  return null;
}

/** Arts. 364.6 and 363.1: invalidity, 75 % or more and a third person's help. */
export function thirdPersonApplies(i: PncInput): boolean {
  return i.type === "invalidity" && i.disability >= DISABILITY_THIRD_PERSON && i.thirdPerson;
}

export function checks(i: PncInput): Check[] {
  const retirement = i.type === "retirement";
  const third = thirdPersonApplies(i);
  const out: Check[] = [
    retirement ? { id: "age", ok: i.age >= RETIREMENT_AGE, article: "369.1" } : { id: "age", ok: i.age >= INVALIDITY_MIN_AGE && i.age < RETIREMENT_AGE, article: "363.1.a" },
  ];
  if (!retirement) out.push({ id: "disability", ok: i.disability >= DISABILITY_MIN, article: "363.1.c" });
  out.push({ id: "residence", ok: i.residenceYears >= RESIDENCE_YEARS[i.type], article: retirement ? "369.1" : "363.1.b" });
  out.push({ id: "recent", ok: i.lastTwoYears, article: retirement ? "369.1" : "363.1.b" });
  // Art. 363.1.d: own income below the annual PNC ("inferior").
  out.push({ id: "own-income", ok: i.ownIncome < PNC_ANNUAL, article: "363.1.d" });
  // Living with others in the unit: everyone's income below the limit (art. 363.1.d, second paragraph, and 363.2-3).
  if (i.members > 1) out.push({ id: "household", ok: round2(i.ownIncome + i.householdIncome) < householdLimit(i.members, i.firstDegree, third), article: i.firstDegree ? "363.3" : "363.2" });
  return out;
}

export function rentOutcome(i: PncInput, eligible: boolean): RentOutcome {
  if (!eligible) return { status: "no-pension" };
  if (!i.renting) return { status: "not-renting" };
  const reasons: RentReason[] = [];
  if (!i.rentHolder) reasons.push("not-holder");
  if (i.ownsHome) reasons.push("owns-home");
  if (i.landlordKin) reasons.push("kin");
  if (!i.rentHabitual) reasons.push("not-habitual");
  return reasons.length ? { status: "no", reasons } : { status: "may", annual: RENT_SUPPLEMENT, shared: i.beneficiaries > 1 };
}

export function amountFor(i: PncInput): Amount {
  const third = thirdPersonApplies(i);
  const n = i.beneficiaries;
  const full = individualAmount(n);
  // Art. 364.2: only the own income above 35 % of the PNC is deducted.
  const ownCut = round2(Math.max(0, i.ownIncome - FREE_INCOME));
  const afterOwn = round2(full - ownCut);
  // Art. 364.3: living with people who are not beneficiaries, the unit's income plus the pensions over the limit → each
  // pension cut by the same amount. The other beneficiaries are taken at the full share (their own income under 35 %):
  // see rules.ts, readings.
  let householdCut = 0;
  if (i.members > n) {
    const pensions = round2(Math.max(0, afterOwn) + full * (n - 1));
    const excess = round2(i.ownIncome + i.householdIncome + pensions - householdLimit(i.members, i.firstDegree, third));
    if (excess > 0) householdCut = round2(excess / n);
  }
  const reduced = round2(afterOwn - householdCut);
  // Art. 364.4: never under 25 % of the PNC.
  const floorApplied = reduced < MINIMUM_ANNUAL;
  const pension = floorApplied ? MINIMUM_ANNUAL : reduced;
  // Art. 364.6: + 50 %, added after the cuts (IMSERSO guide).
  const complement = third ? THIRD_PERSON_ANNUAL : 0;
  const annual = round2(pension + complement);
  return { full, ownCut, householdCut, floorApplied, pension, complement, annual, monthly: monthly(annual), thirdPersonHousehold: third && householdCut > 0 };
}

export function calculate(i: PncInput): PncCheck {
  const reason = validate(i);
  if (reason) return { status: "invalid", reason };
  const list = checks(i);
  const eligible = list.every((c) => c.ok);
  const third = thirdPersonApplies(i);
  const suggest: PncType | null =
    i.type === "invalidity" && i.age >= RETIREMENT_AGE ? "retirement" : i.type === "retirement" && i.age < RETIREMENT_AGE && i.age >= INVALIDITY_MIN_AGE && i.disability >= DISABILITY_MIN ? "invalidity" : null;
  return {
    status: "ok",
    input: i,
    eligible,
    checks: list,
    limit: i.members > 1 ? householdLimit(i.members, i.firstDegree, third) : null,
    unitIncome: round2(i.ownIncome + i.householdIncome),
    thirdPerson: third,
    amount: eligible ? amountFor(i) : null,
    rent: rentOutcome(i, eligible),
    suggest,
  };
}

export function calculateOk(i: PncInput): PncResult {
  const r = calculate(i);
  if (r.status !== "ok") throw new Error(`invalid input: ${r.reason}`);
  return r;
}

/**
 * Art. 366: an invalidity PNC holder who starts working keeps, for four
 * years, pension + earnings up to the IPREM (12 payments) + the PNC; above,
 * the pension is cut (not the complement); at zero it is suspended.
 */
export function workCompatibility(pensionAnnual: number, workIncome: number): { pension: number; cut: number; suspended: boolean } {
  const cut = round2(Math.max(0, pensionAnnual + workIncome - WORK_LIMIT));
  const pension = round2(pensionAnnual - cut);
  return pension <= 0 ? { pension: 0, cut: pensionAnnual, suspended: true } : { pension, cut, suspended: false };
}

/** A case, with the defaults of the page's calculator. */
export function pncCase(p: Partial<PncInput> = {}): PncInput {
  return {
    type: "retirement",
    age: 67,
    disability: 0,
    thirdPerson: false,
    residenceYears: 40,
    lastTwoYears: true,
    members: 1,
    firstDegree: false,
    beneficiaries: 1,
    ownIncome: 0,
    householdIncome: 0,
    renting: false,
    rentHolder: true,
    ownsHome: false,
    landlordKin: false,
    rentHabitual: true,
    ...p,
  };
}
