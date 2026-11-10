import type { Plan } from "@/lib/content/holidays/bridges";
import { saturdayAnswer, saturdayQuestion } from "@/lib/content/holidays/saturday";
import { BOE_2026 } from "@/lib/programmatic/holidays/boe-2026";
import { REGIONS, REGION_NAME, type Region } from "@/lib/programmatic/holidays/boe-2027";
import { caDayArticle, dayMonth, dayMonthYear, weekdayName } from "@/lib/programmatic/holidays/format";
import { joinList } from "@/lib/programmatic/holidays/names";

import { YEAR } from "./calendar";
import { DESCRIPTION_LIMIT, TITLE_LIMIT, type Faq } from "./copy";
import type { DaySection } from "./day-copy";
import { change2026, dayRuns, isCity, isWeekend, movableName, type DayHolder, type SpainDay } from "./days";

/**
 * Catalan and English words for the Spain-wide day pages
 * (/ca/festius/2027/dia/6-desembre/, /en/holidays/2027/day/6-december/): the
 * same answers as the Spanish edition (`day-copy.ts`), from the same facts
 * (`days.ts`), written in each language rather than translated line by line.
 *
 * The only words typed here are the holidays' names in Catalan and English
 * (`HOLIDAY_NAMES`): the BOE prints them in Spanish, and the pages give the
 * BOE's own name in «» next to the translation, so the source stays visible.
 * A test requires a translation for every name a page prints.
 */

export type IntlLocale = "ca" | "en";

/** Each BOE row's and shared local day's name: [Catalan, English], plus the short name a title uses for a national day. */
export const HOLIDAY_NAMES: Record<string, { ca: string; en: string; title?: { ca: string; en: string } }> = {
  "Año Nuevo": { ca: "Any Nou", en: "New Year's Day", title: { ca: "Any Nou", en: "New Year's Day" } },
  "Epifanía del Señor": { ca: "Epifania (Reis)", en: "Epiphany (Three Kings' Day)", title: { ca: "Reis", en: "Three Kings' Day" } },
  "Día de Andalucía": { ca: "Dia d'Andalusia", en: "Andalusia Day" },
  "Día de les Illes Balears": { ca: "Dia de les Illes Balears", en: "Balearic Islands Day" },
  "Fiesta del Eid Fitr": { ca: "Aïd al-Fitr", en: "Eid al-Fitr" },
  "San José": { ca: "Sant Josep", en: "Saint Joseph's Day" },
  "Jueves Santo": { ca: "Dijous Sant", en: "Maundy Thursday" },
  "Viernes Santo": { ca: "Divendres Sant", en: "Good Friday", title: { ca: "Divendres Sant", en: "Good Friday" } },
  "Lunes de Pascua": { ca: "Dilluns de Pasqua", en: "Easter Monday" },
  "San Jorge/Día de Aragón": { ca: "Sant Jordi, Dia d'Aragó", en: "Saint George's Day, Aragon Day" },
  "Fiesta de Castilla y León": { ca: "Festa de Castella i Lleó", en: "Castile and León Day" },
  "Fiesta del Trabajo": { ca: "Festa del Treball", en: "Labour Day", title: { ca: "Festa del Treball", en: "Labour Day" } },
  "Día de las Letras Gallegas": { ca: "Dia de les Lletres Gallegues", en: "Galician Literature Day" },
  "Eidul Adha-Fiesta Sacrificio": { ca: "Aïd al-Adha (Festa del Sacrifici)", en: "Eid al-Adha (Feast of the Sacrifice)" },
  "Fiesta Sacrificio-Aid Al Adha": { ca: "Aïd al-Adha (Festa del Sacrifici)", en: "Eid al-Adha (Feast of the Sacrifice)" },
  "Corpus Christi": { ca: "Corpus", en: "Corpus Christi" },
  "Día de Castilla-La Mancha": { ca: "Dia de Castella-la Manxa", en: "Castile-La Mancha Day" },
  "Día de la Región de Murcia": { ca: "Dia de la Regió de Múrcia", en: "Region of Murcia Day" },
  "Día de La Rioja": { ca: "Dia de la Rioja", en: "La Rioja Day" },
  "Día de San Juan": { ca: "Sant Joan", en: "Saint John's Day" },
  "Día de las Instituciones de Cantabria": { ca: "Dia de les Institucions de Cantàbria", en: "Cantabria Institutions Day" },
  "Nuestra Señora de África": { ca: "Mare de Déu d'Àfrica", en: "Our Lady of Africa" },
  "Lunes siguiente a asunción de la Virgen": { ca: "dilluns següent a l'Assumpció", en: "Monday after the Assumption" },
  "Día de Asturias": { ca: "Dia d'Astúries", en: "Asturias Day" },
  "Día de Extremadura": { ca: "Dia d'Extremadura", en: "Extremadura Day" },
  "Fiesta Nacional de Cataluña": { ca: "Diada Nacional de Catalunya", en: "National Day of Catalonia" },
  "La Bien Aparecida": { ca: "Mare de Déu de la Bien Aparecida", en: "Our Lady of La Bien Aparecida" },
  "Aniversario 1er Gobierno Euskadi": { ca: "aniversari del primer Govern basc", en: "anniversary of the first Basque Government" },
  "Día de la Comunitat Valenciana": { ca: "Dia de la Comunitat Valenciana", en: "Valencian Community Day" },
  "Sustitución 15 de agosto": { ca: "substitució del 15 d'agost", en: "in place of 15 August" },
  "Fiesta Nacional de España": { ca: "Festa Nacional d'Espanya", en: "National Day of Spain", title: { ca: "Festa Nacional", en: "National Day" } },
  "Todos los Santos": { ca: "Tots Sants", en: "All Saints' Day", title: { ca: "Tots Sants", en: "All Saints' Day" } },
  "Día de la Constitución Española": { ca: "Dia de la Constitució", en: "Constitution Day", title: { ca: "Constitució", en: "Constitution Day" } },
  "Inmaculada Concepción": { ca: "la Immaculada", en: "Immaculate Conception", title: { ca: "la Immaculada", en: "Immaculate Conception" } },
  "Natividad del Señor": { ca: "Nadal", en: "Christmas Day", title: { ca: "Nadal", en: "Christmas Day" } },
  // Local days a whole territory shares (sources.ts).
  "Día de Ceuta": { ca: "Dia de Ceuta", en: "Ceuta Day" },
  "Día de Melilla": { ca: "Dia de Melilla", en: "Melilla Day" },
  "Día de Ntra. Sra. Virgen de la Victoria": { ca: "Mare de Déu de la Victòria", en: "Our Lady of Victory" },
  "Fiesta de Culminación de Ramadán Eid al-Fitr": { ca: "Aïd al-Fitr, final del Ramadà", en: "Eid al-Fitr, end of Ramadan" },
  "San Francisco Javier, Día de Navarra": { ca: "Sant Francesc Xavier, Dia de Navarra", en: "Saint Francis Xavier, Navarre Day" },
  // Canary island days (BOE note 1).
  "Nuestra Señora de Las Nieves": { ca: "Mare de Déu de les Neus", en: "Our Lady of the Snows" },
  "Nuestra Señora del Pino": { ca: "Mare de Déu del Pino", en: "Our Lady of the Pine" },
  "Nuestra Señora de los Volcanes": { ca: "Mare de Déu dels Volcans", en: "Our Lady of the Volcanoes" },
  "Nuestra Señora de la Peña": { ca: "Mare de Déu de la Peña", en: "Our Lady of La Peña" },
};

/** The islands as the BOE's note names them. */
const ISLAND_NAMES: Record<string, { ca: string; en: string }> = {
  "Lanzarote y La Graciosa": { ca: "Lanzarote i La Graciosa", en: "Lanzarote and La Graciosa" },
};

/** The feasts that move with Easter, for the questions ("el Dijous Sant de 2027", "Maundy Thursday 2027"). */
const FEAST: Record<string, { ca: string; en: string }> = {
  "Jueves Santo": { ca: "Dijous Sant", en: "Maundy Thursday" },
  "Viernes Santo": { ca: "Divendres Sant", en: "Good Friday" },
  "Lunes de Pascua": { ca: "Dilluns de Pasqua", en: "Easter Monday" },
  "Corpus Christi": { ca: "Corpus", en: "Corpus Christi" },
};

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** A holiday's name in the page's language; the Spanish name itself if a new one has no translation yet (a test forbids that). */
export function holidayName(name: string, L: IntlLocale): string {
  return HOLIDAY_NAMES[name]?.[L] ?? name;
}

function island(place: string, L: IntlLocale): string {
  return ISLAND_NAMES[place]?.[L] ?? place;
}

/** "l'Aragó", "the Balearic Islands". */
export function regionName(r: Region, L: IntlLocale): string {
  return REGION_NAME[r][L];
}

export function regionList(regions: readonly Region[], L: IntlLocale): string {
  return joinList(regions.map((r) => regionName(r, L)), L);
}

/** Catalan "a" before a place, contracted with the article: "a Galícia", "al País Basc", "a l'Aragó". */
export function caIn(place: string): string {
  if (place.startsWith("el ")) return `al ${place.slice(3)}`;
  if (place.startsWith("els ")) return `als ${place.slice(4)}`;
  return `a ${place}`;
}

/** "a Galícia, la Comunitat de Madrid i Navarra" / "in Galicia, the Community of Madrid and Navarre". */
export function inList(regions: readonly Region[], L: IntlLocale): string {
  const list = regionList(regions, L);
  return L === "ca" ? caIn(list) : `in ${list}`;
}

/** "5 comunitats i Melilla" / "5 regions and Melilla". */
export function territoryCountIntl(regions: readonly Region[], L: IntlLocale): string {
  const cities = regions.filter(isCity);
  const n = regions.length - cities.length;
  const word = L === "ca" ? (n === 1 ? "comunitat" : "comunitats") : n === 1 ? "region" : "regions";
  return joinList([...(n ? [`${n} ${word}`] : []), ...cities.map((r) => regionName(r, L))], L);
}

/** "tot Espanya", "tot Espanya excepte Catalunya i la Comunitat Valenciana", or the list. */
export function whereWordsIntl(regions: readonly Region[], L: IntlLocale): string {
  const all = L === "ca" ? "tot Espanya" : "all of Spain";
  if (regions.length === REGIONS.length) return all;
  if (regions.length >= 10) return `${all} ${L === "ca" ? "excepte" : "except"} ${regionList(REGIONS.filter((r) => !regions.includes(r)), L)}`;
  return regionList(regions, L);
}

/** "divendres 19 de març" / "Friday 19 March". */
export function weekdayDateIntl(iso: string, L: IntlLocale): string {
  const wd = weekdayName(iso, L);
  return `${wd} ${dayMonth(iso, L)}`;
}

/** "del divendres 19 al diumenge 21 de març" / "Friday 19 to Sunday 21 March". */
export function rangeWordsIntl(from: string, to: string, L: IntlLocale): string {
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const start = sameMonth ? `${weekdayName(from, L)} ${Number(from.slice(8, 10))}` : weekdayDateIntl(from, L);
  return L === "ca" ? `del ${start} al ${weekdayDateIntl(to, L)}` : `${start} to ${weekdayDateIntl(to, L)}`;
}

/** "Del divendres 19 al diumenge 21 de març: 3 dies sense vacances" / "Friday 19 to Sunday 21 March: 3 days without taking leave". */
export function runLineIntl(run: Pick<Plan, "from" | "to" | "days" | "take">, L: IntlLocale): string {
  const take = joinList(run.take.map((t) => weekdayDateIntl(t, L)), L);
  const leave =
    L === "ca"
      ? run.take.length === 0
        ? "sense vacances"
        : `amb ${run.take.length} ${run.take.length === 1 ? "dia" : "dies"} de vacances (${take})`
      : run.take.length === 0
        ? "without taking leave"
        : `with ${run.take.length} ${run.take.length === 1 ? "day" : "days"} of leave (${take})`;
  return `${cap(rangeWordsIntl(run.from, run.to, L))}: ${run.days} ${L === "ca" ? "dies" : "days"} ${leave}`;
}

/** Splits a holiday into its answers, as the Spanish edition does. */
type Shape = "national" | "moved" | "most" | "some" | "one";

function shape(day: SpainDay): Shape {
  if (day.moved) return "moved";
  if (day.national) return "national";
  if (day.regions.length >= 10) return "most";
  if (day.regions.length >= 2) return "some";
  return "one";
}

function feastName(iso: string, L: IntlLocale): string | null {
  const feast = movableName(iso);
  return feast ? (FEAST[feast]?.[L] ?? null) : null;
}

/** "el 19 de març de 2027", "l'1 de gener de 2027", "el Dijous Sant de 2027" / "19 March 2027", "Maundy Thursday 2027". */
export function theDayIntl(iso: string, L: IntlLocale): string {
  const feast = feastName(iso, L);
  if (L === "ca") return feast ? `el ${feast} de ${YEAR}` : `${caDayArticle(iso)}${dayMonthYear(iso, "ca")}`;
  return feast ? `${feast} ${YEAR}` : dayMonthYear(iso, "en");
}

/** "És festiu el 19 de març de 2027 a Espanya?" / "Is 19 March 2027 a public holiday in Spain?". */
export function dayQuestionIntl(iso: string, L: IntlLocale): string {
  return L === "ca" ? `És festiu ${theDayIntl(iso, L)} a Espanya?` : `Is ${theDayIntl(iso, L)} a public holiday in Spain?`;
}

/** The H1: the question, with the date for the feasts. */
export function dayH1Intl(iso: string, L: IntlLocale): string {
  const feast = feastName(iso, L);
  if (!feast) return dayQuestionIntl(iso, L);
  return L === "ca"
    ? `És festiu el ${feast} de ${YEAR} (${dayMonth(iso, "ca")}) a Espanya?`
    : `Is ${feast} ${YEAR} (${dayMonth(iso, "en")}) a public holiday in Spain?`;
}

function distinctNames(holders: readonly DayHolder[]): string[] {
  return [...new Set(holders.map((h) => h.name))];
}

function split(regions: readonly Region[]): { communities: Region[]; cities: Region[] } {
  return { communities: regions.filter((r) => !isCity(r)), cities: regions.filter(isCity) };
}

function titleTails(day: SpainDay, L: IntlLocale): string[] {
  const { communities, cities } = split(day.regions);
  const ca = L === "ca";
  switch (shape(day)) {
    case "national": {
      const name = HOLIDAY_NAMES[day.holders[0]!.name]?.title?.[L];
      return name ? [cap(name)] : [];
    }
    case "moved":
      return [ca ? "On es passa a dilluns" : "Where it moves to Monday"];
    case "most": {
      const except = territoryCountIntl(REGIONS.filter((r) => !day.regions.includes(r)), L);
      return [ca ? `Sí, excepte a ${except}` : `Yes, except in ${except}`];
    }
    case "some": {
      const count = cities.length === 0 ? `${communities.length} ${ca ? "comunitats" : "regions"}` : territoryCountIntl(day.regions, L);
      return ca ? [`Sí, a ${count}`, "On sí i on no"] : [`Yes, in ${count}`, "Where it is and is not"];
    }
    case "one":
      return [ca ? "Només en una comunitat" : "Only in one region"];
  }
}

/**
 * `<title>`: the question and the first tail that fits in 60 characters, with
 * the question shortened as searchers type it if needed ("de març 2027",
 * "a holiday in Spain"); the question alone at worst.
 */
export function dayTitleIntl(iso: string, day: SpainDay, L: IntlLocale): string {
  const question = shape(day) === "national" ? dayQuestionIntl(iso, L).replace(theDayIntl(iso, L), L === "ca" ? `${caDayArticle(iso)}${dayMonthYear(iso, "ca")}` : dayMonthYear(iso, "en")) : dayQuestionIntl(iso, L);
  const compact = L === "ca" ? question.replace(` de ${YEAR} a Espanya?`, ` ${YEAR} a Espanya?`) : question.replace("a public holiday in Spain?", "a holiday in Spain?");
  return titleTails(day, L)
    .flatMap((tail) => [`${question} ${tail}`, `${compact} ${tail}`])
    .find((t) => t.length <= TITLE_LIMIT) ?? question;
}

/** The answer box's few words. */
export function dayVerdictIntl(day: SpainDay, L: IntlLocale): string {
  const ca = L === "ca";
  switch (shape(day)) {
    case "national":
      if (!isWeekend(day.date)) return ca ? "Sí" : "Yes";
      return ca ? `Sí, en ${weekdayName(day.date, "ca")}` : `Yes, on a ${weekdayName(day.date, "en")}`;
    case "moved":
      return ca ? "Cau en diumenge" : "Falls on a Sunday";
    case "most":
      return ca ? "Gairebé a tot Espanya" : "Almost all of Spain";
    case "some":
      return day.regions.length <= 3 ? cap(inList(day.regions, L)) : cap(ca ? `a ${territoryCountIntl(day.regions, L)}` : `in ${territoryCountIntl(day.regions, L)}`);
    case "one":
      return ca ? `Només ${caIn(regionName(day.regions[0]!, L))}` : `Only in ${regionName(day.regions[0]!, L)}`;
  }
}

/** "el divendres 19 de març de 2027" / "Friday 19 March 2027". */
function theWeekdayDate(iso: string, L: IntlLocale): string {
  return L === "ca" ? `el ${weekdayDateIntl(iso, L)} de ${YEAR}` : `${weekdayDateIntl(iso, L)} ${YEAR}`;
}

function whereSentence(regions: readonly Region[], L: IntlLocale): string {
  const { communities, cities } = split(regions);
  const ca = L === "ca";
  const n = `${communities.length} ${ca ? "comunitats" : "regions"}`;
  if (communities.length >= 2 && cities.length === 0) return `${ca ? "a" : "in"} ${n}: ${regionList(communities, L)}`;
  if (communities.length >= 2) return `${ca ? "a" : "in"} ${n} (${regionList(communities, L)}) ${ca ? "i" : "and"} ${inList(cities, L)}`;
  return inList(regions, L);
}

/** Where a moved Sunday went. */
function movedWords(day: SpainDay, L: IntlLocale, withNames = true): string {
  const ca = L === "ca";
  const parts = day.moved!.to.map((t) => {
    const wd = weekdayDateIntl(t.date, L);
    if (t.regions.length === 1) return ca ? `${cap(regionName(t.regions[0]!, L))}, al ${wd}` : `${cap(regionName(t.regions[0]!, L))}, to ${wd}`;
    const names = withNames ? ` (${regionList(t.regions, L)})` : "";
    return ca ? `${territoryCountIntl(t.regions, L)} el passen al ${wd}${names}` : `${territoryCountIntl(t.regions, L)} move it to ${wd}${names}`;
  });
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")}${ca ? ", i" : ", and"} ${parts.at(-1)}`;
}

function notMoved(day: SpainDay): Region[] {
  const moved = new Set(day.moved!.to.flatMap((t) => t.regions));
  return REGIONS.filter((r) => !moved.has(r));
}

export function workingInIntl(day: SpainDay): Region[] {
  return REGIONS.filter((r) => !day.regions.includes(r));
}

/** The first line: the answer, in the H1's terms. */
export function dayLeadIntl(day: SpainDay, L: IntlLocale): string {
  const when = theWeekdayDate(day.date, L);
  const ca = L === "ca";
  switch (shape(day)) {
    case "national":
      if (isWeekend(day.date)) {
        const wd = weekdayName(day.date, L);
        return ca
          ? `Sí, ${when} és festiu a tot Espanya, tot i que cau en ${wd} i no afegeix cap dia lliure de dilluns a divendres: la relació del BOE no el trasllada a cap altre dia en cap comunitat.`
          : `Yes, ${when} is a public holiday across Spain, but it falls on a ${wd} and adds no day off for a Monday-to-Friday worker: the BOE list does not move it to another day in any region.`;
      }
      return ca
        ? `Sí, ${when} és festiu a tot Espanya: a les 17 comunitats autònomes i a Ceuta i Melilla.`
        : `Yes, ${when} is a public holiday across Spain: in all 17 autonomous communities and in Ceuta and Melilla.`;
    case "moved":
      return ca
        ? `No: el ${dayMonthYear(day.date, "ca")}, l'Assumpció, cau en diumenge i no és a la relació de festes laborals del BOE. ${cap(movedWords(day, L))}; a la resta d'Espanya (${territoryCountIntl(notMoved(day), L)}) no es trasllada.`
        : `No: ${dayMonthYear(day.date, "en")}, the Assumption, falls on a Sunday and is not in the BOE's list of public holidays. ${cap(movedWords(day, L))}; in the rest of Spain (${territoryCountIntl(notMoved(day), L)}) it is not moved.`;
    case "most": {
      const except = REGIONS.filter((r) => !day.regions.includes(r));
      const { communities, cities } = split(day.regions);
      const rest = ca
        ? `a ${communities.length} comunitats${cities.length ? ` i ${inList(cities, L)}` : ""}`
        : `in ${communities.length} regions${cities.length ? ` and ${inList(cities, L)}` : ""}`;
      return ca
        ? `Sí, ${when} és festiu a tot Espanya excepte ${caIn(regionList(except, L))}: ${rest}.`
        : `Yes, ${when} is a public holiday across Spain except ${inList(except, L)}: ${rest}.`;
    }
    case "some":
      return ca
        ? `Sí, ${when} és festiu ${whereSentence(day.regions, L)}. A la resta d'Espanya és laborable.`
        : `Yes, ${when} is a public holiday ${whereSentence(day.regions, L)}. In the rest of Spain it is a working day.`;
    case "one": {
      const r = day.regions[0]!;
      const local = day.holders[0]!.basis === "local";
      return ca
        ? `No, excepte ${caIn(regionName(r, L))}: ${when} ${local ? "és festa local a tots els seus municipis" : "només és festiu allà"}. A la resta d'Espanya és laborable.`
        : `No, except in ${regionName(r, L)}: ${when} ${local ? "is a local holiday in every one of its municipalities" : "is a public holiday there only"}. In the rest of Spain it is a working day.`;
    }
  }
}

/** Notes under the answer: a substitution, a decree's move from a Sunday, island days. */
export function dayNotesIntl(day: SpainDay, L: IntlLocale): string[] {
  const ca = L === "ca";
  const notes: string[] = [];
  const subs = day.holders.filter((h) => h.replaces);
  if (subs.length) {
    const wd = weekdayDateIntl(subs[0]!.replaces!, L);
    const who = cap(regionList(subs.map((h) => h.region), L));
    notes.push(
      ca
        ? `És el trasllat de l'Assumpció, que el ${YEAR} cau en ${wd}: ${who} ${subs.length === 1 ? "el passa" : "el passen"} a aquest dia.`
        : `It stands in for the Assumption, which falls on ${wd} in ${YEAR}: ${who} ${subs.length === 1 ? "moves" : "move"} it to this day.`,
    );
  }
  for (const h of day.holders.filter((x) => x.movedFrom)) {
    const wd = weekdayDateIntl(h.movedFrom!, L);
    notes.push(
      ca
        ? `${cap(regionName(h.region, L))} hi trasllada la seva festa del ${wd}, segons el seu propi decret.`
        : `${cap(regionName(h.region, L))} moves its holiday of ${wd} to this day, under its own decree.`,
    );
  }
  if (day.islands.length) {
    const list = joinList(
      day.islands.map((i) => `${island(i.place, L)} (${holidayName(i.name, L)})`),
      L,
    );
    notes.push(
      ca
        ? `A Canàries, a més, és festa insular a ${list}, segons la nota 1 del BOE; no a la resta d'illes.`
        : `In the Canary Islands it is also an island holiday on ${list}, under note 1 of the BOE; not on the other islands.`,
    );
  }
  return notes;
}

/** «San José» (Sant Josep): the BOE's name, then ours when it differs. */
function boeAndOurs(name: string, L: IntlLocale): string {
  const ours = holidayName(name, L);
  return ours === name ? `«${name}»` : `«${name}» (${ours})`;
}

/** What it celebrates, with the BOE's own name. */
export function celebrateLineIntl(day: SpainDay, L: IntlLocale): string {
  const ca = L === "ca";
  if (day.moved) {
    const to = joinList(
      day.moved.to.map((t) => `${boeAndOurs(t.name, L)}${ca ? ", el" : " on"} ${weekdayDateIntl(t.date, L)}`),
      L,
    );
    return ca
      ? `És l'Assumpció de la Mare de Déu. El ${YEAR} cau en diumenge, i la relació del BOE la substitueix per ${to}.`
      : `It is the Assumption of the Virgin Mary. In ${YEAR} it falls on a Sunday, and the BOE list replaces it with ${to}.`;
  }
  const boe = day.holders.filter((h) => h.basis === "boe");
  const local = day.holders.filter((h) => h.basis === "local");
  const sentences: string[] = [];
  const boeNames = distinctNames(boe);
  if (boeNames.length === 1) {
    sentences.push(ca ? `Al BOE, aquesta festa es diu ${boeAndOurs(boeNames[0]!, L)}.` : `In the BOE, this holiday is called ${boeAndOurs(boeNames[0]!, L)}.`);
  } else if (boeNames.length > 1) {
    const each = boeNames.map((n) => `${boeAndOurs(n, L)} ${inList(boe.filter((h) => h.name === n).map((h) => h.region), L)}`);
    sentences.push(ca ? `Al BOE es diu ${joinList(each, L)}.` : `In the BOE it is called ${joinList(each, L)}.`);
  }
  for (const h of local) {
    const place = regionName(h.region, L);
    const what = isCity(h.region)
      ? ca
        ? `una de les 2 festes locals de ${place}`
        : `one of ${place}'s 2 local holidays`
      : ca
        ? `la festa local comuna a tots els municipis de ${place}`
        : `the local holiday shared by every municipality in ${place}`;
    const lead = boe.length ? (ca ? "És, a més," : "It is also") : ca ? "És" : "It is";
    sentences.push(`${lead} ${what}: ${holidayName(h.name, L)} («${h.name}»).`);
  }
  return sentences.join(" ");
}

export function whereQuestionIntl(day: SpainDay, L: IntlLocale): string {
  const the = theDayIntl(day.date, L);
  if (L === "ca") return day.moved ? `On es passa a un altre dia ${the}?` : `On és festiu ${the}?`;
  return day.moved ? `Where is ${the} moved to another day?` : `Where is ${the} a public holiday?`;
}

export function whereSummaryIntl(day: SpainDay, L: IntlLocale): string {
  const ca = L === "ca";
  if (day.moved) return `${cap(movedWords(day, L))}. ${ca ? "A la resta d'Espanya no es trasllada." : "In the rest of Spain it is not moved."}`;
  if (day.national) return ca ? "A tot Espanya: a les 17 comunitats autònomes i a Ceuta i Melilla." : "Across Spain: in all 17 autonomous communities and in Ceuta and Melilla.";
  const on = territoryCountIntl(day.regions, L);
  const off = territoryCountIntl(workingInIntl(day), L);
  return ca
    ? `Festiu a ${on}; laborable a ${off}, excepte als municipis que el tinguin com a festa local (cada municipi en té fins a 2).`
    : `A public holiday in ${on}; a working day in ${off}, except in municipalities that have it as a local holiday (each has up to 2).`;
}

export function whereAnswerIntl(day: SpainDay, L: IntlLocale): string {
  const ca = L === "ca";
  if (day.moved) return `${cap(movedWords(day, L))}. ${ca ? `No es trasllada ${inList(notMoved(day), L)}.` : `It is not moved ${inList(notMoved(day), L)}.`}`;
  if (day.national) return whereSummaryIntl(day, L);
  const on = cap(regionList(day.regions, L));
  const off = cap(regionList(workingInIntl(day), L));
  return `${whereSummaryIntl(day, L)} ${ca ? `Festiu: ${on}. Laborable: ${off}.` : `Holiday: ${on}. Working day: ${off}.`}`;
}

export function computedNote(L: IntlLocale): string {
  return L === "ca"
    ? "Càlcul de CatalunyaInfo sobre els festius del BOE (i, a Ceuta, Melilla i Navarra, les seves festes locals comunes), per a una setmana de dilluns a divendres; no inclou les festes locals de cada municipi."
    : "CatalunyaInfo's count from the BOE's holidays (and, in Ceuta, Melilla and Navarre, their shared local days), for a Monday-to-Friday week; it leaves out each municipality's own local holidays.";
}

/** One sentence per long weekend: "A Galícia, …, del divendres 19 al diumenge 21 de març: 3 dies sense vacances". */
export function runSentencesIntl(day: SpainDay, L: IntlLocale): string[] {
  return dayRuns(day).map((g) => {
    const where = whereWordsIntl(g.regions, L);
    const line = runLineIntl(g.run, L);
    return L === "ca" ? `${cap(caIn(where))}, ${line.charAt(0).toLowerCase()}${line.slice(1)}` : `In ${where}, ${line}`;
  });
}

export function bridgeLeadIntl(day: SpainDay, L: IntlLocale): string {
  const runs = dayRuns(day);
  const ca = L === "ca";
  if (runs.length === 0) {
    const wd = weekdayName(day.date, L);
    return ca ? `No: cau en ${wd} i no afegeix cap dia lliure a una setmana de dilluns a divendres.` : `No: it falls on a ${wd} and adds no day off to a Monday-to-Friday week.`;
  }
  // One run, or several in the same territories (Navarra's 3 December: 4 days, or 6 with one day of leave).
  if (runs.length === 1 || runs.every((g) => g.regions.join() === runs[0]!.regions.join())) return ca ? "Sí." : "Yes.";
  return ca ? "Sí, segons la comunitat." : "Yes, depending on the region.";
}

export function bridgeAnswerIntl(day: SpainDay, L: IntlLocale): string {
  const runs = runSentencesIntl(day, L);
  return runs.length === 0 ? bridgeLeadIntl(day, L) : `${bridgeLeadIntl(day, L)} ${runs.join(". ")}. ${computedNote(L)}`;
}

/** Last year's table, when it differs. */
export function change2026LineIntl(day: SpainDay, L: IntlLocale): string | null {
  const c = change2026(day);
  if (!c) return null;
  const ca = L === "ca";
  const feast = feastName(day.date, L);
  const then = feast
    ? ca
      ? `el ${feast} (${weekdayDateIntl(c.date2026, L)})`
      : `${feast} (${weekdayDateIntl(c.date2026, L)})`
    : ca
      ? `${caDayArticle(c.date2026)}${dayMonth(c.date2026, "ca")}`
      : dayMonth(c.date2026, "en");
  const ref = BOE_2026.ref.split(",")[0];
  const parts = ca
    ? [
        ...(c.gained.length ? [`s'hi ${c.gained.length === 1 ? "suma" : "sumen"} ${regionList(c.gained, L)}`] : []),
        ...(c.lost.length ? [`deixa de ser-ho ${inList(c.lost, L)}`] : []),
      ]
    : [
        ...(c.gained.length ? [`${regionList(c.gained, L)} ${c.gained.length === 1 ? "is" : "are"} added`] : []),
        ...(c.lost.length ? [`it is no longer one ${inList(c.lost, L)}`] : []),
      ];
  return ca
    ? `El 2026, ${then} va ser festiu ${inList(c.regions2026, L)}, segons el BOE d'aquell any (${ref}). El ${YEAR} ${joinList(parts, L)}.`
    : `In 2026, ${then} was a public holiday ${inList(c.regions2026, L)}, according to that year's BOE (${ref}). In ${YEAR} ${joinList(parts, L)}.`;
}

/** The page's sections after the answer, each a question. */
export function daySectionsIntl(day: SpainDay, L: IntlLocale): DaySection[] {
  const ca = L === "ca";
  const the = theDayIntl(day.date, L);
  const celebrate = celebrateLineIntl(day, L);
  const sections: DaySection[] = [
    { id: "donde", question: whereQuestionIntl(day, L), answer: whereAnswerIntl(day, L), printed: whereSummaryIntl(day, L) },
    {
      id: "puente",
      question: ca ? `Hi ha pont ${the}?` : `Is there a long weekend around ${the}?`,
      answer: bridgeAnswerIntl(day, L),
      printed: bridgeLeadIntl(day, L),
    },
    { id: "que-se-celebra", question: ca ? `Què se celebra ${the}?` : `What is celebrated on ${the}?`, answer: celebrate, printed: celebrate },
  ];
  if (isWeekend(day.date) && day.regions.length > 0) {
    sections.push({ id: "sabado", question: saturdayQuestion(L), answer: saturdayAnswer(L), printed: saturdayAnswer(L) });
  }
  const change = change2026LineIntl(day, L);
  if (change) {
    const feast = feastName(day.date, L);
    const last = feast ? (ca ? `el ${feast}` : feast) : ca ? `${caDayArticle(day.date)}${dayMonth(day.date, "ca")}` : dayMonth(day.date, "en");
    sections.push({ id: "en-2026", question: ca ? `Va ser festiu ${last} el 2026?` : `Was ${last} a public holiday in 2026?`, answer: change, printed: change });
  }
  return sections;
}

export function dayFaqIntl(day: SpainDay, L: IntlLocale): Faq[] {
  return [
    { question: dayQuestionIntl(day.date, L), answer: [dayLeadIntl(day, L), ...dayNotesIntl(day, L)].join(" ") },
    ...daySectionsIntl(day, L).map(({ question, answer }) => ({ question, answer })),
  ];
}

/** "Del sábado 9 al martes 12 de octubre: 4 días…", short, for descriptions. */
function runShort(run: Pick<Plan, "from" | "to" | "days" | "take">, L: IntlLocale): string {
  const ca = L === "ca";
  const take = joinList(run.take.map((t) => `${ca ? "el " : ""}${weekdayName(t, L)} ${Number(t.slice(8, 10))}`), L);
  const leave = run.take.length === 0 ? (ca ? "sense vacances" : "without leave") : ca ? `demanant ${take}` : `taking ${take} off`;
  return `${cap(rangeWordsIntl(run.from, run.to, L))}: ${run.days} ${ca ? "dies" : "days"} ${leave}.`;
}

/** Up to 165 characters: the answer with the names, shortened until it fits. */
export function dayDescriptionIntl(day: SpainDay, L: IntlLocale): string {
  const ca = L === "ca";
  const when = theWeekdayDate(day.date, L);
  const names = distinctNames(day.holders);
  const named = names.length === 1 && !day.holders[0]!.replaces ? ` (${holidayName(names[0]!, L)})` : "";
  const runs = dayRuns(day);
  const rest = ca ? "A la resta d'Espanya és laborable." : "In the rest of Spain it is a working day.";
  const candidates: string[] = [];
  switch (shape(day)) {
    case "national": {
      const yes = ca ? `Sí: ${when}${named} és festiu a tot Espanya` : `Yes: ${when}${named} is a public holiday across Spain`;
      const everywhere = runs.find((g) => g.regions.length === REGIONS.length);
      if (isWeekend(day.date)) {
        const wd = weekdayName(day.date, L);
        candidates.push(ca ? `${yes}. Cau en ${wd} i no es trasllada: es compensa?` : `${yes}. It falls on a ${wd} and is not moved: is it made up for?`);
      }
      if (everywhere) candidates.push(`${yes}. ${runShort(everywhere.run, L)}`);
      if (runs.length > 0) candidates.push(ca ? `${yes}. Quin pont fa a cada comunitat.` : `${yes}. The long weekend it makes in each region.`);
      candidates.push(`${yes}.`);
      break;
    }
    case "moved": {
      const date = dayMonthYear(day.date, L);
      candidates.push(
        ca
          ? `No: el ${date} cau en diumenge. ${cap(movedWords(day, L, false))}. A la resta, no es trasllada.`
          : `No: ${date} falls on a Sunday. ${cap(movedWords(day, L, false))}. Elsewhere it is not moved.`,
      );
      candidates.push(ca ? `No: el ${date} cau en diumenge. On es passa a dilluns, segons el BOE.` : `No: ${date} falls on a Sunday. Where it moves to a Monday, according to the BOE.`);
      break;
    }
    case "most": {
      const except = regionList(REGIONS.filter((r) => !day.regions.includes(r)), L);
      const base = ca ? `Sí: ${when}${named} és festiu a tot Espanya excepte ${caIn(except)}.` : `Yes: ${when}${named} is a public holiday across Spain except in ${except}.`;
      candidates.push(`${base} ${ca ? "Quin pont fa, i on." : "The long weekend it makes, and where."}`);
      candidates.push(base);
      break;
    }
    case "some": {
      const where = inList(day.regions, L);
      const base = ca ? `Sí: ${when}${named} és festiu ${where}. ${rest}` : `Yes: ${when}${named} is a public holiday ${where}. ${rest}`;
      candidates.push(`${base} ${ca ? "Quin pont fa, i on." : "The long weekend it makes, and where."}`);
      candidates.push(base);
      candidates.push(ca ? `Sí: ${when} és festiu ${where}. A la resta, laborable.` : `Yes: ${when} is a holiday ${where}. Elsewhere, a working day.`);
      // Too many names to fit: the count, and the page has the list.
      const count = territoryCountIntl(day.regions, L);
      candidates.push(ca ? `Sí: ${when} és festiu a ${count}. ${rest} Quines són, i quin pont fa.` : `Yes: ${when} is a public holiday in ${count}. ${rest} Which ones, and the long weekend.`);
      break;
    }
    case "one": {
      const r = regionName(day.regions[0]!, L);
      const there = ca ? `No, excepte ${caIn(r)}` : `No, except in ${r}`;
      candidates.push(ca ? `${there}: ${when}${named} només és festiu allà. ${rest}` : `${there}: ${when}${named} is a holiday there only. ${rest}`);
      candidates.push(ca ? `${there}: ${when} només és festiu allà. ${rest}` : `${there}: ${when} is a holiday there only. ${rest}`);
      break;
    }
  }
  return candidates.find((c) => c.length <= DESCRIPTION_LIMIT) ?? candidates.at(-1)!;
}

/** The link text the Catalan date pages (Catalan and English editions) use for the Spain page. */
export function restOfSpainLabelIntl(iso: string, L: IntlLocale): string {
  return L === "ca" ? `On és festiu ${theDayIntl(iso, L)} a Espanya, comunitat per comunitat` : `Where ${theDayIntl(iso, L)} is a public holiday in Spain, region by region`;
}
