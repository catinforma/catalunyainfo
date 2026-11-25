import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// 25 Nov 2026: Search Console flags "creator" and "copyrightNotice" as missing on article
// ImageObjects. Both builders now emit them from the photograph's own credit and licence.
const root = join(import.meta.dirname, "..");

test("article ImageObjects carry creator (Person) and copyrightNotice from the credit and licence", () => {
  const src = readFileSync(join(root, "src/lib/seo/jsonld.ts"), "utf8");
  assert.match(src, /creator: \{ "@type": "Person", name: source\.credit \}/);
  assert.match(src, /copyrightNotice: source\.license \? `\$\{source\.credit\}, \$\{source\.license\}` : source\.credit/);
});

test("place photo ImageObjects carry creator and copyrightNotice", () => {
  const src = readFileSync(join(root, "src/lib/content/place-photos.ts"), "utf8");
  assert.match(src, /creator: \{ "@type": "Person", name: photo\.credit \}/);
  assert.match(src, /copyrightNotice: photo\.licence \? `\$\{photo\.credit\}, \$\{photo\.licence\}` : photo\.credit/);
});
