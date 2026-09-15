"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

import { requireDb, schema } from "@/lib/db/client";
import { bodyToPlainText, parseBody } from "@/lib/content/blocks";
import {
  AuthorizationError,
  audit,
  createSession,
  destroySession,
  isThrottled,
  recordLoginAttempt,
  requireUser,
} from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import {
  authorSchema,
  entryMetaSchema,
  loginSchema,
  mediaSchema,
  redirectSchema,
  sourceSchema,
  translationSchema,
} from "./schemas";
import type { Locale } from "@/lib/i18n/config";
import { slugify } from "@/lib/format";
import { z } from "zod";

const createDraftSchema = z.object({
  type: z.enum([
    "news",
    "article",
    "guide",
    "destination",
    "place",
    "event",
    "route",
    "page",
  ]),
  locale: z.enum(["ca", "es", "en"]),
  title: z.string().min(1).max(300),
  path: z
    .string()
    .max(600)
    .optional()
    .transform((v) => (v ?? "").trim().replace(/^\/+|\/+$/g, "")),
});

const {
  authors,
  authorTranslations,
  entries,
  entryCategories,
  entryRelations,
  entryRevisions,
  entrySources,
  entryTags,
  entryTranslations,
  media,
  redirects,
  sources,
  users,
} = schema;

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  id?: string;
}

function fail(error: string, fieldErrors?: Record<string, string[]>): ActionResult {
  return { ok: false, error, fieldErrors };
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export async function signIn(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) return fail("Check the email address and password.");
  const { email, password, next } = parsed.data;

  const db = requireDb();

  if (await isThrottled(email)) {
    return fail("Too many failed attempts. Try again in 15 minutes.");
  }

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  const user = rows[0];

  // Same message and comparable timing whether the account exists or not, so
  // the form cannot be used to enumerate valid addresses.
  const valid = user
    ? user.isActive && (await verifyPassword(password, user.passwordHash))
    : await verifyPassword(password, "scrypt$65536$8$1$AAAA$AAAA");

  if (!user || !valid) {
    await recordLoginAttempt(email, false);
    return fail("Email address or password is not correct.");
  }

  await recordLoginAttempt(email, true);
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const headerList = await headers();
  await createSession(user.id, headerList.get("user-agent") ?? undefined);
  await audit(user.id, "session.create", "user", user.id);

  redirect(next && next.startsWith("/admin") ? next : "/admin");
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/* -------------------------------------------------------------------------- */
/* Entries                                                                    */
/* -------------------------------------------------------------------------- */

export async function saveEntryMeta(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser("author");
    const parsed = entryMetaSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Some fields are not valid.", parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const db = requireDb();

    if (data.entryId) {
      await db
        .update(entries)
        .set({
          type: data.type,
          key: data.key ?? null,
          primaryCategoryId: data.primaryCategoryId ?? null,
          authorId: data.authorId ?? null,
          heroMediaId: data.heroMediaId ?? null,
          parentId: data.parentId ?? null,
          isFeatured: data.isFeatured,
          isDemo: data.isDemo,
          updatedAt: new Date(),
        })
        .where(eq(entries.id, data.entryId));
      await audit(user.id, "entry.update", "entry", data.entryId);
      return { ok: true, id: data.entryId };
    }

    const inserted = await db
      .insert(entries)
      .values({
        type: data.type,
        key: data.key ?? null,
        primaryCategoryId: data.primaryCategoryId ?? null,
        authorId: data.authorId ?? null,
        heroMediaId: data.heroMediaId ?? null,
        parentId: data.parentId ?? null,
        isFeatured: data.isFeatured,
        isDemo: data.isDemo,
      })
      .returning({ id: entries.id });

    const id = inserted[0]?.id;
    if (!id) return fail("Could not create the entry.");
    await audit(user.id, "entry.create", "entry", id);
    return { ok: true, id };
  } catch (error) {
    return handle(error);
  }
}

/**
 * Saves one language edition.
 *
 * Publishing rules are enforced here rather than in the UI, because the UI is
 * not the security boundary:
 *  - only an editor or above can move a translation to `published`;
 *  - `published_at` is set once and then preserved, so the publication date of
 *    a page never silently changes when it is edited;
 *  - a snapshot of the previous state is written to `entry_revisions` before
 *    the update, so any change can be rolled back and attributed;
 *  - the plain-text projection used by search is recomputed from the body, so
 *    it can never drift from what is rendered.
 */
export async function saveTranslation(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser("author");
    const parsed = translationSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Some fields are not valid.", parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const db = requireDb();

    if (data.status === "published" || data.status === "scheduled") {
      await requireUser("editor");
    }

    const body = parseBody(data.body);
    const searchText = bodyToPlainText(body);

    const existingRows = data.translationId
      ? await db
          .select()
          .from(entryTranslations)
          .where(eq(entryTranslations.id, data.translationId))
          .limit(1)
      : [];
    const existing = existingRows[0];

    // Keep the original publication date. A re-edit updates `updated_at`, not
    // `published_at`: rewriting the publish date to look fresh is exactly the
    // pattern Google treats as deceptive.
    const publishedAt =
      data.status === "published"
        ? (existing?.publishedAt ?? data.publishedAt ?? new Date())
        : (data.publishedAt ?? existing?.publishedAt ?? null);

    const values = {
      entryId: data.entryId,
      locale: data.locale,
      status: data.status,
      title: data.title,
      slug: data.slug,
      path: data.path,
      excerpt: data.excerpt ?? null,
      body: body as unknown[],
      searchText,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      canonicalUrl: data.canonicalUrl ?? null,
      noindex: data.noindex,
      ogMediaId: data.ogMediaId ?? null,
      publishedAt,
      scheduledFor: data.scheduledFor,
      lastVerifiedAt: data.lastVerifiedAt,
      reviewDueAt: data.reviewDueAt,
      translatedFromLocale: data.translatedFromLocale ?? null,
      translatorNote: data.translatorNote ?? null,
      updatedAt: new Date(),
      updatedBy: user.id,
    };

    let translationId = data.translationId ?? null;

    if (existing) {
      await db.insert(entryRevisions).values({
        translationId: existing.id,
        snapshot: existing as unknown as Record<string, unknown>,
        userId: user.id,
        note: `Replaced by ${user.name}`,
      });
      await db
        .update(entryTranslations)
        .set(values)
        .where(eq(entryTranslations.id, existing.id));
    } else {
      const inserted = await db
        .insert(entryTranslations)
        .values({ ...values, createdBy: user.id })
        .returning({ id: entryTranslations.id });
      translationId = inserted[0]?.id ?? null;
    }

    await syncRelations(data);
    await audit(user.id, "translation.save", "entry_translation", translationId, {
      locale: data.locale,
      status: data.status,
    });

    // If the path changed, leave a permanent redirect behind so the old URL
    // keeps working and keeps its links.
    if (existing && existing.path !== data.path) {
      await db
        .insert(redirects)
        .values({
          fromPath: `/${data.locale}/${existing.path}/`,
          toPath: `/${data.locale}/${data.path}/`,
          kind: "permanent",
          note: "Automatic: slug changed in the CMS",
        })
        .onConflictDoNothing();
      revalidatePath(`/${data.locale}/${existing.path}`);
    }

    revalidateForTranslation(data.locale, data.path);
    return { ok: true, id: translationId ?? undefined };
  } catch (error) {
    return handle(error);
  }
}

async function syncRelations(data: {
  entryId: string;
  tagIds: string[];
  categoryIds: string[];
  sources: { sourceId: string; note?: string | null; accessedAt: Date | null }[];
  relatedEntryIds: string[];
}) {
  const db = requireDb();

  await db.delete(entryTags).where(eq(entryTags.entryId, data.entryId));
  if (data.tagIds.length > 0) {
    await db
      .insert(entryTags)
      .values(data.tagIds.map((tagId) => ({ entryId: data.entryId, tagId })));
  }

  await db.delete(entryCategories).where(eq(entryCategories.entryId, data.entryId));
  if (data.categoryIds.length > 0) {
    await db
      .insert(entryCategories)
      .values(
        data.categoryIds.map((categoryId) => ({ entryId: data.entryId, categoryId })),
      );
  }

  await db.delete(entrySources).where(eq(entrySources.entryId, data.entryId));
  if (data.sources.length > 0) {
    await db.insert(entrySources).values(
      data.sources.map((s, index) => ({
        entryId: data.entryId,
        sourceId: s.sourceId,
        note: s.note ?? null,
        accessedAt: s.accessedAt,
        sortOrder: index,
      })),
    );
  }

  await db.delete(entryRelations).where(eq(entryRelations.entryId, data.entryId));
  if (data.relatedEntryIds.length > 0) {
    await db.insert(entryRelations).values(
      data.relatedEntryIds.map((relatedEntryId, index) => ({
        entryId: data.entryId,
        relatedEntryId,
        kind: "related" as const,
        sortOrder: index,
      })),
    );
  }
}

export async function setTranslationStatus(
  translationId: string,
  status: "draft" | "review" | "ready" | "published" | "needs_update" | "archived",
): Promise<ActionResult> {
  try {
    const user = await requireUser(status === "published" ? "editor" : "author");
    const db = requireDb();

    const rows = await db
      .select()
      .from(entryTranslations)
      .where(eq(entryTranslations.id, translationId))
      .limit(1);
    const row = rows[0];
    if (!row) return fail("That entry no longer exists.");

    await db
      .update(entryTranslations)
      .set({
        status,
        publishedAt:
          status === "published" ? (row.publishedAt ?? new Date()) : row.publishedAt,
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(eq(entryTranslations.id, translationId));

    await audit(user.id, `translation.${status}`, "entry_translation", translationId);
    revalidateForTranslation(row.locale as Locale, row.path);
    return { ok: true, id: translationId };
  } catch (error) {
    return handle(error);
  }
}

/** Copies an edition into another language as a fresh draft. */
export async function createTranslationDraft(
  entryId: string,
  fromLocale: Locale,
  toLocale: Locale,
): Promise<ActionResult> {
  try {
    const user = await requireUser("author");
    const db = requireDb();

    const sourceRows = await db
      .select()
      .from(entryTranslations)
      .where(
        and(
          eq(entryTranslations.entryId, entryId),
          eq(entryTranslations.locale, fromLocale),
        ),
      )
      .limit(1);
    const source = sourceRows[0];
    if (!source) return fail("There is nothing to translate from.");

    const existing = await db
      .select({ id: entryTranslations.id })
      .from(entryTranslations)
      .where(
        and(eq(entryTranslations.entryId, entryId), eq(entryTranslations.locale, toLocale)),
      )
      .limit(1);
    if (existing[0]) return { ok: true, id: existing[0].id };

    const inserted = await db
      .insert(entryTranslations)
      .values({
        entryId,
        locale: toLocale,
        // Always a draft. A copied edition is never published without a human
        // reading it in the target language first.
        status: "draft",
        title: source.title,
        slug: `${source.slug}-${toLocale}`,
        path: `${source.path}-${toLocale}`,
        excerpt: source.excerpt,
        body: source.body,
        searchText: source.searchText,
        translatedFromLocale: fromLocale,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning({ id: entryTranslations.id });

    const id = inserted[0]?.id;
    await audit(user.id, "translation.draft", "entry_translation", id ?? null, {
      fromLocale,
      toLocale,
    });
    return { ok: true, id };
  } catch (error) {
    return handle(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Supporting records                                                         */
/* -------------------------------------------------------------------------- */

export async function saveMedia(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser("author");
    const parsed = mediaSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Check the media fields.", parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const db = requireDb();

    if (data.id) {
      await db.update(media).set(data).where(eq(media.id, data.id));
      await audit(user.id, "media.update", "media", data.id);
      return { ok: true, id: data.id };
    }

    const inserted = await db.insert(media).values(data).returning({ id: media.id });
    const id = inserted[0]?.id;
    await audit(user.id, "media.create", "media", id ?? null);
    return { ok: true, id };
  } catch (error) {
    return handle(error);
  }
}

export async function saveSource(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser("author");
    const parsed = sourceSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Check the source fields.", parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const db = requireDb();

    if (data.id) {
      await db.update(sources).set(data).where(eq(sources.id, data.id));
      return { ok: true, id: data.id };
    }
    const inserted = await db.insert(sources).values(data).returning({ id: sources.id });
    const id = inserted[0]?.id;
    await audit(user.id, "source.create", "source", id ?? null);
    return { ok: true, id };
  } catch (error) {
    return handle(error);
  }
}

export async function saveAuthor(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser("editor");
    const parsed = authorSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Check the author fields.", parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const db = requireDb();

    const { translations, ...row } = data;
    let id = data.id;

    if (id) {
      await db.update(authors).set(row).where(eq(authors.id, id));
    } else {
      const inserted = await db.insert(authors).values(row).returning({ id: authors.id });
      id = inserted[0]?.id;
    }
    if (!id) return fail("Could not save the author.");

    for (const t of translations) {
      await db
        .insert(authorTranslations)
        .values({ authorId: id, ...t })
        .onConflictDoUpdate({
          target: [authorTranslations.authorId, authorTranslations.locale],
          set: {
            jobTitle: t.jobTitle ?? null,
            bio: t.bio ?? null,
            expertise: t.expertise ?? null,
          },
        });
    }

    await audit(user.id, "author.save", "author", id);
    return { ok: true, id };
  } catch (error) {
    return handle(error);
  }
}

export async function saveRedirect(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser("editor");
    const parsed = redirectSchema.safeParse(input);
    if (!parsed.success) {
      return fail("Check the redirect fields.", parsed.error.flatten().fieldErrors);
    }
    const data = parsed.data;
    const db = requireDb();

    if (data.kind !== "gone" && !data.toPath) {
      return fail("A redirect needs a destination path.");
    }

    if (data.id) {
      await db.update(redirects).set(data).where(eq(redirects.id, data.id));
    } else {
      await db
        .insert(redirects)
        .values(data)
        .onConflictDoUpdate({ target: redirects.fromPath, set: data });
    }

    await audit(user.id, "redirect.save", "redirect", data.fromPath);
    revalidatePath(data.fromPath);
    return { ok: true };
  } catch (error) {
    return handle(error);
  }
}

const contactStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "read", "answered", "spam"]),
});

/**
 * Marks a contact message read, answered or spam.
 *
 * The message itself is never editable from here: an inbox that can rewrite
 * what somebody sent is not a record of what they sent.
 */
export async function setContactStatus(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser("editor");
    const parsed = contactStatusSchema.safeParse(input);
    if (!parsed.success) return fail("Unknown message or status.");

    const db = requireDb();
    await db
      .update(schema.contactMessages)
      .set({ status: parsed.data.status })
      .where(eq(schema.contactMessages.id, parsed.data.id));

    await audit(user.id, "contact.status", "contact_message", parsed.data.id);
    revalidatePath("/admin/messages");
    return { ok: true };
  } catch (error) {
    return handle(error);
  }
}

/** Deletes a message for good — the route a deletion request has to take. */
export async function deleteContactMessage(input: unknown): Promise<ActionResult> {
  try {
    const user = await requireUser("admin");
    const parsed = z.object({ id: z.string().uuid() }).safeParse(input);
    if (!parsed.success) return fail("Unknown message.");

    const db = requireDb();
    await db
      .delete(schema.contactMessages)
      .where(eq(schema.contactMessages.id, parsed.data.id));

    await audit(user.id, "contact.delete", "contact_message", parsed.data.id);
    revalidatePath("/admin/messages");
    return { ok: true };
  } catch (error) {
    return handle(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Invalidates every cached surface a publish can appear on. */
function revalidateForTranslation(locale: Locale, path: string) {
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/${path}`);
  revalidatePath("/sitemap.xml");
  // Hub pages list the entry, so the first segment is invalidated too.
  const first = path.split("/")[0];
  if (first) revalidatePath(`/${locale}/${first}`);
}

function handle(error: unknown): ActionResult {
  if (error instanceof AuthorizationError) return fail(error.message);
  // Re-throw redirect/notFound control-flow errors untouched.
  if (
    error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_")
  ) {
    throw error;
  }
  const message = error instanceof Error ? error.message : "Unexpected error";
  return fail(message);
}

/* -------------------------------------------------------------------------- */
/* Creation flow                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Creates an entry and its first language edition in one step, then sends the
 * editor straight into the editing screen. Everything starts as a draft.
 */
export async function createEntryDraft(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  let target: string | null = null;

  try {
    const user = await requireUser("author");
    const db = requireDb();

    const parsed = createDraftSchema.safeParse({
      type: formData.get("type"),
      locale: formData.get("locale"),
      title: formData.get("title"),
      path: formData.get("path"),
    });
    if (!parsed.success) {
      return fail("Check the type, language, title and path.", parsed.error.flatten().fieldErrors);
    }

    const { type, locale, title } = parsed.data;
    const path = parsed.data.path || slugify(title);
    const slug = path.split("/").filter(Boolean).at(-1) ?? slugify(title);

    const insertedEntry = await db
      .insert(entries)
      .values({ type })
      .returning({ id: entries.id });
    const entryId = insertedEntry[0]?.id;
    if (!entryId) return fail("Could not create the entry.");

    const insertedTranslation = await db
      .insert(entryTranslations)
      .values({
        entryId,
        locale,
        status: "draft",
        title,
        slug,
        path,
        body: [],
        searchText: "",
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning({ id: entryTranslations.id });

    const translationId = insertedTranslation[0]?.id;
    if (!translationId) return fail("Could not create the draft.");

    await audit(user.id, "entry.create", "entry", entryId, { type, locale });
    target = `/admin/content/${translationId}`;
  } catch (error) {
    return handle(error);
  }

  redirect(target);
}
