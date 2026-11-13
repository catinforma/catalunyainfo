import { priceForRate } from "./results";
import { BDE_FEE, NOMINAL, SAVINGS_SCALE } from "./rules";

/**
 * The Letras del Tesoro calculator, pure (the page renders it on the
 * server, the client component re-runs it as you type, the tests pin it):
 *
 *  - price: the Tesoro's formula for terms up to one year (Orden ECM/2/2026
 *    art. 14, "convención ACTUAL/360"): P = 100 / (1 + i·d/360), d the days
 *    from issue to maturity;
 *  - what you pay: face value × P / 100 (the Banco de España rounds the
 *    published price to three decimals but charges it "con todos los
 *    decimales", art. 12.4.b, so a few cents can differ);
 *  - yield at maturity: face value − price paid (LIRPF art. 25.2.b);
 *  - TAE-equivalent: the same yield compounded over a 365-day year,
 *    (1 + i·d/360)^(365/d) − 1, to compare with a deposit's TAE;
 *  - tax: the savings scale on this yield alone (no withholding, it is
 *    paid in the Renta of the year the bill is repaid; with other savings
 *    income the brackets are shared);
 *  - the Banco de España fee on the repayment transfer for Cuenta Directa
 *    holders (1.5 per mille, 0.90 € to 200 €).
 */

export interface BillInput {
  /** Face value requested, euros (a multiple of 1,000 €). */
  nominal: number;
  /** Rate in % (e.g. 3.045). */
  ratePct: number;
  /** Days from issue to maturity. */
  days: number;
}

export interface BillResult {
  status: "ok";
  bills: number;
  nominal: number;
  /** Price in % of face value, unrounded. */
  pricePct: number;
  paid: number;
  gross: number;
  /** TAE-equivalent in %. */
  taePct: number;
  tax: number;
  net: number;
  /** Banco de España fee on the repayment transfer (Cuenta Directa). */
  bdeFee: number;
}

export type BillOutcome = BillResult | { status: "invalid"; reason: "amount" | "multiple" | "rate" | "days" };

const cents = (n: number) => Math.round(n * 100) / 100;

/** Tax on savings income alone, with the scale of rules.ts. */
export function savingsTax(base: number): number {
  if (!(base > 0)) return 0;
  let tax = 0;
  let from = 0;
  for (const band of SAVINGS_SCALE) {
    const slice = Math.min(base, band.upTo) - from;
    if (slice <= 0) break;
    tax += slice * band.rate;
    from = band.upTo;
  }
  return cents(tax);
}

/** The Banco de España's fee on transferring `amount` at maturity. */
export function bdeFee(amount: number): number {
  if (!(amount > 0)) return 0;
  return cents(Math.min(BDE_FEE.max, Math.max(BDE_FEE.min, amount * BDE_FEE.rate)));
}

export function taeFromRate(ratePct: number, days: number): number {
  return (Math.pow(1 + (ratePct / 100) * (days / 360), 365 / days) - 1) * 100;
}

export function computeBill(input: BillInput): BillOutcome {
  const { nominal, ratePct, days } = input;
  if (!Number.isFinite(nominal) || nominal < NOMINAL) return { status: "invalid", reason: "amount" };
  if (Math.abs(nominal / NOMINAL - Math.round(nominal / NOMINAL)) > 1e-9) return { status: "invalid", reason: "multiple" };
  if (!Number.isFinite(ratePct) || ratePct <= -2 || ratePct >= 20) return { status: "invalid", reason: "rate" };
  if (!Number.isInteger(days) || days < 1 || days > 371) return { status: "invalid", reason: "days" };
  const pricePct = priceForRate(ratePct, days);
  const paid = cents((nominal * pricePct) / 100);
  const gross = cents(nominal - paid);
  const tax = savingsTax(gross);
  return {
    status: "ok",
    bills: Math.round(nominal / NOMINAL),
    nominal,
    pricePct,
    paid,
    gross,
    taePct: taeFromRate(ratePct, days),
    tax,
    net: cents(gross - tax),
    bdeFee: bdeFee(nominal),
  };
}

/** A typed amount ("10.000", "10000 €", "10,000") as euros; NaN when unreadable. Bills only come in whole euros. */
export function parseEuros(text: string): number {
  const t = text.trim().replace(/[\s€]/g, "");
  if (!/^\d{1,3}([.,]\d{3})*$|^\d+$/.test(t)) return Number.NaN;
  return Number(t.replace(/[.,]/g, ""));
}

/** A typed rate ("3,045", "3.045", "3,045 %") in %; NaN when unreadable. */
export function parseRate(text: string): number {
  const t = text.trim().replace(/[\s%]/g, "").replace("−", "-").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(t)) return Number.NaN;
  return Number(t);
}
