import { BOE_2026_ROWS, REGION_WIDE_LOCAL } from "@/lib/programmatic/holidays/boe-2026";
import { NEXT, YEAR, municipalityBySlug, nextYearFor, regionalDays } from "@/lib/programmatic/holidays/data";
import { municipalityPath } from "@/lib/programmatic/holidays/paths";
import { cityBySlug as spainCity, cityCalendar, local2027 } from "@/lib/programmatic/spain-2027/cities";
import { holidayName } from "@/lib/programmatic/spain-2027/copy-intl";
import { editionCityPath } from "@/lib/programmatic/spain-2027/editions";
import { cityPath as spainCityPath } from "@/lib/programmatic/spain-2027/paths";

import type { HolidayEntry } from "./logic";
import type { City, L, ZaLocale } from "./types";

/**
 * The public holidays of a city, for the "is it paid today?" answer: the days
 * the regulated parking rule calls "festivos". Nothing is typed here: the
 * national and regional days come from the BOE tables of the holidays family
 * (2026 and 2027), the local days from the same files as the city's holiday
 * page (the community's bulletin for the Spain 2027 family, the DOGC snapshot
 * for a Catalan town).
 *
 * A city whose local days of a year are not in those files gets that year
 * without them, and `localYears` says so: the page then tells the reader the
 * answer for that year does not count the two local holidays.
 */

export type HolidayKind = "national" | "regional" | "local";

export interface CityHoliday {
  date: string;
  name: L;
  kind: HolidayKind;
}

export interface CityHolidays {
  /** In date order, one row per date. */
  days: CityHoliday[];
  /** The years whose local holidays are in `days`. */
  localYears: number[];
  /** The last date the national and regional calendar covers. */
  through: string;
}

/** The two years the holidays family holds: the BOE tables of 2026 and 2027. */
export const HOLIDAY_YEARS = [2026, 2027] as const;
export const HOLIDAYS_THROUGH = "2027-12-31";

const LOCAL: L = { es: "Fiesta local", ca: "Festa local", en: "Local holiday" };

/**
 * The rows of the 2026 table still to come that the 2027 names do not cover
 * (`holidayName` translates the 2027 table's wording). A local feast keeps the
 * name its bulletin gives it, as on the holiday pages.
 */
const NAMES_2026: Record<string, { ca: string; en: string }> = {
  "Lunes siguiente al Día de la Constitución Española": { ca: "Dilluns després del Dia de la Constitució", en: "Monday after Constitution Day" },
  "San Francisco Javier": { ca: "Sant Francesc Xavier", en: "St Francis Xavier's Day" },
  "San Esteban": { ca: "Sant Esteve", en: "St Stephen's Day" },
};

function named(name: string | null): L {
  if (!name) return LOCAL;
  const own = NAMES_2026[name];
  return { es: name, ca: own?.ca ?? holidayName(name, "ca"), en: own?.en ?? holidayName(name, "en") };
}

function unique(days: CityHoliday[]): CityHoliday[] {
  const rank: Record<HolidayKind, number> = { national: 0, regional: 1, local: 2 };
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date) || rank[a.kind] - rank[b.kind]);
  return sorted.filter((d, i) => i === 0 || sorted[i - 1]!.date !== d.date);
}

function spainHolidays(region: Extract<City["holidays"], { kind: "spain" }>): CityHolidays {
  const city = spainCity(region.region, region.slug);
  if (!city) throw new Error(`zona-azul: no Spain 2027 city "${region.slug}" in ${region.region}`);
  const days: CityHoliday[] = [];
  const localYears: number[] = [];

  for (const row of BOE_2026_ROWS) {
    const code = row.marks[region.region];
    if (code) days.push({ date: row.date, name: named(row.name), kind: code === "***" ? "regional" : "national" });
  }
  for (const day of REGION_WIDE_LOCAL) {
    if (day.region === region.region) days.push({ date: day.date, name: named(day.name), kind: "local" });
  }
  if (city.local2026) {
    localYears.push(2026);
    for (const day of city.local2026.days) days.push({ date: day.date, name: named(day.name), kind: "local" });
  }

  for (const day of cityCalendar(city)) {
    days.push({ date: day.date, name: named(day.name), kind: day.kind === "local" ? "local" : day.kind === "regional" || day.kind === "island" ? "regional" : "national" });
  }
  if (local2027(city)) localYears.push(2027);

  return { days: unique(days), localYears, through: HOLIDAYS_THROUGH };
}

function cataloniaHolidays(slug: string): CityHolidays {
  const town = municipalityBySlug(slug);
  if (!town) throw new Error(`zona-azul: no Catalan municipality "${slug}" in the holidays snapshot`);
  const days: CityHoliday[] = [];
  for (const year of HOLIDAY_YEARS) {
    for (const day of regionalDays(year)) days.push({ date: day.date, name: { es: day.name.es, ca: day.name.ca, en: day.name.en }, kind: "national" });
  }
  const localYears: number[] = [YEAR];
  for (const date of town.local) days.push({ date, name: LOCAL, kind: "local" });
  const next = nextYearFor(slug);
  if (next) {
    localYears.push(NEXT);
    for (const date of next.local) days.push({ date, name: LOCAL, kind: "local" });
  }
  return { days: unique(days), localYears, through: HOLIDAYS_THROUGH };
}

const CACHE = new Map<string, CityHolidays>();

export function cityHolidays(city: City): CityHolidays {
  const hit = CACHE.get(city.slug);
  if (hit) return hit;
  const built = city.holidays.kind === "spain" ? spainHolidays(city.holidays) : cataloniaHolidays(city.holidays.slug);
  CACHE.set(city.slug, built);
  return built;
}

/** The rows the client component and the logic take: date and name in one language. */
export function holidayEntries(city: City, locale: ZaLocale): HolidayEntry[] {
  return cityHolidays(city).days.map((d) => ({ d: d.date, n: d.name[locale] }));
}

/** The city's own holiday calendar page on this site, in the page's language. */
export function holidayCalendarPath(city: City, locale: ZaLocale): string | null {
  if (city.holidays.kind === "catalonia") return municipalityBySlug(city.holidays.slug) ? municipalityPath(locale, city.holidays.slug) : null;
  const row = spainCity(city.holidays.region, city.holidays.slug);
  if (!row) return null;
  return locale === "es" ? spainCityPath(row) : editionCityPath(locale, row);
}
