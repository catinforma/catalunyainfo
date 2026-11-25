import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { buildFarmersBody } from "../src/lib/content/batch02/farmers-markets.ts";
import { townHub } from "../src/lib/engagement/town-hub.ts";
import { marketsTownPath } from "../src/lib/programmatic/weekly-markets/paths.ts";

/**
 * 25 Nov 2026: the weekly street markets of Vic and Mataró are linked, with the
 * query's own words, from the places where they give a different answer from
 * the page itself: agenda and weekend hubs, the zone pages whose area holds
 * the town, the Christmas-fair pages (town hub) and the farmers' markets guide.
 */

const ROOT = join(import.meta.dirname, "..");
const LOCALES = ["ca", "es", "en"] as const;
const read = (f: string) => readFileSync(join(ROOT, f), "utf8");

const WORDS = {
  vic: { ca: /mercat setmanal de Vic/i, es: /mercado semanal de Vic/i, en: /weekly market in Vic/i },
  mataro: { ca: /mercats setmanals de Mataró/i, es: /mercados semanales de Mataró/i, en: /weekly markets in Mataró/i },
} as const;

test("farmers' guide separates weekly street markets from farmers' markets and links both towns", () => {
  for (const locale of LOCALES) {
    const json = JSON.stringify(buildFarmersBody(locale));
    for (const town of ["vic", "mataro"] as const) {
      const m = new RegExp(`\\[([^\\[\\]]+)\\]\\(${marketsTownPath(locale, town)}\\)`).exec(json);
      assert.ok(m, `${locale} ${town}: no link`);
      assert.match(m![1]!, WORDS[town][locale]);
    }
  }
});

test("Christmas fair pages of Vic and Mataró reach the weekly markets through the town hub", () => {
  for (const locale of LOCALES) {
    for (const slug of ["vic", "mataro"]) {
      const hub = townHub(slug, locale, "fair", "2026-11-26");
      assert.ok(hub?.links.some((l) => l.href === marketsTownPath(locale, slug)), `${locale} ${slug}`);
    }
  }
});

test("weekend hubs, agenda block and the right zone pages render the context line", () => {
  const line = "MarketsContextLine";
  for (const f of ["HubPage", "ZonePage", "EnglishWeekend"]) assert.match(read(`src/components/programmatic/weekend/${f}.tsx`), new RegExp(line), f);
  assert.match(read("src/components/blocks/WeekendAgenda.tsx"), new RegExp(line));
  const ctx = read("src/components/programmatic/weekly-markets/ContextLinks.tsx");
  assert.match(ctx, /provincia-barcelona[^\n]*"vic", "mataro"/);
  assert.match(ctx, /maresme[^\n]*\["mataro"\]/);
  for (const re of [/mercat setmanal de Vic/, /mercats setmanals de Mataró/, /mercado semanal de Vic/, /mercados semanales de Mataró/, /weekly market in Vic/, /weekly markets in Mataró/]) assert.match(ctx, re);
});
