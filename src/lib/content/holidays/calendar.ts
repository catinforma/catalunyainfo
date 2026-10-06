import type { Locale } from "@/lib/i18n/config";

import { CATALONIA_HOLIDAYS as HOLIDAYS_2027, type Holiday } from "./payload";

/**
 * The Catalonia-wide public holidays, year by year.
 *
 * ## Why this exists separately from `payload.ts`
 *
 * `payload.ts` is the 2027 calendar article: one year, deliberately, because
 * that page is a year planner. Search Console says people are asking a
 * different question far more often — *is the 30th a holiday?*, *is Monday a
 * holiday?*, *is it a holiday today?* — 166 distinct queries of that shape in
 * one week, nearly all answered from position 50 to 99.
 *
 * Answering that needs the current year as well as the next one, so the years
 * live here and the 2027 list is imported rather than copied. One set of dates,
 * two pages.
 *
 * ## Sources
 *
 * 2026 and 2027 both come from the Generalitat's own calendar of work
 * holidays. Every date below was read off that page, and a test asserts the
 * weekday of each one against the date itself, so a transcription slip cannot
 * reach a page that tells somebody Monday when the date is a Tuesday.
 */

export const HOLIDAY_SOURCE = {
  name: "Calendari oficial de festes laborals a Catalunya",
  url: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/",
  publisher: "Departament d'Empresa i Treball, Generalitat de Catalunya",
};

export const CALENDAR_VERIFIED_AT = "2026-10-06";

/** Years this page can answer for. Extend when the next order is published. */
export const COVERED_YEARS = [2026, 2027] as const;

const HOLIDAYS_2026: Holiday[] = [
  { date: "2026-01-01", scope: "catalonia", name: { ca: "Cap d'Any", es: "Año Nuevo", en: "New Year's Day" } },
  { date: "2026-01-06", scope: "catalonia", name: { ca: "Reis", es: "Reyes", en: "Epiphany" } },
  {
    date: "2026-04-03",
    scope: "catalonia",
    name: { ca: "Divendres Sant", es: "Viernes Santo", en: "Good Friday" },
  },
  {
    date: "2026-04-06",
    scope: "catalonia",
    name: { ca: "Dilluns de Pasqua Florida", es: "Lunes de Pascua", en: "Easter Monday" },
  },
  {
    date: "2026-05-01",
    scope: "catalonia",
    name: { ca: "Festa del Treball", es: "Fiesta del Trabajo", en: "Labour Day" },
  },
  { date: "2026-06-24", scope: "catalonia", name: { ca: "Sant Joan", es: "San Juan", en: "Saint John's Day" } },
  {
    date: "2026-08-15",
    scope: "catalonia",
    name: { ca: "l'Assumpció", es: "la Asunción", en: "Assumption of Mary" },
  },
  {
    date: "2026-09-11",
    scope: "catalonia",
    name: {
      ca: "Diada Nacional de Catalunya",
      es: "Diada Nacional de Cataluña",
      en: "National Day of Catalonia",
    },
  },
  {
    date: "2026-10-12",
    scope: "catalonia",
    name: { ca: "Festa Nacional d'Espanya", es: "Fiesta Nacional de España", en: "National Day of Spain" },
  },
  {
    date: "2026-12-08",
    scope: "catalonia",
    name: { ca: "la Immaculada", es: "la Inmaculada", en: "Immaculate Conception" },
  },
  { date: "2026-12-25", scope: "catalonia", name: { ca: "Nadal", es: "Navidad", en: "Christmas Day" } },
  {
    date: "2026-12-26",
    scope: "catalonia",
    name: { ca: "Sant Esteve", es: "San Esteban", en: "Saint Stephen's Day" },
  },
];

export const HOLIDAYS_BY_YEAR: Record<number, Holiday[]> = {
  2026: HOLIDAYS_2026,
  2027: HOLIDAYS_2027,
};

/**
 * Aran keeps a different twelfth day.
 *
 * It is a **substitution**, not an extra holiday: Sant Esteve is not a holiday
 * in Aran, and the Festa d'Aran is. A page that listed both would give Aran
 * thirteen days and everyone else twelve.
 */
export interface AranSubstitution {
  year: number;
  /** The Catalonia-wide date that does not apply in Aran. */
  replaces: string;
  date: string;
  name: { ca: string; es: string; en: string };
}

export const ARAN_SUBSTITUTIONS: AranSubstitution[] = [
  {
    year: 2026,
    replaces: "2026-12-26",
    date: "2026-06-17",
    name: { ca: "Festa d'Aran", es: "Fiesta de Arán", en: "Festa d'Aran" },
  },
];

/* -------------------------------------------------------------------------- */
/* Date handling                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Today in Catalonia, as `YYYY-MM-DD`.
 *
 * Explicitly in Europe/Madrid rather than the server's clock. A page whose
 * entire job is to say whether *today* is a holiday must not be a day out
 * between midnight and 02:00 local time, which is exactly what a UTC server
 * would do.
 */
export function todayInCatalonia(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return parts;
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** 0 = Sunday. */
export function weekdayIndex(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

export function allHolidays(): Holiday[] {
  return COVERED_YEARS.flatMap((year) => HOLIDAYS_BY_YEAR[year] ?? []).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export function holidayOn(iso: string): Holiday | null {
  const year = Number(iso.slice(0, 4));
  return (HOLIDAYS_BY_YEAR[year] ?? []).find((holiday) => holiday.date === iso) ?? null;
}

/** Whether this date is covered by a published order at all. */
export function isCovered(iso: string): boolean {
  return (COVERED_YEARS as readonly number[]).includes(Number(iso.slice(0, 4)));
}

/** The next Catalonia-wide holiday strictly after `iso`, if one is known. */
export function nextHolidayAfter(iso: string): Holiday | null {
  return allHolidays().find((holiday) => holiday.date > iso) ?? null;
}

/** Whole days between two ISO dates. */
export function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00Z`).getTime();
  const b = new Date(`${to}T12:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function aranSubstitutionFor(iso: string): AranSubstitution | null {
  return ARAN_SUBSTITUTIONS.find((item) => item.replaces === iso) ?? null;
}

/** True when this date is a holiday in Aran but not Catalonia-wide. */
export function isAranOnly(iso: string): boolean {
  return ARAN_SUBSTITUTIONS.some((item) => item.date === iso);
}


/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

/*
 * Date formatting lives with the dates rather than with the component, so the
 * weekday a page prints can be tested against the date it prints without
 * loading React. `Intl` is not used for the long form because Catalan needs the
 * preposition elided before a vowel - "12 d'octubre", not "12 de octubre" - and
 * no locale data gives that.
 */

export const WEEKDAY_NAMES: Record<Locale, string[]> = {
  ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

const MONTH_NAMES: Record<Locale, string[]> = {
  ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

/** `dilluns, 12 d'octubre de 2026` — with the Catalan vowel elision. */
export function longDate(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T12:00:00Z`);
  const day = date.getUTCDate();
  const month = MONTH_NAMES[locale][date.getUTCMonth()] ?? "";
  const year = date.getUTCFullYear();
  const weekday = WEEKDAY_NAMES[locale][weekdayIndex(iso)] ?? "";

  if (locale === "en") {
    return `${weekday} ${day} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
  }
  const vowel = /^[aeiouàèéíòóú]/i.test(month);
  const preposition = locale === "ca" ? (vowel ? "d'" : "de ") : "de ";
  return `${weekday}, ${day} ${preposition}${month} ${locale === "ca" ? "de" : "de"} ${year}`;
}

export function shortDate(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T12:00:00Z`);
  const day = date.getUTCDate();
  const month = MONTH_NAMES[locale][date.getUTCMonth()] ?? "";
  if (locale === "en") return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)}`;
  const vowel = /^[aeiouàèéíòóú]/i.test(month);
  return `${day} ${locale === "ca" && vowel ? "d'" : "de "}${month}`;
}

export type { Holiday };
