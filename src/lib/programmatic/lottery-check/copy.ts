/**
 * Copy of the Christmas lottery checker page ("Comprobar Lotería de Navidad
 * 2026"), in Spanish, Catalan and English. Server-side: it reads the lottery
 * guide's URLs and draw time and the snapshot-derived data. Every figure comes
 * from programme.ts (SELAE's 2026 programme), the lottery-tax engine (Ley
 * 35/2006, DA 33ª) or the snapshot; every other fact from the pages the
 * lottery guide and the gordo hub already cite (SELAE's help pages and 2025
 * dossier), read on the dates those modules record. Text in `[label](href)`
 * and `**bold**` markup; the page renders it.
 */

import { dateYear, dayDate } from "@/lib/content/batch02/festive";
import { DRAW_TIME_2026, NADAL_URLS } from "@/lib/content/batch02/loteria-nadal";
import { b2href } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { gordoHubPath } from "@/lib/programmatic/gordo/paths";
import { grossaCheckPath } from "@/lib/programmatic/grossa-check/paths";
import { ninoCheckPath } from "@/lib/programmatic/nino-check/paths";
import { money, num } from "@/lib/programmatic/lottery-tax/copy";
import { breakdown } from "@/lib/programmatic/lottery-tax/engine";
import { EXEMPT_PER_TICKET } from "@/lib/programmatic/lottery-tax/rules";

import { CATEGORY_LABEL, madridTime } from "./client-copy";
import type { CheckerData } from "./data";
import { drawComplete, neighbours } from "./engine";
import { CATEGORIES, DECIMO_PRICE, DRAWN, DRAWN_TOTAL, DRAW_DATE, EUROS_PER_SERIES, PRIZES_PER_SERIES, PROGRAMME_CONFIRMED, PROGRAMME_YEAR, SOURCES, perDecimo, perEuro, type CategoryId } from "./programme";

/** The day the page's facts were last checked (the BOE search and quotes; SELAE re-tested, 403). */
export const CHECK_AS_OF = "2026-11-18";

export const TITLE_LIMIT = 65;
export const DESCRIPTION_LIMIT = 160;

const link = (href: string, label: string) => `[${label}](${href})`;
const L = <T,>(locale: Locale, v: Record<Locale, T>): T => v[locale];
const U = NADAL_URLS;

export const M = (n: number, locale: Locale) => money(n, locale);
const count = (n: number, locale: Locale) => num(n, 0, locale);

/** The official pages the page cites, in the order of the sources list. */
export function checkSources(data: CheckerData): { name: string; url: string; publisher: string }[] {
  const out: { name: string; url: string; publisher: string }[] = [];
  if (data.available && data.sources) {
    out.push({ name: `Lotería Nacional: premios del sorteo del 22 de diciembre de ${data.year}`, url: data.sources.results, publisher: "SELAE" });
    if (data.sources.officialList) out.push({ name: `Lista oficial de premios del Sorteo Extraordinario de Navidad del 22 de diciembre de ${data.year}`, url: data.sources.officialList, publisher: "SELAE" });
  }
  out.push(
    { name: SOURCES.selaeProgramme.name, url: SOURCES.selaeProgramme.url, publisher: "SELAE" },
    { name: SOURCES.boe2010.name, url: SOURCES.boe2010.url, publisher: "BOE" },
    { name: "Lotería Nacional: comprobador de números", url: U.lnac, publisher: "SELAE" },
    { name: "Dossier de prensa del Sorteo Extraordinario de Navidad 2025", url: U.dossier2025, publisher: "SELAE" },
    { name: "Lista oficial de premios del Sorteo Extraordinario de Navidad del 22 de diciembre de 2025", url: U.list2025, publisher: "SELAE" },
    { name: "¿Cómo cobro los premios de resguardos comprados en la Red Comercial?", url: U.collect, publisher: "SELAE" },
    { name: "¿Cómo sé si tengo premio?", url: U.notify, publisher: "SELAE" },
    { name: "Ley 35/2006, del IRPF, disposición adicional trigésima tercera", url: U.irpf, publisher: "BOE" },
  );
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

export function checkMeta(locale: Locale, data: CheckerData): CheckMeta {
  const y = PROGRAMME_YEAR;
  const first = data.available ? data.draw?.first : null;
  const base = {
    es: { h1: `Comprobar Lotería de Navidad ${y}`, crumb: "Comprobar Lotería de Navidad", title: `Comprobar Lotería de Navidad ${y}: décimo, pedrea y premios`, appName: `Comprobador de la Lotería de Navidad ${y} con premio neto tras Hacienda` },
    ca: { h1: `Comprovar la Loteria de Nadal ${y}`, crumb: "Comprovar la Loteria de Nadal", title: `Comprovar la Loteria de Nadal ${y}: dècim, pedrea i premis`, appName: `Comprovador de la Loteria de Nadal ${y} amb el premi net després d'Hisenda` },
    en: { h1: `Check your Spanish Christmas Lottery ticket ${y}`, crumb: "Check your Christmas Lottery ticket", title: `Check your Spanish Christmas Lottery ticket ${y} (El Gordo)`, appName: `Spanish Christmas Lottery ${y} ticket checker with the prize after tax` },
  }[locale];
  const description = first
    ? {
        es: `El Gordo de ${y} es el ${first}. Comprueba tu décimo: premio por décimo y por euro, pedrea, aproximaciones, centenas, reintegro y lo que cobras tras Hacienda.`,
        ca: `El Gordo del ${y} és el ${first}. Comprova el teu dècim: premi per dècim i per euro, pedrea, aproximacions, centenes, reintegrament i el que cobres net.`,
        en: `El Gordo ${y} is ${first}. Check your décimo: prize per décimo and per euro, pedrea, aproximaciones, reintegro and what you keep after Spanish tax.`,
      }[locale]
    : {
        es: `El 22 de diciembre, comprueba tu décimo de Navidad ${y}: premio por décimo y por euro, pedrea, aproximaciones, reintegro y lo que cobras tras Hacienda.`,
        ca: `El 22 de desembre, comprova el teu dècim de Nadal ${y}: premi per dècim i per euro, pedrea, aproximacions, reintegrament i el que cobres net.`,
        en: `On 22 December, check your ${y} Christmas Lottery décimo: prize per décimo and per euro, pedrea, aproximaciones, reintegro and what you keep after tax.`,
      }[locale];
  return { ...base, description };
}

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                              */
/* -------------------------------------------------------------------------- */

const tax = (locale: Locale, label: string) => link(calcPath("lottery-tax", locale), label);
const guide = (locale: Locale, label: string) => link(b2href("loteriaNadal", locale), label);
const hub = (locale: Locale, label: string) => link(gordoHubPath(locale), label);

/** "martes 22 de diciembre de 2026". */
export const drawDay = (locale: Locale, withYear = true) => dayDate(DRAW_DATE, locale, withYear);

/** "4 números de 1.807" read so far, or null when every one is in. */
function progress(data: CheckerData, locale: Locale): string | null {
  const d = data.draw;
  if (!d || drawComplete(d)) return null;
  const known = [d.first, d.second, d.third].filter(Boolean).length + d.fourth.length + d.fifth.length + (d.pedrea?.length ?? 0);
  return L(locale, { es: `${count(known, locale)} de ${count(DRAWN_TOTAL, locale)} números`, ca: `${count(known, locale)} de ${count(DRAWN_TOTAL, locale)} números`, en: `${count(known, locale)} of ${count(DRAWN_TOTAL, locale)} numbers` });
}

function timeLine(locale: Locale): string {
  if (DRAW_TIME_2026) {
    const s = link(DRAW_TIME_2026.source.url, DRAW_TIME_2026.source.publisher ?? DRAW_TIME_2026.source.name);
    return L(locale, { es: `Empieza a las ${DRAW_TIME_2026.time}, según ${s}.`, ca: `Comença a les ${DRAW_TIME_2026.time}, segons ${s}.`, en: `It starts at ${DRAW_TIME_2026.time}, according to ${s}.` });
  }
  const dossier = link(U.dossier2025, L(locale, { es: "dosier de prensa de 2025", ca: "dossier de premsa del 2025", en: "2025 press dossier" }));
  return L(locale, {
    es: `SELAE aún no ha anunciado la hora (${dateYear(CHECK_AS_OF, "es")}); en 2025, según su ${dossier}, la mesa del sorteo se constituía a las 8:30 y el sorteo duraba unas cuatro horas.`,
    ca: `SELAE encara no n'ha anunciat l'hora (${dateYear(CHECK_AS_OF, "ca")}); el 2025, segons el seu ${dossier}, la mesa del sorteig es constituïa a les 8:30 i el sorteig durava unes quatre hores.`,
    en: `SELAE has not announced the time yet (${dateYear(CHECK_AS_OF, "en")}); in 2025, according to its ${dossier}, the presiding panel sat at 8:30 and the draw took about four hours.`,
  });
}

/* -------------------------------------------------------------------------- */
/* Lead and state                                                             */
/* -------------------------------------------------------------------------- */

export function checkLead(locale: Locale, data: CheckerData): string {
  const d = data.available ? data.draw : null;
  if (!d?.first) {
    return L(locale, {
      es: `**El sorteo de la Lotería de Navidad ${PROGRAMME_YEAR} es el ${drawDay("es", false)} en el Teatro Real de Madrid. Ese día, en cuanto SELAE publique los números, aquí podrás escribir tu número de cinco cifras y lo que juegas, y verás qué premio tiene por décimo y por euro (del Gordo a la pedrea, las aproximaciones, las centenas, las dos últimas cifras y el reintegro) y cuánto cobras después de Hacienda.** Mientras tanto: cómo es el sorteo, cuánto paga cada premio, cómo se cobra y cómo comprobarlo en SELAE.`,
      ca: `**El sorteig de la Loteria de Nadal ${PROGRAMME_YEAR} és el ${drawDay("ca", false)} al Teatro Real de Madrid. Aquell dia, tan bon punt SELAE publiqui els números, aquí podràs escriure el teu número de cinc xifres i el que hi jugues, i veuràs quin premi té per dècim i per euro (del Gordo a la pedrea, les aproximacions, les centenes, les dues últimes xifres i el reintegrament) i quant en cobres després d'Hisenda.** Mentrestant: com és el sorteig, quant paga cada premi, com es cobra i com comprovar-ho a SELAE.`,
      en: `**The ${PROGRAMME_YEAR} Spanish Christmas Lottery is drawn on ${drawDay("en", false)} at the Teatro Real in Madrid. On the day, as soon as SELAE publishes the numbers, you can type your five-digit number and how much you play here and see what it wins per décimo and per euro (from El Gordo to the pedrea, aproximaciones, centenas, last two digits and reintegro) and what you keep after Spanish tax.** Until then: how the draw works, what each prize pays, how to collect and how to check with SELAE.`,
    });
  }
  const p = progress(data, locale);
  const at = data.readAt ? madridTime(data.readAt) : "";
  return L(locale, {
    es: `**El Gordo de la Lotería de Navidad ${data.year} es el ${d.first}: ${M(perDecimo("first"), "es")} por décimo.** Escribe tu número y lo que juegas para ver qué premio tiene y cuánto cobras tras Hacienda. ${p ? `Números leídos en SELAE a las ${at}: ${p}; el sorteo o la lista aún no están completos.` : `Los ${count(DRAWN_TOTAL, "es")} números premiados, leídos en SELAE a las ${at}.`}`,
    ca: `**El Gordo de la Loteria de Nadal ${data.year} és el ${d.first}: ${M(perDecimo("first"), "ca")} per dècim.** Escriu el teu número i el que hi jugues per veure quin premi té i quant en cobres després d'Hisenda. ${p ? `Números llegits a SELAE a les ${at}: ${p}; el sorteig o la llista encara no són complets.` : `Els ${count(DRAWN_TOTAL, "ca")} números premiats, llegits a SELAE a les ${at}.`}`,
    en: `**El Gordo ${data.year} is ${d.first}: ${M(perDecimo("first"), "en")} per décimo.** Type your number and how much you play to see what it wins and what you keep after tax. ${p ? `Numbers read from SELAE at ${at} (Madrid): ${p}; the draw or the list is not complete yet.` : `All ${count(DRAWN_TOTAL, "en")} winning numbers, read from SELAE at ${at} (Madrid).`}`,
  });
}

export function freshLine(locale: Locale): string {
  const read = dateYear(SOURCES.selaeProgramme.read, locale);
  const boe = dateYear(SOURCES.boe2010.read, locale);
  const confirmed: { read: string; how: string } | null = PROGRAMME_CONFIRMED;
  const pending = confirmed === null;
  return L(locale, {
    es: `Premios: programa de SELAE para ${PROGRAMME_YEAR}, leído el ${read}. Qué números cobran aproximación, centena, terminación y reintegro: último programa publicado en el BOE (2010), leído el ${boe}${pending ? ", pendiente de confirmar con el texto de ${PROGRAMME_YEAR}" : `, confirmado con el programa de ${PROGRAMME_YEAR} el ${dateYear(confirmed?.read ?? "", "es")}`}.`,
    ca: `Premis: programa de SELAE per al ${PROGRAMME_YEAR}, llegit el ${read}. Quins números cobren aproximació, centena, terminació i reintegrament: últim programa publicat al BOE (2010), llegit el ${boe}${pending ? ", pendent de confirmar amb el text del ${PROGRAMME_YEAR}" : `, confirmat amb el programa del ${PROGRAMME_YEAR} el ${dateYear(confirmed?.read ?? "", "ca")}`}.`,
    en: `Prizes: SELAE's ${PROGRAMME_YEAR} programme, read ${read}. Which numbers win aproximaciones, centenas, last digits and reintegro: the last programme published in the BOE (2010), read ${boe}${pending ? ", pending confirmation against the ${PROGRAMME_YEAR} text" : `, confirmed against the ${PROGRAMME_YEAR} programme on ${dateYear(confirmed?.read ?? "", "en")}`}.`,
  });
}

/** The box shown instead of the form before the draw. */
export function preDrawNotice(locale: Locale): { title: string; text: string } {
  return L(locale, {
    es: { title: "El comprobador se activa el 22 de diciembre", text: `Funcionará con los números que publique SELAE ese día, a medida que salgan del bombo, y con la pedrea completa en cuanto esté. No usamos listas de otros medios. Hasta entonces puedes ver cuánto paga cada premio en la tabla de más abajo, y para cobrar solo vale la Lista Oficial de Premios de SELAE.` },
    ca: { title: "El comprovador s'activa el 22 de desembre", text: `Funcionarà amb els números que publiqui SELAE aquell dia, a mesura que surtin del bombo, i amb la pedrea completa tan bon punt hi sigui. No fem servir llistes d'altres mitjans. Fins aleshores pots veure quant paga cada premi a la taula de més avall, i per cobrar només val la Llista Oficial de Premis de SELAE.` },
    en: { title: "The checker goes live on 22 December", text: `It will run on the numbers SELAE publishes that day, as they come out of the drum, and on the full pedrea as soon as it is out. We do not use other outlets' lists. Until then, the table below shows what each prize pays, and only SELAE's Lista Oficial de Premios is valid for payment.` },
  });
}

export function willDo(locale: Locale): { heading: string; items: string[] } {
  const ex = M(EXEMPT_PER_TICKET, locale);
  return L(locale, {
    es: {
      heading: "Qué te dice el comprobador",
      items: [
        "**Si tu número tiene premio y de qué:** Gordo, segundo, tercero, cuartos, quintos, pedrea, aproximaciones, centenas, dos últimas cifras o reintegro. Un mismo décimo puede tener varios, y se suman.",
        "**Cuánto gana por décimo de 20 € y por cada euro jugado.**",
        `**Lo que cobras de lo que juegas**, sea un décimo, varios o una participación, después del 20 % que retiene Hacienda de lo que pasa de ${ex} por décimo (la misma cuenta que la ${tax("es", "calculadora de premios de lotería")}).`,
        `**Mientras dura el sorteo**, con los números publicados hasta ese momento: no te dirá «sin premio» hasta tener los ${count(DRAWN_TOTAL, "es")} números que salen del bombo.`,
      ],
    },
    ca: {
      heading: "Què et diu el comprovador",
      items: [
        "**Si el teu número té premi i de què:** Gordo, segon, tercer, quarts, cinquens, pedrea, aproximacions, centenes, dues últimes xifres o reintegrament. Un mateix dècim en pot tenir diversos, i se sumen.",
        "**Quant guanya per dècim de 20 € i per cada euro jugat.**",
        `**El que cobres del que hi jugues**, sigui un dècim, diversos o una participació, després del 20 % que reté Hisenda del que passa de ${ex} per dècim (el mateix càlcul que la ${tax("ca", "calculadora de premis de loteria")}).`,
        `**Mentre dura el sorteig**, amb els números publicats fins aleshores: no et dirà «sense premi» fins que tingui els ${count(DRAWN_TOTAL, "ca")} números que surten del bombo.`,
      ],
    },
    en: {
      heading: "What the checker tells you",
      items: [
        "**Whether your number wins, and what:** El Gordo, second, third, fourth or fifth prize, pedrea, aproximaciones, centenas, last two digits or reintegro. One décimo can win several at once, and they add up.",
        "**What it wins per €20 décimo and per euro played.**",
        `**What you keep from what you play**, one décimo, several or a share, after the 20% withheld on whatever each décimo wins above ${ex} (the same sums as the ${tax("en", "lottery prize tax calculator")}).`,
        `**While the draw is on**, from the numbers published so far: it will not say "no prize" until it has all ${count(DRAWN_TOTAL, "en")} numbers drawn from the drum.`,
      ],
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Prize table and rules                                                      */
/* -------------------------------------------------------------------------- */

export interface PrizeRow {
  id: CategoryId;
  label: string;
  count: string;
  perDecimo: string;
  perEuro: string;
  net: string;
}

/** Every category: how many per series, per décimo, per euro, and what one whole décimo keeps after the levy. */
export function prizeRows(locale: Locale): PrizeRow[] {
  return CATEGORIES.map((c) => ({
    id: c.id,
    label: CATEGORY_LABEL[c.id][locale],
    count: count(c.count, locale),
    perDecimo: M(perDecimo(c.id), locale),
    perEuro: M(perEuro(c.id), locale),
    net: M(breakdown(perDecimo(c.id), DECIMO_PRICE, 1).net, locale),
  }));
}

export function prizeTableText(locale: Locale): { heading: string; intro: string; cols: string[]; caption: string; after: string } {
  const programme = link(SOURCES.selaeProgramme.url, L(locale, { es: "programa de premios de SELAE", ca: "programa de premis de SELAE", en: "SELAE's prize programme" }));
  const read = dateYear(SOURCES.selaeProgramme.read, locale);
  return L(locale, {
    es: {
      heading: `Cuánto paga cada premio de la Lotería de Navidad ${PROGRAMME_YEAR}`,
      intro: `Cada número tiene 205 billetes, uno por serie, y cada billete de 200 € se divide en diez décimos de 20 €. El ${programme} da los importes por billete; un décimo cobra la décima parte, y cada euro jugado, la doscientosava.`,
      cols: ["Premio", "Cuántos hay en cada serie", "Por décimo (20 €)", "Por euro jugado", "Cobras de un décimo, tras Hacienda"],
      caption: `Programa de premios de SELAE del 26 de enero de ${PROGRAMME_YEAR}, leído el ${read}. Cada serie reparte ${count(PRIZES_PER_SERIES, "es")} premios y ${count(EUROS_PER_SERIES / 1e6, "es")} millones de euros.`,
      after: `Solo el Gordo, el segundo y el tercer premio pagan a Hacienda: los demás no pasan de ${M(EXEMPT_PER_TICKET, "es")} por décimo. Si un décimo gana varios premios a la vez, se suman y Hacienda cuenta la suma.`,
    },
    ca: {
      heading: `Quant paga cada premi de la Loteria de Nadal ${PROGRAMME_YEAR}`,
      intro: `Cada número té 205 bitllets, un per sèrie, i cada bitllet de 200 € es divideix en deu dècims de 20 €. El ${programme} dona els imports per bitllet; un dècim en cobra la desena part, i cada euro jugat, la dues-centena.`,
      cols: ["Premi", "Quants n'hi ha a cada sèrie", "Per dècim (20 €)", "Per euro jugat", "Cobres d'un dècim, després d'Hisenda"],
      caption: `Programa de premis de SELAE del 26 de gener de ${PROGRAMME_YEAR}, llegit el ${read}. Cada sèrie reparteix ${count(PRIZES_PER_SERIES, "ca")} premis i ${count(EUROS_PER_SERIES / 1e6, "ca")} milions d'euros.`,
      after: `Només el Gordo, el segon i el tercer premi paguen a Hisenda: la resta no passen de ${M(EXEMPT_PER_TICKET, "ca")} per dècim. Si un dècim guanya diversos premis alhora, se sumen i Hisenda compta la suma.`,
    },
    en: {
      heading: `What each ${PROGRAMME_YEAR} Christmas Lottery prize pays`,
      intro: `Each number has 205 tickets (billetes), one per series, and each €200 billete is split into ten €20 décimos. ${programme} gives the amounts per billete; a décimo wins a tenth, and each euro played a two-hundredth.`,
      cols: ["Prize", "How many in each series", "Per €20 décimo", "Per euro played", "You keep from one décimo, after tax"],
      caption: `SELAE's prize programme of 26 January ${PROGRAMME_YEAR}, read ${read}. Each series pays ${count(PRIZES_PER_SERIES, "en")} prizes and €${count(EUROS_PER_SERIES / 1e6, "en")} million.`,
      after: `Only El Gordo and the second and third prizes pay tax: the others do not exceed ${M(EXEMPT_PER_TICKET, "en")} per décimo. When one décimo wins several prizes, they add up and the tax is worked out on the sum.`,
    },
  });
}

/** The BOE's own example (00025) applied to a Gordo of 00025, with the 2026 numbering. */
export function rulesText(locale: Locale): { heading: string; items: string[]; pending: string | null; quoteLabel: string } {
  const [before, after] = neighbours("00025");
  const boe = link(SOURCES.boe2010.url, L(locale, { es: "último programa de Navidad publicado en el BOE", ca: "últim programa de Nadal publicat al BOE", en: "last Christmas programme published in the BOE" }));
  const items = L(locale, {
    es: [
      `**Aproximaciones:** el número anterior y el posterior al Gordo (${M(perDecimo("approxFirst"), "es")} por décimo), al segundo (${M(perDecimo("approxSecond"), "es")}) y al tercero (${M(perDecimo("approxThird"), "es")}). Si el premio fuera el 00025, cobrarían el ${before} y el ${after}. Si fuera el 00000, el anterior sería el 99999; si fuera el 99999, el siguiente sería el 00000.`,
      `**Centenas:** los otros 99 números de la misma centena que el Gordo, el segundo, el tercero y los dos cuartos premios, ${M(perDecimo("hundredFirst"), "es")} por décimo. Con el 00025, del 00000 al 00099 salvo el propio 00025.`,
      `**Dos últimas cifras:** los 999 números que acaban en las mismas dos cifras que el Gordo, el segundo o el tercero, ${M(perDecimo("lastTwoFirst"), "es")} por décimo cada vez. Con el 00025, todos los terminados en 25 salvo el 00025.`,
      `**Reintegro:** los 9.999 números que acaban en la misma cifra que el Gordo recuperan los ${M(perDecimo("reintegro"), "es")} del décimo. Con el 00025, todos los terminados en 5 salvo el 00025.`,
      "**Se suman:** cada premio excluye solo el número del que sale. Un quinto premio que acabe en la última cifra del Gordo cobra también el reintegro, y una aproximación al Gordo, también la centena.",
    ],
    ca: [
      `**Aproximacions:** el número anterior i el posterior al Gordo (${M(perDecimo("approxFirst"), "ca")} per dècim), al segon (${M(perDecimo("approxSecond"), "ca")}) i al tercer (${M(perDecimo("approxThird"), "ca")}). Si el premi fos el 00025, cobrarien el ${before} i el ${after}. Si fos el 00000, l'anterior seria el 99999; si fos el 99999, el següent seria el 00000.`,
      `**Centenes:** els altres 99 números de la mateixa centena que el Gordo, el segon, el tercer i els dos quarts premis, ${M(perDecimo("hundredFirst"), "ca")} per dècim. Amb el 00025, del 00000 al 00099 llevat del mateix 00025.`,
      `**Dues últimes xifres:** els 999 números que acaben en les mateixes dues xifres que el Gordo, el segon o el tercer, ${M(perDecimo("lastTwoFirst"), "ca")} per dècim cada vegada. Amb el 00025, tots els acabats en 25 llevat del 00025.`,
      `**Reintegrament:** els 9.999 números que acaben en la mateixa xifra que el Gordo recuperen els ${M(perDecimo("reintegro"), "ca")} del dècim. Amb el 00025, tots els acabats en 5 llevat del 00025.`,
      "**Se sumen:** cada premi exclou només el número del qual surt. Un cinquè premi que acabi en l'última xifra del Gordo cobra també el reintegrament, i una aproximació al Gordo, també la centena.",
    ],
    en: [
      `**Aproximaciones:** the numbers just before and just after El Gordo (${M(perDecimo("approxFirst"), "en")} per décimo), the second prize (${M(perDecimo("approxSecond"), "en")}) and the third (${M(perDecimo("approxThird"), "en")}). If the prize were 00025, ${before} and ${after} would win. If it were 00000, the one before would be 99999; if 99999, the one after would be 00000.`,
      `**Centenas:** the other 99 numbers of the same hundred as El Gordo, the second, the third and the two fourth prizes, ${M(perDecimo("hundredFirst"), "en")} per décimo. With 00025: 00000 to 00099 except 00025 itself.`,
      `**Last two digits:** the 999 numbers ending in the same two digits as El Gordo, the second or the third prize, ${M(perDecimo("lastTwoFirst"), "en")} per décimo each time. With 00025: every number ending in 25 except 00025.`,
      `**Reintegro (money back):** the 9,999 numbers ending in El Gordo's last digit get the décimo's ${M(perDecimo("reintegro"), "en")} back. With 00025: every number ending in 5 except 00025.`,
      "**They add up:** each prize leaves out only the number it comes from. A fifth prize ending in El Gordo's last digit also gets the reintegro, and a number next to El Gordo also gets its centena.",
    ],
  });
  const pending =
    PROGRAMME_CONFIRMED === null
      ? L(locale, {
          es: `**Pendiente de confirmar.** Los importes y cuántos premios hay son los del programa de SELAE para ${PROGRAMME_YEAR}. Qué números cobran cada premio derivado sigue el texto del ${boe} (el de 2010; el BOE no ha vuelto a publicarlos), con los 100.000 números de este año: da exactamente los 99, 198, 999 y 9.999 premios del programa de ${PROGRAMME_YEAR}. La web de SELAE no responde a nuestras consultas desde el 13 de noviembre, y aún no hemos podido releer su texto de ${PROGRAMME_YEAR}.`,
          ca: `**Pendent de confirmar.** Els imports i quants premis hi ha són els del programa de SELAE per al ${PROGRAMME_YEAR}. Quins números cobren cada premi derivat segueix el text de l'${boe} (el del 2010; el BOE no els ha tornat a publicar), amb els 100.000 números d'enguany: dona exactament els 99, 198, 999 i 9.999 premis del programa del ${PROGRAMME_YEAR}. El web de SELAE no respon a les nostres consultes des del 13 de novembre, i encara no n'hem pogut rellegir el text del ${PROGRAMME_YEAR}.`,
          en: `**Pending confirmation.** The amounts and how many prizes there are come from SELAE's ${PROGRAMME_YEAR} programme. Which numbers win each derived prize follows the wording of the ${boe} (2010's; the BOE has not published them since), applied to this year's 100,000 numbers: it gives exactly the 99, 198, 999 and 9,999 prizes of the ${PROGRAMME_YEAR} programme. SELAE's website has not answered our requests since 13 November, so we have not yet re-read its ${PROGRAMME_YEAR} wording.`,
        })
      : null;
  return {
    heading: L(locale, {
      es: "Aproximaciones, centenas, terminaciones y reintegro: qué números cobran",
      ca: "Aproximacions, centenes, terminacions i reintegrament: quins números cobren",
      en: "Aproximaciones, centenas, last digits and reintegro: which numbers win",
    }),
    items,
    pending,
    quoteLabel: `BOE-A-2010-19540 (${L(locale, { es: "texto literal, programa de 2010, con 85.000 números", ca: "text literal, programa del 2010, amb 85.000 números", en: "verbatim, 2010 programme, with 85,000 numbers" })})`,
  };
}

/* -------------------------------------------------------------------------- */
/* The draw, payment and official checks                                     */
/* -------------------------------------------------------------------------- */

export function drawText(locale: Locale): { heading: string; paras: string[] } {
  const d = link(U.dossier2025, "SELAE");
  return L(locale, {
    es: {
      heading: `Cuándo y cómo es el sorteo de Navidad ${PROGRAMME_YEAR}`,
      paras: [
        `**El ${drawDay("es")}, en el Teatro Real de Madrid.** ${timeLine("es")}`,
        `Hay dos bombos: el grande, con las 100.000 bolas de los números (del 00000 al 99999), y el pequeño, con una bola por cada premio que sale del bombo: ${count(DRAWN_TOTAL, "es")} (13 premios principales y ${count(DRAWN.pedrea, "es")} de la pedrea). Niños y niñas de la Residencia de San Ildefonso sacan a la vez una bola de cada bombo y las cantan (${d}). Los demás premios (aproximaciones, centenas, terminaciones y reintegro) no salen del bombo: se deducen de los números del Gordo, el segundo, el tercero y los cuartos.`,
        `Según SELAE, el canto puede tener errores y se revisa varias veces; el único resultado válido para cobrar es la Lista Oficial de Premios, que en 2025 se repartió la tarde del 22 de diciembre y se publicó en su web (${link(U.dossier2025, "dosier de 2025")}). Más sobre el sorteo, la compra y los resultados en Cataluña: ${guide("es", "guía de la Lotería de Navidad")}.`,
      ],
    },
    ca: {
      heading: `Quan i com és el sorteig de Nadal ${PROGRAMME_YEAR}`,
      paras: [
        `**El ${drawDay("ca")}, al Teatro Real de Madrid.** ${timeLine("ca")}`,
        `Hi ha dos bombos: el gran, amb les 100.000 boles dels números (del 00000 al 99999), i el petit, amb una bola per cada premi que surt del bombo: ${count(DRAWN_TOTAL, "ca")} (13 premis grossos i ${count(DRAWN.pedrea, "ca")} de la pedrea). Nens i nenes de la Residència de San Ildefonso treuen alhora una bola de cada bombo i les canten (${d}). La resta de premis (aproximacions, centenes, terminacions i reintegrament) no surten del bombo: es dedueixen dels números del Gordo, el segon, el tercer i els quarts.`,
        `Segons SELAE, la cantada pot tenir errors i es revisa diverses vegades; l'únic resultat vàlid per cobrar és la Llista Oficial de Premis, que el 2025 es va repartir la tarda del 22 de desembre i es va publicar al seu web (${link(U.dossier2025, "dossier del 2025")}). Més sobre el sorteig, la compra i els resultats a Catalunya: ${guide("ca", "guia de la Loteria de Nadal")}.`,
      ],
    },
    en: {
      heading: `When and how the ${PROGRAMME_YEAR} Christmas draw works`,
      paras: [
        `**On ${drawDay("en")}, at the Teatro Real in Madrid.** ${timeLine("en")}`,
        `There are two drums: the big one with the 100,000 number balls (00000 to 99999) and the small one with a ball for each prize drawn: ${count(DRAWN_TOTAL, "en")} (13 main prizes and ${count(DRAWN.pedrea, "en")} for the pedrea). Children from the San Ildefonso residence draw a ball from each drum at the same time and sing them out (${d}). The other prizes (aproximaciones, centenas, last digits and reintegro) are not drawn: they follow from the numbers of El Gordo, the second, the third and the fourth prizes.`,
        `According to SELAE, the singing can contain mistakes and is checked several times; the only result valid for payment is the Lista Oficial de Premios, handed out on the afternoon of 22 December in 2025 and posted on its website (${link(U.dossier2025, "2025 dossier")}). More on the draw, buying and the Catalan results: ${guide("en", "Spanish Christmas Lottery guide")}.`,
      ],
    },
  });
}

export function payText(locale: Locale): { heading: string; items: string[]; after: string } {
  const g = breakdown(perDecimo("first"), DECIMO_PRICE, 1);
  const share = breakdown(perDecimo("first"), DECIMO_PRICE, 5 / DECIMO_PRICE);
  const ex = M(EXEMPT_PER_TICKET, locale);
  const c = link(U.collect, "SELAE");
  return L(locale, {
    es: {
      heading: "Cómo se cobran los premios y cuánto se queda Hacienda",
      items: [
        `**Menos de 2.000 € por décimo:** en cualquiera de los casi 11.000 puntos de venta de SELAE (${c}).`,
        `**2.000 € o más:** solo en BBVA o CaixaBank, con el documento de identidad original, sin ser cliente y sin comisión (${c}).`,
        `**Comprado por internet:** SELAE avisa por correo, notificación y SMS, y lo que vale es el apartado «Apuestas» de tu cuenta (${link(U.notify, "SELAE")}).`,
        `**Plazo:** tres meses, contados desde el día siguiente al sorteo (${link(U.dossier2025, "SELAE")}).`,
      ],
      after: `**Hacienda:** cada décimo tiene ${ex} exentos y se retiene el 20 % del resto al cobrar (${link(U.irpf, "Ley 35/2006, disposición adicional 33.ª")}); no se declara en la Renta. Un décimo del Gordo deja ${M(g.net, "es")}; una participación de 5 €, ${M(share.net, "es")}. Varios décimos, participaciones y otros sorteos: ${tax("es", "calculadora de premios de lotería")}.`,
    },
    ca: {
      heading: "Com es cobren els premis i quant se n'endú Hisenda",
      items: [
        `**Menys de 2.000 € per dècim:** a qualsevol dels gairebé 11.000 punts de venda de SELAE (${c}).`,
        `**2.000 € o més:** només a BBVA o CaixaBank, amb el document d'identitat original, sense ser-ne client i sense comissió (${c}).`,
        `**Comprat per internet:** SELAE avisa per correu, notificació i SMS, i el que val és l'apartat «Apuestas» del teu compte (${link(U.notify, "SELAE")}).`,
        `**Termini:** tres mesos, comptats des de l'endemà del sorteig (${link(U.dossier2025, "SELAE")}).`,
      ],
      after: `**Hisenda:** cada dècim té ${ex} exempts i es reté el 20 % de la resta en cobrar-lo (${link(U.irpf, "Llei 35/2006, disposició addicional 33a")}); no es declara a la Renda. Un dècim del Gordo en deixa ${M(g.net, "ca")}; una participació de 5 €, ${M(share.net, "ca")}. Diversos dècims, participacions i altres sortejos: ${tax("ca", "calculadora de premis de loteria")}.`,
    },
    en: {
      heading: "How prizes are paid and how much tax is taken",
      items: [
        `**Under €2,000 per décimo:** at any of SELAE's almost 11,000 lottery shops (${c}).`,
        `**€2,000 or more:** only at BBVA or CaixaBank, with your original ID, without being a customer and with no fee (${c}).`,
        `**Bought online:** SELAE notifies you by email, in-app notice and text message, and the "Apuestas" section of your account is what counts (${link(U.notify, "SELAE")}).`,
        `**Deadline:** three months, counted from the day after the draw (${link(U.dossier2025, "SELAE")}).`,
      ],
      after: `**Tax:** each décimo has ${ex} tax-free and 20% of the rest is withheld when you collect (${link(U.irpf, "Law 35/2006, additional provision 33")}); you do not declare it. An El Gordo décimo leaves ${M(g.net, "en")}; a €5 share, ${M(share.net, "en")}. Several décimos, shares and other draws: ${tax("en", "lottery prize tax calculator")}.`,
    },
  });
}

export function officialText(locale: Locale): { heading: string; items: string[] } {
  return L(locale, {
    es: {
      heading: "Cómo comprobar el décimo en SELAE",
      items: [
        `En el ${link(U.lnac, "comprobador de la Lotería Nacional")} de SELAE («Comprueba tus números»), con el número de cinco cifras.`,
        `En la Lista Oficial de Premios, que SELAE cuelga en PDF la tarde del sorteo (la de 2025 es ${link(U.list2025, "esta")}): es la única que vale para cobrar.`,
        "En cualquier punto de venta de Loterías y Apuestas del Estado.",
        `Dónde se ha vendido cada premio principal, por provincias y municipios: ${hub("es", "dónde ha tocado el Gordo")}.`,
      ],
    },
    ca: {
      heading: "Com comprovar el dècim a SELAE",
      items: [
        `Al ${link(U.lnac, "comprovador de la Loteria Nacional")} de SELAE («Comprueba tus números»), amb el número de cinc xifres.`,
        `A la Llista Oficial de Premis, que SELAE penja en PDF la tarda del sorteig (la del 2025 és ${link(U.list2025, "aquesta")}): és l'única que val per cobrar.`,
        "A qualsevol punt de venda de Loteries i Apostes de l'Estat.",
        `On s'ha venut cada premi gros, per províncies i municipis: ${hub("ca", "on ha tocat la loteria de Nadal")}.`,
      ],
    },
    en: {
      heading: "How to check your décimo with SELAE",
      items: [
        `On SELAE's ${link(U.lnac, "Lotería Nacional checker")} ("Comprueba tus números"), with the five-digit number.`,
        `On the Lista Oficial de Premios, which SELAE posts as a PDF on the afternoon of the draw (${link(U.list2025, "the 2025 one")}): the only list valid for payment.`,
        "At any Loterías y Apuestas del Estado lottery shop.",
        `Where each main prize was sold, by province and town: ${hub("en", "Christmas Lottery results")}.`,
      ],
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Results (from the snapshot)                                                */
/* -------------------------------------------------------------------------- */

export function resultsHeadings(locale: Locale, year: number) {
  return L(locale, {
    es: { results: `Números premiados de la Lotería de Navidad ${year}`, main: "Premios que salen del bombo", derived: "Premios que se deducen de los principales", pedrea: "La pedrea, por millares", notYet: "Aún no ha salido", colNumber: "Número", colNumbers: "Números", pedreaNote: (n: string, total: string) => `${n} de ${total} números de la pedrea leídos en SELAE, de menor a mayor. Cada uno cobra ${M(perDecimo("pedrea"), "es")} por décimo.`, pedreaMissing: "SELAE aún no ha publicado la lista de la pedrea en el formato que lee esta página: búscala en la Lista Oficial de Premios.", range: (from: string, to: string, except: string) => `Del ${from} al ${to}, salvo el ${except}`, ending: (digits: string, except: string) => `Acabados en ${digits}, salvo el ${except}`, and: "y" },
    ca: { results: `Números premiats de la Loteria de Nadal ${year}`, main: "Premis que surten del bombo", derived: "Premis que es dedueixen dels principals", pedrea: "La pedrea, per milers", notYet: "Encara no ha sortit", colNumber: "Número", colNumbers: "Números", pedreaNote: (n: string, total: string) => `${n} de ${total} números de la pedrea llegits a SELAE, de menor a major. Cadascun cobra ${M(perDecimo("pedrea"), "ca")} per dècim.`, pedreaMissing: "SELAE encara no ha publicat la llista de la pedrea en el format que llegeix aquesta pàgina: busca-la a la Llista Oficial de Premis.", range: (from: string, to: string, except: string) => `Del ${from} al ${to}, llevat del ${except}`, ending: (digits: string, except: string) => `Acabats en ${digits}, llevat del ${except}`, and: "i" },
    en: { results: `${year} Spanish Christmas Lottery winning numbers`, main: "Prizes drawn from the drum", derived: "Prizes that follow from the main ones", pedrea: "The pedrea, by thousand", notYet: "Not drawn yet", colNumber: "Number", colNumbers: "Numbers", pedreaNote: (n: string, total: string) => `${n} of ${total} pedrea numbers read from SELAE, lowest first. Each wins ${M(perDecimo("pedrea"), "en")} per décimo.`, pedreaMissing: "SELAE has not yet published the pedrea in the format this page reads: look it up on the Lista Oficial de Premios.", range: (from: string, to: string, except: string) => `${from} to ${to}, except ${except}`, ending: (digits: string, except: string) => `Ending in ${digits}, except ${except}`, and: "and" },
  });
}

/* -------------------------------------------------------------------------- */
/* FAQ and links                                                              */
/* -------------------------------------------------------------------------- */

export function checkFaq(locale: Locale): { q: string; a: string }[] {
  const pd = M(perDecimo("pedrea"), locale);
  const pe = M(perEuro("pedrea"), locale);
  const a1 = M(perDecimo("approxFirst"), locale);
  const rd = M(perDecimo("reintegro"), locale);
  const g = breakdown(perDecimo("first"), DECIMO_PRICE, 1);
  const ex = M(EXEMPT_PER_TICKET, locale);
  return L(locale, {
    es: [
      { q: `¿Cuándo se puede comprobar la Lotería de Navidad ${PROGRAMME_YEAR}?`, a: `El ${drawDay("es")}, a medida que salen los números. Esta página se actualiza con los que publica SELAE; la Lista Oficial de Premios, la única válida para cobrar, se publicó en 2025 la tarde del sorteo.` },
      { q: "¿Cuánto cobra la pedrea?", a: `${pd} por décimo de 20 € (${pe} por euro jugado). Son ${count(DRAWN.pedrea, "es")} números, además de los 13 premios principales.` },
      { q: "¿Cuánto cobran las aproximaciones del Gordo?", a: `${a1} por décimo cada una: el número anterior y el posterior al Gordo. Las del segundo cobran ${M(perDecimo("approxSecond"), "es")} y las del tercero ${M(perDecimo("approxThird"), "es")}.` },
      { q: "¿Qué es el reintegro?", a: `Que te devuelven lo jugado: ${rd} por décimo si tu número acaba en la misma cifra que el Gordo (salvo el propio Gordo).` },
      { q: "¿Cuánto se queda Hacienda de un décimo premiado?", a: `El 20 % de lo que pasa de ${ex} por décimo. Del Gordo (${M(g.gross, "es")}) se retienen ${M(g.withholding, "es")} y cobras ${M(g.net, "es")}. Los demás premios, salvo el segundo y el tercero, no pagan nada.` },
      { q: "¿Qué lista vale para cobrar?", a: "Solo la Lista Oficial de Premios de SELAE. Ningún comprobador, tampoco este, sustituye a esa lista." },
      { q: "¿Hasta cuándo se puede cobrar un décimo premiado?", a: "Tres meses, contados desde el día siguiente al sorteo, según SELAE. Para el sorteo de 2025, el último día fue el 23 de marzo de 2026." },
    ],
    ca: [
      { q: `Quan es pot comprovar la Loteria de Nadal ${PROGRAMME_YEAR}?`, a: `El ${drawDay("ca")}, a mesura que surten els números. Aquesta pàgina s'actualitza amb els que publica SELAE; la Llista Oficial de Premis, l'única vàlida per cobrar, es va publicar el 2025 la tarda del sorteig.` },
      { q: "Quant cobra la pedrea?", a: `${pd} per dècim de 20 € (${pe} per euro jugat). Són ${count(DRAWN.pedrea, "ca")} números, a més dels 13 premis grossos.` },
      { q: "Quant cobren les aproximacions del Gordo?", a: `${a1} per dècim cadascuna: el número anterior i el posterior al Gordo. Les del segon cobren ${M(perDecimo("approxSecond"), "ca")} i les del tercer ${M(perDecimo("approxThird"), "ca")}.` },
      { q: "Què és el reintegrament?", a: `Que et tornen el que has jugat: ${rd} per dècim si el teu número acaba en la mateixa xifra que el Gordo (llevat del mateix Gordo).` },
      { q: "Quant se n'endú Hisenda d'un dècim premiat?", a: `El 20 % del que passa de ${ex} per dècim. Del Gordo (${M(g.gross, "ca")}) se'n retenen ${M(g.withholding, "ca")} i en cobres ${M(g.net, "ca")}. La resta de premis, llevat del segon i el tercer, no paguen res.` },
      { q: "Quina llista val per cobrar?", a: "Només la Llista Oficial de Premis de SELAE. Cap comprovador, tampoc aquest, no substitueix aquesta llista." },
      { q: "Fins quan es pot cobrar un dècim premiat?", a: "Tres mesos, comptats des de l'endemà del sorteig, segons SELAE. Per al sorteig del 2025, l'últim dia va ser el 23 de març de 2026." },
    ],
    en: [
      { q: `When can I check the ${PROGRAMME_YEAR} Spanish Christmas Lottery?`, a: `On ${drawDay("en")}, as the numbers come out. This page is updated with the numbers SELAE publishes; the Lista Oficial de Premios, the only list valid for payment, was posted on the afternoon of the draw in 2025.` },
      { q: "How much does the pedrea pay?", a: `${pd} per €20 décimo (${pe} per euro played). There are ${count(DRAWN.pedrea, "en")} such numbers, on top of the 13 main prizes.` },
      { q: "What do the numbers next to El Gordo win?", a: `${a1} per décimo each: the numbers just before and just after El Gordo (aproximaciones). Those next to the second prize win ${M(perDecimo("approxSecond"), "en")} and next to the third ${M(perDecimo("approxThird"), "en")}.` },
      { q: "What is the reintegro?", a: `Your money back: ${rd} per décimo if your number ends in the same digit as El Gordo (except El Gordo itself).` },
      { q: "How much tax is taken from a winning décimo?", a: `20% of whatever it wins above ${ex}. El Gordo (${M(g.gross, "en")}) has ${M(g.withholding, "en")} withheld and you keep ${M(g.net, "en")}. Other prizes, except the second and third, pay nothing.` },
      { q: "Which list is valid for payment?", a: "Only SELAE's Lista Oficial de Premios. No checker, this one included, replaces it." },
      { q: "How long do I have to claim a winning décimo?", a: "Three months, counted from the day after the draw, according to SELAE. For the 2025 draw, the last day was 23 March 2026." },
    ],
  });
}

export function relatedLinks(locale: Locale): { href: string; label: string }[] {
  return L(locale, {
    es: [
      { href: gordoHubPath("es"), label: "Dónde ha tocado el Gordo: los premios principales por provincias y municipios" },
      { href: calcPath("lottery-tax", "es"), label: "Calculadora de premios de lotería: cuánto se queda Hacienda" },
      { href: b2href("loteriaNadal", "es"), label: "Guía de la Lotería de Navidad 2026" },
      { href: grossaCheckPath("es"), label: "Comprobar La Grossa de Cap d'Any (31 de diciembre)" },
      { href: ninoCheckPath("es"), label: "Comprobar la Lotería del Niño (6 de enero)" },
    ],
    ca: [
      { href: gordoHubPath("ca"), label: "On ha tocat la loteria de Nadal: els premis grossos per províncies i municipis" },
      { href: calcPath("lottery-tax", "ca"), label: "Calculadora de premis de loteria: quant se'n queda Hisenda" },
      { href: b2href("loteriaNadal", "ca"), label: "Guia de la Loteria de Nadal 2026" },
      { href: grossaCheckPath("ca"), label: "Comprovar La Grossa de Cap d'Any (31 de desembre)" },
      { href: ninoCheckPath("ca"), label: "Comprovar la Loteria del Nen (6 de gener)" },
    ],
    en: [
      { href: gordoHubPath("en"), label: "Where El Gordo was sold: the main prizes by province and town" },
      { href: calcPath("lottery-tax", "en"), label: "Spanish lottery prize tax calculator" },
      { href: b2href("loteriaNadal", "en"), label: "Spanish Christmas Lottery 2026 guide" },
      { href: grossaCheckPath("en"), label: "Check your La Grossa de Cap d'Any ticket (31 December)" },
      { href: ninoCheckPath("en"), label: "Check your El Niño lottery ticket (6 January)" },
    ],
  });
}

export function disclaimer(locale: Locale): string {
  return L(locale, {
    es: "Comprobación orientativa con los números que publica SELAE y su programa de premios. Para cobrar solo vale la Lista Oficial de Premios de SELAE; lo que cuenta es lo que te pague y te retenga quien abona el premio.",
    ca: "Comprovació orientativa amb els números que publica SELAE i el seu programa de premis. Per cobrar només val la Llista Oficial de Premis de SELAE; el que compta és el que et pagui i et retingui qui abona el premi.",
    en: "An indicative check against the numbers SELAE publishes and its prize programme. Only SELAE's Lista Oficial de Premios is valid for payment; what counts is what the payer pays you and withholds.",
  });
}
