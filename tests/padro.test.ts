import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { BARCELONA_HUB } from "../src/lib/content/batch02/barcelona-hub.ts";
import { FOREIGN_VOTE } from "../src/lib/content/batch02/foreign-vote.ts";
import { EU_VOTE_PADRO_DEADLINE, PADRO, PADRO_AS_OF, PADRO_REREAD_BY, buildPadroBody } from "../src/lib/content/batch02/padro.ts";
import { B2_PATHS, B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

const json = (locale: Locale) => JSON.stringify(PADRO.editions[locale].blocks);
const text = (locale: Locale) => bodyToPlainText(PADRO.editions[locale].blocks);
const links = (locale: Locale) => [...json(locale).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);
const tables = (locale: Locale) => (PADRO.editions[locale].blocks as unknown as { type: string; rows?: string[][]; caption?: string }[]).filter((b) => b.type === "table");

/** Hosts of the official sources read on 13 Nov 2026: law, the councils, CatSalut, the INE. */
const OFFICIAL = /^(www\.boe\.es|seuelectronica\.ajuntament\.barcelona\.cat|www\.barcelona\.cat|ajuntament\.barcelona\.cat|catsalut\.gencat\.cat|www\.ine\.es|seu-e\.cat|tramits\.paeria\.cat|seu\.tarragona\.cat|seuelectronica\.l-h\.cat)$/;

test("padró: three editions on year-free registry paths, one entry", () => {
  assert.equal(PADRO.key, "padro");
  assert.equal(PADRO.entryKey, "guide-padron-registration-catalonia");
  assert.deepEqual(Object.keys(PADRO.editions).sort(), [...LOCALES].sort());
  for (const locale of LOCALES) {
    const edition = PADRO.editions[locale];
    assert.equal(edition.path, B2_PATHS.padro[locale]);
    assert.doesNotMatch(edition.path, /\d{4}/, `${locale}: no year in an evergreen path`);
    assert.match(edition.path, /^(guies|guias|guides)\/[a-z0-9-]+$/);
    assert.equal(b2href("padro", locale), `/${locale}/${edition.path}/`);
    assert.ok(B2_TITLES.padro[locale].length > 20);
  }
  assert.equal(new Set(LOCALES.map((l) => PADRO.editions[l].path)).size, 3);
});

test("padró: every edition validates, is substantial and has the same shape", () => {
  const shape = (locale: Locale) => (PADRO.editions[locale].blocks as Block[]).map((b) => b.type).join(",");
  for (const locale of LOCALES) {
    const parsed = bodySchema.safeParse(PADRO.editions[locale].blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(locale)) > 1200, `${locale}: ${wordCount(text(locale))} words`);
    assert.equal(shape(locale), shape("es"), `${locale}: same sections as the Spanish edition`);
    assert.deepEqual(buildPadroBody(locale), PADRO.editions[locale].blocks);
    const { seoTitle, seoDescription, excerpt, title } = PADRO.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 65, `${locale} seoTitle ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 165, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30 && title.length > 10);
  }
  assert.match(PADRO.editions.es.seoTitle, /^Empadronarse en Barcelona/);
  assert.match(PADRO.editions.ca.seoTitle, /^Empadronar-se a Barcelona/);
  assert.match(PADRO.editions.en.seoTitle, /padrón/i);
});

test("padró: the answer comes first (free, where, no contract, no legal residence, 3 months)", () => {
  const facts: Record<Locale, RegExp[]> = {
    ca: [/és gratuït/, /no cal contracte de lloguer/, /residència en regla/, /tres mesos/],
    es: [/es gratis/, /no hace falta contrato de alquiler/, /residencia en regla/, /tres meses/],
    en: [/It is free/, /neither a rental contract nor legal residence/, /three months/],
  };
  for (const locale of LOCALES) {
    const lead = (PADRO.editions[locale].blocks[0] as { text?: string; lead?: boolean });
    assert.ok(lead.lead, `${locale}: first block is the lead`);
    for (const fact of facts[locale]) assert.match(lead.text ?? "", fact, `${locale}: lead ${fact}`);
  }
});

test("padró: the tables carry the official rules (contract > 3 months, bills of 3 months, renewal 2 and 5 years)", () => {
  for (const locale of LOCALES) {
    const t = tables(locale);
    assert.equal(t.length, 4, `${locale}: ID, address, renewal, cities`);
    const all = JSON.stringify(t);
    assert.match(all, /3 (mesos|meses|months)/, `${locale}: 3-month rule`);
    assert.match(all, /2 (anys|años|years)/, `${locale}: non-EU renewal`);
    assert.match(all, /5 (anys|años|years)/, `${locale}: EU confirmation`);
    assert.match(all, /(mòbil|móvil|Mobile)/, `${locale}: phone bills not accepted`);
    assert.equal(t[3]?.rows?.length, 4, `${locale}: four other cities`);
  }
});

test("padró: no invented deadline after arrival (the law sets none)", () => {
  for (const locale of LOCALES) {
    assert.doesNotMatch(text(locale), /\b90 (dies|días|days)\b|sis mesos|seis meses|six months/, `${locale}: no 90-day or 6-month rule`);
  }
});

test("padró: the EU voters' padrón deadline matches the INE (30 Dec 2026) and links the foreign-vote guide", () => {
  assert.equal(EU_VOTE_PADRO_DEADLINE, "2026-12-30");
  const day = { ca: /30 de desembre de 2026/, es: /30 de diciembre de 2026/, en: /30 December 2026/ } as const;
  for (const locale of LOCALES) {
    assert.match(text(locale), day[locale], locale);
    assert.ok(links(locale).includes(b2href("foreignVote", locale)), `${locale}: links the foreign-vote guide`);
  }
});

test("padró: external links are official sites only, https, no tracking, never aerobusbcn", () => {
  for (const locale of LOCALES) {
    const external = links(locale).filter((h) => h.startsWith("http"));
    assert.ok(external.length >= 8, `${locale}: only ${external.length} official links`);
    for (const href of external) {
      const url = new URL(href);
      assert.equal(url.protocol, "https:", href);
      assert.match(url.hostname, OFFICIAL, `${locale}: ${url.hostname} is not an official source`);
      assert.doesNotMatch(href, /utm_|aerobus/i, href);
    }
  }
  for (const source of PADRO.sources) {
    assert.match(new URL(source.url).hostname, OFFICIAL, source.url);
  }
  assert.equal(new Set(PADRO.sources.map((s) => s.url)).size, PADRO.sources.length, "no duplicate source URL (it breaks the publish)");
});

test("padró: internal links stay in the edition's language and end in a slash", () => {
  for (const locale of LOCALES) {
    for (const href of links(locale).filter((h) => h.startsWith("/"))) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href} crosses languages`);
      assert.match(href, /\/$/, href);
    }
  }
});

test("padró: hero exists in the manifest, alt and caption in every language", () => {
  assert.ok(IMAGES.some((image) => image.key === PADRO.heroKey));
  for (const locale of LOCALES) {
    assert.ok((PADRO.heroAlt?.[locale] ?? "").length > 15);
    assert.ok((PADRO.heroCaption?.[locale] ?? "").length > 15);
  }
});

test("padró: the facts were read recently (re-read the Barcelona sheet, BOE and CatSalut, then move PADRO_AS_OF)", () => {
  assert.equal(PADRO.verifiedAt, PADRO_AS_OF);
  assert.ok(PADRO_AS_OF < PADRO_REREAD_BY);
  assert.ok(Date.now() < Date.parse(`${PADRO_REREAD_BY}T00:00:00Z`), `padró facts last read ${PADRO_AS_OF}: re-read every source in padro.ts, then move PADRO_AS_OF and PADRO_REREAD_BY`);
});

test("padró: the foreign-vote guide and the Barcelona hub link to it in every language", () => {
  for (const locale of LOCALES) {
    const target = `](${b2href("padro", locale)})`;
    assert.ok(JSON.stringify(FOREIGN_VOTE.editions[locale].blocks).includes(target), `foreign vote ${locale}`);
    assert.ok(JSON.stringify(BARCELONA_HUB.editions[locale].blocks).includes(target), `hub ${locale}`);
  }
});

test("padró: the publish route registers `padro` and `padro-links`", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("padro"\)\) published\.push\(await publishB2Article\(PADRO\)\)/);
  assert.match(route, /wants\("padro-links"\)\) published\.push\(await publishB2Article\(FOREIGN_VOTE\), await publishB2Article\(BARCELONA_HUB\)\)/);
});
