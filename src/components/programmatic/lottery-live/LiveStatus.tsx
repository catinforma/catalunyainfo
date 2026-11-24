"use client";

import type { Locale } from "@/lib/i18n/config";
import type { CSSProperties } from "react";

import { hhmmMadrid, liveCopy, reservedHeight } from "@/lib/programmatic/lottery-live/copy";
import { kindWithoutClock, liveDisplay, type LiveGame } from "@/lib/programmatic/lottery-live/phases";
import type { LiveData, LiveFeed } from "@/lib/programmatic/lottery-live/use-live-feed";

/**
 * What the checker says about the official numbers: pending before the data,
 * the numbers so far, complete, missing after the day, and a warning with the
 * time of the last good read when the feed fails. The official place to check
 * is linked in every state. On the server render (no clock yet) it prints the
 * "pending: the draw is on …" notice, which is true until the draw day.
 */
export function LiveStatus<T extends LiveData>({
  game,
  locale,
  feed,
  officialHref,
  number,
}: {
  game: LiveGame;
  locale: Locale;
  feed: LiveFeed<T>;
  officialHref: string;
  /** A valid number the reader asked about, if any: with no data it is answered "pending". */
  number?: string;
}) {
  const t = liveCopy(game, locale);
  const d = feed.data;
  const display = feed.now
    ? liveDisplay({ game, now: feed.now, available: Boolean(d?.available), complete: Boolean(d?.complete), fetchFailed: feed.failed, hasData: d !== null })
    : null;
  // No clock yet (server render, first client render): the data decides if there is any, else the
  // draw is still ahead. With the committed snapshot as initial data the HTML after the draw says so.
  const kind = display?.kind ?? kindWithoutClock(d);
  const reserve = reservedHeight(game, locale);
  const time = d?.readAt ? hhmmMadrid(d.readAt) : "";
  const copy = t.kind[kind](time);
  const asking = number && !d?.available ? t.pendingFor(number) : null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`ci-callout ci-live-status ${display?.warning ? "ci-callout-warning" : "ci-callout-info"}`}
      style={{ "--live-min-narrow": reserve.narrow, "--live-min-wide": reserve.wide } as CSSProperties}
    >
      <p>
        <strong>{copy.title}</strong>
      </p>
      <p>{copy.text}</p>
      {asking ? (
        <p>
          <strong>{asking}</strong>
        </p>
      ) : null}
      {display?.warning === "stale" ? <p>{t.stale(time)}</p> : null}
      {display?.warning === "unreachable" ? <p>{t.unreachable}</p> : null}
      <p>
        {t.officialLead}{" "}
        <a href={officialHref} rel="noopener" target="_blank">
          {t.officialLabel}
        </a>
        .
      </p>
    </div>
  );
}
