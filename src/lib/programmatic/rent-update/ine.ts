/**
 * The three INE series the rent-update calculator reads, and the pure code
 * that turns the INE's JSON API (servicios.ine.es/wstempus) into one list of
 * months per series: value, and the day the INE published it.
 *
 * Series (read and checked 13 Nov 2026 in the INE's API):
 *  - IPC290750 "Nacional. Índice general. Variación anual." (IPC base 2025,
 *    table 76125, publication 8). From January 2026 the IPC is in base 2025;
 *    the old base-2021 series IPC251856 stops in December 2025 and gives the
 *    same annual rate for every month the two share (June 2022 to December
 *    2025, compared 13 Nov 2026), so one series covers the whole range.
 *  - IRAV1 "Total Nacional. Índice general. Variación anual." (Índice de
 *    Referencia de Arrendamientos de Vivienda, table 72975, publication 654),
 *    first month November 2024, published 2 January 2025.
 *  - IGC1 "Total Nacional. Índice general. Variación anual." (Índice de
 *    Garantía de Competitividad, table 10802, publication 417): only for the
 *    2022-2023 cap (RDL 6/2022, art. 46), read from the snapshot, never live.
 *
 * Publication days come from the INE's release calendar
 * (PUBLICACIONFECHA_PUBLICACION/{id}). The IPC's flash estimate ("Avance")
 * is left out: the law speaks of the last published index, and the INE
 * certificate a tenant can ask for (LAU art. 18.2) is the final figure.
 */

export type SeriesId = "ipc" | "irav" | "igc";

export interface SeriesSpec {
  id: SeriesId;
  /** The INE series code. */
  code: string;
  /** The INE table the series belongs to (for the human link). */
  table: number;
  /** The INE release calendar id. */
  publication: number;
  /** The INE's own name of the series. */
  name: string;
  /** First month kept. */
  from: string;
}

export const SERIES: Record<SeriesId, SeriesSpec> = {
  ipc: { id: "ipc", code: "IPC290750", table: 76125, publication: 8, name: "Nacional. Índice general. Variación anual.", from: "2022-06" },
  irav: { id: "irav", code: "IRAV1", table: 72975, publication: 654, name: "Total Nacional. Índice general. Variación anual.", from: "2024-11" },
  igc: { id: "igc", code: "IGC1", table: 10802, publication: 417, name: "Total Nacional. Índice general. Variación anual.", from: "2022-06" },
};

const API = "https://servicios.ine.es/wstempus/js/ES";

/** The series' values from `from` (YYYY-MM) on. */
export function seriesUrl(spec: SeriesSpec): string {
  return `${API}/DATOS_SERIE/${spec.code}?date=${spec.from.replace("-", "")}01:`;
}

/** The INE release calendar of the series' statistic (past and scheduled releases). */
export function calendarUrl(spec: SeriesSpec): string {
  return `${API}/PUBLICACIONFECHA_PUBLICACION/${spec.publication}`;
}

/** The INE's page of the table, for readers. */
export function tableUrl(spec: SeriesSpec): string {
  return `https://www.ine.es/jaxiT3/Tabla.htm?t=${spec.table}`;
}

/** The API answer for the series, for readers who want the raw figures. */
export function apiSeriesUrl(spec: SeriesSpec): string {
  return `${API}/DATOS_SERIE/${spec.code}?nult=12`;
}

/** One month of a series. `value` null = scheduled, not yet published. */
export interface MonthPoint {
  /** "2026-10". */
  month: string;
  /** The annual rate in %, as the INE prints it; null when not published yet. */
  value: number | null;
  /** The day the INE published (or will publish) the month, Madrid date "2026-11-13"; null when the calendar does not say. */
  published: string | null;
}

export interface SeriesData {
  id: SeriesId;
  points: MonthPoint[];
}

/* -------------------------------------------------------------------------- */
/* Parsing (pure)                                                             */
/* -------------------------------------------------------------------------- */

interface InePoint {
  Anyo?: unknown;
  FK_Periodo?: unknown;
  Valor?: unknown;
  Secreto?: unknown;
}

interface IneCalendarEntry {
  Nombre?: unknown;
  Fecha?: unknown;
  FK_Periodo?: unknown;
  Anyo?: unknown;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function monthKey(year: number, month: number): string {
  return `${year}-${pad(month)}`;
}

/** A date as the Madrid calendar day it falls on. */
export function madridDay(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(instant);
}

/** Annual rates outside this band are a broken answer, not a month of Spanish prices. */
const SANE = { min: -15, max: 30 } as const;

/** The values of an INE DATOS_SERIE answer by month; drops anything malformed. Pure. */
export function parseSeries(json: unknown): Map<string, number> {
  const out = new Map<string, number>();
  const data = (json as { Data?: unknown } | null)?.Data;
  if (!Array.isArray(data)) return out;
  for (const raw of data as InePoint[]) {
    const year = Number(raw.Anyo);
    const month = Number(raw.FK_Periodo);
    const value = raw.Valor;
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) continue;
    if (raw.Secreto === true || typeof value !== "number" || !Number.isFinite(value)) continue;
    if (value < SANE.min || value > SANE.max) continue;
    out.set(monthKey(year, month), value);
  }
  return out;
}

/**
 * The first final release day of each month in an INE release calendar.
 * "Avance" (flash) entries are skipped; a month listed twice (a later
 * re-release) keeps its first day. Pure.
 */
export function parseCalendar(json: unknown): Map<string, string> {
  const out = new Map<string, string>();
  if (!Array.isArray(json)) return out;
  for (const raw of json as IneCalendarEntry[]) {
    const name = typeof raw.Nombre === "string" ? raw.Nombre : "";
    if (/avance/i.test(name)) continue;
    const year = Number(raw.Anyo);
    const month = Number(raw.FK_Periodo);
    const ms = Number(raw.Fecha);
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isFinite(ms)) continue;
    const key = monthKey(year, month);
    const day = madridDay(new Date(ms));
    const known = out.get(key);
    if (!known || day < known) out.set(key, day);
  }
  return out;
}

/**
 * One list of months from `from` on: every month with a value, then the
 * scheduled ones (value null) the calendar announces. A value is only kept
 * when the calendar says the month was released on or before `today`: a
 * figure is never shown ahead of its release. Pure.
 */
export function buildSeries(id: SeriesId, values: Map<string, number>, calendar: Map<string, string>, today: string, from: string = SERIES[id].from): SeriesData {
  const months = new Set<string>();
  for (const m of values.keys()) if (m >= from) months.add(m);
  for (const [m, day] of calendar) if (m >= from && day > today) months.add(m);
  const points: MonthPoint[] = [...months].sort().map((month) => {
    const published = calendar.get(month) ?? null;
    const value = values.get(month);
    const released = value !== undefined && (published === null || published <= today);
    return { month, value: released ? value! : null, published };
  });
  return { id, points };
}

/** The published months, oldest first. */
export function publishedPoints(series: SeriesData): MonthPoint[] {
  return series.points.filter((p) => p.value !== null);
}

/** The newest published month. */
export function latestPoint(series: SeriesData): MonthPoint | null {
  const pub = publishedPoints(series);
  return pub.at(-1) ?? null;
}

/**
 * The index "que corresponda al último índice que estuviera publicado en la
 * fecha de actualización" (LAU art. 18.1): the newest month whose release
 * day is on or before `date`. A release on the anniversary itself counts
 * (the INE releases at 9:00; the calculator says so on that day).
 *
 * Returns the month even when its value is still null (the anniversary is in
 * the future and the release is scheduled before it), so the page can say
 * which month will apply and when the INE will publish it.
 */
export function monthInForce(series: SeriesData, date: string): MonthPoint | null {
  let best: MonthPoint | null = null;
  for (const p of series.points) {
    if (!p.published || p.published > date) continue;
    if (!best || p.month > best.month) best = p;
  }
  return best;
}

/**
 * The newer of two copies of a series, month by month: the live answer
 * wins where it has a published value, the snapshot fills what the live
 * answer lacks. Pure.
 */
export function mergeSeries(snapshot: SeriesData, live: SeriesData | null): SeriesData {
  if (!live) return snapshot;
  const byMonth = new Map(snapshot.points.map((p) => [p.month, p]));
  for (const p of live.points) {
    const own = byMonth.get(p.month);
    if (!own || p.value !== null || own.value === null) byMonth.set(p.month, { ...p, published: p.published ?? own?.published ?? null });
  }
  return { id: snapshot.id, points: [...byMonth.values()].sort((a, b) => (a.month < b.month ? -1 : 1)) };
}
