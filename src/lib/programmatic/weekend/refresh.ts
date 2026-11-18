/**
 * When the weekend pages must be rebuilt.
 *
 * Since 18 Nov 2026 the pages regenerate every hour (`revalidate = 3600`):
 * this weekend's activities are read on the server (`agenda-server.ts`) and
 * the weekend's dates in their title and headings are computed when they
 * render. The window still changes only on the Monday after a weekend (or the
 * Tuesday, when the Monday is a holiday and still part of it), and the first
 * hourly regeneration after it would carry the new dates anyway; the cron
 * refresh below stays as a belt-and-braces rebuild on that night.
 *
 * The nightly cron (`api/cron/publish-scheduled`, 23:05 UTC, which is already
 * the next day in Madrid) asks `weekendRefreshDue` and, on those nights,
 * revalidates the family's paths. It also does so on the following night, so
 * one failed cron run does not leave a past weekend in a title for a week.
 */

import { addDays } from "@/lib/content/holidays/calendar";
import { weekendWindow, type WeekendWindow } from "@/lib/content/weekend/agenda";

const sameWindow = (a: WeekendWindow, b: WeekendWindow) => a.from === b.from && a.to === b.to;

/** True on the night the window changed and on the night after (Europe/Madrid dates). */
export function weekendRefreshDue(today: string): boolean {
  return !sameWindow(weekendWindow(today), weekendWindow(addDays(today, -2)));
}

/** The first day on which today's window was already the current one: when the pages last changed. */
export function windowStartedOn(today: string): string {
  const current = weekendWindow(today);
  let day = today;
  for (let i = 0; i < 14 && sameWindow(weekendWindow(addDays(day, -1)), current); i++) day = addDays(day, -1);
  return day;
}
