import { ztClientData } from "@/lib/programmatic/zona-tensionada/data";

/**
 * /data/zona-tensionada.json — every town the "¿Está tu municipio en zona
 * tensionada?" checker searches (checkerTowns(): every town of Catalonia and
 * every declared town elsewhere, with its zones), fetched on the reader's
 * first focus instead of riding in the page's RSC payload. Built once per
 * deploy (force-static) from the committed declarations.json: no database,
 * no network. Cache-Control comes from next.config.ts (shared: Cloudflare
 * holds it; every deploy purges the zone); X-Robots-Tag noindex from
 * ALWAYS_NOINDEX_SOURCES (/data/). The extension keeps it out of the
 * trailing-slash redirect.
 */
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return new Response(JSON.stringify(ztClientData()), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
