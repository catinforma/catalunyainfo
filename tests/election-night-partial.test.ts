/**
 * Results night 29N, partial counts end to end (ci-enginyeria, 25 Nov 2026):
 * a night's worth of successive updates (37 %, 62 %, 100 % of polling stations
 * counted) goes through the same checks, the same versioned per-town files on
 * disk and the same render model that docs/RESULTS_NIGHT_29N.md describes,
 * and the page's view moves forward with each update.
 *
 * The figures are SYNTHETIC: the 2023 official fixture
 * (`tests/fixtures/interior/02202307/`, see election-29n-import.test.ts)
 * with every count cut down to a fraction and re-stamped as a 29N update.
 * Test input only; written to a temporary directory and removed. The census
 * is scaled with the votes (the census of the tables counted so far), so the
 * turnout of a partial count is the turnout of those tables.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { readCurrent, writeVersion } from "../scripts/lib/live-files.ts";
import { decodeAnsi, electionFiles, parseElection } from "../src/lib/programmatic/elections/interior.ts";
import { fromInteriorFinal, INTERIOR_FINAL_ADAPTER } from "../src/lib/programmatic/elections/live/adapters/interior-final.ts";
import { livePaths } from "../src/lib/programmatic/elections/live/paths.ts";
import { buildLiveView, ELECTION_DATE_29N } from "../src/lib/programmatic/elections/live/render.ts";
import { changedTowns, checkProgress, checkSnapshot, parseTownFile, townFile } from "../src/lib/programmatic/elections/live/store.ts";
import type { LiveCount, LiveSnapshot } from "../src/lib/programmatic/elections/live/types.ts";

const FIXTURE = join(import.meta.dirname, "fixtures", "interior", "02202307");
const TOWNS = ["08019", "08058", "08187", "17079", "25120", "25243", "43905"] as const;
const PROVINCE_SEATS = { "08": 32, "17": 6, "25": 4, "43": 6 };
const EXPECT = { electionDate: ELECTION_DATE_29N, chamber: "congress" as const, towns: TOWNS, provinceSeats: PROVINCE_SEATS };

const finalCounts = (): LiveSnapshot => {
  const members = readdirSync(FIXTURE).map((name) => ({ name, text: () => decodeAnsi(readFileSync(join(FIXTURE, name))) }));
  return fromInteriorFinal(parseElection(electionFiles(members)), TOWNS, {
    source: { adapter: INTERIOR_FINAL_ADAPTER, name: "SYNTHETIC night count (2023 fixture, cut down)", publisher: "Ministerio del Interior", url: "test" },
    sourceUpdatedAt: "2026-11-29T21:00:00+01:00",
    fetchedAt: "2026-11-29T21:00:30+01:00",
  });
};

/** Every count cut to `pct` % (rounded down everywhere, so towns never exceed their province), stamped `at`. */
function partial(pct: number, at: string): LiveSnapshot {
  const base = finalCounts();
  const cut = (c: LiveCount): LiveCount => {
    const lists = c.lists.map((l) => ({ ...l, votes: Math.floor((l.votes * pct) / 100) }));
    const blankVotes = Math.floor((c.blankVotes * pct) / 100);
    const nullVotes = Math.floor((c.nullVotes * pct) / 100);
    const voters = lists.reduce((s, l) => s + l.votes, 0) + blankVotes + nullVotes;
    return { ...c, lists, blankVotes, nullVotes, voters, electorate: Math.max(voters, Math.floor((c.electorate * pct) / 100)), countedPct: pct, stations: null };
  };
  const each = (m: Record<string, LiveCount>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, cut(v)]));
  return { ...base, electionDate: ELECTION_DATE_29N, provisional: true, sourceUpdatedAt: at, fetchedAt: at, towns: each(base.towns), provinces: each(base.provinces) };
}

const read = (root: string, town: string) => parseTownFile(readFileSync(join(root, "current", "towns", `${town}.json`), "utf8"));

test("night: 37 % -> 62 % -> 100 % counted; every update passes the checks, lands on disk and moves the page forward", async () => {
  const root = mkdtempSync(join(tmpdir(), "night-partial-test-"));
  try {
    const steps = [
      { pct: 37, at: "2026-11-29T21:40:00+01:00", now: "2026-11-29T21:42:00+01:00", phase: "counting" },
      { pct: 62, at: "2026-11-29T22:30:00+01:00", now: "2026-11-29T22:31:00+01:00", phase: "counting" },
      { pct: 100, at: "2026-11-30T00:50:00+01:00", now: "2026-11-30T00:51:00+01:00", phase: "counted" },
    ] as const;
    let previous: LiveSnapshot | null = null;
    let lastVotes = 0;
    for (const step of steps) {
      const snap = partial(step.pct, step.at);
      assert.deepEqual(checkSnapshot(snap, EXPECT), [], `${step.pct} %: checks`);
      assert.deepEqual(checkProgress(previous, snap), [], `${step.pct} %: progress`);
      const changed = changedTowns(previous, snap);
      assert.deepEqual(changed, [...TOWNS], `${step.pct} %: every town moved`);
      assert.equal(livePaths(changed).unknown.length, 0, "every changed town has page URLs");
      await writeVersion(root, snap);
      previous = await readCurrent(root);

      const file = read(root, "08187");
      assert.ok(file, "the town file reads back");
      const view = buildLiveView(file, new Date(step.now));
      assert.equal(view.phase, step.phase);
      const f = view.figures!;
      assert.equal(f.countedPct, step.pct, "the counted share travels with the figures");
      assert.equal(f.provisional, true, "provisional at every step, 100 % included");
      assert.equal(f.feedDown, false);
      assert.ok(f.validVotes > lastVotes, "more votes than the update before");
      lastVotes = f.validVotes;
      const total = f.rows.reduce((s, r) => s + (r.share ?? 0), 0) + (f.blank.share ?? 0);
      assert.ok(Math.abs(total - 100) < 1e-9, `${step.pct} %: shares add up (${total})`);
      assert.ok(f.turnout > 0 && f.turnout <= 100);
      assert.equal(f.rows[0]?.short, "PSC", "same leader on a uniform cut");
      assert.equal(f.province?.name, "Barcelona");
      assert.equal(f.province?.countedPct, step.pct);
      assert.ok(f.rows.every((r) => r.provinceSeats !== null), "the province's seats sit beside each list");
    }
    // The 100 % update is the final 2023 figure for Sabadell: nothing lost on the way.
    assert.equal(read(root, "08187")?.town.lists.find((l) => l.short === "PSC")?.votes, 39729);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("night: a repeated update changes no page; a step back is refused; a stalled feed keeps the last figures", async () => {
  const first = partial(37, "2026-11-29T21:40:00+01:00");
  const again = { ...partial(37, "2026-11-29T21:40:00+01:00"), fetchedAt: "2026-11-29T21:42:00+01:00" };
  assert.deepEqual(changedTowns(first, again), [], "same counts, later fetch: no town to revalidate");
  const back = partial(30, "2026-11-29T21:50:00+01:00");
  const problems = checkProgress(first, back);
  assert.ok(problems.some((p) => /municipality 08187: counted went back from 37 % to 30 %/.test(p)), problems.join("\n"));
  // The ingest stops at 21:41 (last successful fetch); 15 minutes later the page says the feed is down, still with the 37 % figures.
  const root = mkdtempSync(join(tmpdir(), "night-partial-test-"));
  try {
    await writeVersion(root, { ...first, fetchedAt: "2026-11-29T21:41:00+01:00" });
    const file = read(root, "08187");
    assert.equal(buildLiveView(file, new Date("2026-11-29T21:55:00+01:00")).figures?.feedDown, false);
    const down = buildLiveView(file, new Date("2026-11-29T21:56:00+01:00"));
    assert.equal(down.phase, "counting");
    assert.equal(down.figures?.feedDown, true);
    assert.equal(down.figures?.countedPct, 37);
    assert.equal(down.figures?.sourceUpdatedAt, "2026-11-29T21:40:00+01:00", "the notice can name the last update");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("night: no figure of a partial count before 21:00 Madrid, and not from a file stamped before the close", () => {
  const file = townFile(partial(37, "2026-11-29T20:40:00+01:00"), "08187");
  assert.ok(file);
  assert.equal(buildLiveView(file, new Date("2026-11-29T20:59:00+01:00")).phase, "awaiting");
  assert.equal(buildLiveView(file, new Date("2026-11-29T21:00:00+01:00")).phase, "counting");
  assert.equal(buildLiveView({ ...file, sourceUpdatedAt: "2026-11-29T19:00:00+01:00" }, new Date("2026-11-29T21:30:00+01:00")).phase, "awaiting");
});
