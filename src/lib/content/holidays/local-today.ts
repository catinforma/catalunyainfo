import { municipalityForCode } from "@/lib/programmatic/holidays/data";

import { placesWithHolidayOn, type LocalCalendar, type LocalHolidayPlace } from "./local";

/**
 * Who has a local holiday on a given day, largest first.
 *
 * "Mañana es festivo" asks about a date, not a place (audit of 25 Nov 2026:
 * 526 impressions over 41 of our URLs). The answer for a date is the count and
 * the towns people are most likely to mean, so the list opens with the largest
 * municipalities by population (the holiday engine's own rank) and every one
 * of them links to its page. The full alphabetical list stays below it.
 *
 * A nucleus (a village inside a municipality with days of its own) ranks with
 * its municipality: its code starts with the INE code of the parent.
 */

export const LARGEST_SHOWN = 10;

export interface LocalDaySummary {
  /** Every place with a local holiday that day. */
  count: number;
  /** The largest `LARGEST_SHOWN` by population; places without a town page are never in it. */
  largest: LocalHolidayPlace[];
  /** Everything else, alphabetical as the source lists it. */
  rest: LocalHolidayPlace[];
}

export function summariseLocalDay(places: readonly LocalHolidayPlace[], shown = LARGEST_SHOWN): LocalDaySummary {
  const ranked = places.map((place, index) => ({ place, index, rank: municipalityForCode(place.key)?.rank ?? Number.POSITIVE_INFINITY }));
  ranked.sort((a, b) => a.rank - b.rank || a.index - b.index);
  const largest = ranked.filter((r) => Number.isFinite(r.rank)).slice(0, shown).map((r) => r.place);
  const inLargest = new Set(largest);
  return { count: places.length, largest, rest: places.filter((place) => !inLargest.has(place)) };
}

/**
 * Tomorrow's local holidays, or null when they cannot be known.
 *
 * Across New Year the open data for today's year says nothing about tomorrow:
 * 1 Jan 2027 is not in the 2026 calendar, and "no municipality" would be a
 * claim without data. The caller loads tomorrow's year in that case; a year
 * with no rows (not published yet) or a failed read gives null, and the page
 * shows no tomorrow line at all.
 */
export function tomorrowLocalPlaces(
  tomorrow: string,
  today: LocalCalendar,
  tomorrowYear: LocalCalendar | null,
): LocalHolidayPlace[] | null {
  const calendar = Number(tomorrow.slice(0, 4)) === today.year ? today : tomorrowYear;
  if (!calendar || calendar.year !== Number(tomorrow.slice(0, 4)) || calendar.error || calendar.places.length === 0) return null;
  return placesWithHolidayOn(calendar, tomorrow);
}
