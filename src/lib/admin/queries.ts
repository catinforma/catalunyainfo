import "server-only";

import { and, asc, desc, eq, isNotNull, lte, sql } from "drizzle-orm";

import { getDb, schema } from "@/lib/db/client";
import type { EntryStatus, EntryType } from "@/lib/db/schema";
import { LOCALES, type Locale } from "@/lib/i18n/config";

const {
  authors,
  contactMessages,
  categories,
  categoryTranslations,
  entries,
  entryTranslations,
  media,
  redirects,
  sources,
  tags,
  tagTranslations,
} = schema;

export interface AdminEntryRow {
  translationId: string;
  entryId: string;
  type: EntryType;
  locale: Locale;
  status: EntryStatus;
  title: string;
  path: string;
  updatedAt: Date;
  publishedAt: Date | null;
  scheduledFor: Date | null;
  lastVerifiedAt: Date | null;
  reviewDueAt: Date | null;
  isDemo: boolean;
  authorName: string | null;
}

export async function listAdminEntries(options: {
  status?: EntryStatus;
  locale?: Locale;
  type?: EntryType;
  limit?: number;
} = {}): Promise<AdminEntryRow[]> {
  const db = getDb();
  if (!db) return [];

  const conditions = [];
  if (options.status) conditions.push(eq(entryTranslations.status, options.status));
  if (options.locale) conditions.push(eq(entryTranslations.locale, options.locale));
  if (options.type) conditions.push(eq(entries.type, options.type));

  const rows = await db
    .select({
      translationId: entryTranslations.id,
      entryId: entries.id,
      type: entries.type,
      locale: entryTranslations.locale,
      status: entryTranslations.status,
      title: entryTranslations.title,
      path: entryTranslations.path,
      updatedAt: entryTranslations.updatedAt,
      publishedAt: entryTranslations.publishedAt,
      scheduledFor: entryTranslations.scheduledFor,
      lastVerifiedAt: entryTranslations.lastVerifiedAt,
      reviewDueAt: entryTranslations.reviewDueAt,
      isDemo: entries.isDemo,
      authorName: authors.name,
    })
    .from(entryTranslations)
    .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
    .leftJoin(authors, eq(authors.id, entries.authorId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(entryTranslations.updatedAt))
    .limit(options.limit ?? 100);

  return rows as AdminEntryRow[];
}

export async function statusCounts(): Promise<Record<string, number>> {
  const db = getDb();
  if (!db) return {};

  const rows = await db
    .select({ status: entryTranslations.status, count: sql<number>`count(*)::int` })
    .from(entryTranslations)
    .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
    .where(eq(entries.isDemo, false))
    .groupBy(entryTranslations.status);

  return Object.fromEntries(rows.map((r) => [r.status, r.count]));
}

/** Published pages whose review date has passed — the editorial to-do list. */
export async function dueForReview(limit = 20): Promise<AdminEntryRow[]> {
  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select({
      translationId: entryTranslations.id,
      entryId: entries.id,
      type: entries.type,
      locale: entryTranslations.locale,
      status: entryTranslations.status,
      title: entryTranslations.title,
      path: entryTranslations.path,
      updatedAt: entryTranslations.updatedAt,
      publishedAt: entryTranslations.publishedAt,
      scheduledFor: entryTranslations.scheduledFor,
      lastVerifiedAt: entryTranslations.lastVerifiedAt,
      reviewDueAt: entryTranslations.reviewDueAt,
      isDemo: entries.isDemo,
      authorName: authors.name,
    })
    .from(entryTranslations)
    .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
    .leftJoin(authors, eq(authors.id, entries.authorId))
    .where(
      and(
        eq(entryTranslations.status, "published"),
        isNotNull(entryTranslations.reviewDueAt),
        lte(entryTranslations.reviewDueAt, sql`now()`),
      ),
    )
    .orderBy(asc(entryTranslations.reviewDueAt))
    .limit(limit);

  return rows as AdminEntryRow[];
}

/** Entries published in one language but missing in another. */
export async function translationGaps(): Promise<
  { entryId: string; title: string; have: Locale[]; missing: Locale[] }[]
> {
  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select({
      entryId: entryTranslations.entryId,
      locale: entryTranslations.locale,
      title: entryTranslations.title,
      status: entryTranslations.status,
    })
    .from(entryTranslations)
    .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
    .where(eq(entries.isDemo, false));

  const byEntry = new Map<string, { title: string; have: Set<Locale> }>();
  for (const row of rows) {
    const record = byEntry.get(row.entryId) ?? { title: row.title, have: new Set<Locale>() };
    if (row.status === "published") record.have.add(row.locale as Locale);
    byEntry.set(row.entryId, record);
  }

  return [...byEntry.entries()]
    .map(([entryId, record]) => ({
      entryId,
      title: record.title,
      have: [...record.have],
      missing: LOCALES.filter((l) => !record.have.has(l)),
    }))
    .filter((row) => row.have.length > 0 && row.missing.length > 0);
}

export async function getTranslationForEdit(translationId: string) {
  const db = getDb();
  if (!db) return null;

  const rows = await db
    .select({ translation: entryTranslations, entry: entries })
    .from(entryTranslations)
    .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
    .where(eq(entryTranslations.id, translationId))
    .limit(1);

  return rows[0] ?? null;
}

/** Everything a picker in the editor needs, in one round trip. */
export async function editorOptions(locale: Locale) {
  const db = getDb();
  if (!db) {
    return { authors: [], categories: [], tags: [], sources: [], media: [] };
  }

  const [authorRows, categoryRows, tagRows, sourceRows, mediaRows] = await Promise.all([
    db
      .select({ id: authors.id, name: authors.name })
      .from(authors)
      .where(eq(authors.isActive, true))
      .orderBy(asc(authors.name)),
    db
      .select({
        id: categories.id,
        key: categories.key,
        section: categories.section,
        name: categoryTranslations.name,
      })
      .from(categories)
      .innerJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.locale, locale),
        ),
      )
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder)),
    db
      .select({ id: tags.id, key: tags.key, name: tagTranslations.name })
      .from(tags)
      .innerJoin(
        tagTranslations,
        and(eq(tagTranslations.tagId, tags.id), eq(tagTranslations.locale, locale)),
      )
      .where(eq(tags.isActive, true))
      .orderBy(asc(tagTranslations.name)),
    db
      .select({ id: sources.id, name: sources.name, url: sources.url, type: sources.type })
      .from(sources)
      .orderBy(asc(sources.name))
      .limit(500),
    db
      .select({ id: media.id, url: media.url, alt: media.alt, width: media.width, height: media.height })
      .from(media)
      .orderBy(desc(media.createdAt))
      .limit(200),
  ]);

  return {
    authors: authorRows,
    categories: categoryRows,
    tags: tagRows,
    sources: sourceRows,
    media: mediaRows,
  };
}

export async function listRedirects(limit = 200) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(redirects).orderBy(desc(redirects.createdAt)).limit(limit);
}

/**
 * The contact inbox.
 *
 * Read here rather than only emailed out: the row is the record of the message
 * and the email is the notification, so a provider that is not configured yet
 * cannot mean a reader's message is lost.
 */
export async function listContactMessages(limit = 200) {
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(limit);
}

export async function countNewContactMessages(): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contactMessages)
    .where(eq(contactMessages.status, "new"));
  return rows[0]?.count ?? 0;
}

export async function listMedia(limit = 200) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(media).orderBy(desc(media.createdAt)).limit(limit);
}
