import type { MetadataRoute } from "next";

import { GUIDES } from "@/lib/programmatic/holidays/links";
import { ROUTE } from "@/lib/programmatic/holidays/paths";
import { councilApproved2027, isAran, municipalities, municipalityBySlug, nextYearFor, nextYearPublished, regionalDays } from "@/lib/programmatic/holidays/data";
import { fullPagePath, placeName } from "@/lib/programmatic/embed-2027/places";
import type { Region } from "@/lib/programmatic/holidays/boe-2027";
import type { SnapshotMunicipality } from "@/lib/programmatic/holidays/types";
import { communityDays } from "@/lib/programmatic/spain-2027/calendar";
import { CITIES, cityCalendar, type City } from "@/lib/programmatic/spain-2027/cities";
import { COMMUNITIES, type CommunityNames } from "@/lib/programmatic/spain-2027/communities";
import { editionCommunityPath, editionNames } from "@/lib/programmatic/spain-2027/editions";
import { communityPath } from "@/lib/programmatic/spain-2027/paths";
import { SOURCES } from "@/lib/programmatic/spain-2027/sources";
import { absoluteUrl } from "@/lib/site";

import { CATALONIA_ID, LEAVE_LOCALES, LEAVE_YEAR, leaveEditions, type LeaveLocale, type PlaceStatus } from "./copy";

/**
 * The places the 2027 leave planner covers and the holidays it counts for
 * each, read from the same functions the town and city pages use. Nothing
 * here states a date of its own:
 *
 *  - Catalonia: the twelve days of Ordre EMT/52/2026 (`regionalDays(2027)`,
 *    with the Aran swap in Aran), plus each town's two local days once the
 *    DOGC order is parsed (`nextYearFor`, `local-2027.json`). Until then the
 *    days a council has approved (`councilApproved2027`, `council-2027.ts`)
 *    travel separately and count only when the reader ticks the box: the
 *    pages print them as "pending the DOGC order", and the .ics feeds leave
 *    them out, so the default plan does too;
 *  - the rest of Spain: each community's column of the BOE's 2027 list
 *    (`communityDays`, BOE-A-2026-21254); for the cities with a page,
 *    `cityCalendar` (the island day in Canarias, Navarra's common local day,
 *    the city's two local days once its bulletin lists them); for Ceuta and
 *    Melilla, one municipality each, the two local days their own calendar
 *    agreement publishes.
 *
 * The browser gets it compactly: the shared lists once (`bases`), and per
 * place only what it adds, as "MMDD" strings.
 */

/**
 * [value, label, page, base index, extra days, council days, status]. Days as
 * "MMDD,MMDD"; page "" when it is `townPrefix` + value + "/" (most towns),
 * "*" when it is the town's Catalan page (English, for towns without one).
 */
export type PlannerItem = [string, string, string, number, string, string, PlaceStatus];

export interface PlannerGroup {
  label: string;
  items: PlannerItem[];
}

export interface PlannerData {
  year: number;
  /** "/ca/festius/": a town's page is this plus its slug, when the item's page is "". */
  townPrefix: string;
  /** Shared holiday lists, "MMDD,MMDD,…": 0 Catalonia, 1 Aran, then one per BOE column outside Catalonia. */
  bases: string[];
  groups: PlannerGroup[];
}

const mmdd = (iso: string) => iso.slice(5, 7) + iso.slice(8, 10);
const pack = (dates: readonly string[]) => [...new Set(dates)].sort().map(mmdd).join(",");

/** Back to dates: "0105,0317" → ["2027-01-05", "2027-03-17"]. */
export function unpack(text: string, year = LEAVE_YEAR): string[] {
  return text ? text.split(",").map((d) => `${year}-${d.slice(0, 2)}-${d.slice(2)}`) : [];
}

const CATALONIA_LABEL: Record<LeaveLocale, string> = { ca: "Catalunya", es: "Cataluña", en: "Catalonia" };
const CATALONIA_ONLY: Record<LeaveLocale, string> = {
  ca: "Tot Catalunya (sense festes locals)",
  es: "Toda Cataluña (sin fiestas locales)",
  en: "All of Catalonia (no local holidays)",
};
const REGION_ONLY: Record<LeaveLocale, string> = {
  ca: "Tota la comunitat (sense festes locals)",
  es: "Toda la comunidad (sin fiestas locales)",
  en: "Whole region (no local holidays)",
};

const CATALONIA_DAYS = regionalDays(LEAVE_YEAR).map((d) => d.date);
const ARAN_DAYS = regionalDays(LEAVE_YEAR, true).map((d) => d.date);
const SPAIN_REGIONS: Region[] = COMMUNITIES.map((c) => c.region).filter((r) => r !== "CT");

/** The 2027 holidays of a Catalan town the planner counts, and the council's pending days apart. */
export function townDays(m: SnapshotMunicipality): { base: string[]; local: string[]; council: string[]; status: PlaceStatus } {
  const base = isAran(m) ? ARAN_DAYS : CATALONIA_DAYS;
  if (nextYearPublished()) {
    const next = nextYearFor(m.slug);
    if (next && next.local.length > 0) return { base, local: next.local, council: [], status: "d" };
    if (next && next.nuclei.length > 0) return { base, local: [], council: [], status: "n" };
    return { base, local: [], council: [], status: "p" };
  }
  const council = councilApproved2027(m.slug);
  return council ? { base, local: [], council: [...council.local], status: "c" } : { base, local: [], council: [], status: "p" };
}

/** A Spanish city with a page: its whole 2027 calendar as the city page gives it. */
export function cityDays(c: City): { base: string[]; extra: string[]; status: PlaceStatus } {
  const base = communityDays(c.region).map((d) => d.date);
  const all = cityCalendar(c).map((d) => d.date);
  const extra = all.filter((d) => !base.includes(d));
  const status: PlaceStatus = c.status2027 === "published" ? "b" : c.status2027 === "missing" ? "m" : "s";
  return { base, extra, status };
}

/** A whole community: its BOE column; Ceuta and Melilla, one municipality each, with their two local days. */
export function regionDays(region: Region): { base: string[]; extra: string[]; status: PlaceStatus } {
  const base = communityDays(region).map((d) => d.date);
  const local = SOURCES[region].local;
  if (local.daysScope === "all" && local.status === "published" && local.days?.length) {
    return { base, extra: local.days.map((d) => d.date).filter((d) => !base.includes(d)), status: "b" };
  }
  return { base, extra: [], status: "r" };
}

function regionLabel(region: Region, locale: LeaveLocale): string {
  const c = COMMUNITIES.find((x) => x.region === region)!;
  return locale === "es" ? c.short : editionNames(region, locale).short;
}

function regionPage(c: CommunityNames, locale: LeaveLocale): string {
  return locale === "es" ? communityPath(c) : editionCommunityPath(locale, c.region);
}

/** Every place, for the picker: Catalonia (all of it, then the towns A–Z), then each community A–Z with its cities. */
export function plannerData(locale: LeaveLocale): PlannerData {
  const bases = [pack(CATALONIA_DAYS), pack(ARAN_DAYS), ...SPAIN_REGIONS.map((r) => pack(communityDays(r).map((d) => d.date)))];
  const baseIndex = (region: Region) => 2 + SPAIN_REGIONS.indexOf(region);
  const townPrefix = `/${locale}/${ROUTE[locale].root}/`;
  const short = (value: string, page: string) => (page === `${townPrefix}${value}/` ? "" : page === `${CA_TOWN_PREFIX}${value}/` ? "*" : page);

  const towns = [...municipalities()]
    .map((m) => ({ m, label: placeName(locale, { kind: "town", m }) }))
    .sort((a, b) => a.label.localeCompare(b.label, locale))
    .map(({ m, label }): PlannerItem => {
      const t = townDays(m);
      return [m.slug, label, short(m.slug, fullPagePath(locale, { kind: "town", m })), isAran(m) ? 1 : 0, pack(t.local), pack(t.council), t.status];
    });
  const catalonia: PlannerGroup = {
    label: CATALONIA_LABEL[locale],
    items: [[CATALONIA_ID, CATALONIA_ONLY[locale], GUIDES.workCalendar[locale], 0, "", "", "r"], ...towns],
  };

  const spain = COMMUNITIES.filter((c) => c.region !== "CT")
    .map((community) => {
      const cities = CITIES.filter((c) => c.region === community.region)
        .map((c) => ({ c, label: placeName(locale, { kind: "city", c }) }))
        .sort((a, b) => a.label.localeCompare(b.label, locale))
        .map(({ c, label }): PlannerItem => {
          const d = cityDays(c);
          return [`${community.slug}/${c.slug}`, label, fullPagePath(locale, { kind: "city", c }), baseIndex(c.region), pack(d.extra), "", d.status];
        });
      const r = regionDays(community.region);
      const label = regionLabel(community.region, locale);
      const whole: PlannerItem = [`${community.slug}/all`, community.city ? label : REGION_ONLY[locale], regionPage(community, locale), baseIndex(community.region), pack(r.extra), "", r.status];
      return { label, items: [whole, ...cities] };
    })
    .sort((a, b) => a.label.localeCompare(b.label, locale));

  return { year: LEAVE_YEAR, townPrefix, bases, groups: [catalonia, ...spain] };
}

/** Every value of the picker, with its place (for the tests and the page's own example). */
export function plannerPlace(data: PlannerData, value: string): { item: PlannerItem; group: PlannerGroup } | null {
  for (const group of data.groups) {
    const item = group.items.find((i) => i[0] === value);
    if (item) return { item, group };
  }
  return null;
}

/** "/ca/festius/": where "*" points. */
export const CA_TOWN_PREFIX = "/ca/festius/";

/** The page an entry links to (the client component reads it the same way). */
export function itemPage(data: Pick<PlannerData, "townPrefix">, item: PlannerItem): string {
  return item[2] === "*" ? `${CA_TOWN_PREFIX}${item[0]}/` : item[2] || `${data.townPrefix}${item[0]}/`;
}

/** The holidays one picker entry counts: its base list, what it adds, and the council's days when asked for. */
export function itemHolidays(data: Pick<PlannerData, "bases" | "year">, item: PlannerItem, withCouncil = false): string[] {
  const [, , , base, extra, council] = item;
  return [...new Set([...unpack(data.bases[base] ?? "", data.year), ...unpack(extra, data.year), ...(withCouncil ? unpack(council, data.year) : [])])].sort();
}

/** The town the page opens with, for the server-rendered example. */
export function defaultTown(): SnapshotMunicipality {
  const m = municipalityBySlug("barcelona");
  if (!m) throw new Error("leave planner: no Barcelona in the holiday snapshot");
  return m;
}

/** When the page's words last changed (the data it computes from has its own dates). */
export const LEAVE_PAGE_AS_OF = "2026-11-13";

/** The planner's three pages. x-default is the English one (the site's rule). */
export function leaveSitemapEntries(lastModified: string = LEAVE_PAGE_AS_OF): MetadataRoute.Sitemap {
  const e = leaveEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return LEAVE_LOCALES.map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: 0.6,
    alternates: { languages },
  }));
}
