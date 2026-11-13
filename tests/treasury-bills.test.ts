import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATORS_ROOT } from "../src/lib/programmatic/calculators/paths.ts";
import { CALENDAR_2026, CALENDAR_2027, CALENDAR_2027_DUE, allRows, lastScheduledOf, nextAuctionOf, upcoming } from "../src/lib/programmatic/treasury-bills/calendar.ts";
import { LETRAS_LOCALES, LETRAS_SLUG, letrasEditions, weekdayDay } from "../src/lib/programmatic/treasury-bills/copy.ts";
import { LETRAS_SNAPSHOT } from "../src/lib/programmatic/treasury-bills/data.ts";
import { bdeFee, computeBill, parseEuros, parseRate, savingsTax, taeFromRate } from "../src/lib/programmatic/treasury-bills/engine.ts";
import { freshnessText, leadText, letrasMeta, letrasSitemapEntries } from "../src/lib/programmatic/treasury-bills/page.ts";
import {
  LATEST_RESULTS_URL,
  TERMS,
  latestByTerm,
  mergeResults,
  parsePastList,
  parseResultsPage,
  priceForRate,
  resultDays,
  resultProblem,
  type AuctionResult,
} from "../src/lib/programmatic/treasury-bills/results.ts";
import { RULES_AS_OF, RULES_REREAD_BY } from "../src/lib/programmatic/treasury-bills/rules.ts";
import { SERVER_REVALIDATE_SECONDS, TESORO_HOME, findCalendar2027, loadLetrasData, type Fetcher } from "../src/lib/programmatic/treasury-bills/server.ts";

/**
 * "Letras del Tesoro" (lib/programmatic/treasury-bills/): the calendar typed
 * from the Tesoro's PDF, the results parser on the Tesoro's own HTML, the
 * committed snapshot, the calculator, the loader's fallback, the page words,
 * the routes, and the date guards that fail when a result or the 2027
 * calendar is overdue.
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const FIX = join(ROOT, "tests", "fixtures");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const fixture = (name: string) => readFileSync(join(FIX, name), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/* -------------------------------------------------------------------------- */
/* Calendar                                                                   */
/* -------------------------------------------------------------------------- */

test("calendar: every Letras row matches the Tesoro's 2026 PDF (pdftotext fixture), January 2027 included", () => {
  const lines = fixture("tesoro-calendario-2026-letras.txt").split("\n");
  const dates = (prefix: RegExp) => lines.filter((l) => prefix.test(l)).map((l) => l.match(/\d{2}\/\d{2}\/\d{4}/g)!.slice(0, 2));
  const iso = (s: string) => s.split("/").reverse().join("-");
  const req = dates(/^Peticiones/);
  const auc = dates(/^Subastas\s+\d/);
  const pay = dates(/^Pago particulares/);
  const iss = dates(/^Emisión/);
  assert.equal(req.length, 13);
  const expected = req.flatMap((_, m) =>
    [0, 1].map((col) => ({ terms: col === 0 ? [6, 12] : [3, 9], requestsBy: iso(req[m]![col]!), auction: iso(auc[m]![col]!), payBy: iso(pay[m]![col]!), issue: iso(iss[m]![col]!) })),
  );
  assert.deepEqual(
    CALENDAR_2026.rows.map((r) => ({ ...r, terms: [...r.terms] })),
    expected,
  );
});

test("calendar: dates in order, auctions on Tuesdays (Wednesday 9 Dec 2026 after the 8 Dec holiday), requests before the auction", () => {
  for (const r of allRows()) {
    assert.ok(r.requestsBy < r.auction && r.auction < r.payBy && r.payBy < r.issue, r.auction);
    const wd = new Date(`${r.auction}T12:00:00Z`).getUTCDay();
    assert.ok(wd === 2 || (r.auction === "2026-12-09" && wd === 3), `${r.auction} weekday ${wd}`);
  }
  assert.equal(nextAuctionOf(12, "2026-11-13")?.auction, "2026-12-01");
  assert.equal(nextAuctionOf(3, "2026-11-13")?.requestsBy, "2026-12-04");
  assert.equal(nextAuctionOf(3, "2027-01-20"), null);
  assert.equal(upcoming("2026-12-01")[0]?.auction, "2026-12-01");
});

test("date guard: the 2027 calendar is typed in from the Tesoro's PDF by CALENDAR_2027_DUE", () => {
  if (CALENDAR_2027 === null) {
    assert.ok(today() < CALENDAR_2027_DUE, `From ${CALENDAR_2027_DUE}: read the Tesoro's 2027 auction calendar (tesoro.es home / deuda-publica/subastas/calendario), fill CALENDAR_2027 in treasury-bills/calendar.ts, add its pdftotext rows as a fixture`);
  } else {
    assert.ok(CALENDAR_2027.rows.length >= 24 && CALENDAR_2027.rows.every((r) => r.auction >= "2027-01-01"));
    assert.ok(CALENDAR_2027.pdf.startsWith("https://www.tesoro.es/"));
  }
});

/* -------------------------------------------------------------------------- */
/* Results parser                                                             */
/* -------------------------------------------------------------------------- */

test("parser: the 'últimas subastas' table gives the four terms with the Tesoro's figures", () => {
  const { results, refused } = parseResultsPage(fixture("tesoro-letras-ultimas-20261113.html"), LATEST_RESULTS_URL);
  assert.deepEqual(refused, []);
  assert.deepEqual(
    results.map((r) => [r.term, r.auction, r.settlement, r.maturity, r.avgRate, r.marginalRate, r.avgPrice, r.minPrice, r.previousMarginalRate]),
    [
      [3, "2026-11-10", "2026-11-13", "2027-02-05", 2.652, 2.665, 99.385, 99.382, 2.645],
      [6, "2026-11-03", "2026-11-06", "2027-05-07", 2.822, 2.845, 98.594, 98.582, 2.798],
      [9, "2026-11-10", "2026-11-13", "2027-08-06", 2.936, 2.946, 97.877, 97.87, 2.968],
      [12, "2026-11-03", "2026-11-06", "2027-11-05", 3.045, 3.068, 97.014, 96.992, 3.026],
    ],
  );
  const twelve = results.find((r) => r.term === 12)!;
  assert.equal(twelve.requested, 6845.63);
  assert.equal(twelve.allotted, 4044.79);
  assert.equal(twelve.allottedSecondRound, 762.67);
  assert.equal(resultDays(twelve), 364);
});

test("parser: a past auction's detail page (one-column table) parses the same way", () => {
  const { results, refused } = parseResultsPage(fixture("tesoro-letras-detalle-275543.html"), "detail");
  assert.deepEqual(refused, []);
  assert.equal(results.length, 1);
  assert.deepEqual([results[0]!.term, results[0]!.auction, results[0]!.avgRate, resultDays(results[0]!)], [3, "2026-11-10", 2.652, 84]);
});

test("parser: a column whose price does not match its rate, or a page without the table, gives nothing", () => {
  const html = fixture("tesoro-letras-ultimas-20261113.html").replace("97,014", "97,114");
  const { results, refused } = parseResultsPage(html, "x");
  assert.deepEqual(
    results.map((r) => r.term),
    [3, 6, 9],
  );
  assert.equal(refused.length, 1);
  assert.match(refused[0]!, /^12 months/);
  assert.deepEqual(parseResultsPage("<html><p>Mantenimiento</p></html>", "x").results, []);
});

test("parser: the past-results list gives each Letras auction's entry id, term and date", () => {
  const list = parsePastList(fixture("tesoro-subastas-anteriores-letras-p1.html"));
  assert.equal(list.length, 20);
  assert.deepEqual(list[0], { entryId: "275543", term: 3, auction: "2026-11-10" });
  assert.ok(list.every((e) => TERMS.includes(e.term)));
});

test("formula: the Orden ECM/2/2026 art. 14 price for the published average rates matches the published prices", () => {
  for (const r of LETRAS_SNAPSHOT.results) assert.ok(Math.abs(priceForRate(r.avgRate, resultDays(r)) - r.avgPrice) <= 0.003, `${r.auction} ${r.term}`);
});

/* -------------------------------------------------------------------------- */
/* Snapshot and its date guard                                                */
/* -------------------------------------------------------------------------- */

test("snapshot: every 2026 result holds together, is a calendar auction of its term, once, from a tesoro.es page", () => {
  const rows = allRows();
  const seen = new Set<string>();
  assert.ok(LETRAS_SNAPSHOT.results.length >= 44);
  assert.ok(LETRAS_SNAPSHOT.asOf <= today());
  for (const r of LETRAS_SNAPSHOT.results) {
    assert.equal(resultProblem(r), null, `${r.auction} ${r.term}`);
    const row = rows.find((c) => c.auction === r.auction);
    assert.ok(row && row.terms.includes(r.term), `${r.auction} ${r.term}: not a scheduled Letras auction of that term`);
    assert.equal(r.settlement, row!.issue, `${r.auction} ${r.term}: settlement is not the calendar's issue day`);
    assert.ok(r.source.startsWith("https://www.tesoro.es/deuda-publica/subastas/"), r.source);
    const k = `${r.auction}|${r.term}`;
    assert.ok(!seen.has(k), k);
    seen.add(k);
  }
});

test("date guard: each auction's result is in the snapshot within 3 days (npm run letras:snapshot -- build)", () => {
  const cutoff = addDays(today(), -3);
  const mine = latestByTerm(LETRAS_SNAPSHOT.results);
  for (const term of TERMS) {
    const due = lastScheduledOf(term, cutoff);
    if (!due) continue;
    assert.ok(mine[term] && mine[term]!.auction >= due.auction, `${term}-month bills: the ${due.auction} auction result is not in treasury-bills/snapshot.json; run npm run letras:snapshot -- build and commit`);
  }
});

test("date guard: the tax and procedure rules are re-read by RULES_REREAD_BY", () => {
  assert.ok(RULES_AS_OF <= today());
  assert.ok(today() < RULES_REREAD_BY, `From ${RULES_REREAD_BY}: re-read the savings scale (LIRPF arts. 66 and 76), RIRPF art. 75.3.b, the BdE fee in the latest auction notice and the new year's Orden de creación de Deuda; move RULES_AS_OF`);
});

/* -------------------------------------------------------------------------- */
/* Calculator                                                                 */
/* -------------------------------------------------------------------------- */

test("calculator: 10,000 € at the 12-month average 3,045 % over 364 days", () => {
  const r = computeBill({ nominal: 10_000, ratePct: 3.045, days: 364 });
  assert.equal(r.status, "ok");
  if (r.status !== "ok") return;
  assert.equal(r.bills, 10);
  assert.ok(Math.abs(r.pricePct - 97.0131) < 0.0005, String(r.pricePct));
  assert.equal(r.paid, 9701.31);
  assert.equal(r.gross, 298.69);
  assert.ok(Math.abs(r.taePct - 3.0866) < 0.001, String(r.taePct));
  assert.equal(r.tax, 56.75);
  assert.equal(r.net, 241.94);
  assert.equal(r.bdeFee, 15);
});

test("calculator: savings scale, Banco de España fee bounds, invalid input", () => {
  assert.equal(savingsTax(6000), 1140);
  assert.equal(savingsTax(7000), 1350);
  assert.equal(savingsTax(60_000), 1140 + 9240 + 2300);
  assert.equal(savingsTax(0), 0);
  assert.equal(bdeFee(100), 0.9);
  assert.equal(bdeFee(1000), 1.5);
  assert.equal(bdeFee(1_000_000), 200);
  assert.deepEqual(computeBill({ nominal: 500, ratePct: 3, days: 364 }), { status: "invalid", reason: "amount" });
  assert.deepEqual(computeBill({ nominal: 1500, ratePct: 3, days: 364 }), { status: "invalid", reason: "multiple" });
  assert.deepEqual(computeBill({ nominal: 1000, ratePct: Number.NaN, days: 364 }), { status: "invalid", reason: "rate" });
  assert.ok(taeFromRate(2.652, 84) > 2.652);
});

test("calculator: typed amounts and rates in Spanish, Catalan and English writing", () => {
  assert.equal(parseEuros("10.000"), 10000);
  assert.equal(parseEuros("10,000 €"), 10000);
  assert.equal(parseEuros("2500"), 2500);
  assert.ok(Number.isNaN(parseEuros("10.5")));
  assert.equal(parseRate("3,045"), 3.045);
  assert.equal(parseRate("3.045 %"), 3.045);
  assert.ok(Number.isNaN(parseRate("tres")));
});

/* -------------------------------------------------------------------------- */
/* Loader                                                                     */
/* -------------------------------------------------------------------------- */

const respond =
  (pages: Record<string, string | Error>): Fetcher =>
  async (url) => {
    const page = pages[url];
    if (page === undefined || page instanceof Error) throw page ?? new Error(`unexpected ${url}`);
    return new Response(page, { status: 200 });
  };

test("loader: live results from tesoro.es, flagged live, never newer than today", async () => {
  const data = await loadLetrasData(new Date("2026-11-13T12:00:00Z"), respond({ [LATEST_RESULTS_URL]: fixture("tesoro-letras-ultimas-20261113.html"), [TESORO_HOME]: "<html></html>" }));
  assert.deepEqual(data.live, { 3: true, 6: true, 9: true, 12: true });
  assert.equal(latestByTerm(data.results)[12]?.avgRate, 3.045);
  assert.equal(data.calendar2027Pdf, null);
  const before = await loadLetrasData(new Date("2026-11-04T12:00:00Z"), respond({ [LATEST_RESULTS_URL]: fixture("tesoro-letras-ultimas-20261113.html"), [TESORO_HOME]: "" }));
  assert.equal(before.live[3], false, "a result dated after today is ignored");
});

test("loader: tesoro.es down → the snapshot, nothing flagged live", async () => {
  const data = await loadLetrasData(new Date("2026-11-13T12:00:00Z"), respond({ [LATEST_RESULTS_URL]: new Error("timeout"), [TESORO_HOME]: new Error("timeout") }));
  assert.deepEqual(data.live, { 3: false, 6: false, 9: false, 12: false });
  assert.deepEqual(data.results, mergeResults(LETRAS_SNAPSHOT.results));
  assert.equal(data.snapshotAsOf, LETRAS_SNAPSHOT.asOf);
});

test("loader: the 2027 calendar PDF link is found on the Tesoro's home page", () => {
  assert.equal(findCalendar2027('<a href="/documents/d/tesoro/calendario-tesoro-publico-2027-espanol">x</a>'), "https://www.tesoro.es/documents/d/tesoro/calendario-tesoro-publico-2027-espanol");
  assert.equal(findCalendar2027('<a href="/documents/d/tesoro/calendario-tesoro-publico-2026-espanol-121">x</a>'), null);
});

/* -------------------------------------------------------------------------- */
/* Page words, routes, sitemap                                                */
/* -------------------------------------------------------------------------- */

const input = (day: string) => ({ results: LETRAS_SNAPSHOT.results as AuctionResult[], today: day });

test("page: title and lead carry the latest 12-month rate and the next auction with its request deadline", () => {
  const top = latestByTerm(LETRAS_SNAPSHOT.results)[12]!;
  const es = letrasMeta("es", input("2026-11-13"));
  assert.ok(es.title.includes(`${top.avgRate.toFixed(3).replace(".", ",")} %`), es.title);
  assert.ok(es.title.length <= 75, es.title);
  for (const l of LETRAS_LOCALES) assert.ok(letrasMeta(l, input("2026-11-13")).description.length <= 200, l);
  const lead = leadText("es", input("2026-11-13"));
  assert.ok(lead.includes("martes 1 de diciembre de 2026") && lead.includes("viernes 27 de noviembre de 2026 a las 14:00"), lead);
  const closed = leadText("es", input("2026-11-30"));
  assert.ok(closed.includes("ya ha cerrado") && closed.includes(weekdayDay("2026-12-09", "es")) && closed.includes(weekdayDay("2026-12-04", "es")), closed);
  const after = leadText("en", input("2027-01-20"));
  assert.ok(after.includes("not in the published official calendar"), after);
  assert.ok(freshnessText("ca", false, "2026-11-13", "2026-11-14").includes("no hem pogut"));
});

test("routes: one per language under the calculators root, revalidating with the loader", () => {
  for (const l of LETRAS_LOCALES) {
    const src = read(join("src", "app", "(public)", "[locale]", CALCULATORS_ROOT[l], LETRAS_SLUG[l], "page.tsx"));
    assert.match(src, new RegExp(`const LOCALE = "${l}"`));
    assert.match(src, new RegExp(`export const revalidate = ${SERVER_REVALIDATE_SECONDS};`));
    assert.match(src, /dynamicParams = true/);
  }
  assert.ok(APP);
  assert.deepEqual(letrasEditions(), { es: "/es/calculadoras/letras-del-tesoro/", ca: "/ca/calculadores/lletres-del-tresor/", en: "/en/calculators/spain-treasury-bills/" });
  const entries = letrasSitemapEntries(LETRAS_SNAPSHOT.results);
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
});

test("page: neutral, official links only (no bank or broker)", () => {
  const src = read("src/components/programmatic/treasury-bills/LetrasPage.tsx") + read("src/lib/programmatic/treasury-bills/rules.ts") + read("src/lib/programmatic/treasury-bills/calendar.ts");
  const hosts = new Set([...src.matchAll(/https:\/\/([a-z0-9.-]+)\//g)].map((m) => m[1]!));
  const allowed = ["www.tesoro.es", "www.tesoropublico.gob.es", "www.bde.es", "cita-previa-bde.clorian.com", "www.boe.es", "sede.agenciatributaria.gob.es"];
  for (const h of hosts) assert.ok(allowed.includes(h), `unexpected host ${h}`);
});
