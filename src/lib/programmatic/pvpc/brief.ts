/**
 * Today's PVPC in a compact form for the "Avui a Catalunya" page, which
 * picks the current hour in the browser. Server side: `briefPayload` (the
 * /api/pvpc/today/ route). Browser side: `parseBriefPayload` and `briefAt`.
 * Pure: `now` is passed in. Every figure is REE's.
 */

import { isCompleteDay, type PvpcHour } from "./parse";
import { summarize, type DaySummary, type HourView } from "./periods";
import { currentHourIndex, madridDate } from "./time";
import type { PvpcView } from "./view";

export const PVPC_TODAY_ENDPOINT = "/api/pvpc/today/";

export interface PvpcBriefPayload {
  /** Madrid date of the prices. */
  date: string;
  hours: Pick<PvpcHour, "start" | "price">[];
  /** When REE answered (ISO). */
  fetchedAt: string;
  /** REE's last update of the series (ISO). */
  updated: string | null;
  /** Whether tomorrow's prices are already out. */
  tomorrow: boolean;
}

/** Today's prices from the server view; null when REE's prices for today are not held. */
export function briefPayload(view: PvpcView): PvpcBriefPayload | null {
  if (!view.today || !view.fetchedAt) return null;
  return {
    date: view.today.date,
    hours: view.today.hours.map((h) => ({ start: h.start, price: h.price })),
    fetchedAt: view.fetchedAt,
    updated: view.updated,
    tomorrow: view.tomorrow !== null,
  };
}

export function parseBriefPayload(json: unknown): PvpcBriefPayload | null {
  if (!json || typeof json !== "object") return null;
  const p = json as Partial<PvpcBriefPayload>;
  if (typeof p.date !== "string" || !Array.isArray(p.hours) || typeof p.fetchedAt !== "string") return null;
  const day = { date: p.date, hours: p.hours.map((h) => ({ start: String(h?.start), price: Number(h?.price) })) };
  if (!isCompleteDay(day)) return null;
  return { date: p.date, hours: day.hours, fetchedAt: p.fetchedAt, updated: typeof p.updated === "string" ? p.updated : null, tomorrow: p.tomorrow === true };
}

/** The current hour and the day's figures, only if the payload is for today in Madrid. */
export function briefAt(payload: PvpcBriefPayload, now: number): { current: HourView | null; summary: DaySummary } | null {
  if (payload.date !== madridDate(now)) return null;
  const summary = summarize({ date: payload.date, hours: payload.hours });
  if (!summary) return null;
  const index = currentHourIndex(payload.hours.map((h) => Date.parse(h.start)), now);
  return { current: index >= 0 ? summary.hours[index]! : null, summary };
}
