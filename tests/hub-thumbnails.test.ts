import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

// 17 Nov 2026, home page on a phone: the four hub thumbnails (104 px squares)
// downloaded 117 KB at DPR 1.75 and 265 KB at DPR 3 with `sizes` ending in
// 92vw; with 10rem, 37 KB and 73 KB (Playwright, production images).
test("cards in a .ci-grid--hub ask for thumbnail-sized images on phones", () => {
  const card = read("src/components/EntryCard.tsx");
  assert.match(card, /sizes=\{`\(min-width: 1024px\) 22rem, \(min-width: 640px\) 45vw, \$\{phoneThumb \? "10rem" : "92vw"\}`\}/);
  // The thumbnail layout is the phone media query of .ci-grid--hub: 6.5rem square.
  const css = read("src/app/globals.css");
  assert.match(css, /@media \(max-width: 39\.99rem\) \{\s*\.ci-grid--hub \{[\s\S]*?grid-template-columns: 6\.5rem minmax\(0, 1fr\);/);
  // The 640 px breakpoint in `sizes` is the same one where the thumbnail layout ends.
  for (const page of ["src/app/(public)/[locale]/page.tsx", "src/app/(public)/[locale]/[...slug]/page.tsx"]) {
    const src = read(page);
    const grids = src.split('className="ci-grid ci-grid--hub"').slice(1);
    assert.ok(grids.length > 0, page);
    for (const grid of grids) {
      const card = grid.slice(0, grid.indexOf("/>"));
      assert.match(card, /<EntryCard[\s\S]*phoneThumb/, page);
    }
  }
});
