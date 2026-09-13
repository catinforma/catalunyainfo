/**
 * Publishes the weekend guide in Catalan, Spanish and English.
 *
 * Idempotent: it upserts one `entries` row keyed `weekend-guide-catalunya` plus
 * one `entry_translations` row per locale, so re-running it updates the same
 * three evergreen URLs instead of creating new ones. That is the whole point of
 * the dateless paths — next week's edition is another run of this script.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node --experimental-strip-types scripts/publish-weekend-guide.ts
 */

import { and, eq } from "drizzle-orm";

import { requireDb, schema } from "../src/lib/db/client.ts";
import { bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { COPY, PLANS, SOURCES } from "./content/weekend-2026-09-19.ts";

const ENTRY_KEY = "weekend-guide-catalunya";

/**
 * The page is dated for the weekend it covers. It is written as "now" when that
 * is later, because a translation whose `published_at` lies in the future is
 * filtered out of every public query and the sitemap - a future date would make
 * the page invisible rather than scheduled.
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

export function buildBody(locale: Locale): Block[] {
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
    blocks.push({
      type: "heading",
      level: 3,
      text: `${index + 1}. ${plan.title[locale]}`,
    });
    for (const paragraph of plan.body[locale]) {
      blocks.push({ type: "paragraph", text: paragraph });
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

async function main() {
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
  console.log(`sources: ${sourceIds.length}`);

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
      .set({ primaryCategoryId: categoryId, isFeatured: true, updatedAt: now })
      .where(eq(schema.entries.id, entryId));
  } else {
    const inserted = await db
      .insert(schema.entries)
      .values({
        // `article`, not `event`: the page covers 25 separate events, so a
        // single Event node would misdescribe it. Article schema is emitted.
        type: "article",
        key: ENTRY_KEY,
        primaryCategoryId: categoryId,
        isFeatured: true,
        isDemo: false,
      })
      .returning({ id: schema.entries.id });
    entryId = inserted[0]?.id;
  }
  if (!entryId) throw new Error("could not create the entry");
  console.log(`entry: ${entryId}`);

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
  for (const locale of LOCALES) {
    const copy = COPY[locale];
    const body = buildBody(locale);
    const searchText = bodyToPlainText(body);
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
      searchText,
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
      console.log(`${locale}: updated  /${locale}/${copy.path}/  (${body.length} blocks)`);
    } else {
      await db.insert(schema.entryTranslations).values(values);
      console.log(`${locale}: created  /${locale}/${copy.path}/  (${body.length} blocks)`);
    }
  }

  console.log(`\npublished_at: ${publishedAt.toISOString()}`);
  console.log(`last_verified_at: ${LAST_VERIFIED.toISOString()}`);
  console.log(`plans per edition: ${PLANS.length}`);
  process.exit(0);
}

// Only run when executed directly, so the body builder can be unit-tested
// without a database.
const executedDirectly =
  process.argv[1] !== undefined && process.argv[1].endsWith("publish-weekend-guide.ts");

if (executedDirectly) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
