/**
 * Shapes of the reservoir family: the committed snapshot and the compact JSON
 * the route handler returns. Types and the reservoir list only, so the
 * browser bundle can import this file without the snapshot.
 */

/**
 * The nine reservoirs of the ACA's daily series (`gn9e-3qhr`), exactly as the
 * dataset lists them on 28 Oct 2026 (the station names, without
 * "Embassament de"), largest first. Each has one page per language. The
 * Ebro-basin reservoirs are not in this series (see README of the family in
 * pages.ts).
 */
export const RESERVOIRS = [
  { slug: "susqueda", name: "Susqueda" },
  { slug: "sau", name: "Sau" },
  { slug: "la-baells", name: "la Baells" },
  { slug: "la-llosa-del-cavall", name: "la Llosa del Cavall" },
  { slug: "darnius-boadella", name: "Darnius Boadella" },
  { slug: "sant-ponc", name: "Sant Ponç" },
  { slug: "siurana", name: "Siurana" },
  { slug: "riudecanyes", name: "Riudecanyes" },
  { slug: "foix", name: "Foix" },
] as const;

export type ReservoirSlug = (typeof RESERVOIRS)[number]["slug"];
export type ReservoirName = (typeof RESERVOIRS)[number]["name"];

export function isReservoirSlug(value: string): value is ReservoirSlug {
  return RESERVOIRS.some((r) => r.slug === value);
}

export function slugOfName(name: string): ReservoirSlug | null {
  return RESERVOIRS.find((r) => r.name === name)?.slug ?? null;
}

/* -------------------------------------------------------------------------- */
/* Snapshot                                                                   */
/* -------------------------------------------------------------------------- */

/** One day's reading as the ACA publishes it. */
export interface DayReading {
  /** The `dia` of the row (ISO date): the day the ACA dates it. */
  date: string;
  /** Percentage of capacity. Can be a little above 100 when the reservoir is over its nominal level. */
  percent: number;
  /** hm³. */
  volume: number;
  /** Water level, metres above sea level (`nivell_absolut`); null if the row has none. */
  level: number | null;
}

export interface ReservoirTrend {
  /** The most recent valid reading in the snapshot. */
  latest: DayReading;
  /** The valid reading closest to the same day a year earlier (within 3 days), if any. */
  yearAgo: DayReading | null;
  /** Lowest and highest percentage over the 365 days up to `latest` (the first day it happened). */
  min: DayReading;
  max: DayReading;
  /** One reading per month, oldest first: the same day of the month as `latest`, 12 months back to it. */
  monthly: DayReading[];
  /** Days in the window with a valid row, and rows rejected as damaged. */
  validDays: number;
  rejected: number;
}

export interface SnapshotSource {
  id: string;
  name: string;
  publisher: string;
  url: string;
  /** Reuse terms as the portal states them. */
  terms: string;
  /** The portal's own "rows updated" date when it was read (ISO date). */
  updated: string | null;
}

export interface SnapshotReservoir {
  slug: ReservoirSlug;
  /** "Sau", "la Baells": the station name without "Embassament de". */
  name: string;
  /** The station as the ACA labels it: "Embassament de Sau (Vilanova de Sau)". */
  station: string;
  /** The municipality in the ACA's label, when it has one. */
  place: string | null;
  /** From the registration-time history `vjx7-6kcp`: station code, basin and sub-basin as the ACA names them. */
  code: string | null;
  basin: string | null;
  subbasin: string | null;
  trend: ReservoirTrend;
}

export interface ReservoirSnapshot {
  /** The day the sources were read (Europe/Madrid). */
  readOn: string;
  /** The newest reading date in the snapshot: the only date the pages print as "data of". */
  latestDate: string;
  sources: { daily: SnapshotSource; history: SnapshotSource };
  reservoirs: SnapshotReservoir[];
}

/* -------------------------------------------------------------------------- */
/* The live JSON (route handler -> browser)                                   */
/* -------------------------------------------------------------------------- */

export interface LiveReading {
  slug: ReservoirSlug;
  date: string;
  percent: number;
  volume: number;
  level: number | null;
  /** Percentage points since `changeFrom`, when that day has a valid reading. */
  change: number | null;
  changeFrom: string | null;
}

export interface LiveOk {
  ok: true;
  /** When the route handler read the ACA (ISO instant). */
  fetchedAt: string;
  readings: LiveReading[];
}

export interface LiveFailed {
  ok: false;
  error: "unavailable";
  fetchedAt: string;
}

export type LivePayload = LiveOk | LiveFailed;
