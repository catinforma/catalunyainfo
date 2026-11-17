import { EXEMPT_PER_TICKET, MIN_STAKE_FULL_EXEMPTION, RATE } from "./rules";

/**
 * The special levy on lottery prizes (Ley 35/2006, DA 33ª) as arithmetic.
 * Pure and client-safe.
 *
 *  - Per décimo (ticket, bet): each one has its own 40,000 € exempt part.
 *  - A share of a décimo (a participación, a décimo split between friends):
 *    the prize, the exempt part and the levy are split by the same share
 *    (DA 33ª.2 and 33ª.3, "en función de la cuota que les corresponda").
 *  - A stake below 0.50 € keeps only a proportional part of the exempt
 *    amount (DA 33ª.2): 40,000 × stake / 0.50.
 *  - 20 % of the part above the exempt amount, withheld when it is paid.
 *
 * Amounts in euros, rounded to the cent.
 */

export interface LotteryInput {
  /** Gross prize of one whole décimo or ticket. */
  prize: number;
  /** Price of one whole décimo or ticket. */
  price: number;
  /** What the reader holds of each décimo, in euros (the whole price, or a participación). */
  played: number;
  /** How many décimos of that prize (same share in each). */
  tickets: number;
}

export interface Breakdown {
  /** The reader's gross prize. */
  gross: number;
  /** The reader's exempt part. */
  exempt: number;
  /** Taxed part (gross minus exempt, never below 0). */
  base: number;
  /** 20 % of the base: what is withheld. */
  withholding: number;
  /** What the reader keeps. */
  net: number;
}

export type InvalidReason = "prize" | "price" | "played" | "played-above-price" | "tickets";

export type LotteryResult =
  | { status: "invalid"; reason: InvalidReason }
  | {
      status: "ok";
      /** Share of each décimo, 0 to 1. */
      share: number;
      perTicket: Breakdown;
      total: Breakdown;
      tickets: number;
      /** Withholding over gross, 0 to 0.2. */
      effectiveRate: number;
    };

/** Most décimos one person types; a guard against typos, not a legal limit. */
export const MAX_TICKETS = 1_000;

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/** The exempt part of one whole décimo or ticket of this price (DA 33ª.2, the 0.50 € rule). */
export function exemptForStake(price: number): number {
  return price >= MIN_STAKE_FULL_EXEMPTION ? EXEMPT_PER_TICKET : (EXEMPT_PER_TICKET * price) / MIN_STAKE_FULL_EXEMPTION;
}

/** One décimo's breakdown for a holder of `share` of it. */
export function breakdown(prize: number, price: number, share: number): Breakdown {
  const gross = round2(prize * share);
  const exempt = round2(Math.min(prize, exemptForStake(price)) * share);
  const base = round2(Math.max(0, gross - exempt));
  const withholding = round2(base * RATE);
  return { gross, exempt, base, withholding, net: round2(gross - withholding) };
}

function times(b: Breakdown, n: number): Breakdown {
  return { gross: round2(b.gross * n), exempt: round2(b.exempt * n), base: round2(b.base * n), withholding: round2(b.withholding * n), net: round2(b.net * n) };
}

export function calculate(input: LotteryInput): LotteryResult {
  const { prize, price, played, tickets } = input;
  if (!(prize > 0) || !Number.isFinite(prize)) return { status: "invalid", reason: "prize" };
  if (!(price > 0) || !Number.isFinite(price)) return { status: "invalid", reason: "price" };
  if (!(played > 0) || !Number.isFinite(played)) return { status: "invalid", reason: "played" };
  if (played > price + 1e-9) return { status: "invalid", reason: "played-above-price" };
  if (!Number.isInteger(tickets) || tickets < 1 || tickets > MAX_TICKETS) return { status: "invalid", reason: "tickets" };
  const share = played / price;
  const perTicket = breakdown(prize, price, share);
  const total = times(perTicket, tickets);
  return { status: "ok", share, perTicket, total, tickets, effectiveRate: total.gross > 0 ? total.withholding / total.gross : 0 };
}

/** The ok branch, for callers that pass known-good inputs (the page's tables and examples). */
export function calculateOk(input: LotteryInput): Extract<LotteryResult, { status: "ok" }> {
  const r = calculate(input);
  if (r.status !== "ok") throw new Error(`lottery-tax: invalid example (${r.reason})`);
  return r;
}
