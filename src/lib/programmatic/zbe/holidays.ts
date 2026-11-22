import { BOE_2026_ROWS } from "@/lib/programmatic/holidays/boe-2026";
import { BOE_2027_ROWS } from "@/lib/programmatic/holidays/boe-2027";
import { municipalityBySlug } from "@/lib/programmatic/holidays/data";

import type { ZbeCity } from "./types";

/**
 * The public holidays the "does it apply today?" answer knows for a city:
 * the national and regional days of its community from the BOE's 2026 and
 * 2027 lists, plus, for a Catalan municipality of the holiday family, its two
 * local days of 2026 (the 2027 local days are not published yet).
 *
 * A day missing here counts as a working day: the page then says the
 * restriction applies, which is the safe side, and prints which local
 * holidays it does not know (`localThrough`).
 */
export interface ZbeHolidays {
  days: string[];
  /** Last day the list includes the city's local holidays; null when it has none. */
  localThrough: string | null;
  /** Last day the national and regional list covers. */
  through: string;
}

export function zbeHolidays(city: Pick<ZbeCity, "region" | "holidaySlug">): ZbeHolidays {
  const days = new Set<string>();
  for (const row of [...BOE_2026_ROWS, ...BOE_2027_ROWS]) if (row.marks[city.region]) days.add(row.date);
  const local = city.holidaySlug ? (municipalityBySlug(city.holidaySlug)?.local ?? []) : [];
  for (const day of local) days.add(day);
  return { days: [...days].sort(), localThrough: local.length > 0 ? "2026-12-31" : null, through: "2027-12-31" };
}
