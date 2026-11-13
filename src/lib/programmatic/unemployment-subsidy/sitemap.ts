import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { SUB_LOCALES, subsidyEditions } from "./copy";
import { SUBSIDY_RULES_AS_OF } from "./rules";

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML (buildAlternates). */
export function subsidySitemapEntries(lastModified: string = SUBSIDY_RULES_AS_OF): MetadataRoute.Sitemap {
  const e = subsidyEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return SUB_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}
