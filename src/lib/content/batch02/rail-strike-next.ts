import type { Locale } from "@/lib/i18n/config";
import { hubPath as rodaliesHub } from "@/lib/programmatic/rodalies/paths";

import { dateYear, dayDate } from "./festive";
import { B2_TITLES, b2href, type B2Key, type B2Source } from "./shared";
import { SPAIN_NOT_HAPPENING, SPAIN_STRIKES, STRIKES_SPAIN_VERIFIED } from "./strikes-spain-data";
import { spainDays } from "./strikes-spain";
import { STRIKES, STRIKES_VERIFIED, STRIKE_URLS, strikeDays, type Strike } from "./strikes";
import type { SpainStrike } from "./strikes-spain-model";

/**
 * "Is there a Renfe / Rodalies strike now, or soon?" (24 Nov 2026), the
 * standing answer of the Renfe guide (`/es/guias/huelga-renfe-rodalies-
 * noviembre/` and its ca/en editions).
 *
 * Why. "huelga renfe" (1,803 impressions at position 3.7, 9 clicks, 28 days to
 * 24 Nov), "huelga de trenes", "huelga trenes", "renfe huelga ultima hora" and
 * "vaga renfe" ask this every week, and landed on pages dated to one strike
 * that is over. This block answers from the strike data the hubs already keep
 * and re-read every day (strikes.ts for Catalonia, strikes-spain-data.ts for
 * the rest of Spain): only rail strikes (Renfe, Adif, Rodalies, the private
 * operators), each with its own official sources. It invents nothing: a date
 * appears only if an entry in those two files has it.
 *
 * Day-dependent. `railStrikeNext` is in DAY_DEPENDENT_BLOCKS, so the nightly
 * cron rebuilds the page and the answer is computed for the day it is
 * rendered; the "read on" date is always the date the sources were last
 * re-read (STRIKES_VERIFIED and STRIKES_SPAIN_VERIFIED, the earlier of the
 * two), never today's. When that re-read is more than RAIL_NEXT_MAX_AGE_DAYS
 * old, the block stops saying anything about "today" and says what the last
 * re-read found, with the date; a test fails at the same point so somebody
 * re-reads the sources (tests/rail-strike-next.test.ts).
 */

export const RAIL_NEXT_MAX_AGE_DAYS = 4;

type L = Record<Locale, string>;

export interface RailStrike {
  id: string;
  /** Every day of action (ISO), ascending. */
  dates: string[];
  title: L;
  /** The strike's days in words, per language. */
  days: L;
  /** Where it applies and who is called out (the Spain calendar's scope; for a Catalan entry with no twin there, its short line). Ends with a full stop. */
  scope: L;
  /** One line: what is guaranteed, or that it is pending. */
  ms: L;
  sources: B2Source[];
  /** Our own page about this strike, when there is one. */
  page?: B2Key;
}

/** Our pages about one strike, by entry id (the Catalan and the Spain-wide entry of the same strike). */
const PAGE_BY_ID: Record<string, B2Key> = {
  "vaga-ferroviaria-2026-11-17": "railStrike17n",
  "huelga-ferroviaria-2026-11-17": "railStrike17n",
};

const byLocale = (make: (locale: Locale) => string): L => ({ ca: make("ca"), es: make("es"), en: make("en") });
const stop = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`);

/**
 * The rail strikes in the two data files, once each: Catalan entries first, then Spain-wide ones the Catalan hub does not carry.
 * Only strikes with a registered call or an official order (`status: "official"` in the Spain calendar): a strike only the organiser's own
 * notice calls ("called") is never printed as the next strike. A Catalan entry whose Spain-wide twin is not official is left out too.
 */
export function railStrikes(catalan: Strike[] = STRIKES, spain: SpainStrike[] = SPAIN_STRIKES): RailStrike[] {
  const catalanIds = new Set(catalan.map((strike) => strike.id));
  const twin = (id: string) => spain.find((strike) => strike.catalanEntry === id);
  const fromCatalan: RailStrike[] = catalan.filter(
    (strike) =>
      !strike.indefinite &&
      (strike.scope === "rail" || strike.affects.includes("rodalies") || strike.affects.includes("longDistance")) &&
      (twin(strike.id)?.status ?? "official") === "official",
  ).map((strike) => ({
    id: strike.id,
    dates: strike.dates,
    title: strike.title,
    days: byLocale((locale) => strikeDays(strike, locale)),
    scope: byLocale((locale) => stop(twin(strike.id)?.scope[locale] ?? strike.short[locale])),
    ms: strike.minimumServices.msShort,
    sources: strike.sources,
    ...(PAGE_BY_ID[strike.id] ? { page: PAGE_BY_ID[strike.id] } : {}),
  }));
  const fromSpain: RailStrike[] = spain.filter(
    (strike) => strike.sector === "rail" && strike.status === "official" && !(strike.catalanEntry && catalanIds.has(strike.catalanEntry)),
  ).map((strike) => ({
    id: strike.id,
    dates: strike.dates,
    title: strike.title,
    days: byLocale((locale) => spainDays(strike.dates, locale)),
    scope: byLocale((locale) => stop(strike.scope[locale])),
    ms: strike.minimumServices.short,
    sources: strike.sources,
    ...(PAGE_BY_ID[strike.id] ? { page: PAGE_BY_ID[strike.id] } : {}),
  }));
  return [...fromCatalan, ...fromSpain].sort((a, b) => (a.dates[0] ?? "").localeCompare(b.dates[0] ?? ""));
}

const lastOf = (strike: RailStrike) => strike.dates[strike.dates.length - 1] ?? "";

/** The earlier of the two re-read dates: a claim about all rail strikes is only as fresh as the older source file. */
export function railVerified(): string {
  return STRIKES_VERIFIED < STRIKES_SPAIN_VERIFIED ? STRIKES_VERIFIED : STRIKES_SPAIN_VERIFIED;
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

/** True when `today` is more than RAIL_NEXT_MAX_AGE_DAYS after the sources were last re-read. */
export function railIsStale(today: string, verified: string = railVerified()): boolean {
  return daysBetween(verified, today) > RAIL_NEXT_MAX_AGE_DAYS;
}

export interface RailState {
  /** The day the answer is about: today, or the last re-read when that is too old. */
  day: string;
  /** True when `day` is the last re-read and not today. */
  stale: boolean;
  /** Rail strikes with a day of action on `day`. */
  now: RailStrike[];
  /** Strikes with a day of action after `day`, soonest first (a multi-day strike under way counts here too, from its next day). */
  next: RailStrike[];
  /** The most recent strike that has ended before `day`. */
  last: RailStrike | undefined;
  /** Strikes that ended before `day`, most recent first. */
  past: RailStrike[];
  verified: string;
}

export function railState(today: string, list: RailStrike[] = railStrikes(), verified: string = railVerified()): RailState {
  const stale = railIsStale(today, verified);
  const day = stale ? verified : today;
  const now = list.filter((strike) => strike.dates.includes(day));
  const next = list.filter((strike) => !strike.dates.includes(day) && strike.dates.some((d) => d > day)).sort((a, b) => nextDay(a, day).localeCompare(nextDay(b, day)));
  const past = list.filter((strike) => lastOf(strike) < day).sort((a, b) => lastOf(b).localeCompare(lastOf(a)));
  return { day, stale, now, next, last: past[0], past, verified };
}

function nextDay(strike: RailStrike, day: string): string {
  return strike.dates.find((d) => d > day) ?? "";
}

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/* -------------------------------------------------------------------------- */
/* Copy                                                                       */
/* -------------------------------------------------------------------------- */

interface Copy {
  heading: string;
  /** Short, big answer. */
  noneToday: string;
  strikeToday: string;
  nextStrike: (days: string) => string;
  /** The same three, as of the last re-read when that is too old to speak of today. */
  asOfNone: (date: string) => string;
  asOfStrike: (date: string) => string;
  asOfNext: (date: string, days: string) => string;
  staleNote: (today: string, date: string) => string;
  /** The date line under the answer. */
  fresh: (today: string, verified: string) => string;
  noneDetail: (last: string | null) => string;
  lastIs: (days: string, title: string) => string;
  nextDetail: (days: string, title: string, scope: string, ms: string) => string;
  nowDetail: (title: string, scope: string, ms: string) => string;
  then: (items: string) => string;
  labels: { next: string; last: string; read: string; ms: string; where: string; none: string; todayLabel: string };
  msWho: string;
  note: (verified: string) => string;
  where: { rodalies: string; renfe: string; ministry: string; treball: string; live: string; source: string };
}

const COPY: Record<Locale, Copy> = {
  ca: {
    heading: "Hi ha vaga de Renfe o Rodalies ara? La propera vaga de trens",
    noneToday: "Avui, cap vaga de Renfe ni de Rodalies amb data",
    strikeToday: "Avui hi ha vaga de trens",
    nextStrike: (days) => `Propera vaga de trens: ${days}`,
    asOfNone: (date) => `A ${date}: cap vaga de Renfe ni de Rodalies amb data`,
    asOfStrike: (date) => `A ${date}: hi havia vaga de trens aquell dia`,
    asOfNext: (date, days) => `A ${date}: propera vaga de trens, ${days}`,
    staleNote: (today, date) => `Avui, ${today}, encara no hem rellegit les fonts des del ${date}: aquesta és la lectura més recent. Abans de viatjar, mira els enllaços de sota.`,
    fresh: (today, verified) => `${cap(today)}. Fonts oficials llegides el ${verified}.`,
    noneDetail: (last) => `No hi ha cap vaga ferroviària amb data a les fonts oficials que seguim.${last ? ` ${last}` : ""}`,
    lastIs: (days, title) => `L'última va ser ${days}, ${title}.`,
    nextDetail: (days, title, scope, ms) => `${cap(days)}: ${title}. ${scope} ${ms}.`,
    nowDetail: (title, scope, ms) => `${cap(title)}. ${scope} ${ms}.`,
    then: (items) => `Després: ${items}.`,
    labels: { next: "Propera vaga", last: "Última vaga", read: "Fonts llegides el", ms: "Serveis mínims", where: "On mirar-ho avui", none: "Cap amb data", todayLabel: "Avui" },
    msWho:
      "Rodalies i regionals: els fixa la Generalitat per ordre al DOGC. Alta velocitat i llarga distància: el Ministeri de Transports, per resolució.",
    note: (verified) =>
      `Calculat per a la data d'avui amb les vagues ferroviàries del nostre calendari i les fonts oficials de cadascuna (ordres de serveis mínims, resolucions del Ministeri, comunicats dels sindicats), llegides el ${verified}. «Cap vaga amb data» vol dir que no n'hem trobat cap a aquestes fonts, no que el servei sigui normal: els avisos del dia els publiquen Rodalies i Renfe.`,
    where: {
      rodalies: "Alteracions del servei (Rodalies de Catalunya)",
      renfe: "renfe.com",
      ministry: "Resolucions de serveis mínims ferroviaris (Ministeri de Transports)",
      treball: "Vagues amb serveis mínims (Treball, e-Tauler)",
      live: "Rodalies avui: avisos de cada línia",
      source: "Font",
    },
  },
  es: {
    heading: "¿Hay huelga de Renfe o Rodalies ahora? La próxima huelga de trenes",
    noneToday: "Hoy, ninguna huelga de Renfe ni de Rodalies con fecha",
    strikeToday: "Hoy hay huelga de trenes",
    nextStrike: (days) => `Próxima huelga de trenes: ${days}`,
    asOfNone: (date) => `A ${date}: ninguna huelga de Renfe ni de Rodalies con fecha`,
    asOfStrike: (date) => `A ${date}: había huelga de trenes ese día`,
    asOfNext: (date, days) => `A ${date}: próxima huelga de trenes, ${days}`,
    staleNote: (today, date) => `Hoy, ${today}, aún no hemos releído las fuentes desde el ${date}: esta es la lectura más reciente. Antes de viajar, mira los enlaces de abajo.`,
    fresh: (today, verified) => `${cap(today)}. Fuentes oficiales leídas el ${verified}.`,
    noneDetail: (last) => `No hay ninguna huelga ferroviaria con fecha en las fuentes oficiales que seguimos.${last ? ` ${last}` : ""}`,
    lastIs: (days, title) => `La última fue ${days}, ${title}.`,
    nextDetail: (days, title, scope, ms) => `${cap(days)}: ${title}. ${scope} ${ms}.`,
    nowDetail: (title, scope, ms) => `${cap(title)}. ${scope} ${ms}.`,
    then: (items) => `Después: ${items}.`,
    labels: { next: "Próxima huelga", last: "Última huelga", read: "Fuentes leídas el", ms: "Servicios mínimos", where: "Dónde mirarlo hoy", none: "Ninguna con fecha", todayLabel: "Hoy" },
    msWho:
      "Rodalies y regionales: los fija la Generalitat por orden en el DOGC. Alta velocidad y larga distancia: el Ministerio de Transportes, por resolución.",
    note: (verified) =>
      `Calculado para la fecha de hoy con las huelgas ferroviarias de nuestro calendario y las fuentes oficiales de cada una (órdenes de servicios mínimos, resoluciones del Ministerio, comunicados de los sindicatos), leídas el ${verified}. «Ninguna huelga con fecha» quiere decir que no hemos encontrado ninguna en esas fuentes, no que el servicio sea normal: los avisos del día los publican Rodalies y Renfe.`,
    where: {
      rodalies: "Alteraciones del servicio (Rodalies de Catalunya)",
      renfe: "renfe.com",
      ministry: "Resoluciones de servicios mínimos ferroviarios (Ministerio de Transportes)",
      treball: "Huelgas con servicios mínimos (Treball, e-Tauler)",
      live: "Rodalies hoy: avisos de cada línea",
      source: "Fuente",
    },
  },
  en: {
    heading: "Is there a Renfe or Rodalies strike now? The next train strike",
    noneToday: "Today, no Renfe or Rodalies strike with a date",
    strikeToday: "There is a train strike today",
    nextStrike: (days) => `Next train strike: ${days}`,
    asOfNone: (date) => `As of ${date}: no Renfe or Rodalies strike with a date`,
    asOfStrike: (date) => `As of ${date}: there was a train strike that day`,
    asOfNext: (date, days) => `As of ${date}: next train strike, ${days}`,
    staleNote: (today, date) => `Today, ${today}, we have not re-read the sources since ${date}: this is the latest reading. Before you travel, check the links below.`,
    fresh: (today, verified) => `${cap(today)}. Official sources read on ${verified}.`,
    noneDetail: (last) => `No rail strike has a date in the official sources we follow.${last ? ` ${last}` : ""}`,
    lastIs: (days, title) => `The last one was on ${days}, ${title}.`,
    nextDetail: (days, title, scope, ms) => `${cap(days)}: ${title}. ${scope} ${ms}.`,
    nowDetail: (title, scope, ms) => `${cap(title)}. ${scope} ${ms}.`,
    then: (items) => `After that: ${items}.`,
    labels: { next: "Next strike", last: "Last strike", read: "Sources read on", ms: "Minimum services", where: "Where to check today", none: "None with a date", todayLabel: "Today" },
    msWho:
      "Rodalies and regional trains: the Generalitat sets them in an order in the DOGC. High-speed and long-distance trains: the Ministry of Transport, in a resolution.",
    note: (verified) =>
      `Worked out for today's date from the rail strikes in our calendar and each one's official sources (minimum-services orders, Ministry resolutions, union notices), read on ${verified}. "No strike with a date" means we found none in those sources, not that service is normal: the day's notices are published by Rodalies and Renfe.`,
    where: {
      rodalies: "Service alterations (Rodalies de Catalunya)",
      renfe: "renfe.com",
      ministry: "Rail minimum-services resolutions (Ministry of Transport)",
      treball: "Strikes with minimum services (Treball, e-Tauler)",
      live: "Rodalies today: notices for every line",
      source: "Source",
    },
  },
};

export const RAIL_NEXT_HEADING: L = { ca: COPY.ca.heading, es: COPY.es.heading, en: COPY.en.heading };
export const RAIL_NEXT_HEADING_ID = "hi-ha-vaga-renfe";

export interface RailNextLines {
  kind: "today" | "next" | "none";
  stale: boolean;
  /** The big answer. */
  headline: string;
  /** The line under it: the date and the detail. */
  detail: string;
  facts: { label: string; value: string }[];
  /** Official pages: the entry's own sources, then where to look today. */
  links: { label: string; href: string }[];
  /** Our own page about the strike the answer names, when there is one. */
  page?: { label: string; href: string };
  note: string;
}

const STRIKE_LINKS = (strike: RailStrike, locale: Locale) => strike.sources.slice(0, 2).map((source) => ({ label: `${COPY[locale].where.source}: ${source.publisher ? `${source.publisher}, ` : ""}${source.name}`, href: source.url }));

/** Plain words for a list of strikes: "17 de novembre: vaga …; …". */
function items(list: RailStrike[], locale: Locale): string {
  return list.map((strike) => `${strike.days[locale]}: ${strike.title[locale]}`).join("; ");
}

export function railStrikeNextLines(today: string, locale: Locale, list: RailStrike[] = railStrikes(), verified: string = railVerified()): RailNextLines {
  const c = COPY[locale];
  const state = railState(today, list, verified);
  const verifiedLong = dateYear(verified, locale);
  const todayLong = dayDate(today, locale);
  const first = state.next[0];
  const kind: RailNextLines["kind"] = state.now.length > 0 ? "today" : first ? "next" : "none";
  const lastLine = state.last ? c.lastIs(state.last.days[locale], state.last.title[locale]) : null;

  let headline: string;
  let detail: string;
  const lead = state.stale ? [c.staleNote(todayLong, verifiedLong)] : [c.fresh(todayLong, verifiedLong)];
  if (kind === "today") {
    headline = state.stale ? c.asOfStrike(verifiedLong) : c.strikeToday;
    detail = state.now.map((strike) => c.nowDetail(strike.title[locale], strike.scope[locale], strike.ms[locale])).join(" ");
  } else if (kind === "next" && first) {
    headline = state.stale ? c.asOfNext(verifiedLong, first.days[locale]) : c.nextStrike(first.days[locale]);
    const rest = state.next.slice(1);
    detail = `${c.nextDetail(first.days[locale], first.title[locale], first.scope[locale], first.ms[locale])}${rest.length > 0 ? ` ${c.then(items(rest, locale))}` : ""}`;
  } else {
    headline = state.stale ? c.asOfNone(verifiedLong) : c.noneToday;
    detail = c.noneDetail(lastLine);
  }
  const named = kind === "today" ? state.now : kind === "next" && first ? [first] : [];
  const link = (label: string, href: string) => ({ label, href });
  const links = [
    ...named.flatMap((strike) => STRIKE_LINKS(strike, locale)),
    link(c.where.rodalies, STRIKE_URLS.rodaliesStatus),
    link(c.where.live, rodaliesHub(locale)),
    link(c.where.renfe, STRIKE_URLS.renfe),
    link(c.where.ministry, STRIKE_URLS.ministryRail),
    link(c.where.treball, STRIKE_URLS.treballMs),
  ];
  const nextValue = kind === "none" ? c.labels.none : kind === "today" ? `${c.labels.todayLabel}: ${items(state.now, locale)}` : items([first as RailStrike], locale);
  return {
    kind,
    stale: state.stale,
    headline,
    detail: `${lead.join(" ")} ${detail}`.trim(),
    facts: [
      { label: c.labels.next, value: nextValue },
      ...(state.last ? [{ label: c.labels.last, value: `${state.last.days[locale]}, ${state.last.title[locale]}` }] : []),
      { label: c.labels.read, value: verifiedLong },
      { label: c.labels.ms, value: c.msWho },
    ],
    links,
    ...(named[0]?.page ? { page: { label: B2_TITLES[named[0].page][locale], href: b2href(named[0].page, locale) } } : {}),
    note: c.note(verifiedLong),
  };
}

/* -------------------------------------------------------------------------- */
/* Static parts of the guide: the date-stamped answer and the history          */
/* -------------------------------------------------------------------------- */

/**
 * One plain sentence, stamped with the date the sources were read, for the
 * FAQ answer and the meta description of the standing page. Built at publish
 * time from the as-of day, so it never says "today": "A 24 de novembre de
 * 2026 no hi havia cap vaga de Renfe, Adif ni Rodalies amb data a les fonts
 * oficials."
 */
export function railStandingAnswer(asOf: string, locale: Locale, list: RailStrike[] = railStrikes(), verified: string = railVerified()): string {
  const checked = dateYear(verified < asOf ? verified : asOf, locale);
  const day = verified < asOf ? verified : asOf;
  const state = railState(day, list, day);
  const first = state.next[0];
  const last = state.last;
  const copy = {
    ca: {
      none: `A ${checked} no hi havia cap vaga de Renfe, Adif ni Rodalies amb data a les fonts oficials que seguim.${last ? ` L'última va ser ${last.days.ca}.` : ""}`,
      now: `A ${checked} hi havia vaga de trens: ${items(state.now, "ca")}.`,
      next: `A ${checked}, la propera vaga de trens amb data era ${first?.days.ca}: ${first?.title.ca}.`,
    },
    es: {
      none: `A ${checked} no había ninguna huelga de Renfe, Adif ni Rodalies con fecha en las fuentes oficiales que seguimos.${last ? ` La última fue ${last.days.es}.` : ""}`,
      now: `A ${checked} había huelga de trenes: ${items(state.now, "es")}.`,
      next: `A ${checked}, la próxima huelga de trenes con fecha era ${first?.days.es}: ${first?.title.es}.`,
    },
    en: {
      none: `As of ${checked} no Renfe, Adif or Rodalies strike had a date in the official sources we follow.${last ? ` The last one was on ${last.days.en}.` : ""}`,
      now: `As of ${checked} there was a train strike: ${items(state.now, "en")}.`,
      next: `As of ${checked}, the next train strike with a date was on ${first?.days.en}: ${first?.title.en}.`,
    },
  }[locale];
  return state.now.length > 0 ? copy.now : first ? copy.next : copy.none;
}

/**
 * The same answer in one short line, stamped with the date, for the lead and
 * the meta description of the standing page (used from 22 Dec 2026, see
 * RENFE_STANDING_META_FROM in strike-guides.ts).
 */
export function railStandingBrief(asOf: string, locale: Locale, list: RailStrike[] = railStrikes(), verified: string = railVerified()): string {
  const day = verified < asOf ? verified : asOf;
  const checked = dateYear(day, locale);
  const state = railState(day, list, day);
  const first = state.next[0];
  const last = state.last;
  const copy = {
    ca: {
      none: `A ${checked}: cap vaga de Renfe ni de Rodalies amb data.${last ? ` L'última, ${last.days.ca}.` : ""}`,
      now: `A ${checked}: hi havia vaga de trens (${items(state.now, "ca")}).`,
      next: `A ${checked}: propera vaga de trens, ${first?.days.ca}.`,
    },
    es: {
      none: `A ${checked}: ninguna huelga de Renfe ni de Rodalies con fecha.${last ? ` La última, ${last.days.es}.` : ""}`,
      now: `A ${checked}: había huelga de trenes (${items(state.now, "es")}).`,
      next: `A ${checked}: próxima huelga de trenes, ${first?.days.es}.`,
    },
    en: {
      none: `As of ${checked}: no Renfe or Rodalies strike with a date.${last ? ` The last one, ${last.days.en}.` : ""}`,
      now: `As of ${checked}: there was a train strike (${items(state.now, "en")}).`,
      next: `As of ${checked}: next train strike, ${first?.days.en}.`,
    },
  }[locale];
  return state.now.length > 0 ? copy.now : first ? copy.next : copy.none;
}

/** The strikes the history lists: ended before `asOf`, most recent first. */
export function railHistory(asOf: string, list: RailStrike[] = railStrikes()): RailStrike[] {
  return list.filter((strike) => lastOf(strike) < asOf).sort((a, b) => lastOf(b).localeCompare(lastOf(a)));
}

/** Rail strikes that were called off or moved, with the entry's own title (Spain hub's "not happening" list). */
const CALLED_OFF_IDS = ["renfe-23-noviembre-desconvocada", "adif-19-noviembre-desconvocada", "semaf-renfe-12-noviembre-trasladada", "ouigo-desconvocada", "alferro-trasladada"];

export function railCalledOff(locale: Locale): string[] {
  return CALLED_OFF_IDS.flatMap((id) => {
    const item = SPAIN_NOT_HAPPENING.find((entry) => entry.id === id);
    return item ? [item.title[locale]] : [];
  });
}
