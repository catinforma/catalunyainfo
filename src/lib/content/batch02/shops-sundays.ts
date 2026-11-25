import type { Block } from "@/lib/content/blocks";
import { WEEKDAY_NAMES, longDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";
import { municipalityBySlug } from "@/lib/programmatic/holidays/data";
import { joinList } from "@/lib/programmatic/holidays/names";

import { christmasSundaysParagraph } from "./shops-spain-december";
import { closedOn } from "./shops-towns-nov-dec";
import { b2link } from "./shared";

/**
 * "When do shops start opening on Sundays for Christmas?" (25 Nov 2026), the
 * answer under the first H2 of the shops guides, said in the tense of today.
 *
 * Search Console, 28 days to 25 Nov 2026, pages containing "tiendas-abiertas":
 * "cuando abren las tiendas los domingos" 1,757 impressions at 10.5 (0
 * clicks), "cuando empiezan a abrir las tiendas los domingos" 1,049 at 7.7 (0
 * clicks), "cuando empiezan a abrir los domingos las tiendas" 357 at 7.6, and a
 * dozen more spellings. The paragraph was static ("es el primer domingo ...
 * Después, los domingos 6, 13, 20 y 27") and read the same on 8 December as on
 * 25 November. This module says the same days with "es"/"fue" and "pueden
 * abrir"/"pudieron abrir" according to the date, from the same sources as the
 * rest of the page:
 * - Barcelona's days: Resolució EMT/4342/2025 (the holidays snapshot's `shops`,
 *   held to the DOGC text by tests/shops-christmas.test.ts): "29 de novembre.
 *   6, 8, 13, 20 i 27 de desembre." (DOGC núm. 9551, 27.11.2025);
 * - the towns that do not open on 29 Nov: the per-town table (closedOn);
 * - 3 January 2027: Ordre EMT/89/2026, art. 1 (first general day of 2027);
 * - the rest of Spain: the Ministry's calendar (shops-spain-december.ts).
 *
 * Day-dependent (`shopsSundays` is in DAY_DEPENDENT_BLOCKS): the nightly cron
 * rebuilds the pages carrying it, and every sentence names its own dates.
 */

const BARCELONA = municipalityBySlug("barcelona");

/** First opening Sunday of the Christmas season in Barcelona and almost all of Catalonia. */
export const FIRST_CHRISTMAS_SUNDAY = "2026-11-29";
/** First general opening day of 2027 (Ordre EMT/89/2026, art. 1). */
const FIRST_2027 = "2027-01-03";
/** Last day of the December 2026 days. */
const LAST_DAY = "2026-12-31";

/** "a Terrassa ni a Riells i Viabrea": towns after a negative, each with its own preposition. */
export function notIn(towns: string[], locale: Locale): string {
  if (locale === "en") return `in ${joinList(towns, "en").replace(/ and /, " or ")}`;
  const p = locale === "ca" ? "a" : "en";
  const each = towns.map((t) => `${p} ${t}`);
  return each.length <= 1 ? (each[0] ?? "") : `${each.slice(0, -1).join(", ")} ni ${each.at(-1)}`;
}

/** Barcelona's opening days from 29 Nov to 31 Dec 2026, in order (Sundays and the Tuesday 8 holiday). */
export function christmasOpeningDays(): string[] {
  return (BARCELONA?.shops ?? []).filter((d) => d >= FIRST_CHRISTMAS_SUNDAY && d <= LAST_DAY).sort();
}

/** "el domingo 6, el martes 8 y los domingos 13, 20 y 27 de diciembre": runs of the same weekday share one article and one plural. */
export function daysPhrase(isos: string[], locale: Locale): string {
  const names = WEEKDAY_NAMES[locale];
  const runs: { weekday: number; days: number[] }[] = [];
  for (const iso of isos) {
    const weekday = weekdayIndex(iso);
    const day = Number(iso.slice(8, 10));
    const last = runs.at(-1);
    if (last && last.weekday === weekday) last.days.push(day);
    else runs.push({ weekday, days: [day] });
  }
  const run = ({ weekday, days }: { weekday: number; days: number[] }) => {
    const many = days.length > 1;
    const name = names[weekday]!;
    const plural = `${name}s`;
    const list = joinList(days.map(String), locale);
    if (locale === "en") return `${many ? plural : name} ${list}`;
    const article = locale === "ca" ? (many ? "els" : "el") : many ? "los" : "el";
    return `${article} ${many ? plural : name} ${list}`;
  };
  const month = { ca: "de desembre", es: "de diciembre", en: "December" }[locale];
  return `${joinList(runs.map(run), locale)} ${month}`;
}

/**
 * The answer for Barcelona and almost all of Catalonia on one day (ISO date).
 * Sentence one is the answer: the first opening Sunday and its date, tense by
 * today. Sentence two names the other days, those gone in the past tense.
 */
export function cataloniaSundaysParagraph(today: string, locale: Locale): string {
  const days = christmasOpeningDays().filter((d) => d > FIRST_CHRISTMAS_SUNDAY);
  const gone = days.filter((d) => d < today);
  const coming = days.filter((d) => d >= today);
  const not29 = notIn(closedOn(FIRST_CHRISTMAS_SUNDAY), locale);
  const phase = today < FIRST_CHRISTMAS_SUNDAY ? "before" : today === FIRST_CHRISTMAS_SUNDAY ? "today" : "after";
  const date = longDate(FIRST_CHRISTMAS_SUNDAY, locale);
  const first2027Past = today > FIRST_2027;
  const T = {
    ca: {
      intro: "A Barcelona i a gairebé tot Catalunya, ",
      first: { before: `el primer diumenge d'obertura de Nadal és el **29 de novembre del 2026**`, today: `el primer diumenge d'obertura de Nadal **és avui, diumenge 29 de novembre del 2026**`, after: `el primer diumenge d'obertura de Nadal **va ser el 29 de novembre del 2026**` },
      not: { before: "no ho és", today: "no ho és", after: "no ho va ser" },
      then: "Després, les botigues",
      past: "van poder obrir",
      present: "poden obrir",
      rule: `Les botigues amb horari general no obren tots els diumenges: a Catalunya només poden obrir deu diumenges o festius l'any, i el primer del 2027 ${first2027Past ? "va ser" : "és"} el diumenge 3 de gener.`,
    },
    es: {
      intro: "En Barcelona y en casi toda Cataluña, ",
      first: { before: `el primer domingo de apertura de Navidad es el **29 de noviembre de 2026**`, today: `el primer domingo de apertura de Navidad **es hoy, domingo 29 de noviembre de 2026**`, after: `el primer domingo de apertura de Navidad **fue el 29 de noviembre de 2026**` },
      not: { before: "no lo es", today: "no lo es", after: "no lo fue" },
      then: "Después, las tiendas",
      past: "pudieron abrir",
      present: "pueden abrir",
      rule: `Las tiendas con horario general no abren todos los domingos: en Cataluña solo pueden abrir diez domingos o festivos al año, y el primero de 2027 ${first2027Past ? "fue" : "es"} el domingo 3 de enero.`,
    },
    en: {
      intro: "In Barcelona and almost all of Catalonia, ",
      first: { before: `the first Sunday opening of the Christmas season is **29 November 2026**`, today: `the first Sunday opening of the Christmas season is **today, Sunday 29 November 2026**`, after: `the first Sunday opening of the Christmas season **was 29 November 2026**` },
      not: { before: "not", today: "not", after: "not" },
      then: "After that, shops",
      past: "could open on",
      present: "may open on",
      rule: `Shops on the general timetable do not open every Sunday: in Catalonia they may open on only ten Sundays or holidays a year, and the first one of 2027 ${first2027Past ? "was" : "is"} Sunday 3 January.`,
    },
  }[locale];
  const notClause = not29 ? ` (${T.not[phase]} ${not29})` : "";
  const parts: string[] = [];
  if (gone.length) parts.push(`${T.past} ${daysPhrase(gone, locale)}`);
  if (coming.length) parts.push(`${T.present} ${daysPhrase(coming, locale)}`);
  // "pudieron abrir el domingo 6 y el martes 8 de diciembre; pueden abrir los domingos 13, 20 y 27 de diciembre"
  const after = parts.length ? ` ${T.then} ${parts.join("; ")}.` : "";
  return `${T.intro}${T.first[phase]}${notClause}.${after} ${T.rule}`;
}

/** "And in the rest of Spain?": Ministry calendar, first Christmas Sunday of each region, tense by today. */
export function spainRestParagraph(today: string, locale: Locale): string {
  const lead = {
    ca: `**I a la resta d'Espanya?** Cada comunitat fixa els seus dies. ${christmasSundaysParagraph("ca", false, today)} Totes, amb les illes: ${b2link("shopsSpainDecember", "ca", "botigues obertes al desembre per comunitat")}.`,
    es: `**¿Y en el resto de España?** Cada comunidad fija sus días. ${christmasSundaysParagraph("es", false, today)} Todas, con las islas: ${b2link("shopsSpainDecember", "es", "tiendas abiertas en diciembre por comunidad")}.`,
    en: `**And in the rest of Spain?** Each region sets its own days. ${christmasSundaysParagraph("en", false, today)} All of them, with the islands: ${b2link("shopsSpainDecember", "en", "shops open in December, region by region")}.`,
  };
  return lead[locale];
}

export type ShopsSundaysScope = "catalonia" | "spainRest" | "spain";

/** The paragraph(s) the `shopsSundays` block renders on `today`. */
export function shopsSundaysBlocks(today: string, locale: Locale, scope: ShopsSundaysScope): Block[] {
  const text =
    scope === "catalonia" ? cataloniaSundaysParagraph(today, locale) : scope === "spainRest" ? spainRestParagraph(today, locale) : christmasSundaysParagraph(locale, true, today);
  return [{ type: "paragraph", text } as Block];
}
