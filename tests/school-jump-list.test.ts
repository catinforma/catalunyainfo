import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { ANALYTICS_EVENTS, SCHOOL_JUMP_REGIONS } from "../src/lib/analytics/events.ts";
import { classifySchoolJumpClick } from "../src/lib/analytics/clicks.ts";
import { buildStrikeDay2326Body } from "../src/lib/content/batch02/strike-days-2326n.ts";
import { buildStrikeGuideBody } from "../src/lib/content/batch02/strike-guides.ts";
import { CCAA_ROW_PREFIX, buildHubBody } from "../src/lib/content/school-spain/body.ts";
import { HUB_PATHS, hubRegions, pendingRegions } from "../src/lib/content/school-spain/regions.ts";
import { safeHref } from "../src/lib/content/links.ts";
import { tableBlock } from "../src/lib/content/blocks.ts";
import type { Locale } from "../src/lib/i18n/config.ts";

/*
 * 25 Nov 2026: on a phone the Christmas table of the Spain school calendar is 19
 * stacked cards (about three per screen, sorted by date), so a family looked for
 * its community by scrolling. A server-rendered "Go to your community" list jumps
 * to the row (same-page anchor, no script), the strike guides link the hub, and a
 * tap on the list sends school_region_jump with a closed region list.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const LOCALES: Locale[] = ["es", "ca", "en"];

type Box = { type: string; headers?: string[]; rows?: string[][]; rowIds?: string[]; jumpLabel?: string; items?: string[] };

test("the Christmas quick table has one id per row, from the region slugs, and a label for the jump list", () => {
  const label = { es: "Ve a tu comunidad", ca: "Ves a la teva comunitat", en: "Go to your region" };
  for (const locale of LOCALES) {
    const table = (buildHubBody(locale) as Box[]).find((b) => b.type === "table")!;
    assert.equal(table.rowIds!.length, table.rows!.length, `${locale}: an id for each row`);
    assert.equal(new Set(table.rowIds).size, table.rowIds!.length, `${locale}: ids are unique`);
    const slugs = [...hubRegions(locale).map((r) => r.slug), ...pendingRegions(locale).map((p) => p.slug)];
    assert.deepEqual([...table.rowIds!].sort(), slugs.map((s) => `${CCAA_ROW_PREFIX}${s}`).sort(), `${locale}: every community, none twice`);
    assert.equal(table.jumpLabel, label[locale]);
    assert.ok(tableBlock.safeParse(table).success, `${locale}: the block validates`);
    // Only this table carries the list: the full table further down keeps its own reading.
    assert.equal((buildHubBody(locale) as Box[]).filter((b) => b.jumpLabel).length, 1);
  }
});

test("the closed region list of the event is the set of community slugs of the hub", () => {
  for (const locale of LOCALES) {
    assert.deepEqual([...SCHOOL_JUMP_REGIONS].sort(), [...hubRegions(locale).map((r) => r.slug)].sort(), locale);
  }
  assert.ok(ANALYTICS_EVENTS.includes("school_region_jump"));
});

test("safeHref allows a same-page id and nothing odd after the hash", () => {
  assert.equal(safeHref("#ccaa-andalucia"), "#ccaa-andalucia");
  assert.equal(safeHref("#"), null);
  assert.equal(safeHref("#a b"), null);
  assert.equal(safeHref("#javascript:alert(1)"), null);
});

test("a tap in the list sends school_region_jump with the slug and locale; anything else sends nothing", () => {
  const href = "https://www.catalunyainfo.com/es/guias/calendario-escolar-espana/#ccaa-andalucia";
  assert.deepEqual(classifySchoolJumpClick({ href, locale: "es", placement: "school_jump" }), {
    name: "school_region_jump",
    params: { region: "andalucia", locale: "es" },
  });
  assert.equal(classifySchoolJumpClick({ href, locale: "es", placement: "next_step" }), null);
  assert.equal(classifySchoolJumpClick({ href, locale: "es", placement: null }), null);
  assert.equal(classifySchoolJumpClick({ href: href.replace("andalucia", "atlantida"), locale: "es", placement: "school_jump" }), null);
  assert.equal(classifySchoolJumpClick({ href: href.replace("#ccaa-andalucia", ""), locale: "es", placement: "school_jump" }), null);
  assert.equal(classifySchoolJumpClick({ href: "not a url", locale: "es", placement: "school_jump" }), null);
});

test("the renderer prints the list server-side with the placement, and the listener goes through track()", () => {
  const renderer = read("src/components/blocks/BlockRenderer.tsx");
  assert.match(renderer, /<nav className="ci-jump" aria-label=\{label\} data-ci-placement="school_jump">/);
  assert.match(renderer, /<tr key=\{i\} role="row" id=\{block\.rowIds\?\.\[i\]\}>/);
  assert.match(read("src/components/AnalyticsClicks.tsx"), /classifySchoolJumpClick/);
  assert.match(read("src/lib/analytics/events.ts"), /name: "school_region_jump"; params: \{ region: SchoolJumpRegion; locale: string \}/);
  assert.equal(CCAA_ROW_PREFIX, "ccaa-");
});

test("the 26 November strike guides and the education guide link the Spain school calendar in every language", () => {
  for (const locale of LOCALES) {
    const hub = `/${locale}/${HUB_PATHS[locale]}/`;
    const day = JSON.stringify(buildStrikeDay2326Body("strike26n", locale));
    assert.ok(day.includes(`](${hub})`), `${locale}: strike 26 November page`);
    const education = JSON.stringify(buildStrikeGuideBody("strikeEducation", locale));
    assert.ok(education.includes(`](${hub})`), `${locale}: education strike guide`);
    const rail = JSON.stringify(buildStrikeDay2326Body("strike23n", locale));
    assert.ok(!rail.includes(hub), `${locale}: the rail day keeps its own related list`);
  }
});
