import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { HERO_SIZES } from "../src/lib/layout/hero-image.ts";

/**
 * Guards for the Core Web Vitals pass of 21 Nov 2026 (docs/SEO_EXPERIMENTS.md):
 * the LCP hero is the only high-priority image, and phones at >= 2.5 dppx
 * fetch a ~2x hero instead of a 3x-4x one.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

test("wordmark mark: eager but low priority, so React adds no head preload for it", () => {
  const src = read("src/components/Wordmark.tsx");
  const img = /<Image src="\/icon-192\.png"[^>]*\/>/.exec(src)?.[0] ?? "";
  assert.ok(img, "the mark is a next/image");
  // react-dom-server preloads every <img> that is neither lazy nor
  // fetchPriority="low" with a high-priority <link rel="preload">.
  assert.match(img, /fetchPriority="low"/);
  assert.match(img, /loading="eager"/);
  assert.doesNotMatch(img, /\b(preload|priority)\b/);
});

test("article hero: still preloaded at high priority, with the phone-capped sizes", () => {
  const src = read("src/components/pages/EntryArticle.tsx");
  const hero = src.slice(src.indexOf("const hero = entry.hero"), src.indexOf("</figure>", src.indexOf("const hero = entry.hero")));
  assert.match(hero, /sizes=\{HERO_SIZES\}/);
  assert.match(hero, /\n\s*preload\n/);
  assert.match(hero, /fetchPriority="high"/);
  assert.doesNotMatch(hero, /sizes="100vw"/);
});

test("HERO_SIZES: phones below md at >= 2.5 dppx get 70vw, everything else 100vw", () => {
  assert.equal(HERO_SIZES, "(max-width: 47.99rem) and (min-resolution: 2.5dppx) 70vw, 100vw");
  // The last entry (no media condition) is what older browsers and every
  // other screen use: the full width, as before.
  assert.equal(HERO_SIZES.split(",").at(-1)?.trim(), "100vw");
  // Tailwind's md is 48rem: the hero's phone crop (max-h-[40vw]) ends there.
  assert.match(read("src/components/pages/EntryArticle.tsx"), /md:max-h-\[32rem\]/);
});

test("HERO_SIZES: no phone drops below ~1.9x the hero's CSS width", () => {
  // deviceSizes as in next.config.ts; the browser takes the variant nearest
  // to slot x dppx (Chromium: the smaller one when the slot sits below the
  // geometric mean of the two neighbours).
  const config = read("next.config.ts");
  assert.match(config, /deviceSizes: \[360, 420, 640, 828, 1080, 1200, 1600, 1920\]/);
  const widths = [360, 420, 640, 828, 1080, 1200, 1600, 1920];
  const pick = (slot: number, dppx: number) => {
    for (let i = 0; i < widths.length - 1; i++) {
      const a = widths[i]! / slot;
      const b = widths[i + 1]! / slot;
      if (dppx <= a) return widths[i]!;
      if (dppx < b) return Math.sqrt(a * b) >= dppx ? widths[i]! : widths[i + 1]!;
    }
    return widths.at(-1)!;
  };
  for (const [css, dppx] of [[360, 3], [393, 3], [412, 2.625], [412, 3.5], [430, 3]] as const) {
    const chosen = pick(css * 0.7, dppx);
    assert.ok(chosen / css >= 1.9, `${css}px @${dppx}: ${chosen}w is ${(chosen / css).toFixed(2)}x`);
    assert.ok(chosen < pick(css, dppx) || dppx < 2.5, `${css}px @${dppx}: smaller than with 100vw`);
  }
});
