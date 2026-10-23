import assert from "node:assert/strict";
import { test } from "node:test";

import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { COPY as LOCAL_COPY } from "../src/lib/content/holidays/local-publish.ts";
import { COPY as TODAY_COPY } from "../src/lib/content/holidays/today-publish.ts";
import { ORDER, PATHS, SEASONAL, toolsFor, type ToolKey } from "../src/lib/content/home-tools.ts";
import { COPY as MUSHROOM_COPY } from "../src/lib/content/mushrooms/payload.ts";
import { COPY as AUTUMN_COPY } from "../src/lib/content/autumn/payload.ts";
import { ARTICLE_PATHS as FEATURE_PATHS } from "../src/lib/content/features/shared.ts";
import { COPY as RESERVOIR_COPY } from "../src/lib/content/reservoirs/publish.ts";
import { AIRPORT_META } from "../src/lib/content/batch02/airport.ts";
import { CARDS_META } from "../src/lib/content/batch02/cards.ts";
import { MONUMENTS_META } from "../src/lib/content/batch02/monuments.ts";
import { MUSEUMS_META } from "../src/lib/content/batch02/museums.ts";
import { VOTING_META } from "../src/lib/content/batch02/voting.ts";
import { BARCELONA_HUB_META } from "../src/lib/content/batch02/barcelona-hub.ts";
import { CLOCK_CHANGE_META } from "../src/lib/content/batch02/clock-change.ts";
import { BEACHES_META } from "../src/lib/content/batch02/beaches.ts";
import { COPY as SCHOOL_COPY } from "../src/lib/content/school/publish.ts";
import { COPY as TAX_COPY } from "../src/lib/content/tourist-tax/copy.ts";
import { EVERGREEN } from "../src/lib/content/weekend/evergreen.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

// The homepage links are hand-written; the pages' own publishers own the slugs.
const OWNER: Record<ToolKey, (locale: (typeof LOCALES)[number]) => string> = {
  holiday: (l) => TODAY_COPY[l].path,
  weekend: (l) => EVERGREEN[l].path,
  localHolidays: (l) => LOCAL_COPY[l].path,
  transport: (l) => B2_PATHS.transport[l],
  tax: (l) => TAX_COPY[l].path,
  mushrooms: (l) => MUSHROOM_COPY[l].path,
  reservoirs: (l) => RESERVOIR_COPY[l].path,
  school: (l) => SCHOOL_COPY[l].path,
  airport: (l) => AIRPORT_META[l].path,
  museums: (l) => MUSEUMS_META[l].path,
  monuments: (l) => MONUMENTS_META[l].path,
  cards: (l) => CARDS_META[l].path,
  voting: (l) => VOTING_META[l].path,
  barcelonaHub: (l) => BARCELONA_HUB_META[l].path,
  clockChange: (l) => CLOCK_CHANGE_META[l].path,
  beaches: (l) => BEACHES_META[l].path,
  castanyada: (l) => FEATURE_PATHS.castanyada[l],
  shops: (l) => B2_PATHS.shops[l],
  christmas: (l) => B2_PATHS.christmas[l],
  autumn: (l) => AUTUMN_COPY[l].path,
  ski: (l) => B2_PATHS.ski[l],
};

test("every homepage tool links to the path its publisher uses", () => {
  for (const key of Object.keys(PATHS) as ToolKey[]) {
    for (const locale of LOCALES) {
      assert.equal(PATHS[key][locale], OWNER[key](locale), `${key} (${locale})`);
    }
  }
});

test("every edition lists every year-round tool exactly once, and seasonal ones only in season", () => {
  const seasonal = new Set(SEASONAL.map((s) => s.key));
  const all = (Object.keys(PATHS) as ToolKey[]).filter((k) => !seasonal.has(k)).sort();
  for (const locale of LOCALES) {
    assert.deepEqual([...ORDER[locale]].sort(), all, locale);
  }
});

test("seasonal tools open and close on their dates, across New Year too", () => {
  const strip = (day: string) => toolsFor("ca", day);
  assert.equal(strip("2026-10-31")[0], "castanyada");
  assert.ok(!strip("2026-11-02").includes("castanyada"));
  assert.ok(strip("2026-11-02").includes("christmas"));
  assert.ok(strip("2027-01-06").includes("christmas"));
  assert.ok(!strip("2027-01-07").includes("christmas"));
  assert.ok(strip("2027-02-01").includes("ski"));
  assert.ok(!strip("2027-06-01").includes("ski"));
  assert.ok(!strip("2027-06-01").some((k) => SEASONAL.some((s) => s.key === k)));
  for (const day of ["2026-10-23", "2026-12-24", "2027-03-01", "2027-07-15"]) {
    const keys = strip(day);
    assert.equal(new Set(keys).size, keys.length, `duplicate tool on ${day}`);
  }
});
