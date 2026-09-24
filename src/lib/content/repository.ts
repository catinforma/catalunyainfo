import "server-only";

import { and, asc, desc, eq, gte, inArray, isNotNull, lte, ne, or, sql } from "drizzle-orm";

import { getDb, schema } from "@/lib/db/client";
import type { Locale } from "@/lib/i18n/config";
import type { EntryType } from "@/lib/db/schema";
import { parseBody, readingMinutes } from "./blocks";
import type {
  AuthorView,
  CategoryView,
  EntryDetail,
  EntrySummary,
  EventView,
  MediaView,
  PlaceView,
  RouteView,
  SourceView,
  TagView,
} from "./types";
import { SECTION_CATEGORY_KEYS, SECTION_ENTRY_TYPES } from "./types";

const {
  authors,
  authorTranslations,
  categories,
  categoryTranslations,
  entries,
  entryCategories,
  entryRelations,
  entrySources,
  entryTags,
  entryTranslations,
  events,
  media,
  places,
  redirects,
  routes,
  sources,
  tags,
  tagTranslations,
} = schema;

/* -------------------------------------------------------------------------- */
/* Visibility rules                                                           */
/* -------------------------------------------------------------------------- */

/**
 * A translation is public when it is `published`, its publish date has passed,
 * and the underlying entry is not demo/fixture data.
 *
 * Draft preview deliberately bypasses only the status and date clauses. The
 * demo clause is never bypassed in production.
 */
function publishedWhere(locale: Locale) {
  return and(
    eq(entryTranslations.locale, locale),
    eq(entryTranslations.status, "published"),
    isNotNull(entryTranslations.publishedAt),
    lte(entryTranslations.publishedAt, sql`now()`),
    eq(entries.isDemo, false),
  );
}

function previewWhere(locale: Locale) {
  return and(
    eq(entryTranslations.locale, locale),
    ne(entryTranslations.status, "archived"),
  );
}

function visibilityWhere(locale: Locale, preview: boolean) {
  return preview ? previewWhere(locale) : publishedWhere(locale);
}


/* -------------------------------------------------------------------------- */
/* Resilience                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Runs a read and falls back to an empty result if the database cannot answer.
 *
 * Content reads must never take the site down. A cold Neon instance, a dropped
 * connection, or - as happens on the very first deploy - a schema that has not
 * been applied yet, should degrade to the same honest empty state we already
 * render when no database is configured at all. Without this the build itself
 * fails, because `generateStaticParams` queries the database.
 *
 * Writes are deliberately NOT wrapped: a failed write must surface.
 */
async function safeRead<T>(label: string, fallback: T, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(
      `[content] ${label} failed, serving empty:`,
      error instanceof Error ? error.message : error,
    );
    return fallback;
  }
}

/* -------------------------------------------------------------------------- */
/* Row mappers                                                                */
/* -------------------------------------------------------------------------- */

type MediaRow = typeof media.$inferSelect;

function mapMedia(row: MediaRow | null | undefined, locale: Locale): MediaView | null {
  if (!row) return null;
  const alt = row.alt?.[locale] ?? row.alt?.ca ?? row.alt?.es ?? row.alt?.en ?? "";
  const caption = row.caption?.[locale] ?? null;
  return {
    id: row.id,
    url: row.url,
    width: row.width,
    height: row.height,
    blurDataUrl: row.blurDataUrl,
    alt,
    caption,
    credit: row.credit,
    creditUrl: row.creditUrl,
    license: row.license,
    focalX: row.focalX,
    focalY: row.focalY,
  };
}

export function hrefFor(locale: Locale, path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `/${locale}/${clean}/` : `/${locale}/`;
}

interface SummaryRow {
  entryId: string;
  translationId: string;
  type: EntryType;
  title: string;
  path: string;
  excerpt: string | null;
  searchText: string;
  publishedAt: Date | null;
  updatedAt: Date;
  lastVerifiedAt: Date | null;
  isFeatured: boolean;
  authorName: string | null;
  hero: MediaRow | null;
  categoryId: string | null;
  categoryKey: string | null;
  categorySection: string | null;
  categoryName: string | null;
  categorySlug: string | null;
}

function mapSummary(row: SummaryRow, locale: Locale): EntrySummary {
  const category: CategoryView | null =
    row.categoryId && row.categoryName && row.categorySlug
      ? {
          id: row.categoryId,
          key: row.categoryKey ?? "",
          section: row.categorySection ?? "",
          name: row.categoryName,
          slug: row.categorySlug,
          description: null,
        }
      : null;

  return {
    entryId: row.entryId,
    translationId: row.translationId,
    type: row.type,
    locale,
    title: row.title,
    path: row.path,
    href: hrefFor(locale, row.path),
    excerpt: row.excerpt,
    hero: mapMedia(row.hero, locale),
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    lastVerifiedAt: row.lastVerifiedAt,
    readingMinutes: readingMinutes(row.searchText),
    category,
    authorName: row.authorName,
    isFeatured: row.isFeatured,
  };
}

/** Shared select shape for list queries. */
function summarySelection() {
  return {
    entryId: entries.id,
    translationId: entryTranslations.id,
    type: entries.type,
    title: entryTranslations.title,
    path: entryTranslations.path,
    excerpt: entryTranslations.excerpt,
    searchText: entryTranslations.searchText,
    publishedAt: entryTranslations.publishedAt,
    updatedAt: entryTranslations.updatedAt,
    lastVerifiedAt: entryTranslations.lastVerifiedAt,
    isFeatured: entries.isFeatured,
    authorName: authors.name,
    hero: media,
    categoryId: categories.id,
    categoryKey: categories.key,
    categorySection: categories.section,
    categoryName: categoryTranslations.name,
    categorySlug: categoryTranslations.slug,
  };
}

function summaryQuery(db: NonNullable<ReturnType<typeof getDb>>, locale: Locale) {
  return db
    .select(summarySelection())
    .from(entryTranslations)
    .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
    .leftJoin(authors, eq(authors.id, entries.authorId))
    .leftJoin(media, eq(media.id, entries.heroMediaId))
    .leftJoin(categories, eq(categories.id, entries.primaryCategoryId))
    .leftJoin(
      categoryTranslations,
      and(
        eq(categoryTranslations.categoryId, categories.id),
        eq(categoryTranslations.locale, locale),
      ),
    );
}

/* -------------------------------------------------------------------------- */
/* Public reads                                                               */
/* -------------------------------------------------------------------------- */

export interface ListOptions {
  limit?: number;
  offset?: number;
  types?: EntryType[];
  categoryKey?: string;
  /** Primary-category keys the entry may belong to. OR-ed with `types`. */
  categoryKeys?: string[];
  preview?: boolean;
}

export async function listEntries(
  locale: Locale,
  options: ListOptions = {},
): Promise<EntrySummary[]> {
  const db = getDb();
  if (!db) return [];
  return safeRead("listEntries", [], async () => {

  const { limit = 12, offset = 0, types, categoryKey, categoryKeys, preview = false } = options;

  const conditions = [visibilityWhere(locale, preview)];
  // Types and section categories are alternatives, not extra filters: a guide
  // about villages is an `article` AND belongs under Destinations.
  const scope = sectionScope(types, categoryKeys);
  if (scope) conditions.push(scope);
  if (categoryKey) conditions.push(eq(categories.key, categoryKey));

  const rows = await summaryQuery(db, locale)
    .where(and(...conditions))
    .orderBy(desc(entryTranslations.publishedAt), desc(entryTranslations.updatedAt))
    .limit(Math.min(limit, 100))
    .offset(offset);

    return rows.map((row) => mapSummary(row as SummaryRow, locale));
  });
}

export async function countEntries(
  locale: Locale,
  options: Pick<ListOptions, "types" | "categoryKey" | "categoryKeys" | "preview"> = {},
): Promise<number> {
  const db = getDb();
  if (!db) return 0;

  return safeRead("countEntries", 0, async () => {
    const conditions = [visibilityWhere(locale, options.preview ?? false)];
    const scope = sectionScope(options.types, options.categoryKeys);
    if (scope) conditions.push(scope);

    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(entryTranslations)
      .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
      .leftJoin(categories, eq(categories.id, entries.primaryCategoryId))
      .where(and(...conditions));

    return rows[0]?.count ?? 0;
  });
}

/** `entry.type IN (…) OR entry.primary_category IN (…)`. */
function sectionScope(types?: EntryType[], categoryKeys?: string[]) {
  const parts = [];
  if (types && types.length > 0) parts.push(inArray(entries.type, types));
  if (categoryKeys && categoryKeys.length > 0) {
    parts.push(inArray(categories.key, categoryKeys));
  }
  if (parts.length === 0) return undefined;
  if (parts.length === 1) return parts[0];
  return or(...parts);
}

export async function listBySection(
  locale: Locale,
  section: string,
  options: ListOptions = {},
): Promise<EntrySummary[]> {
  const types = SECTION_ENTRY_TYPES[section];
  const categoryKeys = SECTION_CATEGORY_KEYS[section];
  if (!types && !categoryKeys) return [];
  return listEntries(locale, { ...options, types, categoryKeys });
}

export async function countBySection(
  locale: Locale,
  section: string,
  preview = false,
): Promise<number> {
  const types = SECTION_ENTRY_TYPES[section];
  const categoryKeys = SECTION_CATEGORY_KEYS[section];
  if (!types && !categoryKeys) return 0;
  return countEntries(locale, { types, categoryKeys, preview });
}

/**
 * Which section hubs actually have something in them.
 *
 * The navigation is built from this rather than from the full section list: a
 * menu entry that leads to an empty page is worse than no menu entry at all,
 * and hiding it by data means the section comes back on its own the day the
 * first entry is published, with no code change and nothing to remember.
 */
export async function nonEmptySections(
  locale: Locale,
  sections: readonly string[],
): Promise<Set<string>> {
  const counts = await Promise.all(
    sections.map(async (section) => [section, await countBySection(locale, section)] as const),
  );
  return new Set(counts.filter(([, count]) => count > 0).map(([section]) => section));
}

/** Upcoming events, ordered by start date rather than publication date. */
export async function listUpcomingEvents(
  locale: Locale,
  limit = 8,
  preview = false,
): Promise<(EntrySummary & { startsAt: Date; endsAt: Date | null })[]> {
  const db = getDb();
  if (!db) return [];

  return safeRead("listUpcomingEvents", [], async () => {
    const rows = await summaryQuery(db, locale)
      .innerJoin(events, eq(events.entryId, entries.id))
      .where(
        and(
          visibilityWhere(locale, preview),
          or(gte(events.startsAt, sql`now()`), gte(events.endsAt, sql`now()`)),
        ),
      )
      .orderBy(asc(events.startsAt))
      .limit(Math.min(limit, 60));

    const withDates = await db
      .select({ entryId: events.entryId, startsAt: events.startsAt, endsAt: events.endsAt })
      .from(events)
      .where(
        inArray(
          events.entryId,
          rows.map((r) => (r as SummaryRow).entryId),
        ),
      );

    const dateById = new Map(withDates.map((d) => [d.entryId, d]));

    return rows.flatMap((row) => {
      const summary = mapSummary(row as SummaryRow, locale);
      const dates = dateById.get(summary.entryId);
      if (!dates) return [];
      return [{ ...summary, startsAt: dates.startsAt, endsAt: dates.endsAt }];
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Single entry resolution                                                    */
/* -------------------------------------------------------------------------- */

export async function resolvePath(
  locale: Locale,
  path: string,
  preview = false,
): Promise<EntryDetail | null> {
  const db = getDb();
  if (!db) return null;

  return safeRead("resolvePath", null, async () => {
    const normalised = path.replace(/^\/+|\/+$/g, "");

    const rows = await db
      .select({
        ...summarySelection(),
        status: entryTranslations.status,
        body: entryTranslations.body,
        noindex: entryTranslations.noindex,
        canonicalUrl: entryTranslations.canonicalUrl,
        seoTitle: entryTranslations.seoTitle,
        seoDescription: entryTranslations.seoDescription,
        ogMediaId: entryTranslations.ogMediaId,
        authorId: entries.authorId,
        isDemo: entries.isDemo,
        parentId: entries.parentId,
        categoryDescription: categoryTranslations.description,
      })
      .from(entryTranslations)
      .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
      .leftJoin(authors, eq(authors.id, entries.authorId))
      .leftJoin(media, eq(media.id, entries.heroMediaId))
      .leftJoin(categories, eq(categories.id, entries.primaryCategoryId))
      .leftJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.locale, locale),
        ),
      )
      .where(and(eq(entryTranslations.path, normalised), visibilityWhere(locale, preview)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const summary = mapSummary(row as unknown as SummaryRow, locale);
    const entryId = summary.entryId;

    const [
      ogRows,
      authorRows,
      tagRows,
      categoryRows,
      sourceRows,
      relationRows,
      translationRows,
      placeRows,
      eventRows,
      routeRows,
      ancestors,
    ] = await Promise.all([
      row.ogMediaId
        ? db.select().from(media).where(eq(media.id, row.ogMediaId)).limit(1)
        : Promise.resolve([]),
      row.authorId
        ? db
            .select({
              author: authors,
              translation: authorTranslations,
              avatar: media,
            })
            .from(authors)
            .leftJoin(
              authorTranslations,
              and(
                eq(authorTranslations.authorId, authors.id),
                eq(authorTranslations.locale, locale),
              ),
            )
            .leftJoin(media, eq(media.id, authors.avatarMediaId))
            .where(eq(authors.id, row.authorId))
            .limit(1)
        : Promise.resolve([]),
      db
        .select({ id: tags.id, key: tags.key, name: tagTranslations.name, slug: tagTranslations.slug })
        .from(entryTags)
        .innerJoin(tags, eq(tags.id, entryTags.tagId))
        .innerJoin(
          tagTranslations,
          and(eq(tagTranslations.tagId, tags.id), eq(tagTranslations.locale, locale)),
        )
        .where(and(eq(entryTags.entryId, entryId), eq(tags.isActive, true))),
      db
        .select({
          id: categories.id,
          key: categories.key,
          section: categories.section,
          name: categoryTranslations.name,
          slug: categoryTranslations.slug,
          description: categoryTranslations.description,
        })
        .from(entryCategories)
        .innerJoin(categories, eq(categories.id, entryCategories.categoryId))
        .innerJoin(
          categoryTranslations,
          and(
            eq(categoryTranslations.categoryId, categories.id),
            eq(categoryTranslations.locale, locale),
          ),
        )
        .where(eq(entryCategories.entryId, entryId)),
      db
        .select({
          id: sources.id,
          name: sources.name,
          publisher: sources.publisher,
          url: sources.url,
          type: sources.type,
          note: entrySources.note,
          accessedAt: entrySources.accessedAt,
          sortOrder: entrySources.sortOrder,
        })
        .from(entrySources)
        .innerJoin(sources, eq(sources.id, entrySources.sourceId))
        .where(eq(entrySources.entryId, entryId))
        .orderBy(asc(entrySources.sortOrder)),
      db
        .select({ relatedEntryId: entryRelations.relatedEntryId })
        .from(entryRelations)
        .where(eq(entryRelations.entryId, entryId))
        .orderBy(asc(entryRelations.sortOrder))
        .limit(12),
      db
        .select({ locale: entryTranslations.locale, path: entryTranslations.path })
        .from(entryTranslations)
        .where(
          and(
            eq(entryTranslations.entryId, entryId),
            eq(entryTranslations.status, "published"),
            eq(entryTranslations.noindex, false),
          ),
        ),
      db.select().from(places).where(eq(places.entryId, entryId)).limit(1),
      db.select().from(events).where(eq(events.entryId, entryId)).limit(1),
      db.select().from(routes).where(eq(routes.entryId, entryId)).limit(1),
      loadAncestors(db, locale, row.parentId, preview),
    ]);

    const authorRow = authorRows[0];
    const author: AuthorView | null = authorRow
      ? {
          id: authorRow.author.id,
          slug: authorRow.author.slug,
          name: authorRow.author.name,
          jobTitle: authorRow.translation?.jobTitle ?? null,
          bio: authorRow.translation?.bio ?? null,
          expertise: authorRow.translation?.expertise ?? null,
          links: authorRow.author.links ?? {},
          avatar: mapMedia(authorRow.avatar, locale),
        }
      : null;

    const related =
      relationRows.length > 0
        ? await summariesByEntryIds(
            locale,
            relationRows.map((r) => r.relatedEntryId),
            preview,
          )
        : [];

    const translations: Partial<Record<Locale, string>> = {};
    for (const t of translationRows) {
      translations[t.locale as Locale] = hrefFor(t.locale as Locale, t.path);
    }

    const placeRow = placeRows[0];
    const place: PlaceView | null = placeRow
      ? {
          kind: placeRow.kind,
          latitude: placeRow.latitude,
          longitude: placeRow.longitude,
          comarca: placeRow.comarca,
          municipality: placeRow.municipality,
          postalCode: placeRow.postalCode,
          streetAddress: placeRow.streetAddress,
          officialUrl: placeRow.officialUrl,
          openingHours: placeRow.openingHours ?? [],
          pricing: placeRow.pricing ?? null,
          accessibility: placeRow.accessibility ?? null,
        }
      : null;

    const eventRow = eventRows[0];
    const event: EventView | null = eventRow
      ? {
          startsAt: eventRow.startsAt,
          endsAt: eventRow.endsAt,
          isAllDay: eventRow.isAllDay,
          recurrenceRule: eventRow.recurrenceRule,
          venueName: eventRow.venueName,
          ticketUrl: eventRow.ticketUrl,
          isFree: eventRow.isFree,
          organiser: eventRow.organiser,
        }
      : null;

    const routeRow = routeRows[0];
    const route: RouteView | null = routeRow
      ? {
          distanceMetres: routeRow.distanceMetres,
          ascentMetres: routeRow.ascentMetres,
          descentMetres: routeRow.descentMetres,
          durationMinutes: routeRow.durationMinutes,
          difficulty: routeRow.difficulty,
          isCircular: routeRow.isCircular,
          gpxUrl: routeRow.gpxUrl,
        }
      : null;

    return {
      ...summary,
      status: row.status,
      body: parseBody(row.body),
      noindex: row.noindex,
      canonicalUrl: row.canonicalUrl,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      og: mapMedia(ogRows[0] ?? null, locale),
      author,
      tags: tagRows as TagView[],
      categories: categoryRows as CategoryView[],
      sources: sourceRows as SourceView[],
      related,
      translations,
      place,
      event,
      route,
      isDemo: row.isDemo,
      breadcrumbs: ancestors,
    };
  });
}

/** Walks `entries.parent_id` upwards to build breadcrumb trail. */
async function loadAncestors(
  db: NonNullable<ReturnType<typeof getDb>>,
  locale: Locale,
  parentId: string | null,
  preview: boolean,
): Promise<{ label: string; href: string }[]> {
  const trail: { label: string; href: string }[] = [];
  let current = parentId;
  let guard = 0;

  while (current && guard < 5) {
    guard += 1;
    const rows = await db
      .select({
        title: entryTranslations.title,
        path: entryTranslations.path,
        parentId: entries.parentId,
      })
      .from(entryTranslations)
      .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
      .where(and(eq(entryTranslations.entryId, current), visibilityWhere(locale, preview)))
      .limit(1);

    const row = rows[0];
    if (!row) break;
    trail.unshift({ label: row.title, href: hrefFor(locale, row.path) });
    current = row.parentId;
  }

  return trail;
}

export async function summariesByEntryIds(
  locale: Locale,
  ids: string[],
  preview = false,
): Promise<EntrySummary[]> {
  const db = getDb();
  if (!db || ids.length === 0) return [];

  return safeRead("summariesByEntryIds", [], async () => {
    const rows = await summaryQuery(db, locale).where(
      and(inArray(entries.id, ids), visibilityWhere(locale, preview)),
    );

    const byId = new Map(
      rows.map((row) => {
        const summary = mapSummary(row as SummaryRow, locale);
        return [summary.entryId, summary];
      }),
    );
    return ids.flatMap((id) => {
      const found = byId.get(id);
      return found ? [found] : [];
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

export async function searchEntries(
  locale: Locale,
  query: string,
  limit = 20,
): Promise<EntrySummary[]> {
  const db = getDb();
  const trimmed = query.trim();
  if (!db || trimmed.length < 2) return [];

  return safeRead("searchEntries", [], async () => {
    const tsConfig = locale === "es" ? "spanish" : locale === "en" ? "english" : "simple";

    const rows = await summaryQuery(db, locale)
      .where(
        and(
          publishedWhere(locale),
          eq(entryTranslations.noindex, false),
          sql`to_tsvector(${sql.raw(`'${tsConfig}'`)}, coalesce(${entryTranslations.title}, '') || ' ' || coalesce(${entryTranslations.excerpt}, '') || ' ' || coalesce(${entryTranslations.searchText}, '')) @@ websearch_to_tsquery(${sql.raw(`'${tsConfig}'`)}, ${trimmed})`,
        ),
      )
      .orderBy(desc(entryTranslations.publishedAt))
      .limit(Math.min(limit, 50));

    return rows.map((row) => mapSummary(row as SummaryRow, locale));
  });
}

/* -------------------------------------------------------------------------- */
/* Sitemap + redirects                                                        */
/* -------------------------------------------------------------------------- */

export interface SitemapRow {
  locale: Locale;
  path: string;
  updatedAt: Date;
  publishedAt: Date | null;
  entryId: string;
}

export async function allIndexablePaths(): Promise<SitemapRow[]> {
  const db = getDb();
  if (!db) return [];

  return safeRead("allIndexablePaths", [], async () => {
    const rows = await db
      .select({
        locale: entryTranslations.locale,
        path: entryTranslations.path,
        updatedAt: entryTranslations.updatedAt,
        publishedAt: entryTranslations.publishedAt,
        entryId: entryTranslations.entryId,
      })
      .from(entryTranslations)
      .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
      .where(
        and(
          eq(entryTranslations.status, "published"),
          eq(entryTranslations.noindex, false),
          isNotNull(entryTranslations.publishedAt),
          lte(entryTranslations.publishedAt, sql`now()`),
          eq(entries.isDemo, false),
        ),
      )
      .orderBy(desc(entryTranslations.publishedAt));

    return rows as SitemapRow[];
  });
}

export interface RedirectMatch {
  toPath: string | null;
  kind: "permanent" | "temporary" | "gone";
}

export async function findRedirect(fromPath: string): Promise<RedirectMatch | null> {
  const db = getDb();
  if (!db) return null;

  return safeRead("findRedirect", null, async () => {
    const rows = await db
      .select({ toPath: redirects.toPath, kind: redirects.kind })
      .from(redirects)
      .where(eq(redirects.fromPath, fromPath))
      .limit(1);

    return rows[0] ?? null;
  });
}

/* -------------------------------------------------------------------------- */
/* Taxonomy + authors                                                         */
/* -------------------------------------------------------------------------- */

export async function listCategories(
  locale: Locale,
  section?: string,
): Promise<CategoryView[]> {
  const db = getDb();
  if (!db) return [];

  return safeRead("listCategories", [], async () => {
    const conditions = [
      eq(categoryTranslations.locale, locale),
      eq(categories.isActive, true),
    ];
    if (section) conditions.push(eq(categories.section, section));

    const rows = await db
      .select({
        id: categories.id,
        key: categories.key,
        section: categories.section,
        name: categoryTranslations.name,
        slug: categoryTranslations.slug,
        description: categoryTranslations.description,
      })
      .from(categories)
      .innerJoin(categoryTranslations, eq(categoryTranslations.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(asc(categories.sortOrder), asc(categoryTranslations.name));

    return rows as CategoryView[];
  });
}

export async function listAuthors(locale: Locale): Promise<AuthorView[]> {
  const db = getDb();
  if (!db) return [];

  return safeRead("listAuthors", [], async () => {
    const rows = await db
      .select({ author: authors, translation: authorTranslations, avatar: media })
      .from(authors)
      .leftJoin(
        authorTranslations,
        and(eq(authorTranslations.authorId, authors.id), eq(authorTranslations.locale, locale)),
      )
      .leftJoin(media, eq(media.id, authors.avatarMediaId))
      .where(eq(authors.isActive, true))
      .orderBy(asc(authors.name));

    return rows.map((r) => ({
      id: r.author.id,
      slug: r.author.slug,
      name: r.author.name,
      jobTitle: r.translation?.jobTitle ?? null,
      bio: r.translation?.bio ?? null,
      expertise: r.translation?.expertise ?? null,
      links: r.author.links ?? {},
      avatar: mapMedia(r.avatar, locale),
    }));
  });
}

export async function getAuthorBySlug(
  locale: Locale,
  slug: string,
): Promise<{ author: AuthorView; entries: EntrySummary[] } | null> {
  const db = getDb();
  if (!db) return null;

  return safeRead("getAuthorBySlug", null, async () => {
    const rows = await db
      .select({ author: authors, translation: authorTranslations, avatar: media })
      .from(authors)
      .leftJoin(
        authorTranslations,
        and(eq(authorTranslations.authorId, authors.id), eq(authorTranslations.locale, locale)),
      )
      .leftJoin(media, eq(media.id, authors.avatarMediaId))
      .where(and(eq(authors.slug, slug), eq(authors.isActive, true)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const authored = await summaryQuery(db, locale)
      .where(and(publishedWhere(locale), eq(entries.authorId, row.author.id)))
      .orderBy(desc(entryTranslations.publishedAt))
      .limit(24);

    return {
      author: {
        id: row.author.id,
        slug: row.author.slug,
        name: row.author.name,
        jobTitle: row.translation?.jobTitle ?? null,
        bio: row.translation?.bio ?? null,
        expertise: row.translation?.expertise ?? null,
        links: row.author.links ?? {},
        avatar: mapMedia(row.avatar, locale),
      },
      entries: authored.map((r) => mapSummary(r as SummaryRow, locale)),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Homepage composition                                                       */
/* -------------------------------------------------------------------------- */

export interface HomeData {
  featured: EntrySummary[];
  news: EntrySummary[];
  guides: EntrySummary[];
  destinations: EntrySummary[];
  events: (EntrySummary & { startsAt: Date; endsAt: Date | null })[];
  routes: EntrySummary[];
  totalPublished: number;
}

/**
 * Builds the homepage payload. Sections with no real content come back empty
 * and the homepage simply does not render them, rather than showing a
 * placeholder shell that would read as a thin, unfinished page.
 */
const EMPTY_HOME: HomeData = {
  featured: [],
  news: [],
  guides: [],
  destinations: [],
  events: [],
  routes: [],
  totalPublished: 0,
};

export async function getHomeData(locale: Locale, preview = false): Promise<HomeData> {
  const db = getDb();
  if (!db) {
    return {
      featured: [],
      news: [],
      guides: [],
      destinations: [],
      events: [],
      routes: [],
      totalPublished: 0,
    };
  }

  return safeRead("getHomeData", EMPTY_HOME, async () => {
    const [featuredRows, news, guides, destinations, events, routeItems, totalPublished] =
      await Promise.all([
        summaryQuery(db, locale)
          .where(and(visibilityWhere(locale, preview), eq(entries.isFeatured, true)))
          .orderBy(desc(entryTranslations.publishedAt))
          .limit(5),
        listEntries(locale, { types: ["news"], limit: 6, preview }),
        listEntries(locale, { types: ["article", "guide"], limit: 6, preview }),
        listEntries(locale, { types: ["destination", "place"], limit: 6, preview }),
        listUpcomingEvents(locale, 6, preview),
        listEntries(locale, { types: ["route"], limit: 4, preview }),
        countEntries(locale, { preview }),
      ]);

    return {
      featured: featuredRows.map((r) => mapSummary(r as SummaryRow, locale)),
      news,
      guides,
      destinations,
      events,
      routes: routeItems,
      totalPublished,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Block dependencies                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Loads every media row referenced by a body so the renderer never issues a
 * query per block. The page resolves once and passes the map down.
 */
export async function getMediaByIds(
  ids: string[],
  locale: Locale,
): Promise<Map<string, MediaView>> {
  const db = getDb();
  const out = new Map<string, MediaView>();
  if (!db || ids.length === 0) return out;

  return safeRead("getMediaByIds", new Map<string, MediaView>(), async () => {
    const rows = await db.select().from(media).where(inArray(media.id, ids));
    for (const row of rows) {
      const view = mapMedia(row, locale);
      if (view) out.set(row.id, view);
    }
    return out;
  });
}

/** Media ids referenced anywhere inside a body, deduplicated. */
export function mediaIdsInBody(body: ReturnType<typeof parseBody>): string[] {
  const ids = new Set<string>();
  for (const block of body) {
    if (block.type === "image") ids.add(block.mediaId);
    if (block.type === "gallery") for (const id of block.mediaIds) ids.add(id);
    if (block.type === "steps") {
      for (const step of block.items) if (step.mediaId) ids.add(step.mediaId);
    }
  }
  return [...ids];
}

/** Entry ids referenced by relatedLinks blocks. */
export function relatedIdsInBody(body: ReturnType<typeof parseBody>): string[] {
  const ids = new Set<string>();
  for (const block of body) {
    if (block.type === "relatedLinks") for (const id of block.entryIds) ids.add(id);
  }
  return [...ids];
}

/**
 * Whether the topic and author indexes have anything to show.
 *
 * Both render an empty listing until there are tagged entries or real authors,
 * and both are already excluded from the sitemap for that reason. These let the
 * footer make the same decision, so the site never links from every page to a
 * page with twenty words on it.
 */
export async function hasAnyTags(locale: Locale): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  return safeRead("hasAnyTags", false, async () => {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(entryTags)
      .innerJoin(entryTranslations, eq(entryTranslations.entryId, entryTags.entryId))
      .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
      .where(publishedWhere(locale));
    return (rows[0]?.count ?? 0) > 0;
  });
}

export async function hasAnyAuthors(): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  return safeRead("hasAnyAuthors", false, async () => {
    const rows = await db.select({ count: sql<number>`count(*)::int` }).from(authors);
    return (rows[0]?.count ?? 0) > 0;
  });
}
