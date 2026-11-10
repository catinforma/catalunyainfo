import { distinctRuns, plansFor, type Plan } from "@/lib/content/holidays/bridges";
import { BOE_2026_ROWS, boeRegionsOn2026 } from "@/lib/programmatic/holidays/boe-2026";
import { BOE_2027_ROWS, REGIONS, type BoeCode, type Region } from "@/lib/programmatic/holidays/boe-2027";

import { COMMON_DATES, SUBSTITUTIONS, YEAR, weekday } from "./calendar";
import { SOURCES, type OfficialText } from "./sources";

/**
 * "¿Es festivo el 19 de marzo de 2027?" for the whole of Spain, with no place
 * in the question: one entry per date that is a day off somewhere in 2027,
 * computed from the texts the Spain calendar already holds, nothing typed
 * twice:
 *
 *  - the BOE's table (`BOE_2027_ROWS`, BOE-A-2026-21254): every row, with the
 *    columns it marks;
 *  - the local days a whole territory shares (`sources.ts`, read on the
 *    bulletins on 5-6 Nov 2026): Ceuta's and Melilla's two (one municipality
 *    each) and Navarra's 3 December, which the BOE leaves out because they
 *    are local;
 *  - the Canary Islands' island days, from the BOE's own note 1;
 *  - the days a community's decree says it moved from a Sunday (Andalucía,
 *    28 February);
 *  - 15 August, a national day on a Sunday: no BOE row, but two substitution
 *    rows name it (`SUBSTITUTIONS`), so it gets a page saying where it went;
 *  - the 2026 table (`BOE_2026_ROWS`, BOE-A-2025-21667), only to say where the
 *    same day was a holiday last year when that differs.
 *
 * Which dates get a page of their own (`page`): a date says something beyond
 * one line when it is a national day, or a weekday holiday in at least one of
 * the seventeen communities (where it is and is not, the long weekend it
 * makes, what changed). The others are folded into the hub's list: a day
 * only Ceuta and/or Melilla have, or one community's day on a Saturday
 * (11 September, 9 October), where the page would say "yes, there" and
 * nothing more.
 */

/** Why a territory has the day off. */
export interface DayHolder {
  region: Region;
  /** The BOE row's name, or the local day's name as its own text gives it. */
  name: string;
  /** "boe": a row of the 2027 table; "local": a local day the whole territory shares. */
  basis: "boe" | "local";
  /** The BOE's code for the column ("*", "**", "***"); null for a local day. */
  code: BoeCode | null;
  /** A substitution row: the Sunday it stands in for (16 August, 11 October). */
  replaces: string | null;
  /** The community's own decree says it moved the day here from a Sunday (Andalucía: 28 February). */
  movedFrom: string | null;
  /** The text that fixes a local day (the BOE needs no extra source). */
  source: OfficialText | null;
}

export interface SpainDay {
  date: string;
  /** Where it is a day off, one entry per territory, in the BOE's column order. */
  holders: DayHolder[];
  regions: Region[];
  /** A day off in all nineteen columns of the BOE. */
  national: boolean;
  /** 15 August 2027: a national day on a Sunday, and the days that stand in for it. */
  moved: { to: { date: string; name: string; regions: Region[] }[] } | null;
  /** Canary Islands' island days on the same date (BOE note 1): not a whole territory, so not counted. */
  islands: { place: string; name: string }[];
  /** Its own page, or a line on the hub only. */
  page: boolean;
}

const CITIES: readonly Region[] = ["CE", "ML"];

export function isCity(region: Region): boolean {
  return CITIES.includes(region);
}

export function isWeekend(iso: string): boolean {
  const wd = weekday(iso);
  return wd === 0 || wd === 6;
}

/** Local days a whole territory shares: both of Ceuta's and Melilla's, Navarra's 3 December. */
export function regionWideLocal(region: Region): { date: string; name: string; source: OfficialText | null }[] {
  const s = SOURCES[region];
  if (!s.local.days?.length || !s.local.daysScope) return [];
  // The text that fixes them: the 2027 local list, or (Navarra) the calendar resolution that includes 3 December.
  const source = s.local.y2027 ?? (s.decree.status === "published" ? s.decree.text : null);
  return s.local.days.filter((d) => d.date.startsWith(`${YEAR}-`)).map((d) => ({ date: d.date, name: d.name, source }));
}

/** Every day off a Monday-to-Friday worker has in the territory: its BOE column and its shared local days. */
export function territoryDaysOff(region: Region): string[] {
  const boe = BOE_2027_ROWS.filter((r) => r.marks[region]).map((r) => r.date);
  return [...new Set([...boe, ...regionWideLocal(region).map((d) => d.date)])].sort();
}

function movedFrom(region: Region, iso: string): string | null {
  const d = SOURCES[region].decree;
  return d.status === "published" ? (d.moves.find((m) => m.date === iso)?.replaces ?? null) : null;
}

function holdersOn(iso: string): DayHolder[] {
  const out: DayHolder[] = [];
  for (const region of REGIONS) {
    const row = BOE_2027_ROWS.find((r) => r.date === iso && r.marks[region]);
    if (row) {
      out.push({
        region,
        name: row.name,
        basis: "boe",
        code: row.marks[region]!,
        replaces: SUBSTITUTIONS[row.name]?.replaces ?? null,
        movedFrom: movedFrom(region, iso),
        source: null,
      });
      continue;
    }
    const local = regionWideLocal(region).find((d) => d.date === iso);
    if (local) out.push({ region, name: local.name, basis: "local", code: null, replaces: null, movedFrom: null, source: local.source });
  }
  return out;
}

/** The Sundays the BOE's substitution rows stand in for (15 August 2027), with where each went. */
function movedSundays(): Map<string, { date: string; name: string; regions: Region[] }[]> {
  const out = new Map<string, { date: string; name: string; regions: Region[] }[]>();
  for (const row of BOE_2027_ROWS) {
    const s = SUBSTITUTIONS[row.name];
    if (!s) continue;
    const regions = REGIONS.filter((r) => row.marks[r]);
    out.set(s.replaces, [...(out.get(s.replaces) ?? []), { date: row.date, name: row.name, regions }]);
  }
  for (const list of out.values()) list.sort((a, b) => a.date.localeCompare(b.date));
  return out;
}

const MOVED = movedSundays();

function islandsOn(iso: string): { place: string; name: string }[] {
  return (SOURCES.CN.subRegional?.items ?? []).filter((i) => i.date === iso).map((i) => ({ place: i.place, name: i.name }));
}

/** The rule in the header: national, 15 August, or a weekday holiday in at least one of the seventeen communities. */
function deservesPage(day: Omit<SpainDay, "page">): boolean {
  if (day.national || day.moved) return true;
  const communities = day.regions.filter((r) => !isCity(r));
  if (communities.length === 0) return false;
  if (day.regions.length === 1 && isWeekend(day.date)) return false;
  return true;
}

function build(): SpainDay[] {
  const dates = new Set<string>([...BOE_2027_ROWS.map((r) => r.date), ...MOVED.keys()]);
  for (const region of REGIONS) for (const d of regionWideLocal(region)) dates.add(d.date);
  return [...dates].sort().map((date) => {
    const holders = holdersOn(date);
    const base = {
      date,
      holders,
      regions: holders.map((h) => h.region),
      national: COMMON_DATES.includes(date),
      moved: MOVED.has(date) ? { to: MOVED.get(date)! } : null,
      islands: islandsOn(date),
    };
    return { ...base, page: deservesPage(base) };
  });
}

/** Every date that is a day off somewhere in 2027 (and 15 August), in date order. */
export const SPAIN_DAYS: readonly SpainDay[] = build();

/** The dates with a page of their own, in date order. */
export const DAY_PAGES: readonly string[] = SPAIN_DAYS.filter((d) => d.page).map((d) => d.date);

export function spainDay(iso: string): SpainDay | null {
  return SPAIN_DAYS.find((d) => d.date === iso) ?? null;
}

export function hasDayPage(iso: string): boolean {
  return DAY_PAGES.includes(iso);
}

/** The pages before and after, in the year's order. */
export function neighbours(iso: string): { prev: string | null; next: string | null } {
  const i = DAY_PAGES.indexOf(iso);
  return { prev: i > 0 ? DAY_PAGES[i - 1]! : null, next: i >= 0 && i < DAY_PAGES.length - 1 ? DAY_PAGES[i + 1]! : null };
}

/* -------------------------------------------------------------------------- */
/* Long weekends                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The long weekends and bridges that include this date in one territory, as
 * the holiday engine plans them around each of its days off (`plansFor`, the
 * rules of the Spain bridges page): 6 December 2027 is in the 4-6 December
 * weekend and in the 4-8 December bridge. Empty on a weekend day.
 */
export function territoryRuns(region: Region, iso: string): Plan[] {
  return distinctRuns(plansFor(territoryDaysOff(region)).map((p) => p.plan)).filter((run) => run.from <= iso && iso <= run.to);
}

export interface RunGroup {
  run: Plan;
  regions: Region[];
}

/**
 * The long weekends a day is part of, grouped where they are the same (dates
 * and leave): the most widespread first, then the one with less leave. For
 * 15 August, the days that stand in for it.
 */
export function dayRuns(day: SpainDay): RunGroup[] {
  const anchors: { iso: string; regions: Region[] }[] = day.moved ? day.moved.to.map((t) => ({ iso: t.date, regions: t.regions })) : [{ iso: day.date, regions: day.regions }];
  const groups = new Map<string, RunGroup>();
  for (const { iso, regions } of anchors) {
    for (const region of regions) {
      for (const run of territoryRuns(region, iso)) {
        const key = `${run.from}|${run.to}|${run.take.join(",")}`;
        const found = groups.get(key);
        if (found) found.regions.push(region);
        else groups.set(key, { run, regions: [region] });
      }
    }
  }
  return [...groups.values()].sort(
    (a, b) => b.regions.length - a.regions.length || a.run.take.length - b.run.take.length || a.run.from.localeCompare(b.run.from) || a.run.to.localeCompare(b.run.to),
  );
}

/* -------------------------------------------------------------------------- */
/* Against 2026                                                               */
/* -------------------------------------------------------------------------- */

/** Days that move with Easter (or Corpus): compared with the 2026 row of the same name, not the same date. */
const MOVABLE = ["Jueves Santo", "Viernes Santo", "Lunes de Pascua", "Corpus Christi"] as const;

export function movableName(iso: string): (typeof MOVABLE)[number] | null {
  return MOVABLE.find((name) => BOE_2027_ROWS.some((r) => r.date === iso && r.name === name)) ?? null;
}

export interface Change2026 {
  /** The 2026 date compared (the same day of the month, or the same feast). */
  date2026: string;
  regions2026: Region[];
  /** In the 2027 table and not in 2026's. */
  gained: Region[];
  /** In the 2026 table and not in 2027's. */
  lost: Region[];
}

/**
 * Where the same day was a holiday in the 2026 BOE table, when that differs
 * from 2027's (BOE rows only, both years: the local days of 2026 are not
 * held). Null when the 2026 table has no row that day (a weekend then, or a
 * day of its own) or the same territories.
 */
export function change2026(day: SpainDay): Change2026 | null {
  if (day.moved) return null;
  const feast = movableName(day.date);
  const now = feast
    ? REGIONS.filter((r) => BOE_2027_ROWS.some((row) => row.date === day.date && row.name === feast && row.marks[r]))
    : REGIONS.filter((r) => day.holders.some((h) => h.region === r && h.basis === "boe"));
  const date2026 = feast ? (BOE_2026_ROWS.find((r) => r.name === feast)?.date ?? null) : `2026-${day.date.slice(5)}`;
  if (!date2026) return null;
  const then = feast ? REGIONS.filter((r) => BOE_2026_ROWS.some((row) => row.date === date2026 && row.name === feast && row.marks[r])) : boeRegionsOn2026(date2026);
  if (then.length === 0 || now.length === 0) return null;
  const gained = now.filter((r) => !then.includes(r));
  const lost = then.filter((r) => !now.includes(r));
  if (gained.length === 0 && lost.length === 0) return null;
  return { date2026, regions2026: then, gained, lost };
}

