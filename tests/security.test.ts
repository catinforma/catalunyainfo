import assert from "node:assert/strict";
import { test } from "node:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

const files = walk(SRC);

/**
 * The CSP in `middleware.ts` allows inline script, and the justification for
 * that is that stored content is never turned into HTML. This test is what
 * holds that justification true: `dangerouslySetInnerHTML` may appear in
 * exactly one component, and only to emit JSON-LD produced by JSON.stringify.
 */
test("dangerouslySetInnerHTML appears only in the JSON-LD component", () => {
  const offenders = files.filter(
    (file) =>
      /dangerouslySetInnerHTML\s*=\s*\{/.test(readFileSync(file, "utf8")) &&
      !file.endsWith(join("components", "JsonLd.tsx")),
  );

  assert.deepEqual(
    offenders.map((f) => f.replace(SRC, "")),
    [],
    "stored content must never be rendered as raw HTML",
  );
});

test("no eval or Function constructor in application code", () => {
  const offenders = files.filter((file) => {
    const source = readFileSync(file, "utf8");
    return /\beval\s*\(/.test(source) || /new\s+Function\s*\(/.test(source);
  });

  assert.deepEqual(offenders.map((f) => f.replace(SRC, "")), []);
});

test("no AdSense or ad network script is present anywhere", () => {
  const adSignals = [
    "pagead2.googlesyndication.com",
    "adsbygoogle",
    "data-ad-client",
    "ca-pub-",
  ];

  const offenders = files.filter((file) => {
    const source = readFileSync(file, "utf8");
    // A comment naming the old publisher id is fine; a script tag is not.
    return adSignals.some((signal) => source.includes(`"${signal}`) || source.includes(`'${signal}`));
  });

  assert.deepEqual(
    offenders.map((f) => f.replace(SRC, "")),
    [],
    "this build must ship with no ad code at all",
  );
});

test("the production origin is the canonical host, never a vercel.app alias", async () => {
  const { CANONICAL_HOST, SITE } = await import("../src/lib/site.ts");

  assert.equal(CANONICAL_HOST, "www.catalunyainfo.com");
  assert.equal(SITE.productionOrigin, "https://www.catalunyainfo.com");
  assert.doesNotMatch(SITE.productionOrigin, /vercel\.app/);
});

/**
 * A production build is also served on its `*.vercel.app` alias, with
 * VERCEL_ENV=production. Both the proxy and robots.txt must therefore gate on
 * the request host, not on the environment alone — otherwise enabling indexing
 * would publish a duplicate of the site on a host we do not control.
 */
test("indexing is gated on the request host, not only on the environment", () => {
  const proxy = readFileSync(join(SRC, "proxy.ts"), "utf8");
  assert.match(proxy, /isIndexableRequest\(\s*request/);
  assert.match(proxy, /host === CANONICAL_HOST/);

  // Most responses get X-Robots-Tag statically from next.config.ts, which must
  // add noindex on any host other than the canonical one.
  const config = readFileSync(join(SRC, "..", "next.config.ts"), "utf8");
  assert.match(config, /missing: \[\{ type: "host"[^\]]*value: CANONICAL_HOST/);
  assert.match(config, /INDEXING_ALLOWED\s*=\s*process\.env\.VERCEL_ENV === "production"/);

  const robots = readFileSync(join(SRC, "app", "robots.ts"), "utf8");
  assert.match(robots, /onCanonicalHost/);
});

type HeaderRule = { source: string; missing?: { type: string; value: string }[]; headers: { key: string; value: string }[] };

async function headerRules(env: Record<string, string | undefined>): Promise<HeaderRule[]> {
  const saved = { VERCEL_ENV: process.env.VERCEL_ENV, NEXT_PUBLIC_ALLOW_INDEXING: process.env.NEXT_PUBLIC_ALLOW_INDEXING };
  Object.assign(process.env, env);
  for (const [key, value] of Object.entries(env)) if (value === undefined) delete process.env[key];
  try {
    // A fresh module instance per call: INDEXING_ALLOWED is read at load time.
    const url = `${new URL("../next.config.ts", import.meta.url).href}?env=${encodeURIComponent(JSON.stringify(env))}`;
    const { default: config } = await import(url);
    return (await config.headers()) as HeaderRule[];
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

const robotsRules = (rules: HeaderRule[]) => rules.filter((rule) => rule.headers.some((h) => h.key === "X-Robots-Tag"));

test("X-Robots-Tag rules: canonical host indexable only on production with the switch on", async () => {
  const on = robotsRules(await headerRules({ VERCEL_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: "true" }));
  const generic = on.filter((rule) => rule.source === "/:path*");
  assert.equal(generic.length, 1);
  assert.equal(generic[0]!.missing?.[0]?.type, "host");
  const host = new RegExp(`^${generic[0]!.missing![0]!.value}$`);
  assert.ok(host.test("www.catalunyainfo.com"));
  assert.ok(!host.test("wwwxcatalunyainfo.com"), "dots must be escaped");
  assert.ok(!host.test("catinfov2.vercel.app"));

  for (const env of [{ VERCEL_ENV: "preview", NEXT_PUBLIC_ALLOW_INDEXING: "true" }, { VERCEL_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: undefined }]) {
    const off = robotsRules(await headerRules(env)).filter((rule) => rule.source === "/:path*");
    assert.equal(off.length, 1, JSON.stringify(env));
    assert.equal(off[0]!.missing, undefined, `${JSON.stringify(env)}: noindex everywhere`);
  }

  const { ALWAYS_NOINDEX_SOURCES } = await import("../src/lib/security-headers.ts");
  for (const source of ALWAYS_NOINDEX_SOURCES) {
    assert.ok(on.some((rule) => rule.source === source && !rule.missing), `${source} always noindex`);
  }
});

test("every 410 path is under /article/, the only legacy prefix the proxy matcher covers", async () => {
  const { LEGACY_GONE } = await import("../src/lib/migration/legacy-redirects.ts");
  const outside = [...LEGACY_GONE].filter((path) => !path.startsWith("/article/"));
  assert.deepEqual(outside, [], "widen the matcher in src/proxy.ts before adding these");
  assert.match(readFileSync(join(SRC, "proxy.ts"), "utf8"), /"\/article\/:path\*"/);
});
