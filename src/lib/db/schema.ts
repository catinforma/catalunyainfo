import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const localeEnum = pgEnum("locale", ["ca", "es", "en"]);

/**
 * Editorial workflow. `needs_update` is deliberately a first-class state: a
 * guide whose facts have gone stale is worse than no guide, and this is what
 * drives the "last verified" surface on the front end.
 */
export const entryStatusEnum = pgEnum("entry_status", [
  "draft",
  "review",
  "ready",
  "scheduled",
  "published",
  "needs_update",
  "archived",
]);

export const entryTypeEnum = pgEnum("entry_type", [
  "news",
  "article",
  "guide",
  "destination",
  "place",
  "event",
  "route",
  "page",
]);

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "editor",
  "author",
  "viewer",
]);

export const sourceTypeEnum = pgEnum("source_type", [
  "official",
  "primary",
  "press",
  "academic",
  "own_reporting",
  "other",
]);

export const redirectKindEnum = pgEnum("redirect_kind", [
  "permanent",
  "temporary",
  "gone",
]);

export const placeKindEnum = pgEnum("place_kind", [
  "region",
  "comarca",
  "municipality",
  "neighbourhood",
  "natural_park",
  "beach",
  "mountain",
  "monument",
  "museum",
  "venue",
  "transport_hub",
  "other",
]);

export const relationKindEnum = pgEnum("relation_kind", [
  "related",
  "part_of",
  "nearby",
  "supersedes",
  "see_also",
]);

/* -------------------------------------------------------------------------- */
/* Accounts and auth                                                          */
/* -------------------------------------------------------------------------- */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("author"),
    isActive: boolean("is_active").notNull().default(true),
    /** Public byline this account writes under, when it has one. */
    authorId: uuid("author_id"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_key").on(sql`lower(${t.email})`)],
);

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 of the opaque cookie token. The raw token is never stored. */
    tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    userAgent: varchar("user_agent", { length: 400 }),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 60 }).notNull(),
    entityId: varchar("entity_id", { length: 80 }),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

/* -------------------------------------------------------------------------- */
/* Public authors                                                             */
/* -------------------------------------------------------------------------- */

export const authors = pgTable(
  "authors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 255 }),
    avatarMediaId: uuid("avatar_media_id"),
    /** Public profile links: { x, linkedin, mastodon, website }. */
    links: jsonb("links").$type<Record<string, string>>().notNull().default({}),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("authors_slug_key").on(t.slug)],
);

/** Localised biography. E-E-A-T signals live here, so it is per-language. */
export const authorTranslations = pgTable(
  "author_translations",
  {
    authorId: uuid("author_id")
      .notNull()
      .references(() => authors.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    jobTitle: varchar("job_title", { length: 160 }),
    bio: text("bio"),
    expertise: text("expertise"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.authorId, t.locale] })],
);

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull().default("image/jpeg"),
    width: integer("width"),
    height: integer("height"),
    /** Tiny base64 LQIP used as next/image blurDataURL to protect CLS. */
    blurDataUrl: text("blur_data_url"),
    /** Attribution is mandatory for copyright hygiene and AdSense review. */
    credit: varchar("credit", { length: 240 }),
    creditUrl: text("credit_url"),
    license: varchar("license", { length: 120 }),
    /** Localised alt text, keyed by locale. */
    alt: jsonb("alt")
      .$type<Partial<Record<"ca" | "es" | "en", string>>>()
      .notNull()
      .default({}),
    caption: jsonb("caption")
      .$type<Partial<Record<"ca" | "es" | "en", string>>>()
      .notNull()
      .default({}),
    focalX: doublePrecision("focal_x").notNull().default(0.5),
    focalY: doublePrecision("focal_y").notNull().default(0.5),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("media_created_idx").on(t.createdAt)],
);

/* -------------------------------------------------------------------------- */
/* Taxonomy                                                                   */
/* -------------------------------------------------------------------------- */

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Stable language-independent key, e.g. "transport". */
    key: varchar("key", { length: 120 }).notNull(),
    /** Which hub this category hangs from: news | guides | destinations | ... */
    section: varchar("section", { length: 40 }).notNull(),
    parentId: uuid("parent_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("categories_key_key").on(t.key)],
);

export const categoryTranslations = pgTable(
  "category_translations",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
    description: text("description"),
    seoTitle: varchar("seo_title", { length: 200 }),
    seoDescription: varchar("seo_description", { length: 400 }),
  },
  (t) => [
    primaryKey({ columns: [t.categoryId, t.locale] }),
    uniqueIndex("category_slug_locale_key").on(t.locale, t.slug),
  ],
);

/** Controlled vocabulary. Editors pick from it; they cannot invent tags freely. */
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 120 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [uniqueIndex("tags_key_key").on(t.key)],
);

export const tagTranslations = pgTable(
  "tag_translations",
  {
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.tagId, t.locale] }),
    uniqueIndex("tag_slug_locale_key").on(t.locale, t.slug),
  ],
);

/* -------------------------------------------------------------------------- */
/* Sources                                                                    */
/* -------------------------------------------------------------------------- */

export const sources = pgTable(
  "sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 240 }).notNull(),
    publisher: varchar("publisher", { length: 240 }),
    url: text("url"),
    type: sourceTypeEnum("type").notNull().default("official"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sources_name_idx").on(t.name)],
);

/* -------------------------------------------------------------------------- */
/* Entries: the language-independent work                                     */
/* -------------------------------------------------------------------------- */

export const entries = pgTable(
  "entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: entryTypeEnum("type").notNull(),
    /** Stable human key, handy for imports and cross-references. */
    key: varchar("key", { length: 160 }),
    primaryCategoryId: uuid("primary_category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    authorId: uuid("author_id").references(() => authors.id, { onDelete: "set null" }),
    heroMediaId: uuid("hero_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    /** Nests content under a parent: Montserrat -> "how to get there". */
    parentId: uuid("parent_id"),
    isFeatured: boolean("is_featured").notNull().default(false),
    /**
     * DEMO/fixture flag. Rows with this set are excluded from every public
     * query and from the sitemap, in every environment. Production refuses to
     * render them at all.
     */
    isDemo: boolean("is_demo").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("entries_key_key").on(t.key),
    index("entries_type_idx").on(t.type),
    index("entries_parent_idx").on(t.parentId),
  ],
);

/**
 * One row per language edition. Status, slug, SEO and dates are per-language,
 * so Catalan can be live while English is still in review.
 */
export const entryTranslations = pgTable(
  "entry_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    status: entryStatusEnum("status").notNull().default("draft"),

    title: varchar("title", { length: 300 }).notNull(),
    /** Last path segment. */
    slug: varchar("slug", { length: 200 }).notNull(),
    /** Full path after the locale prefix, no leading or trailing slash. */
    path: varchar("path", { length: 600 }).notNull(),
    excerpt: text("excerpt"),
    /** Ordered array of typed blocks. See lib/content/blocks.ts. */
    body: jsonb("body").$type<unknown[]>().notNull().default([]),
    /** Plain-text projection of body, kept for search and reading time. */
    searchText: text("search_text").notNull().default(""),

    seoTitle: varchar("seo_title", { length: 200 }),
    seoDescription: varchar("seo_description", { length: 400 }),
    /** Set only to point at a different URL; self-canonical is the default. */
    canonicalUrl: text("canonical_url"),
    noindex: boolean("noindex").notNull().default(false),
    ogMediaId: uuid("og_media_id").references(() => media.id, { onDelete: "set null" }),

    publishedAt: timestamp("published_at", { withTimezone: true }),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    /** When a human last checked the facts. Drives the freshness surface. */
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    /** Optional reminder date that flips the entry to needs_update. */
    reviewDueAt: timestamp("review_due_at", { withTimezone: true }),

    translatedFromLocale: localeEnum("translated_from_locale"),
    translatorNote: text("translator_note"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("entry_translation_locale_key").on(t.entryId, t.locale),
    uniqueIndex("entry_path_locale_key").on(t.locale, t.path),
    index("entry_status_idx").on(t.status, t.locale),
    index("entry_published_idx").on(t.publishedAt),
    index("entry_scheduled_idx").on(t.scheduledFor),
  ],
);

/** Immutable snapshots for rollback and accountability. */
export const entryRevisions = pgTable(
  "entry_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    translationId: uuid("translation_id")
      .notNull()
      .references(() => entryTranslations.id, { onDelete: "cascade" }),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    note: varchar("note", { length: 300 }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("revisions_translation_idx").on(t.translationId, t.createdAt)],
);

/* -------------------------------------------------------------------------- */
/* Join tables                                                                */
/* -------------------------------------------------------------------------- */

export const entryCategories = pgTable(
  "entry_categories",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.entryId, t.categoryId] })],
);

export const entryTags = pgTable(
  "entry_tags",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.entryId, t.tagId] })],
);

export const entrySources = pgTable(
  "entry_sources",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    note: varchar("note", { length: 300 }),
    accessedAt: timestamp("accessed_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.entryId, t.sourceId] })],
);

export const entryRelations = pgTable(
  "entry_relations",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    relatedEntryId: uuid("related_entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    kind: relationKindEnum("kind").notNull().default("related"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.entryId, t.relatedEntryId, t.kind] })],
);

/* -------------------------------------------------------------------------- */
/* Type-specific extensions                                                   */
/* -------------------------------------------------------------------------- */

/** Backs both `destination` (an area) and `place` (a point of interest). */
export const places = pgTable(
  "places",
  {
    entryId: uuid("entry_id")
      .primaryKey()
      .references(() => entries.id, { onDelete: "cascade" }),
    kind: placeKindEnum("kind").notNull().default("other"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    comarca: varchar("comarca", { length: 120 }),
    municipality: varchar("municipality", { length: 160 }),
    postalCode: varchar("postal_code", { length: 12 }),
    streetAddress: varchar("street_address", { length: 300 }),
    /** Canonical public-administration page for this place. */
    officialUrl: text("official_url"),
    /** schema.org openingHoursSpecification-shaped payload. */
    openingHours: jsonb("opening_hours").$type<unknown[]>().notNull().default([]),
    /** { currency, adult, reduced, free, note } */
    pricing: jsonb("pricing").$type<Record<string, unknown>>(),
    accessibility: jsonb("accessibility").$type<Record<string, unknown>>(),
  },
  (t) => [index("places_geo_idx").on(t.latitude, t.longitude)],
);

export const events = pgTable(
  "events",
  {
    entryId: uuid("entry_id")
      .primaryKey()
      .references(() => entries.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    isAllDay: boolean("is_all_day").notNull().default(false),
    /** RFC 5545 RRULE for recurring events, when applicable. */
    recurrenceRule: varchar("recurrence_rule", { length: 300 }),
    venueEntryId: uuid("venue_entry_id"),
    venueName: varchar("venue_name", { length: 240 }),
    ticketUrl: text("ticket_url"),
    isFree: boolean("is_free").notNull().default(false),
    organiser: varchar("organiser", { length: 240 }),
  },
  (t) => [index("events_starts_idx").on(t.startsAt)],
);

export const routes = pgTable("routes", {
  entryId: uuid("entry_id")
    .primaryKey()
    .references(() => entries.id, { onDelete: "cascade" }),
  distanceMetres: integer("distance_metres"),
  ascentMetres: integer("ascent_metres"),
  descentMetres: integer("descent_metres"),
  durationMinutes: integer("duration_minutes"),
  /** 1 = easy ... 5 = very hard. */
  difficulty: smallint("difficulty"),
  isCircular: boolean("is_circular").notNull().default(false),
  gpxUrl: text("gpx_url"),
  startEntryId: uuid("start_entry_id"),
});

/* -------------------------------------------------------------------------- */
/* Redirects                                                                  */
/* -------------------------------------------------------------------------- */

export const redirects = pgTable(
  "redirects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Source path including leading slash, without the origin. */
    fromPath: varchar("from_path", { length: 600 }).notNull(),
    toPath: varchar("to_path", { length: 600 }),
    kind: redirectKindEnum("kind").notNull().default("permanent"),
    note: varchar("note", { length: 300 }),
    hits: integer("hits").notNull().default(0),
    lastHitAt: timestamp("last_hit_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("redirects_from_key").on(t.fromPath)],
);

/* -------------------------------------------------------------------------- */
/* Page-level feedback                                                        */
/* -------------------------------------------------------------------------- */

export const pageFeedback = pgTable(
  "page_feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    path: varchar("path", { length: 600 }).notNull(),
    locale: localeEnum("locale").notNull(),
    isUseful: boolean("is_useful").notNull(),
    /** Free-text correction report. Never store PII here. */
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("feedback_path_idx").on(t.path, t.createdAt)],
);

/* -------------------------------------------------------------------------- */
/* Inferred types                                                             */
/* -------------------------------------------------------------------------- */

export type User = typeof users.$inferSelect;
export type Author = typeof authors.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type EntryTranslation = typeof entryTranslations.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type MediaRow = typeof media.$inferSelect;
export type SourceRow = typeof sources.$inferSelect;
export type RedirectRow = typeof redirects.$inferSelect;
export type PlaceRow = typeof places.$inferSelect;
export type EventRow = typeof events.$inferSelect;
export type RouteRow = typeof routes.$inferSelect;
export type EntryStatus = (typeof entryStatusEnum.enumValues)[number];
export type EntryType = (typeof entryTypeEnum.enumValues)[number];
export type UserRole = (typeof userRoleEnum.enumValues)[number];
