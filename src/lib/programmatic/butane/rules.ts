/**
 * The revision rule of the bottled butane price and the arithmetic on the
 * BOE figures. Pure: every date is an ISO day ("2026-11-13", Madrid) passed
 * in; nothing reads the clock.
 *
 * Rule (Orden IET/389/2015 art. 3, as amended by Orden TED/211/2025): the
 * pre-tax maximum price is revised every two months and applies from the
 * third Tuesday of January, March, May, July, September and November; each
 * revision moves it at most 5 % up or down; until 30 Jun 2027 it cannot
 * exceed 127,7838 c€/kg (RDL 25/2026 art. 3).
 */

import { BOTTLE_KG, CEILING, MAX_STEP, NO_RESOLUTION, REVISIONS, TAX_PERIODS, type Revision, type TaxPeriod } from "./data";

/** The months a revision takes effect in (1-based). */
export const REVISION_MONTHS = [1, 3, 5, 7, 9, 11] as const;

/** "123,4447" → 123.4447. */
export function parseCents(text: string): number {
  if (!/^\d{1,3},\d{4}$/.test(text)) throw new Error(`butane: bad BOE price ${text}`);
  return Number(text.replace(",", "."));
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The third Tuesday of a month: "2026-11-17". */
export function thirdTuesday(year: number, month: number): string {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0 Sunday … 2 Tuesday
  const day = 1 + ((2 - first + 7) % 7) + 14;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Every scheduled revision day from `from` to `to`, both included. */
export function scheduledRevisions(from: string, to: string): string[] {
  const out: string[] = [];
  for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)); y++) {
    for (const m of REVISION_MONTHS) {
      const d = thirdTuesday(y, m);
      if (d >= from && d <= to) out.push(d);
    }
  }
  return out;
}

/** The next scheduled revision strictly after `day`. */
export function nextScheduledRevision(day: string): string {
  const y = Number(day.slice(0, 4));
  return scheduledRevisions(day, `${y + 1}-12-31`).find((d) => d > day)!;
}

/** The latest scheduled revision on or before `day`. */
export function lastScheduledRevision(day: string): string {
  const y = Number(day.slice(0, 4));
  return scheduledRevisions(`${y - 1}-01-01`, day).at(-1)!;
}

/** The day before (the BOE has printed every resolution since 2024 on the Monday before). */
export function dayBefore(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Scheduled revision days, up to `day`, with neither a resolution in REVISIONS nor a NO_RESOLUTION entry. */
export function missingRevisions(day: string, revisions: readonly Revision[] = REVISIONS): string[] {
  const known = new Set([...revisions.map((r) => r.effective), ...NO_RESOLUTION.map((n) => n.date)]);
  return scheduledRevisions(revisions[0]!.effective, day).filter((d) => !known.has(d));
}

export type ButaneState =
  /** The price in force today is in the table. `upcoming` is a resolution already in the BOE that applies later. */
  | { kind: "current"; current: Revision; previous: Revision | null; upcoming: Revision | null; next: string }
  /** A scheduled revision day has passed and its resolution is not in the table yet: the last known price may no longer apply. */
  | { kind: "awaiting"; last: Revision; due: string; next: string };

export function butaneState(day: string, revisions: readonly Revision[] = REVISIONS): ButaneState {
  const past = revisions.filter((r) => r.effective <= day);
  const last = past.at(-1);
  if (!last) throw new Error(`butane: no revision on or before ${day}`);
  const due = lastScheduledRevision(day);
  const skipped = NO_RESOLUTION.some((n) => n.date === due);
  if (due > last.effective && !skipped) return { kind: "awaiting", last, due, next: nextScheduledRevision(day) };
  const upcoming = revisions.find((r) => r.effective > day) ?? null;
  return { kind: "current", current: last, previous: past.at(-2) ?? null, upcoming, next: nextScheduledRevision(day) };
}

/** Change from one revision to the next, in % (two decimals), or null for the first. */
export function changePercent(revision: Revision, revisions: readonly Revision[] = REVISIONS): number | null {
  const i = revisions.indexOf(revision);
  if (i <= 0) return null;
  const before = parseCents(revisions[i - 1]!.centsPerKg);
  return Math.round(((parseCents(revision.centsPerKg) - before) / before) * 10000) / 100;
}

/** True when a revision moved the price by the full 5 % (the cap of art. 3.1). */
export function hitFivePercent(revision: Revision, revisions: readonly Revision[] = REVISIONS): boolean {
  const i = revisions.indexOf(revision);
  if (i <= 0) return false;
  const before = parseCents(revisions[i - 1]!.centsPerKg);
  const now = parseCents(revision.centsPerKg);
  const up = Math.round(before * (1 + MAX_STEP) * 10000) / 10000;
  const down = Math.round(before * (1 - MAX_STEP) * 10000) / 10000;
  return Math.abs(now - up) < 0.00015 || Math.abs(now - down) < 0.00015;
}

/** Euros, rounded to the cent. */
const cents = (eur: number) => Math.round(eur * 100) / 100;

/** The 12.5 kg bottle before taxes: 12.5 × the BOE's c€/kg. */
export function bottleBeforeTax(centsPerKg: string, kg: number = BOTTLE_KG): number {
  return cents((kg * parseCents(centsPerKg)) / 100);
}

export function taxPeriodOn(day: string): TaxPeriod | null {
  return TAX_PERIODS.find((p) => p.from <= day && day <= p.to) ?? null;
}

export interface BottleWithTax {
  /** 12.5 kg × pre-tax price. */
  base: number;
  /** Hydrocarbons tax on 12.5 kg (12.5 kg = 0.0125 t). */
  hydrocarbons: number;
  /** VAT on both. */
  vat: number;
  /** The maximum price, Peninsula and Balearic Islands. */
  total: number;
  period: TaxPeriod;
}

/**
 * The maximum price of the bottle with taxes in the Peninsula and the
 * Balearic Islands: (kg × price + kg × hydrocarbons tax) × (1 + VAT). The
 * same arithmetic turns the ceiling (127,7838 c€/kg) into the 19,55 € the
 * preamble of RDL 25/2026 states. Null when `day` has no tax period.
 */
export function bottleWithTax(centsPerKg: string, day: string, kg: number = BOTTLE_KG): BottleWithTax | null {
  const period = taxPeriodOn(day);
  if (!period) return null;
  const baseExact = (kg * parseCents(centsPerKg)) / 100;
  const ihExact = (kg / 1000) * period.hydrocarbonsEurPerTonne;
  const vatExact = (baseExact + ihExact) * (period.vatPercent / 100);
  return { base: cents(baseExact), hydrocarbons: cents(ihExact), vat: cents(vatExact), total: cents(baseExact + ihExact + vatExact), period };
}

/**
 * What the rules allow at the next revision, from the price in force: not
 * below −5 %, not above +5 %, nor above the RDL 25/2026 ceiling while it
 * lasts. A range from the rules, not a forecast.
 */
export function nextBounds(current: Revision, revisionDay: string): { low: number; high: number; ceilingApplies: boolean } {
  const p = parseCents(current.centsPerKg);
  const ceiling = parseCents(CEILING.centsPerKg);
  const up = p * (1 + MAX_STEP);
  const ceilingApplies = revisionDay <= CEILING.until && ceiling < up;
  return { low: Math.round(p * (1 - MAX_STEP) * 100) / 100, high: Math.round((ceilingApplies ? ceiling : up) * 100) / 100, ceilingApplies };
}

/** The last day the page's content changes on its own (a revision or a tax period starting), for the sitemap. */
export function lastChange(day: string, revisions: readonly Revision[] = REVISIONS): string {
  const dates = [...revisions.map((r) => r.published), ...revisions.map((r) => r.effective), ...TAX_PERIODS.map((p) => p.from)].filter((d) => d <= day);
  return dates.sort().at(-1)!;
}
