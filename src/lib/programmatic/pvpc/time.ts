/**
 * Madrid wall-clock arithmetic for the PVPC pages. Pure: no clock (callers
 * pass `now`), no network.
 *
 * REE publishes the PVPC per hour of the official peninsular time
 * (Europe/Madrid), with the UTC offset on every instant
 * ("2026-10-25T02:00:00.000+02:00", then "2026-10-25T02:00:00.000+01:00").
 * A Madrid day therefore has 24 hours, except the last Sunday of March (23:
 * 02:00 does not exist) and the last Sunday of October (25: 02:00 happens
 * twice). Every function here works on instants, so those two days need no
 * special case.
 */

const HOUR_MS = 3_600_000;

const PARTS = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Madrid",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZoneName: "longOffset",
});

export interface MadridParts {
  /** "2026-11-13" */
  date: string;
  /** 0–23, wall clock. */
  hour: number;
  minute: number;
  /** UTC offset in minutes: 60 (CET) or 120 (CEST). */
  offset: number;
}

export function madridParts(ms: number): MadridParts {
  const parts = PARTS.formatToParts(new Date(ms));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const tz = /GMT([+-])(\d{2}):?(\d{2})?/.exec(get("timeZoneName"));
  const offset = tz ? (tz[1] === "-" ? -1 : 1) * (Number(tz[2]) * 60 + Number(tz[3] ?? 0)) : 0;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")), minute: Number(get("minute")), offset };
}

/** Today's date in Madrid. */
export function madridDate(ms: number): string {
  return madridParts(ms).date;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(date: string): boolean {
  const m = ISO_DATE.exec(date);
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toISOString().slice(0, 10) === date;
}

/** Calendar arithmetic on an ISO date ("2026-11-13" + 1 = "2026-11-14"). */
export function addDays(date: string, days: number): string {
  const m = ISO_DATE.exec(date);
  if (!m) throw new Error(`not an ISO date: ${date}`);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days)).toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, of the calendar date (no time zone involved). */
export function weekday(date: string): number {
  const m = ISO_DATE.exec(date);
  if (!m) throw new Error(`not an ISO date: ${date}`);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
}

/** The instant Madrid's clock reads 00:00 on `date`. */
export function madridMidnight(date: string): number {
  const m = ISO_DATE.exec(date);
  if (!m) throw new Error(`not an ISO date: ${date}`);
  const utcMidnight = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  // Madrid is UTC+1 or UTC+2; midnight never falls in a DST gap (changes happen at 02:00/03:00).
  for (const offset of [60, 120]) {
    const candidate = utcMidnight - offset * 60_000;
    const p = madridParts(candidate);
    if (p.date === date && p.hour === 0 && p.minute === 0) return candidate;
  }
  throw new Error(`no Madrid midnight for ${date}`);
}

/** The start instant of every hour of a Madrid day: 24, or 23 / 25 on the DST days. */
export function hourStarts(date: string): number[] {
  const start = madridMidnight(date);
  const end = madridMidnight(addDays(date, 1));
  const out: number[] = [];
  for (let t = start; t < end; t += HOUR_MS) out.push(t);
  return out;
}

export function hoursInDay(date: string): number {
  return hourStarts(date).length;
}

const pad = (n: number) => String(n).padStart(2, "0");

export interface HourLabel {
  /** "02:00": the wall-clock time the hour starts. */
  from: string;
  /** "03:00": the wall-clock time it ends (on 29 Mar 2026 the 01:00 hour ends at 03:00). */
  to: string;
  /** Wall-clock hour the hour starts at, 0–23 (what the tariff periods are defined on). */
  hour: number;
  /** On the 25-hour day, the two hours that start at 02:00: summer time (+02:00) first, then winter time. */
  repeat?: "summer" | "winter";
}

/** Labels for a list of hour starts of one day; the repeated 02:00 is flagged both times. */
export function hourLabels(starts: readonly number[]): HourLabel[] {
  const parts = starts.map((t) => madridParts(t));
  const counts = new Map<number, number>();
  for (const p of parts) counts.set(p.hour, (counts.get(p.hour) ?? 0) + 1);
  return starts.map((t, i) => {
    const p = parts[i]!;
    const end = madridParts(t + HOUR_MS);
    // The first 02:00 (CEST) of the 25-hour day ends when the clock reads 02:00 again: print 03:00, as both halves are 02:00–03:00 on the wall.
    const toHour = end.hour === p.hour ? (p.hour + 1) % 24 : end.hour;
    const label: HourLabel = { from: `${pad(p.hour)}:00`, to: `${pad(toHour)}:00`, hour: p.hour };
    if ((counts.get(p.hour) ?? 0) > 1) label.repeat = p.offset === 120 ? "summer" : "winter";
    return label;
  });
}

/** Index of the hour of `starts` that contains `now`, or -1. */
export function currentHourIndex(starts: readonly number[], now: number): number {
  for (let i = 0; i < starts.length; i++) {
    const s = starts[i]!;
    if (now >= s && now < s + HOUR_MS) return i;
  }
  return -1;
}
