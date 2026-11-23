import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * 29N origin load (23 Nov 2026, docs/SEO_EXPERIMENTS.md "29N town pages:
 * origin cost per page view"). Cloudflare caches the election pages' HTML but
 * never their RSC payloads, so every `next/link` that prefetches on entering
 * the viewport sends the single Node process an uncached request (route tree,
 * then segments) per page view; a stale or never-rendered target is a full
 * render. Measured in headless Chromium on a copy of the live build: a
 * scrolled town page sent 12 such requests, a comarca page 6 and more (its
 * 42 other-comarca links). The election templates' links now prefetch on
 * intent (IntentLink) or not at all (town lists, as since 18 Nov).
 */
const read = (path: string) => readFileSync(new URL(`../src/components/${path}`, import.meta.url), "utf8");

for (const file of ["programmatic/ElectionResultsPage.tsx", "programmatic/ElectionsComarcaPage.tsx", "programmatic/ElectionsHubPage.tsx", "NextStep.tsx"]) {
  test(`${file}: no link prefetches just for being on screen`, () => {
    const text = read(file);
    const plain = text.match(/<Link\b[^>]*>/g) ?? [];
    for (const tag of plain) assert.match(tag, /prefetch=\{false\}/, `${file}: ${tag}`);
  });
}

test("the town page's comarca, hub and guide links, the comarca page's links and the next-step box prefetch on intent", () => {
  const town = read("programmatic/ElectionResultsPage.tsx");
  assert.match(town, /<IntentLink href=\{model\.siblings\.comarca\.href\}>/);
  assert.match(town, /<IntentLink href=\{model\.siblings\.hub\.href\}>/);
  assert.match(town, /model\.related\.links\.map\(\(item\) => \(\s*<li key=\{item\.href\}>\s*<IntentLink href=\{item\.href\}>/);
  // The sibling towns stay without any prefetch (18 Nov 2026).
  assert.match(town, /<Link href=\{item\.href\} prefetch=\{false\}>/);

  const comarca = read("programmatic/ElectionsComarcaPage.tsx");
  assert.equal((comarca.match(/<IntentLink\b/g) ?? []).length, 3, "other comarques, hub, guides");
  assert.match(comarca, /<Link href=\{row\.href\} prefetch=\{false\}>/);

  const box = read("NextStep.tsx");
  assert.doesNotMatch(box, /from "next\/link"/);
  assert.match(box, /<IntentLink href=\{link\.href\}>/);
  assert.match(read("nav/IntentLink.tsx"), /prefetch=\{intent \? null : false\}/);
});
