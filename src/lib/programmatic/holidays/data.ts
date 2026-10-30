import { ARAN_SUBSTITUTIONS, HOLIDAYS_BY_YEAR } from "@/lib/content/holidays/calendar";
import { ARAN_REPLACEMENT } from "@/lib/content/holidays/payload";

import { COUNCIL_2027, type CouncilApproved } from "./council-2027";
import nextYearJson from "./local-2027.json" with { type: "json" };
import { slugify } from "./slug";
import snapshotJson from "./snapshot.json" with { type: "json" };
import type { DayInfo } from "./status";
import type { HolidaySnapshot, NextYearLocal, NucleusDays, SnapshotMunicipality } from "./types";

/**
 * The holiday engine's data, read from the committed snapshot. Nothing here
 * touches the network or the database: a page renders from these two files
 * and the Catalonia-wide calendar already in `lib/content/holidays`.
 */

export const SNAPSHOT = snapshotJson as HolidaySnapshot;
export const NEXT_YEAR = nextYearJson as NextYearLocal;

export const YEAR = SNAPSHOT.year;
export const NEXT = YEAR + 1;

export type Lang = "ca" | "es" | "en";

const BY_SLUG = new Map(SNAPSHOT.municipalities.map((m) => [m.slug, m]));
const BY_INE = new Map(SNAPSHOT.municipalities.map((m) => [m.ine, m]));

export function municipalities(): SnapshotMunicipality[] {
  return SNAPSHOT.municipalities;
}

export function municipalityBySlug(slug: string): SnapshotMunicipality | null {
  return BY_SLUG.get(slug) ?? null;
}

const fold = (name: string) => name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * The municipality page for a place in the live local-holiday data
 * (`lib/content/holidays/local.ts`), so "today is a local holiday in…" can
 * send the reader to the town's own calendar. The open data's `codi_municipal`
 * is the five-digit INE code plus a three-digit nucleus code: a nucleus maps to
 * the municipality it belongs to, whose page lists the nucleus's days. A place
 * added from a DOGC correction carries `dogc:<name>` and is matched by name.
 * Null when the place has no page (since tranche 3 every municipality has
 * one, except the councils the order lists with "proposta no formulada").
 */
export function municipalityForCode(code: string): SnapshotMunicipality | null {
  if (/^\d{8}$/.test(code)) return BY_INE.get(code.slice(0, 5)) ?? null;
  if (code.startsWith("dogc:")) {
    const name = code.slice(5);
    return SNAPSHOT.municipalities.find((m) => fold(m.name) === name || fold(m.dogcName) === name) ?? null;
  }
  return null;
}

/** Whether next year's local order has been published (and parsed). */
export function nextYearPublished(): boolean {
  return NEXT_YEAR.order !== null;
}

export function nextYearFor(slug: string): { local: string[]; nuclei: NucleusDays[] } | null {
  return nextYearPublished() ? (NEXT_YEAR.municipalities[slug] ?? null) : null;
}

/**
 * Next year's days as the council itself approved them (`council-2027.ts`),
 * only while the DOGC order is not parsed: once it is (`published`), the
 * order wins for every town, whether it lists the town or not.
 */
export function councilApproved2027(slug: string, published = nextYearPublished()): CouncilApproved | null {
  return published ? null : (COUNCIL_2027[slug] ?? null);
}

/** The towns with a page whose council has approved next year's days, by population; none once the order is out. */
export function councilApprovedTowns(): SnapshotMunicipality[] {
  return SNAPSHOT.municipalities.filter((m) => councilApproved2027(m.slug)).sort((a, b) => a.rank - b.rank);
}

/* -------------------------------------------------------------------------- */
/* Catalonia-wide days                                                        */
/* -------------------------------------------------------------------------- */

export interface RegionalDay {
  date: string;
  name: Record<Lang, string>;
  /** Set on the day Aran has instead of a Catalonia-wide one. */
  aranOnly?: boolean;
}

/**
 * The Catalonia-wide days for a year (Ordre EMT/66/2025 for 2026, Ordre
 * EMT/52/2026 for 2027). In Aran one day is swapped for the Festa d'Aran: a
 * substitution, never an addition.
 */
const ARAN: Record<number, { replaces: string; date: string; name: Record<Lang, string> }> = {
  2026: {
    replaces: ARAN_SUBSTITUTIONS.find((s) => s.year === 2026)?.replaces ?? "2026-12-26",
    date: ARAN_SUBSTITUTIONS.find((s) => s.year === 2026)?.date ?? "2026-06-17",
    name: { ca: "Festa d'Aran", es: "Fiesta de Arán", en: "Festa d'Aran" },
  },
  // Ordre EMT/52/2026, art. 1.b: in Aran, 29 March (Easter Monday) becomes 17 June.
  2027: { replaces: "2027-03-29", date: ARAN_REPLACEMENT.date, name: { ca: "Festa d'Aran", es: "Fiesta de Arán", en: "Festa d'Aran" } },
};

export function regionalDays(year: number, aran = false): RegionalDay[] {
  const base = (HOLIDAYS_BY_YEAR[year] ?? []).map((h) => ({ date: h.date, name: { ...h.name } }));
  const swap = ARAN[year];
  if (!aran || !swap) return base;
  return [...base.filter((d) => d.date !== swap.replaces), { date: swap.date, name: swap.name, aranOnly: true }].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export function aranSwap(year: number): { replaces: string; date: string; name: Record<Lang, string> } | null {
  return ARAN[year] ?? null;
}

export function isAran(m: Pick<SnapshotMunicipality, "comarca">): boolean {
  return m.comarca === "Aran";
}

/** Last published day of the Catalonia-wide calendar. */
export function regionalThrough(): string {
  const years = Object.keys(HOLIDAYS_BY_YEAR).map(Number).sort();
  return `${years.at(-1)}-12-31`;
}

/* -------------------------------------------------------------------------- */
/* One municipality                                                           */
/* -------------------------------------------------------------------------- */

export const LOCAL_LABEL: Record<Lang, string> = { ca: "Festa local", es: "Fiesta local", en: "Local holiday" };

export interface HolidayRow {
  date: string;
  kind: "catalonia" | "local" | "aran";
  name: string;
  /** For a nuclei-only municipality: the nuclei that have the day off. */
  where?: string[];
  /** Approved by the council, not yet in the DOGC order (`council-2027.ts`). */
  pending?: true;
}

/** Local days of the municipality itself, or of its nuclei when it has none of its own. */
function localRows(local: string[], nuclei: NucleusDays[], lang: Lang): HolidayRow[] {
  if (local.length > 0) return local.map((date) => ({ date, kind: "local" as const, name: LOCAL_LABEL[lang] }));
  const dates = [...new Set(nuclei.flatMap((n) => n.dates))].sort();
  return dates.map((date) => ({
    date,
    kind: "local" as const,
    name: LOCAL_LABEL[lang],
    where: nuclei.filter((n) => n.dates.includes(date)).map((n) => n.name),
  }));
}

/**
 * The council's own days for next year, marked pending. Catalan prints the
 * name the council gives a day; Spanish and English keep the plain label
 * rather than translate a local name.
 */
function councilRows(c: CouncilApproved, lang: Lang): HolidayRow[] {
  return c.local.map((date, i) => {
    const own = lang === "ca" ? c.names?.[i] : null;
    return { date, kind: "local" as const, name: own ? own.charAt(0).toUpperCase() + own.slice(1) : LOCAL_LABEL[lang], pending: true as const };
  });
}

/**
 * Every holiday of a year in this municipality, Catalonia-wide and local, by
 * date. For next year, before the DOGC order, `council` adds the days the
 * council has approved, marked `pending` (the status box leaves them out).
 */
export function yearRows(m: SnapshotMunicipality, year: number, lang: Lang, { council = false }: { council?: boolean } = {}): HolidayRow[] {
  const regional = regionalDays(year, isAran(m)).map((d) => ({
    date: d.date,
    kind: d.aranOnly ? ("aran" as const) : ("catalonia" as const),
    name: d.name[lang],
  }));
  const next = year === NEXT ? nextYearFor(m.slug) : null;
  const approved = year === NEXT && council && !next ? councilApproved2027(m.slug) : null;
  const local =
    year === YEAR ? localRows(m.local, m.nuclei, lang) : next ? localRows(next.local, next.nuclei, lang) : approved ? councilRows(approved, lang) : [];
  return [...regional, ...local].sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind));
}

/** The compact list the browser uses to answer "today / tomorrow / next". */
export function statusDays(m: SnapshotMunicipality, lang: Lang): DayInfo[] {
  const years = [YEAR, NEXT];
  return years.flatMap((year) =>
    yearRows(m, year, lang).map((row) => ({
      d: row.date,
      k: row.kind,
      n: row.where ? `${row.name} (${row.where.join(", ")})` : row.name,
    })),
  );
}

export function localThrough(): string {
  return nextYearPublished() ? `${NEXT}-12-31` : `${YEAR}-12-31`;
}

/* -------------------------------------------------------------------------- */
/* Grouping                                                                   */
/* -------------------------------------------------------------------------- */

export type ExcludedMunicipality = HolidaySnapshot["excluded"][number];

export interface ComarcaGroup {
  comarca: string;
  /** URL segment of the comarca page: "alt-emporda". */
  slug: string;
  /** Its municipalities with a page, by population. */
  municipalities: SnapshotMunicipality[];
  /** Its councils with "proposta no formulada" in the order, by population. */
  excluded: ExcludedMunicipality[];
}

const GROUPS: ComarcaGroup[] = (() => {
  const groups = new Map<string, SnapshotMunicipality[]>();
  for (const m of SNAPSHOT.municipalities) groups.set(m.comarca, [...(groups.get(m.comarca) ?? []), m]);
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ca"))
    .map(([comarca, list]) => ({
      comarca,
      slug: slugify(comarca),
      municipalities: [...list].sort((a, b) => a.rank - b.rank),
      excluded: SNAPSHOT.excluded.filter((e) => e.comarca === comarca).sort((a, b) => b.population - a.population),
    }));
})();
const GROUP_BY_SLUG = new Map(GROUPS.map((g) => [g.slug, g]));

/** Comarques with at least one listed municipality, alphabetical; municipalities by population. */
export function byComarca(): ComarcaGroup[] {
  return GROUPS;
}

export function comarcaBySlug(slug: string): ComarcaGroup | null {
  return GROUP_BY_SLUG.get(slug) ?? null;
}

export function comarcaOf(m: Pick<SnapshotMunicipality, "comarca">): ComarcaGroup {
  return GROUPS.find((g) => g.comarca === m.comarca)!;
}

/**
 * Local dates most municipalities of a comarca share, with how many: "25 May,
 * 12 towns". A nucleus's day counts for its municipality once. Ties by date.
 */
export function sharedDates(group: ComarcaGroup, min = 2): { date: string; towns: SnapshotMunicipality[] }[] {
  const byDate = new Map<string, SnapshotMunicipality[]>();
  for (const m of group.municipalities) {
    for (const date of new Set([...m.local, ...m.nuclei.flatMap((n) => n.dates)])) byDate.set(date, [...(byDate.get(date) ?? []), m]);
  }
  return [...byDate.entries()]
    .filter(([, towns]) => towns.length >= min)
    .sort(([a, x], [b, y]) => y.length - x.length || a.localeCompare(b))
    .map(([date, towns]) => ({ date, towns }));
}

/** The comarca pages built at deploy: the four most populous comarques; the rest render on first request. */
export function prerenderComarques(count = 4): string[] {
  return [...GROUPS]
    .sort((a, b) => b.municipalities.reduce((n, m) => n + m.population, 0) - a.municipalities.reduce((n, m) => n + m.population, 0))
    .slice(0, count)
    .map((g) => g.slug);
}

const byPopulationDistance = (m: SnapshotMunicipality) => (a: SnapshotMunicipality, b: SnapshotMunicipality) =>
  Math.abs(a.rank - m.rank) - Math.abs(b.rank - m.rank) || a.rank - b.rank;

/**
 * Links to other municipalities: its comarca first, then the nearest in
 * population, so every page links to at least `min` siblings. Since tranche 3
 * a comarca can hold 68 towns (Alt Empordà): past `max`, a page links the
 * comarca's three largest towns and its neighbours in the comarca's
 * population order, and the comarca page lists them all with their days
 * (`comarcaTotal` says how many there are). Neighbours by position, not by
 * global rank: a town far smaller than the rest of its comarca is still
 * linked from the next one up.
 */
export function siblings(
  m: SnapshotMunicipality,
  min = 6,
  max = 12,
): { sameComarca: SnapshotMunicipality[]; others: SnapshotMunicipality[]; comarcaTotal: number } {
  const ordered = comarcaOf(m).municipalities;
  const position = new Map(ordered.map((o, i) => [o.slug, i]));
  const here = position.get(m.slug) ?? 0;
  const distance = (o: SnapshotMunicipality) => Math.abs((position.get(o.slug) ?? 0) - here);
  const all = ordered.filter((o) => o.slug !== m.slug);
  const largest = all.slice(0, 3);
  const nearest = all
    .filter((o) => !largest.includes(o))
    .sort((a, b) => distance(a) - distance(b) || a.rank - b.rank)
    .slice(0, Math.max(0, max - largest.length));
  const sameComarca = [...largest, ...nearest].sort((a, b) => a.rank - b.rank);
  const need = Math.max(0, min - sameComarca.length);
  const others = SNAPSHOT.municipalities
    .filter((o) => o.comarca !== m.comarca)
    .sort(byPopulationDistance(m))
    .slice(0, need)
    .sort((a, b) => a.rank - b.rank);
  return { sameComarca, others, comarcaTotal: all.length + 1 };
}

/** The `generateStaticParams` set: the biggest places only, to keep the build short. */
export function prerenderSlugs(count = 20): string[] {
  return [...SNAPSHOT.municipalities].sort((a, b) => a.rank - b.rank).slice(0, count).map((m) => m.slug);
}
