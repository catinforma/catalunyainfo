/**
 * Metadata and sitemap entries of the warnings page. Pure.
 *
 * Title and description are static on purpose: a search snippet is cached
 * for days, and a count of warnings in it ("3 avisos…") would soon be wrong.
 * The live answer is in the page's first lines instead.
 */

import type { Metadata, MetadataRoute } from "next";

import { HTML_LANG, LOCALES, X_DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { words } from "./copy";
import { warningsPath, warningsTranslations } from "./paths";

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

export function warningsMetadata(locale: Locale): Metadata {
  const w = words(locale);
  return buildMetadata({ locale, path: warningsPath(locale), title: w.title, description: w.description, translations: warningsTranslations(), type: "website" });
}

/** The three editions (sitemap, IndexNow, llms.txt checks). */
export function warningsFamilyPaths(): { path: string; translations: Record<Locale, string> }[] {
  return LOCALES.map((locale) => ({ path: warningsPath(locale), translations: warningsTranslations() }));
}

/** lastModified = the start of the sitemap's hour: the content changes every few minutes. */
export function warningsSitemapEntries(now: number): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  const lastModified = new Date(Math.floor(now / 3_600_000) * 3_600_000);
  return warningsFamilyPaths().map((entry) => {
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) languages[HTML_LANG[locale]] = absoluteUrl(entry.translations[locale]);
    languages["x-default"] = absoluteUrl(entry.translations[X_DEFAULT_LOCALE]);
    return {
      url: absoluteUrl(entry.path),
      lastModified,
      changeFrequency: "hourly" as const,
      priority: 0.7,
      alternates: { languages },
    };
  });
}
