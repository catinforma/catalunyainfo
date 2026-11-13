import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { PL_LOCALES, paidLeaveEditions } from "./copy";
import { RULES_AS_OF } from "./rules";

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML (buildAlternates). */
export function paidLeaveSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  const e = paidLeaveEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return PL_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: locale === "es" ? 0.8 : 0.6,
    alternates: { languages },
  }));
}
