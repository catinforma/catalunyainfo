/**
 * URLs of the Christmas lottery checker ("Comprobar Lotería de Navidad").
 * No data here: the gordo hub, the lottery guide and the prize tax calculator
 * link it without pulling the snapshot into their bundles.
 *
 *   es  /es/comprobar-loteria-navidad/
 *   ca  /ca/comprovar-loteria-nadal/
 *   en  /en/check-spanish-christmas-lottery-ticket/
 *
 *   /data/loteria-navidad.json   the numbers the checker runs on, from the
 *                                committed snapshot (noindex, cacheable)
 *
 * Evergreen: the same URLs serve 2027. Each route folder serves one locale and
 * 404s for the others.
 */

import type { Locale } from "@/lib/i18n/config";

export const CHECK_LOCALES: readonly Locale[] = ["ca", "es", "en"];

export const CHECK_ROUTE: Record<Locale, string> = {
  ca: "comprovar-loteria-nadal",
  es: "comprobar-loteria-navidad",
  en: "check-spanish-christmas-lottery-ticket",
};

export function checkPath(locale: Locale): string {
  return `/${locale}/${CHECK_ROUTE[locale]}/`;
}

export function checkEditions(): Record<Locale, string> {
  return { ca: checkPath("ca"), es: checkPath("es"), en: checkPath("en") };
}

/** The JSON the checker fetches in the browser (app/data/loteria-navidad.json/route.ts). */
export const CHECK_DATA_PATH = "/data/loteria-navidad.json";
