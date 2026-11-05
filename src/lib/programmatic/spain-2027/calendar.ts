import { distinctRuns, plansFor, type Plan } from "@/lib/content/holidays/bridges";
import { BOE_2027_ROWS, REGIONS, type BoeCode, type BoeRow, type Region } from "@/lib/programmatic/holidays/boe-2027";
import { addDays } from "@/lib/programmatic/holidays/format";

/**
 * The 2027 work calendar of every autonomous community and of Ceuta and
 * Melilla, computed from one text only: the BOE's table
 * (`BOE_2027_ROWS`, Resolución de 8 de octubre de 2026 de la Dirección
 * General de Trabajo, BOE-A-2026-21254), which the holiday engine already
 * holds row by row against `tests/fixtures/holidays/boe-a-2026-21254.txt`.
 *
 * Nothing here is typed by hand except the two substitution rows' original
 * date, which the BOE names in the row itself ("Lunes siguiente a asunción
 * de la Virgen", "Sustitución 15 de agosto"); a test fails if the table gains
 * a substitution row this file does not know. The long weekends are the
 * holiday engine's own (`bridges.ts`, Monday-to-Friday week, no local days).
 */

export const YEAR = 2027;

/** The BOE's three codes, in words. */
export type DayKind = "national" | "national-kept" | "regional";

export const KIND_OF: Record<BoeCode, DayKind> = { "*": "national", "**": "national-kept", "***": "regional" };

/**
 * Rows the BOE marks as moved: the date they stand in for, read from the row
 * name. 15 August 2027 is a Sunday; six communities take Monday the 16th,
 * Extremadura moves it to Monday 11 October.
 */
export const SUBSTITUTIONS: Record<string, { replaces: string }> = {
  "Lunes siguiente a asunción de la Virgen": { replaces: "2027-08-15" },
  "Sustitución 15 de agosto": { replaces: "2027-08-15" },
};

/** True for a row whose name says it stands in for another day. */
export function isSubstitutionName(name: string): boolean {
  return /lunes siguiente|sustituci/i.test(name);
}

export interface CommunityDay {
  date: string;
  /** The BOE's row name, without the full stop. */
  name: string;
  code: BoeCode;
  kind: DayKind;
  /** A holiday in all nineteen columns. */
  common: boolean;
  /** The other communities and cities where the date is also a holiday (any row). */
  alsoIn: Region[];
  /** Set for a substitution row: the date it stands in for. */
  replaces: string | null;
}

function datesOf(region: Region): string[] {
  return [...new Set(BOE_2027_ROWS.filter((r) => r.marks[region]).map((r) => r.date))].sort();
}

function regionsOn(iso: string): Region[] {
  const on = new Set(BOE_2027_ROWS.filter((r) => r.date === iso).flatMap((r) => Object.keys(r.marks) as Region[]));
  return REGIONS.filter((r) => on.has(r));
}

/** Dates that are a holiday in every column of the BOE table. */
export const COMMON_DATES: readonly string[] = [...new Set(BOE_2027_ROWS.map((r) => r.date))]
  .filter((iso) => regionsOn(iso).length === REGIONS.length)
  .sort();

/** The rows behind `COMMON_DATES`, one per date. */
export function commonRows(): BoeRow[] {
  return COMMON_DATES.map((iso) => BOE_2027_ROWS.find((r) => r.date === iso && Object.keys(r.marks).length === REGIONS.length)!);
}

/** A community's or city's 2027 days, from its BOE column, in date order. */
export function communityDays(region: Region): CommunityDay[] {
  return BOE_2027_ROWS.filter((r) => r.marks[region])
    .map((r) => {
      const code = r.marks[region]!;
      return {
        date: r.date,
        name: r.name,
        code,
        kind: KIND_OF[code],
        common: COMMON_DATES.includes(r.date),
        alsoIn: regionsOn(r.date).filter((x) => x !== region),
        replaces: SUBSTITUTIONS[r.name]?.replaces ?? null,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** How many days the BOE gives the community (one per date). */
export function dayCount(region: Region): number {
  return datesOf(region).length;
}

/** The community's days that are not holidays everywhere: what sets its calendar apart. */
export function ownDays(region: Region): CommunityDay[] {
  return communityDays(region).filter((d) => !d.common);
}

/**
 * National days (`**`) that other columns keep and this one does not: Holy
 * Thursday outside Catalonia and the Valencian Community, Saint Joseph,
 * Monday 16 August.
 */
export function nationalNotKept(region: Region): { row: BoeRow; keptBy: Region[] }[] {
  const mine = new Set(datesOf(region));
  return BOE_2027_ROWS.filter((r) => !r.marks[region] && !mine.has(r.date) && Object.values(r.marks).includes("**")).map((row) => ({
    row,
    keptBy: REGIONS.filter((x) => row.marks[x] === "**"),
  }));
}

/** 0 = Sunday. */
export function weekday(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

/** The community's days that fall on a Saturday or Sunday: no extra day off in a Monday-to-Friday week. */
export function weekendDays(region: Region): CommunityDay[] {
  return communityDays(region).filter((d) => weekday(d.date) === 0 || weekday(d.date) === 6);
}

/**
 * The long weekends and bridges the BOE days make, computed by the holiday
 * engine: a Monday or Friday holiday is a three-day weekend with no leave; a
 * Tuesday or Thursday one takes a day of leave; a Wednesday one two. Runs
 * shared by two holidays (Holy Thursday and Good Friday) are listed once.
 * Local days are not in it: every municipality adds its own two.
 */
export function communityRuns(region: Region, extra: readonly string[] = []): Plan[] {
  return distinctRuns(plansFor(datesOf(region), extra).map((p) => p.plan));
}

/**
 * The same, planned around the local days as well: for Ceuta and Melilla,
 * one municipality each, whose two local days apply to everyone there.
 */
export function communityRunsWithLocal(region: Region, local: readonly string[]): Plan[] {
  return distinctRuns(plansFor([...new Set([...datesOf(region), ...local])]).map((p) => p.plan));
}

export interface RunSummary {
  /** Runs with no leave at all. */
  free: number;
  /** Runs that need one day of leave. */
  oneDay: number;
  /** Runs that need two. */
  twoDays: number;
  total: number;
}

export function runSummary(runs: readonly Plan[]): RunSummary {
  return {
    free: runs.filter((r) => r.take.length === 0).length,
    oneDay: runs.filter((r) => r.take.length === 1).length,
    twoDays: runs.filter((r) => r.take.length === 2).length,
    total: runs.length,
  };
}

export interface SpainRun {
  from: string;
  to: string;
  days: number;
  take: string[];
  /** The holidays inside the run, as the BOE names them (one name per date). */
  holidays: { date: string; name: string }[];
  /** Where this exact run happens, in the BOE's column order. */
  regions: Region[];
}

/** Every run in any community, merged when the dates and the leave are the same, in date order. */
export function spainRuns(): SpainRun[] {
  const byKey = new Map<string, SpainRun>();
  for (const region of REGIONS) {
    const mine = communityDays(region);
    for (const run of communityRuns(region)) {
      const key = `${run.from}|${run.to}|${run.take.join(",")}`;
      const holidays = mine.filter((d) => d.date >= run.from && d.date <= run.to).map((d) => ({ date: d.date, name: d.name }));
      const found = byKey.get(key);
      if (found) {
        found.regions.push(region);
        // Same dates, another name: 1 March is the Día de Andalucía and the Día de les Illes Balears.
        for (const h of holidays) if (!found.holidays.some((x) => x.date === h.date && x.name === h.name)) found.holidays.push(h);
        found.holidays.sort((a, b) => a.date.localeCompare(b.date));
        continue;
      }
      byKey.set(key, { from: run.from, to: run.to, days: run.days, take: [...run.take], holidays, regions: [region] });
    }
  }
  return [...byKey.values()].sort((a, b) => a.from.localeCompare(b.from) || b.regions.length - a.regions.length || a.to.localeCompare(b.to));
}

/** Dates a holiday somewhere but not everywhere, with the rows and where, in date order. */
export function variableDates(): { date: string; rows: BoeRow[]; regions: Region[] }[] {
  return [...new Set(BOE_2027_ROWS.map((r) => r.date))]
    .filter((iso) => !COMMON_DATES.includes(iso))
    .sort()
    .map((date) => ({ date, rows: BOE_2027_ROWS.filter((r) => r.date === date), regions: regionsOn(date) }));
}

/**
 * Easter Sunday by the anonymous Gregorian algorithm (Meeus/Jones/Butcher),
 * independent of every table: the test holds the BOE's Holy Thursday, Good
 * Friday and Easter Monday rows to it.
 */
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

/** Holy Thursday, Good Friday and Easter Monday of `year`, from `easterSunday`. */
export function easterDays(year: number): { holyThursday: string; goodFriday: string; easterMonday: string } {
  const sunday = easterSunday(year);
  return { holyThursday: addDays(sunday, -3), goodFriday: addDays(sunday, -2), easterMonday: addDays(sunday, 1) };
}
