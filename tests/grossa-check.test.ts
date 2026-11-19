import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { GROSSA_DRAW_DATE, PRIZES as GUIDE_PRIZES, RESULTS_2025, SERIES as GUIDE_SERIES, TICKET_PRICE as GUIDE_TICKET, buildGrossaBody, inDrawOrder } from "../src/lib/content/batch02/grossa.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { calcEditions, calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { hubBlocks } from "../src/lib/programmatic/gordo/copy.ts";
import { gordoHubTranslations } from "../src/lib/programmatic/gordo/paths.ts";
import { GROSSA_CHECKER_COPY, PRIZE_LABEL, TIER_LABEL } from "../src/lib/programmatic/grossa-check/client-copy.ts";
import {
  DESCRIPTION_LIMIT,
  DRAW_2025,
  EXAMPLE_TWO,
  TITLE_LIMIT,
  grossaCheckMeta,
  grossaCheckSources,
  grossaDrawText,
  grossaFaq,
  grossaFreshLine,
  grossaLead,
  grossaOfficialText,
  grossaPayText,
  grossaPreDrawNotice,
  grossaPrizeRows,
  grossaPrizeTableText,
  grossaRelatedLinks,
  grossaResultRows,
  grossaRulesText,
  grossaWillDo,
} from "../src/lib/programmatic/grossa-check/copy.ts";
import { SNAPSHOT, grossaData } from "../src/lib/programmatic/grossa-check/data.ts";
import { check, countWinners, drawComplete, neighbours, prizesOf, withStake, type GrossaDraw } from "../src/lib/programmatic/grossa-check/engine.ts";
import { GROSSA_CHECK_ROUTE, GROSSA_DATA_PATH, grossaCheckEditions, grossaCheckPath } from "../src/lib/programmatic/grossa-check/paths.ts";
import { DRAW_DATE, EXTRACTIONS, GROSSA_YEAR, PRIZE_ORDER, PRIZE_SHARE, QUOTE, SERIES, SOURCES, TICKET_PRICE, TIER_COUNT, TIER_ORDER, eurosPerSeries, extractionOf } from "../src/lib/programmatic/grossa-check/programme.ts";
import { grossaCheckSitemapEntries } from "../src/lib/programmatic/grossa-check/sitemap.ts";
import { LAST_YEAR, loadSnapshot, snapshotProblems, type GrossaSnapshot } from "../src/lib/programmatic/grossa-check/validate.ts";
import { checkEditions, checkPath } from "../src/lib/programmatic/lottery-check/paths.ts";
import { DRAWS, PRESETS } from "../src/lib/programmatic/lottery-tax/rules.ts";
import { ninoCheckEditions, ninoCheckPath } from "../src/lib/programmatic/nino-check/paths.ts";
import { ALWAYS_NOINDEX_SOURCES } from "../src/lib/security-headers.ts";

/**
 * Comprovar La Grossa de Cap d'Any 2026 (19 Nov 2026): the rules of DOGC
 * 9640 annex 3, the engine, the build step and the page.
 *
 * TEST DATA only: the TEST draw below and tests/fixtures/grossa/press/ (a
 * made-up press note marked "DADES DE PROVA" and TEST_DATA) are invented
 * numbers. The 2025 numbers appear only as last year's (the page's worked
 * examples and the refusal of last year's numbers), never as a draw to load.
 */

const ROOT = join(import.meta.dirname, "..");
const PRESS_DIR = join(ROOT, "tests/fixtures/grossa/press");
const SCRIPT = join(ROOT, "scripts/gordo-snapshot.py");
const madridToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());

/** TEST draw (invented): the same numbers as the TEST press note. */
const D: GrossaDraw = { first: "24680", second: "13579", third: "86420", fourth: ["97531", "11223"], fifth: ["44556", "67788", "90011"] };
const TEST_SNAPSHOT: GrossaSnapshot = {
  schema: 1,
  game: "grossa",
  testData: true,
  year: 2026,
  drawDate: "2026-12-31",
  readAt: "2026-12-31T14:30:00+01:00",
  numbers: { ...D, fourth: [...D.fourth], fifth: [...D.fifth] },
  sources: { results: "https://www.loteriesdecatalunya.cat/resultats/grossa/", press: null },
};
const tiers = (n: string, d: GrossaDraw = D) => prizesOf(n, d).map((h) => `${h.prize}:${h.tier}`).sort();

/* ----------------------------------------------------------- programme --- */

test("the programme is the DOGC's annex 3, the lottery guide's table and the tax calculator's presets", () => {
  assert.equal(DRAW_DATE, GROSSA_DRAW_DATE);
  assert.equal(TICKET_PRICE, GUIDE_TICKET);
  assert.equal(SERIES, GUIDE_SERIES);
  for (const prize of PRIZE_ORDER) {
    const e = extractionOf(prize);
    const g = GUIDE_PRIZES[prize];
    assert.deepEqual([e.pays.five, e.pays.neighbour, e.pays.last4, e.pays.last3, e.pays.last2, e.pays.last1 ?? null], [g.five, g.neighbours, g.last4, g.last3, g.last2, g.last1], prize);
    assert.deepEqual(EXTRACTIONS.filter((x) => x.prize === prize).map((x) => x.n), g.extractions, prize);
  }
  const preset = (id: string) => PRESETS.find((p) => p.id === id)!.prize;
  assert.deepEqual([preset("grossa-primer"), preset("grossa-segon"), preset("grossa-tercer")], [extractionOf("first").pays.five, extractionOf("second").pays.five, extractionOf("third").pays.five]);
  assert.equal(DRAWS["grossa-2026"].date, DRAW_DATE);
  assert.equal(DRAWS["grossa-2026"].price, TICKET_PRICE);
  assert.equal(GROSSA_YEAR, Number(DRAW_DATE.slice(0, 4)));
});

test("the rules pay exactly the DOGC's 61.59 % of each series: 615,875 € of 1,000,000 €", () => {
  assert.equal(eurosPerSeries(), 615_875);
  assert.equal(Math.round((eurosPerSeries() / 1_000_000) * 10_000) / 10_000, PRIZE_SHARE);
  assert.match(QUOTE.share, /61,59%/);
});

test("the quotes are the DOGC's point 8 and ECO/425/2022, cited with dogc.gencat.cat links", () => {
  assert.equal(new URL(SOURCES.dogc.url).host, "dogc.gencat.cat");
  assert.match(SOURCES.dogc.url, /documentId=1041354/);
  assert.match(SOURCES.eco425.url, /documentId=921178/);
  assert.match(QUOTE.highestPerExtraction, /premi de major import dins les categories establertes per a aquesta extracció/);
  assert.match(QUOTE.acrossExtractions, /categoria més alta de cada extracció/);
  assert.match(QUOTE.expiry, /noranta \(90\) dies naturals/);
});

test("last year's numbers are the guide's 2025 results", () => {
  assert.deepEqual([...LAST_YEAR], [RESULTS_2025.first, RESULTS_2025.second, RESULTS_2025.third, ...RESULTS_2025.fourth, ...RESULTS_2025.fifth]);
  assert.deepEqual(inDrawOrder(RESULTS_2025), [...RESULTS_2025.fifth, ...RESULTS_2025.fourth, RESULTS_2025.third, RESULTS_2025.second, RESULTS_2025.first]);
});

/* -------------------------------------------------------------- engine --- */

test("on the TEST draw, each extraction pays 1 + 2 + 9 + 90 + 900 (+ 9,000 for the first) numbers, as 8.2 implies", () => {
  assert.ok(drawComplete(D));
  const counts = countWinners(D);
  for (const e of EXTRACTIONS) for (const t of TIER_ORDER) assert.equal(counts.get(`${e.n}:${t}`) ?? 0, e.pays[t] === undefined ? 0 : TIER_COUNT[t], `${e.n} ${t}`);
});

test("one prize per extraction (8.2), the highest; prizes of different extractions add up (8.3)", () => {
  assert.deepEqual(tiers(D.first!), ["first:five"]);
  assert.equal(check(D.first!, D).perTicket, 200_000);
  // Same last four digits as the first prize: 1,000 € only, not also the last three, two and one.
  assert.deepEqual(tiers("14680"), ["first:last4"]);
  assert.equal(check("14680", D).perTicket, 1_000);
  assert.deepEqual(tiers("99680"), ["first:last3"]);
  assert.deepEqual(tiers("99980"), ["first:last2"]);
  assert.deepEqual(tiers("99990"), ["first:last1"]);
  // Neighbours of the first: 2,000 € each, wrapping round at 00000/99999.
  assert.deepEqual(neighbours(D.first!), ["24679", "24681"]);
  assert.deepEqual(tiers("24681"), ["first:neighbour"]);
  // 24679 is next to the first and also ends in 79 like the second (13579): two extractions, both paid (8.3).
  assert.deepEqual(tiers("24679"), ["first:neighbour", "second:last2"]);
  assert.equal(check("24679", D).perTicket, 2_025);
  assert.deepEqual(neighbours("00000"), ["99999", "00001"]);
  assert.deepEqual(neighbours("99999"), ["99998", "00000"]);
  // 13580 is next to the second (13579) and ends in 80 like the first (24680): 650 + 35.
  assert.deepEqual(tiers("13580"), ["first:last2", "second:neighbour"]);
  assert.equal(check("13580", D).perTicket, 685);
  assert.equal(check("13580", D).perEuro, 68.5);
  // The 2025 worked example on the page: 92575 next to the second (92574) and ending in 75 like a fifth (68675).
  assert.deepEqual(prizesOf(EXAMPLE_TWO, DRAW_2025).map((h) => `${h.prize}:${h.tier}`).sort(), ["fifth:last2", "second:neighbour"]);
});

test("never 'no prize' while numbers are missing; 'no prize' once all eight are in", () => {
  const free = Array.from({ length: 100_000 }, (_, i) => String(i).padStart(5, "0")).find((n) => prizesOf(n, D).length === 0)!;
  assert.equal(check(free, D).status, "none");
  const partial: GrossaDraw = { ...D, first: null, second: null };
  assert.equal(check(free, partial).status, "none-yet");
  assert.equal(check(free, partial).known, 6);
  assert.equal(check(D.fifth[0]!, partial).status, "prize");
});

test("what you keep: per 10 € ticket with its own 40,000 € exempt, shares in proportion", () => {
  const r = withStake(200_000, 10);
  assert.ok(r.status === "ok");
  assert.deepEqual(r.status === "ok" && r.total, { gross: 200_000, exempt: 40_000, base: 160_000, withholding: 32_000, net: 168_000 });
  const half = withStake(200_000, 5);
  assert.ok(half.status === "ok" && half.total.net === 84_000);
  const two = withStake(65_000, 20);
  assert.ok(two.status === "ok" && two.total.withholding === 10_000 && two.total.net === 120_000);
  assert.equal(withStake(1_000, 0).status, "invalid");
});

/* ---------------------------------------------------------------- data --- */

test("the JSON: the snapshot's eight numbers only; unavailable without one, or for another year", () => {
  assert.equal(grossaData(null).available, false);
  const s = loadSnapshot(TEST_SNAPSHOT, { allowTestData: true })!;
  const data = grossaData(s);
  assert.equal(data.available, true);
  assert.equal(data.complete, true);
  assert.deepEqual(data.draw, D);
  assert.ok(JSON.stringify(data).length < 2_000);
  assert.equal(grossaData({ ...s, year: 2025, drawDate: "2025-12-31" }).available, false);
  assert.throws(() => loadSnapshot(TEST_SNAPSHOT), /test data/);
});

test("snapshot validation refuses repeats, last year's numbers, bad digits, unofficial hosts and empty draws", () => {
  assert.deepEqual(snapshotProblems(TEST_SNAPSHOT), []);
  assert.deepEqual(snapshotProblems(null), []);
  const n = TEST_SNAPSHOT.numbers;
  assert.match(snapshotProblems({ ...TEST_SNAPSHOT, numbers: { ...n, second: n.first } }).join(), /appears twice/);
  assert.match(snapshotProblems({ ...TEST_SNAPSHOT, numbers: { first: LAST_YEAR[0], second: null, third: null, fourth: [], fifth: [] } }).join(), /2025 numbers/);
  assert.match(snapshotProblems({ ...TEST_SNAPSHOT, numbers: { ...n, third: "1234" } }).join(), /not five digits/);
  assert.match(snapshotProblems({ ...TEST_SNAPSHOT, sources: { results: "https://example.com/", press: null } }).join(), /official/);
  assert.match(snapshotProblems({ ...TEST_SNAPSHOT, numbers: { first: null, second: null, third: null, fourth: [], fifth: [] } }).join(), /nothing to publish/);
  assert.match(snapshotProblems({ ...TEST_SNAPSHOT, numbers: { ...n, fifth: [...n.fifth, "55555"] } }).join(), /more than 3/);
});

test(`date guard: the ${GROSSA_YEAR} numbers are in the committed snapshot after the draw`, () => {
  if (SNAPSHOT === null) assert.ok(madridToday() <= DRAW_DATE, `From the day after ${DRAW_DATE}: run scripts/gordo-snapshot.py fetch/build --game grossa (docs/GROSSA_NINO_RUNBOOK.md), gate, deploy, publish comprobar-grossa.`);
  else assert.equal(SNAPSHOT.testData, false);
});

test(`year guard: the ${GROSSA_YEAR} rules are replaced before the next Cap d'Any draw`, () => {
  assert.ok(madridToday() < `${GROSSA_YEAR + 1}-10-01`, `Load the DOGC agreement for La Grossa de Cap d'Any ${GROSSA_YEAR + 1} into grossa-check/programme.ts (and the guide and the tax calculator) before ${GROSSA_YEAR + 1}-10-01`);
});

/* -------------------------------------------------------------- script --- */

function scratch(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "grossa-check-"));
  copyFileSync(join(PRESS_DIR, "TEST_DATA"), join(dir, "TEST_DATA"));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}
const run = (dir: string, extra: string[] = []) => spawnSync("python3", ["-I", SCRIPT, "build", "--game", "grossa", "--year", "2026", "--dir", dir, "--test-data", "--read-at", "2026-12-31T14:30:00+01:00", ...extra], { encoding: "utf8" });

test("build --game grossa: the TEST press note's table, checked against its labels, prose, numbers.txt and the results page", (t) => {
  if (spawnSync("python3", ["--version"]).error) return t.skip("no python3");
  const press = readFileSync(join(PRESS_DIR, "premsa.txt"), "utf8");
  const dirs: string[] = [];
  try {
    const out = mkdtempSync(join(tmpdir(), "grossa-check-out-"));
    dirs.push(out);
    let r = run(PRESS_DIR, ["--out", join(out, "s.json")]);
    assert.equal(r.status, 0, r.stderr);
    const built = JSON.parse(readFileSync(join(out, "s.json"), "utf8")) as GrossaSnapshot;
    assert.deepEqual(built.numbers, TEST_SNAPSHOT.numbers);
    assert.equal(built.testData, true);
    assert.deepEqual(snapshotProblems(built), []);
    // Never over the committed snapshot, never without --test-data.
    r = run(PRESS_DIR);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /never goes into the committed snapshot/);
    r = spawnSync("python3", ["-I", SCRIPT, "build", "--game", "grossa", "--year", "2026", "--dir", PRESS_DIR, "--dry-run"], { encoding: "utf8" });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /marked TEST_DATA/);
    // numbers.txt alone; numbers.txt that disagrees with the note.
    let dir = scratch({ "numbers.txt": "# TEST DATA\nfirst 24680\nsecond 13579\nthird 86420\nfourth 97531 11223\nfifth 44556 67788 90011\n" });
    dirs.push(dir);
    r = run(dir, ["--dry-run"]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /numbers\.txt/);
    dir = scratch({ "premsa.txt": press, "numbers.txt": "first 24681\n" });
    dirs.push(dir);
    r = run(dir, ["--dry-run"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /disagree/);
    // The prose names another first prize than the table.
    dir = scratch({ "premsa.txt": press.replace("amb el número 24680", "amb el número 24689") });
    dirs.push(dir);
    r = run(dir, ["--dry-run"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /the prose 24689/);
    // A results page that carries some numbers but not all.
    dir = scratch({ "premsa.txt": press, "resultats.html": "<p>TEST 24680 13579 86420</p>" });
    dirs.push(dir);
    r = run(dir, ["--dry-run"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /are not in it/);
    // Last year's numbers typed by mistake.
    dir = scratch({ "numbers.txt": `first ${LAST_YEAR[0]}\nsecond ${LAST_YEAR[1]}\n` });
    dirs.push(dir);
    r = run(dir, ["--dry-run"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /2025 numbers/);
    // Another year's note.
    dir = scratch({ "premsa.txt": press.replaceAll("Cap d’Any 2026", "Cap d’Any 2025") });
    dirs.push(dir);
    r = run(dir, ["--dry-run"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /not the La Grossa de Cap d'Any 2026 note/);
    // The guide's RESULTS_2026 block from a built snapshot.
    r = spawnSync("python3", ["-I", SCRIPT, "guide", "--file", join(out, "s.json")], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /export const RESULTS_2026: GrossaResults \| null = \{/);
    assert.match(r.stdout, /first: "24680"/);
    // The committed snapshot passes the script's own check.
    r = spawnSync("python3", ["-I", SCRIPT, "check", "--game", "grossa"], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
  } finally {
    for (const d of dirs) rmSync(d, { recursive: true, force: true });
  }
});

/* --------------------------------------------------------- page, links --- */

const OFFICIAL = ["dogc.gencat.cat", "www.loteriesdecatalunya.cat", "www.loteriesdecatalunya.info", "api.loteriesdecatalunya.cat", "www.3cat.cat", "www.boe.es"];

function pageText(locale: Locale, data = grossaData(null)): string {
  return [
    grossaLead(locale, data),
    grossaFreshLine(locale),
    grossaPreDrawNotice(locale).text,
    ...grossaWillDo(locale).items,
    grossaPrizeTableText(locale).intro,
    grossaPrizeTableText(locale).after,
    ...grossaRulesText(locale).items,
    ...grossaDrawText(locale).paras,
    ...grossaPayText(locale).items,
    grossaPayText(locale).after,
    ...grossaOfficialText(locale).items,
    ...grossaFaq(locale).flatMap((f) => [f.q, f.a]),
  ].join("\n");
}

test("titles and descriptions fit, in both states; the H1 names the draw and the year", () => {
  const s = loadSnapshot(TEST_SNAPSHOT, { allowTestData: true })!;
  for (const locale of LOCALES) {
    for (const data of [grossaData(null), grossaData(s)]) {
      const m = grossaCheckMeta(locale, data);
      assert.ok(m.title.length <= TITLE_LIMIT, `${locale} title ${m.title.length}: ${m.title}`);
      assert.ok(m.description.length <= DESCRIPTION_LIMIT, `${locale} description ${m.description.length}: ${m.description}`);
      assert.match(m.h1, /La Grossa de Cap d'Any 2026/);
    }
    assert.match(grossaCheckMeta(locale, grossaData(s)).description, new RegExp(D.first!));
  }
  assert.equal(grossaCheckMeta("ca", grossaData(null)).title, "Comprovar La Grossa de Cap d'Any 2026: bitllet i premis");
});

test("before the draw the page prints only last year's numbers (as 2025's) and their derived examples, and links only official or own pages", () => {
  const allowed = new Set([...LAST_YEAR, ...neighbours(RESULTS_2025.first), EXAMPLE_TWO, "00000", "99999", "01234"]);
  const known = new Set([...Object.values(grossaCheckEditions()), ...Object.values(checkEditions()), ...Object.values(ninoCheckEditions()), ...Object.values(gordoHubTranslations()), ...Object.values(calcEditions("lottery-tax")), ...LOCALES.map((l) => `/${l}/${B2_PATHS.grossa[l]}/`)]);
  const sources = grossaCheckSources(grossaData(null)).map((s) => s.url);
  for (const locale of LOCALES) {
    const text = pageText(locale);
    const visible = text.replace(/\]\([^)\s]+\)/g, "]");
    for (const n of visible.match(/(?<![\d.])\d{5}(?![\d.])/g) ?? []) assert.ok(allowed.has(n), `${locale}: prints ${n}`);
    assert.match(text, /2025/);
    for (const [, href] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (href!.startsWith("/")) {
        assert.ok(href!.startsWith(`/${locale}/`), `${locale} links ${href}`);
        assert.ok(known.has(href!.split("#")[0]!), `${locale}: ${href} is not a known page`);
      } else {
        assert.ok(OFFICIAL.includes(new URL(href!).host), href);
        assert.ok(sources.includes(href!), `${href} is linked but not in the sources`);
      }
    }
    for (const l of grossaRelatedLinks(locale)) assert.ok(known.has(l.href), l.href);
    for (const p of PRIZE_ORDER) assert.ok(PRIZE_LABEL[p][locale]);
    for (const t of TIER_ORDER) assert.ok(TIER_LABEL[t][locale]);
    assert.ok(GROSSA_CHECKER_COPY[locale].title);
  }
});

test("the prize table and the FAQ come from the programme and the tax engine", () => {
  const rows = grossaPrizeRows("ca");
  assert.deepEqual(rows.map((r) => r.prize), [...PRIZE_ORDER]);
  assert.equal(rows[0]!.cells.five, "200.000 €");
  assert.equal(rows[0]!.cells.last1, "10 €");
  assert.equal(rows[1]!.cells.last1, "—");
  assert.equal(rows[0]!.net, "168.000 €");
  assert.equal(rows[1]!.net, "60.000 €");
  const es = grossaFaq("es").map((f) => f.a).join(" ");
  assert.match(es, /2\.000 € por billete cada uno/);
  assert.match(es, /se retienen 32\.000 € y cobras 168\.000 €/);
  assert.match(grossaPrizeTableText("es").after, /615\.875 €, el 61,59 %/);
  const results = grossaResultRows("es", D);
  assert.equal(results.length, 8);
  assert.match(results[0]!.neighbours, /24679 y 24681: 2\.000 €/);
  assert.match(results[0]!.endings, /terminados en 4680: 1\.000 €; terminados en 680: 250 €; terminados en 80: 35 €; terminados en 0: 10 €/);
});

test("routes: one static page per language, a 404 in the others; the JSON is static, noindex and cacheable; publish and sitemap", () => {
  for (const locale of LOCALES) {
    const source = readFileSync(join(ROOT, "src/app/(public)/[locale]", GROSSA_CHECK_ROUTE[locale], "page.tsx"), "utf8");
    assert.match(source, /export const revalidate = false;/);
    assert.match(source, /export const dynamicParams = true;/);
    assert.match(source, new RegExp(`locale !== "${locale}"\\) notFound\\(\\)`));
    assert.equal(grossaCheckPath(locale), `/${locale}/${GROSSA_CHECK_ROUTE[locale]}/`);
  }
  const route = readFileSync(join(ROOT, "src/app/data/grossa-cap-d-any.json/route.ts"), "utf8");
  assert.match(route, /export const dynamic = "force-static";/);
  assert.match(route, /grossaData\(\)/);
  assert.equal(GROSSA_DATA_PATH, "/data/grossa-cap-d-any.json");
  assert.ok(ALWAYS_NOINDEX_SOURCES.includes("/data/:path*"));
  assert.match(readFileSync(join(ROOT, "next.config.ts"), "utf8"), /"\/data\/grossa-cap-d-any\.json"/);
  assert.match(readFileSync(join(ROOT, "src/app/api/admin/publish/route.ts"), "utf8"), /wants\("comprobar-grossa"\)/);
  assert.match(readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8"), /grossaCheckSitemapEntries\(\)/);
  assert.match(readFileSync(join(ROOT, "src/components/programmatic/grossa-check/GrossaCheckPage.tsx"), "utf8"), /<GrossaChecker locale=\{locale\} dataUrl=\{GROSSA_DATA_PATH\} \/>/);
  const entries = grossaCheckSitemapEntries(null);
  if (entries.length) {
    assert.equal(entries.length, 3);
    for (const e of entries) assert.equal(Object.keys(e.alternates!.languages!).length, 4);
  }
});

test("linked both ways: the Grossa guide, the gordo hub, the Christmas checker, the tax calculator and this checker", () => {
  for (const locale of LOCALES) {
    const path = grossaCheckPath(locale);
    assert.ok(JSON.stringify(buildGrossaBody(locale, null)).includes(`](${path})`), `${locale}: the guide does not link the checker`);
    assert.ok(JSON.stringify(hubBlocks(locale, null)).includes(`](${path})`), `${locale}: the gordo hub does not link the checker`);
    const links = grossaRelatedLinks(locale).map((l) => l.href);
    for (const target of [`/${locale}/${B2_PATHS.grossa[locale]}/`, calcPath("lottery-tax", locale), checkPath(locale), ninoCheckPath(locale)]) assert.ok(links.includes(target), `${locale}: ${target}`);
  }
  assert.match(readFileSync(join(ROOT, "src/components/programmatic/lottery-tax/LotteryTaxPage.tsx"), "utf8"), /grossaCheckPath\(locale\)/);
});
