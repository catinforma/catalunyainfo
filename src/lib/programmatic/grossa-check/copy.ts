/**
 * Copy of the La Grossa de Cap d'Any checker page ("Comprovar La Grossa de
 * Cap d'Any 2026"), in Catalan, Spanish and English. Server-side. Every
 * figure comes from programme.ts (DOGC 9640, annex 3, read 19 Nov 2026), the
 * lottery-tax engine (Ley 35/2006, DA 33ª) or the snapshot; every other fact
 * from the pages the lottery guide (src/lib/content/batch02/grossa.ts)
 * already cites, read on the dates that module records. The worked examples
 * use the real 2025 numbers (Loteries de Catalunya, 31 Dec 2025), always
 * with their year. Text in `[label](href)` and `**bold**` markup.
 */

import { dateYear, dayDate } from "@/lib/content/batch02/festive";
import { DRAW_TIME_2026, DRAW_TIME_CHECKED, GROSSA_URLS, RESULTS_2025 } from "@/lib/content/batch02/grossa";
import { b2href } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { gordoHubPath } from "@/lib/programmatic/gordo/paths";
import { checkPath } from "@/lib/programmatic/lottery-check/paths";
import { money, num } from "@/lib/programmatic/lottery-tax/copy";
import { breakdown } from "@/lib/programmatic/lottery-tax/engine";
import { EXEMPT_PER_TICKET } from "@/lib/programmatic/lottery-tax/rules";
import { ninoCheckPath } from "@/lib/programmatic/nino-check/paths";

import { PRIZE_LABEL, barcelonaTime } from "./client-copy";
import type { GrossaCheckerData } from "./data";
import { neighbours, prizesOf, type GrossaDraw } from "./engine";
import { DRAWN, DRAW_DATE, GROSSA_YEAR, PRIZE_ORDER, PRIZE_SHARE, QUOTE, SERIES, SOURCES, TICKET_PRICE, TIER_COUNT, eurosPerSeries, extractionOf, type PrizeKey, type Tier } from "./programme";

/** The day the page's facts were last checked (the DOGC annex and ECO/425/2022 read; Loteries de Catalunya's .cat site re-tested, 403). */
export const GROSSA_CHECK_AS_OF = "2026-11-19";

export const TITLE_LIMIT = 65;
export const DESCRIPTION_LIMIT = 160;

const link = (href: string, label: string) => `[${label}](${href})`;
const L = <T,>(locale: Locale, v: Record<Locale, T>): T => v[locale];
const U = GROSSA_URLS;

export const M = (n: number, locale: Locale) => money(n, locale);
const count = (n: number, locale: Locale) => num(n, 0, locale);

/** The 2025 draw as a GrossaDraw: the worked examples run the engine on it. */
export const DRAW_2025: GrossaDraw = { first: RESULTS_2025.first, second: RESULTS_2025.second, third: RESULTS_2025.third, fourth: [...RESULTS_2025.fourth], fifth: [...RESULTS_2025.fifth] };
/** A 2025 number that won two prizes at once: next to the second (92574) and ending in 75 like a fifth (68675). */
export const EXAMPLE_TWO = "92575";

export const drawDay = (locale: Locale, withYear = true) => dayDate(DRAW_DATE, locale, withYear);

export function grossaCheckSources(data: GrossaCheckerData): { name: string; url: string; publisher: string }[] {
  const out: { name: string; url: string; publisher: string }[] = [];
  if (data.available && data.sources) {
    out.push({ name: `Resultats de La Grossa de Cap d'Any ${data.year}`, url: data.sources.results, publisher: "Loteries de Catalunya" });
    if (data.sources.press) out.push({ name: `La Grossa de Cap d'Any ${data.year}: números premiats (nota de premsa)`, url: data.sources.press, publisher: "Loteries de Catalunya" });
  }
  const seen = new Set(out.map((s) => s.url));
  for (const s of [
    SOURCES.dogc,
    SOURCES.eco425,
    SOURCES.game,
    SOURCES.results,
    { name: "Pagament de premis", url: U.payment, publisher: "Loteries de Catalunya" },
    { name: "Preguntes freqüents", url: U.faq, publisher: "Loteries de Catalunya" },
    SOURCES.press,
    { name: "La Grossa de Cap d'Any reparteix 14.087.610 d'euros per tot Catalunya (31/12/2025)", url: U.press2025, publisher: "Loteries de Catalunya" },
    { name: "La Grossa de Cap d'Any 2026: obertura i tancament de la venda (sistema de venda)", url: U.sales2026, publisher: "Loteries de Catalunya" },
    { name: "El 01379, primer premi de la Grossa de Cap d'Any 2025 (31/12/2025)", url: U.tv2025, publisher: "3Cat" },
    ...(DRAW_TIME_2026 ? [{ name: DRAW_TIME_2026.source.name, url: DRAW_TIME_2026.source.url, publisher: DRAW_TIME_2026.source.publisher ?? "" }] : []),
    { name: "Ley 35/2006, del IRPF, disposición adicional trigésima tercera", url: U.irpf, publisher: "BOE" },
  ]) {
    if (seen.has(s.url)) continue;
    seen.add(s.url);
    out.push({ name: s.name, url: s.url, publisher: s.publisher });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

export interface CheckMeta {
  title: string;
  description: string;
  h1: string;
  crumb: string;
  appName: string;
}

export function grossaCheckMeta(locale: Locale, data: GrossaCheckerData): CheckMeta {
  const y = GROSSA_YEAR;
  const first = data.available ? data.draw?.first : null;
  const base = {
    ca: { h1: `Comprovar La Grossa de Cap d'Any ${y}`, crumb: "Comprovar La Grossa de Cap d'Any", title: `Comprovar La Grossa de Cap d'Any ${y}: bitllet i premis`, appName: `Comprovador de La Grossa de Cap d'Any ${y} amb el premi net` },
    es: { h1: `Comprobar La Grossa de Cap d'Any ${y}`, crumb: "Comprobar La Grossa de Cap d'Any", title: `Comprobar La Grossa de Cap d'Any ${y}: billete y premios`, appName: `Comprobador de La Grossa de Cap d'Any ${y} con el premio neto` },
    en: { h1: `Check your La Grossa de Cap d'Any ${y} ticket`, crumb: "Check your La Grossa ticket", title: `Check La Grossa de Cap d'Any ${y} ticket: prizes and tax`, appName: `La Grossa de Cap d'Any ${y} ticket checker with the prize after tax` },
  }[locale];
  const description = first
    ? {
        ca: `La Grossa de Cap d'Any ${y} és el ${first}. Comprova el teu bitllet: cinc xifres, anterior i posterior, terminacions i el que cobres després d'Hisenda.`,
        es: `La Grossa de Cap d'Any ${y} es el ${first}. Comprueba tu billete: cinco cifras, anterior y posterior, terminaciones y lo que cobras tras Hacienda.`,
        en: `La Grossa de Cap d'Any ${y} is ${first}. Check your ticket: all five digits, the numbers either side, the endings and what you keep after tax.`,
      }[locale]
    : {
        ca: `El 31 de desembre, comprova el teu bitllet de La Grossa de Cap d'Any ${y}: premi per bitllet i per euro, anterior i posterior, terminacions i el net.`,
        es: `El 31 de diciembre, comprueba tu billete de La Grossa de Cap d'Any ${y}: premio por billete y por euro, anterior y posterior, terminaciones y el neto.`,
        en: `On 31 December, check your La Grossa de Cap d'Any ${y} ticket: prize per ticket and per euro, the numbers either side, the endings and the net.`,
      }[locale];
  return { ...base, description };
}

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                              */
/* -------------------------------------------------------------------------- */

const tax = (locale: Locale, label: string) => link(calcPath("lottery-tax", locale), label);
const guide = (locale: Locale, label: string) => link(b2href("grossa", locale), label);

function timeLine(locale: Locale): string {
  if (DRAW_TIME_2026) {
    const s = link(DRAW_TIME_2026.source.url, DRAW_TIME_2026.source.publisher ?? DRAW_TIME_2026.source.name);
    return L(locale, { ca: `Serà a les ${DRAW_TIME_2026.time}, segons ${s}.`, es: `Será a las ${DRAW_TIME_2026.time}, según ${s}.`, en: `It is at ${DRAW_TIME_2026.time}, according to ${s}.` });
  }
  const checked = dateYear(DRAW_TIME_CHECKED > GROSSA_CHECK_AS_OF ? DRAW_TIME_CHECKED : GROSSA_CHECK_AS_OF, locale);
  const tv = link(U.tv2025, "3Cat");
  return L(locale, {
    ca: `Loteries de Catalunya encara no n'ha anunciat l'hora (${checked}); el 2025 el sorteig va començar a les 13:00, en directe per ${tv}.`,
    es: `Loteries de Catalunya aún no ha anunciado la hora (${checked}); en 2025 el sorteo empezó a las 13:00, en directo por ${tv}.`,
    en: `Loteries de Catalunya has not announced the time yet (${checked}); in 2025 the draw began at 13:00, live on ${tv}.`,
  });
}

/** "4 de 8 números" read so far, or null when all eight are in. */
function progress(data: GrossaCheckerData, locale: Locale): string | null {
  const d = data.draw;
  if (!d || data.complete) return null;
  const known = [d.first, d.second, d.third].filter(Boolean).length + d.fourth.length + d.fifth.length;
  return L(locale, { ca: `${known} de 8 números`, es: `${known} de 8 números`, en: `${known} of 8 numbers` });
}

/* -------------------------------------------------------------------------- */
/* Lead and state                                                             */
/* -------------------------------------------------------------------------- */

export function grossaLead(locale: Locale, data: GrossaCheckerData): string {
  const d = data.available ? data.draw : null;
  const first = M(extractionOf("first").pays.five!, locale);
  if (!d) {
    return L(locale, {
      ca: `**La Grossa de Cap d'Any ${GROSSA_YEAR} se sorteja el ${drawDay("ca", false)}, i el primer premi és de ${first} per bitllet de 10 €. Aquell dia, tan bon punt Loteries de Catalunya publiqui els vuit números premiats, aquí podràs escriure el teu número i el que hi jugues i veuràs tots els premis que té (les cinc xifres, l'anterior i el posterior, les quatre, tres, dues i l'última xifra) i quant en cobres després d'Hisenda.** Mentrestant: quant paga cada premi, com es combinen segons el DOGC, com es cobra i com comprovar-ho de manera oficial.`,
      es: `**La Grossa de Cap d'Any ${GROSSA_YEAR} se sortea el ${drawDay("es", false)}, y el primer premio es de ${first} por billete de 10 €. Ese día, en cuanto Loteries de Catalunya publique los ocho números premiados, aquí podrás escribir tu número y lo que juegas y verás todos los premios que tiene (las cinco cifras, el anterior y el posterior, las cuatro, tres, dos y la última cifra) y cuánto cobras después de Hacienda.** Mientras tanto: cuánto paga cada premio, cómo se combinan según el DOGC, cómo se cobra y cómo comprobarlo de forma oficial.`,
      en: `**La Grossa de Cap d'Any ${GROSSA_YEAR}, Catalonia's New Year's Eve lottery, is drawn on ${drawDay("en", false)}, and the first prize is ${first} per €10 ticket. On the day, as soon as Loteries de Catalunya publishes the eight winning numbers, you can type your number and how much you play here and see every prize it wins (all five digits, the numbers either side, the last four, three, two and one digits) and what you keep after tax.** Until then: what each prize pays, how they combine under the DOGC rules, how to collect and how to check officially.`,
    });
  }
  const p = progress(data, locale);
  const at = data.readAt ? barcelonaTime(data.readAt) : "";
  const head = d.first
    ? L(locale, { ca: `**La Grossa de Cap d'Any ${data.year} és el ${d.first}: ${first} per bitllet.**`, es: `**La Grossa de Cap d'Any ${data.year} es el ${d.first}: ${first} por billete.**`, en: `**La Grossa de Cap d'Any ${data.year} is ${d.first}: ${first} per ticket.**` })
    : L(locale, { ca: `**El sorteig de La Grossa de Cap d'Any ${data.year} està en marxa: el primer premi surt l'últim.**`, es: `**El sorteo de La Grossa de Cap d'Any ${data.year} está en marcha: el primer premio sale el último.**`, en: `**The La Grossa de Cap d'Any ${data.year} draw is under way: the first prize comes out last.**` });
  return L(locale, {
    ca: `${head} Escriu el teu número i el que hi jugues per veure quin premi té i quant en cobres després d'Hisenda. ${p ? `Números llegits a Loteries de Catalunya a les ${at}: ${p}.` : `Els vuit números premiats, llegits a Loteries de Catalunya a les ${at}.`}`,
    es: `${head} Escribe tu número y lo que juegas para ver qué premio tiene y cuánto cobras tras Hacienda. ${p ? `Números leídos en Loteries de Catalunya a las ${at}: ${p}.` : `Los ocho números premiados, leídos en Loteries de Catalunya a las ${at}.`}`,
    en: `${head} Type your number and how much you play to see what it wins and what you keep after tax. ${p ? `Numbers read from Loteries de Catalunya at ${at}: ${p}.` : `All eight winning numbers, read from Loteries de Catalunya at ${at}.`}`,
  });
}

export function grossaFreshLine(locale: Locale): string {
  const read = dateYear(SOURCES.dogc.read, locale);
  return L(locale, {
    ca: `Premis i regles: acord de Loteries de Catalunya publicat al DOGC el 8 d'abril de 2026 (annex 3), llegit el ${read}.`,
    es: `Premios y reglas: acuerdo de Loteries de Catalunya publicado en el DOGC el 8 de abril de 2026 (anexo 3), leído el ${read}.`,
    en: `Prizes and rules: Loteries de Catalunya's agreement published in the DOGC (Catalan official gazette) on 8 April 2026, annex 3, read ${read}.`,
  });
}

export function grossaPreDrawNotice(locale: Locale): { title: string; text: string } {
  return L(locale, {
    ca: { title: "El comprovador s'activa el 31 de desembre", text: "Funcionarà amb els números que publiqui Loteries de Catalunya aquell dia, a mesura que surtin. No fem servir llistes d'altres mitjans. Fins aleshores pots veure quant paga cada premi a la taula de més avall; per cobrar, val el resultat oficial de Loteries de Catalunya." },
    es: { title: "El comprobador se activa el 31 de diciembre", text: "Funcionará con los números que publique Loteries de Catalunya ese día, a medida que salgan. No usamos listas de otros medios. Hasta entonces puedes ver cuánto paga cada premio en la tabla de más abajo; para cobrar, vale el resultado oficial de Loteries de Catalunya." },
    en: { title: "The checker goes live on 31 December", text: "It will run on the numbers Loteries de Catalunya publishes that day, as they come out. We do not use other outlets' lists. Until then, the table below shows what each prize pays; for payment, Loteries de Catalunya's official result is what counts." },
  });
}

export function grossaWillDo(locale: Locale): { heading: string; items: string[] } {
  const ex = M(EXEMPT_PER_TICKET, locale);
  return L(locale, {
    ca: {
      heading: "Què et diu el comprovador",
      items: [
        "**Si el teu número té premi i de quina extracció:** les cinc xifres, l'anterior o el posterior, les quatre, tres o dues últimes xifres d'un dels vuit números premiats, o l'última xifra del primer premi (el reintegrament de 10 €).",
        "**Quant guanya per bitllet de 10 € i per cada euro jugat**, amb els premis de diferents números premiats sumats, com diu el DOGC.",
        `**El que cobres del que hi jugues**, siguin un bitllet, diversos o una participació, després del 20 % que reté Hisenda del que passa de ${ex} per bitllet (el mateix càlcul que la ${tax("ca", "calculadora de premis de loteria")}).`,
        "**Mentre dura el sorteig**, amb els números publicats fins aleshores: no et dirà «sense premi» fins que tingui els vuit.",
      ],
    },
    es: {
      heading: "Qué te dice el comprobador",
      items: [
        "**Si tu número tiene premio y de qué extracción:** las cinco cifras, el anterior o el posterior, las cuatro, tres o dos últimas cifras de uno de los ocho números premiados, o la última cifra del primer premio (el reintegro de 10 €).",
        "**Cuánto gana por billete de 10 € y por cada euro jugado**, con los premios de distintos números premiados sumados, como dice el DOGC.",
        `**Lo que cobras de lo que juegas**, sea un billete, varios o una participación, después del 20 % que retiene Hacienda de lo que pasa de ${ex} por billete (la misma cuenta que la ${tax("es", "calculadora de premios de lotería")}).`,
        "**Mientras dura el sorteo**, con los números publicados hasta ese momento: no te dirá «sin premio» hasta tener los ocho.",
      ],
    },
    en: {
      heading: "What the checker tells you",
      items: [
        "**Whether your number wins, and from which extraction:** all five digits, the number just before or after, the last four, three or two digits of one of the eight winning numbers, or the first prize's last digit (the €10 money back).",
        "**What it wins per €10 ticket and per euro played**, with prizes from different winning numbers added up, as the DOGC rules say.",
        `**What you keep from what you play**, one ticket, several or a share, after the 20% withheld on whatever each ticket wins above ${ex} (the same sums as the ${tax("en", "lottery prize tax calculator")}).`,
        "**While the draw is on**, from the numbers published so far: it will not say \"no prize\" until it has all eight.",
      ],
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Prize table and rules                                                      */
/* -------------------------------------------------------------------------- */

export interface GrossaPrizeRow {
  prize: PrizeKey;
  label: string;
  numbers: string;
  cells: Record<Tier, string>;
  net: string;
}

/** One row per prize: how many numbers, what each tier pays per ticket, what the five digits keep after the levy. */
export function grossaPrizeRows(locale: Locale): GrossaPrizeRow[] {
  return PRIZE_ORDER.map((prize) => {
    const e = extractionOf(prize);
    const cell = (t: Tier) => (e.pays[t] === undefined ? "—" : M(e.pays[t]!, locale));
    return {
      prize,
      label: PRIZE_LABEL[prize][locale],
      numbers: String(DRAWN[prize]),
      cells: { five: cell("five"), neighbour: cell("neighbour"), last4: cell("last4"), last3: cell("last3"), last2: cell("last2"), last1: cell("last1") },
      net: M(breakdown(e.pays.five!, TICKET_PRICE, 1).net, locale),
    };
  });
}

export function grossaPrizeTableText(locale: Locale): { heading: string; intro: string; cols: string[]; caption: string; after: string } {
  const dogc = link(SOURCES.dogc.url, L(locale, { ca: "acord publicat al DOGC", es: "acuerdo publicado en el DOGC", en: "agreement published in the DOGC" }));
  const read = dateYear(SOURCES.dogc.read, locale);
  const perSeries = eurosPerSeries();
  const share = num(PRIZE_SHARE * 100, 2, locale);
  return L(locale, {
    ca: {
      heading: `Quant paga cada premi de La Grossa de Cap d'Any ${GROSSA_YEAR}`,
      intro: `Cada número té ${SERIES} bitllets (sèries) de 10 €, i els premis són per bitllet. L'${dogc} dona, per a cada una de les vuit extraccions, el que cobren les cinc xifres, les quatre, tres i dues últimes, l'última (només el primer premi) i els números anterior i posterior.`,
      cols: ["Premi", "Números", "Les 5 xifres", "Anterior i posterior", "4 últimes", "3 últimes", "2 últimes", "Última xifra", "Cobres de les 5 xifres, net"],
      caption: `DOGC núm. 9640, 8.4.2026, annex 3, punt 7, llegit el ${read}. Premis per bitllet de 10 €.`,
      after: `Amb aquestes regles, de cada número premiat cobren 1 bitllet amb les cinc xifres, ${TIER_COUNT.neighbour} veïns, ${TIER_COUNT.last4} més amb les quatre últimes, ${TIER_COUNT.last3} amb les tres, ${count(TIER_COUNT.last2, "ca")} amb les dues i, del primer premi, ${count(TIER_COUNT.last1, "ca")} amb l'última: cada sèrie de 100.000 bitllets reparteix ${M(perSeries, "ca")}, el ${share} % que fixa el DOGC. Només el primer i el segon premi paguen a Hisenda.`,
    },
    es: {
      heading: `Cuánto paga cada premio de La Grossa de Cap d'Any ${GROSSA_YEAR}`,
      intro: `Cada número tiene ${SERIES} billetes (series) de 10 €, y los premios son por billete. El ${dogc} da, para cada una de las ocho extracciones, lo que cobran las cinco cifras, las cuatro, tres y dos últimas, la última (solo el primer premio) y los números anterior y posterior.`,
      cols: ["Premio", "Números", "Las 5 cifras", "Anterior y posterior", "4 últimas", "3 últimas", "2 últimas", "Última cifra", "Cobras de las 5 cifras, neto"],
      caption: `DOGC núm. 9640, 8.4.2026, anexo 3, punto 7, leído el ${read}. Premios por billete de 10 €.`,
      after: `Con estas reglas, de cada número premiado cobran 1 billete con las cinco cifras, ${TIER_COUNT.neighbour} vecinos, ${TIER_COUNT.last4} más con las cuatro últimas, ${TIER_COUNT.last3} con las tres, ${count(TIER_COUNT.last2, "es")} con las dos y, del primer premio, ${count(TIER_COUNT.last1, "es")} con la última: cada serie de 100.000 billetes reparte ${M(perSeries, "es")}, el ${share} % que fija el DOGC. Solo el primer y el segundo premio pagan a Hacienda.`,
    },
    en: {
      heading: `What each La Grossa de Cap d'Any ${GROSSA_YEAR} prize pays`,
      intro: `Each number has ${SERIES} tickets (series) at €10, and prizes are per ticket. The ${dogc} gives, for each of the eight extractions, what all five digits, the last four, three and two, the last one (first prize only) and the numbers either side win.`,
      cols: ["Prize", "Numbers", "All 5 digits", "Number before and after", "Last 4", "Last 3", "Last 2", "Last digit", "You keep from all 5 digits"],
      caption: `DOGC no. 9640, 8 April 2026, annex 3, point 7, read ${read}. Prizes per €10 ticket.`,
      after: `Under these rules each winning number pays 1 ticket with all five digits, ${TIER_COUNT.neighbour} neighbours, ${TIER_COUNT.last4} more with the last four, ${TIER_COUNT.last3} with the last three, ${count(TIER_COUNT.last2, "en")} with the last two and, for the first prize, ${count(TIER_COUNT.last1, "en")} with the last digit: each series of 100,000 tickets pays ${M(perSeries, "en")}, the ${share}% the DOGC sets. Only the first and second prizes pay tax.`,
    },
  });
}

/** The rules of point 8, with the 2025 draw as the worked example. */
export function grossaRulesText(locale: Locale): { heading: string; items: string[]; quoteLabel: string } {
  const f = RESULTS_2025.first;
  const fp = extractionOf("first").pays;
  const [before, after] = neighbours(f);
  const two = prizesOf(EXAMPLE_TWO, DRAW_2025);
  const twoTotal = M(two.reduce((s, h) => s + h.perTicket, 0), locale);
  const game = link(SOURCES.game.url, L(locale, { ca: "pàgina del joc", es: "página del juego", en: "game page" }));
  const items = L(locale, {
    ca: [
      `**Les xifres, de dreta a esquerra:** un bitllet cobra quan les seves últimes xifres coincideixen, en el mateix ordre, amb les d'un número premiat. Amb el primer premi del 2025, el ${f}: el ${f} cobrava ${M(fp.five!, "ca")}; els acabats en ${f.slice(1)}, ${M(fp.last4!, "ca")}; en ${f.slice(2)}, ${M(fp.last3!, "ca")}; en ${f.slice(3)}, ${M(fp.last2!, "ca")}, i en ${f.slice(4)}, ${M(fp.last1!, "ca")} (el reintegrament, només del primer premi).`,
      `**L'anterior i el posterior:** el ${before} i el ${after} cobraven ${M(fp.neighbour!, "ca")} cadascun. Cada un dels vuit números premiats té els seus veïns premiats. Segons la ${game} de Loteries de Catalunya, l'anterior del 00000 és el 99999, i el posterior del 99999, el 00000.`,
      `**Un sol premi per número premiat:** de cada extracció es cobra només la categoria més alta. Qui tenia les quatre últimes xifres del ${f} cobrava ${M(fp.last4!, "ca")}, no també les tres, les dues i l'última.`,
      `**Entre números premiats diferents, se sumen:** cada extracció paga la seva categoria més alta. El 2025, el ${EXAMPLE_TWO} era el posterior del segon premi (${RESULTS_2025.second}) i acabava en ${EXAMPLE_TWO.slice(3)}, com el cinquè premi ${RESULTS_2025.fifth[2]}: ${twoTotal} per bitllet.`,
      "**Els vuit números són diferents:** si en surt un de repetit, es queda el premi més alt i es torna a extreure el número del més baix.",
    ],
    es: [
      `**Las cifras, de derecha a izquierda:** un billete cobra cuando sus últimas cifras coinciden, en el mismo orden, con las de un número premiado. Con el primer premio de 2025, el ${f}: el ${f} cobraba ${M(fp.five!, "es")}; los terminados en ${f.slice(1)}, ${M(fp.last4!, "es")}; en ${f.slice(2)}, ${M(fp.last3!, "es")}; en ${f.slice(3)}, ${M(fp.last2!, "es")}, y en ${f.slice(4)}, ${M(fp.last1!, "es")} (el reintegro, solo del primer premio).`,
      `**El anterior y el posterior:** el ${before} y el ${after} cobraban ${M(fp.neighbour!, "es")} cada uno. Cada uno de los ocho números premiados tiene sus vecinos premiados. Según la ${game} de Loteries de Catalunya, el anterior del 00000 es el 99999, y el posterior del 99999, el 00000.`,
      `**Un solo premio por número premiado:** de cada extracción se cobra solo la categoría más alta. Quien tenía las cuatro últimas cifras del ${f} cobraba ${M(fp.last4!, "es")}, no también las tres, las dos y la última.`,
      `**Entre números premiados distintos, se suman:** cada extracción paga su categoría más alta. En 2025, el ${EXAMPLE_TWO} era el posterior del segundo premio (${RESULTS_2025.second}) y acababa en ${EXAMPLE_TWO.slice(3)}, como el quinto premio ${RESULTS_2025.fifth[2]}: ${twoTotal} por billete.`,
      "**Los ocho números son distintos:** si sale uno repetido, se queda el premio más alto y se vuelve a extraer el número del más bajo.",
    ],
    en: [
      `**Digits from right to left:** a ticket wins when its last digits match a winning number's, in the same order. With the 2025 first prize, ${f}: ${f} itself won ${M(fp.five!, "en")}; numbers ending in ${f.slice(1)}, ${M(fp.last4!, "en")}; in ${f.slice(2)}, ${M(fp.last3!, "en")}; in ${f.slice(3)}, ${M(fp.last2!, "en")}; and in ${f.slice(4)}, ${M(fp.last1!, "en")} (money back, first prize only).`,
      `**The numbers either side:** ${before} and ${after} won ${M(fp.neighbour!, "en")} each. Each of the eight winning numbers has its own winning neighbours. According to Loteries de Catalunya's ${game}, the number before 00000 is 99999, and the one after 99999 is 00000.`,
      `**One prize per winning number:** each extraction pays only its highest category. Holding the last four digits of ${f} won ${M(fp.last4!, "en")}, not the last three, two and one on top.`,
      `**Across different winning numbers, prizes add up:** each extraction pays its highest category. In 2025, ${EXAMPLE_TWO} was the number after the second prize (${RESULTS_2025.second}) and ended in ${EXAMPLE_TWO.slice(3)}, like the fifth prize ${RESULTS_2025.fifth[2]}: ${twoTotal} per ticket.`,
      "**The eight numbers are all different:** if one comes out twice, it keeps the higher prize and the lower one is drawn again.",
    ],
  });
  return {
    heading: L(locale, {
      ca: "Terminacions, anterior i posterior: quins bitllets cobren",
      es: "Terminaciones, anterior y posterior: qué billetes cobran",
      en: "Endings and the numbers either side: which tickets win",
    }),
    items,
    quoteLabel: `DOGC núm. 9640, annex 3 (${L(locale, { ca: "text literal", es: "texto literal, en catalán", en: "verbatim, in Catalan" })})`,
  };
}

/* -------------------------------------------------------------------------- */
/* The draw, payment and official checks                                     */
/* -------------------------------------------------------------------------- */

export function grossaDrawText(locale: Locale): { heading: string; paras: string[] } {
  const dogc = link(SOURCES.dogc.url, "DOGC");
  const sales = link(U.sales2026, L(locale, { ca: "sistema de venda", es: "sistema de venta", en: "sales system" }));
  return L(locale, {
    ca: {
      heading: `Quan i com és el sorteig de La Grossa de Cap d'Any ${GROSSA_YEAR}`,
      paras: [
        `**El ${drawDay("ca")}** (${dogc}). ${timeLine("ca")} Segons les preguntes freqüents de Loteries de Catalunya, es fa als estudis de TVC. El ${sales} de Loteries de Catalunya tanca la venda a les 11:00 del 31 de desembre.`,
        `Se n'extreuen vuit números de cinc xifres, del 00000 al 99999, i el primer premi surt l'últim: 1a, 2a i 3a extraccions, els tres cinquens premis; 4a i 5a, els dos quarts; 6a, el tercer; 7a, el segon, i 8a, La Grossa. Tota la resta de premis (veïns i terminacions) es dedueixen d'aquests vuit números. Més sobre el sorteig, on comprar i la nit de Cap d'Any: ${guide("ca", "guia de La Grossa de Cap d'Any")}.`,
      ],
    },
    es: {
      heading: `Cuándo y cómo es el sorteo de La Grossa de Cap d'Any ${GROSSA_YEAR}`,
      paras: [
        `**El ${drawDay("es")}** (${dogc}). ${timeLine("es")} Según las preguntas frecuentes de Loteries de Catalunya, se hace en los estudios de TVC. El ${sales} de Loteries de Catalunya cierra la venta a las 11:00 del 31 de diciembre.`,
        `Se extraen ocho números de cinco cifras, del 00000 al 99999, y el primer premio sale el último: 1.ª, 2.ª y 3.ª extracciones, los tres quintos premios; 4.ª y 5.ª, los dos cuartos; 6.ª, el tercero; 7.ª, el segundo, y 8.ª, La Grossa. Todos los demás premios (vecinos y terminaciones) se deducen de estos ocho números. Más sobre el sorteo, dónde comprar y la Nochevieja: ${guide("es", "guía de La Grossa de Cap d'Any")}.`,
      ],
    },
    en: {
      heading: `When and how the La Grossa de Cap d'Any ${GROSSA_YEAR} draw works`,
      paras: [
        `**On ${drawDay("en")}** (${dogc}). ${timeLine("en")} According to Loteries de Catalunya's FAQ, it is held in TVC's studios. Loteries de Catalunya's ${sales} closes sales at 11:00 on 31 December.`,
        `Eight five-digit numbers are drawn, from 00000 to 99999, and the first prize comes out last: extractions 1 to 3 are the three fifth prizes; 4 and 5 the two fourths; 6 the third; 7 the second; and 8 La Grossa. Every other prize (neighbours and endings) follows from those eight numbers. More on the draw, where to buy and New Year's Eve: ${guide("en", "La Grossa de Cap d'Any guide")}.`,
      ],
    },
  });
}

export function grossaPayText(locale: Locale): { heading: string; items: string[]; after: string } {
  const g = breakdown(extractionOf("first").pays.five!, TICKET_PRICE, 1);
  const s = breakdown(extractionOf("second").pays.five!, TICKET_PRICE, 1);
  const ex = M(EXEMPT_PER_TICKET, locale);
  const pay = link(U.payment, "Loteries de Catalunya");
  const eco = link(SOURCES.eco425.url, "Resolució ECO/425/2022");
  return L(locale, {
    ca: {
      heading: "Com es cobren els premis i quant se n'endú Hisenda",
      items: [
        `**Fins a 120 €:** a qualsevol punt de venda amb terminal; si volen, fins a 1.999,99 € (${pay}).`,
        `**A partir de 50 €:** a qualsevol oficina de CaixaBank; **de qualsevol import:** a l'oficina de Loteries de Catalunya del carrer d'Enric Granados, 33, de Barcelona; **des de 2.000 €**, amb el DNI (${pay}).`,
        `**Comprat per internet:** fins a 400 €, al moneder del compte; més de 400 €, al compte bancari registrat (${pay}).`,
        `**Termini:** 90 dies naturals des del dia del sorteig (${eco}).`,
      ],
      after: `**Hisenda:** cada bitllet té ${ex} exempts i es reté el 20 % de la resta en cobrar-lo (${link(U.irpf, "Llei 35/2006, disposició addicional 33a")}). Un bitllet del primer premi en deixa ${M(g.net, "ca")} (${M(g.withholding, "ca")} de retenció) i un del segon, ${M(s.net, "ca")}; la resta de premis no paguen res. Participacions i diversos bitllets: ${tax("ca", "calculadora de premis de loteria")}.`,
    },
    es: {
      heading: "Cómo se cobran los premios y cuánto se queda Hacienda",
      items: [
        `**Hasta 120 €:** en cualquier punto de venta con terminal; si quieren, hasta 1.999,99 € (${pay}).`,
        `**A partir de 50 €:** en cualquier oficina de CaixaBank; **de cualquier importe:** en la oficina de Loteries de Catalunya de la calle Enric Granados, 33, de Barcelona; **desde 2.000 €**, con el DNI (${pay}).`,
        `**Comprado por internet:** hasta 400 €, al monedero de la cuenta; más de 400 €, a la cuenta bancaria registrada (${pay}).`,
        `**Plazo:** 90 días naturales desde el día del sorteo (${eco}).`,
      ],
      after: `**Hacienda:** cada billete tiene ${ex} exentos y se retiene el 20 % del resto al cobrarlo (${link(U.irpf, "Ley 35/2006, disposición adicional 33.ª")}). Un billete del primer premio deja ${M(g.net, "es")} (${M(g.withholding, "es")} de retención) y uno del segundo, ${M(s.net, "es")}; los demás premios no pagan nada. Participaciones y varios billetes: ${tax("es", "calculadora de premios de lotería")}.`,
    },
    en: {
      heading: "How prizes are paid and how much tax is taken",
      items: [
        `**Up to €120:** at any outlet with a terminal; up to €1,999.99 if the outlet agrees (${pay}).`,
        `**From €50:** at any CaixaBank branch; **any amount:** at Loteries de Catalunya's office, Carrer d'Enric Granados 33, Barcelona; **from €2,000**, with your ID (${pay}).`,
        `**Bought online:** up to €400 goes to your account's wallet; more than €400, to the bank account you registered (${pay}).`,
        `**Deadline:** 90 calendar days from the day of the draw (${eco}).`,
      ],
      after: `**Tax:** each ticket has ${ex} tax-free and 20% of the rest is withheld when you collect (${link(U.irpf, "Law 35/2006, additional provision 33")}). A first-prize ticket leaves ${M(g.net, "en")} (${M(g.withholding, "en")} withheld) and a second-prize one ${M(s.net, "en")}; the other prizes pay nothing. Shares and several tickets: ${tax("en", "lottery prize tax calculator")}.`,
    },
  });
}

export function grossaOfficialText(locale: Locale): { heading: string; items: string[] } {
  const press = link(SOURCES.press.url, L(locale, { ca: "notes de premsa", es: "notas de prensa", en: "press notes" }));
  return L(locale, {
    ca: {
      heading: "Com comprovar el bitllet de manera oficial",
      items: [
        `A la ${link(U.results, "pàgina de resultats de La Grossa")} de Loteries de Catalunya, que té un comprovador de números.`,
        "A qualsevol punt de venda amb terminal; els que no en tenen no poden validar-lo ni pagar-lo.",
        `A les ${press} de Loteries de Catalunya: el 2024 i el 2025 hi va publicar els vuit números premiats el mateix 31 de desembre (${link(U.press2025, "la del 2025")}).`,
      ],
    },
    es: {
      heading: "Cómo comprobar el billete de forma oficial",
      items: [
        `En la ${link(U.results, "página de resultados de La Grossa")} de Loteries de Catalunya, que tiene un comprobador de números.`,
        "En cualquier punto de venta con terminal; los que no tienen no pueden validarlo ni pagarlo.",
        `En las ${press} de Loteries de Catalunya: en 2024 y 2025 publicó ahí los ocho números premiados el mismo 31 de diciembre (${link(U.press2025, "la de 2025")}).`,
      ],
    },
    en: {
      heading: "How to check your ticket officially",
      items: [
        `On Loteries de Catalunya's ${link(U.results, "La Grossa results page")}, which has a number checker.`,
        "At any outlet with a terminal; outlets without one cannot validate or pay it.",
        `In Loteries de Catalunya's ${press}: in 2024 and 2025 it published the eight winning numbers there on 31 December itself (${link(U.press2025, "2025's")}).`,
      ],
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Results                                                                    */
/* -------------------------------------------------------------------------- */

export function grossaResultsHeadings(locale: Locale, year: number) {
  return L(locale, {
    ca: { results: `Números premiats de La Grossa de Cap d'Any ${year}`, notYet: "Encara no ha sortit", cols: ["Premi", "Número", "Per bitllet", "Anterior i posterior", "Terminacions"], and: "i", ending: (d: string) => `acabats en ${d}` },
    es: { results: `Números premiados de La Grossa de Cap d'Any ${year}`, notYet: "Aún no ha salido", cols: ["Premio", "Número", "Por billete", "Anterior y posterior", "Terminaciones"], and: "y", ending: (d: string) => `terminados en ${d}` },
    en: { results: `La Grossa de Cap d'Any ${year} winning numbers`, notYet: "Not drawn yet", cols: ["Prize", "Number", "Per ticket", "Before and after", "Endings"], and: "and", ending: (d: string) => `ending in ${d}` },
  });
}

/** One row per drawn number, in prize order, with its neighbours and endings and what each pays. */
export function grossaResultRows(locale: Locale, d: GrossaDraw): { prize: PrizeKey; number: string | null; five: string; neighbours: string; endings: string }[] {
  const h = grossaResultsHeadings(locale, GROSSA_YEAR);
  const rows: { prize: PrizeKey; number: string | null; five: string; neighbours: string; endings: string }[] = [];
  const add = (prize: PrizeKey, n: string | null) => {
    const e = extractionOf(prize);
    if (!n) {
      rows.push({ prize, number: null, five: M(e.pays.five!, locale), neighbours: h.notYet, endings: "" });
      return;
    }
    const [a, b] = neighbours(n);
    const ends = (["last4", "last3", "last2", "last1"] as const).filter((t) => e.pays[t] !== undefined).map((t) => `${h.ending(n.slice(5 - Number(t.slice(4))))}: ${M(e.pays[t]!, locale)}`);
    rows.push({ prize, number: n, five: M(e.pays.five!, locale), neighbours: `${a} ${h.and} ${b}: ${M(e.pays.neighbour!, locale)}`, endings: ends.join("; ") });
  };
  add("first", d.first);
  add("second", d.second);
  add("third", d.third);
  for (let i = 0; i < DRAWN.fourth; i++) add("fourth", d.fourth[i] ?? null);
  for (let i = 0; i < DRAWN.fifth; i++) add("fifth", d.fifth[i] ?? null);
  return rows;
}

/* -------------------------------------------------------------------------- */
/* FAQ and links                                                              */
/* -------------------------------------------------------------------------- */

export function grossaFaq(locale: Locale): { q: string; a: string }[] {
  const fp = extractionOf("first").pays;
  const g = breakdown(fp.five!, TICKET_PRICE, 1);
  return L(locale, {
    ca: [
      { q: `Quan es pot comprovar La Grossa de Cap d'Any ${GROSSA_YEAR}?`, a: `El ${drawDay("ca")}, quan Loteries de Catalunya publica els números. Aquesta pàgina s'actualitza amb els números oficials; el 2024 i el 2025 Loteries de Catalunya els va publicar en una nota de premsa el mateix 31 de desembre.` },
      { q: "Quant cobren l'anterior i el posterior de La Grossa?", a: `${M(fp.neighbour!, "ca")} per bitllet cadascun. Els del segon premi cobren ${M(extractionOf("second").pays.neighbour!, "ca")}; els del tercer, ${M(extractionOf("third").pays.neighbour!, "ca")}; els dels quarts, ${M(extractionOf("fourth").pays.neighbour!, "ca")}, i els dels cinquens, ${M(extractionOf("fifth").pays.neighbour!, "ca")}.` },
      { q: "Quant es cobra amb les quatre últimes xifres del primer premi?", a: `${M(fp.last4!, "ca")} per bitllet. Amb les tres últimes, ${M(fp.last3!, "ca")}; amb les dues, ${M(fp.last2!, "ca")}, i amb l'última, ${M(fp.last1!, "ca")} (el reintegrament). Del mateix número premiat només es cobra la més alta.` },
      { q: "Si el meu bitllet acaba com dos números premiats, cobro els dos premis?", a: "Sí: segons el DOGC, de cada extracció es cobra la categoria més alta, i els premis de números premiats diferents se sumen." },
      { q: "Quant se n'endú Hisenda del primer premi de La Grossa?", a: `El 20 % del que passa de ${M(EXEMPT_PER_TICKET, "ca")} per bitllet: de ${M(g.gross, "ca")} se'n retenen ${M(g.withholding, "ca")} i en cobres ${M(g.net, "ca")}. Fins a 40.000 € no paga res.` },
      { q: "Fins quan es pot cobrar?", a: "90 dies naturals des del dia del sorteig, segons la resolució que regula la loteria passiva de la Generalitat." },
    ],
    es: [
      { q: `¿Cuándo se puede comprobar La Grossa de Cap d'Any ${GROSSA_YEAR}?`, a: `El ${drawDay("es")}, cuando Loteries de Catalunya publica los números. Esta página se actualiza con los números oficiales; en 2024 y 2025 Loteries de Catalunya los publicó en una nota de prensa el mismo 31 de diciembre.` },
      { q: "¿Cuánto cobran el anterior y el posterior de La Grossa?", a: `${M(fp.neighbour!, "es")} por billete cada uno. Los del segundo premio cobran ${M(extractionOf("second").pays.neighbour!, "es")}; los del tercero, ${M(extractionOf("third").pays.neighbour!, "es")}; los de los cuartos, ${M(extractionOf("fourth").pays.neighbour!, "es")}, y los de los quintos, ${M(extractionOf("fifth").pays.neighbour!, "es")}.` },
      { q: "¿Cuánto se cobra con las cuatro últimas cifras del primer premio?", a: `${M(fp.last4!, "es")} por billete. Con las tres últimas, ${M(fp.last3!, "es")}; con las dos, ${M(fp.last2!, "es")}, y con la última, ${M(fp.last1!, "es")} (el reintegro). Del mismo número premiado solo se cobra la más alta.` },
      { q: "Si mi billete acaba como dos números premiados, ¿cobro los dos premios?", a: "Sí: según el DOGC, de cada extracción se cobra la categoría más alta, y los premios de números premiados distintos se suman." },
      { q: "¿Cuánto se queda Hacienda del primer premio de La Grossa?", a: `El 20 % de lo que pasa de ${M(EXEMPT_PER_TICKET, "es")} por billete: de ${M(g.gross, "es")} se retienen ${M(g.withholding, "es")} y cobras ${M(g.net, "es")}. Hasta 40.000 € no paga nada.` },
      { q: "¿Hasta cuándo se puede cobrar?", a: "90 días naturales desde el día del sorteo, según la resolución que regula la lotería pasiva de la Generalitat." },
    ],
    en: [
      { q: `When can I check La Grossa de Cap d'Any ${GROSSA_YEAR}?`, a: `On ${drawDay("en")}, once Loteries de Catalunya publishes the numbers. This page is updated with the official numbers; in 2024 and 2025 Loteries de Catalunya published them in a press note on 31 December itself.` },
      { q: "What do the numbers either side of La Grossa win?", a: `${M(fp.neighbour!, "en")} per ticket each. Those next to the second prize win ${M(extractionOf("second").pays.neighbour!, "en")}; the third, ${M(extractionOf("third").pays.neighbour!, "en")}; the fourths, ${M(extractionOf("fourth").pays.neighbour!, "en")}; and the fifths, ${M(extractionOf("fifth").pays.neighbour!, "en")}.` },
      { q: "What do the last four digits of the first prize win?", a: `${M(fp.last4!, "en")} per ticket. The last three, ${M(fp.last3!, "en")}; the last two, ${M(fp.last2!, "en")}; and the last digit, ${M(fp.last1!, "en")} (money back). From the same winning number, only the highest counts.` },
      { q: "If my ticket ends like two winning numbers, do I get both prizes?", a: "Yes: under the DOGC rules each extraction pays its highest category, and prizes from different winning numbers add up." },
      { q: "How much tax is taken from La Grossa's first prize?", a: `20% of whatever it wins above ${M(EXEMPT_PER_TICKET, "en")} per ticket: ${M(g.gross, "en")} has ${M(g.withholding, "en")} withheld and you keep ${M(g.net, "en")}. Up to €40,000 pays nothing.` },
      { q: "How long do I have to collect?", a: "90 calendar days from the day of the draw, under the resolution that governs the Generalitat's passive lottery." },
    ],
  });
}

export function grossaRelatedLinks(locale: Locale): { href: string; label: string }[] {
  return L(locale, {
    ca: [
      { href: b2href("grossa", "ca"), label: `Guia de La Grossa de Cap d'Any ${GROSSA_YEAR}: hora, on comprar i la nit de Cap d'Any` },
      { href: calcPath("lottery-tax", "ca"), label: "Calculadora de premis de loteria: quant se'n queda Hisenda" },
      { href: checkPath("ca"), label: "Comprovar la Loteria de Nadal (22 de desembre)" },
      { href: ninoCheckPath("ca"), label: "Comprovar la Loteria del Nen (6 de gener)" },
      { href: gordoHubPath("ca"), label: "On ha tocat la loteria de Nadal" },
    ],
    es: [
      { href: b2href("grossa", "es"), label: `Guía de La Grossa de Cap d'Any ${GROSSA_YEAR}: hora, dónde comprar y la Nochevieja` },
      { href: calcPath("lottery-tax", "es"), label: "Calculadora de premios de lotería: cuánto se queda Hacienda" },
      { href: checkPath("es"), label: "Comprobar la Lotería de Navidad (22 de diciembre)" },
      { href: ninoCheckPath("es"), label: "Comprobar la Lotería del Niño (6 de enero)" },
      { href: gordoHubPath("es"), label: "Dónde ha tocado el Gordo" },
    ],
    en: [
      { href: b2href("grossa", "en"), label: `La Grossa de Cap d'Any ${GROSSA_YEAR} guide: time, where to buy and New Year's Eve` },
      { href: calcPath("lottery-tax", "en"), label: "Spanish lottery prize tax calculator" },
      { href: checkPath("en"), label: "Check your Christmas Lottery ticket (22 December)" },
      { href: ninoCheckPath("en"), label: "Check your El Niño lottery ticket (6 January)" },
      { href: gordoHubPath("en"), label: "Where El Gordo was sold" },
    ],
  });
}

export function grossaDisclaimer(locale: Locale): string {
  return L(locale, {
    ca: "Comprovació orientativa amb els números que publica Loteries de Catalunya i les regles publicades al DOGC. Per cobrar val el resultat oficial de Loteries de Catalunya; el que compta és el que et pagui i et retingui qui abona el premi.",
    es: "Comprobación orientativa con los números que publica Loteries de Catalunya y las reglas publicadas en el DOGC. Para cobrar vale el resultado oficial de Loteries de Catalunya; lo que cuenta es lo que te pague y te retenga quien abona el premio.",
    en: "An indicative check against the numbers Loteries de Catalunya publishes and the rules published in the DOGC. Loteries de Catalunya's official result is what counts for payment, and what the payer pays you and withholds.",
  });
}

/** The DOGC quotes the page prints, in order. */
export const GROSSA_QUOTES = [QUOTE.first, QUOTE.neighboursFirst, QUOTE.highestPerExtraction, QUOTE.acrossExtractions, QUOTE.repeated] as const;
