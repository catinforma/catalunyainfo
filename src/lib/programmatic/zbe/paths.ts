import { ZBE_LOCALES, type ZbeLocale } from "./types";

/**
 * URLs of the family. Spanish and Catalan share the segment ("ZBE" is the
 * word both languages search); English has its own. The city slug is the
 * same in the three editions.
 *
 *   /es/zbe/                      /es/zbe/<slug>/
 *   /ca/zbe/                      /ca/zbe/<slug>/
 *   /en/low-emission-zones/       /en/low-emission-zones/<slug>/
 */
export const ZBE_SEGMENT: Record<ZbeLocale, string> = { es: "zbe", ca: "zbe", en: "low-emission-zones" };

/** The two route folders under app/(public)/[locale]/. */
export type ZbeRoute = "zbe" | "low-emission-zones";

export function zbeHubPath(locale: ZbeLocale): string {
  return `/${locale}/${ZBE_SEGMENT[locale]}/`;
}

export function zbeCityPath(locale: ZbeLocale, slug: string): string {
  return `/${locale}/${ZBE_SEGMENT[locale]}/${slug}/`;
}

const editions = (path: (locale: ZbeLocale) => string): Record<ZbeLocale, string> =>
  Object.fromEntries(ZBE_LOCALES.map((locale) => [locale, path(locale)])) as Record<ZbeLocale, string>;

export function zbeHubTranslations(): Record<ZbeLocale, string> {
  return editions(zbeHubPath);
}

export function zbeCityTranslations(slug: string): Record<ZbeLocale, string> {
  return editions((locale) => zbeCityPath(locale, slug));
}
