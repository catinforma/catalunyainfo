/**
 * URLs of the El Niño lottery checker ("Comprobar Lotería del Niño"). No data
 * here: the gordo hub, the Christmas checker, the Grossa checker and the
 * prize tax calculator link it without pulling the snapshot into their bundles.
 *
 *   es  /es/comprobar-loteria-nino/
 *   ca  /ca/comprovar-loteria-nen/
 *   en  /en/check-el-nino-lottery-ticket/
 *
 *   /data/loteria-nino.json   the numbers the checker runs on, from the
 *                             committed snapshot (noindex, cacheable)
 *
 * Evergreen: the same URLs serve 2028. Each route folder serves one locale and
 * 404s for the others.
 */

import type { Locale } from "@/lib/i18n/config";

export const NINO_CHECK_LOCALES: readonly Locale[] = ["ca", "es", "en"];

export const NINO_CHECK_ROUTE: Record<Locale, string> = {
  ca: "comprovar-loteria-nen",
  es: "comprobar-loteria-nino",
  en: "check-el-nino-lottery-ticket",
};

export function ninoCheckPath(locale: Locale): string {
  return `/${locale}/${NINO_CHECK_ROUTE[locale]}/`;
}

export function ninoCheckEditions(): Record<Locale, string> {
  return { ca: ninoCheckPath("ca"), es: ninoCheckPath("es"), en: ninoCheckPath("en") };
}

/** The JSON the checker fetches in the browser (app/data/loteria-nino.json/route.ts). */
export const NINO_DATA_PATH = "/data/loteria-nino.json";
