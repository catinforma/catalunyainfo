import { weekday } from "@/lib/programmatic/working-days/engine";

import { COUNCIL_2027 } from "./council-2027";
import { NEXT, NEXT_YEAR, SNAPSHOT, YEAR, byComarca, municipalityBySlug, nextYearPublished, unlistedTownBySlug } from "./data";
import type { NucleusDays, SnapshotMunicipality } from "./types";

/**
 * "Festius locals de Catalunya: les dades" — every figure of the data report
 * (/ca/festius/dades-festius-locals/, /es/festivos/datos-festivos-locales/,
 * /en/holidays/local-holidays-data/) and of its CSV (/data/…csv), computed
 * here from the site's verified datasets and nothing else:
 *
 *  - this year (2026): the DOGC order of local holidays as the snapshot holds
 *    it (Ordre EMT/208/2025, as amended by Ordre EMT/3/2026; every town the
 *    order gives days to, `SNAPSHOT.municipalities`), with Idescat's 2025
 *    population for each;
 *  - next year (2027): the DOGC order once `local-2027.json` is parsed; until
 *    then the days each council has approved (`council-2027.ts`, read on the
 *    council's own channel), so the 2027 figures say how many councils they
 *    cover and change on their own when the order is out.
 *
 * Counts are of a municipality's OWN local days (two per town, Estatut dels
 * Treballadors art. 37.2); a nucleus's days are counted apart (`nuclei`).
 * Pure and deterministic: the pages render it, the tests recompute it.
 */

export interface DateStat {
  date: string;
  /** Municipalities whose own local days include the date. */
  towns: number;
  /** Their population (Idescat, 1 January 2025). */
  population: number;
  /** The three largest of them, by population. */
  largest: { name: string; slug: string }[];
  /** 2027 only: the name most councils give the day, as they print it (Catalan), when any gives one. */
  name?: string | null;
  /** How many of the `towns` councils use that name. */
  nameCount?: number;
}

export interface ThisYearReport {
  year: number;
  /** Municipalities the order gives local days to (own or their nuclei's). */
  towns: number;
  population: number;
  /** Councils the order lists with "proposta no formulada": no local days. */
  excluded: number;
  excludedPopulation: number;
  /** Municipality-days: each town's own local days added up. */
  ownDays: number;
  /** Towns with no local day of their own, only their nuclei's. */
  nucleiOnly: number;
  /** Towns where at least one nucleus has days of its own. */
  withNuclei: number;
  /** Different dates used as a town's own local day. */
  distinctDates: number;
  top: DateStat[];
  topByPopulation: DateStat[];
  /** Own local days per month, January = 1. */
  byMonth: { month: number; days: number }[];
  /** Own local days per weekday, 0 Sunday … 6 Saturday. */
  byWeekday: { weekday: number; days: number }[];
  /** Own local days on a Monday or a Friday: a three-day weekend. */
  longWeekend: number;
  /** On a Tuesday or a Thursday: one working day from a four-day weekend. */
  bridge: number;
  /** On a Saturday or a Sunday. */
  weekend: number;
  /** Each comarca's most shared own local date. */
  comarques: { comarca: string; slug: string; towns: number; date: string | null; sharing: number }[];
  /** Municipalities whose territory has the most different local dates (own + nuclei). */
  mostDates: { name: string; slug: string; nuclei: number; dates: number }[];
}

export interface NextYearReport {
  year: number;
  /** "dogc" once the order is parsed; "council" before. */
  status: "dogc" | "council";
  /** Municipalities whose 2027 days the source gives. */
  towns: number;
  population: number;
  /** Share of Catalonia's population they cover, % (one decimal). */
  populationShare: number;
  /** The latest day a council's act was read (council status), or the order's read date. */
  readOn: string | null;
  top: DateStat[];
}

/** Catalonia's population: the towns the order lists plus the councils it lists without days. */
export function cataloniaPopulation(): number {
  return SNAPSHOT.municipalities.reduce((a, m) => a + m.population, 0) + SNAPSHOT.excluded.reduce((a, e) => a + e.population, 0);
}

/* -------------------------------------------------------------------------- */
/* Easter                                                                     */
/* -------------------------------------------------------------------------- */

/** Easter Sunday, Gregorian (the anonymous "Meeus/Jones/Butcher" computus). */
export function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Whit Monday (dilluns de Pasqua Granada, Segona Pasqua): Easter Sunday + 50 days. */
export function whitMonday(year: number): string {
  const easter = new Date(`${easterSunday(year)}T12:00:00Z`);
  easter.setUTCDate(easter.getUTCDate() + 50);
  return easter.toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Counting                                                                   */
/* -------------------------------------------------------------------------- */

interface Town {
  name: string;
  slug: string;
  population: number;
  local: readonly string[];
  names?: readonly (string | null)[];
}

function dateStats(towns: Town[], withNames: boolean): DateStat[] {
  const by = new Map<string, { towns: Town[]; names: Map<string, number> }>();
  for (const t of towns) {
    t.local.forEach((date, i) => {
      const e = by.get(date) ?? { towns: [], names: new Map<string, number>() };
      e.towns.push(t);
      const n = t.names?.[i]?.trim();
      if (n) e.names.set(n, (e.names.get(n) ?? 0) + 1);
      by.set(date, e);
    });
  }
  return [...by.entries()].map(([date, e]) => {
    const largest = [...e.towns].sort((a, b) => b.population - a.population || a.name.localeCompare(b.name, "ca")).slice(0, 3);
    const best = [...e.names.entries()].sort(([a, x], [b, y]) => y - x || a.localeCompare(b, "ca"))[0] ?? null;
    return {
      date,
      towns: e.towns.length,
      population: e.towns.reduce((a, t) => a + t.population, 0),
      largest: largest.map((t) => ({ name: t.name, slug: t.slug })),
      ...(withNames ? { name: best?.[0] ?? null, nameCount: best?.[1] ?? 0 } : {}),
    };
  });
}

const byTowns = (a: DateStat, b: DateStat) => b.towns - a.towns || b.population - a.population || a.date.localeCompare(b.date);
const byPopulation = (a: DateStat, b: DateStat) => b.population - a.population || b.towns - a.towns || a.date.localeCompare(b.date);

const townOf = (m: SnapshotMunicipality): Town => ({ name: m.name, slug: m.slug, population: m.population, local: m.local });

export function thisYearReport(top = 10): ThisYearReport {
  const ms = SNAPSHOT.municipalities;
  const stats = dateStats(ms.map(townOf), false);
  const own = ms.flatMap((m) => m.local);
  const byMonth = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, days: own.filter((d) => Number(d.slice(5, 7)) === i + 1).length }));
  const byWeekday = Array.from({ length: 7 }, (_, w) => ({ weekday: w, days: own.filter((d) => weekday(d) === w).length }));
  const wd = (set: number[]) => own.filter((d) => set.includes(weekday(d))).length;
  const comarques = byComarca().map((g) => {
    const count = new Map<string, number>();
    for (const m of g.municipalities) for (const d of new Set(m.local)) count.set(d, (count.get(d) ?? 0) + 1);
    const best = [...count.entries()].sort(([a, x], [b, y]) => y - x || a.localeCompare(b))[0] ?? null;
    return { comarca: g.comarca, slug: g.slug, towns: g.municipalities.length, date: best ? best[0] : null, sharing: best ? best[1] : 0 };
  });
  const territoryDates = (m: SnapshotMunicipality) => new Set([...m.local, ...m.nuclei.flatMap((n: NucleusDays) => n.dates)]).size;
  const mostDates = [...ms]
    .map((m) => ({ name: m.name, slug: m.slug, nuclei: m.nuclei.length, dates: territoryDates(m) }))
    .sort((a, b) => b.dates - a.dates || b.nuclei - a.nuclei || a.name.localeCompare(b.name, "ca"))
    .slice(0, 5);
  return {
    year: YEAR,
    towns: ms.length,
    population: ms.reduce((a, m) => a + m.population, 0),
    excluded: SNAPSHOT.excluded.length,
    excludedPopulation: SNAPSHOT.excluded.reduce((a, e) => a + e.population, 0),
    ownDays: own.length,
    nucleiOnly: ms.filter((m) => m.local.length === 0).length,
    withNuclei: ms.filter((m) => m.nuclei.length > 0).length,
    distinctDates: stats.length,
    top: [...stats].sort(byTowns).slice(0, top),
    topByPopulation: [...stats].sort(byPopulation).slice(0, 5),
    byMonth,
    byWeekday,
    longWeekend: wd([1, 5]),
    bridge: wd([2, 4]),
    weekend: wd([0, 6]),
    comarques,
    mostDates,
  };
}

/** Next year's own local days per town, from the order once parsed, else from the councils' approvals. */
export function nextYearTowns(): { status: "dogc" | "council"; towns: (Town & { council: (typeof COUNCIL_2027)[string] | null; nuclei: NucleusDays[] })[] } {
  if (nextYearPublished()) {
    const towns = Object.entries(NEXT_YEAR.municipalities).flatMap(([slug, days]) => {
      const m = municipalityBySlug(slug);
      const u = m ? null : unlistedTownBySlug(slug);
      const base = m ?? u;
      return base ? [{ name: base.name, slug, population: base.population, local: days.local, council: null, nuclei: days.nuclei }] : [];
    });
    return { status: "dogc", towns };
  }
  const towns = Object.entries(COUNCIL_2027).flatMap(([slug, c]) => {
    const m = municipalityBySlug(slug);
    const u = m ? null : unlistedTownBySlug(slug);
    const base = m ?? u;
    return base ? [{ name: base.name, slug, population: base.population, local: c.local, names: c.names, council: c, nuclei: c.nuclei ?? [] }] : [];
  });
  return { status: "council", towns };
}

export function nextYearReport(top = 10): NextYearReport {
  const { status, towns } = nextYearTowns();
  const stats = dateStats(towns, true);
  const population = towns.reduce((a, t) => a + t.population, 0);
  const readOn = status === "dogc" ? NEXT_YEAR.readOn : (towns.map((t) => t.council?.readOn ?? "").sort().at(-1) ?? null);
  return {
    year: NEXT,
    status,
    towns: towns.length,
    population,
    populationShare: Math.round((population / cataloniaPopulation()) * 1000) / 10,
    readOn: readOn || null,
    top: [...stats].sort(byTowns).slice(0, top),
  };
}

/* -------------------------------------------------------------------------- */
/* CSV                                                                        */
/* -------------------------------------------------------------------------- */

export const CSV_PATH = "/data/festius-locals-catalunya-2026-2027.csv";
export const CSV_FILENAME = "festius-locals-catalunya-2026-2027.csv";
export const CSV_COLUMNS = ["year", "ine", "municipality", "comarca", "population_2025", "place", "place_type", "date", "weekday", "status", "source", "source_url"] as const;

const WEEKDAYS_EN = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const shortOrder = (name: string) => name.split(",")[0] ?? name;

function cell(v: string | number): string {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * One row per municipality and local day (and per nucleus and day), 2026 from
 * the DOGC order, 2027 from the order or, before it, the council's approval.
 * UTF-8 with a byte-order mark, so spreadsheet programs read the accents.
 */
export function reportCsv(): string {
  const rows: (string | number)[][] = [];
  const order = SNAPSHOT.sources.localOrder;
  const meta = (slug: string) => {
    const m = municipalityBySlug(slug);
    if (m) return { ine: m.ine, name: m.name, comarca: m.comarca, population: m.population };
    const u = unlistedTownBySlug(slug);
    const e = u ? SNAPSHOT.excluded.find((x) => x.name === u.name) : null;
    return u && e ? { ine: e.ine, name: u.name, comarca: u.comarca, population: u.population } : null;
  };
  for (const m of [...SNAPSHOT.municipalities].sort((a, b) => a.ine.localeCompare(b.ine))) {
    const amendment = m.correction ? SNAPSHOT.sources.localAmendments.find((a) => a.name.startsWith(m.correction!.by)) : null;
    const source = amendment ? `${shortOrder(order.name)} (${order.ref}); ${shortOrder(amendment.name)} (${amendment.ref})` : `${shortOrder(order.name)} (${order.ref})`;
    const url = amendment ? amendment.url : order.url;
    const base = [YEAR, m.ine, m.name, m.comarca, m.population];
    for (const d of m.local) rows.push([...base, m.name, "municipality", d, WEEKDAYS_EN[weekday(d)]!, "dogc", source, url]);
    for (const n of m.nuclei) for (const d of n.dates) rows.push([...base, n.name, "nucleus", d, WEEKDAYS_EN[weekday(d)]!, "dogc", source, url]);
  }
  const next = nextYearTowns();
  const nextRows: (string | number)[][] = [];
  for (const t of next.towns) {
    const info = meta(t.slug);
    if (!info) continue;
    const src = next.status === "dogc" && NEXT_YEAR.order ? { name: `${shortOrder(NEXT_YEAR.order.name)} (${NEXT_YEAR.order.ref})`, url: NEXT_YEAR.order.url } : { name: `${t.council!.source.name} (${t.council!.source.ref})`, url: t.council!.source.url };
    const status = next.status === "dogc" ? "dogc" : "council-approved";
    const base = [NEXT, info.ine, info.name, info.comarca, info.population];
    for (const d of t.local) nextRows.push([...base, info.name, "municipality", d, WEEKDAYS_EN[weekday(d)]!, status, src.name, src.url]);
    for (const n of t.nuclei) for (const d of n.dates) nextRows.push([...base, n.name, "nucleus", d, WEEKDAYS_EN[weekday(d)]!, status, src.name, src.url]);
  }
  nextRows.sort((a, b) => String(a[1]).localeCompare(String(b[1])) || String(a[7]).localeCompare(String(b[7])));
  const lines = [CSV_COLUMNS.join(","), ...rows.map((r) => r.map(cell).join(",")), ...nextRows.map((r) => r.map(cell).join(","))];
  return `﻿${lines.join("\r\n")}\r\n`;
}

/** When the report's data last changed: the latest read date of its sources. */
export function reportAsOf(): string {
  return [SNAPSHOT.readOn, nextYearReport().readOn ?? ""].sort().at(-1)!;
}
