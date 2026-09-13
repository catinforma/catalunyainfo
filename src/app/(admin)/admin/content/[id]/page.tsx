import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { getSessionUser } from "@/lib/auth/session";
import { editorOptions, getTranslationForEdit } from "@/lib/admin/queries";
import { getDb, schema } from "@/lib/db/client";
import { parseBody } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { EntryEditor, type EditorInitialState } from "./EntryEditor";

export const dynamic = "force-dynamic";

const { entryRelations, entrySources, entryTags, entryTranslations } = schema;

/** `2026-09-13T14:30` for a datetime-local input, `2026-09-13` for a date one. */
function toInput(date: Date | null, kind: "date" | "datetime"): string {
  if (!date) return "";
  const iso = date.toISOString();
  return kind === "date" ? iso.slice(0, 10) : iso.slice(0, 16);
}

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;
  const record = await getTranslationForEdit(id);
  if (!record) notFound();

  const db = getDb();
  if (!db) notFound();

  const { translation, entry } = record;

  const [tagRows, categoryRows, sourceRows, relationRows, siblingRows, options, entryList] =
    await Promise.all([
      db.select().from(entryTags).where(eq(entryTags.entryId, entry.id)),
      db
        .select()
        .from(schema.entryCategories)
        .where(eq(schema.entryCategories.entryId, entry.id)),
      db.select().from(entrySources).where(eq(entrySources.entryId, entry.id)),
      db.select().from(entryRelations).where(eq(entryRelations.entryId, entry.id)),
      db
        .select({ locale: entryTranslations.locale })
        .from(entryTranslations)
        .where(eq(entryTranslations.entryId, entry.id)),
      editorOptions(translation.locale as Locale),
      db
        .select({ id: entryTranslations.entryId, title: entryTranslations.title })
        .from(entryTranslations)
        .where(eq(entryTranslations.locale, translation.locale))
        .limit(300),
    ]);

  const initial: EditorInitialState = {
    translationId: translation.id,
    entryId: entry.id,
    locale: translation.locale as Locale,
    status: translation.status,
    title: translation.title,
    slug: translation.slug,
    path: translation.path,
    excerpt: translation.excerpt ?? "",
    body: parseBody(translation.body),
    seoTitle: translation.seoTitle ?? "",
    seoDescription: translation.seoDescription ?? "",
    canonicalUrl: translation.canonicalUrl ?? "",
    noindex: translation.noindex,
    publishedAt: toInput(translation.publishedAt, "datetime"),
    scheduledFor: toInput(translation.scheduledFor, "datetime"),
    lastVerifiedAt: toInput(translation.lastVerifiedAt, "date"),
    reviewDueAt: toInput(translation.reviewDueAt, "date"),
    tagIds: tagRows.map((r) => r.tagId),
    categoryIds: categoryRows.map((r) => r.categoryId),
    relatedEntryIds: relationRows.map((r) => r.relatedEntryId),
    sources: sourceRows.map((r) => ({
      sourceId: r.sourceId,
      note: r.note ?? "",
      accessedAt: toInput(r.accessedAt, "date"),
    })),
    entry: {
      type: entry.type,
      key: entry.key ?? "",
      primaryCategoryId: entry.primaryCategoryId ?? "",
      authorId: entry.authorId ?? "",
      heroMediaId: entry.heroMediaId ?? "",
      parentId: entry.parentId ?? "",
      isFeatured: entry.isFeatured,
      isDemo: entry.isDemo,
    },
    siblingLocales: siblingRows
      .map((r) => r.locale as Locale)
      .filter((l) => l !== translation.locale),
  };

  return (
    <main className="ci-shell py-10">
      <div className="ci-section-head">
        <h1 className="text-2xl">{translation.title || "Sense títol"}</h1>
        <span className="ci-label">
          {entry.type} · {translation.locale} · {translation.status}
        </span>
      </div>

      <EntryEditor
        initial={initial}
        options={{
          media: options.media.map((m) => ({
            id: m.id,
            url: m.url,
            alt: (m.alt ?? {}) as Record<string, string>,
          })),
          sources: options.sources.map((s) => ({ id: s.id, name: s.name })),
          entries: entryList
            .filter((e) => e.id !== entry.id)
            .map((e) => ({ id: e.id, title: e.title })),
          authors: options.authors,
          categories: options.categories.map((c) => ({
            id: c.id,
            name: c.name,
            section: c.section,
          })),
          tags: options.tags.map((t) => ({ id: t.id, name: t.name })),
        }}
      />
    </main>
  );
}
