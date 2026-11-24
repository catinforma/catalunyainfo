"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { AD_FEED_LAYOUT_KEY, AD_SLOTS, ADSENSE_SCRIPT, allowsAdUnits, isAdFreePath } from "@/lib/ads/config";
import { adsQueue, fcQueue } from "@/lib/ads/client";
import { planInArticle, unitBudget } from "@/lib/ads/placement";
import type { Locale } from "@/lib/i18n/config";

/**
 * AdSense on the page: loads Google's script once, after the page is
 * interactive, fills the server-rendered boxes (components/AdSlot.tsx) and
 * places the manual units by rule (lib/ads/config.ts, lib/ads/placement.ts).
 *
 * Rules (owner, 24 Nov 2026: "more ads, even if they annoy"), which keep an
 * ad from ever standing between a reader and the answer:
 * - nothing above the answer: the first in-article unit goes after the first
 *   section (before the second H2) once that point is past the top half of
 *   the screen; then one every ~2 screens, each at least 0.75 of a screen of
 *   text from any other unit, only before a direct H2 of the article body
 *   (never inside a table, list or block) and never before the sources
 *   heading;
 * - the end unit closes the article, before its "sources" heading when the
 *   sources sit inside it, and only on pages with something to read;
 * - the sidebar unit (desktops) only where the sticky sidebar still fits on
 *   screen with it;
 * - at most five units per page in all (server box, in-article, end,
 *   sidebar); every unit reserves its height before it loads (no jump) and
 *   hides itself if Google has nothing to fill it with
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

/**
 * Fills the server-rendered slots (components/AdSlot.tsx): the top box of an
 * article, the home boxes. Their height is already in the HTML, so filling
 * them moves nothing. Returns the inserted <ins> elements.
 */
function fillSlots(main: HTMLElement, client: string): HTMLElement[] {
  const filled: HTMLElement[] = [];
  for (const box of Array.from(main.querySelectorAll<HTMLElement>("[data-ci-ad]"))) {
    if (box.querySelector("ins.adsbygoogle")) continue;
    const kind = box.dataset.ciAd;
    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.dataset.adClient = client;
    if (kind === "home-end") {
      ins.dataset.adSlot = AD_SLOTS.end;
      ins.style.cssText = "display:block";
      ins.dataset.adFormat = "autorelaxed";
    } else if (kind === "home-feed") {
      // "ci-portada": in-feed, image on top (AdSense's own snippet).
      ins.dataset.adSlot = AD_SLOTS.feed;
      ins.style.cssText = "display:block";
      ins.dataset.adFormat = "fluid";
      ins.dataset.adLayoutKey = AD_FEED_LAYOUT_KEY;
    } else {
      // "ci-dalt": responsive display, full width (AdSense's own snippet).
      ins.dataset.adSlot = AD_SLOTS.top;
      ins.style.cssText = "display:block";
      ins.dataset.adFormat = "auto";
      ins.dataset.fullWidthResponsive = "true";
    }
    box.append(ins);
    filled.push(ins);
  }
  return filled;
}

function placeUnits(client: string, locale: Locale, home: boolean): HTMLElement[] {
  const main = document.getElementById("main") ?? document.querySelector("main");
  if (!main) return [];
  const slots = fillSlots(main, client);
  const pushAll = (els: HTMLElement[]) => {
    const q = adsQueue();
    for (let i = 0; i < els.length; i++) q.push({});
    return els;
  };
  if (home) return pushAll(slots);

  const proses = Array.from(main.querySelectorAll<HTMLElement>(".ci-prose"));
  const directH2 = (el: HTMLElement) => Array.from(el.children).filter((c): c is HTMLElement => c.tagName === "H2");
  const prose = proses.sort((a, b) => directH2(b).length - directH2(a).length || (b.textContent?.length ?? 0) - (a.textContent?.length ?? 0))[0];
  if (!prose) return pushAll(slots);

  const label = LABEL[locale];
  const viewport = window.innerHeight;
  const chars = prose.textContent?.length ?? 0;
  const h2s = directH2(prose);
  const sources = h2s.find((h) => /fuent|font|sourc/i.test(h.id) || SOURCES.test(h.textContent?.trim() ?? ""));
  const placed: HTMLElement[] = [];

  // Desktop sidebar, only when it still fits under the sticky header: the
  // aside is sticky (top: 6rem) and the unit sits below its index.
  const sideSlot = AD_SLOTS.side;
  const aside = main.querySelector<HTMLElement>(".ci-article-aside");
  let sideBox: HTMLElement | null = null;
  if (sideSlot && aside && window.matchMedia("(min-width: 64rem)").matches) {
    const room = viewport - 96 - aside.offsetHeight - 48;
    if (room >= 250) sideBox = unit("side", client, sideSlot, label, Math.min(600, room));
  }

  // End of the article.
  let endBox: HTMLElement | null = null;
  if (chars >= 1500) {
    endBox = unit("end", client, AD_SLOTS.end, label);
    if (sources) prose.insertBefore(endBox, sources);
    else prose.append(endBox);
    placed.push(endBox);
  }

  // Top of the article: the server-rendered slot, if the template has one.
  placed.push(...slots);

  // In-article units: the first after the first section, the rest every ~2
  // screens (lib/ads/placement.ts), up to five units on the page in all.
  const boxes: HTMLElement[] = [...slots.map((ins) => ins.parentElement ?? ins), ...(endBox ? [endBox] : [])];
  const body = (sources ? h2s.slice(0, h2s.indexOf(sources)) : h2s).filter((h) => !h.closest("table, ul, ol, details"));
  const budget = unitBudget(boxes.length + (sideBox ? 1 : 0));
  if (chars >= 2000 && body.length >= 2) {
    const units = boxes.map((b) => ({ top: topOf(b), bottom: topOf(b) + b.offsetHeight }));
    const picks = planInArticle({ headings: body.map(topOf), units, viewport, budget });
    // Insert from the last up, so the measured tops above stay true while placing.
    const made: HTMLElement[] = [];
    for (const i of picks.slice().reverse()) {
      // The first (topmost) pick has "ci-mig"; the further ones "ci-mig-2".
      const slot = i === picks[0] ? AD_SLOTS.middle : AD_SLOTS.middle2;
      const box = unit("middle", client, slot, label);
      prose.insertBefore(box, body[i]!);
      made.push(box);
    }
    placed.push(...made.reverse());
  }

  if (sideBox && aside) {
    aside.append(sideBox);
    placed.push(sideBox);
  }

  return pushAll(placed);
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
    const home = /^\/(ca|es|en)\/?$/.test(pathname);

    let placed: HTMLElement[] = [];
    const timer = window.setTimeout(() => {
      placed = placeUnits(client, locale, home);
    }, 400);
    return () => {
      window.clearTimeout(timer);
      for (const el of placed) el.remove();
    };
  }, [pathname, client, locale]);

  return null;
}
