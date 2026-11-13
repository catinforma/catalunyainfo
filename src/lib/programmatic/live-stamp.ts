/**
 * "When was this read": the Madrid date and time of an instant, as the live
 * pages print it next to an official figure ("13/11/2026", "11:50"; English
 * "13 Nov 2026"). Deterministic for a given instant, so a server component and
 * a client component given the same ISO string print the same thing (no
 * hydration mismatch). Pure: no clock.
 */

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface LiveStamp {
  /** ISO date in Madrid, "2026-11-13". */
  iso: string;
  /** "13/11/2026" (ca, es) or "13 Nov 2026" (en). */
  date: string;
  /** "11:50", 24 h, Madrid. */
  time: string;
}

export function liveStamp(instant: string, locale: "ca" | "es" | "en"): LiveStamp | null {
  const ms = Date.parse(instant);
  if (!Number.isFinite(ms)) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(ms));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const [y, m, d] = [get("year"), get("month"), get("day")];
  const date = locale === "en" ? `${Number(d)} ${EN_MONTHS[Number(m) - 1] ?? ""} ${y}` : `${d}/${m}/${y}`;
  return { iso: `${y}-${m}-${d}`, date, time: `${get("hour")}:${get("minute")}` };
}

/** Day 1 or 11 ("01/11/2026", "11 de novembre"): the Catalan article elides. */
const ELIDES = /^(0?1|11)(\D|$)/;

/** Catalan "el 13/11/2026" / "l'11/11/2026". */
export function caEl(date: string): string {
  return ELIDES.test(date) ? `l'${date}` : `el ${date}`;
}

/** Catalan "del 13/11/2026" / "de l'11/11/2026". */
export function caDel(date: string): string {
  return ELIDES.test(date) ? `de l'${date}` : `del ${date}`;
}
