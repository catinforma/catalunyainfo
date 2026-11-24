import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { buildNadalBody } from "../src/lib/content/batch02/loteria-nadal.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { calcEditions, calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { hubBlocks } from "../src/lib/programmatic/gordo/copy.ts";
import { gordoHubTranslations } from "../src/lib/programmatic/gordo/paths.ts";
import { grossaRelatedLinks } from "../src/lib/programmatic/grossa-check/copy.ts";
import { grossaCheckEditions, grossaCheckPath } from "../src/lib/programmatic/grossa-check/paths.ts";
import { relatedLinks as christmasRelated } from "../src/lib/programmatic/lottery-check/copy.ts";
import { checkEditions, checkPath } from "../src/lib/programmatic/lottery-check/paths.ts";
import { money } from "../src/lib/programmatic/lottery-tax/copy.ts";
import { DRAWS, PRESETS } from "../src/lib/programmatic/lottery-tax/rules.ts";
import { NINO_CHECKER_COPY, categoryLabel } from "../src/lib/programmatic/nino-check/client-copy.ts";
import {
  DESCRIPTION_LIMIT,
  FIRST_PER_DECIMO,
  TITLE_LIMIT,
  ninoCheckMeta,
  ninoCheckSources,
  ninoDrawText,
  ninoFaq,
  ninoFreshLine,
  ninoLead,
  ninoOfficialText,
  ninoPayText,
  ninoPreDrawNotice,
  ninoPrizeRows,
  ninoPrizeTableText,
  ninoRelatedLinks,
  ninoRulesText,
  ninoWillDo,
} from "../src/lib/programmatic/nino-check/copy.ts";
import { SNAPSHOT, ninoData } from "../src/lib/programmatic/nino-check/data.ts";
import { check, countWinners, drawComplete, neighbours, prizesOf, withStake, type NinoDraw } from "../src/lib/programmatic/nino-check/engine.ts";
import { NINO_CHECK_ROUTE, NINO_DATA_PATH, ninoCheckEditions, ninoCheckPath } from "../src/lib/programmatic/nino-check/paths.ts";
import {
  BOE_2011,
  CONFIRM_BY,
  DECIMO_PRICE,
  DRAW_DATE,
  FIRST_PER_BILLETE,
  NINO_YEAR,
  QUOTE,
  SELAE_PROGRAMME_URL,
  SOURCES,
  expectedCount,
  programmeProblems,
  type NinoProgramme,
} from "../src/lib/programmatic/nino-check/programme.ts";
import { PROGRAMME_2027 } from "../src/lib/programmatic/nino-check/programme-data.ts";
import { ninoCheckSitemapEntries } from "../src/lib/programmatic/nino-check/sitemap.ts";
import { loadSnapshot, snapshotProblems, type NinoSnapshot } from "../src/lib/programmatic/nino-check/validate.ts";

/**
 * Comprobar Lotería del Niño 2027 (19 Nov 2026): the programme, the engine,
 * the build step and the page.
 *
 * BOE_2011 is the real El Niño programme of 2011 (BOE-A-2010-20031): the
 * engine is tested against its printed counts. TEST_PROGRAMME is TEST DATA:
 * that 2011 programme relabelled 2027 so the 2027 code paths can run; it is
 * NOT SELAE's 2027 programme and is never written to programme-2027.json.
 * tests/fixtures/nino/selae/ (TEST_DATA) is an invented draw record.
 */

const ROOT = join(import.meta.dirname, "..");
const FIXTURE_DIR = join(ROOT, "tests/fixtures/nino/selae");
const SCRIPT = join(ROOT, "scripts/gordo-snapshot.py");
const madridToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());

const TEST_PROGRAMME: NinoProgramme = {
  ...BOE_2011,
  year: 2027,
  drawDate: "2027-01-06",
  source: { name: "TEST DATA - not SELAE's 2027 programme (BOE-A-2010-20031 relabelled)", url: SELAE_PROGRAMME_URL, ref: "TEST DATA", page: null },
  confirmed: { read: "2026-12-20", how: "TEST DATA for tests/nino-check.test.ts only" },
};

const RECORD = JSON.parse(readFileSync(join(FIXTURE_DIR, "draw.json"), "utf8"))[0] as Record<string, unknown>;
const dec = (v: unknown) => (Array.isArray(v) ? v : [v]).map((x) => (x as { decimo: string }).decimo);
/** The TEST draw, straight from the fixture. */
const D: NinoDraw = {
  first: dec(RECORD.primerPremio)[0]!,
  second: dec(RECORD.segundoPremio)[0]!,
  third: null,
  x5: dec(RECORD.extraccionesDeCincoCifras),
  x4: [],
  x3: dec(RECORD.extraccionesDeTresCifras),
  x2: dec(RECORD.extraccionesDeDosCifras),
  x1: dec(RECORD.reintegros),
};
const TEST_SNAPSHOT: NinoSnapshot = {
  schema: 1,
  game: "nino",
  testData: true,
  year: 2027,
  drawDate: "2027-01-06",
  drawId: "1340100002",
  readAt: "2027-01-06T13:30:00+01:00",
  numbers: D,
  sources: { results: "https://www.loteriasyapuestas.es/es/loteria-nacional", officialList: null },
};
const cats = (n: string, d: NinoDraw = D, p: NinoProgramme = BOE_2011) => prizesOf(n, d, p).map((h) => h.category).sort();

/* ----------------------------------------------------------- programme --- */

test("what is known for 2027 is SELAE's page as the tax calculator read it: 6 January, 20 € décimos, 2,000,000 € a la serie", () => {
  assert.equal(DRAW_DATE, DRAWS["nino-2027"].date);
  assert.equal(DECIMO_PRICE, DRAWS["nino-2027"].price);
  assert.equal(FIRST_PER_DECIMO, PRESETS.find((p) => p.id === "nino-primero")!.prize);
  assert.equal(FIRST_PER_BILLETE, 2_000_000);
  assert.equal(NINO_YEAR, Number(DRAW_DATE.slice(0, 4)));
  assert.equal(new URL(SOURCES.selaeProgramme.url).host, "www.loteriasyapuestas.es");
});

test("the BOE's 2011 programme validates and adds up to its printed 37,812 prizes and 14,000,000 € per series", () => {
  assert.deepEqual(programmeProblems(BOE_2011, { year: 2011, drawDate: "2011-01-06", hosts: ["www.boe.es"] }), []);
  assert.equal(BOE_2011.categories.reduce((a, c) => a + c.count, 0), 37_812);
  assert.equal(BOE_2011.categories.reduce((a, c) => a + c.count * c.perBillete, 0), 14_000_000);
  assert.equal(new URL(SOURCES.boe2011.url).host, "www.boe.es");
  assert.match(SOURCES.boe2011.url, /BOE-A-2010-20031/);
  assert.match(QUOTE.wrap, /00000, su anterior es el 99999/);
  assert.match(QUOTE.except, /quedan exceptuados los números de los que, respectivamente se deriven/);
  assert.match(QUOTE.special, /dos extracciones especiales/);
});

test("programme validation refuses wrong counts, totals, first prize, host and missing confirmation", () => {
  assert.deepEqual(programmeProblems(TEST_PROGRAMME), []);
  const bad = (patch: Partial<NinoProgramme>) => programmeProblems({ ...TEST_PROGRAMME, ...patch }).join("; ");
  assert.match(bad({ prizesPerSeries: 37_811 }), /add up to 37812 prizes/);
  assert.match(bad({ eurosPerSeries: 1 }), /add up to 14000000/);
  assert.match(bad({ categories: TEST_PROGRAMME.categories.map((c) => (c.id === "first" ? { ...c, perBillete: 1_900_000 } : c)) }), /SELAE's page says 2000000/);
  assert.match(bad({ categories: TEST_PROGRAMME.categories.map((c) => (c.id === "x3" ? { ...c, count: 1_300 } : c)) }), /x3: count 1300, the rules give 1400/);
  assert.match(bad({ source: { ...TEST_PROGRAMME.source, url: "https://www.example.com/p.pdf" } }), /not www\.loteriasyapuestas\.es/);
  assert.match(bad({ confirmed: { read: "", how: "" } }), /confirmed needs/);
  assert.match(bad({ categories: [...TEST_PROGRAMME.categories, { id: "approx-third", kind: "approx", from: "third", count: 2, perBillete: 1 }] }), /not a top prize/);
  for (const c of BOE_2011.categories) assert.equal(c.count, expectedCount(c), c.id);
});

test(`date guard: SELAE's ${NINO_YEAR} programme is read and in programme-2027.json before ${CONFIRM_BY}`, () => {
  assert.ok(CONFIRM_BY < DRAW_DATE);
  if (PROGRAMME_2027 === null) {
    assert.ok(
      madridToday() < CONFIRM_BY,
      `From ${CONFIRM_BY}: open ${SELAE_PROGRAMME_URL} in a browser (or run scripts/gordo-snapshot.py fetch --game nino on the owner's PC), transcribe the El Niño page into src/lib/programmatic/nino-check/programme-2027.json (shape: BOE_2011 in programme.ts), run 'scripts/gordo-snapshot.py programme --game nino --dir <dir>' until every line says ok, then gate, deploy, publish comprobar-nino (docs/GROSSA_NINO_RUNBOOK.md).`,
    );
  } else {
    assert.deepEqual(programmeProblems(PROGRAMME_2027), []);
  }
});

/* -------------------------------------------------------------- engine --- */

test("on the TEST draw with the 2011 programme, every category wins exactly as many of 00000-99999 as the BOE printed", () => {
  assert.ok(drawComplete(D, BOE_2011));
  const counts = countWinners(D, BOE_2011);
  for (const c of BOE_2011.categories) assert.equal(counts[c.id], c.count, c.id);
});

test("derived prizes leave out only their own number; everything else adds up; aproximaciones wrap round", () => {
  const f = D.first!;
  // The first prize: itself; no centena, ending or reintegro of its own (BOE: "quedan exceptuados").
  const own = cats(f).filter((c) => c.endsWith("-first"));
  assert.deepEqual(own, []);
  assert.ok(cats(f).includes("first"));
  const [before, after] = neighbours(f);
  for (const n of [before, after]) {
    assert.ok(cats(n).includes("approx-first"), n);
    assert.ok(cats(n).includes("hundred-first"), n);
  }
  // Same last three digits as the first, other hundred: last three + last two + reintegro of the first, summed.
  const end3 = `${(Number(f.slice(0, 2)) + 50) % 100}`.padStart(2, "0") + f.slice(2);
  const hits = cats(end3).filter((c) => c.endsWith("-first"));
  assert.deepEqual(hits, ["end1-first", "end2-first", "end3-first"]);
  // Extractions of three and two digits: every billete ending so.
  const x3 = D.x3[0]!;
  assert.ok(cats(`77${x3}`).includes("x3"));
  assert.ok(cats(`555${D.x2[0]}`).includes("x2"));
  assert.ok(cats(`1234${D.x1[0]}`).includes("x1"));
  assert.deepEqual(neighbours("00000"), ["99999", "00001"]);
  assert.deepEqual(neighbours("99999"), ["99998", "00000"]);
  const r = check(f, D, BOE_2011);
  assert.equal(r.status, "prize");
  assert.equal(r.perEuro, r.perDecimo / 20);
});

test("never 'no prize' while extractions are missing; 'no prize' once all are in", () => {
  const free = Array.from({ length: 100_000 }, (_, i) => String(i).padStart(5, "0")).find((n) => prizesOf(n, D, BOE_2011).length === 0)!;
  assert.equal(check(free, D, BOE_2011).status, "none");
  assert.equal(check(free, { ...D, x3: D.x3.slice(0, 10) }, BOE_2011).status, "none-yet");
  assert.equal(check(free, { ...D, second: null }, BOE_2011).status, "none-yet");
});

test("what you keep: the first prize per 20 € décimo, 168,000 € after the levy; a 5 € share 42,000 €", () => {
  const one = withStake(FIRST_PER_DECIMO, 20, TEST_PROGRAMME);
  assert.ok(one.status === "ok" && one.total.withholding === 32_000 && one.total.net === 168_000);
  const share = withStake(FIRST_PER_DECIMO, 5, TEST_PROGRAMME);
  assert.ok(share.status === "ok" && share.total.net === 42_000);
});

/* ---------------------------------------------------------------- data --- */

test("the JSON: available only with both a snapshot and a programme of the same year", () => {
  const s = loadSnapshot(TEST_SNAPSHOT, TEST_PROGRAMME, { allowTestData: true })!;
  assert.equal(ninoData(null, TEST_PROGRAMME).available, false);
  assert.equal(ninoData(s, null).available, false);
  const data = ninoData(s, TEST_PROGRAMME);
  assert.equal(data.available, true);
  assert.equal(data.complete, true);
  assert.ok(JSON.stringify(data).length < 8_000);
  assert.equal(ninoData({ ...s, year: 2026, drawDate: "2026-01-06" }, TEST_PROGRAMME).available, false);
  assert.throws(() => loadSnapshot(TEST_SNAPSHOT, TEST_PROGRAMME), /test data/);
});

test("snapshot validation: digits, repeats, the programme's extraction counts and prizes", () => {
  assert.deepEqual(snapshotProblems(TEST_SNAPSHOT, TEST_PROGRAMME), []);
  assert.match(snapshotProblems({ ...TEST_SNAPSHOT, numbers: { ...D, x3: [...D.x3, "000"] } }, TEST_PROGRAMME).join(), /x3: 15 extractions, the programme has 14/);
  assert.match(snapshotProblems({ ...TEST_SNAPSHOT, numbers: { ...D, x4: ["1234"] } }, TEST_PROGRAMME).join(), /x4: 1 extractions, the programme has 0/);
  assert.match(snapshotProblems({ ...TEST_SNAPSHOT, numbers: { ...D, third: "12121" } }, TEST_PROGRAMME).join(), /no third prize/);
  assert.match(snapshotProblems({ ...TEST_SNAPSHOT, numbers: { ...D, second: D.first } }, TEST_PROGRAMME).join(), /appears twice/);
  assert.match(snapshotProblems({ ...TEST_SNAPSHOT, numbers: { ...D, x2: ["7"] } }, TEST_PROGRAMME).join(), /not 2 digits/);
  assert.match(snapshotProblems({ ...TEST_SNAPSHOT, sources: { results: "https://example.com/", officialList: null } }, TEST_PROGRAMME).join(), /official SELAE host/);
});

test(`date guard: the ${NINO_YEAR} numbers are in the committed snapshot after the draw`, () => {
  if (SNAPSHOT === null) assert.ok(madridToday() <= DRAW_DATE, `From the day after ${DRAW_DATE}: run scripts/gordo-snapshot.py fetch/build --game nino (docs/GROSSA_NINO_RUNBOOK.md), gate, deploy, publish comprobar-nino.`);
  else assert.equal(SNAPSHOT.testData, false);
});

test(`year guard: the ${NINO_YEAR} programme is replaced before the next El Niño draw`, () => {
  assert.ok(madridToday() < `${NINO_YEAR}-12-01`, `Load SELAE's ${NINO_YEAR + 1} El Niño programme (a new programme-${NINO_YEAR + 1}.json, NINO_YEAR, DRAW_DATE) before ${NINO_YEAR}-12-01`);
});

/* -------------------------------------------------------------- script --- */

test("build --game nino: the TEST draw record against a TEST programme; refused without one, with two lists of one length, or past the programme", (t) => {
  if (spawnSync("python3", ["--version"]).error) return t.skip("no python3");
  const dirs: string[] = [];
  const mk = (files: Record<string, string>) => {
    const dir = mkdtempSync(join(tmpdir(), "nino-check-"));
    copyFileSync(join(FIXTURE_DIR, "TEST_DATA"), join(dir, "TEST_DATA"));
    for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
    dirs.push(dir);
    return dir;
  };
  try {
    const out = mkdtempSync(join(tmpdir(), "nino-check-out-"));
    dirs.push(out);
    const programme = join(out, "programme.test-data.json");
    writeFileSync(programme, JSON.stringify(TEST_PROGRAMME));
    const run = (dir: string, extra: string[] = []) => spawnSync("python3", ["-I", SCRIPT, "build", "--game", "nino", "--year", "2027", "--dir", dir, "--test-data", "--read-at", "2027-01-06T13:30:00+01:00", "--programme", programme, ...extra], { encoding: "utf8" });
    let r = run(FIXTURE_DIR, ["--out", join(out, "s.json")]);
    assert.equal(r.status, 0, r.stderr);
    const built = JSON.parse(readFileSync(join(out, "s.json"), "utf8")) as NinoSnapshot;
    assert.deepEqual(built.numbers, D);
    assert.deepEqual(snapshotProblems(built, TEST_PROGRAMME), []);
    // The committed programme-2027.json: refused while it is null.
    if (PROGRAMME_2027 === null) {
      r = spawnSync("python3", ["-I", SCRIPT, "build", "--game", "nino", "--year", "2027", "--dir", FIXTURE_DIR, "--test-data", "--dry-run"], { encoding: "utf8" });
      assert.equal(r.status, 1);
      assert.match(r.stderr, /programme-2027\.json is null/);
    }
    // Two three-digit lists in the record.
    const two = JSON.parse(readFileSync(join(FIXTURE_DIR, "draw.json"), "utf8"));
    two[0].otraLista = two[0].extraccionesDeTresCifras.slice(0, 2);
    r = run(mk({ "draw.json": JSON.stringify(two) }), ["--dry-run"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /several in the draw record/);
    // extracciones.txt typed by hand, one extraction too many.
    const typed = ["# TEST DATA", `first ${D.first}`, `second ${D.second}`, `x5 ${D.x5.join(" ")}`, `x3 ${D.x3.join(" ")} 000`, `x2 ${D.x2.join(" ")}`, `x1 ${D.x1.join(" ")}`].join("\n");
    r = run(mk({ "extracciones.txt": typed }), ["--dry-run", "--draw-id", "1340100002"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /x3: 15 extractions, the programme has 14/);
    r = run(mk({ "extracciones.txt": typed.replace(" 000", "") }), ["--dry-run", "--draw-id", "1340100002"]);
    assert.equal(r.status, 0, r.stderr);
    // Another draw's record.
    const other = JSON.parse(readFileSync(join(FIXTURE_DIR, "draw.json"), "utf8"));
    other[0].nombre = "SORTEO EXTRAORDINARIO DE NAVIDAD";
    r = run(mk({ "draw.json": JSON.stringify(other) }), ["--dry-run"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /is not El Niño/);
    // programme --game nino: every figure of the JSON in a TEST programme text; one missing is refused.
    const es = (n: number) => n.toLocaleString("de-DE");
    const page = ["TEST DATA - NOT SELAE'S TEXT", "SORTEO EXTRAORDINARIO DE EL NIÑO (TEST) 6 de enero de 2027", `${es(TEST_PROGRAMME.prizesPerSeries)} premios ${es(TEST_PROGRAMME.eurosPerSeries)} euros`, ...TEST_PROGRAMME.categories.map((c) => `${es(c.count)} de ${es(c.perBillete)}`)].join("\n");
    r = spawnSync("python3", ["-I", SCRIPT, "programme", "--game", "nino", "--dir", mk({ "programa.txt": page }), "--programme", programme], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    r = spawnSync("python3", ["-I", SCRIPT, "programme", "--game", "nino", "--dir", mk({ "programa.txt": page.replace("de 12.600", "de 12.500") }), "--programme", programme], { encoding: "utf8" });
    assert.equal(r.status, 1);
    assert.match(r.stdout, /MISSING approx-first 12\.600/);
    r = spawnSync("python3", ["-I", SCRIPT, "check", "--game", "nino"], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
  } finally {
    for (const d of dirs) rmSync(d, { recursive: true, force: true });
  }
});

/* --------------------------------------------------------- page, links --- */

const OFFICIAL = ["www.loteriasyapuestas.es", "www.selae.es", "www.boe.es"];
const ALLOWED_FIVE = new Set(["00025", "00024", "00026", "00000", "00099", "99999", "00001"]);

function pageText(locale: Locale, programme: NinoProgramme | null = PROGRAMME_2027): string {
  const data = ninoData(null, programme);
  return [
    ninoLead(locale, data),
    ninoFreshLine(locale, programme),
    ninoPreDrawNotice(locale).text,
    ...ninoWillDo(locale).items,
    ninoPrizeTableText(locale, programme).intro,
    ninoPrizeTableText(locale, programme).caption,
    ninoPrizeTableText(locale, programme).after,
    ...ninoPrizeRows(locale, programme).flatMap((r) => [r.label, r.perDecimo, r.perEuro, r.net]),
    ninoRulesText(locale, programme).intro,
    ...ninoRulesText(locale, programme).items,
    ninoRulesText(locale, programme).pending ?? "",
    ...ninoDrawText(locale).paras,
    ...ninoPayText(locale).items,
    ninoPayText(locale).after,
    ...ninoOfficialText(locale).items,
    ...ninoFaq(locale).flatMap((f) => [f.q, f.a]),
  ].join("\n");
}

test("titles and descriptions fit, in both states; the H1 names the draw and the year", () => {
  const s = loadSnapshot(TEST_SNAPSHOT, TEST_PROGRAMME, { allowTestData: true })!;
  for (const locale of LOCALES) {
    for (const data of [ninoData(null, null), ninoData(s, TEST_PROGRAMME)]) {
      const m = ninoCheckMeta(locale, data);
      assert.ok(m.title.length <= TITLE_LIMIT, `${locale} title ${m.title.length}: ${m.title}`);
      assert.ok(m.description.length <= DESCRIPTION_LIMIT, `${locale} description ${m.description.length}: ${m.description}`);
      assert.match(m.h1, /2027/);
    }
    assert.match(ninoCheckMeta(locale, ninoData(s, TEST_PROGRAMME)).description, new RegExp(D.first!));
  }
  assert.equal(ninoCheckMeta("es", ninoData(null, null)).h1, "Comprobar Lotería del Niño 2027");
  assert.equal(ninoCheckMeta("ca", ninoData(null, null)).h1, "Comprovar la Loteria del Nen 2027");
});

test("before SELAE's 2027 programme is read the page prints no 2011 amount, says the rules are pending, and links only official or own pages", () => {
  const known = new Set([...Object.values(ninoCheckEditions()), ...Object.values(checkEditions()), ...Object.values(grossaCheckEditions()), ...Object.values(gordoHubTranslations()), ...Object.values(calcEditions("lottery-tax")), ...LOCALES.map((l) => `/${l}/${B2_PATHS.loteriaNadal[l]}/`)]);
  const sources = ninoCheckSources(ninoData(null, null), null).map((s) => s.url);
  // The 2011 amounts that are not also a price or the 2027 first prize (per billete and per décimo).
  const amounts2011 = [1_000_000, 100_000, 14_000, 1_400, 12_600, 1_260, 6_000, 600];
  const printed = (visible: string, a: number, locale: Locale) => new RegExp(`(?<![\\d.,])${money(a, locale).replace(/[.€]/g, (c) => `\\${c}`)}(?![\\d.,])`).test(visible);
  for (const locale of LOCALES) {
    const text = pageText(locale, null);
    const visible = text.replace(/\]\([^)\s]+\)/g, "]");
    for (const n of visible.match(/(?<![\d.])\d{5}(?![\d.])/g) ?? []) assert.ok(ALLOWED_FIVE.has(n), `${locale}: prints ${n}`);
    for (const a of amounts2011) assert.ok(!printed(visible, a, locale), `${locale}: prints the 2011 amount ${money(a, locale)}`);
    assert.match(text, /200\.000 €|€200,000/);
    assert.match(text, /168\.000 €|€168,000/);
    assert.match(ninoFreshLine(locale, null), /pendiente de confirmar|pendent de confirmar|pending confirmation/);
    assert.match(ninoRulesText(locale, null).pending ?? "", /Pendiente de confirmar|Pendent de confirmar|Pending confirmation/);
    for (const [, href] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (href!.startsWith("/")) {
        assert.ok(href!.startsWith(`/${locale}/`), `${locale} links ${href}`);
        assert.ok(known.has(href!.split("#")[0]!), `${locale}: ${href} is not a known page`);
      } else {
        assert.ok(OFFICIAL.includes(new URL(href!).host), href);
        assert.ok(sources.includes(href!), `${href} is linked but not in the sources`);
      }
    }
    for (const l of ninoRelatedLinks(locale)) assert.ok(known.has(l.href), l.href);
    for (const c of BOE_2011.categories) assert.ok(categoryLabel(c, locale).length > 3, `${locale} ${c.id}`);
    assert.ok(NINO_CHECKER_COPY[locale].title);
  }
});

test("once a programme is loaded, the table and the rules print its amounts and drop 'pending'", () => {
  const rows = ninoPrizeRows("es", TEST_PROGRAMME);
  assert.equal(rows.length, TEST_PROGRAMME.categories.length);
  assert.equal(rows[0]!.perDecimo, "200.000 €");
  assert.equal(rows[0]!.net, "168.000 €");
  assert.equal(ninoRulesText("es", TEST_PROGRAMME).pending, null);
  assert.ok(ninoRulesText("es", TEST_PROGRAMME).items.some((i) => i.includes("1.260 € por décimo")));
  assert.doesNotMatch(ninoFreshLine("es", TEST_PROGRAMME), /pendiente/);
});

test("routes: one static page per language, a 404 in the others; the JSON is static, noindex and cacheable; publish and sitemap", () => {
  for (const locale of LOCALES) {
    const source = readFileSync(join(ROOT, "src/app/(public)/[locale]", NINO_CHECK_ROUTE[locale], "page.tsx"), "utf8");
    assert.match(source, /export const revalidate = false;/);
    assert.match(source, /export const dynamicParams = true;/);
    assert.match(source, new RegExp(`locale !== "${locale}"\\) notFound\\(\\)`));
    assert.equal(ninoCheckPath(locale), `/${locale}/${NINO_CHECK_ROUTE[locale]}/`);
  }
  const route = readFileSync(join(ROOT, "src/app/data/loteria-nino.json/route.ts"), "utf8");
  assert.match(route, /export const dynamic = "force-dynamic";/);
  assert.match(route, /ninoFeed\.read\(\)/);
  assert.match(route, /ninoData\(snapshot\)/);
  assert.equal(NINO_DATA_PATH, "/data/loteria-nino.json");
  assert.doesNotMatch(readFileSync(join(ROOT, "next.config.ts"), "utf8"), /"\/data\/loteria-nino\.json"/, "the route sets its own live Cache-Control");
  assert.match(readFileSync(join(ROOT, "src/app/api/admin/publish/route.ts"), "utf8"), /wants\("comprobar-nino"\)/);
  assert.match(readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8"), /ninoCheckSitemapEntries\(\)/);
  assert.match(readFileSync(join(ROOT, "src/components/programmatic/nino-check/NinoCheckPage.tsx"), "utf8"), /<NinoChecker locale=\{locale\} dataUrl=\{NINO_DATA_PATH\} officialHref=\{NADAL_URLS\.lnac\} initial=\{data\} \/>/);
  const entries = ninoCheckSitemapEntries(null);
  if (entries.length) {
    assert.equal(entries.length, 3);
    for (const e of entries) assert.equal(Object.keys(e.alternates!.languages!).length, 4);
  }
});

test("linked both ways: gordo hub, Christmas checker, Grossa checker, Christmas guide, tax calculator and this checker", () => {
  for (const locale of LOCALES) {
    const path = ninoCheckPath(locale);
    assert.ok(JSON.stringify(hubBlocks(locale, null)).includes(`](${path})`), `${locale}: the gordo hub does not link it`);
    assert.ok(JSON.stringify(buildNadalBody(locale, null)).includes(`](${path})`), `${locale}: the Christmas guide does not link it`);
    assert.ok(christmasRelated(locale).some((l) => l.href === path), `${locale}: the Christmas checker does not link it`);
    assert.ok(grossaRelatedLinks(locale).some((l) => l.href === path), `${locale}: the Grossa checker does not link it`);
    const links = ninoRelatedLinks(locale).map((l) => l.href);
    for (const target of [calcPath("lottery-tax", locale), checkPath(locale), grossaCheckPath(locale), gordoHubTranslations()[locale]]) assert.ok(links.includes(target), `${locale}: ${target}`);
  }
  assert.match(readFileSync(join(ROOT, "src/components/programmatic/lottery-tax/LotteryTaxPage.tsx"), "utf8"), /ninoCheckPath\(locale\)/);
});
