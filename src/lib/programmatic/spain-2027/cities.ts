import { distinctRuns, planFor, plansFor, type Plan } from "@/lib/content/holidays/bridges";
import type { Region } from "@/lib/programmatic/holidays/boe-2027";
import { addDays } from "@/lib/programmatic/holidays/format";

import { communityDays, weekday, type CommunityDay } from "./calendar";
import { CITY_ROWS, CITIES_AS_OF, CITIES_RECHECK_DAYS, type CityRow, type CouncilAct, type LocalDay, type LocalList } from "./cities-data";
import { names, type CommunityNames } from "./communities";
import { SOURCES, type PendingCheck } from "./sources";

/**
 * The city pages' facts, computed from `cities-data.ts` (the local days, as
 * the bulletins publish them) and the BOE table (`calendar.ts`). Nothing here
 * states a fact of its own.
 */

export interface City extends CityRow {
  community: CommunityNames;
}

export const CITIES: readonly City[] = CITY_ROWS.map((row) => ({ ...row, community: names(row.region) }));

/** The date the pending statuses must be read again by: `CITIES_AS_OF` + 21 days. */
export const CITIES_RECHECK_BY = addDays(CITIES_AS_OF, CITIES_RECHECK_DAYS);

/** The community's cities with a page, most populous first. */
export function citiesOf(region: Region): City[] {
  return CITIES.filter((c) => c.region === region).sort((a, b) => b.population - a.population);
}

/** Links to city pages a city page carries at least (25 Nov 2026): fewer indexable neighbours in its community are topped up from other communities. */
export const MIN_CITY_LINKS = 6;

/**
 * Cities of other communities, nearest in population first, to top up a city
 * page whose own community has fewer than `MIN_CITY_LINKS` indexable cities
 * (Pamplona is Navarre's only city page; Mazarrón's neighbours in Murcia are
 * all out of the English index, so Mazarrón was linked from the hub only).
 * `keptNeighbours` is how many of the page's community neighbours Google keeps;
 * `isKept` tests a candidate in the page's own edition.
 */
export function similarCities(c: City, keptNeighbours: number, isKept: (x: City) => boolean): City[] {
  const need = MIN_CITY_LINKS - keptNeighbours;
  if (need <= 0) return [];
  return CITIES.filter((x) => x.region !== c.region && isKept(x))
    .sort((a, b) => Math.abs(a.population - c.population) - Math.abs(b.population - c.population) || b.population - a.population || a.slug.localeCompare(b.slug))
    .slice(0, need);
}

export function cityBySlug(region: Region, slug: string): City | null {
  return CITIES.find((c) => c.region === region && c.slug === slug) ?? null;
}

/**
 * The day the city's local days were read on its bulletin: the row's own date
 * (20,000+ wave) or `CITIES_AS_OF`; for a city still waiting for its
 * community's list, the day that bulletin was last searched for it
 * (`PENDING_CHECKS`, sources.ts).
 */
export function cityReadOn(c: Pick<CityRow, "readOn" | "status2027" | "region">): string {
  const checked = c.status2027 === "pending" ? SOURCES[c.region].local.checked : undefined;
  return checked?.date ?? c.readOn ?? CITIES_AS_OF;
}

/**
 * The last issue of the community's bulletin searched for the city's 2027
 * days, while they are pending, or while only the council has fixed them
 * (status "council": the bulletin still has to publish them).
 */
export function pendingCheck(c: Pick<CityRow, "status2027" | "region">): PendingCheck | null {
  return c.status2027 === "pending" || c.status2027 === "council" ? (SOURCES[c.region].local.checked ?? null) : null;
}

/** "Las Palmas" where the full name would not fit a title. */
export function shortName(c: City): string {
  return c.short ?? c.name;
}

/**
 * The 2027 days the page prints: the community's list when the city is in
 * it, or the council's own act before that list (status "council", labelled
 * as such wherever it is printed).
 */
export function local2027(c: City): LocalList | null {
  return c.status2027 === "published" || c.status2027 === "council" ? c.local2027 : null;
}

/** Only the bulletin's list: what the .ics feed, the widget and the working-days calculator count. */
export function bulletinLocal2027(c: City): LocalList | null {
  return c.status2027 === "published" ? c.local2027 : null;
}

/** Status "council": the act and the bulletin still to publish the days. */
export function councilAct(c: City): { act: CouncilAct; source: LocalList["source"]; bulletin: string; check: PendingCheck | null } | null {
  const list = c.status2027 === "council" ? c.local2027 : null;
  if (!list?.act) return null;
  return { act: list.act, source: list.source, bulletin: SOURCES[c.region].local.bulletinShort, check: pendingCheck(c) };
}

/** True when the bulletin splits the municipality into parts with different days. */
export function isZoned(c: City): boolean {
  return Boolean(local2027(c)?.zones?.length);
}

/** The 2027 local days of the city (of its main part when the bulletin splits it), in date order. */
export function localDays(c: City): LocalDay[] {
  return [...(local2027(c)?.days ?? [])].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * A 2027 local day already fixed for the whole community, known before the
 * municipality's own list: Navarra's 3 December (Resolución 232/2026,
 * `SOURCES.NC.local.days`). Empty once the city's 2027 list is in (it then
 * carries the day itself) and everywhere else.
 */
export function commonLocalDays(c: City): LocalDay[] {
  const local = SOURCES[c.region].local;
  if (local2027(c) || local.daysScope !== "common" || !local.days) return [];
  return local.days.map((d) => ({ date: d.date, name: d.name, note: `común a toda ${c.community.short}` }));
}

/** Canarias: the island's own day (Decreto 115/2026, `SOURCES.CN.subRegional`). */
export function islandDay(c: City): { date: string; name: string; place: string } | null {
  if (!c.island) return null;
  const item = SOURCES[c.region].subRegional?.items.find((i) => i.place === c.island);
  return item ? { date: item.date, name: item.name, place: item.place } : null;
}

export type CityDayKind = "national" | "national-kept" | "regional" | "island" | "local";

export interface CityDay {
  date: string;
  name: string | null;
  kind: CityDayKind;
  /** For a local day: the bulletin's note on where it applies. */
  note?: string;
  /** For a BOE substitution row: the date it stands in for. */
  replaces?: string | null;
}

/** Every 2027 holiday of the city: the BOE days of its community, its island's day, its local days (2027 only). */
export function cityCalendar(c: City): CityDay[] {
  const regional: CityDay[] = communityDays(c.region).map((d: CommunityDay) => ({ date: d.date, name: d.name, kind: d.kind, replaces: d.replaces }));
  const island = islandDay(c);
  const local: CityDay[] = [...localDays(c), ...commonLocalDays(c)].map((d) => ({ date: d.date, name: d.name, kind: "local" as const, ...(d.note ? { note: d.note } : {}) }));
  return [...regional, ...(island ? [{ date: island.date, name: island.name, kind: "island" as const }] : []), ...local].sort(
    (a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind),
  );
}

/**
 * `cityCalendar` as the bulletins publish it: without the days a council has
 * approved and its community's bulletin has not yet listed (status
 * "council"). The .ics feed, the widget, the working-days calculator and the
 * planner's default count only these, as with the Catalan councils' days
 * before the DOGC order.
 */
export function officialCalendar(c: City): CityDay[] {
  if (c.status2027 !== "council") return cityCalendar(c);
  return cityCalendar(c).filter((d) => d.kind !== "local");
}

/** Status "council": the council's two days, in date order (empty otherwise). */
export function councilDays(c: City): string[] {
  return c.status2027 === "council" ? localDays(c).map((d) => d.date) : [];
}

/** One per date: how many days off the city has in 2027 (a local day on a regional one would count once). */
export function holidayCount(c: City): number {
  return new Set(cityCalendar(c).map((d) => d.date)).size;
}

/** The dates off in the city that are not local: the BOE days and the island day. */
export function nonLocalDates(c: City): string[] {
  const island = islandDay(c);
  return [...new Set([...communityDays(c.region).map((d) => d.date), ...(island ? [island.date] : [])])].sort();
}

function isWeekend(iso: string): boolean {
  const w = weekday(iso);
  return w === 0 || w === 6;
}

/** The local days that fall on a Saturday or Sunday: no extra day off in a Monday-to-Friday week. */
export function weekendLocalDays(c: City): LocalDay[] {
  return localDays(c).filter((d) => isWeekend(d.date));
}

/** Local days that are already a holiday of the community (none in the 2027 rows; a test holds it). */
export function localOnRegional(c: City): LocalDay[] {
  const regional = new Set(nonLocalDates(c));
  return localDays(c).filter((d) => regional.has(d.date));
}

/**
 * Every long weekend and bridge of 2027 in the city, counting its local days
 * (holiday engine, Monday-to-Friday week). Runs shared by two holidays are
 * listed once.
 */
export function cityRuns(c: City): Plan[] {
  const all = [...new Set([...nonLocalDates(c), ...[...localDays(c), ...commonLocalDays(c)].map((d) => d.date)])];
  return distinctRuns(plansFor(all).map((p) => p.plan));
}

/** The runs a local day belongs to: what the city's own days add. */
export function localRuns(c: City): Plan[] {
  const local = localDays(c).map((d) => d.date);
  return cityRuns(c).filter((r) => local.some((d) => d >= r.from && d <= r.to));
}

/** The plan built around one local day, given every day off in the city. */
export function planForLocal(c: City, iso: string): Plan | null {
  const off = new Set([...nonLocalDates(c), ...localDays(c).map((d) => d.date)]);
  return planFor(iso, off);
}

/** The other cities with a page in the same community whose 2027 local days include `iso`, most populous first. */
export function sharedWith(c: City, iso: string): City[] {
  return citiesOf(c.region).filter((x) => x.slug !== c.slug && localDays(x).some((d) => d.date === iso));
}

/** Cities whose 2027 list the community has not published: the month it is expected in, from the 2026 precedent. */
export function expectedMonth(region: Region): string | null {
  const y2026 = SOURCES[region].local.y2026;
  return y2026 ? y2026.date.slice(0, 7) : null;
}

/**
 * The city's 2027 calendar split by who fixes each day (18 Nov 2026), for the
 * block under the answer: the days common to all of Spain, the community's
 * own (its BOE column minus the common ones, from its decree), the island day
 * in Canarias, and the local days with their bulletin, or the pending status.
 * Every day of `cityCalendar` is in exactly one layer (a test holds it).
 */
export interface CityLayers {
  common: CommunityDay[];
  community: CommunityDay[];
  island: { date: string; name: string; place: string } | null;
  /** The 2027 local days (of the main area when zoned), or Navarra's common one while the town's own is pending. */
  local: LocalDay[];
  /** The bulletin the local days come from, when the 2027 list is out. */
  localSource: LocalList["source"] | null;
  /** While the list is pending: the last issue searched for it. */
  pending: PendingCheck | null;
}

export function cityLayers(c: City): CityLayers {
  const days = communityDays(c.region);
  const list = local2027(c);
  return {
    common: days.filter((d) => d.common),
    community: days.filter((d) => !d.common),
    island: islandDay(c),
    local: list ? localDays(c) : commonLocalDays(c),
    localSource: list?.source ?? null,
    pending: pendingCheck(c),
  };
}

/**
 * The community's most searched city pages, for the line under the
 * community page's calendar ("festivos <ciudad> 2027" lands on the city
 * pages, not on the community). Search Console 5–18 Nov 2026, impressions per
 * city page, up to six with 50 or more (`scripts/snapshot.py page 2027 14`
 * and the page split), most first; re-read at the low-demand review
 * (LOW_DEMAND_REVIEW_BY, 10 Dec). A community without one falls back to its
 * most populous cities.
 */
export const SEARCHED_CITIES: Partial<Record<Region, readonly string[]>> = {
  AN: ["marbella", "jerez-de-la-frontera", "el-puerto-de-santa-maria", "la-linea-de-la-concepcion", "sevilla", "dos-hermanas"],
  AR: ["zaragoza", "teruel", "huesca"],
  AS: ["gijon", "aviles", "oviedo", "siero"],
  CB: ["torrelavega"],
  CL: ["ponferrada", "segovia", "palencia", "salamanca"],
  CN: ["telde", "arona", "la-laguna", "san-bartolome-de-tirajana", "adeje", "santa-lucia-de-tirajana"],
  EX: ["merida"],
  GA: ["vigo", "ourense", "a-coruna", "santiago-de-compostela"],
  IB: ["palma", "ibiza"],
  MC: ["cartagena", "lorca", "molina-de-segura"],
  MD: ["alcobendas", "alcorcon", "pinto", "valdemoro", "parla", "tres-cantos"],
  NC: ["pamplona"],
  PV: ["vitoria", "bilbao", "getxo", "barakaldo", "san-sebastian"],
  RI: ["logrono"],
  VC: ["gandia", "benidorm", "paterna", "san-vicente-del-raspeig", "vila-real", "sagunto"],
};

/** The cities for that line: the searched ones, else the four most populous; empty where the community has no city page. */
export function searchedCitiesOf(region: Region): City[] {
  const slugs = SEARCHED_CITIES[region];
  if (!slugs) return citiesOf(region).slice(0, 4);
  return slugs.map((s) => cityBySlug(region, s)).filter((x): x is City => x !== null);
}
