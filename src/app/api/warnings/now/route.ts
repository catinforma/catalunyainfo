import { briefPayload } from "@/lib/programmatic/warnings/brief";
import { loadWarnings } from "@/lib/programmatic/warnings/server";

export const runtime = "nodejs";
/**
 * Never prerendered: the response is cached by the CDN through its own
 * Cache-Control header. The reads behind it are the warnings pages' own
 * (lib/programmatic/warnings/server.ts: memoised, data cache, timeout, last
 * good reads), so this endpoint adds no request to AEMET, SCT or Protecció
 * Civil.
 */
export const dynamic = "force-dynamic";

/** Five minutes at the CDN, five more stale: the same pace as the pages. */
const SUCCESS_CACHE = "public, s-maxage=300, stale-while-revalidate=300";
const FAILURE_CACHE = "public, s-maxage=60";

/**
 * The official warnings for the "Avui a Catalunya" page: AEMET warnings not
 * yet over, Protecció Civil plans, SCT incident counts. Read-only and public.
 * 503 when no source could be read: the page then links the warnings page.
 */
export async function GET(): Promise<Response> {
  const payload = briefPayload(await loadWarnings());
  if (!payload.weather && !payload.civil && !payload.roads) {
    return Response.json({ error: "upstream" }, { status: 503, headers: { "cache-control": FAILURE_CACHE } });
  }
  return Response.json(payload, { headers: { "cache-control": SUCCESS_CACHE } });
}
