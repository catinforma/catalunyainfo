/**
 * Render model for the election-night block on a town page (PROTOTYPE, wired
 * to nothing; see docs/elections-live-results.md). Pure: the clock comes in
 * as an argument, so the tests pin every phase of the night.
 *
 * Rules carried over from the election-night guide and the 29N slot:
 *  - no figure before the polls close, and none that the source stamped
 *    before they closed (Interior's media tests on 18 Nov use fake data);
 *  - only data for the expected polling date (a 2023 replay can never reach
 *    a 2026 page);
 *  - the share of polling stations counted travels with every figure;
 *  - percentages of valid votes (list votes + blank), computed here from the
 *    counts; turnout is voters over electorate as the source gives them;
 *  - seats only when the source publishes them, and only for the territory it
 *    publishes them for: a town elects no deputies, so the town table shows
 *    its province's provisional seats beside each list, labelled as such;
 *  - Senate: each voter may mark up to three candidates in Catalonia's
 *    provinces (LOREG art. 166.1.a), so no percentages, votes only.
 */

import type { LiveCount, LiveSource, LiveTownFile } from "./types";

/** Polls close at 20:00 (LOREG art. 88.1); 29 Nov 2026 is in CET (UTC+1). */
export const POLLS_CLOSE_29N = "2026-11-29T20:00:00+01:00";
export const ELECTION_DATE_29N = "2026-11-29";

/** After this many minutes without a successful fetch the block says the feed is down. */
export const FEED_DOWN_AFTER_MINUTES = 15;

export type LivePhase =
  /** Before the polls close: the page shows only the pre-election copy. */
  | "before-close"
  /** Polls closed, no usable data yet (none written, wrong date, or stamped before the close). */
  | "awaiting"
  /** Data in, not every polling station counted. */
  | "counting"
  /** Every polling station counted. Still the provisional count, not the official result. */
  | "counted";

export interface LiveRow {
  code: string;
  short: string;
  name: string;
  votes: number;
  /** Share of valid votes, 0-100; null for the Senate. */
  share: number | null;
  /** The list's provisional seats in the town's province, when the source publishes them; null otherwise. */
  provinceSeats: number | null;
}

export interface LiveFigures {
  chamber: LiveTownFile["chamber"];
  provisional: boolean;
  /** 0-100 */
  countedPct: number;
  stations: LiveCount["stations"];
  electorate: number;
  voters: number;
  /** voters / electorate, 0-100 */
  turnout: number;
  validVotes: number;
  blank: { votes: number; share: number | null };
  nullVotes: number;
  /** Most votes first; ties broken by the source's code so the order is stable. */
  rows: LiveRow[];
  /** The rows with the most votes (more than one only on a tie; empty with no votes yet). */
  leaders: LiveRow[];
  province: {
    code: string;
    name: string;
    countedPct: number;
    /** Lists with at least one provisional seat, most seats first; null when the source gives none. */
    seats: { code: string; short: string; seats: number }[] | null;
    seatsTotal: number | null;
  } | null;
  source: LiveSource;
  sourceUpdatedAt: string;
  fetchedAt: string;
  minutesSinceSourceUpdate: number;
  minutesSinceFetch: number;
  /** Our ingest has not refreshed the file for FEED_DOWN_AFTER_MINUTES: show the fallback notice. */
  feedDown: boolean;
}

export interface LiveView {
  phase: LivePhase;
  /** Null unless the phase is "counting" or "counted". */
  figures: LiveFigures | null;
  /** Why data on disk was ignored, for logs and the dry run; never shown to readers. */
  ignored: string | null;
}

export interface LiveViewOptions {
  pollsClose?: string;
  electionDate?: string;
  feedDownAfterMinutes?: number;
}

const pct = (part: number, whole: number): number => (whole > 0 ? (part / whole) * 100 : 0);
/** Whole minutes from an ISO instant to `to`; an unreadable instant counts as infinitely old (so the feed reads as down). */
const minutesBetween = (from: string, to: Date): number => {
  const start = Date.parse(from);
  return Number.isFinite(start) ? Math.max(0, Math.floor((to.getTime() - start) / 60_000)) : Number.POSITIVE_INFINITY;
};

/** The source's own counted share, or counted/total when it gives counts only; clamped to 0-100. */
export function countedShare(count: Pick<LiveCount, "countedPct" | "stations">): number {
  const raw = Number.isFinite(count.countedPct) ? count.countedPct : count.stations ? pct(count.stations.counted, count.stations.total) : 0;
  return Math.min(100, Math.max(0, raw));
}

/** Why a file cannot be shown for this election at this time, or null when it can. */
export function rejectReason(file: LiveTownFile, pollsClose: string, electionDate: string): string | null {
  if (file.version !== 1) return `unknown file version ${String(file.version)}`;
  if (file.electionDate !== electionDate) return `election date ${file.electionDate}, expected ${electionDate}`;
  const stamped = Date.parse(file.sourceUpdatedAt);
  if (!Number.isFinite(stamped)) return `unreadable source timestamp "${file.sourceUpdatedAt}"`;
  if (stamped < Date.parse(pollsClose)) return `source timestamp ${file.sourceUpdatedAt} is before the polls closed (${pollsClose})`;
  return null;
}

function provinceBlock(province: LiveCount | null): LiveFigures["province"] {
  if (!province) return null;
  const labels = new Map(province.lists.map((list) => [list.code, list.short]));
  const seats = province.seats
    ? Object.entries(province.seats)
        .filter(([, n]) => n > 0)
        .map(([code, n]) => ({ code, short: labels.get(code) ?? code, seats: n }))
        .sort((a, b) => b.seats - a.seats || a.code.localeCompare(b.code))
    : null;
  return {
    code: province.code,
    name: province.name,
    countedPct: countedShare(province),
    seats,
    seatsTotal: province.seats ? Object.values(province.seats).reduce((a, b) => a + b, 0) : null,
  };
}

/**
 * Everything the live block shows for one town at instant `now`. `file` is
 * the town's file as last written by the ingest (null when there is none or
 * it could not be read).
 */
export function buildLiveView(file: LiveTownFile | null, now: Date, options: LiveViewOptions = {}): LiveView {
  const pollsClose = options.pollsClose ?? POLLS_CLOSE_29N;
  const electionDate = options.electionDate ?? ELECTION_DATE_29N;
  const feedDownAfter = options.feedDownAfterMinutes ?? FEED_DOWN_AFTER_MINUTES;

  if (now.getTime() < Date.parse(pollsClose)) return { phase: "before-close", figures: null, ignored: null };
  if (!file) return { phase: "awaiting", figures: null, ignored: null };
  const reason = rejectReason(file, pollsClose, electionDate);
  if (reason) return { phase: "awaiting", figures: null, ignored: reason };

  const { town } = file;
  const senate = file.chamber === "senate";
  const listVotes = town.lists.reduce((sum, list) => sum + list.votes, 0);
  const validVotes = listVotes + town.blankVotes;
  const provinceSeats = file.province?.seats ?? null;
  const rows: LiveRow[] = town.lists
    .map((list) => ({
      code: list.code,
      short: list.short,
      name: list.name,
      votes: list.votes,
      share: senate ? null : pct(list.votes, validVotes),
      provinceSeats: provinceSeats ? (provinceSeats[list.code] ?? 0) : null,
    }))
    .sort((a, b) => b.votes - a.votes || a.code.localeCompare(b.code));
  const most = rows[0]?.votes ?? 0;
  const countedPct = countedShare(town);
  const minutesSinceFetch = minutesBetween(file.fetchedAt, now);

  return {
    phase: countedPct >= 100 ? "counted" : "counting",
    ignored: null,
    figures: {
      chamber: file.chamber,
      provisional: file.provisional,
      countedPct,
      stations: town.stations,
      electorate: town.electorate,
      voters: town.voters,
      turnout: pct(town.voters, town.electorate),
      validVotes,
      blank: { votes: town.blankVotes, share: senate ? null : pct(town.blankVotes, validVotes) },
      nullVotes: town.nullVotes,
      rows,
      leaders: most > 0 ? rows.filter((row) => row.votes === most) : [],
      province: senate ? null : provinceBlock(file.province),
      source: file.source,
      sourceUpdatedAt: file.sourceUpdatedAt,
      fetchedAt: file.fetchedAt,
      minutesSinceSourceUpdate: minutesBetween(file.sourceUpdatedAt, now),
      minutesSinceFetch,
      feedDown: minutesSinceFetch >= feedDownAfter,
    },
  };
}
