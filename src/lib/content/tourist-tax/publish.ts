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
import { link } from "@/lib/content/features/shared";
import { IMAGES } from "@/lib/content/images";
import {
  ACCOMMODATION_LABEL,
  ACCOMMODATION_ORDER,
  EXEMPT_AGE_AT_OR_BELOW,
  LAST_VERIFIED,
  MAX_STAY_UNITS,
  MUNICIPAL_SURCHARGE_FROM,
  RATE_PERIODS,
  SOURCES,
  calculateTax,
  periodFor,
  round,
  type AccommodationType,
  type RatePeriod,
  type Scope,
} from "./rates";
import { COPY, type TaxCopy } from "./copy";

/**
 * The tourist tax guide.
 *
 * Every euro on the page — the tables, the worked examples, the one-line
 * answer at the top — is computed here from `rates.ts`. The prose in `copy.ts`
 * contains no figures at all. That is deliberate: a rate rise is then a
 * one-line edit that propagates to three languages, and it is impossible for
 * the table and the sentence above it to disagree.
 *
 * The calculator is placed as a bare `{ type: "touristTax" }` block, so the
 * page and the widget cannot drift apart either.
 */

export const ENTRY_KEY = "guide-tourist-tax-catalonia";

const PUBLISHED = new Date("2026-09-25T10:00:00+02:00");
const VERIFIED = new Date(`${LAST_VERIFIED}T12:00:00+02:00`);

/** A date inside the current verified period, used for the worked examples. */
const EXAMPLE_DATE = "2026-10-15";

const HERO_KEY = "taxa-turistica-barcelona-skyline";
const SECOND_KEY = "taxa-turistica-catalunya-costa";

const IMAGE_BY_KEY = new Map(IMAGES.map((image) => [image.key, image]));

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function money(value: number, locale: Locale): string {
  return value.toLocaleString(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

/** The period a table renders, chosen by scope and start date. */
function periodAt(scope: Scope, from: string): RatePeriod {
  const period = RATE_PERIODS.find((item) => item.scope === scope && item.from === from);
  if (!period) throw new Error(`no rate period for ${scope} from ${from}`);
  return period;
}

const BCN_NOW = periodAt("barcelona", "2026-04-01");
const REST_NOW = periodAt("rest-of-catalonia", "2026-04-01");
const REST_2027 = periodAt("rest-of-catalonia", "2027-04-01");

/* -------------------------------------------------------------------------- */
/* Tables                                                                     */
/* -------------------------------------------------------------------------- */

/** Regional / surcharge / total, one row per accommodation type. */
function combinedRows(period: RatePeriod, copy: TaxCopy, locale: Locale): string[][] {
  return ACCOMMODATION_ORDER.map((type) => {
    const regional = period.regional[type];
    const surcharge = period.surcharge;
    return [
      ACCOMMODATION_LABEL[type][locale],
      money(regional, locale),
      surcharge === null ? copy.noSurcharge : money(surcharge, locale),
      surcharge === null ? money(regional, locale) : money(round(regional + surcharge), locale),
    ];
  });
}

/** Two columns, for a period with no verified surcharge to show. */
function regionalRows(period: RatePeriod, locale: Locale): string[][] {
  return ACCOMMODATION_ORDER.map((type) => [
    ACCOMMODATION_LABEL[type][locale],
    money(period.regional[type], locale),
  ]);
}

/* -------------------------------------------------------------------------- */
/* Worked examples                                                            */
/* -------------------------------------------------------------------------- */

interface Example {
  scope: Scope;
  accommodation: AccommodationType;
  liableGuests: number;
  nights: number;
}

/**
 * The four cases in the same order as `copy.examples`.
 *
 * They are computed, not written down, so the table can never show a total
 * that the calculator on the same page would contradict.
 */
export const EXAMPLES: Example[] = [
  { scope: "barcelona", accommodation: "hotel-4", liableGuests: 2, nights: 4 },
  { scope: "barcelona", accommodation: "tourist-dwelling", liableGuests: 2, nights: 4 },
  { scope: "barcelona", accommodation: "hotel-5", liableGuests: 2, nights: 10 },
  { scope: "rest-of-catalonia", accommodation: "hotel-4", liableGuests: 2, nights: 4 },
];

export function exampleResult(example: Example) {
  return calculateTax({ ...example, date: EXAMPLE_DATE });
}

function exampleRows(copy: TaxCopy, locale: Locale): string[][] {
  return EXAMPLES.map((example, index) => {
    const result = exampleResult(example);
    const text = copy.examples[index];
    const scenario = text?.note
      ? `${text.scenario} — ${text.note}`
      : (text?.scenario ?? "");
    return [
      scenario,
      `${money(result.perPersonPerUnit ?? 0, locale)} × ${result.liableGuests} × ${result.taxableUnits}`,
      money(result.total ?? 0, locale),
    ];
  });
}

/* -------------------------------------------------------------------------- */
/* Body                                                                       */
/* -------------------------------------------------------------------------- */

function directAnswer(copy: TaxCopy, locale: Locale): string {
  const bcn4 = calculateTax({
    scope: "barcelona",
    date: EXAMPLE_DATE,
    accommodation: "hotel-4",
    liableGuests: 2,
    nights: 4,
  });
  const rest4 = REST_NOW.regional["hotel-4"];

  return copy.directAnswer
    .replace("{bcn4}", money(bcn4.perPersonPerUnit ?? 0, locale))
    .replace("{bcn4reg}", money(bcn4.regional ?? 0, locale))
    .replace("{bcn4sur}", money(bcn4.surcharge ?? 0, locale))
    .replace("{couple4}", money(bcn4.total ?? 0, locale))
    .replace("{rest4}", money(rest4, locale))
    .replace("{max}", String(MAX_STAY_UNITS))
    .replace("{age}", String(EXEMPT_AGE_AT_OR_BELOW));
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
    text: directAnswer(copy, locale),
  });

  blocks.push({
    type: "keyFacts",
    title: copy.keyFactsTitle,
    items: [
      {
        label: copy.keyFactLabels.surcharge,
        value: money(BCN_NOW.surcharge ?? 0, locale),
      },
      { label: copy.keyFactLabels.maxUnits, value: String(MAX_STAY_UNITS) },
      { label: copy.keyFactLabels.exemption, value: copy.keyFactValues.exemption },
      { label: copy.keyFactLabels.scope, value: copy.keyFactValues.scope },
      { label: copy.keyFactLabels.verified, value: copy.keyFactValues.verified },
      { label: copy.keyFactLabels.review, value: copy.keyFactValues.review },
    ],
  });

  /* ---- The calculator, high on the page ---------------------------------- */
  blocks.push({ type: "touristTax" });

  /* ---- Barcelona now ------------------------------------------------------ */
  blocks.push({ type: "heading", level: 2, text: copy.barcelonaTitle });
  for (const text of copy.barcelona) blocks.push({ type: "paragraph", text });
  blocks.push({
    type: "table",
    caption: copy.barcelonaCaption,
    headers: [
      copy.tableHeaders.type,
      copy.tableHeaders.regional,
      copy.tableHeaders.surcharge,
      copy.tableHeaders.total,
    ],
    rows: combinedRows(BCN_NOW, copy, locale),
    note: copy.tableNote,
    stickyColumn: 0,
  });

  if (inlineMediaId) {
    blocks.push({ type: "image", mediaId: inlineMediaId, size: "wide" });
  }

  /* ---- Rest of Catalonia now ---------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.restTitle });
  for (const text of copy.rest) blocks.push({ type: "paragraph", text });
  blocks.push({
    type: "table",
    caption: copy.restCaption,
    headers: [copy.futureHeaders.type, copy.futureHeaders.rate],
    rows: regionalRows(REST_NOW, locale),
    note: copy.tableNote,
    stickyColumn: 0,
  });

  /* ---- 1 April 2027 -------------------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.futureTitle });
  for (const text of copy.future) blocks.push({ type: "paragraph", text });
  blocks.push({
    type: "table",
    caption: copy.futureCaption,
    headers: [copy.futureHeaders.type, copy.futureHeaders.rate],
    rows: regionalRows(REST_2027, locale),
    note: copy.tableNote,
    stickyColumn: 0,
  });

  blocks.push({ type: "heading", level: 3, text: copy.barcelonaFutureTitle });
  for (const text of copy.barcelonaFuture) blocks.push({ type: "paragraph", text });

  /* ---- Exemptions and the cap ---------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.childrenTitle });
  for (const text of copy.children) blocks.push({ type: "paragraph", text });

  blocks.push({ type: "heading", level: 2, text: copy.nightsTitle });
  for (const text of copy.nights) blocks.push({ type: "paragraph", text });

  /* ---- Worked examples ------------------------------------------------------ */
  blocks.push({ type: "heading", level: 2, text: copy.examplesTitle });
  blocks.push({ type: "paragraph", text: copy.examplesIntro });
  blocks.push({
    type: "table",
    headers: [
      copy.exampleLabels.scenario,
      copy.exampleLabels.calculation,
      copy.exampleLabels.total,
    ],
    rows: exampleRows(copy, locale),
    note: copy.tableNote,
    stickyColumn: 0,
  });

  /* ---- Booking, collection, purpose ----------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.bookingTitle });
  for (const text of copy.booking) blocks.push({ type: "paragraph", text });

  blocks.push({ type: "heading", level: 2, text: copy.whoTitle });
  for (const text of copy.who) blocks.push({ type: "paragraph", text });

  blocks.push({ type: "heading", level: 2, text: copy.whyTitle });
  for (const text of copy.why) blocks.push({ type: "paragraph", text });

  /* ---- Closing --------------------------------------------------------------- */
  blocks.push({ type: "heading", level: 2, text: copy.closingTitle });
  for (const text of copy.closing) blocks.push({ type: "paragraph", text });

  const related: Record<Locale, string> = {
    ca: `Mentre planifiques: ${link("traps", "ca", "Barcelona sense trampes per a turistes")} i ${link("trains", "ca", "dotze escapades en tren")}.`,
    es: `Mientras planificas: ${link("traps", "es", "Barcelona sin trampas para turistas")} y ${link("trains", "es", "doce escapadas en tren")}.`,
    en: `While you plan: ${link("traps", "en", "Barcelona without the tourist traps")} and ${link("trains", "en", "twelve day trips by train")}.`,
  };
  blocks.push({ type: "paragraph", text: related[locale] });

  return blocks;
}

/* -------------------------------------------------------------------------- */
/* Publish                                                                    */
/* -------------------------------------------------------------------------- */

const HERO_ALT: Record<Locale, string> = {
  ca: "Panoràmica de Barcelona des del Park Güell, amb la Sagrada Família i el mar al fons",
  es: "Panorámica de Barcelona desde el Park Güell, con la Sagrada Família y el mar al fondo",
  en: "Barcelona seen from Park Güell, with the Sagrada Família and the sea beyond",
};

const HERO_CAPTION: Record<Locale, string> = {
  ca: "A Barcelona l'impost suma la tarifa de la Generalitat i el recàrrec de l'Ajuntament.",
  es: "En Barcelona el impuesto suma la tarifa autonómica y el recargo del Ayuntamiento.",
  en: "In Barcelona the tax is the regional rate plus the city council's surcharge.",
};

const SECOND_ALT: Record<Locale, string> = {
  ca: "Passeig del Mar i platja Gran de Tossa de Mar, amb hotels i restaurants arran de sorra",
  es: "Passeig del Mar y playa Gran de Tossa de Mar, con hoteles y restaurantes junto a la arena",
  en: "The seafront promenade and main beach at Tossa de Mar, lined with hotels and restaurants",
};

const SECOND_CAPTION: Record<Locale, string> = {
  ca: "Fora de Barcelona la tarifa és més baixa, però des de l'1 d'octubre de 2026 cada municipi pot afegir el seu recàrrec.",
  es: "Fuera de Barcelona la tarifa es más baja, pero desde el 1 de octubre de 2026 cada municipio puede añadir su recargo.",
  en: "Rates are lower outside Barcelona, but from 1 October 2026 each municipality may add its own surcharge.",
};

function imageSpecs(): ImageSpec[] {
  const specs: ImageSpec[] = [];
  const add = (
    key: string,
    alt: Record<Locale, string>,
    caption: Record<Locale, string>,
  ) => {
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

export async function publishTouristTaxGuide(): Promise<PublishResult> {
  const images = imageSpecs();
  const mediaIds = images.length > 0 ? await upsertImages(images) : new Map<string, string>();
  const secondMediaId = mediaIds.get(SECOND_KEY);

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
        body: buildBody(locale, secondMediaId),
      };
    }),
  };

  return publishArticle(spec);
}

export { EXAMPLE_DATE, MUNICIPAL_SURCHARGE_FROM, periodFor };
