/**
 * Draw-day phases of the three lottery checkers (Christmas 22 Dec 2026, La
 * Grossa de Cap d'Any 31 Dec 2026, El Niño 6 Jan 2027), as pure functions of
 * a clock and of what the data feed holds. Client-safe, no I/O, no clock of
 * its own: the page, the browser and the tests pass `now`.
 *
 * The phases are a function of the Madrid calendar day only, never of a draw
 * start time: SELAE's 2026 start time is not published yet (the 2025 dossier
 * said 09:00; unverified for 2026, docs/SEO_EXPERIMENTS.md, 24 Nov 2026) and
 * Loteries de Catalunya announces La Grossa's about ten days before. What
 * decides what the reader sees at 08:59, 09:00 or 13:30 on the draw day is
 * the data: nothing published = "pending", some numbers = "so far", every
 * number = "complete". So nothing here needs a deploy when a time is
 * announced or the draw runs late.
 */

export type LiveGame = "navidad" | "grossa" | "nino";

export interface LiveDraw {
  /** Draw day, Madrid calendar day. */
  date: string;
  /** The programme's year (the data's `year`). */
  year: number;
}

/** The three draws. Dates are checked against the pages' own constants by tests/lottery-live.test.ts. */
export const LIVE_DRAWS: Record<LiveGame, LiveDraw> = {
  navidad: { date: "2026-12-22", year: 2026 },
  grossa: { date: "2026-12-31", year: 2026 },
  nino: { date: "2027-01-06", year: 2027 },
};

/** before = until the draw day starts (00:00 Madrid); draw-day = the whole Madrid day; after = from the next day. */
export type Phase = "before" | "draw-day" | "after";

/** "2026-12-22" in Madrid for an instant. */
export function madridDay(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function phaseOf(game: LiveGame, now: Date): Phase {
  const day = madridDay(now);
  const draw = LIVE_DRAWS[game].date;
  return day < draw ? "before" : day === draw ? "draw-day" : "after";
}

/** What the page shows about the numbers. */
export type LiveKind =
  /** Before the draw day: no official numbers exist yet. */
  | "pending-before"
  /** Draw day, nothing published on our feed yet. */
  | "pending-today"
  /** Some numbers are in, the draw or the list is not complete. */
  | "partial"
  /** Every number is in. */
  | "complete"
  /** The draw day is over and our feed still holds nothing: say so, link the official list. */
  | "missing-after";

export interface LiveInput {
  game: LiveGame;
  now: Date;
  /** The feed holds at least one official number. */
  available: boolean;
  /** The feed holds every number. */
  complete: boolean;
  /** The last request for the feed failed (network, 5xx, unusable answer). */
  fetchFailed: boolean;
  /** A good answer was received earlier in this visit (so numbers can be shown from it). */
  hasData: boolean;
}

export interface LiveDisplay {
  kind: LiveKind;
  phase: Phase;
  /**
   * stale: the feed failed but the last good numbers are kept and shown with
   * their time; unreachable: it failed and there is nothing to show.
   */
  warning: null | "stale" | "unreachable";
}

export function liveDisplay(i: LiveInput): LiveDisplay {
  const phase = phaseOf(i.game, i.now);
  const kind: LiveKind = i.available
    ? i.complete
      ? "complete"
      : "partial"
    : phase === "before"
      ? "pending-before"
      : phase === "draw-day"
        ? "pending-today"
        : "missing-after";
  const warning = i.fetchFailed ? (i.hasData ? "stale" : "unreachable") : null;
  return { kind, phase, warning };
}

/**
 * What to say with no clock (the server render and the first client render):
 * the data decides when there is any, else the draw is still ahead. With the
 * committed snapshot as the initial data, the static HTML after the draw
 * prints "so far" / "complete" instead of "pending".
 */
export function kindWithoutClock(d: { available: boolean; complete: boolean } | null): LiveKind {
  return d?.available ? (d.complete ? "complete" : "partial") : "pending-before";
}

/** Poll period while a draw is running. */
export const POLL_MS = 60_000;

/**
 * How long to wait before asking the feed again, or null for "do not poll".
 * Only on the draw day and only while the draw is not complete: before it
 * nothing changes, after it a reload is enough. (A tab left open all day
 * costs one cached request a minute.)
 */
export function pollDelay(game: LiveGame, now: Date, complete: boolean): number | null {
  return phaseOf(game, now) === "draw-day" && !complete ? POLL_MS : null;
}

/**
 * Whether an answer may replace the one held: a draw only grows. A reply
 * that carries fewer facts (an older CDN copy) or an older read time than
 * what the visitor already has is ignored. `held` null accepts anything.
 */
export function mayReplace(held: { available: boolean; readAt: string | null } | null, next: { available: boolean; readAt: string | null }): boolean {
  if (!held) return true;
  if (held.available && !next.available) return false;
  const a = held.readAt ? Date.parse(held.readAt) : NaN;
  const b = next.readAt ? Date.parse(next.readAt) : NaN;
  if (Number.isFinite(a) && Number.isFinite(b) && b < a) return false;
  return true;
}
