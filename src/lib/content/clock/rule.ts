/**
 * The summer-time rule, computed rather than listed.
 *
 * Directive 2000/84/EC (arts. 2-3) and Real Decreto 236/2002 (arts. 2-3) fix
 * the change "con carácter indefinido": summer time starts on the last Sunday
 * of March and ends on the last Sunday of October. Computing the dates from
 * that rule keeps the page right after each change without anyone editing it,
 * and the published calendars (Orden PCM/186/2022 for 2022-2026, Commission
 * communication C/2026/1660 for 2027-2031) are tested against it.
 *
 * If the EU ever abolishes the seasonal change, this module is what has to
 * go: the page would otherwise keep announcing a change that no longer exists.
 */

export type ClockChangeKind = "forward" | "back";

export interface ClockChange {
  /** ISO date (YYYY-MM-DD) of the Sunday the clocks change. */
  date: string;
  /** "forward" in March (02:00 → 03:00), "back" in October (03:00 → 02:00). */
  kind: ClockChangeKind;
}

/** The last Sunday of a month whose last day is the 31st (March, October). */
export function lastSunday(year: number, month: 3 | 10): string {
  const last = new Date(Date.UTC(year, month - 1, 31));
  const day = 31 - last.getUTCDay();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function changesInYear(year: number): ClockChange[] {
  return [
    { date: lastSunday(year, 3), kind: "forward" },
    { date: lastSunday(year, 10), kind: "back" },
  ];
}

/** The next `count` changes on or after `today` (a change day counts as next). */
export function upcomingChanges(today: string, count = 2): ClockChange[] {
  const year = Number(today.slice(0, 4));
  const all = [...changesInYear(year), ...changesInYear(year + 1), ...changesInYear(year + 2)];
  return all.filter((change) => change.date >= today).slice(0, count);
}

/** True between the March change and the October change (summer time, UTC+2). */
export function isSummerTime(today: string): boolean {
  const year = Number(today.slice(0, 4));
  return today >= lastSunday(year, 3) && today < lastSunday(year, 10);
}
