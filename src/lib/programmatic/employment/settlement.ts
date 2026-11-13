import { cents, inclusiveDays, lastDayOfMonth, maxIso, round2, yearDays } from "./dates";
import { dismissalPay, type DismissalResult, type DismissalType } from "./dismissal";
import { MIN_VACATION_DAYS, OBJECTIVE_NOTICE_DAYS } from "./rules";

/**
 * The final settlement (finiquito): what the employer owes on the last day,
 * besides any dismissal pay. Pure.
 *
 *  1. Salary for the days of the last month not yet paid: monthly ÷ 30 × days
 *     (a whole month when the last day is the month's last day).
 *  2. The accrued part of the two extra payments (art. 31 ET), unless they are
 *     already spread over the 12 monthly payslips. When each one accrues is set
 *     by the collective agreement, so the reader picks:
 *       - "annual": each accrues over 12 months — Christmas 1 Jan–31 Dec,
 *         summer 1 Jul–30 Jun;
 *       - "semester": each over 6 months — summer 1 Jan–30 Jun, Christmas
 *         1 Jul–31 Dec.
 *     Earlier periods are taken as paid.
 *  3. Vacation earned and not taken in the calendar year of the last day
 *     (art. 38 ET: at least 30 calendar days a year), paid at monthly ÷ 30 a
 *     calendar day. More taken than earned shows as a negative line.
 *  4. Optional: the statutory dismissal pay (dismissal.ts) and, for an
 *     objective dismissal, the 15 days' notice not given (art. 53.1.c, 53.4).
 */

export type ExtraAccrual = "annual" | "semester";
export type EndReason = "none" | DismissalType;
export const END_REASONS: readonly EndReason[] = ["none", "temporary", "objective", "unfair"];

export interface SettlementInput {
  start: string;
  end: string;
  /** Gross monthly salary as on the payslip (with the extras' share if they are spread). */
  monthly: number;
  /** True when the payslip already includes the extra payments' share. */
  extrasProrated: boolean;
  /** Gross amount of each extra payment; defaults to `monthly`. */
  extraAmount?: number;
  accrual: ExtraAccrual;
  /** Vacation days a year (calendar days); 30 unless the agreement gives more. */
  vacationPerYear: number;
  /** Vacation days already taken in the calendar year of `end`. */
  vacationTaken: number;
  /** Days of the last month still unpaid; defaults to `defaultPendingDays(end)`. */
  pendingDays?: number;
  reason: EndReason;
  /** Objective dismissal only: the 15 days' notice was not given. */
  noticeMissing?: boolean;
}

export interface ExtraLine {
  which: "summer" | "christmas";
  from: string;
  to: string;
  periodDays: number;
  accruedDays: number;
  amount: number;
}

export interface SettlementResult {
  valid: boolean;
  pendingDays: number;
  salary: number;
  extras: ExtraLine[];
  extrasTotal: number;
  vacation: { from: string; earned: number; taken: number; pending: number; dayValue: number; amount: number };
  notice: number;
  dismissal: DismissalResult | null;
  /** Salary, extras, vacation and notice: taxed and subject to contributions. */
  settlementTotal: number;
  /** Plus the dismissal pay. */
  total: number;
  /** The gross annual salary used for the dismissal pay. */
  annualSalary: number;
}

/** Days of the last month to pay: 30 when the last day closes the month, else the day of the month (never above 30). */
export function defaultPendingDays(end: string): number {
  if (lastDayOfMonth(end)) return 30;
  return Math.min(30, Number(end.slice(8)));
}

/** The current accrual period of each extra payment on `end`. */
export function extraPeriods(end: string, accrual: ExtraAccrual): { which: "summer" | "christmas"; from: string; to: string }[] {
  const y = Number(end.slice(0, 4));
  const firstHalf = end.slice(5) <= "06-30";
  if (accrual === "semester") {
    return firstHalf ? [{ which: "summer", from: `${y}-01-01`, to: `${y}-06-30` }] : [{ which: "christmas", from: `${y}-07-01`, to: `${y}-12-31` }];
  }
  return [
    firstHalf ? { which: "summer", from: `${y - 1}-07-01`, to: `${y}-06-30` } : { which: "summer", from: `${y}-07-01`, to: `${y + 1}-06-30` },
    { which: "christmas", from: `${y}-01-01`, to: `${y}-12-31` },
  ];
}

export function settlement(input: SettlementInput): SettlementResult {
  const monthly = Math.max(0, input.monthly || 0);
  const valid = input.end >= input.start && monthly > 0;
  const pendingDays = Math.max(0, Math.min(30, input.pendingDays ?? defaultPendingDays(input.end)));
  const salary = cents((monthly / 30) * pendingDays);

  const extraAmount = input.extraAmount && input.extraAmount > 0 ? input.extraAmount : monthly;
  const extras: ExtraLine[] = input.extrasProrated
    ? []
    : extraPeriods(input.end, input.accrual).map((p) => {
        const periodDays = inclusiveDays(p.from, p.to);
        const accruedDays = inclusiveDays(maxIso(p.from, input.start), input.end);
        return { ...p, periodDays, accruedDays, amount: cents((extraAmount * accruedDays) / periodDays) };
      });
  const extrasTotal = cents(extras.reduce((s, e) => s + e.amount, 0));

  const y = Number(input.end.slice(0, 4));
  const vacFrom = maxIso(`${y}-01-01`, input.start);
  const perYear = input.vacationPerYear > 0 ? input.vacationPerYear : MIN_VACATION_DAYS;
  const earned = round2((perYear * inclusiveDays(vacFrom, input.end)) / yearDays(y));
  const taken = Math.max(0, input.vacationTaken || 0);
  const pending = round2(earned - taken);
  const dayValue = monthly / 30;
  const vacation = { from: vacFrom, earned, taken, pending, dayValue: cents(dayValue), amount: cents(pending * dayValue) };

  const annualSalary = input.extrasProrated ? monthly * 12 : monthly * 12 + extraAmount * 2;
  const dismissal = input.reason === "none" ? null : dismissalPay({ type: input.reason, start: input.start, end: input.end, annualSalary });
  const notice = input.reason === "objective" && input.noticeMissing ? cents((annualSalary / 365) * OBJECTIVE_NOTICE_DAYS) : 0;

  const settlementTotal = cents(salary + extrasTotal + vacation.amount + notice);
  const total = cents(settlementTotal + (dismissal?.amount ?? 0));
  return { valid, pendingDays, salary, extras, extrasTotal, vacation, notice, dismissal, settlementTotal, total, annualSalary: cents(annualSalary) };
}
