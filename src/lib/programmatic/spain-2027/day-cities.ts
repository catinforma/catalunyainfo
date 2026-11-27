import type { DateLocale } from "@/lib/programmatic/holidays/format";
import { isLowDemandPath } from "@/lib/seo/low-demand";

import { CITIES, localDays, type City } from "./cities";
import { editionCityName, editionCityPath } from "./editions";
import { cityPath } from "./paths";

/**
 * 27 Nov 2026 (internal-link audit, round 3; docs/SEO_EXPERIMENTS.md): the
 * Spain 2027 city pages (236 with impressions, 32,400 in 28 days, mostly at
 * position 7-10) were linked only from their own family (the hub, their
 * community page, neighbour cities). A reader of "¿Es festivo el 8 de
 * septiembre de 2027?" wants to know where: the day page names the
 * communities, and now also the cities whose 2027 local days, as the site
 * already holds them (cities-data.ts, read on each bulletin or council act),
 * fall on that date. Nothing typed twice: the list is computed.
 *
 * Every city is named; only the pages Google keeps in that language are
 * linked (the ca and en city pages are mostly noindex, low-demand.ts), so the
 * count is the same in the three languages.
 */

export interface DayCity {
  city: City;
  name: string;
  /** Null when that language's city page is out of the index (low-demand.ts): the name is printed without a link. */
  href: string | null;
}

/** Cities whose 2027 local days (the main area's, when the bulletin splits the municipality) include `iso`, most populous first. */
export function localCitiesOn(iso: string): City[] {
  return CITIES.filter((c) => localDays(c).some((d) => d.date === iso)).sort((a, b) => b.population - a.population || a.slug.localeCompare(b.slug));
}

export function dayCityLinks(iso: string, locale: DateLocale, today?: string): DayCity[] {
  return localCitiesOn(iso).map((city) => {
    const path = locale === "es" ? cityPath(city) : editionCityPath(locale, city);
    return { city, name: locale === "es" ? city.name : editionCityName(city, locale), href: isLowDemandPath(path, today) ? null : path };
  });
}

/** The heading and the one line above the list, per language. */
export const DAY_CITIES_UI: Record<DateLocale, { heading: (day: string, n: number) => string; intro: string }> = {
  ca: {
    heading: (day, n) => `Ciutats amb festa local el ${day} (${n})`,
    intro: "Segons les festes locals del 2027 publicades per a cada ciutat; a la pàgina de cada una hi ha totes les seves festes locals i la font.",
  },
  es: {
    heading: (day, n) => `Ciudades con fiesta local el ${day} (${n})`,
    intro: "Según las fiestas locales de 2027 publicadas para cada ciudad; en la página de cada una están todas sus fiestas locales y la fuente.",
  },
  en: {
    heading: (day, n) => `Cities with a local holiday on ${day} (${n})`,
    intro: "From each city's published 2027 local holidays; each city's page has all its local holidays and the source.",
  },
};
