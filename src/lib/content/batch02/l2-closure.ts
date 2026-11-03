import type { Block } from "@/lib/content/blocks";
import { addDays, shortDate } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";
import { hubPath as rodaliesHub, linePath } from "@/lib/programmatic/rodalies/paths";

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
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";
import { STRIKE_11N_DATE } from "./strike-11n";

/**
 * Metro L2 closed between La Pau and Gorg for works: a utility page for the
 * commuters of Verneda, Artigues | Sant Adrià, Sant Roc and Badalona, on
 * year-free URLs (the same pages record the closure once it is over).
 *
 * Every fact was read on 3 Nov 2026 on official pages only:
 *  - TMB's service notice "Afectacions a l'L2 de metro" (tmb.cat/{ca,es,en}/-/
 *    avis-tall-l2): no service "des del 2 de novembre, i fins a la
 *    finalització del servei del 3 de desembre de 2026"; the line runs
 *    Paral·lel-La Pau and Gorg-Badalona | Pompeu Fabra; a shuttle bus between
 *    La Pau and Gorg stops at the stations of the section "amb el mateix
 *    horari de metro", "no fa falta validar el bitllet"; intervals 3-5 min on
 *    weekdays, 5-9 on Saturdays, 7-11 on holidays; the stop numbers and names
 *    in each direction; alternatives: L10 Nord to Gorg from La Sagrera (L1,
 *    L5), L1 to Clot to continue on the L2, TMB's H10 between La Pau and
 *    Gorg, TUSGSAL's B25, M26, M30 and N11, Rodalies R1 between Clot and
 *    Badalona Pompeu Fabra. Its information line 900 701 149 is printed
 *    without hours: the Catalan notice says 8 to 21 h, the Spanish and
 *    English ones 7 to 21 h.
 *  - TMB's metro status alert (the one tmb.cat's "Estat de la xarxa de
 *    metro" shows): "fins al 3 de desembre inclòs ... A l'inici del servei
 *    del dia 4 de desembre, el servei quedarà restablert."
 *  - TMB's press note and the City Council's, both of 29 Oct 2026, word for
 *    word the same: stations without service Verneda, Artigues / Sant Adrià
 *    and Sant Roc; works on the infrastructure after "una incidència a la
 *    plataforma de la via"; alternatives L4 (La Pau), L10 (Gorg), tram T4, T5
 *    and T6, Rodalies R1 and the H10; "Es preveu la normalització de la
 *    circulació de trens el divendres 4 de desembre a les 5 de la matinada."
 *  - TMB's line catalogue on tmb.cat: the shuttle is line M2, "Especial L2 La
 *    Pau/Gorg".
 *  - TMB's bus status (tmb.cat "Estat de la xarxa de bus"): the H10 is
 *    diverted for street works on Avinguda d'Alfons XIII, with stops such as
 *    Barri Artigues and La Salut / Congrés cancelled.
 *
 * So the sources do not disagree: 3 December is the last day without trains
 * (TMB's notice and alert), 4 December at 5:00 the expected return (TMB's and
 * the council's press note). Press headlines say "fins al 3 de desembre".
 *
 * Left out on purpose: the cause the press gives (a crack under the Besòs:
 * not in any official text), tram stops and Rodalies stations TMB does not
 * name, journey times, whether the shuttle is accessible, and any fare rule
 * beyond "no need to validate".
 *
 * HOW TO UPDATE:
 *  - TMB changes the dates (an extension, an early end): move L2_CLOSURE
 *    (and barcelona-december.ts L2_WORKS, which a test holds to the same
 *    days), re-read the notice, move L2_CLOSURE_AS_OF, run the tests, deploy,
 *    publish `?only=l2-closure`, then `?only=hours` and `?only=cards` (their
 *    sentence reads these dates).
 *  - The day trains are back (from 4 December the test "the page says the
 *    L2 is back once the closure is over" fails while L2_REOPENED is null):
 *    check TMB (the notice gone from its service notices, the status alert
 *    gone, or a note saying service is restored), fill L2_REOPENED with the
 *    day, the official URL and the read date, move L2_CLOSURE_AS_OF, run the
 *    tests, deploy, publish `?only=l2-closure`, `?only=hours` and
 *    `?only=cards`. Title, description, lead and FAQ switch to "reopened on".
 *
 * No new photograph: the hero is the metro hours guide's lead picture, with
 * its exact alt text and caption (media rows are keyed by file). It is typed
 * here rather than imported because hours.ts imports this module for its
 * sentence; a test holds the two equal.
 */

/** The day the page was last brought up to date. Every "checked" line reads this, never the clock. */
export const L2_CLOSURE_AS_OF = "2026-11-03";

/** The facts were re-read on the sources on the as-of day: one constant to move. */
export const L2_CLOSURE_VERIFIED = L2_CLOSURE_AS_OF;

/** The closure as TMB and the City Council announced it (29 Oct 2026, read 3 Nov 2026). */
export const L2_CLOSURE = {
  /** First day without trains between La Pau and Gorg (Monday). */
  from: "2026-11-02",
  /** Last day without trains: "fins a la finalització del servei del 3 de desembre" (Thursday). */
  until: "2026-12-03",
  /** Trains expected back: "el divendres 4 de desembre a les 5 de la matinada". */
  back: "2026-12-04",
  backTime: "5:00",
  /** The press notes' date. */
  announced: "2026-10-29",
} as const;

/** The three stations left without metro, as TMB's notice writes them. */
export const CLOSED_STATIONS = ["Verneda", "Artigues | Sant Adrià", "Sant Roc"] as const;

export interface ShuttleStop {
  /** The metro station the stop stands in for. */
  station: string;
  /** TMB's stop number. */
  code: number;
  /** TMB's stop name, as written in the notice. */
  name: string;
}

/** The replacement bus, from TMB's notice and line catalogue. */
export const SHUTTLE = {
  line: "M2",
  lineName: "Especial L2 La Pau/Gorg",
  /** Interval between buses, in minutes, as TMB gives it. */
  minutes: { weekdays: [3, 5], saturdays: [5, 9], holidays: [7, 11] },
  towardsGorg: [
    { station: "La Pau", code: 3343, name: "Metro La Pau" },
    { station: "Verneda", code: 3945, name: "Arc de Sant Adrià - Tanatori" },
    { station: "Artigues | Sant Adrià", code: 3340, name: "Sant Adrià Centre" },
    { station: "Sant Roc", code: 8411, name: "Marques de Montroig, 221" },
    { station: "Gorg", code: 8691, name: "Metro Gorg" },
  ],
  towardsLaPau: [
    { station: "Gorg", code: 8691, name: "Metro Gorg" },
    { station: "Sant Roc", code: 8689, name: "Sant Roc" },
    { station: "Artigues | Sant Adrià", code: 329, name: "Sant Adrià Centre" },
    { station: "Verneda", code: 3944, name: "La Verneda - Arc de Sant Adrià - Tanatori" },
    { station: "La Pau", code: 9363, name: "La Pau" },
  ],
} as const satisfies {
  line: string;
  lineName: string;
  minutes: Record<"weekdays" | "saturdays" | "holidays", readonly [number, number]>;
  towardsGorg: readonly ShuttleStop[];
  towardsLaPau: readonly ShuttleStop[];
};

/** Other operators' buses TMB's notice lists (TUSGSAL). */
export const TUSGSAL_LINES = ["B25", "M26", "M30", "N11"] as const;
/** Tram lines the press notes list. */
export const TRAM_LINES = ["T4", "T5", "T6"] as const;
/** H10 stops TMB lists as cancelled while the line is diverted on Avinguda d'Alfons XIII (two of them, named on the page). */
export const H10_CANCELLED_NAMED = ["Barri Artigues", "La Salut / Congrés"] as const;

export const L2_URLS = {
  notice: {
    ca: "https://www.tmb.cat/ca/-/avis-tall-l2",
    es: "https://www.tmb.cat/es/-/avis-tall-l2",
    en: "https://www.tmb.cat/en/-/avis-tall-l2",
  },
  metroStatus: "https://www.tmb.cat/ca/transport-barcelona/estat-xarxa-metro",
  busStatus: "https://www.tmb.cat/ca/transport-barcelona/estat-xarxa-bus",
  serviceNotices: {
    ca: "https://www.tmb.cat/ca/transport-barcelona/avisos-servei",
    es: "https://www.tmb.cat/es/transporte-barcelona/avisos-servicio",
    en: "https://www.tmb.cat/en/barcelona-transport/service-notices",
  },
  tmbPress: "https://noticies.tmb.cat/sala-de-premsa/suspensio-servei-ll2-de-metro-entre-pau-gorg-des-dilluns-2-de-novembre-fins-dijous-3",
  council: "https://ajuntament.barcelona.cat/premsa/2026/10/29/suspensio-del-servei-a-ll2-de-metro-entre-la-pau-i-gorg-des-del-dilluns-2-de-novembre-fins-al-dijous-3-de-desembre/",
  shuttleLine: "https://www.tmb.cat/ca/barcelona/autobusos/-/lineabus/M2",
  h10: "https://www.tmb.cat/ca/barcelona/autobusos/-/lineabus/H10",
} as const;

/* -------------------------------------------------------------------------- */
/* The dated state                                                            */
/* -------------------------------------------------------------------------- */

/** What TMB (or the City Council) says once trains are back. */
export interface L2Reopening {
  /** First day with trains again between La Pau and Gorg. */
  date: string;
  /** The official page that says so (tmb.cat or barcelona.cat). */
  url: string;
  /** The day it was read. */
  read: string;
}

/**
 * Fill when TMB confirms the trains are back (see HOW TO UPDATE). Cast so the
 * compiler keeps the full type: a bare `null` would narrow every use to never.
 */
export const L2_REOPENED = null as L2Reopening | null;

export const OFFICIAL_HOSTS = /(^|\.)(tmb\.cat|barcelona\.cat)$/;

export type L2Phase = "closed" | "reopened";

export function l2Phase(reopened: L2Reopening | null = L2_REOPENED): L2Phase {
  return reopened ? "reopened" : "closed";
}

/**
 * True once `today` is the expected return day or later while the page still
 * says the line is closed: the day after the last closed day, someone has to
 * check TMB and switch the page (or move the dates if TMB extended them).
 */
export function isStale(
  today: string,
  reopened: L2Reopening | null = L2_REOPENED,
  closure: { back: string } = L2_CLOSURE,
): boolean {
  return reopened === null && today >= closure.back;
}

/** What is wrong with a reopening slot before it can be published. */
export function reopeningProblems(reopened: L2Reopening): string[] {
  const problems: string[] = [];
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const valid = (value: string) => iso.test(value) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
  if (!valid(reopened.date)) problems.push(`date ${reopened.date} is not an ISO date`);
  else if (reopened.date <= L2_CLOSURE.from) problems.push(`date ${reopened.date} is not after the closure began (${L2_CLOSURE.from})`);
  if (!valid(reopened.read)) problems.push(`read ${reopened.read} is not an ISO date`);
  else if (valid(reopened.date) && reopened.read < reopened.date) problems.push(`read ${reopened.read} is before the reopening it reports`);
  try {
    const url = new URL(reopened.url);
    if (url.protocol !== "https:") problems.push(`${reopened.url} is not https`);
    if (!OFFICIAL_HOSTS.test(url.host)) problems.push(`${url.host} is not TMB's or the City Council's site`);
    if (/[?&]utm_/.test(reopened.url)) problems.push(`${reopened.url} carries tracking`);
  } catch {
    problems.push(`${reopened.url} is not a URL`);
  }
  return problems;
}

/* -------------------------------------------------------------------------- */
/* Wording helpers                                                            */
/* -------------------------------------------------------------------------- */

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function joinList(items: readonly string[], locale: Locale): string {
  const and = { ca: " i ", es: " y ", en: " and " }[locale];
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")}${and}${items[items.length - 1]}`;
}

const STATIONS: Record<Locale, string> = {
  ca: joinList(CLOSED_STATIONS, "ca"),
  es: joinList(CLOSED_STATIONS, "es"),
  en: joinList(CLOSED_STATIONS, "en"),
};

function minutes(range: readonly [number, number], locale: Locale): string {
  const [a, b] = range;
  return { ca: `${a} a ${b} minuts`, es: `${a} a ${b} minutos`, en: `${a} to ${b} minutes` }[locale];
}

const link = (label: string, url: string) => `[${label}](${url})`;

/** The R1's live page: a line page in Catalan and Spanish, the hub in English. */
function r1Page(locale: Locale): string {
  return locale === "en" ? rodaliesHub("en") : linePath(locale, "R1");
}

/** The last day without trains, when the reopening came on another day than planned. */
function lastClosedDay(reopened: L2Reopening): string {
  return addDays(reopened.date, -1);
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

export function l2Sources(reopened: L2Reopening | null = L2_REOPENED): B2Source[] {
  const sources: B2Source[] = [
    { name: "Afectacions a l'L2 de metro: tram La Pau - Gorg sense servei", url: L2_URLS.notice.ca, publisher: "TMB" },
    { name: "Afectaciones en la L2 de metro: tramo La Pau - Gorg sin servicio", url: L2_URLS.notice.es, publisher: "TMB" },
    { name: "Disruptions on metro L2: La Pau - Gorg section out of service", url: L2_URLS.notice.en, publisher: "TMB" },
    { name: "Estat de la xarxa de metro", url: L2_URLS.metroStatus, publisher: "TMB" },
    { name: "Suspensió del servei a l'L2 de metro entre La Pau i Gorg des del dilluns 2 de novembre fins al dijous 3 de desembre", url: L2_URLS.tmbPress, publisher: "TMB Notícies" },
    { name: "Suspensió del servei a l'L2 de metro entre La Pau i Gorg (nota de premsa, 29 d'octubre de 2026)", url: L2_URLS.council, publisher: "Ajuntament de Barcelona" },
    { name: "Línia M2: Especial L2 La Pau/Gorg", url: L2_URLS.shuttleLine, publisher: "TMB" },
    { name: "Línia H10", url: L2_URLS.h10, publisher: "TMB" },
    { name: "Estat de la xarxa de bus", url: L2_URLS.busStatus, publisher: "TMB" },
    { name: "Avisos de servei", url: L2_URLS.serviceNotices.ca, publisher: "TMB" },
  ];
  if (reopened && !sources.some((source) => source.url === reopened.url)) {
    sources.unshift({ name: "L2: servei restablert entre La Pau i Gorg", url: reopened.url, publisher: new URL(reopened.url).host.endsWith("tmb.cat") ? "TMB" : "Ajuntament de Barcelona" });
  }
  return sources;
}

/* -------------------------------------------------------------------------- */
/* Titles and snippets                                                        */
/* -------------------------------------------------------------------------- */

type Meta = { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string };

const PATHS: Record<Locale, string> = {
  ca: "guies/l2-metro-tall-la-pau-gorg",
  es: "guias/l2-metro-cortada-la-pau-gorg",
  en: "guides/barcelona-metro-l2-closure",
};

/** The first candidate that fits (a later date can be a character or two longer). */
function fit(candidates: string[], max = 60): string {
  return candidates.find((candidate) => candidate.length <= max) ?? candidates[candidates.length - 1]!;
}

export function l2SeoTitle(locale: Locale, reopened: L2Reopening | null = L2_REOPENED): string {
  if (reopened) {
    const day = shortDate(reopened.date, locale);
    return {
      ca: fit([`L2 La Pau–Gorg reoberta el ${day}: torna el metro`, `L2 La Pau–Gorg reoberta el ${day}`]),
      es: fit([`L2 La Pau–Gorg reabierta el ${day}: vuelve el metro`, `L2 La Pau–Gorg reabierta el ${day}`]),
      en: fit([`Barcelona metro L2 La Pau–Gorg reopened on ${day}`, `Metro L2 La Pau–Gorg reopened on ${day}`]),
    }[locale];
  }
  const until = shortDate(L2_CLOSURE.until, locale);
  return {
    ca: fit([`L2 tallada La Pau–Gorg fins al ${until}: bus llançadora`, `L2 tallada La Pau–Gorg fins al ${until}`]),
    es: fit([`L2 metro cortada La Pau–Gorg hasta el ${until}`, `L2 cortada La Pau–Gorg hasta el ${until}`]),
    en: fit([`Barcelona metro L2 closed La Pau–Gorg until ${until}`, `Metro L2 closed La Pau–Gorg until ${until}`]),
  }[locale];
}

export function l2Description(locale: Locale, reopened: L2Reopening | null = L2_REOPENED): string {
  if (reopened) {
    const day = shortDate(reopened.date, locale);
    return {
      ca: fit([`L'L2 torna a circular entre La Pau i Gorg des del ${day}: ${STATIONS.ca} tornen a tenir metro. Dates del tall.`, `L'L2 torna a circular entre La Pau i Gorg des del ${day}: ${STATIONS.ca} tornen a tenir metro.`], 155),
      es: fit([`La L2 vuelve a circular entre La Pau y Gorg desde el ${day}: ${STATIONS.es} vuelven a tener metro. Fechas del corte.`, `La L2 vuelve a circular entre La Pau y Gorg desde el ${day}: ${STATIONS.es} vuelven a tener metro.`], 155),
      en: fit([`Metro L2 runs again between La Pau and Gorg from ${day}: ${STATIONS.en} have trains again. Dates of the closure.`, `Metro L2 runs again between La Pau and Gorg from ${day}: ${STATIONS.en} have trains again.`], 155),
    }[locale];
  }
  const until = shortDate(L2_CLOSURE.until, locale);
  const [a, b] = SHUTTLE.minutes.weekdays;
  return {
    ca: fit([`Sense metro a ${STATIONS.ca} fins al ${until}. Bus llançadora cada ${a}-${b} min els feiners, sense validar; o L10 Nord, L4 i R1.`, `Sense metro a ${STATIONS.ca} fins al ${until}. Llançadora cada ${a}-${b} min els feiners, sense validar; o L10 Nord, L4 i R1.`], 155),
    es: fit([`Sin metro en ${STATIONS.es} hasta el ${until}. Bus lanzadera cada ${a}-${b} min los laborables, sin validar; o L10 Nord, L4 y R1.`, `Sin metro en ${STATIONS.es} hasta el ${until}. Lanzadera cada ${a}-${b} min los laborables, sin validar; o L10 Nord, L4 y R1.`], 155),
    en: fit([`No metro at ${STATIONS.en} until ${until}. Shuttle bus every ${a}-${b} min on weekdays, no validation needed; or L10 Nord, L4, R1.`, `No metro at ${STATIONS.en} until ${until}. Shuttle every ${a}-${b} min on weekdays, no validation needed; or L10 Nord, L4, R1.`], 155),
  }[locale];
}

function l2Title(locale: Locale, reopened: L2Reopening | null): string {
  if (reopened) {
    const day = shortDate(reopened.date, locale);
    return {
      ca: `L2 entre La Pau i Gorg: el metro torna a circular des del ${day}`,
      es: `L2 entre La Pau y Gorg: el metro vuelve a circular desde el ${day}`,
      en: `Metro L2 between La Pau and Gorg: trains running again from ${day}`,
    }[locale];
  }
  const until = shortDate(L2_CLOSURE.until, locale);
  return {
    ca: `L2 tallada entre La Pau i Gorg fins al ${until}: bus llançadora, parades i alternatives`,
    es: `L2 de metro cortada entre La Pau y Gorg hasta el ${until}: bus lanzadera, paradas y alternativas`,
    en: `Barcelona metro L2 closed between La Pau and Gorg until ${until}: shuttle bus, stops and alternatives`,
  }[locale];
}

function l2Excerpt(locale: Locale, reopened: L2Reopening | null): string {
  if (reopened) {
    return {
      ca: "El tall de l'L2 entre La Pau i Gorg per obres ja ha acabat: quan va tornar el metro, quant va durar el tall i com va funcionar el bus llançadora.",
      es: "El corte de la L2 entre La Pau y Gorg por obras ya ha terminado: cuándo volvió el metro, cuánto duró el corte y cómo funcionó el bus lanzadera.",
      en: "The L2 works closure between La Pau and Gorg is over: when trains came back, how long the closure lasted and how the shuttle bus worked.",
    }[locale];
  }
  return {
    ca: "L'L2 no circula entre La Pau i Gorg per obres: estacions tancades, fins quan, el bus llançadora amb les parades i cada quant passa, i les alternatives de TMB.",
    es: "La L2 no circula entre La Pau y Gorg por obras: estaciones cerradas, hasta cuándo, el bus lanzadera con sus paradas y frecuencia, y las alternativas de TMB.",
    en: "Metro L2 is not running between La Pau and Gorg for works: closed stations, until when, the shuttle bus stops and frequency, and TMB's alternatives.",
  }[locale];
}

export function l2Meta(locale: Locale, reopened: L2Reopening | null = L2_REOPENED): Meta {
  return {
    path: PATHS[locale],
    title: l2Title(locale, reopened),
    seoTitle: l2SeoTitle(locale, reopened),
    seoDescription: l2Description(locale, reopened),
    excerpt: l2Excerpt(locale, reopened),
  };
}

/* -------------------------------------------------------------------------- */
/* The sentence other guides print (hours.ts, cards.ts)                       */
/* -------------------------------------------------------------------------- */

/**
 * One sentence with one link here, for the metro hours guide ("hours") and
 * the transport cards guide ("tickets"). It reads the same dated state as the
 * page, so it switches to "back since" when L2_REOPENED is filled.
 */
export function l2ClosureMention(locale: Locale, angle: "hours" | "tickets", reopened: L2Reopening | null = L2_REOPENED): string {
  const anchor = {
    ca: "tall de l'L2 entre La Pau i Gorg",
    es: "corte de la L2 entre La Pau y Gorg",
    en: "the L2 closure between La Pau and Gorg",
  }[locale];
  // "a la pàgina del [tall]" / "en la página del [corte]": the article stays outside the link.
  const here = `${{ ca: "la pàgina del ", es: "la página del ", en: "" }[locale]}${b2link("l2Closure", locale, anchor)}`;
  if (reopened) {
    const day = dayDate(reopened.date, locale);
    return {
      ca: `**L2:** des del ${day} torna a haver-hi metro entre La Pau i Gorg, després de les obres; tots els detalls, a ${here}.`,
      es: `**L2:** desde el ${day} vuelve a haber metro entre La Pau y Gorg, después de las obras; todos los detalles, en ${here}.`,
      en: `**L2:** trains have been running again between La Pau and Gorg since ${day}, after the works; how it went is in ${here}.`,
    }[locale];
  }
  const from = dayDate(L2_CLOSURE.from, locale, false);
  const until = dayDate(L2_CLOSURE.until, locale);
  if (angle === "hours") {
    return {
      ca: `**Obres a l'L2:** del ${from} al final del servei del ${until} no hi ha metro entre La Pau i Gorg, i el bus llançadora que el substitueix fa l'horari del metro, segons TMB. Parades, freqüència i alternatives, a ${here}.`,
      es: `**Obras en la L2:** del ${from} al final del servicio del ${until} no hay metro entre La Pau y Gorg, y el bus lanzadera que lo sustituye hace el horario del metro, según TMB. Paradas, frecuencia y alternativas, en ${here}.`,
      en: `**L2 works:** from ${from} to the end of service on ${until} there are no trains between La Pau and Gorg, and TMB says the replacement shuttle bus keeps the metro's hours. Stops, frequency and alternatives: ${here}.`,
    }[locale];
  }
  return {
    ca: `Del ${from} al final del servei del ${until} l'L2 no circula entre La Pau i Gorg, i TMB diu que per pujar al bus llançadora que la substitueix no cal validar el bitllet; parades i alternatives, a ${here}.`,
    es: `Del ${from} al final del servicio del ${until} la L2 no circula entre La Pau y Gorg, y TMB dice que para subir al bus lanzadera que la sustituye no hace falta validar el billete; paradas y alternativas, en ${here}.`,
    en: `From ${from} to the end of service on ${until} the L2 does not run between La Pau and Gorg, and TMB says you do not need to validate your ticket on the shuttle bus that replaces it; stops and alternatives: ${here}.`,
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* Body: while the line is closed                                             */
/* -------------------------------------------------------------------------- */

function stopsTable(locale: Locale): Block {
  const metro: Record<string, Record<Locale, string>> = {
    "La Pau": { ca: "Oberta: L2 cap a Paral·lel i L4", es: "Abierta: L2 hacia Paral·lel y L4", en: "Open: L2 towards Paral·lel, and L4" },
    Gorg: { ca: "Oberta: L2 cap a Badalona | Pompeu Fabra i L10 Nord", es: "Abierta: L2 hacia Badalona | Pompeu Fabra y L10 Nord", en: "Open: L2 towards Badalona | Pompeu Fabra, and L10 Nord" },
  };
  const closed = { ca: "Sense metro", es: "Sin metro", en: "No metro" }[locale];
  const stop = { ca: "Parada", es: "Parada", en: "Stop" }[locale];
  const cell = (s: ShuttleStop | undefined) => (s ? `${stop} ${s.code} - ${s.name}` : "—");
  const order = SHUTTLE.towardsGorg.map((s) => s.station);
  const rows = order.map((station) => [
    station,
    metro[station]?.[locale] ?? closed,
    cell(SHUTTLE.towardsGorg.find((s) => s.station === station)),
    cell(SHUTTLE.towardsLaPau.find((s) => s.station === station)),
  ]);
  return table(
    { ca: "Estacions del tram i parades del bus llançadora", es: "Estaciones del tramo y paradas del bus lanzadera", en: "Stations on the section and shuttle bus stops" }[locale],
    {
      ca: ["Estació", "Metro", "Bus cap a Gorg", "Bus cap a La Pau"],
      es: ["Estación", "Metro", "Bus hacia Gorg", "Bus hacia La Pau"],
      en: ["Station", "Metro", "Bus towards Gorg", "Bus towards La Pau"],
    }[locale],
    rows,
    {
      ca: `Parades i números de l'avís de TMB, llegit el ${dateYear(L2_CLOSURE_AS_OF, "ca")}. En cada sentit el bus para en una parada diferent.`,
      es: `Paradas y números del aviso de TMB, leído el ${dateYear(L2_CLOSURE_AS_OF, "es")}. En cada sentido el bus para en una parada distinta.`,
      en: `Stops and numbers from TMB's notice, read on ${dateYear(L2_CLOSURE_AS_OF, "en")}. The bus uses a different stop in each direction.`,
    }[locale],
  );
}

function intervalsTable(locale: Locale): Block {
  const m = SHUTTLE.minutes;
  return table(
    { ca: "Cada quant passa el bus llançadora", es: "Cada cuánto pasa el bus lanzadera", en: "How often the shuttle bus runs" }[locale],
    { ca: ["Dia", "Interval de pas"], es: ["Día", "Intervalo de paso"], en: ["Day", "Interval"] }[locale],
    [
      [{ ca: "Feiners", es: "Laborables", en: "Weekdays" }[locale], minutes(m.weekdays, locale)],
      [{ ca: "Dissabtes", es: "Sábados", en: "Saturdays" }[locale], minutes(m.saturdays, locale)],
      [{ ca: "Festius", es: "Festivos", en: "Holidays" }[locale], minutes(m.holidays, locale)],
    ],
    {
      ca: "Les tres franges que dona TMB a l'avís; no en detalla els diumenges a part.",
      es: "Las tres franjas que da TMB en el aviso; no detalla los domingos aparte.",
      en: "The three categories TMB's notice gives; it does not list Sundays separately.",
    }[locale],
  );
}

function closedBody(locale: Locale): Block[] {
  const c = L2_CLOSURE;
  const notice = L2_URLS.notice[locale];
  const fromDay = dayDate(c.from, locale, false);
  const untilDay = dayDate(c.until, locale);
  const backDay = dayDate(c.back, locale, false);
  const announced = dateYear(c.announced, locale);
  const [wa, wb] = SHUTTLE.minutes.weekdays;
  const tusgsal = joinList(TUSGSAL_LINES, locale);
  const trams = joinList(TRAM_LINES, locale);
  const h10Stops = joinList(H10_CANCELLED_NAMED, locale);
  const strikeDay = dayDate(STRIKE_11N_DATE, locale, false);
  const asOf = shortDate(L2_CLOSURE_AS_OF, locale);

  const t = {
    ca: {
      lead: `L'**L2 de metro** no circula entre **La Pau i Gorg** des del ${fromDay} fins al final del servei del **${untilDay}**, per obres a la infraestructura: **${STATIONS.ca}** es queden sense metro. TMB preveu que els trens tornin a circular el **${backDay} a les ${c.backTime}**. Mentrestant, un **bus llançadora** fa el trajecte entre La Pau i Gorg amb parada a les tres estacions, amb l'horari del metro i **sense haver de validar el bitllet**.`,
      factsTitle: "L'essencial",
      facts: [
        { label: "Sense metro", value: `${STATIONS.ca} (tram La Pau – Gorg)` },
        { label: "Fins quan", value: `Fins al final del servei del ${untilDay}` },
        { label: "Tornada prevista", value: `${cap(backDay)}, a les ${c.backTime}` },
        { label: "On arriba l'L2", value: "De Paral·lel a La Pau i de Gorg a Badalona | Pompeu Fabra" },
        { label: "Bus llançadora", value: `La Pau – Gorg, amb parada a les tres estacions; cada ${wa}-${wb} min els feiners, sense validar el bitllet` },
        { label: "Alternativa en metro", value: "Des de Gorg, L10 Nord fins a La Sagrera (L1 i L5); a La Pau, L4" },
      ],
      status: `Avís de TMB: ${link("sense servei entre La Pau i Gorg", notice)} des del ${fromDay} fins al final del servei del ${untilDay}. Si TMB canvia les dates, val el que digui el seu avís.`,
      stationsTitle: "Quines estacions de l'L2 estan tancades",
      stations: [
        `Les estacions sense metro són **${STATIONS.ca}**. La Pau i Gorg continuen obertes: l'L2 arriba a La Pau des de Paral·lel i a Gorg des de Badalona | Pompeu Fabra, i en aquestes dues estacions el bus llançadora enllaça amb el metro.`,
      ],
      shuttleTitle: "Bus llançadora: parades, freqüència i bitllet",
      shuttle: [
        `TMB diu que el bus llançadora té **el mateix horari que el metro** (quan obre i tanca el metro cada dia, a ${b2link("hours", "ca", "l'horari del metro de Barcelona")}). **No cal validar el bitllet** per pujar-hi.`,
        `Passa cada **${minutes(SHUTTLE.minutes.weekdays, "ca")}** els feiners, cada ${minutes(SHUTTLE.minutes.saturdays, "ca")} els dissabtes i cada ${minutes(SHUTTLE.minutes.holidays, "ca")} els festius. Al web de TMB surt com a línia ${link(`${SHUTTLE.line}, «${SHUTTLE.lineName}»`, L2_URLS.shuttleLine)}.`,
      ],
      altTitle: "Alternatives per anar al centre o a Badalona",
      altIntro: `A més del bus llançadora, TMB i l'Ajuntament proposen aquestes alternatives (${link("avís de TMB", notice)} i ${link("nota de premsa", L2_URLS.tmbPress)}):`,
      alt: [
        `**De Gorg al centre:** l'**L10 Nord** fins a La Sagrera, on enllaça amb l'**L1** i l'**L5**. Per continuar amb l'L2 cap a Paral·lel, agafa l'L1 fins a Clot.`,
        `**A La Pau:** l'L2 continua cap a Paral·lel, i hi tens l'**L4**.`,
        `**Rodalies R1:** TMB proposa l'R1 per fer el trajecte entre Clot i Badalona Pompeu Fabra; abans de sortir, mira ${link("l'estat de l'R1", r1Page("ca"))}.`,
        `**Tramvia:** les línies **${trams}**, que la nota de TMB i l'Ajuntament cita com a alternativa a la zona.`,
        `**Bus H10 de TMB:** fa el recorregut entre La Pau i Gorg. El ${asOf} TMB el tenia desviat per obres a l'avinguda d'Alfons XIII, amb parades anul·lades com ${h10Stops}: comprova la teva parada a ${link("l'estat de la xarxa de bus", L2_URLS.busStatus)}.`,
        `**Altres autobusos:** les línies **${tusgsal}** de TUSGSAL, segons l'avís de TMB.`,
      ],
      datesTitle: "Fins al 3 o fins al 4 de desembre?",
      dates: [
        `Les dues dates diuen el mateix. L'${link("avís de TMB", notice)} parla d'un tall «fins a la finalització del servei del 3 de desembre de 2026», i l'alerta de l'${link("estat de la xarxa de metro", L2_URLS.metroStatus)} diu «fins al 3 de desembre inclòs» i que el servei quedarà restablert «a l'inici del servei del dia 4 de desembre».`,
        `La nota de premsa de ${link("TMB", L2_URLS.tmbPress)} i la de l'${link("Ajuntament de Barcelona", L2_URLS.council)}, del ${announced} i amb el mateix text, posen l'hora: «Es preveu la normalització de la circulació de trens el divendres 4 de desembre a les 5 de la matinada». TMB i l'Ajuntament no es contradiuen: el **${dayDate(c.until, "ca", false)}** és l'últim dia sense trens i el **${backDay}**, a les ${c.backTime}, la tornada prevista.`,
      ],
      whyTitle: "Per què està tallada l'L2",
      why: `Segons TMB, és una obra de millora de la infraestructura en aquest tram, necessària per recuperar la normalitat després d'uns dies d'afectació per una incidència a la plataforma de la via. Quan la va anunciar, el ${announced}, TMB parlava d'un tall «durant un mes».`,
      infoTitle: "On informar-se i altres consells",
      info: [
        "**A les estacions:** TMB té informadors a les estacions afectades, que reparteixen fulletons amb les alternatives, i cartells als punts on paren els busos substitutoris.",
        `**En línia:** el planificador Vull Anar i la TMB App inclouen el tall i proposen alternatives, i l'${link("avís de TMB", notice)} enllaça un mapa amb les alternatives. Per telèfon, el 900 701 149 d'informació de TMB.`,
        `**Vaga general del ${strikeDay}:** cau dins del tall; què funciona aquell dia, a ${b2link("strike11n", "ca", "la vaga general de l'11 de novembre")}.`,
        `**Bitllets:** què cobreix cada títol i quant costa, a ${b2link("transport", "ca", "les targetes de transport de Barcelona")}.`,
      ],
      faq: [
        { question: "Fins quan està tallada l'L2?", answer: `Fins al final del servei del ${untilDay}. TMB preveu que els trens tornin a circular entre La Pau i Gorg el ${backDay} a les ${c.backTime}.` },
        { question: "Quines estacions de l'L2 estan tancades?", answer: `${STATIONS.ca}. La Pau i Gorg continuen obertes: l'L2 arriba a La Pau des de Paral·lel i a Gorg des de Badalona | Pompeu Fabra.` },
        { question: "Cada quant passa el bus llançadora de l'L2?", answer: `Cada ${minutes(SHUTTLE.minutes.weekdays, "ca")} els feiners, cada ${minutes(SHUTTLE.minutes.saturdays, "ca")} els dissabtes i cada ${minutes(SHUTTLE.minutes.holidays, "ca")} els festius, segons TMB.` },
        { question: "Cal validar el bitllet al bus llançadora?", answer: "No. L'avís de TMB diu que per utilitzar el bus llançadora no cal validar el bitllet." },
        { question: "A quina hora funciona el bus llançadora?", answer: "Amb el mateix horari que el metro, segons TMB." },
        { question: "On para el bus llançadora?", answer: `A les cinc estacions del tram, en una parada diferent segons el sentit: cap a Gorg, a les parades ${SHUTTLE.towardsGorg.map((s) => s.code).join(", ")}; cap a La Pau, a les ${SHUTTLE.towardsLaPau.map((s) => s.code).join(", ")}.` },
        { question: "Quina alternativa hi ha a l'L2 a Verneda, Artigues i Sant Roc?", answer: `El bus llançadora fins a La Pau (L2 i L4) o fins a Gorg (L2 cap a Badalona i L10 Nord). TMB també proposa l'H10, l'R1 de Rodalies entre Clot i Badalona Pompeu Fabra, el tramvia (${trams}) i les línies de TUSGSAL ${tusgsal}.` },
        { question: "Com vaig de Badalona al centre sense l'L2?", answer: "Amb l'L2 fins a Gorg i, allà, l'L10 Nord fins a La Sagrera, on enllaça amb l'L1 i l'L5; per continuar amb l'L2, l'L1 fins a Clot. TMB també proposa l'R1 de Rodalies entre Badalona Pompeu Fabra i Clot." },
      ],
    },
    es: {
      lead: `La **L2 de metro** no circula entre **La Pau y Gorg** desde el ${fromDay} hasta el final del servicio del **${untilDay}**, por obras en la infraestructura: **${STATIONS.es}** se quedan sin metro. TMB prevé que los trenes vuelvan a circular el **${backDay} a las ${c.backTime}**. Mientras tanto, un **bus lanzadera** hace el trayecto entre La Pau y Gorg con parada en las tres estaciones, con el horario del metro y **sin tener que validar el billete**.`,
      factsTitle: "Lo esencial",
      facts: [
        { label: "Sin metro", value: `${STATIONS.es} (tramo La Pau – Gorg)` },
        { label: "Hasta cuándo", value: `Hasta el final del servicio del ${untilDay}` },
        { label: "Vuelta prevista", value: `${cap(backDay)}, a las ${c.backTime}` },
        { label: "Hasta dónde llega la L2", value: "De Paral·lel a La Pau y de Gorg a Badalona | Pompeu Fabra" },
        { label: "Bus lanzadera", value: `La Pau – Gorg, con parada en las tres estaciones; cada ${wa}-${wb} min los laborables, sin validar el billete` },
        { label: "Alternativa en metro", value: "Desde Gorg, L10 Nord hasta La Sagrera (L1 y L5); en La Pau, L4" },
      ],
      status: `Aviso de TMB: ${link("sin servicio entre La Pau y Gorg", notice)} desde el ${fromDay} hasta el final del servicio del ${untilDay}. Si TMB cambia las fechas, vale lo que diga su aviso.`,
      stationsTitle: "Qué estaciones de la L2 están cerradas",
      stations: [
        `Las estaciones sin metro son **${STATIONS.es}**. La Pau y Gorg siguen abiertas: la L2 llega a La Pau desde Paral·lel y a Gorg desde Badalona | Pompeu Fabra, y en esas dos estaciones el bus lanzadera enlaza con el metro.`,
      ],
      shuttleTitle: "Bus lanzadera: paradas, frecuencia y billete",
      shuttle: [
        `TMB dice que el bus lanzadera tiene **el mismo horario que el metro** (cuándo abre y cierra el metro cada día, en ${b2link("hours", "es", "el horario del metro de Barcelona")}). **No hace falta validar el billete** para subir.`,
        `Pasa cada **${minutes(SHUTTLE.minutes.weekdays, "es")}** los laborables, cada ${minutes(SHUTTLE.minutes.saturdays, "es")} los sábados y cada ${minutes(SHUTTLE.minutes.holidays, "es")} los festivos. En la web de TMB aparece como línea ${link(`${SHUTTLE.line}, «${SHUTTLE.lineName}»`, L2_URLS.shuttleLine)}.`,
      ],
      altTitle: "Alternativas para ir al centro o a Badalona",
      altIntro: `Además del bus lanzadera, TMB y el Ayuntamiento proponen estas alternativas (${link("aviso de TMB", notice)} y ${link("nota de prensa", L2_URLS.tmbPress)}):`,
      alt: [
        `**De Gorg al centro:** la **L10 Nord** hasta La Sagrera, donde enlaza con la **L1** y la **L5**. Para seguir con la L2 hacia Paral·lel, toma la L1 hasta Clot.`,
        `**En La Pau:** la L2 sigue hacia Paral·lel, y tienes la **L4**.`,
        `**Rodalies R1:** TMB propone la R1 para hacer el trayecto entre Clot y Badalona Pompeu Fabra; antes de salir, mira ${link("el estado de la R1", r1Page("es"))}.`,
        `**Tranvía:** las líneas **${trams}**, que la nota de TMB y el Ayuntamiento cita como alternativa en la zona.`,
        `**Bus H10 de TMB:** hace el recorrido entre La Pau y Gorg. El ${asOf} TMB lo tenía desviado por obras en la avenida de Alfons XIII, con paradas anuladas como ${h10Stops}: comprueba tu parada en ${link("el estado de la red de bus", L2_URLS.busStatus)}.`,
        `**Otros autobuses:** las líneas **${tusgsal}** de TUSGSAL, según el aviso de TMB.`,
      ],
      datesTitle: "¿Hasta el 3 o hasta el 4 de diciembre?",
      dates: [
        `Las dos fechas dicen lo mismo. El ${link("aviso de TMB", notice)} habla de un corte «hasta la finalización del servicio del 3 de diciembre de 2026», y la alerta del ${link("estado de la red de metro", L2_URLS.metroStatus)} dice «hasta el 3 de diciembre incluido» y que el servicio quedará restablecido «al inicio del servicio del día 4 de diciembre».`,
        `La nota de prensa de ${link("TMB", L2_URLS.tmbPress)} y la del ${link("Ayuntamiento de Barcelona", L2_URLS.council)}, del ${announced} y con el mismo texto, ponen la hora: prevén que los trenes vuelvan a circular con normalidad el viernes 4 de diciembre a las 5 de la madrugada. TMB y el Ayuntamiento no se contradicen: el **${dayDate(c.until, "es", false)}** es el último día sin trenes y el **${backDay}**, a las ${c.backTime}, la vuelta prevista.`,
      ],
      whyTitle: "Por qué está cortada la L2",
      why: `Según TMB, es una obra de mejora de la infraestructura en este tramo, necesaria para recuperar la normalidad después de unos días de afectación por una incidencia en la plataforma de la vía. Cuando la anunció, el ${announced}, TMB hablaba de un corte «durante un mes».`,
      infoTitle: "Dónde informarse y otros consejos",
      info: [
        "**En las estaciones:** TMB tiene informadores en las estaciones afectadas, que reparten folletos con las alternativas, y carteles en los puntos donde paran los buses sustitutorios.",
        `**En línea:** el planificador Vull Anar y la TMB App incluyen el corte y proponen alternativas, y el ${link("aviso de TMB", notice)} enlaza un mapa con las alternativas. Por teléfono, el 900 701 149 de información de TMB.`,
        `**Huelga general del ${strikeDay}:** cae dentro del corte; qué funciona ese día, en ${b2link("strike11n", "es", "la huelga general del 11 de noviembre")}.`,
        `**Billetes:** qué cubre cada título y cuánto cuesta, en ${b2link("transport", "es", "las tarjetas de transporte de Barcelona")}.`,
      ],
      faq: [
        { question: "¿Hasta cuándo está cortada la L2?", answer: `Hasta el final del servicio del ${untilDay}. TMB prevé que los trenes vuelvan a circular entre La Pau y Gorg el ${backDay} a las ${c.backTime}.` },
        { question: "¿Qué estaciones de la L2 están cerradas?", answer: `${STATIONS.es}. La Pau y Gorg siguen abiertas: la L2 llega a La Pau desde Paral·lel y a Gorg desde Badalona | Pompeu Fabra.` },
        { question: "¿Cada cuánto pasa el bus lanzadera de la L2?", answer: `Cada ${minutes(SHUTTLE.minutes.weekdays, "es")} los laborables, cada ${minutes(SHUTTLE.minutes.saturdays, "es")} los sábados y cada ${minutes(SHUTTLE.minutes.holidays, "es")} los festivos, según TMB.` },
        { question: "¿Hay que validar el billete en el bus lanzadera?", answer: "No. El aviso de TMB dice que para utilizar el bus lanzadera no hace falta validar el billete." },
        { question: "¿A qué hora funciona el bus lanzadera?", answer: "Con el mismo horario que el metro, según TMB." },
        { question: "¿Dónde para el bus lanzadera?", answer: `En las cinco estaciones del tramo, en una parada distinta según el sentido: hacia Gorg, en las paradas ${SHUTTLE.towardsGorg.map((s) => s.code).join(", ")}; hacia La Pau, en las ${SHUTTLE.towardsLaPau.map((s) => s.code).join(", ")}.` },
        { question: "¿Qué alternativa hay a la L2 en Verneda, Artigues y Sant Roc?", answer: `El bus lanzadera hasta La Pau (L2 y L4) o hasta Gorg (L2 hacia Badalona y L10 Nord). TMB también propone el H10, la R1 de Rodalies entre Clot y Badalona Pompeu Fabra, el tranvía (${trams}) y las líneas de TUSGSAL ${tusgsal}.` },
        { question: "¿Cómo voy de Badalona al centro sin la L2?", answer: "Con la L2 hasta Gorg y, allí, la L10 Nord hasta La Sagrera, donde enlaza con la L1 y la L5; para seguir con la L2, la L1 hasta Clot. TMB también propone la R1 de Rodalies entre Badalona Pompeu Fabra y Clot." },
      ],
    },
    en: {
      lead: `**Metro line L2** is not running between **La Pau and Gorg** from ${fromDay} until the end of service on **${untilDay}**, for infrastructure works: **${STATIONS.en}** have no metro. TMB expects trains back on **${backDay} at ${c.backTime}**. Meanwhile a **shuttle bus** runs between La Pau and Gorg, stopping at all three stations, on the metro's timetable, and **you do not need to validate a ticket** to ride it.`,
      factsTitle: "At a glance",
      facts: [
        { label: "No metro", value: `${STATIONS.en} (La Pau – Gorg section)` },
        { label: "Until", value: `The end of service on ${untilDay}` },
        { label: "Trains expected back", value: `${backDay}, at ${c.backTime}` },
        { label: "Where the L2 runs", value: "Paral·lel to La Pau, and Gorg to Badalona | Pompeu Fabra" },
        { label: "Shuttle bus", value: `La Pau – Gorg, stopping at all three stations; every ${wa}-${wb} min on weekdays, no ticket validation` },
        { label: "Metro alternative", value: "From Gorg, L10 Nord to La Sagrera (L1 and L5); at La Pau, L4" },
      ],
      status: `TMB's notice: ${link("no service between La Pau and Gorg", notice)} from ${fromDay} until the end of service on ${untilDay}. If TMB changes the dates, its notice is what counts.`,
      stationsTitle: "Which L2 stations are closed",
      stations: [
        `The stations without metro are **${STATIONS.en}**. La Pau and Gorg stay open: the L2 reaches La Pau from Paral·lel and Gorg from Badalona | Pompeu Fabra, and the shuttle bus connects with the metro at both.`,
      ],
      shuttleTitle: "Shuttle bus: stops, frequency and tickets",
      shuttle: [
        `TMB says the shuttle bus keeps **the same timetable as the metro** (when the metro opens and closes each day is in ${b2link("hours", "en", "Barcelona metro hours")}). **You do not need to validate your ticket** to board it.`,
        `It runs every **${minutes(SHUTTLE.minutes.weekdays, "en")}** on weekdays, every ${minutes(SHUTTLE.minutes.saturdays, "en")} on Saturdays and every ${minutes(SHUTTLE.minutes.holidays, "en")} on holidays. TMB's website lists it as line ${link(`${SHUTTLE.line}, "${SHUTTLE.lineName}"`, L2_URLS.shuttleLine)}.`,
      ],
      altTitle: "Alternatives into the centre or to Badalona",
      altIntro: `Besides the shuttle bus, TMB and the City Council suggest these alternatives (${link("TMB's notice", notice)} and ${link("press note", L2_URLS.tmbPress)}):`,
      alt: [
        `**From Gorg to the centre:** **L10 Nord** to La Sagrera, which connects with **L1** and **L5**. To carry on along the L2 towards Paral·lel, take the L1 to Clot.`,
        `**At La Pau:** the L2 carries on towards Paral·lel, and the **L4** stops there.`,
        `**Rodalies R1:** TMB suggests the R1 between Clot and Badalona Pompeu Fabra; before you set off, check ${link("Rodalies disruptions today", r1Page("en"))}.`,
        `**Tram:** lines **${trams}**, which TMB's and the City Council's note lists as an alternative in the area.`,
        `**TMB bus H10:** runs between La Pau and Gorg. On ${asOf} TMB had it diverted for street works on Avinguda d'Alfons XIII, with stops such as ${h10Stops} cancelled: check your stop on ${link("TMB's bus network status", L2_URLS.busStatus)}.`,
        `**Other buses:** TUSGSAL lines **${tusgsal}**, according to TMB's notice.`,
      ],
      datesTitle: "Until 3 December or 4 December?",
      dates: [
        `Both dates say the same thing. ${link("TMB's notice", notice)} gives the closure "until the end of service on December 3, 2026", and the alert on ${link("TMB's metro network status", L2_URLS.metroStatus)} says the line is suspended "through December 3, inclusive" and that "service will be restored at the start of service on 4 December".`,
        `${link("TMB's press note", L2_URLS.tmbPress)} and the ${link("City Council's", L2_URLS.council)}, both of ${announced} and word for word the same, give the time: trains are expected to run normally again on Friday 4 December at 5:00 in the morning. TMB and the City Council do not contradict each other: **${dayDate(c.until, "en", false)}** is the last day without trains and **${backDay}**, at ${c.backTime}, the expected return.`,
      ],
      whyTitle: "Why the L2 is closed",
      why: `According to TMB, it is infrastructure improvement work on this section, needed to get the line back to normal after several days of disruption caused by a problem with the track bed. When it announced the work on ${announced}, TMB spoke of a closure "for a month".`,
      infoTitle: "Where to check, and other tips",
      info: [
        "**At the stations:** TMB has staff at the affected stations handing out leaflets with the alternatives, and signs where the replacement buses stop.",
        `**Online:** TMB's Vull Anar journey planner and the TMB App include the closure and suggest alternatives, and ${link("TMB's notice", notice)} links a map of them. By phone, TMB's information line is 900 701 149.`,
        `**General strike on ${strikeDay}:** it falls inside the closure; what runs that day is in ${b2link("strike11n", "en", "the 11 November general strike guide")}.`,
        `**Tickets:** what each pass covers and costs is in ${b2link("transport", "en", "Barcelona transport passes")}.`,
      ],
      faq: [
        { question: "When does the L2 reopen between La Pau and Gorg?", answer: `TMB expects trains back on ${backDay} at ${c.backTime}. The last day without trains is ${untilDay}, until the end of service.` },
        { question: "Which L2 stations are closed?", answer: `${STATIONS.en}. La Pau and Gorg stay open: the L2 reaches La Pau from Paral·lel and Gorg from Badalona | Pompeu Fabra.` },
        { question: "Is the Barcelona metro L2 running?", answer: `Yes, between Paral·lel and La Pau and between Gorg and Badalona | Pompeu Fabra. Between La Pau and Gorg there are no trains until the end of service on ${untilDay}.` },
        { question: "How often does the L2 shuttle bus run?", answer: `Every ${minutes(SHUTTLE.minutes.weekdays, "en")} on weekdays, every ${minutes(SHUTTLE.minutes.saturdays, "en")} on Saturdays and every ${minutes(SHUTTLE.minutes.holidays, "en")} on holidays, according to TMB.` },
        { question: "Do I have to validate my ticket on the L2 shuttle bus?", answer: "No. TMB's notice says you do not need to validate your ticket to use the shuttle bus." },
        { question: "Where does the L2 shuttle bus stop?", answer: `At all five stations on the section, at a different stop in each direction: towards Gorg at stops ${SHUTTLE.towardsGorg.map((s) => s.code).join(", ")}; towards La Pau at ${SHUTTLE.towardsLaPau.map((s) => s.code).join(", ")}.` },
        { question: "What is the alternative to the L2 at Verneda, Artigues and Sant Roc?", answer: `The shuttle bus to La Pau (L2 and L4) or to Gorg (L2 towards Badalona, and L10 Nord). TMB also suggests the H10 bus, Rodalies R1 between Clot and Badalona Pompeu Fabra, the tram (${trams}) and TUSGSAL lines ${tusgsal}.` },
        { question: "How do I get from Badalona to central Barcelona while the L2 is closed?", answer: "Take the L2 to Gorg and change there to the L10 Nord to La Sagrera, which connects with the L1 and L5; to carry on along the L2, take the L1 to Clot. TMB also suggests Rodalies R1 between Badalona Pompeu Fabra and Clot." },
      ],
    },
  }[locale];

  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    callout("official", verifiedLine(locale, L2_CLOSURE_VERIFIED), t.status),
    ...h2(t.stationsTitle, ...t.stations),
    stopsTable(locale),
    ...h2(t.shuttleTitle, ...t.shuttle),
    intervalsTable(locale),
    ...h2(t.altTitle, t.altIntro),
    list(...t.alt),
    ...h2(t.datesTitle, ...t.dates),
    ...h2(t.whyTitle, t.why),
    ...h2(t.infoTitle),
    list(...t.info),
    faq(t.faq),
    ...b2Related([...RELATED], locale),
  ];
}

/* -------------------------------------------------------------------------- */
/* Body: once the trains are back                                             */
/* -------------------------------------------------------------------------- */

function reopenedBody(locale: Locale, reopened: L2Reopening): Block[] {
  const c = L2_CLOSURE;
  const day = dayDate(reopened.date, locale);
  const fromDay = dayDate(c.from, locale, false);
  const lastDay = dayDate(lastClosedDay(reopened), locale);
  const council = { ca: "l'Ajuntament de Barcelona", es: "el Ayuntamiento de Barcelona", en: "Barcelona City Council" }[locale];
  const source = link(new URL(reopened.url).host.endsWith("tmb.cat") ? "TMB" : council, reopened.url);
  const [wa, wb] = SHUTTLE.minutes.weekdays;
  const notices = L2_URLS.serviceNotices[locale];

  const t = {
    ca: {
      lead: `L'**L2 de metro** torna a circular entre **La Pau i Gorg** des del **${day}** (${source}). El tall per obres, que va deixar sense metro **${STATIONS.ca}**, va anar del ${fromDay} al ${lastDay}.`,
      factsTitle: "L'essencial",
      facts: [
        { label: "Servei restablert", value: cap(day) },
        { label: "Durada del tall", value: `Del ${fromDay} al ${lastDay}` },
        { label: "Estacions afectades", value: STATIONS.ca },
      ],
      status: `Estat comprovat a ${source} el ${dateYear(reopened.read, "ca")}.`,
      howTitle: "Com va funcionar el tall",
      how: [
        `TMB va suspendre la circulació entre La Pau i Gorg per una obra de millora de la infraestructura, després d'uns dies d'afectació per una incidència a la plataforma de la via. Mentre va durar, l'L2 va funcionar entre Paral·lel i La Pau i entre Gorg i Badalona | Pompeu Fabra.`,
        `Un bus llançadora va cobrir el tram amb parada a les tres estacions, amb l'horari del metro, cada ${wa} a ${wb} minuts els feiners i sense haver de validar el bitllet.`,
      ],
      nextTitle: "Si TMB torna a tallar una línia",
      next: `TMB publica els talls de servei i les alternatives a la secció d'${link("avisos de servei", notices)} del seu web. L'horari de cada dia és a ${b2link("hours", "ca", "l'horari del metro de Barcelona")}.`,
      faq: [
        { question: "Ja funciona l'L2 entre La Pau i Gorg?", answer: `Sí. TMB va restablir el servei el ${day}.` },
        { question: "Quant va durar el tall de l'L2?", answer: `Del ${fromDay} al ${lastDay}.` },
        { question: "Quines estacions de l'L2 van estar tancades?", answer: `${STATIONS.ca}.` },
      ],
    },
    es: {
      lead: `La **L2 de metro** vuelve a circular entre **La Pau y Gorg** desde el **${day}** (${source}). El corte por obras, que dejó sin metro **${STATIONS.es}**, fue del ${fromDay} al ${lastDay}.`,
      factsTitle: "Lo esencial",
      facts: [
        { label: "Servicio restablecido", value: cap(day) },
        { label: "Duración del corte", value: `Del ${fromDay} al ${lastDay}` },
        { label: "Estaciones afectadas", value: STATIONS.es },
      ],
      status: `Estado comprobado en ${source} el ${dateYear(reopened.read, "es")}.`,
      howTitle: "Cómo funcionó el corte",
      how: [
        `TMB suspendió la circulación entre La Pau y Gorg por una obra de mejora de la infraestructura, tras unos días de afectación por una incidencia en la plataforma de la vía. Mientras duró, la L2 funcionó entre Paral·lel y La Pau y entre Gorg y Badalona | Pompeu Fabra.`,
        `Un bus lanzadera cubrió el tramo con parada en las tres estaciones, con el horario del metro, cada ${wa} a ${wb} minutos los laborables y sin tener que validar el billete.`,
      ],
      nextTitle: "Si TMB vuelve a cortar una línea",
      next: `TMB publica los cortes de servicio y las alternativas en la sección de ${link("avisos de servicio", notices)} de su web. El horario de cada día está en ${b2link("hours", "es", "el horario del metro de Barcelona")}.`,
      faq: [
        { question: "¿Ya funciona la L2 entre La Pau y Gorg?", answer: `Sí. TMB restableció el servicio el ${day}.` },
        { question: "¿Cuánto duró el corte de la L2?", answer: `Del ${fromDay} al ${lastDay}.` },
        { question: "¿Qué estaciones de la L2 estuvieron cerradas?", answer: `${STATIONS.es}.` },
      ],
    },
    en: {
      lead: `**Metro line L2** is running again between **La Pau and Gorg** from **${day}** (${source}). The works closure, which left **${STATIONS.en}** without metro, ran from ${fromDay} to ${lastDay}.`,
      factsTitle: "At a glance",
      facts: [
        { label: "Service restored", value: day },
        { label: "Closure", value: `${fromDay} to ${lastDay}` },
        { label: "Stations affected", value: STATIONS.en },
      ],
      status: `Checked on ${source} on ${dateYear(reopened.read, "en")}.`,
      howTitle: "How the closure worked",
      how: [
        `TMB suspended trains between La Pau and Gorg for infrastructure improvement work, after several days of disruption caused by a problem with the track bed. While it lasted, the L2 ran between Paral·lel and La Pau and between Gorg and Badalona | Pompeu Fabra.`,
        `A shuttle bus covered the section, stopping at all three stations, on the metro's timetable, every ${wa} to ${wb} minutes on weekdays and with no need to validate a ticket.`,
      ],
      nextTitle: "If TMB closes a line again",
      next: `TMB posts closures and alternatives in the ${link("service notices", notices)} section of its website. Each day's hours are in ${b2link("hours", "en", "Barcelona metro hours")}.`,
      faq: [
        { question: "Is the L2 running again between La Pau and Gorg?", answer: `Yes. TMB restored the service on ${day}.` },
        { question: "How long was the L2 closed?", answer: `From ${fromDay} to ${lastDay}.` },
        { question: "Which L2 stations were closed?", answer: `${STATIONS.en}.` },
      ],
    },
  }[locale];

  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    callout("official", verifiedLine(locale, L2_CLOSURE_VERIFIED), t.status),
    ...h2(t.howTitle, ...t.how),
    ...h2(t.nextTitle, t.next),
    faq(t.faq),
    ...b2Related([...RELATED], locale),
  ];
}

/** The related rail: the metro hours and passes guides first (they fill the read-next box). */
const RELATED = ["hours", "transport", "strikes", "barcelonaDecember"] as const;

export function buildL2Body(locale: Locale, reopened: L2Reopening | null = L2_REOPENED): Block[] {
  return reopened ? reopenedBody(locale, reopened) : closedBody(locale);
}

/* -------------------------------------------------------------------------- */
/* Article                                                                    */
/* -------------------------------------------------------------------------- */

/** The metro hours guide's hero, typed here (hours.ts imports this module); a test holds it equal to HOURS. */
const HOURS_HERO = {
  key: "horaris-metro-catalunya-l1",
  alt: {
    ca: "Andana de la línia 1 a l'estació de Catalunya, amb un tren arribant",
    es: "Andén de la línea 1 en la estación de Catalunya, con un tren llegando",
    en: "Line 1 platform at Catalunya station, with a train pulling in",
  },
  caption: {
    ca: "El metro tanca a mitjanit entre setmana i no tanca la nit del dissabte.",
    es: "El metro cierra a medianoche entre semana y no cierra la noche del sábado.",
    en: "The metro closes at midnight on weeknights and runs all night on Saturdays.",
  },
} as const;

export const L2_CLOSURE_META: Record<Locale, Meta> = {
  ca: l2Meta("ca"),
  es: l2Meta("es"),
  en: l2Meta("en"),
};

export const L2_CLOSURE_GUIDE: B2Article = {
  key: "l2Closure",
  entryKey: "guide-barcelona-metro-l2-closure",
  categoryKey: "public-services",
  sources: l2Sources(),
  heroKey: HOURS_HERO.key,
  heroAlt: { ...HOURS_HERO.alt },
  heroCaption: { ...HOURS_HERO.caption },
  verifiedAt: L2_CLOSURE_VERIFIED,
  publishedAt: "2026-11-03T19:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...L2_CLOSURE_META[locale], blocks: buildL2Body(locale) }]),
  ) as B2Article["editions"],
};
