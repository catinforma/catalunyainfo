import type { Block } from "@/lib/content/blocks";
import { link } from "@/lib/content/features/shared";
import { HOLIDAYS_BY_YEAR, addDays, holidayOn, shortDate, weekdayIndex, type Holiday } from "@/lib/content/holidays/calendar";
import { BARCELONA_LOCAL } from "@/lib/content/holidays/payload";
import { metroDay, metroLines } from "@/lib/content/metro/tonight";
import { SCHOOL_SOURCE, SCHOOL_YEARS } from "@/lib/content/school/calendar";
import type { Locale } from "@/lib/i18n/config";
import { councilLabel, displayName } from "@/lib/programmatic/holidays/copy";
import type { CouncilApproved } from "@/lib/programmatic/holidays/council-2027";
import { aranSwap, councilApproved2027, municipalities, nextYearFor, nextYearPublished } from "@/lib/programmatic/holidays/data";
import { hasEnglishPage } from "@/lib/programmatic/holidays/english";
import { dayPair } from "@/lib/programmatic/holidays/format";
import { joinList } from "@/lib/programmatic/holidays/names";
import { datePath, isDatePage, municipalityPath } from "@/lib/programmatic/holidays/paths";
import type { SnapshotMunicipality } from "@/lib/programmatic/holidays/types";

import { MONTSERRAT_FREE } from "./day-trips";
import { SIBLING_PATHS, runAround, runWords, type Run } from "./december-bridge";
import { dayDate, span } from "./festive";
import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";
import { OPENING_2027 } from "./shops";

/**
 * "Setmana Santa 2027 a Catalunya": which days are holidays, the school
 * Easter break, the council-approved local days next to it, shops, the metro,
 * the long weekends and the traditions with an official 2027 date.
 *
 * Every date is read from a shared module, never retyped here:
 *
 *  - Good Friday and Easter Monday: `HOLIDAYS_BY_YEAR[2027]` (Ordre
 *    EMT/52/2026, DOGC 1.4.2026; re-read on treball.gencat.cat on 31 Oct
 *    2026: "26 de març, divendres", "29 de març, dilluns"). The Thursday,
 *    Saturday and Sundays are the days either side. Aran's swap of 29 March
 *    for 17 June comes from `aranSwap(2027)`.
 *  - The school break: `SCHOOL_YEARS` (Ordre EDF/66/2026, DOGC 27.4.2026,
 *    re-read 31 Oct 2026: "Setmana Santa: del 20 de març al 29 de març de
 *    2027, ambdós inclosos"; local holidays are school holidays too, art.
 *    2.4.b and its equivalents).
 *  - Local days: `council-2027.ts` through `councilApproved2027`, so they
 *    carry the "pending the DOGC order" label and give way to the order the
 *    moment `local-2027.json` is written. On 31 Oct 2026 the councils of la
 *    Llagosta and la Llacuna were re-read (same days); blanes.cat refused
 *    connections, so its 30 Oct reading stands.
 *  - Shops: `OPENING_2027` in the shops guide (Ordre EMT/89/2026, DOGC
 *    28.5.2026, re-read 31 Oct 2026) and Llei 18/2017, art. 36.2.d (BOE
 *    consolidated text: "el domingo y el lunes de Pascua" are closing days;
 *    Good Friday is not in the list).
 *  - Metro: `metroDay` (TMB's standing rules, re-read 31 Oct 2026: "Divendres
 *    i vigílies de festius intersetmanals: De 5.00 a 2.00").
 *
 * Also read on 31 Oct 2026: BOE-A-2026-21254 (BOE 13.10.2026), where 25 March
 * (Jueves Santo) is marked for every territory except Cataluña and the
 * Comunitat Valenciana, and 29 March (Lunes de Pascua) only for the six in
 * EASTER_MONDAY_REGIONS; the 2027 seasons of La Passió d'Esparreguera
 * (lapassio.net/passio2027, dated 30.7.2026) and Olesa (lapassio.cat,
 * "Temporada 2027"); patrimoni.gencat.cat on both theatres and on Verges;
 * Tarragona council on the Sant Enterrament; Mercats de Barcelona on the
 * mona. Not printed, because no official source gives it: any 2027 time for
 * Verges or Tarragona, Rodalies or FGC timetables, the 2027 municipal shop
 * days (councils had until 1 Nov 2026) and Esparreguera's 11 April (its two
 * pages disagree). Fact pack: research_notes/setmana-santa-2027.md.
 *
 * Hero: no new photograph. The Montserrat guide's monastery picture, with the
 * same alt text and caption (media rows are keyed by file).
 *
 * HOW TO UPDATE (republish the `setmana-santa-2027` group after each):
 *  - DOGC local-holiday order for 2027 (the 2026 one came out on 17 Dec
 *    2025): once `prepare2027` writes local-2027.json, the local section
 *    switches to the order's days and drops the "pending" wording by itself.
 *  - 2027 municipal shop days (councils had until 1 Nov 2026; the 2026 list
 *    was in the DOGC on 27 Nov 2025): say which towns open on Good Friday.
 *  - Re-read both Passió pages before February 2027, and add the Verges and
 *    Tarragona times when the councils publish them.
 */
export const EASTER_VERIFIED = "2026-10-31";

/** The year this page is about. The URL carries it, so the page never rolls over. */
export const EASTER_YEAR = 2027;

/* -------------------------------------------------------------------------- */
/* Dates, from the shared modules                                             */
/* -------------------------------------------------------------------------- */

function holiday2027(en: string): Holiday {
  const found = (HOLIDAYS_BY_YEAR[EASTER_YEAR] ?? []).find((h) => h.name.en === en);
  if (!found) throw new Error(`easter page: no ${en} in the ${EASTER_YEAR} calendar`);
  return found;
}

const GOOD_FRIDAY = holiday2027("Good Friday");
const EASTER_MONDAY = holiday2027("Easter Monday");
const WHIT_MONDAY = BARCELONA_LOCAL.find((h) => h.date.startsWith(String(EASTER_YEAR)) && h.name.en.startsWith("Whit Monday"));
const SCHOOL_YEAR = SCHOOL_YEARS.find((y) => y.easter[0].startsWith(String(EASTER_YEAR)));
const ARAN = aranSwap(EASTER_YEAR);
if (!WHIT_MONDAY || !SCHOOL_YEAR || !ARAN) throw new Error("easter page: a shared calendar is missing its 2027 entry");

export const EASTER = {
  palmSunday: addDays(EASTER_MONDAY.date, -8),
  holyThursday: addDays(GOOD_FRIDAY.date, -1),
  goodFriday: GOOD_FRIDAY.date,
  holySaturday: addDays(GOOD_FRIDAY.date, 1),
  easterSunday: addDays(EASTER_MONDAY.date, -1),
  easterMonday: EASTER_MONDAY.date,
  /** Pasqua Granada: Barcelona's local holiday, seven weeks on. */
  whitMonday: WHIT_MONDAY.date,
  /** School Easter break, both days included. */
  schoolFrom: SCHOOL_YEAR.easter[0],
  schoolTo: SCHOOL_YEAR.easter[1],
  /** The day Aran keeps instead of Easter Monday. */
  aranDay: ARAN.date,
  aranReplaces: ARAN.replaces,
} as const;

/** "2026-2027": the school year the break belongs to. */
export const SCHOOL_LABEL = SCHOOL_YEAR.label;

/** Weekday with no Catalonia-wide holiday. */
function isWorkday(iso: string): boolean {
  const weekday = weekdayIndex(iso);
  return weekday !== 0 && weekday !== 6 && holidayOn(iso) === null;
}

/** The last school day before the break and the day classes restart. */
export function schoolEdges(): { lastClass: string; firstWeekdayOff: string; back: string } {
  let lastClass = addDays(EASTER.schoolFrom, -1);
  while (!isWorkday(lastClass)) lastClass = addDays(lastClass, -1);
  let firstWeekdayOff = EASTER.schoolFrom;
  while (weekdayIndex(firstWeekdayOff) === 0 || weekdayIndex(firstWeekdayOff) === 6) firstWeekdayOff = addDays(firstWeekdayOff, 1);
  let back = addDays(EASTER.schoolTo, 1);
  while (!isWorkday(back)) back = addDays(back, 1);
  return { lastClass, firstWeekdayOff, back };
}

/** Holy Week and Easter Monday, in order, for the day table and the metro table. */
export const TABLE_DAYS = [EASTER.palmSunday, EASTER.holyThursday, EASTER.goodFriday, EASTER.holySaturday, EASTER.easterSunday, EASTER.easterMonday] as const;
const METRO_DAYS = [EASTER.holyThursday, EASTER.goodFriday, EASTER.holySaturday, EASTER.easterSunday, EASTER.easterMonday] as const;

/**
 * Where Easter Monday is also a holiday, besides Catalonia (BOE-A-2026-21254,
 * "Fiesta de Comunidad Autónoma"). Holy Thursday is a holiday everywhere
 * except Catalonia and the Valencian Community.
 */
export const EASTER_MONDAY_REGIONS: Record<Locale, string[]> = {
  ca: ["les Illes Balears", "Navarra", "el País Basc", "la Rioja", "la Comunitat Valenciana"],
  es: ["Illes Balears", "Navarra", "el País Vasco", "La Rioja", "la Comunitat Valenciana"],
  en: ["the Balearic Islands", "Navarre", "the Basque Country", "La Rioja", "the Valencian Community"],
};

/* -------------------------------------------------------------------------- */
/* Local days next to Easter                                                  */
/* -------------------------------------------------------------------------- */

/** Holy Week with the week before and the week after: where a local day changes the break. */
export const LOCAL_WINDOW = { from: addDays(EASTER.palmSunday, -7), to: addDays(EASTER.easterSunday, 7) } as const;

export interface EasterLocalDay {
  town: SnapshotMunicipality;
  date: string;
  /** What the council calls the day, where it names it. */
  dayName: string | null;
  /** The council's own act, while the DOGC order is not out; null once it is. */
  council: CouncilApproved | null;
}

/**
 * Local days in LOCAL_WINDOW: the DOGC order's once it is parsed, before that
 * the days councils have approved themselves (marked pending on the page).
 */
export function localDaysAroundEaster(): EasterLocalDay[] {
  const published = nextYearPublished();
  const out: EasterLocalDay[] = [];
  for (const town of municipalities()) {
    const council = published ? null : councilApproved2027(town.slug);
    const days = published ? (nextYearFor(town.slug)?.local ?? []) : (council?.local ?? []);
    days.forEach((date, i) => {
      if (date < LOCAL_WINDOW.from || date > LOCAL_WINDOW.to) return;
      out.push({ town, date, dayName: council?.names?.[i] ?? null, council });
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.town.rank - b.town.rank);
}

/** The school break in a town whose local day is `local`: a day next to it stretches it. */
export function schoolBreakWith(local: readonly string[]): { from: string; to: string; back: string } {
  const off = (iso: string) => !isWorkday(iso) || local.includes(iso);
  let from = EASTER.schoolFrom;
  while (off(addDays(from, -1))) from = addDays(from, -1);
  let to = EASTER.schoolTo;
  while (off(addDays(to, 1))) to = addDays(to, 1);
  let back = addDays(to, 1);
  while (!isWorkday(back)) back = addDays(back, 1);
  return { from, to, back };
}

/* -------------------------------------------------------------------------- */
/* Long weekends                                                              */
/* -------------------------------------------------------------------------- */

const weekBefore = [-4, -3, -2, -1].map((n) => addDays(EASTER.goodFriday, n));
const weekAfter = [1, 2, 3, 4].map((n) => addDays(EASTER.easterMonday, n));

export interface EasterOption {
  id: string;
  leave: string[];
}

/** The combinations the table prints; every run is computed from the calendar. */
export const EASTER_OPTIONS: EasterOption[] = [
  { id: "none", leave: [] },
  { id: "thursday", leave: [EASTER.holyThursday] },
  { id: "weekBefore", leave: weekBefore },
  { id: "weekAfter", leave: weekAfter },
  { id: "both", leave: [...weekBefore, ...weekAfter] },
];

export function optionRun(option: EasterOption): Run {
  return runAround(EASTER.goodFriday, option.leave);
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** 1st, 2nd, 3rd, 4th, 11th, 21st, 22nd, 25th. */
function ordinal(n: number): string {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix = teen ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
}

/** Link labels used in more than one place. */
const B2_LABELS = {
  montserrat: { ca: "Montserrat per lliure", es: "Montserrat por libre", en: "Montserrat without a tour" },
} as const satisfies Record<string, Record<Locale, string>>;

const d = (iso: string, locale: Locale) => dayDate(iso, locale, false);
const dm = (iso: string, locale: Locale) => shortDate(iso, locale);

/** "3 de gener, 27 de juny, 1 i 28 de novembre i 6, 8, 12 i 19 de desembre": the month said once per run of dates. */
function dateList(isos: readonly string[], locale: Locale): string {
  const groups: string[][] = [];
  for (const iso of isos) {
    const last = groups.at(-1);
    if (last && last[0]!.slice(0, 7) === iso.slice(0, 7)) last.push(iso);
    else groups.push([iso]);
  }
  return joinList(
    groups.map((group) => {
      const month = dm(group.at(-1)!, locale).replace(/^\d+\s*/, "");
      const days = joinList(group.map((iso) => String(Number(iso.slice(8)))), locale);
      return `${days} ${month}`;
    }),
    locale,
  );
}

/** "Cap" / "Dijous 25 de març" / "Del dilluns 22 al dijous 25 de març i del dimarts 30 de març al divendres 2 d'abril". */
function leaveWords(leave: readonly string[], locale: Locale): string {
  if (leave.length === 0) return { ca: "Cap", es: "Ninguno", en: "None" }[locale];
  const blocks: string[][] = [];
  for (const day of leave) {
    const last = blocks.at(-1);
    if (last && addDays(last.at(-1)!, 1) === day) last.push(day);
    else blocks.push([day]);
  }
  const words = blocks.map((b) => (b.length === 1 ? d(b[0]!, locale) : runWords({ from: b[0]!, to: b.at(-1)!, days: b.length }, locale)));
  return cap(joinList(words, locale));
}

export function optionRows(locale: Locale): string[][] {
  return EASTER_OPTIONS.map((option) => {
    const run = optionRun(option);
    const n = option.leave.length;
    const leave = n === 0 ? leaveWords([], locale) : `${leaveWords(option.leave, locale)} (${n} ${{ ca: n === 1 ? "dia" : "dies", es: n === 1 ? "día" : "días", en: n === 1 ? "day" : "days" }[locale]})`;
    const days = { ca: `${run.days} dies`, es: `${run.days} días`, en: `${run.days} days` }[locale];
    return [leave, days, cap(runWords(run, locale))];
  });
}

/* -------------------------------------------------------------------------- */
/* Traditions with an official 2027 date                                      */
/* -------------------------------------------------------------------------- */

/** As each organiser publishes them (read 31 Oct 2026). */
export const PASSIONS = {
  esparreguera: {
    url: "https://www.lapassio.net/passio2027/",
    seasonFrom: "2027-03-07",
    seasonTo: "2027-05-01",
    /** Traditional format, morning and afternoon: "MARÇ 7, 14, 21 i 26". */
    traditional: ["2027-03-07", "2027-03-14", "2027-03-21", "2027-03-26"],
    theatreSince: 1969,
  },
  olesa: {
    url: "https://www.lapassio.cat/temporada-2026-de-la-passio-dolesa/preus-i-dates/",
    dates: ["2027-03-14", "2027-03-20", "2027-03-26", "2027-04-04", "2027-04-10", "2027-04-17", "2027-04-25", "2027-05-01"],
    theatreSince: 1987,
  },
} as const;

const inHolyWeek = (iso: string) => iso >= EASTER.palmSunday && iso <= EASTER.easterMonday;
const inSchoolBreak = (iso: string) => iso >= EASTER.schoolFrom && iso <= EASTER.schoolTo;

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

const STATIC_SOURCES: B2Source[] = [
  { name: "Calendari de festes laborals 2027 (Ordre EMT/52/2026, DOGC 1.4.2026)", url: "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2027/", publisher: "Departament d'Empresa i Treball" },
  { name: "Resolución de 8 de octubre de 2026, de la Dirección General de Trabajo, relación de fiestas laborales para el año 2027", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-21254", publisher: "BOE" },
  { name: SCHOOL_SOURCE.name, url: SCHOOL_SOURCE.url, publisher: "DOGC" },
  { name: "Festes estatals i autonòmiques a Catalunya i locals a Barcelona al 2027", url: "https://ajuntament.barcelona.cat/calendarifestius/ca/", publisher: "Ajuntament de Barcelona" },
  { name: "Ordre EMT/89/2026, calendari d'obertura comercial en diumenges i festius per al 2027", url: "https://portaldogc.gencat.cat/utilsEADOP/AppJava/PdfProviderServlet?documentId=1045357&type=01&language=ca_ES", publisher: "DOGC" },
  { name: "Llei 18/2017, de comerç, serveis i fires (text consolidat, articles 36 i 37)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-11320", publisher: "BOE" },
  { name: "Horaris de metro, bus i funicular de Montjuïc", url: "https://www.tmb.cat/ca/transport-barcelona/horari-metro-bus", publisher: "TMB" },
  { name: "La Passió d'Esparreguera 2027", url: PASSIONS.esparreguera.url, publisher: "Fundació La Passió d'Esparreguera" },
  { name: "La Passió d'Esparreguera", url: "https://patrimoni.gencat.cat/ca/coleccio/passio-desparraguera", publisher: "Generalitat de Catalunya, Patrimoni Cultural" },
  { name: "La Passió d'Olesa: temporada 2027, preus i dates", url: PASSIONS.olesa.url, publisher: "La Passió d'Olesa de Montserrat" },
  { name: "La Passió d'Olesa de Montserrat", url: "https://patrimoni.gencat.cat/ca/coleccio/passio-dolesa-de-montserrat", publisher: "Generalitat de Catalunya, Patrimoni Cultural" },
  { name: "Processó de Verges", url: "https://patrimoni.gencat.cat/ca/coleccio/processo-de-verges", publisher: "Generalitat de Catalunya, Patrimoni Cultural" },
  { name: "Setmana Santa de Tarragona", url: "https://www.tarragona.cat/cultura/festes-i-cultura-popular/setmana-santa-de-tarragona", publisher: "Ajuntament de Tarragona" },
  { name: "La mona de Pasqua, la tradició més dolça", url: "https://ajuntament.barcelona.cat/mercats/ca/som-de-mercat/el-blog/la-mona-de-pasqua-la-tradicio-mes-dolca", publisher: "Mercats de Barcelona, Ajuntament de Barcelona" },
];

/** The static sources plus each council whose local day the page prints. */
export function easterSources(): B2Source[] {
  const seen = new Set(STATIC_SOURCES.map((s) => s.url));
  const councils: B2Source[] = [];
  for (const day of localDaysAroundEaster()) {
    if (!day.council || seen.has(day.council.source.url)) continue;
    seen.add(day.council.source.url);
    councils.push({ name: day.council.source.name, url: day.council.source.url, publisher: day.council.source.ref });
  }
  return [...STATIC_SOURCES, ...councils];
}

/* -------------------------------------------------------------------------- */
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

export interface EasterMeta {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
}

/** First candidate within the description budget; the last one is the shortest. */
function fitDescription(candidates: string[]): string {
  return candidates.find((c) => c.length <= 155) ?? candidates.at(-1)!;
}

function buildMeta(locale: Locale): EasterMeta {
  const holidays = dayPair(EASTER.goodFriday, EASTER.easterMonday, locale);
  const school = span(EASTER.schoolFrom, EASTER.schoolTo, locale);
  // "setmana santa 2027", "quan és setmana santa 2027" (Search Console,
  // 21 Oct-3 Nov 2026): the week itself first, Palm Sunday to Easter Sunday
  // as the key facts give them, then the two holidays by day number.
  const week = span(EASTER.palmSunday, EASTER.easterSunday, locale);
  const n = (iso: string) => String(Number(iso.slice(8, 10)));
  if (locale === "ca") {
    return {
      path: "guies/setmana-santa-2027-catalunya",
      title: "Setmana Santa 2027 a Catalunya: festius, vacances escolars, botigues i ponts",
      seoTitle: `Setmana Santa 2027 a Catalunya: festius ${holidays}`,
      seoDescription: fitDescription([
        `Setmana Santa 2027: ${week}. Festius: Divendres Sant ${n(EASTER.goodFriday)} i Dilluns de Pasqua ${n(EASTER.easterMonday)} (el Dijous Sant, no). Vacances escolars ${school}.`,
        `Setmana Santa 2027: ${week}. Festius: Divendres Sant ${n(EASTER.goodFriday)} i Dilluns de Pasqua ${n(EASTER.easterMonday)}. Vacances escolars ${school}.`,
      ]),
      excerpt: "Quins dies són festius per Setmana Santa del 2027 a Catalunya, les vacances de les escoles, les festes locals, si obren les botigues, el metro, els ponts i les tradicions.",
    };
  }
  if (locale === "es") {
    return {
      path: "guias/semana-santa-2027-cataluna",
      title: "Semana Santa 2027 en Cataluña: festivos, vacaciones escolares, tiendas y puentes",
      seoTitle: `Semana Santa 2027 en Cataluña: festivos ${holidays}`,
      seoDescription: fitDescription([
        `Semana Santa 2027: ${week}. Festivos: Viernes Santo ${n(EASTER.goodFriday)} y Lunes de Pascua ${n(EASTER.easterMonday)} (el Jueves Santo, no). Vacaciones escolares ${school}.`,
        `Semana Santa 2027: ${week}. Festivos: Viernes Santo ${n(EASTER.goodFriday)} y Lunes de Pascua ${n(EASTER.easterMonday)} (el Jueves Santo, no). Colegios: ${school}.`,
      ]),
      excerpt: "Qué días son festivos en Semana Santa de 2027 en Cataluña, las vacaciones de los colegios, las fiestas locales, si abren las tiendas, el metro, los puentes y las tradiciones.",
    };
  }
  return {
    path: "guides/easter-2027-catalonia",
    title: "Easter 2027 in Catalonia and Barcelona: public holidays, school holidays, shops and long weekends",
    seoTitle: `Easter 2027 in Catalonia and Barcelona: ${holidays}`,
    seoDescription: `Good Friday and Easter Monday, ${holidays}, are public holidays in Catalonia; Maundy Thursday is not. School holidays ${school}. Shops and metro.`,
    excerpt: "Which days are public holidays over Easter 2027 in Catalonia, the school Easter break, local holidays, whether shops open, the metro, long weekends and traditions.",
  };
}

export const EASTER_META: Record<Locale, EasterMeta> = { ca: buildMeta("ca"), es: buildMeta("es"), en: buildMeta("en") };

/* -------------------------------------------------------------------------- */
/* Tables                                                                     */
/* -------------------------------------------------------------------------- */

const DAY_NAMES: Record<Locale, Record<string, string>> = {
  ca: { [EASTER.palmSunday]: "Diumenge de Rams", [EASTER.holyThursday]: "Dijous Sant", [EASTER.goodFriday]: "Divendres Sant", [EASTER.holySaturday]: "Dissabte Sant", [EASTER.easterSunday]: "Diumenge de Pasqua", [EASTER.easterMonday]: "Dilluns de Pasqua" },
  es: { [EASTER.palmSunday]: "Domingo de Ramos", [EASTER.holyThursday]: "Jueves Santo", [EASTER.goodFriday]: "Viernes Santo", [EASTER.holySaturday]: "Sábado Santo", [EASTER.easterSunday]: "Domingo de Pascua", [EASTER.easterMonday]: "Lunes de Pascua" },
  en: { [EASTER.palmSunday]: "Palm Sunday", [EASTER.holyThursday]: "Maundy Thursday", [EASTER.goodFriday]: "Good Friday", [EASTER.holySaturday]: "Holy Saturday", [EASTER.easterSunday]: "Easter Sunday", [EASTER.easterMonday]: "Easter Monday" },
};

/** Whether each day is a holiday in Catalonia, from the calendar. */
export function dayRows(locale: Locale): string[][] {
  return TABLE_DAYS.map((iso) => {
    const weekday = weekdayIndex(iso);
    let status: string;
    if (holidayOn(iso)) {
      const aran = iso === EASTER.aranReplaces;
      status = {
        ca: `**Festiu a tot Catalunya**${aran ? " (a l'Aran, no)" : ""}`,
        es: `**Festivo en toda Cataluña**${aran ? " (en Arán, no)" : ""}`,
        en: `**Public holiday across Catalonia**${aran ? " (not in Aran)" : ""}`,
      }[locale];
    } else if (weekday === 0) {
      status = { ca: "Diumenge", es: "Domingo", en: "Sunday" }[locale];
    } else if (weekday === 6) {
      status = { ca: "Dissabte (no és festiu)", es: "Sábado (no es festivo)", en: "Saturday (not a holiday)" }[locale];
    } else {
      status = { ca: "Feiner a Catalunya (festiu a la majoria de comunitats)", es: "Laborable en Cataluña (festivo en la mayoría de comunidades)", en: "Working day in Catalonia (a holiday in most of Spain)" }[locale];
    }
    // Days with an "is it a holiday?" page link to it: one link per row (Holy Thursday, Good Friday, Easter Monday).
    const day = cap(d(iso, locale));
    return [isDatePage(iso) ? `[${day}](${datePath(locale, iso)})` : day, DAY_NAMES[locale][iso] ?? "", status];
  });
}

const METRO_WORDS: Record<Locale, { opens: string; continues: string; close: Record<"midnight" | "two" | "allNight" | "eleven", string> }> = {
  ca: { opens: "obre a les 5:00", continues: "funciona sense parar des de la nit anterior", close: { midnight: "tanca a mitjanit", two: "tanca a les 2:00", allNight: "no tanca en tota la nit", eleven: "tanca a les 23:00" } },
  es: { opens: "abre a las 5:00", continues: "funciona sin parar desde la noche anterior", close: { midnight: "cierra a medianoche", two: "cierra a las 2:00", allNight: "no cierra en toda la noche", eleven: "cierra a las 23:00" } },
  en: { opens: "opens at 5:00", continues: "runs on from the night before", close: { midnight: "closes at midnight", two: "closes at 2:00", allNight: "runs all night", eleven: "closes at 23:00" } },
};

/** The metro over Easter under TMB's standing rules (the same model the metro-hours guide uses). */
export function metroRows(locale: Locale): string[][] {
  const t = METRO_WORDS[locale];
  return METRO_DAYS.map((iso) => {
    const day = metroDay(iso);
    return [cap(d(iso, locale)), DAY_NAMES[locale][iso] ?? "", cap(`${day.opensAtFive ? t.opens : t.continues}; ${t.close[day.close]}`)];
  });
}

/* -------------------------------------------------------------------------- */
/* Local days in words                                                        */
/* -------------------------------------------------------------------------- */

function townLink(town: SnapshotMunicipality, locale: Locale, start = false): string {
  const name = locale === "en" ? town.name.charAt(0).toUpperCase() + town.name.slice(1) : displayName(town, locale);
  const label = start ? cap(name) : name;
  if (locale === "en" && !hasEnglishPage(town.slug)) return label;
  return `[${label}](${municipalityPath(locale, town.slug)})`;
}

/** One list item per local day: the day, who approved it, and what it does to the break. */
export function localItems(locale: Locale): string[] {
  return localDaysAroundEaster().map((day) => {
    const when = d(day.date, locale);
    const name = locale === "ca" && day.dayName ? ` (${day.dayName})` : "";
    const label = day.council
      ? { ca: `un dels dos dies ${councilLabel(day.council, "ca")}`, es: `uno de los dos días ${councilLabel(day.council, "es")}`, en: `one of the two days ${councilLabel(day.council, "en")}` }[locale]
      : { ca: "festa local fixada per l'ordre del DOGC", es: "fiesta local fijada por la orden del DOGC", en: "a local holiday set by the DOGC order" }[locale];
    const run = runAround(day.date, [day.date]);
    const school = schoolBreakWith([day.date]);
    const stretchesBack = school.to !== EASTER.schoolTo;
    const stretchesFront = school.from !== EASTER.schoolFrom;
    const effect: Record<Locale, string> = {
      ca: stretchesBack
        ? `Allà, el pont de Pasqua fa ${run.days} dies, ${runWords(run, "ca")}, i les classes tornen el ${d(school.back, "ca")}.`
        : stretchesFront
          ? `Allà, les vacances escolars comencen un dia abans, el ${d(school.from, "ca")}, i qui treballa de dilluns a divendres té ${run.days} dies seguits, ${runWords(run, "ca")}.`
          : `Allà, qui treballa de dilluns a divendres té ${run.days} ${run.days === 1 ? "dia" : "dies seguits"} de festa, ${runWords(run, "ca")}.`,
      es: stretchesBack
        ? `Allí, el puente de Pascua es de ${run.days} días, ${runWords(run, "es")}, y las clases vuelven el ${d(school.back, "es")}.`
        : stretchesFront
          ? `Allí, las vacaciones escolares empiezan un día antes, el ${d(school.from, "es")}, y quien trabaja de lunes a viernes tiene ${run.days} días seguidos, ${runWords(run, "es")}.`
          : `Allí, quien trabaja de lunes a viernes tiene ${run.days} ${run.days === 1 ? "día" : "días seguidos"} de fiesta, ${runWords(run, "es")}.`,
      en: stretchesBack
        ? `There, the Easter break lasts ${run.days} days, ${runWords(run, "en")}, and classes restart on ${d(school.back, "en")}.`
        : stretchesFront
          ? `There, the school holidays start a day early, on ${d(school.from, "en")}, and Monday-to-Friday workers get ${run.days} days off in a row, ${runWords(run, "en")}.`
          : `There, Monday-to-Friday workers get ${run.days} ${run.days === 1 ? "day" : "days"} off, ${runWords(run, "en")}.`,
    };
    return `**${townLink(day.town, locale, true)}**: ${when}${name}, ${label}. ${effect[locale]}`;
  });
}

/** "la Llagosta (19 de març); Blanes i la Llacuna (30 de març)", for the key facts. */
function localSummary(locale: Locale): string {
  const byDate = new Map<string, string[]>();
  for (const day of localDaysAroundEaster()) byDate.set(day.date, [...(byDate.get(day.date) ?? []), locale === "en" ? cap(day.town.name) : displayName(day.town, locale)]);
  return [...byDate.entries()].map(([date, towns]) => `${joinList(towns, locale)} (${dm(date, locale)})`).join("; ");
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

const RELATED = ["workCalendar", "holidayToday", "shops", "hours", "montserratFree", "climate"] as const;

function dayTable(locale: Locale): Block {
  const caption = { ca: "La Setmana Santa del 2027 a Catalunya, dia a dia", es: "La Semana Santa de 2027 en Cataluña, día a día", en: "Easter 2027 in Catalonia, day by day" }[locale];
  const headers = { ca: ["Dia", "Què és", "És festiu?"], es: ["Día", "Qué es", "¿Es festivo?"], en: ["Day", "What it is", "Public holiday?"] }[locale];
  const note = {
    ca: "Font: Ordre EMT/52/2026 (DOGC de l'1 d'abril de 2026) i relació de festes del BOE del 13 d'octubre de 2026. A cada municipi s'hi sumen les seves dues festes locals.",
    es: "Fuente: Orden EMT/52/2026 (DOGC del 1 de abril de 2026) y relación de fiestas del BOE del 13 de octubre de 2026. En cada municipio se suman sus dos fiestas locales.",
    en: "Source: Order EMT/52/2026 (DOGC, 1 April 2026) and the BOE list of holidays of 13 October 2026. Each town adds its own two local holidays.",
  }[locale];
  return table(caption, headers, dayRows(locale), note);
}

function optionTable(locale: Locale): Block {
  const caption = { ca: "Ponts de Setmana Santa 2027: quants dies seguits de festa surten", es: "Puentes de Semana Santa 2027: cuántos días seguidos de fiesta salen", en: "Easter 2027 long weekends: how many days off in a row" }[locale];
  const headers = { ca: ["Dies que demanes", "Festa seguida", "Dates"], es: ["Días que pides", "Fiesta seguida", "Fechas"], en: ["Leave you book", "Days off in a row", "Dates"] }[locale];
  const note = {
    ca: "Càlcul de CatalunyaInfo per a una setmana de dilluns a divendres, amb els festius de tot Catalunya. No inclou festes locals ni substitueix el calendari de la teva empresa.",
    es: "Cálculo de CatalunyaInfo para una semana de lunes a viernes, con los festivos de toda Cataluña. No incluye fiestas locales ni sustituye el calendario de tu empresa.",
    en: "CatalunyaInfo's calculation for a Monday-to-Friday week, using the Catalonia-wide holidays. It leaves out local holidays and does not replace your employer's calendar.",
  }[locale];
  return table(caption, headers, optionRows(locale), note);
}

function metroTable(locale: Locale): Block {
  const caption = { ca: "El metro de Barcelona per Setmana Santa del 2027", es: "El metro de Barcelona en Semana Santa de 2027", en: "The Barcelona metro over Easter 2027" }[locale];
  const headers = { ca: ["Dia", "Què és", "Metro"], es: ["Día", "Qué es", "Metro"], en: ["Day", "What it is", "Metro"] }[locale];
  return table(caption, headers, metroRows(locale), metroLines(EASTER.goodFriday, locale).caveat);
}

export function buildEasterBody(locale: Locale): Block[] {
  const E = EASTER;
  const school = schoolEdges();
  const thursdayRun = runAround(E.goodFriday, [E.holyThursday]);
  const easterRun = runAround(E.goodFriday);
  const weekBeforeRun = optionRun(EASTER_OPTIONS.find((o) => o.id === "weekBefore")!);
  const locals = localItems(locale);
  const localSum = localSummary(locale);
  // Council-approved days until the DOGC order is parsed (local-2027.json); the order's afterwards.
  const pending = localDaysAroundEaster().some((day) => day.council !== null);
  const regions = joinList(EASTER_MONDAY_REGIONS[locale], locale);
  const general = dateList(OPENING_2027.general, locale);
  const municipalDefault = dateList(OPENING_2027.municipalDefault, locale);
  const esp = PASSIONS.esparreguera;
  const olesa = PASSIONS.olesa;
  const article = locale === "en" ? "" : "el ";
  // "el Diumenge de Rams i el Divendres Sant": the Esparreguera dates that fall in Holy Week, by name.
  const espHoly = joinList(esp.traditional.filter(inHolyWeek).map((iso) => `${article}${DAY_NAMES[locale][iso] ?? d(iso, locale)}`), locale);
  // "7, 14, 21 i 26" / "7th, 14th, 21st and 26th": the traditional-format days, all in March.
  const espDays = joinList(esp.traditional.map((iso) => (locale === "en" ? ordinal(Number(iso.slice(8))) : String(Number(iso.slice(8))))), locale);
  // Olesa's performances during the school Easter break.
  const olesaHoly = joinList(olesa.dates.filter(inSchoolBreak).map((iso) => `${article}${d(iso, locale)}`), locale);
  const olesaFirst = olesa.dates[0];
  const olesaLast = olesa.dates.at(-1)!;
  const schoolLink = (label: string) => `[${label}](/${locale}/${SIBLING_PATHS.school[locale]}/)`;
  const localLink = (label: string) => `[${label}](/${locale}/${SIBLING_PATHS.local[locale]}/)`;
  const montserrat = b2link("montserratFree", locale, B2_LABELS.montserrat[locale]);
  // Pasqua Granada has its own date page (2 Nov 2026), with every town that takes it off: one sentence, one link.
  const whitPage = isDatePage(E.whitMonday)
    ? {
        ca: ` La llista de municipis que hi fan festa és a [festius del ${dm(E.whitMonday, "ca")} de ${EASTER_YEAR}](${datePath("ca", E.whitMonday)}).`,
        es: ` La lista de municipios que hacen fiesta ese día está en [festivos del ${dm(E.whitMonday, "es")} de ${EASTER_YEAR}](${datePath("es", E.whitMonday)}).`,
        en: ` The towns that take the day off are listed on [is ${dm(E.whitMonday, "en")} ${EASTER_YEAR} a holiday?](${datePath("en", E.whitMonday)}).`,
      }[locale]
    : "";
  // Both true in 2027; the sentences that rely on them are left out in a year they are not.
  const schoolOnMonday = E.schoolFrom <= E.easterMonday && E.schoolTo >= E.easterMonday;
  const matchesSchool = weekBeforeRun.from === E.schoolFrom && weekBeforeRun.to === E.schoolTo;
  const thursday = locale === "en" ? `Thursday the ${ordinal(Number(E.holyThursday.slice(8)))}` : `${{ ca: "dijous", es: "jueves" }[locale]} ${Number(E.holyThursday.slice(8))}`;

  if (locale === "ca") {
    return [
      lead(
        `**A Catalunya, la Setmana Santa del 2027, ${span(E.palmSunday, E.easterSunday, "ca")}, té dos festius: el Divendres Sant, ${dm(E.goodFriday, "ca")}, i el Dilluns de Pasqua, ${dm(E.easterMonday, "ca")}.** El Dijous Sant (${dm(E.holyThursday, "ca")}) és un dia feiner, tot i que és festiu a gairebé tota la resta d'Espanya. Amb el cap de setmana surten ${easterRun.days} dies seguits de festa, ${runWords(easterRun, "ca")}. A les escoles, les vacances de Setmana Santa van ${runWords({ from: E.schoolFrom, to: E.schoolTo, days: 0 }, "ca")}, i es torna a classe el ${d(school.back, "ca")}.`,
      ),
      keyFacts("La Setmana Santa del 2027, d'un cop d'ull", [
        { label: "Diumenge de Rams", value: cap(d(E.palmSunday, "ca")) },
        { label: "Dijous Sant", value: `${cap(d(E.holyThursday, "ca"))}: feiner a Catalunya` },
        { label: "Divendres Sant", value: `${cap(d(E.goodFriday, "ca"))}: festiu a tot Catalunya` },
        { label: "Diumenge de Pasqua", value: cap(d(E.easterSunday, "ca")) },
        { label: "Dilluns de Pasqua", value: `${cap(d(E.easterMonday, "ca"))}: festiu, excepte a l'Aran` },
        { label: "Vacances escolars", value: `${cap(runWords({ from: E.schoolFrom, to: E.schoolTo, days: 0 }, "ca"))}; es torna el ${d(school.back, "ca")}` },
        { label: "Pont amb un dia", value: `Demanant el ${thursday}: ${thursdayRun.days} dies, ${runWords(thursdayRun, "ca")}` },
        ...(localSum ? [{ label: "Festes locals a tocar", value: `${cap(localSum)}${pending ? ", pendents del DOGC" : ""}` }] : []),
      ]),
      callout(
        "official",
        "D'on surten aquestes dates",
        `Els festius, de l'Ordre EMT/52/2026 (DOGC de l'1 d'abril de 2026), que el BOE del 13 d'octubre de 2026 recull a la relació de festes del 2027; les vacances escolars, de l'Ordre EDF/66/2026 (DOGC del 27 d'abril de 2026). Les hem tornat a llegir el 31 d'octubre de 2026.`,
      ),
      ...h2(
        "Quins dies són festius per Setmana Santa del 2027 a Catalunya?",
        `Dos: el **Divendres Sant, ${d(E.goodFriday, "ca")}**, i el **Dilluns de Pasqua, ${d(E.easterMonday, "ca")}**. Són dos dels dotze festius del 2027 a tot Catalunya; a l'Aran, el Dilluns de Pasqua no és festiu, perquè el substitueix la Festa d'Aran, el ${d(E.aranDay, "ca")}.`,
      ),
      dayTable("ca"),
      ...h2(
        "És festiu el Divendres Sant del 2027?",
        `Sí. El ${d(E.goodFriday, "ca")} és festiu a tot Catalunya, i també a la resta d'Espanya: la relació estatal de festes el marca com a festa nacional a totes les comunitats.`,
      ),
      ...h2(
        "El Dijous Sant és festiu a Catalunya?",
        `No. El ${d(E.holyThursday, "ca")} és un dia feiner a Catalunya. Segons la relació de festes del 2027 publicada al BOE el 13 d'octubre de 2026, és festiu a totes les comunitats autònomes i a Ceuta i Melilla, **excepte a Catalunya i a la Comunitat Valenciana**. Catalunya fa festa, en canvi, el Dilluns de Pasqua, que també és festiu a ${regions}, i enlloc més.`,
        "Si viatges o tens família en una altra comunitat, compta amb el seu calendari: a Madrid o a Andalusia el Dijous Sant és festiu i el Dilluns de Pasqua, no.",
      ),
      ...h2(
        "El Dilluns de Pasqua del 2027",
        `És el ${d(E.easterMonday, "ca")}, festiu a tot Catalunya excepte a l'Aran, on el canvia la Festa d'Aran (${d(E.aranDay, "ca")}). És el dia de la mona.${schoolOnMonday ? " Les escoles, també les de l'Aran, encara són de vacances aquell dia." : ""}`,
        `La Pasqua Granada, set setmanes després (${d(E.whitMonday, "ca")}), no és festiu a tot Catalunya: és festa local a Barcelona i als municipis que la trien. Tots els festius de la ciutat són a [festius de Barcelona](${municipalityPath("ca", "barcelona")}).${whitPage}`,
      ),
      ...h2(
        "Vacances de Setmana Santa 2027 a les escoles",
        `L'Ordre EDF/66/2026 fixa les vacances de Setmana Santa del curs ${SCHOOL_LABEL} **${runWords({ from: E.schoolFrom, to: E.schoolTo, days: 0 }, "ca")}, tots dos inclosos**. L'últim dia de classe abans de vacances és el ${d(school.lastClass, "ca")}, el primer dia feiner sense classe és el ${d(school.firstWeekdayOff, "ca")} i es torna a l'escola el **${d(school.back, "ca")}**. Val per a totes les escoles i instituts de Catalunya, públics i privats.`,
        "Els quatre dies de lliure disposició de cada escola no poden caure dins d'aquestes vacances, segons la mateixa ordre. Les dues festes locals del municipi sí que són festiu escolar: on una toca a les vacances, les allarga (a sota, els municipis on passa el 2027).",
        `Tot el curs, amb el Nadal i els festius, és al ${schoolLink(`calendari escolar ${SCHOOL_LABEL}`)}.`,
      ),
      ...(locals.length
        ? [
            ...h2(
              "Festes locals al voltant de Setmana Santa",
              pending
                ? "Les festes locals del 2027 encara no són al DOGC: l'ordre del 2026 va sortir el 17 de desembre de 2025. Alguns ajuntaments ja han aprovat les seves, i en aquests una cau a tocar de la Setmana Santa:"
                : "Segons l'ordre de festes locals del 2027, en aquests municipis una cau a tocar de la Setmana Santa:",
            ),
            list(...locals),
            ...paras(`Per a la resta de municipis, mira'n la pàgina a [festius locals per municipi](/ca/festius/), o la llista sencera a ${localLink("festius locals de tots els municipis")}.`),
          ]
        : []),
      ...h2(
        "Ponts de Setmana Santa 2027: quins dies demanar",
        "Si treballes de dilluns a divendres, aquestes són les combinacions que deixa el calendari. És un càlcul nostre, no un dret: les vacances s'han de demanar i pactar amb l'empresa, i els torns i els convenis ho poden canviar tot.",
      ),
      optionTable("ca"),
      ...paras(
        `Amb quatre dies de vacances, ${leaveWords(weekBefore, "ca").replace(/^D/, "d")}, la festa va ${runWords(weekBeforeRun, "ca")}${matchesSchool ? ": exactament les vacances escolars" : ""}. A l'Aran, el ${d(E.easterMonday, "ca")} és feiner (el festiu passa al ${dm(E.aranDay, "ca")}) i aquests càlculs no s'hi apliquen igual.`,
      ),
      ...h2(
        "Obren les botigues el Divendres Sant i el Dilluns de Pasqua?",
        `**El ${d(E.easterSunday, "ca")} i el ${d(E.easterMonday, "ca")}, les botigues amb horari general han de tancar.** La llei de comerç (Llei 18/2017, article 36) fixa el diumenge i el dilluns de Pasqua com a dies de tancament, igual que l'1 i el 6 de gener, l'1 de maig, el 24 de juny, l'11 de setembre i el 25 i el 26 de desembre.`,
        `**El Divendres Sant, en general, tampoc.** No és cap dels vuit festius d'obertura del calendari general del 2027 (Ordre EMT/89/2026), que són ${general}. Cada ajuntament n'hi afegeix dos i el podria triar, igual que les empreses de botigues d'alimentació i compra diària, que poden canviar fins a tres dates del calendari general. Els ajuntaments els havien de comunicar abans de l'1 de novembre de 2026 i la llista encara no s'ha publicat; si un ajuntament no en tria cap, s'hi apliquen els dies ${municipalDefault}. El mateix val per al Diumenge de Rams.`,
        `Les botigues que la llei deixa fora d'aquests límits (article 37), com les pastisseries i fleques, les de conveniència, les farmàcies o les d'alimentació de fins a 300 m², poden obrir qualsevol dia: per això les pastisseries poden obrir el Dilluns de Pasqua, el dia de la mona. A Barcelona, l'excepció de la zona turística només val del 15 de maig al 15 de setembre. El detall és a ${b2link("shops", "ca", "la guia de botigues obertes en diumenges i festius")}.`,
      ),
      ...h2(
        "Metro i transport per Setmana Santa",
        "El Divendres Sant i el Dilluns de Pasqua són festius, i el transport públic hi fa l'horari de festius de cada operador. Al metro de Barcelona, l'horari general de TMB deixa aquests dies així:",
      ),
      metroTable("ca"),
      ...paras(
        `Els horaris de les parades d'autobús de TMB es consulten per data, segons si el dia és feiner o festiu. Per a Rodalies, FGC i els autobusos interurbans, mira l'horari del dia concret al web de cada operador abans de sortir. Horaris del metro i del NitBus, a ${b2link("hours", "ca", "l'horari del metro de Barcelona")}.`,
      ),
      ...h2(
        "Tradicions: la mona, les processons i la Passió",
        "Algunes de les cites de Setmana Santa amb data oficial, i el que encara no s'ha publicat:",
      ),
      list(
        `**La mona de Pasqua.** És el regal dels padrins als fillols, i Mercats de Barcelona la situa el Dilluns de Pasqua, que el 2027 és el ${dm(E.easterMonday, "ca")}.`,
        `**La Processó de Verges.** Es fa cada Dijous Sant (el 2027, el ${dm(E.holyThursday, "ca")}), amb la Dansa de la Mort, i la Generalitat la va declarar festa tradicional d'interès nacional el 1983. L'hora del 2027 encara no s'ha publicat.`,
        `**La Processó del Sant Enterrament de Tarragona.** Surt el Divendres Sant (${dm(E.goodFriday, "ca")}), està documentada des del 1550 i el Govern la va declarar d'interès nacional el 2010, segons l'Ajuntament de Tarragona. L'hora del 2027 encara no s'ha publicat.`,
        `**La Passió d'Esparreguera.** La [temporada 2027](${esp.url}) va ${span(esp.seasonFrom, esp.seasonTo, "ca")} al Teatre de La Passió, l'escenari des del ${esp.theatreSince}. Al març, les funcions són en el format tradicional, de matí i tarda: els dies ${espDays}, és a dir, també ${espHoly}. A l'abril i al maig n'hi ha en un format nou, més curt.`,
        `**La Passió d'Olesa de Montserrat.** La [temporada 2027](${olesa.url}) té ${olesa.dates.length} funcions, ${runWords({ from: olesaFirst, to: olesaLast, days: 0 }, "ca")}, al Teatre de la Passió d'Olesa (l'escenari des del ${olesa.theatreSince}); durant les vacances escolars de Setmana Santa, ${olesaHoly}. Totes estan subtitulades en castellà i anglès.`,
      ),
      ...paras(
        "Les dates de les dues Passions són les que publicaven els organitzadors el 31 d'octubre de 2026: comprova-les al seu web abans de comprar entrades.",
        `Si busques una sortida, mira ${montserrat}, ${link("trains", "ca", "les escapades en tren")} o ${link("weekend", "ca", "què fer aquest cap de setmana")}.`,
      ),
      faq([
        { question: "Quins dies són festius per Setmana Santa del 2027 a Catalunya?", answer: `El Divendres Sant, ${d(E.goodFriday, "ca")}, i el Dilluns de Pasqua, ${d(E.easterMonday, "ca")}. Amb el cap de setmana fan ${easterRun.days} dies seguits, ${runWords(easterRun, "ca")}. El Dijous Sant és feiner.` },
        { question: "És festiu el Divendres Sant del 2027?", answer: `Sí: el ${d(E.goodFriday, "ca")} és festiu a tot Catalunya i a tota Espanya.` },
        { question: "El Dijous Sant del 2027 és festiu a Catalunya?", answer: `No. El ${d(E.holyThursday, "ca")} és feiner a Catalunya. És festiu a totes les comunitats autònomes llevat de Catalunya i la Comunitat Valenciana.` },
        { question: "Quan és el Dilluns de Pasqua del 2027?", answer: `El ${d(E.easterMonday, "ca")}. És festiu a tot Catalunya excepte a l'Aran, on el substitueix la Festa d'Aran, el ${dm(E.aranDay, "ca")}.` },
        { question: "Quan són les vacances de Setmana Santa 2027 a les escoles?", answer: `${cap(runWords({ from: E.schoolFrom, to: E.schoolTo, days: 0 }, "ca"))}, tots dos inclosos. L'últim dia de classe és el ${d(school.lastClass, "ca")} i es torna el ${d(school.back, "ca")}.` },
        { question: "Quin pont es pot fer per Setmana Santa del 2027?", answer: `Sense demanar cap dia, ${easterRun.days} dies (${runWords(easterRun, "ca")}). Demanant el ${thursday}, ${thursdayRun.days} dies (${runWords(thursdayRun, "ca")}). Demanant ${leaveWords(weekBefore, "ca").replace(/^D/, "d")}, ${weekBeforeRun.days} dies, ${runWords(weekBeforeRun, "ca")}${matchesSchool ? ": les mateixes dates que les vacances escolars" : ""}.` },
        { question: "Obren les botigues el Dilluns de Pasqua?", answer: "Les d'horari general, no: el diumenge i el dilluns de Pasqua són dies de tancament obligat. Les pastisseries, fleques, botigues de conveniència i els altres establiments que la llei exclou sí que poden obrir." },
        { question: "Quan és la Passió d'Esparreguera i la d'Olesa el 2027?", answer: `La d'Esparreguera, ${span(esp.seasonFrom, esp.seasonTo, "ca")}, amb funció ${espHoly}. La d'Olesa, ${olesa.dates.length} funcions ${span(olesaFirst, olesaLast, "ca")}, entre les quals ${olesaHoly}.` },
        { question: "Quan és la Pasqua Granada del 2027?", answer: `El ${d(E.whitMonday, "ca")}. No és festiu a tot Catalunya: és festa local a Barcelona i als municipis que la trien.` },
      ]),
      ...paras(verifiedLine("ca", EASTER_VERIFIED)),
      ...b2Related([...RELATED], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        `**En Cataluña, la Semana Santa de 2027, ${span(E.palmSunday, E.easterSunday, "es")}, tiene dos festivos: el Viernes Santo, ${dm(E.goodFriday, "es")}, y el Lunes de Pascua, ${dm(E.easterMonday, "es")}.** El Jueves Santo (${dm(E.holyThursday, "es")}) es laborable, aunque es festivo en casi todo el resto de España. Con el fin de semana salen ${easterRun.days} días seguidos de fiesta, ${runWords(easterRun, "es")}. En los colegios, las vacaciones de Semana Santa van ${runWords({ from: E.schoolFrom, to: E.schoolTo, days: 0 }, "es")}, y se vuelve a clase el ${d(school.back, "es")}.`,
      ),
      keyFacts("La Semana Santa de 2027, de un vistazo", [
        { label: "Domingo de Ramos", value: cap(d(E.palmSunday, "es")) },
        { label: "Jueves Santo", value: `${cap(d(E.holyThursday, "es"))}: laborable en Cataluña` },
        { label: "Viernes Santo", value: `${cap(d(E.goodFriday, "es"))}: festivo en toda Cataluña` },
        { label: "Domingo de Pascua", value: cap(d(E.easterSunday, "es")) },
        { label: "Lunes de Pascua", value: `${cap(d(E.easterMonday, "es"))}: festivo, salvo en Arán` },
        { label: "Vacaciones escolares", value: `${cap(runWords({ from: E.schoolFrom, to: E.schoolTo, days: 0 }, "es"))}; se vuelve el ${d(school.back, "es")}` },
        { label: "Puente con un día", value: `Pidiendo el ${thursday}: ${thursdayRun.days} días, ${runWords(thursdayRun, "es")}` },
        ...(localSum ? [{ label: "Fiestas locales junto a Semana Santa", value: `${cap(localSum)}${pending ? ", pendientes del DOGC" : ""}` }] : []),
      ]),
      callout(
        "official",
        "De dónde salen estas fechas",
        "Los festivos, de la Orden EMT/52/2026 (DOGC del 1 de abril de 2026), que el BOE del 13 de octubre de 2026 recoge en la relación de fiestas de 2027; las vacaciones escolares, de la Orden EDF/66/2026 (DOGC del 27 de abril de 2026). Las hemos vuelto a leer el 31 de octubre de 2026.",
      ),
      ...h2(
        "¿Qué días son festivos en Semana Santa de 2027 en Cataluña?",
        `Dos: el **Viernes Santo, ${d(E.goodFriday, "es")}**, y el **Lunes de Pascua, ${d(E.easterMonday, "es")}**. Son dos de los doce festivos de 2027 en toda Cataluña; en Arán, el Lunes de Pascua no es festivo, porque lo sustituye la Fiesta de Arán, el ${d(E.aranDay, "es")}.`,
      ),
      dayTable("es"),
      ...h2(
        "¿Es festivo el Viernes Santo de 2027?",
        `Sí. El ${d(E.goodFriday, "es")} es festivo en toda Cataluña, y también en el resto de España: la relación estatal de fiestas lo marca como fiesta nacional en todas las comunidades.`,
      ),
      ...h2(
        "¿El Jueves Santo es festivo en Cataluña?",
        `No. El ${d(E.holyThursday, "es")} es laborable en Cataluña. Según la relación de fiestas de 2027 publicada en el BOE el 13 de octubre de 2026, es festivo en todas las comunidades autónomas y en Ceuta y Melilla, **salvo en Cataluña y en la Comunitat Valenciana**. Cataluña tiene fiesta, en cambio, el Lunes de Pascua, que también es festivo en ${regions}, y en ningún otro sitio.`,
        "Si viajas o tienes familia en otra comunidad, cuenta con su calendario: en Madrid o en Andalucía el Jueves Santo es festivo y el Lunes de Pascua, no.",
      ),
      ...h2(
        "El Lunes de Pascua de 2027",
        `Es el ${d(E.easterMonday, "es")}, festivo en toda Cataluña salvo en Arán, donde lo cambia la Fiesta de Arán (${d(E.aranDay, "es")}). Es el día de la mona.${schoolOnMonday ? " Los colegios, también los de Arán, siguen de vacaciones ese día." : ""}`,
        `La Pascua Granada, siete semanas después (${d(E.whitMonday, "es")}), no es festivo en toda Cataluña: es fiesta local en Barcelona y en los municipios que la eligen. Todos los festivos de la ciudad están en [festivos de Barcelona](${municipalityPath("es", "barcelona")}).${whitPage}`,
      ),
      ...h2(
        "Vacaciones de Semana Santa 2027 en los colegios",
        `La Orden EDF/66/2026 fija las vacaciones de Semana Santa del curso ${SCHOOL_LABEL} **${runWords({ from: E.schoolFrom, to: E.schoolTo, days: 0 }, "es")}, ambos incluidos**. El último día de clase antes de las vacaciones es el ${d(school.lastClass, "es")}, el primer día laborable sin clase es el ${d(school.firstWeekdayOff, "es")} y se vuelve al colegio el **${d(school.back, "es")}**. Vale para todos los colegios e institutos de Cataluña, públicos y privados.`,
        "Los cuatro días de libre disposición de cada colegio no pueden caer dentro de estas vacaciones, según la misma orden. Las dos fiestas locales del municipio sí son festivo escolar: donde una toca a las vacaciones, las alarga (debajo, los municipios donde pasa en 2027).",
        `Todo el curso, con la Navidad y los festivos, está en el ${schoolLink(`calendario escolar ${SCHOOL_LABEL}`)}.`,
      ),
      ...(locals.length
        ? [
            ...h2(
              "Fiestas locales alrededor de Semana Santa",
              pending
                ? "Las fiestas locales de 2027 todavía no están en el DOGC: la orden de 2026 salió el 17 de diciembre de 2025. Algunos ayuntamientos ya han aprobado las suyas, y en estos una cae junto a la Semana Santa:"
                : "Según la orden de fiestas locales de 2027, en estos municipios una cae junto a la Semana Santa:",
            ),
            list(...locals),
            ...paras(`Para el resto de municipios, mira su página en [festivos locales por municipio](/es/festivos/), o la lista entera en ${localLink("festivos locales de todos los municipios")}.`),
          ]
        : []),
      ...h2(
        "Puentes de Semana Santa 2027: qué días pedir",
        "Si trabajas de lunes a viernes, estas son las combinaciones que deja el calendario. Es un cálculo nuestro, no un derecho: las vacaciones se piden y se pactan con la empresa, y los turnos y los convenios pueden cambiarlo todo.",
      ),
      optionTable("es"),
      ...paras(
        `Con cuatro días de vacaciones, ${leaveWords(weekBefore, "es").replace(/^D/, "d")}, la fiesta va ${runWords(weekBeforeRun, "es")}${matchesSchool ? ": exactamente las vacaciones escolares" : ""}. En Arán, el ${d(E.easterMonday, "es")} es laborable (el festivo pasa al ${dm(E.aranDay, "es")}) y estos cálculos no se aplican igual.`,
      ),
      ...h2(
        "¿Abren las tiendas el Viernes Santo y el Lunes de Pascua?",
        `**El ${d(E.easterSunday, "es")} y el ${d(E.easterMonday, "es")}, las tiendas con horario general deben cerrar.** La ley de comercio catalana (Llei 18/2017, artículo 36) fija el domingo y el lunes de Pascua como días de cierre, igual que el 1 y el 6 de enero, el 1 de mayo, el 24 de junio, el 11 de septiembre y el 25 y el 26 de diciembre.`,
        `**El Viernes Santo, en general, tampoco.** No es ninguno de los ocho festivos de apertura del calendario general de 2027 (Orden EMT/89/2026), que son ${general}. Cada ayuntamiento añade dos y podría elegirlo, igual que las empresas de tiendas de alimentación y compra diaria, que pueden cambiar hasta tres fechas del calendario general. Los ayuntamientos debían comunicarlos antes del 1 de noviembre de 2026 y la lista aún no se ha publicado; si un ayuntamiento no elige ninguno, se aplican los días ${municipalDefault}. Lo mismo vale para el Domingo de Ramos.`,
        `Las tiendas que la ley deja fuera de esos límites (artículo 37), como las pastelerías y panaderías, las de conveniencia, las farmacias o las de alimentación de hasta 300 m², pueden abrir cualquier día: por eso las pastelerías pueden abrir el Lunes de Pascua, el día de la mona. En Barcelona, la excepción de la zona turística solo vale del 15 de mayo al 15 de septiembre. El detalle está en ${b2link("shops", "es", "la guía de tiendas abiertas en domingos y festivos")}.`,
      ),
      ...h2(
        "Metro y transporte en Semana Santa",
        "El Viernes Santo y el Lunes de Pascua son festivos, y el transporte público tiene el horario de festivos de cada operador. En el metro de Barcelona, el horario general de TMB deja estos días así:",
      ),
      metroTable("es"),
      ...paras(
        `Los horarios de las paradas de autobús de TMB se consultan por fecha, según si el día es laborable o festivo. Para Rodalies, FGC y los autobuses interurbanos, mira el horario del día concreto en la web de cada operador antes de salir. Horarios del metro y del NitBus, en ${b2link("hours", "es", "el horario del metro de Barcelona")}.`,
      ),
      ...h2(
        "Tradiciones: la mona, las procesiones y la Passió",
        "Algunas de las citas de Semana Santa con fecha oficial, y lo que aún no se ha publicado:",
      ),
      list(
        `**La mona de Pascua.** Es el regalo de los padrinos a los ahijados, y Mercats de Barcelona la sitúa el Lunes de Pascua, que en 2027 es el ${dm(E.easterMonday, "es")}.`,
        `**La Processó de Verges.** Se celebra cada Jueves Santo (en 2027, el ${dm(E.holyThursday, "es")}), con la Dansa de la Mort, y la Generalitat la declaró fiesta tradicional de interés nacional en 1983. La hora de 2027 aún no se ha publicado.`,
        `**La Procesión del Santo Entierro de Tarragona.** Sale el Viernes Santo (${dm(E.goodFriday, "es")}), está documentada desde 1550 y el Govern la declaró de interés nacional en 2010, según el Ayuntamiento de Tarragona. La hora de 2027 aún no se ha publicado.`,
        `**La Passió de Esparreguera.** La [temporada 2027](${esp.url}) va ${span(esp.seasonFrom, esp.seasonTo, "es")} en el Teatre de La Passió, su escenario desde ${esp.theatreSince}. En marzo, las funciones son en el formato tradicional, de mañana y tarde: los días ${espDays}, es decir, también ${espHoly}. En abril y mayo las hay en un formato nuevo, más corto.`,
        `**La Passió de Olesa de Montserrat.** La [temporada 2027](${olesa.url}) tiene ${olesa.dates.length} funciones, ${runWords({ from: olesaFirst, to: olesaLast, days: 0 }, "es")}, en el Teatre de la Passió de Olesa (su escenario desde ${olesa.theatreSince}); durante las vacaciones escolares de Semana Santa, ${olesaHoly}. Todas están subtituladas en castellano e inglés.`,
      ),
      ...paras(
        "Las fechas de las dos Passions son las que publicaban los organizadores el 31 de octubre de 2026: compruébalas en su web antes de comprar entradas.",
        `Si buscas una salida, mira ${montserrat}, ${link("trains", "es", "las escapadas en tren")} o ${link("weekend", "es", "qué hacer este fin de semana")}.`,
      ),
      faq([
        { question: "¿Qué días son festivos en Semana Santa de 2027 en Cataluña?", answer: `El Viernes Santo, ${d(E.goodFriday, "es")}, y el Lunes de Pascua, ${d(E.easterMonday, "es")}. Con el fin de semana suman ${easterRun.days} días seguidos, ${runWords(easterRun, "es")}. El Jueves Santo es laborable.` },
        { question: "¿Es festivo el Viernes Santo de 2027?", answer: `Sí: el ${d(E.goodFriday, "es")} es festivo en toda Cataluña y en toda España.` },
        { question: "¿El Jueves Santo de 2027 es festivo en Cataluña?", answer: `No. El ${d(E.holyThursday, "es")} es laborable en Cataluña. Es festivo en todas las comunidades autónomas salvo en Cataluña y en la Comunitat Valenciana.` },
        { question: "¿Cuándo es el Lunes de Pascua de 2027?", answer: `El ${d(E.easterMonday, "es")}. Es festivo en toda Cataluña salvo en Arán, donde lo sustituye la Fiesta de Arán, el ${dm(E.aranDay, "es")}.` },
        { question: "¿Cuándo son las vacaciones de Semana Santa 2027 en los colegios de Cataluña?", answer: `${cap(runWords({ from: E.schoolFrom, to: E.schoolTo, days: 0 }, "es"))}, ambos incluidos. El último día de clase es el ${d(school.lastClass, "es")} y se vuelve el ${d(school.back, "es")}.` },
        { question: "¿Qué puente se puede hacer en Semana Santa de 2027?", answer: `Sin pedir ningún día, ${easterRun.days} días (${runWords(easterRun, "es")}). Pidiendo el ${thursday}, ${thursdayRun.days} días (${runWords(thursdayRun, "es")}). Pidiendo ${leaveWords(weekBefore, "es").replace(/^D/, "d")}, ${weekBeforeRun.days} días, ${runWords(weekBeforeRun, "es")}${matchesSchool ? ": las mismas fechas que las vacaciones escolares" : ""}.` },
        { question: "¿Abren las tiendas el Lunes de Pascua?", answer: "Las de horario general, no: el domingo y el lunes de Pascua son días de cierre obligado. Las pastelerías, panaderías, tiendas de conveniencia y los demás establecimientos que la ley excluye sí pueden abrir." },
        { question: "¿Cuándo es la Passió de Esparreguera y la de Olesa en 2027?", answer: `La de Esparreguera, ${span(esp.seasonFrom, esp.seasonTo, "es")}, con función ${espHoly}. La de Olesa, ${olesa.dates.length} funciones ${span(olesaFirst, olesaLast, "es")}, entre ellas ${olesaHoly}.` },
        { question: "¿Cuándo es la Pascua Granada de 2027?", answer: `El ${d(E.whitMonday, "es")}. No es festivo en toda Cataluña: es fiesta local en Barcelona y en los municipios que la eligen.` },
      ]),
      ...paras(verifiedLine("es", EASTER_VERIFIED)),
      ...b2Related([...RELATED], "es"),
    ];
  }

  return [
    lead(
      `**Catalonia has two public holidays over Easter 2027: Good Friday, ${dm(E.goodFriday, "en")}, and Easter Monday, ${dm(E.easterMonday, "en")}.** Maundy Thursday (${dm(E.holyThursday, "en")}) is a working day, although it is a holiday in almost all the rest of Spain. With the weekend that makes ${easterRun.days} days off in a row, ${runWords(easterRun, "en")}. Schools are off for Easter from ${runWords({ from: E.schoolFrom, to: E.schoolTo, days: 0 }, "en")}, and classes restart on ${d(school.back, "en")}.`,
    ),
    keyFacts("Easter 2027 at a glance", [
      { label: "Palm Sunday", value: d(E.palmSunday, "en") },
      { label: "Maundy Thursday", value: `${d(E.holyThursday, "en")}: a working day in Catalonia` },
      { label: "Good Friday", value: `${d(E.goodFriday, "en")}: public holiday across Catalonia` },
      { label: "Easter Sunday", value: d(E.easterSunday, "en") },
      { label: "Easter Monday", value: `${d(E.easterMonday, "en")}: public holiday, except in Aran` },
      { label: "School Easter holidays", value: `${cap(runWords({ from: E.schoolFrom, to: E.schoolTo, days: 0 }, "en"))}; back on ${d(school.back, "en")}` },
      { label: "Long weekend with one day off", value: `Take ${thursday} off: ${thursdayRun.days} days, ${runWords(thursdayRun, "en")}` },
      ...(localSum ? [{ label: "Local holidays next to it", value: `${cap(localSum)}${pending ? ", pending the DOGC order" : ""}` }] : []),
    ]),
    callout(
      "official",
      "Where these dates come from",
      "The holidays come from Order EMT/52/2026 (DOGC, Catalonia's official gazette, 1 April 2026), listed again in the BOE's national list of 2027 holidays on 13 October 2026; the school holidays from Order EDF/66/2026 (DOGC, 27 April 2026). We re-read them on 31 October 2026.",
    ),
    ...h2(
      "Which days are public holidays over Easter 2027 in Catalonia?",
      `Two: **Good Friday, ${d(E.goodFriday, "en")}**, and **Easter Monday, ${d(E.easterMonday, "en")}**. They are two of Catalonia's twelve holidays in 2027; in Aran, Easter Monday is not a holiday, because the Festa d'Aran on ${d(E.aranDay, "en")} replaces it.`,
    ),
    dayTable("en"),
    ...h2(
      "Is Good Friday 2027 a public holiday?",
      `Yes. ${d(E.goodFriday, "en")} is a public holiday across Catalonia and the rest of Spain: the national list marks it as a national holiday in every region.`,
    ),
    ...h2(
      "Is Maundy Thursday a holiday in Catalonia?",
      `No. ${d(E.holyThursday, "en")} is a working day in Catalonia. According to the list of 2027 holidays published in the BOE (Spain's official gazette) on 13 October 2026, it is a holiday in every autonomous community and in Ceuta and Melilla **except Catalonia and the Valencian Community**. Catalonia has Easter Monday off instead, which is also a holiday in ${regions}, and nowhere else.`,
      "If you are travelling or have family elsewhere in Spain, go by their calendar: in Madrid or Andalusia Maundy Thursday is a holiday and Easter Monday is not.",
    ),
    ...h2(
      "Easter Monday 2027",
      `It is ${d(E.easterMonday, "en")}, a public holiday across Catalonia except in Aran, which swaps it for the Festa d'Aran (${d(E.aranDay, "en")}). It is the day of the mona, the Easter cake.${schoolOnMonday ? " Schools, Aran's included, are still on holiday that day." : ""}`,
      `Whit Monday (Pasqua Granada), seven weeks later on ${d(E.whitMonday, "en")}, is not a Catalonia-wide holiday: it is a local holiday in Barcelona and the towns that choose it.${hasEnglishPage("barcelona") ? ` Every Barcelona holiday is on [Barcelona public holidays](${municipalityPath("en", "barcelona")}).` : ""}${whitPage}`,
    ),
    ...h2(
      "School Easter holidays 2027 in Catalonia",
      `Order EDF/66/2026 sets the ${SCHOOL_LABEL} Easter school holidays **from ${runWords({ from: E.schoolFrom, to: E.schoolTo, days: 0 }, "en")}, both included**. The last day of school before the break is ${d(school.lastClass, "en")}, the first weekday off is ${d(school.firstWeekdayOff, "en")} and children go back on **${d(school.back, "en")}**. It applies to every school in Catalonia, state and private.`,
      "Each school's four free-choice days cannot fall inside this break, under the same order. The town's two local holidays are school holidays too: where one sits next to the break, it makes it longer (below, the towns where that happens in 2027).",
      `The whole year, with Christmas and the public holidays, is in ${schoolLink(`the ${SCHOOL_LABEL} school calendar`)}.`,
    ),
    ...(locals.length
      ? [
          ...h2(
            "Local holidays around Easter",
            pending
              ? "The 2027 local holidays are not in the DOGC yet: the 2026 order came out on 17 December 2025. Some councils have already approved theirs, and in these one falls right next to Easter:"
              : "According to the 2027 local-holiday order, in these towns one falls right next to Easter:",
          ),
          list(...locals),
          ...paras(`For every other town, see ${localLink("local holidays in Catalonia")}.`),
        ]
      : []),
    ...h2(
      "Easter 2027 long weekends: which days to take off",
      "If you work Monday to Friday, these are the combinations the calendar allows. They are our calculation, not an entitlement: leave has to be requested and agreed with your employer, and shifts or collective agreements can change everything.",
    ),
    optionTable("en"),
    ...paras(
      `With four days of leave, ${leaveWords(weekBefore, "en")}, the break runs ${runWords(weekBeforeRun, "en")}${matchesSchool ? ": exactly the school holidays" : ""}. In Aran, ${d(E.easterMonday, "en")} is a working day (the holiday moves to ${dm(E.aranDay, "en")}), so these combinations do not work the same way there.`,
    ),
    ...h2(
      "Are shops open on Good Friday and Easter Monday?",
      `**On ${d(E.easterSunday, "en")} and ${d(E.easterMonday, "en")}, shops on general hours must close.** Catalonia's retail law (Llei 18/2017, article 36) makes Easter Sunday and Easter Monday closing days, like 1 and 6 January, 1 May, 24 June, 11 September and 25 and 26 December.`,
      `**On Good Friday, as a rule, they do not open either.** It is not one of the eight general opening days in 2027 (Order EMT/89/2026), which are ${general}. Each town council adds two days and could choose it, and so could companies running everyday food shops, which may swap up to three dates of the general calendar. Councils had to report their days before 1 November 2026 and the list is not out yet; a council that chooses none gets ${municipalDefault}. The same goes for Palm Sunday.`,
      `Shops the law exempts from these limits (article 37), such as cake shops and bakeries, convenience stores, pharmacies and food shops of up to 300 m², may open any day: that is why cake shops can open on Easter Monday, the day of the mona. In Barcelona, the tourist-zone exception only applies from 15 May to 15 September. Details in ${b2link("shops", "en", "our guide to shops open on Sundays and holidays")}.`,
    ),
    ...h2(
      "Metro and public transport over Easter",
      "Good Friday and Easter Monday are public holidays, so public transport runs each operator's holiday timetable. On the Barcelona metro, TMB's standing rules give these hours:",
    ),
    metroTable("en"),
    ...paras(
      `TMB's bus-stop timetables are shown by date, depending on whether the day is a working day or a holiday. For Rodalies, FGC and intercity buses, check the timetable for the day on each operator's website before you set off. Metro and NitBus hours: ${b2link("hours", "en", "Barcelona metro hours")}.`,
    ),
    ...h2(
      "Traditions: the mona, processions and the Passion plays",
      "Some Easter events with an official date, and what has not been published yet:",
    ),
    list(
      `**The mona de Pasqua.** The Easter cake godparents give their godchildren; Mercats de Barcelona places it on Easter Monday, which in 2027 is ${dm(E.easterMonday, "en")}.`,
      `**The Verges procession.** It is held every Maundy Thursday (${dm(E.holyThursday, "en")} in 2027), with the Dansa de la Mort (dance of death), and the Generalitat declared it a traditional festival of national interest in 1983. The 2027 time has not been published.`,
      `**Tarragona's Holy Burial procession (Sant Enterrament).** It goes out on Good Friday (${dm(E.goodFriday, "en")}), has been documented since 1550 and was declared of national interest by the Catalan government in 2010, according to Tarragona City Council. The 2027 time has not been published.`,
      `**La Passió d'Esparreguera.** The [2027 season](${esp.url}) runs from ${span(esp.seasonFrom, esp.seasonTo, "en")} at the Teatre de La Passió, its stage since ${esp.theatreSince}. In March, performances are in the traditional morning-and-afternoon format: on the ${espDays}, so also on ${espHoly}. April and May have performances in a new, shorter format.`,
      `**La Passió d'Olesa de Montserrat.** The [2027 season](${olesa.url}) has ${olesa.dates.length} performances, from ${runWords({ from: olesaFirst, to: olesaLast, days: 0 }, "en")}, at Olesa's Teatre de la Passió (its stage since ${olesa.theatreSince}); during the school Easter holidays, on ${olesaHoly}. All are subtitled in Spanish and English.`,
    ),
    ...paras(
      "The dates of both Passion plays are those the organisers published on 31 October 2026: check their websites before buying tickets.",
      `For a day out, see ${montserrat}, ${link("trains", "en", "day trips by train")} or ${link("weekend", "en", "what's on this weekend")}.`,
    ),
    faq([
      { question: "Which days are public holidays over Easter 2027 in Catalonia?", answer: `Good Friday, ${d(E.goodFriday, "en")}, and Easter Monday, ${d(E.easterMonday, "en")}. With the weekend that makes ${easterRun.days} days in a row, ${runWords(easterRun, "en")}. Maundy Thursday is a working day.` },
      { question: "Is Good Friday 2027 a public holiday in Barcelona?", answer: `Yes: ${d(E.goodFriday, "en")} is a public holiday in Barcelona, across Catalonia and in the whole of Spain.` },
      { question: "Is Maundy Thursday 2027 a holiday in Catalonia?", answer: `No. ${d(E.holyThursday, "en")} is a working day in Catalonia. It is a holiday in every other autonomous community except the Valencian Community.` },
      { question: "When is Easter Monday 2027?", answer: `${d(E.easterMonday, "en")}. It is a public holiday across Catalonia except in Aran, where the Festa d'Aran on ${dm(E.aranDay, "en")} replaces it.` },
      { question: "When are the Easter 2027 school holidays in Catalonia?", answer: `From ${runWords({ from: E.schoolFrom, to: E.schoolTo, days: 0 }, "en")}, both included. The last school day is ${d(school.lastClass, "en")} and classes restart on ${d(school.back, "en")}.` },
      { question: "What long weekend can I make over Easter 2027?", answer: `Without booking anything, ${easterRun.days} days (${runWords(easterRun, "en")}). Taking ${thursday} off, ${thursdayRun.days} days (${runWords(thursdayRun, "en")}). Taking ${leaveWords(weekBefore, "en")} off, ${weekBeforeRun.days} days, ${runWords(weekBeforeRun, "en")}${matchesSchool ? ": the same dates as the school holidays" : ""}.` },
      { question: "Are shops open on Easter Monday in Catalonia?", answer: "Shops on general hours are not: Easter Sunday and Easter Monday are compulsory closing days. Cake shops, bakeries, convenience stores and the other businesses the law exempts may open." },
      { question: "When are the Esparreguera and Olesa Passion plays in 2027?", answer: `Esparreguera's runs from ${span(esp.seasonFrom, esp.seasonTo, "en")}, with performances on ${espHoly}. Olesa's has ${olesa.dates.length} performances from ${span(olesaFirst, olesaLast, "en")}, including ${olesaHoly}.` },
      { question: "Is Easter Monday a holiday in Barcelona?", answer: `Yes: Easter Monday, ${d(E.easterMonday, "en")}, is a public holiday in Barcelona and across Catalonia. Only in Aran is it a working day.` },
      { question: "When is Whit Monday (Pasqua Granada) 2027?", answer: `${d(E.whitMonday, "en")}. It is not a Catalonia-wide holiday: it is a local holiday in Barcelona and the towns that choose it.` },
    ]),
    ...paras(verifiedLine("en", EASTER_VERIFIED)),
    ...b2Related([...RELATED], "en"),
  ];
}

export const EASTER_2027: B2Article = {
  key: "easter2027",
  entryKey: "guide-easter-2027-catalonia",
  categoryKey: "calendar",
  sources: easterSources(),
  // Reused from the manifest (no new photograph). Same alt and caption as the
  // Montserrat guide's second image: media rows are keyed by file.
  heroKey: MONTSERRAT_FREE.secondaryKey,
  heroAlt: MONTSERRAT_FREE.secondaryAlt,
  heroCaption: MONTSERRAT_FREE.secondaryCaption,
  verifiedAt: EASTER_VERIFIED,
  publishedAt: "2026-10-31T12:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...EASTER_META[locale], blocks: buildEasterBody(locale) }]),
  ) as B2Article["editions"],
};
