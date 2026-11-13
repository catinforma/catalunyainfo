import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALC_COPY, DECIMALS, RENT_LOCALES, elDay, euros, indexOfMonth, monthText, num, pct, rentEditions, rentPath } from "../src/lib/programmatic/rent-update/copy.ts";
import { RENT_SNAPSHOT } from "../src/lib/programmatic/rent-update/data.ts";
import { anniversaryIn, computeRentUpdate, defaultExample, parseAmount, type OkResult, type RentInput, type RentResult, type RentSeries } from "../src/lib/programmatic/rent-update/engine.ts";
import { SERIES, buildSeries, latestPoint, mergeSeries, monthInForce, parseCalendar, parseSeries, publishedPoints } from "../src/lib/programmatic/rent-update/ine.ts";
import { lastMonths, latestShared, leadText, rentMeta, rentSitemapEntries } from "../src/lib/programmatic/rent-update/page.ts";
import { NORMS, RENT_RULES_AS_OF, RENT_RULES_REVIEW_BY } from "../src/lib/programmatic/rent-update/rules.ts";
import { loadRentData, type Fetcher } from "../src/lib/programmatic/rent-update/server.ts";

/**
 * The rent-update calculator ("Actualizar el alquiler",
 * lib/programmatic/rent-update/): the INE snapshot it falls back to, the
 * engine on cases worked out by hand from the BOE texts and the INE's
 * published figures, the server loader's fallback, and the pages.
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const DATA: RentSeries = RENT_SNAPSHOT.series;

const run = (over: Partial<RentInput>): RentResult => computeRentUpdate({ rent: 1000, signed: "2024-11-20", update: "2026-11-20", index: "irav", use: "housing", ...over }, DATA);
function ok(r: RentResult): OkResult {
  assert.equal(r.status, "ok", JSON.stringify(r));
  return r as OkResult;
}

/* -------------------------------------------------------------------------- */
/* Date guard                                                                 */
/* -------------------------------------------------------------------------- */

test("date guard: the rent rules were read in the BOE less than the review window ago", () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(
    today < RENT_RULES_REVIEW_BY,
    `Re-read the rent-update rules (src/lib/programmatic/rent-update/rules.ts, read ${RENT_RULES_AS_OF}): LAU art. 18 and DA 11, Ley 12/2023 DT 4, any new real decreto-ley on rents (BOE), the INE's IRAV page; then move RENT_RULES_AS_OF and RENT_RULES_REVIEW_BY.`,
  );
});

/* -------------------------------------------------------------------------- */
/* The INE snapshot                                                           */
/* -------------------------------------------------------------------------- */

test("snapshot: the series codes read on 13 Nov 2026, and no month shown before the INE released it", () => {
  assert.equal(SERIES.ipc.code, "IPC290750");
  assert.equal(SERIES.irav.code, "IRAV1");
  assert.equal(SERIES.igc.code, "IGC1");
  for (const id of ["ipc", "irav", "igc"] as const) {
    const points = DATA[id].points;
    assert.ok(points.length > 12, id);
    for (const p of points) {
      assert.ok(p.published, `${id} ${p.month} has no release day`);
      if (p.value !== null) assert.ok(p.published! <= RENT_SNAPSHOT.asOf, `${id} ${p.month} released ${p.published}, after the snapshot`);
      else assert.ok(p.published! > RENT_SNAPSHOT.asOf, `${id} ${p.month} released but without value`);
    }
    // Months are consecutive: no published month missing in the middle.
    const months = publishedPoints(DATA[id]).map((p) => p.month);
    for (let i = 1; i < months.length; i++) {
      const [y, m] = months[i - 1]!.split("-").map(Number) as [number, number];
      const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
      assert.equal(months[i], next, `${id}: gap after ${months[i - 1]}`);
    }
  }
});

test("snapshot: figures the INE published, spot-checked by hand", () => {
  const v = (id: "ipc" | "irav" | "igc", month: string) => DATA[id].points.find((p) => p.month === month);
  assert.deepEqual(v("irav", "2024-11"), { month: "2024-11", value: 2.2, published: "2025-01-02" });
  assert.deepEqual(v("irav", "2026-10"), { month: "2026-10", value: 2.57, published: "2026-11-13" });
  assert.deepEqual(v("ipc", "2026-10"), { month: "2026-10", value: 4.9, published: "2026-11-13" });
  assert.deepEqual(v("ipc", "2023-11"), { month: "2023-11", value: 3.2, published: "2023-12-14" });
  assert.deepEqual(v("igc", "2023-10"), { month: "2023-10", value: 0.58, published: "2023-12-20" });
});

test("snapshot: the IRAV is never above the all-items CPI of the same month (it is a minimum that includes it)", () => {
  for (const p of publishedPoints(DATA.irav)) {
    const ipc = DATA.ipc.points.find((q) => q.month === p.month);
    assert.ok(ipc?.value !== null && ipc?.value !== undefined, p.month);
    assert.ok(p.value! <= ipc!.value!, `${p.month}: IRAV ${p.value} > IPC ${ipc!.value}`);
  }
});

/* -------------------------------------------------------------------------- */
/* INE parsing                                                                */
/* -------------------------------------------------------------------------- */

test("ine: calendar skips the flash estimate and keeps a month's first release; series drops malformed rows", () => {
  const cal = parseCalendar([
    { Nombre: "Índice de Precios de Consumo. Avance. Octubre 2026", Fecha: Date.UTC(2026, 9, 30, 8), FK_Periodo: 10, Anyo: 2026 },
    { Nombre: "Índice de Precios de Consumo. Octubre 2026", Fecha: Date.UTC(2026, 10, 13, 8), FK_Periodo: 10, Anyo: 2026 },
    { Nombre: "Índice de Precios de Consumo. Octubre 2026", Fecha: Date.UTC(2026, 11, 23, 8), FK_Periodo: 10, Anyo: 2026 },
  ]);
  assert.deepEqual([...cal], [["2026-10", "2026-11-13"]]);
  const values = parseSeries({ Data: [{ Anyo: 2026, FK_Periodo: 10, Valor: 4.9 }, { Anyo: 2026, FK_Periodo: 11, Valor: "x" }, { Anyo: 2026, FK_Periodo: 9, Valor: 999 }, { Anyo: 2026, FK_Periodo: 8, Valor: 1, Secreto: true }] });
  assert.deepEqual([...values], [["2026-10", 4.9]]);
  assert.equal(parseSeries(null).size, 0);
  assert.equal(parseCalendar({}).size, 0);
});

test("ine: a value is never shown before its release day, and the month in force is the last released on the day", () => {
  const values = new Map([["2026-09", 2.54], ["2026-10", 2.57]]);
  const calendar = new Map([["2026-09", "2026-10-14"], ["2026-10", "2026-11-13"], ["2026-11", "2026-12-15"]]);
  const early = buildSeries("irav", values, calendar, "2026-11-12", "2026-09");
  assert.deepEqual(early.points.map((p) => p.value), [2.54, null, null]);
  const s = buildSeries("irav", values, calendar, "2026-11-13", "2026-09");
  assert.equal(monthInForce(s, "2026-11-12")?.month, "2026-09");
  assert.equal(monthInForce(s, "2026-11-13")?.month, "2026-10");
  assert.equal(monthInForce(s, "2026-12-20")?.month, "2026-11");
  assert.equal(monthInForce(s, "2026-12-20")?.value, null);
  // Merge: the live answer wins where it has a value, the snapshot fills the rest.
  const merged = mergeSeries(early, s);
  assert.deepEqual(merged.points.map((p) => p.value), [2.54, 2.57, null]);
  assert.deepEqual(mergeSeries(s, null), s);
});

/* -------------------------------------------------------------------------- */
/* Engine: worked cases                                                       */
/* -------------------------------------------------------------------------- */

test("engine: flat signed after 26 May 2023 on the IRAV, updated 20 Nov 2026: IRAV of October 2026, 2.57 %", () => {
  const r = ok(run({}));
  assert.equal(r.agreed.source?.month, "2026-10");
  assert.equal(r.percent, 2.57);
  assert.equal(r.newRent, 1025.7);
  assert.equal(r.monthly, 25.7);
  assert.equal(r.yearly, 308.4);
  assert.ok(r.norms.includes("lauDa11") && r.norms.includes("rdl29"));
});

test("engine: the month is the last released on the anniversary, not the anniversary's month (10 Nov 2026 → September)", () => {
  const r = ok(run({ update: "2026-11-10" }));
  assert.equal(r.agreed.source?.month, "2026-09");
  assert.equal(r.percent, 2.54);
  assert.equal(r.newRent, 1025.4);
  // On the release day itself the new month counts, and the note says so.
  const same = ok(run({ update: "2026-11-13" }));
  assert.equal(same.agreed.source?.month, "2026-10");
  assert.ok(same.notes.includes("releaseDay"));
});

test("engine: a pre-2023 flat on the IPC, through the 2026 decrees", () => {
  const base = { signed: "2022-03-15", index: "ipc" as const };
  // 15 Mar 2026: old regime, IPC of February (2.3 %) under its own IPC cap.
  const march = ok(run({ ...base, update: "2026-03-15" }));
  assert.equal(march.agreed.source?.month, "2026-02");
  assert.equal(march.percent, 2.3);
  assert.deepEqual(march.caps.map((c) => c.kind), ["ipc"]);
  assert.equal(march.binding, null);
  // 15 Apr 2026: RDL 8/2026 window, IPC of March 3.4 % capped at 2 %, negotiable.
  const april = ok(run({ ...base, update: "2026-04-15" }));
  assert.equal(april.agreed.percent, 3.4);
  assert.equal(april.binding?.kind, "rdl8");
  assert.equal(april.percent, 2);
  assert.ok(april.notes.includes("negotiable"));
  // 15 Mar and 15 Jun 2026 are outside it.
  assert.equal(ok(run({ ...base, update: "2026-06-15" })).binding, null);
  // 5 Oct 2026: RDL 26 repealed, RDL 29 not yet in force: IPC of August, 4.3 %, no IRAV cap; near a decree edge.
  const oct5 = ok(run({ ...base, update: "2026-10-05" }));
  assert.equal(oct5.percent, 4.3);
  assert.ok(!oct5.caps.some((c) => c.kind === "irav"));
  assert.ok(oct5.notes.includes("decreeEdge"));
  // 1 Oct 2026, the one day of RDL 26/2026: IRAV cap.
  const oct1 = ok(run({ ...base, update: "2026-10-01" }));
  assert.equal(oct1.binding?.kind, "irav");
  assert.ok(oct1.norms.includes("rdl26"));
  // 15 Oct 2026, RDL 29/2026: IPC of September 4.9 % capped by the IRAV of September, 2.54 %.
  const oct15 = ok(run({ ...base, update: "2026-10-15" }));
  assert.equal(oct15.agreed.percent, 4.9);
  assert.equal(oct15.binding?.kind, "irav");
  assert.equal(oct15.percent, 2.54);
  assert.ok(oct15.norms.includes("rdl29") && oct15.norms.includes("ley12Dt4") && oct15.norms.includes("rdl29Valid"));
  assert.ok(!oct15.notes.includes("negotiable"));
});

test("engine: 2023 IGC cap (Ley 2/2015 band 0–2 %) and 2024 3 % cap", () => {
  // 15 Dec 2023: IGC of September 2023 (2.15 %, released 20 Nov) counts as 2 %; IPC of November 3.2 %.
  const dec15 = ok(run({ signed: "2020-12-15", update: "2023-12-15", index: "ipc" }));
  const igc = dec15.caps.find((c) => c.kind === "igc")!;
  assert.equal(igc.index?.month, "2023-09");
  assert.equal(igc.raw, 2.15);
  assert.equal(igc.percent, 2);
  assert.equal(dec15.agreed.percent, 3.2);
  assert.equal(dec15.percent, 2);
  // 28 Dec 2023: IGC of October 2023 (0.58 %, released 20 Dec).
  assert.equal(ok(run({ signed: "2020-12-28", update: "2023-12-28", index: "ipc" })).percent, 0.58);
  // 1 Jun 2024: IPC of April 2024 3.3 % capped at 3 %.
  const june = ok(run({ signed: "2021-06-01", update: "2024-06-01", index: "ipc" }));
  assert.equal(june.agreed.percent, 3.3);
  assert.equal(june.binding?.kind, "three");
  assert.equal(june.percent, 3);
});

test("engine: commercial leases follow the contract, no cap", () => {
  const r = ok(run({ use: "commercial", index: "ipc" }));
  assert.equal(r.percent, 4.9);
  assert.equal(r.caps.length, 0);
  assert.ok(r.notes.includes("commercial"));
  assert.deepEqual(r.norms, ["lau4"]);
  assert.equal(ok(run({ use: "commercial", index: "fixed", fixedPercent: 5, update: "2024-06-01", signed: "2021-06-01" })).percent, 5);
});

test("engine: fixed percentages, contracts before 6 Mar 2019, 1 Jan 2025", () => {
  // Signed 2018: outside the extraordinary caps and before RDL 26/29, no legal cap.
  const old = ok(run({ signed: "2018-06-01", update: "2025-06-01", index: "fixed", fixedPercent: 5 }));
  assert.equal(old.percent, 5);
  assert.ok(old.notes.includes("noLegalCap"));
  // The same contract from 8 Oct 2026: IRAV cap.
  const now = ok(run({ signed: "2018-11-20", index: "fixed", fixedPercent: 5 }));
  assert.equal(now.percent, 2.57);
  // A fixed rate below the cap applies as it is.
  assert.equal(ok(run({ index: "fixed", fixedPercent: 1.5 })).percent, 1.5);
  // 1 Jan 2025: DA 11 applied but no IRAV was out (first release 2 Jan): the IPC cap held.
  const jan1 = ok(run({ signed: "2024-01-01", update: "2025-01-01", index: "ipc" }));
  assert.equal(jan1.caps[0]?.kind, "ipc");
  assert.ok(jan1.notes.includes("firstIrav"));
});

test("engine: never a figure the INE has not released", () => {
  // 20 Dec 2026: November's IRAV is scheduled for 15 Dec, not out in the snapshot.
  const dec = run({ update: "2026-12-20" });
  assert.deepEqual(dec, { status: "pending", series: "irav", reason: "scheduled", month: "2026-11", published: "2026-12-15" });
  // March 2027: the INE's calendar does not reach it yet.
  assert.equal((run({ update: "2027-03-20", signed: "2025-03-20" }) as { reason?: string }).reason, "unknown");
  // An IRAV clause updated before the first IRAV.
  const before = run({ update: "2024-12-01", signed: "2023-12-01" });
  assert.equal(before.status, "pending");
  assert.equal((before as { reason: string }).reason, "before-series");
  // 10 Dec 2026 still uses October.
  assert.equal(ok(run({ update: "2026-12-10" })).agreed.source?.month, "2026-10");
});

test("engine: inputs it refuses", () => {
  assert.deepEqual(run({ rent: 0 }), { status: "invalid", reason: "rent" });
  assert.deepEqual(run({ rent: Number.NaN }), { status: "invalid", reason: "rent" });
  assert.deepEqual(run({ signed: "2024-02-30" }), { status: "invalid", reason: "dates" });
  assert.deepEqual(run({ signed: "2026-06-01" }), { status: "invalid", reason: "order" });
  assert.deepEqual(run({ index: "fixed" }), { status: "invalid", reason: "fixed" });
  assert.equal(run({ signed: "2020-06-01", update: "2022-06-01" }).status, "out-of-range");
  assert.equal(anniversaryIn("2024-01-31", "2026-02"), "2026-02-28");
  assert.equal(anniversaryIn("2024-02-29", "2028-02"), "2028-02-29");
  assert.equal(anniversaryIn("2024-11-20", "2026-11"), "2026-11-20");
  assert.equal(parseAmount("1.000"), 1000);
  assert.equal(parseAmount("1000,50 €"), 1000.5);
  assert.equal(parseAmount("1,000.50"), 1000.5);
  assert.equal(parseAmount("950.5"), 950.5);
  assert.equal(parseAmount("3 %"), 3);
  assert.ok(Number.isNaN(parseAmount("")));
  assert.ok(Number.isNaN(parseAmount("mil")));
  assert.deepEqual(defaultExample("2028-02-29"), { rent: 1000, signed: "2026-02-28", update: "2028-02-29", index: "irav", use: "housing" });
});

test("engine: every norm it cites has a BOE link", () => {
  for (const [id, n] of Object.entries(NORMS)) {
    assert.match(n.url, /^https:\/\/www\.boe\.es\//, id);
    assert.match(n.ref, /^BOE-A-\d{4}-\d+$/, id);
  }
});

/* -------------------------------------------------------------------------- */
/* Server loader                                                              */
/* -------------------------------------------------------------------------- */

/** An INE that answers with the snapshot's own months (as the API shapes them). */
function fakeIne(opts: { fail?: boolean; dropLast?: boolean } = {}): Fetcher {
  return async (url: string) => {
    if (opts.fail) throw new Error("timeout");
    const spec = Object.values(SERIES).find((s) => url.includes(`/${s.code}?`) || url.endsWith(`/${s.publication}`))!;
    const points = DATA[spec.id].points;
    if (url.includes("DATOS_SERIE")) {
      const pub = points.filter((p) => p.value !== null).slice(0, opts.dropLast ? -2 : undefined);
      return new Response(JSON.stringify({ COD: spec.code, Data: pub.map((p) => ({ Anyo: Number(p.month.slice(0, 4)), FK_Periodo: Number(p.month.slice(5)), Valor: p.value })) }));
    }
    return new Response(JSON.stringify(points.map((p) => ({ Nombre: `X. ${p.month}`, Anyo: Number(p.month.slice(0, 4)), FK_Periodo: Number(p.month.slice(5)), Fecha: Date.parse(`${p.published}T08:00:00Z`) }))));
  };
}

test("server: live INE answer is used; a failure or an older answer falls back to the snapshot with its date", async () => {
  const now = new Date("2026-11-13T12:00:00Z");
  const live = await loadRentData(now, fakeIne());
  assert.deepEqual(live.live, { ipc: true, irav: true, igc: false });
  assert.equal(latestPoint(live.series.irav)?.month, "2026-10");
  assert.equal(live.today, "2026-11-13");

  const down = await loadRentData(now, fakeIne({ fail: true }));
  assert.deepEqual(down.live, { ipc: false, irav: false, igc: false });
  assert.equal(down.readAt, RENT_SNAPSHOT.fetchedAt);
  assert.deepEqual(down.series, DATA);

  const stale = await loadRentData(now, fakeIne({ dropLast: true }));
  assert.equal(stale.live.irav, false);
  assert.equal(latestPoint(stale.series.irav)?.month, "2026-10");
});

/* -------------------------------------------------------------------------- */
/* Words and pages                                                            */
/* -------------------------------------------------------------------------- */

test("copy: numbers without locale data, months and articles", () => {
  assert.equal(pct(2.57, 2, "es"), "2,57 %");
  assert.equal(pct(2.57, 2, "en"), "2.57%");
  assert.equal(pct(3, 1, "ca"), "3,0 %");
  assert.equal(pct(-0.3, 1, "es"), "−0,3 %");
  assert.equal(euros(1025.7, "es"), "1.025,70 €");
  assert.equal(euros(1025.7, "en"), "€1,025.70");
  assert.equal(num(1234567.891, 2, "ca"), "1.234.567,89");
  assert.equal(monthText("2026-10", "es"), "octubre de 2026");
  assert.equal(indexOfMonth("irav", "2026-10", "ca"), "l'IRAV d'octubre de 2026");
  assert.equal(indexOfMonth("ipc", "2026-11", "ca"), "l'IPC de novembre de 2026");
  assert.equal(indexOfMonth("irav", "2026-10", "en"), "the IRAV for October 2026");
  assert.equal(elDay("2026-01-01", "ca"), "l'1 de gener de 2026");
  assert.equal(elDay("2026-11-13", "es"), "el 13 de noviembre de 2026");
  assert.deepEqual(DECIMALS, { ipc: 1, irav: 2, igc: 2 });
  for (const l of RENT_LOCALES) assert.ok(CALC_COPY[l].notes.notify.includes("18.2"), l);
});

test("page: the lead answers today's question with the INE's figure, in all three languages", () => {
  const es = leadText("es", DATA, "2026-11-13")!;
  assert.match(es, /hoy, el 13 de noviembre de 2026, la subida máxima es el IRAV de octubre de 2026: 2,57 %/);
  assert.match(es, /1\.000,00 € pasa a 1\.025,70 €/);
  assert.match(es, /8 de octubre de 2026/);
  assert.match(es, /IPC, se aplica entero \(4,9 %\)/);
  assert.match(leadText("ca", DATA, "2026-11-13")!, /l'IRAV d'octubre de 2026: 2,57 %/);
  assert.match(leadText("en", DATA, "2026-11-13")!, /the IRAV for October 2026: 2\.57%/);
  // Before 8 Oct 2026 it would not claim the cap covers every contract.
  assert.doesNotMatch(leadText("es", DATA, "2026-09-20")!, /todos los contratos/);
  assert.equal(leadText("es", DATA, "2028-01-10"), null);
});

test("page: title and description carry the latest month's figures, within Google's length", () => {
  assert.equal(latestShared(DATA)?.month, "2026-10");
  const es = rentMeta("es", DATA);
  assert.equal(es.title, "Actualizar el alquiler: IRAV 2,57 % e IPC 4,9 % de octubre");
  assert.equal(rentMeta("ca", DATA).title, "Actualitzar el lloguer: IRAV 2,57 % i IPC 4,9 % d'octubre");
  assert.equal(rentMeta("en", DATA).title, "Rent increase in Spain: IRAV 2.57% and CPI 4.9% for October");
  for (const l of RENT_LOCALES) {
    const m = rentMeta(l, DATA);
    assert.ok(m.title.length <= 62, `${l}: ${m.title.length}`);
    assert.ok(m.description.length <= 230, `${l}: ${m.description.length}`);
  }
});

test("page: the 12-month table is newest first, from the INE's published months only", () => {
  const rows = lastMonths(DATA, 12);
  assert.equal(rows.length, 12);
  assert.equal(rows[0]!.month, "2026-10");
  assert.equal(rows[11]!.month, "2025-11");
  assert.deepEqual(rows[0], { month: "2026-10", ipc: 4.9, irav: 2.57, published: "2026-11-13" });
  assert.ok(rows.every((r) => r.ipc !== null && r.irav !== null));
});

test("routes: one static folder per language, sitemap with hreflang", () => {
  assert.deepEqual(rentEditions(), {
    es: "/es/calculadoras/actualizar-alquiler/",
    ca: "/ca/calculadores/actualitzar-lloguer/",
    en: "/en/calculators/rent-increase-spain/",
  });
  for (const l of RENT_LOCALES) {
    const dir = join(APP, ...rentPath(l).split("/").filter(Boolean).slice(1));
    const page = readFileSync(join(dir, "page.tsx"), "utf8");
    assert.match(page, new RegExp(`const LOCALE = "${l}"`));
    assert.match(page, /export const revalidate = 86400;/);
  }
  const entries = rentSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) {
    assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
    assert.ok(String(e.alternates!.languages!["x-default"]).endsWith("/en/calculators/rent-increase-spain/"));
  }
  assert.match(readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8"), /\.\.\.rentSitemapEntries\(\)/);
  // The server constant and the routes' literal agree.
  assert.match(readFileSync(join(ROOT, "src/lib/programmatic/rent-update/server.ts"), "utf8"), /SERVER_REVALIDATE_SECONDS = 86_400;/);
});
