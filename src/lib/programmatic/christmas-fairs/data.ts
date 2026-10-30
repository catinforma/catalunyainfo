/**
 * The Christmas fairs family's data: the committed snapshot merged with the
 * organisers' own announcements. Server only, pure: nothing here touches the
 * network, the database or the clock.
 *
 * Doorway guardrail: a town has a page only when at least one fair of the
 * season is dated there (calendar dates not "to be confirmed", or an
 * organiser's announcement). Every other place stays on the hub.
 */

import { municipalities as holidayTowns } from "@/lib/programmatic/holidays/data";
import { DATE_PAGES, type DatePage } from "@/lib/programmatic/holidays/paths";
import { slugify } from "@/lib/programmatic/holidays/slug";
import { LINES } from "@/lib/programmatic/rodalies/data";
import type { LineId } from "@/lib/programmatic/rodalies/types";
import { comarcaName, inFilter, municipality, shippedZones, stationMunicipality } from "@/lib/programmatic/weekend/data";
import type { RegisterMunicipality } from "@/lib/programmatic/weekend/types";
import { zoneFilter, type ZoneDef } from "@/lib/programmatic/weekend/zones";

import { SEASON, inSeason } from "./classify";
import { ORGANISER_FAIRS, PENDING_MARKETS } from "./organisers";
import { EN_TOWNS } from "./paths";
import snapshotJson from "./snapshot.json" with { type: "json" };
import type { ChristmasSnapshot, Fair, OrganiserFair, PendingMarket } from "./types";

export const SNAPSHOT = snapshotJson as ChristmasSnapshot;

const byDate = (a: Fair, b: Fair) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end) || a.name.localeCompare(b.name, "ca");

/**
 * The season's fairs: the snapshot's rows, with an organiser's dates where its
 * page corrects the calendar, plus the organisers' announcements the open data
 * does not carry. In date order.
 */
export function mergeFairs(snapshot: ChristmasSnapshot, organisers: readonly OrganiserFair[]): Fair[] {
  const corrections = new Map(organisers.filter((o) => o.replaces).map((o) => [o.replaces!, o]));
  const out: Fair[] = snapshot.fairs.map((f) => {
    const o = corrections.get(f.id);
    const base: Fair = { ...f, checked: null, datasetDates: null };
    if (!o) return base;
    const changed = o.start !== f.start || o.end !== f.end;
    return {
      ...base,
      start: o.start,
      end: o.end,
      place: o.place ?? f.place,
      checked: { url: o.url, publisher: o.publisher, readOn: o.readOn, quote: o.quote },
      datasetDates: changed ? { start: f.start, end: f.end } : null,
    };
  });
  for (const o of organisers) {
    if (o.replaces) continue;
    out.push({
      id: o.id,
      source: "organiser",
      name: o.name,
      nameEs: null,
      ine: o.ine,
      start: o.start,
      end: o.end,
      place: o.place,
      web: o.url,
      webReplaced: false,
      organiser: o.publisher,
      since: null,
      toConfirm: false,
      checked: { url: o.url, publisher: o.publisher, readOn: o.readOn, quote: o.quote },
      datasetDates: null,
    });
  }
  return out.filter((f) => inSeason(f.start, f.end, snapshot.season)).sort(byDate);
}

export const FAIRS: readonly Fair[] = mergeFairs(SNAPSHOT, ORGANISER_FAIRS);

/** A fair that can give its town a page: dated, placed in a known municipality. */
export function qualifies(f: Fair): boolean {
  return !f.toConfirm && Boolean(f.start) && Boolean(f.end) && Boolean(municipality(f.ine));
}

/* -------------------------------------------------------------------------- */
/* Towns                                                                      */
/* -------------------------------------------------------------------------- */

export interface Town extends RegisterMunicipality {
  /** URL segment, the same as the holiday pages': "sant-feliu-de-guixols". */
  slug: string;
  /** This town's fairs of the season, in date order. */
  fairs: Fair[];
}

/** The towns that have a page: at least one qualifying fair. In Catalan name order. */
export function shippedTowns(fairs: readonly Fair[] = FAIRS): Town[] {
  const byIne = new Map<string, Fair[]>();
  for (const f of fairs) {
    if (!f.ine) continue;
    const list = byIne.get(f.ine) ?? [];
    list.push(f);
    byIne.set(f.ine, list);
  }
  const out: Town[] = [];
  for (const [ine, list] of byIne) {
    const m = municipality(ine);
    if (!m || !list.some(qualifies)) continue;
    out.push({ ...m, slug: slugify(m.name), fairs: [...list].sort(byDate) });
  }
  return out.sort((a, b) => a.name.replace(/^(el|la|les|els) |^l'/, "").localeCompare(b.name.replace(/^(el|la|les|els) |^l'/, ""), "ca"));
}

const TOWNS = shippedTowns();
const BY_SLUG = new Map(TOWNS.map((t) => [t.slug, t]));

export function towns(): Town[] {
  return TOWNS;
}

export function townBySlug(slug: string): Town | null {
  return BY_SLUG.get(slug) ?? null;
}

export function townByIne(ine: string): Town | null {
  return TOWNS.find((t) => t.ine === ine) ?? null;
}

export function hasEnglish(town: Pick<Town, "ine">): boolean {
  return EN_TOWNS.includes(town.ine);
}

/** The towns with an English page. */
export function englishTowns(): Town[] {
  return TOWNS.filter(hasEnglish);
}

/** Population rank among the holiday pages' towns (1 = largest); towns outside that list come after. */
export function populationRank(ine: string): number {
  return holidayTowns().find((m) => m.ine === ine)?.rank ?? Number.MAX_SAFE_INTEGER;
}

/** Towns by population, largest first (names break the ties). */
export function townsByPopulation(): Town[] {
  return [...TOWNS].sort((a, b) => populationRank(a.ine) - populationRank(b.ine) || a.name.localeCompare(b.name, "ca"));
}

/** Other towns with a page, nearest first: same comarca, then same province; each by first fair date. */
export function nearbyTowns(town: Town, limit = 6): Town[] {
  const first = (t: Town) => t.fairs[0]?.start ?? "";
  const others = TOWNS.filter((t) => t.ine !== town.ine);
  const sameComarca = others.filter((t) => t.comarca === town.comarca).sort((a, b) => first(a).localeCompare(first(b)));
  const sameProvince = others
    .filter((t) => t.comarca !== town.comarca && t.province === town.province)
    .sort((a, b) => first(a).localeCompare(first(b)));
  return [...sameComarca, ...sameProvince].slice(0, limit);
}

export function comarcaOf(town: Pick<Town, "comarca">): string {
  return comarcaName(town.comarca);
}

/** Towns grouped by province (Barcelona, Girona, Lleida, Tarragona), each in name order. */
export function townsByProvince(): { province: string; towns: Town[] }[] {
  const order = ["08", "17", "25", "43"];
  return order.map((province) => ({ province, towns: TOWNS.filter((t) => t.province === province) })).filter((g) => g.towns.length > 0);
}

/* -------------------------------------------------------------------------- */
/* Pending big markets                                                        */
/* -------------------------------------------------------------------------- */

export function pendingMarkets(): readonly PendingMarket[] {
  return PENDING_MARKETS;
}

export function pendingFor(ine: string): PendingMarket[] {
  return PENDING_MARKETS.filter((p) => p.ine === ine);
}

/* -------------------------------------------------------------------------- */
/* Guidance data: trains, holidays, weekend zone                              */
/* -------------------------------------------------------------------------- */

export interface TownLine {
  id: LineId;
  name: string;
  journey: string;
  /** Stations of this line in the town, in line order. */
  stations: string[];
}

/** Rodalies and regional lines with a station in the town (stations placed by name, as the weekend pages do). */
export function linesFor(town: Pick<Town, "ine">): TownLine[] {
  const out: TownLine[] = [];
  for (const line of LINES) {
    const stations = line.stations.filter((s) => stationMunicipality(s.name)?.ine === town.ine).map((s) => s.name);
    if (stations.length > 0) out.push({ id: line.id, name: line.name, journey: line.journey, stations });
  }
  return out;
}

/** The town's holiday page, when it has one, with its shop-opening days in the season. */
export function holidayTown(ine: string): { slug: string; name: string; shops: string[]; local: string[] } | null {
  const m = holidayTowns().find((t) => t.ine === ine);
  if (!m) return null;
  return {
    slug: m.slug,
    name: m.name,
    shops: m.shops.filter((d) => d >= SEASON.from && d <= SEASON.to),
    local: m.local.filter((d) => d >= SEASON.from && d <= SEASON.to),
  };
}

/** The "is it a holiday?" date pages that fall on a day of the fair. */
export function holidayDatesIn(start: string, end: string): DatePage[] {
  return DATE_PAGES.filter((d) => d >= start && d <= end);
}

const ZONE_ORDER: Record<ZoneDef["kind"], number> = { city: 0, comarca: 1, brand: 2, province: 3 };

/** The most specific weekend zone page (ca/es) that contains the town. */
export function weekendZoneFor(town: Pick<Town, "ine" | "comarca" | "province">): ZoneDef | null {
  const zones = shippedZones()
    .filter((z) => inFilter(town, zoneFilter(z)))
    .sort((a, b) => ZONE_ORDER[a.kind] - ZONE_ORDER[b.kind]);
  return zones[0] ?? null;
}

/** The last day anything on the town's page was read: the snapshot, or an organiser's page. */
export function lastChecked(town: Pick<Town, "fairs">): string {
  return town.fairs.reduce((latest, f) => (f.checked && f.checked.readOn > latest ? f.checked.readOn : latest), SNAPSHOT.readOn);
}

/** The latest date anything in the family was read (hub and sitemap). */
export function familyLastChecked(): string {
  return [SNAPSHOT.readOn, ...ORGANISER_FAIRS.map((o) => o.readOn), ...PENDING_MARKETS.map((p) => p.readOn)].sort().at(-1)!;
}
