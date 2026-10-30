import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { STRIKES, STRIKES_AS_OF, STRIKES_META, buildStrikesBody, upcomingStrikes } from "../src/lib/content/batch02/strikes.ts";
import { STRIKE_11N_META } from "../src/lib/content/batch02/strike-11n.ts";
import { DECEMBER_BRIDGE_META } from "../src/lib/content/batch02/december-bridge.ts";
import { CALENDAR_VERIFIED_AT } from "../src/lib/content/holidays/calendar.ts";
import { PATHS as TOOL_PATHS, toolsFor } from "../src/lib/content/home-tools.ts";
import { hubShortcuts } from "../src/lib/content/hub-shortcuts.ts";
import { totals } from "../src/lib/content/reservoirs/levels.ts";
import { weekendWindow } from "../src/lib/content/weekend/agenda.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { fuelFamilyPaths } from "../src/lib/programmatic/fuel/sitemap.ts";
import type { LiveStation } from "../src/lib/programmatic/fuel/live.ts";
import { NEXT_YEAR, SNAPSHOT as HOLIDAYS } from "../src/lib/programmatic/holidays/data.ts";
import { GUIDES } from "../src/lib/programmatic/holidays/links.ts";
import { datePath, holidayFamilyPaths, municipalityPath } from "../src/lib/programmatic/holidays/paths.ts";
import { todayInMadrid } from "../src/lib/programmatic/holidays/status.ts";
import { SNAPSHOT as RESERVOIRS, snapshotReadings } from "../src/lib/programmatic/reservoirs/data.ts";
import { reservoirFamilyPaths } from "../src/lib/programmatic/reservoirs/pages.ts";
import { ALERTS_ENDPOINT } from "../src/lib/programmatic/rodalies/live.ts";
import { LEVELS_ENDPOINT } from "../src/lib/programmatic/reservoirs/live.ts";
import { rodaliesFamilyPaths } from "../src/lib/programmatic/rodalies/pages.ts";
import type { CompactAlert } from "../src/lib/programmatic/rodalies/types.ts";
import { weekendFamilyPaths } from "../src/lib/programmatic/weekend/sitemap.ts";
import {
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  fromDate,
  holidayFallback,
  onDate,
  pageCopy,
  reservoirsFallback,
  snowFallback,
  sources,
  strikesFallback,
  verifiedLine,
} from "../src/lib/programmatic/today/copy.ts";
import {
  DATA_FROM,
  holidayData,
  regionalList,
  reservoirFallback,
  rodaliesLines,
  snowSeason,
  todayLastModified,
  todayLinks,
  todayStrikes,
} from "../src/lib/programmatic/today/data.ts";
import { TODAY_LABELS } from "../src/lib/programmatic/today/labels.ts";
import {
  FUEL_ENDPOINT,
  fill,
  formatRange,
  fuelMedians,
  holidayDay,
  inSeason,
  joinList,
  nextBridge,
  nextLongWeekend,
  nextRegional,
  nextStrike,
  noticeSummary,
  reservoirTotal,
  strikesListStale,
  strikesOn,
  weekendFor,
  type HolidayData,
  type TodayStrike,
} from "../src/lib/programmatic/today/logic.ts";
import { NOT_FOUND_METADATA, todayCrumbs, todayMetadata, todaySchemas, todaySitemapEntries } from "../src/lib/programmatic/today/page.ts";
import { TODAY_NAME, TODAY_SEGMENT, resolveToday, todayPath, todayTranslations } from "../src/lib/programmatic/today/paths.ts";
import { composeTitle } from "../src/lib/seo/metadata.ts";
import { absoluteUrl } from "../src/lib/site.ts";

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src/app/(public)/[locale]");
const ROUTE_FILE: Record<Locale, string> = { ca: "avui/page.tsx", es: "hoy/page.tsx", en: "today/page.tsx" };

/* -------------------------------------------------------------------------- */
/* Routing                                                                    */
/* -------------------------------------------------------------------------- */

test("routes: /ca/avui/, /es/hoy/, /en/today/; each folder answers its own language only", () => {
  assert.deepEqual(todayTranslations(), { ca: "/ca/avui/", es: "/es/hoy/", en: "/en/today/" });
  for (const route of LOCALES) {
    assert.equal(resolveToday(route, route), route);
    for (const other of [...LOCALES, "fr", "", "CA"]) {
      if (other !== route) assert.equal(resolveToday(route, other), null, `/${other}/${TODAY_SEGMENT[route]}/ is a 404`);
    }
  }
});

test("route files: revalidate=false, dynamicParams=false, own locale, notFound(), no database", () => {
  for (const locale of LOCALES) {
    const file = ROUTE_FILE[locale];
    assert.equal(file.split("/")[0], TODAY_SEGMENT[locale]);
    const source = readFileSync(join(APP, file), "utf8");
    assert.match(source, /export const revalidate = false;/, file);
    assert.match(source, /export const dynamicParams = false;/, file);
    assert.match(source, new RegExp(`const ROUTE = "${locale}";`), file);
    assert.match(source, /resolveToday\(ROUTE, /, file);
    assert.match(source, /notFound\(\)/, file);
    assert.doesNotMatch(source, /repository|getDb|@\/lib\/db/, `${file} reads no database`);
  }
  assert.deepEqual(NOT_FOUND_METADATA, { robots: { index: false, follow: false } });
});

test("routes: the three segments collide with no other route folder and no legacy redirect", () => {
  const folders = readdirSync(APP, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const segment of Object.values(TODAY_SEGMENT)) assert.equal(folders.filter((f) => f === segment).length, 1, segment);
  // Every other family's first segment is different.
  const others = new Set(folders.filter((f) => !Object.values(TODAY_SEGMENT).includes(f)));
  for (const segment of Object.values(TODAY_SEGMENT)) assert.ok(!others.has(segment));
  const redirects = readFileSync(join(ROOT, "migration/redirects.csv"), "utf8");
  for (const locale of LOCALES) assert.ok(!redirects.includes(`,${todayPath(locale)}`) && !redirects.includes(`\n${todayPath(locale)},`), locale);
  // The site's section segments (guies, agenda…) are not these.
  for (const path of Object.values(B2_PATHS).flatMap((p) => Object.values(p))) {
    assert.ok(!Object.values(TODAY_SEGMENT).includes(path.split("/")[0]!), path);
  }
});

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

test("metadata: the titles as briefed, <= 60 rendered; descriptions <= 155", () => {
  assert.equal(pageCopy("ca").title, "Avui a Catalunya: festius, vagues, Rodalies i preus");
  assert.equal(pageCopy("es").title, "Hoy en Cataluña: festivos, huelgas, Rodalies y precios");
  assert.equal(pageCopy("en").title, "Today in Catalonia: holidays, strikes, trains, prices");
  for (const locale of LOCALES) {
    const copy = pageCopy(locale);
    assert.ok(copy.title.length <= TITLE_LIMIT, `${locale} title ${copy.title.length}`);
    const rendered = composeTitle(copy.title, todayPath(locale), "2026-10-30");
    const shown = typeof rendered === "string" ? `${rendered} · CatalunyaInfo` : rendered.absolute;
    assert.ok(shown.length <= 60, `${locale} rendered ${shown.length}`);
    assert.ok(copy.description.length <= DESCRIPTION_LIMIT && copy.description.length >= 100, `${locale} description ${copy.description.length}`);
    assert.doesNotMatch(copy.description, /\d/, "no figure or date that would go stale in the snippet");
    assert.equal(copy.h1, TODAY_NAME[locale]);
    assert.ok(copy.lead.length > 120);
  }
});

test("metadata: canonical and hreflang between the three editions, x-default to English", () => {
  for (const locale of LOCALES) {
    const meta = todayMetadata(locale);
    assert.equal(meta.alternates?.canonical, absoluteUrl(todayPath(locale)));
    assert.deepEqual(meta.alternates?.languages, {
      ca: absoluteUrl("/ca/avui/"),
      es: absoluteUrl("/es/hoy/"),
      en: absoluteUrl("/en/today/"),
      "x-default": absoluteUrl("/en/today/"),
    });
  }
});

test("JSON-LD: WebPage dated by its data, and a BreadcrumbList that matches the crumbs", () => {
  for (const locale of LOCALES) {
    const [page, crumbs] = todaySchemas(locale) as [Record<string, unknown>, Record<string, unknown>];
    assert.equal(page["@type"], "WebPage");
    assert.equal(page.url, absoluteUrl(todayPath(locale)));
    assert.equal(page.inLanguage, locale);
    assert.equal(page.name, pageCopy(locale).title);
    assert.equal(page.dateModified, todayLastModified());
    assert.equal(crumbs["@type"], "BreadcrumbList");
    const items = crumbs.itemListElement as { item: string; name: string }[];
    assert.equal(items.length, 2);
    assert.equal(items[1]!.item, absoluteUrl(todayPath(locale)));
    assert.deepEqual(
      items.map((i) => i.name),
      todayCrumbs(locale).map((c) => c.label),
    );
  }
});

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

test("sitemap: three URLs with hreflang and a deterministic lastmod (the newest dataset date)", () => {
  const expected = [HOLIDAYS.readOn, NEXT_YEAR.readOn ?? "", STRIKES_AS_OF, CALENDAR_VERIFIED_AT, RESERVOIRS.readOn].sort().at(-1);
  assert.equal(todayLastModified(), expected);
  assert.equal(todayLastModified(), todayLastModified());
  const env = { VERCEL_ENV: process.env.VERCEL_ENV, NEXT_PUBLIC_ALLOW_INDEXING: process.env.NEXT_PUBLIC_ALLOW_INDEXING };
  try {
    delete process.env.VERCEL_ENV;
    assert.deepEqual(todaySitemapEntries(), [], "nothing on a deployment that may not be indexed");
    process.env.VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
    const entries = todaySitemapEntries();
    assert.equal(entries.length, 3);
    for (const entry of entries) {
      assert.equal((entry.lastModified as Date).toISOString().slice(0, 10), expected);
      assert.equal(entry.alternates?.languages?.["x-default"], absoluteUrl("/en/today/"));
    }
    assert.deepEqual(
      entries.map((e) => e.url),
      LOCALES.map((l) => absoluteUrl(todayPath(l))),
    );
  } finally {
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
  const sitemap = readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8");
  assert.match(sitemap, /\.\.\.todaySitemapEntries\(\),/);
});

/* -------------------------------------------------------------------------- */
/* Deterministic server output                                                */
/* -------------------------------------------------------------------------- */

test("server output carries no clock: no argument-less new Date() outside the browser islands", () => {
  const files = [
    "src/lib/programmatic/today/paths.ts",
    "src/lib/programmatic/today/data.ts",
    "src/lib/programmatic/today/copy.ts",
    "src/lib/programmatic/today/page.ts",
    "src/lib/programmatic/today/logic.ts",
    "src/lib/programmatic/today/labels.ts",
    "src/components/programmatic/today/TodayPage.tsx",
    ...LOCALES.map((l) => `src/app/(public)/[locale]/${ROUTE_FILE[l]}`),
  ];
  for (const file of files) {
    const source = readFileSync(join(ROOT, file), "utf8");
    assert.doesNotMatch(source, /new Date\(\)|Date\.now\(|todayInCatalonia\(/, file);
  }
  const client = readFileSync(join(ROOT, "src/components/programmatic/today/TodayLive.tsx"), "utf8");
  assert.match(client, /^"use client";/);
  assert.match(client, /useEffect\(/, "the date is read after mount, never during the server render");
  // The daily sentences ship in the browser bundle, never in the server HTML.
  const page = readFileSync(join(ROOT, "src/components/programmatic/today/TodayPage.tsx"), "utf8");
  assert.doesNotMatch(page, /today\/labels/);
  assert.match(client, /today\/labels/);
});

test("server output is the same on every call and never says what today is", () => {
  for (const locale of LOCALES) {
    assert.deepEqual(holidayData(locale), holidayData(locale));
    assert.deepEqual(todayStrikes(locale), todayStrikes(locale));
    const fallbacks = [holidayFallback(locale), strikesFallback(locale), reservoirsFallback(locale), snowFallback(locale), verifiedLine(locale)];
    for (const text of fallbacks) {
      assert.doesNotMatch(text, /\{\w+\}|undefined|NaN|null/, text);
      assert.doesNotMatch(text, /^(Avui|Hoy|Today) (és|es|is)\b|avui no és|hoy no es|today is not|ara mateix|ahora mismo|right now/i, text);
    }
    // Every date the fallbacks print is a dataset's own.
    assert.ok(holidayFallback(locale).includes(fromDate(DATA_FROM, locale)));
    assert.ok(strikesFallback(locale).includes(onDate(STRIKES_AS_OF, locale)));
    const total = reservoirFallback().total;
    if (total) assert.ok(reservoirsFallback(locale).includes(total.date.split("-").reverse().join("/")) || locale === "en");
  }
  assert.equal(onDate("2026-11-01", "ca"), "l'1 de novembre de 2026");
  assert.equal(onDate("2026-10-30", "ca"), "el 30 d'octubre de 2026");
  assert.equal(fromDate("2026-11-11", "ca"), "de l'11 de novembre de 2026");
  assert.equal(fromDate("2026-10-29", "es"), "del 29 de octubre de 2026");
  assert.equal(onDate("2026-10-29", "en"), "on 29 October 2026");
});

/* -------------------------------------------------------------------------- */
/* Embedded data                                                              */
/* -------------------------------------------------------------------------- */

test("holiday data: Catalonia-wide days from the data's date, the Aran swap flagged, local days from the snapshot", () => {
  for (const locale of LOCALES) {
    const data = holidayData(locale);
    assert.equal(data.from, HOLIDAYS.readOn);
    assert.equal(data.towns, HOLIDAYS.municipalities.length);
    assert.ok(data.regional.every((d) => d.d >= DATA_FROM));
    assert.deepEqual(
      data.regional.map((d) => d.d),
      [...data.regional.map((d) => d.d)].sort(),
    );
    for (const [date, places] of Object.entries(data.local)) {
      assert.ok(date >= DATA_FROM && date <= data.localThrough, date);
      for (const place of places) {
        const m = HOLIDAYS.municipalities.find((x) => x.name === (place.p ?? place.n))!;
        assert.ok(m, place.n);
        const days = place.p ? m.nuclei.find((n) => n.name === place.n)!.dates : m.local;
        assert.ok(days.includes(date), `${place.n} on ${date}`);
        assert.equal(place.h, locale === "en" ? null : municipalityPath(locale, m.slug));
      }
    }
    for (const [iso, page] of Object.entries(data.datePages)) assert.equal(page.href, datePath(locale, iso));
  }
  const ca = regionalList("ca");
  assert.deepEqual(ca.find((d) => d.d === "2026-12-26"), { d: "2026-12-26", n: "Sant Esteve", xa: true });
  assert.deepEqual(ca.find((d) => d.d === "2027-03-29"), { d: "2027-03-29", n: "Dilluns de Pasqua Florida", xa: true });
  assert.ok(ca.some((d) => d.d === "2027-06-17" && d.ao));
  // Known answer (DOGC order via the snapshot): 11 November 2026 is a local holiday in Calonge i Sant Antoni.
  assert.ok(holidayData("ca").local["2026-11-11"]!.some((p) => p.n === "Calonge i Sant Antoni" && p.h === "/ca/festius/calonge-i-sant-antoni/"));
});

test("strikes: the list's upcoming strikes on its own date; the general strike links its own page", () => {
  for (const locale of LOCALES) {
    const list = todayStrikes(locale);
    assert.deepEqual(
      list.map((s) => s.id),
      upcomingStrikes(STRIKES_AS_OF).map((s) => s.id),
    );
    for (const strike of list) {
      const source = STRIKES.find((s) => s.id === strike.id)!;
      assert.equal(strike.title, source.title[locale]);
      assert.equal(strike.ms, source.minimumServices.msShort[locale]);
      if (strike.dates.includes("2026-11-11") && source.scope === "general") assert.equal(strike.href, `/${locale}/${STRIKE_11N_META[locale].path}/`);
      else {
        assert.equal(strike.href, `/${locale}/${STRIKES_META[locale].path}/#${strike.id}`);
        // The anchor is a heading id on the strikes page.
        assert.ok(JSON.stringify(buildStrikesBody(locale)).includes(`"id":"${strike.id}"`), strike.id);
      }
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Browser logic, with fixtures                                               */
/* -------------------------------------------------------------------------- */

const DATA: HolidayData = holidayData("ca");

test("today in Catalonia, whatever the device's zone: midnight edges in winter and summer", () => {
  assert.equal(todayInMadrid(new Date("2026-12-07T23:30:00Z")), "2026-12-08");
  assert.equal(todayInMadrid(new Date("2026-12-08T22:59:59Z")), "2026-12-08");
  assert.equal(todayInMadrid(new Date("2026-12-08T23:00:00Z")), "2026-12-09");
  assert.equal(todayInMadrid(new Date("2027-06-23T22:30:00Z")), "2027-06-24");
  const day = holidayDay(todayInMadrid(new Date("2026-12-07T23:30:00Z")), DATA);
  assert.equal(day.regional?.n, "la Immaculada");
});

test("holidays: today and tomorrow, Aran, weekends and the end of the published calendars", () => {
  const immaculada = holidayDay("2026-12-08", DATA);
  assert.equal(immaculada.regional?.n, "la Immaculada");
  assert.equal(immaculada.regional?.xa, undefined);
  assert.equal(holidayDay("2026-12-26", DATA).regional?.xa, true);
  const working = holidayDay("2026-11-03", DATA);
  assert.equal(working.regional, null);
  assert.ok(working.regionalKnown && working.localKnown && !working.weekend);
  assert.ok(holidayDay("2026-10-31", DATA).weekend);
  const aran = holidayDay("2027-06-17", DATA);
  assert.equal(aran.regional, null);
  assert.equal(aran.aranOnly?.n, "Festa d'Aran");
  const local = holidayDay("2026-11-11", DATA);
  assert.ok(local.local.length >= 10);
  // 2027 local days are not published: Catalonia-wide answer only.
  const next = holidayDay("2027-02-10", DATA);
  assert.ok(next.regionalKnown);
  assert.equal(next.localKnown, NEXT_YEAR.order !== null);
  // The day after the last published date: nothing is claimed.
  const after = holidayDay("2028-01-01", DATA);
  assert.ok(!after.regionalKnown && !after.localKnown);
  assert.equal(after.regional, null);
  assert.deepEqual(after.local, []);
  // Before the embedded lists (a wrong device clock): unknown, not "working".
  assert.ok(!holidayDay("2026-01-01", DATA).regionalKnown);
});

test("weekend: the same window as the weekend agenda, every day of the published calendar", () => {
  for (let day = DATA_FROM; day <= "2027-12-24"; day = new Date(Date.parse(`${day}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10)) {
    assert.deepEqual(weekendFor(day, DATA), weekendWindow(day), day);
  }
  assert.deepEqual(weekendFor("2026-10-30", DATA), { from: "2026-10-30", to: "2026-11-01", long: false });
  assert.deepEqual(weekendFor("2026-12-22", DATA), { from: "2026-12-25", to: "2026-12-27", long: true });
});

test("next holiday, next long weekend and next bridge (known answers from the 2026 and 2027 orders)", () => {
  assert.deepEqual(nextRegional("2026-10-30", DATA), { day: { d: "2026-12-08", n: "la Immaculada" }, inDays: 39 });
  assert.equal(nextRegional("2026-12-07", DATA)?.inDays, 1);
  const long = nextLongWeekend("2026-10-30", DATA)!;
  assert.deepEqual([long.from, long.to, long.bridge], ["2026-12-25", "2026-12-27", null]);
  assert.deepEqual(long.holidays.map((d) => d.n), ["Nadal", "Sant Esteve"]);
  assert.deepEqual([nextLongWeekend("2026-12-25", DATA)?.from, nextLongWeekend("2026-12-25", DATA)?.to], ["2027-01-01", "2027-01-03"]);
  assert.deepEqual([nextLongWeekend("2027-01-01", DATA)?.from, nextLongWeekend("2027-01-01", DATA)?.to], ["2027-03-26", "2027-03-29"]);
  const bridge = nextBridge("2026-10-30", DATA)!;
  assert.deepEqual([bridge.from, bridge.to, bridge.bridge], ["2026-12-05", "2026-12-08", "2026-12-07"]);
  assert.deepEqual([nextBridge("2026-12-08", DATA)?.bridge, nextBridge("2026-12-08", DATA)?.holidays[0]?.d], ["2027-06-25", "2027-06-24"]);
  // Past the published calendar: nothing to announce.
  assert.equal(nextRegional("2027-12-25", DATA), null);
  assert.equal(nextLongWeekend("2027-12-25", DATA), null);
  assert.equal(formatRange("2026-12-05", "2026-12-08", "ca"), "dissabte 5 – dimarts 8 de desembre");
  assert.equal(formatRange("2026-12-25", "2027-01-03", "en"), "Friday 25 December – Sunday 3 January");
  assert.equal(formatRange("2026-10-30", "2026-11-01", "es"), "viernes 30 de octubre – domingo 1 de noviembre");
});

const STRIKE_FIXTURE: TodayStrike[] = [
  { id: "a", dates: ["2026-10-30", "2026-11-02"], title: "vaga A", ms: "serveis A", href: "/ca/x/#a" },
  { id: "b", dates: ["2026-11-11"], title: "vaga B", ms: "serveis B", href: "/ca/y/" },
];

test("strikes: today, tomorrow and next from the embedded dates; the list's age", () => {
  assert.deepEqual(strikesOn("2026-10-30", STRIKE_FIXTURE).map((s) => s.id), ["a"]);
  assert.deepEqual(strikesOn("2026-10-31", STRIKE_FIXTURE), []);
  assert.deepEqual(strikesOn("2026-11-11", STRIKE_FIXTURE).map((s) => s.id), ["b"]);
  assert.deepEqual(nextStrike("2026-10-31", STRIKE_FIXTURE), { strike: STRIKE_FIXTURE[0], date: "2026-11-02" });
  assert.deepEqual(nextStrike("2026-11-02", STRIKE_FIXTURE)?.date, "2026-11-11");
  assert.equal(nextStrike("2026-11-11", STRIKE_FIXTURE), null);
  assert.equal(strikesListStale("2026-11-06", "2026-10-30"), false);
  assert.equal(strikesListStale("2026-11-07", "2026-10-30"), true);
  // On the real list: the general strike is on 11 November.
  assert.ok(strikesOn("2026-11-11", todayStrikes("ca")).some((s) => s.id === "vaga-general-2026-11-11"));
});

const alert = (id: string, lines: CompactAlert["lines"]): CompactAlert => ({ id, lines, stations: [], date: "2026-10-30", time: "07:10", text: { ca: id, es: id, en: null } });

test("Rodalies: notice count and affected lines in the official order", () => {
  assert.deepEqual(noticeSummary([]), { count: 0, lines: [], everyLine: false });
  assert.deepEqual(noticeSummary([alert("1", ["R4", "R2S"]), alert("2", ["R2S", "R1"]), alert("3", [])]), { count: 3, lines: ["R1", "R2S", "R4"], everyLine: false });
  const all = rodaliesLines("ca").names;
  assert.equal(noticeSummary([alert("x", Object.keys(all) as CompactAlert["lines"])]).everyLine, true);
  assert.deepEqual(rodaliesLines("en").hrefs, {}, "no English line pages");
  assert.equal(rodaliesLines("es").hrefs.R2S, "/es/rodalies/r2-sud/");
});

test("reservoirs: the total is the guide's (sum of volumes over capacities), only with nine same-day readings", () => {
  const own = snapshotReadings();
  const total = reservoirTotal(own)!;
  assert.ok(total);
  assert.equal(total.date, RESERVOIRS.latestDate);
  assert.ok(Math.abs(total.percent - totals(own).percent) < 1e-9);
  assert.deepEqual(reservoirFallback().total, total);
  assert.equal(reservoirTotal(own.slice(1)), null, "eight readings are not a total");
  assert.equal(reservoirTotal([{ ...own[0]!, date: "2026-10-27" }, ...own.slice(1)]), null, "different days are not a total");
  const fixture = [
    { date: "2026-10-30", percent: 50, volume: 100 },
    { date: "2026-10-30", percent: 25, volume: 25 },
  ];
  // 125 hm³ of 300 hm³, not the mean of 50 and 25.
  assert.ok(Math.abs(reservoirTotal(fixture, 2)!.percent - (125 / 300) * 100) < 1e-9);
});

test("fuel: median of petrol 95 and diesel over every station that sells it", () => {
  const station = (id: string, e95?: number, goa?: number): LiveStation => ({ id, b: "X", a: "", t: "", ine: "", c: "", p: "08", ...(e95 ? { e95 } : {}), ...(goa ? { goa } : {}) });
  const m = fuelMedians([station("1", 1.5, 1.4), station("2", 1.6), station("3", 1.7, 1.2), station("4", undefined, 1.3)]);
  assert.deepEqual(m, { e95: { median: 1.6, count: 3 }, goa: { median: 1.3, count: 3 } });
  assert.deepEqual(fuelMedians([]), { e95: { median: null, count: 0 }, goa: { median: null, count: 0 } });
});

test("snow: in season with the homepage strip's window, across New Year", () => {
  const { from, to } = snowSeason();
  assert.equal(inSeason("2026-10-24", from, to), false);
  assert.equal(inSeason("2026-10-25", from, to), true);
  assert.equal(inSeason("2027-01-15", from, to), true);
  assert.equal(inSeason("2027-05-15", from, to), true);
  assert.equal(inSeason("2027-05-16", from, to), false);
  assert.equal(inSeason("2027-08-01", from, to), false);
});

test("labels: every language has every sentence, placeholders intact", () => {
  const shape = (o: unknown): unknown => (typeof o === "object" && o ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, shape(v)])) : typeof o);
  assert.deepEqual(shape(TODAY_LABELS.es), shape(TODAY_LABELS.ca));
  assert.deepEqual(shape(TODAY_LABELS.en), shape(TODAY_LABELS.ca));
  for (const locale of LOCALES) {
    const l = TODAY_LABELS[locale];
    assert.match(l.today, /\{date\}/);
    assert.match(l.strikes.today, /\{title\}/);
    assert.match(l.rodalies.many, /\{n\}/);
    assert.match(l.reservoirs.total, /\{pct\}/);
    assert.match(l.fuel.median, /\{n\}.*\{date\}.*\{time\}/);
    assert.match(l.weekend.bridgeValue, /\{name\}.*\{weekday\}.*\{bridge\}.*\{range\}/);
  }
  assert.equal(fill(TODAY_LABELS.ca.holiday.regional, { name: "Nadal" }), "Sí: avui és festiu a tot Catalunya (Nadal).");
  assert.equal(joinList(["A", "B", "C"], "ca"), "A, B i C");
  assert.equal(joinList(["A"], "en"), "A");
});

/* -------------------------------------------------------------------------- */
/* Links                                                                      */
/* -------------------------------------------------------------------------- */

test("every internal link resolves to a real page (family routes or the path its publisher uses)", () => {
  const known = new Set<string>([
    ...holidayFamilyPaths().map((p) => p.path),
    ...reservoirFamilyPaths().map((p) => p.path),
    ...rodaliesFamilyPaths().map((p) => p.path),
    ...weekendFamilyPaths().map((p) => p.path),
    ...fuelFamilyPaths().map((p) => p.path),
  ]);
  for (const locale of LOCALES) {
    for (const meta of [STRIKES_META, STRIKE_11N_META, DECEMBER_BRIDGE_META]) known.add(`/${locale}/${meta[locale].path}/`);
    for (const key of ["holidayToday", "localHolidays", "workCalendar"] as const) known.add(GUIDES[key][locale]);
    known.add(`/${locale}/${B2_PATHS.snowNow[locale]}/`);
    for (const key of ["weekend", "reservoirs"] as const) known.add(`/${locale}/${TOOL_PATHS[key][locale]}/`);
  }
  for (const locale of LOCALES) {
    const l = todayLinks(locale);
    const data = holidayData(locale);
    const hrefs = [
      l.holidays.hub,
      l.holidays.today,
      l.holidays.local,
      l.holidays.calendar,
      l.strikes.hub,
      l.strikes.general,
      l.rodalies.hub,
      l.reservoirs.hub,
      l.reservoirs.guide,
      l.fuel.hub,
      l.weekend.agenda,
      l.weekend.hub,
      l.weekend.bridge,
      l.snow.page,
      ...l.weekend.zones.map((z) => z.href),
      ...Object.values(data.datePages).map((p) => p.href),
      ...Object.values(data.local).flatMap((places) => places.map((p) => p.h)),
      ...todayStrikes(locale).map((s) => s.href.split("#")[0]),
      ...Object.values(rodaliesLines(locale).hrefs),
    ].filter((href): href is string => typeof href === "string");
    assert.ok(hrefs.length > 20, locale);
    for (const href of hrefs) assert.ok(known.has(href), `${locale}: ${href}`);
    if (locale !== "en") {
      assert.ok(l.weekend.zones.length >= 5);
      assert.equal(l.fuel.hub, `/${locale}/${locale === "ca" ? "benzineres" : "gasolineras"}/`);
    } else {
      assert.equal(l.fuel.hub, "/es/gasolineras/", "English links the Spanish fuel hub, labelled as Spanish");
      assert.equal(l.holidays.hub, null);
    }
    assert.ok(l.rodalies.official.startsWith("https://rodalies.gencat.cat/"));
    for (const source of sources(locale)) assert.match(source.url, /^https:\/\//);
  }
});

test("the live items read the existing CDN-cached route handlers only", () => {
  for (const endpoint of [ALERTS_ENDPOINT, LEVELS_ENDPOINT, FUEL_ENDPOINT]) {
    const route = join(ROOT, "src/app", endpoint.replace(/\/$/, ""), "route.ts");
    assert.ok(existsSync(route), endpoint);
    assert.match(readFileSync(route, "utf8"), /cache-control|CACHE/i, `${endpoint} sets its own cache header`);
  }
  const client = readFileSync(join(ROOT, "src/components/programmatic/today/TodayLive.tsx"), "utf8");
  const fetched = [...client.matchAll(/fetch\(([^,)]+)/g)].map((m) => m[1]);
  assert.deepEqual(fetched, ["url"], "one fetch helper, called with the endpoints above");
  assert.doesNotMatch(client, /https?:\/\//, "no upstream fetched from the browser");
});

/* -------------------------------------------------------------------------- */
/* Hub strip and homepage                                                     */
/* -------------------------------------------------------------------------- */

test("hub strips: the daily page is the first shortcut in every section and language", () => {
  for (const section of ["guides", "events", "destinations"]) {
    for (const locale of LOCALES) {
      const first = hubShortcuts(section, locale)[0];
      assert.deepEqual(first, { label: TODAY_NAME[locale], href: todayPath(locale) }, `${section}/${locale}`);
    }
  }
});

test("homepage strip: the daily page leads the year-round tools in every edition", () => {
  for (const locale of LOCALES) {
    assert.equal(toolsFor(locale, "2027-06-01")[0], "today", locale);
    assert.equal(`/${locale}/${TOOL_PATHS.today[locale]}/`, todayPath(locale));
  }
  const llms = readFileSync(join(ROOT, "src/app/llms.txt/route.ts"), "utf8");
  assert.match(llms, /todayPath\(locale\)/);
});
