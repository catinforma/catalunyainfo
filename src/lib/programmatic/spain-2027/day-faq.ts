import { REGIONS, type Region } from "@/lib/programmatic/holidays/boe-2027";
import type { DateLocale } from "@/lib/programmatic/holidays/format";

import { names } from "./communities";
import { runLine, weekdayDate, type Faq } from "./copy";
import { COMPUTED_NOTE, dayH1, dayLead, dayNotes, daySections, whereWords, workingIn } from "./day-copy";
import {
  computedNote,
  dayH1Intl,
  dayLeadIntl,
  dayNotesIntl,
  daySectionsIntl,
  holidayName,
  regionName,
  runLineIntl,
  weekdayDateIntl,
  whereWordsIntl,
  workingInIntl,
} from "./day-copy-intl";
import { dayRuns, isCity, type SpainDay } from "./days";

/**
 * The Spain-wide day pages (/es/festivos/2027/dia/…, /ca/festius/2027/dia/…,
 * /en/holidays/2027/day/…) as text: the words around the lists that
 * days.tsx prints, and the FAQPage built from what the page shows.
 *
 * 27 Nov 2026 (live audit, 72 pages: "answers differ from the page text"):
 * the "where" and "long weekend" answers in the markup were one paragraph
 * written for it, while the page prints a short line and then lists. Each
 * answer is now the printed text under its question, in its order, one line
 * per list item, so the markup carries nothing the reader does not see.
 * days.tsx renders the lists from these same helpers.
 */

/** The interface words of the lists, per language. */
export const DAY_LIST_UI = {
  ca: { on: "Festiu", off: "Laborable", cityLocal: "festa local de la ciutat", allLocal: "festa local a tots els municipis", movedTo: "Al", notMoved: "No es trasllada", in: "a", and: " i " },
  es: { on: "Festivo", off: "Laborable", cityLocal: "fiesta local de la ciudad", allLocal: "fiesta local en todos los municipios", movedTo: "Al", notMoved: "No se traslada", in: "en", and: " y " },
  en: { on: "Holiday", off: "Working day", cityLocal: "the city's local holiday", allLocal: "local holiday in every municipality", movedTo: "To", notMoved: "Not moved", in: "in", and: " and " },
} as const satisfies Record<DateLocale, unknown>;

/** A territory as the page names it: the Spanish short name, or the Catalan/English name capitalised. */
export function dayPlaceLabel(r: Region, locale: DateLocale): string {
  if (locale === "es") return names(r).short;
  const name = regionName(r, locale);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** The BOE's name of a holiday, translated in Catalan and English. */
export function dayHolidayLabel(name: string, locale: DateLocale): string {
  return locale === "es" ? name : holidayName(name, locale);
}

export function dayWeekdayDate(iso: string, locale: DateLocale): string {
  return locale === "es" ? weekdayDate(iso) : weekdayDateIntl(iso, locale);
}

/** "Galicia, Madrid y Murcia": the inline list RegionLinks prints (each name a link there). */
export function dayPlaceList(regions: readonly Region[], locale: DateLocale): string {
  const and = DAY_LIST_UI[locale].and;
  return regions.map((r, i) => `${i === 0 ? "" : i === regions.length - 1 ? and : ", "}${dayPlaceLabel(r, locale)}`).join("");
}

/** The territories a long weekend covers, as the bridge list prints them: words from 10 up, else the list. */
export function dayRunPlaces(regions: readonly Region[], locale: DateLocale): string {
  if (regions.length >= 10) return locale === "es" ? whereWords(regions) : whereWordsIntl(regions, locale);
  return dayPlaceList(regions, locale);
}

export function dayRunWords(run: Parameters<typeof runLine>[0], locale: DateLocale): string {
  return locale === "es" ? runLine(run) : runLineIntl(run, locale);
}

export function dayComputedNote(locale: DateLocale): string {
  return locale === "es" ? COMPUTED_NOTE : computedNote(locale);
}

/** The holiday's label after a territory in the "where" list: "(fiesta local de la ciudad: San José)", or the name when names differ. */
export function dayHolderNote(h: SpainDay["holders"][number], several: boolean, locale: DateLocale): string {
  const ui = DAY_LIST_UI[locale];
  if (h.basis === "local") return ` (${isCity(h.region) ? ui.cityLocal : ui.allLocal}: ${dayHolidayLabel(h.name, locale)})`;
  return several ? ` (${dayHolidayLabel(h.name, locale)})` : "";
}

/** The "where" section's lists, one line per heading and item, as WhereLists prints them. */
export function dayWhereLines(day: SpainDay, locale: DateLocale): string[] {
  const ui = DAY_LIST_UI[locale];
  if (day.moved) {
    const moved = new Set(day.moved.to.flatMap((t) => t.regions));
    return [
      ...day.moved.to.map((t) => `${ui.movedTo} ${dayWeekdayDate(t.date, locale)}: ${dayPlaceList(t.regions, locale)}`),
      `${ui.notMoved}: ${dayPlaceList(
        REGIONS.filter((r) => !moved.has(r)),
        locale,
      )}`,
    ];
  }
  if (day.national) return [`${dayPlaceList(REGIONS, locale)}.`];
  const working = locale === "es" ? workingIn(day) : workingInIntl(day);
  const several = new Set(day.holders.map((h) => h.name)).size > 1;
  return [
    `${ui.on} (${day.regions.length})`,
    ...day.holders.map((h) => `${dayPlaceLabel(h.region, locale)}${dayHolderNote(h, several, locale)}`),
    `${ui.off} (${working.length})`,
    ...working.map((r) => dayPlaceLabel(r, locale)),
  ];
}

/** The bridge section's list and note, as BridgeList prints them; nothing when there is no long weekend. */
export function dayBridgeLines(day: SpainDay, locale: DateLocale): string[] {
  const runs = dayRuns(day);
  if (runs.length === 0) return [];
  const ui = DAY_LIST_UI[locale];
  return [...runs.map((g) => `${dayRunWords(g.run, locale)} — ${ui.in} ${dayRunPlaces(g.regions, locale)}.`), dayComputedNote(locale)];
}

/**
 * FAQPage for a day page: the H1 with the lead and notes under it, then each
 * section's H2 with the text printed under it (its line, then its lists).
 */
export function printedDayFaq(day: SpainDay, locale: DateLocale): Faq[] {
  const h1 = locale === "es" ? dayH1(day.date) : dayH1Intl(day.date, locale);
  const lead = locale === "es" ? [dayLead(day), ...dayNotes(day)] : [dayLeadIntl(day, locale), ...dayNotesIntl(day, locale)];
  const sections = locale === "es" ? daySections(day) : daySectionsIntl(day, locale);
  return [
    { question: h1, answer: lead.join(" ") },
    ...sections.map((s) => {
      const lists = s.id === "donde" ? dayWhereLines(day, locale) : s.id === "puente" ? dayBridgeLines(day, locale) : [];
      return { question: s.question, answer: [s.printed, ...(s.more ?? []), ...lists].join("\n") };
    }),
  ];
}
