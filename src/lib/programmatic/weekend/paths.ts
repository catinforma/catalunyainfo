/**
 * URLs of the weekend-per-zone family. No data here, so a guide or a block can
 * link to a page without pulling the snapshot into its bundle.
 *
 *   ca  /ca/cap-de-setmana/            hub: fairs and markets this weekend, all zones
 *       /ca/cap-de-setmana/<zona>/     girona, costa-brava, pirineu, barcelona…
 *   es  /es/fin-de-semana/             the same
 *       /es/fin-de-semana/<zona>/      girona, costa-brava, pirineo, costa-dorada…
 *   en  /en/weekend/                   hub (since 18 Nov 2026)
 *       /en/weekend/barcelona/         Barcelona only: the zone with English demand
 *
 * Each route folder serves one locale and 404s for the others, so the
 * site-wide `[...slug]` catch-all never sees these paths.
 */

import { WEEKEND_LOCALES, type WeekendLocale, type ZoneDef, type ZoneId } from "./zones";

/** The editions of one weekend page: Catalan and Spanish always, English for the hub and ENGLISH_ZONES. */
export interface WeekendTranslations {
  ca: string;
  es: string;
  en?: string;
}

export const ENGLISH_ROUTE = "weekend";

/** Zones with an English edition. Barcelona: "things to do in Barcelona this weekend" is an English search; the comarques are not. */
export const ENGLISH_ZONES: readonly ZoneId[] = ["barcelona"];

export function englishHubPath(): string {
  return `/en/${ENGLISH_ROUTE}/`;
}

/** The English page of a zone, or null when it has none. Its slug is the Catalan one ("barcelona"). */
export function englishZonePath(zone: Pick<ZoneDef, "id" | "slug">): string | null {
  return ENGLISH_ZONES.includes(zone.id) ? `/en/${ENGLISH_ROUTE}/${zone.slug.ca}/` : null;
}

export const WEEKEND_ROUTE: Record<WeekendLocale, string> = { ca: "cap-de-setmana", es: "fin-de-semana" };

export function weekendHubPath(locale: WeekendLocale): string {
  return `/${locale}/${WEEKEND_ROUTE[locale]}/`;
}

export function zonePath(locale: WeekendLocale, zone: Pick<ZoneDef, "slug">): string {
  return `/${locale}/${WEEKEND_ROUTE[locale]}/${zone.slug[locale]}/`;
}

export function hubTranslations(): WeekendTranslations {
  return { ca: weekendHubPath("ca"), es: weekendHubPath("es"), en: englishHubPath() };
}

export function zoneTranslations(zone: Pick<ZoneDef, "id" | "slug">): WeekendTranslations {
  const en = englishZonePath(zone);
  return en ? { ca: zonePath("ca", zone), es: zonePath("es", zone), en } : { ca: zonePath("ca", zone), es: zonePath("es", zone) };
}

export function isWeekendLocale(value: string): value is WeekendLocale {
  return (WEEKEND_LOCALES as readonly string[]).includes(value);
}
