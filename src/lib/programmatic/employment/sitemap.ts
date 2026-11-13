import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import { CALC_KEYS, CALC_LOCALES, calcEditions, type CalcKey } from "@/lib/programmatic/calculators/paths";
import { RULES_AS_OF } from "./rules";

/** Dismissal pay, final settlement and unemployment benefit, ca/es/en each, with reciprocal hreflang (x-default: English, as buildAlternates writes it in the HTML). */
export function employmentSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  return CALC_KEYS.flatMap((key: CalcKey) => {
    const e = calcEditions(key);
    const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
    return CALC_LOCALES.map((locale) => ({
      url: absoluteUrl(e[locale]),
      lastModified: new Date(`${lastModified}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: { languages },
    }));
  });
}
