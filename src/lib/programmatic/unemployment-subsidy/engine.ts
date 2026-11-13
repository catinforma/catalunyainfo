import {
  AMOUNT_BANDS,
  CONTRIBUTORY_MIN_DAYS,
  EMIGRANT_MONTHS,
  EXHAUSTED_MONTHS,
  FAMILY_LONG_FROM_DAYS,
  INCOME_LIMIT,
  INSUFFICIENT_SCALE,
  MIN_DAYS_INSUFFICIENT,
  MIN_EXHAUSTED_DAYS,
  OVER52_AGE,
  OVER52_SHARE,
  VICTIM_MONTHS,
  YOUNG_AGE,
  YOUNG_MIN_EXHAUSTED_DAYS,
  monthlyAmount,
} from "./rules";

/**
 * Unemployment subsidy checker (subsidio por desempleo), LGSS arts. 274–280
 * and DA 57ª–58ª as reformed by RDL 2/2024. Pure: no dates, no I/O.
 *
 * It answers who qualifies, for how long and how much per month from what the
 * reader says (situation, age, days contributed or of benefit exhausted, the
 * family unit and last month's income). Anything the law ties to facts the
 * tool cannot check (a contribution record for retirement, earlier Renta
 * Activa de Inserción rights, a situation outside arts. 274, DA 57ª and DA 58ª)
 * comes back as "check-sepe", never as a guess.
 */

export const SITUATIONS = ["exhausted", "insufficient", "emigrant", "victim", "other"] as const;
export type Situation = (typeof SITUATIONS)[number];
export const ANSWERS = ["yes", "no", "unknown"] as const;
export type Answer = (typeof ANSWERS)[number];
/** The benefit lengths a contributory benefit can have (art. 269.1: 120 to 720 days, in steps of 60). */
export const EXHAUSTED_OPTIONS = [120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720] as const;

export interface SubsidyInput {
  situation: Situation;
  /** Age on the day the benefit ran out or the job ended. */
  age: number;
  /** Days of contributory benefit exhausted (situation "exhausted"). */
  exhaustedDays: number;
  /** Days contributed in the last six years (situation "insufficient"). */
  contributedDays: number;
  /** Other members of the family unit (spouse or partner, children under 26 or with a disability, foster children): 0 = alone. */
  familyMembers: number;
  /** The applicant's own gross income of every kind in the calendar month before applying, €. */
  ownIncome: number;
  /** The whole family unit's gross income that month, the applicant's included, €. */
  householdIncome: number;
  /** Over 52: 15 years contributed, 2 of them in the last 15 (art. 205.1.b). */
  retirementRecord: Answer;
  /** Over 52: at least 6 years contributed for unemployment in Spain over the working life. */
  unemploymentYears: Answer;
  /** Returned emigrant: 12 months worked in the last 6 years in a country outside the EEA without an unemployment agreement, no benefit there. */
  workedAbroad: Answer;
  /** Victims of violence: earlier Renta Activa de Inserción rights (3 = three or more). */
  priorRai: 0 | 1 | 2 | 3;
}

export type SubsidyKind = "exhausted" | "insufficient" | "over52" | "emigrant" | "victim";
export type Status = "eligible" | "not-eligible" | "check-sepe" | "contributory";
export const REASONS = [
  "income",
  "young-short",
  "few-days",
  "contributory",
  "abroad-no",
  "abroad-unknown",
  "emigrant-family",
  "rai-three",
  "other-situation",
  "over52-unknown",
  "over52-record-no",
  "over52-income",
] as const;
export type Reason = (typeof REASONS)[number];

export interface Phase {
  fromMonth: number;
  /** null: until the ordinary retirement age (over 52). */
  toMonth: number | null;
  share: number;
  monthly: number;
  /** € over the phase, null when it has no fixed end. */
  total: number | null;
}

export interface SubsidyResult {
  status: Status;
  kind: SubsidyKind | null;
  /** Maximum length in months; null when it runs to retirement age or there is no subsidy. */
  months: number | null;
  phases: Phase[];
  /** € over the whole subsidy, null when open-ended or not eligible. */
  total: number | null;
  /** First month's amount, 0 if not eligible. */
  firstMonthly: number;
  incomeLimit: number;
  /** Own income within 75 % of the SMI (art. 275.1). */
  ownIncomeOk: boolean;
  /** Family responsibilities: at least one other member and household income per head within the limit (art. 275.2). */
  familyOk: boolean;
  /** Household income divided by members (applicant included). */
  perHead: number;
  /** Reasons behind a refusal, a "check-sepe" or a side note (e.g. the over-52 subsidy could apply). */
  reasons: Reason[];
  /** SEPE pays the retirement contribution (art. 280.9). */
  retirementContribution: boolean;
}

export const DEFAULT_INPUT: SubsidyInput = {
  situation: "exhausted",
  age: 47,
  exhaustedDays: 360,
  contributedDays: 200,
  familyMembers: 2,
  ownIncome: 0,
  householdIncome: 1200,
  retirementRecord: "unknown",
  unemploymentYears: "unknown",
  workedAbroad: "unknown",
  priorRai: 0,
};

const cents = (x: number) => Math.round(x * 100) / 100;
const nonNeg = (x: number) => (Number.isFinite(x) && x > 0 ? x : 0);

/** The month-by-month amounts for a subsidy of `months` months (art. 278), or the flat 80 % for the over-52 subsidy. */
export function phasesFor(months: number | null, over52 = false): Phase[] {
  if (over52) {
    const monthly = monthlyAmount(OVER52_SHARE);
    return [{ fromMonth: 1, toMonth: null, share: OVER52_SHARE, monthly, total: null }];
  }
  if (months === null || months <= 0) return [];
  const out: Phase[] = [];
  for (const b of AMOUNT_BANDS) {
    if (b.fromMonth > months) break;
    const to = b.toMonth === null ? months : Math.min(b.toMonth, months);
    const monthly = monthlyAmount(b.share);
    out.push({ fromMonth: b.fromMonth, toMonth: to, share: b.share, monthly, total: cents(monthly * (to - b.fromMonth + 1)) });
  }
  return out;
}

/** Art. 277.1: months for a subsidy after exhausting the benefit, or 0 if the young-without-family rule bars it. */
export function exhaustedMonths(age: number, exhaustedDays: number, familyOk: boolean): number {
  if (exhaustedDays < MIN_EXHAUSTED_DAYS) return 0;
  if (familyOk) return exhaustedDays >= FAMILY_LONG_FROM_DAYS ? EXHAUSTED_MONTHS.family180 : EXHAUSTED_MONTHS.family120;
  if (age < YOUNG_AGE && exhaustedDays < YOUNG_MIN_EXHAUSTED_DAYS) return 0;
  return EXHAUSTED_MONTHS.noFamily;
}

/** Art. 277.2: months for insufficient contributions (90–359 days), 0 below 90. */
export function insufficientMonths(contributedDays: number, familyOk: boolean): number {
  let row: readonly [number, number, number] | null = null;
  for (const r of INSUFFICIENT_SCALE) if (contributedDays >= r[0]) row = r;
  if (!row) return 0;
  return familyOk ? row[2] : row[1];
}

export function checkSubsidy(input: SubsidyInput): SubsidyResult {
  const age = Math.floor(nonNeg(input.age));
  const members = Math.min(20, Math.floor(nonNeg(input.familyMembers)));
  const own = cents(nonNeg(input.ownIncome));
  // Alone, the unit's income is the applicant's own; never below it.
  const household = members === 0 ? own : Math.max(own, cents(nonNeg(input.householdIncome)));
  const perHead = cents(household / (members + 1));
  const ownIncomeOk = own <= INCOME_LIMIT;
  const familyOk = members > 0 && perHead <= INCOME_LIMIT;
  const base = { incomeLimit: INCOME_LIMIT, ownIncomeOk, familyOk, perHead };

  const result = (status: Status, kind: SubsidyKind | null, months: number | null, reasons: Reason[], over52 = false): SubsidyResult => {
    const phases = status === "eligible" ? phasesFor(months, over52) : [];
    const open = phases.some((p) => p.total === null);
    return {
      status,
      kind,
      months: status === "eligible" && !over52 ? months : null,
      phases,
      total: phases.length && !open ? cents(phases.reduce((s, p) => s + (p.total ?? 0), 0)) : null,
      firstMonthly: phases[0]?.monthly ?? 0,
      ...base,
      reasons,
      retirementContribution: over52 && status === "eligible",
    };
  };

  const notes: Reason[] = [];
  const situation = input.situation;
  const exhaustedDays = Math.floor(nonNeg(input.exhaustedDays));
  const contributed = Math.floor(nonNeg(input.contributedDays));

  // Over 52 (art. 280): from an art. 274.1 situation, own income only; it takes precedence when it applies.
  const inArt274 = situation === "exhausted" ? exhaustedDays >= MIN_EXHAUSTED_DAYS : situation === "insufficient" ? contributed >= MIN_DAYS_INSUFFICIENT && contributed < CONTRIBUTORY_MIN_DAYS : false;
  if (age >= OVER52_AGE && inArt274) {
    const answers = [input.retirementRecord, input.unemploymentYears];
    if (!ownIncomeOk) notes.push("over52-income");
    else if (answers.every((a) => a === "yes")) return result("eligible", "over52", null, [], true);
    else if (answers.includes("no")) notes.push("over52-record-no");
    else notes.push("over52-unknown");
  }

  switch (situation) {
    case "exhausted": {
      if (!ownIncomeOk && !familyOk) return result("not-eligible", "exhausted", null, ["income", ...notes]);
      const months = exhaustedMonths(age, exhaustedDays, familyOk);
      if (months === 0) return result("not-eligible", "exhausted", null, ["young-short", ...notes]);
      return result("eligible", "exhausted", months, notes);
    }
    case "insufficient": {
      if (contributed >= CONTRIBUTORY_MIN_DAYS) return result("contributory", null, null, ["contributory"]);
      if (contributed < MIN_DAYS_INSUFFICIENT) return result("not-eligible", "insufficient", null, ["few-days"]);
      if (!ownIncomeOk && !familyOk) return result("not-eligible", "insufficient", null, ["income", ...notes]);
      return result("eligible", "insufficient", insufficientMonths(contributed, familyOk), notes);
    }
    case "emigrant": {
      if (input.workedAbroad === "no") return result("not-eligible", "emigrant", null, ["abroad-no"]);
      if (input.workedAbroad === "unknown") return result("check-sepe", "emigrant", null, ["abroad-unknown"]);
      // DA 57ª.1.f: «Carecer de rentas en los términos establecidos en el artículo 275»: own income; family responsibilities instead is for SEPE to say.
      if (ownIncomeOk) return result("eligible", "emigrant", EMIGRANT_MONTHS, []);
      if (familyOk) return result("check-sepe", "emigrant", null, ["emigrant-family"]);
      return result("not-eligible", "emigrant", null, ["income"]);
    }
    case "victim": {
      const rai = input.priorRai;
      if (rai !== 0 && rai !== 1 && rai !== 2) return result("check-sepe", "victim", null, ["rai-three"]);
      // DA 58ª.1.d: own income, unless there is a spouse, partner or children: then family responsibilities.
      const ok = members > 0 ? familyOk : ownIncomeOk;
      if (!ok) return result("not-eligible", "victim", null, ["income"]);
      return result("eligible", "victim", VICTIM_MONTHS[rai], []);
    }
    default:
      return result("check-sepe", null, null, ["other-situation"]);
  }
}
