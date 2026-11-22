import type { DaySchedule, PaidRule, Range, Season, SpecialDay } from "./types";

/**
 * "Is the blue zone paid today, and until what time?" as pure functions of a
 * date, a clock time, the zone's rule and the city's public holidays. No data
 * import and no clock of its own: the client component passes the moment the
 * page is being looked at, the tests pass fixed dates.
 */

export type DayType = "weekday" | "saturday" | "sunday" | "holiday";

/** One public holiday of the city: ISO date and the name to print. */
export interface HolidayEntry {
  d: string;
  n: string;
}

export interface DayAnswer {
  iso: string;
  type: DayType;
  /** The paid stretches of that day; empty = parking is free all day. */
  ranges: readonly Range[];
  /** The season the date falls in (August in Madrid), when the rule has one. */
  season: Season | null;
  /** The special day whose shorter hours apply (24 December), if any. */
  special: SpecialDay | null;
  /** The holiday's name when `type` is "holiday". */
  holiday: string | null;
}

function weekdayIndex(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

/** True when "MM-DD" falls in the inclusive window, which may wrap over New Year. */
export function inWindow(mmdd: string, from: string, to: string): boolean {
  return from <= to ? mmdd >= from && mmdd <= to : mmdd >= from || mmdd <= to;
}

export function seasonOn(rule: PaidRule, iso: string): Season | null {
  const mmdd = iso.slice(5);
  return rule.seasons.find((s) => inWindow(mmdd, s.from, s.to)) ?? null;
}

function specialOn(rule: PaidRule, iso: string): SpecialDay | null {
  const mmdd = iso.slice(5);
  return rule.special.find((s) => s.dates.includes(iso) || s.dates.includes(mmdd)) ?? null;
}

/**
 * The paid hours of one date. A public holiday comes first, then Sunday; a
 * working day or a Saturday takes the special day's hours when the date is
 * one, else those of the season it falls in, else the general ones.
 */
export function dayAnswer(rule: PaidRule, iso: string, holidays: readonly HolidayEntry[]): DayAnswer {
  const season = seasonOn(rule, iso);
  const schedule: DaySchedule = season ? season.schedule : rule.base;
  const holiday = holidays.find((h) => h.d === iso) ?? null;
  if (holiday) return { iso, type: "holiday", ranges: schedule.holiday, season, special: null, holiday: holiday.n };
  const weekday = weekdayIndex(iso);
  if (weekday === 0) return { iso, type: "sunday", ranges: schedule.sunday, season, special: null, holiday: null };
  const type: DayType = weekday === 6 ? "saturday" : "weekday";
  const special = specialOn(rule, iso);
  const override = special ? (type === "saturday" ? special.saturday : special.weekday) : undefined;
  if (special && override) return { iso, type, ranges: override, season, special, holiday: null };
  return { iso, type, ranges: schedule[type], season, special: null, holiday: null };
}

export type NowState =
  /** No paid hours on this day. */
  | { kind: "free-day" }
  /** Paid hours have not started yet. */
  | { kind: "before"; start: string; end: string }
  /** Paid right now, until `until`; `resumes` when another stretch follows after a break. */
  | { kind: "paid"; until: string; resumes: string | null; end: string }
  /** Between two paid stretches. */
  | { kind: "break"; resumes: string; end: string }
  /** The day's paid hours are over. */
  | { kind: "over"; ended: string };

/** Where "HH:MM" falls in the day's paid stretches (start inclusive, end exclusive). */
export function nowState(ranges: readonly Range[], hhmm: string): NowState {
  if (ranges.length === 0) return { kind: "free-day" };
  const first = ranges[0]!;
  const last = ranges[ranges.length - 1]!;
  if (hhmm < first[0]) return { kind: "before", start: first[0], end: last[1] };
  for (let i = 0; i < ranges.length; i += 1) {
    const [start, end] = ranges[i]!;
    if (hhmm >= start && hhmm < end) return { kind: "paid", until: end, resumes: ranges[i + 1]?.[0] ?? null, end: last[1] };
    const next = ranges[i + 1];
    if (next && hhmm >= end && hhmm < next[0]) return { kind: "break", resumes: next[0], end: last[1] };
  }
  return { kind: "over", ended: last[1] };
}

function plusDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The first day after `iso` with paid hours (looks two weeks ahead). */
export function nextPaidDay(rule: PaidRule, iso: string, holidays: readonly HolidayEntry[]): DayAnswer | null {
  for (let i = 1; i <= 14; i += 1) {
    const answer = dayAnswer(rule, plusDays(iso, i), holidays);
    if (answer.ranges.length > 0) return answer;
  }
  return null;
}

/** The first public holiday after `iso`. */
export function nextHoliday(holidays: readonly HolidayEntry[], iso: string): HolidayEntry | null {
  return [...holidays].sort((a, b) => a.d.localeCompare(b.d)).find((h) => h.d > iso) ?? null;
}

/** The date and the clock time in Spain (peninsula), whatever timezone the device is in. */
export function madridClock(now: Date): { iso: string; hhmm: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { iso: `${get("year")}-${get("month")}-${get("day")}`, hhmm: `${get("hour")}:${get("minute")}` };
}

/** Minutes between two "HH:MM" times of the same day. */
export function minutesBetween(from: string, to: string): number {
  const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  return minutes(to) - minutes(from);
}
