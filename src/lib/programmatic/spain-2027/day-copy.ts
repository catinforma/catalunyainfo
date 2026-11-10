import type { Plan } from "@/lib/content/holidays/bridges";
import { saturdayAnswer, saturdayQuestion } from "@/lib/content/holidays/saturday";
import { BOE_2026 } from "@/lib/programmatic/holidays/boe-2026";
import { REGIONS, type Region } from "@/lib/programmatic/holidays/boe-2027";
import { dayMonth, dayMonthYear, weekdayName } from "@/lib/programmatic/holidays/format";
import { joinList } from "@/lib/programmatic/holidays/names";

import { YEAR } from "./calendar";
import { names } from "./communities";
import { DESCRIPTION_LIMIT, TITLE_LIMIT, rangeWords, runLine, territoryCount, weekdayDate, type Faq } from "./copy";
import { change2026, dayRuns, isCity, isWeekend, movableName, type DayHolder, type SpainDay } from "./days";

/**
 * Spanish words for the Spain-wide day pages (/es/festivos/2027/dia/…).
 * Every date, count and name comes from `days.ts` (the BOE table, the local
 * days in `sources.ts`); the only words typed here are the everyday names a
 * title uses for the national days, held by a test to the BOE rows.
 *
 * Titles follow the CTR lessons in docs/SEO_EXPERIMENTS.md (6 Nov 2026):
 * the question first, in the searchers' words; for a day that splits Spain,
 * the count of communities ("Sí, en 5 comunidades"), which promises the list
 * the snippet cannot hold, never the whole answer; for a national day, the
 * day's name (the date pages' rule).
 */

/** The everyday name of each national day, for titles (the BOE's own name is in the body). */
export const NATIONAL_TITLE_NAME: Record<string, string> = {
  "Año Nuevo": "Año Nuevo",
  "Epifanía del Señor": "Reyes",
  "Viernes Santo": "Viernes Santo",
  "Fiesta del Trabajo": "Día del Trabajo",
  "Fiesta Nacional de España": "Fiesta Nacional",
  "Todos los Santos": "Todos los Santos",
  "Día de la Constitución Española": "Constitución",
  "Inmaculada Concepción": "La Inmaculada",
  "Natividad del Señor": "Navidad",
};

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

const full = (r: Region) => names(r).full;
const short = (r: Region) => names(r).short;
/** The short name, with the article where the full one has it on the same words: "el País Vasco", "Cantabria". */
const shortThe = (r: Region) => (names(r).full === `el ${names(r).short}` ? names(r).full : names(r).short);

/** "Galicia, la Comunidad de Madrid y la Región de Murcia". */
export function fullList(regions: readonly Region[]): string {
  return joinList(regions.map(full), "es");
}

/** "Galicia, Madrid y Murcia". */
export function shortList(regions: readonly Region[]): string {
  return joinList(regions.map(short), "es");
}

/** "toda España", "toda España salvo Cataluña y Comunidad Valenciana", "Galicia, Madrid y Murcia". */
export function whereWords(regions: readonly Region[]): string {
  if (regions.length === REGIONS.length) return "toda España";
  if (regions.length >= 10) return `toda España salvo ${shortList(REGIONS.filter((r) => !regions.includes(r)))}`;
  return shortList(regions);
}

/** Splits a holiday into its four answers. */
export type DayShape = "national" | "moved" | "most" | "some" | "one";

export function dayShape(day: SpainDay): DayShape {
  if (day.moved) return "moved";
  if (day.national) return "national";
  if (day.regions.length >= 10) return "most";
  if (day.regions.length >= 2) return "some";
  return "one";
}

/** "el 19 de marzo de 2027", or the feast for the days that move with Easter: "el Jueves Santo de 2027". */
export function theDay(iso: string): string {
  const feast = movableName(iso);
  return feast ? `el ${feast} de ${YEAR}` : `el ${dayMonthYear(iso, "es")}`;
}

/** "¿Es festivo el 19 de marzo de 2027?", "¿Es festivo el Jueves Santo de 2027?". */
export function dayQuestion(iso: string): string {
  return `¿Es festivo ${theDay(iso)}?`;
}

/** The H1 and breadcrumb: the question, with the date for the feasts. */
export function dayH1(iso: string): string {
  const feast = movableName(iso);
  return feast ? `¿Es festivo el ${feast} de ${YEAR} (${dayMonth(iso, "es")})?` : dayQuestion(iso);
}

/** The BOE names of a day, once each, in the table's order. */
function distinctNames(holders: readonly DayHolder[]): string[] {
  return [...new Set(holders.map((h) => h.name))];
}

/** Communities and cities apart, for sentences. */
function split(regions: readonly Region[]): { communities: Region[]; cities: Region[] } {
  return { communities: regions.filter((r) => !isCity(r)), cities: regions.filter(isCity) };
}

/** What follows "¿Es festivo …?" in the title, best first; `null` means the question alone. */
function titleTails(day: SpainDay): string[] {
  const { communities, cities } = split(day.regions);
  switch (dayShape(day)) {
    case "national": {
      const name = NATIONAL_TITLE_NAME[day.holders[0]!.name];
      return name ? [name] : [];
    }
    case "moved":
      return ["Dónde pasa al lunes"];
    case "most":
      return [`Sí, salvo en ${territoryCount(REGIONS.filter((r) => !day.regions.includes(r)))}`];
    case "some": {
      const count = cities.length === 0 ? `${communities.length} comunidades` : `${territoryCount(day.regions)}`;
      return [`Sí, en ${count}`, "Dónde sí y dónde no"];
    }
    case "one":
      return ["Solo en una comunidad"];
  }
}

/**
 * `<title>`: "¿Es festivo el 19 de marzo de 2027? Sí, en 5 comunidades". The
 * first tail that fits in 60 characters, with "de 2027" or else " 2027"
 * (the searchers' own "31 de mayo 2027"); the question alone at worst.
 */
export function dayTitle(iso: string, day: SpainDay): string {
  // A national day's tail is its name: ask with the date ("¿Es festivo el 26 de marzo de 2027? Viernes Santo").
  const question = dayShape(day) === "national" ? `¿Es festivo el ${dayMonthYear(iso, "es")}?` : dayQuestion(iso);
  const plain = question.replace(` de ${YEAR}?`, ` ${YEAR}?`);
  const candidates = titleTails(day).flatMap((tail) => [`${question} ${tail}`, `${plain} ${tail}`]);
  return candidates.find((t) => t.length <= TITLE_LIMIT) ?? question;
}

/** The answer box's few words. */
export function dayVerdict(day: SpainDay): string {
  switch (dayShape(day)) {
    case "national":
      return isWeekend(day.date) ? `Sí, en ${weekdayName(day.date, "es")}` : "Sí";
    case "moved":
      return "Cae en domingo";
    case "most":
      return "Casi en toda España";
    case "some":
      return day.regions.length <= 3 ? `En ${shortList(day.regions)}` : `En ${territoryCount(day.regions)}`;
    case "one":
      return `Solo en ${shortThe(day.regions[0]!)}`;
  }
}

/** "el viernes 19 de marzo de 2027". */
function theWeekdayDate(iso: string): string {
  return `el ${weekdayDate(iso)} de ${YEAR}`;
}

/** "en 5 comunidades: Galicia, …", "en 2 comunidades (…) y en Melilla", "en Galicia, Ceuta y Melilla". */
function whereSentence(regions: readonly Region[]): string {
  const { communities, cities } = split(regions);
  if (communities.length >= 2 && cities.length === 0) return `en ${communities.length} comunidades: ${fullList(communities)}`;
  if (communities.length >= 2) return `en ${communities.length} comunidades (${fullList(communities)}) y en ${fullList(cities)}`;
  return `en ${fullList(regions)}`;
}

/** Where a moved Sunday went: "6 comunidades lo pasan al lunes 16 de agosto (…), y Extremadura, al lunes 11 de octubre". */
function movedWords(day: SpainDay, withNames = true): string {
  const parts = day.moved!.to.map((t) =>
    t.regions.length === 1
      ? `${names(t.regions[0]!).Full}, al ${weekdayDate(t.date)}`
      : `${territoryCount(t.regions)} lo pasan al ${weekdayDate(t.date)}${withNames ? ` (${shortList(t.regions)})` : ""}`,
  );
  // ", y" before the last part: each part has its own "y" inside.
  return parts.length < 2 ? (parts[0] ?? "") : `${parts.slice(0, -1).join(", ")}, y ${parts.at(-1)}`;
}

/** Where the moved Sunday stays a Sunday. */
function notMoved(day: SpainDay): Region[] {
  const moved = new Set(day.moved!.to.flatMap((t) => t.regions));
  return REGIONS.filter((r) => !moved.has(r));
}

/** The first line: the answer, in the H1's own terms. */
export function dayLead(day: SpainDay): string {
  const when = theWeekdayDate(day.date);
  const saturday = isWeekend(day.date);
  switch (dayShape(day)) {
    case "national":
      return saturday
        ? `Sí, ${when} es festivo en toda España, aunque cae en ${weekdayName(day.date, "es")} y no añade un día libre de lunes a viernes: la relación del BOE no lo pasa a otro día en ninguna comunidad.`
        : `Sí, ${when} es festivo en toda España: en las 17 comunidades autónomas y en Ceuta y Melilla.`;
    case "moved":
      return (
        `No: el ${dayMonthYear(day.date, "es")}, la Asunción de la Virgen, cae en domingo y no está en la relación de fiestas laborales del BOE. ` +
        `${capitalise(movedWords(day))}; en el resto de España (${territoryCount(notMoved(day))}) no se traslada.`
      );
    case "most": {
      const except = REGIONS.filter((r) => !day.regions.includes(r));
      const { communities, cities } = split(day.regions);
      const rest = cities.length ? `en ${communities.length} comunidades y en ${fullList(cities)}` : `en ${communities.length} comunidades`;
      return `Sí, ${when} es festivo en toda España salvo en ${fullList(except)}: ${rest}.`;
    }
    case "some":
      return `Sí, ${when} es festivo ${whereSentence(day.regions)}. En el resto de España es laborable.`;
    case "one": {
      const r = day.regions[0]!;
      const how = day.holders[0]!.basis === "local" ? `es fiesta local en todos sus municipios` : `solo es festivo allí`;
      return `No, salvo en ${full(r)}: ${when} ${how}. En el resto de España es laborable.`;
    }
  }
}

/** Notes under the answer: a substitution, a decree's move from a Sunday, island days. */
export function dayNotes(day: SpainDay): string[] {
  const notes: string[] = [];
  const subs = day.holders.filter((h) => h.replaces);
  if (subs.length) {
    notes.push(
      `Es el traslado de la Asunción de la Virgen, que en ${YEAR} cae en ${weekdayDate(subs[0]!.replaces!)}: ${fullList(subs.map((h) => h.region))} ${subs.length === 1 ? "lo pasa" : "lo pasan"} a este día.`,
    );
  }
  for (const h of day.holders.filter((x) => x.movedFrom)) {
    notes.push(`${names(h.region).Full} pasa a este día su fiesta del ${weekdayDate(h.movedFrom!)}, según su propio decreto.`);
  }
  if (day.islands.length) {
    notes.push(
      `En Canarias es además fiesta insular en ${joinList(
        day.islands.map((i) => `${i.place} (${i.name})`),
        "es",
      )}, según la nota 1 del BOE; no en el resto de las islas.`,
    );
  }
  return notes;
}

/** What it celebrates, in the BOE's own words. */
export function celebrateLine(day: SpainDay): string {
  if (day.moved) {
    return (
      `Es la Asunción de la Virgen. En ${YEAR} cae en domingo, y la relación del BOE la sustituye por ` +
      `${joinList(
        day.moved.to.map((t) => `«${t.name}» (${weekdayDate(t.date)})`),
        "es",
      )}.`
    );
  }
  const boe = day.holders.filter((h) => h.basis === "boe");
  const local = day.holders.filter((h) => h.basis === "local");
  const sentences: string[] = [];
  const boeNames = distinctNames(boe);
  if (boeNames.length === 1) sentences.push(`En el BOE, esta fiesta se llama «${boeNames[0]}».`);
  else if (boeNames.length > 1) {
    sentences.push(
      `En el BOE se llama ${joinList(
        boeNames.map((n) => `«${n}» en ${fullList(boe.filter((h) => h.name === n).map((h) => h.region))}`),
        "es",
      )}.`,
    );
  }
  for (const h of local) {
    const what = isCity(h.region) ? `una de las 2 fiestas locales de ${full(h.region)}` : `la fiesta local común a todos los municipios de ${full(h.region)}`;
    sentences.push(`${boe.length ? "Es además" : "Es"} ${what}: «${h.name}».`);
  }
  return sentences.join(" ");
}

/** The territories where the day is a working day (none for a national day). */
export function workingIn(day: SpainDay): Region[] {
  return REGIONS.filter((r) => !day.regions.includes(r));
}

/** The "where" section's heading: where it is a day off, or (15 August) where it moves. */
export function whereQuestion(day: SpainDay): string {
  return day.moved ? `¿Dónde se pasa a otro día ${theDay(day.date)}?` : `¿Dónde es festivo ${theDay(day.date)}?`;
}

/** The "where" section's first paragraph, above its lists (which name and link every territory). */
export function whereSummary(day: SpainDay): string {
  if (day.moved) return `${capitalise(movedWords(day))}. En el resto de España no se traslada.`;
  if (day.national) return `En toda España: en las 17 comunidades autónomas y en Ceuta y Melilla.`;
  return (
    `Festivo en ${territoryCount(day.regions)}; laborable en ${territoryCount(workingIn(day))}, ` +
    `salvo en los municipios que lo tengan como fiesta local (cada municipio tiene hasta 2).`
  );
}

/** The same in one paragraph for FAQPage: the summary, then the lists as printed. */
export function whereAnswer(day: SpainDay): string {
  if (day.moved) return `${capitalise(movedWords(day))}. No se traslada en ${shortList(notMoved(day))}.`;
  if (day.national) return whereSummary(day);
  return `${whereSummary(day)} Festivo: ${shortList(day.regions)}. Laborable: ${shortList(workingIn(day))}.`;
}

/** The long weekends, one sentence each: "En Galicia, Madrid…, del viernes 19 al domingo 21 de marzo: 3 días sin vacaciones". */
export function runSentences(day: SpainDay): string[] {
  return dayRuns(day).map((g) => `En ${whereWords(g.regions)}, ${lowerFirst(runLine(g.run))}`);
}

export const COMPUTED_NOTE =
  "Cálculo de CatalunyaInfo sobre los festivos del BOE (y, en Ceuta, Melilla y Navarra, sus fiestas locales comunes), para una semana de lunes a viernes; no incluye los festivos locales de cada municipio.";

/** The bridge section's first words, before its list. */
export function bridgeLead(day: SpainDay): string {
  const runs = dayRuns(day);
  if (runs.length === 0) {
    return `No: cae en ${weekdayName(day.date, "es")} y no añade ningún día libre a una semana de lunes a viernes.`;
  }
  return runs.length === 1 ? "Sí." : "Sí, según la comunidad.";
}

/** "¿Hay puente?": yes and where, or why not, in one paragraph (the FAQ's answer). */
export function bridgeAnswer(day: SpainDay): string {
  const runs = runSentences(day);
  return runs.length === 0 ? bridgeLead(day) : `${bridgeLead(day)} ${runs.join(". ")}. ${COMPUTED_NOTE}`;
}

/** Last year's table, when it differs: "En 2026, el 19 de marzo fue festivo en …; en 2027 se suma … y deja de serlo en …". */
export function change2026Line(day: SpainDay): string | null {
  const c = change2026(day);
  if (!c) return null;
  const feast = movableName(day.date);
  const then = feast ? `el ${feast} (${weekdayDate(c.date2026)})` : `el ${dayMonth(c.date2026, "es")}`;
  const parts = [
    ...(c.gained.length ? [`se ${c.gained.length === 1 ? "suma" : "suman"} ${fullList(c.gained)}`] : []),
    ...(c.lost.length ? [`deja de serlo en ${fullList(c.lost)}`] : []),
  ];
  return `En 2026, ${then} fue festivo en ${fullList(c.regions2026)}, según el BOE de ese año (${BOE_2026.ref.split(",")[0]}). En ${YEAR} ${joinList(parts, "es")}.`;
}

/** "Del sábado 9 al martes 12 de octubre: 4 días pidiendo el lunes 11." */
function runShort(run: Pick<Plan, "from" | "to" | "days" | "take">): string {
  const leave = run.take.length === 0 ? "sin vacaciones" : `pidiendo ${joinList(run.take.map((t) => `el ${weekdayName(t, "es")} ${Number(t.slice(8, 10))}`), "es")}`;
  return `${capitalise(rangeWords(run.from, run.to))}: ${run.days} días ${leave}.`;
}

/** "4 o 5 días": the lengths of a day's long weekends. */
function lengthsWords(day: SpainDay): string {
  const lengths = [...new Set(dayRuns(day).map((g) => g.run.days))].sort((a, b) => a - b);
  return `${joinList(lengths.map(String), "es").replace(/ y /, " o ")} días`;
}

/** Up to 165 characters: the answer with the names, shortened until it fits. */
export function dayDescription(day: SpainDay): string {
  const when = theWeekdayDate(day.date);
  const boeNames = distinctNames(day.holders);
  const named = boeNames.length === 1 && !day.holders[0]!.replaces ? ` (${boeNames[0]})` : "";
  const runs = dayRuns(day);
  const candidates: string[] = [];
  switch (dayShape(day)) {
    case "national": {
      const yes = `Sí: ${when}${named} es festivo en toda España`;
      const everywhere = runs.find((g) => g.regions.length === REGIONS.length);
      if (isWeekend(day.date)) candidates.push(`${yes}. Al caer en ${weekdayName(day.date, "es")}, no se pasa a otro día: ¿se compensa?`);
      if (everywhere) candidates.push(`${yes}. ${runShort(everywhere.run)}`);
      if (runs.length > 1 && runs.every((g) => g.run.take.length === 0)) candidates.push(`${yes}: ${lengthsWords(day)} seguidos, según la comunidad.`);
      if (runs.length > 0) candidates.push(`${yes}. Qué puente hace en cada comunidad.`);
      candidates.push(`${yes}.`);
      break;
    }
    case "moved": {
      candidates.push(`No: el ${dayMonthYear(day.date, "es")} cae en domingo. ${capitalise(movedWords(day, false))}. En el resto, no se traslada.`);
      candidates.push(`No: el ${dayMonthYear(day.date, "es")} cae en domingo. Dónde se pasa al ${joinList(day.moved!.to.map((t) => weekdayDate(t.date)), "es")}, según el BOE.`);
      break;
    }
    case "most": {
      const except = shortList(REGIONS.filter((r) => !day.regions.includes(r)));
      candidates.push(`Sí: ${when}${named} es festivo en toda España salvo ${except}. Puentes de ${lengthsWords(day)}, según la comunidad.`);
      candidates.push(`Sí: ${when}${named} es festivo en toda España salvo ${except}.`);
      break;
    }
    case "some": {
      const where = shortList(day.regions);
      candidates.push(`Sí: ${when}${named} es festivo en ${where}. En el resto de España es laborable. Qué puente hace, y dónde.`);
      candidates.push(`Sí: ${when}${named} es festivo en ${where}. En el resto de España es laborable.`);
      candidates.push(`Sí: ${when} es festivo en ${where}. En el resto, laborable.`);
      break;
    }
    case "one": {
      const there = shortThe(day.regions[0]!);
      candidates.push(`No, salvo en ${there}: ${when}${named} solo es festivo allí. En el resto de España es laborable.`);
      candidates.push(`No, salvo en ${there}: ${when} solo es festivo allí. En el resto de España es laborable.`);
      break;
    }
  }
  return candidates.find((c) => c.length <= DESCRIPTION_LIMIT) ?? candidates.at(-1)!;
}

export interface DaySection {
  id: string;
  /** The H2, asked as searchers ask it. */
  question: string;
  /** The answer in one paragraph, for FAQPage. */
  answer: string;
  /** The paragraph printed under the H2, when the page puts the rest in a list ("where", "bridge"). */
  printed: string;
}

/** The page's sections after the answer, each a question: the FAQ is these and the H1. */
export function daySections(day: SpainDay): DaySection[] {
  const the = theDay(day.date);
  const sections: DaySection[] = [
    { id: "donde", question: whereQuestion(day), answer: whereAnswer(day), printed: whereSummary(day) },
    { id: "puente", question: `¿Hay puente ${the}?`, answer: bridgeAnswer(day), printed: bridgeLead(day) },
    { id: "que-se-celebra", question: `¿Qué se celebra ${the}?`, answer: celebrateLine(day), printed: celebrateLine(day) },
  ];
  if (isWeekend(day.date) && day.regions.length > 0) {
    sections.push({ id: "sabado", question: saturdayQuestion("es"), answer: saturdayAnswer("es"), printed: saturdayAnswer("es") });
  }
  const change = change2026Line(day);
  if (change) sections.push({ id: "en-2026", question: `¿Fue festivo ${the.replace(` de ${YEAR}`, "")} en 2026?`, answer: change, printed: change });
  return sections;
}

/** The page's questions, as printed, for FAQPage: the H1's, then each section's. */
export function dayFaq(day: SpainDay): Faq[] {
  return [
    { question: dayQuestion(day.date), answer: [dayLead(day), ...dayNotes(day)].join(" ") },
    ...daySections(day).map(({ question, answer }) => ({ question, answer })),
  ];
}

/** The hub's line for a date: where, and the BOE's name. */
export function hubDayWords(day: SpainDay): string {
  if (day.moved) return `Se pasa al ${day.moved.to.map((t) => `${weekdayDate(t.date)} (${shortList(t.regions)})`).join(" o al ")}`;
  const where = whereWords(day.regions);
  const local = day.holders.filter((h) => h.basis === "local");
  const localWords = local.length ? `; fiesta local en ${shortList(local.map((h) => h.region))}` : "";
  return `${capitalise(where)} (${distinctNames(day.holders.filter((h) => h.basis === "boe")).join(" / ") || distinctNames(local).join(" / ")}${localWords})`;
}

/** The link text the Catalan date pages (Spanish edition) use: "¿Y en el resto de España?" → this. */
export function restOfSpainLabel(iso: string): string {
  return `Dónde es festivo ${theDay(iso)}, comunidad por comunidad`;
}
