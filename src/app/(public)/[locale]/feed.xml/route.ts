import { listFeedEntries } from "@/lib/content/repository";
import { getMessages } from "@/lib/i18n";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { feedPath } from "@/lib/seo/feed-paths";
import { FEED_SIZE, buildRss, feedItem } from "@/lib/seo/feeds";
import { SITE, absoluteUrl } from "@/lib/site";

/**
 * `/ca/feed.xml`, `/es/feed.xml`, `/en/feed.xml`: RSS 2.0 of the written
 * pieces (guides, articles, news) in that language, most recently modified
 * first (lib/seo/feeds.ts). Advertised from every page's head
 * (buildMetadata).
 *
 * Cached like the sitemap: an hour (ISR, and `s-maxage` for Cloudflare, see
 * next.config.ts), and revalidated and purged by every publish (FEED_PATHS).
 * dynamicParams stays true: this route is revalidated by path, and a
 * dynamicParams = false route answers 404 once regenerated on the self-hosted
 * server. Unknown locales get a 404 from the handler itself.
 */
export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response("Not found", { status: 404 });
  const typed = locale as Locale;

  // Strict at run time (a failed regeneration keeps the last good feed), soft
  // while building, as the sitemap does.
  const entries = await listFeedEntries(typed, {
    limit: FEED_SIZE,
    strict: process.env.NEXT_PHASE !== "phase-production-build",
  });

  const xml = buildRss({
    locale: typed,
    siteName: SITE.name,
    homeUrl: absoluteUrl(`/${typed}/`),
    selfUrl: absoluteUrl(feedPath(typed)),
    description: getMessages(typed).home.tagline,
    items: entries.map(feedItem),
  });

  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
