import type { Region } from "@/lib/programmatic/holidays/boe-2027";

import { SOURCES, type OfficialText } from "./sources";

/**
 * The two local holidays of 2027 of the larger Spanish cities outside
 * Catalonia, one row per city, each with the official text it comes from.
 *
 * Scope (INE, padrón at 1 January 2025, Real Decreto 1117/2025): every
 * provincial capital outside Catalonia, every other municipality outside
 * Catalonia with 50,000 inhabitants or more, and Ceuta and Melilla. Ceuta
 * and Melilla are one municipality each: their page is the community page,
 * which already carries their two local days (`sources.ts`).
 *
 * Every date and name below was transcribed from the bulletin the row cites
 * (`source`), read on `CITIES_AS_OF`; a name is null where the bulletin gives
 * none (nothing is filled in from elsewhere). Andalucía's rows were also
 * checked one by one against the Junta's open-data work calendar API.
 *
 * `status2027`:
 *  - "published": the community's (or province's) 2027 list is out and names the city;
 *  - "missing": the list is out but leaves the city out or marks it "no comunicada";
 *  - "pending": the community has not published its 2027 list yet.
 * A city that is not "published" shows its 2026 days, labelled as 2026, when
 * an official source has them; with neither, it has no page.
 *
 * Statuses change weekly from November to January: a test fails from
 * `CITIES_RECHECK_BY` (21 days after `CITIES_AS_OF`) until the pending rows
 * are read again.
 */

export const CITIES_AS_OF = "2026-11-06";
export const CITIES_RECHECK_DAYS = 21;

/** The official population figures every row's `population` comes from. */
export const INE_POPULATION = {
  title: "Real Decreto 1117/2025, de 3 de diciembre, por el que se declaran oficiales las cifras de población resultantes de la revisión del Padrón municipal referidas al 1 de enero de 2025",
  ref: "BOE núm. 297, de 11.12.2025, BOE-A-2025-25362",
  date: "2025-12-11",
  url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-25362",
  /** The reference date of the figures. */
  asOf: "2025-01-01",
} as const;

/** INE's table of the province (Cifras oficiales de población de los municipios españoles: Revisión del Padrón Municipal). */
export function ineTableUrl(table: number): string {
  return `https://www.ine.es/jaxiT3/Tabla.htm?t=${table}`;
}

export interface LocalDay {
  date: string;
  /** As the bulletin names it; null when it gives no name. */
  name: string | null;
  /** The bulletin's own words on where the day applies, when it says more than the municipality. */
  note?: string;
  /** The weekday the bulletin prints next to the date (Murcia), held to the calendar by a test. */
  printedWeekday?: string;
}

export interface LocalList {
  year: 2027 | 2026;
  /** The days of the municipality, or of `mainArea` when the bulletin splits it. */
  days: LocalDay[];
  /** The bulletin's name for the part of the municipality `days` apply to, when it splits it. */
  mainArea?: string;
  /** Other parts of the municipality with days of their own, as the bulletin lists them. */
  zones?: { place: string; days: LocalDay[] }[];
  source: OfficialText;
}

export interface CityRow {
  /** INE municipality code, five digits. */
  ine: string;
  /** URL segment under the community: /es/festivos/2027/<comunidad>/<slug>/. */
  slug: string;
  /** The name Spanish speakers search with: "A Coruña", "San Sebastián". */
  name: string;
  /** Shorter form for titles, where every character counts: "Las Palmas". */
  short?: string;
  /** The name as INE prints it: "Coruña, A", "Donostia/San Sebastián". */
  ineName: string;
  region: Region;
  province: string;
  /** Provincial capital. */
  capital: boolean;
  /** Inhabitants at 1 January 2025 (`INE_POPULATION`). */
  population: number;
  /** INE table of the province the figure was read from (`ineTableUrl`). */
  ineTable: number;
  /** Canarias: the island whose `fiesta insular` (sources.ts) the city also has. */
  island?: string;
  status2027: "published" | "missing" | "pending";
  local2027: LocalList | null;
  local2026: LocalList | null;
  /** One sentence on the city's status, when the list says something about it. */
  note?: string;
}

/* -------------------------------------------------------------------------- */
/* The official texts                                                         */
/* -------------------------------------------------------------------------- */

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

const BOJA = list2027("AN");
const BOPA = list2027("AS");
const BOIB = list2027("IB");
const BOC_CANARIAS = list2027("CN");
const DOE = list2027("EX");
const DOG = list2027("GA");
const BORM = list2027("MC");
const BOR = list2027("RI");

/** Castilla y León's open data (CC BY 4.0, Junta de Castilla y León): the 2026 days of the cities the 2027 lists leave out. */
const JCYL_OPEN_DATA: OfficialText = {
  title: "Fiestas locales: Calendario de fiestas de carácter local (datos abiertos de la Junta de Castilla y León)",
  ref: "Junta de Castilla y León, conjunto de datos actualizado el 17.2.2026",
  date: "2026-02-17",
  url: "https://analisis.datosabiertos.jcyl.es/explore/dataset/fiestas-locales-calendario-de-fiestas-de-caracter-local/",
};

const d = (date: string, name: string | null, extra: Omit<LocalDay, "date" | "name"> = {}): LocalDay => ({ date, name, ...extra });
const y27 = (source: OfficialText, days: LocalDay[], more: Partial<LocalList> = {}): LocalList => ({ year: 2027, days, source, ...more });
const y26 = (source: OfficialText, days: LocalDay[]): LocalList => ({ year: 2026, days, source });

/* -------------------------------------------------------------------------- */
/* The rows                                                                   */
/* -------------------------------------------------------------------------- */

type Base = Omit<CityRow, "status2027" | "local2027" | "local2026" | "region" | "province">;

function published(region: Region, province: string, base: Base, local: LocalList, more: Partial<CityRow> = {}): CityRow {
  return { ...base, region, province, status2027: "published", local2027: local, local2026: null, ...more };
}

const ANDALUCIA: CityRow[] = [
  // BOJA núm. 210, de 29.10.2026 (each row also in datos.juntadeandalucia.es/api/v0/work-calendar, 2027 LOCAL).
  published("AN", "Almería", { ine: "04013", slug: "almeria", name: "Almería", ineName: "Almería", population: 205468, ineTable: 2857, capital: true }, y27(BOJA, [d("2027-06-24", null), d("2027-08-28", null)])),
  published("AN", "Almería", { ine: "04079", slug: "roquetas-de-mar", name: "Roquetas de Mar", ineName: "Roquetas de Mar", population: 111240, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-07-26", null), d("2027-10-07", null)])),
  published("AN", "Almería", { ine: "04902", slug: "el-ejido", name: "El Ejido", ineName: "Ejido, El", population: 91440, ineTable: 2857, capital: false }, y27(BOJA, [d("2027-04-26", null), d("2027-06-28", null)])),
  published("AN", "Cádiz", { ine: "11004", slug: "algeciras", name: "Algeciras", ineName: "Algeciras", population: 126589, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-06-23", null), d("2027-07-16", null)])),
  published("AN", "Cádiz", { ine: "11012", slug: "cadiz", name: "Cádiz", ineName: "Cádiz", population: 109950, ineTable: 2864, capital: true }, y27(BOJA, [d("2027-02-08", null), d("2027-10-07", null)])),
  published("AN", "Cádiz", { ine: "11015", slug: "chiclana-de-la-frontera", name: "Chiclana de la Frontera", short: "Chiclana", ineName: "Chiclana de la Frontera", population: 90864, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-06-11", null), d("2027-09-08", null)])),
  published("AN", "Cádiz", { ine: "11020", slug: "jerez-de-la-frontera", name: "Jerez de la Frontera", short: "Jerez", ineName: "Jerez de la Frontera", population: 213634, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-04-26", null), d("2027-09-24", null)])),
  published("AN", "Cádiz", { ine: "11022", slug: "la-linea-de-la-concepcion", name: "La Línea de la Concepción", short: "La Línea", ineName: "Línea de la Concepción, La", population: 64499, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-07-20", null), d("2027-07-26", null)])),
  published("AN", "Cádiz", { ine: "11027", slug: "el-puerto-de-santa-maria", name: "El Puerto de Santa María", short: "El Puerto", ineName: "Puerto de Santa María, El", population: 89983, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-06-07", null), d("2027-09-08", null)])),
  published("AN", "Cádiz", { ine: "11031", slug: "san-fernando", name: "San Fernando", ineName: "San Fernando", population: 93338, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-07-16", null), d("2027-09-24", null)])),
  published("AN", "Cádiz", { ine: "11032", slug: "sanlucar-de-barrameda", name: "Sanlúcar de Barrameda", short: "Sanlúcar", ineName: "Sanlúcar de Barrameda", population: 70012, ineTable: 2864, capital: false }, y27(BOJA, [d("2027-05-31", null), d("2027-10-18", null)])),
  published("AN", "Córdoba", { ine: "14021", slug: "cordoba", name: "Córdoba", ineName: "Córdoba", population: 323262, ineTable: 2901, capital: true }, y27(BOJA, [d("2027-09-08", null), d("2027-10-25", null)])),
  published("AN", "Granada", { ine: "18087", slug: "granada", name: "Granada", ineName: "Granada", population: 233975, ineTable: 2871, capital: true }, y27(BOJA, [d("2027-05-03", null), d("2027-05-27", null)])),
  published("AN", "Granada", { ine: "18140", slug: "motril", name: "Motril", ineName: "Motril", population: 59862, ineTable: 2871, capital: false }, y27(BOJA, [d("2027-05-03", null), d("2027-06-24", null)])),
  published("AN", "Huelva", { ine: "21041", slug: "huelva", name: "Huelva", ineName: "Huelva", population: 143215, ineTable: 2874, capital: true }, y27(BOJA, [d("2027-08-03", null), d("2027-09-08", null)])),
  published("AN", "Jaén", { ine: "23050", slug: "jaen", name: "Jaén", ineName: "Jaén", population: 112235, ineTable: 2876, capital: true }, y27(BOJA, [d("2027-06-11", null), d("2027-10-18", null)])),
  published("AN", "Jaén", { ine: "23055", slug: "linares", name: "Linares", ineName: "Linares", population: 55633, ineTable: 2876, capital: false }, y27(BOJA, [d("2027-08-05", null), d("2027-08-28", null)])),
  published("AN", "Málaga", { ine: "29025", slug: "benalmadena", name: "Benalmádena", ineName: "Benalmádena", population: 78338, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-06-24", null), d("2027-07-16", null)])),
  published("AN", "Málaga", { ine: "29051", slug: "estepona", name: "Estepona", ineName: "Estepona", population: 79621, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-05-15", null), d("2027-07-16", null)])),
  published("AN", "Málaga", { ine: "29054", slug: "fuengirola", name: "Fuengirola", ineName: "Fuengirola", population: 85211, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-07-16", null), d("2027-10-07", null)])),
  published("AN", "Málaga", { ine: "29067", slug: "malaga", name: "Málaga", ineName: "Málaga", population: 599063, ineTable: 2882, capital: true }, y27(BOJA, [d("2027-08-19", null), d("2027-09-08", null)])),
  published("AN", "Málaga", { ine: "29069", slug: "marbella", name: "Marbella", ineName: "Marbella", population: 159786, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-06-11", null), d("2027-10-19", null)])),
  published("AN", "Málaga", { ine: "29070", slug: "mijas", name: "Mijas", ineName: "Mijas", population: 95104, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-09-08", null), d("2027-10-15", null)])),
  published("AN", "Málaga", { ine: "29082", slug: "rincon-de-la-victoria", name: "Rincón de la Victoria", ineName: "Rincón de la Victoria", population: 52454, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-07-16", null), d("2027-10-07", null)])),
  published("AN", "Málaga", { ine: "29094", slug: "velez-malaga", name: "Vélez-Málaga", ineName: "Vélez-Málaga", population: 86048, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-07-26", null), d("2027-10-01", null)])),
  published("AN", "Málaga", { ine: "29901", slug: "torremolinos", name: "Torremolinos", ineName: "Torremolinos", population: 71329, ineTable: 2882, capital: false }, y27(BOJA, [d("2027-07-16", null), d("2027-09-29", null)])),
  published("AN", "Sevilla", { ine: "41004", slug: "alcala-de-guadaira", name: "Alcalá de Guadaíra", ineName: "Alcalá de Guadaíra", population: 77474, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-06-04", null), d("2027-09-21", null)])),
  published("AN", "Sevilla", { ine: "41038", slug: "dos-hermanas", name: "Dos Hermanas", ineName: "Dos Hermanas", population: 142519, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-04-29", null), d("2027-07-26", null)])),
  published("AN", "Sevilla", { ine: "41091", slug: "sevilla", name: "Sevilla", ineName: "Sevilla", population: 689423, ineTable: 2895, capital: true }, y27(BOJA, [d("2027-04-14", null), d("2027-05-27", null)])),
  published("AN", "Sevilla", { ine: "41095", slug: "utrera", name: "Utrera", ineName: "Utrera", population: 52403, ineTable: 2895, capital: false }, y27(BOJA, [d("2027-06-24", null), d("2027-09-08", null)])),
];

const ASTURIAS: CityRow[] = [
  // BOPA núm. 110, de 10.6.2026.
  published("AS", "Asturias", { ine: "33044", slug: "oviedo", name: "Oviedo", ineName: "Oviedo", population: 223968, ineTable: 2886, capital: true }, y27(BOPA, [d("2027-05-18", "Martes de Campo"), d("2027-09-21", "San Mateo")])),
  published("AS", "Asturias", { ine: "33024", slug: "gijon", name: "Gijón", ineName: "Gijón", population: 269894, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-02-09", "Carnaval/Antroxu"), d("2027-06-29", "San Pedro")])),
  published("AS", "Asturias", { ine: "33004", slug: "aviles", name: "Avilés", ineName: "Avilés", population: 75517, ineTable: 2886, capital: false }, y27(BOPA, [d("2027-03-29", "Lunes de Pascua"), d("2027-08-28", "San Agustín")])),
  published(
    "AS",
    "Asturias",
    { ine: "33066", slug: "siero", name: "Siero", ineName: "Siero", population: 53049, ineTable: 2886, capital: false },
    y27(BOPA, [d("2027-03-30", "Huevos Pintos", { note: "en todo el concejo" }), d("2027-07-19", "El Carmín", { note: "en todo el concejo excepto en la parroquia de Lugones/Llugones" })], {
      mainArea: "Todo el concejo salvo la parroquia de Lugones/Llugones",
      zones: [{ place: "Parroquia de Lugones/Llugones", days: [d("2027-03-30", "Huevos Pintos", { note: "en todo el concejo" }), d("2027-08-30", "Santa Isabel", { note: "en la parroquia de Lugones/Llugones" })] }],
    }),
  ),
];

const BALEARES: CityRow[] = [
  // BOIB núm. 122, de 29.9.2026, Isla de Mallorca and Isla de Ibiza.
  published("IB", "Illes Balears", { ine: "07040", slug: "palma", name: "Palma", ineName: "Palma", population: 434786, ineTable: 2860, capital: true }, y27(BOIB, [d("2027-01-20", "San Sebastián"), d("2027-06-24", "San Juan")])),
  published(
    "IB",
    "Illes Balears",
    { ine: "07011", slug: "calvia", name: "Calvià", ineName: "Calvià", population: 53793, ineTable: 2860, capital: false },
    y27(BOIB, [d("2027-06-24", "San Juan"), d("2027-07-16", "Virgen del Carmen")], {
      mainArea: "Calvià",
      zones: [{ place: "Es Capdellà", days: [d("2027-01-20", "San Sebastián"), d("2027-07-16", "Virgen del Carmen")] }],
    }),
  ),
  published("IB", "Illes Balears", { ine: "07026", slug: "ibiza", name: "Ibiza", ineName: "Eivissa", population: 55337, ineTable: 2860, capital: false }, y27(BOIB, [d("2027-05-07", null), d("2027-08-05", null)])),
];

const CANARIAS: CityRow[] = [
  // BOC núm. 168, de 21.8.2026 (Orden de 7 de agosto de 2026); the island days are the Decreto 115/2026's (sources.ts).
  published("CN", "Las Palmas", { ine: "35016", slug: "las-palmas-de-gran-canaria", name: "Las Palmas de Gran Canaria", short: "Las Palmas", ineName: "Palmas de Gran Canaria, Las", population: 381868, ineTable: 2889, capital: true, island: "Gran Canaria" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-06-24", "Conmemoración de la Fundación de la Ciudad")])),
  published("CN", "Las Palmas", { ine: "35026", slug: "telde", name: "Telde", ineName: "Telde", population: 104168, ineTable: 2889, capital: false, island: "Gran Canaria" }, y27(BOC_CANARIAS, [d("2027-06-24", "Festividad de San Juan Bautista"), d("2027-11-17", "Festividad de San Gregorio Taumaturgo")])),
  published("CN", "Las Palmas", { ine: "35022", slug: "santa-lucia-de-tirajana", name: "Santa Lucía de Tirajana", short: "Santa Lucía", ineName: "Santa Lucía de Tirajana", population: 78584, ineTable: 2889, capital: false, island: "Gran Canaria" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-12-13", "Festividad de Santa Lucía")])),
  published("CN", "Las Palmas", { ine: "35019", slug: "san-bartolome-de-tirajana", name: "San Bartolomé de Tirajana", short: "San Bartolomé", ineName: "San Bartolomé de Tirajana", population: 54291, ineTable: 2889, capital: false, island: "Gran Canaria" }, y27(BOC_CANARIAS, [d("2027-03-12", "Día del Turista"), d("2027-08-24", "Festividad de San Bartolomé")])),
  published("CN", "Las Palmas", { ine: "35004", slug: "arrecife", name: "Arrecife", ineName: "Arrecife", population: 70811, ineTable: 2889, capital: false, island: "Lanzarote y La Graciosa" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-08-25", "Festividad de San Ginés")])),
  published("CN", "Santa Cruz de Tenerife", { ine: "38038", slug: "santa-cruz-de-tenerife", name: "Santa Cruz de Tenerife", short: "Santa Cruz", ineName: "Santa Cruz de Tenerife", population: 211957, ineTable: 2892, capital: true, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-02-23", "Martes de Carnaval"), d("2027-05-03", "Festividad del Día de la Cruz")])),
  published("CN", "Santa Cruz de Tenerife", { ine: "38023", slug: "la-laguna", name: "San Cristóbal de La Laguna", short: "La Laguna", ineName: "San Cristóbal de La Laguna", population: 161108, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-09-14", "Festividad del Santísimo Cristo de La Laguna")])),
  published("CN", "Santa Cruz de Tenerife", { ine: "38006", slug: "arona", name: "Arona", ineName: "Arona", population: 87793, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-10-04", "Festividad del Santísimo Cristo de la Salud")])),
  published("CN", "Santa Cruz de Tenerife", { ine: "38017", slug: "granadilla-de-abona", name: "Granadilla de Abona", short: "Granadilla", ineName: "Granadilla de Abona", population: 58752, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-02-09", "Martes de Carnaval"), d("2027-06-14", "Festividad de San Antonio de Padua")])),
  published("CN", "Santa Cruz de Tenerife", { ine: "38001", slug: "adeje", name: "Adeje", ineName: "Adeje", population: 50021, ineTable: 2892, capital: false, island: "Tenerife" }, y27(BOC_CANARIAS, [d("2027-01-20", "Festividad de San Sebastián"), d("2027-10-11", "Festividad de Santa Úrsula")])),
];

const CASTILLA_Y_LEON: CityRow[] = [
  // The provincial BOP of each Oficina Territorial de Trabajo (sources.ts, CL parts).
  published("CL", "Ávila", { ine: "05019", slug: "avila", name: "Ávila", ineName: "Ávila", population: 59107, ineTable: 2858, capital: true }, y27(part("CL", "Ávila"), [d("2027-05-03", "San Segundo"), d("2027-10-15", "Santa Teresa de Jesús")])),
  {
    ine: "09059",
    slug: "burgos",
    name: "Burgos",
    ineName: "Burgos",
    region: "CL",
    province: "Burgos",
    capital: true,
    population: 177402,
    ineTable: 2862,
    status2027: "missing",
    local2027: null,
    local2026: y26(JCYL_OPEN_DATA, [d("2026-06-12", "Curpillos"), d("2026-06-29", "San Pedro y San Pablo")]),
    note: "La lista de 2027 de la provincia de Burgos (BOP de Burgos núm. 145, de 4.8.2026) no incluye la capital.",
  },
  published("CL", "León", { ine: "24089", slug: "leon", name: "León", ineName: "León", population: 123446, ineTable: 2877, capital: true }, y27(part("CL", "León"), [d("2027-06-24", "San Juan", { note: "para todo el municipio" }), d("2027-10-05", "San Froilán", { note: "para todo el municipio" })])),
  published("CL", "León", { ine: "24115", slug: "ponferrada", name: "Ponferrada", ineName: "Ponferrada", population: 63186, ineTable: 2877, capital: false }, y27(part("CL", "León"), [d("2027-09-08", "Nuestra Señora de La Encina"), d("2027-09-09", null)])),
  published("CL", "Palencia", { ine: "34120", slug: "palencia", name: "Palencia", ineName: "Palencia", population: 77466, ineTable: 2888, capital: true }, y27(part("CL", "Palencia"), [d("2027-02-02", null), d("2027-09-02", null)])),
  published("CL", "Salamanca", { ine: "37274", slug: "salamanca", name: "Salamanca", ineName: "Salamanca", population: 146110, ineTable: 2891, capital: true }, y27(part("CL", "Salamanca"), [d("2027-06-12", null), d("2027-09-08", null)])),
  published("CL", "Segovia", { ine: "40194", slug: "segovia", name: "Segovia", ineName: "Segovia", population: 52375, ineTable: 2894, capital: true }, y27(part("CL", "Segovia"), [d("2027-06-29", "San Pedro"), d("2027-10-25", "San Frutos")])),
  published("CL", "Soria", { ine: "42173", slug: "soria", name: "Soria", ineName: "Soria", population: 41025, ineTable: 2896, capital: true }, y27(part("CL", "Soria"), [d("2027-06-24", null), d("2027-10-02", null)])),
  {
    ine: "47186",
    slug: "valladolid",
    name: "Valladolid",
    ineName: "Valladolid",
    region: "CL",
    province: "Valladolid",
    capital: true,
    population: 302614,
    ineTable: 2904,
    status2027: "missing",
    local2027: null,
    local2026: y26(JCYL_OPEN_DATA, [d("2026-05-13", "San Pedro Regalado"), d("2026-09-08", "Nuestra Señora de San Lorenzo")]),
    note: "La lista de 2027 de la provincia de Valladolid (BOP de Valladolid núm. 129, de 9.7.2026) da los dos días de la capital como «No comunicada».",
  },
  published("CL", "Zamora", { ine: "49275", slug: "zamora", name: "Zamora", ineName: "Zamora", population: 59815, ineTable: 2906, capital: true }, y27(part("CL", "Zamora"), [d("2027-05-17", "La Hiniesta"), d("2027-06-29", "San Pedro")])),
];

const EXTREMADURA: CityRow[] = [
  // DOE núm. 207, de 27.10.2026 (annex, PDF).
  published("EX", "Badajoz", { ine: "06015", slug: "badajoz", name: "Badajoz", ineName: "Badajoz", population: 150209, ineTable: 2859, capital: true }, y27(DOE, [d("2027-02-09", null), d("2027-06-24", null)])),
  published("EX", "Badajoz", { ine: "06083", slug: "merida", name: "Mérida", ineName: "Mérida", population: 60225, ineTable: 2859, capital: false }, y27(DOE, [d("2027-05-13", null), d("2027-12-10", null)])),
  published("EX", "Cáceres", { ine: "10037", slug: "caceres", name: "Cáceres", ineName: "Cáceres", population: 96651, ineTable: 2863, capital: true }, y27(DOE, [d("2027-04-23", null), d("2027-05-28", null)])),
];

const GALICIA: CityRow[] = [
  // DOG núm. 204, de 26.10.2026, annexes I to IV.
  published("GA", "A Coruña", { ine: "15030", slug: "a-coruna", name: "A Coruña", ineName: "Coruña, A", population: 251543, ineTable: 2868, capital: true }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-06-24", "Festividad de San Juan")])),
  published("GA", "A Coruña", { ine: "15036", slug: "ferrol", name: "Ferrol", ineName: "Ferrol", population: 64367, ineTable: 2868, capital: false }, y27(DOG, [d("2027-01-07", "San Xiao"), d("2027-03-29", "Nuestra Señora de Chamorro")])),
  published("GA", "A Coruña", { ine: "15078", slug: "santiago-de-compostela", name: "Santiago de Compostela", short: "Santiago", ineName: "Santiago de Compostela", population: 100965, ineTable: 2868, capital: false }, y27(DOG, [d("2027-05-06", "Día de la Ascensión"), d("2027-08-16", "San Roque")])),
  published("GA", "Lugo", { ine: "27028", slug: "lugo", name: "Lugo", ineName: "Lugo", population: 100143, ineTable: 2880, capital: true }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-10-05", "San Froilán")])),
  published("GA", "Ourense", { ine: "32054", slug: "ourense", name: "Ourense", ineName: "Ourense", population: 105769, ineTable: 2885, capital: true }, y27(DOG, [d("2027-02-09", "Martes de Carnaval"), d("2027-11-11", "San Martín")])),
  published("GA", "Pontevedra", { ine: "36038", slug: "pontevedra", name: "Pontevedra", ineName: "Pontevedra", population: 83316, ineTable: 2890, capital: true }, y27(DOG, [d("2027-02-10", "Miércoles de Ceniza"), d("2027-03-29", "San Cibrán")])),
  published("GA", "Pontevedra", { ine: "36057", slug: "vigo", name: "Vigo", ineName: "Vigo", population: 294489, ineTable: 2890, capital: false }, y27(DOG, [d("2027-03-29", null), d("2027-08-16", null)])),
];

const MURCIA: CityRow[] = [
  // BORM núm. 171, de 27.7.2026: the table prints the weekday of each date.
  published("MC", "Murcia", { ine: "30030", slug: "murcia", name: "Murcia", ineName: "Murcia", population: 479405, ineTable: 2883, capital: true }, y27(BORM, [d("2027-03-30", null, { printedWeekday: "Martes" }), d("2027-09-14", null, { printedWeekday: "Martes" })])),
  published("MC", "Murcia", { ine: "30016", slug: "cartagena", name: "Cartagena", ineName: "Cartagena", population: 220704, ineTable: 2883, capital: false }, y27(BORM, [d("2027-01-07", null, { printedWeekday: "Jueves" }), d("2027-09-24", null, { printedWeekday: "Viernes" })])),
  published("MC", "Murcia", { ine: "30024", slug: "lorca", name: "Lorca", ineName: "Lorca", population: 98969, ineTable: 2883, capital: false }, y27(BORM, [d("2027-09-08", null, { printedWeekday: "Miércoles" }), d("2027-11-23", null, { printedWeekday: "Martes" })])),
  published("MC", "Murcia", { ine: "30027", slug: "molina-de-segura", name: "Molina de Segura", ineName: "Molina de Segura", population: 78458, ineTable: 2883, capital: false }, y27(BORM, [d("2027-01-22", null, { printedWeekday: "Viernes" }), d("2027-09-20", null, { printedWeekday: "Lunes" })])),
];

const BIZKAIA_DAY = d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Bizkaia" });
const GIPUZKOA_DAY = d("2027-07-31", "San Ignacio de Loyola", { note: "en todo el Territorio Histórico de Gipuzkoa" });

const PAIS_VASCO: CityRow[] = [
  published("PV", "Álava", { ine: "01059", slug: "vitoria", name: "Vitoria-Gasteiz", short: "Vitoria", ineName: "Vitoria-Gasteiz", population: 260699, ineTable: 2854, capital: true }, y27(part("PV", "Álava"), [d("2027-04-28", "San Prudencio", { note: "día de fiesta del territorio histórico de Álava" }), d("2027-08-05", "Virgen Blanca")])),
  published("PV", "Bizkaia", { ine: "48020", slug: "bilbao", name: "Bilbao", ineName: "Bilbao", population: 351124, ineTable: 2905, capital: true }, y27(part("PV", "Bizkaia"), [BIZKAIA_DAY, d("2027-08-27", "Viernes de la Semana Grande")])),
  published("PV", "Bizkaia", { ine: "48013", slug: "barakaldo", name: "Barakaldo", ineName: "Barakaldo", population: 102986, ineTable: 2905, capital: false }, y27(part("PV", "Bizkaia"), [d("2027-07-16", "Nuestra Señora del Carmen"), BIZKAIA_DAY])),
  published("PV", "Bizkaia", { ine: "48044", slug: "getxo", name: "Getxo", ineName: "Getxo", population: 75752, ineTable: 2905, capital: false }, y27(part("PV", "Bizkaia"), [BIZKAIA_DAY, d("2027-09-24", "Las Mercedes")])),
  published("PV", "Gipuzkoa", { ine: "20069", slug: "san-sebastian", name: "San Sebastián", ineName: "Donostia/San Sebastián", population: 189866, ineTable: 2873, capital: true }, y27(part("PV", "Gipuzkoa"), [d("2027-01-20", null), GIPUZKOA_DAY])),
  published("PV", "Gipuzkoa", { ine: "20045", slug: "irun", name: "Irun", ineName: "Irun", population: 63835, ineTable: 2873, capital: false }, y27(part("PV", "Gipuzkoa"), [d("2027-06-30", null), GIPUZKOA_DAY])),
];

const LA_RIOJA: CityRow[] = [
  // BOR núm. 160, de 21.8.2026.
  published("RI", "La Rioja", { ine: "26089", slug: "logrono", name: "Logroño", ineName: "Logroño", population: 152150, ineTable: 2879, capital: true }, y27(BOR, [d("2027-06-11", "San Bernabé"), d("2027-09-21", "San Mateo")])),
];

/* -------------------------------------------------------------------------- */
/* Communities whose 2027 list is not out: the 2026 days, as reference        */
/* -------------------------------------------------------------------------- */

function list2026(region: Region): OfficialText {
  const text = SOURCES[region].local.y2026;
  if (!text) throw new Error(`no 2026 local list for ${region}`);
  return text;
}

function pending(region: Region, province: string, base: Base, days: LocalDay[]): CityRow {
  return { ...base, region, province, status2027: "pending", local2027: null, local2026: y26(list2026(region), days) };
}

const ARAGON: CityRow[] = [
  // BOA núm. 225, de 20.11.2025 (the capitals are in the main list, not in the complementary one of 23.3.2026).
  pending("AR", "Zaragoza", { ine: "50297", slug: "zaragoza", name: "Zaragoza", ineName: "Zaragoza", population: 693091, ineTable: 2907, capital: true }, [d("2026-01-29", "San Valero"), d("2026-03-05", "Cincomarzada")]),
  pending("AR", "Huesca", { ine: "22125", slug: "huesca", name: "Huesca", ineName: "Huesca", population: 55454, ineTable: 2875, capital: true }, [d("2026-01-22", "San Vicente"), d("2026-08-10", "San Lorenzo")]),
  pending("AR", "Teruel", { ine: "44216", slug: "teruel", name: "Teruel", ineName: "Teruel", population: 36655, ineTable: 2899, capital: true }, [d("2026-04-07", null), d("2026-07-13", null)]),
];

const CANTABRIA: CityRow[] = [
  // BOC núm. 238, de 11.12.2025 (the table prints "SAN CIRPIANO" for 16 September).
  pending("CB", "Cantabria", { ine: "39075", slug: "santander", name: "Santander", ineName: "Santander", population: 175425, ineTable: 2893, capital: true }, [d("2026-05-25", "Virgen del Mar"), d("2026-07-25", "Apóstol Santiago")]),
  pending("CB", "Cantabria", { ine: "39087", slug: "torrelavega", name: "Torrelavega", ineName: "Torrelavega", population: 51796, ineTable: 2893, capital: false }, [d("2026-08-17", "San Roque"), d("2026-09-16", "San Cipriano")]),
];

const CASTILLA_LA_MANCHA: CityRow[] = [
  // DOCM núm. 240, de 12.12.2025: dates only.
  pending("CM", "Albacete", { ine: "02003", slug: "albacete", name: "Albacete", ineName: "Albacete", population: 175400, ineTable: 2855, capital: true }, [d("2026-06-24", null), d("2026-09-08", null)]),
  pending("CM", "Toledo", { ine: "45168", slug: "toledo", name: "Toledo", ineName: "Toledo", population: 87216, ineTable: 2902, capital: true }, [d("2026-01-23", null), d("2026-11-26", null)]),
  pending("CM", "Guadalajara", { ine: "19130", slug: "guadalajara", name: "Guadalajara", ineName: "Guadalajara", population: 92834, ineTable: 2872, capital: true }, [d("2026-09-08", null), d("2026-09-18", null)]),
  pending("CM", "Toledo", { ine: "45165", slug: "talavera-de-la-reina", name: "Talavera de la Reina", short: "Talavera", ineName: "Talavera de la Reina", population: 83803, ineTable: 2902, capital: false }, [d("2026-05-15", null), d("2026-09-08", null)]),
  pending("CM", "Ciudad Real", { ine: "13034", slug: "ciudad-real", name: "Ciudad Real", ineName: "Ciudad Real", population: 76217, ineTable: 2866, capital: true }, [d("2026-05-25", null), d("2026-08-22", null)]),
  pending("CM", "Cuenca", { ine: "16078", slug: "cuenca", name: "Cuenca", ineName: "Cuenca", population: 53600, ineTable: 2869, capital: true }, [d("2026-06-01", null), d("2026-09-21", null)]),
];

const MADRID: CityRow[] = [
  // BOCM núm. 296, de 12.12.2025 (dates only); its correction (BOCM núm. 6, de 8.1.2026) changes none of these.
  pending("MD", "Madrid", { ine: "28079", slug: "madrid", name: "Madrid", ineName: "Madrid", population: 3506730, ineTable: 2881, capital: true }, [d("2026-05-15", null), d("2026-11-09", null)]),
  pending("MD", "Madrid", { ine: "28092", slug: "mostoles", name: "Móstoles", ineName: "Móstoles", population: 214817, ineTable: 2881, capital: false }, [d("2026-05-15", null), d("2026-09-12", null)]),
  pending("MD", "Madrid", { ine: "28005", slug: "alcala-de-henares", name: "Alcalá de Henares", ineName: "Alcalá de Henares", population: 203208, ineTable: 2881, capital: false }, [d("2026-08-06", null), d("2026-10-09", null)]),
  pending("MD", "Madrid", { ine: "28074", slug: "leganes", name: "Leganés", ineName: "Leganés", population: 195734, ineTable: 2881, capital: false }, [d("2026-08-14", null), d("2026-10-09", null)]),
  pending("MD", "Madrid", { ine: "28065", slug: "getafe", name: "Getafe", ineName: "Getafe", population: 193238, ineTable: 2881, capital: false }, [d("2026-05-14", null), d("2026-05-25", null)]),
  pending("MD", "Madrid", { ine: "28058", slug: "fuenlabrada", name: "Fuenlabrada", ineName: "Fuenlabrada", population: 190076, ineTable: 2881, capital: false }, [d("2026-09-14", null), d("2026-12-26", null)]),
  pending("MD", "Madrid", { ine: "28007", slug: "alcorcon", name: "Alcorcón", ineName: "Alcorcón", population: 175719, ineTable: 2881, capital: false }, [d("2026-04-06", null), d("2026-09-08", null)]),
  pending("MD", "Madrid", { ine: "28148", slug: "torrejon-de-ardoz", name: "Torrejón de Ardoz", short: "Torrejón", ineName: "Torrejón de Ardoz", population: 143526, ineTable: 2881, capital: false }, [d("2026-06-22", null), d("2026-06-23", null)]),
  pending("MD", "Madrid", { ine: "28106", slug: "parla", name: "Parla", ineName: "Parla", population: 137471, ineTable: 2881, capital: false }, [d("2026-06-15", null), d("2026-09-14", null)]),
  pending("MD", "Madrid", { ine: "28006", slug: "alcobendas", name: "Alcobendas", ineName: "Alcobendas", population: 123342, ineTable: 2881, capital: false }, [d("2026-01-24", null), d("2026-05-15", null)]),
  pending("MD", "Madrid", { ine: "28123", slug: "rivas-vaciamadrid", name: "Rivas-Vaciamadrid", short: "Rivas", ineName: "Rivas-Vaciamadrid", population: 103148, ineTable: 2881, capital: false }, [d("2026-05-14", null), d("2026-05-15", null)]),
  pending("MD", "Madrid", { ine: "28127", slug: "las-rozas", name: "Las Rozas de Madrid", short: "Las Rozas", ineName: "Rozas de Madrid, Las", population: 99037, ineTable: 2881, capital: false }, [d("2026-05-04", null), d("2026-09-29", null)]),
  pending("MD", "Madrid", { ine: "28134", slug: "san-sebastian-de-los-reyes", name: "San Sebastián de los Reyes", ineName: "San Sebastián de los Reyes", population: 96992, ineTable: 2881, capital: false }, [d("2026-01-20", null), d("2026-08-28", null)]),
  pending("MD", "Madrid", { ine: "28115", slug: "pozuelo-de-alarcon", name: "Pozuelo de Alarcón", short: "Pozuelo", ineName: "Pozuelo de Alarcón", population: 89770, ineTable: 2881, capital: false }, [d("2026-07-16", null), d("2026-09-07", null)]),
  pending("MD", "Madrid", { ine: "28161", slug: "valdemoro", name: "Valdemoro", ineName: "Valdemoro", population: 85972, ineTable: 2881, capital: false }, [d("2026-05-11", null), d("2026-09-08", null)]),
  pending("MD", "Madrid", { ine: "28049", slug: "coslada", name: "Coslada", ineName: "Coslada", population: 80512, ineTable: 2881, capital: false }, [d("2026-05-15", null), d("2026-06-08", null)]),
  pending("MD", "Madrid", { ine: "28080", slug: "majadahonda", name: "Majadahonda", ineName: "Majadahonda", population: 73625, ineTable: 2881, capital: false }, [d("2026-09-14", null), d("2026-11-25", null)]),
  pending("MD", "Madrid", { ine: "28047", slug: "collado-villalba", name: "Collado Villalba", ineName: "Collado Villalba", population: 67274, ineTable: 2881, capital: false }, [d("2026-06-12", null), d("2026-07-24", null)]),
  pending("MD", "Madrid", { ine: "28022", slug: "boadilla-del-monte", name: "Boadilla del Monte", short: "Boadilla", ineName: "Boadilla del Monte", population: 66349, ineTable: 2881, capital: false }, [d("2026-06-01", null), d("2026-10-05", null)]),
  pending("MD", "Madrid", { ine: "28013", slug: "aranjuez", name: "Aranjuez", ineName: "Aranjuez", population: 63040, ineTable: 2881, capital: false }, [d("2026-05-29", null), d("2026-09-04", null)]),
  pending("MD", "Madrid", { ine: "28014", slug: "arganda-del-rey", name: "Arganda del Rey", ineName: "Arganda del Rey", population: 60419, ineTable: 2881, capital: false }, [d("2026-09-11", null), d("2026-09-14", null)]),
  pending("MD", "Madrid", { ine: "28045", slug: "colmenar-viejo", name: "Colmenar Viejo", ineName: "Colmenar Viejo", population: 58730, ineTable: 2881, capital: false }, [d("2026-08-31", null), d("2026-09-01", null)]),
  pending("MD", "Madrid", { ine: "28113", slug: "pinto", name: "Pinto", ineName: "Pinto", population: 56651, ineTable: 2881, capital: false }, [d("2026-03-19", null), d("2026-05-15", null)]),
  pending("MD", "Madrid", { ine: "28903", slug: "tres-cantos", name: "Tres Cantos", ineName: "Tres Cantos", population: 54592, ineTable: 2881, capital: false }, [d("2026-03-21", null), d("2026-06-24", null)]),
];

const NAVARRA: CityRow[] = [
  // BON núm. 241, de 2.12.2025: Pamplona's own day; 3 December is common to all Navarra (Resolución 390/2025).
  pending("NC", "Navarra", { ine: "31201", slug: "pamplona", name: "Pamplona", ineName: "Pamplona/Iruña", population: 209094, ineTable: 2884, capital: true }, [d("2026-11-30", null), d("2026-12-03", "San Francisco Javier, Día de Navarra", { note: "común a toda Navarra" })]),
];

const VALENCIANA: CityRow[] = [
  // DOGV núm. 10238, de 14.11.2025; its correction of 15.1.2026 (DOGV núm. 10281) changes none of these.
  pending("VC", "Valencia", { ine: "46250", slug: "valencia", name: "Valencia", ineName: "València", population: 840792, ineTable: 2903, capital: true }, [d("2026-01-22", "San Vicente Mártir, patrón de la ciudad de València"), d("2026-04-13", "San Vicente Ferrer, patrón de la Comunidad Valenciana")]),
  pending("VC", "Alicante", { ine: "03014", slug: "alicante", name: "Alicante", ineName: "Alacant/Alicante", population: 366221, ineTable: 2856, capital: true }, [d("2026-04-16", "Festividad de Santa Faz"), d("2026-06-23", "Fogueres de Sant Joan")]),
  pending("VC", "Alicante", { ine: "03065", slug: "elche", name: "Elche", ineName: "Elx/Elche", population: 245557, ineTable: 2856, capital: false }, [d("2026-04-13", "Festividad de San Vicente Ferrer"), d("2026-12-29", "Festividad de la Venida de la Virgen")]),
  pending("VC", "Castellón", { ine: "12040", slug: "castellon-de-la-plana", name: "Castellón de la Plana", short: "Castellón", ineName: "Castelló de la Plana/Castellón de la Plana", population: 183711, ineTable: 2865, capital: true }, [d("2026-03-09", "Lunes de la Magdalena"), d("2026-06-29", "Festividad de San Pedro")]),
  pending("VC", "Alicante", { ine: "03133", slug: "torrevieja", name: "Torrevieja", ineName: "Torrevieja", population: 98533, ineTable: 2856, capital: false }, [d("2026-04-13", "San Vicente Ferrer"), d("2026-07-16", "Virgen del Carmen")]),
  pending("VC", "Valencia", { ine: "46244", slug: "torrent", name: "Torrent", ineName: "Torrent", population: 90928, ineTable: 2903, capital: false }, [d("2026-04-13", "San Vicente Ferrer"), d("2026-07-30", "Santos Patrones")]),
  pending("VC", "Alicante", { ine: "03099", slug: "orihuela", name: "Orihuela", ineName: "Orihuela", population: 84560, ineTable: 2856, capital: false }, [d("2026-07-17", "Gloriosa Enseña del Oriol y Fiestas de la Reconquista"), d("2026-09-08", "Festividad de Ntra. Sra. Virgen de Monserrate Patrona de Orihuela")]),
  pending("VC", "Valencia", { ine: "46131", slug: "gandia", name: "Gandia", ineName: "Gandia", population: 83135, ineTable: 2903, capital: false }, [d("2026-04-13", "San Vicente Ferrer"), d("2026-10-05", "San Francisco de Borja-Feria de Gandía")]),
  pending("VC", "Alicante", { ine: "03031", slug: "benidorm", name: "Benidorm", ineName: "Benidorm", population: 77327, ineTable: 2856, capital: false }, [d("2026-11-09", null), d("2026-11-10", null)]),
  pending("VC", "Valencia", { ine: "46190", slug: "paterna", name: "Paterna", ineName: "Paterna", population: 76019, ineTable: 2903, capital: false }, [d("2026-04-13", "San Vicente Ferrer"), d("2026-08-31", "Santísimo Cristo de la Fe")]),
  pending("VC", "Valencia", { ine: "46220", slug: "sagunto", name: "Sagunto", ineName: "Sagunt/Sagunto", population: 73031, ineTable: 2903, capital: false }, [d("2026-04-13", "San Vicente Ferrer"), d("2026-07-30", "Santos Abdón y Senén")]),
  pending("VC", "Alicante", { ine: "03009", slug: "alcoy", name: "Alcoy", ineName: "Alcoi/Alcoy", population: 61468, ineTable: 2856, capital: false }, [d("2026-04-25", null), d("2026-04-27", null)]),
  pending("VC", "Alicante", { ine: "03122", slug: "san-vicente-del-raspeig", name: "San Vicente del Raspeig", short: "San Vicente", ineName: "Sant Vicent del Raspeig/San Vicente del Raspeig", population: 60247, ineTable: 2856, capital: false }, [d("2026-04-13", "Fiestas Patronales y de Moros y Cristianos"), d("2026-04-14", "Fiestas Patronales y de Moros y Cristianos")]),
  pending("VC", "Alicante", { ine: "03066", slug: "elda", name: "Elda", ineName: "Elda", population: 55222, ineTable: 2856, capital: false }, [d("2026-09-08", "Fiestas Patronales"), d("2026-09-09", "Fiestas Patronales")]),
  pending("VC", "Castellón", { ine: "12135", slug: "vila-real", name: "Vila-real", ineName: "Vila-real", population: 53623, ineTable: 2865, capital: false }, [d("2026-05-18", "Festividad de San Pascual"), d("2026-12-26", "San Esteban")]),
];

/** Every city with a page, by community in the BOE's order, then as listed. */
export const CITY_ROWS: readonly CityRow[] = [
  ...ANDALUCIA,
  ...ARAGON,
  ...ASTURIAS,
  ...BALEARES,
  ...CANARIAS,
  ...CANTABRIA,
  ...CASTILLA_LA_MANCHA,
  ...CASTILLA_Y_LEON,
  ...EXTREMADURA,
  ...GALICIA,
  ...MADRID,
  ...MURCIA,
  ...NAVARRA,
  ...PAIS_VASCO,
  ...LA_RIOJA,
  ...VALENCIANA,
];

/**
 * Ceuta and Melilla: in scope, one municipality each. Their two local days
 * are on the community page (`SOURCES.CE.local.days`, `SOURCES.ML.local.days`),
 * which is their city page too.
 */
export const AUTONOMOUS_CITIES: readonly { ine: string; region: "CE" | "ML"; name: string; population: number; ineTable: number }[] = [
  { ine: "51001", region: "CE", name: "Ceuta", population: 83595, ineTable: 2908 },
  { ine: "52001", region: "ML", name: "Melilla", population: 86780, ineTable: 2909 },
];

/**
 * Cities in scope with no page, and why: none today (every pending community
 * had an official 2026 list). A city goes here, not on a page, when neither
 * its 2027 nor its 2026 days can be sourced.
 */
export const NOT_YET: readonly { ine: string; name: string; region: Region; population: number; ineTable: number; capital: boolean; reason: string }[] = [];

/**
 * The Catalan cities in the same scope (capitals and 50,000+): their pages
 * are the Catalan town pages (/es/festivos/<municipi>/), which the Cataluña
 * community page links; no page of their own here.
 */
export const CATALAN_CITIES: readonly { ine: string; population: number; ineTable: number; capital: boolean }[] = [
  { ine: "08019", population: 1731649, ineTable: 2861, capital: true },
  { ine: "08101", population: 289510, ineTable: 2861, capital: false },
  { ine: "08279", population: 233270, ineTable: 2861, capital: false },
  { ine: "08015", population: 231542, ineTable: 2861, capital: false },
  { ine: "08187", population: 225368, ineTable: 2861, capital: false },
  { ine: "25120", population: 146266, ineTable: 2878, capital: true },
  { ine: "43148", population: 143649, ineTable: 2900, capital: true },
  { ine: "08121", population: 131683, ineTable: 2861, capital: false },
  { ine: "08245", population: 123981, ineTable: 2861, capital: false },
  { ine: "43123", population: 111601, ineTable: 2900, capital: false },
  { ine: "17079", population: 108666, ineTable: 2870, capital: true },
  { ine: "08205", population: 97983, ineTable: 2861, capital: false },
  { ine: "08073", population: 92237, ineTable: 2861, capital: false },
  { ine: "08200", population: 85610, ineTable: 2861, capital: false },
  { ine: "08184", population: 82823, ineTable: 2861, capital: false },
  { ine: "08113", population: 80974, ineTable: 2861, capital: false },
  { ine: "08307", population: 71641, ineTable: 2861, capital: false },
  { ine: "08056", population: 70057, ineTable: 2861, capital: false },
  { ine: "08301", population: 67587, ineTable: 2861, capital: false },
  { ine: "08169", population: 66338, ineTable: 2861, capital: false },
  { ine: "08096", population: 65341, ineTable: 2861, capital: false },
  { ine: "08266", population: 58528, ineTable: 2861, capital: false },
  { ine: "08124", population: 52990, ineTable: 2861, capital: false },
  { ine: "08298", population: 50796, ineTable: 2861, capital: false },
];
