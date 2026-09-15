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
