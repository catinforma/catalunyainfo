import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount } from "../src/lib/content/blocks.ts";
import {
  ARAN_SUBSTITUTIONS,
  COVERED_YEARS,
  HOLIDAYS_BY_YEAR,
  addDays,
  allHolidays,
  daysBetween,
  holidayOn,
  isCovered,
  longDate,
  nextHolidayAfter,
  shortDate,
  todayInCatalonia,
  weekdayIndex,
  WEEKDAY_NAMES,
} from "../src/lib/content/holidays/calendar.ts";
import { todayAnswer, weekdayDate } from "../src/lib/content/holidays/today-answer.ts";
import { COPY, buildBody } from "../src/lib/content/holidays/today-publish.ts";
import {
  TODAY_DESCRIPTION_MAX,
  TODAY_TITLE_MAX,
  liveTodayDescription,
  liveTodayTitle,
  nextHolidayFrom,
} from "../src/lib/content/holidays/today-snippet.ts";
import { COPY as PLANNER_COPY } from "../src/lib/content/holidays/copy.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import { municipalityForCode } from "../src/lib/programmatic/holidays/data.ts";
import { datePath, isDatePage } from "../src/lib/programmatic/holidays/paths.ts";

/**
 * This page tells somebody whether they have to go to work. Being wrong by one
 * day is the whole failure mode, so the tests are mostly about dates: the
 * weekday the page prints against the date it prints, and the timezone the
 * "today" comes from.
 */

/* -------------------------------------------------------------------------- */
/* The dates themselves                                                       */
/* -------------------------------------------------------------------------- */

test("each covered year has exactly twelve Catalonia-wide holidays", () => {
  for (const year of COVERED_YEARS) {
    const holidays = HOLIDAYS_BY_YEAR[year] ?? [];
    assert.equal(holidays.length, 12, `${year}`);
    for (const holiday of holidays) {
      assert.equal(holiday.date.slice(0, 4), String(year));
      assert.match(holiday.date, /^\d{4}-\d{2}-\d{2}$/);
    }
  }
});

test("every holiday has a name in all three languages", () => {
  for (const holiday of allHolidays()) {
    for (const locale of LOCALES) {
      assert.ok((holiday.name[locale] ?? "").length > 2, `${holiday.date} ${locale}`);
    }
  }
});

test("the 2026 dates match the weekdays the official calendar lists", () => {
  // Read off the Generalitat's calendar. If a date were mistyped, the weekday
  // computed from it would stop matching and this test would catch it.
  const expected: Record<string, number> = {
    "2026-01-01": 4, // Thursday
    "2026-01-06": 2, // Tuesday
    "2026-04-03": 5, // Friday
    "2026-04-06": 1, // Monday
    "2026-05-01": 5, // Friday
    "2026-06-24": 3, // Wednesday
    "2026-08-15": 6, // Saturday
    "2026-09-11": 5, // Friday
    "2026-10-12": 1, // Monday
    "2026-12-08": 2, // Tuesday
    "2026-12-25": 5, // Friday
    "2026-12-26": 6, // Saturday
  };
  for (const [date, weekday] of Object.entries(expected)) {
    assert.equal(weekdayIndex(date), weekday, date);
    assert.ok(holidayOn(date), `${date} is missing from the calendar`);
  }
});

test("dates are unique and sorted across the whole range", () => {
  const dates = allHolidays().map((holiday) => holiday.date);
  assert.equal(new Set(dates).size, dates.length);
  assert.deepEqual(dates, [...dates].sort());
});

test("the Aran entry is a substitution, never an extra day", () => {
  for (const item of ARAN_SUBSTITUTIONS) {
    // The day it replaces must be a real Catalonia-wide holiday...
    assert.ok(holidayOn(item.replaces), `${item.replaces} is not in the calendar`);
    // ...and the Aran day itself must not be in the Catalonia-wide list, or
    // Aran would end up with thirteen days.
    assert.equal(holidayOn(item.date), null, `${item.date} must not be Catalonia-wide`);
    assert.equal(item.date.slice(0, 4), String(item.year));
  }
});

/* -------------------------------------------------------------------------- */
/* Date arithmetic                                                            */
/* -------------------------------------------------------------------------- */

test("today is read in Catalonia's timezone, not the server's", () => {
  // 31 December, 23:30 UTC. In Madrid it is already 1 January: a page that
  // answered from the server clock would say the wrong day, and would say it
  // on the one night of the year when the answer matters most.
  const newYearEveLate = new Date("2026-12-31T23:30:00Z");
  assert.equal(todayInCatalonia(newYearEveLate), "2027-01-01");

  // And the reverse: 00:30 UTC in summer is still the same day in Madrid.
  const summerNight = new Date("2026-07-15T00:30:00Z");
  assert.equal(todayInCatalonia(summerNight), "2026-07-15");
});

test("addDays crosses months, years and the DST boundary", () => {
  assert.equal(addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-02-28", 1), "2026-03-01");
  // The spring-forward night; a naive +24h would land on the same date.
  assert.equal(addDays("2026-03-28", 1), "2026-03-29");
});

test("the next holiday is strictly after the date asked about", () => {
  const christmas = "2026-12-25";
  assert.equal(nextHolidayAfter(christmas)?.date, "2026-12-26");
  // And it crosses the year boundary into the next published calendar.
  assert.equal(nextHolidayAfter("2026-12-26")?.date, "2027-01-01");
});

test("daysBetween is whole days, in the right direction", () => {
  assert.equal(daysBetween("2026-10-06", "2026-10-12"), 6);
  assert.equal(daysBetween("2026-10-12", "2026-10-12"), 0);
});

test("a year with no published order is reported as unknown, never guessed", () => {
  assert.equal(isCovered("2028-01-01"), false);
  assert.equal(holidayOn("2028-01-01"), null);
  // Catalonia approves the calendar one year at a time, so claiming 2028 would
  // be invention even though the fixed dates are predictable.
  assert.equal(nextHolidayAfter("2027-12-25")?.date, undefined);
});

/* -------------------------------------------------------------------------- */
/* Rendering                                                                  */
/* -------------------------------------------------------------------------- */

test("the long date prints the weekday that belongs to the date", () => {
  // 12 October 2026 is a Monday.
  assert.match(longDate("2026-10-12", "ca"), /^dilluns/);
  assert.match(longDate("2026-10-12", "es"), /^lunes/);
  assert.match(longDate("2026-10-12", "en"), /^Monday/);
});

test("Catalan elides the preposition before a vowel", () => {
  assert.match(shortDate("2026-10-12", "ca"), /12 d'octubre/);
  assert.match(shortDate("2026-12-25", "ca"), /25 de desembre/);
  assert.match(shortDate("2026-10-12", "es"), /12 de octubre/);
  assert.match(shortDate("2026-10-12", "en"), /12 October/);
});

/* -------------------------------------------------------------------------- */
/* The page                                                                   */
/* -------------------------------------------------------------------------- */

for (const locale of LOCALES) {
  test(`${locale}: the body validates and leads with the answer`, () => {
    const body = buildBody(locale);
    const parsed = bodySchema.safeParse(body);
    assert.ok(parsed.success, JSON.stringify(parsed.error?.issues?.slice(0, 2)));

    // The block has to come before any heading: somebody who typed "is it a
    // holiday today" should not have to read an introduction first.
    const answerIndex = body.findIndex((block) => block.type === "holidayToday");
    const firstHeading = body.findIndex((block) => block.type === "heading");
    assert.ok(answerIndex >= 0, "no answer block");
    assert.ok(answerIndex < firstHeading, "the answer is below the first heading");
  });

  test(`${locale}: SEO fields are present and within the rendered lengths`, () => {
    const { seoTitle, seoDescription, path, excerpt } = COPY[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 65, `${seoTitle.length}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 165, `${seoDescription.length}`);
    assert.ok(excerpt.length > 30);
    assert.ok(!/\d{4}/.test(path), "the URL must be evergreen");
  });

  test(`${locale}: it links the year planner and does not duplicate it`, () => {
    const text = bodyToPlainText(buildBody(locale));
    const plannerPath = PLANNER_COPY[locale].path;
    assert.match(
      JSON.stringify(buildBody(locale)),
      new RegExp(plannerPath.replace(/[/-]/g, "\\$&")),
      "no link to the year planner",
    );
    // The planner owns the bridges and the ICS download. Checking for the
    // component rather than for the word, because the link line legitimately
    // describes what the planner offers.
    assert.ok(
      !buildBody(locale).some((block) => block.type === "calendar"),
      "this page should not carry the calendar download",
    );
    assert.ok(wordCount(text) > 180);
  });

  test(`${locale}: the page says the two local days are not covered`, () => {
    const text = bodyToPlainText(buildBody(locale)).toLowerCase();
    assert.match(text, /local/, "no mention of local holidays");
  });
}

/* -------------------------------------------------------------------------- */
/* Local questions go on to the holiday engine's town pages                   */
/* -------------------------------------------------------------------------- */

test("a place in the live local data maps to its town page, nuclei to their municipality", () => {
  // codi_municipal = five-digit INE code + three-digit nucleus code.
  assert.equal(municipalityForCode("08019000")?.slug, "barcelona");
  assert.equal(municipalityForCode("17079000")?.slug, "girona");
  assert.equal(municipalityForCode("08019001")?.slug, "barcelona", "a nucleus maps to its municipality");
  // A DOGC correction carries its folded name.
  assert.equal(municipalityForCode("dogc:castelldefels")?.slug, "castelldefels");
  // Since tranche 3 every town has a page: a Lladorre nucleus maps to Lladorre.
  assert.equal(municipalityForCode("25123001")?.slug, "lladorre");
  // A council with "proposta no formulada" has none (Cerdanyola del Vallès).
  assert.equal(municipalityForCode("08266000"), null);
  assert.equal(municipalityForCode("nonsense"), null);
});

for (const locale of LOCALES) {
  test(`${locale}: search title and description fit, and the body links the town pages`, () => {
    const { seoTitle, seoDescription } = COPY[locale];
    assert.ok(seoTitle.length <= 60, `${seoTitle.length}`);
    assert.ok(seoDescription.length <= 155, `${seoDescription.length}`);
    const json = JSON.stringify(buildBody(locale));
    if (locale === "en") {
      assert.match(json, /\/en\/guides\/local-holidays-catalonia\//);
      assert.match(json, /17 May/, "Barcelona's Whit Monday, from the payload");
    } else {
      const root = locale === "ca" ? "festius" : "festivos";
      assert.ok(json.includes(`(/${locale}/${root}/)`), "no link to the hub");
      for (const town of ["barcelona", "girona", "lleida", "tarragona"]) {
        assert.ok(json.includes(`/${locale}/${root}/${town}/`), `no link to ${town}`);
      }
    }
    assert.ok(!json.includes("{towns}") && !json.includes("{bcn"), "a placeholder leaked");
  });
}

test("the three paths are distinct and sit under a guides hub", () => {
  const paths = LOCALES.map((locale) => COPY[locale].path);
  assert.equal(new Set(paths).size, paths.length);
  for (const path of paths) assert.match(path, /^(guies|guias|guides)\//);
});

test("this page's paths never collide with the year planner's", () => {
  for (const locale of LOCALES) {
    assert.notEqual(COPY[locale].path, PLANNER_COPY[locale].path, locale);
  }
});

/* -------------------------------------------------------------------------- */
/* Top-3 push, 30 Oct 2026: the title names the next holiday                  */
/* -------------------------------------------------------------------------- */

test("live title and description fit every covered day and name the next holiday, counting today", () => {
  for (let iso = "2026-01-01"; isCovered(iso); iso = addDays(iso, 1)) {
    for (const locale of LOCALES) {
      const title = liveTodayTitle(locale, iso);
      const description = liveTodayDescription(locale, iso);
      if (!nextHolidayFrom(iso)) {
        assert.equal(title, null);
        continue;
      }
      assert.ok(title && title.length <= TODAY_TITLE_MAX && title.length <= 60, `${iso} ${locale}: ${title}`);
      assert.ok(description && description.length <= TODAY_DESCRIPTION_MAX, `${iso} ${locale}: ${description}`);
      // Never a claim about "today" that a stale snippet could get wrong.
      assert.ok(!/hoy no es|avui no és|today is not/i.test(description!), `${iso} ${locale}`);
    }
  }
  // 3 Nov 2026: the searchers' word order, as in the H1 ("¿Es festivo hoy en Cataluña?").
  assert.equal(liveTodayTitle("es", "2026-10-30"), "¿Es festivo hoy en Cataluña? Próximo festivo: 8 de diciembre");
  assert.equal(liveTodayTitle("ca", "2026-12-08"), "Avui és festiu a Catalunya? Pròxim festiu: 8 de desembre");
  assert.match(liveTodayTitle("es", "2026-12-09")!, /25 de diciembre$/);
  assert.match(liveTodayDescription("es", "2026-10-30")!, /^Próximo festivo en toda Cataluña: martes 8 de diciembre \(la Inmaculada\)\./);
  assert.match(liveTodayTitle("en", "2026-10-30")!, /Next: 8 Dec$/);
});

test("the FAQ asks in the searchers' words and links the coming local-holiday date pages", () => {
  const questions = {
    ca: ["Avui és festiu a Catalunya?", "Demà és festiu a Catalunya?", "On és festiu avui a Catalunya?"],
    es: ["¿Hoy es festivo en Cataluña?", "¿Mañana es festivo en Cataluña?", "¿Dónde es festivo hoy en Cataluña?"],
    en: ["Is today a public holiday in Catalonia?", "Is tomorrow a holiday in Catalonia?", "Is today a holiday in Barcelona?"],
  };
  for (const locale of LOCALES) {
    const faq = buildBody(locale).find((b) => b.type === "faq");
    assert.ok(faq && faq.type === "faq", locale);
    const asked = faq.items.map((i) => i.question);
    for (const q of questions[locale]) assert.ok(asked.includes(q), `${locale}: ${q}`);
    const text = JSON.stringify(faq);
    assert.ok(!/undefined|\$\{/.test(text), locale);
    if (todayInCatalonia() <= "2026-12-07") {
      const dec7 = { ca: "/ca/festius/dia/7-desembre-2026/", es: "/es/festivos/dia/7-diciembre-2026/", en: "/en/holidays/day/7-december-2026/" }[locale];
      assert.ok(text.includes(dec7), `${locale}: 7 Dec date page`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* First screen, 3 Nov 2026: dated answers and the next three holidays        */
/* -------------------------------------------------------------------------- */

test("the answer, tomorrow and the next three carry their own dates on every covered day", () => {
  // The page is static HTML rebuilt by the nightly cron: a copy served before
  // that rebuild must still be true, so no sentence may say "today" without
  // naming the date, and none may count days.
  for (let iso = "2026-01-01"; isCovered(iso); iso = addDays(iso, 1)) {
    for (const locale of LOCALES) {
      const a = todayAnswer(locale, iso);
      const next = addDays(iso, 1);
      assert.ok(a.answer.includes(weekdayDate(iso, locale)), `${iso} ${locale}: ${a.answer}`);
      assert.equal(a.isHoliday, holidayOn(iso) !== null, `${iso} ${locale}`);
      assert.match(a.answer, a.isHoliday ? /^(Sí|Yes):/ : /^No:/, `${iso} ${locale}`);
      assert.ok(a.tomorrowValue.includes(weekdayDate(next, locale, next.slice(0, 4) !== iso.slice(0, 4))), `${iso} ${locale}: ${a.tomorrowValue}`);
      assert.doesNotMatch(`${a.answer} ${a.tomorrowValue}`, /\d+ (dies|días|days)\b|d'aquí a|dentro de|\bin \d/, `${iso} ${locale}`);

      // The next three: strictly after today, in order, each a Catalonia-wide
      // holiday printed with the weekday that belongs to its date.
      const expected = allHolidays().filter((h) => h.date > iso).slice(0, 3);
      assert.deepEqual(a.next.map((n) => n.date), expected.map((h) => h.date), `${iso} ${locale}`);
      for (const n of a.next) {
        assert.ok(n.when.startsWith(WEEKDAY_NAMES[locale][weekdayIndex(n.date)]!), `${n.date} ${locale}: ${n.when}`);
        assert.ok(n.when.includes(shortDate(n.date, locale)), `${n.date} ${locale}: ${n.when}`);
        assert.equal(n.name, holidayOn(n.date)!.name[locale]);
      }
    }
  }
});

test("today's answer, 3 Nov 2026, in each language", () => {
  assert.equal(todayAnswer("es", "2026-11-03").answer, "No: hoy, martes 3 de noviembre, no es festivo en Cataluña.");
  assert.equal(todayAnswer("ca", "2026-11-03").answer, "No: avui, dimarts 3 de novembre, no és festiu a Catalunya.");
  assert.equal(todayAnswer("en", "2026-11-03").answer, "No: today, Tuesday 3 November, is not a public holiday in Catalonia.");
  assert.equal(todayAnswer("es", "2026-11-03").tomorrowValue, "No — miércoles 4 de noviembre");
  assert.deepEqual(
    todayAnswer("es", "2026-11-03").next.map((n) => `${n.when} — ${n.name}`),
    ["martes 8 de diciembre — la Inmaculada", "viernes 25 de diciembre — Navidad", "sábado 26 de diciembre — San Esteban"],
  );
  assert.equal(todayAnswer("es", "2026-12-08").answer, "Sí: hoy, martes 8 de diciembre, es festivo en Cataluña (la Inmaculada).");
  // Across the year boundary the year is printed.
  assert.equal(todayAnswer("es", "2026-12-26").next[0]?.when, "viernes 1 de enero de 2027");
});

test("Aran's swaps are flagged on the day, tomorrow and in the list (26 Dec 2026, 29 Mar 2027)", () => {
  assert.match(todayAnswer("es", "2026-12-26").answer, /\(San Esteban; excepto en Arán\)\.$/);
  assert.match(todayAnswer("ca", "2027-03-28").tomorrowValue, /\(excepte a l'Aran\)$/);
  const list = todayAnswer("en", "2026-11-03").next;
  assert.equal(list.find((n) => n.date === "2026-12-26")?.aran, "except in Aran");
  assert.equal(list.find((n) => n.date === "2026-12-08")?.aran, null);
});

test("the next three link to their date pages, 2027 included", () => {
  for (const locale of LOCALES) {
    for (const n of todayAnswer(locale, "2026-11-03").next) assert.equal(n.href, datePath(locale, n.date), `${locale} ${n.date}`);
    for (const n of todayAnswer(locale, "2027-01-02").next) {
      assert.ok(isDatePage(n.date) && n.href?.endsWith("-2027/"), `${locale} ${n.date}: ${n.href}`);
    }
  }
});

test("a year with no published order gets neither yes nor no", () => {
  for (const locale of LOCALES) {
    const a = todayAnswer(locale, "2028-03-01");
    assert.doesNotMatch(a.answer, /^(No|Sí|Yes):/, locale);
    assert.equal(a.next.length, 0);
    assert.ok(a.nextUnknown.length > 10);
  }
});

test("the block is the first thing in the body, before the lead", () => {
  for (const locale of LOCALES) assert.equal(buildBody(locale)[0]?.type, "holidayToday", locale);
});

test("the block takes its first screen from today-answer, links the year planner and counts no days", () => {
  const source = readFileSync(new URL("../src/components/blocks/HolidayToday.tsx", import.meta.url), "utf8");
  assert.match(source, /todayAnswer\(locale, today\)/);
  assert.match(source, /GUIDES\.workCalendar\[locale\]/);
  assert.doesNotMatch(source, /daysBetween|inDays/);
});

test("the live description names the next three holidays, the next one first", () => {
  assert.equal(
    liveTodayDescription("es", "2026-11-03"),
    "Próximo festivo en toda Cataluña: martes 8 de diciembre (la Inmaculada). Después, 25 y 26 de diciembre. Si hoy o mañana es festivo y dónde es fiesta local.",
  );
  assert.match(liveTodayDescription("ca", "2026-11-03")!, /Després, 25 i 26 de desembre\./);
  assert.match(liveTodayDescription("en", "2026-11-03")!, /Then 25 and 26 December\./);
  assert.match(liveTodayDescription("es", "2026-12-25")!, /Después, 26 de diciembre y 1 de enero\./);
  // Not "toda Cataluña" on a day Aran does not keep.
  assert.match(liveTodayDescription("es", "2026-12-26")!, /^Próximo festivo en Cataluña: sábado 26 de diciembre/);
  assert.match(liveTodayDescription("es", "2027-03-29")!, /^Próximo festivo en Cataluña: lunes 29 de marzo/);
  for (const locale of LOCALES) {
    assert.match(liveTodayTitle(locale, "2026-11-03")!, /^(Avui és festiu a Catalunya\?|¿Es festivo hoy en Cataluña\?|Is today a holiday in)/, locale);
  }
});
