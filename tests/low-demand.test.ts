import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { comarcaBySlug, municipalityBySlug } from "../src/lib/programmatic/holidays/data.ts";
import { LOW_DEMAND_AS_OF, LOW_DEMAND_PATHS, LOW_DEMAND_REVIEW_BY, isLowDemandPath } from "../src/lib/seo/low-demand.ts";

const FAMILIES = [
  /^\/(ca\/festius|es\/festivos)\/(comarca\/)?[a-z0-9-]+\/$/,
  /^\/(ca\/eleccions|es\/elecciones)\/comarca\/[a-z0-9-]+\/$/,
  /^\/(ca\/benzineres|es\/gasolineras)\/((comarca|provincia)\/)?[a-z0-9-]+\/$/,
];

test("low-demand list: unique paths, only the templated families, never a hub or a 2027 page", () => {
  assert.equal(new Set(LOW_DEMAND_PATHS).size, LOW_DEMAND_PATHS.length);
  for (const p of LOW_DEMAND_PATHS) {
    assert.ok(FAMILIES.some((re) => re.test(p)), `unexpected path ${p}`);
    assert.doesNotMatch(p, /\/(2027|dia|ponts|puentes)\/$/, p);
  }
});

test("low-demand list: every holiday page names a real municipality or comarca", () => {
  for (const p of LOW_DEMAND_PATHS) {
    const m = p.match(/^\/(?:ca\/festius|es\/festivos)\/(comarca\/)?([a-z0-9-]+)\/$/);
    if (!m) continue;
    const slug = m[2] ?? "";
    const found = m[1] ? comarcaBySlug(slug) : municipalityBySlug(slug);
    assert.ok(found, `no such ${m[1] ? "comarca" : "municipality"}: ${p}`);
  }
});

test("isLowDemandPath: paths and absolute URLs, with or without the trailing slash", () => {
  const p = LOW_DEMAND_PATHS[0] ?? "";
  assert.ok(p);
  assert.ok(isLowDemandPath(p));
  assert.ok(isLowDemandPath(p.slice(0, -1)));
  assert.ok(isLowDemandPath(`https://www.catalunyainfo.com${p}`));
  assert.ok(!isLowDemandPath("/ca/festius/"));
  assert.ok(!isLowDemandPath("/ca/festius/barcelona/"));
  assert.ok(!isLowDemandPath("not a url"));
});

test("low-demand list is wired into the robots meta and the sitemap", () => {
  const meta = readFileSync("src/lib/seo/metadata.ts", "utf8");
  assert.match(meta, /const lowDemand = isLowDemandPath\(path\)/);
  assert.match(meta, /lowDemand && indexingAllowed\(\) && !noindex\s*\? \{ index: false, follow: true \}/);
  assert.match(readFileSync("src/app/sitemap.ts", "utf8"), /filter\(\(entry\) => !isLowDemandPath\(entry\.url\)\)/);
});

test("low-demand list is re-read before the holidays season (LOW_DEMAND_REVIEW_BY)", () => {
  assert.ok(LOW_DEMAND_AS_OF < LOW_DEMAND_REVIEW_BY);
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(
    today < LOW_DEMAND_REVIEW_BY,
    "re-read the list against fresh Search Console data (scripts/low-demand.py) and move LOW_DEMAND_REVIEW_BY",
  );
});
