import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

/**
 * Guards for the accessibility fixes of 17 Nov 2026 (axe-core 4.11 on 33
 * templates, mobile + desktop, light + dark; keyboard walk of every
 * calculator). Each test names what failed before.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

test("header: below 390 px the wordmark gives way, never the language links or the menu button (WCAG 1.4.10)", () => {
  // Before: at 360 px "CatalunyaInfo" was drawn over "CA"; at 320 px the menu
  // button sat 14 px off-screen and every page scrolled sideways.
  const header = read("src/components/SiteHeader.tsx");
  assert.match(header, /className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-0"/);
  const css = read("src/app/globals.css");
  const narrow = css.slice(css.indexOf("@media (max-width: 24.374rem)"));
  assert.match(narrow, /\.ci-wordmark \{\s*min-width: 0;[\s\S]*?font-size: clamp\(1rem, 14\.9vw - 2\.2rem, var\(--text-xl\)\);/);
  assert.match(narrow, /\.ci-wordmark-name \{\s*min-width: 0;\s*overflow: hidden;/);
  // The name is hidden visually below 342 px but stays the link's accessible name.
  assert.match(css, /@media \(max-width: 21\.374rem\) \{\s*\.ci-wordmark-name \{\s*position: absolute;/);
  assert.match(read("src/components/Wordmark.tsx"), /<span className="ci-wordmark-name">/);
});

test("transport ticket selector announces the cheapest ticket and has a level-2 title (WCAG 4.1.3, heading order)", () => {
  const src = read("src/components/blocks/TransportPassSelector.tsx");
  assert.match(src, /<p className="ci-visually-hidden" role="status">/);
  assert.match(src, /<h2 className="ci-calc-title">\{t\.title\}<\/h2>/);
  // The arrow in the visible tag is not read out.
  assert.match(src, /t\.cheapestTag\.replace\(\/\^←\\s\*\/, ""\)/);
});

test("embed builder: both code boxes are named by their headings (axe label, critical)", () => {
  const src = read("src/components/programmatic/embed-2027/EmbedBuilder.tsx");
  // The box itself (CodeBox.tsx, shared with the town pages and the calculators): named by a heading or a label.
  const box = read("src/components/programmatic/embed-2027/CodeBox.tsx");
  assert.match(box, /<textarea\s+id=\{id\}\s+aria-labelledby=\{labelledBy\}\s+aria-label=\{labelledBy \? undefined : label\}/);
  assert.match(src, /<h2 id=\{`\$\{id\}-iframe-title`\}/);
  assert.match(src, /<h2 id=\{`\$\{id\}-link-title`\}/);
  assert.match(src, /labelledBy=\{`\$\{id\}-iframe-title`\}/);
  assert.match(src, /labelledBy=\{`\$\{id\}-link-title`\}/);
});

test("ITV fee table: stacked source links are 8 px apart (WCAG 2.5.8 target size)", () => {
  assert.match(read("src/components/programmatic/itv/ItvPage.tsx"), /<span key=\{src\.url\} className="mt-2 block first:mt-0">/);
});

test("page feedback: the thanks lands in a status region that was already mounted", () => {
  const src = read("src/components/PageFeedback.tsx");
  // One return; the status paragraph sits after the conditional block, so it exists before the answer.
  assert.equal(src.match(/\breturn \(/g)?.length, 1);
  assert.match(src, /\{sent \? null : \([\s\S]*?\)\}\s*<p role="status"/);
  assert.doesNotMatch(src, /if \(sent\)/);
});
