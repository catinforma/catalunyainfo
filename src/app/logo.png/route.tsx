import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const revalidate = false;

/**
 * The square logo referenced by the Organization structured data and by the
 * web app manifest. Generated from the same palette as the site so there is
 * one source of truth for the mark.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#10202b",
          color: "#f4f6f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 132, letterSpacing: -6, lineHeight: 1 }}>Ci</div>
          <div
            style={{
              width: 150,
              height: 8,
              background: "#0a5b6a",
              marginTop: 22,
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
