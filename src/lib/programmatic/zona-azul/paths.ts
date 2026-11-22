/**
 * URLs of the regulated street parking family ("zona azul" by city). No data
 * here, so a guide or a block can link to the hub without pulling the data
 * file into its bundle.
 *
 *   es  /es/zona-azul/                     hub: every city, hours and prices in one table
 *       /es/zona-azul/<ciudad>/            one city
 *   ca  /ca/zona-blava/ …                  the same
 *   en  /en/blue-zone-parking/ …           the same
 *
 * The city segment is the same slug in the three languages. Each route folder
 * serves one locale and 404s for the others, so the site-wide `[...slug]`
 * catch-all never sees these paths. Barcelona has no page here: the hub links
 * to its guide (`batch02/barcelona-practical.ts`, key `parking`).
 */

import type { ZaLocale } from "./types";

export const ZA_LOCALES: readonly ZaLocale[] = ["es", "ca", "en"];

export const ZA_ROUTE: Record<ZaLocale, string> = { es: "zona-azul", ca: "zona-blava", en: "blue-zone-parking" };

export function zaHubPath(locale: ZaLocale): string {
  return `/${locale}/${ZA_ROUTE[locale]}/`;
}

export function zaCityPath(locale: ZaLocale, slug: string): string {
  return `/${locale}/${ZA_ROUTE[locale]}/${slug}/`;
}

export function zaHubTranslations(): Record<ZaLocale, string> {
  return { es: zaHubPath("es"), ca: zaHubPath("ca"), en: zaHubPath("en") };
}

export function zaCityTranslations(slug: string): Record<ZaLocale, string> {
  return { es: zaCityPath("es", slug), ca: zaCityPath("ca", slug), en: zaCityPath("en", slug) };
}

/** The Barcelona parking guide, which stands in for a Barcelona page of this family. */
export const BARCELONA_GUIDE: Record<ZaLocale, string> = {
  es: "/es/guias/aparcar-barcelona-zona-azul-verde/",
  ca: "/ca/guies/aparcar-barcelona-zona-blava-verda/",
  en: "/en/guides/parking-in-barcelona-blue-green-zones/",
};
