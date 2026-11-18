/**
 * The INE tables behind "Salario medio en España" (/es/calculadoras/salario-medio/)
 * and the pure code that turns the INE's JSON API (servicios.ine.es/wstempus,
 * DATOS_TABLA with tip=AM, so every series carries its MetaData) into the
 * page's snapshot. Used by scripts/average-salary-snapshot.ts and the tests;
 * nothing here fetches.
 *
 * Two INE operations, read 18 Nov 2026:
 *  - Encuesta Anual de Estructura Salarial (EAES, operation 30189, release
 *    calendar 163): gross earnings per worker in the calendar year, Régimen
 *    General (CNAE-09 sections B to S) and maritime transport. 2024 data,
 *    released 28 May 2026 ("Definitivos 2024").
 *  - EPA, Decil de salarios del empleo principal (release calendar 348):
 *    the monthly gross wage of every employee's main job (yearly total / 12,
 *    extras prorated; part-time not converted). 2024 data, released 14 Nov
 *    2025; 2025 data scheduled for 25 Nov 2026.
 *
 * INE marks a figure resting on 100 to 500 sample observations with a minus
 * sign ("Un signo '-' antes del dato, indica que el número de observaciones
 * muestrales está comprendido entre 100 y 500, por lo que la cifra está
 * sujeta a gran variabilidad") and gives no figure under 100 observations.
 * A cell keeps the absolute value with `low: true`, or is null.
 */

export const INE_API = "https://servicios.ine.es/wstempus/js";

export type Op = "eaes" | "epa";

/** The INE release calendars (PUBLICACIONFECHA_PUBLICACION/<id>). */
export const PUBLICATION: Record<Op, number> = { eaes: 163, epa: 348 };

export type TableKey = "dist" | "ageRegion" | "sectorRegion" | "occupationRegion" | "ageNational" | "sections" | "occupations" | "workday" | "deciles" | "decileWorkday";

export interface TableSpec {
  id: number;
  op: Op;
  /** INE's own title of the table, in Spanish (as INEbase lists it). */
  name: string;
  /** Decimals INE prints. */
  decimals: 1 | 2;
}

export const TABLES: Record<TableKey, TableSpec> = {
  dist: { id: 28191, op: "eaes", name: "Medias y percentiles por sexo y CCAA", decimals: 2 },
  ageRegion: { id: 28201, op: "eaes", name: "Sexo y edad (por comunidad autónoma)", decimals: 2 },
  sectorRegion: { id: 28192, op: "eaes", name: "Sexo y sectores de actividad (por comunidad autónoma)", decimals: 2 },
  occupationRegion: { id: 28193, op: "eaes", name: "Sexo y ocupación (por comunidad autónoma)", decimals: 2 },
  ageNational: { id: 28189, op: "eaes", name: "Sexo y edad", decimals: 2 },
  sections: { id: 28185, op: "eaes", name: "Sexo y secciones de actividad", decimals: 2 },
  occupations: { id: 28186, op: "eaes", name: "Sexo y grupos principales de ocupación", decimals: 2 },
  workday: { id: 28187, op: "eaes", name: "Sexo y tipo de jornada", decimals: 2 },
  deciles: { id: 66252, op: "epa", name: "Salarios medios y límite inferior de cada decil", decimals: 1 },
  decileWorkday: { id: 66237, op: "epa", name: "Salarios medios por tipo de jornada y decil", decimals: 1 },
};

export const TABLE_KEYS = Object.keys(TABLES) as TableKey[];

export function tableApiUrl(key: TableKey, lang: "ES" | "EN" = "ES", last = 2): string {
  return `${INE_API}/${lang}/DATOS_TABLA/${TABLES[key].id}?nult=${last}&tip=AM`;
}

export function calendarApiUrl(op: Op): string {
  return `${INE_API}/ES/PUBLICACIONFECHA_PUBLICACION/${PUBLICATION[op]}`;
}

/** The INE's page of a table, for readers. */
export function tablePageUrl(key: TableKey): string {
  return `https://www.ine.es/jaxiT3/Tabla.htm?t=${TABLES[key].id}`;
}

/** The INE's pages for readers. */
export const INE_PAGES = {
  eaes: "https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177025&menu=ultiDatos&idp=1254735976596",
  epa: "https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176918&menu=resultados&idp=1254735976595",
  epaMethod: "https://www.ine.es/metodologia/t22/nota_epa_decil.pdf",
  calendar: "https://www.ine.es/daco/daco41/calen.htm",
  licence: "https://www.ine.es/dyngs/AYU/index.htm?cid=125",
} as const;

/** The press releases, by year (checked by the snapshot script before it keeps one). */
export function pressUrl(op: Op, year: number): string {
  return op === "eaes" ? `https://www.ine.es/dyngs/Prensa/es/EAES${year}.htm` : `https://www.ine.es/dyngs/Prensa/dsEPA${year}.htm`;
}

/** Licence of INE statistics (aviso legal, "Reutilización…"): CC BY 4.0, citing the source and its last update. */
export const INE_LICENCE = "https://creativecommons.org/licenses/by/4.0/";

/* -------------------------------------------------------------------------- */
/* Dimensions                                                                 */
/* -------------------------------------------------------------------------- */

/** "es" is the national total; the 17 communities by INE code (Ceuta and Melilla are not in these tables). */
export const REGION_CODES = {
  es: "00",
  andalucia: "01",
  aragon: "02",
  asturias: "03",
  baleares: "04",
  canarias: "05",
  cantabria: "06",
  "castilla-y-leon": "07",
  "castilla-la-mancha": "08",
  cataluna: "09",
  valencia: "10",
  extremadura: "11",
  galicia: "12",
  madrid: "13",
  murcia: "14",
  navarra: "15",
  "pais-vasco": "16",
  "la-rioja": "17",
} as const;
export type RegionId = keyof typeof REGION_CODES;
export const REGION_IDS = Object.keys(REGION_CODES) as RegionId[];
const REGION_BY_CODE = new Map<string, RegionId>(REGION_IDS.map((id) => [REGION_CODES[id], id]));

export const SEXES = ["both", "women", "men"] as const;
export type Sex = (typeof SEXES)[number];

export const DIST_KEYS = ["mean", "p10", "q1", "median", "q3", "p90"] as const;
export type DistKey = (typeof DIST_KEYS)[number];

/** Table 28201 (by community). */
export const AGE_BANDS = ["all", "u25", "25-34", "35-44", "45-54", "55+"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

/** Table 28189 (Spain). */
export const AGE_BANDS_5 = ["all", "u20", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65+"] as const;
export type AgeBand5 = (typeof AGE_BANDS_5)[number];

export const SECTORS = ["all", "industry", "construction", "services"] as const;
export type Sector = (typeof SECTORS)[number];

/** INE's grouping in table 28193: high = CNO-11 major groups 1-3, medium = 4-7 and 0, low = 8-9. */
export const OCCUPATION_LEVELS = ["all", "high", "medium", "low"] as const;
export type OccupationLevel = (typeof OCCUPATION_LEVELS)[number];

export const WORKDAYS = ["all", "full", "part"] as const;
export type Workday = (typeof WORKDAYS)[number];

/* -------------------------------------------------------------------------- */
/* Snapshot shape                                                             */
/* -------------------------------------------------------------------------- */

/** One INE figure: the value, flagged when it rests on 100-500 observations; null when INE gives none. */
export type Cell = { v: number; low?: true } | null;

export type ByRegionSex<K extends string> = Record<RegionId, Record<Sex, Record<K, Cell>>>;

export interface Labelled {
  /** INE's code: the CNAE-09 section letter or the CNO-11 group letter of the table. */
  code: string;
  /** INE's Spanish and English names. */
  es: string;
  en: string;
  values: Record<Sex, Cell>;
}

export interface Release {
  year: number;
  /** Madrid day. */
  day: string;
}

export interface EaesData {
  year: number;
  /** The day INE released this year's (final) figures. */
  released: string;
  /** The next year's release in the INE calendar; null when the calendar does not list it yet. */
  next: Release | null;
  press: string | null;
  /** From the press release ("El salario modal … se situó en …"): not in the API tables. */
  modal: { value: number; share: number } | null;
  previous: { year: number; mean: number; median: number; women: number; men: number };
  dist: ByRegionSex<DistKey>;
  ageRegion: ByRegionSex<AgeBand>;
  sectorRegion: ByRegionSex<Sector>;
  occupationRegion: ByRegionSex<OccupationLevel>;
  ageNational: Record<Sex, Record<AgeBand5, Cell>>;
  sections: Labelled[];
  occupations: Labelled[];
  workday: Record<Sex, Record<Workday, Cell>>;
}

export interface Decile {
  decile: number;
  /** Lower limit (INE gives none for the first decile). */
  lower: number | null;
  mean: number;
}

export interface EpaData {
  year: number;
  released: string;
  next: Release | null;
  press: string | null;
  deciles: Decile[];
  means: Record<Workday, number>;
}

export interface SalarySnapshot {
  /** When the script read the INE (ISO instant). */
  fetchedAt: string;
  /** The Madrid day of `fetchedAt`. */
  asOf: string;
  eaes: EaesData;
  epa: EpaData;
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

interface IneMeta {
  T3_Variable?: unknown;
  Nombre?: unknown;
  Codigo?: unknown;
}
interface IneSeries {
  COD?: unknown;
  Nombre?: unknown;
  MetaData?: IneMeta[];
  Data?: { Anyo?: unknown; Valor?: unknown }[];
}

/** One series: its dimensions (variable → name and code) and its values by year. */
export interface ParsedSeries {
  cod: string;
  dims: Map<string, { name: string; code: string }>;
  values: Map<number, number | null>;
}

export function parseTable(json: unknown): ParsedSeries[] {
  if (!Array.isArray(json)) throw new Error("INE table: not an array");
  return (json as IneSeries[]).map((s) => {
    const cod = String(s.COD ?? "");
    const dims = new Map<string, { name: string; code: string }>();
    for (const m of s.MetaData ?? []) dims.set(String(m.T3_Variable ?? "").trim(), { name: String(m.Nombre ?? "").trim(), code: String(m.Codigo ?? "").trim() });
    if (dims.size === 0) throw new Error(`INE series ${cod}: no MetaData (ask with tip=AM)`);
    const values = new Map<number, number | null>();
    for (const d of s.Data ?? []) {
      const year = Number(d.Anyo);
      if (!Number.isInteger(year)) continue;
      values.set(year, typeof d.Valor === "number" && Number.isFinite(d.Valor) ? d.Valor : null);
    }
    return { cod, dims, values };
  });
}

/** The newest year with at least one value. */
export function latestYear(series: readonly ParsedSeries[]): number {
  let best = 0;
  for (const s of series) for (const [y, v] of s.values) if (v !== null && y > best) best = y;
  return best;
}

/** INE's sign convention → a cell. */
export function toCell(v: number | null | undefined): Cell {
  if (v === null || v === undefined) return null;
  return v < 0 ? { v: Math.abs(v), low: true } : { v };
}

function dim(s: ParsedSeries, ...names: string[]): { name: string; code: string } | undefined {
  for (const n of names) {
    const d = s.dims.get(n);
    if (d) return d;
  }
  return undefined;
}

export function regionOf(s: ParsedSeries): RegionId {
  const ccaa = dim(s, "Comunidades y Ciudades Autónomas");
  if (ccaa) {
    const id = REGION_BY_CODE.get(ccaa.code);
    if (!id || id === "es") throw new Error(`INE series ${s.cod}: unknown community ${ccaa.name} (${ccaa.code})`);
    return id;
  }
  if (dim(s, "Total Nacional")) return "es";
  throw new Error(`INE series ${s.cod}: no territory`);
}

export function sexOf(s: ParsedSeries): Sex {
  const d = dim(s, "Sexo");
  const sex = ({ "Ambos sexos": "both", Mujeres: "women", Hombres: "men" } as Record<string, Sex>)[d?.name ?? ""];
  if (!sex) throw new Error(`INE series ${s.cod}: unknown sex ${d?.name}`);
  return sex;
}

function distKeyOf(s: ParsedSeries): DistKey {
  const m = dim(s, "Medidas estadísticas");
  if (m?.name === "Media") return "mean";
  const p = dim(s, "Percentiles simples");
  const k = ({ "Percentil 10": "p10", "Cuartil inferior": "q1", Mediana: "median", "Cuartil superior": "q3", "Percentil 90": "p90" } as Record<string, DistKey>)[p?.name ?? ""];
  if (!k) throw new Error(`INE series ${s.cod}: unknown measure ${m?.name ?? p?.name}`);
  return k;
}

function ageOf(s: ParsedSeries): AgeBand {
  if (dim(s, "Totales de edad")) return "all";
  const d = dim(s, "Semiintervalos de edad", "Grupos de edad");
  const k = ({ "Y-LT25": "u25", Y25T34: "25-34", Y35T44: "35-44", Y45T54: "45-54", "Y-GE55": "55+" } as Record<string, AgeBand>)[d?.code ?? ""];
  if (!k) throw new Error(`INE series ${s.cod}: unknown age band ${d?.name}`);
  return k;
}

function age5Of(s: ParsedSeries): AgeBand5 {
  if (dim(s, "Totales de edad")) return "all";
  const d = dim(s, "Semiintervalos de edad", "Grupos de edad");
  if (d?.name === "Menos de 20 años") return "u20";
  const k = (
    { Y20T24: "20-24", Y25T29: "25-29", Y30T34: "30-34", Y35T39: "35-39", Y40T44: "40-44", Y45T49: "45-49", Y50T54: "50-54", Y55T59: "55-59", Y60T64: "60-64", "Y-GE65": "65+" } as Record<string, AgeBand5>
  )[d?.code ?? ""];
  if (!k) throw new Error(`INE series ${s.cod}: unknown age band ${d?.name}`);
  return k;
}

function sectorOf(s: ParsedSeries): Sector {
  const d = dim(s, "SECTORES");
  if (!d) {
    if (dim(s, "AGRUPACIONES CNAE")?.code === "B_S") return "all";
    throw new Error(`INE series ${s.cod}: no sector`);
  }
  const k = ({ Industria: "industry", Construcción: "construction", Servicios: "services" } as Record<string, Sector>)[d.name];
  if (!k) throw new Error(`INE series ${s.cod}: unknown sector ${d.name}`);
  return k;
}

function occupationLevelOf(s: ParsedSeries): OccupationLevel {
  const d = dim(s, "AGRUPACIONES OCUPACIONES");
  if (!d) {
    if (dim(s, "TOTALES OCUPACIONES")) return "all";
    throw new Error(`INE series ${s.cod}: no occupation`);
  }
  const k = ({ Alta: "high", Media: "medium", Baja: "low" } as Record<string, OccupationLevel>)[d.name];
  if (!k) throw new Error(`INE series ${s.cod}: unknown occupation level ${d.name}`);
  return k;
}

function workdayOf(s: ParsedSeries): Workday {
  const d = dim(s, "Tipo de jornada");
  const k = ({ Total: "all", "Jornada a tiempo completo": "full", "Jornada a tiempo parcial": "part" } as Record<string, Workday>)[d?.name ?? ""];
  if (!k) throw new Error(`INE series ${s.cod}: unknown workday ${d?.name}`);
  return k;
}

function emptyBySex<K extends string>(keys: readonly K[]): Record<Sex, Record<K, Cell | undefined>> {
  return Object.fromEntries(SEXES.map((x) => [x, Object.fromEntries(keys.map((k) => [k, undefined]))])) as Record<Sex, Record<K, Cell | undefined>>;
}

function complete<K extends string>(table: string, grid: Record<Sex, Record<K, Cell | undefined>>, where: string): Record<Sex, Record<K, Cell>> {
  for (const sex of SEXES) for (const [k, v] of Object.entries(grid[sex])) if (v === undefined) throw new Error(`INE ${table}: no series for ${where} ${sex} ${k}`);
  return grid as Record<Sex, Record<K, Cell>>;
}

/** A community × sex × key table (28191, 28201, 28192, 28193) for one year. */
export function byRegionSex<K extends string>(table: string, series: readonly ParsedSeries[], year: number, keys: readonly K[], keyOf: (s: ParsedSeries) => K): ByRegionSex<K> {
  const grid = Object.fromEntries(REGION_IDS.map((r) => [r, emptyBySex(keys)])) as Record<RegionId, Record<Sex, Record<K, Cell | undefined>>>;
  for (const s of series) {
    const k = keyOf(s);
    if (!keys.includes(k)) throw new Error(`INE ${table} ${s.cod}: key ${k} not expected`);
    grid[regionOf(s)][sexOf(s)][k] = toCell(s.values.get(year));
  }
  return Object.fromEntries(REGION_IDS.map((r) => [r, complete(table, grid[r], r)])) as ByRegionSex<K>;
}

export const parseDist = (series: readonly ParsedSeries[], year: number) => byRegionSex("28191", series, year, DIST_KEYS, distKeyOf);
export const parseAgeRegion = (series: readonly ParsedSeries[], year: number) => byRegionSex("28201", series, year, AGE_BANDS, ageOf);
export const parseSectorRegion = (series: readonly ParsedSeries[], year: number) => byRegionSex("28192", series, year, SECTORS, sectorOf);
export const parseOccupationRegion = (series: readonly ParsedSeries[], year: number) => byRegionSex("28193", series, year, OCCUPATION_LEVELS, occupationLevelOf);

export function parseAgeNational(series: readonly ParsedSeries[], year: number): Record<Sex, Record<AgeBand5, Cell>> {
  const grid = emptyBySex(AGE_BANDS_5);
  for (const s of series) grid[sexOf(s)][age5Of(s)] = toCell(s.values.get(year));
  return complete("28189", grid, "es");
}

export function parseWorkday(series: readonly ParsedSeries[], year: number): Record<Sex, Record<Workday, Cell>> {
  const grid = emptyBySex(WORKDAYS);
  for (const s of series) grid[sexOf(s)][workdayOf(s)] = toCell(s.values.get(year));
  return complete("28187", grid, "es");
}

/**
 * Sections (28185, variable "SECCIONES") or occupation groups (28186,
 * "OCUPACIONES"), in INE's order, with the English names from the same
 * table in INE's English API (matched by series code). The table's total
 * row is left out: it is the national mean of 28191.
 */
export function parseLabelled(table: string, variable: "SECCIONES" | "OCUPACIONES", es: readonly ParsedSeries[], en: readonly ParsedSeries[], year: number): Labelled[] {
  const out = new Map<string, Labelled>();
  for (const s of es) {
    const d = dim(s, variable);
    if (!d) continue;
    if (!/^[A-Z]$/.test(d.code)) throw new Error(`INE ${table} ${s.cod}: unexpected code ${d.code}`);
    // The English API names its variables differently: the category is the dimension with the same one-letter code.
    const twin = en.find((x) => x.cod === s.cod);
    const enLabel = twin ? [...twin.dims.values()].find((x) => x.code === d.code)?.name : undefined;
    if (!enLabel) throw new Error(`INE ${table} ${s.cod}: no English name for ${d.name}`);
    const row = out.get(d.code) ?? { code: d.code, es: d.name, en: enLabel, values: { both: null, women: null, men: null } };
    row.values[sexOf(s)] = toCell(s.values.get(year));
    out.set(d.code, row);
  }
  return [...out.values()].sort((a, b) => (a.code < b.code ? -1 : 1));
}

export function parseDeciles(series: readonly ParsedSeries[], year: number): Decile[] {
  const rows = new Map<number, { lower?: number | null; mean?: number | null }>();
  for (const s of series) {
    const n = Number(dim(s, "Decil de salarios")?.name);
    const m = dim(s, "Medidas estadísticas")?.name;
    if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error(`INE 66252 ${s.cod}: unknown decile`);
    const row = rows.get(n) ?? {};
    if (m === "Límite inferior") row.lower = s.values.get(year) ?? null;
    else if (m === "Media") row.mean = s.values.get(year) ?? null;
    else throw new Error(`INE 66252 ${s.cod}: unknown measure ${m}`);
    rows.set(n, row);
  }
  const out: Decile[] = [];
  for (let n = 1; n <= 10; n++) {
    const r = rows.get(n);
    if (!r || typeof r.mean !== "number") throw new Error(`INE 66252: decile ${n} without a mean`);
    if (n > 1 && typeof r.lower !== "number") throw new Error(`INE 66252: decile ${n} without a lower limit`);
    out.push({ decile: n, lower: n === 1 ? null : (r.lower as number), mean: r.mean });
  }
  for (let n = 2; n < 10; n++) if ((out[n]!.lower as number) <= (out[n - 1]!.lower ?? 0)) throw new Error("INE 66252: lower limits not increasing");
  return out;
}

export function parseDecileWorkday(series: readonly ParsedSeries[], year: number): Record<Workday, number> {
  const out: Partial<Record<Workday, number>> = {};
  for (const s of series) {
    if (dim(s, "Decil de salarios")?.name !== "Total") continue;
    const v = s.values.get(year);
    if (typeof v !== "number") throw new Error(`INE 66237 ${s.cod}: no value for ${year}`);
    out[workdayOf(s)] = v;
  }
  for (const w of WORKDAYS) if (out[w] === undefined) throw new Error(`INE 66237: no total for ${w}`);
  return out as Record<Workday, number>;
}

/* -------------------------------------------------------------------------- */
/* Release calendar                                                           */
/* -------------------------------------------------------------------------- */

interface IneCalendarEntry {
  Nombre?: unknown;
  Anyo?: unknown;
  Fecha?: unknown;
}

export interface CalendarEntry {
  name: string;
  year: number;
  day: string;
}

export function parseCalendar(json: unknown, madridDay: (d: Date) => string): CalendarEntry[] {
  if (!Array.isArray(json)) return [];
  const out: CalendarEntry[] = [];
  for (const e of json as IneCalendarEntry[]) {
    const year = Number(e.Anyo);
    const ms = Number(e.Fecha);
    if (!Number.isInteger(year) || !Number.isFinite(ms)) continue;
    out.push({ name: String(e.Nombre ?? ""), year, day: madridDay(new Date(ms)) });
  }
  return out.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
}

/**
 * The newest year already released on `today`, the day it came out (its
 * first "Definitivos" release when there is one, else its first release)
 * and the next year's scheduled release, if the calendar lists it.
 */
export function releaseStatus(entries: readonly CalendarEntry[], today: string): { year: number; released: string; next: Release | null } {
  const past = entries.filter((e) => e.day <= today);
  if (past.length === 0) throw new Error("INE calendar: no past release");
  const year = Math.max(...past.map((e) => e.year));
  const ofYear = past.filter((e) => e.year === year);
  const final = ofYear.find((e) => /definitiv/i.test(e.name)) ?? ofYear[0]!;
  const upcoming = entries.filter((e) => e.year > year).sort((a, b) => (a.day < b.day ? -1 : 1))[0];
  return { year, released: final.day, next: upcoming ? { year: upcoming.year, day: upcoming.day } : null };
}

/* -------------------------------------------------------------------------- */
/* Press release                                                              */
/* -------------------------------------------------------------------------- */

/** "1.234,56" → 1234.56. */
function spanishNumber(s: string): number {
  return Number(s.replace(/\./g, "").replace(",", "."));
}

/**
 * The modal wage from the EAES press release text, which is not in the API:
 * "El salario modal (el que tuvo mayor frecuencia, con un 3,8% de los
 * asalariados) se situó en 16.520,18 euros." Null when the sentence is not
 * found (the page then leaves the mode out).
 */
export function parseModal(text: string): { value: number; share: number } | null {
  const flat = text.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
  const m = flat.match(/salario modal \(el que tuvo mayor frecuencia, con un (\d+(?:,\d+)?) ?% de los asalariados\) se situó en (\d{1,3}(?:\.\d{3})*,\d{2}) euros/);
  if (!m) return null;
  return { share: spanishNumber(m[1]!), value: spanishNumber(m[2]!) };
}
