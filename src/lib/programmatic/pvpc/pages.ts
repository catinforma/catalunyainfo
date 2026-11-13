/**
 * Metadata, sitemap entries and Dataset markup of the PVPC pages. Pure: the
 * route passes REE's view in; `now` is an argument.
 */

import type { Metadata, MetadataRoute } from "next";

import { HTML_LANG, LOCALES, X_DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { datasetSchema } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { URLS, pvpcDescription, pvpcTitle, words } from "./copy";
import { summarize } from "./periods";
import { pvpcPath, pvpcTranslations, type PvpcDayView } from "./paths";
import { madridMidnight } from "./time";
import { REDATA_ENDPOINT } from "./upstream";
import type { PvpcView } from "./view";

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

/** The day a page is about, when its prices are in the view. */
export function dayOf(view: PvpcView, which: PvpcDayView) {
  return which === "today" ? view.today : view.tomorrow;
}

export function pvpcMetadata(locale: Locale, which: PvpcDayView, view: PvpcView): Metadata {
  const day = dayOf(view, which);
  const summary = day ? summarize(day) : null;
  const date = which === "today" ? (view.today ? view.todayDate : null) : view.tomorrowDate;
  return buildMetadata({
    locale,
    path: pvpcPath(locale, which),
    title: pvpcTitle(locale, which, date),
    description: pvpcDescription(locale, which, summary, which === "today" ? view.todayDate : view.tomorrowDate),
    translations: pvpcTranslations(which),
    type: "website",
  });
}

/** Every URL of the family, today first (sitemap, IndexNow, llms.txt checks). */
export function pvpcFamilyPaths(): { path: string; translations: Record<Locale, string> }[] {
  return (["today", "tomorrow"] as const).flatMap((which) => LOCALES.map((locale) => ({ path: pvpcPath(locale, which), translations: pvpcTranslations(which) })));
}

/**
 * Sitemap entries with hreflang. `lastModified` is the start of today in
 * Madrid: the prices on these pages change every day at 00:00 (and tomorrow's
 * page again when REE publishes, ~20:15), and the sitemap is regenerated
 * hourly.
 */
export function pvpcSitemapEntries(todayDate: string): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  const lastModified = new Date(madridMidnight(todayDate));
  return pvpcFamilyPaths().map((entry) => {
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) languages[HTML_LANG[locale]] = absoluteUrl(entry.translations[locale]);
    languages["x-default"] = absoluteUrl(entry.translations[X_DEFAULT_LOCALE]);
    return {
      url: absoluteUrl(entry.path),
      lastModified,
      changeFrequency: "hourly" as const,
      priority: entry.path === pvpcPath("es") ? 0.8 : 0.6,
      alternates: { languages },
    };
  });
}

const SPAIN: Record<Locale, string> = { es: "España", ca: "Espanya", en: "Spain" };

/**
 * Dataset markup, only for a page that prints a day read from REE: REE is the
 * creator, its legal notice the terms, `temporalCoverage` the day shown and
 * `dateModified` REE's own last update of the series. A page without that
 * day's prices carries no Dataset.
 */
export function pvpcDataset(locale: Locale, which: PvpcDayView, view: PvpcView) {
  const day = dayOf(view, which);
  if (!day || view.source === "none") return null;
  const w = words(locale);
  return datasetSchema({
    path: pvpcPath(locale, which),
    name: which === "today" ? w.h1Today : w.h1Tomorrow,
    description: pvpcDescription(locale, which, summarize(day), day.date),
    locale,
    creator: "Red Eléctrica",
    license: URLS.reeLegal,
    isBasedOn: [REDATA_ENDPOINT, URLS.esiosPvpc],
    spatialCoverage: SPAIN[locale],
    temporalCoverage: day.date,
    ...(view.updated ? { dateModified: view.updated } : {}),
  });
}
