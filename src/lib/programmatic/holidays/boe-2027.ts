import type { DateLocale } from "./format";
import { joinList } from "./names";

/**
 * The 2027 national list: Resolución de 8 de octubre de 2026, de la Dirección
 * General de Trabajo, "relación de fiestas laborales para el año 2027"
 * (BOE-A-2026-21254, BOE 13.10.2026), the same text the Easter and long
 * weekend guides cite. Transcribed from the BOE's HTML table on 2 Nov 2026;
 * `tests/fixtures/holidays/boe-a-2026-21254.txt` keeps that table as read,
 * and a test holds every row below to it, and the Catalonia column to
 * Ordre EMT/52/2026 (`regionalDays(2027)`).
 *
 * Codes, as the BOE gives them: `*` national, not replaceable; `**` national,
 * kept by that community (it could have swapped it and did not); `***` the
 * community's own. The date pages only need where a day is a holiday, so the
 * code is kept for the test and for nothing else.
 */

export const BOE_2027 = {
  name: "Resolución de 8 de octubre de 2026, de la Dirección General de Trabajo, por la que se publica relación de fiestas laborales para el año 2027",
  ref: "BOE-A-2026-21254, BOE de 13.10.2026",
  url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-21254",
  readOn: "2026-11-02",
} as const;

/** The BOE's nineteen columns, in its order. */
export const REGIONS = ["AN", "AR", "AS", "IB", "CN", "CB", "CM", "CL", "CT", "EX", "GA", "MD", "MC", "NC", "PV", "RI", "VC", "CE", "ML"] as const;
export type Region = (typeof REGIONS)[number];

export const REGION_NAME: Record<Region, Record<DateLocale, string>> = {
  AN: { ca: "Andalusia", es: "Andalucía", en: "Andalusia" },
  AR: { ca: "l'Aragó", es: "Aragón", en: "Aragon" },
  AS: { ca: "Astúries", es: "Asturias", en: "Asturias" },
  IB: { ca: "les Illes Balears", es: "Illes Balears", en: "the Balearic Islands" },
  CN: { ca: "Canàries", es: "Canarias", en: "the Canary Islands" },
  CB: { ca: "Cantàbria", es: "Cantabria", en: "Cantabria" },
  CM: { ca: "Castella-la Manxa", es: "Castilla-La Mancha", en: "Castile-La Mancha" },
  CL: { ca: "Castella i Lleó", es: "Castilla y León", en: "Castile and León" },
  CT: { ca: "Catalunya", es: "Cataluña", en: "Catalonia" },
  EX: { ca: "Extremadura", es: "Extremadura", en: "Extremadura" },
  GA: { ca: "Galícia", es: "Galicia", en: "Galicia" },
  MD: { ca: "la Comunitat de Madrid", es: "la Comunidad de Madrid", en: "the Community of Madrid" },
  MC: { ca: "la Regió de Múrcia", es: "la Región de Murcia", en: "the Region of Murcia" },
  NC: { ca: "Navarra", es: "Navarra", en: "Navarre" },
  PV: { ca: "el País Basc", es: "el País Vasco", en: "the Basque Country" },
  RI: { ca: "la Rioja", es: "La Rioja", en: "La Rioja" },
  VC: { ca: "la Comunitat Valenciana", es: "la Comunitat Valenciana", en: "the Valencian Community" },
  CE: { ca: "Ceuta", es: "Ceuta", en: "Ceuta" },
  ML: { ca: "Melilla", es: "Melilla", en: "Melilla" },
};

export type BoeCode = "*" | "**" | "***";

export interface BoeRow {
  date: string;
  /** The row's name as the BOE prints it, without the full stop. */
  name: string;
  marks: Partial<Record<Region, BoeCode>>;
}

const every = (code: BoeCode, except: Region[] = []): Partial<Record<Region, BoeCode>> =>
  Object.fromEntries(REGIONS.filter((r) => !except.includes(r)).map((r) => [r, code]));
const only = (code: BoeCode, regions: Region[]): Partial<Record<Region, BoeCode>> => Object.fromEntries(regions.map((r) => [r, code]));

/** Every row of the BOE table, in its order. */
export const BOE_2027_ROWS: readonly BoeRow[] = [
  { date: "2027-01-01", name: "Año Nuevo", marks: every("*") },
  { date: "2027-01-06", name: "Epifanía del Señor", marks: every("**") },
  { date: "2027-03-01", name: "Día de Andalucía", marks: only("***", ["AN"]) },
  { date: "2027-03-01", name: "Día de les Illes Balears", marks: only("***", ["IB"]) },
  { date: "2027-03-10", name: "Fiesta del Eid Fitr", marks: only("***", ["ML"]) },
  { date: "2027-03-19", name: "San José", marks: only("**", ["GA", "MD", "MC", "NC", "VC"]) },
  { date: "2027-03-25", name: "Jueves Santo", marks: every("**", ["CT", "VC"]) },
  { date: "2027-03-26", name: "Viernes Santo", marks: every("*") },
  { date: "2027-03-29", name: "Lunes de Pascua", marks: only("***", ["IB", "CT", "NC", "PV", "RI", "VC"]) },
  { date: "2027-04-23", name: "San Jorge/Día de Aragón", marks: only("***", ["AR"]) },
  { date: "2027-04-23", name: "Fiesta de Castilla y León", marks: only("***", ["CL"]) },
  { date: "2027-05-01", name: "Fiesta del Trabajo", marks: every("*") },
  { date: "2027-05-17", name: "Día de las Letras Gallegas", marks: only("***", ["GA"]) },
  { date: "2027-05-17", name: "Eidul Adha-Fiesta Sacrificio", marks: only("***", ["CE"]) },
  { date: "2027-05-17", name: "Fiesta Sacrificio-Aid Al Adha", marks: only("***", ["ML"]) },
  { date: "2027-05-27", name: "Corpus Christi", marks: only("***", ["CM"]) },
  { date: "2027-05-31", name: "Día de Castilla-La Mancha", marks: only("***", ["CM"]) },
  { date: "2027-06-09", name: "Día de la Región de Murcia", marks: only("***", ["MC"]) },
  { date: "2027-06-09", name: "Día de La Rioja", marks: only("***", ["RI"]) },
  { date: "2027-06-24", name: "Día de San Juan", marks: only("***", ["CT"]) },
  { date: "2027-07-28", name: "Día de las Instituciones de Cantabria", marks: only("***", ["CB"]) },
  { date: "2027-08-05", name: "Nuestra Señora de África", marks: only("***", ["CE"]) },
  { date: "2027-08-16", name: "Lunes siguiente a asunción de la Virgen", marks: only("**", ["AN", "AR", "AS", "CN", "CL", "MD"]) },
  { date: "2027-09-08", name: "Día de Asturias", marks: only("***", ["AS"]) },
  { date: "2027-09-08", name: "Día de Extremadura", marks: only("***", ["EX"]) },
  { date: "2027-09-11", name: "Fiesta Nacional de Cataluña", marks: only("***", ["CT"]) },
  { date: "2027-09-15", name: "La Bien Aparecida", marks: only("***", ["CB"]) },
  { date: "2027-10-07", name: "Aniversario 1er Gobierno Euskadi", marks: only("***", ["PV"]) },
  { date: "2027-10-09", name: "Día de la Comunitat Valenciana", marks: only("***", ["VC"]) },
  { date: "2027-10-11", name: "Sustitución 15 de agosto", marks: only("***", ["EX"]) },
  { date: "2027-10-12", name: "Fiesta Nacional de España", marks: every("*") },
  { date: "2027-11-01", name: "Todos los Santos", marks: every("*") },
  { date: "2027-12-06", name: "Día de la Constitución Española", marks: every("*") },
  { date: "2027-12-08", name: "Inmaculada Concepción", marks: every("*") },
  { date: "2027-12-25", name: "Natividad del Señor", marks: every("*") },
];

/** The regions (and the two cities) where a 2027 date is a holiday, in the BOE's column order. */
export function boeRegionsOn(iso: string): Region[] {
  const marked = new Set(BOE_2027_ROWS.filter((r) => r.date === iso).flatMap((r) => Object.keys(r.marks) as Region[]));
  return REGIONS.filter((r) => marked.has(r));
}

/** The dates a region has in the BOE list: the Catalonia column must be Ordre EMT/52/2026. */
export function boeDatesFor(region: Region): string[] {
  return [...new Set(BOE_2027_ROWS.filter((r) => r.marks[region]).map((r) => r.date))].sort();
}

export type SpainScope =
  /** Every community and both cities. */
  | { kind: "all" }
  /** Everywhere except these (Holy Thursday: Catalonia and the Valencian Community). */
  | { kind: "allBut"; except: Region[] }
  /** Only these. */
  | { kind: "some"; regions: Region[] }
  | { kind: "none" };

/**
 * Where else in Spain the day is a holiday. Catalonia itself is left out of
 * the lists: the pages say what applies in Catalonia first, from the Catalan
 * order, and then this.
 */
export function spainScope(iso: string): SpainScope {
  const on = boeRegionsOn(iso);
  const others = REGIONS.filter((r) => r !== "CT");
  const here = others.filter((r) => on.includes(r));
  if (here.length === 0) return { kind: "none" };
  if (here.length === others.length) return { kind: "all" };
  // Most of Spain: name the few exceptions rather than the many.
  if (here.length > others.length / 2) return { kind: "allBut", except: others.filter((r) => !here.includes(r)) };
  return { kind: "some", regions: here };
}

/** "Galícia, la Comunitat de Madrid i Navarra". */
export function regionList(regions: readonly Region[], locale: DateLocale): string {
  return joinList(regions.map((r) => REGION_NAME[r][locale]), locale);
}
