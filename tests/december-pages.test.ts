import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import {
  BRIDGE_DAYS,
  BRIDGE_OPTIONS,
  BRIDGE_VERIFIED,
  DECEMBER_BRIDGE,
  LOCAL_MONDAY_7,
  MONDAY_7_REGIONS,
  SIBLING_PATHS,
  dayRows,
  isDayOff,
  optionRows,
  runAround,
  runWords,
} from "../src/lib/content/batch02/december-bridge.ts";
import { dayDate } from "../src/lib/content/batch02/festive.ts";
import { MARATO, MARATO_GUIDE, MARATO_VERIFIED, PROGRAMME, PROGRAMME_CHECKED } from "../src/lib/content/batch02/marato.ts";
import { B2_PATHS, withReadNext, type B2Article } from "../src/lib/content/batch02/shared.ts";
import { SHOPS } from "../src/lib/content/batch02/shops.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { holidayOn, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { buildBody as buildHolidayBody } from "../src/lib/content/holidays/publish.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { COPY as SCHOOL_COPY } from "../src/lib/content/school/publish.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { fairsHubPath } from "../src/lib/programmatic/christmas-fairs/paths.ts";
import { christmasFairsPaths } from "../src/lib/programmatic/christmas-fairs/sitemap.ts";

/**
 * Round 4 (26 Oct 2026): the December 2026 bridge and La Marató 2026.
 *
 * Neither page is in batch02.test.ts's list (one photograph each, reused, no
 * body image), so the structural checks that list runs are repeated here,
 * plus what each page must never say: that 6 or 7 December is a Catalan
 * holiday in 2026, a weekday that does not match its date, a Marató phone
 * number or bank account nobody official published, or a past edition's
 * figure dressed up as this year's.
 */

const ARTICLES: B2Article[] = [DECEMBER_BRIDGE, MARATO_GUIDE];
const text = (blocks: Block[]) => bodyToPlainText(blocks);
const sentences = (value: string) => value.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÚÇ¿«"(*])/u);

const PUBLISHED = new Set([
  ...[...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)].flatMap((paths) =>
    LOCALES.map((locale) => `/${locale}/${paths[locale]}/`),
  ),
  // Programmatic family pages, as their own module lists what it publishes (30 Oct: both pages link the fairs hub).
  ...christmasFairsPaths().map((p) => p.path),
]);

/* -------------------------------------------------------------------------- */
/* Structure, SEO, links, photo                                               */
/* -------------------------------------------------------------------------- */

test("both pages have three valid, substantial editions on evergreen registry paths", () => {
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const edition = article.editions[locale];
      const parsed = bodySchema.safeParse(edition.blocks);
      assert.ok(parsed.success, `${article.key}/${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
      assert.ok(wordCount(text(edition.blocks)) > 700, `${article.key}/${locale} is thin`);
      assert.equal(edition.path, B2_PATHS[article.key][locale]);
      assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
      assert.ok(!/\d{4}/.test(edition.path), `${edition.path} carries a year`);
    }
  }
});

test("the new paths collide with no other published path", () => {
  for (const locale of LOCALES) {
    const all = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)].map((paths) => paths[locale]);
    for (const article of ARTICLES) {
      assert.equal(all.filter((path) => path === article.editions[locale].path).length, 1, `${article.key}/${locale}`);
    }
  }
});

test("the sibling paths the bridge page links to are the ones those guides publish", () => {
  for (const locale of LOCALES) assert.equal(SIBLING_PATHS.school[locale], SCHOOL_COPY[locale].path, locale);
  const local = readFileSync(new URL("../src/lib/content/holidays/local-publish.ts", import.meta.url), "utf8");
  for (const locale of LOCALES) assert.ok(local.includes(`path: "${SIBLING_PATHS.local[locale]}"`), locale);
});

test("titles fit in 60 characters, descriptions in 155, name the year and use the searched words", () => {
  const words: Record<string, Record<Locale, RegExp>> = {
    // EN titles of both retitled 30 Oct (CTR sweep): the holiday dates and the Marató date.
    // CA/ES retitled 3 Nov (CTR sweep) with the answer, then 6 Nov (CTR sweep:
    // the answer titles lost clicks) with the promise of the leave table;
    // 11 Nov (CTR retitles) with the Purísima wording and the day-by-day table.
    decemberBridge: { ca: /^Pont de desembre 2026 \(Puríssima\) a Catalunya, dia a dia$/, es: /^Puente de diciembre 2026 \(Purísima\) en Cataluña, día a día$/, en: /^December 2026 holidays in Catalonia: the bridge day by day$/ },
    marato: { ca: /^La Marató/, es: /^La Marató/, en: /^La Marató 2026: TV3 telethon on 13 December/ },
  };
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const { seoTitle, seoDescription, excerpt, title } = article.editions[locale];
      assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${article.key}/${locale} title ${seoTitle.length}`);
      assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${article.key}/${locale} description ${seoDescription.length}`);
      assert.ok(excerpt.length > 30);
      assert.match(seoTitle, /2026/);
      assert.match(title, /2026/);
      assert.match(seoTitle, words[article.key]![locale]);
    }
  }
});

test("sources are https and untracked, and the reader sees the check date", () => {
  for (const article of ARTICLES) {
    assert.ok(article.sources.length >= 10, article.key);
    for (const source of article.sources) {
      assert.match(source.url, /^https:\/\//, source.url);
      assert.ok(!/[?&]utm_/.test(source.url), source.url);
      assert.ok(!/aerobusbcn/i.test(source.url), source.url);
    }
    assert.equal(article.verifiedAt, "2026-10-26");
    for (const locale of LOCALES) {
      assert.match(text(article.editions[locale].blocks), /26 (d'octubre|de octubre|October) (de )?2026/, `${article.key}/${locale}`);
    }
  }
  assert.equal(BRIDGE_VERIFIED, MARATO_VERIFIED);
});

test("internal links stay in their language, end in a slash and point at a published path", () => {
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const json = JSON.stringify(article.editions[locale].blocks);
      assert.ok(!/aerobusbcn/i.test(json));
      for (const match of json.matchAll(/\]\((\/[^)]*)\)/g)) {
        const href = match[1] ?? "";
        assert.ok(href.startsWith(`/${locale}/`), `${article.key}/${locale} links to ${href}`);
        assert.ok(href.endsWith("/"), href);
        assert.ok(PUBLISHED.has(href), `${article.key}/${locale}: ${href} is not a published path`);
      }
    }
  }
});

test("the two pages link to each other, the calendar links to the bridge and the Christmas hub to La Marató", () => {
  for (const locale of LOCALES) {
    const bridge = `](/${locale}/${B2_PATHS.decemberBridge[locale]}/)`;
    const marato = `](/${locale}/${B2_PATHS.marato[locale]}/)`;
    assert.ok(JSON.stringify(DECEMBER_BRIDGE.editions[locale].blocks).includes(marato), `bridge -> marato ${locale}`);
    assert.ok(JSON.stringify(MARATO_GUIDE.editions[locale].blocks).includes(bridge), `marato -> bridge ${locale}`);
    const calendar = JSON.stringify(buildHolidayBody(locale));
    assert.equal(calendar.split(bridge).length - 1, 1, `calendar -> bridge ${locale}: exactly one link`);
    const hub = JSON.stringify(CHRISTMAS_BARCELONA.editions[locale].blocks);
    assert.equal(hub.split(marato).length - 1, 1, `christmas hub -> marato ${locale}: exactly one link`);
  }
});

test("the read-next box only repeats links from the related rail", () => {
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const before = article.editions[locale].blocks;
      const after = withReadNext([...before], locale);
      assert.equal(after.length - before.length, 1, `${article.key}/${locale}: long enough for a box`);
      const related = before[before.length - 1] as { items?: string[] };
      const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
      for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) {
        assert.ok(related.items?.some((item) => item.includes(link)), `${article.key}/${locale}: ${link}`);
      }
    }
  }
});

test("no new photograph: each hero is a manifest file with the shops guide's exact alt and caption", () => {
  const rows = new Map([
    [SHOPS.heroKey, { alt: SHOPS.heroAlt, caption: SHOPS.heroCaption }],
    [SHOPS.secondaryKey, { alt: SHOPS.secondaryAlt, caption: SHOPS.secondaryCaption }],
  ]);
  for (const article of ARTICLES) {
    assert.ok(article.heroKey && IMAGE_BY_KEY.has(article.heroKey), article.key);
    const row = rows.get(article.heroKey);
    assert.ok(row, `${article.key}: hero is not a shops-guide file`);
    assert.deepEqual(article.heroAlt, row.alt, `${article.key}: alt differs from the existing media row`);
    assert.deepEqual(article.heroCaption, row.caption, `${article.key}: caption differs from the existing media row`);
    assert.equal(article.secondaryKey, undefined, article.key);
    for (const locale of LOCALES) {
      assert.ok(!article.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
    }
  }
  assert.notEqual(DECEMBER_BRIDGE.heroKey, MARATO_GUIDE.heroKey, "the two new pages share a photo");
});

/* -------------------------------------------------------------------------- */
/* Bridge: the date logic                                                     */
/* -------------------------------------------------------------------------- */

test("the bridge days are on the weekdays the page prints, and only the 8th is a Catalan holiday", () => {
  assert.deepEqual(
    [BRIDGE_DAYS.saturday, BRIDGE_DAYS.constitution, BRIDGE_DAYS.monday, BRIDGE_DAYS.immaculada, BRIDGE_DAYS.marato, BRIDGE_DAYS.christmas, BRIDGE_DAYS.santEsteve].map(weekdayIndex),
    [6, 0, 1, 2, 0, 5, 6],
  );
  // Ordre EMT/66/2025: 8 December yes; 6 and 7 December no.
  assert.equal(holidayOn(BRIDGE_DAYS.constitution), null);
  assert.equal(holidayOn(BRIDGE_DAYS.monday), null);
  assert.ok(holidayOn(BRIDGE_DAYS.immaculada));
  assert.ok(holidayOn(BRIDGE_DAYS.christmas));
  assert.ok(holidayOn(BRIDGE_DAYS.santEsteve));
});

test("runs of days off are computed from the calendar, not typed", () => {
  assert.equal(isDayOff("2026-12-07"), false);
  assert.equal(isDayOff("2026-12-07", ["2026-12-07"]), true);
  assert.equal(isDayOff("2026-12-06"), true);
  assert.deepEqual(runAround("2026-12-08"), { from: "2026-12-08", to: "2026-12-08", days: 1 });
  assert.deepEqual(runAround("2026-12-08", ["2026-12-07"]), { from: "2026-12-05", to: "2026-12-08", days: 4 });
  assert.deepEqual(runAround("2026-12-08", ["2026-12-07", "2026-12-09", "2026-12-10", "2026-12-11"]), { from: "2026-12-05", to: "2026-12-13", days: 9 });
  assert.deepEqual(runAround("2026-12-25"), { from: "2026-12-25", to: "2026-12-27", days: 3 });
  assert.throws(() => runAround("2026-12-07"), /not a day off/);
  // Every option's leave days are working days, or the option is wrong.
  for (const option of BRIDGE_OPTIONS) for (const day of option.leave) assert.equal(isDayOff(day), false, `${option.id}: ${day}`);
  assert.deepEqual(optionRows("ca").map((row) => row[1]), ["4 dies", "9 dies", "3 dies"]);
  assert.equal(runWords(runAround("2026-12-08", ["2026-12-07"]), "ca"), "del dissabte 5 al dimarts 8 de desembre");
  assert.equal(runWords(runAround("2026-12-08", ["2026-12-07"]), "es"), "del sábado 5 al martes 8 de diciembre");
  assert.equal(runWords(runAround("2026-12-08", ["2026-12-07"]), "en"), "Saturday 5 to Tuesday 8 December");
  // Catalan elision before 1 and 11 survives the weekday being added.
  assert.equal(runWords({ from: "2027-01-01", to: "2027-01-03", days: 3 }, "ca"), "del divendres 1 al diumenge 3 de gener");
});

test("the day table calls a day a holiday exactly when the calendar does", () => {
  for (const locale of LOCALES) {
    const rows = dayRows(locale);
    const marked = rows.map((row) => /Festiu a tot Catalunya|Festivo en toda Cataluña|Public holiday across Catalonia/.test(row[1] ?? ""));
    assert.deepEqual(marked, [false, false, false, true, true, true], locale);
  }
});

test("every weekday printed next to a day of the month matches the date", () => {
  const weekdays: Record<Locale, string[]> = {
    ca: ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"],
    es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
    en: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  };
  let checked = 0;
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      const body = text(article.editions[locale].blocks).toLowerCase();
      // December unless November follows (La Marató's album: 29 November).
      const pattern = new RegExp(`\\b(${weekdays[locale].join("|")}),? (?:the )?(\\d{1,2})(?:st|nd|rd|th)?(?![\\d:])( (?:de )?(?:novembre|noviembre|november))?`, "gu");
      for (const match of body.matchAll(pattern)) {
        const iso = `2026-${match[3] ? "11" : "12"}-${match[2]!.padStart(2, "0")}`;
        assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${article.key}/${locale}: "${match[0]}"`);
        checked += 1;
      }
    }
  }
  assert.ok(checked > 60, `only ${checked} weekday mentions checked`);
});

/* -------------------------------------------------------------------------- */
/* Bridge: what it must say and must never say                                */
/* -------------------------------------------------------------------------- */

test("the answer is in the lead: only Tuesday 8 is a holiday, the 6th is a Sunday, the 7th a working day", () => {
  const must: Record<Locale, RegExp[]> = {
    ca: [/únic festiu[^.]*dimarts 8/, /cau en diumenge/, /dilluns 7 és un dia feiner/],
    es: [/único festivo[^.]*martes 8/, /cae en domingo/, /lunes 7 es laborable/],
    en: [/only public holiday[^.]*Tuesday 8 December/, /falls on a Sunday/, /Monday the 7th is a working day/],
  };
  for (const locale of LOCALES) {
    const leadText = text(DECEMBER_BRIDGE.editions[locale].blocks.slice(0, 1));
    for (const pattern of must[locale]) assert.match(leadText, pattern, `${locale}: ${pattern}`);
  }
});

test("the bridge page never calls 6 or 7 December a Catalonia-wide holiday in 2026", () => {
  const forbidden = [
    /(el )?6 i (el )?8 de desembre (són|seran) festius/i,
    /(el )?6 y (el )?8 de diciembre son festivos/i,
    /6 and 8 December are (public )?holidays/i,
    /dilluns 7 (és|serà) festiu a (tot )?Catalunya/i,
    /lunes 7 es festivo en (toda )?Cataluña/i,
    /Monday(,)? 7 December is a (public )?holiday in Catalonia/i,
    /pont de (quatre|cinc) dies sense demanar/i,
  ];
  for (const locale of LOCALES) {
    const body = text(DECEMBER_BRIDGE.editions[locale].blocks);
    for (const pattern of forbidden) assert.doesNotMatch(body, pattern, `${locale}: ${pattern}`);
  }
});

test("the regions with Monday 7 off are the BOE's ten, and Catalonia is not among them", () => {
  for (const locale of LOCALES) {
    assert.equal(MONDAY_7_REGIONS[locale].length, 10, locale);
    assert.ok(!MONDAY_7_REGIONS[locale].some((name) => /Catalu|Catalon/.test(name)), locale);
    const body = text(DECEMBER_BRIDGE.editions[locale].blocks);
    for (const region of MONDAY_7_REGIONS[locale]) assert.ok(body.includes(region), `${locale}: ${region}`);
    assert.match(body, /28 (d'octubre|de octubre|October) (de )?2025/, `${locale}: dated BOE list`);
  }
});

test("local holidays on the 7th, school and shops are stated as the orders state them", () => {
  const school: Record<Locale, RegExp[]> = {
    ca: [/EDF\/66\/2026/, /depèn de l'escola/, /quatre dies festius de lliure disposició/, /22 de desembre de 2026 al 7 de gener de 2027/, /Consell d'Educació Municipal/],
    es: [/EDF\/66\/2026/, /depende del centro/, /quatre dies festius de lliure disposició/, /22 de diciembre de 2026 al 7 de enero de 2027/, /Consell d'Educació Municipal/],
    en: [/EDF\/66\/2026/, /depends on the school/, /quatre dies festius de lliure disposició/, /22 December 2026 to 7 January 2027/, /Consell d'Educació Municipal/],
  };
  const shops: Record<Locale, RegExp[]> = {
    ca: [/EMT\/77\/2025/, /EMT\/4342\/2025/, /Poder obrir no vol dir que obrin/],
    es: [/EMT\/77\/2025/, /EMT\/4342\/2025/, /Poder abrir no quiere decir que abran/],
    en: [/EMT\/77\/2025/, /EMT\/4342\/2025/, /does not mean every shop will/],
  };
  for (const locale of LOCALES) {
    const body = text(DECEMBER_BRIDGE.editions[locale].blocks);
    for (const pattern of [...school[locale], ...shops[locale]]) assert.match(body, pattern, `${locale}: ${pattern}`);
    assert.ok(body.includes(String(LOCAL_MONDAY_7.municipalities)), `${locale}: local count`);
    for (const town of LOCAL_MONDAY_7.examples) assert.ok(body.includes(town), `${locale}: ${town}`);
    assert.match(body, /EMT\/208\/2025/, `${locale}: local holiday order`);
    // 10 Nov 2026: the SCT's and the DGT's 2026 calendars have the 4-8 Dec
    // special operation (no hours): it is described from them, with no
    // "operació sortida" times, which neither publishes.
    assert.match(body, /Servei Català de Trànsit/, locale);
    assert.doesNotMatch(body, /operació sortida|operación salida/i, locale);
  }
});

test("ski openings are never promised", () => {
  for (const locale of LOCALES) {
    const body = text(DECEMBER_BRIDGE.editions[locale].blocks);
    assert.match(body, /si la meteorologia i la neu ho permeten|siempre que las condiciones meteorológicas y de nieve lo permitan|weather and snow permitting/, locale);
    assert.doesNotMatch(body, /hi haurà neu|habrá nieve|there will be snow|garantit|garantizad|guaranteed/i, locale);
  }
});

/* -------------------------------------------------------------------------- */
/* La Marató                                                                  */
/* -------------------------------------------------------------------------- */

test("La Marató 2026 is Sunday 13 December and the lead says so with the cause", () => {
  assert.equal(weekdayIndex(MARATO.date), 0);
  assert.equal(MARATO.edition, 35);
  const cause: Record<Locale, RegExp> = {
    ca: /malalties neurodegeneratives i neuromusculars/,
    es: /enfermedades neurodegenerativas y neuromusculares/,
    en: /neurodegenerative and neuromuscular diseases/,
  };
  for (const locale of LOCALES) {
    const leadText = text(MARATO_GUIDE.editions[locale].blocks.slice(0, 1));
    assert.ok(leadText.includes(dayDate(MARATO.date, locale, false)), `${locale}: ${leadText}`);
    assert.match(leadText, /2026/, locale);
    assert.match(leadText, cause[locale], locale);
    const body = text(MARATO_GUIDE.editions[locale].blocks);
    for (const name of ["Raquel Sans", "Miki Núñez", "Roger Escapa", "TV3", "Catalunya Ràdio"]) assert.ok(body.includes(name), `${locale}: ${name}`);
  }
});

test("donations only through what 3Cat publishes: Bizum code, no copied IBAN, only the announced phone number", () => {
  // 13 Nov 2026: 3Cat's news of 10 Nov 2026 announced the 13 December line,
  // "El diumenge 13 de desembre també estarà actiu el telèfon 900 21 50 50."
  assert.equal(PROGRAMME.phone, "900 21 50 50");
  assert.ok(MARATO_GUIDE.sources.some((source) => source.url === PROGRAMME.news), "the announcement is a source");
  for (const locale of LOCALES) {
    const json = JSON.stringify(MARATO_GUIDE.editions[locale].blocks);
    const body = text(MARATO_GUIDE.editions[locale].blocks);
    assert.ok(body.includes(MARATO.bizum), `${locale}: Bizum code`);
    assert.ok(json.includes(`](${MARATO.donate[locale]})`), `${locale}: official donation page linked`);
    assert.ok(body.includes(PROGRAMME.phone), `${locale}: the announced phone number`);
    assert.doesNotMatch(body, /\bES\d{2}[\s\d]{10,}/, `${locale}: an account number is printed`);
    const other = body.split(PROGRAMME.phone).join(" ");
    assert.doesNotMatch(other, /\b[6789]\d{2}[ .]?\d{2,3}[ .]?\d{2,3}[ .]?\d{0,3}\b(?![,.]\d)/, `${locale}: another phone-like number`);
    assert.doesNotMatch(other, /\b90[0-9] ?\d{3} ?\d{3}\b/, `${locale}: premium-rate number`);
  }
});

test("no other edition's figures are printed as 2026's", () => {
  const cancer = /càncer|cáncer|cancer/i;
  const checked = { ca: /26 d'octubre de 2026/, es: /26 de octubre de 2026/, en: /26 October 2026/ };
  for (const locale of LOCALES) {
    const body = text(MARATO_GUIDE.editions[locale].blocks);
    for (const sentence of sentences(body).filter((s) => /2025/.test(s))) {
      assert.match(sentence, cancer, `${locale}: "${sentence}" mentions 2025 for something other than last year's cause`);
    }
    // The cumulative total carries the day it was read.
    for (const sentence of sentences(body).filter((s) => /271[,.]9/.test(s))) {
      assert.match(sentence, checked[locale], `${locale}: "${sentence}"`);
      assert.match(sentence, /1992/, `${locale}: "${sentence}" must say it is the total since 1992`);
    }
    // Last year's provisional total from the April note is not reused.
    assert.doesNotMatch(body, /267[,.]2/, locale);
    // The programme times are not invented: every clock time printed is one
    // 3Cat announced on 10 Nov 2026 (TV3 9.30-14.30 and 16.00-1.00, radio
    // from 8.00), in the Catalan "9.30" or the es/en "9:30" style.
    const announced = new Set([...PROGRAMME.tv.flatMap((slot) => [slot.from, slot.to]), PROGRAMME.radioFrom].flatMap((t) => [t, t.replace(".", ":")]));
    for (const match of body.matchAll(/\b(?:[01]?\d|2[0-3])[.:][0-5]\d\b(?![.,]?\d)/g)) {
      const prefix = body.slice(Math.max(0, match.index! - 3), match.index!);
      if (/\d[.,]$/.test(prefix)) continue; // part of a larger number such as 271,9 or 1.084
      assert.ok(announced.has(match[0]), `${locale}: clock time ${match[0]} was not announced by 3Cat`);
    }
    assert.ok(body.includes(locale === "ca" ? "9.30" : "9:30"), `${locale}: the start time`);
  }
  assert.equal(PROGRAMME_CHECKED, "2026-11-13");
});

test("top-3 push (30 Oct 2026): the bridge snippet lists December's holidays and the FAQ asks for the Purísima bridge; La Marató's title gives the date", () => {
  const description: Record<"ca" | "es", RegExp> = {
    ca: /^Festius de desembre 2026 a Catalunya: dimarts 8 \(la Immaculada\), 25 i 26\./,
    es: /^Festivos de diciembre 2026 en Cataluña: martes 8 \(la Purísima\), 25 y 26\./,
  };
  const question: Record<"ca" | "es", string> = { ca: "Quan és el pont de la Puríssima del 2026?", es: "¿Cuándo es el puente de la Purísima de 2026?" };
  for (const locale of ["ca", "es"] as const) {
    const edition = DECEMBER_BRIDGE.editions[locale];
    assert.match(edition.seoDescription, description[locale], locale);
    assert.ok(edition.seoDescription.includes(String(LOCAL_MONDAY_7.municipalities)), `${locale}: the local Monday-7 holidays are not hidden`);
    const faqBlock = edition.blocks.find((b) => b.type === "faq") as { items: { question: string }[] };
    assert.ok(faqBlock.items.some((item) => item.question === question[locale]), locale);
    assert.match(MARATO_GUIDE.editions[locale].seoTitle, /13 de (desembre|diciembre)/, locale);
  }
  // The days named in the snippet are what the holiday calendar says.
  assert.equal(weekdayIndex("2026-12-08"), 2);
  for (const iso of ["2026-12-08", "2026-12-25", "2026-12-26"]) assert.ok(holidayOn(iso), iso);
  assert.equal(holidayOn("2026-12-07"), null);
  assert.equal(MARATO.date, "2026-12-13");
});

/* -------------------------------------------------------------------------- */
/* Seasonal top-3 push (30 Oct 2026, afternoon)                               */
/* -------------------------------------------------------------------------- */

test("La Marató answers in the searchers' words: TV3 in the H1, lead and snippet; FAQ for when, what time, where and volunteering", () => {
  const questions: Record<Locale, string[]> = {
    ca: ["Quan és La Marató de TV3 2026?", "A quina hora comença La Marató 2026?", "On es pot veure La Marató?", "Com puc ser voluntari de La Marató 2026?"],
    es: ["¿Cuándo es La Marató de TV3 2026?", "¿A qué hora empieza La Marató 2026?", "¿Dónde se puede ver La Marató?", "¿Cómo puedo ser voluntario de La Marató 2026?"],
    en: ["When is La Marató de TV3 2026?", "What time does La Marató 2026 start?", "Where can I watch La Marató?", "How can I volunteer for La Marató 2026?"],
  };
  const h1Day: Record<Locale, string> = { ca: "diumenge 13 de desembre", es: "domingo 13 de diciembre", en: "Sunday 13 December" };
  for (const locale of LOCALES) {
    const edition = MARATO_GUIDE.editions[locale];
    assert.match(edition.title, /TV3/, locale);
    assert.ok(edition.title.includes(h1Day[locale]), `${locale}: the H1 gives the day`);
    assert.equal(dayDate(MARATO.date, locale, false).toLowerCase(), h1Day[locale].toLowerCase());
    assert.match(text(edition.blocks.slice(0, 1)), /^La Marató de TV3 2026/, locale);
    assert.match(edition.seoDescription, /TV3/, locale);
    const items = (edition.blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string }[] }).items;
    for (const question of questions[locale]) assert.ok(items.some((item) => item.question === question), `${locale}: ${question}`);
    const answer = (question: string) => items.find((item) => item.question === question)!.answer;
    assert.ok(answer(questions[locale][0]!).includes(dayDate(MARATO.date, locale)), locale);
    // 13 Nov 2026: 3Cat announced the times on 10 Nov; the answer gives the TV3 start.
    const time = answer(questions[locale][1]!);
    const start = locale === "ca" ? PROGRAMME.tv[0].from : PROGRAMME.tv[0].from.replace(".", ":");
    assert.ok(time.includes(start), `${locale}: start time in "${time}"`);
    assert.match(time, /Collserola/, locale);
    const volunteer = answer(questions[locale][3]!);
    assert.match(volunteer, /marato\.voluntariat\.org/, locale);
    assert.match(volunteer, /10 (de )?(novembre|noviembre|November) (de )?2026/, locale);
  }
});

test("cluster links (30 Oct): La Marató and the bridge link the Christmas fairs hub; shops links the lights and the bridge; the lights page links the bridge", () => {
  for (const locale of LOCALES) {
    const hub = `](${fairsHubPath(locale)})`;
    assert.ok(JSON.stringify(MARATO_GUIDE.editions[locale].blocks).includes(hub), `marato -> fairs hub ${locale}`);
    assert.ok(JSON.stringify(DECEMBER_BRIDGE.editions[locale].blocks).includes(hub), `bridge -> fairs hub ${locale}`);
    const shops = JSON.stringify(SHOPS.editions[locale].blocks);
    assert.ok(shops.includes(`](/${locale}/${B2_PATHS.christmasBarcelona[locale]}/)`), `shops -> lights ${locale}`);
    assert.ok(shops.includes(`](/${locale}/${B2_PATHS.decemberBridge[locale]}/)`), `shops -> bridge ${locale}`);
    const lights = JSON.stringify(CHRISTMAS_BARCELONA.editions[locale].blocks);
    assert.ok(lights.includes(`](/${locale}/${B2_PATHS.decemberBridge[locale]}/)`), `lights -> bridge ${locale}`);
  }
});
