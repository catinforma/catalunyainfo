/**
 * URLs of the La Grossa de Cap d'Any checker ("Comprovar La Grossa de Cap
 * d'Any"). No data here: the lottery guide, the gordo hub and the prize tax
 * calculator link it without pulling the snapshot into their bundles.
 *
 *   ca  /ca/comprovar-la-grossa-cap-d-any/
 *   es  /es/comprobar-la-grossa-cap-d-any/
 *   en  /en/check-la-grossa-ticket/
 *
 *   /data/grossa-cap-d-any.json   the winning numbers the checker runs on, from
 *                                 the committed snapshot (noindex, cacheable)
 *
 * Evergreen: the same URLs serve 2027. Each route folder serves one locale and
 * 404s for the others.
 */

import type { Locale } from "@/lib/i18n/config";

export const GROSSA_CHECK_LOCALES: readonly Locale[] = ["ca", "es", "en"];

export const GROSSA_CHECK_ROUTE: Record<Locale, string> = {
  ca: "comprovar-la-grossa-cap-d-any",
  es: "comprobar-la-grossa-cap-d-any",
  en: "check-la-grossa-ticket",
};

export function grossaCheckPath(locale: Locale): string {
  return `/${locale}/${GROSSA_CHECK_ROUTE[locale]}/`;
}

export function grossaCheckEditions(): Record<Locale, string> {
  return { ca: grossaCheckPath("ca"), es: grossaCheckPath("es"), en: grossaCheckPath("en") };
}

/** The JSON the checker fetches in the browser (app/data/grossa-cap-d-any.json/route.ts). */
export const GROSSA_DATA_PATH = "/data/grossa-cap-d-any.json";
