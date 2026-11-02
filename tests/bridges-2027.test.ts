import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import {
  BARCELONA_PLANS,
  ARAN_PLANS,
  BEST_USE,
  BRIDGES_2027,
  BRIDGES_2027_META,
  BRIDGES_VERIFIED,
  BRIDGE_COUNT,
  EASTER_2027_PATHS,
  FREE_RUNS,
  HOLIDAY_PLANS,
  LEAVE_RUNS,
  LOCAL_ORDERS,
  LOCAL_STATUS,
  LOST,
  LOST_SATURDAYS,
  REGIONAL_DATES,
  RUNS,
  buildBridgesBody,
  holidayRows,
  localDays2027,
  localTowns,
} from "../src/lib/content/batch02/bridges-2027.ts";
import { DECEMBER_BRIDGE, SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { B2_PATHS, b2href, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { bestUse, bridgeCount, dayKind, planFor, plansFor } from "../src/lib/content/holidays/bridges.ts";
import { HOLIDAYS_BY_YEAR, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { SANT_JOAN_IMAGE } from "../src/lib/content/holidays/images.ts";
import { BARCELONA_LOCAL, BRIDGES, CATALONIA_HOLIDAYS, SOURCES as HOLIDAY_SOURCES } from "../src/lib/content/holidays/payload.ts";
import { buildBody as buildHolidayBody } from "../src/lib/content/holidays/publish.ts";
import {
  SATURDAY_COMMENTARY_URL,
  SATURDAY_FAQ_ID,
  SATURDAY_RULING,
  SATURDAY_RULING_READ,
  SATURDAY_SOURCES,
  saturdayAnswer,
  saturdayNote,
  saturdayQuestion,
} from "../src/lib/content/holidays/saturday.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { SCHOOL_YEARS } from "../src/lib/content/school/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { sectionFromSegment } from "../src/lib/i18n/routes.ts";
import { bridgesLine, hubCopy } from "../src/lib/programmatic/holidays/copy.ts";
import { COUNCIL_2027 } from "../src/lib/programmatic/holidays/council-2027.ts";
import { councilApproved2027, municipalityBySlug, nextYearPublished, regionalDays } from "../src/lib/programmatic/holidays/data.ts";
import { englishHubCopy } from "../src/lib/programmatic/holidays/english-copy.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";
import { datePath, holidayFamilyPaths } from "../src/lib/programmatic/holidays/paths.ts";

/**
 * Ponts / puentes / long weekends 2027 (31 Oct 2026).
 *
 * Pins that every date on the page comes from the shared modules (Ordre
 * EMT/52/2026, Barcelona's decree, the councils' days, the school order),
 * that the bridge rule gives the right answer for each 2027 holiday (the
 * weekdays below were checked against a printed 2027 calendar, not against
 * the code under test), the length limits, the links in and out, and that
 * nothing depends on the clock.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const body = (locale: Locale) => text(BRIDGES_2027.editions[locale].blocks);
const json = (locale: Locale) => JSON.stringify(BRIDGES_2027.editions[locale].blocks);
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const PUBLISHED = new Set([
  ...[...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)].flatMap((paths) =>
    LOCALES.map((locale) => `/${locale}/${paths[locale]}/`),
  ),
  ...holidayFamilyPaths().map((p) => p.path),
]);
// Built in parallel by another agent (31 Oct 2026); linked by its planned paths.
const EASTER = new Set(LOCALES.map((locale) => `/${locale}/${EASTER_2027_PATHS[locale]}/`));

/* -------------------------------------------------------------------------- */
/* Dates come from the shared modules                                         */
/* -------------------------------------------------------------------------- */

test("the twelve holidays are Ordre EMT/52/2026's, read through regionalDays, not retyped", () => {
  const order = CATALONIA_HOLIDAYS.map((h) => h.date);
  assert.equal(order.length, 12);
  assert.deepEqual([...REGIONAL_DATES], regionalDays(2027).map((d) => d.date));
  assert.deepEqual([...REGIONAL_DATES].sort(), [...order].sort());
  assert.deepEqual(HOLIDAY_PLANS.map((p) => p.date), [...order].sort());
  assert.deepEqual(HOLIDAYS_BY_YEAR[2027], CATALONIA_HOLIDAYS);
  // Barcelona's two days are the city's (payload), the other towns' the councils'.
  assert.deepEqual(BARCELONA_PLANS.map((p) => p.date), BARCELONA_LOCAL.map((h) => h.date));
  for (const t of localTowns()) {
    const council = councilApproved2027(t.town.slug);
    if (t.status === "council") assert.deepEqual(t.local, council?.local, t.town.slug);
  }
});

test("no date is typed in the page or the bridge modules, except the publication stamp and the local-order history", () => {
  const iso = /["'`](\d{4}-\d{2}-\d{2})/g;
  const page = read("src/lib/content/batch02/bridges-2027.ts");
  const typed = new Set([...page.matchAll(iso)].map((m) => m[1]));
  const allowed = new Set(["2026-10-31", ...LOCAL_ORDERS.map((o) => o.dogcDate)]);
  for (const date of typed) assert.ok(allowed.has(date!), `bridges-2027.ts types ${date}`);
  assert.equal([...read("src/lib/content/holidays/bridges.ts").matchAll(iso)].length, 0, "bridges.ts types a date");
  // The two local-order dates are the ones the Treball normativa page lists (DOGC 9565, DOGC 9320).
  assert.deepEqual(LOCAL_ORDERS.map((o) => [o.year, o.dogcDate]), [
    [2026, "2025-12-17"],
    [2025, "2024-12-31"],
  ]);
});

/* -------------------------------------------------------------------------- */
/* The bridge rule                                                            */
/* -------------------------------------------------------------------------- */

test("the 2027 holidays fall on the weekdays a printed calendar gives", () => {
  // 0 = Sunday. 1 Jan 2027 is a Friday; 25 Dec 2027 a Saturday.
  const expected: Record<string, number> = {
    "2027-01-01": 5,
    "2027-01-06": 3,
    "2027-03-26": 5,
    "2027-03-29": 1,
    "2027-05-01": 6,
    "2027-06-24": 4,
    "2027-09-11": 6,
    "2027-10-12": 2,
    "2027-11-01": 1,
    "2027-12-06": 1,
    "2027-12-08": 3,
    "2027-12-25": 6,
  };
  assert.deepEqual(Object.keys(expected), [...REGIONAL_DATES].sort());
  for (const [date, weekday] of Object.entries(expected)) assert.equal(weekdayIndex(date), weekday, date);
  // Barcelona: Monday 17 May, Friday 24 September. Aran: Thursday 17 June.
  assert.deepEqual(["2027-05-17", "2027-09-24", "2027-06-17"].map(weekdayIndex), [1, 5, 4]);
});

test("every 2027 holiday is classified and planned correctly", () => {
  const expected: Record<string, { kind: string; take?: string[]; from?: string; to?: string; days?: number }> = {
    "2027-01-01": { kind: "long-weekend", take: [], from: "2027-01-01", to: "2027-01-03", days: 3 },
    // Wednesday: two days, and the Friday before is Cap d'Any, so six.
    "2027-01-06": { kind: "midweek", take: ["2027-01-04", "2027-01-05"], from: "2027-01-01", to: "2027-01-06", days: 6 },
    "2027-03-26": { kind: "long-weekend", take: [], from: "2027-03-26", to: "2027-03-29", days: 4 },
    "2027-03-29": { kind: "long-weekend", take: [], from: "2027-03-26", to: "2027-03-29", days: 4 },
    "2027-05-01": { kind: "weekend" },
    "2027-06-24": { kind: "bridge", take: ["2027-06-25"], from: "2027-06-24", to: "2027-06-27", days: 4 },
    "2027-09-11": { kind: "weekend" },
    "2027-10-12": { kind: "bridge", take: ["2027-10-11"], from: "2027-10-09", to: "2027-10-12", days: 4 },
    "2027-11-01": { kind: "long-weekend", take: [], from: "2027-10-30", to: "2027-11-01", days: 3 },
    "2027-12-06": { kind: "long-weekend", take: [], from: "2027-12-04", to: "2027-12-06", days: 3 },
    // Wednesday, but Monday the 6th is a holiday: one day of leave, five days.
    "2027-12-08": { kind: "midweek", take: ["2027-12-07"], from: "2027-12-04", to: "2027-12-08", days: 5 },
    "2027-12-25": { kind: "weekend" },
  };
  for (const p of HOLIDAY_PLANS) {
    const e = expected[p.date]!;
    assert.equal(p.kind, e.kind, p.date);
    if (e.kind === "weekend") {
      assert.equal(p.plan, null, p.date);
      continue;
    }
    assert.deepEqual({ take: p.plan?.take, from: p.plan?.from, to: p.plan?.to, days: p.plan?.days }, { take: e.take, from: e.from, to: e.to, days: e.days }, p.date);
  }
  assert.equal(BRIDGE_COUNT, 8);
  assert.equal(FREE_RUNS.length, 4);
  assert.equal(LEAVE_RUNS.length, 4);
  assert.deepEqual(LOST.map((p) => p.date), ["2027-05-01", "2027-09-11", "2027-12-25"]);
  assert.equal(RUNS.length, FREE_RUNS.length + LEAVE_RUNS.length);
  assert.equal(bridgeCount(CATALONIA_HOLIDAYS.map((h) => h.date)), BRIDGE_COUNT);
});

test("the rule on its own: Tuesday, Thursday, Wednesday, Sunday, and leave that is already off", () => {
  const none = new Set<string>();
  // 2027-06-01 is a Tuesday, -03 a Thursday, -02 a Wednesday, -06 a Sunday.
  assert.deepEqual(dayKind("2027-06-01"), "bridge");
  assert.deepEqual(planFor("2027-06-01", none), { date: "2027-06-01", kind: "bridge", take: ["2027-05-31"], from: "2027-05-29", to: "2027-06-01", days: 4 });
  assert.deepEqual(planFor("2027-06-03", none), { date: "2027-06-03", kind: "bridge", take: ["2027-06-04"], from: "2027-06-03", to: "2027-06-06", days: 4 });
  // Wednesday alone: two days for five, the earlier pair on a tie.
  assert.deepEqual(planFor("2027-06-02", none), { date: "2027-06-02", kind: "midweek", take: ["2027-05-31", "2027-06-01"], from: "2027-05-29", to: "2027-06-02", days: 5 });
  assert.equal(planFor("2027-06-06", none), null);
  // A Tuesday after a Monday holiday needs no leave at all (Sant Boi's 7 December).
  assert.deepEqual(plansFor(["2027-12-07"], REGIONAL_DATES)[0]?.plan, { date: "2027-12-07", kind: "bridge", take: [], from: "2027-12-04", to: "2027-12-08", days: 5 });
});

test("the best use of leave is the longest run each budget buys", () => {
  const off = new Set(REGIONAL_DATES);
  assert.deepEqual(BEST_USE.map((u) => [u.leave, u.days]), [
    [1, 5],
    [2, 6],
    [3, 9],
    [4, 10],
  ]);
  assert.deepEqual(BEST_USE[0]!.runs.map((r) => `${r.from}..${r.to}:${r.take.join(",")}`), [
    "2027-03-25..2027-03-29:2027-03-25",
    "2027-03-26..2027-03-30:2027-03-30",
    "2027-12-04..2027-12-08:2027-12-07",
  ]);
  assert.deepEqual(BEST_USE[2]!.runs, [{ take: ["2027-12-07", "2027-12-09", "2027-12-10"], from: "2027-12-04", to: "2027-12-12", days: 9 }]);
  assert.equal(bestUse(off, 0, 2027).days, 4, "Easter is the longest run with no leave");
  for (const use of BEST_USE) {
    for (const run of use.runs) {
      assert.equal(run.take.length, use.leave);
      for (const day of run.take) assert.ok(weekdayIndex(day) > 0 && weekdayIndex(day) < 6 && !off.has(day), `${day} is not a working day`);
    }
  }
});

test("every bridge the holiday guide types by hand is one the rule finds, with the same length", () => {
  const off = new Set(REGIONAL_DATES);
  const key = (s: { from: string; to: string; take: string[]; days: number }) => `${s.from}|${s.to}|${s.take.join()}|${s.days}`;
  const found = new Set([...RUNS.map(key), ...[1, 2, 3, 4].flatMap((k) => bestUse(off, k, 2027).runs.map(key))]);
  for (const bridge of BRIDGES) assert.ok(found.has(key(bridge)), `payload BRIDGES "${bridge.id}" is not a computed bridge`);
});

test("Aran: Easter shrinks to three days and the Festa d'Aran makes a bridge", () => {
  assert.deepEqual(
    ARAN_PLANS.map((p) => [p.date, p.plan?.take, p.plan?.from, p.plan?.to, p.plan?.days]),
    [
      ["2027-03-26", [], "2027-03-26", "2027-03-28", 3],
      ["2027-06-17", ["2027-06-18"], "2027-06-17", "2027-06-20", 4],
    ],
  );
});

/* -------------------------------------------------------------------------- */
/* Local days                                                                 */
/* -------------------------------------------------------------------------- */

test("Barcelona's two local days each make a long weekend with no leave", () => {
  assert.deepEqual(
    BARCELONA_PLANS.map((p) => [p.date, p.plan?.take, p.plan?.from, p.plan?.to]),
    [
      ["2027-05-17", [], "2027-05-15", "2027-05-17"],
      ["2027-09-24", [], "2027-09-24", "2027-09-26"],
    ],
  );
});

test("the town table: the largest towns with known days, labelled pending the DOGC order until it is parsed", () => {
  const towns = localTowns();
  assert.equal(towns.length, 12);
  for (const slug of ["l-hospitalet-de-llobregat", "badalona", "lleida", "mataro", "reus", "girona"]) {
    assert.ok(towns.some((t) => t.town.slug === slug), slug);
  }
  assert.ok(!towns.some((t) => t.town.slug === "barcelona"), "Barcelona has its own section");
  for (let i = 1; i < towns.length; i++) assert.ok(towns[i - 1]!.town.rank < towns[i]!.town.rank, "by population");
  if (!nextYearPublished()) {
    assert.equal(LOCAL_STATUS, "council");
    for (const t of towns) {
      assert.equal(t.status, "council");
      assert.equal(t.source?.url, COUNCIL_2027[t.town.slug]?.source.url);
    }
    const pending: Record<Locale, RegExp> = { ca: /pendents de l'ordre del DOGC/, es: /pendientes de la orden del DOGC/, en: /pending the DOGC order/ };
    for (const locale of LOCALES) {
      const table = BRIDGES_2027.editions[locale].blocks.find((b) => b.type === "table" && /DOGC/.test((b as { caption?: string }).caption ?? "")) as { caption: string };
      assert.match(table.caption, pending[locale], locale);
      assert.match(body(locale), pending[locale], locale);
    }
  }
  // Girona: Friday 29 October runs into All Saints, no leave; Sant Boi's 7 December joins the 6th and 8th.
  const ca = JSON.stringify(BRIDGES_2027.editions.ca.blocks);
  assert.match(ca, /29 d'octubre: 4 dies, del divendres 29 d'octubre al dilluns 1 de novembre \(també és festiu: Tots Sants\), sense vacances/);
  assert.match(ca, /7 de desembre: 5 dies, del dissabte 4 al dimecres 8 de desembre[^;|"]*sense vacances/);
});

test("once the DOGC order is parsed, a town's days come from it, through the same function", () => {
  const girona = municipalityBySlug("girona")!;
  const fake = { source: { name: "Ordre de prova", ref: "DOGC núm. 0000", url: "https://dogc.gencat.cat/prova" }, readOn: "2026-12-20" };
  const fromOrder = localDays2027(girona, { local: ["2027-10-29", "2027-07-26"] }, fake);
  assert.deepEqual(fromOrder && { status: fromOrder.status, local: fromOrder.local, source: fromOrder.source?.ref }, { status: "dogc", local: ["2027-07-26", "2027-10-29"], source: "DOGC núm. 0000" });
  // Not in the order (or nuclei only): falls back to the council's days only while the order is out of the snapshot.
  const fallback = localDays2027(girona, null, fake);
  assert.equal(fallback?.status, nextYearPublished() ? undefined : "council");
  assert.equal(councilApproved2027("girona", true), null, "the council's days are ignored once the order is published");
});

/* -------------------------------------------------------------------------- */
/* Structure, SEO, links                                                      */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on the registry paths, with the answer table first", () => {
  assert.deepEqual(B2_PATHS.bridges2027, { ca: "guies/ponts-2027-catalunya", es: "guias/puentes-2027-cataluna", en: "guides/long-weekends-2027-catalonia" });
  for (const locale of LOCALES) {
    const edition = BRIDGES_2027.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(body(locale)) > 1500, `${locale} is thin: ${wordCount(body(locale))}`);
    assert.equal(edition.path, B2_PATHS.bridges2027[locale]);
    // The section crumb (Guies / Guías / Guides) that the article route adds to the BreadcrumbList.
    assert.equal(sectionFromSegment(locale, edition.path.split("/")[0]), "guides", locale);
    const blocks = edition.blocks;
    assert.equal((blocks[0] as { lead?: boolean }).lead, true);
    const firstTable = blocks.findIndex((b) => b.type === "table");
    assert.ok(firstTable > 0 && firstTable <= 5, `${locale}: the answer table is block ${firstTable}`);
    assert.equal((blocks[firstTable] as { rows: string[][] }).rows.length, 12);
    assert.ok(blocks.some((b) => b.type === "faq" && (b as { items: unknown[] }).items.length >= 6), `${locale}: FAQ`);
    assert.equal(withReadNext([...blocks], locale).length, blocks.length + 1, `${locale}: read-next box`);
  }
});

test("the paths collide with no other published path", () => {
  for (const locale of LOCALES) {
    const all = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)].map((paths) => paths[locale]);
    assert.equal(all.filter((path) => path === B2_PATHS.bridges2027[locale]).length, 1, locale);
    assert.ok(!holidayFamilyPaths().some((p) => p.path === b2href("bridges2027", locale)), locale);
    assert.ok(!EASTER.has(b2href("bridges2027", locale)), locale);
  }
});

test("titles fit in 60 characters and descriptions in 155, in the searchers' words, with the count and the best bridges", () => {
  const start: Record<Locale, RegExp> = { ca: /^Ponts 2027 a Catalunya: els 8 ponts/, es: /^Puentes 2027 en Cataluña: los 8 puentes/, en: /^Long weekends 2027 in Catalonia: all 8/ };
  const best: Record<Locale, RegExp> = { ca: /7 de desembre.*25 de juny.*11 d'octubre/, es: /7 de diciembre.*25 de junio.*11 de octubre/, en: /7 December.*25 June.*11 October/ };
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, excerpt, title } = BRIDGES_2027_META[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} title ${seoTitle.length}: ${seoTitle}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${locale} description ${seoDescription.length}: ${seoDescription}`);
    assert.ok(excerpt.length > 30 && excerpt.length <= 200, `${locale} excerpt ${excerpt.length}`);
    assert.match(seoTitle, start[locale]);
    assert.match(title, start[locale]);
    assert.match(seoDescription, best[locale]);
    assert.ok(seoDescription.includes(String(BRIDGE_COUNT)), locale);
  }
});

test("internal links stay in their language, end in a slash and point at a published path (or the Easter page)", () => {
  for (const locale of LOCALES) {
    let easter = 0;
    for (const match of json(locale).matchAll(/\]\((\/[^)]*)\)/g)) {
      const href = match[1] ?? "";
      assert.ok(href.startsWith(`/${locale}/`), `${locale} links to ${href}`);
      assert.ok(href.endsWith("/"), href);
      if (EASTER.has(href)) easter += 1;
      else assert.ok(PUBLISHED.has(href), `${locale}: ${href} is not a published path`);
    }
    assert.equal(easter, 1, `${locale}: one link to the Easter 2027 page`);
    // Each listed town links its own page (English: the towns that have one).
    if (locale !== "en") for (const t of localTowns()) assert.ok(json(locale).includes(`(/${locale}/${locale === "ca" ? "festius" : "festivos"}/${t.town.slug}/)`), `${locale}: ${t.town.slug}`);
  }
});

test("the three existing surfaces link here once: the work calendar, the December bridge and the holiday hubs", () => {
  for (const locale of LOCALES) {
    const href = `](${b2href("bridges2027", locale)})`;
    assert.equal(JSON.stringify(buildHolidayBody(locale)).split(href).length - 1, 1, `work calendar -> bridges ${locale}`);
    assert.equal(JSON.stringify(DECEMBER_BRIDGE.editions[locale].blocks).split(href).length - 1, 1, `December bridge -> bridges ${locale}`);
    assert.equal(GUIDES.bridges2027[locale], b2href("bridges2027", locale));
    const line = bridgesLine(locale);
    assert.ok(line.before.includes(String(BRIDGE_COUNT)), locale);
  }
  for (const locale of ["ca", "es"] as const) assert.deepEqual(hubCopy(locale).bridges, bridgesLine(locale));
  assert.deepEqual(englishHubCopy().bridges, bridgesLine("en"));
  assert.match(read("src/components/programmatic/holidays/HubPage.tsx"), /<Link href=\{GUIDES\.bridges2027\[locale\]\}>\{t\.bridges\.label\}<\/Link>/);
  assert.match(read("src/components/programmatic/holidays/EnglishHubPage.tsx"), /<Link href=\{GUIDES\.bridges2027\.en\}>\{t\.bridges\.label\}<\/Link>/);
  // The December line names no weekday next to a day number (that page reads every such pair as 2026).
  for (const locale of LOCALES) {
    const line = text(DECEMBER_BRIDGE.editions[locale].blocks).split(/(?<=\.)\s/).find((s) => s.includes("2027") && /ponts 2027|puentes 2027|long weekends 2027/.test(s));
    assert.ok(line, locale);
    assert.match(line, /6 (de desembre|de diciembre|December)/, locale);
    assert.match(line, /5 (dies|días|days)/, locale);
  }
});

test("the publish route has a ponts-2027 group and a one-off group for the pages that link here", () => {
  const route = read("src/app/api/admin/publish/route.ts");
  assert.match(route, /import \{ BRIDGES_2027 \} from "@\/lib\/content\/batch02\/bridges-2027";/);
  assert.match(route, /wants\("ponts-2027"\)\) published\.push\(await publishB2Article\(BRIDGES_2027\)\)/);
  assert.match(route, /wants\("ponts-2027-links"\)\) published\.push\(await publishB2Article\(DECEMBER_BRIDGE\), await publishHolidayGuide\(\)\)/);
});

test("the hero is the holiday guide's Sant Joan photograph with its exact alt and caption, and no body image", () => {
  assert.equal(BRIDGES_2027.heroKey, SANT_JOAN_IMAGE.key);
  assert.ok(IMAGE_BY_KEY.has(SANT_JOAN_IMAGE.key));
  assert.deepEqual(BRIDGES_2027.heroAlt, SANT_JOAN_IMAGE.alt);
  assert.deepEqual(BRIDGES_2027.heroCaption, SANT_JOAN_IMAGE.caption);
  // The guide sends the same words for the same file.
  const guide = read("src/lib/content/holidays/publish.ts");
  assert.match(guide, /const SECOND_ALT = SANT_JOAN_IMAGE\.alt;/);
  assert.match(guide, /const SECOND_CAPTION = SANT_JOAN_IMAGE\.caption;/);
  assert.equal(BRIDGES_2027.secondaryKey, undefined);
  for (const locale of LOCALES) assert.ok(!BRIDGES_2027.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
});

test("sources are https, include the order, the school order and each listed town's council page", () => {
  const urls = BRIDGES_2027.sources.map((s) => s.url);
  for (const url of urls) {
    assert.match(url, /^https:\/\//, url);
    assert.ok(!/[?&]utm_/.test(url), url);
  }
  assert.equal(new Set(urls).size, urls.length, "a source is listed twice");
  assert.ok(urls.includes(HOLIDAY_SOURCES[0]!.url), "Ordre EMT/52/2026");
  assert.ok(BRIDGES_2027.sources.some((s) => s.name.startsWith("Ordre EDF/66/2026")), "school order");
  assert.ok(!BRIDGES_2027.sources.some((s) => s.name.startsWith("Ordre EMT/66/2025")), "the 2026 order is not this page's source");
  for (const t of localTowns()) if (t.source) assert.ok(urls.includes(t.source.url), t.town.slug);
  assert.equal(BRIDGES_VERIFIED, "2026-10-30");
  for (const locale of LOCALES) assert.match(body(locale), /30 (d'octubre|de octubre|October) (de )?2026/, locale);
});

/* -------------------------------------------------------------------------- */
/* What the page says                                                         */
/* -------------------------------------------------------------------------- */

test("the lead answers: the count, the leave-free long weekends, the lost Saturdays and the best day of leave", () => {
  const must: Record<Locale, RegExp[]> = {
    ca: [/hi ha 8 ponts/, /4 caps de setmana llargs sense demanar cap dia/, /3 dels 12 festius cauen en dissabte/, /el dimarts 7 de desembre: 5 dies seguits/],
    es: [/hay 8 puentes/, /4 fines de semana largos sin pedir ningún día/, /3 de los 12 festivos caen en sábado/, /el martes 7 de diciembre: 5 días seguidos/],
    en: [/8 long weekends/, /4 that need no leave/, /3 of the 12 public holidays fall on a Saturday/, /Tuesday 7 December: 5 days in a row/],
  };
  for (const locale of LOCALES) {
    const leadText = text(BRIDGES_2027.editions[locale].blocks.slice(0, 1));
    for (const pattern of must[locale]) assert.match(leadText, pattern, `${locale}: ${pattern}`);
  }
});

test("the answer table prints each holiday's weekday, type, leave and run from the plans", () => {
  const ca = holidayRows("ca");
  // Each day links to its "is it a holiday?" page (tranche 4 of the date pages, 2 Nov 2026).
  assert.deepEqual(ca[1], ["Reis", "[Dimecres 6 de gener](/ca/festius/dia/6-gener-2027/)", "Pont de dimecres", "Dilluns 4 i dimarts 5 de gener", "6 dies: del divendres 1 al dimecres 6 de gener (també és festiu: Cap d'Any)"]);
  assert.deepEqual(ca[10], ["La Immaculada", "[Dimecres 8 de desembre](/ca/festius/dia/8-desembre-2027/)", "Pont de dimecres", "Dimarts 7 de desembre", "5 dies: del dissabte 4 al dimecres 8 de desembre (també és festiu: Dia de la Constitució)"]);
  assert.deepEqual(ca[4], ["Festa del Treball", "[Dissabte 1 de maig](/ca/festius/dia/1-maig-2027/)", "Perdut: cau en dissabte", "—", "—"]);
  assert.deepEqual(holidayRows("en")[5], ["Sant Joan (St John's Day)", "[Thursday 24 June](/en/holidays/day/24-june-2027/)", "One-day bridge", "Friday 25 June", "4 days: Thursday 24 to Sunday 27 June"]);
  assert.deepEqual(holidayRows("es")[7], ["Fiesta Nacional de España", "[Martes 12 de octubre](/es/festivos/dia/12-octubre-2027/)", "Puente de un día", "Lunes 11 de octubre", "4 días: del sábado 9 al martes 12 de octubre"]);
  // One link per row, to the row's own date.
  for (const locale of ["ca", "es", "en"] as const) {
    holidayRows(locale).forEach((row, i) => {
      const iso = REGIONAL_DATES[i]!;
      assert.equal(row.join(" ").match(/\]\(/g)?.length, 1, `${locale} row ${i}`);
      assert.ok(row[1]!.endsWith(`](${datePath(locale, iso)})`), `${locale} ${iso}: ${row[1]}`);
    });
  }
});

test("every weekday printed with a full date matches the 2027 calendar", () => {
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
    const plain = body(locale).toLowerCase();
    const sep = locale === "en" ? " " : " d(?:e |')";
    const pattern = new RegExp(`\\b(${weekdays[locale].join("|")}),? (\\d{1,2})${sep}(${months[locale].join("|")})\\b`, "gu");
    for (const match of plain.matchAll(pattern)) {
      const month = months[locale].indexOf(match[3]!) + 1;
      const iso = `2027-${String(month).padStart(2, "0")}-${match[2]!.padStart(2, "0")}`;
      assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${locale}: "${match[0]}"`);
      checked += 1;
    }
  }
  assert.ok(checked > 100, `only ${checked} weekday mentions checked`);
});

test("local days: Barcelona's are official, the others pending, and the full list comes with the DOGC order in December", () => {
  const must: Record<Locale, RegExp[]> = {
    ca: [/la llista completa de tots els municipis arriba amb l'ordre del DOGC/, /al desembre/, /17 de desembre de 2025/, /31 de desembre de 2024/, /dilluns 17 de maig/, /divendres 24 de setembre/],
    es: [/la lista completa de todos los municipios llega con la orden del DOGC/, /en diciembre/, /17 de diciembre de 2025/, /31 de diciembre de 2024/, /lunes 17 de mayo/, /viernes 24 de septiembre/],
    en: [/the full list for every town comes with the DOGC order/, /in December/, /17 December 2025/, /31 December 2024/, /Monday 17 May/, /Friday 24 September/],
  };
  for (const locale of LOCALES) {
    for (const pattern of must[locale]) assert.match(body(locale), pattern, `${locale}: ${pattern}`);
    // The order has come out between 2 and 31 December in recent years: never "mid-December".
    assert.doesNotMatch(body(locale), /mitjan desembre|mediados de diciembre|mid-December/i, locale);
  }
});

test("school: only what the order fixes, and free-choice days left to each school", () => {
  const current = SCHOOL_YEARS.find((y) => y.label === "2026-2027")!;
  // The school Easter break is exactly the ten-day run four days of leave buy.
  assert.ok(BEST_USE[3]!.runs.some((r) => r.from === current.easter[0] && r.to === current.easter[1]));
  const must: Record<Locale, RegExp[]> = {
    ca: [/EDF\/66\/2026/, /del 20 al 29 de març/, /quatre dies de lliure disposició/, /depèn de cada escola/, /Varien d'una escola i d'un municipi a l'altre/],
    es: [/EDF\/66\/2026/, /del 20 al 29 de marzo/, /cuatro días de libre disposición/, /depende de cada colegio/, /Varían de un colegio y de un municipio a otro/],
    en: [/EDF\/66\/2026/, /20 to 29 March/, /four free-choice days/, /depends on each school/, /vary from school to school and town to town/],
  };
  for (const locale of LOCALES) for (const pattern of must[locale]) assert.match(body(locale), pattern, `${locale}: ${pattern}`);
});

test("Easter is brief and links to the Easter 2027 page", () => {
  for (const locale of LOCALES) {
    const blocks = BRIDGES_2027.editions[locale].blocks;
    const at = blocks.findIndex((b) => b.type === "heading" && /Setmana Santa 2027|Semana Santa 2027|Easter 2027/.test((b as { text: string }).text));
    assert.ok(at > 0, locale);
    assert.equal(blocks[at + 1]?.type, "paragraph", locale);
    assert.equal(blocks[at + 2]?.type, "heading", `${locale}: one paragraph only`);
    assert.ok(JSON.stringify(blocks[at + 1]).includes(`(/${locale}/${EASTER_2027_PATHS[locale]}/)`), locale);
  }
});

/* -------------------------------------------------------------------------- */
/* Holidays on a Saturday: are they made up for?                              */
/* -------------------------------------------------------------------------- */

test("Saturday holidays: the compensation note under the table, the question after the Saturday one, with an anchor the work calendar links to", () => {
  assert.deepEqual(LOST_SATURDAYS.map((p) => p.date), ["2027-05-01", "2027-09-11", "2027-12-25"]);
  const facts: Record<Locale, RegExp[]> = {
    ca: [/19 de maig de 2026/, /contact center/, /dilluns a divendres/, /14 dies/, /Tribunal Suprem no ha fixat cap regla per a tothom/, /conveni/, /sindicat o a un assessor laboral/],
    es: [/19 de mayo de 2026/, /contact center/, /lunes a viernes/, /14 días/, /Tribunal Supremo no ha fijado una regla para todos/, /convenio/, /sindicato o a un asesor laboral/],
    en: [/19 May 2026/, /contact-centre/, /Monday-to-Friday/, /14 days/, /Supreme Court has set no rule for everyone/, /collective agreement/, /union or a labour adviser/],
  };
  for (const locale of LOCALES) {
    const blocks = BRIDGES_2027.editions[locale].blocks;
    // The plain sentence comes right after the answer table, whose rows say "lost: falls on a Saturday".
    const table = blocks.findIndex((b) => b.type === "table");
    assert.deepEqual(blocks[table + 1], { type: "paragraph", text: saturdayNote(locale, "many") }, locale);
    assert.match(saturdayNote(locale, "many"), /Audiencia Nacional|National High Court/, locale);
    assert.match(saturdayNote(locale, "many"), /2026/, locale);
    // The question follows the one listing the Saturday holidays, with its anchor.
    const faqBlock = blocks.find((b) => b.type === "faq") as { items: { question: string; answer: string; id?: string }[] };
    const at = faqBlock.items.findIndex((i) => i.id === SATURDAY_FAQ_ID[locale]);
    assert.ok(at > 0, `${locale}: no question with the anchor`);
    assert.match(faqBlock.items[at - 1]!.question, /dissabte|sábado|Saturday/, locale);
    assert.equal(faqBlock.items[at]!.question, saturdayQuestion(locale));
    assert.equal(faqBlock.items[at]!.answer, saturdayAnswer(locale));
    for (const pattern of facts[locale]) assert.match(saturdayAnswer(locale), pattern, `${locale}: ${pattern}`);
    // Only that question carries an id, and only once.
    assert.equal(faqBlock.items.filter((i) => i.id).length, 1, locale);
    // The work calendar guide links to that anchor, in its Saturday section, besides its one link to the page itself.
    const guide = JSON.stringify(buildHolidayBody(locale));
    assert.equal(guide.split(`](${b2href("bridges2027", locale)}#${SATURDAY_FAQ_ID[locale]})`).length - 1, 1, `${locale}: work calendar -> the Saturday question`);
  }
  // The anchor reaches the HTML: FAQ items keep an optional id, safe as an attribute, and the renderer prints it.
  const faqWith = (id: string) => bodySchema.safeParse([{ type: "faq", items: [{ question: "Q?", answer: "A.", id }] }]).success;
  assert.ok(faqWith("saturday-holiday-compensation"));
  assert.ok(!faqWith("Not An Id") && !faqWith('x" onclick="y'));
  assert.match(read("src/components/blocks/BlockRenderer.tsx"), /<div key=\{i\} id=\{item\.id\}/);
  // The question as the brief words it, the way people search it.
  assert.equal(saturdayQuestion("ca"), "Si treballes de dilluns a divendres, et compensen el festiu que cau en dissabte?");
  assert.equal(saturdayQuestion("es"), "¿Se compensa el festivo que cae en sábado?");
  assert.equal(saturdayQuestion("en"), "Is a Saturday holiday made up for?");
});

test("Saturday holidays: the judgment on CENDOJ and its BOE commentary are sources, with CENDOJ's ECLI", () => {
  const urls = BRIDGES_2027.sources.map((s) => s.url);
  assert.ok(urls.includes(SATURDAY_RULING.url), "CENDOJ");
  assert.ok(urls.includes(SATURDAY_COMMENTARY_URL), "BOE commentary");
  assert.match(SATURDAY_RULING.url, /^https:\/\/www\.poderjudicial\.es\/search\/AN\/openDocument\//);
  assert.match(SATURDAY_COMMENTARY_URL, /^https:\/\/www\.boe\.es\/biblioteca_juridica\/.*ANU-L-2026-00000003480$/);
  // CENDOJ's identifiers. The BOE commentary prints "ECLI:ES:AN:2026:191", which CENDOJ gives to another case.
  assert.equal(SATURDAY_RULING.ecli, "ECLI:ES:AN:2026:1912");
  assert.equal(SATURDAY_RULING.roj, "SAN 1912/2026");
  assert.equal(SATURDAY_RULING.number, "88/2026");
  assert.equal(SATURDAY_RULING.date, "2026-05-19");
  for (const s of SATURDAY_SOURCES) {
    assert.ok(s.name.length <= 240, `${s.name.length}: sources.name is varchar(240)`);
    assert.ok(s.publisher.length <= 240, s.publisher);
    assert.doesNotMatch(s.name, /AN:2026:191(?!\d)/, s.name);
  }
  // Read on the day the copy was written; the page's own verified date stays the oldest of its data.
  assert.equal(SATURDAY_RULING_READ, "2026-11-02");
  assert.ok(BRIDGES_VERIFIED <= SATURDAY_RULING_READ);
});

/* -------------------------------------------------------------------------- */
/* No clock                                                                   */
/* -------------------------------------------------------------------------- */

test("no clock: the modules never read the date, the body is the same on every build, and only static blocks are used", () => {
  for (const path of ["src/lib/content/batch02/bridges-2027.ts", "src/lib/content/holidays/bridges.ts", "src/lib/content/holidays/saturday.ts"]) {
    const source = read(path);
    assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(|todayInCatalonia|madridDate/, `${path} reads the clock`);
  }
  const STATIC = new Set(["paragraph", "heading", "keyFacts", "callout", "table", "list", "faq"]);
  for (const locale of LOCALES) {
    assert.equal(JSON.stringify(buildBridgesBody(locale)), json(locale), locale);
    for (const block of BRIDGES_2027.editions[locale].blocks) assert.ok(STATIC.has(block.type), `${locale}: ${block.type} renders live`);
  }
  // The hub sentence is computed from the same dates, not from today.
  assert.doesNotMatch(read("src/lib/programmatic/holidays/copy.ts").slice(read("src/lib/programmatic/holidays/copy.ts").indexOf("export function bridgesLine"), read("src/lib/programmatic/holidays/copy.ts").indexOf("export function hubCopy")), /new Date|Date\.now|today/);
});
