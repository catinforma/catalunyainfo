import type { Label, LabelAnswer, Restriction, Schedule, ZbeCity, ZbeSource } from "./types";

/**
 * The two answers of a city page, pure and without a clock of their own, so
 * the browser can run them (ZbeNow.tsx) and the tests can feed them fixtures.
 *
 * `labelAnswer` never says "yes" by default: a label gets "yes" only when the
 * council's page says in words that it can drive in, "no" when a restriction
 * without conditions reaches it, and "depends" when every restriction that
 * reaches it has a condition, or when the council's page says nothing of it.
 */

export function labelAnswer(city: Pick<ZbeCity, "restrictions" | "allowed">, label: Label): LabelAnswer {
  const restrictions: Restriction[] = city.restrictions.filter((r) => r.labels.includes(label));
  if (restrictions.length === 0) return { label, kind: city.allowed.labels.includes(label) ? "yes" : "depends", restrictions };
  return { label, kind: restrictions.some((r) => !r.condition) ? "no" : "depends", restrictions };
}

/** A moment in Europe/Madrid: the date, the weekday (0 = Sunday) and the minutes since midnight. */
export interface Clock {
  iso: string;
  weekday: number;
  minutes: number;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function madridClock(now: Date): Clock {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    iso: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: WEEKDAYS.indexOf(get("weekday")),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function toMinutes(clock: string): number {
  const [h = 0, m = 0] = clock.split(":").map(Number);
  return h * 60 + m;
}

export const wholeDay = (schedule: Schedule): boolean => schedule.from === "00:00" && schedule.to === "24:00";

export interface DayStatus {
  /** Whether the restriction applies at some hour of this day. */
  applies: boolean;
  reason: "weekend" | "holiday" | "working-day" | "every-day";
  /** Now, against the hours: "off" on a day it does not apply. */
  phase: "off" | "before" | "active" | "after";
}

/**
 * Whether a schedule applies on the clock's day and at its minute. `holidays`
 * are the public holidays known for the city (national, regional and, where
 * the site has them, local): a date missing from it counts as a working day,
 * which is the strict reading (the page says so next to the answer).
 */
export function dayStatus(schedule: Schedule, clock: Clock, holidays: readonly string[]): DayStatus {
  let reason: DayStatus["reason"] = "every-day";
  if (schedule.days === "working-weekdays") {
    if (clock.weekday === 0 || clock.weekday === 6) return { applies: false, reason: "weekend", phase: "off" };
    if (holidays.includes(clock.iso)) return { applies: false, reason: "holiday", phase: "off" };
    reason = "working-day";
  }
  const from = toMinutes(schedule.from);
  const to = toMinutes(schedule.to);
  const phase = clock.minutes < from ? "before" : clock.minutes < to ? "active" : "after";
  return { applies: true, reason, phase };
}

/** The schedule of the restriction that reaches most drivers: the first one without a condition, else the first. */
export function mainRestriction(city: Pick<ZbeCity, "slug" | "restrictions">): Restriction {
  const main = city.restrictions.find((r) => !r.condition) ?? city.restrictions[0];
  if (!main) throw new Error(`${city.slug}: a published zone needs at least one access rule`);
  return main;
}

/** The source a statement points at. Throws instead of printing a statement without its source. */
export function sourceOf(city: Pick<ZbeCity, "slug" | "sources">, index: number): ZbeSource {
  const source = city.sources[index];
  if (!source) throw new Error(`${city.slug}: a statement points at source ${index}, which the city does not list`);
  return source;
}
