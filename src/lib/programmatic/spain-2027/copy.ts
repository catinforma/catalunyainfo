import type { Plan } from "@/lib/content/holidays/bridges";
import { BOE_2027, REGIONS, type BoeCode, type Region } from "@/lib/programmatic/holidays/boe-2027";
import { MONTHS, dayMonth, dayMonthYear, weekdayName } from "@/lib/programmatic/holidays/format";
import { joinList } from "@/lib/programmatic/holidays/names";

import {
  COMMON_DATES,
  SUBSTITUTIONS,
  YEAR,
  commonWorkingDays,
  communityDays,
  communityRuns,
  communityWorkingDays,
  dayCount,
  isSubstitutionName,
  nationalNotKept,
  ownDays,
  runSummary,
  spainRuns,
  variableDates,
  weekendDays,
  workingDaysByMonth,
  type CommunityDay,
} from "./calendar";
import { COMMUNITIES, names, type CommunityNames } from "./communities";
import { BOE_REF, SOURCES, SOURCES_READ_ON, latestReading, type LocalStatus } from "./sources";

/**
 * Spanish words for the Spain-wide 2027 pages. Every number and date comes
 * from `calendar.ts` (the BOE's table) or `sources.ts` (the official texts
 * read for each community); nothing here states a fact of its own.
 */

/** Titles Google shows in full; the brand suffix is dropped above it (seo/metadata.ts). */
export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 165;

const MONTH_ABBR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "1-3 ene", "30 oct-1 nov". */
export function shortRange(from: string, to: string): string {
  const day = (iso: string) => Number(iso.slice(8, 10));
  const month = (iso: string) => MONTH_ABBR[Number(iso.slice(5, 7)) - 1];
  return from.slice(0, 7) === to.slice(0, 7) ? `${day(from)}-${day(to)} ${month(to)}` : `${day(from)} ${month(from)}-${day(to)} ${month(to)}`;
}

/** "1 y 6 ene, 19, 25 y 26 mar, 1 may": days grouped by month, for titles and descriptions. */
export function compactDates(dates: readonly string[]): string {
  const groups = new Map<number, number[]>();
  for (const iso of [...dates].sort()) {
    const month = Number(iso.slice(5, 7)) - 1;
    groups.set(month, [...(groups.get(month) ?? []), Number(iso.slice(8, 10))]);
  }
  return [...groups.entries()].map(([month, days]) => `${joinList(days.map(String), "es")} ${MONTH_ABBR[month]}`).join(", ");
}

/** "viernes 19 de marzo". */
export function weekdayDate(iso: string): string {
  return `${weekdayName(iso, "es")} ${dayMonth(iso, "es")}`;
}

const WEEKDAY_ABBR = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

/** "vie 19 mar": the weekday and date in a list of many days. */
export function shortWeekdayDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${WEEKDAY_ABBR[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_ABBR[d.getUTCMonth()]}`;
}

/** "del viernes 1 al domingo 3 de enero", "del sábado 9 al martes 12 de octubre", "del sábado 30 de octubre al lunes 1 de noviembre". */
export function rangeWords(from: string, to: string): string {
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const start = sameMonth ? `${weekdayName(from, "es")} ${Number(from.slice(8, 10))}` : weekdayDate(from);
  return `del ${start} al ${weekdayDate(to)}`;
}

export const KIND_LABEL: Record<BoeCode, string> = {
  "*": "Nacional (no sustituible)",
  "**": "Nacional (la comunidad no la sustituye)",
  "***": "Propia de la comunidad",
};

/** The BOE's own legend, as printed under its table. */
export const BOE_LEGEND: Record<BoeCode, string> = {
  "*": "Fiesta Nacional no sustituible",
  "**": "Fiesta Nacional respecto de la que no se ha ejercido la facultad de sustitución",
  "***": "Fiesta de Comunidad Autónoma",
};

/** "Lunes siguiente a asunción de la Virgen" → adds why: the 15th is a Sunday. */
export function dayName(d: Pick<CommunityDay, "name" | "replaces">): string {
  if (!d.replaces) return d.name;
  return `${d.name} (traslado del ${weekdayDate(d.replaces)}, Asunción de la Virgen)`;
}

/** "en toda España", "también en 12 comunidades y ciudades", "solo aquí". */
export function whereElse(d: CommunityDay): string {
  if (d.common) return "En toda España";
  if (d.alsoIn.length === 0) return "Solo aquí";
  const n = d.alsoIn.length;
  if (n <= 3) return `También en ${joinList(d.alsoIn.map((r) => names(r).short), "es")}`;
  return `También en ${territoryCount(d.alsoIn)}`;
}

/** "fines de semana largos" with the right number word. */
function longWeekends(n: number): string {
  return n === 1 ? "1 fin de semana largo" : `${n} fines de semana largos`;
}

/* ------------------------------------------------------------ Community --- */

export function communityTitle(c: CommunityNames): string {
  const n = dayCount(c.region);
  const island = SOURCES[c.region].subRegional;
  const count = island ? `${n} días + 1 ${island.short}` : `${n} días`;
  const full = `Festivos ${YEAR} en ${c.short}: ${count}, puentes y fechas`;
  if (full.length <= TITLE_LIMIT) return full;
  return `Festivos ${YEAR} en ${c.short}: ${count} y puentes`;
}

export function communityH1(c: CommunityNames): string {
  return `Calendario laboral ${YEAR} ${c.de}: festivos y puentes`;
}

export function communityDescription(c: CommunityNames): string {
  const days = communityDays(c.region);
  const free = runSummary(communityRuns(c.region)).free;
  const island = SOURCES[c.region].subRegional;
  const head = island
    ? `${c.Full} ${has(c)} ${days.length} festivos en ${YEAR} en todas las islas, más 1 ${island.unit} (BOE): `
    : `${c.Full} ${has(c)} ${days.length} festivos en ${YEAR} (BOE): `;
  const base = `${head}${compactDates(days.map((d) => d.date))}.`;
  const withRuns = `${base} ${capitalise(longWeekends(free))} sin gastar vacaciones.`;
  return withRuns.length <= DESCRIPTION_LIMIT ? withRuns : base;
}

/** "tiene", or "tienen" for the Illes Balears. */
function has(c: CommunityNames): string {
  return c.plural ? "tienen" : "tiene";
}

/** "5 comunidades", "15 comunidades, Ceuta y Melilla": how many territories, cities by name. */
export function territoryCount(regions: readonly Region[]): string {
  const cities = regions.filter((r) => r === "CE" || r === "ML");
  const communities = regions.length - cities.length;
  const parts = [...(communities ? [communities === 1 ? "1 comunidad" : `${communities} comunidades`] : []), ...cities.map((r) => names(r).short)];
  return joinList(parts, "es");
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** The first paragraph: the count, the days that are not common to all Spain, the source. */
export function communityLead(c: CommunityNames): string {
  const n = dayCount(c.region);
  const own = ownDays(c.region);
  const ownWords = joinList(
    own.map((d) => `${shortName(d)} (${weekdayDate(d.date)})`),
    "es",
  );
  const where = c.city ? "la ciudad" : "la comunidad";
  const local = SOURCES[c.region].local;
  const tail =
    local.days?.length && local.daysScope === "all"
      ? `A ellos se suman sus 2 fiestas locales (${joinList(local.days.map((d) => weekdayDate(d.date)), "es")}): ${n + local.days.length} en total.`
      : `A ellos se suman los 2 festivos locales de cada municipio.`;
  return (
    `${c.Full} ${has(c)} ${n} festivos laborales en ${YEAR}, según la lista que el BOE publicó el ${dayMonthYear("2026-10-13", "es")}: ` +
    `los ${COMMON_DATES.length} que son festivo en toda España y ${own.length === 1 ? "1 que depende" : `${own.length} que dependen`} de ${where}: ${ownWords}. ` +
    tail
  );
}

/** Short Spanish name for prose: the BOE row name without the substitution wording. */
export function shortName(d: Pick<CommunityDay, "name" | "replaces" | "date">): string {
  if (d.replaces) return `el traslado de la Asunción`;
  return d.name;
}

export interface Faq {
  question: string;
  answer: string;
}

function holyThursdayAnswer(c: CommunityNames): string {
  const has = communityDays(c.region).some((d) => d.date === "2027-03-25");
  return has
    ? `Sí. El jueves 25 de marzo de ${YEAR} es festivo ${c.en}, y el viernes 26 (Viernes Santo) también, como en toda España.`
    : `No. El jueves 25 de marzo de ${YEAR} no es festivo ${c.en}; el viernes 26 (Viernes Santo) sí, como en toda España.`;
}

export function runLine(run: Pick<Plan, "from" | "to" | "days" | "take">): string {
  const leave =
    run.take.length === 0
      ? "sin vacaciones"
      : run.take.length === 1
        ? `con 1 día de vacaciones (${weekdayDate(run.take[0]!)})`
        : `con ${run.take.length} días de vacaciones (${joinList(run.take.map(weekdayDate), "es")})`;
  return `${capitalise(rangeWords(run.from, run.to))}: ${run.days} días ${leave}`;
}

export function localStatusLine(c: CommunityNames, local: LocalStatus): string {
  if (local.status === "published" && local.y2027) {
    return `Publicados: ${local.y2027.title} (${local.y2027.ref}).`;
  }
  if (local.status === "published" && local.parts?.length) {
    return `Publicados, en ${local.parts.length} boletines: ${joinList(local.parts.map((p) => `${p.place} (${p.text.ref})`), "es")}.`;
  }
  if (local.status === "partial") return `Publicados en parte: ${local.note ?? ""}`.trim();
  const last = local.y2026 ? ` En 2026 se publicaron el ${dayMonthYear(local.y2026.date, "es")} (${local.y2026.ref}).` : "";
  if (local.checked) return `Pendientes: ${c.en} todavía no se ha publicado la lista de ${YEAR} (consultado hasta el ${local.checked.through}).${last}`;
  return `Pendientes a ${dayMonthYear(SOURCES_READ_ON, "es")}: ${c.en} todavía no se ha publicado la lista de ${YEAR}.${last}`;
}

export function communityFaq(c: CommunityNames): Faq[] {
  const days = communityDays(c.region);
  const runs = communityRuns(c.region);
  const free = runs.filter((r) => r.take.length === 0);
  const s = SOURCES[c.region];
  const island = s.subRegional;
  return [
    {
      question: `¿Cuántos festivos hay en ${YEAR} ${c.en}?`,
      answer:
        `${days.length} de ámbito nacional y ${c.city ? "de la ciudad" : "autonómico"}, según el BOE de 13 de octubre de 2026: ${compactDates(days.map((d) => d.date))}.` +
        (island ? ` ${island.faq}` : "") +
        (s.local.days?.length && s.local.daysScope === "all"
          ? ` Con sus 2 fiestas locales, ${joinList(s.local.days.map((d) => `${dayMonth(d.date, "es")} (${d.name})`), "es")}, son ${days.length + s.local.days.length}.`
          : s.local.days?.length
            ? ` Cada municipio añade hasta 2 festivos locales; uno de ellos es común a toda la comunidad: ${joinList(s.local.days.map((d) => `${dayMonth(d.date, "es")} (${d.name})`), "es")}.`
            : ` Cada municipio añade hasta 2 festivos locales.`),
    },
    { question: `¿Es festivo el Jueves Santo de ${YEAR} ${c.en}?`, answer: holyThursdayAnswer(c) },
    {
      question: `¿Qué puentes hay en ${YEAR} ${c.en}?`,
      answer:
        `Sin gastar vacaciones, ${longWeekends(free.length)}: ${joinList(free.map((r) => rangeWords(r.from, r.to)), "es")}. ` +
        `Cálculo de CatalunyaInfo sobre los festivos del BOE, para una semana de lunes a viernes y sin los festivos locales.`,
    },
    {
      question: `¿Cuándo se publican los festivos locales de ${YEAR} ${c.en}?`,
      answer: `${localStatusLine(c, s.local)} Se publican en ${s.local.bulletinShort}.`,
    },
  ];
}

/* ------------------------------------------------------------------ Hub --- */

export const HUB = {
  title: `Calendario laboral ${YEAR} en España: festivos por comunidad`,
  h1: `Calendario laboral ${YEAR} en España: festivos por comunidad autónoma`,
  breadcrumb: `Calendario laboral ${YEAR} en España`,
} as const;

export function hubDescription(): string {
  return (
    `${COMMON_DATES.length} festivos en toda España en ${YEAR} (${compactDates(COMMON_DATES)}) y los de cada comunidad, ` +
    `Ceuta y Melilla, según el BOE.`
  );
}

export function hubLead(): string {
  const counts = COMMUNITIES.map((c) => dayCount(c.region));
  const twelve = counts.filter((n) => n === 12).length;
  const others = COMMUNITIES.filter((c) => dayCount(c.region) !== 12);
  const otherWords = others.map((c) => `${c.short} tiene ${dayCount(c.region)}${SOURCES[c.region].subRegional ? ` y 1 ${SOURCES[c.region].subRegional!.unit} en cada isla` : ""}`);
  return (
    `El BOE publicó el 13 de octubre de 2026 la lista oficial de fiestas laborales de ${YEAR} de toda España. ` +
    `${COMMON_DATES.length} días son festivo en todas partes; el resto los fija cada comunidad autónoma y las ciudades de Ceuta y Melilla. ` +
    `${twelve} de los 19 territorios tienen 12 festivos${others.length ? `; ${joinList(otherWords, "es")}` : ""}. ` +
    `A ellos se suman hasta 2 festivos locales por municipio.`
  );
}

/** "Resolución de 8 de octubre de 2026, de la Dirección General de Trabajo, … (BOE-A-2026-21254, BOE de 13 de octubre de 2026)". */
export function boeLine(): string {
  return `${BOE_REF.title} (${BOE_REF.id}, BOE de ${dayMonthYear(BOE_REF.date, "es")})`;
}

/** "Enero" … "Diciembre". */
export function monthName(month: number): string {
  return capitalise(MONTHS.es[month - 1]!);
}

/** The year's Monday-to-Friday days, and what is left once the holidays are out: every figure counted, none typed. */
export function workingDayFigures() {
  const weekdays = workingDaysByMonth([]).reduce((a, b) => a + b, 0);
  const perRegion = REGIONS.map((r) => communityWorkingDays(r));
  return { weekdays, common: commonWorkingDays(), min: Math.min(...perRegion), max: Math.max(...perRegion) };
}

/** How many of the nineteen local lists are out, in part, or pending. */
export function localStatusCounts() {
  const of = (status: LocalStatus["status"]) => REGIONS.filter((r) => SOURCES[r].local.status === status).length;
  return { published: of("published"), partial: of("partial"), pending: of("pending") };
}

/** The dates that stand in for another day (the BOE's substitution rows), with where. */
export function substitutionDates(): { date: string; regions: Region[] }[] {
  return variableDates()
    .map((v) => ({ date: v.date, rows: v.rows.filter((r) => SUBSTITUTIONS[r.name]) }))
    .filter((v) => v.rows.length > 0)
    .map((v) => ({ date: v.date, regions: REGIONS.filter((r) => v.rows.some((row) => row.marks[r])) }));
}

/**
 * The hub's questions (24 Nov 2026): the ones Search Console shows for the
 * family ("cuantos festivos hay en el calendario laboral", "calendario
 * laboral 2027 pdf", "calendario laboral oficial", "boe festivos 2027",
 * "dias laborables 2027") and the ones the pages that rank above answer
 * (Jueves Santo, San José, the Sunday holiday). Every answer is built from
 * the BOE table and `sources.ts`; the one figure from another text is the
 * ceiling of fourteen, Estatuto de los Trabajadores, art. 37.2 (BOE-A-2015-11430,
 * read on boe.es on 24 Nov 2026: «Las fiestas laborales, que tendrán carácter
 * retribuido y no recuperable, no podrán exceder de catorce al año, de las
 * cuales dos serán locales.»).
 */
export function hubFaq(): Faq[] {
  const others = COMMUNITIES.filter((c) => dayCount(c.region) !== 12);
  const twelve = COMMUNITIES.length - others.length;
  const otherWords = others.map((c) => `${c.short}, ${dayCount(c.region)}${SOURCES[c.region].subRegional ? ` más 1 ${SOURCES[c.region].subRegional!.unit}` : ""}`);
  const on = (iso: string) => variableDates().find((v) => v.date === iso)?.regions ?? [];
  const holyThursday = on(`${YEAR}-03-25`);
  const notHolyThursday = REGIONS.filter((r) => !holyThursday.includes(r));
  const stJoseph = on(`${YEAR}-03-19`);
  const w = workingDayFigures();
  const st = localStatusCounts();
  const subWords = substitutionDates().map((v) => `al ${weekdayDate(v.date)} en ${joinList(v.regions.map((r) => names(r).short), "es")}`);
  return [
    {
      question: `¿Cuántos festivos hay en ${YEAR} en España?`,
      answer:
        `${COMMON_DATES.length} son festivo en toda España: ${compactDates(COMMON_DATES)}. Con los que fija cada comunidad, ${twelve} de los ${COMMUNITIES.length} territorios tienen 12` +
        `${others.length ? ` (${joinList(otherWords, "es")})` : ""}, y cada municipio añade hasta 2 fiestas locales: 14 como máximo, el tope del artículo 37.2 del Estatuto de los Trabajadores.`,
    },
    {
      question: `¿Dónde está el calendario laboral ${YEAR} oficial, en PDF?`,
      answer:
        `En el Boletín Oficial del Estado: ${BOE_REF.title} (${BOE_REF.ref}). El BOE la publica también en PDF, con la tabla de las 17 comunidades, Ceuta y Melilla. ` +
        `Las fiestas locales no están en esa tabla: las publica cada comunidad en su boletín.`,
    },
    {
      question: `¿Es festivo el Jueves Santo de ${YEAR} en toda España?`,
      answer:
        `No. El ${weekdayDate(`${YEAR}-03-25`)} de ${YEAR} es festivo en ${territoryCount(holyThursday)}` +
        `${notHolyThursday.length ? ` y laborable ${joinList(notHolyThursday.map((r) => names(r).en), "es")}` : ""}. El Viernes Santo, ${dayMonth(`${YEAR}-03-26`, "es")}, es festivo en todas partes.`,
    },
    {
      question: `¿Es festivo San José, el 19 de marzo de ${YEAR}?`,
      answer: `Solo en ${territoryCount(stJoseph)}: ${joinList(stJoseph.map((r) => names(r).short), "es")}. En el resto de España el ${weekdayDate(`${YEAR}-03-19`)} es laborable.`,
    },
    {
      question: `¿Qué pasa con el 15 de agosto de ${YEAR}, que cae en domingo?`,
      answer:
        `El 15 de agosto de ${YEAR} (Asunción de la Virgen) es domingo y la tabla del BOE no lo recoge como festivo. El festivo se traslada ${joinList(subWords, "es")}. ` +
        `En el resto de España el lunes 16 de agosto es laborable.`,
    },
    {
      question: `¿Cuántos días laborables tiene ${YEAR}?`,
      answer:
        `${YEAR} tiene ${w.weekdays} días de lunes a viernes. Sin los festivos comunes a toda España que caen entre semana quedan ${w.common}; con los de cada comunidad, ` +
        `${w.min === w.max ? w.min : `entre ${w.min} y ${w.max}`}, y hasta 2 menos por las fiestas locales. Cálculo de CatalunyaInfo sobre los festivos del BOE, para una semana de lunes a viernes.`,
    },
    {
      question: `¿Cuándo se publican los festivos locales de ${YEAR}?`,
      answer:
        `Cada comunidad los publica en su boletín oficial o, en algunas, en el boletín de cada provincia. A ${dayMonthYear(latestReading(), "es")}: ` +
        `publicados en ${st.published} de los ${REGIONS.length} territorios${st.partial ? `, en parte en ${st.partial}` : ""} y pendientes en ${st.pending}. La tabla por comunidades de esta página dice cuáles.`,
    },
  ];
}

/* -------------------------------------------------------------- Bridges --- */

export const BRIDGES = {
  title: `Puentes ${YEAR} en España: fechas por comunidad autónoma`,
  h1: `Puentes ${YEAR} en España: todos los fines de semana largos por comunidad`,
  breadcrumb: `Puentes ${YEAR}`,
} as const;

/** The runs every one of the nineteen gets with no leave. */
export function everywhereFree() {
  return spainRuns().filter((r) => r.regions.length === REGIONS.length && r.take.length === 0);
}

export function bridgesDescription(): string {
  const free = everywhereFree();
  return (
    `En ${YEAR} hay ${free.length} fines de semana largos en toda España sin gastar vacaciones (${free
      .map((r) => shortRange(r.from, r.to))
      .join(", ")}) y otros según la comunidad.`
  );
}

/** "Andalucía, Aragón y 4 más" or every name when there are few. */
export function regionsWords(regions: readonly Region[]): string {
  if (regions.length === REGIONS.length) return "Toda España";
  const missing = REGIONS.filter((r) => !regions.includes(r));
  if (regions.length >= 15) return `Toda España salvo ${joinList(missing.map((r) => names(r).short), "es")}`;
  return joinList(regions.map((r) => names(r).short), "es");
}

/** Every community with fewer days off on a Monday to Friday than it has holidays: those on a weekend. */
export function weekendLine(c: CommunityNames): string | null {
  const w = weekendDays(c.region);
  if (w.length === 0) return null;
  return (
    `${w.length === 1 ? "Uno cae" : `${w.length} caen`} en fin de semana y no ${w.length === 1 ? "da" : "dan"} un día libre más de lunes a viernes: ` +
    `${joinList(w.map((d) => `${shortName(d)} (${weekdayDate(d.date)})`), "es")}.`
  );
}

/** National days other columns keep and this one does not, in words. */
export function notKeptLine(c: CommunityNames): string | null {
  const missing = nationalNotKept(c.region);
  if (missing.length === 0) return null;
  return (
    `No ${missing.length === 1 ? "es festivo" : "son festivos"} ${c.en}, aunque sí en otras comunidades: ` +
    `${joinList(
      missing.map(
        ({ row, keptBy }) =>
          `${isSubstitutionName(row.name) ? "el traslado de la Asunción" : row.name} (${weekdayDate(row.date)}, festivo en ${keptBy.length <= 2 ? joinList(keptBy.map((r) => names(r).short), "es") : territoryCount(keptBy)})`,
      ),
      "es",
    )}.`
  );
}

/** How the community's own text compares with the BOE (the cross-check the test pins). */
export function decreeLine(c: CommunityNames): string {
  const d = SOURCES[c.region].decree;
  if (d.status === "not-found") return d.note;
  const who = c.city ? "La ciudad" : "La comunidad";
  const the = /^(Orden|Resolución)/.test(d.text.title) ? "la" : "el";
  if (d.differences) return `${who} publicó su propio calendario en ${the} ${d.text.title} (${d.text.ref}). Diferencia con el BOE: ${d.differences}`;
  if (d.covers === "own") {
    return (
      `${who} solo fijó por su cuenta ${d.dates.length === 1 ? "su fiesta propia" : "sus fiestas propias"} (${joinList(d.dates.map(weekdayDate), "es")}), ` +
      `en ${the} ${d.text.title} (${d.text.ref}), y coincide con el BOE; los demás días son los nacionales que recoge el BOE.`
    );
  }
  return `${who} publicó los mismos ${d.dates.length} días en ${the} ${d.text.title} (${d.text.ref}): coincide con el BOE día por día.`;
}

export const BOE_SOURCE ={ title: BOE_2027.name, ref: BOE_2027.ref, url: BOE_2027.url } as const;
