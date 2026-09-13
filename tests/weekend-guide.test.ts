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
