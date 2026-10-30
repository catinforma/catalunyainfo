/**
 * "Avui a Catalunya": metadata, breadcrumbs, structured data and the sitemap
 * entries. No clock, no database: every date is a dataset's own.
 */

import type { Metadata, MetadataRoute } from "next";

// The index file by name: the test runner does not resolve directory imports.
import { getMessages } from "@/lib/i18n/index";
import { HTML_LANG, LOCALES, X_DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { ORGANIZATION_ID, WEBSITE_ID, breadcrumbSchema } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { pageCopy } from "./copy";
import { todayLastModified } from "./data";
import { todayPath, todayTranslations } from "./paths";

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

export function todayMetadata(locale: Locale): Metadata {
  const copy = pageCopy(locale);
  return buildMetadata({
    locale,
    path: todayPath(locale),
    title: copy.title,
    description: copy.description,
    translations: todayTranslations(),
    type: "website",
  });
}

export function todayCrumbs(locale: Locale): { label: string; href: string }[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: pageCopy(locale).crumb, href: todayPath(locale) },
  ];
}

const PLACE_NAME: Record<Locale, string> = { ca: "Catalunya", es: "Cataluña", en: "Catalonia" };

/** WebPage (dated by its data, not by the clock) and BreadcrumbList. */
export function todaySchemas(locale: Locale): Record<string, unknown>[] {
  const copy = pageCopy(locale);
  const url = absoluteUrl(todayPath(locale));
  const page = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: copy.title,
    description: copy.description,
    inLanguage: HTML_LANG[locale],
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    dateModified: todayLastModified(),
    about: { "@type": "Place", name: PLACE_NAME[locale] },
  };
  const crumbs = breadcrumbSchema(todayCrumbs(locale));
  return crumbs ? [page, crumbs] : [page];
}

/** The three editions, with hreflang alternates; nothing on a deployment that may not be indexed. */
export function todaySitemapEntries(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  const translations = todayTranslations();
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) languages[HTML_LANG[locale]] = absoluteUrl(translations[locale]);
  languages["x-default"] = absoluteUrl(translations[X_DEFAULT_LOCALE]);
  const lastModified = new Date(`${todayLastModified()}T00:00:00Z`);
  return LOCALES.map((locale) => ({
    url: absoluteUrl(translations[locale]),
    lastModified,
    // The HTML changes with the data above; the daily answers are the browser's.
    changeFrequency: "daily" as const,
    priority: 0.8,
    alternates: { languages },
  }));
}
