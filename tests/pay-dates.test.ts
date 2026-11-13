import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, type Block } from "../src/lib/content/blocks.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { PAY_DATES, PAY_DATES_AS_OF, buildPayBody, pensionDeadline, sepeDay, tgssBusinessDay } from "../src/lib/content/batch02/pay-dates.ts";
import { B2_PATHS, B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { WEEKDAY_NAMES, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { calcEditions } from "../src/lib/programmatic/employment/paths.ts";
import { pensionEditions } from "../src/lib/programmatic/pensions-2027/copy.ts";

const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)];
const PUBLISHED = new Set(ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)));
// The unemployment benefit calculator ships with the deploy (a route, not a published entry).
for (const path of Object.values(calcEditions("unemployment"))) PUBLISHED.add(path);
// So does the 2027 pension increase calculator.
for (const path of Object.values(pensionEditions())) PUBLISHED.add(path);
const json = (locale: Locale) => JSON.stringify(PAY_DATES.editions[locale].blocks);
const links = (locale: Locale) => [...json(locale).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);
const tables = (locale: Locale) => (PAY_DATES.editions[locale].blocks as unknown as { type: string; rows?: string[][] }[]).filter((b) => b.type === "table");

test("pension deadline: first TGSS business day (TARGET + Madrid city holidays), never after the 4th", () => {
  assert.equal(pensionDeadline(2026, 12), "2026-12-01");
  assert.equal(pensionDeadline(2027, 1), "2027-01-04"); // 1 Jan TARGET-closed Friday, then a weekend
  assert.equal(tgssBusinessDay("2026-12-08"), false); // national holiday, also in Madrid
  assert.equal(tgssBusinessDay("2027-05-15"), false); // Saturday anyway; San Isidro
  assert.equal(tgssBusinessDay("2027-03-29"), false); // Easter Monday: TARGET closed
});

test("SEPE: the 10th, moved only off weekends", () => {
  assert.equal(sepeDay(2026, 12), "2026-12-10");
  assert.equal(sepeDay(2027, 1), "2027-01-11");
  assert.equal(sepeDay(2027, 4), "2027-04-12");
});

test("three editions (ca, es, en) on unique, year-free registry paths; one entry, so hreflang is reciprocal", () => {
  const expected: Record<Locale, string> = {
    ca: "guies/quan-es-cobra-atur-pensio",
    es: "guias/cuando-se-cobra-paro-pension",
    en: "guides/unemployment-benefit-pension-payment-dates-spain",
  };
  assert.deepEqual(Object.keys(PAY_DATES.editions).sort(), [...LOCALES].sort());
  assert.equal(PAY_DATES.key, "payDates");
  // The entry published in Spanish on 9 Nov keeps its key: the Catalan and
  // English editions are translations of that row, which is what hreflang lists.
  assert.equal(PAY_DATES.entryKey, "guide-payment-dates-unemployment-pensions-spain");
  for (const locale of LOCALES) {
    const edition = PAY_DATES.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.equal(edition.path, expected[locale]);
    assert.equal(edition.path, B2_PATHS.payDates[locale]);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    assert.equal(ALL_PATHS.filter((paths) => paths[locale] === edition.path).length, 1, `${locale}: ${edition.path} is not unique`);
    assert.ok(B2_TITLES.payDates[locale].length > 20, locale);
    assert.equal(b2href("payDates", locale), `/${locale}/${expected[locale]}/`);
  }
  assert.equal(new Set(LOCALES.map((locale) => PAY_DATES.editions[locale].path)).size, 3);
  for (const record of [PAY_DATES.heroAlt, PAY_DATES.heroCaption]) for (const locale of LOCALES) assert.ok(record?.[locale], `hero text ${locale}`);
});

test("every edition fits the limits and the rules are re-read within 60 days", () => {
  for (const locale of LOCALES) {
    const e = PAY_DATES.editions[locale];
    assert.ok(e.seoTitle.length > 20 && e.seoTitle.length <= 60, `${locale} title ${e.seoTitle.length}`);
    assert.ok(e.seoDescription.length > 80 && e.seoDescription.length <= 160, `${locale} description ${e.seoDescription.length}`);
    assert.ok(e.excerpt.length > 30 && e.excerpt.length <= 200, `${locale} excerpt ${e.excerpt.length}`);
    assert.ok(e.title.length > e.seoTitle.length, `${locale}: the H1 says more than the title`);
  }
  assert.match(PAY_DATES.editions.ca.seoTitle, /^Quan es cobra l'atur i la pensió/);
  assert.match(PAY_DATES.editions.es.seoTitle, /^Cuándo se cobra el paro y la pensión/);
  assert.match(PAY_DATES.editions.en.seoTitle, /unemployment benefit and pensions paid in Spain/);
  const age = (Date.now() - Date.parse(`${PAY_DATES_AS_OF}T00:00:00Z`)) / 86_400_000;
  assert.ok(age < 60, `pay-dates rules last read ${PAY_DATES_AS_OF}: re-read SEPE, RD 696/2018, TARGET days and Madrid holidays, then move PAY_DATES_AS_OF`);
});

test("the three editions carry the same facts: same blocks, same days in every table row, same official links", () => {
  const shape = (locale: Locale) => (PAY_DATES.editions[locale].blocks as Block[]).map((b) => b.type).join(",");
  const numbers = (locale: Locale) => tables(locale).map((t) => t.rows!.map((row) => row.join(" ").match(/\d+/g)!.join(" ")));
  const external = (locale: Locale) => links(locale).filter((href) => href.startsWith("http"));
  for (const locale of LOCALES) {
    assert.equal(shape(locale), shape("es"), `${locale}: block sequence`);
    assert.deepEqual(numbers(locale), numbers("es"), `${locale}: table dates`);
    assert.deepEqual(external(locale), external("es"), `${locale}: official links`);
    assert.equal(tables(locale).length, 2);
    for (const t of tables(locale)) assert.equal(t.rows!.length, 13, `${locale}: December 2026 to December 2027`);
    assert.deepEqual(buildPayBody(locale), PAY_DATES.editions[locale].blocks);
  }
  assert.ok(external("es").length >= 9);
  assert.equal(PAY_DATES.verifiedAt, PAY_DATES_AS_OF);
});

test("each edition is written in its own language: the weekday of every printed date, no month from another language", () => {
  const foreign: Record<Locale, RegExp> = {
    ca: /\b(diciembre|noviembre|enero|junio|lunes|jueves|December|November|Monday|Thursday)\b/,
    es: /\b(desembre|novembre|gener|juny|dilluns|dijous|December|November|Monday|Thursday)\b/,
    en: /\b(diciembre|noviembre|enero|junio|lunes|jueves|desembre|novembre|gener|juny|dilluns|dijous)\b/,
  };
  const span: [number, number][] = [[2026, 12], ...Array.from({ length: 12 }, (_, i) => [2027, i + 1] as [number, number])];
  for (const locale of LOCALES) {
    assert.doesNotMatch(json(locale), foreign[locale], locale);
    const [sepe, pensions] = tables(locale);
    span.forEach(([y, m], i) => {
      for (const [table, iso] of [[sepe!, sepeDay(y, m)], [pensions!, pensionDeadline(y, m)]] as const) {
        const cell = table.rows![i]![1]!;
        assert.ok(cell.includes(`${WEEKDAY_NAMES[locale][weekdayIndex(iso)]} ${Number(iso.slice(8))} `), `${locale} ${iso}: ${cell}`);
      }
    });
  }
  assert.match(json("ca"), /dilluns 12 d'abril/);
  assert.match(json("ca"), /la d'octubre/);
  assert.match(json("en"), /Monday 12 April/);
});

test("internal links stay in the edition's own language and point at published pages", () => {
  for (const locale of LOCALES) {
    for (const href of links(locale).filter((h) => h.startsWith("/"))) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href} crosses languages`);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published page`);
    }
  }
});

test("publish group pagos sends the three editions", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("pagos"\)\) published\.push\(await publishB2Article\(PAY_DATES\)\)/);
});
