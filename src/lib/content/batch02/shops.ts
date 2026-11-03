import type { Locale } from "@/lib/i18n/config";
import { weekdayDayMonth } from "@/lib/programmatic/holidays/format";
import { joinList } from "@/lib/programmatic/holidays/names";

import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Shops open on Sundays and holidays in Catalonia: the yearly calendar.
 *
 * Re-checked on 24 Oct 2026 against the DOGC texts themselves (Ordre EMT/77/2025
 * for 2026, Resolució EMT/4342/2025 for the 2026 municipal days, Ordre
 * EMT/89/2026 for 2027), the BOE consolidated text of Llei 18/2017 (in force
 * from 1 Jan 2026) and Barcelona City Council's 2026 timetable sheet.
 *
 * Fixed on 24 Oct: the "75 hours a week" limit was removed - art. 36.2.b was
 * declared void by STC 117/2022. The "sales traditionally start on 7 January"
 * line was removed: the Agència Catalana del Consum gives no date, only that
 * the Consell Assessor recommends dates each year. Added from the texts: 1 Nov
 * 2026 is an opening day only in l'Ametlla del Vallès and Mollet del Vallès
 * (Resolució EMT/4342/2025); the art. 37 exclusions (bakeries,
 * convenience stores, pharmacies...) are outside the art. 36
 * limits; the 2027 order's consecutive-holidays rule (art. 4.2) and the food
 * retailers' three-date swap (art. 6).
 *
 * The 2027 municipal days are not published yet (councils had until 1 Nov
 * 2026; the DOGC list came out on 27 Nov last year): the page says so and
 * gives the default that applies when a council chooses none.
 *
 * 30 Oct 2026 (top-3 push):
 * - Resolució EMT/4342/2025 re-read in full: every one of its 83
 *   municipalities compared with the default November-December days
 *   (29 Nov; 6, 8, 13, 20, 27 Dec). The 30 that differ are in
 *   TOWNS_NOV_DEC below, transcribed from the DOGC text (several lists print
 *   "6, 8,13" without a space: La Garriga, Masquefa, Pallejà, Piera and Roda
 *   de Ter keep all six days; Sallent prints "6,13" and drops the 8th).
 * - Art. 37.1.j and 37.1.k of Llei 18/2017 (shops of up to 300 m² selling
 *   everyday food, and SME shops of up to 300 m²) ARE in force: STC 117/2022
 *   voided the 2017 wording, and Llei 3/2023, art. 83 (BOE-A-2023-10344)
 *   added both letters back; the BOE consolidated text prints them. The
 *   24 Oct note that removed them from this page was wrong; they are back in
 *   the "always open" list.
 *
 * 30 Oct 2026 (CTR sweep wave 4, logged in docs/SEO_EXPERIMENTS.md): the CA
 * title in the searchers' words ("festius obertura comercial 2026", "festius
 * oberts", "diumenges oberts 2026"), like the ES one, and a first FAQ for
 * "quins festius d'obertura queden". No new facts: the dates and the count
 * are the ones above.
 *
 * 3 Nov 2026 (CTR sweep): CTR rose from 1.8 % to about 3.3 % after the
 * 30 Oct title, still below the curve at position 4.4. The visible queries
 * say "botigues obertes" ("botigues obertes avui a barcelona 2026",
 * "diumenges botigues obertes 2026", "botigues obertes diumenge
 * barcelona"), words the title dropped. The title is kept (inside its
 * window); the CA description now opens with "Botigues obertes diumenges i
 * festius 2026" and the Barcelona days left. Same dates, same count.
 *
 * 3 Nov 2026 (29N and Christmas push, owner request; logged in
 * docs/SEO_EXPERIMENTS.md): the first screen answers the dated questions of
 * the next weeks. Read again on 3 Nov, all on the official text: Ordre
 * EMT/77/2025 art. 1 and 6; Resolució EMT/4342/2025 (defaults, Barcelona,
 * Gironella, Martorell, Salt); Ordre EMT/89/2026 arts. 1-6; Llei 18/2017
 * arts. 36.2.a/c/d and 37.1 (BOE consolidated text, last update 31.12.2025);
 * Ordre EMT/66/2025 and Ordre EMT/52/2026 (24 and 31 Dec 2026 and 5 Jan 2027
 * are not public holidays); RD 605/1999 art. 13.1 (up to four paid hours to
 * vote); Barcelona's commerce page and its 2026 sheet (no 2027 days, ZGAT
 * 15 May-15 Sep only) and its holiday calendar (local days 25 May and
 * 24 Sep 2026, 17 May and 24 Sep 2027). Not published on 3 Nov: the DOGC
 * list of 2027 municipal days and swaps (every DOGC title from 14 Oct to
 * 3 Nov scanned), the art. 6.3 list of food retailers' swaps, Barcelona's
 * 2027 days.
 * - Sunday 29 November is polling day of the general election (RD 806/2026)
 *   and an opening day in the general calendar; no rule makes polling day a
 *   closing day (art. 36.2.d lists the closing days). Three towns swapped it.
 * - The "date -> can shops open?" table (NEXT_WEEKS) replaces the "days left
 *   in 2026" table; its exceptions are computed from TOWNS_NOV_DEC.
 * - Friday 27 November is an ordinary working day; the page does not name
 *   the retail promotion of that week (the Black Friday rule in the tests).
 */

const VERIFIED = "2026-11-03";

const SOURCES: B2Source[] = [
  { name: "Ordre EMT/77/2025, calendari d'obertura comercial en diumenges i festius per al 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1015009&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Resolució EMT/4342/2025, dies festius d'obertura comercial dels municipis per al 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1030324&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Ordre EMT/89/2026, calendari d'obertura comercial en diumenges i festius per al 2027", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1045357&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Llei 18/2017, de comerç, serveis i fires (text consolidat, articles 36 i 37)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11320", publisher: "BOE" },
  { name: "Llei 3/2023, de mesures fiscals, financeres, administratives i del sector públic per al 2023 (article 83: lletres j i k de l'article 37.1 de la Llei 18/2017)", url: "https://www.boe.es/buscar/doc.php?id=BOE-A-2023-10344", publisher: "BOE" },
  { name: "Ordre EMT/66/2025, calendari oficial de festes laborals a Catalunya per a l'any 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1013204&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Ordre EMT/52/2026, calendari oficial de festes laborals a Catalunya per a l'any 2027", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1040896&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Real Decreto 605/1999, de regulación complementaria de los procesos electorales (artículo 13: horas para votar)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1999-8583", publisher: "BOE" },
  { name: "Horaris comercials", url: "https://ajuntament.barcelona.cat/comerc/ca/el-comerc-barcelona/horaris-comercials", publisher: "Ajuntament de Barcelona" },
  { name: "Calendari de festius (festes locals 2026 i 2027)", url: "https://ajuntament.barcelona.cat/calendarifestius/ca/", publisher: "Ajuntament de Barcelona" },
  { name: "Horaris comercials 2026", url: "https://ajuntament.barcelona.cat/comerc/sites/default/files/2026-01/Horaris%20Comercial%202026.pdf", publisher: "Ajuntament de Barcelona" },
  { name: "Rebaixes", url: "https://consum.gencat.cat/ca/els-meus-drets/rebaixes/", publisher: "Agència Catalana del Consum" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/botigues-obertes-festius-catalunya",
    title: "Botigues obertes en diumenges i festius a Catalunya: calendari 2026 i 2027",
    seoTitle: "Botigues obertes a Barcelona: diumenge 29 nov i desembre",
    seoDescription:
      "Diumenge 29 de novembre, dia d'eleccions: sí que poden obrir a Barcelona i Catalunya. Al desembre, 6, 8, 13, 20 i 27; 25 i 26, no. 30 municipis canvien.",
    excerpt:
      "Els diumenges i festius en què les botigues poden obrir a Catalunya, segons el DOGC: el que queda del 2026, el calendari del 2027 i les botigues que poden obrir sempre.",
  },
  es: {
    path: "guias/tiendas-abiertas-festivos-cataluna",
    title: "Tiendas abiertas en domingos y festivos en Cataluña: calendario 2026 y 2027",
    seoTitle: "Tiendas abiertas en Barcelona: domingo 29 nov y diciembre",
    seoDescription:
      "Domingo 29 de noviembre, día de elecciones: sí pueden abrir en Barcelona y Cataluña. En diciembre, 6, 8, 13, 20 y 27; 25 y 26, no. 30 municipios cambian.",
    excerpt:
      "Los domingos y festivos en que las tiendas pueden abrir en Cataluña, según el DOGC: lo que queda de 2026, el calendario de 2027 y las tiendas que pueden abrir siempre.",
  },
  en: {
    path: "guides/shops-open-sundays-holidays-catalonia",
    title: "Shops open on Sundays and holidays in Catalonia: 2026 and 2027 dates",
    seoTitle: "Are shops open on Sunday in Barcelona? 29 Nov and December",
    seoDescription:
      "Sunday 29 November, election day: yes, shops may open in Barcelona and Catalonia. In December: 6, 8, 13, 20 and 27, not 25-26. The 30 towns that differ.",
    excerpt:
      "The Sundays and holidays when shops may open in Catalonia, from the official gazette: what is left of 2026, the 2027 calendar and the shops that may always open.",
  },
};

type Row = [Record<Locale, string>, Record<Locale, string>];

const D = (ca: string, es: string, en: string) => ({ ca, es, en });

/** Ordre EMT/89/2026, article 1, and the article 5 default municipal days. */
const DAYS_2027: Row[] = [
  [D("Diumenge 3 de gener", "Domingo 3 de enero", "Sunday 3 January"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 10 de gener", "Domingo 10 de enero", "Sunday 10 January"), D("Dia municipal per defecte", "Día municipal por defecto", "Default municipal day")],
  [D("Diumenge 27 de juny", "Domingo 27 de junio", "Sunday 27 June"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Dilluns 1 de novembre", "Lunes 1 de noviembre", "Monday 1 November"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 28 de novembre", "Domingo 28 de noviembre", "Sunday 28 November"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 5 de desembre", "Domingo 5 de diciembre", "Sunday 5 December"), D("Dia municipal per defecte", "Día municipal por defecto", "Default municipal day")],
  [D("Dilluns 6 de desembre", "Lunes 6 de diciembre", "Monday 6 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Dimecres 8 de desembre", "Miércoles 8 de diciembre", "Wednesday 8 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 12 de desembre", "Domingo 12 de diciembre", "Sunday 12 December"), D("Calendari general", "Calendario general", "General calendar")],
  [D("Diumenge 19 de desembre", "Domingo 19 de diciembre", "Sunday 19 December"), D("Calendari general", "Calendario general", "General calendar")],
];

/**
 * The same 2027 days as dates, for the pages that reason about them (the
 * Easter 2027 guide): Ordre EMT/89/2026, art. 1 (general) and art. 5 (the
 * default municipal pair). A test holds them to the table above.
 */
export const OPENING_2027 = {
  general: ["2027-01-03", "2027-06-27", "2027-11-01", "2027-11-28", "2027-12-06", "2027-12-08", "2027-12-12", "2027-12-19"],
  municipalDefault: ["2027-01-10", "2027-12-05"],
} as const;

/**
 * Every municipality in Resolució EMT/4342/2025 whose shop opening days from
 * 1 November to 31 December 2026 differ from the default (29 Nov; 6, 8, 13,
 * 20 and 27 Dec): `closed` = default days it does not open, `extra` = days it
 * adds. Transcribed from the DOGC text on 30 Oct 2026.
 */
export const TOWNS_NOV_DEC: { town: string; closed: string[]; extra: string[] }[] = [
  { town: "L'Ametlla del Vallès", closed: [], extra: ["2026-11-01"] },
  { town: "Argentona", closed: ["2026-12-08"], extra: [] },
  { town: "Artés", closed: ["2026-12-08"], extra: [] },
  { town: "Badalona", closed: ["2026-12-08"], extra: [] },
  { town: "Caldes de Montbui", closed: ["2026-12-08"], extra: [] },
  { town: "Cardedeu", closed: ["2026-12-08"], extra: [] },
  { town: "Cassà de la Selva", closed: ["2026-12-08"], extra: [] },
  { town: "Celrà", closed: ["2026-12-08"], extra: [] },
  { town: "Centelles", closed: ["2026-12-08"], extra: ["2026-12-31"] },
  { town: "Gavà", closed: ["2026-12-08"], extra: ["2026-12-14"] },
  { town: "Gironella", closed: ["2026-11-29", "2026-12-27"], extra: [] },
  { town: "Manlleu", closed: ["2026-12-08"], extra: [] },
  { town: "Manresa", closed: ["2026-12-08"], extra: [] },
  { town: "Martorell", closed: ["2026-11-29"], extra: [] },
  { town: "Mollet del Vallès", closed: ["2026-12-08"], extra: ["2026-11-01"] },
  { town: "Montcada i Reixac", closed: ["2026-12-08"], extra: [] },
  { town: "Olèrdola", closed: ["2026-12-08"], extra: [] },
  { town: "Olot", closed: ["2026-12-13"], extra: [] },
  { town: "Riells i Viabrea", closed: ["2026-12-06"], extra: ["2026-11-09"] },
  { town: "Sallent", closed: ["2026-12-08"], extra: [] },
  { town: "Salt", closed: ["2026-11-29"], extra: [] },
  { town: "Sant Andreu de la Barca", closed: [], extra: ["2026-11-30"] },
  { town: "Sant Boi de Llobregat", closed: [], extra: ["2026-12-07"] },
  { town: "Sant Esteve Sesrovires", closed: ["2026-12-08"], extra: [] },
  { town: "Sant Jordi Desvalls", closed: ["2026-12-08"], extra: [] },
  { town: "Sant Vicenç de Castellet", closed: ["2026-12-08"], extra: [] },
  { town: "Santa Coloma de Gramenet", closed: ["2026-12-08"], extra: [] },
  { town: "La Selva del Camp", closed: ["2026-12-08"], extra: [] },
  { town: "Terrassa", closed: ["2026-12-06"], extra: [] },
  { town: "Ulldecona", closed: ["2026-12-08"], extra: [] },
];

/** The towns of TOWNS_NOV_DEC that do not open on a default day. */
export const closedOn = (iso: string): string[] => TOWNS_NOV_DEC.filter((t) => t.closed.includes(iso)).map((t) => t.town);

/** The towns of TOWNS_NOV_DEC that add a day which is not an opening day elsewhere. */
const extraOn = (iso: string): string[] => TOWNS_NOV_DEC.filter((t) => t.extra.includes(iso)).map((t) => t.town);

/** The towns that do not open on Tuesday 8 December, for the lead and the FAQ. */
const NO_8_DEC = closedOn("2026-12-08");

/** The towns that do not open on Sunday 29 November, polling day of the general election (RD 806/2026). */
const NO_29_NOV = closedOn("2026-11-29");

/** Examples of NO_8_DEC named in the lead, the table and the FAQ. */
const NO_8_DEC_EXAMPLES = ["Badalona", "Manresa", "Santa Coloma de Gramenet"];

const YES: Record<Locale, string> = { ca: "**Sí**", es: "**Sí**", en: "**Yes**" };
const NO: Record<Locale, string> = { ca: "**No**", es: "**No**", en: "**No**" };

/**
 * A short list of towns after "excepte a" / "salvo en" / "except in". Catalan
 * repeats the preposition for a pair, so "Riells i Viabrea i a Terrassa"
 * does not read as one name.
 */
function townList(towns: string[], locale: Locale): string {
  return locale === "ca" && towns.length === 2 ? `${towns[0]} i a ${towns[1]}` : joinList(towns, locale);
}

/** "**Sí**, excepte a Gironella, Martorell i Salt", from the towns table. */
function yesExcept(iso: string, locale: Locale): string {
  const towns = closedOn(iso);
  if (!towns.length) return YES[locale];
  const except = { ca: "excepte a", es: "salvo en", en: "except in" }[locale];
  if (towns.length <= 3) return `${YES[locale]}, ${except} ${townList(towns, locale)}`;
  const word = { ca: "municipis, com", es: "municipios, como", en: "towns, such as" }[locale];
  const or = { ca: "o", es: "o", en: "and" }[locale];
  const shown = towns.filter((t) => NO_8_DEC_EXAMPLES.includes(t));
  return `${YES[locale]}, ${except} ${towns.length} ${word} ${shown.slice(0, -1).join(", ")} ${or} ${shown.at(-1)}`;
}

/** "**No**: no són dies d'obertura", naming any town that adds one of the days. */
function noUnless(isos: string[], locale: Locale, why: Record<Locale, string>): string {
  const towns = [...new Set(isos.flatMap(extraOn))];
  const unless = { ca: "excepte a", es: "salvo en", en: "except in" }[locale];
  return towns.length ? `${NO[locale]}: ${why[locale]}, ${unless} ${townList(towns, locale)}` : `${NO[locale]}: ${why[locale]}`;
}

const NOT_OPENING = D("no són dies d'obertura", "no son días de apertura", "not opening days");
const CLOSING = D("tancament obligatori", "cierre obligatorio", "closed by law");
const WORKING = D("Laborable: horari habitual de cada botiga", "Laborable: horario habitual de cada tienda", "Working day: each shop's usual hours");
const GENERAL_2026 = D("Ordre EMT/77/2025, art. 1", "Orden EMT/77/2025, art. 1", "Ordre EMT/77/2025, art. 1");
const ART_36_2_D = D("Llei 18/2017, art. 36.2.d", "Ley 18/2017, art. 36.2.d", "Llei 18/2017, art. 36.2.d");

/**
 * The first-screen table (3 Nov 2026): every date of the next weeks people
 * ask about, with the answer for Catalonia and for Barcelona and the text it
 * comes from. Catalonia-wide exceptions are computed from TOWNS_NOV_DEC.
 * Weekdays: Ordre EMT/66/2025 (2026) and Ordre EMT/52/2026 (2027).
 */
type NextRow = { day: Record<Locale, string>; cat: (l: Locale) => string; bcn: (l: Locale) => string; basis: Record<Locale, string> };

const NEXT_WEEKS: NextRow[] = [
  {
    day: D("Diumenges 8, 15 i 22 de novembre", "Domingos 8, 15 y 22 de noviembre", "Sundays 8, 15 and 22 November"),
    cat: (l) => noUnless(["2026-11-08", "2026-11-15", "2026-11-22"], l, NOT_OPENING),
    bcn: (l) => NO[l],
    basis: D("Ordre EMT/77/2025 (no hi consten)", "Orden EMT/77/2025 (no figuran)", "Ordre EMT/77/2025 (not listed)"),
  },
  {
    day: D("Diumenge 29 de novembre (eleccions generals)", "Domingo 29 de noviembre (elecciones generales)", "Sunday 29 November (general election)"),
    cat: (l) => yesExcept("2026-11-29", l),
    bcn: (l) => YES[l],
    basis: GENERAL_2026,
  },
  {
    day: D("Diumenge 6 de desembre (Constitució)", "Domingo 6 de diciembre (Constitución)", "Sunday 6 December (Constitution Day)"),
    cat: (l) => yesExcept("2026-12-06", l),
    bcn: (l) => YES[l],
    basis: GENERAL_2026,
  },
  {
    day: D("Dimarts 8 de desembre (la Immaculada)", "Martes 8 de diciembre (la Inmaculada)", "Tuesday 8 December (Immaculate Conception)"),
    cat: (l) => yesExcept("2026-12-08", l),
    bcn: (l) => `${YES[l]} ${{ ca: "(dia municipal de Barcelona)", es: "(día municipal de Barcelona)", en: "(Barcelona's municipal day)" }[l]}`,
    basis: D("Resolució EMT/4342/2025; Ordre EMT/77/2025, art. 6", "Resolución EMT/4342/2025; Orden EMT/77/2025, art. 6", "Resolució EMT/4342/2025; Ordre EMT/77/2025, art. 6"),
  },
  {
    day: D("Diumenge 13 de desembre", "Domingo 13 de diciembre", "Sunday 13 December"),
    cat: (l) => yesExcept("2026-12-13", l),
    bcn: (l) => YES[l],
    basis: GENERAL_2026,
  },
  {
    day: D("Diumenge 20 de desembre", "Domingo 20 de diciembre", "Sunday 20 December"),
    cat: (l) => yesExcept("2026-12-20", l),
    bcn: (l) => YES[l],
    basis: GENERAL_2026,
  },
  {
    day: D("Dijous 24 i dijous 31 de desembre", "Jueves 24 y jueves 31 de diciembre", "Thursday 24 and Thursday 31 December"),
    cat: (l) => WORKING[l],
    bcn: (l) => WORKING[l],
    basis: D("Ordre EMT/66/2025 (no són festius)", "Orden EMT/66/2025 (no son festivos)", "Ordre EMT/66/2025 (not public holidays)"),
  },
  {
    day: D("Divendres 25 i dissabte 26 de desembre (Nadal i Sant Esteve)", "Viernes 25 y sábado 26 de diciembre (Navidad y San Esteban)", "Friday 25 and Saturday 26 December (Christmas and St Stephen's Day)"),
    cat: (l) => `${NO[l]}: ${CLOSING[l]}`,
    bcn: (l) => NO[l],
    basis: ART_36_2_D,
  },
  {
    day: D("Diumenge 27 de desembre", "Domingo 27 de diciembre", "Sunday 27 December"),
    cat: (l) => yesExcept("2026-12-27", l),
    bcn: (l) => YES[l],
    basis: GENERAL_2026,
  },
  {
    day: D("Divendres 1 de gener de 2027 (Cap d'Any)", "Viernes 1 de enero de 2027 (Año Nuevo)", "Friday 1 January 2027 (New Year's Day)"),
    cat: (l) => `${NO[l]}: ${CLOSING[l]}`,
    bcn: (l) => NO[l],
    basis: ART_36_2_D,
  },
  {
    day: D("Diumenge 3 de gener de 2027", "Domingo 3 de enero de 2027", "Sunday 3 January 2027"),
    cat: (l) => `${YES[l]}: ${{ ca: "calendari general del 2027 (els canvis de cada municipi encara no s'han publicat)", es: "calendario general de 2027 (los cambios de cada municipio aún no se han publicado)", en: "2027 general calendar (each town's changes are not published yet)" }[l]}`,
    bcn: (l) => `${YES[l]}, ${{ ca: "si l'Ajuntament no l'ha canviat (encara no ho ha publicat)", es: "si el Ayuntamiento no lo ha cambiado (aún no lo ha publicado)", en: "unless the council has swapped it (not published yet)" }[l]}`,
    basis: D("Ordre EMT/89/2026, art. 1", "Orden EMT/89/2026, art. 1", "Ordre EMT/89/2026, art. 1"),
  },
  {
    day: D("Dimarts 5 de gener de 2027 (vigília de Reis)", "Martes 5 de enero de 2027 (víspera de Reyes)", "Tuesday 5 January 2027 (eve of Epiphany)"),
    cat: (l) => WORKING[l],
    bcn: (l) => WORKING[l],
    basis: D("Ordre EMT/52/2026 (no és festiu)", "Orden EMT/52/2026 (no es festivo)", "Ordre EMT/52/2026 (not a public holiday)"),
  },
  {
    day: D("Dimecres 6 de gener de 2027 (Reis)", "Miércoles 6 de enero de 2027 (Reyes)", "Wednesday 6 January 2027 (Epiphany)"),
    cat: (l) => `${NO[l]}: ${CLOSING[l]}`,
    bcn: (l) => NO[l],
    basis: ART_36_2_D,
  },
  {
    day: D("Diumenge 10 de gener de 2027", "Domingo 10 de enero de 2027", "Sunday 10 January 2027"),
    cat: (l) => ({ ca: "Dia per defecte: s'aplica als municipis que no van comunicar els seus dos dies. La llista encara no és al DOGC", es: "Día por defecto: se aplica en los municipios que no comunicaron sus dos días. La lista aún no está en el DOGC", en: "Default day: applies in towns that did not report their two days. The list is not in the DOGC yet" })[l],
    bcn: (l) => ({ ca: "Pendent: Barcelona encara no ha publicat els seus dies del 2027", es: "Pendiente: Barcelona aún no ha publicado sus días de 2027", en: "Pending: Barcelona has not published its 2027 days yet" })[l],
    basis: D("Ordre EMT/89/2026, art. 5", "Orden EMT/89/2026, art. 5", "Ordre EMT/89/2026, art. 5"),
  },
];

type T = {
  lead: string;
  note: string;
  weeksTitle: string;
  weeksCaption: string;
  weeksHeaders: string[];
  weeksNote: string;
  weeksAfter: string;
  electionTitle: string;
  election: string[];
  townsTitle: string;
  townsLead: string;
  townsCaption: string;
  townsHeaders: string[];
  townsNote: string;
  townsSame: string;
  mallsTitle: string;
  malls: string[];
  alwaysTitle: string;
  always: string[];
  alwaysList: string[];
  nextTitle: string;
  nextCaption: string;
  nextHeaders: string[];
  nextNote: string;
  next: string[];
  rulesTitle: string;
  rules: string[];
  calendar: string;
  bcnTitle: string;
  bcn: string[];
  salesTitle: string;
  sales: string[];
  faq: { question: string; answer: string }[];
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: `**Sí: el diumenge 29 de novembre, dia de les eleccions generals, les botigues poden obrir** a Barcelona i a gairebé tota Catalunya, perquè és un dels dies d'obertura del calendari del 2026. Després queden el **6, 8, 13, 20 i 27 de desembre**. El **25 i el 26 de desembre i l'1 i el 6 de gener** són dies de tancament obligatori, i el primer dia d'obertura del calendari general del 2027 és el **diumenge 3 de gener**. ${joinList(NO_29_NOV, "ca")} no obren el 29 de novembre, i ${NO_8_DEC.length} municipis, com ${NO_8_DEC_EXAMPLES.slice(0, -1).join(", ")} o ${NO_8_DEC_EXAMPLES.at(-1)}, no obren el 8 de desembre. A Catalunya les botigues poden obrir deu diumenges o festius l'any: vuit els fixa la Generalitat i dos més cada ajuntament. Les botigues d'alimentació de fins a 300 m², les fleques o les de conveniència, entre d'altres, no tenen aquest límit.`,
    note: "Obrir aquests dies és una opció, no una obligació: cada botiga decideix si obre. Els dos dies municipals canvien d'un poble a un altre.",
    weeksTitle: "Poden obrir les botigues? Del 8 de novembre al 10 de gener, dia per dia",
    weeksCaption: "Diumenges, festius i dies assenyalats del novembre al gener: poden obrir les botigues?",
    weeksHeaders: ["Dia", "Catalunya", "Barcelona", "Base oficial"],
    weeksNote: "«Sí» vol dir que les botigues hi poden obrir, no que hagin d'obrir. D'octubre a maig, cap botiga amb horari general no pot obrir entre les 21.00 i les 6.00 (Llei 18/2017, art. 36.2.a). Un dia laborable pot ser festa local en algun municipi, i llavors compta com a festiu.",
    weeksAfter: "Els dies de «No», hi poden obrir igualment les botigues exemptes de l'horari general: fleques, pastisseries, floristeries, premsa, botigues de conveniència, farmàcies i botigues d'alimentació o de pimes de fins a 300 m², entre d'altres (la llista és més avall). A Barcelona, la zona turística (ZGAT) només amplia l'obertura del 15 de maig al 15 de setembre: del novembre al gener hi valen els mateixos dies que a la resta de la ciutat.",
    electionTitle: "Diumenge 29 de novembre, dia d'eleccions: quines botigues obren",
    election: [
      "El 29 de novembre és alhora la jornada de les eleccions generals i un dels vuit diumenges d'obertura del calendari comercial del 2026 (Ordre EMT/77/2025, article 1). Les eleccions no el converteixen en dia de tancament: la llei de comerç només obliga a tancar l'1 i el 6 de gener, el diumenge i el dilluns de Pasqua, l'1 de maig, el 24 de juny, l'11 de setembre i el 25 i el 26 de desembre (Llei 18/2017, article 36.2.d).",
      `Hi poden obrir totes les botigues, també les grans superfícies i els centres comercials, a Barcelona i a tots els municipis excepte ${joinList(NO_29_NOV, "ca")}, que l'han canviat per un altre dia (Resolució EMT/4342/2025). Poder obrir no vol dir que obrin totes: cada botiga decideix si obre i amb quin horari, sempre entre les 6.00 i les 21.00.`,
      `Qui treballi aquell dia té dret a fins a quatre hores retribuïdes per anar a votar, proporcionals si fa jornada reduïda (Reial decret 605/1999, article 13). Per a la resta de la jornada, mira ${b2link("voting", "ca", "com votar el 29 de novembre, també per correu")}.`,
    ],
    townsTitle: "Botigues obertes el 8 de desembre i els diumenges de desembre: municipis que canvien",
    townsLead: "Aquests 30 municipis tenen, del novembre al desembre del 2026, algun dia diferent de la llista general. La resta d'ajuntaments de la resolució, i tots els que no hi consten, obren el 29 de novembre i el 6, 8, 13, 20 i 27 de desembre.",
    townsCaption: "Municipis amb dies d'obertura diferents al novembre i al desembre del 2026",
    townsHeaders: ["Municipi", "No obre", "Obre també"],
    townsNote: "Resolució EMT/4342/2025 (DOGC 27.11.2025), comparada amb els dies per defecte el 30 d'octubre de 2026.",
    townsSame: "Barcelona, l'Hospitalet de Llobregat, Girona, Tarragona, Lleida, Reus, Sabadell, Mataró, Granollers, Figueres i Sant Cugat obren tots aquests dies. Per a un municipi concret, mira'n la pàgina a [festius locals per municipi](/ca/festius/), amb els seus dies d'obertura de tot l'any.",
    mallsTitle: "Obren els centres comercials els festius?",
    malls: [
      "Els mateixos dies que la resta de botigues del municipi: la llei de comerç i l'ordre del calendari no els en donen un de propi. Un centre comercial de Badalona, per exemple, no pot obrir el 8 de desembre, i un de Barcelona o de l'Hospitalet, sí. Dins dels centres, els establiments exclosos de l'horari general (per exemple, una farmàcia) poden obrir qualsevol dia.",
    ],
    alwaysTitle: "Quines botigues poden obrir qualsevol diumenge o festiu",
    always: [
      "La llei de comerç (article 37) deixa fora dels límits d'horari, de diumenges i de dies de tancament un seguit d'establiments. Per això trobaràs obert algun comerç fins i tot l'1 de novembre o el dia de Nadal. Entre d'altres:",
    ],
    alwaysList: [
      "Pastisseries, fleques, xurreries, plats preparats, premsa, floristeries i botigues de conveniència.",
      "Farmàcies, la venda de carburant i les botigues a les quals només s'accedeix des de dins d'estacions, aeroports i ports.",
      "Botigues dins de museus, monuments, parcs temàtics i hotels, i les dels municipis declarats turístics, durant el període aprovat.",
      "Botigues de fins a 300 m² de superfície de venda dedicades sobretot a l'alimentació de compra diària, i botigues de fins a 300 m² de petites i mitjanes empreses. El Tribunal Constitucional va anul·lar aquestes dues excepcions el 2022, però la Llei 3/2023 les va tornar a afegir a la llei de comerç, on són vigents.",
    ],
    nextTitle: "Calendari del 2027",
    nextCaption: "Diumenges i festius amb obertura comercial el 2027",
    nextHeaders: ["Dia", "Per què"],
    nextNote: "Ordre EMT/89/2026 (DOGC 28.5.2026). Els dies municipals per defecte s'apliquen on l'ajuntament no n'hagi triat d'altres.",
    next: [
      "Els vuit dies generals del 2027 ja són oficials. Els dos de cada municipi, i els dies que hagin canviat els ajuntaments, encara no: s'havien de comunicar abans de l'1 de novembre del 2026 i, a 3 de novembre, el DOGC encara no n'ha publicat la llista. L'any passat va sortir el 27 de novembre (Resolució EMT/4342/2025). Barcelona tampoc no ha publicat encara els seus. Si un ajuntament no en va triar cap, s'apliquen el 10 de gener i el 5 de desembre.",
      "Dues novetats de l'ordre del 2027: els ajuntaments han de fixar l'obertura en un festiu quan coincideixin dos o més festius seguits, i les empreses de botigues d'alimentació i compra diària poden canviar fins a tres dates del calendari general. Ni els ajuntaments ni aquestes empreses poden moure l'1 de novembre ni el 6 de desembre. La llista d'empreses i de dates canviades també s'ha de publicar al DOGC, i encara no hi és.",
    ],
    rulesTitle: "Horaris comercials a Catalunya: les normes",
    rules: [
      "**Dies sempre tancats:** l'1 i el 6 de gener, el diumenge i el dilluns de Pasqua, l'1 de maig, el 24 de juny, l'11 de setembre i el 25 i el 26 de desembre (excepte els establiments de la llista anterior).",
      "**Horari:** d'octubre a maig, cap botiga sotmesa a l'horari general pot obrir entre les 21.00 i les 6.00; de juny a setembre, entre les 22.00 i les 7.00. Dins d'aquest marc, cada botiga reparteix lliurement les hores.",
      "**Horari visible:** les botigues han d'exposar l'horari de manera que sigui visible al públic, fins i tot amb l'establiment tancat.",
    ],
    calendar: "Per als festius en què no es treballa, consulta el [calendari laboral](/ca/guies/calendari-laboral-catalunya/) i els [festius locals de cada municipi](/ca/guies/festius-locals-catalunya/).",
    bcnTitle: "A Barcelona",
    bcn: [
      "Barcelona fa servir el 2026 els mateixos deu dies que la llista general (4 i 11 de gener, 15 d'agost, 12 d'octubre, 29 de novembre i 6, 8, 13, 20 i 27 de desembre). A 3 de novembre encara no ha publicat els seus dos dies del 2027, ni a la seva pàgina d'horaris comercials ni al DOGC.",
      "A més, a la **zona turística** (ZGAT), les botigues poden obrir els diumenges i festius **del 15 de maig al 15 de setembre, de 12 a 20 hores**. La zona inclou tots els barris de Ciutat Vella i de l'Eixample, i parts de Sants-Montjuïc, les Corts, Sarrià-Sant Gervasi, Gràcia, Horta-Guinardó i Sant Martí (Poblenou, Vila Olímpica i Diagonal Mar). Aquesta excepció no s'aplica entre el 16 de setembre i el 14 de maig: al novembre i al desembre, a la zona turística valen els mateixos dies que a la resta de la ciutat.",
      `Què obre a la ciutat cada festiu del desembre, amb els museus i el metro, i l'agenda del mes són a ${b2link("barcelonaDecember", "ca", "què fer a Barcelona al desembre")}.`,
    ],
    salesTitle: "I les rebaixes?",
    sales: [
      "No hi ha cap data obligatòria: cada botiga decideix si fa rebaixes, i les ha d'anunciar amb aquest nom i amb el període que duren. El Consell Assessor de la Generalitat en matèria de comerç proposa cada any unes dates recomanades. El preu de referència ha de ser el més baix dels trenta dies anteriors, segons l'Agència Catalana del Consum.",
    ],
    faq: [
      { question: "Quins festius d'obertura comercial queden el 2026?", answer: `A Barcelona i a la majoria de municipis, el diumenge 29 de novembre, dia d'eleccions, i el 6, 8, 13, 20 i 27 de desembre. Són dies en què les botigues poden obrir, no dies en què hagin d'obrir. ${TOWNS_NOV_DEC.length} municipis en canvien algun (són a la taula de dalt).` },
      { question: "Obren les botigues el 29 de novembre, dia d'eleccions?", answer: `Sí. El diumenge 29 de novembre és dia d'obertura comercial a Barcelona i a tots els municipis excepte ${joinList(NO_29_NOV, "ca")}, i les eleccions no el converteixen en dia de tancament. Hi poden obrir també els centres comercials. Qui hi treballi té dret a fins a quatre hores retribuïdes per anar a votar.` },
      { question: "Quins diumenges obren les botigues el desembre del 2026?", answer: "A Barcelona i a la majoria de municipis, els diumenges 6, 13, 20 i 27 de desembre, i també el dimarts 8 de desembre. Alguns municipis, com Terrassa, Manresa, Olot o Badalona, en canvien algun." },
      { question: "Obren les botigues el 8 de desembre de 2026?", answer: `A Barcelona i a la majoria de municipis, sí: el dimarts 8 de desembre és dia d'obertura. No ho és a ${NO_8_DEC.length} municipis que l'han canviat per un altre dia, entre els quals ${["Badalona", "Manresa", "Santa Coloma de Gramenet", "Mollet del Vallès", "Gavà", "Montcada i Reixac"].join(", ")}: la llista sencera és a la taula de dalt.` },
      { question: "Obren les botigues el 24 i el 31 de desembre?", answer: "Sí, amb l'horari de cada botiga: el 24 i el 31 de desembre són dies laborables a Catalunya, no festius. Les botigues amb horari general no poden obrir entre les 21.00 i les 6.00, ni aquests dies ni cap altre de l'octubre al maig." },
      { question: "Obren les botigues el dia de Nadal o Sant Esteve?", answer: "Les botigues amb horari general, no: el 25 i el 26 de desembre són dies de tancament, igual que l'1 i el 6 de gener del 2027. Els establiments exclosos de l'horari general (fleques, conveniència, farmàcies...) sí que poden obrir." },
      { question: "Quins festius obren les botigues el 2027?", answer: "El primer dia general és el diumenge 3 de gener. Els vuit dies generals són el 3 de gener, el 27 de juny, l'1 i el 28 de novembre i el 6, el 8, el 12 i el 19 de desembre. Cada municipi n'hi afegeix dos; si no en va triar cap, el 10 de gener i el 5 de desembre. La llista de cada municipi encara no és al DOGC (l'any passat va sortir el 27 de novembre)." },
      { question: "Quins supermercats obren els festius?", answer: "Els de fins a 300 m² de superfície de venda dedicats sobretot a l'alimentació de compra diària, i els de petites i mitjanes empreses de fins a 300 m², poden obrir qualsevol diumenge o festiu (article 37 de la llei de comerç). Els altres, només els dies d'obertura autoritzats del seu municipi." },
      { question: "Obren els centres comercials els diumenges de desembre?", answer: "Hi poden obrir els mateixos dies que la resta de botigues del municipi: a Barcelona i a la majoria de municipis, els diumenges 6, 13, 20 i 27 de desembre i el dimarts 8." },
      { question: "Quan comencen les rebaixes de gener?", answer: "No hi ha una data obligatòria: cada botiga decideix i ha d'indicar l'inici i el final. La Generalitat només en publica unes dates recomanades." },
      { question: "Obren les botigues l'1 de novembre?", answer: "El 2026 no va ser dia d'obertura comercial a Barcelona ni a la majoria de municipis: només l'havien triat l'Ametlla del Vallès i Mollet del Vallès. El 2027, en canvi, el dilluns 1 de novembre és un dels vuit dies generals d'obertura, i els ajuntaments no el poden canviar." },
    ],
  },
  es: {
    lead: `**Sí: el domingo 29 de noviembre, día de las elecciones generales, las tiendas pueden abrir** en Barcelona y en casi toda Cataluña, porque es uno de los días de apertura del calendario de 2026. Después quedan el **6, 8, 13, 20 y 27 de diciembre**. El **25 y el 26 de diciembre y el 1 y el 6 de enero** son días de cierre obligatorio, y el primer día de apertura del calendario general de 2027 es el **domingo 3 de enero**. ${joinList(NO_29_NOV, "es")} no abren el 29 de noviembre, y ${NO_8_DEC.length} municipios, como ${NO_8_DEC_EXAMPLES.slice(0, -1).join(", ")} o ${NO_8_DEC_EXAMPLES.at(-1)}, no abren el 8 de diciembre. En Cataluña las tiendas pueden abrir diez domingos o festivos al año: ocho los fija la Generalitat y dos más cada ayuntamiento. Las tiendas de alimentación de hasta 300 m², las panaderías o las de conveniencia, entre otras, no tienen ese límite.`,
    note: "Abrir esos días es una opción, no una obligación: cada tienda decide si abre. Los dos días municipales cambian de un pueblo a otro.",
    weeksTitle: "¿Pueden abrir las tiendas? Del 8 de noviembre al 10 de enero, día a día",
    weeksCaption: "Domingos, festivos y días señalados de noviembre a enero: ¿pueden abrir las tiendas?",
    weeksHeaders: ["Día", "Cataluña", "Barcelona", "Base oficial"],
    weeksNote: "«Sí» quiere decir que las tiendas pueden abrir, no que deban hacerlo. De octubre a mayo, ninguna tienda con horario general puede abrir entre las 21.00 y las 6.00 (Ley 18/2017, art. 36.2.a). Un día laborable puede ser fiesta local en algún municipio, y entonces cuenta como festivo.",
    weeksAfter: "Los días de «No» pueden abrir igualmente las tiendas exentas del horario general: panaderías, pastelerías, floristerías, prensa, tiendas de conveniencia, farmacias y tiendas de alimentación o de pymes de hasta 300 m², entre otras (la lista está más abajo). En Barcelona, la zona turística (ZGAT) solo amplía la apertura del 15 de mayo al 15 de septiembre: de noviembre a enero valen los mismos días que en el resto de la ciudad.",
    electionTitle: "Domingo 29 de noviembre, día de elecciones: qué tiendas abren",
    election: [
      "El 29 de noviembre es a la vez la jornada de las elecciones generales y uno de los ocho domingos de apertura del calendario comercial de 2026 (Orden EMT/77/2025, artículo 1). Las elecciones no lo convierten en día de cierre: la ley de comercio catalana solo obliga a cerrar el 1 y el 6 de enero, el domingo y el lunes de Pascua, el 1 de mayo, el 24 de junio, el 11 de septiembre y el 25 y el 26 de diciembre (Ley 18/2017, artículo 36.2.d).",
      `Pueden abrir todas las tiendas, también las grandes superficies y los centros comerciales, en Barcelona y en todos los municipios salvo ${joinList(NO_29_NOV, "es")}, que lo han cambiado por otro día (Resolución EMT/4342/2025). Poder abrir no quiere decir que abran todas: cada tienda decide si abre y con qué horario, siempre entre las 6.00 y las 21.00.`,
      `Quien trabaje ese día tiene derecho a hasta cuatro horas retribuidas para ir a votar, proporcionales si hace jornada reducida (Real Decreto 605/1999, artículo 13). Para el resto de la jornada, mira ${b2link("voting", "es", "cómo votar el 29 de noviembre, también por correo")}.`,
    ],
    townsTitle: "Tiendas abiertas el 8 de diciembre y los domingos de diciembre: municipios que cambian",
    townsLead: "Estos 30 municipios tienen, de noviembre a diciembre de 2026, algún día distinto de la lista general. El resto de ayuntamientos de la resolución, y todos los que no figuran en ella, abren el 29 de noviembre y el 6, 8, 13, 20 y 27 de diciembre.",
    townsCaption: "Municipios con días de apertura distintos en noviembre y diciembre de 2026",
    townsHeaders: ["Municipio", "No abre", "Abre también"],
    townsNote: "Resolución EMT/4342/2025 (DOGC 27.11.2025), comparada con los días por defecto el 30 de octubre de 2026.",
    townsSame: "Barcelona, L'Hospitalet de Llobregat, Girona, Tarragona, Lleida, Reus, Sabadell, Mataró, Granollers, Figueres y Sant Cugat abren todos esos días. Para un municipio concreto, mira su página en [festivos locales por municipio](/es/festivos/), con sus días de apertura de todo el año.",
    mallsTitle: "¿Abren los centros comerciales los festivos?",
    malls: [
      "Los mismos días que el resto de tiendas del municipio: la ley de comercio y la orden del calendario no les dan uno propio. Un centro comercial de Badalona, por ejemplo, no puede abrir el 8 de diciembre, y uno de Barcelona o de L'Hospitalet, sí. Dentro de los centros, los establecimientos excluidos del horario general (por ejemplo, una farmacia) pueden abrir cualquier día.",
    ],
    alwaysTitle: "Qué tiendas pueden abrir cualquier domingo o festivo",
    always: [
      "La ley de comercio catalana (artículo 37) deja fuera de los límites de horario, de domingos y de días de cierre a una serie de establecimientos. Por eso encontrarás algún comercio abierto incluso el 1 de noviembre o el día de Navidad. Entre otros:",
    ],
    alwaysList: [
      "Pastelerías, panaderías, churrerías, platos preparados, prensa, floristerías y tiendas de conveniencia.",
      "Farmacias, la venta de carburante y las tiendas a las que solo se accede desde dentro de estaciones, aeropuertos y puertos.",
      "Tiendas dentro de museos, monumentos, parques temáticos y hoteles, y las de los municipios declarados turísticos, durante el periodo aprobado.",
      "Tiendas de hasta 300 m² de superficie de venta dedicadas sobre todo a la alimentación de compra diaria, y tiendas de hasta 300 m² de pequeñas y medianas empresas. El Tribunal Constitucional anuló estas dos excepciones en 2022, pero la Ley 3/2023 las volvió a añadir a la ley de comercio, donde están vigentes.",
    ],
    nextTitle: "Calendario de 2027",
    nextCaption: "Domingos y festivos con apertura comercial en 2027",
    nextHeaders: ["Día", "Por qué"],
    nextNote: "Orden EMT/89/2026 (DOGC 28.5.2026). Los días municipales por defecto se aplican donde el ayuntamiento no haya elegido otros.",
    next: [
      "Los ocho días generales de 2027 ya son oficiales. Los dos de cada municipio, y los días que hayan cambiado los ayuntamientos, todavía no: debían comunicarse antes del 1 de noviembre de 2026 y, a 3 de noviembre, el DOGC aún no ha publicado la lista. El año pasado salió el 27 de noviembre (Resolución EMT/4342/2025). Barcelona tampoco ha publicado todavía los suyos. Si un ayuntamiento no eligió ninguno, se aplican el 10 de enero y el 5 de diciembre.",
      "Dos novedades de la orden de 2027: los ayuntamientos deben fijar la apertura en un festivo cuando coincidan dos o más festivos seguidos, y las empresas de tiendas de alimentación y compra diaria pueden cambiar hasta tres fechas del calendario general. Ni los ayuntamientos ni esas empresas pueden mover el 1 de noviembre ni el 6 de diciembre. La lista de empresas y de fechas cambiadas también debe publicarse en el DOGC, y aún no está.",
    ],
    rulesTitle: "Horarios comerciales en Cataluña: las normas",
    rules: [
      "**Días siempre cerrados:** el 1 y el 6 de enero, el domingo y el lunes de Pascua, el 1 de mayo, el 24 de junio, el 11 de septiembre y el 25 y el 26 de diciembre (salvo los establecimientos de la lista anterior).",
      "**Horario:** de octubre a mayo, ninguna tienda sujeta al horario general puede abrir entre las 21.00 y las 6.00; de junio a septiembre, entre las 22.00 y las 7.00. Dentro de ese marco, cada tienda reparte libremente las horas.",
      "**Horario visible:** las tiendas deben exponer su horario de forma que sea visible al público, incluso con el establecimiento cerrado.",
    ],
    calendar: "Para los festivos en que no se trabaja, consulta el [calendario laboral](/es/guias/calendario-laboral-cataluna/) y los [festivos locales de cada municipio](/es/guias/festivos-locales-cataluna/).",
    bcnTitle: "En Barcelona",
    bcn: [
      "Barcelona usa en 2026 los mismos diez días que la lista general (4 y 11 de enero, 15 de agosto, 12 de octubre, 29 de noviembre y 6, 8, 13, 20 y 27 de diciembre). A 3 de noviembre aún no ha publicado sus dos días de 2027, ni en su página de horarios comerciales ni en el DOGC.",
      "Además, en la **zona turística** (ZGAT), las tiendas pueden abrir los domingos y festivos **del 15 de mayo al 15 de septiembre, de 12 a 20 horas**. La zona incluye todos los barrios de Ciutat Vella y del Eixample, y partes de Sants-Montjuïc, Les Corts, Sarrià-Sant Gervasi, Gràcia, Horta-Guinardó y Sant Martí (Poblenou, Vila Olímpica y Diagonal Mar). Esta excepción no se aplica entre el 16 de septiembre y el 14 de mayo: en noviembre y diciembre, en la zona turística valen los mismos días que en el resto de la ciudad.",
      `Qué abre en la ciudad cada festivo de diciembre, con los museos y el metro, y la agenda del mes están en ${b2link("barcelonaDecember", "es", "qué hacer en Barcelona en diciembre")}.`,
    ],
    salesTitle: "¿Y las rebajas?",
    sales: [
      "No hay ninguna fecha obligatoria: cada tienda decide si hace rebajas, y debe anunciarlas con ese nombre y con el periodo que duran. El Consell Assessor de la Generalitat en materia de comercio propone cada año unas fechas recomendadas. El precio de referencia debe ser el más bajo de los treinta días anteriores, según la Agència Catalana del Consum.",
    ],
    faq: [
      { question: "¿Abren las tiendas el domingo 29 de noviembre, día de elecciones?", answer: `Sí. El domingo 29 de noviembre es día de apertura comercial en Barcelona y en todos los municipios salvo ${joinList(NO_29_NOV, "es")}, y las elecciones no lo convierten en día de cierre. También pueden abrir los centros comerciales. Quien trabaje ese día tiene derecho a hasta cuatro horas retribuidas para ir a votar.` },
      { question: "¿Qué domingos abren las tiendas en diciembre de 2026 en Cataluña?", answer: "En Barcelona y en la mayoría de municipios, los domingos 6, 13, 20 y 27 de diciembre, y también el martes 8 de diciembre. Algunos municipios, como Terrassa, Manresa, Olot o Badalona, cambian alguno." },
      { question: "¿Abren las tiendas el 8 de diciembre de 2026?", answer: `En Barcelona y en la mayoría de municipios, sí: el martes 8 de diciembre es día de apertura. No lo es en ${NO_8_DEC.length} municipios que lo han cambiado por otro día, entre ellos ${["Badalona", "Manresa", "Santa Coloma de Gramenet", "Mollet del Vallès", "Gavà", "Montcada i Reixac"].join(", ")}: la lista completa está en la tabla de arriba.` },
      { question: "¿Abren las tiendas el 24 y el 31 de diciembre?", answer: "Sí, con el horario de cada tienda: el 24 y el 31 de diciembre son días laborables en Cataluña, no festivos. Las tiendas con horario general no pueden abrir entre las 21.00 y las 6.00, ni esos días ni ningún otro de octubre a mayo." },
      { question: "¿Abren las tiendas el día de Navidad o San Esteban?", answer: "Las tiendas con horario general, no: el 25 y el 26 de diciembre son días de cierre, igual que el 1 y el 6 de enero de 2027. Los establecimientos excluidos del horario general (panaderías, conveniencia, farmacias...) sí pueden abrir." },
      { question: "¿Qué festivos abren las tiendas en 2027?", answer: "El primer día general es el domingo 3 de enero. Los ocho días generales son el 3 de enero, el 27 de junio, el 1 y el 28 de noviembre y el 6, el 8, el 12 y el 19 de diciembre. Cada municipio añade dos; si no eligió ninguno, el 10 de enero y el 5 de diciembre. La lista de cada municipio aún no está en el DOGC (el año pasado salió el 27 de noviembre)." },
      { question: "¿Qué supermercados abren en festivo?", answer: "Los de hasta 300 m² de superficie de venta dedicados sobre todo a la alimentación de compra diaria, y los de pequeñas y medianas empresas de hasta 300 m², pueden abrir cualquier domingo o festivo (artículo 37 de la ley de comercio). Los demás, solo los días de apertura autorizados de su municipio." },
      { question: "¿Abren los centros comerciales los domingos de diciembre?", answer: "Pueden abrir los mismos días que el resto de tiendas del municipio: en Barcelona y en la mayoría de municipios, los domingos 6, 13, 20 y 27 de diciembre y el martes 8." },
      { question: "¿Cuándo empiezan las rebajas de enero?", answer: "No hay una fecha obligatoria: cada tienda decide y debe indicar el inicio y el final. La Generalitat solo publica unas fechas recomendadas." },
      { question: "¿Abren las tiendas el 1 de noviembre en Cataluña?", answer: "En 2026 no fue día de apertura comercial en Barcelona ni en la mayoría de municipios: solo lo habían elegido l'Ametlla del Vallès y Mollet del Vallès. En 2027, en cambio, el lunes 1 de noviembre es uno de los ocho días generales de apertura, y los ayuntamientos no pueden cambiarlo." },
    ],
  },
  en: {
    lead: `**Yes: on Sunday 29 November, general election day, shops may open** in Barcelona and almost all of Catalonia, because it is one of the opening days in the 2026 calendar. After that come **6, 8, 13, 20 and 27 December**. **25 and 26 December and 1 and 6 January** are compulsory closing days, and the first opening day in the 2027 general calendar is **Sunday 3 January**. ${joinList(NO_29_NOV, "en")} do not open on 29 November, and ${NO_8_DEC.length} towns, such as ${NO_8_DEC_EXAMPLES.slice(0, -1).join(", ")} and ${NO_8_DEC_EXAMPLES.at(-1)}, do not open on 8 December. Shops in Catalonia may open on ten Sundays or public holidays a year: eight set by the Generalitat and two chosen by each town council. Food shops of up to 300 m², bakeries and convenience stores, among others, are not bound by that limit.`,
    note: "Opening on these days is optional: each shop decides. The two municipal days vary from town to town.",
    weeksTitle: "Can shops open? 8 November to 10 January, date by date",
    weeksCaption: "Sundays, holidays and key dates from November to January: can shops open?",
    weeksHeaders: ["Date", "Catalonia", "Barcelona", "Official basis"],
    weeksNote: "\"Yes\" means shops may open, not that they must. From October to May no shop on the general timetable may open between 21:00 and 6:00 (Llei 18/2017, art. 36.2.a). A working day can be a local holiday in some towns, and then it counts as a holiday.",
    weeksAfter: "On the \"No\" days, shops outside the general timetable may still open: bakeries, cake shops, florists, newsagents, convenience stores, pharmacies, and food or small-business shops of up to 300 m², among others (the list is further down). In Barcelona the tourist zone (ZGAT) only extends opening from 15 May to 15 September: from November to January it follows the same days as the rest of the city.",
    electionTitle: "Sunday 29 November, election day: which shops open",
    election: [
      "29 November is both general election day and one of the eight opening Sundays in the 2026 retail calendar (Ordre EMT/77/2025, article 1). The election does not make it a closing day: Catalonia's retail law only requires shops to close on 1 and 6 January, Easter Sunday and Monday, 1 May, 24 June, 11 September, and 25 and 26 December (Llei 18/2017, article 36.2.d).",
      `Every shop may open, large stores and shopping centres included, in Barcelona and in every town except ${joinList(NO_29_NOV, "en")}, which swapped it for another day (Resolució EMT/4342/2025). Being allowed to open does not mean every shop will: each shop decides whether to open and its hours, always between 6:00 and 21:00.`,
      `Anyone working that day is entitled to up to four paid hours off to vote, reduced pro rata for part-time work (Real Decreto 605/1999, article 13). For the rest of the day, see ${b2link("voting", "en", "how to vote on 29 November, including by post")}.`,
    ],
    townsTitle: "Shops open on 8 December and December Sundays: towns that differ",
    townsLead: "These 30 towns have at least one different day between November and December 2026. Every other council in the resolution, and every town not listed in it, opens on 29 November and 6, 8, 13, 20 and 27 December.",
    townsCaption: "Towns with different shop opening days in November and December 2026",
    townsHeaders: ["Town", "Does not open", "Also opens"],
    townsNote: "Resolució EMT/4342/2025 (DOGC 27 Nov 2025), compared with the default days on 30 October 2026.",
    townsSame: "Barcelona, L'Hospitalet de Llobregat, Girona, Tarragona, Lleida, Reus, Sabadell, Mataró, Granollers, Figueres and Sant Cugat open on all of these days. For any other town, check the DOGC resolution.",
    mallsTitle: "Are shopping centres open on public holidays?",
    malls: [
      "On the same days as every other shop in their town: retail law and the calendar order give them no calendar of their own. A shopping centre in Badalona, for example, may not open on 8 December; one in Barcelona or L'Hospitalet may. Inside a centre, businesses outside the general timetable (a pharmacy, for instance) may open on any day.",
    ],
    alwaysTitle: "Which shops may open on any Sunday or holiday",
    always: [
      "Catalonia's retail law (article 37) takes a list of businesses outside the limits on hours, Sundays and closing days. That is why you will find some shops open even on 1 November or Christmas Day. Among them:",
    ],
    alwaysList: [
      "Cake shops, bakeries, churro shops, ready meals, newsagents, florists and convenience stores.",
      "Pharmacies, fuel sales, and shops reachable only from inside stations, airports and ports.",
      "Shops inside museums, monuments, theme parks and hotels, and those in designated tourist municipalities, for the approved period.",
      "Shops with up to 300 m² of sales floor selling mainly everyday food, and shops of up to 300 m² run by small and medium-sized businesses. The Constitutional Court struck these two exemptions down in 2022, but Catalan Law 3/2023 put them back into the retail law, where they are in force.",
    ],
    nextTitle: "The 2027 calendar",
    nextCaption: "Sundays and holidays when shops may open in 2027",
    nextHeaders: ["Date", "Why"],
    nextNote: "Ordre EMT/89/2026 (DOGC 28 May 2026). The default municipal days apply where the council has chosen none.",
    next: [
      "The eight general days for 2027 are official. Each town's two extra days, and the days councils have swapped, are not out yet: they had to be reported before 1 November 2026 and, as of 3 November, the DOGC has not published the list. Last year it came out on 27 November (Resolució EMT/4342/2025). Barcelona has not published its days either. A council that chose none gets 10 January and 5 December.",
      "Two changes in the 2027 order: councils must set an opening day when two or more public holidays fall in a row, and companies running everyday food shops may swap up to three dates of the general calendar. Neither councils nor those companies may move 1 November or 6 December. The list of those companies and their swapped dates must also appear in the DOGC, and it has not yet.",
    ],
    rulesTitle: "Shop opening hours in Catalonia: the rules",
    rules: [
      "**Always closed:** 1 and 6 January, Easter Sunday and Monday, 1 May, 24 June, 11 September, and 25 and 26 December (except the businesses listed above).",
      "**Hours:** from October to May no shop on the general timetable may open between 21:00 and 6:00; from June to September, between 22:00 and 7:00. Within that frame each shop sets its own hours.",
      "**Posted hours:** shops must display their opening hours where the public can see them, even when closed.",
    ],
    calendar: "For the days off work, see the [Catalonia public holidays calendar](/en/guides/catalonia-public-holidays/) and the [local holidays in each town](/en/guides/local-holidays-catalonia/).",
    bcnTitle: "In Barcelona",
    bcn: [
      "In 2026 Barcelona uses the same ten days as the general list (4 and 11 January, 15 August, 12 October, 29 November and 6, 8, 13, 20 and 27 December). As of 3 November it has not published its two days for 2027, on its retail hours page or in the DOGC.",
      "On top of that, in the **tourist zone** (ZGAT), shops may open on Sundays and holidays **from 15 May to 15 September, 12:00 to 20:00**. The zone covers every neighbourhood of Ciutat Vella and the Eixample, and parts of Sants-Montjuïc, Les Corts, Sarrià-Sant Gervasi, Gràcia, Horta-Guinardó and Sant Martí (Poblenou, Vila Olímpica and Diagonal Mar). The exception does not apply from 16 September to 14 May: in November and December the tourist zone follows the same days as the rest of the city.",
      `What's open in the city on each December holiday, museums and the metro included, and the month's events are in ${b2link("barcelonaDecember", "en", "Barcelona in December")}.`,
    ],
    salesTitle: "What about the sales?",
    sales: [
      "There is no compulsory date: each shop decides whether to hold sales and must announce them as such, with the period they cover. The Generalitat's retail advisory council proposes recommended dates every year. The reference price must be the lowest of the previous thirty days, according to the Catalan Consumer Agency.",
    ],
    faq: [
      { question: "Are shops open on Sunday 29 November, election day?", answer: `Yes. Sunday 29 November is a shop opening day in Barcelona and every town except ${joinList(NO_29_NOV, "en")}, and the election does not make it a closing day. Shopping centres may open too. Anyone working that day is entitled to up to four paid hours off to vote.` },
      { question: "Are shops open on Sundays in Barcelona in December 2026?", answer: "Yes, on Sundays 6, 13, 20 and 27 December, and on Tuesday 8 December, in Barcelona and most towns. A few towns, such as Terrassa, Manresa, Olot or Badalona, change one of them." },
      { question: "Are shops open on 8 December 2026?", answer: `In Barcelona and most towns, yes: Tuesday 8 December is an opening day. It is not in ${NO_8_DEC.length} towns that swapped it for another day, including ${["Badalona", "Manresa", "Santa Coloma de Gramenet", "Mollet del Vallès", "Gavà", "Montcada i Reixac"].join(", ")}: the full list is in the table above.` },
      { question: "Are shops open on 24 and 31 December?", answer: "Yes, with each shop's own hours: 24 and 31 December are working days in Catalonia, not public holidays. Shops on the general timetable may not open between 21:00 and 6:00, on those days or any other from October to May." },
      { question: "Are shops open on Christmas Day or 26 December in Catalonia?", answer: "Shops on the general timetable are not: 25 and 26 December are closing days, as are 1 and 6 January 2027. Businesses outside the general timetable (bakeries, convenience stores, pharmacies...) may open." },
      { question: "Which holidays can shops open in 2027?", answer: "The first general day is Sunday 3 January. The eight general days are 3 January, 27 June, 1 and 28 November, and 6, 8, 12 and 19 December. Each town adds two; if it chose none, 10 January and 5 December. Each town's list is not in the DOGC yet (last year it came out on 27 November)." },
      { question: "Which supermarkets are open on public holidays?", answer: "Those with up to 300 m² of sales floor selling mainly everyday food, and those of up to 300 m² run by small and medium-sized businesses, may open on any Sunday or holiday (article 37 of the retail law). Others only on their town's authorised opening days." },
      { question: "Are shopping centres open on Sundays in December?", answer: "They may open on the same days as every other shop in their town: in Barcelona and most towns, Sundays 6, 13, 20 and 27 December and Tuesday 8 December." },
      { question: "When do the January sales start?", answer: "There is no fixed date: each shop decides and must state when its sale starts and ends. The Generalitat only publishes recommended dates." },
      { question: "Are shops open on 1 November in Barcelona?", answer: "In 2026 it was not a shop opening day in Barcelona or most of Catalonia: only l'Ametlla del Vallès and Mollet del Vallès had chosen it. In 2027, by contrast, Monday 1 November is one of the eight general opening days, and councils may not swap it." },
    ],
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  // 30 Oct 2026 (seasonal top-3 push): the strongest page of the December
  // cluster also links the lights and the December bridge.
  const christmas: Record<Locale, string> = {
    ca: `Si surts a comprar per Nadal, mira també ${b2link("christmas", "ca", "els mercats de Nadal de Catalunya i les seves dates")}, ${b2link("christmasBarcelona", "ca", "quan és l'encesa de llums de Nadal a Barcelona")} i ${b2link("decemberBridge", "ca", "quins dies són festius al pont de desembre")}.`,
    es: `Si sales de compras por Navidad, mira también ${b2link("christmas", "es", "los mercados de Navidad de Cataluña y sus fechas")}, ${b2link("christmasBarcelona", "es", "cuándo es el encendido de luces de Navidad en Barcelona")} y ${b2link("decemberBridge", "es", "qué días son festivos en el puente de diciembre")}.`,
    en: `If you are out Christmas shopping, see also ${b2link("christmas", "en", "Catalonia's Christmas markets and their dates")}, ${b2link("christmasBarcelona", "en", "when Barcelona switches on its Christmas lights")} and ${b2link("decemberBridge", "en", "which days are holidays over the December long weekend")}.`,
  };
  const days = (isos: string[]) => (isos.length ? isos.map((iso) => weekdayDayMonth(iso, locale)).join(", ") : "—");
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.weeksTitle),
    table(t.weeksCaption, t.weeksHeaders, NEXT_WEEKS.map((row) => [row.day[locale], row.cat(locale), row.bcn(locale), row.basis[locale]]), t.weeksNote),
    ...paras(t.weeksAfter),
    ...h2(t.electionTitle, ...t.election),
    ...h2(t.townsTitle, t.townsLead),
    table(t.townsCaption, t.townsHeaders, TOWNS_NOV_DEC.map((row) => [row.town, days(row.closed), days(row.extra)]), t.townsNote),
    ...paras(t.townsSame),
    ...h2(t.mallsTitle, ...t.malls),
    ...h2(t.alwaysTitle, ...t.always),
    list(...t.alwaysList),
    ...h2(t.nextTitle, ...t.next),
    table(t.nextCaption, t.nextHeaders, DAYS_2027.map(([day, why]) => [day[locale], why[locale]]), t.nextNote),
    ...h2(t.rulesTitle),
    list(...t.rules),
    ...paras(t.calendar),
    ...h2(t.bcnTitle, ...t.bcn),
    ...h2(t.salesTitle, ...t.sales),
    ...paras(christmas[locale]),
    faq(t.faq),
    ...b2Related(["christmas", "barcelonaHub", "markets", "hours"], locale),
  ];
}

export const SHOPS: B2Article = {
  key: "shops",
  entryKey: "guide-shops-open-holidays-catalonia",
  categoryKey: "public-services",
  sources: SOURCES,
  heroKey: "botigues-llums-nadal-barcelona",
  heroAlt: {
    ca: "Llums de Nadal blaves i blanques sobre un carrer comercial de Barcelona, de nit",
    es: "Luces de Navidad azules y blancas sobre una calle comercial de Barcelona, de noche",
    en: "Blue and white Christmas lights over a shopping street in Barcelona at night",
  },
  heroCaption: {
    ca: "Llums de Nadal en un carrer comercial de Barcelona.",
    es: "Luces de Navidad en una calle comercial de Barcelona.",
    en: "Christmas lights on a Barcelona shopping street.",
  },
  secondaryKey: "botigues-carrer-llums-nadal",
  secondaryAlt: {
    ca: "Carrer de Barcelona amb llums de Nadal en forma d'arbre i gent passejant",
    es: "Calle de Barcelona con luces de Navidad en forma de árbol y gente paseando",
    en: "A Barcelona street with tree-shaped Christmas lights and people walking",
  },
  secondaryCaption: {
    ca: "Llums de Nadal a Barcelona.",
    es: "Luces de Navidad en Barcelona.",
    en: "Christmas lights in Barcelona.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-19T12:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as SHOPS_META };
