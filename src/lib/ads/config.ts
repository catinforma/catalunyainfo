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
 * - Three manual units placed by components/AdsRuntime.tsx under our rules:
 *   never above the answer, at most one mid-article on long pages, one at the
 *   end, one in the desktop sidebar when it fits. The owner also enabled the
 *   bottom anchor on phones in AdSense (auto ads, overlays only).
 * - No ad at all on the pages that show Red Eléctrica PVPC prices: REE's
 *   terms are non-commercial and its written permission has not been given
 *   (SEO_EXPERIMENTS 2026-11-17 (c)). The script still loads there, paused,
 *   so the consent tool works on every page.
 *
 * The slot ids are public (they are in every page's HTML); the publisher id
 * comes from ADSENSE_PUBLISHER_ID on the server (lib/site.ts).
 */

export { ADS_LIVE };

/** Ad unit ids created in AdSense by the owner on 24 Nov 2026. */
export const AD_SLOTS = {
  /** "ci-mig": in-article (fluid). */
  middle: "9170740903",
  /** "ci-final": Multiplex (autorelaxed). */
  end: "3510773003",
  /** "ci-lateral": display, vertical, responsive. Null until the owner creates it. */
  side: null as string | null,
} as const;

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
 * True when manual units may be placed on this page. Ad-free pages, the three
 * home pages (tool tiles and headlines, nothing to read through) and the legal
 * pages get none.
 */
export function allowsAdUnits(path: string): boolean {
  const p = normalise(path);
  if (isAdFreePath(p)) return false;
  if (/^\/(ca|es|en)\/$/.test(p)) return false;
  if (/^\/(ca|es|en)\/legal\//.test(p)) return false;
  return true;
}

/** "ca-pub-…" for the ad tags, from the server-side publisher id. */
export function adClient(publisherId: string | null): string | null {
  return ADS_LIVE && publisherId ? `ca-${publisherId}` : null;
}
