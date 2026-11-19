import type { MetadataRoute } from "next";

import { calcEditions, calcPath } from "@/lib/programmatic/calculators/paths";
import { absoluteUrl } from "@/lib/site";

import { RULES_AS_OF } from "./state";
import type { CmpLocale } from "./types";

/**
 * The comparison's URLs (calculators registry id "inheritance-tax-by-region"):
 * /es/calculadoras/impuesto-sucesiones-por-comunidad/,
 * /ca/calculadores/impost-successions-per-comunitat/,
 * /en/calculators/spain-inheritance-tax-by-region/, and its CSV download.
 */

export const CMP_LOCALES: readonly CmpLocale[] = ["ca", "es", "en"];
export const CMP_ID = "inheritance-tax-by-region" as const;

export function cmpPath(locale: CmpLocale): string {
  return calcPath(CMP_ID, locale);
}

export function cmpEditions(): Record<CmpLocale, string> {
  return calcEditions(CMP_ID);
}

/** The CSV (src/app/data/impuesto-sucesiones-por-comunidad-2026.csv/route.ts). */
export const CSV_FILENAME = "impuesto-sucesiones-por-comunidad-2026.csv";
export const CSV_PATH = `/data/${CSV_FILENAME}`;

/** The three editions with reciprocal hreflang; x-default English, like every page's HTML. */
export function cmpSitemapEntries(lastModified: string = RULES_AS_OF): MetadataRoute.Sitemap {
  const e = cmpEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return CMP_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: locale === "en" ? 0.6 : 0.8,
    alternates: { languages },
  }));
}
