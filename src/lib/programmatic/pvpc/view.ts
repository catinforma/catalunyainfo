/**
 * What a PVPC page shows, given what REE answered in this render and the
 * last good answer kept from earlier. Pure: `now` is passed in.
 *
 * A published PVPC day never changes, so a day kept from an earlier answer is
 * still REE's exact price for that date: the fallback can show it for that
 * date. What it can never do is show an older day as today's; when neither
 * answer holds today, the page says so and prints the newest day it has with
 * its own date.
 */

import { isCompleteDay, type PvpcDay } from "./parse";
import { addDays, madridDate, madridParts } from "./time";

export interface PvpcSnapshot {
  /** When REE answered (its `Date` header), ISO. */
  fetchedAt: string;
  /** REE's `last-update` of series 1001, ISO. */
  updated: string | null;
  /** Complete days, oldest first. */
  days: PvpcDay[];
}

/** "live": today's prices from REE in this render; "snapshot": today's from an earlier answer; "stale": only older days; "none": nothing. */
export type PvpcSource = "live" | "snapshot" | "stale" | "none";

export interface PvpcView {
  /** When this view was built (the render), ISO: the "current hour" is this instant's. */
  renderedAt: string;
  source: PvpcSource;
  /** When the figures on the page were read from REE, ISO; null with "none". */
  fetchedAt: string | null;
  /** REE's last update of the series behind the figures, ISO. */
  updated: string | null;
  todayDate: string;
  tomorrowDate: string;
  today: PvpcDay | null;
  tomorrow: PvpcDay | null;
  yesterday: PvpcDay | null;
  /** Without today: the newest day held, printed with its date (never as today). */
  latest: PvpcDay | null;
}

/** Union by date; `first` wins, but a Ceuta/Melilla column from either is kept. */
export function mergeDays(first: readonly PvpcDay[], second: readonly PvpcDay[]): PvpcDay[] {
  const byDate = new Map<string, PvpcDay>();
  for (const day of second) if (isCompleteDay(day)) byDate.set(day.date, day);
  for (const day of first) {
    if (!isCompleteDay(day)) continue;
    const other = byDate.get(day.date);
    const hasCym = day.hours.every((h) => h.cym !== undefined);
    const otherCym = other && other.hours.length === day.hours.length && other.hours.every((h, i) => h.cym !== undefined && Math.abs(h.price - day.hours[i]!.price) < 0.006);
    byDate.set(day.date, !hasCym && otherCym ? { ...day, hours: day.hours.map((h, i) => ({ ...h, cym: other!.hours[i]!.cym })) } : day);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Days worth keeping in the last-good snapshot: from yesterday on. */
export function pruneDays(days: readonly PvpcDay[], now: number): PvpcDay[] {
  const from = addDays(madridDate(now), -1);
  return days.filter((d) => d.date >= from);
}

export function buildView(live: PvpcSnapshot | null, kept: PvpcSnapshot | null, now: number): PvpcView {
  const todayDate = madridDate(now);
  const tomorrowDate = addDays(todayDate, 1);
  const yesterdayDate = addDays(todayDate, -1);
  const days = mergeDays(live?.days ?? [], kept?.days ?? []);
  const find = (date: string) => days.find((d) => d.date === date) ?? null;
  const today = find(todayDate);
  const has = (s: PvpcSnapshot | null, date: string) => Boolean(s?.days.some((d) => d.date === date && isCompleteDay(d)));

  let source: PvpcSource;
  let from: PvpcSnapshot | null;
  if (has(live, todayDate)) [source, from] = ["live", live];
  else if (has(kept, todayDate)) [source, from] = ["snapshot", kept];
  else if (days.length > 0) {
    source = "stale";
    const newest = days[days.length - 1]!.date;
    from = has(live, newest) ? live : kept;
  } else [source, from] = ["none", null];

  const past = days.filter((d) => d.date < todayDate);
  return {
    renderedAt: new Date(now).toISOString(),
    source,
    fetchedAt: from?.fetchedAt ?? null,
    updated: from?.updated ?? null,
    todayDate,
    tomorrowDate,
    today,
    tomorrow: find(tomorrowDate),
    yesterday: find(yesterdayDate),
    latest: today ? null : (past[past.length - 1] ?? null),
  };
}

/**
 * REE must publish tomorrow's PVPC components "antes de las 20 h 15 de cada
 * día" (procedimiento de operación 14.12, BOE-A-2023-15276, §4), and says it
 * publishes the 2.0TD prices every day at 20:15.
 */
export const PUBLISH_DEADLINE = "20:15";

/**
 * When today's prices appeared in REData, as "HH:MM" of yesterday: REE's
 * `last-update` of the series, only when it is yesterday's (the day before a
 * day is published). Null otherwise: then nothing is printed.
 */
export function publishedYesterdayAt(view: Pick<PvpcView, "updated" | "todayDate" | "tomorrow">): string | null {
  if (!view.updated || view.tomorrow) return null;
  const ms = Date.parse(view.updated);
  if (!Number.isFinite(ms)) return null;
  const p = madridParts(ms);
  if (p.date !== addDays(view.todayDate, -1)) return null;
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}
