import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import { dateYear, dayDate } from "./festive";
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
 * La Grossa de Cap d'Any 2026: the Generalitat's New Year's Eve lottery draw
 * (Loteries de Catalunya), on one page per language whose lead, key facts,
 * results table, titles and description switch to the winning numbers as soon
 * as the lead pastes them into RESULTS_2026.
 *
 * Every fact was read on 30 Oct 2026 on official pages (fact pack:
 * research_notes/grossa-cap-d-any-factpack.md):
 *
 *  - DOGC núm. 9640, 8.4.2026: Anunci of the Acord del Consell d'Administració
 *    de Loteries de Catalunya, SAU, de 10 de desembre de 2025 (2nd half 2026
 *    draws), Annex 3: draw on 31 Dec 2026; numbers 00000-99999; 35 series per
 *    number (30 on paper, 5 printed at the terminal or bought on the web and
 *    app); 10 € a ticket; sales from 12 Sep 2026; 61.59% to prizes; the eight
 *    extractions and the prize table; payment places per Resolució
 *    ECO/1851/2021.
 *  - loteriesdecatalunya.cat (loteries.cat redirects there): the game page
 *    (same table, draw order, right-to-left rule, neighbours with the
 *    99999/00000 wrap, no accumulation within one winning number, 90-day
 *    expiry, complementary network "principalment supermercats", choosing a
 *    number at a terminal), the prize-payment page (120 € at any outlet with a
 *    terminal, optionally up to 1,999.99 €; CaixaBank from 50 €; head office
 *    any amount; DNI from 2,000 €; online wallet up to 400 €), the FAQ (20%
 *    levy over 40,000 €; minors may not play; sales only in Catalonia, online
 *    only for people registered in Catalonia; the Cap d'Any draw is held in
 *    TVC's studios; more than 307 M€ to Drets Socials), the contact page (head
 *    office 9:00-14:00 Mon-Fri) and the outlet finder.
 *  - Loteries de Catalunya press releases: 19 Dec 2024 (2024 broadcast from
 *    13:05 on 3Cat and TV3 from Sant Joan Despí; tickets on sale until 11:00
 *    on 31 Dec) and 31 Dec 2025 (2025 results, 13th edition, 14,087,610 € in
 *    prizes, head office paying until 30 Mar 2026).
 *  - 3Cat, the broadcaster: the 2025 draw began at 13:00, live on 3Cat.
 *  - Loteries de Catalunya's sales system (the API behind its website): the
 *    2026 draw closes for sale at 11:00 on 31 Dec 2026.
 *  - BOE, Ley 35/2006 (IRPF), disposición adicional 33ª, and the Agencia
 *    Tributaria's IRPF and non-resident pages: 20% on the part of each
 *    ticket's prize above 40,000 €, for regional lotteries too, withheld at
 *    payment.
 *
 * Not printed on purpose: a 2026 draw time (not announced on 30 Oct 2026; the
 * sales API's "drawing" field says 12:00 but the 2024 and 2025 broadcasts
 * began at 13:05 and 13:00, so it is not the draw time), a computed 2026 prize
 * deadline, supermarket brands, and anything only the press reported.
 *
 * HOW TO UPDATE (the lead):
 *  - Draw time announced (in 2024 Loteries de Catalunya announced it on 19
 *    Dec): set DRAW_TIME_2026 = { time: "13:00", source: { name, url,
 *    publisher } } with the official page, move GROSSA_AS_OF to that day, run
 *    the tests, deploy, publish `?only=grossa`.
 *  - 31 Dec, once Loteries de Catalunya publishes the numbers: fill
 *    RESULTS_2026 (template in its comment), set GROSSA_AS_OF = "2026-12-31",
 *    run `npm test` (resultsProblems refuses typos, repeats, last year's
 *    numbers and unofficial sources), deploy, publish `?only=grossa`.
 *  - From 1 Jan 2027 the test "the results are in after the draw" fails while
 *    RESULTS_2026 is still null.
 *
 * No new photograph: the hero is the shops guide's second picture (also the
 * December bridge's hero), with its exact alt text and caption, because media
 * rows are keyed by file and other wording would overwrite them.
 */

/** The draw (Thursday). */
export const GROSSA_DRAW_DATE = "2026-12-31";

/**
 * The day the page was last brought up to date. Every "checked on" line reads
 * this date, never the clock: the HTML is the same whichever day it renders.
 */
export const GROSSA_AS_OF = "2026-10-30";

/** The facts were re-read on the sources on the as-of day: one constant to move. */
export const GROSSA_VERIFIED = GROSSA_AS_OF;

/* -------------------------------------------------------------------------- */
/* The two slots the lead fills                                               */
/* -------------------------------------------------------------------------- */

/** Five digits exactly as printed on the ticket, leading zeros included: "01379". */
export type GrossaNumber = string;

export interface GrossaResults {
  /** 8th extraction: the first prize, La Grossa (200,000 € a ticket). */
  first: GrossaNumber;
  /** 7th extraction: second prize (65,000 €). */
  second: GrossaNumber;
  /** 6th extraction: third prize (30,000 €). */
  third: GrossaNumber;
  /** 4th and 5th extractions, in draw order: fourth prizes (10,000 € each). */
  fourth: [GrossaNumber, GrossaNumber];
  /** 1st, 2nd and 3rd extractions, in draw order: fifth prizes (5,000 € each). */
  fifth: [GrossaNumber, GrossaNumber, GrossaNumber];
  /** Where Loteries de Catalunya says the first prize was sold ("El Vendrell", "Internet"), or null. */
  firstSoldIn: string | null;
  /** The official page the numbers were copied from (Loteries de Catalunya). */
  source: B2Source;
}

/**
 * The winning numbers of 31 Dec 2026. Null until Loteries de Catalunya
 * publishes them. To fill, replace `null` with (these are 2025's numbers, as
 * a shape only: the tests refuse them):
 *
 *   {
 *     first: "01379",
 *     second: "92574",
 *     third: "73762",
 *     fourth: ["29181", "15376"],
 *     fifth: ["34006", "20005", "68675"],
 *     firstSoldIn: "El Vendrell",
 *     source: { name: "La Grossa de Cap d'Any 2026: resultats", url: "https://www.loteriesdecatalunya.cat/resultats/grossa/", publisher: "Loteries de Catalunya" },
 *   }
 */
export const RESULTS_2026: GrossaResults | null = null;

export interface DrawTime {
  /** "13:00", 24-hour clock, Barcelona time. */
  time: string;
  /** The official announcement (Loteries de Catalunya, the Generalitat or 3Cat). */
  source: B2Source;
}

/** The 2026 draw time, once officially announced. */
export const DRAW_TIME_2026: DrawTime | null = null;

/** Hosts a results or time source may sit on: Loteries de Catalunya, the Generalitat, 3Cat. */
export const OFFICIAL_HOSTS = [
  "www.loteriesdecatalunya.cat",
  "www.loteriesdecatalunya.info",
  "api.loteriesdecatalunya.cat",
  "govern.cat",
  "www.govern.cat",
  "dogc.gencat.cat",
  "www.3cat.cat",
];

/** The 2025 winning numbers (Loteries de Catalunya, 31 Dec 2025): printed as last year's, refused as this year's. */
export const RESULTS_2025 = {
  first: "01379",
  second: "92574",
  third: "73762",
  fourth: ["29181", "15376"],
  fifth: ["34006", "20005", "68675"],
} as const;

/** All eight numbers in draw order (1st to 8th extraction). */
export function inDrawOrder(r: { first: string; second: string; third: string; fourth: readonly string[]; fifth: readonly string[] }): string[] {
  return [...r.fifth, ...r.fourth, r.third, r.second, r.first];
}

/** What is wrong with a results slot; empty when it can be published. */
export function resultsProblems(r: GrossaResults): string[] {
  const problems: string[] = [];
  const numbers = inDrawOrder(r);
  if (numbers.length !== 8) problems.push(`expected 8 numbers, got ${numbers.length}`);
  for (const number of numbers) {
    if (!/^[0-9]{5}$/.test(number)) problems.push(`"${number}" is not five digits (keep the leading zeros)`);
  }
  if (new Set(numbers).size !== numbers.length) problems.push("a number appears twice: the eight winning numbers are always different");
  const last = inDrawOrder(RESULTS_2025);
  if (numbers.filter((number) => last.includes(number)).length >= 3 || r.first === RESULTS_2025.first) {
    problems.push("these look like the 2025 numbers");
  }
  if (r.firstSoldIn !== null && !r.firstSoldIn.trim()) problems.push("firstSoldIn is empty: use null");
  let host = "";
  try {
    const url = new URL(r.source.url);
    host = url.host;
    if (url.protocol !== "https:") problems.push("the source is not https");
  } catch {
    problems.push(`the source URL is not valid: ${r.source.url}`);
  }
  if (host && !OFFICIAL_HOSTS.includes(host)) problems.push(`${host} is not an official source`);
  return problems;
}

/** True once `today` is after the draw but the winning numbers are still missing. */
export function isStale(today: string, results: GrossaResults | null = RESULTS_2026): boolean {
  return today > GROSSA_DRAW_DATE && results === null;
}

/* -------------------------------------------------------------------------- */
/* Prizes (DOGC 9640, Annex 3) and the levy (Ley 35/2006, DA 33ª)             */
/* -------------------------------------------------------------------------- */

export type Category = "first" | "second" | "third" | "fourth" | "fifth";

export interface Prize {
  /** How many winning numbers of this category. */
  count: number;
  /** Extractions, 1 to 8. */
  extractions: number[];
  /** Per 10 € ticket. */
  five: number;
  neighbours: number;
  last4: number;
  last3: number;
  last2: number;
  /** Only the first prize: the 10 € back for the same last digit. */
  last1: number | null;
}

export const TICKET_PRICE = 10;
export const SERIES = 35;
export const PRIZE_SHARE = "61,59";

export const PRIZES: Record<Category, Prize> = {
  first: { count: 1, extractions: [8], five: 200_000, neighbours: 2_000, last4: 1_000, last3: 250, last2: 35, last1: 10 },
  second: { count: 1, extractions: [7], five: 65_000, neighbours: 650, last4: 300, last3: 75, last2: 25, last1: null },
  third: { count: 1, extractions: [6], five: 30_000, neighbours: 500, last4: 200, last3: 35, last2: 20, last1: null },
  fourth: { count: 2, extractions: [4, 5], five: 10_000, neighbours: 200, last4: 100, last3: 30, last2: 15, last1: null },
  fifth: { count: 3, extractions: [1, 2, 3], five: 5_000, neighbours: 150, last4: 75, last3: 25, last2: 10, last1: null },
};

export const CATEGORY_ORDER: Category[] = ["first", "second", "third", "fourth", "fifth"];

/** Exempt part of each ticket's prize, and the rate on the rest (Ley 35/2006, DA 33ª). */
export const LEVY_EXEMPT = 40_000;
export const LEVY_RATE = 0.2;

export function levy(prize: number): number {
  return Math.round(Math.max(0, prize - LEVY_EXEMPT) * LEVY_RATE);
}

/** The numbers just before and after, wrapping 99999 <-> 00000. */
export function neighbours(number: GrossaNumber): [GrossaNumber, GrossaNumber] {
  const value = Number(number);
  const pad = (n: number) => String(n).padStart(5, "0");
  return [pad((value + 99_999) % 100_000), pad((value + 1) % 100_000)];
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

const U = {
  dogc2026: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1041354",
  eco425: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=921178",
  home: "https://www.loteriesdecatalunya.cat/",
  game: "https://www.loteriesdecatalunya.cat/jocs/grossa/",
  results: "https://www.loteriesdecatalunya.cat/resultats/grossa/",
  payment: "https://www.loteriesdecatalunya.cat/resultats/pagament-de-premis/",
  faq: "https://www.loteriesdecatalunya.cat/faq/",
  outlets: "https://www.loteriesdecatalunya.cat/punts-de-venda/",
  contact: "https://www.loteriesdecatalunya.info/ca/contacte/",
  legal: "https://www.loteriesdecatalunya.info/ca/sobre-loteries/legal/",
  press: "https://www.loteriesdecatalunya.info/ca/sobre-loteries/publicitat/premsa/",
  press2024: "https://www.loteriesdecatalunya.info/web/.content/sobre-loteries/publicitat/premsa/documents/2024_GCA_Presentadores.pdf",
  press2025: "https://www.loteriesdecatalunya.info/web/.content/sobre-loteries/publicitat/premsa/documents/2025_GCA_Numeros_Premiats.pdf",
  sales2026: "https://api.loteriesdecatalunya.cat/web/lagrossa/rest/dgs/v1/games/LAGROSSACAT/draws/?drawingDate=2026-12-31",
  tv2025: "https://www.3cat.cat/3catinfo/la-grossa-de-cap-dany-2025-data-horari-i-premis-del-sorteig/noticia/3386747/",
  irpf: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#datrigesimatercera",
  aeatIrpf:
    "https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c02-irpf-cuestiones-generales/sujecion-irpf-aspectos-materiales/delimitacion-negativa-hecho-imponible-rentas-sujetas/gravamen-especial-sobre-premios-determinadas-apuestas.html",
  aeatNonResidents:
    "https://sede.agenciatributaria.gob.es/Sede/no-residentes/irnr-sin-establecimiento-permanente/gravamen-especial-sobre-premios-loterias-apuestas.html",
} as const;

export const GROSSA_URLS = U;

const BASE_SOURCES: B2Source[] = [
  { name: "Anunci de l'Acord del Consell d'Administració de Loteries de Catalunya, SAU, de 10 de desembre de 2025, sobre les característiques dels sortejos de La Loteria Passiva 2n semestre 2026 (DOGC núm. 9640, 8.4.2026)", url: U.dogc2026, publisher: "DOGC" },
  { name: "Resolució ECO/425/2022, de 22 de febrer, per la qual s'autoritza la comercialització de la loteria passiva", url: U.eco425, publisher: "DOGC" },
  { name: "La Grossa de Cap d'Any: el joc, els premis i el sorteig", url: U.game, publisher: "Loteries de Catalunya" },
  { name: "Resultats de La Grossa", url: U.results, publisher: "Loteries de Catalunya" },
  { name: "Pagament de premis", url: U.payment, publisher: "Loteries de Catalunya" },
  { name: "Preguntes freqüents", url: U.faq, publisher: "Loteries de Catalunya" },
  { name: "Punts de venda", url: U.outlets, publisher: "Loteries de Catalunya" },
  { name: "Informació de contacte", url: U.contact, publisher: "Loteries de Catalunya" },
  { name: "Loteries de Catalunya", url: U.home, publisher: "Loteries de Catalunya" },
  { name: "Normativa", url: U.legal, publisher: "Loteries de Catalunya" },
  { name: "Notes de premsa", url: U.press, publisher: "Loteries de Catalunya" },
  { name: "El sorteig de La Grossa de Cap d'Any, en directe a 3Cat (19/12/2024)", url: U.press2024, publisher: "Loteries de Catalunya" },
  { name: "La Grossa de Cap d'Any reparteix 14.087.610 d'euros per tot Catalunya (31/12/2025)", url: U.press2025, publisher: "Loteries de Catalunya" },
  { name: "La Grossa de Cap d'Any 2026: obertura i tancament de la venda (sistema de venda)", url: U.sales2026, publisher: "Loteries de Catalunya" },
  { name: "El 01379, primer premi de la Grossa de Cap d'Any 2025 (31/12/2025)", url: U.tv2025, publisher: "3Cat" },
  { name: "Ley 35/2006, del Impuesto sobre la Renta de las Personas Físicas, disposición adicional trigésima tercera", url: U.irpf, publisher: "BOE" },
  { name: "Gravamen especial sobre los premios de determinadas loterías y apuestas (Manual práctico de Renta 2025)", url: U.aeatIrpf, publisher: "Agencia Tributaria" },
  { name: "Gravamen especial sobre premios de loterías y apuestas (no residentes)", url: U.aeatNonResidents, publisher: "Agencia Tributaria" },
];

/** Every source the page cites: the fixed ones plus the results and time sources, once. */
export function grossaSources(results: GrossaResults | null = RESULTS_2026, time: DrawTime | null = DRAW_TIME_2026): B2Source[] {
  const seen = new Set<string>();
  const all: B2Source[] = [];
  for (const source of [...(results ? [results.source] : []), ...(time ? [time.source] : []), ...BASE_SOURCES]) {
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

export const GROSSA_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/la-grossa-cap-d-any",
    title: "La Grossa de Cap d'Any 2026: resultats, premis, hora del sorteig i on comprar",
    excerpt:
      "La Grossa de Cap d'Any 2026: quan és el sorteig, quins premis reparteix, on comprar el bitllet, com comprovar-lo i cobrar-lo, els impostos i els números premiats.",
  },
  es: {
    path: "guias/la-grossa-fin-de-ano",
    title: "La Grossa de Cap d'Any 2026: resultados, premios, hora del sorteo y dónde comprar",
    excerpt:
      "La Grossa de Cap d'Any 2026: cuándo es el sorteo, qué premios reparte, dónde comprar el billete, cómo comprobarlo y cobrarlo, los impuestos y los números premiados.",
  },
  en: {
    path: "guides/la-grossa-new-years-eve-lottery",
    title: "La Grossa de Cap d'Any 2026: results and prizes of Catalonia's New Year's Eve lottery",
    excerpt:
      "La Grossa de Cap d'Any 2026, Catalonia's New Year's Eve lottery: draw date, prizes, where to buy a ticket, how to check and claim it, tax, and the winning numbers.",
  },
};

const SEO_TITLE: Record<Locale, { pending: string; results: string }> = {
  ca: { pending: "La Grossa de Cap d'Any 2026: resultats, premis i hora", results: "Resultats La Grossa de Cap d'Any 2026: números premiats" },
  es: { pending: "La Grossa de Cap d'Any 2026: resultados, premios y hora", results: "Resultados La Grossa de Cap d'Any 2026: números premiados" },
  en: { pending: "La Grossa de Cap d'Any 2026: results, prizes, draw time", results: "La Grossa de Cap d'Any 2026 results: all winning numbers" },
};

export function grossaSeoTitle(locale: Locale, results: GrossaResults | null = RESULTS_2026): string {
  return results ? SEO_TITLE[locale].results : SEO_TITLE[locale].pending;
}

/** Answer-first meta description: the date and top prize, or the winning numbers once they are in. */
export function grossaDescription(locale: Locale, results: GrossaResults | null = RESULTS_2026): string {
  if (results) {
    const { first, second, third } = results;
    return {
      ca: `Resultats de La Grossa de Cap d'Any 2026: primer premi, el ${first} (200.000 €); segon, el ${second}; tercer, el ${third}. Tots els números premiats.`,
      es: `Resultados de La Grossa de Cap d'Any 2026: primer premio, el ${first} (200.000 €); segundo, el ${second}; tercero, el ${third}. Todos los premiados.`,
      en: `La Grossa de Cap d'Any 2026 results: first prize ${first} (€200,000 a ticket), second ${second}, third ${third}. All the winning numbers.`,
    }[locale];
  }
  return {
    ca: "La Grossa de Cap d'Any 2026 se sorteja el 31 de desembre: bitllet de 10 € i 200.000 € de primer premi. Hora, premis, on comprar i números premiats.",
    es: "La Grossa de Cap d'Any 2026 se sortea el 31 de diciembre: billete de 10 € y 200.000 € de primer premio. Hora, premios, dónde comprar y resultados.",
    en: "La Grossa de Cap d'Any 2026, Catalonia's New Year's Eve lottery, is drawn on 31 December: €10 tickets, €200,000 top prize. Draw time and results.",
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function digits(value: number, locale: Locale): string {
  const sep = locale === "en" ? "," : ".";
  return String(value).replace(/(\d)(?=(\d{3})+$)/g, `$1${sep}`);
}

export function eur(value: number, locale: Locale): string {
  return locale === "en" ? `€${digits(value, locale)}` : `${digits(value, locale)} €`;
}

const link = (href: string, label: string) => `[${label}](${href})`;
const strip = (text: string) => text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "a i b" / "a y b" / "a and b"; "a, b i c". */
function join(items: string[], locale: Locale): string {
  const and = { ca: "i", es: "y", en: "and" }[locale];
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

interface Ctx {
  locale: Locale;
  results: GrossaResults | null;
  time: DrawTime | null;
  /** "dijous 31 de desembre de 2026" */
  day: string;
  /** "dijous 31 de desembre" */
  dayNoYear: string;
  /** "30 d'octubre de 2026" */
  checked: string;
}

interface Copy {
  names: Record<Category, { one: string; many: string }>;
  lead(c: Ctx): string;
  keyFactsTitle: string;
  keyFacts(c: Ctx): { label: string; value: string }[];
  data(c: Ctx): string;
  resultsHeading(c: Ctx): string;
  resultsPending(c: Ctx): string[];
  resultsTable: { caption: string; headers: string[]; note: string };
  neighboursCell(prev: string, next: string, amount: string): string;
  endingsCell(number: string, prize: Prize): string;
  resultsAfter(c: Ctx): string[];
  whenHeading: string;
  when(c: Ctx): string[];
  drawHeading: string;
  drawIntro: string;
  drawOrder: string[];
  drawRules: string[];
  prizesHeading: string;
  prizesIntro: string;
  prizeTable: { caption: string; headers: string[]; note: string };
  prizesAfter: string;
  buyHeading: string;
  buyIntro: string;
  buy: string[];
  buyAfter: string[];
  checkHeading: string;
  check: string[];
  claimHeading: string;
  claim: string[];
  claimAfter: string;
  taxHeading: string;
  taxIntro: string;
  taxTable: { caption: string; headers: string[]; rows: string[][] };
  taxAfter: string[];
  nightHeading: string;
  night(c: Ctx): string[];
  aboutHeading: string;
  about: string[];
  responsibleTitle: string;
  responsible: string;
  faq(c: Ctx): { question: string; answer: string }[];
}

const NAMES: Record<Locale, Copy["names"]> = {
  ca: {
    first: { one: "Primer premi (La Grossa)", many: "Primer premi (La Grossa)" },
    second: { one: "Segon premi", many: "Segon premi" },
    third: { one: "Tercer premi", many: "Tercer premi" },
    fourth: { one: "Quart premi", many: "Quarts premis" },
    fifth: { one: "Cinquè premi", many: "Cinquens premis" },
  },
  es: {
    first: { one: "Primer premio (La Grossa)", many: "Primer premio (La Grossa)" },
    second: { one: "Segundo premio", many: "Segundo premio" },
    third: { one: "Tercer premio", many: "Tercer premio" },
    fourth: { one: "Cuarto premio", many: "Cuartos premios" },
    fifth: { one: "Quinto premio", many: "Quintos premios" },
  },
  en: {
    first: { one: "First prize (La Grossa)", many: "First prize (La Grossa)" },
    second: { one: "Second prize", many: "Second prize" },
    third: { one: "Third prize", many: "Third prize" },
    fourth: { one: "Fourth prize", many: "Fourth prizes" },
    fifth: { one: "Fifth prize", many: "Fifth prizes" },
  },
};

/** The winning numbers as one sentence per category. */
function numbersLine(r: GrossaResults, locale: Locale): string {
  const t = {
    ca: [`Primer premi: ${r.first}`, `Segon: ${r.second}`, `Tercer: ${r.third}`, `Quarts: ${join([...r.fourth], "ca")}`, `Cinquens: ${join([...r.fifth], "ca")}`],
    es: [`Primer premio: ${r.first}`, `Segundo: ${r.second}`, `Tercero: ${r.third}`, `Cuartos: ${join([...r.fourth], "es")}`, `Quintos: ${join([...r.fifth], "es")}`],
    en: [`First prize: ${r.first}`, `Second: ${r.second}`, `Third: ${r.third}`, `Fourth: ${join([...r.fourth], "en")}`, `Fifth: ${join([...r.fifth], "en")}`],
  }[locale];
  return `${t.join(". ")}.`;
}

const PAST_TIMES = {
  ca: "el 2024 el programa es va emetre a partir de les 13:05 i el 2025 el sorteig va començar a les 13:00",
  es: "en 2024 el programa se emitió a partir de las 13:05 y en 2025 el sorteo empezó a las 13:00",
  en: "in 2024 the programme went out from 13:05 and in 2025 the draw began at 13:00",
} as const;

const COPY: Record<Locale, Copy> = {
  /* ------------------------------------------------------------------ ca */
  ca: {
    names: NAMES.ca,
    lead: (c) => {
      if (c.results) {
        const r = c.results;
        return `**El ${r.first} és La Grossa de Cap d'Any 2026, el primer premi: 200.000 € per bitllet de 10 €.** El segon premi és el ${r.second} (65.000 €) i el tercer, el ${r.third} (30.000 €). Quarts premis (10.000 €): ${join([...r.fourth], "ca")}. Cinquens premis (5.000 €): ${join([...r.fifth], "ca")}. Comprova el teu bitllet als ${link(r.source.url, "resultats oficials de Loteries de Catalunya")}.`;
      }
      const time = c.time
        ? `El sorteig serà a les ${c.time.time}, segons ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.`
        : `L'hora del sorteig del 2026 encara no s'ha anunciat (${c.checked}); el 2025 va començar a les 13:00, en directe per 3Cat.`;
      return `**La Grossa de Cap d'Any 2026 se sorteja el ${c.dayNoYear}, i el primer premi és de 200.000 € per bitllet de 10 €.** És la loteria de final d'any de la Generalitat: 100.000 números, del 00000 al 99999, amb 35 bitllets de cada número, i vuit números premiats. ${time} Quan acabi el sorteig, aquí hi haurà tots els números premiats.`;
    },
    keyFactsTitle: "La Grossa de Cap d'Any 2026, d'un cop d'ull",
    keyFacts: (c) => [
      ...(c.results
        ? [
            { label: "Primer premi 2026", value: `${c.results.first} (200.000 € per bitllet)` },
            ...(c.results.firstSoldIn ? [{ label: "On s'ha venut el primer premi", value: c.results.firstSoldIn }] : []),
            { label: "Segon i tercer premis", value: `${c.results.second} (65.000 €) i ${c.results.third} (30.000 €)` },
            { label: "Quarts i cinquens premis", value: `${join([...c.results.fourth], "ca")} (10.000 €); ${join([...c.results.fifth], "ca")} (5.000 €)` },
          ]
        : [
            { label: "Data del sorteig", value: cap(c.day) },
            { label: "Hora", value: c.time ? c.time.time : "Encara no anunciada (el 2025, a les 13:00)" },
            { label: "Primer premi", value: "200.000 € per bitllet (La Grossa)" },
            { label: "Altres premis grossos", value: "Segon de 65.000 €, tercer de 30.000 €, dos quarts de 10.000 € i tres cinquens de 5.000 €" },
          ]),
      { label: "Preu", value: "10 € per bitllet" },
      { label: "Números", value: "100.000 (del 00000 al 99999), amb 35 sèries de cada número" },
      { label: "Venda", value: "Des del 12 de setembre fins a les 11:00 del 31 de desembre de 2026" },
      { label: "Termini per cobrar", value: "90 dies des del sorteig" },
    ],
    data: (c) =>
      c.results
        ? "Els números premiats són els que publica Loteries de Catalunya, i si hi hagués cap diferència val el resultat oficial. Les regles i els premis surten de l'acord publicat al DOGC el 8 d'abril de 2026 i del web de Loteries de Catalunya."
        : `Tot surt de l'acord de Loteries de Catalunya publicat al DOGC el 8 d'abril de 2026, del web i les notes de premsa de Loteries de Catalunya, de 3Cat (que emet el sorteig) i de la llei de l'IRPF. ${c.time ? "" : "L'hora del sorteig del 2026 encara no s'ha publicat. "}El que es va fer el 2024 i el 2025 sempre porta l'any al costat.`,
    resultsHeading: (c) => (c.results ? "Números premiats de La Grossa de Cap d'Any 2026" : "Resultats de La Grossa de Cap d'Any 2026"),
    resultsPending: (c) => [
      `El sorteig és el ${c.day}. Els números premiats es publiquen a la ${link(U.results, "pàgina de resultats de Loteries de Catalunya")}, que té un comprovador de números, i aquí els hi posarem quan acabi el sorteig.`,
      `**Resultats del 2025**, com a referència: el primer premi va ser el ${RESULTS_2025.first}, venut íntegrament al Vendrell (els 35 bitllets, 7 milions d'euros); el segon, el ${RESULTS_2025.second}; el tercer, el ${RESULTS_2025.third}; els quarts, ${join(RESULTS_2025.fourth.map((n) => `el ${n}`), "ca")}, i els cinquens, ${join(RESULTS_2025.fifth.map((n) => `el ${n}`), "ca")}, segons ${link(U.press2025, "Loteries de Catalunya")}.`,
    ],
    resultsTable: {
      caption: "Números premiats de La Grossa de Cap d'Any 2026 i premi per bitllet de 10 €",
      headers: ["Premi", "Número", "Per bitllet", "Anterior i posterior", "Terminacions"],
      note: "Font: Loteries de Catalunya. Si hi hagués cap diferència, val el resultat oficial.",
    },
    neighboursCell: (prev, next, amount) => `${prev} i ${next}: ${amount}`,
    endingsCell: (number, prize) =>
      [
        `acabats en ${number.slice(1)}: ${eur(prize.last4, "ca")}`,
        `en ${number.slice(2)}: ${eur(prize.last3, "ca")}`,
        `en ${number.slice(3)}: ${eur(prize.last2, "ca")}`,
        ...(prize.last1 ? [`en ${number.slice(4)}: ${eur(prize.last1, "ca")} (reintegrament)`] : []),
      ].join("; "),
    resultsAfter: (c) => [
      "Del mateix número guanyador només es cobra la categoria més alta (qui té les quatre últimes xifres del primer premi cobra 1.000 €, no també els 250 € de les tres últimes), però si un bitllet encerta números diferents, els premis se sumen.",
      `Comprova el teu bitllet a la ${link(c.results?.source.url ?? U.results, "pàgina de resultats de Loteries de Catalunya")} o a qualsevol punt de venda amb terminal, i mira més avall on es cobra cada premi i quants impostos paga.`,
    ],
    whenHeading: "Quan és el sorteig de La Grossa de Cap d'Any 2026 i a quina hora?",
    when: (c) => [
      c.results
        ? `El sorteig es va fer el **${c.day}**, com fixava l'acord de Loteries de Catalunya publicat al ${link(U.dogc2026, "DOGC del 8 d'abril de 2026")}.${
            c.time ? ` Va començar a les ${c.time.time}, segons ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.` : ""
          } Els números premiats són a la taula de resultats, al principi d'aquesta pàgina.`
        : `El sorteig és el **${c.day}**, segons l'acord de Loteries de Catalunya publicat al ${link(U.dogc2026, "DOGC del 8 d'abril de 2026")}. ${
            c.time
              ? `Serà a les ${c.time.time}, segons ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}; ${PAST_TIMES.ca}.`
              : `L'hora encara no s'ha anunciat (${c.checked}): ${PAST_TIMES.ca}, en directe per 3Cat.`
          }`,
      `El 2024 Loteries de Catalunya va anunciar l'hora i els presentadors el 19 de desembre, en una ${link(U.press2024, "nota de premsa")}: el programa es va emetre per 3Cat i TV3 des de les instal·lacions de Sant Joan Despí. El 2025, ${link(U.tv2025, "segons 3Cat")}, el sorteig va començar a les 13:00 i el van presentar Llucià Ferrer i Nerea Sanfe. Segons les preguntes freqüents de Loteries de Catalunya, a diferència dels sortejos que es fan amb un generador de números aleatoris, La Grossa de Cap d'Any se sorteja als estudis de TVC.`,
      `**Fins quan es pot comprar?** El 2024 es podien comprar bitllets fins a les 11:00 del mateix 31 de desembre, a tots els canals, i per al 2026 el ${link(U.sales2026, "sistema de venda de Loteries de Catalunya")} també té el tancament a les 11:00 del 31 de desembre.`,
    ],
    drawHeading: "Com es fa el sorteig: vuit extraccions i La Grossa, l'última",
    drawIntro: "Se'n treuen vuit números de cinc xifres, i el primer premi surt l'últim. L'ordre el fixa l'acord publicat al DOGC:",
    drawOrder: [
      "**1a, 2a i 3a extraccions:** els tres cinquens premis (5.000 € per bitllet).",
      "**4a i 5a extraccions:** els dos quarts premis (10.000 €).",
      "**6a extracció:** el tercer premi (30.000 €).",
      "**7a extracció:** el segon premi (65.000 €).",
      "**8a extracció:** el primer premi, La Grossa (200.000 €).",
    ],
    drawRules: [
      "Els vuit números són diferents: si en surt un de repetit, es queda la categoria més alta i es fa una extracció nova per a la més baixa. Un bitllet té premi quan les seves últimes xifres coincideixen, de dreta a esquerra, amb les d'un número guanyador, o quan és el número just anterior o posterior a un guanyador (el posterior del 99999 és el 00000, i l'anterior del 00000, el 99999).",
      "Del mateix número guanyador només es cobra el premi més alt: qui té les quatre últimes xifres del primer premi cobra 1.000 €, no també els 250 € de les tres últimes. Si un bitllet encerta números guanyadors diferents, en canvi, els premis s'acumulen.",
    ],
    prizesHeading: "Premis de La Grossa de Cap d'Any 2026",
    prizesIntro:
      "Hi ha cinc grans premis: el primer, La Grossa, de 200.000 € per bitllet; el segon, de 65.000 €; el tercer, de 30.000 €; dos quarts de 10.000 € i tres cinquens de 5.000 €. Cada número té 35 bitllets (sèries), i els premis són per bitllet: si un sol punt de venda ven tots els bitllets d'un número, reparteix tot el premi. El 2025 un estanc del Vendrell va vendre els 35 del primer premi, 7 milions d'euros.",
    prizeTable: {
      caption: "Premis per bitllet de 10 € (acord publicat al DOGC el 8 d'abril de 2026)",
      headers: ["Premi", "Números", "Les 5 xifres", "Anterior i posterior", "4 últimes xifres", "3 últimes", "2 últimes"],
      note: "A més, tots els bitllets que acaben en la mateixa xifra que el primer premi cobren 10 € (el reintegrament).",
    },
    prizesAfter: `L'acord destina a premis el ${PRIZE_SHARE}% de l'import dels bitllets emesos. Les probabilitats de cada premi són a la ${link(U.game, "pàgina del joc de Loteries de Catalunya")}.`,
    buyHeading: "On comprar La Grossa de Cap d'Any: només als canals oficials",
    buyIntro: "La venda va començar el 12 de setembre de 2026. Els canals oficials són tres:",
    buy: [
      `**Els punts de venda de Loteries de Catalunya:** estancs, llibreries, quioscos, bars i altres comerços autoritzats. Els que tenen terminal et poden imprimir al moment el número que demanis, si encara n'hi ha. Busca'n un al ${link(U.outlets, "cercador de punts de venda")}.`,
      "**La xarxa de venda complementària** de Loteries de Catalunya, formada principalment per supermercats.",
      `**El web i l'app de Loteries de Catalunya** (${link(U.home, "loteriesdecatalunya.cat")}), que venen les cinc sèries electròniques, les mateixes que imprimeixen els terminals dels punts de venda. Cal registrar-se, estar empadronat a Catalunya i tenir el compte bancari en una oficina de Catalunya.`,
    ],
    buyAfter: [
      "Les loteries de la Generalitat només es poden vendre a Catalunya, però qualsevol persona, també de fora o estrangera, pot comprar un bitllet mentre és a Catalunya, segons Loteries de Catalunya. Els menors d'edat no poden jugar (Llei 15/1984 del joc, article 9).",
      "**Participacions.** Les entitats poden fer participacions de La Grossa de Cap d'Any a través d'un punt de venda, que els dona els talonaris sense cost; segons el web del joc, abans del 18 de desembre han de pagar la loteria venuda i tornar les participacions que no hagin venut.",
    ],
    checkHeading: "Com comprovar si t'ha tocat La Grossa",
    check: [
      `**Al web:** la ${link(U.results, "pàgina de resultats de La Grossa")} de Loteries de Catalunya té un comprovador de números.`,
      "**Al punt de venda:** qualsevol establiment amb terminal pot validar el bitllet; els que no en tenen no poden validar-lo ni pagar-lo.",
      "**Si l'has comprat per internet,** el premi s'ingressa sol: fins a 400 €, al moneder del teu compte, i més de 400 €, al compte bancari que vas registrar.",
    ],
    claimHeading: "On es cobren els premis de La Grossa",
    claim: [
      "**Fins a 120 €:** a qualsevol punt de venda amb terminal. Si volen, poden pagar fins a 1.999,99 €, en efectiu fins a 999,99 € o per transferència.",
      "**A partir de 50 €:** a qualsevol oficina de CaixaBank.",
      `**De qualsevol import:** a l'oficina d'atenció i pagament de premis de Loteries de Catalunya, al carrer d'Enric Granados, 33, de Barcelona, de dilluns a divendres de 9:00 a 14:00 (${link(U.contact, "contacte")}).`,
      "**Des de 2.000 €:** cal portar el DNI i, per cobrar per transferència, el certificat de titularitat bancària.",
    ],
    claimAfter: `**Termini:** el dret a cobrar caduca als 90 dies naturals comptats des del dia del sorteig, segons la ${link(U.payment, "pàgina de pagament de premis")}. Per al sorteig del 2025, Loteries de Catalunya va donar com a últim dia el 30 de març de 2026.`,
    taxHeading: "Quants impostos paga un premi de La Grossa?",
    taxIntro: `Els premis de fins a 40.000 € per bitllet no paguen impostos. Del que passa de 40.000 €, Hisenda se'n queda el 20%: és el gravamen especial sobre els premis de loteries de la ${link(U.irpf, "llei de l'IRPF (disposició addicional 33a)")}, que també s'aplica a les loteries de les comunitats autònomes, i ${link(U.faq, "Loteries de Catalunya")} el reté quan paga el premi. A La Grossa de Cap d'Any només en paguen el primer i el segon premi:`,
    taxTable: {
      caption: "Gravamen sobre un bitllet de 10 € premiat",
      headers: ["Premi del bitllet", "Gravamen (20% del que passa de 40.000 €)", "Cobres"],
      rows: [
        ["200.000 € (primer premi)", eur(levy(200_000), "ca"), eur(200_000 - levy(200_000), "ca")],
        ["65.000 € (segon premi)", eur(levy(65_000), "ca"), eur(65_000 - levy(65_000), "ca")],
        ["30.000 € (tercer premi) o menys", "0 €", "Tot el premi"],
      ],
    },
    taxAfter: [
      `El gravamen es calcula per bitllet. Si un bitllet és de diverses persones, els 40.000 € exempts es reparteixen segons la part de cadascuna. Com que es reté en cobrar el premi, no cal fer cap declaració a part, i aquests premis no s'afegeixen a la declaració de la renda. Les persones que no resideixen a Espanya tenen el mateix gravamen i la mateixa exempció, segons l'${link(U.aeatNonResidents, "Agència Tributària")}.`,
    ],
    nightHeading: "La Grossa i la nit de Cap d'Any: què passa el 31 i l'1 de gener",
    night: (c) => [
      `El sorteig no és a mitjanit: ${c.time ? `el 2026 és a les ${c.time.time}, i ` : ""}el 2024 i el 2025 es va fer cap a la una del migdia del 31 de desembre, de manera que els números premiats es coneixen la mateixa tarda, hores abans de les campanades. El 31 de desembre de 2026 és dijous i és laborable; l'1 de gener de 2027, divendres, és festiu a tot Catalunya (${b2link("holidayToday", "ca", "és festiu avui?")}).`,
      "No hi ha pressa per cobrar: el termini és de 90 dies. Els punts de venda paguen fins a 120 € en el seu horari, i l'oficina de premis de Loteries de Catalunya obre de dilluns a divendres de 9:00 a 14:00.",
      `Per a la festa, el metro tota la nit i què obre l'1 de gener, mira ${b2link("newYear", "ca", "Cap d'Any a Barcelona")}.`,
    ],
    aboutHeading: "Què és La Grossa de Cap d'Any",
    about: [
      "És el sorteig de final d'any de Loteries de Catalunya, la societat pública que gestiona la loteria de la Generalitat (al DOGC, els seus anuncis surten dins del Departament d'Economia i Finances). El 2024 se'n va fer la dotzena edició i el 2025, la tretzena, que va repartir 14.087.610 € en premis i va premiar 273.242 bitllets.",
      "Segons Loteries de Catalunya, els ingressos de la loteria són de la Generalitat i es destinen a programes socials: ha transferit més de 307 milions d'euros al Departament de Drets Socials i Inclusió per a la infància vulnerable, la gent gran i les persones amb discapacitat.",
    ],
    responsibleTitle: "Joc responsable",
    responsible: "Com recomana Loteries de Catalunya: juga només si ets major d'edat, fixa't un pressupost abans i practica altres activitats d'oci. Loteries de Catalunya té un servei d'atenció a la ciutadania al 93 707 60 01.",
    faq: (c) => [
      {
        question: "Quan és el sorteig de La Grossa de Cap d'Any 2026?",
        answer: c.results
          ? `Es va fer el ${c.day}${c.time ? `, a les ${c.time.time}` : ""}.`
          : `El ${c.day}. ${c.time ? `A les ${c.time.time}.` : "L'hora encara no s'ha anunciat; el 2025 el sorteig va començar a les 13:00, en directe per 3Cat."}`,
      },
      {
        question: "Quins són els números premiats de La Grossa de Cap d'Any 2026?",
        answer: c.results
          ? numbersLine(c.results, "ca")
          : "El sorteig és el 31 de desembre de 2026. Els números premiats es publiquen a la pàgina de resultats de Loteries de Catalunya, i aquí mateix quan acaba el sorteig.",
      },
      {
        question: "Quant es guanya a La Grossa de Cap d'Any?",
        answer: "El primer premi, La Grossa, és de 200.000 € per bitllet de 10 €. El segon és de 65.000 €, el tercer de 30.000 €, els dos quarts de 10.000 € i els tres cinquens de 5.000 €, i també cobren el número anterior i el posterior i les terminacions.",
      },
      { question: "Quant val un bitllet de La Grossa de Cap d'Any?", answer: "10 €. Cada número té 35 bitllets (sèries)." },
      {
        question: "On es pot comprar La Grossa de Cap d'Any?",
        answer: "Als punts de venda de Loteries de Catalunya (estancs, llibreries, quioscos, bars...), a la seva xarxa complementària, sobretot supermercats, i al web i l'app de Loteries de Catalunya, fins a les 11:00 del 31 de desembre.",
      },
      {
        question: "Com sé si m'ha tocat La Grossa?",
        answer: "Amb el comprovador de la pàgina de resultats del web de Loteries de Catalunya, o a qualsevol punt de venda amb terminal.",
      },
      {
        question: "On es cobren els premis de La Grossa de Cap d'Any?",
        answer: "Fins a 120 €, a qualsevol punt de venda amb terminal; a partir de 50 €, a CaixaBank; de qualsevol import, a l'oficina de Loteries de Catalunya del carrer d'Enric Granados, 33, de Barcelona. El termini és de 90 dies.",
      },
      {
        question: "Quants impostos paga el primer premi de La Grossa?",
        answer: `${eur(levy(200_000), "ca")}: el 20% dels 160.000 € que passen de 40.000 €. D'un bitllet de 200.000 € en cobres ${eur(200_000 - levy(200_000), "ca")}. Els premis de fins a 40.000 € no paguen.`,
      },
      {
        question: "Es pot jugar a La Grossa des de fora de Catalunya?",
        answer: "Els bitllets només es venen a Catalunya, però els pot comprar qualsevol persona que hi sigui. Per internet cal estar empadronat a Catalunya i tenir el compte bancari en una oficina de Catalunya.",
      },
    ],
  },

  /* ------------------------------------------------------------------ es */
  es: {
    names: NAMES.es,
    lead: (c) => {
      if (c.results) {
        const r = c.results;
        return `**El ${r.first} es La Grossa de Cap d'Any 2026, el primer premio: 200.000 € por billete de 10 €.** El segundo premio es el ${r.second} (65.000 €) y el tercero, el ${r.third} (30.000 €). Cuartos premios (10.000 €): ${join([...r.fourth], "es")}. Quintos premios (5.000 €): ${join([...r.fifth], "es")}. Comprueba tu billete en los ${link(r.source.url, "resultados oficiales de Loteries de Catalunya")}.`;
      }
      const time = c.time
        ? `El sorteo será a las ${c.time.time}, según ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.`
        : `La hora del sorteo de 2026 aún no se ha anunciado (${c.checked}); en 2025 empezó a las 13:00, en directo por 3Cat.`;
      return `**La Grossa de Cap d'Any 2026 se sortea el ${c.dayNoYear}, y el primer premio es de 200.000 € por billete de 10 €.** Es la lotería de fin de año de la Generalitat: 100.000 números, del 00000 al 99999, con 35 billetes de cada número, y ocho números premiados. ${time} Cuando acabe el sorteo, aquí estarán todos los números premiados.`;
    },
    keyFactsTitle: "La Grossa de Cap d'Any 2026, de un vistazo",
    keyFacts: (c) => [
      ...(c.results
        ? [
            { label: "Primer premio 2026", value: `${c.results.first} (200.000 € por billete)` },
            ...(c.results.firstSoldIn ? [{ label: "Dónde se vendió el primer premio", value: c.results.firstSoldIn }] : []),
            { label: "Segundo y tercer premios", value: `${c.results.second} (65.000 €) y ${c.results.third} (30.000 €)` },
            { label: "Cuartos y quintos premios", value: `${join([...c.results.fourth], "es")} (10.000 €); ${join([...c.results.fifth], "es")} (5.000 €)` },
          ]
        : [
            { label: "Fecha del sorteo", value: cap(c.day) },
            { label: "Hora", value: c.time ? c.time.time : "Aún no anunciada (en 2025, a las 13:00)" },
            { label: "Primer premio", value: "200.000 € por billete (La Grossa)" },
            { label: "Otros premios grandes", value: "Segundo de 65.000 €, tercero de 30.000 €, dos cuartos de 10.000 € y tres quintos de 5.000 €" },
          ]),
      { label: "Precio", value: "10 € por billete" },
      { label: "Números", value: "100.000 (del 00000 al 99999), con 35 series de cada número" },
      { label: "Venta", value: "Desde el 12 de septiembre hasta las 11:00 del 31 de diciembre de 2026" },
      { label: "Plazo para cobrar", value: "90 días desde el sorteo" },
    ],
    data: (c) =>
      c.results
        ? "Los números premiados son los que publica Loteries de Catalunya, y si hubiera alguna diferencia vale el resultado oficial. Las reglas y los premios salen del acuerdo publicado en el DOGC el 8 de abril de 2026 y de la web de Loteries de Catalunya."
        : `Todo sale del acuerdo de Loteries de Catalunya publicado en el DOGC el 8 de abril de 2026, de la web y las notas de prensa de Loteries de Catalunya, de 3Cat (que emite el sorteo) y de la ley del IRPF. ${c.time ? "" : "La hora del sorteo de 2026 aún no se ha publicado. "}Lo que se hizo en 2024 y 2025 siempre lleva el año al lado.`,
    resultsHeading: (c) => (c.results ? "Números premiados de La Grossa de Cap d'Any 2026" : "Resultados de La Grossa de Cap d'Any 2026"),
    resultsPending: (c) => [
      `El sorteo es el ${c.day}. Los números premiados se publican en la ${link(U.results, "página de resultados de Loteries de Catalunya")}, que tiene un comprobador de números, y aquí los pondremos en cuanto acabe el sorteo.`,
      `**Resultados de 2025**, como referencia: el primer premio fue el ${RESULTS_2025.first}, vendido íntegramente en El Vendrell (los 35 billetes, 7 millones de euros); el segundo, el ${RESULTS_2025.second}; el tercero, el ${RESULTS_2025.third}; los cuartos, ${join(RESULTS_2025.fourth.map((n) => `el ${n}`), "es")}, y los quintos, ${join(RESULTS_2025.fifth.map((n) => `el ${n}`), "es")}, según ${link(U.press2025, "Loteries de Catalunya")}.`,
    ],
    resultsTable: {
      caption: "Números premiados de La Grossa de Cap d'Any 2026 y premio por billete de 10 €",
      headers: ["Premio", "Número", "Por billete", "Anterior y posterior", "Terminaciones"],
      note: "Fuente: Loteries de Catalunya. Si hubiera alguna diferencia, vale el resultado oficial.",
    },
    neighboursCell: (prev, next, amount) => `${prev} y ${next}: ${amount}`,
    endingsCell: (number, prize) =>
      [
        `terminados en ${number.slice(1)}: ${eur(prize.last4, "es")}`,
        `en ${number.slice(2)}: ${eur(prize.last3, "es")}`,
        `en ${number.slice(3)}: ${eur(prize.last2, "es")}`,
        ...(prize.last1 ? [`en ${number.slice(4)}: ${eur(prize.last1, "es")} (reintegro)`] : []),
      ].join("; "),
    resultsAfter: (c) => [
      "Del mismo número ganador solo se cobra la categoría más alta (quien tiene las cuatro últimas cifras del primer premio cobra 1.000 €, no también los 250 € de las tres últimas), pero si un billete acierta números distintos, los premios se suman.",
      `Comprueba tu billete en la ${link(c.results?.source.url ?? U.results, "página de resultados de Loteries de Catalunya")} o en cualquier punto de venta con terminal, y mira más abajo dónde se cobra cada premio y cuántos impuestos paga.`,
    ],
    whenHeading: "¿Cuándo es el sorteo de La Grossa de Cap d'Any 2026 y a qué hora?",
    when: (c) => [
      c.results
        ? `El sorteo se celebró el **${c.day}**, como fijaba el acuerdo de Loteries de Catalunya publicado en el ${link(U.dogc2026, "DOGC del 8 de abril de 2026")}.${
            c.time ? ` Empezó a las ${c.time.time}, según ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.` : ""
          } Los números premiados están en la tabla de resultados, al principio de esta página.`
        : `El sorteo es el **${c.day}**, según el acuerdo de Loteries de Catalunya publicado en el ${link(U.dogc2026, "DOGC del 8 de abril de 2026")}. ${
            c.time
              ? `Será a las ${c.time.time}, según ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}; ${PAST_TIMES.es}.`
              : `La hora aún no se ha anunciado (${c.checked}): ${PAST_TIMES.es}, en directo por 3Cat.`
          }`,
      `En 2024 Loteries de Catalunya anunció la hora y los presentadores el 19 de diciembre, en una ${link(U.press2024, "nota de prensa")}: el programa se emitió por 3Cat y TV3 desde las instalaciones de Sant Joan Despí. En 2025, ${link(U.tv2025, "según 3Cat")}, el sorteo empezó a las 13:00 y lo presentaron Llucià Ferrer y Nerea Sanfe. Según las preguntas frecuentes de Loteries de Catalunya, a diferencia de los sorteos que se hacen con un generador de números aleatorios, La Grossa de Cap d'Any se sortea en los estudios de TVC.`,
      `**¿Hasta cuándo se puede comprar?** En 2024 se podían comprar billetes hasta las 11:00 del mismo 31 de diciembre, en todos los canales, y para 2026 el ${link(U.sales2026, "sistema de venta de Loteries de Catalunya")} también tiene el cierre a las 11:00 del 31 de diciembre.`,
    ],
    drawHeading: "Cómo es el sorteo: ocho extracciones y La Grossa, la última",
    drawIntro: "Se extraen ocho números de cinco cifras, y el primer premio sale el último. El orden lo fija el acuerdo publicado en el DOGC:",
    drawOrder: [
      "**1.ª, 2.ª y 3.ª extracciones:** los tres quintos premios (5.000 € por billete).",
      "**4.ª y 5.ª extracciones:** los dos cuartos premios (10.000 €).",
      "**6.ª extracción:** el tercer premio (30.000 €).",
      "**7.ª extracción:** el segundo premio (65.000 €).",
      "**8.ª extracción:** el primer premio, La Grossa (200.000 €).",
    ],
    drawRules: [
      "Los ocho números son distintos: si sale uno repetido, se queda la categoría más alta y se hace una extracción nueva para la más baja. Un billete tiene premio cuando sus últimas cifras coinciden, de derecha a izquierda, con las de un número ganador, o cuando es el número justo anterior o posterior a un ganador (el posterior del 99999 es el 00000, y el anterior del 00000, el 99999).",
      "Del mismo número ganador solo se cobra el premio más alto: quien tiene las cuatro últimas cifras del primer premio cobra 1.000 €, no también los 250 € de las tres últimas. Si un billete acierta números ganadores distintos, en cambio, los premios se acumulan.",
    ],
    prizesHeading: "Premios de La Grossa de Cap d'Any 2026",
    prizesIntro:
      "Hay cinco grandes premios: el primero, La Grossa, de 200.000 € por billete; el segundo, de 65.000 €; el tercero, de 30.000 €; dos cuartos de 10.000 € y tres quintos de 5.000 €. Cada número tiene 35 billetes (series), y los premios son por billete: si un solo punto de venta vende todos los billetes de un número, reparte todo el premio. En 2025 un estanco de El Vendrell vendió los 35 del primer premio, 7 millones de euros.",
    prizeTable: {
      caption: "Premios por billete de 10 € (acuerdo publicado en el DOGC el 8 de abril de 2026)",
      headers: ["Premio", "Números", "Las 5 cifras", "Anterior y posterior", "4 últimas cifras", "3 últimas", "2 últimas"],
      note: "Además, todos los billetes que acaban en la misma cifra que el primer premio cobran 10 € (el reintegro).",
    },
    prizesAfter: `El acuerdo destina a premios el ${PRIZE_SHARE}% del importe de los billetes emitidos. Las probabilidades de cada premio están en la ${link(U.game, "página del juego de Loteries de Catalunya")}.`,
    buyHeading: "Dónde comprar La Grossa de Cap d'Any: solo en los canales oficiales",
    buyIntro: "La venta empezó el 12 de septiembre de 2026. Los canales oficiales son tres:",
    buy: [
      `**Los puntos de venta de Loteries de Catalunya:** estancos, librerías, quioscos, bares y otros comercios autorizados. Los que tienen terminal te pueden imprimir al momento el número que pidas, si aún queda. Busca uno en el ${link(U.outlets, "buscador de puntos de venta")}.`,
      "**La red de venta complementaria** de Loteries de Catalunya, formada principalmente por supermercados.",
      `**La web y la app de Loteries de Catalunya** (${link(U.home, "loteriesdecatalunya.cat")}), que venden las cinco series electrónicas, las mismas que imprimen los terminales de los puntos de venta. Hay que registrarse, estar empadronado en Cataluña y tener la cuenta bancaria en una oficina de Cataluña.`,
    ],
    buyAfter: [
      "Las loterías de la Generalitat solo se pueden vender en Cataluña, pero cualquier persona, también de fuera o extranjera, puede comprar un billete mientras está en Cataluña, según Loteries de Catalunya. Los menores de edad no pueden jugar (Ley catalana 15/1984 del juego, artículo 9).",
      "**Participaciones.** Las entidades pueden hacer participaciones de La Grossa de Cap d'Any a través de un punto de venta, que les entrega los talonarios sin coste; según la web del juego, antes del 18 de diciembre deben pagar la lotería vendida y devolver las participaciones que no hayan vendido.",
    ],
    checkHeading: "Cómo comprobar si te ha tocado La Grossa",
    check: [
      `**En la web:** la ${link(U.results, "página de resultados de La Grossa")} de Loteries de Catalunya tiene un comprobador de números.`,
      "**En el punto de venta:** cualquier establecimiento con terminal puede validar el billete; los que no tienen terminal no pueden validarlo ni pagarlo.",
      "**Si lo compraste por internet,** el premio se ingresa solo: hasta 400 €, en el monedero de tu cuenta, y más de 400 €, en la cuenta bancaria que registraste.",
    ],
    claimHeading: "Dónde se cobran los premios de La Grossa",
    claim: [
      "**Hasta 120 €:** en cualquier punto de venta con terminal. Si quieren, pueden pagar hasta 1.999,99 €, en efectivo hasta 999,99 € o por transferencia.",
      "**A partir de 50 €:** en cualquier oficina de CaixaBank.",
      `**De cualquier importe:** en la oficina de atención y pago de premios de Loteries de Catalunya, en la calle Enric Granados, 33, de Barcelona, de lunes a viernes de 9:00 a 14:00 (${link(U.contact, "contacto")}).`,
      "**Desde 2.000 €:** hay que llevar el DNI y, para cobrar por transferencia, el certificado de titularidad bancaria.",
    ],
    claimAfter: `**Plazo:** el derecho a cobrar caduca a los 90 días naturales contados desde el día del sorteo, según la ${link(U.payment, "página de pago de premios")}. Para el sorteo de 2025, Loteries de Catalunya dio como último día el 30 de marzo de 2026.`,
    taxHeading: "¿Cuántos impuestos paga un premio de La Grossa?",
    taxIntro: `Los premios de hasta 40.000 € por billete no pagan impuestos. De lo que pasa de 40.000 €, Hacienda se queda el 20%: es el gravamen especial sobre los premios de loterías de la ${link(U.irpf, "ley del IRPF (disposición adicional 33.ª)")}, que también se aplica a las loterías de las comunidades autónomas, y ${link(U.faq, "Loteries de Catalunya")} lo retiene al pagar el premio. En La Grossa de Cap d'Any solo lo pagan el primer y el segundo premio:`,
    taxTable: {
      caption: "Gravamen sobre un billete de 10 € premiado",
      headers: ["Premio del billete", "Gravamen (20% de lo que pasa de 40.000 €)", "Cobras"],
      rows: [
        ["200.000 € (primer premio)", eur(levy(200_000), "es"), eur(200_000 - levy(200_000), "es")],
        ["65.000 € (segundo premio)", eur(levy(65_000), "es"), eur(65_000 - levy(65_000), "es")],
        ["30.000 € (tercer premio) o menos", "0 €", "Todo el premio"],
      ],
    },
    taxAfter: [
      `El gravamen se calcula por billete. Si un billete es de varias personas, los 40.000 € exentos se reparten según la parte de cada una. Como se retiene al cobrar el premio, no hay que hacer ninguna declaración aparte, y estos premios no se suman a la declaración de la renta. Los no residentes en España tienen el mismo gravamen y la misma exención, según la ${link(U.aeatNonResidents, "Agencia Tributaria")}.`,
    ],
    nightHeading: "La Grossa y la Nochevieja: qué pasa el 31 y el 1 de enero",
    night: (c) => [
      `El sorteo no es a medianoche: ${c.time ? `en 2026 es a las ${c.time.time}, y ` : ""}en 2024 y 2025 se hizo hacia la una del mediodía del 31 de diciembre, así que los números premiados se conocen la misma tarde, horas antes de las campanadas. El 31 de diciembre de 2026 es jueves y es laborable; el 1 de enero de 2027, viernes, es festivo en toda Cataluña (${b2link("holidayToday", "es", "¿es festivo hoy?")}).`,
      "No hay prisa para cobrar: el plazo es de 90 días. Los puntos de venta pagan hasta 120 € en su horario, y la oficina de premios de Loteries de Catalunya abre de lunes a viernes de 9:00 a 14:00.",
      `Para la fiesta, el metro toda la noche y qué abre el 1 de enero, mira ${b2link("newYear", "es", "Nochevieja en Barcelona")}.`,
    ],
    aboutHeading: "Qué es La Grossa de Cap d'Any",
    about: [
      "Es el sorteo de fin de año de Loteries de Catalunya, la sociedad pública que gestiona la lotería de la Generalitat (en el DOGC, sus anuncios salen dentro del Departament d'Economia i Finances). En 2024 se celebró la duodécima edición y en 2025, la decimotercera, que repartió 14.087.610 € en premios y premió 273.242 billetes.",
      "Según Loteries de Catalunya, los ingresos de la lotería son de la Generalitat y se destinan a programas sociales: ha transferido más de 307 millones de euros al Departament de Drets Socials i Inclusió para la infancia vulnerable, las personas mayores y las personas con discapacidad.",
    ],
    responsibleTitle: "Juego responsable",
    responsible: "Como recomienda Loteries de Catalunya: juega solo si eres mayor de edad, fíjate un presupuesto antes y practica otras actividades de ocio. Loteries de Catalunya tiene un servicio de atención a la ciudadanía en el 93 707 60 01.",
    faq: (c) => [
      {
        question: "¿Cuándo es el sorteo de La Grossa de Cap d'Any 2026?",
        answer: c.results
          ? `Se celebró el ${c.day}${c.time ? `, a las ${c.time.time}` : ""}.`
          : `El ${c.day}. ${c.time ? `A las ${c.time.time}.` : "La hora aún no se ha anunciado; en 2025 el sorteo empezó a las 13:00, en directo por 3Cat."}`,
      },
      {
        question: "La Grossa de Cap d'Any 2026: ¿cuáles son los números premiados?",
        answer: c.results
          ? numbersLine(c.results, "es")
          : "El sorteo es el 31 de diciembre de 2026. Los resultados se publican en la página de resultados de Loteries de Catalunya, y aquí mismo cuando acaba el sorteo.",
      },
      {
        question: "¿Cuánto toca en La Grossa de Cap d'Any?",
        answer: "El primer premio, La Grossa, es de 200.000 € por billete de 10 €. El segundo es de 65.000 €, el tercero de 30.000 €, los dos cuartos de 10.000 € y los tres quintos de 5.000 €, y también cobran el número anterior y el posterior y las terminaciones.",
      },
      { question: "¿Cuánto cuesta un billete de La Grossa de Cap d'Any?", answer: "10 €. Cada número tiene 35 billetes (series)." },
      {
        question: "¿Dónde se puede comprar La Grossa de Cap d'Any?",
        answer: "En los puntos de venta de Loteries de Catalunya (estancos, librerías, quioscos, bares...), en su red complementaria, sobre todo supermercados, y en la web y la app de Loteries de Catalunya, hasta las 11:00 del 31 de diciembre.",
      },
      {
        question: "¿Cómo sé si me ha tocado La Grossa?",
        answer: "Con el comprobador de la página de resultados de la web de Loteries de Catalunya, o en cualquier punto de venta con terminal.",
      },
      {
        question: "¿Dónde se cobran los premios de La Grossa de Cap d'Any?",
        answer: "Hasta 120 €, en cualquier punto de venta con terminal; a partir de 50 €, en CaixaBank; de cualquier importe, en la oficina de Loteries de Catalunya de la calle Enric Granados, 33, de Barcelona. El plazo es de 90 días.",
      },
      {
        question: "¿Cuánto se lleva Hacienda del primer premio de La Grossa?",
        answer: `${eur(levy(200_000), "es")}: el 20% de los 160.000 € que pasan de 40.000 €. De un billete de 200.000 € cobras ${eur(200_000 - levy(200_000), "es")}. Los premios de hasta 40.000 € no pagan.`,
      },
      {
        question: "¿Se puede jugar a La Grossa desde fuera de Cataluña?",
        answer: "Los billetes solo se venden en Cataluña, pero los puede comprar cualquier persona que esté allí. Por internet hay que estar empadronado en Cataluña y tener la cuenta bancaria en una oficina de Cataluña.",
      },
    ],
  },

  /* ------------------------------------------------------------------ en */
  en: {
    names: NAMES.en,
    lead: (c) => {
      if (c.results) {
        const r = c.results;
        return `**${r.first} is La Grossa de Cap d'Any 2026, the first prize: €200,000 per €10 ticket.** The second prize is ${r.second} (€65,000) and the third ${r.third} (€30,000). Fourth prizes (€10,000): ${join([...r.fourth], "en")}. Fifth prizes (€5,000): ${join([...r.fifth], "en")}. Check your ticket against the ${link(r.source.url, "official Loteries de Catalunya results")}.`;
      }
      const time = c.time
        ? `The draw is at ${c.time.time}, according to ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.`
        : `The 2026 draw time has not been announced yet (${c.checked}); in 2025 it began at 13:00, live on 3Cat.`;
      return `**La Grossa de Cap d'Any 2026 is drawn on ${c.dayNoYear}, and the first prize is €200,000 per €10 ticket.** It is the Catalan government's New Year's Eve lottery: 100,000 numbers, from 00000 to 99999, with 35 tickets of each number, and eight winning numbers. ${time} Once the draw is over, all the winning numbers will be here.`;
    },
    keyFactsTitle: "La Grossa de Cap d'Any 2026 at a glance",
    keyFacts: (c) => [
      ...(c.results
        ? [
            { label: "2026 first prize", value: `${c.results.first} (€200,000 per ticket)` },
            ...(c.results.firstSoldIn ? [{ label: "First prize sold in", value: c.results.firstSoldIn }] : []),
            { label: "Second and third prizes", value: `${c.results.second} (€65,000) and ${c.results.third} (€30,000)` },
            { label: "Fourth and fifth prizes", value: `${join([...c.results.fourth], "en")} (€10,000); ${join([...c.results.fifth], "en")} (€5,000)` },
          ]
        : [
            { label: "Draw date", value: c.day },
            { label: "Time", value: c.time ? c.time.time : "Not announced yet (13:00 in 2025)" },
            { label: "First prize", value: "€200,000 per ticket (La Grossa)" },
            { label: "Other big prizes", value: "Second €65,000, third €30,000, two fourth prizes of €10,000 and three fifth prizes of €5,000" },
          ]),
      { label: "Price", value: "€10 a ticket" },
      { label: "Numbers", value: "100,000 (00000 to 99999), with 35 series of each number" },
      { label: "On sale", value: "From 12 September until 11:00 on 31 December 2026" },
      { label: "Deadline to claim", value: "90 days from the draw" },
    ],
    data: (c) =>
      c.results
        ? "The winning numbers are those published by Loteries de Catalunya; if there were ever a difference, the official result stands. The rules and prizes come from the agreement published in the DOGC (the Catalan official gazette) on 8 April 2026 and from the Loteries de Catalunya website."
        : `Everything here comes from Loteries de Catalunya's agreement published in the DOGC (the Catalan official gazette) on 8 April 2026, the Loteries de Catalunya website and press releases, 3Cat (which broadcasts the draw) and Spain's income tax law. ${c.time ? "" : "The 2026 draw time has not been published yet. "}Whatever happened in 2024 and 2025 always carries its year.`,
    resultsHeading: (c) => (c.results ? "La Grossa de Cap d'Any 2026 winning numbers" : "La Grossa de Cap d'Any 2026 results"),
    resultsPending: (c) => [
      `The draw is on ${c.day}. The winning numbers are published on the ${link(U.results, "Loteries de Catalunya results page")}, which has a number checker, and we will add them here as soon as the draw is over.`,
      `**The 2025 results**, for reference: the first prize was ${RESULTS_2025.first}, sold in full in El Vendrell (all 35 tickets, €7 million); second ${RESULTS_2025.second}; third ${RESULTS_2025.third}; the fourth prizes ${join([...RESULTS_2025.fourth], "en")}; and the fifth prizes ${join([...RESULTS_2025.fifth], "en")}, according to ${link(U.press2025, "Loteries de Catalunya")}.`,
    ],
    resultsTable: {
      caption: "La Grossa de Cap d'Any 2026 winning numbers and prize per €10 ticket",
      headers: ["Prize", "Number", "Per ticket", "Number before and after", "Endings"],
      note: "Source: Loteries de Catalunya. If there were ever a difference, the official result stands.",
    },
    neighboursCell: (prev, next, amount) => `${prev} and ${next}: ${amount}`,
    endingsCell: (number, prize) =>
      [
        `ending in ${number.slice(1)}: ${eur(prize.last4, "en")}`,
        `in ${number.slice(2)}: ${eur(prize.last3, "en")}`,
        `in ${number.slice(3)}: ${eur(prize.last2, "en")}`,
        ...(prize.last1 ? [`in ${number.slice(4)}: ${eur(prize.last1, "en")} (money back)`] : []),
      ].join("; "),
    resultsAfter: (c) => [
      "Only the highest category is paid for any one winning number (a ticket with the last four digits of the first prize gets €1,000, not the €250 for the last three as well), but if a ticket matches different winning numbers, the prizes add up.",
      `Check your ticket on the ${link(c.results?.source.url ?? U.results, "Loteries de Catalunya results page")} or at any outlet with a terminal, and see below where each prize is paid and how it is taxed.`,
    ],
    whenHeading: "When is the La Grossa de Cap d'Any 2026 draw, and at what time?",
    when: (c) => [
      c.results
        ? `The draw took place on **${c.day}**, as set by Loteries de Catalunya's agreement published in the ${link(U.dogc2026, "DOGC on 8 April 2026")}.${
            c.time ? ` It began at ${c.time.time}, according to ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}.` : ""
          } The winning numbers are in the results table at the top of this page.`
        : `The draw is on **${c.day}**, under Loteries de Catalunya's agreement published in the ${link(U.dogc2026, "DOGC on 8 April 2026")}. ${
            c.time
              ? `It is at ${c.time.time}, according to ${link(c.time.source.url, c.time.source.publisher ?? c.time.source.name)}; ${PAST_TIMES.en}.`
              : `The time has not been announced yet (${c.checked}): ${PAST_TIMES.en}, live on 3Cat.`
          }`,
      `In 2024 Loteries de Catalunya announced the time and presenters on 19 December in a ${link(U.press2024, "press release")}: the programme was broadcast on 3Cat and TV3 from the studios in Sant Joan Despí. In 2025, ${link(U.tv2025, "according to 3Cat")}, the draw began at 13:00, presented by Llucià Ferrer and Nerea Sanfe. Loteries de Catalunya's FAQ says that, unlike the draws made with a random number generator, La Grossa de Cap d'Any is drawn in the TVC (Catalan public television) studios.`,
      `**Until when can you buy?** In 2024 tickets were on sale until 11:00 on 31 December itself, through every channel, and for 2026 the ${link(U.sales2026, "Loteries de Catalunya sales system")} also closes at 11:00 on 31 December.`,
    ],
    drawHeading: "How the draw works: eight draws, with La Grossa last",
    drawIntro: "Eight five-digit numbers are drawn, and the first prize comes out last. The order is set by the agreement published in the DOGC:",
    drawOrder: [
      "**1st, 2nd and 3rd draws:** the three fifth prizes (€5,000 a ticket).",
      "**4th and 5th draws:** the two fourth prizes (€10,000).",
      "**6th draw:** the third prize (€30,000).",
      "**7th draw:** the second prize (€65,000).",
      "**8th draw:** the first prize, La Grossa (€200,000).",
    ],
    drawRules: [
      "The eight numbers are all different: if a number comes out twice, it keeps the higher category and a new number is drawn for the lower one. A ticket wins when its last digits match those of a winning number, read from right to left, or when it is the number just before or after a winning number (the one after 99999 is 00000, and the one before 00000 is 99999).",
      "Only the highest prize is paid for any one winning number: a ticket with the last four digits of the first prize gets €1,000, not the €250 for the last three as well. If a ticket matches different winning numbers, though, the prizes add up.",
    ],
    prizesHeading: "La Grossa de Cap d'Any 2026 prizes",
    prizesIntro:
      "There are five big prizes: the first, La Grossa, at €200,000 per ticket; the second at €65,000; the third at €30,000; two fourth prizes of €10,000 and three fifth prizes of €5,000. Each number has 35 tickets (series) and prizes are per ticket, so an outlet that sells every ticket of a number shares out the whole prize. In 2025 a tobacconist's in El Vendrell sold all 35 tickets of the first prize: €7 million.",
    prizeTable: {
      caption: "Prizes per €10 ticket (agreement published in the DOGC on 8 April 2026)",
      headers: ["Prize", "Numbers", "All 5 digits", "Number before and after", "Last 4 digits", "Last 3", "Last 2"],
      note: "On top of that, every ticket ending in the same digit as the first prize gets its €10 back.",
    },
    prizesAfter: `The agreement sets aside ${PRIZE_SHARE.replace(",", ".")}% of the value of the tickets issued for prizes. The odds of each prize are on the ${link(U.game, "Loteries de Catalunya game page")} (in Catalan and Spanish).`,
    buyHeading: "Where to buy La Grossa de Cap d'Any: official channels only",
    buyIntro: "Sales opened on 12 September 2026. There are three official channels:",
    buy: [
      `**Loteries de Catalunya outlets:** tobacconists (estancs), bookshops, kiosks, bars and other authorised shops. Those with a terminal can print the number you ask for on the spot, if it is still available. Find one with the ${link(U.outlets, "outlet finder")}.`,
      "**Loteries de Catalunya's complementary sales network**, made up mainly of supermarkets.",
      `**The Loteries de Catalunya website and app** (${link(U.home, "loteriesdecatalunya.cat")}), which sell the five electronic series, the same ones outlet terminals print. You have to register, be on the local population register (empadronat) in Catalonia and have a bank account at a branch in Catalonia.`,
    ],
    buyAfter: [
      "The Catalan government's lotteries can only be sold in Catalonia, but anyone, including visitors from elsewhere in Spain or abroad, can buy a ticket while they are in Catalonia, according to Loteries de Catalunya. Under-18s may not play (Catalan Gaming Act 15/1984, article 9).",
      "**Shares for groups.** Clubs and associations can sell shares (participacions) of La Grossa de Cap d'Any through an outlet, which supplies the books free of charge; according to the game page, they must pay for what they sold and return unsold shares before 18 December.",
    ],
    checkHeading: "How to check whether your La Grossa ticket has won",
    check: [
      `**Online:** the ${link(U.results, "La Grossa results page")} on the Loteries de Catalunya website has a number checker.`,
      "**At an outlet:** any shop with a terminal can validate the ticket; those without one can neither validate nor pay it.",
      "**If you bought it online,** the prize is paid in automatically: up to €400 into your account's wallet, more than €400 into the bank account you registered.",
    ],
    claimHeading: "Where to collect a La Grossa prize",
    claim: [
      "**Up to €120:** at any outlet with a terminal. Outlets may choose to pay up to €1,999.99, in cash up to €999.99 or by bank transfer.",
      "**From €50:** at any CaixaBank branch.",
      `**Any amount:** at Loteries de Catalunya's prize office, Carrer d'Enric Granados 33, Barcelona, Monday to Friday 9:00 to 14:00 (${link(U.contact, "contact details")}).`,
      "**From €2,000:** bring your ID (DNI) and, to be paid by transfer, a certificate from your bank showing you own the account.",
    ],
    claimAfter: `**Deadline:** the right to a prize expires 90 calendar days after the draw, according to the ${link(U.payment, "prize payment page")}. For the 2025 draw, Loteries de Catalunya gave 30 March 2026 as the last day.`,
    taxHeading: "How much tax is paid on a La Grossa prize?",
    taxIntro: `Prizes up to €40,000 per ticket are tax-free. On the part above €40,000 the Spanish tax office takes 20%: this is the special levy on lottery prizes in ${link(U.irpf, "Spain's income tax law (additional provision 33)")}, which also covers the regional lotteries, and ${link(U.faq, "Loteries de Catalunya")} withholds it when it pays the prize. In La Grossa de Cap d'Any only the first and second prizes pay it:`,
    taxTable: {
      caption: "Levy on a winning €10 ticket",
      headers: ["Ticket's prize", "Levy (20% of the part above €40,000)", "You receive"],
      rows: [
        ["€200,000 (first prize)", eur(levy(200_000), "en"), eur(200_000 - levy(200_000), "en")],
        ["€65,000 (second prize)", eur(levy(65_000), "en"), eur(65_000 - levy(65_000), "en")],
        ["€30,000 (third prize) or less", "€0", "The whole prize"],
      ],
    },
    taxAfter: [
      `The levy is worked out per ticket. If several people own a ticket, the €40,000 exemption is split according to each person's share. Because it is withheld when the prize is paid, no separate return is needed, and these prizes are not added to the Spanish income tax return. People who are not resident in Spain pay the same levy with the same exemption, and may be able to reclaim it under a tax treaty, according to the ${link(U.aeatNonResidents, "Spanish Tax Agency")}.`,
    ],
    nightHeading: "La Grossa and New Year's Eve: what happens on the 31st and 1 January",
    night: (c) => [
      `The draw is not at midnight: ${c.time ? `in 2026 it is at ${c.time.time}, and ` : ""}in 2024 and 2025 it was held around 13:00 on 31 December, so the winning numbers are known the same afternoon, hours before the midnight chimes. 31 December 2026 is a Thursday and a working day; 1 January 2027, a Friday, is a public holiday across Catalonia (${b2link("holidayToday", "en", "is today a holiday?")}).`,
      "There is no rush to claim: you have 90 days. Outlets pay up to €120 during their opening hours, and the Loteries de Catalunya prize office opens Monday to Friday, 9:00 to 14:00.",
      `For the celebrations, the all-night metro and what is open on 1 January, see ${b2link("newYear", "en", "New Year's Eve in Barcelona")}.`,
    ],
    aboutHeading: "What is La Grossa de Cap d'Any?",
    about: [
      "It is the year-end draw of Loteries de Catalunya, the public company that runs the Catalan government's lottery (the DOGC lists its notices under the Department of the Economy and Finance). The 2024 draw was the twelfth and the 2025 draw the thirteenth, which paid out €14,087,610 in prizes on 273,242 winning tickets.",
      "According to Loteries de Catalunya, lottery income belongs to the Generalitat and funds social programmes: it has transferred more than €307 million to the Department of Social Rights and Inclusion for vulnerable children, older people and people with disabilities.",
    ],
    responsibleTitle: "Play responsibly",
    responsible: "As Loteries de Catalunya advises: only play if you are over 18, set yourself a budget beforehand and make time for other pastimes. Loteries de Catalunya's public helpline is 93 707 60 01 (Catalan and Spanish).",
    faq: (c) => [
      {
        question: "When is the La Grossa de Cap d'Any 2026 draw?",
        answer: c.results
          ? `It took place on ${c.day}${c.time ? `, at ${c.time.time}` : ""}.`
          : `On ${c.day}. ${c.time ? `At ${c.time.time}.` : "The time has not been announced yet; in 2025 the draw began at 13:00, live on 3Cat."}`,
      },
      {
        question: "What are the La Grossa de Cap d'Any 2026 winning numbers?",
        answer: c.results
          ? numbersLine(c.results, "en")
          : "The draw is on 31 December 2026. The winning numbers are published on the Loteries de Catalunya results page, and here as soon as the draw is over.",
      },
      {
        question: "How much can you win on La Grossa de Cap d'Any?",
        answer: "The first prize, La Grossa, is €200,000 per €10 ticket. The second is €65,000, the third €30,000, the two fourth prizes €10,000 and the three fifth prizes €5,000, and the numbers either side and matching endings also win.",
      },
      { question: "How much is a La Grossa de Cap d'Any ticket?", answer: "€10. Each number has 35 tickets (series)." },
      {
        question: "Where can I buy La Grossa de Cap d'Any tickets?",
        answer: "At Loteries de Catalunya outlets (tobacconists, bookshops, kiosks, bars...), in its complementary network, mostly supermarkets, and on the Loteries de Catalunya website and app, until 11:00 on 31 December.",
      },
      {
        question: "How do I check my La Grossa ticket?",
        answer: "With the number checker on the results page of the Loteries de Catalunya website, or at any outlet with a terminal.",
      },
      {
        question: "Where do I collect a La Grossa prize?",
        answer: "Up to €120 at any outlet with a terminal; from €50 at CaixaBank; any amount at the Loteries de Catalunya office, Carrer d'Enric Granados 33, Barcelona. You have 90 days.",
      },
      {
        question: "Is the La Grossa first prize taxed?",
        answer: `Yes: ${eur(levy(200_000), "en")}, 20% of the €160,000 above €40,000, so a €200,000 ticket pays out ${eur(200_000 - levy(200_000), "en")}. Prizes up to €40,000 are tax-free.`,
      },
      {
        question: "Can tourists play La Grossa?",
        answer: "Yes, while they are in Catalonia: tickets are only sold there, but anyone can buy one. Buying online requires being registered as a resident in Catalonia and a bank account at a branch in Catalonia.",
      },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["newYear", "christmasBarcelona", "christmasTraditions", "shops", "holidayToday", "workCalendar"] as const;

function heading(level: 2 | 3, text: string, id?: string): Block {
  return { type: "heading", level, text, ...(id ? { id } : {}) } as Block;
}

function resultsRows(r: GrossaResults, locale: Locale): string[][] {
  const t = COPY[locale];
  const rows: string[][] = [];
  const add = (category: Category, number: string) => {
    const prize = PRIZES[category];
    const [prev, next] = neighbours(number);
    rows.push([
      t.names[category].one,
      `**${number}**`,
      eur(prize.five, locale),
      t.neighboursCell(prev, next, eur(prize.neighbours, locale)),
      t.endingsCell(number, prize),
    ]);
  };
  add("first", r.first);
  add("second", r.second);
  add("third", r.third);
  for (const number of r.fourth) add("fourth", number);
  for (const number of r.fifth) add("fifth", number);
  return rows;
}

function prizeRows(locale: Locale): string[][] {
  const t = COPY[locale];
  return CATEGORY_ORDER.map((category) => {
    const p = PRIZES[category];
    return [
      p.count > 1 ? t.names[category].many : t.names[category].one,
      String(p.count),
      eur(p.five, locale),
      eur(p.neighbours, locale),
      eur(p.last4, locale),
      eur(p.last3, locale),
      eur(p.last2, locale),
    ];
  });
}

export function buildGrossaBody(
  locale: Locale,
  results: GrossaResults | null = RESULTS_2026,
  time: DrawTime | null = DRAW_TIME_2026,
  asOf: string = GROSSA_AS_OF,
): Block[] {
  const t = COPY[locale];
  const c: Ctx = {
    locale,
    results,
    time,
    day: dayDate(GROSSA_DRAW_DATE, locale),
    dayNoYear: dayDate(GROSSA_DRAW_DATE, locale, false),
    checked: dateYear(asOf, locale),
  };

  const blocks: Block[] = [];
  blocks.push(lead(t.lead(c)));
  blocks.push(keyFacts(t.keyFactsTitle, t.keyFacts(c)));
  blocks.push(callout("official", verifiedLine(locale, asOf), t.data(c)));

  // The results first: on 31 December and 1 January that is what people came for.
  blocks.push(heading(2, t.resultsHeading(c), "resultats"));
  if (results) {
    blocks.push(table(t.resultsTable.caption, t.resultsTable.headers, resultsRows(results, locale), t.resultsTable.note));
    blocks.push(...paras(...t.resultsAfter(c)));
  } else {
    blocks.push(...paras(...t.resultsPending(c)));
  }

  blocks.push(...h2(t.whenHeading, ...t.when(c)));

  blocks.push(...h2(t.drawHeading, t.drawIntro));
  blocks.push(list(...t.drawOrder));
  blocks.push(...paras(...t.drawRules));

  blocks.push(...h2(t.prizesHeading, t.prizesIntro));
  blocks.push(table(t.prizeTable.caption, t.prizeTable.headers, prizeRows(locale), t.prizeTable.note));
  blocks.push(...paras(t.prizesAfter));

  blocks.push(...h2(t.buyHeading, t.buyIntro));
  blocks.push(list(...t.buy));
  blocks.push(...paras(...t.buyAfter));

  blocks.push(heading(2, t.checkHeading));
  blocks.push(list(...t.check));

  blocks.push(heading(2, t.claimHeading));
  blocks.push(list(...t.claim));
  blocks.push(...paras(t.claimAfter));

  blocks.push(...h2(t.taxHeading, t.taxIntro));
  blocks.push(table(t.taxTable.caption, t.taxTable.headers, t.taxTable.rows));
  blocks.push(...paras(...t.taxAfter));

  blocks.push(...h2(t.nightHeading, ...t.night(c)));

  blocks.push(...h2(t.aboutHeading, ...t.about));
  blocks.push(callout("info", t.responsibleTitle, t.responsible));

  blocks.push(faq(t.faq(c).map((item) => ({ question: item.question, answer: strip(item.answer) }))));
  blocks.push(...paras(verifiedLine(locale, GROSSA_VERIFIED)));
  blocks.push(...b2Related([...RELATED], locale));
  return blocks;
}

/* -------------------------------------------------------------------------- */
/* Article                                                                    */
/* -------------------------------------------------------------------------- */

export function buildGrossaArticle(
  results: GrossaResults | null = RESULTS_2026,
  time: DrawTime | null = DRAW_TIME_2026,
  asOf: string = GROSSA_AS_OF,
): B2Article {
  return {
    key: "grossa",
    entryKey: "guide-la-grossa-cap-d-any-2026",
    categoryKey: "festivals",
    sources: grossaSources(results, time),
    // No new photograph: the shops guide's second picture (also the December
    // bridge's hero), with that article's exact alt text and caption, since
    // media rows are keyed by file and other wording would overwrite them.
    heroKey: SHOPS.secondaryKey,
    heroAlt: SHOPS.secondaryAlt,
    heroCaption: SHOPS.secondaryCaption,
    verifiedAt: asOf,
    publishedAt: "2026-10-30T20:00:00+01:00",
    editions: Object.fromEntries(
      (["ca", "es", "en"] as Locale[]).map((locale) => [
        locale,
        {
          ...GROSSA_META[locale],
          seoTitle: grossaSeoTitle(locale, results),
          seoDescription: grossaDescription(locale, results),
          blocks: buildGrossaBody(locale, results, time, asOf),
        },
      ]),
    ) as B2Article["editions"],
  };
}

export const GROSSA: B2Article = buildGrossaArticle();
