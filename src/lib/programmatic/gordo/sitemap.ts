import type { MetadataRoute } from "next";

import { HTML_LANG, X_DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { GORDO_AS_OF } from "./copy";
import { SNAPSHOT, hasResults, provinceGroups } from "./data";
import {
  GORDO_LOCALES,
  gordoHubPath,
  gordoHubTranslations,
  gordoMunicipalityPath,
  gordoMunicipalityTranslations,
  gordoProvincePath,
  gordoProvinceTranslations,
} from "./paths";
import type { GordoSnapshot } from "./types";

export interface GordoPath {
  path: string;
  /** ISO timestamp: when the snapshot was read, or the day the facts were checked. */
  lastModified: string;
  translations: Record<Locale, string>;
}

/**
 * Every URL of the family: the three hubs always; a province or municipality
 * only when the snapshot lists a point of sale there. With no snapshot, the
 * hubs only. The sitemap, the publish group `gordo-navidad` (revalidation,
 * CDN purge, IndexNow) and the tests read this one list.
 */
export function gordoPaths(s: GordoSnapshot | null = SNAPSHOT): GordoPath[] {
  const day = hasResults(s) ? s.readAt : `${GORDO_AS_OF}T00:00:00Z`;
  const out: GordoPath[] = [];
  for (const locale of GORDO_LOCALES) out.push({ path: gordoHubPath(locale), lastModified: day, translations: gordoHubTranslations() });
  for (const g of provinceGroups(s)) {
    for (const locale of GORDO_LOCALES) out.push({ path: gordoProvincePath(locale, g.province.slug), lastModified: day, translations: gordoProvinceTranslations(g.province.slug) });
    for (const m of g.municipalities) {
      for (const locale of GORDO_LOCALES) {
        out.push({
          path: gordoMunicipalityPath(locale, g.province.slug, m.municipality.slug),
          lastModified: day,
          translations: gordoMunicipalityTranslations(g.province.slug, m.municipality.slug),
        });
      }
    }
  }
  return out;
}

/** Sitemap entries with the same hreflang set as the HTML (x-default: English). Nothing on a deployment that may not be indexed. */
export function gordoSitemapEntries(s: GordoSnapshot | null = SNAPSHOT): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  return gordoPaths(s).map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: new Date(entry.lastModified),
    changeFrequency: hasResults(s) ? ("hourly" as const) : ("weekly" as const),
    priority: 0.6,
    alternates: {
      languages: {
        ...Object.fromEntries(GORDO_LOCALES.map((locale) => [HTML_LANG[locale], absoluteUrl(entry.translations[locale])])),
        "x-default": absoluteUrl(entry.translations[X_DEFAULT_LOCALE]),
      },
    },
  }));
}
