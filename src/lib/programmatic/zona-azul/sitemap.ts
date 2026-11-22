import type { MetadataRoute } from "next";

import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { CITIES, ZONA_AZUL_AS_OF } from "./data";
import { ZA_LOCALES, zaCityPath, zaCityTranslations, zaHubPath, zaHubTranslations } from "./paths";
import type { ZaLocale } from "./types";

export interface ZonaAzulPath {
  path: string;
  /** The day the facts on the page were last read on their sources. */
  lastModified: string;
  translations: Record<ZaLocale, string>;
}

/** Every URL of the family, hubs first (for the sitemap, the publish group and IndexNow). */
export function zonaAzulPaths(): ZonaAzulPath[] {
  const out: ZonaAzulPath[] = [];
  const hubDate = CITIES.reduce((latest, c) => (c.verified > latest ? c.verified : latest), ZONA_AZUL_AS_OF);
  for (const locale of ZA_LOCALES) out.push({ path: zaHubPath(locale), lastModified: hubDate, translations: zaHubTranslations() });
  for (const locale of ZA_LOCALES) {
    for (const city of CITIES) out.push({ path: zaCityPath(locale, city.slug), lastModified: city.verified, translations: zaCityTranslations(city.slug) });
  }
  return out;
}

/**
 * Sitemap entries with hreflang alternates, the same rules as
 * `buildAlternates`: the three editions and x-default to English. Nothing on
 * a deployment that may not be indexed.
 */
export function zonaAzulSitemapEntries(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  return zonaAzulPaths().map((entry) => {
    const languages: Record<string, string> = {};
    for (const locale of ZA_LOCALES) languages[locale] = absoluteUrl(entry.translations[locale]);
    languages["x-default"] = absoluteUrl(entry.translations.en);
    return {
      url: absoluteUrl(entry.path),
      lastModified: new Date(`${entry.lastModified}T00:00:00Z`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: { languages },
    };
  });
}
