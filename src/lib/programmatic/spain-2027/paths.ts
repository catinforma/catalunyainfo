import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { MONTHS } from "@/lib/programmatic/holidays/format";

import { COMMUNITIES, communityBySlug, type CommunityNames } from "./communities";
import { DAY_PAGES } from "./days";
import { SOURCES_READ_ON } from "./sources";

/**
 * URLs of the Spain-wide 2027 calendar, Spanish only:
 *
 *   /es/festivos/2027/                hub: every community and city, the common days, what varies
 *   /es/festivos/2027/<comunidad>/    one community or city (19 pages)
 *   /es/festivos/2027/puentes/        every long weekend in Spain, and where
 *   /es/festivos/2027/dia/19-marzo/   "¿Es festivo el 19 de marzo de 2027?", all Spain (days.ts)
 *
 * They live inside the Catalan town family's folder (`festivos`), whose
 * `[municipi]` segment would take any slug: the static `2027` folder wins
 * over it, and no municipality slug is a year. `puentes` is a static folder
 * beside `[comunidad]` and no community is called that (a test holds both).
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

export function spainBridgesPath(): string {
  return `${SPAIN_ROOT}${SPAIN_BRIDGES_SLUG}/`;
}

/*
 * "¿Es festivo el 19 de marzo de 2027?" for all Spain: /es/festivos/2027/dia/19-marzo/.
 * `dia` is a static folder beside `[comunidad]` (no community is called
 * that; a test holds it), so it also wins over the city pages'
 * `[comunidad]/[ciudad]`. The year is in the parent folder, not the slug.
 */
export const SPAIN_DAY_SLUG = "dia";

/** "19-marzo", "1-enero", "25-diciembre". */
export function spainDaySlug(iso: string): string {
  return `${Number(iso.slice(8, 10))}-${MONTHS.es[Number(iso.slice(5, 7)) - 1]}`;
}

export function spainDayPath(iso: string): string {
  return `${SPAIN_ROOT}${SPAIN_DAY_SLUG}/${spainDaySlug(iso)}/`;
}

/** The ISO date of a day-page slug in Spanish, or null (other locales, folded dates, anything else). */
export function resolveSpainDay(locale: string, slug: string): string | null {
  return spainAllowed(locale) ? (DAY_PAGES.find((iso) => spainDaySlug(iso) === slug) ?? null) : null;
}

/** Every day page is built at deploy; `locale` is always "es" (see holidays/routing.ts on why). */
export function spainDayStaticParams(): { locale: "es"; fecha: string }[] {
  return DAY_PAGES.map((iso) => ({ locale: "es" as const, fecha: spainDaySlug(iso) }));
}

/** The only locale these routes answer. */
export function spainAllowed(locale: string): boolean {
  return locale === "es";
}

export function resolveCommunity(locale: string, slug: string): CommunityNames | null {
  return spainAllowed(locale) ? communityBySlug(slug) : null;
}

/** All nineteen are built at deploy; `locale` is always "es" (see holidays/routing.ts on why). */
export function communityStaticParams(): { locale: "es"; comunidad: string }[] {
  return COMMUNITIES.map((c) => ({ locale: "es" as const, comunidad: c.slug }));
}

export function spainLocaleParams(): { locale: "es" }[] {
  return [{ locale: "es" }];
}

/** Every URL of the family, hub first: the sitemap, IndexNow and the publish group read this. */
export function spainPaths(): string[] {
  return [spainHubPath(), spainBridgesPath(), ...COMMUNITIES.map((c) => communityPath(c)), ...DAY_PAGES.map(spainDayPath)];
}

/** Sitemap entries: Spanish only, so `x-default` is the page itself. */
export function spainSitemapEntries(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${SOURCES_READ_ON}T00:00:00Z`);
  return spainPaths().map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === spainHubPath() ? 0.7 : 0.6,
    alternates: { languages: { es: absoluteUrl(path), "x-default": absoluteUrl(path) } },
  }));
}
