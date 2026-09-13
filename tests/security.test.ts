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

test("the production origin is never a vercel.app host", () => {
  const site = readFileSync(join(SRC, "lib", "site.ts"), "utf8");
  assert.match(site, /productionOrigin:\s*"https:\/\/www\.catalunyainfo\.com"/);
  assert.doesNotMatch(site, /productionOrigin:[^\n]*vercel\.app/);
});
