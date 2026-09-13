import type { Metadata } from "next";

import { SITE, absoluteUrl, indexingAllowed, siteOrigin } from "@/lib/site";
import {
  HTML_LANG,
  LOCALES,
  OG_LOCALE,
  X_DEFAULT_LOCALE,
  type Locale,
} from "@/lib/i18n/config";

const TITLE_MAX = 62;
const DESCRIPTION_MAX = 165;

export function clampTitle(title: string): string {
  return title.length <= TITLE_MAX ? title : `${title.slice(0, TITLE_MAX - 1).trimEnd()}…`;
}

export function clampDescription(text: string | null | undefined): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return undefined;
  return clean.length <= DESCRIPTION_MAX
    ? clean
    : `${clean.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…`;
}

export interface AlternatesInput {
  /** Site-relative path of the current page, e.g. `/ca/guies/`. */
  path: string;
  /** Site-relative paths of the sibling language editions. */
  translations: Partial<Record<Locale, string>>;
  /** Overrides the self-referencing canonical. Rarely needed. */
  canonicalOverride?: string | null;
}

/**
 * Canonical + hreflang.
 *
 * Rules applied here:
 *  - The canonical is always absolute and always on the production host.
 *  - A page only advertises hreflang alternates that actually exist and are
 *    indexable; a missing translation is simply not listed.
 *  - `x-default` points at the English edition when it exists, because users
 *    who match none of ca/es/en are, by definition, international.
 *  - Every set is self-referential: the page lists itself among its alternates.
 */
export function buildAlternates({
  path,
  translations,
  canonicalOverride,
}: AlternatesInput): Metadata["alternates"] {
  const languages: Record<string, string> = {};

  for (const locale of LOCALES) {
    const href = translations[locale];
    if (href) languages[HTML_LANG[locale]] = absoluteUrl(href);
  }

  const xDefault = translations[X_DEFAULT_LOCALE] ?? translations.ca ?? path;
  if (xDefault) languages["x-default"] = absoluteUrl(xDefault);

  return {
    canonical: canonicalOverride ?? absoluteUrl(path),
    languages: Object.keys(languages).length > 0 ? languages : undefined,
  };
}

export interface PageMetadataInput {
  locale: Locale;
  path: string;
  title: string;
  description?: string | null;
  translations?: Partial<Record<Locale, string>>;
  image?: { url: string; width?: number | null; height?: number | null; alt?: string } | null;
  type?: "website" | "article";
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
  authors?: string[];
  /** Force noindex regardless of environment (search pages, previews, demo). */
  noindex?: boolean;
  canonicalOverride?: string | null;
}

export function buildMetadata(input: PageMetadataInput): Metadata {
  const {
    locale,
    path,
    title,
    description,
    translations,
    image,
    type = "website",
    publishedTime,
    modifiedTime,
    authors,
    noindex = false,
    canonicalOverride,
  } = input;

  const effectiveTranslations = translations ?? { [locale]: path };
  const desc = clampDescription(description);
  const robotsIndexable = indexingAllowed() && !noindex;

  const ogImages = image
    ? [
        {
          url: image.url.startsWith("http") ? image.url : absoluteUrl(image.url),
          width: image.width ?? undefined,
          height: image.height ?? undefined,
          alt: image.alt ?? title,
        },
      ]
    : [{ url: absoluteUrl("/social-card.png"), width: 1200, height: 630, alt: SITE.name }];

  return {
    metadataBase: new URL(siteOrigin()),
    title,
    description: desc,
    alternates: buildAlternates({
      path,
      translations: effectiveTranslations,
      canonicalOverride: canonicalOverride ?? null,
    }),
    robots: robotsIndexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type,
      siteName: SITE.name,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      title,
      description: desc,
      url: absoluteUrl(path),
      images: ogImages,
      ...(type === "article"
        ? {
            publishedTime: publishedTime?.toISOString(),
            modifiedTime: modifiedTime?.toISOString(),
            authors,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ogImages.map((i) => i.url),
      ...(SITE.twitter ? { site: `@${SITE.twitter}` } : {}),
    },
  };
}
