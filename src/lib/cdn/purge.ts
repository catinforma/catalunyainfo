import "server-only";

import { CANONICAL_HOST, SITE } from "@/lib/site";

/**
 * Cloudflare cache purge, so that Cloudflare may cache HTML (ops/vps/README.md
 * section 10, rule 2) without serving a page that a publish has replaced.
 *
 * `revalidatePath` only reaches the Next cache inside the Node process;
 * Cloudflare keeps its copy until `s-maxage` runs out (a day for content).
 * Every place that revalidates pages therefore purges the same URLs here.
 *
 * What is purged, and why that is enough:
 *  - the canonical URL only (`https://www.catalunyainfo.com/<path>/`). The apex
 *    and `http://` answer Caddy redirects without Cache-Control, which the
 *    cache rule never stores;
 *  - no RSC variants. Next serves them on the same path with `?_rsc=<hash of
 *    the client's router headers>`, a value that cannot be enumerated, so they
 *    cannot be purged by URL. Instead the cache rules never store them: rule 2
 *    caches only requests without a query string, and the bypass rule also
 *    catches an `rsc` header. The same rule keeps `?utm_…` copies out of the
 *    cache, so the bare URL is the only copy there is.
 *
 * Off until CLOUDFLARE_API_TOKEN is set (a token with Zone > Cache Purge on
 * this zone only): every call is then a no-op returning `{ skipped: true }`.
 * It never throws and never logs the token; a failed purge is logged and
 * reported, and the publish that asked for it still succeeds.
 *
 * API: POST /client/v4/zones/{zone}/purge_cache with `{"files": [...]}` or
 * `{"purge_everything": true}` (developers.cloudflare.com, read 3 Nov 2026).
 * Cloudflare's table now allows 100 URLs per call on Free (800 URLs/s);
 * batches of 30, the older Free limit, work under either.
 */

export const PURGE_BATCH_SIZE = 30;
export const PURGE_TIMEOUT_MS = 8_000;
/** Above this many URLs (20 calls) one purge-everything replaces the batches. */
export const PURGE_EVERYTHING_ABOVE = 600;
/** Batches in flight at once: well under the Free plan's 800 URLs/s. */
const PURGE_CONCURRENCY = 3;
const API = "https://api.cloudflare.com/client/v4/zones";
const ZONE_ID_RE = /^[0-9a-f]{32}$/;
const MAX_ERRORS = 5;

type Env = Record<string, string | undefined>;
type Log = (level: "info" | "error", message: string) => void;

export interface PurgeOptions {
  /** Shown in the log line: "publish", "cron", … */
  label?: string;
  env?: Env;
  fetch?: typeof fetch;
  log?: Log;
}

export type PurgeResult =
  | { skipped: true; reason: "no-token" | "no-zone-id" | "nothing-to-purge" }
  | {
      skipped: false;
      ok: boolean;
      mode: "urls" | "everything";
      /** URLs asked for (with mode "everything", the URLs it stood in for). */
      urls: number;
      calls: number;
      failedCalls: number;
      errors: string[];
    };

const defaultLog: Log = (level, message) => {
  if (level === "error") console.error(message);
  else console.info(message);
};

/**
 * Absolute canonical URLs for site paths, as Cloudflare keys them: trailing
 * slash (trailingSlash: true) except on files such as /sitemap.xml, which
 * Next serves without one; non-ASCII percent-encoded as browsers send it.
 */
export function cdnUrlsForPaths(paths: Iterable<string>): string[] {
  const urls = new Set<string>();
  for (const raw of paths) {
    const path = raw.trim().split(/[?#]/)[0]?.replace(/\/{2,}/g, "/") ?? "";
    if (!path) continue;
    const withLead = path.startsWith("/") ? path : `/${path}`;
    const last = withLead.split("/").filter(Boolean).pop() ?? "";
    const isFile = /\.[a-z0-9]+$/i.test(last);
    const normalised = isFile ? withLead.replace(/\/+$/, "") : withLead.endsWith("/") ? withLead : `${withLead}/`;
    const url = new URL(normalised, SITE.productionOrigin);
    // A path such as "/\evil.example" would resolve to another host: never sent.
    if (url.host === CANONICAL_HOST) urls.add(url.href);
  }
  return [...urls];
}

/** Purges the canonical URLs of these site paths (see cdnUrlsForPaths). */
export function purgeCdnPaths(paths: Iterable<string>, options: PurgeOptions = {}): Promise<PurgeResult> {
  return purgeCdnUrls(cdnUrlsForPaths(paths), options);
}

/** Purges absolute URLs, in batches; never throws. */
export async function purgeCdnUrls(urls: string[], options: PurgeOptions = {}): Promise<PurgeResult> {
  const config = readConfig(options);
  if ("skipped" in config) return config;
  const unique = [...new Set(urls)];
  if (unique.length === 0) return { skipped: true, reason: "nothing-to-purge" };
  if (unique.length > PURGE_EVERYTHING_ABOVE) {
    return run(config, [{ purge_everything: true }], "everything", unique.length, options);
  }
  const bodies: object[] = [];
  for (let i = 0; i < unique.length; i += PURGE_BATCH_SIZE) {
    bodies.push({ files: unique.slice(i, i + PURGE_BATCH_SIZE) });
  }
  return run(config, bodies, "urls", unique.length, options);
}

/** Empties Cloudflare's cache for the whole zone (deploy.sh does the same in shell). */
export async function purgeCdnEverything(options: PurgeOptions = {}): Promise<PurgeResult> {
  const config = readConfig(options);
  if ("skipped" in config) return config;
  return run(config, [{ purge_everything: true }], "everything", 0, options);
}

interface Config {
  zoneId: string;
  token: string;
}

function readConfig(options: PurgeOptions): Config | { skipped: true; reason: "no-token" | "no-zone-id" } {
  const env = options.env ?? process.env;
  const token = env.CLOUDFLARE_API_TOKEN?.trim() ?? "";
  if (!token) return { skipped: true, reason: "no-token" };
  const zoneId = env.CLOUDFLARE_ZONE_ID?.trim().toLowerCase() ?? "";
  if (!ZONE_ID_RE.test(zoneId)) {
    (options.log ?? defaultLog)("error", "[cdn-purge] CLOUDFLARE_API_TOKEN is set but CLOUDFLARE_ZONE_ID is missing or malformed: nothing purged");
    return { skipped: true, reason: "no-zone-id" };
  }
  return { zoneId, token };
}

async function run(
  config: Config,
  bodies: object[],
  mode: "urls" | "everything",
  urlCount: number,
  options: PurgeOptions,
): Promise<PurgeResult> {
  const log = options.log ?? defaultLog;
  const doFetch = options.fetch ?? fetch;
  const label = (options.label ?? "purge").replace(/[^\w ().-]/g, "?").slice(0, 80);
  const errors: string[] = [];
  let failedCalls = 0;

  let next = 0;
  const worker = async () => {
    while (next < bodies.length) {
      const body = bodies[next++];
      const error = await call(config, body, doFetch);
      if (error) {
        failedCalls++;
        if (errors.length < MAX_ERRORS) errors.push(redact(error, config.token));
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(PURGE_CONCURRENCY, bodies.length) }, worker));

  const what = mode === "everything" ? (urlCount > 0 ? `everything (for ${urlCount} URLs)` : "everything") : `${urlCount} URLs`;
  if (failedCalls === 0) {
    log("info", `[cdn-purge] ${label}: purged ${what} in ${bodies.length} call(s)`);
  } else {
    log("error", `[cdn-purge] ${label}: ${failedCalls} of ${bodies.length} call(s) failed purging ${what}: ${errors.join("; ")}`);
  }
  return { skipped: false, ok: failedCalls === 0, mode, urls: urlCount, calls: bodies.length, failedCalls, errors };
}

/** One API call; returns an error description, or null on success. */
async function call(config: Config, body: object | undefined, doFetch: typeof fetch): Promise<string | null> {
  try {
    const response = await doFetch(`${API}/${config.zoneId}/purge_cache`, {
      method: "POST",
      headers: { authorization: `Bearer ${config.token}`, "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(PURGE_TIMEOUT_MS),
    });
    const json = (await response.json().catch(() => null)) as {
      success?: boolean;
      errors?: { code?: number; message?: string }[];
    } | null;
    if (response.ok && json?.success === true) return null;
    const detail = (json?.errors ?? [])
      .map((e) => `${e.code ?? "?"} ${e.message ?? ""}`.trim())
      .join(", ");
    return `HTTP ${response.status}${detail ? ` (${detail})` : ""}`;
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      return `timeout after ${PURGE_TIMEOUT_MS / 1000} s`;
    }
    return error instanceof Error ? `${error.name}: ${error.message}` : "unknown error";
  }
}

/** Belt and braces: nothing that reaches a log or a response carries the token. */
function redact(text: string, token: string): string {
  return token ? text.split(token).join("[redacted]") : text;
}
