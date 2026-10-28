/**
 * The fuel family's places, read from the committed station list. Nothing
 * here touches the network or the database, and nothing here knows a price:
 * prices are read live in the browser.
 *
 * Which places get a page (doorway guardrail):
 *   - the four provinces;
 *   - a comarca with at least COMARCA_MIN_STATIONS stations;
 *   - a municipality with at least CITY_MIN_STATIONS stations, enough for a
 *     real "ten cheapest" list;
 *   - the Catalan chains in CHAINS.
 * Every other municipality is covered by its comarca's and province's page.
 */

import { slugify } from "@/lib/programmatic/holidays/slug";

import municipalitiesJson from "./municipalities.json" with { type: "json" };
import stationsJson from "./stations.json" with { type: "json" };
import type { FuelMunicipality, MunicipalitySnapshot, ProvinceCode, SnapshotStation, StationSnapshot } from "./types";

export const MUNICIPALITIES = municipalitiesJson as MunicipalitySnapshot;
export const STATIONS = stationsJson as StationSnapshot;

export const COMARCA_MIN_STATIONS = 5;
export const CITY_MIN_STATIONS = 10;

export const PROVINCE_NAMES: Record<ProvinceCode, string> = {
  "08": "Barcelona",
  "17": "Girona",
  "25": "Lleida",
  "43": "Tarragona",
};
/** Listed explicitly: object keys "17", "25", "43" would sort before "08". */
export const PROVINCE_CODES: readonly ProvinceCode[] = ["08", "17", "25", "43"];

export interface ChainDef {
  slug: string;
  /** As the chain writes its own name. */
  name: string;
  /** `Rótulo` values in the Ministry's list (trimmed, upper case), checked 28 Oct 2026. */
  brands: readonly string[];
}

/**
 * Catalan chains searched by name ("gasolinera bonarea", "esclat gasolinera").
 * Brand spellings are the Ministry's: "BONAREA" (51 stations on 28 Oct 2026)
 * and "ESCLATOIL" (74, two of them with a trailing space the build trims).
 */
export const CHAINS: readonly ChainDef[] = [
  { slug: "bonarea", name: "bonÀrea", brands: ["BONAREA"] },
  { slug: "esclatoil", name: "Esclatoil", brands: ["ESCLATOIL"] },
];

export type Place =
  | { kind: "province"; slug: string; name: string; code: ProvinceCode; stations: number }
  | { kind: "comarca"; slug: string; name: string; code: string; province: ProvinceCode; stations: number }
  | { kind: "city"; slug: string; name: string; ine: string; comarca: string; province: ProvinceCode; stations: number }
  | { kind: "chain"; slug: string; name: string; chain: ChainDef; stations: number };

export type PlaceKind = Place["kind"];
export type ProvincePlace = Extract<Place, { kind: "province" }>;
export type ComarcaPlace = Extract<Place, { kind: "comarca" }>;
export type CityPlace = Extract<Place, { kind: "city" }>;
export type ChainPlace = Extract<Place, { kind: "chain" }>;

const collator = new Intl.Collator("ca");

/**
 * Every page the station list gives. Pure: the snapshot build calls it with
 * the new list to see which pages would appear or disappear.
 */
export function selectPages(m: MunicipalitySnapshot = MUNICIPALITIES, s: StationSnapshot = STATIONS): Place[] {
  const byId = new Map(m.municipalities.map((x) => [x.id, x]));
  const perProvince = new Map<ProvinceCode, number>();
  const perComarca = new Map<string, Map<ProvinceCode, number>>();
  for (const station of s.stations) {
    const muni = byId.get(station.municipality);
    if (!muni) continue;
    perProvince.set(muni.province, (perProvince.get(muni.province) ?? 0) + 1);
    const c = perComarca.get(muni.comarca) ?? new Map<ProvinceCode, number>();
    c.set(muni.province, (c.get(muni.province) ?? 0) + 1);
    perComarca.set(muni.comarca, c);
  }

  const provinces: Place[] = PROVINCE_CODES.map((code) => ({
    kind: "province",
    slug: slugify(PROVINCE_NAMES[code]),
    name: PROVINCE_NAMES[code],
    code,
    stations: perProvince.get(code) ?? 0,
  }));

  const comarques: Place[] = [...perComarca.entries()]
    .map(([code, byProvince]) => {
      const stations = [...byProvince.values()].reduce((a, b) => a + b, 0);
      // A few comarques straddle two provinces; file them under the one with more stations.
      const province = [...byProvince.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]![0];
      const name = m.comarques[code] ?? code;
      return { kind: "comarca" as const, slug: slugify(name), name, code, province, stations };
    })
    .filter((c) => c.stations >= COMARCA_MIN_STATIONS)
    .sort((a, b) => collator.compare(a.name, b.name));

  const cities: Place[] = m.municipalities
    .filter((x) => x.stations >= CITY_MIN_STATIONS)
    .map((x) => ({ kind: "city" as const, slug: slugify(x.name), name: x.name, ine: x.ine, comarca: x.comarca, province: x.province, stations: x.stations }))
    .sort((a, b) => b.stations - a.stations || collator.compare(a.name, b.name));

  const chains: Place[] = CHAINS.map((chain) => ({
    kind: "chain" as const,
    slug: chain.slug,
    name: chain.name,
    chain,
    stations: s.stations.filter((x) => chain.brands.includes(x.brand)).length,
  }));

  return [...provinces, ...comarques, ...cities, ...chains];
}

const PAGES = selectPages();

export function pages(): Place[] {
  return PAGES;
}

export function provinces(): ProvincePlace[] {
  return PAGES.filter((p): p is ProvincePlace => p.kind === "province");
}

export function comarques(): ComarcaPlace[] {
  return PAGES.filter((p): p is ComarcaPlace => p.kind === "comarca");
}

export function cities(): CityPlace[] {
  return PAGES.filter((p): p is CityPlace => p.kind === "city");
}

export function chains(): ChainPlace[] {
  return PAGES.filter((p): p is ChainPlace => p.kind === "chain");
}

export function placeBySlug<K extends PlaceKind>(kind: K, slug: string): Extract<Place, { kind: K }> | null {
  return (PAGES.find((p) => p.kind === kind && p.slug === slug) as Extract<Place, { kind: K }> | undefined) ?? null;
}

/** City and chain pages share one URL segment (`/es/gasolineras/<slug>/`). */
export function cityOrChainBySlug(slug: string): CityPlace | ChainPlace | null {
  return placeBySlug("city", slug) ?? placeBySlug("chain", slug);
}

/* -------------------------------------------------------------------------- */
/* Stations behind a page (no prices)                                         */
/* -------------------------------------------------------------------------- */

const MUNI_BY_ID = new Map(MUNICIPALITIES.municipalities.map((m) => [m.id, m]));

export interface ListedStation extends SnapshotStation {
  town: FuelMunicipality;
}

const LISTED: ListedStation[] = STATIONS.stations.flatMap((s) => {
  const town = MUNI_BY_ID.get(s.municipality);
  return town ? [{ ...s, town }] : [];
});

export function stationsOf(place: Place): ListedStation[] {
  switch (place.kind) {
    case "province":
      return LISTED.filter((s) => s.town.province === place.code);
    case "comarca":
      return LISTED.filter((s) => s.town.comarca === place.code);
    case "city":
      return LISTED.filter((s) => s.town.ine === place.ine);
    case "chain":
      return LISTED.filter((s) => place.chain.brands.includes(s.brand));
  }
}

/** Brands by number of stations, most first; ties alphabetical. */
export function brandCounts(stations: readonly ListedStation[]): { brand: string; stations: number }[] {
  const counts = new Map<string, number>();
  for (const s of stations) counts.set(s.brand, (counts.get(s.brand) ?? 0) + 1);
  return [...counts.entries()]
    .map(([brand, n]) => ({ brand, stations: n }))
    .sort((a, b) => b.stations - a.stations || collator.compare(a.brand, b.brand));
}

/** Stations grouped by municipality, municipalities alphabetically. */
export function byTown(stations: readonly ListedStation[]): { town: FuelMunicipality; stations: ListedStation[] }[] {
  const groups = new Map<string, ListedStation[]>();
  for (const s of stations) groups.set(s.town.id, [...(groups.get(s.town.id) ?? []), s]);
  return [...groups.values()]
    .map((list) => ({ town: list[0]!.town, stations: [...list].sort((a, b) => collator.compare(a.brand, b.brand) || collator.compare(a.address, b.address)) }))
    .sort((a, b) => collator.compare(a.town.name, b.town.name));
}

/** Stations grouped by comarca (chain pages). */
export function byComarca(stations: readonly ListedStation[]): { code: string; name: string; stations: ListedStation[] }[] {
  const groups = new Map<string, ListedStation[]>();
  for (const s of stations) groups.set(s.town.comarca, [...(groups.get(s.town.comarca) ?? []), s]);
  return [...groups.entries()]
    .map(([code, list]) => ({
      code,
      name: MUNICIPALITIES.comarques[code] ?? code,
      stations: [...list].sort((a, b) => collator.compare(a.town.name, b.town.name) || collator.compare(a.address, b.address)),
    }))
    .sort((a, b) => collator.compare(a.name, b.name));
}

export function comarcaName(code: string): string {
  return MUNICIPALITIES.comarques[code] ?? code;
}

/** Number of municipalities with at least one station in a place. */
export function townCount(stations: readonly ListedStation[]): number {
  return new Set(stations.map((s) => s.town.id)).size;
}

/* -------------------------------------------------------------------------- */
/* Siblings                                                                   */
/* -------------------------------------------------------------------------- */

export function comarcaPageFor(code: string): ComarcaPlace | null {
  return comarques().find((c) => c.code === code) ?? null;
}

export function provincePageFor(code: ProvinceCode): ProvincePlace {
  return provinces().find((p) => p.code === code)!;
}

/** City pages in the same comarca, then the biggest in the same province, up to `limit`. */
export function citySiblings(place: CityPlace, limit = 8): CityPlace[] {
  const others = cities().filter((c) => c.slug !== place.slug);
  const sameComarca = others.filter((c) => c.comarca === place.comarca);
  const sameProvince = others.filter((c) => c.province === place.province && c.comarca !== place.comarca);
  return [...sameComarca, ...sameProvince].slice(0, limit);
}

export function citiesIn(filter: { comarca?: string; province?: ProvinceCode }): CityPlace[] {
  return cities().filter((c) => (!filter.comarca || c.comarca === filter.comarca) && (!filter.province || c.province === filter.province));
}

export function comarquesIn(province: ProvinceCode): ComarcaPlace[] {
  return comarques().filter((c) => c.province === province);
}
