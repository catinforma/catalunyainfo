import { addDays, cents, inclusiveDays, round2, serviceMonths } from "./dates";
import {
  OBJECTIVE_CAP_DAYS,
  OBJECTIVE_DAYS_PER_YEAR,
  REFORM_2012,
  TEMPORARY_DAYS_PER_YEAR,
  UNFAIR_CAP_DAYS,
  UNFAIR_DAYS_PER_YEAR,
  UNFAIR_OLD_CAP_DAYS,
  UNFAIR_OLD_DAYS_PER_YEAR,
} from "./rules";

/**
 * Statutory dismissal pay (indemnización por despido), Estatuto de los
 * Trabajadores. Pure: dates in, days of salary and euros out.
 *
 *  - "unfair" (improcedente): 33 days a year, prorated by months, max 720 days
 *    (art. 56.1); contracts from before 12 Feb 2012 get 45 days a year for the
 *    service before that day and the DT 11ª cap (720 days, or the pre-2012
 *    days if more, never above 42 months' pay).
 *  - "objective" (objetivo, and collective dismissal / ERE, art. 51.4 → 53.1):
 *    20 days a year, prorated by months, max 12 months' pay (art. 53.1.b).
 *  - "temporary" (end of a fixed-term contract, art. 49.1.c): the proportional
 *    part of 12 days a year — here by calendar days served (days / 365 × 12).
 *
 * Daily salary = gross annual salary, extra payments included (art. 26.1: all
 * salary, cash or in kind) ÷ 365. A month of pay is 30 days, which is how the
 * caps read ("setecientos veinte días" = 24 mensualidades).
 */

export type DismissalType = "unfair" | "objective" | "temporary";
export const DISMISSAL_TYPES: readonly DismissalType[] = ["unfair", "objective", "temporary"];

export interface DismissalInput {
  type: DismissalType;
  /** First day of service, ISO. */
  start: string;
  /** Last day of service (the dismissal's effective date), ISO. */
  end: string;
  /** Gross annual salary with every extra payment, €. Ignored when `dailySalary` is given. */
  annualSalary?: number;
  /** Gross daily salary, € (if the reader knows it from a payslip or a ruling). */
  dailySalary?: number;
}

export interface Tranche {
  from: string;
  to: string;
  /** Months counted (any part of a month is a month), or calendar days for "temporary". */
  months: number;
  calendarDays: number;
  daysPerYear: number;
  /** Days of salary this tranche earns, before any cap. */
  days: number;
}

export interface DismissalResult {
  type: DismissalType;
  valid: boolean;
  /** Calendar days of service, both ends counted. */
  serviceDays: number;
  tranches: Tranche[];
  /** Days of salary before the cap. */
  rawDays: number;
  /** The cap in days of salary, or null when the rule has none. */
  capDays: number | null;
  capped: boolean;
  /** Days of salary owed, two decimals. */
  days: number;
  dailySalary: number;
  /** €, rounded to cents. */
  amount: number;
  /** The rule applied, for the copy: "33", "45+33", "20", "12". */
  rule: "33" | "45+33" | "20" | "12";
}

export function dailySalaryOf(input: Pick<DismissalInput, "annualSalary" | "dailySalary">): number {
  if (input.dailySalary && input.dailySalary > 0) return input.dailySalary;
  if (input.annualSalary && input.annualSalary > 0) return input.annualSalary / 365;
  return 0;
}

function tranche(from: string, to: string, daysPerYear: number): Tranche {
  const { months } = serviceMonths(from, to);
  return { from, to, months, calendarDays: inclusiveDays(from, to), daysPerYear, days: (daysPerYear * months) / 12 };
}

export function dismissalPay(input: DismissalInput): DismissalResult {
  const daily = dailySalaryOf(input);
  const valid = input.end >= input.start && daily > 0;
  const serviceDays = inclusiveDays(input.start, input.end);
  const base = { type: input.type, valid, serviceDays, dailySalary: daily };
  if (!valid) return { ...base, tranches: [], rawDays: 0, capDays: null, capped: false, days: 0, amount: 0, rule: input.type === "unfair" ? "33" : input.type === "objective" ? "20" : "12" };

  let tranches: Tranche[];
  let capDays: number | null;
  let rule: DismissalResult["rule"];

  if (input.type === "temporary") {
    // «la parte proporcional … de doce días de salario por cada año de servicio».
    tranches = [{ from: input.start, to: input.end, months: 0, calendarDays: serviceDays, daysPerYear: TEMPORARY_DAYS_PER_YEAR, days: (TEMPORARY_DAYS_PER_YEAR * serviceDays) / 365 }];
    capDays = null;
    rule = "12";
  } else if (input.type === "objective") {
    tranches = [tranche(input.start, input.end, OBJECTIVE_DAYS_PER_YEAR)];
    capDays = OBJECTIVE_CAP_DAYS;
    rule = "20";
  } else if (input.start < REFORM_2012) {
    const lastOld = addDays(REFORM_2012, -1);
    const oldEnd = input.end < lastOld ? input.end : lastOld;
    tranches = [tranche(input.start, oldEnd, UNFAIR_OLD_DAYS_PER_YEAR)];
    if (input.end >= REFORM_2012) tranches.push(tranche(REFORM_2012, input.end, UNFAIR_DAYS_PER_YEAR));
    const oldDays = tranches[0]!.days;
    // DT 11ª.2: 720 days, unless the pre-2012 service alone gives more; never above 42 months.
    capDays = oldDays > UNFAIR_CAP_DAYS ? Math.min(oldDays, UNFAIR_OLD_CAP_DAYS) : UNFAIR_CAP_DAYS;
    rule = "45+33";
  } else {
    tranches = [tranche(input.start, input.end, UNFAIR_DAYS_PER_YEAR)];
    capDays = UNFAIR_CAP_DAYS;
    rule = "33";
  }

  const rawDays = tranches.reduce((s, t) => s + t.days, 0);
  const capped = capDays !== null && rawDays > capDays;
  const days = capped ? capDays! : rawDays;
  return { ...base, tranches, rawDays: round2(rawDays), capDays, capped, days: round2(days), amount: cents(days * daily), rule };
}

/** The three rules side by side for the same dates and salary. */
export function compareDismissals(input: Omit<DismissalInput, "type">): Record<DismissalType, DismissalResult> {
  return {
    unfair: dismissalPay({ ...input, type: "unfair" }),
    objective: dismissalPay({ ...input, type: "objective" }),
    temporary: dismissalPay({ ...input, type: "temporary" }),
  };
}
