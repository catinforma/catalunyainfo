import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { MONTHS, type DateLocale } from "./format";
import { NEXT_YEAR, SNAPSHOT } from "./data";
import { slugify } from "./slug";

/**
 * URLs of the holiday family.
 *
 *   ca  /ca/festius/                       hub, the 300 municipalities by comarca
 *       /ca/festius/<slug>/                one municipality
 *       /ca/festius/dia/8-desembre-2026/   "És festiu el 8 de desembre?"
 *   es  /es/festivos/ …  /es/festivos/dia/8-diciembre-2026/
 *   en  /en/holidays/day/8-december-2026/  (date pages only)
 *
 * Each route folder serves one locale and 404s for the others, so the
 * site-wide `[...slug]` catch-all never sees these paths.
 */

export type MuniLocale = "ca" | "es";
export const MUNI_LOCALES: readonly MuniLocale[] = ["ca", "es"];
export const DATE_LOCALES: readonly DateLocale[] = ["ca", "es", "en"];

export const ROUTE = {
  ca: { root: "festius", day: "dia" },
  es: { root: "festivos", day: "dia" },
  en: { root: "holidays", day: "day" },
} as const satisfies Record<DateLocale, { root: string; day: string }>;

/**
 * The date pages, in calendar order. Tranche 1 (27 Oct 2026): 7, 8, 25 and 26
 * December, 1 and 6 January. Tranche 2 (29 Oct 2026): 1, 11 and 30 November,
 * 24 and 31 December.
 */
export const DATE_PAGES = [
  "2026-11-01",
  "2026-11-11",
  "2026-11-30",
  "2026-12-07",
  "2026-12-08",
  "2026-12-24",
  "2026-12-25",
  "2026-12-26",
  "2026-12-31",
  "2027-01-01",
  "2027-01-06",
] as const;
export type DatePage = (typeof DATE_PAGES)[number];

export function isDatePage(iso: string): iso is DatePage {
  return (DATE_PAGES as readonly string[]).includes(iso);
}

export function hubPath(locale: MuniLocale): string {
  return `/${locale}/${ROUTE[locale].root}/`;
}

/** Id of a comarca's section on the hub: "c-baix-llobregat". */
export function comarcaAnchor(comarca: string): string {
  return `c-${slugify(comarca)}`;
}

export function municipalityPath(locale: MuniLocale, slug: string): string {
  return `/${locale}/${ROUTE[locale].root}/${slug}/`;
}

function asciiMonth(index: number, locale: DateLocale): string {
  return (MONTHS[locale][index] ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** "8-desembre-2026", "8-diciembre-2026", "8-december-2026". */
export function dateSlug(iso: string, locale: DateLocale): string {
  const date = new Date(`${iso}T12:00:00Z`);
  return `${date.getUTCDate()}-${asciiMonth(date.getUTCMonth(), locale)}-${date.getUTCFullYear()}`;
}

/** The ISO date of a date-page slug, or null if it is not one of the pages. */
export function dateFromSlug(slug: string, locale: DateLocale): DatePage | null {
  return DATE_PAGES.find((iso) => dateSlug(iso, locale) === slug) ?? null;
}

export function datePath(locale: DateLocale, iso: string): string {
  return `/${locale}/${ROUTE[locale].root}/${ROUTE[locale].day}/${dateSlug(iso, locale)}/`;
}

export function municipalityTranslations(slug: string): Record<MuniLocale, string> {
  return { ca: municipalityPath("ca", slug), es: municipalityPath("es", slug) };
}

export function hubTranslations(): Record<MuniLocale, string> {
  return { ca: hubPath("ca"), es: hubPath("es") };
}

export function dateTranslations(iso: string): Record<DateLocale, string> {
  return { ca: datePath("ca", iso), es: datePath("es", iso), en: datePath("en", iso) };
}

export interface FamilyPath {
  path: string;
  /** The dataset's own date: when the data behind the page was last read. */
  lastModified: string;
  translations: Partial<Record<DateLocale, string>>;
}

/** Every URL of the family, for the sitemap and for IndexNow. */
export function holidayFamilyPaths(): FamilyPath[] {
  const localDate = NEXT_YEAR.readOn ?? SNAPSHOT.readOn;
  const out: FamilyPath[] = [];
  for (const locale of MUNI_LOCALES) {
    out.push({ path: hubPath(locale), lastModified: localDate, translations: hubTranslations() });
    for (const m of SNAPSHOT.municipalities) {
      out.push({ path: municipalityPath(locale, m.slug), lastModified: localDate, translations: municipalityTranslations(m.slug) });
    }
  }
  for (const locale of DATE_LOCALES) {
    for (const iso of DATE_PAGES) {
      out.push({ path: datePath(locale, iso), lastModified: SNAPSHOT.readOn, translations: dateTranslations(iso) });
    }
  }
  return out;
}

/**
 * Sitemap entries, with the same hreflang rules as the rest of the site:
 * every existing edition plus `x-default` (English when it exists, else
 * Catalan). The caller (`app/sitemap.ts`) already returns nothing when
 * indexing is not allowed.
 */
export function holidaySitemapEntries(): MetadataRoute.Sitemap {
  return holidayFamilyPaths().map((entry) => {
    const languages: Record<string, string> = {};
    for (const locale of DATE_LOCALES) {
      const href = entry.translations[locale];
      if (href) languages[locale] = absoluteUrl(href);
    }
    const fallback = entry.translations.en ?? entry.translations.ca;
    if (fallback) languages["x-default"] = absoluteUrl(fallback);
    return {
      url: absoluteUrl(entry.path),
      lastModified: new Date(`${entry.lastModified}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages },
    };
  });
}
