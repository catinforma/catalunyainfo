/**
 * The official reference rates of the Spanish mortgage market ("tipos de
 * interés oficiales de referencia del mercado hipotecario", Orden
 * EHA/2899/2011 art. 27), as the Banco de España gives them in table 19.1 of
 * its Boletín Estadístico (be1901.csv: one row per month, one column per
 * series, plus the day each group of rates came out in the BOE).
 *
 * Only MONTHLY official figures are used: the monthly averages the Banco de
 * España publishes in the BOE by law (art. 27.2). The daily Euribor is
 * EMMI's data, which its terms forbid redistributing commercially without a
 * licence (lib/programmatic/euribor/rules.ts), so no daily value is read or
 * shown anywhere.
 *
 * A value is shown only once its BOE day has come (the CSV can carry a month
 * before the BOE prints it); a month whose BOE day the CSV does not give is
 * not shown. Pure and client-safe: no fetch here (server.ts).
 */

export const BDE_CSV_URL = "https://www.bde.es/webbe/es/estadisticas/compartido/datos/csv/be1901.csv";
/** The Banco de España page that links the CSV and its PDF (table 19.1). */
export const BDE_TABLE_PAGE = "https://www.bde.es/webbe/es/estadisticas/temas/tipos-interes.html";
export const BDE_TABLE_PDF = "https://www.bde.es/webbe/es/estadisticas/compartido/datos/pdf/a1901.pdf";

/** Months kept in the snapshot and merged from the live CSV (24-month table + a year of margin). */
export const SERIES_FROM = "2024-01";
export const TABLE_MONTHS = 24;

export type RefId = "euribor" | "irph" | "irphEuro" | "irs5" | "estr12" | "debt26";
export const REF_IDS: readonly RefId[] = ["euribor", "irph", "irphEuro", "irs5", "estr12", "debt26"];

/** Which BOE resolution carries a series: the BdE publishes three groups of official rates each month. */
export type BoeGroup = "interbank" | "irph" | "debt";

export interface RefSpec {
  /** Banco de España series code (first header row of the CSV). */
  code: string;
  /** Alias in the Boletín Estadístico (third header row). */
  alias: string;
  /** The column with the day the BOE published this group. */
  boeCode: string;
  group: BoeGroup;
  /** The name the BOE resolution gives the rate (Spanish original). */
  boeName: string;
}

/**
 * Read from be1901.csv on 13 Nov 2026 (codes and aliases from its header
 * rows) and checked against the BOE resolutions of 2 Oct, 20 Oct and 4 Nov
 * 2026 (BOE-A-2026-20519, BOE-A-2026-21866, BOE-A-2026-23168,
 * BOE-A-2026-23167).
 */
export const REF_SERIES: Record<RefId, RefSpec> = {
  euribor: { code: "D_1NBAF472", alias: "BE_19_1.5", boeCode: "D_1TFECHABOE", group: "interbank", boeName: "Euríbor. Plazos: Un año" },
  irph: {
    code: "D_1T9H0000",
    alias: "BE_19_1.11",
    boeCode: "D_1TFECHABOE2",
    group: "irph",
    boeName: "Tipo medio de los préstamos hipotecarios a más de tres años, para adquisición de vivienda libre, concedidos por las entidades de crédito en España",
  },
  irphEuro: {
    code: "D_1T9H0010",
    alias: "BE_19_1.12",
    boeCode: "D_1TFECHABOE2",
    group: "irph",
    boeName: "Tipo medio de los préstamos a la vivienda entre uno y cinco años concedidos por las entidades de crédito en la zona euro (referido al mes anterior)",
  },
  irs5: { code: "D_1T9H0011", alias: "BE_19_1.13", boeCode: "D_1TFECHABOE", group: "interbank", boeName: "Permuta de intereses/Interest Rate Swap (IRS) al plazo de cinco años" },
  estr12: { code: "D_1NBAF572", alias: "BE_19_1.10", boeCode: "D_1TFECHABOE", group: "interbank", boeName: "Tipo de interés de referencia basado en el Euro short-term rate (€STR). Plazos: Un año" },
  debt26: {
    code: "D_1T9H0004",
    alias: "BE_19_1.14",
    boeCode: "D_1TFECHABOE4",
    group: "debt",
    boeName: "Tipo de rendimiento interno en el mercado secundario de la deuda pública de plazo entre dos y seis años",
  },
};

export interface RefPoint {
  /** "2026-10". */
  month: string;
  /** Percentage, as the BOE prints it (three decimals). */
  value: number;
  /** The BOE day that published it ("2026-11-04"). */
  boe: string;
}

export type RefSeries = Record<RefId, RefPoint[]>;

/** One BOE resolution of the Banco de España with its identifier, found by the snapshot script. */
export interface BoeResolution {
  /** The month of the figures it publishes. */
  month: string;
  group: BoeGroup;
  /** Publication day. */
  date: string;
  /** "BOE-A-2026-23168". */
  id: string;
}

const MONTHS_ES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const MONTHS_BOE = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/** Sane band for a Spanish mortgage reference rate in %: anything outside is a broken file, not a month. */
const SANE = { min: -2, max: 20 } as const;

/** One CSV line into cells ("a","b",1.5 → a, b, 1.5); the BdE quotes text cells and never embeds quotes. */
export function csvCells(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

/** "OCT 2026" → "2026-10"; anything else → null. */
export function parseRowMonth(label: string): string | null {
  const m = /^([A-Z]{3}) (\d{4})$/.exec(label.trim());
  if (!m) return null;
  const i = MONTHS_ES.indexOf(m[1]!);
  return i < 0 ? null : `${m[2]}-${String(i + 1).padStart(2, "0")}`;
}

/** "2026-Nov-04" → "2026-11-04"; "_" or anything malformed → null. */
export function parseBoeDay(cell: string): string | null {
  const m = /^(\d{4})-([A-Z][a-z]{2})-(\d{2})$/.exec(cell.trim());
  if (!m) return null;
  const i = MONTHS_BOE.indexOf(m[2]!);
  if (i < 0) return null;
  const iso = `${m[1]}-${String(i + 1).padStart(2, "0")}-${m[3]}`;
  return Number.isNaN(Date.parse(`${iso}T00:00:00Z`)) ? null : iso;
}

/** The first day of the month after `month`, as ISO. */
export function monthAfter(month: string): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
}

function parseValue(cell: string): number | null {
  const t = cell.trim();
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  return n >= SANE.min && n <= SANE.max ? Math.round(n * 1000) / 1000 : null;
}

export interface ParseResult {
  series: RefSeries;
  /** Series codes the file did not have (a renamed column). */
  missing: string[];
}

/**
 * The CSV text (already decoded from ISO-8859-1) into the six series, from
 * `from` on, each point with its BOE day. A point needs a sane value AND a
 * BOE day after the month it refers to; otherwise it is left out. Pure.
 */
export function parseBdeCsv(text: string, from: string = SERIES_FROM): ParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const empty = Object.fromEntries(REF_IDS.map((id) => [id, [] as RefPoint[]])) as RefSeries;
  const header = lines.find((l) => /^"?C.DIGO DE LA SERIE"?,/.test(l));
  if (!header) return { series: empty, missing: REF_IDS.map((id) => REF_SERIES[id].code) };
  const codes = csvCells(header);
  const col = (code: string) => codes.indexOf(code);
  const missing = [...new Set(REF_IDS.flatMap((id) => [REF_SERIES[id].code, REF_SERIES[id].boeCode]).filter((c) => col(c) < 0))];
  for (const line of lines) {
    const cells = csvCells(line);
    const month = parseRowMonth(cells[0] ?? "");
    if (!month || month < from) continue;
    for (const id of REF_IDS) {
      const spec = REF_SERIES[id];
      const vi = col(spec.code);
      const bi = col(spec.boeCode);
      if (vi < 0 || bi < 0) continue;
      const value = parseValue(cells[vi] ?? "");
      const boe = parseBoeDay(cells[bi] ?? "");
      if (value === null || boe === null || boe < monthAfter(month)) continue;
      empty[id].push({ month, value, boe });
    }
  }
  for (const id of REF_IDS) empty[id].sort((a, b) => a.month.localeCompare(b.month));
  return { series: empty, missing };
}

/** Only what the BOE had printed by `today` (Madrid day). */
export function publishedBy(series: RefSeries, today: string): RefSeries {
  return Object.fromEntries(REF_IDS.map((id) => [id, series[id].filter((p) => p.boe <= today)])) as RefSeries;
}

/**
 * The snapshot's points (each checked against its BOE text) plus the live
 * months after the snapshot's latest one; official rates are never revised,
 * so a live value for a month the snapshot has is ignored. Sorted by month.
 */
export function mergePoints(own: readonly RefPoint[], live: readonly RefPoint[] | null): RefPoint[] {
  const last = own.at(-1)?.month ?? "";
  return [...own, ...(live ?? []).filter((p) => p.month > last)].sort((a, b) => a.month.localeCompare(b.month));
}

/** mergePoints for every series; `added` names the series that gained a live month. */
export function mergeSeries(own: RefSeries, live: RefSeries | null): { series: RefSeries; added: RefId[] } {
  const added: RefId[] = [];
  const series = Object.fromEntries(
    REF_IDS.map((id) => {
      const merged = mergePoints(own[id], live ? live[id] : null);
      if (merged.length > own[id].length) added.push(id);
      return [id, merged];
    }),
  ) as RefSeries;
  return { series, added };
}

export function latestPoint(points: readonly RefPoint[]): RefPoint | null {
  return points.at(-1) ?? null;
}

/** The point of a given month, or null. */
export function pointOf(points: readonly RefPoint[], month: string): RefPoint | null {
  return points.find((p) => p.month === month) ?? null;
}

/** The same month a year earlier, for "a year ago" comparisons. */
export function yearBefore(month: string): string {
  const [y, m] = month.split("-");
  return `${Number(y) - 1}-${m}`;
}

export interface TableRow {
  month: string;
  values: Record<RefId, number | null>;
  /** The BOE day of the Euribor (interbank) resolution for that month. */
  boe: string | null;
}

/** The last `n` months that have a Euribor value, newest first, with the other rates of the same month. */
export function tableRows(series: RefSeries, n: number = TABLE_MONTHS): TableRow[] {
  const months = series.euribor.map((p) => p.month).slice(-n).reverse();
  return months.map((month) => ({
    month,
    values: Object.fromEntries(REF_IDS.map((id) => [id, pointOf(series[id], month)?.value ?? null])) as Record<RefId, number | null>,
    boe: pointOf(series.euribor, month)?.boe ?? null,
  }));
}

/** Change in percentage points, three decimals (the BOE's precision). */
export function change(a: number, b: number): number {
  return Math.round((a - b) * 1000) / 1000;
}

/**
 * The day of the month on which a group's BOE resolution came out over the
 * last `months` months: {min, max} (e.g. Euribor 2–5, IRPH 18–22). Used to
 * say when the next figure is due without inventing a date. Null without data.
 */
export function boeDayRange(points: readonly RefPoint[], months: number = 12): { min: number; max: number; last: string } | null {
  const recent = points.slice(-months);
  if (recent.length === 0) return null;
  const days = recent.map((p) => Number(p.boe.slice(8, 10)));
  return { min: Math.min(...days), max: Math.max(...days), last: recent.at(-1)!.boe };
}

/** The month whose figure comes next for a series: the one after its latest point. */
export function nextMonthOf(points: readonly RefPoint[]): string | null {
  const last = latestPoint(points);
  return last ? monthAfter(last.month).slice(0, 7) : null;
}

/** BOE text link of a resolution, or the BOE summary of that day when its identifier is not known. */
export function boeLink(date: string, resolutions: readonly BoeResolution[], group: BoeGroup): string {
  const hit = resolutions.find((r) => r.date === date && r.group === group);
  if (hit) return `https://www.boe.es/diario_boe/txt.php?id=${hit.id}`;
  const [y, m, d] = date.split("-");
  return `https://www.boe.es/boe/dias/${y}/${m}/${d}/`;
}

/** The resolution identifier for a day and group, or null. */
export function boeIdOf(date: string, resolutions: readonly BoeResolution[], group: BoeGroup): string | null {
  return resolutions.find((r) => r.date === date && r.group === group)?.id ?? null;
}
