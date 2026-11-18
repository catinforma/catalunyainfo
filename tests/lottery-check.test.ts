import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";
import { EUROS_PER_SERIES as GUIDE_EUROS, NADAL_DRAW_DATE, NADAL_URLS, PRIZES_PER_SERIES as GUIDE_PRIZES, PROGRAMME as GUIDE_PROGRAMME, buildNadalBody } from "../src/lib/content/batch02/loteria-nadal.ts";
import { bodyToPlainText } from "../src/lib/content/blocks.ts";
import { calculatorNextStep } from "../src/lib/engagement/next-step-calculators.ts";
import { LOCALES, type Locale } from "../src/lib/i18n/config.ts";
import { calcEditions, calcPath } from "../src/lib/programmatic/calculators/paths.ts";
import { hubBlocks } from "../src/lib/programmatic/gordo/copy.ts";
import { gordoHubTranslations } from "../src/lib/programmatic/gordo/paths.ts";
import type { GordoSnapshot } from "../src/lib/programmatic/gordo/types.ts";
import { PEDREA_COUNT, PRIZE_RULES, loadSnapshot, snapshotProblems } from "../src/lib/programmatic/gordo/validate.ts";
import { CATEGORY_LABEL, CHECKER_COPY } from "../src/lib/programmatic/lottery-check/client-copy.ts";
import {
  DESCRIPTION_LIMIT,
  TITLE_LIMIT,
  checkFaq,
  checkLead,
  checkMeta,
  checkSources,
  drawText,
  freshLine,
  officialText,
  payText,
  preDrawNotice,
  prizeTableText,
  relatedLinks,
  rulesText,
  willDo,
} from "../src/lib/programmatic/lottery-check/copy.ts";
import { checkerData, drawFromSnapshot, pedreaByThousand } from "../src/lib/programmatic/lottery-check/data.ts";
import { check, countWinners, drawComplete, neighbours, prizesOf, withStake, type CheckerDraw } from "../src/lib/programmatic/lottery-check/engine.ts";
import { CHECK_DATA_PATH, CHECK_ROUTE, checkEditions, checkPath } from "../src/lib/programmatic/lottery-check/paths.ts";
import {
  CATEGORIES,
  CONFIRM_BY,
  DRAWN,
  DRAWN_TOTAL,
  DRAW_DATE,
  EUROS_PER_SERIES,
  PRIZES_PER_SERIES,
  PROGRAMME_CONFIRMED,
  PROGRAMME_YEAR,
  QUOTE,
  SOURCES,
  perDecimo,
  perEuro,
  type CategoryId,
} from "../src/lib/programmatic/lottery-check/programme.ts";
import { checkSitemapEntries } from "../src/lib/programmatic/lottery-check/sitemap.ts";
import { DRAWS, PRESETS } from "../src/lib/programmatic/lottery-tax/rules.ts";
import { ALWAYS_NOINDEX_SOURCES } from "../src/lib/security-headers.ts";

/**
 * Comprobar Lotería de Navidad (18 Nov 2026): the checker, its programme and
 * the build step that feeds it.
 *
 * tests/fixtures/gordo/selae-complete/ is TEST DATA: invented numbers in the
 * shape of SELAE's draw record (thirteen top prizes and 1,794 pedrea numbers
 * from a seeded generator), a made-up "lista oficial" text and, in
 * tests/fixtures/gordo/programa.test-data.txt, a made-up programme page. None
 * of it is SELAE's; the site refuses to load test data.
 */

const ROOT = join(import.meta.dirname, "..");
const COMPLETE_DIR = join(ROOT, "tests/fixtures/gordo/selae-complete");
const RECORD = JSON.parse(readFileSync(join(COMPLETE_DIR, "draw.json"), "utf8"))[0] as Record<string, unknown>;
const dec = (v: unknown) => (Array.isArray(v) ? v : [v]).map((x) => (x as { decimo: string }).decimo);
/** The TEST draw, straight from the fixture's draw record. */
const D: CheckerDraw = {
  first: dec(RECORD.primerPremio)[0]!,
  second: dec(RECORD.segundoPremio)[0]!,
  third: dec(RECORD.tercerosPremios)[0]!,
  fourth: dec(RECORD.cuartosPremios),
  fifth: dec(RECORD.quintosPremios),
  pedrea: dec(RECORD.extraccionesDeCincoCifras),
};
const madridToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
const cats = (n: string, d: CheckerDraw = D) => prizesOf(n, d).map((h) => h.category).sort();
const withPedrea = (n: string, list: CategoryId[]) => [...list, ...(D.pedrea!.includes(n) ? (["pedrea"] as CategoryId[]) : [])].sort();

/* ----------------------------------------------------------- programme --- */

test("the programme adds up to SELAE's 2026 totals: 15,304 prizes and 14,000,000 € per series, 1,807 balls", () => {
  assert.equal(CATEGORIES.reduce((a, c) => a + c.count, 0), PRIZES_PER_SERIES);
  assert.equal(CATEGORIES.reduce((a, c) => a + c.count * c.perBillete, 0), EUROS_PER_SERIES);
  assert.equal(PRIZES_PER_SERIES, 15_304);
  assert.equal(EUROS_PER_SERIES, 14_000_000);
  assert.equal(DRAWN_TOTAL, 1_807);
  assert.equal(new Set(CATEGORIES.map((c) => c.id)).size, CATEGORIES.length);
});

test("the programme is the lottery guide's, the prize tax calculator's and the gordo snapshot's", () => {
  const sum = (ids: CategoryId[]) => CATEGORIES.filter((c) => ids.includes(c.id)).reduce((a, c) => a + c.count, 0);
  const guide = Object.fromEntries(GUIDE_PROGRAMME.map((r) => [r.key, r]));
  for (const id of ["first", "second", "third", "fourth", "fifth", "pedrea", "approxFirst", "approxSecond", "approxThird", "reintegro"] as const) {
    const c = CATEGORIES.find((x) => x.id === id)!;
    assert.equal(guide[id]!.count, c.count, id);
    assert.equal(guide[id]!.perBillete, c.perBillete, id);
  }
  assert.equal(guide.hundreds!.count, sum(["hundredFirst", "hundredSecond", "hundredThird", "hundredFourth"]));
  assert.equal(guide.lastTwo!.count, sum(["lastTwoFirst", "lastTwoSecond", "lastTwoThird"]));
  assert.equal(GUIDE_PRIZES, PRIZES_PER_SERIES);
  assert.equal(SOURCES.selaeProgramme.url, NADAL_URLS.programme);
  assert.equal(GUIDE_EUROS, EUROS_PER_SERIES);
  const preset = (id: string) => PRESETS.find((p) => p.id === id)!.prize;
  assert.deepEqual(
    [preset("gordo"), preset("segundo"), preset("tercero"), preset("cuarto"), preset("quinto"), preset("pedrea"), preset("reintegro")],
    (["first", "second", "third", "fourth", "fifth", "pedrea", "reintegro"] as const).map(perDecimo),
  );
  for (const rule of PRIZE_RULES) {
    assert.equal(rule.perDecimo, perDecimo(rule.key), rule.key);
    assert.equal(rule.count, DRAWN[rule.key], rule.key);
  }
  assert.equal(PEDREA_COUNT, DRAWN.pedrea);
  assert.equal(DRAW_DATE, NADAL_DRAW_DATE);
  assert.equal(DRAWS["navidad-2026"].date, DRAW_DATE);
  assert.equal(PROGRAMME_YEAR, Number(DRAW_DATE.slice(0, 4)));
  assert.equal(perEuro("first"), 20_000);
  assert.equal(perEuro("pedrea"), 5);
  assert.equal(perEuro("reintegro"), 1);
});

test(`date guard: SELAE's ${PROGRAMME_YEAR} rule wording is read and PROGRAMME_CONFIRMED filled before ${CONFIRM_BY}`, () => {
  assert.ok(CONFIRM_BY < DRAW_DATE);
  if (PROGRAMME_CONFIRMED === null) {
    assert.ok(
      madridToday() < CONFIRM_BY,
      `From ${CONFIRM_BY}: read page 12 of ${SOURCES.selaeProgramme.url} in a browser (or run scripts/gordo-snapshot.py programme on the owner's PC fetch), check the aproximaciones/centenas/terminaciones/reintegro wording against QUOTE, then fill PROGRAMME_CONFIRMED in src/lib/programmatic/lottery-check/programme.ts (and remove "pendiente de confirmar" by doing so).`,
    );
  } else {
    assert.match(PROGRAMME_CONFIRMED.read, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(PROGRAMME_CONFIRMED.how.length > 10);
  }
});

test(`year guard: the ${PROGRAMME_YEAR} programme is replaced before the next Christmas draw`, () => {
  assert.ok(madridToday() < `${PROGRAMME_YEAR + 1}-10-01`, `Load SELAE's ${PROGRAMME_YEAR + 1} Christmas programme into programme.ts (and the lottery guide and the tax calculator) before ${PROGRAMME_YEAR + 1}-10-01`);
});

test("the BOE quotes are BOE-A-2010-19540's, cited with a boe.es link", () => {
  assert.equal(new URL(SOURCES.boe2010.url).host, "www.boe.es");
  assert.match(SOURCES.boe2010.url, /BOE-A-2010-19540/);
  assert.match(QUOTE.wrap, /00000, su anterior es el 84\.999/);
  assert.match(QUOTE.except, /quedan exceptuados los números de los que, respectivamente se deriven/);
  assert.equal(new URL(SOURCES.selaeProgramme.url).host, "www.loteriasyapuestas.es");
});

/* -------------------------------------------------------------- engine --- */

test("on the TEST draw, every category wins exactly as many numbers of 00000-99999 as the programme has prizes", () => {
  assert.ok(drawComplete(D));
  const counts = countWinners(D);
  for (const c of CATEGORIES) assert.equal(counts[c.id], c.count, c.id);
});

test("the same counts when two fourth prizes share a hundred, and with 00000 and 99999 at the top", () => {
  // The pedrea does not matter for derived prizes: none here.
  const d: CheckerDraw = { ...D, first: "00000", second: "99999", fourth: ["45610", "45678"], pedrea: [] };
  const counts = countWinners(d);
  for (const id of ["approxFirst", "approxSecond", "hundredFirst", "hundredSecond", "hundredFourth", "lastTwoFirst", "lastTwoSecond", "reintegro"] as const) {
    assert.equal(counts[id], CATEGORIES.find((c) => c.id === id)!.count, id);
  }
  assert.deepEqual(neighbours("00000"), ["99999", "00001"]);
  assert.deepEqual(neighbours("99999"), ["99998", "00000"]);
  // The two fourths in one hundred: each gets the other's centena prize.
  assert.ok(cats("45610", d).includes("hundredFourth"));
  assert.ok(cats("45678", d).includes("hundredFourth"));
});

test("the Gordo wins only the Gordo; its neighbours win the aproximación and the centena; terminations and reintegro add up", () => {
  assert.deepEqual(cats(D.first!), ["first"]);
  const r = check(D.first!, D);
  assert.equal(r.perDecimo, 400_000);
  assert.equal(r.perEuro, 20_000);
  const [before, after] = neighbours(D.first!);
  for (const n of [before, after]) assert.deepEqual(cats(n), withPedrea(n, ["approxFirst", "hundredFirst"]), n);
  // 99945: same last two digits (45) and last digit (5) as the TEST Gordo 12345 → 100 + 20 = 120 € a décimo, 6 € a euro (SELAE's 2025 dossier).
  const ending = "99945";
  assert.deepEqual(cats(ending), withPedrea(ending, ["lastTwoFirst", "reintegro"]));
  if (!D.pedrea!.includes(ending)) {
    assert.equal(check(ending, D).perDecimo, 120);
    assert.equal(check(ending, D).perEuro, 6);
  }
  // A number of the Gordo's hundred that is not a neighbour: the centena only (plus a reintegro if it ends in 5).
  assert.deepEqual(cats("12301"), withPedrea("12301", ["hundredFirst"]));
  assert.deepEqual(cats("12395"), withPedrea("12395", ["hundredFirst", "reintegro"]));
  // A fifth prize: its own prize; no centena or termination is derived from fifths.
  assert.deepEqual(cats(D.fifth[0]!), ["fifth"]);
  // A pedrea number far from the top prizes.
  const lone = D.pedrea!.find((n) => cats(n).length === 1)!;
  assert.equal(check(lone, D).perDecimo, 100);
});

test("never 'no prize' while numbers are missing; 'no prize' once all 1,807 are in", () => {
  const free = Array.from({ length: 100_000 }, (_, i) => String(i).padStart(5, "0")).find((n) => prizesOf(n, D).length === 0)!;
  assert.equal(check(free, D).status, "none");
  const partial: CheckerDraw = { ...D, pedrea: D.pedrea!.slice(0, 100) };
  assert.equal(check(free, partial).status, "none-yet");
  assert.deepEqual(check(free, partial).missing, ["pedrea"]);
  const noList: CheckerDraw = { ...D, pedrea: null, fifth: D.fifth.slice(0, 3) };
  assert.equal(check(free, noList).status, "none-yet");
  assert.deepEqual(check(free, noList).missing, ["top", "pedrea"]);
  assert.equal(check(D.first!, noList).status, "prize");
});

test("what you keep: per décimo with its own 40,000 € exempt, shares split in proportion (lottery-tax engine)", () => {
  const gordo = (played: number) => {
    const r = withStake(400_000, played);
    assert.equal(r.status, "ok");
    return r.status === "ok" ? r.total : null!;
  };
  assert.deepEqual(gordo(20), { gross: 400_000, exempt: 40_000, base: 360_000, withholding: 72_000, net: 328_000 });
  assert.equal(gordo(5).net, 82_000);
  assert.equal(gordo(25).net, 410_000);
  assert.equal(gordo(60).net, 984_000);
  const pedrea = withStake(100, 5);
  assert.ok(pedrea.status === "ok" && pedrea.total.net === 25 && pedrea.total.withholding === 0);
  assert.equal(withStake(100, 0).status, "invalid");
  assert.equal(withStake(100, 20_001).status, "invalid");
  assert.equal(withStake(100, Number.NaN).status, "invalid");
});

/* ---------------------------------------------------------------- data --- */

function fixtureSnapshot(): GordoSnapshot {
  const base = JSON.parse(readFileSync(join(ROOT, "tests/fixtures/gordo/snapshot.test-data.json"), "utf8")) as GordoSnapshot;
  const numbers: Record<string, string[]> = { first: [D.first!], second: [D.second!], third: [D.third!], fourth: D.fourth, fifth: D.fifth };
  base.prizes = base.prizes.map((p) => ({ ...p, numbers: numbers[p.key]! }));
  base.pedrea = [...D.pedrea!];
  return base;
}

test("the JSON the checker fetches: the snapshot's numbers only, unavailable without a Gordo or for another year", () => {
  const s = loadSnapshot(fixtureSnapshot(), { allowTestData: true })!;
  const data = checkerData(s);
  assert.equal(data.available, true);
  assert.equal(data.complete, true);
  assert.equal(data.draw!.pedrea!.length, 1_794);
  assert.deepEqual(drawFromSnapshot(s).fifth, D.fifth);
  assert.equal(JSON.stringify(data).length < 30_000, true, "the JSON stays light");
  assert.equal(checkerData(null).available, false);
  assert.equal(checkerData({ ...s, year: 2025, drawDate: "2025-12-22" }).available, false);
  const groups = pedreaByThousand(data.draw!.pedrea!);
  assert.equal(groups.reduce((a, g) => a + g.numbers.length, 0), 1_794);
  assert.ok(groups.every((g) => g.numbers.every((n) => n.startsWith(g.thousand))));
  assert.deepEqual(groups.map((g) => g.thousand), [...groups.map((g) => g.thousand)].sort());
});

test("snapshot validation refuses a bad pedrea: too many, repeated, a top number, not five digits", () => {
  const s = fixtureSnapshot();
  assert.deepEqual(snapshotProblems(s), []);
  const tops = new Set([D.first, D.second, D.third, ...D.fourth, ...D.fifth]);
  const extra = Array.from({ length: 100_000 }, (_, i) => String(i).padStart(5, "0")).find((n) => !tops.has(n) && !s.pedrea!.includes(n))!;
  assert.match(snapshotProblems({ ...s, pedrea: [...s.pedrea!, extra] }).join(), /1795 numbers, the programme has 1794/);
  assert.match(snapshotProblems({ ...s, pedrea: [s.pedrea![0]!, s.pedrea![0]!] }).join(), /appears twice/);
  assert.match(snapshotProblems({ ...s, pedrea: [D.first!] }).join(), /also a top prize/);
  assert.match(snapshotProblems({ ...s, pedrea: ["1234"] }).join(), /not five digits/);
  assert.deepEqual(snapshotProblems({ ...s, pedrea: null }), []);
});

/* -------------------------------------------------------------- script --- */

function scratch(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "lottery-check-"));
  copyFileSync(join(COMPLETE_DIR, "TEST_DATA"), join(dir, "TEST_DATA"));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}

test("build: the pedrea from the TEST draw record, checked against the TEST official list; refused when it does not add up", (t) => {
  if (spawnSync("python3", ["--version"]).error) return t.skip("no python3");
  const script = join(ROOT, "scripts/gordo-snapshot.py");
  const run = (dir: string, extra: string[] = []) => spawnSync("python3", ["-I", script, "build", "--year", "2026", "--dir", dir, "--test-data", "--read-at", "2026-12-22T14:05:00+01:00", "--dry-run", ...extra], { encoding: "utf8" });
  const out = mkdtempSync(join(tmpdir(), "lottery-check-out-"));
  const dirs: string[] = [out];
  try {
    execFileSync("python3", ["-I", script, "build", "--year", "2026", "--dir", COMPLETE_DIR, "--test-data", "--read-at", "2026-12-22T14:05:00+01:00", "--out", join(out, "s.json")]);
    const built = JSON.parse(readFileSync(join(out, "s.json"), "utf8")) as GordoSnapshot;
    assert.deepEqual(built.pedrea, [...D.pedrea!].sort());
    assert.equal(built.testData, true);
    assert.deepEqual(snapshotProblems(built), []);

    const record = readFileSync(join(COMPLETE_DIR, "draw.json"), "utf8");
    const list = readFileSync(join(COMPLETE_DIR, "lista-oficial.txt"), "utf8");
    // pedrea.txt wins over the draw record; 1,795 numbers are refused.
    const extra = Array.from({ length: 100_000 }, (_, i) => String(i).padStart(5, "0")).find((n) => !D.pedrea!.includes(n) && ![D.first, D.second, D.third, ...D.fourth, ...D.fifth].includes(n))!;
    let dir = scratch({ "draw.json": record, "pedrea.txt": `# TEST DATA\n${[...D.pedrea!, extra].join("\n")}\n` });
    dirs.push(dir);
    let r = run(dir);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /1795 numbers, the programme has 1794/);
    // A repeated number.
    dir = scratch({ "draw.json": record, "pedrea.txt": `${D.pedrea![0]}\n${D.pedrea![0]}\n` });
    dirs.push(dir);
    r = run(dir);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /appear twice/);
    // Some, not all, top numbers in the list: not the pedrea.
    dir = scratch({ "draw.json": record, "pedrea.txt": `${D.first}\n${D.pedrea![0]}\n` });
    dirs.push(dir);
    r = run(dir);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /not all of them/);
    // A number the official list does not carry.
    dir = scratch({ "draw.json": record, "lista-oficial.txt": list.split("\n").filter((l) => !l.startsWith(D.pedrea![5]!)).join("\n") });
    dirs.push(dir);
    r = run(dir);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /not on the Lista Oficial/);
    // Two five-digit lists in the record: refused, unless --no-pedrea.
    const two = JSON.parse(record);
    two[0].otraLista = two[0].extraccionesDeCincoCifras.slice(0, 3);
    dir = scratch({ "draw.json": JSON.stringify(two) });
    dirs.push(dir);
    r = run(dir);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /several five-digit lists/);
    r = run(dir, ["--no-pedrea"]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /left out/);
  } finally {
    for (const d of dirs) rmSync(d, { recursive: true, force: true });
  }
});

test("programme: finds every figure in a programme text, refuses when one is missing", (t) => {
  if (spawnSync("python3", ["--version"]).error) return t.skip("no python3");
  const script = join(ROOT, "scripts/gordo-snapshot.py");
  const text = readFileSync(join(ROOT, "tests/fixtures/gordo/programa.test-data.txt"), "utf8");
  const ok = scratch({ "programa.txt": text });
  const bad = scratch({ "programa.txt": text.replace("1.794", "1.700") });
  try {
    const good = spawnSync("python3", ["-I", script, "programme", "--dir", ok], { encoding: "utf8" });
    assert.equal(good.status, 0, good.stderr);
    assert.match(good.stdout, /PROGRAMME_CONFIRMED/);
    const refused = spawnSync("python3", ["-I", script, "programme", "--dir", bad], { encoding: "utf8" });
    assert.equal(refused.status, 1);
    assert.match(refused.stdout, /MISSING pedrea 1\.794/);
  } finally {
    rmSync(ok, { recursive: true, force: true });
    rmSync(bad, { recursive: true, force: true });
  }
});

/* --------------------------------------------------------- page, links --- */

const ALLOWED_FIVE = new Set(["00025", "00024", "00026", "00000", "00099", "99999", "00001"]);
const OFFICIAL = ["www.loteriasyapuestas.es", "www.selae.es", "www.boe.es", "www.rtve.es"];

function pageText(locale: Locale, data = checkerData(null)): string {
  const parts = [
    checkLead(locale, data),
    freshLine(locale),
    preDrawNotice(locale).text,
    ...willDo(locale).items,
    prizeTableText(locale).intro,
    prizeTableText(locale).caption,
    ...rulesText(locale).items,
    rulesText(locale).pending ?? "",
    ...drawText(locale).paras,
    ...payText(locale).items,
    payText(locale).after,
    ...officialText(locale).items,
    ...checkFaq(locale).flatMap((f) => [f.q, f.a]),
  ];
  return parts.join("\n");
}

test("titles and descriptions fit the snippet, in both states; the H1 names the draw and the year", () => {
  const s = loadSnapshot(fixtureSnapshot(), { allowTestData: true })!;
  for (const locale of LOCALES) {
    for (const data of [checkerData(null), checkerData(s)]) {
      const m = checkMeta(locale, data);
      assert.ok(m.title.length <= TITLE_LIMIT, `${locale} title ${m.title.length}: ${m.title}`);
      assert.ok(m.description.length <= DESCRIPTION_LIMIT, `${locale} description ${m.description.length}: ${m.description}`);
      assert.match(m.h1, new RegExp(String(PROGRAMME_YEAR)));
    }
    assert.match(checkMeta(locale, checkerData(s)).description, new RegExp(D.first!));
  }
  assert.equal(checkMeta("es", checkerData(null)).h1, "Comprobar Lotería de Navidad 2026");
  assert.equal(checkMeta("ca", checkerData(null)).h1, "Comprovar la Loteria de Nadal 2026");
  assert.equal(checkMeta("en", checkerData(null)).h1, "Check your Spanish Christmas Lottery ticket 2026");
});

test("before the draw the page prints no winning number, says the rules are pending, and links only official or own pages", () => {
  const known = new Set([...Object.values(checkEditions()), ...Object.values(gordoHubTranslations()), ...Object.values(calcEditions("lottery-tax")), ...LOCALES.map((l) => `/${l}/${B2_PATHS.loteriaNadal[l]}/`)]);
  const sources = checkSources(checkerData(null)).map((s) => s.url);
  for (const locale of LOCALES) {
    const text = pageText(locale);
    const visible = text.replace(/\]\([^)\s]+\)/g, "]");
    for (const n of visible.match(/(?<!\d)\d{5}(?!\d)/g) ?? []) assert.ok(ALLOWED_FIVE.has(n), `${locale}: prints ${n}`);
    assert.match(text, /pedrea/i);
    assert.match(text, /Teatro Real/);
    if (PROGRAMME_CONFIRMED === null) {
      assert.match(freshLine(locale), /pendiente de confirmar|pendent de confirmar|pending confirmation/);
      assert.match(rulesText(locale).pending ?? "", /Pendiente de confirmar|Pendent de confirmar|Pending confirmation/);
      assert.match(CHECKER_COPY[locale].pending, /pendiente de confirmar|pendent de confirmar|pending confirmation/);
    }
    for (const [, href] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (href!.startsWith("/")) {
        assert.ok(href!.startsWith(`/${locale}/`), `${locale} links ${href}`);
        assert.ok(known.has(href!.split("#")[0]!), `${locale}: ${href} is not a known page`);
      } else {
        assert.ok(OFFICIAL.includes(new URL(href!).host), href);
        assert.ok(sources.includes(href!), `${href} is linked but not in the sources`);
      }
    }
    for (const l of relatedLinks(locale)) assert.ok(known.has(l.href), l.href);
    for (const c of CATEGORIES) assert.ok(CATEGORY_LABEL[c.id][locale], `${locale} ${c.id}`);
  }
});

test("the FAQ's figures come from the programme and the tax engine", () => {
  const es = checkFaq("es").map((f) => f.a).join(" ");
  assert.match(es, /100 € por décimo de 20 € \(5 € por euro jugado\)/);
  assert.match(es, /2\.000 € por décimo cada una/);
  assert.match(es, /20 € por décimo si tu número acaba/);
  assert.match(es, /se retienen 72\.000 € y cobras 328\.000 €/);
  assert.equal(checkFaq("ca").length, 6);
  assert.equal(checkFaq("en").length, 6);
});

test("routes: one static page per language, a 404 in the others; the JSON is static, noindex and cacheable", () => {
  for (const locale of LOCALES) {
    const source = readFileSync(join(ROOT, "src/app/(public)/[locale]", CHECK_ROUTE[locale], "page.tsx"), "utf8");
    assert.match(source, /export const revalidate = false;/);
    assert.match(source, /export const dynamicParams = true;/);
    assert.match(source, new RegExp(`locale !== "${locale}"\\) notFound\\(\\)`));
    assert.equal(checkPath(locale), `/${locale}/${CHECK_ROUTE[locale]}/`);
  }
  const route = readFileSync(join(ROOT, "src/app/data/loteria-navidad.json/route.ts"), "utf8");
  assert.match(route, /export const dynamic = "force-static";/);
  assert.match(route, /checkerData\(\)/);
  assert.equal(CHECK_DATA_PATH, "/data/loteria-navidad.json");
  assert.ok(ALWAYS_NOINDEX_SOURCES.includes("/data/:path*"));
  const config = readFileSync(join(ROOT, "next.config.ts"), "utf8");
  assert.match(config, /source: "\/data\/loteria-navidad\.json"/);
  const publish = readFileSync(join(ROOT, "src/app/api/admin/publish/route.ts"), "utf8");
  assert.match(publish, /wants\("comprobar-loteria"\)/);
  assert.match(readFileSync(join(ROOT, "src/app/sitemap.ts"), "utf8"), /checkSitemapEntries\(\)/);
  const page = readFileSync(join(ROOT, "src/components/programmatic/lottery-check/LotteryCheckPage.tsx"), "utf8");
  assert.match(page, /<LotteryChecker locale=\{locale\} dataUrl=\{CHECK_DATA_PATH\} \/>/);
  assert.match(page, /<details/);
});

test("sitemap: the three editions with reciprocal hreflang, never the JSON", () => {
  const entries = checkSitemapEntries(null);
  if (entries.length === 0) return; // indexing off on this machine: nothing to list
  assert.equal(entries.length, 3);
  for (const e of entries) {
    assert.ok(!e.url.includes("/data/"));
    assert.equal(Object.keys(e.alternates!.languages!).length, 4);
  }
});

test("linked both ways: gordo hub, prize tax calculator, lottery guide and the checker", () => {
  for (const locale of LOCALES) {
    const path = checkPath(locale);
    assert.ok(JSON.stringify(hubBlocks(locale, null)).includes(`](${path})`), `${locale}: the gordo hub does not link the checker`);
    assert.ok(JSON.stringify(buildNadalBody(locale, null)).includes(`](${path})`), `${locale}: the guide does not link the checker`);
    assert.ok(bodyToPlainText(buildNadalBody(locale, null)).length > 0);
    const step = calculatorNextStep("lottery-tax", locale, calcPath("lottery-tax", locale));
    assert.ok(step?.links.some((l) => l.href === path), `${locale}: the tax calculator's next step skips the checker`);
    const links = relatedLinks(locale).map((l) => l.href);
    for (const target of [gordoHubTranslations()[locale], calcPath("lottery-tax", locale), `/${locale}/${B2_PATHS.loteriaNadal[locale]}/`]) assert.ok(links.includes(target), `${locale}: ${target}`);
  }
  assert.match(readFileSync(join(ROOT, "src/components/programmatic/lottery-tax/LotteryTaxPage.tsx"), "utf8"), /checkPath\(locale\)/);
});
