import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { answerLines, butaneDescription, butaneTitle, calendarItems, historyRows, nextLine, rulesParagraphs, sources } from "../src/lib/programmatic/butane/copy.ts";
import { BUTANE_CHECKED, CEILING, FIVE_PERCENT_CHECK_FROM, MAX_STEP, OPERATORS, REVISIONS, TAX_PERIODS, type Revision } from "../src/lib/programmatic/butane/data.ts";
import { butaneFamilyPaths } from "../src/lib/programmatic/butane/page.ts";
import { BUTANE_SEGMENT, butanePath, butaneTranslations, resolveButane } from "../src/lib/programmatic/butane/paths.ts";
import {
  bottleBeforeTax,
  bottleWithTax,
  butaneState,
  dayBefore,
  hitFivePercent,
  lastChange,
  missingRevisions,
  nextBounds,
  nextScheduledRevision,
  parseCents,
  scheduledRevisions,
  taxPeriodOn,
  thirdTuesday,
} from "../src/lib/programmatic/butane/rules.ts";
import { SERVER_REVALIDATE_SECONDS, butaneToday } from "../src/lib/programmatic/butane/server.ts";
import { HUB_GROUPS } from "../src/lib/programmatic/calculators/hub.ts";

/**
 * "Precio de la bombona de butano hoy" (lib/programmatic/butane). Figures:
 * the BOE resolutions of the Dirección General de Política Energética y Minas,
 * read 13 Nov 2026 (research_notes/butano-precio-nov2026.md).
 */

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const LOCALES = ["es", "ca", "en"] as const;

/** A made-up November resolution, for the state machine only (never in data.ts). */
const FAKE_NOV: Revision = { effective: "2026-11-17", boe: "BOE-A-2026-99999", signed: "2026-11-10", published: "2026-11-16", centsPerKg: "127,7838" };

/* -------------------------------------------------------------------------- */
/* DATE GUARDS (real clock)                                                    */
/* -------------------------------------------------------------------------- */

test("DATE GUARD: every scheduled revision up to yesterday is in data.ts (17 Nov 2026: enter the BOE resolution, one line in REVISIONS)", () => {
  const today = butaneToday();
  const missing = missingRevisions(dayBefore(today));
  assert.deepEqual(
    missing,
    [],
    `Butane price revision(s) ${missing.join(", ")} not entered. Read the DGPEM resolution in the BOE (published the Monday before), add one line to REVISIONS in src/lib/programmatic/butane/data.ts with its effective date, BOE id, signing and publication dates and the c€/kg of its "Segundo"; if the BOE published none, add the date to NO_RESOLUTION with the norm. Then deploy.`,
  );
});

test("DATE GUARD: the tax table covers today (from 1 Jan 2027: re-read the hydrocarbons tax rate and VAT for butane, extend TAX_PERIODS)", () => {
  const today = butaneToday();
  assert.ok(taxPeriodOn(today), `No tax period for ${today}: the page prints no price with taxes. Check the BOE (Ley 38/1992 art. 50 epígrafe 1.8 as amended for ${today.slice(0, 7)}) and VAT, then add a TAX_PERIODS row.`);
});

/* -------------------------------------------------------------------------- */
/* The revision rule                                                           */
/* -------------------------------------------------------------------------- */

test("third Tuesday of January, March, May, July, September and November", () => {
  assert.equal(thirdTuesday(2026, 11), "2026-11-17");
  assert.equal(thirdTuesday(2026, 9), "2026-09-15");
  assert.equal(thirdTuesday(2027, 1), "2027-01-19");
  assert.equal(thirdTuesday(2025, 3), "2025-03-18");
  assert.deepEqual(scheduledRevisions("2026-11-01", "2027-07-31"), ["2026-11-17", "2027-01-19", "2027-03-16", "2027-05-18", "2027-07-20"]);
  assert.equal(nextScheduledRevision("2026-11-13"), "2026-11-17");
  assert.equal(nextScheduledRevision("2026-11-17"), "2027-01-19");
  assert.equal(nextScheduledRevision("2026-12-31"), "2027-01-19");
});

test("data: every revision takes effect on a scheduled third Tuesday and was published the Monday before (the copy says so)", () => {
  const scheduled = new Set(scheduledRevisions(REVISIONS[0]!.effective, REVISIONS.at(-1)!.effective));
  let previous = "";
  for (const r of REVISIONS) {
    assert.ok(scheduled.has(r.effective), `${r.boe}: ${r.effective} is not a third Tuesday of an odd month`);
    assert.equal(new Date(`${r.effective}T12:00:00Z`).getUTCDay(), 2, r.boe);
    assert.equal(r.published, dayBefore(r.effective), `${r.boe}: not published the day before; nextLine/calendarNote say every resolution since 2024 was`);
    assert.ok(r.signed <= r.published, r.boe);
    assert.match(r.boe, /^BOE-A-\d{4}-\d+$/);
    assert.ok(r.effective > previous, "oldest first, no duplicates");
    previous = r.effective;
    parseCents(r.centsPerKg);
  }
  assert.deepEqual(missingRevisions("2026-11-16"), [], "no gap in the history");
  assert.deepEqual(missingRevisions("2026-11-17"), ["2026-11-17"]);
});

test("data: the ±5 % step holds for every butane-only revision; nothing above the RDL 25/2026 ceiling once it applies", () => {
  for (let i = 1; i < REVISIONS.length; i++) {
    const r = REVISIONS[i]!;
    if (r.effective < FIVE_PERCENT_CHECK_FROM) continue;
    const ratio = parseCents(r.centsPerKg) / parseCents(REVISIONS[i - 1]!.centsPerKg);
    assert.ok(ratio <= 1 + MAX_STEP + 1e-6 && ratio >= 1 - MAX_STEP - 1e-6, `${r.boe}: ${ratio}`);
    if (r.effective >= "2026-10-01" && r.effective <= CEILING.until) assert.ok(parseCents(r.centsPerKg) <= parseCents(CEILING.centsPerKg), `${r.boe} above the ceiling`);
  }
  // September 2026 was a full +5 % step over July (117,5664 × 1,05 = 123,4447); March 2025 (new formula) was not.
  assert.equal(hitFivePercent(REVISIONS.find((r) => r.boe === "BOE-A-2026-19115")!), true);
  assert.equal(hitFivePercent(REVISIONS.find((r) => r.boe === "BOE-A-2025-5189")!), false);
  assert.equal(hitFivePercent(REVISIONS.find((r) => r.boe === "BOE-A-2025-9811")!), false);
});

/* -------------------------------------------------------------------------- */
/* Prices                                                                      */
/* -------------------------------------------------------------------------- */

test("bottle with taxes: the RDL 25/2026 ceiling gives its own 19,55 € (the formula's anchor)", () => {
  const ceiling = bottleWithTax(CEILING.centsPerKg, "2026-11-13");
  assert.ok(ceiling);
  assert.equal(ceiling.total.toFixed(2).replace(".", ","), CEILING.bottleEurPeninsula);
});

test("bottle with taxes on 13 Nov 2026: 15,43 € + 0,19 € hydrocarbons tax + 3,28 € VAT = 18,90 €", () => {
  const t = bottleWithTax("123,4447", "2026-11-13");
  assert.ok(t);
  assert.deepEqual([t.base, t.hydrocarbons, t.vat, t.total], [15.43, 0.19, 3.28, 18.9]);
  assert.equal(bottleBeforeTax("123,4447"), 15.43);
  // October: same 15 €/t. December: 0 €/t (INE October CPI for liquefied hydrocarbons +16.1 %).
  assert.equal(bottleWithTax("123,4447", "2026-10-15")!.total, 18.9);
  assert.equal(bottleWithTax("123,4447", "2026-12-01")!.total, 18.67);
  assert.equal(bottleWithTax("123,4447", "2026-09-30"), null, "no tax row before October");
  assert.equal(bottleWithTax("123,4447", "2027-01-01"), null, "no tax row after December");
  for (const p of TAX_PERIODS) assert.ok(p.from <= p.to && p.vatPercent === 21);
});

test("bounds of the next revision from the rules: −5 % floor, the RDL ceiling below +5 %", () => {
  const sep = REVISIONS.find((r) => r.boe === "BOE-A-2026-19115")!;
  assert.deepEqual(nextBounds(sep, "2026-11-17"), { low: 117.27, high: 127.78, ceilingApplies: true });
  // After 30 Jun 2027 only the 5 % step bounds it.
  assert.deepEqual(nextBounds(sep, "2027-07-20"), { low: 117.27, high: 129.62, ceilingApplies: false });
});

/* -------------------------------------------------------------------------- */
/* State on a given day                                                        */
/* -------------------------------------------------------------------------- */

test("state: 13 Nov 2026 → September's price, next revision 17 Nov", () => {
  const s = butaneState("2026-11-13");
  assert.equal(s.kind, "current");
  if (s.kind !== "current") return;
  assert.equal(s.current.boe, "BOE-A-2026-19115");
  assert.equal(s.previous?.boe, "BOE-A-2026-15740");
  assert.equal(s.upcoming, null);
  assert.equal(s.next, "2026-11-17");
});

test("state: 17 Nov with no resolution entered → awaiting, the old price is not called today's", () => {
  const s = butaneState("2026-11-17");
  assert.equal(s.kind, "awaiting");
  if (s.kind !== "awaiting") return;
  assert.equal(s.due, "2026-11-17");
  for (const l of LOCALES) {
    const text = answerLines(l, s, "2026-11-17").join(" ");
    assert.ok(!/18[,.]90/.test(text), `${l}: no price with taxes while awaiting`);
    assert.ok(text.includes("BOE-A-2026-19115"), l);
    assert.ok(butaneTitle(l, s, "2026-11-17").length <= 60, l);
  }
});

test("state: a resolution entered on Monday 16 Nov shows as 'new price from Tuesday', then becomes current", () => {
  const data = [...REVISIONS, FAKE_NOV];
  const mon = butaneState("2026-11-16", data);
  assert.equal(mon.kind, "current");
  if (mon.kind !== "current") return;
  assert.equal(mon.current.boe, "BOE-A-2026-19115");
  assert.equal(mon.upcoming?.boe, FAKE_NOV.boe);
  const tue = butaneState("2026-11-17", data);
  assert.equal(tue.kind, "current");
  if (tue.kind !== "current") return;
  assert.equal(tue.current.boe, FAKE_NOV.boe);
  assert.equal(tue.next, "2027-01-19");
  assert.deepEqual(missingRevisions("2026-11-17", data), []);
});

/* -------------------------------------------------------------------------- */
/* Words                                                                       */
/* -------------------------------------------------------------------------- */

test("copy on 13 Nov 2026: the price first, the BOE figure and link, the next revision, in all three languages", () => {
  const s = butaneState("2026-11-13");
  const answer = { es: "18,90 €", ca: "18,90 €", en: "€18.90" };
  const perKg = { es: "123,4447 c€/kg", ca: "123,4447 c€/kg", en: "123.4447 c€/kg" };
  for (const l of LOCALES) {
    const lines = answerLines(l, s, "2026-11-13");
    assert.ok(lines[0]!.startsWith(`**${answer[l]}**`), `${l}: ${lines[0]}`);
    assert.ok(lines.join(" ").includes(perKg[l]), l);
    assert.ok(lines.join(" ").includes("https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-19115"), l);
    assert.match(nextLine(l, s), /17/, l);
    const title = butaneTitle(l, s, "2026-11-13");
    const desc = butaneDescription(l, s, "2026-11-13");
    assert.ok(title.length <= 60, `${l} title ${title.length}: ${title}`);
    assert.ok(desc.length <= 165, `${l} description ${desc.length}: ${desc}`);
    assert.ok(title.includes(answer[l]), title);
    const all = [...lines, nextLine(l, s), title, desc, ...rulesParagraphs(l, s), ...calendarItems(l, "2026-11-13")].join(" ");
    assert.doesNotMatch(all, /undefined|NaN|null/, l);
    // The range from the rules, the September adjustment quoted, no figure for 17 Nov itself.
    assert.ok(all.includes(l === "en" ? "117.27" : "117,27") && all.includes(l === "en" ? "127.78" : "127,78"), l);
    assert.ok(all.includes("+15,8822"), l);
  }
  assert.equal(calendarItems("es", "2026-11-13")[0], "martes 17 de noviembre de 2026 (BOE, habitualmente el lunes 16 de noviembre de 2026)");
  assert.equal(calendarItems("ca", "2026-11-13")[0], "dimarts 17 de novembre del 2026 (BOE, habitualment el dilluns 16 de novembre del 2026)");
  assert.equal(calendarItems("en", "2026-11-13")[0], "Tuesday 17 November 2026 (BOE usually on Monday 16 November 2026)");
});

test("history: newest first, every row links its own BOE resolution, the 5 % steps marked", () => {
  const rows = historyRows("es", "2026-11-13");
  assert.equal(rows.length, REVISIONS.length);
  assert.equal(rows[0]!.boe, "BOE-A-2026-19115");
  assert.equal(rows[0]!.price, "123,4447 c€/kg");
  assert.equal(rows[0]!.bottle, "15,43 €");
  assert.equal(rows[0]!.change, "+5,00 % (tope del 5 %)");
  assert.equal(rows.at(-1)!.change, "—");
  assert.equal(rows.at(-1)!.product, "GLP envasado");
  for (const r of rows) assert.equal(r.boeUrl, `https://www.boe.es/diario_boe/txt.php?id=${r.boe}`);
  assert.equal(historyRows("en", "2026-11-13")[0]!.change, "+5.00% (5% cap)");
});

test("sources and operators: official only, no affiliate parameters", () => {
  const s = butaneState("2026-11-13");
  for (const l of LOCALES) {
    for (const src of sources(l, s.kind === "current" ? s.current : s.last)) assert.match(src.url, /^https:\/\/(www\.boe\.es|www\.ine\.es|www\.bonosocial\.gob\.es)\//, src.url);
  }
  assert.deepEqual(OPERATORS.map((o) => o.name), ["Repsol Butano, SA", "Disa Gas, SA", "Gasib Sociedad Ibérica de Gas Licuado, SL"]);
  for (const o of OPERATORS) if (o.orderUrl) assert.doesNotMatch(o.orderUrl, /[?&](utm_|aff|ref=|partner)/);
  assert.ok(BUTANE_CHECKED <= butaneToday());
});

/* -------------------------------------------------------------------------- */
/* URLs, routes, hub, sitemap, cluster links                                   */
/* -------------------------------------------------------------------------- */

test("paths: es /precio-butano/, ca /preu-buta/, en /butane-price-spain/; each route serves only its locale", () => {
  assert.deepEqual(butaneTranslations(), { ca: "/ca/preu-buta/", es: "/es/precio-butano/", en: "/en/butane-price-spain/" });
  assert.equal(resolveButane("es", "es"), "es");
  assert.equal(resolveButane("es", "ca"), null);
  assert.deepEqual(butaneFamilyPaths().map((p) => p.path).sort(), ["/ca/preu-buta/", "/en/butane-price-spain/", "/es/precio-butano/"]);
  for (const l of LOCALES) {
    const file = join(ROOT, "src/app/(public)/[locale]", BUTANE_SEGMENT[l], "page.tsx");
    assert.ok(existsSync(file), file);
    const src = readFileSync(file, "utf8");
    assert.match(src, new RegExp(`export const revalidate = ${SERVER_REVALIDATE_SECONDS};`));
    assert.match(src, /^export const dynamicParams = true;$/m);
    assert.match(src, new RegExp(`const ROUTE = "${l}";`));
    assert.match(src, /notFound\(\)/);
    assert.doesNotMatch(src, /new Date\(|Date\.now\(|fetch\(/);
    assert.equal(butanePath(l), `/${l}/${BUTANE_SEGMENT[l]}/`);
  }
  // The component reads the clock once, through server.ts.
  const component = read("src/components/programmatic/butane/ButanePage.tsx");
  assert.doesNotMatch(component, /Date\.now\(|new Date\(|fetch\(/);
  assert.match(component, /butaneToday\(\)/);
});

test("energía en casa: hub live group lists it after the electricity price, and the two pages link each other", () => {
  const live = HUB_GROUPS.find((g) => g.id === "live")!;
  assert.deepEqual(live.cards.slice(0, 2).map((c) => c.key), ["pvpc", "butane"]);
  assert.deepEqual(live.cards[1]!.href, butaneTranslations());
  assert.match(read("src/components/programmatic/pvpc/PvpcPage.tsx"), /href: butanePath\(locale\)/);
  assert.match(read("src/components/programmatic/butane/ButanePage.tsx"), /href: pvpcPath\(locale, "today"\)/);
  assert.match(read("src/app/sitemap.ts"), /\.\.\.butaneSitemapEntries\(madridDate\(Date\.now\(\)\)\)/);
});

test("sitemap lastModified follows revisions and tax months", () => {
  assert.equal(lastChange("2026-11-13"), "2026-11-01");
  assert.equal(lastChange("2026-12-05"), "2026-12-01");
  assert.equal(lastChange("2026-11-17", [...REVISIONS, FAKE_NOV]), "2026-11-17");
});
