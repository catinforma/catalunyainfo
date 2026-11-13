import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { chartGeometry, niceStep } from "../src/lib/programmatic/pvpc/chart.ts";
import { dayAnswer, kwh, kwhUnit, missingTodayNote, notYetPublished, pvpcTitle, readLine } from "../src/lib/programmatic/pvpc/copy.ts";
import { pvpcDataset, pvpcFamilyPaths } from "../src/lib/programmatic/pvpc/pages.ts";
import { isCompleteDay, parseEsiosArchive, parseRedata, parseSpanishDecimal, withCym, type PvpcDay } from "../src/lib/programmatic/pvpc/parse.ts";
import { pvpcPath, pvpcTranslations, resolvePvpc } from "../src/lib/programmatic/pvpc/paths.ts";
import { hoursOf, isValleDay, periodOf, summarize } from "../src/lib/programmatic/pvpc/periods.ts";
import { SERVER_REVALIDATE_SECONDS, readSnapshot } from "../src/lib/programmatic/pvpc/server.ts";
import { addDays, currentHourIndex, hourLabels, hourStarts, hoursInDay, madridDate, madridMidnight } from "../src/lib/programmatic/pvpc/time.ts";
import { esiosUrl, loadPvpc, redataUrl, type FetchLike } from "../src/lib/programmatic/pvpc/upstream.ts";
import { buildView, mergeDays, pruneDays, publishedYesterdayAt, type PvpcSnapshot } from "../src/lib/programmatic/pvpc/view.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const fixture = (name: string): unknown => JSON.parse(readFileSync(join(ROOT, "tests/fixtures/pvpc", name), "utf8"));

/** REE's answer of 13 Nov 2026 ~15:36 for 12–14 Nov: 12 and 13 published, 14 not yet (spot only). */
const NOV = fixture("redata-2026-11-12_14.json");
const OCT25 = fixture("redata-2026-10-25.json");
const MAR29 = fixture("redata-2026-03-29.json");
const ESIOS_NOV13 = fixture("esios70-2026-11-13.json");
const ESIOS_OCT25 = fixture("esios70-2026-10-25.json");

/** 13 Nov 2026 16:00 in Madrid (CET). */
const NOV13_1600 = Date.parse("2026-11-13T16:00:00+01:00");

function series(json: unknown) {
  const s = parseRedata(json);
  assert.ok(s, "fixture parses");
  return s;
}

function dayOf(json: unknown, date: string): PvpcDay {
  const d = series(json).days.find((x) => x.date === date);
  assert.ok(d, `fixture has ${date}`);
  return d;
}

/* -------------------------------------------------------------------------- */
/* Time zone and DST                                                          */
/* -------------------------------------------------------------------------- */

test("a Madrid day has 24 hours, 23 on 29 Mar 2026 and 25 on 25 Oct 2026", () => {
  assert.equal(hoursInDay("2026-11-13"), 24);
  assert.equal(hoursInDay("2026-03-29"), 23);
  assert.equal(hoursInDay("2026-10-25"), 25);
  assert.equal(hoursInDay("2027-03-28"), 23);
  assert.equal(hoursInDay("2027-10-31"), 25);
  assert.equal(new Date(madridMidnight("2026-11-13")).toISOString(), "2026-11-12T23:00:00.000Z");
  assert.equal(new Date(madridMidnight("2026-07-01")).toISOString(), "2026-06-30T22:00:00.000Z");
  assert.equal(madridDate(Date.parse("2026-11-13T23:30:00Z")), "2026-11-14");
  assert.equal(madridDate(Date.parse("2026-11-13T22:59:00Z")), "2026-11-13");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
});

test("hour labels on the DST days: 25 Oct repeats 02:00–03:00 (summer, then winter); 29 Mar jumps from 01:00 to 03:00", () => {
  const oct = hourLabels(hourStarts("2026-10-25"));
  assert.equal(oct.length, 25);
  assert.deepEqual(oct.slice(1, 5).map((l) => [l.from, l.to, l.repeat ?? null]), [
    ["01:00", "02:00", null],
    ["02:00", "03:00", "summer"],
    ["02:00", "03:00", "winter"],
    ["03:00", "04:00", null],
  ]);
  assert.deepEqual(oct.at(-1), { from: "23:00", to: "00:00", hour: 23 });
  const mar = hourLabels(hourStarts("2026-03-29"));
  assert.equal(mar.length, 23);
  assert.deepEqual(mar.slice(0, 3).map((l) => [l.from, l.to]), [
    ["00:00", "01:00"],
    ["01:00", "03:00"],
    ["03:00", "04:00"],
  ]);
  assert.ok(mar.every((l) => !l.repeat));
  const nov = hourLabels(hourStarts("2026-11-13"));
  assert.deepEqual(nov.map((l) => l.hour), Array.from({ length: 24 }, (_, i) => i));
});

test("current hour: the hour containing the render instant, none outside the day", () => {
  const starts = hourStarts("2026-11-13");
  assert.equal(currentHourIndex(starts, NOV13_1600), 16);
  assert.equal(currentHourIndex(starts, Date.parse("2026-11-13T15:59:59+01:00")), 15);
  assert.equal(currentHourIndex(starts, Date.parse("2026-11-14T00:00:00+01:00")), -1);
  const oct = hourStarts("2026-10-25");
  // 02:30 winter time is the second 02:00 hour (index 3).
  assert.equal(currentHourIndex(oct, Date.parse("2026-10-25T02:30:00+01:00")), 3);
  assert.equal(currentHourIndex(oct, Date.parse("2026-10-25T02:30:00+02:00")), 2);
});

/* -------------------------------------------------------------------------- */
/* Parsers                                                                    */
/* -------------------------------------------------------------------------- */

test("REData sample: series 1001 gives complete days only, hourly, with REE's last-update", () => {
  const s = series(NOV);
  assert.deepEqual(s.days.map((d) => d.date), ["2026-11-12", "2026-11-13"], "14 Nov is not published yet: no PVPC, only spot");
  assert.equal(s.updated, "2026-11-12T20:46:45.000+01:00");
  const d13 = s.days[1]!;
  assert.equal(d13.hours.length, 24);
  assert.equal(d13.hours[0]!.start, "2026-11-13T00:00:00.000+01:00");
  assert.equal(d13.hours[0]!.price, 159.11);
  assert.equal(d13.hours[18]!.price, 404.56);
  assert.ok(s.days.every(isCompleteDay));
});

test("REData on the DST days: 25 hourly prices on 25 Oct, 23 on 29 Mar, each on its own instant", () => {
  const oct = dayOf(OCT25, "2026-10-25");
  assert.equal(oct.hours.length, 25);
  assert.equal(oct.hours[2]!.start, "2026-10-25T02:00:00.000+02:00");
  assert.equal(oct.hours[3]!.start, "2026-10-25T02:00:00.000+01:00");
  const mar = dayOf(MAR29, "2026-03-29");
  assert.equal(mar.hours.length, 23);
  assert.equal(mar.hours[1]!.start, "2026-03-29T01:00:00.000+01:00");
  assert.equal(mar.hours[2]!.start, "2026-03-29T03:00:00.000+02:00");
});

test("REData parser rejects broken answers and incomplete or placeholder days", () => {
  assert.equal(parseRedata(null), null);
  assert.equal(parseRedata({ errors: [{ status: "400" }] }), null);
  assert.deepEqual(parseRedata({ data: { id: "mer13" }, included: [{ id: "600", attributes: { values: [] } }] }), { updated: null, days: [] });
  const clone = () => JSON.parse(JSON.stringify(NOV)) as { included: { id: string; attributes: { values: { value: unknown; datetime: string }[] } }[] };
  const pvpc = (j: ReturnType<typeof clone>) => j.included.find((x) => x.id === "1001")!.attributes.values;

  const missing = clone();
  pvpc(missing).splice(30, 1); // one hour of 13 Nov gone
  assert.deepEqual(series(missing).days.map((d) => d.date), ["2026-11-12"]);

  const zeros = clone();
  for (const v of pvpc(zeros)) if (v.datetime.startsWith("2026-11-13")) v.value = 0;
  assert.deepEqual(series(zeros).days.map((d) => d.date), ["2026-11-12"], "a day of zeros is a placeholder");

  const nan = clone();
  pvpc(nan)[40]!.value = "n/d";
  assert.deepEqual(series(nan).days.map((d) => d.date), ["2026-11-12"]);

  const absurd = clone();
  pvpc(absurd)[40]!.value = 99_999;
  assert.deepEqual(series(absurd).days.map((d) => d.date), ["2026-11-12"]);
});

test("e·sios archive: PCB matches REData hour by hour; CYM differs exactly where Ceuta/Melilla periods shift", () => {
  assert.equal(parseSpanishDecimal("159,11"), 159.11);
  assert.equal(parseSpanishDecimal("1.234,50"), 1234.5);
  assert.equal(parseSpanishDecimal("abc"), undefined);
  const e = parseEsiosArchive(ESIOS_NOV13, "2026-11-13");
  assert.ok(e);
  assert.equal(e.pcb.length, 24);
  const d13 = dayOf(NOV, "2026-11-13");
  d13.hours.forEach((h, i) => assert.ok(Math.abs(h.price - e.pcb[i]!) < 0.006, `hour ${i}`));
  const differs = e.pcb.map((p, i) => (p !== e.cym[i] ? i : -1)).filter((i) => i >= 0);
  assert.deepEqual(differs, [10, 14, 18, 22]);
  for (let hour = 0; hour < 24; hour++) {
    const shifted = periodOf("2026-11-13", hour, "pcb") !== periodOf("2026-11-13", hour, "cym");
    assert.equal(shifted, differs.includes(hour), `hour ${hour}`);
  }
  const merged = withCym(d13, e);
  assert.equal(merged.hours[10]!.cym, 156.57);
  assert.ok(isCompleteDay(merged));
  assert.equal(parseEsiosArchive(ESIOS_NOV13, "2026-11-14"), null, "wrong date");
  // A file that disagrees with REData is not used.
  const bad = { ...e, pcb: e.pcb.map((p, i) => (i === 5 ? p + 1 : p)) };
  assert.equal(withCym(d13, bad).hours[0]!.cym, undefined);
});

test("e·sios archive on the 25-hour day: 25 rows, matched to REData by position", () => {
  const e = parseEsiosArchive(ESIOS_OCT25, "2026-10-25");
  assert.ok(e);
  assert.equal(e.pcb.length, 25);
  const merged = withCym(dayOf(OCT25, "2026-10-25"), e);
  assert.ok(merged.hours.every((h) => h.cym !== undefined));
});

/* -------------------------------------------------------------------------- */
/* Periods and the day's figures                                              */
/* -------------------------------------------------------------------------- */

test("2.0TD periods (Circular 3/2020 art. 7.3): weekday schedule, Ceuta/Melilla one hour later", () => {
  const fri = Array.from({ length: 24 }, (_, h) => periodOf("2026-11-13", h)[0]).join("");
  assert.equal(fri, "vvvvvvvvllppppllllppppll");
  const cym = Array.from({ length: 24 }, (_, h) => periodOf("2026-11-13", h, "cym")[0]).join("");
  assert.equal(cym, "vvvvvvvvlllppppllllpppp" + "l");
});

test("valle all day on weekends, 6 January and fixed national holidays; not on Good Friday or regional days", () => {
  assert.ok(isValleDay("2026-11-14")); // Saturday
  assert.ok(isValleDay("2026-10-25")); // Sunday
  assert.ok(isValleDay("2026-12-08")); // Tuesday, Inmaculada
  assert.ok(isValleDay("2026-12-25"));
  assert.ok(isValleDay("2027-01-06")); // Wednesday, named in the Circular
  assert.ok(isValleDay("2027-10-12"));
  assert.ok(!isValleDay("2027-03-26"), "Good Friday 2027 has no fixed date");
  assert.ok(!isValleDay("2027-03-19"), "San José is substitutable");
  assert.ok(!isValleDay("2026-09-11"), "Diada is regional");
  assert.equal(periodOf("2026-12-08", 19), "valle");
  assert.equal(periodOf("2027-03-26", 19), "punta");
});

test("summary of 13 Nov 2026: cheapest, dearest, average and top 3 from REE's own figures", () => {
  const day = dayOf(NOV, "2026-11-13");
  const s = summarize(day);
  assert.ok(s);
  const prices = day.hours.map((h) => h.price);
  assert.equal(s.cheapest.price, Math.min(...prices));
  assert.equal(s.cheapest.label.from, "14:00");
  assert.equal(s.dearest.price, Math.max(...prices));
  assert.equal(s.dearest.label.from, "18:00");
  assert.equal(s.average, prices.reduce((a, b) => a + b, 0) / 24);
  assert.deepEqual(s.cheapest3.map((h) => h.label.from), ["14:00", "03:00", "04:00"]);
  assert.deepEqual(s.dearest3.map((h) => h.label.from), ["18:00", "19:00", "20:00"]);
  assert.equal(s.hours.length, 24);
  assert.equal(summarize(day, "cym"), null, "no Ceuta/Melilla column on this REData-only day");
});

test("summary ties go to the earlier hour; the 25-hour day averages over 25", () => {
  const starts = hourStarts("2026-11-16");
  const flat: PvpcDay = { date: "2026-11-16", hours: starts.map((t) => ({ start: new Date(t).toISOString(), price: 100 })) };
  const s = summarize(flat)!;
  assert.equal(s.cheapest.index, 0);
  assert.equal(s.dearest.index, 0);
  assert.deepEqual(s.cheapest3.map((h) => h.index), [0, 1, 2]);
  const oct = summarize(dayOf(OCT25, "2026-10-25"))!;
  const p = dayOf(OCT25, "2026-10-25").hours.map((h) => h.price);
  assert.equal(oct.average, p.reduce((a, b) => a + b, 0) / 25);
  assert.deepEqual(Object.keys(oct.periodAverage), ["valle"], "Sunday: all valle");
  assert.equal(hoursOf(dayOf(OCT25, "2026-10-25"))[3]!.label.repeat, "winter");
});

/* -------------------------------------------------------------------------- */
/* Fallback                                                                   */
/* -------------------------------------------------------------------------- */

const LIVE: PvpcSnapshot = { fetchedAt: "2026-11-13T14:36:00.000Z", updated: "2026-11-12T20:46:45.000+01:00", days: series(NOV).days };

test("view: live answer gives today and yesterday; tomorrow stays empty before publication", () => {
  const v = buildView(LIVE, null, NOV13_1600);
  assert.equal(v.source, "live");
  assert.equal(v.todayDate, "2026-11-13");
  assert.equal(v.today?.date, "2026-11-13");
  assert.equal(v.yesterday?.date, "2026-11-12");
  assert.equal(v.tomorrow, null);
  assert.equal(v.latest, null);
  assert.equal(v.fetchedAt, LIVE.fetchedAt);
  assert.equal(publishedYesterdayAt(v), "20:46");
});

test("view: REE down but today's prices kept → shown as today's with the time they were read", () => {
  const kept: PvpcSnapshot = { ...LIVE, fetchedAt: "2026-11-13T09:00:00.000Z" };
  const v = buildView(null, kept, NOV13_1600);
  assert.equal(v.source, "snapshot");
  assert.equal(v.today?.date, "2026-11-13");
  assert.equal(v.fetchedAt, "2026-11-13T09:00:00.000Z");
  // REE answered but without today (broken window): the kept day still wins over nothing.
  const v2 = buildView({ ...LIVE, days: [] }, kept, NOV13_1600);
  assert.equal(v2.source, "snapshot");
});

test("view: only an older day kept → never shown as today; printed as the latest day with its date", () => {
  const kept: PvpcSnapshot = { ...LIVE, days: LIVE.days.filter((d) => d.date === "2026-11-12") };
  const v = buildView(null, kept, NOV13_1600);
  assert.equal(v.source, "stale");
  assert.equal(v.today, null);
  assert.equal(v.latest?.date, "2026-11-12");
  const none = buildView(null, null, NOV13_1600);
  assert.equal(none.source, "none");
  assert.equal(none.today, null);
  assert.equal(none.latest, null);
  assert.equal(none.fetchedAt, null);
});

test("view: after midnight yesterday's 'tomorrow' becomes today", () => {
  const nov14 = dayOf(NOV, "2026-11-13"); // stand-in for a published tomorrow, shifted below
  const starts = hourStarts("2026-11-14");
  const d14: PvpcDay = { date: "2026-11-14", hours: starts.map((t, i) => ({ start: new Date(t).toISOString(), price: nov14.hours[i]!.price })) };
  const live: PvpcSnapshot = { ...LIVE, days: [...LIVE.days, d14] };
  const evening = buildView(live, null, Date.parse("2026-11-13T21:00:00+01:00"));
  assert.equal(evening.tomorrow?.date, "2026-11-14");
  const night = buildView(live, null, Date.parse("2026-11-14T00:10:00+01:00"));
  assert.equal(night.today?.date, "2026-11-14");
  assert.equal(night.tomorrow, null);
  assert.equal(night.yesterday?.date, "2026-11-13");
});

test("kept snapshot: re-validated on read, pruned to yesterday on, Ceuta/Melilla column kept when merging", () => {
  assert.equal(readSnapshot(null), null);
  assert.equal(readSnapshot({ fetchedAt: "x", days: [] }), null);
  const broken = { fetchedAt: LIVE.fetchedAt, updated: null, days: [{ date: "2026-11-13", hours: [{ start: "2026-11-13T00:00:00+01:00", price: 1 }] }, LIVE.days[0]] };
  assert.deepEqual(readSnapshot(broken)?.days.map((d) => d.date), ["2026-11-12"]);
  assert.deepEqual(pruneDays(LIVE.days, Date.parse("2026-11-14T10:00:00+01:00")).map((d) => d.date), ["2026-11-13"]);
  const withC = withCym(LIVE.days[1]!, parseEsiosArchive(ESIOS_NOV13, "2026-11-13"));
  const merged = mergeDays(LIVE.days, [withC]);
  assert.equal(merged[1]!.hours[10]!.cym, 156.57);
});

/* -------------------------------------------------------------------------- */
/* Upstream with a fake fetch                                                 */
/* -------------------------------------------------------------------------- */

function fakeFetch(routes: Record<string, unknown | Error | number>): FetchLike {
  return async (url) => {
    const hit = Object.entries(routes).find(([prefix]) => url.startsWith(prefix));
    if (!hit) return new Response("{}", { status: 404 });
    const value = hit[1];
    if (value instanceof Error) throw value;
    if (typeof value === "number") return new Response("", { status: value });
    return new Response(JSON.stringify(value), { status: 200, headers: { date: "Fri, 13 Nov 2026 14:36:00 GMT" } });
  };
}

test("loadPvpc: one REData request for yesterday–tomorrow, e·sios for the Ceuta/Melilla column, REE's Date header as read time", async () => {
  assert.equal(redataUrl("2026-11-13"), "https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real?start_date=2026-11-12T00%3A00&end_date=2026-11-14T23%3A59&time_trunc=hour");
  const out = await loadPvpc(fakeFetch({ [redataUrl("2026-11-13")]: NOV, [esiosUrl("2026-11-13")]: ESIOS_NOV13 }), "2026-11-13", NOV13_1600);
  assert.ok(out);
  assert.equal(out.fetchedAt, "2026-11-13T14:36:00.000Z");
  assert.equal(out.days.length, 2);
  assert.equal(out.days[1]!.hours[10]!.cym, 156.57);
  assert.equal(out.days[0]!.hours[0]!.cym, undefined, "yesterday: no e·sios read");
});

test("loadPvpc: REData down, timing out or garbled → null (never throws); e·sios down → prices without the CYM column", async () => {
  assert.equal(await loadPvpc(fakeFetch({ "https://apidatos": 503 }), "2026-11-13", NOV13_1600), null);
  assert.equal(await loadPvpc(fakeFetch({ "https://apidatos": new Error("TimeoutError") }), "2026-11-13", NOV13_1600), null);
  assert.equal(await loadPvpc(fakeFetch({ "https://apidatos": { nope: true } }), "2026-11-13", NOV13_1600), null);
  const noEsios = await loadPvpc(fakeFetch({ "https://apidatos": NOV, "https://api.esios": new Error("down") }), "2026-11-13", NOV13_1600);
  assert.equal(noEsios?.days.length, 2);
  assert.ok(noEsios?.days.every((d) => d.hours.every((h) => h.cym === undefined)));
});

test("server: one memoised read; when REE then fails, the last good prices (memory, then the kept file after a restart) are served with their read time", async () => {
  const { mkdtempSync, rmSync, existsSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(join(tmpdir(), "pvpc-test-"));
  const file = join(dir, "last-good.json");
  const realFetch = globalThis.fetch;
  const previous = process.env.PVPC_SNAPSHOT_FILE;
  process.env.PVPC_SNAPSHOT_FILE = file;
  let calls = 0;
  try {
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      calls++;
      return fakeFetch({ "https://apidatos": NOV, "https://api.esios": ESIOS_NOV13 })(String(input), init);
    }) as typeof fetch;
    type ServerModule = typeof import("../src/lib/programmatic/pvpc/server.ts");
    const serverUrl = new URL("../src/lib/programmatic/pvpc/server.ts", import.meta.url).href;
    // A query string gives a fresh module instance: a new process, as after a deploy.
    const first = (await import(`${serverUrl}?run=1`)) as ServerModule;
    const a = await first.loadServerPvpc(NOV13_1600);
    const b = await first.loadServerPvpc(NOV13_1600 + 60_000);
    assert.equal(a.source, "live");
    assert.equal(b.source, "live");
    assert.equal(calls, 2, "REData once + e·sios for today only (yesterday needs none, tomorrow is not out): the second render reuses the memo");
    assert.ok(existsSync(file), "last good answer kept on disk");

    globalThis.fetch = (async () => {
      throw new Error("down");
    }) as typeof fetch;
    const later = await first.loadServerPvpc(NOV13_1600 + 10 * 60_000);
    assert.equal(later.source, "snapshot");
    assert.equal(later.today?.hours[18]!.price, 404.56);

    // A reader-facing call (the today API) while a new REE read hangs: the held prices at once.
    globalThis.fetch = (() => new Promise(() => {})) as typeof fetch;
    const quick = await first.loadServerPvpc(NOV13_1600 + 12 * 60_000, { allowStale: true });
    assert.equal(quick.source, "snapshot");
    assert.equal(quick.today?.date, "2026-11-13");
    globalThis.fetch = (async () => {
      throw new Error("down");
    }) as typeof fetch;

    // A fresh process (deploy, restart) with REE down: the kept file.
    const restarted = (await import(`${serverUrl}?run=2`)) as ServerModule;
    const v = await restarted.loadServerPvpc(NOV13_1600 + 20 * 60_000);
    assert.equal(v.source, "snapshot");
    assert.equal(v.fetchedAt, "2026-11-13T14:36:00.000Z");
    // The next day, still down: yesterday's prices are never shown as today's.
    const nextDay = await restarted.loadServerPvpc(Date.parse("2026-11-14T10:00:00+01:00"));
    assert.equal(nextDay.source, "stale");
    assert.equal(nextDay.today, null);
    assert.equal(nextDay.latest?.date, "2026-11-13");
  } finally {
    globalThis.fetch = realFetch;
    if (previous === undefined) delete process.env.PVPC_SNAPSHOT_FILE;
    else process.env.PVPC_SNAPSHOT_FILE = previous;
    rmSync(dir, { recursive: true, force: true });
  }
});

/* -------------------------------------------------------------------------- */
/* Words, chart, pages                                                        */
/* -------------------------------------------------------------------------- */

test("prices are REE's €/MWh printed as €/kWh with four decimals; nothing printed without a price", () => {
  assert.equal(kwh(159.11, "es"), "0,1591");
  assert.equal(kwh(404.56, "en"), "0.4046");
  assert.equal(kwhUnit(130.51, "es"), "0,1305 €/kWh");
  assert.equal(kwhUnit(130.51, "en"), "€0.1305/kWh");
  const s = summarize(dayOf(NOV, "2026-11-13"))!;
  const answer = dayAnswer(s, "es", "today");
  assert.match(answer, /^Hoy, viernes, 13 de noviembre de 2026, la luz con PVPC es \*\*más barata de 14:00 a 15:00 \(0,1305 €\/kWh\)\*\*/);
  for (const locale of ["es", "ca", "en"] as const) {
    const none = missingTodayNote(null, locale) + notYetPublished("2026-11-14", null, locale);
    assert.doesNotMatch(none, /\d[.,]\d{4}/, `${locale}: no price without REE's answer`);
    assert.doesNotMatch(none, /0[.,]0000/);
    assert.match(notYetPublished("2026-11-14", "20:46", locale), /20:15/);
  }
  assert.equal(readLine("2026-11-13T14:36:00.000Z", "2026-11-12T20:46:45.000+01:00", "es"), "Precios de Red Eléctrica (REData), leídos el 13/11/2026 a las 15:36 · actualizados por REE el 12/11/2026 a las 20:46.");
  assert.equal(pvpcTitle("es", "today", "2026-11-13"), "Precio de la luz hoy 13 de noviembre: horas más baratas (PVPC)");
  assert.equal(pvpcTitle("es", "today", null), "Precio de la luz hoy y mañana por horas (PVPC)");
});

test("chart: one bar per hour from the zero line, tallest for the dearest hour, gridlines from 0", () => {
  assert.equal(niceStep(0.4046), 0.1);
  assert.equal(niceStep(0.31), 0.1);
  const s = summarize(dayOf(NOV, "2026-11-13"))!;
  const g = chartGeometry(s.hours);
  assert.equal(g.bars.length, 24);
  const tallest = g.bars.reduce((a, b) => (b.h > a.h ? b : a));
  assert.equal(tallest.index, s.dearest.index);
  assert.ok(g.bars.every((b) => b.h > 0 && Math.abs(b.y + b.h - g.zero) < 0.02));
  assert.equal(g.ticks[0]!.value, 0);
  assert.equal(chartGeometry(summarize(dayOf(OCT25, "2026-10-25"))!.hours).bars.length, 25);
});

test("paths: es /precio-luz/(manana/), ca /preu-llum/(dema/), en /electricity-price-spain/(tomorrow/); each route serves only its locale", () => {
  assert.deepEqual(pvpcTranslations("today"), { ca: "/ca/preu-llum/", es: "/es/precio-luz/", en: "/en/electricity-price-spain/" });
  assert.deepEqual(pvpcTranslations("tomorrow"), { ca: "/ca/preu-llum/dema/", es: "/es/precio-luz/manana/", en: "/en/electricity-price-spain/tomorrow/" });
  assert.equal(pvpcFamilyPaths().length, 6);
  assert.equal(resolvePvpc("es", "es"), "es");
  assert.equal(resolvePvpc("es", "ca"), null);
});

test("Dataset only with REE's day: creator REE, temporalCoverage the day, dateModified REE's last update", () => {
  const live = buildView(LIVE, null, NOV13_1600);
  const ds = pvpcDataset("es", "today", live) as Record<string, unknown> | null;
  assert.ok(ds);
  assert.equal(ds["@type"], "Dataset");
  assert.equal(ds.temporalCoverage, "2026-11-13");
  assert.equal(ds.dateModified, "2026-11-12T20:46:45.000+01:00");
  assert.deepEqual(ds.creator, { "@type": "Organization", name: "Red Eléctrica" });
  assert.equal(pvpcDataset("es", "tomorrow", live), null, "tomorrow not published: no Dataset");
  assert.equal(pvpcDataset("es", "today", buildView(null, null, NOV13_1600)), null);
});

test("routes: revalidate literal equals SERVER_REVALIDATE_SECONDS, one locale each, data read only through server.ts", () => {
  assert.equal(SERVER_REVALIDATE_SECONDS, 900);
  const routes: [string, string][] = [
    ["precio-luz", "es"],
    ["precio-luz/manana", "es"],
    ["preu-llum", "ca"],
    ["preu-llum/dema", "ca"],
    ["electricity-price-spain", "en"],
    ["electricity-price-spain/tomorrow", "en"],
  ];
  for (const [folder, locale] of routes) {
    const file = join(ROOT, "src/app/(public)/[locale]", folder, "page.tsx");
    const source = readFileSync(file, "utf8");
    assert.match(source, new RegExp(`export const revalidate = ${SERVER_REVALIDATE_SECONDS};`), file);
    assert.match(source, /export const dynamicParams = true;/, file);
    assert.match(source, new RegExp(`const ROUTE = "${locale}";`), file);
    assert.match(source, /notFound\(\)/, file);
    assert.doesNotMatch(source, /new Date\(|fetch\(/, file);
    assert.equal(pvpcPath(locale as "es", folder.includes("/") ? "tomorrow" : "today"), `/${locale}/${folder}/`);
  }
  const routesFile = readFileSync(join(ROOT, "src/components/programmatic/pvpc/routes.tsx"), "utf8");
  assert.match(routesFile, /loadServerPvpc\(\)/);
  const component = readFileSync(join(ROOT, "src/components/programmatic/pvpc/PvpcPage.tsx"), "utf8");
  assert.doesNotMatch(component, /Date\.now\(|new Date\(|fetch\(/, "no clock or fetch in the page: the hour comes from view.renderedAt");
});

test("today page brief: today's REE prices only; the browser picks the current hour and refuses another day's prices", async () => {
  const { PVPC_TODAY_ENDPOINT, briefAt, briefPayload, parseBriefPayload } = await import("../src/lib/programmatic/pvpc/brief.ts");
  const live = buildView(LIVE, null, NOV13_1600);
  const payload = briefPayload(live);
  assert.ok(payload);
  assert.equal(payload.date, "2026-11-13");
  assert.equal(payload.hours.length, 24);
  assert.equal(payload.tomorrow, false);
  const parsed = parseBriefPayload(JSON.parse(JSON.stringify(payload)));
  assert.deepEqual(parsed, payload);
  const at = briefAt(parsed!, NOV13_1600 + 20 * 60_000);
  assert.equal(at?.current?.label.from, "16:00");
  assert.equal(at?.current?.price, 228.65);
  assert.equal(at?.summary.cheapest.label.from, "14:00");
  assert.equal(briefAt(parsed!, Date.parse("2026-11-14T00:05:00+01:00")), null, "after midnight yesterday's prices are not today's");
  assert.equal(briefPayload(buildView(null, null, NOV13_1600)), null);
  assert.equal(parseBriefPayload({ date: "2026-11-13", hours: [{ start: "x", price: 1 }], fetchedAt: "x" }), null);
  assert.equal(parseBriefPayload({ error: "upstream" }), null);

  const route = readFileSync(join(ROOT, "src/app/api/pvpc/today/route.ts"), "utf8");
  assert.ok(route.includes("loadServerPvpc(Date.now(), { allowStale: true })"), "the endpoint reads REE through the pages' memoised loader and never waits on REE while prices are held");
  assert.match(route, /export const dynamic = "force-dynamic";/);
  assert.doesNotMatch(route, /export const revalidate/);
  assert.equal(PVPC_TODAY_ENDPOINT, "/api/pvpc/today/");
  const todayPage = readFileSync(join(ROOT, "src/components/programmatic/today/TodayPage.tsx"), "utf8");
  assert.match(todayPage, /<ElectricityToday locale=\{locale\}>/);
});
