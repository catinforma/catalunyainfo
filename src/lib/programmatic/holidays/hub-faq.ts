import { NEXT, YEAR, municipalityBySlug, regionalDays, type RegionalDay } from "./data";
import { weekdayDayMonth, weekdayName, type DateLocale } from "./format";
import { joinList } from "./names";
import { town2027Days } from "./town-2027";

/**
 * 27 Nov 2026: questions on the three holiday hubs (`/en/holidays/`,
 * `/ca/festius/`, `/es/festivos/`), in the words people search with
 * ("barcelona public holidays 2027", "is 6 december a holiday in catalonia",
 * "is boxing day a holiday in barcelona", "is easter monday a holiday in
 * spain"). GSC 28 d to 26 Nov, EN hub: 1,126 impressions, 11 clicks, position
 * 8.6, with "bank holidays barcelona 2027" 42 at 9.2 and "public holidays
 * barcelona 2027" 26 at 10.3; the hub answered them only in its tables and a
 * long paragraph near the end.
 *
 * Every answer is built from the data the hub already prints: the two
 * Catalonia-wide orders (`regionalDays`) and Barcelona's 2027 days in the same
 * three states as its town page (`town2027Days`: the DOGC order once loaded,
 * else the City Council's decree, else pending). No clock and no typed date:
 * the same data gives the same text, and the answers switch by themselves when
 * the 2027 local order is loaded.
 */

export interface HubFaqItem {
  question: string;
  answer: string;
}

const BARCELONA = "barcelona";
/** The council decree's names (council-2027.ts), as each edition says them. */
const LOCAL_NAMES: Record<string, Record<DateLocale, string>> = {
  "Dilluns de Pasqua Granada": { ca: "dilluns de Pasqua Granada", es: "lunes de Pascua Granada", en: "Whit Monday" },
  "Mare de Déu de la Mercè": { ca: "la Mercè", es: "la Mercè", en: "La Mercè" },
};

function on(days: RegionalDay[], monthDay: string): RegionalDay | undefined {
  return days.find((d) => d.date.slice(5) === monthDay);
}

/** "New Year's Day, Friday 1 January; Epiphany, Wednesday 6 January; … and Christmas Day, Saturday 25 December". */
function listDays(days: RegionalDay[], locale: DateLocale): string {
  const items = days.map((d) => `${d.name[locale]}, ${weekdayDayMonth(d.date, locale)}`);
  const and = locale === "ca" ? "i" : locale === "es" ? "y" : "and";
  return items.length > 1 ? `${items.slice(0, -1).join("; ")}; ${and} ${items.at(-1)}` : (items[0] ?? "");
}

function barcelonaLine(locale: DateLocale): { days: string; count: number; state: "dogc" | "council" | "pending" } {
  const m = municipalityBySlug(BARCELONA);
  const t = town2027Days(m ?? { slug: BARCELONA });
  if (t.state === "pending" || t.local.length === 0) return { days: "", count: 0, state: "pending" };
  const names = t.council?.names ?? [null, null];
  const parts = t.local.map((iso, i) => {
    const name = names[i] ? LOCAL_NAMES[names[i]!]?.[locale] : undefined;
    // es/ca: every date carries its article ("el lunes 25 de mayo … y el jueves 24 de septiembre").
    const day = locale === "en" ? weekdayDayMonth(iso, locale) : `el ${weekdayDayMonth(iso, locale)}`;
    return name ? `${day} (${name})` : day;
  });
  return { days: joinList(parts, locale), count: parts.length, state: t.state };
}

/** Whether `monthDay` (MM-DD) is a Catalonia-wide holiday in `year`, as one clause. */
function yearClause(year: number, monthDay: string, locale: DateLocale): string {
  const iso = `${year}-${monthDay}`;
  const hit = on(regionalDays(year), monthDay);
  const weekday = weekdayName(iso, locale);
  if (locale === "en") return hit ? `in ${year}, yes: ${weekdayDayMonth(iso, locale)}, ${hit.name.en}` : `in ${year}, no: it falls on a ${weekday} and is not on Catalonia's list`;
  if (locale === "es") return hit ? `en ${year}, sí: el ${weekdayDayMonth(iso, locale)}, ${hit.name.es}` : `en ${year}, no: cae en ${weekday} y no está en la lista de Cataluña`;
  return hit ? `el ${year}, sí: el ${weekdayDayMonth(iso, locale)}, ${hit.name.ca}` : `el ${year}, no: cau en ${weekday} i no és a la llista de Catalunya`;
}

function capital(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function hubFaq(locale: DateLocale): HubFaqItem[] {
  const now = regionalDays(YEAR);
  const next = regionalDays(NEXT);
  const bcn = barcelonaLine(locale);
  const easter = [now, next].map((days) => days.find((d) => /Easter Monday/.test(d.name.en))).filter((d): d is RegionalDay => Boolean(d));
  const goodFriday = [now, next].every((days) => days.some((d) => /Good Friday/.test(d.name.en)));
  const both = (monthDay: string) => `${capital(yearClause(YEAR, monthDay, locale))}; ${yearClause(NEXT, monthDay, locale)}.`;

  if (locale === "en") {
    const bcnAnswer =
      bcn.state === "pending"
        ? `Catalonia's ${next.length} public holidays: ${listDays(next, "en")}. Barcelona's local holidays for ${NEXT} have not been published yet.`
        : `Barcelona has ${next.length + bcn.count} public holidays in ${NEXT}. Its own local holidays are ${bcn.days}${bcn.state === "council" ? ", as approved by the City Council (the Generalitat's order with every town's local days is still to come)" : ""}. On top of them come Catalonia's ${next.length}: ${listDays(next, "en")}.`;
    return [
      { question: `What are the public holidays in Barcelona in ${NEXT}?`, answer: bcnAnswer },
      { question: "Is 6 December a public holiday in Catalonia?", answer: both("12-06") },
      { question: "Is Boxing Day (26 December) a public holiday in Barcelona?", answer: `In Catalonia 26 December is Saint Stephen's Day (Sant Esteve). ${both("12-26")}` },
      {
        question: "Is Easter Monday a public holiday in Catalonia?",
        answer: `Yes: Easter Monday is one of Catalonia's public holidays, ${joinList(easter.map((d) => `${weekdayDayMonth(d.date, "en")} ${d.date.slice(0, 4)}`), "en")}${goodFriday ? ", and Good Friday is too" : ""}.`,
      },
      {
        question: "How many public holidays are there in Catalonia?",
        answer: `${now.length} a year that apply across Catalonia (bank holidays), set by the Generalitat, plus the local holidays of each town, usually two, set by its council. A local holiday applies only in that town.`,
      },
    ];
  }

  if (locale === "es") {
    const bcnAnswer =
      bcn.state === "pending"
        ? `Los ${next.length} festivos de Cataluña: ${listDays(next, "es")}. Los festivos locales de Barcelona de ${NEXT} aún no se han publicado.`
        : `Barcelona tiene ${next.length + bcn.count} festivos en ${NEXT}. Los festivos locales de Barcelona son ${bcn.days}${bcn.state === "council" ? ", aprobados por el Ayuntamiento (falta la orden de la Generalitat con los festivos locales de todos los municipios)" : ""}. Se suman a los ${next.length} de Cataluña: ${listDays(next, "es")}.`;
    return [
      { question: `¿Cuáles son los festivos de Barcelona en ${NEXT}?`, answer: bcnAnswer },
      { question: "¿El 6 de diciembre es festivo en Cataluña?", answer: both("12-06") },
      { question: "¿El 26 de diciembre, San Esteban, es festivo en Cataluña?", answer: both("12-26") },
      {
        question: "¿El lunes de Pascua es festivo en Cataluña?",
        answer: `Sí: el lunes de Pascua es uno de los festivos de Cataluña, ${joinList(easter.map((d) => `el ${weekdayDayMonth(d.date, "es")} de ${d.date.slice(0, 4)}`), "es")}${goodFriday ? ", y el Viernes Santo también" : ""}.`,
      },
      {
        question: "¿Cuántos festivos hay en Cataluña?",
        answer: `${now.length} al año en toda Cataluña, que fija la Generalitat, más los festivos locales de cada municipio, normalmente dos, que fija su ayuntamiento. Un festivo local solo lo es en ese municipio.`,
      },
    ];
  }

  const bcnAnswer =
    bcn.state === "pending"
      ? `Els ${next.length} festius de Catalunya: ${listDays(next, "ca")}. Els festius locals de Barcelona del ${NEXT} encara no s'han publicat.`
      : `Barcelona té ${next.length + bcn.count} festius el ${NEXT}. Els festius locals de Barcelona són ${bcn.days}${bcn.state === "council" ? ", aprovats per l'Ajuntament (falta l'ordre de la Generalitat amb els festius locals de tots els municipis)" : ""}. S'afegeixen als ${next.length} de Catalunya: ${listDays(next, "ca")}.`;
  return [
    { question: `Quins són els festius de Barcelona el ${NEXT}?`, answer: bcnAnswer },
    { question: "El 6 de desembre és festiu a Catalunya?", answer: both("12-06") },
    { question: "El 26 de desembre, Sant Esteve, és festiu a Catalunya?", answer: both("12-26") },
    {
      question: "El dilluns de Pasqua és festiu a Catalunya?",
      answer: `Sí: el dilluns de Pasqua és un dels festius de Catalunya, ${joinList(easter.map((d) => `el ${weekdayDayMonth(d.date, "ca")} del ${d.date.slice(0, 4)}`), "ca")}${goodFriday ? ", i el Divendres Sant també" : ""}.`,
    },
    {
      question: "Quants festius hi ha a Catalunya?",
      answer: `${now.length} l'any a tot Catalunya, que fixa la Generalitat, més els festius locals de cada municipi, normalment dos, que fixa el seu ajuntament. Un festiu local només ho és en aquell municipi.`,
    },
  ];
}

/** The section heading the three hubs print above the questions. */
export const HUB_FAQ_TITLE: Record<DateLocale, string> = {
  ca: "Preguntes freqüents sobre els festius",
  es: "Preguntas frecuentes sobre los festivos",
  en: "Public holidays in Catalonia: questions people ask",
};
