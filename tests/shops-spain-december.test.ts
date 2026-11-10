import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, type Block } from "../src/lib/content/blocks.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { B2_PATHS, B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import {
  CANARY_ISLANDS,
  COMMUNITY_I18N,
  DECEMBER_2026,
  SHOPS_SPAIN_AS_OF,
  SHOPS_SPAIN_DECEMBER,
  buildShopsSpainBody,
} from "../src/lib/content/batch02/shops-spain-december.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { WEEKDAY_NAMES } from "../src/lib/content/holidays/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)];
const PUBLISHED = new Set(ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)));
const json = (locale: Locale) => JSON.stringify(SHOPS_SPAIN_DECEMBER.editions[locale].blocks);
const links = (locale: Locale) => [...json(locale).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);
const tables = (locale: Locale) => (SHOPS_SPAIN_DECEMBER.editions[locale].blocks as unknown as { type: string; rows?: string[][] }[]).filter((b) => b.type === "table");

test("December 2026 opening days as the Ministry's 2026 calendar lists them (checked 9 Nov 2026)", () => {
  const by = Object.fromEntries(DECEMBER_2026.map((r) => [r.name, r.days]));
  assert.deepEqual(by["Murcia"], [6, 7, 8, 13, 20, 27]);
  assert.deepEqual(by["Aragón"], [6, 8, 13, 20, 27]);
  assert.deepEqual(by["Baleares"], [6, 20, 26]);
  assert.deepEqual(by["Madrid"], []);
  assert.equal(DECEMBER_2026.length, 17);
  assert.equal(CANARY_ISLANDS.length, 7);
  for (const r of DECEMBER_2026) for (const d of r.days) assert.ok(d !== 25, `${r.name}: 25 Dec is in no calendar`);
});

test("three editions (ca, es, en) on unique, year-free registry paths; one entry, so hreflang is reciprocal", () => {
  const expected: Record<Locale, string> = {
    ca: "guies/botigues-obertes-desembre-espanya",
    es: "guias/tiendas-abiertas-diciembre-espana",
    en: "guides/shops-open-december-spain",
  };
  assert.deepEqual(Object.keys(SHOPS_SPAIN_DECEMBER.editions).sort(), [...LOCALES].sort());
  assert.equal(SHOPS_SPAIN_DECEMBER.key, "shopsSpainDecember");
  // The entry published in Spanish on 9 Nov keeps its key: the Catalan and
  // English editions are translations of that row, which is what hreflang lists.
  assert.equal(SHOPS_SPAIN_DECEMBER.entryKey, "guide-shops-open-december-2026-spain");
  for (const locale of LOCALES) {
    const edition = SHOPS_SPAIN_DECEMBER.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.equal(edition.path, expected[locale]);
    assert.equal(edition.path, B2_PATHS.shopsSpainDecember[locale]);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    assert.equal(ALL_PATHS.filter((paths) => paths[locale] === edition.path).length, 1, `${locale}: ${edition.path} is not unique`);
    assert.ok(B2_TITLES.shopsSpainDecember[locale].length > 20, locale);
    assert.equal(b2href("shopsSpainDecember", locale), `/${locale}/${expected[locale]}/`);
  }
  assert.equal(new Set(LOCALES.map((locale) => SHOPS_SPAIN_DECEMBER.editions[locale].path)).size, 3);
  for (const record of [SHOPS_SPAIN_DECEMBER.heroAlt, SHOPS_SPAIN_DECEMBER.heroCaption]) for (const locale of LOCALES) assert.ok(record?.[locale], `hero text ${locale}`);
});

test("every edition fits the limits and is retired or refreshed after December", () => {
  for (const locale of LOCALES) {
    const e = SHOPS_SPAIN_DECEMBER.editions[locale];
    assert.ok(e.seoTitle.length > 20 && e.seoTitle.length <= 60, `${locale} title ${e.seoTitle.length}`);
    assert.ok(e.seoDescription.length > 80 && e.seoDescription.length <= 160, `${locale} description ${e.seoDescription.length}`);
    assert.ok(e.excerpt.length > 30 && e.excerpt.length <= 200, `${locale} excerpt ${e.excerpt.length}`);
    assert.ok(e.title.length > e.seoTitle.length, `${locale}: the H1 says more than the title`);
    assert.match(e.seoTitle, /6, 7 (y|i|and) 8/, locale);
  }
  assert.ok(new Date().toISOString().slice(0, 10) <= "2026-12-31", `shops-spain-december (as of ${SHOPS_SPAIN_AS_OF}) is about December 2026: turn it into January/2027 or retire it`);
});

test("the three editions carry the same days: same blocks, same numbers in every table row, same official links", () => {
  const shape = (locale: Locale) => (SHOPS_SPAIN_DECEMBER.editions[locale].blocks as Block[]).map((b) => b.type).join(",");
  // Day numbers only: a note such as "uno es el 8 de diciembre" keeps its 8 in the three languages.
  const numbers = (locale: Locale) => tables(locale).map((t) => t.rows!.map((row) => (row.join(" ").match(/\d+/g) ?? []).join(" ")));
  const answers = (locale: Locale) => tables(locale)[0]!.rows!.map((row) => row.slice(1, 4).map((cell) => (cell === "—" ? "—" : /^(Sí|Yes)/.test(cell) ? "y" : "n")).join(""));
  const external = (locale: Locale) => links(locale).filter((href) => href.startsWith("http"));
  for (const locale of LOCALES) {
    assert.equal(shape(locale), shape("es"), `${locale}: block sequence`);
    assert.deepEqual(numbers(locale), numbers("es"), `${locale}: table days`);
    assert.deepEqual(answers(locale), answers("es"), `${locale}: 6, 7 and 8 December columns`);
    assert.deepEqual(external(locale), external("es"), `${locale}: official links`);
    assert.equal(tables(locale)[0]!.rows!.length, 17);
    assert.equal(tables(locale)[1]!.rows!.length, 7);
    assert.deepEqual(buildShopsSpainBody(locale), SHOPS_SPAIN_DECEMBER.editions[locale].blocks);
  }
  assert.equal(SHOPS_SPAIN_DECEMBER.verifiedAt, SHOPS_SPAIN_AS_OF);
});

test("each community and each note has a Catalan and an English form; weekdays are the edition's own", () => {
  for (const row of DECEMBER_2026) {
    const names = COMMUNITY_I18N[row.name];
    assert.ok(names, `${row.name}: no Catalan/English name`);
    for (const locale of ["ca", "en"] as const) {
      assert.ok(names[locale].cell.length > 3, `${row.name} ${locale}`);
      assert.equal(Boolean(names[locale].note), Boolean(row.note), `${row.name} ${locale}: note`);
    }
  }
  assert.equal(Object.keys(COMMUNITY_I18N).length, DECEMBER_2026.length);
  const foreign: Record<Locale, RegExp> = {
    ca: /\b(domingo|lunes|martes|diciembre|ayuntamiento|Sunday|Monday|Tuesday|December)\b/,
    es: /\b(diumenge|dilluns|dimarts|desembre|ajuntament|Sunday|Monday|Tuesday|December)\b/,
    en: /\b(domingo|lunes|martes|diciembre|ayuntamiento|diumenge|dilluns|dimarts|desembre|ajuntament)\b/,
  };
  for (const locale of LOCALES) {
    assert.doesNotMatch(json(locale), foreign[locale], locale);
    // 6 December 2026 is a Sunday, the 7th a Monday, the 8th a Tuesday.
    const murcia = tables(locale)[0]!.rows![13]![4]!;
    for (const [d, w] of [[6, 0], [7, 1], [8, 2]] as const) assert.ok(murcia.includes(`${WEEKDAY_NAMES[locale][w]} ${d}`), `${locale}: ${murcia}`);
  }
  assert.match(json("ca"), /a l'Aragó, Astúries, Castella i Lleó, Múrcia, a diverses illes de Canàries/);
  assert.match(json("ca"), /a Andalusia, Cantàbria, Extremadura, Múrcia i la Rioja/);
  assert.match(json("en"), /in Andalusia, Cantabria, Extremadura, Murcia and La Rioja/);
  assert.match(json("en"), /in Aragon, the Balearic Islands, Castile-La Mancha, Catalonia, Galicia, Murcia and on some of the islands/);
});

test("internal links stay in the edition's own language: each edition sends to its own Catalonia shops guide", () => {
  for (const locale of LOCALES) {
    const internal = links(locale).filter((h) => h.startsWith("/"));
    assert.deepEqual(internal, [b2href("shops", locale)], locale);
    for (const href of internal) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href} crosses languages`);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published page`);
    }
  }
});

test("publish group tiendas-espana sends the three editions", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("tiendas-espana"\)\) published\.push\(await publishB2Article\(SHOPS_SPAIN_DECEMBER\)\)/);
});
