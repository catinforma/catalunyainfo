import { buildPoints, madridDay, monthKey, type MonthPoint } from "@/lib/programmatic/rent-update/ine";

/**
 * The INE series behind "IPC hoy" (lib/programmatic/ipc/), and the pure code
 * that turns the INE's JSON API (servicios.ine.es/wstempus) into months and
 * releases. Client-safe (no fetch here).
 *
 * Series (found and read 13 Nov 2026 with SERIES_TABLA/76125 and
 * SERIES_TABLA/76130; IPC base 2025, operation 25, release calendar 8):
 *  - IPC290750 "Nacional. Índice general. Variación anual." (table 76125),
 *    the rent and pension calculators' series;
 *  - IPC290752 "Nacional. Índice general. Variación mensual." (table 76125);
 *  - IPC292510 "Nacional. Subyacente: General sin alimentos no elaborados
 *    ni productos energéticos. Variación anual." (table 76130, "Índices
 *    nacionales de grupos especiales");
 *  - IPC292512, the same, "Variación mensual." (table 76130).
 * The four come out together on the INE's final CPI release (about the 13th
 * of the next month). The flash estimate ("Indicador adelantado", the end of
 * the month) is not in these tables: the page only states its date, and its
 * figure when someone types it in from the INE press release.
 */

export type IpcSeriesId = "general" | "generalMonthly" | "core" | "coreMonthly";
export const IPC_SERIES_IDS: readonly IpcSeriesId[] = ["general", "generalMonthly", "core", "coreMonthly"];

export interface IpcSeriesSpec {
  id: IpcSeriesId;
  code: string;
  table: number;
  /** The INE's own name. */
  name: string;
}

export const IPC_SERIES: Record<IpcSeriesId, IpcSeriesSpec> = {
  general: { id: "general", code: "IPC290750", table: 76125, name: "Nacional. Índice general. Variación anual." },
  generalMonthly: { id: "generalMonthly", code: "IPC290752", table: 76125, name: "Nacional. Índice general. Variación mensual." },
  core: { id: "core", code: "IPC292510", table: 76130, name: "Nacional. Subyacente: General sin alimentos no elaborados ni productos energéticos. Variación anual." },
  coreMonthly: { id: "coreMonthly", code: "IPC292512", table: 76130, name: "Nacional. Subyacente: General sin alimentos no elaborados ni productos energéticos. Variación mensual." },
};

/** The INE release calendar of the CPI (flash and final). */
export const IPC_PUBLICATION = 8;
/** First month kept (24 months shown, a margin for a late answer). The INE calendar lists January 2022 three times, the first one (31 Jan 2022) without "Avance": starting later keeps that out. */
export const IPC_FROM = "2023-01";
/** The months in the page's table. */
export const TABLE_MONTHS = 24;

const API = "https://servicios.ine.es/wstempus/js/ES";

export function ipcSeriesUrl(spec: IpcSeriesSpec, from: string = IPC_FROM): string {
  return `${API}/DATOS_SERIE/${spec.code}?date=${from.replace("-", "")}01:`;
}

/** Same URL as rent-update's calendarUrl(SERIES.ipc), so the fetch cache is shared. */
export function ipcCalendarUrl(): string {
  return `${API}/PUBLICACIONFECHA_PUBLICACION/${IPC_PUBLICATION}`;
}

export function ipcTableUrl(spec: IpcSeriesSpec): string {
  return `https://www.ine.es/jaxiT3/Tabla.htm?t=${spec.table}`;
}

export function ipcApiUrl(spec: IpcSeriesSpec): string {
  return `${API}/DATOS_SERIE/${spec.code}?nult=24`;
}

/** The INE's CPI pages for readers. */
export const INE_LINKS = {
  latest: "https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176802&menu=ultiDatos&idp=1254735976607",
  press: "https://www.ine.es/prensa/ipc_tabla.htm",
  calendar: "https://www.ine.es/daco/daco41/calen.htm",
  ics: "https://www.ine.es/dynt3/Calendario/calendario.ics",
} as const;

/* -------------------------------------------------------------------------- */
/* Release calendar                                                           */
/* -------------------------------------------------------------------------- */

export type ReleaseKind = "flash" | "final";

export interface Release {
  kind: ReleaseKind;
  /** The month the figure is about, "2026-11". */
  month: string;
  /** The Madrid day of the release, "2026-11-27" (09:00). */
  day: string;
}

interface IneCalendarEntry {
  Nombre?: unknown;
  Fecha?: unknown;
  FK_Periodo?: unknown;
  Anyo?: unknown;
}

/**
 * Every release of an INE calendar answer: "Avance" = the flash estimate,
 * anything else = the final figure. A month released twice (a later
 * re-release of an old month) keeps its first day. Sorted by day. Pure.
 */
export function parseReleases(json: unknown): Release[] {
  if (!Array.isArray(json)) return [];
  const seen = new Map<string, Release>();
  for (const raw of json as IneCalendarEntry[]) {
    const name = typeof raw.Nombre === "string" ? raw.Nombre : "";
    if (!/precios de consumo/i.test(name)) continue;
    const year = Number(raw.Anyo);
    const m = Number(raw.FK_Periodo);
    const ms = Number(raw.Fecha);
    if (!Number.isInteger(year) || !Number.isInteger(m) || m < 1 || m > 12 || !Number.isFinite(ms)) continue;
    const kind: ReleaseKind = /avance/i.test(name) ? "flash" : "final";
    const month = monthKey(year, m);
    const day = madridDay(new Date(ms));
    const key = `${kind}:${month}`;
    const known = seen.get(key);
    if (!known || day < known.day) seen.set(key, { kind, month, day });
  }
  return [...seen.values()].sort((a, b) => (a.day === b.day ? (a.kind < b.kind ? -1 : 1) : a.day < b.day ? -1 : 1));
}

/** The final release day of each month (what buildPoints needs). */
export function finalDays(releases: readonly Release[]): Map<string, string> {
  return new Map(releases.filter((r) => r.kind === "final").map((r) => [r.month, r.day]));
}

/* -------------------------------------------------------------------------- */
/* The page's data                                                            */
/* -------------------------------------------------------------------------- */

export interface IpcData {
  series: Record<IpcSeriesId, MonthPoint[]>;
  releases: Release[];
}

/**
 * The four series from their parsed values and one calendar: a value only
 * once its final release day has come, and never one the calendar does not
 * date at all. Pure.
 */
export function buildIpc(values: Record<IpcSeriesId, Map<string, number>>, releases: Release[], today: string): IpcData {
  const finals = finalDays(releases);
  const dated = (v: Map<string, number>) => new Map([...v].filter(([month]) => finals.has(month)));
  const series = Object.fromEntries(IPC_SERIES_IDS.map((id) => [id, buildPoints(dated(values[id]), finals, today, IPC_FROM)])) as Record<IpcSeriesId, MonthPoint[]>;
  return { series, releases: releases.filter((r) => r.month >= IPC_FROM) };
}

export function published(points: readonly MonthPoint[]): MonthPoint[] {
  return points.filter((p) => p.value !== null);
}

/** The newest month with a final value. */
export function latestMonth(points: readonly MonthPoint[]): MonthPoint | null {
  return published(points).at(-1) ?? null;
}

/** Live where it has a published value, the snapshot for the rest. Pure. */
export function mergePoints(snapshot: readonly MonthPoint[], live: readonly MonthPoint[] | null): MonthPoint[] {
  if (!live) return [...snapshot];
  const byMonth = new Map(snapshot.map((p) => [p.month, p]));
  for (const p of live) {
    const own = byMonth.get(p.month);
    if (!own || p.value !== null || own.value === null) byMonth.set(p.month, { ...p, published: p.published ?? own?.published ?? null });
  }
  return [...byMonth.values()].sort((a, b) => (a.month < b.month ? -1 : 1));
}

/** The union of two calendars; the live one wins on a clash. Pure. */
export function mergeReleases(snapshot: readonly Release[], live: readonly Release[] | null): Release[] {
  if (!live || live.length === 0) return [...snapshot];
  const byKey = new Map(snapshot.map((r) => [`${r.kind}:${r.month}`, r]));
  for (const r of live) byKey.set(`${r.kind}:${r.month}`, r);
  return [...byKey.values()].sort((a, b) => (a.day === b.day ? (a.kind < b.kind ? -1 : 1) : a.day < b.day ? -1 : 1));
}

export interface Latest {
  month: string;
  published: string | null;
  general: number;
  generalMonthly: number | null;
  core: number | null;
  coreMonthly: number | null;
}

const valueAt = (points: readonly MonthPoint[], month: string) => points.find((p) => p.month === month)?.value ?? null;

/** The newest month of the all-items annual rate, with the other three series for that same month (null if a series lags). */
export function latestFigures(data: IpcData): Latest | null {
  const last = latestMonth(data.series.general);
  if (!last || last.value === null) return null;
  return {
    month: last.month,
    published: last.published,
    general: last.value,
    generalMonthly: valueAt(data.series.generalMonthly, last.month),
    core: valueAt(data.series.core, last.month),
    coreMonthly: valueAt(data.series.coreMonthly, last.month),
  };
}

export interface TableRow {
  month: string;
  published: string | null;
  values: Record<IpcSeriesId, number | null>;
}

/** The last `n` months with a final all-items figure, newest first. Never a month the INE has not released. */
export function tableRows(data: IpcData, n: number = TABLE_MONTHS): TableRow[] {
  return published(data.series.general)
    .slice(-n)
    .reverse()
    .map((p) => ({ month: p.month, published: p.published, values: Object.fromEntries(IPC_SERIES_IDS.map((id) => [id, valueAt(data.series[id], p.month)])) as Record<IpcSeriesId, number | null> }));
}

export interface CalendarRow {
  month: string;
  flash: string | null;
  final: string | null;
}

/** Reference months whose releases fall in the given years, with their flash and final days (null where the INE has not scheduled it yet). */
export function calendarRows(releases: readonly Release[], years: readonly number[]): CalendarRow[] {
  const months = new Set(releases.filter((r) => years.includes(Number(r.day.slice(0, 4)))).map((r) => r.month));
  return [...months].sort().map((month) => ({
    month,
    flash: releases.find((r) => r.kind === "flash" && r.month === month)?.day ?? null,
    final: releases.find((r) => r.kind === "final" && r.month === month)?.day ?? null,
  }));
}

/** The next flash and final releases after the newest published month (on or after today). */
export function nextReleases(data: IpcData, today: string): { flash: Release | null; final: Release | null } {
  const last = latestMonth(data.series.general)?.month ?? "";
  const after = (kind: ReleaseKind) => data.releases.find((r) => r.kind === kind && r.month > last && r.day >= today) ?? null;
  return { flash: after("flash"), final: after("final") };
}

/** Has the INE scheduled any release in `year` yet? */
export function hasCalendarFor(releases: readonly Release[], year: number): boolean {
  return releases.some((r) => r.day.startsWith(`${year}-`));
}
