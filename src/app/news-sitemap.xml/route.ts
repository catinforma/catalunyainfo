import { listRecentlyModified } from "@/lib/content/repository";
import { NEWS_WINDOW_MS, buildNewsSitemap } from "@/lib/seo/feeds";
import { SITE, absoluteUrl, indexingAllowed } from "@/lib/site";

/**
 * `/news-sitemap.xml`: the Google News sitemap (lib/seo/feeds.ts), listed in
 * robots.txt next to the main sitemap. Only written pieces published in the
 * last 48 hours, as Google's news sitemap rules require (buildNewsSitemap
 * drops the older ones the modified-since query returns); an empty
 * `<urlset>` on a quiet day is valid.
 *
 * Revalidated every 15 minutes, so an item leaves the file soon after its two
 * days are up, and at once by every publish (FEED_PATHS). Nothing is listed on
 * a deployment that may not be indexed, as with the main sitemap.
 */
export const revalidate = 900;

export async function GET() {
  const now = new Date();
  const rows = indexingAllowed()
    ? await listRecentlyModified(new Date(now.getTime() - NEWS_WINDOW_MS), {
        strict: process.env.NEXT_PHASE !== "phase-production-build",
      })
    : [];

  const xml = buildNewsSitemap(
    SITE.name,
    rows.map((row) => ({
      url: absoluteUrl(`/${row.locale}/${row.path}/`),
      locale: row.locale,
      title: row.title,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
    })),
    now,
  );

  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
