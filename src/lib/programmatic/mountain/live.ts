import type { ForecastText, ObservationsPayload, SnowReading, StationObservations, TemperatureReading, WindReading } from "./types";

/**
 * Browser-side logic of the live block: checking the JSON, deciding what is
 * recent enough to show, and the small formatting. Pure, with no snapshot
 * import, so the client bundle stays light. Every "now" here is the
 * browser's clock, after the page has loaded; the server HTML never has one.
 */

export const OBSERVATIONS_ENDPOINT = "/api/mountain/weather/";

/** Same limit as the snow page (snow/depth.ts MAX_AGE_HOURS): older is never shown as current. */
export const MAX_AGE_HOURS = 48;
const HOUR = 3_600_000;

/** Is a reading recent enough, by the browser's clock? A reading from the future is not. */
export function isRecent(at: string, now: Date): boolean {
  const age = now.getTime() - Date.parse(at);
  return Number.isFinite(age) && age >= -HOUR && age <= MAX_AGE_HOURS * HOUR;
}

/** Whole hours since a reading, never negative. */
export function hoursSince(at: string, now: Date): number {
  const ms = now.getTime() - Date.parse(at);
  return Number.isFinite(ms) ? Math.max(0, Math.floor(ms / HOUR)) : Number.POSITIVE_INFINITY;
}

const isString = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isTime = (v: unknown): v is string => isString(v) && !Number.isNaN(Date.parse(v));

function validTemperature(t: unknown): t is TemperatureReading {
  const x = t as Partial<TemperatureReading> | null;
  return !!x && isNum(x.value) && isTime(x.at);
}

function validWind(w: unknown): w is WindReading {
  const x = w as Partial<WindReading> | null;
  return (
    !!x &&
    isNum(x.speed) &&
    isTime(x.at) &&
    (x.direction === null || isNum(x.direction)) &&
    (x.gust === null || isNum(x.gust)) &&
    (x.height === 2 || x.height === 6 || x.height === 10)
  );
}

function validSnow(s: unknown): s is SnowReading {
  const x = s as Partial<SnowReading> | null;
  return !!x && isNum(x.cm) && isTime(x.at) && (x.change24h === null || isNum(x.change24h));
}

function validForecast(f: unknown): f is ForecastText {
  const x = f as Partial<ForecastText> | null;
  return !!x && x.provider === "aemet" && isString(x.area) && isString(x.text) && isString(x.attribution) && (x.issuedAt === null || isTime(x.issuedAt));
}

/**
 * Checks the JSON from our own endpoint before anything is shown from it:
 * a broken or unexpected answer is a failure, never "no readings".
 */
export function parsePayload(json: unknown): ObservationsPayload | null {
  const p = json as Partial<ObservationsPayload> | null;
  if (!p || typeof p !== "object" || !isTime(p.fetchedAt)) return null;
  if (p.ok === false) return p.error === "unavailable" ? (p as ObservationsPayload) : null;
  if (p.ok !== true) return null;
  if (!(p.latestAt === null || isTime(p.latestAt))) return null;
  if (!(p.forecast === null || validForecast(p.forecast))) return null;
  if (!p.stations || typeof p.stations !== "object" || Array.isArray(p.stations)) return null;
  for (const obs of Object.values(p.stations as Record<string, unknown>)) {
    const o = obs as Partial<StationObservations> | null;
    if (!o || typeof o !== "object") return null;
    if (!(o.temperature === null || validTemperature(o.temperature))) return null;
    if (!(o.wind === null || validWind(o.wind))) return null;
    if (!(o.snow === null || validSnow(o.snow))) return null;
  }
  return p as ObservationsPayload;
}

/** What one station shows: each value only if recent; "missing" otherwise. */
export interface StationView {
  temperature: TemperatureReading | null;
  wind: WindReading | null;
  snow: SnowReading | null;
  /** True when nothing it measures has a recent validated reading. */
  empty: boolean;
}

export interface Measures {
  temperature: boolean;
  wind: 2 | 6 | 10 | null;
  snow: boolean;
}

export function stationView(obs: StationObservations | undefined, measures: Measures, now: Date): StationView {
  const temperature = measures.temperature && obs?.temperature && isRecent(obs.temperature.at, now) ? obs.temperature : null;
  const wind = measures.wind && obs?.wind && isRecent(obs.wind.at, now) ? obs.wind : null;
  const snow = measures.snow && obs?.snow && isRecent(obs.snow.at, now) ? obs.snow : null;
  return { temperature, wind, snow, empty: !temperature && !wind && !snow };
}

export type LiveView =
  | { kind: "failed" }
  | { kind: "ok"; stations: Record<string, StationView>; forecast: ForecastText | null };

/**
 * The live block's state: "failed" for a missing, malformed or failed
 * answer; otherwise one view per station asked for (which may all be empty:
 * Meteocat validates temperature and wind about a week late).
 */
export function liveView(payload: ObservationsPayload | null, now: Date, stations: { code: string; measures: Measures }[]): LiveView {
  if (!payload || !payload.ok) return { kind: "failed" };
  const out: Record<string, StationView> = {};
  for (const s of stations) out[s.code] = stationView(payload.stations[s.code], s.measures, now);
  return { kind: "ok", stations: out, forecast: payload.forecast };
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

/** m/s to km/h, whole numbers (the published value is shown first, in m/s). */
export const kmh = (ms: number): number => Math.round(ms * 3.6);

const COMPASS: Record<"ca" | "es" | "en", string[]> = {
  ca: ["N", "NE", "E", "SE", "S", "SO", "O", "NO"],
  es: ["N", "NE", "E", "SE", "S", "SO", "O", "NO"],
  en: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
};

/** Eight-point compass for a direction in degrees (where the wind comes from). */
export function compass(degrees: number, locale: "ca" | "es" | "en"): string {
  const index = Math.round((((degrees % 360) + 360) % 360) / 45) % 8;
  return COMPASS[locale][index]!;
}

/** "3,2" / "3.2", one decimal at most, in the reader's language. */
export function number(value: number, intlLocale: string, digits = 1): string {
  return new Intl.NumberFormat(intlLocale, { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(value);
}

/** A reading time in Catalonia's official time ("dl., 26 d’oct., 15:30"). */
export function readingTime(iso: string, intlLocale: string): string {
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Madrid",
  }).format(new Date(iso));
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
