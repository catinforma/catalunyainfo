import assert from "node:assert/strict";
import { test } from "node:test";

import { bodyToPlainText, bodySchema, type Block } from "../src/lib/content/blocks.ts";
import { dateYear } from "../src/lib/content/batch02/festive.ts";
import type { B2Article } from "../src/lib/content/batch02/shared.ts";
import { citableKeys, citableLabel, citableSources, sourcesCheckedLine, type CitableKey } from "../src/lib/content/batch02/strike-citable.ts";
import { STRIKE_19N_GUIDE, STRIKE_20N_GUIDE, STRIKE_DAYS_VERIFIED, buildStrikeDayBody, strikeDaysCheckedOn } from "../src/lib/content/batch02/strike-days-1920n.ts";
import { STRIKE_23N_GUIDE, STRIKE_26N_GUIDE, buildStrikeDay2326Body } from "../src/lib/content/batch02/strike-days-2326n.ts";
import { STRIKE_11N, STRIKE_11N_VERIFIED, STRIKE_11N_AS_OF, buildStrike11nBody } from "../src/lib/content/batch02/strike-11n.ts";
import { RAIL_17N_GUIDE, RAIL_17N_VERIFIED, buildRail17nBody } from "../src/lib/content/batch02/strike-rail-17n.ts";
import { STRIKE_EDUCATION_GUIDE, STRIKE_RENFE_GUIDE, buildStrikeGuideBody } from "../src/lib/content/batch02/strike-guides.ts";
import { STRIKES_GUIDE, STRIKES_VERIFIED, buildStrikesBody } from "../src/lib/content/batch02/strikes.ts";
import { STRIKES_SPAIN_GUIDE, buildStrikesSpainBody } from "../src/lib/content/batch02/strikes-spain.ts";
import { SPAIN_URLS, STRIKES_SPAIN_VERIFIED } from "../src/lib/content/batch02/strikes-spain-data.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { faqSchema } from "../src/lib/seo/jsonld.ts";

/**
 * Strike pages citable by AI assistants (25 Nov 2026, strike-citable.ts): every strike day page and guide
 * (11N, 17N, 19N, 20N, 23N, 26N, the education and Renfe guides, the Catalan and Spain hubs) carries
 *  1. a "Fonts revisades el <date>: <sources>" line right under the lead, whose date is the page's own VERIFIED
 *     constant and whose sources are named official publishers with links;
 *  2. exactly one FAQ whose FAQPage JSON-LD is the visible text, question by question, also once the day has passed;
 *  3. no present or future wording in the lead, the FAQ and that line once the day is over.
 */

interface Page {
  name: string;
  key: CitableKey;
  article: B2Article;
  /** The ISO day the page's sources were last re-read: the constant the article's `verifiedAt` carries. */
  verified: string;
}

const PAGES: Page[] = [
  { name: "11N", key: "strike11n", article: STRIKE_11N, verified: STRIKE_11N_VERIFIED },
  { name: "17N", key: "railStrike17n", article: RAIL_17N_GUIDE, verified: RAIL_17N_VERIFIED },
  { name: "19N", key: "strike19n", article: STRIKE_19N_GUIDE, verified: STRIKE_DAYS_VERIFIED },
  { name: "20N", key: "strike20n", article: STRIKE_20N_GUIDE, verified: STRIKE_DAYS_VERIFIED },
  { name: "23N", key: "strike23n", article: STRIKE_23N_GUIDE, verified: STRIKE_DAYS_VERIFIED },
  { name: "26N", key: "strike26n", article: STRIKE_26N_GUIDE, verified: STRIKE_DAYS_VERIFIED },
  { name: "education", key: "strikeEducation", article: STRIKE_EDUCATION_GUIDE, verified: STRIKES_VERIFIED },
  { name: "Renfe", key: "strikeRenfe", article: STRIKE_RENFE_GUIDE, verified: STRIKES_VERIFIED },
  { name: "Catalan hub", key: "strikes", article: STRIKES_GUIDE, verified: STRIKES_VERIFIED },
  { name: "Spain hub", key: "strikesSpain", article: STRIKES_SPAIN_GUIDE, verified: STRIKES_SPAIN_VERIFIED },
];

const LINE = /^\*\*((?:Fonts revisades (?:el|l')|Fuentes revisadas el|Sources checked on) [^:]+):\*\* (.+)\.$/;
const sourcesLineOf = (blocks: Block[]) =>
  blocks.slice(0, 3).find((b) => b.type === "paragraph" && LINE.test((b as { text: string }).text)) as { text: string } | undefined;
const faqBlocks = (blocks: Block[]) => blocks.filter((b) => b.type === "faq") as unknown as { items: { question: string; answer: string }[] }[];
const plain = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").trim();

test("every strike page prints its sources line right under the lead, with the page's own VERIFIED date", () => {
  for (const page of PAGES) {
    for (const locale of LOCALES) {
      const blocks = page.article.editions[locale].blocks;
      const line = sourcesLineOf(blocks);
      assert.ok(line, `${page.name}/${locale}: no sources line in the first three blocks`);
      const index = blocks.indexOf(line as unknown as Block);
      assert.equal(blocks[0]?.type, "paragraph", `${page.name}/${locale}: the lead is first`);
      assert.ok(index <= 2, `${page.name}/${locale}: line at ${index}`);
      const match = LINE.exec(line.text);
      assert.equal(match?.[1], citableLabel(locale, page.verified), `${page.name}/${locale}: the line prints the page's VERIFIED day`);
      assert.equal(page.article.verifiedAt, page.verified, `${page.name}: the article's verifiedAt is the same constant`);
      // Two or three named sources, each a link to an https page.
      const links = [...line.text.matchAll(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g)];
      assert.ok(links.length >= 2 && links.length <= 3, `${page.name}/${locale}: ${links.length} sources`);
      for (const link of links) assert.ok((link[1] ?? "").length > 12, `${page.name}/${locale}: source named ${link[1]}`);
      assert.deepEqual(
        links.map((l) => l[2]),
        citableSources(page.key).map((source) => source.url),
        `${page.name}/${locale}`,
      );
      assert.ok(bodySchema.safeParse(blocks).success, `${page.name}/${locale}`);
    }
  }
});

test("the line follows the VERIFIED constant: a later re-read moves it, an earlier as-of day caps it", () => {
  for (const locale of LOCALES) {
    for (const key of citableKeys()) {
      const moved = (sourcesCheckedLine(locale, "2026-12-03", key) as { text: string }).text;
      assert.ok(moved.startsWith(`**${citableLabel(locale, "2026-12-03")}:**`), `${key}/${locale}`);
      assert.ok(!moved.includes(dateYear(STRIKE_DAYS_VERIFIED, locale)), `${key}/${locale}: no hard-coded date`);
    }
    // A page built as of an earlier day never claims a later re-read (the day pages' own rule).
    const early = buildStrikeDayBody("strike19n", locale, "2026-11-18");
    assert.ok((sourcesLineOf(early) as { text: string }).text.startsWith(`**${citableLabel(locale, "2026-11-18")}:**`), locale);
    assert.equal(strikeDaysCheckedOn("2026-11-18"), "2026-11-18");
    assert.equal(strikeDaysCheckedOn("2026-12-30"), STRIKE_DAYS_VERIFIED);
  }
});

test("Catalan elides before 1 and 11, as the other dated lines do", () => {
  assert.equal(citableLabel("ca", "2026-11-11"), "Fonts revisades l'11 de novembre de 2026");
  assert.equal(citableLabel("ca", "2026-12-01"), "Fonts revisades l'1 de desembre de 2026");
  assert.equal(citableLabel("ca", "2026-11-25"), "Fonts revisades el 25 de novembre de 2026");
  assert.equal(citableLabel("es", "2026-11-11"), "Fuentes revisadas el 11 de noviembre de 2026");
  assert.equal(citableLabel("en", "2026-11-11"), "Sources checked on 11 November 2026");
});

test("the sources are official publishers' pages the article already cites, never the press", () => {
  const press = /(^|\.)(elpais|elmundo|abc|lavanguardia|elperiodico|eldiario|20minutos|europapress|rtve|ara|naciodigital|ccma|3cat)\.(es|com|cat)$/;
  for (const key of citableKeys()) {
    const page = PAGES.find((p) => p.key === key);
    assert.ok(page, key);
    for (const source of citableSources(key)) {
      assert.ok(!press.test(new URL(source.url).hostname), `${key}: ${source.url}`);
      const cited = LOCALES.some((locale) => JSON.stringify(page.article.editions[locale].blocks).includes(source.url)) || page.article.sources.some((s) => s.url === source.url);
      assert.ok(cited, `${key}: ${source.url} is not cited anywhere else on the page or in its sources`);
      for (const locale of LOCALES) assert.ok(source.name[locale].length > 12, `${key}/${locale}`);
    }
  }
  // The two literals kept here because strikes-spain-data.ts imports this module's importer.
  const find = (url: string) => citableKeys().flatMap((k) => citableSources(k)).find((s) => s.url === url);
  assert.ok(find(SPAIN_URLS.students), "Students' Union URL = SPAIN_URLS.students");
  assert.ok(find(SPAIN_URLS.renfe11n), "Renfe 11N URL = SPAIN_URLS.renfe11n");
});

/** Every page as it reads on the day after its day (the strike pages) and the as-of the published pages use. */
const BUILDS: { name: string; locale: Locale; blocks: Block[] }[] = LOCALES.flatMap((locale) => [
  { name: "19N after", locale, blocks: buildStrikeDayBody("strike19n", locale, "2026-11-20") },
  { name: "20N after", locale, blocks: buildStrikeDayBody("strike20n", locale, "2026-11-21") },
  { name: "20N later", locale, blocks: buildStrikeDayBody("strike20n", locale, "2026-12-05") },
  { name: "23N after", locale, blocks: buildStrikeDay2326Body("strike23n", locale, "2026-11-24") },
  { name: "26N after", locale, blocks: buildStrikeDay2326Body("strike26n", locale, "2026-11-27") },
  { name: "26N later", locale, blocks: buildStrikeDay2326Body("strike26n", locale, "2026-12-05") },
  { name: "17N after", locale, blocks: buildRail17nBody(locale, "2026-11-25") },
  { name: "11N after", locale, blocks: buildStrike11nBody(locale, STRIKE_11N_AS_OF) },
  { name: "education after", locale, blocks: buildStrikeGuideBody("strikeEducation", locale, "2026-11-27") },
]);

test("one FAQ per page, in every phase, and its FAQPage JSON-LD is the visible text question by question", () => {
  const all: { name: string; locale: Locale; blocks: Block[] }[] = [
    ...BUILDS,
    ...PAGES.flatMap((p) => LOCALES.map((locale) => ({ name: `${p.name} published`, locale, blocks: p.article.editions[locale].blocks }))),
    // The phases before the day: the FAQ the pages had always carried.
    ...LOCALES.flatMap((locale) => [
      { name: "19N before", locale, blocks: buildStrikeDayBody("strike19n", locale, "2026-11-17") },
      { name: "19N eve", locale, blocks: buildStrikeDayBody("strike19n", locale, "2026-11-18") },
      { name: "20N today", locale, blocks: buildStrikeDayBody("strike20n", locale, "2026-11-20") },
      { name: "23N eve", locale, blocks: buildStrikeDay2326Body("strike23n", locale, "2026-11-22") },
      { name: "26N today", locale, blocks: buildStrikeDay2326Body("strike26n", locale, "2026-11-26") },
      { name: "education before", locale, blocks: buildStrikeGuideBody("strikeEducation", locale, "2026-11-25") },
    ]),
  ];
  for (const { name, locale, blocks } of all) {
    const faqs = faqBlocks(blocks);
    assert.equal(faqs.length, 1, `${name}/${locale}: ${faqs.length} FAQ blocks`);
    const items = faqs[0]!.items;
    assert.ok(items.length >= 3 && items.length <= 11, `${name}/${locale}: ${items.length} questions`);
    const node = faqSchema(blocks) as { "@type": string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] } | null;
    assert.equal(node?.["@type"], "FAQPage", `${name}/${locale}`);
    assert.equal(node?.mainEntity.length, items.length, `${name}/${locale}`);
    items.forEach((item, i) => {
      assert.equal(node?.mainEntity[i]?.name, item.question, `${name}/${locale}/${i}`);
      assert.equal(node?.mainEntity[i]?.acceptedAnswer.text, plain(item.answer), `${name}/${locale}/${i}`);
      assert.ok(item.question.length > 10 && item.answer.length > 30, `${name}/${locale}/${i}`);
      assert.ok(!/undefined|\[object|\{checked\}|NaN/.test(item.question + item.answer), `${name}/${locale}/${i}`);
    });
    // The text a reader sees contains every question and answer, so the markup describes the page.
    const text = bodyToPlainText(blocks);
    for (const item of items) assert.ok(text.includes(item.question), `${name}/${locale}: ${item.question}`);
  }
});

const PRESENT: Record<Locale, RegExp> = {
  es: /¿Hay |\b(hoy|mañana|habrá|serán|será|ahora)\b|\bestá convocad[ao]\b|\bse convoca\b|\bconvoca\b/i,
  ca: /(^|[?.] )Hi ha |\b(avui|demà|haurà|seran|serà|ara)\b|\bestà convocad[ao]\b|\bes convoca\b|\bconvoca\b/i,
  en: /\bIs there\b|\b(today|tomorrow|will)\b|\bis called\b|\bare called\b/i,
};

/** The lead names who called the strike: a present-tense call verb there is about the strike itself (the FAQ's "called on staff to prepare" is a dated past event). */
const LEAD_CALL: Record<Locale, RegExp> = { es: /\bllama\b|\bconvoca\b/i, ca: /\bcrida\b|\bconvoca\b/i, en: /\bcalls\b/i };

const LEAD_IN_WINDOW = new Set(["17N after"]);

test("after the strike date the lead, the FAQ and the sources line read in the past tense, with no 'today', 'tomorrow' or future", () => {
  for (const { name, locale, blocks } of BUILDS) {
    // The standing questions about notice and pay are rules, not about the date.
    const faq = faqBlocks(blocks)[0]!.items.filter((item) => !/avisar|avisar|notice|cobr|descuent|docked|pay/i.test(item.question));
    const first = bodyToPlainText([blocks[0]!]);
    // The 17N lead is inside its 28-day measurement window (title and lead switched on 24 Nov, docs/SEO_EXPERIMENTS.md) and still says
    // "SEMAF llama / calls / crida" (present) about a strike that is over; the one-word tense fix is queued for the head to allow.
    // The exception must go the day the lead is fixed: the test then fails on the next line.
    const known = LEAD_IN_WINDOW.has(name);
    if (known) {
      assert.ok(LEAD_CALL[locale].test(first), `${name}/${locale}: the lead is fixed, remove it from LEAD_IN_WINDOW`);
    }
    if (!known) assert.ok(!LEAD_CALL[locale].test(first), `${name}/${locale}: ${first.slice(0, 160)}`);
    const checks = [...(known ? [] : [first]), ...faq.map((item) => `${item.question} ${plain(item.answer)}`)];
    for (const text of checks) {
      const found = PRESENT[locale].exec(text);
      // The education guide's and the rail page's lead say who is called out in a clause of the call itself; the fixed words are the point.
      assert.ok(!found, `${name}/${locale}: "${found?.[0]}" in: ${text.slice(0, 160)}`);
    }
    const question = faq[0]?.question ?? "";
    assert.match(question, locale === "es" ? /^¿(Hubo|Qué|Cuándo)/ : locale === "ca" ? /^(Hi va haver|Va haver|Quan|Què|Quins)/ : /^(Was|Were|What|When)/, `${name}/${locale}: ${question}`);
  }
});

test("the day pages' FAQ keeps its present-tense questions before the day, and past once the day is over (the 23rd and the 26th included)", () => {
  const first = (blocks: Block[]) => faqBlocks(blocks)[0]!.items[0]!.question;
  assert.equal(first(buildStrikeDay2326Body("strike26n", "es", "2026-11-26")), "¿Hay huelga hoy, jueves 26 de noviembre de 2026?");
  assert.equal(first(buildStrikeDay2326Body("strike26n", "es", "2026-11-27")), "¿Hubo huelga el jueves 26 de noviembre de 2026?");
  assert.equal(first(buildStrikeDayBody("strike20n", "es", "2026-11-19")), "¿Hay huelga mañana, viernes 20 de noviembre de 2026?");
  assert.equal(first(buildStrikeDayBody("strike20n", "es", "2026-11-21")), "¿Hubo huelga el viernes 20 de noviembre de 2026?");
  assert.equal(first(buildStrikeDayBody("strike20n", "ca", "2026-11-21")), "Hi va haver vaga el divendres 20 de novembre de 2026?");
  assert.equal(first(buildStrikeDayBody("strike19n", "en", "2026-11-20")), "Was there a strike in Spain on Thursday 19 November 2026?");
  // Hubs: standing pages; their FAQ is not about one day and is not re-tensed here.
  for (const locale of LOCALES) {
    assert.equal(faqBlocks(buildStrikesBody(locale)).length, 1);
    assert.equal(faqBlocks(buildStrikesSpainBody(locale)).length, 1);
  }
});

test("the places in the 19N marches and 20N demonstrations answers are the body's table rows", () => {
  const es19 = faqBlocks(buildStrikeDayBody("strike19n", "es", "2026-11-25"))[0]!.items.find((i) => i.question.startsWith("¿Dónde fueron"))!.answer;
  const rows = buildStrikeDayBody("strike19n", "es", "2026-11-25").find((b) => b.type === "table") as unknown as { rows: string[][] };
  assert.ok(es19.includes(`En ${rows.rows.length} ciudades`), es19);
  for (const city of ["Madrid", "Barcelona", "Sevilla"]) {
    const row = rows.rows.find((r) => r[0] === city)!;
    assert.ok(es19.includes(row[1]!) && es19.includes(row[2]!), `${city}: ${es19}`);
  }
  const es20 = faqBlocks(buildStrikeDayBody("strike20n", "es", "2026-11-25"))[0]!.items.find((i) => i.question.startsWith("¿Dónde fueron"))!.answer;
  const demos = buildStrikeDayBody("strike20n", "es", "2026-11-25").find((b) => b.type === "table") as unknown as { rows: string[][] };
  assert.ok(es20.includes(`en ${demos.rows.length} ciudades`), es20);
  for (const city of ["Madrid", "Barcelona", "Sevilla", "València", "Bilbao"]) assert.ok(es20.includes(demos.rows.find((r) => r[0] === city)![1]!), `${city}: ${es20}`);
});
