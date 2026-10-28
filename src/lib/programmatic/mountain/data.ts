import { areaFor, type SnowArea } from "@/lib/content/snow/depth";

import { PLACE_DEFS, type PlaceDef } from "./places";
import snapshotJson from "./snapshot.json" with { type: "json" };
import type { MountainSnapshot, SnapshotPlace, SnapshotStation } from "./types";

/** The committed snapshot (see scripts/mountain-snapshot.ts). Server only. */
export const SNAPSHOT = snapshotJson as MountainSnapshot;

export interface PlaceStation {
  station: SnapshotStation;
  distanceKm: number;
}

/** A place as the pages use it: the verified definition joined with the snapshot. */
export interface Place extends PlaceDef {
  point: SnapshotPlace["point"];
  /** Stations that stand for the place (the family threshold); empty = hub only. */
  stations: PlaceStation[];
  /** The nearest operational stations, whatever their distance. */
  nearest: PlaceStation[];
  /** West-to-east group of the snow page, from the ICGC comarca. */
  area: SnowArea;
}

export function stationByCode(code: string, snapshot: MountainSnapshot = SNAPSHOT): SnapshotStation {
  const station = snapshot.stations.find((s) => s.code === code);
  if (!station) throw new Error(`No station ${code} in the mountain snapshot`);
  return station;
}

export function joinPlaces(snapshot: MountainSnapshot = SNAPSHOT, defs: readonly PlaceDef[] = PLACE_DEFS): Place[] {
  return defs.map((def) => {
    const snap = snapshot.places.find((p) => p.slug === def.slug);
    if (!snap) throw new Error(`No ${def.slug} in the mountain snapshot: run npm run mountain:snapshot -- build`);
    const link = (l: { code: string; distanceKm: number }) => ({ station: stationByCode(l.code, snapshot), distanceKm: l.distanceKm });
    return {
      ...def,
      point: snap.point,
      stations: snap.stations.map(link),
      nearest: snap.nearest.map(link),
      area: areaFor(snap.point.comarca),
    };
  });
}

/** Every place the family knows, in the order of places.ts. */
export const PLACES: readonly Place[] = joinPlaces();

/** Places with a page of their own: at least one station passes the threshold. */
export const PAGE_PLACES: readonly Place[] = PLACES.filter((p) => p.stations.length > 0);

/** Places listed on the hub only (no station close enough). */
export const HUB_ONLY_PLACES: readonly Place[] = PLACES.filter((p) => p.stations.length === 0);

export function placeBySlug(slug: string): Place | null {
  return PAGE_PLACES.find((p) => p.slug === slug) ?? null;
}

/** The stations read live by the pages, each once, in the order the places name them. */
export function liveStationCodes(): string[] {
  return [...new Set(PAGE_PLACES.flatMap((p) => p.stations.map((s) => s.station.code)))];
}

/**
 * Pages a reader of this one may want next: same area of the Pyrenees first
 * (west to east, as the snow page groups them), resorts before summits, then
 * the nearest others. Never itself; at most `limit`.
 */
export function siblings(place: Place, limit = 6): Place[] {
  const others = PAGE_PLACES.filter((p) => p.slug !== place.slug);
  const distance = (p: Place) => Math.hypot(p.point.lat - place.point.lat, p.point.lon - place.point.lon);
  const kindOrder = (p: Place) => (p.kind === place.kind ? 0 : 1);
  return [...others]
    .sort((a, b) => Number(b.area === place.area) - Number(a.area === place.area) || kindOrder(a) - kindOrder(b) || distance(a) - distance(b))
    .slice(0, limit);
}

/** The station that best stands for the place (the nearest that passes). */
export function mainStation(place: Place): PlaceStation | null {
  return place.stations[0] ?? null;
}
