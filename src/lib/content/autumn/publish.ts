import "server-only";

import type { Block } from "@/lib/content/blocks";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { publishArticle, type ArticleSpec, type PublishResult } from "@/lib/content/publish-article";
import { IMAGE_BY_KEY } from "@/lib/content/images";
import { COPY, IMAGES, SOURCES, ZONES } from "./payload";

/**
 * The autumn colour guide.
 *
 * Evergreen URLs with no year in the path: the piece is refreshed as the season
 * advances, so the same three pages accumulate the season's history instead of
 * being replaced by a new set of dated URLs every October.
 */

export const ENTRY_KEY = "autumn-colours-catalunya";

const PUBLISHED = new Date("2026-09-15T08:00:00+02:00");
const LAST_VERIFIED = new Date("2026-09-15T08:00:00+02:00");

export function buildBody(
  locale: Locale,
  mediaIds: ReadonlyMap<string, string> = new Map(),
): Block[] {
  const copy = COPY[locale];
  const blocks: Block[] = [];

  copy.intro.forEach((text, index) => {
    blocks.push({ type: "paragraph", text, ...(index === 0 ? { lead: true } : {}) });
  });

  blocks.push({
    type: "callout",
    tone: "info",
    title: copy.directAnswerTitle,
    text: copy.directAnswer,
  });

  // Published on 15 September, when it is still early almost everywhere. Stated
  // high on the page so nobody reads the timing table as a description of the
  // forests today.
  blocks.push({ type: "heading", level: 2, text: copy.statusTitle });
  for (const text of copy.status) blocks.push({ type: "paragraph", text });

  const hero = IMAGES.find((image) => image.isHero);
  const heroMediaId = hero ? mediaIds.get(hero.key) : undefined;
  if (heroMediaId) {
    blocks.push({ type: "image", mediaId: heroMediaId, size: "wide" });
  }

  blocks.push({
    type: "keyFacts",
    title: copy.keyFactsTitle,
    items: copy.keyFacts.map((fact) => ({ label: fact.label, value: fact.value })),
  });

  // Windows, never peak dates. The note under the table says which rows come
  // from a park or tourism board and which are editorial orientation.
  blocks.push({
    type: "table",
    caption: copy.tableCaption,
    headers: copy.tableHeaders,
    rows: ZONES.map((zone) => [
      zone.name[locale],
      zone.window[locale],
      zone.highlight[locale],
    ]),
    note: copy.tableNote,
  });

  blocks.push({ type: "heading", level: 2, text: copy.descentHeading });
  for (const text of copy.descent) blocks.push({ type: "paragraph", text });

  // The first zone is a table row only - the altitude band, not a destination -
  // so sections are driven by whether a heading exists.
  for (const zone of ZONES) {
    if (!zone.heading[locale]) continue;

    blocks.push({ type: "heading", level: 2, text: zone.heading[locale] });

    const note = zone.windowNote?.[locale];
    if (note) {
      blocks.push({ type: "callout", tone: "official", text: `**${note}**` });
    }

    for (const text of zone.body[locale]) blocks.push({ type: "paragraph", text });

    const mediaId = zone.imageKey ? mediaIds.get(zone.imageKey) : undefined;
    if (mediaId) blocks.push({ type: "image", mediaId, size: "wide" });
  }

  // Headings and prose, not a `steps` block: `steps` emits HowTo structured
  // data, and this is a set of alternatives keyed on when you can travel, not
  // a procedure to follow in order. Describing it as HowTo to Google would be
  // a misdescription of the page.
  blocks.push({ type: "heading", level: 2, text: copy.byDateHeading });
  for (const entry of copy.byDate) {
    blocks.push({ type: "heading", level: 3, text: entry.when });
    blocks.push({ type: "paragraph", text: entry.what });
  }

  blocks.push({ type: "heading", level: 2, text: copy.whyHeading });
  for (const text of copy.why) blocks.push({ type: "paragraph", text });

  blocks.push({ type: "heading", level: 2, text: copy.yearHeading });
  for (const text of copy.year) blocks.push({ type: "paragraph", text });

  blocks.push({ type: "heading", level: 2, text: copy.quickHeading });
  blocks.push({ type: "list", ordered: false, items: copy.quick });

  blocks.push({ type: "paragraph", text: copy.relatedLine });

  return blocks;
}

export async function publishAutumnColours(): Promise<PublishResult> {
  const images = IMAGES.flatMap((image) => {
    const file = IMAGE_BY_KEY.get(image.key);
    if (!file) return [];
    return [
      {
        key: image.key,
        url: file.url,
        width: file.width,
        height: file.height,
        blurDataUrl: file.blurDataUrl,
        credit: "CatalunyaInfo",
        license: null,
        alt: image.alt,
        caption: image.caption,
      },
    ];
  });

  const hero = IMAGES.find((image) => image.isHero);

  const spec: ArticleSpec = {
    entryKey: ENTRY_KEY,
    type: "article",
    categoryKey: "nature",
    isFeatured: true,
    heroKey: hero && IMAGE_BY_KEY.has(hero.key) ? hero.key : undefined,
    images,
    sources: SOURCES.map((source) => ({
      name: source.name.ca,
      url: source.url,
      publisher: source.publisher,
      type: "official" as const,
    })),
    publishedAt: PUBLISHED,
    lastVerifiedAt: LAST_VERIFIED,
    editions: [],
  };

  // Image blocks carry a media row id, so the rows have to exist before the
  // bodies are built.
  const { upsertImages } = await import("@/lib/content/publish-article");
  const mediaIds = await upsertImages(images);

  spec.editions = LOCALES.map((locale) => {
    const copy = COPY[locale];
    return {
      locale,
      path: copy.path,
      title: copy.title,
      excerpt: copy.excerpt,
      seoTitle: copy.seoTitle,
      seoDescription: copy.seoDescription,
      body: buildBody(locale, mediaIds),
    };
  });

  return publishArticle(spec);
}
