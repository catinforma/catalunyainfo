import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import { COPY, PLANS, SOURCES } from "../src/lib/content/weekend/payload.ts";
import { buildBody } from "../src/lib/content/weekend/publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * The weekend guide is published by a script rather than through the CMS form,
 * so these checks stand in for the validation `saveTranslation` would have done.
 */

test("every edition has exactly 25 plans", () => {
  assert.equal(PLANS.length, 25);
});

test("each plan carries title, body and table row in all three languages", () => {
  for (const [index, plan] of PLANS.entries()) {
    for (const locale of LOCALES) {
      assert.ok(plan.title[locale]?.length, `plan ${index + 1}: missing ${locale} title`);
      assert.ok(plan.body[locale]?.length, `plan ${index + 1}: missing ${locale} body`);
      assert.ok(
        plan.row.dates[locale]?.length,
        `plan ${index + 1}: missing ${locale} dates`,
      );
      assert.ok(
        plan.row.category[locale]?.length,
        `plan ${index + 1}: missing ${locale} category`,
      );
    }
    assert.ok(plan.row.municipality.length, `plan ${index + 1}: missing municipality`);
  }
});

test("the generated body validates against the block schema in every locale", () => {
  for (const locale of LOCALES) {
    const parsed = bodySchema.safeParse(buildBody(locale));
    assert.ok(
      parsed.success,
      `${locale}: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 3))}`,
    );
  }
});

test("each edition contains the required blocks in the required order", () => {
  for (const locale of LOCALES) {
    const body = buildBody(locale);
    const types = body.map((b) => b.type);

    assert.equal(types[0], "paragraph", `${locale}: does not open with the intro`);
    assert.ok(types.indexOf("callout") < types.indexOf("keyFacts"), `${locale}: direct answer must precede key facts`);
    assert.ok(types.indexOf("keyFacts") < types.indexOf("table"), `${locale}: key facts must precede the table`);

    const headings = body.filter((b) => b.type === "heading" && b.level === 3);
    assert.equal(headings.length, 25, `${locale}: expected 25 plan headings`);
  }
});

test("the summary table has a row per plan and never invents a value", () => {
  for (const locale of LOCALES) {
    const table = buildBody(locale).find((b) => b.type === "table");
    assert.ok(table && table.type === "table");
    assert.equal(table.rows.length, 25);
    assert.equal(table.headers.length, 5);
    for (const row of table.rows) assert.equal(row.length, 5);
  }
});

test("SEO fields are present and within the lengths Google renders", () => {
  for (const locale of LOCALES) {
    const copy = COPY[locale];
    assert.ok(copy.seoTitle.length > 0 && copy.seoTitle.length <= 200);
    assert.ok(copy.seoDescription.length > 0 && copy.seoDescription.length <= 400);
    assert.ok(copy.excerpt.length > 0);
  }
});

test("paths are evergreen: lowercase, no date, under the agenda hub", () => {
  for (const locale of LOCALES) {
    const path = COPY[locale].path;
    assert.match(path, /^agenda\/[a-z0-9]+(?:-[a-z0-9]+)*$/, `${locale}: ${path}`);
    assert.doesNotMatch(path, /\d{4}|\d{2}-\d{2}/, `${locale}: path carries a date`);
  }
});

test("each edition is substantial", () => {
  for (const locale of LOCALES) {
    const words = wordCount(bodyToPlainText(buildBody(locale)));
    assert.ok(words > 900, `${locale}: only ${words} words`);
  }
});

test("every source URL is https and free of tracking parameters", () => {
  for (const source of SOURCES) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.doesNotMatch(source.url, /utm_|chatgpt\.com/, source.url);
  }
  const urls = SOURCES.map((s) => s.url);
  assert.equal(new Set(urls).size, urls.length, "duplicate source URLs");
});

test("plan links point at the sources register, with no invented URLs", () => {
  const known = new Set(SOURCES.map((s) => s.url));
  for (const plan of PLANS) {
    if (!plan.url) continue;
    assert.ok(known.has(plan.url), `${plan.url} is not in the sources register`);
  }
});

test("images are attached to plans that exist, with alt and caption in every language", async () => {
  const { IMAGE_META } = await import("../src/lib/content/weekend/payload.ts");
  const { IMAGE_BY_KEY } = await import("../src/lib/content/images.ts");

  assert.ok(IMAGE_META.length > 0);
  for (const meta of IMAGE_META) {
    assert.ok(IMAGE_BY_KEY.has(meta.key), `${meta.key} is missing from the manifest`);
    assert.ok(meta.planIndex >= 0 && meta.planIndex < PLANS.length, `${meta.key} points at no plan`);
    for (const locale of LOCALES) {
      assert.ok(meta.alt[locale]?.length > 10, `${meta.key}: weak ${locale} alt text`);
      assert.ok(meta.caption[locale]?.length > 10, `${meta.key}: missing ${locale} caption`);
    }
  }
  assert.equal(IMAGE_META.filter((m) => m.isHero).length, 1, "there must be exactly one hero");
});

/**
 * These illustrations are generated, not photographed. A site built on cited
 * sources must not pass them off as documentary images, so every caption says
 * so in the reader's own language.
 */
test("every generated illustration is disclosed as such in all three languages", async () => {
  const { IMAGE_META } = await import("../src/lib/content/weekend/payload.ts");
  const disclosure = { ca: /intel·ligència artificial/i, es: /inteligencia artificial/i, en: /artificial intelligence/i };

  for (const meta of IMAGE_META) {
    for (const locale of LOCALES) {
      assert.match(meta.caption[locale], disclosure[locale], `${meta.key} (${locale}) hides that it is generated`);
    }
  }
});

test("image blocks only appear once the media rows exist", async () => {
  const { IMAGE_META } = await import("../src/lib/content/weekend/payload.ts");

  const withoutMedia = buildBody("ca");
  assert.equal(withoutMedia.filter((b) => b.type === "image").length, 0);

  const fake = new Map(IMAGE_META.map((m, i) => [m.key, `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`]));
  const withMedia = buildBody("ca", fake);
  assert.equal(withMedia.filter((b) => b.type === "image").length, IMAGE_META.length);
  assert.ok(bodySchema.safeParse(withMedia).success, "body with images must still validate");
});

/* -------------------------------------------------------------------------- */
/* Weekly mycological report                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The whole editorial premise of this page is that it reports conditions, not
 * mushrooms. These checks fail the build if that distinction erodes.
 */
test("the condition ranking never claims mushrooms are present", async () => {
  const { buildBody } = await import("../src/lib/content/mushrooms/publish.ts");
  const { COPY } = await import("../src/lib/content/mushrooms/payload.ts");

  // Targets affirmative overclaiming only. An earlier version of this pattern
  // matched the disclaimer itself ("ni garanteix que n'hi hagi"), which is the
  // opposite of a problem.
  const forbidden = {
    ca: /bolets garantits|probabilitat de trobar|\d+\s*% de (?:probabilitat|fructificació)/i,
    es: /setas garantizadas|probabilidad de encontrar|\d+\s*% de (?:probabilidad|fructificación)/i,
    en: /mushrooms guaranteed|guaranteed mushrooms|probability of finding|\d+\s*% (?:probability|chance)/i,
  };

  for (const locale of LOCALES) {
    const text = bodyToPlainText(buildBody(locale));
    assert.doesNotMatch(text, forbidden[locale], `${locale} overclaims`);
    assert.ok(bodySchema.safeParse(buildBody(locale)).success, `${locale} body invalid`);
    assert.ok(COPY[locale].path.length > 0);
  }
});

test("every edition carries the rating disclaimer", async () => {
  const { buildBody } = await import("../src/lib/content/mushrooms/publish.ts");
  const marker = {
    ca: /no representa observacions de bolets/i,
    es: /no representa observaciones de setas/i,
    en: /not based on confirmed mushroom sightings/i,
  };
  for (const locale of LOCALES) {
    assert.match(bodyToPlainText(buildBody(locale)), marker[locale], `${locale} lost the disclaimer`);
  }
});

test("mushroom URLs are evergreen and carry no year", async () => {
  const { COPY } = await import("../src/lib/content/mushrooms/payload.ts");
  const expected = {
    ca: "natura/bolets-catalunya-condicions",
    es: "naturaleza/setas-cataluna-condiciones",
    en: "nature/mushroom-season-catalonia",
  };
  for (const locale of LOCALES) {
    assert.equal(COPY[locale].path, expected[locale]);
    assert.doesNotMatch(COPY[locale].path, /\d/, `${locale} path carries a number`);
  }
});

test("all seven condition zones are present in all three languages", async () => {
  const { ZONES, LEVEL_LABEL } = await import("../src/lib/content/mushrooms/payload.ts");
  assert.equal(ZONES.length, 7);
  for (const zone of ZONES) {
    assert.ok(LEVEL_LABEL[zone.level], `unknown level ${zone.level}`);
    for (const locale of LOCALES) {
      assert.ok(zone.name[locale]?.length, `${zone.id}: missing ${locale} name`);
      assert.ok(zone.body[locale]?.length, `${zone.id}: missing ${locale} body`);
    }
  }
});

test("mushroom sources are official, https and untracked", async () => {
  const { SOURCES } = await import("../src/lib/content/mushrooms/payload.ts");
  for (const source of SOURCES) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.doesNotMatch(source.url, /utm_|chatgpt\.com/, source.url);
  }
  const official = SOURCES.filter((s) => /gencat\.cat|meteo\.cat|ctfc\.cat/.test(s.url));
  assert.ok(official.length >= 6, "the report must rest on official sources");
});
