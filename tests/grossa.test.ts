import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import {
  CATEGORY_ORDER,
  DRAW_TIME_2026,
  GROSSA,
  GROSSA_AS_OF,
  GROSSA_DRAW_DATE,
  GROSSA_META,
  GROSSA_URLS,
  GROSSA_VERIFIED,
  LEVY_EXEMPT,
  LEVY_RATE,
  OFFICIAL_HOSTS,
  PRIZES,
  RESULTS_2025,
  RESULTS_2026,
  buildGrossaArticle,
  buildGrossaBody,
  eur,
  grossaDescription,
  grossaSeoTitle,
  grossaSources,
  inDrawOrder,
  isStale,
  levy,
  neighbours,
  resultsProblems,
  type DrawTime,
  type GrossaResults,
} from "../src/lib/content/batch02/grossa.ts";
import { NEW_YEAR } from "../src/lib/content/batch02/new-year.ts";
import { B2_PATHS, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { SHOPS } from "../src/lib/content/batch02/shops.ts";
import { madridDate } from "../src/lib/content/batch02/strikes.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { holidayOn, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { PATHS as TOOL_PATHS } from "../src/lib/content/home-tools.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/**
 * La Grossa de Cap d'Any 2026 (30 Oct 2026): one page per language, one
 * results slot the lead fills on 31 December.
 *
 * Pins what the page must say (the DOGC's and Loteries de Catalunya's facts
 * read on 30 Oct 2026), what it must never say (a 2026 draw time nobody has
 * announced, a computed prize deadline, last year's numbers as this year's),
 * how it changes when the slot is filled, and fails once 1 January 2027
 * arrives with the slot still empty.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const json = (locale: Locale) => JSON.stringify(GROSSA.editions[locale].blocks);
const body = (locale: Locale) => text(GROSSA.editions[locale].blocks);
const sentences = (plain: string) => plain.split(/\n|(?<=[.!?])\s+/);

const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS), ...Object.values(TOOL_PATHS)];
const PUBLISHED = new Set(ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)));

/** A made-up result (not real numbers), with the 99999/00000 wrap on purpose. */
const FAKE: GrossaResults = {
  first: "99999",
  second: "00417",
  third: "51230",
  fourth: ["08802", "63145"],
  fifth: ["00000", "47716", "25058"],
  firstSoldIn: "Tremp",
  source: { name: "La Grossa de Cap d'Any 2026: resultats (prova)", url: "https://www.loteriesdecatalunya.cat/resultats/grossa/?prova=1", publisher: "Loteries de Catalunya" },
};

const FAKE_TIME: DrawTime = {
  time: "13:00",
  source: { name: "Nota de premsa de prova", url: "https://www.loteriesdecatalunya.info/prova-hora.pdf", publisher: "Loteries de Catalunya" },
};

/* -------------------------------------------------------------------------- */
/* Structure, SEO, links, photo                                               */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on the registry paths", () => {
  assert.deepEqual(B2_PATHS.grossa, {
    ca: "guies/la-grossa-cap-d-any",
    es: "guias/la-grossa-fin-de-ano",
    en: "guides/la-grossa-new-years-eve-lottery",
  });
  for (const locale of LOCALES) {
    const edition = GROSSA.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(body(locale)) > 1200, `${locale} is thin: ${wordCount(body(locale))}`);
    assert.equal(edition.path, B2_PATHS.grossa[locale]);
    assert.equal(edition.path, GROSSA_META[locale].path);
    assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
  }
});

test("the paths collide with no other published path", () => {
  for (const locale of LOCALES) {
    const all = ALL_PATHS.map((paths) => paths[locale]);
    assert.equal(all.filter((path) => path === B2_PATHS.grossa[locale]).length, 1, locale);
  }
});

test("titles fit in 60 characters and descriptions in 155, before and after the draw, and answer first", () => {
  const pendingAnswer: Record<Locale, RegExp> = {
    ca: /^La Grossa de Cap d'Any 2026 se sorteja el 31 de desembre: bitllet de 10 € i 200\.000 € de primer premi/,
    es: /^La Grossa de Cap d'Any 2026 se sortea el 31 de diciembre: billete de 10 € y 200\.000 € de primer premio/,
    en: /^La Grossa de Cap d'Any 2026, Catalonia's New Year's Eve lottery, is drawn on 31 December: €10 tickets, €200,000 top prize/,
  };
  const searched: Record<Locale, RegExp> = {
    ca: /^La Grossa de Cap d'Any 2026: resultats/,
    es: /^La Grossa de Cap d'Any 2026: resultados/,
    en: /^La Grossa de Cap d'Any 2026: results/,
  };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, excerpt, title } = GROSSA.editions[locale];
    assert.ok(title.length > 20, locale);
    assert.match(title, /^La Grossa de Cap d'Any 2026/);
    assert.ok(excerpt.length > 30 && excerpt.length <= 200, `${locale} excerpt ${excerpt.length}`);
    for (const results of [null, FAKE, RESULTS_2026]) {
      const t = grossaSeoTitle(locale, results);
      const d = grossaDescription(locale, results);
      assert.ok(t.length > 10 && t.length <= 60, `${locale} title ${t.length}: ${t}`);
      assert.ok(d.length > 60 && d.length <= 155, `${locale} description ${d.length}: ${d}`);
    }
    assert.equal(seoTitle, grossaSeoTitle(locale));
    assert.equal(seoDescription, grossaDescription(locale));
    if (!RESULTS_2026) {
      assert.match(seoTitle, searched[locale]);
      assert.match(seoDescription, pendingAnswer[locale]);
    }
    // With results, title and description lead with the winning numbers.
    assert.match(grossaSeoTitle(locale, FAKE), /Resultats|Resultados|results/);
    assert.match(grossaSeoTitle(locale, FAKE), /números premiats|números premiados|winning numbers/);
    const withResults = grossaDescription(locale, FAKE);
    assert.ok(withResults.indexOf(FAKE.first) < 70, `${locale}: the first prize is not in the first line`);
    for (const number of [FAKE.first, FAKE.second, FAKE.third]) assert.ok(withResults.includes(number), `${locale}: ${number}`);
  }
});

test("internal links stay in their language, end in a slash and point at a published path; the NYE page links here once", () => {
  for (const locale of LOCALES) {
    for (const blocks of [json(locale), JSON.stringify(buildGrossaBody(locale, FAKE, FAKE_TIME))]) {
      const hrefs = [...blocks.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1] ?? "");
      for (const href of hrefs) {
        assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
        assert.ok(href.endsWith("/"), href);
        assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
      }
      assert.ok(hrefs.length >= 8, `${locale}: only ${hrefs.length} internal links`);
      // The New Year's Eve guide, in the body and not only in the related rail.
      const nye = `/${locale}/${B2_PATHS.newYear[locale]}/`;
      assert.ok(hrefs.filter((href) => href === nye).length >= 2, `${locale}: no body link to the NYE page`);
    }
    const here = `](/${locale}/${B2_PATHS.grossa[locale]}/)`;
    assert.equal(JSON.stringify(NEW_YEAR.editions[locale].blocks).split(here).length - 1, 1, `NYE/${locale} links here exactly once`);
  }
});

test("external links are https, official, and every one is a listed source", () => {
  const urls = GROSSA.sources.map((source) => source.url);
  assert.equal(new Set(urls).size, urls.length, "a source is listed twice");
  for (const url of urls) {
    assert.match(url, /^https:\/\//, url);
    assert.ok(!/[?&]utm_/.test(url), url);
  }
  const allowed = new Set(["dogc.gencat.cat", "www.boe.es", "sede.agenciatributaria.gob.es", ...OFFICIAL_HOSTS]);
  for (const locale of LOCALES) {
    for (const blocks of [json(locale)]) {
      for (const match of blocks.matchAll(/\]\((https?:[^)]*)\)/g)) {
        const href = match[1] ?? "";
        assert.match(href, /^https:\/\//, href);
        assert.ok(urls.includes(href), `${locale}: ${href} is linked but not in the sources`);
        assert.ok(allowed.has(new URL(href).host), `${locale}: ${href} is not an official host`);
      }
    }
    // With results and a time, their sources join the list.
    const filled = buildGrossaArticle(FAKE, FAKE_TIME);
    const filledUrls = filled.sources.map((s) => s.url);
    for (const match of JSON.stringify(filled.editions[locale].blocks).matchAll(/\]\((https?:[^)]*)\)/g)) {
      assert.ok(filledUrls.includes(match[1] ?? ""), `${locale}: ${match[1]} is linked but not in the sources`);
    }
  }
  for (const host of ["dogc.gencat.cat", "www.loteriesdecatalunya.cat", "www.loteriesdecatalunya.info", "www.boe.es", "sede.agenciatributaria.gob.es", "www.3cat.cat"]) {
    assert.ok(urls.some((url) => new URL(url).host === host), `no source on ${host}`);
  }
  // No commercial reseller anywhere.
  for (const url of urls) assert.ok(allowed.has(new URL(url).host), `${url} is not an official source`);
  assert.equal(GROSSA.verifiedAt, GROSSA_VERIFIED);
});

test("the read-next box only repeats links from the related rail, and the NYE page comes first", () => {
  for (const locale of LOCALES) {
    const before = GROSSA.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    assert.ok(related.items?.[0]?.includes(`(/${locale}/${B2_PATHS.newYear[locale]}/)`), locale);
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) {
      assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
    }
  }
});

test("no new photograph: the hero is the shops guide's second file with its exact alt and caption", () => {
  assert.ok(GROSSA.heroKey && IMAGE_BY_KEY.has(GROSSA.heroKey));
  assert.equal(GROSSA.heroKey, SHOPS.secondaryKey);
  assert.deepEqual(GROSSA.heroAlt, SHOPS.secondaryAlt, "alt differs from the existing media row");
  assert.deepEqual(GROSSA.heroCaption, SHOPS.secondaryCaption, "caption differs from the existing media row");
  assert.equal(GROSSA.secondaryKey, undefined);
  for (const locale of LOCALES) {
    assert.ok(!GROSSA.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
  }
});

/* -------------------------------------------------------------------------- */
/* Known answers read on 30 Oct 2026                                          */
/* -------------------------------------------------------------------------- */

test("known answers: the date, the price, the numbers and series, the sales window (DOGC 8.4.2026)", () => {
  assert.equal(GROSSA_DRAW_DATE, "2026-12-31");
  assert.equal(weekdayIndex(GROSSA_DRAW_DATE), 4); // Thursday
  assert.equal(holidayOn(GROSSA_DRAW_DATE), null, "31 December is a working day");
  assert.ok(holidayOn("2027-01-01"), "1 January 2027 is a public holiday");
  assert.equal(weekdayIndex("2027-01-01"), 5); // Friday
  const leadWords: Record<Locale, RegExp[]> = {
    ca: [/^La Grossa de Cap d'Any 2026 se sorteja el dijous 31 de desembre, i el primer premi és de 200\.000 € per bitllet de 10 €/, /encara no s'ha anunciat/, /13:00/],
    es: [/^La Grossa de Cap d'Any 2026 se sortea el jueves 31 de diciembre, y el primer premio es de 200\.000 € por billete de 10 €/, /aún no se ha anunciado/, /13:00/],
    en: [/^La Grossa de Cap d'Any 2026 is drawn on Thursday 31 December, and the first prize is €200,000 per €10 ticket/, /not been announced yet/, /13:00/],
  };
  const facts: Record<Locale, RegExp[]> = {
    ca: [/00000 al 99999/, /35 sèries/, /12 de setembre/, /11:00 del 31 de desembre/, /61,59%/, /8 d'abril de 2026/, /90 dies/],
    es: [/00000 al 99999/, /35 series/, /12 de septiembre/, /11:00 del 31 de diciembre/, /61,59%/, /8 de abril de 2026/, /90 días/],
    en: [/00000 to 99999/, /35 series/, /12 September/, /11:00 on 31 December/, /61\.59%/, /8 April 2026/, /90 (calendar )?days/],
  };
  for (const locale of LOCALES) {
    const blocks = GROSSA.editions[locale].blocks;
    assert.equal(blocks[0]?.type, "paragraph");
    assert.equal((blocks[0] as { lead?: boolean }).lead, true);
    assert.equal(blocks[1]?.type, "keyFacts");
    const leadText = text(blocks.slice(0, 1));
    if (!RESULTS_2026 && !DRAW_TIME_2026) for (const pattern of leadWords[locale]) assert.match(leadText, pattern, `${locale} lead`);
    const all = body(locale);
    for (const pattern of facts[locale]) assert.match(all, pattern, locale);
    assert.ok(json(locale).includes(`](${GROSSA_URLS.dogc2026})`), `${locale}: no link to the DOGC`);
  }
});

test("known answers: the prize table is the DOGC's, row by row", () => {
  assert.deepEqual(
    CATEGORY_ORDER.map((c) => [PRIZES[c].count, PRIZES[c].five, PRIZES[c].neighbours, PRIZES[c].last4, PRIZES[c].last3, PRIZES[c].last2, PRIZES[c].last1]),
    [
      [1, 200_000, 2_000, 1_000, 250, 35, 10],
      [1, 65_000, 650, 300, 75, 25, null],
      [1, 30_000, 500, 200, 35, 20, null],
      [2, 10_000, 200, 100, 30, 15, null],
      [3, 5_000, 150, 75, 25, 10, null],
    ],
  );
  // Eight extractions, each used once, the first prize last.
  assert.deepEqual(CATEGORY_ORDER.flatMap((c) => PRIZES[c].extractions).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(PRIZES.first.extractions, [8]);
  assert.deepEqual(PRIZES.fifth.extractions, [1, 2, 3]);
  for (const locale of LOCALES) {
    const tables = GROSSA.editions[locale].blocks.filter((b) => b.type === "table") as { rows: string[][] }[];
    const prizeTable = tables.find((t) => t.rows.length === 5);
    assert.ok(prizeTable, `${locale}: no prize table`);
    assert.deepEqual(
      prizeTable.rows.map((row) => row.slice(1)),
      CATEGORY_ORDER.map((c) => {
        const p = PRIZES[c];
        return [String(p.count), eur(p.five, locale), eur(p.neighbours, locale), eur(p.last4, locale), eur(p.last3, locale), eur(p.last2, locale)];
      }),
      locale,
    );
    // The draw order, in words.
    const all = body(locale);
    assert.match(all, /8a extracció: el primer premi|8\.ª extracción: el primer premio|8th draw: the first prize/, locale);
    assert.match(all, /1a, 2a i 3a extraccions: els tres cinquens|1\.ª, 2\.ª y 3\.ª extracciones: los tres quintos|1st, 2nd and 3rd draws: the three fifth/, locale);
    assert.match(all, /99999/, locale);
  }
  assert.equal(eur(200_000, "ca"), "200.000 €");
  assert.equal(eur(1_000, "es"), "1.000 €");
  assert.equal(eur(65_000, "en"), "€65,000");
  assert.equal(eur(35, "ca"), "35 €");
});

test("known answers: where to buy and collect, official channels only", () => {
  const claims: Record<Locale, RegExp[]> = {
    ca: [/Fins a 120 €/, /A partir de 50 €/, /CaixaBank/, /Enric Granados, 33/, /9:00 a 14:00/, /Des de 2\.000 €/, /DNI/, /fins a 400 €/, /principalment per supermercats/, /empadronat a Catalunya/, /menors d'edat no poden jugar/, /18 de desembre/, /30 de març de 2026/],
    es: [/Hasta 120 €/, /A partir de 50 €/, /CaixaBank/, /Enric Granados, 33/, /9:00 a 14:00/, /Desde 2\.000 €/, /DNI/, /hasta 400 €/, /principalmente por supermercados/, /empadronado en Cataluña/, /menores de edad no pueden jugar/, /18 de diciembre/, /30 de marzo de 2026/],
    en: [/Up to €120/, /From €50/, /CaixaBank/, /Enric Granados 33/, /9:00 to 14:00/, /From €2,000/, /DNI/, /up to €400/, /mainly of supermarkets/, /empadronat/, /Under-18s may not play/, /18 December/, /30 March 2026/],
  };
  for (const locale of LOCALES) {
    const all = body(locale);
    for (const pattern of claims[locale]) assert.match(all, pattern, `${locale}: ${pattern}`);
    const blocks = json(locale);
    for (const url of [GROSSA_URLS.results, GROSSA_URLS.outlets, GROSSA_URLS.payment, GROSSA_URLS.home]) {
      assert.ok(blocks.includes(`](${url})`), `${locale}: no link to ${url}`);
    }
    // Supermarkets are named as a channel, never by brand, and no reseller is named.
    assert.doesNotMatch(all, /Bonpreu|Bon Preu|Carrefour|Caprabo|TuLotero|Loterías? online/i, locale);
  }
});

test("known answers: the levy is 20% of each ticket's prize above €40,000 (Ley 35/2006, DA 33ª)", () => {
  assert.equal(LEVY_EXEMPT, 40_000);
  assert.equal(LEVY_RATE, 0.2);
  assert.equal(levy(200_000), 32_000);
  assert.equal(levy(65_000), 5_000);
  assert.equal(levy(40_000), 0);
  assert.equal(levy(30_000), 0);
  const net: Record<Locale, RegExp[]> = {
    ca: [/32\.000 €/, /168\.000 €/, /5\.000 €/, /60\.000 €/, /disposició addicional 33a/],
    es: [/32\.000 €/, /168\.000 €/, /5\.000 €/, /60\.000 €/, /disposición adicional 33\.ª/],
    en: [/€32,000/, /€168,000/, /€5,000/, /€60,000/, /additional provision 33/],
  };
  for (const locale of LOCALES) {
    const all = body(locale);
    for (const pattern of net[locale]) assert.match(all, pattern, locale);
    const blocks = json(locale);
    assert.ok(blocks.includes(`](${GROSSA_URLS.irpf})`), `${locale}: no link to the BOE`);
    assert.ok(blocks.includes(`](${GROSSA_URLS.aeatNonResidents})`), `${locale}: no link to the AEAT`);
  }
  assert.match(GROSSA_URLS.irpf, /^https:\/\/www\.boe\.es\/buscar\/act\.php\?id=BOE-A-2006-20764/);
});

test("the FAQ asks in the searched words and answers in plain text", () => {
  const questions: Record<Locale, string[]> = {
    ca: ["Quan és el sorteig de La Grossa de Cap d'Any 2026?", "Quins són els números premiats de La Grossa de Cap d'Any 2026?", "Com sé si m'ha tocat La Grossa?", "On es cobren els premis de La Grossa de Cap d'Any?"],
    es: ["¿Cuándo es el sorteo de La Grossa de Cap d'Any 2026?", "La Grossa de Cap d'Any 2026: ¿cuáles son los números premiados?", "¿Cómo sé si me ha tocado La Grossa?", "¿Dónde se cobran los premios de La Grossa de Cap d'Any?"],
    en: ["When is the La Grossa de Cap d'Any 2026 draw?", "What are the La Grossa de Cap d'Any 2026 winning numbers?", "How do I check my La Grossa ticket?", "Can tourists play La Grossa?"],
  };
  for (const locale of LOCALES) {
    for (const blocks of [GROSSA.editions[locale].blocks, buildGrossaBody(locale, FAKE)]) {
      const block = blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] } | undefined;
      assert.ok(block, locale);
      const asked = block.items.map((item) => item.question);
      for (const question of questions[locale]) assert.ok(asked.includes(question), `${locale}: missing "${question}"`);
      for (const item of block.items) assert.doesNotMatch(item.answer, /\*\*|\]\(/, `${locale}: markdown in "${item.question}"`);
    }
  }
});

test("every weekday printed next to a date matches that date", () => {
  const weekdays: Record<Locale, string[]> = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    en: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  };
  const months: Record<Locale, string[]> = {
    ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
    es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    en: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
  };
  let checked = 0;
  for (const locale of LOCALES) {
    const all = body(locale).toLowerCase();
    const pattern = new RegExp(`(${weekdays[locale].join("|")}),? (\\d{1,2}) (?:d'|de )?(${months[locale].join("|")})`, "gu");
    for (const match of all.matchAll(pattern)) {
      const month = months[locale].indexOf(match[3]!) + 1;
      const iso = `${month === 1 ? 2027 : 2026}-${String(month).padStart(2, "0")}-${match[2]!.padStart(2, "0")}`;
      assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${locale}: "${match[0]}"`);
      checked += 1;
    }
  }
  assert.ok(checked >= 6, `only ${checked} weekday mentions checked`);
});

/* -------------------------------------------------------------------------- */
/* What must never be printed                                                 */
/* -------------------------------------------------------------------------- */

test("no 2026 draw time while none is announced: every clock time is 2024's, 2025's or the 11:00 sales close", () => {
  if (DRAW_TIME_2026) return;
  for (const locale of LOCALES) {
    for (const piece of sentences(body(locale))) {
      for (const match of piece.matchAll(/\b(\d{1,2}):(\d{2})\b/g)) {
        const time = match[0];
        if (["9:00", "14:00"].includes(time)) continue; // the prize office's opening hours
        if (time === "11:00") continue; // the close of sales, sourced to 2024 and the 2026 sales system
        assert.match(piece, /2024|2025/, `${locale}: ${time} without its year in "${piece}"`);
      }
    }
    // The sales API's "drawing" field (12:00) is not the draw time.
    assert.doesNotMatch(body(locale), /12:00|12\.00 h|a les 12 |a las 12 |at noon/i, locale);
  }
});

test("press-only and computed claims are never printed", () => {
  for (const locale of LOCALES) {
    for (const plain of [body(locale), text(buildGrossaBody(locale, FAKE, FAKE_TIME))]) {
      // The 2026 deadline is the rule (90 days), never a computed date.
      assert.doesNotMatch(plain, /30 (de març|de marzo|March) (de )?2027/i, locale);
      // No presenters for 2026, no La Dooble 2026, no prize odds invented.
      assert.doesNotMatch(plain, /Dooble/i, locale);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* The results slot                                                           */
/* -------------------------------------------------------------------------- */

test("the results slot is empty or publishable, and resultsProblems refuses bad input", () => {
  if (RESULTS_2026) assert.deepEqual(resultsProblems(RESULTS_2026), [], "RESULTS_2026 cannot be published as it is");
  assert.deepEqual(resultsProblems(FAKE), []);
  assert.deepEqual(inDrawOrder(FAKE), ["00000", "47716", "25058", "08802", "63145", "51230", "00417", "99999"]);
  const bad = (patch: Partial<GrossaResults>) => resultsProblems({ ...FAKE, ...patch });
  assert.ok(bad({ first: "1379" }).some((p) => /five digits/.test(p)), "four digits");
  assert.ok(bad({ first: "013790" }).some((p) => /five digits/.test(p)), "six digits");
  assert.ok(bad({ second: "51230" }).some((p) => /twice/.test(p)), "a repeat");
  assert.ok(bad({ ...RESULTS_2025, fourth: [...RESULTS_2025.fourth], fifth: [...RESULTS_2025.fifth] }).some((p) => /2025/.test(p)), "last year's numbers");
  assert.ok(bad({ first: RESULTS_2025.first }).some((p) => /2025/.test(p)), "last year's first prize");
  assert.ok(bad({ source: { name: "x", url: "https://www.example.com/grossa", publisher: "x" } }).some((p) => /not an official source/.test(p)));
  assert.ok(bad({ source: { name: "x", url: "http://www.loteriesdecatalunya.cat/resultats/grossa/", publisher: "x" } }).some((p) => /https/.test(p)));
  assert.ok(bad({ firstSoldIn: " " }).some((p) => /firstSoldIn/.test(p)));
});

test("neighbours wrap around 99999 and 00000", () => {
  assert.deepEqual(neighbours("01379"), ["01378", "01380"]);
  assert.deepEqual(neighbours("99999"), ["99998", "00000"]);
  assert.deepEqual(neighbours("00000"), ["99999", "00001"]);
});

test("filling the slot switches the lead, the key facts, the results table, the FAQ and the sources", () => {
  const filled = buildGrossaArticle(FAKE, null, "2026-12-31");
  const leadWords: Record<Locale, RegExp> = {
    ca: /^El 99999 és La Grossa de Cap d'Any 2026, el primer premi: 200\.000 € per bitllet de 10 €/,
    es: /^El 99999 es La Grossa de Cap d'Any 2026, el primer premio: 200\.000 € por billete de 10 €/,
    en: /^99999 is La Grossa de Cap d'Any 2026, the first prize: €200,000 per €10 ticket/,
  };
  for (const locale of LOCALES) {
    const blocks = filled.editions[locale].blocks;
    assert.ok(bodySchema.safeParse(blocks).success, locale);
    const leadText = text(blocks.slice(0, 1));
    assert.match(leadText, leadWords[locale], locale);
    for (const number of inDrawOrder(FAKE)) assert.ok(leadText.includes(number), `${locale}: ${number} not in the lead`);
    assert.doesNotMatch(leadText, /encara no|aún no|not been announced/, locale);
    // Key facts open with the first prize and where it was sold.
    const facts = blocks[1] as { items: { label: string; value: string }[] };
    assert.match(facts.items[0]?.value ?? "", /^99999/, locale);
    assert.ok(facts.items.some((item) => item.value === "Tremp"), `${locale}: firstSoldIn missing`);
    // The results table: eight rows in prize order, with neighbours and endings.
    const tables = blocks.filter((b) => b.type === "table") as { rows: string[][] }[];
    const results = tables.find((t) => t.rows.length === 8);
    assert.ok(results, `${locale}: no results table`);
    assert.deepEqual(results.rows.map((row) => row[1]), ["99999", "00417", "51230", "08802", "63145", "00000", "47716", "25058"].map((n) => `**${n}**`));
    assert.equal(results.rows[0]?.[2], eur(200_000, locale));
    assert.match(results.rows[0]?.[3] ?? "", /99998 (i|y|and) 00000/, locale);
    assert.match(results.rows[0]?.[4] ?? "", /9999: (1\.000 €|€1,000).*999: (250 €|€250).*99: (35 €|€35).*9: (10 €|€10)/, locale);
    assert.match(results.rows[5]?.[3] ?? "", /99999 (i|y|and) 00001/, locale);
    assert.equal(results.rows[7]?.[2], eur(5_000, locale));
    // The pending lines are gone; the 2025 reference with them.
    const plain = text(blocks);
    assert.doesNotMatch(plain, /aquí els hi posarem|aquí los pondremos|we will add them here/, locale);
    assert.doesNotMatch(plain, /01379/, locale);
    // After the draw nothing speaks of it as still to come.
    assert.doesNotMatch(plain, /encara no s'ha anunciat|aún no se ha anunciado|not been announced|Encara no anunciada|Aún no anunciada|Not announced yet/, locale);
    assert.match(plain, /El sorteig es va fer el dijous 31 de desembre de 2026|El sorteo se celebró el jueves 31 de diciembre de 2026|The draw took place on Thursday 31 December 2026/, locale);
    // The FAQ answers with the numbers.
    const faqBlock = blocks.find((b) => b.type === "faq") as { items: { answer: string }[] };
    assert.ok(faqBlock.items.some((item) => item.answer.includes("99999") && item.answer.includes("25058")), locale);
    // Titles and description switch too.
    assert.equal(filled.editions[locale].seoTitle, grossaSeoTitle(locale, FAKE));
    assert.equal(filled.editions[locale].seoDescription, grossaDescription(locale, FAKE));
  }
  assert.ok(filled.sources.some((s) => s.url === FAKE.source.url), "the results source joins the sources");
  assert.ok(grossaSources(FAKE, FAKE_TIME).some((s) => s.url === FAKE_TIME.source.url), "the time source joins the sources");
  assert.equal(filled.verifiedAt, "2026-12-31");
});

test("an announced draw time replaces the 'not announced' lines everywhere", () => {
  for (const locale of LOCALES) {
    const plain = text(buildGrossaBody(locale, null, FAKE_TIME));
    assert.doesNotMatch(plain, /encara no s'ha anunciat|aún no se ha anunciado|not been announced|Encara no anunciada|Aún no anunciada|Not announced yet/, locale);
    assert.match(text(buildGrossaBody(locale, null, FAKE_TIME).slice(0, 1)), /13:00/, locale);
  }
});

test("staleness: the page is stale only from 1 January 2027 while the slot is empty", () => {
  assert.equal(isStale("2026-12-30", null), false);
  assert.equal(isStale("2026-12-31", null), false);
  assert.equal(isStale("2027-01-01", null), true);
  assert.equal(isStale("2027-01-01", FAKE), false);
});

test("the results are in after the draw (fill RESULTS_2026, set GROSSA_AS_OF and republish ?only=grossa)", () => {
  const today = madridDate(new Date());
  assert.ok(GROSSA_AS_OF <= today, `GROSSA_AS_OF (${GROSSA_AS_OF}) is in the future`);
  assert.equal(
    isStale(today),
    false,
    `On ${today} La Grossa de Cap d'Any 2026 has been drawn but RESULTS_2026 is still null. Fill it in src/lib/content/batch02/grossa.ts from https://www.loteriesdecatalunya.cat/resultats/grossa/, set GROSSA_AS_OF, and publish ?only=grossa.`,
  );
  if (RESULTS_2026) {
    assert.ok(GROSSA_AS_OF >= GROSSA_DRAW_DATE, `RESULTS_2026 is filled but GROSSA_AS_OF (${GROSSA_AS_OF}) is before the draw: move it to the day you filled it`);
  }
});

test("the page is deterministic: no clock in the module, same output on every call", () => {
  const source = readFileSync(new URL("../src/lib/content/batch02/grossa.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(/, "the module reads the clock");
  for (const locale of LOCALES) {
    assert.equal(JSON.stringify(buildGrossaBody(locale)), json(locale), locale);
  }
});

/* -------------------------------------------------------------------------- */
/* The publish route                                                          */
/* -------------------------------------------------------------------------- */

test("the publish route has a grossa group", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ GROSSA \} from "@\/lib\/content\/batch02\/grossa";/);
  assert.match(route, /wants\("grossa"\)\) published\.push\(await publishB2Article\(GROSSA\)\)/);
  // The NYE page that links here goes out with its own group.
  assert.match(route, /wants\("nye"\)\) published\.push\(await publishB2Article\(NEW_YEAR\)\)/);
});
