import "server-only";

import { and, eq } from "drizzle-orm";

import { requireDb, schema } from "@/lib/db/client";
import { bodyToPlainText, type Block } from "@/lib/content/blocks";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import {
  COPY,
  IMAGE_CREDIT,
  IMAGE_LICENCE,
  IMAGE_META,
  PLANS,
  SOURCES,
} from "./payload";
import { IMAGE_BY_KEY } from "@/lib/content/images";

/**
 * Publishes the weekend guide in all three languages.
 *
 * Idempotent by design: it upserts one `entries` row keyed
 * `weekend-guide-catalunya` and one `entry_translations` row per locale, so
 * running it again updates the same three evergreen URLs rather than creating
 * new ones. Next week's edition is another run of this function with a new
 * payload.
 *
 * Lives here rather than in `scripts/` because it is called from two places:
 * the CLI wrapper, and the bootstrap route that runs inside a deployment where
 * the database credentials actually exist.
 */

export const ENTRY_KEY = "weekend-guide-catalunya";

/**
 * The page is dated for the weekend it covers, but never in the future: a
 * translation whose `published_at` has not yet passed is filtered out of every
 * public query and out of the sitemap, so a future date would make the page
 * invisible rather than scheduled.
 */
const INTENDED_PUBLISH = new Date("2026-09-14T07:00:00+02:00");
const LAST_VERIFIED = new Date("2026-09-13T00:00:00+02:00");

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * @param mediaIds key -> media row id. Images whose key is absent are simply
 * not rendered, so the body still builds before the media rows exist (and in
 * tests, which have no database).
 */
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

  blocks.push({
    type: "keyFacts",
    title: copy.keyFactsTitle,
    items: copy.keyFacts.map((f) => ({ label: f.label, value: f.value })),
  });

  blocks.push({
    type: "table",
    caption: copy.tableCaption,
    headers: copy.tableHeaders,
    rows: PLANS.map((plan) => [
      plan.title[locale],
      plan.row.municipality,
      plan.row.dates[locale],
      plan.row.category[locale],
      plan.row.price[locale],
    ]),
    note: copy.tableNote,
  });

  blocks.push({ type: "heading", level: 2, text: copy.plansHeading });

  PLANS.forEach((plan, index) => {
    blocks.push({ type: "heading", level: 3, text: `${index + 1}. ${plan.title[locale]}` });
    for (const paragraph of plan.body[locale]) {
      blocks.push({ type: "paragraph", text: paragraph });
    }

    const image = IMAGE_META.find((m) => m.planIndex === index);
    const mediaId = image ? mediaIds.get(image.key) : undefined;
    if (image && mediaId) {
      blocks.push({ type: "image", mediaId, size: "wide" });
    }

    if (plan.url) {
      blocks.push({
        type: "paragraph",
        text: `${copy.officialLinkLabel}: [${hostOf(plan.url)}](${plan.url})`,
      });
    }
  });

  blocks.push({ type: "heading", level: 2, text: copy.closingHeading });
  for (const paragraph of copy.closing) {
    blocks.push({ type: "paragraph", text: paragraph });
  }

  blocks.push({
    type: "callout",
    tone: "warning",
    title: copy.warningTitle,
    text: copy.warning,
  });

  return blocks;
}

export interface PublishSummary {
  entryId: string;
  sources: number;
  media: number;
  editions: { locale: Locale; path: string; blocks: number; action: "created" | "updated" }[];
  publishedAt: string;
  lastVerifiedAt: string;
}

export async function publishWeekendGuide(): Promise<PublishSummary> {
  const db = requireDb();
  const now = new Date();
  const publishedAt = INTENDED_PUBLISH > now ? now : INTENDED_PUBLISH;

  // ---- Sources ------------------------------------------------------------
  const sourceIds: string[] = [];
  for (const source of SOURCES) {
    const existing = await db
      .select({ id: schema.sources.id })
      .from(schema.sources)
      .where(eq(schema.sources.url, source.url))
      .limit(1);

    if (existing[0]) {
      sourceIds.push(existing[0].id);
      continue;
    }
    const inserted = await db
      .insert(schema.sources)
      .values({
        name: source.name,
        url: source.url,
        publisher: source.publisher ?? null,
        type: "official",
      })
      .returning({ id: schema.sources.id });
    if (inserted[0]) sourceIds.push(inserted[0].id);
  }

  // ---- Media --------------------------------------------------------------
  // Upserted by URL: the manifest is regenerated from `incoming/`, so the URL
  // is the stable identity, not a row id.
  const mediaIds = new Map<string, string>();
  for (const meta of IMAGE_META) {
    const file = IMAGE_BY_KEY.get(meta.key);
    if (!file) continue;

    const values = {
      url: file.url,
      mimeType: "image/webp",
      width: file.width,
      height: file.height,
      blurDataUrl: file.blurDataUrl,
      credit: IMAGE_CREDIT,
      license: IMAGE_LICENCE,
      alt: meta.alt,
      caption: meta.caption,
    };

    const existing = await db
      .select({ id: schema.media.id })
      .from(schema.media)
      .where(eq(schema.media.url, file.url))
      .limit(1);

    if (existing[0]) {
      await db.update(schema.media).set(values).where(eq(schema.media.id, existing[0].id));
      mediaIds.set(meta.key, existing[0].id);
    } else {
      const inserted = await db
        .insert(schema.media)
        .values(values)
        .returning({ id: schema.media.id });
      if (inserted[0]) mediaIds.set(meta.key, inserted[0].id);
    }
  }

  const heroKey = IMAGE_META.find((m) => m.isHero)?.key;
  const heroMediaId = heroKey ? (mediaIds.get(heroKey) ?? null) : null;

  // ---- Category -----------------------------------------------------------
  const categoryRows = await db
    .select({ id: schema.categories.id })
    .from(schema.categories)
    .where(eq(schema.categories.key, "festivals"))
    .limit(1);
  const categoryId = categoryRows[0]?.id ?? null;

  // ---- Entry --------------------------------------------------------------
  const entryRows = await db
    .select({ id: schema.entries.id })
    .from(schema.entries)
    .where(eq(schema.entries.key, ENTRY_KEY))
    .limit(1);

  let entryId = entryRows[0]?.id;
  if (entryId) {
    await db
      .update(schema.entries)
      .set({ primaryCategoryId: categoryId, heroMediaId, isFeatured: true, updatedAt: now })
      .where(eq(schema.entries.id, entryId));
  } else {
    const inserted = await db
      .insert(schema.entries)
      .values({
        // `article`, not `event`: the page covers 25 separate events, so a
        // single Event node would misdescribe the page.
        type: "article",
        key: ENTRY_KEY,
        primaryCategoryId: categoryId,
        heroMediaId,
        isFeatured: true,
        isDemo: false,
      })
      .returning({ id: schema.entries.id });
    entryId = inserted[0]?.id;
  }
  if (!entryId) throw new Error("could not create the entry");

  // ---- Sources link -------------------------------------------------------
  await db.delete(schema.entrySources).where(eq(schema.entrySources.entryId, entryId));
  if (sourceIds.length > 0) {
    await db.insert(schema.entrySources).values(
      sourceIds.map((sourceId, index) => ({
        entryId,
        sourceId,
        accessedAt: LAST_VERIFIED,
        sortOrder: index,
      })),
    );
  }

  // ---- Translations -------------------------------------------------------
  const editions: PublishSummary["editions"] = [];

  for (const locale of LOCALES) {
    const copy = COPY[locale];
    const body = buildBody(locale, mediaIds);
    const slug = copy.path.split("/").filter(Boolean).at(-1) ?? copy.path;

    const values = {
      entryId,
      locale,
      status: "published" as const,
      title: copy.title,
      slug,
      path: copy.path,
      excerpt: copy.excerpt,
      body: body as unknown[],
      searchText: bodyToPlainText(body),
      seoTitle: copy.seoTitle,
      seoDescription: copy.seoDescription,
      canonicalUrl: null,
      noindex: false,
      publishedAt,
      lastVerifiedAt: LAST_VERIFIED,
      updatedAt: publishedAt,
    };

    const existing = await db
      .select({ id: schema.entryTranslations.id })
      .from(schema.entryTranslations)
      .where(
        and(
          eq(schema.entryTranslations.entryId, entryId),
          eq(schema.entryTranslations.locale, locale),
        ),
      )
      .limit(1);

    if (existing[0]) {
      await db
        .update(schema.entryTranslations)
        .set(values)
        .where(eq(schema.entryTranslations.id, existing[0].id));
      editions.push({ locale, path: copy.path, blocks: body.length, action: "updated" });
    } else {
      await db.insert(schema.entryTranslations).values(values);
      editions.push({ locale, path: copy.path, blocks: body.length, action: "created" });
    }
  }

  return {
    entryId,
    sources: sourceIds.length,
    media: mediaIds.size,
    editions,
    publishedAt: publishedAt.toISOString(),
    lastVerifiedAt: LAST_VERIFIED.toISOString(),
  };
}
