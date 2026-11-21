/**
 * Fuel prices in every province of Spain (21 Nov 2026): which pages exist and
 * what each one prints, from the Ministry's national list (`spain-upstream.ts`,
 * read at render by `spain-server.ts`). Pure: no network, no clock unless one
 * is passed in.
 *
 * Pages (doorway guardrail, docs/SEO_EXPERIMENTS.md, 21 Nov 2026): one per
 * province or autonomous city outside Catalonia (48), and one table of all 52.
 * Catalonia's four provinces already have their pages in this family (with its
 * comarques, cities and chains); they are linked, never duplicated. No page per
 * station or per town: a province page carries the table of its main towns.
 *
 * Every figure is the Ministry's price at one station (the cheapest, or one of
 * the ten cheapest) or the median of the published prices in an area, computed
 * exactly as on the Catalan pages (`median` in live.ts, rounded to the tenth of
 * a cent the Ministry publishes). Nothing from a list over a day old.
 */

import { PROVINCES } from "@/lib/programmatic/gordo/provinces";

import { freshness, median, type Freshness } from "./live";
import spainSnapshotJson from "./spain-provinces.json" with { type: "json" };
import { SPAIN_FUELS, type SpainFuel, type SpainPayload, type SpainStation } from "./spain-upstream";

/* -------------------------------------------------------------------------- */
/* The committed counts (scripts/fuel-spain-snapshot.ts)                     */
/* -------------------------------------------------------------------------- */

export interface SpainSnapshot {
  /** Madrid date of the Ministry list the counts come from. */
  readOn: string;
  /** Its `Fecha`, as the Ministry writes it. */
  ministryTimestamp: string;
  api: string;
  /** Public stations in Spain on `readOn`. */
  stations: number;
  /** INE province code -> stations and municipalities with at least one. */
  provinces: Record<string, { stations: number; towns: number }>;
}

export const SPAIN_SNAPSHOT = spainSnapshotJson as SpainSnapshot;

/** Catalonia's provinces: their pages are the Catalan family's (data.ts PROVINCE_CODES). */
export const CATALAN_PROVINCE_CODES: readonly string[] = ["08", "17", "25", "43"];

/** Ceuta and Melilla are autonomous cities, not provinces: the copy says "Ceuta", never "provincia de Ceuta". */
export const AUTONOMOUS_CITY_CODES: readonly string[] = ["51", "52"];

export interface SpainProvince {
  /** INE code, two digits. */
  code: string;
  /** Official name as INE lists it ("A Coruña", "Alicante/Alacant", "Illes Balears"), in every language. */
  name: string;
  slug: string;
  catalan: boolean;
  autonomousCity: boolean;
  /** Stations and municipalities with one, from the snapshot (its date: SPAIN_SNAPSHOT.readOn). */
  stations: number;
  towns: number;
}

const collator = new Intl.Collator("es");

const ALL: SpainProvince[] = PROVINCES.map((p) => ({
  code: p.code,
  name: p.name,
  slug: p.slug,
  catalan: CATALAN_PROVINCE_CODES.includes(p.code),
  autonomousCity: AUTONOMOUS_CITY_CODES.includes(p.code),
  stations: SPAIN_SNAPSHOT.provinces[p.code]?.stations ?? 0,
  towns: SPAIN_SNAPSHOT.provinces[p.code]?.towns ?? 0,
})).sort((a, b) => collator.compare(a.name, b.name));

/** All 52, alphabetically (the Spain table). */
export function allProvinces(): SpainProvince[] {
  return ALL;
}

/** The 48 with a page of their own here (every one outside Catalonia). */
export function spainProvinces(): SpainProvince[] {
  return ALL.filter((p) => !p.catalan);
}

/** A Spain page's province, or null (unknown slug, or a Catalan province: its page is the Catalan family's). */
export function spainProvinceBySlug(slug: string): SpainProvince | null {
  return ALL.find((p) => p.slug === slug && !p.catalan) ?? null;
}

export function provinceByCode(code: string): SpainProvince | null {
  return ALL.find((p) => p.code === code) ?? null;
}

/* -------------------------------------------------------------------------- */
/* What a page prints                                                         */
/* -------------------------------------------------------------------------- */

/** The ten cheapest per product, as on the Catalan pages. */
export const CHEAPEST_SHOWN = 10;
/** Rows of a province's town table: the municipalities with most stations. */
export const MAIN_TOWNS = 12;

export interface PriceStats {
  /** Stations that publish this product now. */
  count: number;
  min: number;
  median: number;
}

export interface FuelStats extends PriceStats {
  /** Cheapest first; ties by brand, then address, so the order is stable. */
  cheapest: SpainStation[];
}

export interface TownStats {
  /** Municipality, article first, as the station rows give it. */
  name: string;
  /** Stations in the list, whatever they sell. */
  stations: number;
  prices: Partial<Record<SpainFuel, PriceStats>>;
}

export interface ProvinceStats {
  code: string;
  /** Stations of the province in the list. */
  stations: number;
  /** Municipalities with at least one. */
  towns: number;
  fuels: Partial<Record<SpainFuel, FuelStats>>;
  mainTowns: TownStats[];
}

export interface SpainSummary {
  fecha: string;
  updated: string | null;
  fresh: Exclude<Freshness, "stale">;
  national: { stations: number; fuels: Partial<Record<SpainFuel, PriceStats>> };
  provinces: Record<string, ProvinceStats>;
}

function byPrice(fuel: SpainFuel) {
  return (x: SpainStation, y: SpainStation) => x[fuel]! - y[fuel]! || x.b.localeCompare(y.b) || x.a.localeCompare(y.a) || x.id.localeCompare(y.id);
}

function priceStats(stations: readonly SpainStation[], fuel: SpainFuel): PriceStats | null {
  const prices = stations.flatMap((s) => (typeof s[fuel] === "number" ? [s[fuel]!] : []));
  const mid = median(prices);
  if (mid === null) return null;
  return { count: prices.length, min: Math.min(...prices), median: mid };
}

function fuelStats(stations: readonly SpainStation[], fuel: SpainFuel, limit = CHEAPEST_SHOWN): FuelStats | null {
  const priced = stations.filter((s) => typeof s[fuel] === "number").sort(byPrice(fuel));
  const mid = median(priced.map((s) => s[fuel]!));
  if (mid === null || priced.length === 0) return null;
  return { count: priced.length, min: priced[0]![fuel]!, median: mid, cheapest: priced.slice(0, limit) };
}

function statsBy<T>(stations: readonly SpainStation[], compute: (list: readonly SpainStation[], fuel: SpainFuel) => T | null): Partial<Record<SpainFuel, T>> {
  const out: Partial<Record<SpainFuel, T>> = {};
  for (const fuel of SPAIN_FUELS) {
    const value = compute(stations, fuel);
    if (value) out[fuel] = value;
  }
  return out;
}

/**
 * The municipalities with most stations, up to MAIN_TOWNS: those with at
 * least two, unless that leaves fewer than three rows (Ceuta, Melilla, Soria
 * have one or two big towns), then the biggest whatever their count.
 */
export function mainTowns(stations: readonly SpainStation[], limit = MAIN_TOWNS): TownStats[] {
  const groups = new Map<string, SpainStation[]>();
  for (const s of stations) {
    const key = `${s.p}:${s.m || s.t}`;
    const list = groups.get(key);
    if (list) list.push(s);
    else groups.set(key, [s]);
  }
  const ranked = [...groups.values()].sort((a, b) => b.length - a.length || collator.compare(a[0]!.t, b[0]!.t));
  const twoPlus = ranked.filter((g) => g.length >= 2);
  const chosen = (twoPlus.length >= 3 ? twoPlus : ranked).slice(0, limit);
  return chosen.map((list) => ({ name: list[0]!.t, stations: list.length, prices: statsBy(list, priceStats) }));
}

/** Everything the Spain pages print, for one list. No freshness here: see spainSummary. */
export function summarize(payload: SpainPayload): Omit<SpainSummary, "fresh"> {
  const byProvince = new Map<string, SpainStation[]>();
  for (const s of payload.stations) {
    const list = byProvince.get(s.p);
    if (list) list.push(s);
    else byProvince.set(s.p, [s]);
  }
  const provinces: Record<string, ProvinceStats> = {};
  for (const [code, list] of byProvince) {
    provinces[code] = {
      code,
      stations: list.length,
      towns: new Set(list.map((s) => s.m || s.t)).size,
      fuels: statsBy(list, fuelStats),
      mainTowns: mainTowns(list),
    };
  }
  return {
    fecha: payload.fecha,
    updated: payload.updated,
    national: { stations: payload.stations.length, fuels: statsBy(payload.stations, priceStats) },
    provinces,
  };
}

const SUMMARIES = new WeakMap<SpainPayload, Omit<SpainSummary, "fresh">>();

/**
 * The summary of a list, computed once per list (every page of one render
 * cycle shares it), or null when there is no list or it is more than a day
 * old: the same rule as the Catalan pages, old prices are never shown as
 * today's.
 */
export function spainSummary(payload: SpainPayload | null, now: number): SpainSummary | null {
  if (!payload) return null;
  const fresh = freshness(payload.updated, now);
  if (fresh === "stale") return null;
  let base = SUMMARIES.get(payload);
  if (!base) {
    base = summarize(payload);
    SUMMARIES.set(payload, base);
  }
  return { ...base, fresh };
}

/** Province median minus national median, in euro cents, one decimal (+2.1 = 2.1 cents dearer). */
export function centsVsNational(summary: SpainSummary, code: string, fuel: SpainFuel): number | null {
  const here = summary.provinces[code]?.fuels[fuel]?.median;
  const all = summary.national.fuels[fuel]?.median;
  if (here === undefined || all === undefined) return null;
  return Math.round((here - all) * 1000) / 10;
}

/** The provinces with the lowest and highest median for a product (ties: alphabetical). */
export function extremes(summary: SpainSummary, fuel: SpainFuel): { cheapest: SpainProvince; dearest: SpainProvince } | null {
  const rows = ALL.flatMap((p) => {
    const m = summary.provinces[p.code]?.fuels[fuel]?.median;
    return m === undefined ? [] : [{ p, m }];
  });
  if (rows.length === 0) return null;
  const sorted = [...rows].sort((a, b) => a.m - b.m || collator.compare(a.p.name, b.p.name));
  return { cheapest: sorted[0]!.p, dearest: sorted[sorted.length - 1]!.p };
}
