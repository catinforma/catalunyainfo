import { FAILURE_CACHE, GEOPORTAL_URL, SUCCESS_CACHE, loadCatalonia } from "@/lib/programmatic/fuel/upstream";

export const runtime = "nodejs";
/**
 * Never prerendered and never written to ISR: every response is cached by
 * the CDN through its own Cache-Control header (an hour, plus two of
 * stale-while-revalidate), which costs no ISR writes. The fetch inside uses
 * `cache: "no-store"` so nothing lands in the data cache either.
 */
export const dynamic = "force-dynamic";

/**
 * Fuel prices for every public station in Catalonia, relayed from the
 * Ministry's open-data service (MITECO, CC BY 4.0) in a compact form for the
 * fuel pages, which filter and rank it in the browser. Read-only and public.
 */
export async function GET(): Promise<Response> {
  const result = await loadCatalonia();
  if (!result.ok) {
    return Response.json(
      { error: "upstream", detail: result.error, geoportal: GEOPORTAL_URL },
      { status: 503, headers: { "cache-control": FAILURE_CACHE } },
    );
  }
  return Response.json(result.payload, { headers: { "cache-control": SUCCESS_CACHE } });
}
