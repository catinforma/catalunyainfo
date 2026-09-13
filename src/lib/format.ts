import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";

/** Europe/Madrid is the site's editorial timezone for every displayed date. */
export const SITE_TIMEZONE = "Europe/Madrid";

export function formatDate(date: Date, locale: Locale, style: "long" | "short" = "long") {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: SITE_TIMEZONE,
  }).format(date);
}

export function formatDateTime(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: SITE_TIMEZONE,
  }).format(date);
}

/** `2026-09-13` — the value for a <time datetime> attribute. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDistance(metres: number, locale: Locale): string {
  const km = metres / 1000;
  const value = km >= 10 ? Math.round(km) : Math.round(km * 10) / 10;
  return `${new Intl.NumberFormat(INTL_LOCALE[locale]).format(value)} km`;
}

export function formatDuration(minutes: number, locale: Locale): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (rest === 0) return `${hours} h`;
  return locale === "en" ? `${hours} h ${rest} min` : `${hours} h ${rest} min`;
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale]).format(value);
}

/**
 * How stale a verified date is, in days. Drives whether the verification stamp
 * is shown as current (moss) or ageing (amber).
 */
export function daysSince(date: Date, now: Date = new Date()): number {
  return Math.floor((now.getTime() - date.getTime()) / 86_400_000);
}

/** Content older than this without a re-check is flagged as ageing. */
export const STALE_AFTER_DAYS = 365;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[·ŀĿ]/g, "l")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** Normalises a stored or submitted path to `a/b/c` (no leading/trailing slash). */
export function normalisePath(path: string): string {
  return path
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("/");
}
