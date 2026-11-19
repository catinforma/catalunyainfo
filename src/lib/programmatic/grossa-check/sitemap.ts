import type { MetadataRoute } from "next";

import { HTML_LANG, X_DEFAULT_LOCALE } from "@/lib/i18n/config";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { GROSSA_CHECK_AS_OF } from "./copy";
import { SNAPSHOT } from "./data";
import { GROSSA_CHECK_LOCALES, GROSSA_DATA_PATH, grossaCheckEditions, grossaCheckPath } from "./paths";
import type { GrossaSnapshot } from "./validate";

/**
 * The Grossa checker's three editions, in the sitemap with reciprocal
 * hreflang (x-default English, like the HTML); last modified when the
 * snapshot was read, or the day the facts were checked. Never the JSON.
 */
export function grossaCheckSitemapEntries(s: GrossaSnapshot | null = SNAPSHOT): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  const e = grossaCheckEditions();
  const languages = { ...Object.fromEntries(GROSSA_CHECK_LOCALES.map((l) => [HTML_LANG[l], absoluteUrl(e[l])])), "x-default": absoluteUrl(e[X_DEFAULT_LOCALE]) };
  const lastModified = new Date(s ? s.readAt : `${GROSSA_CHECK_AS_OF}T00:00:00Z`);
  return GROSSA_CHECK_LOCALES.map((locale) => ({
    url: absoluteUrl(grossaCheckPath(locale)),
    lastModified,
    changeFrequency: s ? ("hourly" as const) : ("weekly" as const),
    priority: locale === "ca" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}

/** What the publish group `comprobar-grossa` revalidates and purges: the pages, then the JSON. */
export function grossaCheckPublishPaths(): { pages: string[]; data: string[] } {
  return { pages: GROSSA_CHECK_LOCALES.map((l) => grossaCheckPath(l)), data: [GROSSA_DATA_PATH] };
}
