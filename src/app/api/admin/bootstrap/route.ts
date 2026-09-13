import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireDb } from "@/lib/db/client";
import { seedTaxonomy } from "@/lib/content/seed-taxonomy";
import { publishWeekendGuide } from "@/lib/content/weekend/publish";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * One-off bootstrap endpoint.
 *
 * Vercel keeps the Neon credentials as production secrets that cannot be pulled
 * to a developer machine, so the initial schema has to be applied from inside a
 * deployment, where `DATABASE_URL` is injected. This route applies the
 * generated migration, then seeds the taxonomy.
 *
 * It is guarded by `CRON_SECRET`, compared in constant time, and every
 * statement is idempotent-tolerant: an object that already exists is skipped
 * rather than failing the run, so calling it twice is safe.
 *
 * DELETE THIS ROUTE once the schema is in place. An endpoint that can execute
 * DDL is not something to leave standing.
 */

function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const a = Buffer.from(request.headers.get("authorization") ?? "");
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Errors that mean "already applied" rather than "broken". */
function isAlreadyExists(message: string): boolean {
  return /already exists|duplicate key value/i.test(message);
}

export async function POST(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const db = requireDb();
  const log: string[] = [];

  // ---- Schema -------------------------------------------------------------
  const dir = join(process.cwd(), "drizzle");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

  let applied = 0;
  let skipped = 0;

  for (const file of files) {
    const contents = await readFile(join(dir, file), "utf8");
    const statements = contents
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      try {
        await db.execute(sql.raw(statement));
        applied += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (isAlreadyExists(message)) {
          skipped += 1;
          continue;
        }
        return NextResponse.json(
          { ok: false, stage: "migrate", file, statement: statement.slice(0, 160), error: message },
          { status: 500 },
        );
      }
    }
    log.push(`${file}: ${statements.length} statements`);
  }

  // ---- Taxonomy -----------------------------------------------------------
  let seeded;
  try {
    seeded = await seedTaxonomy();
  } catch (error) {
    return NextResponse.json(
      { ok: false, stage: "seed", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }

  // ---- Editorial content --------------------------------------------------
  let published;
  try {
    published = await publishWeekendGuide();
  } catch (error) {
    return NextResponse.json(
      { ok: false, stage: "publish", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }

  // Every cached surface the new pages appear on.
  for (const edition of published.editions) {
    revalidatePath(`/${edition.locale}`);
    revalidatePath(`/${edition.locale}/${edition.path}`);
    revalidatePath(`/${edition.locale}/agenda`);
  }
  revalidatePath("/sitemap.xml");

  return NextResponse.json({
    ok: true,
    migrate: { files: log, applied, skipped },
    seed: seeded,
    publish: published,
  });
}
