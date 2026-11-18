import { ImageResponse } from "next/og";

import { CARD_HEIGHT, CARD_WIDTH, resolveCard } from "@/lib/seo/cards";

/**
 * `/card/<family>/<locale>-<hash>.png`: the share card of a service-news page
 * without a photograph (lib/seo/cards.ts): its H1, its date and the brand,
 * 1200 x 675. The text is the registry's, never the request's; a hash that is
 * not the current one is a 404, so the URL of a card changes with its text and
 * can be cached for good (Cloudflare caches .png by extension). No query
 * string: robots.txt disallows `/*?*`.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL = "public, max-age=31536000, immutable";

const memo = new Map<string, Uint8Array>();

export async function GET(_request: Request, { params }: { params: Promise<{ family: string; file: string }> }) {
  const { family, file } = await params;
  const card = resolveCard(family, file);
  if (!card) {
    return new Response("Not found", { status: 404, headers: { "cache-control": "public, max-age=300" } });
  }
  const memoKey = `${family}/${file}`;
  let bytes = memo.get(memoKey);
  if (!bytes) {
    const { content } = card;
    const image = new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#10202b",
            color: "#f4f6f5",
            padding: "64px 72px",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 4, background: "#0a5b6a", display: "flex" }} />
            <div style={{ display: "flex", fontSize: 34, letterSpacing: -0.5 }}>
              <span>Catalunya</span>
              <span style={{ color: "#56b6c4" }}>Info</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", fontSize: 30, color: "#56b6c4", textTransform: "uppercase", letterSpacing: 1 }}>
              {content.kicker}
            </div>
            <div style={{ display: "flex", fontSize: 64, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 1056 }}>
              {content.title}
            </div>
            <div style={{ display: "flex", fontSize: 32, color: "#d5dedd" }}>{content.dateLine}</div>
          </div>

          <div style={{ display: "flex", fontSize: 26, color: "#93a3a4" }}>www.catalunyainfo.com</div>
        </div>
      ),
      { width: CARD_WIDTH, height: CARD_HEIGHT },
    );
    bytes = new Uint8Array(await image.arrayBuffer());
    memo.set(memoKey, bytes);
  }
  return new Response(bytes as BodyInit, {
    headers: { "content-type": "image/png", "cache-control": CACHE_CONTROL },
  });
}
