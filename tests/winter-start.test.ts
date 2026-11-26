import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { WINTER_START } from "../src/lib/content/batch02/climate.ts";
import { B2_PATHS, b2href } from "../src/lib/content/batch02/shared.ts";
import {
  BARCELONA_DAYS,
  BARCELONA_FLAT,
  EARLY_LATE,
  GEMINIDS_2026,
  SEASONS,
  SOLSTICE_SUN,
  WINTER_2026,
  WINTER_AS_OF,
  WINTER_REREAD_BY,
  WINTER_SOURCES,
  WINTER_START_GUIDE,
  buildWinterStartBody,
  daylight,
  minutesOf,
} from "../src/lib/content/batch02/winter-start.ts";
import { changesInYear } from "../src/lib/content/clock/rule.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";

const today = new Date().toISOString().slice(0, 10);
const json = (locale: Locale) => JSON.stringify(WINTER_START_GUIDE.editions[locale].blocks);
const text = (locale: Locale) => bodyToPlainText(WINTER_START_GUIDE.editions[locale].blocks);
const lead = (locale: Locale) => (WINTER_START_GUIDE.editions[locale].blocks[0] as { text: string }).text;
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("winter start: IGN dates, weekdays and the clock rule", () => {
  assert.equal(WINTER_2026.start, "2026-12-21");
  assert.equal(WINTER_2026.time, "21:50");
  assert.equal(weekdayIndex(WINTER_2026.start), 1, "21 December 2026 is a Monday");
  assert.equal(weekdayIndex(WINTER_2026.end), 6, "20 March 2027 is a Saturday");
  assert.equal(weekdayIndex(GEMINIDS_2026.peak), 1, "14 December 2026 is a Monday");
  assert.deepEqual({ date: WINTER_START.date, time: WINTER_START.time }, { date: WINTER_2026.start, time: WINTER_2026.time }, "same start as the weather guide");
  assert.equal(changesInYear(2026)[1]!.date, "2026-10-25");
  assert.equal(changesInYear(2027)[0]!.date, "2027-03-28");
  assert.equal(SEASONS.at(-1)!.time, null, "IGN has not published the hour of spring 2027");
  assert.equal(SEASONS.at(-1)!.date, WINTER_2026.end);
  const winter = SEASONS.find((s) => s.key === "winter")!;
  assert.deepEqual([winter.date, winter.time, winter.days, winter.hours], [WINTER_2026.start, WINTER_2026.time, WINTER_2026.days, WINTER_2026.hours]);
});

test("winter start: the sun tables agree with each other and with IGN's Madrid sentence", () => {
  const madrid = SOLSTICE_SUN.find((r) => r.city === "Madrid")!;
  assert.equal(daylight(madrid.rise, madrid.set), "9 h 17 min", "IGN: 9 horas y 17 minutos de Sol");
  assert.equal(daylight(madrid.juneRise, madrid.juneSet), "15 h 3 min", "IGN: 15 horas y 3 minutos");
  const bcn = SOLSTICE_SUN[0]!;
  const bcn21 = BARCELONA_DAYS.find((d) => d.date === "2026-12-21")!;
  assert.deepEqual([bcn.rise, bcn.set], [bcn21.rise, bcn21.set]);
  assert.equal(minutesOf(bcn.set) - minutesOf(bcn.rise), BARCELONA_FLAT.minutes);
  const early = EARLY_LATE[0]!;
  const bcn13 = BARCELONA_DAYS.find((d) => d.date === "2026-12-13")!;
  assert.deepEqual(bcn13.set, early.set, "13 Dec is inside the earliest-sunset run");
  assert.ok(early.setFrom < "2026-12-13" && early.setTo >= "2026-12-13");
  for (const r of EARLY_LATE) {
    assert.ok(r.setTo < WINTER_2026.start, `${r.city}: the earliest sunset comes before the solstice`);
    assert.ok(r.riseTo > WINTER_2026.start, `${r.city}: the latest sunrise comes after it`);
    const sol = SOLSTICE_SUN.find((s) => s.city === r.city)!;
    assert.ok(minutesOf(r.set) < minutesOf(sol.set) && minutesOf(r.rise) > minutesOf(sol.rise));
  }
});

test("winter start: three editions render, valid, same shape, year-free paths", () => {
  const shape = (locale: Locale) => (WINTER_START_GUIDE.editions[locale].blocks as Block[]).map((b) => b.type).join(",");
  assert.deepEqual(
    LOCALES.map((l) => b2href("winterStart", l)),
    ["/ca/guies/quan-comenca-l-hivern/", "/es/guias/cuando-empieza-el-invierno/", "/en/guides/when-does-winter-start-spain/"],
  );
  for (const locale of LOCALES) {
    const edition = WINTER_START_GUIDE.editions[locale];
    assert.equal(edition.path, B2_PATHS.winterStart[locale]);
    assert.doesNotMatch(edition.path, /\d{4}/);
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(locale)) > 1000, `${locale}: ${wordCount(text(locale))} words`);
    assert.equal(shape(locale), shape("es"));
    assert.deepEqual(buildWinterStartBody(locale), edition.blocks);
    assert.ok(edition.seoTitle.length <= 65, `${locale} seoTitle ${edition.seoTitle.length}`);
    assert.ok(edition.seoDescription.length > 60 && edition.seoDescription.length <= 200, `${locale} description ${edition.seoDescription.length}`);
    assert.match(json(locale), /"type":"faq"/);
    assert.match(lead(locale), /21:50/);
    assert.match(lead(locale), /8:14/);
    assert.match(lead(locale), /17:25/);
    assert.match(json(locale), /\/geminidas/);
    assert.doesNotMatch(json(locale), /undefined|NaN/);
  }
  assert.match(lead("ca"), /dilluns 21 de desembre de 2026/);
  assert.match(lead("es"), /lunes 21 de diciembre de 2026/);
  assert.match(lead("en"), /Monday 21 December 2026/);
});

test("winter start: official sources only, hero exists", () => {
  for (const s of WINTER_SOURCES) assert.match(s.url, /^https:\/\/(astronomia\.ign\.es|cdn\.mitma\.gob\.es)\//, s.url);
  assert.ok(IMAGES.some((image) => image.key === WINTER_START_GUIDE.heroKey));
  assert.equal(WINTER_START_GUIDE.verifiedAt, WINTER_AS_OF);
});

test("winter start: published by its own group, linked from the weather, clock-change and Barcelona winter guides", () => {
  const route = read("src/app/api/admin/publish/route.ts");
  assert.match(route, /wants\("hivern"\)\) published\.push\(await publishB2Article\(WINTER_START_GUIDE\)\)/);
  assert.match(route, /wants\("hivern-links"\)/);
  assert.match(read("src/lib/content/batch02/climate.ts"), /\/ca\/guies\/quan-comenca-l-hivern\/[\s\S]*\/es\/guias\/cuando-empieza-el-invierno\/[\s\S]*\/en\/guides\/when-does-winter-start-spain\//);
  for (const file of ["clock-change.ts", "barcelona-december.ts", "barcelona-winter.ts"]) {
    assert.ok(read(`src/lib/content/batch02/${file}`).includes('"winterStart"'), file);
  }
});

test("winter start: re-read IGN before the page goes stale (spring 2027 hour, next winter)", () => {
  assert.ok(WINTER_AS_OF < WINTER_REREAD_BY);
  assert.ok(
    today < WINTER_REREAD_BY,
    `re-read astronomia.ign.es (primavera 2027 hour; winter 2027-28) and the IGN sun tables, then update winter-start.ts and move WINTER_REREAD_BY (was ${WINTER_REREAD_BY})`,
  );
});
