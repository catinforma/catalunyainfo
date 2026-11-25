import type { MetadataRoute } from "next";

import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { TOWNS, WEEKLY_MARKETS_AS_OF } from "./data";
import { MARKETS_LOCALES, marketsHubPath, marketsHubTranslations, marketsTownPath, marketsTownTranslations } from "./paths";
import type { MkLocale } from "./types";

export interface MarketsPath {
  path: string;
  /** The day the facts on the page were last read on their sources. */
  lastModified: string;
  translations: Record<MkLocale, string>;
}

/** Every URL of the family, hubs first (for the sitemap, the publish group and IndexNow). */
export function weeklyMarketsPaths(): MarketsPath[] {
  const out: MarketsPath[] = [];
  const hubDate = TOWNS.reduce((latest, t) => (t.checked > latest ? t.checked : latest), WEEKLY_MARKETS_AS_OF);
  for (const locale of MARKETS_LOCALES) out.push({ path: marketsHubPath(locale), lastModified: hubDate, translations: marketsHubTranslations() });
  for (const locale of MARKETS_LOCALES) {
    for (const town of TOWNS) out.push({ path: marketsTownPath(locale, town.slug), lastModified: town.checked, translations: marketsTownTranslations(town.slug) });
  }
  return out;
}

/**
 * Sitemap entries with hreflang alternates, the same rules as
 * `buildAlternates`: the three editions and x-default to English. Nothing on
 * a deployment that may not be indexed.
 */
export function weeklyMarketsSitemapEntries(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  return weeklyMarketsPaths().map((entry) => {
    const languages: Record<string, string> = {};
    for (const locale of MARKETS_LOCALES) languages[locale] = absoluteUrl(entry.translations[locale]);
    languages["x-default"] = absoluteUrl(entry.translations.en);
    return {
      url: absoluteUrl(entry.path),
      lastModified: new Date(`${entry.lastModified}T00:00:00Z`),
      changeFrequency: "daily" as const,
      priority: 0.6,
      alternates: { languages },
    };
  });
}
