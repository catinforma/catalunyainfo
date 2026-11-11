/**
 * Copy of the Christmas lottery results family, in Catalan, Spanish and
 * English, built as content blocks (the article renderer draws them).
 *
 * Every fact on these pages was read on official pages on GORDO_AS_OF
 * (11 Nov 2026), each with curl and a grep for the quoted text:
 *
 *  - SELAE, draw calendar Q4 2026 (Saturdays): "102 22.12.26 Martes 205
 *    100.000 20.500.000 200 € 4.100.000.000 € Extraordinario de "Navidad"
 *    Madrid - Teatro Real".
 *  - SELAE, prize programme Q4 2026, Christmas page ("Madrid, 26 de enero de
 *    2026"): 4,000,000 / 1,250,000 / 500,000 / 2 x 200,000 / 8 x 60,000 € per
 *    billete, "Los billetes estarán divididos en décimos de 20€".
 *  - SELAE, Lotería Nacional page: the "Comprueba tus números" checker.
 *  - SELAE, 2025 Christmas press dossier: the two drums and the San Ildefonso
 *    children; "A las 8:30 horas se constituye la mesa"; "duración aproximada
 *    de cuatro horas"; the Lista Oficial de Premios, made at the FNMT, "se
 *    edita y distribuye la tarde del día 22 de diciembre a los puntos de venta
 *    y medios de comunicación ... También está disponible en la web oficial";
 *    "la única información válida para el pago de premios es la contenida en
 *    la Lista Oficial de Premios"; payment from "La tarde del 22 de
 *    diciembre"; "caduca a los tres meses, contados a partir del día
 *    siguiente al de la celebración del Sorteo".
 *  - SELAE, 2025 first-prize page ("PUNTOS DE VENTA RELACIONADOS"): four
 *    points of sale, La Pola de Gordón, Villablino and La Bañeza (León) and
 *    Madrid; the 2025 third-prize page marks some as "Repartido a través de la
 *    web oficial www.loteriasyapuestas.es".
 *  - SELAE help: "¿Cómo cobro los premios...?" (under 2,000 € at "casi 11.000
 *    puntos de venta"; 2,000 € or more at BBVA or CaixaBank, no account and no
 *    fee) and "¿Cómo sé si tengo premio?" (email, internal notification and
 *    SMS; the "Apuestas" listing prevails).
 *  - BOE, Ley 35/2006 (IRPF), disposición adicional 33ª: exempt up to 40,000 €
 *    per décimo, 20% on the rest, withheld at payment (the lottery guide
 *    explains it; this page links there).
 *
 * Checked and not used: a BOE resolution with the 2026 programme does not
 * exist (a BOE title search for "programa de premios 22 de diciembre" returns
 * resolutions up to BOE-A-2010-19540 and none after); SELAE's press room
 * (selae.es/es/web-corporativa/sala-de-prensa) answers 403 to scripts. SELAE's
 * draw record already lists 08:30 for 2026, but no 2026 announcement exists
 * yet: the 2026 time comes from DRAW_TIME_2026 in the lottery guide, as there.
 *
 * Catalan name: SELAE's Catalan pages call the draw "Loteria de Nadal" ("Jugar
 * a Loteria de Nadal"); "La Grossa" is the Generalitat's own lottery (La Grossa
 * de Cap d'Any), so these pages never call this draw "la Grossa de Nadal".
 */

import type { Block } from "@/lib/content/blocks";
import { dateYear, dayDate } from "@/lib/content/batch02/festive";
import { eur } from "@/lib/content/batch02/grossa";
import { DRAW_TIME_2026, NADAL_DRAW_DATE, NADAL_URLS } from "@/lib/content/batch02/loteria-nadal";
import { b2href, callout, faq, keyFacts, lead, list, paras, table, verifiedLine, type B2Source } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";

import { hasResults, prizesIn, provinceGroups, readDay, readTime, webSales, type GordoMunicipalityGroup, type GordoProvinceGroup, type GordoSale } from "./data";
import { gordoHubPath, gordoMunicipalityPath, gordoProvincePath } from "./paths";
import type { GordoPrizeKey, GordoSnapshot } from "./types";

/** The day every fact above was last read on its source. */
export const GORDO_AS_OF = "2026-11-11";

export const TITLE_LIMIT = 65;
export const DESCRIPTION_LIMIT = 160;

const U = {
  calendar: NADAL_URLS.calendar,
  programme: NADAL_URLS.programme,
  lnac: NADAL_URLS.lnac,
  dossier2025: NADAL_URLS.dossier2025,
  list2025: NADAL_URLS.list2025,
  first2025: NADAL_URLS.first2025,
  third2025: NADAL_URLS.third2025,
  collect: NADAL_URLS.collect,
  notify: NADAL_URLS.notify,
  irpf: NADAL_URLS.irpf,
} as const;

export const GORDO_URLS = U;

const BASE_SOURCES: B2Source[] = [
  { name: "Calendario de sorteos de Lotería Nacional, sábados, cuarto trimestre de 2026", url: U.calendar, publisher: "SELAE" },
  { name: "Programa de premios del Sorteo Extraordinario de Navidad del 22 de diciembre de 2026", url: U.programme, publisher: "SELAE" },
  { name: "Lotería Nacional: comprobador de números", url: U.lnac, publisher: "SELAE" },
  { name: "Dossier de prensa del Sorteo Extraordinario de Navidad 2025", url: U.dossier2025, publisher: "SELAE" },
  { name: "Lista oficial de premios del Sorteo Extraordinario de Navidad del 22 de diciembre de 2025", url: U.list2025, publisher: "SELAE" },
  { name: "Primer premio del Sorteo Extraordinario de Navidad del 22 de diciembre de 2025: puntos de venta", url: U.first2025, publisher: "SELAE" },
  { name: "Tercer premio del Sorteo Extraordinario de Navidad del 22 de diciembre de 2025: puntos de venta", url: U.third2025, publisher: "SELAE" },
  { name: "¿Cómo cobro los premios de resguardos comprados en la Red Comercial?", url: U.collect, publisher: "SELAE" },
  { name: "¿Cómo sé si tengo premio?", url: U.notify, publisher: "SELAE" },
  { name: "Ley 35/2006, del IRPF, disposición adicional trigésima tercera", url: U.irpf, publisher: "BOE" },
];

const ORDINAL: Record<GordoPrizeKey, string> = { first: "Primer", second: "Segundo", third: "Tercer", fourth: "Cuarto", fifth: "Quinto" };

/** What a province or municipality page cites besides the day's SELAE pages. */
const PLACE_URLS: readonly string[] = [U.programme, U.lnac, U.collect, U.irpf];

/**
 * The official pages a page cites: the day's SELAE pages first, then the fixed
 * ones (on a province or municipality page, only those it links).
 */
export function gordoSources(s: GordoSnapshot | null, keys: readonly GordoPrizeKey[] = ["first", "second", "third", "fourth", "fifth"], place = false): B2Source[] {
  const day: B2Source[] = [];
  if (hasResults(s)) {
    day.push({ name: `Lotería Nacional: premios mayores del sorteo del 22 de diciembre de ${s.year}`, url: s.sources.results, publisher: "SELAE" });
    if (s.sources.officialList) day.push({ name: `Lista oficial de premios del Sorteo Extraordinario de Navidad del 22 de diciembre de ${s.year}`, url: s.sources.officialList, publisher: "SELAE" });
    for (const prize of s.prizes) {
      if (prize.page && keys.includes(prize.key)) {
        day.push({ name: `${ORDINAL[prize.key]} premio del Sorteo Extraordinario de Navidad del 22 de diciembre de ${s.year}: puntos de venta`, url: prize.page, publisher: "SELAE" });
      }
    }
  }
  const seen = new Set<string>();
  const base = place ? BASE_SOURCES.filter((source) => PLACE_URLS.includes(source.url)) : BASE_SOURCES;
  return [...day, ...base].filter((source) => (seen.has(source.url) ? false : (seen.add(source.url), true)));
}

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

const link = (href: string, label: string) => `[${label}](${href})`;
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const strip = (text: string) => text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

function join(items: string[], locale: Locale): string {
  const and = { ca: "i", es: "y", en: "and" }[locale];
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

/** Catalan "a" before a place: "a Terrassa", "al Prat de Llobregat", "als Hostalets". */
export function caA(name: string): string {
  if (/^el /.test(name)) return `al ${name.slice(3)}`;
  if (/^els /.test(name)) return `als ${name.slice(4)}`;
  return `a ${name}`;
}

const NAMES: Record<Locale, Record<GordoPrizeKey, { row: string; inText: string; heading: string }>> = {
  ca: {
    first: { row: "Primer premi (el Gordo)", inText: "el Gordo", heading: "On ha tocat el Gordo" },
    second: { row: "Segon premi", inText: "el segon premi", heading: "On ha tocat el segon premi" },
    third: { row: "Tercer premi", inText: "el tercer premi", heading: "On ha tocat el tercer premi" },
    fourth: { row: "Quarts premis", inText: "els quarts premis", heading: "On han tocat els quarts premis" },
    fifth: { row: "Cinquens premis", inText: "els cinquens premis", heading: "On han tocat els cinquens premis" },
  },
  es: {
    first: { row: "Primer premio (el Gordo)", inText: "el Gordo", heading: "Dónde ha tocado el Gordo" },
    second: { row: "Segundo premio", inText: "el segundo premio", heading: "Dónde ha tocado el segundo premio" },
    third: { row: "Tercer premio", inText: "el tercer premio", heading: "Dónde ha tocado el tercer premio" },
    fourth: { row: "Cuartos premios", inText: "los cuartos premios", heading: "Dónde han tocado los cuartos premios" },
    fifth: { row: "Quintos premios", inText: "los quintos premios", heading: "Dónde han tocado los quintos premios" },
  },
  en: {
    first: { row: "First prize (El Gordo)", inText: "El Gordo", heading: "Where El Gordo was sold" },
    second: { row: "Second prize", inText: "the second prize", heading: "Where the second prize was sold" },
    third: { row: "Third prize", inText: "the third prize", heading: "Where the third prize was sold" },
    fourth: { row: "Fourth prizes", inText: "the fourth prizes", heading: "Where the fourth prizes were sold" },
    fifth: { row: "Fifth prizes", inText: "the fifth prizes", heading: "Where the fifth prizes were sold" },
  },
};

export function prizeName(key: GordoPrizeKey, locale: Locale): string {
  return NAMES[locale][key].row;
}

const WEB_LABEL: Record<Locale, string> = {
  ca: "la venda per internet de SELAE (loteriasyapuestas.es)",
  es: "la venta por internet de SELAE (loteriasyapuestas.es)",
  en: "SELAE's online sales (loteriasyapuestas.es)",
};

const VIA_WEB: Record<Locale, string> = {
  ca: "en part venut a la web oficial",
  es: "en parte vendido en la web oficial",
  en: "partly sold on the official website",
};

/** "13:05 del 22 de desembre de 2026". */
function readStamp(s: GordoSnapshot, locale: Locale): string {
  const day = dateYear(readDay(s), locale);
  return { ca: `el ${day} a les ${readTime(s)}`, es: `el ${day} a las ${readTime(s)}`, en: `on ${day} at ${readTime(s)}` }[locale];
}

/** "uno de estos números: 25508 o 78477" for the fourth and fifth prizes, whose outlets SELAE lists per category. */
function numbersCell(sale: GordoSale, locale: Locale): string {
  if (sale.numbers.length === 1) return `**${sale.numbers[0]}**`;
  const or = { ca: "o", es: "o", en: "or" }[locale];
  const list = `${sale.numbers.slice(0, -1).join(", ")} ${or} ${sale.numbers[sale.numbers.length - 1]}`;
  return { ca: `un d'aquests: ${list}`, es: `uno de estos: ${list}`, en: `one of: ${list}` }[locale];
}

/** A municipality linked to its page; a locality SELAE names that is no single municipality, as SELAE writes it. */
function placeLabel(sale: GordoSale, group: GordoProvinceGroup, locale: Locale): string {
  const m = sale.outlet.municipality;
  if (m) return link(gordoMunicipalityPath(locale, group.province.slug, m.slug), m.name);
  return sale.outlet.locality ?? "";
}

/* -------------------------------------------------------------------------- */
/* Shared sections                                                            */
/* -------------------------------------------------------------------------- */

interface Ctx {
  locale: Locale;
  day: string;
  dayNoYear: string;
  checked: string;
}

function ctx(locale: Locale): Ctx {
  return { locale, day: dayDate(NADAL_DRAW_DATE, locale), dayNoYear: dayDate(NADAL_DRAW_DATE, locale, false), checked: dateYear(GORDO_AS_OF, locale) };
}

const guide = (locale: Locale, label: string) => link(b2href("loteriaNadal", locale), label);
const grossa = (locale: Locale, label: string) => link(b2href("grossa", locale), label);

function timeLine(c: Ctx): string {
  if (DRAW_TIME_2026) {
    const source = link(DRAW_TIME_2026.source.url, DRAW_TIME_2026.source.publisher ?? DRAW_TIME_2026.source.name);
    return { ca: `Comença a les ${DRAW_TIME_2026.time}, segons ${source}.`, es: `Empieza a las ${DRAW_TIME_2026.time}, según ${source}.`, en: `It starts at ${DRAW_TIME_2026.time}, according to ${source}.` }[c.locale];
  }
  const dossier = link(U.dossier2025, { ca: "dossier de premsa del 2025", es: "dosier de prensa de 2025", en: "2025 press dossier" }[c.locale]);
  return {
    ca: `SELAE encara no n'ha anunciat l'hora (${c.checked}); el 2025, segons el seu ${dossier}, la mesa del sorteig es constituïa a les 8:30 i el sorteig durava unes quatre hores.`,
    es: `SELAE aún no ha anunciado la hora (${c.checked}); en 2025, según su ${dossier}, la mesa del sorteo se constituía a las 8:30 y el sorteo duraba unas cuatro horas.`,
    en: `SELAE has not announced the time yet (${c.checked}); in 2025, according to its ${dossier}, the draw's presiding panel sat at 8:30 and the draw took about four hours.`,
  }[c.locale];
}

/** How SELAE publishes the winners, how to check a décimo, how and where to collect, tax, the draw itself. */
function evergreen(c: Ctx): Block[] {
  const { locale } = c;
  const h = (text: string, id?: string) => ({ type: "heading", level: 2, text, ...(id ? { id } : {}) }) as Block;
  if (locale === "ca") {
    return [
      h("Com publica SELAE on ha tocat cada premi", "com-es-publica"),
      ...paras(
        `**Els números**, al ${link(U.lnac, "comprovador de la Loteria Nacional")} de SELAE (Loteries i Apostes de l'Estat), que organitza el sorteig.`,
        `**On s'ha venut cada premi**: SELAE publica una pàgina per premi, «Puntos de venta relacionados», amb l'adreça, la localitat i la província de cada administració que l'ha venut. El 2025, la del ${link(U.first2025, "Gordo")} en llistava quatre: la Pola de Gordón, Villablino i la Bañeza (Lleó) i Madrid. Els quarts i els cinquens premis tenen una sola pàgina per categoria, que no diu quin número va vendre cada punt, i SELAE marca els que l'han venut en part per la seva web (${link(U.third2025, "tercer premi del 2025")}).`,
        `**La Llista Oficial de Premis**, l'única que val per cobrar: la Fábrica Nacional de Moneda y Timbre en fa l'última revisió, i el 2025 es va repartir la tarda del 22 de desembre als punts de venda i als mitjans i es va penjar al web de SELAE (${link(U.dossier2025, "dossier del 2025")}). Aquesta pàgina s'omple amb les pàgines de punts de venda de SELAE i diu a quina hora les ha llegit.`,
      ),
      h("Com comprovar un dècim de manera oficial", "comprovar"),
      list(
        `Al ${link(U.lnac, "comprovador de SELAE")} («Comprueba tus números»), amb el número de cinc xifres.`,
        `A la Llista Oficial de Premis, que SELAE penja en PDF (la del 2025 és ${link(U.list2025, "aquesta")}).`,
        "A qualsevol punt de venda de Loteries de l'Estat.",
        `Si el vas comprar per internet: SELAE avisa per correu, notificació i SMS, i el que val és l'apartat «Apuestas» del teu compte (${link(U.notify, "SELAE")}).`,
      ),
      ...paras(`Segons SELAE, la cantada del sorteig pot tenir errors i es revisa diverses vegades: si un número no és a la Llista Oficial, no es pot reclamar el premi (${link(U.dossier2025, "dossier del 2025")}).`),
      h("On i fins quan es cobra", "cobrar"),
      list(
        `**Menys de 2.000 € per dècim**: a qualsevol dels gairebé 11.000 punts de venda (${link(U.collect, "SELAE")}). El 2025 SELAE va començar a pagar la tarda del mateix 22 de desembre.`,
        `**2.000 € o més**: només a BBVA o CaixaBank, amb el document d'identitat original, sense haver de ser-ne client i sense comissió (${link(U.collect, "SELAE")}).`,
        `**Termini**: tres mesos, comptats des de l'endemà del sorteig (${link(U.dossier2025, "SELAE")}).`,
      ),
      ...paras(`**Impostos.** Cada dècim està exempt fins a 40.000 € i Hisenda reté el 20% de la resta en pagar-lo (${link(U.irpf, "llei de l'IRPF")}). Els càlculs per a cada premi i els dècims compartits són a ${guide("ca", "la guia de la loteria de Nadal")}.`),
      h("Com es fa el sorteig"),
      ...paras(
        `Amb dos bombos: un amb les 100.000 boles dels números i un altre amb les dels premis. Un nen o una nena de la Residència de San Ildefonso treu una bola de cada bombo alhora i dos més les canten (${link(U.dossier2025, "SELAE")}). ${timeLine(c)}`,
        `No s'ha de confondre amb ${grossa("ca", "La Grossa de Cap d'Any")}, la loteria de la Generalitat, que se sorteja el 31 de desembre.`,
      ),
    ];
  }
  if (locale === "es") {
    return [
      h("Cómo publica SELAE dónde ha tocado cada premio", "como-se-publica"),
      ...paras(
        `**Los números**, en el ${link(U.lnac, "comprobador de la Lotería Nacional")} de SELAE (Loterías y Apuestas del Estado), que organiza el sorteo.`,
        `**Dónde se ha vendido cada premio**: SELAE publica una página por premio, «Puntos de venta relacionados», con la dirección, la localidad y la provincia de cada administración que lo vendió. En 2025, la del ${link(U.first2025, "Gordo")} listaba cuatro: La Pola de Gordón, Villablino y La Bañeza (León) y Madrid. Los cuartos y los quintos premios tienen una sola página por categoría, que no dice qué número vendió cada punto, y SELAE marca los que lo vendieron en parte por su web (${link(U.third2025, "tercer premio de 2025")}).`,
        `**La Lista Oficial de Premios**, la única que vale para cobrar: la Fábrica Nacional de Moneda y Timbre hace la última revisión, y en 2025 se repartió la tarde del 22 de diciembre a los puntos de venta y a los medios y se colgó en la web de SELAE (${link(U.dossier2025, "dosier de 2025")}). Esta página se rellena con las páginas de puntos de venta de SELAE y dice a qué hora las ha leído.`,
      ),
      h("Cómo comprobar un décimo de forma oficial", "comprobar"),
      list(
        `En el ${link(U.lnac, "comprobador de SELAE")} («Comprueba tus números»), con el número de cinco cifras.`,
        `En la Lista Oficial de Premios, que SELAE cuelga en PDF (la de 2025 es ${link(U.list2025, "esta")}).`,
        "En cualquier punto de venta de Loterías y Apuestas del Estado.",
        `Si lo compraste por internet: SELAE avisa por correo, notificación y SMS, y lo que vale es el apartado «Apuestas» de tu cuenta (${link(U.notify, "SELAE")}).`,
      ),
      ...paras(`Según SELAE, la cantada del sorteo puede tener errores y se revisa varias veces: si un número no figura en la Lista Oficial, no se puede reclamar el premio (${link(U.dossier2025, "dosier de 2025")}).`),
      h("Dónde y hasta cuándo se cobra", "cobrar"),
      list(
        `**Menos de 2.000 € por décimo**: en cualquiera de los casi 11.000 puntos de venta (${link(U.collect, "SELAE")}). En 2025 SELAE empezó a pagar la tarde del mismo 22 de diciembre.`,
        `**2.000 € o más**: solo en BBVA o CaixaBank, con el documento de identidad original, sin ser cliente y sin comisión (${link(U.collect, "SELAE")}).`,
        `**Plazo**: tres meses, contados desde el día siguiente al sorteo (${link(U.dossier2025, "SELAE")}).`,
      ),
      ...paras(`**Impuestos.** Cada décimo está exento hasta 40.000 € y Hacienda retiene el 20% del resto al pagarlo (${link(U.irpf, "ley del IRPF")}). Los cálculos para cada premio y los décimos compartidos están en ${guide("es", "la guía de la Lotería de Navidad")}.`),
      h("Cómo es el sorteo"),
      ...paras(
        `Con dos bombos: uno con las 100.000 bolas de los números y otro con las de los premios. Un niño o una niña de la Residencia de San Ildefonso saca una bola de cada bombo a la vez y otros dos las cantan (${link(U.dossier2025, "SELAE")}). ${timeLine(c)}`,
        `No hay que confundirla con ${grossa("es", "La Grossa de Cap d'Any")}, la lotería de la Generalitat de Cataluña, que se sortea el 31 de diciembre.`,
      ),
    ];
  }
  return [
    h("How SELAE publishes where each prize was sold", "how-it-is-published"),
    ...paras(
      `**The numbers**, on the ${link(U.lnac, "Lotería Nacional checker")} of SELAE (Loterías y Apuestas del Estado), the state company that runs the draw.`,
      `**Where each prize was sold**: SELAE publishes one page per prize, "Puntos de venta relacionados", with the address, locality and province of every lottery shop that sold it. In 2025, the ${link(U.first2025, "El Gordo page")} listed four: La Pola de Gordón, Villablino and La Bañeza (León) and Madrid. The fourth and fifth prizes have a single page per category, which does not say which number each shop sold, and SELAE marks the shops that sold part of it through its website (${link(U.third2025, "2025 third prize")}).`,
      `**The Lista Oficial de Premios** (official prize list), the only one valid for payment: the Spanish Royal Mint (FNMT) does the last check, and in 2025 it was handed to lottery shops and the media on the afternoon of 22 December and posted on SELAE's website (${link(U.dossier2025, "2025 dossier")}). This page is filled from SELAE's points-of-sale pages and says when it read them.`,
    ),
    h("How to check a décimo officially", "check"),
    list(
      `On ${link(U.lnac, "SELAE's checker")} ("Comprueba tus números"), with the five-digit number.`,
      `On the Lista Oficial de Premios, which SELAE posts as a PDF (${link(U.list2025, "the 2025 one")}).`,
      "At any Loterías y Apuestas del Estado lottery shop.",
      `If you bought it online: SELAE notifies you by email, in-app notice and text message, and the "Apuestas" section of your account is what counts (${link(U.notify, "SELAE")}).`,
    ),
    ...paras(`According to SELAE, numbers can be sung wrongly during the draw and are checked several times: if a number is not on the official list, no prize can be claimed for it (${link(U.dossier2025, "2025 dossier")}).`),
    h("Where and until when to collect", "collect"),
    list(
      `**Under €2,000 per décimo**: at any of almost 11,000 lottery shops (${link(U.collect, "SELAE")}). In 2025 SELAE began paying on the afternoon of 22 December itself.`,
      `**€2,000 or more**: only at BBVA or CaixaBank, with your original ID, without being a customer and with no fee (${link(U.collect, "SELAE")}).`,
      `**Deadline**: three months, counted from the day after the draw (${link(U.dossier2025, "SELAE")}).`,
    ),
    ...paras(`**Tax.** Each décimo is tax-free up to €40,000 and 20% of the rest is withheld when it is paid (${link(U.irpf, "Spanish income tax law")}). Worked examples per prize and for shared décimos are in ${guide("en", "our Spanish Christmas Lottery guide")}.`),
    h("How the draw works"),
    ...paras(
      `Two drums: one with the 100,000 number balls and one with the prize balls. A child from the San Ildefonso residence in Madrid draws a ball from each drum at the same time and two others sing them out (${link(U.dossier2025, "SELAE")}). ${timeLine(c)}`,
      `It is not ${grossa("en", "La Grossa de Cap d'Any")}, the Catalan government's own lottery, drawn on 31 December.`,
    ),
  ];
}

function sourcesBlock(locale: Locale, sources: B2Source[]): Block[] {
  const title = { ca: "Fonts oficials", es: "Fuentes oficiales", en: "Official sources" }[locale];
  return [
    { type: "heading", level: 2, text: title, id: "fonts" } as Block,
    list(...sources.map((source) => `${link(source.url, source.name)} (${source.publisher})`)),
  ];
}

/* -------------------------------------------------------------------------- */
/* Hub                                                                        */
/* -------------------------------------------------------------------------- */

export interface PageMeta {
  title: string;
  description: string;
  h1: string;
  crumb: string;
}

export function hubMeta(locale: Locale, s: GordoSnapshot | null): PageMeta {
  const crumb = { ca: "On ha tocat la loteria de Nadal", es: "Dónde ha tocado el Gordo", en: "Christmas Lottery results" }[locale];
  if (hasResults(s)) {
    const first = s.prizes[0]!.numbers[0]!;
    const towns = gordoTowns(s, "first");
    const where = towns.length ? towns.slice(0, 3) : null;
    return {
      crumb,
      h1: { ca: `On ha tocat la loteria de Nadal ${s.year}? El Gordo és el ${first}`, es: `¿Dónde ha tocado el Gordo de Navidad ${s.year}? Es el ${first}`, en: `Where was El Gordo ${s.year} sold? It is ${first}` }[locale],
      title: {
        ca: `Loteria de Nadal ${s.year}: el Gordo és el ${first}. On ha tocat`,
        es: `Gordo de Navidad ${s.year}: el ${first}. Dónde ha tocado`,
        en: `El Gordo ${s.year} is ${first}: where it was sold, all prizes`,
      }[locale],
      description: {
        ca: `El Gordo de la loteria de Nadal ${s.year} és el ${first} (400.000 € per dècim)${where ? `, venut ${caA(join(where, "ca"))}` : ""}. Tots els premis grossos i on s'han venut, segons SELAE.`,
        es: `El Gordo de la Lotería de Navidad ${s.year} es el ${first} (400.000 € al décimo)${where ? `, vendido en ${join(where, "es")}` : ""}. Premios principales y dónde han tocado, según SELAE.`,
        en: `El Gordo ${s.year} is ${first} (€400,000 per décimo)${where ? `, sold in ${join(where.map(cap), "en")}` : ""}. Every main prize and where it was sold, from SELAE's lists.`,
      }[locale],
    };
  }
  return {
    crumb,
    h1: { ca: "On ha tocat la loteria de Nadal 2026?", es: "¿Dónde ha tocado el Gordo de Navidad 2026?", en: "Where did El Gordo 2026 fall? Spanish Christmas Lottery results" }[locale],
    title: { ca: "On ha tocat la loteria de Nadal 2026? Resultats del Gordo", es: "¿Dónde ha tocado el Gordo de Navidad 2026? Resultados", en: "Where did El Gordo 2026 fall? Christmas Lottery results" }[locale],
    description: {
      ca: "El 22 de desembre, el Gordo i els premis grossos de la loteria de Nadal 2026 i on s'han venut, per províncies i municipis, segons SELAE. Com comprovar el dècim.",
      es: "El 22 de diciembre, el Gordo y los premios principales de la Lotería de Navidad 2026 y dónde se han vendido, por provincias y municipios, según SELAE.",
      en: "On 22 December: El Gordo and the main Spanish Christmas Lottery 2026 prizes, and where they were sold, by province and town, from SELAE. How to check.",
    }[locale],
  };
}

/** The municipalities (or SELAE localities) that sold a prize, in province order, each once. */
export function gordoTowns(s: GordoSnapshot, key: GordoPrizeKey): string[] {
  const out: string[] = [];
  for (const sale of s.prizes.find((p) => p.key === key)?.outlets ?? []) {
    if (sale.channel !== "outlet") continue;
    const name = sale.municipality?.name ?? sale.locality ?? "";
    if (name && !out.includes(name)) out.push(name);
  }
  return out;
}

function hubLead(locale: Locale, s: GordoSnapshot | null, c: Ctx): string {
  if (!hasResults(s)) {
    return {
      ca: `**El sorteig de la loteria de Nadal 2026 és el ${c.dayNoYear} al Teatro Real de Madrid. Aquell dia, aquí hi haurà el Gordo i la resta de premis grossos (segon, tercer, quarts i cinquens) i totes les administracions que els han venut, província per província i municipi per municipi, segons les llistes oficials de SELAE.** Mentrestant: com es publica on ha tocat cada premi, com comprovar un dècim i on es cobra.`,
      es: `**El sorteo de la Lotería de Navidad 2026 es el ${c.dayNoYear} en el Teatro Real de Madrid. Ese día, aquí estarán el Gordo y los demás premios principales (segundo, tercero, cuartos y quintos) y todas las administraciones que los han vendido, provincia por provincia y municipio por municipio, según las listas oficiales de SELAE.** Mientras tanto: cómo se publica dónde ha tocado cada premio, cómo comprobar un décimo y dónde se cobra.`,
      en: `**The Spanish Christmas Lottery 2026 is drawn on ${c.dayNoYear} at the Teatro Real in Madrid. On the day, this page will carry El Gordo and the other main prizes (second, third, fourth and fifth) and every lottery shop that sold them, province by province and town by town, from SELAE's official lists.** Until then: how the winners are published, how to check a décimo and where to collect.`,
    }[locale];
  }
  const [first, second, third] = [s.prizes[0]!, s.prizes[1]!, s.prizes[2]!];
  const towns = gordoTowns(s, "first");
  const firstWhere =
    first.outlets === null
      ? { ca: "SELAE encara no ha publicat on s'ha venut", es: "SELAE aún no ha publicado dónde se ha vendido", en: "SELAE has not yet published where it was sold" }[locale]
      : towns.length
        ? { ca: `venut ${caA(join(towns, "ca"))}`, es: `vendido en ${join(towns, "es")}`, en: `sold in ${join(towns.map(cap), "en")}` }[locale]
        : { ca: "venut per internet", es: "vendido por internet", en: "sold online" }[locale];
  const rest = [
    second.numbers[0] ? { ca: `el segon, el ${second.numbers[0]}`, es: `el segundo, el ${second.numbers[0]}`, en: `second ${second.numbers[0]}` }[locale] : null,
    third.numbers[0] ? { ca: `el tercer, el ${third.numbers[0]}`, es: `el tercero, el ${third.numbers[0]}`, en: `third ${third.numbers[0]}` }[locale] : null,
  ].filter(Boolean) as string[];
  const stamp = readStamp(s, locale);
  return {
    ca: `**El ${first.numbers[0]} és el Gordo de la loteria de Nadal ${s.year}: 400.000 € per dècim de 20 €, ${firstWhere}.**${rest.length ? ` ${cap(join(rest, "ca"))}.` : ""} Més avall, on s'ha venut cada premi gros, per províncies i municipis, segons les pàgines de SELAE llegides ${stamp}.`,
    es: `**El ${first.numbers[0]} es el Gordo de la Lotería de Navidad ${s.year}: 400.000 € por décimo de 20 €, ${firstWhere}.**${rest.length ? ` ${cap(join(rest, "es"))}.` : ""} Más abajo, dónde se ha vendido cada premio principal por provincias y municipios, según las páginas de SELAE leídas ${stamp}.`,
    en: `**${first.numbers[0]} is El Gordo of the ${s.year} Spanish Christmas Lottery: €400,000 per €20 décimo, ${firstWhere}.**${rest.length ? ` ${cap(join(rest, "en"))}.` : ""} Below, where each main prize was sold, by province and town, from SELAE's pages read ${stamp}.`,
  }[locale];
}

function hubFacts(locale: Locale, s: GordoSnapshot | null, c: Ctx): Block {
  const title = { ca: "La loteria de Nadal 2026, d'un cop d'ull", es: "La Lotería de Navidad 2026, de un vistazo", en: "The 2026 draw at a glance" }[locale];
  const items: { label: string; value: string }[] = [];
  if (hasResults(s)) {
    for (const prize of s.prizes) {
      const value = prize.numbers.length ? `${prize.numbers.join(", ")} (${eur(prize.perDecimo, locale)} ${{ ca: "per dècim", es: "al décimo", en: "per décimo" }[locale]})` : { ca: "Encara no ha sortit", es: "Aún no ha salido", en: "Not drawn yet" }[locale];
      items.push({ label: prizeName(prize.key, locale), value });
    }
  } else {
    items.push(
      { label: { ca: "Sorteig", es: "Sorteo", en: "Draw" }[locale], value: { ca: `${cap(c.day)}, Teatro Real de Madrid (sorteig 102)`, es: `${cap(c.day)}, Teatro Real de Madrid (sorteo 102)`, en: `${cap(c.day)}, Teatro Real, Madrid (draw 102)` }[locale] },
      { label: prizeName("first", locale), value: { ca: "400.000 € per dècim de 20 €", es: "400.000 € por décimo de 20 €", en: "€400,000 per €20 décimo" }[locale] },
      { label: { ca: "Altres premis grossos", es: "Otros premios principales", en: "Other main prizes" }[locale], value: { ca: "Segon, 125.000 €; tercer, 50.000 €; dos quarts de 20.000 € i vuit cinquens de 6.000 € per dècim", es: "Segundo, 125.000 €; tercero, 50.000 €; dos cuartos de 20.000 € y ocho quintos de 6.000 € por décimo", en: "Second €125,000; third €50,000; two fourths of €20,000 and eight fifths of €6,000 per décimo" }[locale] },
      { label: { ca: "Llista que val per cobrar", es: "Lista que vale para cobrar", en: "List valid for payment" }[locale], value: { ca: "La Llista Oficial de Premis de SELAE", es: "La Lista Oficial de Premios de SELAE", en: "SELAE's Lista Oficial de Premios" }[locale] },
    );
  }
  items.push({ label: { ca: "Termini per cobrar", es: "Plazo para cobrar", en: "Deadline to collect" }[locale], value: { ca: "Tres mesos des de l'endemà del sorteig", es: "Tres meses desde el día siguiente al sorteo", en: "Three months from the day after the draw" }[locale] });
  return keyFacts(title, items);
}

/** "1 punto de venta", "3 puntos de venta". */
function pointsOfSale(n: number, locale: Locale): string {
  return { ca: n === 1 ? "1 punt de venda" : `${n} punts de venda`, es: n === 1 ? "1 punto de venta" : `${n} puntos de venta`, en: n === 1 ? "1 lottery shop" : `${n} lottery shops` }[locale];
}

/** One line per province: its municipalities (linked) or SELAE's localities, and how many points of sale. */
function whereLines(s: GordoSnapshot, key: GordoPrizeKey, locale: Locale): string[] {
  const lines: string[] = [];
  for (const group of provinceGroups(s)) {
    const list = group.sales.filter((sale) => sale.prize === key);
    if (!list.length) continue;
    const places: string[] = [];
    for (const sale of list) {
      const label = placeLabel(sale, group, locale);
      if (!places.includes(label)) places.push(label);
    }
    lines.push(`**${link(gordoProvincePath(locale, group.province.slug), group.province.name)}** (${pointsOfSale(list.length, locale)}): ${places.join(", ")}`);
  }
  const web = webSales(s).filter((sale) => sale.prize === key).length;
  if (web) lines.push(cap(WEB_LABEL[locale]));
  return lines;
}

export function hubBlocks(locale: Locale, s: GordoSnapshot | null): Block[] {
  const c = ctx(locale);
  const blocks: Block[] = [lead(hubLead(locale, s, c)), hubFacts(locale, s, c)];
  const data = {
    ca: "Els números i els punts de venda són els que publica SELAE (Loteries i Apostes de l'Estat), que organitza el sorteig; els municipis són els de l'INE que coincideixen amb la localitat que escriu SELAE. Per cobrar només val la Llista Oficial de Premis.",
    es: "Los números y los puntos de venta son los que publica SELAE (Loterías y Apuestas del Estado), que organiza el sorteo; los municipios son los del INE que coinciden con la localidad que escribe SELAE. Para cobrar solo vale la Lista Oficial de Premios.",
    en: "Numbers and points of sale are those SELAE (Loterías y Apuestas del Estado), which runs the draw, publishes; towns are the INE municipalities matching the locality SELAE prints. Only the Lista Oficial de Premios is valid for payment.",
  }[locale];
  blocks.push(callout("official", hasResults(s) ? { ca: `Llegit a SELAE ${readStamp(s, locale)}`, es: `Leído en SELAE ${readStamp(s, locale)}`, en: `Read from SELAE ${readStamp(s, locale)}` }[locale] : verifiedLine(locale, GORDO_AS_OF), data));

  const resultsHeading = { ca: "Números premiats i on s'han venut", es: "Números premiados y dónde se han vendido", en: "Winning numbers and where they were sold" }[locale];
  blocks.push({ type: "heading", level: 2, text: resultsHeading, id: "resultats" } as Block);
  if (!hasResults(s)) {
    blocks.push(
      ...paras(
        {
          ca: `El sorteig és el ${c.day}. Tan bon punt SELAE publiqui els números i les pàgines de punts de venda de cada premi, aquí hi haurà una taula amb el Gordo, el segon, el tercer, els dos quarts i els vuit cinquens premis, i una pàgina per a cada província i cada municipi on s'han venut. Les dades d'anys anteriors, i els municipis de Catalunya, són a ${guide("ca", "la guia de la loteria de Nadal")}.`,
          es: `El sorteo es el ${c.day}. En cuanto SELAE publique los números y las páginas de puntos de venta de cada premio, aquí habrá una tabla con el Gordo, el segundo, el tercero, los dos cuartos y los ocho quintos premios, y una página para cada provincia y cada municipio donde se han vendido. Los datos de años anteriores, y los municipios de Cataluña, están en ${guide("es", "la guía de la Lotería de Navidad")}.`,
          en: `The draw is on ${c.day}. As soon as SELAE publishes the numbers and each prize's points-of-sale page, this page will carry a table with El Gordo, the second and third prizes, the two fourth and the eight fifth prizes, plus a page for every province and town where they were sold. Previous years, and the Catalan towns, are in ${guide("en", "our Spanish Christmas Lottery guide")}.`,
        }[locale],
      ),
    );
  } else {
    const headers = {
      ca: ["Premi", "Número", "Per dècim (20 €)", "Punts de venda"],
      es: ["Premio", "Número", "Por décimo (20 €)", "Puntos de venta"],
      en: ["Prize", "Number", "Per €20 décimo", "Points of sale"],
    }[locale];
    const pending = { ca: "SELAE encara no els ha publicat", es: "SELAE aún no los ha publicado", en: "Not yet published by SELAE" }[locale];
    const rows = s.prizes.map((prize) => [
      prizeName(prize.key, locale),
      prize.numbers.length ? prize.numbers.map((n) => `**${n}**`).join(", ") : { ca: "Encara no ha sortit", es: "Aún no ha salido", en: "Not drawn yet" }[locale],
      eur(prize.perDecimo, locale),
      prize.outlets === null ? pending : String(prize.outlets.length),
    ]);
    blocks.push(table({ ca: `Premis grossos de la loteria de Nadal ${s.year}`, es: `Premios principales de la Lotería de Navidad ${s.year}`, en: `Main prizes of the ${s.year} Spanish Christmas Lottery` }[locale], headers, rows, { ca: "Font: SELAE. Per cobrar només val la Llista Oficial de Premis.", es: "Fuente: SELAE. Para cobrar solo vale la Lista Oficial de Premios.", en: "Source: SELAE. Only the Lista Oficial de Premios is valid for payment." }[locale]));
    for (const prize of s.prizes) {
      if (!prize.numbers.length) continue;
      const heading = `${NAMES[locale][prize.key].heading} (${prize.numbers.join(", ")})`;
      blocks.push({ type: "heading", level: 3, text: heading } as Block);
      if (prize.outlets === null) {
        blocks.push(...paras({ ca: "SELAE encara no ha publicat on s'ha venut.", es: "SELAE aún no ha publicado dónde se ha vendido.", en: "SELAE has not yet published where it was sold." }[locale]));
        continue;
      }
      const lines = whereLines(s, prize.key, locale);
      if (prize.key === "fourth" || prize.key === "fifth") {
        lines.push({ ca: "SELAE no diu quin dels números va vendre cada punt.", es: "SELAE no dice cuál de los números vendió cada punto.", en: "SELAE does not say which of the numbers each shop sold." }[locale]);
      }
      blocks.push(list(...lines));
    }
    const groups = provinceGroups(s);
    if (groups.length) {
      blocks.push({ type: "heading", level: 2, text: { ca: "Per províncies", es: "Por provincias", en: "By province" }[locale], id: "provincies" } as Block);
      blocks.push(list(...groups.map((g) => `${link(gordoProvincePath(locale, g.province.slug), g.province.name)}: ${pointsOfSale(g.sales.length, locale)}`)));
    }
  }

  blocks.push(...evergreen(c));
  blocks.push(faq(hubFaq(locale, s, c).map((item) => ({ question: item.question, answer: strip(item.answer) }))));
  blocks.push(...sourcesBlock(locale, gordoSources(s)));
  blocks.push(...paras(verifiedLine(locale, GORDO_AS_OF)));
  return blocks;
}

export function hubFaq(locale: Locale, s: GordoSnapshot | null, c: Ctx = ctx(locale)): { question: string; answer: string }[] {
  const first = hasResults(s) ? s.prizes[0]!.numbers[0]! : null;
  if (locale === "ca") {
    return [
      { question: "Quan és el sorteig de la loteria de Nadal 2026?", answer: `El ${c.day}, al Teatro Real de Madrid. ${strip(timeLine(c))}` },
      { question: "On es mira on ha tocat el Gordo?", answer: first ? `El Gordo del 2026 és el ${first}; on s'ha venut és a la taula d'aquesta pàgina, amb les pàgines de punts de venda de SELAE.` : "SELAE publica una pàgina per premi amb les administracions que l'han venut; aquesta pàgina les recull per províncies i municipis el dia del sorteig." },
      { question: "Quant paga el Gordo?", answer: "400.000 € per dècim de 20 € (4 milions per bitllet). Cada dècim està exempt fins a 40.000 € i Hisenda reté el 20% de la resta." },
      { question: "Quina llista val per cobrar?", answer: "Només la Llista Oficial de Premis de SELAE, que el 2025 es va repartir la tarda del 22 de desembre." },
    ];
  }
  if (locale === "es") {
    return [
      { question: "¿Cuándo es el sorteo de la Lotería de Navidad 2026?", answer: `El ${c.day}, en el Teatro Real de Madrid. ${strip(timeLine(c))}` },
      { question: "¿Dónde se mira dónde ha tocado el Gordo?", answer: first ? `El Gordo de 2026 es el ${first}; dónde se ha vendido está en la tabla de esta página, con las páginas de puntos de venta de SELAE.` : "SELAE publica una página por premio con las administraciones que lo vendieron; esta página las recoge por provincias y municipios el día del sorteo." },
      { question: "¿Cuánto paga el Gordo?", answer: "400.000 € por décimo de 20 € (4 millones por billete). Cada décimo está exento hasta 40.000 € y Hacienda retiene el 20% del resto." },
      { question: "¿Qué lista vale para cobrar?", answer: "Solo la Lista Oficial de Premios de SELAE, que en 2025 se repartió la tarde del 22 de diciembre." },
    ];
  }
  return [
    { question: "When is the 2026 Spanish Christmas Lottery draw?", answer: `On ${c.day}, at the Teatro Real in Madrid. ${strip(timeLine(c))}` },
    { question: "Where can I see where El Gordo was sold?", answer: first ? `El Gordo 2026 is ${first}; where it was sold is in the table on this page, from SELAE's points-of-sale pages.` : "SELAE publishes one page per prize listing the shops that sold it; on the day this page gathers them by province and town." },
    { question: "How much does El Gordo pay?", answer: "€400,000 per €20 décimo (€4 million per full ticket). Each décimo is tax-free up to €40,000 and 20% of the rest is withheld." },
    { question: "Which list is valid for payment?", answer: "Only SELAE's Lista Oficial de Premios, handed out on the afternoon of 22 December in 2025." },
  ];
}

/* -------------------------------------------------------------------------- */
/* Province and municipality                                                  */
/* -------------------------------------------------------------------------- */

function saleRowsHeaders(locale: Locale, withPlace: boolean): string[] {
  const t = {
    ca: ["Premi", "Número", "Per dècim", "Municipi", "Adreça (SELAE)"],
    es: ["Premio", "Número", "Por décimo", "Municipio", "Dirección (SELAE)"],
    en: ["Prize", "Number", "Per décimo", "Town", "Address (SELAE)"],
  }[locale];
  return withPlace ? t : t.filter((_, i) => i !== 3);
}

function saleRow(sale: GordoSale, locale: Locale, place: string | null): string[] {
  const address = `${sale.outlet.address ?? ""}${sale.outlet.viaWeb ? ` (${VIA_WEB[locale]})` : ""}`;
  const row = [prizeName(sale.prize, locale), numbersCell(sale, locale), eur(sale.perDecimo, locale)];
  return place === null ? [...row, address] : [...row, place, address];
}

/** "el Gordo, el segon premi i els cinquens premis". */
function prizesLine(list: readonly GordoSale[], locale: Locale): string {
  return join(prizesIn(list).map((key) => NAMES[locale][key].inText), locale);
}

export function provinceMeta(locale: Locale, s: GordoSnapshot, g: GordoProvinceGroup): PageMeta {
  const P = g.province.name;
  const gordo = g.sales.some((sale) => sale.prize === "first");
  return {
    crumb: P,
    h1: { ca: `On ha tocat la loteria de Nadal ${s.year} a la província de ${P}`, es: `Lotería de Navidad ${s.year} en ${P}: dónde ha tocado`, en: `Spanish Christmas Lottery ${s.year} in ${P}: where prizes were sold` }[locale],
    title: {
      ca: `On ha tocat ${gordo ? "el Gordo i " : ""}la loteria de Nadal ${s.year}: ${P}`,
      es: `${gordo ? "Gordo y Lotería" : "Lotería"} de Navidad ${s.year} en ${P}: dónde ha tocado`,
      en: `Christmas Lottery ${s.year} in ${P}: where ${gordo ? "El Gordo and prizes" : "prizes"} fell`,
    }[locale],
    description: {
      ca: `Els ${g.sales.length} punts de venda de la província de ${P} que han venut ${prizesLine(g.sales, "ca")} de la loteria de Nadal ${s.year}, amb municipi i adreça, segons SELAE.`,
      es: `Los ${g.sales.length} puntos de venta de la provincia de ${P} que han vendido ${prizesLine(g.sales, "es")} de la Lotería de Navidad ${s.year}, con municipio y dirección, según SELAE.`,
      en: `The ${g.sales.length} lottery shops in ${P} province that sold ${prizesLine(g.sales, "en")} of the ${s.year} Spanish Christmas Lottery, with town and address, from SELAE.`,
    }[locale],
  };
}

export function provinceBlocks(locale: Locale, s: GordoSnapshot, g: GordoProvinceGroup): Block[] {
  const P = g.province.name;
  const stamp = readStamp(s, locale);
  const towns = g.municipalities.map((m) => m.municipality.name);
  const blocks: Block[] = [
    lead(
      {
        ca: `**SELAE llista ${g.sales.length === 1 ? "1 punt de venda" : `${g.sales.length} punts de venda`} de la província de ${P} que ${g.sales.length === 1 ? "ha venut" : "han venut"} ${prizesLine(g.sales, "ca")} de la loteria de Nadal ${s.year}.**${towns.length ? ` Municipis: ${join(towns, "ca")}.` : ""} Dades de les pàgines de punts de venda de SELAE llegides ${stamp}.`,
        es: `**SELAE lista ${g.sales.length === 1 ? "1 punto de venta" : `${g.sales.length} puntos de venta`} de la provincia de ${P} que ${g.sales.length === 1 ? "ha vendido" : "han vendido"} ${prizesLine(g.sales, "es")} de la Lotería de Navidad ${s.year}.**${towns.length ? ` Municipios: ${join(towns, "es")}.` : ""} Datos de las páginas de puntos de venta de SELAE leídas ${stamp}.`,
        en: `**SELAE lists ${g.sales.length === 1 ? "1 lottery shop" : `${g.sales.length} lottery shops`} in ${P} province that sold ${prizesLine(g.sales, "en")} of the ${s.year} Spanish Christmas Lottery.**${towns.length ? ` Towns: ${join(towns, "en")}.` : ""} From SELAE's points-of-sale pages, read ${stamp}.`,
      }[locale],
    ),
    callout("official", { ca: "Per cobrar només val la Llista Oficial de Premis", es: "Para cobrar solo vale la Lista Oficial de Premios", en: "Only the official prize list is valid for payment" }[locale], {
      ca: `Comprova el teu dècim al ${link(U.lnac, "comprovador de SELAE")}. Tots els números i la resta de províncies són a ${link(gordoHubPath("ca"), "on ha tocat la loteria de Nadal")}.`,
      es: `Comprueba tu décimo en el ${link(U.lnac, "comprobador de SELAE")}. Todos los números y el resto de provincias están en ${link(gordoHubPath("es"), "dónde ha tocado el Gordo")}.`,
      en: `Check your décimo on ${link(U.lnac, "SELAE's checker")}. All numbers and the other provinces are on ${link(gordoHubPath("en"), "the results page")}.`,
    }[locale]),
  ];
  for (const key of prizesIn(g.sales)) {
    const list = g.sales.filter((sale) => sale.prize === key);
    blocks.push({ type: "heading", level: 2, text: `${NAMES[locale][key].heading}: ${P}` } as Block);
    blocks.push(table(`${prizeName(key, locale)} · ${P}`, saleRowsHeaders(locale, true), list.map((sale) => saleRow(sale, locale, placeLabel(sale, g, locale)))));
  }
  if (g.municipalities.length) {
    blocks.push({ type: "heading", level: 2, text: { ca: "Per municipis", es: "Por municipios", en: "By town" }[locale] } as Block);
    blocks.push(list(...g.municipalities.map((m) => `${link(gordoMunicipalityPath(locale, g.province.slug, m.municipality.slug), m.municipality.name)}: ${prizesLine(m.sales, locale)}`)));
  }
  const unmatched = g.sales.filter((sale) => !sale.outlet.municipality).length;
  blocks.push(
    ...paras(
      {
        ca: `Els quarts i els cinquens premis tenen una sola llista per categoria: SELAE no diu quin dels números va vendre cada punt.${unmatched ? " Quan SELAE escriu una localitat que no és el nom d'un municipi (un nucli, una urbanització), la deixem tal com l'escriu." : ""} On i com es cobra, a ${link(gordoHubPath("ca") + "#cobrar", "com es cobra")}; els impostos, a ${guide("ca", "la guia de la loteria de Nadal")}.`,
        es: `Los cuartos y los quintos premios tienen una sola lista por categoría: SELAE no dice cuál de los números vendió cada punto.${unmatched ? " Cuando SELAE escribe una localidad que no es el nombre de un municipio (un núcleo, una urbanización), la dejamos tal como la escribe." : ""} Dónde y cómo se cobra, en ${link(gordoHubPath("es") + "#cobrar", "cómo se cobra")}; los impuestos, en ${guide("es", "la guía de la Lotería de Navidad")}.`,
        en: `The fourth and fifth prizes have one list per category: SELAE does not say which number each shop sold.${unmatched ? " Where SELAE prints a locality that is not a municipality's name (a village or estate), it is shown as SELAE writes it." : ""} Where and how to collect: ${link(gordoHubPath("en") + "#collect", "collecting a prize")}; tax: ${guide("en", "our Spanish Christmas Lottery guide")}.`,
      }[locale],
    ),
  );
  blocks.push(...sourcesBlock(locale, gordoSources(s, prizesIn(g.sales), true)));
  return blocks;
}

export function municipalityMeta(locale: Locale, s: GordoSnapshot, m: GordoMunicipalityGroup): PageMeta {
  const M = m.municipality.name;
  const gordo = m.sales.find((sale) => sale.prize === "first");
  const n = gordo?.numbers[0];
  return {
    crumb: cap(M),
    h1: {
      ca: gordo ? `El Gordo de Nadal ${s.year} ha tocat ${caA(M)}: el ${n}` : `Loteria de Nadal ${s.year}: premis venuts ${caA(M)}`,
      es: gordo ? `El Gordo de Navidad ${s.year} ha tocado en ${M}: el ${n}` : `Lotería de Navidad ${s.year} en ${M}: premios vendidos`,
      en: gordo ? `El Gordo ${s.year} was sold in ${cap(M)}: ${n}` : `Spanish Christmas Lottery ${s.year} in ${cap(M)}: prizes sold`,
    }[locale],
    title: {
      ca: gordo ? `Gordo de Nadal ${s.year} ${caA(M)}: el ${n}` : `Loteria de Nadal ${s.year} ${caA(M)}: on ha tocat`,
      es: gordo ? `Gordo de Navidad ${s.year} en ${M}: el ${n}` : `Lotería de Navidad ${s.year} en ${M}: dónde ha tocado`,
      en: gordo ? `El Gordo ${s.year} in ${cap(M)}: ${n}, where it was sold` : `Christmas Lottery ${s.year} in ${cap(M)}: prizes sold`,
    }[locale],
    description: {
      ca: `${cap(prizesLine(m.sales, "ca"))} de la loteria de Nadal ${s.year} venuts ${caA(M)} (${m.province.name}): números, adreces de les administracions i com cobrar, segons SELAE.`,
      es: `${cap(prizesLine(m.sales, "es"))} de la Lotería de Navidad ${s.year} vendidos en ${M} (${m.province.name}): números, direcciones de las administraciones y cómo cobrar.`,
      en: `${cap(prizesLine(m.sales, "en"))} of the ${s.year} Spanish Christmas Lottery sold in ${cap(M)} (${m.province.name}): numbers, shop addresses and how to collect, from SELAE.`,
    }[locale],
  };
}

export function municipalityBlocks(locale: Locale, s: GordoSnapshot, m: GordoMunicipalityGroup): Block[] {
  const M = m.municipality.name;
  const stamp = readStamp(s, locale);
  const count = m.sales.length;
  const provincePage = link(gordoProvincePath(locale, m.province.slug), m.province.name);
  const blocks: Block[] = [
    lead(
      {
        ca: `**SELAE llista ${count === 1 ? "1 punt de venda" : `${count} punts de venda`} ${caA(M)} (província de ${m.province.name}) que ${count === 1 ? "ha venut" : "han venut"} ${prizesLine(m.sales, "ca")} de la loteria de Nadal ${s.year}.** Dades de les pàgines de punts de venda de SELAE llegides ${stamp}.`,
        es: `**SELAE lista ${count === 1 ? "1 punto de venta" : `${count} puntos de venta`} en ${M} (provincia de ${m.province.name}) que ${count === 1 ? "ha vendido" : "han vendido"} ${prizesLine(m.sales, "es")} de la Lotería de Navidad ${s.year}.** Datos de las páginas de puntos de venta de SELAE leídas ${stamp}.`,
        en: `**SELAE lists ${count === 1 ? "1 lottery shop" : `${count} lottery shops`} in ${cap(M)} (${m.province.name} province) that sold ${prizesLine(m.sales, "en")} of the ${s.year} Spanish Christmas Lottery.** From SELAE's points-of-sale pages, read ${stamp}.`,
      }[locale],
    ),
    table(
      { ca: `Premis venuts ${caA(M)}`, es: `Premios vendidos en ${M}`, en: `Prizes sold in ${cap(M)}` }[locale],
      saleRowsHeaders(locale, false),
      m.sales.map((sale) => saleRow(sale, locale, null)),
      { ca: "Font: SELAE. Per cobrar només val la Llista Oficial de Premis.", es: "Fuente: SELAE. Para cobrar solo vale la Lista Oficial de Premios.", en: "Source: SELAE. Only the Lista Oficial de Premios is valid for payment." }[locale],
    ),
    ...paras(
      {
        ca: `Comprova el teu dècim al ${link(U.lnac, "comprovador de SELAE")}. Els altres municipis de la província: ${provincePage}. Tots els números: ${link(gordoHubPath("ca"), "on ha tocat la loteria de Nadal")}. Menys de 2.000 € per dècim es cobren a qualsevol punt de venda, i 2.000 € o més, a BBVA o CaixaBank (${link(U.collect, "SELAE")}); els impostos, a ${guide("ca", "la guia de la loteria de Nadal")}.`,
        es: `Comprueba tu décimo en el ${link(U.lnac, "comprobador de SELAE")}. Los demás municipios de la provincia: ${provincePage}. Todos los números: ${link(gordoHubPath("es"), "dónde ha tocado el Gordo")}. Menos de 2.000 € por décimo se cobran en cualquier punto de venta, y 2.000 € o más, en BBVA o CaixaBank (${link(U.collect, "SELAE")}); los impuestos, en ${guide("es", "la guía de la Lotería de Navidad")}.`,
        en: `Check your décimo on ${link(U.lnac, "SELAE's checker")}. Other towns in the province: ${provincePage}. All numbers: ${link(gordoHubPath("en"), "the results page")}. Under €2,000 per décimo is paid at any lottery shop, €2,000 or more at BBVA or CaixaBank (${link(U.collect, "SELAE")}); tax is in ${guide("en", "our Spanish Christmas Lottery guide")}.`,
      }[locale],
    ),
  ];
  if (m.sales.some((sale) => sale.prize === "fourth" || sale.prize === "fifth")) {
    blocks.push(...paras({ ca: "SELAE no diu quin dels números dels quarts o dels cinquens premis va vendre cada punt.", es: "SELAE no dice cuál de los números de los cuartos o de los quintos premios vendió cada punto.", en: "SELAE does not say which of the fourth or fifth prize numbers each shop sold." }[locale]));
  }
  blocks.push(...sourcesBlock(locale, gordoSources(s, prizesIn(m.sales), true)));
  return blocks;
}

/** Clamp to a length, at a word, for the <title> and description budgets. */
export function clampText(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,:;]$/, "")}…`;
}
