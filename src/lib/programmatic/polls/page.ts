/**
 * The 29N polls page: metadata, breadcrumbs, structured data and sitemap
 * entries. None of these may carry a poll figure, at any date: they come from
 * `copy.ts` and `paths.ts` only, never from `figures.ts` (a test checks the
 * imports and the strings).
 */

import type { Metadata, MetadataRoute } from "next";

// The index file by name: the test runner does not resolve directory imports.
import { getMessages } from "@/lib/i18n/index";
import { HTML_LANG, LOCALES, X_DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { sectionPath } from "@/lib/i18n/routes";
import { ORGANIZATION_ID, WEBSITE_ID, breadcrumbSchema } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, indexingAllowed } from "@/lib/site";

import { POLLS_PAGE_UPDATED, pollsCopy } from "./copy";
import { pollsPath, pollsTranslations } from "./paths";

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

export function pollsMetadata(locale: Locale): Metadata {
  const copy = pollsCopy(locale);
  return buildMetadata({
    locale,
    path: pollsPath(locale),
    title: copy.seoTitle,
    description: copy.description,
    translations: pollsTranslations(),
    type: "article",
    modifiedTime: new Date(`${POLLS_PAGE_UPDATED}T00:00:00Z`),
  });
}

export function pollsCrumbs(locale: Locale): { label: string; href: string }[] {
  const t = getMessages(locale);
  return [
    { label: t.common.home, href: `/${locale}/` },
    { label: t.nav.guides, href: sectionPath("guides", locale) },
    { label: pollsCopy(locale).crumb, href: pollsPath(locale) },
  ];
}

/** WebPage and BreadcrumbList. Never a figure: names and descriptions only. */
export function pollsSchemas(locale: Locale): Record<string, unknown>[] {
  const copy = pollsCopy(locale);
  const url = absoluteUrl(pollsPath(locale));
  const page = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: copy.title,
    description: copy.description,
    inLanguage: HTML_LANG[locale],
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    dateModified: POLLS_PAGE_UPDATED,
  };
  const crumbs = breadcrumbSchema(pollsCrumbs(locale));
  return crumbs ? [page, crumbs] : [page];
}

/** The three editions with hreflang alternates; nothing on a deployment that may not be indexed. */
export function pollsSitemapEntries(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];
  const translations = pollsTranslations();
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) languages[HTML_LANG[locale]] = absoluteUrl(translations[locale]);
  languages["x-default"] = absoluteUrl(translations[X_DEFAULT_LOCALE]);
  const lastModified = new Date(`${POLLS_PAGE_UPDATED}T00:00:00Z`);
  return LOCALES.map((locale) => ({
    url: absoluteUrl(translations[locale]),
    lastModified,
    changeFrequency: "daily" as const,
    priority: 0.7,
    alternates: { languages },
  }));
}
