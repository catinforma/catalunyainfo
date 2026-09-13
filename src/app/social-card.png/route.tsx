import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const revalidate = false;

/**
 * The default social card, generated rather than committed as a binary.
 *
 * Pages with a hero image use that image instead; this is the fallback for
 * hubs, legal pages and anything without artwork. Keeping it as a route means
 * the wordmark and palette can never drift from the site's own tokens.
 */
export async function GET() {
  return new ImageResponse(
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
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              background: "#0a5b6a",
              display: "flex",
            }}
          />
          {/* Satori needs an explicit display on any element with more than
              one child, so the wordmark is laid out as a flex row. */}
          <div style={{ display: "flex", fontSize: 34, letterSpacing: -0.5 }}>
            <span>Catalunya</span>
            <span style={{ color: "#56b6c4" }}>Info</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 68, lineHeight: 1.05, letterSpacing: -2, maxWidth: 900 }}>
            La guia digital més útil sobre Catalunya
          </div>
          <div style={{ fontSize: 26, color: "#93a3a4" }}>
            www.catalunyainfo.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
