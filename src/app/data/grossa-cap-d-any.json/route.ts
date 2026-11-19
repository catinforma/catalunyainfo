import { grossaData } from "@/lib/programmatic/grossa-check/data";

/**
 * /data/grossa-cap-d-any.json — the winning numbers the La Grossa de Cap
 * d'Any checker runs on in the browser (lib/programmatic/grossa-check/data.ts):
 * the eight numbers from the committed snapshot, nothing derived. Built once
 * per deploy (force-static). Cache-Control from next.config.ts (short, shared;
 * the publish group `comprobar-grossa` purges it); X-Robots-Tag noindex from
 * ALWAYS_NOINDEX_SOURCES (/data/:path*).
 */
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return new Response(JSON.stringify(grossaData()), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
