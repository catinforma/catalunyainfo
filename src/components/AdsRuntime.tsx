"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { AD_SLOTS, ADSENSE_SCRIPT, allowsAdUnits, isAdFreePath } from "@/lib/ads/config";
import { adsQueue, fcQueue } from "@/lib/ads/client";
import type { Locale } from "@/lib/i18n/config";

/**
 * AdSense on the page: loads Google's script once, after the page is
 * interactive, and places our three manual units by rule (lib/ads/config.ts).
 *
 * Rules, so that ads never stand between a reader and the answer:
 * - nothing above the answer: the first in-article unit goes after the
 *   first section (before the second H2) once that point is past the top
 *   half of the screen; a second one further down on longer pages (5+
 *   sections, 3,000+ characters); each at least a screen from the next
 *   (owner, 24 Nov 2026: visible, but not annoying);
 * - the end unit closes the article, before its "sources" heading when the
 *   sources sit inside it, and only on pages with something to read;
 * - the sidebar unit (desktops) only where the sticky sidebar still fits on
 *   screen with it;
 * - at most four per page (two in-article, the end unit, the desktop sidebar); every unit reserves its height before it loads
 *   (no jump) and hides itself if Google has nothing to fill it with
 *   (data-ad-status="unfilled", support.google.com/adsense/answer/10762946).
 *
 * The site navigates without full reloads, so units are removed and placed
 * again on every route change. Entering a page with REE data after ads have
 * run in this tab reloads it, so no anchor or unit can carry over onto it.
 */

const LABEL: Record<Locale, string> = { ca: "Publicitat", es: "Publicidad", en: "Advertisement" };

const SOURCES = /^(fonts|fuentes|sources|official sources|fonts oficials|fuentes oficiales)\b/i;

function unit(kind: "middle" | "end" | "side", client: string, slot: string, label: string, height?: number): HTMLElement {
  const box = document.createElement("aside");
  box.className = `ci-ad ci-ad-${kind}`;
  box.setAttribute("aria-label", label);
  const caption = document.createElement("p");
  caption.className = "ci-ad-label";
  caption.textContent = label;
  const ins = document.createElement("ins");
  ins.className = "adsbygoogle";
  ins.dataset.adClient = client;
  ins.dataset.adSlot = slot;
  if (kind === "middle") {
    ins.style.cssText = "display:block;text-align:center";
    ins.dataset.adLayout = "in-article";
    ins.dataset.adFormat = "fluid";
  } else if (kind === "end") {
    ins.style.cssText = "display:block";
    ins.dataset.adFormat = "autorelaxed";
  } else {
    // A fixed box sized to the room left in the sidebar (responsive unit with an exact CSS size).
    ins.style.cssText = `display:block;width:100%;height:${height}px`;
  }
  box.append(caption, ins);
  return box;
}

function topOf(el: Element): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

/** Places the units for the current page; returns them so they can be removed. */
function placeUnits(client: string, locale: Locale): HTMLElement[] {
  const main = document.getElementById("main") ?? document.querySelector("main");
  if (!main) return [];

  const proses = Array.from(main.querySelectorAll<HTMLElement>(".ci-prose"));
  const directH2 = (el: HTMLElement) => Array.from(el.children).filter((c): c is HTMLElement => c.tagName === "H2");
  const prose = proses.sort((a, b) => directH2(b).length - directH2(a).length || (b.textContent?.length ?? 0) - (a.textContent?.length ?? 0))[0];
  if (!prose) return [];

  const label = LABEL[locale];
  const viewport = window.innerHeight;
  const chars = prose.textContent?.length ?? 0;
  const h2s = directH2(prose);
  const sources = h2s.find((h) => /fuent|font|sourc/i.test(h.id) || SOURCES.test(h.textContent?.trim() ?? ""));
  const placed: HTMLElement[] = [];

  // End of the article.
  let endTop = Infinity;
  if (chars >= 1500) {
    const box = unit("end", client, AD_SLOTS.end, label);
    if (sources) prose.insertBefore(box, sources);
    else prose.append(box);
    endTop = topOf(box);
    placed.push(box);
  }

  // In-article units (owner, 24 Nov 2026: "els anuncis surten molt amagats").
  // First: right after the first section, so the answer is always read
  // first, and only once that point is past the top half of the screen.
  // Second: on longer pages, further down. Every unit at least one screen
  // from the next, and from the end unit.
  const body = sources ? h2s.slice(0, h2s.indexOf(sources)) : h2s;
  const half = viewport * 0.5;
  const tops: number[] = [];
  const far = (top: number) => tops.every((t) => Math.abs(t - top) > viewport) && endTop - top > viewport;
  const candidates: HTMLElement[] = [];
  if (body.length >= 2 && chars >= 2000) candidates.push(body[1]!);
  if (body.length >= 5 && chars >= 3000) candidates.push(body[Math.floor(body.length * 0.65)]!);
  for (const at of candidates) {
    const top = topOf(at);
    if (top > half && far(top)) {
      const box = unit("middle", client, AD_SLOTS.middle, label);
      prose.insertBefore(box, at);
      placed.push(box);
      tops.push(top);
    }
  }

  // Desktop sidebar, only when it still fits under the sticky header.
  const side = AD_SLOTS.side;
  const aside = main.querySelector<HTMLElement>(".ci-article-aside");
  if (side && aside && window.matchMedia("(min-width: 64rem)").matches) {
    const room = viewport - 96 - aside.offsetHeight - 48;
    if (room >= 250) {
      const box = unit("side", client, side, label, Math.min(600, room));
      aside.append(box);
      placed.push(box);
    }
  }

  const q = adsQueue();
  for (let i = 0; i < placed.length; i++) q.push({});
  return placed;
}

export function AdsRuntime({ client, locale }: { client: string; locale: Locale }) {
  const pathname = usePathname() ?? "/";

  // The script, once per tab, after hydration. Paused on REE pages.
  useEffect(() => {
    if (window.__ciAdsScript) return;
    window.__ciAdsScript = true;
    fcQueue();
    const paused = isAdFreePath(window.location.pathname);
    adsQueue().pauseAdRequests = paused ? 1 : 0;
    window.__ciAdsActive = !paused;
    const s = document.createElement("script");
    s.async = true;
    s.src = `${ADSENSE_SCRIPT}?client=${encodeURIComponent(client)}`;
    s.crossOrigin = "anonymous";
    document.head.append(s);
  }, [client]);

  // Per page: REE guard, then the units.
  useEffect(() => {
    if (isAdFreePath(pathname)) {
      if (window.__ciAdsActive) window.location.reload();
      return;
    }
    if (!window.__ciAdsActive) {
      adsQueue().pauseAdRequests = 0;
      window.__ciAdsActive = true;
    }
    if (!allowsAdUnits(pathname)) return;

    let placed: HTMLElement[] = [];
    const timer = window.setTimeout(() => {
      placed = placeUnits(client, locale);
    }, 400);
    return () => {
      window.clearTimeout(timer);
      for (const el of placed) el.remove();
    };
  }, [pathname, client, locale]);

  return null;
}
