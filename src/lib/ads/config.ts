import { LOCALES } from "@/lib/i18n/config";
import { ADS_LIVE } from "@/lib/ads/live";
import { pvpcPath } from "@/lib/programmatic/pvpc/paths";
import { todayPath } from "@/lib/programmatic/today/paths";

/**
 * Google AdSense, switched on 24 Nov 2026 at the owner's request ("fes tot i
 * publica"), after AdSense accepted the site that day.
 *
 * What runs (docs/ADSENSE_READINESS.md, "Live since 24 Nov 2026"):
 * - Google's own consent tool (Privacy & messaging, European regulations
 *   message, IAB TCF certified) replaces the first-party banner. It is loaded
 *   by the AdSense script; Google Analytics waits for its answer
 *   (components/ConsentGate.tsx).
 * - Manual units placed by components/AdsRuntime.tsx under our rules
 *   (lib/ads/placement.ts): a server-rendered box after the first answer, an
 *   in-article unit every ~2 screens (0.75 of a screen from any other unit),
 *   one at the end, one in the desktop sidebar when it fits, at most five per
 *   page. Home: top, one card in the first grid, end. The owner also enabled
 *   the bottom anchor and the vignette in AdSense (auto ads, overlays only).
 * - No ad at all on the pages that show Red Eléctrica PVPC prices: REE's
 *   terms are non-commercial and its written permission has not been given
 *   (SEO_EXPERIMENTS 2026-11-17 (c)). The script still loads there, paused,
 *   so the consent tool works on every page.
 *
 * The slot ids are public (they are in every page's HTML); the publisher id
 * comes from ADSENSE_PUBLISHER_ID on the server (lib/site.ts).
 */

export { ADS_LIVE };

/**
 * Ad unit ids created in AdSense by the owner on 24 Nov 2026 (the first
 * three in the morning, the rest at night when he asked for more ads).
 */
export const AD_SLOTS = {
  /** "ci-mig": in-article (fluid): the first in-article unit of a page. */
  middle: "9170740903",
  /** "ci-mig-2": in-article (fluid): the further ones, ~2 screens apart. */
  middle2: "7647574549",
  /** "ci-final": Multiplex (autorelaxed). */
  end: "3510773003",
  /** "ci-lateral": display, vertical, responsive (desktop sidebar). */
  side: "9517264801" as string | null,
  /** "ci-dalt": display, format auto, full-width responsive (server-rendered top box). */
  top: "2586819556",
  /** "ci-portada": in-feed, image on top (a card in the home grid). */
  feed: "8576552379",
} as const;

/** data-ad-layout-key of "ci-portada" (AdSense gives it with the in-feed code). */
export const AD_FEED_LAYOUT_KEY = "-6t+ed+2i-1n-4w";

export const ADSENSE_SCRIPT = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

/** Pages that must never show an ad (the REE PVPC data, see above). */
export const AD_FREE_PATHS: readonly string[] = LOCALES.flatMap((locale) => [
  pvpcPath(locale, "today"),
  pvpcPath(locale, "tomorrow"),
  todayPath(locale),
]);

function normalise(path: string): string {
  const clean = path.split(/[?#]/)[0] || "/";
  return clean.endsWith("/") ? clean : `${clean}/`;
}

/** True when no ad may be requested on this page (REE data). */
export function isAdFreePath(path: string): boolean {
  return AD_FREE_PATHS.includes(normalise(path));
}

/**
 * True when manual units may be placed on this page. Ad-free pages and the
 * legal pages get none. Home pages get two (owner, 24 Nov 2026).
 */
export function allowsAdUnits(path: string): boolean {
  const p = normalise(path);
  if (isAdFreePath(p)) return false;
  if (/^\/(ca|es|en)\/legal\//.test(p)) return false;
  return true;
}

/** "ca-pub-…" for the ad tags, from the server-side publisher id. */
export function adClient(publisherId: string | null): string | null {
  return ADS_LIVE && publisherId ? `ca-${publisherId}` : null;
}
