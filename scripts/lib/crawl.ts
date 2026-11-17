/**
 * Polite crawling shared by the production audits (`site:audit`, `seo:links`).
 *
 * - at most `SEO_CONCURRENCY` requests in flight (default 4), with a browser
 *   User-Agent, because Cloudflare treats a bare script UA differently from
 *   what readers and Googlebot's renderer receive;
 * - redirects are followed by hand, so a chain (http -> https -> www -> /ca/)
 *   is recorded hop by hop instead of disappearing inside `fetch`;
 * - with `SEO_CACHE_DIR` set, every response is stored on disk, so a second
 *   audit run on the same day reads the cache instead of crawling again.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const BROWSER_UA =
  process.env.SEO_UA ??
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export const CONCURRENCY = Math.max(1, Math.min(8, Number(process.env.SEO_CONCURRENCY ?? 4) || 4));

export interface Hop {
  url: string;
  status: number;
}

export interface FetchedPage {
  /** The URL asked for. */
  url: string;
  /** Status of the first response (a redirect status when it redirected). */
  status: number;
  /** Status after following redirects (0 = network error or loop). */
  finalStatus: number;
  finalUrl: string;
  /** Every redirect hop, in order; empty when the first answer was final. */
  redirects: Hop[];
  contentType: string;
  xRobotsTag: string;
  ms: number;
  body: string;
}

function cacheFile(dir: string, url: string, method: string): string {
  return join(dir, `${createHash("sha1").update(`${method} ${url}`).digest("hex")}.json`);
}

/**
 * GET (or HEAD) with redirects followed by hand, up to `maxHops`.
 * Never throws: a network error is `finalStatus: 0`.
 */
export async function fetchPage(
  url: string,
  { method = "GET", maxHops = 6, timeoutMs = 45_000 }: { method?: "GET" | "HEAD"; maxHops?: number; timeoutMs?: number } = {},
): Promise<FetchedPage> {
  const cacheDir = process.env.SEO_CACHE_DIR;
  if (cacheDir) {
    try {
      return JSON.parse(await readFile(cacheFile(cacheDir, url, method), "utf8")) as FetchedPage;
    } catch {
      // not cached yet
    }
  }

  const started = Date.now();
  const redirects: Hop[] = [];
  let current = url;
  let firstStatus = 0;
  let result: FetchedPage | null = null;

  for (let hop = 0; hop <= maxHops; hop += 1) {
    let response: Response;
    try {
      response = await fetch(current, {
        method,
        redirect: "manual",
        headers: {
          "user-agent": BROWSER_UA,
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "ca,es;q=0.9,en;q=0.8",
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      result = { url, status: firstStatus, finalStatus: 0, finalUrl: current, redirects, contentType: "", xRobotsTag: "", ms: Date.now() - started, body: "" };
      break;
    }
    if (hop === 0) firstStatus = response.status;
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      redirects.push({ url: current, status: response.status });
      current = new URL(location, current).toString();
      await response.body?.cancel();
      continue;
    }
    const body = method === "HEAD" ? "" : await response.text().catch(() => "");
    result = {
      url,
      status: firstStatus,
      finalStatus: response.status,
      finalUrl: current,
      redirects,
      contentType: response.headers.get("content-type") ?? "",
      xRobotsTag: response.headers.get("x-robots-tag") ?? "",
      ms: Date.now() - started,
      body,
    };
    break;
  }
  result ??= { url, status: firstStatus, finalStatus: 0, finalUrl: current, redirects, contentType: "", xRobotsTag: "", ms: Date.now() - started, body: "" };

  if (cacheDir && result.finalStatus !== 0) {
    await mkdir(cacheDir, { recursive: true });
    await writeFile(cacheFile(cacheDir, url, method), JSON.stringify(result), "utf8");
  }
  return result;
}

/** Runs `fn` over `items` with at most `limit` calls in flight, keeping order. */
export async function mapLimit<T, R>(items: readonly T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (index < items.length) {
        const current = index++;
        const item = items[current] as T;
        results[current] = await fn(item, current);
      }
    }),
  );
  return results;
}

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  /** hreflang -> href, from `<xhtml:link rel="alternate">`. */
  alternates: Record<string, string>;
}

/** Parses a `<urlset>`; a `<sitemapindex>` is expanded by `readSitemap`. */
export function parseUrlset(xml: string): SitemapEntry[] {
  const out: SitemapEntry[] = [];
  for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const body = block[1] ?? "";
    const loc = /<loc>([^<]+)<\/loc>/.exec(body)?.[1]?.trim();
    if (!loc) continue;
    const alternates: Record<string, string> = {};
    for (const link of body.matchAll(/<xhtml:link\b[^>]*>/g)) {
      const tag = link[0];
      const lang = /hreflang="([^"]+)"/.exec(tag)?.[1];
      const href = /href="([^"]+)"/.exec(tag)?.[1];
      if (lang && href) alternates[lang] = href.replace(/&amp;/g, "&");
    }
    out.push({ loc: loc.replace(/&amp;/g, "&"), lastmod: /<lastmod>([^<]+)<\/lastmod>/.exec(body)?.[1] ?? "", alternates });
  }
  return out;
}

export async function readSitemap(url: string): Promise<SitemapEntry[]> {
  const page = await fetchPage(url);
  if (page.finalStatus !== 200) throw new Error(`${url} answered ${page.finalStatus}`);
  const children = [...page.body.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/g)].map((m) => m[1] ?? "");
  if (children.length === 0) return parseUrlset(page.body);
  const nested = await mapLimit(children, CONCURRENCY, (child) => readSitemap(child));
  return nested.flat();
}

/**
 * The robots.txt `Disallow` rules for `User-Agent: *`, as path prefixes and
 * `*` wildcards. Enough for our own file; not a general robots parser.
 */
export function disallowRules(robotsTxt: string): { allow: RegExp[]; disallow: RegExp[] } {
  const allow: RegExp[] = [];
  const disallow: RegExp[] = [];
  let inStar = false;
  let sawRule = false;
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    if (!key) continue;
    const k = key.toLowerCase();
    if (k === "user-agent") {
      if (sawRule) {
        inStar = false;
        sawRule = false;
      }
      if (value === "*") inStar = true;
      continue;
    }
    if (k !== "allow" && k !== "disallow") continue;
    sawRule = true;
    if (!inStar || !value) continue;
    const pattern = new RegExp(`^${value.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$")}`);
    (k === "allow" ? allow : disallow).push(pattern);
  }
  return { allow, disallow };
}

/** Google's rule: the longest matching pattern wins, Allow on a tie. */
export function robotsAllows(rules: { allow: RegExp[]; disallow: RegExp[] }, pathAndQuery: string): boolean {
  const longest = (patterns: RegExp[]) =>
    patterns.reduce((best, p) => (p.test(pathAndQuery) ? Math.max(best, p.source.length) : best), -1);
  const a = longest(rules.allow);
  const d = longest(rules.disallow);
  return d < 0 || a >= d;
}
