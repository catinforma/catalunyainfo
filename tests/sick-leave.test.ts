import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALC_COPY, SL_LOCALES, daysFromEnd, endFromDays, ofMonthYear, readHash, sickLeaveEditions, sickLeavePath, writeHash } from "../src/lib/programmatic/sick-leave/copy.ts";
import { DEFAULT_INPUT, SPECIAL_KINDS, baseFromAnnualGross, calculateSickLeave, referenceMonth, regimeFor, type SickLeaveInput } from "../src/lib/programmatic/sick-leave/engine.ts";
import {
  CONVALIDATION_RECHECK_BY,
  DAYS,
  MAX_BASE_2026,
  OFFICIAL_LINKS,
  PCT,
  QUOTE,
  REFORM_FROM,
  RULES_AS_OF,
  RULES_UNTIL,
  SOURCES,
} from "../src/lib/programmatic/sick-leave/rules.ts";
import { sickLeaveSitemapEntries } from "../src/lib/programmatic/sick-leave/sitemap.ts";

/**
 * "Calculadora de baja laboral" (lib/programmatic/sick-leave/): the
 * incapacidad temporal rules of the LGSS (arts. 169–176), RD 53/1980 and
 * Decreto 3158/1966, before and after Real Decreto-ley 31/2026 (1 Dec 2026),
 * with hand-checked cases, and the date guards.
 */

const ROOT = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const calc = (patch: Partial<SickLeaveInput>) => calculateSickLeave({ ...DEFAULT_INPUT, ...patch });
const shape = (r: ReturnType<typeof calc>) => r.bands.map((b) => [b.from, b.to, b.kind, b.pct, b.payer, b.amount]);

/* -------------------------------------------------------------------------- */
/* The figures of the law                                                     */
/* -------------------------------------------------------------------------- */

test("rules: 60 % days 4–20, 75 % from 21 and the day after (professional), employer days 4–15, 365 + 180 = 545", () => {
  assert.equal(PCT.early, 60);
  assert.equal(PCT.standard, 75);
  assert.equal(PCT.donation, 100);
  assert.equal(DAYS.commonFirstPaid, 4);
  assert.equal(DAYS.employerLast, 15);
  assert.equal(DAYS.earlyLast, 20);
  assert.equal(DAYS.ordinaryMax + DAYS.extension, DAYS.absoluteMax);
  assert.equal(DAYS.absoluteMax, 545);
  assert.equal(MAX_BASE_2026, 5101.2);
  assert.equal(REFORM_FROM, "2026-12-01");
  // The quotes carry the figures the engine uses.
  assert.match(QUOTE.lgss173common, /a partir del cuarto día .* desde el día cuarto al decimoquinto de baja, ambos inclusive, el subsidio estará a cargo del empresario/);
  assert.match(QUOTE.rd53, /hasta el veinteavo día, inclusive, .* sesenta por ciento/);
  assert.match(QUOTE.d3158, /setenta y cinco por ciento/);
  assert.match(QUOTE.lgss173professional, /desde el día siguiente al de la baja/);
  assert.match(QUOTE.lgss171base2026, /mes inmediatamente anterior al mes previo al del hecho causante/);
  assert.match(QUOTE.lgss169duration, /trescientos sesenta y cinco días, prorrogables por otros 180 días/);
});

/* -------------------------------------------------------------------------- */
/* Hand-checked cases                                                         */
/* -------------------------------------------------------------------------- */

test("default example: common illness, 1.800 € base (60 €/day), 30 days from 1 Dec 2026 = 1.062 €", () => {
  const r = calc({});
  assert.equal(r.regime, "from-dec-2026");
  assert.deepEqual(r.referenceMonth, { year: 2026, month: 10 });
  assert.equal(r.dailyBase, 60);
  assert.deepEqual(shape(r), [
    [1, 3, "unpaid", 0, "none", 0],
    [4, 15, "benefit", 60, "employer", 432],
    [16, 20, "benefit", 60, "entity", 180],
    [21, 30, "benefit", 75, "entity", 450],
  ]);
  assert.equal(r.totals.benefit, 1062);
  assert.equal(r.totals.employer, 432);
  assert.equal(r.totals.entity, 630);
  assert.equal(r.totals.total, 1062);
  assert.equal(r.endDate, "2026-12-30");
  assert.equal(r.bands[1]!.startDate, "2026-12-04");
  assert.equal(r.bands[1]!.endDate, "2026-12-15");
});

test("reference month: the month before until 30 Nov 2026, the month before last from 1 Dec 2026", () => {
  assert.equal(regimeFor("2026-11-30"), "until-nov-2026");
  assert.equal(regimeFor("2026-12-01"), "from-dec-2026");
  assert.deepEqual(referenceMonth("2026-11-16"), { year: 2026, month: 10 });
  assert.deepEqual(referenceMonth("2026-12-15"), { year: 2026, month: 10 });
  assert.deepEqual(referenceMonth("2027-01-10"), { year: 2026, month: 11 });
  assert.deepEqual(referenceMonth("2027-02-01"), { year: 2026, month: 12 });
  assert.deepEqual(referenceMonth("2026-01-05"), { year: 2025, month: 12 });
  // A base from 2027 has no loaded maximum: nothing is clamped and the page says so.
  const r = calc({ start: "2027-03-01", base: 6000 });
  assert.equal(r.maxBaseKnown, false);
  assert.equal(r.clamped, false);
  assert.equal(r.baseUsed, 6000);
});

test("professional: day 1 salary (employer), then 75 % (2.100 € base + 730 € overtime / 365 = 72 €/day)", () => {
  const r = calc({ contingency: "professional", base: 2100, overtime: 730, start: "2026-11-20", days: 10 });
  assert.equal(r.dailyBase, 72);
  assert.deepEqual(shape(r), [
    [1, 1, "salary", 0, "employer", 0],
    [2, 10, "benefit", 75, "entity", 486],
  ]);
  assert.equal(r.totals.salaryDays, 1);
  assert.equal(r.totals.benefit, 486);
  // Overtime only counts for professional contingencies.
  assert.equal(calc({ contingency: "common", base: 2100, overtime: 730 }).dailyBase, 70);
});

test("special situations until 30 Nov 2026 (Ley 6/2024 text, Seguridad Social percentages)", () => {
  const base = { contingency: "special" as const, base: 1500, start: "2026-11-10" };
  // Menstruation: 60 % from day 1.
  assert.deepEqual(shape(calc({ ...base, special: "menstruation", days: 3 })), [[1, 3, "benefit", 60, "entity", 90]]);
  // Pregnancy (termination or week 39): salary day 1, 60 % days 2–20, 75 % from 21 (100 €/day).
  const p = calc({ ...base, special: "pregnancy", base: 3000, days: 25 });
  assert.deepEqual(shape(p), [
    [1, 1, "salary", 0, "employer", 0],
    [2, 20, "benefit", 60, "entity", 1140],
    [21, 25, "benefit", 75, "entity", 375],
  ]);
  assert.equal(p.totals.benefit, 1515);
  // Donation: 100 % from day 1.
  assert.deepEqual(shape(calc({ ...base, special: "donation", days: 5 })), [[1, 5, "benefit", 100, "entity", 250]]);
  // Menopause and gender violence were not special yet: calculated as common illness.
  const n = calc({ ...base, special: "menopause", days: 5 });
  assert.equal(n.specialNotYet, true);
  assert.deepEqual(shape(n), [
    [1, 3, "unpaid", 0, "none", 0],
    [4, 5, "benefit", 60, "employer", 60],
  ]);
});

test("special situations from 1 Dec 2026 (RDL 31/2026): all paid from the day after, salary on day 1", () => {
  const base = { contingency: "special" as const, base: 1500, start: "2026-12-10" };
  for (const k of SPECIAL_KINDS) {
    const r = calc({ ...base, special: k, days: 3 });
    assert.equal(r.specialNotYet, false);
    assert.deepEqual(r.bands[0]!.kind, "salary", k);
    assert.equal(r.bands[0]!.to, 1, k);
    assert.equal(r.bands[1]!.payer, "entity", k);
    assert.equal(r.bands[1]!.pct, k === "donation" ? 100 : 60, k);
  }
  assert.equal(calc({ ...base, special: "menstruation", days: 3 }).totals.benefit, 60);
  assert.equal(calc({ ...base, special: "donation", days: 5 }).totals.benefit, 200);
  assert.equal(calc({ ...base, special: "violence", days: 21 }).bands.at(-1)!.pct, 75);
});

test("the maximum base of 2026 caps the base; days are capped at 545 with days 366+ marked as extension", () => {
  const c = calc({ base: 6000 });
  assert.equal(c.clamped, true);
  assert.equal(c.baseUsed, 5101.2);
  assert.equal(c.dailyBase, 170.04);
  const r = calc({ days: 600 });
  assert.equal(r.capped, true);
  assert.equal(r.days, 545);
  assert.deepEqual(
    r.bands.map((b) => [b.from, b.to, b.extension]),
    [
      [1, 3, false],
      [4, 15, false],
      [16, 20, false],
      [21, 365, false],
      [366, 545, true],
    ],
  );
  assert.equal(r.bands.at(-1)!.amount, 8100);
  assert.equal(calc({ days: 545 }).capped, false);
});

test("convenio top-up to 100 % from day 1: the employer completes every day to the full daily base", () => {
  const r = calc({ complementPct: 100 });
  assert.deepEqual(
    r.bands.map((b) => [b.from, b.to, b.complementPct, b.complement]),
    [
      [1, 3, 100, 180],
      [4, 15, 40, 288],
      [16, 20, 40, 120],
      [21, 30, 25, 150],
    ],
  );
  assert.equal(r.totals.complement, 738);
  assert.equal(r.totals.total, 1800);
  // From day 4 only, the first three days stay unpaid.
  const f = calc({ complementPct: 100, complementFrom: 4 });
  assert.equal(f.bands[0]!.complement, 0);
  assert.equal(f.totals.complement, 558);
  // Never on a full-salary day.
  const p = calc({ contingency: "professional", complementPct: 100, days: 5 });
  assert.equal(p.bands[0]!.complement, 0);
  assert.equal(p.totals.complement, 60);
});

test("days of the base, the gross-salary helper and odd inputs", () => {
  assert.equal(calc({ base: 3100, baseDays: 31 }).dailyBase, 100);
  assert.equal(calc({ base: 3100, baseDays: 0 }).dailyBase, 3100 / 30);
  assert.equal(baseFromAnnualGross(24000), 2000);
  assert.equal(baseFromAnnualGross(80000), 5101.2);
  assert.equal(baseFromAnnualGross(-1), 0);
  assert.equal(calc({ days: 0 }).days, 1);
  assert.equal(calc({ base: -5 }).totals.total, 0);
  assert.equal(calc({ start: "not a date" }).regime, "from-dec-2026");
});

/* -------------------------------------------------------------------------- */
/* Words, hash, dates                                                         */
/* -------------------------------------------------------------------------- */

test("hash round-trip, end date and days", () => {
  const s: SickLeaveInput = { contingency: "special", special: "pregnancy", base: 2250.5, baseDays: 31, overtime: 0, start: "2027-01-12", days: 45, complementPct: 90, complementFrom: 4 };
  assert.deepEqual(readHash(writeHash(s), DEFAULT_INPUT), s);
  const p: SickLeaveInput = { ...DEFAULT_INPUT, contingency: "professional", overtime: 500 };
  assert.deepEqual(readHash(writeHash(p), DEFAULT_INPUT), p);
  assert.deepEqual(readHash("#t=zz&b=-3&s=2026-02-30&n=0", DEFAULT_INPUT), DEFAULT_INPUT);
  assert.equal(endFromDays("2026-12-01", 30), "2026-12-30");
  assert.equal(daysFromEnd("2026-12-01", "2026-12-30"), 30);
  assert.equal(daysFromEnd("2026-12-01", "2026-11-30"), 0);
  assert.equal(ofMonthYear({ year: 2026, month: 10 }, "ca"), "d'octubre de 2026");
  assert.equal(ofMonthYear({ year: 2026, month: 11 }, "es"), "de noviembre de 2026");
});

test("every language has every word", () => {
  const keys = Object.keys(CALC_COPY.es).sort();
  for (const l of SL_LOCALES) assert.deepEqual(Object.keys(CALC_COPY[l]).sort(), keys, l);
  const r = calc({});
  for (const l of SL_LOCALES) {
    assert.match(CALC_COPY[l].base(r, "common"), /2026/);
    assert.ok(CALC_COPY[l].irpf.includes("IRPF"), l);
  }
});

/* -------------------------------------------------------------------------- */
/* Page, routes, sitemap, hub, llms                                           */
/* -------------------------------------------------------------------------- */

test("page: server-rendered calculator, reform section, quotes, FAQ, more calculators; one route per language", () => {
  const page = read("src/components/programmatic/sick-leave/SickLeavePage.tsx");
  assert.match(page, /<SickLeaveCalculator locale=\{locale\} initial=\{DEFAULT_INPUT\} \/>/);
  assert.match(page, /id="cambios-diciembre-2026"/);
  assert.match(page, /QUOTE\.rdl31transitional/);
  assert.match(page, /<MoreCalculators current="sick-leave" locale=\{locale\} \/>/);
  assert.match(page, /hubCrumb\(locale\),/);
  assert.match(page, /FAQPage/);
  for (const l of SL_LOCALES) {
    const [, , root, slug] = sickLeavePath(l).split("/");
    const file = join(ROOT, "src", "app", "(public)", "[locale]", root!, slug!, "page.tsx");
    assert.ok(existsSync(file), file);
    const src = readFileSync(file, "utf8");
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, /^export const dynamicParams = true;$/m);
  }
  assert.deepEqual(sickLeaveEditions(), { ca: "/ca/calculadores/baixa-laboral/", es: "/es/calculadoras/baja-laboral/", en: "/en/calculators/sick-leave-pay-spain/" });
});

test("titles and descriptions fit the snippet", () => {
  const src = read("src/components/programmatic/sick-leave/SickLeavePage.tsx");
  const titles = [...src.matchAll(/^\s{4}title: "([^"]+)",$/gm)].map((m) => m[1]!);
  const descs = [...src.matchAll(/^\s{4}description: "([^"]+)",$/gm)].map((m) => m[1]!);
  assert.equal(titles.length, 3);
  assert.equal(descs.length, 3);
  for (const t of titles) assert.ok(t.length <= 60, `${t.length}: ${t}`);
  for (const d of descs) assert.ok(d.length >= 70 && d.length <= 165, `${d.length}: ${d}`);
});

test("sitemap (hreflang), hub card and llms.txt carry the calculator", () => {
  const entries = sickLeaveSitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) {
    assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
    assert.ok(String(e.alternates!.languages!["x-default"]).endsWith("/en/calculators/sick-leave-pay-spain/"));
  }
  assert.match(read("src/app/sitemap.ts"), /\.\.\.sickLeaveSitemapEntries\(\)/);
  assert.match(read("src/lib/seo/llms.ts"), /hubs: sickLeaveEditions\(\)/);
  assert.match(read("src/lib/programmatic/calculators/hub.ts"), /key: "sick-leave"/);
});

test("official sources only: BOE and Seguridad Social; no URL typed in the page", () => {
  const hosts = new Set(["www.boe.es", "www.seg-social.es"]);
  for (const s of Object.values(SOURCES)) assert.ok(hosts.has(new URL(s.url).host), s.url);
  for (const u of Object.values(OFFICIAL_LINKS)) assert.ok(hosts.has(new URL(u).host), u);
  const page = read("src/components/programmatic/sick-leave/SickLeavePage.tsx");
  for (const m of page.matchAll(/https?:\/\/[^"'`\s)]+/g)) assert.fail(`hard-coded URL in the page: ${m[0]}`);
});

/* -------------------------------------------------------------------------- */
/* Date guards                                                                */
/* -------------------------------------------------------------------------- */

test("date guard: the rules' as-of date is not in the future", () => {
  assert.ok(Date.parse(`${RULES_AS_OF}T00:00:00Z`) <= Date.now(), "RULES_AS_OF in the future");
});

test("date guard: re-read the BOE for the convalidación of RDL 31/2026 before its 1 Dec 2026 changes", () => {
  // Search the BOE (sumarios from 22 Oct 2026; analysis of BOE-A-2026-21872, "Referencias posteriores") for the
  // Congress resolution ratifying (convalidación) or rejecting (derogación) Royal Decree-law 31/2026. If ratified,
  // say so in the page's reform section (reformText.status) and add the resolution to SOURCES. If rejected, the
  // 1 Dec changes never happen: set REFORM_FROM out of reach and rewrite the reform section. Then move this date.
  assert.ok(Date.now() < Date.parse(`${CONVALIDATION_RECHECK_BY}T00:00:00Z`), "Baja laboral: check the convalidación of RDL 31/2026");
});

test("date guard: from 1 January 2027 the calculator needs the year's rules re-read", () => {
  // The maximum base (5.101,20 € in 2026, Orden PJC/297/2026 art. 2.1) caps bases of 2026 months only; bajas from
  // 1 Mar 2027 use a 2027 month. Load the 2027 maximum from the 2027 Orden de cotización (or say on the page that
  // it is not published yet), re-read LGSS arts. 169–176 for changes, then move RULES_UNTIL and RULES_AS_OF.
  assert.ok(Date.now() < Date.parse(`${RULES_UNTIL}T00:00:00Z`), "Baja laboral: re-read the 2027 rules");
});
