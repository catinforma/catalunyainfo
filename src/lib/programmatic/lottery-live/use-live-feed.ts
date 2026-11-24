"use client";

import { useEffect, useRef, useState } from "react";

import { LIVE_DRAWS, mayReplace, pollDelay, type LiveGame } from "./phases";

/**
 * Reads a checker's JSON (/data/*.json, served from the live feed) in the
 * browser: once when the page opens, then every minute on the draw day while
 * the draw is not complete (pollDelay), paused while the tab is hidden and
 * refreshed when it comes back. The last good answer is kept: a failed
 * request never replaces numbers already shown (`failed` flags it, the
 * status line prints the time of the numbers kept), and an answer with fewer
 * facts or an older read time than the one held is ignored (a draw only
 * grows; the CDN may hold an older copy for 30 s).
 */

export interface LiveData {
  schema: 1;
  available: boolean;
  complete: boolean;
  readAt: string | null;
  year: number;
  draw: unknown;
}

export interface LiveFeed<T> {
  /** The last good answer (possibly "available: false"), null until one arrives. */
  data: T | null;
  /** The latest request failed. */
  failed: boolean;
  /** The browser has started asking (false on the server render and until hydration). */
  started: boolean;
  /** The clock of the last answer or failure; null before. */
  now: Date | null;
}

/** An answer that is usable for this game: right shape, right year, numbers present when it says so. */
export function acceptLive(game: LiveGame, json: unknown): json is LiveData {
  if (!json || typeof json !== "object") return false;
  const d = json as Partial<LiveData> & { game?: unknown; programme?: unknown };
  if (d.schema !== 1 || typeof d.available !== "boolean" || typeof d.complete !== "boolean") return false;
  if (d.year !== LIVE_DRAWS[game].year) return false;
  if (game !== "navidad" && d.game !== game) return false;
  if (d.available && (!d.draw || typeof d.draw !== "object")) return false;
  if (d.available && game === "nino" && !d.programme) return false;
  return true;
}

const JITTER_MS = 10_000;

/**
 * `initial` is the answer the server holds when it renders the page (the
 * committed snapshot): both the server render and the first client render
 * start from it, so the static HTML after the draw prints the numbers instead
 * of "pending" until the browser has asked. The first request then replaces
 * it (`mayReplace`: never with fewer facts or an older read time).
 */
export function useLiveFeed<T extends LiveData>(game: LiveGame, url: string, initial: T | null = null): LiveFeed<T> {
  const [state, setState] = useState<LiveFeed<T>>({ data: initial, failed: false, started: false, now: null });
  const held = useRef<T | null>(initial);
  const failures = useRef(0);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      clearTimeout(timer);
      let failed = false;
      try {
        const r = await fetch(url, { headers: { accept: "application/json" } });
        if (!r.ok) throw new Error(String(r.status));
        const json: unknown = await r.json();
        if (!acceptLive(game, json)) throw new Error("unusable answer");
        if (mayReplace(held.current, json)) held.current = json as T;
      } catch {
        failed = true;
      }
      if (stopped) return;
      failures.current = failed ? failures.current + 1 : 0;
      const now = new Date();
      setState({ data: held.current, failed, started: true, now });
      // Next ask: a minute on the draw day while incomplete; after a failure
      // outside the draw day, up to three retries 30 s apart (the page may
      // have opened on a flaky connection); never while the tab is hidden (the visibility
      // handler resumes).
      const delay = pollDelay(game, now, held.current?.complete ?? false) ?? (failed && failures.current <= 3 ? 30_000 : null);
      if (delay !== null && !document.hidden) timer = setTimeout(run, delay + Math.random() * JITTER_MS);
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void run();
    };
    document.addEventListener("visibilitychange", onVisible);
    void run();
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [game, url]);

  return state;
}
