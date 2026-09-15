import { NextResponse } from "next/server";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "@/lib/db/client";
import { LOCALES } from "@/lib/i18n/config";
import { notifyEditorial } from "@/lib/contact/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The contact form endpoint.
 *
 * Order of operations matters: the message is written to `contact_messages`
 * first and the email notification is attempted second. If the mail provider
 * is missing, down or throttled, the reader's message is still recorded and
 * readable in the admin inbox — the email is a convenience, not the storage.
 *
 * Spam defences, in increasing order of cost to an attacker:
 *
 *  1. A honeypot field a human never sees and never fills.
 *  2. A minimum elapsed time between rendering and submitting; scripted posts
 *     arrive far too fast.
 *  3. A per-address rate limit counted in the database, because an in-memory
 *     counter resets on every serverless cold start and protects nothing.
 *
 * No IP address and no user agent is stored. The only personal data kept is
 * what a person deliberately typed in order to be answered.
 */

const MAX_PER_ADDRESS = 3;
const WINDOW_MINUTES = 30;
const MIN_FILL_MS = 3000;

const contactSchema = z.object({
  locale: z.enum(LOCALES),
  topic: z.enum(["correction", "editorial", "press", "collaboration", "privacy", "other"]),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  aboutPath: z.string().trim().max(600).optional().or(z.literal("")),
  message: z.string().trim().min(20).max(5000),
  consent: z.literal(true),
  /** Honeypot. Anything here means a bot filled a field humans cannot see. */
  company: z.string().max(0).optional().or(z.literal("")),
  /** Milliseconds the form was on screen before submission. */
  elapsedMs: z.number().int().nonnegative().max(86_400_000).optional(),
});

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "validation" }, 400);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) return json({ ok: false, error: "validation" }, 400);

  const data = parsed.data;

  // Silently accept what the traps catch. Telling a bot why it failed only
  // helps it try again differently, and a real person cannot reach this branch.
  if (data.company) return json({ ok: true, stored: false });
  if (data.elapsedMs !== undefined && data.elapsedMs < MIN_FILL_MS) {
    return json({ ok: true, stored: false });
  }

  const db = getDb();
  if (!db) return json({ ok: false, error: "unavailable" }, 503);

  const email = data.email.toLowerCase();
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000);

  const recent = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.contactMessages)
    .where(
      and(
        eq(schema.contactMessages.email, email),
        gte(schema.contactMessages.createdAt, since),
      ),
    );

  if ((recent[0]?.count ?? 0) >= MAX_PER_ADDRESS) {
    return json({ ok: false, error: "rate" }, 429);
  }

  const inserted = await db
    .insert(schema.contactMessages)
    .values({
      locale: data.locale,
      topic: data.topic,
      name: data.name,
      email,
      aboutPath: data.aboutPath ? data.aboutPath.slice(0, 600) : null,
      message: data.message,
    })
    .returning({ id: schema.contactMessages.id });

  const id = inserted[0]?.id;
  if (!id) return json({ ok: false, error: "unavailable" }, 503);

  const delivered = await notifyEditorial({
    id,
    locale: data.locale,
    topic: data.topic,
    name: data.name,
    email,
    aboutPath: data.aboutPath || null,
    message: data.message,
  });

  if (delivered) {
    await db
      .update(schema.contactMessages)
      .set({ deliveredAt: new Date() })
      .where(eq(schema.contactMessages.id, id));
  }

  return json({ ok: true, stored: true });
}
