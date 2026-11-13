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

/** Every generated feed file, for the CDN purge after a publish. */
export const FEED_PATHS: readonly string[] = [...LOCALES.map(feedPath), NEWS_SITEMAP_PATH];

/** Public URLs of the sitemap and the feeds: what a publish purges at the CDN. */
export const SITEMAP_AND_FEED_URLS: readonly string[] = ["/sitemap.xml", ...FEED_PATHS];

/**
 * The `revalidatePath` arguments that reach the cached sitemap, news sitemap
 * and feeds (all route handlers). Their cache entries carry the URL as
 * `_N_T_/sitemap.xml/` (trailingSlash: true), but revalidatePath strips the
 * slash, so `revalidatePath("/sitemap.xml")` matched nothing and new pages
 * waited for the hourly regeneration. Each entry also carries its route
 * file's layout tag (`_N_T_/sitemap.xml/layout`,
 * `_N_T_/(public)/[locale]/feed.xml/layout`), which is what these name.
 * tests/feed-revalidation.test.ts checks them against Next's own tag code.
 */
export const SITEMAP_AND_FEED_REVALIDATIONS: readonly (readonly [path: string, type: "layout"])[] = [
  ["/sitemap.xml", "layout"],
  [NEWS_SITEMAP_PATH, "layout"],
  ["/(public)/[locale]/feed.xml", "layout"],
];

const LANGUAGE_NAME: Record<Locale, string> = { ca: "català", es: "castellano", en: "English" };

/** The `<link rel="alternate" type="application/rss+xml">` title for this language's feed. */
export function feedTitle(siteName: string, locale: Locale): string {
  return `${siteName} (${LANGUAGE_NAME[locale]})`;
}
