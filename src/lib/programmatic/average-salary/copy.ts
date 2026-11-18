import { calcPath, calculatorSlugs } from "@/lib/programmatic/calculators/paths";
import { caDayArticle, dayMonthYear, type DateLocale } from "@/lib/programmatic/holidays/format";

import type { AgeBand, AgeBand5, Cell, DistKey, Labelled, OccupationLevel, RegionId, Sector, Sex, Workday } from "./ine";

/**
 * Paths, numbers and labels of "Salario medio en España" (calculators
 * family, hub group "official"):
 *
 *   /es/calculadoras/salario-medio/
 *   /ca/calculadores/salari-mitja/
 *   /en/calculators/average-salary-spain/
 *
 * Client-safe: the "people like you" finder imports it.
 */

export type WageLocale = DateLocale;
export const WAGE_LOCALES: readonly WageLocale[] = ["es", "ca", "en"];

export const WAGE_SLUG: Record<WageLocale, string> = calculatorSlugs("average-salary");

export function wagePath(locale: WageLocale): string {
  return calcPath("average-salary", locale);
}

export function wageEditions(): Record<WageLocale, string> {
  return { es: wagePath("es"), ca: wagePath("ca"), en: wagePath("en") };
}

/** The net salary calculator with a gross amount (and region) filled in: its hash (net-salary/copy.ts writeHash). */
export function netSalaryLink(locale: WageLocale, gross: number, region: RegionId | null): string {
  const b = Number.isInteger(gross) ? String(gross) : gross.toFixed(2);
  return `${calcPath("net-salary", locale)}#b=${b}${region && region !== "es" ? `&r=${region}` : ""}`;
}

/* -------------------------------------------------------------------------- */
/* Numbers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * "29.540,26 €" (es, ca), "€29,540.26" (en), with the decimals INE prints
 * (2 for the EAES, 1 for the EPA). Written by hand, not with Intl: server
 * and browser must print the same characters, and Spanish CLDR leaves
 * four-digit amounts ungrouped.
 */
export function euros(value: number, locale: WageLocale, decimals = 2): string {
  const negative = value < 0;
  const [int = "0", dec] = Math.abs(value).toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, locale === "en" ? "," : ".");
  const body = dec ? `${grouped}${locale === "en" ? "." : ","}${dec}` : grouped;
  const sign = negative ? "−" : "";
  return locale === "en" ? `${sign}€${body}` : `${sign}${body} €`;
}

/** "5,3 %" (es, ca), "5.3%" (en). */
export function pct(value: number, locale: WageLocale, decimals = 1): string {
  const s = value.toFixed(decimals);
  return locale === "en" ? `${s}%` : `${s.replace(".", ",")} %`;
}

/** A table cell as text: the figure, " *" when INE flags it (100-500 observations), "—" when INE gives none. */
export function cellText(cell: Cell, locale: WageLocale, decimals = 2): string {
  if (!cell) return "—";
  return `${euros(cell.v, locale, decimals)}${cell.low ? " *" : ""}`;
}

/** "28 de mayo de 2026" / "28 de maig de 2026" / "28 May 2026". */
export function day(iso: string, locale: WageLocale): string {
  return dayMonthYear(iso, locale);
}

/** "el 28 de mayo de 2026" / "el 28 de maig de 2026" / "on 28 May 2026". */
export function onDay(iso: string, locale: WageLocale): string {
  const d = dayMonthYear(iso, locale);
  return locale === "ca" ? `${caDayArticle(iso)}${d}` : locale === "es" ? `el ${d}` : `on ${d}`;
}

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

type T = Record<WageLocale, string>;

export const REGION_LABEL: Record<RegionId, T> = {
  es: { es: "España", ca: "Espanya", en: "Spain" },
  andalucia: { es: "Andalucía", ca: "Andalusia", en: "Andalusia" },
  aragon: { es: "Aragón", ca: "Aragó", en: "Aragon" },
  asturias: { es: "Asturias", ca: "Astúries", en: "Asturias" },
  baleares: { es: "Illes Balears", ca: "Illes Balears", en: "Balearic Islands" },
  canarias: { es: "Canarias", ca: "Canàries", en: "Canary Islands" },
  cantabria: { es: "Cantabria", ca: "Cantàbria", en: "Cantabria" },
  "castilla-y-leon": { es: "Castilla y León", ca: "Castella i Lleó", en: "Castile and León" },
  "castilla-la-mancha": { es: "Castilla-La Mancha", ca: "Castella-la Manxa", en: "Castile-La Mancha" },
  cataluna: { es: "Cataluña", ca: "Catalunya", en: "Catalonia" },
  valencia: { es: "Comunitat Valenciana", ca: "Comunitat Valenciana", en: "Valencian Community" },
  extremadura: { es: "Extremadura", ca: "Extremadura", en: "Extremadura" },
  galicia: { es: "Galicia", ca: "Galícia", en: "Galicia" },
  madrid: { es: "Comunidad de Madrid", ca: "Comunitat de Madrid", en: "Madrid region" },
  murcia: { es: "Región de Murcia", ca: "Regió de Múrcia", en: "Murcia" },
  navarra: { es: "Navarra", ca: "Navarra", en: "Navarre" },
  "pais-vasco": { es: "País Vasco", ca: "País Basc", en: "Basque Country" },
  "la-rioja": { es: "La Rioja", ca: "La Rioja", en: "La Rioja" },
};

/** Names that take an article after "en" / "a" / "in". */
const IN_REGION: Partial<Record<RegionId, Partial<T>>> = {
  baleares: { es: "en las Illes Balears", ca: "a les Illes Balears", en: "in the Balearic Islands" },
  canarias: { ca: "a les Canàries", en: "in the Canary Islands" },
  madrid: { es: "en la Comunidad de Madrid", ca: "a la Comunitat de Madrid", en: "in the Madrid region" },
  murcia: { es: "en la Región de Murcia", ca: "a la Regió de Múrcia" },
  valencia: { es: "en la Comunitat Valenciana", ca: "a la Comunitat Valenciana", en: "in the Valencian Community" },
  "pais-vasco": { es: "en el País Vasco", ca: "al País Basc", en: "in the Basque Country" },
};

/** "en Cataluña" / "a Catalunya" / "in Catalonia"; "en la Comunidad de Madrid", "al País Basc", "in the Basque Country". */
export function inRegion(region: RegionId, locale: WageLocale): string {
  return IN_REGION[region]?.[locale] ?? `${{ es: "en", ca: "a", en: "in" }[locale]} ${REGION_LABEL[region][locale]}`;
}

/** Catalan "de" before an article: "dels treballadors", "de les treballadores". */
export function caDe(phrase: string): string {
  return phrase.startsWith("els ") ? `dels ${phrase.slice(4)}` : phrase.startsWith("el ") ? `del ${phrase.slice(3)}` : `de ${phrase}`;
}

export const SEX_LABEL: Record<Sex, T> = {
  both: { es: "Ambos sexos", ca: "Tots dos sexes", en: "Both sexes" },
  women: { es: "Mujeres", ca: "Dones", en: "Women" },
  men: { es: "Hombres", ca: "Homes", en: "Men" },
};

export const DIST_LABEL: Record<DistKey, T> = {
  mean: { es: "Media", ca: "Mitjana", en: "Mean" },
  p10: { es: "Percentil 10", ca: "Percentil 10", en: "10th percentile" },
  q1: { es: "Cuartil inferior (P25)", ca: "Quartil inferior (P25)", en: "Lower quartile (P25)" },
  median: { es: "Mediana", ca: "Mediana", en: "Median" },
  q3: { es: "Cuartil superior (P75)", ca: "Quartil superior (P75)", en: "Upper quartile (P75)" },
  p90: { es: "Percentil 90", ca: "Percentil 90", en: "90th percentile" },
};

/** The share of workers below each percentile. */
export const DIST_SHARE: Record<Exclude<DistKey, "mean">, number> = { p10: 10, q1: 25, median: 50, q3: 75, p90: 90 };

export const AGE_LABEL: Record<AgeBand, T> = {
  all: { es: "Todas las edades", ca: "Totes les edats", en: "All ages" },
  u25: { es: "Menos de 25 años", ca: "Menys de 25 anys", en: "Under 25" },
  "25-34": { es: "De 25 a 34 años", ca: "De 25 a 34 anys", en: "25 to 34" },
  "35-44": { es: "De 35 a 44 años", ca: "De 35 a 44 anys", en: "35 to 44" },
  "45-54": { es: "De 45 a 54 años", ca: "De 45 a 54 anys", en: "45 to 54" },
  "55+": { es: "55 años o más", ca: "55 anys o més", en: "55 and over" },
};

const range = (a: number, b: number): T => ({ es: `De ${a} a ${b} años`, ca: `De ${a} a ${b} anys`, en: `${a} to ${b}` });
export const AGE5_LABEL: Record<AgeBand5, T> = {
  all: AGE_LABEL.all,
  u20: { es: "Menos de 20 años", ca: "Menys de 20 anys", en: "Under 20" },
  "20-24": range(20, 24),
  "25-29": range(25, 29),
  "30-34": range(30, 34),
  "35-39": range(35, 39),
  "40-44": range(40, 44),
  "45-49": range(45, 49),
  "50-54": range(50, 54),
  "55-59": range(55, 59),
  "60-64": range(60, 64),
  "65+": { es: "65 años o más", ca: "65 anys o més", en: "65 and over" },
};

export const SECTOR_LABEL: Record<Sector, T> = {
  all: { es: "Todos los sectores", ca: "Tots els sectors", en: "All sectors" },
  industry: { es: "Industria", ca: "Indústria", en: "Industry" },
  construction: { es: "Construcción", ca: "Construcció", en: "Construction" },
  services: { es: "Servicios", ca: "Serveis", en: "Services" },
};

export const OCCUPATION_LEVEL_LABEL: Record<OccupationLevel, T> = {
  all: { es: "Todas las ocupaciones", ca: "Totes les ocupacions", en: "All occupations" },
  high: { es: "Alta: dirección, técnicos y profesionales", ca: "Alta: direcció, tècnics i professionals", en: "High: managers, professionals and technicians" },
  medium: { es: "Media: oficina, servicios, oficios cualificados", ca: "Mitjana: oficina, serveis, oficis qualificats", en: "Medium: clerical, services, skilled trades" },
  low: { es: "Baja: operadores y ocupaciones elementales", ca: "Baixa: operadors i ocupacions elementals", en: "Low: operators and elementary occupations" },
};

/** INE's note on table 28193, in words: which CNO-11 major groups each level holds. */
export const OCCUPATION_LEVEL_NOTE: T = {
  es: "El INE agrupa las ocupaciones en esta tabla así: alta, grandes grupos 1, 2 y 3 de la CNO-11 (directores y gerentes; técnicos y profesionales científicos e intelectuales; técnicos y profesionales de apoyo); media, grupos 4, 5, 6, 7 y 0 (empleados de oficina; trabajadores de restauración, servicios personales, protección y comercio; trabajadores cualificados agrarios; artesanos y trabajadores cualificados de la industria y la construcción; ocupaciones militares); baja, grupos 8 y 9 (operadores de instalaciones y maquinaria, y montadores; ocupaciones elementales).",
  ca: "L'INE agrupa les ocupacions en aquesta taula així: alta, grans grups 1, 2 i 3 de la CNO-11 (directors i gerents; tècnics i professionals científics i intel·lectuals; tècnics i professionals de suport); mitjana, grups 4, 5, 6, 7 i 0 (empleats d'oficina; treballadors de restauració, serveis personals, protecció i comerç; treballadors qualificats agraris; artesans i treballadors qualificats de la indústria i la construcció; ocupacions militars); baixa, grups 8 i 9 (operadors d'instal·lacions i maquinària, i muntadors; ocupacions elementals).",
  en: "In this table the INE groups occupations as follows: high, CNO-11 major groups 1, 2 and 3 (managers; scientific and intellectual professionals; technicians and associate professionals); medium, groups 4, 5, 6, 7 and 0 (clerical workers; catering, personal, protective services and sales workers; skilled agricultural workers; craft and skilled industry and construction workers; armed forces); low, groups 8 and 9 (plant and machine operators and assemblers; elementary occupations).",
};

export const WORKDAY_LABEL: Record<Workday, T> = {
  all: { es: "Total", ca: "Total", en: "All" },
  full: { es: "Jornada a tiempo completo", ca: "Jornada a temps complet", en: "Full-time" },
  part: { es: "Jornada a tiempo parcial", ca: "Jornada a temps parcial", en: "Part-time" },
};

/** Catalan names of the CNAE-09 sections (INE gives Spanish and English). */
const SECTION_CA: Record<string, string> = {
  B: "Indústries extractives",
  C: "Indústria manufacturera",
  D: "Subministrament d'energia elèctrica, gas, vapor i aire condicionat",
  E: "Subministrament d'aigua, sanejament, gestió de residus i descontaminació",
  F: "Construcció",
  G: "Comerç a l'engròs i al detall; reparació de vehicles de motor i motocicletes",
  H: "Transport i emmagatzematge",
  I: "Hostaleria",
  J: "Informació i comunicacions",
  K: "Activitats financeres i d'assegurances",
  L: "Activitats immobiliàries",
  M: "Activitats professionals, científiques i tècniques",
  N: "Activitats administratives i serveis auxiliars",
  O: "Administració pública i defensa; Seguretat Social obligatòria",
  P: "Educació",
  Q: "Activitats sanitàries i de serveis socials",
  R: "Activitats artístiques, recreatives i d'entreteniment",
  S: "Altres serveis",
};

/** Catalan names of the CNO-11 groups of table 28186 (INE gives Spanish and English). */
const OCCUPATION_CA: Record<string, string> = {
  A: "Directors i gerents",
  B: "Tècnics i professionals científics i intel·lectuals de la salut i l'ensenyament",
  C: "Altres tècnics i professionals científics i intel·lectuals",
  D: "Tècnics; professionals de suport",
  E: "Empleats d'oficina que no atenen el públic",
  F: "Empleats d'oficina que atenen el públic",
  G: "Treballadors dels serveis de restauració i comerç",
  H: "Treballadors dels serveis de salut i la cura de persones",
  I: "Treballadors dels serveis de protecció i seguretat",
  J: "Treballadors qualificats del sector agrícola, ramader, forestal i pesquer",
  K: "Treballadors qualificats de la construcció, excepte operadors de màquines",
  L: "Treballadors qualificats de les indústries manufactureres, excepte operadors d'instal·lacions i màquines",
  M: "Operadors d'instal·lacions i maquinària fixes, i muntadors",
  N: "Conductors i operadors de maquinària mòbil",
  O: "Treballadors no qualificats en serveis (excepte transports)",
  P: "Peons de l'agricultura, pesca, construcció, indústries manufactureres i transports",
  Q: "Ocupacions militars",
};

export const CATALAN_NAMES = { sections: SECTION_CA, occupations: OCCUPATION_CA } as const;

/** A section's or occupation group's name in the page's language. */
export function labelledName(row: Labelled, kind: "sections" | "occupations", locale: WageLocale): string {
  if (locale === "es") return row.es;
  if (locale === "en") return row.en;
  return CATALAN_NAMES[kind][row.code] ?? row.es;
}
