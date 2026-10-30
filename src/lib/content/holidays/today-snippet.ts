import type { Locale } from "@/lib/i18n/config";

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

export function liveTodayTitle(locale: Locale, today: string): string | null {
  const next = nextHolidayFrom(today);
  if (!next) return null;
  const d = dayMonth(next.date, locale);
  if (locale === "ca") return fit([`Avui és festiu a Catalunya? Pròxim festiu: ${d}`, `Avui és festiu a Catalunya? Pròxim: ${d}`], TODAY_TITLE_MAX);
  if (locale === "es") return fit([`¿Hoy es festivo en Cataluña? Próximo festivo: ${d}`, `¿Hoy es festivo en Cataluña? Próximo: ${d}`], TODAY_TITLE_MAX);
  const short = `${Number(next.date.slice(8, 10))} ${EN_SHORT[Number(next.date.slice(5, 7)) - 1]}`;
  return fit([`Is today a holiday in Barcelona and Catalonia? Next: ${short}`, `Is today a holiday in Catalonia? Next: ${short}`], TODAY_TITLE_MAX);
}

export function liveTodayDescription(locale: Locale, today: string): string | null {
  const next = nextHolidayFrom(today);
  if (!next) return null;
  const d = weekdayDay(next.date, locale);
  const name = next.name[locale];
  if (locale === "ca") {
    return fit(
      [
        `Pròxim festiu a tot Catalunya: ${d} (${name}). Si avui i demà són festius i on és festa local avui, municipi a municipi, amb dades de la Generalitat.`,
        `Pròxim festiu a tot Catalunya: ${d} (${name}). Si avui i demà són festius i on és festa local avui, municipi a municipi.`,
        `Pròxim festiu a tot Catalunya: ${d}. Si avui i demà són festius i on és festa local avui.`,
      ],
      TODAY_DESCRIPTION_MAX,
    );
  }
  if (locale === "es") {
    return fit(
      [
        `Próximo festivo en toda Cataluña: ${d} (${name}). Si hoy y mañana son festivos y dónde es fiesta local hoy, municipio a municipio, con datos oficiales.`,
        `Próximo festivo en toda Cataluña: ${d} (${name}). Si hoy y mañana son festivos y dónde es fiesta local hoy, municipio a municipio.`,
        `Próximo festivo en toda Cataluña: ${d}. Si hoy y mañana son festivos y dónde es fiesta local hoy.`,
      ],
      TODAY_DESCRIPTION_MAX,
    );
  }
  return fit(
    [
      `Next public holiday across Catalonia: ${d} (${name}). Whether today and tomorrow are holidays in Barcelona, and which towns have a local holiday today.`,
      `Next public holiday across Catalonia: ${d} (${name}). Whether today and tomorrow are holidays, and where it is a local holiday today.`,
      `Next public holiday across Catalonia: ${d}. Whether today and tomorrow are holidays, and where it is a local holiday today.`,
    ],
    TODAY_DESCRIPTION_MAX,
  );
}
