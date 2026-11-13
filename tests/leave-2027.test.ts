import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { buildBridgesBody } from "../src/lib/content/batch02/bridges-2027.ts";
import { municipalities, nextYearPublished, regionalDays } from "../src/lib/programmatic/holidays/data.ts";
import { ROUTE } from "../src/lib/programmatic/holidays/paths.ts";
import {
  CATALONIA_ID,
  DEFAULT_LEAVE,
  DEFAULT_PLACE,
  LEAVE_LOCALES,
  LEAVE_SLUG,
  MIN_GAP_WORDS,
  PLANNER_COPY,
  leaveEditions,
  leaveLinkFor,
  leavePath,
  rangeText,
  ratioText,
} from "../src/lib/programmatic/leave-2027/copy.ts";
import { MAX_LEAVE, MIN_GAP, isWeekendDay, leaveCalendar, longestBreak, planLeave, type Break, type LeaveInput, type LeavePlan } from "../src/lib/programmatic/leave-2027/optimizer.ts";
import { itemHolidays, itemPage, leaveSitemapEntries, plannerData, plannerPlace, townDays } from "../src/lib/programmatic/leave-2027/places.ts";
import { addDays } from "../src/lib/programmatic/holidays/format.ts";
import { CITIES, localDays } from "../src/lib/programmatic/spain-2027/cities.ts";
import { COMMUNITIES } from "../src/lib/programmatic/spain-2027/communities.ts";
import { editionNames } from "../src/lib/programmatic/spain-2027/editions.ts";

/**
 * The 2027 leave planner ("Com aprofitar les vacances el 2027",
 * lib/programmatic/leave-2027/): the optimizer on known 2027 cases, its
 * invariants on every kind of place, the data it is handed, and its pages.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");

const YEAR = 2027;
const CATALONIA = regionalDays(YEAR).map((d) => d.date);
const plan = (leave: number, holidays: readonly string[] = CATALONIA, workSaturdays = false) => planLeave({ year: YEAR, holidays, leave, workSaturdays });
const spans = (p: LeavePlan) => p.byDate.map((b) => [b.from, b.to, b.days, b.take.join(" ")]);

/* -------------------------------------------------------------------------- */
/* Known 2027 cases (Catalonia-wide days, Ordre EMT/52/2026)                   */
/* -------------------------------------------------------------------------- */

test("optimizer: the December bridge, 6–8 December 2027 (Monday and Wednesday holidays), takes Tuesday 7 only", () => {
  // The two holidays alone: one day of leave gives Saturday 4 to Wednesday 8.
  const alone = plan(1, ["2027-12-06", "2027-12-08"]);
  assert.deepEqual(spans(alone), [["2027-12-04", "2027-12-08", 5, "2027-12-07"]]);
  assert.equal(alone.ratio, 5);
  assert.deepEqual(alone.breaks[0]!.holidays, ["2027-12-06", "2027-12-08"]);
  // With every Catalonia-wide day, two days of leave buy both five-day bridges: Easter and December.
  assert.deepEqual(spans(plan(2)), [
    ["2027-03-25", "2027-03-29", 5, "2027-03-25"],
    ["2027-12-04", "2027-12-08", 5, "2027-12-07"],
  ]);
  // Three days in one block: 7, 9 and 10 December give nine days in a row, 4 to 12 December.
  const block = longestBreak({ year: YEAR, holidays: CATALONIA, leave: 3 });
  assert.deepEqual(block && [block.from, block.to, block.days, block.take], ["2027-12-04", "2027-12-12", 9, ["2027-12-07", "2027-12-09", "2027-12-10"]]);
});

test("optimizer: 5 days with the Catalonia-wide days give 22 days off in five bridges", () => {
  const p = plan(5);
  assert.equal(p.used, 5);
  assert.equal(p.daysOff, 22);
  assert.deepEqual(spans(p), [
    ["2027-01-01", "2027-01-04", 4, "2027-01-04"],
    ["2027-03-25", "2027-03-29", 5, "2027-03-25"],
    ["2027-06-24", "2027-06-27", 4, "2027-06-25"],
    ["2027-10-09", "2027-10-12", 4, "2027-10-11"],
    ["2027-12-04", "2027-12-08", 5, "2027-12-07"],
  ]);
  // Ranked by days off per day of leave, then the longer, then the earlier.
  assert.deepEqual(
    p.breaks.map((b) => b.from),
    ["2027-03-25", "2027-12-04", "2027-01-01", "2027-06-24", "2027-10-09"],
  );
});

test("optimizer: ties are broken the same way every time (earlier leave first), whatever the input order", () => {
  // Maundy Thursday (25 March) and 7 December both give five days for one: the earlier wins.
  assert.deepEqual(spans(plan(1)), [["2027-03-25", "2027-03-29", 5, "2027-03-25"]]);
  const shuffled = [...CATALONIA].reverse();
  for (const leave of [1, 3, 7, 12, 25]) {
    assert.deepEqual(plan(leave, shuffled), plan(leave));
    assert.deepEqual(plan(leave), plan(leave));
  }
  // Holidays outside the year and duplicates change nothing.
  assert.deepEqual(plan(6, [...CATALONIA, ...CATALONIA, "2026-12-08", "2028-01-06"]), plan(6));
});

test("optimizer: a holiday on a Saturday anchors nothing in a Monday-to-Friday week, and does for Saturday workers", () => {
  const saturdays = CATALONIA.filter((d) => new Date(`${d}T12:00:00Z`).getUTCDay() === 6);
  assert.deepEqual(saturdays, ["2027-05-01", "2027-09-11", "2027-12-25"]);
  assert.deepEqual(plan(5, saturdays).breaks, []);
  const sat = plan(3, saturdays, true);
  assert.equal(sat.used, 3);
  // Friday 30 April is booked: Friday to Sunday 2 May, 1 May a day off it would not otherwise be.
  assert.ok(sat.byDate.some((b) => b.from === "2027-04-30" && b.take.join() === "2027-04-30" && b.days === 3));
  // Saturday workers can be told to book a Saturday; others never.
  const satPlan = plan(10, CATALONIA, true);
  assert.ok(satPlan.byDate.flatMap((b) => b.take).some((d) => new Date(`${d}T12:00:00Z`).getUTCDay() === 6));
});

test("optimizer: no leave, or less than nothing, plans nothing; more than MAX_LEAVE is clamped", () => {
  assert.deepEqual(plan(0).breaks, []);
  assert.equal(plan(-3).used, 0);
  assert.equal(longestBreak({ year: YEAR, holidays: CATALONIA, leave: 0 }), null);
  assert.equal(plan(99).leave, MAX_LEAVE);
  assert.equal(plan(2.9).leave, 2);
});

/* -------------------------------------------------------------------------- */
/* Invariants, on every kind of place                                         */
/* -------------------------------------------------------------------------- */

function checkBreak(b: Break, input: LeaveInput, where: string) {
  const holidays = new Set(input.holidays);
  const off = (iso: string) => isWeekendDay(iso, input.workSaturdays) || (iso.startsWith(`${YEAR}-`) && holidays.has(iso));
  for (const day of b.take) {
    assert.ok(day.startsWith(`${YEAR}-`), `${where}: leave outside ${YEAR}: ${day}`);
    assert.ok(!holidays.has(day), `${where}: holiday booked as leave: ${day}`);
    assert.ok(!isWeekendDay(day, input.workSaturdays), `${where}: weekend day booked as leave: ${day}`);
  }
  // The run is unbroken and maximal: every day off or booked, and the days either side are working days.
  const booked = new Set(b.take);
  let count = 0;
  for (let d = b.from; d <= b.to; d = addDays(d, 1)) {
    assert.ok(off(d) || booked.has(d), `${where}: ${d} inside ${b.from}–${b.to} is neither off nor booked`);
    count += 1;
  }
  assert.equal(count, b.days, where);
  assert.ok(!off(addDays(b.from, -1)), `${where}: run could start earlier than ${b.from}`);
  assert.ok(!off(addDays(b.to, 1)), `${where}: run could end later than ${b.to}`);
  assert.ok(b.take.length > 0, `${where}: a break without leave`);
  // Built around a holiday on a working day.
  assert.ok(b.holidays.length > 0 && b.holidays.every((h) => holidays.has(h) && !isWeekendDay(h, input.workSaturdays)), `${where}: no holiday anchors ${b.from}`);
  assert.equal(b.ratio, b.days / b.take.length);
}

function checkPlan(input: LeaveInput, where: string) {
  const p = planLeave(input);
  assert.ok(p.used <= Math.min(input.leave, MAX_LEAVE), `${where}: books ${p.used} of ${input.leave}`);
  assert.equal(p.used, p.byDate.reduce((s, b) => s + b.take.length, 0), where);
  assert.equal(p.daysOff, p.byDate.reduce((s, b) => s + b.days, 0), where);
  const cal = leaveCalendar(YEAR, input.holidays, input.workSaturdays);
  for (let i = 0; i < p.byDate.length; i++) {
    checkBreak(p.byDate[i]!, input, where);
    if (i > 0) {
      const prev = p.byDate[i - 1]!;
      const between = cal.working.filter((d) => d > prev.to && d < p.byDate[i]!.from).length;
      assert.ok(between >= MIN_GAP, `${where}: only ${between} working days between ${prev.to} and ${p.byDate[i]!.from}`);
    }
  }
  for (let i = 1; i < p.breaks.length; i++) {
    const a = p.breaks[i - 1]!;
    const b = p.breaks[i]!;
    assert.ok(a.ratio > b.ratio || (a.ratio === b.ratio && (a.days > b.days || (a.days === b.days && a.from < b.from))), `${where}: ranking`);
  }
  const longest = longestBreak(input);
  if (longest) {
    for (const day of longest.take) assert.ok(!new Set(input.holidays).has(day) && !isWeekendDay(day, input.workSaturdays), `${where}: longest books ${day}`);
    for (const b of p.byDate) assert.ok(b.days <= longest.days, `${where}: a plan break longer than the longest`);
  }
  return p;
}

test("optimizer: never books a holiday or a weekend day, on every place, budget and option", () => {
  for (const locale of ["ca"] as const) {
    const data = plannerData(locale);
    const items = data.groups.flatMap((g) => g.items);
    // Every distinct holiday list among the places (with the council's days too): the plan depends on nothing else.
    const lists = new Map<string, { holidays: string[]; where: string }>();
    for (const item of items) {
      for (const withCouncil of item[6] === "c" ? [false, true] : [false]) {
        const holidays = itemHolidays(data, item, withCouncil);
        const key = holidays.join();
        if (!lists.has(key)) lists.set(key, { holidays, where: `${item[0]}${withCouncil ? " council" : ""}` });
      }
    }
    assert.ok(lists.size > 50, `${lists.size} holiday lists`);
    let i = 0;
    for (const { holidays, where } of lists.values()) {
      // Every list with a mid-size budget; a rotating sample with the extremes and Saturdays.
      const budgets = i % 6 === 0 ? [1, 4, 25] : i % 2 === 0 ? [9] : [];
      i += 1;
      for (const leave of budgets) {
        for (const workSaturdays of leave === 4 ? [false, true] : [false]) checkPlan({ year: YEAR, holidays, leave, workSaturdays }, `${where} ${leave}${workSaturdays ? " sat" : ""}`);
      }
    }
  }
});

/** Every set of anchored breaks within the budget, by brute force, for small budgets. */
function bruteForce(holidays: readonly string[], leave: number): number {
  const cal = leaveCalendar(YEAR, holidays);
  const w = cal.working;
  const off = (iso: string) => isWeekendDay(iso) || cal.holidays.has(iso);
  const blocks: { first: number; last: number; from: string; to: string; days: number }[] = [];
  for (let i = 0; i < w.length; i++) {
    for (let j = i; j < w.length && j - i < leave; j++) {
      let from = w[i]!;
      while (off(addDays(from, -1))) from = addDays(from, -1);
      let to = w[j]!;
      while (off(addDays(to, 1))) to = addDays(to, 1);
      if (!cal.effective.some((h) => h >= from && h <= to)) continue;
      const days = (Date.parse(to) - Date.parse(from)) / 86_400_000 + 1;
      blocks.push({ first: i, last: j, from, to, days });
    }
  }
  let best = 0;
  const walk = (start: number, budget: number, lastIndex: number, total: number) => {
    best = Math.max(best, total);
    for (let k = start; k < blocks.length; k++) {
      const b = blocks[k]!;
      const cost = b.last - b.first + 1;
      if (cost > budget || b.first - lastIndex - 1 < MIN_GAP) continue;
      walk(k + 1, budget - cost, b.last, total + b.days);
    }
  };
  blocks.sort((a, b) => a.first - b.first);
  walk(0, leave, -MIN_GAP - 1, 0);
  return best;
}

test("optimizer: the plan matches a brute-force search for budgets of 1 to 3 days", () => {
  const places = [CATALONIA, [...CATALONIA, "2027-05-17", "2027-09-24"], [...CATALONIA, "2027-05-11", "2027-09-29"], ["2027-12-06", "2027-12-08", "2027-01-06"]];
  for (const holidays of places) {
    for (const leave of [1, 2, 3]) assert.equal(plan(leave, holidays).daysOff, bruteForce(holidays, leave), `${holidays.length} holidays, ${leave} days`);
  }
});

test("optimizer: fast enough for a phone (25 days, every option, well under a second here)", () => {
  const start = performance.now();
  for (let i = 0; i < 5; i++) {
    plan(25);
    plan(25, CATALONIA, true);
    longestBreak({ year: YEAR, holidays: CATALONIA, leave: 25 });
  }
  const each = (performance.now() - start) / 5;
  assert.ok(each < 400, `${each.toFixed(0)} ms per change`);
});

/* -------------------------------------------------------------------------- */
/* The data the browser gets                                                  */
/* -------------------------------------------------------------------------- */

test("places: every Catalan town, every Spanish city and community, Catalonia itself; unique values", () => {
  for (const locale of LEAVE_LOCALES) {
    const data = plannerData(locale);
    const items = data.groups.flatMap((g) => g.items);
    const values = items.map((i) => i[0]);
    assert.equal(new Set(values).size, values.length, `${locale}: duplicate value`);
    assert.equal(data.groups[0]!.items[0]![0], CATALONIA_ID);
    assert.equal(items.length, 1 + municipalities().length + CITIES.length + (COMMUNITIES.length - 1));
    assert.ok(plannerPlace(data, DEFAULT_PLACE), "Barcelona");
    for (const item of items) {
      assert.match(itemPage(data, item), new RegExp(`^/(ca|es|en)/.+/$`), `${item[0]} page`);
      const holidays = itemHolidays(data, item, true);
      assert.ok(holidays.every((d) => /^2027-\d\d-\d\d$/.test(d) && !Number.isNaN(Date.parse(d))), item[0]);
    }
    if (locale === "ca") assert.equal(data.groups[1]!.label, [...COMMUNITIES].filter((c) => c.region !== "CT").map((c) => editionNames(c.region, "ca").short).sort((a, b) => a.localeCompare(b, "ca"))[0]);
  }
});

test("places: before the DOGC order, a town's own days count only when asked for (council-approved, pending)", () => {
  const data = plannerData("ca");
  const bcn = plannerPlace(data, "barcelona")!.item;
  if (nextYearPublished()) {
    assert.equal(bcn[6], "d");
    return;
  }
  assert.equal(bcn[6], "c");
  assert.equal(bcn[5], "0517,0924");
  assert.deepEqual(itemHolidays(data, bcn), CATALONIA);
  assert.deepEqual(itemHolidays(data, bcn, true), [...CATALONIA, "2027-05-17", "2027-09-24"].sort());
  // No town's default list has anything beyond the Catalonia-wide days (or Aran's) before the order.
  for (const m of municipalities()) assert.deepEqual(townDays(m).local, [], m.slug);
  // Aran: Easter Monday swapped for 17 June.
  const vielha = itemHolidays(data, plannerPlace(data, "vielha-e-mijaran")!.item);
  assert.ok(vielha.includes("2027-06-17") && !vielha.includes("2027-03-29"));
});

test("places: Spanish cities count their local days only once their bulletin lists them", () => {
  const data = plannerData("es");
  for (const c of CITIES) {
    const item = plannerPlace(data, `${c.community.slug}/${c.slug}`)!.item;
    const holidays = itemHolidays(data, item);
    const own = localDays(c).map((d) => d.date);
    if (c.status2027 === "published") {
      assert.equal(item[6], "b", c.slug);
      for (const d of own) assert.ok(holidays.includes(d), `${c.slug} ${d}`);
    } else {
      assert.equal(own.length, 0, c.slug);
      assert.ok(item[6] === "s" || item[6] === "m", c.slug);
    }
    assert.equal(item[5], "", `${c.slug}: no council days outside Catalonia`);
  }
  // Ceuta and Melilla are one municipality each: their two local days are in.
  const ceuta = itemHolidays(data, plannerPlace(data, "ceuta/all")!.item);
  assert.ok(ceuta.includes("2027-09-02"));
  assert.equal(plannerPlace(data, "madrid/all")!.item[6], "r");
});

/* -------------------------------------------------------------------------- */
/* Words                                                                      */
/* -------------------------------------------------------------------------- */

test("copy: ranges, ratios and the gap in words", () => {
  assert.equal(rangeText("2027-03-25", "2027-03-29", "ca"), "del dijous 25 al dilluns 29 de març");
  assert.equal(rangeText("2027-10-30", "2027-11-01", "ca"), "del dissabte 30 d'octubre al dilluns 1 de novembre");
  assert.equal(rangeText("2027-12-27", "2028-01-02", "es"), "del lunes 27 de diciembre de 2027 al domingo 2 de enero de 2028");
  assert.equal(rangeText("2027-12-04", "2027-12-08", "en"), "Saturday 4 to Wednesday 8 December");
  assert.equal(ratioText(4.4, "ca"), "4,4");
  assert.equal(ratioText(5, "es"), "5");
  assert.equal(ratioText(2.2, "en"), "2.2");
  assert.equal(MIN_GAP, 3);
  assert.deepEqual(MIN_GAP_WORDS, { ca: "tres dies", es: "tres días", en: "three working days" });
  // Catalan contracts the article: "per al Masnou", "de l'Hospitalet".
  assert.match(PLANNER_COPY.ca.planTitle("el Masnou", 5), /^El pla per al Masnou amb 5 dies/);
  assert.match(PLANNER_COPY.ca.status.c("l'Hospitalet de Llobregat"), /L'Ajuntament de l'Hospitalet de Llobregat ja ha aprovat/);
  for (const locale of LEAVE_LOCALES) assert.equal(Object.keys(PLANNER_COPY[locale].status).sort().join(), "b,c,d,m,n,p,r,s");
});

/* -------------------------------------------------------------------------- */
/* Pages, sitemap, links                                                       */
/* -------------------------------------------------------------------------- */

test("pages: one static folder per language beside the 2027 community pages, no community slug is it", () => {
  assert.deepEqual(leaveEditions(), {
    ca: "/ca/festius/2027/aprofitar-vacances/",
    es: "/es/festivos/2027/aprovechar-vacaciones/",
    en: "/en/holidays/2027/leave-planner/",
  });
  for (const locale of LEAVE_LOCALES) {
    assert.ok(leavePath(locale).startsWith(`/${locale}/${ROUTE[locale].root}/2027/`), locale);
    const dir = join(APP, ROUTE[locale].root, "2027", LEAVE_SLUG[locale]);
    const source = readFileSync(join(dir, "page.tsx"), "utf8");
    assert.match(source, /^export const revalidate = false;$/m);
    assert.match(source, /^export const dynamicParams = true;$/m);
    assert.match(source, new RegExp(`if \\(locale !== "${locale}"\\) notFound\\(\\);`));
    assert.match(source, new RegExp(`<LeaveRoute locale="${locale}" />`));
    const slugs = locale === "es" ? COMMUNITIES.map((c) => c.slug) : COMMUNITIES.map((c) => editionNames(c.region, locale).slug);
    assert.ok(!slugs.includes(LEAVE_SLUG[locale]), locale);
  }
  assert.equal(leaveLinkFor("es", "andalucia/sevilla"), "/es/festivos/2027/aprovechar-vacaciones/#p=andalucia/sevilla");
  assert.equal(DEFAULT_LEAVE, 5);
});

test("sitemap: the three pages, reciprocal hreflang, x-default English", () => {
  const entries = leaveSitemapEntries();
  assert.equal(entries.length, 3);
  const urls = entries.map((e) => e.url);
  for (const e of entries) {
    const languages = e.alternates?.languages as Record<string, string>;
    assert.deepEqual(Object.keys(languages).sort(), ["ca", "en", "es", "x-default"]);
    for (const [lang, href] of Object.entries(languages)) assert.ok(urls.includes(href), `${lang} ${href}`);
    assert.equal(languages["x-default"], languages.en);
  }
  assert.match(read("src/app/sitemap.ts"), /\.\.\.leaveSitemapEntries\(\)/);
});

test("links: the long weekends guide (publish group ponts-2027), town, city and Spain 2027 pages point to the planner", () => {
  for (const locale of LEAVE_LOCALES) {
    const body = JSON.stringify(buildBridgesBody(locale));
    assert.ok(body.includes(`](${leavePath(locale)})`), `bridges guide ${locale}`);
  }
  for (const file of ["src/components/programmatic/holidays/MunicipalityPage.tsx", "src/components/programmatic/holidays/EnglishTownPage.tsx", "src/components/programmatic/spain-2027/city-page.tsx", "src/components/programmatic/spain-2027/city-page-intl.tsx"]) {
    assert.match(read(file), /<LeavePlaceLink /, file);
  }
  for (const file of ["src/components/programmatic/spain-2027/pages.tsx", "src/components/programmatic/spain-2027/pages-intl.tsx"]) {
    assert.equal(read(file).match(/<LeaveHubLink /g)?.length, 2, `${file}: hub and bridges page`);
  }
  // And the planner links back to both long weekends pages.
  const page = read("src/components/programmatic/leave-2027/LeavePage.tsx");
  assert.match(page, /GUIDES\.bridges2027\[locale\]/);
  assert.match(page, /spainBridgesPath\(\)|editionBridgesPath\(locale\)/);
  assert.ok(existsSync(join(ROOT, "src/components/programmatic/leave-2027/LeavePlanner.tsx")));
  assert.match(read("src/components/programmatic/leave-2027/LeavePlanner.tsx"), /^"use client";/);
});

/* -------------------------------------------------------------------------- */
/* Date guards                                                                */
/* -------------------------------------------------------------------------- */

test("date guard: once 2027 local days are due (16 January 2027), the DOGC order must be in local-2027.json", () => {
  // The order came out on 17 Dec 2025 and 31 Dec 2024. If it is still missing by mid-January,
  // read the DOGC again (holidays:snapshot prepare2027): the planner then counts every town's days by itself.
  if (Date.now() >= Date.parse("2027-01-16T00:00:00Z")) assert.ok(nextYearPublished(), "2027 local order still not parsed: run prepare2027 and redeploy");
});

test("date guard: from 1 November 2027 the planner needs its 2028 edition", () => {
  // Demand for the next year's bridges starts in November: build the 2028 planner (new year, same code) by then.
  assert.ok(Date.now() < Date.parse("2027-11-01T00:00:00Z"), "2027 leave planner: build the 2028 edition");
});
