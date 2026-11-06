import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, type Block } from "../src/lib/content/blocks.ts";
import { DECEMBER_BRIDGE } from "../src/lib/content/batch02/december-bridge.ts";
import {
  SCHOOL_FREE_DAYS,
  SCHOOL_FREE_DAYS_META,
  buildSchoolFreeDaysBody,
  freeDaysDescription,
  freeDaysSources,
  freeDaysTitle,
  inTowns,
  monday7Groups,
  townRows,
} from "../src/lib/content/batch02/school-free-days.ts";
import {
  COURSE,
  FREE_DAYS_AS_OF,
  FREE_DAYS_PENDING,
  FREE_DAYS_REREAD_BY,
  FREE_DAYS_TOWNS,
  MONDAY_7,
  freeDaysProblems,
  localDaysInCourse,
  monday7,
  notASchoolDay,
  townSection,
  type FreeDaysTown,
} from "../src/lib/content/batch02/school-free-days-towns.ts";
import { B2_PATHS, B2_TITLES, b2href } from "../src/lib/content/batch02/shared.ts";
import { daysBetween, todayInCatalonia, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { municipalityBySlug } from "../src/lib/programmatic/holidays/data.ts";

/**
 * School free days 2026-2027 (5 Nov 2026): one row per town from its official
 * source (school-free-days-towns.ts), the hub page (school-free-days.ts), the
 * town holiday pages' section and the December bridge's link.
 *
 * What it must never do: print a day that is not a school day of the course,
 * a row without its source and read date, a town without a published set as
 * if it had one, or touch the titles, descriptions and H1s of the town pages
 * (measurement window, docs/SEO_EXPERIMENTS.md).
 */

const ROOT = new URL("..", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, ROOT), "utf8");
const text = (blocks: Block[]) => bodyToPlainText(blocks);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/* -------------------------------------------------------------------------- */
/* Rows                                                                       */
/* -------------------------------------------------------------------------- */

test("every row has an official https source, a title, a publisher and a read date no later than FREE_DAYS_AS_OF", () => {
  assert.ok(FREE_DAYS_TOWNS.length >= 10, `only ${FREE_DAYS_TOWNS.length} towns`);
  for (const town of FREE_DAYS_TOWNS) {
    assert.match(town.url, /^https:\/\//, town.name);
    assert.ok(town.title.trim() && town.publisher.trim(), town.name);
    assert.match(town.checked, ISO, town.name);
    assert.ok(town.checked <= FREE_DAYS_AS_OF, `${town.name}: read after FREE_DAYS_AS_OF`);
    assert.ok(town.hosts.test(new URL(town.url).host), `${town.name}: ${town.url} is not on its publisher's hosts`);
    assert.doesNotMatch(town.url, /aerobusbcn\.com/);
  }
});

test("every day is a school day of the 2026-2027 course: a weekday, inside the course, not its first or last day, not in the holidays, not a holiday of Catalonia or of the town", () => {
  assert.equal(COURSE.label, "2026-2027");
  for (const town of FREE_DAYS_TOWNS) {
    const local = localDaysInCourse(town.slug);
    for (const day of town.days) {
      assert.match(day, ISO, `${town.name} ${day}`);
      assert.ok(day > COURSE.start && day < COURSE.end, `${town.name} ${day} outside the course`);
      const weekday = weekdayIndex(day);
      assert.ok(weekday >= 1 && weekday <= 5, `${town.name} ${day} is a weekend`);
      assert.equal(notASchoolDay(day, local), null, `${town.name} ${day}`);
    }
  }
});

test("every row passes the validator, has a holiday page, and no town is both listed and pending", () => {
  const listed = new Set<string>();
  for (const town of FREE_DAYS_TOWNS) {
    assert.deepEqual(freeDaysProblems(town, localDaysInCourse(town.slug)), [], town.name);
    assert.ok(municipalityBySlug(town.slug), `${town.slug} has no holiday page`);
    assert.ok(!listed.has(town.slug), `${town.slug} twice`);
    listed.add(town.slug);
  }
  for (const p of FREE_DAYS_PENDING) {
    assert.ok(!listed.has(p.slug), `${p.slug} is listed and pending`);
    assert.ok(municipalityBySlug(p.slug), `${p.slug} has no holiday page`);
    assert.match(p.watch, /^https:\/\//, p.name);
    assert.ok(p.hosts.test(new URL(p.watch).host), `${p.name}: ${p.watch} is not the council's own site`);
    assert.match(p.checked, ISO, p.name);
    assert.ok(p.checked <= FREE_DAYS_AS_OF, `${p.name}: read after FREE_DAYS_AS_OF`);
    listed.add(p.slug);
  }
});

test("the validator refuses a weekend, a holiday, a local holiday, a day in the Christmas break, a press cutting and a read after the check date", () => {
  const good: FreeDaysTown = { ...FREE_DAYS_TOWNS.find((t) => t.slug === "barcelona")! };
  assert.deepEqual(freeDaysProblems(good, localDaysInCourse("barcelona")), []);
  const bad = (patch: Partial<FreeDaysTown>, local: string[] = []) => freeDaysProblems({ ...good, ...patch }, local);
  assert.ok(bad({ days: ["2026-12-05"] }).some((p) => /weekend/.test(p)));
  assert.ok(bad({ days: ["2026-12-08"] }).some((p) => /Catalonia-wide holiday/.test(p)));
  assert.ok(bad({ days: ["2026-12-22"] }).some((p) => /Christmas/.test(p)));
  assert.ok(bad({ days: ["2027-03-22"] }).some((p) => /Easter/.test(p)));
  assert.ok(bad({ days: ["2026-09-08"] }).some((p) => /first or last day/.test(p)));
  assert.ok(bad({ days: ["2026-12-07"] }, ["2026-12-07"]).some((p) => /local holiday/.test(p)));
  assert.ok(bad({ days: ["2025-12-08"] }).some((p) => /outside the course|weekend|holiday/.test(p)));
  assert.ok(bad({ url: "https://www.lavanguardia.com/local/barcelona/20260611/dies.html" }).some((p) => /not the publisher's own site/.test(p)));
  assert.ok(bad({ checked: "2099-01-01" }).some((p) => /after FREE_DAYS_AS_OF/.test(p)));
  assert.ok(bad({ days: ["2026-12-07", "2026-10-30"] }).some((p) => /order/.test(p)));
  assert.ok(bad({ days: [] }).some((p) => /no days/.test(p)));
});

test("Barcelona's row is the CEMB proposal of 10 June 2026", () => {
  const bcn = FREE_DAYS_TOWNS.find((t) => t.slug === "barcelona")!;
  assert.deepEqual(bcn.days, ["2026-10-30", "2026-12-07", "2027-02-08", "2027-05-14"]);
  assert.equal(bcn.kind, "proposal");
  assert.equal(monday7(bcn), "free");
});

test("Monday 7 December is a Monday and a working day in Catalonia; a town where it is a local holiday never lists it as a free day", () => {
  assert.equal(weekdayIndex(MONDAY_7), 1);
  for (const town of FREE_DAYS_TOWNS) {
    if (localDaysInCourse(town.slug).includes(MONDAY_7)) {
      assert.equal(monday7(town), "local", town.name);
      assert.ok(!town.days.includes(MONDAY_7), town.name);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Freshness                                                                  */
/* -------------------------------------------------------------------------- */

test("re-read the councils before the next block (Carnaval): fails from FREE_DAYS_REREAD_BY until the rows are re-read and the dates moved", () => {
  assert.ok(FREE_DAYS_REREAD_BY > FREE_DAYS_AS_OF, "FREE_DAYS_REREAD_BY must be after FREE_DAYS_AS_OF");
  assert.ok(daysBetween(FREE_DAYS_AS_OF, FREE_DAYS_REREAD_BY) <= 70, "re-read at most 70 days after the last check");
  // Before the Carnaval block (4-9 February 2027), whatever the dates are moved to.
  if (FREE_DAYS_AS_OF < "2027-02-01") assert.ok(FREE_DAYS_REREAD_BY <= "2027-01-25", "the next re-read must come before Carnaval");
  const today = todayInCatalonia();
  assert.ok(
    today < FREE_DAYS_REREAD_BY,
    `FREE_DAYS_AS_OF is ${FREE_DAYS_AS_OF}: re-read every row's url and every pending town's watch page (school-free-days-towns.ts, HOW TO UPDATE), add the councils that have published, move FREE_DAYS_AS_OF and FREE_DAYS_REREAD_BY, deploy and publish \`lliure-disposicio\``,
  );
});

/* -------------------------------------------------------------------------- */
/* Hub page                                                                   */
/* -------------------------------------------------------------------------- */

test("the hub answers 7 December first, then the town table, then how the system works", () => {
  for (const locale of LOCALES) {
    const blocks = SCHOOL_FREE_DAYS.editions[locale].blocks;
    bodySchema.parse(blocks);
    const leadText = text(blocks.slice(0, 1));
    assert.match(leadText, /7 de desembre|7 de diciembre|7 December/, locale);
    const tableAt = blocks.findIndex((b) => b.type === "table");
    const howAt = blocks.findIndex((b) => b.type === "heading" && /Com funcionen|Cómo funcionan|How school free days work/.test((b as { text: string }).text));
    assert.ok(tableAt > 0 && howAt > tableAt, `${locale}: table before how-it-works`);
    const rows = (blocks[tableAt] as { rows: string[][] }).rows;
    assert.equal(rows.length, FREE_DAYS_TOWNS.length, locale);
    assert.deepEqual(rows, townRows(locale));
  }
});

test("each table row names the town, its 7 December status, its days and its source link", () => {
  for (const locale of LOCALES) {
    const rows = townRows(locale);
    for (const town of FREE_DAYS_TOWNS) {
      const row = rows.find((r) => r[0]!.toLowerCase().includes(town.name.toLowerCase()));
      assert.ok(row, `${locale}: ${town.name}`);
      assert.ok(row[3]!.includes(`](${town.url})`), `${locale}: ${town.name} source`);
      assert.ok(town.days.every((d) => row[2]!.includes(d.slice(0, 4))), `${locale}: ${town.name} years`);
    }
  }
});

test("the counts in the lead, the key facts and the description add up", () => {
  const groups = monday7Groups();
  assert.equal(groups.free.length + groups.local.length + groups.school.length, FREE_DAYS_TOWNS.length);
  assert.equal(inTowns(3, 3, "ca"), "als 3 municipis");
  assert.equal(inTowns(2, 3, "es"), "en 2 de los 3 municipios");
  for (const locale of LOCALES) {
    const lead = text(SCHOOL_FREE_DAYS.editions[locale].blocks.slice(0, 1));
    assert.ok(lead.includes(inTowns(groups.free.length, FREE_DAYS_TOWNS.length, locale)), `${locale}: ${lead.slice(0, 120)}`);
    assert.ok(freeDaysDescription(locale).includes(String(FREE_DAYS_TOWNS.length)), locale);
  }
});

test("the pending towns are listed as not published, each with its council's link", () => {
  for (const locale of LOCALES) {
    const json = JSON.stringify(buildSchoolFreeDaysBody(locale));
    for (const p of FREE_DAYS_PENDING) assert.ok(json.includes(`](${p.watch})`), `${locale}: ${p.name}`);
  }
});

test("title, description, paths and rail title", () => {
  for (const locale of LOCALES) {
    const edition = SCHOOL_FREE_DAYS.editions[locale];
    assert.equal(edition.path, B2_PATHS.schoolFreeDays[locale]);
    assert.equal(SCHOOL_FREE_DAYS_META[locale].path, B2_PATHS.schoolFreeDays[locale]);
    assert.ok(freeDaysTitle(locale).length <= 60, `${locale}: ${freeDaysTitle(locale)}`);
    assert.ok(freeDaysDescription(locale).length <= 155, `${locale}: ${freeDaysDescription(locale)}`);
    assert.match(edition.seoTitle, /7 (de desembre|de diciembre|December)/);
    assert.match(B2_TITLES.schoolFreeDays[locale], /2026-2027/);
    assert.doesNotMatch(B2_PATHS.schoolFreeDays[locale], /20\d\d/, "no year in the path");
  }
});

test("every town source is in the article's sources once, with the school calendar order", () => {
  const sources = freeDaysSources();
  const urls = sources.map((s) => s.url);
  assert.equal(new Set(urls).size, urls.length);
  for (const town of FREE_DAYS_TOWNS) assert.ok(urls.includes(town.url), town.name);
  assert.ok(sources.some((s) => /EDF\/66\/2026/.test(s.name)));
  assert.deepEqual(SCHOOL_FREE_DAYS.sources, sources);
});

test("the hub never says Monday 7 is a holiday in Catalonia and keeps the school's own choice in view", () => {
  for (const locale of LOCALES) {
    const body = text(SCHOOL_FREE_DAYS.editions[locale].blocks);
    assert.doesNotMatch(body, /dilluns 7 (és|serà) festiu a (tot )?Catalunya|lunes 7 es festivo en (toda )?Cataluña|Monday 7 December is a (public )?holiday in Catalonia/i, locale);
    assert.match(body, /confirma-ho amb el centre|confírmalo con el centro|check with yours/, locale);
    assert.match(body, /EDF\/66\/2026/, locale);
  }
});

/* -------------------------------------------------------------------------- */
/* Town holiday pages                                                         */
/* -------------------------------------------------------------------------- */

test("the town section exists for towns with data only, answers 7 December and cites its source", () => {
  for (const locale of ["ca", "es"] as const) {
    const href = b2href("schoolFreeDays", locale);
    for (const town of FREE_DAYS_TOWNS) {
      const section = townSection(town.slug, locale, href);
      assert.ok(section, `${locale}: ${town.name}`);
      assert.match(section.answer, /^(Dilluns 7 de desembre|Lunes 7 de diciembre) de 2026: /);
      assert.equal(section.source.url, town.url);
      assert.match(section.source.read, /2026/);
      assert.equal(section.hub.href, href);
    }
    for (const p of FREE_DAYS_PENDING) assert.equal(townSection(p.slug, locale, href), null, `${locale}: ${p.name}`);
    assert.equal(townSection("not-a-town", locale, href), null);
  }
});

test("the town page renderer gains one line and its titles, descriptions and H1s do not change", () => {
  const page = read("src/components/programmatic/holidays/MunicipalityPage.tsx");
  assert.equal(page.split("<SchoolFreeDays ").length - 1, 1);
  for (const file of ["src/lib/programmatic/holidays/copy.ts", "src/components/programmatic/holidays/routes.tsx"]) {
    assert.doesNotMatch(read(file), /school-free-days|lliure disposició escolar/, file);
  }
});

/* -------------------------------------------------------------------------- */
/* December bridge and publish route                                          */
/* -------------------------------------------------------------------------- */

test("the December bridge links the hub once, in the body, and keeps its title and description", () => {
  const titles: Record<Locale, string> = {
    ca: "Pont de desembre 2026 a Catalunya: festius i dies a demanar",
    es: "Puente de diciembre 2026 Cataluña: festivos y qué días pedir",
    en: "December 2026 public holidays in Catalonia: 8, 25 and 26 Dec",
  };
  for (const locale of LOCALES) {
    const edition = DECEMBER_BRIDGE.editions[locale];
    const href = b2href("schoolFreeDays", locale);
    assert.equal(JSON.stringify(edition.blocks).split(`](${href})`).length - 1, 1, `${locale}: bridge -> hub`);
    assert.equal(edition.seoTitle, titles[locale]);
    assert.doesNotMatch(edition.seoDescription, /lliure|libre disposición|free days/);
  }
});

test("the hub links back to the December bridge", () => {
  for (const locale of LOCALES) {
    assert.ok(JSON.stringify(SCHOOL_FREE_DAYS.editions[locale].blocks).includes(`](${b2href("decemberBridge", locale)})`), locale);
  }
});

test("the publish route registers `lliure-disposicio` and `lliure-disposicio-links`", () => {
  const route = read("src/app/api/admin/publish/route.ts");
  assert.match(route, /wants\("lliure-disposicio"\)\) published\.push\(await publishB2Article\(SCHOOL_FREE_DAYS\)\)/);
  assert.match(route, /wants\("lliure-disposicio-links"\)\) published\.push\(await publishB2Article\(DECEMBER_BRIDGE\)\)/);
});
