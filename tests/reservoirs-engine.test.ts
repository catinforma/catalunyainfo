import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { REFERENCE_CAPACITY, isClean, parseRows } from "../src/lib/content/reservoirs/levels.ts";
import { LOCALES } from "../src/lib/i18n/config.ts";
import {
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  droughtParagraphs,
  facts,
  faq,
  hubCopy,
  readParagraphs,
  relatedLinks,
  reservoirDescription,
  reservoirH1,
  reservoirLead,
  reservoirTitle,
  sources,
  thresholdTables,
  thresholdText,
  trendParagraphs,
} from "../src/lib/programmatic/reservoirs/copy.ts";
import { RESERVOIR_DATA, SNAPSHOT, reservoirBySlug, siblingsOf, snapshotReadings } from "../src/lib/programmatic/reservoirs/data.ts";
import {
  STALE_AFTER_DAYS,
  daysBetween,
  formatChange,
  formatDate,
  formatNumber,
  indicatorVolume,
  madridDate,
  mergeReadings,
  parsePayload,
  readingAge,
  type Reading,
} from "../src/lib/programmatic/reservoirs/live.ts";
import { INDICATORS, OFFICIAL, indicatorsOf } from "../src/lib/programmatic/reservoirs/official.ts";
import {
  NOT_FOUND_METADATA,
  reservoirFamilyPaths,
  reservoirHubMetadata,
  reservoirMetadata,
  reservoirSitemapEntries,
  reservoirStaticParams,
  resolveReservoir,
  resolveReservoirHub,
} from "../src/lib/programmatic/reservoirs/pages.ts";
import { reservoirHubPath, reservoirPath } from "../src/lib/programmatic/reservoirs/paths.ts";
import { isValidReading, liveReadings, readingOnOrBefore, shiftMonths, trendOf, validReadings, type AcaRow } from "../src/lib/programmatic/reservoirs/prepare.ts";
import { RESERVOIRS, type LivePayload } from "../src/lib/programmatic/reservoirs/types.ts";
import { FAILED_CACHE_CONTROL, OK_CACHE_CONTROL, buildLevelsResponse, liveQueryUrl, type Fetcher } from "../src/lib/programmatic/reservoirs/upstream.ts";
import { composeTitle } from "../src/lib/seo/metadata.ts";
import { absoluteUrl } from "../src/lib/site.ts";

/**
 * Reservoir level per reservoir (28 Oct 2026).
 *
 * Fixture recorded on 28 Oct 2026 at about 12:40 Madrid time
 * (tests/fixtures/reservoirs/gn9e-2026-10-28.json): the ACA's daily series
 * gn9e-3qhr from 14 to 28 Oct 2026, 135 rows, exactly what the route handler
 * asks for on that day.
 */

const ROOT = join(import.meta.dirname, "..");
const FIXTURE = JSON.parse(readFileSync(join(ROOT, "tests/fixtures/reservoirs/gn9e-2026-10-28.json"), "utf8")) as AcaRow[];
const READ_AT = new Date("2026-10-28T11:40:00Z");

const row = (dia: string, estaci: string, pct: string, vol: string, level = "400.00"): AcaRow => ({
  dia: `${dia}T00:00:00.000`,
  estaci,
  percentatge_volum_embassat: pct,
  volum_embassat: vol,
  nivell_absolut: level,
});

/* -------------------------------------------------------------------------- */
/* Snapshot                                                                   */
/* -------------------------------------------------------------------------- */

test("snapshot: the nine reservoirs of the ACA series, in order, dated, from the two official datasets", () => {
  assert.deepEqual(
    RESERVOIR_DATA.map((r) => r.slug),
    RESERVOIRS.map((r) => r.slug),
  );
  assert.equal(RESERVOIR_DATA.length, 9);
  assert.deepEqual(new Set(RESERVOIRS.map((r) => r.name)), new Set(Object.keys(REFERENCE_CAPACITY)), "the family is exactly the series levels.ts validates");
  assert.match(SNAPSHOT.readOn, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(SNAPSHOT.readOn, "2026-10-28");
  assert.equal(SNAPSHOT.latestDate, "2026-10-28");
  assert.equal(SNAPSHOT.sources.daily.id, "gn9e-3qhr");
  assert.equal(SNAPSHOT.sources.history.id, "vjx7-6kcp");
  for (const source of Object.values(SNAPSHOT.sources)) {
    assert.match(source.url, /^https:\/\/analisi\.transparenciacatalunya\.cat\/d\//);
    assert.match(source.terms, /Agència Catalana de l'Aigua/);
    assert.match(source.updated ?? "", /^\d{4}-\d{2}-\d{2}$/);
  }
  const codes = new Set(RESERVOIR_DATA.map((r) => r.code));
  assert.equal(codes.size, 9);
  for (const r of RESERVOIR_DATA) assert.match(r.code ?? "", /^E\d{2}$/, r.slug);
  // No Ebro-basin reservoir of the CHE in the family (their reuse terms are unclear).
  for (const ebro of ["rialb", "oliana", "canelles", "santa-anna", "talarn", "camarasa", "mequinensa", "riba-roja"]) {
    assert.ok(!RESERVOIR_DATA.some((r) => r.slug.includes(ebro)), ebro);
  }
});

test("snapshot invariants: every reading passes the size check; latest within min and max; one reading a month, in order", () => {
  for (const r of RESERVOIR_DATA) {
    const t = r.trend;
    for (const reading of [t.latest, t.min, t.max, ...(t.yearAgo ? [t.yearAgo] : []), ...t.monthly]) {
      assert.ok(isValidReading(r.name, reading.percent, reading.volume), `${r.slug} ${reading.date}`);
      assert.ok(reading.level === null || (reading.level > 0 && reading.level < 1000), `${r.slug} level`);
    }
    assert.ok(t.min.percent <= t.latest.percent && t.latest.percent <= t.max.percent, r.slug);
    assert.ok(t.min.date <= t.latest.date && t.max.date <= t.latest.date, r.slug);
    assert.ok(t.monthly.length >= 12 && t.monthly.length <= 13, `${r.slug}: ${t.monthly.length}`);
    assert.equal(t.monthly.at(-1)!.date, t.latest.date);
    for (let i = 1; i < t.monthly.length; i++) assert.ok(t.monthly[i - 1]!.date < t.monthly[i]!.date, r.slug);
    assert.ok(t.yearAgo, `${r.slug} has a reading a year earlier`);
    const gap = daysBetween(t.yearAgo!.date, t.latest.date);
    assert.ok(gap >= 362 && gap <= 368, `${r.slug} year gap ${gap}`);
    assert.ok(t.validDays >= 300, `${r.slug} valid days ${t.validDays}`);
  }
});

test("snapshot known answers (gn9e-3qhr, read 28 Oct 2026)", () => {
  const sau = reservoirBySlug("sau");
  assert.deepEqual(sau.trend.latest, { date: "2026-10-28", percent: 73.6, volume: 122.12, level: 416.99 });
  assert.deepEqual(sau.trend.yearAgo, { date: "2025-10-28", percent: 55.9, volume: 92.68, level: 410.44 });
  assert.equal(sau.code, "E06");
  assert.equal(sau.basin, "El Ter");
  assert.equal(sau.place, "Vilanova de Sau");
  assert.equal(reservoirBySlug("siurana").trend.yearAgo?.percent, 13.5);
  assert.equal(reservoirBySlug("siurana").subbasin, "Riu de Siurana");
  // A real reading above 100 %: kept, with a volume that matches the size.
  assert.deepEqual(reservoirBySlug("susqueda").trend.max, { date: "2026-03-08", percent: 102.1, volume: 228.36, level: 351.85 });
});

test("rows that lost their decimal separator are rejected; a real reading above 100 % is kept", () => {
  // 30 Sep 2026 as it once arrived (levels.ts), and the history vjx7-6kcp on 1 Mar 2026 ("1006").
  assert.equal(isValidReading("Sau", 683, 11325), false);
  assert.equal(isValidReading("la Llosa del Cavall", 1006, 72.02), false);
  assert.equal(isValidReading("Sau", 68.3, 113.25), true);
  // Susqueda, 8 Mar 2026: 102.1 % / 228.36 hm³ (223.66 hm³ implied). The overall report rejects it; the per-reservoir page keeps it.
  assert.equal(isValidReading("Susqueda", 102.1, 228.36), true);
  assert.equal(isClean(parseRows([row("2026-03-08", "Embassament de Susqueda (Osor)", "102.1", "228.36")])[0]!), false);
  assert.equal(isValidReading("Embassament nou", 50, 10), false, "unknown reservoir");
  const { byName, rejected } = validReadings([
    row("2026-09-30", "Embassament de Sau (Vilanova de Sau)", "683", "11325"),
    row("2026-10-01", "Embassament de Sau (Vilanova de Sau)", "68.2", "113.02"),
    row("2026-10-01", "Embassament de Sau (Vilanova de Sau)", "68.2", "113.02"),
  ]);
  assert.equal(byName.get("Sau")?.length, 1, "one reading per day");
  assert.equal(rejected.get("Sau"), 1);
});

test("trend: a year, its lowest and highest, the same day each month (clamped), never a forecast", () => {
  assert.equal(shiftMonths("2026-10-31", 8), "2026-02-28");
  assert.equal(shiftMonths("2026-10-28", 12), "2025-10-28");
  assert.equal(shiftMonths("2024-03-31", 1), "2024-02-29");
  const list = [
    { date: "2025-10-27", percent: 50, volume: 1, level: null },
    { date: "2026-01-28", percent: 20, volume: 1, level: null },
    { date: "2026-05-26", percent: 90, volume: 1, level: null },
    { date: "2026-10-28", percent: 60, volume: 1, level: null },
  ];
  const t = trendOf(list);
  assert.equal(t.yearAgo?.date, "2025-10-27", "the nearest day before, within three days");
  assert.equal(t.min.date, "2026-01-28");
  assert.equal(t.max.date, "2026-05-26");
  assert.deepEqual(
    t.monthly.map((m) => m.date),
    ["2025-10-27", "2026-01-28", "2026-05-26", "2026-10-28"],
  );
  assert.equal(readingOnOrBefore(list, "2026-01-31"), list[1], "28 Jan is within three days of 31 Jan");
  assert.equal(readingOnOrBefore(list, "2026-02-01"), null);
  assert.throws(() => trendOf([]));
  for (const r of RESERVOIR_DATA) {
    for (const locale of LOCALES) {
      const text = trendParagraphs(r, locale).join(" ");
      assert.doesNotMatch(text, /es preveu|se prevé|is expected|will (rise|fall|reach|be)|arribarà|llegará|s'espera|se espera/i, `${r.slug}/${locale}`);
      assert.match(text, /no una previsió|no una previsión|not a forecast/, `${r.slug}/${locale} says it is history`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Official facts and drought thresholds                                      */
/* -------------------------------------------------------------------------- */

test("official capacities are the ACA bulletin's of 28/10/2026 and agree with the sizes the data is checked against", () => {
  // "Estat dels embassaments de conques internes ... a 28/10/2026", column "Volum màxim hm³".
  const bulletin: Record<string, number> = {
    "darnius-boadella": 63.3,
    sau: 165.81,
    susqueda: 223.58,
    "la-baells": 108.71,
    "la-llosa-del-cavall": 71.56,
    "sant-ponc": 24.41,
    foix: 3.37,
    siurana: 12.01,
    riudecanyes: 5.32,
  };
  let total = 0;
  for (const r of RESERVOIR_DATA) {
    assert.equal(OFFICIAL[r.slug].capacity, bulletin[r.slug], r.slug);
    assert.ok(Math.abs(OFFICIAL[r.slug].capacity / REFERENCE_CAPACITY[r.name]! - 1) < 0.02, r.slug);
    total += OFFICIAL[r.slug].capacity;
  }
  assert.equal(Math.round(total * 100) / 100, 678.07, "the bulletin's TOTAL");
  assert.equal(OFFICIAL.sau.river.ca, "Ter");
  assert.equal(OFFICIAL["la-llosa-del-cavall"].river.ca, "Cardener");
  assert.equal(OFFICIAL.susqueda.manager, "endesa");
  assert.equal(OFFICIAL.riudecanyes.manager, "riudecanyes");
  assert.equal(Object.values(OFFICIAL).filter((o) => o.manager === "aca").length, 7, "the ACA manages seven");
});

test("drought plan thresholds (PES tables 3-3, 3-4, 3-5) and which indicators count each reservoir", () => {
  const terLl = INDICATORS.terLlobregat;
  assert.deepEqual(terLl.reservoirs.slice().sort(), ["la-baells", "la-llosa-del-cavall", "sant-ponc", "sau", "susqueda"]);
  assert.equal(terLl.rows.find((r) => r.stage === "prealerta")!.values[0], 367);
  const alerta = terLl.rows.find((r) => r.stage === "alerta")!.values;
  assert.deepEqual([alerta[0], alerta[4], alerta[5], alerta[10], alerta[11]], [210, 240, 270, 240, 210], "Oct, Feb, Mar, Aug, Sep");
  assert.equal(INDICATORS.darnius.rows.find((r) => r.stage === "excepcionalitat")!.values[10], 17.5, "August");
  assert.deepEqual(INDICATORS.siuranaRiudecanyes.rows.map((r) => r.values[0]), [10.5, 1]);
  for (const ind of Object.values(INDICATORS)) for (const r of ind.rows) assert.equal(r.values.length, 12, `${ind.key}/${r.stage}`);
  assert.deepEqual(indicatorsOf("sau").map((i) => i.key), ["terLlobregat", "ter"]);
  assert.deepEqual(indicatorsOf("sant-ponc").map((i) => i.key), ["terLlobregat", "llobregat"]);
  assert.deepEqual(indicatorsOf("siurana").map((i) => i.key), ["siuranaRiudecanyes"]);
  assert.deepEqual(indicatorsOf("foix"), [], "the PES has no Foix indicator");
  assert.equal(thresholdText(alerta, "ca"), "210 (oct.–gen.), 240 (febr.), 270 (març–jul.), 240 (ag.), 210 (set.)");
  assert.equal(thresholdText(Array(12).fill(10.5), "es"), "10,5");
  assert.equal(thresholdTables("foix", "ca").length, 0);
  assert.equal(thresholdTables("sau", "en")[0]!.rows[0]!.stage, "Pre-alert");
});

/* -------------------------------------------------------------------------- */
/* Live reading: route handler                                                */
/* -------------------------------------------------------------------------- */

function fakeFetch(answer: () => Response): { fetcher: Fetcher; calls: string[] } {
  const calls: string[] = [];
  const fetcher: Fetcher = async (url) => {
    calls.push(url);
    return answer();
  };
  return { fetcher, calls };
}

test("live (fixture of 28 Oct 2026): one reading per reservoir, with its level and the change over a week", () => {
  const readings = liveReadings(FIXTURE);
  assert.equal(readings.length, 9);
  const sau = readings.find((r) => r.slug === "sau")!;
  assert.deepEqual(sau, { slug: "sau", date: "2026-10-28", percent: 73.6, volume: 122.12, level: 416.99, change: 0.6, changeFrom: "2026-10-21" });
  const riud = readings.find((r) => r.slug === "riudecanyes")!;
  assert.equal(riud.percent, 27.8);
  assert.equal(riud.level, 206.58);
});

test("handler: the ACA answers -> 200, one fetch of the last 14 days, cached an hour at the CDN", async () => {
  const { fetcher, calls } = fakeFetch(() => Response.json(FIXTURE));
  const res = await buildLevelsResponse(fetcher, READ_AT);
  assert.equal(res.status, 200);
  assert.equal(res.headers["cache-control"], "public, s-maxage=3600, stale-while-revalidate=7200");
  assert.equal(OK_CACHE_CONTROL, res.headers["cache-control"]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0], liveQueryUrl(READ_AT));
  const query = new URL(calls[0]!);
  assert.equal(query.pathname, "/resource/gn9e-3qhr.json");
  assert.equal(query.searchParams.get("$where"), "dia >= '2026-10-14T00:00:00.000'");
  assert.equal(query.searchParams.get("$order"), "dia DESC");
  assert.ok(res.body.ok && res.body.readings.length === 9);
  assert.equal(res.body.fetchedAt, READ_AT.toISOString());
  // Late on 31 Dec in UTC is already 1 Jan in Madrid: the window follows Madrid's calendar.
  assert.equal(new URL(liveQueryUrl(new Date("2026-12-31T23:30:00Z"))).searchParams.get("$where"), "dia >= '2026-12-18T00:00:00.000'");
});

test("handler failures: 503 with a one-minute cache, never made-up figures", async () => {
  const failed = { ok: false, error: "unavailable", fetchedAt: READ_AT.toISOString() };
  const threeReservoirs = FIXTURE.filter((r) => /Sau|Susqueda|Foix/.test(r.estaci ?? ""));
  for (const answer of [() => Response.json({}, { status: 500 }), () => Response.json({ error: true }), () => Response.json(threeReservoirs)]) {
    const res = await buildLevelsResponse(fakeFetch(answer).fetcher, READ_AT);
    assert.equal(res.status, 503);
    assert.equal(res.headers["cache-control"], FAILED_CACHE_CONTROL);
    assert.deepEqual(res.body, failed);
  }
  const throws: Fetcher = async () => {
    throw new Error("timeout");
  };
  assert.deepEqual((await buildLevelsResponse(throws, READ_AT)).body, failed);
});

test("route file: force-dynamic, never ISR, relays the handler", () => {
  const source = readFileSync(join(ROOT, "src/app/api/reservoirs/levels/route.ts"), "utf8");
  assert.match(source, /export const dynamic = "force-dynamic";/);
  assert.match(source, /buildLevelsResponse\(fetch, new Date\(\)\)/);
  assert.doesNotMatch(source, /export const revalidate/);
  const upstream = readFileSync(join(ROOT, "src/lib/programmatic/reservoirs/upstream.ts"), "utf8");
  assert.match(upstream, /cache: "no-store"/);
});

/* -------------------------------------------------------------------------- */
/* Live reading: browser logic                                                */
/* -------------------------------------------------------------------------- */

const own: Reading[] = snapshotReadings();

test("client: Madrid's date across midnight in both offsets; today, yesterday, recent, stale; the day after the last date", () => {
  assert.equal(madridDate(new Date("2026-10-28T22:59:59Z")), "2026-10-28");
  assert.equal(madridDate(new Date("2026-10-28T23:00:00Z")), "2026-10-29", "winter: UTC+1");
  assert.equal(madridDate(new Date("2026-07-01T21:59:59Z")), "2026-07-01");
  assert.equal(madridDate(new Date("2026-07-01T22:00:00Z")), "2026-07-02", "summer: UTC+2");
  const latest = SNAPSHOT.latestDate; // 28 Oct 2026
  assert.equal(readingAge(latest, new Date("2026-10-28T22:59:00Z")), "today");
  assert.equal(readingAge(latest, new Date("2026-10-28T23:30:00Z")), "yesterday", "00:30 on the 29th in Madrid: the day after the last date");
  assert.equal(readingAge(latest, new Date("2026-10-30T10:00:00Z")), "recent");
  assert.equal(STALE_AFTER_DAYS, 2);
  assert.equal(readingAge(latest, new Date("2026-10-31T10:00:00Z")), "stale", "three days without a reading");
  assert.equal(readingAge("2026-12-31", new Date("2027-01-01T10:00:00Z")), "yesterday", "across a year end");
  assert.equal(readingAge("2026-10-29", new Date("2026-10-28T12:00:00Z")), "today", "a fast server clock never reads as the future");
});

test("client: the endpoint's JSON is checked before anything is shown from it", () => {
  const good = { ok: true, fetchedAt: READ_AT.toISOString(), readings: liveReadings(FIXTURE) };
  assert.ok(parsePayload(good));
  assert.ok(parsePayload({ ok: false, error: "unavailable", fetchedAt: READ_AT.toISOString() }));
  assert.equal(parsePayload(null), null);
  assert.equal(parsePayload({ ok: true, readings: [] }), null, "no fetchedAt");
  assert.equal(parsePayload({ ...good, readings: [{ ...good.readings[0], percent: 683 }] }), null, "a damaged percentage");
  assert.equal(parsePayload({ ...good, readings: [{ ...good.readings[0], slug: "rialb" }] }), null, "not one of ours");
  assert.equal(parsePayload({ ...good, readings: [{ ...good.readings[0], date: "28/10/2026" }] }), null);
  assert.equal(parsePayload({ ok: false, error: "other", fetchedAt: READ_AT.toISOString() }), null);
});

test("client: today's reading replaces the page's own only when it is as new or newer; failure keeps the page's own", () => {
  const payload = parsePayload({ ok: true, fetchedAt: READ_AT.toISOString(), readings: liveReadings(FIXTURE) }) as LivePayload;
  const merged = mergeReadings(payload, own);
  assert.equal(merged.live, 9);
  assert.equal(merged.readings.find((r) => r.slug === "sau")!.change, 0.6);
  assert.deepEqual(mergeReadings(null, own), { readings: own, live: 0 });
  assert.deepEqual(mergeReadings({ ok: false, error: "unavailable", fetchedAt: READ_AT.toISOString() }, own), { readings: own, live: 0 });
  const older = { ok: true as const, fetchedAt: READ_AT.toISOString(), readings: [{ slug: "sau" as const, date: "2026-10-01", percent: 1, volume: 1, level: null, change: null, changeFrom: null }] };
  assert.equal(mergeReadings(older, own).readings.find((r) => r.slug === "sau"), own.find((r) => r.slug === "sau"), "an older live answer never wins");
});

test("client: an indicator's reserves are summed only over readings of the same day", () => {
  const sum = indicatorVolume(own, INDICATORS.terLlobregat.reservoirs);
  assert.deepEqual(sum, { volume: 481.05, date: "2026-10-28" }, "Sau 122.12 + Susqueda 188.54 + Llosa 59.88 + Sant Ponç 21.78 + Baells 88.73");
  const mixed = own.map((r) => (r.slug === "sau" ? { ...r, date: "2026-10-27" } : r));
  assert.equal(indicatorVolume(mixed, INDICATORS.terLlobregat.reservoirs), null);
  assert.equal(indicatorVolume(own.filter((r) => r.slug !== "siurana"), INDICATORS.siuranaRiudecanyes.reservoirs), null);
});

test("client: numbers and dates format the same on the server and in the browser", () => {
  assert.equal(formatNumber(73.6, "ca"), "73,6");
  assert.equal(formatNumber(73.6, "en"), "73.6");
  assert.equal(formatNumber(165.81, "es", 2), "165,81");
  assert.equal(formatChange(0.6, "ca"), "+0,6");
  assert.equal(formatChange(-0.44, "en"), "−0.4");
  assert.equal(formatChange(0, "es"), "±0,0");
  assert.equal(formatDate("2026-10-28", "ca"), "28/10/2026");
  assert.equal(formatDate("2026-03-08", "en"), "8 Mar 2026");
});

/* -------------------------------------------------------------------------- */
/* Routing and metadata                                                       */
/* -------------------------------------------------------------------------- */

test("routes: each folder answers its own language only; unknown or differently spelled slugs are 404s", () => {
  assert.equal(resolveReservoirHub("ca", "ca"), "ca");
  assert.equal(resolveReservoirHub("ca", "es"), null);
  assert.equal(resolveReservoirHub("en", "en"), "en");
  assert.equal(resolveReservoirHub("es", "fr"), null);
  assert.equal(resolveReservoir("ca", "ca", "sau")?.slug, "sau");
  assert.equal(resolveReservoir("es", "es", "la-baells")?.slug, "la-baells");
  assert.equal(resolveReservoir("en", "en", "siurana")?.slug, "siurana");
  assert.equal(resolveReservoir("ca", "es", "sau"), null, "/es/embassaments/sau/ is a 404");
  assert.equal(resolveReservoir("es", "ca", "sau"), null, "/ca/embalses/sau/ is a 404");
  assert.equal(resolveReservoir("en", "ca", "sau"), null);
  assert.equal(resolveReservoir("ca", "ca", "baells"), null, "one spelling per reservoir");
  assert.equal(resolveReservoir("ca", "ca", "Sau"), null);
  assert.equal(resolveReservoir("ca", "ca", "rialb"), null, "no Ebro-basin pages");
  assert.equal(resolveReservoir("ca", "ca", "../sau"), null);
  assert.equal(reservoirPath("ca", "sau"), "/ca/embassaments/sau/");
  assert.equal(reservoirPath("es", "sau"), "/es/embalses/sau/");
  assert.equal(reservoirPath("en", "sau"), "/en/reservoirs/sau/");
  assert.equal(reservoirHubPath("es"), "/es/embalses/");
});

test("routes: the nine prerendered per language, always with the route's own locale", () => {
  for (const [locale, key] of [
    ["ca", "embassament"],
    ["es", "embalse"],
    ["en", "reservoir"],
  ] as const) {
    const params = reservoirStaticParams(locale, key);
    assert.equal(params.length, 9);
    for (const p of params) {
      assert.equal(p.locale, locale);
      assert.ok(resolveReservoir(locale, p.locale, (p as Record<string, string>)[key]!), `${locale}/${key}`);
    }
  }
});

test("route files: revalidate=false, own locale, notFound(), no database", () => {
  const app = join(ROOT, "src/app/(public)/[locale]");
  for (const [file, locale] of [
    ["embassaments/page.tsx", "ca"],
    ["embalses/page.tsx", "es"],
    ["reservoirs/page.tsx", "en"],
    ["embassaments/[embassament]/page.tsx", "ca"],
    ["embalses/[embalse]/page.tsx", "es"],
    ["reservoirs/[reservoir]/page.tsx", "en"],
  ] as const) {
    const source = readFileSync(join(app, file), "utf8");
    assert.match(source, /export const revalidate = false;/, file);
    assert.match(source, new RegExp(`const ROUTE = "${locale}";`), file);
    assert.match(source, /resolveReservoir(Hub)?\(ROUTE, /, file);
    assert.match(source, /notFound\(\)/, file);
    assert.doesNotMatch(source, /repository|getDb|@\/lib\/db/, `${file} reads no database`);
    if (file.includes("[")) assert.match(source, /export const dynamicParams = true;/, file);
  }
  assert.deepEqual(NOT_FOUND_METADATA, { robots: { index: false, follow: false } });
});

test("metadata: titles <= 60 with the reservoir and the year, descriptions <= 155, unique, H1 and lead", () => {
  for (const locale of LOCALES) {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const r of RESERVOIR_DATA) {
      const title = reservoirTitle(r, locale);
      assert.ok(title.length <= TITLE_LIMIT, `${locale}/${r.slug}: ${title} (${title.length})`);
      assert.ok(title.toLowerCase().includes(r.name.toLowerCase()), title);
      assert.match(title, /\(2026\)$/);
      assert.match(title, locale === "ca" ? /^Embassament .* avui/ : locale === "es" ? /^Embalse .* hoy/ : / reservoir today/);
      const rendered = composeTitle(title, reservoirPath(locale, r.slug), "2026-10-28");
      const shown = typeof rendered === "string" ? `${rendered} · CatalunyaInfo` : rendered.absolute;
      assert.ok(shown.length <= 60, `${locale}/${r.slug} rendered ${shown.length}`);
      const description = reservoirDescription(r, locale);
      assert.ok(description.length <= DESCRIPTION_LIMIT && description.length >= 80, `${locale}/${r.slug}: ${description.length}`);
      assert.doesNotMatch(description, /\d+([.,]\d+)? ?%/, "no percentage that would go stale");
      titles.add(title);
      descriptions.add(description);
      assert.ok(reservoirH1(r, locale).length > 10);
      assert.ok(reservoirLead(r, locale).length > 80);
    }
    assert.equal(titles.size, 9);
    assert.equal(descriptions.size, 9);
    const hub = hubCopy(locale);
    assert.ok(hub.title.length <= TITLE_LIMIT, `${locale} hub title ${hub.title.length}`);
    assert.ok(hub.description.length <= DESCRIPTION_LIMIT, `${locale} hub description ${hub.description.length}`);
    assert.match(hub.title, /2026/);
  }
  assert.equal(reservoirTitle(reservoirBySlug("sau"), "ca"), "Embassament de Sau avui: nivell i % d'aigua (2026)");
  assert.equal(reservoirTitle(reservoirBySlug("siurana"), "es"), "Embalse de Siurana hoy: nivel y % de agua (2026)");
  assert.equal(reservoirTitle(reservoirBySlug("foix"), "ca"), "Embassament del Foix avui: nivell i % d'aigua (2026)");
  assert.equal(reservoirTitle(reservoirBySlug("la-baells"), "en"), "La Baells reservoir today: water level and % full (2026)");
});

test("metadata: canonical and hreflang between the three editions, x-default to English as elsewhere", () => {
  const page = reservoirMetadata(reservoirBySlug("susqueda"), "es");
  assert.equal(page.alternates?.canonical, absoluteUrl("/es/embalses/susqueda/"));
  assert.deepEqual(page.alternates?.languages, {
    ca: absoluteUrl("/ca/embassaments/susqueda/"),
    es: absoluteUrl("/es/embalses/susqueda/"),
    en: absoluteUrl("/en/reservoirs/susqueda/"),
    "x-default": absoluteUrl("/en/reservoirs/susqueda/"),
  });
  const hub = reservoirHubMetadata("ca");
  assert.equal(hub.alternates?.canonical, absoluteUrl("/ca/embassaments/"));
  assert.equal((hub.alternates?.languages as Record<string, string>)["x-default"], absoluteUrl("/en/reservoirs/"));
});

test("sitemap: 30 URLs, unique, dated with the snapshot's reading, every edition listed; nothing when indexing is off", () => {
  const entries = reservoirFamilyPaths();
  assert.equal(entries.length, 3 + 9 * 3);
  assert.equal(new Set(entries.map((e) => e.path)).size, entries.length);
  for (const entry of entries) {
    assert.match(entry.path, /^\/(ca\/embassaments|es\/embalses|en\/reservoirs)\/([a-z-]+\/)?$/);
    assert.equal(entry.lastModified, SNAPSHOT.latestDate);
    assert.ok(Object.values(entry.translations).includes(entry.path), `${entry.path} lists itself`);
  }
  assert.deepEqual(entries.find((e) => e.path === "/en/reservoirs/foix/")?.translations, {
    ca: "/ca/embassaments/foix/",
    es: "/es/embalses/foix/",
    en: "/en/reservoirs/foix/",
  });
  assert.deepEqual(reservoirSitemapEntries(), [], "nothing on a deployment that may not be indexed");
  const sitemap = readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8");
  assert.match(sitemap, /import \{ reservoirSitemapEntries \} from "@\/lib\/programmatic\/reservoirs\/pages";/);
  assert.match(sitemap, /\.\.\.reservoirSitemapEntries\(\)/);
});

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

test("each page carries its own data and the original guidance; drought text matches its unit", () => {
  for (const r of RESERVOIR_DATA) {
    for (const locale of LOCALES) {
      const f = facts(r, locale);
      assert.ok(f.some((x) => x.value.includes(String(OFFICIAL[r.slug].capacity).replace(".", locale === "en" ? "." : ","))), `${r.slug}/${locale} capacity`);
      assert.ok(trendParagraphs(r, locale).length >= 3, `${r.slug}/${locale} trend`);
      const drought = droughtParagraphs(r, locale);
      assert.ok(drought.before.length >= 1 && drought.after.length === 1);
      assert.match(drought.after[0]!, /declaracions-sequera/);
      assert.equal(faq(r, locale).length, 4);
      for (const item of faq(r, locale)) assert.doesNotMatch(item.answer, /\d+([.,]\d+)? ?%/, `${r.slug}/${locale}: no static percentage in the FAQ`);
      assert.ok(readParagraphs(locale).length === 3);
    }
  }
  assert.match(droughtParagraphs(reservoirBySlug("foix"), "ca").before.join(" "), /El Foix no és cap dels embassaments/);
  assert.match(droughtParagraphs(reservoirBySlug("siurana"), "es").before.join(" "), /Siurana y Riudecanyes/);
  assert.match(trendParagraphs(reservoirBySlug("sau"), "ca")[0]!, /el 28\/10\/2025, l'embassament de Sau era al \*\*55,9 %\*\*.*\*\*17,7 punts més\*\*/);
});

test("siblings: the same system first, then the rest of Ter-Llobregat, then the others; each reservoir once", () => {
  const sau = siblingsOf("sau");
  assert.deepEqual(sau.system.map((r) => r.slug), ["susqueda"]);
  assert.deepEqual(sau.network.map((r) => r.slug).sort(), ["la-baells", "la-llosa-del-cavall", "sant-ponc"]);
  assert.deepEqual(siblingsOf("siurana").system.map((r) => r.slug), ["riudecanyes"]);
  assert.deepEqual(siblingsOf("foix").system, []);
  for (const r of RESERVOIR_DATA) {
    const s = siblingsOf(r.slug);
    const all = [...s.system, ...s.network, ...s.others].map((x) => x.slug);
    assert.equal(all.length, 8, r.slug);
    assert.equal(new Set(all).size, 8);
    assert.ok(!all.includes(r.slug));
  }
});

test("links: internal links in their own language with a trailing slash, external ones official only; no template leaks", () => {
  for (const locale of LOCALES) {
    const values: unknown[] = [hubCopy(locale), relatedLinks(locale), sources(locale), readParagraphs(locale)];
    for (const r of RESERVOIR_DATA) values.push(facts(r, locale), trendParagraphs(r, locale), droughtParagraphs(r, locale), faq(r, locale), thresholdTables(r.slug, locale));
    const text = JSON.stringify(values);
    assert.doesNotMatch(text, /\$\{|undefined|NaN|\[object|aerobusbcn|embalses\.net/i, locale);
    for (const m of text.matchAll(/\]\((\/[^)]*)\)/g)) assert.ok(m[1]!.startsWith(`/${locale}/`) && m[1]!.endsWith("/"), m[1]);
    for (const m of text.matchAll(/"href":"([^"]+)"/g)) assert.ok(m[1]!.startsWith(`/${locale}/`) && m[1]!.endsWith("/"), m[1]);
    for (const m of text.matchAll(/\]\((https?:[^)]*)\)/g)) assert.match(m[1]!, /^https:\/\/(aca\.gencat\.cat|info\.aca\.gencat\.cat|analisi\.transparenciacatalunya\.cat)\//);
    for (const s of sources(locale)) assert.match(s.url, /^https:\/\/(aca\.gencat\.cat|info\.aca\.gencat\.cat|analisi\.transparenciacatalunya\.cat)\//);
  }
});

test("server output carries no clock; the reading block is a client component reading after mount", () => {
  const files = [
    "src/lib/programmatic/reservoirs/copy.ts",
    "src/lib/programmatic/reservoirs/data.ts",
    "src/lib/programmatic/reservoirs/pages.ts",
    "src/lib/programmatic/reservoirs/paths.ts",
    "src/lib/programmatic/reservoirs/official.ts",
    "src/components/programmatic/reservoirs/ReservoirPages.tsx",
    "src/app/(public)/[locale]/embassaments/page.tsx",
    "src/app/(public)/[locale]/embassaments/[embassament]/page.tsx",
    "src/app/(public)/[locale]/embalses/page.tsx",
    "src/app/(public)/[locale]/embalses/[embalse]/page.tsx",
    "src/app/(public)/[locale]/reservoirs/page.tsx",
    "src/app/(public)/[locale]/reservoirs/[reservoir]/page.tsx",
  ];
  for (const file of files) assert.doesNotMatch(readFileSync(join(ROOT, file), "utf8"), /new Date\(\)|Date\.now\(/, file);
  const client = readFileSync(join(ROOT, "src/components/programmatic/reservoirs/ReservoirLive.tsx"), "utf8");
  assert.match(client, /^"use client";/);
  assert.match(client, /useEffect\(/);
  assert.match(client, /new Date\(\)/, "the clock is the browser's");
  assert.doesNotMatch(client, /dangerouslySetInnerHTML/);
  assert.doesNotMatch(client, /^import (?!type )[^;]*from "@\/lib\/programmatic\/reservoirs\/(copy|data|pages|official|upstream|prepare)";/m, "no snapshot in the browser bundle");
  for (const file of ["live.ts", "labels.ts", "types.ts"]) {
    assert.doesNotMatch(readFileSync(join(ROOT, "src/lib/programmatic/reservoirs", file), "utf8"), /^import (?!type )[^;]*from "\.\/(snapshot\.json|data|copy|pages|official|upstream|prepare)";/m, file);
  }
});
