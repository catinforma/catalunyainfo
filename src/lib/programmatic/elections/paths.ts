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

export const hubPath = (locale: Locale): string => `/${locale}/${ELECTIONS_SEGMENT[locale]}/`;

export const electionPath = (locale: Locale, slug: string): string => `/${locale}/${ELECTIONS_SEGMENT[locale]}/${slug}/`;
