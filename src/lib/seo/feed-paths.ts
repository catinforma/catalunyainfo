import { LOCALES, type Locale } from "@/lib/i18n/config";

/**
 * Where the feeds live (lib/seo/feeds.ts builds them). Kept apart so the page
 * metadata, robots.txt and the publish routes can name them without loading
 * the builders.
 */

/** `/ca/feed.xml` */
export function feedPath(locale: Locale): string {
  return `/${locale}/feed.xml`;
}

export const NEWS_SITEMAP_PATH = "/news-sitemap.xml";

/** Every generated feed file, for revalidation and the CDN purge after a publish. */
export const FEED_PATHS: readonly string[] = [...LOCALES.map(feedPath), NEWS_SITEMAP_PATH];

const LANGUAGE_NAME: Record<Locale, string> = { ca: "català", es: "castellano", en: "English" };

/** The `<link rel="alternate" type="application/rss+xml">` title for this language's feed. */
export function feedTitle(siteName: string, locale: Locale): string {
  return `${siteName} (${LANGUAGE_NAME[locale]})`;
}
