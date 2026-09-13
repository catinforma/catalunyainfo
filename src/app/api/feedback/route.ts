import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb, schema } from "@/lib/db/client";
import { LOCALES } from "@/lib/i18n/config";

export const runtime = "nodejs";

const schemaIn = z.object({
  path: z.string().min(1).max(600),
  locale: z.enum(LOCALES),
  isUseful: z.boolean(),
  comment: z.string().max(1000).optional(),
});

/**
 * Page-level feedback.
 *
 * Stores the path, the language and a yes/no. No identifier, no session, no IP,
 * no user agent — there is nothing here to tie an answer back to a person, so
 * the endpoint cannot become a personal-data store by accident.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = schemaIn.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const db = getDb();
  if (!db) return NextResponse.json({ ok: true, stored: false });

  await db.insert(schema.pageFeedback).values({
    path: parsed.data.path,
    locale: parsed.data.locale,
    isUseful: parsed.data.isUseful,
    comment: parsed.data.comment ?? null,
  });

  return NextResponse.json({ ok: true, stored: true });
}
