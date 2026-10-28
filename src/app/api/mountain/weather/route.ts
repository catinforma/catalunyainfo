import { buildObservationsResponse } from "@/lib/programmatic/mountain/observations";

export const runtime = "nodejs";
/** Never prerendered or written to ISR: the CDN caches the response for s-maxage instead. */
export const dynamic = "force-dynamic";

/**
 * Latest validated Meteocat readings (temperature, wind, snow depth) at the
 * stations that stand for the /temps-muntanya/ and /tiempo-montana/ pages,
 * read by the browser.
 *
 * Two reads of the XEMA open data per CDN miss, turned into a small JSON.
 * A good answer is cached by the CDN for 30 minutes (and may be served stale
 * for 30 more while it refreshes); a failure for 2 minutes. Readings older
 * than 48 hours are left out, and the browser checks again with its own clock.
 */
export async function GET(): Promise<Response> {
  const { status, headers, body } = await buildObservationsResponse(fetch, new Date());
  return Response.json(body, { status, headers });
}
