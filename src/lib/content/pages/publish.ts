import "server-only";

import { and, eq } from "drizzle-orm";

import { requireDb, schema } from "@/lib/db/client";
import { bodyToPlainText } from "@/lib/content/blocks";
import { editionFingerprint, editionUpdatedAt } from "@/lib/seo/article-dates";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import {
  ACCESSIBILITY,
  CORRECTIONS,
  EDITORIAL_POLICY,
  LEGAL_HUB,
  LEGAL_NOTICE,
  SOURCES_PAGE,
} from "./legal";
import { COOKIES_PAGE, PRIVACY } from "./privacy";
import { ABOUT, CONTACT } from "./institutional";
import type { PageSpec } from "./types";

/**
 * Publishes the institutional pages.
 *
 * These were the site's worst defect: the footer linked to them, the sitemap
 * listed all thirty of them, and every one returned 404. They are ordinary
 * `page` entries so an editor can reword them afterwards without a deploy -
 * running this again overwrites the body, which is why it is called explicitly
 * rather than on every publish of everything.
 */

export const PAGES: PageSpec[] = [
  LEGAL_HUB,
  LEGAL_NOTICE,
  PRIVACY,
  COOKIES_PAGE,
  EDITORIAL_POLICY,
  CORRECTIONS,
  SOURCES_PAGE,
  ACCESSIBILITY,
  ABOUT,
  CONTACT,
];

const PUBLISHED = new Date("2026-09-15T09:00:00+02:00");

export interface PagesResult {
  pages: { key: string; locale: Locale; path: string; action: "created" | "updated" }[];
}

/** `keys` limits the run to those entries (e.g. only the about page), so other pages' CMS edits are not overwritten. */
export async function publishInstitutionalPages(keys?: readonly string[]): Promise<PagesResult> {
  const db = requireDb();
  const now = new Date();
  const publishedAt = PUBLISHED > now ? now : PUBLISHED;
  const result: PagesResult = { pages: [] };

  for (const spec of keys ? PAGES.filter((p) => keys.includes(p.key)) : PAGES) {
    /* ---- Entry ---------------------------------------------------------- */
    const entryRows = await db
      .select({ id: schema.entries.id })
      .from(schema.entries)
      .where(eq(schema.entries.key, spec.key))
      .limit(1);

    let entryId = entryRows[0]?.id;
    if (entryId) {
      // No `updatedAt: now`: entries.updated_at is the sitemap's "a reader-visible
      // change was published" date (lib/seo/body-dates.ts), and a policy page's
      // wording change already dates its translation with this publish.
      await db
        .update(schema.entries)
        .set({ type: "page", isFeatured: false, isDemo: false })
        .where(eq(schema.entries.id, entryId));
    } else {
      const inserted = await db
        .insert(schema.entries)
        .values({ type: "page", key: spec.key, isFeatured: false, isDemo: false })
        .returning({ id: schema.entries.id });
      entryId = inserted[0]?.id;
    }
    if (!entryId) throw new Error(`could not create entry ${spec.key}`);

    /* ---- Translations --------------------------------------------------- */
    for (const locale of LOCALES) {
      const copy = spec.copy[locale];
      const path = spec.path[locale];
      const slug = path.split("/").filter(Boolean).at(-1) ?? path;

      const values = {
        entryId,
        locale,
        status: "published" as const,
        title: copy.title,
        slug,
        path,
        excerpt: copy.excerpt,
        body: copy.blocks as unknown[],
        searchText: bodyToPlainText(copy.blocks),
        seoTitle: copy.seoTitle,
        seoDescription: copy.seoDescription,
        canonicalUrl: null,
        noindex: false,
        publishedAt,
        // Legal pages state their own verification date on the page furniture,
        // so this is the date the current wording was last checked.
        lastVerifiedAt: spec.verifiedAt ? new Date(`${spec.verifiedAt}T12:00:00+01:00`) : publishedAt,
      };

      const existing = await db
        .select({
          id: schema.entryTranslations.id,
          updatedAt: schema.entryTranslations.updatedAt,
          title: schema.entryTranslations.title,
          excerpt: schema.entryTranslations.excerpt,
          seoTitle: schema.entryTranslations.seoTitle,
          seoDescription: schema.entryTranslations.seoDescription,
          body: schema.entryTranslations.body,
        })
        .from(schema.entryTranslations)
        .where(
          and(
            eq(schema.entryTranslations.entryId, entryId),
            eq(schema.entryTranslations.locale, locale),
          ),
        )
        .limit(1);

      // Moves only when the wording changes (lib/seo/article-dates.ts); a
      // re-send no longer stamps the page "updated today".
      const previous = existing[0];
      const updatedAt = editionUpdatedAt({
        now,
        publishedAt,
        // A policy page has no facts to re-verify: a change in its wording is
        // the update, dated by this publish; an identical re-send keeps the old date.
        verifiedAt: now,
        fingerprint: editionFingerprint({ ...copy, body: copy.blocks }),
        previous: previous ? { updatedAt: previous.updatedAt, fingerprint: editionFingerprint(previous) } : null,
      });

      if (existing[0]) {
        await db
          .update(schema.entryTranslations)
          .set({ ...values, updatedAt })
          .where(eq(schema.entryTranslations.id, existing[0].id));
        result.pages.push({ key: spec.key, locale, path, action: "updated" });
      } else {
        await db.insert(schema.entryTranslations).values({ ...values, updatedAt });
        result.pages.push({ key: spec.key, locale, path, action: "created" });
      }
    }
  }

  return result;
}
