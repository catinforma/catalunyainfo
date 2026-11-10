import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { MONTHS, type DateLocale } from "@/lib/programmatic/holidays/format";
import { DATE_LOCALES, ROUTE } from "@/lib/programmatic/holidays/paths";

import { CITIES, cityBySlug, type City } from "./cities";
import { CITIES_AS_OF } from "./cities-data";
import { COMMUNITIES, communityBySlug, type CommunityNames } from "./communities";
import { DAY_PAGES } from "./days";
import { editionLanguages, editionsOf } from "./editions";
import { SOURCES_READ_ON } from "./sources";

/**
 * URLs of the Spain-wide 2027 calendar, Spanish only (but the day pages, in three languages):
 *
 *   /es/festivos/2027/                        hub: every community and city, the common days, what varies
 *   /es/festivos/2027/<comunidad>/            one community or city (19 pages)
 *   /es/festivos/2027/<comunidad>/<ciudad>/   one city's local days (cities-data.ts)
 *   /es/festivos/2027/puentes/                every long weekend in Spain, and where
 *   /es/festivos/2027/dia/19-marzo/           "¿Es festivo el 19 de marzo de 2027?", all Spain (days.ts; also ca, en)
 *
 * They live inside the Catalan town family's folder (`festivos`), whose
 * `[municipi]` segment would take any slug: the static `2027` folder wins
 * over it, and no municipality slug is a year. `puentes` is a static folder
 * beside `[comunidad]` and no community is called that (a test holds both).
 * Catalan cities have no page here: they link to their town page
 * (/es/festivos/<municipi>/). Ceuta and Melilla, one municipality each, have
 * their community page as their city page.
 *
 * Every route here keeps `dynamicParams = true`: the publish group
 * `calendario-2027-espana` revalidates these paths, and self-hosted a route
 * with `dynamicParams = false` answers 404 (NoFallbackError) once
 * regenerated (ops/vps/README.md).
 */

export const SPAIN_ROOT = "/es/festivos/2027/";
export const SPAIN_BRIDGES_SLUG = "puentes";

export function spainHubPath(): string {
  return SPAIN_ROOT;
}

export function communityPath(c: CommunityNames | string): string {
  return `${SPAIN_ROOT}${typeof c === "string" ? c : c.slug}/`;
}

/** "/es/festivos/2027/andalucia/sevilla/". */
export function cityPath(c: Pick<City, "slug" | "community">): string {
  return `${communityPath(c.community)}${c.slug}/`;
}

export function spainBridgesPath(): string {
  return `${SPAIN_ROOT}${SPAIN_BRIDGES_SLUG}/`;
}

/*
 * "¿Es festivo el 19 de marzo de 2027?" for all Spain, in the three languages:
 *
 *   ca  /ca/festius/2027/dia/19-marc/
 *   es  /es/festivos/2027/dia/19-marzo/
 *   en  /en/holidays/2027/day/19-march/
 *
 * Each lives in its language's holiday folder (holidays/paths.ts `ROUTE`),
 * as a static `2027` folder beside `[municipi]` (no town slug is a year; a
 * test holds it), then a static `dia`/`day` folder: in Spanish, beside
 * `[comunidad]` (no community is called that), so it also wins over the city
 * pages' `[comunidad]/[ciudad]`. The year is in the parent folder, not the
 * slug. Unlike the rest of this family, the day pages exist in every language.
 */
export const SPAIN_DAY_SLUG = "dia";

/** "19-marc", "19-marzo", "19-march": the month in ASCII, as the Catalan date pages spell it. */
export function spainDaySlug(iso: string, locale: DateLocale = "es"): string {
  const month = (MONTHS[locale][Number(iso.slice(5, 7)) - 1] ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${Number(iso.slice(8, 10))}-${month}`;
}

export function spainDayPath(iso: string, locale: DateLocale = "es"): string {
  return `/${locale}/${ROUTE[locale].root}/2027/${ROUTE[locale].day}/${spainDaySlug(iso, locale)}/`;
}

/** The three editions of a day page, for hreflang and the language switcher. */
export function spainDayTranslations(iso: string): Record<DateLocale, string> {
  return { ca: spainDayPath(iso, "ca"), es: spainDayPath(iso, "es"), en: spainDayPath(iso, "en") };
}

/** The ISO date of a day-page slug in the route's language, or null (another locale, a folded date, anything else). */
export function resolveSpainDay(route: DateLocale, locale: string, slug: string): string | null {
  return route === locale ? (DAY_PAGES.find((iso) => spainDaySlug(iso, route) === slug) ?? null) : null;
}

/** Every day page is built at deploy; `locale` is always the route's own (see holidays/routing.ts on why). */
export function spainDayStaticParams(route: DateLocale): { locale: DateLocale; fecha: string }[] {
  return DAY_PAGES.map((iso) => ({ locale: route, fecha: spainDaySlug(iso, route) }));
}

/** Every day page in the three languages: the sitemap, IndexNow and the publish group `calendario-2027-espana`. */
export function spainDayPaths(): string[] {
  return DATE_LOCALES.flatMap((locale) => DAY_PAGES.map((iso) => spainDayPath(iso, locale)));
}

/** Sitemap entries for the day pages: each lists its three editions, `x-default` the English one (the site's rule). */
export function spainDaySitemapEntries(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${SOURCES_READ_ON}T00:00:00Z`);
  return DATE_LOCALES.flatMap((locale) =>
    DAY_PAGES.map((iso) => {
      const t = spainDayTranslations(iso);
      return {
        url: absoluteUrl(t[locale]),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.6,
        alternates: { languages: { ca: absoluteUrl(t.ca), es: absoluteUrl(t.es), en: absoluteUrl(t.en), "x-default": absoluteUrl(t.en) } },
      };
    }),
  );
}

/** The only locale these routes answer. */
export function spainAllowed(locale: string): boolean {
  return locale === "es";
}

export function resolveCommunity(locale: string, slug: string): CommunityNames | null {
  return spainAllowed(locale) ? communityBySlug(slug) : null;
}

export function resolveCity(locale: string, comunidad: string, ciudad: string): City | null {
  const c = resolveCommunity(locale, comunidad);
  return c ? cityBySlug(c.region, ciudad) : null;
}

/** All nineteen are built at deploy; `locale` is always "es" (see holidays/routing.ts on why). */
export function communityStaticParams(): { locale: "es"; comunidad: string }[] {
  return COMMUNITIES.map((c) => ({ locale: "es" as const, comunidad: c.slug }));
}

/** Every city page is built at deploy. */
export function cityStaticParams(): { locale: "es"; comunidad: string; ciudad: string }[] {
  return CITIES.map((c) => ({ locale: "es" as const, comunidad: c.community.slug, ciudad: c.slug }));
}

export function spainLocaleParams(): { locale: "es" }[] {
  return [{ locale: "es" }];
}

/** Every URL of the family, hub first, cities last: the sitemap, IndexNow and the publish group read this. */
export function spainPaths(): string[] {
  return [spainHubPath(), spainBridgesPath(), ...COMMUNITIES.map((c) => communityPath(c)), ...CITIES.map((c) => cityPath(c))];
}

/** Sitemap entries of the Spanish edition, each with its ca and en editions (editions.ts); x-default is the English one. */
export function spainSitemapEntries(): MetadataRoute.Sitemap {
  const read = SOURCES_READ_ON > CITIES_AS_OF ? SOURCES_READ_ON : CITIES_AS_OF;
  const lastModified = new Date(`${read}T00:00:00Z`);
  const cities = new Set(CITIES.map((c) => cityPath(c)));
  return spainPaths().map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === spainHubPath() ? 0.7 : cities.has(path) ? 0.5 : 0.6,
    alternates: { languages: editionLanguages(editionsOf(path)!) },
  }));
}
