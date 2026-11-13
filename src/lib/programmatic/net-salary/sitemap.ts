import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { NET_LOCALES, netSalaryEditions } from "./copy";
import { SALARY_RULES_AS_OF } from "./rules-2026";

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML (buildAlternates). */
export function netSalarySitemapEntries(lastModified: string = SALARY_RULES_AS_OF): MetadataRoute.Sitemap {
  const e = netSalaryEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return NET_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: { languages },
  }));
}
