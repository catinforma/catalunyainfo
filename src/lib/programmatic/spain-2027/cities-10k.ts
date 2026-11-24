import type { Region } from "@/lib/programmatic/holidays/boe-2027";

import type { CityRow, LocalDay, LocalList } from "./cities-data";
import { WAITING_RECHECK_BY } from "./cities-more";
import { SOURCES, type OfficialText } from "./sources";

/**
 * The 10,000+ wave of the 2027 city pages (24 Nov 2026): the municipalities
 * of 10,000 to 19,999 inhabitants, below the 20,000+ wave (cities-more.ts),
 * each with its two local days from the official 2027 list.
 *
 * Why: a new long-tail town page of this family enters Google at position
 * 4–8 within days, impressions grow with population^0.85, and demand for
 * "festivos / calendario laboral <town> 2027" peaks in December–January.
 *
 * Selection rule (documented here because it decides which pages exist):
 *  1. Population: every municipality outside Catalonia, Ceuta and Melilla
 *     with 10,000 to 19,999 inhabitants at 1 January 2025 (INE, Real Decreto
 *     1117/2025; the INE table of each province, `ineTable`) that is not
 *     already a row of cities-data.ts, cities-more.ts or cities-council.ts.
 *  2. A page is built only when the community's (or province's) official
 *     2027 list is published AND names the town with its two days. Every row
 *     below was transcribed from that bulletin on `TEN_K_READ_ON`: the
 *     bulletin was downloaded again that day and its verbatim line is the
 *     comment above the row. No date is inferred from an earlier year.
 *  3. A town gets no page (`TEN_K_LEFT_OUT`, with the reason) when the list
 *     leaves it out, splits its days in a way that does not give two days to
 *     every zone, or prints weekdays that contradict the 2027 calendar. A
 *     town whose bulletin day is already a BOE holiday of its community
 *     would be left out too (none in this wave; a test holds it).
 *  4. The towns of the four communities with no 2027 list on
 *     `TEN_K_READ_ON` (Aragón, Castilla-La Mancha, Madrid, Navarra) wait in
 *     `TEN_K_WAITING`, with no page.
 *
 * Oddities kept as printed: Formentera's 25 July 2027 is a Sunday in the
 * BOIB; several towns have a Saturday. The page says so (city-copy.ts,
 * "cae en fin de semana").
 *
 * Adding a community the day it publishes: put its 2027 text in sources.ts
 * (see cities-more.ts), then move its towns from `TEN_K_WAITING` to rows
 * here; tests/spain-cities-2027-10k.test.ts fails until the two lists and
 * the INE candidates agree.
 */

/** The day the rows below were read on their bulletin. */
export const TEN_K_READ_ON = "2026-11-24";
export const TEN_K_MIN_POPULATION = 10_000;
/**
 * The pending communities are read again with the 20,000+ wave's own guard
 * (cities-more.ts): one reading moves both waiting lists.
 */
export const TEN_K_RECHECK_BY = WAITING_RECHECK_BY;

/**
 * The last issue of each pending community's bulletin read on
 * `TEN_K_READ_ON` without the 2027 local list (the summary of every issue
 * since the one in `PENDING_CHECKS`, sources.ts).
 */
export const TEN_K_PENDING_READ: Partial<Record<Region, string>> = {
  AR: "BOA núm. 227, de 24.11.2026",
  CM: "DOCM núm. 225, de 24.11.2026",
  MD: "BOCM núm. 282, de 24.11.2026",
  NC: "BON núm. 234, de 24.11.2026",
};

function list2027(region: Region): OfficialText {
  const text = SOURCES[region].local.y2027;
  if (!text) throw new Error(`no 2027 local list for ${region}`);
  return text;
}

function part(region: Region, place: string): OfficialText {
  const found = SOURCES[region].local.parts?.find((p) => p.place === place);
  if (!found) throw new Error(`no ${place} part for ${region}`);
  return found.text;
}

const d = (date: string, name: string | null, extra: Omit<LocalDay, "date" | "name"> = {}): LocalDay => ({ date, name, ...extra });
const y27 = (source: OfficialText, days: LocalDay[], more: Partial<LocalList> = {}): LocalList => ({ year: 2027, days, source, ...more });

type Base = Omit<CityRow, "status2027" | "local2027" | "local2026" | "region" | "province" | "readOn">;

function row(region: Region, province: string, base: Base, local: LocalList): CityRow {
  return { ...base, region, province, status2027: "published", local2027: local, local2026: null, readOn: TEN_K_READ_ON };
}

const BOJA = list2027("AN");
const BOPA = list2027("AS");
const BOIB = list2027("IB");
const BOC_CANARIAS = list2027("CN");
const BOC_CB = list2027("CB");
const BOP_LEON = part("CL", "León");
const BOP_SALAMANCA = part("CL", "Salamanca");
const BOP_SEGOVIA = part("CL", "Segovia");
const DOE = list2027("EX");
const DOG = list2027("GA");
const BORM = list2027("MC");
const BOTHA = part("PV", "Álava");
const BOB = part("PV", "Bizkaia");
const BOG = part("PV", "Gipuzkoa");
const BOR = list2027("RI");
const BOP_ALICANTE = part("VC", "Alicante");
const BOP_CASTELLON = part("VC", "Castellón");
const BOP_VALENCIA = part("VC", "Valencia");

/* -------------------------------------------------------------------------- */
/* The rows: one per town, the bulletin's line above it                       */
/* -------------------------------------------------------------------------- */

const ANDALUCIA: CityRow[] = [
  // BOJA: «CÓRDOBA > CABRA 24 DE JUNIO 08 DE SEPTIEMBRE»
  row("AN", "Córdoba", { ine: "14013", slug: "cabra", name: "Cabra", ineName: "Cabra", population: 19995, ineTable: 2901, capital: false }, y27(BOJA, [d("2027-06-24", null), d("2027-09-08", null)])),
  // BOJA: «GRANADA > ALBOLOTE 27 DE MAYO 30 DE JULIO»
  row("AN", "Granada", { ine: "18003", slug: "albolote", name: "Albolote", ineName: "Albolote", population: 19768, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-05-27", null), d("2027-07-30", null)])),
  // BOJA: «SEVILLA > ARAHAL 22 DE JULIO 06 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41011", slug: "arahal", name: "Arahal", ineName: "Arahal", population: 19546, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-07-22", null), d("2027-09-06", null)])),
  // BOJA: «SEVILLA > VISO DEL ALCOR, EL 03 DE MAYO 13 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41102", slug: "el-viso-del-alcor", name: "El Viso del Alcor", ineName: "Viso del Alcor, El", population: 19458, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-09-13", null)])),
  // BOJA: «SEVILLA > MARCHENA 20 DE ENERO 27 DE MAYO»
  row("AN", "Sevilla", { ine: "41060", slug: "marchena", name: "Marchena", ineName: "Marchena", population: 19405, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-01-20", null), d("2027-05-27", null)])),
  // BOJA: «GRANADA > GUADIX 15 DE MAYO 09 DE SEPTIEMBRE»
  row("AN", "Granada", { ine: "18089", slug: "guadix", name: "Guadix", ineName: "Guadix", population: 18881, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-05-15", null), d("2027-09-09", null)])),
  // BOJA: «ALMERÍA > HUÉRCAL DE ALMERÍA 03 DE MAYO 16 DE JULIO»
  row("AN", "Almería", { ine: "04052", slug: "huercal-de-almeria", name: "Huércal de Almería", ineName: "Huércal de Almería", population: 18660, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-07-16", null)])),
  // BOJA: «CÁDIZ > TARIFA 16 DE JULIO 08 DE SEPTIEMBRE»
  row("AN", "Cádiz", { ine: "11035", slug: "tarifa", name: "Tarifa", ineName: "Tarifa", population: 18613, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-07-16", null), d("2027-09-08", null)])),
  // BOJA: «CÓRDOBA > BAENA 19 DE MARZO 14 DE SEPTIEMBRE»
  row("AN", "Córdoba", { ine: "14007", slug: "baena", name: "Baena", ineName: "Baena", population: 18386, ineTable: 2901, capital: false }, y27(BOJA, [d("2027-03-19", null), d("2027-09-14", null)])),
  // BOJA: «MÁLAGA > MANILVA 16 DE JULIO 06 DE SEPTIEMBRE»
  row("AN", "Málaga", { ine: "29068", slug: "manilva", name: "Manilva", ineName: "Manilva", population: 18165, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-07-16", null), d("2027-09-06", null)])),
  // BOJA: «SEVILLA > LORA DEL RÍO 27 DE MAYO 08 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41055", slug: "lora-del-rio", name: "Lora del Río", ineName: "Lora del Río", population: 18122, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-05-27", null), d("2027-09-08", null)])),
  // BOJA: «SEVILLA > OSUNA 17 DE MAYO 08 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41068", slug: "osuna", name: "Osuna", ineName: "Osuna", population: 17396, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-05-17", null), d("2027-09-08", null)])),
  // BOJA: «JAÉN > BAILEN 19 DE JULIO 05 DE AGOSTO»
  row("AN", "Jaén", { ine: "23010", slug: "bailen", name: "Bailén", ineName: "Bailén", population: 17119, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-07-19", null), d("2027-08-05", null)])),
  // BOJA: «CÓRDOBA > POZOBLANCO 01 DE FEBRERO 07 DE MAYO»
  row("AN", "Córdoba", { ine: "14054", slug: "pozoblanco", name: "Pozoblanco", ineName: "Pozoblanco", population: 16931, ineTable: 2901, capital: false }, y27(BOJA, [d("2027-02-01", null), d("2027-05-07", null)])),
  // BOJA: «GRANADA > CHURRIANA DE LA VEGA 04 DE FEBRERO 08 DE SEPTIEMBRE»
  row("AN", "Granada", { ine: "18062", slug: "churriana-de-la-vega", name: "Churriana de la Vega", ineName: "Churriana de la Vega", population: 16878, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-02-04", null), d("2027-09-08", null)])),
  // BOJA: «SEVILLA > ALGABA, LA 07 DE JUNIO 17 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41007", slug: "la-algaba", name: "La Algaba", ineName: "Algaba, La", population: 16803, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-06-07", null), d("2027-09-17", null)])),
  // BOJA: «CÁDIZ > UBRIQUE 31 DE MAYO 08 DE SEPTIEMBRE»
  row("AN", "Cádiz", { ine: "11038", slug: "ubrique", name: "Ubrique", ineName: "Ubrique", population: 16615, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-05-31", null), d("2027-09-08", null)])),
  // BOJA: «SEVILLA > ESPARTINAS 12 DE MAYO 03 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41040", slug: "espartinas", name: "Espartinas", ineName: "Espartinas", population: 16479, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-05-12", null), d("2027-09-03", null)])),
  // BOJA: «SEVILLA > CABEZAS DE SAN JUAN, LAS 24 DE JUNIO 13 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41020", slug: "las-cabezas-de-san-juan", name: "Las Cabezas de San Juan", ineName: "Cabezas de San Juan, Las", population: 16388, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-06-24", null), d("2027-09-13", null)])),
  // BOJA: «HUELVA > PUNTA UMBRÍA 31 DE MAYO 16 DE JULIO»
  row("AN", "Huelva", { ine: "21060", slug: "punta-umbria", name: "Punta Umbría", ineName: "Punta Umbría", population: 16281, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-05-31", null), d("2027-07-16", null)])),
  // BOJA: «JAÉN > BAEZA 13 DE AGOSTO 30 DE NOVIEMBRE»
  row("AN", "Jaén", { ine: "23009", slug: "baeza", name: "Baeza", ineName: "Baeza", population: 15575, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-08-13", null), d("2027-11-30", null)])),
  // BOJA: «ALMERÍA > CUEVAS DEL ALMANZORA 16 DE JULIO 13 DE NOVIEMBRE»
  row("AN", "Almería", { ine: "04035", slug: "cuevas-del-almanzora", name: "Cuevas del Almanzora", ineName: "Cuevas del Almanzora", population: 15526, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-07-16", null), d("2027-11-13", null)])),
  // BOJA: «GRANADA > SANTA FE 16 DE ABRIL 25 DE NOVIEMBRE»
  row("AN", "Granada", { ine: "18175", slug: "santa-fe", name: "Santa Fe", ineName: "Santa Fe", population: 15494, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-04-16", null), d("2027-11-25", null)])),
  // BOJA: «GRANADA > OGÍJARES 27 DE MAYO 13 DE SEPTIEMBRE»
  row("AN", "Granada", { ine: "18145", slug: "ogijares", name: "Ogíjares", ineName: "Ogíjares", population: 15239, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-05-27", null), d("2027-09-13", null)])),
  // BOJA: «JAÉN > CAROLINA, LA 14 DE MAYO 24 DE NOVIEMBRE»
  row("AN", "Jaén", { ine: "23024", slug: "la-carolina", name: "La Carolina", ineName: "Carolina, La", population: 14677, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-05-14", null), d("2027-11-24", null)])),
  // BOJA: «SEVILLA > SANLÚCAR LA MAYOR 30 DE ABRIL 27 DE MAYO»
  row("AN", "Sevilla", { ine: "41087", slug: "sanlucar-la-mayor", name: "Sanlúcar la Mayor", ineName: "Sanlúcar la Mayor", population: 14648, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-04-30", null), d("2027-05-27", null)])),
  // BOJA: «CÓRDOBA > CARLOTA, LA 15 DE MAYO 17 DE SEPTIEMBRE»
  row("AN", "Córdoba", { ine: "14017", slug: "la-carlota", name: "La Carlota", ineName: "Carlota, La", population: 14503, ineTable: 2901, capital: false }, y27(BOJA, [d("2027-05-15", null), d("2027-09-17", null)])),
  // BOJA: «HUELVA > BOLLULLOS PAR DEL CONDADO 23 DE ENERO 17 DE SEPTIEMBRE»
  row("AN", "Huelva", { ine: "21013", slug: "bollullos-par-del-condado", name: "Bollullos Par del Condado", ineName: "Bollullos Par del Condado", population: 14314, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-01-23", null), d("2027-09-17", null)])),
  // BOJA: «SEVILLA > GUILLENA 29 DE MARZO 08 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41049", slug: "guillena", name: "Guillena", ineName: "Guillena", population: 14260, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-03-29", null), d("2027-09-08", null)])),
  // BOJA: «SEVILLA > PILAS 29 DE MARZO 28 DE JUNIO»
  row("AN", "Sevilla", { ine: "41075", slug: "pilas", name: "Pilas", ineName: "Pilas", population: 14222, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-03-29", null), d("2027-06-28", null)])),
  // BOJA: «JAÉN > TORREDELCAMPO 10 DE JUNIO 26 DE JULIO»
  row("AN", "Jaén", { ine: "23086", slug: "torredelcampo", name: "Torredelcampo", ineName: "Torredelcampo", population: 13888, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-06-10", null), d("2027-07-26", null)])),
  // BOJA: «MÁLAGA > ÁLORA 06 DE AGOSTO 08 DE SEPTIEMBRE»
  row("AN", "Málaga", { ine: "29012", slug: "alora", name: "Álora", ineName: "Álora", population: 13650, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-08-06", null), d("2027-09-08", null)])),
  // BOJA: «SEVILLA > GINES 12 DE MAYO 27 DE MAYO»
  row("AN", "Sevilla", { ine: "41047", slug: "gines", name: "Gines", ineName: "Gines", population: 13634, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-05-12", null), d("2027-05-27", null)])),
  // BOJA: «HUELVA > GIBRALEÓN 10 DE MAYO 18 DE OCTUBRE»
  row("AN", "Huelva", { ine: "21035", slug: "gibraleon", name: "Gibraleón", ineName: "Gibraleón", population: 13261, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-05-10", null), d("2027-10-18", null)])),
  // BOJA: «JAÉN > TORREDONJIMENO 29 DE JUNIO 08 DE SEPTIEMBRE»
  row("AN", "Jaén", { ine: "23087", slug: "torredonjimeno", name: "Torredonjimeno", ineName: "Torredonjimeno", population: 13213, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-06-29", null), d("2027-09-08", null)])),
  // BOJA: «CÁDIZ > VEJER DE LA FRONTERA 09 DE ABRIL 07 DE MAYO»
  row("AN", "Cádiz", { ine: "11039", slug: "vejer-de-la-frontera", name: "Vejer de la Frontera", ineName: "Vejer de la Frontera", population: 13131, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-04-09", null), d("2027-05-07", null)])),
  // BOJA: «CÓRDOBA > AGUILAR DE LA FRONTERA 09 DE AGOSTO 08 DE SEPTIEMBRE»
  row("AN", "Córdoba", { ine: "14002", slug: "aguilar-de-la-frontera", name: "Aguilar de la Frontera", ineName: "Aguilar de la Frontera", population: 13130, ineTable: 2901, capital: false }, y27(BOJA, [d("2027-08-09", null), d("2027-09-08", null)])),
  // BOJA: «ALMERÍA > BERJA 30 DE JULIO 08 DE SEPTIEMBRE»
  row("AN", "Almería", { ine: "04029", slug: "berja", name: "Berja", ineName: "Berja", population: 13120, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-07-30", null), d("2027-09-08", null)])),
  // BOJA: «SEVILLA > BRENES 27 DE MAYO 08 DE OCTUBRE»
  row("AN", "Sevilla", { ine: "41018", slug: "brenes", name: "Brenes", ineName: "Brenes", population: 12975, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-05-27", null), d("2027-10-08", null)])),
  // BOJA: «HUELVA > PALOS DE LA FRONTERA 15 DE MARZO 13 DE AGOSTO»
  row("AN", "Huelva", { ine: "21055", slug: "palos-de-la-frontera", name: "Palos de la Frontera", ineName: "Palos de la Frontera", population: 12938, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-03-15", null), d("2027-08-13", null)])),
  // BOJA: «ALMERÍA > ALBOX 08 DE SEPTIEMBRE 29 DE OCTUBRE»
  row("AN", "Almería", { ine: "04006", slug: "albox", name: "Albox", ineName: "Albox", population: 12799, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-09-08", null), d("2027-10-29", null)])),
  // BOJA: «GRANADA > SALOBREÑA 24 DE JUNIO 7 DE OCTUBRE»
  row("AN", "Granada", { ine: "18173", slug: "salobrena", name: "Salobreña", ineName: "Salobreña", population: 12760, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-06-24", null), d("2027-10-07", null)])),
  // BOJA: «HUELVA > VALVERDE DEL CAMINO 13 DE AGOSTO 11 DE SEPTIEMBRE»
  row("AN", "Huelva", { ine: "21072", slug: "valverde-del-camino", name: "Valverde del Camino", ineName: "Valverde del Camino", population: 12631, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-08-13", null), d("2027-09-11", null)])),
  // BOJA: «SEVILLA > ESTEPA 17 DE MAYO 03 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41041", slug: "estepa", name: "Estepa", ineName: "Estepa", population: 12430, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-05-17", null), d("2027-09-03", null)])),
  // BOJA: «GRANADA > VEGAS DEL GENIL 19 DE MARZO 23 DE ABRIL»
  row("AN", "Granada", { ine: "18911", slug: "vegas-del-genil", name: "Vegas del Genil", ineName: "Vegas del Genil", population: 12424, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-03-19", null), d("2027-04-23", null)])),
  // BOJA: «SEVILLA > ALCALÁ DEL RÍO 09 DE SEPTIEMBRE 10 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41005", slug: "alcala-del-rio", name: "Alcalá del Río", ineName: "Alcalá del Río", population: 12335, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-09-09", null), d("2027-09-10", null)])),
  // BOJA: «GRANADA > HUÉTOR VEGA 03 DE MAYO 28 DE MAYO»
  row("AN", "Granada", { ine: "18101", slug: "huetor-vega", name: "Huétor Vega", ineName: "Huétor Vega", population: 12285, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-05-28", null)])),
  // BOJA: «ALMERÍA > PULPÍ 04 DE MARZO 29 DE SEPTIEMBRE»
  row("AN", "Almería", { ine: "04075", slug: "pulpi", name: "Pulpí", ineName: "Pulpí", population: 12214, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-03-04", null), d("2027-09-29", null)])),
  // BOJA: «CÁDIZ > VILLAMARTIN 08 DE SEPTIEMBRE 27 DE SEPTIEMBRE»
  row("AN", "Cádiz", { ine: "11041", slug: "villamartin", name: "Villamartín", ineName: "Villamartín", population: 12184, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-09-08", null), d("2027-09-27", null)])),
  // BOJA: «SEVILLA > PUEBLA DEL RÍO, LA 20 DE ENERO 27 DE MAYO»
  row("AN", "Sevilla", { ine: "41079", slug: "la-puebla-del-rio", name: "La Puebla del Río", ineName: "Puebla del Río, La", population: 11903, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-01-20", null), d("2027-05-27", null)])),
  // BOJA: «CÁDIZ > MEDINA SIDONIA 25 DE ENERO 31 DE MAYO»
  row("AN", "Cádiz", { ine: "11023", slug: "medina-sidonia", name: "Medina Sidonia", ineName: "Medina Sidonia", population: 11838, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-01-25", null), d("2027-05-31", null)])),
  // BOJA: «GRANADA > PELIGROS 25 DE ENERO 25 DE MAYO»
  row("AN", "Granada", { ine: "18153", slug: "peligros", name: "Peligros", ineName: "Peligros", population: 11725, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-01-25", null), d("2027-05-25", null)])),
  // BOJA: «JAÉN > MANCHA REAL 26 DE ABRIL 07 DE OCTUBRE»
  row("AN", "Jaén", { ine: "23058", slug: "mancha-real", name: "Mancha Real", ineName: "Mancha Real", population: 11481, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-04-26", null), d("2027-10-07", null)])),
  // BOJA: «SEVILLA > BOLLULLOS DE LA MITACIÓN 17 DE SEPTIEMBRE 25 DE OCTUBRE»
  row("AN", "Sevilla", { ine: "41016", slug: "bollullos-de-la-mitacion", name: "Bollullos de la Mitación", ineName: "Bollullos de la Mitación", population: 11431, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-09-17", null), d("2027-10-25", null)])),
  // BOJA: «JAÉN > JÓDAR 03 DE MAYO 14 DE SEPTIEMBRE»
  row("AN", "Jaén", { ine: "23053", slug: "jodar", name: "Jódar", ineName: "Jódar", population: 11285, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-09-14", null)])),
  // BOJA: «ALMERÍA > GARRUCHA 24 DE JUNIO 16 DE JULIO»
  row("AN", "Almería", { ine: "04049", slug: "garrucha", name: "Garrucha", ineName: "Garrucha", population: 10845, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-06-24", null), d("2027-07-16", null)])),
  // BOJA: «HUELVA > PALMA DEL CONDADO, LA 17 DE SEPTIEMBRE 20 DE SEPTIEMBRE»
  row("AN", "Huelva", { ine: "21054", slug: "la-palma-del-condado", name: "La Palma del Condado", ineName: "Palma del Condado, La", population: 10841, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-09-17", null), d("2027-09-20", null)])),
  // BOJA: «SEVILLA > PUEBLA DE CAZALLA, LA 05 DE ENERO 13 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41077", slug: "la-puebla-de-cazalla", name: "La Puebla de Cazalla", ineName: "Puebla de Cazalla, La", population: 10830, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-01-05", null), d("2027-09-13", null)])),
  // BOJA: «SEVILLA > CANTILLANA 19 DE MARZO 08 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41023", slug: "cantillana", name: "Cantillana", ineName: "Cantillana", population: 10780, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-03-19", null), d("2027-09-08", null)])),
  // BOJA: «GRANADA > HUÉTOR TÁJAR 17 DE MAYO 13 DE SEPTIEMBRE»
  row("AN", "Granada", { ine: "18100", slug: "huetor-tajar", name: "Huétor Tájar", ineName: "Huétor Tájar", population: 10749, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-05-17", null), d("2027-09-13", null)])),
  // BOJA: «SEVILLA > GELVES 16 DE ABRIL 30 DE AGOSTO»
  row("AN", "Sevilla", { ine: "41044", slug: "gelves", name: "Gelves", ineName: "Gelves", population: 10548, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-04-16", null), d("2027-08-30", null)])),
  // BOJA: «GRANADA > ALHENDÍN 27 DE MAYO 23 DE AGOSTO»
  row("AN", "Granada", { ine: "18014", slug: "alhendin", name: "Alhendín", ineName: "Alhendín", population: 10475, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-05-27", null), d("2027-08-23", null)])),
  // BOJA: «JAÉN > VILLACARRILLO 03 DE MAYO 07 DE OCTUBRE»
  row("AN", "Jaén", { ine: "23095", slug: "villacarrillo", name: "Villacarrillo", ineName: "Villacarrillo", population: 10342, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-10-07", null)])),
  // BOJA: «MÁLAGA > PIZARRA 19 DE ENERO 19 DE AGOSTO»
  row("AN", "Málaga", { ine: "29080", slug: "pizarra", name: "Pizarra", ineName: "Pizarra", population: 10334, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-01-19", null), d("2027-08-19", null)])),
  // BOJA: «JAÉN > MENGÍBAR 03 DE MAYO 22 DE JULIO»
  row("AN", "Jaén", { ine: "23061", slug: "mengibar", name: "Mengíbar", ineName: "Mengíbar", population: 10250, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-07-22", null)])),
  // BOJA: «CÓRDOBA > PEÑARROYA-PUEBLONUEVO 07 DE OCTUBRE 04 DE DICIEMBRE»
  row("AN", "Córdoba", { ine: "14052", slug: "penarroya-pueblonuevo", name: "Peñarroya-Pueblonuevo", ineName: "Peñarroya-Pueblonuevo", population: 10244, ineTable: 2901, capital: false }, y27(BOJA, [d("2027-10-07", null), d("2027-12-04", null)])),
  // BOJA: «JAÉN > ALCAUDETE 16 DE SEPTIEMBRE 17 DE SEPTIEMBRE»
  row("AN", "Jaén", { ine: "23003", slug: "alcaudete", name: "Alcaudete", ineName: "Alcaudete", population: 10129, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-09-16", null), d("2027-09-17", null)])),
];

const ASTURIAS: CityRow[] = [
  // BOPA: «CORVERA DE ASTURIAS | 24 de junio Fiesta de San Juan | 10 de septiembre Fiestas Populares de Corvera de Asturias»
  row("AS", "Asturias", { ine: "33020", slug: "corvera-de-asturias", name: "Corvera de Asturias", ineName: "Corvera de Asturias", population: 15785, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-06-24", "Fiesta de San Juan"), d("2027-09-10", "Fiestas Populares de Corvera de Asturias")])),
  // BOPA: «SAN MARTÍN DEL REY AURELIO | 9 de febrero Martes de Carnaval en todo el Concejo | 11 de noviembre San “Martín” Patrono del Concejo y fiesta gastronómica de “Los Nabos” en las parroquias de San Martín, Santa Bárbara y Blimea | 30 de noviembre “San Andrés” y Fiesta Gastronómica “Les Cebolles Rellenes” en las parroquias de San Andrés en L’Entregu/El Entrego y Cocañín en la Güeria»
  row("AS", "Asturias", { ine: "33060", slug: "san-martin-del-rey-aurelio", name: "San Martín del Rey Aurelio", ineName: "San Martín del Rey Aurelio", population: 15531, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-02-09", "Martes de Carnaval"), d("2027-11-11", "San Martín, patrono del concejo, y fiesta gastronómica de Los Nabos")], { mainArea: "Parroquias de San Martín, Santa Bárbara y Blimea", zones: [{ place: "Parroquias de San Andrés (L'Entregu/El Entrego) y Cocañín (La Güeria)", days: [d("2027-02-09", "Martes de Carnaval"), d("2027-11-30", "San Andrés y fiesta gastronómica Les Cebolles Rellenes")] }] })),
  // BOPA: «VILLAVICIOSA | 13 de septiembre Fiestas Patronales Nuestra Señora del Portal | 15 de septiembre Fiestas Patronales Nuestra Señora del Portal»
  row("AS", "Asturias", { ine: "33076", slug: "villaviciosa", name: "Villaviciosa", ineName: "Villaviciosa", population: 15379, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-09-13", "Fiestas Patronales Nuestra Señora del Portal"), d("2027-09-15", "Fiestas Patronales Nuestra Señora del Portal")])),
  // BOPA: «LLANERA | 9 de febrero Festividad del Antroxu | 15 de mayo Festividad de San Isidro Labrador»
  row("AS", "Asturias", { ine: "33035", slug: "llanera", name: "Llanera", ineName: "Llanera", population: 14020, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-02-09", "Festividad del Antroxu"), d("2027-05-15", "Festividad de San Isidro Labrador")])),
  // BOPA: «LAVIANA | 9 de febrero Martes de Carnaval | 24 de junio San Juan»
  row("AS", "Asturias", { ine: "33032", slug: "laviana", name: "Laviana", ineName: "Laviana", population: 12352, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-02-09", "Martes de Carnaval"), d("2027-06-24", "San Juan")])),
  // BOPA: «CANGAS DEL NARCEA | 16 de julio Fiesta de El Carmen | 22 de julio Fiesta de La Magdalena»
  row("AS", "Asturias", { ine: "33011", slug: "cangas-del-narcea", name: "Cangas del Narcea", ineName: "Cangas del Narcea", population: 11282, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-07-16", "Fiesta de El Carmen"), d("2027-07-22", "Fiesta de La Magdalena")])),
  // BOPA: «VALDÉS | 21 de mayo Día del Fuero de Valdés, en todo el Concejo, excepto en Trevías | 23 de agosto Festividad de San Timoteo en todo el Concejo | 29 de septiembre Festividad de San Miguel, solamente en la Parroquia Rural de Trevías»
  row("AS", "Asturias", { ine: "33034", slug: "valdes", name: "Valdés", ineName: "Valdés", population: 10776, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-05-21", "Día del Fuero de Valdés"), d("2027-08-23", "Festividad de San Timoteo")], { mainArea: "Todo el concejo salvo Trevías", zones: [{ place: "Parroquia rural de Trevías", days: [d("2027-08-23", "Festividad de San Timoteo"), d("2027-09-29", "Festividad de San Miguel")] }] })),
  // BOPA: «GOZÓN | 5 de febrero Fiesta del Cristo del Socorro | 16 de julio Festividad de la Virgen del Carmen»
  row("AS", "Asturias", { ine: "33025", slug: "gozon", name: "Gozón", ineName: "Gozón", population: 10407, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-02-05", "Fiesta del Cristo del Socorro"), d("2027-07-16", "Festividad de la Virgen del Carmen")])),
  // BOPA: «LENA | 5 de abril Festividad de la Flor | 11 de octubre Festividad de Las Ferias»
  row("AS", "Asturias", { ine: "33033", slug: "lena", name: "Lena", ineName: "Lena", population: 10382, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-04-05", "Festividad de la Flor"), d("2027-10-11", "Festividad de Las Ferias")])),
  // BOPA: «CARREÑO | 2 de agosto Festividad de San Félix | 14 de septiembre Festividad del Santísimo Cristo de Candás»
  row("AS", "Asturias", { ine: "33014", slug: "carreno", name: "Carreño", ineName: "Carreño", population: 10292, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-08-02", "Festividad de San Félix"), d("2027-09-14", "Festividad del Santísimo Cristo de Candás")])),
  // BOPA: «ALLER | 11 de noviembre Festividad de San Martín | 26 de noviembre Festividad del Mercaón de Cabañaquinta»
  row("AS", "Asturias", { ine: "33002", slug: "aller", name: "Aller", ineName: "Aller", population: 10011, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-11-11", "Festividad de San Martín"), d("2027-11-26", "Festividad del Mercaón de Cabañaquinta")])),
];

const BALEARES: CityRow[] = [
  // BOIB: «Felanitx | Felanitx 20 de julio Santa Margarita / 28 de agosto San Agustín | Cala Ferrera 18 de enero Lunes de San Antonio / 15 de mayo San Isidro | Cas Concos 18 de enero Lunes de San Antonio / 10 de septiembre San Nicolás | Portocolom 16 de julio Virgen del Carmen / 26 de julio Lunes de San Jaime | S'Horta 15 de mayo San Isidro / 17 de mayo Lunes de Pentecostés»
  row("IB", "Illes Balears", { ine: "07022", slug: "felanitx", name: "Felanitx", ineName: "Felanitx", population: 19146, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-07-20", "Santa Margarita"), d("2027-08-28", "San Agustín")], { mainArea: "Felanitx", zones: [{ place: "Cala Ferrera", days: [d("2027-01-18", "Lunes de San Antonio"), d("2027-05-15", "San Isidro")] }, { place: "Cas Concos", days: [d("2027-01-18", "Lunes de San Antonio"), d("2027-09-10", "San Nicolás")] }, { place: "Portocolom", days: [d("2027-07-16", "Virgen del Carmen"), d("2027-07-26", "Lunes de San Jaime")] }, { place: "S'Horta", days: [d("2027-05-15", "San Isidro"), d("2027-05-17", "Lunes de Pentecostés")] }] })),
  // BOIB: «Pollença 29 de junio San Pedro | 2 de agosto Virgen de los Ángeles»
  row("IB", "Illes Balears", { ine: "07042", slug: "pollenca", name: "Pollença", ineName: "Pollença", population: 17807, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-06-29", "San Pedro"), d("2027-08-02", "Virgen de los Ángeles")])),
  // BOIB: «Sa Pobla 30 de marzo Día de Crestatx | 20 de julio Santa Margarita»
  row("IB", "Illes Balears", { ine: "07044", slug: "sa-pobla", name: "Sa Pobla", ineName: "Pobla, Sa", population: 14990, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-03-30", "Día de Crestatx"), d("2027-07-20", "Santa Margarita")])),
  // BOIB: «Santa Margalida | Santa Margalida 20 de julio Santa Margarita / 6 de septiembre Lunes de la Beata | Can Picafort 6 de septiembre Lunes de la Beata / 7 de diciembre | Son Serra de Marina 20 de julio Santa Margarita / 6 de septiembre Lunes de la Beata»
  row("IB", "Illes Balears", { ine: "07055", slug: "santa-margalida", name: "Santa Margalida", ineName: "Santa Margalida", population: 14056, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-07-20", "Santa Margarita"), d("2027-09-06", "Lunes de la Beata")], { mainArea: "Santa Margalida", zones: [{ place: "Can Picafort", days: [d("2027-09-06", "Lunes de la Beata"), d("2027-12-07", null)] }, { place: "Son Serra de Marina", days: [d("2027-07-20", "Santa Margarita"), d("2027-09-06", "Lunes de la Beata")] }] })),
  // BOIB: «Sóller 10 de mayo Firó | 24 de agosto San Bartolomé»
  row("IB", "Illes Balears", { ine: "07061", slug: "soller", name: "Sóller", ineName: "Sóller", population: 13882, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-05-10", "Firó"), d("2027-08-24", "San Bartolomé")])),
  // BOIB: «Capdepera 16 de julio Virgen del Carmen | 24 de agosto San Bartolomé»
  row("IB", "Illes Balears", { ine: "07014", slug: "capdepera", name: "Capdepera", ineName: "Capdepera", population: 13135, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-07-16", "Virgen del Carmen"), d("2027-08-24", "San Bartolomé")])),
  // BOIB: «Santanyí | Santanyí 2 de marzo / 30 de noviembre San Andrés | Cala d'Or 2 de marzo / 24 de junio San Juan | Cala Figuera 2 de marzo / 30 de noviembre San Andrés | Calonge 2 de marzo / 29 de septiembre San Miguel Arcángel | Es Llombards 2 de marzo / 6 de agosto | Portopetro 19 de marzo / 24 de junio San Juan | S'Alqueria Blanca 19 de marzo San José / 16 de agosto»
  row("IB", "Illes Balears", { ine: "07057", slug: "santanyi", name: "Santanyí", ineName: "Santanyí", population: 13067, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-03-02", null), d("2027-11-30", "San Andrés")], { mainArea: "Santanyí", zones: [{ place: "Cala d'Or", days: [d("2027-03-02", null), d("2027-06-24", "San Juan")] }, { place: "Cala Figuera", days: [d("2027-03-02", null), d("2027-11-30", "San Andrés")] }, { place: "Calonge", days: [d("2027-03-02", null), d("2027-09-29", "San Miguel Arcángel")] }, { place: "Es Llombards", days: [d("2027-03-02", null), d("2027-08-06", null)] }, { place: "Portopetro", days: [d("2027-03-19", null), d("2027-06-24", "San Juan")] }, { place: "S'Alqueria Blanca", days: [d("2027-03-19", "San José"), d("2027-08-16", null)] }] })),
  // BOIB: «Campos 9 de enero San Julián y Santa Basilisa | 21 de octubre Fira»
  row("IB", "Illes Balears", { ine: "07013", slug: "campos", name: "Campos", ineName: "Campos", population: 12485, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-01-09", "San Julián y Santa Basilisa"), d("2027-10-21", "Fira")])),
  // BOIB: «Son Servera 1 de febrero San Ignacio | 24 de junio San Juan»
  row("IB", "Illes Balears", { ine: "07062", slug: "son-servera", name: "Son Servera", ineName: "Son Servera", population: 12417, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-02-01", "San Ignacio"), d("2027-06-24", "San Juan")])),
  // BOIB: «Andratx | Andratx 29 de junio / 2 de agosto | Port d'Andratx 16 de julio Virgen del Carmen / 2 de agosto | S'Arracó 2 de agosto / 28 de agosto San Agustín»
  row("IB", "Illes Balears", { ine: "07005", slug: "andratx", name: "Andratx", ineName: "Andratx", population: 12195, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-06-29", null), d("2027-08-02", null)], { mainArea: "Andratx", zones: [{ place: "Port d'Andratx", days: [d("2027-07-16", "Virgen del Carmen"), d("2027-08-02", null)] }, { place: "S'Arracó", days: [d("2027-08-02", null), d("2027-08-28", "San Agustín")] }] })),
  // BOIB: «2.4. Isla de Formentera ... Formentera 25 de julio San Jaime | 3 de diciembre San Francisco Javier»
  row("IB", "Illes Balears", { ine: "07024", slug: "formentera", name: "Formentera", ineName: "Formentera", population: 11661, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-07-25", "San Jaime"), d("2027-12-03", "San Francisco Javier")])),
  // BOIB: «2.2. Isla de Menorca ... Alaior 9 de febrero Martes de Carnaval | 29 de abril Día de la fundación de Alaior»
  row("IB", "Illes Balears", { ine: "07002", slug: "alaior", name: "Alaior", ineName: "Alaior", population: 10217, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-02-09", "Martes de Carnaval"), d("2027-04-29", "Día de la fundación de Alaior")])),
];

const CANARIAS: CityRow[] = [
  // BOC: «SAN BARTOLOMÉ. 9 de febrero: Martes de Carnaval. 24 de agosto: Festividad de San Bartolomé.»
  row("CN", "Las Palmas", { ine: "35018", slug: "san-bartolome", name: "San Bartolomé", ineName: "San Bartolomé", population: 19551, ineTable: 2889, capital: false, island: "Lanzarote y La Graciosa" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-08-24", "Festividad de San Bartolomé")])),
  // BOC: «YAIZA. 7 de julio: Festividad de San Marcial del Rubicón. 8 de septiembre: Festividad de Nuestra Señora de los Remedios.»
  row("CN", "Las Palmas", { ine: "35034", slug: "yaiza", name: "Yaiza", ineName: "Yaiza", population: 18842, ineTable: 2889, capital: false, island: "Lanzarote y La Graciosa" }, y27(BOC_CANARIAS, [d("2027-07-07", "Festividad de San Marcial del Rubicón"), d("2027-09-08", "Festividad de Nuestra Señora de los Remedios")])),
  // BOC: «SANTA BRÍGIDA. 9 de febrero: Martes de Carnaval. 14 de junio: Lunes siguiente a la Festividad de San Antonio de Padua.»
  row("CN", "Las Palmas", { ine: "35021", slug: "santa-brigida", name: "Santa Brígida", ineName: "Santa Brígida", population: 18766, ineTable: 2889, capital: false, island: "Gran Canaria" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-06-14", "Lunes siguiente a la Festividad de San Antonio de Padua")])),
  // BOC: «EL ROSARIO. 23 de febrero: Festividad Local de Santa Cruz de Tenerife. 2 de agosto: Festividad de Nuestra Señora de La Esperanza.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38032", slug: "el-rosario", name: "El Rosario", ineName: "Rosario, El", population: 17958, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-02-23", "Festividad Local de Santa Cruz de Tenerife"), d("2027-08-02", "Festividad de Nuestra Señora de La Esperanza")])),
  // BOC: «TUINEJE. 13 de octubre: Fiestas juradas en honor a San Miguel Arcángel y Conmemoración de las batallas del Cuchillete y Tamasite. 13 de noviembre: Festividad de San Diego.»
  row("CN", "Las Palmas", { ine: "35030", slug: "tuineje", name: "Tuineje", ineName: "Tuineje", population: 16834, ineTable: 2889, capital: false, island: "Fuerteventura" }, y27(BOC_CANARIAS, [d("2027-10-13", "Fiestas juradas en honor a San Miguel Arcángel y Conmemoración de las batallas del Cuchillete y Tamasite"), d("2027-11-13", "Festividad de San Diego")])),
  // BOC: «SANTA CRUZ DE LA PALMA. 9 de febrero: Martes de Carnaval. 3 de mayo: Festividad de la Santa Cruz.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38037", slug: "santa-cruz-de-la-palma", name: "Santa Cruz de la Palma", ineName: "Santa Cruz de la Palma", population: 15690, ineTable: 2892, capital: false, island: "La Palma" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-05-03", "Festividad de la Santa Cruz")])),
  // BOC: «SANTA ÚRSULA. 23 de febrero: Martes de Carnaval. 21 de octubre: Festividad de Santa Úrsula.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38039", slug: "santa-ursula", name: "Santa Úrsula", ineName: "Santa Úrsula", population: 15429, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-02-23", "Martes de Carnaval"), d("2027-10-21", "Festividad de Santa Úrsula")])),
  // BOC: «SANTA MARÍA DE GUÍA DE GRAN CANARIA. 19 de marzo: Festividad de San José. 20 de septiembre: Lunes posterior a la Festividad de Las Marías.»
  row("CN", "Las Palmas", { ine: "35023", slug: "santa-maria-de-guia-de-gran-canaria", name: "Santa María de Guía de Gran Canaria", short: "Santa María de Guía", ineName: "Santa María de Guía de Gran Canaria", population: 14311, ineTable: 2889, capital: false, island: "Gran Canaria" }, y27(BOC_CANARIAS, [d("2027-03-19", "Festividad de San José"), d("2027-09-20", "Lunes posterior a la Festividad de Las Marías")])),
  // BOC: «ANTIGUA. 1 de febrero: Carnavales. 8 de septiembre: Festividad de Nuestra Señora de Antigua.»
  row("CN", "Las Palmas", { ine: "35003", slug: "antigua", name: "Antigua", ineName: "Antigua", population: 14164, ineTable: 2889, capital: false, island: "Fuerteventura" }, y27(BOC_CANARIAS, [d("2027-02-01", "Carnavales"), d("2027-09-08", "Festividad de Nuestra Señora de Antigua")])),
  // BOC: «TEROR. 9 de febrero: Martes de Carnaval. 4 de junio: Festividad del Sagrado Corazón de Jesús.»
  row("CN", "Las Palmas", { ine: "35027", slug: "teror", name: "Teror", ineName: "Teror", population: 13211, ineTable: 2889, capital: false, island: "Gran Canaria" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-06-04", "Festividad del Sagrado Corazón de Jesús")])),
  // BOC: «SANTIAGO DEL TEIDE. 16 de julio: Festividad de Nuestra Señora de la Virgen del Carmen. 26 de julio: Festividad de Santa Ana.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38040", slug: "santiago-del-teide", name: "Santiago del Teide", ineName: "Santiago del Teide", population: 12582, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-07-16", "Festividad de Nuestra Señora de la Virgen del Carmen"), d("2027-07-26", "Festividad de Santa Ana")])),
  // BOC: «TEGUESTE. 26 de abril: Festividad de San Marcos Evangelista. 8 de septiembre: Festividad de Nuestra Señora de los Remedios.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38046", slug: "tegueste", name: "Tegueste", ineName: "Tegueste", population: 11490, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-04-26", "Festividad de San Marcos Evangelista"), d("2027-09-08", "Festividad de Nuestra Señora de los Remedios")])),
];

const CANTABRIA: CityRow[] = [
  // BOC: «EL ASTILLERO | SAN JOSE | 19 | MARZO; SAN PEDRO | 29 | JUNIO»
  row("CB", "Cantabria", { ine: "39008", slug: "el-astillero", name: "El Astillero", ineName: "Astillero, El", population: 18448, ineTable: 2893, capital: false }, y27(BOC_CB, [d("2027-03-19", "San José"), d("2027-06-29", "San Pedro")])),
  // BOC: «SANTA CRUZ DE BEZANA | SANTA CRUZ | 03 | MAYO; SAN JUDAS TADEO | 11 | SEPTIEMBRE»
  row("CB", "Cantabria", { ine: "39073", slug: "santa-cruz-de-bezana", name: "Santa Cruz de Bezana", ineName: "Santa Cruz de Bezana", population: 13904, ineTable: 2893, capital: false }, y27(BOC_CB, [d("2027-05-03", "Santa Cruz"), d("2027-09-11", "San Judas Tadeo")])),
  // BOC: «LOS CORRALES DE BUELNA | SAN JUAN | 24 | JUNIO; VIRGEN DE LA RUEDA | 05 | AGOSTO»
  row("CB", "Cantabria", { ine: "39025", slug: "los-corrales-de-buelna", name: "Los Corrales de Buelna", ineName: "Corrales de Buelna, Los", population: 10958, ineTable: 2893, capital: false }, y27(BOC_CB, [d("2027-06-24", "San Juan"), d("2027-08-05", "Virgen de la Rueda")])),
  // BOC: «SANTOÑA | VIERNES DE CARNAVAL | 05 | FEBRERO; NTRA. SRA. DE LA VIRGEN DEL PUERTO | 08 | SEPTIEMBRE»
  row("CB", "Cantabria", { ine: "39079", slug: "santona", name: "Santoña", ineName: "Santoña", population: 10835, ineTable: 2893, capital: false }, y27(BOC_CB, [d("2027-02-05", "Viernes de Carnaval"), d("2027-09-08", "Ntra. Sra. de la Virgen del Puerto")])),
  // BOC: «LAREDO | BATALLA DE LAS FLORES | 27 | AGOSTO; EL ÚLTIMO DESEMBARCO DE CARLOS V | 17 | SEPTIEMBRE»
  row("CB", "Cantabria", { ine: "39035", slug: "laredo", name: "Laredo", ineName: "Laredo", population: 10698, ineTable: 2893, capital: false }, y27(BOC_CB, [d("2027-08-27", "Batalla de las Flores"), d("2027-09-17", "El Último Desembarco de Carlos V")])),
];

const CASTILLA_Y_LEON: CityRow[] = [
  // BOP de Salamanca: «SANTA MARTA DE TORMES 3 de febrero y 29 de julio»
  row("CL", "Salamanca", { ine: "37294", slug: "santa-marta-de-tormes", name: "Santa Marta de Tormes", ineName: "Santa Marta de Tormes", population: 14976, ineTable: 2891, capital: false }, y27(BOP_SALAMANCA, [d("2027-02-03", null), d("2027-07-29", null)])),
  // BOP de Salamanca: «BÉJAR 7 de septiembre y 8 de septiembre»
  row("CL", "Salamanca", { ine: "37046", slug: "bejar", name: "Béjar", ineName: "Béjar", population: 11993, ineTable: 2891, capital: false }, y27(BOP_SALAMANCA, [d("2027-09-07", null), d("2027-09-08", null)])),
  // BOP de Salamanca: «CIUDAD RODRIGO 20 de enero y 8 de septiembre»
  row("CL", "Salamanca", { ine: "37107", slug: "ciudad-rodrigo", name: "Ciudad Rodrigo", ineName: "Ciudad Rodrigo", population: 11750, ineTable: 2891, capital: false }, y27(BOP_SALAMANCA, [d("2027-01-20", null), d("2027-09-08", null)])),
  // BOP de Segovia: «ESPINAR (EL) | 30.04.2027 | Fiesta Local | 14.09.2027 | Fiesta Local / - SAN RAFAEL | 30.07.2027 | Fiesta Local | 29.09.2027 | Fiesta Local / - LA ESTACIÓN DEL ESPINAR | 11.06.2027 | Fiesta Local | 16.07.2027 | Fiesta Local»
  row("CL", "Segovia", { ine: "40076", slug: "el-espinar", name: "El Espinar", ineName: "Espinar, El", population: 10409, ineTable: 2894, capital: false }, y27(BOP_SEGOVIA, [d("2027-04-30", null), d("2027-09-14", null)], { mainArea: "El Espinar", zones: [{ place: "San Rafael", days: [d("2027-07-30", null), d("2027-09-29", null)] }, { place: "La Estación del Espinar", days: [d("2027-06-11", null), d("2027-07-16", null)] }] })),
  // (read from the page image (the PDF's annex text layer is not extractable))
  // BOP de León: «BAÑEZA (LA): 9 de febrero, Carnaval Bañezano y 17 de agosto, San Roque (por traslado del día 16 de agosto)»
  row("CL", "León", { ine: "24010", slug: "la-baneza", name: "La Bañeza", ineName: "Bañeza, La", population: 10195, ineTable: 2877, capital: false }, y27(BOP_LEON, [d("2027-02-09", "Carnaval Bañezano"), d("2027-08-17", "San Roque")])),
];

const EXTREMADURA: CityRow[] = [
  // DOE: «NAVALMORAL DE LA MATA. 9 de febrero y 10 de febrero.»
  row("EX", "Cáceres", { ine: "10131", slug: "navalmoral-de-la-mata", name: "Navalmoral de la Mata", ineName: "Navalmoral de la Mata", population: 17352, ineTable: 2863, capital: false }, y27(DOE, [d("2027-02-09", null), d("2027-02-10", null)])),
  // DOE: «ZAFRA. 15 de mayo y 5 de octubre.»
  row("EX", "Badajoz", { ine: "06158", slug: "zafra", name: "Zafra", ineName: "Zafra", population: 16735, ineTable: 2859, capital: false }, y27(DOE, [d("2027-05-15", null), d("2027-10-05", null)])),
  // DOE: «MONTIJO. 15 de mayo y 9 de septiembre.»
  row("EX", "Badajoz", { ine: "06088", slug: "montijo", name: "Montijo", ineName: "Montijo", population: 15198, ineTable: 2859, capital: false }, y27(DOE, [d("2027-05-15", null), d("2027-09-09", null)])),
  // DOE: «VILLAFRANCA DE LOS BARROS. 14 de mayo y 16 de julio.»
  row("EX", "Badajoz", { ine: "06149", slug: "villafranca-de-los-barros", name: "Villafranca de los Barros", ineName: "Villafranca de los Barros", population: 12284, ineTable: 2859, capital: false }, y27(DOE, [d("2027-05-14", null), d("2027-07-16", null)])),
  // DOE: «CORIA. 10 de mayo y 24 de junio.»
  row("EX", "Cáceres", { ine: "10067", slug: "coria", name: "Coria", ineName: "Coria", population: 12001, ineTable: 2863, capital: false }, y27(DOE, [d("2027-05-10", null), d("2027-06-24", null)])),
  // DOE: «OLIVENZA. 13 de agosto y 9 de septiembre.»
  row("EX", "Badajoz", { ine: "06095", slug: "olivenza", name: "Olivenza", ineName: "Olivenza", population: 11789, ineTable: 2859, capital: false }, y27(DOE, [d("2027-08-13", null), d("2027-09-09", null)])),
];

const GALICIA: CityRow[] = [
  // DOG: «29. Moaña: 16 de julio, festividad del Carmen; 11 de noviembre, San Martín.»
  row("GA", "Pontevedra", { ine: "36029", slug: "moana", name: "Moaña", ineName: "Moaña", population: 19320, ineTable: 2890, capital: false }, y27(DOG, [d("2027-07-16", "Festividad del Carmen"), d("2027-11-11", "San Martín")])),
  // DOG: «82. Teo: 6 de mayo, La Ascensión; 11 de noviembre, San Martín.»
  row("GA", "A Coruña", { ine: "15082", slug: "teo", name: "Teo", ineName: "Teo", population: 18968, ineTable: 2868, capital: false }, y27(DOG, [d("2027-05-06", "La Ascensión"), d("2027-11-11", "San Martín")])),
  // DOG: «11. Boiro: 16 de julio, festividad del Carmen; 31 de agosto, festividad de San Ramón.»
  row("GA", "A Coruña", { ine: "15011", slug: "boiro", name: "Boiro", ineName: "Boiro", population: 18967, ineTable: 2868, capital: false }, y27(DOG, [d("2027-07-16", "Festividad del Carmen"), d("2027-08-31", "Festividad de San Ramón")])),
  // DOG: «31. Monforte de Lemos: 30 de marzo, Martes de Pascua; 14 de junio, San Antonio.»
  row("GA", "Lugo", { ine: "27031", slug: "monforte-de-lemos", name: "Monforte de Lemos", ineName: "Monforte de Lemos", population: 18933, ineTable: 2880, capital: false }, y27(DOG, [d("2027-03-30", "Martes de Pascua"), d("2027-06-14", "San Antonio")])),
  // DOG: «35. Nigrán: 24 de junio, San Juan; 29 de junio, San Pedro.»
  row("GA", "Pontevedra", { ine: "36035", slug: "nigran", name: "Nigrán", ineName: "Nigrán", population: 18174, ineTable: 2890, capital: false }, y27(DOG, [d("2027-06-24", "San Juan"), d("2027-06-29", "San Pedro")])),
  // DOG: «51. Sanxenxo: 29 de marzo, romería del Con; 16 de agosto, San Roque.»
  row("GA", "Pontevedra", { ine: "36051", slug: "sanxenxo", name: "Sanxenxo", ineName: "Sanxenxo", population: 18016, ineTable: 2890, capital: false }, y27(DOG, [d("2027-03-29", "Romería del Con"), d("2027-08-16", "San Roque")])),
  // DOG: «55. Tui: 9 de febrero, Martes de Carnaval; 5 de abril, lunes de San Telmo.»
  row("GA", "Pontevedra", { ine: "36055", slug: "tui", name: "Tui", ineName: "Tui", population: 17468, ineTable: 2890, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-04-05", "Lunes de San Telmo")])),
  // DOG: «38. Poio: 24 de junio, San Juan; 24 de septiembre, día de la Virgen de la Merced.»
  row("GA", "Pontevedra", { ine: "36041", slug: "poio", name: "Poio", ineName: "Poio", population: 17434, ineTable: 2890, capital: false }, y27(DOG, [d("2027-06-24", "San Juan"), d("2027-09-24", "Día de la Virgen de la Merced")])),
  // DOG: «75. Sada: 9 de febrero, Martes de Carnaval; 16 de agosto, fiesta de San Roque.»
  row("GA", "A Coruña", { ine: "15075", slug: "sada", name: "Sada", ineName: "Sada", population: 17421, ineTable: 2868, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-08-16", "Fiesta de San Roque")])),
  // DOG: «33. Mos: 14 de junio, fiesta de la Rosa; 9 de agosto, San Mamede.»
  row("GA", "Pontevedra", { ine: "36033", slug: "mos", name: "Mos", ineName: "Mos", population: 15233, ineTable: 2890, capital: false }, y27(DOG, [d("2027-06-14", "Fiesta de la Rosa"), d("2027-08-09", "San Mamede")])),
  // DOG: «65. Viveiro: 9 de febrero, Martes de Carnaval; 16 de agosto, San Roque.»
  row("GA", "Lugo", { ine: "27066", slug: "viveiro", name: "Viveiro", ineName: "Viveiro", population: 15120, ineTable: 2880, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-08-16", "San Roque")])),
  // DOG: «20. Gondomar: 9 de febrero, Martes de Carnaval; 16 de agosto, San Roque.»
  row("GA", "Pontevedra", { ine: "36021", slug: "gondomar", name: "Gondomar", ineName: "Gondomar", population: 15066, ineTable: 2890, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-08-16", "San Roque")])),
  // DOG: «19. Carballiño, O: 9 de febrero, Martes de Carnaval; 17 de septiembre, San Cibrán.»
  row("GA", "Ourense", { ine: "32019", slug: "o-carballino", name: "O Carballiño", ineName: "Carballiño, O", population: 14249, ineTable: 2885, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-09-17", "San Cibrán")])),
  // DOG: «57. Noia: 24 de junio, San Juan; 16 de julio, fiesta de la Virgen del Carmen.»
  row("GA", "A Coruña", { ine: "15057", slug: "noia", name: "Noia", ineName: "Noia", population: 14123, ineTable: 2868, capital: false }, y27(DOG, [d("2027-06-24", "San Juan"), d("2027-07-16", "Fiesta de la Virgen del Carmen")])),
  // DOG: «82. Verín: 10 de febrero, Miércoles de Ceniza; 8 de septiembre, Nuestra Señora de los Remedios.»
  row("GA", "Ourense", { ine: "32085", slug: "verin", name: "Verín", ineName: "Verín", population: 13956, ineTable: 2885, capital: false }, y27(DOG, [d("2027-02-10", "Miércoles de Ceniza"), d("2027-09-08", "Nuestra Señora de los Remedios")])),
  // DOG: «64. Vilalba: 31 de agosto, San Ramón, Día del Patrón de Vilalba; 1 de septiembre, Santa María, día de la patrona de Vilalba.»
  row("GA", "Lugo", { ine: "27065", slug: "vilalba", name: "Vilalba", ineName: "Vilalba", population: 13852, ineTable: 2880, capital: false }, y27(DOG, [d("2027-08-31", "San Ramón, Día del Patrón de Vilalba"), d("2027-09-01", "Santa María, día de la patrona de Vilalba")])),
  // DOG: «7. Cambados: 9 de febrero, Martes de Carnaval; 16 de julio, festividad de la Virgen del Carmen.»
  row("GA", "Pontevedra", { ine: "36006", slug: "cambados", name: "Cambados", ineName: "Cambados", population: 13787, ineTable: 2890, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-07-16", "Festividad de la Virgen del Carmen")])),
  // The Spanish edition prints «Tomillo» in Pontevedra's annex, between Soutomaior and Tui; the Galician edition of the same DOG prints «54. Tomiño: 9 de febreiro, Martes de Entroido; 13 de setembro, Luns do Alivio.»
  // DOG: «54. Tomillo: 9 de febrero, Martes de Carnaval; 13 de septiembre, Lunes del Alivio.»
  row("GA", "Pontevedra", { ine: "36054", slug: "tomino", name: "Tomiño", ineName: "Tomiño", population: 13738, ineTable: 2890, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-09-13", "Lunes del Alivio")])),
  // DOG: «56. Sarria: 24 de junio, San Juan; 8 de septiembre, Virgen de los Remedios.»
  row("GA", "Lugo", { ine: "27057", slug: "sarria", name: "Sarria", ineName: "Sarria", population: 13726, ineTable: 2880, capital: false }, y27(DOG, [d("2027-06-24", "San Juan"), d("2027-09-08", "Virgen de los Remedios")])),
  // DOG: «9. Betanzos: 9 de febrero, Martes de Carnaval; 16 de agosto, San Roque.»
  row("GA", "A Coruña", { ine: "15009", slug: "betanzos", name: "Betanzos", ineName: "Betanzos", population: 13533, ineTable: 2868, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-08-16", "San Roque")])),
  // DOG: «9. Barco de Valdeorras, O: 24 de mayo, Santa Rita; 14 de septiembre, Día del Cristo.»
  row("GA", "Ourense", { ine: "32009", slug: "o-barco-de-valdeorras", name: "O Barco de Valdeorras", short: "O Barco", ineName: "Barco de Valdeorras, O", population: 13368, ineTable: 2885, capital: false }, y27(DOG, [d("2027-05-24", "Santa Rita"), d("2027-09-14", "Día del Cristo")])),
  // DOG: «59. Ordes: 9 de febrero, Martes de Carnaval; 16 de agosto, San Roque.»
  row("GA", "A Coruña", { ine: "15059", slug: "ordes", name: "Ordes", ineName: "Ordes", population: 12990, ineTable: 2868, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-08-16", "San Roque")])),
  // DOG: «35. Fene: 10 de febrero, Miércoles de Ceniza; 6 de agosto, San Salvador.»
  row("GA", "A Coruña", { ine: "15035", slug: "fene", name: "Fene", ineName: "Fene", population: 12467, ineTable: 2868, capital: false }, y27(DOG, [d("2027-02-10", "Miércoles de Ceniza"), d("2027-08-06", "San Salvador")])),
  // DOG: «3. Baiona: 16 de julio, día de la festividad de la Virgen del Carmen; 27 de septiembre, festividad de San Cosme y San Damián.»
  row("GA", "Pontevedra", { ine: "36003", slug: "baiona", name: "Baiona", ineName: "Baiona", population: 12361, ineTable: 2890, capital: false }, y27(DOG, [d("2027-07-16", "Día de la festividad de la Virgen del Carmen"), d("2027-09-27", "Festividad de San Cosme y San Damián")])),
  // DOG: «5. Bueu: 16 de julio, día de la festividad de la Virgen del Carmen; 11 de noviembre, festividad de San Martín.»
  row("GA", "Pontevedra", { ine: "36004", slug: "bueu", name: "Bueu", ineName: "Bueu", population: 11836, ineTable: 2890, capital: false }, y27(DOG, [d("2027-07-16", "Día de la festividad de la Virgen del Carmen"), d("2027-11-11", "Festividad de San Martín")])),
  // DOG: «40. Laracha, A: 9 de febrero, Martes de Carnaval; 8 de septiembre, Virgen de los Milagros de Caión.»
  row("GA", "A Coruña", { ine: "15041", slug: "a-laracha", name: "A Laracha", ineName: "Laracha, A", population: 11781, ineTable: 2868, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-09-08", "Virgen de los Milagros de Caión")])),
  // DOG: «8. Barbadás: 9 de febrero, Martes de Carnaval; 11 de noviembre, San Martín.»
  row("GA", "Ourense", { ine: "32008", slug: "barbadas", name: "Barbadás", ineName: "Barbadás", population: 11201, ineTable: 2885, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-11-11", "San Martín")])),
  // DOG: «21. Grove, O: 16 de julio, festividad del Carmen; 11 de noviembre, San Martín.»
  row("GA", "Pontevedra", { ine: "36022", slug: "o-grove", name: "O Grove", ineName: "Grove, O", population: 10833, ineTable: 2890, capital: false }, y27(DOG, [d("2027-07-16", "Festividad del Carmen"), d("2027-11-11", "San Martín")])),
  // DOG: «72. Rianxo: 16 de julio, fiestas del Carmen; 17 de septiembre, Viernes de Guadalupe.»
  row("GA", "A Coruña", { ine: "15072", slug: "rianxo", name: "Rianxo", ineName: "Rianxo", population: 10758, ineTable: 2868, capital: false }, y27(DOG, [d("2027-07-16", "Fiestas del Carmen"), d("2027-09-17", "Viernes de Guadalupe")])),
  // DOG: «50. Salvaterra de Miño: 14 de junio, festividad Santísimo Cristo de la Victoria; 10 de agosto, festividad de San Lorenzo.»
  row("GA", "Pontevedra", { ine: "36050", slug: "salvaterra-de-mino", name: "Salvaterra de Miño", ineName: "Salvaterra de Miño", population: 10617, ineTable: 2890, capital: false }, y27(DOG, [d("2027-06-14", "Festividad Santísimo Cristo de la Victoria"), d("2027-08-10", "Festividad de San Lorenzo")])),
  // DOG: «21. Foz: 16 de julio, fiesta del Carmen; 10 de agosto, San Lorenzo.»
  row("GA", "Lugo", { ine: "27019", slug: "foz", name: "Foz", ineName: "Foz", population: 10329, ineTable: 2880, capital: false }, y27(DOG, [d("2027-07-16", "Fiesta del Carmen"), d("2027-08-10", "San Lorenzo")])),
  // DOG: «61. Vilanova de Arousa: 15 de enero, San Mauro; 16 de septiembre, San Cibrán.»
  row("GA", "Pontevedra", { ine: "36061", slug: "vilanova-de-arousa", name: "Vilanova de Arousa", ineName: "Vilanova de Arousa", population: 10159, ineTable: 2890, capital: false }, y27(DOG, [d("2027-01-15", "San Mauro"), d("2027-09-16", "San Cibrán")])),
  // DOG: «51. Ribadeo: 16 de agosto, San Roque; 8 de septiembre, Santa María del Campo.»
  row("GA", "Lugo", { ine: "27051", slug: "ribadeo", name: "Ribadeo", ineName: "Ribadeo", population: 10022, ineTable: 2880, capital: false }, y27(DOG, [d("2027-08-16", "San Roque"), d("2027-09-08", "Santa María del Campo")])),
];

const MURCIA: CityRow[] = [
  // BORM: «22 FUENTE ALAMO Martes 20 Julio Sábado 28 Agosto»
  row("MC", "Murcia", { ine: "30021", slug: "fuente-alamo-de-murcia", name: "Fuente Álamo de Murcia", short: "Fuente Álamo", ineName: "Fuente Álamo de Murcia", population: 19171, ineTable: 2883, capital: false }, y27(BORM, [d("2027-07-20", null, { printedWeekday: "Martes" }), d("2027-08-28", null, { printedWeekday: "Sábado" })])),
  // BORM: «34 PUERTO LUMBRERAS Miércoles 7 Julio Jueves 7 Octubre»
  row("MC", "Murcia", { ine: "30033", slug: "puerto-lumbreras", name: "Puerto Lumbreras", ineName: "Puerto Lumbreras", population: 18006, ineTable: 2883, capital: false }, y27(BORM, [d("2027-07-07", null, { printedWeekday: "Miércoles" }), d("2027-10-07", null, { printedWeekday: "Jueves" })])),
  // BORM: «30 MULA Martes 21 Septiembre Jueves 23 Septiembre»
  row("MC", "Murcia", { ine: "30029", slug: "mula", name: "Mula", ineName: "Mula", population: 17937, ineTable: 2883, capital: false }, y27(BORM, [d("2027-09-21", null, { printedWeekday: "Martes" }), d("2027-09-23", null, { printedWeekday: "Jueves" })])),
  // BORM: «38 SANTOMERA Miércoles 29 Septiembre Jueves 7 Octubre»
  row("MC", "Murcia", { ine: "30901", slug: "santomera", name: "Santomera", ineName: "Santomera", population: 16443, ineTable: 2883, capital: false }, y27(BORM, [d("2027-09-29", null, { printedWeekday: "Miércoles" }), d("2027-10-07", null, { printedWeekday: "Jueves" })])),
  // BORM: «18 CEHEGIN Viernes 10 Septiembre Martes 14 Septiembre»
  row("MC", "Murcia", { ine: "30017", slug: "cehegin", name: "Cehegín", ineName: "Cehegín", population: 14506, ineTable: 2883, capital: false }, y27(BORM, [d("2027-09-10", null, { printedWeekday: "Viernes" }), d("2027-09-14", null, { printedWeekday: "Martes" })])),
  // BORM: «2 ABARAN Martes 30 Marzo Lunes 27 Septiembre»
  row("MC", "Murcia", { ine: "30002", slug: "abaran", name: "Abarán", ineName: "Abarán", population: 13228, ineTable: 2883, capital: false }, y27(BORM, [d("2027-03-30", null, { printedWeekday: "Martes" }), d("2027-09-27", null, { printedWeekday: "Lunes" })])),
  // BORM: «19 CEUTI Jueves 22 Julio Lunes 16 Agosto»
  row("MC", "Murcia", { ine: "30018", slug: "ceuti", name: "Ceutí", ineName: "Ceutí", population: 13089, ineTable: 2883, capital: false }, y27(BORM, [d("2027-07-22", null, { printedWeekday: "Jueves" }), d("2027-08-16", null, { printedWeekday: "Lunes" })])),
  // BORM: «13 BULLAS Lunes 4 Octubre Martes 5 Octubre»
  row("MC", "Murcia", { ine: "30012", slug: "bullas", name: "Bullas", ineName: "Bullas", population: 12027, ineTable: 2883, capital: false }, y27(BORM, [d("2027-10-04", null, { printedWeekday: "Lunes" }), d("2027-10-05", null, { printedWeekday: "Martes" })])),
  // BORM: «11 BENIEL Martes 2 Febrero Martes 24 Agosto»
  row("MC", "Murcia", { ine: "30010", slug: "beniel", name: "Beniel", ineName: "Beniel", population: 11582, ineTable: 2883, capital: false }, y27(BORM, [d("2027-02-02", null, { printedWeekday: "Martes" }), d("2027-08-24", null, { printedWeekday: "Martes" })])),
  // BORM: «21 FORTUNA Lunes 29 Marzo Lunes 16 Agosto»
  row("MC", "Murcia", { ine: "30020", slug: "fortuna", name: "Fortuna", ineName: "Fortuna", population: 11437, ineTable: 2883, capital: false }, y27(BORM, [d("2027-03-29", null, { printedWeekday: "Lunes" }), d("2027-08-16", null, { printedWeekday: "Lunes" })])),
  // BORM: «8 ALGUAZAS Martes 30 Marzo Viernes 16 Julio»
  row("MC", "Murcia", { ine: "30007", slug: "alguazas", name: "Alguazas", ineName: "Alguazas", population: 10431, ineTable: 2883, capital: false }, y27(BORM, [d("2027-03-30", null, { printedWeekday: "Martes" }), d("2027-07-16", null, { printedWeekday: "Viernes" })])),
  // BORM: «14 CALASPARRA Viernes 30 Julio Miércoles 8 Septiembre»
  row("MC", "Murcia", { ine: "30013", slug: "calasparra", name: "Calasparra", ineName: "Calasparra", population: 10391, ineTable: 2883, capital: false }, y27(BORM, [d("2027-07-30", null, { printedWeekday: "Viernes" }), d("2027-09-08", null, { printedWeekday: "Miércoles" })])),
];

const PAIS_VASCO: CityRow[] = [
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Amorebieta-Etxano – 16 de julio (Ntra. Sra. del Carmen)»
  row("PV", "Bizkaia", { ine: "48003", slug: "amorebieta-etxano", name: "Amorebieta-Etxano", ineName: "Amorebieta-Etxano", population: 19660, ineTable: 2905, capital: false }, y27(BOB, [d("2027-07-16", "Ntra. Sra. del Carmen"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" })])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / LASARTE-ORIA | 29 de junio | San Pedro»
  row("PV", "Gipuzkoa", { ine: "20902", slug: "lasarte-oria", name: "Lasarte-Oria", ineName: "Lasarte-Oria", population: 19435, ineTable: 2873, capital: false }, y27(BOG, [d("2027-06-29", "San Pedro"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Mungia – 29 de junio»
  row("PV", "Bizkaia", { ine: "48069", slug: "mungia", name: "Mungia", ineName: "Mungia", population: 18129, ineTable: 2905, capital: false }, y27(BOB, [d("2027-06-29", null), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" })])),
  // BOTHA: «Día de fiesta del territorio histórico: 28 de abril (San Prudencio) / Llodio 16 de agosto»
  row("PV", "Álava", { ine: "01036", slug: "llodio", name: "Llodio", ineName: "Laudio/Llodio", population: 18077, ineTable: 2854, capital: false }, y27(BOTHA, [d("2027-04-28", "San Prudencio", { note: "día de fiesta del territorio histórico de Álava" }), d("2027-08-16", null)])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Gernika-Lumo – 16 de agosto (San Roque)»
  row("PV", "Bizkaia", { ine: "48046", slug: "gernika-lumo", name: "Gernika-Lumo", ineName: "Gernika-Lumo", population: 17129, ineTable: 2905, capital: false }, y27(BOB, [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" }), d("2027-08-16", "San Roque")])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Bermeo – 08 de septiembre (Andra Mari)»
  row("PV", "Bizkaia", { ine: "48017", slug: "bermeo", name: "Bermeo", ineName: "Bermeo", population: 17038, ineTable: 2905, capital: false }, y27(BOB, [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" }), d("2027-09-08", "Andra Mari")])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / HONDARRIBIA | 8 de septiembre | N.ª Sra. de Guadalupe»
  row("PV", "Gipuzkoa", { ine: "20036", slug: "hondarribia", name: "Hondarribia", ineName: "Hondarribia", population: 16788, ineTable: 2873, capital: false }, y27(BOG, [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" }), d("2027-09-08", "N.ª Sra. de Guadalupe")])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / PASAIA: P. Donibane | 24 de junio | San Juan; P. San Pedro | 29 de junio | San Pedro; P. Antxo | 7 de julio | San Fermin; Trintxerpe | 16 de julio | Karmengo Ama»
  row("PV", "Gipuzkoa", { ine: "20064", slug: "pasaia", name: "Pasaia", ineName: "Pasaia", population: 15820, ineTable: 2873, capital: false }, y27(BOG, [d("2027-06-24", "San Juan"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })], { mainArea: "Pasai Donibane", zones: [{ place: "Pasai San Pedro", days: [d("2027-06-29", "San Pedro"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })] }, { place: "Pasai Antxo", days: [d("2027-07-07", "San Fermin"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })] }, { place: "Trintxerpe", days: [d("2027-07-16", "Karmengo Ama"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })] }] })),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Ermua – 27 de julio (Zezen Eguna)»
  row("PV", "Bizkaia", { ine: "48034", slug: "ermua", name: "Ermua", ineName: "Ermua", population: 15516, ineTable: 2905, capital: false }, y27(BOB, [d("2027-07-27", "Zezen Eguna"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" })])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / AZPEITIA | 20 de enero | San Sebastián»
  row("PV", "Gipuzkoa", { ine: "20018", slug: "azpeitia", name: "Azpeitia", ineName: "Azpeitia", population: 15301, ineTable: 2873, capital: false }, y27(BOG, [d("2027-01-20", "San Sebastián"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Sopela – 29 de junio (San Pedro)»
  row("PV", "Bizkaia", { ine: "48085", slug: "sopela", name: "Sopela", ineName: "Sopela", population: 15048, ineTable: 2905, capital: false }, y27(BOB, [d("2027-06-29", "San Pedro"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" })])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / ANDOAIN | 24 de junio | San Juan»
  row("PV", "Gipuzkoa", { ine: "20009", slug: "andoain", name: "Andoain", ineName: "Andoain", population: 14517, ineTable: 2873, capital: false }, y27(BOG, [d("2027-06-24", "San Juan"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / BERGARA | 16 de septiembre | San Martin Agirre»
  row("PV", "Gipuzkoa", { ine: "20074", slug: "bergara", name: "Bergara", ineName: "Bergara", population: 14404, ineTable: 2873, capital: false }, y27(BOG, [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" }), d("2027-09-16", "San Martin Agirre")])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / BEASAIN | 10 de mayo | San Martín de Loinaz»
  row("PV", "Gipuzkoa", { ine: "20019", slug: "beasain", name: "Beasain", ineName: "Beasain", population: 14048, ineTable: 2873, capital: false }, y27(BOG, [d("2027-05-10", "San Martín de Loinaz"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Etxebarri – 27 de diciembre (San Esteban)»
  row("PV", "Bizkaia", { ine: "48029", slug: "etxebarri", name: "Etxebarri", ineName: "Etxebarri", population: 12038, ineTable: 2905, capital: false }, y27(BOB, [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" }), d("2027-12-27", "San Esteban")])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Arrigorriaga – 22 de julio (Santa María Magdalena)»
  row("PV", "Bizkaia", { ine: "48011", slug: "arrigorriaga", name: "Arrigorriaga", ineName: "Arrigorriaga", population: 11939, ineTable: 2905, capital: false }, y27(BOB, [d("2027-07-22", "Santa María Magdalena"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" })])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Valle de Trápaga-Trapagaran – 06 de agosto-Transfiguración del Señor (Día de San Salvador)»
  row("PV", "Bizkaia", { ine: "48080", slug: "valle-de-trapaga-trapagaran", name: "Valle de Trápaga-Trapagaran", ineName: "Valle de Trápaga-Trapagaran", population: 11797, ineTable: 2905, capital: false }, y27(BOB, [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" }), d("2027-08-06", "Transfiguración del Señor (Día de San Salvador)")])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / AZKOITIA | 30 de noviembre | San Andrés»
  row("PV", "Gipuzkoa", { ine: "20017", slug: "azkoitia", name: "Azkoitia", ineName: "Azkoitia", population: 11774, ineTable: 2873, capital: false }, y27(BOG, [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" }), d("2027-11-30", "San Andrés")])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / ELGOIBAR | 18 de enero | Día siguiente a San Antón»
  row("PV", "Gipuzkoa", { ine: "20032", slug: "elgoibar", name: "Elgoibar", ineName: "Elgoibar", population: 11705, ineTable: 2873, capital: false }, y27(BOG, [d("2027-01-18", "Día siguiente a San Antón"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / OÑATI | 29 de septiembre | San Miguel»
  row("PV", "Gipuzkoa", { ine: "20059", slug: "onati", name: "Oñati", ineName: "Oñati", population: 11480, ineTable: 2873, capital: false }, y27(BOG, [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" }), d("2027-09-29", "San Miguel")])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / ORDIZIA | 26 de julio»
  row("PV", "Gipuzkoa", { ine: "20076", slug: "ordizia", name: "Ordizia", ineName: "Ordizia", population: 10815, ineTable: 2873, capital: false }, y27(BOG, [d("2027-07-26", null), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / OIARTZUN | 3 de agosto | San Esteban»
  row("PV", "Gipuzkoa", { ine: "20063", slug: "oiartzun", name: "Oiartzun", ineName: "Oiartzun", population: 10480, ineTable: 2873, capital: false }, y27(BOG, [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" }), d("2027-08-03", "San Esteban")])),
  // BOTHA: «Día de fiesta del territorio histórico: 28 de abril (San Prudencio) / Amurrio 16 de agosto (San Roque)»
  row("PV", "Álava", { ine: "01002", slug: "amurrio", name: "Amurrio", ineName: "Amurrio", population: 10364, ineTable: 2854, capital: false }, y27(BOTHA, [d("2027-04-28", "San Prudencio", { note: "día de fiesta del territorio histórico de Álava" }), d("2027-08-16", "San Roque")])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / ZUMAIA | 29 de junio | San Pedro»
  row("PV", "Gipuzkoa", { ine: "20081", slug: "zumaia", name: "Zumaia", ineName: "Zumaia", population: 10160, ineTable: 2873, capital: false }, y27(BOG, [d("2027-06-29", "San Pedro"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
];

const LA_RIOJA: CityRow[] = [
  // BOR: «Arnedo: 8 de septiembre (Virgen de Vico) y 27 de septiembre (San Cosme y San Damián)»
  row("RI", "La Rioja", { ine: "26018", slug: "arnedo", name: "Arnedo", ineName: "Arnedo", population: 15140, ineTable: 2879, capital: false }, y27(BOR, [d("2027-09-08", "Virgen de Vico"), d("2027-09-27", "San Cosme y San Damián")])),
  // BOR: «Haro : 25 junio y 8 septiembre (Ntra. Sra. Virgen de la Vega)»
  row("RI", "La Rioja", { ine: "26071", slug: "haro", name: "Haro", ineName: "Haro", population: 12167, ineTable: 2879, capital: false }, y27(BOR, [d("2027-06-25", null), d("2027-09-08", null)])),
  // BOR: «Lardero: 29 y 30 de junio (Fiestas Locales)»
  row("RI", "La Rioja", { ine: "26084", slug: "lardero", name: "Lardero", ineName: "Lardero", population: 12060, ineTable: 2879, capital: false }, y27(BOR, [d("2027-06-29", null), d("2027-06-30", null)])),
];

const VALENCIANA: CityRow[] = [
  // The list of 2027 prints «de 2026» after the first date (a slip: 5 April is a Monday in 2027, a Sunday in 2026).
  // BOP Alicante: «CALLOSA DE SEGURA: 5 de abril de 2026, lunes, San Vicente; 16 de agosto, lunes, San Roque.»
  row("VC", "Alicante", { ine: "03049", slug: "callosa-de-segura", name: "Callosa de Segura", ineName: "Callosa de Segura", population: 19988, ineTable: 2856, capital: false }, y27(BOP_ALICANTE, [d("2027-04-05", "San Vicente"), d("2027-08-16", "San Roque")])),
  // BOP Valencia: «ELIANA, L': 18 de marzo y 16 de julio.»
  row("VC", "Valencia", { ine: "46116", slug: "l-eliana", name: "L'Eliana", ineName: "Eliana, l'", population: 19839, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-03-18", null), d("2027-07-16", null)])),
  // BOP Alicante: «NUCIA (LA): 5 de abril, lunes, Festividad de San Vicente del Cautivador; 17 de agosto, martes, fiestas de agosto.»
  row("VC", "Alicante", { ine: "03094", slug: "la-nucia", name: "La Nucia", ineName: "Nucia, la", population: 19121, ineTable: 2856, capital: false }, y27(BOP_ALICANTE, [d("2027-04-05", "Festividad de San Vicente del Cautivador"), d("2027-08-17", "Fiestas de agosto")])),
  // BOP Alicante: «GUARDAMAR DEL SEGURA: 23 de julio, viernes, víspera de la Festividad de Santiago Apóstol; 7 de octubre, jueves, Festividad de la Virgen del Rosario.»
  row("VC", "Alicante", { ine: "03076", slug: "guardamar-del-segura", name: "Guardamar del Segura", ineName: "Guardamar del Segura", population: 18564, ineTable: 2856, capital: false }, y27(BOP_ALICANTE, [d("2027-07-23", "Víspera de la Festividad de Santiago Apóstol"), d("2027-10-07", "Festividad de la Virgen del Rosario")])),
  // BOP Valencia: «CHIVA: 24 de junio, fiesta de San Juan; 8 de septiembre, Virgen del Castillo.»
  row("VC", "Valencia", { ine: "46111", slug: "chiva", name: "Chiva", ineName: "Chiva", population: 17951, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-06-24", "Fiesta de San Juan"), d("2027-09-08", "Virgen del Castillo")])),
  // BOP Valencia: «TAVERNES DE LA VALLDIGNA: 18 de marzo, vespra de Sant Josep; 5 de abril, Sant Vicent Ferrer.»
  row("VC", "Valencia", { ine: "46238", slug: "tavernes-de-la-valldigna", name: "Tavernes de la Valldigna", ineName: "Tavernes de la Valldigna", population: 17866, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-03-18", "Vespra de Sant Josep"), d("2027-04-05", "Sant Vicent Ferrer")])),
  // BOP Alicante: «ROJALES: 29 de junio, martes, San Pedro Apóstol; 7 de octubre, jueves, Virgen del Rosario.»
  row("VC", "Alicante", { ine: "03113", slug: "rojales", name: "Rojales", ineName: "Rojales", population: 17652, ineTable: 2856, capital: false }, y27(BOP_ALICANTE, [d("2027-06-29", "San Pedro Apóstol"), d("2027-10-07", "Virgen del Rosario")])),
  // BOP Valencia: «MASSAMAGRELL: 27 de septiembre, Virgen del Rosario; 30 de septiembre, San Juan Apóstol.»
  row("VC", "Valencia", { ine: "46164", slug: "massamagrell", name: "Massamagrell", ineName: "Massamagrell", population: 17566, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-09-27", "Virgen del Rosario"), d("2027-09-30", "San Juan Apóstol")])),
  // BOP Valencia: «ALBAL: 3 de febrero, San Blas; 28 de julio, Santa Ana.»
  row("VC", "Valencia", { ine: "46007", slug: "albal", name: "Albal", ineName: "Albal", population: 17365, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-02-03", "San Blas"), d("2027-07-28", "Santa Ana")])),
  // BOP Valencia: «CARLET: 23 de julio, Sant Bernat; 10 de septiembre, Santa Maria de Carlet.»
  row("VC", "Valencia", { ine: "46085", slug: "carlet", name: "Carlet", ineName: "Carlet", population: 16857, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-07-23", "Sant Bernat"), d("2027-09-10", "Santa Maria de Carlet")])),
  // BOP Valencia: «BENETÚSSER: 5 de abril, San Vicente Ferrer; 21 de junio, Fiesta local.»
  row("VC", "Valencia", { ine: "46054", slug: "benetusser", name: "Benetússer", ineName: "Benetússer", population: 16734, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-04-05", "San Vicente Ferrer"), d("2027-06-21", null)])),
  // BOP Valencia: «ALGINET: 25 de marzo, Jueves Santo; 5 de abril, San Vicente Ferrer.»
  row("VC", "Valencia", { ine: "46031", slug: "alginet", name: "Alginet", ineName: "Alginet", population: 14844, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-03-25", "Jueves Santo"), d("2027-04-05", "San Vicente Ferrer")])),
  // BOP Castellón: «NULES: 5 de abril, San Vicente y 24 de agosto, San Bartolomé.»
  row("VC", "Castellón", { ine: "12082", slug: "nules", name: "Nules", ineName: "Nules", population: 14315, ineTable: 2865, capital: false }, y27(BOP_CASTELLON, [d("2027-04-05", "San Vicente"), d("2027-08-24", "San Bartolomé")])),
  // BOP Valencia: «CANALS: 18 de enero, dia dels Parells; 17 de septiembre, Fira de setembre.»
  row("VC", "Valencia", { ine: "46081", slug: "canals", name: "Canals", ineName: "Canals", population: 13746, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-01-18", "Dia dels Parells"), d("2027-09-17", "Fira de setembre")])),
  // BOP Alicante: «ALBATERA: 5 de abril, lunes, día de San Vicente; 7 de octubre, jueves, día de la Virgen del Rosario.»
  row("VC", "Alicante", { ine: "03005", slug: "albatera", name: "Albatera", ineName: "Albatera", population: 13566, ineTable: 2856, capital: false }, y27(BOP_ALICANTE, [d("2027-04-05", "Día de San Vicente"), d("2027-10-07", "Día de la Virgen del Rosario")])),
  // BOP Valencia: «GODELLA: 20 de enero, San Sebastián; 5 de abril, San Vicente Ferrer.»
  row("VC", "Valencia", { ine: "46135", slug: "godella", name: "Godella", ineName: "Godella", population: 13533, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-01-20", "San Sebastián"), d("2027-04-05", "San Vicente Ferrer")])),
  // BOP Alicante: «MONÓVAR: 5 de abril, lunes de San Vicente; 8 de septiembre, miércoles, celebración de las Fiestas Patronales.»
  row("VC", "Alicante", { ine: "03089", slug: "monovar", name: "Monóvar", ineName: "Monòver/Monóvar", population: 13116, ineTable: 2856, capital: false }, y27(BOP_ALICANTE, [d("2027-04-05", "Lunes de San Vicente"), d("2027-09-08", "Celebración de las Fiestas Patronales")])),
  // BOP Alicante: «TEULADA: 5 de abril, lunes, San Vicente Ferrer; 15 de julio, jueves, Virgen de los Desamparados.»
  row("VC", "Alicante", { ine: "03128", slug: "teulada", name: "Teulada", ineName: "Teulada", population: 12912, ineTable: 2856, capital: false }, y27(BOP_ALICANTE, [d("2027-04-05", "San Vicente Ferrer"), d("2027-07-15", "Virgen de los Desamparados")])),
  // BOP Valencia: «BENAGUASIL: 18 de marzo, Fallas; 8 de septiembre, Virgen de Montiel.»
  row("VC", "Valencia", { ine: "46051", slug: "benaguasil", name: "Benaguasil", ineName: "Benaguasil", population: 12668, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-03-18", "Fallas"), d("2027-09-08", "Virgen de Montiel")])),
  // BOP Castellón: «OROPESA DEL MAR: 26 de julio y 4 de octubre.»
  row("VC", "Castellón", { ine: "12085", slug: "oropesa-del-mar", name: "Oropesa del Mar", ineName: "Orpesa/Oropesa del Mar", population: 12640, ineTable: 2865, capital: false }, y27(BOP_CASTELLON, [d("2027-07-26", null), d("2027-10-04", null)])),
  // BOP Valencia: «ALCÚDIA, L': 8 de septiembre, Mare de Déu de l’Oreto; 30 de noviembre, Sant Andreu Apòstol.»
  row("VC", "Valencia", { ine: "46019", slug: "l-alcudia", name: "L'Alcúdia", ineName: "Alcúdia, l'", population: 12587, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-09-08", "Mare de Déu de l'Oreto"), d("2027-11-30", "Sant Andreu Apòstol")])),
  // BOP Valencia: «BENIFAIÓ: 20 de agosto, Divina Aurora; 11 de octubre»
  row("VC", "Valencia", { ine: "46060", slug: "benifaio", name: "Benifaió", ineName: "Benifaió", population: 12262, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-08-20", "Divina Aurora"), d("2027-10-11", null)])),
  // BOP Alicante: «CASTALLA: 31 de julio, sábado, celebración Sant Jaume; 2 de septiembre, jueves, Fiestas de Moros y Cristianos.»
  row("VC", "Alicante", { ine: "03053", slug: "castalla", name: "Castalla", ineName: "Castalla", population: 11908, ineTable: 2856, capital: false }, y27(BOP_ALICANTE, [d("2027-07-31", "Celebración Sant Jaume"), d("2027-09-02", "Fiestas de Moros y Cristianos")])),
  // BOP Valencia: «PICANYA: 7 de julio, Festa de la Sang; 8 de septiembre, Mare de Déu de Montserrat.»
  row("VC", "Valencia", { ine: "46193", slug: "picanya", name: "Picanya", ineName: "Picanya", population: 11901, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-07-07", "Festa de la Sang"), d("2027-09-08", "Mare de Déu de Montserrat")])),
  // BOP Valencia: «UTIEL: 24 de junio, San Juan; 8 de septiembre, Nuestra Señora del Remedio.»
  row("VC", "Valencia", { ine: "46249", slug: "utiel", name: "Utiel", ineName: "Utiel", population: 11663, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-06-24", "San Juan"), d("2027-09-08", "Nuestra Señora del Remedio")])),
  // BOP Alicante: «COCENTAINA: 19 de abril, lunes; 11 de octubre, lunes.»
  row("VC", "Alicante", { ine: "03056", slug: "cocentaina", name: "Cocentaina", ineName: "Cocentaina", population: 11498, ineTable: 2856, capital: false }, y27(BOP_ALICANTE, [d("2027-04-19", null), d("2027-10-11", null)])),
  // BOP Valencia: «VILAMARXANT: 18 de marzo, festividad fallera; 30de agosto, Festividad de Santa Catalina.»
  row("VC", "Valencia", { ine: "46256", slug: "vilamarxant", name: "Vilamarxant", ineName: "Vilamarxant", population: 11403, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-03-18", "Festividad fallera"), d("2027-08-30", "Festividad de Santa Catalina")])),
  // BOP Valencia: «SAN ANTONIO DE BENAGÉBER: 8 de abril, Fiesta de la Segregación; 16 de agosto, San Roque.»
  row("VC", "Valencia", { ine: "46903", slug: "san-antonio-de-benageber", name: "San Antonio de Benagéber", ineName: "San Antonio de Benagéber", population: 11192, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-04-08", "Fiesta de la Segregación"), d("2027-08-16", "San Roque")])),
  // BOP Valencia: «ALBERIC: 5 de abril, Sant Vicent Ferrer y 24 de junio de 2027 San Juan Bautista.»
  row("VC", "Valencia", { ine: "46011", slug: "alberic", name: "Alberic", ineName: "Alberic", population: 11099, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-04-05", "Sant Vicent Ferrer"), d("2027-06-24", "San Juan Bautista")])),
  // BOP Valencia: «MELIANA: 5 de abril, San Vicente Ferrer; 14 de septiembre, Cristo de la Providencia.»
  row("VC", "Valencia", { ine: "46166", slug: "meliana", name: "Meliana", ineName: "Meliana", population: 11055, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-04-05", "San Vicente Ferrer"), d("2027-09-14", "Cristo de la Providencia")])),
  // BOP Valencia: «SEDAVÍ: 5 de abril, San Vicente Ferrer; 17 de septiembre, Fiesta Local.»
  row("VC", "Valencia", { ine: "46223", slug: "sedavi", name: "Sedaví", ineName: "Sedaví", population: 10837, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-04-05", "San Vicente Ferrer"), d("2027-09-17", null)])),
  // BOP Alicante: «PEGO: 9 de febrero, martes, Día de la Crosta, y 30 de junio, miércoles, Festividad del Santísimo Ecce-Homo.»
  row("VC", "Alicante", { ine: "03102", slug: "pego", name: "Pego", ineName: "Pego", population: 10791, ineTable: 2856, capital: false }, y27(BOP_ALICANTE, [d("2027-02-09", "Día de la Crosta"), d("2027-06-30", "Festividad del Santísimo Ecce-Homo")])),
  // BOP Valencia: «ALCÀSSER: 16 de julio, La Virgen del Carmen; 16 de agosto, Santísimo Cristo de la Fe.»
  row("VC", "Valencia", { ine: "46015", slug: "alcasser", name: "Alcàsser", ineName: "Alcàsser", population: 10772, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-07-16", "La Virgen del Carmen"), d("2027-08-16", "Santísimo Cristo de la Fe")])),
  // BOP Castellón: «L’ALCORA: 30 de marzo, martes, “La Doblà” y 5 de abril, lunes, festividad de San Vicente.»
  row("VC", "Castellón", { ine: "12005", slug: "l-alcora", name: "L'Alcora", ineName: "Alcora, l'", population: 10664, ineTable: 2865, capital: false }, y27(BOP_CASTELLON, [d("2027-03-30", "La Doblà"), d("2027-04-05", "Festividad de San Vicente")])),
  // BOP Valencia: «MASSANASSA: 5 de abril San Vicente; 24 de junio, San Juan.»
  row("VC", "Valencia", { ine: "46165", slug: "massanassa", name: "Massanassa", ineName: "Massanassa", population: 10607, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-04-05", "San Vicente"), d("2027-06-24", "San Juan")])),
  // BOP Alicante: «SAX: 3 de febrero, miércoles, San Blas; 27 de diciembre, lunes, Cabildo.»
  row("VC", "Alicante", { ine: "03123", slug: "sax", name: "Sax", ineName: "Sax", population: 10346, ineTable: 2856, capital: false }, y27(BOP_ALICANTE, [d("2027-02-03", "San Blas"), d("2027-12-27", "Cabildo")])),
  // BOP Valencia: «MONTSERRAT: 5 de abril Sant Vicent Ferrer; 16 de agosto Sant Roc.»
  row("VC", "Valencia", { ine: "46172", slug: "montserrat", name: "Montserrat", ineName: "Montserrat", population: 10062, ineTable: 2903, capital: false }, y27(BOP_VALENCIA, [d("2027-04-05", "Sant Vicent Ferrer"), d("2027-08-16", "Sant Roc")])),
];

/** The 10,000+ wave, by community in the BOE's order, most populous first. */
export const TEN_K_CITY_ROWS: readonly CityRow[] = [
  ...ANDALUCIA,
  ...ASTURIAS,
  ...BALEARES,
  ...CANARIAS,
  ...CANTABRIA,
  ...CASTILLA_Y_LEON,
  ...EXTREMADURA,
  ...GALICIA,
  ...MURCIA,
  ...PAIS_VASCO,
  ...LA_RIOJA,
  ...VALENCIANA,
];

/* -------------------------------------------------------------------------- */
/* Towns in scope with no page yet                                            */
/* -------------------------------------------------------------------------- */

export interface TenKTown {
  ine: string;
  ineName: string;
  region: Region;
  province: string;
  population: number;
  ineTable: number;
}

const town = (region: Region, province: string, ine: string, ineName: string, population: number, ineTable: number): TenKTown => ({ ine, ineName, region, province, population, ineTable });

/**
 * 10,000–19,999 towns of the four communities whose 2027 local list was not
 * out on `TEN_K_READ_ON` (`TEN_K_PENDING_READ`), most populous first within
 * each: they get a row when the list is published, not before.
 */
export const TEN_K_WAITING: readonly TenKTown[] = [
  town("AR", "Zaragoza", "50272", "Utebo", 19116, 2907),
  town("AR", "Huesca", "22158", "Monzón", 18525, 2875),
  town("AR", "Huesca", "22048", "Barbastro", 17807, 2875),
  town("AR", "Zaragoza", "50095", "Ejea de los Caballeros", 17129, 2907),
  town("AR", "Teruel", "44013", "Alcañiz", 16505, 2899),
  town("AR", "Huesca", "22112", "Fraga", 15576, 2875),
  town("AR", "Zaragoza", "50089", "Cuarte de Huerva", 15408, 2907),
  town("AR", "Huesca", "22130", "Jaca", 14024, 2875),
  town("AR", "Zaragoza", "50251", "Tarazona", 10873, 2907),
  town("AR", "Zaragoza", "50074", "Caspe", 10365, 2907),
  town("AR", "Huesca", "22061", "Binéfar", 10235, 2875),
  town("CM", "Ciudad Real", "13053", "Manzanares", 17728, 2866),
  town("CM", "Ciudad Real", "13039", "Daimiel", 17722, 2866),
  town("CM", "Cuenca", "16203", "Tarancón", 16748, 2869),
  town("CM", "Ciudad Real", "13056", "Miguelturra", 15924, 2866),
  town("CM", "Albacete", "02069", "Roda, La", 15643, 2855),
  town("CM", "Toledo", "45121", "Ocaña", 15560, 2902),
  town("CM", "Ciudad Real", "13079", "Solana, La", 15242, 2866),
  town("CM", "Guadalajara", "19024", "Alovera", 14526, 2872),
  town("CM", "Toledo", "45173", "Torrijos", 14307, 2902),
  town("CM", "Guadalajara", "19071", "Casar, El", 13962, 2872),
  town("CM", "Toledo", "45205", "Yuncos", 13189, 2902),
  town("CM", "Ciudad Real", "13028", "Campo de Criptana", 12868, 2866),
  town("CM", "Toledo", "45066", "Fuensalida", 12669, 2902),
  town("CM", "Ciudad Real", "13078", "Socuéllamos", 12172, 2866),
  town("CM", "Ciudad Real", "13023", "Bolaños de Calatrava", 12153, 2866),
  town("CM", "Guadalajara", "19058", "Cabanillas del Campo", 11572, 2872),
  town("CM", "Toledo", "45163", "Sonseca", 11452, 2902),
  town("CM", "Toledo", "45142", "Quintanar de la Orden", 11355, 2902),
  town("CM", "Toledo", "45019", "Bargas", 11274, 2902),
  town("CM", "Albacete", "02025", "Caudete", 10439, 2855),
  town("CM", "Toledo", "45087", "Madridejos", 10088, 2902),
  town("CM", "Toledo", "45106", "Mora", 10064, 2902),
  town("MD", "Madrid", "28131", "San Lorenzo de El Escorial", 18872, 2881),
  town("MD", "Madrid", "28172", "Villalbilla", 18687, 2881),
  town("MD", "Madrid", "28177", "Villanueva del Pardillo", 18466, 2881),
  town("MD", "Madrid", "28068", "Guadarrama", 17547, 2881),
  town("MD", "Madrid", "28054", "Escorial, El", 17171, 2881),
  town("MD", "Madrid", "28083", "Meco", 15922, 2881),
  town("MD", "Madrid", "28010", "Alpedrete", 15686, 2881),
  town("MD", "Madrid", "28090", "Moralzarzal", 14772, 2881),
  town("MD", "Madrid", "28167", "Velilla de San Antonio", 14468, 2881),
  town("MD", "Madrid", "28160", "Valdemorillo", 14420, 2881),
  town("MD", "Madrid", "28129", "San Agustín del Guadalix", 13825, 2881),
  town("MD", "Madrid", "28026", "Brunete", 11287, 2881),
  town("MD", "Madrid", "28066", "Griñón", 10799, 2881),
  town("MD", "Madrid", "28053", "Daganzo de Arriba", 10764, 2881),
  town("MD", "Madrid", "28149", "Torrejón de la Calzada", 10653, 2881),
  town("MD", "Madrid", "28004", "Álamo, El", 10594, 2881),
  town("NC", "Navarra", "31901", "Barañáin/Barañain", 19642, 2884),
  town("NC", "Navarra", "31907", "Zizur Mayor/Zizur Nagusia", 16510, 2884),
  town("NC", "Navarra", "31097", "Estella-Lizarra", 14317, 2884),
  town("NC", "Navarra", "31023", "Aranguren", 13216, 2884),
  town("NC", "Navarra", "31903", "Berriozar", 11361, 2884),
  town("NC", "Navarra", "31227", "Tafalla", 10854, 2884),
  town("NC", "Navarra", "31016", "Ansoáin/Antsoain", 10663, 2884),
];

/**
 * 10,000–19,999 towns of a community with a published list that get no page,
 * and why (the bulletin's own words; Spanish, shown nowhere).
 */
export const TEN_K_LEFT_OUT: readonly (TenKTown & { reason: string })[] = [
  { ...town("AS", "Asturias", "33036", "Llanes", 13486, 2886), reason: "La lista del BOPA reparte los días de Llanes por zonas (22 y 26 de julio «excepto Posada, Nueva y Valle de San Jorge»; 19 de marzo y 13 de diciembre «en Posada y Parroquia»; 23 de abril «en Nueva y Valle de San Jorge») y solo da un día a una de ellas." },
  { ...town("VC", "Alicante", "03041", "Benissa", 12471, 2856), reason: "El BOP de Alicante imprime «BENISSA: 27 de abril, lunes, Día del Riberer; 29 de junio, lunes, Moros y Cristianos»: los dos días son martes en 2027 (y lunes en 2026), así que las fechas no son fiables." },
  { ...town("CL", "León", "24222", "Villaquilambre", 18905, 2877), reason: "El anexo del BOP de León núm. 144, de 31.7.2026, no incluye Villaquilambre (pasa de Villaquejida a Villarejo de Órbigo)." },
  { ...town("CL", "León", "24008", "Astorga", 10305, 2877), reason: "El anexo del BOP de León núm. 144, de 31.7.2026, no incluye Astorga (pasa de Arganza a La Bañeza)." },
  { ...town("CL", "Zamora", "49021", "Benavente", 17309, 2906), reason: "La lista del BOP de Zamora no incluye Benavente (pasa de Belver de los Montes a Benegiles)." },
];
