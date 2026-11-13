import type { Locale } from "@/lib/i18n/config";

/**
 * URLs of the bottled butane price page. No data here.
 *
 *   es  /es/precio-butano/
 *   ca  /ca/preu-buta/
 *   en  /en/butane-price-spain/
 *
 * One static folder per language under `app/(public)/[locale]`, a 404 for
 * the other locales (same rule as the PVPC pages). Live URLs: never change.
 */

export const BUTANE_SEGMENT: Record<Locale, string> = {
  es: "precio-butano",
  ca: "preu-buta",
  en: "butane-price-spain",
};

export function butanePath(locale: Locale): string {
  return `/${locale}/${BUTANE_SEGMENT[locale]}/`;
}

export function butaneTranslations(): Record<Locale, string> {
  return { ca: butanePath("ca"), es: butanePath("es"), en: butanePath("en") };
}

/** The route of `route` answers only its own locale. */
export function resolveButane(route: Locale, locale: string): Locale | null {
  return route === locale ? route : null;
}
