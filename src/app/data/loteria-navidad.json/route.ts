import { checkerData } from "@/lib/programmatic/lottery-check/data";

/**
 * /data/loteria-navidad.json — the numbers the Christmas lottery checker runs
 * on in the browser (lib/programmatic/lottery-check/data.ts): the thirteen top
 * numbers and the pedrea from the committed SELAE snapshot, nothing derived.
 * Built once per deploy (force-static): no database, no network. About 15 KB
 * with the full pedrea. Cache-Control comes from next.config.ts (short, shared:
 * Cloudflare holds it like a page; the publish groups `comprobar-loteria` and
 * `gordo-navidad` purge it); X-Robots-Tag noindex from ALWAYS_NOINDEX_SOURCES.
 * The extension keeps it out of the trailing-slash redirect.
 */
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return new Response(JSON.stringify(checkerData()), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
