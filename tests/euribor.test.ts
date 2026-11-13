import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATORS_ROOT } from "../src/lib/programmatic/calculators/paths.ts";
import { findResolutions, groupOf, parseResolution } from "../src/lib/programmatic/euribor/boe.ts";
import { EURIBOR_LOCALES, euriborEditions, euriborPath, points, rate3 } from "../src/lib/programmatic/euribor/copy.ts";
import { EURIBOR_SNAPSHOT } from "../src/lib/programmatic/euribor/data.ts";
import { euriborMeta, euriborSitemapEntries, freshnessText, leadText, nextText } from "../src/lib/programmatic/euribor/page.ts";
import { EMMI_DECISION, QUOTE, RULES_AS_OF, RULES_REREAD_BY } from "../src/lib/programmatic/euribor/rules.ts";
import {
  BDE_CSV_URL,
  REF_IDS,
  REF_SERIES,
  SERIES_FROM,
  TABLE_MONTHS,
  boeDayRange,
  boeLink,
  csvCells,
  latestPoint,
  mergeSeries,
  parseBdeCsv,
  parseBoeDay,
  parseRowMonth,
  publishedBy,
  tableRows,
  type RefSeries,
} from "../src/lib/programmatic/euribor/series.ts";
import { SERVER_REVALIDATE_SECONDS, loadEuriborData, type Fetcher } from "../src/lib/programmatic/euribor/server.ts";

/**
 * "Euríbor hoy" (lib/programmatic/euribor/): the Banco de España CSV parser
 * on a real be1901.csv excerpt, the BOE resolution parser on real BOE pages,
 * the committed snapshot (checked against the BOE by the script), the
 * never-before-the-BOE rule, the loader's fallback, the page words, the
 * routes and the date guards.
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const FIX = join(ROOT, "tests", "fixtures");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;
const csvFixture = () => new TextDecoder("latin1").decode(readFileSync(join(FIX, "bde-be1901-tail.csv")));
const boeFixture = (id: string) => readFileSync(join(FIX, `boe-${id}.html`), "utf8");

/* -------------------------------------------------------------------------- */
/* Date guards                                                                */
/* -------------------------------------------------------------------------- */

test("date guard: the committed Euribor snapshot is at most 40 days old (npm run euribor:snapshot -- build)", () => {
  assert.ok(
    daysBetween(EURIBOR_SNAPSHOT.asOf, today()) <= 40,
    `Euribor snapshot from ${EURIBOR_SNAPSHOT.asOf}: run \`npm run euribor:snapshot -- build\` (reads be1901.csv, checks every value in the BOE) and commit it.`,
  );
});

test("date guard: the snapshot's latest Euribor is the month before last or newer (the BOE prints it in the first days of each month)", () => {
  const e = latestPoint(EURIBOR_SNAPSHOT.series.euribor)!;
  // asOf 13 Nov → October must be in (BOE 4 Nov). Allow up to the 10th of the month for the BOE to come out.
  const [y, m, d] = EURIBOR_SNAPSHOT.asOf.split("-").map(Number) as [number, number, number];
  const back = d >= 10 ? 1 : 2;
  const expected = new Date(Date.UTC(y, m - 1 - back, 1)).toISOString().slice(0, 7);
  assert.ok(e.month >= expected, `Snapshot of ${EURIBOR_SNAPSHOT.asOf} ends at ${e.month}: the Banco de España should have ${expected}. Rebuild, or check be1901.csv.`);
});

test("date guard: the sources and EMMI's terms are re-read by RULES_REREAD_BY", () => {
  assert.ok(RULES_AS_OF <= today(), "RULES_AS_OF in the future");
  assert.ok(today() < RULES_REREAD_BY, `From ${RULES_REREAD_BY}: re-read Orden EHA/2899/2011 art. 27, the BdE legal notice and EMMI's terms of use (euribor/rules.ts), then move RULES_AS_OF and RULES_REREAD_BY.`);
  assert.equal(EMMI_DECISION, "monthly-official-only");
});

/* -------------------------------------------------------------------------- */
/* Banco de España CSV                                                        */
/* -------------------------------------------------------------------------- */

test("csv: cells, month rows and BOE days as the Banco de España writes them", () => {
  assert.deepEqual(csvCells('"OCT 2026","3.239","_",3.455'), ["OCT 2026", "3.239", "_", "3.455"]);
  assert.equal(parseRowMonth("OCT 2026"), "2026-10");
  assert.equal(parseRowMonth("DIC 2025"), "2025-12");
  assert.equal(parseRowMonth("FUENTE"), null);
  assert.equal(parseBoeDay("2026-Nov-04"), "2026-11-04");
  assert.equal(parseBoeDay("2026-Ago-02"), "2026-08-02");
  assert.equal(parseBoeDay("2025-Dic-02"), "2025-12-02");
  assert.equal(parseBoeDay("_"), null);
  assert.equal(parseBoeDay("2026-Nov-4"), null);
});

test("csv: a real be1901.csv excerpt (13 Nov 2026) gives October 2026 with its BOE day; IRPH of October not out yet", () => {
  const { series, missing } = parseBdeCsv(csvFixture(), "2026-01");
  assert.deepEqual(missing, []);
  assert.deepEqual(latestPoint(series.euribor), { month: "2026-10", value: 3.239, boe: "2026-11-04" });
  assert.deepEqual(latestPoint(series.irs5), { month: "2026-10", value: 3.455, boe: "2026-11-04" });
  assert.deepEqual(latestPoint(series.estr12), { month: "2026-10", value: 2.077, boe: "2026-11-04" });
  assert.deepEqual(latestPoint(series.debt26), { month: "2026-10", value: 3.106, boe: "2026-11-04" });
  // The IRPH of October has no value and no BOE day yet: the latest is September, BOE of 20 October.
  assert.deepEqual(latestPoint(series.irph), { month: "2026-09", value: 3.189, boe: "2026-10-20" });
  assert.deepEqual(latestPoint(series.irphEuro), { month: "2026-09", value: 3.6, boe: "2026-10-20" });
});

test("csv: a renamed column is reported, and a value without a BOE day is never a point", () => {
  const renamed = csvFixture().replace("D_1NBAF472", "D_XXXX");
  assert.deepEqual(parseBdeCsv(renamed).missing, ["D_1NBAF472"]);
  const noDay = csvFixture().replace('"2026-Nov-04"', '"_"').replace("2026-Nov-04", "_");
  assert.equal(latestPoint(parseBdeCsv(noDay, "2026-01").series.euribor)?.month, "2026-09");
  assert.deepEqual(parseBdeCsv("garbage").missing.length, REF_IDS.length);
});

test("never ahead of the BOE: a month shows only from its BOE day", () => {
  const { series } = parseBdeCsv(csvFixture(), "2026-01");
  assert.equal(latestPoint(publishedBy(series, "2026-11-03").euribor)?.month, "2026-09");
  assert.equal(latestPoint(publishedBy(series, "2026-11-04").euribor)?.month, "2026-10");
});

/* -------------------------------------------------------------------------- */
/* BOE resolutions                                                            */
/* -------------------------------------------------------------------------- */

test("boe: the interbank resolution of 4 Nov 2026 (BOE-A-2026-23168) reads Euribor, IRS and €STR for October", () => {
  const f = parseResolution(boeFixture("BOE-A-2026-23168"));
  assert.deepEqual(f, { month: "2026-10", euribor: 3.239, irs5: 3.455, estr12: 2.077, irph: null, irphEuro: null, debt26: null });
  assert.equal(groupOf(f, "rates"), "interbank");
});

test("boe: the IRPH resolution of 20 Oct 2026 and the debt resolution of 4 Nov 2026", () => {
  const irph = parseResolution(boeFixture("BOE-A-2026-21866"));
  assert.deepEqual(irph, { month: "2026-09", euribor: null, irs5: null, estr12: null, irph: 3.189, irphEuro: 3.6, debt26: null });
  assert.equal(groupOf(irph, "rates"), "irph");
  const debt = parseResolution(boeFixture("BOE-A-2026-23167"));
  assert.equal(debt.month, "2026-10");
  assert.equal(debt.debt26, 3.106);
  assert.equal(groupOf(debt, "debt"), "debt");
});

test("boe: older layouts (2024 single-cell headings, 2026 hyphen rows) read the same", () => {
  const nov24 = parseResolution(boeFixture("BOE-A-2024-25202"));
  assert.equal(nov24.month, "2024-11");
  assert.equal(nov24.euribor, 2.506);
  const jul26 = parseResolution(boeFixture("BOE-A-2026-16997"));
  assert.equal(jul26.month, "2026-07");
  assert.equal(jul26.euribor, 2.855);
  assert.equal(jul26.irs5, 2.957);
});

test("boe: the summary finder keeps only the Banco de España reference-rate resolutions", () => {
  const json = {
    data: {
      sumario: {
        diario: [
          {
            seccion: [
              { item: [{ identificador: "BOE-A-2026-23168", titulo: "Resolución de 3 de noviembre de 2026, del Banco de España, por la que se publican determinados tipos de interés oficiales de referencia del mercado hipotecario." }] },
              { item: { identificador: "BOE-A-2026-23167", titulo: "Resolución de 3 de noviembre de 2026, del Banco de España, por la que se publica el tipo de rendimiento interno en el mercado secundario de la deuda pública de plazo entre dos y seis años por su consideración…" } },
              { item: { identificador: "BOE-A-2026-23165", titulo: "Resolución de 2 de noviembre de 2026, del Banco de España, por la que se publican los cambios del euro correspondientes al día 2 de noviembre de 2026" } },
            ],
          },
        ],
      },
    },
  };
  assert.deepEqual(
    findResolutions(json).map((h) => [h.id, h.kind]),
    [
      ["BOE-A-2026-23168", "rates"],
      ["BOE-A-2026-23167", "debt"],
    ],
  );
});

/* -------------------------------------------------------------------------- */
/* The snapshot                                                               */
/* -------------------------------------------------------------------------- */

test("snapshot: every series since SERIES_FROM, sorted, sane, published in the BOE after its month and on or before the snapshot day", () => {
  assert.equal(EURIBOR_SNAPSHOT.source, BDE_CSV_URL);
  for (const id of REF_IDS) {
    const pts = EURIBOR_SNAPSHOT.series[id];
    assert.ok(pts.length >= TABLE_MONTHS, `${id}: ${pts.length} months`);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]!;
      assert.ok(p.month >= SERIES_FROM, `${id} ${p.month}`);
      if (i) assert.ok(p.month > pts[i - 1]!.month, `${id} order`);
      assert.ok(p.value > -2 && p.value < 20, `${id} ${p.month} ${p.value}`);
      assert.ok(p.boe > `${p.month}-31` && p.boe <= EURIBOR_SNAPSHOT.asOf, `${id} ${p.month} BOE ${p.boe}`);
    }
  }
});

test("snapshot: each month's figures have the BOE resolution they were checked against", () => {
  for (const id of REF_IDS) {
    for (const p of EURIBOR_SNAPSHOT.series[id]) {
      const r = EURIBOR_SNAPSHOT.resolutions.find((x) => x.group === REF_SERIES[id].group && x.month === p.month && x.date === p.boe);
      assert.ok(r && /^BOE-A-\d{4}-\d+$/.test(r.id), `${id} ${p.month}: no BOE resolution for ${p.boe}`);
    }
  }
  assert.equal(boeLink("2026-11-04", EURIBOR_SNAPSHOT.resolutions, "interbank"), "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23168");
  // An unknown day links the BOE summary of that day.
  assert.equal(boeLink("2026-12-02", [], "interbank"), "https://www.boe.es/boe/dias/2026/12/02/");
});

test("snapshot of 13 Nov 2026: October 2026 Euribor 3.239 % (BOE 4 Nov), September 3.247 %, a year earlier 2.187 %", () => {
  if (EURIBOR_SNAPSHOT.asOf !== "2026-11-13") return;
  const s = EURIBOR_SNAPSHOT.series;
  assert.deepEqual(latestPoint(s.euribor), { month: "2026-10", value: 3.239, boe: "2026-11-04" });
  assert.equal(s.euribor.find((p) => p.month === "2026-09")?.value, 3.247);
  assert.equal(s.euribor.find((p) => p.month === "2025-10")?.value, 2.187);
  assert.deepEqual(latestPoint(s.irph), { month: "2026-09", value: 3.189, boe: "2026-10-20" });
  assert.deepEqual(boeDayRange(s.euribor), { min: 2, max: 5, last: "2026-11-04" });
  const rows = tableRows(s);
  assert.equal(rows.length, TABLE_MONTHS);
  assert.equal(rows[0]!.month, "2026-10");
  assert.equal(rows.at(-1)!.month, "2024-11");
  assert.equal(rows[0]!.values.irph, null);
});

/* -------------------------------------------------------------------------- */
/* Loader                                                                     */
/* -------------------------------------------------------------------------- */

const latin1Response = (text: string) => new Response(new Uint8Array([...text].map((c) => c.charCodeAt(0) & 0xff)));

test("loader: Banco de España down → the dated snapshot, nothing live", async () => {
  const down: Fetcher = async () => {
    throw new Error("timeout");
  };
  const d = await loadEuriborData(new Date("2026-11-20T10:00:00Z"), down);
  assert.equal(d.live, false);
  assert.deepEqual(d.liveAdded, []);
  assert.deepEqual(latestPoint(d.series.euribor), latestPoint(EURIBOR_SNAPSHOT.series.euribor));
  assert.match(freshnessText("es", d.live, d.today, d.snapshotAsOf), /No hemos podido consultar ahora el Banco de España/);
  assert.equal(SERVER_REVALIDATE_SECONDS, 86_400);
});

test("loader: a new month joins on its BOE day, never before, and never overwrites a BOE-checked month", async () => {
  const last = latestPoint(EURIBOR_SNAPSHOT.series.euribor)!;
  const [y, m] = last.month.split("-").map(Number) as [number, number];
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  const MON = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const BMON = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const [ny, nm] = next.split("-").map(Number) as [number, number];
  const boeY = nm === 12 ? ny + 1 : ny;
  const boeM = nm === 12 ? 1 : nm + 1;
  const boeIso = `${boeY}-${String(boeM).padStart(2, "0")}-03`;
  // The real excerpt, with the snapshot's last month altered (must be ignored) and one new month added.
  const lines = csvFixture().split("\n");
  const header = csvCells(lines[0]!);
  const row = header.map((code, i) => {
    if (i === 0) return `"${MON[nm - 1]} ${ny}"`;
    if (code === REF_SERIES.euribor.code) return "2.999";
    if (code === REF_SERIES.euribor.boeCode) return `"${boeY}-${BMON[boeM - 1]}-03"`;
    return '"_"';
  });
  const altered = lines.map((l) => (l.startsWith(`"${MON[m - 1]} ${y}"`) ? l.replace(String(last.value.toFixed(3)), "9.999") : l));
  const text = [...altered.slice(0, -3), row.join(","), ...altered.slice(-3)].join("\n");
  const fetcher: Fetcher = async () => latin1Response(text);
  const before = await loadEuriborData(new Date(Date.parse(`${boeIso}T10:00:00Z`) - 86_400_000), fetcher);
  assert.equal(latestPoint(before.series.euribor)?.month, last.month);
  assert.equal(latestPoint(before.series.euribor)?.value, last.value, "a BOE-checked month is never overwritten");
  const on = await loadEuriborData(new Date(`${boeIso}T10:00:00Z`), fetcher);
  assert.deepEqual(latestPoint(on.series.euribor), { month: next, value: 2.999, boe: boeIso });
  assert.deepEqual(on.liveAdded, ["euribor"]);
  assert.ok(on.live);
});

test("merge: live months after the snapshot only", () => {
  const own = Object.fromEntries(REF_IDS.map((id) => [id, [{ month: "2026-09", value: 1, boe: "2026-10-02" }]])) as RefSeries;
  const live = Object.fromEntries(REF_IDS.map((id) => [id, [{ month: "2026-09", value: 5, boe: "2026-10-02" }, { month: "2026-10", value: 2, boe: "2026-11-04" }]])) as RefSeries;
  const m = mergeSeries(own, live);
  assert.deepEqual(m.series.euribor, [{ month: "2026-09", value: 1, boe: "2026-10-02" }, { month: "2026-10", value: 2, boe: "2026-11-04" }]);
  assert.deepEqual(m.added, [...REF_IDS]);
  assert.deepEqual(mergeSeries(own, null).added, []);
});

/* -------------------------------------------------------------------------- */
/* Page words and routes                                                      */
/* -------------------------------------------------------------------------- */

test("page: titles and descriptions fit the snippet in every language, with and without data", () => {
  const empty = Object.fromEntries(REF_IDS.map((id) => [id, []])) as unknown as RefSeries;
  for (const l of EURIBOR_LOCALES) {
    for (const s of [EURIBOR_SNAPSHOT.series, empty]) {
      const m = euriborMeta(l, s);
      assert.ok(m.title.length <= 62, `${l} title ${m.title.length}: ${m.title}`);
      assert.ok(m.description.length <= 170, `${l} description ${m.description.length}: ${m.description}`);
    }
  }
});

test("page on 13 Nov 2026: the answer-first lead, the next release window, numbers in each language's format", () => {
  if (EURIBOR_SNAPSHOT.asOf !== "2026-11-13") return;
  const s = EURIBOR_SNAPSHOT.series;
  assert.equal(euriborMeta("es", s).title, "Euríbor hoy: 3,239 % en octubre de 2026 (dato oficial)");
  assert.equal(euriborMeta("ca", s).title, "Euríbor avui: 3,239 % a l'octubre de 2026 (dada oficial)");
  assert.equal(euriborMeta("en", s).title, "Euribor today: 3.239% in October 2026 (official, Spain)");
  assert.match(
    leadText("es", s, "2026-11-13"),
    /^El Euríbor a un año de octubre de 2026 fue del 3,239 %, según el Banco de España \(BOE del 4 de noviembre de 2026\): 0,008 puntos menos que en septiembre de 2026 \(3,247 %\) y 1,052 puntos más que hace un año \(2,187 %\)\./,
  );
  assert.match(leadText("ca", s, "2026-11-13"), /d'octubre de 2026 va ser del 3,239 %.*que el setembre de 2026/);
  assert.match(leadText("en", s, "2026-11-13"), /was 3\.239%.*0\.008 points lower than in September 2026/);
  assert.equal(
    nextText("es", s, "2026-11-13"),
    "El Euríbor de noviembre de 2026 se publicará a primeros de diciembre de 2026: en los últimos 12 meses salió en el BOE entre el día 2 y el 5 del mes siguiente.",
  );
  // Past the window with no new figure: says so instead of promising a date.
  assert.match(nextText("es", s, "2026-12-09"), /aún no está en nuestros datos/);
  assert.equal(rate3(3.239, "en"), "3.239%");
  assert.equal(points(-0.008, "es"), "−0,008 p. p.");
});

test("page: only official monthly figures, quoted law, no bank names, the EMMI note and the BdE source line", () => {
  const page = read("src/components/programmatic/euribor/EuriborPage.tsx");
  assert.match(page, /<MoreCalculators current="euribor" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\),/);
  assert.match(page, /<RevisionCalculator /);
  assert.match(page, /Fuente: Banco de España/);
  assert.match(page, /URLS\.emmiTerms/);
  assert.match(page, /no asesoramiento financiero/);
  // Never the daily table (EMMI data) anywhere in the module.
  for (const f of ["series.ts", "server.ts", "boe.ts", "page.ts", "copy.ts"]) assert.doesNotMatch(read(`src/lib/programmatic/euribor/${f}`), /ti_1_7/, f);
  assert.match(QUOTE.art27publish, /se publicarán mensualmente por el Banco de España en el “Boletín Oficial del Estado”/);
});

test("routes: one static route per language, daily revalidation, never dynamicParams = false; sitemap and llms.txt", () => {
  assert.deepEqual(euriborEditions(), { es: "/es/calculadoras/euribor-hoy/", ca: "/ca/calculadores/euribor-avui/", en: "/en/calculators/euribor-today/" });
  for (const l of EURIBOR_LOCALES) {
    const src = readFileSync(join(APP, CALCULATORS_ROOT[l], euriborPath(l).split("/")[3]!, "page.tsx"), "utf8");
    assert.match(src, new RegExp(`const LOCALE = "${l}";`));
    assert.match(src, new RegExp(`if \\(locale !== LOCALE\\) notFound\\(\\);`));
    assert.match(src, /^export const revalidate = 86400;$/m);
    assert.match(src, /^export const dynamicParams = true;$/m);
  }
  const entries = euriborSitemapEntries(EURIBOR_SNAPSHOT.series);
  assert.equal(entries.length, 3);
  for (const x of entries) assert.deepEqual(Object.keys(x.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.euriborSitemapEntries\(EURIBOR_SNAPSHOT\.series\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: euriborEditions\(\)/);
});
