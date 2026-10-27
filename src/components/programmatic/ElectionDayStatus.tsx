"use client";

import { useSyncExternalStore } from "react";

import { dayLine, madridDate, type DayLines } from "@/lib/programmatic/elections/today";

const noop = () => () => {};

/**
 * The one line on the election pages that depends on today's date. The server
 * renders the fallback, which is true on any day; in the browser the line
 * becomes a countdown, the day itself, or the past tense, from the date in
 * Madrid. Nothing about today reaches the cached HTML, so the pages never need
 * a nightly revalidation.
 */
export function ElectionDayStatus({ lines }: { lines: DayLines }) {
  const date = useSyncExternalStore(
    noop,
    () => madridDate(new Date()),
    () => null,
  );
  return <>{dayLine(date, lines)}</>;
}
