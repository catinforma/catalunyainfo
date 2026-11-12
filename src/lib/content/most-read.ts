import mostReadJson from "./most-read.json" with { type: "json" };

import type { Locale } from "@/lib/i18n/config";

/**
 * The most-read pages of each edition, from GA4 (property 554310792), written
 * by scripts/most-read.py: screen page views over 7 full days, kept only if
 * the live site answers 200 at that URL, titled with the page's live H1.
 * tests/most-read.test.ts fails when `asOf` is more than 14 days old: refresh
 * weekly with the script, commit the JSON, deploy.
 */
export interface MostReadItem {
  path: string;
  title: string;
}

interface MostReadFile {
  source: string;
  from: string;
  /** Last day counted (YYYY-MM-DD, Europe/Madrid). */
  asOf: string;
  items: Record<Locale, MostReadItem[]>;
}

export const MOST_READ = mostReadJson as MostReadFile;

/** Days after `asOf` beyond which the list is too old to print. */
export const MOST_READ_MAX_AGE_DAYS = 14;

export const MOST_READ_COPY: Record<Locale, { heading: string; asOf: (date: string) => string }> = {
  ca: { heading: "El més llegit", asOf: (date) => `Pàgines més vistes en 7 dies fins al ${date} (Google Analytics)` },
  es: { heading: "Lo más leído", asOf: (date) => `Páginas más vistas en los 7 días hasta el ${date} (Google Analytics)` },
  en: { heading: "Most read", asOf: (date) => `Most viewed pages in the 7 days to ${date} (Google Analytics)` },
};

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000);
}

/**
 * Up to `limit` items for one edition, without the page being read, or none
 * at all when the data is older than MOST_READ_MAX_AGE_DAYS on `today`: an
 * old "most read" list is worse than none.
 */
export function mostReadFor(locale: Locale, currentPath: string, today: string, limit = 4): MostReadItem[] {
  if (daysBetween(MOST_READ.asOf, today) > MOST_READ_MAX_AGE_DAYS) return [];
  return (MOST_READ.items[locale] ?? []).filter((item) => item.path !== currentPath).slice(0, limit);
}

export function mostReadAge(today: string): number {
  return daysBetween(MOST_READ.asOf, today);
}
