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

/**
 * `APP_DATABASE_URL` wins over the rest: the DATABASE_URL/POSTGRES_* variables
 * are written by the Neon integration on Vercel and cannot be edited there, so
 * the database the site actually uses (Supabase since 26 Oct 2026) is set
 * under its own name. Removing it falls back to Neon.
 */
export function databaseUrl(): string | null {
  const url =
    process.env.APP_DATABASE_URL ??
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
  const options = {
    max: Number(process.env.DATABASE_POOL_MAX ?? 1),
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    // One query at a time per connection. postgres.js otherwise pipelines
    // concurrent queries, and Supabase's transaction pooler (Supavisor)
    // mixes them up under load: backends hung "active" until the 2-minute
    // statement timeout and a local build timed out on 144 pages. The option
    // exists in postgres.js but not in its type definitions.
    max_pipeline: 0,
  };
  const client = globalThis.__catinfoSql ?? postgres(url, options);

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
