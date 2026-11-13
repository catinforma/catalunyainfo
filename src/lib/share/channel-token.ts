import { createHash, timingSafeEqual } from "node:crypto";

/**
 * The private page with the channel's daily post (`/canal/<token>/`).
 *
 * `/admin` is closed to the internet at Caddy (ops/vps/README.md, "CMS
 * access") and is reachable only through an SSH tunnel, which the owner's
 * phone does not have. So the page the owner opens every morning is guarded
 * by an unguessable token instead: it lives only in the server's env file
 * (CHANNEL_PAGE_TOKEN, read at run time, never inlined into a bundle), and
 * every other value, or no value set at all, is a plain 404 that says nothing.
 *
 * Generate it with `openssl rand -hex 24` (48 hex characters); a token shorter
 * than MIN_TOKEN_LENGTH switches the page off. Rotating it is editing the
 * line and restarting the service.
 */

export const CHANNEL_TOKEN_ENV = "CHANNEL_PAGE_TOKEN";

/** The segment the page lives under: `/canal/<token>/`. */
export const CHANNEL_PAGE_SEGMENT = "canal";

export const MIN_TOKEN_LENGTH = 32;

const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();

/**
 * True only when a long enough token is configured and `given` is exactly it.
 * Compared as SHA-256 digests in constant time, so neither the length nor the
 * content leaks through timing.
 */
export function channelTokenMatches(given: string | undefined | null, configured: string | undefined = process.env[CHANNEL_TOKEN_ENV]): boolean {
  const expected = configured?.trim() ?? "";
  if (expected.length < MIN_TOKEN_LENGTH || typeof given !== "string" || given.length === 0) return false;
  return timingSafeEqual(digest(given), digest(expected));
}
