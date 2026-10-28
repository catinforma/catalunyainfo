import { REFERENCE_CAPACITY, parseRows, splitStation } from "@/lib/content/reservoirs/levels";

import { RESERVOIRS, slugOfName, type DayReading, type LiveReading, type ReservoirName, type ReservoirTrend } from "./types";

/**
 * Pure functions shared by the snapshot script and the route handler: ACA
 * rows -> one valid reading per reservoir and day -> the live answer or the
 * one-year trend. No network, no clock (every "now" is an argument).
 *
 * Built on `content/reservoirs/levels.ts` (row parsing, station names, the
 * reference capacities) with one difference, explained at `isValidReading`.
 */

/** A row of `gn9e-3qhr` as Socrata returns it. */
export interface AcaRow {
  dia?: string;
  estaci?: string;
  nivell_absolut?: string;
  percentatge_volum_embassat?: string;
  volum_embassat?: string;
}

/**
 * A reading is trusted when its volume and percentage agree with the
 * reservoir's known size (within 4 %), the test `levels.ts` uses.
 *
 * Unlike the overall report (`isClean`), a percentage a little above 100 is
 * kept: a full reservoir can hold more than its nominal capacity for weeks,
 * and the ACA's rows show it with a consistent volume (la Llosa del Cavall
 * 100.6-100.9 % from 26 Feb to 31 Mar 2026; Susqueda 102.1 % on 8 Mar 2026).
 * Rows that lost their decimal separator are ten times off and still fail the
 * ratio; the 115 % cap is a second guard.
 */
export function isValidReading(name: string, percent: number, volume: number): boolean {
  const reference = REFERENCE_CAPACITY[name];
  if (!reference || !(percent > 0) || percent > 115 || !(volume >= 0)) return false;
  return Math.abs(((volume / percent) * 100) / reference - 1) < 0.04;
}

export interface NamedReading extends DayReading {
  name: string;
}

/**
 * Every valid reading, by reservoir name, one per day, sorted by date.
 * Returns the rejected count too, so the snapshot can say how many rows were
 * left out.
 */
export function validReadings(rows: AcaRow[]): { byName: Map<string, DayReading[]>; rejected: Map<string, number> } {
  const levels = new Map<string, number>();
  for (const row of rows) {
    const level = Number(row.nivell_absolut);
    if (row.estaci && row.dia && row.nivell_absolut !== undefined && Number.isFinite(level) && level > 0) {
      levels.set(`${row.dia.slice(0, 10)}|${splitStation(row.estaci).name}`, level);
    }
  }
  const byName = new Map<string, DayReading[]>();
  const rejected = new Map<string, number>();
  for (const row of parseRows(rows)) {
    if (!isValidReading(row.name, row.percent, row.volume)) {
      rejected.set(row.name, (rejected.get(row.name) ?? 0) + 1);
      continue;
    }
    const list = byName.get(row.name) ?? [];
    if (list.some((r) => r.date === row.date)) continue;
    list.push({ date: row.date, percent: row.percent, volume: row.volume, level: levels.get(`${row.date}|${row.name}`) ?? null });
    byName.set(row.name, list);
  }
  for (const list of byName.values()) list.sort((a, b) => a.date.localeCompare(b.date));
  return { byName, rejected };
}

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

export function shiftDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Whole days from `a` to `b` (both ISO dates). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

/** The same day of the month `months` earlier, clamped to the month's length (31 Mar -> 28/29 Feb). */
export function shiftMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const target = new Date(Date.UTC(y, m - 1 - months, 1, 12));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0, 12)).getUTCDate();
  target.setUTCDate(Math.min(d, last));
  return target.toISOString().slice(0, 10);
}

/** The reading on `iso`, else the nearest one before it within `days` days. */
export function readingOnOrBefore(list: DayReading[], iso: string, days = 3): DayReading | null {
  for (let back = 0; back <= days; back++) {
    const day = shiftDays(iso, -back);
    const hit = list.find((r) => r.date === day);
    if (hit) return hit;
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Live answer                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The latest valid reading of each reservoir, with the change since a valid
 * day three to seven days earlier (the earliest such day: a week when the
 * dataset has it), as `buildReport` measures the total. A reservoir with no
 * valid reading is left out, never filled in.
 */
export function liveReadings(rows: AcaRow[]): LiveReading[] {
  const { byName } = validReadings(rows);
  const out: LiveReading[] = [];
  for (const { slug, name } of RESERVOIRS) {
    const list = byName.get(name);
    const latest = list?.at(-1);
    if (!list || !latest) continue;
    const from = shiftDays(latest.date, -7);
    const to = shiftDays(latest.date, -3);
    const before = list.find((r) => r.date >= from && r.date <= to) ?? null;
    out.push({
      slug,
      date: latest.date,
      percent: latest.percent,
      volume: latest.volume,
      level: latest.level,
      change: before ? round1(latest.percent - before.percent) : null,
      changeFrom: before?.date ?? null,
    });
  }
  return out;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/* -------------------------------------------------------------------------- */
/* One-year trend (snapshot)                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The year up to a reservoir's latest valid reading, from its own rows:
 * the reading a year earlier, the lowest and highest of the 365 days, and one
 * reading a month. Throws when there is no reading at all, so a broken source
 * stops the script instead of writing an empty page.
 */
export function trendOf(list: DayReading[], rejected = 0): ReservoirTrend {
  const latest = list.at(-1);
  if (!latest) throw new Error("no valid reading");
  const start = shiftDays(latest.date, -365);
  const year = list.filter((r) => r.date > start && r.date <= latest.date);
  let min = year[0]!;
  let max = year[0]!;
  for (const r of year) {
    if (r.percent < min.percent) min = r;
    if (r.percent > max.percent) max = r;
  }
  const monthly: DayReading[] = [];
  for (let k = 12; k >= 0; k--) {
    const hit = readingOnOrBefore(list, shiftMonths(latest.date, k));
    if (hit && !monthly.some((m) => m.date === hit.date)) monthly.push(hit);
  }
  return {
    latest,
    yearAgo: readingOnOrBefore(list, shiftDays(latest.date, -365)) ?? readingOnOrBefore(list, shiftDays(latest.date, -362)),
    min,
    max,
    monthly,
    validDays: year.length,
    rejected,
  };
}

/** Names the snapshot must have: every reservoir of the family. */
export function missingReservoirs(names: Iterable<string>): ReservoirName[] {
  const have = new Set(names);
  return RESERVOIRS.filter((r) => !have.has(r.name)).map((r) => r.name);
}

export { slugOfName };
