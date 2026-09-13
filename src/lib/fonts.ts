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
  subsets: ["latin", "latin-ext"],
  display: "swap",
  // Variable font: the weight axis stays continuous, and SOFT/WONK are pinned
  // to 0 in globals.css to get the crisp engraved cut rather than the playful
  // default.
  weight: "variable",
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  fallback: ["ui-serif", "Georgia", "serif"],
  adjustFontFallback: true,
});

export const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
  adjustFontFallback: true,
});

export const fontClassNames = `${fraunces.variable} ${plexSans.variable}`;
