"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { AD_FEED_LAYOUT_KEY, AD_SLOTS, ADSENSE_SCRIPT, allowsAdUnits, isAdFreePath } from "@/lib/ads/config";
import { adsQueue, fcQueue } from "@/lib/ads/client";
import { MAX_UNITS_WITH_RAIL, RAIL_MIN_VIEWPORT, RAIL_WIDTH, isCalculatorToolPath, planInArticle, railCount, railUnitHeight, unitBudget } from "@/lib/ads/placement";
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
 * - calculator pages (no sidebar of their own) get one or two sticky units
 *   in the empty right side of the page on desktops (>= 1100 px, owner 25
 *   Nov); they sit out of the text flow, so they never cover the form or
 *   the results, and they lift the page cap from five to six;
 * - at most five units per page in all (server box, in-article, end,
 *   sidebar; six with the calculator rail); every unit reserves its height before it loads (no jump) and
 *   hides itself if Google has nothing to fill it with
 *   (data-ad-status="unfilled", support.google.com/adsense/answer/10762946).
 *
 * The site navigates without full reloads, so units are removed and placed
 * again on every route change. Entering a page with REE data after ads have
 * run in this tab reloads it, so no anchor or unit can carry over onto it.
 */

const LABEL: Record<Locale, string> = { ca: "Publicitat", es: "Publicidad", en: "Advertisement" };

const SOURCES = /^(fonts|fuentes|sources|official sources|fonts oficials|fuentes oficiales)\b/i;

/**
 * The <div> an <ins> sits in. Google writes `height:auto !important;
 * min-height:0 !important` on the parent of every unit it fills or collapses;
 * with the <ins> straight in the <aside> that wiped the reserved height (a
 * desktop top box went from 317 px to 37 px when unfilled). The <aside> keeps
 * the reservation; this wrapper takes Google's styles.
 */
function slotOf(ins: HTMLElement): HTMLElement {
  const slot = document.createElement("div");
  slot.className = "ci-ad-slot";
  slot.append(ins);
  return slot;
}

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
  box.append(caption, slotOf(ins));
  return box;
}

/**
 * The right rail of a calculator page: `count` sticky boxes stacked down the
 * empty right side of the text column (each sticks within its own half, so
 * two never meet). The column is the one next to .ci-prose; every box is
 * absolutely placed, so nothing in the text flow moves. Its top and bottom
 * follow the text column and its host (ResizeObserver, window resize), so a
 * rewrapped H1 or a late font or image cannot make it drift; below 1100 px CSS
 * hides it (placeUnits removes it and places it again when the window grows).
 */
function railUnits(prose: HTMLElement, client: string, slot: string, label: string, count: 1 | 2, height: number): { boxes: HTMLElement[]; stop: () => void } | null {
  const host = prose.parentElement;
  if (!host) return null;
  host.classList.add("ci-rail-host");
  const rails: HTMLElement[] = [];
  const units: HTMLElement[] = [];
  for (let i = 0; i < count; i++) {
    const rail = document.createElement("div");
    rail.className = "ci-rail";
    const box = unit("side", client, slot, label, height);
    box.className = "ci-rail-unit";
    const ins = box.querySelector<HTMLElement>("ins");
    if (ins) ins.style.cssText = `display:block;width:${RAIL_WIDTH}px;height:${height}px`;
    rail.append(box);
    host.append(rail);
    rails.push(rail);
    units.push(box);
  }
  const layout = () => {
    const top = prose.offsetTop;
    const h = prose.offsetHeight;
    const slice = h / rails.length;
    rails.forEach((rail, i) => {
      rail.style.top = `${Math.round(top + i * slice)}px`;
      rail.style.height = `${Math.round(slice)}px`;
    });
  };
  layout();
  const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(layout);
  // The text column, and its host: the H1 and lead above it rewrap and move it.
  ro?.observe(prose);
  ro?.observe(host);
  window.addEventListener("resize", layout);
  return {
    boxes: units,
    stop: () => {
      ro?.disconnect();
      window.removeEventListener("resize", layout);
      for (const r of rails) r.remove();
      host.classList.remove("ci-rail-host");
    },
  };
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
    (box.querySelector<HTMLElement>(".ci-ad-slot") ?? box).append(ins);
    filled.push(ins);
  }
  return filled;
}

function placeUnits(client: string, locale: Locale, home: boolean, path: string, cleanup: Array<() => void>): HTMLElement[] {
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

  // Calculator pages: the sticky right rail (desktops only; nothing is requested below 1100 px).
  // Placed now if the window is wide enough; placed later if it grows past 1100 px, removed if it shrinks below.
  let rails: HTMLElement[] = [];
  let railStop: (() => void) | null = null;
  if (sideSlot && !aside && isCalculatorToolPath(path)) {
    const wide = window.matchMedia(`(min-width: ${RAIL_MIN_VIEWPORT / 16}rem)`);
    const placeRail = (room: number): HTMLElement[] => {
      const height = railUnitHeight(window.innerHeight);
      const count = Math.min(railCount(prose.offsetHeight), room);
      if (!height || (count !== 1 && count !== 2)) return [];
      const made = railUnits(prose, client, sideSlot, label, count, height);
      if (!made) return [];
      railStop = made.stop;
      return made.boxes;
    };
    if (wide.matches) rails = placeRail(MAX_UNITS_WITH_RAIL);
    const onChange = () => {
      if (!wide.matches) {
        railStop?.();
        railStop = null;
        return;
      }
      if (railStop) return;
      // Late: the page already carries its units; the rail only takes what is left under the cap of six.
      const used = main.querySelectorAll("aside.ci-ad ins.adsbygoogle").length;
      const late = placeRail(MAX_UNITS_WITH_RAIL - used);
      for (let i = 0; i < late.length; i++) adsQueue().push({});
    };
    wide.addEventListener("change", onChange);
    cleanup.push(() => {
      wide.removeEventListener("change", onChange);
      railStop?.();
      railStop = null;
    });
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
  const boxes: HTMLElement[] = [...slots.map((ins) => ins.closest<HTMLElement>(".ci-ad") ?? ins), ...(endBox ? [endBox] : [])];
  const body = (sources ? h2s.slice(0, h2s.indexOf(sources)) : h2s).filter((h) => !h.closest("table, ul, ol, details"));
  const budget = unitBudget(boxes.length + (sideBox ? 1 : 0) + rails.length, rails.length ? MAX_UNITS_WITH_RAIL : undefined);
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
  // The rail boxes are already in the page; they only need their ad request.
  placed.push(...rails);

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
    const cleanup: Array<() => void> = [];
    const timer = window.setTimeout(() => {
      placed = placeUnits(client, locale, home, pathname, cleanup);
    }, 400);
    return () => {
      window.clearTimeout(timer);
      for (const el of placed) el.remove();
      for (const stop of cleanup) stop();
    };
  }, [pathname, client, locale]);

  return null;
}
