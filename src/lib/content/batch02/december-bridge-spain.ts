import type { Block } from "@/lib/content/blocks";
import { WEEKDAY_NAMES, addDays, daysBetween, shortDate, weekdayIndex } from "@/lib/content/holidays/calendar";
import type { Locale } from "@/lib/i18n/config";
import { BOE_2026, REGION_WIDE_LOCAL, boeRegionsOn2026 } from "@/lib/programmatic/holidays/boe-2026";
import { BOE_2027, REGIONS, REGION_NAME, boeRegionsOn, type Region } from "@/lib/programmatic/holidays/boe-2027";
import { joinList } from "@/lib/programmatic/holidays/names";
import { COMMUNITIES_AZ, names } from "@/lib/programmatic/spain-2027/communities";
import { communityPath, spainBridgesPath, spainHubPath } from "@/lib/programmatic/spain-2027/paths";

import { LOCAL_MONDAY_7, runWords, type Run } from "./december-bridge";
import { SHOPS } from "./shops";
import { trafficBlocks, trafficSources } from "./traffic-dec-2026";
import { b2Related, b2link, callout, faq, h2, keyFacts, lead, paras, table, verifiedLine, type B2Article, type B2Source } from "./shared";

/**
 * "Puente de diciembre 2026" for the whole of Spain: where Monday 7 December
 * is a holiday, Christmas and Epiphany community by community, and how many
 * days off each bridge gives for how many days of leave (6 Nov 2026).
 *
 * Why a Spain-wide page: the site's biggest spikes came from Spain-wide
 * searches with no place name, and holiday demand in Spain is about 6.7 times
 * Catalonia's (research_notes/x10, growth formula of 5 Nov 2026). Searches
 * ramp from early November and peak 4-8 December.
 *
 * Every cell comes from the two national lists in the BOE, re-read on
 * 6 Nov 2026 from the BOE's own HTML table:
 *
 *  - BOE-A-2025-21667 (BOE 259, 28.10.2025), the 2026 list
 *    (`holidays/boe-2026.ts`, held to tests/fixtures/holidays/boe-a-2025-21667.txt):
 *    "7 Lunes siguiente al Día de la Constitución Española" is marked for
 *    Andalucía, Aragón, Asturias, Cantabria, Castilla y León, Extremadura,
 *    Madrid, Murcia, La Rioja and Melilla; 8 and 25 December for all
 *    nineteen; "26 San Esteban" for Illes Balears and Cataluña, with the
 *    BOE's note that Aran swaps it for 17 June. No 24 or 31 December row.
 *  - BOE-A-2026-21254 (BOE 254, 13.10.2026), the 2027 list
 *    (`holidays/boe-2027.ts`): 1 January ("*") and 6 January ("**", none
 *    swapped it) for all nineteen; 6 and 8 December 2027 for all nineteen.
 *
 * No community had changed any of these days by decree: no correction in the
 * BOE, nothing in a regional bulletin (see boe-2026.ts for what was read).
 * The one day the BOE cannot show is Navarra's 3 December (San Francisco
 * Javier), a local holiday common to every Navarrese town (Resolución
 * 390/2025, BON 129, 30.6.2025): the page names it beside the table and
 * counts it in Navarra's bridge.
 *
 * Nothing on this page is typed twice: the table, the region lists, the runs
 * of days off and the leave days are computed from those rows. A test fails
 * after SPAIN_BRIDGE_EXPIRES, so the page is retired or rewritten for
 * December 2027 rather than left answering last season's question.
 *
 * Photo: the Catalan December bridge page's (the shops guide's second
 * picture), with its alt and caption, since media rows are keyed by file.
 */

export const SPAIN_BRIDGE_VERIFIED = "2026-11-06";
/** The last day the page answers a live question (the weekend after Reyes). */
export const SPAIN_BRIDGE_EXPIRES = "2027-01-09";

export const SPAIN_DAYS = {
  navarra: "2026-12-03",
  saturday: "2026-12-05",
  constitution: "2026-12-06",
  monday: "2026-12-07",
  immaculada: "2026-12-08",
  christmasEve: "2026-12-24",
  christmas: "2026-12-25",
  stStephen: "2026-12-26",
  newYearsEve: "2026-12-31",
  newYear: "2027-01-01",
  epiphany: "2027-01-06",
} as const;

/** The table's six days, in its order. */
export const COLUMN_DAYS = [SPAIN_DAYS.monday, SPAIN_DAYS.immaculada, SPAIN_DAYS.christmas, SPAIN_DAYS.stStephen, SPAIN_DAYS.newYear, SPAIN_DAYS.epiphany] as const;

/** December 2027, for the one sentence about next year. */
export const NEXT_DECEMBER = { constitution: "2027-12-06", tuesday: "2027-12-07", immaculada: "2027-12-08" } as const;

/* -------------------------------------------------------------------------- */
/* Which day is a holiday where                                               */
/* -------------------------------------------------------------------------- */

/** A community holiday in the BOE list of that year, or Navarra's common local day. */
export function isHolidayIn(region: Region, iso: string): boolean {
  if (iso.startsWith("2026-")) return boeRegionsOn2026(iso).includes(region) || REGION_WIDE_LOCAL.some((d) => d.region === region && d.date === iso);
  if (iso.startsWith("2027-")) return boeRegionsOn(iso).includes(region);
  throw new Error(`december bridge spain: no holiday list for ${iso}`);
}

/** Where a day is a holiday, in the BOE's column order. */
export function regionsOn(iso: string): Region[] {
  return REGIONS.filter((r) => isHolidayIn(r, iso));
}

/** The nine communities and Melilla where Monday 7 December 2026 is a holiday. */
export const MONDAY_7: readonly Region[] = boeRegionsOn2026(SPAIN_DAYS.monday);
export const MONDAY_7_WORKING: readonly Region[] = REGIONS.filter((r) => !MONDAY_7.includes(r));

/** Off for a Monday-to-Friday worker in that community: weekend, holiday or booked leave. */
export function isOffIn(region: Region, iso: string, leave: readonly string[] = []): boolean {
  const weekday = weekdayIndex(iso);
  return weekday === 0 || weekday === 6 || isHolidayIn(region, iso) || leave.includes(iso);
}

/** The unbroken run of days off around `anchor` (which must itself be off). */
export function runIn(region: Region, anchor: string, leave: readonly string[] = []): Run {
  if (!isOffIn(region, anchor, leave)) throw new Error(`december bridge spain: ${anchor} is not a day off in ${region}`);
  let from = anchor;
  while (isOffIn(region, addDays(from, -1), leave)) from = addDays(from, -1);
  let to = anchor;
  while (isOffIn(region, addDays(to, 1), leave)) to = addDays(to, 1);
  return { from, to, days: daysBetween(from, to) + 1 };
}

/* -------------------------------------------------------------------------- */
/* Names                                                                      */
/* -------------------------------------------------------------------------- */

/** For the table and for short lists: "Madrid", "Baleares". */
const SHORT: Record<Locale, Record<Region, string>> = {
  es: Object.fromEntries(REGIONS.map((r) => [r, names(r).short])) as Record<Region, string>,
  ca: {
    AN: "Andalusia", AR: "Aragó", AS: "Astúries", IB: "Illes Balears", CN: "Canàries", CB: "Cantàbria", CM: "Castella-la Manxa", CL: "Castella i Lleó", CT: "Catalunya",
    EX: "Extremadura", GA: "Galícia", MD: "Madrid", MC: "Múrcia", NC: "Navarra", PV: "País Basc", RI: "La Rioja", VC: "Comunitat Valenciana", CE: "Ceuta", ML: "Melilla",
  },
  en: {
    AN: "Andalusia", AR: "Aragon", AS: "Asturias", IB: "Balearic Islands", CN: "Canary Islands", CB: "Cantabria", CM: "Castile-La Mancha", CL: "Castile and León", CT: "Catalonia",
    EX: "Extremadura", GA: "Galicia", MD: "Madrid", MC: "Murcia", NC: "Navarre", PV: "Basque Country", RI: "La Rioja", VC: "Valencian Community", CE: "Ceuta", ML: "Melilla",
  },
};

export function shortName(region: Region, locale: Locale): string {
  return SHORT[locale][region];
}

/** "Andalucía, Aragón, ... y Melilla", with the articles prose uses ("la Comunidad de Madrid"). */
export function proseList(regions: readonly Region[], locale: Locale): string {
  return joinList(regions.map((r) => REGION_NAME[r][locale]), locale);
}

function shortList(regions: readonly Region[], locale: Locale): string {
  // Catalan prose writes "la Rioja"; only the table's first column capitalises it.
  return joinList(regions.map((r) => (locale === "ca" && r === "RI" ? "la Rioja" : shortName(r, locale))), locale);
}

const cities = (regions: readonly Region[]) => regions.filter((r) => r === "CE" || r === "ML");
const communities = (regions: readonly Region[]) => regions.filter((r) => r !== "CE" && r !== "ML");

const NUMBER_WORDS: Record<Locale, string[]> = {
  es: ["ninguna", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"],
  ca: ["cap", "una", "dues", "tres", "quatre", "cinc", "sis", "set", "vuit", "nou", "deu"],
  en: ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
};

/** "nueve comunidades autónomas y Melilla" / "nou comunitats autònomes i Melilla" / "nine regions and Melilla". */
export function countWords(regions: readonly Region[], locale: Locale): string {
  const n = communities(regions).length;
  const word = NUMBER_WORDS[locale][n] ?? String(n);
  const noun = { es: "comunidades autónomas", ca: "comunitats autònomes", en: "regions" }[locale];
  const extra = cities(regions).map((r) => shortName(r, locale));
  return extra.length > 0 ? `${word} ${noun} ${{ es: "y", ca: "i", en: "and" }[locale]} ${joinList(extra, locale)}` : `${word} ${noun}`;
}

/** "toda España" or the list of places, for one day. */
function whereWords(iso: string, locale: Locale): string {
  const on = regionsOn(iso);
  if (on.length === REGIONS.length) return { es: "toda España", ca: "tot Espanya", en: "all of Spain" }[locale];
  return proseList(on, locale);
}

/* -------------------------------------------------------------------------- */
/* Words for days                                                             */
/* -------------------------------------------------------------------------- */

const wd = (iso: string, locale: Locale) => WEEKDAY_NAMES[locale][weekdayIndex(iso)] ?? "";
const dayNumber = (iso: string) => String(Number(iso.slice(8, 10)));
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
/** "de diciembre" / "de desembre" / "December". */
const monthWords = (iso: string, locale: Locale) => shortDate(iso, locale).replace(/^\d+ /, "");

/** "lunes 7 de diciembre" / "dilluns 7 de desembre" / "Monday 7 December". */
export function weekdayDate(iso: string, locale: Locale): string {
  return `${wd(iso, locale)} ${shortDate(iso, locale)}`;
}

/**
 * The leave days of a plan in words, the month said once after its last day:
 * "lunes 7 y del miércoles 9 al viernes 11 de diciembre".
 */
export function leaveWords(days: readonly string[], locale: Locale): string {
  if (days.length === 0) return { es: "Ninguno", ca: "Cap", en: "None" }[locale];
  const sorted = [...days].sort();
  const months: string[][] = [];
  for (const day of sorted) {
    const last = months[months.length - 1];
    if (last && last[0]!.slice(0, 7) === day.slice(0, 7)) last.push(day);
    else months.push([day]);
  }
  const and = { es: "y", ca: "i", en: "and" }[locale];
  const parts = months.map((month) => {
    const runs: string[][] = [];
    for (const day of month) {
      const last = runs[runs.length - 1];
      if (last && addDays(last[last.length - 1]!, 1) === day) last.push(day);
      else runs.push([day]);
    }
    const words = runs.map((r) => {
      const a = r[0]!;
      const b = r[r.length - 1]!;
      const one = (iso: string) => `${wd(iso, locale)} ${dayNumber(iso)}`;
      if (r.length === 1) return one(a);
      if (r.length === 2) return `${one(a)} ${and} ${one(b)}`;
      return locale === "en" ? `${one(a)} to ${one(b)}` : `del ${one(a)} al ${one(b)}`;
    });
    return `${joinList(words, locale)} ${monthWords(month[month.length - 1]!, locale)}`;
  });
  return `${sorted.length} (${parts.join(", ")})`;
}

/* -------------------------------------------------------------------------- */
/* The holiday table                                                          */
/* -------------------------------------------------------------------------- */

const ABBR: Record<Locale, { weekdays: string[]; months: Record<string, string> }> = {
  es: { weekdays: ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."], months: { "12": "dic.", "01": "ene." } },
  ca: { weekdays: ["Dg.", "Dl.", "Dt.", "Dc.", "Dj.", "Dv.", "Ds."], months: { "12": "des.", "01": "gen." } },
  en: { weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], months: { "12": "Dec", "01": "Jan" } },
};

/** "Lun. 7 dic." / "Vie. 1 ene. 2027": the weekday is computed, never typed. */
export function columnHeader(iso: string, locale: Locale): string {
  const a = ABBR[locale];
  const year = iso.startsWith("2027") ? " 2027" : "";
  return `${a.weekdays[weekdayIndex(iso)]} ${dayNumber(iso)} ${a.months[iso.slice(5, 7)]}${year}`;
}

const CELL: Record<Locale, { holiday: string; working: string; saturday: string; aran: string }> = {
  es: { holiday: "**Festivo**", working: "Laborable", saturday: "No festivo", aran: " (en Arán, no)" },
  ca: { holiday: "**Festiu**", working: "Feiner", saturday: "No festiu", aran: " (a l'Aran, no)" },
  en: { holiday: "**Holiday**", working: "Working day", saturday: "Not a holiday", aran: " (not in Aran)" },
};

export function cell(region: Region, iso: string, locale: Locale): string {
  const c = CELL[locale];
  if (isHolidayIn(region, iso)) return `${c.holiday}${region === "CT" && iso === SPAIN_DAYS.stStephen ? c.aran : ""}`;
  return weekdayIndex(iso) === 6 ? c.saturday : c.working;
}

export function holidayRows(locale: Locale): string[][] {
  return REGIONS.map((r) => [shortName(r, locale), ...COLUMN_DAYS.map((iso) => cell(r, iso, locale))]);
}

function holidayTable(locale: Locale): Block {
  const navarra = REGION_WIDE_LOCAL[0]!;
  const caption = {
    es: "Festivos del puente de diciembre, Navidad y Reyes por comunidad autónoma (2026-2027)",
    ca: "Festius del pont de desembre, Nadal i Reis per comunitat autònoma (2026-2027)",
    en: "December bridge, Christmas and Epiphany holidays by region (2026-2027)",
  }[locale];
  const first = { es: "Comunidad", ca: "Comunitat", en: "Region" }[locale];
  const note = {
    es: `Fuentes: BOE-A-2025-21667 (2026) y BOE-A-2026-21254 (2027). Cada municipio suma sus dos fiestas locales. En Navarra también es festivo el ${weekdayDate(navarra.date, "es")} (${navarra.name}, Resolución 390/2025, BON del 30 de junio de 2025).`,
    ca: `Fonts: BOE-A-2025-21667 (2026) i BOE-A-2026-21254 (2027). Cada municipi hi suma les seves dues festes locals. A Navarra també és festiu el ${weekdayDate(navarra.date, "ca")} (Sant Francesc Xavier, Resolución 390/2025, BON del 30 de juny de 2025).`,
    en: `Sources: BOE-A-2025-21667 (2026) and BOE-A-2026-21254 (2027). Each town adds its own two local holidays. In Navarre, ${weekdayDate(navarra.date, "en")} (St Francis Xavier) is a holiday too (Resolución 390/2025, BON, 30 June 2025).`,
  }[locale];
  return table(caption, [first, ...COLUMN_DAYS.map((iso) => columnHeader(iso, locale))], holidayRows(locale), note);
}

/* -------------------------------------------------------------------------- */
/* Bridges: days off for days of leave                                        */
/* -------------------------------------------------------------------------- */

export interface SpainOption {
  id: string;
  anchor: string;
  /** Leave to book where these days are working days; holidays drop out of it per community. */
  leave: string[];
  /** Only these communities (Navarra's own bridge); every one when absent. */
  regions?: Region[];
  label: Record<Locale, string>;
}

const range = (from: string, to: string): string[] => {
  const days: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return days;
};

export const SPAIN_OPTIONS: SpainOption[] = [
  { id: "bridge", anchor: SPAIN_DAYS.immaculada, leave: [SPAIN_DAYS.monday], label: { es: "Puente de diciembre", ca: "Pont de desembre", en: "December bridge" } },
  { id: "navarra", anchor: SPAIN_DAYS.immaculada, leave: ["2026-12-04", SPAIN_DAYS.monday], regions: ["NC"], label: { es: "Puente de diciembre en Navarra", ca: "Pont de desembre a Navarra", en: "December bridge in Navarre" } },
  { id: "bridgeWeek", anchor: SPAIN_DAYS.immaculada, leave: [SPAIN_DAYS.monday, ...range("2026-12-09", "2026-12-11")], label: { es: "Semana del puente", ca: "Setmana del pont", en: "Bridge week" } },
  { id: "christmas", anchor: SPAIN_DAYS.christmas, leave: [], label: { es: "Navidad", ca: "Nadal", en: "Christmas" } },
  { id: "christmasWeek", anchor: SPAIN_DAYS.christmas, leave: range("2026-12-21", "2026-12-24"), label: { es: "Semana de Navidad", ca: "Setmana de Nadal", en: "Christmas week" } },
  { id: "newYear", anchor: SPAIN_DAYS.newYear, leave: [], label: { es: "Año Nuevo", ca: "Cap d'Any", en: "New Year" } },
  { id: "christmasToNewYear", anchor: SPAIN_DAYS.christmas, leave: range("2026-12-28", "2026-12-31"), label: { es: "De Navidad a Año Nuevo", ca: "De Nadal a Cap d'Any", en: "Christmas to New Year" } },
  { id: "epiphany", anchor: SPAIN_DAYS.epiphany, leave: ["2027-01-04", "2027-01-05"], label: { es: "Puente de Reyes", ca: "Pont de Reis", en: "Epiphany bridge" } },
  { id: "epiphanyWeekend", anchor: SPAIN_DAYS.epiphany, leave: ["2027-01-07", "2027-01-08"], label: { es: "Reyes hasta el fin de semana", ca: "Reis fins al cap de setmana", en: "Epiphany to the weekend" } },
  {
    id: "all",
    anchor: SPAIN_DAYS.christmas,
    leave: [...range("2026-12-21", "2026-12-24"), ...range("2026-12-28", "2026-12-31"), "2027-01-04", "2027-01-05"],
    label: { es: "Las fiestas enteras", ca: "Totes les festes", en: "The whole holidays" },
  },
];

export interface OptionGroup {
  regions: Region[];
  leave: string[];
  run: Run;
}

/** One group per distinct result: the communities where the plan needs the same leave and gives the same run. */
export function optionGroups(option: SpainOption): OptionGroup[] {
  const groups = new Map<string, OptionGroup>();
  for (const region of option.regions ?? REGIONS) {
    const leave = option.leave.filter((d) => !isOffIn(region, d));
    const run = runIn(region, option.anchor, leave);
    const key = `${leave.join(",")}|${run.from}|${run.to}`;
    const group = groups.get(key);
    if (group) group.regions.push(region);
    else groups.set(key, { regions: [region], leave, run });
  }
  return [...groups.values()];
}

const sameSet = (a: readonly Region[], b: readonly Region[]) => a.length === b.length && a.every((r) => b.includes(r));

function groupWhere(regions: readonly Region[], locale: Locale): string {
  if (regions.length === REGIONS.length) return { es: "Toda España", ca: "Tot Espanya", en: "All of Spain" }[locale];
  if (sameSet(regions, MONDAY_7)) return { es: "Donde el lunes 7 es festivo", ca: "On el dilluns 7 és festiu", en: "Where Monday 7th is a holiday" }[locale];
  if (sameSet(regions, MONDAY_7_WORKING)) return { es: "Donde el lunes 7 es laborable", ca: "On el dilluns 7 és feiner", en: "Where Monday 7th is a working day" }[locale];
  return cap(shortList(regions, locale));
}

export function optionRows(locale: Locale): string[][] {
  const days = { es: "días", ca: "dies", en: "days" }[locale];
  return SPAIN_OPTIONS.flatMap((option) =>
    optionGroups(option).map((g) => [option.label[locale], groupWhere(g.regions, locale), leaveWords(g.leave, locale), `${g.run.days} ${days}`, cap(runWords(g.run, locale))]),
  );
}

function optionTable(locale: Locale): Block {
  const caption = { es: "Cuántos días seguidos de fiesta salen en cada puente", ca: "Quants dies seguits de festa surten a cada pont", en: "How many days off in a row each bridge gives" }[locale];
  const headers = {
    es: ["Puente", "Dónde", "Días que pides", "Fiesta seguida", "Fechas"],
    ca: ["Pont", "On", "Dies que demanes", "Festa seguida", "Dates"],
    en: ["Bridge", "Where", "Leave you book", "Days off in a row", "Dates"],
  }[locale];
  const note = {
    es: "Cálculo de CatalunyaInfo para quien trabaja de lunes a viernes, con los festivos de cada comunidad y sin fiestas locales. No sustituye el calendario de tu empresa ni tu convenio.",
    ca: "Càlcul de CatalunyaInfo per a qui treballa de dilluns a divendres, amb els festius de cada comunitat i sense festes locals. No substitueix el calendari de la teva empresa ni el teu conveni.",
    en: "CatalunyaInfo's calculation for a Monday-to-Friday week, with each region's holidays and no local ones. It does not replace your employer's calendar or your collective agreement.",
  }[locale];
  return table(caption, headers, optionRows(locale), note);
}

/** The single result of a plan that is the same everywhere (Christmas, Reyes). */
export function everywhere(id: string): OptionGroup {
  const option = SPAIN_OPTIONS.find((o) => o.id === id);
  const groups = option ? optionGroups(option) : [];
  if (groups.length !== 1 || groups[0]!.regions.length !== REGIONS.length) throw new Error(`december bridge spain: ${id} differs between communities`);
  return groups[0]!;
}

/** The result of a plan in one community. */
export function inRegion(id: string, region: Region): OptionGroup {
  const group = optionGroups(SPAIN_OPTIONS.find((o) => o.id === id)!).find((g) => g.regions.includes(region));
  if (!group) throw new Error(`december bridge spain: ${id} has no result for ${region}`);
  return group;
}

/** December 2027 in one sentence: both days are national, so one run for every community. */
export function nextDecemberRun(): Run {
  const runs = REGIONS.map((r) => runIn(r, NEXT_DECEMBER.immaculada, [NEXT_DECEMBER.tuesday]));
  if (runs.some((r) => r.from !== runs[0]!.from || r.to !== runs[0]!.to)) throw new Error("december bridge spain: December 2027 differs between communities");
  return runs[0]!;
}

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

const SOURCES: B2Source[] = [
  { name: BOE_2026.name, url: BOE_2026.url, publisher: "BOE" },
  { name: BOE_2027.name, url: BOE_2027.url, publisher: "BOE" },
  { name: "Real Decreto 2001/1983, de 28 de julio, sobre regulación de la jornada de trabajo, jornadas especiales y descansos (artículo 45)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1983-20906", publisher: "BOE" },
  REGION_WIDE_LOCAL[0]!.source,
  { name: "Acuerdo del Consejo de Gobierno de 19 de septiembre de 2025, relativo a calendario laboral para el año 2026 (BOME 6315, 3.10.2025)", url: "https://bomemelilla.es/bome/descargar/BOME-A-2025-1033.pdf", publisher: "Boletín Oficial de la Ciudad de Melilla" },
  { name: "Ordre EMT/66/2025, de 30 d'abril, calendari oficial de festes laborals a Catalunya per a l'any 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1013204&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Ordre EMT/208/2025, d'11 de desembre, calendari de festes locals a Catalunya per a l'any 2026", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1032232&type=01&language=ca_ES", publisher: "DOGC" },
];

/* -------------------------------------------------------------------------- */
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

function monday7Short(locale: Locale): string {
  return joinList(MONDAY_7.map((r) => (locale === "ca" && r === "RI" ? "la Rioja" : shortName(r, locale))), locale);
}

export const SPAIN_BRIDGE_META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  es: {
    path: "guias/puente-diciembre-espana",
    title: "Puente de diciembre 2026 en España: dónde es festivo el lunes 7, y Navidad y Reyes por comunidad",
    seoTitle: `Puente de diciembre 2026: lunes 7 festivo en ${communities(MONDAY_7).length} comunidades`,
    seoDescription: `El lunes 7 de diciembre de 2026 es festivo en ${monday7Short("es")}.`,
    excerpt: "Dónde es festivo el lunes 7 de diciembre de 2026, comunidad por comunidad, los festivos de Navidad y Reyes, y cuántos días hay que pedir para cada puente.",
  },
  ca: {
    path: "guies/pont-desembre-espanya",
    title: "Pont de desembre 2026 a Espanya: on és festiu el dilluns 7, i Nadal i Reis per comunitats",
    seoTitle: `Pont de desembre 2026: dilluns 7 festiu en ${communities(MONDAY_7).length} comunitats`,
    seoDescription: `El dilluns 7 de desembre de 2026 és festiu a ${monday7Short("ca")}.`,
    excerpt: "On és festiu el dilluns 7 de desembre de 2026, comunitat per comunitat, els festius de Nadal i Reis i quants dies cal demanar per a cada pont.",
  },
  en: {
    path: "guides/december-holidays-spain",
    title: "Is 7 December a public holiday in Spain? December 2026, Christmas and Epiphany by region",
    seoTitle: `Is 7 December 2026 a holiday in Spain? Yes, in ${communities(MONDAY_7).length} regions`,
    seoDescription: `Monday 7 December 2026 is a public holiday in ${monday7Short("en")}.`,
    excerpt: "Where Monday 7 December 2026 is a public holiday in Spain, region by region, the Christmas and Epiphany holidays, and how much leave each long weekend takes.",
  },
};

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["loteriaNadal", "decemberBridge", "workCalendar", "bridges2027", "holidayToday"] as const;

/** The 2027 pages of every community, for the Spanish edition (code routes, Spanish only). */
function communityLinks2027(): string {
  return COMMUNITIES_AZ.map((c) => `[${c.short}](${communityPath(c)})`).join(" · ");
}

function bodyEs(): Block[] {
  const L = "es" as const;
  const bridge = runIn("MD", SPAIN_DAYS.immaculada);
  const withMonday = inRegion("bridge", "CT");
  const week = inRegion("bridgeWeek", "MD");
  const weekOthers = inRegion("bridgeWeek", "CT");
  const navarra = inRegion("navarra", "NC");
  const christmas = everywhere("christmas");
  const newYear = everywhere("newYear");
  const reyes = everywhere("epiphany");
  const reyesWeekend = everywhere("epiphanyWeekend");
  const all = everywhere("all");
  const next = nextDecemberRun();
  const n7 = countWords(MONDAY_7, L);
  const stStephen = regionsOn(SPAIN_DAYS.stStephen);
  const local = LOCAL_MONDAY_7.municipalities;

  return [
    lead(
      `**El lunes 7 de diciembre de 2026 es festivo en ${n7}:** ${proseList(communities(MONDAY_7), L)}. Allí el puente va ${runWords(bridge, L)} sin pedir ningún día. En ${proseList(MONDAY_7_WORKING, L)}, el 7 es laborable y el único festivo del puente es el martes 8, la Inmaculada, que lo es en toda España.`,
    ),
    keyFacts("Diciembre de 2026 y Reyes de 2027, de un vistazo", [
      { label: "Lunes 7 de diciembre", value: `Festivo en ${n7}; laborable en el resto` },
      { label: "Martes 8 de diciembre", value: `Festivo en ${whereWords(SPAIN_DAYS.immaculada, L)} (Inmaculada Concepción)` },
      { label: "Domingo 6 de diciembre", value: "Día de la Constitución en domingo: donde se traslada, el festivo es el lunes 7" },
      { label: "Viernes 25 de diciembre", value: `Festivo en ${whereWords(SPAIN_DAYS.christmas, L)} (Navidad)` },
      { label: "Sábado 26 de diciembre", value: `Festivo solo en ${whereWords(SPAIN_DAYS.stStephen, L)} (San Esteban)` },
      { label: "24 y 31 de diciembre", value: "No son festivos en ninguna comunidad" },
      { label: "Viernes 1 de enero de 2027", value: `Festivo en ${whereWords(SPAIN_DAYS.newYear, L)} (Año Nuevo)` },
      { label: "Miércoles 6 de enero de 2027", value: `Festivo en ${whereWords(SPAIN_DAYS.epiphany, L)} (Reyes)` },
    ]),
    callout(
      "official",
      "De dónde salen estas fechas",
      "De la relación de fiestas laborales que el Ministerio de Trabajo publica cada año en el BOE con los calendarios que le envían las comunidades: la de 2026 (BOE del 28 de octubre de 2025) para diciembre y la de 2027 (BOE del 13 de octubre de 2026) para enero. Las hemos vuelto a leer el 6 de noviembre de 2026: ninguna tiene correcciones, y no hemos encontrado ningún decreto autonómico posterior que cambie estos días.",
    ),
    ...h2(
      "¿Es festivo el 7 de diciembre? Comunidad por comunidad",
      `El lunes 7 es el día que cambia de una comunidad a otra; el martes 8, el 25 de diciembre, el 1 y el 6 de enero son festivos en todas, y el sábado 26 solo en ${proseList(stStephen, L)}. Busca la tuya en la tabla:`,
    ),
    holidayTable(L),
    ...h2(
      "El 6 de diciembre cae en domingo: ¿se traslada al lunes?",
      `Solo en ${n7}. El Día de la Constitución es fiesta nacional, pero en 2026 cae en domingo, y la norma estatal (el artículo 45 del Real Decreto 2001/1983) deja que cada comunidad elija: dar fiesta el lunes siguiente o cambiar ese descanso por una fiesta propia en otra fecha del año.`,
      `${cap(proseList(MONDAY_7, L))} eligieron el lunes 7. ${cap(proseList(MONDAY_7_WORKING, L))} lo cambiaron por otro día de su calendario, así que allí el domingo 6 no se mueve y el lunes 7 se trabaja.`,
    ),
    ...h2(
      "Puente de diciembre 2026: cuántos días libres salen y cuántos hay que pedir",
      `Donde el lunes 7 es festivo, el puente sale solo: ${bridge.days} días, ${runWords(bridge, L)}, sin gastar vacaciones. Donde es laborable, cuesta ${withMonday.leave.length} día (el lunes 7) para tener los mismos ${withMonday.run.days}. Y quien quiera la semana entera, ${runWords(week.run, L)}, necesita ${week.leave.length} días de vacaciones donde el 7 es festivo y ${weekOthers.leave.length} donde no lo es.`,
      `Estas son todas las combinaciones de diciembre y enero para quien trabaja de lunes a viernes. Son cálculos nuestros, no un derecho: las vacaciones se piden y se pactan con la empresa, y los turnos y los convenios pueden cambiarlo todo.`,
    ),
    optionTable(L),
    ...paras(
      `**En Navarra** el puente empieza antes: el ${weekdayDate(SPAIN_DAYS.navarra, L)}, San Francisco Javier, es festivo en toda la comunidad, porque el Gobierno de Navarra lo fija como fiesta local común a todos los municipios (Resolución 390/2025, BON del 30 de junio de 2025). No sale en la lista del BOE, que solo recoge las fiestas de cada comunidad. Pidiendo el viernes 4 y el lunes 7, son ${navarra.run.days} días seguidos, ${runWords(navarra.run, L)}.`,
    ),
    ...h2(
      "Festivos de Navidad 2026: el 25 cae en viernes",
      `El viernes 25 de diciembre es festivo en ${whereWords(SPAIN_DAYS.christmas, L)}, así que el fin de semana de Navidad tiene ${christmas.run.days} días, ${runWords(christmas.run, L)}, sin pedir nada.`,
      `**¿Es festivo el 26 de diciembre?** Solo en ${proseList(stStephen, L)}, por San Esteban (en el Valle de Arán, no: allí lo cambian por el 17 de junio). En 2026 cae en sábado, de modo que solo cambia algo para quien trabaja los sábados, y no pasa al lunes 28: ninguna comunidad lo ha trasladado.`,
      "**¿Y el 24 y el 31?** Nochebuena y Nochevieja no son festivos en ninguna comunidad: no están en la relación oficial de fiestas laborales. Si los tienes libres, es por tu convenio o por tu empresa.",
    ),
    ...h2(
      "Año Nuevo y Reyes 2027: el 1 en viernes, el 6 en miércoles",
      `El viernes 1 de enero de 2027 es festivo en ${whereWords(SPAIN_DAYS.newYear, L)} y da otro fin de semana de ${newYear.run.days} días, ${runWords(newYear.run, L)}.`,
      `El miércoles 6 de enero, Epifanía del Señor, también es festivo en las 17 comunidades y en Ceuta y Melilla: ninguna lo ha cambiado por otra fiesta, según la relación de 2027 que publicó el BOE el 13 de octubre de 2026.`,
      `**Puente de Reyes 2027.** Al caer en miércoles, no hay puente sin pedir días. Pidiendo el lunes 4 y el martes 5 salen ${reyes.run.days} días seguidos, ${runWords(reyes.run, L)}; pidiendo el jueves 7 y el viernes 8 salen ${reyesWeekend.run.days} días, ${runWords(reyesWeekend.run, L)}. Y quien junte las dos semanas de Navidad con esos dos días tiene ${all.run.days} días seguidos, ${runWords(all.run, L)}, por ${all.leave.length} días de vacaciones.`,
    ),
    ...h2(
      "Si vives en Cataluña: el 7 se trabaja",
      `En Cataluña el lunes 7 es laborable, salvo en los ${local} municipios que lo tienen como fiesta local, y el único festivo del puente es el martes 8. A cambio, el sábado 26, Sant Esteve, sí es festivo. Lo explicamos con detalle, con colegios y tiendas, en ${b2link("decemberBridge", L, "el puente de diciembre en Cataluña")}.`,
      `Y si ya estás mirando el año que viene, los festivos de 2027 de cada comunidad, con sus puentes, están en [el calendario laboral 2027 por comunidades](${spainHubPath()}).`,
    ),
    ...trafficBlocks("spain", "es"),
    ...h2(
      "Las fiestas locales también cuentan",
      `A los festivos de la comunidad, cada municipio suma hasta dos fiestas locales, y algunos ponen una el lunes 7: en Cataluña, por ejemplo, lo hacen ${local} municipios aunque la comunidad no lo tenga. Las fiestas locales se publican en el boletín oficial de cada comunidad o en el de la provincia. Si tu ayuntamiento eligió el 7, en tu municipio también hay puente sin pedir días.`,
    ),
    ...h2(
      "¿Y en 2027?",
      `El año que viene el puente es para todos: en 2027 el 6 de diciembre cae en ${wd(NEXT_DECEMBER.constitution, L)} y el 8 en ${wd(NEXT_DECEMBER.immaculada, L)}, los dos festivos en toda España, y pidiendo el 7 salen ${next.days} días seguidos, del 4 al 8 de diciembre de 2027. Todos los puentes del año, comunidad por comunidad, están en [puentes 2027 en España](${spainBridgesPath()}).`,
      `Festivos de 2027 de cada comunidad: ${communityLinks2027()}.`,
    ),
    faq([
      {
        question: "¿Es festivo el 7 de diciembre de 2026?",
        answer: `Depende de la comunidad. Es festivo en ${proseList(MONDAY_7, L)}, que pasan al lunes el Día de la Constitución (domingo 6). En ${proseList(MONDAY_7_WORKING, L)} es laborable.`,
      },
      {
        question: "¿El 6 de diciembre de 2026 se traslada al lunes?",
        answer: `Solo en ${n7}. En el resto, el domingo 6 no se traslada: cada comunidad podía pasarlo al lunes o cambiarlo por una fiesta propia, y ${proseList(MONDAY_7_WORKING, L)} eligieron lo segundo.`,
      },
      { question: "¿Es festivo el 8 de diciembre de 2026?", answer: "Sí, en toda España. El martes 8, Inmaculada Concepción, es una fiesta nacional que ninguna comunidad puede cambiar." },
      {
        question: "¿Cuántos días hay que pedir para el puente de diciembre?",
        answer: `Donde el lunes 7 es festivo, ninguno: ${runWords(bridge, L)} son ${bridge.days} días. En el resto, uno, el lunes 7. En Navarra, pidiendo el viernes 4 y el lunes 7 salen ${navarra.run.days} días, ${runWords(navarra.run, L)}.`,
      },
      {
        question: "¿Qué días son festivos en diciembre de 2026?",
        answer: `En toda España, el martes 8 y el viernes 25. El lunes 7, en ${n7}; el sábado 26, en ${proseList(stStephen, L)}, y el jueves 3, en Navarra.`,
      },
      { question: "¿Es festivo el 26 de diciembre de 2026?", answer: `Solo en ${proseList(stStephen, L)} (en Arán, no). Cae en sábado y no se traslada al lunes.` },
      { question: "¿Son festivos el 24 y el 31 de diciembre?", answer: "No, en ninguna comunidad: no están en la relación oficial de fiestas laborales." },
      { question: "¿Es festivo el 6 de enero de 2027?", answer: "Sí, en toda España, y cae en miércoles." },
      {
        question: "¿Hay puente de Reyes en 2027?",
        answer: `Solo pidiendo días. Con el lunes 4 y el martes 5 libres salen ${reyes.run.days} días seguidos, ${runWords(reyes.run, L)}; con el jueves 7 y el viernes 8 salen ${reyesWeekend.run.days} días, ${runWords(reyesWeekend.run, L)}.`,
      },
      { question: "¿Es festivo el 7 de diciembre en Cataluña?", answer: `No: en Cataluña es laborable, salvo en ${local} municipios que lo tienen como fiesta local.` },
    ]),
    ...paras(verifiedLine(L, SPAIN_BRIDGE_VERIFIED)),
    ...b2Related([...RELATED], L),
  ];
}

function bodyCa(): Block[] {
  const L = "ca" as const;
  const bridge = runIn("MD", SPAIN_DAYS.immaculada);
  const navarra = inRegion("navarra", "NC");
  const reyes = everywhere("epiphany");
  const n7 = countWords(MONDAY_7, L);
  const stStephen = regionsOn(SPAIN_DAYS.stStephen);
  const local = LOCAL_MONDAY_7.municipalities;
  const next = nextDecemberRun();

  return [
    lead(
      `**El dilluns 7 de desembre de 2026 és festiu en ${n7}:** ${proseList(communities(MONDAY_7), L)}. Allà el pont va ${runWords(bridge, L)} sense demanar cap dia. A Catalunya, no: el 7 és feiner, llevat de ${local} municipis amb festa local, i el dimarts 8 és festiu a tot Espanya.`,
    ),
    ...h2(
      "On és festiu el 7 de desembre? Comunitat per comunitat",
      `El dilluns 7 és el dia que canvia d'una comunitat a una altra; el dimarts 8, el 25 de desembre, l'1 i el 6 de gener són festius a totes, i el dissabte 26 només a ${proseList(stStephen, L)}.`,
    ),
    holidayTable(L),
    ...h2(
      "Per què el 7 és festiu en unes comunitats i no en d'altres?",
      `El Dia de la Constitució, el 6 de desembre, cau en diumenge el 2026, i la norma estatal (l'article 45 del Reial decret 2001/1983) deixa que cada comunitat triï: fer festa el dilluns següent o canviar aquest descans per una festa pròpia en una altra data. ${cap(proseList(MONDAY_7, L))} van triar el dilluns 7; ${proseList(MONDAY_7_WORKING, L)}, no.`,
    ),
    ...h2(
      "Quants dies de festa surten i quants cal demanar",
      "Per a qui treballa de dilluns a divendres. És un càlcul nostre, no un dret: les vacances s'han de demanar i pactar amb l'empresa.",
    ),
    optionTable(L),
    ...paras(
      `A Navarra, el ${weekdayDate(SPAIN_DAYS.navarra, L)}, Sant Francesc Xavier, és festiu a tota la comunitat (festa local comuna a tots els municipis, Resolución 390/2025): demanant el divendres 4 i el dilluns 7, surten ${navarra.run.days} dies, ${runWords(navarra.run, L)}.`,
      `Per Reis, el 6 de gener de 2027 cau en dimecres i és festiu a tot Espanya: demanant el dilluns 4 i el dimarts 5 surten ${reyes.run.days} dies seguits, ${runWords(reyes.run, L)}.`,
    ),
    ...trafficBlocks("spain", "ca"),
    ...h2(
      "I a Catalunya?",
      `Aquí el pont només surt demanant el dilluns 7: l'únic festiu és el dimarts 8, i el dissabte 26, Sant Esteve, també és festiu (a l'Aran, no). Tot el detall, amb escoles i botigues, és a ${b2link("decemberBridge", L, "el pont de desembre a Catalunya")}.`,
      `El 2027 el pont és per a tothom: el 6 de desembre cau en ${wd(NEXT_DECEMBER.constitution, L)} i el 8 en ${wd(NEXT_DECEMBER.immaculada, L)}, i demanant el 7 surten ${next.days} dies seguits. Tots els ponts de l'any són a ${b2link("bridges2027", L, "ponts 2027 a Catalunya")}.`,
    ),
    faq([
      { question: "El 7 de desembre de 2026 és festiu?", answer: `Depèn de la comunitat: ho és a ${proseList(MONDAY_7, L)}. A Catalunya és feiner, llevat de ${local} municipis amb festa local.` },
      { question: "El 8 de desembre de 2026 és festiu a tot Espanya?", answer: "Sí. El dimarts 8, la Immaculada, és una festa nacional que cap comunitat no pot canviar." },
      { question: "El 26 de desembre de 2026 és festiu?", answer: `Només a ${proseList(stStephen, L)} (a l'Aran, no). Cau en dissabte i no es passa al dilluns.` },
      { question: "El 6 de gener de 2027 és festiu?", answer: "Sí, a tot Espanya, i cau en dimecres." },
    ]),
    ...paras(verifiedLine(L, SPAIN_BRIDGE_VERIFIED)),
    ...b2Related([...RELATED], L),
  ];
}

function bodyEn(): Block[] {
  const L = "en" as const;
  const bridge = runIn("MD", SPAIN_DAYS.immaculada);
  const withMonday = inRegion("bridge", "CT");
  const navarra = inRegion("navarra", "NC");
  const christmas = everywhere("christmas");
  const newYear = everywhere("newYear");
  const reyes = everywhere("epiphany");
  const reyesWeekend = everywhere("epiphanyWeekend");
  const n7 = countWords(MONDAY_7, L);
  const stStephen = regionsOn(SPAIN_DAYS.stStephen);
  const local = LOCAL_MONDAY_7.municipalities;
  const next = nextDecemberRun();

  return [
    lead(
      `**Monday 7 December 2026 is a public holiday in ${n7}:** ${proseList(communities(MONDAY_7), L)}. There the long weekend runs ${runWords(bridge, L)} without booking a day. In ${proseList(MONDAY_7_WORKING, L)}, the 7th is a working day and the only holiday that week is Tuesday the 8th, which is a holiday everywhere in Spain.`,
    ),
    keyFacts("December 2026 and Epiphany 2027 at a glance", [
      { label: "Monday 7 December", value: `Holiday in ${n7}; a working day elsewhere` },
      { label: "Tuesday 8 December", value: `Holiday in ${whereWords(SPAIN_DAYS.immaculada, L)} (Immaculate Conception)` },
      { label: "Friday 25 December", value: `Holiday in ${whereWords(SPAIN_DAYS.christmas, L)} (Christmas Day)` },
      { label: "Saturday 26 December", value: `Holiday only in ${whereWords(SPAIN_DAYS.stStephen, L)} (St Stephen's Day)` },
      { label: "24 and 31 December", value: "Not public holidays anywhere in Spain" },
      { label: "Friday 1 January 2027", value: `Holiday in ${whereWords(SPAIN_DAYS.newYear, L)} (New Year's Day)` },
      { label: "Wednesday 6 January 2027", value: `Holiday in ${whereWords(SPAIN_DAYS.epiphany, L)} (Epiphany, Reyes)` },
    ]),
    callout(
      "official",
      "Where these dates come from",
      "Spain's Ministry of Labour publishes each year's public holidays, region by region, in the BOE (the official state gazette): the 2026 list on 28 October 2025 and the 2027 list on 13 October 2026. We re-read both on 6 November 2026; neither has been corrected, and we found no later regional decree changing these days.",
    ),
    ...h2(
      "Is 7 December a holiday in Spain? Region by region",
      `Monday the 7th is the day that changes from one region to the next; Tuesday the 8th, Christmas Day, New Year's Day and Epiphany are holidays in all of them, and Saturday the 26th only in ${proseList(stStephen, L)}. Find yours in the table:`,
    ),
    holidayTable(L),
    ...h2(
      "Why is the 7th a holiday in some regions and not others?",
      `Constitution Day, 6 December, is a national holiday, but in 2026 it falls on a Sunday. Spanish law (article 45 of Royal Decree 2001/1983) lets each region choose: give the following Monday off, or swap that day for a holiday of its own on another date. ${cap(n7)} chose Monday the 7th; the rest swapped it, so there the Sunday is not moved and the 7th is a normal working day.`,
    ),
    ...h2(
      "How many days off, for how much leave",
      `Where Monday the 7th is a holiday, the long weekend comes free: ${bridge.days} days, ${runWords(bridge, L)}. Elsewhere it takes ${withMonday.leave.length} day of leave (Monday the 7th) to get the same ${withMonday.run.days}. These are all the December and January combinations for a Monday-to-Friday job; leave still has to be agreed with your employer.`,
    ),
    optionTable(L),
    ...paras(
      `**In Navarre** the break starts earlier: ${weekdayDate(SPAIN_DAYS.navarra, L)}, St Francis Xavier, is a holiday across the region, set by the Navarrese government as a local holiday common to every town (Resolución 390/2025). Taking Friday 4 and Monday 7 off gives ${navarra.run.days} days, ${runWords(navarra.run, L)}.`,
    ),
    ...h2(
      "Christmas, New Year and Epiphany",
      `Christmas Day is a Friday and a holiday everywhere, so Christmas weekend is ${christmas.run.days} days, ${runWords(christmas.run, L)}. **26 December** (St Stephen's Day) is a holiday only in ${proseList(stStephen, L)} (not in Aran), and as it falls on a Saturday it is not moved to the Monday. Christmas Eve and New Year's Eve are not public holidays anywhere in Spain.`,
      `New Year's Day 2027 is a Friday and a holiday everywhere: ${newYear.run.days} days, ${runWords(newYear.run, L)}. **Epiphany (6 January 2027)** is a Wednesday and a holiday in every region: no region swapped it, according to the 2027 list. Taking Monday 4 and Tuesday 5 off gives ${reyes.run.days} days in a row, ${runWords(reyes.run, L)}; taking Thursday 7 and Friday 8 off gives ${reyesWeekend.run.days} days, ${runWords(reyesWeekend.run, L)}.`,
    ),
    ...trafficBlocks("spain", "en"),
    ...h2(
      "Living in Catalonia?",
      `Monday the 7th is a working day in Catalonia, except in ${local} towns that have it as a local holiday, and the only bridge holiday is Tuesday the 8th; 26 December (Sant Esteve) is a holiday there. Schools and shops are covered in ${b2link("decemberBridge", L, "December 2026 public holidays in Catalonia")}.`,
      `Next year the bridge is for everyone: in 2027, 6 December is a ${wd(NEXT_DECEMBER.constitution, L)} and the 8th a ${wd(NEXT_DECEMBER.immaculada, L)}, both national holidays, so taking the 7th off gives ${next.days} days in a row. Catalonia's 2027 long weekends are in ${b2link("bridges2027", L, "long weekends 2027 in Catalonia")}.`,
    ),
    faq([
      { question: "Is 7 December 2026 a holiday in Spain?", answer: `Only in some regions: ${proseList(MONDAY_7, L)}, which moved Sunday's Constitution Day to the Monday. In ${proseList(MONDAY_7_WORKING, L)} it is a working day.` },
      { question: "Is 8 December 2026 a holiday in Spain?", answer: "Yes, everywhere. Tuesday 8 December, the Immaculate Conception, is a national holiday no region can swap." },
      { question: "Is 26 December a holiday in Spain?", answer: `Only in ${proseList(stStephen, L)} (not in Aran). In 2026 it is a Saturday and is not moved to the Monday.` },
      { question: "Are Christmas Eve and New Year's Eve holidays in Spain?", answer: "No. Neither is a public holiday in any region." },
      { question: "Is 6 January 2027 a holiday in Spain?", answer: `Yes, in every region, and it falls on a Wednesday. Taking Monday 4 and Tuesday 5 off gives ${reyes.run.days} days in a row, ${runWords(reyes.run, L)}.` },
    ]),
    ...paras(verifiedLine(L, SPAIN_BRIDGE_VERIFIED)),
    ...b2Related([...RELATED], L),
  ];
}

export function buildSpainBridgeBody(locale: Locale): Block[] {
  if (locale === "es") return bodyEs();
  if (locale === "ca") return bodyCa();
  return bodyEn();
}

export const DECEMBER_BRIDGE_SPAIN: B2Article = {
  key: "decemberBridgeSpain",
  entryKey: "guide-december-bridge-spain",
  categoryKey: "calendar",
  sources: [...SOURCES, ...trafficSources("spain")],
  // The Catalan December bridge page's photo (the shops guide's second
  // picture), same alt and caption: media rows are keyed by file.
  heroKey: SHOPS.secondaryKey,
  heroAlt: SHOPS.secondaryAlt,
  heroCaption: SHOPS.secondaryCaption,
  verifiedAt: SPAIN_BRIDGE_VERIFIED,
  publishedAt: "2026-11-06T18:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...SPAIN_BRIDGE_META[locale], blocks: buildSpainBridgeBody(locale) }]),
  ) as B2Article["editions"],
};
