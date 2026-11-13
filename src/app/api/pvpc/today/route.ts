import { briefPayload } from "@/lib/programmatic/pvpc/brief";
import { loadServerPvpc } from "@/lib/programmatic/pvpc/server";
import { ESIOS_PVPC_PAGE } from "@/lib/programmatic/pvpc/upstream";

export const runtime = "nodejs";
/**
 * Never prerendered: the response is cached by the CDN through its own
 * Cache-Control header. The REE read behind it is the PVPC pages' own
 * (lib/programmatic/pvpc/server.ts: memoised, data cache, timeout, last good
 * prices), so this endpoint adds no request to REE.
 */
export const dynamic = "force-dynamic";

/** Five minutes at the CDN, ten more stale: the browser picks the current hour itself. */
const SUCCESS_CACHE = "public, s-maxage=300, stale-while-revalidate=600";
const FAILURE_CACHE = "public, s-maxage=60";

/**
 * Today's PVPC 2.0TD hourly prices (Red Eléctrica, €/MWh) for the
 * "Avui a Catalunya" page. Read-only and public. 503 when today's prices are
 * not held: the page then says so and links REE.
 */
export async function GET(): Promise<Response> {
  const payload = briefPayload(await loadServerPvpc(Date.now(), { allowStale: true }));
  if (!payload) {
    return Response.json({ error: "upstream", esios: ESIOS_PVPC_PAGE }, { status: 503, headers: { "cache-control": FAILURE_CACHE } });
  }
  return Response.json(payload, { headers: { "cache-control": SUCCESS_CACHE } });
}
