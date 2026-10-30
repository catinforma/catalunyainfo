/**
 * Dates as the Christmas fair pages write them. Pure and free of data imports,
 * so the browser component can use it too. Catalan elides "de" before a vowel
 * ("d'octubre"); none of the season's months starts with one, but the rule is
 * kept so the helpers are right all year.
 */

import type { FairsLocale } from "./paths";

const WEEKDAYS: Record<FairsLocale, readonly string[]> = {
  ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

const MONTHS: Record<FairsLocale, readonly string[]> = {
  ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const SHORT_MONTHS: Record<FairsLocale, readonly string[]> = {
  ca: ["gen.", "febr.", "març", "abr.", "maig", "juny", "jul.", "ag.", "set.", "oct.", "nov.", "des."],
  es: ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

const parts = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return { day: d.getUTCDate(), month: d.getUTCMonth(), year: d.getUTCFullYear(), weekday: d.getUTCDay() };
};

export function weekday(iso: string, locale: FairsLocale): string {
  return WEEKDAYS[locale][parts(iso).weekday]!;
}

/** "de desembre" / "d'octubre" / "de diciembre"; "" in English (the month follows the day). */
function ofMonth(month: number, locale: FairsLocale): string {
  const name = MONTHS[locale][month]!;
  if (locale === "en") return name;
  if (locale === "ca" && /^[aeiouàèéíòóú]/i.test(name)) return `d'${name}`;
  return `de ${name}`;
}

/** "5 de desembre", "5 de diciembre", "5 December". */
export function dayMonth(iso: string, locale: FairsLocale): string {
  const p = parts(iso);
  return `${p.day} ${ofMonth(p.month, locale)}`;
}

/** Catalan elides the article before 1 and 11 ("l'1 de gener", "l'11 de desembre"). */
const caElides = (iso: string) => [1, 11].includes(parts(iso).day);

/** "el 5 de desembre" / "l'1 de gener"; "el 5 de diciembre"; "5 December". */
export function onDate(iso: string, locale: FairsLocale): string {
  if (locale === "en") return dayMonth(iso, locale);
  if (locale === "ca" && caElides(iso)) return `l'${dayMonth(iso, locale)}`;
  return `el ${dayMonth(iso, locale)}`;
}

/** After "fins" / "hasta" / "until": "al 5 de desembre" / "a l'1 de gener"; "el 5 de diciembre"; "5 December". */
export function untilDate(iso: string, locale: FairsLocale): string {
  if (locale === "ca") return caElides(iso) ? `a l'${dayMonth(iso, locale)}` : `al ${dayMonth(iso, locale)}`;
  return onDate(iso, locale);
}

/** "5 de desembre de 2026", "5 December 2026". */
export function fullDate(iso: string, locale: FairsLocale): string {
  const p = parts(iso);
  return locale === "en" ? `${dayMonth(iso, locale)} ${p.year}` : `${dayMonth(iso, locale)} de ${p.year}`;
}

/** "5 des.", "5 dic.", "5 Dec": tables and lists. */
export function shortDay(iso: string, locale: FairsLocale): string {
  const p = parts(iso);
  return `${p.day} ${SHORT_MONTHS[locale][p.month]}`;
}

/** "5 – 7 des.", "28 nov. – 8 des.", "5 des.". */
export function shortRange(start: string, end: string, locale: FairsLocale): string {
  if (start === end) return shortDay(start, locale);
  const a = parts(start);
  const b = parts(end);
  if (a.month === b.month && a.year === b.year) return `${a.day}–${shortDay(end, locale)}`;
  return `${shortDay(start, locale)} – ${shortDay(end, locale)}`;
}

/**
 * A fair's days in words.
 *   ca  "dissabte 5 de desembre de 2026"
 *       "dissabte 5 i diumenge 6 de desembre de 2026" (two days in a row)
 *       "del dissabte 5 al dilluns 7 de desembre de 2026"
 *       "del dissabte 28 de novembre al dimarts 8 de desembre de 2026"
 *       "del dissabte 5 de desembre de 2026 al dilluns 4 de gener de 2027"
 *   es  "sábado 5 de diciembre de 2026", "del sábado 5 al lunes 7 de diciembre de 2026"
 *   en  "Saturday 5 December 2026", "Saturday 5 to Monday 7 December 2026"
 * Without weekdays (`weekdays: false`) for descriptions: "del 5 al 7 de desembre de 2026".
 */
export function rangeText(start: string, end: string, locale: FairsLocale, options: { weekdays?: boolean; year?: boolean } = {}): string {
  const withWeekday = options.weekdays ?? true;
  const withYear = options.year ?? true;
  const a = parts(start);
  const b = parts(end);
  const wd = (iso: string) => (withWeekday ? `${weekday(iso, locale)} ` : "");
  const yearOf = (y: number) => (withYear ? (locale === "en" ? ` ${y}` : ` de ${y}`) : "");
  if (start === end) return `${wd(start)}${dayMonth(start, locale)}${yearOf(a.year)}`;
  const sameYear = a.year === b.year;
  const sameMonth = sameYear && a.month === b.month;
  // Two days in a row read as a pair: "dissabte 5 i diumenge 6 de desembre", "5 y 6 de diciembre".
  if (Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`) === 86_400_000) {
    const first = sameMonth ? `${wd(start)}${a.day}` : `${wd(start)}${dayMonth(start, locale)}${sameYear ? "" : yearOf(a.year)}`;
    const and = locale === "ca" ? "i" : locale === "es" ? "y" : "and";
    return `${first} ${and} ${wd(end)}${dayMonth(end, locale)}${yearOf(b.year)}`;
  }
  if (locale === "en") {
    const left = sameMonth ? `${wd(start)}${a.day}` : `${wd(start)}${dayMonth(start, locale)}${sameYear ? "" : yearOf(a.year)}`;
    return `${left} to ${wd(end)}${dayMonth(end, locale)}${yearOf(b.year)}`;
  }
  const left = sameMonth ? `${wd(start)}${a.day}` : `${wd(start)}${dayMonth(start, locale)}${sameYear ? "" : yearOf(a.year)}`;
  const right = `${wd(end)}${dayMonth(end, locale)}${yearOf(b.year)}`;
  // Catalan: "de l'1 al 3", "del 5 a l'11"; a weekday in front keeps "del" / "al".
  const from = locale === "ca" && !withWeekday && caElides(start) ? `de l'${left}` : `del ${left}`;
  const to = locale === "ca" && !withWeekday && caElides(end) ? `a l'${right}` : `al ${right}`;
  return `${from} ${to}`;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
