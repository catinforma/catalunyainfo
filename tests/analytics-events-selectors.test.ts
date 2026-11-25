import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { ANALYTICS_EVENTS, TOWN_SELECT_TOOLS, track, type AnalyticsEvent } from "../src/lib/analytics/events.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

test("town_select and search_no_results are in the contract with closed parameter lists", () => {
  assert.ok(ANALYTICS_EVENTS.includes("town_select"));
  assert.ok(ANALYTICS_EVENTS.includes("search_no_results"));
  assert.deepEqual([...TOWN_SELECT_TOOLS], ["municipal_results", "embed_builder_town", "embed_builder_year", "embed_working_days"]);
  const src = read("src/lib/analytics/events.ts");
  assert.match(src, /name: "town_select"; params: \{ tool: TownSelectTool; locale: string \}/);
  assert.match(src, /name: "search_no_results"; params: \{ locale: string \}/);
});

test("the selectors send the tool and the locale, never a town name, and go through track()", () => {
  const files: Record<string, string> = {
    "src/components/blocks/MunicipalResults.tsx": "municipal_results",
    "src/components/programmatic/embed-2027/EmbedBuilder.tsx": "embed_builder_town",
    "src/components/programmatic/embed-calc/WorkingDaysEmbedPicker.tsx": "embed_working_days",
  };
  for (const [file, tool] of Object.entries(files)) {
    const src = read(file);
    assert.ok(src.includes(`track({ name: "town_select", params: { tool: "${tool}", locale } })`), file);
    assert.doesNotMatch(src, /gtag\(|dataLayer/, file);
  }
  assert.ok(read("src/components/programmatic/embed-2027/EmbedBuilder.tsx").includes('tool: "embed_builder_year"'));
  // Every call has exactly the two closed parameters.
  for (const file of Object.keys(files)) {
    for (const m of read(file).matchAll(/name: "town_select", params: \{([^}]*)\}/g)) {
      assert.match(m[1]!, /^\s*tool: "[a-z_]+", locale\s*$/, file);
    }
  }
});

test("MunicipalResults reports once per municipality, not per keystroke, and not for the server-rendered default", () => {
  const src = read("src/components/blocks/MunicipalResults.tsx");
  assert.match(src, /lastReported\.current !== match\.code/);
  // The report sits after the match check, so an unmatched or partial value sends nothing.
  assert.ok(src.indexOf("if (!match)") < src.indexOf('name: "town_select"'));
  assert.match(read("src/components/blocks/MunicipalElections.tsx"), /locale=\{locale\}/);
});

test("the embed builder reports user choices only, not the #hash a town page links with", () => {
  const src = read("src/components/programmatic/embed-2027/EmbedBuilder.tsx");
  const hashFn = src.slice(src.indexOf("const fromHash"), src.indexOf("fromHash();"));
  assert.doesNotMatch(hashFn, /track\(/);
  assert.match(read("src/components/programmatic/embed-2027/WidgetPage.tsx"), /initial="barcelona"\s+locale=\{locale\}/);
});

test("search_no_results is sent only when the results count is zero, without any query text", () => {
  const src = read("src/components/SearchAnalytics.tsx");
  assert.match(src, /if \(resultsCount === 0\) track\(\{ name: "search_no_results", params: \{ locale \} \}\)/);
});

test("the new events are silent no-ops without consent", () => {
  const g = globalThis as { window?: unknown };
  const saved = g.window;
  try {
    delete g.window;
    const a: AnalyticsEvent = { name: "town_select", params: { tool: "municipal_results", locale: "ca" } };
    const b: AnalyticsEvent = { name: "search_no_results", params: { locale: "ca" } };
    assert.equal(track(a), false);
    assert.equal(track(b), false);
    const sent: unknown[][] = [];
    g.window = { gtag: (...args: unknown[]) => sent.push(args) };
    assert.equal(track(a), true);
    assert.deepEqual(sent[0], ["event", "town_select", { tool: "municipal_results", locale: "ca" }]);
  } finally {
    if (saved === undefined) delete g.window;
    else g.window = saved;
  }
});
