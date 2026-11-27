import { cataloniaDay2027 } from "@/lib/programmatic/holidays/dates-2027";
import { dayMonth, weekdayName, type DateLocale } from "@/lib/programmatic/holidays/format";

import { YEAR } from "./calendar";
import type { DaySection } from "./day-copy";
import type { SpainDay } from "./days";

/**
 * 27 Nov 2026 (batch 10E, striking distance): three questions the Spain-wide
 * day pages (/es/festivos/2027/dia/…, /ca/festius/2027/dia/…,
 * /en/holidays/2027/day/…) did not answer under a heading of their own.
 *
 * Search Console, 28 days to 26 Nov 2026: the 27 Spanish pages sit at
 * position 5.7-10.9 with almost no clicks ("15 agosto 2027" 680 impressions
 * at 6.6, "1 de mayo 2027" 775 at 8.4, "festivo reyes 2027" 352 at 8.9,
 * "19 marzo 2027 festivo" 262 at 6.1). The queries ask "¿se pasa al lunes?",
 * "¿se trabaja?", "viernes 19 de marzo 2027", "lunes 17 de mayo es festivo",
 * "que dia es el festivo de reyes 2027": whether it is a day off where the
 * reader is (most readers of this site are in Catalonia), what weekday it
 * falls on, and whether shops open.
 *
 * Nothing typed here is a fact: the Catalonia answer and the shops answer are
 * the 2027 Catalonia date pages' own (`cataloniaDay2027`, dates-2027.ts:
 * Ordre EMT/52/2026, the councils' 2027 local days until the DOGC order,
 * Llei 18/2017 art. 36.2.d and 37, Ordre EMT/89/2026); the weekday is the
 * calendar's. The shops answer is Catalonia's only: the site holds no other
 * community's opening calendar, so the heading says "en Cataluña".
 */

/**
 * The shops answer says each town's own two 2027 opening days "have not been
 * published yet" (Ordre EMT/89/2026, art. 5), as the shops guide's last
 * reading of the DOGC found (batch02/shops.ts); not re-read in this batch.
 * By this date, read the DOGC for the 2027 municipal list and, if it is out,
 * update `shopsParagraphs` (dates-2027.ts) before moving the date.
 */
export const SHOPS_MUNICIPAL_2027_REREAD_BY = "2026-12-21";

const capitalise =(text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "¿Es festivo el 19 de marzo de 2027 en Cataluña?" and "¿Abren las tiendas en Cataluña el 19 de marzo de 2027?". */
export function cataloniaSections(day: SpainDay, locale: DateLocale, the: string): DaySection[] {
  const c = cataloniaDay2027(day.date, locale);
  const question = { ca: `És festiu ${the} a Catalunya?`, es: `¿Es festivo ${the} en Cataluña?`, en: `Is ${the} a public holiday in Catalonia?` }[locale];
  const shops = { ca: `Obren les botigues a Catalunya ${the}?`, es: `¿Abren las tiendas en Cataluña ${the}?`, en: `Are shops open in Catalonia on ${the}?` }[locale];
  const [first = "", ...rest] = c.shops;
  return [
    { id: "cataluna", question, answer: c.answer, printed: c.answer },
    { id: "tiendas", question: shops, answer: c.shops.join("\n"), printed: first, more: rest },
  ];
}

/** "viernes 19 de marzo de 2027", "divendres 19 de març de 2027", "Friday 19 March 2027". */
function weekdayLong(iso: string, locale: DateLocale): string {
  const wd = weekdayName(iso, locale);
  return locale === "en" ? `${capitalise(wd)} ${dayMonth(iso, "en")} ${YEAR}` : `${wd} ${dayMonth(iso, locale)} de ${YEAR}`;
}

/** "¿Qué día de la semana es el 19 de marzo de 2027?" → "Cae en viernes: el viernes 19 de marzo de 2027." */
export function weekdaySection(day: SpainDay, locale: DateLocale, the: string): DaySection {
  const wd = weekdayName(day.date, locale);
  const long = weekdayLong(day.date, locale);
  const question = { ca: `Quin dia de la setmana és ${the}?`, es: `¿Qué día de la semana es ${the}?`, en: `What day of the week is ${the}?` }[locale];
  const answer = { ca: `Cau en ${wd}: el ${long}.`, es: `Cae en ${wd}: el ${long}.`, en: `It falls on a ${capitalise(wd)}: ${long}.` }[locale];
  return { id: "dia-semana", question, answer, printed: answer };
}

/**
 * The page's sections with these three in place: Catalonia and shops after
 * the long weekend, the weekday after "what is celebrated".
 */
export function withCataloniaSections(sections: DaySection[], day: SpainDay, locale: DateLocale, the: string): DaySection[] {
  const out: DaySection[] = [];
  for (const s of sections) {
    out.push(s);
    if (s.id === "puente") out.push(...cataloniaSections(day, locale, the));
    if (s.id === "que-se-celebra") out.push(weekdaySection(day, locale, the));
  }
  return out;
}
