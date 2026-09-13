import "server-only";

import type { Block } from "@/lib/content/blocks";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { publishArticle, type ArticleSpec, type PublishResult } from "@/lib/content/publish-article";
import { IMAGE_BY_KEY } from "@/lib/content/images";
import { COPY, HERO, LEVEL_LABEL, SOURCES, ZONES } from "./payload";

/**
 * The weekly mycological report.
 *
 * Evergreen URLs: this same entry is refreshed each week during the season with
 * new rainfall figures and a new ranking, so the page accumulates history
 * rather than scattering it across dated URLs.
 */

export const ENTRY_KEY = "mushroom-conditions-catalunya";

const PUBLISHED = new Date("2026-09-13T17:30:00+02:00");
const LAST_VERIFIED = new Date("2026-09-13T12:00:00+02:00");

export function buildBody(locale: Locale, heroMediaId?: string): Block[] {
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

  blocks.push({
    type: "keyFacts",
    title: copy.keyFactsTitle,
    items: copy.keyFacts.map((f) => ({ label: f.label, value: f.value })),
  });

  // The condition ranking. A table rather than a bespoke component: it stacks
  // into cards on a phone, reads correctly in a screen reader, and is the same
  // structure in all three languages.
  blocks.push({
    type: "table",
    caption: copy.tableCaption,
    headers: copy.tableHeaders,
    rows: ZONES.map((zone) => [
      zone.name[locale],
      LEVEL_LABEL[zone.level][locale],
      zone.figure[locale],
      zone.reading[locale],
    ]),
  });

  // Stated immediately under the ranking, where someone might otherwise read a
  // rating as an observation of mushrooms.
  blocks.push({
    type: "callout",
    tone: "warning",
    title: copy.ratingDisclaimerTitle,
    text: copy.ratingDisclaimer,
  });

  if (heroMediaId) {
    blocks.push({ type: "image", mediaId: heroMediaId, size: "wide" });
  }

  blocks.push({ type: "heading", level: 2, text: copy.lateHeading });
  for (const text of copy.late) blocks.push({ type: "paragraph", text });

  for (const zone of ZONES) {
    blocks.push({ type: "heading", level: 2, text: zone.heading[locale] });
    blocks.push({
      type: "paragraph",
      text: `**${LEVEL_LABEL[zone.level][locale]}.**`,
    });
    for (const text of zone.body[locale]) blocks.push({ type: "paragraph", text });
  }

  blocks.push({ type: "heading", level: 2, text: copy.whyHeading });
  for (const text of copy.why) blocks.push({ type: "paragraph", text });
  blocks.push({ type: "list", ordered: false, items: copy.whyList });

  blocks.push({ type: "heading", level: 2, text: copy.noSpotsHeading });
  for (const text of copy.noSpots) blocks.push({ type: "paragraph", text });

  blocks.push({ type: "heading", level: 2, text: copy.safetyHeading });
  for (const text of copy.safety) blocks.push({ type: "paragraph", text });
  blocks.push({
    type: "callout",
    tone: "warning",
    title: copy.safetyCalloutTitle,
    text: copy.safetyCallout,
  });

  blocks.push({ type: "heading", level: 2, text: copy.summaryHeading });
  for (const text of copy.summary) blocks.push({ type: "paragraph", text });

  return blocks;
}

export async function publishMushroomReport(): Promise<PublishResult> {
  const file = IMAGE_BY_KEY.get(HERO.key);

  const spec: ArticleSpec = {
    entryKey: ENTRY_KEY,
    // `article`, not `event`: a weekly condition report, with Article schema.
    type: "article",
    categoryKey: "nature",
    isFeatured: true,
    heroKey: file ? HERO.key : undefined,
    images: file
      ? [
          {
            key: HERO.key,
            url: file.url,
            width: file.width,
            height: file.height,
            blurDataUrl: file.blurDataUrl,
            credit: "CatalunyaInfo",
            license: null,
            alt: HERO.alt,
            caption: HERO.caption,
          },
        ]
      : [],
    sources: SOURCES.map((s) => ({
      name: s.name.ca,
      url: s.url,
      publisher: s.publisher,
      type: "type" in s ? s.type : "official",
    })),
    publishedAt: PUBLISHED,
    lastVerifiedAt: LAST_VERIFIED,
    editions: [],
  };

  // Media rows must exist before the bodies, because image blocks carry a row
  // id. `publishArticle` upserts them, so resolve them first here.
  const { upsertImages } = await import("@/lib/content/publish-article");
  const mediaIds = await upsertImages(spec.images ?? []);
  const heroMediaId = mediaIds.get(HERO.key);

  spec.editions = LOCALES.map((locale) => {
    const copy = COPY[locale];
    return {
      locale,
      path: copy.path,
      title: copy.title,
      excerpt: copy.excerpt,
      seoTitle: copy.seoTitle,
      seoDescription: copy.seoDescription,
      body: buildBody(locale, heroMediaId),
    };
  });

  return publishArticle(spec);
}
