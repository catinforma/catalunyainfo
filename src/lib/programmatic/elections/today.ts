/**
 * "Today" for the 29N slot, computed in the browser. The server HTML carries a
 * neutral line that is true on any date; the client replaces it with the
 * countdown, the day itself or the past tense. Pure, so it is tested with
 * fixed instants on both sides of midnight in Madrid.
 */

/** Polling day of the general election called by Real Decreto 806/2026 (BOE 6 Oct 2026). */
export const GENERAL_ELECTION_DAY = "2026-11-29";

/** The calendar date in Madrid at instant `now`, as YYYY-MM-DD. */
export function madridDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Whole calendar days from `from` to `to` (both YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

export type DayStatus = { kind: "before"; days: number } | { kind: "today" } | { kind: "after"; days: number };

export function electionDayStatus(today: string, day: string = GENERAL_ELECTION_DAY): DayStatus {
  const days = daysBetween(today, day);
  if (days > 0) return { kind: "before", days };
  if (days === 0) return { kind: "today" };
  return { kind: "after", days: -days };
}

export interface DayLines {
  /** Server-rendered, true on any date. */
  fallback: string;
  /** "{days}" is replaced by the number of days left. */
  before: string;
  /** The day before. */
  beforeOne: string;
  today: string;
  after: string;
}

/** The status line for a Madrid date; `null` (no date yet: server, no JS) gives the fallback. */
export function dayLine(today: string | null, lines: DayLines, day: string = GENERAL_ELECTION_DAY): string {
  if (!today) return lines.fallback;
  const status = electionDayStatus(today, day);
  if (status.kind === "today") return lines.today;
  if (status.kind === "after") return lines.after;
  return status.days === 1 ? lines.beforeOne : lines.before.replace("{days}", String(status.days));
}
