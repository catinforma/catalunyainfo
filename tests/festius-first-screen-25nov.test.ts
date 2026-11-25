import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { allHolidays, todayInCatalonia } from "../src/lib/content/holidays/calendar.ts";
import { todayAnswer } from "../src/lib/content/holidays/today-answer.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { municipalityBySlug } from "../src/lib/programmatic/holidays/data.ts";
import { townTodayAnswer, townAnswerText } from "../src/lib/programmatic/holidays/first-screen.ts";
import { OFFICIAL } from "../src/lib/programmatic/holidays/links.ts";

/**
 * "Festius" item of the 90-day plan (25 Nov 2026): what a person gets on the first screen before and after choosing a
 * town. The date, the place and the kind of holiday (work, not shop opening) must be unambiguous, on an ordinary day,
 * on the eve of a holiday, on a holiday and just after midnight in Madrid; the next step (the town, the calendar) is
 * where the reader already is; and every mention of the 2027 calendar can be traced to the Generalitat's own page.
 */

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const WEEKDAY = /(lunes|martes|miércoles|jueves|viernes|sábado|domingo|dilluns|dimarts|dimecres|dijous|divendres|dissabte|diumenge|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/;

/* -------------------------------------------------------------------------- */
/* The hub's first screen on the four kinds of day                             */
/* -------------------------------------------------------------------------- */

// Madrid is UTC+1 in winter: 23:30 UTC on 7 Dec is 00:30 on 8 Dec, the Immaculate Conception.
const DAYS = [
  { name: "ordinary day", now: "2026-11-25T12:00:00Z", today: "2026-11-25", isHoliday: false, tomorrowYes: false },
  { name: "eve of a holiday", now: "2026-12-07T12:00:00Z", today: "2026-12-07", isHoliday: false, tomorrowYes: true },
  { name: "a holiday", now: "2026-12-08T12:00:00Z", today: "2026-12-08", isHoliday: true, tomorrowYes: false },
  { name: "Madrid midnight (server still on the eve in UTC)", now: "2026-12-07T23:30:00Z", today: "2026-12-08", isHoliday: true, tomorrowYes: false },
] as const;

for (const day of DAYS) {
  test(`hub, ${day.name}: dated answer, tomorrow, next holiday, in ca/es/en`, () => {
    assert.equal(todayInCatalonia(new Date(day.now)), day.today);
    for (const locale of LOCALES) {
      const a = todayAnswer(locale, day.today);
      assert.equal(a.isHoliday, day.isHoliday, locale);
      // The date and the place are in the answer itself, not only around it.
      assert.match(a.answer, WEEKDAY, `${locale}: weekday`);
      assert.match(a.answer, new RegExp(`\\b${Number(day.today.slice(8))}\\b`), `${locale}: day number`);
      assert.match(a.answer, /Catalu|Catalonia/, `${locale}: place`);
      assert.ok(/^(Sí|Yes)/.test(a.tomorrowValue) === day.tomorrowYes, `${locale}: tomorrow ${a.tomorrowValue}`);
      assert.match(a.tomorrowValue, WEEKDAY, `${locale}: tomorrow is dated`);
      assert.ok(a.next.length >= 1, `${locale}: a next holiday is offered`);
      assert.ok(a.next.every((n) => n.date > day.today), `${locale}: next holidays are after today`);
      assert.ok(a.next[0]!.href, `${locale}: the next holiday links its date page`);
    }
  });
}

test("hub: the box says it is about work holidays and sends the shop question to the shops guide, in ca/es/en", () => {
  const component = read("src/components/blocks/HolidayToday.tsx");
  assert.match(component, /t\.scopeNote[^]*?GUIDES\.shops\[locale\]/);
  const answer = component.indexOf("answer.answer");
  const scope = component.indexOf("t.scopeNote");
  const local = component.indexOf("<LocalDay ");
  assert.ok(answer > 0 && answer < scope && scope < local, "scope note sits under today/tomorrow/next, before the local towns");
  const wording = {
    ca: /festes laborals[^]*botigues/,
    es: /festivos laborales[^]*tiendas/,
    en: /public holidays for work[^]*shops/,
  } as const;
  for (const locale of LOCALES) {
    const messages = read(`src/lib/i18n/messages/${locale}.ts`);
    const block = messages.slice(messages.indexOf("scopeNote:"), messages.indexOf("scopeNote:") + 400);
    assert.match(block, wording[locale], locale);
    for (const key of ["scopeShopsLink", "source2027Link"]) assert.match(messages, new RegExp(`${key}:`), `${locale} ${key}`);
  }
});

test("hub: after the answer the town comes before the year planner (the logical next step)", () => {
  const component = read("src/components/blocks/HolidayToday.tsx");
  assert.ok(component.indexOf("t.findTown") < component.indexOf("t.plannerLead"));
  assert.ok(component.indexOf("t.findTown") > component.indexOf("<LocalDay "));
});

/* -------------------------------------------------------------------------- */
/* Town pages (Mataro, Castelldefels): the first-screen sentence on four days  */
/* -------------------------------------------------------------------------- */

// Castelldefels has a local holiday on Monday 7 Dec 2026; Mataro's next day is the Catalonia-wide 8 Dec.
const TOWNS = [
  { slug: "mataro", name: "Mataró" },
  { slug: "castelldefels", name: "Castelldefels" },
] as const;

for (const { slug, name } of TOWNS) {
  test(`${name}: first screen names the town and a dated holiday on an ordinary day, the eve, the holiday and after Madrid midnight`, () => {
    const m = municipalityBySlug(slug)!;
    assert.ok(m, slug);
    for (const day of DAYS) {
      const today = todayInCatalonia(new Date(day.now));
      for (const locale of ["ca", "es"] as const) {
        const a = townTodayAnswer(m, locale, today);
        assert.ok(a, `${slug} ${locale} ${today}`);
        const text = townAnswerText(a!);
        assert.match(text, new RegExp(name), `${slug} ${locale} ${today}: the town`);
        assert.match(a!.strong, WEEKDAY, `${slug} ${locale} ${today}: weekday in the bold date`);
        assert.match(a!.strong, /2026|2027/, `${slug} ${locale} ${today}: year in the bold date`);
        assert.doesNotMatch(text, /\b(hoy es|avui és|today is)\b/i, "no relative 'today' claim in the static sentence");
      }
    }
  });
}

test("Castelldefels on the eve (6 Dec) names Monday 7 Dec as the next holiday; on 7 Dec it says yes", () => {
  const m = municipalityBySlug("castelldefels")!;
  const eve = townTodayAnswer(m, "es", "2026-12-06")!;
  assert.match(eve.strong, /^lunes 7 de diciembre de 2026$/);
  const day = townTodayAnswer(m, "es", "2026-12-07")!;
  assert.equal(day.before, "Sí: el ");
  assert.match(day.strong, /^lunes 7 de diciembre de 2026$/);
  assert.match(day.after, /es festivo en Castelldefels/);
  const ca = townTodayAnswer(m, "ca", "2026-12-07")!;
  assert.equal(ca.before, "Sí: el ");
  assert.match(ca.after, /és festiu a Castelldefels/);
});

test("town pages: one line under the first screen jumps to the exact today/tomorrow box and to the .ics, before the next-step box", () => {
  const ca = read("src/components/programmatic/holidays/MunicipalityPage.tsx");
  const en = read("src/components/programmatic/holidays/EnglishTownPage.tsx");
  assert.ok(ca.indexOf("<TownQuickLinks") > ca.indexOf("firstScreenOrder(locale).map(") && ca.indexOf("<TownQuickLinks") < ca.indexOf("<NextStep step={townNextStep("));
  assert.ok(en.indexOf("<TownQuickLinks") < en.indexOf("<NextStep step={townNextStep(") && en.indexOf("<TownQuickLinks") > en.indexOf('<p className="ci-lead">'));
  // The targets exist on the same pages.
  assert.match(ca, /<h2 id="avui">/);
  assert.match(en, /<h2 id="today">/);
  assert.match(read("src/components/programmatic/ics/CalendarSubscribe.tsx"), /const id = "afegeix-calendari"/);
  assert.match(ca, /<CalendarSubscribe locale=\{locale\}/);
  assert.match(en, /<CalendarSubscribe locale="en"/);
  const parts = read("src/components/programmatic/holidays/parts.tsx");
  assert.match(parts, /todayId: "avui"[^]*?todayId: "avui"[^]*?todayId: "today"/);
  assert.match(parts, /href="#afegeix-calendari"/);
  // The static first-screen answer is untouched (experiment window, TODAY_FIRST).
  assert.match(read("src/lib/programmatic/holidays/first-screen.ts"), /TODAY_FIRST: Record<MuniLocale, boolean> = \{ ca: false, es: true \}/);
});

/* -------------------------------------------------------------------------- */
/* 2027: the Generalitat's own page                                            */
/* -------------------------------------------------------------------------- */

test("the Generalitat's 2027 work-holiday page: its twelve dates (read 25 Nov 2026) are the ones the site prints", () => {
  // Read on the page itself, 25 Nov 2026: "Són festes laborals a Catalunya durant l'any 2027: 1 de gener, divendres; 6 de gener,
  // dimecres; 26 de març, divendres; 29 de març, dilluns; 1 de maig, dissabte; 24 de juny, dijous; 11 de setembre, dissabte;
  // 12 d'octubre, dimarts; 1 de novembre, dilluns; 6 de desembre, dilluns; 8 de desembre, dimecres; 25 de desembre, dissabte".
  const read2027 = ["2027-01-01", "2027-01-06", "2027-03-26", "2027-03-29", "2027-05-01", "2027-06-24", "2027-09-11", "2027-10-12", "2027-11-01", "2027-12-06", "2027-12-08", "2027-12-25"];
  assert.deepEqual(allHolidays().map((h) => h.date).filter((d) => d.startsWith("2027")), read2027);
  assert.equal(OFFICIAL.treballCalendar2027, "https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2027/");
});

test("every holiday page that mentions 2027 cites that page: hub box, town pages (ca/es/en), unlisted towns, and the sources list after the DOGC order", () => {
  assert.match(read("src/components/blocks/HolidayToday.tsx"), /OFFICIAL\.treballCalendar2027/);
  for (const page of ["MunicipalityPage", "EnglishTownPage", "UnlistedTownPage"]) {
    assert.match(read(`src/components/programmatic/holidays/${page}.tsx`), /href=\{OFFICIAL\.treballCalendar2027\}/, page);
  }
  const parts = read("src/components/programmatic/holidays/parts.tsx");
  assert.match(parts, /key === "regional2027" \? \[key, "treball2027" as const\]/);
  assert.match(parts, /TREBALL27 = \{[^}]*OFFICIAL\.treballCalendar2027/);
  // Every Sources list that cites the DOGC order for 2027 therefore also cites the Generalitat's page.
  for (const page of ["HubPage", "EnglishHubPage", "ComarcaPage", "DatePage", "MunicipalityPage", "EnglishTownPage", "UnlistedTownPage"]) {
    assert.match(read(`src/components/programmatic/holidays/${page}.tsx`), /regional2027/, page);
  }
});

test("the verified date of the Generalitat calendars is the day both pages were re-read", () => {
  assert.match(read("src/lib/content/holidays/calendar.ts"), /CALENDAR_VERIFIED_AT = "2026-11-25"/);
});
