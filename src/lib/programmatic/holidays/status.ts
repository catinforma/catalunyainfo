import { addDays, daysBetween } from "./format";

/**
 * "Is today a holiday here?", computed in the browser.
 *
 * The pages are static HTML with no date of their own, so "today" can only be
 * known where the reader is. This module is the whole of that logic: pure,
 * small enough for the client bundle, and tested against the timezone edges
 * (a reader in Catalonia at 00:30 on a holiday is on the holiday, whatever
 * the device clock's zone says) and against the end of the published data.
 */

export type DayKind = "catalonia" | "local" | "aran";

export interface DayInfo {
  /** ISO date. */
  d: string;
  k: DayKind;
  /** Display name, already localised. */
  n: string;
}

export interface Coverage {
  /** Last date for which the Catalonia-wide calendar is published. */
  regionalThrough: string;
  /** Last date for which this place's local holidays are published. */
  localThrough: string;
}

/** Today in Catalonia, as YYYY-MM-DD, whatever timezone the device is in. */
export function todayInMadrid(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export type DayAnswer =
  /** A published holiday. */
  | { state: "holiday"; date: string; holiday: DayInfo }
  /** Covered by both calendars and not a holiday. */
  | { state: "working"; date: string }
  /** Not a Catalonia-wide holiday, but this place's local days are not published yet. */
  | { state: "local-unknown"; date: string }
  /** Beyond every published calendar. */
  | { state: "unknown"; date: string };

export function answerFor(date: string, days: readonly DayInfo[], coverage: Coverage): DayAnswer {
  const holiday = days.find((day) => day.d === date);
  if (holiday) return { state: "holiday", date, holiday };
  if (date > coverage.regionalThrough) return { state: "unknown", date };
  if (date > coverage.localThrough) return { state: "local-unknown", date };
  return { state: "working", date };
}

export interface Status {
  today: DayAnswer;
  tomorrow: DayAnswer;
  /** The next published holiday strictly after today, if any. */
  next: { holiday: DayInfo; inDays: number } | null;
  /**
   * True when the next holiday shown lies beyond the published local days,
   * so an unpublished local holiday could come first.
   */
  nextMayBeEarlier: boolean;
  /** True when today is after every published date: there is nothing left to show. */
  pastLastDate: boolean;
}

export function statusFor(today: string, days: readonly DayInfo[], coverage: Coverage): Status {
  const sorted = [...days].sort((a, b) => a.d.localeCompare(b.d));
  const upcoming = sorted.find((day) => day.d > today) ?? null;
  const last = sorted.at(-1)?.d ?? "";
  return {
    today: answerFor(today, sorted, coverage),
    tomorrow: answerFor(addDays(today, 1), sorted, coverage),
    next: upcoming ? { holiday: upcoming, inDays: daysBetween(today, upcoming.d) } : null,
    nextMayBeEarlier: upcoming !== null && upcoming.d > coverage.localThrough,
    pastLastDate: last !== "" && today > last,
  };
}
