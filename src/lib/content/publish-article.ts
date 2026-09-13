import "server-only";

import { and, eq } from "drizzle-orm";

import { requireDb, schema } from "@/lib/db/client";
import { bodyToPlainText, type Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import type { EntryType } from "@/lib/db/schema";

/**
 * The shared publisher behind every editorial piece that ships as code.
 *
 * Each article supplies a spec; this handles the parts that are identical for
 * all of them — media rows, source records, the entry, and one translation per
 * language — so a new piece is a payload plus a block builder, not a new copy
 * of the same eighty lines of upserts.
 *
 * Idempotent throughout: everything is keyed on a stable identifier (the entry
 * key, the media URL, the source URL), so re-running updates the same rows and
 * the same URLs. That is what makes a weekly refresh possible without
 * accumulating duplicates.
 */

export interface ImageSpec {
  key: string;
  url: string;
  width: number;
  height: number;
  blurDataUrl: string;
  credit: string | null;
  license: string | null;
  alt: Partial<Record<Locale, string>>;
  caption: Partial<Record<Locale, string>>;
}

export interface SourceSpec {
  name: string;
  url: string;
  publisher?: string | null;
  type?: "official" | "primary" | "press" | "academic" | "own_reporting" | "other";
}

export interface EditionSpec {
  locale: Locale;
  /** Path after the locale prefix, no leading or trailing slash. */
  path: string;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  body: Block[];
}

export interface ArticleSpec {
  /** Stable key on `entries`. Re-running updates this entry. */
  entryKey: string;
  type: EntryType;
  /** Key in the `categories` table; skipped silently when it does not exist. */
  categoryKey?: string;
  isFeatured?: boolean;
  /** Which image, by key, becomes the lead image. */
  heroKey?: string;
  images?: ImageSpec[];
  sources?: SourceSpec[];
  publishedAt: Date;
  lastVerifiedAt: Date;
  editions: EditionSpec[];
}

export interface PublishResult {
  entryKey: string;
  entryId: string;
  media: number;
  sources: number;
  editions: { locale: Locale; path: string; blocks: number; action: "created" | "updated" }[];
  publishedAt: string;
  lastVerifiedAt: string;
}

/**
 * Resolves the media rows first and hands back key -> id, because block bodies
 * reference media by row id and therefore cannot be built until the rows exist.
 */
export async function upsertImages(images: ImageSpec[]): Promise<Map<string, string>> {
  const db = requireDb();
  const ids = new Map<string, string>();

  for (const image of images) {
    const values = {
      url: image.url,
      mimeType: "image/webp",
      width: image.width,
      height: image.height,
      blurDataUrl: image.blurDataUrl,
      credit: image.credit,
      license: image.license,
      alt: image.alt,
      caption: image.caption,
    };

    const existing = await db
      .select({ id: schema.media.id })
      .from(schema.media)
      .where(eq(schema.media.url, image.url))
      .limit(1);

    if (existing[0]) {
      await db.update(schema.media).set(values).where(eq(schema.media.id, existing[0].id));
      ids.set(image.key, existing[0].id);
    } else {
      const inserted = await db
        .insert(schema.media)
        .values(values)
        .returning({ id: schema.media.id });
      if (inserted[0]) ids.set(image.key, inserted[0].id);
    }
  }

  return ids;
}

export async function publishArticle(spec: ArticleSpec): Promise<PublishResult> {
  const db = requireDb();
  const now = new Date();

  // A publish date in the future would hide the page: every public query and
  // the sitemap require `published_at <= now()`.
  const publishedAt = spec.publishedAt > now ? now : spec.publishedAt;

  const mediaIds = await upsertImages(spec.images ?? []);
  const heroMediaId = spec.heroKey ? (mediaIds.get(spec.heroKey) ?? null) : null;

  /* ---- Sources ---------------------------------------------------------- */
  const sourceIds: string[] = [];
  for (const source of spec.sources ?? []) {
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
        type: source.type ?? "official",
      })
      .returning({ id: schema.sources.id });
    if (inserted[0]) sourceIds.push(inserted[0].id);
  }

  /* ---- Category --------------------------------------------------------- */
  let categoryId: string | null = null;
  if (spec.categoryKey) {
    const rows = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.key, spec.categoryKey))
      .limit(1);
    categoryId = rows[0]?.id ?? null;
  }

  /* ---- Entry ------------------------------------------------------------ */
  const entryRows = await db
    .select({ id: schema.entries.id })
    .from(schema.entries)
    .where(eq(schema.entries.key, spec.entryKey))
    .limit(1);

  let entryId = entryRows[0]?.id;
  const entryValues = {
    type: spec.type,
    primaryCategoryId: categoryId,
    heroMediaId,
    isFeatured: spec.isFeatured ?? false,
    isDemo: false,
  };

  if (entryId) {
    await db
      .update(schema.entries)
      .set({ ...entryValues, updatedAt: now })
      .where(eq(schema.entries.id, entryId));
  } else {
    const inserted = await db
      .insert(schema.entries)
      .values({ ...entryValues, key: spec.entryKey })
      .returning({ id: schema.entries.id });
    entryId = inserted[0]?.id;
  }
  if (!entryId) throw new Error(`could not create entry ${spec.entryKey}`);

  /* ---- Sources link ----------------------------------------------------- */
  await db.delete(schema.entrySources).where(eq(schema.entrySources.entryId, entryId));
  if (sourceIds.length > 0) {
    await db.insert(schema.entrySources).values(
      sourceIds.map((sourceId, index) => ({
        entryId,
        sourceId,
        accessedAt: spec.lastVerifiedAt,
        sortOrder: index,
      })),
    );
  }

  /* ---- Translations ----------------------------------------------------- */
  const editions: PublishResult["editions"] = [];

  for (const edition of spec.editions) {
    const slug = edition.path.split("/").filter(Boolean).at(-1) ?? edition.path;

    const values = {
      entryId,
      locale: edition.locale,
      status: "published" as const,
      title: edition.title,
      slug,
      path: edition.path,
      excerpt: edition.excerpt,
      body: edition.body as unknown[],
      searchText: bodyToPlainText(edition.body),
      seoTitle: edition.seoTitle,
      seoDescription: edition.seoDescription,
      canonicalUrl: null,
      noindex: false,
      publishedAt,
      lastVerifiedAt: spec.lastVerifiedAt,
      updatedAt: now,
    };

    const existing = await db
      .select({ id: schema.entryTranslations.id })
      .from(schema.entryTranslations)
      .where(
        and(
          eq(schema.entryTranslations.entryId, entryId),
          eq(schema.entryTranslations.locale, edition.locale),
        ),
      )
      .limit(1);

    if (existing[0]) {
      await db
        .update(schema.entryTranslations)
        .set(values)
        .where(eq(schema.entryTranslations.id, existing[0].id));
      editions.push({
        locale: edition.locale,
        path: edition.path,
        blocks: edition.body.length,
        action: "updated",
      });
    } else {
      await db.insert(schema.entryTranslations).values(values);
      editions.push({
        locale: edition.locale,
        path: edition.path,
        blocks: edition.body.length,
        action: "created",
      });
    }
  }

  return {
    entryKey: spec.entryKey,
    entryId,
    media: mediaIds.size,
    sources: sourceIds.length,
    editions,
    publishedAt: publishedAt.toISOString(),
    lastVerifiedAt: spec.lastVerifiedAt.toISOString(),
  };
}
