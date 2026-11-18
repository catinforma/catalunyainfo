import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { CHRISTMAS, SANTA_LLUCIA_2026 } from "../src/lib/content/batch02/christmas.ts";
import { BRIDGE_FIRST_SUNDAY, BRIDGE_SANTA_LLUCIA, DECEMBER_BRIDGE } from "../src/lib/content/batch02/december-bridge.ts";
import { range } from "../src/lib/content/batch02/festive.ts";
import { b2href } from "../src/lib/content/batch02/shared.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { fairsHubPath } from "../src/lib/programmatic/christmas-fairs/paths.ts";
import type { Locale } from "../src/lib/i18n/config.ts";

/*
 * 18 Nov 2026, position-loss diagnosis (docs/SEO_EXPERIMENTS.md, entry of that
 * day): body changes on the December bridge page and the Christmas markets
 * guide. These checks keep the facts tied to their one source of truth.
 */

const LOCALES: Locale[] = ["ca", "es", "en"];
const text = (locale: Locale, article: typeof DECEMBER_BRIDGE) => bodyToPlainText(article.editions[locale]!.blocks);
const raw = (locale: Locale, article: typeof DECEMBER_BRIDGE) => JSON.stringify(article.editions[locale]!.blocks);

test("bridge page: Santa Llúcia is the same fair as the Christmas guide's, and no longer 'not published'", () => {
  assert.equal(BRIDGE_SANTA_LLUCIA.from, SANTA_LLUCIA_2026.from);
  assert.equal(BRIDGE_SANTA_LLUCIA.to, SANTA_LLUCIA_2026.to);
  assert.equal(BRIDGE_SANTA_LLUCIA.url, SANTA_LLUCIA_2026.url);
  assert.equal(BRIDGE_SANTA_LLUCIA.open, SANTA_LLUCIA_2026.hours?.open);
  assert.equal(BRIDGE_SANTA_LLUCIA.close, SANTA_LLUCIA_2026.hours?.close);
  for (const locale of LOCALES) {
    const t = text(locale, DECEMBER_BRIDGE);
    assert.ok(t.includes(range(SANTA_LLUCIA_2026.from, SANTA_LLUCIA_2026.to, locale)), `${locale}: no Santa Llúcia dates`);
    assert.ok(!/Santa Llúcia[^.]*(no s'han publicat|no se han publicado|not published)/.test(t), `${locale}: stale Santa Llúcia sentence`);
    assert.ok(raw(locale, DECEMBER_BRIDGE).includes(`](${SANTA_LLUCIA_2026.url})`), `${locale}: the agenda page is not linked`);
  }
});

test("bridge page: the first Sunday of December links the free-museums guide", () => {
  assert.equal(weekdayIndex(BRIDGE_FIRST_SUNDAY), 0, "6 December 2026 must be a Sunday");
  assert.ok(Number(BRIDGE_FIRST_SUNDAY.slice(8, 10)) <= 7, "it must be the month's first Sunday");
  for (const locale of LOCALES) {
    assert.ok(raw(locale, DECEMBER_BRIDGE).includes(`](${b2href("museums", locale)})`), `${locale}: no link to the museums guide`);
    assert.ok(raw(locale, DECEMBER_BRIDGE).includes("museunacional.cat"), `${locale}: MNAC source not linked`);
  }
  for (const s of ["https://agenda.cultura.gencat.cat/ca/activitat.html/2026110300020", "https://www.museunacional.cat/ca/horaris-i-preus"]) {
    assert.ok(DECEMBER_BRIDGE.sources.some((x) => x.url === s), `source missing: ${s}`);
  }
});

test("Christmas markets guide hands the town-by-town list to the fairs hub before the list", () => {
  for (const locale of LOCALES) {
    const blocks = CHRISTMAS.editions[locale]!.blocks;
    const i = blocks.findIndex((b) => b.type === "heading" && /Fires de Nadal dels pobles|Ferias de Navidad de los pueblos|Town Christmas fairs/.test((b as { text: string }).text));
    assert.ok(i > 0, `${locale}: no town-fairs heading`);
    const intro = JSON.stringify(blocks[i + 1]);
    assert.ok(intro.includes(`](${fairsHubPath(locale)})`), `${locale}: the hub is not linked right under the heading`);
  }
});
