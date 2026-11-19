import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";
import { calcEditions } from "../src/lib/programmatic/calculators/paths.ts";
import { searchShortcuts } from "../src/lib/content/search-shortcuts.ts";
import { CMP_HEADINGS, cmpLead, cmpMeta, extremes } from "../src/lib/programmatic/inheritance-compare/copy.ts";
import { CSV_ATTRIBUTION, CSV_COLUMNS, compareCsv } from "../src/lib/programmatic/inheritance-compare/csv.ts";
import { EXAMPLE, bonusPercent, exampleResult, fromRules } from "../src/lib/programmatic/inheritance-compare/engine.ts";
import { cmpFaq } from "../src/lib/programmatic/inheritance-compare/faq.ts";
import { VERIFICATION_NOTES } from "../src/lib/programmatic/inheritance-compare/notes.ts";
import { CMP_LOCALES, CSV_FILENAME, CSV_PATH, cmpEditions, cmpPath, cmpSitemapEntries } from "../src/lib/programmatic/inheritance-compare/paths.ts";
import { RULES_AS_OF, RULES_UNTIL, STATE_QUOTE, STATE_SCALE } from "../src/lib/programmatic/inheritance-compare/state.ts";
import { TERRITORIES, TERRITORY_IDS, exampleRows, territory } from "../src/lib/programmatic/inheritance-compare/territories.ts";
import type { Cell, CmpLocale, ExampleRules, Territory } from "../src/lib/programmatic/inheritance-compare/types.ts";
import { MADRID_RULES } from "../src/lib/programmatic/inheritance-tax/regions/madrid.ts";
import { VALENCIA_RULES } from "../src/lib/programmatic/inheritance-tax/regions/valencia.ts";

/**
 * "Impuesto de sucesiones por comunidad" (lib/programmatic/inheritance-compare):
 * the 21 territories' rules, the worked example against an independent hand
 * calculation, the quotes behind the example's figures, the CSV, the routes
 * and the links into the site.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const cellsOf = (t: Territory): [string, Cell][] => [
  ["groupII", t.inheritance.groupII],
  ["bonus", t.inheritance.bonus],
  ["home", t.inheritance.home],
  ["groupIII", t.inheritance.groupIII],
  ["giftBenefit", t.gift.benefit],
  ["giftFormal", t.gift.formal],
];
const quoteText = (q: string | { text: string }) => (typeof q === "string" ? q : q.text);
/** 15956.87 -> "15.956,87"; 400000 -> "400.000"; 99.9 -> "99,9", as the bulletins print them. */
const es = (n: number) => {
  const [int, dec] = String(n).split(".");
  const grouped = int!.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return dec ? `${grouped},${dec}` : grouped;
};
const squash = (s: string) => s.replace(/\s+/g, " ");

test(`rules read on ${RULES_AS_OF}: re-read every territory's text before ${RULES_UNTIL}`, () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(
    today < RULES_UNTIL,
    `Since ${RULES_UNTIL} the comparison may be out of date: most communities change this tax in their budget laws from 1 January, and the Valencian group III rebate rises to 50 % on 1 June 2027. Re-read the 21 texts (BOE consolidated texts, the Basque diputaciones' texts, Navarre), update data/*.ts and the four calculators, then move RULES_AS_OF and RULES_UNTIL.`,
  );
});

test("21 territories: 15 common-regime communities, Ceuta and Melilla, 4 foral, each once", () => {
  assert.equal(TERRITORIES.length, 21);
  assert.equal(new Set(TERRITORY_IDS).size, 21);
  const count = (r: Territory["regime"]) => TERRITORIES.filter((t) => t.regime === r).length;
  assert.deepEqual([count("common"), count("city"), count("foral")], [15, 2, 4]);
  assert.deepEqual(TERRITORIES.filter((t) => t.regime === "foral").map((t) => t.id), ["alava", "bizkaia", "gipuzkoa", "navarra"]);
  assert.deepEqual(TERRITORIES.filter((t) => t.calculator).map((t) => t.id).sort(), ["andalucia", "cataluna", "madrid", "valencia"]);
});

test("every cell: three languages; verified cells cite a source of the territory, with the law's words; pending cells give a reason", () => {
  for (const t of TERRITORIES) {
    for (const l of CMP_LOCALES) assert.ok(t.name[l] && t.agency.name[l], `${t.id} (${l})`);
    assert.match(t.agency.url, /^https:\/\//, t.id);
    assert.ok(t.sources[t.mainSource], `${t.id}: main source`);
    for (const s of Object.values(t.sources)) {
      assert.match(s.url, /^https:\/\//, `${t.id}: ${s.name}`);
      assert.equal(s.read, RULES_AS_OF, `${t.id}: ${s.name}`);
      assert.ok(s.short && s.name && s.publisher && s.ref, `${t.id}: ${s.url}`);
    }
    for (const [k, c] of cellsOf(t)) {
      for (const l of CMP_LOCALES) assert.ok(c.text[l].trim().length > 10, `${t.id}.${k} (${l})`);
      if (c.pending) continue;
      assert.ok(c.cite && t.sources[c.cite.src], `${t.id}.${k}: cites a source of its own`);
      assert.ok((c.quotes ?? []).length > 0, `${t.id}.${k}: no quote`);
      for (const q of c.quotes!) {
        if (typeof q !== "string") assert.ok(t.sources[q.src], `${t.id}.${k}: quote source ${q.src}`);
        assert.ok(quoteText(q).length >= 8, `${t.id}.${k}`);
      }
      if (c.from) assert.match(c.from, /^\d{4}-\d{2}-\d{2}$/, `${t.id}.${k}`);
      if (c.from) assert.ok(c.from <= RULES_AS_OF, `${t.id}.${k}: in force after the reading`);
    }
  }
});

test("the worked example matches an independent hand calculation in every territory", () => {
  // 300.000 € base; child of 30; only heir of a 150.000 € home; no prior wealth. Each figure worked out by hand from the quoted rules.
  const stateQuota = (bl: number) => {
    // State scale (Ley 29/1987 art. 21.2) at a base between 159.634,83 and 239.389,13: 23.063,25 + 21,25 % of the rest.
    assert.ok(bl > 159_634.83 && bl < 239_389.13);
    return Math.round((23_063.25 + ((bl - 159_634.83) * 21.25) / 100) * 100) / 100;
  };
  // Kinship 15.956,87 + home min(95 % × 150.000, 122.606,47) = 138.563,34 → base liquidable 161.436,66 → quota 23.446,14.
  const stateBase = 300_000 - 15_956.87 - 122_606.47;
  assert.equal(Math.round(stateBase * 100) / 100, 161_436.66);
  assert.equal(stateQuota(stateBase), 23_446.14);
  const onePct = Math.round(23_446.14 * 1) / 100; // 99 % rebate leaves 1 %: 234,46.
  const expected: Record<string, { toPay: number; baseLiquidable?: number; quota?: number }> = {
    andalucia: { toPay: 0, baseLiquidable: 0 },
    aragon: { toPay: 0, baseLiquidable: 0 },
    asturias: { toPay: 0, baseLiquidable: 0 },
    // 300.000 − 25.000 − 150.000 = 125.000 at 1 % = 1.250, then a 100 % rebate.
    baleares: { toPay: 0, baseLiquidable: 125_000, quota: 1_250 },
    // 300.000 − 23.125 − 148.500 = 128.375; 15.606,22 + 18,70 % × 8.617,33 = 17.217,66; 0,1 % of it = 17,22.
    canarias: { toPay: 17.22, baseLiquidable: 128_375, quota: 17_217.66 },
    // 300.000 − 50.000 − 125.000 = 125.000; 15.606,22 + 18,70 % × 5.242,33 = 16.586,54; 100 % rebate.
    cantabria: { toPay: 0, baseLiquidable: 125_000, quota: 16_586.54 },
    // State rules: 161.436,66 is under 175.000, so the rebate is 100 %.
    "castilla-la-mancha": { toPay: 0, baseLiquidable: 161_436.66, quota: 23_446.14 },
    "castilla-y-leon": { toPay: 0, baseLiquidable: 0 },
    // 300.000 − 100.000 − 142.500 = 57.500; 3.500 + 11 % × 7.500 = 4.325; rebate 55 % (60 / 55 / 50 on three slices of 100.000) → 1.946,25.
    cataluna: { toPay: 1_946.25, baseLiquidable: 57_500, quota: 4_325 },
    // 300.000 − 100.000 − 142.500 = 57.500; 5.590,09 + 13,6 % × 2.681,69 = 5.954,80; 1 % = 59,55.
    valencia: { toPay: 59.55, baseLiquidable: 57_500, quota: 5_954.8 },
    extremadura: { toPay: 0, baseLiquidable: 0 },
    galicia: { toPay: 0, baseLiquidable: 0 },
    // 300.000 − 16.000 − 123.000 = 161.000; 23.097,51 + 21,25 % × 1.111,55 = 23.333,71; 1 % = 233,34.
    madrid: { toPay: 233.34, baseLiquidable: 161_000, quota: 23_333.71 },
    murcia: { toPay: onePct, baseLiquidable: 161_436.66, quota: 23_446.14 },
    "la-rioja": { toPay: onePct, baseLiquidable: 161_436.66, quota: 23_446.14 },
    ceuta: { toPay: onePct, baseLiquidable: 161_436.66, quota: 23_446.14 },
    melilla: { toPay: onePct, baseLiquidable: 161_436.66, quota: 23_446.14 },
    alava: { toPay: 0, baseLiquidable: 0 },
    bizkaia: { toPay: 0, baseLiquidable: 0 },
    gipuzkoa: { toPay: 0, baseLiquidable: 0 },
    // No reduction: 0 % on the first 250.000 €, 2 % on the other 50.000 €.
    navarra: { toPay: 1_000, baseLiquidable: 300_000, quota: 1_000 },
  };
  assert.equal(onePct, 234.46);
  assert.deepEqual(Object.keys(expected).sort(), [...TERRITORY_IDS].sort());
  for (const t of TERRITORIES) {
    const r = exampleResult(t.example);
    assert.ok(r, `${t.id}: not computed`);
    const e = expected[t.id]!;
    assert.equal(r.toPay, e.toPay, `${t.id}: to pay`);
    if (e.baseLiquidable !== undefined) assert.equal(r.baseLiquidable, e.baseLiquidable, `${t.id}: base liquidable`);
    if (e.quota !== undefined) assert.equal(r.quotaTributaria, e.quota, `${t.id}: quota`);
    assert.equal(r.baseImponible, EXAMPLE.share);
  }
  const x = extremes();
  assert.equal(x.lowPay, 0);
  assert.equal(x.low.length, 12);
  assert.deepEqual(x.high.map((t) => t.id), ["cataluna"]);
  assert.equal(x.highPay, 1_946.25);
  // Cheapest first, the territories without a result last.
  const pays = exampleRows().map((r) => r.result?.toPay ?? Infinity);
  assert.deepEqual(pays, [...pays].sort((a, b) => a - b));
});

test("the rules engine agrees with the regional calculators' engine (Madrid and Valencia rebuilt from their rules)", () => {
  for (const rules of [MADRID_RULES, VALENCIA_RULES]) {
    const asCompare: ExampleRules = {
      reductions: [{ id: "kinship", label: { ca: "", es: "", en: "" }, amount: rules.kinship.groupII, cite: { src: "law", art: "" } }],
      home: { percent: rules.home.percent, cap: rules.home.capPerHeir, cite: { src: "law", art: "" } },
      scale: rules.scale,
      scaleCite: { src: "law", art: "" },
      coefficient: rules.coefficients[0]!.groupsIandII,
      coefficientCite: null,
      bonus: { kind: "flat", percent: rules.bonus.groupsIandII },
      bonusCite: null,
    };
    const ours = fromRules(asCompare);
    const theirs = exampleResult(territory(rules.id).example)!;
    assert.equal(ours.toPay, theirs.toPay, rules.id);
    assert.equal(ours.baseLiquidable, theirs.baseLiquidable, rules.id);
  }
  // Castilla-La Mancha's rebate is one percentage for the whole tax, set by the base liquidable: the row it falls in, never a blend.
  const clm = territory("castilla-la-mancha").example;
  assert.equal(clm.kind, "rules");
  if (clm.kind === "rules") {
    assert.equal(bonusPercent(clm.rules.bonus, 174_999.99), 100);
    assert.equal(bonusPercent(clm.rules.bonus, 175_000), 95);
    assert.equal(bonusPercent(clm.rules.bonus, 299_999.99), 85);
    assert.equal(bonusPercent(clm.rules.bonus, 300_000), 80);
  }
});

test("every figure the example applies is in the law's words the page quotes", () => {
  for (const t of TERRITORIES) {
    if (t.example.kind !== "rules") continue;
    const r = t.example.rules;
    const all = squash(
      [...cellsOf(t).flatMap(([, c]) => (c.quotes ?? []).map(quoteText)), ...(r.scale === STATE_SCALE ? [STATE_QUOTE.scaleTop, STATE_QUOTE.coefficient] : [])].join(" | "),
    );
    for (const red of r.reductions) if ("amount" in red) assert.ok(all.includes(es(red.amount)), `${t.id}: reduction ${es(red.amount)}`);
    for (const red of r.reductions) if ("topUpTo" in red) assert.ok(all.includes(es(red.topUpTo)), `${t.id}: ${es(red.topUpTo)}`);
    if (r.home) {
      assert.ok(all.includes(String(r.home.percent)), `${t.id}: home ${r.home.percent} %`);
      if (r.home.cap !== null) assert.ok(all.includes(es(r.home.cap)), `${t.id}: home cap ${es(r.home.cap)}`);
    }
    if (r.bonus.kind === "flat") assert.ok(all.includes(es(r.bonus.percent)), `${t.id}: rebate ${r.bonus.percent} %`);
    if (r.bonus.kind === "by-base") for (const row of r.bonus.rows.slice(1)) assert.ok(all.includes(es(row.from)), `${t.id}: rebate row ${es(row.from)}`);
    const top = r.scale[r.scale.length - 1]!;
    if (r.scale.length > 1) assert.ok(all.includes(es(top.from)) || all.includes(`${es(top.from)},00`), `${t.id}: scale top ${es(top.from)}`);
    else assert.ok(all.includes(es(top.rate)), `${t.id}: flat rate ${top.rate}`);
  }
  // The state scale as the page holds it, row by row against the BOE's art. 21.2 (each row's quota = the previous quota + its rate on its width).
  for (let i = 1; i < STATE_SCALE.length; i++) {
    const prev = STATE_SCALE[i - 1]!;
    const row = STATE_SCALE[i]!;
    assert.ok(Math.abs(prev.quota + ((row.from - prev.from) * prev.rate) / 100 - row.quota) < 0.02, `state scale row ${i}`);
  }
});

test("Ceuta and Melilla: Law 29/1987 with the art. 23 bis rebate, 99 % for groups I and II", () => {
  assert.match(STATE_QUOTE.cityGroupsIandII, /99 por ciento para los causahabientes comprendidos, según el grado de parentesco, en los grupos I y II/);
  assert.match(STATE_QUOTE.cityInheritance, /50 por 100 de la cuota, siempre que el causante hubiera tenido su residencia habitual a la fecha del devengo en Ceuta o Melilla y durante los cinco años anteriores/);
  for (const id of ["ceuta", "melilla"] as const) {
    const t = territory(id);
    assert.equal(t.regime, "city");
    assert.match(t.inheritance.bonus.text.es, /^99 % para los grupos I y II \(50 % para el resto\)/);
  }
});

test("verification notes: one per territory at most, in three languages, about territories that exist", () => {
  for (const [id, note] of Object.entries(VERIFICATION_NOTES)) {
    assert.ok(TERRITORY_IDS.includes(id as (typeof TERRITORY_IDS)[number]), id);
    for (const l of CMP_LOCALES) assert.ok(note![l].length > 20, `${id} (${l})`);
  }
  // Gipuzkoa's 1990 norm is repealed: the page reads NF 2/2022.
  assert.match(territory("gipuzkoa").sources.law!.name, /^Norma Foral 2\/2022/);
});

test("meta, lead and FAQ in every language, with the example's figures", () => {
  for (const l of CMP_LOCALES) {
    const m = cmpMeta(l);
    assert.ok(m.title.length <= 60, `${l} title: ${m.title.length}`);
    assert.ok(m.description.length <= 165, `${l} description: ${m.description.length}`);
    assert.match(m.title, /2026/);
    assert.match(m.description, /1[.,]946/);
    assert.match(cmpLead(l), /1[.,]946,25|1,946\.25/);
    const faq = cmpFaq(l);
    assert.equal(faq.length, 7, l);
    for (const f of faq) assert.ok(f.q.trim() && f.a.trim().length > 40, `${l}: ${f.q}`);
    for (const h of Object.values(CMP_HEADINGS[l as CmpLocale])) assert.ok(h.trim(), l);
  }
  assert.match(cmpFaq("es")[0]!.q, /Dónde se paga menos impuesto de sucesiones/);
});

test("CSV: RFC 4180 with a BOM, one row per territory and item plus the example, each with the attribution", () => {
  const csv = compareCsv();
  assert.ok(csv.startsWith("﻿"));
  assert.ok(csv.endsWith("\r\n"));
  const lines = csv.slice(1).trimEnd().split("\r\n");
  assert.equal(lines[0], CSV_COLUMNS.join(","));
  const notes = Object.keys(VERIFICATION_NOTES).length;
  assert.equal(lines.length - 1, 21 * 6 + notes + 21 * 5);
  for (const line of lines.slice(1)) assert.ok(line.endsWith(`"${CSV_ATTRIBUTION}"`) || line.endsWith(CSV_ATTRIBUTION), line.slice(0, 60));
  assert.ok(lines.some((l) => l.startsWith("cataluna,Cataluña,common,example_to_pay,verified,") && l.includes(",1946.25,EUR,")));
  assert.equal(CSV_PATH, `/data/${CSV_FILENAME}`);
  const route = read(`src/app/data/${CSV_FILENAME}/route.ts`);
  assert.match(route, /export const dynamic = "force-static";/);
  assert.match(route, /rel="canonical"/);
  assert.match(route, /compareCsv\(\)/);
});

test("routes: one static route per language, a 404 in the others, never dynamicParams = false; sitemap, llms.txt, hub, search, next step", () => {
  assert.deepEqual(cmpEditions(), { ca: "/ca/calculadores/impost-successions-per-comunitat/", es: "/es/calculadoras/impuesto-sucesiones-por-comunidad/", en: "/en/calculators/spain-inheritance-tax-by-region/" });
  assert.deepEqual(cmpEditions(), calcEditions("inheritance-tax-by-region"));
  for (const l of CMP_LOCALES) {
    const file = join(ROOT, "src", "app", "(public)", "[locale]", cmpPath(l).split("/").slice(2, 4).join("/"), "page.tsx");
    assert.ok(existsSync(file), file);
    const src = readFileSync(file, "utf8");
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, new RegExp(`<InheritanceCompareRoute locale="${l}" />`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, /^export const revalidate = false;$/m);
  }
  const entries = cmpSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.cmpSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: cmpEditions\(\)/);
  assert.equal(HUB_GROUPS.find((g) => g.id === "taxes")!.cards[0]!.key, "inheritance-tax-by-region");
  assert.equal(searchShortcuts("es", "impuesto de sucesiones por comunidad 2026")[0]?.href, cmpPath("es"));
  assert.equal(searchShortcuts("es", "dónde se paga menos sucesiones")[0]?.href, cmpPath("es"));
  assert.equal(searchShortcuts("ca", "successions per comunitat")[0]?.href, cmpPath("ca"));
  // The four inheritance and four gift calculators link the comparison.
  assert.match(read("src/components/programmatic/inheritance-tax/InheritanceByRegion.tsx"), /calcPath\("inheritance-tax-by-region", locale\)/);
  assert.match(read("src/components/programmatic/gift-tax/GiftByRegion.tsx"), /calcPath\("inheritance-tax-by-region", locale\)\}#donaciones/);
  // The page: YMYL disclaimer at the top and the foot, the four calculators, the CSV and the next step.
  const page = read("src/components/programmatic/inheritance-compare/InheritanceComparePage.tsx");
  assert.equal((page.match(/cmpDisclaimer\(locale\)/g) ?? []).length, 2);
  assert.match(page, /<CalculatorNextStep current="inheritance-tax-by-region" locale=\{locale\} \/>/);
  assert.match(page, /<MoreCalculators current="inheritance-tax-by-region" locale=\{locale\} \/>/);
  assert.match(page, /href=\{CSV_PATH\} download/);
  assert.match(page, /builtCalcs\.map/);
});
