import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

/**
 * Guards for the design pass of 27 Nov 2026 (docs/SEO_EXPERIMENTS.md, "Design
 * pass: shared layer"). Live screenshots of 13 templates at 412 and 1280 px,
 * light and dark; each test names what looked wrong before. The ad reserves
 * are checked too: the pass was not allowed to move or resize an ad box.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const css = read("src/app/globals.css");

test("a box in the article column starts at its own padding, not 2.4em lower", () => {
  // Before: every calculator card and the guides' "at a glance" box opened
  // with a 40-45 px empty band (the `.ci-prose h2` margin on their first heading).
  assert.match(css, /\.ci-prose\s*:is\(\s*\.ci-calc,\s*\.ci-calendar,\s*\.ci-margin-block,[\s\S]*?\)\s*> :first-child \{\s*margin-top: 0;/);
  assert.match(css, /\.ci-prose > :first-child:not\(\.ci-ad\) \{\s*margin-top: 0;/);
  assert.match(css, /\.ci-prose > \.ci-today:first-child \{\s*margin-top: 0;/);
});

test("running-text lists show bullets and numbers again; component lists keep their own look", () => {
  // Before: Tailwind's preflight left every list in an article without markers.
  assert.match(css, /\.ci-prose ul:not\(\[class\]\) \{\s*list-style: disc;/);
  assert.match(css, /\.ci-prose ol:not\(\[class\]\) \{\s*list-style: decimal;/);
});

test("the calculator's main figure is the largest thing in the card", () => {
  assert.match(css, /\.ci-calc-total dd \{\s*font-family: var\(--font-display\);\s*font-size: var\(--text-2xl\);/);
});

test("external links carry a north-east arrow (inline SVG mask, no request), not a '>' chevron", () => {
  const rule = css.slice(css.indexOf(".ci-prose a[data-external]::after"));
  assert.match(rule, /mask: url\("data:image\/svg\+xml,/);
  assert.doesNotMatch(rule.slice(0, 900), /rotate\(45deg\)/);
});

test("alert strip: the rule between lines is a flex gap, so a hidden line leaves no stray rule", () => {
  assert.doesNotMatch(css, /\.ci-alerts li \+ li \{/);
  assert.match(css, /\.ci-alerts ul \{\s*display: flex;\s*flex-direction: column;\s*row-gap: 1px;/);
});

test("footer: two columns of links on a phone, the e-mail address on its own row", () => {
  assert.match(css, /@media \(max-width: 39\.99rem\) \{\s*\.ci-footer nav > ul \{\s*display: grid;\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(css, /li:has\(> a\[href\^="mailto:"\]\) \{\s*grid-column: 1 \/ -1;/);
});

test("separator dots in the one-line link boxes stick to the link before them", () => {
  for (const file of ["src/components/ElectionLine.tsx", "src/components/CalculatorLine.tsx", "src/components/HomeTools.tsx"]) {
    assert.match(read(file), /"\\u00a0· "/, file);
  }
});

test("ad reserves unchanged by the design pass (CLS)", () => {
  assert.match(css, /\.ci-ad \{\s*--ci-ad-chrome: calc\(1px \+ 2\.25rem\);\s*clear: both;\s*margin: 2\.5rem 0;\s*padding-top: 0\.5rem;\s*border-top: 1px solid var\(--color-rule\);\s*min-height: 280px;/);
  assert.match(css, /\.ci-ad-middle \{\s*--ci-ad-min: 105vw;\s*min-height: calc\(105vw \+ var\(--ci-ad-chrome\)\);/);
  assert.match(css, /\.ci-ad-top,\s*\.ci-ad-home-top \{\s*--ci-ad-h: 250px;/);
  assert.match(css, /\.ci-prose > \.ci-ad-top \{\s*margin: 2rem 0;/);
});
