/**
 * The mortgage calculator's engine: French amortisation (constant
 * instalment within each rate period), the way Spanish loans are written,
 * in whole cents.
 *
 *  - Monthly rate = annual nominal rate (TIN) / 12.
 *  - Instalment = C·i / (1 − (1 + i)^−n) on the capital outstanding and the
 *    months left, rounded to the cent; recalculated whenever the rate changes
 *    (a variable loan's revision, a mixed loan's switch to variable).
 *  - Each month: interest = outstanding · i, rounded to the cent;
 *    capital repaid = instalment − interest; the last instalment pays off
 *    whatever is left, so the capital repaid always adds up to the loan.
 *  - Variable periods: Euribor + spread, never below 0 % (Ley 5/2019 art.
 *    21.4: "El interés remuneratorio en dichas operaciones no podrá ser
 *    negativo"). The Euribor is assumed constant at the figure typed (the
 *    latest official one by default): an assumption, said on the page.
 *
 * Pure and client-safe; the tests check it to the cent on known examples.
 */

export type MortgageKind = "fixed" | "variable" | "mixed";

export interface RatePeriod {
  /** First instalment of the period (1-based). */
  from: number;
  /** Annual nominal rate in %. */
  annualPct: number;
}

export interface ScheduleRow {
  month: number;
  /** All in cents. */
  payment: number;
  interest: number;
  principal: number;
  balance: number;
  annualPct: number;
}

export interface YearRow {
  year: number;
  paid: number;
  interest: number;
  principal: number;
  /** Outstanding at the end of the year, cents. */
  balance: number;
}

export interface PeriodSummary {
  from: number;
  to: number;
  annualPct: number;
  /** The instalment of the period's first month, cents. */
  payment: number;
}

export interface Schedule {
  rows: ScheduleRow[];
  years: YearRow[];
  periods: PeriodSummary[];
  totalPaid: number;
  totalInterest: number;
}

/** Half-up to the cent, robust to binary noise (x is in cents). */
export function roundCents(x: number): number {
  return Math.floor(x + 0.5 + 1e-7);
}

export function toCents(euros: number): number {
  return roundCents(euros * 100);
}

/** The French instalment, in cents, for `cents` outstanding over `months` at `annualPct`. */
export function annuity(cents: number, annualPct: number, months: number): number {
  if (months <= 0) return cents;
  if (annualPct === 0) return roundCents(cents / months);
  const i = annualPct / 1200;
  return roundCents((cents * i) / (1 - Math.pow(1 + i, -months)));
}

/** The full monthly schedule for a loan of `cents` over `months` with the rate periods given (sorted, first from 1). */
export function amortise(cents: number, months: number, periods: readonly RatePeriod[]): Schedule {
  const rows: ScheduleRow[] = [];
  const summaries: PeriodSummary[] = [];
  let balance = cents;
  let payment = 0;
  let rate = 0;
  for (let k = 1; k <= months && balance > 0; k++) {
    const start = periods.find((p) => p.from === k);
    if (start || k === 1) {
      rate = (start ?? periods[0]!).annualPct;
      payment = annuity(balance, rate, months - k + 1);
      if (summaries.length) summaries.at(-1)!.to = k - 1;
      summaries.push({ from: k, to: months, annualPct: rate, payment });
    }
    const interest = roundCents((balance * rate) / 1200);
    let principal = payment - interest;
    let paid = payment;
    if (k === months || principal >= balance) {
      principal = balance;
      paid = principal + interest;
    }
    balance -= principal;
    rows.push({ month: k, payment: paid, interest, principal, balance, annualPct: rate });
  }
  const years: YearRow[] = [];
  for (const r of rows) {
    const y = Math.ceil(r.month / 12);
    const row = years[y - 1] ?? (years[y - 1] = { year: y, paid: 0, interest: 0, principal: 0, balance: 0 });
    row.paid += r.payment;
    row.interest += r.interest;
    row.principal += r.principal;
    row.balance = r.balance;
  }
  const totalPaid = rows.reduce((s, r) => s + r.payment, 0);
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  // Drop periods that never started (a loan shorter than its fixed stretch).
  return { rows, years, periods: summaries.filter((p) => p.from <= rows.length), totalPaid, totalInterest };
}

/** Euribor + spread, floored at 0 % (Ley 5/2019 art. 21.4). */
export function variableRate(euriborPct: number, spreadPct: number): { annualPct: number; floored: boolean } {
  const raw = Math.round((euriborPct + spreadPct) * 1000) / 1000;
  return raw < 0 ? { annualPct: 0, floored: true } : { annualPct: raw, floored: false };
}

export interface MortgageInput {
  kind: MortgageKind;
  /** Loan in euros. */
  amount: number;
  years: number;
  /** Fixed loans and the fixed stretch of mixed loans: TIN in %. */
  fixedPct: number;
  /** Mixed loans: years at the fixed rate. */
  fixedYears: number;
  euriborPct: number;
  spreadPct: number;
  /** Variable loans: the rate of the first months before the first revision (TIN %), and how many months. */
  initialPct: number;
  initialMonths: number;
}

export type MortgageResult =
  | { status: "ok"; schedule: Schedule; periods: RatePeriod[]; floored: boolean }
  | { status: "invalid"; reason: "amount" | "years" | "rate" | "fixedYears" | "initialMonths" };

export const LIMITS = { amountMin: 1_000, amountMax: 10_000_000, yearsMin: 1, yearsMax: 40, rateMax: 20 } as const;

const okRate = (r: number) => Number.isFinite(r) && r >= -5 && r <= LIMITS.rateMax;

/** The rate periods of a loan, or the reason the input cannot be computed. */
export function ratePeriods(input: MortgageInput): { periods: RatePeriod[]; floored: boolean } | { invalid: "rate" | "fixedYears" | "initialMonths" } {
  const months = input.years * 12;
  if (input.kind === "fixed") {
    if (!okRate(input.fixedPct) || input.fixedPct < 0) return { invalid: "rate" };
    return { periods: [{ from: 1, annualPct: input.fixedPct }], floored: false };
  }
  if (!okRate(input.euriborPct) || !okRate(input.spreadPct)) return { invalid: "rate" };
  const v = variableRate(input.euriborPct, input.spreadPct);
  if (input.kind === "variable") {
    if (!Number.isInteger(input.initialMonths) || input.initialMonths < 0 || input.initialMonths >= months) return { invalid: "initialMonths" };
    if (input.initialMonths === 0) return { periods: [{ from: 1, annualPct: v.annualPct }], floored: v.floored };
    if (!okRate(input.initialPct) || input.initialPct < 0) return { invalid: "rate" };
    return { periods: [{ from: 1, annualPct: input.initialPct }, { from: input.initialMonths + 1, annualPct: v.annualPct }], floored: v.floored };
  }
  if (!okRate(input.fixedPct) || input.fixedPct < 0) return { invalid: "rate" };
  if (!Number.isInteger(input.fixedYears) || input.fixedYears < 1 || input.fixedYears >= input.years) return { invalid: "fixedYears" };
  return { periods: [{ from: 1, annualPct: input.fixedPct }, { from: input.fixedYears * 12 + 1, annualPct: v.annualPct }], floored: v.floored };
}

export function computeMortgage(input: MortgageInput): MortgageResult {
  if (!Number.isFinite(input.amount) || input.amount < LIMITS.amountMin || input.amount > LIMITS.amountMax) return { status: "invalid", reason: "amount" };
  if (!Number.isInteger(input.years) || input.years < LIMITS.yearsMin || input.years > LIMITS.yearsMax) return { status: "invalid", reason: "years" };
  const p = ratePeriods(input);
  if ("invalid" in p) return { status: "invalid", reason: p.invalid };
  return { status: "ok", schedule: amortise(toCents(input.amount), input.years * 12, p.periods), periods: p.periods, floored: p.floored };
}

/* -------------------------------------------------------------------------- */
/* Revision of a variable loan                                                */
/* -------------------------------------------------------------------------- */

export interface RevisionInput {
  /** Capital outstanding, euros. */
  balance: number;
  /** Months left to pay. */
  monthsLeft: number;
  spreadPct: number;
  /** The Euribor of the last revision and the one that applies now, in %. */
  oldEuriborPct: number;
  newEuriborPct: number;
}

export type RevisionResult =
  | {
      status: "ok";
      oldPct: number;
      newPct: number;
      /** Cents. */
      oldPayment: number;
      newPayment: number;
      /** newPayment − oldPayment, cents a month; ×12 for a year. */
      monthly: number;
      yearly: number;
      floored: boolean;
    }
  | { status: "invalid"; reason: "balance" | "months" | "rate" };

/**
 * New instalment vs old one on the same outstanding capital and months
 * left: what a yearly revision changes. The old instalment is the one the
 * old rate gives on today's balance (close to, not exactly, what the bank
 * charged: the bank computed it on last year's balance and term).
 */
export function computeRevision(input: RevisionInput): RevisionResult {
  if (!Number.isFinite(input.balance) || input.balance < 100 || input.balance > LIMITS.amountMax) return { status: "invalid", reason: "balance" };
  if (!Number.isInteger(input.monthsLeft) || input.monthsLeft < 1 || input.monthsLeft > LIMITS.yearsMax * 12) return { status: "invalid", reason: "months" };
  if (![input.spreadPct, input.oldEuriborPct, input.newEuriborPct].every(okRate)) return { status: "invalid", reason: "rate" };
  const o = variableRate(input.oldEuriborPct, input.spreadPct);
  const n = variableRate(input.newEuriborPct, input.spreadPct);
  const cents = toCents(input.balance);
  const oldPayment = annuity(cents, o.annualPct, input.monthsLeft);
  const newPayment = annuity(cents, n.annualPct, input.monthsLeft);
  const monthly = newPayment - oldPayment;
  return { status: "ok", oldPct: o.annualPct, newPct: n.annualPct, oldPayment, newPayment, monthly, yearly: monthly * Math.min(12, input.monthsLeft), floored: o.floored || n.floored };
}

/* -------------------------------------------------------------------------- */
/* Typed input                                                                */
/* -------------------------------------------------------------------------- */

/** "150.000", "150000", "150.000,50", "150,000.50", "1500,5" → euros; NaN when unreadable. */
export function parseAmount(text: string): number {
  const t = text.trim().replace(/[\s€]/g, "");
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(t)) return Number(t.replace(/\./g, "").replace(",", "."));
  if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(t)) return Number(t.replace(/,/g, ""));
  if (/^\d+([.,]\d{1,2})?$/.test(t)) return Number(t.replace(",", "."));
  return Number.NaN;
}

/** "3,239", "3.239 %", "−0,5" → %; NaN when unreadable. */
export function parsePct(text: string): number {
  const t = text.trim().replace(/[\s%]/g, "").replace("−", "-").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(t)) return Number.NaN;
  return Number(t);
}

/** A whole number of years or months; NaN otherwise. */
export function parseWhole(text: string): number {
  const t = text.trim();
  return /^\d{1,3}$/.test(t) ? Number(t) : Number.NaN;
}
