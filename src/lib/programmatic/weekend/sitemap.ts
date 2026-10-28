import type { MetadataRoute } from "next";

import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { SNAPSHOT, shippedZones } from "./data";
import { hubTranslations, weekendHubPath, zonePath, zoneTranslations } from "./paths";
import { windowStartedOn } from "./refresh";
import { WEEKEND_LOCALES, type WeekendLocale } from "./zones";

export interface WeekendFamilyPath {
  path: string;
  translations: Record<WeekendLocale, string>;
}

/** Every URL of the family, hubs first (for the sitemap, the cron and IndexNow). */
export function weekendFamilyPaths(): WeekendFamilyPath[] {
  const out: WeekendFamilyPath[] = [];
  for (const locale of WEEKEND_LOCALES) {
    out.push({ path: weekendHubPath(locale), translations: hubTranslations() });
    for (const zone of shippedZones()) out.push({ path: zonePath(locale, zone), translations: zoneTranslations(zone) });
  }
  return out;
}

/**
 * The pages' true last change: the later of the snapshot's read date and the
 * day the current weekend window began (the cron rebuilds them that night,
 * with the new dates in the title). Deterministic for a given day.
 */
export function weekendLastModified(today: string = todayInCatalonia()): string {
  const started = windowStartedOn(today);
  return started > SNAPSHOT.readOn ? started : SNAPSHOT.readOn;
}

/**
 * Sitemap entries with hreflang alternates (ca, es, and x-default to the
 * Catalan edition, as `buildAlternates` does when there is no English one).
 * Nothing on a deployment that may not be indexed.
 */
export function weekendSitemapEntries(today?: string): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  const lastModified = new Date(`${weekendLastModified(today)}T00:00:00Z`);
  return weekendFamilyPaths().map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.6,
    alternates: {
      languages: { ca: absoluteUrl(entry.translations.ca), es: absoluteUrl(entry.translations.es), "x-default": absoluteUrl(entry.translations.ca) },
    },
  }));
}
