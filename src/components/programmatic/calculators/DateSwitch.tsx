"use client";

import { useSyncExternalStore, type ReactNode } from "react";

/**
 * Shows `after` from the day `on` (Europe/Madrid), `before` until then. The
 * server renders the state of its own day (`serverToday`, the build day on a
 * static page); the browser re-checks its own date after hydration, so a page
 * built in December switches on 1 January without a new build.
 */

const noop = () => () => {};

function madridToday(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function DateSwitch({ on, serverToday, before, after }: { on: string; serverToday: string; before: ReactNode; after: ReactNode }) {
  const today = useSyncExternalStore(noop, madridToday, () => serverToday);
  return <>{today >= on ? after : before}</>;
}
