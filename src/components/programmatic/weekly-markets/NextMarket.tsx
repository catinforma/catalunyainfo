"use client";

import { useEffect, useState } from "react";

import { track } from "@/lib/analytics/events";
import { NO_SESSION, composeAnswer, currentOption, type AnswerZone } from "@/lib/programmatic/weekly-markets/answer";
import { madridClock, type Clock } from "@/lib/programmatic/weekly-markets/logic";
import type { MkLocale } from "@/lib/programmatic/weekly-markets/types";

/**
 * "Pròxim mercat a Vic: dissabte 28 de novembre, plaça Major, horari de
 * matí." The server render already holds the whole answer (the cached page
 * is revalidated every hour and after midnight, Madrid time); this component
 * only keeps it right in a tab left open and lets the reader pick a square
 * or neighbourhood. Without JavaScript the sentence below and the table of
 * markets are the complete answer, and the picker never appears.
 *
 * The choice stays in the component: no query string, no hash, so the page
 * keeps one URL. One `town_select` (tool `market_square`) per deliberate
 * choice, never for the server-rendered default.
 */
export function NextMarket({
  locale,
  zones,
  initialText,
  initialNotice,
  pickerLabel,
  noticeLabel,
  noticeHref,
}: {
  locale: MkLocale;
  zones: AnswerZone[];
  /** The server's answer for the "all" zone, shown until the clock is read. */
  initialText: string;
  initialNotice: boolean;
  pickerLabel: string;
  noticeLabel: string;
  noticeHref: string;
}) {
  const [zoneId, setZoneId] = useState("all");
  const [clock, setClock] = useState<Clock | null>(null);

  useEffect(() => {
    // One state update after mount (the server render stays as the cache has it), then once a minute.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClock(madridClock(new Date()));
    const timer = window.setInterval(() => setClock(madridClock(new Date())), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const zone = zones.find((z) => z.id === zoneId) ?? zones[0]!;
  const option = clock ? currentOption(zone.options, clock.iso, clock.hhmm) : null;
  const text = clock ? (option ? composeAnswer(option, clock.iso, locale) : NO_SESSION[locale]) : initialText;
  const notice = clock ? (option?.notice ?? false) : initialNotice;

  return (
    <div className="ci-today" aria-live="polite">
      <p className="ci-today-answer is-not">{text}</p>
      {notice ? (
        <p className="ci-today-note">
          <a href={noticeHref} rel="noopener nofollow" target="_blank">
            {noticeLabel}
          </a>
        </p>
      ) : null}
      {clock && zones.length > 2 ? (
        <p className="ci-today-note">
          <label>
            {pickerLabel}{" "}
            <select
              value={zoneId}
              onChange={(event) => {
                setZoneId(event.target.value);
                track({ name: "town_select", params: { tool: "market_square", locale } });
              }}
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.label}
                </option>
              ))}
            </select>
          </label>
        </p>
      ) : null}
    </div>
  );
}
