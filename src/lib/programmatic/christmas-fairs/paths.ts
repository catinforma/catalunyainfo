/**
 * URLs of the Christmas fairs family. No data here, so a guide or a block can
 * link to the hub without pulling the snapshot into its bundle.
 *
 *   ca  /ca/fires-de-nadal/                 hub: every dated fair of the season, by date and by town
 *       /ca/fires-de-nadal/<municipi>/      one town (slug = the holiday pages' slug)
 *   es  /es/mercados-navidad/ …             the same
 *   en  /en/christmas-markets/              hub
 *       /en/christmas-markets/<town>/       only the towns in EN_TOWNS that have a dated fair
 *
 * Each route folder serves one locale and 404s for the others, so the
 * site-wide `[...slug]` catch-all never sees these paths.
 */

import type { Locale } from "@/lib/i18n/config";

export type FairsLocale = Locale;
export const FAIRS_LOCALES: readonly FairsLocale[] = ["ca", "es", "en"];

export const FAIRS_ROUTE: Record<FairsLocale, string> = { ca: "fires-de-nadal", es: "mercados-navidad", en: "christmas-markets" };

/**
 * Towns with an English-speaking visitor audience in December: Barcelona, the
 * three other cities with the tourist trade (Girona, Tarragona, Figueres) and
 * Sitges and Vic. They get an English page only while they have a dated fair.
 */
export const EN_TOWNS: readonly string[] = ["08019", "17079", "43148", "08270", "17066", "08298"];

export function fairsHubPath(locale: FairsLocale): string {
  return `/${locale}/${FAIRS_ROUTE[locale]}/`;
}

export function townPath(locale: FairsLocale, slug: string): string {
  return `/${locale}/${FAIRS_ROUTE[locale]}/${slug}/`;
}

export function hubTranslations(): Record<FairsLocale, string> {
  return { ca: fairsHubPath("ca"), es: fairsHubPath("es"), en: fairsHubPath("en") };
}

/** The editions a town page has: ca and es always, en for the EN_TOWNS. */
export function townTranslations(town: { slug: string; ine: string }): Partial<Record<FairsLocale, string>> {
  const out: Partial<Record<FairsLocale, string>> = { ca: townPath("ca", town.slug), es: townPath("es", town.slug) };
  if (EN_TOWNS.includes(town.ine)) out.en = townPath("en", town.slug);
  return out;
}

export function isFairsLocale(value: string): value is FairsLocale {
  return (FAIRS_LOCALES as readonly string[]).includes(value);
}
