import { z } from "zod";

/**
 * The body of every entry is an ordered array of typed blocks, not a blob of
 * HTML.
 *
 * Why: structured blocks are what let us (a) render server-side with zero
 * `dangerouslySetInnerHTML`, so stored content can never inject script;
 * (b) emit precise structured data (FAQ, HowTo, tables, opening hours);
 * (c) reshape the same content for different viewports without reflowing
 * arbitrary markup; and (d) validate content quality automatically.
 *
 * Inline formatting inside text fields uses a deliberately tiny markdown
 * subset parsed in `inline.ts` into React nodes: **bold**, _italic_,
 * `code` and [label](https://url). Nothing else is accepted.
 */

const inlineText = z.string().max(5000);

export const headingBlock = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  text: z.string().min(1).max(300),
  /** Stable anchor id. Generated from `text` when omitted. */
  id: z.string().max(120).optional(),
});

export const paragraphBlock = z.object({
  type: z.literal("paragraph"),
  text: inlineText,
  lead: z.boolean().optional(),
});

export const listBlock = z.object({
  type: z.literal("list"),
  ordered: z.boolean().default(false),
  items: z.array(inlineText).min(1).max(100),
});

export const quoteBlock = z.object({
  type: z.literal("quote"),
  text: inlineText,
  cite: z.string().max(240).optional(),
  citeUrl: z.string().url().optional(),
});

export const imageBlock = z.object({
  type: z.literal("image"),
  mediaId: z.string().uuid(),
  size: z.enum(["inline", "wide", "full"]).default("wide"),
  captionOverride: z.string().max(500).optional(),
});

export const galleryBlock = z.object({
  type: z.literal("gallery"),
  mediaIds: z.array(z.string().uuid()).min(2).max(24),
  layout: z.enum(["grid", "carousel"]).default("grid"),
});

export const tableBlock = z.object({
  type: z.literal("table"),
  caption: z.string().max(300).optional(),
  headers: z.array(z.string().max(200)).min(1).max(12),
  rows: z.array(z.array(inlineText).max(12)).max(300),
  /** Free-text note under the table, typically the source and date. */
  note: z.string().max(400).optional(),
  /** Column index to keep pinned when the table scrolls horizontally. */
  stickyColumn: z.number().int().min(0).max(11).optional(),
});

/**
 * The single most valuable block on a practical guide: the answer, above the
 * fold, attributable to a source. Also feeds structured data.
 */
export const keyFactsBlock = z.object({
  type: z.literal("keyFacts"),
  title: z.string().max(200).optional(),
  items: z
    .array(
      z.object({
        label: z.string().min(1).max(120),
        value: inlineText,
        sourceId: z.string().uuid().optional(),
      }),
    )
    .min(1)
    .max(20),
});

export const calloutBlock = z.object({
  type: z.literal("callout"),
  tone: z.enum(["info", "tip", "warning", "official"]).default("info"),
  title: z.string().max(200).optional(),
  text: inlineText,
});

export const stepsBlock = z.object({
  type: z.literal("steps"),
  title: z.string().max(200).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        text: inlineText.optional(),
        mediaId: z.string().uuid().optional(),
      }),
    )
    .min(2)
    .max(30),
});

export const faqBlock = z.object({
  type: z.literal("faq"),
  title: z.string().max(200).optional(),
  items: z
    .array(
      z.object({
        question: z.string().min(1).max(300),
        answer: inlineText,
      }),
    )
    .min(1)
    .max(30),
});

export const mapBlock = z.object({
  type: z.literal("map"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  zoom: z.number().int().min(1).max(19).default(13),
  /**
   * Additional labelled points, for a destination hub covering several
   * villages. Coordinates come from the editorial package and are never
   * inferred; a wrong coordinate sends someone to the wrong valley.
   */
  points: z
    .array(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        label: z.string().min(1).max(120),
        href: z.string().max(600).optional(),
      }),
    )
    .max(40)
    .optional(),
  title: z.string().max(200).optional(),
  markers: z
    .array(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        label: z.string().max(160),
      }),
    )
    .max(50)
    .default([]),
});

/** Allowlisted embed providers only. Anything else is rejected at save time. */
export const EMBED_PROVIDERS = ["youtube", "vimeo", "openstreetmap", "spotify"] as const;

export const embedBlock = z.object({
  type: z.literal("embed"),
  provider: z.enum(EMBED_PROVIDERS),
  /** Provider-specific id, never a raw URL, so nothing arbitrary is framed. */
  embedId: z.string().min(1).max(200),
  title: z.string().min(1).max(240),
  aspectRatio: z.enum(["16:9", "4:3", "1:1"]).default("16:9"),
});

export const relatedLinksBlock = z.object({
  type: z.literal("relatedLinks"),
  title: z.string().max(200).optional(),
  entryIds: z.array(z.string().uuid()).min(1).max(12),
});

export const dividerBlock = z.object({ type: z.literal("divider") });

/** Placeholder rendered where an ad unit may live later. Renders nothing. */
export const adSlotBlock = z.object({
  type: z.literal("adSlot"),
  placement: z.enum(["in-article-1", "in-article-2"]),
});

/**
 * The contact form.
 *
 * A block rather than a bespoke route so the contact page stays an ordinary
 * `page` entry an editor can reword in the CMS. It carries no configuration
 * that could change where a message is delivered - the destination lives in
 * server code - so an editor can place the form, never redirect it.
 */
export const contactFormBlock = z.object({
  type: z.literal("contactForm"),
});

/**
 * A calculator.
 *
 * Deliberately NOT an expression language. A payload that can carry arbitrary
 * formulas is a payload that can carry arbitrary code, and the CMS stores
 * untrusted JSON. The model here is fixed and small, and it still covers every
 * calculator on the roadmap:
 *
 *   result = sum of terms;  term = product of factors
 *
 * A factor is either a constant, the value of an input, or the amount attached
 * to the selected option of a dropdown. An input factor may be clamped, which
 * is what makes a capped charge expressible — the Catalan tourist tax applies
 * to a maximum of seven nights, so `{ input: "nights", max: 7 }`.
 *
 * Every rate comes from the editorial package, sourced and dated. Nothing is
 * computed from figures this repository invented.
 */
export const calculatorFactor = z.union([
  z.object({ value: z.number() }),
  z.object({
    input: z.string().min(1).max(40),
    /** Clamp before multiplying, for capped charges. */
    max: z.number().optional(),
    min: z.number().optional(),
  }),
  /** The `amount` on the currently selected option of a select input. */
  z.object({ optionAmount: z.string().min(1).max(40) }),
]);

export const calculatorBlock = z.object({
  type: z.literal("calculator"),
  title: z.string().max(200),
  intro: inlineText.optional(),
  inputs: z
    .array(
      z.union([
        z.object({
          kind: z.literal("number"),
          id: z.string().min(1).max(40),
          label: z.string().min(1).max(120),
          min: z.number().default(0),
          max: z.number().default(999),
          step: z.number().default(1),
          value: z.number().default(1),
          suffix: z.string().max(20).optional(),
        }),
        z.object({
          kind: z.literal("select"),
          id: z.string().min(1).max(40),
          label: z.string().min(1).max(120),
          options: z
            .array(
              z.object({
                value: z.string().min(1).max(60),
                label: z.string().min(1).max(160),
                /** Rate carried by this option, in the output's unit. */
                amount: z.number().default(0),
              }),
            )
            .min(1)
            .max(30),
        }),
      ]),
    )
    .min(1)
    .max(8),
  outputs: z
    .array(
      z.object({
        label: z.string().min(1).max(160),
        terms: z.array(z.object({ factors: z.array(calculatorFactor).min(1).max(6) })).min(1).max(8),
        unit: z.string().max(12).default("€"),
        decimals: z.number().int().min(0).max(2).default(2),
        emphasis: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(6),
  /** Where the rates come from. Required: a calculator without a source is a guess. */
  note: z.string().min(1).max(400),
});

/**
 * A list of dated entries the reader can add to their own calendar.
 *
 * Generates an .ics file in the browser from the dates in the payload. It
 * invents nothing: if a date is not in the package, it is not in the file.
 */
export const calendarBlock = z.object({
  type: z.literal("calendar"),
  title: z.string().max(200),
  intro: inlineText.optional(),
  /** Shown on the download button. */
  downloadLabel: z.string().max(80).default("Add to calendar"),
  filename: z.string().max(60).default("catalunyainfo"),
  events: z
    .array(
      z.object({
        /** ISO date, `YYYY-MM-DD`. All-day events only. */
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        /** Optional inclusive end date, for multi-day entries. */
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        title: z.string().min(1).max(200),
        note: z.string().max(300).optional(),
        /** Free text: "estatal", "Catalunya", a municipality. */
        scope: z.string().max(80).optional(),
      }),
    )
    .min(1)
    .max(120),
  note: z.string().max(400).optional(),
});

/**
 * The tourist tax calculator.
 *
 * Configuration-free on purpose, like `contactForm`. Rates live in
 * `src/lib/content/tourist-tax/rates.ts`, under review and version control,
 * so nobody can change a tax figure through the editing interface.
 */
export const touristTaxBlock = z.object({
  type: z.literal("touristTax"),
});

export const blockSchema = z.discriminatedUnion("type", [
  headingBlock,
  paragraphBlock,
  listBlock,
  quoteBlock,
  imageBlock,
  galleryBlock,
  tableBlock,
  keyFactsBlock,
  calloutBlock,
  stepsBlock,
  faqBlock,
  mapBlock,
  embedBlock,
  relatedLinksBlock,
  dividerBlock,
  adSlotBlock,
  contactFormBlock,
  calculatorBlock,
  calendarBlock,
  touristTaxBlock,
]);

export const bodySchema = z.array(blockSchema).max(500);

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];
export type Body = Block[];

/** Parse untrusted JSON from the database, dropping anything malformed. */
export function parseBody(raw: unknown): Body {
  if (!Array.isArray(raw)) return [];
  const out: Body = [];
  for (const item of raw) {
    const parsed = blockSchema.safeParse(item);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

/** Deterministic anchor id for a heading. */
export function headingId(block: z.infer<typeof headingBlock>): string {
  if (block.id) return block.id;
  return slugifyAnchor(block.text);
}

export function slugifyAnchor(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Plain-text projection used for full-text search, reading time and the
 * automatic quality checks. Stored in `entry_translations.search_text`.
 */
export function bodyToPlainText(body: Body): string {
  const parts: string[] = [];
  const strip = (s: string) =>
    s
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`]/g, "")
      .trim();

  for (const block of body) {
    switch (block.type) {
      case "heading":
        parts.push(block.text);
        break;
      case "paragraph":
        parts.push(strip(block.text));
        break;
      case "list":
        parts.push(...block.items.map(strip));
        break;
      case "quote":
        parts.push(strip(block.text));
        if (block.cite) parts.push(block.cite);
        break;
      case "table":
        if (block.caption) parts.push(block.caption);
        parts.push(...block.headers);
        for (const row of block.rows) parts.push(...row.map(strip));
        break;
      case "touristTax":
        // No prose of its own; the article around it carries the wording.
        break;
      case "calculator":
        parts.push(block.title);
        if (block.intro) parts.push(strip(block.intro));
        for (const input of block.inputs) parts.push(input.label);
        for (const output of block.outputs) parts.push(output.label);
        parts.push(strip(block.note));
        break;
      case "calendar":
        parts.push(block.title);
        if (block.intro) parts.push(strip(block.intro));
        for (const event of block.events) {
          parts.push(event.title);
          if (event.scope) parts.push(event.scope);
          if (event.note) parts.push(event.note);
        }
        if (block.note) parts.push(strip(block.note));
        break;
      case "keyFacts":
        if (block.title) parts.push(block.title);
        for (const item of block.items) parts.push(item.label, strip(item.value));
        break;
      case "callout":
        if (block.title) parts.push(block.title);
        parts.push(strip(block.text));
        break;
      case "steps":
        if (block.title) parts.push(block.title);
        for (const item of block.items) {
          parts.push(item.title);
          if (item.text) parts.push(strip(item.text));
        }
        break;
      case "faq":
        if (block.title) parts.push(block.title);
        for (const item of block.items) parts.push(item.question, strip(item.answer));
        break;
      case "map":
      case "embed":
        if (block.title) parts.push(block.title);
        break;
      default:
        break;
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function wordCount(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/** Average adult reading speed, rounded up, minimum one minute. */
export function readingMinutes(text: string): number {
  return Math.max(1, Math.round(wordCount(text) / 220));
}

/** Headings suitable for an "on this page" table of contents. */
export function tableOfContents(body: Body): { id: string; text: string; level: 2 | 3 }[] {
  const out: { id: string; text: string; level: 2 | 3 }[] = [];
  for (const block of body) {
    if (block.type !== "heading") continue;
    if (block.level !== 2 && block.level !== 3) continue;
    out.push({ id: headingId(block), text: block.text, level: block.level });
  }
  return out;
}
