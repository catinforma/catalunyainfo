import type { MetadataRoute } from "next";

import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { familyLastChecked, lastChecked, towns } from "./data";
import { FAIRS_LOCALES, fairsHubPath, hubTranslations, townPath, townTranslations, type FairsLocale } from "./paths";

export interface ChristmasFairsPath {
  path: string;
  /** The day the data behind the page was last read. */
  lastModified: string;
  translations: Partial<Record<FairsLocale, string>>;
}

/** Every URL of the family, hubs first (for the sitemap and IndexNow). */
export function christmasFairsPaths(): ChristmasFairsPath[] {
  const out: ChristmasFairsPath[] = [];
  const hubDate = familyLastChecked();
  for (const locale of FAIRS_LOCALES) {
    out.push({ path: fairsHubPath(locale), lastModified: hubDate, translations: hubTranslations() });
    for (const town of towns()) {
      const translations = townTranslations(town);
      if (!translations[locale]) continue;
      out.push({ path: townPath(locale, town.slug), lastModified: lastChecked(town), translations });
    }
  }
  return out;
}

/**
 * Sitemap entries with hreflang alternates, the same rules as `buildAlternates`:
 * every edition that exists, and x-default to English when there is one, else
 * Catalan. Nothing on a deployment that may not be indexed.
 */
export function christmasFairsSitemapEntries(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  return christmasFairsPaths().map((entry) => {
    const languages: Record<string, string> = {};
    for (const locale of FAIRS_LOCALES) {
      const href = entry.translations[locale];
      if (href) languages[locale] = absoluteUrl(href);
    }
    languages["x-default"] = absoluteUrl(entry.translations.en ?? entry.translations.ca!);
    return {
      url: absoluteUrl(entry.path),
      lastModified: new Date(`${entry.lastModified}T00:00:00Z`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: { languages },
    };
  });
}
