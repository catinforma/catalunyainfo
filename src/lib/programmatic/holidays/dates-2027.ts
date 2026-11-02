import { planFor, runAround, type Span } from "@/lib/content/holidays/bridges";
import { OPENING_2027 } from "@/lib/content/batch02/shops";
import { BARCELONA_LOCAL } from "@/lib/content/holidays/payload";
import { SATURDAY_SOURCES, saturdayAnswer, saturdayNote, saturdayQuestion } from "@/lib/content/holidays/saturday";
import { SCHOOL_YEARS, schoolStatusOn } from "@/lib/content/school/calendar";

import { BOE_2027, regionList, spainScope, type SpainScope } from "./boe-2027";
import { NEXT_YEAR, SNAPSHOT, aranSwap, nextYearPlacesOn, regionalDays, type NextYearPlaces } from "./data";
import type { DateContent, DateSection } from "./dates";
import { addDays, caDayArticle, capitalize, dayMonth, dayMonthYear, weekdayDayMonth, weekdayName, type DateLocale } from "./format";
import { GUIDES, OFFICIAL, type GuideKey } from "./links";
import { esName, joinList } from "./names";
import { LOCAL_2027, TRANCHE_4 } from "./paths";
import { placeNames, placesPhrase } from "./places";
import { dateQuestion } from "./question";
import type { DatePlace, NextYearLocal, SourceRef } from "./types";

/**
 * Tranche 4 (2 Nov 2026): the 2027 date pages, "És festiu el … de 2027?",
 * written from the data instead of date by date, so every page answers the
 * same way from the same sources:
 *
 *  - Catalonia: Ordre EMT/52/2026 (`regionalDays(2027)`, which reads
 *    `CATALONIA_HOLIDAYS`), with the Aran swap (`aranSwap(2027)`);
 *  - the rest of Spain: the BOE's 2027 list (`boe-2027.ts`, BOE-A-2026-21254);
 *  - local days: `nextYearPlacesOn`, the DOGC order once `local-2027.json`
 *    is written, and until then each council's own act (`council-2027.ts`),
 *    labelled pending the order. The switch needs no edit here;
 *  - shops: Llei 18/2017, art. 36.2.d (the closing days) and 37 (the shops
 *    outside the general timetable), and Ordre EMT/89/2026 (`OPENING_2027`
 *    from the shops guide: the eight general days and the two defaults);
 *  - schools: Ordre EDF/66/2026 (`SCHOOL_YEARS`, `schoolStatusOn`);
 *  - long weekends: `planFor` / `runAround` (`holidays/bridges.ts`), the
 *    rules the 2027 long weekends guide uses;
 *  - a Catalonia-wide holiday on a Saturday (1 May, 11 September, 25
 *    December 2027): whether it is made up for, from `holidays/saturday.ts`
 *    (the Audiencia Nacional's judgment of 19 May 2026 on CENDOJ, and its BOE
 *    commentary), in the same words as the long weekends guide.
 *
 * The answer comes first, in the H1's own terms; then the rest of Spain, the
 * days around it, one link to the Easter or long weekends guide, the towns,
 * shops and schools. No clock: the same data gives the same page on any day.
 */

const YEAR = 2027;

function need<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`2027 date pages: the ${YEAR} calendar has no ${what}`);
  return value;
}

const REGIONAL = regionalDays(YEAR);
const OFF: ReadonlySet<string> = new Set(REGIONAL.map((d) => d.date));
const ARAN = need(aranSwap(YEAR), "Aran swap");
const GOOD_FRIDAY = need(REGIONAL.find((d) => d.name.en === "Good Friday")?.date, "Good Friday");
const EASTER_MONDAY = need(REGIONAL.find((d) => d.name.en === "Easter Monday")?.date, "Easter Monday");
/** The week before Good Friday through Easter Monday: these pages send readers to the Easter guide. */
const EASTER_FROM = addDays(GOOD_FRIDAY, -7);

/**
 * Llei 18/2017, art. 36.2.d (BOE consolidated text, read 2 Nov 2026): shops
 * "deben permanecer cerrados con carácter general en los días 1 y 6 de enero,
 * el domingo y el lunes de Pascua, 1 de mayo, 24 de junio, 11 de septiembre y
 * los días 25 y 26 de diciembre". By date, whether or not the day is a holiday
 * that year: 26 December 2027 is on the list and is not a holiday.
 */
const CLOSING_FIXED = ["01-01", "01-06", "05-01", "06-24", "09-11", "12-25", "12-26"] as const;
export const CLOSING_2027: ReadonlySet<string> = new Set([...CLOSING_FIXED.map((md) => `${YEAR}-${md}`), addDays(EASTER_MONDAY, -1), EASTER_MONDAY]);

export function isTranche4(iso: string): boolean {
  return TRANCHE_4.includes(iso);
}

/* -------------------------------------------------------------------------- */
/* What kind of day it is                                                     */
/* -------------------------------------------------------------------------- */

export type DayKind2027 =
  /** Catalonia-wide, Monday to Friday. */
  | "holiday"
  /** Catalonia-wide, on a Saturday or Sunday. */
  | "weekend-holiday"
  /** Not a holiday, Monday to Friday. */
  | "working"
  /** Not a holiday, on a Saturday or Sunday. */
  | "weekend"
  /** Not a holiday, but a local one in several of the largest towns. */
  | "local";

function isWeekend(iso: string): boolean {
  const wd = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return wd === 0 || wd === 6;
}

function isSaturday(iso: string): boolean {
  return new Date(`${iso}T12:00:00Z`).getUTCDay() === 6;
}

export function dayKind2027(iso: string, places: readonly DatePlace[] = []): DayKind2027 {
  if (OFF.has(iso)) return isWeekend(iso) ? "weekend-holiday" : "holiday";
  if (isWeekend(iso)) return "weekend";
  return (LOCAL_2027 as readonly string[]).includes(iso) && places.length > 0 ? "local" : "working";
}

/* -------------------------------------------------------------------------- */
/* Names                                                                      */
/* -------------------------------------------------------------------------- */

const regional = (iso: string) => REGIONAL.find((d) => d.date === iso) ?? null;
/** The 2026 order's day with the same month and day ("Sant Esteve" for 26 December). */
const regional2026 = (iso: string) => regionalDays(2026).find((d) => d.date.slice(5) === iso.slice(5)) ?? null;
const barcelona = (iso: string) => BARCELONA_LOCAL.find((h) => h.date === iso) ?? null;

/** What the working days are called, where they have a name; the holidays' names are the order's. */
const WORKING_NAME: Record<string, Record<DateLocale, string> | null> = {
  "2027-01-05": { ca: "la vigília de Reis", es: "la víspera de Reyes", en: "the eve of Epiphany" },
  "2027-03-19": { ca: "Sant Josep", es: "San José", en: "Saint Joseph's Day" },
  "2027-03-25": { ca: "Dijous Sant", es: "Jueves Santo", en: "Maundy Thursday" },
  "2027-04-23": { ca: "Sant Jordi", es: "Sant Jordi", en: "Sant Jordi (Saint George's Day)" },
  "2027-06-29": { ca: "Sant Pere", es: "San Pedro", en: "Saint Peter's Day" },
  "2027-11-02": { ca: "dia de Difunts", es: "Día de Difuntos", en: "All Souls' Day" },
  "2027-12-07": null,
  "2027-12-24": { ca: "la vigília de Nadal", es: "Nochebuena", en: "Christmas Eve" },
  "2027-12-31": { ca: "l'últim dia de l'any", es: "Nochevieja", en: "New Year's Eve" },
};

/** The day's name inside a sentence: the order's, Barcelona's decree's, the 2026 order's, or the list above. */
export function dayName2027(iso: string, locale: DateLocale): string | null {
  const own = regional(iso)?.name[locale] ?? barcelona(iso)?.name[locale] ?? WORKING_NAME[iso]?.[locale] ?? regional2026(iso)?.name[locale] ?? null;
  // "La Immaculada" opens the order's list; mid-sentence it is "la Immaculada". English keeps "La Mercè".
  return own && locale !== "en" ? own.replace(/^(La|El|Les|Els) /, (m) => m.toLowerCase()) : own;
}

/**
 * The name searchers add to the question, for the `<title>`: the first that
 * fits in 60 characters with the question ("Lunes de Pascua", else "Pascua").
 */
const TITLE_NAME: Record<string, Record<DateLocale, string[]>> = {
  "2027-01-05": { ca: ["Vigília de Reis"], es: ["Víspera de Reyes"], en: ["Epiphany Eve"] },
  "2027-03-19": { ca: ["Sant Josep"], es: ["San José"], en: ["St Joseph's Day"] },
  "2027-03-25": { ca: ["Dijous Sant"], es: ["Jueves Santo"], en: ["Maundy Thursday"] },
  "2027-03-26": { ca: ["Divendres Sant"], es: ["Viernes Santo"], en: ["Good Friday"] },
  "2027-03-29": { ca: ["Dilluns de Pasqua", "Pasqua"], es: ["Lunes de Pascua", "Pascua"], en: ["Easter Monday", "Easter"] },
  "2027-04-23": { ca: ["Sant Jordi"], es: ["Sant Jordi"], en: ["Sant Jordi"] },
  "2027-05-01": { ca: ["Festa del Treball"], es: ["Día del Trabajo"], en: ["Labour Day"] },
  "2027-05-17": { ca: ["Pasqua Granada"], es: ["Pascua Granada"], en: ["Whit Monday"] },
  "2027-06-24": { ca: ["Sant Joan"], es: ["San Juan"], en: ["Sant Joan"] },
  "2027-06-29": { ca: ["Sant Pere"], es: ["San Pedro"], en: ["St Peter's Day"] },
  "2027-08-15": { ca: ["L'Assumpció"], es: ["La Asunción"], en: ["Assumption Day"] },
  "2027-09-11": { ca: ["La Diada"], es: ["La Diada"], en: ["La Diada"] },
  "2027-09-24": { ca: ["La Mercè"], es: ["La Mercè"], en: ["La Mercè"] },
  "2027-10-12": { ca: ["Festa Nacional", "Hispanitat"], es: ["Fiesta Nacional", "Hispanidad"], en: ["National Day"] },
  "2027-11-01": { ca: ["Tots Sants"], es: ["Todos los Santos"], en: ["All Saints' Day"] },
  "2027-11-02": { ca: ["Difunts"], es: ["Difuntos"], en: ["All Souls' Day"] },
  "2027-12-06": { ca: ["Constitució"], es: ["Constitución"], en: ["Constitution Day"] },
  "2027-12-08": { ca: ["La Immaculada", "Immaculada"], es: ["La Inmaculada", "Inmaculada"], en: ["Immaculate Conception"] },
  "2027-12-24": { ca: ["Nit de Nadal"], es: ["Nochebuena"], en: ["Christmas Eve"] },
  "2027-12-25": { ca: ["Nadal"], es: ["Navidad"], en: ["Christmas Day"] },
  "2027-12-26": { ca: ["Sant Esteve"], es: ["San Esteban"], en: ["St Stephen's Day"] },
  "2027-12-31": { ca: ["Nit de Cap d'Any", "Cap d'Any"], es: ["Nochevieja"], en: ["New Year's Eve"] },
};

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

/** First candidate that fits; the last is the shortest and is used regardless. */
function fit(candidates: string[], max: number): string {
  return candidates.find((c) => c.length <= max) ?? candidates.at(-1) ?? "";
}

/** "¿Es festivo el 23 de abril de 2027 en Cataluña? Sant Jordi", when it fits in 60 characters; else the question alone. */
export function dateTitle2027(iso: string, locale: DateLocale): string {
  const question = dateQuestion(iso, locale);
  const names = TITLE_NAME[iso]?.[locale] ?? [];
  return fit([...names.map((name) => `${question} ${name}`), question], TITLE_MAX);
}

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

/** "del divendres 1 al dimecres 6 de gener", "del sábado 30 de octubre al martes 2 de noviembre", "Friday 1 to Wednesday 6 January". */
function rangeWords(span: Pick<Span, "from" | "to">, locale: DateLocale): string {
  const { from, to } = span;
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const first = sameMonth ? `${weekdayName(from, locale)} ${Number(from.slice(8))}` : weekdayDayMonth(from, locale);
  const last = weekdayDayMonth(to, locale);
  return locale === "en" ? `${first} to ${last}` : `del ${first} al ${last}`;
}

/** "del 20 al 29 de març de 2027", "del 22 de desembre de 2027 al 9 de gener de 2028", "20 to 29 March 2027". */
function spanYear(from: string, to: string, locale: DateLocale): string {
  const first =
    from.slice(0, 7) === to.slice(0, 7) ? String(Number(from.slice(8))) : from.slice(0, 4) === to.slice(0, 4) ? dayMonth(from, locale) : dayMonthYear(from, locale);
  if (locale === "en") return `${first} to ${dayMonthYear(to, "en")}`;
  if (locale === "es") return `del ${first} al ${dayMonthYear(to, "es")}`;
  // Catalan elides before 1 and 11: "de l'1", "a l'11".
  return `${caDayArticle(from) === "l'" ? "de l'" : "del "}${first} ${caDayArticle(to) === "l'" ? "a l'" : "al "}${dayMonthYear(to, "ca")}`;
}

/** "el dilluns 4 i el dimarts 5 de gener", "Monday 4 and Tuesday 5 January". */
function takeWords(take: readonly string[], locale: DateLocale): string {
  const sameMonth = take.every((d) => d.slice(0, 7) === take[0]?.slice(0, 7));
  const art = locale === "en" ? "" : "el ";
  return joinList(
    take.map((d, i) => (sameMonth && i < take.length - 1 ? `${art}${weekdayName(d, locale)} ${Number(d.slice(8))}` : `${art}${weekdayDayMonth(d, locale)}`)),
    locale,
  );
}

/** "el 23 d'abril de 2027", "l'1 de maig de 2027", "el 23 de abril de 2027", "23 April 2027". */
function theDate(iso: string, locale: DateLocale): string {
  if (locale === "en") return dayMonthYear(iso, "en");
  return `${locale === "ca" ? caDayArticle(iso) : "el "}${dayMonthYear(iso, locale)}`;
}

/** "dilluns 3 de maig" / "Monday 3 May". */
const wdm = (iso: string, locale: DateLocale) => weekdayDayMonth(iso, locale);

/** The Monday after a Saturday or Sunday. */
function mondayAfter(iso: string): string {
  let d = addDays(iso, 1);
  while (new Date(`${d}T12:00:00Z`).getUTCDay() !== 1) d = addDays(d, 1);
  return d;
}

function orderShort(order: SourceRef, locale: DateLocale): string {
  const short = /^Ordre [A-Z]+\/\d+\/\d{4}/.exec(order.name)?.[0] ?? order.name;
  return locale === "ca" ? short : short.replace(/^Ordre/, locale === "es" ? "Orden" : "Order");
}

/* -------------------------------------------------------------------------- */
/* The rest of Spain                                                          */
/* -------------------------------------------------------------------------- */

function spainSentence(iso: string, kind: DayKind2027, locale: DateLocale): string {
  const L = (ca: string, es: string, en: string) => (locale === "ca" ? ca : locale === "es" ? es : en);
  const scope: SpainScope = spainScope(iso);
  const list = (regions: Parameters<typeof regionList>[0]) => regionList(regions, locale);

  if (kind === "holiday" || kind === "weekend-holiday") {
    let text: string;
    if (scope.kind === "all") {
      text = L(
        "També és festiu a la resta d'Espanya: la relació de festes del 2027 publicada al BOE el marca a totes les comunitats i a Ceuta i Melilla.",
        "También es festivo en el resto de España: la relación de fiestas de 2027 publicada en el BOE lo marca en todas las comunidades y en Ceuta y Melilla.",
        "It is a holiday in the rest of Spain too: the BOE's list of 2027 holidays marks it in every region and in Ceuta and Melilla.",
      );
    } else if (scope.kind === "none") {
      text = L(
        "Fora de Catalunya no és festiu: a la relació de festes del 2027 publicada al BOE, només el té Catalunya.",
        "Fuera de Cataluña no es festivo: en la relación de fiestas de 2027 publicada en el BOE, solo lo tiene Cataluña.",
        "It is not a holiday elsewhere in Spain: in the BOE's list of 2027 holidays, only Catalonia has it.",
      );
    } else {
      const regions = scope.kind === "some" ? scope.regions : scope.except;
      text =
        scope.kind === "some"
          ? L(
              `Fora de Catalunya només és festiu a ${list(regions)}, segons la relació de festes del 2027 publicada al BOE.`,
              `Fuera de Cataluña solo es festivo en ${list(regions)}, según la relación de fiestas de 2027 publicada en el BOE.`,
              `Outside Catalonia it is a holiday only in ${list(regions)}, according to the BOE's list of 2027 holidays.`,
            )
          : L(
              `També és festiu a la resta d'Espanya, excepte a ${list(regions)}, segons la relació de festes del 2027 publicada al BOE.`,
              `También es festivo en el resto de España, salvo en ${list(regions)}, según la relación de fiestas de 2027 publicada en el BOE.`,
              `It is a holiday in the rest of Spain too, except ${list(regions)}, according to the BOE's list of 2027 holidays.`,
            );
    }
    if (kind === "weekend-holiday") {
      const monday = mondayAfter(iso);
      if (spainScope(monday).kind === "none") {
        text += L(
          ` Cap comunitat no en fa festa el ${wdm(monday, "ca")}.`,
          ` Ninguna comunidad lo pasa al ${wdm(monday, "es")}.`,
          ` No region moves it to ${wdm(monday, "en")}.`,
        );
      }
    }
    return text;
  }

  if (kind === "weekend") {
    const monday = mondayAfter(iso);
    const onMonday = spainScope(monday);
    if (scope.kind === "none" && onMonday.kind === "none") {
      return L(
        `Tampoc no és festiu a la resta d'Espanya: la relació de festes del 2027 publicada al BOE no marca a cap comunitat ni el ${dayMonth(iso, "ca")} ni el ${wdm(monday, "ca")}.`,
        `Tampoco es festivo en el resto de España: la relación de fiestas de 2027 publicada en el BOE no marca en ninguna comunidad ni el ${dayMonth(iso, "es")} ni el ${wdm(monday, "es")}.`,
        `Nor is it a holiday anywhere else in Spain: the BOE's list of 2027 holidays marks neither ${dayMonth(iso, "en")} nor ${wdm(monday, "en")} in any region.`,
      );
    }
    if (scope.kind === "none" && onMonday.kind === "some") {
      return L(
        `Fora de Catalunya, ${list(onMonday.regions)} fan festa el ${wdm(monday, "ca")}, segons la relació de festes del 2027 publicada al BOE.`,
        `Fuera de Cataluña, ${list(onMonday.regions)} hacen fiesta el ${wdm(monday, "es")}, según la relación de fiestas de 2027 publicada en el BOE.`,
        `Outside Catalonia, ${list(onMonday.regions)} take ${wdm(monday, "en")} off instead, according to the BOE's list of 2027 holidays.`,
      );
    }
  }

  // Working days, local days and anything left.
  if (scope.kind === "none") {
    return L(
      "Tampoc no és festiu a la resta d'Espanya: la relació de festes del 2027 publicada al BOE no el marca com a festiu de cap comunitat autònoma.",
      "Tampoco es festivo en el resto de España: la relación de fiestas de 2027 publicada en el BOE no lo marca como festivo de ninguna comunidad autónoma.",
      "Nor is it a holiday anywhere else in Spain: the BOE's list of 2027 holidays does not mark it as a holiday in any region.",
    );
  }
  if (scope.kind === "all") {
    return L(
      "Fora de Catalunya, en canvi, és festiu a totes les comunitats, segons la relació de festes del 2027 publicada al BOE.",
      "Fuera de Cataluña, en cambio, es festivo en todas las comunidades, según la relación de fiestas de 2027 publicada en el BOE.",
      "Everywhere else in Spain, though, it is a holiday, according to the BOE's list of 2027 holidays.",
    );
  }
  if (scope.kind === "allBut") {
    return L(
      `Fora de Catalunya, en canvi, és festiu a tota la resta d'Espanya excepte a ${list(scope.except)}, segons la relació de festes del 2027 publicada al BOE.`,
      `Fuera de Cataluña, en cambio, es festivo en todo el resto de España salvo en ${list(scope.except)}, según la relación de fiestas de 2027 publicada en el BOE.`,
      `In the rest of Spain, though, it is a holiday everywhere except ${list(scope.except)}, according to the BOE's list of 2027 holidays.`,
    );
  }
  return L(
    `Fora de Catalunya, en canvi, és festiu a ${list(scope.regions)}, segons la relació de festes del 2027 publicada al BOE.`,
    `Fuera de Cataluña, en cambio, es festivo en ${list(scope.regions)}, según la relación de fiestas de 2027 publicada en el BOE.`,
    `Outside Catalonia, though, it is a holiday in ${list(scope.regions)}, according to the BOE's list of 2027 holidays.`,
  );
}

/* -------------------------------------------------------------------------- */
/* The days around it                                                         */
/* -------------------------------------------------------------------------- */

function aranNote(iso: string, locale: DateLocale): string {
  if (iso !== ARAN.replaces) return "";
  return { ca: ", excepte a l'Aran", es: ", excepto en Arán", en: ", except in Aran" }[locale];
}

/** The day before and the day after, when either is a Catalonia-wide holiday; and a day 2026 had and 2027 has not. */
function neighbourNotes(iso: string, kind: DayKind2027, locale: DateLocale): string[] {
  const notes: string[] = [];
  const holiday = kind === "holiday" || kind === "weekend-holiday";
  const prev = addDays(iso, -1);
  const next = addDays(iso, 1);
  if (!holiday) {
    const p = regional(prev);
    if (p) {
      notes.push(
        {
          ca: `El dia abans, ${wdm(prev, "ca")}, ${dayName2027(prev, "ca")}, és festiu a tot Catalunya${aranNote(prev, "ca")}.`,
          es: `El día antes, ${wdm(prev, "es")}, ${dayName2027(prev, "es")}, es festivo en toda Cataluña${aranNote(prev, "es")}.`,
          en: `The day before, ${wdm(prev, "en")}, ${dayName2027(prev, "en")}, is a public holiday across Catalonia${aranNote(prev, "en")}.`,
        }[locale],
      );
    }
    const n = regional(next);
    if (n) {
      notes.push(
        {
          ca: `L'endemà, ${wdm(next, "ca")}, ${dayName2027(next, "ca")}, és festiu a tot Catalunya${aranNote(next, "ca")}.`,
          es: `Al día siguiente, ${wdm(next, "es")}, ${dayName2027(next, "es")}, es festivo en toda Cataluña${aranNote(next, "es")}.`,
          en: `The next day, ${wdm(next, "en")}, ${dayName2027(next, "en")}, is a public holiday across Catalonia${aranNote(next, "en")}.`,
        }[locale],
      );
    }
  }
  // 25 December 2027: the next day, Sant Esteve, was in the 2026 order and is not in the 2027 one.
  const lost = !OFF.has(next) ? regional2026(next) : null;
  if (holiday && lost) {
    notes.push(
      {
        ca: `L'endemà, ${wdm(next, "ca")}, ${lost.name.ca}, no és festiu el 2027, tot i que al calendari del 2026 sí que ho és.`,
        es: `Al día siguiente, ${wdm(next, "es")}, ${lost.name.es}, no es festivo en 2027, aunque en el calendario de 2026 sí lo es.`,
        en: `The next day, ${wdm(next, "en")}, ${lost.name.en}, is not a holiday in 2027, though it is one in the 2026 calendar.`,
      }[locale],
    );
  }
  // 15 August and 26 December 2027: holidays in the 2026 calendar, Sundays in 2027.
  const before = !holiday ? regional2026(iso) : null;
  if (before) {
    const aran = aranSwap(2026)?.replaces === before.date;
    notes.push(
      {
        ca: `Al calendari del 2026, en canvi, ${theDate(before.date, "ca")} sí que és festiu (Ordre EMT/66/2025)${aran ? ", excepte a l'Aran" : ""}.`,
        es: `En el calendario de 2026, en cambio, ${theDate(before.date, "es")} sí es festivo (Orden EMT/66/2025)${aran ? ", excepto en Arán" : ""}.`,
        en: `In the 2026 calendar, by contrast, ${dayMonthYear(before.date, "en")} is a holiday (Order EMT/66/2025)${aran ? ", except in Aran" : ""}.`,
      }[locale],
    );
  }
  return notes;
}

/* -------------------------------------------------------------------------- */
/* Long weekends: the one link under the answer                               */
/* -------------------------------------------------------------------------- */

/** The run of days off this date gives, as the long weekends guide computes it; null when it adds nothing to a weekend. */
export function runFor2027(iso: string, kind: DayKind2027): (Span & { take: string[] }) | null {
  if (kind === "holiday") {
    const plan = planFor(iso, OFF);
    if (!plan) return null;
    // A holiday next to a working day that joins another holiday (6 December, with the 7th): the longer run.
    if (plan.take.length === 0) {
      const better = [addDays(iso, -1), addDays(iso, 1)]
        .filter((d) => !isWeekend(d) && !OFF.has(d))
        .map((d) => ({ take: [d], ...runAround(iso, new Set([...OFF, d])) }))
        .filter((r) => r.days > plan.days + 1)
        .sort((a, b) => b.days - a.days)[0];
      if (better) return better;
    }
    return { take: [...plan.take], from: plan.from, to: plan.to, days: plan.days };
  }
  if (kind === "working") {
    // A day of the plan of the holiday next to it (5 January for Reis, 7 December for the Immaculada)…
    for (const h of [addDays(iso, -1), addDays(iso, 1)].filter((d) => OFF.has(d))) {
      const plan = planFor(h, OFF);
      if (plan && plan.take.includes(iso)) return { take: [...plan.take], from: plan.from, to: plan.to, days: plan.days };
    }
    // …or the day on its own, when it joins a weekend to a holiday (25 March, 2 November).
    const run = runAround(iso, new Set([...OFF, iso]));
    return run.days >= 4 ? { take: [iso], ...run } : null;
  }
  if (kind === "local") {
    const plan = planFor(iso, new Set([...OFF, iso]));
    return plan ? { take: [...plan.take], from: plan.from, to: plan.to, days: plan.days } : null;
  }
  return null;
}

function noticeFor2027(iso: string, kind: DayKind2027, locale: DateLocale): NonNullable<DateContent["notice"]> {
  const L = (ca: string, es: string, en: string) => (locale === "ca" ? ca : locale === "es" ? es : en);
  if (iso === "2027-01-05") {
    // The eve of Reis: the parade, not a long weekend, is what this reader needs next.
    return {
      before: L(
        "La cavalcada de Reis és aquest vespre: l'horari i el recorregut de la de Barcelona i de les d'altres ciutats són a ",
        "La cabalgata de Reyes es esta tarde: el horario y el recorrido de la de Barcelona y de las de otras ciudades están en ",
        "The Three Kings parade is that evening: times and routes in Barcelona and other towns are in ",
      ),
      label: L("la Cavalcada de Reis 2027", "la Cabalgata de Reyes 2027", "the 2027 Three Kings parade"),
      href: GUIDES.reis[locale],
      after: ".",
    };
  }
  const run = runFor2027(iso, kind);
  let lead = "";
  if (run) {
    const days = run.days;
    const range = rangeWords(run, locale);
    if (kind === "local") {
      lead =
        run.take.length === 0
          ? L(`On és festa local, amb el cap de setmana surten ${days} dies seguits de festa, ${range}`, `Donde es fiesta local, con el fin de semana salen ${days} días seguidos de fiesta, ${range}`, `Where it is a local holiday, the weekend makes it ${days} days off in a row, ${range}`)
          : L(
              `On és festa local, demanant ${takeWords(run.take, "ca")} de vacances surten ${days} dies seguits de festa, ${range}`,
              `Donde es fiesta local, pidiendo ${takeWords(run.take, "es")} de vacaciones salen ${days} días seguidos de fiesta, ${range}`,
              `Where it is a local holiday, taking ${takeWords(run.take, "en")} off makes it ${days} days in a row, ${range}`,
            );
    } else if (run.take.length === 0) {
      lead = L(`Amb el cap de setmana surten ${days} dies seguits de festa, ${range}`, `Con el fin de semana salen ${days} días seguidos de fiesta, ${range}`, `With the weekend, that is ${days} days off in a row, ${range}`);
    } else {
      lead = L(
        `Demanant ${takeWords(run.take, "ca")} de vacances surten ${days} dies seguits de festa, ${range}`,
        `Pidiendo ${takeWords(run.take, "es")} de vacaciones salen ${days} días seguidos de fiesta, ${range}`,
        `Taking ${takeWords(run.take, "en")} off gives ${days} days in a row, ${range}`,
      );
    }
  } else if (kind === "weekend-holiday") {
    lead = L(
      `Com que cau en ${weekdayName(iso, "ca")}, no afegeix cap dia de festa a qui treballa de dilluns a divendres`,
      `Como cae en ${weekdayName(iso, "es")}, no añade ningún día de fiesta a quien trabaja de lunes a viernes`,
      `As it falls on a ${weekdayName(iso, "en")}, it adds no day off to a Monday-to-Friday week`,
    );
  }

  if (iso >= EASTER_FROM && iso <= EASTER_MONDAY) {
    const tail = L(
      "els festius de Setmana Santa, les vacances escolars i els ponts que surten són a ",
      "los festivos de Semana Santa, las vacaciones escolares y los puentes que salen están en ",
      "the Easter holidays, the school break and the long weekends are in ",
    );
    return {
      before: lead ? `${lead}; ${tail}` : capitalize(tail),
      label: L("Setmana Santa 2027 a Catalunya", "Semana Santa 2027 en Cataluña", "Easter 2027 in Catalonia"),
      href: GUIDES.easter2027[locale],
      after: ".",
    };
  }
  const tail =
    kind === "local"
      ? L("els ponts que fan les festes locals de les ciutats més grans són a ", "los puentes que hacen las fiestas locales de las ciudades más grandes están en ", "the long weekends the largest towns' local holidays make are in ")
      : kind === "weekend-holiday"
        ? L("els ponts que sí que surten el 2027 són a ", "los puentes que sí salen en 2027 están en ", "the long weekends 2027 does give are in ")
        : lead
          ? L("aquest i tots els altres ponts del 2027 són a ", "este y todos los demás puentes de 2027 están en ", "that and every other 2027 long weekend are in ")
          : L("tots els festius i els ponts del 2027 són a ", "todos los festivos y puentes de 2027 están en ", "all the 2027 holidays and long weekends are in ");
  return {
    before: lead ? `${lead}; ${tail}` : capitalize(tail),
    label: L("ponts 2027 a Catalunya", "puentes 2027 en Cataluña", "long weekends 2027 in Catalonia"),
    href: GUIDES.bridges2027[locale],
    after: ".",
  };
}

/* -------------------------------------------------------------------------- */
/* Local days                                                                 */
/* -------------------------------------------------------------------------- */

/** "Barcelona, l'Hospitalet de Llobregat i Badalona": the largest municipalities on the list. */
function topTowns(places: readonly DatePlace[], count: number, locale: DateLocale): string {
  const towns = places.filter((p) => !p.parent).slice(0, count);
  return joinList(towns.map((p) => (locale === "es" ? esName(p.name) : p.name)), locale);
}

function localSection(iso: string, kind: DayKind2027, local: NextYearPlaces, next: NextYearLocal, locale: DateLocale): DateContent["local"] {
  const L = (ca: string, es: string, en: string) => (locale === "ca" ? ca : locale === "es" ? es : en);
  const { places, status, known } = local;
  const holiday = kind === "holiday" || kind === "weekend-holiday";
  const n = placesPhrase(places, locale);
  const title = L(`On és festa local ${theDate(iso, "ca")}?`, `¿Dónde es fiesta local el ${dayMonthYear(iso, "es")}?`, `Where is ${dayMonthYear(iso, "en")} a local holiday?`);
  const day = wdm(iso, locale);

  if (status === "dogc") {
    const order = next.order ? orderShort(next.order, locale) : L("l'ordre de festes locals", "la orden de fiestas locales", "the local holidays order");
    if (places.length > 0) {
      return {
        title,
        text: L(`El ${day} és festa local a ${n} (${order}):`, `El ${day} es fiesta local en ${n} (${order}):`, `${capitalize(day)} is a local holiday in ${n} (${order}):`),
        places,
      };
    }
    return {
      title,
      text: holiday
        ? L(`Cap municipi hi afegeix festa local: ja és festiu a tot Catalunya (${order}).`, `Ningún municipio añade fiesta local: ya es festivo en toda Cataluña (${order}).`, `No town adds a local holiday: it is already a holiday across Catalonia (${order}).`)
        : L(`El ${dayMonth(iso, "ca")} no és festa local a cap municipi (${order}).`, `El ${dayMonth(iso, "es")} no es fiesta local en ningún municipio (${order}).`, `${dayMonth(iso, "en")} is not a local holiday anywhere (${order}).`),
      places: [],
    };
  }

  const note = L(
    `Els festius locals del 2027 encara no són oficials: els fixa una ordre del DOGC a proposta de cada ajuntament, i la del 2026 va sortir el 17 de desembre de 2025. Fins aleshores, aquesta llista només recull els ${known} ajuntaments que ja han aprovat i publicat els seus dos dies del 2027, cadascun al seu web, seu electrònica o acta; quan surti l'ordre, la llista serà la de tots els municipis.`,
    `Los festivos locales de 2027 todavía no son oficiales: los fija una orden del DOGC a propuesta de cada ayuntamiento, y la de 2026 salió el 17 de diciembre de 2025. Hasta entonces, esta lista solo recoge los ${known} ayuntamientos que ya han aprobado y publicado sus dos días de 2027, cada uno en su web, sede electrónica o acta; cuando salga la orden, la lista será la de todos los municipios.`,
    `Local holidays for 2027 are not official yet: a DOGC order sets them at each council's request, and the 2026 one appeared on 17 December 2025. Until then this list covers only the ${known} councils that have already approved and published their two 2027 days, each on its own website, e-office or minutes; once the order is out, it will cover every town.`,
  );
  if (places.length > 0) {
    return {
      title,
      text: L(
        `Segons el que ja han aprovat els ajuntaments, el ${day} serà festa local almenys a ${n}, pendent de l'ordre del DOGC:`,
        `Según lo que ya han aprobado los ayuntamientos, el ${day} será fiesta local al menos en ${n}, pendiente de la orden del DOGC:`,
        `From what councils have already approved, ${day} will be a local holiday in at least ${n}, pending the DOGC order:`,
      ),
      places,
      note,
    };
  }
  return {
    title,
    text: holiday
      ? L(
          `Cap dels ${known} ajuntaments que ja han aprovat els seus dies del 2027 no hi ha posat festa local: ja és festiu a tot Catalunya.`,
          `Ninguno de los ${known} ayuntamientos que ya han aprobado sus días de 2027 ha puesto fiesta local: ya es festivo en toda Cataluña.`,
          `None of the ${known} councils that have approved their 2027 days has put a local holiday on it: it is already a holiday across Catalonia.`,
        )
      : L(
          `Cap dels ${known} ajuntaments que ja han aprovat els seus dies del 2027 no l'ha triat com a festa local.`,
          `Ninguno de los ${known} ayuntamientos que ya han aprobado sus días de 2027 lo ha elegido como fiesta local.`,
          `None of the ${known} councils that have approved their 2027 days has chosen it as a local holiday.`,
        ),
    places: [],
    note,
  };
}

/* -------------------------------------------------------------------------- */
/* Shops, schools, transport                                                  */
/* -------------------------------------------------------------------------- */

function shopsParagraphs(iso: string, kind: DayKind2027, locale: DateLocale): string[] {
  const L = (ca: string, es: string, en: string) => (locale === "ca" ? ca : locale === "es" ? es : en);
  const dm = dayMonth(iso, locale);
  // "l'1 de novembre", "el 6 de desembre".
  const caDm = `${caDayArticle(iso)}${dayMonth(iso, "ca")}`;
  const exempt = L(
    "Poden obrir els establiments que la llei deixa fora d'aquest horari, com fleques, pastisseries, botigues de conveniència, floristeries o farmàcies (Llei 18/2017, article 37).",
    "Pueden abrir los establecimientos que la ley deja fuera de ese horario, como panaderías, pastelerías, tiendas de conveniencia, floristerías o farmacias (Ley 18/2017, artículo 37).",
    "Businesses the law leaves outside that timetable may open, such as bakeries, pastry shops, convenience stores, florists and pharmacies (Llei 18/2017, article 37).",
  );
  const [def1, def2] = OPENING_2027.municipalDefault;
  const municipal = L(
    `Els dos dies propis de cada municipi per al 2027 encara no s'han publicat; on l'ajuntament no n'hagi triat cap, seran el ${dayMonth(def1, "ca")} i el ${dayMonth(def2, "ca")} (Ordre EMT/89/2026, article 5).`,
    `Los dos días propios de cada municipio para 2027 todavía no se han publicado; donde el ayuntamiento no haya elegido ninguno, serán el ${dayMonth(def1, "es")} y el ${dayMonth(def2, "es")} (Orden EMT/89/2026, artículo 5).`,
    `Each town's own two days for 2027 have not been published yet; where a council chose none, they are ${dayMonth(def1, "en")} and ${dayMonth(def2, "en")} (Order EMT/89/2026, article 5).`,
  );

  if (CLOSING_2027.has(iso)) {
    const notHoliday = !OFF.has(iso);
    return [
      L(
        `Les botigues amb horari general han de tancar: la llei de comerç fixa uns quants dies de tancament obligatori, l'1 i el 6 de gener, el diumenge i el dilluns de Pasqua, l'1 de maig, el 24 de juny, l'11 de setembre i el 25 i el 26 de desembre (Llei 18/2017, article 36.2.d)${notHoliday ? `, i ${caDm} hi és encara que el ${YEAR} no sigui festiu` : ""}.`,
        `Las tiendas con horario general tienen que cerrar: la ley catalana de comercio fija varios días de cierre obligatorio, el 1 y el 6 de enero, el domingo y el lunes de Pascua, el 1 de mayo, el 24 de junio, el 11 de septiembre y el 25 y el 26 de diciembre (Ley 18/2017, artículo 36.2.d)${notHoliday ? `, y el ${dm} está en la lista aunque en ${YEAR} no sea festivo` : ""}.`,
        `Shops on the general timetable must close: Catalonia's retail law sets a few compulsory closing days, 1 and 6 January, Easter Sunday and Monday, 1 May, 24 June, 11 September and 25 and 26 December (Llei 18/2017, article 36.2.d)${notHoliday ? `, and ${dm} is on the list even though it is not a holiday in ${YEAR}` : ""}.`,
      ),
      exempt,
    ];
  }
  if ((OPENING_2027.general as readonly string[]).includes(iso)) {
    return [
      L(
        `Les botigues poden obrir: ${caDm} és un dels vuit diumenges i festius d'obertura del calendari general del ${YEAR} (Ordre EMT/89/2026).`,
        `Las tiendas pueden abrir: el ${dm} es uno de los ocho domingos y festivos de apertura del calendario general de ${YEAR} (Orden EMT/89/2026).`,
        `Shops may open: ${dm} is one of the eight Sundays and holidays of the general ${YEAR} opening calendar (Order EMT/89/2026).`,
      ),
      L("Poder obrir no vol dir que obrin: cada botiga decideix.", "Poder abrir no quiere decir que abran: cada tienda decide.", "Being allowed to open does not mean every shop will."),
    ];
  }
  if (OFF.has(iso) || isWeekend(iso)) {
    const what = OFF.has(iso)
      ? L("És festiu", "Es festivo", "It is a public holiday")
      : L(`És ${weekdayName(iso, "ca")}`, `Es ${weekdayName(iso, "es")}`, `It is a ${weekdayName(iso, "en")}`);
    return [
      L(
        `${what} i ${caDm} no és cap dels vuit dies d'obertura del calendari general del ${YEAR} (Ordre EMT/89/2026): les botigues amb horari general només hi podran obrir als municipis que el triïn com un dels seus dos dies propis. ${municipal}`,
        `${what} y el ${dm} no es ninguno de los ocho días de apertura del calendario general de ${YEAR} (Orden EMT/89/2026): las tiendas con horario general solo podrán abrir en los municipios que lo elijan como uno de sus dos días propios. ${municipal}`,
        `${what}, and ${dm} is not one of the eight opening days of the general ${YEAR} calendar (Order EMT/89/2026): shops on the general timetable may open only in towns that pick it as one of their own two days. ${municipal}`,
      ),
      exempt,
    ];
  }
  return [
    L(
      `És un dia feiner: les botigues obren amb el seu horari habitual. Als municipis on sigui festa local, les botigues amb horari general només hi podran obrir si l'ajuntament el tria com un dels seus dos dies d'obertura del ${YEAR}, que encara no s'han publicat (Ordre EMT/89/2026).`,
      `Es laborable: las tiendas abren con su horario habitual. En los municipios donde sea fiesta local, las tiendas con horario general solo podrán abrir si el ayuntamiento lo elige como uno de sus dos días de apertura de ${YEAR}, que todavía no se han publicado (Orden EMT/89/2026).`,
      `It is a working day, so shops keep their usual hours. Where it is a local holiday, shops on the general timetable may open only if the council picks it as one of its two ${YEAR} opening days, which have not been published yet (Order EMT/89/2026).`,
    ),
  ];
}

function schoolParagraph(iso: string, kind: DayKind2027, places: readonly DatePlace[], locale: DateLocale): string {
  const L = (ca: string, es: string, en: string) => (locale === "ca" ? ca : locale === "es" ? es : en);
  const status = schoolStatusOn(iso);
  const order = L("Ordre EDF/66/2026", "Orden EDF/66/2026", "Order EDF/66/2026");
  if (status.kind === "christmas" || status.kind === "easter") {
    const [from, to] = status.kind === "christmas" ? status.year.christmas : status.year.easter;
    const name = status.kind === "christmas" ? L("Nadal", "Navidad", "Christmas") : L("Setmana Santa", "Semana Santa", "Easter");
    return L(
      `No hi ha classe: és dins de les vacances escolars de ${name}, ${spanYear(from, to, "ca")}, tots dos inclosos (${order}).`,
      `No hay clase: está dentro de las vacaciones escolares de ${name}, ${spanYear(from, to, "es")}, ambos incluidos (${order}).`,
      `There is no school: it falls in the ${name} school holidays, ${spanYear(from, to, "en")}, both included (${order}).`,
    );
  }
  if (status.kind === "summer") {
    const before = [...SCHOOL_YEARS].reverse().find((y) => y.end < iso);
    const after = status.nextStart;
    return L(
      `No hi ha classe: és estiu. El curs ${before?.label ?? ""} acaba el ${dayMonthYear(before?.end ?? iso, "ca")} i el ${after.label} comença el ${dayMonthYear(after.start, "ca")} (${order}).`,
      `No hay clase: es verano. El curso ${before?.label ?? ""} acaba el ${dayMonthYear(before?.end ?? iso, "es")} y el ${after.label} empieza el ${dayMonthYear(after.start, "es")} (${order}).`,
      `There is no school: it is the summer break. The ${before?.label ?? ""} school year ends on ${dayMonthYear(before?.end ?? iso, "en")} and ${after.label} starts on ${dayMonthYear(after.start, "en")} (${order}).`,
    );
  }
  if (isWeekend(iso)) {
    return L(`És ${weekdayName(iso, "ca")}: no hi ha classe.`, `Es ${weekdayName(iso, "es")}: no hay clase.`, `It is a ${weekdayName(iso, "en")}: there is no school.`);
  }
  if (OFF.has(iso)) {
    return L(`És festiu i, per tant, no hi ha classe (${order}).`, `Es festivo y, por tanto, no hay clase (${order}).`, `It is a public holiday, so there is no school (${order}).`);
  }
  const wd = weekdayName(iso, locale);
  const breakNext = status.kind === "term" && status.nextBreak.from === addDays(iso, 1) && status.nextBreak.kind !== "summer";
  const breakNote = breakNext
    ? L(
        ` L'endemà comencen les vacances escolars de ${status.nextBreak.kind === "easter" ? "Setmana Santa" : "Nadal"}.`,
        ` Al día siguiente empiezan las vacaciones escolares de ${status.nextBreak.kind === "easter" ? "Semana Santa" : "Navidad"}.`,
        ` The ${status.nextBreak.kind === "easter" ? "Easter" : "Christmas"} school holidays start the next day.`,
      )
    : "";
  if (kind === "local") {
    return L(
      `No hi ha classe als municipis on és festa local, com ${topTowns(places, 3, "ca")}: les festes locals també són festiu escolar. A la resta de Catalunya hi ha classe, tret que l'escola hi hagi posat un dels seus quatre dies de lliure disposició del curs (${order}).${breakNote}`,
      `No hay clase en los municipios donde es fiesta local, como ${topTowns(places, 3, "es")}: las fiestas locales también son festivo escolar. En el resto de Cataluña hay clase, salvo que la escuela haya puesto uno de sus cuatro días de libre disposición del curso (${order}).${breakNote}`,
      `There is no school where it is a local holiday, such as ${topTowns(places, 3, "en")}: local holidays are school holidays too. Elsewhere in Catalonia there is school, unless the school has made it one of its four free-choice days of the year (${order}).${breakNote}`,
    );
  }
  return L(
    `Hi ha classe a Catalunya, tret dels municipis on és festa local: les festes locals també són festiu escolar. A més, cada escola tria quatre dies de lliure disposició per curs i en pot fer servir un aquest ${wd}: mira el calendari del teu centre (${order}).${breakNote}`,
    `Hay clase en Cataluña, salvo en los municipios donde es fiesta local: las fiestas locales también son festivo escolar. Además, cada escuela elige cuatro días de libre disposición por curso y puede usar uno este ${wd}: mira el calendario de tu centro (${order}).${breakNote}`,
    `There is school in Catalonia, except where it is a local holiday: local holidays are school holidays too. Each school also picks four free-choice days a year and may use one on this ${wd}: check your school's calendar (${order}).${breakNote}`,
  );
}

/** The metro on a holiday and on the night before one (TMB's standing rules, in the metro hours guide). */
function transportParagraph(iso: string, locale: DateLocale): string | null {
  const pointer = {
    ca: "Per saber com obre i tanca el metro de Barcelona els festius i les vigílies, mira la guia d'horaris del metro.",
    es: "Para saber cómo abre y cierra el metro de Barcelona los festivos y las vísperas, mira la guía de horarios del metro.",
    en: "For how the Barcelona metro opens and closes on public holidays and the nights before them, see the metro hours guide.",
  }[locale];
  if (OFF.has(iso)) return pointer;
  const next = addDays(iso, 1);
  if (!OFF.has(next)) return null;
  return {
    ca: `La nit del ${Number(iso.slice(8))} al ${dayMonth(next, "ca")} és vigília de festiu. ${pointer}`,
    es: `La noche del ${Number(iso.slice(8))} al ${dayMonth(next, "es")} es víspera de festivo. ${pointer}`,
    en: `The night of ${dayMonth(iso, "en")} is the eve of a public holiday. ${pointer}`,
  }[locale];
}

/* -------------------------------------------------------------------------- */
/* The answer                                                                 */
/* -------------------------------------------------------------------------- */

/** ", segons els ajuntaments (pendent de l'ordre del DOGC)": after a list of council-approved places; one council in the singular. */
function pendingClause(places: readonly DatePlace[], locale: DateLocale): string {
  const councils = new Set(places.map((p) => p.slug)).size;
  if (councils === 1) {
    return { ca: ", segons l'ajuntament (pendent de l'ordre del DOGC)", es: ", según su ayuntamiento (pendiente de la orden del DOGC)", en: ", as approved by its council (pending the DOGC order)" }[locale];
  }
  return { ca: ", segons els ajuntaments (pendent de l'ordre del DOGC)", es: ", según sus ayuntamientos (pendiente de la orden del DOGC)", en: ", as approved by their councils (pending the DOGC order)" }[locale];
}

function answerFor(iso: string, kind: DayKind2027, local: NextYearPlaces, locale: DateLocale): string {
  const L = (ca: string, es: string, en: string) => (locale === "ca" ? ca : locale === "es" ? es : en);
  const name = dayName2027(iso, locale);
  const long = locale === "en" ? `${wdm(iso, "en")} ${YEAR}` : `${wdm(iso, locale)} de ${YEAR}`;
  const named = name ? `, ${name},` : "";
  const { places, status } = local;
  const pending = status === "council";
  const n = placesPhrase(places, locale);
  const atLeast = pending ? L("almenys ", "al menos ", "at least ") : "";

  if (kind === "holiday" || kind === "weekend-holiday") {
    const aran = iso === ARAN.replaces;
    const where = aran
      ? L(
          `és festiu a Catalunya (Ordre EMT/52/2026), excepte a l'Aran, on el substitueix la ${ARAN.name.ca} del ${dayMonth(ARAN.date, "ca")}.`,
          `es festivo en Cataluña (Orden EMT/52/2026), excepto en Arán, donde lo sustituye la ${ARAN.name.es} del ${dayMonth(ARAN.date, "es")}.`,
          `is a public holiday in Catalonia (Order EMT/52/2026), except in Aran, where the ${ARAN.name.en} on ${dayMonth(ARAN.date, "en")} replaces it.`,
        )
      : L("és festiu a tot Catalunya (Ordre EMT/52/2026).", "es festivo en toda Cataluña (Orden EMT/52/2026).", "is a public holiday across Catalonia (Order EMT/52/2026).");
    if (kind === "holiday") return L(`Sí. El ${long}${named} ${where}`, `Sí. El ${long}${named} ${where}`, `Yes. ${long}${named} ${where}`);
    const monday = mondayAfter(iso);
    const moved = OFF.has(monday);
    const wd = weekdayName(iso, locale);
    return L(
      `Sí, però cau en ${wd}. ${capitalize(theDate(iso, "ca"))}${named} ${where.replace(/\.$/, "")}${moved ? "." : `, i l'ordre no el passa a cap altre dia: el ${wdm(monday, "ca")} és feiner.`}`,
      `Sí, pero cae en ${wd}. ${capitalize(theDate(iso, "es"))}${named} ${where.replace(/\.$/, "")}${moved ? "." : `, y la orden no lo pasa a otro día: el ${wdm(monday, "es")} es laborable.`}`,
      `Yes, but it falls on a ${wd}. ${dayMonthYear(iso, "en")}${named} ${where.replace(/\.$/, "")}${moved ? "." : `, and the order does not move it: ${wdm(monday, "en")} is a working day.`}`,
    );
  }

  if (kind === "weekend") {
    const monday = mondayAfter(iso);
    return L(
      `No. El ${long}${named} no és festiu a Catalunya: cau en ${weekdayName(iso, "ca")} i l'Ordre EMT/52/2026 no l'inclou entre els dotze festius del ${YEAR}, ni hi posa el ${wdm(monday, "ca")}.`,
      `No. El ${long}${named} no es festivo en Cataluña: cae en ${weekdayName(iso, "es")} y la Orden EMT/52/2026 no lo incluye entre los doce festivos de ${YEAR}, ni incluye el ${wdm(monday, "es")}.`,
      `No. ${long}${named} is not a public holiday in Catalonia: it falls on a ${weekdayName(iso, "en")}, and Order EMT/52/2026 leaves it out of the twelve ${YEAR} holidays and does not add ${wdm(monday, "en")} either.`,
    );
  }

  if (kind === "local") {
    const towns = places.filter((p) => !p.parent).length;
    const who = towns <= 4 ? `${n}: ${placeNames(places.filter((p) => !p.parent), locale)}` : `${n}, ${L("entre els quals", "entre ellos", "including")} ${topTowns(places, 3, locale)}`;
    const source = pending ? pendingClause(places, locale) : "";
    return L(
      `No a tot Catalunya. El ${long}${named} no és cap dels dotze festius del ${YEAR} (Ordre EMT/52/2026), però és festa local ${atLeast}a ${who}${source}.`,
      `No en toda Cataluña. El ${long}${named} no es ninguno de los doce festivos de ${YEAR} (Orden EMT/52/2026), pero es fiesta local ${atLeast}en ${who}${source}.`,
      `Not across Catalonia. ${long}${named} is not one of the twelve ${YEAR} holidays (Order EMT/52/2026), but it is a local holiday in ${atLeast}${who}${source}.`,
    );
  }

  const localPart =
    places.length === 0
      ? ""
      : L(
          ` Sí que és festa local ${atLeast}a ${n}: ${placeNames(places, "ca")}${pending ? pendingClause(places, "ca") : ""}.`,
          ` Sí es fiesta local ${atLeast}en ${n}: ${placeNames(places, "es")}${pending ? pendingClause(places, "es") : ""}.`,
          ` It is a local holiday in ${atLeast}${n}: ${placeNames(places, "en")}${pending ? pendingClause(places, "en") : ""}.`,
        );
  return L(
    `No. El ${long}${named} és un dia feiner a Catalunya: no és cap dels dotze festius del ${YEAR} (Ordre EMT/52/2026).${localPart}`,
    `No. El ${long}${named} es laborable en Cataluña: no es ninguno de los doce festivos de ${YEAR} (Orden EMT/52/2026).${localPart}`,
    `No. ${long}${named} is a working day in Catalonia: it is not one of the twelve ${YEAR} holidays (Order EMT/52/2026).${localPart}`,
  );
}

/** The next Monday's local places, for a Sunday that is not a holiday (16 August 2027 in three towns). */
function mondayLocalNote(iso: string, kind: DayKind2027, next: NextYearLocal, locale: DateLocale): string | null {
  if (kind !== "weekend") return null;
  const monday = mondayAfter(iso);
  const on = nextYearPlacesOn(monday, next);
  if (on.places.length === 0) return null;
  const pending = on.status === "council";
  return {
    ca: `El ${wdm(monday, "ca")} és festa local a ${placeNames(on.places, "ca")}${pending ? pendingClause(on.places, "ca") : ""}.`,
    es: `El ${wdm(monday, "es")} es fiesta local en ${placeNames(on.places, "es")}${pending ? pendingClause(on.places, "es") : ""}.`,
    en: `${capitalize(wdm(monday, "en"))} is a local holiday in ${placeNames(on.places, "en")}${pending ? pendingClause(on.places, "en") : ""}.`,
  }[locale];
}

function descriptionFor(iso: string, kind: DayKind2027, local: NextYearPlaces, locale: DateLocale, showsRun: boolean): string {
  const name = dayName2027(iso, locale);
  const wd = weekdayName(iso, locale);
  const dm = dayMonth(iso, locale);
  // "el dilluns 1 de novembre" (the article goes with the weekday), but "l'1 de novembre".
  const day = locale === "en" ? `${capitalize(wd)} ${dm} ${YEAR}` : `el ${wd} ${dm} de ${YEAR}`;
  const plainDay = theDate(iso, locale);
  const named = name ? `, ${name},` : "";
  const aran = iso === ARAN.replaces;
  const scope = spainScope(iso);
  const C = (ca: string[], es: string[], en: string[]) => fit(locale === "ca" ? ca : locale === "es" ? es : en, DESCRIPTION_MAX);

  if (kind === "holiday") {
    const notAran = aran ? { ca: " (no a l'Aran)", es: " (no en Arán)", en: " (not in Aran)" }[locale] : "";
    return C(
      [
        `Sí: ${day}${named} és festiu a tot Catalunya${notAran}. Botigues, escoles, el pont i la resta d'Espanya.`,
        `Sí: ${day}${named} és festiu a tot Catalunya${notAran}. Botigues, escoles i el pont.`,
        `Sí: ${day} és festiu a tot Catalunya${notAran}. Botigues, escoles i el pont.`,
      ],
      [
        `Sí: ${day}${named} es festivo en toda Cataluña${notAran}. Tiendas, colegios, el puente y el resto de España.`,
        `Sí: ${day}${named} es festivo en toda Cataluña${notAran}. Tiendas, colegios y el puente.`,
        `Sí: ${day} es festivo en toda Cataluña${notAran}. Tiendas, colegios y el puente.`,
      ],
      [
        `Yes: ${day}${named} is a public holiday across Catalonia${notAran}. Shops, schools, the long weekend and the rest of Spain.`,
        `Yes: ${day}${named} is a public holiday across Catalonia${notAran}. Shops, schools and the long weekend.`,
        `Yes: ${day} is a public holiday across Catalonia${notAran}. Shops, schools and the long weekend.`,
      ],
    );
  }
  if (kind === "weekend-holiday") {
    return C(
      [
        `Sí, però cau en ${wd}: ${plainDay}${named} és festiu a tot Catalunya i no es passa al dilluns. Botigues, escoles i la resta d'Espanya.`,
        `Sí, però cau en ${wd}: ${plainDay} és festiu a tot Catalunya i no es passa al dilluns. Botigues, escoles i la resta d'Espanya.`,
      ],
      [
        `Sí, pero cae en ${wd}: ${plainDay}${named} es festivo en toda Cataluña y no pasa al lunes. Tiendas, colegios y el resto de España.`,
        `Sí, pero cae en ${wd}: ${plainDay} es festivo en toda Cataluña y no pasa al lunes. Tiendas, colegios y el resto de España.`,
      ],
      [
        `Yes, but it falls on a ${capitalize(wd)}: ${plainDay}${named} is a holiday across Catalonia, not moved to Monday. Shops, schools, rest of Spain.`,
        `Yes, but it falls on a ${capitalize(wd)}: ${plainDay} is a holiday across Catalonia, not moved to Monday. Shops, schools, the rest of Spain.`,
      ],
    );
  }
  if (kind === "weekend") {
    return C(
      [
        `No: ${plainDay}${named} cau en ${wd} i no és festiu a Catalunya, ni ho és el dilluns. Botigues, escoles i la resta d'Espanya.`,
        `No: ${plainDay} cau en ${wd} i no és festiu a Catalunya, ni ho és el dilluns. Botigues i la resta d'Espanya.`,
      ],
      [
        `No: ${plainDay}${named} cae en ${wd} y no es festivo en Cataluña, ni lo es el lunes. Tiendas, colegios y el resto de España.`,
        `No: ${plainDay} cae en ${wd} y no es festivo en Cataluña, ni lo es el lunes. Tiendas y el resto de España.`,
      ],
      [
        `No: ${plainDay}${named} falls on a ${capitalize(wd)} and is not a holiday in Catalonia, nor is the Monday. Shops, schools, rest of Spain.`,
        `No: ${plainDay} falls on a ${capitalize(wd)} and is not a holiday in Catalonia, nor is the Monday. Shops and the rest of Spain.`,
      ],
    );
  }
  if (kind === "local") {
    const towns = local.places.filter((p) => !p.parent);
    const more = (k: number) => (towns.length > k ? { ca: " i altres municipis", es: " y otros municipios", en: " and other towns" }[locale] : "");
    const list = (k: number) => `${topTowns(local.places, k, locale)}${more(k)}`;
    return C(
      [3, 2, 1].map((k) => `No a tot Catalunya: ${day}${named} és festa local a ${list(k)}. La llista, botigues, escoles i el pont.`).concat(
        `No a tot Catalunya: ${day} és festa local a ${list(1)}. La llista, botigues i escoles.`,
      ),
      [3, 2, 1].map((k) => `No en toda Cataluña: ${day}${named} es fiesta local en ${list(k)}. La lista, tiendas, colegios y el puente.`).concat(
        `No en toda Cataluña: ${day} es fiesta local en ${list(1)}. La lista, tiendas y colegios.`,
      ),
      [3, 2, 1].map((k) => `Not across Catalonia: ${day}${named} is a local holiday in ${list(k)}. The list, shops, schools, long weekend.`).concat(
        `Not across Catalonia: ${day} is a local holiday in ${list(1)}. The list, shops and schools.`,
      ),
    );
  }
  // Working days: the rest of Spain in the snippet when it differs, as people ask it ("¿es festivo el jueves santo?").
  const spain =
    scope.kind === "allBut" || scope.kind === "all"
      ? { ca: ", però sí a gairebé tota la resta d'Espanya", es: ", pero sí en casi todo el resto de España", en: ", unlike most of Spain" }[locale]
      : scope.kind === "some"
        ? { ca: `, però sí a ${regionList(scope.regions, "ca")}`, es: `, pero sí en ${regionList(scope.regions, "es")}`, en: `, unlike ${regionList(scope.regions, "en")}` }[locale]
        : "";
  // "…i el pont" only when the page works one out (25 March, 2 and 7 December…).
  const tail = showsRun
    ? { ca: "Festes locals, botigues, escoles i el pont.", es: "Fiestas locales, tiendas, colegios y el puente.", en: "Local holidays, shops, schools, long weekend." }[locale]
    : { ca: "Festes locals, botigues i escoles.", es: "Fiestas locales, tiendas y colegios.", en: "Local holidays, shops and schools." }[locale];
  return C(
    [
      `No: ${day}${named} és feiner a Catalunya${spain}. ${tail}`,
      `No: ${day} és feiner a Catalunya${spain}. ${tail}`,
      `No: ${day}${named} és feiner a Catalunya. ${tail}`,
      `No: ${day} és feiner a Catalunya. ${tail}`,
    ],
    [
      `No: ${day}${named} es laborable en Cataluña${spain}. ${tail}`,
      `No: ${day} es laborable en Cataluña${spain}. ${tail}`,
      `No: ${day}${named} es laborable en Cataluña. ${tail}`,
      `No: ${day} es laborable en Cataluña. ${tail}`,
    ],
    [
      `No: ${day}${named} is a working day in Catalonia${spain}. ${tail}`,
      `No: ${day} is a working day in Catalonia${spain}. ${tail}`,
      `No: ${day}${named} is a working day in Catalonia. ${tail}`,
      `No: ${day} is a working day in Catalonia. ${tail}`,
    ],
  );
}

/* -------------------------------------------------------------------------- */
/* The page                                                                   */
/* -------------------------------------------------------------------------- */

const GUIDE_ORDER: Record<DayKind2027, GuideKey[]> = {
  holiday: ["bridges2027", "workCalendar", "shops", "school", "holidayToday", "metroHours"],
  "weekend-holiday": ["bridges2027", "workCalendar", "shops", "holidayToday", "school"],
  working: ["bridges2027", "workCalendar", "localHolidays", "shops", "school", "holidayToday"],
  weekend: ["bridges2027", "workCalendar", "shops", "localHolidays", "holidayToday"],
  local: ["bridges2027", "localHolidays", "workCalendar", "shops", "school"],
};

export function dateContent2027(iso: string, locale: DateLocale, next: NextYearLocal = NEXT_YEAR): DateContent {
  const L = (ca: string, es: string, en: string) => (locale === "ca" ? ca : locale === "es" ? es : en);
  const local = nextYearPlacesOn(iso, next);
  const kind = dayKind2027(iso, local.places);
  const answer = answerFor(iso, kind, local, locale);
  const monday = mondayLocalNote(iso, kind, next, locale);
  // A Catalonia-wide holiday on a Saturday: whether a Monday-to-Friday worker gets another day for it.
  const saturday = kind === "weekend-holiday" && isSaturday(iso);
  const compensation = saturday ? { question: saturdayQuestion(locale), answer: saturdayAnswer(locale) } : null;
  // The answer, then the Saturday note or the Monday after a Sunday, the rest of Spain, and the days around it.
  const answerNote = [
    ...(saturday ? [saturdayNote(locale, "one")] : []),
    ...(monday ? [monday] : []),
    spainSentence(iso, kind, locale),
    ...neighbourNotes(iso, kind, locale),
  ];
  const localPart = localSection(iso, kind, local, next, locale);
  const notice = noticeFor2027(iso, kind, locale);
  // The notice works out a long weekend everywhere but on the eve of Reis, which sends readers to the parade.
  const showsRun = notice.href === GUIDES.reis[locale] ? false : runFor2027(iso, kind) !== null;

  const dmY = dayMonthYear(iso, locale);
  const shopsTitle = L(`Obren les botigues ${theDate(iso, "ca")}?`, `¿Abren las tiendas el ${dmY}?`, `Are shops open on ${dmY}?`);
  const schoolTitle = L(`Hi ha escola ${theDate(iso, "ca")}?`, `¿Hay colegio el ${dmY}?`, `Is there school on ${dmY}?`);
  const shops = shopsParagraphs(iso, kind, locale);
  const school = schoolParagraph(iso, kind, local.places, locale);
  const transport = transportParagraph(iso, locale);
  const sections: DateSection[] = [
    { title: shopsTitle, paragraphs: shops },
    { title: schoolTitle, paragraphs: [school] },
    ...(compensation ? [{ title: compensation.question, paragraphs: [compensation.answer] }] : []),
    ...(transport ? [{ title: L("Transport", "Transporte", "Getting around"), paragraphs: [transport] }] : []),
  ];

  const easter = notice.href === GUIDES.easter2027[locale];
  const guides: GuideKey[] = [
    ...(easter ? (["easter2027"] as GuideKey[]) : []),
    ...GUIDE_ORDER[kind].filter((g) => !(g === "metroHours" && !transport)),
    ...(transport && !GUIDE_ORDER[kind].includes("metroHours") ? (["metroHours"] as GuideKey[]) : []),
  ];

  // Each council whose days are on the list, or the DOGC order once it is out.
  const councilSources = local.councils.map((c) => c.source);
  const localSources: SourceRef[] = local.status === "dogc" ? (next.order ? [next.order] : []) : [...new Map(councilSources.map((s) => [s.url, s])).values()];
  // On a Saturday holiday, the judgment (CENDOJ) and its BOE commentary, after the local ones.
  const extraSources: SourceRef[] = [...localSources, ...(compensation ? SATURDAY_SOURCES.map(({ name, ref, url }) => ({ name, ref, url })) : [])];
  const regionalSource = SNAPSHOT.sources.regional[String(YEAR)];

  const localAnswer = [localPart.text, localPart.places.length ? `${placeNames(localPart.places, locale)}.` : "", localPart.note ?? ""].filter(Boolean).join(" ");
  const faq = [
    { question: dateQuestion(iso, locale), answer: [answer, ...answerNote].join(" ") },
    { question: localPart.title ?? "", answer: localAnswer },
    { question: shopsTitle, answer: shops.join(" ") },
    { question: schoolTitle, answer: school },
    ...(compensation ? [compensation] : []),
  ];

  return {
    holiday: kind === "holiday" || kind === "weekend-holiday",
    answer,
    answerNote,
    notice,
    description: descriptionFor(iso, kind, local, locale, showsRun),
    local: localPart,
    sections,
    guides,
    title: dateTitle2027(iso, locale),
    ...(kind === "local" ? { verdict: L("Festa local", "Fiesta local", "Local holiday") } : {}),
    faq,
    basedOn: [...(regionalSource ? [regionalSource.url] : []), BOE_2027.url, OFFICIAL.shopsOrder2027, OFFICIAL.schoolOrder, ...extraSources.map((s) => s.url)],
    extraSources,
  };
}
