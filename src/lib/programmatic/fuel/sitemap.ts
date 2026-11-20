import type { MetadataRoute } from "next";

import { absoluteUrl, indexingAllowed } from "@/lib/site";
import { madridMidnight } from "@/lib/programmatic/pvpc/time";

import { MUNICIPALITIES, pages } from "./data";
import { FUEL_HUB_LOCALES, FUEL_LOCALES, fuelHubPath, fuelHubTranslations, fuelPath, fuelTranslations, type FuelHubLocale } from "./paths";

export interface FuelFamilyPath {
  path: string;
  /** The station list's read date: the only date these pages carry. */
  lastModified: string;
  /** ca and es everywhere; en only for the hub (the place pages have no English edition). */
  translations: Partial<Record<FuelHubLocale, string>>;
}

/** Every URL of the family, hubs first (for the sitemap and for IndexNow). */
export function fuelFamilyPaths(): FuelFamilyPath[] {
  const lastModified = MUNICIPALITIES.readOn;
  const out: FuelFamilyPath[] = [];
  for (const locale of FUEL_HUB_LOCALES) out.push({ path: fuelHubPath(locale), lastModified, translations: fuelHubTranslations() });
  for (const locale of FUEL_LOCALES) {
    for (const place of pages()) {
      out.push({ path: fuelPath(locale, place.kind, place.slug), lastModified, translations: fuelTranslations(place.kind, place.slug) });
    }
  }
  return out;
}

/**
 * Sitemap entries with hreflang alternates, as `buildAlternates` writes them:
 * x-default to the English edition where there is one (the three hubs), else
 * to the Catalan one (the place pages).
 * Nothing on a deployment that may not be indexed.
 *
 * `today` is the Madrid date of the sitemap's render. Since 13 Nov 2026 the
 * pages print the Ministry's prices read at render (ISR every half hour,
 * server.ts), which change through the day; until 20 Nov the sitemap still
 * gave the station list's date (28 Oct), and Search Console's URL inspection
 * on 20 Nov showed /es/gasolineras/ and /ca/benzineres/ last crawled on 6 Nov,
 * when their HTML still held the "0,000 €/l" skeleton. Only the two hubs are
 * listed in the end (the place pages are noindex, lib/seo/low-demand.ts).
 * Without `today` (tests, scripts) the station list's date is used.
 */
export function fuelSitemapEntries(today?: string): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  return fuelFamilyPaths().map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: new Date(madridMidnight(today && today > entry.lastModified ? today : entry.lastModified)),
    changeFrequency: "daily" as const,
    priority: 0.6,
    alternates: { languages: languagesOf(entry.translations) },
  }));
}

function languagesOf(translations: FuelFamilyPath["translations"]): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of ["ca", "es", "en"] as const) {
    const href = translations[locale];
    if (href) languages[locale] = absoluteUrl(href);
  }
  const fallback = translations.en ?? translations.ca;
  if (fallback) languages["x-default"] = absoluteUrl(fallback);
  return languages;
}
