import { BOE_2027, BOE_2027_ROWS, REGIONS, type BoeCode, type BoeRow, type Region } from "@/lib/programmatic/holidays/boe-2027";

/**
 * Public holidays (national and regional) that fall inside the 2026-2027
 * school year, per community, from the two BOE tables of "fiestas laborales":
 *
 *  - 2026: Resolución de 17 de octubre de 2025 (BOE-A-2025-21667, BOE of
 *    28.10.2025). Only the rows from September to December are kept, the
 *    first term; parsed from the BOE's HTML table on 6 Nov 2026, column by
 *    column.
 *  - 2027: BOE-A-2026-21254 (`boe-2027.ts`, held to its fixture by a test).
 *
 * These are labour holidays: the school orders do not always repeat them, but
 * there is no class on them. Local holidays (two per municipality) are not
 * here; every page says so.
 */

export const BOE_2026 = {
  name: "Resolución de 17 de octubre de 2025, de la Dirección General de Trabajo, por la que se publica la relación de fiestas laborales para el año 2026",
  ref: "BOE-A-2025-21667, BOE de 28.10.2025",
  url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-21667",
  readOn: "2026-11-06",
} as const;

export { BOE_2027 };

const every = (code: BoeCode): Partial<Record<Region, BoeCode>> => Object.fromEntries(REGIONS.map((r) => [r, code]));
const only = (code: BoeCode, regions: Region[]): Partial<Record<Region, BoeCode>> => Object.fromEntries(regions.map((r) => [r, code]));

/** BOE-A-2025-21667, September to December 2026, in the BOE's order. */
export const BOE_2026_FIRST_TERM: readonly BoeRow[] = [
  { date: "2026-09-02", name: "Día de Ceuta", marks: only("***", ["CE"]) },
  { date: "2026-09-08", name: "Día de Asturias", marks: only("***", ["AS"]) },
  { date: "2026-09-08", name: "Día de Extremadura", marks: only("***", ["EX"]) },
  { date: "2026-09-11", name: "Fiesta Nacional de Cataluña", marks: only("***", ["CT"]) },
  { date: "2026-09-15", name: "La Bien Aparecida", marks: only("***", ["CB"]) },
  { date: "2026-10-09", name: "Día de la Comunitat Valenciana", marks: only("***", ["VC"]) },
  { date: "2026-10-12", name: "Fiesta Nacional de España", marks: every("*") },
  { date: "2026-11-02", name: "Día siguiente a Todos los Santos", marks: only("**", ["AN", "AR", "AS", "CN", "CM", "CL", "EX", "MD", "NC"]) },
  { date: "2026-12-07", name: "Lunes siguiente al Día de la Constitución Española", marks: only("**", ["AN", "AR", "AS", "CB", "CL", "EX", "MD", "MC", "RI", "ML"]) },
  { date: "2026-12-08", name: "Inmaculada Concepción", marks: every("*") },
  { date: "2026-12-25", name: "Natividad del Señor", marks: every("*") },
  { date: "2026-12-26", name: "San Esteban", marks: only("***", ["IB", "CT"]) },
];

export interface TermHoliday {
  date: string;
  name: string;
}

/** Every 2026-27 school-year public holiday of a community, by date. */
export function publicHolidaysFor(region: Region, from: string, to: string): TermHoliday[] {
  const out = new Map<string, string>();
  for (const row of [...BOE_2026_FIRST_TERM, ...BOE_2027_ROWS]) {
    if (!row.marks[region] || row.date < from || row.date > to) continue;
    const name = cleanName(row.name);
    out.set(row.date, out.has(row.date) ? `${out.get(row.date)} / ${name}` : name);
  }
  return [...out.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, name]) => ({ date, name }));
}

/** "Eidul Adha-Fiesta Sacrificio" reads as printed; only drop a trailing full stop. */
function cleanName(name: string): string {
  return name.replace(/\.$/, "");
}
