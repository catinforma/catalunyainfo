import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { BS_LOCALES, CALC_COPY, CAP_ROW_LABEL, CATEGORY_LABEL, SPECIAL_LABEL, bonoSocialEditions, money, rate } from "../src/lib/programmatic/bono-social/copy.ts";
import { MAX_MEMBERS, SPECIAL_IDS, capRowFor, check, checkOk, household, multiplierFor, thresholdsFor } from "../src/lib/programmatic/bono-social/engine.ts";
import { DEFAULT_INPUT, HOUSEHOLDS, HOUSEHOLD_LABEL, bonoSocialFaq, bonoSocialMeta, bonoSocialSitemapEntries, examples, headline, incomeTable } from "../src/lib/programmatic/bono-social/page.ts";
import {
  CAP_ROWS,
  DISCOUNT_2026,
  IPREM_14,
  IPREM_MONTHLY,
  KWH_CAP,
  KWH_CAP_MONTHLY,
  NO_CUTOFF_UNTIL,
  PERMANENT_DISCOUNT,
  QUOTE,
  REFERENCE_SUPPLIERS,
  RULES_AS_OF,
  RULES_UNTIL,
  SOURCES,
  discountOn,
} from "../src/lib/programmatic/bono-social/rules.ts";
import { bonoParagraphs as pvpcBono, URLS as PVPC_URLS } from "../src/lib/programmatic/pvpc/copy.ts";
import { bonoParagraphs as butaneBono } from "../src/lib/programmatic/butane/copy.ts";

/**
 * "Bono social eléctrico: ¿tienes derecho?" (lib/programmatic/bono-social/):
 * RD 897/2017 arts. 3-4 and Annex I, the 2026 discount of RDL 7/2026 and the
 * IPREM, against MITECO's own euro examples; the page, the links from the
 * PVPC and butane pages, and the date from which the rules must be re-read.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const today = () => new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ rules */

test("the rule is the BOE's: 1.5 × IPREM (8,400 €) + 0.3 per adult + 0.5 per minor, +1 special, half for severe", () => {
  assert.equal(IPREM_MONTHLY, 600);
  assert.equal(IPREM_14, 8_400);
  assert.match(QUOTE.income, /igual o inferior a 1,5 veces el Indicador Público de Renta de Efectos Múltiples \(IPREM\) de 14 pagas/);
  assert.match(QUOTE.increments, /0,3 por cada miembro adicional mayor de edad .* y 0,5 por cada menor de edad/);
  assert.match(QUOTE.special, /se incrementarán, en cada caso, en 1/);
  assert.match(QUOTE.severe, /inferior o igual al 50 %/);
  assert.match(QUOTE.severeOther, /una vez el IPREM a 14 pagas, en el caso .* 2\.c\), o dos veces el mismo en el caso .* 2\.b\)/);
  assert.match(QUOTE.who, /esté acogida al precio voluntario para el pequeño consumidor \(PVPC\)/);
  assert.match(QUOTE.onlyCor, /sólo le podrá ser aplicado por un comercializador de referencia/);
});

test("discounts: 42.5 % / 57.5 % from 1 Jan to 31 Dec 2026 (RDL 7/2026), 35 % / 50 % otherwise (RD 897/2017 art. 6.3)", () => {
  assert.deepEqual(PERMANENT_DISCOUNT, { vulnerable: 0.35, severe: 0.5 });
  assert.deepEqual(DISCOUNT_2026.rate, { vulnerable: 0.425, severe: 0.575 });
  assert.equal(DISCOUNT_2026.from, "2026-01-01");
  assert.equal(DISCOUNT_2026.until, "2026-12-31");
  assert.match(QUOTE.rates2026, /será del 42,5 por ciento\. En el caso del consumidor vulnerable severo, el descuento será del 57,5 por ciento\./);
  assert.match(QUOTE.window2026, /entre el 1 de enero y el 31 de diciembre de 2026/);
  assert.match(QUOTE.permanent, /descuento del 35 por ciento/);
  assert.match(QUOTE.permanentSevere, /será del 50 por ciento/);
  assert.equal(discountOn("vulnerable", "2026-11-18"), 0.425);
  assert.equal(discountOn("severe", "2026-12-31"), 0.575);
  assert.equal(discountOn("vulnerable", "2027-01-01"), 0.35);
  assert.equal(discountOn("severe", "2027-01-01"), 0.5);
  assert.equal(NO_CUTOFF_UNTIL, DISCOUNT_2026.until);
  assert.match(QUOTE.noCutoff2026, /hasta el 31 de diciembre de 2026/);
});

test("kWh caps: RD 897/2017 Annex I.2 (RDL 18/2022) and MITECO's monthly figures", () => {
  assert.deepEqual(KWH_CAP, { "one-two": 1_587, three: 2_222, four: 2_698, five: 4_761 });
  assert.deepEqual(KWH_CAP_MONTHLY, { "one-two": 132, three: 185, four: 224, five: 396 });
  for (const row of CAP_ROWS) {
    // MITECO's monthly figure is the yearly cap over twelve, cut to the unit.
    assert.equal(KWH_CAP_MONTHLY[row], Math.floor(KWH_CAP[row] / 12), row);
    for (const l of BS_LOCALES) assert.ok(CAP_ROW_LABEL[row][l].trim(), `${row} (${l})`);
  }
});

test("sources: official hosts over https, read on the as-of day; the BOE ids of every norm used", () => {
  const hosts = new Set(["www.boe.es", "www.miteco.gob.es", "www.cnmc.es", "www.sepe.es"]);
  for (const [key, s] of Object.entries(SOURCES)) {
    const url = new URL(s.url);
    assert.equal(url.protocol, "https:", key);
    assert.ok(hosts.has(url.host), `${key}: ${url.host}`);
    assert.equal(s.read, RULES_AS_OF, key);
  }
  assert.match(SOURCES.rd897.url, /BOE-A-2017-11505$/);
  assert.match(SOURCES.rdl7.url, /BOE-A-2026-6544$/);
  assert.match(SOURCES.rdl7conv.url, /BOE-A-2026-7125$/);
  assert.match(SOURCES.etu943.url, /BOE-A-2017-11532$/);
  assert.match(SOURCES.iprem.url, /BOE-A-2022-22128$/);
  assert.equal(REFERENCE_SUPPLIERS.length, 8);
  assert.deepEqual(REFERENCE_SUPPLIERS.filter((s) => s.only).map((s) => s.only).sort(), ["Ceuta", "Melilla"]);
});

test(`date guard: the 2026 discount and the no-cut-off guarantee end on ${RULES_UNTIL}; re-read before then`, () => {
  assert.ok(RULES_AS_OF <= today());
  assert.ok(
    today() < RULES_UNTIL,
    "Bono social: the 42.5 % / 57.5 % of RDL 7/2026 art. 1 and the no-cut-off guarantee of art. 4 end on 31 Dec 2026. Search the BOE for a decree-law extending them (and for the 2027 IPREM), re-read MITECO's requisitos page and the CNMC, update rules.ts (DISCOUNT_2026, NO_CUTOFF_UNTIL, IPREM, SOURCES) and the page's words, then move RULES_AS_OF and RULES_UNTIL.",
  );
});

/* ----------------------------------------------------------------- engine */

test("income limits = MITECO's own examples (FAQ, read 18 Nov 2026)", () => {
  const t = (adults: number, minors: number, special = false) => thresholdsFor({ adults, minors, largeFamily: false, minimumPension: false, special });
  assert.deepEqual(t(1, 0), { multiplier: 1.5, vulnerable: 12_600, severe: 6_300 });
  assert.deepEqual(t(2, 1), { multiplier: 2.3, vulnerable: 19_320, severe: 9_660 });
  assert.deepEqual(t(2, 2), { multiplier: 2.8, vulnerable: 23_520, severe: 11_760 });
  assert.deepEqual(t(1, 0, true), { multiplier: 2.5, vulnerable: 21_000, severe: 10_500 });
  assert.deepEqual(t(2, 1, true), { multiplier: 3.3, vulnerable: 27_720, severe: 13_860 });
  assert.deepEqual(t(2, 2, true), { multiplier: 3.8, vulnerable: 31_920, severe: 15_960 });
  // Large families: severe up to 16,800 € (2 × IPREM); minimum pensioners: up to 8,400 €.
  assert.equal(thresholdsFor({ adults: 2, minors: 3, largeFamily: true, minimumPension: false, special: false }).severe, 16_800);
  assert.equal(thresholdsFor({ adults: 1, minors: 0, largeFamily: false, minimumPension: true, special: false }).severe, 8_400);
  // A big large family whose half-limit is higher keeps the higher one.
  assert.equal(multiplierFor(2, 6, true), 5.8);
  assert.equal(thresholdsFor({ adults: 2, minors: 6, largeFamily: true, minimumPension: false, special: true }).severe, 24_360);
  assert.equal(multiplierFor(3, 0, false), 2.1);
});

test("categories: income, title, pension and IMV routes; severe; at risk of social exclusion; not eligible", () => {
  const vul = checkOk(household(1, 0, 12_600));
  assert.equal(vul.category, "vulnerable");
  assert.deepEqual(vul.routes, ["income"]);
  assert.equal(vul.discount2026, 0.425);
  assert.equal(vul.discountPermanent, 0.35);
  assert.equal(checkOk(household(1, 0, 12_600.01)).category, "none");
  assert.equal(checkOk(household(1, 0, 6_300)).category, "severe");
  assert.equal(checkOk(household(1, 0, 6_300)).discount2026, 0.575);
  // Large family: qualifies whatever the income; severe up to 16,800 €.
  const lf = checkOk(household(2, 3, 60_000, { largeFamily: true }));
  assert.equal(lf.category, "vulnerable");
  assert.deepEqual(lf.routes, ["large-family"]);
  assert.equal(checkOk(household(2, 3, 16_800, { largeFamily: true })).category, "severe");
  // Minimum pensioners: severe up to 8,400 €.
  assert.equal(checkOk(household(1, 0, 8_400, { minimumPension: true })).category, "severe");
  assert.equal(checkOk(household(1, 0, 20_000, { minimumPension: true })).category, "vulnerable");
  // IMV: qualifies; severity from the general half-limit.
  assert.equal(checkOk(household(2, 0, 30_000, { imv: true })).category, "vulnerable");
  assert.equal(checkOk(household(2, 0, 7_560, { imv: true })).category, "severe");
  // No income figure: the title still qualifies, severity unknown.
  const noIncome = checkOk(household(1, 2, null, { largeFamily: true }));
  assert.equal(noIncome.category, "vulnerable");
  assert.equal(noIncome.severityUnknown, true);
  // Social services pay half the bill: at risk of social exclusion, only when severe.
  assert.equal(checkOk(household(1, 0, 5_000, { socialServices: true })).category, "exclusion");
  const notSevere = checkOk(household(1, 0, 10_000, { socialServices: true }));
  assert.equal(notSevere.category, "vulnerable");
  assert.equal(notSevere.socialServicesIgnored, true);
  // Above the limit with no other route: not eligible, no discount.
  const none = checkOk(household(2, 0, 25_000));
  assert.equal(none.category, "none");
  assert.equal(none.discount2026, null);
  assert.equal(none.thresholds.vulnerable, 15_120);
});

test("special circumstances add 8,400 € once, however many; single parent needs a minor", () => {
  const one = checkOk(household(1, 1, null, { imv: true, special: ["single-parent"] }));
  const all = checkOk(household(1, 1, null, { imv: true, special: [...SPECIAL_IDS] }));
  assert.equal(one.thresholds.vulnerable, 25_200);
  assert.equal(all.thresholds.vulnerable, 25_200);
  assert.deepEqual(check(household(1, 0, 10_000, { special: ["single-parent"] })), { status: "invalid", reason: "single-parent" });
  for (const s of SPECIAL_IDS) for (const l of BS_LOCALES) assert.ok(SPECIAL_LABEL[s][l].trim(), `${s} (${l})`);
});

test("PVPC: eligible households off the PVPC are told to switch; on the PVPC they are not", () => {
  assert.equal(checkOk(household(1, 0, 10_000, { tariff: "free" })).needsPvpc, true);
  assert.equal(checkOk(household(1, 0, 10_000, { tariff: "unsure" })).needsPvpc, true);
  assert.equal(checkOk(household(1, 0, 10_000)).needsPvpc, false);
  assert.equal(checkOk(household(2, 0, 25_000, { tariff: "free" })).needsPvpc, false);
});

test("kWh row: the household's Annex I row, the most favourable when several fit", () => {
  assert.equal(capRowFor(1, 0, false, false), "one-two");
  assert.equal(capRowFor(2, 0, false, false), "one-two");
  assert.equal(capRowFor(1, 1, false, false), "three");
  assert.equal(capRowFor(3, 0, false, false), "three");
  assert.equal(capRowFor(2, 1, false, false), "three");
  assert.equal(capRowFor(1, 2, false, false), "four");
  assert.equal(capRowFor(4, 0, false, false), "four");
  assert.equal(capRowFor(2, 2, false, false), "four");
  assert.equal(capRowFor(1, 3, false, false), "five");
  assert.equal(capRowFor(5, 0, false, false), "five");
  assert.equal(capRowFor(1, 0, false, true), "three");
  assert.equal(capRowFor(4, 0, false, true), "four");
  assert.equal(capRowFor(2, 1, true, false), "five");
  assert.deepEqual(checkOk(household(2, 2, 20_000)).cap, { row: "four", yearly: 2_698, monthly: 224 });
});

test("invalid input: adults, minors, income, a household too large, income needed", () => {
  assert.deepEqual(check(household(0, 0, 1_000)), { status: "invalid", reason: "adults" });
  assert.deepEqual(check(household(1.5, 0, 1_000)), { status: "invalid", reason: "adults" });
  assert.deepEqual(check(household(Number.NaN, 0, 1_000)), { status: "invalid", reason: "adults" });
  assert.deepEqual(check(household(1, -1, 1_000)), { status: "invalid", reason: "minors" });
  assert.deepEqual(check(household(10, MAX_MEMBERS, 1_000)), { status: "invalid", reason: "minors" });
  assert.deepEqual(check(household(1, 0, -5)), { status: "invalid", reason: "income" });
  assert.deepEqual(check(household(1, 0, Number.POSITIVE_INFINITY)), { status: "invalid", reason: "income" });
  assert.deepEqual(check(household(1, 0, null)), { status: "invalid", reason: "income-needed" });
  for (const l of BS_LOCALES) for (const r of Object.values(CALC_COPY[l].invalid)) assert.ok(r.trim(), l);
});

/* ------------------------------------------------------------------- page */

test("page: titles and descriptions fit the snippet and carry the 2026 rates and the 12,600 € limit; three editions", () => {
  for (const l of BS_LOCALES) {
    const m = bonoSocialMeta(l);
    assert.ok(m.title.length <= 60, `${l} title: ${m.title.length}`);
    assert.ok(m.description.length <= 160, `${l} description: ${m.description.length} ${m.description}`);
    assert.ok(m.description.includes(rate(0.425, l)) && m.description.includes(rate(0.575, l)) && m.description.includes(money(12_600, l)), l);
    assert.ok(m.h1.length <= 80, `${l} h1: ${m.h1.length}`);
    assert.deepEqual(Object.keys(CALC_COPY[l]).sort(), Object.keys(CALC_COPY.es).sort(), l);
    // The calculator's fixed words agree with the rules and the server-rendered default.
    assert.ok(CALC_COPY[l].specialLegend.includes(money(IPREM_14, l)), l);
    assert.ok(CALC_COPY[l].multiplier("x").includes(money(IPREM_14, l)), l);
    assert.ok(CALC_COPY[l].noscript.includes(money(DEFAULT_INPUT.income!, l)), l);
    for (const c of Object.keys(CATEGORY_LABEL) as (keyof typeof CATEGORY_LABEL)[]) assert.ok(CATEGORY_LABEL[c][l].trim(), `${c} (${l})`);
  }
  assert.deepEqual(bonoSocialEditions(), { ca: "/ca/calculadores/bo-social-electric/", es: "/es/calculadoras/bono-social-electrico/", en: "/en/calculators/bono-social-electricity-spain/" });
  const entries = bonoSocialSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.bonoSocialSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: bonoSocialEditions\(\)/);
  assert.deepEqual(HUB_GROUPS.find((g) => g.id === "energy")?.cards.map((c) => c.key), ["bono-social"]);
});

test("page: one static route per language, a 404 in the others, server-rendered checker, tables, FAQ and YMYL pieces", () => {
  const routes = { es: "calculadoras/bono-social-electrico", ca: "calculadores/bo-social-electric", en: "calculators/bono-social-electricity-spain" } as const;
  for (const l of BS_LOCALES) {
    const file = join("src", "app", "(public)", "[locale]", routes[l], "page.tsx");
    assert.ok(existsSync(join(ROOT, file)), file);
    const src = read(file);
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, new RegExp(`<BonoSocialRoute locale="${l}" />`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, /^export const revalidate = false;$/m);
  }
  const page = read("src/components/programmatic/bono-social/BonoSocialPage.tsx");
  assert.match(page, /<MoreCalculators current="bono-social" locale=\{locale\} \/>/);
  assert.match(page, /<CalculatorNextStep current="bono-social" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\)/);
  assert.match(page, /<BonoSocialCalculator locale=\{locale\} initial=\{DEFAULT_INPUT\} \/>/);
  // The answer is in the HTML: the income table, the kWh table and the examples render on the server from the engine.
  assert.match(page, /incomeTable\(\)\.map/);
  assert.match(page, /CAP_ROWS\.map/);
  assert.match(page, /examples\(\)\.map/);
  // YMYL: the disclaimer with the Ministry's requirements link, the rules date, the FAQ schema, the PVPC and butane links.
  assert.match(page, /SOURCES\.mitecoRequisitos\.url/);
  assert.match(page, /RULES_AS_OF/);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /pvpcPath\(locale, "today"\)/);
  assert.match(page, /butanePath\(locale\)/);
  const calc = read("src/components/programmatic/bono-social/BonoSocialCalculator.tsx");
  assert.match(calc, /^"use client";/);
  assert.match(calc, /<noscript>/);
  assert.match(calc, /useCalculatorUse\("bono-social"/);
});

test("tables and examples: every household and example from the engine", () => {
  const rows = incomeTable();
  assert.equal(rows.length, HOUSEHOLDS.length);
  for (const r of rows) for (const l of BS_LOCALES) assert.ok(HOUSEHOLD_LABEL[r.id][l].trim(), `${r.id} (${l})`);
  assert.deepEqual(rows.find((r) => r.id === "a2m2")!.plain, { multiplier: 2.8, vulnerable: 23_520, severe: 11_760 });
  const ex = Object.fromEntries(examples().map((e) => [e.id, e.result]));
  assert.equal(ex.alone!.category, "vulnerable");
  assert.equal(ex.family!.category, "vulnerable");
  assert.equal(ex["family-low"]!.category, "severe");
  assert.equal(ex["single-parent"]!.category, "vulnerable");
  assert.equal(ex["single-parent"]!.thresholds.vulnerable, 25_200);
  assert.equal(ex["large-family"]!.category, "vulnerable");
  assert.equal(ex["large-family"]!.cap.yearly, 4_761);
  assert.equal(ex.pensioner!.category, "severe");
  assert.equal(ex.pensioner!.cap.yearly, 2_222);
  assert.equal(ex["couple-over"]!.category, "none");
  assert.equal(ex["free-market"]!.needsPvpc, true);
  assert.equal(checkOk(DEFAULT_INPUT).category, "vulnerable");
});

test("FAQ: seven questions per language, the real queries, every figure from the rules", () => {
  const es = bonoSocialFaq("es");
  assert.deepEqual(es.map((f) => f.q).slice(0, 3), ["¿Cuánto descuenta el bono social en 2026?", "¿Quién tiene derecho al bono social eléctrico?", "¿Cuál es el límite de ingresos para el bono social?"]);
  const h = headline();
  for (const l of BS_LOCALES) {
    const faq = bonoSocialFaq(l);
    assert.equal(faq.length, 7, l);
    assert.equal(new Set(faq.map((f) => f.q)).size, 7, l);
    const all = faq.map((f) => f.a).join(" ");
    for (const n of [h.alone.vulnerable, h.perAdult, h.perMinor, h.family.vulnerable, h.special, IPREM_14]) assert.ok(all.includes(money(n, l)), `${l}: ${n}`);
    for (const r of [0.425, 0.575, 0.35, 0.5]) assert.ok(all.includes(rate(r, l)), `${l}: ${r}`);
    assert.doesNotMatch(all, /undefined|NaN/, l);
  }
});

test("energía en casa: the PVPC and butane pages link the checker in ca, es and en, and the PVPC's MITECO link is the live one", () => {
  for (const l of BS_LOCALES) {
    assert.ok(pvpcBono(l).some((p) => p.includes(`](${calcPath("bono-social", l)})`)), `PVPC ${l}`);
    assert.ok(butaneBono(l).some((p) => p.includes(`](${calcPath("bono-social", l)})`)), `butane ${l}`);
  }
  // miteco.gob.es/es/energia/energia-electrica/bono-social.html answered 404 on 18 Nov 2026.
  assert.equal(PVPC_URLS.bonoMiteco, SOURCES.mitecoRequisitos.url);
  assert.match(read("src/components/programmatic/pvpc/PvpcPage.tsx"), /href: bonoSocialPath\(locale\)/);
  assert.match(read("src/components/programmatic/butane/ButanePage.tsx"), /href: bonoSocialPath\(locale\)/);
});
