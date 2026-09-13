import type { MetadataRoute } from "next";

import { allIndexablePaths } from "@/lib/content/repository";
import { HTML_LANG, LOCALES, X_DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { allSystemPaths, sectionPath } from "@/lib/i18n/routes";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

export const revalidate = 3600;

/**
 * The sitemap.
 *
 * Rules that matter more than completeness:
 *  - only URLs that are actually indexable appear (published, not noindex, not
 *    demo, publish date in the past);
 *  - every URL carries its hreflang alternates, so Google does not have to
 *    infer the language cluster from the HTML alone;
 *  - the internal search page never appears;
 *  - nothing at all is emitted on a non-production deployment.
 *
 * Hub pages are listed only if the section actually has content behind them,
 * so we never ask Google to crawl an empty listing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexingAllowed()) return [];

  const rows = await allIndexablePaths();

  // Group content paths by entry so that each URL can list its siblings.
  const byEntry = new Map<string, Partial<Record<Locale, string>>>();
  for (const row of rows) {
    const group = byEntry.get(row.entryId) ?? {};
    group[row.locale] = `/${row.locale}/${row.path}/`;
    byEntry.set(row.entryId, group);
  }

  const entries: MetadataRoute.Sitemap = rows.map((row) => {
    const group = byEntry.get(row.entryId) ?? {};
    return {
      url: absoluteUrl(`/${row.locale}/${row.path}/`),
      lastModified: row.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: languageMap(group) },
    };
  });

  // System pages. The search page is excluded by `allSystemPaths`; hubs with no
  // content are filtered out below.
  const populatedSections = new Set(
    rows
      .map((row) => row.path.split("/")[0])
      .filter((segment): segment is string => Boolean(segment)),
  );

  const systemEntries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    for (const path of allSystemPaths(locale)) {
      const isHub = isSectionHub(locale, path);
      if (isHub && !hasContent(locale, path, populatedSections)) continue;

      systemEntries.push({
        url: absoluteUrl(path),
        lastModified: new Date(),
        changeFrequency: path === `/${locale}/` ? "daily" : "weekly",
        priority: path === `/${locale}/` ? 1 : 0.5,
        alternates: {
          languages: languageMap(translateSystemPath(path, locale)),
        },
      });
    }
  }

  return [...systemEntries, ...entries];
}

function languageMap(group: Partial<Record<Locale, string>>): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    const href = group[locale];
    if (href) languages[HTML_LANG[locale]] = absoluteUrl(href);
  }
  const fallback = group[X_DEFAULT_LOCALE] ?? group.ca;
  if (fallback) languages["x-default"] = absoluteUrl(fallback);
  return languages;
}

function isSectionHub(locale: Locale, path: string): boolean {
  const segments = path.split("/").filter(Boolean);
  if (segments.length !== 2) return false;
  return (["news", "guides", "destinations", "events", "routes"] as const).some(
    (key) => sectionPath(key, locale) === path,
  );
}

function hasContent(locale: Locale, path: string, populated: Set<string>): boolean {
  const segment = path.split("/").filter(Boolean)[1];
  return Boolean(segment && populated.has(segment));
}

/**
 * Maps a system path in one locale to the equivalent path in every other
 * locale, by position within `allSystemPaths` — the lists are generated from
 * the same ordered keys, so index N is always the same page.
 */
function translateSystemPath(path: string, locale: Locale): Partial<Record<Locale, string>> {
  const source = allSystemPaths(locale);
  const index = source.indexOf(path);
  if (index < 0) return { [locale]: path };

  const out: Partial<Record<Locale, string>> = {};
  for (const l of LOCALES) {
    const target = allSystemPaths(l)[index];
    if (target) out[l] = target;
  }
  return out;
}
