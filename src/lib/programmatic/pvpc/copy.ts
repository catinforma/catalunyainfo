/**
 * Words of the PVPC pages, in es (primary), ca and en. Pure: every figure
 * comes in as an argument, read from REE by the route; nothing here invents
 * or rounds a price beyond printing REE's €/MWh as €/kWh with four decimals.
 *
 * Facts verified 13 Nov 2026 (sources() lists the URLs):
 *  - REE publishes the next day's 2.0TD prices every day at 20:15; the
 *    operation procedure 14.12 says "antes de las 20 h 15 de cada día"
 *    (BOE-A-2023-15276, §4).
 *  - OMIE's day-ahead auction closes at 12:00 CET and, since 1 Oct 2025, gives
 *    96 quarter-hour prices (OMIE press release, 1 Oct 2025). REE's PVPC
 *    series 1001 still has one price per hour (REData, read 13 Nov 2026).
 *  - PVPC: supplies at no more than 1 kV with contracted power up to 10 kW,
 *    held by individuals or micro-enterprises (RD 216/2014 art. 5.3), sold
 *    only by the reference suppliers (art. 3–4). Energy cost weights: 0.45
 *    day-ahead and intraday, 0.55 forward markets (art. 9, as amended by RD
 *    446/2023).
 *  - Periods: CNMC Circular 3/2020 art. 7.3 (periods.ts).
 *  - The hourly figure is the PVPC term for active energy: the e·sios file's
 *    components (market price, adjustment services, tolls and charges, etc.)
 *    add up to it; contracted power, the electricity tax, VAT and meter rental
 *    are billed apart.
 *  - Bono social: needs the PVPC with a reference supplier and contracted
 *    power of 10 kW or less (CNMC, "Bono social eléctrico").
 */

import type { Locale } from "@/lib/i18n/config";
import { caEl, liveStamp } from "@/lib/programmatic/live-stamp";

import type { DaySummary, HourView, Period } from "./periods";
import { perKwh } from "./periods";
import { pvpcPath } from "./paths";
import { ESIOS_PVPC_PAGE, REE_PVPC_PAGE } from "./upstream";
import { PUBLISH_DEADLINE } from "./view";

const INTL: Record<Locale, string> = { es: "es-ES", ca: "ca-ES", en: "en-GB" };

export const URLS = {
  reePvpc: REE_PVPC_PAGE,
  esiosPvpc: ESIOS_PVPC_PAGE,
  redata: "https://www.ree.es/es/datos/apidatos",
  reeLegal: "https://www.ree.es/en/legal-notice-privacy-policy",
  po1412: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-15276",
  circular: "https://www.boe.es/buscar/act.php?id=BOE-A-2020-1066",
  rd216: "https://www.boe.es/buscar/act.php?id=BOE-A-2014-3376",
  omie15: "https://www.omie.es/sites/default/files/2025-10/2501001_go_live_mtu15_md_es_vf.pdf",
  bonoCnmc: "https://www.cnmc.es/facil-para-ti/que-hace-la-cnmc-para-consumidores/bono-social-electrico",
  bonoMiteco: "https://www.miteco.gob.es/es/energia/energia-electrica/bono-social.html",
} as const;

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

/** REE's €/MWh as €/kWh, four decimals: "0,1591" (es, ca) / "0.1591" (en). */
export function kwh(eurMwh: number, locale: Locale): string {
  const text = perKwh(eurMwh).toFixed(4);
  return locale === "en" ? text : text.replace(".", ",");
}

/** "0,1591 €/kWh" / "€0.1591/kWh". */
export function kwhUnit(eurMwh: number, locale: Locale): string {
  return locale === "en" ? `€${kwh(eurMwh, locale)}/kWh` : `${kwh(eurMwh, locale)} €/kWh`;
}

function utcDate(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

/** "viernes, 13 de noviembre de 2026" / "divendres, 13 de novembre de 2026" / "Friday 13 November 2026". */
export function longDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL[locale], { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(utcDate(date));
}

/** "13 de noviembre" / "13 de novembre" / "13 November". */
export function dayMonth(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL[locale], { day: "numeric", month: "long", timeZone: "UTC" }).format(utcDate(date));
}

/** "viernes 13" style weekday + day for short mentions. */
function weekdayName(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL[locale], { weekday: "long", timeZone: "UTC" }).format(utcDate(date));
}

export function hourRange(h: HourView, locale: Locale): string {
  const dst = h.label.repeat ? ` (${REPEAT[locale][h.label.repeat]})` : "";
  return `${h.label.from}–${h.label.to}${dst}`;
}

/** In a sentence: "de 14:00 a 15:00" / "from 14:00 to 15:00". */
export function hourSpan(h: HourView, locale: Locale): string {
  const dst = h.label.repeat ? ` (${REPEAT[locale][h.label.repeat]})` : "";
  return locale === "en" ? `from ${h.label.from} to ${h.label.to}${dst}` : `de ${h.label.from} a ${h.label.to}${dst}`;
}

const REPEAT: Record<Locale, Record<"summer" | "winter", string>> = {
  es: { summer: "horario de verano", winter: "horario de invierno" },
  ca: { summer: "horari d'estiu", winter: "horari d'hivern" },
  en: { summer: "summer time", winter: "winter time" },
};

export const PERIOD_NAME: Record<Locale, Record<Period, string>> = {
  es: { punta: "Punta", llano: "Llano", valle: "Valle" },
  ca: { punta: "Punta", llano: "Pla", valle: "Vall" },
  en: { punta: "Peak", llano: "Standard", valle: "Off-peak" },
};

/* -------------------------------------------------------------------------- */
/* Fixed words                                                                */
/* -------------------------------------------------------------------------- */

interface Words {
  kicker: string;
  crumb: string;
  crumbTomorrow: string;
  h1Today: string;
  h1Tomorrow: string;
  tableTitle: (date: string) => string;
  chartTitle: (date: string) => string;
  cols: [string, string, string];
  now: string;
  cheapestTag: string;
  dearestTag: string;
  legend: string;
  chartNote: string;
  cymTitle: string;
  cymIntro: string;
  tomorrowLink: string;
  todayLink: string;
  publishTitle: string;
  whatTitle: string;
  periodsTitle: string;
  periodsCols: [string, string, string];
  includesTitle: string;
  bonoTitle: string;
  quarterTitle: string;
  sourcesTitle: string;
  sourcesNote: string;
  related: string;
  summaryTitle: string;
  average: string;
  cheapest: string;
  dearest: string;
  cheapest3: string;
  dearest3: string;
  periodAvg: string;
}

const WORDS: Record<Locale, Words> = {
  es: {
    kicker: "Precio de la luz · PVPC",
    crumb: "Precio de la luz",
    crumbTomorrow: "Mañana",
    h1Today: "Precio de la luz hoy (PVPC), hora a hora",
    h1Tomorrow: "Precio de la luz mañana (PVPC), hora a hora",
    tableTitle: (d) => `Precio por horas, ${d}`,
    chartTitle: (d) => `Precio de la luz por horas, ${d} (€/kWh)`,
    cols: ["Hora", "€/kWh", "Periodo 2.0TD"],
    now: "ahora",
    cheapestTag: "la más barata",
    dearestTag: "la más cara",
    legend: "Color de cada barra: periodo de peajes 2.0TD",
    chartNote: "Península, Baleares y Canarias. Horas en hora peninsular.",
    cymTitle: "Ceuta y Melilla",
    cymIntro:
      "En Ceuta y Melilla los periodos punta y llano empiezan una hora más tarde (Circular 3/2020), así que cuatro horas del día tienen otro precio. REE lo publica en su fichero PVPC de e·sios (columna «CYM»):",
    tomorrowLink: "Precio de la luz mañana",
    todayLink: "Precio de la luz hoy",
    publishTitle: "¿A qué hora se publica el precio de la luz de mañana?",
    whatTitle: "Qué es el PVPC y quién lo tiene",
    periodsTitle: "Horas punta, llano y valle (tarifa 2.0TD)",
    periodsCols: ["Periodo", "Península, Baleares y Canarias", "Ceuta y Melilla"],
    includesTitle: "Qué incluye este precio",
    bonoTitle: "Bono social eléctrico",
    quarterTitle: "¿Precio cada hora o cada 15 minutos?",
    sourcesTitle: "Fuentes",
    sourcesNote: "Precios: Red Eléctrica. Normas: BOE. Comprobado el 13/11/2026.",
    related: "Más datos de hoy",
    summaryTitle: "Resumen del día",
    average: "Precio medio",
    cheapest: "Hora más barata",
    dearest: "Hora más cara",
    cheapest3: "Las 3 horas más baratas",
    dearest3: "Las 3 horas más caras",
    periodAvg: "Media por periodo",
  },
  ca: {
    kicker: "Preu de la llum · PVPC",
    crumb: "Preu de la llum",
    crumbTomorrow: "Demà",
    h1Today: "Preu de la llum avui (PVPC), hora a hora",
    h1Tomorrow: "Preu de la llum demà (PVPC), hora a hora",
    tableTitle: (d) => `Preu per hores, ${d}`,
    chartTitle: (d) => `Preu de la llum per hores, ${d} (€/kWh)`,
    cols: ["Hora", "€/kWh", "Període 2.0TD"],
    now: "ara",
    cheapestTag: "la més barata",
    dearestTag: "la més cara",
    legend: "Color de cada barra: període de peatges 2.0TD",
    chartNote: "Península, Balears i Canàries. Hores en hora peninsular.",
    cymTitle: "Ceuta i Melilla",
    cymIntro:
      "A Ceuta i Melilla els períodes punta i pla comencen una hora més tard (Circular 3/2020), així que quatre hores del dia tenen un altre preu. REE el publica al seu fitxer PVPC d'e·sios (columna «CYM»):",
    tomorrowLink: "Preu de la llum demà",
    todayLink: "Preu de la llum avui",
    publishTitle: "A quina hora es publica el preu de la llum de demà?",
    whatTitle: "Què és el PVPC i qui el té",
    periodsTitle: "Hores punta, pla i vall (tarifa 2.0TD)",
    periodsCols: ["Període", "Península, Balears i Canàries", "Ceuta i Melilla"],
    includesTitle: "Què inclou aquest preu",
    bonoTitle: "Bo social elèctric",
    quarterTitle: "Preu cada hora o cada 15 minuts?",
    sourcesTitle: "Fonts",
    sourcesNote: "Preus: Red Eléctrica. Normes: BOE. Comprovat el 13/11/2026.",
    related: "Més dades d'avui",
    summaryTitle: "Resum del dia",
    average: "Preu mitjà",
    cheapest: "Hora més barata",
    dearest: "Hora més cara",
    cheapest3: "Les 3 hores més barates",
    dearest3: "Les 3 hores més cares",
    periodAvg: "Mitjana per període",
  },
  en: {
    kicker: "Electricity price · PVPC",
    crumb: "Electricity price in Spain",
    crumbTomorrow: "Tomorrow",
    h1Today: "Electricity price in Spain today (PVPC), hour by hour",
    h1Tomorrow: "Electricity price in Spain tomorrow (PVPC), hour by hour",
    tableTitle: (d) => `Price by hour, ${d}`,
    chartTitle: (d) => `Electricity price by hour, ${d} (€/kWh)`,
    cols: ["Hour", "€/kWh", "2.0TD period"],
    now: "now",
    cheapestTag: "cheapest",
    dearestTag: "dearest",
    legend: "Bar colour: 2.0TD toll period",
    chartNote: "Mainland Spain, Balearic and Canary Islands. Times in mainland Spanish time.",
    cymTitle: "Ceuta and Melilla",
    cymIntro:
      "In Ceuta and Melilla the peak and standard periods start one hour later (Circular 3/2020), so four hours of the day have a different price. REE publishes it in its e·sios PVPC file (column “CYM”):",
    tomorrowLink: "Electricity price tomorrow",
    todayLink: "Electricity price today",
    publishTitle: "What time is tomorrow's electricity price published?",
    whatTitle: "What the PVPC is and who is on it",
    periodsTitle: "Peak, standard and off-peak hours (2.0TD tariff)",
    periodsCols: ["Period", "Mainland, Balearic and Canary Islands", "Ceuta and Melilla"],
    includesTitle: "What this price includes",
    bonoTitle: "Bono social (discounted electricity)",
    quarterTitle: "A price per hour or per 15 minutes?",
    sourcesTitle: "Sources",
    sourcesNote: "Prices: Red Eléctrica. Rules: BOE. Checked 13 Nov 2026.",
    related: "More data for today",
    summaryTitle: "The day at a glance",
    average: "Average price",
    cheapest: "Cheapest hour",
    dearest: "Dearest hour",
    cheapest3: "3 cheapest hours",
    dearest3: "3 dearest hours",
    periodAvg: "Average by period",
  },
};

export function words(locale: Locale): Words {
  return WORDS[locale];
}

/* -------------------------------------------------------------------------- */
/* Live sentences                                                             */
/* -------------------------------------------------------------------------- */

/** The answer under the H1 for a day with prices. `when` says which day it is. */
export function dayAnswer(s: DaySummary, locale: Locale, when: "today" | "tomorrow"): string {
  const d = longDate(s.date, locale);
  const c = s.cheapest;
  const x = s.dearest;
  if (locale === "ca") {
    const day = when === "today" ? `Avui, ${d}` : `Demà, ${d}`;
    return `${day}, la llum amb PVPC és **més barata ${hourSpan(c, locale)} (${kwhUnit(c.price, locale)})** i **més cara ${hourSpan(x, locale)} (${kwhUnit(x.price, locale)})**. Preu mitjà del dia: **${kwhUnit(s.average, locale)}**.`;
  }
  if (locale === "en") {
    const day = when === "today" ? `Today, ${d}` : `Tomorrow, ${d}`;
    return `${day}, PVPC electricity is **cheapest ${hourSpan(c, locale)} (${kwhUnit(c.price, locale)})** and **dearest ${hourSpan(x, locale)} (${kwhUnit(x.price, locale)})**. Average for the day: **${kwhUnit(s.average, locale)}**.`;
  }
  const day = when === "today" ? `Hoy, ${d}` : `Mañana, ${d}`;
  return `${day}, la luz con PVPC es **más barata ${hourSpan(c, locale)} (${kwhUnit(c.price, locale)})** y **más cara ${hourSpan(x, locale)} (${kwhUnit(x.price, locale)})**. Precio medio del día: **${kwhUnit(s.average, locale)}**.`;
}

/** "A las 15:36 (hora en curso 15:00–16:00): 0,1585 €/kWh, llano." */
export function currentHourLine(h: HourView, renderedAt: string, locale: Locale): string {
  const t = liveStamp(renderedAt, locale)?.time ?? "";
  const p = PERIOD_NAME[locale][h.period].toLowerCase();
  if (locale === "ca") return `A les ${t} (hora en curs ${hourRange(h, locale)}): **${kwhUnit(h.price, locale)}**, ${p}.`;
  if (locale === "en") return `At ${t} (current hour ${hourRange(h, locale)}): **${kwhUnit(h.price, locale)}**, ${p}.`;
  return `A las ${t} (hora en curso ${hourRange(h, locale)}): **${kwhUnit(h.price, locale)}**, ${p}.`;
}

/** Today's average against yesterday's, both REE's. */
export function versusYesterday(today: DaySummary, yesterday: DaySummary, locale: Locale): string {
  const diff = (today.average - yesterday.average) / yesterday.average;
  const pct = Math.abs(diff * 100).toFixed(0);
  const y = kwhUnit(yesterday.average, locale);
  if (pct === "0") {
    if (locale === "ca") return `La mitjana d'avui és gairebé igual que la d'ahir (${y}).`;
    if (locale === "en") return `Today's average is about the same as yesterday's (${y}).`;
    return `La media de hoy es casi igual que la de ayer (${y}).`;
  }
  const up = diff > 0;
  if (locale === "ca") return `La mitjana d'avui és un ${pct} % ${up ? "més alta" : "més baixa"} que la d'ahir (${y}).`;
  if (locale === "en") return `Today's average is ${pct}% ${up ? "higher" : "lower"} than yesterday's (${y}).`;
  return `La media de hoy es un ${pct} % ${up ? "más alta" : "más baja"} que la de ayer (${y}).`;
}

/** "Precios de Red Eléctrica (REData), leídos el 13/11/2026 a las 15:36 · actualizados por REE el 12/11/2026 a las 20:46." */
export function readLine(fetchedAt: string, updated: string | null, locale: Locale): string {
  const f = liveStamp(fetchedAt, locale);
  const u = updated ? liveStamp(updated, locale) : null;
  if (!f) return "";
  if (locale === "ca") {
    const up = u ? ` · actualitzats per REE ${caEl(u.date)} a les ${u.time}` : "";
    return `Preus de Red Eléctrica (REData), llegits ${caEl(f.date)} a les ${f.time}${up}.`;
  }
  if (locale === "en") {
    const up = u ? ` · updated by REE on ${u.date} at ${u.time}` : "";
    return `Prices from Red Eléctrica (REData), read on ${f.date} at ${f.time}${up}.`;
  }
  const up = u ? ` · actualizados por REE el ${u.date} a las ${u.time}` : "";
  return `Precios de Red Eléctrica (REData), leídos el ${f.date} a las ${f.time}${up}.`;
}

/** Shown when REE did not answer this time but today's prices were read earlier: they are still exact. */
export function snapshotNote(fetchedAt: string, locale: Locale): string {
  const f = liveStamp(fetchedAt, locale);
  if (!f) return "";
  if (locale === "ca") return `REE no ha respost ara mateix. Aquests són els preus d'avui tal com REE els va publicar, llegits ${caEl(f.date)} a les ${f.time}: un preu publicat ja no canvia.`;
  if (locale === "en") return `REE did not answer just now. These are today's prices as REE published them, read on ${f.date} at ${f.time}: a published price does not change.`;
  return `REE no ha respondido ahora mismo. Estos son los precios de hoy tal como REE los publicó, leídos el ${f.date} a las ${f.time}: un precio publicado ya no cambia.`;
}

/** No price for today: never a figure, a link to REE instead (and the newest day held, with its date). */
export function missingTodayNote(latestDate: string | null, locale: Locale): string {
  const latest = latestDate ? longDate(latestDate, locale) : null;
  if (locale === "ca") {
    const tail = latest ? ` A sota hi ha l'últim dia que tenim, **${latest}**, amb la seva data.` : "";
    return `Ara mateix no hem pogut llegir el preu d'avui a Red Eléctrica. Consulta'l a [e·sios (REE)](${URLS.esiosPvpc}).${tail}`;
  }
  if (locale === "en") {
    const tail = latest ? ` Below is the latest day we hold, **${latest}**, shown with its own date.` : "";
    return `We could not read today's price from Red Eléctrica just now. Check it on [e·sios (REE)](${URLS.esiosPvpc}).${tail}`;
  }
  const tail = latest ? ` Debajo tienes el último día que tenemos, **${latest}**, con su fecha.` : "";
  return `Ahora mismo no hemos podido leer el precio de hoy en Red Eléctrica. Consúltalo en [e·sios (REE)](${URLS.esiosPvpc}).${tail}`;
}

/**
 * Tomorrow before publication: the answer first. `seenAt` is when today's
 * prices appeared in REData yesterday (REE's own last-update), if known.
 */
export function notYetPublished(tomorrowDate: string, seenAt: string | null, locale: Locale): string {
  const d = longDate(tomorrowDate, locale);
  if (locale === "ca") {
    const seen = seenAt ? ` Els d'avui van aparèixer ahir a les ${seenAt}.` : "";
    return `El preu de la llum de demà, ${d}, **encara no s'ha publicat**. Red Eléctrica el publica cada dia **abans de les ${PUBLISH_DEADLINE} h**. Aquesta pàgina es torna a llegir cada 15 minuts i el mostra quan apareix a REData.${seen}`;
  }
  if (locale === "en") {
    const seen = seenAt ? ` Today's appeared yesterday at ${seenAt}.` : "";
    return `Tomorrow's electricity price, ${d}, **is not published yet**. Red Eléctrica publishes it every day **before ${PUBLISH_DEADLINE}** (Spanish time). This page is re-read every 15 minutes and shows it once it appears in REData.${seen}`;
  }
  const seen = seenAt ? ` Los de hoy aparecieron ayer a las ${seenAt}.` : "";
  return `El precio de la luz de mañana, ${d}, **aún no está publicado**. Red Eléctrica lo publica cada día **antes de las ${PUBLISH_DEADLINE} h**. Esta página se vuelve a leer cada 15 minutos y lo muestra en cuanto aparece en REData.${seen}`;
}

/** On the today page: is tomorrow out? */
export function tomorrowTeaser(tomorrow: DaySummary | null, tomorrowDate: string, locale: Locale): string {
  const link = pvpcPath(locale, "tomorrow");
  if (tomorrow) {
    const c = tomorrow.cheapest;
    if (locale === "ca") return `**Demà (${dayMonth(tomorrowDate, locale)}) ja està publicat**: més barata ${hourSpan(c, locale)} (${kwhUnit(c.price, locale)}), mitjana ${kwhUnit(tomorrow.average, locale)}. [Preu de demà hora a hora](${link})`;
    if (locale === "en") return `**Tomorrow (${dayMonth(tomorrowDate, locale)}) is out**: cheapest ${hourSpan(c, locale)} (${kwhUnit(c.price, locale)}), average ${kwhUnit(tomorrow.average, locale)}. [Tomorrow hour by hour](${link})`;
    return `**Mañana (${dayMonth(tomorrowDate, locale)}) ya está publicado**: más barata ${hourSpan(c, locale)} (${kwhUnit(c.price, locale)}), media ${kwhUnit(tomorrow.average, locale)}. [Precio de mañana hora a hora](${link})`;
  }
  if (locale === "ca") return `El preu de demà es publica cada dia abans de les ${PUBLISH_DEADLINE} h. [Preu de la llum demà](${link})`;
  if (locale === "en") return `Tomorrow's price is published every day before ${PUBLISH_DEADLINE}. [Electricity price tomorrow](${link})`;
  return `El precio de mañana se publica cada día antes de las ${PUBLISH_DEADLINE} h. [Precio de la luz mañana](${link})`;
}

/** On the tomorrow page before publication: today's figures, linked. */
export function todayTeaser(today: DaySummary, locale: Locale): string {
  const link = pvpcPath(locale, "today");
  const c = today.cheapest;
  if (locale === "ca") return `Mentrestant, **avui** la llum és més barata ${hourSpan(c, locale)} (${kwhUnit(c.price, locale)}) i la mitjana és ${kwhUnit(today.average, locale)}. [Preu d'avui hora a hora](${link})`;
  if (locale === "en") return `Meanwhile, **today** electricity is cheapest ${hourSpan(c, locale)} (${kwhUnit(c.price, locale)}) and the average is ${kwhUnit(today.average, locale)}. [Today hour by hour](${link})`;
  return `Mientras tanto, **hoy** la luz es más barata ${hourSpan(c, locale)} (${kwhUnit(c.price, locale)}) y la media es ${kwhUnit(today.average, locale)}. [Precio de hoy hora a hora](${link})`;
}

/** The note under the table on the two DST days. */
export function dstNote(hours: number, locale: Locale): string | null {
  if (hours === 24) return null;
  if (hours === 23) {
    if (locale === "ca") return "Aquest dia té 23 hores: a les 02:00 els rellotges passen a les 03:00.";
    if (locale === "en") return "This day has 23 hours: at 02:00 clocks go forward to 03:00.";
    return "Este día tiene 23 horas: a las 02:00 los relojes pasan a las 03:00.";
  }
  if (locale === "ca") return "Aquest dia té 25 hores: a les 03:00 els rellotges tornen a les 02:00, i l'hora de 02:00 a 03:00 té dos preus.";
  if (locale === "en") return "This day has 25 hours: at 03:00 clocks go back to 02:00, so the 02:00–03:00 hour has two prices.";
  return "Este día tiene 25 horas: a las 03:00 los relojes vuelven a las 02:00, y la hora de 02:00 a 03:00 tiene dos precios.";
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

export function pvpcTitle(locale: Locale, view: "today" | "tomorrow", date: string | null): string {
  if (view === "today") {
    if (!date) return locale === "ca" ? "Preu de la llum avui i demà per hores (PVPC)" : locale === "en" ? "Electricity price in Spain today and tomorrow by hour (PVPC)" : "Precio de la luz hoy y mañana por horas (PVPC)";
    const dm = dayMonth(date, locale);
    if (locale === "ca") return `Preu de la llum avui ${dm}: hores més barates (PVPC)`;
    if (locale === "en") return `Electricity price in Spain today, ${dm}: cheapest hours (PVPC)`;
    return `Precio de la luz hoy ${dm}: horas más baratas (PVPC)`;
  }
  const dm = date ? dayMonth(date, locale) : "";
  if (locale === "ca") return `Preu de la llum demà${dm ? ` ${dm}` : ""} per hores (PVPC)`;
  if (locale === "en") return `Electricity price in Spain tomorrow${dm ? `, ${dm},` : ""} by hour (PVPC)`;
  return `Precio de la luz mañana${dm ? ` ${dm}` : ""} por horas (PVPC)`;
}

export function pvpcDescription(locale: Locale, view: "today" | "tomorrow", s: DaySummary | null, date: string): string {
  const when = `${weekdayName(date, locale)} ${dayMonth(date, locale)}`;
  if (s) {
    const at = locale === "en" ? "at" : "a";
    const c = `${hourRange(s.cheapest, locale)} ${at} ${kwhUnit(s.cheapest.price, locale)}`;
    const x = `${hourRange(s.dearest, locale)} ${at} ${kwhUnit(s.dearest.price, locale)}`;
    if (locale === "ca") return `Llum PVPC ${view === "today" ? "avui" : "demà"} ${when} (REE): més barata ${c}, més cara ${x}, mitjana ${kwhUnit(s.average, locale)}. Taula per hores.`;
    if (locale === "en") return `Spain PVPC electricity ${view === "today" ? "today" : "tomorrow"}, ${when} (REE): cheapest ${c}, dearest ${x}, average ${kwhUnit(s.average, locale)}. Hourly table.`;
    return `Luz PVPC ${view === "today" ? "hoy" : "mañana"} ${when} (REE): más barata ${c}, más cara ${x}, media ${kwhUnit(s.average, locale)}. Tabla por horas.`;
  }
  if (view === "tomorrow") {
    if (locale === "ca") return `Preu de la llum demà, ${when}, per hores (PVPC). REE el publica cada dia abans de les ${PUBLISH_DEADLINE} h; aquí el veus quan surt, amb les hores més barates.`;
    if (locale === "en") return `Spain's electricity price tomorrow, ${when}, by hour (PVPC). REE publishes it before ${PUBLISH_DEADLINE} every day; see it here once out, cheapest hours first.`;
    return `Precio de la luz mañana, ${when}, por horas (PVPC). REE lo publica cada día antes de las ${PUBLISH_DEADLINE} h; aquí lo ves en cuanto sale, con las horas más baratas.`;
  }
  if (locale === "ca") return "Preu de la llum PVPC d'avui i de demà hora a hora, segons Red Eléctrica: hores més barates i més cares, preu mitjà i hores punta, pla i vall de la tarifa 2.0TD.";
  if (locale === "en") return "Spain's PVPC electricity price today and tomorrow, hour by hour, from Red Eléctrica: cheapest and dearest hours, the daily average and the 2.0TD peak and off-peak hours.";
  return "Precio de la luz PVPC de hoy y mañana hora a hora, según Red Eléctrica: horas más baratas y más caras, precio medio y horas punta, llano y valle de la tarifa 2.0TD.";
}

/* -------------------------------------------------------------------------- */
/* Guidance                                                                   */
/* -------------------------------------------------------------------------- */

export function publishParagraphs(locale: Locale): string[] {
  if (locale === "ca") {
    return [
      `El preu de demà surt de la subhasta del mercat diari d'OMIE, que tanca a les 12:00, i dels altres components que calcula Red Eléctrica. El procediment d'operació 14.12 obliga REE a publicar-los [abans de les ${PUBLISH_DEADLINE} h de cada dia](${URLS.po1412}) per a totes les hores de l'endemà, i REE diu que publica les tarifes 2.0TD [cada dia a les ${PUBLISH_DEADLINE} h](${URLS.reePvpc}).`,
      "El que veus aquí es llegeix de l'API oberta REData de REE, que el recull uns minuts més tard. Aquesta pàgina es torna a generar cada 15 minuts, així que pot trigar fins a uns 40 minuts més a sortir aquí.",
    ];
  }
  if (locale === "en") {
    return [
      `Tomorrow's price comes from OMIE's day-ahead auction, which closes at 12:00, plus the other components Red Eléctrica computes. Operation procedure 14.12 requires REE to publish them [before ${PUBLISH_DEADLINE} every day](${URLS.po1412}) for every hour of the next day, and REE says it publishes the 2.0TD prices [every day at ${PUBLISH_DEADLINE}](${URLS.reePvpc}).`,
      "What you see here is read from REE's open REData API, which carries it a few minutes later. This page is rebuilt every 15 minutes, so it can take up to about 40 minutes more to show here.",
    ];
  }
  return [
    `El precio de mañana sale de la subasta del mercado diario de OMIE, que cierra a las 12:00, y de los demás componentes que calcula Red Eléctrica. El procedimiento de operación 14.12 obliga a REE a publicarlos [antes de las ${PUBLISH_DEADLINE} h de cada día](${URLS.po1412}) para todas las horas del día siguiente, y REE dice que publica las tarifas 2.0TD [cada día a las ${PUBLISH_DEADLINE} h](${URLS.reePvpc}).`,
    "Lo que ves aquí se lee de la API abierta REData de REE, que lo recoge unos minutos después. Esta página se vuelve a generar cada 15 minutos, así que puede tardar hasta unos 40 minutos más en salir aquí.",
  ];
}

export function whatParagraphs(locale: Locale): string[] {
  if (locale === "ca") {
    return [
      `El **PVPC** (preu voluntari per al petit consumidor) és la tarifa regulada de la llum: el preu canvia cada hora i el fixa la norma, no l'empresa. Només el poden tenir els subministraments de fins a **10 kW** de potència i 1 kV, de persones físiques i microempreses, i només el venen les **comercialitzadores de referència** ([Reial decret 216/2014, art. 5](${URLS.rd216})).`,
      `Des del 2024 una part del cost de l'energia es lliga als mercats a termini: el 55 % als futurs i el 45 % al mercat diari i intradiari (art. 9, redacció del Reial decret 446/2023). Per això el preu de cada hora es mou menys que el del mercat diari.`,
      "Si tens un contracte del **mercat lliure**, pagues el preu que diu el teu contracte: aquests preus horaris no són els teus (tret que el contracte s'indexi al mercat). Si tens PVPC, la factura ho diu a les dades del contracte.",
    ];
  }
  if (locale === "en") {
    return [
      `The **PVPC** (voluntary price for small consumers) is Spain's regulated electricity tariff: the price changes every hour and is set by the rules, not by the supplier. Only supplies up to **10 kW** of contracted power at no more than 1 kV, held by individuals or micro-enterprises, can have it, and only the **reference suppliers** (comercializadoras de referencia) sell it ([Royal Decree 216/2014, art. 5](${URLS.rd216})).`,
      "Since 2024 part of the energy cost is tied to forward markets: 55% to futures and 45% to the day-ahead and intraday markets (art. 9, as amended by Royal Decree 446/2023). That is why each hour's price moves less than the day-ahead market.",
      "On a **free-market** contract (mercado libre) you pay what your contract says: these hourly prices are not yours unless your contract is indexed to the market. If you are on the PVPC, the contract details on your bill say so.",
    ];
  }
  return [
    `El **PVPC** (precio voluntario para el pequeño consumidor) es la tarifa regulada de la luz: el precio cambia cada hora y lo fija la norma, no la empresa. Solo pueden tenerlo los suministros de hasta **10 kW** de potencia y 1 kV, de personas físicas y microempresas, y solo lo venden las **comercializadoras de referencia** ([Real Decreto 216/2014, art. 5](${URLS.rd216})).`,
    "Desde 2024 una parte del coste de la energía se liga a los mercados a plazo: el 55 % a los futuros y el 45 % al mercado diario e intradiario (art. 9, redacción del Real Decreto 446/2023). Por eso el precio de cada hora se mueve menos que el del mercado diario.",
    "Si tienes un contrato del **mercado libre**, pagas el precio que dice tu contrato: estos precios horarios no son los tuyos (salvo que el contrato esté indexado al mercado). Si tienes PVPC, la factura lo indica en los datos del contrato.",
  ];
}

/** Rows of the 2.0TD period table: [period, mainland/islands, Ceuta/Melilla]. */
export function periodRows(locale: Locale): [string, string, string][] {
  const n = PERIOD_NAME[locale];
  if (locale === "ca") {
    return [
      [`${n.punta} (P1)`, "10–14 h i 18–22 h", "11–15 h i 19–23 h"],
      [`${n.llano} (P2)`, "8–10 h, 14–18 h i 22–24 h", "8–11 h, 15–19 h i 23–24 h"],
      [`${n.valle} (P3)`, "0–8 h; dissabtes, diumenges i festius nacionals, tot el dia", "0–8 h; dissabtes, diumenges i festius nacionals, tot el dia"],
    ];
  }
  if (locale === "en") {
    return [
      [`${n.punta} (P1)`, "10:00–14:00 and 18:00–22:00", "11:00–15:00 and 19:00–23:00"],
      [`${n.llano} (P2)`, "08:00–10:00, 14:00–18:00 and 22:00–24:00", "08:00–11:00, 15:00–19:00 and 23:00–24:00"],
      [`${n.valle} (P3)`, "00:00–08:00; all day on Saturdays, Sundays and national holidays", "00:00–08:00; all day on Saturdays, Sundays and national holidays"],
    ];
  }
  return [
    [`${n.punta} (P1)`, "10–14 h y 18–22 h", "11–15 h y 19–23 h"],
    [`${n.llano} (P2)`, "8–10 h, 14–18 h y 22–24 h", "8–11 h, 15–19 h y 23–24 h"],
    [`${n.valle} (P3)`, "0–8 h; sábados, domingos y festivos nacionales, todo el día", "0–8 h; sábados, domingos y festivos nacionales, todo el día"],
  ];
}

export function periodNotes(locale: Locale): string[] {
  if (locale === "ca") {
    return [
      `Horari de dilluns a divendres, en hora local de cada sistema ([Circular 3/2020 de la CNMC, art. 7.3](${URLS.circular})). Són vall tot el dia els dissabtes, els diumenges, el 6 de gener i els festius nacionals de data fixa que no es poden substituir: 1 de gener, 1 de maig, 15 d'agost, 12 d'octubre, 1 de novembre, 6 i 8 de desembre i 25 de desembre. No ho són els festius autonòmics o locals, ni el Divendres Sant (no té data fixa).`,
      "Els períodes són els dels peatges i càrrecs, i valen per a tothom amb tarifa 2.0TD, també al mercat lliure. El preu PVPC de cada hora ja els inclou: per això a les hores punta és més car.",
    ];
  }
  if (locale === "en") {
    return [
      `Monday to Friday, in each system's local time ([CNMC Circular 3/2020, art. 7.3](${URLS.circular})). Off-peak all day: Saturdays, Sundays, 6 January and the fixed-date national holidays that cannot be swapped: 1 January, 1 May, 15 August, 12 October, 1 November, 6 and 8 December and 25 December. Regional and local holidays are not, and nor is Good Friday (no fixed date).`,
      "These are the toll and charge periods and apply to everyone on the 2.0TD tariff, free-market contracts included. The hourly PVPC already includes them, which is why peak hours cost more.",
    ];
  }
  return [
    `Horario de lunes a viernes, en hora local de cada sistema ([Circular 3/2020 de la CNMC, art. 7.3](${URLS.circular})). Son valle todo el día los sábados, los domingos, el 6 de enero y los festivos nacionales de fecha fija que no se pueden sustituir: 1 de enero, 1 de mayo, 15 de agosto, 12 de octubre, 1 de noviembre, 6 y 8 de diciembre y 25 de diciembre. No lo son los festivos autonómicos o locales, ni el Viernes Santo (no tiene fecha fija).`,
    "Los periodos son los de los peajes y cargos, y valen para todo el que tenga tarifa 2.0TD, también en el mercado libre. El precio PVPC de cada hora ya los incluye: por eso en las horas punta es más caro.",
  ];
}

export function includesParagraphs(locale: Locale): string[] {
  if (locale === "ca") {
    return [
      "Cada xifra és el **terme d'energia del PVPC 2.0TD**: el cost de produir l'energia més els peatges i càrrecs d'aquest terme, en €/kWh (REE la publica en €/MWh; aquí està dividida per 1.000, sense arrodonir més enllà de quatre decimals).",
      "**No inclou** el terme de potència, l'impost especial sobre l'electricitat, l'IVA ni el lloguer del comptador, que la factura suma a part.",
    ];
  }
  if (locale === "en") {
    return [
      "Each figure is the **PVPC 2.0TD energy term**: the cost of producing the energy plus that term's tolls and charges, in €/kWh (REE publishes it in €/MWh; here it is divided by 1,000 and shown to four decimals).",
      "It **does not include** the power term, the electricity tax, VAT or meter rental, which the bill adds separately.",
    ];
  }
  return [
    "Cada cifra es el **término de energía del PVPC 2.0TD**: el coste de producir la energía más los peajes y cargos de ese término, en €/kWh (REE lo publica en €/MWh; aquí está dividido entre 1.000 y con cuatro decimales).",
    "**No incluye** el término de potencia, el impuesto especial sobre la electricidad, el IVA ni el alquiler del contador, que la factura suma aparte.",
  ];
}

export function bonoParagraphs(locale: Locale): string[] {
  if (locale === "ca") {
    return [`El bo social elèctric només s'aplica amb el **PVPC contractat amb una comercialitzadora de referència** i una potència de **10 kW o menys**. Requisits, descomptes i com demanar-lo: [CNMC](${URLS.bonoCnmc}) i [Ministeri per a la Transició Ecològica](${URLS.bonoMiteco}).`];
  }
  if (locale === "en") {
    return [`The bono social (the discount for vulnerable consumers) only applies with the **PVPC contracted with a reference supplier** and contracted power of **10 kW or less**. Requirements, discounts and how to apply: [CNMC](${URLS.bonoCnmc}) and [Ministry for the Ecological Transition](${URLS.bonoMiteco}).`];
  }
  return [`El bono social eléctrico solo se aplica con el **PVPC contratado con una comercializadora de referencia** y una potencia de **10 kW o menos**. Requisitos, descuentos y cómo pedirlo: [CNMC](${URLS.bonoCnmc}) y [Ministerio para la Transición Ecológica](${URLS.bonoMiteco}).`];
}

export function quarterParagraphs(locale: Locale): string[] {
  if (locale === "ca") {
    return [`Des de l'1 d'octubre de 2025 el mercat diari d'OMIE fixa [96 preus de 15 minuts cada dia](${URLS.omie15}). El PVPC que publica Red Eléctrica continua sent **un preu per hora**: 24 al dia (23 o 25 els dies del canvi d'hora). Aquesta pàgina mostra aquests preus horaris.`];
  }
  if (locale === "en") {
    return [`Since 1 October 2025 OMIE's day-ahead market sets [96 quarter-hour prices a day](${URLS.omie15}). The PVPC published by Red Eléctrica is still **one price per hour**: 24 a day (23 or 25 on clock-change days). This page shows those hourly prices.`];
  }
  return [`Desde el 1 de octubre de 2025 el mercado diario de OMIE fija [96 precios cuartohorarios al día](${URLS.omie15}). El PVPC que publica Red Eléctrica sigue siendo **un precio por hora**: 24 al día (23 o 25 los días del cambio de hora). Esta página muestra esos precios horarios.`];
}

export interface SourceItem {
  name: string;
  publisher: string;
  url: string;
  note: string;
}

export function sources(locale: Locale): SourceItem[] {
  const t = {
    es: ["serie PVPC 2.0TD (1001), por horas, €/MWh", "fichero diario, columnas PCB y CYM", "hora de publicación (§4)", "periodos 2.0TD (art. 7.3)", "quién puede tener PVPC (art. 5)", "mercado cuartohorario", "requisitos", "cita la fuente y la fecha de actualización"],
    ca: ["sèrie PVPC 2.0TD (1001), per hores, €/MWh", "fitxer diari, columnes PCB i CYM", "hora de publicació (§4)", "períodes 2.0TD (art. 7.3)", "qui pot tenir PVPC (art. 5)", "mercat de 15 minuts", "requisits", "cita la font i la data d'actualització"],
    en: ["PVPC 2.0TD series (1001), hourly, €/MWh", "daily file, PCB and CYM columns", "publication time (§4)", "2.0TD periods (art. 7.3)", "who can be on the PVPC (art. 5)", "quarter-hour market", "requirements", "cite the source and the update date"],
  }[locale];
  return [
    { name: "REData API — precios-mercados-tiempo-real", publisher: "Red Eléctrica", url: URLS.redata, note: t[0]! },
    { name: "e·sios — PVPC", publisher: "Red Eléctrica", url: URLS.esiosPvpc, note: t[1]! },
    { name: "Procedimiento de operación 14.12 (BOE-A-2023-15276)", publisher: "BOE", url: URLS.po1412, note: t[2]! },
    { name: "Circular 3/2020 de la CNMC (BOE-A-2020-1066)", publisher: "BOE", url: URLS.circular, note: t[3]! },
    { name: "Real Decreto 216/2014 (BOE-A-2014-3376)", publisher: "BOE", url: URLS.rd216, note: t[4]! },
    { name: "Nota de prensa MTU15, 1 oct 2025", publisher: "OMIE", url: URLS.omie15, note: t[5]! },
    { name: "Bono social eléctrico", publisher: "CNMC", url: URLS.bonoCnmc, note: t[6]! },
    { name: "Legal notice §5.1", publisher: "Red Eléctrica", url: URLS.reeLegal, note: t[7]! },
  ];
}

