import type { Locale } from "@/lib/i18n/config";

/**
 * URL shape of the election-results family. Kept apart from the snapshot so
 * that guides linking to the hub do not pull the data into their bundle.
 *
 *   /ca/eleccions/                       hub, every town by comarca
 *   /ca/eleccions/<slug>/                one municipality
 *   /ca/eleccions/comarca/<slug>/        one comarca: every town's 2023 result in a table
 *   /es/elecciones/ …  /es/elecciones/comarca/<slug>/
 *   /en/elections/ …   (towns only: no comarca pages in English)
 */
export const ELECTIONS_SEGMENT: Record<Locale, string> = {
  ca: "eleccions",
  es: "elecciones",
  en: "elections",
};

/** The static segment of the comarca pages. No municipality's slug is "comarca" (tested). */
export const COMARCA_SEGMENT = "comarca";

/** The languages with comarca pages: those with a page for every municipality. */
export type ComarcaLocale = "ca" | "es";
export const COMARCA_LOCALES: readonly ComarcaLocale[] = ["ca", "es"];

/**
 * How many municipalities get a page in each language: every municipality
 * in Catalonia (947) in Catalan and Spanish since tranche 3 (30 Oct 2026);
 * in English the big towns and the resorts (see `EN_RESORTS` in `english.ts`).
 * Here so the guides can quote the numbers; a test holds them to the snapshot.
 */
export const PAGES_PER_LOCALE: Record<Locale, number> = { ca: 947, es: 947, en: 30 };

/** Catalonia's municipalities: the Catalan and Spanish editions cover them all. */
export const ALL_MUNICIPALITIES = PAGES_PER_LOCALE.ca;

export const hubPath = (locale: Locale): string => `/${locale}/${ELECTIONS_SEGMENT[locale]}/`;

export const electionPath = (locale: Locale, slug: string): string => `/${locale}/${ELECTIONS_SEGMENT[locale]}/${slug}/`;

export const comarcaPath = (locale: ComarcaLocale, slug: string): string => `/${locale}/${ELECTIONS_SEGMENT[locale]}/${COMARCA_SEGMENT}/${slug}/`;

export const isComarcaLocale = (locale: Locale): locale is ComarcaLocale => locale === "ca" || locale === "es";
