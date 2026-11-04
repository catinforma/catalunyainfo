import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { MARKETS } from "../src/lib/content/batch02/family-markets.ts";
import {
  CHAINS,
  GRAN_RECAPTE,
  GRAN_RECAPTE_AS_OF,
  GRAN_RECAPTE_GUIDE,
  GRAN_RECAPTE_META,
  GRAN_RECAPTE_REFRESH_BY,
  GR_HERO,
  MARKETS_BCN,
  MONEY_ONLY,
  daysText,
  granRecapteMention,
} from "../src/lib/content/batch02/gran-recapte.ts";
import { MARATO_GUIDE } from "../src/lib/content/batch02/marato.ts";
import { B2_PATHS, B2_TITLES, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { madridDate } from "../src/lib/content/batch02/strikes.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

/**
 * Gran Recapte d'Aliments 2026 (4 Nov 2026): one page per language, every
 * fact from the organisers' own sites (granrecapte.org, acatbal.org and the
 * four food banks), read that day.
 *
 * What it must never do: print a fact from the press, a volunteer deadline or
 * collection hours nobody published, the figures the organisers disagree on
 * (the volunteer target, the 2025 tonnage), a bank account number, a weekday
 * that does not match its date, or keep saying "this year" with last year's
 * numbers after the campaign without being re-read.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const body = (locale: Locale) => text(GRAN_RECAPTE_GUIDE.editions[locale].blocks);
const json = (locale: Locale) => JSON.stringify(GRAN_RECAPTE_GUIDE.editions[locale].blocks);
const sentences = (value: string) => value.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÚÇ¿«"(*])/u);
const ROOT = new URL("..", import.meta.url);
const plain = (value: string) => value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
/**
 * The page cut into the units a reader takes in one go: each paragraph, list
 * item, key fact (label and value), callout, and FAQ question with its answer.
 */
function units(locale: Locale): string[] {
  const out: string[] = [];
  for (const block of GRAN_RECAPTE_GUIDE.editions[locale].blocks as unknown as Record<string, unknown>[]) {
    if (block.type === "paragraph" || block.type === "callout") out.push(plain(String(block.text)));
    if (block.type === "list") out.push(...(block.items as string[]).map(plain));
    if (block.type === "keyFacts") out.push(...(block.items as { label: string; value: string }[]).map((i) => plain(`${i.label}: ${i.value}`)));
    if (block.type === "faq") out.push(...(block.items as { question: string; answer: string }[]).map((i) => plain(`${i.question} ${i.answer}`)));
  }
  return out;
}

const ALL_PATHS = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS)];
const PUBLISHED = new Set(ALL_PATHS.flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)));

/** The organisers: the campaign site, the Catalan association, the four food banks. */
const OFFICIAL_HOSTS = [
  "www.granrecapte.org",
  "voluntariat.granrecapte.org",
  "acatbal.org",
  "www.bancdelsaliments.org",
  "bancdelsalimentsgirona.org",
  "www.bancalimentslleida.cat",
  "www.bancalimentstarragona.org",
];

/* -------------------------------------------------------------------------- */
/* Structure, paths, SEO                                                      */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on year-free registry paths", () => {
  const expected: Record<Locale, string> = { ca: "guies/gran-recapte-aliments", es: "guias/gran-recapte-alimentos", en: "guides/gran-recapte-food-drive-catalonia" };
  for (const locale of LOCALES) {
    const edition = GRAN_RECAPTE_GUIDE.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(edition.blocks)) > 1200, `${locale} is thin`);
    assert.equal(edition.path, expected[locale]);
    assert.equal(edition.path, B2_PATHS.granRecapte[locale]);
    assert.equal(edition.path, GRAN_RECAPTE_META[locale].path);
    assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
  }
  assert.equal(GRAN_RECAPTE_GUIDE.key, "granRecapte");
  assert.ok(B2_TITLES.granRecapte, "a related-rail title");
  for (const locale of LOCALES) assert.match(B2_TITLES.granRecapte[locale], /^Gran Recapte 2026/);
});

test("the new paths collide with no registry path, no route folder and no legacy redirect", () => {
  for (const locale of LOCALES) {
    const path = B2_PATHS.granRecapte[locale];
    assert.equal(ALL_PATHS.filter((paths) => paths[locale] === path).length, 1, `${locale}: ${path}`);
  }
  const app = join(ROOT.pathname.replace(/^\/([A-Za-z]:)/, "$1"), "src/app/(public)/[locale]");
  const folders = readdirSync(app).filter((name) => statSync(join(app, name)).isDirectory());
  for (const segment of ["guies", "guias", "guides"]) assert.ok(!folders.includes(segment), `a route folder shadows ${segment}/`);
  const redirects = readFileSync(new URL("../migration/redirects.csv", import.meta.url), "utf8");
  for (const locale of LOCALES) assert.ok(!redirects.includes(B2_PATHS.granRecapte[locale]), locale);
});

test("titles fit in 60 characters and descriptions in 155, the year and both days first, the answer in the snippet", () => {
  const words: Record<Locale, RegExp> = {
    ca: /^Gran Recapte 2026: 13 i 14 de novembre, com fer-te voluntari$/,
    es: /^Gran Recapte 2026: 13 y 14 de noviembre, cómo ser voluntario$/,
    en: /^Gran Recapte 2026: 13–14 November food drive, how to help$/,
  };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, title, excerpt } = GRAN_RECAPTE_GUIDE.editions[locale];
    assert.ok(seoTitle.length > 20 && seoTitle.length <= 60, `${locale} title ${seoTitle.length}: ${seoTitle}`);
    assert.ok(seoDescription.length > 80 && seoDescription.length <= 155, `${locale} description ${seoDescription.length}: ${seoDescription}`);
    assert.match(seoTitle, words[locale]);
    // The days with their weekdays, as the dates make them, and how to give.
    assert.ok(seoDescription.includes(daysText(locale, { article: locale !== "en" })), `${locale}: the days in the description`);
    assert.match(seoDescription, /Bizum/);
    assert.match(seoDescription, locale === "en" ? /volunteer/ : /voluntari/);
    assert.ok(title.length > seoTitle.length, `${locale}: the H1 says more than the title`);
    assert.match(title, /2026/);
    assert.ok(excerpt.length > 30 && excerpt.length <= 200, `${locale} excerpt ${excerpt.length}`);
  }
});

/* -------------------------------------------------------------------------- */
/* Dates                                                                      */
/* -------------------------------------------------------------------------- */

test("the Gran Recapte 2026 is Friday 13 and Saturday 14 November, and the lead says so first", () => {
  assert.deepEqual([...GRAN_RECAPTE.days], ["2026-11-13", "2026-11-14"]);
  assert.equal(weekdayIndex(GRAN_RECAPTE.days[0]), 5, "the 13th is a Friday");
  assert.equal(weekdayIndex(GRAN_RECAPTE.days[1]), 6, "the 14th is a Saturday");
  assert.equal(daysText("ca"), "divendres 13 i dissabte 14 de novembre");
  assert.equal(daysText("es", { article: true }), "el viernes 13 y el sábado 14 de noviembre");
  assert.equal(daysText("en", { year: true }), "Friday 13 and Saturday 14 November 2026");
  assert.equal(GRAN_RECAPTE.edition, 18);
  for (const locale of LOCALES) {
    const lead = text(GRAN_RECAPTE_GUIDE.editions[locale].blocks.slice(0, 1));
    assert.ok(lead.slice(0, 90).includes(daysText(locale, { article: locale !== "en" })), `${locale}: ${lead.slice(0, 120)}`);
    assert.ok(lead.includes(GRAN_RECAPTE.bizum), `${locale}: the Bizum code in the lead`);
  }
});

test("every weekday printed next to a day of the month matches the date", () => {
  const weekdays: Record<Locale, string[]> = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  };
  for (const locale of LOCALES) {
    const all = [body(locale), granRecapteMention(locale, "marato"), granRecapteMention(locale, "markets")].join(" ");
    const pattern = new RegExp(`\\b(${weekdays[locale].join("|")}) (\\d{1,2})\\b`, "gi");
    let seen = 0;
    for (const m of all.matchAll(pattern)) {
      const day = Number(m[2]);
      const iso = `2026-11-${String(day).padStart(2, "0")}`;
      const index = weekdays[locale].findIndex((w) => w.toLowerCase() === m[1]!.toLowerCase());
      assert.equal(weekdayIndex(iso), index, `${locale}: "${m[0]}"`);
      seen++;
    }
    assert.ok(seen >= 6, `${locale}: only ${seen} weekday-day pairs`);
  }
});

/* -------------------------------------------------------------------------- */
/* Sources and what is never printed                                          */
/* -------------------------------------------------------------------------- */

test("sources are the organisers' own pages, https and untracked, and the reader sees the check date", () => {
  assert.ok(GRAN_RECAPTE_GUIDE.sources.length >= 15);
  for (const source of GRAN_RECAPTE_GUIDE.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/[?&]utm_/.test(source.url), source.url);
    assert.ok(!/aerobusbcn/i.test(source.url), source.url);
    assert.ok(OFFICIAL_HOSTS.includes(new URL(source.url).host), `${source.url} is not an organiser's site`);
  }
  assert.equal(new Set(GRAN_RECAPTE_GUIDE.sources.map((s) => s.url)).size, GRAN_RECAPTE_GUIDE.sources.length, "a source is listed twice");
  assert.equal(GRAN_RECAPTE_GUIDE.verifiedAt, GRAN_RECAPTE_AS_OF);
  const checked: Record<Locale, RegExp> = { ca: /4 de novembre de 2026/, es: /4 de noviembre de 2026/, en: /4 November 2026/ };
  for (const locale of LOCALES) assert.match(body(locale), checked[locale], locale);
});

test("every external link in the body goes to an organiser, and none is tracked", () => {
  for (const locale of LOCALES) {
    const links = [...json(locale).matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]!);
    assert.ok(links.length >= 10, `${locale}: only ${links.length} official links`);
    for (const href of links) {
      assert.match(href, /^https:\/\//, href);
      assert.ok(OFFICIAL_HOSTS.includes(new URL(href).host), `${locale}: ${href}`);
      assert.ok(!/[?&]utm_|aerobusbcn/i.test(href), href);
    }
  }
});

test("internal links stay in their language, end in a slash and point at a published path", () => {
  for (const locale of LOCALES) {
    for (const match of json(locale).matchAll(/\]\((\/[^)]*)\)/g)) {
      const href = match[1] ?? "";
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
    }
  }
});

test("donations only through what the organisers publish: the Bizum code and phone, no copied account number", () => {
  for (const locale of LOCALES) {
    const b = body(locale);
    assert.ok(b.includes(GRAN_RECAPTE.bizum), `${locale}: Bizum code`);
    assert.ok(b.includes(GRAN_RECAPTE.phone), `${locale}: the donation line`);
    assert.doesNotMatch(b, /\bES\d{2}[\s\d]{10,}/, `${locale}: an account number is printed`);
    // The only phone number is the organisers' donation line.
    for (const m of b.matchAll(/\b[6789]\d{2} \d{3} \d{3}\b/g)) assert.equal(m[0], GRAN_RECAPTE.phone, `${locale}: ${m[0]}`);
    // Girona's own code is attributed to Girona.
    for (const s of sentences(b).filter((x) => x.includes(GRAN_RECAPTE.bizumGirona))) assert.match(s, /Girona/, `${locale}: "${s}"`);
  }
});

test("no figure the organisers disagree on, no invented deadline or hours, last year's numbers labelled as 2025", () => {
  for (const locale of LOCALES) {
    const b = body(locale);
    // Volunteer target (15,000 vs 17,000) and 2025 tonnage (1,556 t vs 1,341,766 kg).
    assert.doesNotMatch(b, /\b1[57][.,]000\b|\b1[.,]556\b|\b1[.,]34[12]\b|tones|toneladas|tonnes/i, locale);
    // No clock times: the organisers publish no collection hours.
    assert.doesNotMatch(b, /\b(?:[01]?\d|2[0-3])[:.][0-5]\d\b|\b\d{1,2} ?h\b/, `${locale}: a clock time`);
    // Every unit with 2025 is about last year's results or the 2020-2025 price rise,
    // and last year's total always says it is 2025's.
    for (const unit of units(locale).filter((x) => /2025/.test(x))) {
      assert.match(unit, /5[,.]2|17[.,]500|32 ?%|2020/, `${locale}: "${unit}"`);
    }
    for (const unit of units(locale).filter((x) => /5[,.]2/.test(x))) {
      assert.match(unit, /2025/, `${locale}: "${unit}" must say the figure is 2025's`);
    }
    // The deadline question is answered with "not published".
    assert.match(b, locale === "ca" ? /no ha publicat cap data límit/ : locale === "es" ? /no ha publicado ninguna fecha límite/ : /have not published a closing date/, locale);
  }
});

test("shops: the chains are the organisers' logos, and Mercadona, El Corte Inglés and Consum take money only", () => {
  assert.ok(CHAINS.length > 30, "the FAQ says more than thirty chains");
  assert.equal(new Set(CHAINS).size, CHAINS.length);
  for (const name of MONEY_ONLY) assert.ok(!(CHAINS as readonly string[]).includes(name), `${name} is money-only, not a food collection chain`);
  for (const locale of LOCALES) {
    const b = body(locale);
    for (const name of CHAINS) assert.ok(b.includes(name), `${locale}: ${name}`);
    for (const unit of units(locale).filter((x) => /Mercadona/.test(x))) {
      assert.match(unit, /caixa|caja|till/i, `${locale}: "${unit}" must say money at the till`);
    }
    for (const market of MARKETS_BCN[locale]) assert.ok(b.includes(market), `${locale}: market ${market}`);
    assert.ok(json(locale).includes("supermercats-Gran-Recapte-donacions.pdf"), `${locale}: the shop list by town`);
  }
});

/* -------------------------------------------------------------------------- */
/* Links in, photo, read-next, publish group                                  */
/* -------------------------------------------------------------------------- */

test("La Marató and the markets guide link here once each, in the body, with titles and descriptions untouched", () => {
  for (const locale of LOCALES) {
    const target = `](/${locale}/${B2_PATHS.granRecapte[locale]}/)`;
    for (const article of [MARATO_GUIDE, MARKETS]) {
      const edition = article.editions[locale];
      const blocks = JSON.stringify(edition.blocks);
      assert.equal(blocks.split(target).length - 1, 1, `${article.key}/${locale}: exactly one link`);
      for (const field of [edition.title, edition.seoTitle, edition.seoDescription, edition.excerpt]) {
        assert.doesNotMatch(field, /Gran Recapte/, `${article.key}/${locale}: meta changed`);
      }
    }
    assert.ok(text(MARATO_GUIDE.editions[locale].blocks).includes(text([{ type: "paragraph", text: granRecapteMention(locale, "marato") } as Block])), `marato/${locale}`);
    // This page links back to La Marató.
    assert.ok(json(locale).includes(`](/${locale}/${B2_PATHS.marato[locale]}/)`), `${locale}: link to La Marató`);
  }
});

test("no new photograph: the hero is the markets guide's file with its exact alt and caption", () => {
  assert.equal(GRAN_RECAPTE_GUIDE.heroKey, MARKETS.heroKey);
  assert.equal(GR_HERO.key, MARKETS.heroKey);
  assert.ok(IMAGE_BY_KEY.has(GR_HERO.key), "hero in the manifest");
  assert.match(IMAGE_BY_KEY.get(GR_HERO.key)?.license ?? "", /^(CC0|CC BY( |-SA |-SA$|$)|PD|GFDL|Public domain)/i);
  assert.deepEqual(GRAN_RECAPTE_GUIDE.heroAlt, MARKETS.heroAlt);
  assert.deepEqual(GRAN_RECAPTE_GUIDE.heroCaption, MARKETS.heroCaption);
  assert.equal(GRAN_RECAPTE_GUIDE.secondaryKey, undefined);
  for (const locale of LOCALES) {
    assert.ok(!GRAN_RECAPTE_GUIDE.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"), locale);
  }
});

test("the read-next box only repeats links from the related rail", () => {
  for (const locale of LOCALES) {
    const before = GRAN_RECAPTE_GUIDE.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) {
      assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
    }
  }
});

test("the publish route registers `gran-recapte` and `gran-recapte-links`", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("gran-recapte"\)\) published\.push\(await publishB2Article\(GRAN_RECAPTE_GUIDE\)\)/);
  assert.match(route, /wants\("gran-recapte-links"\)\) published\.push\(await publishB2Article\(MARATO_GUIDE\), await publishB2Article\(MARKETS\)\)/);
});

/* -------------------------------------------------------------------------- */
/* Freshness                                                                  */
/* -------------------------------------------------------------------------- */

test("re-read after the campaign: from GRAN_RECAPTE_REFRESH_BY the page must have been checked after 14 November", () => {
  const today = madridDate(new Date());
  const lastDay = GRAN_RECAPTE.days[1];
  assert.ok(GRAN_RECAPTE_REFRESH_BY > lastDay);
  if (today >= GRAN_RECAPTE_REFRESH_BY) {
    assert.ok(
      GRAN_RECAPTE_AS_OF > lastDay,
      `GRAN_RECAPTE_AS_OF is ${GRAN_RECAPTE_AS_OF}: re-read granrecapte.org (transparència) for the 2026 results, update gran-recapte.ts, move GRAN_RECAPTE_AS_OF and publish \`gran-recapte\``,
    );
  }
});
