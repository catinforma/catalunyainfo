import { weekdayDayMonth } from "@/lib/programmatic/holidays/format";

import { wholeDay, type Clock, type DayStatus } from "./logic";
import type { Schedule, ZbeLocale } from "./types";

/**
 * The words for a schedule and for "does it apply today?". Kept apart from
 * copy.ts because the browser loads this file (ZbeNow.tsx) and should not
 * carry the rest of the family's text.
 */

const pick = (locale: ZbeLocale, es: string, ca: string, en: string): string => (locale === "es" ? es : locale === "ca" ? ca : en);

/** "07:00" as the edition writes an hour: "7" (es, ca), "7:00" (en); "7.30" and "7:30" with minutes. */
function hour(time: string, locale: ZbeLocale): string {
  const [h, m] = time.split(":");
  if (locale === "en") return `${Number(h)}:${m}`;
  return m === "00" ? String(Number(h)) : `${Number(h)}.${m}`;
}

/** "de 7 a 19 h" / "7:00 to 19:00"; the whole day in words. */
export function hoursText(schedule: Schedule, locale: ZbeLocale): string {
  if (wholeDay(schedule)) return pick(locale, "las 24 horas", "les 24 hores", "24 hours a day");
  const from = hour(schedule.from, locale);
  const to = hour(schedule.to, locale);
  return pick(locale, `de ${from} a ${to} h`, `de ${from} a ${to} h`, `${from} to ${to}`);
}

export function daysText(schedule: Schedule, locale: ZbeLocale): string {
  if (schedule.days === "every-day") return pick(locale, "todos los días, festivos incluidos", "cada dia, festius inclosos", "every day, public holidays included");
  return pick(locale, "de lunes a viernes laborables", "de dilluns a divendres feiners", "Monday to Friday except public holidays");
}

/** "de lunes a viernes laborables, de 7 a 19 h". */
export function scheduleText(schedule: Schedule, locale: ZbeLocale): string {
  return `${daysText(schedule, locale)}, ${hoursText(schedule, locale)}`;
}

/** When it does not apply, as a sentence; empty for a zone restricted every hour of every day. */
export function offText(schedule: Schedule, locale: ZbeLocale): string {
  const weekdays = schedule.days === "working-weekdays";
  const day = wholeDay(schedule);
  if (weekdays && day) return pick(locale, "Sábados, domingos y festivos no se aplica.", "Dissabtes, diumenges i festius no s'aplica.", "It does not apply on Saturdays, Sundays or public holidays.");
  if (weekdays) {
    return pick(
      locale,
      "Fuera de esas horas, y los sábados, domingos y festivos, no se aplica.",
      "Fora d'aquestes hores, i els dissabtes, diumenges i festius, no s'aplica.",
      "Outside those hours, and on Saturdays, Sundays and public holidays, it does not apply.",
    );
  }
  return day ? "" : pick(locale, "Fuera de esas horas no se aplica.", "Fora d'aquestes hores no s'aplica.", "Outside those hours it does not apply.");
}

/**
 * The live answer, from the browser's reading of the Madrid clock: one
 * sentence on the day and one on the hour. It speaks of "the restriction":
 * the table above it says which vehicles that is.
 */
export function nowText(status: DayStatus, schedule: Schedule, clock: Clock, locale: ZbeLocale): { day: string; hour: string } {
  const date = weekdayDayMonth(clock.iso, locale);
  const hours = hoursText(schedule, locale);
  if (!status.applies) {
    const why =
      status.reason === "weekend"
        ? pick(locale, "es fin de semana", "és cap de setmana", "it is the weekend")
        : pick(locale, "es festivo", "és festiu", "it is a public holiday");
    return {
      day: pick(locale, `Hoy, ${date}, la restricción no se aplica: ${why}.`, `Avui, ${date}, la restricció no s'aplica: ${why}.`, `Today, ${date}, the restriction does not apply: ${why}.`),
      hour: "",
    };
  }
  const day = pick(locale, `Hoy, ${date}, la restricción se aplica ${hours}.`, `Avui, ${date}, la restricció s'aplica ${hours}.`, `Today, ${date}, the restriction applies ${hours}.`);
  if (status.phase === "before") return { day, hour: pick(locale, "Ahora todavía no ha empezado.", "Ara encara no ha començat.", "Right now it has not started yet.") };
  if (status.phase === "active") return { day, hour: pick(locale, "Ahora mismo está en vigor.", "Ara mateix és vigent.", "Right now it is in force.") };
  return { day, hour: pick(locale, "Por hoy ya ha terminado.", "Per avui ja s'ha acabat.", "It has already ended for today.") };
}
