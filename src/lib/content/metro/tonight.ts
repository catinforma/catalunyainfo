import { addDays, holidayOn, isAranOnly, longDate, weekdayIndex, WEEKDAY_NAMES } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";

/**
 * When the Barcelona metro runs on a given day, from TMB's published rules
 * (https://www.tmb.cat/en/barcelona-transport/operating-hours-metro-bus,
 * checked 12 Oct 2026; the same rules the metro-hours guide prints):
 *
 *  - it opens at 5:00, except after a Saturday night, when it never closed;
 *  - it runs all night on Saturdays and on 23 June, 23 September and 31 December;
 *  - it closes at 23:00 on 24 December;
 *  - it closes at 2:00 on Fridays and on the night before a public holiday;
 *  - otherwise it closes at midnight, a weekday holiday included.
 *
 * "Public holiday" here is the Catalonia-wide calendar plus Barcelona's own two
 * local days when the caller passes them; Aran-only days do not count. TMB can
 * change a night at short notice (it closed at midnight on Saturday 3 October
 * 2026 for the weather), so every rendering says so.
 */

export type Close = "midnight" | "two" | "allNight" | "eleven";

export interface MetroDay {
  date: string;
  /** False when the metro has been running since the night before. */
  opensAtFive: boolean;
  close: Close;
}

const ALL_NIGHT = new Set(["06-23", "09-23", "12-31"]);

function isHoliday(iso: string, localHolidays: readonly string[]): boolean {
  const holiday = holidayOn(iso);
  return (holiday !== null && !isAranOnly(iso)) || localHolidays.includes(iso);
}

function closeOn(iso: string, localHolidays: readonly string[]): Close {
  const monthDay = iso.slice(5, 10);
  if (ALL_NIGHT.has(monthDay)) return "allNight";
  if (monthDay === "12-24") return "eleven";
  const weekday = weekdayIndex(iso);
  if (weekday === 6) return "allNight";
  if (weekday === 5 || isHoliday(addDays(iso, 1), localHolidays)) return "two";
  return "midnight";
}

export function metroDay(iso: string, localHolidays: readonly string[] = []): MetroDay {
  return {
    date: iso,
    opensAtFive: closeOn(addDays(iso, -1), localHolidays) !== "allNight",
    close: closeOn(iso, localHolidays),
  };
}

const COPY: Record<
  Locale,
  { today: string; tomorrow: string; opens: string; continues: string; close: Record<Close, string>; caveat: string }
> = {
  ca: {
    today: "Avui, {date}",
    tomorrow: "Demà, {weekday}",
    opens: "el metro obre a les 5:00 i {close}",
    continues: "el metro funciona sense parar des de la nit anterior i {close}",
    close: {
      midnight: "tanca a mitjanit",
      two: "tanca a les 2:00 de la matinada",
      allNight: "no tanca en tota la nit",
      eleven: "tanca a les 23:00",
    },
    caveat: "TMB pot canviar l'horari d'una nit amb poc avís: si publica un altre horari, mana el de TMB.",
  },
  es: {
    today: "Hoy, {date}",
    tomorrow: "Mañana, {weekday}",
    opens: "el metro abre a las 5:00 y {close}",
    continues: "el metro funciona sin parar desde la noche anterior y {close}",
    close: {
      midnight: "cierra a medianoche",
      two: "cierra a las 2:00 de la madrugada",
      allNight: "no cierra en toda la noche",
      eleven: "cierra a las 23:00",
    },
    caveat: "TMB puede cambiar el horario de una noche con poco aviso: si publica otro horario, manda el de TMB.",
  },
  en: {
    today: "Today, {date}",
    tomorrow: "Tomorrow, {weekday}",
    opens: "the metro opens at 5:00 and {close}",
    continues: "the metro has been running since the night before and {close}",
    close: {
      midnight: "closes at midnight",
      two: "closes at 2:00 am",
      allNight: "runs all night",
      eleven: "closes at 23:00",
    },
    caveat: "TMB can change a night's hours at short notice; if it announces different hours, TMB's are the ones that count.",
  },
};

function sentence(day: MetroDay, locale: Locale): string {
  const t = COPY[locale];
  return (day.opensAtFive ? t.opens : t.continues).replace("{close}", t.close[day.close]);
}

/** The two lines the guide prints: today's hours, then tomorrow's, then the caveat. */
export function metroLines(today: string, locale: Locale, localHolidays: readonly string[] = []) {
  const t = COPY[locale];
  const tomorrow = addDays(today, 1);
  return {
    today: `${t.today.replace("{date}", longDate(today, locale))}, ${sentence(metroDay(today, localHolidays), locale)}.`,
    tomorrow: `${t.tomorrow.replace("{weekday}", WEEKDAY_NAMES[locale][weekdayIndex(tomorrow)] ?? "")}, ${sentence(metroDay(tomorrow, localHolidays), locale)}.`,
    caveat: t.caveat,
  };
}
