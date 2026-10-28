/**
 * When the weekend pages must be rebuilt.
 *
 * The pages are static (`revalidate = false`) and carry the weekend's dates
 * in their title and headings, computed when they render. Everything else on
 * them comes from the committed snapshot, and this weekend's activities are
 * read in the browser. So the HTML changes only when the weekend window does:
 * on the Monday after a weekend (or the Tuesday, when the Monday is a holiday
 * and still part of it).
 *
 * The nightly cron (`api/cron/publish-scheduled`, 23:05 UTC, which is already
 * the next day in Madrid) asks `weekendRefreshDue` and, on those nights,
 * revalidates the family's paths. It also does so on the following night, so
 * one failed cron run does not leave a past weekend in a title for a week.
 * About 2 nights a week x 22 URLs: ~190 renders a month, each a static page
 * with no fetch.
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
