import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { DAY_DEPENDENT_BLOCKS } from "../src/lib/content/day-dependent.ts";
import { todayInCatalonia } from "../src/lib/content/holidays/calendar.ts";
import type { LocalHolidayPlace } from "../src/lib/content/holidays/local.ts";
import type { LocalCalendar } from "../src/lib/content/holidays/local.ts";
import { LARGEST_SHOWN, summariseLocalDay, tomorrowLocalPlaces } from "../src/lib/content/holidays/local-today.ts";
import { todayAnswer } from "../src/lib/content/holidays/today-answer.ts";
import { buildBody } from "../src/lib/content/holidays/today-publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { SNAPSHOT } from "../src/lib/programmatic/holidays/data.ts";
import { GUIDES, withHolidayHub, type GuideKey } from "../src/lib/programmatic/holidays/links.ts";

/**
 * Audit of 25 Nov 2026, opportunity 4: "mañana es festivo" / "hoy es festivo" is a question about a date. 526
 * impressions went to 41 town and date pages while the guide sat at 52. The guide owns the question: a dated answer
 * for today and tomorrow, the towns with a local holiday, the next holiday, and a link to it from every holiday page.
 */

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

/* -------------------------------------------------------------------------- */
/* The date-aware answer: eve, holiday, ordinary day, year end                 */
/* -------------------------------------------------------------------------- */

test("the eve of a holiday: today no, tomorrow yes, with the weekday", () => {
  // 7 Dec 2026 is a Monday, the eve of the Immaculate Conception (Tuesday 8 Dec).
  const es = todayAnswer("es", "2026-12-07");
  assert.equal(es.isHoliday, false);
  assert.match(es.answer, /^No: hoy, lunes 7 de diciembre, no es festivo en Cataluña\.$/);
  assert.match(es.tomorrowValue, /^Sí — martes 8 de diciembre, /);
  assert.equal(es.next[0]?.date, "2026-12-08", "the next holiday after today is the one tomorrow");
  const ca = todayAnswer("ca", "2026-12-07");
  assert.match(ca.tomorrowValue, /^Sí — dimarts 8 de desembre, /);
  const en = todayAnswer("en", "2026-12-07");
  assert.match(en.tomorrowValue, /^Yes — Tuesday 8 December, /);
});

test("a holiday: today yes, tomorrow no, the next one named", () => {
  const es = todayAnswer("es", "2026-12-08");
  assert.equal(es.isHoliday, true);
  assert.match(es.answer, /^Sí: hoy, martes 8 de diciembre, es festivo en Cataluña \(/);
  assert.match(es.tomorrowValue, /^No — miércoles 9 de diciembre$/);
  assert.equal(es.next[0]?.date, "2026-12-25");
  assert.match(es.next[0]!.when, /^viernes 25 de diciembre$/);
});

test("an ordinary day: no and no, and the next holiday with its weekday", () => {
  const es = todayAnswer("es", "2026-11-25");
  assert.equal(es.isHoliday, false);
  assert.match(es.answer, /^No: hoy, miércoles 25 de noviembre, no es festivo en Cataluña\.$/);
  assert.match(es.tomorrowValue, /^No — jueves 26 de noviembre$/);
  assert.equal(es.next[0]?.date, "2026-12-08");
  assert.match(es.next[0]!.when, /^martes 8 de diciembre$/);
  assert.ok(es.next[0]!.href, "the next holiday links its date page");
});

test("31 December to 1 January: the eve answers yes for tomorrow, in the next year", () => {
  for (const locale of LOCALES) {
    const eve = todayAnswer(locale, "2026-12-31");
    assert.equal(eve.isHoliday, false, locale);
    assert.equal(eve.tomorrow, "2027-01-01", locale);
    assert.match(eve.tomorrowValue, /2027/, `${locale}: tomorrow names its year`);
    assert.ok(/^(Sí|Yes) — /.test(eve.tomorrowValue), `${locale}: ${eve.tomorrowValue}`);
    assert.equal(eve.next[0]?.date, "2027-01-01", locale);
    assert.equal(todayAnswer(locale, "2027-01-01").isHoliday, true, locale);
  }
  assert.match(todayAnswer("es", "2026-12-31").tomorrowValue, /^Sí — viernes 1 de enero de 2027, /);
});

test("after midnight in Madrid the page's 'today' is already the next day, whatever the server clock says", () => {
  // 23:30 UTC on 31 Dec is 00:30 on 1 Jan in Madrid; 22:30 UTC on 30 Jun is 00:30 on 1 Jul (summer time).
  assert.equal(todayInCatalonia(new Date("2026-12-31T23:30:00Z")), "2027-01-01");
  assert.equal(todayInCatalonia(new Date("2026-06-30T22:30:00Z")), "2026-07-01");
  assert.equal(todayInCatalonia(new Date("2026-12-31T22:30:00Z")), "2026-12-31");
});

test("freshness: the guide's box is day-dependent (nightly cron), rendered from the Madrid clock, cached for a day", () => {
  assert.ok(DAY_DEPENDENT_BLOCKS.includes("holidayToday"));
  for (const locale of LOCALES) assert.equal(buildBody(locale)[0]?.type, "holidayToday", locale);
  const component = read("src/components/blocks/HolidayToday.tsx");
  assert.match(component, /todayInCatalonia\(now\)/);
  assert.doesNotMatch(component, /new Date\(\)/, "no server-clock date in the box");
  assert.match(read("src/app/(public)/[locale]/[...slug]/page.tsx"), /export const revalidate = 86400;/);
  assert.match(read("src/app/api/cron/publish-scheduled/route.ts"), /REVALIDATE_NIGHTLY_PATTERN|DAY_DEPENDENT/);
  assert.match(read("ops/vps/catalunyainfo-cron.timer"), /OnCalendar=\*-\*-\* 23:05:00 UTC/);
});

/* -------------------------------------------------------------------------- */
/* Which towns, largest first                                                 */
/* -------------------------------------------------------------------------- */

function placeFor(m: (typeof SNAPSHOT.municipalities)[number]): LocalHolidayPlace {
  return { key: `${m.ine}000`, name: m.name, isNucleus: false, dates: ["2026-11-30"] };
}

test("local holidays of a day: the largest towns first (by population), the rest after, each place once", () => {
  const ranked = [...SNAPSHOT.municipalities].sort((a, b) => a.rank - b.rank);
  // The source lists places alphabetically; hand them over in reverse rank order to prove the sort.
  const places = ranked.slice(0, 30).reverse().map(placeFor);
  const unlisted: LocalHolidayPlace = { key: "dogc:no-town-page-here", name: "Cap Poble", isNucleus: false, dates: ["2026-11-30"] };
  const summary = summariseLocalDay([...places, unlisted]);
  assert.equal(summary.count, 31);
  assert.equal(summary.largest.length, LARGEST_SHOWN);
  assert.deepEqual(
    summary.largest.map((p) => p.name),
    ranked.slice(0, LARGEST_SHOWN).map((m) => m.name),
  );
  assert.equal(summary.rest.length, 21);
  assert.ok(summary.rest.includes(unlisted), "a place without a town page stays in the full list");
  assert.ok(!summary.largest.includes(unlisted));
  assert.equal(new Set([...summary.largest, ...summary.rest]).size, 31);
});

test("a day with no local holiday has an empty summary", () => {
  assert.deepEqual(summariseLocalDay([]), { count: 0, largest: [], rest: [] });
});

test("the box shows today's and tomorrow's local holidays the same way, above the planner link", () => {
  const component = read("src/components/blocks/HolidayToday.tsx");
  assert.equal((component.match(/<LocalDay /g) ?? []).length, 2);
  assert.ok(component.indexOf("<LocalDay ") < component.indexOf("ci-today-find"), "local towns come before the planner link");
  for (const locale of LOCALES) {
    const messages = read(`src/lib/i18n/messages/${locale}.ts`);
    for (const key of ["localTomorrowNone", "localLargest", "localAll", "localDayPage"]) assert.match(messages, new RegExp(`${key}:`), `${locale} ${key}`);
  }
});

/* -------------------------------------------------------------------------- */
/* Links to the guide, in the query's words                                    */
/* -------------------------------------------------------------------------- */

test("every guide rail on the holiday pages carries the guide, first, once", () => {
  const rails: GuideKey[][] = [
    ["workCalendar", "shops"],
    ["christmasTraditions", "christmasBarcelona", "shops", "metroHours", "school", "workCalendar"],
    ["holidayToday", "workCalendar"],
    ["shops", "holidayToday", "school"],
  ];
  for (const keys of rails) {
    const out = withHolidayHub(keys);
    assert.equal(out[0], "holidayToday");
    assert.equal(out.filter((k) => k === "holidayToday").length, 1);
    assert.deepEqual(
      out.slice(1),
      keys.filter((k) => k !== "holidayToday"),
      "the other guides keep their order",
    );
  }
});

test("the rail's anchor is the query's words, in ca, es and en", () => {
  const parts = read("src/components/programmatic/holidays/parts.tsx");
  assert.match(parts, /holidayToday: \{ ca: "És festiu avui o demà a Catalunya\?", es: "¿Es festivo hoy o mañana en Cataluña\?", en: "Is today or tomorrow a holiday in Catalonia\?" \}/);
  assert.match(parts, /withHolidayHub\(keys\)\.map/);
  for (const locale of LOCALES) assert.match(GUIDES.holidayToday[locale], /^\/(ca|es|en)\/[^/]+\/[^/]+\/$/);
});

test("the town, comarca, hub and date pages (ca, es, en) all render the rail", () => {
  for (const file of ["MunicipalityPage", "UnlistedTownPage", "ComarcaPage", "HubPage", "DatePage", "EnglishTownPage", "EnglishHubPage"]) {
    assert.match(read(`src/components/programmatic/holidays/${file}.tsx`), /<GuideLinks\b/, file);
  }
  // The 2027 date pages use the same DatePage.
  assert.match(read("src/components/programmatic/holidays/DatePage.tsx"), /<GuideLinks keys=\{content\.guides\}/);
});

test("the footer 'most searched' link is the guide, in the same words", () => {
  const footer = read("src/lib/nav/footer.ts");
  assert.match(footer, /¿Es festivo hoy o mañana en Cataluña\?/);
  assert.match(footer, /És festiu avui o demà a Catalunya\?/);
  assert.match(footer, /Is today or tomorrow a holiday in Catalonia\?/);
});

/* -------------------------------------------------------------------------- */
/* Tomorrow's local holidays across New Year                                   */
/* -------------------------------------------------------------------------- */

const place = (key: string, name: string, dates: string[]): LocalHolidayPlace => ({ key, name, isNucleus: false, dates });
const calendar = (year: number, places: LocalHolidayPlace[], error: string | null = null): LocalCalendar => ({ year, places, error });

test("31 Dec: tomorrow's local holidays come from next year's calendar, never from this year's", () => {
  const cal2026 = calendar(2026, [place("08019000", "Barcelona", ["2026-05-25", "2026-09-24"]), place("17079000", "Girona", ["2026-12-31"])]);
  // 2027 not published (no rows): nothing is said about tomorrow, not "none".
  assert.equal(tomorrowLocalPlaces("2027-01-01", cal2026, calendar(2027, [])), null);
  // The read failed: nothing either.
  assert.equal(tomorrowLocalPlaces("2027-01-01", cal2026, calendar(2027, [], "503")), null);
  // Not loaded at all.
  assert.equal(tomorrowLocalPlaces("2027-01-01", cal2026, null), null);
  // 2027 published, nobody has 1 Jan: now "none" is a fact.
  const cal2027 = calendar(2027, [place("08019000", "Barcelona", ["2027-05-17", "2027-09-24"])]);
  assert.deepEqual(tomorrowLocalPlaces("2027-01-01", cal2026, cal2027), []);
  // 2027 published, one town has it.
  const withDay = calendar(2027, [place("17079000", "Girona", ["2027-01-01"])]);
  assert.deepEqual(tomorrowLocalPlaces("2027-01-01", cal2026, withDay)?.map((p) => p.name), ["Girona"]);
  // A calendar of the wrong year is never taken for tomorrow's.
  assert.equal(tomorrowLocalPlaces("2027-01-01", cal2026, calendar(2026, cal2026.places)), null);
});

test("an ordinary day uses today's calendar for tomorrow, the same year", () => {
  const cal = calendar(2026, [place("17079000", "Girona", ["2026-11-30"])]);
  assert.deepEqual(tomorrowLocalPlaces("2026-11-30", cal, null)?.map((p) => p.name), ["Girona"]);
  assert.deepEqual(tomorrowLocalPlaces("2026-12-01", cal, null), []);
  assert.equal(tomorrowLocalPlaces("2026-12-01", calendar(2026, []), null), null, "no data, no claim");
});

test("the box reads next year's calendar across New Year and renders no tomorrow line without it", () => {
  const component = read("src/components/blocks/HolidayToday.tsx");
  assert.match(component, /loadLocalCalendar\(tomorrowYear\)/);
  assert.match(component, /tomorrowLocalPlaces\(tomorrow, local, localNextYear\)/);
  assert.match(component, /\{localTomorrow \? <LocalDay /);
});

test("the local-holiday headings end in a noun phrase, not a dangling colon (ca, es, en)", () => {
  for (const locale of LOCALES) {
    const messages = read(`src/lib/i18n/messages/${locale}.ts`);
    for (const key of ["localToday", "localTomorrow"]) {
      const line = messages.match(new RegExp(`${key}: "([^"]+)"`))?.[1] ?? "";
      assert.match(line, /\{n\} (municipis o nuclis|municipios o núcleos|municipalities or villages)\.$/, `${locale} ${key}: ${line}`);
    }
  }
});
