import type { Calendar } from "@/lib/programmatic/working-days/engine";
import { NATIONAL_ID, itemHolidays, packDates } from "@/lib/programmatic/working-days/copy";
import { workingDaysData } from "@/lib/programmatic/working-days/places";

import { calendarOf, type TfLocale } from "./copy";

/**
 * The places the traffic-fines calculator counts holidays for: all of Spain
 * (national days only), Catalonia and each other community, with exactly the
 * days the working-days calculator counts for them (its data, read from the
 * BOE lists, the DOGC orders and each region's bulletin, 2026 and 2027).
 * Local holidays are left out: the page says so and links the working-days
 * calculator, which has them town by town. Server only (the holiday modules
 * are large); the client gets the packed dates.
 */

export const CATALONIA_ID = "catalunya";

export interface FinePlace {
  id: string;
  label: string;
  /** Packed dates (working-days copy.ts packDates). */
  dates: string;
}

/** Which place the calculator opens on: Catalonia for the Catalan and English editions, all of Spain for the Spanish one. */
export const DEFAULT_PLACE: Record<TfLocale, string> = { es: NATIONAL_ID, ca: CATALONIA_ID, en: CATALONIA_ID };

export function finePlaces(locale: TfLocale): FinePlace[] {
  const data = workingDaysData(locale);
  const out: FinePlace[] = [];
  for (const group of data.groups) {
    for (const item of group.items) {
      const id = item[0];
      if (id !== NATIONAL_ID && id !== CATALONIA_ID && !id.endsWith("/all")) continue;
      // The community's own name (the group label), except for all of Spain, whose item says "national holidays only".
      const label = id === NATIONAL_ID ? item[1] : group.label;
      out.push({ id, label, dates: packDates(itemHolidays(data, item)) });
    }
  }
  return out;
}

/** The calendar of one place id (the page's examples use all of Spain). */
export function fineCalendar(locale: TfLocale, id: string): Calendar {
  const place = finePlaces(locale).find((p) => p.id === id);
  if (!place) throw new Error(`traffic fines: no place ${id}`);
  return calendarOf(place);
}

export { NATIONAL_ID, calendarOf };
