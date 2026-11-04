/**
 * Election-night provisional results (29N 2026), PROTOTYPE: the shapes every
 * source adapter normalises into and the page would read. Behind the
 * ELECTION_LIVE_RESULTS flag (`flag.ts`) and wired to no page or route.
 * Design: docs/elections-live-results.md.
 *
 * Counts only, exactly as the source gives them. Percentages are computed at
 * render time (`render.ts`); seats are never computed here: a seat figure is
 * shown only when the source itself publishes it, and only for the territory
 * it belongs to (the province, for the Congress).
 */

/** Where a snapshot came from. Shown on the page as the attribution line. */
export interface LiveSource {
  /** Adapter id, e.g. "interior-final-muni" (the dry-run replay). */
  adapter: string;
  /** Human name of the dataset or site, as the publisher writes it. */
  name: string;
  publisher: string;
  /** The exact URL or file name read. */
  url: string;
}

/** A candidacy's votes in one territory, names verbatim from the source. */
export interface LiveListVotes {
  /** The source's own candidacy code. */
  code: string;
  short: string;
  name: string;
  votes: number;
}

/** One territory's provisional count (a municipality or a province). */
export interface LiveCount {
  /** Five-digit INE code for a municipality (province + municipality, as Municipality.code), two digits for a province. */
  code: string;
  /** The source's own name for the territory. */
  name: string;
  /**
   * Polling stations (mesas): how many there are and how many are counted.
   * Null when the source gives only a percentage.
   */
  stations: { counted: number; total: number } | null;
  /** Share of polling stations counted, 0-100, as the source publishes it (or counted/total when it gives counts only). */
  countedPct: number;
  electorate: number;
  voters: number;
  blankVotes: number;
  nullVotes: number;
  lists: LiveListVotes[];
  /**
   * Seats by candidacy code, only when the source publishes them for this
   * territory (Congress: provinces). Never filled in by us.
   */
  seats: Record<string, number> | null;
}

/** One complete normalised update: what an ingest run writes. */
export interface LiveSnapshot {
  /** Format version of this object and of the files written from it. */
  version: 1;
  /** Chamber of this count. The page prototype renders the Congress. */
  chamber: "congress" | "senate";
  /** Polling date, ISO (2026-11-29 for the real thing, 2023-07-23 for the dry run). */
  electionDate: string;
  /** The source's own timestamp of this update, ISO with offset. Never our clock. */
  sourceUpdatedAt: string;
  /** When our ingest read it, ISO. */
  fetchedAt: string;
  /** True for the election-night count (art. 98.2 LOREG); false only for the replayed final file. */
  provisional: boolean;
  source: LiveSource;
  /** Catalan municipalities by INE code. */
  towns: Record<string, LiveCount>;
  /** The four Catalan provinces by code ("08", "17", "25", "43"). */
  provinces: Record<string, LiveCount>;
}

/** The compact per-town file the page reads (one per municipality, ~1-2 KB). */
export interface LiveTownFile {
  version: 1;
  chamber: LiveSnapshot["chamber"];
  electionDate: string;
  sourceUpdatedAt: string;
  fetchedAt: string;
  provisional: boolean;
  source: LiveSource;
  town: LiveCount;
  /** The town's province, for the seats block and the comparison. */
  province: LiveCount | null;
}
