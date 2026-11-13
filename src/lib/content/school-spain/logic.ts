import { addDays, longDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

import { publicHolidaysFor, type TermHoliday } from "./holidays";
import { holidayName, lang } from "./i18n";
import type { Period, RegionCalendar, SchoolBreak } from "./types";

/**
 * Pure answers from one community's 2026-2027 order: what kind of day a date
 * is, the next break, and the title and search description built from them,
 * in the language of the record (`localizeRegion`): Spanish, Catalan or English.
 *
 * "Today" is resolved by the caller (Europe/Madrid); the nightly cron rebuilds
 * the pages (`spainSchoolCalendar` is in DAY_DEPENDENT_BLOCKS), so a title
 * never names a break that is over.
 */

export const SPAIN_SCHOOL_YEAR = "2026-2027";

/**
 * The pages answer for 2026-2027 only. From this day a test fails until the
 * 2027-2028 orders are read (most communities publish them April-June 2027).
 */
export const SPAIN_SCHOOL_EXPIRES = "2027-07-01";

export const SPAIN_TITLE_MAX = 72;
export const SPAIN_DESCRIPTION_MAX = 158;

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

/** "miércoles 23 de diciembre de 2026", "dimecres 23 de desembre de 2026", "Wednesday 23 December 2026". */
export function fullDate(iso: string, locale: Locale = "es"): string {
  return longDate(iso, locale).replace(", ", " ");
}

/** "miércoles 23 de diciembre". */
export function weekdayDay(iso: string, locale: Locale = "es"): string {
  return fullDate(iso, locale).replace(locale === "en" ? / \d{4}$/ : / de \d{4}$/, "");
}

/** "23 de diciembre". */
export function dayMonth(iso: string, locale: Locale = "es"): string {
  return weekdayDay(iso, locale).replace(/^\S+ /, "");
}

/** Catalan: a day 1 or 11 takes an elided article ("l'1 de març", "de l'11"). */
const elides = (text: string) => /^(1|11)(\D|$)/.test(text);

/** Catalan "el 23 de desembre" / "l'1 de març". */
export function caEl(text: string): string {
  return elides(text) ? `l'${text}` : `el ${text}`;
}

/** Catalan "del 23" / "de l'1". */
export function caDel(text: string): string {
  return elides(text) ? `de l'${text}` : `del ${text}`;
}

/** Catalan "al 7 de gener" / "a l'1 de març". */
export function caAl(text: string): string {
  return elides(text) ? `a l'${text}` : `al ${text}`;
}

/**
 * "del 23 de diciembre al 7 de enero", "del 22 al 29 de marzo";
 * "del 23 de desembre al 7 de gener"; "23 December to 7 January", "22 to 29 March".
 */
export function span(period: Period, locale: Locale = "es"): string {
  const sameMonth = period.from.slice(0, 7) === period.to.slice(0, 7);
  const from = sameMonth ? String(Number(period.from.slice(8, 10))) : dayMonth(period.from, locale);
  if (locale === "ca") {
    if (period.from === period.to) return caEl(dayMonth(period.from, locale));
    return `${caDel(from)} ${caAl(dayMonth(period.to, locale))}`;
  }
  if (locale === "en") {
    if (period.from === period.to) return dayMonth(period.from, locale);
    return `${from} to ${dayMonth(period.to, locale)}`;
  }
  if (period.from === period.to) return `el ${dayMonth(period.from)}`;
  return `del ${from} al ${dayMonth(period.to)}`;
}

/** "del miércoles 23 de diciembre de 2026 al jueves 7 de enero de 2027"; English without "from": "Wednesday 23 December 2026 to Thursday 7 January 2027". */
export function longSpan(period: Period, locale: Locale = "es"): string {
  const from = period.from.slice(0, 4) === period.to.slice(0, 4) ? weekdayDay(period.from, locale) : fullDate(period.from, locale);
  if (locale === "ca") {
    if (period.from === period.to) return `el ${fullDate(period.from, locale)}`;
    return `del ${from} al ${fullDate(period.to, locale)}`;
  }
  if (locale === "en") {
    if (period.from === period.to) return fullDate(period.from, locale);
    return `${from} to ${fullDate(period.to, locale)}`;
  }
  if (period.from === period.to) return `el ${fullDate(period.from)}`;
  return `del ${from} al ${fullDate(period.to)}`;
}

/** "la Orden 2034/2026...", "el calendario escolar...": the text's name with its article. */
export function theOrder(short: string, locale: Locale = "es"): string {
  if (locale === "ca") {
    if (/^Ordre/.test(short)) return `l'${short}`;
    if (/^(Resolució|Llei|Instrucció)/.test(short)) return `la ${short}`;
    return /^Decret/.test(short) ? `el ${short}` : `el ${short.charAt(0).toLowerCase()}${short.slice(1)}`;
  }
  if (locale === "en") return /^(Order|Resolution|Decree) (no\. )?[A-Z0-9]/.test(short) ? short : `the ${short}`;
  if (/^(Orden|Resolución|Ley|Instrucción)/.test(short)) return `la ${short}`;
  return /^Decreto/.test(short) ? `el ${short}` : `el ${short.charAt(0).toLowerCase()}${short.slice(1)}`;
}

/** "carnaval", "vacaciones de otoño": a break's name inside a sentence. */
export function breakName(name: string, locale: Locale = "es"): string {
  const keep = locale === "ca" ? /^(Entroido|Dia de|Setmana)/ : locale === "en" ? /^(?!(Autumn|Winter|Spring|Discretionary|Unified) )/ : /^(Entroido|Día de)/;
  return keep.test(name) ? name : `${name.charAt(0).toLowerCase()}${name.slice(1)}`;
}

export function joinList(items: string[], locale: Locale = "es"): string {
  const and = locale === "ca" ? "i" : locale === "en" ? "and" : "y";
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} ${and} ${items.at(-1)}`;
}

/** First letter up: "A la Comunitat de Madrid", "In Andalusia". */
export function cap(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

/** A window in words without its year: "entre el 18 y el 22 de junio", "between 18 and 22 June". */
export function withoutYear(text: string, locale: Locale = "es"): string {
  return text.replace(locale === "en" ? / \d{4}.*$/ : / de \d{4}.*$/, "");
}

/* -------------------------------------------------------------------------- */
/* Days                                                                       */
/* -------------------------------------------------------------------------- */

/** Infant and primary: the first row of every region, the dates titles name. */
export function mainLevels(region: RegionCalendar): { start: string; end: string } {
  const row = region.levels[0];
  if (!row?.start || !row.end) throw new Error(`${region.slug}: the first level row needs a start and an end`);
  return { start: row.start, end: row.end };
}

const within = (iso: string, period: Period) => iso >= period.from && iso <= period.to;

/** Holidays of the BOE table that fall on a school weekday of this region. */
export function holidaysInTerm(region: RegionCalendar): TermHoliday[] {
  const { start, end } = mainLevels(region);
  return publicHolidaysFor(region.boe, start, end).filter((h) => {
    const wd = weekdayIndex(h.date);
    if (wd === 0 || wd === 6) return false;
    if (within(h.date, region.christmas) || within(h.date, region.easter)) return false;
    return !region.otherBreaks.some((b) => within(h.date, b));
  });
}

export type SpainSchoolDay =
  | { kind: "before"; start: string }
  | { kind: "weekend" }
  | { kind: "holiday"; name: string }
  | { kind: "nonTeaching"; reason: string }
  | { kind: "christmas" | "easter"; until: string }
  | { kind: "break"; name: string; until: string }
  | { kind: "summer" }
  | { kind: "school" };

/** What the regional calendar says about one date (infant and primary). */
export function schoolDayIn(region: RegionCalendar, iso: string): SpainSchoolDay {
  const { start, end } = mainLevels(region);
  if (iso < start) return { kind: "before", start };
  if (iso > end) return { kind: "summer" };
  if (within(iso, region.christmas)) return { kind: "christmas", until: region.christmas.to };
  if (within(iso, region.easter)) return { kind: "easter", until: region.easter.to };
  const brk = region.otherBreaks.find((b) => within(iso, b));
  if (brk) return { kind: "break", name: brk.name, until: brk.to };
  const wd = weekdayIndex(iso);
  if (wd === 0 || wd === 6) return { kind: "weekend" };
  const holiday = publicHolidaysFor(region.boe, iso, iso)[0];
  if (holiday) return { kind: "holiday", name: holidayName(holiday.name, lang(region)) };
  const off = region.nonTeaching.find((d) => d.date === iso && !d.partial);
  if (off) return { kind: "nonTeaching", reason: off.reason };
  return { kind: "school" };
}

/**
 * One calendar per province, where the provinces set their own dates
 * (Andalucía): the region's record with the province's overrides on top.
 * Empty for a region without provincial dates.
 */
export function provinceCalendars(region: RegionCalendar): { name: string; calendar: RegionCalendar }[] {
  return (region.provinces ?? [])
    .filter((p) => p.christmas || p.easter || p.levels || p.otherBreaks || p.nonTeaching)
    .map((p) => ({
      name: p.name,
      calendar: {
        ...region,
        order: p.order,
        levels: p.levels ?? region.levels,
        christmas: p.christmas ?? region.christmas,
        easter: p.easter ?? region.easter,
        otherBreaks: p.otherBreaks ?? region.otherBreaks,
        nonTeaching: [...region.nonTeaching, ...(p.nonTeaching ?? [])],
        provinces: undefined,
      },
    }));
}

/** True when the provinces do not agree on whether a date has class. */
export function variesByProvince(region: RegionCalendar, iso: string): boolean {
  const kinds = new Set(provinceCalendars(region).map((p) => schoolDayIn(p.calendar, iso).kind === "school"));
  return kinds.size > 1;
}

/** The first school day after `iso`: where "se vuelve a clase" points. */
export function nextSchoolDay(region: RegionCalendar, iso: string): string {
  let day = addDays(iso, 1);
  for (let i = 0; i < 30; i++, day = addDays(day, 1)) {
    if (schoolDayIn(region, day).kind === "school") return day;
  }
  return addDays(iso, 1);
}

/** The last weekday with class before a break. */
export function lastClassBefore(region: RegionCalendar, period: Period): string {
  let iso = addDays(period.from, -1);
  for (let i = 0; i < 14; i++, iso = addDays(iso, -1)) {
    if (schoolDayIn(region, iso).kind === "school") return iso;
  }
  return addDays(period.from, -1);
}

export type BreakKind = "christmas" | "easter";

/** The three days a parent asks about a break: last day of class, first day without, first day back. */
export interface BreakDays {
  last: string;
  first: string;
  back: string;
}

export function breakDays(calendar: RegionCalendar, kind: BreakKind): BreakDays {
  const p = calendar[kind];
  return { last: lastClassBefore(calendar, p), first: p.from, back: nextSchoolDay(calendar, p.to) };
}

/**
 * One entry per province where the provinces set their own dates (Andalucía),
 * else the region's own: tables and sentences are computed from these, so a
 * province's day is never hidden behind the region's common days.
 */
export function breakDaysAll(region: RegionCalendar, kind: BreakKind): { name: string | null; days: BreakDays }[] {
  const provinces = provinceCalendars(region);
  if (!provinces.length) return [{ name: null, days: breakDays(region, kind) }];
  return provinces.map(({ name, calendar }) => ({ name, days: breakDays(calendar, kind) }));
}

/** "o" / "u" (before 8 and 11, "ocho", "once") / "or". */
function or(next: string, locale: Locale): string {
  if (locale === "en") return "or";
  return locale === "es" && /^(8|11)(\D|$)/.test(next) ? "u" : "o";
}

/**
 * One day in words, or the alternatives the provinces give:
 * "martes 22 de diciembre", "22 o 23 de diciembre", "7, 8 u 11 de enero".
 */
export function alternatives(dates: string[], locale: Locale = "es"): string {
  const days = [...new Set(dates)].sort();
  if (days.length === 1) return weekdayDay(days[0]!, locale);
  const sameMonth = new Set(days.map((d) => d.slice(0, 7))).size === 1;
  const words = sameMonth ? days.map((d) => String(Number(d.slice(8, 10)))) : days.map((d) => dayMonth(d, locale));
  const last = words.at(-1)!;
  const list = `${words.slice(0, -1).join(", ")} ${or(last, locale)} ${last}`;
  return sameMonth ? `${list}${dayMonth(days[0]!, locale).replace(/^\d+/, "")}` : list;
}

/** "entre el 7 y el 11 de enero", "entre el 7 i l'11 de gener", "between 7 and 11 January". */
export function between(from: string, to: string, locale: Locale = "es"): string {
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const a = sameMonth ? String(Number(from.slice(8, 10))) : dayMonth(from, locale);
  const b = dayMonth(to, locale);
  if (locale === "ca") return `entre ${caEl(a)} i ${caEl(b)}`;
  if (locale === "en") return `between ${a} and ${b}`;
  return `entre el ${a} y el ${b}`;
}

/** Every community's (and province's) last day of class before Christmas and first day back. */
export function christmasDays(regions: readonly RegionCalendar[]): { lasts: string[]; backs: string[] } {
  const all = regions.flatMap((r) => breakDaysAll(r, "christmas").map((x) => x.days));
  return { lasts: all.map((d) => d.last).sort(), backs: all.map((d) => d.back).sort() };
}

export type NextBreak =
  | { kind: "christmas" | "easter"; period: Period }
  | { kind: "break"; period: SchoolBreak }
  | { kind: "summer"; from: string };

/** The next break that has not started yet, in term. Null outside term. */
export function nextBreak(region: RegionCalendar, today: string): NextBreak | null {
  const { start, end } = mainLevels(region);
  if (today > end) return null;
  const candidates: Exclude<NextBreak, { kind: "summer" }>[] = [
    { kind: "christmas", period: region.christmas },
    { kind: "easter", period: region.easter },
    ...region.otherBreaks.map((b) => ({ kind: "break" as const, period: b })),
  ];
  const ahead = candidates
    .filter((c) => c.period.from > today && c.period.from >= start)
    .sort((a, b) => a.period.from.localeCompare(b.period.from));
  return ahead[0] ?? { kind: "summer", from: addDays(end, 1) };
}

/* -------------------------------------------------------------------------- */
/* Title and description                                                      */
/* -------------------------------------------------------------------------- */

export function fit(candidates: string[], max: number): string {
  return candidates.find((c) => c.length <= max) ?? candidates.at(-1)!;
}

/** "23/12"; English "23 Dec". */
export function dm(iso: string, locale: Locale = "es"): string {
  if (locale === "en") return `${Number(iso.slice(8, 10))} ${EN_MONTHS[Number(iso.slice(5, 7)) - 1]}`;
  return `${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`;
}

/**
 * Answer-first, in the searchers' words: the Christmas holidays with their
 * dates until they are over, then Easter, then the last day of term.
 */
function esRegionTitle(region: RegionCalendar, today: string): string {
  const { end } = mainLevels(region);
  const c = region.christmas;
  const e = region.easter;
  const name = region.short;
  // A break lasts, for the title, until the day before classes resume: the
  // weekend after Cantabria's Easter (22-26 March) still asks "when is school back".
  const cBack = nextSchoolDay(region, c.to);
  const eBack = nextSchoolDay(region, e.to);
  const provinces = provinceCalendars(region).map((p) => p.calendar);
  const firstOff = provinces.map((p) => p.christmas.from).sort()[0] ?? c.from;
  const lastBack = provinces.map((p) => nextSchoolDay(p, p.christmas.to)).sort().at(-1) ?? cBack;
  if (c.label && today < lastBack) {
    // Andalucía: each province has its own Christmas; the title says so.
    const year = c.from.slice(0, 4);
    return today >= firstOff
      ? `Vacaciones de Navidad en ${name}: vuelta al cole según la provincia`
      : fit([`Vacaciones de Navidad ${year} en ${name}: fechas de cada provincia`, `Navidad ${year} en ${name}: fechas por provincia`], SPAIN_TITLE_MAX);
  }
  if (today < cBack) {
    if (today >= c.from) {
      if (c.minimum) return fit([`Vacaciones de Navidad en ${name}: como mínimo hasta el ${dayMonth(c.to)}`, `Navidad en ${name}: mínimo hasta el ${dm(c.to)}`], SPAIN_TITLE_MAX);
      const back = cBack;
      return fit(
        [
          `Vacaciones de Navidad en ${name}: se vuelve al cole el ${weekdayDay(back)}`,
          `Vacaciones de Navidad en ${name}: vuelta al cole el ${dayMonth(back)}`,
          `Navidad en ${name}: vuelta al cole el ${dayMonth(back)}`,
          `Navidad en ${name}: vuelta al cole el ${dm(back)}`,
        ],
        SPAIN_TITLE_MAX,
      );
    }
    const year = c.from.slice(0, 4);
    return fit(
      [
        `Vacaciones de Navidad ${year} en ${name}: ${c.minimum ? "como mínimo " : ""}${span(c)}`,
        `Vacaciones de Navidad ${year} ${name}: ${c.minimum ? "mínimo " : ""}${span(c)}`,
        `Navidad ${year} en ${name}: ${c.minimum ? "mínimo " : ""}${span(c)}`,
        `Navidad ${year} ${name}: del ${dm(c.from)} al ${dm(c.to)}`,
      ],
      SPAIN_TITLE_MAX,
    );
  }
  if (today < eBack) {
    if (today >= e.from) {
      if (e.minimum) return fit([`Semana Santa en ${name}: vacaciones como mínimo hasta el ${dayMonth(e.to)}`, `Semana Santa en ${name}: mínimo hasta el ${dm(e.to)}`], SPAIN_TITLE_MAX);
      // Almería keeps Easter Monday off: when the provinces return on different days, say so.
      if (new Set(provinces.map((p) => nextSchoolDay(p, p.easter.to))).size > 1) return `Semana Santa en ${name}: vuelta al cole según la provincia`;
      const back = eBack;
      return fit(
        [
          `Semana Santa en ${name}: se vuelve al cole el ${weekdayDay(back)}`,
          `Semana Santa en ${name}: vuelta al cole el ${dayMonth(back)}`,
          `Semana Santa en ${name}: vuelta al cole el ${dm(back)}`,
        ],
        SPAIN_TITLE_MAX,
      );
    }
    const year = e.from.slice(0, 4);
    return fit(
      [
        `Vacaciones de Semana Santa ${year} en ${name}: ${e.minimum ? "como mínimo " : ""}${span(e)}`,
        `Semana Santa ${year} en los colegios de ${name}: ${e.minimum ? "mínimo " : ""}${span(e)}`,
        `Semana Santa ${year} en ${name}: ${e.minimum ? "mínimo " : ""}${span(e)}`,
        `Semana Santa ${year} ${name}: del ${dm(e.from)} al ${dm(e.to)}`,
      ],
      SPAIN_TITLE_MAX,
    );
  }
  const endText = region.levels[0]?.endText;
  if (endText) {
    // Navarra, País Vasco: each school sets its own last day inside a window.
    return fit(
      [
        `Fin de curso ${end.slice(0, 4)} en ${name}: último día de clase ${endText.replace(/ de \d{4}.*$/, "")}`,
        `Fin de curso ${end.slice(0, 4)} en ${name}: último día ${endText.replace(/ de \d{4}.*$/, "")}`,
        `Fin de curso ${end.slice(0, 4)} en ${name}`,
      ],
      SPAIN_TITLE_MAX,
    );
  }
  const verb = today > end ? "fue" : "es";
  return fit(
    [
      `Fin de curso ${end.slice(0, 4)} en ${name}: el último día de clase ${verb} el ${weekdayDay(end)}`,
      `Fin de curso ${end.slice(0, 4)} en ${name}: último día de clase el ${dayMonth(end)}`,
      `Fin de curso ${end.slice(0, 4)} en ${name}: último día el ${dayMonth(end)}`,
      `Fin de curso ${end.slice(0, 4)} en ${name}: último día el ${dm(end)}`,
    ],
    SPAIN_TITLE_MAX,
  );
}

/** Sentences in the order a parent asks them, added while they fit. */
function esRegionDescription(region: RegionCalendar, today: string): string {
  const { start, end } = mainLevels(region);
  const main = region.levels[0]!;
  const christmas = `Navidad: ${region.christmas.label ?? span(region.christmas)}${region.christmas.minimum ? " como mínimo" : ""}.`;
  const easter = `Semana Santa: ${span(region.easter)}${region.easter.minimum ? " como mínimo" : ""}.`;
  const last = `Último día: ${main.endText ? main.endText.replace(/ de \d{4}/, "") : weekdayDay(end)}.`;
  const first = `Empieza el ${weekdayDay(start)}.`;
  const source = `${region.order.short.replace(/, de .*$/, "")} (${region.order.bulletin}).`;
  const parts: string[] = [`Calendario escolar ${SPAIN_SCHOOL_YEAR} ${region.inName}.`];
  if (today < start) parts.push(first, christmas, easter, last);
  else if (today <= region.christmas.to) parts.push(christmas, easter, last);
  else if (today <= region.easter.to) parts.push(easter, last);
  else parts.push(last);
  parts.push(source);

  let out = "";
  for (const part of parts) {
    const candidate = out ? `${out} ${part}` : part;
    if (candidate.length <= SPAIN_DESCRIPTION_MAX) out = candidate;
  }
  return out;
}

/** The hub: the break everyone is searching for right now. */
function esHubTitle(regions: readonly RegionCalendar[], today: string): string {
  const christmasOver = regions.every((r) => today > r.christmas.to);
  const easterOver = regions.every((r) => today > r.easter.to);
  const christmasYear = regions[0]?.christmas.from.slice(0, 4) ?? "2026";
  const easterYear = regions[0]?.easter.from.slice(0, 4) ?? "2027";
  if (!christmasOver) {
    return fit(
      [`Vacaciones de Navidad ${christmasYear} en los colegios: fechas por comunidades`, `Vacaciones de Navidad ${christmasYear} por comunidades`],
      SPAIN_TITLE_MAX,
    );
  }
  if (!easterOver) {
    return fit(
      [`Semana Santa ${easterYear} en los colegios: fechas por comunidades`, `Vacaciones de Semana Santa ${easterYear} por comunidades`],
      SPAIN_TITLE_MAX,
    );
  }
  return `Fin de curso ${easterYear}: último día de clase por comunidades`;
}

/**
 * Until the last community is back after Christmas (13 Nov 2026: "cuándo
 * empiezan las vacaciones de Navidad 2026", 279 impressions a day at 6), the
 * hub's description is the answer: the days the last class falls on and the
 * window of return, computed from every order. Then the calendar words again.
 */
function christmasHubDescription(regions: readonly RegionCalendar[], today: string): string | null {
  const L = regions[0] ? lang(regions[0]) : "es";
  const { lasts, backs } = christmasDays(regions);
  if (!backs.length || today >= backs.at(-1)!) return null;
  const year = regions[0]!.christmas.from.slice(0, 4);
  const last = alternatives(lasts, L);
  const window = between(backs[0]!, backs.at(-1)!, L);
  const n = regions.length;
  const parts =
    L === "ca"
      ? [
          `Vacances de Nadal ${year} a les escoles: últim dia de classe ${caEl(last)}, segons la comunitat, i tornada ${window}.`,
          `Les ${n} comunitats i ciutats autònomes, amb el text oficial.`,
        ]
      : L === "en"
        ? [
            `Christmas ${year} school holidays in Spain: last day of class ${last}, depending on the region, and back ${window}.`,
            `All ${n} regions and cities, with each official text.`,
          ]
        : [
            `Vacaciones de Navidad ${year} en los colegios: último día de clase el ${last}, según la comunidad, y vuelta ${window}.`,
            `Las ${n} comunidades y ciudades autónomas, con su orden oficial.`,
          ];
  return addWhileFits(parts);
}

function esHubDescription(regions: readonly RegionCalendar[], today: string): string {
  const christmas = christmasHubDescription(regions, today);
  if (christmas) return christmas;
  const n = regions.length;
  const what = regions.every((r) => today > r.christmas.to) ? "Semana Santa, fin de curso" : "Navidad, Semana Santa, fin de curso";
  return `Calendario escolar ${SPAIN_SCHOOL_YEAR} en ${n} comunidades y ciudades autónomas, con la orden oficial de cada una: inicio, ${what} y otros días sin clase.`;
}

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** What the title needs from a region, computed once for the three languages. */
function titleFacts(region: RegionCalendar, today: string) {
  const c = region.christmas;
  const e = region.easter;
  const cBack = nextSchoolDay(region, c.to);
  const eBack = nextSchoolDay(region, e.to);
  const provinces = provinceCalendars(region).map((p) => p.calendar);
  const firstOff = provinces.map((p) => p.christmas.from).sort()[0] ?? c.from;
  const lastBack = provinces.map((p) => nextSchoolDay(p, p.christmas.to)).sort().at(-1) ?? cBack;
  const easterBackDiffers = new Set(provinces.map((p) => nextSchoolDay(p, p.easter.to))).size > 1;
  const phase =
    c.label && today < lastBack
      ? today >= firstOff
        ? "christmasProvincesDuring"
        : "christmasProvincesBefore"
      : today < cBack
        ? today >= c.from
          ? "christmasDuring"
          : "christmasBefore"
        : today < eBack
          ? today >= e.from
            ? "easterDuring"
            : "easterBefore"
          : "end";
  return { c, e, cBack, eBack, easterBackDiffers, phase, end: mainLevels(region).end, endText: region.levels[0]?.endText };
}

function caRegionTitle(region: RegionCalendar, today: string): string {
  const L = "ca";
  const { c, e, cBack, eBack, easterBackDiffers, phase, end, endText } = titleFacts(region, today);
  const name = region.short;
  const inS = region.inShort ?? region.inName;
  const fins = (text: string) => `fins ${caAl(text)}`;
  const cy = c.from.slice(0, 4);
  const ey = e.from.slice(0, 4);
  const y = end.slice(0, 4);
  switch (phase) {
    case "christmasProvincesDuring":
      return `Vacances de Nadal ${inS}: tornada a l'escola segons la província`;
    case "christmasProvincesBefore":
      return fit([`Vacances de Nadal ${cy} ${inS}: dates de cada província`, `Nadal ${cy} ${inS}: dates per província`], SPAIN_TITLE_MAX);
    case "christmasDuring":
      if (c.minimum) return fit([`Vacances de Nadal ${inS}: com a mínim ${fins(dayMonth(c.to, L))}`, `Nadal ${inS}: mínim ${fins(dm(c.to, L))}`], SPAIN_TITLE_MAX);
      return fit(
        [
          `Vacances de Nadal ${inS}: es torna a l'escola ${caEl(weekdayDay(cBack, L))}`,
          `Vacances de Nadal ${inS}: tornada a l'escola ${caEl(dayMonth(cBack, L))}`,
          `Nadal ${inS}: tornada a l'escola ${caEl(dayMonth(cBack, L))}`,
          `Nadal ${inS}: tornada a l'escola ${caEl(dm(cBack, L))}`,
        ],
        SPAIN_TITLE_MAX,
      );
    case "christmasBefore":
      return fit(
        [
          `Vacances de Nadal ${cy} ${inS}: ${c.minimum ? "com a mínim " : ""}${span(c, L)}`,
          `Vacances de Nadal ${cy} ${name}: ${c.minimum ? "mínim " : ""}${span(c, L)}`,
          `Nadal ${cy} ${inS}: ${c.minimum ? "mínim " : ""}${span(c, L)}`,
          `Nadal ${cy} ${name}: ${caDel(dm(c.from, L))} ${caAl(dm(c.to, L))}`,
        ],
        SPAIN_TITLE_MAX,
      );
    case "easterDuring":
      if (e.minimum) return fit([`Setmana Santa ${inS}: vacances com a mínim ${fins(dayMonth(e.to, L))}`, `Setmana Santa ${inS}: mínim ${fins(dm(e.to, L))}`], SPAIN_TITLE_MAX);
      if (easterBackDiffers) return `Setmana Santa ${inS}: tornada a l'escola segons la província`;
      return fit(
        [
          `Setmana Santa ${inS}: es torna a l'escola ${caEl(weekdayDay(eBack, L))}`,
          `Setmana Santa ${inS}: tornada a l'escola ${caEl(dayMonth(eBack, L))}`,
          `Setmana Santa ${inS}: tornada a l'escola ${caEl(dm(eBack, L))}`,
        ],
        SPAIN_TITLE_MAX,
      );
    case "easterBefore":
      return fit(
        [
          `Vacances de Setmana Santa ${ey} ${inS}: ${e.minimum ? "com a mínim " : ""}${span(e, L)}`,
          `Setmana Santa ${ey} a les escoles ${region.deShort ?? region.deName}: ${e.minimum ? "mínim " : ""}${span(e, L)}`,
          `Setmana Santa ${ey} ${inS}: ${e.minimum ? "mínim " : ""}${span(e, L)}`,
          `Setmana Santa ${ey} ${name}: ${caDel(dm(e.from, L))} ${caAl(dm(e.to, L))}`,
        ],
        SPAIN_TITLE_MAX,
      );
  }
  if (endText) {
    return fit(
      [`Final de curs ${y} ${inS}: últim dia de classe ${withoutYear(endText, L)}`, `Final de curs ${y} ${inS}: últim dia ${withoutYear(endText, L)}`, `Final de curs ${y} ${inS}`],
      SPAIN_TITLE_MAX,
    );
  }
  const verb = today > end ? "va ser" : "és";
  return fit(
    [
      `Final de curs ${y} ${inS}: l'últim dia de classe ${verb} ${caEl(weekdayDay(end, L))}`,
      `Final de curs ${y} ${inS}: últim dia de classe ${caEl(dayMonth(end, L))}`,
      `Final de curs ${y} ${inS}: últim dia ${caEl(dayMonth(end, L))}`,
      `Final de curs ${y} ${inS}: últim dia ${caEl(dm(end, L))}`,
    ],
    SPAIN_TITLE_MAX,
  );
}

function enRegionTitle(region: RegionCalendar, today: string): string {
  const L = "en";
  const { c, e, cBack, eBack, easterBackDiffers, phase, end, endText } = titleFacts(region, today);
  const name = region.short;
  const inS = region.inShort ?? region.inName;
  const cy = c.from.slice(0, 4);
  const ey = e.from.slice(0, 4);
  const y = end.slice(0, 4);
  switch (phase) {
    case "christmasProvincesDuring":
      return `Christmas holidays ${inS}: back to school depends on the province`;
    case "christmasProvincesBefore":
      return fit([`Christmas ${cy} school holidays ${inS}: dates by province`, `Christmas ${cy} ${inS}: dates by province`], SPAIN_TITLE_MAX);
    case "christmasDuring":
      if (c.minimum) return fit([`Christmas holidays ${inS}: at least until ${dayMonth(c.to, L)}`, `Christmas ${inS}: at least until ${dm(c.to, L)}`], SPAIN_TITLE_MAX);
      return fit(
        [
          `Christmas holidays ${inS}: back to school on ${weekdayDay(cBack, L)}`,
          `Christmas holidays ${inS}: back to school on ${dayMonth(cBack, L)}`,
          `Christmas ${inS}: back to school on ${dayMonth(cBack, L)}`,
          `Christmas ${inS}: back to school ${dm(cBack, L)}`,
        ],
        SPAIN_TITLE_MAX,
      );
    case "christmasBefore":
      return fit(
        [
          `Christmas ${cy} school holidays ${inS}: ${c.minimum ? "at least " : ""}${span(c, L)}`,
          `Christmas ${cy} holidays ${inS}: ${c.minimum ? "at least " : ""}${span(c, L)}`,
          `Christmas ${cy} ${inS}: ${c.minimum ? "at least " : ""}${span(c, L)}`,
          `Christmas ${cy} ${name}: ${dm(c.from, L)} – ${dm(c.to, L)}`,
        ],
        SPAIN_TITLE_MAX,
      );
    case "easterDuring":
      if (e.minimum) return fit([`Easter holidays ${inS}: at least until ${dayMonth(e.to, L)}`, `Easter ${inS}: at least until ${dm(e.to, L)}`], SPAIN_TITLE_MAX);
      if (easterBackDiffers) return `Easter ${inS}: back to school depends on the province`;
      return fit(
        [
          `Easter holidays ${inS}: back to school on ${weekdayDay(eBack, L)}`,
          `Easter holidays ${inS}: back to school on ${dayMonth(eBack, L)}`,
          `Easter ${inS}: back to school ${dm(eBack, L)}`,
        ],
        SPAIN_TITLE_MAX,
      );
    case "easterBefore":
      return fit(
        [
          `Easter ${ey} school holidays ${inS}: ${e.minimum ? "at least " : ""}${span(e, L)}`,
          `Easter ${ey} holidays ${inS}: ${e.minimum ? "at least " : ""}${span(e, L)}`,
          `Easter ${ey} ${inS}: ${e.minimum ? "at least " : ""}${span(e, L)}`,
          `Easter ${ey} ${name}: ${dm(e.from, L)} – ${dm(e.to, L)}`,
        ],
        SPAIN_TITLE_MAX,
      );
  }
  if (endText) {
    return fit(
      [`End of term ${y} ${inS}: last day of class ${withoutYear(endText, L)}`, `End of term ${y} ${inS}: last day ${withoutYear(endText, L)}`, `End of term ${y} ${inS}`],
      SPAIN_TITLE_MAX,
    );
  }
  const verb = today > end ? "was" : "is";
  return fit(
    [
      `End of term ${y} ${inS}: the last day of class ${verb} ${weekdayDay(end, L)}`,
      `End of term ${y} ${inS}: last day of class ${dayMonth(end, L)}`,
      `End of term ${y} ${inS}: last day ${dayMonth(end, L)}`,
      `End of term ${y} ${inS}: last day ${dm(end, L)}`,
    ],
    SPAIN_TITLE_MAX,
  );
}

/**
 * Answer-first, in the searchers' words: the Christmas holidays with their
 * dates until they are over, then Easter, then the last day of term. In the
 * record's language.
 */
export function liveRegionTitle(region: RegionCalendar, today: string): string {
  const L = lang(region);
  return L === "ca" ? caRegionTitle(region, today) : L === "en" ? enRegionTitle(region, today) : esRegionTitle(region, today);
}

function addWhileFits(parts: string[]): string {
  let out = "";
  for (const part of parts) {
    const candidate = out ? `${out} ${part}` : part;
    if (candidate.length <= SPAIN_DESCRIPTION_MAX) out = candidate;
  }
  return out;
}

/** Sentences in the order a parent asks them, added while they fit. */
export function liveRegionDescription(region: RegionCalendar, today: string): string {
  const L = lang(region);
  if (L === "es") return esRegionDescription(region, today);
  const { start, end } = mainLevels(region);
  const main = region.levels[0]!;
  const c = region.christmas;
  const e = region.easter;
  const ca = L === "ca";
  const christmas = ca
    ? `Nadal: ${c.label ?? span(c, L)}${c.minimum ? " com a mínim" : ""}.`
    : `Christmas: ${c.minimum ? "at least " : ""}${c.label ?? span(c, L)}.`;
  const easter = ca ? `Setmana Santa: ${span(e, L)}${e.minimum ? " com a mínim" : ""}.` : `Easter: ${e.minimum ? "at least " : ""}${span(e, L)}.`;
  const lastDay = main.endText ? main.endText.replace(ca ? / de \d{4}/ : / \d{4}/, "") : weekdayDay(end, L);
  const last = ca ? `Últim dia: ${lastDay}.` : `Last day: ${lastDay}.`;
  const first = ca ? `Comença ${caEl(weekdayDay(start, L))}.` : `Starts ${weekdayDay(start, L)}.`;
  const short = ca ? region.order.short.replace(/, de .*$/, "") : region.order.short.replace(/(\d) of \d.*$/, "$1");
  const source = `${short} (${region.order.bulletin}).`;
  const parts: string[] = [ca ? `Calendari escolar ${SPAIN_SCHOOL_YEAR} ${region.inName}.` : `School calendar ${SPAIN_SCHOOL_YEAR} ${region.inName}.`];
  if (today < start) parts.push(first, christmas, easter, last);
  else if (today <= c.to) parts.push(christmas, easter, last);
  else if (today <= e.to) parts.push(easter, last);
  else parts.push(last);
  parts.push(source);
  return addWhileFits(parts);
}

/** The hub: the break everyone is searching for right now. */
export function liveHubTitle(regions: readonly RegionCalendar[], today: string): string {
  const L = regions[0] ? lang(regions[0]) : "es";
  if (L === "es") return esHubTitle(regions, today);
  const christmasOver = regions.every((r) => today > r.christmas.to);
  const easterOver = regions.every((r) => today > r.easter.to);
  const cy = regions[0]?.christmas.from.slice(0, 4) ?? "2026";
  const ey = regions[0]?.easter.from.slice(0, 4) ?? "2027";
  if (L === "ca") {
    if (!christmasOver) return fit([`Vacances de Nadal ${cy} a les escoles: dates per comunitats`, `Vacances de Nadal ${cy} per comunitats`], SPAIN_TITLE_MAX);
    if (!easterOver) return fit([`Setmana Santa ${ey} a les escoles: dates per comunitats`, `Vacances de Setmana Santa ${ey} per comunitats`], SPAIN_TITLE_MAX);
    return `Final de curs ${ey}: últim dia de classe per comunitats`;
  }
  if (!christmasOver) return fit([`Christmas ${cy} school holidays in Spain: dates by region`, `Christmas ${cy} school holidays by region`], SPAIN_TITLE_MAX);
  if (!easterOver) return fit([`Easter ${ey} school holidays in Spain: dates by region`, `Easter ${ey} school holidays by region`], SPAIN_TITLE_MAX);
  return `End of term ${ey} in Spain: last day of class by region`;
}

export function liveHubDescription(regions: readonly RegionCalendar[], today: string): string {
  const L = regions[0] ? lang(regions[0]) : "es";
  if (L === "es") return esHubDescription(regions, today);
  const christmas = christmasHubDescription(regions, today);
  if (christmas) return christmas;
  const n = regions.length;
  const christmasOver = regions.every((r) => today > r.christmas.to);
  if (L === "ca") {
    const what = christmasOver ? "Setmana Santa, final de curs" : "Nadal, Setmana Santa, final de curs";
    return `Calendari escolar ${SPAIN_SCHOOL_YEAR} de ${n} comunitats i ciutats autònomes, amb el text oficial: inici, ${what} i altres dies sense classe.`;
  }
  const what = christmasOver ? "Easter, end of term" : "Christmas, Easter, end of term";
  return `School calendar ${SPAIN_SCHOOL_YEAR} for ${n} Spanish regions and cities, each with its official text: start, ${what} and other days off.`;
}
