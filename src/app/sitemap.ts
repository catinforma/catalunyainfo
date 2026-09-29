import type { MetadataRoute } from "next";

import { allIndexablePaths, countBySection } from "@/lib/content/repository";
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
 * so we never ask Google to crawl an empty listing. That question is asked of
 * the same function the navigation uses, because a hub fills up by category as
 * well as by entry type - matching path segments instead missed Guides and
 * Destinations entirely.
 *
 * System paths that are also published as content entries - the legal pages,
 * about, contact - are emitted once, from the content side, which carries the
 * real last-modified date. Listing a URL twice is a defect a crawler notices.
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

  // Anything already published as a content entry is emitted from there only.
  const contentUrls = new Set(entries.map((entry) => entry.url));

  // Which hubs have something behind them, asked the same way the navigation
  // asks it.
  const HUBS = ["news", "guides", "destinations", "events", "routes"] as const;
  const populatedHubs = new Set<string>();
  await Promise.all(
    LOCALES.flatMap((locale) =>
      HUBS.map(async (key) => {
        if ((await countBySection(locale, key)) > 0) {
          populatedHubs.add(sectionPath(key, locale));
        }
      }),
    ),
  );

  /*
    The home pages and the section hubs have no `updated_at` of their own,
    because they are not rows: they are listings. They were being stamped with
    `new Date()`, which meant every fetch of the sitemap told Google that all
    thirty-odd of them had changed in the same instant, a moment ago. A
    `lastmod` that is always "now" is one Google learns to ignore, and it
    stops being a signal for the URLs where it is real.

    What actually changes a listing is a change to the content it lists, so
    that is the date to use. Falls back to the current time only when there is
    no content at all, which is the one case where it is true.
  */
  const newestContent = rows.reduce<Date | null>(
    (newest, row) => (newest === null || row.updatedAt > newest ? row.updatedAt : newest),
    null,
  );
  const listingModified = newestContent ?? new Date();

  const systemEntries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    for (const path of allSystemPaths(locale)) {
      if (contentUrls.has(absoluteUrl(path))) continue;
      if (isSectionHub(locale, path) && !populatedHubs.has(path)) continue;

      systemEntries.push({
        url: absoluteUrl(path),
        lastModified: listingModified,
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
