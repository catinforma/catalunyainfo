import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { MONTHS, type DateLocale } from "./format";
import { NEXT_YEAR, SNAPSHOT, byComarca } from "./data";
import { englishTowns, hasEnglishPage } from "./english";
import { slugify } from "./slug";

/**
 * URLs of the holiday family.
 *
 *   ca  /ca/festius/                       hub, every municipality by comarca
 *       /ca/festius/<slug>/                one municipality
 *       /ca/festius/comarca/alt-emporda/   one comarca: its towns and their days, in a table
 *       /ca/festius/dia/8-desembre-2026/   "És festiu el 8 de desembre?"
 *   es  /es/festivos/ …  /es/festivos/comarca/alt-emporda/ …  /es/festivos/dia/8-diciembre-2026/
 *   en  /en/holidays/                      hub: Catalonia-wide days and the English towns' local days
 *       /en/holidays/sitges/               one town, for the English selection only (english.ts)
 *       /en/holidays/day/8-december-2026/  "Is 8 December 2026 a public holiday in Catalonia?"
 *
 * Each route folder serves one locale and 404s for the others, so the
 * site-wide `[...slug]` catch-all never sees these paths.
 */

export type MuniLocale = "ca" | "es";
export const MUNI_LOCALES: readonly MuniLocale[] = ["ca", "es"];
export const DATE_LOCALES: readonly DateLocale[] = ["ca", "es", "en"];

export const ROUTE = {
  ca: { root: "festius", day: "dia", comarca: "comarca" },
  es: { root: "festivos", day: "dia", comarca: "comarca" },
  en: { root: "holidays", day: "day", comarca: null },
} as const satisfies Record<DateLocale, { root: string; day: string; comarca: string | null }>;

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

export function hubPath(locale: DateLocale): string {
  return `/${locale}/${ROUTE[locale].root}/`;
}

/** Id of a comarca's section on the hub: "c-baix-llobregat". */
export function comarcaAnchor(comarca: string): string {
  return `c-${slugify(comarca)}`;
}

/** "/ca/festius/sitges/", "/es/festivos/sitges/", "/en/holidays/sitges/" (English: the selected towns only). */
export function municipalityPath(locale: DateLocale, slug: string): string {
  return `/${locale}/${ROUTE[locale].root}/${slug}/`;
}

/** "/ca/festius/comarca/alt-emporda/": the comarca's towns and their two days, in a table. */
export function comarcaPath(locale: MuniLocale, slug: string): string {
  return `/${locale}/${ROUTE[locale].root}/${ROUTE[locale].comarca}/${slug}/`;
}

export function comarcaTranslations(slug: string): Record<MuniLocale, string> {
  return { ca: comarcaPath("ca", slug), es: comarcaPath("es", slug) };
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

/** Catalan and Spanish for every town; English too for the towns of the English selection. */
export function municipalityTranslations(slug: string): Partial<Record<DateLocale, string>> {
  return {
    ca: municipalityPath("ca", slug),
    es: municipalityPath("es", slug),
    ...(hasEnglishPage(slug) ? { en: municipalityPath("en", slug) } : {}),
  };
}

export function hubTranslations(): Record<DateLocale, string> {
  return { ca: hubPath("ca"), es: hubPath("es"), en: hubPath("en") };
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
    for (const group of byComarca()) {
      out.push({ path: comarcaPath(locale, group.slug), lastModified: localDate, translations: comarcaTranslations(group.slug) });
    }
    for (const m of SNAPSHOT.municipalities) {
      out.push({ path: municipalityPath(locale, m.slug), lastModified: localDate, translations: municipalityTranslations(m.slug) });
    }
  }
  // English: the hub and the towns of the English selection (no comarca pages).
  out.push({ path: hubPath("en"), lastModified: localDate, translations: hubTranslations() });
  for (const m of englishTowns()) {
    out.push({ path: municipalityPath("en", m.slug), lastModified: localDate, translations: municipalityTranslations(m.slug) });
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
