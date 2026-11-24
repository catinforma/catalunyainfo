import { adClient, allowsAdUnits } from "@/lib/ads/config";
import type { Locale } from "@/lib/i18n/config";
import { adsensePublisherId } from "@/lib/site";

/**
 * A server-rendered ad slot (owner, 24 Nov 2026: ads at the top of each
 * article and on the home page). The box and its height are in the HTML, so
 * filling it later does not move the text (no layout shift); AdsRuntime puts
 * the AdSense unit inside it. Renders nothing when ads are off or the page
 * may not carry ads (lib/ads/config.ts: REE pages, legal pages).
 */
const LABEL: Record<Locale, string> = { ca: "Publicitat", es: "Publicidad", en: "Advertisement" };

export function AdSlot({ kind, locale, path, className = "" }: { kind: "top" | "home-top" | "home-end"; locale: Locale; path: string; className?: string }) {
  if (!adClient(adsensePublisherId())) return null;
  if (!allowsAdUnits(path)) return null;
  return (
    <aside className={`ci-ad ci-ad-${kind} ${className}`.trim()} data-ci-ad={kind} aria-label={LABEL[locale]}>
      <p className="ci-ad-label">{LABEL[locale]}</p>
    </aside>
  );
}
