/**
 * The calculator widgets' response. The default view (no query string) is the
 * same for everyone until the next deploy, so Cloudflare may hold it for a day
 * (ops/vps/README.md section 10 caches only query-less HTML that says it is
 * shareable; deploy.sh purges everything). A result (any query) is the
 * reader's own figures: never stored by anyone. Framing, CSP and robots
 * headers come from next.config.ts (`EMBED_CALC_SOURCE`).
 */
export function calcEmbedResponse(html: string, hasQuery: boolean): Response {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": hasQuery ? "private, no-store" : "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}

export function calcNotFound(): Response {
  return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
}
