import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { CALCOTS } from "../src/lib/content/batch02/calcots.ts";
import {
  CARNIVAL,
  CARNIVAL_AS_OF,
  CARNIVAL_GUIDE,
  CARNIVAL_WEEK,
  PROGRAMMES_2027,
  buildCarnivalBody,
  carnivalLocalDays,
  carnivalSchoolDays,
  programmeProblems,
  regionalHolidaysInWeek,
  type CarnivalTown,
} from "../src/lib/content/batch02/carnival.ts";
import { SITGES } from "../src/lib/content/batch02/coast-trips.ts";
import { B2_PATHS, B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import { weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { IMAGES } from "../src/lib/content/images.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { nextYearPublished } from "../src/lib/programmatic/holidays/data.ts";

const json = (locale: Locale) => JSON.stringify(CARNIVAL_GUIDE.editions[locale].blocks);
const text = (locale: Locale) => bodyToPlainText(CARNIVAL_GUIDE.editions[locale].blocks);
const links = (locale: Locale) => [...json(locale).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!);
const today = new Date().toISOString().slice(0, 10);

test("carnival: the 2027 week is computed from the calendar's Easter (28 March)", () => {
  assert.equal(CARNIVAL.easterSunday, "2027-03-28");
  assert.equal(CARNIVAL.dijousGras, "2027-02-04");
  assert.equal(CARNIVAL.sunday, "2027-02-07");
  assert.equal(CARNIVAL.monday, "2027-02-08");
  assert.equal(CARNIVAL.tuesday, "2027-02-09");
  assert.equal(CARNIVAL.ashWednesday, "2027-02-10");
  assert.equal(weekdayIndex(CARNIVAL.dijousGras), 4, "Dijous Gras is a Thursday");
  assert.equal(weekdayIndex(CARNIVAL.ashWednesday), 3, "Ash Wednesday is a Wednesday");
  assert.deepEqual(CARNIVAL_WEEK, ["2027-02-04", "2027-02-05", "2027-02-06", "2027-02-07", "2027-02-08", "2027-02-09", "2027-02-10"]);
});

test("carnival: no Catalonia-wide holiday falls in the week (the page says it is not a public holiday)", () => {
  assert.deepEqual(regionalHolidaysInWeek(), []);
});

test("carnival: local days come from the council acts (pending) or the DOGC order, all inside the week", () => {
  const days = carnivalLocalDays();
  assert.ok(days.length >= 20, `only ${days.length} local days`);
  for (const d of days) {
    assert.ok(CARNIVAL_WEEK.includes(d.date), `${d.town.slug}: ${d.date}`);
    if (!nextYearPublished()) {
      assert.ok(d.council, `${d.town.slug}: a council act while the DOGC order is not out`);
      assert.match(d.council!.source.url, /^https:\/\//);
    }
  }
  assert.ok(days.some((d) => d.town.slug === "vilanova-i-la-geltru" && d.date === CARNIVAL.monday), "Vilanova on Carnival Monday");
  const pendingLabel = { ca: /pendent del DOGC/, es: /pendiente del DOGC/, en: /pending the DOGC/ } as const;
  for (const locale of LOCALES) {
    if (!nextYearPublished()) assert.match(json(locale), pendingLabel[locale], `${locale}: council days are labelled pending`);
  }
});

test("carnival: school free days are the table's own, and Monday 8 is the most common", () => {
  const towns = carnivalSchoolDays();
  assert.ok(towns.length >= 20);
  const monday = towns.filter((t) => t.days.includes(CARNIVAL.monday)).length;
  for (const day of CARNIVAL_WEEK) assert.ok(towns.filter((t) => t.days.includes(day)).length <= monday, day);
  assert.ok(towns.some((t) => t.town.slug === "barcelona" && t.days.includes(CARNIVAL.monday)), "Barcelona's free day is Monday 8");
  for (const locale of LOCALES) assert.match(text(locale), /(cada escola decideix|cada centro decide|each school decides)/, `${locale}: says schools confirm`);
});

test("carnival: three editions on year-free registry paths, valid, substantial, same shape", () => {
  assert.equal(CARNIVAL_GUIDE.key, "carnival");
  assert.equal(CARNIVAL_GUIDE.entryKey, "guide-carnival-catalonia");
  const shape = (locale: Locale) => (CARNIVAL_GUIDE.editions[locale].blocks as Block[]).map((b) => b.type).join(",");
  for (const locale of LOCALES) {
    const edition = CARNIVAL_GUIDE.editions[locale];
    assert.equal(edition.path, B2_PATHS.carnival[locale]);
    assert.doesNotMatch(edition.path, /\d{4}/, `${locale}: the path rolls over to 2028`);
    assert.ok(B2_TITLES.carnival[locale].length > 20);
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(text(locale)) > 1000, `${locale}: ${wordCount(text(locale))} words`);
    assert.equal(shape(locale), shape("es"), `${locale}: same sections as Spanish`);
    assert.deepEqual(buildCarnivalBody(locale), edition.blocks);
    assert.ok(edition.seoTitle.length > 10 && edition.seoTitle.length <= 65, `${locale} seoTitle ${edition.seoTitle.length}`);
    assert.ok(edition.seoDescription.length > 60 && edition.seoDescription.length <= 165, `${locale} description ${edition.seoDescription.length}`);
    assert.match(edition.seoTitle, /2027/);
  }
});

test("carnival: the lead answers when, whether it is a holiday, school, and the Sitges parades", () => {
  const facts: Record<Locale, RegExp[]> = {
    ca: [/dijous 4 de febrer/, /dimecres 10 de febrer/, /No és festiu a Catalunya/, /dilluns 8 de febrer/, /diumenge 7/, /dimarts 9/],
    es: [/jueves 4 de febrero/, /miércoles 10 de febrero/, /No es festivo en Cataluña/, /lunes 8 de febrero/, /domingo 7/, /martes 9/],
    en: [/Thursday 4 February/, /Wednesday 10 February/, /not a public holiday in Catalonia/, /Monday 8 February/, /Sunday 7/, /Tuesday 9/],
  };
  for (const locale of LOCALES) {
    const lead = CARNIVAL_GUIDE.editions[locale].blocks[0] as { text?: string; lead?: boolean };
    assert.ok(lead.lead);
    for (const fact of facts[locale]) assert.match(lead.text ?? "", fact, `${locale}: ${fact}`);
  }
});

test("carnival: no times, routes or 2026 details printed as 2027 (none is published)", () => {
  for (const locale of LOCALES) {
    assert.doesNotMatch(text(locale), /\.pdf\)|\]\(/, `${locale}: a link URL leaked into the text (unencoded parenthesis)`);
    assert.doesNotMatch(text(locale), /\b([01]?\d|2[0-3])[:.][0-5]\d\b/, `${locale}: no clock times`);
    assert.doesNotMatch(text(locale), /1980|15 participants|15 participantes/, `${locale}: nothing from the uncited history page`);
  }
});

test("carnival: sources are https, unique by URL, and the unverifiable host is not used", () => {
  const urls = CARNIVAL_GUIDE.sources.map((s) => s.url);
  assert.equal(new Set(urls).size, urls.length, "no duplicate source URL (it breaks the publish)");
  for (const url of urls) {
    assert.match(url, /^https:\/\//, url);
    assert.doesNotMatch(url, /utm_|aerobus/i, url);
  }
  for (const locale of LOCALES) {
    for (const href of links(locale).filter((h) => h.startsWith("http"))) {
      assert.ok(!href.startsWith("https://www.platjadaro.com/"), `${locale}: platjadaro.com's owner is not stated`);
    }
  }
});

test("carnival: internal links stay in the edition's language and end in a slash", () => {
  for (const locale of LOCALES) {
    for (const href of links(locale).filter((h) => h.startsWith("/"))) {
      assert.ok(href.startsWith(`/${locale}/`), `${locale}: ${href} crosses languages`);
      assert.match(href, /\/$/, href);
    }
    assert.ok(links(locale).includes(b2href("schoolFreeDays", locale)), `${locale}: links the school free-days page`);
    assert.ok(links(locale).includes(b2href("sitges", locale)), `${locale}: links the Sitges day trip`);
  }
});

test("carnival: programme notices are the organisers' own, and none is still missing from 25 Jan 2027", () => {
  for (const [town, notice] of Object.entries(PROGRAMMES_2027) as [CarnivalTown, (typeof PROGRAMMES_2027)[CarnivalTown]][]) {
    if (notice) assert.deepEqual(programmeProblems(town, notice), [], town);
  }
  assert.ok(programmeProblems("sitges", { published: "2026-11-13", url: "http://www.visitsitges.com/x" }).length > 0, "http rejected");
  assert.ok(programmeProblems("sitges", { published: "2026-11-13", url: "https://radicalstorage.com/x" }).length > 0, "aggregator rejected");
  assert.ok(programmeProblems("barcelona", { published: "2025-12-01", url: "https://www.barcelona.cat/x" }).length > 0, "last year's post rejected");
  const missing = Object.entries(PROGRAMMES_2027).filter(([, n]) => n === null).map(([t]) => t);
  assert.ok(today < "2027-01-25" || missing.length === 0, `Carnival programmes still missing on ${today}: ${missing.join(", ")}. Read each organiser's 2027 post, fill PROGRAMMES_2027, print the dated events, republish \`carnaval\``);
});

test("carnival: the page expires with the week (roll it to 2028 after Ash Wednesday)", () => {
  assert.equal(CARNIVAL_GUIDE.verifiedAt, CARNIVAL_AS_OF);
  assert.ok(today <= CARNIVAL.ashWednesday, `Carnival ${CARNIVAL.ashWednesday.slice(0, 4)} is over: move the page to the next year (dates, council and school data, programmes)`);
});

test("carnival: hero exists; the Sitges guide and the calçots guide link here; the route has both groups", () => {
  assert.ok(IMAGES.some((image) => image.key === CARNIVAL_GUIDE.heroKey));
  for (const locale of LOCALES) {
    const target = `](${b2href("carnival", locale)})`;
    assert.ok(JSON.stringify(SITGES.editions[locale].blocks).includes(target), `sitges ${locale}`);
    assert.ok(JSON.stringify(CALCOTS.editions[locale].blocks).includes(target), `calçots ${locale}`);
  }
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /wants\("carnaval"\)\) published\.push\(await publishB2Article\(CARNIVAL_GUIDE\)\)/);
  assert.match(route, /wants\("carnaval-links"\)\) published\.push\(await publishB2Article\(SITGES\), await publishB2Article\(CALCOTS\)\)/);
});
