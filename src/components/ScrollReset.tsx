"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Starts every new page at the top.
 *
 * Each page renders its own sticky header, so after a client-side navigation
 * Next.js finds the new segment's first element (that header) already in view
 * and keeps the old scroll position: tapping "Agenda" from halfway down a page
 * opened the agenda halfway down, on whatever card happened to be there.
 * Back and forward keep the browser's restored position, and a link to an
 * anchor (#section) is left to scroll to its target.
 */
export function ScrollReset() {
  const pathname = usePathname();
  const first = useRef(true);
  const fromHistory = useRef(false);

  useEffect(() => {
    const onPop = () => {
      fromHistory.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
