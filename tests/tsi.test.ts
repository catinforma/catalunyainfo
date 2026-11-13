import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { BARCELONA_HUB } from "../src/lib/content/batch02/barcelona-hub.ts";
import { PADRO } from "../src/lib/content/batch02/padro.ts";
import { B2_PATHS, B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import { TSI_AS_OF, TSI_GUIDE, TSI_REREAD_BY, TSI_URLS, buildTsiBody } from "../src/lib/content/batch02/tsi.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

const json = (locale: Locale) => JSON.stringify(TSI_GUIDE.editions[locale].blocks);
const text = (locale: Locale) => bodyToPlainText(TSI_GUIDE.editions[locale].blocks);
const links = (locale: Locale) => [...json(locale).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);
const tables = (locale: Locale) => (TSI_GUIDE.editions[locale].blocks as unknown as { type: string; rows?: string[][]; caption?: string }[]).filter((b) => b.type === "table");

/** Hosts of the sources read on 13 Nov 2026: CatSalut, its online form, Spain's Social Security and the BOE (RD 180/2026). */
const OFFICIAL = /^(catsalut\.gencat\.cat|salut\.gencat\.cat|www\.seg-social\.es|www\.boe\.es)$/;

test("tsi: three editions on year-free registry paths, one entry", () => {
  assert.equal(TSI_GUIDE.key, "tsi");
  assert.equal(TSI_GUIDE.entryKey, "guide-health-card-tsi-catalonia");
  assert.deepEqual(Object.keys(TSI_GUIDE.editions).sort(), [...LOCALES].sort());
  for (const locale of LOCALES) {
    const edition = TSI_GUIDE.editions[locale];
    assert.equal(edition.path, B2_PATHS.tsi[locale]);
    assert.doesNotMatch(edition.path, /\d{4}/, `${locale}: no year in an evergreen path`);
    assert.match(edition.path, /^(guies|guias|guides)\/[a-z0-9-]+$/);
    assert.equal(b2href("tsi", locale), `/${locale}/${edition.path}/`);
    assert.ok(B2_TITLES.tsi[locale].length > 20);
  }
  assert.equal(new Set(LOCALES.map((l) => TSI_GUIDE.editions[l].path)).size, 3);
});

test("tsi: every edition validates, is substantial and has the same shape", () => {
  const shape = (locale: Locale) => (TSI_GUIDE.editions[locale].blocks as Block[]).map((b) => b.type).join(",");
  for (const locale of LOCALES) {
    const parsed = bodySchema.safeParse(TSI_GUIDE.editions[locale].blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(locale)) > 1500, `${locale}: ${wordCount(text(locale))} words`);
    assert.equal(shape(locale), shape("es"), `${locale}: same sections as the Spanish edition`);
    assert.deepEqual(buildTsiBody(locale), TSI_GUIDE.editions[locale].blocks);
    const { seoTitle, seoDescription, excerpt, title } = TSI_GUIDE.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} seoTitle ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 170, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30 && title.length > 10);
  }
  assert.match(TSI_GUIDE.editions.es.seoTitle, /^Tarjeta sanitaria \(TSI\) en Cataluña/);
  assert.match(TSI_GUIDE.editions.ca.seoTitle, /^Targeta sanitària \(TSI\) a Catalunya/);
  assert.match(TSI_GUIDE.editions.en.seoTitle, /health card \(TSI\)/i);
});

test("tsi: the answer comes first (padró, online or CAP, provisional receipt with CIP, free)", () => {
  const facts: Record<Locale, RegExp[]> = {
    ca: [/empadronat/, /per internet o al teu centre d'atenció primària/, /resguard provisional/, /CIP/, /sense cost/],
    es: [/empadronado/, /por internet o en tu centro de atención primaria/, /resguardo provisional/, /CIP/, /sin coste/],
    en: [/on the padró/, /online or at your primary care centre/, /provisional receipt/, /CIP/, /free/],
  };
  for (const locale of LOCALES) {
    const first = TSI_GUIDE.editions[locale].blocks[0] as { text?: string; lead?: boolean };
    assert.ok(first.lead, `${locale}: first block is the lead`);
    for (const fact of facts[locale]) assert.match(first.text ?? "", fact, `${locale}: lead ${fact}`);
  }
});

test("tsi: the situation tables cover workers, dependants, newborns, EU/S1, undocumented, special agreement", () => {
  for (const locale of LOCALES) {
    const t = tables(locale);
    assert.equal(t.length, 4, `${locale}: workers, others, timings, after`);
    assert.equal(t[0]?.rows?.length, 5, `${locale}: five Social Security situations`);
    assert.equal(t[1]?.rows?.length, 9, `${locale}: nine other situations`);
    const all = JSON.stringify(t);
    assert.match(all, /INSS/);
    assert.match(all, /26/, `${locale}: dependants under 26`);
    assert.match(all, /65 %|65%/, `${locale}: 65% disability`);
    assert.match(all, /S1/, `${locale}: S1`);
    assert.match(all, /60 €|€60/, `${locale}: special agreement under 65`);
    assert.match(all, /157 €|€157/, `${locale}: special agreement 65+`);
    assert.match(all, /10 (dies hàbils|días hábiles|working days)/, `${locale}: CAP change answer`);
    assert.match(all, /30 (dies|días|days)/, `${locale}: special agreement answer`);
    assert.match(all, /061/, `${locale}: 061 Salut Respon`);
  }
});

test("tsi: the padró requirement is a certificate under three months, and RD 180/2026 is in", () => {
  const three = { ca: /menys de tres mesos/, es: /menos de tres meses/, en: /within the last three months/ } as const;
  const rd = { ca: /Reial decret 180\/2026/, es: /Real Decreto 180\/2026/, en: /Royal Decree 180\/2026/ } as const;
  const day = { ca: /13 de març de 2026/, es: /13 de marzo de 2026/, en: /13 March 2026/ } as const;
  for (const locale of LOCALES) {
    assert.match(text(locale), three[locale], locale);
    assert.match(text(locale), rd[locale], locale);
    assert.match(text(locale), day[locale], `${locale}: in force the day after the BOE of 12 Mar 2026`);
  }
});

test("tsi: nothing the official pages do not say (no card delivery time, no photo, no one-year expiry)", () => {
  for (const locale of LOCALES) {
    const body = text(locale);
    assert.doesNotMatch(body, /\b\d+\s*(setmanes|semanas|weeks)\b/i, `${locale}: no invented delivery time`);
    assert.doesNotMatch(body, /\b(foto|fotografia carnet|passport photo|photograph of you)\b/i, `${locale}: no photo requirement`);
    assert.doesNotMatch(body, /caduca (al cap d'un any|al año)|expires after (a|one) year/i, `${locale}: no one-year expiry`);
  }
});

test("tsi: external links are official sites only, https, no tracking, never aerobusbcn", () => {
  for (const locale of LOCALES) {
    const external = links(locale).filter((h) => h.startsWith("http"));
    assert.ok(external.length >= 8, `${locale}: only ${external.length} official links`);
    for (const href of external) {
      const url = new URL(href);
      assert.equal(url.protocol, "https:", href);
      assert.match(url.hostname, OFFICIAL, `${locale}: ${url.hostname} is not an official source`);
      assert.doesNotMatch(href, /utm_|aerobus/i, href);
    }
    assert.ok(links(locale).includes(TSI_URLS.form), `${locale}: links the online form`);
  }
  for (const source of TSI_GUIDE.sources) {
    assert.match(new URL(source.url).hostname, OFFICIAL, source.url);
  }
  assert.equal(new Set(TSI_GUIDE.sources.map((s) => s.url)).size, TSI_GUIDE.sources.length, "no duplicate source URL (it breaks the publish)");
});

test("tsi: internal links stay in the edition's language, end in a slash and include the padró guide", () => {
  for (const locale of LOCALES) {
    const internal = links(locale).filter((h) => h.startsWith("/"));
    for (const href of internal) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href} crosses languages`);
      assert.match(href, /\/$/, href);
    }
    assert.ok(internal.includes(b2href("padro", locale)), `${locale}: links the padró guide`);
  }
});

test("tsi: no clock times in the running text", () => {
  for (const locale of LOCALES) {
    const prose = bodyToPlainText(TSI_GUIDE.editions[locale].blocks.filter((b) => b.type !== "table"));
    assert.doesNotMatch(prose, /(?<!€)\b([01]?\d|2[0-3])[:.][0-5]\d\b/, `${locale}: a clock time outside a table`);
  }
});

test("tsi: hero exists in the manifest with a credit, alt and caption in every language", () => {
  const hero = IMAGES.find((image) => image.key === TSI_GUIDE.heroKey);
  assert.ok(hero, "hero in the manifest");
  assert.ok((hero?.credit ?? "").length > 2 && (hero?.license ?? "").length > 2, "licensed image with a credit");
  for (const locale of LOCALES) {
    assert.ok((TSI_GUIDE.heroAlt?.[locale] ?? "").length > 15);
    assert.ok((TSI_GUIDE.heroCaption?.[locale] ?? "").length > 15);
  }
});

test("tsi: the facts were read recently (re-read every CatSalut page, the INSS pages and the BOE, then move TSI_AS_OF)", () => {
  assert.equal(TSI_GUIDE.verifiedAt, TSI_AS_OF);
  assert.ok(TSI_AS_OF < TSI_REREAD_BY);
  assert.ok(Date.now() < Date.parse(`${TSI_REREAD_BY}T00:00:00Z`), `TSI facts last read ${TSI_AS_OF}: re-read every source in tsi.ts, then move TSI_AS_OF and TSI_REREAD_BY`);
});

test("tsi: the padró guide and the Barcelona hub link to it in every language, and it links back", () => {
  for (const locale of LOCALES) {
    const target = `](${b2href("tsi", locale)})`;
    assert.ok(JSON.stringify(PADRO.editions[locale].blocks).includes(target), `padró ${locale}`);
    assert.ok(JSON.stringify(BARCELONA_HUB.editions[locale].blocks).includes(target), `hub ${locale}`);
    assert.ok(json(locale).includes(`](${b2href("padro", locale)})`), `tsi -> padró ${locale}`);
  }
});

test("tsi: the publish route registers `tsi` and `tsi-links`", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("tsi"\)\) published\.push\(await publishB2Article\(TSI_GUIDE\)\)/);
  assert.match(route, /wants\("tsi-links"\)\) published\.push\(await publishB2Article\(PADRO\), await publishB2Article\(BARCELONA_HUB\)\)/);
});
