"use client";

import { useEffect } from "react";

import { classifyLinkClick, classifyReturnStepClick, classifySchoolJumpClick } from "@/lib/analytics/clicks";
import { track } from "@/lib/analytics/events";
import type { Locale } from "@/lib/i18n/config";

/**
 * One delegated click listener for the link events (lib/analytics/clicks.ts
 * decides which links count): the WhatsApp channel, the calendar feeds and
 * official sources. Those links are server-rendered all over the site, so
 * one listener here beats turning each of them into a client component.
 *
 * Renders nothing. Before consent `track()` is a no-op, so a click costs a
 * `closest()` and a URL parse, nothing more.
 */
export function AnalyticsClicks({ locale, channelUrl }: { locale: Locale; channelUrl: string }) {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (typeof window.gtag !== "function") return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const box = link.closest("[data-ci-placement]");
      const measured = classifyLinkClick({
        href: link.href,
        siteHost: window.location.hostname,
        locale,
        channelUrl,
        inSources: link.closest(".ci-sources") !== null,
        inCalculator: link.closest(".ci-calc") !== null,
        placement: box?.getAttribute("data-ci-placement"),
      });
      if (measured) track(measured);
      // The "keep it" block of the strike and election pages: one more event, with its position and target type.
      const step = classifyReturnStepClick({
        href: link.href,
        siteHost: window.location.hostname,
        locale,
        placement: box?.getAttribute("data-ci-placement"),
        position: box?.getAttribute("data-ci-position"),
        family: box?.getAttribute("data-ci-family"),
        target: link.getAttribute("data-ci-target"),
      });
      if (step) track(step);
      // The school calendar's "go to your community" list.
      const jump = classifySchoolJumpClick({ href: link.href, locale, placement: box?.getAttribute("data-ci-placement") });
      if (jump) track(jump);
    };
    // Capture phase: a component that stops propagation still gets counted.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [locale, channelUrl]);

  return null;
}
