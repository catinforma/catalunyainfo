import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt, gte, sql } from "drizzle-orm";

import { requireDb, schema } from "@/lib/db/client";
import type { User, UserRole } from "@/lib/db/schema";

const { auditLog, sessions, users } = schema;

export const SESSION_COOKIE = "ci_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const MAX_FAILED_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MINUTES = 15;

/**
 * Sessions are opaque random tokens; only their SHA-256 is stored.
 *
 * A leaked database therefore does not hand an attacker usable sessions, and a
 * session can be revoked by deleting one row — which a stateless JWT could not
 * do without a second store anyway.
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  authorId: string | null;
}

function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    authorId: user.authorId,
  };
}

export async function createSession(userId: string, userAgent?: string): Promise<void> {
  const db = requireDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    tokenHash: hashToken(token),
    userId,
    expiresAt,
    userAgent: userAgent?.slice(0, 400) ?? null,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = requireDb();
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  jar.delete(SESSION_COOKIE);
}

/** Resolves the signed-in user, or null. Never throws on a bad cookie. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const db = requireDb();
    const rows = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.tokenHash, hashToken(token)),
          gt(sessions.expiresAt, new Date()),
          eq(users.isActive, true),
        ),
      )
      .limit(1);

    const row = rows[0];
    return row ? toSessionUser(row.user) : null;
  } catch {
    return null;
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Not authorised") {
    super(message);
    this.name = "AuthorizationError";
  }
}

const ROLE_RANK: Record<UserRole, number> = {
  viewer: 0,
  author: 1,
  editor: 2,
  admin: 3,
};

export function hasRole(user: SessionUser, minimum: UserRole): boolean {
  return ROLE_RANK[user.role] >= ROLE_RANK[minimum];
}

/** Throws if there is no session, or the session is below `minimum`. */
export async function requireUser(minimum: UserRole = "author"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthorizationError("Sign in required");
  if (!hasRole(user, minimum)) throw new AuthorizationError("Insufficient permissions");
  return user;
}

/* -------------------------------------------------------------------------- */
/* Login throttling                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Failed sign-ins are counted in `audit_log`, which is shared state across
 * serverless instances — an in-memory counter would reset on every cold start
 * and protect nothing.
 */
export async function recordLoginAttempt(email: string, success: boolean): Promise<void> {
  const db = requireDb();
  await db.insert(auditLog).values({
    action: success ? "login.success" : "login.failure",
    entityType: "user",
    entityId: email.toLowerCase().slice(0, 80),
    detail: null,
  });
}

export async function isThrottled(email: string): Promise<boolean> {
  const db = requireDb();
  const since = new Date(Date.now() - ATTEMPT_WINDOW_MINUTES * 60_000);

  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(auditLog)
    .where(
      and(
        eq(auditLog.action, "login.failure"),
        eq(auditLog.entityId, email.toLowerCase().slice(0, 80)),
        gte(auditLog.createdAt, since),
      ),
    );

  return (rows[0]?.count ?? 0) >= MAX_FAILED_ATTEMPTS;
}

/** Housekeeping, called from the scheduled job. */
export async function pruneExpiredSessions(): Promise<number> {
  const db = requireDb();
  const deleted = await db
    .delete(sessions)
    .where(sql`${sessions.expiresAt} < now()`)
    .returning({ tokenHash: sessions.tokenHash });
  return deleted.length;
}

export async function audit(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  detail?: Record<string, unknown>,
): Promise<void> {
  const db = requireDb();
  await db.insert(auditLog).values({
    userId,
    action,
    entityType,
    entityId: entityId?.slice(0, 80) ?? null,
    detail: detail ?? null,
  });
}
