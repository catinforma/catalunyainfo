import type { Locale } from "@/lib/i18n/config";
import { aranSwap } from "@/lib/programmatic/holidays/data";

import { holidayOn, longDate, nextHolidayAfter, type Holiday } from "./calendar";

/**
 * Title and search description of "is today a holiday", computed at render.
 *
 * Search Console, 30 Oct 2026: "hoy es festivo en cataluña" at 7-9 with no
 * clicks. The stored title promised "hoy, mañana y en tu municipio" but not
 * an answer. This one names the next Catalonia-wide holiday, counting today:
 * a snippet Google crawled on any day before that holiday is still right on
 * the holiday itself, and it never says "today is not a holiday" (a claim a
 * stale snippet could get wrong). The page is rebuilt every night by the cron
 * (`holidayToday` is in DAY_DEPENDENT_BLOCKS).
 */

export const TODAY_TITLE_MAX = 60;
export const TODAY_DESCRIPTION_MAX = 155;

/** The Catalonia-wide holiday today, or the next one; null past the published calendars. */
export function nextHolidayFrom(today: string): Holiday | null {
  return holidayOn(today) ?? nextHolidayAfter(today);
}

function fit(candidates: string[], max: number): string {
  return candidates.find((c) => c.length <= max) ?? candidates.at(-1)!;
}

/** "8 de desembre" / "8 de diciembre" / "8 December". */
function dayMonth(iso: string, locale: Locale): string {
  return longDate(iso, locale).replace(/^\S+,? /, "").replace(/ (de )?\d{4}$/, "");
}

/** "dimarts 8 de desembre" / "martes 8 de diciembre" / "Tuesday 8 December". */
function weekdayDay(iso: string, locale: Locale): string {
  return longDate(iso, locale).replace(", ", " ").replace(/ (de )?\d{4}$/, "");
}

const EN_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * The (up to) two Catalonia-wide holidays after `holiday`, compactly: "25 y 26
 * de diciembre", "26 de diciembre y 1 de enero", "25 de diciembre". Null when
 * none is published. Dates only, no weekday: the description has room for one.
 */
function following(holiday: Holiday, locale: Locale): string | null {
  const after: Holiday[] = [];
  for (let h = nextHolidayAfter(holiday.date); h && after.length < 2; h = nextHolidayAfter(h.date)) after.push(h);
  const [first, second] = after;
  if (!first) return null;
  if (!second) return dayMonth(first.date, locale);
  const and = locale === "ca" ? "i" : locale === "es" ? "y" : "and";
  const b = dayMonth(second.date, locale);
  // Same month: "25 y 26 de diciembre" / "25 i 26 de desembre" / "25 and 26 December".
  if (first.date.slice(0, 7) === second.date.slice(0, 7)) return `${Number(first.date.slice(8, 10))} ${and} ${b}`;
  return `${dayMonth(first.date, locale)} ${and} ${b}`;
}

export function liveTodayTitle(locale: Locale, today: string): string | null {
  const next = nextHolidayFrom(today);
  if (!next) return null;
  const d = dayMonth(next.date, locale);
  if (locale === "ca") return fit([`Avui és festiu a Catalunya? Pròxim festiu: ${d}`, `Avui és festiu a Catalunya? Pròxim: ${d}`], TODAY_TITLE_MAX);
  // 3 Nov 2026: the searchers' own word order ("es festivo hoy en cataluña"), as in the H1.
  if (locale === "es") return fit([`¿Es festivo hoy en Cataluña? Próximo festivo: ${d}`, `¿Es festivo hoy en Cataluña? Próximo: ${d}`], TODAY_TITLE_MAX);
  const short = `${Number(next.date.slice(8, 10))} ${EN_SHORT[Number(next.date.slice(5, 7)) - 1]}`;
  return fit([`Is today a holiday in Barcelona and Catalonia? Next: ${short}`, `Is today a holiday in Catalonia? Next: ${short}`], TODAY_TITLE_MAX);
}

/**
 * The next holiday first (as since 30 Oct), then, since 3 Nov, the two after
 * it, so the snippet names the next three like the page's first screen. Still
 * no claim about today: every date it names is a holiday whenever it is read.
 */
export function liveTodayDescription(locale: Locale, today: string): string | null {
  const next = nextHolidayFrom(today);
  if (!next) return null;
  const d = weekdayDay(next.date, locale);
  const name = next.name[locale];
  const then = following(next, locale);
  // Not "toda Cataluña" on a day Aran swaps for the Festa d'Aran (26 Dec 2026, 29 Mar 2027).
  const aran = aranSwap(Number(next.date.slice(0, 4)))?.replaces === next.date;

  if (locale === "ca") {
    const lead = `Pròxim festiu ${aran ? "a Catalunya" : "a tot Catalunya"}: ${d}`;
    return fit(
      [
        ...(then
          ? [
              `${lead} (${name}). Després, ${then}. Si avui o demà és festiu i on és festa local avui.`,
              `${lead} (${name}). Després, ${then}. Si avui o demà és festiu i on és festa local.`,
              `${lead} (${name}). Després, ${then}. Si avui o demà és festiu.`,
            ]
          : []),
        `${lead} (${name}). Si avui i demà són festius i on és festa local avui, municipi a municipi, amb dades de la Generalitat.`,
        `${lead} (${name}). Si avui i demà són festius i on és festa local avui, municipi a municipi.`,
        `${lead}. Si avui i demà són festius i on és festa local avui.`,
      ],
      TODAY_DESCRIPTION_MAX,
    );
  }
  if (locale === "es") {
    const lead = `Próximo festivo ${aran ? "en Cataluña" : "en toda Cataluña"}: ${d}`;
    return fit(
      [
        ...(then
          ? [
              `${lead} (${name}). Después, ${then}. Si hoy o mañana es festivo y dónde es fiesta local hoy.`,
              `${lead} (${name}). Después, ${then}. Si hoy o mañana es festivo y dónde es fiesta local.`,
              `${lead} (${name}). Después, ${then}. Si hoy o mañana es festivo.`,
            ]
          : []),
        `${lead} (${name}). Si hoy y mañana son festivos y dónde es fiesta local hoy, municipio a municipio, con datos oficiales.`,
        `${lead} (${name}). Si hoy y mañana son festivos y dónde es fiesta local hoy, municipio a municipio.`,
        `${lead}. Si hoy y mañana son festivos y dónde es fiesta local hoy.`,
      ],
      TODAY_DESCRIPTION_MAX,
    );
  }
  const lead = `Next public holiday ${aran ? "in Catalonia" : "across Catalonia"}: ${d}`;
  return fit(
    [
      ...(then
        ? [
            `${lead} (${name}). Then ${then}. Whether today or tomorrow is a holiday, and local holidays today.`,
            `${lead} (${name}). Then ${then}. Whether today or tomorrow is a holiday.`,
          ]
        : []),
      `${lead} (${name}). Whether today and tomorrow are holidays in Barcelona, and which towns have a local holiday today.`,
      `${lead} (${name}). Whether today and tomorrow are holidays, and where it is a local holiday today.`,
      `${lead}. Whether today and tomorrow are holidays, and where it is a local holiday today.`,
    ],
    TODAY_DESCRIPTION_MAX,
  );
}
