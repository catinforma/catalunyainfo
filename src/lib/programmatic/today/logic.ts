import { median, type LiveStation } from "@/lib/programmatic/fuel/live";
import { addDays, daysBetween, weekdayDayMonth, weekdayName } from "@/lib/programmatic/holidays/format";
import { LINE_IDS, type CompactAlert, type LineId } from "@/lib/programmatic/rodalies/types";

/**
 * Browser-side logic of "Avui a Catalunya". Pure and small: no snapshot, no
 * clock (every function takes the day it answers for), so it can ship in the
 * client bundle and be tested against fixtures. The server only embeds the
 * dated lists below in the page; which of their days is "today" is decided
 * here, in the browser, in Europe/Madrid.
 */

export type TodayLocale = "ca" | "es" | "en";

/**
 * The three live endpoints the page reads, all existing CDN-cached route
 * handlers (no new upstream): Rodalies' notices and the ACA's readings come
 * from their own modules' constants; this is the fuel pages' one.
 */
export const FUEL_ENDPOINT = "/api/fuel/catalonia/";

/* -------------------------------------------------------------------------- */
/* Data the server embeds                                                     */
/* -------------------------------------------------------------------------- */

/** A Catalonia-wide holiday (Generalitat's order for the year). */
export interface RegionalDay {
  d: string;
  /** Name in the page's language. */
  n: string;
  /** Not a holiday in Aran, which has the Festa d'Aran instead. */
  xa?: true;
  /** The Festa d'Aran: a holiday in Aran only. */
  ao?: true;
}

/** A place with a local holiday on a date: a municipality, or a nucleus within one. */
export interface LocalPlace {
  /** "Sant Cugat del Vallès", or the nucleus: "Valldoreix". */
  n: string;
  /** The municipality's holiday page in this language; null where there is none (English). */
  h: string | null;
  /** The municipality a nucleus belongs to; null for the municipality itself. */
  p: string | null;
}

export interface HolidayData {
  /** First day the embedded lists cover: the snapshot's read date. */
  from: string;
  regional: RegionalDay[];
  /** Last day of the published Catalonia-wide calendar. */
  regionalThrough: string;
  /** Local holidays of the listed municipalities, by date, largest towns first. */
  local: Record<string, LocalPlace[]>;
  /** Last day for which local holidays are published. */
  localThrough: string;
  /** How many municipalities the local list covers (the most populous). */
  towns: number;
  /** Dates with a page of their own ("Is 7 December a holiday?"): link and places in all of Catalonia. */
  datePages: Record<string, { href: string; places: number }>;
}

export interface TodayStrike {
  id: string;
  /** Every day of strike action, ascending. */
  dates: string[];
  /** "vaga general de 24 hores". */
  title: string;
  /** One line on minimum services, as the strikes page states it. */
  ms: string;
  href: string;
}

/* -------------------------------------------------------------------------- */
/* Holidays                                                                   */
/* -------------------------------------------------------------------------- */

export function isWeekend(iso: string): boolean {
  const day = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

export interface HolidayDay {
  date: string;
  /** The Catalonia-wide holiday on this date, if any. */
  regional: RegionalDay | null;
  /** The Festa d'Aran, when this is its date. */
  aranOnly: RegionalDay | null;
  /** Listed places with a local holiday on this date (empty when unknown). */
  local: LocalPlace[];
  /** False beyond the published Catalonia-wide calendar (or before the embedded lists). */
  regionalKnown: boolean;
  /** False beyond the published local holidays. */
  localKnown: boolean;
  weekend: boolean;
}

export function holidayDay(date: string, data: HolidayData): HolidayDay {
  const regionalKnown = date >= data.from && date <= data.regionalThrough;
  const localKnown = date >= data.from && date <= data.localThrough;
  return {
    date,
    regional: data.regional.find((day) => day.d === date && !day.ao) ?? null,
    aranOnly: data.regional.find((day) => day.d === date && day.ao) ?? null,
    local: localKnown ? (data.local[date] ?? []) : [],
    regionalKnown,
    localKnown,
    weekend: isWeekend(date),
  };
}

/** Catalonia-wide holidays only (the Festa d'Aran is not one). */
function regionalDates(data: Pick<HolidayData, "regional">): Set<string> {
  return new Set(data.regional.filter((day) => !day.ao).map((day) => day.d));
}

/** The next Catalonia-wide holiday strictly after `today`. */
export function nextRegional(today: string, data: Pick<HolidayData, "regional">): { day: RegionalDay; inDays: number } | null {
  const day = data.regional.filter((d) => !d.ao && d.d > today).sort((a, b) => a.d.localeCompare(b.d))[0];
  return day ? { day, inDays: daysBetween(today, day.d) } : null;
}

/**
 * The weekend a reader means on `today`, exactly as the weekend agenda
 * computes it (`weekendWindow` in lib/content/weekend/agenda.ts; a test holds
 * the two together): Monday to Thursday the coming one, Friday to Sunday the
 * one they are in, stretched over a Catalonia-wide holiday on the Friday
 * before or the Monday after.
 */
export function weekendFor(today: string, data: Pick<HolidayData, "regional">): { from: string; to: string; long: boolean } {
  const holidays = regionalDates(data);
  const holidayOn = (iso: string) => holidays.has(iso);
  const day = weekday(today);
  let friday: string;
  if (day === 5) friday = today;
  else if (day === 6) friday = addDays(today, -1);
  else if (day === 0) friday = addDays(today, -2);
  else if (day === 1 && holidayOn(today)) friday = addDays(today, -3);
  else friday = addDays(today, 5 - day);

  let from = friday;
  let to = addDays(friday, 2);
  let long = false;
  if (holidayOn(addDays(to, 1))) {
    to = addDays(to, 1);
    long = true;
  }
  if (holidayOn(addDays(from, -1)) || holidayOn(from)) {
    if (holidayOn(addDays(from, -1))) from = addDays(from, -1);
    long = true;
  }
  return { from, to, long };
}

export interface LongWeekend {
  /** First and last day off, inclusive. */
  from: string;
  to: string;
  /** The Catalonia-wide holidays inside it. */
  holidays: RegionalDay[];
  /** The working day between the weekend and the holiday that makes it a bridge ("pont"); null when no leave is needed. */
  bridge: string | null;
}

/**
 * The next run of at least three days off in a row (Saturdays, Sundays and
 * Catalonia-wide holidays) that starts after `today`: no leave needed.
 */
export function nextLongWeekend(today: string, data: Pick<HolidayData, "regional">): LongWeekend | null {
  const holidays = regionalDates(data);
  const off = (iso: string) => isWeekend(iso) || holidays.has(iso);
  const named = data.regional.filter((d) => !d.ao).sort((a, b) => a.d.localeCompare(b.d));
  for (const holiday of named) {
    if (holiday.d <= today) continue;
    let from = holiday.d;
    let to = holiday.d;
    while (off(addDays(from, -1))) from = addDays(from, -1);
    while (off(addDays(to, 1))) to = addDays(to, 1);
    if (from <= today || daysBetween(from, to) + 1 < 3) continue;
    return { from, to, holidays: named.filter((d) => d.d >= from && d.d <= to), bridge: null };
  }
  return null;
}

/**
 * The next Catalonia-wide holiday on a Tuesday or a Thursday, after `today`:
 * one day of leave (the Monday before, the Friday after) makes four days off.
 */
export function nextBridge(today: string, data: Pick<HolidayData, "regional">): LongWeekend | null {
  const named = data.regional.filter((d) => !d.ao).sort((a, b) => a.d.localeCompare(b.d));
  const holidays = new Set(named.map((d) => d.d));
  for (const holiday of named) {
    const day = weekday(holiday.d);
    if (day !== 2 && day !== 4) continue;
    const bridge = day === 2 ? addDays(holiday.d, -1) : addDays(holiday.d, 1);
    if (holidays.has(bridge)) continue;
    const from = day === 2 ? addDays(holiday.d, -3) : holiday.d;
    const to = day === 2 ? holiday.d : addDays(holiday.d, 3);
    if (from <= today) continue;
    return { from, to, holidays: [holiday], bridge };
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Strikes                                                                    */
/* -------------------------------------------------------------------------- */

export function strikesOn(date: string, strikes: readonly TodayStrike[]): TodayStrike[] {
  return strikes.filter((strike) => strike.dates.includes(date));
}

/** The first strike day strictly after `after`, with its strike. */
export function nextStrike(after: string, strikes: readonly TodayStrike[]): { strike: TodayStrike; date: string } | null {
  let best: { strike: TodayStrike; date: string } | null = null;
  for (const strike of strikes) {
    const date = strike.dates.find((d) => d > after);
    if (date && (!best || date < best.date)) best = { strike, date };
  }
  return best;
}

/** Days between the list's check and `today`: past a week, the page says the list may have moved. */
export const STRIKES_STALE_DAYS = 7;

export function strikesListStale(today: string, asOf: string): boolean {
  return daysBetween(asOf, today) > STRIKES_STALE_DAYS;
}

/* -------------------------------------------------------------------------- */
/* Rodalies                                                                   */
/* -------------------------------------------------------------------------- */

export interface NoticeSummary {
  count: number;
  /** Lines named by at least one notice, in the official order. */
  lines: LineId[];
  /** Notices that name every line. */
  everyLine: boolean;
}

export function noticeSummary(alerts: readonly CompactAlert[]): NoticeSummary {
  const named = new Set(alerts.flatMap((alert) => alert.lines));
  return {
    count: alerts.length,
    lines: LINE_IDS.filter((id) => named.has(id)),
    everyLine: alerts.some((alert) => alert.lines.length >= LINE_IDS.length),
  };
}

/* -------------------------------------------------------------------------- */
/* Reservoirs                                                                 */
/* -------------------------------------------------------------------------- */

/** Reservoirs in the ACA's daily series: the total is only a total with all of them. */
export const RESERVOIR_COUNT = 9;

/**
 * The total of the ACA's reservoirs: the sum of volumes over the sum of
 * capacities (capacity = volume / percent), as the reservoir guide computes
 * it (`totals` in lib/content/reservoirs/levels.ts), only when every
 * reservoir has a reading of the same day. Null otherwise: a sum of
 * different days is not a reading.
 */
export function reservoirTotal(
  readings: readonly { date: string; percent: number; volume: number }[],
  expected: number = RESERVOIR_COUNT,
): { date: string; percent: number } | null {
  if (readings.length !== expected) return null;
  const dates = new Set(readings.map((r) => r.date));
  if (dates.size !== 1 || readings.some((r) => !(r.percent > 0) || !(r.volume >= 0))) return null;
  const volume = readings.reduce((sum, r) => sum + r.volume, 0);
  const capacity = readings.reduce((sum, r) => sum + (r.volume / r.percent) * 100, 0);
  if (!(capacity > 0)) return null;
  return { date: readings[0]!.date, percent: (volume / capacity) * 100 };
}

/* -------------------------------------------------------------------------- */
/* Fuel                                                                       */
/* -------------------------------------------------------------------------- */

export interface FuelMedians {
  e95: { median: number | null; count: number };
  goa: { median: number | null; count: number };
}

/** Median price of petrol 95 and diesel over every station in Catalonia that publishes one. */
export function fuelMedians(stations: readonly LiveStation[]): FuelMedians {
  const of = (fuel: "e95" | "goa") => {
    const prices = stations.map((s) => s[fuel]).filter((p): p is number => typeof p === "number");
    return { median: median(prices), count: prices.length };
  };
  return { e95: of("e95"), goa: of("goa") };
}

/* -------------------------------------------------------------------------- */
/* Seasons                                                                    */
/* -------------------------------------------------------------------------- */

/** Month-day window, inclusive; one whose start is after its end runs across New Year. */
export function inSeason(today: string, from: string, to: string): boolean {
  const monthDay = today.slice(5, 10);
  return from <= to ? monthDay >= from && monthDay <= to : monthDay >= from || monthDay <= to;
}

/* -------------------------------------------------------------------------- */
/* Text                                                                       */
/* -------------------------------------------------------------------------- */

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** "dissabte 5 – dimarts 8 de desembre", "Friday 25 December – Sunday 3 January". */
export function formatRange(from: string, to: string, locale: TodayLocale): string {
  if (from === to) return weekdayDayMonth(from, locale);
  if (from.slice(0, 7) === to.slice(0, 7)) return `${weekdayName(from, locale)} ${Number(from.slice(8, 10))} – ${weekdayDayMonth(to, locale)}`;
  return `${weekdayDayMonth(from, locale)} – ${weekdayDayMonth(to, locale)}`;
}

/** "A, B i C" / "A, B y C" / "A, B and C". */
export function joinList(items: readonly string[], locale: TodayLocale): string {
  if (items.length <= 1) return items.join("");
  const and = locale === "ca" ? " i " : locale === "es" ? " y " : " and ";
  return `${items.slice(0, -1).join(", ")}${and}${items.at(-1)}`;
}
