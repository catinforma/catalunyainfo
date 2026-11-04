import type { Block } from "@/lib/content/blocks";
import { TRAINS } from "@/lib/content/features/trains";
import { WEEKDAY_NAMES, shortDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import { PATHS as TOOL_PATHS } from "@/lib/content/home-tools";
import { SCHOOL_SOURCE, schoolStatusOn } from "@/lib/content/school/calendar";
import type { Locale } from "@/lib/i18n/config";
import { hubPath as rodaliesHub, linePath } from "@/lib/programmatic/rodalies/paths";
import { LINE_IDS, type LineId } from "@/lib/programmatic/rodalies/types";

import { dateYear, dayDate } from "./festive";
import {
  B2_PATHS,
  B2_TITLES,
  b2Related,
  b2link,
  callout,
  faq,
  h3,
  keyFacts,
  languageLinks,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Key,
  type B2Source,
} from "./shared";
import { STRIKE_11N_DATE, STRIKE_11N_URLS } from "./strike-11n";
import {
  SERVICE_KEYS,
  STRIKES,
  STRIKES_AS_OF,
  STRIKES_VERIFIED,
  STRIKE_URLS,
  andList,
  isOnDay,
  isOpen,
  isUpcoming,
  lastDay,
  strikeDays,
  upcomingStrikes,
  type ServiceKey,
  type Strike,
} from "./strikes";

/**
 * One guide per called strike that people search by name ("vaga renfe 10
 * novembre", "huelga rodalies noviembre", "vaga educació 26 novembre"),
 * beside the strikes hub, so each has a title in the searched words before
 * its peak (4 Nov 2026; docs/SEO_EXPERIMENTS.md, same day).
 *
 * SINGLE SOURCE OF TRUTH: every fact about a strike (who calls it, its days
 * and hours, what it touches, its minimum services, the advice) is read from
 * its entry in `strikes.ts`, which the twice-daily strike watch keeps up to
 * date; titles and descriptions are built from the entry's dates. Nothing
 * here restates a fact about the strike itself. What this module adds is
 * presentation and process: which authority sets minimum services for each
 * service and where they are published (the same as the hub's table), the
 * Rodalies line list, and a few evergreen tips. Edit the entry, never this
 * file, when a strike changes; `?only=strikes` republishes the hub and both
 * guides.
 *
 * Checked on the morning of 4 Nov 2026 (09:33-10:10; fact pack:
 * research_notes/x10/strike-guides-factpack-2026-11-04.md). Nothing had
 * changed since the 3 Nov check, so no fact in strikes.ts changed and
 * STRIKES_AS_OF stays 2026-11-03:
 *  - Renfe 10 and 12 Nov: SEMAF's notices nº 2026-51 (29 Oct: "hemos
 *    convocado dos nuevas jornadas de huelga ... el 10 de noviembre
 *    realizaremos un paro total, y el 12 de noviembre llevaremos a cabo paros
 *    parciales a lo largo de la jornada") and nº 2026-52 (2 Nov, the newest in
 *    its feed) keep both days; no hours. Both days are called. No minimum
 *    services: none on the Departament d'Empresa i Treball's list (newest
 *    entry 2 Nov, Parc Salut Mar; newest Renfe entry 23 Oct), none in the DOGC
 *    (núm. 9787 of 4 Nov, read through its summary API), none on the Ministry
 *    of Transport's rail list (newest the 27 Oct Ouigo resolution and the
 *    28 Oct amendment), no notice at rodalies.gencat.cat; renfe.com has no
 *    readable notice.
 *  - Rodalies is a Grupo Renfe service: the title of Ordre EMT/210/2026
 *    (DOGC núm. 9780, read through the summary API on 4 Nov) is "per la qual
 *    es garanteix el servei essencial de transport de viatgers per ferrocarril
 *    a Catalunya (serveis de rodalies i regionals) que presta l'empresa Grupo
 *    Renfe". The 19 lines are those Rodalies lists (rodalies/types.ts, read
 *    28 Oct 2026).
 *  - Education 26 Nov: called by the unions in their own communiqués of
 *    28 Oct (USTEC·STEs: "hem decidit apostar per ... la vaga educativa del
 *    26 de novembre", "El 26N, fem vaga"; CGT Ensenyament: "la vaga educativa
 *    del 26 de novembre"; the joint release of USTEC-STEs, CGT, La
 *    Intersindical, COS and CNT: "26 de novembre: vaga de les treballadores
 *    de l'educació"), unchanged on 4 Nov. The formal notice to the labour
 *    authority (at least ten calendar days before, RDL 17/1977 art. 4), the
 *    hours and the staff called out are not published; the entry says so and
 *    calls it "anunciada". No order on Treball's list or in the DOGC; the
 *    Departament d'Educació i FP had no readable notice (its news list loads
 *    by script). 26 Nov 2026 is a school day (Ordre EDF/66/2026).
 *
 * Left out on purpose: any hour for the 12 Nov stoppages, any percentage or
 * staff figure, Renfe's service brands, other operators, FGC line numbers.
 */

export type StrikeGuideKey = "strikeRenfe" | "strikeEducation";

const U = STRIKE_URLS;
const link = (href: string, label: string) => `[${label}](${href})`;
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const strip = (text: string) => text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

function heading(level: 2 | 3, text: string, id?: string): Block {
  return { type: "heading", level, text, ...(id ? { id } : {}) } as Block;
}

/* -------------------------------------------------------------------------- */
/* Dates for titles                                                           */
/* -------------------------------------------------------------------------- */

/**
 * "10 i 12 de novembre" / "10 y 12 de noviembre" / "10 and 12 November";
 * across months "30 d'octubre i 2 de novembre". `bare` drops the "de" the
 * searched words drop ("vaga renfe 10 novembre"); `weekdays` names each day
 * ("dimarts 10 i dijous 12 de novembre").
 */
export function compactDays(dates: string[], locale: Locale, options: { bare?: boolean; weekdays?: boolean } = {}): string {
  const { bare = false, weekdays = false } = options;
  const weekday = (iso: string) => (weekdays ? `${WEEKDAY_NAMES[locale][weekdayIndex(iso)] ?? ""} ` : "");
  const groups: string[][] = [];
  for (const iso of dates) {
    const last = groups[groups.length - 1];
    if (last && (last[0] ?? "").slice(0, 7) === iso.slice(0, 7)) last.push(iso);
    else groups.push([iso]);
  }
  const parts = groups.map((group) => {
    const tail = group[group.length - 1] ?? "";
    let full = shortDate(tail, locale);
    if (bare && locale !== "en") full = full.replace(/^(\d+) (?:de |d')/, "$1 ");
    return andList([...group.slice(0, -1).map((iso) => `${weekday(iso)}${Number(iso.slice(8, 10))}`), `${weekday(tail)}${full}`], locale);
  });
  return andList(parts, locale);
}

interface TitleParts {
  /** "10 i 12 de novembre" */
  days: string;
  /** "10 i 12 novembre" (ca, es); the same as `days` in English. */
  bare: string;
  year: string;
}

function titleParts(strike: Strike, locale: Locale): TitleParts {
  return { days: compactDays(strike.dates, locale), bare: compactDays(strike.dates, locale, { bare: true }), year: (strike.dates[0] ?? "").slice(0, 4) };
}

export const SEO_TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

/** The first candidate that fits; the last one is kept short on purpose. */
function firstFit(candidates: string[], limit: number): string {
  return candidates.find((candidate) => candidate.length <= limit) ?? candidates[candidates.length - 1] ?? "";
}

/* -------------------------------------------------------------------------- */
/* Copy shared by every guide                                                 */
/* -------------------------------------------------------------------------- */

type Authority = "generalitat" | "state";

/** Who sets each service's minimum services (the hub's table says the same). */
const AUTHORITY: Record<ServiceKey, Authority> = {
  rodalies: "generalitat",
  metroBus: "generalitat",
  fgcTram: "generalitat",
  longDistance: "state",
  health: "generalitat",
  schools: "generalitat",
};

interface ServiceCopy {
  /** Table label. */
  name: string;
  /** Inside a sentence or a "; " list. */
  inline: string;
  who: string;
  where: string;
}

interface Common {
  keyFactsTitle: string;
  labels: { who: string; days: string; day: string; daysHours: string; dayHours: string; affects: string; outside: string; ms: string; more: string };
  services: Record<ServiceKey, ServiceCopy>;
  /** "els fixen la Generalitat, per ordre al DOGC (Rodalies i regionals), i ..." */
  sets: (parts: { authority: Authority; names: string }[]) => string;
  msPending: (msShort: string, checked: string, sets: string) => string;
  checkedNote: (checked: string) => string;
  today: (day: string) => string;
  past: (hub: string) => string;
  hubLabel: string;
  data: (hub: string) => string;
  msHeading: string;
  whereHeading: string;
  whereCaption: string;
  whereHeaders: [string, string, string];
  affectsHeading: string;
  affectsCaption: string;
  affectsHeaders: [string, string];
  yes: string;
  no: string;
  affectsNote: string;
  todoHeading: string;
  othersHeading: string;
  othersIntro: string;
}

const DOGC = (label: string) => link(U.dogc, label);

const COMMON: Record<Locale, Common> = {
  ca: {
    keyFactsTitle: "La vaga, d'un cop d'ull",
    labels: {
      who: "Qui la convoca",
      days: "Dies",
      day: "Dia",
      daysHours: "Dies i hores",
      dayHours: "Dia i hores",
      affects: "Afecta",
      outside: "No hi entren",
      ms: "Serveis mínims",
      more: "A més",
    },
    services: {
      rodalies: {
        name: "Rodalies i regionals",
        inline: "Rodalies i regionals",
        who: "Generalitat (Departament d'Empresa i Treball), per ordre",
        where: `L'ordre, al ${DOGC("DOGC")} i a la ${link(U.treballMs, "llista de vagues amb serveis mínims")}; l'horari de cada línia, a ${link(U.rodaliesStatus, "rodalies.gencat.cat")}`,
      },
      longDistance: {
        name: "Alta velocitat i llarga distància",
        inline: "alta velocitat i llarga distància",
        who: "Ministeri de Transports, per resolució",
        where: `La resolució, a la ${link(U.ministryRail, "llista de resolucions de serveis mínims ferroviaris")}; els trens que circulen, a ${link(U.renfe, "renfe.com")}`,
      },
      metroBus: {
        name: "Metro i autobusos de TMB",
        inline: "metro i bus de TMB",
        who: "Generalitat (Departament d'Empresa i Treball), per ordre",
        where: `L'ordre, al ${DOGC("DOGC")}; els horaris, als ${link(U.tmb, "avisos de servei de TMB")}`,
      },
      fgcTram: {
        name: "FGC i tramvia",
        inline: "FGC i tramvia",
        who: "Generalitat (Departament d'Empresa i Treball), per ordre",
        where: `L'ordre, al ${DOGC("DOGC")}; l'estat del servei, a ${link(U.fgc, "fgc.cat")}`,
      },
      health: {
        name: "Hospitals, CAP i urgències",
        inline: "hospitals, CAP i urgències",
        who: "Generalitat (Departament d'Empresa i Treball), per ordre",
        where: `L'ordre, al ${DOGC("DOGC")}; el teu centre de salut o hospital t'informa`,
      },
      schools: {
        name: "Escoles i instituts",
        inline: "escoles i instituts",
        who: "Generalitat (Departament d'Empresa i Treball), per ordre",
        where: `L'ordre, al ${DOGC("DOGC")} i a la ${link(U.treballMs, "llista de vagues amb serveis mínims")}; l'escola informa les famílies`,
      },
    },
    sets: (parts) => {
      const who = { generalitat: "la Generalitat, per ordre al DOGC", state: "el Ministeri de Transports, per resolució" };
      const items = parts.map((p) => `${who[p.authority]} (${p.names})`);
      return items.length === 1 ? `els fixa ${items[0]}` : `els fixen ${andList(items, "ca")}`;
    },
    msPending: (msShort, checked, sets) => `**${msShort}** (consultat el ${checked}): ${sets}, pocs dies abans de la vaga.`,
    checkedNote: (checked) => `consultat el ${checked}`,
    today: (day) => `**Avui, ${day}, és dia de vaga.**`,
    past: (hub) => `Aquesta vaga ja ha passat: aquí tens què s'havia anunciat i els serveis mínims, tal com eren a les fonts oficials. Les vagues que vénen, a ${hub}.`,
    hubLabel: "la guia de vagues a Catalunya",
    data: (hub) =>
      `Aquesta pàgina es fa amb la mateixa llista de vagues que ${hub}: només el que publiquen el sindicat convocant, els operadors, el DOGC, el BOE i el Ministeri de Transports, i no el que avança la premsa. Quan surtin els serveis mínims o canviï la convocatòria, ho veuràs aquí.`,
    msHeading: "Serveis mínims",
    whereHeading: "Qui els fixa i on es publiquen",
    whereCaption: "Serveis mínims d'aquesta vaga: qui els fixa i on es consulten",
    whereHeaders: ["Servei", "Qui els fixa", "On es publiquen"],
    affectsHeading: "Què afecta i què no",
    affectsCaption: "Serveis que toca aquesta vaga",
    affectsHeaders: ["Servei", "Afectat per aquesta vaga?"],
    yes: "Sí",
    no: "No",
    affectsNote: "Només aquesta vaga. Les altres vagues d'aquests dies són més avall.",
    todoHeading: "Què cal fer",
    othersHeading: "Altres vagues aquells dies",
    othersIntro: "Vagues anunciades als mateixos dies o en curs, segons la mateixa llista:",
  },
  es: {
    keyFactsTitle: "La huelga, de un vistazo",
    labels: {
      who: "Quién la convoca",
      days: "Días",
      day: "Día",
      daysHours: "Días y horas",
      dayHours: "Día y horas",
      affects: "Afecta a",
      outside: "No entran",
      ms: "Servicios mínimos",
      more: "Además",
    },
    services: {
      rodalies: {
        name: "Rodalies y regionales",
        inline: "Rodalies y regionales",
        who: "Generalitat (Departament d'Empresa i Treball), por orden",
        where: `La orden, en el ${DOGC("DOGC")} y en la ${link(U.treballMs, "lista de huelgas con servicios mínimos")}; el horario de cada línea, en ${link(U.rodaliesStatus, "rodalies.gencat.cat")}`,
      },
      longDistance: {
        name: "Alta velocidad y larga distancia",
        inline: "alta velocidad y larga distancia",
        who: "Ministerio de Transportes, por resolución",
        where: `La resolución, en la ${link(U.ministryRail, "lista de resoluciones de servicios mínimos ferroviarios")}; los trenes que circulan, en ${link(U.renfe, "renfe.com")}`,
      },
      metroBus: {
        name: "Metro y autobuses de TMB",
        inline: "metro y bus de TMB",
        who: "Generalitat (Departament d'Empresa i Treball), por orden",
        where: `La orden, en el ${DOGC("DOGC")}; los horarios, en los ${link(U.tmb, "avisos de servicio de TMB")}`,
      },
      fgcTram: {
        name: "FGC y tranvía",
        inline: "FGC y tranvía",
        who: "Generalitat (Departament d'Empresa i Treball), por orden",
        where: `La orden, en el ${DOGC("DOGC")}; el estado del servicio, en ${link(U.fgc, "fgc.cat")}`,
      },
      health: {
        name: "Hospitales, CAP y urgencias",
        inline: "hospitales, CAP y urgencias",
        who: "Generalitat (Departament d'Empresa i Treball), por orden",
        where: `La orden, en el ${DOGC("DOGC")}; tu centro de salud u hospital te informa`,
      },
      schools: {
        name: "Colegios e institutos",
        inline: "colegios e institutos",
        who: "Generalitat (Departament d'Empresa i Treball), por orden",
        where: `La orden, en el ${DOGC("DOGC")} y en la ${link(U.treballMs, "lista de huelgas con servicios mínimos")}; el colegio informa a las familias`,
      },
    },
    sets: (parts) => {
      const who = { generalitat: "la Generalitat, por orden en el DOGC", state: "el Ministerio de Transportes, por resolución" };
      const items = parts.map((p) => `${who[p.authority]} (${p.names})`);
      return items.length === 1 ? `los fija ${items[0]}` : `los fijan ${andList(items, "es")}`;
    },
    msPending: (msShort, checked, sets) => `**${msShort}** (consultado el ${checked}): ${sets}, pocos días antes de la huelga.`,
    checkedNote: (checked) => `consultado el ${checked}`,
    today: (day) => `**Hoy, ${day}, es día de huelga.**`,
    past: (hub) => `Esta huelga ya ha pasado: aquí tienes lo que se había anunciado y los servicios mínimos, tal como estaban en las fuentes oficiales. Las próximas huelgas, en ${hub}.`,
    hubLabel: "la guía de huelgas en Cataluña",
    data: (hub) =>
      `Esta página se hace con la misma lista de huelgas que ${hub}: solo lo que publican el sindicato convocante, los operadores, el DOGC, el BOE y el Ministerio de Transportes, no lo que adelanta la prensa. Cuando salgan los servicios mínimos o cambie la convocatoria, lo verás aquí.`,
    msHeading: "Servicios mínimos",
    whereHeading: "Quién los fija y dónde se publican",
    whereCaption: "Servicios mínimos de esta huelga: quién los fija y dónde se consultan",
    whereHeaders: ["Servicio", "Quién los fija", "Dónde se publican"],
    affectsHeading: "A qué afecta y a qué no",
    affectsCaption: "Servicios que toca esta huelga",
    affectsHeaders: ["Servicio", "¿Le afecta esta huelga?"],
    yes: "Sí",
    no: "No",
    affectsNote: "Solo esta huelga. Las demás huelgas de esos días están más abajo.",
    todoHeading: "Qué hacer",
    othersHeading: "Otras huelgas esos días",
    othersIntro: "Huelgas anunciadas para los mismos días o en curso, según la misma lista:",
  },
  en: {
    keyFactsTitle: "The strike at a glance",
    labels: {
      who: "Called by",
      days: "Days",
      day: "Day",
      daysHours: "Days and hours",
      dayHours: "Day and hours",
      affects: "Affects",
      outside: "Not part of it",
      ms: "Minimum services",
      more: "Also",
    },
    services: {
      rodalies: {
        name: "Rodalies and regional trains",
        inline: "Rodalies and regional trains",
        who: "Generalitat (Department of Business and Labour), by order",
        where: `The order, in the ${DOGC("DOGC")} and on the ${link(U.treballMs, "list of strikes with minimum services")}; each line's timetable, on ${link(U.rodaliesStatus, "rodalies.gencat.cat")}`,
      },
      longDistance: {
        name: "High-speed and long-distance trains",
        inline: "high-speed and long-distance trains",
        who: "Spain's Ministry of Transport, by resolution",
        where: `The resolution, on the ${link(U.ministryRail, "list of rail minimum-service resolutions")}; which trains run, on ${link(U.renfe, "renfe.com")}`,
      },
      metroBus: {
        name: "TMB metro and buses",
        inline: "TMB metro and buses",
        who: "Generalitat (Department of Business and Labour), by order",
        where: `The order, in the ${DOGC("DOGC")}; timetables, in ${link(U.tmb, "TMB's service notices")}`,
      },
      fgcTram: {
        name: "FGC and tram",
        inline: "FGC and tram",
        who: "Generalitat (Department of Business and Labour), by order",
        where: `The order, in the ${DOGC("DOGC")}; service status, on ${link(U.fgc, "fgc.cat")}`,
      },
      health: {
        name: "Hospitals, health centres and A&E",
        inline: "hospitals, health centres and A&E",
        who: "Generalitat (Department of Business and Labour), by order",
        where: `The order, in the ${DOGC("DOGC")}; your health centre or hospital tells you`,
      },
      schools: {
        name: "Schools",
        inline: "schools",
        who: "Generalitat (Department of Business and Labour), by order",
        where: `The order, in the ${DOGC("DOGC")} and on the ${link(U.treballMs, "list of strikes with minimum services")}; your school tells families`,
      },
    },
    sets: (parts) => {
      // "the Generalitat sets them in an order in the DOGC (…) and Spain's Ministry of Transport in a resolution (…)".
      const subject = { generalitat: "the Generalitat", state: "Spain's Ministry of Transport" };
      const means = { generalitat: "in an order in the DOGC", state: "in a resolution" };
      const items = parts.map((p, i) => `${subject[p.authority]}${i === 0 ? " sets them" : ""} ${means[p.authority]} (${p.names})`);
      return andList(items, "en");
    },
    msPending: (msShort, checked, sets) => `**${msShort}** (checked on ${checked}): ${sets}, a few days before the strike.`,
    checkedNote: (checked) => `checked on ${checked}`,
    today: (day) => `**Today, ${day}, is a strike day.**`,
    past: (hub) => `This strike is over: here is what had been announced and the minimum services, as they stood in the official sources. Strikes still to come are in ${hub}.`,
    hubLabel: "our guide to strikes in Barcelona and Catalonia",
    data: (hub) =>
      `This page is built from the same list of strikes as ${hub}: only what the union calling the strike, the operators, the DOGC and BOE gazettes and the Ministry of Transport publish, never what the press reports ahead of them. When minimum services come out or the call changes, you will see it here.`,
    msHeading: "Minimum services",
    whereHeading: "Who sets them and where they are published",
    whereCaption: "Minimum services for this strike: who sets them and where to check",
    whereHeaders: ["Service", "Who sets them", "Where they are published"],
    affectsHeading: "What it affects and what it does not",
    affectsCaption: "Services this strike touches",
    affectsHeaders: ["Service", "Affected by this strike?"],
    yes: "Yes",
    no: "No",
    affectsNote: "This strike only. Other strikes on those days are listed further down.",
    todoHeading: "What to do",
    othersHeading: "Other strikes on those days",
    othersIntro: "Strikes announced for the same days or under way, from the same list:",
  },
};

/* -------------------------------------------------------------------------- */
/* Reading the entry                                                          */
/* -------------------------------------------------------------------------- */

const WHO_LABELS = ["Convocatòria", "Convocatoria", "Called by"];
const WHEN_LABELS = ["Dies", "Dia", "Días", "Día", "Days", "Day"];

/** "**Convocatòria:** el sindicat ..." -> { label: "Convocatòria", value: "El sindicat ..." }. */
export function splitFact(fact: string): { label: string | null; value: string } {
  // "**Label:** value" or "**Label**: value". A bold lead-in without a colon
  // ("**Entre els dos dies**, el dimecres ...") is part of the sentence: kept whole.
  const match = fact.match(/^\*\*([^*]+?):\*\*\s*|^\*\*([^*]+?)\*\*:\s*/);
  if (!match) return { label: null, value: fact };
  const label = (match[1] ?? match[2] ?? "").trim();
  return { label, value: cap(fact.slice(match[0].length).trim()) };
}

/** Who calls it and its days (with the hours, or that they are not out), from the entry's facts. */
export function strikeWhoWhen(strike: Strike, locale: Locale): { who: string | null; when: string | null } {
  const parsed = strike.facts[locale].map(splitFact);
  const who = parsed.find((p) => p.label && WHO_LABELS.includes(p.label))?.value ?? null;
  const when = parsed.find((p) => p.label && WHEN_LABELS.includes(p.label))?.value ?? null;
  return { who, when };
}

/** Other strikes on the list that overlap this one's days (three days either side) or are under way. */
export function nearbyStrikes(strike: Strike, asOf: string = STRIKES_AS_OF, strikes: Strike[] = STRIKES): Strike[] {
  const first = strike.dates[0] ?? "";
  const last = lastDay(strike);
  const shift = (iso: string, days: number) => {
    const date = new Date(`${iso}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  };
  const from = shift(first, -3);
  const to = shift(last, 3);
  return upcomingStrikes(asOf, strikes).filter(
    (other) => other.id !== strike.id && (isOpen(other) || other.dates.some((day) => day >= from && day <= to)),
  );
}

/** Where another strike is explained: its own guide, the 11N page, or the hub. */
function strikeLink(other: Strike, locale: Locale): string {
  if (other.guide) return b2link(other.guide, locale, B2_TITLES[other.guide][locale]);
  if (other.scope === "general" && other.dates.includes(STRIKE_11N_DATE)) return b2link("strike11n", locale, B2_TITLES.strike11n[locale]);
  return b2link("strikes", locale, B2_TITLES.strikes[locale]);
}

/* -------------------------------------------------------------------------- */
/* Guide specs                                                                */
/* -------------------------------------------------------------------------- */

interface Ctx {
  locale: Locale;
  strike: Strike;
  asOf: string;
  /** strikeDays: "dimarts 10 de novembre i dijous 12 de novembre de 2026". */
  days: string;
  checked: string;
  upcoming: boolean;
  who: string | null;
  when: string | null;
  outside: ServiceKey[];
  others: Strike[];
}

interface SpecCopy {
  /** Candidates, best first; the first within 60 characters is used. */
  seoTitles: (t: TitleParts) => string[];
  title: (t: TitleParts) => string;
  excerpt: (t: TitleParts) => string;
  /** Closing words of the description, when they fit. */
  descTail: string;
  pastTail: string;
  /** Blocks under the "what it affects" table. */
  section: (c: Ctx) => Block[];
  /** Tips after the entry's own advice. */
  todo: (c: Ctx) => string[];
  faq: (c: Ctx) => { question: string; answer: string }[];
}

interface GuideSpec {
  key: StrikeGuideKey;
  strikeId: string;
  entryKey: string;
  publishedAt: string;
  /** Services named as outside the strike, when the entry does not list them in `affects`. */
  outside: ServiceKey[];
  related: B2Key[];
  hero: { key: string; alt: Record<Locale, string>; caption: Record<Locale, string> };
  copy: Record<Locale, SpecCopy>;
}

const lineName = (id: LineId) => (id === "R2N" ? "R2 Nord" : id === "R2S" ? "R2 Sud" : id);

/** "[R1](/ca/rodalies/r1/) · [R2](...)": the live page of every line (Catalan and Spanish only). */
function lineLinks(locale: "ca" | "es"): string {
  return LINE_IDS.map((id) => link(linePath(locale, id), lineName(id))).join(" · ");
}

const schoolTerm = (iso: string) => schoolStatusOn(iso).kind === "term";
const schoolPath = (locale: Locale) => `/${locale}/${TOOL_PATHS.school[locale]}/`;
const schoolYearLabel = (iso: string) => {
  const status = schoolStatusOn(iso);
  return status.kind === "term" ? status.year.label : "";
};

/** Other strikes on the same days that touch the metro or TMB buses. */
const metroSameDay = (c: Ctx) => c.others.filter((o) => o.affects.includes("metroBus") && o.dates.some((d) => c.strike.dates.includes(d)));

const RENFE: GuideSpec = {
  key: "strikeRenfe",
  strikeId: "vaga-renfe-2026-11-10",
  entryKey: "guide-strike-renfe-november-2026",
  publishedAt: "2026-11-04T12:00:00+01:00",
  outside: ["metroBus", "fgcTram"],
  related: ["strikes", "strike11n", "hours", "airport", "transport"],
  // No new photograph: the Rodalies trains of the trains feature (also the
  // hub's and the 11N page's hero), with that feature's exact alt and caption.
  hero: { key: TRAINS.heroKey ?? "", alt: TRAINS.heroAlt ?? { ca: "", es: "", en: "" }, caption: TRAINS.heroCaption ?? { ca: "", es: "", en: "" } },
  copy: {
    ca: {
      seoTitles: (t) => [`Vaga Renfe ${t.bare} ${t.year}: Rodalies i serveis mínims`, `Vaga Renfe ${t.bare}: Rodalies i serveis mínims`, `Vaga Renfe ${t.bare}: serveis mínims`],
      title: (t) => `Vaga de Renfe i Rodalies el ${t.days} de ${t.year}: serveis mínims, línies i què fer`,
      excerpt: (t) => `La vaga de maquinistes del Grup Renfe del ${t.days} de ${t.year}: qui la convoca, què afecta, els serveis mínims de Rodalies i què pots fer.`,
      descTail: "Rodalies: línies i què fer.",
      pastTail: "Què es va anunciar i quins serveis mínims es van fixar.",
      section: (c) => [
        ...paras(
          `Rodalies de Catalunya i els trens regionals són un servei del Grup Renfe: per a la vaga del 29 d'octubre, l'${link(U.ordreRenfe29, "Ordre EMT/210/2026")} en garantia «el servei essencial de transport de viatgers per ferrocarril a Catalunya (serveis de rodalies i regionals) que presta l'empresa Grupo Renfe», i ${link(U.rodalies29, "l'avís de Rodalies")} enllaçava l'horari de serveis mínims de cada línia.${c.strike.minimumServices.status === "pending" ? ` Quan es publiquin els d'aquesta vaga, mira'ls a ${link(U.rodaliesStatus, "rodalies.gencat.cat")}.` : ""}`,
          `**Els avisos en directe de cada línia:** ${lineLinks("ca")}.`,
        ),
      ],
      todo: (c) => [
        "**No tots els trens de la teva hora hi seran:** els serveis mínims no els reparteixen igual a totes les hores (per a la vaga del 29 d'octubre, més en hora punta que la resta del dia). Mira el teu tren el vespre abans i el mateix matí.",
        ...(c.outside.length > 0 ? [`**Alternatives que no formen part d'aquesta vaga:** ${c.outside.map((k) => COMMON.ca.services[k].inline).join("; ")}. L'horari d'un dia normal, a ${b2link("hours", "ca", "l'horari del metro i del NitBus")}.`] : []),
        ...(c.strike.affects.includes("longDistance") ? [`**Tens bitllet de llarga distància?** El canvi o la devolució depèn de Renfe: segueix el que publiqui a ${link(U.renfe, "renfe.com")} o t'enviï per correu.`] : []),
        `**Si vas a l'aeroport o en tornes**, les alternatives al tren són a ${b2link("airport", "ca", "la guia de l'aeroport al centre de Barcelona")}.`,
      ],
      faq: (c) => [
        { question: "Quins dies hi ha vaga de Renfe i Rodalies?", answer: c.when ?? cap(c.days) },
        ...(c.who ? [{ question: "Qui convoca la vaga de Renfe?", answer: c.who }] : []),
        { question: "Quins serveis mínims hi ha a Rodalies?", answer: c.strike.minimumServices.text.ca },
        ...(c.outside.includes("metroBus")
          ? [
              {
                question: "Funciona el metro els dies de vaga de Renfe?",
                answer:
                  metroSameDay(c).length === 0
                    ? "Sí: el metro i els autobusos de TMB no formen part d'aquesta vaga. L'horari d'un dia normal és a la guia de l'horari del metro."
                    : `Aquesta vaga no afecta el metro ni els autobusos de TMB, però ${metroSameDay(c).map((o) => `${strikeDays(o, "ca")} hi ha ${o.title.ca}`).join("; ")}.`,
              },
            ]
          : []),
        ...(c.strike.affects.includes("longDistance")
          ? [{ question: "Què faig si tinc un bitllet de llarga distància de Renfe?", answer: "El canvi o la devolució depèn de Renfe: segueix el que publiqui a renfe.com o t'enviï per correu. Els serveis mínims de l'alta velocitat i la llarga distància els fixa el Ministeri de Transports." }]
          : []),
      ],
    },
    es: {
      seoTitles: (t) => [
        `Huelga Renfe ${t.days} ${t.year}: Rodalies y servicios mínimos`,
        `Huelga Renfe ${t.days}: Rodalies y servicios mínimos`,
        `Huelga Renfe ${t.bare}: Rodalies y servicios mínimos`,
        `Huelga Renfe ${t.days}: servicios mínimos`,
      ],
      title: (t) => `Huelga de Renfe y Rodalies el ${t.days} de ${t.year}: servicios mínimos, líneas y qué hacer`,
      excerpt: (t) => `La huelga de maquinistas del Grupo Renfe del ${t.days} de ${t.year}: quién la convoca, a qué afecta, los servicios mínimos de Rodalies y qué puedes hacer.`,
      descTail: "Rodalies: líneas y qué hacer.",
      pastTail: "Qué se anunció y qué servicios mínimos se fijaron.",
      section: (c) => [
        ...paras(
          `Rodalies de Catalunya y los trenes regionales son un servicio del Grupo Renfe: para la huelga del 29 de octubre, la ${link(U.ordreRenfe29, "Ordre EMT/210/2026")} garantizaba «el servei essencial de transport de viatgers per ferrocarril a Catalunya (serveis de rodalies i regionals) que presta l'empresa Grupo Renfe», y ${link(U.rodalies29, "el aviso de Rodalies")} enlazaba el horario de servicios mínimos de cada línea.${c.strike.minimumServices.status === "pending" ? ` Cuando se publiquen los de esta huelga, míralos en ${link(U.rodaliesStatus, "rodalies.gencat.cat")}.` : ""}`,
          `**Los avisos en directo de cada línea:** ${lineLinks("es")}.`,
        ),
      ],
      todo: (c) => [
        "**No estarán todos los trenes de tu hora:** los servicios mínimos no los reparten igual a todas las horas (para la huelga del 29 de octubre, más en hora punta que el resto del día). Mira tu tren la noche antes y la misma mañana.",
        ...(c.outside.length > 0 ? [`**Alternativas que no forman parte de esta huelga:** ${c.outside.map((k) => COMMON.es.services[k].inline).join("; ")}. El horario de un día normal, en ${b2link("hours", "es", "el horario del metro y del NitBus")}.`] : []),
        ...(c.strike.affects.includes("longDistance") ? [`**¿Tienes billete de larga distancia?** El cambio o la devolución depende de Renfe: sigue lo que publique en ${link(U.renfe, "renfe.com")} o te envíe por correo.`] : []),
        `**Si vas al aeropuerto o vuelves de él**, las alternativas al tren están en ${b2link("airport", "es", "la guía del aeropuerto al centro de Barcelona")}.`,
      ],
      faq: (c) => [
        { question: "¿Qué días hay huelga de Renfe y Rodalies?", answer: c.when ?? cap(c.days) },
        ...(c.who ? [{ question: "¿Quién convoca la huelga de Renfe?", answer: c.who }] : []),
        { question: "¿Qué servicios mínimos hay en Rodalies?", answer: c.strike.minimumServices.text.es },
        ...(c.outside.includes("metroBus")
          ? [
              {
                question: "¿Funciona el metro los días de huelga de Renfe?",
                answer:
                  metroSameDay(c).length === 0
                    ? "Sí: el metro y los autobuses de TMB no forman parte de esta huelga. El horario de un día normal está en la guía del horario del metro."
                    : `Esta huelga no afecta al metro ni a los autobuses de TMB, pero ${metroSameDay(c).map((o) => `el ${strikeDays(o, "es")} hay ${o.title.es}`).join("; ")}.`,
              },
            ]
          : []),
        ...(c.strike.affects.includes("longDistance")
          ? [{ question: "¿Qué hago si tengo un billete de larga distancia de Renfe?", answer: "El cambio o la devolución depende de Renfe: sigue lo que publique en renfe.com o te envíe por correo. Los servicios mínimos de la alta velocidad y la larga distancia los fija el Ministerio de Transportes." }]
          : []),
      ],
    },
    en: {
      seoTitles: (t) => [`Renfe strike ${t.days} ${t.year}: Rodalies and what runs`, `Renfe strike ${t.days}: Rodalies and what runs`, `Renfe strike ${t.days}: what runs`],
      title: (t) => `Renfe and Rodalies strike on ${t.days} ${t.year}: minimum services, lines and what to do`,
      excerpt: (t) => `The Renfe Group train drivers' strike on ${t.days} ${t.year}: who called it, what it affects, Rodalies minimum services and what you can do.`,
      descTail: "Rodalies lines and what to do.",
      pastTail: "What was announced and the minimum services that were set.",
      section: (c) => [
        ...paras(
          `Rodalies de Catalunya and the regional trains are a Renfe Group service: for the 29 October strike, ${link(U.ordreRenfe29, "Order EMT/210/2026")} guaranteed "el servei essencial de transport de viatgers per ferrocarril a Catalunya (serveis de rodalies i regionals) que presta l'empresa Grupo Renfe" (the essential rail passenger service in Catalonia, Rodalies and regional, that Grupo Renfe provides), and ${link(U.rodalies29, "Rodalies' notice")} linked a minimum-service timetable for every line.${c.strike.minimumServices.status === "pending" ? ` Once this strike's are out, check them on ${link(U.rodaliesStatus, "rodalies.gencat.cat")}.` : ""}`,
          `**Live notices for every line:** [Rodalies today](${rodaliesHub("en")}), read live from Rodalies de Catalunya.`,
        ),
      ],
      todo: (c) => [
        "**Not every train at your usual time will run:** minimum services do not spread trains evenly over the day (for the 29 October strike, more at peak times than the rest of the day). Check your train the evening before and that morning.",
        ...(c.outside.length > 0 ? [`**Alternatives that are not part of this strike:** ${c.outside.map((k) => COMMON.en.services[k].inline).join("; ")}. Normal-day hours are in ${b2link("hours", "en", "Barcelona metro and night bus hours")}.`] : []),
        ...(c.strike.affects.includes("longDistance") ? [`**Holding a long-distance ticket?** Changes and refunds depend on Renfe: follow what it publishes on ${link(U.renfe, "renfe.com")} or emails you.`] : []),
        `**Going to or from the airport?** The alternatives to the train are in ${b2link("airport", "en", "our airport to city centre guide")}.`,
      ],
      faq: (c) => [
        { question: "When is the Renfe and Rodalies strike?", answer: c.when ?? cap(c.days) },
        ...(c.who ? [{ question: "Who called the Renfe strike?", answer: c.who }] : []),
        { question: "What minimum services are there on Rodalies?", answer: c.strike.minimumServices.text.en },
        ...(c.outside.includes("metroBus")
          ? [
              {
                question: "Does the Barcelona metro run during the Renfe strike?",
                answer:
                  metroSameDay(c).length === 0
                    ? "Yes: the TMB metro and buses are not part of this strike. Normal-day hours are in our metro hours guide."
                    : `This strike does not affect the TMB metro or buses, but ${metroSameDay(c).map((o) => `on ${strikeDays(o, "en")} there is a ${o.title.en}`).join("; ")}.`,
              },
            ]
          : []),
        ...(c.strike.affects.includes("longDistance")
          ? [{ question: "What if I have a Renfe long-distance ticket?", answer: "Changes and refunds depend on Renfe: follow what it publishes on renfe.com or emails you. Spain's Ministry of Transport sets the minimum services for high-speed and long-distance trains." }]
          : []),
      ],
    },
  },
};

/** "El dijous 26 de novembre és dia lectiu al calendari escolar 2026-2027 (...)" when every strike day is a school day. */
function schoolDayLine(c: Ctx, withLink: boolean): string | null {
  if (!c.strike.dates.every(schoolTerm)) return null;
  const article = { ca: "el ", es: "el ", en: "" }[c.locale];
  const day = andList(c.strike.dates.map((iso) => `${article}${dayDate(iso, c.locale, false)}`), c.locale);
  const year = schoolYearLabel(c.strike.dates[0] ?? "");
  const order = withLink ? link(SCHOOL_SOURCE.url, c.locale === "en" ? "Order EDF/66/2026" : "Ordre EDF/66/2026") : c.locale === "en" ? "Order EDF/66/2026" : "Ordre EDF/66/2026";
  const plural = c.strike.dates.length > 1;
  return {
    ca: `${cap(day)} ${plural ? "són dies lectius" : "és dia lectiu"} al calendari escolar ${year} (${order}).`,
    es: `${cap(day)} ${plural ? "son días lectivos" : "es día lectivo"} en el calendario escolar ${year} (${order}).`,
    en: `${cap(day)} ${plural ? "are school days" : "is a school day"} in the ${year} school calendar (${order}).`,
  }[c.locale];
}

const EDUCATION: GuideSpec = {
  key: "strikeEducation",
  strikeId: "vaga-educacio-2026-11-26",
  entryKey: "guide-strike-education-november-2026",
  publishedAt: "2026-11-04T12:00:00+01:00",
  outside: [],
  related: ["strikes", "strike11n", "workCalendar", "holidayToday"],
  // The school calendar guide's own photograph, with its exact alt text and
  // caption (media rows are keyed by file; src/lib/content/school/publish.ts).
  hero: {
    key: "calendari-escolar-escola-vic-pati",
    alt: {
      ca: "Façana de l'Escola Jaume Balmes de Vic amb el pati enrajolat al davant",
      es: "Fachada de la Escola Jaume Balmes de Vic con el patio embaldosado delante",
      en: "Front of the Jaume Balmes school in Vic with its paved playground",
    },
    caption: { ca: "L'Escola Jaume Balmes, a Vic.", es: "La Escola Jaume Balmes, en Vic.", en: "Jaume Balmes school, Vic." },
  },
  copy: {
    ca: {
      seoTitles: (t) => [`Vaga educació ${t.bare} ${t.year}: escoles i serveis mínims`, `Vaga educació ${t.bare}: escoles i serveis mínims`, `Vaga educació ${t.bare}: serveis mínims`],
      title: (t) => `Vaga a l'educació el ${t.days} de ${t.year}: escoles, serveis mínims i què fer`,
      excerpt: (t) => `La vaga a l'educació del ${t.days} de ${t.year} a Catalunya: qui la convoca, si hi ha escola, els serveis mínims i què han de saber les famílies.`,
      descTail: "Hi ha escola? Què fer.",
      pastTail: "Què es va anunciar i quins serveis mínims es van fixar.",
      section: (c) => {
        const line = schoolDayLine(c, true);
        return line ? paras(`**${line}** El calendari complet, amb els festius i els dies de lliure disposició: ${link(schoolPath("ca"), "calendari escolar 2026-2027")}.`) : [];
      },
      todo: () => [
        `**Si treballes a l'escola i vols fer vaga**, no cal que ho avisis abans: «La normativa reguladora del dret de vaga no contempla l'obligació de preavís per part de la persona treballadora», segons el ${link(STRIKE_11N_URLS.treballFaq, "Departament d'Empresa i Treball")}. Aquell dia no cobres: durant la vaga el contracte queda suspès (article 6.2 del ${link(U.rdl17, "Reial decret llei 17/1977")}).`,
      ],
      faq: (c) => [
        { question: "Quan és la vaga a l'educació?", answer: c.when ?? cap(c.days) },
        { question: `Hi ha escola el ${shortDate(c.strike.dates[0] ?? "", "ca")}?`, answer: [schoolDayLine(c, false) ? `Sí. ${schoolDayLine(c, false)}` : "", ...c.strike.advice.ca].filter(Boolean).join(" ") },
        { question: "Quins serveis mínims hi ha a les escoles?", answer: c.strike.minimumServices.text.ca },
        ...(c.who ? [{ question: "Qui convoca la vaga a l'educació?", answer: c.who }] : []),
        { question: "He d'avisar si faig vaga?", answer: "No. Segons el Departament d'Empresa i Treball, la normativa no obliga la persona treballadora a avisar abans. Aquell dia no cobres: durant la vaga el contracte queda suspès (article 6.2 del Reial decret llei 17/1977)." },
      ],
    },
    es: {
      seoTitles: (t) => [`Huelga educación Cataluña ${t.days}: servicios mínimos`, `Huelga educación ${t.days}: servicios mínimos`, `Huelga educación ${t.bare}`],
      title: (t) => `Huelga en la educación el ${t.days} de ${t.year} en Cataluña: colegios, servicios mínimos y qué hacer`,
      excerpt: (t) => `La huelga en la educación del ${t.days} de ${t.year} en Cataluña: quién la convoca, si hay colegio, los servicios mínimos y qué deben saber las familias.`,
      descTail: "¿Hay colegio? Qué hacer.",
      pastTail: "Qué se anunció y qué servicios mínimos se fijaron.",
      section: (c) => {
        const line = schoolDayLine(c, true);
        return line ? paras(`**${line}** El calendario completo, con los festivos y los días de libre disposición: ${link(schoolPath("es"), "calendario escolar 2026-2027")}.`) : [];
      },
      todo: () => [
        `**Si trabajas en el colegio y quieres hacer huelga**, no hace falta avisar antes: la normativa del derecho de huelga no obliga a la persona trabajadora a avisar, según el ${link(STRIKE_11N_URLS.treballFaq, "Departament d'Empresa i Treball")}. Ese día no cobras: durante la huelga el contrato queda suspendido (artículo 6.2 del ${link(U.rdl17, "Real Decreto-ley 17/1977")}).`,
      ],
      faq: (c) => [
        { question: "¿Cuándo es la huelga en la educación?", answer: c.when ?? cap(c.days) },
        { question: `¿Hay colegio el ${shortDate(c.strike.dates[0] ?? "", "es")}?`, answer: [schoolDayLine(c, false) ? `Sí. ${schoolDayLine(c, false)}` : "", ...c.strike.advice.es].filter(Boolean).join(" ") },
        { question: "¿Qué servicios mínimos hay en los colegios?", answer: c.strike.minimumServices.text.es },
        ...(c.who ? [{ question: "¿Quién convoca la huelga en la educación?", answer: c.who }] : []),
        { question: "¿Tengo que avisar si hago huelga?", answer: "No. Según el Departament d'Empresa i Treball, la normativa no obliga a la persona trabajadora a avisar antes. Ese día no cobras: durante la huelga el contrato queda suspendido (artículo 6.2 del Real Decreto-ley 17/1977)." },
      ],
    },
    en: {
      seoTitles: (t) => [`Catalonia teachers' strike ${t.days} ${t.year}: are schools open?`, `Catalonia teachers' strike ${t.days}: are schools open?`, `Catalonia teachers' strike ${t.days}`],
      title: (t) => `Catalonia teachers' strike on ${t.days} ${t.year}: schools, minimum services and what to do`,
      excerpt: (t) => `The education strike in Catalonia on ${t.days} ${t.year}: who called it, whether schools open, minimum services and what parents need to know.`,
      descTail: "Is there school? What to do.",
      pastTail: "What was announced and the minimum services that were set.",
      section: (c) => {
        const line = schoolDayLine(c, true);
        return line ? paras(`**${line}** The full calendar, with holidays and each school's own free days: ${link(schoolPath("en"), "Catalonia school calendar 2026-2027")}.`) : [];
      },
      todo: () => [
        `**Working at a school and want to strike?** You do not have to tell anyone beforehand: the rules on strikes do not require individual workers to give notice, according to the Generalitat's ${link(STRIKE_11N_URLS.treballFaq, "Department of Business and Labour")}. You are not paid for the day: the contract is suspended during the strike (Article 6.2 of ${link(U.rdl17, "Royal Decree-Law 17/1977")}).`,
      ],
      faq: (c) => [
        { question: "When is the education strike in Catalonia?", answer: c.when ?? cap(c.days) },
        { question: `Is there school on ${shortDate(c.strike.dates[0] ?? "", "en")}?`, answer: [schoolDayLine(c, false) ? `Yes. ${schoolDayLine(c, false)}` : "", ...c.strike.advice.en].filter(Boolean).join(" ") },
        { question: "What minimum services are there in schools?", answer: c.strike.minimumServices.text.en },
        ...(c.who ? [{ question: "Who called the education strike?", answer: c.who }] : []),
        { question: "Do I have to give notice if I strike?", answer: "No. According to the Generalitat's Department of Business and Labour, individual workers do not have to give notice. You are not paid for the day: the contract is suspended during the strike (Article 6.2 of Royal Decree-Law 17/1977)." },
      ],
    },
  },
};

export const STRIKE_GUIDE_SPECS: GuideSpec[] = [RENFE, EDUCATION];

/* -------------------------------------------------------------------------- */
/* Rendering                                                                  */
/* -------------------------------------------------------------------------- */

function strikeFor(spec: GuideSpec, strikes: Strike[]): Strike {
  const strike = strikes.find((s) => s.id === spec.strikeId);
  if (!strike) throw new Error(`strike-guides: no entry "${spec.strikeId}" in strikes.ts for ${spec.key}`);
  return strike;
}

function context(spec: GuideSpec, locale: Locale, asOf: string, strikes: Strike[]): Ctx {
  const strike = strikeFor(spec, strikes);
  const { who, when } = strikeWhoWhen(strike, locale);
  return {
    locale,
    strike,
    asOf,
    days: strikeDays(strike, locale),
    checked: dateYear(asOf, locale),
    upcoming: isUpcoming(strike, asOf),
    who,
    when,
    outside: spec.outside.filter((key) => !strike.affects.includes(key)),
    others: nearbyStrikes(strike, asOf, strikes),
  };
}

/** "Rodalies i regionals; alta velocitat i llarga distància". */
const inlineList = (keys: ServiceKey[], locale: Locale) => keys.map((key) => COMMON[locale].services[key].inline).join("; ");

function msLead(c: Ctx): string {
  const t = COMMON[c.locale];
  const ms = c.strike.minimumServices;
  if (ms.status !== "pending") return `**${ms.msShort[c.locale]}.**`;
  const parts = (["generalitat", "state"] as Authority[])
    .map((authority) => ({ authority, keys: c.strike.affects.filter((key) => AUTHORITY[key] === authority) }))
    .filter((p) => p.keys.length > 0)
    .map((p) => ({ authority: p.authority, names: p.keys.map((key) => t.services[key].inline).join(", ") }));
  return t.msPending(ms.msShort[c.locale], c.checked, t.sets(parts));
}

export function buildStrikeGuideBody(
  key: StrikeGuideKey,
  locale: Locale,
  asOf: string = STRIKES_AS_OF,
  strikes: Strike[] = STRIKES,
): Block[] {
  const spec = STRIKE_GUIDE_SPECS.find((s) => s.key === key);
  if (!spec) throw new Error(`strike-guides: unknown guide ${key}`);
  const c = context(spec, locale, asOf, strikes);
  const t = COMMON[locale];
  const s = spec.copy[locale];
  const strike = c.strike;
  const hub = b2link("strikes", locale, t.hubLabel);
  const blocks: Block[] = [];

  // 1. The answer: days, what it is, what it touches, where minimum services stand.
  const affectsLine = `**${t.labels.affects}:** ${inlineList(strike.affects, locale)}.${c.outside.length > 0 ? ` **${t.labels.outside}:** ${inlineList(c.outside, locale)}.` : ""}`;
  blocks.push(
    lead(
      [
        isOnDay(strike, asOf) ? t.today(dayDate(asOf, locale)) : "",
        `**${cap(c.days)}: ${strike.short[locale]}.**`,
        affectsLine,
        msLead(c),
        c.upcoming ? "" : t.past(hub),
      ]
        .filter(Boolean)
        .join(" "),
    ),
  );

  // 2. Key facts: who, days and hours, what it touches, minimum services, then the entry's other facts.
  const parsed = strike.facts[locale].map(splitFact);
  const isWho = (p: { label: string | null }) => Boolean(p.label && WHO_LABELS.includes(p.label));
  const isWhen = (p: { label: string | null }) => Boolean(p.label && WHEN_LABELS.includes(p.label));
  const single = strike.dates.length === 1 && !strike.indefinite;
  blocks.push(
    keyFacts(t.keyFactsTitle, [
      ...(c.who ? [{ label: t.labels.who, value: c.who }] : []),
      c.when ? { label: single ? t.labels.dayHours : t.labels.daysHours, value: c.when } : { label: single ? t.labels.day : t.labels.days, value: cap(c.days) },
      { label: t.labels.affects, value: cap(inlineList(strike.affects, locale)) },
      ...(c.outside.length > 0 ? [{ label: t.labels.outside, value: cap(inlineList(c.outside, locale)) }] : []),
      {
        label: t.labels.ms,
        value: strike.minimumServices.status === "pending" ? `${strike.minimumServices.msShort[locale]} (${t.checkedNote(c.checked)})` : strike.minimumServices.msShort[locale],
      },
      ...parsed.filter((p) => !isWho(p) && !isWhen(p)).map((p) => ({ label: p.label ?? t.labels.more, value: p.value })),
    ]),
  );

  // "En català · En castellano · In English", under the answer (as on the hub and the 11N page).
  blocks.push(languageLinks());
  blocks.push(callout("official", verifiedLine(locale, STRIKES_VERIFIED), t.data(hub)));

  // 3. Minimum services: the entry's own text, then who sets them and where.
  blocks.push(heading(2, t.msHeading, "serveis-minims"));
  blocks.push(...paras(strike.minimumServices.text[locale]));
  blocks.push(...h3(t.whereHeading));
  blocks.push(
    table(
      t.whereCaption,
      [...t.whereHeaders],
      strike.affects.map((k) => [t.services[k].name, t.services[k].who, t.services[k].where]),
    ),
  );

  // 4. What it touches, service by service, then lines or the school day.
  blocks.push(heading(2, t.affectsHeading, "que-afecta"));
  blocks.push(
    table(
      t.affectsCaption,
      [...t.affectsHeaders],
      SERVICE_KEYS.map((k) => [t.services[k].name, strike.affects.includes(k) ? t.yes : t.no]),
      t.affectsNote,
    ),
  );
  blocks.push(...s.section(c));

  // 5. What to do: only while the strike is still to come.
  if (c.upcoming) {
    blocks.push(heading(2, t.todoHeading, "que-fer"));
    blocks.push(list(...strike.advice[locale], ...s.todo(c)));
  }

  // 6. Other strikes those days (the general strike between Renfe's two days, for one).
  if (c.upcoming && c.others.length > 0) {
    blocks.push(heading(2, t.othersHeading, "altres-vagues"));
    blocks.push(...paras(t.othersIntro));
    blocks.push(list(...c.others.map((o) => `**${cap(strikeDays(o, locale))}:** ${o.title[locale]}. ${strikeLink(o, locale)}`)));
  }

  blocks.push(faq(s.faq(c).map((item) => ({ question: item.question, answer: strip(item.answer) }))));
  blocks.push(...paras(verifiedLine(locale, STRIKES_VERIFIED)));
  blocks.push(...b2Related(spec.related, locale));
  return blocks;
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

export function strikeGuideMeta(key: StrikeGuideKey, locale: Locale, strikes: Strike[] = STRIKES): { title: string; seoTitle: string; excerpt: string } {
  const spec = STRIKE_GUIDE_SPECS.find((s) => s.key === key);
  if (!spec) throw new Error(`strike-guides: unknown guide ${key}`);
  const parts = titleParts(strikeFor(spec, strikes), locale);
  const copy = spec.copy[locale];
  return { title: copy.title(parts), seoTitle: firstFit(copy.seoTitles(parts), SEO_TITLE_LIMIT), excerpt: copy.excerpt(parts) };
}

/**
 * Answer first: the days, what the strike is and where its minimum services
 * stand, as many of those words as fit in 155 characters.
 */
export function strikeGuideDescription(key: StrikeGuideKey, locale: Locale, asOf: string = STRIKES_AS_OF, strikes: Strike[] = STRIKES): string {
  const spec = STRIKE_GUIDE_SPECS.find((s) => s.key === key);
  if (!spec) throw new Error(`strike-guides: unknown guide ${key}`);
  const strike = strikeFor(spec, strikes);
  const copy = spec.copy[locale];
  const parts = titleParts(strike, locale);
  const withYear = locale === "en" ? `${parts.days} ${parts.year}` : `${parts.days} de ${parts.year}`;
  const title = strike.title[locale];
  if (!isUpcoming(strike, asOf)) return firstFit([`${cap(withYear)}: ${title}. ${copy.pastTail}`, `${cap(withYear)}: ${title}.`], DESCRIPTION_LIMIT);
  const full = strikeDays(strike, locale);
  const weekdays = `${compactDays(strike.dates, locale, { weekdays: true })}${locale === "en" ? " " : " de "}${parts.year}`;
  const ms = strike.minimumServices.msShort[locale];
  const candidates: string[] = [];
  for (const tail of [` ${copy.descTail}`, ""]) {
    for (const main of [strike.short[locale], title]) {
      for (const days of [full, weekdays, withYear]) candidates.push(`${cap(days)}: ${main}. ${ms}.${tail}`);
    }
  }
  candidates.push(`${cap(withYear)}: ${title}. ${copy.descTail}`);
  return firstFit(candidates, DESCRIPTION_LIMIT);
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

/** Names for every official page the guides' own copy links to. */
const KNOWN_SOURCES: B2Source[] = [
  { name: "Diari Oficial de la Generalitat de Catalunya", url: U.dogc, publisher: "DOGC" },
  { name: "Informació de vagues amb serveis mínims (e-Tauler)", url: U.treballMs, publisher: "Departament d'Empresa i Treball" },
  { name: "Resoluciones de servicios mínimos ferroviarios", url: U.ministryRail, publisher: "Ministerio de Transportes y Movilidad Sostenible" },
  { name: "Alteracions del servei", url: U.rodaliesStatus, publisher: "Rodalies de Catalunya" },
  { name: "Renfe", url: U.renfe, publisher: "Renfe" },
  { name: "Avisos de servei", url: U.tmb, publisher: "TMB" },
  { name: "Ferrocarrils de la Generalitat de Catalunya", url: U.fgc, publisher: "FGC" },
  {
    name: "Ordre EMT/210/2026, de 22 d'octubre, per la qual es garanteix el servei essencial de transport de viatgers per ferrocarril a Catalunya (serveis de rodalies i regionals) que presta l'empresa Grupo Renfe (DOGC núm. 9780, 26/10/2026)",
    url: U.ordreRenfe29,
    publisher: "DOGC",
  },
  { name: "Convocatòria de vaga del dijous 29 d'octubre", url: U.rodalies29, publisher: "Rodalies de Catalunya" },
  { name: "Preguntes més freqüents: vagues", url: STRIKE_11N_URLS.treballFaq, publisher: "Departament d'Empresa i Treball" },
  { name: "Real Decreto-ley 17/1977, de 4 de marzo, sobre relaciones de trabajo (artículos 3, 4 y 6)", url: U.rdl17, publisher: "BOE" },
  { name: SCHOOL_SOURCE.name, url: SCHOOL_SOURCE.url, publisher: "DOGC" },
];

/** Every external page a guide links to, in any language: the entry's sources first, then the guide's own. */
export function strikeGuideSources(key: StrikeGuideKey, editions: Block[][], strikes: Strike[] = STRIKES): B2Source[] {
  const spec = STRIKE_GUIDE_SPECS.find((s) => s.key === key);
  if (!spec) throw new Error(`strike-guides: unknown guide ${key}`);
  const linked = new Set(editions.flatMap((blocks) => [...JSON.stringify(blocks).matchAll(/\]\((https:[^)]+)\)/g)].map((m) => m[1] ?? "")));
  const seen = new Set<string>();
  const all: B2Source[] = [];
  const add = (source: B2Source) => {
    if (seen.has(source.url)) return;
    seen.add(source.url);
    all.push({ name: source.name, url: source.url, publisher: source.publisher });
  };
  for (const source of strikeFor(spec, strikes).sources) add(source);
  for (const source of KNOWN_SOURCES) if (linked.has(source.url)) add(source);
  // A link nobody named (a new URL in the entry's text): listed under its host, which the tests flag.
  for (const url of linked) add({ name: new URL(url).host, url, publisher: new URL(url).host });
  return all;
}

/* -------------------------------------------------------------------------- */
/* Articles                                                                   */
/* -------------------------------------------------------------------------- */

const LOCALES_ORDER: Locale[] = ["ca", "es", "en"];

function guideArticle(spec: GuideSpec): B2Article {
  const blocks = Object.fromEntries(LOCALES_ORDER.map((locale) => [locale, buildStrikeGuideBody(spec.key, locale)])) as Record<Locale, Block[]>;
  return {
    key: spec.key,
    entryKey: spec.entryKey,
    categoryKey: "public-services",
    sources: strikeGuideSources(spec.key, LOCALES_ORDER.map((locale) => blocks[locale])),
    heroKey: spec.hero.key,
    heroAlt: spec.hero.alt,
    heroCaption: spec.hero.caption,
    verifiedAt: STRIKES_VERIFIED,
    publishedAt: spec.publishedAt,
    editions: Object.fromEntries(
      LOCALES_ORDER.map((locale) => [
        locale,
        {
          path: B2_PATHS[spec.key][locale],
          ...strikeGuideMeta(spec.key, locale),
          seoDescription: strikeGuideDescription(spec.key, locale),
          blocks: blocks[locale],
        },
      ]),
    ) as B2Article["editions"],
  };
}

export const STRIKE_RENFE_GUIDE: B2Article = guideArticle(RENFE);
export const STRIKE_EDUCATION_GUIDE: B2Article = guideArticle(EDUCATION);
