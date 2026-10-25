import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { CHRISTMAS } from "../src/lib/content/batch02/christmas.ts";
import { KNOWN, PENDING, PESSEBRES } from "../src/lib/content/batch02/pessebres.ts";
import { B2_PATHS, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { EVERGREEN } from "../src/lib/content/weekend/evergreen.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * The living-nativity guide. Same structural checks as the batch-02 suite
 * (it has one photograph, not two, so it is not in that suite's list), plus
 * the rule this page exists for: no 2025 date is ever written as a 2026 one,
 * and the calendar is read live rather than typed in.
 */

const PUBLISHED = new Set([
  ...Object.values(B2_PATHS).flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
  ...LOCALES.map((locale) => `/${locale}/${EVERGREEN[locale].path}/`),
]);

test("three editions that validate, are substantial and sit on the registry paths", () => {
  for (const locale of LOCALES) {
    const edition = PESSEBRES.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    const words = wordCount(bodyToPlainText(edition.blocks));
    assert.ok(words > 400, `${locale} has only ${words} words`);
    assert.equal(edition.path, B2_PATHS.pessebres[locale]);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
  }
});

test("titles and descriptions fit what Google shows and use the searched words", () => {
  const words = { ca: /pessebres vivents/i, es: /belenes vivientes/i, en: /living nativity/i };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, title, excerpt } = PESSEBRES.editions[locale];
    assert.ok(seoTitle.length <= 60, `${locale} seoTitle is ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${locale} description is ${seoDescription.length}`);
    assert.match(seoTitle, words[locale]);
    assert.match(title, words[locale]);
    assert.ok(excerpt.length > 30);
  }
});

test("the live calendar comes right after the lead, once, in every language", () => {
  for (const locale of LOCALES) {
    const blocks = PESSEBRES.editions[locale].blocks;
    assert.equal(blocks.filter((block) => block.type === "livingNativities").length, 1, locale);
    const at = blocks.findIndex((block) => block.type === "livingNativities");
    const heading = blocks.findIndex((block) => block.type === "heading");
    assert.equal(at, 1, `${locale}: the calendar is not straight after the lead`);
    assert.ok(at < heading);
    // The read-next box the publisher inserts must not push the calendar down.
    const published = withReadNext([...blocks], locale);
    assert.equal(published.findIndex((block) => block.type === "livingNativities"), 1);
  }
});

test("no 2025-26 date is written as a 2026-27 one", () => {
  for (const locale of LOCALES) {
    const text = bodyToPlainText(PESSEBRES.editions[locale].blocks);
    // Last season's first and last days appear only with their own years.
    assert.doesNotMatch(text, /29 (de )?(novembre|noviembre|November) (de )?2026/i, locale);
    assert.doesNotMatch(text, /11 (de )?(gener|enero|January) (de )?2027/i, locale);
    // Every statistic about last season says which season it is, and the
    // only bare "2025" is that season's opening day.
    assert.match(text, /2025-26/, locale);
    const bare = text.replace(/2025-26/g, "").match(/.{0,25}2025/g) ?? [];
    assert.equal(bare.length, 1, `${locale}: ${bare.join(" | ")}`);
    assert.match(bare[0] ?? "", /29 (de )?(novembre|noviembre|November)/, locale);
  }
});

/**
 * The 2026-27 dates exactly as each official site gave them on 25 Oct 2026.
 * Changing one means re-checking that site; a nativity whose site still
 * shows last season stays "not yet published".
 */
const VERIFIED_2026: Record<string, string | null> = {
  "Pessebre Vivent de Corbera de Llobregat": "Sessions del 28 de novembre de 2026 al 9 de gener de 2027; entrades només per internet",
  "55è Pessebre Vivent d'Osona": "20, 25, 26 i 27 de desembre de 2026 i 1, 3, 6 i 10 de gener de 2027; entrades només a taquilla",
  "Pessebre Vivent del Bages a les Torres de Fals": "19, 20, 26 i 27 de desembre de 2026 i 1, 2, 3 i 6 de gener de 2027, a les 18 h i a les 19.15 h",
  "Pessebre Vivent dels Oficis Perduts (40è aniversari)": "19, 20, 26 i 27 de desembre de 2026 i 2, 3, 9 i 10 de gener de 2027, a les 18.30 h; entrades només per internet",
  "49è Pessebre Vivent parlat de les Gunyoles": "20, 25, 26 i 27 de desembre de 2026 i 1, 2 i 3 de gener de 2027, a les 18, 18.45 i 19.30 h",
  "Pessebre Vivent de l'Espluga de Francolí": "27, 28 i 29 de desembre de 2026 (es fa cada dos anys); entrades només anticipades, des del 22 de novembre a les 9 h",
  "33è Pessebre Vivent de la Torre del Suro": "21 de desembre de 2026 a les 18 h; entrada lliure, sense inscripció",
  "El Pessebre de Bàscara": null,
  "Pessebre Vivent dels Prats de Rei": null,
  "Pessebre Vivent de la Vila de Rupit": null,
  "Pessebre Vivent de Peralada": null,
};

test("the best-known table carries only dates their official sites published", () => {
  assert.deepEqual(
    Object.fromEntries(KNOWN.map((item) => [item.name, item.dates?.ca ?? null])),
    VERIFIED_2026,
  );
  for (const item of KNOWN) {
    assert.match(item.url, /^https:\/\//, item.name);
    assert.ok(PESSEBRES.sources.some((source) => source.url === item.url), `${item.name}: not in sources`);
    if (item.dates) {
      for (const locale of LOCALES) assert.match(item.dates[locale], /2026/, `${item.name}/${locale}`);
    }
  }
  for (const locale of LOCALES) {
    const tables = PESSEBRES.editions[locale].blocks.filter((block) => block.type === "table") as {
      rows: string[][];
    }[];
    assert.equal(tables.length, 1, locale);
    const rows = tables[0]!.rows;
    assert.equal(rows.length, KNOWN.length);
    for (const [index, item] of KNOWN.entries()) {
      const cell = rows[index]![2]!;
      if (item.dates) assert.equal(cell, item.dates[locale]);
      else {
        // Pending: the label and nothing else - no day, no month.
        assert.equal(cell, PENDING[locale], `${item.name}/${locale}`);
        assert.doesNotMatch(cell.replace("2025-26", ""), /\d/, `${item.name}/${locale}`);
      }
    }
  }
});

test("internal links stay in their language, end in a slash and point at published pages", () => {
  for (const locale of LOCALES) {
    const text = JSON.stringify(PESSEBRES.editions[locale].blocks);
    const links = [...text.matchAll(/\]\((\/[a-z]{2}\/[^)]*)\)/g)].map((match) => match[1] ?? "");
    assert.ok(links.length >= 5, `${locale}: only ${links.length} internal links`);
    for (const href of links) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
    }
    // The two siblings the brief asks for.
    assert.ok(links.includes(`/${locale}/${B2_PATHS.christmas[locale]}/`), `${locale}: no Christmas markets link`);
    assert.ok(links.includes(`/${locale}/${B2_PATHS.shops[locale]}/`), `${locale}: no shops link`);
  }
});

test("the Christmas markets guide links to the calendar in every language", () => {
  for (const locale of LOCALES) {
    const text = JSON.stringify(CHRISTMAS.editions[locale].blocks);
    assert.ok(text.includes(`(/${locale}/${B2_PATHS.pessebres[locale]}/)`), locale);
  }
});

test("sources are official https pages and the reader sees the verification date", () => {
  assert.ok(PESSEBRES.sources.length >= 3);
  for (const source of PESSEBRES.sources) {
    assert.match(source.url, /^https:\/\//);
    assert.ok(!/[?&]utm_/.test(source.url));
    assert.doesNotMatch(source.url, /aerobusbcn/);
  }
  assert.match(PESSEBRES.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  for (const locale of LOCALES) {
    assert.match(bodyToPlainText(PESSEBRES.editions[locale].blocks), /verificaci|verified/i, locale);
  }
});

test("the lead photo is the existing nativity-figures file, with that file's own wording", () => {
  // The publisher refuses an article without a lead photo, and media rows are
  // keyed by file: reusing the Christmas guide's photograph with different
  // alt text would rewrite it on that page too.
  assert.ok(PESSEBRES.heroKey && IMAGE_BY_KEY.has(PESSEBRES.heroKey));
  assert.equal(PESSEBRES.heroKey, CHRISTMAS.secondaryKey);
  assert.deepEqual(PESSEBRES.heroAlt, CHRISTMAS.secondaryAlt);
  assert.deepEqual(PESSEBRES.heroCaption, CHRISTMAS.secondaryCaption);
  assert.equal(PESSEBRES.secondaryKey, undefined);
  for (const locale of LOCALES) {
    assert.ok(!PESSEBRES.editions[locale].blocks.some((block) => block.type === "image" || block.type === "gallery"));
  }
});

test("the publish route has a 'pessebres' group", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("pessebres"\)\) published\.push\(await publishB2Article\(PESSEBRES\)\)/);
});
