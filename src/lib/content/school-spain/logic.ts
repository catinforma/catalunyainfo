import { addDays, daysBetween, longDate, weekdayIndex } from "@/lib/content/holidays/calendar";

import { publicHolidaysFor, type TermHoliday } from "./holidays";
import type { Period, RegionCalendar, SchoolBreak } from "./types";

/**
 * Pure answers from one community's 2026-2027 order: what kind of day a date
 * is, the next break, and the title and search description built from them.
 * Spanish only: these pages exist only in Spanish.
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

/** "miércoles, 23 de diciembre de 2026" -> "miércoles 23 de diciembre de 2026". */
export function fullDate(iso: string): string {
  return longDate(iso, "es").replace(", ", " ");
}

/** "miércoles 23 de diciembre". */
export function weekdayDay(iso: string): string {
  return fullDate(iso).replace(/ de \d{4}$/, "");
}

/** "23 de diciembre". */
export function dayMonth(iso: string): string {
  return weekdayDay(iso).replace(/^\S+ /, "");
}

/** "del 23 de diciembre al 7 de enero", "del 22 al 29 de marzo". */
export function span(period: Period): string {
  if (period.from === period.to) return `el ${dayMonth(period.from)}`;
  const sameMonth = period.from.slice(0, 7) === period.to.slice(0, 7);
  const from = sameMonth ? String(Number(period.from.slice(8, 10))) : dayMonth(period.from);
  return `del ${from} al ${dayMonth(period.to)}`;
}

/** "del miércoles 23 de diciembre de 2026 al jueves 7 de enero de 2027". */
export function longSpan(period: Period): string {
  if (period.from === period.to) return `el ${fullDate(period.from)}`;
  return `del ${fullDate(period.from)} al ${fullDate(period.to)}`;
}

export function joinList(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
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
  if (holiday) return { kind: "holiday", name: holiday.name };
  const off = region.nonTeaching.find((d) => d.date === iso);
  if (off) return { kind: "nonTeaching", reason: off.reason };
  return { kind: "school" };
}

/** The first school day after `iso`: where "se vuelve a clase" points. */
export function nextSchoolDay(region: RegionCalendar, iso: string): string {
  let day = addDays(iso, 1);
  for (let i = 0; i < 30; i++, day = addDays(day, 1)) {
    if (schoolDayIn(region, day).kind === "school") return day;
  }
  return addDays(iso, 1);
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

function fit(candidates: string[], max: number): string {
  return candidates.find((c) => c.length <= max) ?? candidates.at(-1)!;
}

/** "23/12" */
function dm(iso: string): string {
  return `${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`;
}

/**
 * Answer-first, in the searchers' words: the Christmas holidays with their
 * dates until they are over, then Easter, then the last day of term.
 */
export function liveRegionTitle(region: RegionCalendar, today: string): string {
  const { end } = mainLevels(region);
  const c = region.christmas;
  const e = region.easter;
  const name = region.short;
  if (today <= c.to) {
    if (today >= c.from) {
      const back = nextSchoolDay(region, c.to);
      return fit(
        [
          `Vacaciones de Navidad en ${name}: se vuelve al cole el ${weekdayDay(back)}`,
          `Vacaciones de Navidad en ${name}: vuelta al cole el ${dayMonth(back)}`,
          `Navidad en ${name}: vuelta al cole el ${dm(back)}`,
        ],
        SPAIN_TITLE_MAX,
      );
    }
    const year = c.from.slice(0, 4);
    return fit(
      [
        `Vacaciones de Navidad ${year} en ${name}: ${span(c)}`,
        `Vacaciones de Navidad ${year} ${name}: ${span(c)}`,
        `Navidad ${year} en ${name}: ${span(c)}`,
        `Navidad ${year} ${name}: del ${dm(c.from)} al ${dm(c.to)}`,
      ],
      SPAIN_TITLE_MAX,
    );
  }
  if (today <= e.to) {
    if (today >= e.from) {
      const back = nextSchoolDay(region, e.to);
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
        `Vacaciones de Semana Santa ${year} en ${name}: ${span(e)}`,
        `Semana Santa ${year} en los colegios de ${name}: ${span(e)}`,
        `Semana Santa ${year} en ${name}: ${span(e)}`,
        `Semana Santa ${year} ${name}: del ${dm(e.from)} al ${dm(e.to)}`,
      ],
      SPAIN_TITLE_MAX,
    );
  }
  const verb = today > end ? "fue" : "es";
  return fit(
    [
      `Fin de curso ${end.slice(0, 4)} en ${name}: el último día de clase ${verb} el ${weekdayDay(end)}`,
      `Fin de curso ${end.slice(0, 4)} en ${name}: último día de clase el ${dayMonth(end)}`,
      `Fin de curso ${end.slice(0, 4)} en ${name}: último día el ${dm(end)}`,
    ],
    SPAIN_TITLE_MAX,
  );
}

/** Sentences in the order a parent asks them, added while they fit. */
export function liveRegionDescription(region: RegionCalendar, today: string): string {
  const { start, end } = mainLevels(region);
  const christmas = `Navidad: ${span(region.christmas)}.`;
  const easter = `Semana Santa: ${span(region.easter)}.`;
  const last = `Último día: ${weekdayDay(end)}.`;
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
export function liveHubTitle(regions: readonly RegionCalendar[], today: string): string {
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

export function liveHubDescription(regions: readonly RegionCalendar[], today: string): string {
  const n = regions.length;
  const what = regions.every((r) => today > r.christmas.to) ? "Semana Santa, fin de curso" : "Navidad, Semana Santa, fin de curso";
  return `Calendario escolar ${SPAIN_SCHOOL_YEAR} en ${n} comunidades y ciudades autónomas, con la orden oficial de cada una: inicio, ${what} y otros días sin clase.`;
}
