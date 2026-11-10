import type { Plan } from "@/lib/content/holidays/bridges";
import { REGIONS, type BoeCode, type Region } from "@/lib/programmatic/holidays/boe-2027";
import { dayMonth, dayMonthYear, weekdayName } from "@/lib/programmatic/holidays/format";
import { caA, joinList } from "@/lib/programmatic/holidays/names";

import {
  COMMON_DATES,
  YEAR,
  communityDays,
  communityRuns,
  dayCount,
  isSubstitutionName,
  nationalNotKept,
  ownDays,
  runSummary,
  spainRuns,
  weekendDays,
  type CommunityDay,
} from "./calendar";
import { editionCommunities, editionNames, type Edition, type EditionNames } from "./editions";
import { SOURCES, SOURCES_READ_ON, type LocalStatus } from "./sources";
import { SOURCE_PROSE } from "./sources-intl";

/**
 * Catalan and English words for the Spain-wide 2027 pages: the same facts as
 * the Spanish edition (copy.ts), from the same data (`calendar.ts`, the BOE
 * table, and `sources.ts`), written in each language rather than translated
 * line by line. Official titles, refs and verbatim quotes stay in Spanish,
 * the language they were published in.
 */

export const EDITION_TITLE_LIMIT = 60;
export const EDITION_DESCRIPTION_LIMIT = 155;

/** Pick the page's language. */
export function tr(locale: Edition, ca: string, en: string): string {
  return locale === "ca" ? ca : en;
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const MONTH_ABBR: Record<Edition, string[]> = {
  // Without the abbreviation's full stop: these end sentences and titles.
  ca: ["gen", "febr", "març", "abr", "maig", "juny", "jul", "ag", "set", "oct", "nov", "des"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/** "1-3 gen", "30 oct-1 nov"; "1-3 Jan". */
export function shortRangeIntl(from: string, to: string, locale: Edition): string {
  const day = (iso: string) => Number(iso.slice(8, 10));
  const month = (iso: string) => MONTH_ABBR[locale][Number(iso.slice(5, 7)) - 1];
  return from.slice(0, 7) === to.slice(0, 7) ? `${day(from)}-${day(to)} ${month(to)}` : `${day(from)} ${month(from)}-${day(to)} ${month(to)}`;
}

/** "1 i 6 gen, 19, 25 i 26 març"; "1 and 6 Jan, 19, 25 and 26 Mar". */
export function compactDatesIntl(dates: readonly string[], locale: Edition): string {
  const groups = new Map<number, number[]>();
  for (const iso of [...dates].sort()) {
    const month = Number(iso.slice(5, 7)) - 1;
    groups.set(month, [...(groups.get(month) ?? []), Number(iso.slice(8, 10))]);
  }
  return [...groups.entries()].map(([month, days]) => `${joinList(days.map(String), locale)} ${MONTH_ABBR[locale][month]}`).join(", ");
}

/** "divendres 19 de març"; "Friday 19 March". */
export function weekdayDateIntl(iso: string, locale: Edition): string {
  return `${weekdayName(iso, locale)} ${dayMonth(iso, locale)}`;
}

/** "del divendres 1 al diumenge 3 de gener"; "Friday 1 to Sunday 3 January". */
export function rangeWordsIntl(from: string, to: string, locale: Edition): string {
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const start = sameMonth ? `${weekdayName(from, locale)} ${Number(from.slice(8, 10))}` : weekdayDateIntl(from, locale);
  return locale === "ca" ? `del ${start} al ${weekdayDateIntl(to, locale)}` : `${start} to ${weekdayDateIntl(to, locale)}`;
}

/** The range without "del": for table cells. */
export function rangeCellIntl(from: string, to: string, locale: Edition): string {
  return locale === "ca" ? rangeWordsIntl(from, to, locale).replace(/^del /, "") : rangeWordsIntl(from, to, locale);
}

/* ---------------------------------------------------------------- Names --- */

/** The BOE's row names (Spanish) in Catalan and English. A test holds every row to this table. */
export const HOLIDAY_NAME: Record<string, Record<Edition, string>> = {
  "Año Nuevo": { ca: "Cap d'Any", en: "New Year's Day" },
  "Epifanía del Señor": { ca: "Reis", en: "Epiphany" },
  "Día de Andalucía": { ca: "Dia d'Andalusia", en: "Andalusia Day" },
  "Día de les Illes Balears": { ca: "Dia de les Illes Balears", en: "Balearic Islands Day" },
  "Fiesta del Eid Fitr": { ca: "Festa de l'Aïd al-Fitr", en: "Eid al-Fitr" },
  "San José": { ca: "Sant Josep", en: "St Joseph's Day" },
  "Jueves Santo": { ca: "Dijous Sant", en: "Maundy Thursday" },
  "Viernes Santo": { ca: "Divendres Sant", en: "Good Friday" },
  "Lunes de Pascua": { ca: "Dilluns de Pasqua", en: "Easter Monday" },
  "San Jorge/Día de Aragón": { ca: "Sant Jordi / Dia d'Aragó", en: "St George's Day / Aragon Day" },
  "Fiesta de Castilla y León": { ca: "Festa de Castella i Lleó", en: "Castile and León Day" },
  "Fiesta del Trabajo": { ca: "Festa del Treball", en: "Labour Day" },
  "Día de las Letras Gallegas": { ca: "Dia de les Lletres Gallegues", en: "Galician Literature Day" },
  "Eidul Adha-Fiesta Sacrificio": { ca: "Aïd al-Adha, Festa del Sacrifici", en: "Eid al-Adha, Feast of the Sacrifice" },
  "Fiesta Sacrificio-Aid Al Adha": { ca: "Festa del Sacrifici, Aïd al-Adha", en: "Feast of the Sacrifice, Eid al-Adha" },
  "Corpus Christi": { ca: "Corpus", en: "Corpus Christi" },
  "Día de Castilla-La Mancha": { ca: "Dia de Castella-la Manxa", en: "Castile-La Mancha Day" },
  "Día de la Región de Murcia": { ca: "Dia de la Regió de Múrcia", en: "Region of Murcia Day" },
  "Día de La Rioja": { ca: "Dia de la Rioja", en: "La Rioja Day" },
  "Día de San Juan": { ca: "Sant Joan", en: "St John's Day" },
  "Día de las Instituciones de Cantabria": { ca: "Dia de les Institucions de Cantàbria", en: "Cantabrian Institutions Day" },
  "Nuestra Señora de África": { ca: "Mare de Déu d'Àfrica", en: "Our Lady of Africa" },
  "Lunes siguiente a asunción de la Virgen": { ca: "Dilluns després de l'Assumpció", en: "Monday after the Assumption" },
  "Día de Asturias": { ca: "Dia d'Astúries", en: "Asturias Day" },
  "Día de Extremadura": { ca: "Dia d'Extremadura", en: "Extremadura Day" },
  "Fiesta Nacional de Cataluña": { ca: "Diada Nacional de Catalunya", en: "National Day of Catalonia (La Diada)" },
  "La Bien Aparecida": { ca: "la Bien Aparecida", en: "La Bien Aparecida (Our Lady)" },
  "Aniversario 1er Gobierno Euskadi": { ca: "Aniversari del primer Govern basc", en: "Anniversary of the first Basque Government" },
  "Día de la Comunitat Valenciana": { ca: "Dia de la Comunitat Valenciana", en: "Valencian Community Day" },
  "Sustitución 15 de agosto": { ca: "Trasllat del 15 d'agost", en: "In lieu of 15 August" },
  "Fiesta Nacional de España": { ca: "Festa Nacional d'Espanya", en: "Spain's National Day" },
  "Todos los Santos": { ca: "Tots Sants", en: "All Saints' Day" },
  "Día de la Constitución Española": { ca: "Dia de la Constitució", en: "Constitution Day" },
  "Inmaculada Concepción": { ca: "la Puríssima", en: "Immaculate Conception" },
  "Natividad del Señor": { ca: "Nadal", en: "Christmas Day" },
};

/** A BOE row name in the page's language (the Spanish one if a new row ever lacks it; a test forbids that). */
export function holidayName(name: string, locale: Edition): string {
  return HOLIDAY_NAME[name]?.[locale] ?? name;
}

/** Capitalised for a list or a table cell: "La Puríssima". */
export function holidayLabel(name: string, locale: Edition): string {
  return cap(holidayName(name, locale));
}

export const KIND_LABEL_INTL: Record<Edition, Record<BoeCode, string>> = {
  ca: { "*": "Estatal (no substituïble)", "**": "Estatal (la comunitat la manté)", "***": "Pròpia de la comunitat" },
  en: { "*": "National (cannot be swapped)", "**": "National (kept by the community)", "***": "The community's own" },
};

/** The BOE's legend under its table, in each language. */
export const BOE_LEGEND_INTL: Record<Edition, Record<BoeCode, string>> = {
  ca: {
    "*": "festa nacional no substituïble",
    "**": "festa nacional que la comunitat no ha fet servir la facultat de substituir",
    "***": "festa de la comunitat autònoma",
  },
  en: {
    "*": "national holiday that cannot be swapped",
    "**": "national holiday the community chose not to swap",
    "***": "the autonomous community's own holiday",
  },
};

/** The table cell: the name, and why a moved day sits where it does. */
export function dayNameIntl(d: Pick<CommunityDay, "name" | "replaces">, locale: Edition): string {
  const name = holidayLabel(d.name, locale);
  if (!d.replaces) return name;
  return tr(
    locale,
    `${name} (trasllat del ${weekdayDateIntl(d.replaces, locale)}, l'Assumpció)`,
    `${name} (in lieu of ${weekdayDateIntl(d.replaces, locale)}, the Assumption)`,
  );
}

/** For prose: the name, or what a moved row stands for. */
export function shortNameIntl(d: Pick<CommunityDay, "name" | "replaces">, locale: Edition): string {
  if (d.replaces) return tr(locale, "el trasllat de l'Assumpció", "the Assumption, moved to the Monday");
  return holidayName(d.name, locale);
}

function short(region: Region, locale: Edition): string {
  return editionNames(region, locale).short;
}

/** "5 comunitats, Ceuta i Melilla"; "5 communities, Ceuta and Melilla". */
export function territoryCountIntl(regions: readonly Region[], locale: Edition): string {
  const cities = regions.filter((r) => r === "CE" || r === "ML");
  const n = regions.length - cities.length;
  const word = tr(locale, n === 1 ? "1 comunitat" : `${n} comunitats`, n === 1 ? "1 community" : `${n} communities`);
  return joinList([...(n ? [word] : []), ...cities.map((r) => short(r, locale))], locale);
}

/** "A tot Espanya", "Només aquí", "També a Madrid i Navarra"; "All of Spain", "Only here", "Also in …". */
export function whereElseIntl(d: CommunityDay, locale: Edition): string {
  if (d.common) return tr(locale, "A tot Espanya", "All of Spain");
  if (d.alsoIn.length === 0) return tr(locale, "Només aquí", "Only here");
  const where = d.alsoIn.length <= 3 ? joinList(d.alsoIn.map((r) => short(r, locale)), locale) : territoryCountIntl(d.alsoIn, locale);
  return tr(locale, `També a ${where}`, `Also in ${where}`);
}

export function longWeekendsIntl(n: number, locale: Edition): string {
  return tr(locale, n === 1 ? "1 cap de setmana llarg" : `${n} caps de setmana llargs`, n === 1 ? "1 long weekend" : `${n} long weekends`);
}

function has(c: EditionNames, locale: Edition): string {
  return tr(locale, c.plural ? "tenen" : "té", c.plural ? "have" : "has");
}

/** "es publiquen al BOJA"; "in the BOJA". */
export function bulletinIn(c: Pick<EditionNames, "region">, locale: Edition): string {
  const b = SOURCE_PROSE[c.region][locale].bulletinShort;
  return locale === "ca" ? caA(b) : `in ${b}`;
}

/* ------------------------------------------------------------ Community --- */

export function communityTitleIntl(c: EditionNames, locale: Edition): string {
  const n = dayCount(c.region);
  const island = SOURCE_PROSE[c.region][locale].subRegional;
  const count = tr(locale, island ? `${n} dies + 1 ${island.short}` : `${n} dies`, island ? `${n} days + 1 ${island.short}` : `${n} days`);
  const candidates =
    locale === "ca"
      ? [`Festius ${YEAR} ${c.in}: ${count}, ponts i dates`, `Festius ${YEAR} ${c.in}: ${count} i ponts`, `Festius ${YEAR} a ${c.short}: ${count} i ponts`, `Festius ${YEAR} ${c.short}: ${count}`]
      : [`${c.short} public holidays ${YEAR}: ${count}, long weekends`, `${c.short} holidays ${YEAR}: ${count} and long weekends`, `${c.short} holidays ${YEAR}: ${count}`];
  return candidates.find((t) => t.length <= EDITION_TITLE_LIMIT) ?? candidates.at(-1)!;
}

export function communityH1Intl(c: EditionNames, locale: Edition): string {
  return tr(locale, `Calendari laboral ${YEAR} ${c.of}: festius i ponts`, `Public holidays ${YEAR} ${c.in}: work calendar and long weekends`);
}

export function communityDescriptionIntl(c: EditionNames, locale: Edition): string {
  const days = communityDays(c.region);
  const free = runSummary(communityRuns(c.region)).free;
  const island = SOURCE_PROSE[c.region][locale].subRegional;
  const dates = compactDatesIntl(
    days.map((d) => d.date),
    locale,
  );
  const head =
    locale === "ca"
      ? island
        ? `${c.Full} ${has(c, locale)} ${days.length} festius el ${YEAR} a totes les illes, més 1 ${island.unit} (BOE): `
        : `${c.Full} ${has(c, locale)} ${days.length} festius el ${YEAR} (BOE): `
      : island
        ? `${c.Full} ${has(c, locale)} ${days.length} public holidays in ${YEAR} on every island, plus 1 ${island.unit} (BOE): `
        : `${c.Full} ${has(c, locale)} ${days.length} public holidays in ${YEAR} (BOE): `;
  const base = `${head}${dates}.`;
  const runs = tr(locale, ` ${cap(longWeekendsIntl(free, locale))} sense gastar vacances.`, ` ${cap(longWeekendsIntl(free, locale))} with no leave.`);
  // Canarias: the island day said in fewer words when the whole line would not fit.
  const shorter = island
    ? `${c.Full} ${has(c, locale)} ${days.length} ${tr(locale, "festius", "holidays")} ${tr(locale, `el ${YEAR}`, `in ${YEAR}`)} + 1 ${island.unit} (BOE): ${dates}.`
    : base;
  return [base + runs, base, shorter].find((d) => d.length <= EDITION_DESCRIPTION_LIMIT) ?? shorter;
}

/** The first paragraph: the count, the days that set the community apart, the source. */
export function communityLeadIntl(c: EditionNames, locale: Edition): string {
  const n = dayCount(c.region);
  const own = ownDays(c.region);
  const ownWords = joinList(
    own.map((d) => `${shortNameIntl(d, locale)} (${weekdayDateIntl(d.date, locale)})`),
    locale,
  );
  const local = SOURCES[c.region].local;
  const allLocal = local.days?.length && local.daysScope === "all" ? local.days : null;
  const localDates = allLocal ? joinList(allLocal.map((d) => weekdayDateIntl(d.date, locale)), locale) : "";
  if (locale === "ca") {
    const where = c.city ? "de la ciutat" : "de la comunitat";
    const tail = allLocal
      ? `S'hi sumen les seves 2 festes locals (${localDates}): ${n + allLocal.length} en total.`
      : `A més, cada municipi hi afegeix els seus 2 festius locals.`;
    return (
      `${c.Full} ${has(c, locale)} ${n} festius laborals el ${YEAR}, segons la llista que el BOE va publicar el ${dayMonthYear("2026-10-13", "ca")}: ` +
      `els ${COMMON_DATES.length} que són festiu a tot Espanya i ${own.length === 1 ? "1 que depèn" : `${own.length} que depenen`} ${where}: ${ownWords}. ${tail}`
    );
  }
  const who = c.city ? "the city" : "the community";
  const tail = allLocal
    ? `Its 2 local holidays (${localDates}) bring the total to ${n + allLocal.length}.`
    : `On top of these, every municipality has its own 2 local holidays.`;
  return (
    `${c.Full} ${has(c, locale)} ${n} public holidays in ${YEAR}, according to the list published in the BOE, Spain's official gazette, on ${dayMonthYear("2026-10-13", "en")}: ` +
    `the ${COMMON_DATES.length} shared by all of Spain and ${own.length === 1 ? "1 set by" : `${own.length} set by`} ${who}: ${ownWords}. ${tail}`
  );
}

export interface FaqIntl {
  question: string;
  answer: string;
}

export function runLineIntl(run: Pick<Plan, "from" | "to" | "days" | "take">, locale: Edition): string {
  const wd = (iso: string) => weekdayDateIntl(iso, locale);
  const leave =
    locale === "ca"
      ? run.take.length === 0
        ? "sense vacances"
        : run.take.length === 1
          ? `amb 1 dia de vacances (${wd(run.take[0]!)})`
          : `amb ${run.take.length} dies de vacances (${joinList(run.take.map(wd), "ca")})`
      : run.take.length === 0
        ? "with no leave"
        : run.take.length === 1
          ? `with 1 day of leave (${wd(run.take[0]!)})`
          : `with ${run.take.length} days of leave (${joinList(run.take.map(wd), "en")})`;
  return `${cap(rangeWordsIntl(run.from, run.to, locale))}: ${run.days} ${tr(locale, "dies", "days")} ${leave}`;
}

export function localStatusLineIntl(c: EditionNames, local: LocalStatus, locale: Edition): string {
  const prose = SOURCE_PROSE[c.region][locale];
  if (local.status === "published" && local.y2027) {
    return tr(locale, `Publicats: ${local.y2027.title} (${local.y2027.ref}).`, `Published: ${local.y2027.title} (${local.y2027.ref}).`);
  }
  if (local.status === "published" && local.parts?.length) {
    const list = joinList(
      local.parts.map((p) => `${p.place} (${p.text.ref})`),
      locale,
    );
    return tr(locale, `Publicats, en ${local.parts.length} butlletins: ${list}.`, `Published, in ${local.parts.length} bulletins: ${list}.`);
  }
  if (local.status === "partial") return tr(locale, `Publicats en part: ${prose.note ?? ""}`, `Partly published: ${prose.note ?? ""}`).trim();
  const read = dayMonthYear(SOURCES_READ_ON, locale);
  if (locale === "ca") {
    const last = local.y2026 ? ` El 2026 es van publicar el ${dayMonthYear(local.y2026.date, "ca")} (${local.y2026.ref}).` : "";
    return `Pendents a ${read}: ${c.in} encara no s'ha publicat la llista del ${YEAR}.${last}`;
  }
  const last = local.y2026 ? ` In 2026 it came out on ${dayMonthYear(local.y2026.date, "en")} (${local.y2026.ref}).` : "";
  return `Pending as of ${read}: the ${YEAR} list has not been published yet ${c.in}.${last}`;
}

function holyThursdayAnswerIntl(c: EditionNames, locale: Edition): string {
  const yes = communityDays(c.region).some((d) => d.date === "2027-03-25");
  if (locale === "ca") {
    return yes
      ? `Sí. El dijous 25 de març del ${YEAR} és festiu ${c.in}, i el divendres 26 (Divendres Sant) també, com a tot Espanya.`
      : `No. El dijous 25 de març del ${YEAR} no és festiu ${c.in}; el divendres 26 (Divendres Sant) sí, com a tot Espanya.`;
  }
  return yes
    ? `Yes. Thursday 25 March ${YEAR} is a holiday ${c.in}, and so is Friday 26 (Good Friday), as everywhere in Spain.`
    : `No. Thursday 25 March ${YEAR} is a working day ${c.in}; Friday 26 (Good Friday) is a holiday, as everywhere in Spain.`;
}

export function communityFaqIntl(c: EditionNames, locale: Edition): FaqIntl[] {
  const days = communityDays(c.region);
  const free = communityRuns(c.region).filter((r) => r.take.length === 0);
  const s = SOURCES[c.region];
  const prose = SOURCE_PROSE[c.region][locale];
  const dates = compactDatesIntl(
    days.map((d) => d.date),
    locale,
  );
  const localList = s.local.days?.length ? joinList(s.local.days.map((d) => `${dayMonth(d.date, locale)} (${d.name})`), locale) : "";
  const ranges = joinList(
    free.map((r) => rangeWordsIntl(r.from, r.to, locale)),
    locale,
  );
  if (locale === "ca") {
    const localTail =
      s.local.days?.length && s.local.daysScope === "all"
        ? ` Amb les seves 2 festes locals, ${localList}, en són ${days.length + s.local.days.length}.`
        : s.local.days?.length
          ? ` Cada municipi hi afegeix fins a 2 festes locals; una és comuna a tota la comunitat: ${localList}.`
          : ` Cada municipi hi afegeix fins a 2 festes locals.`;
    return [
      {
        question: `Quants festius hi ha el ${YEAR} ${c.in}?`,
        answer: `${days.length} d'àmbit estatal i ${c.city ? "de la ciutat" : "autonòmic"}, segons el BOE del 13 d'octubre de 2026: ${dates}.${prose.subRegional ? ` ${prose.subRegional.faq}` : ""}${localTail}`,
      },
      { question: `És festiu el Dijous Sant del ${YEAR} ${c.in}?`, answer: holyThursdayAnswerIntl(c, locale) },
      {
        question: `Quins ponts hi ha el ${YEAR} ${c.in}?`,
        answer:
          `Sense gastar vacances, ${longWeekendsIntl(free.length, locale)}: ${ranges}. ` +
          `Càlcul de CatalunyaInfo a partir dels festius del BOE, per a una setmana de dilluns a divendres i sense els festius locals.`,
      },
      {
        question: `Quan es publiquen els festius locals del ${YEAR} ${c.in}?`,
        answer: `${localStatusLineIntl(c, s.local, locale)} Es publiquen ${bulletinIn(c, locale)}.`,
      },
    ];
  }
  const localTail =
    s.local.days?.length && s.local.daysScope === "all"
      ? ` With its 2 local holidays, ${localList}, that makes ${days.length + s.local.days.length}.`
      : s.local.days?.length
        ? ` Each municipality adds up to 2 local holidays; one of them is shared by the whole community: ${localList}.`
        : ` Each municipality adds up to 2 local holidays.`;
  return [
    {
      question: `How many public holidays are there ${c.in} in ${YEAR}?`,
      answer: `${days.length} national and ${c.city ? "city" : "regional"} holidays, according to the BOE of 13 October 2026: ${dates}.${prose.subRegional ? ` ${prose.subRegional.faq}` : ""}${localTail}`,
    },
    { question: `Is Maundy Thursday ${YEAR} a holiday ${c.in}?`, answer: holyThursdayAnswerIntl(c, locale) },
    {
      question: `What long weekends are there ${c.in} in ${YEAR}?`,
      answer:
        `With no leave, ${longWeekendsIntl(free.length, locale)}: ${ranges}. ` +
        `CatalunyaInfo's calculation from the BOE holidays, for a Monday-to-Friday week and without local holidays.`,
    },
    {
      question: `When are the ${YEAR} local holidays ${c.in} published?`,
      answer: `${localStatusLineIntl(c, s.local, locale)} They are published ${bulletinIn(c, locale)}.`,
    },
  ];
}

/* ------------------------------------------------------------------ Hub --- */

export const HUB_INTL: Record<Edition, { title: string; h1: string; breadcrumb: string }> = {
  ca: {
    title: `Calendari laboral ${YEAR} a Espanya: festius per comunitat`,
    h1: `Calendari laboral ${YEAR} a Espanya: festius per comunitat autònoma`,
    breadcrumb: `Calendari laboral ${YEAR} a Espanya`,
  },
  en: {
    title: `Spain public holidays ${YEAR}: every region's calendar`,
    h1: `Public holidays in Spain ${YEAR}, region by region`,
    breadcrumb: `Spain public holidays ${YEAR}`,
  },
};

export function hubDescriptionIntl(locale: Edition): string {
  const dates = compactDatesIntl(COMMON_DATES, locale);
  return tr(
    locale,
    `${COMMON_DATES.length} festius a tot Espanya el ${YEAR} (${dates}) i els de cada comunitat, Ceuta i Melilla, segons el BOE.`,
    `${COMMON_DATES.length} holidays across Spain in ${YEAR} (${dates}), plus each region's own, Ceuta and Melilla, from the BOE.`,
  );
}

export function hubLeadIntl(locale: Edition): string {
  const all = editionCommunities(locale);
  const twelve = all.filter((c) => dayCount(c.region) === 12).length;
  const others = all.filter((c) => dayCount(c.region) !== 12);
  const words = others.map((c) => {
    const island = SOURCE_PROSE[c.region][locale].subRegional;
    return locale === "ca"
      ? `${c.short} en té ${dayCount(c.region)}${island ? ` i 1 ${island.unit} a cada illa` : ""}`
      : `${c.Full} ${has(c, locale)} ${dayCount(c.region)}${island ? ` plus 1 ${island.unit} on each island` : ""}`;
  });
  const list = others.length ? `; ${joinList(words, locale)}` : "";
  return tr(
    locale,
    `El BOE va publicar el 13 d'octubre de 2026 la llista oficial de festes laborals del ${YEAR} de tot Espanya. ` +
      `${COMMON_DATES.length} dies són festius arreu; la resta els fixa cada comunitat autònoma i les ciutats de Ceuta i Melilla. ` +
      `${twelve} dels 19 territoris tenen 12 festius${list}. A més, cada municipi té fins a 2 festius locals.`,
    `On 13 October 2026 the BOE, Spain's official gazette, published the official list of public holidays for ${YEAR} across the country. ` +
      `${COMMON_DATES.length} days are holidays everywhere; the rest are set by each autonomous community and by the cities of Ceuta and Melilla. ` +
      `${twelve} of the 19 territories have 12 holidays${list}. Each municipality adds up to 2 local holidays.`,
  );
}

/* -------------------------------------------------------------- Bridges --- */

export const BRIDGES_INTL: Record<Edition, { title: string; h1: string; breadcrumb: string }> = {
  ca: {
    title: `Ponts ${YEAR} a Espanya: dates per comunitat autònoma`,
    h1: `Ponts ${YEAR} a Espanya: tots els caps de setmana llargs per comunitat`,
    breadcrumb: `Ponts ${YEAR}`,
  },
  en: {
    title: `Spain long weekends ${YEAR}: dates by region`,
    h1: `Long weekends in Spain ${YEAR}: every one, region by region`,
    breadcrumb: `Long weekends ${YEAR}`,
  },
};

/** The runs every one of the nineteen gets with no leave. */
export function everywhereFreeIntl() {
  return spainRuns().filter((r) => r.regions.length === REGIONS.length && r.take.length === 0);
}

export function bridgesDescriptionIntl(locale: Edition): string {
  const free = everywhereFreeIntl();
  const ranges = free.map((r) => shortRangeIntl(r.from, r.to, locale)).join(", ");
  return tr(
    locale,
    `El ${YEAR} hi ha ${free.length} caps de setmana llargs a tot Espanya sense gastar vacances (${ranges}) i d'altres segons la comunitat.`,
    `In ${YEAR} there are ${free.length} long weekends across Spain with no leave needed (${ranges}), and more depending on the region.`,
  );
}

/** "Tot Espanya", "Tot Espanya excepte Catalunya i …", or the names. */
export function regionsWordsIntl(regions: readonly Region[], locale: Edition): string {
  if (regions.length === REGIONS.length) return tr(locale, "Tot Espanya", "All of Spain");
  const missing = REGIONS.filter((r) => !regions.includes(r)).map((r) => short(r, locale));
  if (regions.length >= 15) return tr(locale, `Tot Espanya excepte ${joinList(missing, "ca")}`, `All of Spain except ${joinList(missing, "en")}`);
  return joinList(
    regions.map((r) => short(r, locale)),
    locale,
  );
}

export function weekendLineIntl(c: EditionNames, locale: Edition): string | null {
  const w = weekendDays(c.region);
  if (w.length === 0) return null;
  const list = joinList(
    w.map((d) => `${shortNameIntl(d, locale)} (${weekdayDateIntl(d.date, locale)})`),
    locale,
  );
  return locale === "ca"
    ? `${w.length === 1 ? "Un cau" : `${w.length} cauen`} en cap de setmana i no ${w.length === 1 ? "dona" : "donen"} cap dia lliure més de dilluns a divendres: ${list}.`
    : `${w.length === 1 ? "One falls" : `${w.length} fall`} on a weekend and ${w.length === 1 ? "gives" : "give"} no extra day off in a Monday-to-Friday week: ${list}.`;
}

export function notKeptLineIntl(c: EditionNames, locale: Edition): string | null {
  const missing = nationalNotKept(c.region);
  if (missing.length === 0) return null;
  const items = joinList(
    missing.map(({ row, keptBy }) => {
      const name = isSubstitutionName(row.name) ? tr(locale, "el trasllat de l'Assumpció", "the Assumption, moved to the Monday") : holidayName(row.name, locale);
      const where = keptBy.length <= 2 ? joinList(keptBy.map((r) => short(r, locale)), locale) : territoryCountIntl(keptBy, locale);
      return tr(locale, `${name} (${weekdayDateIntl(row.date, locale)}, festiu a ${where})`, `${name} (${weekdayDateIntl(row.date, locale)}, a holiday in ${where})`);
    }),
    locale,
  );
  return locale === "ca"
    ? `No ${missing.length === 1 ? "és festiu" : "són festius"} ${c.in}, tot i que sí que ho ${missing.length === 1 ? "és" : "són"} en altres comunitats: ${items}.`
    : `${missing.length === 1 ? "Not a holiday" : "Not holidays"} ${c.in}, though ${missing.length === 1 ? "it is" : "they are"} elsewhere: ${items}.`;
}

/** How the community's own text compares with the BOE, in the page's language (the titles stay in Spanish). */
export function decreeLineIntl(c: EditionNames, locale: Edition): string {
  const d = SOURCES[c.region].decree;
  const prose = SOURCE_PROSE[c.region][locale];
  if (d.status === "not-found") return prose.decreeNotFound ?? "";
  const doc = `${d.text.title} (${d.text.ref})`;
  const dates = joinList(
    d.dates.map((x) => weekdayDateIntl(x, locale)),
    locale,
  );
  if (locale === "ca") {
    const who = c.city ? "La ciutat" : "La comunitat";
    if (d.differences) return `${who} va publicar el seu propi calendari en un text propi, ${doc}. Diferència amb el BOE: ${prose.differences ?? ""}`;
    if (d.covers === "own")
      return `${who} només va fixar pel seu compte ${d.dates.length === 1 ? "la seva festa pròpia" : "les seves festes pròpies"} (${dates}), en un text propi, ${doc}, que coincideix amb el BOE; la resta són els festius estatals que recull el BOE.`;
    return `${who} va publicar els mateixos ${d.dates.length} dies en un text propi, ${doc}, que coincideix amb el BOE dia per dia.`;
  }
  const who = c.city ? "The city" : "The community";
  if (d.differences) return `${who} published its own calendar in its own text, ${doc}. Difference from the BOE: ${prose.differences ?? ""}`;
  if (d.covers === "own")
    return `${who} set only ${d.dates.length === 1 ? "its own holiday" : "its own holidays"} (${dates}) in a text of its own, ${doc}, which matches the BOE; the other days are the national ones the BOE lists.`;
  return `${who} published the same ${d.dates.length} days in a text of its own, ${doc}, which matches the BOE day for day.`;
}

/** Shown on every page: what "computed" means. */
export function computedNote(locale: Edition): string {
  return tr(
    locale,
    "Calculat per CatalunyaInfo a partir dels festius del BOE, per a una setmana de dilluns a divendres. No inclou els festius locals de cada municipi ni torns o convenis propis.",
    "Worked out by CatalunyaInfo from the BOE holidays, for a Monday-to-Friday week. It leaves out each municipality's local holidays and any shift pattern or collective agreement of your own.",
  );
}
