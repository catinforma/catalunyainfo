import type { Locale } from "@/lib/i18n/config";

/**
 * URLs of the mountain-weather family. Kept apart from the snapshot so that
 * the guides linking here do not pull the data into their bundle.
 *
 *   /ca/temps-muntanya/              hub (ca)
 *   /es/tiempo-montana/              hub (es)
 *   /en/mountain-weather/            hub (en, the only English page)
 *   /ca/temps-muntanya/la-molina/    one place (ca)
 *   /es/tiempo-montana/la-molina/    one place (es)
 *
 * Each folder under `app/(public)/[locale]` serves one locale; any other
 * `[locale]` value is a 404, so the `[...slug]` catch-all never sees these.
 */

export type PlaceLocale = "ca" | "es";
export const PLACE_LOCALES: readonly PlaceLocale[] = ["ca", "es"];

export const SEGMENT: Record<Locale, string> = {
  ca: "temps-muntanya",
  es: "tiempo-montana",
  en: "mountain-weather",
};

export function isPlaceLocale(value: string): value is PlaceLocale {
  return (PLACE_LOCALES as readonly string[]).includes(value);
}

export const hubPath = (locale: Locale): string => `/${locale}/${SEGMENT[locale]}/`;

export const placePath = (locale: PlaceLocale, slug: string): string => `/${locale}/${SEGMENT[locale]}/${slug}/`;

export function hubTranslations(): Record<Locale, string> {
  return { ca: hubPath("ca"), es: hubPath("es"), en: hubPath("en") };
}

export function placeTranslations(slug: string): Record<PlaceLocale, string> {
  return { ca: placePath("ca", slug), es: placePath("es", slug) };
}
