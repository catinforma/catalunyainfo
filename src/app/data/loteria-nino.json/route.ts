import { ninoData } from "@/lib/programmatic/nino-check/data";

/**
 * /data/loteria-nino.json — what the El Niño checker runs on in the browser
 * (lib/programmatic/nino-check/data.ts): the drawn numbers from the committed
 * SELAE snapshot and SELAE's 2027 programme, nothing derived. Built once per
 * deploy (force-static). Cache-Control from next.config.ts (short, shared;
 * the publish group `comprobar-nino` purges it); X-Robots-Tag noindex from
 * ALWAYS_NOINDEX_SOURCES (/data/:path*).
 */
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return new Response(JSON.stringify(ninoData()), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
