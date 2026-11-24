import { ninoData } from "@/lib/programmatic/nino-check/data";
import { LIVE_CACHE_CONTROL, ninoFeed } from "@/lib/programmatic/lottery-live/feeds";

/**
 * /data/loteria-nino.json — what the El Niño checker runs on in the browser
 * (lib/programmatic/nino-check/data.ts): the drawn numbers exactly as SELAE
 * published them and SELAE's 2027 programme, nothing derived. Read at request
 * time from the live feed (lib/programmatic/lottery-live/: a validated file in
 * LOTTERY_LIVE_DIR, else the committed snapshot), so the numbers go out
 * without a deploy; the CDN holds each answer 30 s. X-Robots-Tag noindex from
 * ALWAYS_NOINDEX_SOURCES (/data/:path*).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { snapshot, origin, warning } = await ninoFeed.read();
  return new Response(JSON.stringify({ ...ninoData(snapshot), feed: origin, warning }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": LIVE_CACHE_CONTROL },
  });
}
