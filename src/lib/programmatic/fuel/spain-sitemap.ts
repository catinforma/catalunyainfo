import type { MetadataRoute } from "next";

import { absoluteUrl, indexingAllowed } from "@/lib/site";
import { madridMidnight } from "@/lib/programmatic/pvpc/time";

import { FUEL_HUB_LOCALES, spainHubPath, spainHubTranslations, spainProvincePath, spainProvinceTranslations, type FuelHubLocale } from "./paths";
import { SPAIN_SNAPSHOT, spainProvinces } from "./spain";

export interface SpainFamilyPath {
  path: string;
  translations: Record<FuelHubLocale, string>;
}

/** Every Spain URL of the family, the three tables first (sitemap, IndexNow, tests). */
export function spainFamilyPaths(): SpainFamilyPath[] {
  const out: SpainFamilyPath[] = [];
  for (const locale of FUEL_HUB_LOCALES) out.push({ path: spainHubPath(locale), translations: spainHubTranslations() });
  for (const locale of FUEL_HUB_LOCALES) {
    for (const p of spainProvinces()) out.push({ path: spainProvincePath(locale, p.slug), translations: spainProvinceTranslations(p.slug) });
  }
  return out;
}

/**
 * Sitemap entries, hreflang between the three editions (x-default English,
 * as buildAlternates writes it). Nothing on a deployment that may not be
 * indexed.
 *
 * `readAt` is the Ministry's own time (ISO) of the list the pages print now
 * (spain-server.ts loadSpainReadingTime: the same memoised read as the pages,
 * so the sitemap costs no extra request): these pages change whenever the
 * Ministry's list does, and 34b7e03 (20 Nov 2026) showed Google still ranking
 * month-old copies of the live pages the sitemap dated by their snapshot. With
 * no current list, or none given (tests, scripts), the snapshot's day.
 */
export function spainFuelSitemapEntries(readAt?: string | null): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  const fallback = madridMidnight(SPAIN_SNAPSHOT.readOn);
  const read = readAt ? Date.parse(readAt) : Number.NaN;
  const at = new Date(Number.isFinite(read) && read > fallback ? read : fallback);
  return spainFamilyPaths().map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: at,
    changeFrequency: "hourly" as const,
    priority: 0.6,
    alternates: {
      languages: {
        ca: absoluteUrl(entry.translations.ca),
        es: absoluteUrl(entry.translations.es),
        en: absoluteUrl(entry.translations.en),
        "x-default": absoluteUrl(entry.translations.en),
      },
    },
  }));
}
