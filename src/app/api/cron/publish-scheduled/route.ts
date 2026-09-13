import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { and, eq, isNotNull, lte, sql } from "drizzle-orm";
import { timingSafeEqual } from "node:crypto";

import { getDb, schema } from "@/lib/db/client";
import { pruneExpiredSessions } from "@/lib/auth/session";

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

  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, reason: "no-database" }, { status: 503 });

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
    revalidatePath(`/${row.locale}`);
    revalidatePath(`/${row.locale}/${row.path}`);
  }
  if (due.length > 0) revalidatePath("/sitemap.xml");

  const sessionsPruned = await pruneExpiredSessions();

  return NextResponse.json({
    ok: true,
    published: due.length,
    flaggedForUpdate: stale.length,
    sessionsPruned,
  });
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
