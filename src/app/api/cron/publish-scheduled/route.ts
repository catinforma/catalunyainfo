import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";
import { and, eq, isNotNull, lte, sql } from "drizzle-orm";
import { timingSafeEqual } from "node:crypto";

import { getDb, schema } from "@/lib/db/client";
import { pruneExpiredSessions } from "@/lib/auth/session";
import { DAY_DEPENDENT_PATTERN } from "@/lib/content/day-dependent";
import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { holidayRefreshPaths } from "@/lib/programmatic/holidays/routing";
import { weekendRefreshPaths } from "@/lib/programmatic/weekend/routing";
import { purgeCdnPaths, type PurgeResult } from "@/lib/cdn/purge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { entryTranslations } = schema;

/**
 * Scheduled housekeeping, run by Vercel Cron (see vercel.json).
 *
 * Three jobs, all idempotent:
 *  1. publish anything whose scheduled time has passed;
 *  2. flag published pages whose re-verification date has passed as
 *     `needs_update`, so a stale page surfaces in the CMS instead of quietly
 *     ageing in public;
 *  3. delete expired sessions.
 *
 * Authorised with `CRON_SECRET`, compared in constant time. Vercel sends it as
 * a bearer token on cron invocations.
 */
export async function GET(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Every path revalidated here is purged at Cloudflare too (it caches HTML,
  // ops/vps/README.md section 10, and does not hear revalidatePath).
  const revalidated = new Set<string>();
  const revalidate = (path: string) => {
    revalidatePath(path);
    revalidated.add(path);
  };

  // The weekend zone pages (/ca/cap-de-setmana/, /es/fin-de-semana/) are
  // static code routes with the weekend's dates in their titles: rebuilt on
  // the night the weekend window changes and the night after, before the
  // database step so an outage there cannot leave a past weekend in a title.
  const weekendPaths = weekendRefreshPaths(todayInCatalonia());
  for (const path of weekendPaths) revalidate(path);
  // The town holiday pages (/ca/festius/<municipi>/, /es/festivos/<municipio>/)
  // name their next holiday: rebuilt the night after each of their holidays.
  const holidayPaths = holidayRefreshPaths(todayInCatalonia());
  for (const path of holidayPaths) revalidate(path);

  const db = getDb();
  if (!db) {
    const cdnPurge = await purgeCdn(revalidated);
    return NextResponse.json({ ok: false, reason: "no-database", cdnPurge }, { status: 503 });
  }

  const due = await db
    .update(entryTranslations)
    .set({ status: "published", publishedAt: sql`coalesce(${entryTranslations.publishedAt}, now())` })
    .where(
      and(
        eq(entryTranslations.status, "scheduled"),
        isNotNull(entryTranslations.scheduledFor),
        lte(entryTranslations.scheduledFor, sql`now()`),
      ),
    )
    .returning({ locale: entryTranslations.locale, path: entryTranslations.path });

  const stale = await db
    .update(entryTranslations)
    .set({ status: "needs_update" })
    .where(
      and(
        eq(entryTranslations.status, "published"),
        isNotNull(entryTranslations.reviewDueAt),
        lte(entryTranslations.reviewDueAt, sql`now()`),
      ),
    )
    .returning({ id: entryTranslations.id });

  for (const row of due) {
    revalidate(`/${row.locale}`);
    revalidate(`/${row.locale}/${row.path}`);
  }
  if (due.length > 0) revalidate("/sitemap.xml");

  // Content pages are cached for a day. The ones whose answer depends on
  // today's date are refreshed here, once, just after midnight in Madrid.
  // jsonb's text form puts a space after the colon; allow either.
  const pattern = DAY_DEPENDENT_PATTERN;
  const dayDependent = await db
    .select({ locale: entryTranslations.locale, path: entryTranslations.path })
    .from(entryTranslations)
    .where(and(eq(entryTranslations.status, "published"), sql`${entryTranslations.body}::text ~ ${pattern}`));
  for (const row of dayDependent) revalidate(`/${row.locale}/${row.path}`);
  for (const locale of ["ca", "es", "en"]) revalidate(`/${locale}`);

  const sessionsPruned = await pruneExpiredSessions();

  const cdnPurge = await purgeCdn(revalidated);

  return NextResponse.json({
    ok: true,
    published: due.length,
    refreshedForToday: dayDependent.length,
    weekendPagesRefreshed: weekendPaths.length,
    holidayPagesRefreshed: holidayPaths.length,
    flaggedForUpdate: stale.length,
    sessionsPruned,
    cdnPurge,
  });
}

/**
 * Purges the revalidated paths now (the result goes in the response) and once
 * more after the response: revalidatePath takes effect only when the handler
 * returns, so Cloudflare could re-cache an old page in between. No-op without
 * a token. After a Catalonia-wide holiday the town pages alone are ~1,900
 * URLs, which purge.ts turns into one purge-everything call.
 */
async function purgeCdn(paths: Set<string>): Promise<PurgeResult> {
  const result = await purgeCdnPaths(paths, { label: "cron" });
  if (!result.skipped) {
    after(async () => {
      await purgeCdnPaths(paths, { label: "cron (after revalidation)" });
    });
  }
  return result;
}

function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
