import type { BlockType } from "@/lib/content/blocks";

/**
 * Field specifications for the block editor.
 *
 * One declarative table drives the whole editing UI, so adding a block type is
 * a change in two places (the Zod schema and this table) rather than a new
 * bespoke form. It also guarantees the editor can never offer a field the
 * schema will reject.
 */

export type FieldKind =
  | "text"
  | "richText"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "stringList"
  | "objectList"
  | "table"
  | "media"
  | "mediaList"
  | "entryList"
  | "sourceRef";

export interface FieldSpec {
  key: string;
  label: string;
  kind: FieldKind;
  help?: string;
  options?: { value: string; label: string }[];
  /** For objectList: the shape of each item. */
  itemFields?: FieldSpec[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

export interface BlockSpec {
  type: BlockType;
  label: string;
  description: string;
  fields: FieldSpec[];
  /** Sensible starting value when the block is inserted. */
  initial: Record<string, unknown>;
}

const RICH_TEXT_HELP = "**bold**, _italic_, `code`, [label](https://url)";

export const BLOCK_SPECS: BlockSpec[] = [
  {
    type: "paragraph",
    label: "Paragraph",
    description: "Body text.",
    fields: [
      { key: "text", label: "Text", kind: "richText", help: RICH_TEXT_HELP, required: true },
      { key: "lead", label: "Standfirst", kind: "boolean", help: "Larger opening paragraph." },
    ],
    initial: { type: "paragraph", text: "" },
  },
  {
    type: "heading",
    label: "Heading",
    description: "Section heading. Becomes an anchor and appears in the contents list.",
    fields: [
      {
        key: "level",
        label: "Level",
        kind: "select",
        options: [
          { value: "2", label: "H2" },
          { value: "3", label: "H3" },
          { value: "4", label: "H4" },
        ],
      },
      { key: "text", label: "Text", kind: "text", required: true },
      { key: "id", label: "Anchor", kind: "text", help: "Leave empty to generate from the text." },
    ],
    initial: { type: "heading", level: 2, text: "" },
  },
  {
    type: "keyFacts",
    label: "Key facts",
    description:
      "The answer, above the fold. Each row can cite one of the entry's sources.",
    fields: [
      { key: "title", label: "Title", kind: "text" },
      {
        key: "items",
        label: "Facts",
        kind: "objectList",
        itemFields: [
          { key: "label", label: "Label", kind: "text", required: true },
          { key: "value", label: "Value", kind: "richText", required: true },
          { key: "sourceId", label: "Source", kind: "sourceRef" },
        ],
      },
    ],
    initial: { type: "keyFacts", items: [{ label: "", value: "" }] },
  },
  {
    type: "list",
    label: "List",
    description: "Bulleted or numbered list.",
    fields: [
      { key: "ordered", label: "Numbered", kind: "boolean" },
      { key: "items", label: "Items", kind: "stringList" },
    ],
    initial: { type: "list", ordered: false, items: [""] },
  },
  {
    type: "table",
    label: "Table",
    description: "Timetables, prices, comparisons. Scrolls horizontally on a phone.",
    fields: [
      { key: "caption", label: "Caption", kind: "text" },
      { key: "headers", label: "Columns", kind: "stringList" },
      { key: "rows", label: "Rows", kind: "table" },
      { key: "note", label: "Note", kind: "richText", help: "Typically the source and its date." },
    ],
    initial: { type: "table", headers: ["", ""], rows: [["", ""]] },
  },
  {
    type: "steps",
    label: "Steps",
    description: "An ordered procedure. Emits HowTo structured data.",
    fields: [
      { key: "title", label: "Title", kind: "text" },
      {
        key: "items",
        label: "Steps",
        kind: "objectList",
        itemFields: [
          { key: "title", label: "Step", kind: "text", required: true },
          { key: "text", label: "Detail", kind: "richText" },
          { key: "mediaId", label: "Image", kind: "media" },
        ],
      },
    ],
    initial: { type: "steps", items: [{ title: "" }, { title: "" }] },
  },
  {
    type: "faq",
    label: "Questions and answers",
    description: "Emits FAQPage structured data. Use real questions, not padding.",
    fields: [
      { key: "title", label: "Title", kind: "text" },
      {
        key: "items",
        label: "Questions",
        kind: "objectList",
        itemFields: [
          { key: "question", label: "Question", kind: "text", required: true },
          { key: "answer", label: "Answer", kind: "richText", required: true },
        ],
      },
    ],
    initial: { type: "faq", items: [{ question: "", answer: "" }] },
  },
  {
    type: "callout",
    label: "Callout",
    description: "A warning, a tip, or a pointer to the official source.",
    fields: [
      {
        key: "tone",
        label: "Tone",
        kind: "select",
        options: [
          { value: "info", label: "Information" },
          { value: "tip", label: "Tip" },
          { value: "warning", label: "Warning" },
          { value: "official", label: "Official source" },
        ],
      },
      { key: "title", label: "Title", kind: "text" },
      { key: "text", label: "Text", kind: "richText", required: true },
    ],
    initial: { type: "callout", tone: "info", text: "" },
  },
  {
    type: "image",
    label: "Image",
    description: "One image from the library, with its credit.",
    fields: [
      { key: "mediaId", label: "Image", kind: "media", required: true },
      {
        key: "size",
        label: "Width",
        kind: "select",
        options: [
          { value: "inline", label: "Text column" },
          { value: "wide", label: "Wide" },
          { value: "full", label: "Full bleed" },
        ],
      },
      { key: "captionOverride", label: "Caption override", kind: "text" },
    ],
    initial: { type: "image", mediaId: "", size: "wide" },
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "Between 2 and 24 images.",
    fields: [
      { key: "mediaIds", label: "Images", kind: "mediaList" },
      {
        key: "layout",
        label: "Layout",
        kind: "select",
        options: [
          { value: "grid", label: "Grid" },
          { value: "carousel", label: "Carousel" },
        ],
      },
    ],
    initial: { type: "gallery", mediaIds: [], layout: "grid" },
  },
  {
    type: "map",
    label: "Map",
    description:
      "Coordinates shown immediately; the map frame loads only when the reader opens it.",
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "latitude", label: "Latitude", kind: "number", step: 0.00001, required: true },
      { key: "longitude", label: "Longitude", kind: "number", step: 0.00001, required: true },
      { key: "zoom", label: "Zoom", kind: "number", min: 1, max: 19 },
      {
        key: "markers",
        label: "Extra markers",
        kind: "objectList",
        itemFields: [
          { key: "label", label: "Label", kind: "text", required: true },
          { key: "latitude", label: "Latitude", kind: "number", step: 0.00001 },
          { key: "longitude", label: "Longitude", kind: "number", step: 0.00001 },
        ],
      },
    ],
    initial: { type: "map", latitude: 41.5934, longitude: 1.5209, zoom: 13, markers: [] },
  },
  {
    type: "quote",
    label: "Quote",
    description: "A quotation with its attribution.",
    fields: [
      { key: "text", label: "Quote", kind: "richText", required: true },
      { key: "cite", label: "Attribution", kind: "text" },
      { key: "citeUrl", label: "Link", kind: "text" },
    ],
    initial: { type: "quote", text: "" },
  },
  {
    type: "embed",
    label: "Embed",
    description: "Allowlisted providers only. Paste the id, not the full URL.",
    fields: [
      {
        key: "provider",
        label: "Provider",
        kind: "select",
        options: [
          { value: "youtube", label: "YouTube (no-cookie)" },
          { value: "vimeo", label: "Vimeo" },
          { value: "openstreetmap", label: "OpenStreetMap" },
          { value: "spotify", label: "Spotify" },
        ],
      },
      { key: "embedId", label: "Id", kind: "text", required: true },
      { key: "title", label: "Accessible title", kind: "text", required: true },
      {
        key: "aspectRatio",
        label: "Aspect ratio",
        kind: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "4:3", label: "4:3" },
          { value: "1:1", label: "1:1" },
        ],
      },
    ],
    initial: { type: "embed", provider: "youtube", embedId: "", title: "", aspectRatio: "16:9" },
  },
  {
    type: "relatedLinks",
    label: "Related links",
    description: "Internal links to other entries.",
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "entryIds", label: "Entries", kind: "entryList" },
    ],
    initial: { type: "relatedLinks", entryIds: [] },
  },
  {
    type: "divider",
    label: "Divider",
    description: "A horizontal rule.",
    fields: [],
    initial: { type: "divider" },
  },
  {
    type: "adSlot",
    label: "Ad placeholder",
    description:
      "Reserves a position for a future ad unit. Renders nothing: no ad code exists in this build.",
    fields: [
      {
        key: "placement",
        label: "Placement",
        kind: "select",
        options: [
          { value: "in-article-1", label: "In article 1" },
          { value: "in-article-2", label: "In article 2" },
        ],
      },
    ],
    initial: { type: "adSlot", placement: "in-article-1" },
  },
];

export const BLOCK_SPEC_BY_TYPE = new Map(BLOCK_SPECS.map((s) => [s.type, s]));
