import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { MONTHS, type DateLocale } from "./format";
import { NEXT_YEAR, SNAPSHOT, byComarca, regionalDays } from "./data";
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
 * Tranche 1 (27 Oct 2026): 7, 8, 25 and 26 December, 1 and 6 January.
 * Tranche 2 (29 Oct 2026): 1, 11 and 30 November, 24 and 31 December.
 */
const TRANCHES_1_2 = [
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

/**
 * Tranche 4 (2 Nov 2026), 2027: the working days people ask about, where the
 * answer ("no, but…") is the point. Each is checked against Ordre EMT/52/2026
 * by a test: none may be a Catalonia-wide holiday. 26 December is here
 * because in 2027 it is not one (a Sunday the order leaves out).
 */
export const ASKED_2027 = [
  "2027-01-05", // eve of Reis
  "2027-03-19", // Sant Josep
  "2027-03-25", // Dijous Sant
  "2027-04-23", // Sant Jordi
  "2027-08-15", // the Assumption, a Sunday
  "2027-11-02", // the day after Tots Sants
  "2027-12-07", // between 6 and 8 December
  "2027-12-24",
  "2027-12-26", // Sant Esteve, a Sunday
  "2027-12-31",
] as const;

/**
 * Tranche 4, 2027: local days several of the largest towns share, from the
 * councils' own acts (`council-2027.ts`) until the DOGC order is parsed. A test
 * requires at least three of the forty most populous towns on each, from
 * whichever source the pages use.
 */
export const LOCAL_2027 = [
  "2027-05-17", // Pasqua Granada: Barcelona, l'Hospitalet, Badalona, Mataró…
  "2027-06-29", // Sant Pere: Reus, Rubí, Figueres…
  "2027-09-24", // La Mercè: Barcelona, l'Hospitalet…
] as const;

/**
 * Tranche 4, all of it: every Catalonia-wide day of 2027, read from the order
 * (`regionalDays(2027)`, Ordre EMT/52/2026) rather than retyped, plus the two
 * lists above; 1 and 6 January already have their tranche 1 pages.
 */
export const TRANCHE_4: readonly string[] = [...new Set([...regionalDays(2027).map((d) => d.date), ...ASKED_2027, ...LOCAL_2027])]
  .filter((iso) => !(TRANCHES_1_2 as readonly string[]).includes(iso))
  .sort();

/** The date pages, in calendar order. */
export const DATE_PAGES: readonly string[] = [...TRANCHES_1_2, ...TRANCHE_4].sort();
/** An ISO date with a page; `isDatePage` checks it. */
export type DatePage = string;

export function isDatePage(iso: string): boolean {
  return DATE_PAGES.includes(iso);
}

/** The first and last dates with a page, for the summaries that give the range (llms.txt). */
export const DATE_PAGE_RANGE = { first: DATE_PAGES[0] ?? "", last: DATE_PAGES.at(-1) ?? "" } as const;

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
