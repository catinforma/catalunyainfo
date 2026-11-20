/**
 * "Today's price in every area": the cheapest and the median petrol 95 and
 * diesel price of each province, each city page and each Catalan chain, for
 * the hub's server HTML (20 Nov 2026).
 *
 * Why: the searched questions are about one place or one chain ("precio
 * gasolina terrassa", "gasolineras bonarea", "preu gasolina esclat avui"), and
 * the pages that answer them (provinces, cities, chains) have been noindex
 * since 11 Nov (lib/seo/low-demand.ts, the owner's AdSense decision). The two
 * hubs are indexable; this puts each area's answer, with the Ministry's time,
 * on them, and links the area's own page for its ten cheapest stations.
 *
 * Every figure is the Ministry's price of one station (the cheapest) or the
 * median of the area's published prices (`rank`, the same as the area page
 * prints). Pure: no network, no clock unless one is passed in.
 */

import { cities, chains, provinces, type Place } from "./data";
import { freshness, rank, type Freshness, type LivePayload, type LiveStation, type StationFilter } from "./live";

/** The stations behind a page, as the page itself filters them. */
export function placeFilter(place: Place): StationFilter {
  switch (place.kind) {
    case "province":
      return { province: place.code };
    case "comarca":
      return { comarca: place.code };
    case "city":
      return { ine: place.ine };
    case "chain":
      return { brands: place.chain.brands };
  }
}

export type AreaFuel = "e95" | "goa";
export const AREA_FUELS: readonly AreaFuel[] = ["e95", "goa"];

export interface AreaPrice {
  /** The cheapest station's price, €/l. */
  min: number;
  /** Median of the area's published prices, €/l. */
  median: number;
  /** Stations of the area that publish this product now. */
  count: number;
  /** The cheapest station (brand, address, town). */
  station: Pick<LiveStation, "b" | "a" | "t">;
}

export interface AreaRow {
  place: Place;
  prices: Partial<Record<AreaFuel, AreaPrice>>;
}

export interface AreaGroup {
  kind: "province" | "city" | "chain";
  rows: AreaRow[];
}

export interface AreaSummary {
  /** The Ministry's `Fecha` and the same instant as ISO. */
  fecha: string;
  updated: string | null;
  fresh: Exclude<Freshness, "stale">;
  groups: AreaGroup[];
}

/** The areas, in the order the hub shows them: provinces, cities (most stations first), chains. */
export function hubAreas(): { kind: AreaGroup["kind"]; places: Place[] }[] {
  return [
    { kind: "province", places: provinces() },
    { kind: "city", places: cities() },
    { kind: "chain", places: chains() },
  ];
}

function priceOf(payload: LivePayload, place: Place, fuel: AreaFuel): AreaPrice | null {
  const r = rank(payload.stations, placeFilter(place), fuel, 1);
  const best = r.cheapest[0];
  if (!best || r.median === null || typeof best[fuel] !== "number") return null;
  return { min: best[fuel]!, median: r.median, count: r.count, station: { b: best.b, a: best.a, t: best.t } };
}

/**
 * The summary for the hub, or null when there is no list or it is more than a
 * day old (the same rule as the live table: old prices are never shown as
 * today's). A row without any published price is left out.
 */
export function areaSummary(payload: LivePayload | null, now: number): AreaSummary | null {
  if (!payload) return null;
  const fresh = freshness(payload.updated, now);
  if (fresh === "stale") return null;
  const groups = hubAreas()
    .map(({ kind, places }) => ({
      kind,
      rows: places.flatMap((place) => {
        const prices: AreaRow["prices"] = {};
        for (const fuel of AREA_FUELS) {
          const p = priceOf(payload, place, fuel);
          if (p) prices[fuel] = p;
        }
        return Object.keys(prices).length > 0 ? [{ place, prices }] : [];
      }),
    }))
    .filter((g) => g.rows.length > 0);
  return groups.length > 0 ? { fecha: payload.fecha, updated: payload.updated, fresh, groups } : null;
}
