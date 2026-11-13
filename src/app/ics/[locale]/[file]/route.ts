import { municipalityBySlug } from "@/lib/programmatic/holidays/data";
import { feedNotFound, feedResponse, isFeedLocale, slugFromFile, townFeed, type FeedLocale } from "@/lib/programmatic/ics/feeds";

/**
 * /ics/<locale>/<municipi>.ics — a Catalan town's confirmed holidays as a
 * subscribable iCalendar feed (lib/programmatic/ics/feeds.ts), offered on the
 * town pages. The extension keeps it out of the trailing-slash redirect.
 *
 * Built once per town on its first request and regenerated at most daily
 * (`revalidate`): Next sends `s-maxage=86400`, so Cloudflare (cache rule 2,
 * ops/vps/README.md §10) holds it a day and the origin is hit about once a
 * day per feed. No database: the data is the committed snapshot. noindex
 * comes from next.config.ts (ALWAYS_NOINDEX_SOURCES); never in the sitemap.
 */
export const dynamic = "force-static";
export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams(): { locale: FeedLocale; file: string }[] {
  return (["ca", "es", "en"] as const).map((locale) => ({ locale, file: "barcelona.ics" }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; file: string }> }) {
  const { locale, file } = await params;
  const slug = slugFromFile(file);
  const m = slug ? municipalityBySlug(slug) : null;
  if (!m || !isFeedLocale(locale)) return feedNotFound();
  return feedResponse(townFeed(locale, m), file);
}
