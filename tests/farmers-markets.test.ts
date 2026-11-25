import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import {
  FARMERS_AS_OF,
  FARMERS_BY_COMARCA,
  FARMERS_LIST,
  FARMERS_MARKETS,
  FARMERS_REREAD_BY,
  FARMERS_URLS,
  buildFarmersBody,
} from "../src/lib/content/batch02/farmers-markets.ts";
import { B2_PATHS, B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

const json = (locale: Locale) => JSON.stringify(FARMERS_MARKETS.editions[locale].blocks);
const text = (locale: Locale) => bodyToPlainText(FARMERS_MARKETS.editions[locale].blocks);
const links = (locale: Locale) => [...json(locale).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);
const tables = (locale: Locale) =>
  (FARMERS_MARKETS.editions[locale].blocks as unknown as { type: string; rows?: string[][]; caption?: string }[]).filter((b) => b.type === "table");

/** Hosts of the sources read on 17 Nov 2026: the Department of Agriculture and the Portal Jurídic (DOGC). */
const OFFICIAL = /^(agricultura\.gencat\.cat|portaljuridic\.gencat\.cat)$/;

test("farmers markets: three editions on year-free registry paths, one entry", () => {
  assert.equal(FARMERS_MARKETS.key, "farmersMarkets");
  assert.equal(FARMERS_MARKETS.entryKey, "guide-farmers-markets-venda-proximitat");
  assert.deepEqual(Object.keys(FARMERS_MARKETS.editions).sort(), [...LOCALES].sort());
  for (const locale of LOCALES) {
    const edition = FARMERS_MARKETS.editions[locale];
    assert.equal(edition.path, B2_PATHS.farmersMarkets[locale]);
    assert.doesNotMatch(edition.path, /\d{4}/, `${locale}: no year in an evergreen path`);
    assert.match(edition.path, /^(guies|guias|guides)\/[a-z0-9-]+$/);
    assert.equal(b2href("farmersMarkets", locale), `/${locale}/${edition.path}/`);
    assert.ok(B2_TITLES.farmersMarkets[locale].length > 20);
  }
  assert.equal(new Set(LOCALES.map((l) => FARMERS_MARKETS.editions[l].path)).size, 3);
});

test("farmers markets: every edition validates, is substantial and has the same shape", () => {
  const shape = (locale: Locale) => (FARMERS_MARKETS.editions[locale].blocks as Block[]).map((b) => b.type).join(",");
  for (const locale of LOCALES) {
    const parsed = bodySchema.safeParse(FARMERS_MARKETS.editions[locale].blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(locale)) > 1200, `${locale}: ${wordCount(text(locale))} words`);
    assert.equal(shape(locale), shape("ca"), `${locale}: same sections as the Catalan edition`);
    assert.deepEqual(buildFarmersBody(locale), FARMERS_MARKETS.editions[locale].blocks);
    const { seoTitle, seoDescription, excerpt, title } = FARMERS_MARKETS.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} seoTitle ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 170, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30 && title.length > 10);
  }
  assert.match(FARMERS_MARKETS.editions.ca.seoTitle, /^Mercats de pagès/);
  assert.match(FARMERS_MARKETS.editions.es.seoTitle, /^Mercados payeses/);
  assert.match(FARMERS_MARKETS.editions.en.seoTitle, /^Farmers' markets/);
});

test("farmers markets: the answer comes first (official list, count, date, one intermediary, the market sign)", () => {
  const facts: Record<Locale, RegExp[]> = {
    ca: [/2\.410 productors/, /2 de juliol de 2026/, /com a molt un intermediari/, /Mercat de venda directa/, /Decret 24\/2013/],
    es: [/2\.410 productores/, /2 de julio de 2026/, /como mucho un intermediario/, /Mercat de venda directa/, /Decreto 24\/2013/],
    en: [/2,410 accredited producers/, /2 July 2026/, /at most one intermediary/, /Mercat de venda directa/, /Decree 24\/2013/],
  };
  for (const locale of LOCALES) {
    const first = FARMERS_MARKETS.editions[locale].blocks[0] as { text?: string; lead?: boolean };
    assert.ok(first.lead, `${locale}: first block is the lead`);
    for (const fact of facts[locale]) assert.match(first.text ?? "", fact, `${locale}: lead ${fact}`);
    assert.ok((first.text ?? "").includes(`](${FARMERS_URLS.list})`), `${locale}: lead links the official file`);
  }
});

test("farmers markets: the comarca table adds up to the Department's figure", () => {
  const sum = FARMERS_BY_COMARCA.reduce((acc, [, count]) => acc + count, 0);
  assert.equal(sum + FARMERS_LIST.noComarca, FARMERS_LIST.producers);
  assert.equal(new Set(FARMERS_BY_COMARCA.map(([name]) => name)).size, FARMERS_BY_COMARCA.length, "no repeated comarca");
  assert.ok(FARMERS_LIST.direct <= FARMERS_LIST.producers && FARMERS_LIST.shortChain <= FARMERS_LIST.producers);
  for (const locale of LOCALES) {
    const t = tables(locale);
    assert.equal(t.length, 3, `${locale}: comarques, where to look, guarantees`);
    assert.equal(t[0]?.rows?.length, FARMERS_BY_COMARCA.length);
    assert.equal(t[1]?.rows?.length, 5, `${locale}: market, farm, shop, restaurant, online`);
    assert.equal(t[2]?.rows?.length, 8, `${locale}: eight guarantee questions`);
    const all = JSON.stringify(t);
    assert.match(all, /40/, `${locale}: poultry 40 days`);
    assert.match(all, /4 (mesos|meses|months)/, `${locale}: beef and pigs 4 months`);
    assert.match(all, /3 (hores|horas|hours)/, `${locale}: slaughter within 3 hours`);
  }
});

test("farmers markets: no personal data, no invented market calendar, no unregulated claims as fact", () => {
  for (const locale of LOCALES) {
    const body = text(locale);
    assert.doesNotMatch(body, /\b[6-9]\d{8}\b/, `${locale}: no phone number of a producer`);
    assert.doesNotMatch(body, /@(?!gencat\.cat)[a-z0-9.-]+\.[a-z]{2,}/i, `${locale}: no e-mail other than the Department's`);
    assert.doesNotMatch(body, /\b[A-HJ-NP-SUVW]\d{7}[0-9A-J]\b|\b\d{8}[A-Z]\b/, `${locale}: no NIF`);
    assert.doesNotMatch(body, /(cada|todos los|every) (dissabte|diumenge|sábado|domingo|Saturday|Sunday)/i, `${locale}: no market days`);
  }
});

test("farmers markets: external links are official sites only, https, no tracking", () => {
  for (const locale of LOCALES) {
    const external = links(locale).filter((h) => h.startsWith("http"));
    assert.ok(external.length >= 5, `${locale}: only ${external.length} official links`);
    for (const href of external) {
      const url = new URL(href);
      assert.equal(url.protocol, "https:", href);
      assert.match(url.hostname, OFFICIAL, `${locale}: ${url.hostname} is not an official source`);
      assert.doesNotMatch(href, /utm_|aerobus/i, href);
    }
    assert.ok(links(locale).includes(FARMERS_URLS.producers), `${locale}: links the producers page`);
  }
  for (const source of FARMERS_MARKETS.sources) assert.match(new URL(source.url).hostname, OFFICIAL, source.url);
  assert.equal(new Set(FARMERS_MARKETS.sources.map((s) => s.url)).size, FARMERS_MARKETS.sources.length, "no duplicate source URL (it breaks the publish)");
});

test("farmers markets: internal links stay in the edition's language and end in a slash", () => {
  for (const locale of LOCALES) {
    const internal = links(locale).filter((h) => h.startsWith("/"));
    assert.ok(internal.length >= 3, `${locale}: related guides`);
    for (const href of internal) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href} crosses languages`);
      assert.match(href, /\/$/, href);
    }
    assert.ok(internal.includes(b2href("calcots", locale)), `${locale}: links the calçots guide`);
  }
});

test("farmers markets: no clock times in the running text", () => {
  for (const locale of LOCALES) {
    const prose = bodyToPlainText(FARMERS_MARKETS.editions[locale].blocks.filter((b) => b.type !== "table"));
    assert.doesNotMatch(prose, /(?<!€)\b([01]?\d|2[0-3])[:.][0-5]\d\b/, `${locale}: a clock time outside a table`);
  }
});

test("farmers markets: lead photograph (hero details are covered by guide-heroes-nov26.test.ts)", () => {
  assert.equal(FARMERS_MARKETS.heroKey, "mercat-pagesos-montserrat");
  assert.equal(FARMERS_MARKETS.noPhotoReason, undefined);
});

test("farmers markets: the facts were read recently (re-read the Department's pages and the Excel, then move FARMERS_AS_OF)", () => {
  assert.equal(FARMERS_MARKETS.verifiedAt, FARMERS_AS_OF);
  assert.ok(FARMERS_AS_OF < FARMERS_REREAD_BY);
  assert.ok(
    Date.now() < Date.parse(`${FARMERS_REREAD_BY}T00:00:00Z`),
    `Farmers' markets facts last read ${FARMERS_AS_OF}: re-read the producers page and its Excel (count, date, comarca table) and the Q&A, then move FARMERS_AS_OF and FARMERS_REREAD_BY`,
  );
});

test("farmers markets: the publish route registers `mercats-pages`", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("mercats-pages"\)\) published\.push\(await publishB2Article\(FARMERS_MARKETS\)\)/);
});
