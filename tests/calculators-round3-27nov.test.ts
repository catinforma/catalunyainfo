import assert from "node:assert/strict";
import { test } from "node:test";

import { CATALONIA_IPC, cataloniaSection } from "../src/lib/programmatic/ipc/catalonia.ts";
import { IPC_SNAPSHOT } from "../src/lib/programmatic/ipc/data.ts";
import { ipcFaq } from "../src/lib/programmatic/ipc/faq.ts";
import { latestFigures } from "../src/lib/programmatic/ipc/series.ts";
import { SOC_READ_BY, SOC_SOURCE, socCopy } from "../src/lib/programmatic/employment/catalonia-soc.ts";
import { extraUnemploymentFaq } from "../src/lib/programmatic/employment/unemployment-faq.ts";
import { benefitLimits } from "../src/lib/programmatic/employment/unemployment.ts";
import { subsidyCaseRows, subsidyExamplesCopy } from "../src/lib/programmatic/unemployment-subsidy/examples.ts";
import { RENT_SNAPSHOT } from "../src/lib/programmatic/rent-update/data.ts";
import { rentExamplesCopy, rentRows } from "../src/lib/programmatic/rent-update/examples.ts";
import { earningsCopy, earningsRows } from "../src/lib/programmatic/self-employed/examples.ts";
import { byContributionCopy, byContributionRows } from "../src/lib/programmatic/retirement-age/by-contributions.ts";
import { ymText } from "../src/lib/programmatic/retirement-age/copy.ts";

/**
 * Batch 8J (27 Nov 2026, ci-edicio): calculators round 3 — IPC, paro,
 * subsidio, rent update, self-employed, retirement age. Body only.
 */

const LOCALES = ["es", "ca", "en"] as const;
const today = () => new Date().toISOString().slice(0, 10);
/** money() prints a no-break space before € and %. */
const sp = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");

test("IPC: Catalonia provinces and 12-month table for October 2026 (INE tables 76143 and 76140, read 27 Nov 2026)", () => {
  const latest = latestFigures(IPC_SNAPSHOT)!;
  const spain = new Map(IPC_SNAPSHOT.series.general.map((p) => [p.month, p.value]));
  const es = cataloniaSection("es", latest, CATALONIA_IPC, spain)!;
  assert.equal(es.provincesText, "Por provincias, en octubre de 2026: Barcelona 4,7 %, Girona 5,7 %, Lleida 5,6 %, Tarragona 4,9 %. La más alta, Girona.");
  assert.equal(es.history.length, 12);
  assert.deepEqual(es.history[0], { month: "octubre de 2026", catalonia: "4,8 %", spain: "4,9 %" });
  assert.equal(es.history[11]!.month, "noviembre de 2025");
  assert.ok(es.history.every((r) => r.spain !== "—"), "every month of the Catalonia table has the national figure from the snapshot");
  const ca = cataloniaSection("ca", latest, CATALONIA_IPC, spain)!;
  assert.match(ca.provincesText, /^Per províncies, a l'octubre de 2026: Barcelona 4,7 %/);
  const en = cataloniaSection("en", latest, CATALONIA_IPC, spain)!;
  assert.match(en.provincesText, /^By province, in October 2026: Barcelona 4\.7%/);
  // The history ends on the month of the line, so the whole block switches off with it.
  assert.equal(CATALONIA_IPC.history.at(-1)![0], CATALONIA_IPC.month);
});

test("IPC FAQ: answers from the page's own data, never a month the INE has not published", () => {
  const latest = latestFigures(IPC_SNAPSHOT)!;
  for (const locale of LOCALES) {
    const faq = ipcFaq(locale, IPC_SNAPSHOT, "2026-11-26");
    assert.equal(faq.length, 5, locale);
    assert.ok(faq.every((f) => f.q.endsWith("?") && f.a.length > 40), locale);
    assert.ok(!faq.some((f) => /noviembre de 2026[^.]*: [0-9]|novembre de 2026[^.]*: [0-9]/.test(f.a)), "no November figure before the INE prints it");
  }
  const es = ipcFaq("es", IPC_SNAPSHOT, "2026-11-26");
  assert.equal(latest.month, "2026-10");
  assert.match(es[0]!.a, /^El último dato definitivo es el de octubre de 2026: el IPC general subió un 4,9 % en doce meses \(\+0,6 %/);
  assert.equal(es[1]!.q, "¿Cuál es el IPC de Cataluña en octubre de 2026?");
  assert.match(es[2]!.a, /Próximas fechas: el adelantado de noviembre de 2026, el 27 de noviembre de 2026 y el definitivo de noviembre de 2026, el 15 de diciembre de 2026\./);
  assert.match(es[4]!.a, /Para la subida de enero de 2027 cuentan las de diciembre de 2025 a noviembre de 2026\./);
  const ca = ipcFaq("ca", IPC_SNAPSHOT, "2026-11-26");
  assert.equal(ca[1]!.q, "Quin és l'IPC de Catalunya a l'octubre de 2026?");
  assert.match(ca[0]!.a, /La va publicar l'INE el 13 de novembre de 2026\./);
  // After the flash day the calendar answer drops it by itself; the Catalonia question goes with the month.
  const later = ipcFaq("es", IPC_SNAPSHOT, "2026-11-28");
  assert.doesNotMatch(later[2]!.a, /adelantado de noviembre/);
  assert.equal(ipcFaq("es", { ...IPC_SNAPSHOT, series: { ...IPC_SNAPSHOT.series, general: [...IPC_SNAPSHOT.series.general, { month: "2026-11", value: 9.9, published: "2026-12-15" }] } }, "2026-12-16").some((f) => /Cataluña/.test(f.q)), false);
});

test("date guard: from 16 Dec 2026 the Catalonia provinces and history carry November (INE 15 Dec 2026)", () => {
  if (today() < CATALONIA_IPC.rereadBy) return;
  assert.ok(CATALONIA_IPC.history.at(-1)![0] >= "2026-11", "Re-read INE table 76143 (provinces) and series IPC294107 (Catalonia), then update provinces and history in src/lib/programmatic/ipc/catalonia.ts.");
});

/* Paro and subsidy: SOC registration in Catalonia, maximum, examples ------- */

test("paro: maximum 2026 from benefitLimits, 2025 = 2026 answer, SOC answer (ca/es/en)", () => {
  const es = extraUnemploymentFaq("es");
  assert.equal(es[0]!.q, "¿Cuál es el paro máximo en 2026?");
  assert.match(sp(es[0]!.a), /^1\.225,00 € al mes sin hijos a cargo, 1\.400,00 € con un hijo y 1\.575,00 € con dos o más/);
  assert.equal(benefitLimits(2).max, 1575);
  assert.match(sp(es[1]!.a), /IPREM, que sigue en 600,00 € al mes desde 2023/);
  assert.match(es[2]!.a, /SOC .*DARDO.*930 886 200/);
  assert.match(extraUnemploymentFaq("ca")[0]!.q, /^Quin és l'atur màxim el 2026\?$/);
  assert.match(sp(extraUnemploymentFaq("en")[0]!.a), /^€1,225\.00 a month/);
  for (const l of LOCALES) assert.equal(socCopy(l).paragraphs.length, 2);
  assert.match(SOC_SOURCE.url, /^https:\/\/serveiocupacio\.gencat\.cat\//);
});

test("subsidy: six cases from checkSubsidy; totals match the 95/90/80 % bands", () => {
  const rows = Object.fromEntries(subsidyCaseRows().map((r) => [r.id, r.result]));
  assert.equal(rows["young-alone"]!.months, 6);
  assert.equal(rows["young-alone"]!.total, 3420);
  assert.equal(rows["family-120"]!.months, 24);
  assert.equal(rows["family-360"]!.total, 15300);
  assert.equal(rows["short-family"]!.months, 21);
  assert.equal(rows["over52"]!.kind, "over52");
  assert.equal(rows["over52"]!.total, null);
  assert.equal(rows["over52"]!.firstMonthly, 480);
  for (const l of LOCALES) {
    const c = subsidyExamplesCopy(l);
    assert.equal(c.faq.length, 3);
    for (const r of subsidyCaseRows()) assert.ok(c.labels[r.id], `${l} label ${r.id}`);
  }
  assert.match(sp(subsidyExamplesCopy("es").faq[1]!.a), /^915,75 € al mes: el 75 % de 1\.221 €/);
});

test("date guard: re-read the SOC registration page (phone, 30-day profile rule) by SOC_READ_BY", () => {
  if (today() < SOC_READ_BY) return;
  assert.fail("Re-read the SOC page in src/lib/programmatic/employment/catalonia-soc.ts (curl + grep the quotes), update readOn and move SOC_READ_BY.");
});

/* Rent update: rents updated today from computeRentUpdate ----------------- */

test("rent: table and the two answers come from the engine (2 % cap on housing, full CPI on a shop)", () => {
  const s = RENT_SNAPSHOT.series;
  const rows = rentRows(s, "2026-11-27")!;
  assert.equal(rows.length, 6);
  const es = rentExamplesCopy("es", s, "2026-11-27")!;
  assert.equal(es.faq[0]!.q, "¿Cuánto sube un alquiler de 800 € este año?");
  assert.match(es.faq[0]!.a, /pasa a 816,00 € al mes \(\+16,00 €, un 2 %\)/);
  assert.match(es.faq[1]!.a, /800,00 € × 1,049 = 839,20 €/);
  assert.equal(rows[0]!.flat.newRent, 510);
  assert.equal(rows[0]!.shop.newRent, 524.5);
  assert.match(rentExamplesCopy("en", s, "2026-11-27")!.faq[0]!.q, /^How much does a €800 rent go up this year in Spain\?$/);
  assert.match(rentExamplesCopy("ca", s, "2026-11-27")!.faq[1]!.a, /800,00 € × 1,049 = 839,20 €/);
  // Outside the calculator's range the section and its questions go away by themselves.
  assert.equal(rentExamplesCopy("es", s, "2028-01-02"), null);
});

/* Self-employed: contribution by yearly net earnings ---------------------- */

test("self-employed: eight earnings rows from calculateSelfEmployed; the 1.000 € answer", () => {
  const rows = earningsRows();
  assert.equal(rows.length, 8);
  const at = (net: number) => rows.find((r) => r.net === net)!.r;
  assert.equal(at(8000).full.monthly, 205.88);
  assert.equal(at(24000).band.n, 5);
  assert.equal(at(24000).full.monthly, 380.88);
  assert.match(sp(earningsCopy("es").faq[0]!.a), /cuenta 930,00 € tras restar el 7 %: tramo 3 de la tabla reducida, con una cuota mínima de 267,65 € al mes/);
  assert.match(sp(earningsCopy("ca").faq[0]!.q), /^Quant paga d'autònom algú que guanya 1\.000 € al mes\?$/);
  assert.match(earningsCopy("en").faq[0]!.a, /band 3 of the reduced table/);
});

/* Retirement age by years contributed at 65 ------------------------------- */

test("retirement: age by contributions at 65 (DT 7ª table via ordinaryDate), FAQs in the searchers' words", () => {
  // Batch 8R: each cell is a list of birth spans (age + DT 7ª row of the year the age is reached); 38 years at 65 in 2026 splits on 1 Oct 1961.
  const ages = (spans: { result: { age: { y: number; m: number }; row: { year: number } } }[]) => spans.map((s) => `${ymText(s.result.age, "es")} @${s.result.row.year}`).join(" | ");
  const t = byContributionRows().map((r) => [ymText(r.at65, "es"), ages(r.y2026), ages(r.y2027)]);
  assert.deepEqual(t, [
    ["35 años", "67 años @2027", "67 años @2027"],
    ["37 años", "66 años y 6 meses @2027", "66 años y 6 meses @2027"],
    ["38 años", "65 años y 3 meses @2026 | 65 años y 6 meses @2027", "65 años y 6 meses @2027"],
    ["38 años y 3 meses", "65 años @2026", "65 años y 3 meses @2027"],
    ["38 años y 6 meses", "65 años @2026", "65 años @2027"],
    ["39 años", "65 años @2026", "65 años @2027"],
    ["40 años", "65 años @2026", "65 años @2027"],
  ]);
  const es = byContributionCopy("es");
  assert.match(es.intro, /con 35 años cotizados a los 65 en 2026, los 66 años y 10 meses llegan en 2027 o 2028, cuando ya se piden 67 años;/);
  assert.equal(es.faq[0]!.q, "¿Me puedo jubilar a los 65 con 39 años cotizados?");
  assert.match(byContributionCopy("ca").faq[1]!.a, /^38 anys i 6 mesos si fas 65 anys el 2027 o després/);
  assert.match(byContributionCopy("en").faq[0]!.a, /^Yes, with no cut: from 2027 you need 38 years and 6 months/);
});
