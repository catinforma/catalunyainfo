import {
  MAX_AGE_HOURS,
  SNOW_DEPTH_VARIABLE,
  buildSnowReport,
  parseReadings,
  toUtcIso,
  type ReadingRow,
  type StationMeta,
} from "@/lib/content/snow/depth";

import { loadForecast } from "./forecast";
import { VARIABLE } from "./prepare";
import snapshotJson from "./snapshot.json" with { type: "json" };
import type {
  MountainSnapshot,
  ObservationsFailed,
  ObservationsOk,
  ObservationsPayload,
  SnapshotStation,
  StationObservations,
  TemperatureReading,
  WindReading,
} from "./types";

/**
 * Live observations for the mountain-weather pages, for `/api/mountain/weather`.
 * Server only (the route handler); the browser gets a few kilobytes of JSON.
 *
 * Source: Meteocat's automatic stations (XEMA) in the Generalitat's open
 * data, `nzvn-apee`, **validated rows only** (`codi_estat = 'V'`), the same
 * rule and the same parsing as the snow-depth page (src/lib/content/snow/depth.ts,
 * which explains why: on 25 Oct 2026 unvalidated snow-depth rows read 1-13 cm
 * where the validated ones read 0).
 *
 * What that means in practice (measured on 28 Oct 2026 at about 11:30 UTC):
 *  - the dataset's newest row of any status was 26 Oct 17:30 UT: the open
 *    data runs about two days behind real time, validated or not;
 *  - validated snow depth reached 26 Oct 13:30-14:00 UT at most stations;
 *  - validated temperature and wind stopped at 19 Oct 23:30 UT: Meteocat
 *    validates them about a week later.
 * So the temperature and wind rows are usually empty (older than the 48 h
 * limit) and the page says so, with a link to the station's own page on
 * meteo.cat, which shows the live, unvalidated readings. Nothing older than
 * 48 hours is ever presented as current, here or in the browser.
 *
 * Reuse: Meteocat's legal notice (www.meteo.cat/wpweb/avis-legal/, read
 * 28 Oct 2026) allows reuse "que es citi la font", "que s'indiqui la data de
 * la darrera actualització" and without altering the content: the pages name
 * Meteocat, show each reading's own time and print the published values.
 */

const SNAPSHOT = snapshotJson as MountainSnapshot;

export const READINGS_URL = "https://analisi.transparenciacatalunya.cat/resource/nzvn-apee.json";

/** The validation status the family accepts. Only Meteocat's "V" (valid). */
export const ACCEPTED_STATUS = "V";

/** Brief: the CDN keeps a good answer 30 minutes (and may serve it 30 more while refreshing). */
export const OK_CACHE_CONTROL = "public, s-maxage=1800, stale-while-revalidate=1800";
/** A failure is cached briefly, so a broken source is not hammered but recovers fast. */
export const FAILED_CACHE_CONTROL = "public, s-maxage=120";

/** Temperature and wind rows are read this far back: the 48 h display limit and a margin. */
export const WEATHER_WINDOW_HOURS = MAX_AGE_HOURS + 2;
/** Snow depth: the snow page's window, so the 24 h change has its earlier reading. */
export const SNOW_WINDOW_DAYS = 4;

const FETCH_TIMEOUT_MS = 15_000;
const HOUR = 3_600_000;

/* -------------------------------------------------------------------------- */
/* Stations                                                                   */
/* -------------------------------------------------------------------------- */

/** Every station that stands for a page (the only ones read live). */
export function liveStations(snapshot: MountainSnapshot = SNAPSHOT): SnapshotStation[] {
  const codes = new Set(snapshot.places.flatMap((p) => p.stations.map((s) => s.code)));
  return snapshot.stations.filter((s) => codes.has(s.code));
}

function weatherVariables(stations: readonly SnapshotStation[]): string[] {
  const out = new Set<string>();
  for (const s of stations) {
    if (s.measures.temperature) out.add(VARIABLE.temperature);
    if (s.measures.wind) {
      const v = VARIABLE.wind[s.measures.wind];
      out.add(v.speed).add(v.direction).add(v.gust);
    }
  }
  return [...out].sort();
}

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

const quoteList = (values: readonly string[]) => values.map((v) => `'${v.replace(/'/g, "")}'`).join(",");

/** Socrata's floating timestamp, UT, to the minute. */
const socrataTime = (instant: Date) => instant.toISOString().slice(0, 16) + ":00";

export function weatherQuery(stations: readonly SnapshotStation[], now: Date): string | null {
  const variables = weatherVariables(stations);
  const codes = stations.filter((s) => s.measures.temperature || s.measures.wind).map((s) => s.code);
  if (variables.length === 0 || codes.length === 0) return null;
  const since = new Date(now.getTime() - WEATHER_WINDOW_HOURS * HOUR);
  return query({
    $select: "codi_estacio,codi_variable,data_lectura,valor_lectura,codi_estat",
    $where: `codi_estat='${ACCEPTED_STATUS}' AND codi_estacio in(${quoteList(codes)}) AND codi_variable in(${quoteList(variables)}) AND data_lectura >= '${socrataTime(since)}'`,
    $order: "data_lectura DESC",
    $limit: "20000",
  });
}

export function snowQuery(stations: readonly SnapshotStation[], now: Date): string | null {
  const codes = stations.filter((s) => s.measures.snow).map((s) => s.code);
  if (codes.length === 0) return null;
  const since = new Date(now.getTime() - SNOW_WINDOW_DAYS * 24 * HOUR);
  return query({
    $select: "codi_estacio,data_lectura,valor_lectura,codi_estat",
    $where: `codi_variable='${SNOW_DEPTH_VARIABLE}' AND codi_estat='${ACCEPTED_STATUS}' AND codi_estacio in(${quoteList(codes)}) AND data_lectura >= '${socrataTime(since).slice(0, 10)}T00:00:00'`,
    $order: "data_lectura DESC",
    $limit: "10000",
  });
}

function query(params: Record<string, string>): string {
  return `${READINGS_URL}?${Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&")}`;
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

export interface WeatherRow extends ReadingRow {
  codi_variable?: string;
}

/** Physical limits; a value outside them is a sensor fault, not weather. */
const LIMITS: Record<"temperature" | "speed" | "direction" | "gust", [number, number]> = {
  temperature: [-50, 50],
  speed: [0, 75],
  direction: [0, 360],
  gust: [0, 110],
};

type Latest = Map<string, Map<string, { at: string; value: number }>>;

/** The newest validated, well-formed value of each variable at each station. */
export function latestValues(rows: readonly WeatherRow[], now: Date): Latest {
  const out: Latest = new Map();
  const nowMs = now.getTime();
  for (const row of rows) {
    if (row.codi_estat !== ACCEPTED_STATUS) continue;
    const code = row.codi_estacio?.trim();
    const variable = row.codi_variable?.trim();
    const at = toUtcIso(row.data_lectura);
    const raw = row.valor_lectura?.trim() ?? "";
    const value = Number(raw);
    if (!code || !variable || !at || raw === "" || !Number.isFinite(value)) continue;
    // A reading stamped in the future is a clock fault (as in snow/depth.ts).
    if (Date.parse(at) > nowMs + HOUR) continue;
    const byVariable = out.get(code) ?? new Map<string, { at: string; value: number }>();
    const current = byVariable.get(variable);
    if (!current || at > current.at) byVariable.set(variable, { at, value });
    out.set(code, byVariable);
  }
  return out;
}

const within = (value: number, [min, max]: [number, number]) => value >= min && value <= max;
const fresh = (at: string, now: Date) => now.getTime() - Date.parse(at) <= MAX_AGE_HOURS * HOUR;

function temperatureOf(values: Map<string, { at: string; value: number }> | undefined, now: Date): TemperatureReading | null {
  const t = values?.get(VARIABLE.temperature);
  return t && within(t.value, LIMITS.temperature) && fresh(t.at, now) ? { value: t.value, at: t.at } : null;
}

/** Speed, with the direction and the gust of the same half hour when published. */
function windOf(values: Map<string, { at: string; value: number }> | undefined, station: SnapshotStation, now: Date): WindReading | null {
  const height = station.measures.wind;
  if (!height || !values) return null;
  const v = VARIABLE.wind[height];
  const speed = values.get(v.speed);
  if (!speed || !within(speed.value, LIMITS.speed) || !fresh(speed.at, now)) return null;
  const direction = values.get(v.direction);
  const gust = values.get(v.gust);
  return {
    speed: speed.value,
    direction: direction && direction.at === speed.at && within(direction.value, LIMITS.direction) ? direction.value : null,
    gust: gust && gust.at === speed.at && within(gust.value, LIMITS.gust) && gust.value >= speed.value ? gust.value : null,
    height,
    at: speed.at,
  };
}

/**
 * The answer for every live station. Pure, so it is tested without the
 * network. Snow depth goes through the snow page's own report builder.
 */
export function buildObservations(
  weatherRows: readonly WeatherRow[],
  snowRows: readonly ReadingRow[],
  stations: readonly SnapshotStation[],
  now: Date,
): Record<string, StationObservations> {
  const latest = latestValues(weatherRows, now);
  const meta = new Map<string, StationMeta>(stations.map((s) => [s.code, { code: s.code, name: s.name, comarca: s.comarca, altitude: s.altitude }]));
  const snowCodes = stations.filter((s) => s.measures.snow).map((s) => s.code);
  const snow = new Map(buildSnowReport(parseReadings([...snowRows]), snowCodes, meta, now).stations.map((s) => [s.code, s]));

  const out: Record<string, StationObservations> = {};
  for (const station of stations) {
    const values = latest.get(station.code);
    const depth = station.measures.snow ? snow.get(station.code) : undefined;
    const obs: StationObservations = {
      temperature: station.measures.temperature ? temperatureOf(values, now) : null,
      wind: windOf(values, station, now),
      snow: depth && depth.cm !== null && depth.at ? { cm: depth.cm, at: depth.at, change24h: depth.change24h } : null,
    };
    if (obs.temperature || obs.wind || obs.snow) out[station.code] = obs;
  }
  return out;
}

export function newestReading(stations: Record<string, StationObservations>): string | null {
  const times = Object.values(stations).flatMap((s) => [s.temperature?.at, s.wind?.at, s.snow?.at].filter((t): t is string => Boolean(t)));
  return times.sort().at(-1) ?? null;
}

/* -------------------------------------------------------------------------- */
/* The handler's answer                                                       */
/* -------------------------------------------------------------------------- */

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

async function getRows<T>(fetcher: Fetcher, url: string | null): Promise<T[]> {
  if (!url) return [];
  const response = await fetcher(url, {
    cache: "no-store",
    headers: { accept: "application/json", "user-agent": "CatalunyaInfo/2.0 (+https://www.catalunyainfo.com)" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = (await response.json()) as unknown;
  // Socrata answers errors as an object: never read that as "no readings".
  if (!Array.isArray(body)) throw new Error("unexpected response");
  return body as T[];
}

export interface ObservationsResponse {
  status: number;
  headers: Record<string, string>;
  body: ObservationsPayload;
}

/**
 * Two reads in parallel (temperature and wind; snow depth), one answer.
 * Never throws: a failure is a 503 that says so, never an empty "all clear".
 */
export async function buildObservationsResponse(fetcher: Fetcher, now: Date, snapshot: MountainSnapshot = SNAPSHOT): Promise<ObservationsResponse> {
  const fetchedAt = now.toISOString();
  const stations = liveStations(snapshot);
  try {
    const [weatherRows, snowRows, forecast] = await Promise.all([
      getRows<WeatherRow>(fetcher, weatherQuery(stations, now)),
      getRows<ReadingRow>(fetcher, snowQuery(stations, now)),
      loadForecast(),
    ]);
    const observed = buildObservations(weatherRows, snowRows, stations, now);
    const body: ObservationsOk = { ok: true, fetchedAt, latestAt: newestReading(observed), stations: observed, forecast };
    return { status: 200, headers: { "cache-control": OK_CACHE_CONTROL }, body };
  } catch (error) {
    console.error("[mountain-weather] Meteocat read failed:", error instanceof Error ? error.message : error);
    const body: ObservationsFailed = { ok: false, error: "unavailable", fetchedAt };
    return { status: 503, headers: { "cache-control": FAILED_CACHE_CONTROL }, body };
  }
}
