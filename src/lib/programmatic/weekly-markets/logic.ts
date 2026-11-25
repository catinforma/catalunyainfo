import type { Hhmm, Market, MarketException, MarketTown, Session } from "./types";

/**
 * "When is the next market?", as pure functions of a town's data and a clock
 * in Europe/Madrid. No data import and no `Date.now()`: the page passes the
 * moment in, the tests pass fixed ones.
 *
 * The rules, in the order they apply to a day:
 *  1. a market is held on its weekdays;
 *  2. an exception of kind "cancelled" or "moved" removes that day's session
 *     of the markets it names; a "moved" one adds a session on `movedTo`
 *     (same hours) for the same markets;
 *  3. a session ends at its closing time; a market whose hours the council
 *     does not publish ("horari de matí") counts as held until midnight,
 *     so the answer rolls over at 00:00 and never earlier than the council
 *     says;
 *  4. an exception lapses the day after it applies (`validUntil`).
 */

/** Resolves a public holiday of the town (Catalonia-wide or local) to its name. */
export type HolidayName = (iso: string) => string | null;

export interface Clock {
  /** ISO date in Madrid. */
  iso: string;
  /** "HH:MM" in Madrid. */
  hhmm: Hhmm;
}

/** The Madrid date and time of an instant. Deterministic for a given instant. */
export function madridClock(now: Date): Clock {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return { iso: `${get("year")}-${get("month")}-${get("day")}`, hhmm: `${get("hour")}:${get("minute")}` };
}

export function weekdayOf(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(`${iso}T12:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

/** The last day an exception changes anything: its date, or the day the session is moved to. */
export function validUntil(ex: MarketException): string {
  return ex.movedTo && ex.movedTo > ex.date ? ex.movedTo : ex.date;
}

/** Exceptions still to come or happening today, soonest first. A lapsed one is gone. */
export function activeExceptions(town: Pick<MarketTown, "exceptions">, today: string): MarketException[] {
  return town.exceptions.filter((ex) => validUntil(ex) >= today).sort((a, b) => a.date.localeCompare(b.date));
}

/** How long a council listing may stay unread before an exception that depends on it is flagged. */
export const STALE_AFTER_DAYS = 14;

/**
 * True when the page must tell the reader to confirm an active exception:
 * only a listing of it was read (not the council's act), or the listing was
 * read more than `STALE_AFTER_DAYS` ago. Lapsed exceptions never need it.
 */
export function needsConfirmation(town: Pick<MarketTown, "sources" | "exceptions">, ex: MarketException, today: string): boolean {
  if (validUntil(ex) < today) return false;
  if (!ex.documentRead) return true;
  const source = town.sources.find((s) => s.id === ex.src);
  return !source || daysBetween(source.readOn, today) > STALE_AFTER_DAYS;
}

function marketSessionOn(market: Market, iso: string, status: Session["status"]): Session {
  return { date: iso, marketId: market.id, areaId: market.area.id, from: market.hours?.[0] ?? null, to: market.hours?.[1] ?? null, status };
}

/** Every session of the town on one day. */
export function sessionsOn(town: MarketTown, iso: string, holidayName: HolidayName): Session[] {
  const out: Session[] = [];
  const weekday = weekdayOf(iso);
  for (const market of town.markets) {
    const own = town.exceptions.find((ex) => ex.date === iso && ex.markets.includes(market.id));
    const movedHere = town.exceptions.find((ex) => ex.kind === "moved" && ex.movedTo === iso && ex.markets.includes(market.id));
    if (movedHere) {
      out.push({ ...marketSessionOn(market, iso, "exception"), movedFrom: movedHere.date });
      continue;
    }
    if (!market.days.includes(weekday)) continue;
    if (own && (own.kind === "cancelled" || own.kind === "moved")) continue;
    if (own?.kind === "normal") {
      out.push(marketSessionOn(market, iso, "exception"));
      continue;
    }
    const covered = town.calendarThrough !== null && iso <= town.calendarThrough;
    if (town.calendarThrough !== null && !covered) {
      out.push(marketSessionOn(market, iso, "calendar-pending"));
      continue;
    }
    if (covered) {
      out.push(marketSessionOn(market, iso, "calendar"));
      continue;
    }
    const holiday = holidayName(iso);
    out.push(holiday ? { ...marketSessionOn(market, iso, "holiday-unconfirmed"), holiday } : marketSessionOn(market, iso, "usual"));
  }
  const order = (id: string) => town.markets.findIndex((m) => m.id === id);
  return out.sort((a, b) => a.date.localeCompare(b.date) || (a.from ?? "").localeCompare(b.from ?? "") || order(a.marketId) - order(b.marketId));
}

/** Whether the session has finished at this time of its own day. A session with no published closing time lasts until midnight. */
export function sessionOver(session: Pick<Session, "to">, hhmm: Hhmm): boolean {
  return session.to !== null && hhmm >= session.to;
}

/** Whether the session is open at this time of its own day (only when its hours are known). */
export function sessionOpen(session: Pick<Session, "from" | "to">, hhmm: Hhmm): boolean {
  return session.from !== null && session.to !== null && hhmm >= session.from && hhmm < session.to;
}

export interface UpcomingOptions {
  /** Restrict to these markets (a square's markets). */
  marketIds?: readonly string[];
  /** Days to look ahead, today included. */
  horizonDays?: number;
  /** At most this many sessions. */
  limit?: number;
}

/**
 * The sessions from `clock` on: today's only while not over, then the days
 * ahead. Sorted by date and opening time.
 */
export function upcomingSessions(town: MarketTown, clock: Clock, holidayName: HolidayName, options: UpcomingOptions = {}): Session[] {
  const { marketIds, horizonDays = 120, limit = Infinity } = options;
  const out: Session[] = [];
  for (let offset = 0; offset < horizonDays && out.length < limit; offset++) {
    const iso = addDays(clock.iso, offset);
    for (const session of sessionsOn(town, iso, holidayName)) {
      if (marketIds && !marketIds.includes(session.marketId)) continue;
      if (offset === 0 && sessionOver(session, clock.hhmm)) continue;
      out.push(session);
    }
  }
  return out.slice(0, limit);
}

/** The next session, or null if none inside the horizon. */
export function nextSession(town: MarketTown, clock: Clock, holidayName: HolidayName, options: UpcomingOptions = {}): Session | null {
  return upcomingSessions(town, clock, holidayName, { ...options, limit: 1 })[0] ?? null;
}

/** Sessions of the same day as `first`, for "today there are two": same date, other markets. */
export function sameDay(sessions: readonly Session[], first: Session): Session[] {
  return sessions.filter((s) => s.date === first.date);
}
