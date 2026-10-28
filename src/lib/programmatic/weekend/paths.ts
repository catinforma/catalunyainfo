/**
 * URLs of the weekend-per-zone family. No data here, so a guide or a block can
 * link to a page without pulling the snapshot into its bundle.
 *
 *   ca  /ca/cap-de-setmana/            hub: fairs and markets this weekend, all zones
 *       /ca/cap-de-setmana/<zona>/     girona, costa-brava, pirineu, barcelona…
 *   es  /es/fin-de-semana/             the same
 *       /es/fin-de-semana/<zona>/      girona, costa-brava, pirineo, costa-dorada…
 *
 * Each route folder serves one locale and 404s for the others, so the
 * site-wide `[...slug]` catch-all never sees these paths.
 */

import { WEEKEND_LOCALES, type WeekendLocale, type ZoneDef } from "./zones";

export const WEEKEND_ROUTE: Record<WeekendLocale, string> = { ca: "cap-de-setmana", es: "fin-de-semana" };

export function weekendHubPath(locale: WeekendLocale): string {
  return `/${locale}/${WEEKEND_ROUTE[locale]}/`;
}

export function zonePath(locale: WeekendLocale, zone: Pick<ZoneDef, "slug">): string {
  return `/${locale}/${WEEKEND_ROUTE[locale]}/${zone.slug[locale]}/`;
}

export function hubTranslations(): Record<WeekendLocale, string> {
  return { ca: weekendHubPath("ca"), es: weekendHubPath("es") };
}

export function zoneTranslations(zone: Pick<ZoneDef, "slug">): Record<WeekendLocale, string> {
  return { ca: zonePath("ca", zone), es: zonePath("es", zone) };
}

export function isWeekendLocale(value: string): value is WeekendLocale {
  return (WEEKEND_LOCALES as readonly string[]).includes(value);
}
