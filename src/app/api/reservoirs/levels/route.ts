import { buildLevelsResponse } from "@/lib/programmatic/reservoirs/upstream";

export const runtime = "nodejs";
/** Never prerendered or written to ISR: the CDN caches the response through its own Cache-Control. */
export const dynamic = "force-dynamic";

/**
 * Today's reading of each ACA reservoir, for the /embassaments/, /embalses/
 * and /reservoirs/ pages, read by the browser. One upstream request to the
 * ACA's open data per CDN miss; an hour at the CDN plus two of
 * stale-while-revalidate; a failure is cached for a minute.
 */
export async function GET(): Promise<Response> {
  const { status, headers, body } = await buildLevelsResponse(fetch, new Date());
  return Response.json(body, { status, headers });
}
