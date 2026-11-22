"use client";

import { useEffect, useState } from "react";

import { dayStatus, madridClock, type Clock } from "@/lib/programmatic/zbe/logic";
import { nowText } from "@/lib/programmatic/zbe/schedule-text";
import type { Schedule, ZbeLocale } from "@/lib/programmatic/zbe/types";

/**
 * "Does the restriction apply today, and right now?", answered in the
 * browser so the cached page never says what day it is. The server and the
 * first client render print `fallback`; after mount the box reads the clock
 * in Europe/Madrid, and again every minute, so a page left open over the
 * start or the end of the hours moves on.
 *
 * `holidays` are the public holidays known for the city: a day missing from
 * the list is treated as a working day (the note under the box says which
 * holidays the list holds).
 */
export function ZbeNow({ locale, schedule, holidays, fallback }: { locale: ZbeLocale; schedule: Schedule; holidays: string[]; fallback: string }) {
  const [clock, setClock] = useState<Clock | null>(null);
  useEffect(() => {
    // One state update after mount (and one a minute): the server render stays date-free.
    const read = () => setClock(madridClock(new Date()));
    read();
    const timer = window.setInterval(read, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!clock) return <p className="ci-callout ci-callout-info ci-measure">{fallback}</p>;
  const text = nowText(dayStatus(schedule, clock, holidays), schedule, clock, locale);
  return (
    <p className="ci-callout ci-callout-info ci-measure" role="status">
      <strong>{text.day}</strong>
      {text.hour ? ` ${text.hour}` : null}
    </p>
  );
}
