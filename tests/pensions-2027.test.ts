import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { PAY_DATES } from "../src/lib/content/batch02/pay-dates.ts";
import { CALCULATORS, CALCULATORS_ROOT } from "../src/lib/programmatic/calculators/paths.ts";
import { CALC_COPY, MINIMUM_LABEL, PENSION_LOCALES, pensionEditions, pensionPath, percentText } from "../src/lib/programmatic/pensions-2027/copy.ts";
import { DEFAULT_INPUT, monthsBetween, novemberScenarios, perMonth, revaluationStatus, revaluePension, roundedMean, type RateStatus } from "../src/lib/programmatic/pensions-2027/engine.ts";
import { freshnessText, leadText, pensionMeta, pensionSitemapEntries, statusOn } from "../src/lib/programmatic/pensions-2027/page.ts";
import {
  INE_FINAL_DAY,
  INE_FLASH_DAY,
  MINIMUMS_2026,
  NORMS,
  NOVEMBER_FLASH,
  OFFICIAL_2027,
  OFFICIAL_DUE,
  PENSION_RULES_AS_OF,
  PNC_2026_ANNUAL,
  QUOTE,
  WINDOW_FROM,
  WINDOW_TO,
  type FlashFigure,
  type Official2027,
} from "../src/lib/programmatic/pensions-2027/rules.ts";
import { loadPensionData } from "../src/lib/programmatic/pensions-2027/server.ts";
import { RENT_SNAPSHOT } from "../src/lib/programmatic/rent-update/data.ts";
import type { SeriesData } from "../src/lib/programmatic/rent-update/ine.ts";
import type { Fetcher } from "../src/lib/programmatic/rent-update/server.ts";

/**
 * "Subida de las pensiones 2027" (lib/programmatic/pensions-2027/): the
 * dated guards, the engine on the INE's published CPI (it must reproduce
 * the official 2024, 2025 and 2026 revaluations), the states the page goes
 * through until the BOE, the server loader's fallback and the pages.
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const IPC: SeriesData = RENT_SNAPSHOT.series.ipc;
const today = () => new Date().toISOString().slice(0, 10);

/** The snapshot's CPI with extra months released (made-up values, for state tests only). */
function withMonths(extra: Record<string, number>, published = "2026-12-15"): SeriesData {
  const points = IPC.points.map((p) => (p.month in extra ? { ...p, value: extra[p.month]!, published: p.published ?? published } : p));
  for (const [month, value] of Object.entries(extra)) if (!points.some((p) => p.month === month)) points.push({ month, value, published });
  return { id: "ipc", points: points.sort((a, b) => (a.month < b.month ? -1 : 1)) };
}

/* -------------------------------------------------------------------------- */
/* Date guards                                                                */
/* -------------------------------------------------------------------------- */

test("date guard: from 28 Nov 2026 the INE's flash CPI for November is typed in (rules.ts NOVEMBER_FLASH)", () => {
  if (today() <= INE_FLASH_DAY) return;
  assert.ok(
    NOVEMBER_FLASH !== null || RENT_SNAPSHOT.series.ipc.points.some((p) => p.month === WINDOW_TO && p.value !== null),
    `The INE published the flash CPI for November 2026 on ${INE_FLASH_DAY}: copy the all-items annual rate from the INE press release (indicador adelantado del IPC) into NOVEMBER_FLASH in src/lib/programmatic/pensions-2027/rules.ts, with its day and URL.`,
  );
});

test("date guard: from 15 Dec 2026 the committed CPI snapshot has November 2026 (the final figure)", () => {
  if (today() < INE_FINAL_DAY) return;
  const nov = RENT_SNAPSHOT.series.ipc.points.find((p) => p.month === WINDOW_TO);
  assert.ok(
    nov && nov.value !== null,
    `The INE released the final November 2026 CPI on ${INE_FINAL_DAY}: run \`npm run rent:snapshot -- build\`, check the 12-month mean on /es/calculadoras/subida-pensiones-2027/, then update docs/SEO_EXPERIMENTS.md.`,
  );
});

test("date guard: from 1 Feb 2027 the 2027 revaluation norm from the BOE is typed in (rules.ts OFFICIAL_2027)", () => {
  if (today() < OFFICIAL_DUE) return;
  assert.ok(
    OFFICIAL_2027 !== null,
    "Find the 2027 revaluation norm in the BOE (real decreto-ley de revalorización, then its real decreto) and fill OFFICIAL_2027 in src/lib/programmatic/pensions-2027/rules.ts: percentage, norm, BOE id, day, URL, the 2027 minimum pensions table and the non-contributory amount. If it is still not out, say so on the page and move OFFICIAL_DUE.",
  );
});

test("rules: dated, quoted, and every norm has a BOE link", () => {
  assert.equal(PENSION_RULES_AS_OF, "2026-11-13");
  assert.equal(WINDOW_FROM, "2025-12");
  assert.equal(WINDOW_TO, "2026-11");
  assert.equal(INE_FLASH_DAY, "2026-11-27");
  assert.equal(INE_FINAL_DAY, "2026-12-15");
  // The final release day is also the one the INE's calendar gives in the snapshot.
  assert.equal(IPC.points.find((p) => p.month === "2026-11")?.published, INE_FINAL_DAY);
  assert.match(QUOTE.art58_2, /valor medio de las tasas de variación interanual .* doce meses previos a diciembre del año anterior\.$/);
  assert.match(QUOTE.art58_3, /no variará/);
  for (const n of Object.values(NORMS)) assert.match(n.url, /^https:\/\/www\.boe\.es\//, n.name);
  if (NOVEMBER_FLASH) {
    assert.equal(NOVEMBER_FLASH.month, WINDOW_TO);
    assert.ok(NOVEMBER_FLASH.published >= INE_FLASH_DAY && /^https:\/\/www\.ine\.es\//.test(NOVEMBER_FLASH.url));
  }
  if (OFFICIAL_2027) assert.match(OFFICIAL_2027.url, /^https:\/\/www\.boe\.es\//);
});

test("rules: the 2026 minimum pensions table (RD 241/2026 anexo I), monthly = annual ÷ 14", () => {
  assert.equal(MINIMUMS_2026.length, 14);
  const ret65 = MINIMUMS_2026.find((m) => m.id === "ret65")!;
  assert.deepEqual([ret65.spouse, ret65.single, ret65.spouseNotDependent], [17_592.4, 13_106.8, 12_441.8]);
  assert.equal(perMonth(17_592.4), 1256.6);
  assert.equal(perMonth(13_106.8), 936.2);
  assert.equal(perMonth(4011), 286.5); // the RD's own «286,50 euros mensuales»
  assert.equal(perMonth(PNC_2026_ANNUAL), 628.8);
  for (const m of MINIMUMS_2026) for (const l of PENSION_LOCALES) assert.ok(MINIMUM_LABEL[l][m.id], `${l} ${m.id}`);
});

/* -------------------------------------------------------------------------- */
/* Engine                                                                     */
/* -------------------------------------------------------------------------- */

test("engine: reproduces the official revaluations from the INE's CPI (2024 3.8 %, 2025 2.8 %, 2026 2.7 % — RDL 3/2026)", () => {
  const year = (y: number) => revaluationStatus(IPC, "2030-01-01", null, null, `${y - 2}-12`, `${y - 1}-11`)!;
  for (const [y, p] of [
    [2024, 3.8],
    [2025, 2.8],
    [2026, 2.7],
  ] as const) {
    const s = year(y);
    assert.equal(s.kind, "final", String(y));
    assert.equal(s.known, 12);
    assert.equal(s.percent, p, String(y));
  }
  assert.ok(Math.abs(year(2026).mean! - 2.6667) < 0.001);
});

test("engine: 13 Nov 2026 is provisional, 11 months, mean 3.47 %, November pending for 15 Dec", () => {
  const s = revaluationStatus(IPC, "2026-11-13", null, null)!;
  assert.equal(s.kind, "provisional");
  assert.equal(s.known, 11);
  assert.deepEqual(
    s.months.map((m) => m.month),
    monthsBetween("2025-12", "2026-11"),
  );
  assert.deepEqual(s.months.at(-1), { month: "2026-11", value: null, published: "2026-12-15" });
  assert.deepEqual(
    s.months.slice(0, 11).map((m) => m.value),
    [2.9, 2.3, 2.3, 3.4, 3.2, 3.2, 3.2, 3.6, 4.3, 4.9, 4.9],
  );
  assert.ok(Math.abs(s.mean! - 38.2 / 11) < 1e-9);
  assert.equal(s.percent, 3.47);
  assert.equal(percentText(s, "es"), "3,47 %");
  // With no flash typed in and no BOE norm, the page itself is provisional on that day.
  if (!NOVEMBER_FLASH && !OFFICIAL_2027) assert.equal(statusOn(IPC, "2026-11-13")?.kind, "provisional");
});

test("engine: the flash, final and official states", () => {
  const flash: FlashFigure = { month: "2026-11", value: 4.5, published: "2026-11-27", url: "https://www.ine.es/x.pdf" };
  // Before the flash day the flash is ignored.
  assert.equal(revaluationStatus(IPC, "2026-11-26", flash, null)!.kind, "provisional");
  const f = revaluationStatus(IPC, "2026-11-27", flash, null)!;
  assert.equal(f.kind, "flash");
  assert.equal(f.percent, 3.6); // (38.2 + 4.5) / 12 = 3.558 → 3.6
  assert.equal(percentText(f, "en"), "3.6%");

  const fin = revaluationStatus(withMonths({ "2026-11": 4.2 }), "2026-12-15", flash, null)!;
  assert.equal(fin.kind, "final");
  assert.equal(fin.percent, 3.5); // 42.4 / 12 = 3.533
  // A flash that is not November, or with two months missing, never counts.
  assert.equal(revaluationStatus(IPC, "2026-11-28", { ...flash, month: "2026-10" }, null)!.kind, "provisional");

  const official: Official2027 = { percent: 3.5, norm: "Real Decreto-ley 99/2026", boeId: "BOE-A-2026-0", published: "2026-12-30", url: "https://www.boe.es/x", minimums: null, pncAnnual: null };
  assert.equal(revaluationStatus(IPC, "2026-12-29", null, official)!.kind, "provisional");
  const o = revaluationStatus(IPC, "2026-12-30", null, official)!;
  assert.equal(o.kind, "official");
  assert.equal(o.percent, 3.5);
  assert.equal(o.mean, null); // November not in this series
});

test("engine: a negative mean leaves pensions unchanged (art. 58.3); rounding is half up on exact tenths", () => {
  const neg = withMonths(Object.fromEntries(monthsBetween("2025-12", "2026-11").map((m) => [m, -0.5])));
  const s = revaluationStatus(neg, "2026-12-20", null, null)!;
  assert.equal(s.kind, "final");
  assert.equal(s.negative, true);
  assert.equal(s.percent, 0);
  assert.equal(roundedMean(426, 12), 3.6); // 3.55 → 3.6
  assert.equal(roundedMean(425, 12), 3.5);
  assert.equal(roundedMean(-426, 12), -3.6);
});

test("engine: which November figures give which rounded mean (arithmetic, not a forecast)", () => {
  const s = revaluationStatus(IPC, "2026-11-13", null, null)!;
  assert.deepEqual(novemberScenarios(s), [
    { percent: 3.3, from: null, to: 1.9 },
    { percent: 3.4, from: 2, to: 3.1 },
    { percent: 3.5, from: 3.2, to: 4.3 },
    { percent: 3.6, from: 4.4, to: 5.5 },
    { percent: 3.7, from: 5.6, to: null },
  ]);
  // Each boundary checked against the mean itself.
  for (const row of novemberScenarios(s)) {
    for (const nov of [row.from, row.to]) if (nov !== null) assert.equal(roundedMean(382 + Math.round(nov * 10), 12), row.percent, `${nov}`);
  }
  const fin = revaluationStatus(withMonths({ "2026-11": 4.2 }), "2026-12-15", null, null)!;
  assert.deepEqual(novemberScenarios(fin), []);
});

test("engine: a pension revalued, per month and per year", () => {
  const r = revaluePension(DEFAULT_INPUT, 3.47);
  assert.equal(r.status, "ok");
  if (r.status !== "ok") return;
  assert.equal(r.monthly2027, 1034.7);
  assert.equal(r.monthlyRise, 34.7);
  assert.equal(r.annual2026, 14_000);
  assert.equal(r.annual2027, 14_485.8);
  assert.equal(r.annualRise, 485.8);
  assert.deepEqual(r.notes, ["minimums"]);

  const twelve = revaluePension({ monthly: 1500, payments: 12 }, 2.7);
  assert.ok(twelve.status === "ok" && twelve.monthly2027 === 1540.5 && twelve.annual2027 === 18_486);
  const high = revaluePension({ monthly: 3400, payments: 14 }, 3.6);
  assert.ok(high.status === "ok" && high.notes.includes("above-max") && !high.notes.includes("minimums"));
  const cents = revaluePension({ monthly: 936.2, payments: 14 }, 3.6);
  assert.ok(cents.status === "ok" && cents.monthly2027 === 969.9); // 936.2 × 1.036 = 969.8992

  for (const bad of [0, -5, Number.NaN, 25_000]) assert.equal(revaluePension({ monthly: bad, payments: 14 }, 3).status, "invalid", String(bad));
  assert.equal(revaluePension({ monthly: 1000, payments: 13 as 14 }, 3).status, "invalid");
});

/* -------------------------------------------------------------------------- */
/* Server loader                                                              */
/* -------------------------------------------------------------------------- */

/** A fake INE answering with the snapshot's CPI, optionally plus November. */
function fakeIne(opts: { fail?: boolean; november?: number } = {}): Fetcher {
  return async (url: string) => {
    if (opts.fail) throw new Error("offline");
    const pts = IPC.points.map((p) => (p.month === "2026-11" && opts.november !== undefined ? { ...p, value: opts.november } : p));
    const body = url.includes("DATOS_SERIE")
      ? { Data: pts.filter((p) => p.value !== null).map((p) => ({ Anyo: Number(p.month.slice(0, 4)), FK_Periodo: Number(p.month.slice(5)), Valor: p.value, Secreto: false })) }
      : pts.map((p) => ({ Nombre: `Índice de Precios de Consumo. ${p.month}`, Anyo: Number(p.month.slice(0, 4)), FK_Periodo: Number(p.month.slice(5)), Fecha: Date.parse(`${p.published}T08:00:00Z`) }));
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  };
}

test("server: live INE answer is used, November shows up on its release day; a failure falls back to the snapshot", async () => {
  const live = await loadPensionData(new Date("2026-11-13T12:00:00Z"), fakeIne());
  assert.equal(live.live, true);
  assert.equal(live.today, "2026-11-13");
  assert.equal(revaluationStatus(live.ipc, live.today, null, null)!.known, 11);

  // On 15 Dec the INE answers with November: final, with no deploy.
  const dec = await loadPensionData(new Date("2026-12-15T10:00:00Z"), fakeIne({ november: 4.2 }));
  const s = revaluationStatus(dec.ipc, dec.today, null, null)!;
  assert.equal(s.kind, "final");
  assert.equal(s.percent, 3.5);
  // The day before, the same answer is not shown (release-day guard).
  const early = await loadPensionData(new Date("2026-12-14T10:00:00Z"), fakeIne({ november: 4.2 }));
  assert.equal(revaluationStatus(early.ipc, early.today, null, null)!.kind, "provisional");

  const down = await loadPensionData(new Date("2026-11-13T12:00:00Z"), fakeIne({ fail: true }));
  assert.equal(down.live, false);
  assert.equal(down.readAt, RENT_SNAPSHOT.fetchedAt);
  assert.deepEqual(down.ipc, IPC);
  assert.match(freshnessText("es", down.live, down.today, down.snapshotAsOf), /nuestra copia el 13 de noviembre de 2026/);
});

/* -------------------------------------------------------------------------- */
/* Words and pages                                                            */
/* -------------------------------------------------------------------------- */

const PROV = revaluationStatus(IPC, "2026-11-13", null, null)!;

test("page: the lead states the rule, the provisional mean, the example and the INE's two November days, in three languages", () => {
  const es = leadText("es", PROV, "2026-11-13");
  assert.match(es, /media el IPC de diciembre de 2025 a noviembre de 2026 \(art\. 58/);
  assert.match(es, /Con los 11 meses que ha publicado el INE, la media es del 3,47 %: una pensión de 1\.000,00 € al mes pasaría a 1\.034,70 €/);
  assert.match(es, /Es provisional: falta el IPC de noviembre de 2026, que el INE publica adelantado el 27 de noviembre de 2026 y definitivo el 15 de diciembre de 2026\./);
  const ca = leadText("ca", PROV, "2026-11-13");
  assert.match(ca, /la mitjana és del 3,47 %/);
  assert.match(ca, /avançat el 27 de novembre de 2026 i definitiu el 15 de desembre de 2026/);
  const en = leadText("en", PROV, "2026-11-13");
  assert.match(en, /the average is 3\.47%: a pension of €1,000\.00 a month would become €1,034\.70/);
  assert.match(en, /flash estimate on 27 November 2026 and the final figure on 15 December 2026/);
  // After the flash day (and before it is typed in) the lead says it is out.
  assert.match(leadText("es", PROV, "2026-11-28"), /cuyo dato adelantado publicó el INE el 27 de noviembre de 2026/);

  const flash = revaluationStatus(IPC, "2026-11-27", { month: "2026-11", value: 4.5, published: "2026-11-27", url: "https://www.ine.es/x" }, null)!;
  assert.match(leadText("es", flash, "2026-11-27"), /adelantado de noviembre \(4,5 %, INE, 27 de noviembre de 2026\).*subida del 3,6 %/);
  const fin = revaluationStatus(withMonths({ "2026-11": 4.2 }), "2026-12-15", null, null)!;
  assert.match(leadText("es", fin, "2026-12-15"), /Con los 12 datos definitivos del INE, la subida es del 3,5 %.*Falta que el Gobierno lo apruebe en el BOE/);
});

test("page: titles carry where the figure stands, within Google's length", () => {
  assert.equal(pensionMeta("es", PROV).title, "Subida pensiones 2027: 3,47 % provisional (falta noviembre)");
  assert.equal(pensionMeta("ca", PROV).title, "Pujada pensions 2027: 3,47 % provisional (falta novembre)");
  assert.equal(pensionMeta("en", PROV).title, "Spain pension increase 2027: 3.47% provisional (Nov missing)");
  const states: (RateStatus | null)[] = [
    PROV,
    revaluationStatus(IPC, "2026-11-27", { month: "2026-11", value: 4.5, published: "2026-11-27", url: "https://www.ine.es/x" }, null),
    revaluationStatus(withMonths({ "2026-11": 4.2 }), "2026-12-15", null, null),
    revaluationStatus(IPC, "2027-01-01", null, { percent: 3.5, norm: "Real Decreto-ley 1/2027", boeId: "BOE-A-2027-1", published: "2026-12-31", url: "https://www.boe.es/x", minimums: null, pncAnnual: null }),
    null,
  ];
  for (const s of states)
    for (const l of PENSION_LOCALES) {
      const m = pensionMeta(l, s);
      assert.ok(m.title.length <= 62, `${l} ${s?.kind}: ${m.title} (${m.title.length})`);
      assert.ok(m.description.length <= 230, `${l}: ${m.description.length}`);
    }
});

test("copy: every calculator string exists in three languages and the basis says provisional", () => {
  for (const l of PENSION_LOCALES) {
    const t = CALC_COPY[l];
    for (const k of ["provisional", "flash", "final", "official"] as const) {
      assert.ok(t.rateLabel({ ...PROV, kind: k }).length > 5, `${l} ${k}`);
      assert.ok(t.basis({ ...PROV, kind: k }, "x").length > 20, `${l} ${k}`);
    }
  }
  assert.match(CALC_COPY.es.basis(PROV, "3,47 %"), /No es la cifra oficial/);
});

test("routes: one static folder per language under the calculators root, registry entry, sitemap with hreflang, pay-dates links both ways", () => {
  assert.deepEqual(pensionEditions(), {
    es: "/es/calculadoras/subida-pensiones-2027/",
    ca: "/ca/calculadores/pujada-pensions-2027/",
    en: "/en/calculators/spain-pension-increase-2027/",
  });
  assert.ok(CALCULATORS.some((c) => c.id === "pensions-2027"));
  for (const l of PENSION_LOCALES) {
    assert.ok(pensionPath(l).startsWith(`/${l}/${CALCULATORS_ROOT[l]}/`));
    const dir = join(APP, ...pensionPath(l).split("/").filter(Boolean).slice(1));
    const page = readFileSync(join(dir, "page.tsx"), "utf8");
    assert.match(page, new RegExp(`const LOCALE = "${l}"`));
    assert.match(page, /export const revalidate = 86400;/);
    assert.match(page, /export const dynamicParams = true;/);
    assert.ok(!existsSync(join(dir, "..", "page.tsx")), `${pensionPath(l)}: a calculators hub page exists`);
  }
  const entries = pensionSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) {
    assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
    assert.ok(String(e.alternates!.languages!["x-default"]).endsWith("/en/calculators/spain-pension-increase-2027/"));
  }
  assert.match(readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8"), /\.\.\.pensionSitemapEntries\(\)/);
  assert.match(readFileSync(join(ROOT, "src/lib/programmatic/pensions-2027/server.ts"), "utf8"), /SERVER_REVALIDATE_SECONDS = 86_400;/);
  // Pay-dates guide → calculator, in each language; calculator → pay-dates guide.
  for (const l of PENSION_LOCALES) assert.ok(JSON.stringify(PAY_DATES.editions[l].blocks).includes(`](${pensionPath(l)})`), l);
  assert.match(readFileSync(join(ROOT, "src/components/programmatic/pensions-2027/PensionPage.tsx"), "utf8"), /PAY_DATES_PATH\[locale\]/);
});
