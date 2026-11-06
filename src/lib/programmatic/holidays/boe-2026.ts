import { REGIONS, type BoeCode, type BoeRow, type Region } from "./boe-2027";

/**
 * The 2026 national list: Resolución de 17 de octubre de 2025, de la
 * Dirección General de Trabajo, "relación de fiestas laborales para el año
 * 2026" (BOE-A-2025-21667, BOE 259, 28.10.2025). Same shape and codes as
 * `boe-2027.ts`, transcribed from the BOE's HTML table on 6 Nov 2026 for the
 * Spain-wide December bridge page; `tests/fixtures/holidays/boe-a-2025-21667.txt`
 * keeps that table as read, and a test holds every row below to it.
 *
 * On 6 Nov 2026 the BOE listed no correction of the resolution (its only
 * later reference is the AGE's 2026 non-working days, BOE-A-2025-23702), and
 * no community's own bulletin had changed a December 2026 day: searched for
 * every community, read for Melilla (BOME 6315, 3.10.2025, the same days)
 * and Ceuta (local days 20 March and 13 June, none in December).
 *
 * What the table cannot show: Navarra's "fiesta local" common to the whole
 * community. Resolución 390/2025 (BON 129, 30.6.2025) lists 3 December, San
 * Francisco Javier, among its 2026 days, and the BOE leaves it out because it
 * is one of the two local holidays, not a community one. `REGION_WIDE_LOCAL`
 * carries it, with its own source.
 */

export const BOE_2026 = {
  name: "Resolución de 17 de octubre de 2025, de la Dirección General de Trabajo, por la que se publica la relación de fiestas laborales para el año 2026",
  ref: "BOE-A-2025-21667, BOE de 28.10.2025",
  url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-21667",
  readOn: "2026-11-06",
} as const;

const every = (code: BoeCode, except: Region[] = []): Partial<Record<Region, BoeCode>> =>
  Object.fromEntries(REGIONS.filter((r) => !except.includes(r)).map((r) => [r, code]));
const only = (code: BoeCode, regions: Region[]): Partial<Record<Region, BoeCode>> => Object.fromEntries(regions.map((r) => [r, code]));

/** Every row of the BOE table, in its order. */
export const BOE_2026_ROWS: readonly BoeRow[] = [
  { date: "2026-01-01", name: "Año Nuevo", marks: every("*") },
  { date: "2026-01-06", name: "Epifanía del Señor", marks: every("**") },
  { date: "2026-02-28", name: "Día de Andalucía", marks: only("***", ["AN"]) },
  { date: "2026-03-02", name: "Lunes siguiente al Día de les Illes Balears", marks: only("***", ["IB"]) },
  { date: "2026-03-19", name: "San José", marks: only("**", ["GA", "MC", "NC", "PV", "VC"]) },
  { date: "2026-03-20", name: "Fiesta del Eid Fitr", marks: only("***", ["ML"]) },
  { date: "2026-04-02", name: "Jueves Santo", marks: every("**", ["CT", "VC"]) },
  { date: "2026-04-03", name: "Viernes Santo", marks: every("*") },
  { date: "2026-04-06", name: "Lunes de Pascua", marks: only("***", ["IB", "CM", "CT", "NC", "PV", "RI", "VC"]) },
  { date: "2026-04-23", name: "San Jorge/Día de Aragón", marks: only("***", ["AR"]) },
  { date: "2026-04-23", name: "Fiesta de Castilla y León", marks: only("***", ["CL"]) },
  { date: "2026-05-01", name: "Fiesta del Trabajo", marks: every("*") },
  { date: "2026-05-02", name: "Fiesta de la Comunidad de Madrid", marks: only("***", ["MD"]) },
  { date: "2026-05-27", name: "Fiesta Sacrificio-Eidul Adha", marks: only("***", ["CE"]) },
  { date: "2026-05-27", name: "Fiesta Sacrificio-Aid al Adha", marks: only("***", ["ML"]) },
  { date: "2026-05-30", name: "Día de Canarias", marks: only("***", ["CN"]) },
  { date: "2026-06-04", name: "Corpus Christi", marks: only("***", ["CM"]) },
  { date: "2026-06-09", name: "Día de la Región de Murcia", marks: only("***", ["MC"]) },
  { date: "2026-06-09", name: "Día de la Rioja", marks: only("***", ["RI"]) },
  { date: "2026-06-24", name: "San Juan", marks: only("***", ["CT", "GA", "VC"]) },
  { date: "2026-07-25", name: "Santiago Apóstol/Día Nacional de Galicia", marks: only("**", ["GA", "PV"]) },
  { date: "2026-07-28", name: "Día de las Instituciones de Cantabria", marks: only("***", ["CB"]) },
  { date: "2026-08-05", name: "Nuestra Señora de África", marks: only("***", ["CE"]) },
  { date: "2026-08-15", name: "Asunción de la Virgen", marks: every("*") },
  { date: "2026-09-02", name: "Día de Ceuta", marks: only("***", ["CE"]) },
  { date: "2026-09-08", name: "Día de Asturias", marks: only("***", ["AS"]) },
  { date: "2026-09-08", name: "Día de Extremadura", marks: only("***", ["EX"]) },
  { date: "2026-09-11", name: "Fiesta Nacional de Cataluña", marks: only("***", ["CT"]) },
  { date: "2026-09-15", name: "La Bien Aparecida", marks: only("***", ["CB"]) },
  { date: "2026-10-09", name: "Día de la Comunitat Valenciana", marks: only("***", ["VC"]) },
  { date: "2026-10-12", name: "Fiesta Nacional de España", marks: every("*") },
  { date: "2026-11-02", name: "Día siguiente a Todos los Santos", marks: only("**", ["AN", "AR", "AS", "CN", "CM", "CL", "EX", "MD", "NC"]) },
  // The ten that moved Sunday 6 December to the Monday; the other nine swapped it for a day of their own.
  { date: "2026-12-07", name: "Lunes siguiente al Día de la Constitución Española", marks: only("**", ["AN", "AR", "AS", "CB", "CL", "EX", "MD", "MC", "RI", "ML"]) },
  { date: "2026-12-08", name: "Inmaculada Concepción", marks: every("*") },
  { date: "2026-12-25", name: "Natividad del Señor", marks: every("*") },
  { date: "2026-12-26", name: "San Esteban", marks: only("***", ["IB", "CT"]) },
];

/** The regions (and the two cities) where a 2026 date is a holiday, in the BOE's column order. */
export function boeRegionsOn2026(iso: string): Region[] {
  const marked = new Set(BOE_2026_ROWS.filter((r) => r.date === iso).flatMap((r) => Object.keys(r.marks) as Region[]));
  return REGIONS.filter((r) => marked.has(r));
}

/**
 * A local holiday the community fixed for all its towns, so it is off
 * everywhere there although the BOE does not list it.
 */
export interface RegionWideLocal {
  region: Region;
  date: string;
  name: string;
  source: { name: string; url: string; publisher: string };
}

export const REGION_WIDE_LOCAL: readonly RegionWideLocal[] = [
  {
    region: "NC",
    date: "2026-12-03",
    name: "San Francisco Javier",
    source: {
      name: "Resolución 390/2025, de 5 de junio, del director general de Economía Social y Trabajo, calendario oficial de fiestas laborales para el año 2026 en la Comunidad Foral de Navarra (BON 129, 30.6.2025)",
      url: "https://bon.navarra.es/es/anuncio/-/texto/2025/129/11",
      publisher: "Boletín Oficial de Navarra",
    },
  },
];
