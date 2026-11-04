/**
 * Election-night provisional results, PROTOTYPE (docs/elections-live-results.md):
 * feature flag, ingest checks, per-town files and the render model.
 *
 * Real figures: the dry-run replay reads `tests/fixtures/interior/02202307/`,
 * cut from the official 02202307_MUNI.zip (Congress, 23 July 2023; see
 * tests/election-29n-import.test.ts for its provenance). The phase tests use a
 * SYNTHETIC town file built from Sabadell's 2023 counts with the timestamps
 * moved to 29 Nov 2026: test input only, never written anywhere.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, readlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { currentVersion, readCurrent, writeVersion } from "../scripts/lib/live-files.ts";
import { decodeAnsi, electionFiles, parseElection, type ParsedElection } from "../src/lib/programmatic/elections/interior.ts";
import { fromInteriorFinal, INTERIOR_FINAL_ADAPTER } from "../src/lib/programmatic/elections/live/adapters/interior-final.ts";
import { liveResultsEnabled, LIVE_RESULTS_FLAG } from "../src/lib/programmatic/elections/live/flag.ts";
import { livePaths } from "../src/lib/programmatic/elections/live/paths.ts";
import { buildLiveView, countedShare, ELECTION_DATE_29N, POLLS_CLOSE_29N, rejectReason } from "../src/lib/programmatic/elections/live/render.ts";
import { changedTowns, checkProgress, checkSnapshot, parseTownFile, serializeTownFile, townFile } from "../src/lib/programmatic/elections/live/store.ts";
import type { LiveSnapshot, LiveTownFile } from "../src/lib/programmatic/elections/live/types.ts";
import { SNAPSHOT } from "../src/lib/programmatic/elections/snapshot.ts";

const FIXTURE = join(import.meta.dirname, "fixtures", "interior", "02202307");
const TOWNS = ["08019", "08058", "08187", "17079", "25120", "25243", "43905"] as const;
/** RD 806/2026 annex (BOE-A-2026-20742); the same seats as in 2023. */
const PROVINCE_SEATS = { "08": 32, "17": 6, "25": 4, "43": 6 };
const DRY_RUN = { pollsClose: "2023-07-23T20:00:00+02:00", electionDate: "2023-07-23" };

function parseFixture(): ParsedElection {
  const members = readdirSync(FIXTURE).map((name) => ({ name, text: () => decodeAnsi(readFileSync(join(FIXTURE, name))) }));
  return parseElection(electionFiles(members));
}

function replay(): LiveSnapshot {
  return fromInteriorFinal(parseFixture(), TOWNS, {
    source: { adapter: INTERIOR_FINAL_ADAPTER, name: "Resultados por municipio (02202307_MUNI.zip)", publisher: "Ministerio del Interior", url: "https://infoelectoral.interior.gob.es/estaticos/docxl/apliextr/02202307_MUNI.zip" },
    sourceUpdatedAt: "2023-11-10T00:00:00+01:00",
    fetchedAt: "2026-11-04T16:00:00+01:00",
  });
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** SYNTHETIC: Sabadell's 2023 town file re-stamped as a 29N update at `at`, `pct` % counted. */
function night(at: string, pct: number, fetchedAt = at): LiveTownFile {
  const file = townFile(replay(), "08187");
  assert.ok(file);
  return { ...file, electionDate: ELECTION_DATE_29N, sourceUpdatedAt: at, fetchedAt, provisional: true, town: { ...file.town, countedPct: pct, stations: null } };
}

/* -------------------------------------------------------------------------- */
/* Flag                                                                       */
/* -------------------------------------------------------------------------- */

test("flag: off unless ELECTION_LIVE_RESULTS is exactly 'on'", () => {
  assert.equal(LIVE_RESULTS_FLAG, "ELECTION_LIVE_RESULTS");
  assert.equal(liveResultsEnabled({}), false);
  for (const value of ["", "1", "true", "ON", "yes", " on"]) assert.equal(liveResultsEnabled({ ELECTION_LIVE_RESULTS: value }), false, value);
  assert.equal(liveResultsEnabled({ ELECTION_LIVE_RESULTS: "on" }), true);
});

test("flag: nothing in src/ outside the live module imports it yet (wired to no page or route)", () => {
  const root = join(import.meta.dirname, "..");
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!path.endsWith(join("elections", "live"))) walk(path);
      } else if (/\.(ts|tsx|mjs)$/.test(entry.name) && /elections\/live\//.test(readFileSync(path, "utf8"))) {
        offenders.push(path.slice(root.length + 1));
      }
    }
  };
  walk(join(root, "src"));
  assert.deepEqual(offenders, []);
});

/* -------------------------------------------------------------------------- */
/* Dry run on the official 2023 file                                          */
/* -------------------------------------------------------------------------- */

test("replay: the 2023 file normalises to towns and provinces that pass every check", () => {
  const s = replay();
  assert.equal(s.electionDate, "2023-07-23");
  assert.equal(s.chamber, "congress");
  assert.equal(s.provisional, false);
  assert.deepEqual(Object.keys(s.towns).sort(), [...TOWNS]);
  assert.deepEqual(Object.keys(s.provinces).sort(), ["08", "17", "25", "43"]);
  assert.deepEqual(checkSnapshot(s, { electionDate: "2023-07-23", chamber: "congress", towns: TOWNS, provinceSeats: PROVINCE_SEATS }), []);
  const sabadell = s.towns["08187"]!;
  assert.deepEqual(
    { name: sabadell.name, stations: sabadell.stations, pct: sabadell.countedPct, electorate: sabadell.electorate, voters: sabadell.voters, blank: sabadell.blankVotes, null: sabadell.nullVotes, seats: sabadell.seats },
    { name: "Sabadell", stations: { counted: 247, total: 247 }, pct: 100, electorate: 155301, voters: 103041, blank: 901, null: 874, seats: null },
  );
  assert.equal(sabadell.lists.find((l) => l.code === "000047")?.votes, 39729);
  // Seats only where the file gives them: the provinces.
  const seats = (code: string) => Object.values(s.provinces[code]!.seats!).reduce((a, b) => a + b, 0);
  assert.deepEqual(Object.fromEntries(Object.keys(PROVINCE_SEATS).map((code) => [code, seats(code)])), PROVINCE_SEATS);
});

test("replay: every town's counts equal the Generalitat's open data already on the pages (G20231)", () => {
  const s = replay();
  for (const code of TOWNS) {
    const town = s.towns[code]!;
    const page = SNAPSHOT.municipalities.find((m) => m.code === code);
    assert.ok(page, code);
    const listVotes = town.lists.reduce((sum, l) => sum + l.votes, 0);
    assert.deepEqual(
      [town.electorate, town.voters, town.blankVotes, town.nullVotes, listVotes],
      [page.congress.electorate, page.congress.voters, page.congress.blankVotes, page.congress.nullVotes, page.congress.listVotes],
      `${code} ${town.name}`,
    );
  }
});

test("replay: the render model on the dry-run clock gives the table the page would show", () => {
  const file = townFile(replay(), "08187");
  assert.ok(file);
  const view = buildLiveView(file, new Date("2023-11-12T10:00:00+01:00"), DRY_RUN);
  assert.equal(view.phase, "counted");
  const f = view.figures!;
  assert.equal(f.countedPct, 100);
  assert.equal(f.validVotes, 102167);
  assert.equal(f.turnout.toFixed(2), "66.35");
  assert.equal(f.rows[0]?.short, "PSC");
  assert.equal(f.rows[0]?.votes, 39729);
  assert.equal(f.rows[0]?.share?.toFixed(2), "38.89");
  assert.deepEqual(f.leaders.map((r) => r.short), ["PSC"]);
  // Most votes first; shares of valid votes, blank included, add up to 100.
  for (let i = 1; i < f.rows.length; i++) assert.ok(f.rows[i - 1]!.votes >= f.rows[i]!.votes);
  const total = f.rows.reduce((sum, r) => sum + (r.share ?? 0), 0) + (f.blank.share ?? 0);
  assert.ok(Math.abs(total - 100) < 1e-9);
  // Seats: the province's, beside each list; the town itself has none.
  assert.equal(f.province?.name, "Barcelona");
  assert.equal(f.province?.seatsTotal, 32);
  assert.equal(f.rows[0]?.provinceSeats, f.province?.seats?.find((x) => x.code === "000047")?.seats);
  assert.ok(f.rows.every((r) => r.provinceSeats !== null));
  // The replay can never reach a 29N page.
  assert.equal(buildLiveView(file, new Date("2026-11-29T23:00:00+01:00")).phase, "awaiting");
});

/* -------------------------------------------------------------------------- */
/* Phases of the night (synthetic town file)                                  */
/* -------------------------------------------------------------------------- */

test("render: no figure before 20:00 on 29 Nov, even with a file on disk", () => {
  assert.equal(POLLS_CLOSE_29N, "2026-11-29T20:00:00+01:00");
  const early = night("2026-11-29T21:30:00+01:00", 40);
  assert.deepEqual(buildLiveView(early, new Date("2026-11-29T19:59:59+01:00")), { phase: "before-close", figures: null, ignored: null });
  assert.equal(buildLiveView(null, new Date("2026-11-04T12:00:00+01:00")).phase, "before-close");
});

test("render: after the close, no file or an unusable one means 'awaiting', with the reason logged", () => {
  const after = new Date("2026-11-29T20:30:00+01:00");
  assert.deepEqual(buildLiveView(null, after), { phase: "awaiting", figures: null, ignored: null });
  // Interior's media tests (18 Nov) carry fake figures: stamped before the close, refused.
  const test18 = night("2026-11-18T11:00:00+01:00", 55);
  const v = buildLiveView(test18, after);
  assert.equal(v.phase, "awaiting");
  assert.match(v.ignored ?? "", /before the polls closed/);
  assert.match(rejectReason({ ...test18, electionDate: "2023-07-23" }, POLLS_CLOSE_29N, ELECTION_DATE_29N) ?? "", /election date 2023-07-23/);
  assert.match(rejectReason({ ...test18, sourceUpdatedAt: "soon" }, POLLS_CLOSE_29N, ELECTION_DATE_29N) ?? "", /unreadable/);
});

test("render: counting, then counted; the counted share travels with the figures", () => {
  const counting = buildLiveView(night("2026-11-29T21:40:00+01:00", 37.52), new Date("2026-11-29T21:42:00+01:00"));
  assert.equal(counting.phase, "counting");
  assert.equal(counting.figures?.countedPct, 37.52);
  assert.equal(counting.figures?.provisional, true);
  assert.equal(counting.figures?.minutesSinceSourceUpdate, 2);
  assert.equal(counting.figures?.feedDown, false);
  const done = buildLiveView(night("2026-11-30T00:55:00+01:00", 100), new Date("2026-11-30T01:00:00+01:00"));
  assert.equal(done.phase, "counted");
  assert.equal(done.figures?.provisional, true, "100 % counted is still the provisional count");
});

test("render: 15 minutes without a successful fetch flags the feed as down; the last good figures stay", () => {
  const file = night("2026-11-29T22:00:00+01:00", 60, "2026-11-29T22:01:00+01:00");
  assert.equal(buildLiveView(file, new Date("2026-11-29T22:15:59+01:00")).figures?.feedDown, false);
  const down = buildLiveView(file, new Date("2026-11-29T22:16:00+01:00"));
  assert.equal(down.figures?.feedDown, true);
  assert.equal(down.figures?.rows[0]?.votes, 39729);
  assert.equal(buildLiveView({ ...file, fetchedAt: "" }, new Date("2026-11-29T22:02:00+01:00")).figures?.feedDown, true, "no readable fetch time: treated as down");
});

test("render: counted share from counts when the source gives no percentage; clamped to 0-100", () => {
  assert.equal(countedShare({ countedPct: Number.NaN, stations: { counted: 50, total: 200 } }), 25);
  assert.equal(countedShare({ countedPct: 104, stations: null }), 100);
  assert.equal(countedShare({ countedPct: -1, stations: null }), 0);
});

test("render: Senate shows votes only; ties list every leader", () => {
  const base = night("2026-11-29T22:00:00+01:00", 50);
  const senate: LiveTownFile = {
    ...base,
    chamber: "senate",
    town: { ...base.town, lists: [{ code: "B", short: "B", name: "", votes: 10 }, { code: "A", short: "A", name: "", votes: 10 }, { code: "C", short: "C", name: "", votes: 3 }], blankVotes: 0, nullVotes: 0, voters: 23 },
  };
  const v = buildLiveView(senate, new Date("2026-11-29T22:05:00+01:00"));
  assert.ok(v.figures?.rows.every((r) => r.share === null));
  assert.equal(v.figures?.blank.share, null);
  assert.equal(v.figures?.province, null);
  assert.deepEqual(v.figures?.leaders.map((r) => r.code), ["A", "B"], "tie on votes: both, in code order");
});

/* -------------------------------------------------------------------------- */
/* Ingest checks and files                                                    */
/* -------------------------------------------------------------------------- */

test("checks: arithmetic, completeness and towns-within-province problems are named", () => {
  const expect = { electionDate: "2023-07-23", chamber: "congress" as const, towns: TOWNS, provinceSeats: PROVINCE_SEATS };
  const broken = clone(replay());
  broken.towns["08187"]!.voters += 1;
  delete broken.towns["43905"];
  broken.towns["17079"]!.lists[0]!.votes += 10_000_000;
  broken.provinces["25"]!.seats = { ...broken.provinces["25"]!.seats, [broken.provinces["25"]!.lists[0]!.code]: 9 };
  const problems = checkSnapshot(broken, expect);
  assert.ok(problems.some((p) => /08187 Sabadell: lists \+ blank \+ null = 103041, voters = 103042/.test(p)), problems.join("\n"));
  assert.ok(problems.includes("municipality 43905 missing"));
  assert.ok(problems.some((p) => /^province 17: its towns give list/.test(p)));
  assert.ok(problems.some((p) => /^province 25: \d+ seats, the province elects 4/.test(p)));
  assert.deepEqual(checkSnapshot(replay(), { ...expect, electionDate: "2026-11-29" }), ["election date 2023-07-23, expected 2026-11-29"]);
});

test("checks: the count only moves forward; a step back is refused", () => {
  const before = replay();
  assert.deepEqual(checkProgress(null, before), []);
  assert.deepEqual(checkProgress(before, clone(before)), []);
  const back = clone(before);
  back.sourceUpdatedAt = "2023-11-09T00:00:00+01:00";
  back.towns["08187"]!.countedPct = 99;
  back.towns["08187"]!.stations = { counted: 240, total: 247 };
  delete back.towns["25243"];
  assert.deepEqual(checkProgress(before, back), [
    "source timestamp went back from 2023-11-10T00:00:00+01:00 to 2023-11-09T00:00:00+01:00",
    "municipality 08187: counted went back from 100 % to 99 %",
    "municipality 08187: counted polling stations went back from 247 to 240",
    "municipality 25243 disappeared",
  ]);
});

test("files: only changed towns are refreshed; a province change refreshes all its towns", () => {
  const before = replay();
  assert.deepEqual(changedTowns(null, before), [...TOWNS]);
  assert.deepEqual(changedTowns(before, clone(before)), []);
  const town = clone(before);
  town.towns["17079"]!.blankVotes += 1;
  assert.deepEqual(changedTowns(before, town), ["17079"]);
  const province = clone(before);
  province.provinces["25"]!.countedPct = 99.5;
  assert.deepEqual(changedTowns(before, province), ["25120", "25243"]);
});

test("files: a town file round-trips; a missing, truncated or foreign file reads as null", () => {
  const file = townFile(replay(), "25243");
  assert.ok(file);
  assert.equal(file.province?.code, "25");
  const text = serializeTownFile(file);
  assert.ok(text.endsWith("}\n") && !text.slice(0, -1).includes("\n"));
  assert.ok(Buffer.byteLength(text) < 4096, `small enough to serve per town (${Buffer.byteLength(text)} bytes)`);
  assert.deepEqual(parseTownFile(text), file);
  for (const bad of [null, "", text.slice(0, 100), "{}", '{"version":2}', "[]", "null"]) assert.equal(parseTownFile(bad), null, String(bad).slice(0, 20));
  assert.equal(townFile(replay(), "99999"), null);
});

/* -------------------------------------------------------------------------- */
/* Revalidation targets                                                       */
/* -------------------------------------------------------------------------- */

test("paths: literal URLs of every edition of the changed towns; unknown codes reported", () => {
  // Sabadell has ca, es and en pages; Vielha e Mijaran ca and es.
  assert.deepEqual(livePaths(["08187", "25243", "99999"]), {
    paths: ["/ca/eleccions/sabadell/", "/ca/eleccions/vielha-e-mijaran/", "/en/elections/sabadell/", "/es/elecciones/sabadell/", "/es/elecciones/vielha-e-mijaran/"],
    unknown: ["99999"],
  });
  const all = livePaths(SNAPSHOT.municipalities.map((m) => m.code));
  assert.equal(all.unknown.length, 0);
  assert.equal(all.paths.length, 947 + 947 + 30);
});

test("paths: the town routes keep dynamicParams = true, so revalidatePath on them cannot 404", () => {
  for (const segment of ["eleccions", "elecciones", "elections"]) {
    const page = readFileSync(join(import.meta.dirname, "..", "src", "app", "(public)", "[locale]", segment, "[municipi]", "page.tsx"), "utf8");
    assert.match(page, /^export const dynamicParams = true;$/m, segment);
    assert.doesNotMatch(page, /dynamicParams = false/, segment);
  }
});

/* -------------------------------------------------------------------------- */
/* Files on disk (scripts/lib/live-files.ts), in a throwaway temp directory    */
/* -------------------------------------------------------------------------- */

test("disk: each update is a new version; `current` swaps to it; old versions are pruned", async () => {
  const root = mkdtempSync(join(tmpdir(), "live-results-test-"));
  try {
    assert.equal(await readCurrent(root), null);
    assert.equal(await currentVersion(root), null);
    const first = replay();
    const a = await writeVersion(root, first, 1);
    assert.equal(a.towns, TOWNS.length);
    assert.equal(readlinkSync(join(root, "current")), join("v", a.version), "relative link, so the tree can move");
    assert.deepEqual(parseTownFile(readFileSync(join(root, "current", "towns", "08187.json"), "utf8")), townFile(first, "08187"));
    const second = { ...clone(first), fetchedAt: "2026-11-04T16:02:00+01:00" };
    const b = await writeVersion(root, second, 1);
    assert.notEqual(a.version, b.version);
    assert.deepEqual(b.pruned, [a.version]);
    assert.deepEqual(readdirSync(join(root, "v")), [b.version]);
    assert.equal(await currentVersion(root), b.version);
    assert.equal((await readCurrent(root))?.fetchedAt, "2026-11-04T16:02:00+01:00");
    assert.ok(!readdirSync(root).some((name) => name.startsWith(".current-")), "no temporary link left behind");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
