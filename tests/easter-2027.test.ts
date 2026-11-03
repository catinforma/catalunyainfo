import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { bodySchema, bodyToPlainText, wordCount, type Block } from "../src/lib/content/blocks.ts";
import { MONTSERRAT_FREE } from "../src/lib/content/batch02/day-trips.ts";
import { SIBLING_PATHS } from "../src/lib/content/batch02/december-bridge.ts";
import {
  EASTER,
  EASTER_2027,
  EASTER_META,
  EASTER_OPTIONS,
  EASTER_VERIFIED,
  EASTER_YEAR,
  LOCAL_WINDOW,
  PASSIONS,
  SCHOOL_LABEL,
  TABLE_DAYS,
  buildEasterBody,
  dayRows,
  easterSources,
  localDaysAroundEaster,
  metroRows,
  optionRun,
  schoolBreakWith,
  schoolEdges,
} from "../src/lib/content/batch02/easter-2027.ts";
import { dayDate } from "../src/lib/content/batch02/festive.ts";
import { B2_PATHS, withReadNext } from "../src/lib/content/batch02/shared.ts";
import { OPENING_2027, SHOPS } from "../src/lib/content/batch02/shops.ts";
import { ARTICLE_PATHS } from "../src/lib/content/features/shared.ts";
import { HOLIDAYS_BY_YEAR, addDays, daysBetween, holidayOn, shortDate, weekdayIndex } from "../src/lib/content/holidays/calendar.ts";
import { ARAN_REPLACEMENT, BARCELONA_LOCAL } from "../src/lib/content/holidays/payload.ts";
import { buildBody as buildHolidayBody } from "../src/lib/content/holidays/publish.ts";
import { IMAGE_BY_KEY } from "../src/lib/content/images.ts";
import { metroDay } from "../src/lib/content/metro/tonight.ts";
import { SCHOOL_YEARS } from "../src/lib/content/school/calendar.ts";
import { buildBody as buildSchoolBody } from "../src/lib/content/school/publish.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { hubCopy } from "../src/lib/programmatic/holidays/copy.ts";
import { COUNCIL_2027 } from "../src/lib/programmatic/holidays/council-2027.ts";
import { municipalities, nextYearPublished } from "../src/lib/programmatic/holidays/data.ts";
import { englishHubCopy } from "../src/lib/programmatic/holidays/english-copy.ts";
import { hasEnglishPage } from "../src/lib/programmatic/holidays/english.ts";
import { capitalize, weekdayDayMonth } from "../src/lib/programmatic/holidays/format.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";
import { holidayFamilyPaths, municipalityPath } from "../src/lib/programmatic/holidays/paths.ts";

/**
 * Easter 2027 in Catalonia (31 Oct 2026): one dated page per language.
 *
 * What these tests hold: every date on the page is the shared modules' (the
 * 2027 holiday calendar, the school order, the councils' 2027 days, the shop
 * calendar, the metro model), never a copy; the page never calls Holy
 * Thursday a Catalan holiday or prints a time nobody official published; and
 * the three pages that link to it (work calendar, school calendar, holiday
 * hubs) do so in one sentence each.
 */

const text = (blocks: Block[]) => bodyToPlainText(blocks);
const body = (locale: Locale) => text(EASTER_2027.editions[locale].blocks);
const json = (locale: Locale) => JSON.stringify(EASTER_2027.editions[locale].blocks);
const href = (locale: Locale) => `/${locale}/${B2_PATHS.easter2027[locale]}/`;
const sentences = (plain: string) => plain.split(/(?<=[.!?])\s+/);

const PUBLISHED = new Set([
  ...[...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)].flatMap((paths) =>
    LOCALES.map((locale) => `/${locale}/${paths[locale]}/`),
  ),
  ...holidayFamilyPaths().map((p) => p.path),
]);

/* -------------------------------------------------------------------------- */
/* Structure, SEO, links, photo                                               */
/* -------------------------------------------------------------------------- */

test("three valid, substantial editions on the registry paths the brief set", () => {
  assert.deepEqual(B2_PATHS.easter2027, {
    ca: "guies/setmana-santa-2027-catalunya",
    es: "guias/semana-santa-2027-cataluna",
    en: "guides/easter-2027-catalonia",
  });
  for (const locale of LOCALES) {
    const edition = EASTER_2027.editions[locale];
    const parsed = bodySchema.safeParse(edition.blocks);
    assert.ok(parsed.success, `${locale}: ${JSON.stringify(parsed.error?.issues?.slice(0, 2))}`);
    assert.ok(wordCount(body(locale)) > 1500, `${locale} is thin: ${wordCount(body(locale))}`);
    assert.equal(edition.path, B2_PATHS.easter2027[locale]);
    assert.equal(edition.path, EASTER_META[locale].path);
    assert.match(edition.path, /^[a-z0-9-]+\/[a-z0-9-]+$/);
  }
});

test("the new paths collide with no other published path", () => {
  const holidayFamily = holidayFamilyPaths().map((p) => p.path);
  for (const locale of LOCALES) {
    const all = [...Object.values(B2_PATHS), ...Object.values(ARTICLE_PATHS), ...Object.values(SIBLING_PATHS)].map((paths) => paths[locale]);
    assert.equal(all.filter((path) => path === EASTER_2027.editions[locale].path).length, 1, locale);
    assert.ok(!holidayFamily.includes(href(locale)), locale);
  }
});

test("titles fit in 60 characters and descriptions in 155, both carrying the dates from the calendar", () => {
  const day = (iso: string) => String(Number(iso.slice(8)));
  for (const locale of LOCALES) {
    const { seoTitle, seoDescription, title, excerpt } = EASTER_2027.editions[locale];
    assert.ok(seoTitle.length > 10 && seoTitle.length <= 60, `${locale} title ${seoTitle.length}: ${seoTitle}`);
    assert.ok(seoDescription.length > 60 && seoDescription.length <= 155, `${locale} description ${seoDescription.length}: ${seoDescription}`);
    assert.ok(excerpt.length > 30);
    for (const field of [seoTitle, title]) assert.match(field, new RegExp(String(EASTER_YEAR)));
    for (const field of [seoTitle, seoDescription]) {
      assert.ok(field.includes(day(EASTER.goodFriday)) && field.includes(day(EASTER.easterMonday)), `${locale}: ${field}`);
    }
    assert.ok(seoDescription.includes(day(EASTER.schoolFrom)) && seoDescription.includes(day(EASTER.schoolTo)), `${locale}: school dates`);
  }
  // 3 Nov (CTR sweep): "setmana santa 2027" / "quan és setmana santa 2027" get the week first, Palm Sunday to Easter Sunday.
  assert.match(EASTER_2027.editions.ca.seoDescription, new RegExp(`^Setmana Santa 2027: del ${day(EASTER.palmSunday)} al ${day(EASTER.easterSunday)} de març\\. Festius: Divendres Sant ${day(EASTER.goodFriday)} `));
  assert.match(EASTER_2027.editions.es.seoDescription, new RegExp(`^Semana Santa 2027: del ${day(EASTER.palmSunday)} al ${day(EASTER.easterSunday)} de marzo\\. Festivos: Viernes Santo ${day(EASTER.goodFriday)} `));
  assert.match(EASTER_2027.editions.ca.seoTitle, /^Setmana Santa 2027 a Catalunya/);
  assert.match(EASTER_2027.editions.es.seoTitle, /^Semana Santa 2027 en Cataluña/);
  assert.match(EASTER_2027.editions.en.seoTitle, /^Easter 2027 in Catalonia and Barcelona/);
});

test("sources are https and untracked, include each council printed, and the reader sees the check date", () => {
  assert.equal(EASTER_VERIFIED, "2026-10-31");
  assert.equal(EASTER_2027.verifiedAt, EASTER_VERIFIED);
  assert.deepEqual(EASTER_2027.sources, easterSources());
  for (const source of EASTER_2027.sources) {
    assert.match(source.url, /^https:\/\//, source.url);
    assert.ok(!/[?&]utm_/.test(source.url), source.url);
  }
  for (const day of localDaysAroundEaster()) {
    if (day.council) assert.ok(EASTER_2027.sources.some((s) => s.url === day.council!.source.url), day.town.slug);
  }
  for (const locale of LOCALES) assert.match(body(locale), /31 (d'octubre|de octubre|October) (de )?2026/, locale);
});

test("internal links stay in their language, end in a slash and point at a published path", () => {
  for (const locale of LOCALES) {
    for (const match of json(locale).matchAll(/\]\((\/[^)]*)\)/g)) {
      const link = match[1] ?? "";
      assert.ok(link.startsWith(`/${locale}/`), `${locale} links to ${link}`);
      assert.ok(link.endsWith("/"), link);
      assert.ok(PUBLISHED.has(link), `${locale}: ${link} is not a published path`);
    }
  }
});

test("the read-next box only repeats links from the related rail", () => {
  for (const locale of LOCALES) {
    const before = EASTER_2027.editions[locale].blocks;
    const after = withReadNext([...before], locale);
    assert.equal(after.length - before.length, 1, `${locale}: long enough for a box`);
    const related = before[before.length - 1] as { items?: string[] };
    const box = after.find((b) => b.type === "callout" && (b as { tone?: string }).tone === "tip") as { text: string };
    for (const link of box.text.match(/\]\(([^)]+)\)/g) ?? []) assert.ok(related.items?.some((item) => item.includes(link)), `${locale}: ${link}`);
  }
});

test("no new photograph: the hero is the Montserrat guide's monastery picture with its exact alt and caption", () => {
  assert.ok(EASTER_2027.heroKey && IMAGE_BY_KEY.has(EASTER_2027.heroKey));
  assert.equal(EASTER_2027.heroKey, MONTSERRAT_FREE.secondaryKey);
  assert.deepEqual(EASTER_2027.heroAlt, MONTSERRAT_FREE.secondaryAlt);
  assert.deepEqual(EASTER_2027.heroCaption, MONTSERRAT_FREE.secondaryCaption);
  assert.equal(EASTER_2027.secondaryKey, undefined);
  for (const locale of LOCALES) assert.ok(!EASTER_2027.editions[locale].blocks.some((b) => b.type === "image" || b.type === "gallery"));
});

/* -------------------------------------------------------------------------- */
/* Dates: the shared modules', never a copy                                   */
/* -------------------------------------------------------------------------- */

test("Good Friday and Easter Monday are the 2027 calendar's; the other days are computed around them", () => {
  const calendar = HOLIDAYS_BY_YEAR[EASTER_YEAR] ?? [];
  assert.equal(EASTER.goodFriday, calendar.find((h) => h.name.en === "Good Friday")?.date);
  assert.equal(EASTER.easterMonday, calendar.find((h) => h.name.en === "Easter Monday")?.date);
  assert.deepEqual(
    [EASTER.palmSunday, EASTER.holyThursday, EASTER.goodFriday, EASTER.holySaturday, EASTER.easterSunday, EASTER.easterMonday].map(weekdayIndex),
    [0, 4, 5, 6, 0, 1],
  );
  assert.equal(daysBetween(EASTER.palmSunday, EASTER.easterSunday), 7);
  assert.equal(holidayOn(EASTER.holyThursday), null, "Holy Thursday is not a Catalan holiday");
  assert.ok(holidayOn(EASTER.goodFriday) && holidayOn(EASTER.easterMonday));
  // Aran swaps Easter Monday for the Festa d'Aran (Ordre EMT/52/2026, art. 1.b).
  assert.equal(EASTER.aranReplaces, EASTER.easterMonday);
  assert.equal(EASTER.aranDay, ARAN_REPLACEMENT.date);
  // Pasqua Granada is Barcelona's local day, seven weeks after Easter Monday, outside Holy Week.
  assert.equal(EASTER.whitMonday, BARCELONA_LOCAL.find((h) => h.name.en.startsWith("Whit Monday"))?.date);
  assert.equal(daysBetween(EASTER.easterMonday, EASTER.whitMonday), 49);
});

test("the school break is the school order's, and its edges are computed", () => {
  const year = SCHOOL_YEARS.find((y) => y.label === SCHOOL_LABEL)!;
  assert.deepEqual([EASTER.schoolFrom, EASTER.schoolTo], [...year.easter]);
  assert.ok(EASTER.schoolFrom.startsWith(String(EASTER_YEAR)));
  const { lastClass, firstWeekdayOff, back } = schoolEdges();
  assert.equal(addDays(lastClass, 1), EASTER.schoolFrom, "the break starts the day after the last class");
  assert.equal(weekdayIndex(firstWeekdayOff), 1);
  assert.equal(addDays(EASTER.schoolTo, 1), back);
  assert.equal(holidayOn(back), null);
  for (const locale of LOCALES) {
    const lead = text(EASTER_2027.editions[locale].blocks.slice(0, 1));
    assert.ok(lead.includes(dayDate(back, locale, false)), `${locale}: the lead gives the day classes restart`);
    assert.ok(lead.includes(shortDate(EASTER.goodFriday, locale)) && lead.includes(shortDate(EASTER.easterMonday, locale)), `${locale}: lead dates`);
  }
});

test("the day table calls a day a holiday exactly when the calendar does, and marks Aran on Easter Monday", () => {
  for (const locale of LOCALES) {
    const rows = dayRows(locale);
    assert.equal(rows.length, TABLE_DAYS.length);
    const marked = rows.map((row) => /Festiu a tot Catalunya|Festivo en toda Cataluña|Public holiday across Catalonia/.test(row[2] ?? ""));
    assert.deepEqual(marked, TABLE_DAYS.map((iso) => holidayOn(iso) !== null), locale);
    const monday = rows[TABLE_DAYS.indexOf(EASTER.easterMonday)]![2]!;
    assert.match(monday, /Aran|Arán/, locale);
  }
});

test("the long weekends are runs of the calendar, and the four-day option before Easter is the school break", () => {
  const isOff = (iso: string, leave: readonly string[]) => weekdayIndex(iso) === 0 || weekdayIndex(iso) === 6 || holidayOn(iso) !== null || leave.includes(iso);
  for (const option of EASTER_OPTIONS) {
    const run = optionRun(option);
    for (const day of option.leave) assert.ok(weekdayIndex(day) >= 1 && weekdayIndex(day) <= 5 && holidayOn(day) === null, `${option.id}: ${day} is not a working day`);
    assert.equal(run.days, daysBetween(run.from, run.to) + 1);
    assert.ok(!isOff(addDays(run.from, -1), option.leave) && !isOff(addDays(run.to, 1), option.leave), `${option.id}: the run is not maximal`);
  }
  const none = optionRun(EASTER_OPTIONS.find((o) => o.id === "none")!);
  assert.deepEqual([none.from, none.to], [EASTER.goodFriday, EASTER.easterMonday]);
  const before = optionRun(EASTER_OPTIONS.find((o) => o.id === "weekBefore")!);
  assert.deepEqual([before.from, before.to], [EASTER.schoolFrom, EASTER.schoolTo]);
  const thursday = optionRun(EASTER_OPTIONS.find((o) => o.id === "thursday")!);
  assert.equal(thursday.days, none.days + 1);
});

test("every weekday printed next to a day of the month matches the date", () => {
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
    const pattern = new RegExp(`\\b(${weekdays[locale].join("|")}),? (?:the )?(\\d{1,2})(?:st|nd|rd|th)?(?![\\d:])`, "gu");
    // Letter lookarounds, not \b: "març" ends in a letter \b does not count as one.
    const monthPattern = new RegExp(`(?<!\\p{L})(${months[locale].join("|")})(?!\\p{L})`, "u");
    for (const match of plain.matchAll(pattern)) {
      // The month is the next month name after the day ("del dissabte 20 al dilluns 29 de març").
      const month = plain.slice(match.index!).match(monthPattern)?.[1];
      assert.ok(month, `${locale}: no month after "${match[0]}"`);
      const iso = `${EASTER_YEAR}-${String(months[locale].indexOf(month!) + 1).padStart(2, "0")}-${match[2]!.padStart(2, "0")}`;
      assert.equal(weekdays[locale][weekdayIndex(iso)], match[1], `${locale}: "${match[0]}" read as ${iso}`);
      checked += 1;
    }
  }
  assert.ok(checked > 120, `only ${checked} weekday mentions checked`);
});

test("the page has no clock: the same output on every call, and no reading of today", () => {
  const source = readFileSync(new URL("../src/lib/content/batch02/easter-2027.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /new Date\(\s*\)|Date\.now\(|todayInCatalonia/, "the module reads the clock");
  for (const locale of LOCALES) assert.equal(JSON.stringify(buildEasterBody(locale)), json(locale), locale);
});

/* -------------------------------------------------------------------------- */
/* What the page must say and must never say                                  */
/* -------------------------------------------------------------------------- */

test("the answer is in the lead: two holidays, Holy Thursday a working day", () => {
  const must: Record<Locale, RegExp[]> = {
    ca: [/dos festius: el Divendres Sant/, /Dijous Sant \([^)]*\) és un dia feiner/],
    es: [/dos festivos: el Viernes Santo/, /Jueves Santo \([^)]*\) es laborable/],
    en: [/two public holidays over Easter 2027: Good Friday/, /Maundy Thursday \([^)]*\) is a working day/],
  };
  for (const locale of LOCALES) {
    const lead = text(EASTER_2027.editions[locale].blocks.slice(0, 1));
    for (const pattern of must[locale]) assert.match(lead, pattern, `${locale}: ${pattern}`);
  }
});

test("the page never calls Holy Thursday a holiday in Catalonia", () => {
  const forbidden = [
    /Dijous Sant (és|serà) festiu a (tot )?Catalunya/i,
    /Jueves Santo es festivo en (toda )?Cataluña/i,
    /Maundy Thursday is a (public )?holiday in Catalonia/i,
    /tres festius|tres festivos|three (public )?holidays/i,
  ];
  for (const locale of LOCALES) {
    // Headings and FAQ questions ask it ("El Dijous Sant és festiu a Catalunya?"); statements must not say it.
    const statements = sentences(body(locale)).filter((s) => !s.trim().endsWith("?")).join(" ");
    for (const pattern of forbidden) assert.doesNotMatch(statements, pattern, `${locale}: ${pattern}`);
  }
});

test("the regions are the BOE's: Holy Thursday off everywhere but Catalonia and Valencia; Easter Monday in six", () => {
  const valencia: Record<Locale, RegExp> = { ca: /excepte a Catalunya i a la Comunitat Valenciana/, es: /salvo en Cataluña y en la Comunitat Valenciana/, en: /except Catalonia and the Valencian Community/ };
  for (const locale of LOCALES) {
    assert.match(body(locale), valencia[locale], locale);
    assert.match(body(locale), /13 (d'octubre|de octubre|October) (de )?2026/, `${locale}: dated BOE list`);
  }
});

test("local days next to Easter are the councils' own, labelled pending, with their town pages", () => {
  assert.equal(nextYearPublished(), false, "the DOGC order is out: re-read the local section, adapt this test and republish setmana-santa-2027");
  // Computed here from COUNCIL_2027 directly, not through the page's function.
  const expected = municipalities()
    .flatMap((m) => (COUNCIL_2027[m.slug]?.local ?? []).filter((d) => d >= LOCAL_WINDOW.from && d <= LOCAL_WINDOW.to).map((date) => `${m.slug} ${date}`))
    .sort();
  const days = localDaysAroundEaster();
  assert.deepEqual(days.map((d) => `${d.town.slug} ${d.date}`).sort(), expected);
  assert.ok(days.length > 0, "no council day near Easter: the section disappears, check the copy");
  for (const day of days) {
    assert.ok(day.council, day.town.slug);
    assert.ok(day.date < EASTER.palmSunday || day.date > EASTER.easterMonday, `${day.town.slug}: a local day inside Holy Week needs its own wording`);
    for (const locale of ["ca", "es"] as const) assert.ok(json(locale).includes(`](${municipalityPath(locale, day.town.slug)})`), `${locale}: ${day.town.slug} page`);
    assert.equal(json("en").includes(`](${municipalityPath("en", day.town.slug)})`), hasEnglishPage(day.town.slug), `en: ${day.town.slug}`);
    // A day next to the break stretches it; the page says where classes restart.
    const school = schoolBreakWith([day.date]);
    if (day.date === addDays(EASTER.schoolTo, 1)) for (const locale of LOCALES) assert.ok(body(locale).includes(dayDate(school.back, locale, false)), `${locale}: ${day.town.slug} back`);
    if (day.date === addDays(EASTER.schoolFrom, -1)) assert.equal(school.from, day.date);
  }
  const pending: Record<Locale, RegExp> = { ca: /pendents de l'ordre del DOGC/g, es: /pendientes de la orden del DOGC/g, en: /pending the DOGC order/g };
  for (const locale of LOCALES) assert.ok((body(locale).match(pending[locale]) ?? []).length >= days.length, `${locale}: every local day is labelled pending`);
  // The names the councils give their days are printed in Catalan only.
  for (const day of days.filter((d) => d.dayName)) assert.ok(body("ca").includes(day.dayName!), day.dayName!);
});

test("shops: Easter Sunday and Monday are closing days; Good Friday is no general opening day", () => {
  assert.ok(!(OPENING_2027.general as readonly string[]).includes(EASTER.goodFriday));
  assert.ok(!(OPENING_2027.municipalDefault as readonly string[]).includes(EASTER.goodFriday));
  assert.equal(OPENING_2027.general.length, 8);
  // The dates are the shops guide's 2027 table, row for row.
  const shops = text(SHOPS.editions.ca.blocks);
  for (const iso of [...OPENING_2027.general, ...OPENING_2027.municipalDefault]) assert.ok(shops.includes(capitalize(weekdayDayMonth(iso, "ca"))), iso);
  const must: Record<Locale, RegExp[]> = {
    ca: [/Llei 18\/2017, article 36/, /EMT\/89\/2026/, /han de tancar/, /article 37/, /abans de l'1 de novembre de 2026/],
    es: [/Llei 18\/2017, artículo 36/, /EMT\/89\/2026/, /deben cerrar/, /artículo 37/, /antes del 1 de noviembre de 2026/],
    en: [/Llei 18\/2017, article 36/, /EMT\/89\/2026/, /must close/, /article 37/, /before 1 November 2026/],
  };
  for (const locale of LOCALES) for (const pattern of must[locale]) assert.match(body(locale), pattern, `${locale}: ${pattern}`);
});

test("the metro table is the shared model's, with TMB's caveat", () => {
  for (const locale of LOCALES) {
    const rows = metroRows(locale);
    const monday = rows.at(-1)![2]!;
    assert.equal(metroDay(EASTER.easterMonday).close, "midnight");
    assert.match(monday, /mitjanit|medianoche|midnight/, locale);
    const thursday = rows[0]![2]!;
    assert.equal(metroDay(EASTER.holyThursday).close, "two", "the night before Good Friday");
    assert.match(thursday, /2:00/, locale);
    assert.match(json(locale), /TMB/, locale);
  }
});

test("traditions: official 2027 dates only; no time for Verges or Tarragona, no contested date", () => {
  const esp = PASSIONS.esparreguera;
  const traditional: readonly string[] = esp.traditional;
  const olesa: readonly string[] = PASSIONS.olesa.dates;
  assert.ok(traditional.includes(EASTER.palmSunday) && traditional.includes(EASTER.goodFriday));
  assert.ok(traditional.every((iso) => iso.startsWith(`${EASTER_YEAR}-03-`)), "the page says the traditional dates are all in March");
  assert.ok(olesa.includes(EASTER.goodFriday));
  for (const iso of [...esp.traditional, ...PASSIONS.olesa.dates, esp.seasonFrom, esp.seasonTo]) assert.ok(weekdayIndex(iso) === 0 || weekdayIndex(iso) === 6 || holidayOn(iso), `${iso}: a performance on a working day?`);
  for (const locale of LOCALES) {
    const plain = body(locale);
    assert.ok(plain.includes(dayDate(PASSIONS.olesa.dates[0], locale, false)), `${locale}: Olesa's first date`);
    // Esparreguera's two pages disagree on 11 April: it is not printed.
    assert.doesNotMatch(plain, /11 d'abril|11 de abril|11 April/, locale);
    for (const sentence of sentences(plain).filter((s) => /Verges|Tarragona|Rodalies|FGC/.test(s))) {
      assert.doesNotMatch(sentence, /\b(?:[01]?\d|2[0-3])(?::[0-5]\d| h\b)/, `${locale}: a clock time in "${sentence}"`);
    }
    assert.match(plain, /1983/, `${locale}: Verges`);
    assert.match(plain, /2010/, `${locale}: Tarragona`);
    // The mona is not put on Easter Sunday.
    assert.doesNotMatch(plain, /mona[^.]*(Diumenge de Pasqua|Domingo de Pascua|Easter Sunday)/i, locale);
  }
});

/* -------------------------------------------------------------------------- */
/* Links in, and the publish route                                            */
/* -------------------------------------------------------------------------- */

test("the work calendar, the school calendar and the holiday hubs link the page, one sentence each", () => {
  for (const locale of LOCALES) {
    const link = `](${href(locale)})`;
    assert.equal(GUIDES.easter2027[locale], href(locale));
    const calendar = JSON.stringify(buildHolidayBody(locale));
    assert.equal(calendar.split(link).length - 1, 1, `work calendar -> easter ${locale}`);
    const school = JSON.stringify(buildSchoolBody(locale));
    assert.equal(school.split(link).length - 1, 1, `school calendar -> easter ${locale}`);
  }
  for (const locale of ["ca", "es"] as const) assert.equal(hubCopy(locale).easter.split(`](${href(locale)})`).length - 1, 1, `hub ${locale}`);
  assert.equal(englishHubCopy().easter.split(`](${href("en")})`).length - 1, 1, "english hub");
  for (const file of ["src/components/programmatic/holidays/HubPage.tsx", "src/components/programmatic/holidays/EnglishHubPage.tsx"]) {
    assert.match(readFileSync(new URL(`../${file}`, import.meta.url), "utf8"), /renderInline\(t\.easter\)/, file);
  }
});

test("the publish route has a setmana-santa-2027 group", () => {
  const route = readFileSync(new URL("../src/app/api/admin/publish/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ EASTER_2027 \} from "@\/lib\/content\/batch02\/easter-2027";/);
  assert.match(route, /wants\("setmana-santa-2027"\)\) published\.push\(await publishB2Article\(EASTER_2027\)\)/);
});
