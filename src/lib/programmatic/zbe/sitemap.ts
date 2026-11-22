import type { MetadataRoute } from "next";

import { madridMidnight } from "@/lib/programmatic/pvpc/time";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { zbeCities } from "./cities";
import { zbeCityPath, zbeCityTranslations, zbeHubPath, zbeHubTranslations } from "./paths";
import { ZBE_SNAPSHOT } from "./snapshot";
import { ZBE_LOCALES, type ZbeLocale } from "./types";

export interface ZbeFamilyPath {
  path: string;
  translations: Record<ZbeLocale, string>;
  /** Day the page's facts were last read: the later of the council check and the DGT snapshot. */
  checked: string;
}

const later = (a: string, b: string): string => (a > b ? a : b);

/** Every URL of the family, the three hubs first (sitemap, publish group, IndexNow, tests). */
export function zbeFamilyPaths(): ZbeFamilyPath[] {
  const cities = zbeCities();
  const newest = cities.reduce((day, c) => later(day, c.checked), ZBE_SNAPSHOT.builtOn);
  const out: ZbeFamilyPath[] = [];
  for (const locale of ZBE_LOCALES) out.push({ path: zbeHubPath(locale), translations: zbeHubTranslations(), checked: newest });
  for (const locale of ZBE_LOCALES) {
    for (const c of cities) out.push({ path: zbeCityPath(locale, c.slug), translations: zbeCityTranslations(c.slug), checked: later(c.checked, ZBE_SNAPSHOT.builtOn) });
  }
  return out;
}

/**
 * Sitemap entries with hreflang between the three editions (x-default
 * English, as buildAlternates writes it). Nothing on a deployment that may
 * not be indexed.
 */
export function zbeSitemapEntries(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  return zbeFamilyPaths().map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: new Date(madridMidnight(entry.checked)),
    changeFrequency: "monthly" as const,
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
