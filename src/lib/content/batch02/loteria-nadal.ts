import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import { dateYear, dayDate } from "./festive";
import { GROSSA_DRAW_DATE, GROSSA_URLS, PRIZES as GROSSA_PRIZES, TICKET_PRICE as GROSSA_TICKET, eur, levy, LEVY_EXEMPT } from "./grossa";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";
import { SHOPS } from "./shops";

/**
 * The Spanish Christmas lottery 2026 (Sorteo Extraordinario de Navidad, "la
 * loteria de Nadal", El Gordo), told from Catalonia: one page per language
 * whose lead, key facts, results, Catalan points of sale, titles and
 * description switch as soon as the lead pastes the numbers into
 * RESULTS_2026 on 22 December.
 *
 * Every fact was read on 31 Oct 2026 on official pages (fact pack:
 * research_notes/loteria-nadal-2026-factpack.md):
 *
 *  - SELAE, Lotería Nacional draw calendar, Saturdays, Q4 2026 (signed 18 Mar
 *    2026): draw 102 on Tuesday 22.12.26, 205 series of 100,000 tickets,
 *    20,500,000 tickets at 200 €, 4,100,000,000 € issue, Madrid - Teatro Real.
 *  - SELAE, prize programmes Q4 2026 (page 12, dated 26 Jan 2026): the full
 *    2026 Christmas programme per series, 70% to prizes (2,870,000,000 €),
 *    15,304 prizes and 14,000,000 € per series, décimos of 20 €.
 *  - loteriasyapuestas.es: the Lotería Nacional page (4,000,000 € a la serie,
 *    20 €, a number checker, El Niño on 6 Jan 2027 at 2,000,000 € a la serie),
 *    "Jugar a Lotería de Navidad" (20 € décimo, virtual online décimos, 1 to
 *    10 per purchase), "Ahora en juego" (online sales until 23:45 on 21 Dec
 *    2026), the help pages on collecting (under 2,000 € at almost 11,000
 *    outlets; 2,000 € or more only at BBVA and CaixaBank), on online prizes
 *    and on tax (20% over 40,000 € per décimo), and SELAE's 18+ page.
 *  - SELAE, 2025 Christmas press dossier: the 8:30 table, about four hours,
 *    the San Ildefonso children, payment from the afternoon of 22 Dec, the
 *    three-month expiry (23 Mar 2026 for 2025), the official list as the only
 *    valid one, 2024 sales by province, the two 1938 draws.
 *  - SELAE, 2025 results: the official prize list (S102), the draw record and
 *    the per-prize pages listing the points of sale.
 *  - RTVE (the broadcaster), 19 Dec 2025: the 2025 programme from 8:00 on La
 *    1, TVE Internacional and RTVE Play; RNE from 8:30 to 13:30.
 *  - BOE, Ley 35/2006 (IRPF), disposición adicional 33ª, and the Agencia
 *    Tributaria's non-resident page: 20% on the part of each décimo's prize
 *    above 40,000 €, withheld at payment.
 *
 * Not printed on purpose: a 2026 draw time (SELAE's draw record says 8:30, as
 * in 2025, but no 2026 dossier or announcement exists yet), a computed 2026
 * claim deadline, the BOE as a source of the programme (the BOE last carried
 * it for 2010, BOE-A-2010-19540), SELAE's evergreen "sus premios" page (still
 * on 195 series of 85,000), the dossier's historic "towns that sold the Gordo"
 * tables (its two tables disagree), which fourth prize each Catalan outlet
 * sold (SELAE does not say), shop names, and anything only the press reported.
 *
 * HOW TO UPDATE (the lead):
 *  - SELAE's 2026 Christmas dossier (the 2025 one is dated 16 Dec) states the
 *    start time: set DRAW_TIME_2026 = { time: "8:30", source: { name, url,
 *    publisher } }, move NADAL_AS_OF to that day, run the tests, deploy,
 *    publish `?only=loteria-nadal`.
 *  - 22 Dec, once SELAE publishes the numbers: fill RESULTS_2026 (template in
 *    its comment) with the thirteen numbers and `soldInCatalonia` set to null
 *    for every prize, set NADAL_AS_OF = "2026-12-22", run `npm test`
 *    (resultsProblems refuses typos, repeats, last year's numbers and
 *    unofficial sources), deploy, publish `?only=loteria-nadal`.
 *  - Same day or next, once SELAE's per-prize pages list the points of sale
 *    (prizePageUrl gives their address): replace each null with the Catalan
 *    municipalities, official names, [] when SELAE lists none in Catalonia;
 *    the tests refuse a name that is not a Catalan municipality. Deploy and
 *    publish again.
 *  - From 23 Dec 2026 the test "the results are in after the draw" fails while
 *    RESULTS_2026 is still null; from 24 Dec it also fails while the Gordo's,
 *    second's or third's Catalan points of sale are still null.
 *
 * No new photograph: the hero is the shops guide's hero (also the Christmas
 * in Barcelona hub's and La Marató's), with its exact alt text and caption,
 * because media rows are keyed by file and other wording would overwrite them.
 */

/** The draw (Tuesday). */
export const NADAL_DRAW_DATE = "2026-12-22";

/**
 * The day the page was last brought up to date. Every "checked on" line reads
 * this date, never the clock: the HTML is the same whichever day it renders.
 */
export const NADAL_AS_OF = "2026-10-31";

/** The facts were re-read on the sources on the as-of day: one constant to move. */
export const NADAL_VERIFIED = NADAL_AS_OF;

/* -------------------------------------------------------------------------- */
/* The draw, the issue and the prize programme (SELAE, 2026)                  */
/* -------------------------------------------------------------------------- */

export const DECIMO_PRICE = 20;
export const BILLETE_PRICE = 200;
export const SERIES = 205;
export const NUMBERS = 100_000;
export const ISSUE = 4_100_000_000;
export const PRIZE_POOL = 2_870_000_000;
/** The 2025 draw had 198 series (SELAE, 2025 dossier and official list). */
export const SERIES_2025 = 198;

export type PrizeKey =
  | "first"
  | "second"
  | "third"
  | "fourth"
  | "fifth"
  | "pedrea"
  | "approxFirst"
  | "approxSecond"
  | "approxThird"
  | "hundreds"
  | "lastTwo"
  | "reintegro";

export interface ProgrammeRow {
  key: PrizeKey;
  /** Prizes of this kind in each series. */
  count: number;
  /** Euros per billete (200 €); a décimo gets a tenth. */
  perBillete: number;
}

/**
 * SELAE's 2026 programme, per series. The centenas of the first, second and
 * third prizes (99 each) and of the two fourth prizes (198) are one row; so
 * are the 999 last-two-digit prizes of each of the three top prizes.
 */
export const PROGRAMME: ProgrammeRow[] = [
  { key: "first", count: 1, perBillete: 4_000_000 },
  { key: "second", count: 1, perBillete: 1_250_000 },
  { key: "third", count: 1, perBillete: 500_000 },
  { key: "fourth", count: 2, perBillete: 200_000 },
  { key: "fifth", count: 8, perBillete: 60_000 },
  { key: "pedrea", count: 1_794, perBillete: 1_000 },
  { key: "approxFirst", count: 2, perBillete: 20_000 },
  { key: "approxSecond", count: 2, perBillete: 12_500 },
  { key: "approxThird", count: 2, perBillete: 9_600 },
  { key: "hundreds", count: 99 + 99 + 99 + 198, perBillete: 1_000 },
  { key: "lastTwo", count: 999 * 3, perBillete: 1_000 },
  { key: "reintegro", count: 9_999, perBillete: 200 },
];

export const PRIZES_PER_SERIES = 15_304;
export const EUROS_PER_SERIES = 14_000_000;

export function perBillete(key: PrizeKey): number {
  return PROGRAMME.find((row) => row.key === key)?.perBillete ?? 0;
}

/** What one 20 € décimo of a prize gets: a tenth of the billete. */
export function perDecimo(key: PrizeKey): number {
  return perBillete(key) / 10;
}

/* -------------------------------------------------------------------------- */
/* The two slots the lead fills                                               */
/* -------------------------------------------------------------------------- */

/** Five digits exactly as printed on the décimo, leading zeros included: "07432". */
export type NadalNumber = string;

export type Province = "Barcelona" | "Girona" | "Lleida" | "Tarragona";

export const PROVINCES: Province[] = ["Barcelona", "Girona", "Lleida", "Tarragona"];

/** A Catalan municipality where SELAE lists a point of sale for a prize. */
export interface CatalanSale {
  /** The municipality's official name, as Idescat writes it: "el Prat de Llobregat". */
  town: string;
  province: Province;
}

/**
 * Per prize, the Catalan municipalities on SELAE's list of points of sale.
 * `[]` means SELAE lists none in Catalonia; `null`, that SELAE has not
 * published the list yet.
 */
export interface SoldInCatalonia {
  first: CatalanSale[] | null;
  second: CatalanSale[] | null;
  third: CatalanSale[] | null;
  /** Both fourth prizes together: SELAE's page does not say which number each outlet sold. */
  fourth: CatalanSale[] | null;
}

export interface NadalResults {
  /** El Gordo (4,000,000 € a billete, 400,000 € a décimo). */
  first: NadalNumber;
  second: NadalNumber;
  third: NadalNumber;
  /** The two fourth prizes. */
  fourth: NadalNumber[];
  /** The eight fifth prizes. */
  fifth: NadalNumber[];
  soldInCatalonia: SoldInCatalonia;
  /** The official page the numbers were copied from (SELAE). */
  source: B2Source;
}

/**
 * The winning numbers of 22 Dec 2026. Null until SELAE publishes them. To
 * fill, replace `null` with (these are 2025's numbers, as a shape only: the
 * tests refuse them):
 *
 *   {
 *     first: "79432",
 *     second: "70048",
 *     third: "90693",
 *     fourth: ["25508", "78477"],
 *     fifth: ["18669", "23112", "25412", "41716", "60649", "61366", "77715", "94273"],
 *     soldInCatalonia: { first: null, second: null, third: null, fourth: null },
 *     source: { name: "Lotería Nacional: premios mayores del sorteo del 22 de diciembre de 2026", url: "https://www.loteriasyapuestas.es/es/loteria-nacional/resultados/loteria-nacional-premios-mayores-del-sorteo-del-22-de-diciembre-de-2026", publisher: "SELAE" },
 *   }
 *
 * Then, from SELAE's per-prize pages (prizePageUrl("primer", 2026), ...),
 * each null becomes a list such as
 * [{ town: "Terrassa", province: "Barcelona" }], or [] when none is Catalan.
 */
export const RESULTS_2026: NadalResults | null = null;

export interface DrawTime {
  /** "8:30", 24-hour clock, Madrid time. */
  time: string;
  /** SELAE's 2026 dossier or announcement, or RTVE's. */
  source: B2Source;
}

/** The 2026 start time, once SELAE or RTVE announces it. */
export const DRAW_TIME_2026: DrawTime | null = null;

/** Hosts a results source may sit on: SELAE's two websites. */
export const RESULTS_HOSTS = ["www.loteriasyapuestas.es", "www.selae.es", "juegos.loteriasyapuestas.es"];

/** Hosts a draw-time source may sit on: SELAE and RTVE, which broadcasts the draw. */
export const TIME_HOSTS = [...RESULTS_HOSTS, "www.rtve.es"];

/** SELAE's page listing the points of sale of one prize ("primer", "segundo", "tercer", "cuarto", "quinto"). */
export function prizePageUrl(ordinal: "primer" | "segundo" | "tercer" | "cuarto" | "quinto", year: number): string {
  return `https://www.loteriasyapuestas.es/es/premios/${ordinal}-premio-de-loteria-nacional-del-sorteo-extraordinario-de-navidad-del-22-de-diciembre-de-${year}`;
}

/** The 2025 results (SELAE, 22 Dec 2025): printed as last year's, refused as this year's. */
export const RESULTS_2025: NadalResults = {
  first: "79432",
  second: "70048",
  third: "90693",
  fourth: ["25508", "78477"],
  fifth: ["18669", "23112", "25412", "41716", "60649", "61366", "77715", "94273"],
  soldInCatalonia: {
    first: [],
    second: [],
    third: [
      { town: "Barcelona", province: "Barcelona" },
      { town: "el Prat de Llobregat", province: "Barcelona" },
      { town: "Monistrol de Montserrat", province: "Barcelona" },
      { town: "Sant Boi de Llobregat", province: "Barcelona" },
      { town: "Terrassa", province: "Barcelona" },
      { town: "Cadaqués", province: "Girona" },
      { town: "Girona", province: "Girona" },
      { town: "Sant Joan de les Abadesses", province: "Girona" },
      { town: "Vielha e Mijaran", province: "Lleida" },
    ],
    fourth: [
      { town: "Arenys de Mar", province: "Barcelona" },
      { town: "Badalona", province: "Barcelona" },
      { town: "Barcelona", province: "Barcelona" },
      { town: "Sant Boi de Llobregat", province: "Barcelona" },
      { town: "Olot", province: "Girona" },
      { town: "Sort", province: "Lleida" },
    ],
  },
  source: {
    name: "Lista oficial de premios del Sorteo Extraordinario de Navidad del 22 de diciembre de 2025",
    url: "https://www.loteriasyapuestas.es/f/loterias/documentos/Loter%C3%ADa%20Nacional/listas%20de%20premios/SM_LISTAOFICIAL.A2025.S102.pdf",
    publisher: "SELAE",
  },
};

/** The thirteen numbers drawn for the five top categories. */
export function topNumbers(r: Pick<NadalResults, "first" | "second" | "third" | "fourth" | "fifth">): string[] {
  return [r.first, r.second, r.third, ...r.fourth, ...r.fifth];
}

function hostProblems(source: B2Source, hosts: string[]): string[] {
  const problems: string[] = [];
  try {
    const url = new URL(source.url);
    if (url.protocol !== "https:") problems.push("the source is not https");
    if (!hosts.includes(url.host)) problems.push(`${url.host} is not an official source`);
    if (/[?&]utm_/.test(url.search)) problems.push("the source URL carries tracking");
  } catch {
    problems.push(`the source URL is not valid: ${source.url}`);
  }
  return problems;
}

/** What is wrong with a results slot; empty when it can be published. */
export function resultsProblems(r: NadalResults): string[] {
  const problems: string[] = [];
  if (r.fourth.length !== 2) problems.push(`expected 2 fourth prizes, got ${r.fourth.length}`);
  if (r.fifth.length !== 8) problems.push(`expected 8 fifth prizes, got ${r.fifth.length}`);
  const numbers = topNumbers(r);
  for (const number of numbers) {
    if (!/^[0-9]{5}$/.test(number)) problems.push(`"${number}" is not five digits (keep the leading zeros)`);
  }
  if (new Set(numbers).size !== numbers.length) problems.push("a number appears twice: the thirteen top numbers are always different");
  const last = topNumbers(RESULTS_2025);
  if (numbers.filter((number) => last.includes(number)).length >= 3 || r.first === RESULTS_2025.first) {
    problems.push("these look like the 2025 numbers");
  }
  for (const [prize, sales] of Object.entries(r.soldInCatalonia) as [keyof SoldInCatalonia, CatalanSale[] | null][]) {
    if (sales === null) continue;
    const seen = new Set<string>();
    for (const sale of sales) {
      if (!sale.town.trim() || sale.town !== sale.town.trim()) problems.push(`${prize}: "${sale.town}" is empty or has stray spaces`);
      if (!PROVINCES.includes(sale.province)) problems.push(`${prize}: ${sale.province} is not a Catalan province`);
      if (seen.has(sale.town)) problems.push(`${prize}: ${sale.town} is listed twice`);
      seen.add(sale.town);
    }
  }
  problems.push(...hostProblems(r.source, RESULTS_HOSTS));
  return problems;
}

/** What is wrong with a draw-time slot; empty when it can be published. */
export function drawTimeProblems(t: DrawTime): string[] {
  const problems: string[] = [];
  if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(t.time)) problems.push(`"${t.time}" is not a 24-hour time like 8:30`);
  problems.push(...hostProblems(t.source, TIME_HOSTS));
  return problems;
}

/** True once `today` is after the draw but the winning numbers are still missing. */
export function isStale(today: string, results: NadalResults | null = RESULTS_2026): boolean {
  return today > NADAL_DRAW_DATE && results === null;
}

/** True from 24 Dec while the Catalan points of sale of the three top prizes are still unknown. */
export function salesStale(today: string, results: NadalResults | null = RESULTS_2026): boolean {
  if (!results || today <= "2026-12-23") return false;
  const { first, second, third } = results.soldInCatalonia;
  return first === null || second === null || third === null;
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

const SELAE_DOCS = "https://www.loteriasyapuestas.es/f/loterias/documentos/Loter%C3%ADa%20Nacional";

const U = {
  calendar: `${SELAE_DOCS}/Calendarios/CALENDARIO_CUARTO_TRIMESTRE_2026_SABADO.pdf`,
  programme: `${SELAE_DOCS}/programas%20de%20premios/PROGRAMAS_PREMIOS_CUARTO_TRIMESTRE_2026_SABADOS.pdf`,
  programmes: "https://www.loteriasyapuestas.es/es/centro-de-ayuda/calendarios/programas-de-premios-loteria-nacional",
  lnac: "https://www.loteriasyapuestas.es/es/loteria-nacional",
  play: "https://www.loteriasyapuestas.es/es/centro-de-ayuda/como-se-juega/jugar-a-loteria-de-navidad",
  nowOn: "https://www.loteriasyapuestas.es/es/apostar-online",
  collect: "https://www.loteriasyapuestas.es/es/centro-de-ayuda/informacion-sobre/como-cobrar-premios-red-presencial",
  online: "https://www.loteriasyapuestas.es/es/centro-de-ayuda/premios/que-tengo-que-hacer-si-tengo-premio",
  tax: "https://www.loteriasyapuestas.es/es/centro-de-ayuda/premios/como-tributan-los-premios-de-selae",
  minors: "https://www.selae.es/es/web-corporativa/responsabilidad-social/gestion-responsable-del-juego/primera-regla-del-juego-18-anos/primera-regla-del-juego-18-anos",
  dossier2025: "https://www.selae.es/f/loterias/documentos/Loter%C3%ADa%20Nacional/Dossier%20de%20prensa/DOSSIER%20NAVIDAD%202025.pdf",
  list2025: RESULTS_2025.source.url,
  results2025: "https://www.loteriasyapuestas.es/es/loteria-nacional/resultados/loteria-nacional-premios-mayores-del-sorteo-del-22-de-diciembre-de-2025",
  first2025: prizePageUrl("primer", 2025),
  second2025: prizePageUrl("segundo", 2025),
  third2025: prizePageUrl("tercer", 2025),
  fourth2025: prizePageUrl("cuarto", 2025),
  tv2025: "https://www.rtve.es/rtve/20251219/rtve-inicio-programacion-navidena-sorteo-loteria/16866332.shtml",
  irpf: GROSSA_URLS.irpf,
  aeatNonResidents: GROSSA_URLS.aeatNonResidents,
} as const;

export const NADAL_URLS = U;

const BASE_SOURCES: B2Source[] = [
  { name: "Calendario de sorteos de Lotería Nacional, sábados, cuarto trimestre de 2026 (18 de marzo de 2026)", url: U.calendar, publisher: "SELAE" },
  { name: "Programa de premios del Sorteo Extraordinario de Navidad del 22 de diciembre de 2026 (26 de enero de 2026)", url: U.programme, publisher: "SELAE" },
  { name: "Programas de premios de Lotería Nacional", url: U.programmes, publisher: "SELAE" },
  { name: "Lotería Nacional: próximos sorteos y comprobador de números", url: U.lnac, publisher: "SELAE" },
  { name: "Jugar a Lotería de Navidad", url: U.play, publisher: "SELAE" },
  { name: "Ahora en juego", url: U.nowOn, publisher: "SELAE" },
  { name: "¿Cómo cobro los premios de resguardos comprados en la Red Comercial?", url: U.collect, publisher: "SELAE" },
  { name: "¿Qué tengo que hacer si tengo premio de una apuesta comprada en el canal online?", url: U.online, publisher: "SELAE" },
  { name: "¿Cómo tributan los premios de SELAE?", url: U.tax, publisher: "SELAE" },
  { name: "Primera regla del juego: +18 años", url: U.minors, publisher: "SELAE" },
  { name: "Dossier de prensa del Sorteo Extraordinario de Navidad 2025", url: U.dossier2025, publisher: "SELAE" },
  { name: RESULTS_2025.source.name, url: U.list2025, publisher: "SELAE" },
  { name: "Lotería Nacional: premios mayores del sorteo del 22 de diciembre de 2025", url: U.results2025, publisher: "SELAE" },
  { name: "Primer premio del Sorteo Extraordinario de Navidad del 22 de diciembre de 2025: puntos de venta", url: U.first2025, publisher: "SELAE" },
  { name: "Segundo premio del Sorteo Extraordinario de Navidad del 22 de diciembre de 2025: puntos de venta", url: U.second2025, publisher: "SELAE" },
  { name: "Tercer premio del Sorteo Extraordinario de Navidad del 22 de diciembre de 2025: puntos de venta", url: U.third2025, publisher: "SELAE" },
  { name: "Cuarto premio del Sorteo Extraordinario de Navidad del 22 de diciembre de 2025: puntos de venta", url: U.fourth2025, publisher: "SELAE" },
  { name: "RTVE da inicio a su programación navideña con el Sorteo de la Lotería (19/12/2025)", url: U.tv2025, publisher: "RTVE" },
  { name: "Ley 35/2006, del Impuesto sobre la Renta de las Personas Físicas, disposición adicional trigésima tercera", url: U.irpf, publisher: "BOE" },
  { name: "Gravamen especial sobre premios de loterías y apuestas (no residentes)", url: U.aeatNonResidents, publisher: "Agencia Tributaria" },
];

/** Every source the page cites: the fixed ones plus the results, per-prize and time sources, once. */
export function nadalSources(results: NadalResults | null = RESULTS_2026, time: DrawTime | null = DRAW_TIME_2026): B2Source[] {
  const prizePages: B2Source[] = results
    ? (["primer", "segundo", "tercer", "cuarto"] as const)
        .filter((ordinal, i) => [results.soldInCatalonia.first, results.soldInCatalonia.second, results.soldInCatalonia.third, results.soldInCatalonia.fourth][i] !== null)
        .map((ordinal) => ({
          name: `${{ primer: "Primer", segundo: "Segundo", tercer: "Tercer", cuarto: "Cuarto" }[ordinal]} premio del Sorteo Extraordinario de Navidad del 22 de diciembre de 2026: puntos de venta`,
          url: prizePageUrl(ordinal, 2026),
          publisher: "SELAE",
        }))
    : [];
  const seen = new Set<string>();
  const all: B2Source[] = [];
  for (const source of [...(results ? [results.source] : []), ...prizePages, ...(time ? [time.source] : []), ...BASE_SOURCES]) {
    if (seen.has(source.url)) continue;
    seen.add(source.url);
    all.push({ name: source.name, url: source.url, publisher: source.publisher });
  }
  return all;
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

type Meta = { path: string; title: string; excerpt: string };

export const NADAL_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/loteria-de-nadal",
    title: "Loteria de Nadal 2026: quan és, premis, impostos i on ha tocat a Catalunya",
    excerpt:
      "La loteria de Nadal 2026: quan és el sorteig, quins premis reparteix, quant paga a Hisenda, com comprovar i cobrar un dècim i on ha tocat a Catalunya.",
  },
  es: {
    path: "guias/loteria-de-navidad",
    title: "Lotería de Navidad 2026: cuándo es, premios, impuestos y dónde ha tocado en Cataluña",
    excerpt:
      "La Lotería de Navidad 2026: cuándo es el sorteo, qué premios reparte, cuánto paga a Hacienda, cómo comprobar y cobrar un décimo y dónde ha tocado en Cataluña.",
  },
  en: {
    path: "guides/spanish-christmas-lottery",
    title: "Spanish Christmas Lottery 2026 (El Gordo): date, prizes, tax and where it fell in Catalonia",
    excerpt:
      "The Spanish Christmas Lottery 2026: draw date, prizes, tax, how to check and claim a décimo, and where El Gordo and the big prizes fell in Catalonia.",
  },
};

const SEO_TITLE: Record<Locale, { pending: string; results: string }> = {
  ca: { pending: "Loteria de Nadal 2026: quan és, premis i on toca a Catalunya", results: "Loteria de Nadal 2026: on ha tocat el Gordo a Catalunya" },
  es: { pending: "Lotería de Navidad 2026 en Cataluña: fecha, hora y premios", results: "Lotería Navidad 2026: dónde ha tocado el Gordo en Cataluña" },
  en: { pending: "Spanish Christmas Lottery 2026: El Gordo date, prizes, tax", results: "Spanish Christmas Lottery 2026 results: El Gordo number" },
};

export function nadalSeoTitle(locale: Locale, results: NadalResults | null = RESULTS_2026): string {
  return results ? SEO_TITLE[locale].results : SEO_TITLE[locale].pending;
}

/** Answer-first meta description: the date and top prize, or the winning numbers once they are in. */
export function nadalDescription(locale: Locale, results: NadalResults | null = RESULTS_2026): string {
  if (results) {
    const { first, second, third } = results;
    return {
      ca: `El Gordo de la loteria de Nadal 2026 és el ${first} (400.000 € al dècim). Segon, el ${second}; tercer, el ${third}. On ha tocat a Catalunya i com cobrar.`,
      es: `El Gordo de la Lotería de Navidad 2026 es el ${first} (400.000 € al décimo). Segundo, el ${second}; tercero, el ${third}. Dónde ha tocado en Cataluña.`,
      en: `The 2026 Spanish Christmas Lottery El Gordo is ${first} (€400,000 per décimo). Second ${second}, third ${third}. Where it fell in Catalonia.`,
    }[locale];
  }
  return {
    ca: "La loteria de Nadal 2026 se sorteja el dimarts 22 de desembre: dècim de 20 € i 400.000 € de Gordo per dècim. Hora, premis, impostos i Catalunya.",
    es: "La Lotería de Navidad 2026 se sortea el martes 22 de diciembre: décimo de 20 € y 400.000 € de Gordo por décimo. Hora, premios, impuestos y Cataluña.",
    en: "The Spanish Christmas Lottery 2026 is drawn on Tuesday 22 December: €20 a décimo, €400,000 El Gordo per décimo. Time, prizes, tax and Catalonia.",
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

const link = (href: string, label: string) => `[${label}](${href})`;
const strip = (text: string) => text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "a i b" / "a y b" / "a and b"; "a, b i c". */
function join(items: string[], locale: Locale): string {
  const and = { ca: "i", es: "y", en: "and" }[locale];
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

/** "Barcelona i Terrassa (Barcelona); Olot (Girona)", province by province in a fixed order. */
export function townsLine(sales: CatalanSale[], locale: Locale): string {
  const label = (province: Province) => (locale === "en" ? `${province} province` : province);
  return PROVINCES.filter((province) => sales.some((sale) => sale.province === province))
    .map((province) => `${join(sales.filter((sale) => sale.province === province).map((sale) => sale.town), locale)} (${label(province)})`)
    .join("; ");
}

/** The number just before and after; null at the two ends, where SELAE's rule is not restated here. */
function neighbours(number: NadalNumber): [string, string] | null {
  const value = Number(number);
  if (value <= 0 || value >= NUMBERS - 1) return null;
  const pad = (n: number) => String(n).padStart(5, "0");
  return [pad(value - 1), pad(value + 1)];
}

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

interface Ctx {
  locale: Locale;
  results: NadalResults | null;
  time: DrawTime | null;
  /** "dimarts 22 de desembre de 2026" */
  day: string;
  /** "dimarts 22 de desembre" */
  dayNoYear: string;
  /** "31 d'octubre de 2026" */
  checked: string;
}

type Category = "first" | "second" | "third" | "fourth";

interface Copy {
  prizeNames: Record<PrizeKey, string>;
  lead(c: Ctx): string;
  keyFactsTitle: string;
  keyFacts(c: Ctx): { label: string; value: string }[];
  data(c: Ctx): string;
  resultsHeading(c: Ctx): string;
  resultsPending(c: Ctx): string[];
  resultsTable: { caption: string; headers: string[]; note: string; fourth: string; fifth: string };
  resultsAfter(r: NadalResults): string[];
  cataloniaHeading: string;
  /** One line per prize once the results are in. */
  soldLine(category: Category, number: string, sales: CatalanSale[] | null): string;
  cataloniaPending: string[];
  cataloniaAlways: string[];
  whenHeading: string;
  when(c: Ctx): string[];
  drawHeading: string;
  draw: string[];
  prizesHeading: string;
  prizesIntro: string;
  prizeTable: { caption: string; headers: string[]; note: string };
  prizesAfter: string[];
  buyHeading: string;
  buy: string[];
  buyAfter: string;
  checkHeading: string;
  check: string[];
  claimHeading: string;
  claim: string[];
  claimAfter: string[];
  taxHeading: string;
  taxIntro: string;
  taxTable: { caption: string; headers: string[]; rows: string[][] };
  taxAfter: string[];
  grossaHeading: string;
  grossa: string[];
  responsibleTitle: string;
  responsible: string;
  faq(c: Ctx): { question: string; answer: string }[];
}

const D = (key: PrizeKey, locale: Locale) => eur(perDecimo(key), locale);
const B = (key: PrizeKey, locale: Locale) => eur(perBillete(key), locale);

const NET_FIRST = perDecimo("first") - levy(perDecimo("first"));
const NET_SECOND = perDecimo("second") - levy(perDecimo("second"));
const NET_THIRD = perDecimo("third") - levy(perDecimo("third"));

const R25 = RESULTS_2025;
const SOLD25 = R25.soldInCatalonia as { first: CatalanSale[]; second: CatalanSale[]; third: CatalanSale[]; fourth: CatalanSale[] };

const COPY: Record<Locale, Copy> = {
  /* ------------------------------------------------------------------ ca */
  ca: {
    prizeNames: {
      first: "Primer premi (el Gordo)",
      second: "Segon premi",
      third: "Tercer premi",
      fourth: "Quarts premis",
      fifth: "Cinquens premis",
      pedrea: "Pedrea",
      approxFirst: "Número anterior i posterior al Gordo",
      approxSecond: "Número anterior i posterior al segon",
      approxThird: "Número anterior i posterior al tercer",
      hundreds: "Resta de la centena del 1r, 2n, 3r i dels dos 4ts",
      lastTwo: "Dues últimes xifres del 1r, 2n o 3r",
      reintegro: "Reintegrament (última xifra del Gordo)",
    },
    lead: (c) => {
      if (c.results) {
        const r = c.results;
        return `**El ${r.first} és el Gordo de la loteria de Nadal 2026: 400.000 € per dècim de 20 €.** El segon premi és el ${r.second} (125.000 € per dècim) i el tercer, el ${r.third} (50.000 €). Quarts premis (20.000 €): ${join([...r.fourth], "ca")}. Cinquens premis (6.000 €): ${join([...r.fifth], "ca")}. Més avall hi ha on s'han venut a Catalunya, segons SELAE. Comprova el teu dècim als ${link(r.source.url, "resultats oficials de SELAE")}.`;
      }
      const time = c.time
        ? `El sorteig començarà a les ${c.time.time}, segons ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.`
        : `L'hora del 2026 encara no s'ha anunciat (${c.checked}); el 2025, RTVE el va emetre en directe a La 1 des de les 8:00.`;
      return `**La loteria de Nadal 2026 se sorteja el ${c.dayNoYear} al Teatro Real de Madrid, i el primer premi, el Gordo, és de 400.000 € per dècim de 20 €.** És el sorteig extraordinari de la Loteria Nacional de l'Estat (SELAE): 205 sèries de 100.000 números, del 00000 al 99999, i 2.870 milions d'euros en premis. ${time} El dia del sorteig, aquí hi haurà els números premiats i els municipis de Catalunya on s'han venut.`;
    },
    keyFactsTitle: "La loteria de Nadal 2026, d'un cop d'ull",
    keyFacts: (c) => [
      ...(c.results
        ? [
            { label: "Gordo 2026", value: `${c.results.first} (400.000 € per dècim)` },
            { label: "Segon i tercer premis", value: `${c.results.second} (125.000 €) i ${c.results.third} (50.000 €)` },
            { label: "Quarts premis", value: `${join([...c.results.fourth], "ca")} (20.000 € per dècim)` },
            { label: "Cinquens premis", value: `${join([...c.results.fifth], "ca")} (6.000 € per dècim)` },
          ]
        : [
            { label: "Data del sorteig", value: `${cap(c.day)}, al Teatro Real de Madrid` },
            { label: "Hora", value: c.time ? c.time.time : "Encara no anunciada (el 2025, RTVE l'emetia des de les 8:00)" },
            { label: "Primer premi (el Gordo)", value: "400.000 € per dècim; 4 milions per bitllet" },
            { label: "Altres premis grossos", value: "Segon de 125.000 € per dècim, tercer de 50.000 €, dos quarts de 20.000 € i vuit cinquens de 6.000 €" },
          ]),
      { label: "Preu", value: "20 € el dècim; 200 € el bitllet de 10 dècims" },
      { label: "Emissió", value: "205 sèries de 100.000 números: 4.100 milions d'euros, i el 70% (2.870 milions) en premis" },
      { label: "Compra per internet", value: "Al web i l'app de SELAE, fins a les 23:45 del 21 de desembre" },
      { label: "Termini per cobrar", value: "Tres mesos, comptats des de l'endemà del sorteig" },
      { label: "Impostos", value: "El 20% del que passa de 40.000 € per dècim" },
    ],
    data: (c) =>
      c.results
        ? "Els números premiats són els que publica SELAE, i per cobrar només val la llista oficial de premis. Els municipis de Catalunya són els que SELAE llista com a punts de venda de cada premi. El programa de premis i el calendari són de SELAE, i els impostos, de la llei de l'IRPF."
        : `Tot surt dels documents de SELAE (Loteries i Apostes de l'Estat), que organitza el sorteig: el calendari i el programa de premis del 2026, el seu web i el dossier de premsa del 2025; de RTVE, que l'emet, i de la llei de l'IRPF. ${c.time ? "" : "L'hora del 2026 encara no s'ha publicat. "}El que va passar el 2024 i el 2025 sempre porta l'any al costat.`,
    resultsHeading: (c) => (c.results ? "Números premiats de la loteria de Nadal 2026" : "Resultats de la loteria de Nadal 2026"),
    resultsPending: (c) => [
      `El sorteig és el ${c.day}. SELAE publica els números premiats a la ${link(U.lnac, "pàgina de la Loteria Nacional")}, que té un comprovador, i la tarda del 22 la llista oficial de premis, l'única que val per cobrar (així ho va fer el 2025). Aquí hi posarem el Gordo i la resta de premis grossos tan bon punt surtin.`,
      `**Resultats del 2025**, com a referència: el Gordo va ser el ${R25.first}; el segon premi, el ${R25.second}; el tercer, el ${R25.third}; els quarts, ${join(R25.fourth.map((n) => `el ${n}`), "ca")}, i els vuit cinquens, el ${join([...R25.fifth], "ca")}, segons la ${link(U.list2025, "llista oficial de SELAE")}. El reintegrament va ser el 2.`,
    ],
    resultsTable: {
      caption: "Premis grossos de la loteria de Nadal 2026",
      headers: ["Premi", "Número", "Per dècim (20 €)", "Per bitllet (200 €)"],
      note: "Font: SELAE. Per cobrar només val la llista oficial de premis.",
      fourth: "Quart premi",
      fifth: "Cinquè premi",
    },
    resultsAfter: (r) => {
      const n = neighbours(r.first);
      return [
        `**Amb el Gordo també cobren:** ${n ? `el ${n[0]} i el ${n[1]}, el número anterior i el posterior (${D("approxFirst", "ca")} per dècim)` : `el número anterior i el posterior (${D("approxFirst", "ca")} per dècim)`}; la resta de la centena, del ${r.first.slice(0, 3)}00 al ${r.first.slice(0, 3)}99 (${D("hundreds", "ca")}); tots els acabats en ${r.first.slice(3)} (${D("lastTwo", "ca")}), i tots els acabats en ${r.first.slice(4)}, el reintegrament (${D("reintegro", "ca")}). Els premis s'acumulen: un dècim pot cobrar-ne més d'un.`,
        `La pedrea, els 1.794 números que cobren ${D("pedrea", "ca")} per dècim, és a la llista oficial. Comprova-hi el teu dècim als ${link(r.source.url, "resultats de SELAE")} o en un punt de venda, i mira més avall on es cobra cada premi i quants impostos paga.`,
      ];
    },
    cataloniaHeading: "On ha tocat la loteria de Nadal a Catalunya?",
    soldLine: (category, number, sales) => {
      const name = { first: `**El Gordo (${number})**`, second: `**El segon premi (${number})**`, third: `**El tercer premi (${number})**`, fourth: `**Els quarts premis (${number})**` }[category];
      if (sales === null) return `${name}: SELAE encara no ha publicat on s'ha venut.`;
      if (sales.length === 0) return `${name}: SELAE no hi llista cap punt de venda a Catalunya.`;
      return `${name}: ${townsLine(sales, "ca")}.${category === "fourth" ? " SELAE no diu quin dels dos va vendre cada punt." : ""}`;
    },
    cataloniaPending: [
      "Tan bon punt SELAE publiqui on s'han venut els premis grossos, aquí hi haurà els municipis de Catalunya que han venut el Gordo, el segon i el tercer premi.",
      `**El 2025**, segons les llistes de punts de venda de SELAE, ni el ${link(U.first2025, `Gordo (${R25.first})`)} ni el ${link(U.second2025, `segon premi (${R25.second})`)} es van vendre a Catalunya: el primer, a la Pola de Gordón, Villablino i la Bañeza (Lleó) i a Madrid, i el segon, només a Madrid. El ${link(U.third2025, `tercer premi (${R25.third})`)} sí: ${townsLine(SOLD25.third, "ca")}. Els ${link(U.fourth2025, `dos quarts premis (${join([...R25.fourth], "ca")})`)} es van vendre a ${townsLine(SOLD25.fourth, "ca")}, entre altres llocs; SELAE no diu quin dels dos va vendre cada punt.`,
    ],
    cataloniaAlways: [
      `**Quant s'hi juga a Catalunya.** El 2024 es van vendre a Catalunya 423.498.540 € de loteria de Nadal, 53,55 € per habitant, per sota de la mitjana espanyola (73,00 €), segons el ${link(U.dossier2025, "dossier de SELAE del 2025")}. De les quatre províncies, Lleida és la que més hi juga: 108,44 € per habitant, davant de Tarragona (51,76 €), Barcelona (50,69 €) i Girona (45,62 €).`,
      "**Un sorteig a Barcelona.** El 1938, en plena Guerra Civil, es van fer dos sortejos de Nadal el 22 de desembre, un a Barcelona i un altre a Burgos, recorda SELAE.",
    ],
    whenHeading: "Quan és el sorteig de la loteria de Nadal 2026, a quina hora i on es pot veure?",
    when: (c) => [
      c.results
        ? `El sorteig es va fer el **${c.day}** al Teatro Real de Madrid, segons el ${link(U.calendar, "calendari de sortejos de SELAE")}.${c.time ? ` Va començar a les ${c.time.time}, segons ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.` : ""} Els números premiats són a la taula de resultats, al principi d'aquesta pàgina.`
        : `El sorteig és el **${c.day}** al Teatro Real de Madrid, segons el ${link(U.calendar, "calendari de sortejos de SELAE")}. ${
            c.time
              ? `Començarà a les ${c.time.time}, segons ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.`
              : `SELAE encara no n'ha anunciat l'hora (${c.checked}). El 2025, segons el ${link(U.dossier2025, "dossier de premsa de SELAE")}, la mesa que presideix el sorteig es constituïa a les 8:30, i SELAE en preveia una durada d'unes quatre hores.`
          }`,
      `**On es veu.** El 2025, ${link(U.tv2025, "segons RTVE")}, el sorteig es va emetre en directe a La 1, TVE Internacional i RTVE Play a partir de les 8:00, i Ràdio Nacional hi va dedicar un especial de 8:30 a 13:30. Aquell any RTVE en va produir el senyal i el va cedir gratuïtament a tots els mitjans.`,
      `**Fins quan es pot comprar?** Al web i l'app de SELAE, fins a les 23:45 del dilluns 21 de desembre, la nit abans del sorteig, segons el ${link(U.nowOn, "compte enrere de SELAE")}. El 22 de desembre de 2026 és dimarts i és feiner a Catalunya (${b2link("holidayToday", "ca", "és festiu avui?")}).`,
    ],
    drawHeading: "Com es fa el sorteig: dos bombos i els nens de San Ildefonso",
    draw: [
      "És un sorteig pel sistema tradicional, amb dos bombos: el gran té les 100.000 boles dels números i el petit, una bola per a cada premi que surt del bombo, 1.807 el 2025. Un nen o una nena de la Residència de San Ildefonso de Madrid treu una bola del bombo dels números i un altre, alhora, una del dels premis, i dos més les canten.",
      `Segons SELAE, la cantada pot tenir errors i per això es revisa diverses vegades; l'únic resultat vàlid per cobrar és el de la llista oficial de premis, que el 2025 es va repartir la tarda del 22 de desembre als punts de venda i als mitjans i es va penjar al web de SELAE (${link(U.dossier2025, "dossier del 2025")}).`,
    ],
    prizesHeading: "Premis de la loteria de Nadal 2026",
    prizesIntro: `SELAE hi posa 205 sèries de 100.000 números, set més que el 2025, per un total de 4.100 milions d'euros; el 70%, 2.870 milions, va a premis. Cada número té 205 bitllets, un per sèrie, i cada bitllet de 200 € es divideix en 10 dècims de 20 €. El ${link(U.programme, "programa de premis de SELAE")} dona els imports per bitllet; un dècim en cobra la desena part:`,
    prizeTable: {
      caption: "Premis de la loteria de Nadal 2026 (programa de SELAE del 26 de gener de 2026)",
      headers: ["Premi", "Quants n'hi ha a cada sèrie", "Per bitllet (200 €)", "Per dècim (20 €)"],
      note: "Cada sèrie reparteix 15.304 premis i 14 milions d'euros. Els premis s'acumulen.",
    },
    prizesAfter: [
      `**La pedrea** són els 1.794 premis de ${D("pedrea", "ca")} per dècim que surten del bombo, a més dels grossos. **El reintegrament**: tots els dècims acabats en la mateixa xifra que el Gordo recuperen els 20 €, menys el del Gordo mateix, segons la llista oficial del 2025.`,
      `Els premis s'acumulen: un dècim acabat en les dues últimes xifres del Gordo també acaba en la seva última xifra, i cobra ${D("lastTwo", "ca")} més ${D("reintegro", "ca")} de reintegrament, ${eur(perDecimo("lastTwo") + perDecimo("reintegro"), "ca")} (al ${link(U.dossier2025, "dossier del 2025")}, SELAE ho comptava com a 6 € per euro jugat).`,
    ],
    buyHeading: "On comprar la loteria de Nadal: només als canals oficials",
    buy: [
      `**Als punts de venda de SELAE:** administracions de loteria i establiments de la xarxa comercial de Loteries i Apostes de l'Estat, gairebé 11.000 a tot l'Estat, segons ${link(U.collect, "SELAE")}.`,
      `**Al web i l'app de SELAE** (${link(U.play, "loteriasyapuestas.es")}): hi pots triar el número o deixar que el sistema el triï, i comprar d'1 a 10 dècims de cop. Són dècims virtuals, sense paper, que juguen en les mateixes condicions que els de paper; el premi s'ingressa sense haver de presentar res.`,
    ],
    buyAfter: `SELAE recorda que els menors de 18 anys no poden participar en els seus jocs, ni als punts de venda ni per internet (${link(U.minors, "Llei 13/2011 del joc")}).`,
    checkHeading: "Com comprovar si t'ha tocat la loteria de Nadal",
    check: [
      `**Al web de SELAE:** la ${link(U.lnac, "pàgina de la Loteria Nacional")} té un comprovador de números.`,
      `**A la llista oficial de premis:** és l'única que val per cobrar, i el 2025 SELAE la va penjar al seu web la mateixa tarda del sorteig. Hi surten la pedrea, les aproximacions (marcades amb una a), les centenes (c) i les terminacions (t).`,
      `**Si l'has comprat per internet,** SELAE t'avisa per correu electrònic i SMS, i els premis de menys de 2.000 € s'ingressen sols al moneder del teu compte (${link(U.online, "SELAE")}).`,
    ],
    claimHeading: "On es cobren els premis de la loteria de Nadal",
    claim: [
      "**Menys de 2.000 € per dècim:** a qualsevol punt de venda de SELAE. El 2025 es podien cobrar en efectiu o per Bizum.",
      "**2.000 € o més:** només a les oficines de BBVA i de CaixaBank. No cal ser-ne client, no es paga comissió i cal el document d'identitat original i vigent; SELAE recomana demanar cita prèvia.",
      "**Dècim compartit:** per cobrar 2.000 € o més hi han d'anar tots els titulars a identificar-se, o un representant amb poders atorgats davant notari.",
      "**Comprat per internet:** menys de 2.000 €, al moneder automàticament (si passa del saldo màxim de 400 €, al teu compte bancari); 2.000 € o més, per transferència, després de verificar el compte.",
    ],
    claimAfter: [
      `**Quan:** el 2025, SELAE va començar a pagar la tarda del mateix 22 de desembre, en acabar les verificacions. **Termini:** el dret a cobrar caduca als tres mesos comptats des de l'endemà del sorteig, segons la ${link(U.list2025, "llista oficial")}; per al sorteig del 2025, l'últim dia va ser el 23 de març de 2026.`,
      "Si el dècim premiat està fet malbé, s'ha de portar a un punt de venda amb el formulari de sol·licitud de pagament de premis, i SELAE l'autentica. Si te l'han robat, SELAE recomana denunciar-ho.",
    ],
    taxHeading: "Quants impostos paga la loteria de Nadal?",
    taxIntro: `Els premis de fins a 40.000 € per dècim no paguen. Del que passa de 40.000 €, Hisenda se'n queda el 20%: és el gravamen especial sobre els premis de loteries de la ${link(U.irpf, "llei de l'IRPF (disposició addicional 33a)")}, i es reté en el moment de cobrar, segons ${link(U.tax, "SELAE")}. Per dècim de 20 €:`,
    taxTable: {
      caption: "Gravamen sobre un dècim de 20 € premiat",
      headers: ["Premi del dècim", "Gravamen (20% del que passa de 40.000 €)", "Cobres"],
      rows: [
        [`${D("first", "ca")} (Gordo)`, eur(levy(perDecimo("first")), "ca"), eur(NET_FIRST, "ca")],
        [`${D("second", "ca")} (segon premi)`, eur(levy(perDecimo("second")), "ca"), eur(NET_SECOND, "ca")],
        [`${D("third", "ca")} (tercer premi)`, eur(levy(perDecimo("third")), "ca"), eur(NET_THIRD, "ca")],
        [`${D("fourth", "ca")} (quart premi) o menys`, "0 €", "Tot el premi"],
      ],
    },
    taxAfter: [
      `El gravamen es calcula per dècim. Si un dècim és de diverses persones, els ${eur(LEVY_EXEMPT, "ca")} exempts es reparteixen segons la part de cadascuna. Les persones que no resideixen a Espanya tenen el mateix gravamen i la mateixa exempció, segons l'${link(U.aeatNonResidents, "Agència Tributària")}.`,
    ],
    grossaHeading: "Loteria de Nadal, La Grossa de Cap d'Any i el Nen",
    grossa: [
      `La loteria de Nadal és de l'Estat (SELAE) i se sorteja a Madrid. A Catalunya, nou dies després, hi ha ${b2link("grossa", "ca", "La Grossa de Cap d'Any")}, la loteria de la Generalitat: es fa el ${dayDate(GROSSA_DRAW_DATE, "ca")}, el bitllet costa ${eur(GROSSA_TICKET, "ca")} i el primer premi és de ${eur(GROSSA_PRIZES.first.five, "ca")} per bitllet. Els bitllets d'una no serveixen per a l'altra.`,
      `Després ve el sorteig extraordinari del Nen (El Niño) de SELAE, el dimecres 6 de gener de 2027, amb 2 milions d'euros per sèrie al primer premi i dècims de 20 €, segons la ${link(U.lnac, "pàgina de la Loteria Nacional")}. Per a la resta de les festes, mira ${b2link("christmasBarcelona", "ca", "Nadal a Barcelona")} i ${b2link("newYear", "ca", "Cap d'Any a Barcelona")}.`,
    ],
    responsibleTitle: "Joc responsable",
    responsible: "Juga només si ets major d'edat i amb un pressupost tancat. SELAE té un telèfon d'atenció a la clientela, el 900 11 23 13.",
    faq: (c) => [
      {
        question: "Quan és el sorteig de la loteria de Nadal 2026?",
        answer: c.results
          ? `Es va fer el ${c.day} al Teatro Real de Madrid${c.time ? `, a les ${c.time.time}` : ""}.`
          : `El ${c.day}, al Teatro Real de Madrid. ${c.time ? `Comença a les ${c.time.time}.` : "L'hora del 2026 encara no s'ha anunciat; el 2025, RTVE l'emetia a La 1 des de les 8:00."}`,
      },
      {
        question: "On ha tocat la loteria de Nadal a Catalunya?",
        answer: c.results
          ? (["first", "second", "third"] as const).map((k) => COPY.ca.soldLine(k, c.results![k], c.results!.soldInCatalonia[k])).join(" ")
          : `El sorteig és el 22 de desembre de 2026, i aquí hi posarem els municipis tan bon punt SELAE els publiqui. El 2025, ni el Gordo ni el segon premi es van vendre a Catalunya; el tercer premi, sí: ${townsLine(SOLD25.third, "ca")}.`,
      },
      {
        question: "Quin és el número del Gordo de la loteria de Nadal 2026?",
        answer: c.results
          ? `El ${c.results.first}. El segon premi és el ${c.results.second} i el tercer, el ${c.results.third}.`
          : `Se sabrà el ${c.day}. El 2025 el Gordo va ser el ${R25.first}.`,
      },
      {
        question: "Quant es cobra pel Gordo de Nadal?",
        answer: `${D("first", "ca")} per dècim de 20 €, 4 milions per bitllet. Hisenda en reté ${eur(levy(perDecimo("first")), "ca")}: per dècim en cobres ${eur(NET_FIRST, "ca")}.`,
      },
      { question: "Quant val un dècim de la loteria de Nadal?", answer: "20 €. El bitllet sencer, de 10 dècims, en val 200." },
      {
        question: "Quants impostos paga la loteria de Nadal?",
        answer: `Res fins a 40.000 € per dècim; del que passa, el 20%, que es reté en cobrar. El segon premi (${D("second", "ca")}) en paga ${eur(levy(perDecimo("second")), "ca")} i el tercer (${D("third", "ca")}), ${eur(levy(perDecimo("third")), "ca")}.`,
      },
      {
        question: "On es cobren els premis de la loteria de Nadal?",
        answer: "Els de menys de 2.000 € per dècim, a qualsevol punt de venda de SELAE; els de 2.000 € o més, només a BBVA i CaixaBank, amb el document d'identitat.",
      },
      {
        question: "Fins quan es pot cobrar la loteria de Nadal?",
        answer: "Tres mesos, comptats des de l'endemà del sorteig. Per al sorteig del 2025, el termini va acabar el 23 de març de 2026.",
      },
      {
        question: "Com sé si m'ha tocat la loteria de Nadal?",
        answer: "Amb el comprovador de la pàgina de la Loteria Nacional del web de SELAE o a la llista oficial de premis, que és l'única que val per cobrar.",
      },
      {
        question: "Quina diferència hi ha entre la loteria de Nadal i La Grossa de Cap d'Any?",
        answer: `La loteria de Nadal és de l'Estat, se sorteja el 22 de desembre i el dècim costa 20 €. La Grossa de Cap d'Any és de la Generalitat, se sorteja el 31 de desembre i el bitllet costa ${eur(GROSSA_TICKET, "ca")}.`,
      },
    ],
  },

  /* ------------------------------------------------------------------ es */
  es: {
    prizeNames: {
      first: "Primer premio (el Gordo)",
      second: "Segundo premio",
      third: "Tercer premio",
      fourth: "Cuartos premios",
      fifth: "Quintos premios",
      pedrea: "Pedrea",
      approxFirst: "Número anterior y posterior al Gordo",
      approxSecond: "Número anterior y posterior al segundo",
      approxThird: "Número anterior y posterior al tercero",
      hundreds: "Resto de la centena del 1.º, 2.º, 3.º y los dos 4.º",
      lastTwo: "Dos últimas cifras del 1.º, 2.º o 3.º",
      reintegro: "Reintegro (última cifra del Gordo)",
    },
    lead: (c) => {
      if (c.results) {
        const r = c.results;
        return `**El ${r.first} es el Gordo de la Lotería de Navidad 2026: 400.000 € por décimo de 20 €.** El segundo premio es el ${r.second} (125.000 € por décimo) y el tercero, el ${r.third} (50.000 €). Cuartos premios (20.000 €): ${join([...r.fourth], "es")}. Quintos premios (6.000 €): ${join([...r.fifth], "es")}. Más abajo, dónde se han vendido en Cataluña, según SELAE. Comprueba tu décimo en los ${link(r.source.url, "resultados oficiales de SELAE")}.`;
      }
      const time = c.time
        ? `El sorteo empezará a las ${c.time.time}, según ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.`
        : `La hora de 2026 aún no se ha anunciado (${c.checked}); en 2025, RTVE lo emitió en directo en La 1 desde las 8:00.`;
      return `**La Lotería de Navidad 2026 se sortea el ${c.dayNoYear} en el Teatro Real de Madrid, y el primer premio, el Gordo, es de 400.000 € por décimo de 20 €.** Es el sorteo extraordinario de la Lotería Nacional del Estado (SELAE): 205 series de 100.000 números, del 00000 al 99999, y 2.870 millones de euros en premios. ${time} El día del sorteo, aquí estarán los números premiados y los municipios de Cataluña donde se han vendido.`;
    },
    keyFactsTitle: "La Lotería de Navidad 2026, de un vistazo",
    keyFacts: (c) => [
      ...(c.results
        ? [
            { label: "Gordo 2026", value: `${c.results.first} (400.000 € por décimo)` },
            { label: "Segundo y tercer premios", value: `${c.results.second} (125.000 €) y ${c.results.third} (50.000 €)` },
            { label: "Cuartos premios", value: `${join([...c.results.fourth], "es")} (20.000 € por décimo)` },
            { label: "Quintos premios", value: `${join([...c.results.fifth], "es")} (6.000 € por décimo)` },
          ]
        : [
            { label: "Fecha del sorteo", value: `${cap(c.day)}, en el Teatro Real de Madrid` },
            { label: "Hora", value: c.time ? c.time.time : "Aún no anunciada (en 2025, RTVE lo emitía desde las 8:00)" },
            { label: "Primer premio (el Gordo)", value: "400.000 € por décimo; 4 millones por billete" },
            { label: "Otros premios grandes", value: "Segundo de 125.000 € por décimo, tercero de 50.000 €, dos cuartos de 20.000 € y ocho quintos de 6.000 €" },
          ]),
      { label: "Precio", value: "20 € el décimo; 200 € el billete de 10 décimos" },
      { label: "Emisión", value: "205 series de 100.000 números: 4.100 millones de euros, y el 70% (2.870 millones) en premios" },
      { label: "Compra por internet", value: "En la web y la app de SELAE, hasta las 23:45 del 21 de diciembre" },
      { label: "Plazo para cobrar", value: "Tres meses, contados desde el día siguiente al sorteo" },
      { label: "Impuestos", value: "El 20% de lo que pasa de 40.000 € por décimo" },
    ],
    data: (c) =>
      c.results
        ? "Los números premiados son los que publica SELAE, y para cobrar solo vale la lista oficial de premios. Los municipios de Cataluña son los que SELAE lista como puntos de venta de cada premio. El programa de premios y el calendario son de SELAE, y los impuestos, de la ley del IRPF."
        : `Todo sale de los documentos de SELAE (Loterías y Apuestas del Estado), que organiza el sorteo: el calendario y el programa de premios de 2026, su web y el dosier de prensa de 2025; de RTVE, que lo emite, y de la ley del IRPF. ${c.time ? "" : "La hora de 2026 aún no se ha publicado. "}Lo que pasó en 2024 y 2025 siempre lleva el año al lado.`,
    resultsHeading: (c) => (c.results ? "Números premiados de la Lotería de Navidad 2026" : "Resultados de la Lotería de Navidad 2026"),
    resultsPending: (c) => [
      `El sorteo es el ${c.day}. SELAE publica los números premiados en la ${link(U.lnac, "página de la Lotería Nacional")}, que tiene un comprobador, y la tarde del 22 la lista oficial de premios, la única que vale para cobrar (así lo hizo en 2025). Aquí pondremos el Gordo y el resto de premios grandes en cuanto salgan.`,
      `**Resultados de 2025**, como referencia: el Gordo fue el ${R25.first}; el segundo premio, el ${R25.second}; el tercero, el ${R25.third}; los cuartos, ${join(R25.fourth.map((n) => `el ${n}`), "es")}, y los ocho quintos, el ${join([...R25.fifth], "es")}, según la ${link(U.list2025, "lista oficial de SELAE")}. El reintegro fue el 2.`,
    ],
    resultsTable: {
      caption: "Premios mayores de la Lotería de Navidad 2026",
      headers: ["Premio", "Número", "Por décimo (20 €)", "Por billete (200 €)"],
      note: "Fuente: SELAE. Para cobrar solo vale la lista oficial de premios.",
      fourth: "Cuarto premio",
      fifth: "Quinto premio",
    },
    resultsAfter: (r) => {
      const n = neighbours(r.first);
      return [
        `**Con el Gordo también cobran:** ${n ? `el ${n[0]} y el ${n[1]}, el número anterior y el posterior (${D("approxFirst", "es")} por décimo)` : `el número anterior y el posterior (${D("approxFirst", "es")} por décimo)`}; el resto de la centena, del ${r.first.slice(0, 3)}00 al ${r.first.slice(0, 3)}99 (${D("hundreds", "es")}); todos los terminados en ${r.first.slice(3)} (${D("lastTwo", "es")}), y todos los terminados en ${r.first.slice(4)}, el reintegro (${D("reintegro", "es")}). Los premios se acumulan: un décimo puede cobrar más de uno.`,
        `La pedrea, los 1.794 números que cobran ${D("pedrea", "es")} por décimo, está en la lista oficial. Comprueba tu décimo en los ${link(r.source.url, "resultados de SELAE")} o en un punto de venta, y mira más abajo dónde se cobra cada premio y cuántos impuestos paga.`,
      ];
    },
    cataloniaHeading: "¿Dónde ha tocado la Lotería de Navidad en Cataluña?",
    soldLine: (category, number, sales) => {
      const name = { first: `**El Gordo (${number})**`, second: `**El segundo premio (${number})**`, third: `**El tercer premio (${number})**`, fourth: `**Los cuartos premios (${number})**` }[category];
      if (sales === null) return `${name}: SELAE aún no ha publicado dónde se ha vendido.`;
      if (sales.length === 0) return `${name}: SELAE no lista ningún punto de venta en Cataluña.`;
      return `${name}: ${townsLine(sales, "es")}.${category === "fourth" ? " SELAE no dice cuál de los dos vendió cada punto." : ""}`;
    },
    cataloniaPending: [
      "En cuanto SELAE publique dónde se han vendido los premios grandes, aquí estarán los municipios de Cataluña que han vendido el Gordo, el segundo y el tercer premio.",
      `**En 2025**, según las listas de puntos de venta de SELAE, ni el ${link(U.first2025, `Gordo (${R25.first})`)} ni el ${link(U.second2025, `segundo premio (${R25.second})`)} se vendieron en Cataluña: el primero, en La Pola de Gordón, Villablino y La Bañeza (León) y en Madrid, y el segundo, solo en Madrid. El ${link(U.third2025, `tercer premio (${R25.third})`)} sí: ${townsLine(SOLD25.third, "es")}. Los ${link(U.fourth2025, `dos cuartos premios (${join([...R25.fourth], "es")})`)} se vendieron en ${townsLine(SOLD25.fourth, "es")}, entre otros lugares; SELAE no dice cuál de los dos vendió cada punto.`,
    ],
    cataloniaAlways: [
      `**Cuánto se juega en Cataluña.** En 2024 se vendieron en Cataluña 423.498.540 € de Lotería de Navidad, 53,55 € por habitante, por debajo de la media española (73,00 €), según el ${link(U.dossier2025, "dosier de SELAE de 2025")}. De las cuatro provincias, Lleida es la que más juega: 108,44 € por habitante, por delante de Tarragona (51,76 €), Barcelona (50,69 €) y Girona (45,62 €).`,
      "**Un sorteo en Barcelona.** En 1938, en plena Guerra Civil, se celebraron dos sorteos de Navidad el 22 de diciembre, uno en Barcelona y otro en Burgos, recuerda SELAE.",
    ],
    whenHeading: "¿Cuándo es el sorteo de la Lotería de Navidad 2026, a qué hora y dónde verlo?",
    when: (c) => [
      c.results
        ? `El sorteo se celebró el **${c.day}** en el Teatro Real de Madrid, según el ${link(U.calendar, "calendario de sorteos de SELAE")}.${c.time ? ` Empezó a las ${c.time.time}, según ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.` : ""} Los números premiados están en la tabla de resultados, al principio de esta página.`
        : `El sorteo es el **${c.day}** en el Teatro Real de Madrid, según el ${link(U.calendar, "calendario de sorteos de SELAE")}. ${
            c.time
              ? `Empezará a las ${c.time.time}, según ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.`
              : `SELAE aún no ha anunciado la hora (${c.checked}). En 2025, según el ${link(U.dossier2025, "dosier de prensa de SELAE")}, la mesa que preside el sorteo se constituía a las 8:30, y SELAE preveía una duración de unas cuatro horas.`
          }`,
      `**Dónde verlo.** En 2025, ${link(U.tv2025, "según RTVE")}, el sorteo se emitió en directo en La 1, TVE Internacional y RTVE Play a partir de las 8:00, y Radio Nacional le dedicó un especial de 8:30 a 13:30. Ese año RTVE produjo la señal y la cedió gratis a todos los medios.`,
      `**¿Hasta cuándo se puede comprar?** En la web y la app de SELAE, hasta las 23:45 del lunes 21 de diciembre, la noche antes del sorteo, según la ${link(U.nowOn, "cuenta atrás de SELAE")}. El 22 de diciembre de 2026 es martes y laborable en Cataluña (${b2link("holidayToday", "es", "¿es festivo hoy?")}).`,
    ],
    drawHeading: "Cómo es el sorteo: dos bombos y los niños de San Ildefonso",
    draw: [
      "Es un sorteo por el sistema tradicional, con dos bombos: el grande tiene las 100.000 bolas de los números y el pequeño, una bola por cada premio que sale del bombo, 1.807 en 2025. Un niño o una niña de la Residencia de San Ildefonso de Madrid saca una bola del bombo de los números y otro, a la vez, una del de los premios, y otros dos las cantan.",
      `Según SELAE, el canto puede tener errores y por eso se revisa varias veces; el único resultado válido para cobrar es el de la lista oficial de premios, que en 2025 se repartió la tarde del 22 de diciembre a los puntos de venta y a los medios y se publicó en la web de SELAE (${link(U.dossier2025, "dosier de 2025")}).`,
    ],
    prizesHeading: "Premios de la Lotería de Navidad 2026",
    prizesIntro: `SELAE pone en juego 205 series de 100.000 números, siete más que en 2025, por un total de 4.100 millones de euros; el 70%, 2.870 millones, va a premios. Cada número tiene 205 billetes, uno por serie, y cada billete de 200 € se divide en 10 décimos de 20 €. El ${link(U.programme, "programa de premios de SELAE")} da los importes por billete; un décimo cobra la décima parte:`,
    prizeTable: {
      caption: "Premios de la Lotería de Navidad 2026 (programa de SELAE del 26 de enero de 2026)",
      headers: ["Premio", "Cuántos hay en cada serie", "Por billete (200 €)", "Por décimo (20 €)"],
      note: "Cada serie reparte 15.304 premios y 14 millones de euros. Los premios se acumulan.",
    },
    prizesAfter: [
      `**La pedrea** son los 1.794 premios de ${D("pedrea", "es")} por décimo que salen del bombo, además de los grandes. **El reintegro**: todos los décimos terminados en la misma cifra que el Gordo recuperan los 20 €, salvo el del propio Gordo, según la lista oficial de 2025.`,
      `Los premios se acumulan: un décimo terminado en las dos últimas cifras del Gordo también termina en su última cifra, y cobra ${D("lastTwo", "es")} más ${D("reintegro", "es")} de reintegro, ${eur(perDecimo("lastTwo") + perDecimo("reintegro"), "es")} (en el ${link(U.dossier2025, "dosier de 2025")}, SELAE lo contaba como 6 € por euro jugado).`,
    ],
    buyHeading: "Dónde comprar la Lotería de Navidad: solo en los canales oficiales",
    buy: [
      `**En los puntos de venta de SELAE:** administraciones de lotería y establecimientos de la red comercial de Loterías y Apuestas del Estado, casi 11.000 en toda España, según ${link(U.collect, "SELAE")}.`,
      `**En la web y la app de SELAE** (${link(U.play, "loteriasyapuestas.es")}): puedes elegir el número o dejar que lo elija el sistema, y comprar de 1 a 10 décimos de una vez. Son décimos virtuales, sin papel, que juegan en las mismas condiciones que los de papel; el premio se ingresa sin tener que presentar nada.`,
    ],
    buyAfter: `SELAE recuerda que los menores de 18 años no pueden participar en sus juegos, ni en los puntos de venta ni por internet (${link(U.minors, "Ley 13/2011 del juego")}).`,
    checkHeading: "Cómo comprobar si te ha tocado la Lotería de Navidad",
    check: [
      `**En la web de SELAE:** la ${link(U.lnac, "página de la Lotería Nacional")} tiene un comprobador de números.`,
      "**En la lista oficial de premios:** es la única que vale para cobrar, y en 2025 SELAE la colgó en su web la misma tarde del sorteo. Ahí están la pedrea, las aproximaciones (marcadas con una a), las centenas (c) y las terminaciones (t).",
      `**Si lo compraste por internet,** SELAE te avisa por correo electrónico y SMS, y los premios de menos de 2.000 € se ingresan solos en el monedero de tu cuenta (${link(U.online, "SELAE")}).`,
    ],
    claimHeading: "Dónde se cobran los premios de la Lotería de Navidad",
    claim: [
      "**Menos de 2.000 € por décimo:** en cualquier punto de venta de SELAE. En 2025 se podían cobrar en efectivo o por Bizum.",
      "**2.000 € o más:** solo en las oficinas de BBVA y de CaixaBank. No hace falta ser cliente, no se paga comisión y hay que llevar el documento de identidad original y en vigor; SELAE recomienda pedir cita previa.",
      "**Décimo compartido:** para cobrar 2.000 € o más tienen que ir todos los titulares a identificarse, o un representante con poderes otorgados ante notario.",
      "**Comprado por internet:** menos de 2.000 €, en el monedero automáticamente (si supera el saldo máximo de 400 €, en tu cuenta bancaria); 2.000 € o más, por transferencia, tras verificar la cuenta.",
    ],
    claimAfter: [
      `**Cuándo:** en 2025, SELAE empezó a pagar la tarde del mismo 22 de diciembre, al terminar las verificaciones. **Plazo:** el derecho a cobrar caduca a los tres meses contados desde el día siguiente al sorteo, según la ${link(U.list2025, "lista oficial")}; para el sorteo de 2025, el último día fue el 23 de marzo de 2026.`,
      "Si el décimo premiado está estropeado, hay que llevarlo a un punto de venta con el formulario de solicitud de pago de premios, y SELAE lo autentica. Si te lo han robado, SELAE recomienda denunciarlo.",
    ],
    taxHeading: "¿Cuántos impuestos paga la Lotería de Navidad?",
    taxIntro: `Los premios de hasta 40.000 € por décimo no pagan. De lo que pasa de 40.000 €, Hacienda se queda el 20%: es el gravamen especial sobre los premios de loterías de la ${link(U.irpf, "ley del IRPF (disposición adicional 33.ª)")}, y se retiene al cobrar, según ${link(U.tax, "SELAE")}. Por décimo de 20 €:`,
    taxTable: {
      caption: "Gravamen sobre un décimo de 20 € premiado",
      headers: ["Premio del décimo", "Gravamen (20% de lo que pasa de 40.000 €)", "Cobras"],
      rows: [
        [`${D("first", "es")} (Gordo)`, eur(levy(perDecimo("first")), "es"), eur(NET_FIRST, "es")],
        [`${D("second", "es")} (segundo premio)`, eur(levy(perDecimo("second")), "es"), eur(NET_SECOND, "es")],
        [`${D("third", "es")} (tercer premio)`, eur(levy(perDecimo("third")), "es"), eur(NET_THIRD, "es")],
        [`${D("fourth", "es")} (cuarto premio) o menos`, "0 €", "Todo el premio"],
      ],
    },
    taxAfter: [
      `El gravamen se calcula por décimo. Si un décimo es de varias personas, los ${eur(LEVY_EXEMPT, "es")} exentos se reparten según la parte de cada una. Las personas que no residen en España tienen el mismo gravamen y la misma exención, según la ${link(U.aeatNonResidents, "Agencia Tributaria")}.`,
    ],
    grossaHeading: "Lotería de Navidad, La Grossa de Cap d'Any y El Niño",
    grossa: [
      `La Lotería de Navidad es del Estado (SELAE) y se sortea en Madrid. En Cataluña, nueve días después, está ${b2link("grossa", "es", "La Grossa de Cap d'Any")}, la lotería de la Generalitat: se celebra el ${dayDate(GROSSA_DRAW_DATE, "es")}, el billete cuesta ${eur(GROSSA_TICKET, "es")} y el primer premio es de ${eur(GROSSA_PRIZES.first.five, "es")} por billete. Los billetes de una no valen para la otra.`,
      `Después llega el sorteo extraordinario de El Niño de SELAE, el miércoles 6 de enero de 2027, con 2 millones de euros por serie al primer premio y décimos de 20 €, según la ${link(U.lnac, "página de la Lotería Nacional")}. Para el resto de las fiestas, mira ${b2link("christmasBarcelona", "es", "Navidad en Barcelona")} y ${b2link("newYear", "es", "Nochevieja en Barcelona")}.`,
    ],
    responsibleTitle: "Juego responsable",
    responsible: "Juega solo si eres mayor de edad y con un presupuesto cerrado. SELAE tiene un teléfono de atención al cliente, el 900 11 23 13.",
    faq: (c) => [
      {
        question: "¿Cuándo es el sorteo de la Lotería de Navidad 2026?",
        answer: c.results
          ? `Se celebró el ${c.day} en el Teatro Real de Madrid${c.time ? `, a las ${c.time.time}` : ""}.`
          : `El ${c.day}, en el Teatro Real de Madrid. ${c.time ? `Empieza a las ${c.time.time}.` : "La hora de 2026 aún no se ha anunciado; en 2025, RTVE lo emitía en La 1 desde las 8:00."}`,
      },
      {
        question: "¿Dónde ha tocado el Gordo en Cataluña?",
        answer: c.results
          ? (["first", "second", "third"] as const).map((k) => COPY.es.soldLine(k, c.results![k], c.results!.soldInCatalonia[k])).join(" ")
          : `El sorteo es el 22 de diciembre de 2026, y aquí pondremos los municipios en cuanto SELAE los publique. En 2025, ni el Gordo ni el segundo premio se vendieron en Cataluña; el tercer premio, sí: ${townsLine(SOLD25.third, "es")}.`,
      },
      {
        question: "¿Cuál es el número del Gordo de la Lotería de Navidad 2026?",
        answer: c.results
          ? `El ${c.results.first}. El segundo premio es el ${c.results.second} y el tercero, el ${c.results.third}.`
          : `Se sabrá el ${c.day}. En 2025 el Gordo fue el ${R25.first}.`,
      },
      {
        question: "¿Cuánto se cobra por el Gordo de Navidad?",
        answer: `${D("first", "es")} por décimo de 20 €, 4 millones por billete. Hacienda retiene ${eur(levy(perDecimo("first")), "es")}: por décimo cobras ${eur(NET_FIRST, "es")}.`,
      },
      { question: "¿Cuánto cuesta un décimo de Lotería de Navidad?", answer: "20 €. El billete entero, de 10 décimos, cuesta 200." },
      {
        question: "¿Cuánto paga a Hacienda la Lotería de Navidad?",
        answer: `Nada hasta 40.000 € por décimo; de lo que pasa, el 20%, que se retiene al cobrar. El segundo premio (${D("second", "es")}) paga ${eur(levy(perDecimo("second")), "es")} y el tercero (${D("third", "es")}), ${eur(levy(perDecimo("third")), "es")}.`,
      },
      {
        question: "¿Dónde se cobran los premios de la Lotería de Navidad?",
        answer: "Los de menos de 2.000 € por décimo, en cualquier punto de venta de SELAE; los de 2.000 € o más, solo en BBVA y CaixaBank, con el documento de identidad.",
      },
      {
        question: "¿Hasta cuándo se puede cobrar la Lotería de Navidad?",
        answer: "Tres meses, contados desde el día siguiente al sorteo. Para el sorteo de 2025, el plazo terminó el 23 de marzo de 2026.",
      },
      {
        question: "¿Cómo sé si me ha tocado la Lotería de Navidad?",
        answer: "Con el comprobador de la página de la Lotería Nacional de la web de SELAE o en la lista oficial de premios, que es la única que vale para cobrar.",
      },
      {
        question: "¿En qué se diferencia la Lotería de Navidad de La Grossa de Cap d'Any?",
        answer: `La Lotería de Navidad es del Estado, se sortea el 22 de diciembre y el décimo cuesta 20 €. La Grossa de Cap d'Any es de la Generalitat, se sortea el 31 de diciembre y el billete cuesta ${eur(GROSSA_TICKET, "es")}.`,
      },
    ],
  },

  /* ------------------------------------------------------------------ en */
  en: {
    prizeNames: {
      first: "First prize (El Gordo)",
      second: "Second prize",
      third: "Third prize",
      fourth: "Fourth prizes",
      fifth: "Fifth prizes",
      pedrea: "Pedrea",
      approxFirst: "Numbers just before and after El Gordo",
      approxSecond: "Numbers just before and after the second",
      approxThird: "Numbers just before and after the third",
      hundreds: "Rest of the hundred of the 1st, 2nd, 3rd and both 4ths",
      lastTwo: "Last two digits of the 1st, 2nd or 3rd",
      reintegro: "Money back (last digit of El Gordo)",
    },
    lead: (c) => {
      if (c.results) {
        const r = c.results;
        return `**${r.first} is El Gordo of the 2026 Spanish Christmas Lottery: €400,000 per €20 décimo.** The second prize is ${r.second} (€125,000 per décimo) and the third ${r.third} (€50,000). Fourth prizes (€20,000): ${join([...r.fourth], "en")}. Fifth prizes (€6,000): ${join([...r.fifth], "en")}. Below: where they were sold in Catalonia, according to SELAE. Check your décimo against the ${link(r.source.url, "official SELAE results")}.`;
      }
      const time = c.time
        ? `The draw starts at ${c.time.time}, according to ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.`
        : `The 2026 start time has not been announced yet (${c.checked}); in 2025 RTVE broadcast it live on La 1 from 8:00.`;
      return `**The Spanish Christmas Lottery 2026 is drawn on ${c.dayNoYear} at the Teatro Real in Madrid, and the first prize, El Gordo, is €400,000 per €20 décimo.** It is the Spanish state lottery's (SELAE's) Christmas draw: 205 series of 100,000 numbers, from 00000 to 99999, and €2.87 billion in prizes. ${time} On draw day, the winning numbers and the Catalan towns that sold them will be here.`;
    },
    keyFactsTitle: "The Spanish Christmas Lottery 2026 at a glance",
    keyFacts: (c) => [
      ...(c.results
        ? [
            { label: "2026 El Gordo", value: `${c.results.first} (€400,000 per décimo)` },
            { label: "Second and third prizes", value: `${c.results.second} (€125,000) and ${c.results.third} (€50,000)` },
            { label: "Fourth prizes", value: `${join([...c.results.fourth], "en")} (€20,000 per décimo)` },
            { label: "Fifth prizes", value: `${join([...c.results.fifth], "en")} (€6,000 per décimo)` },
          ]
        : [
            { label: "Draw date", value: `${c.day}, Teatro Real, Madrid` },
            { label: "Time", value: c.time ? c.time.time : "Not announced yet (in 2025 RTVE broadcast from 8:00)" },
            { label: "First prize (El Gordo)", value: "€400,000 per décimo; €4 million per full ticket" },
            { label: "Other big prizes", value: "Second €125,000 per décimo, third €50,000, two fourth prizes of €20,000 and eight fifth prizes of €6,000" },
          ]),
      { label: "Price", value: "€20 a décimo (one tenth); €200 a full ticket (billete) of 10 décimos" },
      { label: "Issue", value: "205 series of 100,000 numbers: €4.1 billion, with 70% (€2.87 billion) paid out in prizes" },
      { label: "Buying online", value: "On SELAE's website and app, until 23:45 on 21 December" },
      { label: "Deadline to claim", value: "Three months, counted from the day after the draw" },
      { label: "Tax", value: "20% of anything above €40,000 per décimo" },
    ],
    data: (c) =>
      c.results
        ? "The winning numbers are those published by SELAE, and only the official prize list counts for payment. The Catalan towns are those SELAE lists as points of sale for each prize. The prize programme and calendar are SELAE's; the tax comes from Spain's income tax law."
        : `Everything here comes from documents published by SELAE (Loterías y Apuestas del Estado, the state lottery operator that runs the draw): its 2026 calendar and prize programme, its website and its 2025 press dossier; from RTVE, which broadcasts the draw; and from Spain's income tax law. ${c.time ? "" : "The 2026 start time has not been published yet. "}Whatever happened in 2024 and 2025 always carries its year.`,
    resultsHeading: (c) => (c.results ? "Spanish Christmas Lottery 2026 winning numbers" : "Spanish Christmas Lottery 2026 results"),
    resultsPending: (c) => [
      `The draw is on ${c.day}. SELAE publishes the winning numbers on its ${link(U.lnac, "Lotería Nacional page")}, which has a number checker, and the official prize list, the only one that counts for payment, on the afternoon of the 22nd (as it did in 2025). We will add El Gordo and the other big prizes here as soon as they are out.`,
      `**The 2025 results**, for reference: El Gordo was ${R25.first}; second ${R25.second}; third ${R25.third}; the fourth prizes ${join([...R25.fourth], "en")}; and the eight fifth prizes ${join([...R25.fifth], "en")}, according to the ${link(U.list2025, "official SELAE list")}. The money-back digit (reintegro) was 2.`,
    ],
    resultsTable: {
      caption: "Spanish Christmas Lottery 2026: the big prizes",
      headers: ["Prize", "Number", "Per décimo (€20)", "Per full ticket (€200)"],
      note: "Source: SELAE. Only the official prize list counts for payment.",
      fourth: "Fourth prize",
      fifth: "Fifth prize",
    },
    resultsAfter: (r) => {
      const n = neighbours(r.first);
      return [
        `**El Gordo also pays out on:** ${n ? `${n[0]} and ${n[1]}, the numbers just before and after (${D("approxFirst", "en")} per décimo)` : `the numbers just before and after (${D("approxFirst", "en")} per décimo)`}; the rest of its hundred, ${r.first.slice(0, 3)}00 to ${r.first.slice(0, 3)}99 (${D("hundreds", "en")}); every number ending in ${r.first.slice(3)} (${D("lastTwo", "en")}); and every number ending in ${r.first.slice(4)}, the money back (${D("reintegro", "en")}). Prizes add up: one décimo can win more than one.`,
        `The pedrea, the 1,794 numbers that win ${D("pedrea", "en")} per décimo, is on the official list. Check your décimo on the ${link(r.source.url, "SELAE results")} or at an outlet, and see below where each prize is paid and how it is taxed.`,
      ];
    },
    cataloniaHeading: "Where did the Christmas Lottery prizes fall in Catalonia?",
    soldLine: (category, number, sales) => {
      const name = { first: `**El Gordo (${number})**`, second: `**The second prize (${number})**`, third: `**The third prize (${number})**`, fourth: `**The fourth prizes (${number})**` }[category];
      if (sales === null) return `${name}: SELAE has not yet published where it was sold.`;
      if (sales.length === 0) return `${name}: SELAE lists no point of sale in Catalonia.`;
      return `${name}: ${townsLine(sales, "en")}.${category === "fourth" ? " SELAE does not say which of the two each outlet sold." : ""}`;
    },
    cataloniaPending: [
      "As soon as SELAE publishes where the big prizes were sold, the Catalan towns that sold El Gordo, the second and the third prize will be listed here.",
      `**In 2025**, according to SELAE's lists of points of sale, neither ${link(U.first2025, `El Gordo (${R25.first})`)} nor the ${link(U.second2025, `second prize (${R25.second})`)} was sold in Catalonia: the first went to La Pola de Gordón, Villablino and La Bañeza (León) and to Madrid, the second to Madrid only. The ${link(U.third2025, `third prize (${R25.third})`)} did reach Catalonia: ${townsLine(SOLD25.third, "en")}. The ${link(U.fourth2025, `two fourth prizes (${join([...R25.fourth], "en")})`)} were sold in ${townsLine(SOLD25.fourth, "en")}, among other places; SELAE does not say which of the two each outlet sold.`,
    ],
    cataloniaAlways: [
      `**How much Catalonia plays.** In 2024 Catalonia bought €423,498,540 of Christmas Lottery tickets, €53.55 per inhabitant, below the Spanish average of €73.00, according to ${link(U.dossier2025, "SELAE's 2025 dossier")}. Of the four provinces, Lleida plays the most: €108.44 per inhabitant, ahead of Tarragona (€51.76), Barcelona (€50.69) and Girona (€45.62).`,
      "**A draw in Barcelona.** In 1938, in the middle of the Civil War, two Christmas draws were held on 22 December, one in Barcelona and one in Burgos, SELAE recalls.",
    ],
    whenHeading: "When is the Spanish Christmas Lottery 2026 draw, at what time, and where can you watch it?",
    when: (c) => [
      c.results
        ? `The draw took place on **${c.day}** at the Teatro Real in Madrid, as set in ${link(U.calendar, "SELAE's draw calendar")}.${c.time ? ` It began at ${c.time.time}, according to ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.` : ""} The winning numbers are in the results table at the top of this page.`
        : `The draw is on **${c.day}** at the Teatro Real in Madrid, according to ${link(U.calendar, "SELAE's draw calendar")}. ${
            c.time
              ? `It starts at ${c.time.time}, according to ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.`
              : `SELAE has not announced the time yet (${c.checked}). In 2025, according to ${link(U.dossier2025, "SELAE's press dossier")}, the presiding table was constituted at 8:30, and SELAE expected the draw to last about four hours.`
          }`,
      `**Where to watch.** In 2025, ${link(U.tv2025, "according to RTVE")}, the draw went out live on La 1, TVE Internacional and RTVE Play from 8:00, and Radio Nacional ran a special from 8:30 to 13:30. That year RTVE produced the feed and gave it free to every broadcaster.`,
      `**Until when can you buy?** On SELAE's website and app, until 23:45 on Monday 21 December, the night before the draw, according to ${link(U.nowOn, "SELAE's countdown")}. Tuesday 22 December 2026 is a normal working day in Catalonia (${b2link("holidayToday", "en", "is today a holiday?")}).`,
    ],
    drawHeading: "How the draw works: two drums and the San Ildefonso children",
    draw: [
      "It is a traditional draw with two drums: the big one holds the 100,000 number balls and the small one a ball for each prize drawn from the drum, 1,807 in 2025. One child from the San Ildefonso residence in Madrid takes a ball from the numbers drum while another takes one from the prizes drum, and two more children sing them out.",
      `SELAE says the singing can contain mistakes, which is why it is checked several times; the only result valid for payment is the official prize list, which in 2025 went out to outlets and the media on the afternoon of 22 December and was posted on SELAE's website (${link(U.dossier2025, "2025 dossier")}).`,
    ],
    prizesHeading: "Spanish Christmas Lottery 2026 prizes",
    prizesIntro: `SELAE issues 205 series of 100,000 numbers, seven more than in 2025, worth €4.1 billion in all; 70%, €2.87 billion, goes to prizes. Each number has 205 full tickets (billetes), one per series, and each €200 billete is split into ten €20 décimos. ${link(U.programme, "SELAE's prize programme")} gives the amounts per billete; a décimo wins a tenth:`,
    prizeTable: {
      caption: "Spanish Christmas Lottery 2026 prizes (SELAE programme of 26 January 2026)",
      headers: ["Prize", "How many in each series", "Per billete (€200)", "Per décimo (€20)"],
      note: "Each series pays 15,304 prizes worth €14 million. Prizes add up.",
    },
    prizesAfter: [
      `**The pedrea** is the 1,794 prizes of ${D("pedrea", "en")} per décimo drawn alongside the big ones. **The money back (reintegro):** every décimo ending in the same digit as El Gordo gets its €20 back, except El Gordo itself, according to the official 2025 list.`,
      `Prizes add up: a décimo ending in El Gordo's last two digits also ends in its last digit, so it wins ${D("lastTwo", "en")} plus ${D("reintegro", "en")} money back, ${eur(perDecimo("lastTwo") + perDecimo("reintegro"), "en")} (in its ${link(U.dossier2025, "2025 dossier")}, SELAE put it as €6 per euro played).`,
    ],
    buyHeading: "Where to buy Christmas Lottery tickets: official channels only",
    buy: [
      `**SELAE outlets:** lottery shops (administraciones) and other shops in the state lottery's retail network, almost 11,000 across Spain, according to ${link(U.collect, "SELAE")}.`,
      `**SELAE's website and app** (${link(U.play, "loteriasyapuestas.es")}): choose a number or let the system pick one, and buy 1 to 10 décimos at a time. These are virtual décimos, with no paper, that play under the same conditions as paper ones; prizes are paid in without presenting anything.`,
    ],
    buyAfter: `SELAE points out that under-18s may not take part in its games, at outlets or online (${link(U.minors, "Gaming Act 13/2011")}).`,
    checkHeading: "How to check your Christmas Lottery décimo",
    check: [
      `**On SELAE's website:** the ${link(U.lnac, "Lotería Nacional page")} has a number checker.`,
      "**On the official prize list:** the only one that counts for payment; in 2025 SELAE posted it on its website on the afternoon of the draw. It includes the pedrea, the numbers next to the big prizes (marked a), the hundreds (c) and the endings (t).",
      `**If you bought online,** SELAE tells you by email and SMS, and prizes under €2,000 are paid into your account's wallet automatically (${link(U.online, "SELAE")}).`,
    ],
    claimHeading: "Where to collect a Christmas Lottery prize",
    claim: [
      "**Under €2,000 per décimo:** at any SELAE outlet. In 2025 they could be paid in cash or by Bizum.",
      "**€2,000 or more:** only at BBVA and CaixaBank branches. You do not need to be a customer, there is no fee, and you must bring a valid original ID; SELAE recommends booking an appointment.",
      "**Shared décimo:** to collect €2,000 or more, every holder must go to identify themselves, or appoint a representative with powers granted before a notary.",
      "**Bought online:** under €2,000, into your wallet automatically (anything above the €400 maximum balance goes to your bank account); €2,000 or more, by bank transfer once the account is verified.",
    ],
    claimAfter: [
      `**When:** in 2025 SELAE began paying on the afternoon of 22 December itself, once the checks were complete. **Deadline:** the right to collect expires three months after the day following the draw, according to the ${link(U.list2025, "official list")}; for the 2025 draw, the last day was 23 March 2026.`,
      "If a winning décimo is damaged, take it to an outlet with the prize payment request form and SELAE will authenticate it. If it was stolen, SELAE recommends reporting it to the authorities.",
    ],
    taxHeading: "How is the Spanish Christmas Lottery taxed?",
    taxIntro: `Prizes of up to €40,000 per décimo are tax-free. Of anything above €40,000, the tax office keeps 20%: this is the special levy on lottery prizes in ${link(U.irpf, "Spain's income tax law (additional provision 33)")}, withheld when you collect, according to ${link(U.tax, "SELAE")}. Per €20 décimo:`,
    taxTable: {
      caption: "Levy on a winning €20 décimo",
      headers: ["Décimo prize", "Levy (20% of the part above €40,000)", "You receive"],
      rows: [
        [`${D("first", "en")} (El Gordo)`, eur(levy(perDecimo("first")), "en"), eur(NET_FIRST, "en")],
        [`${D("second", "en")} (second prize)`, eur(levy(perDecimo("second")), "en"), eur(NET_SECOND, "en")],
        [`${D("third", "en")} (third prize)`, eur(levy(perDecimo("third")), "en"), eur(NET_THIRD, "en")],
        [`${D("fourth", "en")} (fourth prize) or less`, "€0", "The whole prize"],
      ],
    },
    taxAfter: [
      `The levy is worked out per décimo. If a décimo belongs to several people, the ${eur(LEVY_EXEMPT, "en")} exemption is split according to each one's share. People who are not resident in Spain pay the same levy with the same exemption, according to the ${link(U.aeatNonResidents, "Agencia Tributaria")} (Spain's tax agency).`,
    ],
    grossaHeading: "Christmas Lottery, La Grossa de Cap d'Any and El Niño",
    grossa: [
      `The Christmas Lottery is the Spanish state's (SELAE's) and is drawn in Madrid. In Catalonia, nine days later, comes ${b2link("grossa", "en", "La Grossa de Cap d'Any")}, the Catalan government's lottery: it is drawn on ${dayDate(GROSSA_DRAW_DATE, "en")}, a ticket costs ${eur(GROSSA_TICKET, "en")} and the first prize is ${eur(GROSSA_PRIZES.first.five, "en")} per ticket. Tickets for one are no good for the other.`,
      `Then comes SELAE's El Niño draw on Wednesday 6 January 2027, with €2 million per series for the first prize and €20 décimos, according to the ${link(U.lnac, "Lotería Nacional page")}. For the rest of the holidays, see ${b2link("christmasBarcelona", "en", "Christmas in Barcelona")} and ${b2link("newYear", "en", "New Year's Eve in Barcelona")}.`,
    ],
    responsibleTitle: "Play responsibly",
    responsible: "Only play if you are 18 or over, and set a budget first. SELAE has a customer helpline on 900 11 23 13.",
    faq: (c) => [
      {
        question: "When is the Spanish Christmas Lottery draw in 2026?",
        answer: c.results
          ? `It took place on ${c.day} at the Teatro Real in Madrid${c.time ? `, starting at ${c.time.time}` : ""}.`
          : `On ${c.day}, at the Teatro Real in Madrid. ${c.time ? `It starts at ${c.time.time}.` : "The 2026 start time has not been announced yet; in 2025 RTVE broadcast it on La 1 from 8:00."}`,
      },
      {
        question: "Where did El Gordo fall in Catalonia?",
        answer: c.results
          ? (["first", "second", "third"] as const).map((k) => COPY.en.soldLine(k, c.results![k], c.results!.soldInCatalonia[k])).join(" ")
          : `The draw is on 22 December 2026, and the towns will be listed here as soon as SELAE publishes them. In 2025 neither El Gordo nor the second prize was sold in Catalonia; the third prize was: ${townsLine(SOLD25.third, "en")}.`,
      },
      {
        question: "What is the 2026 El Gordo number?",
        answer: c.results
          ? `${c.results.first}. The second prize is ${c.results.second} and the third ${c.results.third}.`
          : `It will be known on ${c.day}. In 2025 El Gordo was ${R25.first}.`,
      },
      {
        question: "How much does El Gordo pay?",
        answer: `${D("first", "en")} per €20 décimo, €4 million per full ticket. The tax office withholds ${eur(levy(perDecimo("first")), "en")}, so a décimo pays ${eur(NET_FIRST, "en")}.`,
      },
      { question: "How much is a Spanish Christmas Lottery ticket?", answer: "€20 for a décimo (one tenth of a ticket). A full ticket (billete) of ten décimos costs €200." },
      {
        question: "Is the Spanish Christmas Lottery taxed?",
        answer: `Nothing up to €40,000 per décimo; 20% of anything above, withheld when you collect. The second prize (${D("second", "en")}) pays ${eur(levy(perDecimo("second")), "en")} and the third (${D("third", "en")}) ${eur(levy(perDecimo("third")), "en")}.`,
      },
      {
        question: "Where do I collect a Christmas Lottery prize?",
        answer: "Under €2,000 per décimo, at any SELAE outlet; €2,000 or more, only at BBVA and CaixaBank, with your ID.",
      },
      {
        question: "How long do I have to claim a Christmas Lottery prize?",
        answer: "Three months, counted from the day after the draw. For the 2025 draw, the deadline was 23 March 2026.",
      },
      {
        question: "How do I check my décimo?",
        answer: "With the checker on the Lotería Nacional page of SELAE's website, or on the official prize list, the only one that counts for payment.",
      },
      {
        question: "Do non-residents pay the same tax?",
        answer: "Yes. According to Spain's tax agency, people not resident in Spain pay the same 20% levy on prizes above €40,000 per décimo.",
      },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["grossa", "christmasBarcelona", "newYear", "christmasTraditions", "decemberBridge", "holidayToday"] as const;

function heading(level: 2 | 3, text: string, id?: string): Block {
  return { type: "heading", level, text, ...(id ? { id } : {}) } as Block;
}

function resultsRows(r: NadalResults, locale: Locale): string[][] {
  const t = COPY[locale];
  const row = (name: string, number: string, key: PrizeKey) => [name, `**${number}**`, D(key, locale), B(key, locale)];
  return [
    row(t.prizeNames.first, r.first, "first"),
    row(t.prizeNames.second, r.second, "second"),
    row(t.prizeNames.third, r.third, "third"),
    ...r.fourth.map((number) => row(t.resultsTable.fourth, number, "fourth")),
    ...r.fifth.map((number) => row(t.resultsTable.fifth, number, "fifth")),
  ];
}

function programmeRows(locale: Locale): string[][] {
  const t = COPY[locale];
  const count = (n: number) => String(n).replace(/(\d)(?=(\d{3})+$)/g, `$1${locale === "en" ? "," : "."}`);
  return PROGRAMME.map((row) => [t.prizeNames[row.key], count(row.count), eur(row.perBillete, locale), eur(row.perBillete / 10, locale)]);
}

export function buildNadalBody(
  locale: Locale,
  results: NadalResults | null = RESULTS_2026,
  time: DrawTime | null = DRAW_TIME_2026,
  asOf: string = NADAL_AS_OF,
): Block[] {
  const t = COPY[locale];
  const c: Ctx = {
    locale,
    results,
    time,
    day: dayDate(NADAL_DRAW_DATE, locale),
    dayNoYear: dayDate(NADAL_DRAW_DATE, locale, false),
    checked: dateYear(asOf, locale),
  };

  const blocks: Block[] = [];
  blocks.push(lead(t.lead(c)));
  blocks.push(keyFacts(t.keyFactsTitle, t.keyFacts(c)));
  blocks.push(callout("official", verifiedLine(locale, asOf), t.data(c)));

  // The results first: on 22 December that is what people came for.
  blocks.push(heading(2, t.resultsHeading(c), "resultats"));
  if (results) {
    blocks.push(table(t.resultsTable.caption, t.resultsTable.headers, resultsRows(results, locale), t.resultsTable.note));
    blocks.push(...paras(...t.resultsAfter(results)));
  } else {
    blocks.push(...paras(...t.resultsPending(c)));
  }

  // Then the Catalan angle: "on ha tocat a Catalunya", by prize.
  blocks.push(heading(2, t.cataloniaHeading, "catalunya"));
  if (results) {
    const sold = results.soldInCatalonia;
    blocks.push(
      list(
        t.soldLine("first", results.first, sold.first),
        t.soldLine("second", results.second, sold.second),
        t.soldLine("third", results.third, sold.third),
        t.soldLine("fourth", join([...results.fourth], locale), sold.fourth),
      ),
    );
  } else {
    blocks.push(...paras(...t.cataloniaPending));
  }
  blocks.push(...paras(...t.cataloniaAlways));

  blocks.push(...h2(t.whenHeading, ...t.when(c)));
  blocks.push(...h2(t.drawHeading, ...t.draw));

  blocks.push(...h2(t.prizesHeading, t.prizesIntro));
  blocks.push(table(t.prizeTable.caption, t.prizeTable.headers, programmeRows(locale), t.prizeTable.note));
  blocks.push(...paras(...t.prizesAfter));

  blocks.push(heading(2, t.buyHeading));
  blocks.push(list(...t.buy));
  blocks.push(...paras(t.buyAfter));

  blocks.push(heading(2, t.checkHeading));
  blocks.push(list(...t.check));

  blocks.push(heading(2, t.claimHeading));
  blocks.push(list(...t.claim));
  blocks.push(...paras(...t.claimAfter));

  blocks.push(...h2(t.taxHeading, t.taxIntro));
  blocks.push(table(t.taxTable.caption, t.taxTable.headers, t.taxTable.rows));
  blocks.push(...paras(...t.taxAfter));

  blocks.push(...h2(t.grossaHeading, ...t.grossa));
  blocks.push(callout("info", t.responsibleTitle, t.responsible));

  blocks.push(faq(t.faq(c).map((item) => ({ question: item.question, answer: strip(item.answer) }))));
  blocks.push(...paras(verifiedLine(locale, NADAL_VERIFIED)));
  blocks.push(...b2Related([...RELATED], locale));
  return blocks;
}

/* -------------------------------------------------------------------------- */
/* Article                                                                    */
/* -------------------------------------------------------------------------- */

export function buildNadalArticle(
  results: NadalResults | null = RESULTS_2026,
  time: DrawTime | null = DRAW_TIME_2026,
  asOf: string = NADAL_AS_OF,
): B2Article {
  return {
    key: "loteriaNadal",
    entryKey: "guide-loteria-de-nadal-2026",
    categoryKey: "festivals",
    sources: nadalSources(results, time),
    // No new photograph: the shops guide's hero (also the Christmas in
    // Barcelona hub's and La Marató's), with that article's exact alt text
    // and caption, since media rows are keyed by file and other wording
    // would overwrite them.
    heroKey: SHOPS.heroKey,
    heroAlt: SHOPS.heroAlt,
    heroCaption: SHOPS.heroCaption,
    verifiedAt: asOf,
    publishedAt: "2026-10-31T18:00:00+01:00",
    editions: Object.fromEntries(
      (["ca", "es", "en"] as Locale[]).map((locale) => [
        locale,
        {
          ...NADAL_META[locale],
          seoTitle: nadalSeoTitle(locale, results),
          seoDescription: nadalDescription(locale, results),
          blocks: buildNadalBody(locale, results, time, asOf),
        },
      ]),
    ) as B2Article["editions"],
  };
}

export const LOTERIA_NADAL: B2Article = buildNadalArticle();
