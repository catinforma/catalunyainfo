import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";

import { CALC_COPY as BONO_COPY } from "../src/lib/programmatic/bono-social/copy.ts";
import * as bonoRules from "../src/lib/programmatic/bono-social/rules.ts";
import { calcEditions } from "../src/lib/programmatic/calculators/paths.ts";
import * as employment from "../src/lib/programmatic/employment/rules.ts";
import { CALC_COPY, IPREM_LOCALES, LIMIT_LABEL, ipremEditions, ipremPath, money, times } from "../src/lib/programmatic/iprem/copy.ts";
import { commonLimits, floor2, incomeInIprem, multipleOf, riseOver, withinLimit, yearlyIprem } from "../src/lib/programmatic/iprem/engine.ts";
import { bonoSocialRows, historyNote, historyRows, housingRows, ipremFaq, ipremMeta, ipremSitemapEntries, leadText, legalAidRows, multiplesTable, unemploymentRows } from "../src/lib/programmatic/iprem/page.ts";
import {
  IPREM_14,
  IPREM_ANNUAL,
  IPREM_CURRENT,
  IPREM_DAILY,
  IPREM_LAWS,
  IPREM_MONTHLY,
  IPREM_RECHECK_FROM,
  IPREM_RULES_AS_OF,
  IPREM_YEAR,
  IPREM_YEARS,
  LAW_2023,
  QUOTE,
  SOURCES,
  STATUS_2027,
  lawUrl,
} from "../src/lib/programmatic/iprem/rules.ts";
import * as subsidy from "../src/lib/programmatic/unemployment-subsidy/rules.ts";
import { liveTools } from "../src/lib/seo/llms.ts";

/**
 * "IPREM 2026" (lib/programmatic/iprem/): the date guard, every figure
 * against the BOE's own text (tests/fixtures/boe-iprem-provisions.json, the
 * verbatim passages read on 18 Nov 2026), the one-source refactor (the paro,
 * subsidy, bono social and pensions modules read the IPREM from
 * iprem/rules.ts and print exactly what they printed before), the
 * calculator, the page and its routes and links.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);

interface Fixture {
  laws: { boeId: string; title: string; published: string; inForce: string; text: string }[];
  quotes: Record<string, { url: string; text: string }>;
}
const FIX: Fixture = JSON.parse(read("tests/fixtures/boe-iprem-provisions.json"));
/** The BOE writes the LGP's quotation marks as ‘‘ ’’; the page prints « ». */
const norm = (s: string) => s.replace(/‘‘/g, "«").replace(/’’/g, "»");

/** "15,35", "460,50", "5.526", "7.131,80": as the BOE writes euros. */
function boeEuros(n: number): string {
  const [int, frac] = n.toFixed(2).split(".") as [string, string];
  const g = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return frac === "00" ? g : `${g},${frac}`;
}
const iso = (yyyymmdd: string) => `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;

/* -------------------------------------------------------------------------- */
/* Date guard                                                                 */
/* -------------------------------------------------------------------------- */

test(`date guard (RECHECK): from ${IPREM_RECHECK_FROM} the ${IPREM_YEAR + 1} IPREM is re-read`, () => {
  assert.ok(
    today() < IPREM_RECHECK_FROM,
    `It is ${today()}: re-read the ${IPREM_YEAR + 1} IPREM. Search the BOE for a "Ley de Presupuestos Generales del Estado para el año ${IPREM_YEAR + 1}" (or any rule fixing the IPREM) and read SEPE "Cuantías anuales" (${SOURCES.sepe.url}). New amounts: add the law to IPREM_LAWS (and its passage to tests/fixtures/boe-iprem-provisions.json), point IPREM_CURRENT at it. Still extended: add an "extended" row for ${IPREM_YEAR + 1} to IPREM_YEARS (quoted only if SEPE prints the year's figure), move IPREM_CURRENT.year, STATUS_2027 and IPREM_RECHECK_FROM. Then check the paro, subsidy, bono social and pensions pages (they read the same module) and the llms/hub copy.`,
  );
});

/* -------------------------------------------------------------------------- */
/* The figures against the BOE                                                */
/* -------------------------------------------------------------------------- */

test("history: every law's amounts, BOE id, dates and provision are the BOE text's own", () => {
  assert.equal(IPREM_LAWS.length, FIX.laws.length);
  for (const law of IPREM_LAWS) {
    const f = FIX.laws.find((x) => x.boeId === law.boeId);
    assert.ok(f, `${law.year}: ${law.boeId} not in the fixture`);
    assert.equal(iso(f.published), law.published, `${law.year}: published`);
    assert.equal(iso(f.inForce), law.inForce, `${law.year}: in force`);
    assert.ok(f.title.startsWith(law.norm), `${law.year}: title "${f.title}" vs "${law.norm}"`);
    assert.ok(f.title.startsWith(law.short), `${law.year}: short`);
    const t = f.text;
    // a) to c), as each act words them ("El IPREM diario, 20 euros", "EL IPREM diario: 15,66 euros").
    assert.match(t, new RegExp(`IPREM diario[,:] ${boeEuros(law.daily).replace(".", "\\.")} euros`, "i"), `${law.year}: daily ${law.daily}`);
    assert.match(t, new RegExp(`IPREM mensual[,:] ${boeEuros(law.monthly).replace(".", "\\.")} euros`), `${law.year}: monthly ${law.monthly}`);
    assert.match(t, new RegExp(`IPREM anual[,:] ${boeEuros(law.annual).replace(".", "\\.")} euros`), `${law.year}: annual ${law.annual}`);
    // d): the 14-payment figure ("será de 8.400 euros cuando …"), then the 12-payment one again.
    assert.ok(t.includes(`será de ${boeEuros(law.annual14)} euros cuando las correspondientes normas se refieran al salario mínimo interprofesional en cómputo anual`), `${law.year}: annual14 ${law.annual14}`);
    assert.ok(t.endsWith(`la cuantía será de ${boeEuros(law.annual)} euros.`) || law.year === 2004, `${law.year}: closing figure`);
    // The year the act fixes ("durante 2023"; Ley 3/2017 says "durante la vigencia de esta ley"; RDL 3/2004 "entre el 1 de julio y el 31 de diciembre de 2004").
    if (law.year === 2004) assert.match(t, /entre el 1 de julio y el 31 de diciembre de 2004/);
    else if (law.year === 2017) assert.match(t, /durante la vigencia de esta ley/);
    else assert.ok(t.includes(`durante ${law.year}`), `${law.year}: "durante ${law.year}"`);
    // The provision named where the act's text starts (budget acts) or "artículo 2.2" (RDL 3/2004).
    if (law.year > 2004) {
      const ordinal = law.provision.replace(/^disposición adicional /, "");
      const head = t.slice(0, 80).toLowerCase().replace("décima cuarta", "decimocuarta").replace("décima novena", "decimonovena");
      assert.ok(head.includes(ordinal), `${law.year}: "${ordinal}" in "${t.slice(0, 80)}"`);
    } else assert.match(t, /2\. Anualmente, en la Ley de Presupuestos Generales del Estado/);
    assert.equal(lawUrl(law), `https://www.boe.es/buscar/doc.php?id=${law.boeId}`);
  }
  // Oldest first, one per year; the daily figure is the monthly ÷ 30 (to the cent).
  for (let i = 1; i < IPREM_LAWS.length; i++) assert.ok(IPREM_LAWS[i]!.year > IPREM_LAWS[i - 1]!.year);
  for (const l of IPREM_LAWS) {
    assert.ok(Math.abs(l.daily - l.monthly / 30) < 0.006, `${l.year}: daily`);
    // The acts round on their own: 2009 prints 6.326,86 for 527,24 × 12 = 6.326,88, 2017–2018 6.454,03 for 6.454,08. The law's figure is kept.
    assert.ok(Math.abs(l.annual - l.monthly * 12) < 0.06, `${l.year}: annual ≈ 12 × monthly`);
  }
  // The 14-payment figure is the law's, not monthly × 14: 2008 says 7.131,80 (509,40 × 14 = 7.131,60).
  assert.equal(IPREM_LAWS.find((l) => l.year === 2008)!.annual14, 7131.8);
});

test("years: 2004–2026 without a gap; extended budgets in 2019, 2020, 2024, 2025 and 2026; only 2026 has a quoted figure", () => {
  assert.deepEqual(IPREM_YEARS.map((r) => r.year), Array.from({ length: 23 }, (_, i) => 2004 + i));
  const ext = IPREM_YEARS.filter((r) => r.kind === "extended");
  assert.deepEqual(ext.map((r) => r.year), [2019, 2020, 2024, 2025, 2026]);
  for (const r of ext) if (r.kind === "extended") assert.equal(r.extends.year, r.year <= 2020 ? 2018 : 2023, `${r.year}`);
  assert.deepEqual(ext.filter((r) => r.kind === "extended" && r.quoted).map((r) => r.year), [2026]);
  const rows = historyRows();
  for (const r of rows) {
    if ([2019, 2020, 2024, 2025].includes(r.year)) assert.equal(r.amounts, null, `${r.year} must stay blank`);
    else assert.ok(r.amounts, `${r.year}`);
  }
  // Rises: 2021 over 2018 (the last year with a figure), none for blanks; 2011 is flat.
  const rise = (y: number) => rows.find((r) => r.year === y)!.rise;
  assert.equal(rise(2004), null);
  assert.equal(rise(2011), 0);
  assert.ok(Math.abs(rise(2021)! - riseOver({ monthly: 537.84 }, { monthly: 564.9 })!) < 1e-9);
  assert.equal(rise(2026), null);
  for (const l of IPREM_LOCALES) {
    assert.match(historyNote(rows.find((r) => r.year === 2020)!, l)!, /2018/);
    assert.match(historyNote(rows.find((r) => r.year === 2026)!, l)!, /Ley 31\/2022/);
    assert.match(historyNote(rows.find((r) => r.year === 2017)!, l)!, /2016/);
    assert.equal(historyNote(rows.find((r) => r.year === 2023)!, l), null);
  }
});

test(`${IPREM_YEAR}: the 2023 act's amounts (20 / 600 / 7.200 / 8.400 €), extended, as SEPE prints them`, () => {
  assert.equal(LAW_2023.boeId, "BOE-A-2022-22128");
  assert.deepEqual({ y: IPREM_YEAR, d: IPREM_DAILY, m: IPREM_MONTHLY, a: IPREM_ANNUAL, a14: IPREM_14 }, { y: 2026, d: 20, m: 600, a: 7200, a14: 8400 });
  assert.equal(IPREM_CURRENT.law, LAW_2023);
  assert.ok(IPREM_CURRENT.extended);
  const sepe = FIX.quotes.sepe2026!.text;
  assert.ok(sepe.includes(QUOTE.sepe));
  assert.match(sepe, /IPREM MENSUAL 1\.221,00 € 600,00 € ANUA ?L 17\.094,00 € \(14 pagas\) 7\.200,00 €/);
  assert.equal(yearlyIprem(12), 7200);
  assert.equal(yearlyIprem(14), 8400);
});

test("quotes: every quote is verbatim in the official text it cites", () => {
  const law = (id: string) => FIX.laws.find((l) => l.boeId === id)!.text;
  const q = (k: string) => norm(FIX.quotes[k]!.text);
  const where: Record<keyof typeof QUOTE, string> = {
    created: law("BOE-A-2004-12010"),
    yearly: law("BOE-A-2004-12010"),
    replacesSmi: law("BOE-A-2004-12010"),
    da90: law("BOE-A-2022-22128"),
    da90d: law("BOE-A-2022-22128"),
    ce134: q("ce134"),
    lgp38: q("lgp38"),
    sepe: q("sepe2026"),
    dissolved: q("rd806"),
    constitutive: q("rd806art5"),
    legalAid: q("ley1996art3"),
    legalAidExceptional: q("ley1996art5"),
    legalAidGencat: q("gencatAjg"),
    housingBase: q("rd326art8"),
    housingRent: q("rd326art116"),
    subsidy: q("lgss278"),
    subsidy52: q("lgss280"),
    subsidyIncome: q("lgss275"),
    benefitLimits: q("lgss270"),
    benefitSixth: q("lgss270sixth"),
  };
  for (const [k, text] of Object.entries(QUOTE)) assert.ok(where[k as keyof typeof QUOTE].includes(text), `${k}: not verbatim`);
  // The 2027 facts come from the decree itself.
  assert.match(q("rd806"), /celebrarán el domingo 29 de noviembre de 2026/);
  assert.equal(STATUS_2027.dissolution.elections, "2026-11-29");
  assert.equal(STATUS_2027.dissolution.constitutive, "2026-12-23");
  assert.equal(STATUS_2027.budgetActInBoe, false);
  assert.ok(STATUS_2027.checked <= today());
  assert.equal(IPREM_RULES_AS_OF, "2026-11-18");
});

/* -------------------------------------------------------------------------- */
/* One source: every IPREM user reads iprem/rules.ts, outputs unchanged      */
/* -------------------------------------------------------------------------- */

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });
}

test("one source: no module but iprem/rules.ts types an IPREM amount; every user imports it", () => {
  const src = walk(join(ROOT, "src"));
  const own = join(ROOT, "src/lib/programmatic/iprem/rules.ts");
  for (const file of src) {
    if (file === own) continue;
    const code = readFileSync(file, "utf8");
    assert.doesNotMatch(code, /\b(export\s+)?const\s+IPREM_(MONTHLY|DAILY|ANNUAL|14)\s*=/, `${relative(ROOT, file)} defines its own IPREM`);
    // No IPREM amount typed in a string: "IPREM 600 €", "IPREM de 14 pagas (8.400 €)", "600 EUR IPREM".
    const strings = code.replace(/\/\*[^]*?\*\/|^\s*\/\/.*$/gm, "");
    assert.doesNotMatch(strings, /IPREM[^\n"`]{0,40}(\b600 ?(€|EUR|euros)|€600\b|8\.400 ?€|€8,400|8,400 euros|7\.200 ?€|€7,200)|\b600 (EUR|€) IPREM/, `${relative(ROOT, file)} types an IPREM amount`);
  }
  for (const file of [
    "src/lib/programmatic/employment/rules.ts",
    "src/lib/programmatic/unemployment-subsidy/rules.ts",
    "src/lib/programmatic/bono-social/rules.ts",
    "src/lib/programmatic/bono-social/engine.ts",
    "src/lib/programmatic/bono-social/page.ts",
    "src/components/programmatic/bono-social/BonoSocialPage.tsx",
    "src/components/programmatic/unemployment-subsidy/SubsidyPage.tsx",
    "src/components/programmatic/pensions-2027/PensionPage.tsx",
    "src/components/programmatic/employment/UnemploymentPage.tsx",
    "src/lib/seo/llms.ts",
  ]) {
    assert.match(read(file), /from "@\/lib\/programmatic\/iprem\/rules"/, file);
  }
});

test("one source: the paro, subsidy, bono social and pensions modules give exactly what they gave before", () => {
  // The re-exports are the shared module's values.
  assert.equal(employment.IPREM_MONTHLY, IPREM_MONTHLY);
  assert.equal(subsidy.IPREM_MONTHLY, IPREM_MONTHLY);
  assert.equal(bonoRules.IPREM_MONTHLY, IPREM_MONTHLY);
  assert.equal(bonoRules.IPREM_14, IPREM_14);
  // Values as before the refactor (18 Nov 2026).
  assert.equal(employment.IPREM_MONTHLY, 600);
  assert.equal(employment.IPREM_PLUS_SIXTH, 700);
  assert.equal(bonoRules.IPREM_14, 8400);
  assert.deepEqual([0.95, 0.9, 0.8].map(subsidy.monthlyAmount), [570, 540, 480]);
  assert.equal(subsidy.monthlyAmount(subsidy.OVER52_SHARE), 480);
  assert.equal(bonoRules.SOURCES.sepe.ref, "IPREM 2026: 600 € al mes, fijado en la Ley 31/2022");
  assert.equal(subsidy.SOURCES.pge2023.name, "Ley 31/2022, PGE 2023, DA 90ª (IPREM 600 €, prorrogada)");
  // The bono social checker's words, unchanged.
  assert.equal(BONO_COPY.es.specialLegend, "Circunstancias especiales (suman 8.400 € al límite)");
  assert.equal(BONO_COPY.ca.specialLegend, "Circumstàncies especials (sumen 8.400 € al límit)");
  assert.equal(BONO_COPY.en.specialLegend, "Special circumstances (add €8,400 to the limit)");
  assert.equal(BONO_COPY.es.multiplier("1,5"), "Tu límite de ingresos es 1,5 veces el IPREM de 14 pagas (8.400 €).");
  assert.equal(BONO_COPY.ca.multiplier("1,5"), "El teu límit d'ingressos és 1,5 vegades l'IPREM de 14 pagues (8.400 €).");
  assert.equal(BONO_COPY.en.multiplier("1.5"), "Your income limit is 1.5 times the 14-payment IPREM (€8,400).");
  // llms.txt, unchanged where it already quoted the IPREM.
  const llms = JSON.stringify(liveTools());
  for (const s of ["the 2026 minimum and maximum by children (IPREM 600 €)", "amounts 95/90/80% of the 600 EUR IPREM = 570/540/480 EUR", "1.5 times the 14-payment IPREM (8,400 euros: 12,600 euros alone"]) assert.ok(llms.includes(s), s);
});

/* -------------------------------------------------------------------------- */
/* Calculator                                                                 */
/* -------------------------------------------------------------------------- */

test("calculator: multiples on the month, the day and the year in 12 and 14 payments", () => {
  const r = multipleOf(1.5);
  assert.equal(r.status, "ok");
  if (r.status !== "ok") return;
  assert.deepEqual({ m: r.monthly, d: r.daily, a12: r.annual12, a14: r.annual14 }, { m: 900, d: 30, a12: 10800, a14: 12600 });
  const two = multipleOf(2.5);
  assert.ok(two.status === "ok" && two.annual12 === 18000 && two.annual14 === 21000);
  const third = multipleOf(0.33);
  assert.ok(third.status === "ok" && third.monthly === 198 && third.annual14 === 2772);
  for (const bad of [0, -1, Number.NaN, 101]) assert.equal(multipleOf(bad).status, "invalid", String(bad));
  assert.equal(multipleOf(100).status, "ok");
});

test("calculator: income in IPREM, rounded down, against the common limits (equal is within)", () => {
  const r = incomeInIprem(14_400);
  assert.ok(r.status === "ok");
  if (r.status !== "ok") return;
  assert.equal(r.times12, 2);
  assert.equal(floor2(r.times14), 1.71);
  assert.equal(floor2(21_599 / 7200), 2.99);
  assert.equal(incomeInIprem(-5).status, "invalid");
  assert.equal(incomeInIprem(0).status, "ok");
  const limits = commonLimits();
  assert.deepEqual(
    limits.map((l) => [l.id, l.multiple, l.payments, l.amount]),
    [
      ["bono-social-alone", 1.5, 14, 12600],
      ["legal-aid-alone", 2, 12, 14400],
      ["legal-aid-under4", 2.5, 12, 18000],
      ["legal-aid-from4", 3, 12, 21600],
      ["housing-rent", 5, 14, 42000],
      ["legal-aid-exceptional", 5, 12, 36000],
    ],
  );
  assert.ok(withinLimit(14_400, limits[1]!));
  assert.ok(!withinLimit(14_400.01, limits[1]!));
  for (const l of IPREM_LOCALES) for (const lim of limits) assert.ok(LIMIT_LABEL[lim.id][l].length > 0);
  // Bono social limit alone = the bono social module's own figure.
  assert.equal(limits[0]!.amount, bonoSocialRows()[0]!.vulnerable);
});

test("calculator copy: complete in es, ca and en, figures from the shared module", () => {
  for (const l of IPREM_LOCALES) {
    const t = CALC_COPY[l];
    assert.ok(t.paymentOptions["12"].includes(money(IPREM_ANNUAL, l)), l);
    assert.ok(t.paymentOptions["14"].includes(money(IPREM_14, l)), l);
    assert.ok(t.ratio(14, money(IPREM_14, l)).includes(money(IPREM_14, l)));
    for (const v of Object.values(t)) if (typeof v === "string") assert.ok(v.trim().length > 0, l);
  }
  assert.equal(times(1.5, "es"), "1,5");
  assert.equal(times(2, "ca"), "2");
  assert.equal(times(2.25, "en"), "2.25");
  const calc = read("src/components/programmatic/iprem/IpremCalculator.tsx");
  assert.match(calc, /^"use client";/);
  assert.match(calc, /useCalculatorUse\("iprem"/);
});

/* -------------------------------------------------------------------------- */
/* Thresholds                                                                 */
/* -------------------------------------------------------------------------- */

test("thresholds: legal aid on the 12-payment IPREM = the Generalitat's euros; housing and bono social on the 14-payment one", () => {
  assert.deepEqual(legalAidRows().map((r) => r.amount), [14400, 18000, 21600, 36000]);
  const gencat = FIX.quotes.gencatAjg!.text;
  for (const r of legalAidRows()) assert.ok(gencat.includes(`${boeEuros(r.amount)} €`), `${r.id}: ${r.amount}`);
  assert.match(FIX.quotes.ley1996art3!.text, /a\) Dos veces .* b\) Dos veces y media .* c\) El triple/);
  assert.deepEqual(housingRows().map((r) => r.amount), [42000, 46200, 50400]);
  assert.match(QUOTE.housingBase, /referido a 14 pagas/);
  assert.match(QUOTE.housingRent, /5 veces el IPREM.*5,5 veces el IPREM.*6 veces el IPREM/);
  assert.deepEqual(bonoSocialRows().map((r) => [r.adults, r.minors, r.multiplier, r.vulnerable, r.severe]), [
    [1, 0, 1.5, 12600, 6300],
    [2, 0, 1.8, 15120, 7560],
    [1, 1, 2, 16800, 8400],
    [2, 1, 2.3, 19320, 9660],
    [2, 2, 2.8, 23520, 11760],
  ]);
});

test("thresholds: subsidy 570 / 540 / 480 €, over-52 480 €, paro 560–1.575 € (SEPE); the subsidy's income test is 75 % of the SMI, not the IPREM", () => {
  const u = unemploymentRows();
  assert.deepEqual(u.subsidy.map((b) => b.monthly), [570, 540, 480]);
  assert.equal(u.over52.monthly, 480);
  assert.equal(u.sixth, 700);
  assert.deepEqual([u.min.none, u.min.children, u.max.none, u.max.one, u.max.two], [560, 749, 1225, 1400, 1575]);
  const sepe = FIX.quotes.sepe2026!.text;
  for (const s of ["Sin hijos/as 560,00 €", "1 hijo/a o más 749,00 €", "Sin hijos/as 1.225,00 €", "1 hijo/a 1.400,00 €", "2 hijos/as o más 1.575,00 €", "570,00 540,00 480,00", "(80 % IPREM) 480,00"]) assert.ok(sepe.includes(s), s);
  assert.equal(u.incomeLimit, 915.75);
  assert.ok(FIX.quotes.sepeIncome!.text.includes("75% SMI 915,75 €"));
  assert.match(QUOTE.subsidyIncome, /75 por ciento del salario mínimo interprofesional/);
  assert.doesNotMatch(QUOTE.subsidyIncome, /IPREM|efectos múltiples/);
});

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

test("page: titles, descriptions and lead carry the figures; FAQ of seven in every language", () => {
  for (const l of IPREM_LOCALES) {
    const m = ipremMeta(l);
    assert.ok(m.title.length <= 60, `${l} title ${m.title.length}: ${m.title}`);
    assert.ok(m.description.length <= 165, `${l} description ${m.description.length}: ${m.description}`);
    assert.ok(m.h1.length <= 80, `${l} h1`);
    for (const s of [m.title, m.description, leadText(l)]) {
      assert.ok(s.includes(money(IPREM_MONTHLY, l)), `${l}: ${s}`);
      assert.ok(s.includes(String(IPREM_YEAR)), `${l}: ${s}`);
    }
    assert.ok(leadText(l).includes(money(IPREM_14, l)) && leadText(l).includes(money(IPREM_ANNUAL, l)) && leadText(l).includes(money(IPREM_DAILY, l)));
    const faq = ipremFaq(l);
    assert.equal(faq.length, 7, l);
    for (const f of faq) assert.doesNotMatch(f.q + f.a, /undefined|NaN|\[object/, `${l}: ${f.q}`);
    assert.ok(faq.some((f) => f.a.includes("806/2026")), `${l}: 2027 answer`);
  }
  assert.equal(multiplesTable().length, 12);
  const m45 = multiplesTable().find((r) => r.multiple === 4.5)!;
  assert.equal(m45.monthly, 2700);
  assert.equal(m45.annual12, 32_400);
  assert.equal(m45.annual14, 37_800);
});

test("page: one static route per language, a 404 in the others, server-rendered tables, FAQ JSON-LD, YMYL pieces", () => {
  const routes = { es: "calculadoras/iprem", ca: "calculadores/iprem", en: "calculators/iprem-spain" } as const;
  assert.deepEqual(calcEditions("iprem"), { ca: "/ca/calculadores/iprem/", es: "/es/calculadoras/iprem/", en: "/en/calculators/iprem-spain/" });
  for (const l of IPREM_LOCALES) {
    assert.equal(ipremPath(l), `/${routes[l]}/`.replace(/^\//, `/${l}/`));
    const file = join("src", "app", "(public)", "[locale]", routes[l], "page.tsx");
    assert.ok(existsSync(join(ROOT, file)), file);
    const src = read(file);
    assert.match(src, /export const revalidate = false;/);
    assert.match(src, new RegExp(`return \\[\\{ locale: "${l}" \\}\\]`));
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\)`));
  }
  assert.deepEqual(ipremEditions(), { es: "/es/calculadoras/iprem/", ca: "/ca/calculadores/iprem/", en: "/en/calculators/iprem-spain/" });
  const page = read("src/components/programmatic/iprem/IpremPage.tsx");
  for (const id of ["iprem-2026", "12-o-14-pagas", "iprem-2027", "bono-social", "justicia-gratuita", "alquiler", "subsidio", "veces-iprem", "historia", "preguntas", "fuentes"]) assert.ok(page.includes(`id="${id}"`), id);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /<CalculatorNextStep current="iprem"/);
  assert.match(page, /<MoreCalculators current="iprem"/);
  assert.match(page, /disclaimer/);
  // Sitemap: three editions with hreflang.
  const entries = ipremSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.equal(Object.keys(e.alternates?.languages ?? {}).length, 4);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.ipremSitemapEntries\(\)/);
  assert.ok(JSON.stringify(liveTools()).includes("/es/calculadoras/iprem/"));
});

test("IRSC (Catalonia): the figure and quote are verbatim in the DOGC text; the page answers 'IPREM Catalunya/Andalucía' and '75 % del IPREM'", async () => {
  const fix = JSON.parse(read("tests/fixtures/dogc-irsc-2026.json")) as { da17_1: string; gencatPage: string };
  const { IRSC_2026, IRSC_QUOTE } = await import("../src/lib/programmatic/iprem/rules.ts");
  assert.equal(IRSC_QUOTE, fix.da17_1);
  assert.ok(IRSC_QUOTE.includes(boeEuros(IRSC_2026.monthly)) && IRSC_QUOTE.includes(boeEuros(IRSC_2026.annual)));
  assert.ok(fix.gencatPage.includes(String(IRSC_2026.monthly)) && fix.gencatPage.includes("9,622.18"));
  assert.equal(IRSC_2026.year, 2026);
  assert.equal(SOURCES.dogcIrsc.url, "https://portaldogc.gencat.cat/utilsEADOP/PDF/9706/2161184.pdf");
  // The IRSC is re-read with the IPREM: the same date guard (IPREM_RECHECK_FROM) covers it.
  const page = read("src/components/programmatic/iprem/IpremPage.tsx");
  assert.match(page, /<h2 id="comunidades">\{hd\.region\}<\/h2>/);
  assert.match(page, /IRSC_QUOTE/);
  assert.match(page, /Cataluña, Andalucía/);
  assert.match(page, /Catalunya, Andalusia/);
  assert.match(page, /Catalonia, Andalusia/);
  // 75 % of the IPREM: 0,75 × 600 = 450 a month, 5.400 / 6.300 a year.
  const m75 = multiplesTable().find((r) => r.multiple === 0.75)!;
  assert.deepEqual([m75.monthly, m75.annual12, m75.annual14], [450, 5400, 6300]);
  assert.match(page, /el 75 % del IPREM de \$\{y\}/);
});

test("links: the bono social, subsidy and SMI pages link the IPREM page", () => {
  for (const file of ["src/components/programmatic/bono-social/BonoSocialPage.tsx", "src/components/programmatic/unemployment-subsidy/SubsidyPage.tsx", "src/components/programmatic/smi/SmiPage.tsx"]) {
    assert.match(read(file), /<Link href=\{ipremPath\(locale\)\}>/, file);
  }
});
