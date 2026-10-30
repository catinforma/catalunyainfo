import assert from "node:assert/strict";
import { test } from "node:test";

import { CHRISTMAS, FAMILY } from "../src/lib/content/batch02/christmas.ts";
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
    /10[:.]00\s*(a|to|-|–)\s*21[:.]00/,
  ];
  for (const locale of LOCALES) {
    const text = bodyToPlainText(CHRISTMAS.editions[locale].blocks);
    for (const pattern of stale) assert.ok(!pattern.test(text), `${locale}: ${pattern} looks like a 2025 date`);
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
  assert.match(en.seoDescription, /^Fira de Santa Llúcia 2026 dates not published yet \(2025: 28 Nov–23 Dec/);
  assert.ok(en.seoDescription.length <= 155);
  const blocks = en.blocks as { type: string; lead?: boolean; text?: string }[];
  const lead = blocks.find((b) => b.type === "paragraph" && b.lead)?.text ?? "";
  assert.match(lead, /Fira de Santa Llúcia/);
  assert.match(lead, /2026 dates have not been published yet/);
  const pages = [
    /nadal-a-barcelona|navidad-en-barcelona|christmas-in-barcelona/,
    /tradicions-de-nadal|tradiciones-navidad|catalan-christmas-traditions/,
    /pessebres-vivents|belenes-vivientes|living-nativity/,
    /cap-d-any|nochevieja|new-years-eve/,
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
