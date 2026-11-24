import assert from "node:assert/strict";
import { mkdtempSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { GROSSA_DRAW_DATE } from "../src/lib/content/batch02/grossa.ts";
import { NADAL_DRAW_DATE } from "../src/lib/content/batch02/loteria-nadal.ts";
import { checkerData, drawFromSnapshot } from "../src/lib/programmatic/lottery-check/data.ts";
import { check } from "../src/lib/programmatic/lottery-check/engine.ts";
import { DRAW_DATE as NAVIDAD_DATE, PROGRAMME_YEAR } from "../src/lib/programmatic/lottery-check/programme.ts";
import { DRAW_DATE as GROSSA_DATE, GROSSA_YEAR } from "../src/lib/programmatic/grossa-check/programme.ts";
import { DRAW_DATE as NINO_DATE, NINO_YEAR } from "../src/lib/programmatic/nino-check/programme.ts";
import { liveCopy, reservedHeight } from "../src/lib/programmatic/lottery-live/copy.ts";
import { DEFAULT_LIVE_DIR, LIVE_FEED_CHECKED, LIVE_FEED_CHECK_BY, createFeed, type FeedSpec } from "../src/lib/programmatic/lottery-live/feed.ts";
import { LIVE_CACHE_CONTROL, navidadSpec } from "../src/lib/programmatic/lottery-live/feeds.ts";
import { LIVE_DRAWS, kindWithoutClock, liveDisplay, madridDay, mayReplace, phaseOf, pollDelay, POLL_MS, type LiveGame } from "../src/lib/programmatic/lottery-live/phases.ts";
import { acceptLive } from "../src/lib/programmatic/lottery-live/use-live-feed.ts";
import { loadSnapshot } from "../src/lib/programmatic/gordo/validate.ts";
import type { GordoSnapshot } from "../src/lib/programmatic/gordo/types.ts";
import { snapshotProblems } from "../src/lib/programmatic/gordo/validate.ts";
import { readFileSync } from "node:fs";

/**
 * Draw-day behaviour of the three checkers (24 Nov 2026): the Madrid-day
 * phases (21 Dec 23:59, 22 Dec 08:59 / 09:00 / 13:30, 23 Dec), what is shown
 * with and without data, the live feed that serves the numbers without a
 * deploy (validated, never goes backwards, keeps the last good one), leading
 * zeros, and the date guard on the VPS set-up.
 *
 * Every number below is invented TEST data, kept in memory or in a temporary
 * directory; none of it is SELAE's, and the site refuses test snapshots.
 */

const ROOT = join(import.meta.dirname, "..");
const at = (iso: string) => new Date(iso);

/* ------------------------------------------------------------- phases --- */

test("the three draws are the pages' own dates and programme years", () => {
  assert.equal(LIVE_DRAWS.navidad.date, NAVIDAD_DATE);
  assert.equal(LIVE_DRAWS.navidad.date, NADAL_DRAW_DATE);
  assert.equal(LIVE_DRAWS.grossa.date, GROSSA_DATE);
  assert.equal(LIVE_DRAWS.grossa.date, GROSSA_DRAW_DATE);
  assert.equal(LIVE_DRAWS.nino.date, NINO_DATE);
  assert.equal(LIVE_DRAWS.navidad.year, PROGRAMME_YEAR);
  assert.equal(LIVE_DRAWS.grossa.year, GROSSA_YEAR);
  assert.equal(LIVE_DRAWS.nino.year, NINO_YEAR);
  // Tuesday, Thursday, Wednesday (SELAE and Loteries de Catalunya, read 24 Nov 2026 in the pages' own constants).
  assert.deepEqual(
    (["navidad", "grossa", "nino"] as const).map((g) => new Date(`${LIVE_DRAWS[g].date}T12:00:00Z`).getUTCDay()),
    [2, 4, 3],
  );
});

test("Christmas lottery phases by Madrid clock: 21 Dec 23:59, 22 Dec 00:00 / 08:59 / 09:00 / 13:30 / 23:59, 23 Dec 00:00", () => {
  const cases: [string, "before" | "draw-day" | "after"][] = [
    ["2026-12-21T23:59:00+01:00", "before"],
    ["2026-12-22T00:00:00+01:00", "draw-day"],
    ["2026-12-22T08:59:00+01:00", "draw-day"],
    ["2026-12-22T09:00:00+01:00", "draw-day"],
    ["2026-12-22T13:30:00+01:00", "draw-day"],
    ["2026-12-22T23:59:59+01:00", "draw-day"],
    ["2026-12-23T00:00:00+01:00", "after"],
  ];
  for (const [iso, phase] of cases) assert.equal(phaseOf("navidad", at(iso)), phase, iso);
  // The Madrid day, not UTC's: 23:30 UTC on 22 Dec is already 23 Dec in Madrid.
  assert.equal(madridDay(at("2026-12-22T23:30:00Z")), "2026-12-23");
  assert.equal(phaseOf("navidad", at("2026-12-22T23:30:00Z")), "after");
  assert.equal(phaseOf("navidad", at("2026-12-21T23:30:00Z")), "draw-day");
});

test("La Grossa (31 Dec) and El Niño (6 Jan) change phase at Madrid midnight too", () => {
  assert.equal(phaseOf("grossa", at("2026-12-30T23:59:00+01:00")), "before");
  assert.equal(phaseOf("grossa", at("2026-12-31T00:00:00+01:00")), "draw-day");
  assert.equal(phaseOf("grossa", at("2026-12-31T23:59:00+01:00")), "draw-day");
  assert.equal(phaseOf("grossa", at("2027-01-01T00:00:00+01:00")), "after");
  assert.equal(phaseOf("nino", at("2027-01-05T23:59:00+01:00")), "before");
  assert.equal(phaseOf("nino", at("2027-01-06T13:00:00+01:00")), "draw-day");
  assert.equal(phaseOf("nino", at("2027-01-07T00:00:00+01:00")), "after");
});

/* ------------------------------------------------------ what is shown --- */

const input = (game: LiveGame, iso: string, o: Partial<{ available: boolean; complete: boolean; fetchFailed: boolean; hasData: boolean }> = {}) => ({
  game,
  now: at(iso),
  available: false,
  complete: false,
  fetchFailed: false,
  hasData: false,
  ...o,
});

test("pending before the data, whatever the clock says on the draw day: no draw time is needed", () => {
  assert.equal(liveDisplay(input("navidad", "2026-12-21T23:59:00+01:00")).kind, "pending-before");
  for (const t of ["08:59", "09:00", "09:01", "13:30"]) assert.equal(liveDisplay(input("navidad", `2026-12-22T${t}:00+01:00`)).kind, "pending-today", t);
  assert.equal(liveDisplay(input("navidad", "2026-12-23T00:00:00+01:00")).kind, "missing-after");
});

test("with numbers: partial until every number is in, then complete; never 'no prize' from a partial draw", () => {
  assert.equal(liveDisplay(input("navidad", "2026-12-22T09:30:00+01:00", { available: true, hasData: true })).kind, "partial");
  assert.equal(liveDisplay(input("navidad", "2026-12-22T13:30:00+01:00", { available: true, complete: true, hasData: true })).kind, "complete");
  // data wins over the clock: numbers loaded early are shown, a late draw stays "partial" into the next day
  assert.equal(liveDisplay(input("navidad", "2026-12-23T00:10:00+01:00", { available: true, hasData: true })).kind, "partial");
});

test("a failing feed keeps the last good numbers with a warning, or says it cannot load", () => {
  const stale = liveDisplay(input("navidad", "2026-12-22T11:00:00+01:00", { available: true, hasData: true, fetchFailed: true }));
  assert.deepEqual([stale.kind, stale.warning], ["partial", "stale"]);
  const none = liveDisplay(input("navidad", "2026-12-22T11:00:00+01:00", { fetchFailed: true }));
  assert.deepEqual([none.kind, none.warning], ["pending-today", "unreachable"]);
  assert.equal(liveDisplay(input("navidad", "2026-12-22T11:00:00+01:00", { available: true, hasData: true })).warning, null);
});

test("polling: a minute on the draw day while incomplete, never before, after or once complete", () => {
  assert.equal(pollDelay("navidad", at("2026-12-21T23:59:00+01:00"), false), null);
  assert.equal(pollDelay("navidad", at("2026-12-22T09:00:00+01:00"), false), POLL_MS);
  assert.equal(pollDelay("navidad", at("2026-12-22T13:30:00+01:00"), true), null);
  assert.equal(pollDelay("navidad", at("2026-12-23T00:00:00+01:00"), false), null);
});

test("an older or poorer answer never replaces what the reader already has", () => {
  const held = { available: true, readAt: "2026-12-22T10:00:00+01:00" };
  assert.equal(mayReplace(null, { available: false, readAt: null }), true);
  assert.equal(mayReplace(held, { available: false, readAt: null }), false);
  assert.equal(mayReplace(held, { available: true, readAt: "2026-12-22T09:55:00+01:00" }), false);
  assert.equal(mayReplace(held, { available: true, readAt: "2026-12-22T10:00:00+01:00" }), true);
  assert.equal(mayReplace(held, { available: true, readAt: "2026-12-22T10:05:00+01:00" }), true);
  assert.equal(mayReplace({ available: false, readAt: null }, { available: true, readAt: "2026-12-22T10:05:00+01:00" }), true);
});

test("the browser accepts only an answer of this draw's shape and year", () => {
  const good: Record<string, unknown> = { schema: 1, available: false, complete: false, readAt: null, year: 2026, draw: null };
  const ok = (game: LiveGame, json: unknown): boolean => acceptLive(game, json);
  assert.ok(ok("navidad", good));
  assert.ok(!ok("navidad", { ...good, year: 2025 }));
  assert.ok(!ok("navidad", { ...good, available: true }), "available with no draw");
  assert.ok(ok("navidad", { ...good, available: true, draw: {} }));
  assert.ok(!ok("grossa", good), "the Grossa answer carries game: grossa");
  assert.ok(ok("grossa", { ...good, game: "grossa" }));
  assert.ok(!ok("nino", { ...good, game: "nino", year: 2026 }), "El Niño 2027");
  assert.ok(!ok("nino", { ...good, game: "nino", year: 2027, available: true, draw: {} }), "no programme");
  assert.ok(!ok("navidad", null));
  assert.ok(!ok("navidad", "<html>"));
});

test("copy: pending, partial, complete, missing, warnings and the official link text in ca, es and en, for each game", () => {
  for (const game of ["navidad", "grossa", "nino"] as const) {
    for (const locale of ["ca", "es", "en"] as const) {
      const t = liveCopy(game, locale);
      for (const kind of ["pending-before", "pending-today", "partial", "complete", "missing-after"] as const) {
        const c = t.kind[kind]("13:05");
        assert.ok(c.title.length > 10 && c.text.length > 20, `${game} ${locale} ${kind}`);
      }
      assert.match(t.kind.partial("13:05").title, /13:05/);
      assert.match(t.stale("13:05"), /13:05/);
      assert.match(t.pendingFor("00012"), /00012/, "leading zeros survive");
      assert.ok(t.officialLabel.length > 5 && t.unreachable.length > 10);
      const org = game === "grossa" ? "Loteries de Catalunya" : "SELAE";
      assert.match(t.kind["pending-today"]("").text, new RegExp(org), `${game} ${locale}`);
    }
  }
  // Pending, never a verdict, before the data.
  assert.doesNotMatch(liveCopy("navidad", "es").kind["pending-today"]("").text, /sin premio/i);
});

/* ----------------------------------------------------------- the feed --- */

/** An invented, in-memory Christmas snapshot: leading zeros on purpose. TEST DATA, not SELAE's. */
function snap(over: Partial<GordoSnapshot> = {}, fifth = ["67890"], pedrea: string[] | undefined = undefined): GordoSnapshot {
  return {
    schema: 1,
    testData: false,
    year: 2026,
    drawDate: "2026-12-22",
    drawId: "TEST",
    readAt: "2026-12-22T09:40:00+01:00",
    sources: { results: "https://www.loteriasyapuestas.es/es/loteria-nacional/resultados/test", officialList: null },
    prizes: [
      { key: "first", numbers: ["00012"], perDecimo: 400_000, page: null, outlets: null },
      { key: "second", numbers: ["23456"], perDecimo: 125_000, page: null, outlets: null },
      { key: "third", numbers: [], perDecimo: 50_000, page: null, outlets: null },
      { key: "fourth", numbers: [], perDecimo: 20_000, page: null, outlets: null },
      { key: "fifth", numbers: fifth, perDecimo: 6_000, page: null, outlets: null },
    ],
    ...(pedrea ? { pedrea } : {}),
    ...over,
  };
}

function fakeFs() {
  const files = new Map<string, { text: string; mtime: number; ctime: number; mode: "ok" | "denied" }>();
  let clock = 1;
  return {
    put: (name: string, v: unknown) => files.set(`/live/${name}`, { text: typeof v === "string" ? v : JSON.stringify(v), mtime: clock++, ctime: clock, mode: "ok" }),
    del: (name: string) => files.delete(`/live/${name}`),
    /** chmod: changes ctime, never mtime or size. */
    chmod: (name: string, mode: "ok" | "denied") => {
      const f = files.get(`/live/${name}`)!;
      files.set(`/live/${name}`, { ...f, mode, ctime: ++clock });
    },
    /** Same text of the same length written over the file with its old mtime kept (cp -p): only ctime moves. */
    overwritePreservingMtime: (name: string, text: string) => {
      const f = files.get(`/live/${name}`)!;
      files.set(`/live/${name}`, { ...f, text, ctime: ++clock });
    },
    deps: {
      dir: () => "/live",
      readFile: async (p: string) => {
        const f = files.get(p);
        if (!f) throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
        if (f.mode === "denied") throw Object.assign(new Error("EACCES"), { code: "EACCES" });
        return f.text;
      },
      stat: async (p: string) => {
        const f = files.get(p);
        if (!f) throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
        return { mtimeMs: f.mtime, ctimeMs: f.ctime, size: f.text.length };
      },
    },
  };
}

const spec = (committed: GordoSnapshot | null): FeedSpec<GordoSnapshot> => ({ ...navidadSpec, committed });

test("feed: no file serves the committed snapshot (none before the day)", async () => {
  const fs = fakeFs();
  const feed = createFeed(spec(null), fs.deps);
  assert.deepEqual(await feed.read(), { snapshot: null, origin: "none", warning: null });
  const c = snap();
  assert.equal((await createFeed(spec(c), fs.deps).read()).origin, "committed");
});

test("feed: a valid file goes live without a deploy; leading zeros are kept as strings in the JSON the browser gets", async () => {
  const fs = fakeFs();
  const feed = createFeed(spec(null), fs.deps);
  assert.equal((await feed.read()).origin, "none");
  fs.put("navidad.json", snap());
  const r = await feed.read();
  assert.equal(r.origin, "live");
  assert.equal(r.warning, null);
  const body = JSON.stringify(checkerData(r.snapshot));
  assert.match(body, /"first":"00012"/, "00012 is a string, not the number 12");
  const data = JSON.parse(body);
  assert.equal(data.available, true);
  assert.equal(data.complete, false);
  assert.equal(data.draw.first, "00012");
  // The checker engine answers for the typed string, and says "not complete" rather than "no prize".
  const hit = check("00012", drawFromSnapshot(r.snapshot!));
  assert.equal(hit.status, "prize");
  assert.equal(hit.hits[0]!.category, "first");
  assert.equal(hit.perDecimo > 0, true);
  assert.equal(check("00013", drawFromSnapshot(r.snapshot!)).hits.some((h) => h.category === "approxFirst"), true);
  assert.equal(check("54321", drawFromSnapshot(r.snapshot!)).status, "none-yet");
});

test("feed: a corrupt, test-data or off-host file is refused and the last good one stays, with a warning", async () => {
  const fs = fakeFs();
  const feed = createFeed(spec(null), fs.deps);
  fs.put("navidad.json", snap());
  assert.equal((await feed.read()).origin, "live");
  for (const bad of ["{ not json", JSON.stringify({ ...snap(), testData: true }), JSON.stringify({ ...snap(), sources: { results: "https://example.com/x", officialList: null } }), JSON.stringify({ ...snap(), year: 2025 })]) {
    fs.put("navidad.json", bad);
    const r = await feed.read();
    assert.equal(r.warning, "invalid", bad.slice(0, 40));
    assert.equal(r.origin, "live");
    assert.equal(r.snapshot!.prizes[0]!.numbers[0], "00012");
  }
  // and a first-ever bad file serves the committed snapshot instead
  const fs2 = fakeFs();
  fs2.put("navidad.json", "garbage");
  const r2 = await createFeed(spec(null), fs2.deps).read();
  assert.deepEqual([r2.origin, r2.warning, r2.snapshot], ["none", "invalid", null]);
});

test("feed: a draw only grows; a poorer file is refused until the file is deleted", async () => {
  const fs = fakeFs();
  const feed = createFeed(spec(null), fs.deps);
  fs.put("navidad.json", snap({}, ["67890", "78901", "89012"]));
  assert.equal((await feed.read()).snapshot!.prizes[4]!.numbers.length, 3);
  fs.put("navidad.json", snap({ readAt: "2026-12-22T09:50:00+01:00" }, ["67890"]));
  const r = await feed.read();
  assert.equal(r.warning, "regressed");
  assert.equal(r.snapshot!.prizes[4]!.numbers.length, 3);
  // an equal or richer file replaces it
  fs.put("navidad.json", snap({ readAt: "2026-12-22T09:55:00+01:00" }, ["67890", "78901", "89012", "90123"]));
  const r2 = await feed.read();
  assert.equal(r2.warning, null);
  assert.equal(r2.snapshot!.prizes[4]!.numbers.length, 4);
  // deleting the file is the rollback: back to the committed snapshot, state reset
  fs.del("navidad.json");
  assert.deepEqual(await feed.read(), { snapshot: null, origin: "none", warning: null });
  fs.put("navidad.json", snap({}, ["67890"]));
  assert.equal((await feed.read()).snapshot!.prizes[4]!.numbers.length, 1, "after a delete a poorer correction is accepted");
});

test("feed: the richer of the live file and the committed snapshot wins, so the post-draw deploy never goes backwards", async () => {
  const fs = fakeFs();
  const committedFull = snap({}, ["67890", "78901", "89012"]);
  const feed = createFeed(spec(committedFull), fs.deps);
  fs.put("navidad.json", snap({}, ["67890"]));
  assert.equal((await feed.read()).origin, "committed");
  fs.put("navidad.json", snap({}, ["67890", "78901", "89012", "90123"]));
  assert.equal((await feed.read()).origin, "live");
  // same richness: the newer read time
  fs.put("navidad.json", snap({ readAt: "2026-12-22T09:10:00+01:00" }, ["67890", "78901", "89012", "90123"]));
  const feed2 = createFeed(spec(snap({ readAt: "2026-12-22T09:20:00+01:00" }, ["11111", "22222", "33333", "44444"])), fs.deps);
  assert.equal((await feed2.read()).origin, "committed");
});

test("feed: an unreadable directory keeps what is held and says so", async () => {
  const fs = fakeFs();
  const feed = createFeed(spec(null), fs.deps);
  fs.put("navidad.json", snap());
  assert.equal((await feed.read()).origin, "live");
  const broken = createFeed(spec(null), { ...fs.deps, stat: async () => { throw Object.assign(new Error("EACCES"), { code: "EACCES" }); } });
  assert.deepEqual(await broken.read(), { snapshot: null, origin: "none", warning: "unreadable" });
  let fail = false;
  const flaky = createFeed(spec(null), { ...fs.deps, stat: async (p: string) => { if (fail) throw Object.assign(new Error("EIO"), { code: "EIO" }); return fs.deps.stat(p); } });
  assert.equal((await flaky.read()).origin, "live");
  fail = true;
  const r = await flaky.read();
  assert.deepEqual([r.origin, r.warning], ["live", "unreadable"]);
});

test("feed: a file that cannot be read (mode 600) is 'unreadable', not 'invalid', and is read again after chmod without a restart", async () => {
  const fs = fakeFs();
  const feed = createFeed(spec(null), fs.deps);
  fs.put("navidad.json", snap());
  fs.chmod("navidad.json", "denied");
  const denied = await feed.read();
  assert.deepEqual([denied.origin, denied.warning, denied.snapshot], ["none", "unreadable", null]);
  // every further request tries again (the key is not remembered while the read fails)
  assert.equal((await feed.read()).warning, "unreadable");
  fs.chmod("navidad.json", "ok"); // same mtime, same size: only ctime moved
  const fixed = await feed.read();
  assert.deepEqual([fixed.origin, fixed.warning], ["live", null]);
  assert.equal(fixed.snapshot!.prizes[0]!.numbers[0], "00012");
  // a file that WAS good and becomes unreadable keeps the last good one, flagged
  fs.chmod("navidad.json", "denied");
  const kept = await feed.read();
  assert.deepEqual([kept.origin, kept.warning], ["live", "unreadable"]);
  assert.equal(kept.snapshot!.prizes[0]!.numbers[0], "00012");
  // invalid stays distinct: unreadable never reports it
  const bad = fakeFs();
  bad.put("navidad.json", "{ nope");
  assert.equal((await createFeed(spec(null), bad.deps).read()).warning, "invalid");
});

test("feed: ctime is part of the key, so a cp -p over the file (same mtime, same size) is picked up", async () => {
  const fs = fakeFs();
  const feed = createFeed(spec(null), fs.deps);
  const a = JSON.stringify(snap({}, ["67890"]));
  fs.put("navidad.json", a);
  assert.equal((await feed.read()).snapshot!.prizes[4]!.numbers[0], "67890");
  fs.overwritePreservingMtime("navidad.json", a.replace("67890", "67891"));
  assert.equal((await feed.read()).snapshot!.prizes[4]!.numbers[0], "67891");
});

test("the live directory is outside the root-owned shared/ and the runbooks say so", () => {
  assert.equal(DEFAULT_LIVE_DIR, "/srv/catalunyainfo/live/lottery");
  assert.ok(!DEFAULT_LIVE_DIR.includes("/shared/"));
  for (const f of ["docs/GORDO_NAVIDAD_RUNBOOK.md", "docs/GROSSA_NINO_RUNBOOK.md", "docs/HIGH_TRAFFIC_RUNBOOK.md"]) {
    const doc = readFileSync(join(ROOT, f), "utf8");
    assert.ok(!doc.includes("shared/live/lottery"), f);
  }
  const gordo = readFileSync(join(ROOT, "docs/GORDO_NAVIDAD_RUNBOOK.md"), "utf8");
  assert.ok(gordo.includes("/srv/catalunyainfo/live/lottery"));
  // correcting a number: wait for feed committed/none before writing (else "regressed")
  assert.match(gordo, /do NOT write the corrected\s+file until that curl shows `committed`/);
});

test("no clock yet (server render): the initial data decides, so the static HTML after the draw is not 'pending'", () => {
  assert.equal(kindWithoutClock(null), "pending-before");
  assert.equal(kindWithoutClock({ available: false, complete: false }), "pending-before");
  assert.equal(kindWithoutClock({ available: true, complete: false }), "partial");
  assert.equal(kindWithoutClock({ available: true, complete: true }), "complete");
  const hook = readFileSync(join(ROOT, "src/lib/programmatic/lottery-live/use-live-feed.ts"), "utf8");
  assert.match(hook, /useState<LiveFeed<T>>\(\{ data: initial,/);
  assert.match(hook, /useRef<T \| null>\(initial\)/);
  for (const [file, comp] of [
    ["lottery-check/LotteryCheckPage.tsx", "LotteryChecker"],
    ["grossa-check/GrossaCheckPage.tsx", "GrossaChecker"],
    ["nino-check/NinoCheckPage.tsx", "NinoChecker"],
  ] as const) {
    assert.match(readFileSync(join(ROOT, "src/components/programmatic", file), "utf8"), new RegExp(`<${comp} [^>]*initial=\\{data\\}`), file);
  }
  assert.match(readFileSync(join(ROOT, "src/components/programmatic/gordo/routes.tsx"), "utf8"), /<LiveNumbers [^>]*initial=\{checkerData\(SNAPSHOT\)\}/);
});

test("the status box reserves the height of its tallest state (CLS), per game and language", () => {
  for (const game of ["navidad", "grossa", "nino"] as const) {
    for (const locale of ["ca", "es", "en"] as const) {
      const h = reservedHeight(game, locale);
      const narrow = parseFloat(h.narrow);
      const wide = parseFloat(h.wide);
      assert.match(h.narrow, /^\d+(\.\d)?em$/);
      assert.ok(narrow > wide && wide > 8, `${game} ${locale}: ${h.narrow} / ${h.wide}`);
      assert.ok(narrow < 60, "not absurdly tall");
    }
  }
  const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
  assert.match(css, /\.ci-live-status \{\s*min-height: var\(--live-min-narrow\);/);
  assert.match(css, /min-height: var\(--live-min-wide\);/);
  assert.match(readFileSync(join(ROOT, "src/components/programmatic/lottery-live/LiveStatus.tsx"), "utf8"), /ci-live-status/);
});

test("route: /data/loteria-navidad.json reads LOTTERY_LIVE_DIR at request time, with a 30 s edge cache and no deploy", async () => {
  const dir = mkdtempSync(join(tmpdir(), "lottery-live-"));
  const before = process.env.LOTTERY_LIVE_DIR;
  process.env.LOTTERY_LIVE_DIR = dir;
  try {
    const { GET } = await import("../src/app/data/loteria-navidad.json/route.ts");
    const first = await GET();
    assert.equal(first.headers.get("cache-control"), LIVE_CACHE_CONTROL);
    assert.match(first.headers.get("content-type") ?? "", /application\/json/);
    const pre = (await first.json()) as { available: boolean; feed: string; warning: unknown };
    assert.deepEqual([pre.available, pre.feed, pre.warning], [false, "none", null]);
    writeFileSync(join(dir, "navidad.json"), JSON.stringify(snap()));
    const live = (await (await GET()).json()) as { available: boolean; feed: string; draw: { first: string } };
    assert.deepEqual([live.available, live.feed, live.draw.first], [true, "live", "00012"]);
    unlinkSync(join(dir, "navidad.json"));
    assert.equal(((await (await GET()).json()) as { available: boolean }).available, false);
  } finally {
    if (before === undefined) delete process.env.LOTTERY_LIVE_DIR;
    else process.env.LOTTERY_LIVE_DIR = before;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("cache: 30 s at the edge, a minute stale, 15 s in browsers; the three routes use it and next.config has no rule for them", () => {
  assert.match(LIVE_CACHE_CONTROL, /s-maxage=30/);
  assert.match(LIVE_CACHE_CONTROL, /max-age=15/);
  assert.match(LIVE_CACHE_CONTROL, /stale-while-revalidate=60/);
  for (const f of ["loteria-navidad.json", "grossa-cap-d-any.json", "loteria-nino.json"]) {
    const route = readFileSync(join(ROOT, "src/app/data", f, "route.ts"), "utf8");
    assert.match(route, /"cache-control": LIVE_CACHE_CONTROL/);
    assert.match(route, /export const dynamic = "force-dynamic";/);
  }
  const config = readFileSync(join(ROOT, "next.config.ts"), "utf8");
  for (const f of ["loteria-navidad", "grossa-cap-d-any", "loteria-nino"]) assert.ok(!config.includes(`source: "/data/${f}.json"`), f);
});

test("the checker pages always render the checker (pending until the numbers arrive) and link the official place", () => {
  for (const [file, comp, href] of [
    ["lottery-check/LotteryCheckPage.tsx", "LotteryChecker", "NADAL_URLS.lnac"],
    ["grossa-check/GrossaCheckPage.tsx", "GrossaChecker", "GROSSA_URLS.results"],
    ["nino-check/NinoCheckPage.tsx", "NinoChecker", "NADAL_URLS.lnac"],
  ] as const) {
    const page = readFileSync(join(ROOT, "src/components/programmatic", file), "utf8");
    assert.match(page, new RegExp(`<${comp} locale=\\{locale\\} dataUrl=\\{\\w+\\} officialHref=\\{${href.replace(".", "\\.")}\\} initial=\\{data\\} />`));
    assert.ok(!/data\.available \? \(\s*<\w+Checker/.test(page), `${file}: the checker must not wait for a deploy`);
    const checker = readFileSync(join(ROOT, "src/components/programmatic", file.replace("CheckPage.tsx", "Checker.tsx")), "utf8");
    assert.match(checker, /useLiveFeed</);
    assert.match(checker, /<LiveStatus /);
  }
});

test("the production snapshots are still null or valid, and the live validator is the committed one", () => {
  assert.deepEqual(snapshotProblems(null), []);
  assert.equal(loadSnapshot(null), null);
});

/* ------------------------------------------------------- date guard --- */

test(`date guard: from ${LIVE_FEED_CHECK_BY} someone has checked the live feed on the VPS and recorded it in LIVE_FEED_CHECKED`, () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  assert.ok(LIVE_FEED_CHECK_BY < NAVIDAD_DATE);
  if (LIVE_FEED_CHECKED === null) {
    assert.ok(
      today < LIVE_FEED_CHECK_BY,
      `From ${LIVE_FEED_CHECK_BY}: on the VPS create the live directory (docs/GORDO_NAVIDAD_RUNBOOK.md, "Live feed, one-off setup"), check that curl of /data/loteria-navidad.json answers feed:"committed" with s-maxage=30 and a Cloudflare HIT on the second request, then fill LIVE_FEED_CHECKED in src/lib/programmatic/lottery-live/feed.ts.`,
    );
  }
});
