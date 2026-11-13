import type { Region } from "@/lib/programmatic/holidays/boe-2027";

import type { CityRow, LocalDay, LocalList } from "./cities-data";
import { SOURCES, type OfficialText } from "./sources";

/**
 * The 20,000+ wave of the 2027 city pages (13 Nov 2026): the municipalities
 * below the core's 50,000 (cities-data.ts) where people do search for their
 * work calendar, each with its two local days from the official 2027 list.
 *
 * Selection rule (documented here because it decides which pages exist):
 *  1. Population: every municipality outside Catalonia, Ceuta and Melilla
 *     with 20,000 inhabitants or more at 1 January 2025 (INE, Real Decreto
 *     1117/2025, `INE_POPULATION`; the INE table of each province) and fewer
 *     than 50,000 (those are already core rows). Mid-size towns are where the
 *     site already ranks 5–9 (Alcobendas, Torrelavega, Marbella) with no
 *     competitor page of the same depth.
 *  2. Plus any smaller municipality named in a Search Console query of the
 *     holiday family ("festivos <town> 2027|2026", "calendario laboral
 *     <town>", "fiestas locales <town>", "es festivo hoy en <town>") between
 *     1 Aug and 12 Nov 2026 (`GSC_SMALL_TOWNS`). Matches that were really
 *     another place (a Catalan town, "Todos los Santos") are not counted.
 *  3. A page is built only when the community's (or province's) official
 *     2027 list is published AND names the town with its two days. Every row
 *     below was transcribed from that bulletin on `MORE_READ_ON` (its
 *     verbatim line is the comment above the row) and, where the community
 *     publishes one, checked against its own open-data set (Andalucía's
 *     work-calendar API, the Xunta's "Calendario laboral 2027"); where the two
 *     disagree on a date, the bulletin wins (Lepe: the BOJA's "10 DEMAYO",
 *     absent from the API). A town whose bulletin day is already a BOE
 *     holiday of its community gets no page until that is cleared up
 *     (Cangas: the DOG gives 19 March, San José in Galicia).
 *  4. Otherwise the town waits in `WAITING_TOWNS`, with no page: its
 *     community has not published (reason "pending": Aragón, Cantabria,
 *     Castilla-La Mancha, Madrid, Navarra, Comunitat Valenciana as of
 *     13 Nov 2026), or the published list leaves it out (reason "missing").
 *     Unlike the core rows, a waiting town never gets a page with its 2026
 *     days: no page until its 2027 days are official.
 *
 * Adding a community the day it publishes: put its 2027 text in sources.ts
 * (`local.y2027`, status "published"), move its towns from `WAITING_TOWNS`
 * to rows here with the days, the bulletin line and `MORE_READ_ON` of that
 * day; tests/spain-cities-2027-more.test.ts fails until both are done.
 */

/** The day every row below was read on its bulletin. */
export const MORE_READ_ON = "2026-11-13";
/** A test fails from this day until the pending communities are read again (DOGV expected any day; the rest from late November). */
export const WAITING_RECHECK_BY = "2026-11-20";
export const MORE_MIN_POPULATION = 20_000;

/** Smaller municipalities selected by a real Search Console query (rule 2): 1 Aug – 12 Nov 2026, impressions summed over pages. */
export const GSC_SMALL_TOWNS: readonly { ine: string; population: number; query: string; impressions: number }[] = [
  { ine: "41029", population: 17074, query: "es festivo hoy en castilleja de la cuesta", impressions: 1 },
];

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
  return { ...base, region, province, status2027: "published", local2027: local, local2026: null, readOn: MORE_READ_ON };
}

const BOJA = list2027("AN");
const BOPA = list2027("AS");
const BOIB = list2027("IB");
const BOC_CANARIAS = list2027("CN");
const DOE = list2027("EX");
const DOG = list2027("GA");
const BORM = list2027("MC");
const BOR = list2027("RI");

/* -------------------------------------------------------------------------- */
/* The rows: one per town, the bulletin's line above it                       */
/* -------------------------------------------------------------------------- */

const ANDALUCIA: CityRow[] = [
  // BOJA: «SEVILLA > MAIRENA DEL ALJARAFE 23 DE ENERO 25 DE JUNIO»
  row("AN", "Sevilla", { ine: "41059", slug: "mairena-del-aljarafe", name: "Mairena del Aljarafe", ineName: "Mairena del Aljarafe", population: 48017, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-01-23", null), d("2027-06-25", null)])),
  // BOJA: «MÁLAGA > ALHAURÍN DE LA TORRE 20 DE ENERO 24 DE JUNIO»
  row("AN", "Málaga", { ine: "29007", slug: "alhaurin-de-la-torre", name: "Alhaurín de la Torre", ineName: "Alhaurín de la Torre", population: 45066, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-01-20", null), d("2027-06-24", null)])),
  // BOJA: «CÓRDOBA > LUCENA 03 DE MAYO 10 DE SEPTIEMBRE»
  row("AN", "Córdoba", { ine: "14038", slug: "lucena", name: "Lucena", ineName: "Lucena", population: 43408, ineTable: 2901, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-09-10", null)])),
  // BOJA: «CÁDIZ > PUERTO REAL 11 DE FEBRERO 10 DE MAYO»
  row("AN", "Cádiz", { ine: "11028", slug: "puerto-real", name: "Puerto Real", ineName: "Puerto Real", population: 42527, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-02-11", null), d("2027-05-10", null)])),
  // BOJA: «MÁLAGA > ANTEQUERA 20 DE AGOSTO 08 DE SEPTIEMBRE»
  row("AN", "Málaga", { ine: "29015", slug: "antequera", name: "Antequera", ineName: "Antequera", population: 41849, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-08-20", null), d("2027-09-08", null)])),
  // BOJA: «SEVILLA > RINCONADA, LA 19 DE MARZO 15 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41081", slug: "la-rinconada", name: "La Rinconada", ineName: "Rinconada, La", population: 40724, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-03-19", null), d("2027-09-15", null)])),
  // BOJA: «SEVILLA > ÉCIJA 08 DE SEPTIEMBRE 17 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41039", slug: "ecija", name: "Écija", ineName: "Écija", population: 39659, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-09-08", null), d("2027-09-17", null)])),
  // BOJA: «SEVILLA > PALACIOS Y VILLAFRANCA, LOS 05 DE AGOSTO 23 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41069", slug: "los-palacios-y-villafranca", name: "Los Palacios y Villafranca", short: "Los Palacios", ineName: "Palacios y Villafranca, Los", population: 38761, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-08-05", null), d("2027-09-23", null)])),
  // BOJA: «JAÉN > ANDÚJAR 26 DE ABRIL 13 DE SEPTIEMBRE»
  row("AN", "Jaén", { ine: "23005", slug: "andujar", name: "Andújar", ineName: "Andújar", population: 35610, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-04-26", null), d("2027-09-13", null)])),
  // BOJA: «CÁDIZ > SAN ROQUE 21 DE MAYO 16 DE JULIO»
  row("AN", "Cádiz", { ine: "11033", slug: "san-roque", name: "San Roque", ineName: "San Roque", population: 34310, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-05-21", null), d("2027-07-16", null)])),
  // BOJA: «MÁLAGA > RONDA 25 DE ENERO 02 DE SEPTIEMBRE»
  row("AN", "Málaga", { ine: "29084", slug: "ronda", name: "Ronda", ineName: "Ronda", population: 33671, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-01-25", null), d("2027-09-02", null)])),
  // BOJA: «JAÉN > ÚBEDA 08 DE SEPTIEMBRE 29 DE SEPTIEMBRE»
  row("AN", "Jaén", { ine: "23092", slug: "ubeda", name: "Úbeda", ineName: "Úbeda", population: 33588, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-09-08", null), d("2027-09-29", null)])),
  // BOJA: «ALMERÍA > NÍJAR 20 DE ENERO 15 DE MAYO»
  row("AN", "Almería", { ine: "04066", slug: "nijar", name: "Níjar", ineName: "Níjar", population: 33319, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-01-20", null), d("2027-05-15", null)])),
  // BOJA: «SEVILLA > CORIA DEL RÍO 08 DE SEPTIEMBRE 20 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41034", slug: "coria-del-rio", name: "Coria del Río", ineName: "Coria del Río", population: 31278, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-09-08", null), d("2027-09-20", null)])),
  // BOJA: «SEVILLA > CARMONA 14 DE MAYO 08 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41024", slug: "carmona", name: "Carmona", ineName: "Carmona", population: 30240, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-05-14", null), d("2027-09-08", null)])),
  // BOJA: «CÓRDOBA > PUENTE GENIL 26 DE ABRIL 03 DE MAYO»
  row("AN", "Córdoba", { ine: "14056", slug: "puente-genil", name: "Puente Genil", ineName: "Puente Genil", population: 29963, ineTable: 2901, capital: false }, y27(BOJA, [d("2027-04-26", null), d("2027-05-03", null)])),
  // BOJA: «HUELVA > LEPE 10 DEMAYO 17 DE AGOSTO»
  row("AN", "Huelva", { ine: "21044", slug: "lepe", name: "Lepe", ineName: "Lepe", population: 29677, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-05-10", null), d("2027-08-17", null)])),
  // BOJA: «ALMERÍA > VÍCAR 21 DE JUNIO 20 DE SEPTIEMBRE»
  row("AN", "Almería", { ine: "04102", slug: "vicar", name: "Vícar", ineName: "Vícar", population: 29342, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-06-21", null), d("2027-09-20", null)])),
  // BOJA: «MÁLAGA > CÁRTAMA 23 DE ABRIL 15 DE MAYO»
  row("AN", "Málaga", { ine: "29038", slug: "cartama", name: "Cártama", ineName: "Cártama", population: 29333, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-04-23", null), d("2027-05-15", null)])),
  // BOJA: «CÁDIZ > ROTA 03 DE MAYO 07 DE OCTUBRE»
  row("AN", "Cádiz", { ine: "11030", slug: "rota", name: "Rota", ineName: "Rota", population: 29289, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-10-07", null)])),
  // BOJA: «SEVILLA > CAMAS 19 DE MARZO 10 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41021", slug: "camas", name: "Camas", ineName: "Camas", population: 29089, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-03-19", null), d("2027-09-10", null)])),
  // BOJA: «SEVILLA > LEBRIJA 09 DE SEPTIEMBRE 10 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41053", slug: "lebrija", name: "Lebrija", ineName: "Lebrija", population: 27788, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-09-09", null), d("2027-09-10", null)])),
  // BOJA: «MÁLAGA > ALHAURÍN EL GRANDE 03 DE MAYO 28 DE MAYO»
  row("AN", "Málaga", { ine: "29008", slug: "alhaurin-el-grande", name: "Alhaurín el Grande", ineName: "Alhaurín el Grande", population: 27552, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-05-28", null)])),
  // BOJA: «GRANADA > ALMUÑÉCAR 19 DE MARZO 24 DE JUNIO»
  row("AN", "Granada", { ine: "18017", slug: "almunecar", name: "Almuñécar", ineName: "Almuñécar", population: 27544, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-03-19", null), d("2027-06-24", null)])),
  // BOJA: «SEVILLA > MORÓN DE LA FRONTERA 17 DE SEPTIEMBRE 20 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41065", slug: "moron-de-la-frontera", name: "Morón de la Frontera", ineName: "Morón de la Frontera", population: 27210, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-09-17", null), d("2027-09-20", null)])),
  // BOJA: «MÁLAGA > COÍN 03 DE MAYO 07 DE JUNIO»
  row("AN", "Málaga", { ine: "29042", slug: "coin", name: "Coín", ineName: "Coín", population: 26574, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-06-07", null)])),
  // BOJA: «ALMERÍA > ADRA 08 DE SEPTIEMBRE 10 DE SEPTIEMBRE»
  row("AN", "Almería", { ine: "04003", slug: "adra", name: "Adra", ineName: "Adra", population: 25501, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-09-08", null), d("2027-09-10", null)])),
  // BOJA: «SEVILLA > TOMARES 27 DE MAYO 03 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41093", slug: "tomares", name: "Tomares", ineName: "Tomares", population: 25432, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-05-27", null), d("2027-09-03", null)])),
  // BOJA: «GRANADA > ARMILLA 27 DE MAYO 29 DE SEPTIEMBRE»
  row("AN", "Granada", { ine: "18021", slug: "armilla", name: "Armilla", ineName: "Armilla", population: 25300, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-05-27", null), d("2027-09-29", null)])),
  // BOJA: «HUELVA > ALMONTE 17 DE MAYO 05 DE JULIO»
  row("AN", "Huelva", { ine: "21005", slug: "almonte", name: "Almonte", ineName: "Almonte", population: 24864, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-05-17", null), d("2027-07-05", null)])),
  // BOJA: «JAÉN > MARTOS 05 DE MAYO 29 DE JULIO»
  row("AN", "Jaén", { ine: "23060", slug: "martos", name: "Martos", ineName: "Martos", population: 24462, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-05-05", null), d("2027-07-29", null)])),
  // BOJA: «CÁDIZ > BARRIOS, LOS 14 DE MAYO 16 DE JULIO»
  row("AN", "Cádiz", { ine: "11008", slug: "los-barrios", name: "Los Barrios", ineName: "Barrios, Los", population: 24449, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-05-14", null), d("2027-07-16", null)])),
  // BOJA: «SEVILLA > MAIRENA DEL ALCOR 12 DE ABRIL 08 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41058", slug: "mairena-del-alcor", name: "Mairena del Alcor", ineName: "Mairena del Alcor", population: 24339, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-04-12", null), d("2027-09-08", null)])),
  // BOJA: «CÁDIZ > CONIL DE LA FRONTERA 16 DE JULIO 08 DE SEPTIEMBRE»
  row("AN", "Cádiz", { ine: "11014", slug: "conil-de-la-frontera", name: "Conil de la Frontera", ineName: "Conil de la Frontera", population: 24102, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-07-16", null), d("2027-09-08", null)])),
  // BOJA: «HUELVA > MOGUER 10 DE MAYO 08 DE SEPTIEMBRE»
  row("AN", "Huelva", { ine: "21050", slug: "moguer", name: "Moguer", ineName: "Moguer", population: 24083, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-05-10", null), d("2027-09-08", null)])),
  // BOJA: «GRANADA > GABIAS, LAS 03 DE MAYO 05 DE AGOSTO»
  row("AN", "Granada", { ine: "18905", slug: "las-gabias", name: "Las Gabias", ineName: "Gabias, Las", population: 23584, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-08-05", null)])),
  // BOJA: «SEVILLA > SAN JUAN DE AZNALFARACHE 27 DE MAYO 24 DE JUNIO»
  row("AN", "Sevilla", { ine: "41086", slug: "san-juan-de-aznalfarache", name: "San Juan de Aznalfarache", ineName: "San Juan de Aznalfarache", population: 23408, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-05-27", null), d("2027-06-24", null)])),
  // BOJA: «SEVILLA > BORMUJOS 12 DE MAYO 27 DE AGOSTO»
  row("AN", "Sevilla", { ine: "41017", slug: "bormujos", name: "Bormujos", ineName: "Bormujos", population: 23071, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-05-12", null), d("2027-08-27", null)])),
  // BOJA: «HUELVA > ALJARAQUE 03 DE MAYO 07 DE JUNIO»
  row("AN", "Huelva", { ine: "21002", slug: "aljaraque", name: "Aljaraque", ineName: "Aljaraque", population: 22737, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-06-07", null)])),
  // BOJA: «CÁDIZ > BARBATE 30 DE ABRIL 16 DE JULIO»
  row("AN", "Cádiz", { ine: "11007", slug: "barbate", name: "Barbate", ineName: "Barbate", population: 22635, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-04-30", null), d("2027-07-16", null)])),
  // BOJA: «CÓRDOBA > MONTILLA 14 DE JULIO 06 DE SEPTIEMBRE»
  row("AN", "Córdoba", { ine: "14042", slug: "montilla", name: "Montilla", ineName: "Montilla", population: 22305, ineTable: 2901, capital: false }, y27(BOJA, [d("2027-07-14", null), d("2027-09-06", null)])),
  // BOJA: «GRANADA > MARACENA 19 DE MARZO 13 DE AGOSTO»
  row("AN", "Granada", { ine: "18127", slug: "maracena", name: "Maracena", ineName: "Maracena", population: 22294, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-03-19", null), d("2027-08-13", null)])),
  // BOJA: «MÁLAGA > NERJA 24 DE JUNIO 16 DE JULIO»
  row("AN", "Málaga", { ine: "29075", slug: "nerja", name: "Nerja", ineName: "Nerja", population: 22132, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-06-24", null), d("2027-07-16", null)])),
  // BOJA: «MÁLAGA > TORROX 05 DE AGOSTO 01 DE OCTUBRE»
  row("AN", "Málaga", { ine: "29091", slug: "torrox", name: "Torrox", ineName: "Torrox", population: 22015, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-08-05", null), d("2027-10-01", null)])),
  // BOJA: «HUELVA > AYAMONTE 10 DE FEBRERO 08 DE SEPTIEMBRE»
  row("AN", "Huelva", { ine: "21010", slug: "ayamonte", name: "Ayamonte", ineName: "Ayamonte", population: 22001, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-02-10", null), d("2027-09-08", null)])),
  // BOJA: «CÓRDOBA > PRIEGO DE CÓRDOBA 27 DE MAYO 06 DE SEPTIEMBRE»
  row("AN", "Córdoba", { ine: "14055", slug: "priego-de-cordoba", name: "Priego de Córdoba", ineName: "Priego de Córdoba", population: 21764, ineTable: 2901, capital: false }, y27(BOJA, [d("2027-05-27", null), d("2027-09-06", null)])),
  // BOJA: «HUELVA > ISLA CRISTINA 16 DE JULIO 07 DE OCTUBRE»
  row("AN", "Huelva", { ine: "21042", slug: "isla-cristina", name: "Isla Cristina", ineName: "Isla Cristina", population: 21525, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-07-16", null), d("2027-10-07", null)])),
  // BOJA: «JAÉN > ALCALÁ LA REAL 17 DE SEPTIEMBRE 20 DE DICIEMBRE»
  row("AN", "Jaén", { ine: "23002", slug: "alcala-la-real", name: "Alcalá la Real", ineName: "Alcalá la Real", population: 21496, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-09-17", null), d("2027-12-20", null)])),
  // BOJA: «HUELVA > CARTAYA 30 DE SEPTIEMBRE 01 DE OCTUBRE»
  row("AN", "Huelva", { ine: "21021", slug: "cartaya", name: "Cartaya", ineName: "Cartaya", population: 21471, ineTable: 2874, capital: false }, y27(BOJA, [d("2027-09-30", null), d("2027-10-01", null)])),
  // BOJA: «GRANADA > LOJA 26 DE ABRIL 30 DE AGOSTO»
  row("AN", "Granada", { ine: "18122", slug: "loja", name: "Loja", ineName: "Loja", population: 20951, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-04-26", null), d("2027-08-30", null)])),
  // BOJA: «GRANADA > ATARFE 23 DE JULIO 26 DE JULIO»
  row("AN", "Granada", { ine: "18022", slug: "atarfe", name: "Atarfe", ineName: "Atarfe", population: 20914, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-07-23", null), d("2027-07-26", null)])),
  // BOJA: «ALMERÍA > HUÉRCAL-OVERA 15 DE OCTUBRE 19 DE OCTUBRE»
  row("AN", "Almería", { ine: "04053", slug: "huercal-overa", name: "Huércal-Overa", ineName: "Huércal-Overa", population: 20860, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-10-15", null), d("2027-10-19", null)])),
  // BOJA: «GRANADA > BAZA 08 DE SEPTIEMBRE 04 DE DICIEMBRE»
  row("AN", "Granada", { ine: "18023", slug: "baza", name: "Baza", ineName: "Baza", population: 20587, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-09-08", null), d("2027-12-04", null)])),
  // BOJA: «CÓRDOBA > PALMA DEL RIO 17 DE MAYO 08 DE SEPTIEMBRE»
  row("AN", "Córdoba", { ine: "14049", slug: "palma-del-rio", name: "Palma del Río", ineName: "Palma del Río", population: 20438, ineTable: 2901, capital: false }, y27(BOJA, [d("2027-05-17", null), d("2027-09-08", null)])),
  // BOJA: «GRANADA > ZUBIA, LA 17 DE MAYO 27 DE MAYO»
  row("AN", "Granada", { ine: "18193", slug: "la-zubia", name: "La Zubia", ineName: "Zubia, La", population: 20389, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-05-17", null), d("2027-05-27", null)])),
  // BOJA: «ALMERÍA > VERA 10 DE JUNIO 25 DE SEPTIEMBRE»
  row("AN", "Almería", { ine: "04100", slug: "vera", name: "Vera", ineName: "Vera", population: 20282, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-06-10", null), d("2027-09-25", null)])),
  // BOJA: «CÁDIZ > CHIPIONA 15 DE FEBRERO 08 DE SEPTIEMBRE»
  row("AN", "Cádiz", { ine: "11016", slug: "chipiona", name: "Chipiona", ineName: "Chipiona", population: 20076, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-02-15", null), d("2027-09-08", null)])),
  // BOJA: «SEVILLA > CASTILLEJA DE LA CUESTA 29 DE MARZO 17 DE SEPTIEMBRE»
  row("AN", "Sevilla", { ine: "41029", slug: "castilleja-de-la-cuesta", name: "Castilleja de la Cuesta", ineName: "Castilleja de la Cuesta", population: 17074, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-03-29", null), d("2027-09-17", null)])),
];

const ASTURIAS: CityRow[] = [
  // BOPA: «LANGREO | 9 de febrero Martes de Carnaval | 29 de junio San Pedro»
  row("AS", "Asturias", { ine: "33031", slug: "langreo", name: "Langreo", ineName: "Langreo", population: 38612, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-02-09", "Martes de Carnaval"), d("2027-06-29", "San Pedro")])),
  // BOPA: «MIERES | 24 de junio Festividad de San Juan, en todo el Municipio excepto en el Valle de Turón | 14 de septiembre Festividad del Santísimo Cristo de la Paz, en el Valle de Turón | 27 de septiembre Mártires de Valdecuna, San Cosme y San Damián, en todo el Municipio»
  row("AS", "Asturias", { ine: "33037", slug: "mieres", name: "Mieres", ineName: "Mieres", population: 36373, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-06-24", "Festividad de San Juan", { note: "en todo el Municipio excepto en el Valle de Turón" }), d("2027-09-27", "Mártires de Valdecuna, San Cosme y San Damián", { note: "en todo el Municipio" })], { mainArea: "Todo el municipio salvo el Valle de Turón", zones: [{ place: "Valle de Turón", days: [d("2027-09-14", "Festividad del Santísimo Cristo de la Paz", { note: "en el Valle de Turón" }), d("2027-09-27", "Mártires de Valdecuna, San Cosme y San Damián", { note: "en todo el Municipio" })] }] })),
  // BOPA: «CASTRILLÓN | 29 de marzo Lunes de Pascua | 5 de julio Día de Castrillón»
  row("AS", "Asturias", { ine: "33016", slug: "castrillon", name: "Castrillón", ineName: "Castrillón", population: 21998, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-03-29", "Lunes de Pascua"), d("2027-07-05", "Día de Castrillón")])),
];

const BALEARES: CityRow[] = [
  // BOIB: «Manacor | Manacor 30 de marzo / 7 de diciembre | Porto Cristo 16 de julio / 7 de diciembre»
  row("IB", "Illes Balears", { ine: "07033", slug: "manacor", name: "Manacor", ineName: "Manacor", population: 49153, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-03-30", null), d("2027-12-07", null)], { mainArea: "Manacor", zones: [{ place: "Porto Cristo", days: [d("2027-07-16", null), d("2027-12-07", null)] }] })),
  // BOIB: «Santa Eulària des Riu | Parroquia de Jesús 12 de febrero Santa Eulalia / 8 de septiembre Nuestra Señora de Jesús | Parroquia de Sant Carles de Peralta 12 de febrero Santa Eulalia / 4 de noviembre San Carlos | Parroquia de Santa Gertrudis de Fruitera 12 de febrero Santa Eulalia / 16 de noviembre Santa Gertrudis | Parroquias de Santa Eulària i Puig d'en Valls 12 de febrero Santa Eulalia / 5 de agosto Santa María de las Nieves»
  row("IB", "Illes Balears", { ine: "07054", slug: "santa-eularia-des-riu", name: "Santa Eulària des Riu", short: "Santa Eulària", ineName: "Santa Eulària des Riu", population: 42479, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-02-12", "Santa Eulalia"), d("2027-08-05", "Santa María de las Nieves")], { mainArea: "Parroquias de Santa Eulària i Puig d'en Valls", zones: [{ place: "Parroquia de Jesús", days: [d("2027-02-12", "Santa Eulalia"), d("2027-09-08", "Nuestra Señora de Jesús")] }, { place: "Parroquia de Sant Carles de Peralta", days: [d("2027-02-12", "Santa Eulalia"), d("2027-11-04", "San Carlos")] }, { place: "Parroquia de Santa Gertrudis de Fruitera", days: [d("2027-02-12", "Santa Eulalia"), d("2027-11-16", "Santa Gertrudis")] }] })),
  // BOIB: «Llucmajor 29 de septiembre San Miguel | 18 de octubre Firó»
  row("IB", "Illes Balears", { ine: "07031", slug: "llucmajor", name: "Llucmajor", ineName: "Llucmajor", population: 40502, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-09-29", "San Miguel"), d("2027-10-18", "Firó")])),
  // BOIB: «Marratxí 30 de junio San Marcial | 11 de octubre»
  row("IB", "Illes Balears", { ine: "07036", slug: "marratxi", name: "Marratxí", ineName: "Marratxí", population: 40422, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-06-30", "San Marcial"), d("2027-10-11", null)])),
  // BOIB: «Inca 30 de julio San Abdón y San Senén | 19 de noviembre Viernes después del Dijous Bo»
  row("IB", "Illes Balears", { ine: "07027", slug: "inca", name: "Inca", ineName: "Inca", population: 36262, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-07-30", "San Abdón y San Senén"), d("2027-11-19", "Viernes después del Dijous Bo")])),
  // BOIB: «2.2. Isla de Menorca ... Ciutadella 24 de junio San Juan | 25 de junio Sant Joanet»
  row("IB", "Illes Balears", { ine: "07015", slug: "ciutadella-de-menorca", name: "Ciutadella de Menorca", short: "Ciutadella", ineName: "Ciutadella de Menorca", population: 32431, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-06-24", "San Juan"), d("2027-06-25", "Sant Joanet")])),
  // BOIB: «2.2. Isla de Menorca ... Mahón 8 de septiembre Virgen de Gracia | 9 de septiembre Segunda fiesta Virgen de Gracia»
  row("IB", "Illes Balears", { ine: "07032", slug: "mahon", name: "Mahón", ineName: "Maó", population: 30666, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-09-08", "Virgen de Gracia"), d("2027-09-09", "Segunda fiesta Virgen de Gracia")])),
  // BOIB: «Sant Josep de sa Talaia | Parroquias de Sant Jordi de ses Salines i Sant Francesc de s'Estany 23 de abril San Jorge / 5 de agosto Santa María de las Nieves | Parroquias de Sant Josep de sa Talaia, Es Cubells i Sant Agustí des Vedrà 19 de marzo San José / 5 de agosto Santa María de las Nieves»
  row("IB", "Illes Balears", { ine: "07048", slug: "sant-josep-de-sa-talaia", name: "Sant Josep de sa Talaia", short: "Sant Josep", ineName: "Sant Josep de sa Talaia", population: 29761, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-03-19", "San José"), d("2027-08-05", "Santa María de las Nieves")], { mainArea: "Parroquias de Sant Josep de sa Talaia, Es Cubells i Sant Agustí des Vedrà", zones: [{ place: "Parroquias de Sant Jordi de ses Salines i Sant Francesc de s'Estany", days: [d("2027-04-23", "San Jorge"), d("2027-08-05", "Santa María de las Nieves")] }] })),
  // BOIB: «Sant Antoni de Portmany | Parroquia de Sant Antoni 5 de agosto Santa María de las Nieves / 24 de agosto San Bartolomé | Parroquia de Sant Mateu 5 de agosto Santa María de las Nieves / 21 de septiembre San Mateo | Parroquia de Sant Rafel 5 de agosto Santa María de las Nieves / 24 de agosto San Bartolomé | Parroquia de Santa Agnès 21 de enero Santa Inés / 5 de agosto Santa María de las Nieves»
  row("IB", "Illes Balears", { ine: "07046", slug: "sant-antoni-de-portmany", name: "Sant Antoni de Portmany", short: "Sant Antoni", ineName: "Sant Antoni de Portmany", population: 29132, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-08-05", "Santa María de las Nieves"), d("2027-08-24", "San Bartolomé")], { mainArea: "Parroquia de Sant Antoni", zones: [{ place: "Parroquia de Sant Mateu", days: [d("2027-08-05", "Santa María de las Nieves"), d("2027-09-21", "San Mateo")] }, { place: "Parroquia de Sant Rafel", days: [d("2027-08-05", "Santa María de las Nieves"), d("2027-08-24", "San Bartolomé")] }, { place: "Parroquia de Santa Agnès", days: [d("2027-01-21", "Santa Inés"), d("2027-08-05", "Santa María de las Nieves")] }] })),
  // BOIB: «Alcúdia 29 de junio San Pedro | 2 de julio Virgen de la Victoria»
  row("IB", "Illes Balears", { ine: "07003", slug: "alcudia", name: "Alcúdia", ineName: "Alcúdia", population: 21907, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-06-29", "San Pedro"), d("2027-07-02", "Virgen de la Victoria")])),
];

const CANARIAS: CityRow[] = [
  // BOC: «PUERTO DEL ROSARIO. 16 de febrero: Martes de Carnaval. 7 de octubre: Festividad de Nuestra Señora del Rosario.»
  row("CN", "Las Palmas", { ine: "35017", slug: "puerto-del-rosario", name: "Puerto del Rosario", ineName: "Puerto del Rosario", population: 46150, ineTable: 2889, capital: false, island: "Fuerteventura" }, y27(BOC_CANARIAS, [d("2027-02-16", "Martes de Carnaval"), d("2027-10-07", "Festividad de Nuestra Señora del Rosario")])),
  // BOC: «LA OROTAVA. 9 de febrero: Martes de Carnaval. 3 de junio: Infraoctava del Corpus Christi.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38026", slug: "la-orotava", name: "La Orotava", ineName: "Orotava, La", population: 42514, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-06-03", "Infraoctava del Corpus Christi")])),
  // BOC: «ARUCAS. 9 de febrero: Martes de Carnaval. 24 de junio: Festividad de San Juan Bautista.»
  row("CN", "Las Palmas", { ine: "35006", slug: "arucas", name: "Arucas", ineName: "Arucas", population: 39232, ineTable: 2889, capital: false, island: "Gran Canaria" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-06-24", "Festividad de San Juan Bautista")])),
  // BOC: «LOS REALEJOS. 22 de enero: Festividad de San Vicente. 3 de mayo: Exaltación de la Santa Cruz.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38031", slug: "los-realejos", name: "Los Realejos", ineName: "Realejos, Los", population: 37867, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-01-22", "Festividad de San Vicente"), d("2027-05-03", "Exaltación de la Santa Cruz")])),
  // BOC: «AGÜIMES. 20 de enero: Festividad de San Sebastián. 11 de febrero: Jueves de Carnaval.»
  row("CN", "Las Palmas", { ine: "35002", slug: "aguimes", name: "Agüimes", ineName: "Agüimes", population: 33800, ineTable: 2889, capital: false, island: "Gran Canaria" }, y27(BOC_CANARIAS, [d("2027-01-20", "Festividad de San Sebastián"), d("2027-02-11", "Jueves de Carnaval")])),
  // BOC: «INGENIO. 2 de febrero: Festividad de Nuestra Señora de la Candelaria. 29 de junio: Festividad del Apóstol San Pedro.»
  row("CN", "Las Palmas", { ine: "35011", slug: "ingenio", name: "Ingenio", ineName: "Ingenio", population: 32905, ineTable: 2889, capital: false, island: "Gran Canaria" }, y27(BOC_CANARIAS, [d("2027-02-02", "Festividad de Nuestra Señora de la Candelaria"), d("2027-06-29", "Festividad del Apóstol San Pedro")])),
  // BOC: «PUERTO DE LA CRUZ. 3 de mayo: Festividad de la Exaltación de la Santa Cruz. 13 de julio: Festividad de la Virgen del Carmen.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38028", slug: "puerto-de-la-cruz", name: "Puerto de la Cruz", ineName: "Puerto de la Cruz", population: 31137, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-05-03", "Festividad de la Exaltación de la Santa Cruz"), d("2027-07-13", "Festividad de la Virgen del Carmen")])),
  // BOC: «LA OLIVA. 2 de febrero: Festividad Nuestra Señora de la Candelaria. 16 de julio: Festividad Nuestra Señora del Carmen.»
  row("CN", "Las Palmas", { ine: "35014", slug: "la-oliva", name: "La Oliva", ineName: "Oliva, La", population: 30022, ineTable: 2889, capital: false, island: "Fuerteventura" }, y27(BOC_CANARIAS, [d("2027-02-02", "Festividad Nuestra Señora de la Candelaria"), d("2027-07-16", "Festividad Nuestra Señora del Carmen")])),
  // BOC: «CANDELARIA. 23 de febrero: Martes de Carnaval. 26 de julio: Festividad de Santa Ana.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38011", slug: "candelaria", name: "Candelaria", ineName: "Candelaria", population: 29023, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-02-23", "Martes de Carnaval"), d("2027-07-26", "Festividad de Santa Ana")])),
  // BOC: «GÁLDAR. 15 de mayo: Festividad de San Isidro Labrador. 26 de julio: Festividad de Santa Ana.»
  row("CN", "Las Palmas", { ine: "35009", slug: "galdar", name: "Gáldar", ineName: "Gáldar", population: 25108, ineTable: 2889, capital: false, island: "Gran Canaria" }, y27(BOC_CANARIAS, [d("2027-05-15", "Festividad de San Isidro Labrador"), d("2027-07-26", "Festividad de Santa Ana")])),
  // BOC: «TACORONTE. 9 de febrero: Martes de Carnaval. 25 de noviembre: Festividad de Santa Catalina.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38043", slug: "tacoronte", name: "Tacoronte", ineName: "Tacoronte", population: 24619, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-11-25", "Festividad de Santa Catalina")])),
  // BOC: «ICOD DE LOS VINOS. 23 de febrero: Martes de Carnaval. 26 de abril: Lunes posterior a la Festividad de San Marcos Evangelista.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38022", slug: "icod-de-los-vinos", name: "Icod de los Vinos", ineName: "Icod de los Vinos", population: 24616, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-02-23", "Martes de Carnaval"), d("2027-04-26", "Lunes posterior a la Festividad de San Marcos Evangelista")])),
  // BOC: «TEGUISE. 16 de julio: Festividad Nuestra Señora del Carmen. 5 de agosto: Festividad Nuestra Señora de Las Nieves.»
  row("CN", "Las Palmas", { ine: "35024", slug: "teguise", name: "Teguise", ineName: "Teguise", population: 24027, ineTable: 2889, capital: false, island: "Lanzarote y La Graciosa" }, y27(BOC_CANARIAS, [d("2027-07-16", "Festividad Nuestra Señora del Carmen"), d("2027-08-05", "Festividad Nuestra Señora de Las Nieves")])),
  // BOC: «SAN MIGUEL DE ABONA. 9 de febrero: Martes de Carnaval. 29 de septiembre: Festividad de San Miguel Arcángel.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38035", slug: "san-miguel-de-abona", name: "San Miguel de Abona", ineName: "San Miguel de Abona", population: 23960, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-09-29", "Festividad de San Miguel Arcángel")])),
  // BOC: «GUÍA DE ISORA. 24 de junio: Festividad de San Juan Bautista. 20 de septiembre: Festividad del Santísimo Cristo de la Dulce Muerte.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38019", slug: "guia-de-isora", name: "Guía de Isora", ineName: "Guía de Isora", population: 22654, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-06-24", "Festividad de San Juan Bautista"), d("2027-09-20", "Festividad del Santísimo Cristo de la Dulce Muerte")])),
  // BOC: «GÜÍMAR. 29 de junio: Festividad de San Pedro Apóstol. 7 de septiembre: Festividad de Nuestra Señora del Socorro.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38020", slug: "guimar", name: "Güímar", ineName: "Güímar", population: 22009, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-06-29", "Festividad de San Pedro Apóstol"), d("2027-09-07", "Festividad de Nuestra Señora del Socorro")])),
  // BOC: «TÍAS. 2 de febrero: Festividad Nuestra Señora la Candelaria. 9 de febrero: Martes de Carnaval.»
  row("CN", "Las Palmas", { ine: "35028", slug: "tias", name: "Tías", ineName: "Tías", population: 21613, ineTable: 2889, capital: false, island: "Lanzarote y La Graciosa" }, y27(BOC_CANARIAS, [d("2027-02-02", "Festividad Nuestra Señora la Candelaria"), d("2027-02-09", "Martes de Carnaval")])),
  // BOC: «PÁJARA. 2 de julio: Festividad de Nuestra Señora de Regla. 16 de julio: Festividad de Nuestra Señora del Carmen.»
  row("CN", "Las Palmas", { ine: "35015", slug: "pajara", name: "Pájara", ineName: "Pájara", population: 21570, ineTable: 2889, capital: false, island: "Fuerteventura" }, y27(BOC_CANARIAS, [d("2027-07-02", "Festividad de Nuestra Señora de Regla"), d("2027-07-16", "Festividad de Nuestra Señora del Carmen")])),
  // BOC: «MOGÁN. 14 de junio: Festividad de San Antonio de Padua en Domingo. 16 de julio: Festividad de la Virgen del Carmen.»
  row("CN", "Las Palmas", { ine: "35012", slug: "mogan", name: "Mogán", ineName: "Mogán", population: 21172, ineTable: 2889, capital: false, island: "Gran Canaria" }, y27(BOC_CANARIAS, [d("2027-06-14", "Festividad de San Antonio de Padua en Domingo"), d("2027-07-16", "Festividad de la Virgen del Carmen")])),
  // BOC: «LOS LLANOS DE ARIDANE. 9 de febrero: Martes de Carnaval. 2 de julio: Festividad de Nuestra Señora de los Remedios.»
  row("CN", "Santa Cruz de Tenerife", { ine: "38024", slug: "los-llanos-de-aridane", name: "Los Llanos de Aridane", short: "Los Llanos", ineName: "Llanos de Aridane, Los", population: 20582, ineTable: 2892, capital: false, island: "La Palma" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-07-02", "Festividad de Nuestra Señora de los Remedios")])),
];

const CASTILLA_Y_LEON: CityRow[] = [
  // BOP de Burgos: «MIRANDA DE EBRO | 17/05/2027 | SAN JUAN DEL MONTE; MIRANDA DE EBRO | 13/09/2027 | NUESTRA SEÑORA DE ALTAMIRA»
  row("CL", "Burgos", { ine: "09219", slug: "miranda-de-ebro", name: "Miranda de Ebro", ineName: "Miranda de Ebro", population: 36622, ineTable: 2862, capital: false }, y27(part("CL", "Burgos"), [d("2027-05-17", "San Juan del Monte"), d("2027-09-13", "Nuestra Señora de Altamira")])),
  // BOP de Burgos: «ARANDA DE DUERO | 13/09/2027 | FIESTA LOCAL; ARANDA DE DUERO | 14/09/2027 | FIESTA LOCAL»
  row("CL", "Burgos", { ine: "09018", slug: "aranda-de-duero", name: "Aranda de Duero", ineName: "Aranda de Duero", population: 33956, ineTable: 2862, capital: false }, y27(part("CL", "Burgos"), [d("2027-09-13", null), d("2027-09-14", null)])),
  // BOP de León: «SAN ANDRES DEL RABANEDO: Para todo el Municipio: 24 de junio y 5 de octubre»
  row("CL", "León", { ine: "24142", slug: "san-andres-del-rabanedo", name: "San Andrés del Rabanedo", short: "San Andrés", ineName: "San Andrés del Rabanedo", population: 29944, ineTable: 2877, capital: false }, y27(part("CL", "León"), [d("2027-06-24", null, { note: "para todo el municipio" }), d("2027-10-05", null, { note: "para todo el municipio" })])),
  // BOP de Valladolid: «LAGUNA DE DUERO 13 de mayo 8 de septiembre»
  row("CL", "Valladolid", { ine: "47076", slug: "laguna-de-duero", name: "Laguna de Duero", ineName: "Laguna de Duero", population: 22965, ineTable: 2904, capital: false }, y27(part("CL", "Valladolid"), [d("2027-05-13", null), d("2027-09-08", null)])),
  // BOP de Valladolid: «ARROYO DE LA ENCOMIENDA 6 de mayo 14 de junio»
  row("CL", "Valladolid", { ine: "47010", slug: "arroyo-de-la-encomienda", name: "Arroyo de la Encomienda", short: "Arroyo", ineName: "Arroyo de la Encomienda", population: 22800, ineTable: 2904, capital: false }, y27(part("CL", "Valladolid"), [d("2027-05-06", null), d("2027-06-14", null)])),
  // BOP de Valladolid: «MEDINA DEL CAMPO 14 de junio 2 de septiembre»
  row("CL", "Valladolid", { ine: "47085", slug: "medina-del-campo", name: "Medina del Campo", ineName: "Medina del Campo", population: 20215, ineTable: 2904, capital: false }, y27(part("CL", "Valladolid"), [d("2027-06-14", null), d("2027-09-02", null)])),
];

const EXTREMADURA: CityRow[] = [
  // DOE: «PLASENCIA. 10 de junio y 11 de junio.»
  row("EX", "Cáceres", { ine: "10148", slug: "plasencia", name: "Plasencia", ineName: "Plasencia", population: 40132, ineTable: 2863, capital: false }, y27(DOE, [d("2027-06-10", null), d("2027-06-11", null)])),
  // DOE: «DON BENITO. 29 de marzo y 10 de septiembre.»
  row("EX", "Badajoz", { ine: "06044", slug: "don-benito", name: "Don Benito", ineName: "Don Benito", population: 37986, ineTable: 2859, capital: false }, y27(DOE, [d("2027-03-29", null), d("2027-09-10", null)])),
  // DOE: «ALMENDRALEJO. 19 de marzo y 16 de agosto.»
  row("EX", "Badajoz", { ine: "06011", slug: "almendralejo", name: "Almendralejo", ineName: "Almendralejo", population: 34587, ineTable: 2859, capital: false }, y27(DOE, [d("2027-03-19", null), d("2027-08-16", null)])),
  // DOE: «VILLANUEVA DE LA SERENA. 29 de marzo y 26 de julio.»
  row("EX", "Badajoz", { ine: "06153", slug: "villanueva-de-la-serena", name: "Villanueva de la Serena", ineName: "Villanueva de la Serena", population: 25773, ineTable: 2859, capital: false }, y27(DOE, [d("2027-03-29", null), d("2027-07-26", null)])),
];

const GALICIA: CityRow[] = [
  // DOG: «54. Narón: 24 de junio, San Juan; 23 de noviembre, Día de Narón.»
  row("GA", "A Coruña", { ine: "15054", slug: "naron", name: "Narón", ineName: "Narón", population: 39953, ineTable: 2868, capital: false }, y27(DOG, [d("2027-06-24", "San Juan"), d("2027-11-23", "Día de Narón")])),
  // DOG: «58. Oleiros: 9 de febrero, Martes de Carnaval; 24 de junio, San Juan.»
  row("GA", "A Coruña", { ine: "15058", slug: "oleiros", name: "Oleiros", ineName: "Oleiros", population: 38793, ineTable: 2868, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-06-24", "San Juan")])),
  // DOG: «60. Vilagarcía de Arousa: 22 de mayo, festividad de Santa Rita; 16 de agosto, festividad de San Roque.»
  row("GA", "Pontevedra", { ine: "36060", slug: "vilagarcia-de-arousa", name: "Vilagarcía de Arousa", ineName: "Vilagarcía de Arousa", population: 37888, ineTable: 2890, capital: false }, y27(DOG, [d("2027-05-22", "Festividad de Santa Rita"), d("2027-08-16", "Festividad de San Roque")])),
  // DOG: «5. Arteixo: 9 de febrero, Martes de Carnaval; 26 de julio, fiesta patronal Santiago Apóstol.»
  row("GA", "A Coruña", { ine: "15005", slug: "arteixo", name: "Arteixo", ineName: "Arteixo", population: 34403, ineTable: 2868, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-07-26", "Fiesta patronal Santiago Apóstol")])),
  // DOG: «2. Ames: 6 de mayo, La Ascensión; 24 de junio, San Juan.»
  row("GA", "A Coruña", { ine: "15002", slug: "ames", name: "Ames", ineName: "Ames", population: 33276, ineTable: 2868, capital: false }, y27(DOG, [d("2027-05-06", "La Ascensión"), d("2027-06-24", "San Juan")])),
  // DOG: «19. Carballo: 24 de junio, fiestas patronales de San Juan Bautista; 25 de junio, fiestas patronales de San Juan Bautista.»
  row("GA", "A Coruña", { ine: "15019", slug: "carballo", name: "Carballo", ineName: "Carballo", population: 32120, ineTable: 2868, capital: false }, y27(DOG, [d("2027-06-24", "Fiestas patronales de San Juan Bautista"), d("2027-06-25", "Fiestas patronales de San Juan Bautista")])),
  // DOG: «31. Culleredo: 9 de febrero, Martes de Carnaval; 24 de junio, San Juan.»
  row("GA", "A Coruña", { ine: "15031", slug: "culleredo", name: "Culleredo", ineName: "Culleredo", population: 31254, ineTable: 2868, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-06-24", "San Juan")])),
  // DOG: «45. Redondela: 5 de abril, lunes del Cristo; 27 de mayo, jueves de la Coca.»
  row("GA", "Pontevedra", { ine: "36045", slug: "redondela", name: "Redondela", ineName: "Redondela", population: 28874, ineTable: 2890, capital: false }, y27(DOG, [d("2027-04-05", "Lunes del Cristo"), d("2027-05-27", "Jueves de la Coca")])),
  // DOG: «73. Ribeira: 9 de febrero, Martes de Carnaval; 24 de julio, festividad de la Dorna.»
  row("GA", "A Coruña", { ine: "15073", slug: "ribeira", name: "Ribeira", ineName: "Ribeira", population: 27102, ineTable: 2868, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-07-24", "Festividad de la Dorna")])),
  // DOG: «17. Cambre: 9 de febrero, Martes de Carnaval; 24 de junio, San Juan.»
  row("GA", "A Coruña", { ine: "15017", slug: "cambre", name: "Cambre", ineName: "Cambre", population: 24765, ineTable: 2868, capital: false }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-06-24", "San Juan")])),
  // DOG: «26. Marín: 16 de julio, festividad de la Virgen del Carmen; 8 de septiembre, festividad de la Virgen del Puerto.»
  row("GA", "Pontevedra", { ine: "36026", slug: "marin", name: "Marín", ineName: "Marín", population: 23991, ineTable: 2890, capital: false }, y27(DOG, [d("2027-07-16", "Festividad de la Virgen del Carmen"), d("2027-09-08", "Festividad de la Virgen del Puerto")])),
  // DOG: «39. Ponteareas: 31 de mayo, lunes siguiente a la festividad del Corpus Christi; 29 de septiembre, festividad de San Miguel Arcángel.»
  row("GA", "Pontevedra", { ine: "36042", slug: "ponteareas", name: "Ponteareas", ineName: "Ponteareas", population: 23211, ineTable: 2890, capital: false }, y27(DOG, [d("2027-05-31", "Lunes siguiente a la festividad del Corpus Christi"), d("2027-09-29", "Festividad de San Miguel Arcángel")])),
  // DOG: «43. Porriño, O: 12 de julio, San Benito; 27 de septiembre, fiesta del Cristo.»
  row("GA", "Pontevedra", { ine: "36039", slug: "o-porrino", name: "O Porriño", ineName: "Porriño, O", population: 20965, ineTable: 2890, capital: false }, y27(DOG, [d("2027-07-12", "San Benito"), d("2027-09-27", "Fiesta del Cristo")])),
  // DOG: «24. Lalín: 20 de septiembre, fiestas patronales de la Virgen de los Dolores; 21 de septiembre, fiestas patronales de la Virgen de los Dolores.»
  row("GA", "Pontevedra", { ine: "36024", slug: "lalin", name: "Lalín", ineName: "Lalín", population: 20292, ineTable: 2890, capital: false }, y27(DOG, [d("2027-09-20", "Fiestas patronales de la Virgen de los Dolores"), d("2027-09-21", "Fiestas patronales de la Virgen de los Dolores")])),
  // DOG: «17. Estrada, A: 24 de junio y 25 de junio, fiestas patronales de San Paio.»
  row("GA", "Pontevedra", { ine: "36017", slug: "a-estrada", name: "A Estrada", ineName: "Estrada, A", population: 20112, ineTable: 2890, capital: false }, y27(DOG, [d("2027-06-24", "Fiestas patronales de San Paio"), d("2027-06-25", "Fiestas patronales de San Paio")])),
];

const MURCIA: CityRow[] = [
  // BORM: «5 ALCANTARILLA Viernes 14 Mayo Martes 14 Septiembre»
  row("MC", "Murcia", { ine: "30005", slug: "alcantarilla", name: "Alcantarilla", ineName: "Alcantarilla", population: 43876, ineTable: 2883, capital: false }, y27(BORM, [d("2027-05-14", null, { printedWeekday: "Viernes" }), d("2027-09-14", null, { printedWeekday: "Martes" })])),
  // BORM: «39 TORRE PACHECO Jueves 7 Octubre Lunes 27 Diciembre»
  row("MC", "Murcia", { ine: "30037", slug: "torre-pacheco", name: "Torre-Pacheco", ineName: "Torre-Pacheco", population: 41479, ineTable: 2883, capital: false }, y27(BORM, [d("2027-10-07", null, { printedWeekday: "Jueves" }), d("2027-12-27", null, { printedWeekday: "Lunes" })])),
  // BORM: «3 AGUILAS Martes 9 Febrero Viernes 30 Abril»
  row("MC", "Murcia", { ine: "30003", slug: "aguilas", name: "Águilas", ineName: "Águilas", population: 37811, ineTable: 2883, capital: false }, y27(BORM, [d("2027-02-09", null, { printedWeekday: "Martes" }), d("2027-04-30", null, { printedWeekday: "Viernes" })])),
  // BORM: «36 SAN JAVIER Miércoles 3 Febrero Viernes 3 Diciembre»
  row("MC", "Murcia", { ine: "30035", slug: "san-javier", name: "San Javier", ineName: "San Javier", population: 36524, ineTable: 2883, capital: false }, y27(BORM, [d("2027-02-03", null, { printedWeekday: "Miércoles" }), d("2027-12-03", null, { printedWeekday: "Viernes" })])),
  // BORM: «45 YECLA Lunes 13 Septiembre Martes 7 Diciembre»
  row("MC", "Murcia", { ine: "30043", slug: "yecla", name: "Yecla", ineName: "Yecla", population: 36453, ineTable: 2883, capital: false }, y27(BORM, [d("2027-09-13", null, { printedWeekday: "Lunes" }), d("2027-12-07", null, { printedWeekday: "Martes" })])),
  // BORM: «20 CIEZA Lunes 3 Mayo Martes 24 Agosto»
  row("MC", "Murcia", { ine: "30019", slug: "cieza", name: "Cieza", ineName: "Cieza", population: 35577, ineTable: 2883, capital: false }, y27(BORM, [d("2027-05-03", null, { printedWeekday: "Lunes" }), d("2027-08-24", null, { printedWeekday: "Martes" })])),
  // BORM: «27 MAZARRON Lunes 14 Junio Miércoles 17 Noviembre»
  row("MC", "Murcia", { ine: "30026", slug: "mazarron", name: "Mazarrón", ineName: "Mazarrón", population: 35449, ineTable: 2883, capital: false }, y27(BORM, [d("2027-06-14", null, { printedWeekday: "Lunes" }), d("2027-11-17", null, { printedWeekday: "Miércoles" })])),
  // BORM: «41 TOTANA Jueves 7 Enero Viernes 10 Diciembre»
  row("MC", "Murcia", { ine: "30039", slug: "totana", name: "Totana", ineName: "Totana", population: 33358, ineTable: 2883, capital: false }, y27(BORM, [d("2027-01-07", null, { printedWeekday: "Jueves" }), d("2027-12-10", null, { printedWeekday: "Viernes" })])),
  // BORM: «37 SAN PEDRO DEL PINATAR Martes 29 Junio Viernes 16 Julio»
  row("MC", "Murcia", { ine: "30036", slug: "san-pedro-del-pinatar", name: "San Pedro del Pinatar", ineName: "San Pedro del Pinatar", population: 29674, ineTable: 2883, capital: false }, y27(BORM, [d("2027-06-29", null, { printedWeekday: "Martes" }), d("2027-07-16", null, { printedWeekday: "Viernes" })])),
  // BORM: «23 JUMILLA Lunes 29 Marzo Lunes 26 Julio»
  row("MC", "Murcia", { ine: "30022", slug: "jumilla", name: "Jumilla", ineName: "Jumilla", population: 27574, ineTable: 2883, capital: false }, y27(BORM, [d("2027-03-29", null, { printedWeekday: "Lunes" }), d("2027-07-26", null, { printedWeekday: "Lunes" })])),
  // BORM: «16 CARAVACA DE LA CRUZ Lunes 3 Mayo Martes 4 Mayo»
  row("MC", "Murcia", { ine: "30015", slug: "caravaca-de-la-cruz", name: "Caravaca de la Cruz", ineName: "Caravaca de la Cruz", population: 26126, ineTable: 2883, capital: false }, y27(BORM, [d("2027-05-03", null, { printedWeekday: "Lunes" }), d("2027-05-04", null, { printedWeekday: "Martes" })])),
  // BORM: «9 ALHAMA DE MURCIA Martes 2 Febrero Jueves 7 Octubre»
  row("MC", "Murcia", { ine: "30008", slug: "alhama-de-murcia", name: "Alhama de Murcia", ineName: "Alhama de Murcia", population: 24163, ineTable: 2883, capital: false }, y27(BORM, [d("2027-02-02", null, { printedWeekday: "Martes" }), d("2027-10-07", null, { printedWeekday: "Jueves" })])),
  // BORM: «40 TORRES DE COTILLAS, LAS Martes 30 Marzo Viernes 27 Agosto»
  row("MC", "Murcia", { ine: "30038", slug: "las-torres-de-cotillas", name: "Las Torres de Cotillas", ineName: "Torres de Cotillas, Las", population: 22676, ineTable: 2883, capital: false }, y27(BORM, [d("2027-03-30", null, { printedWeekday: "Martes" }), d("2027-08-27", null, { printedWeekday: "Viernes" })])),
  // BORM: «43 UNION, LA Lunes 26 Julio Jueves 7 Octubre»
  row("MC", "Murcia", { ine: "30041", slug: "la-union", name: "La Unión", ineName: "Unión, La", population: 21380, ineTable: 2883, capital: false }, y27(BORM, [d("2027-07-26", null, { printedWeekday: "Lunes" }), d("2027-10-07", null, { printedWeekday: "Jueves" })])),
  // BORM: «10 ARCHENA Jueves 27 Mayo Miércoles 1 Septiembre»
  row("MC", "Murcia", { ine: "30009", slug: "archena", name: "Archena", ineName: "Archena", population: 20908, ineTable: 2883, capital: false }, y27(BORM, [d("2027-05-27", null, { printedWeekday: "Jueves" }), d("2027-09-01", null, { printedWeekday: "Miércoles" })])),
  // BORM: «6 ALCAZARES, LOS Lunes 29 Marzo Miércoles 13 Octubre»
  row("MC", "Murcia", { ine: "30902", slug: "los-alcazares", name: "Los Alcázares", ineName: "Alcázares, Los", population: 20408, ineTable: 2883, capital: false }, y27(BORM, [d("2027-03-29", null, { printedWeekday: "Lunes" }), d("2027-10-13", null, { printedWeekday: "Miércoles" })])),
];

const PAIS_VASCO: CityRow[] = [
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Santurtzi – 16 de julio (Virgen del Carmen)»
  row("PV", "Bizkaia", { ine: "48082", slug: "santurtzi", name: "Santurtzi", ineName: "Santurtzi", population: 46442, ineTable: 2905, capital: false }, y27(part("PV", "Bizkaia"), [d("2027-07-16", "Virgen del Carmen"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" })])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Portugalete – 16 de agosto (San Roque)»
  row("PV", "Bizkaia", { ine: "48078", slug: "portugalete", name: "Portugalete", ineName: "Portugalete", population: 44843, ineTable: 2905, capital: false }, y27(part("PV", "Bizkaia"), [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" }), d("2027-08-16", "San Roque")])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Basauri – 13 de octubre (San Fausto)»
  row("PV", "Bizkaia", { ine: "48015", slug: "basauri", name: "Basauri", ineName: "Basauri", population: 40274, ineTable: 2905, capital: false }, y27(part("PV", "Bizkaia"), [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" }), d("2027-10-13", "San Fausto")])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / ERRENTERIA | 22 de julio | Día de la Madalena»
  row("PV", "Gipuzkoa", { ine: "20067", slug: "errenteria", name: "Errenteria", ineName: "Errenteria", population: 39363, ineTable: 2873, capital: false }, y27(part("PV", "Gipuzkoa"), [d("2027-07-22", "Día de la Madalena"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Leioa – 24 de junio (San Juan)»
  row("PV", "Bizkaia", { ine: "48054", slug: "leioa", name: "Leioa", ineName: "Leioa", population: 32748, ineTable: 2905, capital: false }, y27(part("PV", "Bizkaia"), [d("2027-06-24", "San Juan"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" })])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Durango – 13 de octubre (San Fausto)»
  row("PV", "Bizkaia", { ine: "48027", slug: "durango", name: "Durango", ineName: "Durango", population: 30192, ineTable: 2905, capital: false }, y27(part("PV", "Bizkaia"), [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" }), d("2027-10-13", "San Fausto")])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Sestao – 29 de junio (San Pedro Apóstol)»
  row("PV", "Bizkaia", { ine: "48084", slug: "sestao", name: "Sestao", ineName: "Sestao", population: 28512, ineTable: 2905, capital: false }, y27(part("PV", "Bizkaia"), [d("2027-06-29", "San Pedro Apóstol"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" })])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / EIBAR | 24 de junio | San Juan»
  row("PV", "Gipuzkoa", { ine: "20030", slug: "eibar", name: "Eibar", ineName: "Eibar", population: 27484, ineTable: 2873, capital: false }, y27(part("PV", "Gipuzkoa"), [d("2027-06-24", "San Juan"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Galdakao – 14 de septiembre (Exaltación de la Santa Cruz)»
  row("PV", "Bizkaia", { ine: "48036", slug: "galdakao", name: "Galdakao", ineName: "Galdakao", population: 24776, ineTable: 2905, capital: false }, y27(part("PV", "Bizkaia"), [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" }), d("2027-09-14", "Exaltación de la Santa Cruz")])),
  // BOB: «— El 31 de Julio, San Ignacio de Loyola, en todo el Territorio Histórico de Bizkaia. / • Erandio – 10 de agosto (San Lorenzo)»
  row("PV", "Bizkaia", { ine: "48902", slug: "erandio", name: "Erandio", ineName: "Erandio", population: 24659, ineTable: 2905, capital: false }, y27(part("PV", "Bizkaia"), [d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" }), d("2027-08-10", "San Lorenzo")])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / ZARAUTZ | 26 de junio | San Pelayo»
  row("PV", "Gipuzkoa", { ine: "20079", slug: "zarautz", name: "Zarautz", ineName: "Zarautz", population: 23496, ineTable: 2873, capital: false }, y27(part("PV", "Gipuzkoa"), [d("2027-06-26", "San Pelayo"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / MONDRAGON | 24 de junio | S. Juan Bautista»
  row("PV", "Gipuzkoa", { ine: "20055", slug: "mondragon", name: "Mondragón", ineName: "Arrasate/Mondragón", population: 22450, ineTable: 2873, capital: false }, y27(part("PV", "Gipuzkoa"), [d("2027-06-24", "S. Juan Bautista"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / HERNANI | 24 de junio | San Juan»
  row("PV", "Gipuzkoa", { ine: "20040", slug: "hernani", name: "Hernani", ineName: "Hernani", population: 20375, ineTable: 2873, capital: false }, y27(part("PV", "Gipuzkoa"), [d("2027-06-24", "San Juan"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
  // BOG: «— 31 de julio, San Ignacio de Loyola, en todo el Territorio Histórico de Gipuzkoa. / TOLOSA | 24 de junio | Sn. Juan»
  row("PV", "Gipuzkoa", { ine: "20071", slug: "tolosa", name: "Tolosa", ineName: "Tolosa", population: 20070, ineTable: 2873, capital: false }, y27(part("PV", "Gipuzkoa"), [d("2027-06-24", "Sn. Juan"), d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" })])),
];

const LA_RIOJA: CityRow[] = [
  // BOR: «Calahorra: 3 de marzo y 31 de agosto (Fiestas Locales)»
  row("RI", "La Rioja", { ine: "26036", slug: "calahorra", name: "Calahorra", ineName: "Calahorra", population: 25367, ineTable: 2879, capital: false }, y27(BOR, [d("2027-03-03", null), d("2027-08-31", null)])),
];

/** The 20,000+ wave, by community in the BOE's order, most populous first. */
export const MORE_CITY_ROWS: readonly CityRow[] = [...ANDALUCIA, ...ASTURIAS, ...BALEARES, ...CANARIAS, ...CASTILLA_Y_LEON, ...EXTREMADURA, ...GALICIA, ...MURCIA, ...PAIS_VASCO, ...LA_RIOJA];

/* -------------------------------------------------------------------------- */
/* Towns in scope with no page yet                                            */
/* -------------------------------------------------------------------------- */

export interface WaitingTown {
  ine: string;
  /** The slug the page will take (checked unique now, so the URL is known in advance). */
  slug: string;
  name: string;
  ineName: string;
  region: Region;
  province: string;
  population: number;
  ineTable: number;
  /** "pending": the community has not published its 2027 list; "missing": it has, without this town's two days. */
  reason: "pending" | "missing";
  /** For "missing": what the list does with the town. */
  note?: string;
}

type WaitBase = Pick<WaitingTown, "ine" | "slug" | "name" | "ineName" | "population" | "ineTable">;

function wait(region: Region, province: string, base: WaitBase): WaitingTown {
  return { ...base, region, province, reason: "pending" };
}

function missingTown(region: Region, province: string, base: WaitBase, note: string): WaitingTown {
  return { ...base, region, province, reason: "missing", note };
}

/**
 * 20,000+ towns with no page, most populous first within each community:
 * the six communities whose 2027 local list was not out on `MORE_READ_ON`
 * (sources.ts status "pending"), then the towns a published list leaves out.
 * Names and slugs are provisional until the page is built.
 */
export const WAITING_TOWNS: readonly WaitingTown[] = [
  wait("AR", "Zaragoza", { ine: "50067", slug: "calatayud", name: "Calatayud", ineName: "Calatayud", population: 20158, ineTable: 2907 }),
  wait("CB", "Cantabria", { ine: "39020", slug: "castro-urdiales", name: "Castro-Urdiales", ineName: "Castro-Urdiales", population: 33450, ineTable: 2893 }),
  wait("CB", "Cantabria", { ine: "39016", slug: "camargo", name: "Camargo", ineName: "Camargo", population: 30577, ineTable: 2893 }),
  wait("CB", "Cantabria", { ine: "39052", slug: "pielagos", name: "Piélagos", ineName: "Piélagos", population: 26901, ineTable: 2893 }),
  wait("CM", "Ciudad Real", { ine: "13071", slug: "puertollano", name: "Puertollano", ineName: "Puertollano", population: 45565, ineTable: 2866 }),
  wait("CM", "Ciudad Real", { ine: "13082", slug: "tomelloso", name: "Tomelloso", ineName: "Tomelloso", population: 37060, ineTable: 2866 }),
  wait("CM", "Guadalajara", { ine: "19046", slug: "azuqueca-de-henares", name: "Azuqueca de Henares", ineName: "Azuqueca de Henares", population: 35924, ineTable: 2872 }),
  wait("CM", "Toledo", { ine: "45081", slug: "illescas", name: "Illescas", ineName: "Illescas", population: 33301, ineTable: 2902 }),
  wait("CM", "Ciudad Real", { ine: "13005", slug: "alcazar-de-san-juan", name: "Alcázar de San Juan", ineName: "Alcázar de San Juan", population: 31914, ineTable: 2866 }),
  wait("CM", "Toledo", { ine: "45161", slug: "sesena", name: "Seseña", ineName: "Seseña", population: 30907, ineTable: 2902 }),
  wait("CM", "Albacete", { ine: "02037", slug: "hellin", name: "Hellín", ineName: "Hellín", population: 30836, ineTable: 2855 }),
  wait("CM", "Ciudad Real", { ine: "13087", slug: "valdepenas", name: "Valdepeñas", ineName: "Valdepeñas", population: 30782, ineTable: 2866 }),
  wait("CM", "Albacete", { ine: "02081", slug: "villarrobledo", name: "Villarrobledo", ineName: "Villarrobledo", population: 25400, ineTable: 2855 }),
  wait("CM", "Albacete", { ine: "02009", slug: "almansa", name: "Almansa", ineName: "Almansa", population: 24615, ineTable: 2855 }),
  wait("MD", "Madrid", { ine: "28130", slug: "san-fernando-de-henares", name: "San Fernando de Henares", ineName: "San Fernando de Henares", population: 39059, ineTable: 2881 }),
  wait("MD", "Madrid", { ine: "28015", slug: "arroyomolinos", name: "Arroyomolinos", ineName: "Arroyomolinos", population: 38075, ineTable: 2881 }),
  wait("MD", "Madrid", { ine: "28061", slug: "galapagar", name: "Galapagar", ineName: "Galapagar", population: 36758, ineTable: 2881 }),
  wait("MD", "Madrid", { ine: "28096", slug: "navalcarnero", name: "Navalcarnero", ineName: "Navalcarnero", population: 33331, ineTable: 2881 }),
  wait("MD", "Madrid", { ine: "28181", slug: "villaviciosa-de-odon", name: "Villaviciosa de Odón", ineName: "Villaviciosa de Odón", population: 30127, ineTable: 2881 }),
  wait("MD", "Madrid", { ine: "28104", slug: "paracuellos-de-jarama", name: "Paracuellos de Jarama", ineName: "Paracuellos de Jarama", population: 27650, ineTable: 2881 }),
  wait("MD", "Madrid", { ine: "28040", slug: "ciempozuelos", name: "Ciempozuelos", ineName: "Ciempozuelos", population: 26350, ineTable: 2881 }),
  wait("MD", "Madrid", { ine: "28152", slug: "torrelodones", name: "Torrelodones", ineName: "Torrelodones", population: 25433, ineTable: 2881 }),
  wait("MD", "Madrid", { ine: "28084", slug: "mejorada-del-campo", name: "Mejorada del Campo", ineName: "Mejorada del Campo", population: 25049, ineTable: 2881 }),
  wait("MD", "Madrid", { ine: "28176", slug: "villanueva-de-la-canada", name: "Villanueva de la Cañada", ineName: "Villanueva de la Cañada", population: 24028, ineTable: 2881 }),
  wait("MD", "Madrid", { ine: "28009", slug: "algete", name: "Algete", ineName: "Algete", population: 21144, ineTable: 2881 }),
  wait("MD", "Madrid", { ine: "28132", slug: "san-martin-de-la-vega", name: "San Martín de la Vega", ineName: "San Martín de la Vega", population: 21010, ineTable: 2881 }),
  wait("MD", "Madrid", { ine: "28073", slug: "humanes-de-madrid", name: "Humanes de Madrid", ineName: "Humanes de Madrid", population: 20500, ineTable: 2881 }),
  wait("NC", "Navarra", { ine: "31232", slug: "tudela", name: "Tudela", ineName: "Tudela", population: 38903, ineTable: 2884 }),
  wait("NC", "Navarra", { ine: "31086", slug: "valle-de-egues", name: "Valle de Egüés", ineName: "Valle de Egüés/Eguesibar", population: 22825, ineTable: 2884 }),
  wait("NC", "Navarra", { ine: "31060", slug: "burlada", name: "Burlada", ineName: "Burlada/Burlata", population: 21280, ineTable: 2884 }),
  wait("VC", "Valencia", { ine: "46017", slug: "alzira", name: "Alzira", ineName: "Alzira", population: 48236, ineTable: 2903 }),
  wait("VC", "Alicante", { ine: "03063", slug: "denia", name: "Dénia", ineName: "Dénia", population: 47261, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46169", slug: "mislata", name: "Mislata", ineName: "Mislata", population: 47079, ineTable: 2903 }),
  wait("VC", "Valencia", { ine: "46078", slug: "burjassot", name: "Burjassot", ineName: "Burjassot", population: 41299, ineTable: 2903 }),
  wait("VC", "Alicante", { ine: "03121", slug: "santa-pola", name: "Santa Pola", ineName: "Santa Pola", population: 39709, ineTable: 2856 }),
  wait("VC", "Castellón", { ine: "12032", slug: "burriana", name: "Burriana", ineName: "Borriana/Burriana", population: 37915, ineTable: 2865 }),
  wait("VC", "Alicante", { ine: "03139", slug: "villajoyosa", name: "Villajoyosa", ineName: "Vila Joiosa, la/Villajoyosa", population: 37449, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46184", slug: "ontinyent", name: "Ontinyent", ineName: "Ontinyent", population: 37012, ineTable: 2903 }),
  wait("VC", "Alicante", { ine: "03140", slug: "villena", name: "Villena", ineName: "Villena", population: 34712, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46021", slug: "aldaia", name: "Aldaia", ineName: "Aldaia", population: 34630, ineTable: 2903 }),
  wait("VC", "Alicante", { ine: "03104", slug: "petrer", name: "Petrer", ineName: "Petrer", population: 34022, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46159", slug: "manises", name: "Manises", ineName: "Manises", population: 32609, ineTable: 2903 }),
  wait("VC", "Castellón", { ine: "12126", slug: "la-vall-d-uixo", name: "La Vall d'Uixó", ineName: "Vall d'Uixó, la", population: 32242, ineTable: 2865 }),
  wait("VC", "Valencia", { ine: "46110", slug: "xirivella", name: "Xirivella", ineName: "Xirivella", population: 32093, ineTable: 2903 }),
  wait("VC", "Alicante", { ine: "03050", slug: "el-campello", name: "El Campello", ineName: "Campello, el", population: 31419, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46145", slug: "xativa", name: "Xàtiva", ineName: "Xàtiva", population: 31008, ineTable: 2903 }),
  wait("VC", "Alicante", { ine: "03059", slug: "crevillent", name: "Crevillent", ineName: "Crevillent", population: 30921, ineTable: 2856 }),
  wait("VC", "Alicante", { ine: "03082", slug: "javea", name: "Jávea", ineName: "Xàbia/Jávea", population: 30642, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46094", slug: "catarroja", name: "Catarroja", ineName: "Catarroja", population: 30604, ineTable: 2903 }),
  wait("VC", "Castellón", { ine: "12138", slug: "vinaros", name: "Vinaròs", ineName: "Vinaròs", population: 30529, ineTable: 2865 }),
  wait("VC", "Castellón", { ine: "12027", slug: "benicarlo", name: "Benicarló", ineName: "Benicarló", population: 30296, ineTable: 2865 }),
  wait("VC", "Valencia", { ine: "46005", slug: "alaquas", name: "Alaquàs", ineName: "Alaquàs", population: 30166, ineTable: 2903 }),
  wait("VC", "Valencia", { ine: "46235", slug: "sueca", name: "Sueca", ineName: "Sueca", population: 29194, ineTable: 2903 }),
  wait("VC", "Castellón", { ine: "12009", slug: "almassora", name: "Almassora", ineName: "Almassora", population: 29159, ineTable: 2865 }),
  wait("VC", "Alicante", { ine: "03090", slug: "mutxamel", name: "Mutxamel", ineName: "Mutxamel", population: 28621, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46070", slug: "betera", name: "Bétera", ineName: "Bétera", population: 28560, ineTable: 2903 }),
  wait("VC", "Valencia", { ine: "46029", slug: "algemesi", name: "Algemesí", ineName: "Algemesí", population: 28306, ineTable: 2903 }),
  wait("VC", "Valencia", { ine: "46186", slug: "paiporta", name: "Paiporta", ineName: "Paiporta", population: 28136, ineTable: 2903 }),
  wait("VC", "Alicante", { ine: "03047", slug: "calp", name: "Calp", ineName: "Calp", population: 27616, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46202", slug: "la-pobla-de-vallbona", name: "La Pobla de Vallbona", ineName: "Pobla de Vallbona, la", population: 27471, ineTable: 2903 }),
  wait("VC", "Valencia", { ine: "46102", slug: "quart-de-poblet", name: "Quart de Poblet", ineName: "Quart de Poblet", population: 26967, ineTable: 2903 }),
  wait("VC", "Alicante", { ine: "03119", slug: "sant-joan-d-alacant", name: "Sant Joan d'Alacant", ineName: "Sant Joan d'Alacant", population: 26834, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46181", slug: "oliva", name: "Oliva", ineName: "Oliva", population: 26813, ineTable: 2903 }),
  wait("VC", "Alicante", { ine: "03093", slug: "novelda", name: "Novelda", ineName: "Novelda", population: 26606, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46013", slug: "alboraya", name: "Alboraya", ineName: "Alboraia/Alboraya", population: 26273, ineTable: 2903 }),
  wait("VC", "Castellón", { ine: "12084", slug: "onda", name: "Onda", ineName: "Onda", population: 26190, ineTable: 2865 }),
  wait("VC", "Valencia", { ine: "46147", slug: "lliria", name: "Llíria", ineName: "Llíria", population: 25333, ineTable: 2903 }),
  wait("VC", "Valencia", { ine: "46105", slug: "cullera", name: "Cullera", ineName: "Cullera", population: 24702, ineTable: 2903 }),
  wait("VC", "Valencia", { ine: "46214", slug: "riba-roja-de-turia", name: "Riba-roja de Túria", ineName: "Riba-roja de Túria", population: 24616, ineTable: 2903 }),
  wait("VC", "Alicante", { ine: "03018", slug: "altea", name: "Altea", ineName: "Altea", population: 24592, ineTable: 2856 }),
  wait("VC", "Alicante", { ine: "03079", slug: "ibi", name: "Ibi", ineName: "Ibi", population: 24500, ineTable: 2856 }),
  wait("VC", "Alicante", { ine: "03902", slug: "pilar-de-la-horadada", name: "Pilar de la Horadada", ineName: "Pilar de la Horadada", population: 24316, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46194", slug: "picassent", name: "Picassent", ineName: "Picassent", population: 23202, ineTable: 2903 }),
  wait("VC", "Alicante", { ine: "03015", slug: "almoradi", name: "Almoradí", ineName: "Almoradí", population: 22965, ineTable: 2856 }),
  wait("VC", "Alicante", { ine: "03019", slug: "aspe", name: "Aspe", ineName: "Aspe", population: 22397, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46022", slug: "alfafar", name: "Alfafar", ineName: "Alfafar", population: 22270, ineTable: 2903 }),
  wait("VC", "Valencia", { ine: "46171", slug: "moncada", name: "Moncada", ineName: "Montcada/Moncada", population: 22213, ineTable: 2903 }),
  wait("VC", "Valencia", { ine: "46083", slug: "carcaixent", name: "Carcaixent", ineName: "Carcaixent", population: 21934, ineTable: 2903 }),
  wait("VC", "Valencia", { ine: "46205", slug: "pucol", name: "Puçol", ineName: "Puçol", population: 21659, ineTable: 2903 }),
  wait("VC", "Alicante", { ine: "03011", slug: "l-alfas-del-pi", name: "L'Alfàs del Pi", ineName: "Alfàs del Pi, l'", population: 21080, ineTable: 2856 }),
  wait("VC", "Valencia", { ine: "46213", slug: "requena", name: "Requena", ineName: "Requena", population: 20982, ineTable: 2903 }),
  wait("VC", "Castellón", { ine: "12028", slug: "benicasim", name: "Benicasim", ineName: "Benicàssim/Benicasim", population: 20539, ineTable: 2865 }),
  wait("VC", "Valencia", { ine: "46230", slug: "silla", name: "Silla", ineName: "Silla", population: 20482, ineTable: 2903 }),
  missingTown("AN", "Cádiz", { ine: "11006", slug: "arcos-de-la-frontera", name: "Arcos de la Frontera", ineName: "Arcos de la Frontera", population: 31267, ineTable: 2864 }, "La lista de 2027 de Andalucía (BOJA núm. 210, de 29.10.2026) no incluye Arcos de la Frontera: recoge las fiestas «que constan comunicadas hasta la fecha»."),
  missingTown("GA", "Pontevedra", { ine: "36008", slug: "cangas", name: "Cangas", ineName: "Cangas", population: 26711, ineTable: 2890 }, "El DOG núm. 204, de 26.10.2026, da a Cangas («Cangas de Morrazo») el 19 de marzo, viernes de los Dolores, que ya es festivo autonómico en Galicia, y el 30 de agosto; los datos abiertos de la Xunta solo recogen el 30 de agosto. Sin página hasta que se aclare el segundo día."),
];
