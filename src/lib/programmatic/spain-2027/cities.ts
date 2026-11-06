import { distinctRuns, planFor, plansFor, type Plan } from "@/lib/content/holidays/bridges";
import type { Region } from "@/lib/programmatic/holidays/boe-2027";
import { addDays } from "@/lib/programmatic/holidays/format";

import { communityDays, weekday, type CommunityDay } from "./calendar";
import { CITY_ROWS, CITIES_AS_OF, CITIES_RECHECK_DAYS, type CityRow, type LocalDay, type LocalList } from "./cities-data";
import { names, type CommunityNames } from "./communities";
import { SOURCES } from "./sources";

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

export function cityBySlug(region: Region, slug: string): City | null {
  return CITIES.find((c) => c.region === region && c.slug === slug) ?? null;
}

/** "Las Palmas" where the full name would not fit a title. */
export function shortName(c: City): string {
  return c.short ?? c.name;
}

/** The 2027 list, when the city is in it. */
export function local2027(c: City): LocalList | null {
  return c.status2027 === "published" ? c.local2027 : null;
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
