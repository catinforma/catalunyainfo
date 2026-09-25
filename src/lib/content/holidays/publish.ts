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
import { COPY, type HolidayCopy } from "./copy";

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
    items: copy.keyFacts.map((fact) => ({ label: fact.label, value: fact.value })),
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

  /* ---- Aran -------------------------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.aranTitle });
  for (const text of copy.aran) blocks.push({ type: "paragraph", text });
  blocks.push({
    type: "callout",
    tone: "warning",
    title: ARAN_REPLACEMENT.name[locale],
    text: `${formatDay(ARAN_REPLACEMENT.date, copy, locale)} (${weekdayOf(ARAN_REPLACEMENT.date, copy)})`,
  });

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
