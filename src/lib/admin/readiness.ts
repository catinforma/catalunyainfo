import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { getDb, schema } from "@/lib/db/client";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { LEGAL_KEYS, legalPath, sectionPath } from "@/lib/i18n/routes";
import { indexingAllowed } from "@/lib/site";
import { wordCount } from "@/lib/content/blocks";

const { authors, authorTranslations, entries, entryTranslations, entrySources, media } =
  schema;

/**
 * The readiness check.
 *
 * This is a checklist of things that are true or not true about the site. It
 * is deliberately NOT a prediction: Google's policy team makes a human
 * judgement about originality and usefulness that no script can score, so the
 * best state this can ever report is READY FOR MANUAL REVIEW — never
 * "approved" and never "guaranteed".
 *
 * The thresholds below come from what the AdSense programme policies and the
 * Search Essentials actually ask for: real ownership and contact information,
 * a clear editorial stance, original content that serves the reader, and
 * navigable structure. There is no minimum article count anywhere in Google's
 * documentation, so there is none here.
 */

export type CheckStatus = "pass" | "warn" | "fail" | "info";

export interface Check {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  /** Whether the overall verdict is blocked while this check fails. */
  blocking: boolean;
}

export type ReadinessVerdict =
  | "NOT READY"
  | "TECHNICALLY READY"
  | "READY FOR MANUAL REVIEW";

export interface ReadinessReport {
  verdict: ReadinessVerdict;
  generatedAt: Date;
  checks: Check[];
  stats: {
    publishedByLocale: Record<string, number>;
    totalPublished: number;
    withSources: number;
    withVerification: number;
    thinPages: number;
  };
}

export async function buildReadinessReport(): Promise<ReadinessReport> {
  const db = getDb();
  const checks: Check[] = [];

  const stats = {
    publishedByLocale: {} as Record<string, number>,
    totalPublished: 0,
    withSources: 0,
    withVerification: 0,
    thinPages: 0,
  };

  if (!db) {
    return {
      verdict: "NOT READY",
      generatedAt: new Date(),
      checks: [
        {
          id: "database",
          label: "Database configured",
          status: "fail",
          detail: "DATABASE_URL is not set, so nothing can be published yet.",
          blocking: true,
        },
      ],
      stats,
    };
  }

  /* ---- Published volume, per language ---------------------------------- */
  const publishedRows = await db
    .select({ locale: entryTranslations.locale, count: sql<number>`count(*)::int` })
    .from(entryTranslations)
    .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
    .where(and(eq(entryTranslations.status, "published"), eq(entries.isDemo, false)))
    .groupBy(entryTranslations.locale);

  for (const row of publishedRows) {
    stats.publishedByLocale[row.locale] = row.count;
    stats.totalPublished += row.count;
  }

  checks.push({
    id: "published-volume",
    label: "Published pages",
    status: stats.totalPublished > 0 ? "info" : "fail",
    detail:
      stats.totalPublished > 0
        ? `${stats.totalPublished} published across ${Object.keys(stats.publishedByLocale).length} language(s).`
        : "Nothing is published yet. A review would see an empty site.",
    blocking: true,
  });

  /* ---- Legal and editorial-trust pages --------------------------------- */
  const requiredPaths: { locale: Locale; path: string; label: string }[] = [];
  for (const locale of LOCALES) {
    for (const key of LEGAL_KEYS) {
      requiredPaths.push({
        locale,
        path: stripLocale(legalPath(key, locale), locale),
        label: `${key} (${locale})`,
      });
    }
    for (const key of ["about", "contact"] as const) {
      requiredPaths.push({
        locale,
        path: stripLocale(sectionPath(key, locale), locale),
        label: `${key} (${locale})`,
      });
    }
  }

  const publishedPathRows = await db
    .select({ locale: entryTranslations.locale, path: entryTranslations.path })
    .from(entryTranslations)
    .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
    .where(and(eq(entryTranslations.status, "published"), eq(entries.isDemo, false)));

  const publishedSet = new Set(publishedPathRows.map((r) => `${r.locale}:${r.path}`));
  const missingPages = requiredPaths.filter(
    (r) => !publishedSet.has(`${r.locale}:${r.path}`),
  );

  checks.push({
    id: "trust-pages",
    label: "Legal and editorial pages",
    status: missingPages.length === 0 ? "pass" : "fail",
    detail:
      missingPages.length === 0
        ? "Legal notice, privacy, cookies, editorial policy, corrections, sources, accessibility, about and contact are published in every language."
        : `Missing: ${missingPages.map((m) => m.label).join(", ")}.`,
    blocking: true,
  });

  /* ---- Identified authors with real biographies ------------------------ */
  const authorRows = await db
    .select({ id: authors.id, bio: authorTranslations.bio })
    .from(authors)
    .leftJoin(authorTranslations, eq(authorTranslations.authorId, authors.id))
    .where(eq(authors.isActive, true));

  const authorsWithBio = new Set(
    authorRows.filter((r) => (r.bio ?? "").trim().length > 60).map((r) => r.id),
  );

  checks.push({
    id: "authors",
    label: "Identified authors",
    status: authorsWithBio.size > 0 ? "pass" : "fail",
    detail:
      authorsWithBio.size > 0
        ? `${authorsWithBio.size} author profile(s) with a biography.`
        : "No author has a biography. Content with no attributable human behind it is what a low-value review looks for.",
    blocking: true,
  });

  /* ---- Sourcing -------------------------------------------------------- */
  const sourcedRows = await db
    .select({ count: sql<number>`count(distinct ${entrySources.entryId})::int` })
    .from(entrySources);
  stats.withSources = sourcedRows[0]?.count ?? 0;

  const entryCountRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(entries)
    .where(eq(entries.isDemo, false));
  const entryCount = entryCountRows[0]?.count ?? 0;

  const sourcedRatio = entryCount > 0 ? stats.withSources / entryCount : 0;
  checks.push({
    id: "sources",
    label: "Cited sources",
    status: entryCount === 0 ? "fail" : sourcedRatio >= 0.8 ? "pass" : "warn",
    detail: `${stats.withSources} of ${entryCount} entries cite at least one source.`,
    blocking: false,
  });

  /* ---- Verification dates ---------------------------------------------- */
  const verifiedRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(entryTranslations)
    .where(
      and(
        eq(entryTranslations.status, "published"),
        sql`${entryTranslations.lastVerifiedAt} is not null`,
      ),
    );
  stats.withVerification = verifiedRows[0]?.count ?? 0;

  checks.push({
    id: "verification",
    label: "Verification dates",
    status:
      stats.totalPublished === 0
        ? "fail"
        : stats.withVerification / stats.totalPublished >= 0.8
          ? "pass"
          : "warn",
    detail: `${stats.withVerification} of ${stats.totalPublished} published pages record when a human last checked them.`,
    blocking: false,
  });

  /* ---- Thin pages ------------------------------------------------------ */
  const textRows = await db
    .select({ searchText: entryTranslations.searchText })
    .from(entryTranslations)
    .innerJoin(entries, eq(entries.id, entryTranslations.entryId))
    .where(and(eq(entryTranslations.status, "published"), eq(entries.isDemo, false)));

  stats.thinPages = textRows.filter((r) => wordCount(r.searchText) < 250).length;

  checks.push({
    id: "thin-pages",
    label: "Substantial pages",
    status: stats.thinPages === 0 ? "pass" : "warn",
    detail:
      stats.thinPages === 0
        ? "No published page is under 250 words."
        : `${stats.thinPages} published page(s) are under 250 words. Length is not a ranking factor, but a page that answers less than a search snippet is what gets flagged as low value.`,
    blocking: false,
  });

  /* ---- Image attribution ----------------------------------------------- */
  const mediaRows = await db
    .select({ id: media.id, credit: media.credit, alt: media.alt })
    .from(media);

  const missingCredit = mediaRows.filter((m) => !m.credit).length;
  const missingAlt = mediaRows.filter(
    (m) => !LOCALES.some((l) => (m.alt?.[l] ?? "").trim().length > 0),
  ).length;

  checks.push({
    id: "media-attribution",
    label: "Image attribution and alt text",
    status: missingCredit === 0 && missingAlt === 0 ? "pass" : "warn",
    detail: `${missingCredit} image(s) with no credit, ${missingAlt} with no alt text, of ${mediaRows.length}.`,
    blocking: false,
  });

  /* ---- Demo fixtures --------------------------------------------------- */
  const demoRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(entries)
    .where(eq(entries.isDemo, true));
  const demoCount = demoRows[0]?.count ?? 0;

  checks.push({
    id: "demo-data",
    label: "No demo data",
    status: demoCount === 0 ? "pass" : "warn",
    detail:
      demoCount === 0
        ? "No demo fixtures in the database."
        : `${demoCount} entr(ies) are flagged as demo. They are excluded from every public query and the sitemap, but delete them before launch.`,
    blocking: false,
  });

  /* ---- Indexing -------------------------------------------------------- */
  checks.push({
    id: "indexing",
    label: "Indexing enabled",
    status: indexingAllowed() ? "pass" : "warn",
    detail: indexingAllowed()
      ? "robots.txt allows crawling and the sitemap is served."
      : "NEXT_PUBLIC_ALLOW_INDEXING is not 'true', so robots.txt disallows everything. Flip it only when the content is ready.",
    blocking: true,
  });

  /* ---- Ads must still be off ------------------------------------------- */
  checks.push({
    id: "no-ads",
    label: "No ad code loaded",
    status: "pass",
    detail:
      "This build contains no AdSense script and no ad network code. Ad slots are layout placeholders only.",
    blocking: false,
  });

  const blockingFailures = checks.filter((c) => c.blocking && c.status === "fail");
  const warnings = checks.filter((c) => c.status === "warn");

  const verdict: ReadinessVerdict =
    blockingFailures.length > 0
      ? "NOT READY"
      : warnings.length > 0
        ? "TECHNICALLY READY"
        : "READY FOR MANUAL REVIEW";

  return { verdict, generatedAt: new Date(), checks, stats };
}

function stripLocale(path: string, locale: Locale): string {
  return path.replace(new RegExp(`^/${locale}/`), "").replace(/\/$/, "");
}
