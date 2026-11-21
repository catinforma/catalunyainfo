import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { BARCELONA_HUB } from "../src/lib/content/batch02/barcelona-hub.ts";
import { BECKHAM_AS_OF, BECKHAM_GUIDE, BECKHAM_REREAD_BY, BECKHAM_URLS, beckhamCrossover, beckhamRows, buildBeckhamBody } from "../src/lib/content/batch02/beckham-law.ts";
import { taxExample } from "../src/lib/content/batch02/income-tax.ts";
import { NIE_TIE_GUIDE } from "../src/lib/content/batch02/nie-tie.ts";
import { B2_PATHS, B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { money } from "../src/lib/programmatic/net-salary/copy.ts";
import { specialRegimeTax } from "../src/lib/programmatic/net-salary/engine.ts";
import { SPECIAL_REGIME, SPECIAL_REGIME_RECHECK_BY } from "../src/lib/programmatic/net-salary/special-regime.ts";

const blocks = (locale: Locale) => BECKHAM_GUIDE.editions[locale].blocks;
const json = (locale: Locale) => JSON.stringify(blocks(locale));
const text = (locale: Locale) => bodyToPlainText(blocks(locale));
const links = (locale: Locale) => [...json(locale).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);
const tables = (locale: Locale) => (blocks(locale) as unknown as { type: string; rows?: string[][] }[]).filter((b) => b.type === "table");

/** Hosts read on 18 and 21 Nov 2026: BOE, the AEAT e-office and Social Security (Import@ss). */
const OFFICIAL = /^(www\.boe\.es|sede\.agenciatributaria\.gob\.es|portal\.seg-social\.gob\.es)$/;

test("beckham: three editions on year-free registry paths, one entry, anchor = title", () => {
  assert.equal(BECKHAM_GUIDE.key, "beckhamLaw");
  assert.equal(BECKHAM_GUIDE.entryKey, "guide-beckham-law-spain");
  assert.deepEqual(Object.keys(BECKHAM_GUIDE.editions).sort(), [...LOCALES].sort());
  for (const locale of LOCALES) {
    const edition = BECKHAM_GUIDE.editions[locale];
    assert.equal(edition.path, B2_PATHS.beckhamLaw[locale]);
    assert.doesNotMatch(edition.path, /\d{4}/, `${locale}: no year in an evergreen path`);
    assert.match(edition.path, /beckham/);
    assert.equal(b2href("beckhamLaw", locale), `/${locale}/${edition.path}/`);
    assert.equal(B2_TITLES.beckhamLaw[locale], edition.seoTitle, `${locale}: link anchor = title`);
  }
  assert.equal(new Set(LOCALES.map((l) => BECKHAM_GUIDE.editions[l].path)).size, 3);
});

test("beckham: every edition validates, is substantial and has the same shape", () => {
  const shape = (locale: Locale) => (blocks(locale) as Block[]).map((b) => b.type).join(",");
  for (const locale of LOCALES) {
    const parsed = bodySchema.safeParse(blocks(locale));
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(locale)) > 1500, `${locale}: ${wordCount(text(locale))} words`);
    assert.equal(shape(locale), shape("es"), `${locale}: same sections as the Spanish edition`);
    assert.deepEqual(buildBeckhamBody(locale), blocks(locale));
    const { seoTitle, seoDescription, excerpt, title } = BECKHAM_GUIDE.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} seoTitle ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 170, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30 && title.length > 10);
    assert.match(seoTitle, /^(Llei|Ley) Beckham|^Beckham law/, `${locale}: title starts with the query words`);
  }
});

test("beckham: the answer comes first, with the rules of art. 93 LIRPF and RIRPF 116 and 119", () => {
  const S = SPECIAL_REGIME;
  assert.deepEqual([S.rate, S.topRate, S.threshold, S.followingYears, S.priorNonResidentYears, S.optionMonths, S.certificateWorkingDays], [24, 47, 600000, 5, 5, 6, 10]);
  const facts: Record<Locale, RegExp[]> = {
    ca: [/24 %/, /47 %/, /600\.000\s€/, /model 149/, /6 mesos/, /10 dies hàbils/, /model 151/, /no s'aplica sol/],
    es: [/24 %/, /47 %/, /600\.000\s€/, /modelo 149/, /6 meses/, /10 días hábiles/, /modelo 151/, /no se aplica solo/],
    en: [/24%/, /47%/, /€600,000/, /form 149/, /6 months/, /10 working days/, /form 151/, /not automatic/],
  };
  for (const locale of LOCALES) {
    const first = blocks(locale)[0] as { text?: string; lead?: boolean };
    assert.ok(first.lead, `${locale}: first block is the lead`);
    for (const fact of facts[locale]) assert.match(first.text ?? "", fact, `${locale}: lead ${fact}`);
  }
});

test("beckham: the comparison is the income tax guide's scales against the art. 93 tax, and the crossover is printed", () => {
  const crossover = beckhamCrossover();
  assert.ok(crossover !== null && crossover > 40000 && crossover < 80000, `crossover ${crossover}`);
  // One crossing: below it the standard IRPF is lower, above it higher.
  assert.ok(taxExample(crossover - 1).total <= specialRegimeTax(crossover - 1).annual);
  assert.ok(taxExample(crossover).total > specialRegimeTax(crossover).annual);
  for (const row of beckhamRows()) {
    assert.equal(row.special, specialRegimeTax(row.gross).annual);
    assert.equal(row.standard, taxExample(row.gross).total);
  }
  assert.ok(beckhamRows()[0]!.saving < 0, "at 40,000 € the regime costs more");
  for (const locale of LOCALES) {
    // Plain text collapses the no-break space money() puts before "€".
    const shown = money(crossover, locale, 0).replace(/\s+/g, " ");
    assert.ok(text(locale).includes(shown), `${locale}: crossover ${shown}`);
    assert.equal(tables(locale)[1]!.rows!.length, beckhamRows().length);
    assert.equal(tables(locale)[2]!.rows!.length, 8, `${locale}: eight deadlines`);
  }
});

test("beckham: nothing the sources do not support (no top savings rate, no 'automatic', no foral rules, no history)", () => {
  for (const locale of LOCALES) {
    const body = text(locale);
    assert.doesNotMatch(body, /\b28\s?%/, `${locale}: the top savings rate is in conflict and is not printed`);
    assert.doesNotMatch(body, /(savings|ahorro|estalvi)[^.]{0,80}\b30\s?%/i, `${locale}: no top savings rate (30 % appears only as the foreign tax credit cap)`);
    assert.doesNotMatch(body, /(is|es|és) automati|se aplica automáticamente|s'aplica automàticament/i, `${locale}: never "automatic"`);
    assert.doesNotMatch(body, /2003|futbol|footballer|Real Madrid/i, `${locale}: no unsourced history`);
    assert.doesNotMatch(body, /aprobad[ao] por la AEAT|approved by the AEAT/i, `${locale}: the AEAT issues a document, it does not "approve"`);
    assert.match(body, locale === "en" ? /Navarre/ : /Navarra/, `${locale}: says foral territories are not covered`);
  }
});

test("beckham: external links are official, https, no tracking, never aerobusbcn; sources are unique", () => {
  for (const locale of LOCALES) {
    const external = links(locale).filter((h) => h.startsWith("http"));
    assert.ok(external.length >= 8, `${locale}: only ${external.length} official links`);
    for (const href of external) {
      const url = new URL(href);
      assert.equal(url.protocol, "https:", href);
      assert.match(url.hostname, OFFICIAL, `${locale}: ${url.hostname} is not an official source`);
      assert.doesNotMatch(href, /utm_|aerobus/i, href);
    }
    for (const must of [BECKHAM_URLS.lirpf93, BECKHAM_URLS.rirpf, BECKHAM_URLS.aeat149, BECKHAM_URLS.aeat151]) {
      assert.ok(links(locale).includes(must), `${locale}: links ${must}`);
    }
  }
  for (const source of BECKHAM_GUIDE.sources) assert.match(new URL(source.url).hostname, OFFICIAL, source.url);
  assert.equal(new Set(BECKHAM_GUIDE.sources.map((s) => s.url)).size, BECKHAM_GUIDE.sources.length, "no duplicate source URL (it breaks the publish)");
});

test("beckham: internal links stay in the edition's language and reach the calculator, the income tax and NIE guides", () => {
  for (const locale of LOCALES) {
    const internal = links(locale).filter((h) => h.startsWith("/"));
    for (const href of internal) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href} crosses languages`);
      assert.match(href, /\/$/, href);
    }
    for (const must of [calcPath("net-salary", locale), b2href("incomeTax", locale), b2href("nieTie", locale)]) {
      assert.ok(internal.includes(must), `${locale}: links ${must}`);
    }
  }
});

test("beckham: the calculator, the NIE guide and the Barcelona hub link to it in every language", () => {
  const component = readFileSync(new URL("../src/components/programmatic/net-salary/SpecialRegimeSections.tsx", import.meta.url), "utf8");
  assert.match(component, /b2href\("beckhamLaw", locale\)/);
  for (const locale of LOCALES) {
    const target = `](${b2href("beckhamLaw", locale)})`;
    assert.ok(JSON.stringify(NIE_TIE_GUIDE.editions[locale].blocks).includes(target), `nie-tie ${locale}`);
    assert.ok(JSON.stringify(BARCELONA_HUB.editions[locale].blocks).includes(target), `hub ${locale}`);
  }
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("ley-beckham"\)\) published\.push\(await publishB2Article\(BECKHAM_GUIDE\)\)/);
});

test("beckham: the rules were read recently (re-read art. 93 LIRPF, RIRPF 113-119 and the AEAT 149/151 pages with the 2027 rules, then move BECKHAM_AS_OF)", () => {
  assert.equal(BECKHAM_GUIDE.verifiedAt, BECKHAM_AS_OF);
  assert.equal(BECKHAM_REREAD_BY, SPECIAL_REGIME_RECHECK_BY, "one yearly re-read for the guide and the calculator");
  assert.ok(BECKHAM_AS_OF < BECKHAM_REREAD_BY);
  assert.ok(Date.now() < Date.parse(`${BECKHAM_REREAD_BY}T00:00:00Z`), `Beckham rules last read ${BECKHAM_AS_OF}: re-read them, then move BECKHAM_AS_OF and SPECIAL_REGIME_RECHECK_BY`);
});
