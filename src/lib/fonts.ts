import { Fraunces, IBM_Plex_Sans } from "next/font/google";

/**
 * Both families are self-hosted by next/font: the files are served from our own
 * origin, so there is no third-party connection on the critical path, no
 * `font-src` exception in the CSP, and no render-blocking stylesheet.
 *
 * Fraunces is variable and we pin `SOFT`/`WONK` to 0 in CSS, which gives a
 * crisp engraved cut rather than the playful default.
 */
export const fraunces = Fraunces({
  // "latin" covers every character Catalan, Spanish and English use (à ç l·l
  // ñ € −); latin-ext was 132 KB preloaded on every page for none of them.
  subsets: ["latin"],
  display: "swap",
  // Variable font: the weight axis stays continuous, and SOFT/WONK are pinned
  // to 0 in globals.css to get the crisp engraved cut rather than the playful
  // default.
  weight: "variable",
  // SOFT and WONK default to 0, which is what globals.css pins them to, so
  // shipping those axes bought nothing: 121 KB -> about 67 KB. Lighthouse
  // mobile LCP went from 3.5-3.9 s to 2.4-2.6 s with both changes.
  axes: ["opsz"],
  variable: "--font-fraunces",
  fallback: ["ui-serif", "Georgia", "serif"],
  adjustFontFallback: true,
});

/*
 * `optional`, not `swap`, for the body face.
 *
 * Lighthouse on mobile measured LCP at 3.3-3.8 s on the mushroom report with a
 * first paint at 1.0 s, and the LCP element was the lead paragraph with a
 * three-second "render delay". Nothing was blocking it: the text painted at
 * 1.0 s in the fallback, then Plex arrived and the swap repainted the largest
 * block of text on the page, which the browser records as a new, later LCP.
 *
 * With `optional` the browser uses Plex only if it is ready almost at once
 * (cached, or a fast connection) and otherwise keeps the fallback for that
 * page view. `adjustFontFallback` already sizes the fallback to Plex's
 * metrics, so the two are close enough that nothing shifts. Headings keep
 * `swap`: the display face is the brand, and a heading is never the largest
 * block of text.
 */
export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "optional",
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
  adjustFontFallback: true,
});

export const fontClassNames = `${fraunces.variable} ${plexSans.variable}`;
