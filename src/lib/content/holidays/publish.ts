import "server-only";

import type { Block } from "@/lib/content/blocks";
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
import { municipalityBySlug } from "@/lib/programmatic/holidays/data";
import { joinList } from "@/lib/programmatic/holidays/names";
import { datePath, isDatePage } from "@/lib/programmatic/holidays/paths";
import { largestTownLinks, townPageCount } from "@/lib/programmatic/holidays/towns";
import { COPY, type HolidayCopy } from "./copy";
import { HOLIDAYS_BY_YEAR, addDays, longDate } from "./calendar";

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

const HERO_KEY = "calendari-laboral-catalunya-diada";
const SECOND_KEY = "calendari-laboral-catalunya-sant-joan";

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

function holidayRows(holidays: Holiday[], copy: HolidayCopy, locale: Locale): string[][] {
  return holidays.map((holiday) => [
    formatDay(holiday.date, copy, locale),
    weekdayOf(holiday.date, copy),
    holiday.name[locale],
  ]);
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
  return [
    { type: "heading", level: 2, text: copy.easterTitle },
    { type: "paragraph", text: copy.easterIntro },
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
  ];
}

/** When next year's local days appear, and where this year's are (the town pages). */
function localSection(copy: HolidayCopy, locale: Locale): Block[] {
  const towns = locale === "en" ? "" : joinList(largestTownLinks(locale), locale);
  return [
    { type: "heading", level: 2, text: copy.localTitle },
    ...copy.local.map((text) => ({ type: "paragraph", text: text.replace("{towns}", towns).replace("{count}", String(townPageCount())) }) as Block),
  ];
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
 * The current year's calendar (Ordre EMT/66/2025), for searches that still ask
 * about 2026. Dates with a page of their own ("is 8 December a holiday?") link
 * to it, so the December questions land on the page that answers them.
 */
function currentYearSection(copy: HolidayCopy, locale: Locale): Block[] {
  const year = HOLIDAYS_BY_YEAR[2026] ?? [];
  if (year.length !== 12) throw new Error("holiday guide: the 2026 calendar is incomplete");
  const day = (iso: string) => formatDay(iso, copy, locale);
  const linked = (iso: string, text: string) => (isDatePage(iso) ? `[${text}](${datePath(locale, iso)})` : text);
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

export function buildBody(locale: Locale, inlineMediaId?: string): Block[] {
  const copy = COPY[locale];
  const blocks: Block[] = [];

  copy.lead.forEach((text, index) => {
    blocks.push({ type: "paragraph", text, ...(index === 0 ? { lead: true } : {}) });
  });

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

  /* ---- The twelve dates ------------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.tableTitle });
  for (const text of copy.tableIntro) blocks.push({ type: "paragraph", text });
  blocks.push({
    type: "table",
    caption: copy.tableCaption,
    headers: copy.tableHeaders,
    rows: holidayRows(CATALONIA_HOLIDAYS, copy, locale),
    note: copy.tableNote,
    stickyColumn: 0,
  });

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

  return blocks;
}

/* -------------------------------------------------------------------------- */
/* Images                                                                     */
/* -------------------------------------------------------------------------- */

const HERO_ALT: Record<Locale, string> = {
  ca: "Ofrena floral durant la Diada Nacional de Catalunya, amb rams de colors al peu del monument",
  es: "Ofrenda floral durante la Diada Nacional de Cataluña, con ramos de colores al pie del monumento",
  en: "Flowers laid at a monument during the Diada, Catalonia's national day",
};

const HERO_CAPTION: Record<Locale, string> = {
  ca: "L'11 de setembre, la Diada, és un dels dotze festius de tot Catalunya.",
  es: "El 11 de septiembre, la Diada, es uno de los doce festivos de toda Cataluña.",
  en: "11 September, the Diada, is one of the twelve holidays kept across Catalonia.",
};

const SECOND_ALT: Record<Locale, string> = {
  ca: "Foguera i focs de la revetlla de Sant Joan en un carrer de Barcelona, de nit",
  es: "Hoguera y fuegos de la verbena de Sant Joan en una calle de Barcelona, de noche",
  en: "A Sant Joan bonfire and fireworks in a Barcelona street at night",
};

const SECOND_CAPTION: Record<Locale, string> = {
  ca: "La revetlla es fa la nit del 23, però el festiu és el 24 de juny.",
  es: "La verbena es la noche del 23, pero el festivo es el 24 de junio.",
  en: "The party is the night of the 23rd; the public holiday is 24 June.",
};

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
      { question: `Quan es publiquen les festes locals del ${YEAR}?`, answer: `Encara no s'han publicat: la Generalitat les fixa en una ordre del DOGC a proposta dels ajuntaments, i les del 2026 van sortir el 17 de desembre de 2025. Mentrestant, les del 2026 de cada municipi són a [festius locals per municipi](/ca/festius/).` },
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
      { question: `¿Cuándo se publican los festivos locales de ${YEAR}?`, answer: `Todavía no se han publicado: la Generalitat los fija en una orden del DOGC a propuesta de los ayuntamientos, y los de 2026 salieron el 17 de diciembre de 2025. Mientras tanto, los de 2026 de cada municipio están en [festivos locales por municipio](/es/festivos/).` },
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
      { question: `When are the ${YEAR} local holidays published?`, answer: `Not yet: the Catalan government sets them in a DOGC order on the town councils' proposals, and the 2026 ones appeared on 17 December 2025. Until then, each town's 2026 dates are in [local holidays in Catalonia](${path.local}).` },
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
