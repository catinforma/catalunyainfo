/**
 * Metadata and sitemap entries of the butane price page. Pure: `day` (Madrid,
 * ISO) is an argument; the route reads the clock (server.ts).
 */

import type { Metadata, MetadataRoute } from "next";

import { HTML_LANG, LOCALES, X_DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { butaneDescription, butaneTitle } from "./copy";
import { butanePath, butaneTranslations } from "./paths";
import { butaneState, lastChange } from "./rules";

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

export function butaneMetadata(locale: Locale, day: string): Metadata {
  const state = butaneState(day);
  return buildMetadata({
    locale,
    path: butanePath(locale),
    title: butaneTitle(locale, state, day),
    description: butaneDescription(locale, state, day),
    translations: butaneTranslations(),
    type: "website",
  });
}

/** The three editions (sitemap, IndexNow, llms.txt checks). */
export function butaneFamilyPaths(): { path: string; translations: Record<Locale, string> }[] {
  return LOCALES.map((locale) => ({ path: butanePath(locale), translations: butaneTranslations() }));
}

/** lastModified = the last revision published, revision applied or tax period started, up to `day`. */
export function butaneSitemapEntries(day: string): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  const lastModified = new Date(`${lastChange(day)}T00:00:00Z`);
  return butaneFamilyPaths().map((entry) => {
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) languages[HTML_LANG[locale]] = absoluteUrl(entry.translations[locale]);
    languages["x-default"] = absoluteUrl(entry.translations[X_DEFAULT_LOCALE]);
    return {
      url: absoluteUrl(entry.path),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: entry.path === butanePath("es") ? 0.8 : 0.6,
      alternates: { languages },
    };
  });
}
