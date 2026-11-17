import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { CALCULATOR_USE_IDS } from "../src/lib/analytics/events.ts";
import { PAY_DATES } from "../src/lib/content/batch02/pay-dates.ts";
import { searchShortcuts } from "../src/lib/content/search-shortcuts.ts";
import { HUB_GROUPS, calculatorCard } from "../src/lib/programmatic/calculators/hub.ts";
import { CALCULATORS, CALCULATORS_ROOT, CALC_LOCALES, calcEditions, calculatorSlugs } from "../src/lib/programmatic/calculators/paths.ts";
import { CALC_COPY, EP_LOCALES, EXTRA_META, extraPayEditions, extraPayPath } from "../src/lib/programmatic/extra-pay/copy.ts";
import { DEFAULT_INPUT, EXAMPLE_START, calculateExtraPay, pageExamples, workerRate } from "../src/lib/programmatic/extra-pay/engine.ts";
import { EXTRA_PAY_RULES_AS_OF, EXTRA_PAY_RULES_UNTIL, EXTRA_PAY_YEAR, OFFICIAL_LINKS, QUOTE, SOURCES, accrualPeriod } from "../src/lib/programmatic/extra-pay/rules.ts";
import { extraPaySitemapEntries } from "../src/lib/programmatic/extra-pay/sitemap.ts";
import { DEFAULT_INPUT as SALARY_DEFAULT, calculateNetSalary } from "../src/lib/programmatic/net-salary/engine.ts";
import { SALARY_RULES_UNTIL, SALARY_RULES_YEAR, SOCIAL_SECURITY } from "../src/lib/programmatic/net-salary/rules-2026.ts";

/**
 * "Paga extra de Navidad 2026" (lib/programmatic/extra-pay/): the rules as
 * quoted from the BOE on 17 Nov 2026, the engine against the net salary
 * engine it reuses, hand-checked earned parts, the wiring and the date guards.
 */

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "src", "app", "(public)", "[locale]");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const PAGE = "src/components/programmatic/extra-pay/ExtraPayPage.tsx";
const CALC = "src/components/programmatic/extra-pay/ExtraPayCalculator.tsx";

/* -------------------------------------------------------------------------- */
/* Rules                                                                      */
/* -------------------------------------------------------------------------- */

test("rules: the quotes say what the page builds on (ET 31, LGSS 147.1 and 46.1, Orden PJC/297/2026 art. 1, RIRPF 82 and 83)", () => {
  assert.match(QUOTE.et31, /^El trabajador tiene derecho a dos gratificaciones extraordinarias al año, una de ellas con ocasión de las fiestas de Navidad/);
  assert.match(QUOTE.et31, /Igualmente se fijará por convenio colectivo la cuantía de tales gratificaciones\./);
  assert.match(QUOTE.et31, /se prorrateen en las doce mensualidades\.$/);
  assert.match(QUOTE.et29, /en la fecha y lugar convenidos o conforme a los usos y costumbres\.$/);
  assert.equal(QUOTE.lgss147, "Las percepciones de vencimiento superior al mensual se prorratearán a lo largo de los doce meses del año.");
  assert.match(QUOTE.orden1, /se añadirá la parte proporcional de las gratificaciones extraordinarias/);
  assert.match(QUOTE.orden1Monthly, /se dividirá por 12\.$/);
  assert.match(QUOTE.rirpf82, /^El importe de la retención será el resultado de aplicar el tipo de retención a la cuantía total de las retribuciones/);
  assert.match(QUOTE.rirpf83, /en el año natural$/);
  assert.match(QUOTE.lgss46, /dos pagas extraordinarias que se devengarán en los meses de junio y noviembre\.$/);
  for (const s of Object.values(SOURCES)) {
    assert.match(s.url, /^https:\/\/www\.boe\.es\/buscar\/act\.php\?id=BOE-A-\d{4}-\d+#a\d+$/, s.ref);
    assert.ok(s.url.includes(s.ref), s.ref);
    assert.ok(s.date <= EXTRA_PAY_RULES_AS_OF, `${s.ref}: consolidated version after the reading date`);
  }
  for (const url of Object.values(OFFICIAL_LINKS)) assert.match(url, /^https:\/\/[a-z0-9.]+\.gob\.es\//);
});

test("rules: the accrual periods are the calendar year and the second half, as in the finiquito calculator", () => {
  assert.deepEqual(accrualPeriod("annual"), { from: `${EXTRA_PAY_YEAR}-01-01`, to: `${EXTRA_PAY_YEAR}-12-31` });
  assert.deepEqual(accrualPeriod("semester"), { from: `${EXTRA_PAY_YEAR}-07-01`, to: `${EXTRA_PAY_YEAR}-12-31` });
});

/* -------------------------------------------------------------------------- */
/* Engine                                                                     */
/* -------------------------------------------------------------------------- */

test("engine: the default example is the net salary page's extra payment (30,000 € in 14 payments)", () => {
  const r = calculateExtraPay(DEFAULT_INPUT);
  const s = calculateNetSalary(SALARY_DEFAULT);
  assert.equal(r.error, null);
  assert.equal(r.full, 2142.86);
  assert.equal(r.gross, 2142.86);
  assert.equal(r.rate, s.irpf.rate);
  assert.equal(r.rate, 16.42);
  assert.equal(r.irpf, 351.86);
  assert.equal(r.net, s.net.extraPayment);
  assert.equal(r.net, 1791);
  assert.equal(r.annualGross, SALARY_DEFAULT.gross);
});

test("engine: no Social Security in the extra pay; it is already in every month's base (LGSS 147.1)", () => {
  for (const salary of [12000, 18000, 30000, 45000, 90000]) {
    const r = calculateExtraPay({ ...DEFAULT_INPUT, salary });
    assert.equal(r.net, Math.round((r.gross - r.irpf!) * 100) / 100, String(salary));
    assert.equal(r.ss.baseMonthly, Math.round((salary / 12) * 100) / 100);
  }
  assert.equal(workerRate("open-ended"), 6.5);
  assert.equal(workerRate("fixed-term"), 6.55);
  assert.equal(workerRate("short"), 6.55);
  assert.equal(calculateExtraPay(DEFAULT_INPUT).ss.alreadyPaid, 139.29);
  // Above the maximum base (5,101.20 € a month) the page does not attribute a contribution to the pay.
  const high = calculateExtraPay({ ...DEFAULT_INPUT, salary: 70000 });
  assert.ok(high.ss.baseMonthly > SOCIAL_SECURITY.maxBaseMonthly);
  assert.equal(high.ss.capped, true);
  assert.equal(high.ss.alreadyPaid, null);
});

test("engine: the earned part of a new hire, in calendar days, for each accrual period", () => {
  const { hireAnnual, hireSemester } = pageExamples();
  assert.equal(EXAMPLE_START, `${EXTRA_PAY_YEAR}-09-01`);
  // 1 Sep to 31 Dec = 30 + 31 + 30 + 31 = 122 days; the year has 365, the second half 184.
  assert.deepEqual([hireAnnual.accrued.days, hireAnnual.period.days], [122, 365]);
  assert.deepEqual([hireSemester.accrued.days, hireSemester.period.days], [122, 184]);
  assert.equal(hireAnnual.gross, Math.round(((2142.86 * 122) / 365) * 100) / 100);
  assert.equal(hireAnnual.gross, 716.24);
  assert.equal(hireSemester.gross, 1420.81);
  assert.ok(hireAnnual.newHire && hireSemester.newHire);
  // Started before the period: the whole pay; on its first day: the whole pay too.
  assert.equal(calculateExtraPay({ ...DEFAULT_INPUT, accrual: "semester", start: `${EXTRA_PAY_YEAR}-03-15` }).gross, 2142.86);
  assert.equal(calculateExtraPay({ ...DEFAULT_INPUT, start: `${EXTRA_PAY_YEAR}-01-01` }).newHire, false);
  assert.equal(calculateExtraPay({ ...DEFAULT_INPUT, start: `${EXTRA_PAY_YEAR - 3}-05-10` }).gross, 2142.86);
  // The last day of the period: one day.
  assert.equal(calculateExtraPay({ ...DEFAULT_INPUT, start: `${EXTRA_PAY_YEAR}-12-31` }).accrued.days, 1);
  // After the period, or not a date: an error, never a figure.
  assert.equal(calculateExtraPay({ ...DEFAULT_INPUT, start: `${EXTRA_PAY_YEAR + 1}-01-02` }).error, "start");
  assert.equal(calculateExtraPay({ ...DEFAULT_INPUT, start: "2026-02-30" }).error, "start");
});

test("engine: monthly or annual salary, the agreement's own amount, prorated payments", () => {
  const monthly = calculateExtraPay({ ...DEFAULT_INPUT, mode: "monthly", salary: 2000 });
  assert.equal(monthly.full, 2000);
  assert.equal(monthly.annualGross, 28000);
  assert.equal(monthly.ordinaryMonthly, 2000);
  const custom = calculateExtraPay({ ...DEFAULT_INPUT, mode: "monthly", salary: 2000, extraAmount: 1500 });
  assert.equal(custom.full, 1500);
  assert.equal(custom.annualGross, 27000);
  const annualCustom = calculateExtraPay({ ...DEFAULT_INPUT, extraAmount: 1800 });
  assert.equal(annualCustom.full, 1800);
  assert.equal(annualCustom.ordinaryMonthly, 2200);
  // 12 payments: no December payment, one twelfth of a whole pay in each payslip.
  const { prorated } = pageExamples();
  assert.equal(prorated.prorated, true);
  assert.equal(prorated.net, null);
  assert.equal(prorated.monthlyShare!.gross, 178.57);
  assert.equal(prorated.monthlyShare!.net, Math.round((178.57 - (178.57 * 16.42) / 100) * 100) / 100);
  assert.equal(prorated.rate, 16.42);
});

test("engine: the payslip rate, the foral regions and bad inputs", () => {
  const payslip = calculateExtraPay({ ...DEFAULT_INPUT, withholding: "payslip", rate: 15 });
  assert.equal(payslip.rate, 15);
  assert.equal(payslip.irpf, 321.43);
  assert.equal(payslip.estimate, null);
  assert.equal(calculateExtraPay({ ...DEFAULT_INPUT, withholding: "payslip", rate: Number.NaN }).error, "rate");
  assert.equal(calculateExtraPay({ ...DEFAULT_INPUT, withholding: "payslip", rate: 120 }).error, "rate");
  // Navarre and the Basque Country: no estimate, the payslip rate works.
  for (const region of ["navarra", "pais-vasco"]) {
    assert.equal(calculateExtraPay({ ...DEFAULT_INPUT, region }).error, "foral", region);
    assert.equal(calculateExtraPay({ ...DEFAULT_INPUT, region, withholding: "payslip", rate: 14 }).error, null, region);
  }
  assert.equal(calculateExtraPay({ ...DEFAULT_INPUT, salary: 0 }).error, "salary");
  // Ceuta: the net salary engine's 60 % cut flows through.
  assert.ok(calculateExtraPay({ ...DEFAULT_INPUT, region: "ceuta" }).rate! < calculateExtraPay(DEFAULT_INPUT).rate!);
});

/* -------------------------------------------------------------------------- */
/* Pages and wiring                                                           */
/* -------------------------------------------------------------------------- */

test("paths: in the registry right after the net salary calculator, one route per language that 404s in the others", () => {
  assert.deepEqual(extraPayEditions(), { ca: "/ca/calculadores/paga-extra/", es: "/es/calculadoras/paga-extra/", en: "/en/calculators/christmas-extra-pay-spain/" });
  assert.deepEqual(calcEditions("extra-pay"), extraPayEditions());
  const ids = CALCULATORS.map((c) => c.id);
  assert.equal(ids[ids.indexOf("net-salary") + 1], "extra-pay");
  for (const l of CALC_LOCALES) {
    const src = readFileSync(join(APP, CALCULATORS_ROOT[l], calculatorSlugs("extra-pay")[l], "page.tsx"), "utf8");
    assert.match(src, new RegExp(`if \\(locale !== "${l}"\\) notFound\\(\\);`));
    assert.match(src, new RegExp(`<ExtraPayRoute locale="${l}" />`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, /^export const revalidate = false;$/m);
    assert.match(src, new RegExp(`return \\[\\{ locale: "${l}" \\}\\];`));
  }
  assert.ok(!existsSync(join(APP, "calculadoras", "christmas-extra-pay-spain")));
});

test("titles and descriptions fit the snippet; the three editions are complete", () => {
  for (const l of EP_LOCALES) {
    const m = EXTRA_META[l];
    assert.ok(m.title.length <= 60, `${l} title ${m.title.length}: ${m.title}`);
    assert.ok(m.description.length >= 70 && m.description.length <= 165, `${l} description ${m.description.length}`);
    assert.ok(m.title.includes(String(EXTRA_PAY_YEAR)) && m.h1.includes(String(EXTRA_PAY_YEAR)), l);
    assert.equal(extraPayPath(l), extraPayEditions()[l]);
  }
  // Same keys in every language, none empty.
  const keys = (o: object) => Object.keys(o).sort();
  for (const l of EP_LOCALES) {
    assert.deepEqual(keys(CALC_COPY[l]), keys(CALC_COPY.es), l);
    for (const [k, v] of Object.entries(CALC_COPY[l])) if (typeof v === "string") assert.ok(v.trim().length > 0, `${l}.${k}`);
  }
});

test("the page: server-rendered answer, official quotes and tools, YMYL disclaimer, links both ways", () => {
  const src = read(PAGE);
  assert.match(src, /<ExtraPayCalculator locale=\{locale\} initial=\{DEFAULT_INPUT\} \/>/);
  assert.match(src, /<p className="ci-measure mt-4 text-lg text-\[var\(--color-ink-soft\)\]">\{lead\}<\/p>/);
  for (const q of ["QUOTE.et31", "QUOTE.lgss147", "QUOTE.orden1", "QUOTE.rirpf82"]) assert.ok(src.includes(q), q);
  assert.match(src, /OFFICIAL_LINKS\.aeatSimulator/);
  assert.match(src, /OFFICIAL_LINKS\.regcon/);
  assert.match(src, /\{disclaimer\}/);
  assert.match(src, /"@type": "FAQPage"/);
  assert.match(src, /<MoreCalculators\s+current="extra-pay"/);
  assert.match(src, /hubCrumb\(locale\),/);
  assert.match(src, /PAY_DATES_PATH\[locale\]/);
  assert.match(src, /calcPath\("settlement", locale\)/);
  // The calculator reports calculator_use under its own id.
  assert.match(read(CALC), /useCalculatorUse\("extra-pay", locale, r\)/);
  assert.ok((CALCULATOR_USE_IDS as readonly string[]).includes("extra-pay"));
  // Linked from the net salary page and from the three editions of the pay-dates guide.
  assert.match(read("src/components/programmatic/net-salary/NetSalaryPage.tsx"), /<Link href=\{extraPayPath\(locale\)\}>/);
  for (const l of CALC_LOCALES) assert.ok(JSON.stringify(PAY_DATES.editions[l].blocks).includes(`](${extraPayPath(l)})`), `pay-dates ${l}`);
});

test("sitemap (hreflang), hub card in the work group, llms.txt", () => {
  const entries = extraPaySitemapEntries();
  assert.equal(entries.length, 3);
  for (const e of entries) {
    assert.deepEqual(Object.keys(e.alternates!.languages!).sort(), ["ca", "en", "es", "x-default"]);
    assert.ok(String(e.alternates!.languages!["x-default"]).endsWith("/en/calculators/christmas-extra-pay-spain/"));
  }
  assert.match(read("src/app/sitemap.ts"), /\.\.\.extraPaySitemapEntries\(\)/);
  const work = HUB_GROUPS.find((g) => g.id === "work")!.cards.map((c) => c.key);
  assert.equal(work[work.indexOf("net-salary") + 1], "extra-pay");
  const card = calculatorCard("extra-pay");
  assert.equal(card.checked, EXTRA_PAY_RULES_AS_OF);
  assert.equal(card.scope, "spain");
  assert.match(read("src/lib/seo/llms.ts"), /hubs: extraPayEditions\(\)/);
  // The site search sends "paga extra" to the tool.
  assert.equal(searchShortcuts("es", "paga extra")[0]?.href, extraPayPath("es"));
  assert.equal(searchShortcuts("ca", "paga extra de Nadal")[0]?.href, extraPayPath("ca"));
  assert.equal(searchShortcuts("en", "christmas bonus")[0]?.href, extraPayPath("en"));
});

/* -------------------------------------------------------------------------- */
/* Date guards                                                                */
/* -------------------------------------------------------------------------- */

test("date guard: rules read in the past, for the year the net salary rules cover", () => {
  assert.ok(Date.parse(`${EXTRA_PAY_RULES_AS_OF}T00:00:00Z`) <= Date.now(), "EXTRA_PAY_RULES_AS_OF in the future");
  assert.equal(EXTRA_PAY_YEAR, SALARY_RULES_YEAR);
  assert.ok(EXTRA_PAY_RULES_UNTIL <= SALARY_RULES_UNTIL);
});

test("date guard: from 1 January 2027 the page must move to the next Christmas pay", () => {
  // The page is about the December 2026 payment, with the 2026 AEAT algorithm and Orden PJC/297/2026
  // (through the net salary engine). In January: load the 2027 rules in the net salary calculator,
  // re-read ET arts. 29 and 31, LGSS arts. 46 and 147, the 2027 contribution order (art. 1 and the
  // complementary-settlement article) and RIRPF arts. 82, 83 and 87 in the BOE; check the AEAT
  // simulator link (a new "R27x" service each year); then move EXTRA_PAY_YEAR, EXTRA_PAY_RULES_AS_OF
  // and EXTRA_PAY_RULES_UNTIL.
  assert.ok(Date.now() < Date.parse(`${EXTRA_PAY_RULES_UNTIL}T00:00:00Z`), "Paga extra: move the calculator to the 2027 rules");
});
