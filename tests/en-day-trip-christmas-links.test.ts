import assert from "node:assert/strict";
import { test } from "node:test";

import { FIGUERES } from "../src/lib/content/batch02/figueres.ts";
import { TARRAGONA } from "../src/lib/content/batch02/coast-trips.ts";
import { EN_TOWNS } from "../src/lib/programmatic/christmas-fairs/paths.ts";
import { towns } from "../src/lib/programmatic/christmas-fairs/data.ts";

/**
 * 25 Nov 2026: the English Tarragona and Figueres day-trip guides link their
 * English Christmas-market town page once, in a "Going in December?" sentence
 * (same pattern as Girona, tests/girona-en-christmas-link.test.ts). Each target
 * exists in English (INE in EN_TOWNS) and has a dated fair. Catalan and Spanish
 * guides are untouched. There is no Vic day-trip guide to link from.
 */
for (const [slug, article] of [
  ["tarragona", TARRAGONA],
  ["figueres", FIGUERES],
] as const) {
  test(`EN ${slug} day-trip guide links /en/christmas-markets/${slug}/ once, and that page exists`, () => {
    const en = JSON.stringify(article.editions.en!.blocks);
    assert.equal((en.match(new RegExp(`/en/christmas-markets/${slug}/`, "g")) ?? []).length, 1);
    assert.match(en, /Going in December\?/);
    const town = towns().find((t) => t.slug === slug);
    assert.ok(town && town.fairs.length > 0, `${slug} has a dated fair`);
    assert.ok(EN_TOWNS.includes(town!.ine), `${slug} has an English page`);
    for (const locale of ["ca", "es"] as const) assert.doesNotMatch(JSON.stringify(article.editions[locale]!.blocks), new RegExp(`(fires-de-nadal|mercados-navidad|christmas-markets)/${slug}`));
  });
}
