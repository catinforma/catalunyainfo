import assert from "node:assert/strict";
import { test } from "node:test";

import { CHRISTMAS, FAMILY, SANTA_LLUCIA_2026 } from "../src/lib/content/batch02/christmas.ts";
import { ANNOUNCED_TRADITIONS, seasonSpanProblems } from "../src/lib/content/batch02/christmas-traditions.ts";
import { range } from "../src/lib/content/batch02/festive.ts";
import { LOCAL_MONDAY_7 } from "../src/lib/content/batch02/december-bridge.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { FAIRS, familyLastChecked, townBySlug, towns } from "../src/lib/programmatic/christmas-fairs/data.ts";
import { fairsHubPath } from "../src/lib/programmatic/christmas-fairs/paths.ts";
import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { holidayOn } from "../src/lib/content/holidays/calendar.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

/**
 * The Christmas markets guide must never print last year's dates as this
 * year's. Third-party sites already list "28 November - 23 December 2026" for
 * Santa Llúcia with no organiser source; those are the 2025 dates. When an
 * organiser publishes its 2026 dates, add them and update these guards.
 */

test("the Christmas markets guide has its photographs", () => {
  assert.ok(CHRISTMAS.heroKey && IMAGE_BY_KEY.has(CHRISTMAS.heroKey));
  assert.ok(CHRISTMAS.secondaryKey && IMAGE_BY_KEY.has(CHRISTMAS.secondaryKey));
  assert.notEqual(CHRISTMAS.heroKey, CHRISTMAS.secondaryKey);
});

test("no 2025 market dates are reprinted as this year's", () => {
  const stale = [
    /28 de novembre al 23 de desembre/i,
    /28 de noviembre al 23 de diciembre/i,
    /28 November to 23 December/i,
    /22 de novembre/i,
    /22 de noviembre/i,
    /22 November/i,
  ];
  // The 2025 opening hours (10:00-21:00, "Calendari - 2025"). From 3 Nov 2026
  // the cultural agenda gives the same hours for 2026; they may then appear
  // only in a sentence that carries the 2026 dates, never on their own.
  const hours2025 = /10[:.]00\s*(a|to|-|–)\s*21[:.]00/;
  const sentences = (value: string) => value.split(/(?<=[.!?])\s+/u);
  for (const locale of LOCALES) {
    const text = bodyToPlainText(CHRISTMAS.editions[locale].blocks);
    for (const pattern of stale) assert.ok(!pattern.test(text), `${locale}: ${pattern} looks like a 2025 date`);
    const withHours = sentences(text).filter((s) => hours2025.test(s));
    if (!SANTA_LLUCIA_2026.hours) assert.equal(withHours.length, 0, `${locale}: ${withHours[0]}`);
    for (const s of withHours) assert.ok(s.includes(range(SANTA_LLUCIA_2026.from, SANTA_LLUCIA_2026.to, locale)) || /\b2026\b/.test(s), `${locale}: hours without the 2026 dates: "${s}"`);
  }
});

/**
 * 3 Nov 2026: the Generalitat's Agenda Cultural de Catalunya published the
 * 2026 fair (27 Nov - 23 Dec, 10-21 h); the organiser's site still showed
 * 2025. Every edition gives those dates, credits the agenda (never "the
 * organisers"), lists the page among its sources, and is the same object the
 * traditions page and the December hub read.
 */
test("Santa Llúcia 2026: the agenda's dates and hours, credited to the agenda, the same object as ANNOUNCED_TRADITIONS", () => {
  assert.equal(ANNOUNCED_TRADITIONS.santaLlucia, SANTA_LLUCIA_2026);
  assert.deepEqual(seasonSpanProblems(SANTA_LLUCIA_2026), []);
  assert.equal(SANTA_LLUCIA_2026.from.slice(0, 4), "2026");
  assert.ok(CHRISTMAS.sources.some((s) => s.url === SANTA_LLUCIA_2026.url), "the agenda page is a source");
  const credit: Record<(typeof LOCALES)[number], RegExp> = { ca: /Agenda Cultural de la Generalitat/, es: /Agenda Cultural de la Generalitat/, en: /cultural agenda/ };
  for (const locale of LOCALES) {
    const edition = CHRISTMAS.editions[locale];
    const text = bodyToPlainText(edition.blocks);
    const when = range(SANTA_LLUCIA_2026.from, SANTA_LLUCIA_2026.to, locale);
    const leadBlock = edition.blocks.find((b) => b.type === "paragraph" && (b as { lead?: boolean }).lead) as { text: string };
    assert.ok(bodyToPlainText([leadBlock as never]).includes(when), `${locale}: the lead gives ${when}`);
    assert.match(leadBlock.text, credit[locale], `${locale}: the lead credits the agenda`);
    assert.ok(leadBlock.text.includes(`](${SANTA_LLUCIA_2026.url})`), `${locale}: the lead links the agenda page`);
    assert.doesNotMatch(text, /Santa Llúcia[^.]*(segons l'organització|según la organización|according to the organisers)/i, `${locale}: not credited to the organisers`);
    const rows = (edition.blocks as { type: string; rows?: string[][] }[]).filter((b) => b.type === "table").flatMap((b) => b.rows ?? []);
    const row = rows.find((r) => r[0] === "Fira de Santa Llúcia" && r[1] === "Barcelona");
    assert.ok(row, `${locale}: Santa Llúcia row`);
    assert.ok(row[3]!.toLowerCase().includes(when.toLowerCase()), `${locale}: ${row[3]}`);
    assert.match(row[3]!, credit[locale], locale);
    assert.doesNotMatch(row[3]!, /Pendent|Pendiente|Not yet published/, locale);
    // Last year's run is still told, with its year, phrased so it cannot read as a 2026 range.
    assert.match(text, /2025[^.]*28 (de )?(novembre|noviembre|November)/, `${locale}: the 2025 run with its year`);
    const faqBlock = edition.blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] };
    const when26 = faqBlock.items.find((i) => /Santa Llúcia 2026/.test(i.question))!;
    assert.ok(when26.answer.toLowerCase().includes(when.toLowerCase()), `${locale}: FAQ answer`);
    // The Sagrada Família fair is still said to be undated.
    assert.match(text, /Sagrada Família[^.]*(encara no|aún no|not (been )?(announced|published)|has not announced)/i, `${locale}: Sagrada Família pending`);
  }
});

test("the URL carries no year", () => {
  for (const locale of LOCALES) assert.ok(!/20\d\d/.test(CHRISTMAS.editions[locale].path));
});

test("the EN guide answers 'barcelona christmas market' first and every edition links the other Christmas pages", () => {
  const en = CHRISTMAS.editions.en;
  assert.ok(en.seoTitle.startsWith("Barcelona Christmas markets 2026"), en.seoTitle);
  assert.ok(en.seoTitle.length <= 60);
  // 30 Oct CTR sweep: the EN snippet states the answer, as the ca/es ones do.
  // 3 Nov 2026: the answer is now the 2026 dates (cultural agenda), title and snippet.
  assert.match(en.seoTitle, /Santa Llúcia from 27 Nov/);
  assert.match(en.seoDescription, /^Fira de Santa Llúcia 2026: 27 Nov–23 Dec, 10:00–21:00/);
  assert.ok(en.seoDescription.length <= 155);
  for (const locale of ["ca", "es"] as const) {
    const when = range(SANTA_LLUCIA_2026.from, SANTA_LLUCIA_2026.to, locale);
    assert.ok(CHRISTMAS.editions[locale].seoDescription.includes(when), `${locale}: the snippet gives ${when}`);
    assert.match(CHRISTMAS.editions[locale].seoTitle, /Santa Llúcia/, locale);
  }
  const blocks = en.blocks as { type: string; lead?: boolean; text?: string }[];
  const lead = blocks.find((b) => b.type === "paragraph" && b.lead)?.text ?? "";
  assert.match(lead, /Fira de Santa Llúcia/);
  assert.ok(lead.includes(range(SANTA_LLUCIA_2026.from, SANTA_LLUCIA_2026.to, "en")), lead);
  const pages = [
    /nadal-a-barcelona|navidad-en-barcelona|christmas-in-barcelona/,
    /tradicions-de-nadal|tradiciones-navidad|catalan-christmas-traditions/,
    /pessebres-vivents|belenes-vivientes|living-nativity/,
    /cap-d-any|nochevieja|new-years-eve/,
    // 3 Nov 2026 (cluster links): Barcelona in December and the Three Kings parade.
    /barcelona-al-desembre|barcelona-en-diciembre|barcelona-in-december/,
    /cavalcada-de-reis|cabalgata-de-reyes|three-kings-parade/,
  ];
  for (const locale of LOCALES) {
    const json = JSON.stringify(CHRISTMAS.editions[locale].blocks);
    for (const page of pages) assert.match(json, page, `${locale}: links ${page}`);
    assert.match(bodyToPlainText(CHRISTMAS.editions[locale].blocks), /Cubelles/, `${locale}: Cubelles 2026`);
  }
});

/**
 * Manresa, 30 Oct 2026: the council's page still shows 2025; the Generalitat
 * fairs calendar gives 12-13 Dec 2026. The guide gives those dates attributed
 * to the calendar, the same dates as the Christmas fairs family's Manresa page.
 */
test("Manresa: 12-13 Dec 2026, attributed to the Generalitat fairs calendar, as the fairs family shows it", () => {
  const fair = FAIRS.find((f) => f.id === "vm32:24032442");
  assert.ok(fair, "Manresa's Santa Llúcia is in the fairs family");
  assert.equal(fair.start, "2026-12-12");
  assert.equal(fair.end, "2026-12-13");
  assert.equal(fair.checked, null, "no organiser page gives other dates");
  assert.ok(townBySlug("manresa"), "Manresa has a fairs page");

  const expected = {
    ca: [/12 i 13 de desembre de 2026, segons el calendari de fires de la Generalitat/, /Segons el calendari de fires de la Generalitat, el 2026 es fa el 12 i el 13 de desembre/],
    es: [/12 y 13 de diciembre de 2026, según el calendario de ferias de la Generalitat/, /Según el calendario de ferias de la Generalitat, en 2026 se celebra el 12 y el 13 de diciembre/],
    en: [/12 and 13 December 2026, according to the Catalan government's fairs calendar/, /According to the Catalan government's fairs calendar, the 2026 fair is on 12 and 13 December/],
  } as const;
  for (const locale of LOCALES) {
    const text = bodyToPlainText(CHRISTMAS.editions[locale].blocks);
    for (const re of expected[locale]) assert.match(text, re, `${locale}: ${re}`);
    const rows = (CHRISTMAS.editions[locale].blocks as { type: string; rows?: string[][] }[]).filter((b) => b.type === "table").flatMap((b) => b.rows ?? []);
    const manresa = rows.find((r) => r[1] === "Manresa");
    assert.ok(manresa, `${locale}: Manresa row`);
    assert.doesNotMatch(manresa[3]!, /Pendent|Pendiente|Not yet published/, `${locale}: Manresa no longer pending`);
    assert.doesNotMatch(manresa[2]!, /2025/, `${locale}: the place is the 2026 one`);
  }
  assert.match(JSON.stringify(CHRISTMAS.editions.ca.blocks), /\/ca\/fires-de-nadal\/manresa\//);
  assert.match(JSON.stringify(CHRISTMAS.editions.es.blocks), /\/es\/mercados-navidad\/manresa\//);
  assert.ok(CHRISTMAS.sources.some((s) => s.url === "https://analisi.transparenciacatalunya.cat/d/vm32-przc"));
});

/**
 * Seasonal top-3 push, 30 Oct 2026: "fires de nadal catalunya 2026" asks for
 * the list. The ca/es snippet and lead open with how many fairs have an
 * official date, the same count the Christmas fairs hub shows, and link it.
 */
test("every edition's title fits in 60 characters and its description in 155", () => {
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, title } = CHRISTMAS.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} title ${seoTitle.length}: ${seoTitle}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${locale} description ${seoDescription.length}: ${seoDescription}`);
    assert.match(seoTitle, /2026/, locale);
    assert.match(title, /2026/, locale);
  }
  assert.match(CHRISTMAS.editions.ca.seoTitle, /^Fires i mercats de Nadal Catalunya 2026/);
});

test("the count of fairs with an official date is the hub's, and the ca/es snippet and lead open with it", () => {
  assert.equal(FAMILY.fairs, FAIRS.length);
  assert.equal(FAMILY.towns, towns().length);
  assert.equal(FAMILY.checked, familyLastChecked());
  assert.ok(FAMILY.fairs >= 30, `only ${FAMILY.fairs} fairs`);
  const open = (from: string, to: string) => FAIRS.filter((f) => f.start <= to && f.end >= from).length;
  assert.equal(FAMILY.bridge, open("2026-12-05", "2026-12-08"));
  assert.equal(FAMILY.maratoWeekend, open("2026-12-12", "2026-12-13"));
  const snippet = { ca: new RegExp(`^Fires de Nadal Catalunya 2026: ${FAMILY.fairs} amb data oficial`), es: new RegExp(`^Mercados navideños Cataluña 2026: ${FAMILY.fairs} con fecha oficial`) };
  const leadStart = { ca: `${FAMILY.fairs} fires i mercats de Nadal de Catalunya ja tenen data oficial per al 2026`, es: `${FAMILY.fairs} ferias y mercados de Navidad de Cataluña ya tienen fecha oficial para 2026` };
  for (const locale of ["ca", "es"] as const) {
    const edition = CHRISTMAS.editions[locale];
    assert.match(edition.seoDescription, snippet[locale], locale);
    const leadBlock = edition.blocks[0] as { type: string; lead?: boolean; text: string };
    assert.ok(leadBlock.lead, locale);
    assert.ok(bodyToPlainText([edition.blocks[0]!]).startsWith(leadStart[locale]), `${locale}: ${leadBlock.text.slice(0, 120)}`);
    assert.ok(leadBlock.text.includes(`](${fairsHubPath(locale)})`), `${locale}: the lead links the hub`);
    assert.match(leadBlock.text, /Fira de Santa Llúcia 2026/, `${locale}: Santa Llúcia still answered in the lead`);
    const faqBlock = edition.blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] };
    assert.match(faqBlock.items[0]!.question, /^(Quines fires de Nadal hi ha a Catalunya el 2026\?|¿Qué ferias de Navidad hay en Cataluña en 2026\?)$/, locale);
    assert.ok(faqBlock.items[0]!.answer.includes(String(FAMILY.fairs)), locale);
  }
});

test("the guide links La Marató and the December bridge, and says only Tuesday 8 is a holiday everywhere", () => {
  assert.ok(holidayOn("2026-12-08"));
  assert.equal(holidayOn("2026-12-07"), null);
  for (const locale of LOCALES) {
    const json = JSON.stringify(CHRISTMAS.editions[locale].blocks);
    assert.ok(json.includes(`](/${locale}/${B2_PATHS.marato[locale]}/)`), `${locale}: -> marato`);
    assert.ok(json.includes(`](/${locale}/${B2_PATHS.decemberBridge[locale]}/)`), `${locale}: -> bridge`);
    const text = bodyToPlainText(CHRISTMAS.editions[locale].blocks);
    assert.ok(text.includes(String(FAMILY.bridge)) && text.includes(String(FAMILY.maratoWeekend)), locale);
  }
  for (const locale of ["ca", "es"] as const) {
    const faqBlock = CHRISTMAS.editions[locale].blocks.find((b) => b.type === "faq") as { items: { answer: string }[] };
    const bridge = faqBlock.items.find((item) => /pont de desembre|puente de diciembre/.test(JSON.stringify(item)))!;
    assert.match(bridge.answer, /únic festiu a tot Catalunya és el dimarts 8|único festivo en toda Cataluña es el martes 8/, locale);
    assert.ok(bridge.answer.includes(String(LOCAL_MONDAY_7.municipalities)), `${locale}: the local Monday-7 holidays are not hidden`);
  }
});
