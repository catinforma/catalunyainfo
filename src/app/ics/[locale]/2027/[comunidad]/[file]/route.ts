import { cityFeed, feedNotFound, feedResponse, isFeedLocale, slugFromFile, type FeedLocale } from "@/lib/programmatic/ics/feeds";
import { CITIES, cityBySlug } from "@/lib/programmatic/spain-2027/cities";
import { communityBySlug } from "@/lib/programmatic/spain-2027/communities";

/**
 * /ics/<locale>/2027/<comunidad>/<ciudad>.ics — a Spanish city's confirmed
 * 2027 holidays as a subscribable iCalendar feed
 * (lib/programmatic/ics/feeds.ts), offered on the city pages. `<comunidad>`
 * is the Spanish community slug in every locale, as in /embed/.
 *
 * Cached as the town feed is (force-static, regenerated at most daily,
 * `s-maxage=86400` for Cloudflare); noindex from next.config.ts.
 */
export const dynamic = "force-static";
export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams(): { locale: FeedLocale; comunidad: string; file: string }[] {
  const madrid = CITIES.find((c) => c.slug === "madrid") ?? CITIES[0]!;
  return (["ca", "es", "en"] as const).map((locale) => ({ locale, comunidad: madrid.community.slug, file: `${madrid.slug}.ics` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; comunidad: string; file: string }> }) {
  const { locale, comunidad, file } = await params;
  const slug = slugFromFile(file);
  const community = communityBySlug(comunidad);
  const c = slug && community ? cityBySlug(community.region, slug) : null;
  if (!c || !isFeedLocale(locale)) return feedNotFound();
  return feedResponse(cityFeed(locale, c), file);
}
