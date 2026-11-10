import type { Block } from "@/lib/content/blocks";
import { WEEKDAY_NAMES, addDays, shortDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

import { dateYear, dayDate, range, span } from "./festive";
import { B2_PATHS, B2_TITLES, RELATED_HEADING, b2link, callout, faq, lead, list, paras, table, verifiedLine, type B2Article, type B2Key, type B2Source } from "./shared";
import { CITY_HERO } from "./strike-11n-cities";
import { STRIKE_11N_SPAIN } from "./strike-11n-spain";
import { STRIKES, andList, isUpcoming as isCatalanUpcoming, strikeDays as catalanDays, type Strike } from "./strikes";
import {
  SPAIN_FRAMEWORK_SOURCES,
  SPAIN_NOT_HAPPENING,
  SPAIN_OPEN_STRIKES,
  SPAIN_STRIKES,
  SPAIN_URLS,
  STRIKES_SPAIN_AS_OF,
  STRIKES_SPAIN_VERIFIED,
} from "./strikes-spain-data";
import type { L, SpainCallStatus, SpainNotHappening, SpainOpenStrike, SpainStrike } from "./strikes-spain-model";

/**
 * "Huelgas en España": the Spain-wide strikes calendar, one evergreen URL in
 * three languages (/es/guias/huelgas-espana/, /ca/guies/vagues-espanya/,
 * /en/guides/strikes-spain/). It answers "huelgas en España hoy / esta
 * semana": a day-by-day table of the week that holds STRIKES_SPAIN_AS_OF, a
 * calendar of every dated strike, one section per strike (who calls it,
 * status, minimum services, each with its official source), the open-ended
 * airport strikes, the strikes that only exist in Catalonia (read from the
 * Catalan hub, `strikes.ts`), and what was postponed or called off.
 *
 * Why: strikes were the site's first traffic source in November 2026, and
 * most of that demand is Spain-wide and place-less. The Catalan hub answers
 * for Catalonia only.
 *
 * Deterministic: nothing here reads the clock. Only STRIKES_SPAIN_AS_OF
 * decides which week is "this week" and which strikes are "recent", and every
 * date is printed in full, so the page says nothing like "tomorrow" that goes
 * wrong overnight. Tests fail when the constant is left behind (see below).
 *
 * Status discipline: a strike is printed as "confirmed" only when its data
 * entry is "official" (a registered call or an official minimum-services
 * order, linked). Everything else is "called", and unpublished minimum
 * services are "to be confirmed".
 *
 * HOW TO UPDATE (facts live in `strikes-spain-data.ts`; this file is the page):
 *  - Every check: re-read each organiser and the Ministry of Transport's rail
 *    and air lists, then move STRIKES_SPAIN_AS_OF to the day you checked.
 *    A test fails 4 days after it, and on the Monday after its week (the
 *    "this week" table would be last week's).
 *  - New strike: add an entry to SPAIN_STRIKES in all three languages,
 *    "called" with minimum services "pending" until an official order is out.
 *  - Minimum services out: status "official" / "published", rewrite `basis`,
 *    `minimumServices.short` and `.text` with the order's link.
 *  - A strike also in the Catalan hub (`catalanEntry`): change its days in
 *    both files (a test keeps them in step).
 *  - Airport strikes: when a resolution's `msValidUntil` passes, cite the new
 *    one or remove the strike (a test fails the day after).
 *  - Past strikes move to "recent" by themselves the week after their last day.
 *  - Deploy, then publish `?only=huelgas-espana`.
 */

export { STRIKES_SPAIN_AS_OF, STRIKES_SPAIN_VERIFIED };

const LOCALES: Locale[] = ["ca", "es", "en"];

/* -------------------------------------------------------------------------- */
/* Date logic (deterministic: only STRIKES_SPAIN_AS_OF decides what is shown) */
/* -------------------------------------------------------------------------- */

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

export const lastDay = (strike: Pick<SpainStrike, "dates">): string => strike.dates[strike.dates.length - 1] ?? "";

/** The Monday-to-Sunday week that holds `iso`. */
export function weekOf(iso: string): { from: string; to: string; days: string[] } {
  const from = addDays(iso, -((weekdayIndex(iso) + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => addDays(from, index));
  return { from, to: days[6]!, days };
}

const byFirstDay = (a: SpainStrike, b: SpainStrike) => (a.dates[0] ?? "").localeCompare(b.dates[0] ?? "");

/** Strikes with a day of action in the week of `asOf` or later: the calendar. A strike earlier this week stays listed until the week ends. */
export function listedSpainStrikes(asOf: string = STRIKES_SPAIN_AS_OF, strikes: SpainStrike[] = SPAIN_STRIKES): SpainStrike[] {
  const { from } = weekOf(asOf);
  return strikes.filter((strike) => lastDay(strike) >= from).sort(byFirstDay);
}

/** At most this many past strikes are listed under "recent"; older ones drop off. */
export const RECENT_LIMIT = 8;

/** Strikes whose last day was before the week of `asOf`, latest first. */
export function recentSpainStrikes(asOf: string = STRIKES_SPAIN_AS_OF, strikes: SpainStrike[] = SPAIN_STRIKES): SpainStrike[] {
  const { from } = weekOf(asOf);
  return strikes
    .filter((strike) => lastDay(strike) < from)
    .sort((a, b) => lastDay(b).localeCompare(lastDay(a)))
    .slice(0, RECENT_LIMIT);
}

export function strikesOn(day: string, strikes: SpainStrike[] = SPAIN_STRIKES): SpainStrike[] {
  return strikes.filter((strike) => strike.dates.includes(day)).sort(byFirstDay);
}

/** The page must be re-checked against the sources at least this often: a test fails this many days after STRIKES_SPAIN_AS_OF. */
export const STRIKES_SPAIN_MAX_AGE_DAYS = 4;

export function isHubStale(today: string, asOf: string = STRIKES_SPAIN_AS_OF): boolean {
  return daysBetween(asOf, today) >= STRIKES_SPAIN_MAX_AGE_DAYS;
}

/** Whether `today` is past the week the page prints as "this week". */
export function isWeekOver(today: string, asOf: string = STRIKES_SPAIN_AS_OF): boolean {
  return today > weekOf(asOf).to;
}

/** Open-ended strikes whose cited minimum-services resolution is no longer in force on `day`. */
export function expiredOpenStrikes(day: string, open: SpainOpenStrike[] = SPAIN_OPEN_STRIKES): SpainOpenStrike[] {
  return open.filter((strike) => strike.msValidUntil < day);
}

/** Strikes of the Catalan hub that this calendar does not list itself: the ones called in Catalonia only. */
export function catalanOnlyStrikes(asOf: string = STRIKES_SPAIN_AS_OF, spain: SpainStrike[] = SPAIN_STRIKES, catalan: Strike[] = STRIKES): Strike[] {
  const mirrored = new Set(spain.map((strike) => strike.catalanEntry).filter(Boolean));
  return catalan
    .filter((strike) => isCatalanUpcoming(strike, asOf) && !mirrored.has(strike.id))
    .sort((a, b) => (a.dates[0] ?? "").localeCompare(b.dates[0] ?? ""));
}

/* -------------------------------------------------------------------------- */
/* Date wording                                                               */
/* -------------------------------------------------------------------------- */

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
/** Plain text for FAQ answers and descriptions: no bold, no links. */
const strip = (text: string) => text.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

const dayNumber = (iso: string) => String(Number(iso.slice(8, 10)));
const weekday = (iso: string, locale: Locale) => WEEKDAY_NAMES[locale][weekdayIndex(iso)] ?? "";
/** "de noviembre" / "d'octubre" / "November". */
const ofMonth = (iso: string, locale: Locale) => shortDate(iso, locale).replace(/^\d+ /, "");
/** "noviembre" / "octubre" / "November". */
const monthName = (iso: string, locale: Locale) => ofMonth(iso, locale).replace(/^(de |d')/, "");
const withYearOf = (iso: string, locale: Locale) => (locale === "en" ? ` ${iso.slice(0, 4)}` : ` de ${iso.slice(0, 4)}`);

function consecutive(dates: string[]): boolean {
  return dates.every((iso, index) => index === 0 || daysBetween(dates[index - 1]!, iso) === 1);
}

/**
 * "martes 10 y jueves 12 de noviembre de 2026" (the month said once, after
 * its last day); three or more days in a row, "del 9 al 13 de noviembre de
 * 2026"; across two months, "viernes 30 de octubre y lunes 2 de noviembre de
 * 2026". English: "Tuesday 10 and Thursday 12 November 2026", "9 to 13
 * November 2026".
 */
export function spainDays(dates: string[], locale: Locale, withYear = true): string {
  const first = dates[0] ?? "";
  const last = dates[dates.length - 1] ?? "";
  if (dates.length >= 3 && consecutive(dates)) return withYear ? range(first, last, locale) : span(first, last, locale);
  const months: string[][] = [];
  for (const iso of dates) {
    const group = months[months.length - 1];
    if (group && group[0]!.slice(0, 7) === iso.slice(0, 7)) group.push(iso);
    else months.push([iso]);
  }
  return andList(
    months.map((group, index) => {
      const end = group[group.length - 1]!;
      const days = andList(group.map((iso) => `${weekday(iso, locale)} ${dayNumber(iso)}`), locale);
      return `${days} ${ofMonth(end, locale)}${withYear && index === months.length - 1 ? withYearOf(end, locale) : ""}`;
    }),
    locale,
  );
}

/** The days of a strike inside one week, without the month: "del lunes 9 al viernes 13", "martes 10 y jueves 12". */
function daysInWeek(strike: SpainStrike, days: string[], locale: Locale): string {
  const mine = strike.dates.filter((iso) => days.includes(iso));
  const first = mine[0] ?? "";
  const last = mine[mine.length - 1] ?? "";
  const name = (iso: string) => `${weekday(iso, locale)} ${dayNumber(iso)}`;
  if (mine.length >= 3 && consecutive(mine)) {
    return { ca: `de ${name(first)} a ${name(last)}`, es: `del ${name(first)} al ${name(last)}`, en: `${name(first)} to ${name(last)}` }[locale];
  }
  return andList(mine.map(name), locale);
}

/** Day numbers only, for the meta description: "9-13", "10 y 12", "11". */
function dayNumbersInWeek(strike: SpainStrike, days: string[], locale: Locale): string {
  const mine = strike.dates.filter((iso) => days.includes(iso));
  if (mine.length >= 3 && consecutive(mine)) return `${dayNumber(mine[0]!)}-${dayNumber(mine[mine.length - 1]!)}`;
  return andList(mine.map(dayNumber), locale);
}

/**
 * A data text in the reader's language, with `{checked}` replaced by the
 * as-of date. Catalan says "l'1" and "l'11", so "El {checked}" becomes
 * "L'11 de novembre de 2026" on those days.
 */
function fill(text: L, locale: Locale, asOf: string): string {
  const date = dateYear(asOf, locale);
  let out = text[locale];
  if (locale === "ca" && ["01", "11"].includes(asOf.slice(8, 10))) {
    out = out.replace(/\bEl \{checked\}/g, `L'${date}`).replace(/\bel \{checked\}/g, `l'${date}`);
  }
  return out.replaceAll("{checked}", date);
}

/* -------------------------------------------------------------------------- */
/* Status wording                                                             */
/* -------------------------------------------------------------------------- */

/** The status column. Only "official" entries are ever printed as confirmed. */
export const STATUS_LABEL: Record<SpainCallStatus, L> = {
  official: { ca: "Confirmada", es: "Confirmada", en: "Confirmed" },
  called: { ca: "Convocada", es: "Convocada", en: "Called" },
};

const STATUS_KEY: Record<Locale, { title: string; text: string }> = {
  ca: {
    title: "Què vol dir cada estat",
    text: "**Confirmada:** té una convocatòria registrada o una ordre oficial de serveis mínims, que enllacem. **Convocada:** consta a l'avís del sindicat o de l'organització que la convoca; el dia de l'última revisió no hi havia cap ordre oficial. **Per confirmar:** una dada que cap font oficial ha publicat encara.",
  },
  es: {
    title: "Qué quiere decir cada estado",
    text: "**Confirmada:** tiene una convocatoria registrada o una orden oficial de servicios mínimos, que enlazamos. **Convocada:** consta en el aviso del sindicato o de la organización que la convoca; el día de la última revisión no había una orden oficial. **Por confirmar:** un dato que ninguna fuente oficial ha publicado todavía.",
  },
  en: {
    title: "What each status means",
    text: "**Confirmed:** there is a registered call or an official minimum-services order, which we link. **Called:** it appears in the notice of the union or organisation calling it; on the day of the last check there was no official order. **To be confirmed:** a detail no official source has published yet.",
  },
};

/* -------------------------------------------------------------------------- */
/* Titles and description                                                     */
/* -------------------------------------------------------------------------- */

export const SEO_TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

function firstFit(candidates: string[], limit: number): string {
  return candidates.find((candidate) => candidate.length <= limit) ?? candidates[candidates.length - 1]!;
}

/** The H1: the searched words ("hoy", "esta semana") and the month of the as-of day. */
export function strikesSpainTitle(locale: Locale, asOf: string = STRIKES_SPAIN_AS_OF): string {
  const year = asOf.slice(0, 4);
  return {
    ca: `Vagues a Espanya avui i aquesta setmana: calendari ${ofMonth(asOf, "ca")} de ${year} i serveis mínims`,
    es: `Huelgas en España hoy y esta semana: calendario ${ofMonth(asOf, "es")} de ${year} y servicios mínimos`,
    en: `Strikes in Spain today and this week: ${monthName(asOf, "en")} ${year} dates and minimum services`,
  }[locale];
}

export function strikesSpainSeoTitle(locale: Locale, asOf: string = STRIKES_SPAIN_AS_OF): string {
  const month = `${monthName(asOf, locale)} ${asOf.slice(0, 4)}`;
  const candidates: Record<Locale, string[]> = {
    ca: [`Vagues a Espanya avui i aquesta setmana: ${month}`, `Vagues a Espanya aquesta setmana: ${month}`, `Vagues a Espanya: ${month}`],
    es: [`Huelgas en España hoy y esta semana: ${month}`, `Huelgas en España esta semana: ${month}`, `Huelgas en España: ${month}`],
    en: [`Strikes in Spain today and this week: ${month}`, `Strikes in Spain this week: ${month}`, `Strikes in Spain: ${month}`],
  };
  return firstFit(candidates[locale], SEO_TITLE_LIMIT);
}

/** The week's strikes by name, then what the page gives for each. */
export function strikesSpainDescription(locale: Locale, asOf: string = STRIKES_SPAIN_AS_OF, strikes: SpainStrike[] = SPAIN_STRIKES): string {
  const week = weekOf(asOf);
  const when = span(week.from, week.to, locale);
  const thisWeek = listedSpainStrikes(asOf, strikes).filter((strike) => strike.dates.some((iso) => week.days.includes(iso)));
  const names = andList(thisWeek.map((strike) => strike.label[locale]), locale);
  const dated = andList(thisWeek.map((strike) => `${strike.label[locale]} (${dayNumbersInWeek(strike, week.days, locale)})`), locale);
  const candidates: Record<Locale, string[]> = {
    ca: [
      ...(thisWeek.length > 0
        ? [
            `Vagues a Espanya ${when}: ${dated}. Qui convoca i serveis mínims oficials.`,
            `Vagues a Espanya ${when}: ${dated}. Serveis mínims oficials.`,
            `Vagues a Espanya ${when}: ${names}. Dates i serveis mínims oficials.`,
          ]
        : []),
      `Vagues a Espanya ${when}: dates, qui convoca cadascuna i serveis mínims, amb la font oficial.`,
    ],
    es: [
      ...(thisWeek.length > 0
        ? [
            `Huelgas en España ${when}: ${dated}. Quién convoca y servicios mínimos oficiales.`,
            `Huelgas en España ${when}: ${dated}. Servicios mínimos oficiales.`,
            `Huelgas en España ${when}: ${names}. Fechas y servicios mínimos oficiales.`,
          ]
        : []),
      `Huelgas en España ${when}: fechas, quién convoca cada una y servicios mínimos, con la fuente oficial.`,
    ],
    en: [
      ...(thisWeek.length > 0
        ? [
            `Strikes in Spain, ${when}: ${dated}. Who calls each one and official minimum services.`,
            `Strikes in Spain, ${when}: ${dated}. Official minimum services.`,
            `Strikes in Spain, ${when}: ${names}. Dates and official minimum services.`,
          ]
        : []),
      `Strikes in Spain, ${when}: dates, who calls each one and minimum services, with the official source.`,
    ],
  };
  return firstFit(candidates[locale], DESCRIPTION_LIMIT);
}

export const STRIKES_SPAIN_EXCERPT: L = {
  ca: "Les vagues d'àmbit estatal convocades a Espanya, dia a dia: qui convoca cadascuna, si està confirmada i quins serveis mínims té, amb l'enllaç a la font oficial.",
  es: "Las huelgas de ámbito estatal convocadas en España, día a día: quién convoca cada una, si está confirmada y qué servicios mínimos tiene, con el enlace a la fuente oficial.",
  en: "The Spain-wide strikes that have been called, day by day: who calls each one, whether it is confirmed and what minimum services apply, with a link to the official source.",
};

/* -------------------------------------------------------------------------- */
/* Page wording                                                               */
/* -------------------------------------------------------------------------- */

interface Wording {
  lead: (checked: string) => string;
  week: (when: string) => string;
  after: string;
  noneThisWeek: string;
  airportsToo: string;
  weekHeading: (when: string) => string;
  weekId: string;
  weekCaption: (when: string) => string;
  weekNote: (checked: string, open: boolean) => string;
  dayHeaders: string[];
  noStrikeRow: string;
  calendarHeading: string;
  calendarId: string;
  calendarIntro: string;
  calendarCaption: string;
  calendarHeaders: string[];
  detailHeading: string;
  detailId: string;
  scope: string;
  hours: string;
  calledBy: string;
  status: string;
  ms: string;
  more: string;
  airportsHeading: string;
  airportsId: string;
  airportsIntro: string;
  catalanHeading: string;
  catalanId: string;
  catalanIntro: string;
  catalanNone: string;
  catalanHub: string;
  notHeading: string;
  notId: string;
  notIntro: string;
  recentHeading: string;
  recentId: string;
  recentIntro: string;
  lawHeading: string;
  lawId: string;
  law: string[];
  qToday: string;
  aToday: (when: string, days: string, open: string, checked: string) => string;
  noneOnDays: string;
  openToo: (titles: string) => string;
  qRail: string;
  aRail: (items: string, checked: string) => string;
  aRailNone: (checked: string) => string;
  qWho: string;
  aWho: string;
  qNotice: string;
  aNotice: string;
  qPay: string;
  aPay: string;
  qDoctors: string;
  aDoctors: (text: string, checked: string) => string;
  inCatalonia: (items: string) => string;
}

const U = SPAIN_URLS;
const md = (url: string, label: string) => `[${label}](${url})`;

const T: Record<Locale, Wording> = {
  ca: {
    lead: (checked) =>
      `Les vagues d'àmbit estatal convocades a Espanya, dia a dia: qui convoca cadascuna, si està confirmada i quins serveis mínims té, amb l'enllaç a la font oficial. Fonts revisades per última vegada: ${checked}.`,
    week: (when) => `Setmana ${when}`,
    after: "Després",
    noneThisWeek: "cap vaga d'àmbit estatal amb data en aquest calendari",
    airportsToo: "A més, continuen obertes les vagues indefinides d'aeroports que detallem més avall.",
    weekHeading: (when) => `Aquesta setmana: ${when}`,
    weekId: "aquesta-setmana",
    weekCaption: (when) => `Vagues d'àmbit estatal a Espanya, ${when}`,
    weekNote: (checked, open) =>
      `Fonts revisades: ${checked}.${open ? " Les vagues indefinides d'aeroports no hi tenen fila pròpia: s'apliquen cada dia, o els dies de la setmana que indiquem, mentre continuen obertes." : ""}`,
    dayHeaders: ["Dia", "Vaga", "Estat", "Serveis mínims"],
    noStrikeRow: "Cap vaga amb data en aquest calendari",
    calendarHeading: "Calendari: totes les vagues amb data",
    calendarId: "calendari",
    calendarIntro: "Totes les vagues d'àmbit estatal amb data que hem trobat a les fonts oficials i als avisos dels convocants, de la primera a l'última.",
    calendarCaption: "Calendari de vagues convocades a Espanya",
    calendarHeaders: ["Dates", "Vaga", "Estat", "Serveis mínims"],
    detailHeading: "Vaga a vaga: qui convoca i serveis mínims",
    detailId: "vaga-a-vaga",
    scope: "Àmbit",
    hours: "Horari",
    calledBy: "Convoca",
    status: "Estat",
    ms: "Serveis mínims",
    more: "Més informació",
    airportsHeading: "Aeroports: vagues indefinides obertes",
    airportsId: "aeroports",
    airportsIntro:
      "Aquestes vagues no tenen un últim dia: continuen obertes i el Ministeri de Transports en renova la resolució de serveis mínims per períodes. Les descrivim tal com consten a la llista del Ministeri; si voles, comprova l'estat del vol amb la companyia.",
    catalanHeading: "Vagues només a Catalunya",
    catalanId: "catalunya",
    catalanIntro: "Convocatòries que només afecten Catalunya, segons el nostre seguiment de les vagues catalanes:",
    catalanNone: "Ara mateix no seguim cap vaga convocada només a Catalunya.",
    catalanHub: "Totes les vagues a Catalunya, amb què funciona a Rodalies, el metro, l'autobús, la sanitat i les escoles",
    notHeading: "Ajornades, desconvocades o traslladades",
    notId: "no-hi-ha-vaga",
    notIntro: "Convocatòries que es busquen aquests dies i que no tenen cap vaga amb data, segons l'avís dels mateixos convocants.",
    recentHeading: "Vagues recents",
    recentId: "recents",
    recentIntro: "Les últimes vagues d'àmbit estatal i els serveis mínims que s'hi van fixar.",
    lawHeading: "Com es fixen els serveis mínims",
    lawId: "serveis-minims",
    law: [
      `El dret de vaga el reconeix ${md(U.constitution, "l'article 28.2 de la Constitució espanyola")}, que també demana que la llei garanteixi el manteniment dels serveis essencials de la comunitat.`,
      `El ${md(U.rdl17, "Reial decret llei 17/1977")} en fixa la resta: la vaga s'ha de comunicar a l'empresa i a l'autoritat laboral amb cinc dies naturals d'antelació, o deu si afecta serveis públics (articles 3 i 4), i l'autoritat governativa pot acordar les mesures necessàries per assegurar el funcionament dels serveis (article 10). Per això cada govern fixa els dels serveis que en depenen: el Ministeri de Transports, els de Renfe, Adif, els aeroports i les companyies aèries, que publica a les seves llistes de resolucions ${md(U.ministryRail, "ferroviàries")} i ${md(U.ministryAir, "del transport aeri")}; cada comunitat autònoma, els del seu transport, la seva sanitat i les seves escoles, al seu butlletí oficial.`,
    ],
    qToday: "Quines vagues hi ha avui a Espanya?",
    aToday: (when, days, open, checked) => `Depèn del dia. La setmana ${when}: ${days}.${open} Fonts revisades: ${checked}.`,
    noneOnDays: "cap amb data en aquest calendari",
    openToo: (titles) => ` A més, continuen obertes vagues indefinides en aeroports (${titles}).`,
    qRail: "Quines vagues de trens hi ha convocades?",
    aRail: (items, checked) => `Aquestes són les que tenen data a les fonts revisades (${checked}). ${items}`,
    aRailNone: (checked) => `A les fonts revisades (${checked}) no hi havia cap vaga ferroviària d'àmbit estatal amb data.`,
    qWho: "Qui fixa els serveis mínims d'una vaga?",
    aWho: "El govern de qui depèn cada servei, com preveu l'article 10 del Reial decret llei 17/1977: el Ministeri de Transports, els dels trens de Renfe i Adif, els aeroports i les companyies aèries; cada comunitat autònoma, els del seu transport públic, la seva sanitat i les seves escoles, per ordre publicada al seu butlletí oficial.",
    qNotice: "Amb quanta antelació s'ha de convocar una vaga?",
    aNotice:
      "Segons el Reial decret llei 17/1977, la vaga s'ha de comunicar a l'empresa i a l'autoritat laboral amb cinc dies naturals d'antelació, i amb deu si afecta serveis públics, com el transport, la sanitat o l'educació.",
    qPay: "Es cobra el dia de vaga?",
    aPay: "No. Segons l'article 6 del Reial decret llei 17/1977, durant la vaga el contracte de treball queda en suspens i el treballador no té dret al salari d'aquest temps. El mateix article diu que fer vaga no extingeix la relació laboral ni pot comportar cap sanció, tret que el treballador cometi una falta laboral durant la vaga.",
    qDoctors: "Hi ha vaga de metges a tot Espanya?",
    aDoctors: (text, checked) => `Sense data, segons les fonts revisades (${checked}). ${text}`,
    inCatalonia: (items) => ` A Catalunya hi ha una convocatòria pròpia: ${items}.`,
  },
  es: {
    lead: (checked) =>
      `Las huelgas de ámbito estatal convocadas en España, día a día: quién convoca cada una, si está confirmada y qué servicios mínimos tiene, con el enlace a la fuente oficial. Fuentes revisadas por última vez: ${checked}.`,
    week: (when) => `Semana ${when}`,
    after: "Después",
    noneThisWeek: "ninguna huelga de ámbito estatal con fecha en este calendario",
    airportsToo: "Además, siguen abiertas las huelgas indefinidas de aeropuertos que detallamos más abajo.",
    weekHeading: (when) => `Esta semana: ${when}`,
    weekId: "esta-semana",
    weekCaption: (when) => `Huelgas de ámbito estatal en España, ${when}`,
    weekNote: (checked, open) =>
      `Fuentes revisadas: ${checked}.${open ? " Las huelgas indefinidas de aeropuertos no tienen fila propia: se aplican cada día, o los días de la semana que indicamos, mientras siguen abiertas." : ""}`,
    dayHeaders: ["Día", "Huelga", "Estado", "Servicios mínimos"],
    noStrikeRow: "Ninguna huelga con fecha en este calendario",
    calendarHeading: "Calendario: todas las huelgas con fecha",
    calendarId: "calendario",
    calendarIntro: "Todas las huelgas de ámbito estatal con fecha que hemos encontrado en las fuentes oficiales y en los avisos de los convocantes, de la primera a la última.",
    calendarCaption: "Calendario de huelgas convocadas en España",
    calendarHeaders: ["Fechas", "Huelga", "Estado", "Servicios mínimos"],
    detailHeading: "Huelga a huelga: quién convoca y servicios mínimos",
    detailId: "huelga-a-huelga",
    scope: "Ámbito",
    hours: "Horario",
    calledBy: "Convoca",
    status: "Estado",
    ms: "Servicios mínimos",
    more: "Más información",
    airportsHeading: "Aeropuertos: huelgas indefinidas abiertas",
    airportsId: "aeropuertos",
    airportsIntro:
      "Estas huelgas no tienen un último día: siguen abiertas y el Ministerio de Transportes renueva su resolución de servicios mínimos por periodos. Las describimos tal como constan en la lista del Ministerio; si vuelas, comprueba el estado del vuelo con la compañía.",
    catalanHeading: "Huelgas solo en Cataluña",
    catalanId: "cataluna",
    catalanIntro: "Convocatorias que solo afectan a Cataluña, según nuestro seguimiento de las huelgas catalanas:",
    catalanNone: "Ahora mismo no seguimos ninguna huelga convocada solo en Cataluña.",
    catalanHub: "Todas las huelgas en Cataluña, con lo que funciona en Rodalies, el metro, el autobús, la sanidad y los colegios",
    notHeading: "Aplazadas, desconvocadas o trasladadas",
    notId: "no-hay-huelga",
    notIntro: "Convocatorias que se buscan estos días y que no tienen ninguna huelga con fecha, según el aviso de sus propios convocantes.",
    recentHeading: "Huelgas recientes",
    recentId: "recientes",
    recentIntro: "Las últimas huelgas de ámbito estatal y los servicios mínimos que se fijaron.",
    lawHeading: "Cómo se fijan los servicios mínimos",
    lawId: "servicios-minimos",
    law: [
      `El derecho de huelga lo reconoce ${md(U.constitution, "el artículo 28.2 de la Constitución")}: «Se reconoce el derecho a la huelga de los trabajadores para la defensa de sus intereses». El mismo artículo pide que la ley establezca las garantías precisas para asegurar «el mantenimiento de los servicios esenciales de la comunidad».`,
      `El ${md(U.rdl17, "Real Decreto-ley 17/1977")} fija el resto: la huelga se comunica a la empresa y a la autoridad laboral con cinco días naturales de antelación, o diez si afecta a servicios públicos (artículos 3 y 4), y «la Autoridad gubernativa podrá acordar las medidas necesarias para asegurar el funcionamiento de los servicios» (artículo 10). Por eso cada gobierno fija los de los servicios que dependen de él: el Ministerio de Transportes, los de Renfe, Adif, los aeropuertos y las compañías aéreas, que publica en sus listas de resoluciones ${md(U.ministryRail, "ferroviarias")} y ${md(U.ministryAir, "del transporte aéreo")}; cada comunidad autónoma, los de su transporte, su sanidad y sus colegios, en su boletín oficial.`,
    ],
    qToday: "¿Qué huelgas hay hoy en España?",
    aToday: (when, days, open, checked) => `Depende del día. En la semana ${when}: ${days}.${open} Fuentes revisadas: ${checked}.`,
    noneOnDays: "ninguna con fecha en este calendario",
    openToo: (titles) => ` Además, siguen abiertas huelgas indefinidas en aeropuertos (${titles}).`,
    qRail: "¿Qué huelgas de trenes hay convocadas?",
    aRail: (items, checked) => `Estas son las que tienen fecha en las fuentes revisadas (${checked}). ${items}`,
    aRailNone: (checked) => `En las fuentes revisadas (${checked}) no había ninguna huelga ferroviaria de ámbito estatal con fecha.`,
    qWho: "¿Quién fija los servicios mínimos de una huelga?",
    aWho: "El gobierno del que depende cada servicio, como prevé el artículo 10 del Real Decreto-ley 17/1977: el Ministerio de Transportes, los de los trenes de Renfe y Adif, los aeropuertos y las compañías aéreas; cada comunidad autónoma, los de su transporte público, su sanidad y sus colegios, por orden publicada en su boletín oficial.",
    qNotice: "¿Con cuánta antelación se convoca una huelga?",
    aNotice:
      "Según el Real Decreto-ley 17/1977, la huelga se comunica a la empresa y a la autoridad laboral con cinco días naturales de antelación, y con diez si afecta a servicios públicos, como el transporte, la sanidad o la educación.",
    qPay: "¿Se cobra el día de huelga?",
    aPay: "No. Según el artículo 6 del Real Decreto-ley 17/1977, durante la huelga el contrato de trabajo queda en suspenso y el trabajador no tiene derecho al salario de ese tiempo. El mismo artículo dice que ejercer el derecho de huelga no extingue la relación de trabajo ni puede dar lugar a sanción, salvo que el trabajador cometa una falta laboral durante la huelga.",
    qDoctors: "¿Hay huelga de médicos en toda España?",
    aDoctors: (text, checked) => `Sin fecha, según las fuentes revisadas (${checked}). ${text}`,
    inCatalonia: (items) => ` En Cataluña hay una convocatoria propia: ${items}.`,
  },
  en: {
    lead: (checked) =>
      `The Spain-wide strikes that have been called, day by day: who calls each one, whether it is confirmed and what minimum services apply, with a link to the official source. Sources last checked: ${checked}.`,
    week: (when) => `Week of ${when}`,
    after: "After that",
    noneThisWeek: "no Spain-wide strike with a date in this calendar",
    airportsToo: "The open-ended airport strikes detailed further down also continue.",
    weekHeading: (when) => `This week: ${when}`,
    weekId: "this-week",
    weekCaption: (when) => `Spain-wide strikes, ${when}`,
    weekNote: (checked, open) =>
      `Sources checked: ${checked}.${open ? " The open-ended airport strikes have no row of their own: they apply every day, or on the weekdays given below, for as long as they stay open." : ""}`,
    dayHeaders: ["Day", "Strike", "Status", "Minimum services"],
    noStrikeRow: "No strike with a date in this calendar",
    calendarHeading: "Calendar: every strike with a date",
    calendarId: "calendar",
    calendarIntro: "Every Spain-wide strike with a date that we found in official sources and in the organisers' own notices, from the first to the last.",
    calendarCaption: "Calendar of strikes called in Spain",
    calendarHeaders: ["Dates", "Strike", "Status", "Minimum services"],
    detailHeading: "Strike by strike: who calls it and minimum services",
    detailId: "strike-by-strike",
    scope: "Who it covers",
    hours: "Hours",
    calledBy: "Called by",
    status: "Status",
    ms: "Minimum services",
    more: "More",
    airportsHeading: "Airports: open-ended strikes",
    airportsId: "airports",
    airportsIntro:
      "These strikes have no last day: they stay open, and the Ministry of Transport renews their minimum-services resolution period by period. We describe them as they appear on the Ministry's list; if you are flying, check your flight's status with the airline.",
    catalanHeading: "Strikes in Catalonia only",
    catalanId: "catalonia",
    catalanIntro: "Calls that affect Catalonia only, according to our tracking of Catalan strikes:",
    catalanNone: "We are not tracking any strike called in Catalonia only at the moment.",
    catalanHub: "Every strike in Catalonia, with what runs on Rodalies, the metro, buses, health care and schools",
    notHeading: "Postponed, called off or moved",
    notId: "not-happening",
    notIntro: "Calls people are searching for these days that have no dated strike, according to the organisers' own notices.",
    recentHeading: "Recent strikes",
    recentId: "recent",
    recentIntro: "The latest Spain-wide strikes and the minimum services that were set for them.",
    lawHeading: "How minimum services are set",
    lawId: "minimum-services",
    law: [
      `The right to strike is recognised by ${md(U.constitution, "article 28.2 of the Spanish Constitution")}, which also asks the law to guarantee that the community's essential services are maintained.`,
      `${md(U.rdl17, "Royal Decree-law 17/1977")} sets the rest: a strike must be notified to the employer and to the labour authority five calendar days in advance, or ten if it affects public services (articles 3 and 4), and the government authority may order the measures needed to keep services running (article 10). That is why each government sets minimum services for the services that depend on it: the Ministry of Transport for Renfe, Adif, airports and airlines, published on its lists of ${md(U.ministryRail, "rail")} and ${md(U.ministryAir, "air transport")} resolutions; each region for its own transport, health care and schools, in its official gazette.`,
    ],
    qToday: "What strikes are there in Spain today?",
    aToday: (when, days, open, checked) => `It depends on the day. In the week of ${when}: ${days}.${open} Sources checked: ${checked}.`,
    noneOnDays: "none with a date in this calendar",
    openToo: (titles) => ` Open-ended strikes at airports also continue (${titles}).`,
    qRail: "Which train strikes have been called in Spain?",
    aRail: (items, checked) => `These are the ones with a date in the sources checked (${checked}). ${items}`,
    aRailNone: (checked) => `The sources checked (${checked}) showed no Spain-wide rail strike with a date.`,
    qWho: "Who sets minimum services for a strike in Spain?",
    aWho: "The government each service depends on, as article 10 of Royal Decree-law 17/1977 provides: the Ministry of Transport for Renfe and Adif trains, airports and airlines; each region for its own public transport, health care and schools, in an order published in its official gazette.",
    qNotice: "How much notice does a strike need in Spain?",
    aNotice:
      "Under Royal Decree-law 17/1977, a strike must be notified to the employer and to the labour authority five calendar days in advance, and ten if it affects public services such as transport, health care or education.",
    qPay: "Are you paid for a day on strike?",
    aPay: "No. Under article 6 of Royal Decree-law 17/1977, the employment contract is suspended during the strike and the worker has no right to pay for that time. The same article says that going on strike does not end the employment relationship and cannot lead to any sanction, unless the worker commits a labour offence during the strike.",
    qDoctors: "Is there a doctors' strike across Spain?",
    aDoctors: (text, checked) => `Not with a date, according to the sources checked (${checked}). ${text}`,
    inCatalonia: (items) => ` Catalonia has a call of its own: ${items}.`,
  },
};

/**
 * The Spanish-only page about the general strike in the rest of Spain
 * (`strike-11n-spain.ts`): linked from the Spanish edition only, since it has
 * no Catalan or English edition.
 */
const SPANISH_ONLY_GUIDES: Record<string, string> = {
  "huelga-general-2026-11-11": `[La huelga general en el resto de España, ciudad por ciudad](/es/${STRIKE_11N_SPAIN.editions.es.path}/)`,
};

function guideLinks(strike: SpainStrike, locale: Locale): string[] {
  const own = (strike.guides ?? []).map((key: B2Key) => b2link(key, locale, B2_TITLES[key][locale]));
  const extra = locale === "es" ? SPANISH_ONLY_GUIDES[strike.id] : undefined;
  return extra ? [...own, extra] : own;
}

/** The detail id of the doctors' entry in SPAIN_NOT_HAPPENING, which also feeds a FAQ answer. */
const DOCTORS_ENTRY = "medicos-estatal-aplazada";

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

function heading(level: 2 | 3, text: string, id?: string): Block {
  return { type: "heading", level, text, ...(id ? { id } : {}) } as Block;
}

export interface StrikesSpainInput {
  strikes?: SpainStrike[];
  open?: SpainOpenStrike[];
  notHappening?: SpainNotHappening[];
  catalan?: Strike[];
}

/** One row per day and strike, Monday to Sunday; a day without strikes says so. */
export function weekRows(locale: Locale, asOf: string = STRIKES_SPAIN_AS_OF, strikes: SpainStrike[] = SPAIN_STRIKES): string[][] {
  const t = T[locale];
  return weekOf(asOf).days.flatMap((day) => {
    const name = cap(dayDate(day, locale, false));
    const onDay = strikesOn(day, strikes);
    if (onDay.length === 0) return [[name, t.noStrikeRow, "—", "—"]];
    return onDay.map((strike) => [name, cap(strike.title[locale]), STATUS_LABEL[strike.status][locale], strike.minimumServices.short[locale]]);
  });
}

/** "lunes 9, industrias cárnicas; martes 10, ... ; sábado 14 y domingo 15, ninguna con fecha en este calendario". */
function weekInWords(locale: Locale, asOf: string, strikes: SpainStrike[]): string {
  const t = T[locale];
  const parts: string[] = [];
  let empty: string[] = [];
  const flush = () => {
    if (empty.length > 0) parts.push(`${andList(empty, locale)}, ${t.noneOnDays}`);
    empty = [];
  };
  for (const day of weekOf(asOf).days) {
    const name = `${weekday(day, locale)} ${dayNumber(day)}`;
    const onDay = strikesOn(day, strikes);
    if (onDay.length === 0) {
      empty.push(name);
      continue;
    }
    flush();
    parts.push(`${name}, ${andList(onDay.map((strike) => strike.label[locale]), locale)}`);
  }
  flush();
  return parts.join("; ");
}

export function buildStrikesSpainBody(locale: Locale, asOf: string = STRIKES_SPAIN_AS_OF, input: StrikesSpainInput = {}): Block[] {
  const strikes = input.strikes ?? SPAIN_STRIKES;
  const open = input.open ?? SPAIN_OPEN_STRIKES;
  const notHappening = input.notHappening ?? SPAIN_NOT_HAPPENING;
  const t = T[locale];
  const checked = dateYear(asOf, locale);
  const week = weekOf(asOf);
  const when = range(week.from, week.to, locale);
  const listed = listedSpainStrikes(asOf, strikes);
  const thisWeek = listed.filter((strike) => strike.dates.some((iso) => week.days.includes(iso)));
  const later = listed.filter((strike) => (strike.dates[0] ?? "") > week.to);
  const recent = recentSpainStrikes(asOf, strikes);
  const catalan = catalanOnlyStrikes(asOf, strikes, input.catalan ?? STRIKES);
  const text = (value: L) => fill(value, locale, asOf);

  const blocks: Block[] = [];

  /* Lead: the week in one paragraph. */
  blocks.push(lead(t.lead(checked)));
  const weekLine =
    thisWeek.length > 0
      ? andList(thisWeek.map((strike) => `${strike.label[locale]} (${daysInWeek(strike, week.days, locale)})`), locale)
      : t.noneThisWeek;
  const laterLine =
    later.length > 0 ? ` **${t.after}:** ${andList(later.map((strike) => `${strike.label[locale]} (${spainDays(strike.dates, locale, false)})`), locale)}.` : "";
  blocks.push(...paras(`**${t.week(when)}:** ${weekLine}.${laterLine}${open.length > 0 ? ` ${t.airportsToo}` : ""}`));
  blocks.push(callout("official", STATUS_KEY[locale].title, STATUS_KEY[locale].text));

  /* This week, day by day. */
  blocks.push(heading(2, t.weekHeading(when), t.weekId));
  blocks.push(table(t.weekCaption(when), t.dayHeaders, weekRows(locale, asOf, strikes), t.weekNote(checked, open.length > 0)));

  /* Every dated strike. */
  if (listed.length > 0) {
    blocks.push(heading(2, t.calendarHeading, t.calendarId));
    blocks.push(...paras(t.calendarIntro));
    blocks.push(
      table(
        t.calendarCaption,
        t.calendarHeaders,
        listed.map((strike) => [cap(spainDays(strike.dates, locale)), cap(strike.title[locale]), STATUS_LABEL[strike.status][locale], strike.minimumServices.short[locale]]),
      ),
    );

    /* One section per strike. */
    blocks.push(heading(2, t.detailHeading, t.detailId));
    for (const strike of listed) {
      const guides = guideLinks(strike, locale);
      blocks.push(heading(3, `${cap(spainDays(strike.dates, locale))}: ${strike.title[locale]}`, strike.id));
      blocks.push(
        list(
          `**${t.scope}:** ${text(strike.scope)}`,
          ...(strike.hours ? [`**${t.hours}:** ${text(strike.hours)}`] : []),
          `**${t.calledBy}:** ${text(strike.calledBy)}`,
          `**${t.status}:** ${lower(STATUS_LABEL[strike.status][locale])}. ${text(strike.basis)}`,
          `**${t.ms}:** ${text(strike.minimumServices.text)}`,
          ...(guides.length > 0 ? [`**${t.more}:** ${guides.join(" · ")}`] : []),
        ),
      );
    }
  }

  /* Open-ended strikes at airports. */
  if (open.length > 0) {
    blocks.push(heading(2, t.airportsHeading, t.airportsId));
    blocks.push(...paras(t.airportsIntro));
    blocks.push(list(...open.map((strike) => `**${strike.title[locale]}.** ${text(strike.text)}`)));
  }

  /* Catalonia only: read from the Catalan hub, never restated here. */
  blocks.push(heading(2, t.catalanHeading, t.catalanId));
  if (catalan.length > 0) {
    blocks.push(...paras(t.catalanIntro));
    blocks.push(
      list(
        ...catalan.map((strike) => {
          const title = strike.guide ? B2_TITLES[strike.guide][locale] : "";
          const guide = strike.guide ? ` ${b2link(strike.guide, locale, title)}${/[?!]$/.test(title) ? "" : "."}` : "";
          return `**${cap(catalanDays(strike, locale))}:** ${strike.title[locale]}.${guide}`;
        }),
      ),
    );
  } else {
    blocks.push(...paras(t.catalanNone));
  }
  blocks.push(...paras(`${t.catalanHub}: ${b2link("strikes", locale, B2_TITLES.strikes[locale])}.`));

  /* Searched for, not happening. */
  if (notHappening.length > 0) {
    blocks.push(heading(2, t.notHeading, t.notId));
    blocks.push(...paras(t.notIntro));
    blocks.push(list(...notHappening.map((item) => `**${item.title[locale]}.** ${text(item.text)}`)));
  }

  /* Recent strikes. */
  if (recent.length > 0) {
    blocks.push(heading(2, t.recentHeading, t.recentId));
    blocks.push(...paras(t.recentIntro));
    blocks.push(
      list(...recent.map((strike) => `**${cap(spainDays(strike.dates, locale))}: ${strike.title[locale]}.** ${text(strike.scope)} ${text(strike.minimumServices.text)}`)),
    );
  }

  /* How minimum services are set: the BOE only. */
  blocks.push(heading(2, t.lawHeading, t.lawId));
  blocks.push(...paras(...t.law));

  /* FAQ. */
  const rail = listed.filter((strike) => strike.sector === "rail" || strike.sector === "general");
  const doctors = notHappening.find((item) => item.id === DOCTORS_ENTRY);
  const catalanHealth = catalan.filter((strike) => strike.scope === "health");
  const items: { question: string; answer: string }[] = [
    {
      question: t.qToday,
      answer: t.aToday(when, weekInWords(locale, asOf, strikes), open.length > 0 ? t.openToo(open.map((strike) => strike.title[locale]).join("; ")) : "", checked),
    },
    {
      question: t.qRail,
      answer:
        rail.length > 0
          ? t.aRail(
              rail
                .map(
                  (strike) =>
                    `${cap(spainDays(strike.dates, locale))}: ${strike.title[locale]}, ${lower(STATUS_LABEL[strike.status][locale])}. ${t.ms}: ${lower(strike.minimumServices.short[locale])}.`,
                )
                .join(" "),
              checked,
            )
          : t.aRailNone(checked),
    },
    { question: t.qWho, answer: t.aWho },
    { question: t.qNotice, answer: t.aNotice },
    { question: t.qPay, answer: t.aPay },
    ...(doctors
      ? [
          {
            question: t.qDoctors,
            answer: `${t.aDoctors(text(doctors.text), checked)}${
              catalanHealth.length > 0 ? t.inCatalonia(catalanHealth.map((strike) => `${strike.title[locale]}, ${catalanDays(strike, locale)}`).join("; ")) : ""
            }`,
          },
        ]
      : []),
  ];
  blocks.push(faq(items.map((item) => ({ question: item.question, answer: strip(item.answer) }))));
  blocks.push(...paras(verifiedLine(locale, STRIKES_SPAIN_VERIFIED)));

  /* Related (its first two links also become the read-next box). */
  blocks.push(heading(2, RELATED_HEADING[locale]));
  blocks.push(list(...RELATED.map((key) => b2link(key, locale, B2_TITLES[key][locale]))));
  return blocks;
}

const RELATED: B2Key[] = ["strike11n", "strikes", "strikeRenfe", "strikeEducation"];

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

/** Every source the page links: each printed strike's, the airports', the not-happening list's and the law, once. */
export function strikesSpainSources(asOf: string = STRIKES_SPAIN_AS_OF, input: StrikesSpainInput = {}): B2Source[] {
  const strikes = input.strikes ?? SPAIN_STRIKES;
  const seen = new Set<string>();
  const all: B2Source[] = [];
  const add = (source: B2Source) => {
    if (seen.has(source.url)) return;
    seen.add(source.url);
    all.push({ name: source.name, url: source.url, publisher: source.publisher });
  };
  for (const strike of [...listedSpainStrikes(asOf, strikes), ...recentSpainStrikes(asOf, strikes)]) strike.sources.forEach(add);
  for (const strike of input.open ?? SPAIN_OPEN_STRIKES) strike.sources.forEach(add);
  for (const item of input.notHappening ?? SPAIN_NOT_HAPPENING) item.sources.forEach(add);
  SPAIN_FRAMEWORK_SOURCES.forEach(add);
  return all;
}

/* -------------------------------------------------------------------------- */
/* Article                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * No new photograph: the 11N city pages' march beside an EMT bus in Madrid
 * (Israel Hergón, CC BY-SA 2.0, Wikimedia Commons), with their exact alt text
 * and caption in each language, since media rows are keyed by file.
 */
export const STRIKES_SPAIN_GUIDE: B2Article = {
  key: "strikesSpain",
  entryKey: "guide-strikes-spain",
  categoryKey: "public-services",
  sources: strikesSpainSources(),
  heroKey: CITY_HERO.key,
  heroAlt: { ...CITY_HERO.alt },
  heroCaption: { ...CITY_HERO.caption },
  verifiedAt: STRIKES_SPAIN_VERIFIED,
  publishedAt: "2026-11-10T12:00:00+01:00",
  editions: Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      {
        path: B2_PATHS.strikesSpain[locale],
        title: strikesSpainTitle(locale),
        seoTitle: strikesSpainSeoTitle(locale),
        seoDescription: strikesSpainDescription(locale),
        excerpt: STRIKES_SPAIN_EXCERPT[locale],
        blocks: buildStrikesSpainBody(locale),
      },
    ]),
  ) as B2Article["editions"],
};
