import type { Locale } from "@/lib/i18n/config";

/**
 * URL shape of the election-results family. Kept apart from the snapshot so
 * that guides linking to the hub do not pull the data into their bundle.
 */
export const ELECTIONS_SEGMENT: Record<Locale, string> = {
  ca: "eleccions",
  es: "elecciones",
  en: "elections",
};

/**
 * How many municipalities get a page in each language: the 300 most populous
 * in Catalan and Spanish; in English the big towns and the resorts (see
 * `EN_RESORTS` in `english.ts`). Here so the guides can quote the numbers.
 */
export const PAGES_PER_LOCALE: Record<Locale, number> = { ca: 300, es: 300, en: 30 };

export const hubPath = (locale: Locale): string => `/${locale}/${ELECTIONS_SEGMENT[locale]}/`;

export const electionPath = (locale: Locale, slug: string): string => `/${locale}/${ELECTIONS_SEGMENT[locale]}/${slug}/`;
