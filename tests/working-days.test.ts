import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { BOE_2026_ROWS } from "../src/lib/programmatic/holidays/boe-2026.ts";
import { REGIONS, type Region } from "../src/lib/programmatic/holidays/boe-2027.ts";
import { municipalities, municipalityBySlug, regionalDays } from "../src/lib/programmatic/holidays/data.ts";
import { calcEditions } from "../src/lib/programmatic/calculators/paths.ts";
import { hubCards } from "../src/lib/programmatic/calculators/hub.ts";
import { CITIES } from "../src/lib/programmatic/spain-2027/cities.ts";
import {
  countWorkingDays,
  dayNumber,
  deadline,
  inhabilReason,
  isIsoDate,
  isoFromDayNumber,
  plusDays,
  plusMonths,
  weekday,
  type Calendar,
} from "../src/lib/programmatic/working-days/engine.ts";
import { CALC_COPY, DEFAULT_EXAMPLE, NATIONAL_ID, WD_LOCALES, itemHolidays, itemInfo, packDates, unpackDates, workingDaysEditions } from "../src/lib/programmatic/working-days/copy.ts";
import { WD_META, calendarFor, findItem, pageFigures } from "../src/lib/programmatic/working-days/page.ts";
import { nationalDates, region2026, workingDaysData, workingDaysSitemapEntries } from "../src/lib/programmatic/working-days/places.ts";
import {
  AGE_2026_ANNEX,
  AGE_2027,
  AGE_2027_RECHECK_BY,
  COVER_EXTEND_BY,
  COVER_FROM,
  COVER_TO,
  LEGAL_TEXTS,
  RULES_AS_OF,
  RULES_RECHECK_BY,
} from "../src/lib/programmatic/working-days/rules.ts";

/**
 * The working-days calculator (/es/calculadoras/dias-habiles/): the engine on
 * known cases, the data it counts per place, the BOE quotes it shows, and
 * the dates by which someone has to look again.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = new Date().toISOString().slice(0, 10);

const DATA = workingDaysData("es");
const cal = (...values: string[]): Calendar => calendarFor(DATA, ...values);
const ADMIN = { rules: "admin" } as const;
const JUDICIAL = { rules: "judicial" } as const;
const WEEK = { rules: "general" } as const;

function ok<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  assert.ok(r.ok, `expected a result, got ${JSON.stringify(r)}`);
  return r as Extract<T, { ok: true }>;
}

/* ---------------------------------------------------------------- engine --- */

test("engine: day numbers round-trip and weekdays are right, with no Date at all", () => {
  assert.equal(dayNumber("1970-01-01"), 0);
  assert.equal(isoFromDayNumber(dayNumber("2026-02-28") + 1), "2026-03-01");
  assert.equal(isoFromDayNumber(dayNumber("2028-02-28") + 1), "2028-02-29");
  for (let n = dayNumber("2025-12-25"); n <= dayNumber("2028-01-10"); n++) assert.equal(dayNumber(isoFromDayNumber(n)), n);
  assert.equal(weekday("2026-11-30"), 1); // Monday
  assert.equal(weekday("2026-02-28"), 6); // Saturday
  assert.equal(weekday("2027-01-01"), 5); // Friday
  assert.ok(isIsoDate("2028-02-29") && !isIsoDate("2026-02-29") && !isIsoDate("2026-13-01") && !isIsoDate("26-1-1"));
  // Date-only arithmetic: no Date object, no time zone, so DST cannot move a day.
  assert.doesNotMatch(read("src/lib/programmatic/working-days/engine.ts"), /new Date|Date\.|getDay|getTimezoneOffset/);
});

test("engine: daylight-saving changes (29 Mar, 25 Oct 2026; 28 Mar, 31 Oct 2027) do not move any date", () => {
  for (const day of ["2026-03-29", "2026-10-25", "2027-03-28", "2027-10-31"]) {
    assert.equal(plusDays(day, 1), isoFromDayNumber(dayNumber(day) + 1));
    assert.equal(plusDays(plusDays(day, -1), 2), plusDays(day, 1));
  }
  const r = ok(countWorkingDays("2026-03-23", "2026-04-05", { holidays: new Set(), from: COVER_FROM, to: COVER_TO }, ADMIN));
  assert.equal(r.calendar, 14);
  assert.equal(r.working, 10);
  // Same answer whatever the process time zone says.
  const before = process.env.TZ;
  for (const tz of ["Europe/Madrid", "Atlantic/Canary", "Pacific/Kiritimati", "America/Los_Angeles"]) {
    process.env.TZ = tz;
    assert.equal(ok(deadline("2026-10-23", 3, "working", cal("madrid/madrid"), ADMIN)).last, "2026-10-28");
  }
  process.env.TZ = before;
});

test("engine: months run to the same day, or the month's last day (Ley 39/2015 art. 30.4)", () => {
  assert.equal(plusMonths("2026-01-31", 1), "2026-02-28");
  assert.equal(plusMonths("2028-01-31", 1), "2028-02-29");
  assert.equal(plusMonths("2026-03-31", 1), "2026-04-30");
  assert.equal(plusMonths("2026-11-30", 3), "2027-02-28");
  assert.equal(plusMonths("2026-12-15", 1), "2027-01-15");
  // 31 Jan 2026 + 1 month = Saturday 28 Feb, inhábil: moves to Monday 2 March; in the Balearics 2 March is a holiday, so the 3rd.
  const all = ok(deadline("2026-01-31", 1, "months", cal(NATIONAL_ID), ADMIN));
  assert.equal(all.first, "2026-02-01");
  assert.equal(all.nominal, "2026-02-28");
  assert.equal(all.last, "2026-03-02");
  assert.deepEqual(all.movedOver.map((d) => d.reason), ["saturday", "sunday"]);
  assert.equal(ok(deadline("2026-01-31", 1, "months", cal("baleares/all"), ADMIN)).last, "2026-03-03");
  // A month that ends on a working day stays put.
  assert.equal(ok(deadline("2026-03-16", 1, "months", cal("barcelona"), ADMIN)).last, "2026-04-16");
});

test("engine: the default example, 10 días hábiles from Monday 30 November 2026", () => {
  assert.deepEqual(DEFAULT_EXAMPLE, { notified: "2026-11-30", amount: 10, unit: "working", rules: "admin" });
  const madrid = ok(deadline("2026-11-30", 10, "working", cal("madrid/madrid"), ADMIN));
  assert.equal(madrid.first, "2026-12-01");
  assert.equal(madrid.last, "2026-12-16"); // 7 and 8 December are holidays in Madrid
  assert.equal(madrid.working, 10);
  assert.equal(ok(deadline("2026-11-30", 10, "working", cal("barcelona"), ADMIN)).last, "2026-12-15"); // only the 8th in Catalonia
  // Art. 30.6: reader in Barcelona, body in Madrid: inhábil in either place.
  assert.equal(ok(deadline("2026-11-30", 10, "working", cal("barcelona", "madrid/madrid"), ADMIN)).last, "2026-12-16");
  // The page's sentence: the difference is 7 December.
  assert.ok(cal("madrid/madrid").holidays.has("2026-12-07") && !cal("barcelona").holidays.has("2026-12-07"));
});

test("engine: a last day that is inhábil moves on (calendar days), and 'general' never moves it", () => {
  // 15 Dec 2026 + 10 calendar days = Friday 25 December (holiday), then the weekend: Monday 28.
  const r = ok(deadline("2026-12-15", 10, "calendar", cal("madrid/madrid"), ADMIN));
  assert.equal(r.nominal, "2026-12-25");
  assert.equal(r.last, "2026-12-28");
  assert.deepEqual(r.movedOver.map((d) => d.date), ["2026-12-25", "2026-12-26", "2026-12-27"]);
  const g = ok(deadline("2026-12-15", 10, "calendar", cal("madrid/madrid"), WEEK));
  assert.equal(g.last, "2026-12-25");
  assert.equal(g.movedOver.length, 0);
});

test("engine: August is hábil for administrative deadlines and inhábil for court ones", () => {
  assert.equal(ok(deadline("2027-07-30", 3, "working", cal("barcelona"), ADMIN)).last, "2027-08-04");
  const j = ok(deadline("2027-07-28", 5, "working", cal("barcelona"), JUDICIAL));
  assert.equal(j.last, "2027-09-03"); // 29, 30 July, then 1, 2, 3 September
  assert.equal(inhabilReason("2027-08-10", cal("barcelona"), JUDICIAL), "august");
  assert.equal(inhabilReason("2027-08-10", cal("barcelona"), ADMIN), null);
});

test("engine: 24 December to 6 January are inhábiles for court deadlines (LOPJ art. 183), with the LEC 135.5 grace day", () => {
  const a = ok(deadline("2026-12-22", 5, "working", cal("madrid/madrid"), ADMIN));
  assert.equal(a.last, "2026-12-30");
  const j = ok(deadline("2026-12-22", 5, "working", cal("madrid/madrid"), JUDICIAL));
  assert.equal(j.last, "2027-01-12"); // 23 Dec, then 7, 8, 11, 12 Jan
  assert.equal(j.graceDay, "2027-01-13");
  assert.equal(a.graceDay, null);
  for (const day of ["2026-12-24", "2026-12-31", "2027-01-04", "2027-01-06"]) assert.notEqual(inhabilReason(day, cal(NATIONAL_ID), JUDICIAL), null, day);
  assert.equal(inhabilReason("2027-01-07", cal(NATIONAL_ID), JUDICIAL), null);
  assert.equal(inhabilReason("2026-12-23", cal(NATIONAL_ID), JUDICIAL), null);
  // Judicial mode only takes days: months and calendar days are refused, not guessed.
  assert.deepEqual(deadline("2026-12-22", 1, "months", cal(NATIONAL_ID), JUDICIAL), { ok: false, error: "unit" });
});

test("engine: Saturdays count only in the 'general' mode, when the reader works them", () => {
  const dec = (r: { rules: "general" | "admin"; saturdays?: boolean }) => ok(countWorkingDays("2026-12-01", "2026-12-31", cal("madrid/madrid"), r)).working;
  assert.equal(dec(WEEK), 20); // 23 weekdays − 7, 8, 25 December
  assert.equal(dec({ rules: "general", saturdays: true }), 24); // + 4 Saturdays (5, 12, 19, 26)
  assert.equal(dec({ rules: "admin", saturdays: true }), 20); // admin ignores it
  assert.equal(ok(countWorkingDays("2026-12-01", "2026-12-31", cal("barcelona"), WEEK)).working, 21);
  const excl = ok(countWorkingDays("2026-12-01", "2026-12-31", cal("barcelona"), WEEK, false));
  assert.equal(excl.first, "2026-12-02");
  assert.equal(excl.working, 20);
});

test("engine: no answer outside 2026–2027, bad input or reversed dates", () => {
  assert.deepEqual(deadline("2027-12-20", 10, "working", cal(NATIONAL_ID), ADMIN), { ok: false, error: "range" });
  assert.deepEqual(deadline("2025-12-15", 5, "working", cal(NATIONAL_ID), ADMIN), { ok: false, error: "range" });
  assert.equal(ok(deadline("2025-12-31", 1, "working", cal(NATIONAL_ID), ADMIN)).last, "2026-01-02");
  assert.deepEqual(deadline("2026-12-30", 1, "months", cal(NATIONAL_ID), ADMIN).ok, true);
  assert.deepEqual(deadline("2027-12-30", 1, "months", cal(NATIONAL_ID), ADMIN), { ok: false, error: "range" });
  assert.deepEqual(deadline("2026-02-30", 5, "working", cal(NATIONAL_ID), ADMIN), { ok: false, error: "invalid" });
  assert.deepEqual(deadline("2026-02-02", 0, "working", cal(NATIONAL_ID), ADMIN), { ok: false, error: "amount" });
  assert.deepEqual(deadline("2026-02-02", 13, "months", cal(NATIONAL_ID), ADMIN), { ok: false, error: "amount" });
  assert.deepEqual(countWorkingDays("2026-05-10", "2026-05-01", cal(NATIONAL_ID), ADMIN), { ok: false, error: "order" });
  assert.deepEqual(countWorkingDays("2025-12-01", "2026-01-31", cal(NATIONAL_ID), ADMIN), { ok: false, error: "range" });
});

/* ------------------------------------------------------------------ data --- */

test("data: every picker entry has a valid info code and holidays only in 2026–2027; places match the leave planner's", () => {
  for (const locale of WD_LOCALES) {
    const data = workingDaysData(locale);
    const values = new Set<string>();
    for (const g of data.groups) {
      for (const item of g.items) {
        assert.match(item[5], /^[ertc][01][01]p?i?$/, item[0]);
        assert.ok(!values.has(item[0]), `${item[0]} twice`);
        values.add(item[0]);
        const days = itemHolidays(data, item);
        assert.ok(days.length >= 14, `${item[0]}: ${days.length}`);
        for (const d of days) assert.ok(isIsoDate(d) && d >= COVER_FROM && d <= COVER_TO, `${item[0]}: ${d}`);
      }
    }
    assert.equal(values.size, 1 + 1 + municipalities().length + CITIES.length + 18, locale);
  }
  assert.deepEqual(unpackDates(packDates(["2027-01-06", "2026-12-08", "2026-12-08"])), ["2026-12-08", "2027-01-06"]);
});

test("data: all of Spain = the BOE rows marked for every community; Catalonia = the DOGC orders, Aran swaps a day", () => {
  assert.deepEqual(nationalDates(2026), ["2026-01-01", "2026-01-06", "2026-04-03", "2026-05-01", "2026-08-15", "2026-10-12", "2026-12-08", "2026-12-25"]);
  assert.ok(nationalDates(2027).includes("2027-03-26") && nationalDates(2027).includes("2027-12-08"));
  const cat = itemHolidays(DATA, findItem(DATA, "catalunya").item);
  assert.deepEqual(cat, [...regionalDays(2026), ...regionalDays(2027)].map((d) => d.date).sort());
  const vielha = municipalities().find((m) => m.comarca === "Aran")!;
  const aran = itemHolidays(DATA, findItem(DATA, vielha.slug).item);
  assert.ok(aran.includes("2026-06-17") && !aran.includes("2026-12-26"));
});

test("data: local days per place — Catalan towns 2026 from the DOGC, cities from their bulletins, council days not counted", () => {
  const bcn = municipalityBySlug("barcelona")!;
  const b = findItem(DATA, "barcelona").item;
  for (const d of bcn.local) assert.ok(itemHolidays(DATA, b).includes(d), d);
  assert.equal(itemInfo(b).local2026, true);
  // Barcelona's 2026 local day changes the September count: 21 Catalonia-wide, 20 in Barcelona.
  assert.equal(ok(countWorkingDays("2026-09-01", "2026-09-30", cal("catalunya"), WEEK)).working, 21);
  assert.equal(ok(countWorkingDays("2026-09-01", "2026-09-30", cal("barcelona"), WEEK)).working, 20);
  // Until the DOGC 2027 order is parsed, no Catalan town counts 2027 local days, even council-approved ones.
  const council = read("src/lib/programmatic/holidays/local-2027.json").includes('"order": null');
  if (council) {
    for (const g of DATA.groups) for (const item of g.items) if (item[5].startsWith("t")) assert.equal(itemInfo(item).local2027, false, item[0]);
  }
  // Bilbao: 2027 bulletin days (Bizkaia's, Semana Grande).
  const bilbao = itemHolidays(DATA, findItem(DATA, "pais-vasco/bilbao").item);
  assert.ok(bilbao.includes("2027-08-27") && bilbao.includes("2027-07-31"));
  // Madrid: 2026 local days (San Isidro, Almudena) in, 2027 pending.
  const madrid = findItem(DATA, "madrid/madrid").item;
  assert.ok(itemHolidays(DATA, madrid).includes("2026-05-15") && itemHolidays(DATA, madrid).includes("2026-11-09"));
  assert.deepEqual([itemInfo(madrid).local2026, itemInfo(madrid).local2027], [true, false]);
  // Canarias: the 2026 island day from BOE-A-2025-23702 note 1, the 2027 one from Decreto 115/2026.
  const telde = itemHolidays(DATA, findItem(DATA, "canarias/telde").item);
  assert.ok(telde.includes("2026-09-08") && telde.includes("2027-09-08"));
  // Navarra: 3 December both years, community-wide.
  const nav = itemHolidays(DATA, findItem(DATA, "navarra/all").item);
  assert.ok(nav.includes("2026-12-03") && nav.includes("2027-12-03"));
});

test("data: the 2026 BOE list matches the AGE's 2026 calendar of días inhábiles (BOE-A-2025-23702) for every community", () => {
  for (const region of REGIONS.filter((r) => r !== "CT") as Region[]) {
    const weekdays = region2026(region).filter((d) => weekday(d) !== 0 && weekday(d) !== 6);
    const annex = AGE_2026_ANNEX.filter((r) => r.where === "ALL" || r.where.includes(region)).map((r) => r.date);
    assert.deepEqual(weekdays, annex, region);
  }
  const ct = regionalDays(2026).map((d) => d.date).filter((d) => weekday(d) !== 0 && weekday(d) !== 6);
  assert.deepEqual(ct, AGE_2026_ANNEX.filter((r) => r.where === "ALL" || r.where.includes("CT")).map((r) => r.date));
  assert.ok(BOE_2026_ROWS.length > 30);
});

/* ------------------------------------------------------------ the page --- */

test("page: figures, titles and the registry", () => {
  for (const locale of WD_LOCALES) {
    const f = pageFigures(workingDaysData(locale), locale);
    assert.equal(f.months.last, "2026-03-02");
    assert.equal(f.christmasJudicial.last, "2027-01-12");
    assert.equal(f.christmasAdmin.last, "2026-12-30");
    assert.deepEqual(f.totals, { y2026: 254, y2027: 254 });
    assert.ok(WD_META[locale].title.length <= 60, `${locale} title ${WD_META[locale].title.length}`);
    assert.ok(WD_META[locale].description.length <= 165, `${locale} description ${WD_META[locale].description.length}`);
    assert.ok(CALC_COPY[locale].disclaimer.length > 100);
  }
  assert.equal(pageFigures(DATA, "es").example.last, "2026-12-16");
  assert.equal(pageFigures(workingDaysData("ca"), "ca").example.last, "2026-12-15");
  assert.deepEqual(workingDaysEditions(), { es: "/es/calculadoras/dias-habiles/", ca: "/ca/calculadores/dies-habils/", en: "/en/calculators/working-days-spain/" });
  assert.deepEqual(calcEditions("working-days"), workingDaysEditions());
  assert.ok(hubCards().some((c) => c.key === "working-days" && c.calculator));
  const entries = workingDaysSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.workingDaysSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: workingDaysEditions\(\)/);
  assert.match(read("src/components/programmatic/working-days/WorkingDaysPage.tsx"), /<MoreCalculators current="working-days" locale=\{locale\} \/>/);
  assert.match(read("src/components/programmatic/working-days/WorkingDaysPage.tsx"), /hubCrumb\(locale\),/);
});

test("links: the work calendar guide, the Spain 2027 hubs and the leave planner link the calculator", () => {
  assert.match(read("src/lib/content/holidays/publish.ts"), /WORKING_DAYS_LINE\[locale\]/);
  assert.match(read("src/components/programmatic/spain-2027/pages.tsx"), /<WorkingDaysHubLink locale="es" \/>/);
  assert.match(read("src/components/programmatic/spain-2027/pages-intl.tsx"), /<WorkingDaysHubLink locale=\{locale\} \/>/);
  assert.match(read("src/components/programmatic/leave-2027/LeavePage.tsx"), /workingDaysPath\(locale\)/);
});

/* --------------------------------------------------- sources and dates --- */

test("rules: every quote is verbatim in the BOE texts read on RULES_AS_OF (fixture)", () => {
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  const fixture = norm(read("tests/fixtures/working-days/boe-articles.txt"));
  assert.match(read("tests/fixtures/working-days/boe-articles.txt"), new RegExp(`read on ${RULES_AS_OF}`));
  for (const t of Object.values(LEGAL_TEXTS)) {
    for (const part of t.quote.split("\n")) {
      for (const piece of part.split("[…]").map(norm).filter((p) => p.length > 3)) {
        assert.ok(fixture.includes(piece.replace(/^\d\. /, "").slice(0, 400)) || fixture.includes(piece), `${t.id}: ${piece.slice(0, 60)}…`);
      }
    }
    assert.match(t.url, /^https:\/\/www\.boe\.es\//);
  }
  // LO 14/2022 is the last wording of LOPJ art. 183 and LEC art. 130.2, as the page says.
  assert.match(fixture, /Artículo 183\..*Ley Orgánica 14\/2022/);
});

test("date guard: the AGE's 2027 calendar of días inhábiles must be looked for again by 31 Dec 2026", () => {
  if (AGE_2027 === null) {
    assert.ok(
      today < AGE_2027_RECHECK_BY,
      `AGE_2027 still null on ${today}: search the BOE for "calendario de días inhábiles ... para el año 2027" (Ministerio para la Transformación Digital y de la Función Pública), fill AGE_2027 and an annex check, or move AGE_2027_CHECKED_ON / AGE_2027_RECHECK_BY after reading the summaries`,
    );
  } else {
    assert.match(AGE_2027.ref, /^BOE-A-202[67]-\d+$/);
  }
});

test("date guard: the legal texts are read again by RULES_RECHECK_BY, and 2028 holidays exist before the tool runs out", () => {
  assert.ok(today < RULES_RECHECK_BY, `re-read Ley 39/2015 art. 30, LOPJ 182-185 and LEC 130-135 on the BOE, refresh the fixture and move RULES_AS_OF (${RULES_AS_OF})`);
  assert.ok(today < COVER_EXTEND_BY, `the calculator only covers ${COVER_FROM}–${COVER_TO}: add the 2028 lists and move COVER_TO`);
});
