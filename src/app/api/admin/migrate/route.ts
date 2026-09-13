import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { requireDb } from "@/lib/db/client";
import { authoriseDeployRequest, describeError } from "@/lib/admin/deploy-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Applies the migrations committed under `drizzle/`.
 *
 * It can only run SQL that is already in the repository - it takes no SQL from
 * the request - so the blast radius is whatever passed code review. Statements
 * that have already been applied are skipped, which makes a repeat call a no-op
 * and a partial failure safe to retry.
 */
function isAlreadyApplied(message: string): boolean {
  // 42P07 relation exists, 42710 object exists, 42P06 schema exists.
  return /already exists|duplicate key value|42P07|42710|42P06/i.test(message);
}

export async function POST(request: Request) {
  if (!authoriseDeployRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const db = requireDb();
  const dir = join(process.cwd(), "drizzle");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

  let applied = 0;
  let skipped = 0;

  for (const file of files) {
    const statements = (await readFile(join(dir, file), "utf8"))
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      try {
        await db.execute(sql.raw(statement));
        applied += 1;
      } catch (error) {
        const message = describeError(error);
        if (isAlreadyApplied(message)) {
          skipped += 1;
          continue;
        }
        return NextResponse.json(
          { ok: false, file, statement: statement.slice(0, 160), error: message },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({ ok: true, files, applied, skipped });
}
