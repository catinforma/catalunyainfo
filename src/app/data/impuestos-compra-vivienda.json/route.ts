import { htClientData } from "@/lib/programmatic/home-purchase-tax/communities";

/**
 * /data/impuestos-compra-vivienda.json — the rates and conditions of every
 * community that the home-purchase tax calculator runs on in the browser
 * (clientCommunities(): the law's quotes left out), fetched on the reader's
 * first interaction instead of riding in every page's RSC payload. One file
 * for the three editions. Built once per deploy (force-static): no database,
 * no network. Cache-Control comes from next.config.ts (shared: Cloudflare
 * holds it; every deploy purges the zone); X-Robots-Tag noindex from
 * ALWAYS_NOINDEX_SOURCES (/data/). The extension keeps it out of the
 * trailing-slash redirect.
 */
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return new Response(JSON.stringify(htClientData()), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
