/**
 * Words of "Avui a Catalunya" that the server renders: metadata, headings,
 * the dated fallbacks crawlers and no-JS readers see, the links and the
 * sources. Nothing here says what today is; that is the browser's
 * (`labels.ts`). The only dates printed come from the data (`data.ts`).
 */

import { STRIKES, strikeDays, upcomingStrikes } from "@/lib/content/batch02/strikes";
import { HOLIDAY_SOURCE } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";
import { MUNICIPALITIES as FUEL } from "@/lib/programmatic/fuel/data";
import { caDayArticle, dayMonth, dayMonthYear, weekdayName } from "@/lib/programmatic/holidays/format";
import { formatDate, formatNumber } from "@/lib/programmatic/reservoirs/live";
import { officialUrl as rodaliesOfficial } from "@/lib/programmatic/rodalies/official";

import { DATA_FROM, HOLIDAY_SNAPSHOT, RESERVOIR_SNAPSHOT, STRIKES_AS_OF, regionalList, reservoirFallback, snowSeason } from "./data";
import { joinList } from "./logic";
import { TODAY_NAME } from "./paths";

export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

export type ItemKey = "holidays" | "strikes" | "rodalies" | "reservoirs" | "fuel" | "weekend" | "snow";
export const ITEM_ORDER: readonly ItemKey[] = ["holidays", "strikes", "rodalies", "reservoirs", "fuel", "weekend", "snow"];

interface PageCopy {
  title: string;
  description: string;
  h1: string;
  crumb: string;
  kicker: string;
  lead: string;
  /** Shown until the browser has computed today's date. */
  dateFallback: string;
  headings: Record<ItemKey, string>;
  aboutTitle: string;
  sourcesTitle: string;
  sourcesNote: string;
}

const COPY: Record<Locale, PageCopy> = {
  ca: {
    title: "Avui a Catalunya: festius, vagues, Rodalies i preus",
    description:
      "Què passa avui a Catalunya: si és festiu i on hi ha festa local, vagues, avisos de Rodalies, embassaments i preu del carburant, amb la font oficial.",
    h1: TODAY_NAME.ca,
    crumb: TODAY_NAME.ca,
    kicker: "Cada dia",
    lead: "El que cal saber avui abans de sortir: si és festiu, si hi ha vaga, com van els trens de Rodalies, com estan els embassaments, quant costa omplir el dipòsit i què porta el cap de setmana. Cada resposta enllaça la pàgina completa i la font oficial.",
    dateFallback: "La data d'avui i les respostes es calculen al teu navegador, amb l'hora de Catalunya.",
    headings: {
      holidays: "És festiu avui?",
      strikes: "Hi ha vaga avui?",
      rodalies: "Rodalies: hi ha avisos?",
      reservoirs: "Com estan els embassaments?",
      fuel: "Quant costa la benzina avui?",
      weekend: "Aquest cap de setmana",
      snow: "Hi ha neu al Pirineu?",
    },
    aboutTitle: "Com funciona aquesta pàgina",
    sourcesTitle: "Fonts",
    sourcesNote: "Fonts oficials de les dades d'aquesta pàgina.",
  },
  es: {
    title: "Hoy en Cataluña: festivos, huelgas, Rodalies y precios",
    description:
      "Qué pasa hoy en Cataluña: si es festivo y dónde hay fiesta local, huelgas, avisos de Rodalies, embalses y precio del carburante, con la fuente oficial.",
    h1: TODAY_NAME.es,
    crumb: TODAY_NAME.es,
    kicker: "Cada día",
    lead: "Lo que hay que saber hoy antes de salir: si es festivo, si hay huelga, cómo van los trenes de Rodalies, cómo están los embalses, cuánto cuesta llenar el depósito y qué trae el fin de semana. Cada respuesta enlaza la página completa y la fuente oficial.",
    dateFallback: "La fecha de hoy y las respuestas se calculan en tu navegador, con la hora de Cataluña.",
    headings: {
      holidays: "¿Es festivo hoy?",
      strikes: "¿Hay huelga hoy?",
      rodalies: "Rodalies: ¿hay avisos?",
      reservoirs: "¿Cómo están los embalses?",
      fuel: "¿Cuánto cuesta la gasolina hoy?",
      weekend: "Este fin de semana",
      snow: "¿Hay nieve en el Pirineo?",
    },
    aboutTitle: "Cómo funciona esta página",
    sourcesTitle: "Fuentes",
    sourcesNote: "Fuentes oficiales de los datos de esta página.",
  },
  en: {
    title: "Today in Catalonia: holidays, strikes, trains, prices",
    description:
      "What's on today in Catalonia: public and local holidays, strikes, Rodalies train notices, reservoir levels and fuel prices, each from the official source.",
    h1: TODAY_NAME.en,
    crumb: TODAY_NAME.en,
    kicker: "Every day",
    lead: "What to know before you head out today: whether it is a public holiday, whether there is a strike, how Rodalies trains are running, how full the reservoirs are, what fuel costs and what the weekend brings. Each answer links the full page and the official source.",
    dateFallback: "Today's date and the answers are worked out in your browser, on Catalan time.",
    headings: {
      holidays: "Is today a public holiday?",
      strikes: "Is there a strike today?",
      rodalies: "Rodalies trains: any notices?",
      reservoirs: "How full are the reservoirs?",
      fuel: "Fuel prices today",
      weekend: "This weekend",
      snow: "Is there snow in the Pyrenees?",
    },
    aboutTitle: "How this page works",
    sourcesTitle: "Sources",
    sourcesNote: "Official sources of the data on this page.",
  },
};

export function pageCopy(locale: Locale): PageCopy {
  return COPY[locale];
}

/* -------------------------------------------------------------------------- */
/* Dated fallbacks (server HTML)                                              */
/* -------------------------------------------------------------------------- */

const dmy = (iso: string, locale: Locale) => dayMonthYear(iso, locale);

/** "el 30 d'octubre de 2026", "l'1 de novembre de 2026", "el 1 de noviembre de 2026", "on 1 November 2026". */
export function onDate(iso: string, locale: Locale): string {
  if (locale === "ca") return `${caDayArticle(iso)}${dmy(iso, locale)}`;
  return `${locale === "es" ? "el" : "on"} ${dmy(iso, locale)}`;
}

/** "del 29 d'octubre de 2026", "de l'1 de novembre de 2026", "del 29 de octubre…", "from 29 October 2026". */
export function fromDate(iso: string, locale: Locale): string {
  if (locale === "ca") return caDayArticle(iso) === "l'" ? `de l'${dmy(iso, locale)}` : `del ${dmy(iso, locale)}`;
  return `${locale === "es" ? "del" : "from"} ${dmy(iso, locale)}`;
}

/**
 * The next Catalonia-wide holidays from the data's own date: a calendar, not
 * an answer about today. Crawlers, assistants and no-JS readers get it; the
 * browser replaces it with today's answer.
 */
export function holidayFallback(locale: Locale, count = 4): string {
  const days = regionalList(locale)
    .filter((d) => !d.ao)
    .slice(0, count)
    .map((d) => `${weekdayName(d.d, locale)} ${dmy(d.d, locale)} (${d.n})`);
  const from = fromDate(DATA_FROM, locale);
  const list = joinList(days, locale);
  if (locale === "ca") return `Propers festius a tot Catalunya segons el calendari oficial, a partir ${from}: ${list}.`;
  if (locale === "es") return `Próximos festivos en toda Cataluña según el calendario oficial, a partir ${from}: ${list}.`;
  return `Next Catalonia-wide public holidays in the official calendar, ${from}: ${list}.`;
}

/** The strikes still to come on the list's own date, with their days. */
export function strikesFallback(locale: Locale): string {
  const asOf = onDate(STRIKES_AS_OF, locale);
  const upcoming = upcomingStrikes(STRIKES_AS_OF, STRIKES);
  // "vaga general de 24 hores, dimecres 11 de novembre de 2026; …": titles can carry their own brackets.
  const list = upcoming.map((s) => `${s.title[locale]}, ${strikeDays(s, locale)}`).join("; ");
  if (upcoming.length === 0) {
    if (locale === "ca") return `Cap vaga convocada a la nostra llista, revisada ${asOf}.`;
    if (locale === "es") return `Ninguna huelga convocada en nuestra lista, revisada ${asOf}.`;
    return `No strike called on our list, checked ${asOf}.`;
  }
  if (locale === "ca") return `Vagues convocades segons la nostra llista, revisada ${asOf}: ${list}.`;
  if (locale === "es") return `Huelgas convocadas según nuestra lista, revisada ${asOf}: ${list}.`;
  return `Strikes called, on our list checked ${asOf}: ${list}.`;
}

export function rodaliesFallback(locale: Locale): string {
  if (locale === "ca") return "Els avisos oficials de Rodalies de Catalunya es carreguen aquí en directe quan s'obre la pàgina.";
  if (locale === "es") return "Los avisos oficiales de Rodalies de Catalunya se cargan aquí en directo al abrir la página.";
  return "Rodalies de Catalunya's official notices load here, live, when the page opens.";
}

/** The snapshot's total, with its date: never presented as today's. */
export function reservoirsFallback(locale: Locale): string {
  const total = reservoirFallback().total;
  if (!total) {
    if (locale === "ca") return "La lectura d'avui de l'ACA es carrega aquí en directe.";
    if (locale === "es") return "La lectura de hoy de la ACA se carga aquí en directo.";
    return "Today's ACA reading loads here, live.";
  }
  const pct = `${formatNumber(total.percent, locale)}${locale === "en" ? "%" : " %"}`;
  const date = formatDate(total.date, locale);
  if (locale === "ca") return `${pct} de capacitat segons la lectura de l'ACA (${date}). La d'avui es carrega en directe.`;
  if (locale === "es") return `${pct} de capacidad según la lectura de la ACA (${date}). La de hoy se carga en directo.`;
  return `${pct} full in the ACA reading of ${date}. Today's loads live.`;
}

export function fuelFallback(locale: Locale): string {
  if (locale === "ca") return "Els preus del Ministeri es carreguen aquí en directe: canvien diverses vegades al dia.";
  if (locale === "es") return "Los precios del Ministerio se cargan aquí en directo: cambian varias veces al día.";
  return "The Ministry's prices load here, live: they change several times a day.";
}

export function weekendFallback(locale: Locale): string {
  if (locale === "ca") return "Les dates d'aquest cap de setmana, el proper festiu i el proper pont es calculen al navegador amb el calendari oficial.";
  if (locale === "es") return "Las fechas de este fin de semana, el próximo festivo y el próximo puente se calculan en el navegador con el calendario oficial.";
  return "This weekend's dates, the next public holiday and the next long weekend are worked out in your browser from the official calendar.";
}

/** "25 d'octubre" … "15 de maig": the season as the homepage strip uses it. */
export function snowFallback(locale: Locale): string {
  const { from, to } = snowSeason();
  // Any year: only the day and month are printed.
  const start = dayMonth(`2026-${from}`, locale);
  const end = dayMonth(`2027-${to}`, locale);
  if (locale === "ca") return `El gruix de neu a terra a les estacions de muntanya del Meteocat, amb l'hora de cada lectura. Temporada: del ${start} al ${end}.`;
  if (locale === "es") return `El espesor de nieve en el suelo en las estaciones de montaña de Meteocat, con la hora de cada lectura. Temporada: del ${start} al ${end}.`;
  return `Snow depth on the ground at Meteocat's mountain stations, with the time of each reading. Season: ${start} to ${end}.`;
}

/** The header's verified line: which list was checked when, and what is live. */
export function verifiedLine(locale: Locale): string {
  const strikes = onDate(STRIKES_AS_OF, locale);
  const holidays = onDate(HOLIDAY_SNAPSHOT.readOn, locale);
  if (locale === "ca") return `Vagues revisades ${strikes}; festius, ${holidays}. Rodalies, embassaments i preus, en directe.`;
  if (locale === "es") return `Huelgas revisadas ${strikes}; festivos, ${holidays}. Rodalies, embalses y precios, en directo.`;
  return `Strikes checked ${strikes}; holidays ${holidays}. Rodalies, reservoirs and prices live.`;
}

/* -------------------------------------------------------------------------- */
/* Source lines, one per item                                                 */
/* -------------------------------------------------------------------------- */

export function sourceLine(item: ItemKey, locale: Locale): string {
  const holidaysRead = onDate(HOLIDAY_SNAPSHOT.readOn, locale);
  const strikesRead = onDate(STRIKES_AS_OF, locale);
  const year = HOLIDAY_SNAPSHOT.year;
  const lines: Record<Locale, Record<ItemKey, string>> = {
    ca: {
      holidays: `Font: calendari oficial de festes laborals de la Generalitat i calendari de festes locals ${year} (${HOLIDAY_SNAPSHOT.sources.localOrder.ref}), llegits ${holidaysRead}.`,
      strikes: `Font: convocatòries i avisos dels sindicats i dels operadors, revisats ${strikesRead}.`,
      rodalies: "Font: Rodalies de Catalunya, estat del servei (Renfe, dades obertes, si no respon).",
      reservoirs: "Font: Agència Catalana de l'Aigua, dades obertes diàries (els nou embassaments de les conques internes; els de l'Ebre no hi són).",
      fuel: "Font: Ministeri per a la Transició Ecològica, preus de les benzineres (CC BY 4.0).",
      weekend: "Font: calendari oficial de festes laborals de la Generalitat (festius de tot Catalunya).",
      snow: "Font: Servei Meteorològic de Catalunya (Meteocat), xarxa d'estacions automàtiques.",
    },
    es: {
      holidays: `Fuente: calendario oficial de fiestas laborales de la Generalitat y calendario de fiestas locales ${year} (${HOLIDAY_SNAPSHOT.sources.localOrder.ref}), leídos ${holidaysRead}.`,
      strikes: `Fuente: convocatorias y avisos de los sindicatos y de los operadores, revisados ${strikesRead}.`,
      rodalies: "Fuente: Rodalies de Catalunya, estado del servicio (Renfe, datos abiertos, si no responde).",
      reservoirs: "Fuente: Agència Catalana de l'Aigua, datos abiertos diarios (los nueve embalses de las cuencas internas; los del Ebro no están).",
      fuel: "Fuente: Ministerio para la Transición Ecológica, precios de las gasolineras (CC BY 4.0).",
      weekend: "Fuente: calendario oficial de fiestas laborales de la Generalitat (festivos de toda Cataluña).",
      snow: "Fuente: Servei Meteorològic de Catalunya (Meteocat), red de estaciones automáticas.",
    },
    en: {
      holidays: `Source: the Generalitat's official calendar of public holidays and the ${year} local holiday order (${HOLIDAY_SNAPSHOT.sources.localOrder.ref}), read ${holidaysRead}.`,
      strikes: `Source: the unions' calls and the operators' notices, checked ${strikesRead}.`,
      rodalies: "Source: Rodalies de Catalunya service status (Renfe open data when it does not answer).",
      reservoirs: "Source: Catalan Water Agency (ACA) daily open data (the nine reservoirs of Catalonia's internal basins; the Ebro basin's are not included).",
      fuel: "Source: Spain's Ministry for the Ecological Transition, station prices (CC BY 4.0).",
      weekend: "Source: the Generalitat's official calendar of public holidays (Catalonia-wide days).",
      snow: "Source: Catalan Meteorological Service (Meteocat), automatic weather stations.",
    },
  };
  return lines[locale][item];
}

/* -------------------------------------------------------------------------- */
/* About and sources                                                          */
/* -------------------------------------------------------------------------- */

export function aboutParagraphs(locale: Locale): string[] {
  const towns = HOLIDAY_SNAPSHOT.municipalities.length;
  const year = HOLIDAY_SNAPSHOT.year;
  const asOf = onDate(STRIKES_AS_OF, locale);
  if (locale === "ca") {
    return [
      "La data d'avui es calcula al teu navegador amb l'hora de Catalunya, de manera que les respostes canvien a mitjanit encara que la pàgina no s'hagi tornat a publicar.",
      `Els festius surten del calendari oficial de la Generalitat i de l'ordre de festes locals de ${year}, per als ${towns} municipis més poblats; la pàgina de cada municipi té el calendari sencer. Les vagues surten de la nostra llista de convocatòries, revisada ${asOf} a les webs dels convocants i dels operadors.`,
      "Els avisos de Rodalies, l'aigua dels embassaments i els preus del carburant es llegeixen a la font oficial quan obres la pàgina, amb una memòria cau de minuts. Quan una font no respon, la pàgina ho diu i l'enllaça: mai no mostra dades antigues com si fossin d'avui.",
    ];
  }
  if (locale === "es") {
    return [
      "La fecha de hoy se calcula en tu navegador con la hora de Cataluña, así que las respuestas cambian a medianoche aunque la página no se haya vuelto a publicar.",
      `Los festivos salen del calendario oficial de la Generalitat y de la orden de fiestas locales de ${year}, para los ${towns} municipios más poblados; la página de cada municipio tiene el calendario completo. Las huelgas salen de nuestra lista de convocatorias, revisada ${asOf} en las webs de los convocantes y de los operadores.`,
      "Los avisos de Rodalies, el agua de los embalses y los precios del carburante se leen en la fuente oficial al abrir la página, con una caché de minutos. Cuando una fuente no responde, la página lo dice y la enlaza: nunca muestra datos antiguos como si fueran de hoy.",
    ];
  }
  return [
    "Today's date is worked out in your browser on Catalan time, so the answers change at midnight even if the page has not been republished.",
    `Holidays come from the Generalitat's official calendar and the ${year} local holiday order, for the ${towns} most populous municipalities; each town's page in Catalan and Spanish has its whole calendar. Strikes come from our list of calls, checked ${asOf} on the organisers' and operators' websites.`,
    "Rodalies notices, reservoir water and fuel prices are read from the official source when you open the page, cached for minutes. When a source does not answer, the page says so and links it: it never shows old data as today's.",
  ];
}

export interface SourceItem {
  name: string;
  publisher: string;
  url: string;
  note: string;
}

export function sources(locale: Locale): SourceItem[] {
  const read = (iso: string) => `${locale === "ca" ? "llegit" : locale === "es" ? "leído" : "read"} ${onDate(iso, locale)}`;
  const live = locale === "ca" ? "en directe" : locale === "es" ? "en directo" : "live";
  const h = HOLIDAY_SNAPSHOT.sources;
  return [
    { name: HOLIDAY_SOURCE.name, publisher: HOLIDAY_SOURCE.publisher, url: HOLIDAY_SOURCE.url, note: read(HOLIDAY_SNAPSHOT.readOn) },
    { name: h.localOrder.name, publisher: h.localOrder.ref, url: h.localOrder.url, note: read(HOLIDAY_SNAPSHOT.readOn) },
    {
      name: locale === "ca" ? "Estat del servei (avisos en directe)" : locale === "es" ? "Estado del servicio (avisos en directo)" : "Service status (live notices)",
      publisher: "Rodalies de Catalunya",
      url: rodaliesOfficial.status(locale),
      note: live,
    },
    { name: RESERVOIR_SNAPSHOT.sources.daily.name, publisher: RESERVOIR_SNAPSHOT.sources.daily.publisher, url: RESERVOIR_SNAPSHOT.sources.daily.url, note: live },
    { name: FUEL.sources.prices.name, publisher: FUEL.sources.prices.publisher, url: FUEL.sources.prices.url, note: `${FUEL.sources.prices.licence}, ${live}` },
  ];
}
