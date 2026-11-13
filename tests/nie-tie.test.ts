import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { BARCELONA_HUB } from "../src/lib/content/batch02/barcelona-hub.ts";
import { NIE_TIE_AS_OF, NIE_TIE_GUIDE, NIE_TIE_REREAD_BY, NIE_TIE_URLS, buildNieTieBody } from "../src/lib/content/batch02/nie-tie.ts";
import { PADRO } from "../src/lib/content/batch02/padro.ts";
import { B2_PATHS, B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import { TSI_GUIDE } from "../src/lib/content/batch02/tsi.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

const json = (locale: Locale) => JSON.stringify(NIE_TIE_GUIDE.editions[locale].blocks);
const text = (locale: Locale) => bodyToPlainText(NIE_TIE_GUIDE.editions[locale].blocks);
const links = (locale: Locale) => [...json(locale).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);
const tables = (locale: Locale) => (NIE_TIE_GUIDE.editions[locale].blocks as unknown as { type: string; rows?: string[][]; caption?: string }[]).filter((b) => b.type === "table");

/**
 * Hosts of the sources read on 13 Nov 2026: BOE, the Ministry of Territorial
 * Policy's e-office and the Government Delegation in Catalonia, its enquiry
 * form, and the National Police e-office. inclusion.gob.es and interior.gob.es
 * answered 403 and are not linked.
 */
const OFFICIAL = /^(www\.boe\.es|sede\.administracionespublicas\.gob\.es|mptmd\.gob\.es|ssweb\.seap\.minhap\.es|sede\.policia\.gob\.es)$/;

test("nie-tie: three editions on year-free registry paths, one entry", () => {
  assert.equal(NIE_TIE_GUIDE.key, "nieTie");
  assert.equal(NIE_TIE_GUIDE.entryKey, "guide-nie-tie-barcelona-catalonia");
  assert.deepEqual(Object.keys(NIE_TIE_GUIDE.editions).sort(), [...LOCALES].sort());
  for (const locale of LOCALES) {
    const edition = NIE_TIE_GUIDE.editions[locale];
    assert.equal(edition.path, B2_PATHS.nieTie[locale]);
    assert.doesNotMatch(edition.path, /\d{4}/, `${locale}: no year in an evergreen path`);
    assert.match(edition.path, /^(guies|guias|guides)\/nie-tie-[a-z0-9-]+$/);
    assert.equal(b2href("nieTie", locale), `/${locale}/${edition.path}/`);
    assert.ok(B2_TITLES.nieTie[locale].length > 20);
  }
  assert.equal(new Set(LOCALES.map((l) => NIE_TIE_GUIDE.editions[l].path)).size, 3);
});

test("nie-tie: every edition validates, is substantial and has the same shape", () => {
  const shape = (locale: Locale) => (NIE_TIE_GUIDE.editions[locale].blocks as Block[]).map((b) => b.type).join(",");
  for (const locale of LOCALES) {
    const parsed = bodySchema.safeParse(NIE_TIE_GUIDE.editions[locale].blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(locale)) > 1500, `${locale}: ${wordCount(text(locale))} words`);
    assert.equal(shape(locale), shape("es"), `${locale}: same sections as the Spanish edition`);
    assert.deepEqual(buildNieTieBody(locale), NIE_TIE_GUIDE.editions[locale].blocks);
    const { seoTitle, seoDescription, excerpt, title } = NIE_TIE_GUIDE.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} seoTitle ${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 170, `${locale} description ${seoDescription.length}`);
    assert.ok(excerpt.length > 30 && title.length > 10);
    assert.match(seoTitle, /^NIE (i|y|and) TIE/, `${locale}: title starts with the query words`);
  }
});

test("nie-tie: the answer comes first (number vs card vs EU certificate, forms, 790-012, cita previa, fees)", () => {
  const facts: Record<Locale, RegExp[]> = {
    ca: [/NIE és un número/, /TIE és una targeta/, /certificat de registre/, /EX-17/, /EX-18/, /EX-15/, /cita prèvia/, /790 codi 012/, /9,84 €/, /12 €/, /16,08 €/],
    es: [/NIE es un número/, /TIE es una tarjeta/, /certificado de registro/, /EX-17/, /EX-18/, /EX-15/, /cita previa/, /790 código 012/, /9,84 €/, /12 €/, /16,08 €/],
    en: [/NIE is a number/, /TIE is a card/, /registration certificate/, /EX-17/, /EX-18/, /EX-15/, /cita previa/, /790, code 012/, /€9\.84/, /€12/, /€16\.08/],
  };
  for (const locale of LOCALES) {
    const first = NIE_TIE_GUIDE.editions[locale].blocks[0] as { text?: string; lead?: boolean };
    assert.ok(first.lead, `${locale}: first block is the lead`);
    for (const fact of facts[locale]) assert.match(first.text ?? "", fact, `${locale}: lead ${fact}`);
  }
});

test("nie-tie: fees are the Orden PJC/617/2025 amounts, and nothing else is printed as a fee", () => {
  const amount = (locale: Locale, n: string) => (locale === "en" ? `€${n.replace(",", ".")}` : `${n} €`);
  for (const locale of LOCALES) {
    const fees = tables(locale)[1]!;
    const flat = JSON.stringify(fees.rows);
    for (const n of ["9,84", "12,00", "16,08", "19,30", "21,87", "7,31"]) assert.ok(flat.includes(amount(locale, n)), `${locale}: fee ${n}`);
    assert.equal(fees.rows?.length, 7, `${locale}: seven fee lines`);
    assert.doesNotMatch(text(locale), /10[,.]30|15[,.]30|790[- ](código |codi |code )?052/, `${locale}: no outdated fee or wrong fee code`);
    assert.match(text(locale), /PJC\/617\/2025/);
  }
});

test("nie-tie: the law is RD 1155/2024 (in force 20 May 2025) with its deadlines, and RD 240/2007 for EU citizens", () => {
  const rd = { ca: /Reial decret 1155\/2024/, es: /Real Decreto 1155\/2024/, en: /Royal Decree 1155\/2024/ } as const;
  const day = { ca: /20 de maig de 2025/, es: /20 de mayo de 2025/, en: /20 May 2025/ } as const;
  const month = { ca: /en el termini d'un mes/, es: /en el plazo de un mes/, en: /within one month/ } as const;
  const three = { ca: /tres mesos/, es: /tres meses/, en: /three months/ } as const;
  const five = { ca: /cinc dies/, es: /cinco días/, en: /five days/ } as const;
  for (const locale of LOCALES) {
    const body = text(locale);
    assert.match(body, rd[locale], locale);
    assert.match(body, day[locale], `${locale}: entry into force`);
    assert.match(body, month[locale], `${locale}: TIE one month (art. 209.1)`);
    assert.match(body, three[locale], `${locale}: EU three months (RD 240/2007 art. 7.5)`);
    assert.match(body, five[locale], `${locale}: NIE five days (art. 205.4)`);
    assert.match(body, /240\/2007/, locale);
    assert.doesNotMatch(body, /557\/2011/, `${locale}: the 2011 regulation is repealed`);
    assert.doesNotMatch(body, /30 (dies|días|days) (hàbils|hábiles|working)/i, `${locale}: no invented fingerprint deadline`);
  }
});

test("nie-tie: offices in all four provinces, from the official lists", () => {
  for (const locale of LOCALES) {
    const offices = tables(locale)[2]!;
    const flat = JSON.stringify(offices.rows);
    for (const province of ["Barcelona", "Girona", "Lleida", "Tarragona"]) {
      assert.ok(offices.rows?.some((row) => row[0] === province), `${locale}: ${province}`);
    }
    for (const address of ["Mallorca, 213", "Rambla Guipúscoa, 74", "Sant Joan, 189-193", "42 (08027)", "Jaume I, 17", "Cristòfol Grober, 12", "Plaça de la Pau, 1", "Prat de la Riba, 36", "Plaça d'Orleans", "General Moragues, 54", "Ribera, 21", "Joan Moreira, 3", "Estanislau Figueras, 59"]) {
      assert.ok(flat.includes(address), `${locale}: ${address}`);
    }
    assert.match(text(locale), /citabarcelona@correo\.gob\.es/, `${locale}: Barcelona office appointment email`);
  }
});

test("nie-tie: nothing the official pages do not say (no waiting times, no card delivery time, no photo size)", () => {
  for (const locale of LOCALES) {
    const body = text(locale);
    assert.doesNotMatch(body, /\b\d+\s*(setmanes|semanas|weeks)\b/i, `${locale}: no invented delivery or waiting time`);
    assert.doesNotMatch(body, /32\s*x\s*26|tamaño carné|passport-size|mida carnet/i, `${locale}: no photo spec`);
    assert.doesNotMatch(body, /garanti(a|tz)(ada|ed)? (una |la )?cita|guaranteed appointment/i, `${locale}: no promise of an appointment`);
  }
});

test("nie-tie: external links are official sites only, https, no tracking, never aerobusbcn", () => {
  for (const locale of LOCALES) {
    const external = links(locale).filter((h) => h.startsWith("http"));
    assert.ok(external.length >= 10, `${locale}: only ${external.length} official links`);
    for (const href of external) {
      const url = new URL(href);
      assert.equal(url.protocol, "https:", href);
      assert.match(url.hostname, OFFICIAL, `${locale}: ${url.hostname} is not an official source`);
      assert.doesNotMatch(href, /utm_|aerobus/i, href);
    }
    for (const must of [NIE_TIE_URLS.appointment, NIE_TIE_URLS.fee790, NIE_TIE_URLS.rd1155, NIE_TIE_URLS.delegation]) {
      assert.ok(links(locale).includes(must), `${locale}: links ${must}`);
    }
  }
  for (const source of NIE_TIE_GUIDE.sources) {
    assert.match(new URL(source.url).hostname, OFFICIAL, source.url);
  }
  assert.equal(new Set(NIE_TIE_GUIDE.sources.map((s) => s.url)).size, NIE_TIE_GUIDE.sources.length, "no duplicate source URL (it breaks the publish)");
});

test("nie-tie: internal links stay in the edition's language, end in a slash and include padró and TSI", () => {
  for (const locale of LOCALES) {
    const internal = links(locale).filter((h) => h.startsWith("/"));
    for (const href of internal) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href} crosses languages`);
      assert.match(href, /\/$/, href);
    }
    assert.ok(internal.includes(b2href("padro", locale)), `${locale}: links the padró guide`);
    assert.ok(internal.includes(b2href("tsi", locale)), `${locale}: links the TSI guide`);
  }
});

test("nie-tie: no clock times in the running text", () => {
  for (const locale of LOCALES) {
    const prose = bodyToPlainText(NIE_TIE_GUIDE.editions[locale].blocks.filter((b) => b.type !== "table"));
    assert.doesNotMatch(prose, /(?<!€)\b([01]?\d|2[0-3])[:.][0-5]\d\b/, `${locale}: a clock time outside a table`);
  }
});

test("nie-tie: hero exists in the manifest with a credit, alt and caption in every language", () => {
  const hero = IMAGES.find((image) => image.key === NIE_TIE_GUIDE.heroKey);
  assert.ok(hero, "hero in the manifest");
  assert.ok((hero?.credit ?? "").length > 2 && (hero?.license ?? "").length > 2, "licensed image with a credit");
  for (const locale of LOCALES) {
    assert.ok((NIE_TIE_GUIDE.heroAlt?.[locale] ?? "").length > 15);
    assert.ok((NIE_TIE_GUIDE.heroCaption?.[locale] ?? "").length > 15);
  }
});

test("nie-tie: the facts were read recently (fees can change in January: re-read the BOE order, the Police fee table and the offices, then move NIE_TIE_AS_OF)", () => {
  assert.equal(NIE_TIE_GUIDE.verifiedAt, NIE_TIE_AS_OF);
  assert.ok(NIE_TIE_AS_OF < NIE_TIE_REREAD_BY);
  assert.ok(Date.now() < Date.parse(`${NIE_TIE_REREAD_BY}T00:00:00Z`), `NIE/TIE facts last read ${NIE_TIE_AS_OF}: re-read every source in nie-tie.ts (fees from 1 January), then move NIE_TIE_AS_OF and NIE_TIE_REREAD_BY`);
});

test("nie-tie: the padró and TSI guides and the Barcelona hub link to it in every language, and it links back", () => {
  for (const locale of LOCALES) {
    const target = `](${b2href("nieTie", locale)})`;
    assert.ok(JSON.stringify(PADRO.editions[locale].blocks).includes(target), `padró ${locale}`);
    assert.ok(JSON.stringify(TSI_GUIDE.editions[locale].blocks).includes(target), `tsi ${locale}`);
    assert.ok(JSON.stringify(BARCELONA_HUB.editions[locale].blocks).includes(target), `hub ${locale}`);
  }
});

test("nie-tie: the publish route registers `nie-tie` and `nie-tie-links`", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("nie-tie"\)\) published\.push\(await publishB2Article\(NIE_TIE_GUIDE\)\)/);
  assert.match(route, /wants\("nie-tie-links"\)\) published\.push\(await publishB2Article\(PADRO\), await publishB2Article\(TSI_GUIDE\), await publishB2Article\(BARCELONA_HUB\)\)/);
});
