import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PURGE_BATCH_SIZE,
  PURGE_EVERYTHING_ABOVE,
  cdnUrlsForPaths,
  purgeCdnEverything,
  purgeCdnPaths,
  purgeCdnUrls,
} from "@/lib/cdn/purge";

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

const TOKEN = "cf-test-token-Zx9QeLr2vB7nT4wY";
const ZONE = "52705f5d3f9f9e7ca73726b78b245459";
const ENV = { CLOUDFLARE_API_TOKEN: TOKEN, CLOUDFLARE_ZONE_ID: ZONE };

interface Call {
  url: string;
  init: RequestInit;
  body: Record<string, unknown>;
}

/** A fetch stand-in that records each call and answers with `respond`. */
function fakeFetch(respond: (call: Call) => Response | Promise<Response> = () => okResponse()) {
  const calls: Call[] = [];
  const fn = (async (input: string | URL | Request, init?: RequestInit) => {
    const call = { url: String(input), init: init ?? {}, body: JSON.parse(String(init?.body ?? "{}")) };
    calls.push(call);
    return respond(call);
  }) as typeof fetch;
  return { fn, calls };
}

function okResponse() {
  return new Response(JSON.stringify({ success: true, errors: [], messages: [], result: { id: "x" } }), { status: 200 });
}

function captureLog() {
  const lines: string[] = [];
  return { lines, log: (level: "info" | "error", message: string) => void lines.push(`${level} ${message}`) };
}

test("URLs: canonical www host, trailing slash on pages, none on files, deduplicated", () => {
  assert.deepEqual(cdnUrlsForPaths(["/ca", "/ca/", "ca", "/es/festius/girona", "/sitemap.xml", "/robots.txt/"]), [
    "https://www.catalunyainfo.com/ca/",
    "https://www.catalunyainfo.com/es/festius/girona/",
    "https://www.catalunyainfo.com/sitemap.xml",
    "https://www.catalunyainfo.com/robots.txt",
  ]);
  // Only the canonical host: the apex and http:// are Caddy redirects, never cached.
  for (const url of cdnUrlsForPaths(["/en/what-to-do", "/ca/cap-de-setmana/girona/"])) {
    assert.ok(url.startsWith("https://www.catalunyainfo.com/"), url);
    assert.ok(url.endsWith("/"), url);
  }
  // Query strings and fragments are not part of a purgeable key (rule 2 caches none).
  assert.deepEqual(cdnUrlsForPaths(["/ca/guia?x=1#top", "//ca//guia"]), ["https://www.catalunyainfo.com/ca/guia/"]);
  // Non-ASCII is percent-encoded the way browsers request it.
  assert.deepEqual(cdnUrlsForPaths(["/ca/l'escala-festa-major-ç"]), ["https://www.catalunyainfo.com/ca/l'escala-festa-major-%C3%A7/"]);
  assert.deepEqual(cdnUrlsForPaths(["", "  "]), []);
  // Whatever a CMS redirect path holds, nothing outside the canonical host is sent.
  assert.deepEqual(cdnUrlsForPaths(["/\\evil.example/x", "//evil.example/x"]), ["https://www.catalunyainfo.com/evil.example/x/"]);
});

test("no token: a no-op that returns { skipped: true } and calls nothing", async () => {
  const { fn, calls } = fakeFetch();
  const { lines, log } = captureLog();
  for (const env of [{}, { CLOUDFLARE_ZONE_ID: ZONE }, { CLOUDFLARE_API_TOKEN: "  ", CLOUDFLARE_ZONE_ID: ZONE }]) {
    assert.deepEqual(await purgeCdnPaths(["/ca/guia"], { env, fetch: fn, log }), { skipped: true, reason: "no-token" });
    assert.deepEqual(await purgeCdnEverything({ env, fetch: fn, log }), { skipped: true, reason: "no-token" });
  }
  assert.equal(calls.length, 0);
  assert.deepEqual(lines, [], "silent when switched off");
});

test("token without a valid zone id: skipped, logged, nothing sent", async () => {
  const { fn, calls } = fakeFetch();
  const { lines, log } = captureLog();
  for (const zone of [undefined, "", "not-a-zone", `${ZONE}/../accounts`]) {
    const result = await purgeCdnPaths(["/ca/guia"], { env: { CLOUDFLARE_API_TOKEN: TOKEN, CLOUDFLARE_ZONE_ID: zone }, fetch: fn, log });
    assert.deepEqual(result, { skipped: true, reason: "no-zone-id" });
  }
  assert.equal(calls.length, 0);
  assert.equal(lines.length, 4);
  assert.ok(lines.every((line) => !line.includes(TOKEN)));
});

test("batching: 31 URLs go out as two calls of 30 and 1, to the purge_cache endpoint", async () => {
  assert.equal(PURGE_BATCH_SIZE, 30);
  const { fn, calls } = fakeFetch();
  const urls = Array.from({ length: 31 }, (_, i) => `https://www.catalunyainfo.com/ca/page-${i}/`);
  const result = await purgeCdnUrls(urls, { env: ENV, fetch: fn, log: () => {} });
  assert.equal(calls.length, 2);
  assert.deepEqual(result, { skipped: false, ok: true, mode: "urls", urls: 31, calls: 2, failedCalls: 0, errors: [] });
  const sent = calls.flatMap((c) => c.body.files as string[]);
  assert.deepEqual([...sent].sort(), [...urls].sort());
  assert.deepEqual(calls.map((c) => (c.body.files as string[]).length).sort((a, b) => b - a), [30, 1]);
  for (const call of calls) {
    assert.equal(call.url, `https://api.cloudflare.com/client/v4/zones/${ZONE}/purge_cache`);
    assert.equal(call.init.method, "POST");
    const headers = call.init.headers as Record<string, string>;
    assert.equal(headers.authorization, `Bearer ${TOKEN}`);
    assert.equal(headers["content-type"], "application/json");
    assert.ok(call.init.signal instanceof AbortSignal, "every call has a timeout");
    assert.deepEqual(Object.keys(call.body), ["files"]);
  }
  // Exactly 30 is one call; duplicates are sent once.
  const one = fakeFetch();
  await purgeCdnUrls([...urls.slice(0, 30), urls[0]!], { env: ENV, fetch: one.fn, log: () => {} });
  assert.equal(one.calls.length, 1);
});

test("paths are purged as canonical URLs; nothing to purge sends nothing", async () => {
  const { fn, calls } = fakeFetch();
  await purgeCdnPaths(new Set(["/ca", "/ca/festius/girona", "/sitemap.xml"]), { env: ENV, fetch: fn, log: () => {} });
  assert.deepEqual(calls[0]?.body, {
    files: [
      "https://www.catalunyainfo.com/ca/",
      "https://www.catalunyainfo.com/ca/festius/girona/",
      "https://www.catalunyainfo.com/sitemap.xml",
    ],
  });
  assert.deepEqual(await purgeCdnPaths([], { env: ENV, fetch: fn, log: () => {} }), { skipped: true, reason: "nothing-to-purge" });
  assert.equal(calls.length, 1);
});

test("purge everything: one call; and it replaces the batches for very large purges", async () => {
  const a = fakeFetch();
  const result = await purgeCdnEverything({ env: ENV, fetch: a.fn, log: () => {} });
  assert.equal(a.calls.length, 1);
  assert.deepEqual(a.calls[0]?.body, { purge_everything: true });
  assert.deepEqual(result, { skipped: false, ok: true, mode: "everything", urls: 0, calls: 1, failedCalls: 0, errors: [] });

  const b = fakeFetch();
  const many = Array.from({ length: PURGE_EVERYTHING_ABOVE + 1 }, (_, i) => `/ca/festius/town-${i}`);
  const big = await purgeCdnPaths(many, { env: ENV, fetch: b.fn, log: () => {} });
  assert.equal(b.calls.length, 1);
  assert.deepEqual(b.calls[0]?.body, { purge_everything: true });
  assert.equal(big.skipped === false && big.mode, "everything");
});

test("failures are reported and logged, never thrown, and the token appears in no log line", async () => {
  let n = 0;
  const failing = fakeFetch(() => {
    n++;
    if (n === 1) {
      return new Response(JSON.stringify({ success: false, errors: [{ code: 10000, message: "Authentication error" }] }), { status: 403 });
    }
    if (n === 2) throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    if (n === 3) throw new Error(`connect ECONNRESET while sending Bearer ${TOKEN}`);
    return new Response("<html>bad gateway</html>", { status: 502 });
  });
  const { lines, log } = captureLog();
  const urls = Array.from({ length: 4 * PURGE_BATCH_SIZE }, (_, i) => `https://www.catalunyainfo.com/es/p-${i}/`);
  const result = await purgeCdnUrls(urls, { env: ENV, fetch: failing.fn, log, label: "publish strikes" });
  assert.equal(result.skipped, false);
  if (result.skipped) return;
  assert.equal(result.ok, false);
  assert.equal(result.calls, 4);
  assert.equal(result.failedCalls, 4);
  assert.ok(result.errors.some((e) => e.includes("HTTP 403") && e.includes("10000 Authentication error")));
  assert.ok(result.errors.some((e) => e === "timeout after 8 s"));
  assert.ok(result.errors.some((e) => e === "HTTP 502"));
  assert.equal(lines.length, 1);
  assert.match(lines[0]!, /^error \[cdn-purge\] publish strikes: 4 of 4 call\(s\) failed/);
  for (const text of [...lines, JSON.stringify(result)]) assert.ok(!text.includes(TOKEN), text);
  assert.ok(JSON.stringify(result).includes("[redacted]"));

  // A partial failure is still reported as such.
  let m = 0;
  const partial = fakeFetch(() => (m++ === 0 ? new Response("{}", { status: 429 }) : okResponse()));
  const half = await purgeCdnUrls(urls.slice(0, 31), { env: ENV, fetch: partial.fn, log: () => {} });
  assert.equal(!half.skipped && half.failedCalls, 1);
});

test("success logs one line naming the label and the count, without the token", async () => {
  const { fn } = fakeFetch();
  const { lines, log } = captureLog();
  await purgeCdnPaths(["/ca/a", "/ca/b"], { env: ENV, fetch: fn, log, label: "cron\nINJECTED" });
  assert.deepEqual(lines, ["info [cdn-purge] cron?INJECTED: purged 2 URLs in 1 call(s)"]);
});

test("publish route: purges the revalidated URLs after revalidatePath and reports it", () => {
  const route = read("src/app/api/admin/publish/route.ts");
  assert.match(route, /import \{ purgeCdnPaths \} from "@\/lib\/cdn\/purge";/);
  assert.match(route, /import \{ NextResponse, after \} from "next\/server";/);
  // Every revalidation goes through the helper that records the path…
  assert.equal(route.match(/revalidatePath\(/g)?.length, 1, "revalidatePath only inside the recording helper");
  assert.match(route, /revalidatePath\(path\);\s*revalidated\.add\(path\);/);
  // …and the purge comes after the last one, and again after the response.
  // The sitemap and feeds: revalidated by their helper, their URLs recorded for the purge.
  assert.match(route, /for \(const url of revalidateSitemapAndFeeds\(\)\) revalidated\.add\(url\);/);
  const lastRevalidate = route.lastIndexOf("revalidateSitemapAndFeeds()");
  const purge = route.indexOf("await purgeCdnPaths(revalidated");
  assert.ok(lastRevalidate > 0 && purge > lastRevalidate, "purge after revalidating");
  assert.ok(route.indexOf("after(async () =>", purge) > purge, "follow-up purge after the response");
  assert.match(route, /NextResponse\.json\(\{ ok: true, seed, published, pages: pages\.pages\.length, indexNow, cdnPurge \}\)/);
});

test("cron route: purges every path it revalidates, in both responses", () => {
  const cron = read("src/app/api/cron/publish-scheduled/route.ts");
  assert.equal(cron.match(/revalidatePath\(/g)?.length, 1, "revalidatePath only inside the recording helper");
  for (const family of ["weekendPaths", "holidayPaths", "dayDependent", "due"]) {
    assert.match(cron, new RegExp(`for \\(const (path|row) of ${family}\\) (\\{\\s*)?revalidate\\(`), family);
  }
  assert.match(cron, /for \(const url of revalidateSitemapAndFeeds\(\)\) revalidated\.add\(url\);/);
  const lastRevalidate = cron.lastIndexOf("revalidate(`/${locale}`)");
  const purge = cron.lastIndexOf("await purgeCdn(revalidated)");
  assert.ok(lastRevalidate > 0 && purge > lastRevalidate, "purge after the last revalidation");
  assert.match(cron, /reason: "no-database", cdnPurge/);
  assert.match(cron, /sessionsPruned,\s*cdnPurge,/);
  assert.match(cron, /after\(async \(\) => \{\s*await purgeCdnPaths\(paths/);
});

test("CMS saves purge the paths they revalidate, after the response", () => {
  const actions = read("src/lib/admin/actions.ts");
  const helper = actions.slice(actions.indexOf("function revalidateForTranslation("));
  assert.match(helper, /for \(const p of paths\) revalidatePath\(p\);[^]*?purgeCdnAfterResponse\(\[\.\.\.paths, \.\.\.revalidateSitemapAndFeeds\(\)\]\);/);
  assert.match(actions, /revalidatePath\(data\.fromPath\);\s*purgeCdnAfterResponse\(\[data\.fromPath\]\);/);
});

test("deploy.sh: purges everything after passing checks, token via stdin, silent without it", () => {
  const deploy = read("ops/vps/deploy.sh");
  const fn = deploy.slice(deploy.indexOf("purge_cdn() {"), deploy.indexOf("\n}\n", deploy.indexOf("purge_cdn() {")));
  assert.match(fn, /^purge_cdn\(\) \{\n {2}\[\[ -n \$\{CLOUDFLARE_API_TOKEN:-\} \]\] \|\| return 0\n/, "returns first, silently, without a token");
  assert.match(fn, /printf 'Authorization: Bearer %s\\n' "\$CLOUDFLARE_API_TOKEN" \|\s*\n\s*curl [^\n]*--max-time 8/);
  assert.match(fn, /--header @-/);
  assert.match(fn, /\{"purge_everything":true\}/);
  // The token's value is expanded exactly twice in the whole script: the guard
  // and the printf into curl's stdin. Nothing else can print it.
  assert.deepEqual(deploy.match(/\$\{?CLOUDFLARE_API_TOKEN[^A-Z_]/g), ["${CLOUDFLARE_API_TOKEN:", '$CLOUDFLARE_API_TOKEN"']);
  // Called only after a release passes its health checks (deploy, --rollback, auto-rollback).
  assert.match(deploy, /log "Live: \$NAME[^\n]*\n {2}purge_cdn\n/);
  assert.match(deploy, /log "Rolled back to \$\(basename "\$target"\)"; purge_cdn; exit 0;/);
  assert.equal(deploy.match(/^\s*purge_cdn$|; purge_cdn;/gm)?.length, 3);
  // load_env reads the env file through the existing sudo rule; no new rule.
  assert.match(read("ops/vps/provision.sh"), /NOPASSWD: \/usr\/bin\/cat \$ENV_FILE/);
});

test("env template documents both variables as run-time, the token as secret", () => {
  const example = read("ops/vps/env.production.example");
  assert.match(example, /# \[run\] Cloudflare zone id[\s\S]*?\nCLOUDFLARE_ZONE_ID=52705f5d3f9f9e7ca73726b78b245459\n/);
  assert.match(example, /# \[run\] \[secret\][\s\S]*?Cache Purge[\s\S]*?\nCLOUDFLARE_API_TOKEN=\n/);
});
