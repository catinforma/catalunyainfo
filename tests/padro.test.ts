import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { BARCELONA_HUB } from "../src/lib/content/batch02/barcelona-hub.ts";
import { FOREIGN_VOTE } from "../src/lib/content/batch02/foreign-vote.ts";
import { BCN_CHARTER_UPDATED, EU_VOTE_PADRO_DEADLINE, PADRO, PADRO_AS_OF, PADRO_BCN_CHANNELS_AS_OF, PADRO_BCN_CHANNELS_REREAD_BY, PADRO_MOVE_AS_OF, PADRO_MOVE_REREAD_BY, PADRO_REREAD_BY, PADRO_URLS, buildPadroBody } from "../src/lib/content/batch02/padro.ts";
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
    assert.equal(t.length, 6, `${locale}: channels, ID, address, volante, renewal, cities`);
    const all = JSON.stringify(t);
    assert.match(all, /3 (mesos|meses|months)/, `${locale}: 3-month rule`);
    assert.match(all, /2 (anys|años|years)/, `${locale}: non-EU renewal`);
    assert.match(all, /5 (anys|años|years)/, `${locale}: EU confirmation`);
    assert.match(all, /(mòbil|móvil|Mobile)/, `${locale}: phone bills not accepted`);
    assert.equal(t[5]?.rows?.length, 4, `${locale}: four other cities`);
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

test("padró: changing address within Barcelona, from the council's padrón service charter (OAC or online, free, 90% in under 10 days), section + FAQ in every language", () => {
  const heading: Record<Locale, RegExp> = { ca: /^Canvi de domicili al padró dins de Barcelona$/, es: /^Cambio de domicilio en el padrón dentro de Barcelona$/, en: /^Changing address within Barcelona \(canvi de domicili al padró\)$/ };
  const question: Record<Locale, RegExp> = { ca: /canvi de domicili.*dins de Barcelona/, es: /cambio de domicilio.*dentro de Barcelona/, en: /change my padrón address.*within Barcelona/ };
  const free: Record<Locale, RegExp> = { ca: /és gratuït/, es: /es gratuito/, en: /it is free/i };
  for (const locale of LOCALES) {
    const blocks = PADRO.editions[locale].blocks as unknown as { type: string; level?: number; text?: string; items?: { question: string; answer: string }[] }[];
    const at = blocks.findIndex((b) => b.type === "heading" && heading[locale].test(b.text ?? ""));
    assert.ok(at > 0, `${locale}: no change-of-address heading`);
    assert.equal(blocks[at]!.level, 3, `${locale}: an H3 under the renewal section`);
    const section = blocks.slice(at + 1, at + 3).map((b) => b.text ?? "").join(" ");
    assert.match(section, /OAC/, locale);
    assert.match(section, free[locale], locale);
    assert.match(section, /90 ?%/, locale);
    assert.match(section, /\b10 (dies|días|days)\b/, locale);
    assert.ok(section.includes(PADRO_URLS.bcnCharter), `${locale}: cites the charter`);
    assert.ok(section.includes(locale === "es" ? PADRO_URLS.bcnMoveEs : PADRO_URLS.bcnMoveCa), `${locale}: links the Oficina Virtual change-of-address procedure`);
    // No document list: no official page we could read gives one for a change of address.
    assert.match(section, /no ho detalla la carta|no lo detalla la carta|does not list the documents/, locale);
    const item = blocks.find((b) => b.type === "faq")!.items!.find((i) => question[locale].test(i.question));
    assert.ok(item, `${locale}: no change-of-address FAQ`);
    assert.match(item.answer, /OAC/);
    assert.match(item.answer, /90 ?%/);
  }
  assert.ok(PADRO.sources.some((s) => s.url === PADRO_URLS.bcnCharter), "the charter is a source");
});

test("padró: the change-of-address facts were read recently (re-read Barcelona's padrón service charter, then move PADRO_MOVE_AS_OF)", () => {
  assert.equal(BCN_CHARTER_UPDATED, "2025-02-11");
  assert.ok(PADRO_MOVE_AS_OF < PADRO_MOVE_REREAD_BY);
  assert.ok(Date.now() < Date.parse(`${PADRO_MOVE_REREAD_BY}T00:00:00Z`), `change-of-address facts last read ${PADRO_MOVE_AS_OF}: re-read the charter (PADRO_URLS.bcnCharter; a newer one replaces "Fecha de actualización: 11/02/2025") and the Oficina Virtual tràmit 20200001403, then move PADRO_MOVE_AS_OF and PADRO_MOVE_REREAD_BY`);
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

test("padró: Barcelona channels and timings (27 Nov pass): online ~7 days, OAC on the spot with cita, 010 by post", () => {
  const onSpot = { ca: /En el mateix moment/, es: /En el mismo momento/, en: /On the spot/ } as const;
  for (const locale of LOCALES) {
    const channels = tables(locale)[0]!;
    assert.equal(channels.rows?.length, 3, `${locale}: online, OAC, 010`);
    const all = JSON.stringify(channels);
    assert.match(all, /idCAT Mòbil/, `${locale}: idCAT Mòbil`);
    assert.match(all, /Cl@ve/, `${locale}: Cl@ve`);
    assert.match(all, /7 (dies|días|calendar days)/, `${locale}: ~7 days online`);
    assert.match(all, onSpot[locale], `${locale}: in person on the spot`);
    assert.match(all, /010/, `${locale}: phone channel`);
    assert.ok(all.includes("oficinavirtual/") && all.includes("20230001668"), `${locale}: links the OAC appointment procedure`);
  }
});

test("padró: the volante table says free, PDF at once online, Punt BCN only for the residence one", () => {
  const free = { ca: /gratuïts/, es: /gratuitos/, en: /Both are free/ } as const;
  for (const locale of LOCALES) {
    const volant = tables(locale)[3]!;
    assert.equal(volant.rows?.length, 4, `${locale}: online, OAC, Punt BCN, 010`);
    assert.match(JSON.stringify(volant), /PDF/);
    assert.match(JSON.stringify(volant), /Punt BCN/);
    assert.match(text(locale), free[locale], `${locale}: volantes are free`);
    assert.match(text(locale), /16/, `${locale}: residence volante from 16`);
  }
});

test("padró: the FAQ answers the queries of the 27 Nov snapshot (register someone, online, cita, volante)", () => {
  const asks: Record<Locale, RegExp[]> = {
    ca: [/empadronar algú/, /per internet/, /cita prèvia/, /volant o el certificat/],
    es: [/empadronar a alguien/, /por internet/, /cita previa/, /volante o el certificado/],
    en: [/register someone/, /online/, /appointment/, /volante or certificate/],
  };
  for (const locale of LOCALES) {
    const faqBlock = (PADRO.editions[locale].blocks as unknown as { type: string; items?: { question: string }[] }[]).find((b) => b.type === "faq")!;
    const questions = faqBlock.items!.map((i) => i.question);
    assert.equal(questions.length, 15, `${locale}: 15 questions (10F added the change-of-address one)`);
    assert.match(questions[0]!, /(necessito|necesito|need)/, `${locale}: the requirements question stays first`);
    for (const ask of asks[locale]) assert.ok(questions.some((q) => ask.test(q)), `${locale}: FAQ ${ask}`);
  }
});

test("padró: the Barcelona channel facts were read recently (re-read International Welcome alta + volants pages, then move the date)", () => {
  assert.ok(PADRO_BCN_CHANNELS_AS_OF < PADRO_BCN_CHANNELS_REREAD_BY);
  assert.ok(
    Date.now() < Date.parse(`${PADRO_BCN_CHANNELS_REREAD_BY}T00:00:00Z`),
    `Barcelona channels last read ${PADRO_BCN_CHANNELS_AS_OF}: re-read ${PADRO_URLS.iwAltaCa} and ${PADRO_URLS.iwVolantCa} (idCAT/Cl@ve, cita, on the spot, 7 days, free), then move PADRO_BCN_CHANNELS_AS_OF and PADRO_BCN_CHANNELS_REREAD_BY`,
  );
});
