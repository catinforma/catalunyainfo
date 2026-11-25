import { adClient, allowsAdUnits } from "@/lib/ads/config";
import type { Locale } from "@/lib/i18n/config";
import { adsensePublisherId } from "@/lib/site";

/**
 * A server-rendered ad slot (owner, 24 Nov 2026: ads at the top of each
 * article and on the home page). The box and its height are in the HTML, so
 * filling it later does not move the text (no layout shift); AdsRuntime puts
 * the AdSense unit inside it. Renders nothing when ads are off or the page
 * may not carry ads (lib/ads/config.ts: REE pages, legal pages).
 *
 * "top" goes on every programmatic template after its first answer block and
 * at the start of EntryArticle bodies; "home-feed" is one card-sized item in
 * the first headlines grid of the home pages. Each box reserves its height in
 * CSS (.ci-ad-*); Google's `unfilled` status collapses it (the top boxes keep
 * their space).
 */
const LABEL: Record<Locale, string> = { ca: "Publicitat", es: "Publicidad", en: "Advertisement" };

export function AdSlot({ kind, locale, path, className = "" }: { kind: "top" | "home-top" | "home-feed" | "home-end"; locale: Locale; path: string; className?: string }) {
  if (!adClient(adsensePublisherId())) return null;
  if (!allowsAdUnits(path)) return null;
  return (
    <aside className={`ci-ad ci-ad-${kind} ${className}`.trim()} data-ci-ad={kind} aria-label={LABEL[locale]}>
      <p className="ci-ad-label">{LABEL[locale]}</p>
      {/* AdsRuntime puts the <ins> in here. Google sets height:auto and
          min-height:0 (!important) on the <ins>'s parent when it fills or
          collapses a unit, so the reserved height lives on the <aside>. */}
      <div className="ci-ad-slot" />
    </aside>
  );
}
