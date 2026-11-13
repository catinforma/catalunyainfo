import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { CALC_LOCALES, calculatorsHubEditions } from "./paths";

/** The calculators hub was first published on 13 Nov 2026; its cards change with the deploy. */
export const CALCULATORS_HUB_UPDATED = "2026-11-13";

/** The hub's three editions with reciprocal hreflang; x-default English, like every page's HTML (buildAlternates). */
export function calculatorsHubSitemapEntries(lastModified: string = CALCULATORS_HUB_UPDATED): MetadataRoute.Sitemap {
  const e = calculatorsHubEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return CALC_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: { languages },
  }));
}
