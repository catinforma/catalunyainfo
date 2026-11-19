import type { MetadataRoute } from "next";

import { HTML_LANG, X_DEFAULT_LOCALE } from "@/lib/i18n/config";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { NINO_CHECK_AS_OF } from "./copy";
import { SNAPSHOT } from "./data";
import { NINO_CHECK_LOCALES, NINO_DATA_PATH, ninoCheckEditions, ninoCheckPath } from "./paths";
import type { NinoSnapshot } from "./validate";

/**
 * The El Niño checker's three editions, in the sitemap with reciprocal
 * hreflang (x-default English); last modified when the snapshot was read,
 * or the day the facts were checked. Never the JSON.
 */
export function ninoCheckSitemapEntries(s: NinoSnapshot | null = SNAPSHOT): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  const e = ninoCheckEditions();
  const languages = { ...Object.fromEntries(NINO_CHECK_LOCALES.map((l) => [HTML_LANG[l], absoluteUrl(e[l])])), "x-default": absoluteUrl(e[X_DEFAULT_LOCALE]) };
  const lastModified = new Date(s ? s.readAt : `${NINO_CHECK_AS_OF}T00:00:00Z`);
  return NINO_CHECK_LOCALES.map((locale) => ({
    url: absoluteUrl(ninoCheckPath(locale)),
    lastModified,
    changeFrequency: s ? ("hourly" as const) : ("weekly" as const),
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

/** What the publish group `comprobar-nino` revalidates and purges: the pages, then the JSON. */
export function ninoCheckPublishPaths(): { pages: string[]; data: string[] } {
  return { pages: NINO_CHECK_LOCALES.map((l) => ninoCheckPath(l)), data: [NINO_DATA_PATH] };
}
