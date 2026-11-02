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
  // The environment half of the gate is the shared definition in lib/site.ts
  // (VERCEL_ENV on Vercel, SITE_ENV / NODE_ENV self-hosted), never a second
  // copy that could disagree with robots.txt. Behaviour: the matrix tests below.
  assert.match(config, /import \{ deployEnv \} from "\.\/src\/lib\/site";/);
  assert.match(config, /INDEXING_ALLOWED\s*=\s*deployEnv\(\) === "production" && process\.env\.NEXT_PUBLIC_ALLOW_INDEXING === "true"/);
  assert.match(proxy, /if \(deployEnv\(\) !== "production"\) return false;/);
  assert.doesNotMatch(proxy, /process\.env\.VERCEL_ENV/);

  const robots = readFileSync(join(SRC, "app", "robots.ts"), "utf8");
  assert.match(robots, /onCanonicalHost/);
});

type HeaderRule = { source: string; missing?: { type: string; value: string }[]; headers: { key: string; value: string }[] };

/** Every variable the environment half of the indexing gate reads. */
const GATE_ENV_KEYS = ["VERCEL_ENV", "SITE_ENV", "NODE_ENV", "NEXT_PUBLIC_ALLOW_INDEXING"] as const;

async function withEnv<T>(env: Record<string, string | undefined>, run: () => Promise<T> | T): Promise<T> {
  const keys = new Set<string>([...GATE_ENV_KEYS, ...Object.keys(env)]);
  const saved = Object.fromEntries([...keys].map((key) => [key, process.env[key]]));
  Object.assign(process.env, env);
  for (const [key, value] of Object.entries(env)) if (value === undefined) delete process.env[key];
  try {
    return await run();
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

async function headerRules(env: Record<string, string | undefined>): Promise<HeaderRule[]> {
  return withEnv(env, async () => {
    // A fresh module instance per call: INDEXING_ALLOWED is read at load time.
    const url = `${new URL("../next.config.ts", import.meta.url).href}?env=${encodeURIComponent(JSON.stringify(env))}`;
    const { default: config } = await import(url);
    return (await config.headers()) as HeaderRule[];
  });
}

/**
 * The self-hosted build switch (ops/vps/deploy.sh sets NEXT_OUTPUT=standalone)
 * must leave every other build, Vercel's included, exactly as it was: no
 * `output`, and Next's own compression untouched.
 */
test("next.config: standalone output and compress:false only when NEXT_OUTPUT=standalone", async () => {
  const load = (env: Record<string, string | undefined>) =>
    withEnv(env, async () => {
      const url = `${new URL("../next.config.ts", import.meta.url).href}?build=${encodeURIComponent(JSON.stringify(env))}`;
      return (await import(url)).default as { output?: string; compress?: boolean };
    });

  for (const env of [
    { NEXT_OUTPUT: undefined, VERCEL_ENV: "production" },
    { NEXT_OUTPUT: undefined, VERCEL_ENV: "preview" },
    { NEXT_OUTPUT: "export", VERCEL_ENV: undefined },
  ]) {
    const config = await load(env);
    assert.equal(config.output, undefined, JSON.stringify(env));
    assert.equal("compress" in config, false, JSON.stringify(env));
  }

  const vps = await load({ NEXT_OUTPUT: "standalone", VERCEL_ENV: undefined });
  assert.equal(vps.output, "standalone");
  assert.equal(vps.compress, false, "Caddy compresses (zstd/gzip) in front of the standalone server");
});

/** The generic X-Robots-Tag rule: exempts the canonical host, or noindexes everything. */
async function canonicalHostExempt(env: Record<string, string | undefined>): Promise<boolean> {
  const generic = robotsRules(await headerRules(env)).filter((rule) => rule.source === "/:path*");
  assert.equal(generic.length, 1, JSON.stringify(env));
  return generic[0]!.missing !== undefined;
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

/**
 * The environment matrix of the indexing gate. Vercel always sets VERCEL_ENV
 * (production / preview / development), and it always wins. The self-hosted
 * server (ops/vps) has no VERCEL_ENV: SITE_ENV decides, and a production
 * build without it (`next build` sets NODE_ENV=production) is production, as
 * deployEnv() has always treated it.
 */
const GATE_MATRIX: { name: string; env: Record<string, string | undefined>; expected: string; indexable: boolean }[] = [
  { name: "vercel production + switch", env: { VERCEL_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: "true" }, expected: "production", indexable: true },
  { name: "vercel production, switch off", env: { VERCEL_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: undefined }, expected: "production", indexable: false },
  { name: "vercel preview + switch", env: { VERCEL_ENV: "preview", NEXT_PUBLIC_ALLOW_INDEXING: "true" }, expected: "preview", indexable: false },
  { name: "vercel preview ignores SITE_ENV", env: { VERCEL_ENV: "preview", SITE_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: "true" }, expected: "preview", indexable: false },
  { name: "vercel development ignores SITE_ENV", env: { VERCEL_ENV: "development", SITE_ENV: "production", NODE_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: "true" }, expected: "development", indexable: false },
  { name: "self-hosted SITE_ENV=production + switch", env: { VERCEL_ENV: undefined, SITE_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: "true" }, expected: "production", indexable: true },
  { name: "self-hosted SITE_ENV=production, switch off", env: { VERCEL_ENV: undefined, SITE_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: "false" }, expected: "production", indexable: false },
  { name: "self-hosted SITE_ENV=preview beats NODE_ENV", env: { VERCEL_ENV: undefined, SITE_ENV: "preview", NODE_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: "true" }, expected: "preview", indexable: false },
  { name: "self-hosted production build without SITE_ENV", env: { VERCEL_ENV: undefined, SITE_ENV: undefined, NODE_ENV: "production", NEXT_PUBLIC_ALLOW_INDEXING: "true" }, expected: "production", indexable: true },
  { name: "self-hosted unknown SITE_ENV falls back to NODE_ENV", env: { VERCEL_ENV: undefined, SITE_ENV: "staging", NODE_ENV: "development", NEXT_PUBLIC_ALLOW_INDEXING: "true" }, expected: "development", indexable: false },
  { name: "local dev", env: { VERCEL_ENV: undefined, SITE_ENV: undefined, NODE_ENV: "development", NEXT_PUBLIC_ALLOW_INDEXING: "true" }, expected: "development", indexable: false },
];

test("indexing gate: deployEnv() across Vercel and self-hosted environments", async () => {
  const { deployEnv } = await import("../src/lib/site.ts");
  for (const { name, env, expected } of GATE_MATRIX) {
    assert.equal(await withEnv(env, () => deployEnv()), expected, name);
  }
});

/**
 * robots.txt (indexingAllowed) and the static X-Robots-Tag rules
 * (next.config.ts) must agree in every environment. Before the shared
 * definition, a server without VERCEL_ENV got an inviting robots.txt and a
 * noindex header on every page.
 */
test("indexing gate: robots.txt and the X-Robots-Tag rules agree in every environment", async () => {
  const { indexingAllowed } = await import("../src/lib/site.ts");
  for (const { name, env, indexable } of GATE_MATRIX) {
    assert.equal(await withEnv(env, () => indexingAllowed()), indexable, `robots.txt: ${name}`);
    assert.equal(await canonicalHostExempt(env), indexable, `X-Robots-Tag: ${name}`);
  }
});

test("every 410 path is under /article/, the only legacy prefix the proxy matcher covers", async () => {
  const { LEGACY_GONE } = await import("../src/lib/migration/legacy-redirects.ts");
  const outside = [...LEGACY_GONE].filter((path) => !path.startsWith("/article/"));
  assert.deepEqual(outside, [], "widen the matcher in src/proxy.ts before adding these");
  assert.match(readFileSync(join(SRC, "proxy.ts"), "utf8"), /"\/article\/:path\*"/);
});
