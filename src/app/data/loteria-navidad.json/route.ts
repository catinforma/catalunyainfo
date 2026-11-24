import { checkerData } from "@/lib/programmatic/lottery-check/data";
import { LIVE_CACHE_CONTROL, navidadFeed } from "@/lib/programmatic/lottery-live/feeds";

/**
 * /data/loteria-navidad.json — the numbers the Christmas lottery checker runs
 * on in the browser (lib/programmatic/lottery-check/data.ts): the thirteen top
 * numbers and the pedrea exactly as SELAE published them, nothing derived.
 *
 * Read at request time from the live feed (lib/programmatic/lottery-live/:
 * a validated file in LOTTERY_LIVE_DIR, else the committed snapshot), so the
 * draw-day numbers go out without a deploy. Never prerendered; the CDN holds
 * each answer 30 s (LIVE_CACHE_CONTROL), so the origin sees about two requests
 * a minute per edge location however many readers there are. `feed` says
 * where the numbers came from and `warning` why a newer file was refused.
 * X-Robots-Tag noindex from ALWAYS_NOINDEX_SOURCES. The extension keeps it
 * out of the trailing-slash redirect.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { snapshot, origin, warning } = await navidadFeed.read();
  return new Response(JSON.stringify({ ...checkerData(snapshot), feed: origin, warning }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": LIVE_CACHE_CONTROL },
  });
}
