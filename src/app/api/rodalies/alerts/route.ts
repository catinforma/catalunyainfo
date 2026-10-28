import { buildAlertsResponse } from "@/lib/programmatic/rodalies/alerts";

export const runtime = "nodejs";
/** Never prerendered or written to ISR: the CDN caches the response for s-maxage instead. */
export const dynamic = "force-dynamic";

/**
 * Live Rodalies notices for the /rodalies/ pages, read by the browser.
 *
 * One upstream fetch per CDN miss (Rodalies de Catalunya's notices; Renfe's
 * GTFS-RT alerts only if that fails and the feed is recent), turned into a
 * small JSON. A good answer is cached by the CDN for 120 s and may be served
 * stale for 300 s more while it refreshes; a failure for 30 s. Nothing older
 * than 15 minutes is ever returned as current.
 */
export async function GET(): Promise<Response> {
  const { status, headers, body } = await buildAlertsResponse(fetch, new Date());
  return Response.json(body, { status, headers });
}
