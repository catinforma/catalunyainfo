/**
 * Words of the bottled butane price page, in es (primary), ca and en. Pure:
 * every figure comes from data.ts through rules.ts; nothing here invents or
 * forecasts a price. Facts and quotes: research_notes/butano-precio-nov2026.md.
 */

import type { Locale } from "@/lib/i18n/config";

import { BOTTLE_KG, BUTANE_CHECKED, BUTANE_ONLY_FROM, CEILING, INE_LPG_CPI, OPERATORS, OPERATORS_BOE, PENDING_ADJUSTMENT, REVISIONS, URLS, type Revision } from "./data";
import { bottleBeforeTax, bottleWithTax, changePercent, dayBefore, hitFivePercent, nextBounds, scheduledRevisions, type BottleWithTax, type ButaneState } from "./rules";

const INTL: Record<Locale, string> = { es: "es-ES", ca: "ca-ES", en: "en-GB" };

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

const utc = (day: string) => new Date(`${day}T12:00:00Z`);

/** "13 de noviembre de 2026" / "13 de novembre de 2026" / "13 November 2026". */
export function longDay(day: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(utc(day));
}

/** "martes 17 de noviembre de 2026" / "dimarts 17 de novembre de 2026" / "Tuesday 17 November 2026". */
export function weekdayDay(day: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL[locale], { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(utc(day)).replace(",", "");
}

/** "noviembre 2026" / "novembre 2026" / "Nov 2026". */
function monthYear(day: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL[locale], { month: locale === "en" ? "short" : "long", year: "numeric", timeZone: "UTC" }).format(utc(day)).replace(/ del? /, " ");
}

const num = (n: number, decimals: number, locale: Locale) => {
  const t = n.toFixed(decimals);
  return locale === "en" ? t : t.replace(".", ",");
};

/** "18,90 €" / "€18.90". */
export function eur(n: number, locale: Locale): string {
  return locale === "en" ? `€${num(n, 2, locale)}` : `${num(n, 2, locale)} €`;
}

/** The BOE's figure as printed ("123,4447"), in the reader's decimal mark, with its unit. */
export function centsKg(boeText: string, locale: Locale): string {
  return locale === "en" ? `${boeText.replace(",", ".")} c€/kg` : `${boeText} c€/kg`;
}

/** A rounded c€/kg figure (bounds). */
function centsKgNum(n: number, locale: Locale): string {
  return `${num(n, 2, locale)} c€/kg`;
}

/** "+5,00 %" / "+5.00%". */
export function percent(n: number, locale: Locale): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const body = num(Math.abs(n), 2, locale);
  return locale === "en" ? `${sign}${body}%` : `${sign}${body} %`;
}

/** Catalan "el 13 de novembre de 2026" / "l'1 de desembre de 2026". */
export function caOn(day: string): string {
  const d = Number(day.slice(8, 10));
  return `${d === 1 || d === 11 ? "l'" : "el "}${longDay(day, "ca")}`;
}

const boeLink = (id: string) => `[${id}](${URLS.boeTxt(id)})`;

/* -------------------------------------------------------------------------- */
/* Fixed words                                                                */
/* -------------------------------------------------------------------------- */

export interface Words {
  kicker: string;
  crumb: string;
  h1: string;
  breakdownTitle: string;
  breakdownCols: [string, string];
  breakdownRows: { base: string; hydrocarbons: (rate: number) => string; vat: (pct: number) => string; total: string };
  rulesTitle: string;
  calendarTitle: string;
  historyTitle: string;
  historyCols: [string, string, string, string, string, string];
  productButane: string;
  productLpg: string;
  capTag: string;
  scopeTitle: string;
  buyTitle: string;
  areas: Record<(typeof OPERATORS)[number]["area"], string>;
  orderLink: string;
  bonoTitle: string;
  islandsTitle: string;
  related: string;
  sourcesTitle: string;
  sourcesNote: string;
  checked: (day: string) => string;
}

const WORDS: Record<Locale, Words> = {
  es: {
    kicker: "Energía en casa · Toda España",
    crumb: "Precio del butano",
    h1: "Precio de la bombona de butano hoy",
    breakdownTitle: "Qué pagas por la bombona de 12,5 kg",
    breakdownCols: ["Concepto", "Importe"],
    breakdownRows: {
      base: "Precio máximo antes de impuestos (12,5 kg × precio del BOE)",
      hydrocarbons: (rate) => `Impuesto sobre Hidrocarburos (${num(rate, 2, "es")} €/tonelada)`,
      vat: (pct) => `IVA (${pct} %)`,
      total: "Precio máximo con impuestos",
    },
    rulesTitle: "Cuándo y cuánto puede cambiar el precio",
    calendarTitle: "Próximas fechas de revisión",
    historyTitle: "Historial de precios del butano (BOE)",
    historyCols: ["En vigor desde", "Producto", "Antes de impuestos", "Cambio", "Bombona 12,5 kg sin impuestos", "Resolución"],
    productButane: "Butano",
    productLpg: "GLP envasado",
    capTag: "tope del 5 %",
    scopeTitle: "Qué bombonas tienen precio regulado",
    buyTitle: "Dónde comprar o pedir la bombona",
    areas: { "peninsula-baleares": "Península e Illes Balears", canarias: "Canarias", "ceuta-melilla": "Ceuta y Melilla" },
    orderLink: "pedidos",
    bonoTitle: "Bono social térmico: ayuda para la calefacción",
    islandsTitle: "Canarias, Ceuta y Melilla",
    related: "Energía en casa y otras herramientas",
    sourcesTitle: "Fuentes",
    sourcesNote: "Cifras copiadas de cada resolución del BOE; las normas, en su texto consolidado.",
    checked: (day) => `Datos del BOE comprobados el ${longDay(day, "es")}`,
  },
  ca: {
    kicker: "Energia a casa · Tot Espanya",
    crumb: "Preu del butà",
    h1: "Preu de la bombona de butà avui",
    breakdownTitle: "Què pagues per la bombona de 12,5 kg",
    breakdownCols: ["Concepte", "Import"],
    breakdownRows: {
      base: "Preu màxim abans d'impostos (12,5 kg × preu del BOE)",
      hydrocarbons: (rate) => `Impost sobre hidrocarburs (${num(rate, 2, "ca")} €/tona)`,
      vat: (pct) => `IVA (${pct} %)`,
      total: "Preu màxim amb impostos",
    },
    rulesTitle: "Quan i quant pot canviar el preu",
    calendarTitle: "Properes dates de revisió",
    historyTitle: "Historial de preus del butà (BOE)",
    historyCols: ["En vigor des de", "Producte", "Abans d'impostos", "Canvi", "Bombona 12,5 kg sense impostos", "Resolució"],
    productButane: "Butà",
    productLpg: "GLP envasat",
    capTag: "límit del 5 %",
    scopeTitle: "Quines bombones tenen preu regulat",
    buyTitle: "On comprar o demanar la bombona",
    areas: { "peninsula-baleares": "Península i Illes Balears", canarias: "Canàries", "ceuta-melilla": "Ceuta i Melilla" },
    orderLink: "comandes",
    bonoTitle: "Bo social tèrmic: ajuda per a la calefacció",
    islandsTitle: "Canàries, Ceuta i Melilla",
    related: "Energia a casa i altres eines",
    sourcesTitle: "Fonts",
    sourcesNote: "Xifres copiades de cada resolució del BOE; les normes, en el text consolidat.",
    checked: (day) => `Dades del BOE comprovades ${caOn(day)}`,
  },
  en: {
    kicker: "Energy at home · All of Spain",
    crumb: "Butane price",
    h1: "Butane bottle price in Spain today",
    breakdownTitle: "What you pay for a 12.5 kg bottle",
    breakdownCols: ["Item", "Amount"],
    breakdownRows: {
      base: "Maximum price before taxes (12.5 kg × the BOE price)",
      hydrocarbons: (rate) => `Hydrocarbons tax (€${num(rate, 2, "en")} per tonne)`,
      vat: (pct) => `VAT (${pct}%)`,
      total: "Maximum price with taxes",
    },
    rulesTitle: "When and how much the price can change",
    calendarTitle: "Next revision dates",
    historyTitle: "Butane price history (BOE)",
    historyCols: ["In force from", "Product", "Before taxes", "Change", "12.5 kg bottle before taxes", "Resolution"],
    productButane: "Butane",
    productLpg: "Bottled LPG",
    capTag: "5% cap",
    scopeTitle: "Which bottles have a regulated price",
    buyTitle: "Where to buy or order a bottle",
    areas: { "peninsula-baleares": "Mainland Spain and the Balearic Islands", canarias: "Canary Islands", "ceuta-melilla": "Ceuta and Melilla" },
    orderLink: "orders",
    bonoTitle: "Bono social térmico: help with heating",
    islandsTitle: "Canary Islands, Ceuta and Melilla",
    related: "Energy at home and other tools",
    sourcesTitle: "Sources",
    sourcesNote: "Figures copied from each BOE resolution; the rules from their consolidated text.",
    checked: (day) => `BOE figures checked on ${longDay(day, "en")}`,
  },
};

export function words(locale: Locale): Words {
  return WORDS[locale];
}

/* -------------------------------------------------------------------------- */
/* Title and snippet                                                          */
/* -------------------------------------------------------------------------- */

export function butaneTitle(locale: Locale, state: ButaneState, day: string): string {
  if (state.kind === "awaiting") {
    const d = new Intl.DateTimeFormat(INTL[locale], { day: "numeric", month: "long", timeZone: "UTC" }).format(utc(state.due));
    return { es: `Precio bombona butano: revisión del ${d}`, ca: `Preu bombona de butà: revisió del ${d}`, en: `Butane bottle price in Spain: ${d} revision` }[locale];
  }
  const taxed = bottleWithTax(state.current.centsPerKg, day);
  const figure = taxed ? eur(taxed.total, locale) : centsKg(state.current.centsPerKg, locale);
  const when = monthYear(day, locale);
  return { es: `Precio bombona butano hoy: ${figure} (${when})`, ca: `Preu bombona de butà avui: ${figure} (${when})`, en: `Butane bottle price in Spain today: ${figure} (${when})` }[locale];
}

export function butaneDescription(locale: Locale, state: ButaneState, day: string): string {
  const next = longDay(state.next, locale);
  if (state.kind === "awaiting") {
    const due = longDay(state.due, locale);
    return {
      es: `El precio regulado de la bombona de butano se revisa el ${due}. Último precio del BOE: ${centsKg(state.last.centsPerKg, "es")} antes de impuestos. Historial y reglas.`,
      ca: `El preu regulat de la bombona de butà es revisa el ${due}. Últim preu del BOE: ${centsKg(state.last.centsPerKg, "ca")} abans d'impostos. Historial i regles.`,
      en: `Spain's regulated butane bottle price is revised on ${due}. Last BOE price: ${centsKg(state.last.centsPerKg, "en")} before taxes. History and rules.`,
    }[locale];
  }
  const taxed = bottleWithTax(state.current.centsPerKg, day);
  const p = centsKg(state.current.centsPerKg, locale);
  if (taxed) {
    return {
      es: `La bombona de butano de 12,5 kg cuesta como máximo ${eur(taxed.total, "es")} con impuestos (${p} antes de impuestos, BOE). Próxima revisión: ${next}.`,
      ca: `La bombona de butà de 12,5 kg costa com a màxim ${eur(taxed.total, "ca")} amb impostos (${p} abans d'impostos, BOE). Propera revisió: ${next}.`,
      en: `A 12.5 kg butane bottle costs at most ${eur(taxed.total, "en")} with taxes in mainland Spain (${p} before taxes, BOE). Next revision: ${next}.`,
    }[locale];
  }
  return {
    es: `Precio máximo del butano: ${p} antes de impuestos (${eur(bottleBeforeTax(state.current.centsPerKg), "es")} la bombona de 12,5 kg), según el BOE. Próxima revisión: ${next}.`,
    ca: `Preu màxim del butà: ${p} abans d'impostos (${eur(bottleBeforeTax(state.current.centsPerKg), "ca")} la bombona de 12,5 kg), segons el BOE. Propera revisió: ${next}.`,
    en: `Spain's maximum butane price: ${p} before taxes (${eur(bottleBeforeTax(state.current.centsPerKg), "en")} per 12.5 kg bottle), per the BOE. Next revision: ${next}.`,
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* The answer                                                                 */
/* -------------------------------------------------------------------------- */

/** The first lines of the page: the price today, or why it is not shown. */
export function answerLines(locale: Locale, state: ButaneState, day: string): string[] {
  if (state.kind === "awaiting") {
    const due = weekdayDay(state.due, locale);
    const last = centsKg(state.last.centsPerKg, locale);
    const since = longDay(state.last.effective, locale);
    return [
      {
        es: `El precio regulado de la bombona de butano cambió el **${due}** y todavía no hemos incorporado la nueva resolución del BOE. Hasta esa fecha regía **${last}** antes de impuestos, en vigor desde el ${since} (${boeLink(state.last.boe)}).`,
        ca: `El preu regulat de la bombona de butà va canviar el **${due}** i encara no hem incorporat la nova resolució del BOE. Fins aquella data regia **${last}** abans d'impostos, en vigor des del ${since} (${boeLink(state.last.boe)}).`,
        en: `Spain's regulated butane bottle price changed on **${due}** and we have not entered the new BOE resolution yet. Until then the price was **${last}** before taxes, in force since ${since} (${boeLink(state.last.boe)}).`,
      }[locale],
      {
        es: `La cifra vigente está en el [BOE](https://www.boe.es/) (resoluciones de la Dirección General de Política Energética y Minas).`,
        ca: `La xifra vigent és al [BOE](https://www.boe.es/) (resolucions de la Direcció General de Política Energètica i Mines).`,
        en: `The figure in force is in the [BOE](https://www.boe.es/) (resolutions of the Directorate-General for Energy Policy and Mines).`,
      }[locale],
    ];
  }
  const c = state.current;
  const p = centsKg(c.centsPerKg, locale);
  const pre = eur(bottleBeforeTax(c.centsPerKg), locale);
  const since = longDay(c.effective, locale);
  const today = longDay(day, locale);
  const taxed = bottleWithTax(c.centsPerKg, day);
  const lines: string[] = [];
  if (taxed) {
    lines.push(
      {
        es: `**${eur(taxed.total, "es")}** es el precio máximo de la bombona de butano de 12,5 kg hoy, ${today}, en la Península y Baleares, con impuestos incluidos.`,
        ca: `**${eur(taxed.total, "ca")}** és el preu màxim de la bombona de butà de 12,5 kg avui, ${today}, a la Península i les Balears, amb impostos inclosos.`,
        en: `**${eur(taxed.total, "en")}** is the maximum price of a 12.5 kg butane bottle today, ${today}, in mainland Spain and the Balearic Islands, taxes included.`,
      }[locale],
    );
  }
  lines.push(
    {
      es: `Antes de impuestos, el BOE fija **${p}** (${pre} la bombona de 12,5 kg) desde el ${since}: ${boeLink(c.boe)}.`,
      ca: `Abans d'impostos, el BOE fixa **${p}** (${pre} la bombona de 12,5 kg) des del ${since}: ${boeLink(c.boe)}.`,
      en: `Before taxes, the BOE sets **${p}** (${pre} per 12.5 kg bottle) from ${since}: ${boeLink(c.boe)}.`,
    }[locale],
  );
  return lines;
}

/** The next revision, or the published price that takes over on it. */
export function nextLine(locale: Locale, state: ButaneState): string {
  if (state.kind === "current" && state.upcoming) {
    const u = state.upcoming;
    const taxed = bottleWithTax(u.centsPerKg, u.effective);
    const withTax = taxed
      ? { es: `; con impuestos, ${eur(taxed.total, "es")} la bombona de 12,5 kg en la Península y Baleares`, ca: `; amb impostos, ${eur(taxed.total, "ca")} la bombona de 12,5 kg a la Península i les Balears`, en: `; with taxes, ${eur(taxed.total, "en")} per 12.5 kg bottle in mainland Spain and the Balearics` }[locale]
      : "";
    return {
      es: `**Nuevo precio desde el ${weekdayDay(u.effective, "es")}: ${centsKg(u.centsPerKg, "es")}** antes de impuestos${withTax} (${boeLink(u.boe)}, publicado el ${longDay(u.published, "es")}).`,
      ca: `**Nou preu des del ${weekdayDay(u.effective, "ca")}: ${centsKg(u.centsPerKg, "ca")}** abans d'impostos${withTax} (${boeLink(u.boe)}, publicat el ${longDay(u.published, "ca")}).`,
      en: `**New price from ${weekdayDay(u.effective, "en")}: ${centsKg(u.centsPerKg, "en")}** before taxes${withTax} (${boeLink(u.boe)}, published on ${longDay(u.published, "en")}).`,
    }[locale];
  }
  const next = weekdayDay(state.next, locale);
  const monday = longDay(dayBefore(state.next), locale);
  return {
    es: `**Próxima revisión: ${next}.** Desde enero de 2024 el BOE ha publicado cada nueva resolución el lunes anterior (esta vez sería el ${monday}).`,
    ca: `**Propera revisió: ${next}.** Des del gener del 2024 el BOE ha publicat cada nova resolució el dilluns anterior (aquesta vegada seria el ${monday}).`,
    en: `**Next revision: ${next}.** Since January 2024 the BOE has published every new resolution on the Monday before (this time that would be ${monday}).`,
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                   */
/* -------------------------------------------------------------------------- */

export function breakdownRows(locale: Locale, taxed: BottleWithTax): [string, string][] {
  const w = words(locale).breakdownRows;
  return [
    [w.base, eur(taxed.base, locale)],
    [w.hydrocarbons(taxed.period.hydrocarbonsEurPerTonne), eur(taxed.hydrocarbons, locale)],
    [w.vat(taxed.period.vatPercent), eur(taxed.vat, locale)],
    [w.total, eur(taxed.total, locale)],
  ];
}

export function breakdownNotes(locale: Locale, taxed: BottleWithTax): string[] {
  const art = taxed.period.article;
  const month = new Intl.DateTimeFormat(INTL[locale], { month: "long", year: "numeric", timeZone: "UTC" }).format(utc(taxed.period.from));
  const ine =
    art === "14" || art === "15"
      ? {
          es: ` El tipo depende del IPC de los hidrocarburos licuados que publica el INE: subió un ${INE_LPG_CPI.september2026} % interanual en septiembre y un ${INE_LPG_CPI.october2026} % en octubre (por encima del 15 %, el tipo de diciembre es 0 €).`,
          ca: ` El tipus depèn de l'IPC dels hidrocarburs liquats que publica l'INE: va pujar un ${INE_LPG_CPI.september2026} % interanual al setembre i un ${INE_LPG_CPI.october2026} % a l'octubre (per sobre del 15 %, el tipus de desembre és 0 €).`,
          en: ` The rate depends on the INE's CPI for liquefied hydrocarbons: up ${INE_LPG_CPI.september2026.replace(",", ".")}% year on year in September and ${INE_LPG_CPI.october2026.replace(",", ".")}% in October (above 15%, December's rate is €0).`,
        }[locale]
      : "";
  return [
    {
      es: `Es la misma cuenta que hace el Gobierno: el [Real Decreto-ley 25/2026](${URLS.rdl25}) traduce su tope de ${centsKg(CEILING.centsPerKg, "es")} en ${CEILING.bottleEurPeninsula} € por bombona en la Península. El Impuesto sobre Hidrocarburos de ${month} lo fija su artículo ${art}; el IVA es el general del 21 % ([Ley 37/1992, art. 90](${URLS.vatLaw})).${ine} Las cifras están redondeadas al céntimo.`,
      ca: `És el mateix càlcul que fa el Govern: el [Reial decret llei 25/2026](${URLS.rdl25}) tradueix el seu límit de ${centsKg(CEILING.centsPerKg, "ca")} en ${CEILING.bottleEurPeninsula} € per bombona a la Península. L'impost sobre hidrocarburs de ${month} el fixa el seu article ${art}; l'IVA és el general del 21 % ([Llei 37/1992, art. 90](${URLS.vatLaw})).${ine} Les xifres són arrodonides al cèntim.`,
      en: `This is the Government's own arithmetic: [Royal Decree-law 25/2026](${URLS.rdl25}) turns its ceiling of ${centsKg(CEILING.centsPerKg, "en")} into €${CEILING.bottleEurPeninsula.replace(",", ".")} per bottle on the mainland. Article ${art} sets the hydrocarbons tax for ${month}; VAT is the standard 21% ([Ley 37/1992, art. 90](${URLS.vatLaw})).${ine} Figures are rounded to the cent.`,
    }[locale],
    {
      es: `Es un **precio máximo**: el distribuidor puede cobrar menos, no más. Incluye el reparto a domicilio.`,
      ca: `És un **preu màxim**: el distribuïdor pot cobrar menys, no més. Inclou el repartiment a domicili.`,
      en: `It is a **maximum price**: the distributor may charge less, not more. Home delivery is included.`,
    }[locale],
  ];
}

export function rulesParagraphs(locale: Locale, state: ButaneState): string[] {
  const ref = state.kind === "current" ? state.current : state.last;
  const until = longDay(CEILING.until, locale);
  const out = [
    {
      es: `El precio se revisa **cada dos meses** y el nuevo rige desde el **tercer martes de enero, marzo, mayo, julio, septiembre y noviembre**. Lo calcula la Dirección General de Política Energética y Minas con la cotización internacional del butano y del propano, el flete, el cambio euro-dólar y los costes de comercialización, y lo publica en el BOE ([Orden IET/389/2015, arts. 3 y 6](${URLS.order389})).`,
      ca: `El preu es revisa **cada dos mesos** i el nou regeix des del **tercer dimarts de gener, març, maig, juliol, setembre i novembre**. El calcula la Direcció General de Política Energètica i Mines amb la cotització internacional del butà i el propà, el nòlit, el canvi euro-dòlar i els costos de comercialització, i el publica al BOE ([Ordre IET/389/2015, arts. 3 i 6](${URLS.order389})).`,
      en: `The price is revised **every two months** and the new one applies from the **third Tuesday of January, March, May, July, September and November**. The Directorate-General for Energy Policy and Mines works it out from international butane and propane prices, freight, the euro-dollar rate and marketing costs, and publishes it in the BOE ([Orden IET/389/2015, arts. 3 and 6](${URLS.order389})).`,
    }[locale],
    {
      es: `Cada revisión puede mover el precio antes de impuestos **como mucho un 5 %**, arriba o abajo. Lo que no se aplica por ese tope se guarda como "desajuste" y se recupera en las revisiones siguientes. Además, hasta el **${until}** el precio antes de impuestos no puede superar **${centsKg(CEILING.centsPerKg, locale)}**, el de mayo de 2022 ([Real Decreto-ley 25/2026, art. 3](${URLS.rdl25})).`,
      ca: `Cada revisió pot moure el preu abans d'impostos **com a molt un 5 %**, amunt o avall. El que no s'aplica per aquest límit es guarda com a "desajust" i es recupera en les revisions següents. A més, fins al **${until}** el preu abans d'impostos no pot superar **${centsKg(CEILING.centsPerKg, locale)}**, el de maig del 2022 ([Reial decret llei 25/2026, art. 3](${URLS.rdl25})).`,
      en: `Each revision can move the pre-tax price **by 5% at most**, up or down. Whatever that cap holds back is kept as a "desajuste" (adjustment) and recovered in later revisions. On top of that, until **${until}** the pre-tax price cannot exceed **${centsKg(CEILING.centsPerKg, locale)}**, the May 2022 level ([Royal Decree-law 25/2026, art. 3](${URLS.rdl25})).`,
    }[locale],
  ];
  if (state.kind === "current" && !state.upcoming) {
    const b = nextBounds(state.current, state.next);
    const revisionDay = longDay(state.next, locale);
    out.push(
      {
        es: `Con esas reglas, la revisión del ${revisionDay} dejará el precio antes de impuestos entre **${centsKgNum(b.low, locale)} y ${centsKgNum(b.high, locale)}**. La cifra exacta solo la da el BOE.`,
        ca: `Amb aquestes regles, la revisió del ${revisionDay} deixarà el preu abans d'impostos entre **${centsKgNum(b.low, locale)} i ${centsKgNum(b.high, locale)}**. La xifra exacta només la dona el BOE.`,
        en: `Under those rules, the ${revisionDay} revision will leave the pre-tax price between **${centsKgNum(b.low, locale)} and ${centsKgNum(b.high, locale)}**. Only the BOE gives the exact figure.`,
      }[locale],
    );
  }
  if (ref.boe === PENDING_ADJUSTMENT.boe && !(state.kind === "current" && state.upcoming)) {
    out.push(
      {
        es: `La resolución de septiembre de 2026 dice que "el valor del desajuste para la próxima revisión bimestral de precios será de ${PENDING_ADJUSTMENT.centsPerKg} cts.€/Kg" (${boeLink(PENDING_ADJUSTMENT.boe)}).`,
        ca: `La resolució de setembre del 2026 diu que "el valor del desajuste para la próxima revisión bimestral de precios será de ${PENDING_ADJUSTMENT.centsPerKg} cts.€/Kg" (${boeLink(PENDING_ADJUSTMENT.boe)}).`,
        en: `The September 2026 resolution states that the adjustment carried to the next revision is ${PENDING_ADJUSTMENT.centsPerKg.replace(",", ".")} c€/kg ("el valor del desajuste para la próxima revisión bimestral de precios será de ${PENDING_ADJUSTMENT.centsPerKg} cts.€/Kg", ${boeLink(PENDING_ADJUSTMENT.boe)}).`,
      }[locale],
    );
  }
  return out;
}

/** The next six scheduled revision days, from `day`. */
export function calendarItems(locale: Locale, day: string): string[] {
  const y = Number(day.slice(0, 4));
  return scheduledRevisions(day, `${y + 1}-12-31`)
    .filter((d) => d > day || d === day)
    .slice(0, 6)
    .map((d) => {
      const tue = weekdayDay(d, locale);
      const mon = longDay(dayBefore(d), locale);
      return { es: `${tue} (BOE, habitualmente el lunes ${mon})`, ca: `${tue} (BOE, habitualment el dilluns ${mon})`, en: `${tue} (BOE usually on Monday ${mon})` }[locale];
    });
}

export function calendarNote(locale: Locale): string {
  return {
    es: `Las fechas salen de la regla del tercer martes. El día de publicación en el BOE no lo fija ninguna norma: es lo que ha pasado en todas las revisiones desde enero de 2024.`,
    ca: `Les dates surten de la regla del tercer dimarts. El dia de publicació al BOE no el fixa cap norma: és el que ha passat en totes les revisions des del gener del 2024.`,
    en: `The dates follow the third-Tuesday rule. No rule sets the BOE publication day: it is what has happened at every revision since January 2024.`,
  }[locale];
}

export interface HistoryRow {
  key: string;
  since: string;
  product: string;
  price: string;
  change: string;
  bottle: string;
  boe: Revision["boe"];
  boeUrl: string;
}

/** Newest first. */
export function historyRows(locale: Locale, day: string): HistoryRow[] {
  const w = words(locale);
  return REVISIONS.filter((r) => r.effective <= day || r.published <= day)
    .map((r) => {
      const ch = changePercent(r);
      const change = ch === null ? "—" : `${percent(ch, locale)}${hitFivePercent(r) ? ` (${w.capTag})` : ""}`;
      return {
        key: r.boe,
        since: longDay(r.effective, locale),
        product: r.effective >= BUTANE_ONLY_FROM ? w.productButane : w.productLpg,
        price: centsKg(r.centsPerKg, locale),
        change,
        bottle: eur(bottleBeforeTax(r.centsPerKg), locale),
        boe: r.boe,
        boeUrl: URLS.boeTxt(r.boe),
      };
    })
    .reverse();
}

export function historyNote(locale: Locale): string {
  return {
    es: `Hasta marzo de 2025 el precio regulado cubría el GLP envasado (butano y propano); desde la [Orden TED/211/2025](${URLS.ted211}) solo el butano. Los impuestos cambiaron varias veces en 2026, así que el historial va sin ellos.`,
    ca: `Fins al març del 2025 el preu regulat cobria el GLP envasat (butà i propà); des de l'[Ordre TED/211/2025](${URLS.ted211}) només el butà. Els impostos van canviar diverses vegades el 2026, així que l'historial va sense.`,
    en: `Until March 2025 the regulated price covered bottled LPG (butane and propane); since [Orden TED/211/2025](${URLS.ted211}) only butane. Taxes changed several times in 2026, so the history is shown before taxes.`,
  }[locale];
}

export function scopeParagraphs(locale: Locale): string[] {
  return [
    {
      es: `El precio máximo se aplica al **butano comercial** en envases de **8 kg o más y menos de 20 kg** con una tara de 9 kg o más, como la bombona de 12,5 kg. Quedan fuera el **propano**, las bombonas ligeras (tara inferior a 9 kg) y las de uso como carburante ([Orden IET/389/2015, arts. 1 y 2](${URLS.order389})). Para otro peso dentro del rango, multiplica los kilos por el precio por kilo.`,
      ca: `El preu màxim s'aplica al **butà comercial** en envasos de **8 kg o més i menys de 20 kg** amb una tara de 9 kg o més, com la bombona de 12,5 kg. En queden fora el **propà**, les bombones lleugeres (tara inferior a 9 kg) i les d'ús com a carburant ([Ordre IET/389/2015, arts. 1 i 2](${URLS.order389})). Per a un altre pes dins del rang, multiplica els quilos pel preu per quilo.`,
      en: `The maximum price covers **commercial butane** in bottles of **8 kg or more and under 20 kg** with a tare of 9 kg or more, such as the usual 12.5 kg bottle. It does not cover **propane**, light bottles (tare under 9 kg) or autogas ([Orden IET/389/2015, arts. 1 and 2](${URLS.order389})). For another weight in that range, multiply the kilos by the price per kilo.`,
    }[locale],
  ];
}

export function buyParagraphs(locale: Locale): string[] {
  return [
    {
      es: `La resolución de la Dirección General de Política Energética y Minas de 3 de junio de 2026 (${boeLink(OPERATORS_BOE)}) obliga a estos operadores a **llevar la bombona a domicilio** al precio regulado:`,
      ca: `La resolució de la Direcció General de Política Energètica i Mines de 3 de juny de 2026 (${boeLink(OPERATORS_BOE)}) obliga aquests operadors a **portar la bombona a domicili** al preu regulat:`,
      en: `The Directorate-General for Energy Policy and Mines' resolution of 3 June 2026 (${boeLink(OPERATORS_BOE)}) requires these operators to **deliver bottles to the home** at the regulated price:`,
    }[locale],
  ];
}

export function operatorItems(locale: Locale): string[] {
  const w = words(locale);
  return OPERATORS.map((o) => `**${w.areas[o.area]}**: ${o.name}${o.orderUrl ? ` ([${w.orderLink}](${o.orderUrl}))` : ""}`);
}

export function buyNotes(locale: Locale): string[] {
  return [
    {
      es: `Enlazamos la web de cada operador sin comisión ni acuerdo comercial. Otros vendedores pueden ofrecer la bombona por debajo del precio máximo, nunca por encima.`,
      ca: `Enllacem el web de cada operador sense comissió ni acord comercial. Altres venedors poden oferir la bombona per sota del preu màxim, mai per sobre.`,
      en: `We link each operator's own site with no commission or commercial agreement. Other sellers may charge less than the maximum price, never more.`,
    }[locale],
  ];
}

export function bonoParagraphs(locale: Locale): string[] {
  return [
    {
      es: `El **bono social térmico** es una ayuda para pagar la energía de la **calefacción, el agua caliente o la cocina**, también si usas butano. La reciben quienes tenían el **bono social eléctrico a 31 de diciembre del año anterior**; la cuantía depende del grado de vulnerabilidad y de la zona climática, y la pagan las comunidades autónomas ([Real Decreto-ley 15/2018, arts. 5 a 10](${URLS.rdl15_2018})).`,
      ca: `El **bo social tèrmic** és una ajuda per pagar l'energia de la **calefacció, l'aigua calenta o la cuina**, també si fas servir butà. La reben els qui tenien el **bo social elèctric a 31 de desembre de l'any anterior**; l'import depèn del grau de vulnerabilitat i de la zona climàtica, i la paguen les comunitats autònomes ([Reial decret llei 15/2018, arts. 5 a 10](${URLS.rdl15_2018})).`,
      en: `The **bono social térmico** helps pay for energy used for **heating, hot water or cooking**, butane included. It goes to households that had the **electricity bono social on 31 December of the previous year**; the amount depends on the degree of vulnerability and the climate zone, and the regions pay it ([Royal Decree-law 15/2018, arts. 5 to 10](${URLS.rdl15_2018})).`,
    }[locale],
    {
      es: `Requisitos y solicitud del bono social eléctrico: [bonosocial.gob.es](${URLS.bonoSocial}) (Ministerio para la Transición Ecológica).`,
      ca: `Requisits i sol·licitud del bo social elèctric: [bonosocial.gob.es](${URLS.bonoSocial}) (Ministeri per a la Transició Ecològica).`,
      en: `Requirements and how to apply for the electricity bono social: [bonosocial.gob.es](${URLS.bonoSocial}) (Ministry for the Ecological Transition).`,
    }[locale],
  ];
}

export function islandsParagraphs(locale: Locale): string[] {
  return [
    {
      es: `El precio antes de impuestos del BOE vale para toda España, pero las autoridades de Canarias, Ceuta y Melilla pueden variar los costes de comercialización y allí no se aplica el IVA (rigen el IGIC o el IPSI). Por eso no damos un precio con impuestos para esos territorios: pregunta al operador de tu zona.`,
      ca: `El preu abans d'impostos del BOE val per a tot Espanya, però les autoritats de Canàries, Ceuta i Melilla poden variar els costos de comercialització i allà no s'aplica l'IVA (regeixen l'IGIC o l'IPSI). Per això no donem un preu amb impostos per a aquests territoris: pregunta a l'operador de la teva zona.`,
      en: `The BOE's pre-tax price applies across Spain, but the Canary Islands, Ceuta and Melilla may vary the marketing costs and VAT does not apply there (IGIC or IPSI do). So we give no with-tax price for them: ask your local operator.`,
    }[locale],
  ];
}

export interface SourceItem {
  name: string;
  publisher: string;
  url: string;
  note: string;
}

export function sources(locale: Locale, current: Revision): SourceItem[] {
  const t = {
    es: ["precio vigente antes de impuestos", "regla bimestral, tercer martes, tope del 5 %", "solo butano desde 2025", "tope hasta el 30 de junio de 2027; impuesto sobre hidrocarburos oct–dic 2026", "IPC de hidrocarburos licuados (serie IPC291846)", "IVA general (art. 90)", "operadores con reparto a domicilio", "bono social térmico", "bono social"],
    ca: ["preu vigent abans d'impostos", "regla bimestral, tercer dimarts, límit del 5 %", "només butà des del 2025", "límit fins al 30 de juny de 2027; impost sobre hidrocarburs oct–des 2026", "IPC d'hidrocarburs liquats (sèrie IPC291846)", "IVA general (art. 90)", "operadors amb repartiment a domicili", "bo social tèrmic", "bo social"],
    en: ["price in force before taxes", "two-monthly rule, third Tuesday, 5% cap", "butane only since 2025", "ceiling to 30 June 2027; hydrocarbons tax Oct–Dec 2026", "CPI for liquefied hydrocarbons (series IPC291846)", "standard VAT (art. 90)", "operators with home delivery", "bono social térmico", "bono social"],
  }[locale];
  const checked = longDay(BUTANE_CHECKED, locale);
  const read = { es: `leído el ${checked}`, ca: `llegit ${caOn(BUTANE_CHECKED)}`, en: `read on ${checked}` }[locale];
  return [
    { name: `Resolución DGPEM (${current.boe})`, publisher: "BOE", url: URLS.boeTxt(current.boe), note: `${t[0]}; ${read}` },
    { name: "Orden IET/389/2015 (texto consolidado)", publisher: "BOE", url: URLS.order389, note: t[1]! },
    { name: "Orden TED/211/2025", publisher: "BOE", url: URLS.ted211, note: t[2]! },
    { name: "Real Decreto-ley 25/2026", publisher: "BOE", url: URLS.rdl25, note: t[3]! },
    { name: "IPC, índices de subclases (tabla 76128)", publisher: "INE", url: URLS.ineCpiTable, note: `${t[4]}; ${read}` },
    { name: "Ley 37/1992 del IVA", publisher: "BOE", url: URLS.vatLaw, note: t[5]! },
    { name: `Resolución DGPEM de 3 de junio de 2026 (${OPERATORS_BOE})`, publisher: "BOE", url: URLS.boeTxt(OPERATORS_BOE), note: t[6]! },
    { name: "Real Decreto-ley 15/2018", publisher: "BOE", url: URLS.rdl15_2018, note: t[7]! },
    { name: "Bono social", publisher: "Ministerio para la Transición Ecológica y el Reto Demográfico", url: URLS.bonoSocial, note: t[8]! },
  ];
}

/** The bottle weight, for a test. */
export const PRICED_KG = BOTTLE_KG;
