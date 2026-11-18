import type { Locale } from "@/lib/i18n/config";

/**
 * URLs of the "warnings in force" page. No data here.
 *
 *   ca  /ca/avisos/     "Avisos ara a Catalunya"
 *   es  /es/avisos/     "Avisos hoy en Cataluña"
 *   en  /en/warnings/   "Warnings in Catalonia now"
 *
 * Catalan and Spanish share the word, so `app/(public)/[locale]/avisos`
 * serves both and `warnings` serves English; any other locale is a 404.
 * Live URLs: never change.
 */

export const WARNINGS_SEGMENT: Record<Locale, string> = { ca: "avisos", es: "avisos", en: "warnings" };

export function warningsPath(locale: Locale): string {
  return `/${locale}/${WARNINGS_SEGMENT[locale]}/`;
}

export function warningsTranslations(): Record<Locale, string> {
  return { ca: warningsPath("ca"), es: warningsPath("es"), en: warningsPath("en") };
}

/** The route folder `segment` answers the locales whose segment it is. */
export function resolveWarnings(segment: string, locale: string): Locale | null {
  const known = (["ca", "es", "en"] as const).find((l) => l === locale);
  return known && WARNINGS_SEGMENT[known] === segment ? known : null;
}

/** Compact JSON for the today page's island (CDN-cached route handler). */
export const WARNINGS_ENDPOINT = "/api/warnings/now/";
