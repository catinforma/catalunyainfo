import {
  AGE_BANDS,
  AGE_BANDS_5,
  DIST_KEYS,
  OCCUPATION_LEVELS,
  REGION_IDS,
  SECTORS,
  SEXES,
  TABLES,
  WORKDAYS,
  pressUrl,
  tablePageUrl,
  type AgeBand,
  type AgeBand5,
  type Cell,
  type DistKey,
  type OccupationLevel,
  type RegionId,
  type SalarySnapshot,
  type Sector,
  type Sex,
  type TableKey,
  type Workday,
} from "./ine";

/**
 * The page's downloadable CSV (public/datos/salario-medio-ine.csv), built
 * from the committed snapshot by scripts/average-salary-snapshot.ts; a test
 * checks the committed file is exactly this function's output. Every row
 * names its source ("Fuente: INE"), the INE table and the day INE released
 * it, as the INE's reuse terms ask (CC BY 4.0: cite the source and the date
 * of the last update). Labels are INE's own, in Spanish.
 *
 * RFC 4180: comma-separated, "." as the decimal point, CRLF, UTF-8 with a
 * byte-order mark so that spreadsheet programs read the accents.
 */

export const CSV_PATH = "/datos/salario-medio-ine.csv";

export const CSV_ATTRIBUTION = "Fuente: INE (www.ine.es)";

/** INE's own names (Spanish) of the territories, sexes and categories. */
export const INE_REGION_NAME: Record<RegionId, string> = {
  es: "Total Nacional",
  andalucia: "Andalucía",
  aragon: "Aragón",
  asturias: "Asturias, Principado de",
  baleares: "Balears, Illes",
  canarias: "Canarias",
  cantabria: "Cantabria",
  "castilla-y-leon": "Castilla y León",
  "castilla-la-mancha": "Castilla - La Mancha",
  cataluna: "Cataluña",
  valencia: "Comunitat Valenciana",
  extremadura: "Extremadura",
  galicia: "Galicia",
  madrid: "Madrid, Comunidad de",
  murcia: "Murcia, Región de",
  navarra: "Navarra, Comunidad Foral de",
  "pais-vasco": "País Vasco",
  "la-rioja": "Rioja, La",
};
const SEX_NAME: Record<Sex, string> = { both: "Ambos sexos", women: "Mujeres", men: "Hombres" };
const DIST_NAME: Record<DistKey, string> = { mean: "Media", p10: "Percentil 10", q1: "Cuartil inferior", median: "Mediana", q3: "Cuartil superior", p90: "Percentil 90" };
const AGE_NAME: Record<AgeBand, string> = { all: "Todas las edades", u25: "Menos de 25 años", "25-34": "De 25 a 34 años", "35-44": "De 35 a 44 años", "45-54": "De 45 a 54 años", "55+": "55 y más años" };
const AGE5_NAME: Record<AgeBand5, string> = {
  all: "Todas las edades",
  u20: "Menos de 20 años",
  "20-24": "De 20 a 24 años",
  "25-29": "De 25 a 29 años",
  "30-34": "De 30 a 34 años",
  "35-39": "De 35 a 39 años",
  "40-44": "De 40 a 44 años",
  "45-49": "De 45 a 49 años",
  "50-54": "De 50 a 54 años",
  "55-59": "De 55 a 59 años",
  "60-64": "De 60 a 64 años",
  "65+": "65 y más años",
};
const SECTOR_NAME: Record<Sector, string> = { all: "Todas las secciones", industry: "Industria", construction: "Construcción", services: "Servicios" };
const OCC_NAME: Record<OccupationLevel, string> = {
  all: "Todas las ocupaciones",
  high: "Alta (grandes grupos 1, 2 y 3 de la CNO-11)",
  medium: "Media (grandes grupos 4, 5, 6, 7 y 0 de la CNO-11)",
  low: "Baja (grandes grupos 8 y 9 de la CNO-11)",
};
const WORKDAY_NAME: Record<Workday, string> = { all: "Total", full: "Jornada a tiempo completo", part: "Jornada a tiempo parcial" };

const OP_NAME = { eaes: "Encuesta Anual de Estructura Salarial", epa: "Encuesta de Población Activa. Decil de salarios del empleo principal" } as const;
const NOTE_LOW = "Entre 100 y 500 observaciones muestrales: cifra sujeta a gran variabilidad (INE)";
const NOTE_NONE = "Dato no disponible: menos de 100 observaciones muestrales (INE)";

const HEADER = ["fuente", "operacion", "tabla_ine", "url_tabla", "anyo", "publicado_ine", "territorio", "sexo", "desglose", "categoria", "medida", "unidad", "valor", "nota"];

function field(s: string): string {
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function salaryCsv(snap: SalarySnapshot): string {
  const rows: string[][] = [HEADER];
  const { eaes, epa } = snap;
  const yearly = "euros brutos al año";
  const monthly = "euros brutos al mes";

  const push = (table: TableKey | "press", region: RegionId, sex: Sex, breakdown: string, category: string, measure: string, unit: string, value: Cell | number | null) => {
    const spec = table === "press" ? null : TABLES[table];
    const op = spec ? spec.op : "eaes";
    const d = op === "eaes" ? eaes : epa;
    const decimals = spec ? spec.decimals : 2;
    const cell: Cell = typeof value === "number" ? { v: value } : value;
    rows.push([
      CSV_ATTRIBUTION,
      OP_NAME[op],
      spec ? String(spec.id) : "nota de prensa",
      spec ? tablePageUrl(table as TableKey) : (d.press ?? pressUrl(op, d.year)),
      String(d.year),
      d.released,
      INE_REGION_NAME[region],
      SEX_NAME[sex],
      breakdown,
      category,
      measure,
      unit,
      cell ? cell.v.toFixed(decimals) : "",
      cell === null ? NOTE_NONE : cell.low ? NOTE_LOW : "",
    ]);
  };

  for (const r of REGION_IDS) for (const s of SEXES) for (const k of DIST_KEYS) push("dist", r, s, "Total", "", DIST_NAME[k], yearly, eaes.dist[r][s][k]);
  if (eaes.modal) push("press", "es", "both", "Total", "", "Moda (salario más frecuente)", yearly, eaes.modal.value);
  for (const r of REGION_IDS) for (const s of SEXES) for (const k of AGE_BANDS) if (k !== "all") push("ageRegion", r, s, "Edad", AGE_NAME[k], "Media", yearly, eaes.ageRegion[r][s][k]);
  for (const r of REGION_IDS) for (const s of SEXES) for (const k of SECTORS) if (k !== "all") push("sectorRegion", r, s, "Sector de actividad", SECTOR_NAME[k], "Media", yearly, eaes.sectorRegion[r][s][k]);
  for (const r of REGION_IDS) for (const s of SEXES) for (const k of OCCUPATION_LEVELS) if (k !== "all") push("occupationRegion", r, s, "Ocupación (agrupada)", OCC_NAME[k], "Media", yearly, eaes.occupationRegion[r][s][k]);
  for (const s of SEXES) for (const k of AGE_BANDS_5) if (k !== "all") push("ageNational", "es", s, "Edad", AGE5_NAME[k], "Media", yearly, eaes.ageNational[s][k]);
  for (const row of eaes.sections) for (const s of SEXES) push("sections", "es", s, "Sección de actividad (CNAE-09)", `${row.code}. ${row.es}`, "Media", yearly, row.values[s]);
  for (const row of eaes.occupations) for (const s of SEXES) push("occupations", "es", s, "Grupo principal de ocupación (CNO-11)", `${row.code}. ${row.es}`, "Media", yearly, row.values[s]);
  for (const s of SEXES) for (const k of WORKDAYS) if (k !== "all") push("workday", "es", s, "Tipo de jornada", WORKDAY_NAME[k], "Media", yearly, eaes.workday[s][k]);
  for (const d of epa.deciles) {
    if (d.lower !== null) push("deciles", "es", "both", "Decil", String(d.decile), "Límite inferior", monthly, d.lower);
    push("deciles", "es", "both", "Decil", String(d.decile), "Media", monthly, d.mean);
  }
  for (const k of WORKDAYS) push("decileWorkday", "es", "both", "Tipo de jornada", WORKDAY_NAME[k], "Media", monthly, epa.means[k]);

  return "﻿" + rows.map((r) => r.map(field).join(",")).join("\r\n") + "\r\n";
}
