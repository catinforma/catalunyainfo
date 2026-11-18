import type { MetadataRoute } from "next";

import { HTML_LANG, X_DEFAULT_LOCALE } from "@/lib/i18n/config";
import { SNAPSHOT, hasResults } from "@/lib/programmatic/gordo/data";
import type { GordoSnapshot } from "@/lib/programmatic/gordo/types";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { CHECK_AS_OF } from "./copy";
import { CHECK_DATA_PATH, CHECK_LOCALES, checkEditions, checkPath } from "./paths";

/**
 * The checker's three editions, in the sitemap with reciprocal hreflang
 * (x-default English, like the HTML); last modified when the snapshot was read,
 * or the day the facts were checked. Never the JSON: it is noindex.
 */
export function checkSitemapEntries(s: GordoSnapshot | null = SNAPSHOT): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  const e = checkEditions();
  const languages = { ...Object.fromEntries(CHECK_LOCALES.map((l) => [HTML_LANG[l], absoluteUrl(e[l])])), "x-default": absoluteUrl(e[X_DEFAULT_LOCALE]) };
  const lastModified = new Date(hasResults(s) ? s.readAt : `${CHECK_AS_OF}T00:00:00Z`);
  return CHECK_LOCALES.map((locale) => ({
    url: absoluteUrl(checkPath(locale)),
    lastModified,
    changeFrequency: hasResults(s) ? ("hourly" as const) : ("weekly" as const),
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

/** What the publish groups `comprobar-loteria` and `gordo-navidad` revalidate and purge: the pages, then the JSON. */
export function checkPublishPaths(): { pages: string[]; data: string[] } {
  return { pages: CHECK_LOCALES.map((l) => checkPath(l)), data: [CHECK_DATA_PATH] };
}
