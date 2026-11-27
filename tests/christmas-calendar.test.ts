import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import type { Block } from "../src/lib/content/blocks.ts";
import { CALENDAR_FAIRS, CHRISTMAS, FAMILY, SAGRADA_2026, SANTA_LLUCIA_2026 } from "../src/lib/content/batch02/christmas.ts";
import { CHRISTMAS_BARCELONA } from "../src/lib/content/batch02/christmas-barcelona.ts";
import {
  BACK_TO_SCHOOL,
  CALENDAR_HOLIDAYS,
  CALENDAR_ROLL_BY,
  CALENDAR_SPAN,
  calendarDayLabel,
  calendarFaq,
  calendarRows,
  christmasCalendar,
  lastShopSunday,
  shopDays,
  type CalendarScope,
} from "../src/lib/content/batch02/christmas-calendar.ts";
import { calendarLine } from "../src/lib/content/batch02/christmas-season-links.ts";
import { BRIDGE_DAYS, DECEMBER_BRIDGE, LOCAL_MONDAY_7, SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import { ANNOUNCED_2026, DAYS, dayDate } from "../src/lib/content/batch02/festive.ts";
import { GROSSA, GROSSA_DRAW_DATE } from "../src/lib/content/batch02/grossa.ts";
import { NADAL_DRAW_DATE } from "../src/lib/content/batch02/loteria-nadal.ts";
import { MARATO, MARATO_GUIDE } from "../src/lib/content/batch02/marato.ts";
import { PARADE_DAY, REIS, REIS_DAY } from "../src/lib/content/batch02/reis.ts";
import { B2_PATHS, b2href, type B2Article } from "../src/lib/content/batch02/shared.ts";
import { DEFAULT_DECEMBER_2026, LAW_CLOSING, WORKING_ASKED } from "../src/lib/content/batch02/shops-christmas.ts";
import { madridDate } from "../src/lib/content/batch02/strikes.ts";
import { WINTER_SALES, WINTER_SALES_GUIDE } from "../src/lib/content/batch02/winter-sales.ts";
import { holidayOn, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { SCHOOL_SOURCE, SCHOOL_YEARS } from "../src/lib/content/school/calendar.ts";
import { buildBody as buildSchoolBody } from "../src/lib/content/school/publish.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { christmasFairsPaths } from "../src/lib/programmatic/christmas-fairs/sitemap.ts";
import { municipalityBySlug } from "../src/lib/programmatic/holidays/data.ts";

/**
 * 27 Nov 2026 (batch 8M, Christmas hub): the season calendar the Christmas
 * markets guide and the Christmas in Barcelona guide open their hub section
 * with. Every date comes from the module that owns it; every link goes to a
 * published page in the same language; the seasonal pages link back.
 */

const SCOPES: readonly CalendarScope[] = ["catalonia", "barcelona"];
const BCN_FAIRS = { ...CALENDAR_FAIRS, sagrada: { start: SAGRADA_2026.start, end: SAGRADA_2026.end } };
const fairsFor = (scope: CalendarScope) => (scope === "barcelona" ? BCN_FAIRS : CALENDAR_FAIRS);
const json = (blocks: readonly unknown[]) => JSON.stringify(blocks);
const day = (iso: string, locale: Locale) => dayDate(iso, locale, false);

const PUBLISHED = new Set([
  ...[...Object.values(B2_PATHS), ...Object.values(SIBLING_PATHS)].flatMap((paths) => LOCALES.map((locale) => `/${locale}/${paths[locale]}/`)),
  ...christmasFairsPaths().map((p) => p.path),
]);

test("the calendar's dates are the source modules' dates", () => {
  const school = SCHOOL_YEARS.find((y) => y.label === "2026-2027")!;
  assert.deepEqual(CALENDAR_SPAN, { from: "2026-12-01", to: school.christmas[1] });
  assert.equal(school.christmas[0], BRIDGE_DAYS.schoolChristmasFrom);
  assert.equal(BACK_TO_SCHOOL, "2027-01-08");
  assert.equal(holidayOn(BACK_TO_SCHOOL), null, "back to school on a working day");
  assert.equal(weekdayIndex(BACK_TO_SCHOOL), 5);
  // Ordre EMT/66/2025 and Ordre EMT/52/2026, through the holiday engine.
  assert.deepEqual([...CALENDAR_HOLIDAYS], ["2026-12-08", "2026-12-25", "2026-12-26", "2027-01-01", "2027-01-06"]);
  assert.deepEqual([DAYS.christmas, DAYS.santEsteve, DAYS.newYear, REIS_DAY], [...LAW_CLOSING]);
  for (const iso of WORKING_ASKED) assert.equal(holidayOn(iso), null, iso);
  assert.equal(holidayOn(BRIDGE_DAYS.constitution), null, "6 December is not a Catalonia holiday in 2026");
  // Shops: the default list and Barcelona's own both make 20 December the last Sunday before Christmas.
  for (const scope of SCOPES) assert.equal(lastShopSunday(scope), "2026-12-20", scope);
  assert.ok((DEFAULT_DECEMBER_2026 as readonly string[]).includes("2026-12-20"));
  assert.ok(municipalityBySlug("barcelona")!.shops.includes("2026-12-20"));
  assert.deepEqual(shopDays("catalonia"), ["2026-12-06", "2026-12-08", "2026-12-13", "2026-12-20", "2026-12-27"]);
  assert.equal(WINTER_SALES.firstSunday, "2027-01-03");
  assert.equal(PARADE_DAY, "2027-01-05");
  assert.equal(GROSSA_DRAW_DATE, DAYS.newYearsEve);
  assert.equal(NADAL_DRAW_DATE, "2026-12-22");
  assert.equal(MARATO.date, BRIDGE_DAYS.marato);
});

test("each row prints its date from the module, in every language and both scopes", () => {
  const lights = ANNOUNCED_2026.lightsSwitchOn!;
  for (const scope of SCOPES) {
    for (const locale of LOCALES) {
      const rows = calendarRows(locale, scope, fairsFor(scope));
      const labels = rows.map((r) => r[0]);
      const expected = [
        calendarDayLabel(lights.date, lights.until, locale),
        calendarDayLabel(SANTA_LLUCIA_2026.from, SANTA_LLUCIA_2026.to, locale),
        calendarDayLabel(BRIDGE_DAYS.saturday, BRIDGE_DAYS.immaculada, locale),
        calendarDayLabel(MARATO.date, undefined, locale),
        calendarDayLabel(lastShopSunday(scope), undefined, locale),
        calendarDayLabel(BRIDGE_DAYS.schoolChristmasFrom, CALENDAR_SPAN.to, locale),
        calendarDayLabel(NADAL_DRAW_DATE, undefined, locale),
        calendarDayLabel(DAYS.christmasEve, undefined, locale),
        calendarDayLabel(DAYS.christmas, undefined, locale),
        calendarDayLabel(DAYS.santEsteve, undefined, locale),
        calendarDayLabel(GROSSA_DRAW_DATE, undefined, locale),
        calendarDayLabel(DAYS.newYear, undefined, locale),
        calendarDayLabel(WINTER_SALES.firstSunday, undefined, locale),
        calendarDayLabel(PARADE_DAY, REIS_DAY, locale),
      ];
      for (const label of expected) assert.ok(labels.includes(label), `${scope}/${locale}: no row "${label}"`);
      // Date order.
      assert.equal(rows.length, scope === "catalonia" ? expected.length + 1 : expected.length, `${scope}/${locale}: Tortosa's 4 Dec switch-on is the only extra row`);
      // Each row links the page that answers it.
      for (const [label, text] of rows) assert.match(text!, /\]\(\/(ca|es|en)\//, `${scope}/${locale} ${label}: no link`);
    }
  }
  assert.equal(calendarDayLabel("2026-12-05", "2026-12-08", "ca"), "Del dissabte 5 al dimarts 8 de desembre");
  assert.equal(calendarDayLabel("2026-12-22", "2027-01-07", "es"), "Del martes 22 de diciembre al jueves 7 de enero de 2027");
  assert.equal(calendarDayLabel("2026-12-20", undefined, "en"), "Sunday 20 December");
});

test("the rows state what the sources say: holiday or working day, Aran, Monday 7, the school order", () => {
  const ca = calendarRows("ca", "catalonia", CALENDAR_FAIRS).map((r) => r[1]).join("\n");
  assert.match(ca, /\*\*Nit de Nadal\*\*: dia feiner, no és festiu/);
  assert.match(ca, /\*\*Sant Esteve\*\*, festiu a Catalunya \(a l'Aran és feiner: el substitueix la Festa d'Aran, el 17 de juny\)/);
  assert.match(ca, new RegExp(`el dilluns 7 només és festiu local a ${LOCAL_MONDAY_7.municipalities} municipis`));
  assert.match(ca, new RegExp(`hi ha ${FAMILY.fairs} fires de Nadal a ${FAMILY.towns} municipis`));
  assert.ok(ca.includes(`](${SCHOOL_SOURCE.url})`), "the school order is linked");
  assert.match(ca, /es torna a classe el divendres 8 de gener/);
  const bcn = calendarRows("ca", "barcelona", BCN_FAIRS).map((r) => r[1]).join("\n");
  assert.match(bcn, /a Barcelona el dilluns 7 és feiner/);
  assert.ok(!municipalityBySlug("barcelona")!.local.includes(BRIDGE_DAYS.monday));
  assert.ok(bcn.includes(day(SAGRADA_2026.start, "ca")), "the Sagrada Família fair's own start");
  // No clock time the calendar cannot stand behind: the only times are Tortosa's, from its council.
  assert.doesNotMatch(bcn, /\d{1,2}:\d{2}/);
});

test("every link in the calendar and its FAQ goes to a published page in the same language (or the school order)", () => {
  for (const scope of SCOPES) {
    for (const locale of LOCALES) {
      const text = json(christmasCalendar(locale, scope, fairsFor(scope)));
      const hrefs = [...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]!);
      assert.ok(hrefs.length >= 14, `${scope}/${locale}: ${hrefs.length} links`);
      for (const href of hrefs) {
        if (href === SCHOOL_SOURCE.url) continue;
        assert.ok(href.startsWith(`/${locale}/`) && href.endsWith("/"), `${scope}/${locale}: ${href}`);
        assert.ok(PUBLISHED.has(href), `${scope}/${locale}: ${href} is not a published path`);
      }
      for (const item of calendarFaq(locale, scope)) assert.doesNotMatch(item.answer, /\]\(|\*\*/, `${scope}/${locale}: plain FAQ answer`);
    }
  }
});

function sectionAt(article: B2Article, locale: Locale): { heading: number; table: number; faq: number } {
  const blocks = article.editions[locale].blocks as Block[];
  const heading = blocks.findIndex((b) => b.type === "heading" && /^(Nadal 2026|Navidad 2026|Christmas 2026)/.test((b as { text: string }).text));
  return { heading, table: heading + 2, faq: blocks.findIndex((b) => b.type === "faq") };
}

test("both hub pages carry the calendar under its own H2, before the FAQ, and the calendar's questions in the FAQ", () => {
  for (const [article, scope] of [[CHRISTMAS, "catalonia"], [CHRISTMAS_BARCELONA, "barcelona"]] as const) {
    for (const locale of LOCALES) {
      const blocks = article.editions[locale].blocks as Block[];
      const at = sectionAt(article, locale);
      assert.ok(at.heading > 0, `${article.key}/${locale}: no calendar heading`);
      assert.equal(blocks[at.table]!.type, "table", `${article.key}/${locale}`);
      assert.ok(at.table < at.faq, `${article.key}/${locale}: calendar before the FAQ`);
      const faq = json([blocks[at.faq]]);
      for (const item of calendarFaq(locale, scope)) assert.ok(faq.includes(JSON.stringify(item.question)), `${article.key}/${locale}: ${item.question}`);
    }
  }
});

test("the Barcelona guide keeps one link to La Marató and one to the traditions guide", () => {
  for (const locale of LOCALES) {
    const text = json(CHRISTMAS_BARCELONA.editions[locale].blocks);
    assert.equal(text.split(`](${b2href("marato", locale)})`).length - 1, 1, locale);
    assert.equal(text.split(`](${b2href("christmasTraditions", locale)})`).length - 1, 1, locale);
  }
});

test("the seasonal pages link the hub with the season's words, once, in the body", () => {
  for (const article of [DECEMBER_BRIDGE, MARATO_GUIDE, REIS, WINTER_SALES_GUIDE, GROSSA]) {
    for (const locale of LOCALES) {
      const blocks = article.editions[locale].blocks as Block[];
      const line = calendarLine(locale);
      const at = blocks.findIndex((b) => b.type === "paragraph" && (b as { text: string }).text === line);
      assert.ok(at > 0, `${article.key}/${locale}: no calendar line`);
      assert.ok(at < blocks.findIndex((b) => b.type === "faq"), `${article.key}/${locale}: in the body, before the FAQ`);
      assert.equal(json(blocks).split(line.replace(/"/g, '\\"')).length - 1, 1, `${article.key}/${locale}: once`);
    }
  }
  assert.match(calendarLine("ca"), /^Tot el Nadal en una taula, \[calendari de Nadal 2026 a Catalunya\]\(\/ca\/tradicions\/mercats-de-nadal-catalunya\/\)/);
  assert.match(calendarLine("es"), /\[calendario de Navidad 2026 en Cataluña\]\(\/es\/tradiciones\/mercados-navidad-cataluna\/\)/);
  assert.match(calendarLine("en"), /\[Christmas 2026 in Catalonia, day by day\]\(\/en\/traditions\/christmas-markets-catalonia\/\)/);
  for (const locale of LOCALES) assert.doesNotMatch(calendarLine(locale).split("/):")[1] ?? "", /\d/, `${locale}: the gloss carries no date`);
});

test("the school calendar page links the hub while it shows the 2026-2027 course", () => {
  const today = madridDate(new Date());
  if (today > CALENDAR_SPAN.to) return;
  for (const locale of LOCALES) assert.ok(json(buildSchoolBody(locale)).includes(calendarLine(locale).replace(/"/g, '\\"')), locale);
});

test("the module reads no clock", () => {
  const source = readFileSync(new URL("../src/lib/content/batch02/christmas-calendar.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(|todayInCatalonia\(/);
});

test("date guard: the calendar is rewritten for the next season or removed once this one is over", () => {
  const today = madridDate(new Date());
  assert.equal(CALENDAR_ROLL_BY, "2027-01-09");
  assert.ok(
    today < CALENDAR_ROLL_BY,
    `On ${today} the Christmas calendar (src/lib/content/batch02/christmas-calendar.ts) still describes 1 Dec 2026 - 7 Jan 2027. Roll it to the next season from each source module (holidays, shop days, school order, draws, parade) or take christmasCalendar/calendarFaq out of christmas.ts and christmas-barcelona.ts, drop the calendarLine paragraphs (december-bridge, marato, reis, winter-sales, grossa, school/publish), then republish groups christmas and christmas-bcn.`,
  );
});
