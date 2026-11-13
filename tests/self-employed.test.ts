import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALC_COPY, SE_LOCALES, bandName, bandRangeText, money, readHash, selfEmployedEditions, selfEmployedPath, writeHash } from "../src/lib/programmatic/self-employed/copy.ts";
import { DEFAULT_INPUT, bandFor, bandFrom, bandTable, calculateSelfEmployed, computableEarnings, contribution, type SelfEmployedInput } from "../src/lib/programmatic/self-employed/engine.ts";
import {
  BANDS_2026,
  CORPORATE_MIN_BASE,
  FLAT_RATE,
  GENERIC_EXPENSES,
  MAX_BASE,
  MIN_BASE,
  OFFICIAL_LINKS,
  QUOTE,
  RATES,
  RULES_AS_OF,
  RULES_UNTIL,
  RULES_YEAR,
  SMI_ANNUAL,
  SOURCES,
  STATUS_2027,
  STATUS_2027_RECHECK_BY,
  TOTAL_RATE,
} from "../src/lib/programmatic/self-employed/rules-2026.ts";
import { selfEmployedSitemapEntries } from "../src/lib/programmatic/self-employed/sitemap.ts";

/**
 * "Cuota de autónomos 2026 (y 2027)" (lib/programmatic/self-employed/): the
 * 2026 tables of Orden PJC/297/2026 art. 18, the 31,50 % rate, the LGSS
 * art. 308 earnings rules, the tarifa plana, the regularisation, and the
 * date guards that make 2027 impossible to forget.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const calc = (patch: Partial<SelfEmployedInput>) => calculateSelfEmployed({ ...DEFAULT_INPUT, ...patch });

/* -------------------------------------------------------------------------- */
/* The BOE figures                                                            */
/* -------------------------------------------------------------------------- */

test("tables: the 15 bands of Orden PJC/297/2026 art. 18.1, as the BOE prints them", () => {
  // [table, band, upper limit, minimum base, maximum base] — BOE-A-2026-7296, "Tramos de rendimientos netos 2026".
  const boe: [string, number, number | null, number, number][] = [
    ["reduced", 1, 670, 653.59, 718.94],
    ["reduced", 2, 900, 718.95, 900],
    ["reduced", 3, 1166.7, 849.67, 1166.7],
    ["general", 1, 1300, 950.98, 1300],
    ["general", 2, 1500, 960.78, 1500],
    ["general", 3, 1700, 960.78, 1700],
    ["general", 4, 1850, 1143.79, 1850],
    ["general", 5, 2030, 1209.15, 2030],
    ["general", 6, 2330, 1274.51, 2330],
    ["general", 7, 2760, 1356.21, 2760],
    ["general", 8, 3190, 1437.91, 3190],
    ["general", 9, 3620, 1519.61, 3620],
    ["general", 10, 4050, 1601.31, 4050],
    ["general", 11, 6000, 1732.03, 5101.2],
    ["general", 12, null, 1928.1, 5101.2],
  ];
  assert.deepEqual(BANDS_2026.map((b) => [b.table, b.n, b.upTo, b.minBase, b.maxBase]), boe);
  // Only reduced band 3 ends "< 1.166,70"; general band 1 starts "≥ 1.166,70".
  assert.deepEqual(BANDS_2026.filter((b) => !b.upToInclusive).map((b) => `${b.table}${b.n}`), ["reduced3"]);
  assert.equal(MAX_BASE, 5101.2);
  assert.equal(MIN_BASE, 653.59);
  for (const b of BANDS_2026) assert.ok(b.minBase <= b.maxBase && b.maxBase <= MAX_BASE, `${b.table}${b.n}`);
});

test("rates: 28,30 + 1,30 + 0,90 + 0,10 + 0,90 = 31,50 % (Orden arts. 18.2 and 37.5–37.6; MEI from RDL 3/2026 art. 3.2)", () => {
  assert.deepEqual({ ...RATES }, { commonContingencies: 28.3, professionalContingencies: 1.3, cessation: 0.9, vocationalTraining: 0.1, intergenerationalEquity: 0.9 });
  assert.equal(TOTAL_RATE, 31.5);
  assert.deepEqual({ ...GENERIC_EXPENSES }, { general: 7, corporate: 3 });
  assert.equal(CORPORATE_MIN_BASE, 1424.4);
  assert.equal(SMI_ANNUAL, 17094);
  assert.equal(FLAT_RATE.fee, 80);
  assert.equal(FLAT_RATE.totalWithMei, 88.64);
  // The quotes carry the figures they are cited for.
  assert.match(QUOTE.lgss308deduction, /7 por ciento/);
  assert.match(QUOTE.lgss308deduction, /3 por ciento/);
  assert.match(QUOTE.tgssFlatRate, /88,64€/);
  assert.match(QUOTE.rdl3art34, /para el año 2025/);
  assert.match(QUOTE.lgssMei2027, /2027, será de 1 punto/);
});

test("contribution: base × 31,50 % to the cent (lowest, general minimum, maximum)", () => {
  assert.equal(contribution(653.59), 205.88);
  assert.equal(contribution(950.98), 299.56);
  assert.equal(contribution(1209.15), 380.88);
  assert.equal(contribution(5101.2), 1606.88);
  assert.equal(contribution(1424.4), 448.69);
});

/* -------------------------------------------------------------------------- */
/* Engine                                                                     */
/* -------------------------------------------------------------------------- */

test("bands: edges as the BOE writes them (≤, <, ≥)", () => {
  const at = (m: number) => `${bandFor(m).table}${bandFor(m).n}`;
  assert.equal(at(0), "reduced1");
  assert.equal(at(-50), "reduced1");
  assert.equal(at(670), "reduced1");
  assert.equal(at(670.01), "reduced2");
  assert.equal(at(900), "reduced2");
  assert.equal(at(900.01), "reduced3");
  assert.equal(at(1166.69), "reduced3");
  assert.equal(at(1166.7), "general1");
  assert.equal(at(1300), "general1");
  assert.equal(at(1300.01), "general2");
  assert.equal(at(4050), "general10");
  assert.equal(at(6000), "general11");
  assert.equal(at(6000.01), "general12");
  assert.equal(at(50000), "general12");
  assert.equal(bandFrom(BANDS_2026[0]!), null);
  assert.deepEqual(bandFrom(BANDS_2026[3]!), { value: 1166.7, inclusive: true });
  assert.deepEqual(bandFrom(BANDS_2026[4]!), { value: 1300, inclusive: false });
});

test("earnings: income − expenses − 7 % (3 % corporate), never below zero (LGSS 308.1.c 2.ª)", () => {
  assert.deepEqual(computableEarnings(24000, false), { pct: 7, deduction: 1680, computable: 22320 });
  assert.deepEqual(computableEarnings(24000, true), { pct: 3, deduction: 720, computable: 23280 });
  assert.deepEqual(computableEarnings(-500, false), { pct: 7, deduction: 0, computable: 0 });
});

test("default example: 30.000 € income, 6.000 € expenses → general band 5, 380,88 € a month", () => {
  const r = calculateSelfEmployed(DEFAULT_INPUT);
  assert.equal(r.annual.net, 24000);
  assert.equal(r.annual.computable, 22320);
  assert.equal(r.monthlyEarnings, 1860);
  assert.equal(`${r.band.table}${r.band.n}`, "general5");
  assert.deepEqual(r.range, { min: 1209.15, max: 2030 });
  assert.equal(r.base, 1209.15);
  assert.equal(r.baseSource, "minimum");
  assert.equal(r.full.monthly, 380.88);
  assert.equal(r.full.annual, 4570.56);
  assert.deepEqual(r.bandMonthly, { min: 380.88, max: 639.45 });
  assert.equal(r.pay.monthly, 380.88);
  assert.deepEqual(r.regularisation, { kind: "none", definitiveBase: 1209.15, annual: 0 });
  // The breakdown is each item on the base; it adds up to the total within rounding.
  const sum = r.full.lines.reduce((s, l) => s + l.monthly, 0);
  assert.ok(Math.abs(sum - r.full.monthly) <= 0.03, String(sum));
  assert.deepEqual(r.full.lines.map((l) => l.monthly), [342.19, 15.72, 10.88, 1.21, 10.88]);
});

test("monthly amounts are multiplied by 12; empty or bad figures count as zero", () => {
  const a = calc({ period: "monthly", income: 2500, expenses: 500 });
  assert.equal(a.annual.income, 30000);
  assert.equal(a.annual.net, 24000);
  assert.equal(a.full.monthly, 380.88);
  const z = calc({ income: Number.NaN, expenses: -3 });
  assert.equal(z.annual.net, 0);
  assert.equal(`${z.band.table}${z.band.n}`, "reduced1");
  assert.equal(z.full.monthly, 205.88);
  // Expenses above income: zero earnings, not negative.
  assert.equal(calc({ income: 1000, expenses: 5000 }).annual.computable, 0);
});

test("chosen base: inside the band, below it (pay at regularisation), above it (refund), outside the law (clamped)", () => {
  const inside = calc({ base: 1500 });
  assert.equal(inside.baseSource, "chosen");
  assert.equal(inside.full.monthly, 472.5);
  assert.equal(inside.regularisation.kind, "none");

  const low = calc({ base: 950.98 });
  assert.equal(low.inRange, false);
  assert.equal(low.regularisation.kind, "pay");
  assert.equal(low.regularisation.definitiveBase, 1209.15);
  assert.equal(low.regularisation.annual, 975.84); // (380.88 − 299.56) × 12

  const high = calc({ base: 3000 });
  assert.equal(high.regularisation.kind, "refund");
  assert.equal(high.regularisation.definitiveBase, 2030);
  assert.equal(high.regularisation.annual, -3666.6); // (639.45 − 945.00) × 12

  const tooHigh = calc({ base: 9000 });
  assert.equal(tooHigh.baseSource, "clamped");
  assert.equal(tooHigh.base, MAX_BASE);
  const tooLow = calc({ base: 100 });
  assert.equal(tooLow.base, MIN_BASE);
  assert.equal(calc({ base: null }).baseSource, "minimum");
});

test("corporate: 3 % deduction and the 1.424,40 € floor even in a lower band", () => {
  const r = calc({ income: 18000, expenses: 0, corporate: true });
  assert.equal(r.annual.computable, 17460);
  assert.equal(r.monthlyEarnings, 1455);
  assert.equal(`${r.band.table}${r.band.n}`, "general2");
  assert.deepEqual(r.range, { min: 1424.4, max: 1500 });
  assert.equal(r.full.monthly, 448.69);
  // Very low earnings: still the group 7 minimum.
  const low = calc({ income: 6000, expenses: 0, corporate: true });
  assert.equal(low.band.table, "reduced");
  assert.deepEqual(low.range, { min: 1424.4, max: 1424.4 });
  assert.equal(calc({ income: 6000, expenses: 0, corporate: true, base: 1000 }).baseSource, "clamped");
});

test("tarifa plana: 88,64 € (TGSS) the first 12 months; extension only under the annual SMI, else claimed back", () => {
  const first = calc({ flatRate: "first" });
  assert.equal(first.pay.flatRate, true);
  assert.equal(first.pay.monthly, 88.64);
  assert.equal(first.pay.annual, 1063.68);
  assert.equal(first.full.monthly, 380.88);
  assert.equal(first.regularisation.kind, "flat-rate");

  // 18.000 − 0 − 7 % = 16.740 < 17.094: extension applies.
  const ok = calc({ flatRate: "second", income: 18000, expenses: 0 });
  assert.equal(ok.annual.computable, 16740);
  assert.equal(ok.flat.eligible, true);
  assert.equal(ok.pay.monthly, 88.64);

  // The default example (22.320 €) is above: no extension, full contribution, and the claim if it were applied.
  const no = calc({ flatRate: "second" });
  assert.equal(no.flat.eligible, false);
  assert.equal(no.pay.flatRate, false);
  assert.equal(no.pay.monthly, 380.88);
  assert.equal(no.regularisation.kind, "flat-rate-lost");
  assert.equal(no.regularisation.annual, 3506.88); // (380.88 − 88.64) × 12
});

test("band ranges read like the BOE's column: ≤ 670, > 900 y < 1.166,70, ≥ 1.166,70 y ≤ 1.300, > 6.000", () => {
  assert.deepEqual(BANDS_2026.map((b) => bandRangeText(b, "es")), [
    "≤ 670", "> 670 y ≤ 900", "> 900 y < 1.166,70",
    "≥ 1.166,70 y ≤ 1.300", "> 1.300 y ≤ 1.500", "> 1.500 y ≤ 1.700", "> 1.700 y ≤ 1.850", "> 1.850 y ≤ 2.030", "> 2.030 y ≤ 2.330",
    "> 2.330 y ≤ 2.760", "> 2.760 y ≤ 3.190", "> 3.190 y ≤ 3.620", "> 3.620 y ≤ 4.050", "> 4.050 y ≤ 6.000", "> 6.000",
  ]);
  assert.equal(bandRangeText(BANDS_2026[3]!, "en"), "≥ 1,166.70 and ≤ 1,300");
  assert.equal(bandRangeText(BANDS_2026[1]!, "ca"), "> 670 i ≤ 900");
});

test("band table: 15 rows, minimum and maximum contribution of each", () => {
  const t = bandTable();
  assert.equal(t.length, 15);
  assert.deepEqual(t[0], { band: BANDS_2026[0], minMonthly: 205.88, maxMonthly: 226.47 });
  assert.deepEqual(t.at(-1), { band: BANDS_2026.at(-1), minMonthly: 607.35, maxMonthly: 1606.88 });
});

/* -------------------------------------------------------------------------- */
/* Copy, hash, page                                                           */
/* -------------------------------------------------------------------------- */

test("hash: round trip, and a plain anchor or junk leaves the defaults", () => {
  const s: SelfEmployedInput = { period: "monthly", income: 2500, expenses: 300.5, corporate: true, flatRate: "second", base: 1500 };
  assert.deepEqual(readHash(writeHash(s), DEFAULT_INPUT), s);
  assert.deepEqual(readHash(writeHash(DEFAULT_INPUT), DEFAULT_INPUT), DEFAULT_INPUT);
  assert.deepEqual(readHash("#i=abc&g=-4&t=9&p=x&b=-1", DEFAULT_INPUT), DEFAULT_INPUT);
  // The client only reacts to a calculator hash.
  assert.match(read("src/components/programmatic/self-employed/SelfEmployedCalculator.tsx"), /\/\^#\(\?:\.\*&\)\?i=\/\.test/);
});

test("copy: every message in es, ca and en, with the figures of the case", () => {
  for (const l of SE_LOCALES) {
    const t = CALC_COPY[l];
    for (const v of Object.values(t)) if (typeof v === "string") assert.ok(v.trim().length > 0, l);
    assert.ok(t.regularisation(calc({ base: 950.98 })).includes(money(975.84, l)), l);
    assert.ok(t.regularisation(calc({ base: 3000 })).includes(money(3666.6, l)), l);
    assert.ok(t.regularisation(calc({ flatRate: "second" })).includes(money(SMI_ANNUAL, l)), l);
    assert.ok(t.flatNote(calc({ flatRate: "first" }))!.includes(money(88.64, l)), l);
    assert.equal(t.flatNote(calc({})), null);
    assert.ok(t.baseHint(calc({})).includes(money(1209.15, l)) && t.baseHint(calc({})).includes(money(2030, l)), l);
    // YMYL: the disclaimer sends to the TGSS and the official simulator.
    assert.match(t.disclaimer, /Import@ss/);
    assert.ok(bandName(BANDS_2026[4]!, l).includes("2"), l);
  }
});

test("page: server-rendered example, full table, 2027 section, official links, More calculators, hub crumb", () => {
  const page = read("src/components/programmatic/self-employed/SelfEmployedPage.tsx");
  assert.match(page, /<SelfEmployedCalculator locale=\{locale\} initial=\{DEFAULT_INPUT\} \/>/);
  assert.match(page, /bandTable\(\)/);
  assert.match(page, /id="2027"/);
  assert.match(page, /OFFICIAL_LINKS\.simulator/);
  assert.match(page, /<MoreCalculators current="self-employed" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\),/);
  assert.match(page, /FAQPage/);
  // 2027 is "pending" in all three languages while no table is loaded.
  assert.equal(STATUS_2027.bands, null);
  assert.match(page, /Pendiente: a \$\{asOf\}/);
  assert.match(page, /Pendent: a \$\{asOf\}/);
  assert.match(page, /Pending: as of \$\{asOf\}/);
  assert.equal(STATUS_2027.intergenerationalEquity, 1);
  // Routes: one per language, 404 elsewhere, never dynamicParams = false.
  for (const l of SE_LOCALES) {
    const file = join(ROOT, "src", "app", "(public)", "[locale]", selfEmployedPath(l).split("/")[2]!, selfEmployedPath(l).split("/")[3]!, "page.tsx");
    assert.ok(existsSync(file), file);
    const src = readFileSync(file, "utf8");
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, /^export const dynamicParams = true;$/m);
  }
  assert.deepEqual(selfEmployedEditions(), {
    ca: "/ca/calculadores/quota-autonoms/",
    es: "/es/calculadoras/cuota-autonomos/",
    en: "/en/calculators/spain-self-employed-contributions/",
  });
});

test("titles and descriptions fit the snippet", async () => {
  const src = read("src/components/programmatic/self-employed/SelfEmployedPage.tsx");
  const titles = [...src.matchAll(/^\s{4}title: `([^`]+)`,$/gm)].map((m) => m[1]!.replace("${Y}", String(RULES_YEAR)));
  const descs = [...src.matchAll(/^\s{4}description: `([^`]+)`,$/gm)].map((m) => m[1]!.replaceAll("${Y}", String(RULES_YEAR)));
  assert.equal(titles.length, 3);
  assert.equal(descs.length, 3);
  for (const t of titles) assert.ok(t.length <= 60, `${t.length}: ${t}`);
  for (const d of descs) assert.ok(d.length <= 165, `${d.length}: ${d}`);
});

test("sitemap (hreflang), hub card and llms.txt carry the calculator", () => {
  const entries = selfEmployedSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) {
    assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
    assert.ok(String(e.alternates!.languages!["x-default"]).endsWith("/en/calculators/spain-self-employed-contributions/"));
  }
  assert.match(read("src/app/sitemap.ts"), /\.\.\.selfEmployedSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: selfEmployedEditions\(\)/);
  assert.match(read("src/lib/programmatic/calculators/hub.ts"), /key: "self-employed"/);
});

test("official sources only: BOE and Seguridad Social", () => {
  const hosts = new Set(["www.boe.es", "www.seg-social.es", "portal.seg-social.gob.es"]);
  for (const s of Object.values(SOURCES)) assert.ok(hosts.has(new URL(s.url).host), s.url);
  for (const u of Object.values(OFFICIAL_LINKS)) assert.ok(hosts.has(new URL(u).host), u);
  const page = read("src/components/programmatic/self-employed/SelfEmployedPage.tsx");
  for (const m of page.matchAll(/https?:\/\/[^"'`\s)]+/g)) assert.fail(`hard-coded URL in the page: ${m[0]}`);
});

/* -------------------------------------------------------------------------- */
/* Date guards                                                                */
/* -------------------------------------------------------------------------- */

test("date guard: the rules' as-of date is not in the future", () => {
  assert.equal(RULES_YEAR, 2026);
  assert.ok(Date.parse(`${RULES_AS_OF}T00:00:00Z`) <= Date.now(), "RULES_AS_OF in the future");
});

test("date guard: re-read the BOE for 2027 tables by 15 Dec 2026", () => {
  // Look for a royal decree-law, a 2027 budget law or the 2027 Orden de cotización with "tramos de
  // rendimientos netos" for 2027 (BOE; Seguridad Social news). If one is out, fill STATUS_2027.bands
  // and .source from its text. If none, move STATUS_2027_RECHECK_BY (and RULES_AS_OF) to the day checked.
  if (STATUS_2027.bands !== null) return;
  assert.ok(Date.now() < Date.parse(`${STATUS_2027_RECHECK_BY}T00:00:00Z`), "Cuota de autónomos: re-check the BOE for the 2027 tables and move STATUS_2027_RECHECK_BY");
});

test("date guard: from 1 January 2027 the calculator needs the 2027 rules", () => {
  // On 1 January the page's "2026" rules stop being the current ones. Load the 2027 tables, rates (MEI 1 %
  // by LGSS DT 43.ª) and the tarifa plana figure into a rules-2027.ts from the instrument that sets them
  // (royal decree-law / budget law / Orden de cotización 2027) — or, if none is published yet, state on the
  // page which 2026 rules keep applying and why (RDL 3/2026 art. 3.4 "hasta la aprobación…"), then move RULES_UNTIL.
  assert.ok(Date.now() < Date.parse(`${RULES_UNTIL}T00:00:00Z`), "Cuota de autónomos: load the 2027 rules");
});
