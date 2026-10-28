import { isLineId, type AlertSource, type AlertsPayload, type CompactAlert, type LineId } from "./types";

/**
 * Browser-side logic of the live block: what to show from the alerts JSON,
 * and how old it is. Pure and small, with no snapshot import, so the client
 * bundle stays light. Every date here is read in the browser, never in the
 * server HTML.
 */

/** Older than this (from the source's own time), an answer is not shown as current. */
export const STALE_AFTER_MS = 15 * 60 * 1000;

export const ALERTS_ENDPOINT = "/api/rodalies/alerts/";

/** Madrid civil date of an instant, "2026-10-28". */
export function madridDate(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(instant);
}

function previousDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** When a notice was published, relative to today in Madrid. */
export function noticeDay(date: string | null, now: Date): "today" | "yesterday" | "earlier" | "unknown" {
  if (!date) return "unknown";
  const today = madridDate(now);
  if (date === today) return "today";
  if (date === previousDay(today)) return "yesterday";
  return "earlier";
}

/** The time the answer describes: the source's own timestamp, else when we read it. */
export function answerTime(payload: AlertsPayload): string {
  return payload.sourceUpdatedAt ?? payload.fetchedAt;
}

/** Whole minutes since an instant, never negative (a fast client clock reads as 0). */
export function minutesSince(iso: string, now: Date): number {
  const ms = now.getTime() - new Date(iso).getTime();
  return Number.isFinite(ms) ? Math.max(0, Math.floor(ms / 60000)) : Number.POSITIVE_INFINITY;
}

export function isStale(payload: AlertsPayload, now: Date): boolean {
  const age = now.getTime() - Date.parse(answerTime(payload));
  return !Number.isFinite(age) || age > STALE_AFTER_MS;
}

/** The notices that name a line, in the order the source gave them. */
export function alertsForLine(alerts: CompactAlert[], line: LineId): CompactAlert[] {
  return alerts.filter((a) => a.lines.includes(line));
}

const isString = (v: unknown): v is string => typeof v === "string";

/**
 * Checks the JSON from our own endpoint before anything is rendered from it:
 * a broken or unexpected answer is treated as a failure, never as "no notices".
 */
export function parsePayload(json: unknown): AlertsPayload | null {
  const p = json as Partial<AlertsPayload> | null;
  if (!p || typeof p !== "object" || !isString(p.fetchedAt) || Number.isNaN(Date.parse(p.fetchedAt))) return null;
  if (p.sourceUpdatedAt !== null && !(isString(p.sourceUpdatedAt) && !Number.isNaN(Date.parse(p.sourceUpdatedAt)))) return null;
  if (p.ok === false) return p.error === "stale" || p.error === "unavailable" ? (p as AlertsPayload) : null;
  if (p.ok !== true || (p.source !== "rodalies" && p.source !== "renfe") || !Array.isArray(p.alerts) || !Array.isArray(p.unmapped)) return null;
  for (const a of p.alerts as unknown[]) {
    const alert = a as Partial<CompactAlert> | null;
    if (!alert || !isString(alert.id) || !Array.isArray(alert.lines) || !Array.isArray(alert.stations)) return null;
    if (!alert.lines.every((l) => isString(l) && isLineId(l))) return null;
    if (!alert.text || !isString(alert.text.ca) || !isString(alert.text.es)) return null;
  }
  return p as AlertsPayload;
}

export type LiveView =
  | { kind: "failed" }
  | { kind: "stale" }
  | { kind: "ok"; source: AlertSource; minutes: number; alerts: CompactAlert[] };

/**
 * What the live block shows. A missing or malformed answer is "failed"; an
 * answer the endpoint marked stale, or one older than STALE_AFTER_MS by the
 * browser's clock, is "stale"; otherwise the notices for the line (or all of
 * them on the hub), which may be an empty list.
 */
export function liveView(payload: AlertsPayload | null, now: Date, line: LineId | null): LiveView {
  if (!payload) return { kind: "failed" };
  if (!payload.ok) return { kind: payload.error === "stale" ? "stale" : "failed" };
  if (isStale(payload, now)) return { kind: "stale" };
  return {
    kind: "ok",
    source: payload.source,
    minutes: minutesSince(answerTime(payload), now),
    alerts: line ? alertsForLine(payload.alerts, line) : payload.alerts,
  };
}

/** The text in the reader's language: English only if the source wrote English, else Spanish. */
export function alertText(alert: CompactAlert, locale: "ca" | "es" | "en"): string {
  if (locale === "ca") return alert.text.ca || alert.text.es;
  if (locale === "es") return alert.text.es || alert.text.ca;
  return alert.text.en ?? (alert.text.es || alert.text.ca);
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
