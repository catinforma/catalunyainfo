import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { BARCELONA_HUB } from "../src/lib/content/batch02/barcelona-hub.ts";
import {
  CATALAN_SCALE,
  CATALAN_SCALE_PRINTED,
  INCOME_TAX_AS_OF,
  INCOME_TAX_GUIDE,
  INCOME_TAX_REREAD_BY,
  INCOME_TAX_URLS,
  PERSONAL_MINIMUM,
  STATE_SCALE,
  STATE_SCALE_PRINTED,
  buildIncomeTaxBody,
  combinedBands,
  scaleTax,
  taxExample,
} from "../src/lib/content/batch02/income-tax.ts";
import { NIE_TIE_GUIDE } from "../src/lib/content/batch02/nie-tie.ts";
import { B2_PATHS, B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { money } from "../src/lib/programmatic/net-salary/copy.ts";
import { IRPF } from "../src/lib/programmatic/net-salary/rules-2026.ts";
import { SAVINGS_SCALE } from "../src/lib/programmatic/treasury-bills/rules.ts";

const blocks = (locale: Locale) => INCOME_TAX_GUIDE.editions[locale].blocks;
const json = (locale: Locale) => JSON.stringify(blocks(locale));
const text = (locale: Locale) => bodyToPlainText(blocks(locale));
const links = (locale: Locale) => [...json(locale).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);
const tables = (locale: Locale) => (blocks(locale) as unknown as { type: string; rows?: string[][] }[]).filter((b) => b.type === "table");

/** Hosts read on 21 Nov 2026: BOE, the Catalan Tax Agency and the AEAT e-office. */
const OFFICIAL = /^(www\.boe\.es|atc\.gencat\.cat|sede\.agenciatributaria\.gob\.es)$/;

test("income-tax: three editions on year-free registry paths, one entry, anchor = title", () => {
  assert.equal(INCOME_TAX_GUIDE.key, "incomeTax");
  assert.equal(INCOME_TAX_GUIDE.entryKey, "guide-income-tax-brackets-catalonia");
  assert.deepEqual(Object.keys(INCOME_TAX_GUIDE.editions).sort(), [...LOCALES].sort());
  for (const locale of LOCALES) {
    const edition = INCOME_TAX_GUIDE.editions[locale];
    assert.equal(edition.path, B2_PATHS.incomeTax[locale]);
    assert.doesNotMatch(edition.path, /\d{4}/, `${locale}: no year in an evergreen path`);
    assert.equal(b2href("incomeTax", locale), `/${locale}/${edition.path}/`);
    assert.equal(B2_TITLES.incomeTax[locale], edition.seoTitle, `${locale}: link anchor = title`);
  }
  assert.equal(new Set(LOCALES.map((l) => INCOME_TAX_GUIDE.editions[l].path)).size, 3);
});

test("income-tax: every edition validates, is substantial and has the same shape", () => {
  const shape = (locale: Locale) => (blocks(locale) as Block[]).map((b) => b.type).join(",");
  for (const locale of LOCALES) {
    const parsed = bodySchema.safeParse(blocks(locale));
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(locale)) > 1500, `${locale}: ${wordCount(text(locale))} words`);
    assert.equal(shape(locale), shape("es"), `${locale}: same sections as the Spanish edition`);
    assert.deepEqual(buildIncomeTaxBody(locale), blocks(locale));
    const { seoTitle, seoDescription, excerpt, title } = INCOME_TAX_GUIDE.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} seoTitle ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 170, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30 && title.length > 10);
  }
  assert.match(INCOME_TAX_GUIDE.editions.es.seoTitle, /^Tramos del IRPF 2026/);
  assert.match(INCOME_TAX_GUIDE.editions.ca.seoTitle, /^Trams de l'IRPF 2026/);
  assert.match(INCOME_TAX_GUIDE.editions.en.seoTitle, /^Income tax in Spain 2026/);
});

test("income-tax: the scales are the BOE's (LIRPF art. 63.1; Catalan Tax Code art. 611-1 as rewritten by Decree-law 5/2025)", () => {
  assert.deepEqual(STATE_SCALE.map((b) => [b.from, b.rate]), [[0, 9.5], [12450, 12], [20200, 15], [35200, 18.5], [60000, 22.5], [300000, 24.5]]);
  assert.deepEqual(CATALAN_SCALE.map((b) => [b.from, b.rate]), [[0, 9.5], [12500, 12.5], [22000, 16], [33000, 19], [53000, 21.5], [90000, 23.5], [120000, 24.5], [175000, 25.5]]);
  // The "cuota íntegra" column each law prints, rebuilt from the bands.
  assert.deepEqual(STATE_SCALE.map((b) => scaleTax(STATE_SCALE, b.from)), [...STATE_SCALE_PRINTED]);
  assert.deepEqual(CATALAN_SCALE.map((b) => scaleTax(CATALAN_SCALE, b.from)), [...CATALAN_SCALE_PRINTED]);
  const bands = combinedBands();
  assert.equal(bands[0]!.total, 19);
  assert.equal(bands.at(-1)!.total, 50);
  assert.equal(bands.at(-1)!.from, 300000);
  assert.deepEqual(bands.map((b) => b.total), [19, 21.5, 24.5, 27.5, 31, 34, 37.5, 40, 44, 46, 47, 48, 50]);
  // Catalonia keeps the State personal minimum (AEAT manual, art. 611-2), which is also the withholding algorithm's.
  assert.equal(PERSONAL_MINIMUM, 5550);
  assert.equal(PERSONAL_MINIMUM, IRPF.personalMinimum);
  for (const locale of LOCALES) {
    const body = text(locale);
    assert.doesNotMatch(body, /\b10[,.]5\s?%[^.]{0,40}(primer|first)/i, `${locale}: no outdated 10.5 % first Catalan rate`);
    assert.match(body, /5\/2025/, `${locale}: names Decree-law 5/2025`);
    assert.equal(tables(locale)[0]!.rows!.length, STATE_SCALE.length);
    assert.equal(tables(locale)[1]!.rows!.length, CATALAN_SCALE.length);
    assert.equal(tables(locale)[2]!.rows!.length, bands.length);
  }
});

test("income-tax: the savings scale is the BOE's combined 19-30 %, not the ATC's outdated 14 % top half", () => {
  assert.deepEqual(SAVINGS_SCALE.map((b) => Math.round(b.rate * 1000) / 10), [19, 21, 23, 27, 30]);
  for (const locale of LOCALES) {
    const savings = tables(locale)[4]!;
    assert.equal(savings.rows!.length, 5);
    const last = savings.rows!.at(-1)!;
    assert.match(last[1]!, /^15/, `${locale}: State half 15`);
    assert.match(last[2]!, /^15/, `${locale}: regional half 15 (art. 76, Ley 7/2024)`);
    assert.match(last[3]!, /^30/, `${locale}: combined 30`);
  }
});

test("income-tax: the worked examples come from the calculator's engine and the two scales", () => {
  const e30 = taxExample(30000);
  assert.equal(e30.socialSecurity, 1950);
  assert.equal(e30.base, 26050);
  assert.equal(e30.state, 2463);
  assert.equal(e30.region, 2495.75);
  assert.equal(e30.total, 4958.75);
  assert.equal(e30.withheld, 4926, "the calculator's documented withholding for 30,000 € (SEO_EXPERIMENTS 18 Nov)");
  const e50 = taxExample(50000);
  assert.equal(e50.total, 11442.52);
  for (const locale of LOCALES) {
    const rows = tables(locale)[3]!.rows!;
    assert.equal(rows.length, 8);
    const flat = JSON.stringify(rows);
    assert.ok(flat.includes(money(4958.75, locale, 0)), `${locale}: 30k total`);
    assert.ok(flat.includes(money(4926, locale, 0)), `${locale}: 30k withholding`);
  }
});

test("income-tax: the answer comes first (two scales, 19 to 50 %, 183 days, worldwide income, withholding vs Renta)", () => {
  const facts: Record<Locale, RegExp[]> = {
    ca: [/9,5 %/, /24,5 %/, /25,5 %/, /19 %/, /50 %/, /183 dies/, /renda mundial/, /renda\)/],
    es: [/9,5 %/, /24,5 %/, /25,5 %/, /19 %/, /50 %/, /183 días/, /renta mundial/, /Renta\)/],
    en: [/9\.5%/, /24\.5%/, /25\.5%/, /19%/, /50%/, /183 days/, /worldwide income/, /Renta\)/],
  };
  for (const locale of LOCALES) {
    const first = blocks(locale)[0] as { text?: string; lead?: boolean };
    assert.ok(first.lead, `${locale}: first block is the lead`);
    for (const fact of facts[locale]) assert.match(first.text ?? "", fact, `${locale}: lead ${fact}`);
  }
});

test("income-tax: filing thresholds (art. 96) and non-residents' rates (TRLIRNR art. 25), nothing the sources do not say", () => {
  for (const locale of LOCALES) {
    const body = text(locale);
    // Plain text collapses the no-break space money() puts before "€".
    const plain = (s: string) => s.replace(/\s+/g, " ");
    assert.ok(body.includes(plain(money(22000, locale, 0))), `${locale}: 22,000`);
    assert.ok(body.includes(plain(money(15876, locale, 0))), `${locale}: 15,876`);
    assert.match(body, locale === "en" ? /24%[^.]*19%/ : /24 %[^.]*19 %/, `${locale}: IRNR 24 / 19`);
    assert.doesNotMatch(body, /30 de junio|30 de juny|30 June/, `${locale}: no unread campaign end date`);
    assert.doesNotMatch(body, /Madrid|Andaluc|Valenci/, `${locale}: no other region's scale`);
  }
});

test("income-tax: external links are official, https, no tracking, never aerobusbcn; sources are unique", () => {
  for (const locale of LOCALES) {
    const external = links(locale).filter((h) => h.startsWith("http"));
    assert.ok(external.length >= 10, `${locale}: only ${external.length} official links`);
    for (const href of external) {
      const url = new URL(href);
      assert.equal(url.protocol, "https:", href);
      assert.match(url.hostname, OFFICIAL, `${locale}: ${url.hostname} is not an official source`);
      assert.doesNotMatch(href, /utm_|aerobus/i, href);
    }
    for (const must of [INCOME_TAX_URLS.lirpf63, INCOME_TAX_URLS.dl5, INCOME_TAX_URLS.atc, INCOME_TAX_URLS.algorithm]) {
      assert.ok(links(locale).includes(must), `${locale}: links ${must}`);
    }
  }
  for (const source of INCOME_TAX_GUIDE.sources) assert.match(new URL(source.url).hostname, OFFICIAL, source.url);
  assert.equal(new Set(INCOME_TAX_GUIDE.sources.map((s) => s.url)).size, INCOME_TAX_GUIDE.sources.length, "no duplicate source URL (it breaks the publish)");
});

test("income-tax: internal links stay in the edition's language and reach the calculator, the Beckham and NIE guides", () => {
  for (const locale of LOCALES) {
    const internal = links(locale).filter((h) => h.startsWith("/"));
    for (const href of internal) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href} crosses languages`);
      assert.match(href, /\/$/, href);
    }
    for (const must of [calcPath("net-salary", locale), b2href("beckhamLaw", locale), b2href("nieTie", locale)]) {
      assert.ok(internal.includes(must), `${locale}: links ${must}`);
    }
  }
});

test("income-tax: the NIE guide, the Barcelona hub and the calculator link to it in every language", () => {
  const component = readFileSync(new URL("../src/components/programmatic/net-salary/SpecialRegimeSections.tsx", import.meta.url), "utf8");
  assert.match(component, /b2href\("incomeTax", locale\)/);
  for (const locale of LOCALES) {
    const target = `](${b2href("incomeTax", locale)})`;
    assert.ok(JSON.stringify(NIE_TIE_GUIDE.editions[locale].blocks).includes(target), `nie-tie ${locale}`);
    assert.ok(JSON.stringify(BARCELONA_HUB.editions[locale].blocks).includes(target), `hub ${locale}`);
  }
});

test("income-tax: the publish route registers `irpf-tramos` and `expat-links`", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("irpf-tramos"\)\) published\.push\(await publishB2Article\(INCOME_TAX_GUIDE\)\)/);
  assert.match(route, /wants\("expat-links"\)\) published\.push\(await publishB2Article\(NIE_TIE_GUIDE\), await publishB2Article\(PADRO\), await publishB2Article\(BARCELONA_HUB\)\)/);
});

test("income-tax: the scales were read recently (a budget law or a Catalan tax law can change them from 1 January: re-read the BOE, the DOGC and the ATC, then move INCOME_TAX_AS_OF)", () => {
  assert.equal(INCOME_TAX_GUIDE.verifiedAt, INCOME_TAX_AS_OF);
  assert.ok(INCOME_TAX_AS_OF < INCOME_TAX_REREAD_BY);
  assert.ok(Date.now() < Date.parse(`${INCOME_TAX_REREAD_BY}T00:00:00Z`), `IRPF scales last read ${INCOME_TAX_AS_OF}: re-read LIRPF arts. 63, 66, 76, 96, the Catalan art. 611-1 and the ATC page, then move INCOME_TAX_AS_OF and INCOME_TAX_REREAD_BY`);
});
