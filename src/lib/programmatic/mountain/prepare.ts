/**
 * Pure steps of `scripts/mountain-snapshot.ts`: which ICGC toponym is a
 * place's reference point, how far each Meteocat station is from it, which
 * stations are close enough to stand for the place, and what each station
 * measures. Kept apart from the script so the tests can run them on
 * recorded answers.
 */

import { cleanStationName } from "@/lib/content/snow/depth";

import type { PlaceKind, SnapshotPoint, SnapshotStation, StationLink, WindHeight } from "./types";

/* -------------------------------------------------------------------------- */
/* The family threshold (doorway guardrail)                                   */
/* -------------------------------------------------------------------------- */

/**
 * A place gets its own page only when a Meteocat station is genuinely close:
 * within this distance of its ICGC reference point. A ski area spreads over
 * a few kilometres, a summit or a lake is a point, hence the two values.
 */
export const MAX_DISTANCE_KM: Record<PlaceKind, number> = { resort: 7, nordic: 7, area: 4 };

/**
 * For a ski area with a published altitude range, the station must also sit
 * inside that range give or take this margin: a valley station 1,000 m below
 * the pistes (Sort for Port Ainé, Das for Masella) does not describe them.
 */
export const ALTITUDE_MARGIN_M = 300;

/**
 * A ski area whose operator publishes no altitude range still needs a
 * mountain station: at least this high (Tírvia, at 955 m and 3.4 km from
 * Virós-Vallferrera, is a valley station).
 */
export const MIN_SKI_STATION_ALTITUDE_M = 1500;

export interface AltitudeRange {
  min: number;
  max: number;
}

/** Great-circle distance in km (mean Earth radius, IUGG). */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371.0088;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Every station by distance from the point, nearest first, one decimal. */
export function byDistance(point: { lat: number; lon: number }, stations: readonly SnapshotStation[]): StationLink[] {
  return stations
    .map((s) => ({ code: s.code, distanceKm: round1(distanceKm(point, s)) }))
    .sort((a, b) => a.distanceKm - b.distanceKm || a.code.localeCompare(b.code));
}

/** Does the station measure anything the live block shows? */
export function reportsSomething(station: SnapshotStation): boolean {
  return station.measures.temperature || station.measures.snow || station.measures.wind !== null;
}

/**
 * The stations that stand for a place: close enough (MAX_DISTANCE_KM for its
 * kind), measuring something, and, for a ski area with a known range, at a
 * comparable altitude. Nearest first.
 */
export function matchStations(
  kind: PlaceKind,
  altitude: AltitudeRange | null,
  point: { lat: number; lon: number },
  stations: readonly SnapshotStation[],
): StationLink[] {
  const index = new Map(stations.map((s) => [s.code, s]));
  return byDistance(point, stations).filter((link) => {
    const station = index.get(link.code)!;
    if (link.distanceKm > MAX_DISTANCE_KM[kind]) return false;
    if (!reportsSomething(station)) return false;
    if (altitude && (station.altitude < altitude.min - ALTITUDE_MARGIN_M || station.altitude > altitude.max + ALTITUDE_MARGIN_M)) return false;
    if (!altitude && kind !== "area" && station.altitude < MIN_SKI_STATION_ALTITUDE_M) return false;
    return true;
  });
}

/* -------------------------------------------------------------------------- */
/* Meteocat station metadata (yqwd-vj5e)                                      */
/* -------------------------------------------------------------------------- */

export interface StationMetaRow {
  codi_estacio?: string;
  nom_estacio?: string;
  latitud?: string;
  longitud?: string;
  altitud?: string;
  nom_municipi?: string;
  nom_comarca?: string;
  nom_estat_ema?: string;
}

/** Operational stations with a name, coordinates and altitude. `measures` is filled in later. */
export function operationalStations(rows: readonly StationMetaRow[]): SnapshotStation[] {
  const out: SnapshotStation[] = [];
  for (const row of rows) {
    if ((row.nom_estat_ema ?? "").trim() !== "Operativa") continue;
    const code = row.codi_estacio?.trim();
    const name = row.nom_estacio?.trim();
    const lat = Number(row.latitud);
    const lon = Number(row.longitud);
    const altitude = Number(row.altitud);
    if (!code || !name || ![lat, lon, altitude].every(Number.isFinite)) continue;
    out.push({
      code,
      name: cleanStationName(name),
      altitude,
      lat,
      lon,
      municipality: (row.nom_municipi ?? "").normalize("NFC").trim(),
      comarca: (row.nom_comarca ?? "").normalize("NFC").trim(),
      measures: { temperature: false, wind: null, snow: false },
    });
  }
  return out.sort((a, b) => a.code.localeCompare(b.code));
}

/* -------------------------------------------------------------------------- */
/* What each station measures (nzvn-apee, grouped by station and variable)   */
/* -------------------------------------------------------------------------- */

/** XEMA variable codes (metadata dataset 4fb2-n3yi, read 28 Oct 2026). */
export const VARIABLE = {
  temperature: "32",
  snow: "38",
  wind: {
    10: { speed: "30", direction: "31", gust: "50" },
    6: { speed: "48", direction: "49", gust: "53" },
    2: { speed: "46", direction: "47", gust: "56" },
  },
} as const;

export const WIND_HEIGHTS: readonly WindHeight[] = [10, 6, 2];

/** Every variable code the family reads. */
export const VARIABLE_CODES: readonly string[] = [
  VARIABLE.temperature,
  VARIABLE.snow,
  ...WIND_HEIGHTS.flatMap((h) => [VARIABLE.wind[h].speed, VARIABLE.wind[h].direction, VARIABLE.wind[h].gust]),
];

/**
 * From rows `{ codi_estacio, codi_variable }` (any status) seen in the days
 * before the snapshot: temperature, the wind mast height, and the snow sensor.
 */
export function measuresFrom(rows: readonly { codi_estacio?: string; codi_variable?: string }[]): Map<string, SnapshotStation["measures"]> {
  const seen = new Map<string, Set<string>>();
  for (const row of rows) {
    const code = row.codi_estacio?.trim();
    const variable = row.codi_variable?.trim();
    if (!code || !variable) continue;
    const set = seen.get(code) ?? new Set<string>();
    set.add(variable);
    seen.set(code, set);
  }
  const out = new Map<string, SnapshotStation["measures"]>();
  for (const [code, vars] of seen) {
    out.set(code, {
      temperature: vars.has(VARIABLE.temperature),
      wind: WIND_HEIGHTS.find((h) => vars.has(VARIABLE.wind[h].speed)) ?? null,
      snow: vars.has(VARIABLE.snow),
    });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* ICGC toponyms (eines.icgc.cat/geocodificador)                              */
/* -------------------------------------------------------------------------- */

export interface IcgcFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    nom?: string;
    municipi?: string;
    id_municipi?: string;
    comarca?: string;
    addendum?: { tipus?: string };
  };
}

/**
 * The toponym that is the place's reference point: exact name and municipal
 * code, as declared in places.ts. Null if the nomenclator no longer has it
 * (the script stops rather than guessing).
 */
export function pickToponym(features: readonly IcgcFeature[], name: string, municipalityCode: string): SnapshotPoint | null {
  const norm = (s: string) => s.normalize("NFC").trim();
  for (const f of features) {
    const p = f.properties;
    const c = f.geometry?.coordinates;
    if (!p || !c || norm(p.nom ?? "") !== norm(name) || p.id_municipi !== municipalityCode) continue;
    const [lon, lat] = c;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    return {
      name: norm(p.nom ?? ""),
      type: norm(p.addendum?.tipus ?? ""),
      // The geocoder drops the apostrophe in some names ("Santa Cristina d Aro"); the label is ours to fix, not the code.
      municipality: norm(p.municipi ?? ""),
      municipalityCode,
      comarca: norm(p.comarca ?? ""),
      lat: Math.round(lat * 1e5) / 1e5,
      lon: Math.round(lon * 1e5) / 1e5,
    };
  }
  return null;
}
