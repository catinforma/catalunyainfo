import { isReservoirSlug, type LivePayload, type LiveReading, type ReservoirSlug } from "./types";

/**
 * Browser-side logic of the reading block: check our endpoint's JSON, choose
 * between today's reading and the page's own (dated) one, and say how old a
 * reading is in Madrid's calendar. Pure and small, with no snapshot import,
 * so the client bundle stays light. "Today" is only ever computed here, in
 * the browser, from an explicit `now`.
 */

export const LEVELS_ENDPOINT = "/api/reservoirs/levels/";

/**
 * The ACA dates a reading by its day and publishes every day. A reading two
 * days old is normal before the morning update; older than that, the block
 * says the ACA has not published since.
 */
export const STALE_AFTER_DAYS = 2;

/** A reading as the block shows it (live, or the page's own from the snapshot). */
export interface Reading {
  slug: ReservoirSlug;
  date: string;
  percent: number;
  volume: number;
  level: number | null;
  change?: number | null;
  changeFrom?: string | null;
}

/** Madrid civil date of an instant, "2026-10-28". */
export function madridDate(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(instant);
}

/** Whole days from ISO date `a` to ISO date `b`. */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

export type Age = "today" | "yesterday" | "recent" | "stale";

/** How old a reading dated `date` is, by the calendar in Madrid at `now`. */
export function readingAge(date: string, now: Date): Age {
  const days = daysBetween(date, madridDate(now));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return days <= STALE_AFTER_DAYS ? "recent" : "stale";
}

const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isIsoDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

/**
 * Checks the JSON from our endpoint before anything is shown from it: a
 * broken or unexpected answer is a failure (the page keeps its own dated
 * reading), never a set of made-up numbers.
 */
export function parsePayload(json: unknown): LivePayload | null {
  const p = json as Partial<LivePayload> | null;
  if (!p || typeof p !== "object" || typeof p.fetchedAt !== "string" || Number.isNaN(Date.parse(p.fetchedAt))) return null;
  if (p.ok === false) return p.error === "unavailable" ? (p as LivePayload) : null;
  if (p.ok !== true || !Array.isArray(p.readings)) return null;
  for (const item of p.readings as unknown[]) {
    const r = item as Partial<LiveReading> | null;
    if (!r || typeof r.slug !== "string" || !isReservoirSlug(r.slug) || !isIsoDate(r.date)) return null;
    if (!isNumber(r.percent) || r.percent <= 0 || r.percent > 115 || !isNumber(r.volume) || r.volume < 0) return null;
    if (r.level !== null && !isNumber(r.level)) return null;
    if (r.change !== null && !isNumber(r.change)) return null;
    if (r.changeFrom !== null && !isIsoDate(r.changeFrom)) return null;
  }
  return p as LivePayload;
}

/**
 * For each reservoir, the newer of today's reading and the page's own; the
 * page's own when the endpoint failed or left the reservoir out. `live`
 * counts the reservoirs the endpoint answered for.
 */
export function mergeReadings(payload: LivePayload | null, own: Reading[]): { readings: Reading[]; live: number } {
  const fresh = payload && payload.ok ? new Map(payload.readings.map((r) => [r.slug, r])) : new Map<ReservoirSlug, LiveReading>();
  let live = 0;
  const readings = own.map((mine) => {
    const today = fresh.get(mine.slug);
    if (today && today.date >= mine.date) {
      live += 1;
      return today;
    }
    return mine;
  });
  return { readings, live };
}

/**
 * The added volume of a drought indicator's reservoirs, only when every one
 * of them has a reading of the same day (otherwise null: a sum of different
 * days is not a reading).
 */
export function indicatorVolume(readings: Reading[], slugs: readonly ReservoirSlug[]): { volume: number; date: string } | null {
  const picked = slugs.map((s) => readings.find((r) => r.slug === s));
  if (picked.some((r) => !r)) return null;
  const dates = new Set(picked.map((r) => r!.date));
  if (dates.size !== 1) return null;
  return { volume: Math.round(picked.reduce((sum, r) => sum + r!.volume, 0) * 100) / 100, date: picked[0]!.date };
}

/* -------------------------------------------------------------------------- */
/* Formatting (deterministic: the same string on the server and the browser)  */
/* -------------------------------------------------------------------------- */

export type BlockLocale = "ca" | "es" | "en";

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "28/10/2026" (ca, es) or "28 Oct 2026" (en). */
export function formatDate(iso: string, locale: BlockLocale): string {
  const [y = "", m = "", d = ""] = iso.split("-");
  return locale === "en" ? `${Number(d)} ${EN_MONTHS[Number(m) - 1] ?? ""} ${y}` : `${d}/${m}/${y}`;
}

/** Fixed decimals with the locale's decimal sign; no grouping (the figures stay under 10,000). */
export function formatNumber(value: number, locale: BlockLocale, digits = 1): string {
  const text = value.toFixed(digits);
  return locale === "en" ? text : text.replace(".", ",");
}

/** "+1,2", "−0,4", "±0,0". */
export function formatChange(value: number, locale: BlockLocale): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "±";
  return `${sign}${formatNumber(Math.abs(value), locale)}`;
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
