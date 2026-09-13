import "server-only";

import { timingSafeEqual } from "node:crypto";

/**
 * Shared guard for the deployment-time endpoints.
 *
 * These exist because Vercel keeps the database credentials as production
 * secrets that cannot be pulled to a developer machine, so migrations and
 * content publishing have to run from inside a deployment. They are guarded by
 * `CRON_SECRET`, compared in constant time, and refuse everything when the
 * secret is unset rather than falling open.
 */
export function authoriseDeployRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

/**
 * Flattens an error and everything it wraps.
 *
 * Drizzle wraps driver errors in a `DrizzleQueryError` whose message is only
 * the SQL it tried to run, so the Postgres code ("42710: object already
 * exists") sits one or two levels down the `cause` chain.
 */
export function describeError(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth += 1) {
    if (current instanceof Error) {
      parts.push(current.message);
      const code = (current as { code?: unknown }).code;
      if (typeof code === "string") parts.push(code);
      current = current.cause;
    } else {
      parts.push(String(current));
      break;
    }
  }
  return parts.join(" | ");
}
