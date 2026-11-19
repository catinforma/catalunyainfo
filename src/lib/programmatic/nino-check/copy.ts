/**
 * Copy of the El Niño lottery checker page ("Comprobar Lotería del Niño
 * 2027"), in Spanish, Catalan and English. Server-side.
 *
 * Until SELAE's 2027 programme is read (programme-2027.json), the only 2027
 * figures printed are SELAE's own, read on 31 Oct 2026: the date, the 20 €
 * décimo and the first prize (2,000,000 € a la serie). The rules of the
 * derived prizes are the BOE's last El Niño programme (2011), always said to
 * be 2011's and "pendiente de confirmar"; its amounts are never printed. Tax
 * from the lottery-tax engine (Ley 35/2006, DA 33ª). Text in `[label](href)`
 * and `**bold**` markup.
 */

import { dateYear, dayDate } from "@/lib/content/batch02/festive";
import { NADAL_URLS } from "@/lib/content/batch02/loteria-nadal";
import { b2href } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";
import { calcPath } from "@/lib/programmatic/calculators/paths";
import { gordoHubPath } from "@/lib/programmatic/gordo/paths";
import { grossaCheckPath } from "@/lib/programmatic/grossa-check/paths";
import { checkPath } from "@/lib/programmatic/lottery-check/paths";
import { money, num } from "@/lib/programmatic/lottery-tax/copy";
import { breakdown } from "@/lib/programmatic/lottery-tax/engine";
import { EXEMPT_PER_TICKET } from "@/lib/programmatic/lottery-tax/rules";

import { categoryLabel, madridTime } from "./client-copy";
import type { NinoCheckerData } from "./data";
import { neighbours } from "./engine";
import { BOE_2011, DECIMO_PRICE, DECIMOS_PER_BILLETE, DRAW_DATE, FIRST_PER_BILLETE, NINO_YEAR, SOURCES, perDecimo, perEuro, type NinoCategory, type NinoProgramme } from "./programme";
import { PROGRAMME_2027 } from "./programme-data";

/** The day the page's facts were last checked (the BOE programme read; SELAE re-tested, 403). */
export const NINO_CHECK_AS_OF = "2026-11-19";

export const TITLE_LIMIT = 65;
export const DESCRIPTION_LIMIT = 160;

const link = (href: string, label: string) => `[${label}](${href})`;
const L = <T,>(locale: Locale, v: Record<Locale, T>): T => v[locale];
const U = NADAL_URLS;

export const M = (n: number, locale: Locale) => money(n, locale);
const count = (n: number, locale: Locale) => num(n, 0, locale);

/** First prize per 20 € décimo (SELAE's page). */
export const FIRST_PER_DECIMO = FIRST_PER_BILLETE / DECIMOS_PER_BILLETE;

export const drawDay = (locale: Locale, withYear = true) => dayDate(DRAW_DATE, locale, withYear);

export function ninoCheckSources(data: NinoCheckerData, programme: NinoProgramme | null = PROGRAMME_2027): { name: string; url: string; publisher: string }[] {
  const out: { name: string; url: string; publisher: string }[] = [];
  if (data.available && data.sources) {
    out.push({ name: `Lotería Nacional: resultados del Sorteo Extraordinario de El Niño del 6 de enero de ${data.year}`, url: data.sources.results, publisher: "SELAE" });
    if (data.sources.officialList) out.push({ name: `Lista oficial de premios del sorteo de El Niño del 6 de enero de ${data.year}`, url: data.sources.officialList, publisher: "SELAE" });
  }
  out.push({ name: SOURCES.selaeLnac.name, url: SOURCES.selaeLnac.url, publisher: "SELAE" });
  out.push({ name: programme ? programme.source.name : SOURCES.selaeProgramme.name, url: programme ? programme.source.url : SOURCES.selaeProgramme.url, publisher: "SELAE" });
  out.push(
    { name: SOURCES.boe2011.name, url: SOURCES.boe2011.url, publisher: "BOE" },
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

export function ninoCheckMeta(locale: Locale, data: NinoCheckerData): CheckMeta {
  const y = NINO_YEAR;
  const first = data.available ? data.draw?.first : null;
  const base = {
    es: { h1: `Comprobar Lotería del Niño ${y}`, crumb: "Comprobar Lotería del Niño", title: `Comprobar Lotería del Niño ${y}: décimo y premios`, appName: `Comprobador de la Lotería del Niño ${y} con premio neto tras Hacienda` },
    ca: { h1: `Comprovar la Loteria del Nen ${y}`, crumb: "Comprovar la Loteria del Nen", title: `Comprovar la Loteria del Nen ${y} (El Niño): dècim i premis`, appName: `Comprovador de la Loteria del Nen ${y} amb el premi net` },
    en: { h1: `Check your El Niño lottery ticket ${y}`, crumb: "Check your El Niño lottery ticket", title: `Check your El Niño lottery ticket ${y} (Spain, 6 January)`, appName: `El Niño ${y} lottery ticket checker with the prize after tax` },
  }[locale];
  const p = M(FIRST_PER_DECIMO, locale);
  const description = first
    ? {
        es: `El primer premio del Niño ${y} es el ${first}. Comprueba tu décimo: premio por décimo y por euro, extracciones, reintegro y lo que cobras tras Hacienda.`,
        ca: `El primer premi del Nen ${y} és el ${first}. Comprova el teu dècim: premi per dècim i per euro, extraccions, reintegrament i el que cobres net.`,
        en: `El Niño ${y} first prize is ${first}. Check your décimo: prize per décimo and per euro, extractions, reintegro and what you keep after tax.`,
      }[locale]
    : {
        es: `El 6 de enero, comprueba tu décimo del Niño ${y}: primer premio de ${p} por décimo, el resto de premios y lo que cobras tras Hacienda.`,
        ca: `El 6 de gener, comprova el teu dècim del Nen ${y}: primer premi de ${p} per dècim, la resta de premis i el que cobres després d'Hisenda.`,
        en: `On 6 January, check your El Niño ${y} décimo: ${p} first prize per décimo, the other prizes and what you keep after Spanish tax.`,
      }[locale];
  return { ...base, description };
}

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                              */
/* -------------------------------------------------------------------------- */

const tax = (locale: Locale, label: string) => link(calcPath("lottery-tax", locale), label);
const lnacPage = (locale: Locale) => link(SOURCES.selaeLnac.url, L(locale, { es: "página de la Lotería Nacional", ca: "pàgina de la Loteria Nacional", en: "Lotería Nacional page" }));
const boe = (locale: Locale) => link(SOURCES.boe2011.url, L(locale, { es: "último programa del Niño publicado en el BOE", ca: "últim programa del Nen publicat al BOE", en: "last El Niño programme published in the BOE" }));

/* -------------------------------------------------------------------------- */
/* Lead and state                                                             */
/* -------------------------------------------------------------------------- */

export function ninoLead(locale: Locale, data: NinoCheckerData): string {
  const d = data.available ? data.draw : null;
  const serie = M(FIRST_PER_BILLETE, locale);
  const dec = M(FIRST_PER_DECIMO, locale);
  if (!d?.first) {
    return L(locale, {
      es: `**El Sorteo Extraordinario de El Niño ${NINO_YEAR} es el ${drawDay("es", false)}, y su primer premio es de ${serie} por serie: ${dec} por décimo de 20 €, según la ${lnacPage("es")} de SELAE.** Ese día, en cuanto SELAE publique los números, aquí podrás escribir tu número y lo que juegas y verás todos sus premios por décimo y por euro y cuánto cobras después de Hacienda. Mientras tanto: qué se sabe del sorteo de ${NINO_YEAR}, cómo se reparten los premios, los impuestos y cómo comprobarlo en SELAE.`,
      ca: `**El sorteig extraordinari del Nen (El Niño) ${NINO_YEAR} és el ${drawDay("ca", false)}, i el primer premi és de ${serie} per sèrie: ${dec} per dècim de 20 €, segons la ${lnacPage("ca")} de SELAE.** Aquell dia, tan bon punt SELAE publiqui els números, aquí podràs escriure el teu número i el que hi jugues i veuràs tots els seus premis per dècim i per euro i quant en cobres després d'Hisenda. Mentrestant: què se sap del sorteig del ${NINO_YEAR}, com es reparteixen els premis, els impostos i com comprovar-ho a SELAE.`,
      en: `**Spain's El Niño lottery draw (Sorteo Extraordinario de El Niño) ${NINO_YEAR} is on ${drawDay("en", false)}, and its first prize is ${serie} per series: ${dec} per €20 décimo, according to SELAE's ${lnacPage("en")}.** On the day, as soon as SELAE publishes the numbers, you can type your number and how much you play here and see every prize it wins per décimo and per euro and what you keep after Spanish tax. Until then: what is known about the ${NINO_YEAR} draw, how the prizes work, tax and how to check with SELAE.`,
    });
  }
  const at = data.readAt ? madridTime(data.readAt) : "";
  const done = data.complete;
  return L(locale, {
    es: `**El primer premio del Niño ${data.year} es el ${d.first}: ${dec} por décimo.** Escribe tu número y lo que juegas para ver qué premio tiene y cuánto cobras tras Hacienda. ${done ? `Todas las extracciones, leídas en SELAE a las ${at}.` : `Números leídos en SELAE a las ${at}; aún faltan extracciones.`}`,
    ca: `**El primer premi del Nen ${data.year} és el ${d.first}: ${dec} per dècim.** Escriu el teu número i el que hi jugues per veure quin premi té i quant en cobres després d'Hisenda. ${done ? `Totes les extraccions, llegides a SELAE a les ${at}.` : `Números llegits a SELAE a les ${at}; encara falten extraccions.`}`,
    en: `**El Niño ${data.year} first prize is ${d.first}: ${dec} per décimo.** Type your number and how much you play to see what it wins and what you keep after tax. ${done ? `All extractions, read from SELAE at ${at} (Madrid).` : `Numbers read from SELAE at ${at} (Madrid); some extractions are still missing.`}`,
  });
}

export function ninoFreshLine(locale: Locale, programme: NinoProgramme | null = PROGRAMME_2027): string {
  const read = dateYear(SOURCES.selaeLnac.read, locale);
  const boeRead = dateYear(SOURCES.boe2011.read, locale);
  if (programme) {
    const p = dateYear(programme.confirmed.read, locale);
    return L(locale, {
      es: `Premios: programa de SELAE para ${NINO_YEAR}, leído el ${p}. Fecha y primer premio: página de la Lotería Nacional de SELAE, leída el ${read}.`,
      ca: `Premis: programa de SELAE per al ${NINO_YEAR}, llegit el ${p}. Data i primer premi: pàgina de la Loteria Nacional de SELAE, llegida el ${read}.`,
      en: `Prizes: SELAE's ${NINO_YEAR} programme, read ${p}. Date and first prize: SELAE's Lotería Nacional page, read ${read}.`,
    });
  }
  return L(locale, {
    es: `Fecha, décimo y primer premio: página de la Lotería Nacional de SELAE, leída el ${read}. El resto del programa de ${NINO_YEAR}, pendiente de leer. Qué números cobran los premios derivados: último programa del Niño publicado en el BOE (2011), leído el ${boeRead}, pendiente de confirmar.`,
    ca: `Data, dècim i primer premi: pàgina de la Loteria Nacional de SELAE, llegida el ${read}. La resta del programa del ${NINO_YEAR}, pendent de llegir. Quins números cobren els premis derivats: últim programa del Nen publicat al BOE (2011), llegit el ${boeRead}, pendent de confirmar.`,
    en: `Date, décimo and first prize: SELAE's Lotería Nacional page, read ${read}. The rest of the ${NINO_YEAR} programme: still to be read. Which numbers win the derived prizes: the last El Niño programme published in the BOE (2011), read ${boeRead}, pending confirmation.`,
  });
}

export function ninoPreDrawNotice(locale: Locale): { title: string; text: string } {
  return L(locale, {
    es: { title: "El comprobador se activa el 6 de enero", text: "Funcionará con los números que publique SELAE ese día y con su programa de premios de 2027. No usamos listas ni importes de otros medios. Para cobrar solo vale la lista oficial de premios de SELAE." },
    ca: { title: "El comprovador s'activa el 6 de gener", text: "Funcionarà amb els números que publiqui SELAE aquell dia i amb el seu programa de premis del 2027. No fem servir llistes ni imports d'altres mitjans. Per cobrar només val la llista oficial de premis de SELAE." },
    en: { title: "The checker goes live on 6 January", text: "It will run on the numbers SELAE publishes that day and on its 2027 prize programme. We do not use other outlets' lists or amounts. Only SELAE's official prize list is valid for payment." },
  });
}

export function ninoWillDo(locale: Locale): { heading: string; items: string[] } {
  const ex = M(EXEMPT_PER_TICKET, locale);
  return L(locale, {
    es: {
      heading: "Qué te dice el comprobador",
      items: [
        "**Si tu número tiene premio y de qué:** el primer premio y los demás de cinco cifras, las extracciones de menos cifras, las aproximaciones, las centenas, las terminaciones y el reintegro. Un mismo décimo puede tener varios, y se suman.",
        "**Cuánto gana por décimo de 20 € y por cada euro jugado**, con el programa de premios de SELAE para 2027.",
        `**Lo que cobras de lo que juegas**, sea un décimo, varios o una participación, después del 20 % que retiene Hacienda de lo que pasa de ${ex} por décimo (la misma cuenta que la ${tax("es", "calculadora de premios de lotería")}).`,
        "**Mientras dura el sorteo**, con los números publicados hasta ese momento: no te dirá «sin premio» hasta tener todas las extracciones.",
      ],
    },
    ca: {
      heading: "Què et diu el comprovador",
      items: [
        "**Si el teu número té premi i de què:** el primer premi i els altres de cinc xifres, les extraccions de menys xifres, les aproximacions, les centenes, les terminacions i el reintegrament. Un mateix dècim en pot tenir diversos, i se sumen.",
        "**Quant guanya per dècim de 20 € i per cada euro jugat**, amb el programa de premis de SELAE per al 2027.",
        `**El que cobres del que hi jugues**, sigui un dècim, diversos o una participació, després del 20 % que reté Hisenda del que passa de ${ex} per dècim (el mateix càlcul que la ${tax("ca", "calculadora de premis de loteria")}).`,
        "**Mentre dura el sorteig**, amb els números publicats fins aleshores: no et dirà «sense premi» fins que tingui totes les extraccions.",
      ],
    },
    en: {
      heading: "What the checker tells you",
      items: [
        "**Whether your number wins, and what:** the first prize and the other five-digit prizes, the shorter extractions, aproximaciones, centenas, endings and reintegro. One décimo can win several, and they add up.",
        "**What it wins per €20 décimo and per euro played**, on SELAE's 2027 prize programme.",
        `**What you keep from what you play**, one décimo, several or a share, after the 20% withheld on whatever each décimo wins above ${ex} (the same sums as the ${tax("en", "lottery prize tax calculator")}).`,
        "**While the draw is on**, from the numbers published so far: it will not say \"no prize\" until every extraction is in.",
      ],
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Prizes                                                                     */
/* -------------------------------------------------------------------------- */

export interface NinoPrizeRow {
  id: string;
  label: string;
  count: string;
  perDecimo: string;
  perEuro: string;
  net: string;
}

/** The programme's rows once read; before that, the first prize alone (SELAE's page). */
export function ninoPrizeRows(locale: Locale, programme: NinoProgramme | null = PROGRAMME_2027): NinoPrizeRow[] {
  if (!programme) {
    return [{ id: "first", label: L(locale, { es: "Primer premio", ca: "Primer premi", en: "First prize" }), count: "1", perDecimo: M(FIRST_PER_DECIMO, locale), perEuro: M(FIRST_PER_BILLETE / (DECIMO_PRICE * DECIMOS_PER_BILLETE), locale), net: M(breakdown(FIRST_PER_DECIMO, DECIMO_PRICE, 1).net, locale) }];
  }
  return programme.categories.map((c) => ({
    id: c.id,
    label: categoryLabel(c, locale),
    count: count(c.count, locale),
    perDecimo: M(perDecimo(c, programme), locale),
    perEuro: M(perEuro(c, programme), locale),
    net: M(breakdown(perDecimo(c, programme), DECIMO_PRICE, 1).net, locale),
  }));
}

export function ninoPrizeTableText(locale: Locale, programme: NinoProgramme | null = PROGRAMME_2027): { heading: string; intro: string; cols: string[]; caption: string; after: string } {
  const cols = L(locale, {
    es: ["Premio", "Cuántos hay en cada serie", "Por décimo (20 €)", "Por euro jugado", "Cobras de un décimo, tras Hacienda"],
    ca: ["Premi", "Quants n'hi ha a cada sèrie", "Per dècim (20 €)", "Per euro jugat", "Cobres d'un dècim, després d'Hisenda"],
    en: ["Prize", "How many in each series", "Per €20 décimo", "Per euro played", "You keep from one décimo, after tax"],
  });
  const read = dateYear(SOURCES.selaeLnac.read, locale);
  const pdf = link(SOURCES.selaeProgramme.url, L(locale, { es: "programas de premios del primer trimestre de 2027", ca: "programes de premis del primer trimestre del 2027", en: "first-quarter 2027 prize programmes" }));
  if (!programme) {
    return L(locale, {
      es: {
        heading: `Premios del Niño ${NINO_YEAR}: lo que ha publicado SELAE`,
        intro: `Cada billete de 200 € se divide en diez décimos de 20 €. SELAE da el primer premio por serie (por billete): ${M(FIRST_PER_BILLETE, "es")}, es decir, ${M(FIRST_PER_DECIMO, "es")} por décimo.`,
        cols,
        caption: `Página de la Lotería Nacional de SELAE, leída el ${read}.`,
        after: `El resto de premios de ${NINO_YEAR} (cuántas extracciones hay de cada tipo y cuánto paga cada una) está en los ${pdf} de SELAE, que aún no hemos podido leer: su web no responde a nuestras consultas desde el 13 de noviembre. Los añadiremos aquí en cuanto los leamos, antes del sorteo; no copiamos importes de otros medios.`,
      },
      ca: {
        heading: `Premis del Nen ${NINO_YEAR}: el que ha publicat SELAE`,
        intro: `Cada bitllet de 200 € es divideix en deu dècims de 20 €. SELAE dona el primer premi per sèrie (per bitllet): ${M(FIRST_PER_BILLETE, "ca")}, és a dir, ${M(FIRST_PER_DECIMO, "ca")} per dècim.`,
        cols,
        caption: `Pàgina de la Loteria Nacional de SELAE, llegida el ${read}.`,
        after: `La resta de premis del ${NINO_YEAR} (quantes extraccions n'hi ha de cada tipus i quant paga cadascuna) és als ${pdf} de SELAE, que encara no hem pogut llegir: el seu web no respon a les nostres consultes des del 13 de novembre. Els afegirem aquí tan bon punt els llegim, abans del sorteig; no copiem imports d'altres mitjans.`,
      },
      en: {
        heading: `El Niño ${NINO_YEAR} prizes: what SELAE has published`,
        intro: `Each €200 billete is split into ten €20 décimos. SELAE gives the first prize per series (per billete): ${M(FIRST_PER_BILLETE, "en")}, that is ${M(FIRST_PER_DECIMO, "en")} per décimo.`,
        cols,
        caption: `SELAE's Lotería Nacional page, read ${read}.`,
        after: `The other ${NINO_YEAR} prizes (how many extractions of each kind and what each pays) are in SELAE's ${pdf}, which we have not been able to read yet: its website has not answered our requests since 13 November. We will add them here as soon as we read them, before the draw; we do not copy amounts from other outlets.`,
      },
    });
  }
  const src = link(programme.source.url, L(locale, { es: "programa de premios de SELAE", ca: "programa de premis de SELAE", en: "SELAE's prize programme" }));
  const p = dateYear(programme.confirmed.read, locale);
  return L(locale, {
    es: { heading: `Cuánto paga cada premio del Niño ${NINO_YEAR}`, intro: `Cada número tiene ${count(programme.series, "es")} billetes, uno por serie, y cada billete de 200 € se divide en diez décimos de 20 €. El ${src} da los importes por billete; un décimo cobra la décima parte.`, cols, caption: `${programme.source.ref}, leído el ${p}. Cada serie reparte ${count(programme.prizesPerSeries, "es")} premios y ${M(programme.eurosPerSeries, "es")}.`, after: "Si un décimo gana varios premios a la vez, se suman y Hacienda cuenta la suma." },
    ca: { heading: `Quant paga cada premi del Nen ${NINO_YEAR}`, intro: `Cada número té ${count(programme.series, "ca")} bitllets, un per sèrie, i cada bitllet de 200 € es divideix en deu dècims de 20 €. El ${src} dona els imports per bitllet; un dècim en cobra la desena part.`, cols, caption: `${programme.source.ref}, llegit el ${p}. Cada sèrie reparteix ${count(programme.prizesPerSeries, "ca")} premis i ${M(programme.eurosPerSeries, "ca")}.`, after: "Si un dècim guanya diversos premis alhora, se sumen i Hisenda compta la suma." },
    en: { heading: `What each El Niño ${NINO_YEAR} prize pays`, intro: `Each number has ${count(programme.series, "en")} billetes, one per series, and each €200 billete is split into ten €20 décimos. ${src} gives the amounts per billete; a décimo wins a tenth.`, cols, caption: `${programme.source.ref}, read ${p}. Each series pays ${count(programme.prizesPerSeries, "en")} prizes and ${M(programme.eurosPerSeries, "en")}.`, after: "When one décimo wins several prizes, they add up and the tax is worked out on the sum." },
  });
}

/** What wins each kind of prize, in words: from the 2027 programme once read, otherwise the BOE's 2011 one (no amounts). */
function ruleLine(c: NinoCategory, locale: Locale, withAmount: string | null): string {
  const label = categoryLabel(c, locale);
  const amt = withAmount ? L(locale, { es: ` (${withAmount} por décimo)`, ca: ` (${withAmount} per dècim)`, en: ` (${withAmount} per décimo)` }) : "";
  switch (c.kind) {
    case "top":
      return "";
    case "extraction":
      if (c.digits === 5) return L(locale, { es: `**${label}${amt}:** ${c.extractions} números más de cinco cifras.`, ca: `**${label}${amt}:** ${c.extractions} números més de cinc xifres.`, en: `**${label}${amt}:** ${c.extractions} more five-digit numbers.` });
      return L(locale, {
        es: `**${label}${amt}:** ${c.extractions} extracciones; cobran todos los billetes que acaban en las mismas ${c.digits === 1 ? "cifra" : `${c.digits} cifras`}, en el mismo orden.`,
        ca: `**${label}${amt}:** ${c.extractions} extraccions; cobren tots els bitllets que acaben en ${c.digits === 1 ? "la mateixa xifra" : `les mateixes ${c.digits} xifres`}, en el mateix ordre.`,
        en: `**${label}${amt}:** ${c.extractions} extractions; every billete ending in the same ${c.digits === 1 ? "digit" : `${c.digits} digits`}, in the same order, wins.`,
      });
    case "approx":
      return L(locale, { es: `**${label}${amt}:** el número anterior y el posterior.`, ca: `**${label}${amt}:** el número anterior i el posterior.`, en: `**${label}${amt}:** the numbers just before and after.` });
    case "hundred":
      return L(locale, { es: `**${label}${amt}:** los otros 99 números de su centena.`, ca: `**${label}${amt}:** els altres 99 números de la seva centena.`, en: `**${label}${amt}:** the other 99 numbers of its hundred.` });
    case "ending":
      return L(locale, {
        es: `**${label}${amt}:** los ${count(c.count, "es")} números que acaban igual, salvo el propio premio.`,
        ca: `**${label}${amt}:** els ${count(c.count, "ca")} números que acaben igual, llevat del mateix premi.`,
        en: `**${label}${amt}:** the ${count(c.count, "en")} numbers with the same ending, except the prize itself.`,
      });
  }
}

export function ninoRulesText(locale: Locale, programme: NinoProgramme | null = PROGRAMME_2027): { heading: string; intro: string; items: string[]; pending: string | null; quoteLabel: string } {
  const p = programme ?? BOE_2011;
  const lines = p.categories.map((c) => ruleLine(c, locale, programme ? M(perDecimo(c, programme), locale) : null)).filter(Boolean);
  const [before, after] = neighbours("00025");
  const common = L(locale, {
    es: [
      `**Anterior y posterior, con vuelta:** si el premio fuera el 00025, las aproximaciones serían el ${before} y el ${after}; el anterior del 00000 es el 99999, y el posterior del 99999, el 00000.`,
      "**Se suman:** un décimo cobra todos los premios que le tocan; cada centena, terminación o reintegro excluye solo el número del que sale.",
    ],
    ca: [
      `**Anterior i posterior, amb volta:** si el premi fos el 00025, les aproximacions serien el ${before} i el ${after}; l'anterior del 00000 és el 99999, i el posterior del 99999, el 00000.`,
      "**Se sumen:** un dècim cobra tots els premis que li toquen; cada centena, terminació o reintegrament exclou només el número del qual surt.",
    ],
    en: [
      `**Before and after, wrapping round:** if the prize were 00025, the aproximaciones would be ${before} and ${after}; the number before 00000 is 99999, and the one after 99999 is 00000.`,
      "**They add up:** a décimo wins every prize it matches; each centena, ending or reintegro leaves out only the number it comes from.",
    ],
  });
  const intro = programme
    ? L(locale, {
        es: `Como en el último programa publicado en el BOE, el sorteo es por el sistema moderno: cinco bombos, uno por cifra, con diez bolas del 0 al 9. Lo que dice el programa de ${NINO_YEAR}:`,
        ca: `Com en l'últim programa publicat al BOE, el sorteig és pel sistema modern: cinc bombos, un per xifra, amb deu boles del 0 al 9. El que diu el programa del ${NINO_YEAR}:`,
        en: `As in the last programme published in the BOE, the draw uses the modern system: five drums, one per digit, with ten balls from 0 to 9. What the ${NINO_YEAR} programme says:`,
      })
    : L(locale, {
        es: `A diferencia del de Navidad, el Niño se sortea por el sistema moderno: cinco bombos, uno por cifra (decenas de millar, unidades de millar, centenas, decenas y unidades), con diez bolas del 0 al 9 cada uno, y cada extracción usa tantos bombos como cifras tiene. Así era el programa de 2011, el ${boe("es")}:`,
        ca: `A diferència del de Nadal, el Nen se sorteja pel sistema modern: cinc bombos, un per xifra (desenes de miler, unitats de miler, centenes, desenes i unitats), amb deu boles del 0 al 9 cadascun, i cada extracció fa servir tants bombos com xifres té. Així era el programa del 2011, l'${boe("ca")}:`,
        en: `Unlike the Christmas draw, El Niño uses the modern system: five drums, one per digit (ten thousands, thousands, hundreds, tens and units), with ten balls from 0 to 9 each, and each extraction uses as many drums as it has digits. This is how the 2011 programme, the ${boe("en")}, worked:`,
      });
  const pending = programme
    ? null
    : L(locale, {
        es: `**Pendiente de confirmar.** Son las reglas de 2011: el BOE no ha vuelto a publicar programas de la Lotería Nacional. El de ${NINO_YEAR} de SELAE dirá cuántas extracciones hay de cada tipo, de qué premios salen las aproximaciones, centenas y terminaciones, y cuánto paga cada una; esta página no da ningún importe de 2011 como si fuera de ${NINO_YEAR}.`,
        ca: `**Pendent de confirmar.** Són les regles del 2011: el BOE no ha tornat a publicar programes de la Loteria Nacional. El del ${NINO_YEAR} de SELAE dirà quantes extraccions n'hi ha de cada tipus, de quins premis surten les aproximacions, centenes i terminacions, i quant paga cadascuna; aquesta pàgina no dona cap import del 2011 com si fos del ${NINO_YEAR}.`,
        en: `**Pending confirmation.** These are the 2011 rules: the BOE has not published Lotería Nacional programmes since. SELAE's ${NINO_YEAR} programme will say how many extractions of each kind there are, which prizes the aproximaciones, centenas and endings come from, and what each pays; this page gives no 2011 amount as if it were ${NINO_YEAR}'s.`,
      });
  return {
    heading: L(locale, {
      es: "Extracciones, aproximaciones, centenas, terminaciones y reintegro: qué números cobran",
      ca: "Extraccions, aproximacions, centenes, terminacions i reintegrament: quins números cobren",
      en: "Extractions, aproximaciones, centenas, endings and reintegro: which numbers win",
    }),
    intro,
    items: [...lines, ...common],
    pending,
    quoteLabel: `BOE-A-2010-20031 (${L(locale, { es: "texto literal, programa del Niño de 2011", ca: "text literal, programa del Nen del 2011", en: "verbatim, 2011 El Niño programme" })})`,
  };
}

/* -------------------------------------------------------------------------- */
/* The draw, payment and official checks                                     */
/* -------------------------------------------------------------------------- */

export function ninoDrawText(locale: Locale): { heading: string; paras: string[] } {
  const xmas = link(checkPath(locale), L(locale, { es: "comprobador de la Lotería de Navidad", ca: "comprovador de la Loteria de Nadal", en: "Christmas Lottery checker" }));
  const grossa = link(grossaCheckPath(locale), L(locale, { es: "comprobador de La Grossa de Cap d'Any", ca: "comprovador de La Grossa de Cap d'Any", en: "La Grossa checker" }));
  return L(locale, {
    es: {
      heading: `Cuándo es el sorteo del Niño ${NINO_YEAR}`,
      paras: [
        `**El ${drawDay("es")}**, día de Reyes, según la ${lnacPage("es")} de SELAE. La hora la fija SELAE; aún no la hemos podido leer, porque su web no responde a nuestras consultas desde el 13 de noviembre.`,
        `Según el último programa publicado en el BOE (2011), al acabar el sorteo se exponen «la lista oficial de las extracciones realizadas y la lista acumulada ordenada por terminaciones». Antes llegan la Lotería de Navidad, el 22 de diciembre (${xmas}), y La Grossa de Cap d'Any de la Generalitat, el 31 de diciembre (${grossa}).`,
      ],
    },
    ca: {
      heading: `Quan és el sorteig del Nen ${NINO_YEAR}`,
      paras: [
        `**El ${drawDay("ca")}**, dia de Reis, segons la ${lnacPage("ca")} de SELAE. L'hora la fixa SELAE; encara no l'hem pogut llegir, perquè el seu web no respon a les nostres consultes des del 13 de novembre.`,
        `Segons l'últim programa publicat al BOE (2011), quan acaba el sorteig s'exposen «la lista oficial de las extracciones realizadas y la lista acumulada ordenada por terminaciones». Abans arriben la Loteria de Nadal, el 22 de desembre (${xmas}), i La Grossa de Cap d'Any de la Generalitat, el 31 de desembre (${grossa}).`,
      ],
    },
    en: {
      heading: `When the El Niño ${NINO_YEAR} draw is`,
      paras: [
        `**On ${drawDay("en")}**, Epiphany (Reyes), according to SELAE's ${lnacPage("en")}. SELAE sets the time; we have not been able to read it yet, because its website has not answered our requests since 13 November.`,
        `According to the last programme published in the BOE (2011), when the draw ends SELAE posts "la lista oficial de las extracciones realizadas y la lista acumulada ordenada por terminaciones" (the official list of extractions and the cumulative list by endings). Before it come the Christmas Lottery on 22 December (${xmas}) and the Catalan government's La Grossa de Cap d'Any on 31 December (${grossa}).`,
      ],
    },
  });
}

export function ninoPayText(locale: Locale): { heading: string; items: string[]; after: string } {
  const g = breakdown(FIRST_PER_DECIMO, DECIMO_PRICE, 1);
  const share = breakdown(FIRST_PER_DECIMO, DECIMO_PRICE, 5 / DECIMO_PRICE);
  const ex = M(EXEMPT_PER_TICKET, locale);
  const c = link(U.collect, "SELAE");
  return L(locale, {
    es: {
      heading: "Cómo se cobran los premios y cuánto se queda Hacienda",
      items: [
        `**Menos de 2.000 € por décimo:** en cualquiera de los casi 11.000 puntos de venta de SELAE (${c}).`,
        `**2.000 € o más:** solo en BBVA o CaixaBank, con el documento de identidad original, sin ser cliente y sin comisión (${c}).`,
        `**Comprado por internet:** SELAE avisa por correo, notificación y SMS, y lo que vale es el apartado «Apuestas» de tu cuenta (${link(U.notify, "SELAE")}).`,
      ],
      after: `**Hacienda:** cada décimo tiene ${ex} exentos y se retiene el 20 % del resto al cobrar (${link(U.irpf, "Ley 35/2006, disposición adicional 33.ª")}); no se declara en la Renta. Un décimo del primer premio del Niño (${M(g.gross, "es")}) deja ${M(g.net, "es")}, con ${M(g.withholding, "es")} de retención; una participación de 5 €, ${M(share.net, "es")}. Varios décimos y otros premios: ${tax("es", "calculadora de premios de lotería")}.`,
    },
    ca: {
      heading: "Com es cobren els premis i quant se n'endú Hisenda",
      items: [
        `**Menys de 2.000 € per dècim:** a qualsevol dels gairebé 11.000 punts de venda de SELAE (${c}).`,
        `**2.000 € o més:** només a BBVA o CaixaBank, amb el document d'identitat original, sense ser-ne client i sense comissió (${c}).`,
        `**Comprat per internet:** SELAE avisa per correu, notificació i SMS, i el que val és l'apartat «Apuestas» del teu compte (${link(U.notify, "SELAE")}).`,
      ],
      after: `**Hisenda:** cada dècim té ${ex} exempts i es reté el 20 % de la resta en cobrar-lo (${link(U.irpf, "Llei 35/2006, disposició addicional 33a")}); no es declara a la Renda. Un dècim del primer premi del Nen (${M(g.gross, "ca")}) en deixa ${M(g.net, "ca")}, amb ${M(g.withholding, "ca")} de retenció; una participació de 5 €, ${M(share.net, "ca")}. Diversos dècims i altres premis: ${tax("ca", "calculadora de premis de loteria")}.`,
    },
    en: {
      heading: "How prizes are paid and how much tax is taken",
      items: [
        `**Under €2,000 per décimo:** at any of SELAE's almost 11,000 lottery shops (${c}).`,
        `**€2,000 or more:** only at BBVA or CaixaBank, with your original ID, without being a customer and with no fee (${c}).`,
        `**Bought online:** SELAE notifies you by email, in-app notice and text message, and the "Apuestas" section of your account is what counts (${link(U.notify, "SELAE")}).`,
      ],
      after: `**Tax:** each décimo has ${ex} tax-free and 20% of the rest is withheld when you collect (${link(U.irpf, "Law 35/2006, additional provision 33")}); you do not declare it. An El Niño first-prize décimo (${M(g.gross, "en")}) leaves ${M(g.net, "en")}, with ${M(g.withholding, "en")} withheld; a €5 share, ${M(share.net, "en")}. Several décimos and other prizes: ${tax("en", "lottery prize tax calculator")}.`,
    },
  });
}

export function ninoOfficialText(locale: Locale): { heading: string; items: string[] } {
  return L(locale, {
    es: {
      heading: "Cómo comprobar el décimo en SELAE",
      items: [`En el ${link(U.lnac, "comprobador de la Lotería Nacional")} de SELAE («Comprueba tus números»), con el número de cinco cifras.`, "En la lista oficial de premios que SELAE publica tras el sorteo: es la única que vale para cobrar.", "En cualquier punto de venta de Loterías y Apuestas del Estado."],
    },
    ca: {
      heading: "Com comprovar el dècim a SELAE",
      items: [`Al ${link(U.lnac, "comprovador de la Loteria Nacional")} de SELAE («Comprueba tus números»), amb el número de cinc xifres.`, "A la llista oficial de premis que SELAE publica després del sorteig: és l'única que val per cobrar.", "A qualsevol punt de venda de Loteries i Apostes de l'Estat."],
    },
    en: {
      heading: "How to check your décimo with SELAE",
      items: [`On SELAE's ${link(U.lnac, "Lotería Nacional checker")} ("Comprueba tus números"), with the five-digit number.`, "On the official prize list SELAE publishes after the draw: the only list valid for payment.", "At any Loterías y Apuestas del Estado lottery shop."],
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Results, FAQ and links                                                     */
/* -------------------------------------------------------------------------- */

export function ninoResultsHeadings(locale: Locale, year: number) {
  return L(locale, {
    es: { results: `Números premiados de la Lotería del Niño ${year}`, drawn: "Extracciones", derived: "Premios que se deducen de los principales", notYet: "Aún no ha salido", colNumbers: "Números", colDecimo: "Por décimo", range: (from: string, to: string, except: string) => `Del ${from} al ${to}, salvo el ${except}`, ending: (digits: string, except: string) => `Acabados en ${digits}, salvo el ${except}`, endingAll: (digits: string) => `Acabados en ${digits}`, and: "y" },
    ca: { results: `Números premiats de la Loteria del Nen ${year}`, drawn: "Extraccions", derived: "Premis que es dedueixen dels principals", notYet: "Encara no ha sortit", colNumbers: "Números", colDecimo: "Per dècim", range: (from: string, to: string, except: string) => `Del ${from} al ${to}, llevat del ${except}`, ending: (digits: string, except: string) => `Acabats en ${digits}, llevat del ${except}`, endingAll: (digits: string) => `Acabats en ${digits}`, and: "i" },
    en: { results: `El Niño ${year} winning numbers`, drawn: "Extractions", derived: "Prizes that follow from the main ones", notYet: "Not drawn yet", colNumbers: "Numbers", colDecimo: "Per décimo", range: (from: string, to: string, except: string) => `${from} to ${to}, except ${except}`, ending: (digits: string, except: string) => `Ending in ${digits}, except ${except}`, endingAll: (digits: string) => `Ending in ${digits}`, and: "and" },
  });
}

export function ninoFaq(locale: Locale): { q: string; a: string }[] {
  const g = breakdown(FIRST_PER_DECIMO, DECIMO_PRICE, 1);
  const ex = M(EXEMPT_PER_TICKET, locale);
  return L(locale, {
    es: [
      { q: `¿Cuándo es el sorteo del Niño ${NINO_YEAR}?`, a: `El ${drawDay("es")}, según SELAE. Esta página se actualiza ese día con los números que publica SELAE.` },
      { q: `¿Cuánto toca en el primer premio del Niño ${NINO_YEAR}?`, a: `${M(FIRST_PER_BILLETE, "es")} por serie, es decir, ${M(FIRST_PER_DECIMO, "es")} por décimo de 20 €. Después de Hacienda quedan ${M(g.net, "es")} por décimo.` },
      { q: "¿Cuánto cuesta un décimo del Niño?", a: "20 €, según SELAE. Cada billete tiene diez décimos." },
      { q: "¿En qué se diferencia del sorteo de Navidad?", a: "El Niño se sortea por el sistema moderno, con un bombo por cifra, y reparte también premios por terminaciones que salen de extracciones de menos cifras (así era en el último programa publicado en el BOE, de 2011). El de Navidad usa dos bombos: uno de números y otro de premios." },
      { q: "¿Cuánto se queda Hacienda de un décimo premiado?", a: `El 20 % de lo que pasa de ${ex} por décimo. Del primer premio (${M(g.gross, "es")}) se retienen ${M(g.withholding, "es")}.` },
      { q: "¿Qué lista vale para cobrar?", a: "Solo la lista oficial de premios de SELAE. Ningún comprobador, tampoco este, la sustituye." },
    ],
    ca: [
      { q: `Quan és el sorteig del Nen ${NINO_YEAR}?`, a: `El ${drawDay("ca")}, segons SELAE. Aquesta pàgina s'actualitza aquell dia amb els números que publica SELAE.` },
      { q: `Quant toca al primer premi del Nen ${NINO_YEAR}?`, a: `${M(FIRST_PER_BILLETE, "ca")} per sèrie, és a dir, ${M(FIRST_PER_DECIMO, "ca")} per dècim de 20 €. Després d'Hisenda en queden ${M(g.net, "ca")} per dècim.` },
      { q: "Quant costa un dècim del Nen?", a: "20 €, segons SELAE. Cada bitllet té deu dècims." },
      { q: "En què es diferencia del sorteig de Nadal?", a: "El Nen se sorteja pel sistema modern, amb un bombo per xifra, i també reparteix premis per terminacions que surten d'extraccions de menys xifres (així era a l'últim programa publicat al BOE, del 2011). El de Nadal fa servir dos bombos: un de números i un de premis." },
      { q: "Quant se n'endú Hisenda d'un dècim premiat?", a: `El 20 % del que passa de ${ex} per dècim. Del primer premi (${M(g.gross, "ca")}) se'n retenen ${M(g.withholding, "ca")}.` },
      { q: "Quina llista val per cobrar?", a: "Només la llista oficial de premis de SELAE. Cap comprovador, tampoc aquest, no la substitueix." },
    ],
    en: [
      { q: `When is the El Niño ${NINO_YEAR} draw?`, a: `On ${drawDay("en")}, according to SELAE. This page is updated that day with the numbers SELAE publishes.` },
      { q: `How much is El Niño ${NINO_YEAR}'s first prize?`, a: `${M(FIRST_PER_BILLETE, "en")} per series, that is ${M(FIRST_PER_DECIMO, "en")} per €20 décimo. After tax, ${M(g.net, "en")} per décimo.` },
      { q: "How much is an El Niño décimo?", a: "€20, according to SELAE. Each billete has ten décimos." },
      { q: "How is it different from the Christmas draw?", a: "El Niño uses the modern system, one drum per digit, and also pays prizes for endings drawn in shorter extractions (as in the last programme published in the BOE, 2011's). The Christmas draw uses two drums: one of numbers and one of prizes." },
      { q: "How much tax is taken from a winning décimo?", a: `20% of whatever it wins above ${ex}. The first prize (${M(g.gross, "en")}) has ${M(g.withholding, "en")} withheld.` },
      { q: "Which list is valid for payment?", a: "Only SELAE's official prize list. No checker, this one included, replaces it." },
    ],
  });
}

export function ninoRelatedLinks(locale: Locale): { href: string; label: string }[] {
  return L(locale, {
    es: [
      { href: calcPath("lottery-tax", "es"), label: "Calculadora de premios de lotería: cuánto se queda Hacienda" },
      { href: checkPath("es"), label: "Comprobar la Lotería de Navidad (22 de diciembre)" },
      { href: grossaCheckPath("es"), label: "Comprobar La Grossa de Cap d'Any (31 de diciembre)" },
      { href: gordoHubPath("es"), label: "Dónde ha tocado el Gordo" },
      { href: b2href("loteriaNadal", "es"), label: "Guía de la Lotería de Navidad 2026" },
    ],
    ca: [
      { href: calcPath("lottery-tax", "ca"), label: "Calculadora de premis de loteria: quant se'n queda Hisenda" },
      { href: checkPath("ca"), label: "Comprovar la Loteria de Nadal (22 de desembre)" },
      { href: grossaCheckPath("ca"), label: "Comprovar La Grossa de Cap d'Any (31 de desembre)" },
      { href: gordoHubPath("ca"), label: "On ha tocat la loteria de Nadal" },
      { href: b2href("loteriaNadal", "ca"), label: "Guia de la Loteria de Nadal 2026" },
    ],
    en: [
      { href: calcPath("lottery-tax", "en"), label: "Spanish lottery prize tax calculator" },
      { href: checkPath("en"), label: "Check your Christmas Lottery ticket (22 December)" },
      { href: grossaCheckPath("en"), label: "Check your La Grossa de Cap d'Any ticket (31 December)" },
      { href: gordoHubPath("en"), label: "Where El Gordo was sold" },
      { href: b2href("loteriaNadal", "en"), label: "Spanish Christmas Lottery 2026 guide" },
    ],
  });
}

export function ninoDisclaimer(locale: Locale): string {
  return L(locale, {
    es: "Comprobación orientativa con los números que publica SELAE y su programa de premios. Para cobrar solo vale la lista oficial de premios de SELAE; lo que cuenta es lo que te pague y te retenga quien abona el premio.",
    ca: "Comprovació orientativa amb els números que publica SELAE i el seu programa de premis. Per cobrar només val la llista oficial de premis de SELAE; el que compta és el que et pagui i et retingui qui abona el premi.",
    en: "An indicative check against the numbers SELAE publishes and its prize programme. Only SELAE's official prize list is valid for payment; what counts is what the payer pays you and withholds.",
  });
}
