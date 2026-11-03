import type { Locale } from "@/lib/i18n/config";
import { aranSwap } from "@/lib/programmatic/holidays/data";
import { datePath, isDatePage } from "@/lib/programmatic/holidays/paths";

import { WEEKDAY_NAMES, addDays, allHolidays, holidayOn, isCovered, shortDate, weekdayIndex } from "./calendar";

/**
 * The first screen of "is today a holiday?", as sentences.
 *
 * ## Why every sentence carries its own date
 *
 * The page is static HTML, rebuilt by the nightly cron (23:05 UTC: 00:05 in
 * Madrid in winter, 01:05 in summer) and regenerated on the first visit after
 * that. Between midnight and that first visit, and for anyone whose browser or
 * Google's cache holds yesterday's copy, "No, today is not a holiday" would be
 * a claim about the wrong day. "No: today, Tuesday 3 November, is not a
 * holiday" stays true whenever it is read — at worst it is visibly about
 * yesterday.
 *
 * For the same reason nothing here counts days ("in 35 days"): a count goes
 * stale at midnight, a date never does.
 *
 * Search Console, 28 days to 3 Nov 2026: "hoy es festivo en cataluña" 162
 * impressions at 8.2 and "es festivo hoy en cataluña" 49 at 8.8, no clicks;
 * "mañana es festivo" 57. The answer, tomorrow and the next three holidays are
 * what those searches ask for, so they come before anything else.
 */

export interface NextHoliday {
  date: string;
  /** "martes 8 de diciembre", with the year when it is not this year's. */
  when: string;
  name: string;
  /** Its date page ("/es/festivos/dia/8-diciembre-2026/"), when it has one. */
  href: string | null;
  /** "excepto en Arán" when Aran swaps this day for the Festa d'Aran. */
  aran: string | null;
}

export interface TodayAnswer {
  today: string;
  tomorrow: string;
  isHoliday: boolean;
  /** "No: hoy, martes 3 de noviembre, no es festivo en Cataluña." */
  answer: string;
  /** "No — miércoles 4 de noviembre" / "Sí — martes 8 de diciembre, la Inmaculada". */
  tomorrowValue: string;
  nextLabel: string;
  /** The next three Catalonia-wide holidays strictly after today; fewer near the end of the published years. */
  next: NextHoliday[];
  /** Shown instead of the list when no published calendar has a next holiday. */
  nextUnknown: string;
}

interface AnswerCopy {
  yes: (when: string, name: string) => string;
  no: (when: string) => string;
  /** Today falls in a year with no published order: never guessed. */
  unknown: (when: string) => string;
  exceptAran: string;
  tomorrowYes: (when: string, name: string) => string;
  tomorrowNo: (when: string) => string;
  tomorrowUnknown: (when: string) => string;
  nextLabel: string;
  nextUnknown: string;
}

const COPY: Record<Locale, AnswerCopy> = {
  ca: {
    yes: (when, name) => `Sí: avui, ${when}, és festiu a Catalunya (${name}).`,
    no: (when) => `No: avui, ${when}, no és festiu a Catalunya.`,
    unknown: (when) => `Avui, ${when}: encara no s'ha publicat el calendari oficial d'aquest any.`,
    exceptAran: "excepte a l'Aran",
    tomorrowYes: (when, name) => `Sí — ${when}, ${name}`,
    tomorrowNo: (when) => `No — ${when}`,
    tomorrowUnknown: (when) => `Encara no es pot saber (${when})`,
    nextLabel: "Pròxims festius",
    nextUnknown: "Encara no s'ha publicat el calendari de l'any vinent.",
  },
  es: {
    yes: (when, name) => `Sí: hoy, ${when}, es festivo en Cataluña (${name}).`,
    no: (when) => `No: hoy, ${when}, no es festivo en Cataluña.`,
    unknown: (when) => `Hoy, ${when}: todavía no se ha publicado el calendario oficial de este año.`,
    exceptAran: "excepto en Arán",
    tomorrowYes: (when, name) => `Sí — ${when}, ${name}`,
    tomorrowNo: (when) => `No — ${when}`,
    tomorrowUnknown: (when) => `Todavía no se puede saber (${when})`,
    nextLabel: "Próximos festivos",
    nextUnknown: "Todavía no se ha publicado el calendario del año que viene.",
  },
  en: {
    yes: (when, name) => `Yes: today, ${when}, is a public holiday in Catalonia (${name}).`,
    no: (when) => `No: today, ${when}, is not a public holiday in Catalonia.`,
    unknown: (when) => `Today, ${when}: this year's official calendar has not been published yet.`,
    exceptAran: "except in Aran",
    tomorrowYes: (when, name) => `Yes — ${when}, ${name}`,
    tomorrowNo: (when) => `No — ${when}`,
    tomorrowUnknown: (when) => `Not published yet (${when})`,
    nextLabel: "Next public holidays",
    nextUnknown: "Next year's calendar has not been published yet.",
  },
};

/** "martes 8 de diciembre" / "dimarts 8 de desembre" / "Tuesday 8 December"; the year only when asked. */
export function weekdayDate(iso: string, locale: Locale, withYear = false): string {
  const base = `${WEEKDAY_NAMES[locale][weekdayIndex(iso)]} ${shortDate(iso, locale)}`;
  if (!withYear) return base;
  return locale === "en" ? `${base} ${iso.slice(0, 4)}` : `${base} de ${iso.slice(0, 4)}`;
}

/** True when Aran keeps a different day instead of this one (2026: 26 Dec; 2027: 29 Mar). */
function aranReplaces(iso: string): boolean {
  return aranSwap(Number(iso.slice(0, 4)))?.replaces === iso;
}

export function todayAnswer(locale: Locale, today: string): TodayAnswer {
  const copy = COPY[locale];
  const tomorrow = addDays(today, 1);
  const year = today.slice(0, 4);
  const when = (iso: string) => weekdayDate(iso, locale, iso.slice(0, 4) !== year);

  const todayHoliday = holidayOn(today);
  const tomorrowHoliday = holidayOn(tomorrow);
  const aranNote = (iso: string) => (aranReplaces(iso) ? copy.exceptAran : null);

  let answer = todayHoliday
    ? copy.yes(when(today), todayHoliday.name[locale])
    : isCovered(today)
      ? copy.no(when(today))
      : copy.unknown(when(today));
  if (todayHoliday && aranReplaces(today)) answer = answer.replace(/\)\.$/, `; ${copy.exceptAran}).`);

  const tomorrowValue = tomorrowHoliday
    ? copy.tomorrowYes(when(tomorrow), tomorrowHoliday.name[locale]) + (aranReplaces(tomorrow) ? ` (${copy.exceptAran})` : "")
    : isCovered(tomorrow)
      ? copy.tomorrowNo(when(tomorrow))
      : copy.tomorrowUnknown(when(tomorrow));

  const next = allHolidays()
    .filter((holiday) => holiday.date > today)
    .slice(0, 3)
    .map((holiday) => ({
      date: holiday.date,
      when: when(holiday.date),
      name: holiday.name[locale],
      href: isDatePage(holiday.date) ? datePath(locale, holiday.date) : null,
      aran: aranNote(holiday.date),
    }));

  return {
    today,
    tomorrow,
    isHoliday: todayHoliday !== null,
    answer,
    tomorrowValue,
    nextLabel: copy.nextLabel,
    next,
    nextUnknown: copy.nextUnknown,
  };
}
