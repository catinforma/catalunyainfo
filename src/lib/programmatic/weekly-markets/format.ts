import { capitalize, dayMonth, weekdayDayMonth, weekdayName } from "@/lib/programmatic/holidays/format";

import type { Hhmm, L, Market, MkLocale } from "./types";

/** Words of the family that are not facts: day lists, hours, "a" / "en" / "in". */

export const LOCALES: readonly MkLocale[] = ["ca", "es", "en"];

export function pick(locale: MkLocale, text: L): string {
  return text[locale];
}

/** "7", "9:30", or "7:00" in English. */
function clockWord(hhmm: Hhmm, locale: MkLocale): string {
  const [h, m] = hhmm.split(":");
  if (locale === "en") return `${Number(h)}:${m}`;
  return m === "00" ? String(Number(h)) : `${Number(h)}:${m}`;
}

export const MORNING_HOURS: L = { ca: "horari de matí", es: "horario de mañana", en: "morning hours" };

/** "7–14 h", "9–14 h"; the council's "horari de matí" when it publishes no hours. */
export function hoursText(hours: readonly [Hhmm, Hhmm] | null, locale: MkLocale): string {
  if (!hours) return MORNING_HOURS[locale];
  const [from, to] = hours;
  return locale === "en" ? `${clockWord(from, locale)}–${clockWord(to, locale)}` : `${clockWord(from, locale)}–${clockWord(to, locale)} h`;
}

/** Monday first: [2, 6] -> "dimarts i dissabte"; [1..6] -> "de dilluns a dissabte". */
export function daysText(days: readonly number[], locale: MkLocale): string {
  const order = [1, 2, 3, 4, 5, 6, 0].filter((d) => days.includes(d));
  const name = (d: number) => weekdayName(`2026-11-${String(22 + (d === 0 ? 0 : d)).padStart(2, "0")}`, locale);
  const and = { ca: "i", es: "y", en: "and" }[locale];
  const run = order.length >= 3 && order.every((d, i) => i === 0 || d === order[i - 1]! + 1);
  if (run) {
    const [a, b] = [order[0]!, order[order.length - 1]!];
    return { ca: `de ${name(a)} a ${name(b)}`, es: `de ${name(a)} a ${name(b)}`, en: `${capitalize(name(a))} to ${capitalize(name(b))}` }[locale];
  }
  const words = order.map((d) => (locale === "en" ? capitalize(name(d)) : name(d)));
  if (words.length <= 1) return words[0] ?? "";
  return `${words.slice(0, -1).join(", ")} ${and} ${words[words.length - 1]}`;
}

/** "a Vic" / "en Vic" / "in Vic"; Catalan "a" before a vowel is still "a". */
export function inTown(name: string, locale: MkLocale): string {
  return { ca: `a ${name}`, es: `en ${name}`, en: `in ${name}` }[locale];
}

export function datePhrase(iso: string, locale: MkLocale): string {
  return weekdayDayMonth(iso, locale);
}

export { capitalize, dayMonth, weekdayDayMonth, weekdayName };

/** The place of a market with the area's name when the place text does not carry it. */
export function marketPlace(market: Market, locale: MkLocale): string {
  return market.place[locale];
}

/** "25/11/2026" for the sources' read dates. */
export function numericDate(iso: string, locale: MkLocale): string {
  const [y, m, d] = iso.split("-");
  return locale === "en" ? dayMonth(iso, "en") + ` ${y}` : `${d}/${m}/${y}`;
}
