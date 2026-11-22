import type { L, Range, ZaLocale } from "./types";

/**
 * How the family writes hours, prices and durations in the three languages.
 * Pure and tiny: the client component imports it too.
 */

export const AND: L = { es: "y", ca: "i", en: "and" };
export const FREE: L = { es: "Gratis", ca: "Gratuït", en: "Free" };

/** "9:00" (es, en) or "9.00" (ca), from "09:00". */
export function time(t: string, locale: ZaLocale): string {
  const hour = Number(t.slice(0, 2));
  const minutes = t.slice(3, 5);
  return locale === "ca" ? `${hour}.${minutes}` : `${hour}:${minutes}`;
}

/** "las 9:00", "la 1:00", "les 9.00", "9:00": a time after "hasta" / "fins a" / "until". */
export function theTime(t: string, locale: ZaLocale): string {
  const one = Number(t.slice(0, 2)) === 1;
  if (locale === "es") return `${one ? "la" : "las"} ${time(t, locale)}`;
  if (locale === "ca") return `${one ? "la" : "les"} ${time(t, locale)}`;
  return time(t, locale);
}

/** In a sentence: "de 9:00 a 14:00 y de 16:00 a 20:00", "9:00 to 14:00 and 16:00 to 20:00". */
export function hoursText(ranges: readonly Range[], locale: ZaLocale): string {
  const one = (r: Range) => (locale === "en" ? `${time(r[0], locale)} to ${time(r[1], locale)}` : `de ${time(r[0], locale)} a ${time(r[1], locale)}`);
  return ranges.map(one).join(` ${AND[locale]} `);
}

/** In a table cell: "9:00–14:00 y 16:00–20:00", or "Gratis" for a day without paid hours. */
export function hoursCell(ranges: readonly Range[], locale: ZaLocale): string {
  if (ranges.length === 0) return FREE[locale];
  return ranges.map((r) => `${time(r[0], locale)}–${time(r[1], locale)}`).join(` ${AND[locale]} `);
}

export function sameRanges(a: readonly Range[], b: readonly Range[]): boolean {
  return a.length === b.length && a.every((r, i) => r[0] === b[i]![0] && r[1] === b[i]![1]);
}

/** "1,10 €" (es, ca) or "€1.10" (en). */
export function eur(amount: number, locale: ZaLocale): string {
  const fixed = amount.toFixed(2);
  return locale === "en" ? `€${fixed}` : `${fixed.replace(".", ",")} €`;
}

/** "4 horas", "45 minutos", "1 hora y 30 minutos". */
export function duration(minutes: number, locale: ZaLocale): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hours = { es: h === 1 ? "1 hora" : `${h} horas`, ca: h === 1 ? "1 hora" : `${h} hores`, en: h === 1 ? "1 hour" : `${h} hours` }[locale];
  const mins = { es: `${m} minutos`, ca: `${m} minuts`, en: `${m} minutes` }[locale];
  if (h === 0) return mins;
  if (m === 0) return hours;
  return locale === "en" ? `${hours} ${mins}` : `${hours} ${AND[locale]} ${mins}`;
}

/** For a table cell: "4 h", "45 min", "1 h 30 min". */
export function shortDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** "a, b y c" / "a, b i c" / "a, b and c". */
export function listText(items: readonly string[], locale: ZaLocale): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} ${AND[locale]} ${items[items.length - 1]}`;
}

/** Catalan "de" before a place name: "de Madrid", "d'Alacant". */
export function caDe(name: string): string {
  return /^[aeiouàèéíòóúh]/i.test(name) ? `d'${name}` : `de ${name}`;
}

/** "Lunes a viernes" to "lunes a viernes", for a label that follows a colon. */
export function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
