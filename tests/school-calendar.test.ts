import assert from "node:assert/strict";
import { test } from "node:test";

import { bodySchema } from "../src/lib/content/blocks.ts";
import { addDays, todayInCatalonia, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { liveEntryDescription, liveEntryTitle } from "../src/lib/content/live-title.ts";
import {
  SCHOOL_DESCRIPTION_MAX,
  SCHOOL_TITLE_MAX,
  bridgeDays,
  generalSchoolDays,
  liveSchoolDescription,
  liveSchoolTitle,
  nextHolidayInTerm,
  schoolDay,
  schoolDayLine,
} from "../src/lib/content/school/snippet.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import { SCHOOL_YEARS, isSchoolCovered, schoolStatusOn } from "../src/lib/content/school/calendar.ts";
import { COPY, buildBody, schoolBridges } from "../src/lib/content/school/publish.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";

test("the calendar still covers today, or the build fails", () => {
  assert.ok(isSchoolCovered(todayInCatalonia()), "Ordre EDF/66/2026 runs out: add the next order");
});

test("dates are in order and land on weekdays where the order sets a weekday", () => {
  for (const y of SCHOOL_YEARS) {
    assert.ok(y.start < y.christmas[0] && y.christmas[1] < y.easter[0] && y.easter[1] < y.end, y.label);
    assert.ok(y.endBatxillerat1 <= y.end, y.label);
    for (const iso of [y.start, y.end, y.endBatxillerat1]) {
      const wd = weekdayIndex(iso);
      assert.ok(wd >= 1 && wd <= 5, `${y.label} ${iso} is a weekend`);
    }
  }
});

test("the status follows the DOGC dates", () => {
  assert.equal(schoolStatusOn("2026-10-07").kind, "term");
  const term = schoolStatusOn("2026-10-07");
  assert.ok(term.kind === "term" && term.nextBreak.kind === "christmas" && term.nextBreak.from === "2026-12-22");
  assert.equal(schoolStatusOn("2026-12-22").kind, "christmas");
  assert.equal(schoolStatusOn("2027-01-07").kind, "christmas");
  assert.equal(schoolStatusOn("2027-01-08").kind, "term");
  assert.equal(schoolStatusOn("2027-03-25").kind, "easter");
  const summer = schoolStatusOn("2027-07-15");
  assert.ok(summer.kind === "summer" && summer.nextStart.start === "2027-09-08");
  assert.equal(schoolStatusOn("2029-07-01").kind, "unknown");
  assert.equal(schoolStatusOn("2026-08-01").kind, "unknown");
});

test("every edition validates, shows the calendar first, has a photo and no year in the slug", () => {
  const keys = new Set(IMAGES.map((image) => image.key));
  assert.ok(keys.has("calendari-escolar-escola-vic-pati"));
  assert.ok(keys.has("calendari-escolar-grup-ramon-llull"));
  for (const locale of LOCALES) {
    const body = buildBody(locale, "00000000-0000-4000-8000-000000000000");
    bodySchema.parse(body);
    const block = body.findIndex((b) => b.type === "schoolCalendar");
    const heading = body.findIndex((b) => b.type === "heading");
    assert.ok(block >= 0 && block < heading, locale);
    assert.ok(body.some((b) => b.type === "image"), locale);
    assert.ok(!/\d{4}/.test(COPY[locale].path), locale);
    assert.ok(COPY[locale].seoTitle.length <= 60, `${locale}: ${COPY[locale].seoTitle.length}`);
  }
});

/* -------------------------------------------------------------------------- */
/* Page-1 push, 28 Oct 2026                                                   */
/* -------------------------------------------------------------------------- */

const Y = SCHOOL_YEARS[0]!;

test("titles carry the year and the search descriptions name the order's dates", () => {
  const dates: Record<string, RegExp[]> = {
    ca: [/8 de setembre/, /22 de desembre al 7 de gener/, /20 al 29 de març/, /21 de juny/],
    es: [/8 de septiembre/, /22 de diciembre al 7 de enero/, /20 al 29 de marzo/, /21 de junio/],
    en: [/8 September/, /22 December to 7 January/, /20 to 29 March/, /21 June/],
  };
  // Pinned to the 2026-2027 year: when it ends, the descriptions must be rewritten.
  assert.equal(Y.label, "2026-2027");
  assert.deepEqual(
    [Y.start, Y.christmas, Y.easter, Y.end],
    ["2026-09-08", ["2026-12-22", "2027-01-07"], ["2027-03-20", "2027-03-29"], "2027-06-21"],
  );
  for (const locale of LOCALES) {
    const { title, seoTitle, seoDescription } = COPY[locale];
    assert.match(title, /2026-2027/, locale);
    assert.match(seoTitle, /2026-2027/, locale);
    assert.ok(seoDescription.length <= 155, `${locale}: ${seoDescription.length}`);
    for (const pattern of dates[locale]!) assert.match(seoDescription, pattern, locale);
  }
});

test("the days-off table lists every Catalonia-wide holiday on a school day, and both breaks", () => {
  const holidays = { ca: ["Diada", "Immaculada"], es: ["Diada", "Inmaculada"], en: ["National Day of Catalonia", "Immaculate Conception"] };
  const christmas = {
    ca: /22 de desembre de 2026 al .*7 de gener de 2027/,
    es: /22 de diciembre de 2026 al .*7 de enero de 2027/,
    en: /22 December 2026 to .*7 January 2027/,
  };
  for (const locale of LOCALES) {
    const body = buildBody(locale);
    const table = body.find((b) => b.type === "table");
    assert.ok(table && table.type === "table", locale);
    const text = JSON.stringify(table.rows);
    for (const name of holidays[locale]) assert.ok(text.includes(name), `${locale}: ${name}`);
    assert.match(text, christmas[locale], locale);
    // The Christmas answer sits above the first heading.
    const callout = body.findIndex((b) => b.type === "callout");
    const heading = body.findIndex((b) => b.type === "heading");
    assert.ok(callout >= 0 && callout < heading, `${locale}: Christmas callout`);
    assert.ok(body.some((b) => b.type === "faq"), `${locale}: FAQ`);
  }
});

test("Barcelona: CEMB days and local days make the 5-8 Dec and 14-17 May long weekends", () => {
  const extra = new Set(["2026-09-24", "2026-10-30", "2026-12-07", "2027-02-08", "2027-05-14", "2027-05-17"]);
  const bridges = schoolBridges(Y, extra);
  const keys = bridges.map((b) => `${b.from}/${b.to}/${b.days}`);
  assert.ok(keys.includes("2026-12-05/2026-12-08/4"), keys.join(" "));
  assert.ok(keys.includes("2027-05-14/2027-05-17/4"), keys.join(" "));
  // A plain weekend is never a bridge, and nothing inside the breaks counts.
  for (const b of bridges) {
    assert.ok(b.days >= 3);
    assert.ok(b.to < Y.christmas[0] || b.from > Y.christmas[1]);
    assert.ok(b.to < Y.easter[0] || b.from > Y.easter[1]);
  }
  // Without any local day, only the Catalonia-wide ones remain.
  assert.deepEqual(schoolBridges(Y, new Set()).map((b) => b.from), ["2026-09-11", "2026-10-10"]);
});

test("the school page sends local questions to the town pages", () => {
  assert.ok(JSON.stringify(buildBody("ca")).includes("(/ca/festius/)"));
  assert.ok(JSON.stringify(buildBody("es")).includes("(/es/festivos/)"));
  assert.ok(JSON.stringify(buildBody("es")).includes("/es/festivos/barcelona/"));
  assert.ok(JSON.stringify(buildBody("en")).includes("/en/guides/local-holidays-catalonia/"));
});

/* -------------------------------------------------------------------------- */
/* Top-3 push, 30 Oct 2026: the snippet names the next day off                */
/* -------------------------------------------------------------------------- */

test("the live title and description fit every day the order covers, in every language", () => {
  const last = SCHOOL_YEARS[SCHOOL_YEARS.length - 1]!.end;
  for (let iso = "2026-09-01"; iso <= last; iso = addDays(iso, 1)) {
    for (const locale of LOCALES) {
      const title = liveSchoolTitle(locale, iso);
      const description = liveSchoolDescription(locale, iso);
      assert.ok(title.length <= SCHOOL_TITLE_MAX && title.length <= 60, `${iso} ${locale}: ${title}`);
      assert.ok(description.length > 40 && description.length <= SCHOOL_DESCRIPTION_MAX, `${iso} ${locale}: ${description}`);
      assert.ok(!/undefined|NaN|\$\{/.test(title + description), `${iso} ${locale}`);
    }
  }
});

test("the title follows the breaks: Christmas until 7 Jan, then Easter, then the last day, then the next start", () => {
  assert.equal(liveSchoolTitle("ca", "2026-10-30"), "Calendari escolar 2026-27 Catalunya: Nadal del 22/12 al 7/1");
  assert.equal(liveSchoolTitle("es", "2026-10-30"), "Calendario escolar 2026-27 Cataluña: Navidad 22/12-7/1");
  assert.match(liveSchoolTitle("en", "2026-10-30"), /Christmas 22 Dec–7 Jan/);
  assert.match(liveSchoolTitle("ca", "2027-01-08"), /Setmana Santa 20-29\/3/);
  assert.match(liveSchoolTitle("es", "2027-04-10"), /termina el 21 de junio/);
  assert.match(liveSchoolTitle("ca", "2027-07-01"), /2027-28 Catalunya: comença el 8\/9/);
});

test("the description leads with the next weekday off for all schools", () => {
  assert.match(liveSchoolDescription("ca", "2026-10-30"), /^Pròxim festiu escolar: dimarts 8 de desembre\. Nadal: del 22 de desembre al 7 de gener\./);
  assert.match(liveSchoolDescription("es", "2026-10-30"), /^Próximo festivo escolar: martes 8 de diciembre\./);
  assert.match(liveSchoolDescription("en", "2026-12-23"), /^Christmas holidays until 7 January: classes restart on Friday 8 January\./);
  assert.equal(nextHolidayInTerm("2026-10-30")?.date, "2026-12-08");
  assert.equal(nextHolidayInTerm("2026-12-09"), null, "after 8 Dec the next day off is the Christmas break itself");
});

test("today and tomorrow: weekend, holiday, bridge day and break are told apart", () => {
  assert.equal(schoolDay("2026-10-31").kind, "weekend");
  assert.equal(schoolDay("2026-12-08").kind, "holiday");
  assert.equal(schoolDay("2026-12-07").kind, "school");
  assert.equal(schoolDay("2026-12-23").kind, "christmas");
  assert.equal(schoolDay("2027-07-15").kind, "summer");
  assert.equal(schoolDayLine("2026-12-08", "ca", "tomorrow"), "Demà, dimarts 8 de desembre: no hi ha classe, és festiu a tot Catalunya (la Immaculada).");
  assert.match(schoolDayLine("2026-12-23", "es", "today"), /Se vuelve a clase el viernes 8 de enero\./);
});

test("the 7 December bridge and the school-day count come from the order and the holiday calendars", () => {
  assert.deepEqual(bridgeDays(Y).map((b) => b.day), ["2026-12-07"]);
  const days = generalSchoolDays(Y);
  assert.equal(days, 183);
  // Minus two local holidays and four free-choice days: inside the 175-178 the law requires.
  assert.ok(days! - 6 >= 175 && days! - 6 <= 178);
  // Years whose holiday calendar is not published yet are not counted.
  assert.equal(generalSchoolDays(SCHOOL_YEARS[2]!), null);
  const questions = { ca: /Hi ha escola el dilluns 7 de desembre\?/, es: /¿Hay cole el lunes 7 de diciembre\?/, en: /Is there school on Monday 7 December\?/ };
  const freeTitles = { ca: "Dies de lliure disposició i festius locals", es: "Días de libre disposición y festivos locales", en: "Free-choice days and local holidays" };
  for (const locale of LOCALES) {
    const body = buildBody(locale);
    const text = JSON.stringify(body);
    assert.match(text, questions[locale], locale);
    assert.ok(body.some((b) => b.type === "heading" && b.text === freeTitles[locale]), locale);
    assert.ok(body.some((b) => b.type === "heading" && /2027-2028 (i|y|and) 2028-2029/.test(b.text)), `${locale}: next years`);
    assert.ok(text.includes("183"), `${locale}: day count`);
  }
});

test("the page metadata uses the live title and description wherever the school block is", async () => {
  const body = [{ type: "schoolCalendar" }] as Parameters<typeof liveEntryDescription>[0];
  for (const locale of LOCALES) {
    assert.equal(await liveEntryTitle(body, locale), liveSchoolTitle(locale, todayInCatalonia()));
    assert.equal(liveEntryDescription(body, locale), liveSchoolDescription(locale, todayInCatalonia()));
  }
  assert.equal(liveEntryDescription([{ type: "paragraph", text: "x" }] as Parameters<typeof liveEntryDescription>[0], "ca"), null);
});
