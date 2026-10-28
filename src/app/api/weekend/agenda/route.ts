import { AGENDA_SOURCE } from "@/lib/content/weekend/agenda";
import { FAILURE_CACHE, SUCCESS_CACHE, loadWeekendPayload } from "@/lib/programmatic/weekend/upstream";

export const runtime = "nodejs";
/**
 * Never prerendered and never written to ISR: every response is cached by the
 * CDN through its own Cache-Control header (30 minutes, plus 30 of
 * stale-while-revalidate), which costs no ISR writes. The fetch inside uses
 * `cache: "no-store"` so nothing lands in the data cache either.
 */
export const dynamic = "force-dynamic";

/**
 * This weekend's activities in Catalonia, from the Generalitat's open-data
 * cultural agenda (`rhpv-yr4f`), in a compact form for the weekend zone pages,
 * which pick out their zone in the browser. The window is computed here, from
 * the server's clock in Europe/Madrid, and returned with the list; the page
 * refuses a list whose window is over. Read-only and public.
 */
export async function GET(): Promise<Response> {
  const result = await loadWeekendPayload();
  if (!result.ok) {
    return Response.json(
      { error: "upstream", detail: result.error, agenda: AGENDA_SOURCE.url },
      { status: 503, headers: { "cache-control": FAILURE_CACHE } },
    );
  }
  return Response.json(result.payload, { headers: { "cache-control": SUCCESS_CACHE } });
}
