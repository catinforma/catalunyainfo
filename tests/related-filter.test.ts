import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { B2_PATHS, b2href, type B2Key } from "../src/lib/content/batch02/shared.ts";
import { STRIKE_11N_CITY_REFS, strike11nCityHref } from "../src/lib/content/batch02/strike-11n-city-paths.ts";
import { isStrikePath, relatedFillAllowed } from "../src/lib/content/related-filter.ts";
import { CATALONIA_STRIKE_KEYS, SPAIN_STRIKE_KEYS } from "../src/lib/engagement/next-step.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * The automatic related cards (repository.ts relatedFill, 23 Nov 2026):
 * no noindex page, and no strike page on a page that is not about a strike.
 */

const TODAY = "2026-11-23";
const STRIKE_KEYS: readonly B2Key[] = [...CATALONIA_STRIKE_KEYS, ...SPAIN_STRIKE_KEYS];

test("every strike page of the registry, and every 11N city page, is told by its path; no other registry page is", () => {
  for (const locale of LOCALES) {
    for (const key of Object.keys(B2_PATHS) as B2Key[]) {
      const href = b2href(key, locale);
      assert.equal(isStrikePath(href), STRIKE_KEYS.includes(key), `${key}/${locale}: ${href}`);
    }
    for (const ref of STRIKE_11N_CITY_REFS) assert.ok(isStrikePath(strike11nCityHref(ref.key, locale)), `11N ${ref.key}/${locale}`);
  }
  assert.ok(isStrikePath("/es/guias/huelga-general-11-noviembre/"));
  assert.ok(isStrikePath("/ca/guies/vaga-general-11-novembre-espanya/"));
  assert.ok(isStrikePath("/en/guides/general-strike-11-november-spain-by-city/"));
  for (const path of ["/es/guias/aparcar-barcelona-zona-azul-verde/", "/ca/escapades/vall-de-nuria-cremallera/", "/es/festivos/barcelona/", "/en/guides/barcelona-weather-by-month/"]) {
    assert.ok(!isStrikePath(path), path);
  }
});

test("an evergreen page gets no strike card from the fill; strike pages still fill with each other", () => {
  const parking = b2href("parking", "es");
  assert.equal(relatedFillAllowed(parking, b2href("strikes", "es"), TODAY), false);
  assert.equal(relatedFillAllowed(parking, b2href("strike26n", "es"), TODAY), false);
  assert.equal(relatedFillAllowed(parking, b2href("zbe", "es"), TODAY), true);
  assert.equal(relatedFillAllowed(b2href("strikes", "es"), b2href("strike26n", "es"), TODAY), true);
  assert.equal(relatedFillAllowed(b2href("strike20n", "ca"), b2href("strikesSpain", "ca"), TODAY), true);
});

test("no card for a noindex page (the 11N city pages, low-demand.ts), not even from a strike page", () => {
  for (const locale of LOCALES) {
    for (const ref of STRIKE_11N_CITY_REFS.slice(0, 3)) {
      const city = strike11nCityHref(ref.key, locale);
      assert.equal(relatedFillAllowed(b2href("strikes", locale), city, TODAY), false, `${ref.key}/${locale}`);
      assert.equal(relatedFillAllowed(b2href("parking", locale), city, TODAY), false, `${ref.key}/${locale}`);
    }
  }
});

test("the fill asks for headroom and filters in rank order, so hand-picked relations are untouched", () => {
  const repo = readFileSync(new URL("../src/lib/content/repository.ts", import.meta.url), "utf8");
  const fill = repo.slice(repo.indexOf("async function relatedFill("));
  assert.match(fill, /\.limit\(count \+ RELATED_FILL_HEADROOM\)/);
  assert.match(fill, /\.filter\(\(summary\) => relatedFillAllowed\(ownHref, summary\.href\)\)\s*\.slice\(0, count\)/);
  // The hand-picked relations (summariesByEntryIds) do not go through the filter.
  const chosen = repo.slice(repo.indexOf("const chosen ="), repo.indexOf("const related ="));
  assert.ok(!chosen.includes("relatedFillAllowed"));
});
