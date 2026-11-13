import "server-only";

import { slugifyAnchor, type Block } from "@/lib/content/blocks";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import {
  publishArticle,
  upsertImages,
  type ArticleSpec,
  type ImageSpec,
  type PublishResult,
} from "@/lib/content/publish-article";
import { IMAGES } from "@/lib/content/images";
import { link } from "@/lib/content/features/shared";
import {
  ARAN_REPLACEMENT,
  BARCELONA_LOCAL,
  BRIDGES,
  CATALONIA_HOLIDAYS,
  LAST_VERIFIED,
  SOURCES,
  YEAR,
  type Bridge,
  type Holiday,
} from "./payload";
import { SCHOOL_YEARS } from "@/lib/content/school/calendar";
import { lastSunday } from "@/lib/content/clock/rule";
import { aranSwap, councilApproved2027, councilApprovedTowns, municipalityBySlug, nextYearPublished, SNAPSHOT } from "@/lib/programmatic/holidays/data";
import { displayName } from "@/lib/programmatic/holidays/copy";
import { joinList } from "@/lib/programmatic/holidays/names";
import { hasEnglishPage } from "@/lib/programmatic/holidays/english";
import { datePath, isDatePage, municipalityPath } from "@/lib/programmatic/holidays/paths";
import { largestTownLinks, townPageCount } from "@/lib/programmatic/holidays/towns";
import { calculatorsHubPath } from "@/lib/programmatic/calculators/paths";
import { LEAVE_YEAR, leavePath } from "@/lib/programmatic/leave-2027/copy";
import { workingDaysPath } from "@/lib/programmatic/working-days/copy";
import { COPY, type HolidayCopy } from "./copy";
import { ARAN_SUBSTITUTIONS, HOLIDAYS_BY_YEAR, addDays, longDate } from "./calendar";
import { DIADA_IMAGE, SANT_JOAN_IMAGE } from "./images";

/**
 * The public holiday guide.
 *
 * Evergreen URL with no year in it: next year this same page becomes the 2028
 * calendar. That is the whole point of the piece — a reference people bookmark
 * and come back to, rather than a news item that dies in January.
 *
 * Everything dated is rendered from the ISO dates in the payload. No weekday
 * and no day count is ever typed by hand, so a transcription slip cannot reach
 * the page saying Tuesday when the date is a Wednesday.
 */

export const ENTRY_KEY = "guide-public-holidays-catalonia";

const HERO_KEY = DIADA_IMAGE.key;
const SECOND_KEY = SANT_JOAN_IMAGE.key;

const IMAGE_BY_KEY = new Map(IMAGES.map((image) => [image.key, image]));

const PUBLISHED = new Date("2026-09-24T18:00:00+02:00");
const VERIFIED = new Date(`${LAST_VERIFIED}T12:00:00+02:00`);

function parse(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

/** `12 d'octubre` / `12 de octubre` / `12 October`. */
export function formatDay(iso: string, copy: HolidayCopy, locale: Locale): string {
  const date = parse(iso);
  const day = date.getUTCDate();
  const month = copy.months[date.getUTCMonth()] ?? "";
  if (locale === "en") return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)}`;
  // Catalan and Spanish elide the preposition before a vowel: "d'octubre".
  const vowel = /^[aeiouàèéíòóú]/i.test(month);
  const preposition = locale === "ca" ? (vowel ? "d'" : "de ") : "de ";
  return `${day} ${preposition}${month}`;
}

export function weekdayOf(iso: string, copy: HolidayCopy): string {
  return copy.weekdays[parse(iso).getUTCDay()] ?? "";
}

/** Inclusive day count between two ISO dates. */
export function runLength(from: string, to: string): number {
  const ms = parse(to).getTime() - parse(from).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

/** The date as a link to its own page ("¿es festivo el 26 de marzo de 2027?") when it has one. */
function linkedDay(iso: string, text: string, locale: Locale): string {
  return isDatePage(iso) ? `[${text}](${datePath(locale, iso)})` : text;
}

function holidayRows(holidays: Holiday[], copy: HolidayCopy, locale: Locale): string[][] {
  return holidays.map((holiday) => [
    linkedDay(holiday.date, formatDay(holiday.date, copy, locale), locale),
    weekdayOf(holiday.date, copy),
    holiday.name[locale],
  ]);
}

/** "[Barcelona](/es/festivos/barcelona/), el 17 de mayo y el 24 de septiembre", from the payload. */
function barcelonaLocalLine(copy: HolidayCopy, locale: Locale): string {
  const days = joinList(
    BARCELONA_LOCAL.map((h) => {
      const day = formatDay(h.date, copy, locale);
      return `${dayArticle(day, locale)}${day}`;
    }),
    locale,
  );
  const town = locale !== "en" || hasEnglishPage("barcelona") ? `[Barcelona](${municipalityPath(locale, "barcelona")})` : "Barcelona";
  return `${town}, ${days}`;
}

/**
 * The last Catalonia-wide days of 2026, right under the 2027 table: people
 * still search "festivos 2026" until December (3 Nov 2026). Each day links to
 * its date page, and the full 2026 table stays further down.
 */
function last2026Callout(copy: HolidayCopy, locale: Locale): Block {
  const year = HOLIDAYS_BY_YEAR[2026] ?? [];
  const december = year.filter((h) => h.date.slice(5, 7) === "12");
  if (december.length !== 3) throw new Error("holiday guide: expected three December holidays in 2026");
  const day = (iso: string) => formatDay(iso, copy, locale);
  // Sant Esteve 2026 is not a holiday in Aran, which had the Festa d'Aran on 17 June instead.
  const exceptAran = { ca: ", excepte a l'Aran", es: ", excepto en Arán", en: ", except in Aran" }[locale];
  const items = december.map((h) => {
    const aran = ARAN_SUBSTITUTIONS.some((s) => s.replaces === h.date) ? exceptAran : "";
    return `${weekdayOf(h.date, copy)} ${linkedDay(h.date, day(h.date), locale)} (${h.name[locale]}${aran})`;
  });
  const days = joinList(items, locale);
  const dec7 = `${weekdayOf(DEC7_2026, copy)} ${linkedDay(DEC7_2026, day(DEC7_2026), locale)}`;
  const link = `/${locale}/${copy.path}/#${slugifyAnchor(copy.year2026Title)}`;
  const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
  return {
    type: "callout",
    tone: "info",
    title: copy.last2026Title,
    text: copy.last2026
      .replace("{days}", cap(days))
      .replace("{dec7}", locale === "en" ? cap(dec7) : dec7)
      .replace("{link}", link),
  };
}

function bridgeSection(bridge: Bridge, copy: HolidayCopy, locale: Locale): Block[] {
  const taken =
    bridge.take.length === 0
      ? copy.efficiencyNone
      : bridge.take.map((iso) => formatDay(iso, copy, locale)).join(", ");

  return [
    { type: "heading", level: 3, text: bridge.label[locale] } as Block,
    {
      type: "keyFacts",
      items: [
        { label: copy.efficiencyHeaders[0] ?? "", value: taken },
        {
          label: copy.efficiencyHeaders[2] ?? "",
          value: `${copy.efficiencyResult(bridge.days)} · ${formatDay(bridge.from, copy, locale)} – ${formatDay(bridge.to, copy, locale)}`,
        },
      ],
    } as Block,
    { type: "paragraph", text: bridge.detail[locale] } as Block,
  ];
}

/** "el 7 de desembre", "l'11 d'octubre" (Catalan elides before un and onze); nothing in English. */
function dayArticle(day: string, locale: Locale): string {
  if (locale === "en") return "";
  return locale === "ca" && /^(1|11)\s/.test(day) ? "l'" : "el ";
}

function findHoliday(list: Holiday[], en: string): Holiday {
  const holiday = list.find((h) => h.name.en.startsWith(en));
  if (!holiday) throw new Error(`holiday guide: no ${en} in the ${YEAR} calendar`);
  return holiday;
}

/**
 * Easter 2027, for "divendres sant 2027", "pasqua 2027", "semana santa 2027":
 * the days around it and which are holidays. Every date comes from the payload
 * (Ordre EMT/52/2026, Barcelona's own calendar) or from the school order; the
 * Thursday and Sunday are the days either side of the two holidays.
 */
function easterSection(copy: HolidayCopy, locale: Locale): Block[] {
  const goodFriday = findHoliday(CATALONIA_HOLIDAYS, "Good Friday");
  const easterMonday = findHoliday(CATALONIA_HOLIDAYS, "Easter Monday");
  const whitMonday = findHoliday(BARCELONA_LOCAL, "Whit Monday");
  const rows: [string, string, string][] = [
    [addDays(goodFriday.date, -1), copy.easterNames.maundy, copy.easterStatus.maundy],
    [goodFriday.date, goodFriday.name[locale], copy.easterStatus.holiday],
    [addDays(easterMonday.date, -1), copy.easterNames.sunday, copy.easterStatus.sunday],
    [easterMonday.date, easterMonday.name[locale], copy.easterStatus.exceptAran],
    [whitMonday.date, whitMonday.name[locale], copy.easterStatus.barcelona],
  ];
  const school = SCHOOL_YEARS.find((y) => y.easter[0].startsWith(String(YEAR)));
  if (!school) throw new Error(`holiday guide: no school Easter in ${YEAR}`);
  // In 2027 Easter Sunday is also the March clock change (both 28 March).
  const clockOnEaster = addDays(easterMonday.date, -1) === lastSunday(YEAR, 3);
  return [
    { type: "heading", level: 2, text: copy.easterTitle },
    { type: "paragraph", text: clockOnEaster ? `${copy.easterIntro} ${copy.easterClockChange}` : copy.easterIntro },
    {
      type: "table",
      caption: copy.easterTitle,
      headers: copy.easterHeaders,
      rows: rows.map(([iso, what, status]) => [formatDay(iso, copy, locale), weekdayOf(iso, copy), what, status]),
      stickyColumn: 0,
    },
    {
      type: "paragraph",
      text: copy.easterSchool
        .replace("{from}", formatDay(school.easter[0], copy, locale))
        .replace("{to}", formatDay(school.easter[1], copy, locale)),
    },
    { type: "paragraph", text: copy.easterGuide },
  ];
}

/**
 * The day the Generalitat's open data (dataset b4eh-r8up, `any_calendari`)
 * was last read for a 2027 local-holiday order: none on 13 Nov 2026 (2026 is
 * the newest year). The section prints it; tests/holidays.test.ts fails 21
 * days later so it is read again (the 2026 order came out on 17 Dec 2025).
 */
export const LOCAL_ORDER_CHECKED = "2026-11-13";
/** How many of the largest towns the local-days table lists. */
export const LOCAL_TABLE_TOWNS = 15;

/** A town's name, linked to its holiday page where the locale has one (English has a selection). */
function townLink(slug: string, name: string, locale: Locale, anchor = ""): string {
  return locale !== "en" || hasEnglishPage(slug) ? `[${name}](${municipalityPath(locale, slug)}${anchor})` : name;
}

/** "dilluns 17 de maig i divendres 24 de setembre", "Monday 17 May and Friday 24 September". */
function weekdayPair(dates: readonly string[], copy: HolidayCopy, locale: Locale): string {
  return joinList(dates.map((iso) => `${weekdayOf(iso, copy)} ${formatDay(iso, copy, locale)}`), locale);
}

/**
 * 13 Nov 2026: "calendario laboral 2027 catalunya" (40 impr. at 10.0) and the
 * town queries want each town's two days, which the guide only gave for
 * Barcelona. Before the DOGC order, the councils' own approvals
 * (`council-2027.ts`, 420 towns) are the only source: the largest towns get a
 * row each, approved or not, with their 2026 days, then the calendar feeds.
 * When `local-2027.json` holds the order, this section must be rewritten for
 * it (the build stops here rather than print "not out yet").
 */
function localSection(copy: HolidayCopy, locale: Locale): Block[] {
  if (nextYearPublished()) throw new Error("holiday guide: the 2027 DOGC local order is in local-2027.json; rewrite localSection for it");
  const towns = locale === "en" ? "" : joinList(largestTownLinks(locale), locale);
  const largest = [...SNAPSHOT.municipalities].sort((a, b) => a.rank - b.rank).slice(0, LOCAL_TABLE_TOWNS);
  const rows = largest.map((m) => {
    const council = councilApproved2027(m.slug);
    return [
      townLink(m.slug, displayName(m, locale === "en" ? "ca" : locale), locale),
      council ? weekdayPair(council.local, copy, locale) : copy.localNotYet,
      m.local.length === 2 ? joinList(m.local.map((iso) => formatDay(iso, copy, locale)), locale) : "—",
    ];
  });
  const barcelona = municipalityBySlug("barcelona");
  if (!barcelona) throw new Error("holiday guide: no Barcelona town page for the calendar-feed example");
  const fill = (text: string) =>
    text
      .replace("{asOf}", `${formatDay(LOCAL_ORDER_CHECKED, copy, locale)}${locale === "en" ? " " : " de "}${LOCAL_ORDER_CHECKED.slice(0, 4)}`)
      .replace("{approved}", String(councilApprovedTowns().length))
      .replace("{shown}", String(largest.length))
      .replace("{towns}", towns)
      .replace("{count}", String(townPageCount()))
      .replace("{example}", townLink("barcelona", displayName(barcelona, locale === "en" ? "ca" : locale), locale, "#afegeix-calendari"));
  const [status, approved, ...rest] = copy.local;
  return [
    { type: "heading", level: 2, text: copy.localTitle },
    { type: "paragraph", text: fill(status ?? "") },
    { type: "paragraph", text: fill(approved ?? "") },
    {
      type: "table",
      caption: copy.localTableCaption,
      headers: [...copy.localTableHeaders],
      rows,
      note: copy.localTableNote,
      stickyColumn: 0,
    },
    ...rest.map((text) => ({ type: "paragraph", text: fill(text) }) as Block),
    { type: "paragraph", text: fill(copy.localFeeds) },
  ];
}

function localAnchor(copy: HolidayCopy, locale: Locale): string {
  return `/${locale}/${copy.path}/#${slugifyAnchor(copy.localTitle)}`;
}

const DEC7_2026 = "2026-12-07";
const NOV1_2026 = "2026-11-01";

/**
 * Working days in the year for a Monday-to-Friday week: weekdays minus the
 * Catalonia-wide holidays that fall on one. "Días laborables 2027" is what
 * the calendar sites lead with; here it is counted from the same twelve
 * dates the table prints.
 */
export function workingDays(year: number = YEAR): { weekdays: number; working: number } {
  let weekdays = 0;
  let working = 0;
  for (let iso = `${year}-01-01`; iso.startsWith(String(year)); iso = addDays(iso, 1)) {
    const wd = new Date(`${iso}T12:00:00Z`).getUTCDay();
    if (wd === 0 || wd === 6) continue;
    weekdays++;
    if (!CATALONIA_HOLIDAYS.some((h) => h.date === iso)) working++;
  }
  return { weekdays, working };
}

function workingDaysFact(locale: Locale): { label: string; value: string } {
  const { working } = workingDays();
  return {
    ca: { label: `Dies feiners ${YEAR}`, value: `${working} (${working - 2} amb les 2 festes locals)` },
    es: { label: `Días laborables ${YEAR}`, value: `${working} (${working - 2} con las 2 fiestas locales)` },
    en: { label: `Working days ${YEAR}`, value: `${working} (${working - 2} with 2 local holidays)` },
  }[locale];
}

/**
 * Working days per month: Monday to Friday minus the Catalonia-wide holidays
 * that fall on one. Counted from the same twelve dates as the table; the twelve
 * months add up to `workingDays().working`.
 */
export function workingDaysByMonth(year: number = YEAR): number[] {
  const months = Array.from({ length: 12 }, () => 0);
  for (let iso = `${year}-01-01`; iso.startsWith(String(year)); iso = addDays(iso, 1)) {
    const wd = new Date(`${iso}T12:00:00Z`).getUTCDay();
    if (wd === 0 || wd === 6) continue;
    if (CATALONIA_HOLIDAYS.some((h) => h.date === iso)) continue;
    months[Number(iso.slice(5, 7)) - 1]!++;
  }
  return months;
}

/**
 * "Calendario 2027 Cataluña con festivos" (25 impr. at 8.8), "calendario 2027
 * con festivos catalunya" (16 at 9.8), "festivos 2027 catalunya" (14 at 10.1),
 * 22 Oct-4 Nov 2026: the searcher wants the year laid out by month, which the
 * page only had as a list of twelve dates. One row per month: the holidays
 * (each linked to its date page) and the working days left.
 */
function monthByMonthSection(copy: HolidayCopy, locale: Locale): Block[] {
  const working = workingDaysByMonth();
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const none = { ca: "Cap festiu", es: "Ningún festivo", en: "No public holiday" }[locale];
  const rows = copy.months.map((month, index) => {
    const mm = String(index + 1).padStart(2, "0");
    const days = CATALONIA_HOLIDAYS.filter((h) => h.date.slice(5, 7) === mm).map((h) => {
      const day = String(Number(h.date.slice(8, 10)));
      const text = locale === "en" ? `${weekdayOf(h.date, copy)} ${day} (${h.name.en})` : `${weekdayOf(h.date, copy)} ${day} (${h.name[locale]})`;
      return linkedDay(h.date, text, locale);
    });
    return [cap(month), days.length ? joinList(days, locale) : none, String(working[index])];
  });
  const total = working.reduce((a, b) => a + b, 0);
  const swap = aranSwap(YEAR);
  if (!swap || swap.date !== ARAN_REPLACEMENT.date) throw new Error("holiday guide: Aran's swap for the month table is missing");
  const aranIn = formatDay(swap.replaces, copy, locale);
  const aranOut = formatDay(swap.date, copy, locale);
  const bcn = BARCELONA_LOCAL.map((h) => formatDay(h.date, copy, locale));
  // The months in which Barcelona's local days take a working day away.
  const bcnMonths = joinList(
    [...new Set(BARCELONA_LOCAL.filter((h) => ![0, 6].includes(new Date(`${h.date}T12:00:00Z`).getUTCDay())).map((h) => copy.months[Number(h.date.slice(5, 7)) - 1] ?? ""))].map((m) => (locale === "en" ? cap(m) : m)),
    locale,
  );
  const t = {
    ca: {
      title: `Calendari ${YEAR} mes a mes: festius i dies feiners`,
      intro: `Els dotze festius de ${YEAR} a Catalunya, mes per mes, amb els dies feiners de dilluns a divendres que queden a cada mes: ${total} en tot l'any.`,
      headers: ["Mes", "Festius a tot Catalunya", "Dies feiners"],
      note: `Dies feiners: de dilluns a divendres, sense els festius de tot Catalunya. Cal restar-hi les dues festes locals de cada municipi (a Barcelona, el ${bcn.join(" i el ")}: un dia feiner menys al ${bcnMonths}). A l'Aran, el ${aranIn} és feiner i el ${aranOut} és festiu.`,
    },
    es: {
      title: `Calendario ${YEAR} mes a mes: festivos y días laborables`,
      intro: `Los doce festivos de ${YEAR} en Cataluña, mes por mes, con los días laborables de lunes a viernes que quedan en cada mes: ${total} en todo el año.`,
      headers: ["Mes", "Festivos en toda Cataluña", "Días laborables"],
      note: `Días laborables: de lunes a viernes, sin los festivos de toda Cataluña. Hay que restar las dos fiestas locales de cada municipio (en Barcelona, el ${bcn.join(" y el ")}: un laborable menos en ${bcnMonths}). En Arán, el ${aranIn} es laborable y el ${aranOut} es festivo.`,
    },
    en: {
      title: `${YEAR} month by month: public holidays and working days`,
      intro: `Catalonia's twelve public holidays in ${YEAR}, month by month, with the Monday-to-Friday working days left in each month: ${total} in the whole year.`,
      headers: ["Month", "Catalonia-wide holidays", "Working days"],
      note: `Working days: Monday to Friday, without the Catalonia-wide holidays. Take off each town's two local holidays (in Barcelona, ${bcn.join(" and ")}: one working day fewer in ${bcnMonths}). In Aran, ${aranIn} is a working day and ${aranOut} a holiday.`,
    },
  }[locale];
  return [
    { type: "heading", level: 2, text: t.title },
    { type: "paragraph", text: t.intro },
    { type: "table", caption: t.title, headers: t.headers, rows, note: t.note, stickyColumn: 0 },
  ];
}

/**
 * The current year's calendar (Ordre EMT/66/2025), for searches that still ask
 * about 2026. Dates with a page of their own ("is 8 December a holiday?") link
 * to it, so the December questions land on the page that answers them.
 */
function currentYearSection(copy: HolidayCopy, locale: Locale): Block[] {
  const year = HOLIDAYS_BY_YEAR[2026] ?? [];
  if (year.length !== 12) throw new Error("holiday guide: the 2026 calendar is incomplete");
  const day = (iso: string) => formatDay(iso, copy, locale);
  const linked = (iso: string, text: string) => linkedDay(iso, text, locale);
  const last = joinList(
    year.filter((h) => h.date.slice(5, 7) === "12").map((h) => linked(h.date, `${weekdayOf(h.date, copy)} ${day(h.date)}`)),
    locale,
  );
  const dec7 = linked(DEC7_2026, `${weekdayOf(DEC7_2026, copy)} ${day(DEC7_2026)}`);
  const barcelona = municipalityBySlug("barcelona");
  if (!barcelona || barcelona.local.length !== 2) throw new Error("holiday guide: Barcelona's 2026 local days are missing");
  const bcn = joinList(barcelona.local.map((iso) => `${dayArticle(day(iso), locale)}${day(iso)}`), locale);

  return [
    { type: "heading", level: 2, text: copy.year2026Title },
    { type: "paragraph", text: copy.year2026Intro.replace("{last}", last).replace("{dec7}", dec7) },
    {
      type: "table",
      caption: copy.year2026Title,
      headers: copy.tableHeaders,
      rows: year.map((h) => [linked(h.date, day(h.date)), weekdayOf(h.date, copy), h.name[locale]]),
      note: copy.year2026Note.replace("{bcn}", bcn),
      stickyColumn: 0,
    },
  ];
}

/** After the bridges table: the 2027 leave planner (/es/festivos/2027/aprovechar-vacaciones/), with the reader's town and days. */
const LEAVE_LINE: Record<Locale, string> = {
  ca: `Per al teu municipi i els dies de vacances que tens, el [planificador de vacances del ${LEAVE_YEAR}](${leavePath("ca")}) calcula quins dies has de demanar per encadenar més dies lliures.`,
  es: `Para tu municipio y los días de vacaciones que tienes, el [planificador de vacaciones de ${LEAVE_YEAR}](${leavePath("es")}) calcula qué días pedir para encadenar más días libres.`,
  en: `For your own town and the leave you have, the [${LEAVE_YEAR} leave planner](${leavePath("en")}) works out which days to book for the longest breaks.`,
};

/** After the leave planner line: the working-days calculator (plazos with the town's holidays). */
const WORKING_DAYS_LINE: Record<Locale, string> = {
  ca: `Si tens un termini en dies hàbils, la [calculadora de dies hàbils](${workingDaysPath("ca")}) en compta l'últim dia amb els festius del teu municipi.`,
  es: `Si tienes un plazo en días hábiles, la [calculadora de días hábiles](${workingDaysPath("es")}) cuenta su último día con los festivos de tu municipio.`,
  en: `If you have a deadline in working days, the [working days calculator](${workingDaysPath("en")}) finds its last day with your town's holidays.`,
};

/** Last line: the calculators hub (net salary, settlement, dismissal, unemployment, rent). */
const CALCULATORS_LINE: Record<Locale, string> = {
  ca: `I si estàs fent números de l'any: les [calculadores de sou net, quitança, atur i lloguer](${calculatorsHubPath("ca")}).`,
  es: `Y si estás haciendo números del año: las [calculadoras de sueldo neto, finiquito, paro y alquiler](${calculatorsHubPath("es")}).`,
  en: `And if you are doing the year's sums: the [net salary, final settlement, unemployment benefit and rent calculators](${calculatorsHubPath("en")}).`,
};

export function buildBody(locale: Locale, inlineMediaId?: string): Block[] {
  const copy = COPY[locale];
  const blocks: Block[] = [];
  const [opening, ...restOfLead] = copy.lead;

  /*
   * First screen (3 Nov 2026): the 2027 list, then the last days of 2026.
   * "Calendario laboral 2027 cataluña", "festivos catalunya 2027" and
   * "divendres sant 2027" are the rising queries, and 2026 has three holidays
   * left; the planning (bridges, key facts) follows them.
   */
  if (opening) blocks.push({ type: "paragraph", text: opening, lead: true });

  /* ---- The twelve dates ------------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.tableTitle });
  blocks.push({
    type: "table",
    caption: copy.tableCaption,
    headers: copy.tableHeaders,
    rows: holidayRows(CATALONIA_HOLIDAYS, copy, locale),
    note: copy.tableNote.replace("{bcn}", barcelonaLocalLine(copy, locale)).replace("{local}", localAnchor(copy, locale)),
    stickyColumn: 0,
  });

  /* ---- What is left of this year ----------------------------------------- */
  blocks.push(last2026Callout(copy, locale));

  for (const text of restOfLead) blocks.push({ type: "paragraph", text });

  blocks.push({
    type: "callout",
    tone: "info",
    title: copy.directAnswerTitle,
    text: copy.directAnswer,
  });

  blocks.push({
    type: "keyFacts",
    title: copy.keyFactsTitle,
    // The working-day count goes before the verification date, which stays last.
    items: [...copy.keyFacts.slice(0, -1), workingDaysFact(locale), ...copy.keyFacts.slice(-1)].map((fact) => ({ label: fact.label, value: fact.value })),
  });

  /* ---- Month by month (5 Nov 2026) --------------------------------------- */
  blocks.push(...monthByMonthSection(copy, locale));

  /* ---- National or Catalan ------------------------------------------------ */
  blocks.push({ type: "heading", level: 2, text: copy.nationalTitle });
  for (const text of copy.national) blocks.push({ type: "paragraph", text });

  /* ---- Easter ------------------------------------------------------------ */
  blocks.push(...easterSection(copy, locale));

  /* ---- Saturdays --------------------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.saturdayTitle });
  for (const text of copy.saturday) blocks.push({ type: "paragraph", text });

  if (inlineMediaId) {
    blocks.push({ type: "image", mediaId: inlineMediaId, size: "wide" });
  }

  /* ---- Bridges ----------------------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.bridgesTitle });
  for (const text of copy.bridgesIntro) blocks.push({ type: "paragraph", text });
  for (const bridge of BRIDGES) blocks.push(...bridgeSection(bridge, copy, locale));

  /* ---- The efficiency table ---------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.efficiencyTitle });
  blocks.push({
    type: "table",
    caption: copy.efficiencyCaption,
    headers: copy.efficiencyHeaders,
    rows: [...BRIDGES]
      .sort((a, b) => a.take.length - b.take.length || b.days - a.days)
      .map((bridge) => [
        bridge.take.length === 0 ? copy.efficiencyNone : copy.efficiencyDays(bridge.take.length),
        bridge.take.length === 0
          ? bridge.label[locale]
          : bridge.take.map((iso) => formatDay(iso, copy, locale)).join(", "),
        copy.efficiencyResult(bridge.days),
      ]),
    note: copy.efficiencyNote,
  });
  // The planner does the same sums for the reader's own town and days of leave.
  blocks.push({ type: "paragraph", text: LEAVE_LINE[locale] });
  blocks.push({ type: "paragraph", text: WORKING_DAYS_LINE[locale] });

  /* ---- Barcelona --------------------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.barcelonaTitle });
  blocks.push({ type: "paragraph", text: copy.barcelona[0] ?? "" });
  blocks.push({
    type: "list",
    ordered: false,
    items: BARCELONA_LOCAL.map(
      (holiday) =>
        `**${formatDay(holiday.date, copy, locale)}** (${weekdayOf(holiday.date, copy)}) — ${holiday.name[locale]}`,
    ),
  });
  for (const text of copy.barcelona.slice(1)) blocks.push({ type: "paragraph", text });

  /* ---- Other towns' local days ------------------------------------------- */
  blocks.push(...localSection(copy, locale));

  /* ---- Aran -------------------------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.aranTitle });
  for (const text of copy.aran) blocks.push({ type: "paragraph", text });
  blocks.push({
    type: "callout",
    tone: "warning",
    title: ARAN_REPLACEMENT.name[locale],
    text: `${formatDay(ARAN_REPLACEMENT.date, copy, locale)} (${weekdayOf(ARAN_REPLACEMENT.date, copy)})`,
  });

  /* ---- This year --------------------------------------------------------- */
  blocks.push(...currentYearSection(copy, locale));

  /* ---- The calendar file -------------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.calendarTitle });
  blocks.push({
    type: "calendar",
    title: copy.tableCaption,
    intro: copy.calendarIntro,
    downloadLabel: copy.calendarDownload,
    filename: copy.calendarFilename,
    events: CATALONIA_HOLIDAYS.map((holiday) => ({
      date: holiday.date,
      title: holiday.name[locale],
      scope: "Catalunya",
    })),
    note: copy.calendarNote,
  });
  blocks.push({ type: "paragraph", text: copy.calendarTowns.replace("{link}", localAnchor(copy, locale)) });

  blocks.push(faqBlock(locale));

  /* ---- Closing ------------------------------------------------------------ */
  blocks.push({ type: "heading", level: 2, text: copy.closingTitle });
  for (const text of copy.closing) blocks.push({ type: "paragraph", text });

  // Long weekends are what this page is for; these are the pages that say what
  // to do with one.
  const related: Record<Locale, string> = {
    ca: `Si ja saps quins dies tindràs lliures: ${link("weekend", "ca", "què fer aquest cap de setmana")}, ${link("trains", "ca", "dotze escapades en tren")} i ${link("montserrat", "ca", "deu escapades que no són Montserrat")}.`,
    es: `Si ya sabes qué días tendrás libres: ${link("weekend", "es", "qué hacer este fin de semana")}, ${link("trains", "es", "doce escapadas en tren")} y ${link("montserrat", "es", "diez escapadas que no son Montserrat")}.`,
    en: `Once you know which days you have: ${link("weekend", "en", "what's on this weekend")}, ${link("trains", "en", "twelve day trips by train")} and ${link("montserrat", "en", "ten that are not Montserrat")}.`,
  };
  blocks.push({ type: "paragraph", text: related[locale] });
  blocks.push({ type: "paragraph", text: copy.schoolLine });
  blocks.push({ type: "paragraph", text: CALCULATORS_LINE[locale] });

  return blocks;
}

/* -------------------------------------------------------------------------- */
/* Images                                                                     */
/* -------------------------------------------------------------------------- */

// Alt text and captions live in `./images`, shared with the 2027 bridges page
// (media rows are keyed by file, so both pages must send the same words).
const HERO_ALT = DIADA_IMAGE.alt;
const HERO_CAPTION = DIADA_IMAGE.caption;
const SECOND_ALT = SANT_JOAN_IMAGE.alt;
const SECOND_CAPTION = SANT_JOAN_IMAGE.caption;

function imageSpecs(): ImageSpec[] {
  const specs: ImageSpec[] = [];
  const add = (key: string, alt: Record<Locale, string>, caption: Record<Locale, string>) => {
    const file = IMAGE_BY_KEY.get(key);
    if (!file) return;
    specs.push({
      key,
      url: file.url,
      width: file.width,
      height: file.height,
      blurDataUrl: file.blurDataUrl,
      credit: file.credit ?? "CatalunyaInfo",
      creditUrl: file.creditUrl ?? null,
      license: file.license ?? null,
      alt,
      caption,
    });
  };
  add(HERO_KEY, HERO_ALT, HERO_CAPTION);
  add(SECOND_KEY, SECOND_ALT, SECOND_CAPTION);
  return specs;
}

export async function publishHolidayGuide(): Promise<PublishResult> {
  const images = imageSpecs();
  const mediaIds = images.length > 0 ? await upsertImages(images) : new Map<string, string>();
  const inlineMediaId = mediaIds.get(SECOND_KEY);

  const spec: ArticleSpec = {
    entryKey: ENTRY_KEY,
    type: "guide",
    categoryKey: "public-services",
    isFeatured: false,
    heroKey: IMAGE_BY_KEY.has(HERO_KEY) ? HERO_KEY : undefined,
    images,
    sources: SOURCES.map((source) => ({
      name: source.name,
      url: source.url,
      publisher: source.publisher,
      type: "official" as const,
    })),
    publishedAt: PUBLISHED,
    lastVerifiedAt: VERIFIED,
    editions: LOCALES.map((locale) => {
      const copy = COPY[locale];
      return {
        locale,
        path: copy.path,
        title: copy.title,
        excerpt: copy.excerpt,
        seoTitle: copy.seoTitle,
        seoDescription: copy.seoDescription,
        body: buildBody(locale, inlineMediaId),
      };
    }),
  };

  return publishArticle(spec);
}

export { YEAR };

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

const HOLIDAY_PATH: Record<Locale, { today: string; local: string }> = {
  ca: { today: "/ca/guies/es-festiu-avui-catalunya/", local: "/ca/guies/festius-locals-catalunya/" },
  es: { today: "/es/guias/es-festivo-hoy-cataluna/", local: "/es/guias/festivos-locales-cataluna/" },
  en: { today: "/en/guides/is-today-a-holiday-in-catalonia/", local: "/en/guides/local-holidays-catalonia/" },
};

/**
 * The questions Search Console shows people asking this page, answered in the
 * words they use. Every date is rendered from the payload, like the rest of
 * the page, so the answers cannot drift from the table above them.
 */
function faqBlock(locale: Locale): Block {
  const find = (en: string) => {
    const holiday = CATALONIA_HOLIDAYS.find((h) => h.name.en === en);
    if (!holiday) throw new Error(`holiday FAQ: no ${en} in the ${YEAR} calendar`);
    return longDate(holiday.date, locale);
  };
  const goodFriday = find("Good Friday");
  const easterMonday = find("Easter Monday");
  const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
  const count = CATALONIA_HOLIDAYS.length;
  const path = HOLIDAY_PATH[locale];
  const copy = COPY[locale];

  // Long weekends, from the same BRIDGES the section above renders.
  const span = (b: Bridge) => `${formatDay(b.from, copy, locale)} – ${formatDay(b.to, copy, locale)}`;
  const free = joinList(
    BRIDGES.filter((b) => b.take.length === 0).map((b) => `${b.label[locale]} (${span(b)}, ${copy.efficiencyResult(b.days)})`),
    locale,
  );
  const oneDayItems = BRIDGES.filter((b) => b.take.length === 1).map((b) => {
    const day = formatDay(b.take[0]!, copy, locale);
    return `${dayArticle(day, locale)}${day} (${copy.efficiencyResult(b.days)}, ${span(b)})`;
  });
  const or = locale === "en" ? " or " : " o ";
  const oneDay =
    oneDayItems.length <= 1 ? oneDayItems.join("") : `${oneDayItems.slice(0, -1).join(", ")}${or}${oneDayItems.at(-1)}`;
  const dec7 = datePath(locale, DEC7_2026);
  const nov1 = datePath(locale, NOV1_2026);
  const work = workingDays();
  const approved = councilApprovedTowns().length;
  const bcnDays = joinList(
    BARCELONA_LOCAL.map((h) => {
      const day = formatDay(h.date, copy, locale);
      return `${dayArticle(day, locale)}${day} (${h.name[locale].replace(/ \(.*\)$/, "")})`;
    }),
    locale,
  );

  const items: Record<Locale, { question: string; answer: string }[]> = {
    ca: [
      { question: `Quants festius hi ha a Catalunya el ${YEAR}?`, answer: `${count} festius a tot Catalunya, fixats per la Generalitat, més dues festes locals que tria cada ajuntament: consulta les [festes locals de cada municipi](${path.local}).` },
      { question: `Quan és Divendres Sant el ${YEAR}?`, answer: `${cap(goodFriday)}. És festiu a tot Catalunya.` },
      { question: `Quan és Pasqua Florida el ${YEAR}?`, answer: `El Dilluns de Pasqua Florida és ${easterMonday}, festiu a tot Catalunya excepte a l'Aran, on el substitueix la Festa d'Aran.` },
      { question: "El Dijous Sant és festiu a Catalunya?", answer: `No. El ${YEAR} cau el 25 de març i és festiu a la majoria de comunitats, però no a Catalunya, on el festiu és el Divendres Sant.` },
      { question: "El dilluns 2 de novembre és festiu a Catalunya?", answer: `No. Tots Sants, l'1 de novembre de 2026, cau en diumenge i no és al calendari oficial de Catalunya, i el dilluns 2 tampoc: és feiner, tret dels pocs municipis que el tenen com a festa local (tots a [és festiu l'1 de novembre?](${nov1})). En altres comunitats, com Madrid o Andalusia, el dilluns 2 sí que és festiu.` },
      { question: `Quants dies feiners té el ${YEAR} a Catalunya?`, answer: `${work.working}: el ${YEAR} té ${work.weekdays} dies de dilluns a divendres, i ${work.weekdays - work.working} dels dotze festius hi cauen. Amb les dues festes locals del municipi, si cauen en dia feiner, en queden ${work.working - 2}.` },
      { question: `Quins ponts hi ha el ${YEAR} a Catalunya?`, answer: `Sense gastar vacances: ${free}. Amb un sol dia de vacances, demanant ${oneDay}. Tot plegat, per a una setmana de dilluns a divendres.` },
      { question: `Quants festius té Barcelona el ${YEAR}?`, answer: `Catorze: els ${count} de tot Catalunya i les dues festes locals de la ciutat, ${bcnDays}. Dia a dia, a [festius de Barcelona](/ca/festius/barcelona/).` },
      { question: `Quan es publiquen les festes locals del ${YEAR}?`, answer: `L'ordre encara no ha sortit: la Generalitat les fixa en una ordre del DOGC a proposta dels ajuntaments, i les del 2026 van sortir el 17 de desembre de 2025. Mentrestant, ${approved} ajuntaments ja han aprovat les seves, pendents de l'ordre: les de les grans ciutats són a la taula de dalt, i les de cada municipi, a [festius locals per municipi](/ca/festius/).` },
      { question: "El 7 de desembre de 2026 és festiu a Catalunya?", answer: `No. És un dia feiner a Catalunya; només és festa local en alguns municipis, que tens tots a [és festiu el 7 de desembre?](${dec7}).` },
      { question: "És festiu avui?", answer: `Ho diem dia a dia a [és festiu avui a Catalunya?](${path.today}), amb el pròxim festiu.` },
    ],
    es: [
      { question: `¿Cuántos festivos hay en Cataluña en ${YEAR}?`, answer: `${count} festivos en toda Cataluña, fijados por la Generalitat, más dos fiestas locales que elige cada ayuntamiento: consulta las [fiestas locales de cada municipio](${path.local}).` },
      { question: `¿Cuándo es Viernes Santo en ${YEAR}?`, answer: `${cap(goodFriday)}. Es festivo en toda Cataluña.` },
      { question: `¿Cuándo es el Lunes de Pascua en ${YEAR}?`, answer: `${cap(easterMonday)}. Es festivo en toda Cataluña excepto en Arán, donde lo sustituye la Festa d'Aran.` },
      { question: "¿El Jueves Santo es festivo en Cataluña?", answer: `No. En ${YEAR} cae el 25 de marzo y es festivo en la mayoría de comunidades, pero no en Cataluña, donde el festivo es el Viernes Santo.` },
      { question: "¿El lunes 2 de noviembre es festivo en Cataluña?", answer: `No. Todos los Santos, el 1 de noviembre de 2026, cae en domingo y no está en el calendario oficial de Cataluña, y el lunes 2 tampoco: es laborable, salvo en los pocos municipios que lo tienen como fiesta local (todos en [¿es festivo el 1 de noviembre?](${nov1})). En otras comunidades, como Madrid o Andalucía, el lunes 2 sí es festivo.` },
      { question: `¿Cuántos días laborables tiene ${YEAR} en Cataluña?`, answer: `${work.working}: ${YEAR} tiene ${work.weekdays} días de lunes a viernes, y ${work.weekdays - work.working} de los doce festivos caen en ellos. Con las dos fiestas locales del municipio, si caen en día laborable, quedan ${work.working - 2}.` },
      { question: `¿Qué puentes hay en ${YEAR} en Cataluña?`, answer: `Sin gastar vacaciones: ${free}. Con un solo día de vacaciones, pidiendo ${oneDay}. Todo ello, para una semana de lunes a viernes.` },
      { question: `¿Cuántos festivos tiene Barcelona en ${YEAR}?`, answer: `Catorce: los ${count} de toda Cataluña y las dos fiestas locales de la ciudad, ${bcnDays}. Día a día, en [festivos de Barcelona](/es/festivos/barcelona/).` },
      { question: `¿Cuándo se publican los festivos locales de ${YEAR}?`, answer: `La orden todavía no ha salido: la Generalitat los fija en una orden del DOGC a propuesta de los ayuntamientos, y los de 2026 salieron el 17 de diciembre de 2025. Mientras tanto, ${approved} ayuntamientos ya han aprobado los suyos, pendientes de la orden: los de las grandes ciudades están en la tabla de arriba, y los de cada municipio, en [festivos locales por municipio](/es/festivos/).` },
      { question: "¿El 7 de diciembre de 2026 es festivo en Cataluña?", answer: `No. Es laborable en Cataluña; solo es fiesta local en algunos municipios, que tienes todos en [¿es festivo el 7 de diciembre?](${dec7}).` },
      { question: "¿Es festivo hoy?", answer: `Lo decimos cada día en [¿es festivo hoy en Cataluña?](${path.today}), con el próximo festivo.` },
    ],
    en: [
      { question: `How many public holidays does Catalonia have in ${YEAR}?`, answer: `${count} across Catalonia, set by the Generalitat, plus two local holidays chosen by each town council: see the [local holidays for each town](${path.local}).` },
      { question: `When is Good Friday in ${YEAR}?`, answer: `${cap(goodFriday)}. It is a public holiday across Catalonia.` },
      { question: `When is Easter Monday in ${YEAR}?`, answer: `${cap(easterMonday)}. It is a public holiday across Catalonia except in Aran, where the Festa d'Aran replaces it.` },
      { question: "Is Maundy Thursday a holiday in Catalonia?", answer: `No. In ${YEAR} it falls on 25 March and is a holiday in most of Spain, but not in Catalonia, where the holiday is Good Friday.` },
      { question: `How many public holidays does Barcelona have in ${YEAR}?`, answer: `Fourteen: the ${count} Catalonia-wide days plus the city's two local holidays, ${bcnDays}.` },
      { question: `What long weekends are there in ${YEAR}?`, answer: `Without using any leave: ${free}. With a single day of leave, take ${oneDay}. All of this assumes a Monday-to-Friday week.` },
      { question: `When are the ${YEAR} local holidays published?`, answer: `The order is not out yet: the Catalan government sets them in a DOGC order on the town councils' proposals, and the 2026 ones appeared on 17 December 2025. Meanwhile ${approved} town councils have approved theirs, pending the order: the largest towns' are in the table above, and each town's 2026 dates are in [local holidays in Catalonia](${path.local}).` },
      { question: `How many working days are there in ${YEAR} in Catalonia?`, answer: `${work.working}: ${YEAR} has ${work.weekdays} weekdays, and ${work.weekdays - work.working} of the twelve holidays fall on them. With a town's two local holidays, if both fall on weekdays, that leaves ${work.working - 2}.` },
      { question: "Is 7 December 2026 a public holiday in Catalonia?", answer: `No. It is a working day in Catalonia, except in the towns that keep it as a local holiday, all listed in [is 7 December a holiday?](${dec7}).` },
      { question: "Is today a public holiday?", answer: `We answer that every day at [is today a public holiday in Catalonia?](${path.today}), with the next one.` },
    ],
  };
  const title: Record<Locale, string> = {
    ca: "Preguntes freqüents",
    es: "Preguntas frecuentes",
    en: "Frequently asked questions",
  };
  return { type: "faq", title: title[locale], items: items[locale] };
}
