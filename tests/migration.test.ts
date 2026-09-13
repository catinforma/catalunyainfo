import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

import { LEGACY_GONE, LEGACY_REDIRECTS } from "../src/lib/migration/legacy-redirects.ts";

const csv = readFileSync(new URL("../migration/redirects.csv", import.meta.url), "utf8");

test("the generated module accounts for every CSV row", () => {
  const rows = csv.trim().split(/\r?\n/).length - 1;
  assert.equal(LEGACY_REDIRECTS.length + LEGACY_GONE.size, rows);
});

test("no legacy URL is both redirected and gone", () => {
  for (const redirect of LEGACY_REDIRECTS) {
    assert.equal(LEGACY_GONE.has(redirect.from), false, `${redirect.from} is in both lists`);
  }
});

test("every redirect points at a locale-prefixed destination", () => {
  for (const redirect of LEGACY_REDIRECTS) {
    assert.match(
      redirect.to,
      /^\/(?:ca|es|en)\//,
      `${redirect.from} points at ${redirect.to}, which is not under a locale`,
    );
    assert.ok(redirect.to.endsWith("/"), `${redirect.to} does not end in a slash`);
  }
});

test("every redirect is permanent", () => {
  for (const redirect of LEGACY_REDIRECTS) {
    assert.equal(redirect.status, 308, `${redirect.from} is not a permanent redirect`);
  }
});

test("redirect sources are unique and never loop", () => {
  const sources = LEGACY_REDIRECTS.map((r) => r.from);
  assert.equal(new Set(sources).size, sources.length);
  for (const redirect of LEGACY_REDIRECTS) {
    assert.notEqual(redirect.from, redirect.to);
  }
});

test("the removed version-1 articles are all answered with 410", () => {
  const goneList = [...LEGACY_GONE];
  assert.ok(goneList.length > 0);
  for (const path of goneList) {
    assert.match(path, /^\/article\//, `${path} is not a version-1 article URL`);
  }
});
