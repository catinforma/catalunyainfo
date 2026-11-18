import { HOUSING_RENT_MULTIPLES, IPREM_CURRENT, LEGAL_AID_MULTIPLES, type IpremAmounts, type IpremLaw } from "./rules";

/**
 * The IPREM calculator's arithmetic, pure (the page, the client component
 * and the tests run the same code):
 *  - "x veces el IPREM": a multiple on the monthly IPREM and on the yearly
 *    one in 12 and in 14 payments;
 *  - "mis ingresos son x veces el IPREM": a yearly income divided by the
 *    yearly IPREM in 12 and in 14 payments, set against the common limits
 *    that depend only on the multiple.
 */

export type Payments = 12 | 14;

/** Cents, rounding half away from zero (as the BOE's amounts are written). */
export const cents = (n: number): number => Math.round((n + Math.sign(n) * Number.EPSILON) * 100) / 100;

/** The yearly IPREM a rule uses: 12 payments (letter c) or 14 (letter d). */
export function yearlyIprem(payments: Payments, iprem: Pick<IpremAmounts, "annual" | "annual14"> = IPREM_CURRENT): number {
  return payments === 14 ? iprem.annual14 : iprem.annual;
}

/** Largest multiple the calculator accepts (a guard against typos; no rule goes near it). */
export const MAX_MULTIPLE = 100;
/** Largest yearly income it accepts. */
export const MAX_INCOME = 10_000_000;

export type MultipleResult =
  | { status: "invalid" }
  | {
      status: "ok";
      multiple: number;
      /** multiple × monthly IPREM. */
      monthly: number;
      /** multiple × daily IPREM. */
      daily: number;
      /** multiple × yearly IPREM, 12 payments. */
      annual12: number;
      /** multiple × yearly IPREM, 14 payments. */
      annual14: number;
    };

/** "1,5 veces el IPREM": the amounts. */
export function multipleOf(multiple: number, iprem: Pick<IpremAmounts, "daily" | "monthly" | "annual" | "annual14"> = IPREM_CURRENT): MultipleResult {
  if (!Number.isFinite(multiple) || multiple <= 0 || multiple > MAX_MULTIPLE) return { status: "invalid" };
  return { status: "ok", multiple, monthly: cents(multiple * iprem.monthly), daily: cents(multiple * iprem.daily), annual12: cents(multiple * iprem.annual), annual14: cents(multiple * iprem.annual14) };
}

/** Two decimals, rounded down: 2,999 times is "2,99", never "3,00" (a limit is "igual o inferior"). */
export const floor2 = (n: number): number => Math.floor(n * 100 + 1e-9) / 100;

export type IncomeResult =
  | { status: "invalid" }
  | {
      status: "ok";
      income: number;
      /** income ÷ yearly IPREM (12 payments), not rounded. */
      times12: number;
      /** income ÷ yearly IPREM (14 payments), not rounded. */
      times14: number;
    };

/** "Mis ingresos son x veces el IPREM". */
export function incomeInIprem(income: number, iprem: Pick<IpremAmounts, "annual" | "annual14"> = IPREM_CURRENT): IncomeResult {
  if (!Number.isFinite(income) || income < 0 || income > MAX_INCOME) return { status: "invalid" };
  return { status: "ok", income, times12: income / iprem.annual, times14: income / iprem.annual14 };
}

/* -------------------------------------------------------------------------- */
/* Common limits that depend only on the multiple                             */
/* -------------------------------------------------------------------------- */

export type LimitId = "legal-aid-alone" | "legal-aid-under4" | "legal-aid-from4" | "legal-aid-exceptional" | "housing-rent" | "bono-social-alone";

export interface Limit {
  id: LimitId;
  multiple: number;
  payments: Payments;
  /** multiple × the yearly IPREM the rule uses. */
  amount: number;
}

/**
 * The limits the comparison lists, each with the base its rule names:
 * Ley 1/1996 arts. 3.1 and 5.1 (yearly IPREM, 12 payments, as the
 * Generalitat's page prints it), RD 326/2026 art. 116.1.c (14 payments, art.
 * 8.2.b) and RD 897/2017 art. 3.2.a for one person alone (14 payments).
 */
export function commonLimits(iprem: Pick<IpremAmounts, "annual" | "annual14"> = IPREM_CURRENT): Limit[] {
  const at = (id: LimitId, multiple: number, payments: Payments): Limit => ({ id, multiple, payments, amount: cents(multiple * yearlyIprem(payments, iprem)) });
  return [
    at("bono-social-alone", 1.5, 14),
    at("legal-aid-alone", LEGAL_AID_MULTIPLES.alone, 12),
    at("legal-aid-under4", LEGAL_AID_MULTIPLES.under4, 12),
    at("legal-aid-from4", LEGAL_AID_MULTIPLES.from4, 12),
    at("housing-rent", HOUSING_RENT_MULTIPLES.general, 14),
    at("legal-aid-exceptional", LEGAL_AID_MULTIPLES.exceptional, 12),
  ];
}

/** Within a limit: "igual o inferior" (every rule listed uses it, or "no superen"). */
export function withinLimit(income: number, limit: Pick<Limit, "amount">): boolean {
  return income <= limit.amount;
}

/* -------------------------------------------------------------------------- */
/* History                                                                    */
/* -------------------------------------------------------------------------- */

/** Rise of the monthly IPREM over the previous law's, in percent (null for the first). */
export function riseOver(prev: Pick<IpremLaw, "monthly"> | null, next: Pick<IpremLaw, "monthly">): number | null {
  if (!prev) return null;
  return ((next.monthly - prev.monthly) / prev.monthly) * 100;
}
