"use client";

import { useEffect } from "react";

import { classifyLinkClick } from "@/lib/analytics/clicks";
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
      const measured = classifyLinkClick({
        href: link.href,
        siteHost: window.location.hostname,
        locale,
        channelUrl,
        inSources: link.closest(".ci-sources") !== null,
        inCalculator: link.closest(".ci-calc") !== null,
        placement: link.closest("[data-ci-placement]")?.getAttribute("data-ci-placement"),
      });
      if (measured) track(measured);
    };
    // Capture phase: a component that stops propagation still gets counted.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [locale, channelUrl]);

  return null;
}
