import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { DESCRIPTION_LIMIT, TITLE_LIMIT, cityFaq, cityView, hubView, primaryRule, primaryZone, priceRows } from "../src/lib/programmatic/zona-azul/copy.ts";
import { BARCELONA_ROW, CITIES, ZONA_AZUL_AS_OF, ZONA_AZUL_REVIEW_BY, cityBySlug } from "../src/lib/programmatic/zona-azul/data.ts";
import { cityHolidays, holidayCalendarPath, holidayEntries } from "../src/lib/programmatic/zona-azul/holidays.ts";
import { dayAnswer, inWindow, madridClock, nextHoliday, nextPaidDay, nowState } from "../src/lib/programmatic/zona-azul/logic.ts";
import { BARCELONA_GUIDE, ZA_LOCALES, ZA_ROUTE, zaCityPath, zaHubPath } from "../src/lib/programmatic/zona-azul/paths.ts";
import { resolveZaCity, zaCityStaticParams, zaHubAllowed } from "../src/lib/programmatic/zona-azul/routing.ts";
import { zonaAzulPaths } from "../src/lib/programmatic/zona-azul/sitemap.ts";
import { todayView } from "../src/lib/programmatic/zona-azul/today.ts";
import type { City, Range, ZaLocale } from "../src/lib/programmatic/zona-azul/types.ts";

/**
 * Regulated street parking by city (22 Nov 2026): /es/zona-azul/,
 * /ca/zona-blava/, /en/blue-zone-parking/ and one page per city. The data
 * file is the only place with facts; these tests hold its shape (every fact
 * points at an official source of its own city), the day logic behind the
 * "is it paid today?" box, and the wiring (paths, sitemap, publish group).
 */

const ROOT = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const city = (slug: string): City => {
  const found = cityBySlug(slug);
  assert.ok(found, `no city ${slug}`);
  return found;
};
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** No printed string carries a hole ("undefined", "NaN", "null"). */
function assertNoHoles(value: unknown, where: string) {
  JSON.stringify(value, (_key, v) => {
    if (typeof v === "string") assert.ok(!/undefined|NaN|\bnull\b/.test(v), `${where}: ${v}`);
    return v;
  });
}

function assertRanges(ranges: readonly Range[], where: string) {
  let last = "";
  for (const [from, to] of ranges) {
    assert.match(from, HHMM, where);
    assert.match(to, HHMM, where);
    assert.ok(from < to, `${where}: ${from} is not before ${to}`);
    assert.ok(from >= last, `${where}: stretches out of order`);
    last = to;
  }
}

test("every city: unique slug, official https sources, every fact tied to one of them", () => {
  assert.ok(CITIES.length >= 4);
  assert.equal(new Set(CITIES.map((c) => c.slug)).size, CITIES.length);
  for (const c of CITIES) {
    assert.match(c.slug, /^[a-z-]+$/);
    assert.notEqual(c.slug, "barcelona", "Barcelona is the guide's, not a page of this family");
    assert.match(c.verified, ISO);
    assert.ok(c.verified <= ZONA_AZUL_AS_OF, `${c.slug}: verified after the family's as-of date`);
    const ids = new Set(c.sources.map((s) => s.id));
    assert.equal(ids.size, c.sources.length, `${c.slug}: repeated source id`);
    for (const s of c.sources) {
      assert.ok(s.url.startsWith("https://"), `${c.slug}/${s.id}: ${s.url}`);
      assert.ok(!s.url.includes("aerobusbcn"), s.url);
      assert.ok(s.name.length > 3 && s.publisher.length > 3);
    }
    const cited: (readonly string[])[] = [
      ...c.zones.map((z) => z.src),
      ...c.zones.flatMap((z) => (z.rule ? [...z.rule.seasons.map((s) => s.src), ...z.rule.special.map((s) => s.src)] : [])),
      ...(c.cancel ? [c.cancel.src] : []),
      ...(c.cancelNote ? [c.cancelNote.src] : []),
      ...(c.apps ? [c.apps.src] : []),
      c.payNote.src,
      ...(c.exemptions.electric ? [c.exemptions.electric.src] : []),
      ...(c.exemptions.pmr ? [c.exemptions.pmr.src] : []),
      ...c.exemptions.other.map((f) => f.src),
      ...c.seasonal.map((f) => f.src),
      ...c.notes.map((f) => f.src),
    ];
    for (const src of cited) {
      assert.ok(src.length > 0, `${c.slug}: a fact without a source`);
      for (const id of src) assert.ok(ids.has(id), `${c.slug}: source "${id}" is not in the city's list`);
    }
    const used = new Set(cited.flat());
    for (const id of ids) assert.ok(used.has(id), `${c.slug}: source "${id}" is listed but backs no fact`);
  }
});

test("every city: the first zone is a blue zone with hours, a price for one hour and sane amounts", () => {
  for (const c of CITIES) {
    const zone = primaryZone(c);
    assert.equal(zone, c.zones[0]);
    assert.equal(zone.colour, "blue", c.slug);
    assert.ok(zone.rule, `${c.slug}: the visitor zone needs a timetable`);
    assert.ok(zone.prices?.hour1, `${c.slug}: the visitor zone needs the price of one hour`);
    assert.equal(new Set(c.zones.map((z) => z.id)).size, c.zones.length);
    for (const z of c.zones) {
      if (z.rule) {
        for (const schedule of [z.rule.base, ...z.rule.seasons.map((s) => s.schedule)]) {
          for (const day of ["weekday", "saturday", "sunday", "holiday"] as const) assertRanges(schedule[day], `${c.slug}/${z.id}/${day}`);
        }
        for (const s of z.rule.seasons) {
          assert.match(s.from, /^\d{2}-\d{2}$/);
          assert.match(s.to, /^\d{2}-\d{2}$/);
        }
        for (const s of z.rule.special) {
          for (const d of s.dates) assert.match(d, /^(\d{4}-)?\d{2}-\d{2}$/);
          assert.ok(s.weekday || s.saturday, `${c.slug}/${z.id}: a special day that changes nothing`);
        }
      }
      if (z.maxStayMinutes !== null) assert.ok(z.maxStayMinutes >= 30 && z.maxStayMinutes <= 24 * 60, `${c.slug}/${z.id}`);
      const p = z.prices;
      if (!p) continue;
      for (const amount of [p.min?.eur, p.hour1, p.hour2, p.max?.eur]) {
        if (amount === null || amount === undefined) continue;
        assert.ok(amount > 0 && amount < 30, `${c.slug}/${z.id}: ${amount} €`);
        assert.equal(Math.round(amount * 100) / 100, amount, `${c.slug}/${z.id}: ${amount} has more than two decimals`);
      }
      if (p.hour1 !== null && p.hour2 !== null) assert.ok(p.hour2 >= p.hour1, `${c.slug}/${z.id}: two hours cheaper than one`);
      if (p.min && p.hour1 !== null) assert.ok(p.min.eur <= p.hour1, `${c.slug}/${z.id}: the minimum is above one hour`);
    }
    if (c.cancel) assert.ok(c.cancel.eur > 0 && c.cancel.eur < 100);
  }
});

test("the prices are re-read in early January, when the councils' fee ordinances change", () => {
  assert.match(ZONA_AZUL_AS_OF, ISO);
  assert.ok(ZONA_AZUL_AS_OF < ZONA_AZUL_REVIEW_BY);
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(
    today <= ZONA_AZUL_REVIEW_BY,
    `Zona azul prices were last read on ${ZONA_AZUL_AS_OF}: re-read every city's sources in lib/programmatic/zona-azul/data.ts (2027 fee ordinances), update the amounts and each city's "verified", then move ZONA_AZUL_AS_OF and ZONA_AZUL_REVIEW_BY.`,
  );
});

test("day logic: holiday before Sunday, special day before season, season before the general hours", () => {
  const madrid = primaryRule(city("madrid"));
  const holidays = holidayEntries(city("madrid"), "es");
  // Tuesday 24 Nov 2026: an ordinary working day.
  assert.deepEqual(dayAnswer(madrid, "2026-11-24", holidays).ranges, [["09:00", "21:00"]]);
  // Saturday and Sunday.
  assert.deepEqual(dayAnswer(madrid, "2026-11-28", holidays).ranges, [["09:00", "15:00"]]);
  assert.equal(dayAnswer(madrid, "2026-11-29", holidays).type, "sunday");
  assert.deepEqual(dayAnswer(madrid, "2026-11-29", holidays).ranges, []);
  // Tuesday 8 Dec 2026, the Immaculate Conception: free.
  const immaculate = dayAnswer(madrid, "2026-12-08", holidays);
  assert.equal(immaculate.type, "holiday");
  assert.deepEqual(immaculate.ranges, []);
  assert.ok(immaculate.holiday);
  // Monday 9 Nov 2026, the Almudena: Madrid's local holiday.
  assert.equal(dayAnswer(madrid, "2026-11-09", holidays).type, "holiday");
  // Thursday 24 Dec 2026: shorter hours; Friday 25 Dec: holiday.
  const eve = dayAnswer(madrid, "2026-12-24", holidays);
  assert.deepEqual(eve.ranges, [["09:00", "15:00"]]);
  assert.ok(eve.special);
  assert.equal(dayAnswer(madrid, "2026-12-25", holidays).type, "holiday");
  // August: mornings only, and the season is named.
  const august = dayAnswer(madrid, "2027-08-03", holidays);
  assert.deepEqual(august.ranges, [["09:00", "15:00"]]);
  assert.ok(august.season);
  assert.equal(dayAnswer(madrid, "2027-09-01", holidays).season, null);

  const sevilla = primaryRule(city("sevilla"));
  const sevillaDays = holidayEntries(city("sevilla"), "es");
  // July and August: no Saturdays, no afternoons.
  assert.deepEqual(dayAnswer(sevilla, "2027-07-06", sevillaDays).ranges, [["09:00", "14:00"]]);
  assert.deepEqual(dayAnswer(sevilla, "2027-07-10", sevillaDays).ranges, []);
  // Holy Week 2027 (Monday to Wednesday): mornings only; the Saturday of a
  // special day without Saturday hours of its own keeps the general ones.
  assert.deepEqual(dayAnswer(sevilla, "2027-03-22", sevillaDays).ranges, [["09:00", "14:00"]]);
  assert.deepEqual(dayAnswer(sevilla, "2026-12-24", sevillaDays).ranges, [["09:00", "14:00"]]);
  assert.deepEqual(dayAnswer(sevilla, "2026-12-26", sevillaDays).ranges, [["10:00", "14:00"]]);

  const girona = primaryRule(city("girona"));
  const gironaDays = holidayEntries(city("girona"), "ca");
  // Sant Jaume and Sant Narcís 2026, Girona's local holidays; Sant Esteve, Catalonia's.
  for (const iso of ["2026-07-25", "2026-10-29", "2026-12-26"]) {
    const day = dayAnswer(girona, iso, gironaDays);
    assert.equal(day.type, "holiday", iso);
    assert.deepEqual(day.ranges, [], iso);
  }
  assert.deepEqual(dayAnswer(girona, "2026-11-28", gironaDays).ranges, [
    ["09:30", "13:00"],
    ["16:00", "20:00"],
  ]);
});

test("clock logic: before, paid, lunch break, over, and the next paid day", () => {
  const split: Range[] = [
    ["09:30", "13:00"],
    ["16:00", "20:00"],
  ];
  assert.deepEqual(nowState([], "10:00"), { kind: "free-day" });
  assert.deepEqual(nowState(split, "08:00"), { kind: "before", start: "09:30", end: "20:00" });
  assert.deepEqual(nowState(split, "09:30"), { kind: "paid", until: "13:00", resumes: "16:00", end: "20:00" });
  assert.deepEqual(nowState(split, "13:00"), { kind: "break", resumes: "16:00", end: "20:00" });
  assert.deepEqual(nowState(split, "19:59"), { kind: "paid", until: "20:00", resumes: null, end: "20:00" });
  assert.deepEqual(nowState(split, "20:00"), { kind: "over", ended: "20:00" });

  assert.ok(inWindow("08-15", "08-01", "08-31"));
  assert.ok(!inWindow("09-01", "08-01", "08-31"));
  assert.ok(inWindow("01-02", "12-20", "01-06"));

  const girona = primaryRule(city("girona"));
  const days = holidayEntries(city("girona"), "ca");
  // From Saturday 5 Dec 2026: Sunday, Constitution Day (moved to Monday 7 in
  // no region: 6 Dec is a Sunday) and the Immaculate Conception on Tuesday 8.
  const next = nextPaidDay(girona, "2026-12-05", days);
  assert.ok(next);
  assert.ok(next.iso >= "2026-12-07" && next.iso <= "2026-12-09", next.iso);
  assert.notEqual(next.iso, "2026-12-08");
  assert.equal(nextHoliday(days, "2026-11-22")?.d, "2026-12-08");

  // The clock is Spain's, whatever the device says: 23:30 UTC in winter is 00:30 the next day.
  assert.deepEqual(madridClock(new Date("2026-11-22T23:30:00Z")), { iso: "2026-11-23", hhmm: "00:30" });
  assert.deepEqual(madridClock(new Date("2026-07-01T07:05:00Z")), { iso: "2026-07-01", hhmm: "09:05" });
});

test("the today box: answer, facts and the honest notes about holidays that are not in the data", () => {
  for (const locale of ZA_LOCALES) {
    const c = city("girona");
    const holidays = cityHolidays(c);
    const input = { locale, city: c.name[locale], rule: primaryRule(c), holidays: holidayEntries(c, locale), localYears: holidays.localYears, through: holidays.through };
    const paid = todayView(input, { iso: "2026-11-24", hhmm: "10:00" });
    assert.equal(paid.free, false);
    assert.match(paid.answer, /^(Sí|Yes)/);
    assert.equal(paid.facts.length, 3);
    assert.equal(paid.notes.length, 1);
    const lunch = todayView(input, { iso: "2026-11-24", hhmm: "14:00" });
    assert.equal(lunch.free, false);
    const over = todayView(input, { iso: "2026-11-24", hhmm: "20:30" });
    assert.equal(over.free, true);
    const sunday = todayView(input, { iso: "2026-11-29", hhmm: "11:00" });
    assert.equal(sunday.free, true);
    assert.match(sunday.answer, /^No/);
    const holiday = todayView(input, { iso: "2026-12-08", hhmm: "11:00" });
    assert.equal(holiday.free, true);
    // 2027: Girona's local holidays are not in the snapshot yet, and the box says so.
    if (!holidays.localYears.includes(2027)) assert.equal(todayView(input, { iso: "2027-02-02", hhmm: "10:00" }).notes.length, 2);
    // Past the calendar: a second note as well.
    assert.equal(todayView(input, { iso: "2028-01-04", hhmm: "10:00" }).notes.length, 2);
    for (const view of [paid, lunch, over, sunday, holiday]) {
      for (const text of [view.answer, view.date, ...view.facts.map((f) => f.value), ...view.notes]) assert.ok(!/undefined|null|NaN/.test(text), text);
    }
  }
});

test("copy: titles and descriptions fit, three languages, nothing undefined, FAQ answers are full sentences", () => {
  for (const locale of ZA_LOCALES) {
    const hub = hubView(locale);
    assert.ok(hub.title.length <= TITLE_LIMIT, `${locale} hub title: ${hub.title.length}`);
    assert.ok(hub.description.length <= DESCRIPTION_LIMIT, `${locale} hub description: ${hub.description.length}`);
    assert.equal(hub.rows.length, CITIES.length);
    assert.equal(hub.barcelona.href, BARCELONA_GUIDE[locale]);
    assert.ok(hub.faq.length >= 3);
    assertNoHoles(hub, `${locale} hub`);
    for (const c of CITIES) {
      const view = cityView(c, locale);
      assert.ok(view.title.length <= TITLE_LIMIT, `${locale}/${c.slug} title: ${view.title.length}`);
      assert.ok(view.description.length <= DESCRIPTION_LIMIT, `${locale}/${c.slug} description: ${view.description.length}`);
      assert.ok(view.title.includes(c.name[locale]) && view.h1.includes(c.name[locale]));
      assert.ok(view.timetable.length >= 1 && view.prices.length >= 1 && view.prices.length <= c.zones.length);
      assert.ok(view.prices[0]!.cells, `${locale}/${c.slug}: the visitor zone has no price cells`);
      assertNoHoles(view, `${locale}/${c.slug}`);
      const faq = cityFaq(c, locale);
      assert.ok(faq.length >= 6, `${locale}/${c.slug}: ${faq.length} questions`);
      assert.equal(new Set(faq.map((f) => f.q)).size, faq.length);
      for (const f of faq) {
        assert.match(f.q, /\?$/, f.q);
        assert.match(f.a, /[.)]$/, f.a);
      }
    }
    const titles = [hub.title, ...CITIES.map((c) => cityView(c, locale).title)];
    assert.equal(new Set(titles).size, titles.length);
  }
  // The three editions are not the same text.
  const girona = city("girona");
  assert.notEqual(cityView(girona, "es").lead, cityView(girona, "ca").lead);
  assert.notEqual(cityView(girona, "es").lead, cityView(girona, "en").lead);
});

test("a minimum charge without a stated duration prints the amount alone (Girona)", () => {
  const girona = city("girona");
  assert.deepEqual(primaryZone(girona).prices?.min, { minutes: null, eur: 0.35 });
  const row = priceRows(girona, "ca")[0]!.cells;
  assert.ok(row);
  assert.equal(row.min, "0,35 €");
  assert.match(row.hour1, /1,20 €/);
  assert.match(priceRows(girona, "en")[0]!.cells?.min ?? "", /^€0\.35$/);
  // The green zones' longer stay for Girona residents is in the "how long" answer.
  const stay = cityFaq(girona, "ca").find((f) => f.a.includes("6 hores"));
  assert.ok(stay, "the FAQ drops the residents' 6 hours");
});

test("the Barcelona row says what the Barcelona parking guide says", () => {
  const guide = read("src/lib/content/batch02/barcelona-practical.ts");
  assert.match(BARCELONA_ROW.hour.ca, /1,15–3,75 €/);
  assert.ok(guide.includes("d'1,15 a 3,75 € l'hora"), "the guide's blue zone price range changed: update BARCELONA_ROW");
  assert.ok(guide.includes("de dilluns a divendres de 9.00 a 20.00 h"), "the guide's blue zone hours changed: update BARCELONA_ROW");
  assert.ok(BARCELONA_ROW.source.url.startsWith("https://www.areaverda.cat/"));
  assert.ok(BARCELONA_ROW.verified <= ZONA_AZUL_AS_OF);
  // The guide links back to the hub.
  assert.ok(guide.includes("zaHubPath("));
});

test("paths, routing and hreflang: one folder per language, the same city slug in the three", () => {
  assert.deepEqual(ZA_ROUTE, { es: "zona-azul", ca: "zona-blava", en: "blue-zone-parking" });
  assert.equal(zaHubPath("ca"), "/ca/zona-blava/");
  assert.equal(zaCityPath("en", "girona"), "/en/blue-zone-parking/girona/");
  assert.ok(zaHubAllowed("es", "es"));
  assert.ok(!zaHubAllowed("es", "ca"));
  assert.equal(resolveZaCity("ca", "ca", "girona")?.slug, "girona");
  assert.equal(resolveZaCity("ca", "es", "girona"), null);
  assert.equal(resolveZaCity("es", "es", "barcelona"), null);
  assert.equal(resolveZaCity("es", "es", "no-such-city"), null);
  assert.deepEqual(
    zaCityStaticParams("es", "ciudad").map((p) => p.ciudad),
    CITIES.map((c) => c.slug),
  );

  const paths = zonaAzulPaths();
  assert.equal(paths.length, 3 * (CITIES.length + 1));
  assert.equal(new Set(paths.map((p) => p.path)).size, paths.length);
  for (const entry of paths) {
    assert.match(entry.path, /^\/(es\/zona-azul|ca\/zona-blava|en\/blue-zone-parking)\/([a-z-]+\/)?$/);
    assert.match(entry.lastModified, ISO);
    assert.ok(Object.values(entry.translations).includes(entry.path));
  }

  for (const [locale, folder, param] of [
    ["es", "zona-azul", "ciudad"],
    ["ca", "zona-blava", "ciutat"],
    ["en", "blue-zone-parking", "city"],
  ] as [ZaLocale, string, string][]) {
    const hub = read(`src/app/(public)/[locale]/${folder}/page.tsx`);
    const page = read(`src/app/(public)/[locale]/${folder}/[${param}]/page.tsx`);
    assert.ok(hub.includes(`"${locale}"`) && page.includes(`resolveZaCity("${locale}"`), folder);
    assert.ok(page.includes("notFound()"), folder);
  }
});

test("every city links to its own holiday calendar on this site", () => {
  for (const c of CITIES) {
    for (const locale of ZA_LOCALES) {
      const path = holidayCalendarPath(c, locale);
      assert.ok(path && path.startsWith(`/${locale}/`), `${c.slug}/${locale}: ${path}`);
    }
    const holidays = cityHolidays(c);
    assert.ok(holidays.days.length >= 20, `${c.slug}: ${holidays.days.length} holidays for two years`);
    assert.ok(holidays.days.some((d) => d.date === "2026-12-25") && holidays.days.some((d) => d.date === "2027-01-01"));
  }
});

test("wiring: sitemap, dated-sitemap family and the publish group", () => {
  assert.ok(read("src/app/sitemap.ts").includes('dated("zona-azul"'));
  assert.ok(read("scripts/lib/body-families.ts").includes('"zona-azul"'));
  assert.ok(read("src/app/api/admin/publish/route.ts").includes('wants("zona-azul")'));
  const dates = JSON.parse(read("src/lib/seo/body-dates.json")) as Record<string, unknown>;
  assert.ok("zona-azul" in dates || JSON.stringify(dates).includes('"zona-azul"'), "run `npm run seo:body-dates` after adding the family");
});
