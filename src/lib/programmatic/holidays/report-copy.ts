import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

import type { DateLocale } from "./format";
import { caDayArticle, capitalize, dayMonth, weekdayDayMonth } from "./format";
import { ROUTE } from "./paths";
import { cataloniaPopulation, whitMonday, type NextYearReport, type ThisYearReport } from "./report";

/**
 * Paths and words of the local-holiday data report. Every number in a
 * sentence comes from report.ts; nothing here states a figure of its own.
 *
 *   /ca/festius/dades-festius-locals/
 *   /es/festivos/datos-festivos-locales/
 *   /en/holidays/local-holidays-data/
 *
 * Static folders beside `[municipi]`: no town slug is any of them (a test holds it).
 */

export const REPORT_SLUG: Record<DateLocale, string> = { ca: "dades-festius-locals", es: "datos-festivos-locales", en: "local-holidays-data" };

export function reportPath(locale: DateLocale): string {
  return `/${locale}/${ROUTE[locale].root}/${REPORT_SLUG[locale]}/`;
}

export function reportEditions(): Record<DateLocale, string> {
  return { ca: reportPath("ca"), es: reportPath("es"), en: reportPath("en") };
}

/** When the page's words last changed (the figures carry their own date: report.ts `reportAsOf`). */
export const REPORT_PAGE_AS_OF = "2026-11-18";

export function reportSitemapEntries(lastModified: string): MetadataRoute.Sitemap {
  const e = reportEditions();
  const languages = { ca: absoluteUrl(e.ca), es: absoluteUrl(e.es), en: absoluteUrl(e.en), "x-default": absoluteUrl(e.en) };
  return (["ca", "es", "en"] as const).map((locale) => ({
    url: absoluteUrl(e[locale]),
    lastModified: new Date(`${lastModified}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.6,
    alternates: { languages },
  }));
}

/* -------------------------------------------------------------------------- */
/* Numbers                                                                    */
/* -------------------------------------------------------------------------- */

/** "1.772" (ca, es), "1,772" (en). By hand, as the calculators do: the same characters everywhere. */
export function int(n: number, locale: DateLocale): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, locale === "en" ? "," : ".");
}

/** "45,5 %" (ca, es), "45.5%" (en), one decimal. */
export function pct(part: number, whole: number, locale: DateLocale): string {
  const v = (Math.round((part / whole) * 1000) / 10).toFixed(1);
  return locale === "en" ? `${v}%` : `${v.replace(".", ",")} %`;
}

/** "3,6 milions" / "3,6 millones" / "3.6 million". */
export function millions(n: number, locale: DateLocale): string {
  const v = (Math.round(n / 100_000) / 10).toFixed(1);
  return locale === "en" ? `${v} million` : `${v.replace(".", ",")} ${locale === "ca" ? "milions" : "millones"}`;
}

/** A date as the tables print it, with "Pasqua Granada" on Whit Monday (computed from Easter). */
export function dateLabel(iso: string, locale: DateLocale): string {
  const base = weekdayDayMonth(iso, locale);
  if (iso !== whitMonday(Number(iso.slice(0, 4)))) return base;
  return `${base} (${{ ca: "Pasqua Granada", es: "Pascua Granada", en: "Whit Monday" }[locale]})`;
}

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

export interface ReportCopy {
  title: string;
  description: (r: ThisYearReport) => string;
  h1: (r: ThisYearReport, n: NextYearReport) => string;
  breadcrumb: string;
  lead: (r: ThisYearReport) => string;
  figuresTitle: string;
  figures: (r: ThisYearReport) => [string, string][];
  topTitle: (year: number) => string;
  chartCaption: (year: number) => string;
  cols: { date: string; towns: string; population: string; largest: string; month: string; days: string; weekday: string; share: string; comarca: string; sharedDate: string; sharing: string; municipality: string; nuclei: string; dates: string; councilName: string };
  populationTitle: string;
  populationLead: (r: ThisYearReport) => string;
  weekdayTitle: string;
  weekdayLead: (r: ThisYearReport) => string;
  monthTitle: string;
  monthLead: (r: ThisYearReport) => string;
  comarcaTitle: string;
  comarcaLead: string;
  nucleiTitle: string;
  nucleiLead: (r: ThisYearReport) => string;
  nextTitle: (year: number) => string;
  nextLead: (n: NextYearReport) => string;
  nextNote: (n: NextYearReport) => string;
  downloadTitle: string;
  downloadLead: (rows: number, year: number, next: number) => string;
  download: string;
  columnsTitle: string;
  columns: string[];
  licence: string;
  citeTitle: string;
  citeLead: string;
  citeText: string;
  citeCode: string;
  copy: string;
  copied: string;
  embedTitle: string;
  embedLead: string;
  embedLink: string;
  sourcesTitle: string;
  methodTitle: string;
  method: string[];
  etQuote: string;
  readOn: (date: string) => string;
  hubLink: string;
}

const pop = () => cataloniaPopulation();

export const REPORT_COPY: Record<DateLocale, ReportCopy> = {
  ca: {
    title: "Festius locals de Catalunya: els dies que més es repeteixen",
    description: (r) =>
      `${capitalize(caDayArticle(r.top[0]!.date))}${dayMonth(r.top[0]!.date, "ca")} és festa local a ${int(r.top[0]!.towns, "ca")} municipis el ${r.year}. Les ${int(r.distinctDates, "ca")} dates de l'ordre del DOGC per mes, dia i comarca, amb CSV obert.`,
    h1: (r, n) => `Festius locals de Catalunya ${r.year} i ${n.year}: quins dies es repeteixen i on`,
    breadcrumb: "Les dades",
    lead: (r) =>
      `Cada municipi té dos festius locals, que proposa l'ajuntament i fixa una ordre del DOGC. El ${r.year}, els ${int(r.towns, "ca")} municipis amb festius locals en van repartir ${int(r.ownDays, "ca")} entre ${int(r.distinctDates, "ca")} dates diferents. La més repetida és el ${dateLabel(r.top[0]!.date, "ca")}: ${int(r.top[0]!.towns, "ca")} municipis, on viuen ${millions(r.top[0]!.population, "ca")} de persones (el ${pct(r.top[0]!.population, pop(), "ca")} de la població de Catalunya).`,
    figuresTitle: "Les xifres",
    figures: (r) => [
      ["Municipis amb festius locals", int(r.towns, "ca")],
      ["Festius locals propis (dos per municipi)", int(r.ownDays, "ca")],
      ["Dates diferents", int(r.distinctDates, "ca")],
      ["Festius locals en dilluns o divendres (cap de setmana de tres dies)", `${int(r.longWeekend, "ca")} (${pct(r.longWeekend, r.ownDays, "ca")})`],
      ["Municipis sense proposta a l'ordre (sense festius locals)", int(r.excluded, "ca")],
    ],
    topTitle: (y) => `Els dies de festa local més repetits el ${y}`,
    chartCaption: (y) => `Municipis amb festa local cada dia, els deu dies més repetits del ${y}. Els valors exactes són a la taula de sota.`,
    cols: { date: "Dia", towns: "Municipis", population: "Població", largest: "Els més poblats", month: "Mes", days: "Festius locals", weekday: "Dia de la setmana", share: "Percentatge", comarca: "Comarca", sharedDate: "Dia més compartit", sharing: "Municipis que el comparteixen", municipality: "Municipi", nuclei: "Nuclis amb festius propis", dates: "Dates diferents al terme", councilName: "Nom més repetit (ajuntaments que el fan servir / total)" },
    populationTitle: "Per població: on fa festa més gent",
    populationLead: (r) => `Ordenats per les persones que viuen als municipis que fan festa aquell dia (padró de l'1 de gener de 2025). ${capitalize(caDayArticle(r.topByPopulation[1]!.date))}${dayMonth(r.topByPopulation[1]!.date, "ca")} només és festa a ${int(r.topByPopulation[1]!.towns, "ca")} municipis, però hi viuen ${millions(r.topByPopulation[1]!.population, "ca")} de persones.`,
    weekdayTitle: "En quin dia de la setmana cauen",
    weekdayLead: (r) =>
      `${int(r.longWeekend, "ca")} festius locals (${pct(r.longWeekend, r.ownDays, "ca")}) cauen en dilluns o divendres i fan un cap de setmana de tres dies; ${int(r.bridge, "ca")} (${pct(r.bridge, r.ownDays, "ca")}), en dimarts o dijous, a un dia feiner d'un pont; ${int(r.weekend, "ca")}, en dissabte o diumenge.`,
    monthTitle: "Per mesos",
    monthLead: (r) => {
      const best = [...r.byMonth].sort((a, b) => b.days - a.days)[0]!;
      const name = ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"][best.month - 1]!;
      return `El mes amb més festius locals és ${/^[aeiou]/.test(name) ? "l'" : "el "}${name}, amb ${int(best.days, "ca")} (${pct(best.days, r.ownDays, "ca")}).`;
    },
    comarcaTitle: "El festiu local de cada comarca",
    comarcaLead: "El dia que comparteixen més municipis de cada comarca, i quants el fan festa.",
    nucleiTitle: "On hi ha més dates en un sol municipi",
    nucleiLead: (r) =>
      `Cap municipi té més de dos festius locals propis, però ${int(r.withNuclei, "ca")} tenen nuclis (pobles agregats, entitats municipals) amb dies propis, i ${int(r.nucleiOnly, "ca")} només en tenen als nuclis. Aquests són els termes amb més dates diferents.`,
    nextTitle: (y) => `${y}: el que ja han aprovat els ajuntaments`,
    nextLead: (n) =>
      n.status === "council"
        ? `L'ordre del DOGC amb els festius locals del ${n.year} encara no ha sortit (la del ${n.year - 1} es va publicar el 17 de desembre de 2025). Mentrestant, ${int(n.towns, "ca")} ajuntaments ja han aprovat els seus dos dies, on viu el ${n.populationShare.toFixed(1).replace(".", ",")} % de la població. Els dies més repetits, de moment:`
        : `Els festius locals del ${n.year} segons l'ordre del DOGC, per a ${int(n.towns, "ca")} municipis. Els dies més repetits:`,
    nextNote: (n) => (n.status === "council" ? "Dies aprovats pels ajuntaments, pendents de l'ordre del DOGC: quan surti, aquesta pàgina i el CSV passaran a les dades de l'ordre." : "Dades de l'ordre del DOGC."),
    downloadTitle: "Descarrega les dades",
    downloadLead: (rows, y, n) => `Un fitxer CSV amb els ${int(rows, "ca")} festius locals d'aquesta pàgina, un per fila: el ${y} de l'ordre del DOGC i el ${n} dels ajuntaments (o de l'ordre, quan surti).`,
    download: "Descarrega el CSV",
    columnsTitle: "Columnes",
    columns: [
      "year: any; ine: codi INE del municipi; municipality, comarca, population_2025 (padró de l'Idescat)",
      "place i place_type: el municipi (municipality) o el nucli (nucleus) que fa festa",
      "date (AAAA-MM-DD), weekday (en anglès)",
      "status: dogc (ordre publicada) o council-approved (aprovat per l'ajuntament, pendent del DOGC)",
      "source, source_url: l'ordre o l'acte de l'ajuntament d'on surt cada dia",
    ],
    licence: "Les dades són de la Generalitat (ordres del DOGC, dades obertes) i dels ajuntaments; la recopilació és de CatalunyaInfo i es pot reutilitzar amb llicència CC BY 4.0, citant les dues fonts.",
    citeTitle: "Com citar-les",
    citeLead: "Si en fas servir les dades o el gràfic, enllaça aquesta pàgina:",
    citeText: "Font: CatalunyaInfo, a partir de les ordres de festes locals del DOGC i els acords dels ajuntaments.",
    citeCode: "Codi per citar-les",
    copy: "Copia el codi",
    copied: "Copiat",
    embedTitle: "El calendari de cada municipi, al teu web",
    embedLead: "Un calendari de festius per enganxar al web de l'ajuntament, l'escola o l'entitat, amb la font oficial i sense publicitat:",
    embedLink: "Posa el calendari laboral al teu web",
    sourcesTitle: "Fonts",
    methodTitle: "Com s'ha fet",
    method: [
      "Comptem els festius locals propis de cada municipi (dos per municipi); els dels nuclis es compten a part.",
      "La població és la del padró municipal de l'Idescat a 1 de gener de 2025.",
      "Pasqua Granada és el dilluns 50 dies després del diumenge de Pasqua, calculat amb el còmput gregorià.",
      "Les xifres es recalculen soles a cada actualització de les dades; res no està escrit a mà.",
    ],
    etQuote: "Estatut dels Treballadors, art. 37.2: «Las fiestas laborales, que tendrán carácter retribuido y no recuperable, no podrán exceder de catorce al año, de las cuales dos serán locales.»",
    readOn: (d) => `Dades llegides el ${d}.`,
    hubLink: "Les dades: quins festius locals es repeteixen més i on (amb CSV)",
  },
  es: {
    title: "Festivos locales de Cataluña: los días que más se repiten",
    description: (r) =>
      `El ${dayMonth(r.top[0]!.date, "es")} es fiesta local en ${int(r.top[0]!.towns, "es")} municipios en ${r.year}. Las ${int(r.distinctDates, "es")} fechas de la orden del DOGC por mes, día y comarca, con CSV abierto.`,
    h1: (r, n) => `Festivos locales de Cataluña ${r.year} y ${n.year}: qué días se repiten y dónde`,
    breadcrumb: "Los datos",
    lead: (r) =>
      `Cada municipio tiene dos festivos locales, que propone el ayuntamiento y fija una orden del DOGC. En ${r.year}, los ${int(r.towns, "es")} municipios con festivos locales se repartieron ${int(r.ownDays, "es")} entre ${int(r.distinctDates, "es")} fechas distintas. La más repetida es el ${dateLabel(r.top[0]!.date, "es")}: ${int(r.top[0]!.towns, "es")} municipios, donde viven ${millions(r.top[0]!.population, "es")} de personas (el ${pct(r.top[0]!.population, pop(), "es")} de la población de Cataluña).`,
    figuresTitle: "Las cifras",
    figures: (r) => [
      ["Municipios con festivos locales", int(r.towns, "es")],
      ["Festivos locales propios (dos por municipio)", int(r.ownDays, "es")],
      ["Fechas distintas", int(r.distinctDates, "es")],
      ["Festivos locales en lunes o viernes (fin de semana de tres días)", `${int(r.longWeekend, "es")} (${pct(r.longWeekend, r.ownDays, "es")})`],
      ["Municipios sin propuesta en la orden (sin festivos locales)", int(r.excluded, "es")],
    ],
    topTitle: (y) => `Los días de fiesta local más repetidos en ${y}`,
    chartCaption: (y) => `Municipios con fiesta local cada día, los diez días más repetidos de ${y}. Los valores exactos están en la tabla de debajo.`,
    cols: { date: "Día", towns: "Municipios", population: "Población", largest: "Los más poblados", month: "Mes", days: "Festivos locales", weekday: "Día de la semana", share: "Porcentaje", comarca: "Comarca", sharedDate: "Día más compartido", sharing: "Municipios que lo comparten", municipality: "Municipio", nuclei: "Núcleos con festivos propios", dates: "Fechas distintas en el término", councilName: "Nombre más repetido, en catalán (ayuntamientos que lo usan / total)" },
    populationTitle: "Por población: dónde hace fiesta más gente",
    populationLead: (r) => `Ordenados por las personas que viven en los municipios que hacen fiesta ese día (padrón a 1 de enero de 2025). El ${dayMonth(r.topByPopulation[1]!.date, "es")} solo es fiesta en ${int(r.topByPopulation[1]!.towns, "es")} municipios, pero en ellos viven ${millions(r.topByPopulation[1]!.population, "es")} de personas.`,
    weekdayTitle: "En qué día de la semana caen",
    weekdayLead: (r) =>
      `${int(r.longWeekend, "es")} festivos locales (${pct(r.longWeekend, r.ownDays, "es")}) caen en lunes o viernes y dan un fin de semana de tres días; ${int(r.bridge, "es")} (${pct(r.bridge, r.ownDays, "es")}), en martes o jueves, a un día laborable de un puente; ${int(r.weekend, "es")}, en sábado o domingo.`,
    monthTitle: "Por meses",
    monthLead: (r) => {
      const best = [...r.byMonth].sort((a, b) => b.days - a.days)[0]!;
      return `El mes con más festivos locales es ${["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][best.month - 1]}, con ${int(best.days, "es")} (${pct(best.days, r.ownDays, "es")}).`;
    },
    comarcaTitle: "El festivo local de cada comarca",
    comarcaLead: "El día que comparten más municipios de cada comarca, y cuántos lo hacen fiesta.",
    nucleiTitle: "Dónde hay más fechas en un solo municipio",
    nucleiLead: (r) =>
      `Ningún municipio tiene más de dos festivos locales propios, pero ${int(r.withNuclei, "es")} tienen núcleos (pueblos agregados, entidades municipales) con días propios, y ${int(r.nucleiOnly, "es")} solo los tienen en sus núcleos. Estos son los términos con más fechas distintas.`,
    nextTitle: (y) => `${y}: lo que ya han aprobado los ayuntamientos`,
    nextLead: (n) =>
      n.status === "council"
        ? `La orden del DOGC con los festivos locales de ${n.year} aún no ha salido (la de ${n.year - 1} se publicó el 17 de diciembre de 2025). Mientras tanto, ${int(n.towns, "es")} ayuntamientos ya han aprobado sus dos días; en ellos vive el ${n.populationShare.toFixed(1).replace(".", ",")} % de la población. Los días más repetidos, de momento:`
        : `Los festivos locales de ${n.year} según la orden del DOGC, para ${int(n.towns, "es")} municipios. Los días más repetidos:`,
    nextNote: (n) => (n.status === "council" ? "Días aprobados por los ayuntamientos, pendientes de la orden del DOGC: cuando salga, esta página y el CSV pasarán a los datos de la orden." : "Datos de la orden del DOGC."),
    downloadTitle: "Descarga los datos",
    downloadLead: (rows, y, n) => `Un archivo CSV con los ${int(rows, "es")} festivos locales de esta página, uno por fila: ${y} de la orden del DOGC y ${n} de los ayuntamientos (o de la orden, cuando salga).`,
    download: "Descargar el CSV",
    columnsTitle: "Columnas",
    columns: [
      "year: año; ine: código INE del municipio; municipality, comarca, population_2025 (padrón del Idescat)",
      "place y place_type: el municipio (municipality) o el núcleo (nucleus) que hace fiesta",
      "date (AAAA-MM-DD), weekday (en inglés)",
      "status: dogc (orden publicada) o council-approved (aprobado por el ayuntamiento, pendiente del DOGC)",
      "source, source_url: la orden o el acto del ayuntamiento del que sale cada día",
    ],
    licence: "Los datos son de la Generalitat (órdenes del DOGC, datos abiertos) y de los ayuntamientos; la recopilación es de CatalunyaInfo y se puede reutilizar con licencia CC BY 4.0, citando las dos fuentes.",
    citeTitle: "Cómo citarlos",
    citeLead: "Si usas los datos o el gráfico, enlaza esta página:",
    citeText: "Fuente: CatalunyaInfo, a partir de las órdenes de fiestas locales del DOGC y los acuerdos de los ayuntamientos.",
    citeCode: "Código para citarlos",
    copy: "Copiar el código",
    copied: "Copiado",
    embedTitle: "El calendario de cada municipio, en tu web",
    embedLead: "Un calendario de festivos para pegar en la web del ayuntamiento, el colegio o la asociación, con la fuente oficial y sin publicidad:",
    embedLink: "Pon el calendario laboral en tu web",
    sourcesTitle: "Fuentes",
    methodTitle: "Cómo se ha hecho",
    method: [
      "Contamos los festivos locales propios de cada municipio (dos por municipio); los de los núcleos se cuentan aparte.",
      "La población es la del padrón municipal del Idescat a 1 de enero de 2025.",
      "La Pascua Granada es el lunes 50 días después del domingo de Pascua, calculado con el cómputo gregoriano.",
      "Las cifras se recalculan solas en cada actualización de los datos; nada está escrito a mano.",
    ],
    etQuote: "Estatuto de los Trabajadores, art. 37.2: «Las fiestas laborales, que tendrán carácter retribuido y no recuperable, no podrán exceder de catorce al año, de las cuales dos serán locales.»",
    readOn: (d) => `Datos leídos el ${d}.`,
    hubLink: "Los datos: qué festivos locales se repiten más y dónde (con CSV)",
  },
  en: {
    title: "Catalonia local holidays: the most common dates, in data",
    description: (r) =>
      `${dayMonth(r.top[0]!.date, "en")} is a local holiday in ${int(r.top[0]!.towns, "en")} towns in ${r.year}. All ${int(r.distinctDates, "en")} dates of the DOGC order by month, weekday and comarca, with an open CSV.`,
    h1: (r, n) => `Catalonia's local holidays ${r.year} and ${n.year}: which dates repeat, and where`,
    breadcrumb: "The data",
    lead: (r) =>
      `Every municipality in Catalonia has two local holidays, proposed by the council and fixed by an order in the DOGC, the Catalan official gazette. In ${r.year} the ${int(r.towns, "en")} municipalities with local holidays shared ${int(r.ownDays, "en")} of them across ${int(r.distinctDates, "en")} different dates. The most common is ${dateLabel(r.top[0]!.date, "en")}: ${int(r.top[0]!.towns, "en")} municipalities, home to ${millions(r.top[0]!.population, "en")} people (${pct(r.top[0]!.population, pop(), "en")} of Catalonia's population).`,
    figuresTitle: "The figures",
    figures: (r) => [
      ["Municipalities with local holidays", int(r.towns, "en")],
      ["Own local holidays (two per municipality)", int(r.ownDays, "en")],
      ["Different dates", int(r.distinctDates, "en")],
      ["Local holidays on a Monday or Friday (a three-day weekend)", `${int(r.longWeekend, "en")} (${pct(r.longWeekend, r.ownDays, "en")})`],
      ["Councils with no proposal in the order (no local holidays)", int(r.excluded, "en")],
    ],
    topTitle: (y) => `The most common local holiday dates in ${y}`,
    chartCaption: (y) => `Municipalities with a local holiday on each date, the ten most common dates of ${y}. Exact values are in the table below.`,
    cols: { date: "Date", towns: "Municipalities", population: "Population", largest: "Largest", month: "Month", days: "Local holidays", weekday: "Weekday", share: "Share", comarca: "Comarca", sharedDate: "Most shared date", sharing: "Municipalities sharing it", municipality: "Municipality", nuclei: "Villages with their own days", dates: "Different dates in its territory", councilName: "Most common name, in Catalan (councils using it / total)" },
    populationTitle: "By population: where most people have the day off",
    populationLead: (r) => `Sorted by how many people live in the municipalities with a local holiday that day (register of 1 January 2025). ${dayMonth(r.topByPopulation[1]!.date, "en")} is a local holiday in only ${int(r.topByPopulation[1]!.towns, "en")} municipalities, but ${millions(r.topByPopulation[1]!.population, "en")} people live in them.`,
    weekdayTitle: "Which weekday they fall on",
    weekdayLead: (r) =>
      `${int(r.longWeekend, "en")} local holidays (${pct(r.longWeekend, r.ownDays, "en")}) fall on a Monday or a Friday, a three-day weekend; ${int(r.bridge, "en")} (${pct(r.bridge, r.ownDays, "en")}) on a Tuesday or a Thursday, one working day short of a four-day bridge; ${int(r.weekend, "en")} on a Saturday or a Sunday.`,
    monthTitle: "By month",
    monthLead: (r) => {
      const best = [...r.byMonth].sort((a, b) => b.days - a.days)[0]!;
      return `The month with the most local holidays is ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][best.month - 1]}, with ${int(best.days, "en")} (${pct(best.days, r.ownDays, "en")}).`;
    },
    comarcaTitle: "Each comarca's local holiday",
    comarcaLead: "The date most municipalities of each comarca (county) share, and how many take it off.",
    nucleiTitle: "Where one municipality has the most dates",
    nucleiLead: (r) =>
      `No municipality has more than two local holidays of its own, but ${int(r.withNuclei, "en")} have villages (nuclis) with days of their own, and ${int(r.nucleiOnly, "en")} have them only in their villages. These are the municipalities with the most different dates.`,
    nextTitle: (y) => `${y}: what the councils have approved so far`,
    nextLead: (n) =>
      n.status === "council"
        ? `The DOGC order with the ${n.year} local holidays is not out yet (the ${n.year - 1} one appeared on 17 December 2025). Meanwhile ${int(n.towns, "en")} councils have approved their two days; ${n.populationShare.toFixed(1)}% of the population lives in them. The most common dates so far:`
        : `The ${n.year} local holidays according to the DOGC order, for ${int(n.towns, "en")} municipalities. The most common dates:`,
    nextNote: (n) => (n.status === "council" ? "Days approved by the councils, pending the DOGC order: when it comes out, this page and the CSV switch to the order's data." : "Data from the DOGC order."),
    downloadTitle: "Download the data",
    downloadLead: (rows, y, n) => `A CSV file with the ${int(rows, "en")} local holidays on this page, one per row: ${y} from the DOGC order, ${n} from the councils (or from the order, once out).`,
    download: "Download the CSV",
    columnsTitle: "Columns",
    columns: [
      "year; ine: the municipality's INE code; municipality, comarca, population_2025 (Idescat register)",
      "place and place_type: the municipality or the village (nucleus) with the day off",
      "date (YYYY-MM-DD), weekday",
      "status: dogc (published order) or council-approved (approved by the council, pending the DOGC)",
      "source, source_url: the order or council act each day comes from",
    ],
    licence: "The data are the Generalitat's (DOGC orders, open data) and the councils'; the compilation is CatalunyaInfo's and may be reused under CC BY 4.0, crediting both.",
    citeTitle: "How to cite it",
    citeLead: "If you use the data or the chart, link this page:",
    citeText: "Source: CatalunyaInfo, from the DOGC local holiday orders and the councils' decisions.",
    citeCode: "Code to cite it",
    copy: "Copy the code",
    copied: "Copied",
    embedTitle: "Each town's calendar, on your website",
    embedLead: "A holiday calendar to paste into a council, school or association website, with the official source and no ads:",
    embedLink: "Add the holiday calendar to your website",
    sourcesTitle: "Sources",
    methodTitle: "Method",
    method: [
      "We count each municipality's own local holidays (two each); the villages' days are counted apart.",
      "Population is Idescat's municipal register on 1 January 2025.",
      "Whit Monday is the Monday 50 days after Easter Sunday, from the Gregorian computus.",
      "The figures are recomputed whenever the data change; none is typed by hand.",
    ],
    etQuote: "Workers' Statute (Estatuto de los Trabajadores), art. 37.2: “Las fiestas laborales, que tendrán carácter retribuido y no recuperable, no podrán exceder de catorce al año, de las cuales dos serán locales” (no more than fourteen paid public holidays a year, two of them local).",
    readOn: (d) => `Data read on ${d}.`,
    hubLink: "The data: which local holidays repeat most, and where (with CSV)",
  },
};

/** The Workers' Statute, consolidated text (BOE), art. 37: read 18 Nov 2026 (last update shown: 21 Oct 2026). */
export const ET_37 = { name: "Real Decreto Legislativo 2/2015, Estatuto de los Trabajadores, art. 37.2", ref: "BOE-A-2015-11430", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a37", readOn: "2026-11-18" } as const;
