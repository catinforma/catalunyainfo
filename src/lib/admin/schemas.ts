import { z } from "zod";

import { bodySchema } from "@/lib/content/blocks";
import { LOCALES } from "@/lib/i18n/config";

/**
 * Every write into the CMS is validated here before it reaches the database.
 * Server actions are public endpoints, so nothing is trusted because it came
 * from our own form.
 */

export const localeSchema = z.enum(LOCALES);

export const entryStatusSchema = z.enum([
  "draft",
  "review",
  "ready",
  "scheduled",
  "published",
  "needs_update",
  "archived",
]);

export const entryTypeSchema = z.enum([
  "news",
  "article",
  "guide",
  "destination",
  "place",
  "event",
  "route",
  "page",
]);

const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens");

const pathSchema = z
  .string()
  .max(600)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
    "Use lowercase segments separated by slashes, with no leading or trailing slash",
  );

const optionalDate = z
  .union([z.string().length(0), z.iso.datetime({ local: true }), z.iso.date()])
  .optional()
  .transform((v) => (v && v.length > 0 ? new Date(v) : null));

export const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(1).max(200),
  next: z.string().max(400).optional(),
});

export const entryMetaSchema = z.object({
  entryId: z.uuid().optional(),
  type: entryTypeSchema,
  key: z.string().max(160).optional().nullable(),
  primaryCategoryId: z.uuid().nullable().optional(),
  authorId: z.uuid().nullable().optional(),
  heroMediaId: z.uuid().nullable().optional(),
  parentId: z.uuid().nullable().optional(),
  isFeatured: z.boolean().default(false),
  isDemo: z.boolean().default(false),
});

export const translationSchema = z.object({
  translationId: z.uuid().optional(),
  entryId: z.uuid(),
  locale: localeSchema,
  status: entryStatusSchema,
  title: z.string().min(1).max(300),
  slug: slugSchema,
  path: pathSchema,
  excerpt: z.string().max(600).nullable().optional(),
  body: bodySchema,
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(400).nullable().optional(),
  canonicalUrl: z.url().max(600).nullable().optional(),
  noindex: z.boolean().default(false),
  ogMediaId: z.uuid().nullable().optional(),
  publishedAt: optionalDate,
  scheduledFor: optionalDate,
  lastVerifiedAt: optionalDate,
  reviewDueAt: optionalDate,
  translatedFromLocale: localeSchema.nullable().optional(),
  translatorNote: z.string().max(2000).nullable().optional(),
  tagIds: z.array(z.uuid()).max(30).default([]),
  categoryIds: z.array(z.uuid()).max(10).default([]),
  sources: z
    .array(
      z.object({
        sourceId: z.uuid(),
        note: z.string().max(300).nullable().optional(),
        accessedAt: optionalDate,
      }),
    )
    .max(40)
    .default([]),
  relatedEntryIds: z.array(z.uuid()).max(12).default([]),
});

export const mediaSchema = z.object({
  id: z.uuid().optional(),
  url: z.url().max(2000),
  mimeType: z.string().max(100).default("image/jpeg"),
  width: z.number().int().positive().max(20000).nullable().optional(),
  height: z.number().int().positive().max(20000).nullable().optional(),
  blurDataUrl: z.string().max(4000).nullable().optional(),
  credit: z.string().max(240).nullable().optional(),
  creditUrl: z.url().max(2000).nullable().optional(),
  license: z.string().max(120).nullable().optional(),
  alt: z.partialRecord(localeSchema, z.string().max(400)).default({}),
  caption: z.partialRecord(localeSchema, z.string().max(600)).default({}),
  focalX: z.number().min(0).max(1).default(0.5),
  focalY: z.number().min(0).max(1).default(0.5),
});

export const sourceSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1).max(240),
  publisher: z.string().max(240).nullable().optional(),
  url: z.url().max(2000).nullable().optional(),
  type: z.enum(["official", "primary", "press", "academic", "own_reporting", "other"]),
});

export const authorSchema = z.object({
  id: z.uuid().optional(),
  slug: slugSchema,
  name: z.string().min(1).max(160),
  email: z.email().max(255).nullable().optional(),
  avatarMediaId: z.uuid().nullable().optional(),
  links: z.record(z.string().max(40), z.url().max(500)).default({}),
  isActive: z.boolean().default(true),
  translations: z
    .array(
      z.object({
        locale: localeSchema,
        jobTitle: z.string().max(160).nullable().optional(),
        bio: z.string().max(2000).nullable().optional(),
        expertise: z.string().max(2000).nullable().optional(),
      }),
    )
    .max(3)
    .default([]),
});

export const redirectSchema = z.object({
  id: z.uuid().optional(),
  fromPath: z.string().min(1).max(600).startsWith("/"),
  toPath: z.string().max(600).startsWith("/").nullable().optional(),
  kind: z.enum(["permanent", "temporary", "gone"]),
  note: z.string().max(300).nullable().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type TranslationInput = z.infer<typeof translationSchema>;
export type EntryMetaInput = z.infer<typeof entryMetaSchema>;
export type MediaInput = z.infer<typeof mediaSchema>;
export type SourceInput = z.infer<typeof sourceSchema>;
export type AuthorInput = z.infer<typeof authorSchema>;
export type RedirectInput = z.infer<typeof redirectSchema>;
