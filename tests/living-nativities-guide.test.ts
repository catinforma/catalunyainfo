import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { CHRISTMAS } from "../src/lib/content/batch02/christmas.ts";
import { KNOWN, KNOWN_SEASON_ENDS, KNOWN_SEASON_STARTS, PENDING, PESSEBRES } from "../src/lib/content/batch02/pessebres.ts";
import { fairsHubPath } from "../src/lib/programmatic/christmas-fairs/paths.ts";
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
  ...LOCALES.map((locale) => fairsHubPath(locale)),
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
 * The 2026-27 dates exactly as each official site gave them, re-read on 13
 * Nov 2026 (quotes in KNOWN[].quote; fact pack
 * research_notes/pessebres-vivents-2026-13nov.md). Changing one means
 * re-checking that site; a nativity whose site still shows last season stays
 * "2026 no confirmat".
 */
const VERIFIED_2026: Record<string, string | null> = {
  "Pessebre Vivent de Corbera de Llobregat": "Del 28 de novembre de 2026 al 9 de gener de 2027, en dies concrets, amb passis a les 18, 19 o 20 h; entrades només per internet (adults, 17 €; menors de 14 anys, Carnet Jove i majors de 65, 12 €; fins a 6 anys, gratis)",
  "55è Pessebre Vivent d'Osona": "20, 25, 26 i 27 de desembre de 2026 i 1, 3, 6 i 10 de gener de 2027, de 18 a 20 h (el 20 de desembre i el 6 i el 10 de gener, fins a les 19.30 h); entrades només a taquilla (adults, 10 €; de 6 a 13 anys, 3 €)",
  // The 18 h / 19.15 h sessions read on 25 Oct are no longer on the page.
  "Pessebre Vivent del Bages a les Torres de Fals": "19, 20, 26 i 27 de desembre de 2026 i 1, 2, 3 i 6 de gener de 2027; entrada general, 15 € (majors de 65 anys, 12 €; de 6 a 12 anys, 6 €)",
  "Pessebre Vivent dels Oficis Perduts (40è aniversari)": "19, 20, 26 i 27 de desembre de 2026 i 2, 3, 9 i 10 de gener de 2027, a les 18.30 h; entrades només per internet (el 13 de novembre, venda encara no oberta: «properament»)",
  "49è Pessebre Vivent parlat de les Gunyoles": "20, 25, 26 i 27 de desembre de 2026 i 1, 2 i 3 de gener de 2027, a les 18, 18.45 i 19.30 h",
  "Pessebre Vivent de l'Espluga de Francolí": "27, 28 i 29 de desembre de 2026 (es fa cada dos anys); entrades només anticipades, des del 22 de novembre a les 9 h, sense taquilla",
  "33è Pessebre Vivent de la Torre del Suro": "21 de desembre de 2026 a les 18 h; entrada lliure, sense inscripció",
  "Pessebre Vivent de Sant Fost de Campsentelles": "13, 19, 20, 25, 26 i 27 de desembre de 2026 i 1, 3, 6 i 10 de gener de 2027; uns 60 minuts; entrades només per internet (adults, 10 €; de 6 a 12 anys, 4 €; Carnet Jove, 6 €; menors de 6, gratis)",
  "Pessebre dels Estels": "5, 6, 12 i 13 de desembre de 2026, des de les 16.30 h, amb entrada per franges de mitja hora; entrades per internet (15 €; de 4 a 9 anys, 10 €)",
  // Published between 3 and 13 Nov 2026.
  "El Pessebre de Bàscara": "20, 25, 26 i 27 de desembre de 2026 i 1, 2 i 3 de gener de 2027, a les 19 h; entrades per internet i a taquilla (des de 30 minuts abans)",
  "55è Pessebre Vivent dels Prats de Rei": "20, 26 i 27 de desembre de 2026 i 1, 3 i 6 de gener de 2027, a les 18.30 h",
  "43è Pessebre Vivent de Peralada": "25, 26 i 27 de desembre de 2026 i 1, 2 i 3 de gener de 2027, a les 18.30 h, al casc històric; venda anticipada (6 €; de 4 a 13 anys, 3 €)",
  "Pessebre Vivent de la Vila de Rupit": null,
};

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());

test("every entry says when its page was read and what it says; dated ones quote this season", () => {
  for (const item of KNOWN) {
    assert.match(item.readOn, /^\d{4}-\d{2}-\d{2}$/, item.name);
    assert.ok(item.readOn >= "2026-11-13", `${item.name}: read ${item.readOn}`);
    assert.ok(item.quote.length > 20, item.name);
    assert.ok(item.publisher.length > 5, item.name);
    if (item.dates) assert.match(item.quote, /2026|'26/, `${item.name}: the quote does not carry this season`);
    else assert.ok(item.recheck, `${item.name}: a pending entry must be re-read`);
  }
});

/**
 * Date guard. Organisers publish and open ticket sales through November and
 * December: every `recheck` entry (dates still to come, or tickets
 * "properament") must be re-read at least every 10 days until
 * KNOWN_SEASON_STARTS. Re-read the page, update the entry and its readOn,
 * republish `pessebres`.
 */
test("date guard: pending nativities re-read within 10 days until the season starts", () => {
  const now = today();
  if (now >= KNOWN_SEASON_STARTS) return;
  const tenDaysAgo = new Date(Date.parse(`${now}T12:00:00Z`) - 10 * 86_400_000).toISOString().slice(0, 10);
  for (const item of KNOWN.filter((k) => k.recheck)) {
    assert.ok(item.readOn >= tenDaysAgo, `${item.name} last read ${item.readOn}: re-read ${item.url}`);
  }
});

/**
 * Date guard. After the last performance in the table the page still speaks
 * of "this season" in the future: from 15 Jan 2027 it needs its after-season
 * pass (past tense, or the 2027-28 table when organisers publish it).
 */
test("date guard: the 2026-27 table is not left up after the season", () => {
  assert.equal(KNOWN_SEASON_ENDS, "2027-01-10");
  const lastDay = KNOWN.flatMap((k) => (k.dates ? [...k.dates.ca.matchAll(/(\d{1,2}) de gener de 2027/g)].map((m) => Number(m[1])) : []));
  assert.equal(Math.max(...lastDay), 10, "KNOWN_SEASON_ENDS no longer matches the table");
  assert.ok(today() < "2027-01-15", "the living nativity season is over: give the page its after-season pass");
});

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
        assert.doesNotMatch(cell.replace("2025-26", "").replace(/^2026 /, ""), /\d/, `${item.name}/${locale}`);
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
    assert.ok(links.includes(fairsHubPath(locale)), `${locale}: no link to the fairs calendar`);
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
