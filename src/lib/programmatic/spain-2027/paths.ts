import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { CITIES, cityBySlug, type City } from "./cities";
import { CITIES_AS_OF } from "./cities-data";
import { COMMUNITIES, communityBySlug, type CommunityNames } from "./communities";
import { SOURCES_READ_ON } from "./sources";

/**
 * URLs of the Spain-wide 2027 calendar, Spanish only:
 *
 *   /es/festivos/2027/                        hub: every community and city, the common days, what varies
 *   /es/festivos/2027/<comunidad>/            one community or city (19 pages)
 *   /es/festivos/2027/<comunidad>/<ciudad>/   one city's local days (cities-data.ts)
 *   /es/festivos/2027/puentes/                every long weekend in Spain, and where
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

/** Sitemap entries: Spanish only, so `x-default` is the page itself. */
export function spainSitemapEntries(): MetadataRoute.Sitemap {
  const read = SOURCES_READ_ON > CITIES_AS_OF ? SOURCES_READ_ON : CITIES_AS_OF;
  const lastModified = new Date(`${read}T00:00:00Z`);
  const cities = new Set(CITIES.map((c) => cityPath(c)));
  return spainPaths().map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === spainHubPath() ? 0.7 : cities.has(path) ? 0.5 : 0.6,
    alternates: { languages: { es: absoluteUrl(path), "x-default": absoluteUrl(path) } },
  }));
}
