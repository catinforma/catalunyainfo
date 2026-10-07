import assert from "node:assert/strict";
import { test } from "node:test";

import { BATCH_02 } from "../src/lib/content/batch02/publish.ts";
import { FEATURES } from "../src/lib/content/features/publish.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { HERO as MUSHROOM_HERO } from "../src/lib/content/mushrooms/payload.ts";
import { assertHasPhoto, type ImageSpec } from "../src/lib/content/publish-article.ts";

/**
 * House rule: every article carries at least one photograph.
 *
 * The publisher enforces it at publish time; these tests catch the same
 * mistake before a deploy, when a hero key points at a file that is not in the
 * image manifest and the article would otherwise have refused to publish.
 */

const image = (key: string): ImageSpec => ({
  key,
  url: `/images/${key}.webp`,
  width: 1600,
  height: 900,
  blurDataUrl: "",
  credit: null,
  license: null,
  alt: {},
  caption: {},
});

test("an article with no lead image is refused", () => {
  assert.throws(() => assertHasPhoto({ entryKey: "x", images: [] }), /at least one photo/);
  assert.throws(() => assertHasPhoto({ entryKey: "x", heroKey: "a", images: [] }), /at least one photo/);
  assert.throws(
    () => assertHasPhoto({ entryKey: "x", heroKey: "a", images: [image("b")] }),
    /at least one photo/,
  );
});

test("an article whose lead image is among its images is accepted", () => {
  assert.doesNotThrow(() => assertHasPhoto({ entryKey: "x", heroKey: "a", images: [image("a")] }));
});

test("every hero key named in code exists in the image manifest", () => {
  const heroKeys = [
    ...FEATURES.map((article) => [article.entryKey, article.heroKey] as const),
    ...BATCH_02.map((article) => [article.entryKey, article.heroKey] as const),
    ["mushroom-conditions-catalunya", MUSHROOM_HERO.key] as const,
    ["guide-is-today-a-holiday-catalonia", "calendari-laboral-catalunya-diada"] as const,
    ["tourist-tax", "taxa-turistica-barcelona-skyline"] as const,
    ["holiday-calendar", "calendari-laboral-catalunya-diada"] as const,
  ];
  for (const [entry, key] of heroKeys) {
    assert.ok(key, `${entry}: no hero image`);
    assert.ok(IMAGE_BY_KEY.has(key), `${entry}: hero image ${key} is not in the manifest`);
  }
});
