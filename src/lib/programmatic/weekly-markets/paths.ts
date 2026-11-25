/**
 * URLs of the weekly street markets family. No data here, so a guide or a
 * block can link to a page without pulling the data into its bundle.
 *
 *   ca  /ca/mercats-setmanals/              hub
 *       /ca/mercats-setmanals/<municipi>/   one town (slug = the holiday pages' slug)
 *   es  /es/mercados-semanales/ …           the same
 *   en  /en/weekly-markets/ …               the same
 *
 * One stable URL per town: the square or neighbourhood a reader picks and
 * the day of the answer never reach the URL (state in the page only). Each
 * route folder serves one locale and 404s for the others, so the site-wide
 * `[...slug]` catch-all never sees these paths. English follows the zona
 * azul family (every language, every town): two towns, no selection needed.
 */

import type { MkLocale } from "./types";

export const MARKETS_LOCALES: readonly MkLocale[] = ["ca", "es", "en"];

export const MARKETS_ROUTE: Record<MkLocale, string> = { ca: "mercats-setmanals", es: "mercados-semanales", en: "weekly-markets" };

/** The towns of the pilot, as slugs (the data file's `TOWNS` must hold the same; a test checks). */
export const MARKET_TOWN_SLUGS = ["vic", "mataro"] as const;

export function marketsHubPath(locale: MkLocale): string {
  return `/${locale}/${MARKETS_ROUTE[locale]}/`;
}

export function marketsTownPath(locale: MkLocale, slug: string): string {
  return `/${locale}/${MARKETS_ROUTE[locale]}/${slug}/`;
}

export function marketsHubTranslations(): Record<MkLocale, string> {
  return { ca: marketsHubPath("ca"), es: marketsHubPath("es"), en: marketsHubPath("en") };
}

export function marketsTownTranslations(slug: string): Record<MkLocale, string> {
  return { ca: marketsTownPath("ca", slug), es: marketsTownPath("es", slug), en: marketsTownPath("en", slug) };
}

export function hasMarketsPage(slug: string): boolean {
  return (MARKET_TOWN_SLUGS as readonly string[]).includes(slug);
}
