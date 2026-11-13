import { revalidatePath } from "next/cache";

import { SITEMAP_AND_FEED_REVALIDATIONS, SITEMAP_AND_FEED_URLS } from "@/lib/seo/feed-paths";

/**
 * Marks the sitemap, the news sitemap and the three feeds for regeneration
 * (see SITEMAP_AND_FEED_REVALIDATIONS for why not the literal URLs) and
 * returns their public URLs for the CDN purge.
 */
export function revalidateSitemapAndFeeds(): readonly string[] {
  for (const [path, type] of SITEMAP_AND_FEED_REVALIDATIONS) revalidatePath(path, type);
  return SITEMAP_AND_FEED_URLS;
}
