import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

/**
 * The database is optional on purpose.
 *
 * The whole site must build, boot and render without `DATABASE_URL` so that a
 * fresh clone works, previews of infrastructure-only branches deploy, and the
 * public pages degrade to honest empty states instead of crashing. Every read
 * path goes through `lib/content/repository.ts`, which falls back to an empty
 * dataset when `getDb()` returns `null`.
 */
let cached: Database | null | undefined;

declare global {
  var __catinfoSql: ReturnType<typeof postgres> | undefined;
}

export function databaseUrl(): string | null {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    null;
  return url && url.trim().length > 0 ? url : null;
}

export function isDatabaseConfigured(): boolean {
  return databaseUrl() !== null;
}

export function getDb(): Database | null {
  if (cached !== undefined) return cached;

  const url = databaseUrl();
  if (!url) {
    cached = null;
    return cached;
  }

  // Reuse the socket pool across HMR reloads and across warm serverless
  // invocations. `max: 1` keeps a serverless function from exhausting the
  // connection limit; use a pooled connection string (pgBouncer) in Vercel.
  const client =
    globalThis.__catinfoSql ??
    postgres(url, {
      max: Number(process.env.DATABASE_POOL_MAX ?? 1),
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });

  if (process.env.NODE_ENV !== "production") globalThis.__catinfoSql = client;

  cached = drizzle(client, { schema, logger: process.env.DRIZZLE_LOG === "true" });
  return cached;
}

/** Throws instead of returning null. Use only in admin/API code paths. */
export function requireDb(): Database {
  const db = getDb();
  if (!db) {
    throw new Error(
      "DATABASE_URL is not configured. Set it in .env.local (see .env.example).",
    );
  }
  return db;
}

export { schema };
