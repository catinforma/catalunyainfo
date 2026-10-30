/**
 * Date words for the holiday pages, small enough to ship to the browser.
 *
 * Same output as `longDate` / `shortDate` in `lib/content/holidays/calendar.ts`
 * (a test holds the two together); kept separate so the client component does
 * not pull the whole calendar module into the bundle. Catalan elides the
 * preposition before a vowel ("14 d'agost") and the article before 1 and 11
 * ("l'1 de gener", "l'11 de setembre"), which no `Intl` locale data does.
 */

export type DateLocale = "ca" | "es" | "en";

export const WEEKDAYS: Record<DateLocale, string[]> = {
  ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

export const MONTHS: Record<DateLocale, string[]> = {
  ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

function parts(iso: string): { year: number; month: number; day: number; weekday: number } {
  const date = new Date(`${iso}T12:00:00Z`);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate(), weekday: date.getUTCDay() };
}

export function weekdayName(iso: string, locale: DateLocale): string {
  return WEEKDAYS[locale][parts(iso).weekday] ?? "";
}

/** "8 de desembre", "14 d'agost", "8 de diciembre", "8 December". */
export function dayMonth(iso: string, locale: DateLocale): string {
  const { month, day } = parts(iso);
  const name = MONTHS[locale][month] ?? "";
  if (locale === "en") return `${day} ${name}`;
  if (locale === "ca" && /^[aeiouàèéíòóú]/i.test(name)) return `${day} d'${name}`;
  return `${day} de ${name}`;
}

/**
 * Two dates, the month said once when they share it: "11 i 17 de maig",
 * "17 de maig i 24 de setembre", "11 y 17 de mayo", "11 and 17 May".
 */
export function dayPair(a: string, b: string, locale: DateLocale): string {
  const and = locale === "ca" ? "i" : locale === "es" ? "y" : "and";
  const first = a.slice(0, 7) === b.slice(0, 7) ? String(parts(a).day) : dayMonth(a, locale);
  return `${first} ${and} ${dayMonth(b, locale)}`;
}

/** "dimarts 8 de desembre", "martes 8 de diciembre", "Tuesday 8 December". */
export function weekdayDayMonth(iso: string, locale: DateLocale): string {
  return `${weekdayName(iso, locale)} ${dayMonth(iso, locale)}`;
}

/** "dimarts, 8 de desembre de 2026" / "martes, 8 de diciembre de 2026" / "Tuesday 8 December 2026". */
export function longDate(iso: string, locale: DateLocale): string {
  const { year } = parts(iso);
  if (locale === "en") return `${weekdayDayMonth(iso, locale)} ${year}`;
  return `${weekdayName(iso, locale)}, ${dayMonth(iso, locale)} de ${year}`;
}

/** "8 de desembre de 2026", "1 de gener de 2027", "8 December 2026". */
export function dayMonthYear(iso: string, locale: DateLocale): string {
  const { year } = parts(iso);
  return locale === "en" ? `${dayMonth(iso, locale)} ${year}` : `${dayMonth(iso, locale)} de ${year}`;
}

/** Catalan article before a day number: "l'1", "l'11", "el 8". */
export function caDayArticle(iso: string): string {
  const { day } = parts(iso);
  return day === 1 || day === 11 ? "l'" : "el ";
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) / 86_400_000);
}
