"use client";

import { useEffect } from "react";

/**
 * Reloads the polls page when the LOREG 69.7 blackout starts, so a tab opened
 * before 24 Nov 00:00 does not keep showing figures into the window: the
 * reload asks the server (the page is `no-store`), which then renders the
 * blackout view. Receives a timestamp only, never a figure.
 *
 * Nothing is scheduled if the start has passed by the browser's clock (a
 * clock running ahead would otherwise reload in a loop while the server still
 * renders the figures) or is more than ~24.8 days away (setTimeout's limit).
 */
export function PollsReload({ at }: { at: number }) {
  useEffect(() => {
    const wait = at - Date.now();
    if (wait <= 0 || wait > 2_147_483_647) return;
    const id = window.setTimeout(() => window.location.reload(), wait + 1_000);
    return () => window.clearTimeout(id);
  }, [at]);
  return null;
}
