import type { MetadataRoute } from "next";

import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { MUNICIPALITIES, pages } from "./data";
import { FUEL_LOCALES, fuelHubPath, fuelHubTranslations, fuelPath, fuelTranslations, type FuelLocale } from "./paths";

export interface FuelFamilyPath {
  path: string;
  /** The station list's read date: the only date these pages carry. */
  lastModified: string;
  translations: Record<FuelLocale, string>;
}

/** Every URL of the family, hubs first (for the sitemap and for IndexNow). */
export function fuelFamilyPaths(): FuelFamilyPath[] {
  const lastModified = MUNICIPALITIES.readOn;
  const out: FuelFamilyPath[] = [];
  for (const locale of FUEL_LOCALES) {
    out.push({ path: fuelHubPath(locale), lastModified, translations: fuelHubTranslations() });
    for (const place of pages()) {
      out.push({ path: fuelPath(locale, place.kind, place.slug), lastModified, translations: fuelTranslations(place.kind, place.slug) });
    }
  }
  return out;
}

/**
 * Sitemap entries with hreflang alternates (ca, es, and x-default to the
 * Catalan edition, as `buildAlternates` does when there is no English one).
 * Nothing on a deployment that may not be indexed.
 */
export function fuelSitemapEntries(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  return fuelFamilyPaths().map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: new Date(`${entry.lastModified}T00:00:00Z`),
    changeFrequency: "daily" as const,
    priority: 0.6,
    alternates: {
      languages: { ca: absoluteUrl(entry.translations.ca), es: absoluteUrl(entry.translations.es), "x-default": absoluteUrl(entry.translations.ca) },
    },
  }));
}
