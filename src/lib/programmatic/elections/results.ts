/**
 * Everything the pages compute from the snapshot's counts. Pure: no dates, no
 * I/O, so the tests run every figure the reader sees.
 *
 * Percentages are of valid votes (list votes + blank votes), which is what the
 * law uses for the threshold (LOREG art. 180) and what the official results
 * print. Turnout is voters over electorate.
 */

import type { CataloniaRegional, Counts, General2026, ListLabel, MunicipalList, MunicipalResult, RegionalVotes } from "./types";

export const share = (part: number, whole: number): number => (whole > 0 ? (part / whole) * 100 : 0);

export const turnout = (counts: Counts): number => share(counts.voters, counts.electorate);

/** LOREG art. 180: a list needs at least 5 % of the valid votes to win councillors. */
export const MUNICIPAL_THRESHOLD = 0.05;

/** The smallest whole number of votes that is at least 5 % of `validVotes`. */
export function thresholdVotes(validVotes: number, fraction = MUNICIPAL_THRESHOLD): number {
  return Math.ceil(validVotes * fraction - 1e-9);
}

/** LOREG art. 179.1: councillors by number of residents. */
export function councilSize(residents: number): number {
  if (residents <= 100) return 3;
  if (residents <= 250) return 5;
  if (residents <= 1_000) return 7;
  if (residents <= 2_000) return 9;
  if (residents <= 5_000) return 11;
  if (residents <= 10_000) return 13;
  if (residents <= 20_000) return 17;
  if (residents <= 50_000) return 21;
  if (residents <= 100_000) return 25;
  // One more per 100,000 residents or fraction, plus one when the result is even.
  const seats = 25 + Math.ceil((residents - 100_000) / 100_000);
  return seats % 2 === 0 ? seats + 1 : seats;
}

export interface Quotient {
  code: string;
  votes: number;
  divisor: number;
  value: number;
}

export interface DhondtResult {
  seats: Record<string, number>;
  /** The quotient that won the last seat. */
  last: Quotient | null;
  /** The highest quotient left without a seat. */
  nextOut: Quotient | null;
  /**
   * When the last seat is a tie that arithmetic cannot settle (same quotient
   * and same total votes, LOREG art. 163.1.d: by lot, then alternately), every
   * quotient in that tie, in or out; otherwise empty. `seats` then shows one
   * arbitrary outcome of the draw, which `matchDhondt` does not rely on.
   */
  tied: Quotient[];
}

/** Same quotient and same total votes: only a draw separates them. */
const level = (a: Quotient, b: Quotient) => a.value === b.value && a.votes === b.votes;

/**
 * D'Hondt as LOREG art. 163.1 describes it: lists under the threshold are left
 * out; each remaining list's votes are divided by 1, 2, 3... and the seats go
 * to the largest quotients. A tie goes to the list with more votes in total
 * (art. 163.1.d); a tie in that too is decided by lot, which this function
 * cannot reproduce: it reports such a tie on the last seat in `tied`.
 * (IEEE division is correctly rounded, so equal fractions give equal quotients.)
 */
export function dhondt(
  lists: { code: string; votes: number }[],
  seats: number,
  validVotes: number,
  threshold = MUNICIPAL_THRESHOLD,
): DhondtResult {
  const minimum = thresholdVotes(validVotes, threshold);
  const eligible = lists.filter((list) => list.votes >= minimum && list.votes > 0);
  const quotients: Quotient[] = eligible.flatMap((list) =>
    Array.from({ length: seats + 1 }, (_, i) => ({ code: list.code, votes: list.votes, divisor: i + 1, value: list.votes / (i + 1) })),
  );
  quotients.sort((a, b) => b.value - a.value || b.votes - a.votes);
  const won = quotients.slice(0, seats);
  const result: Record<string, number> = Object.fromEntries(lists.map((list) => [list.code, 0]));
  for (const q of won) result[q.code] = (result[q.code] ?? 0) + 1;
  const last = won[won.length - 1] ?? null;
  const nextOut = quotients[seats] ?? null;
  const tied = last && nextOut && level(last, nextOut) ? quotients.filter((q) => level(q, last)) : [];
  return { seats: result, last, nextOut, tied };
}

export interface DhondtMatch {
  /** The official councillors are what D'Hondt gives (up to a tie settled by lot). */
  ok: boolean;
  /** The lists that won a seat in a tie on the last seat settled by lot (art. 163.1.d); empty when there was none. */
  drawnBy: string[];
  /** The lists in that tie. */
  tiedLists: string[];
}

/**
 * Whether the official councillors (`seats` of each list) are exactly what
 * D'Hondt with the 5 % threshold gives. Where the last seat is a tie in
 * quotient and in total votes, the law settles it by lot (art. 163.1.d) and
 * no arithmetic can say who won it: then every list must hold exactly the
 * seats its untied quotients win, plus at most one seat if it is in the tie,
 * and the tie must fill exactly the seats left. Anything else is a mismatch.
 */
export function matchDhondt(lists: { code: string; votes: number; seats: number }[], seats: number, validVotes: number): DhondtMatch {
  const result = dhondt(lists, seats, validVotes);
  if (result.tied.length === 0 || !result.last) {
    return { ok: lists.every((list) => result.seats[list.code] === list.seats), drawnBy: [], tiedLists: [] };
  }
  const last = result.last;
  const minimum = thresholdVotes(validVotes);
  const sure: Record<string, number> = {};
  let sureTotal = 0;
  for (const list of lists) {
    if (list.votes < minimum || list.votes <= 0) continue;
    // Quotients strictly ahead of the tie: larger, or equal with more votes.
    let n = 0;
    for (let d = 1; d <= seats; d++) {
      const value = list.votes / d;
      if (value > last.value || (value === last.value && list.votes > last.votes)) n++;
    }
    sure[list.code] = n;
    sureTotal += n;
  }
  const tiedLists = [...new Set(result.tied.map((q) => q.code))];
  const drawnBy: string[] = [];
  let ok = true;
  for (const list of lists) {
    const extra = list.seats - (sure[list.code] ?? 0);
    if (extra === 1 && tiedLists.includes(list.code)) drawnBy.push(list.code);
    else if (extra !== 0) ok = false;
  }
  if (drawnBy.length !== seats - sureTotal) ok = false;
  return { ok, drawnBy, tiedLists };
}

/* -------------------------------------------------------------------------- */
/* Small councils: open lists and concejo abierto                             */
/* -------------------------------------------------------------------------- */

/**
 * How a municipality elected its council in 2023, by the residents on the
 * register used for the election and the posts the official data say were
 * to be filled. Read on the BOE, LOREG consolidated text, 30 Oct 2026:
 *
 *  - "lists" (over 250 residents): closed lists, D'Hondt among the lists
 *    with at least 5 % of the valid votes (arts. 163.1 and 180), council
 *    size by the scale of art. 179.1;
 *  - "open" (up to 250, art. 184): lists of up to 3 names (up to 100
 *    residents) or 5 (101 to 250); each voter marks up to 2 or 4 candidates;
 *    the candidates with most votes are elected up to the 3 or 5 of the
 *    scale; ties by lot. No threshold, no D'Hondt: votes go to candidates,
 *    so a list's figure is not a count of ballots;
 *  - "council" (art. 179.2): municipalities under concejo abierto (consell
 *    obert), where the scale does not apply and voters elect the mayor
 *    directly by majority. The official data record one post to fill, the
 *    mayoralty, for a municipality the scale would give 3.
 */
export type CouncilSystem = "lists" | "open" | "council";

/** Residents up to which councils are elected with open lists (LOREG art. 184). */
export const OPEN_LIST_MAX = 250;
/** Residents up to which a council has 3 members and voters mark 2 names (arts. 179.1 and 184). */
export const SMALLEST_STEP = 100;

export function councilSystem(result: Pick<MunicipalResult, "censusPopulation" | "seats">): CouncilSystem {
  if (result.censusPopulation <= SMALLEST_STEP && result.seats === 1) return "council";
  if (result.censusPopulation <= OPEN_LIST_MAX) return "open";
  return "lists";
}

/** Councillors elected, as the source records them (fewer than the council's size when a seat stayed empty). */
export const electedCount = (result: MunicipalResult): number => result.lists.reduce((sum, list) => sum + list.seats, 0);

/** The lists with most councillors (or the mayoralty, in a concejo abierto); more than one only on a tie. */
export function leadingLists(result: MunicipalResult): MunicipalList[] {
  const most = Math.max(0, ...result.lists.map((list) => list.seats));
  if (most === 0) return [];
  return result.lists.filter((list) => list.seats === most);
}

/** Every municipality's turnout added up: voters over electorate, from the counts. */
export function pooledTurnout(results: Counts[]): number {
  const voters = results.reduce((sum, r) => sum + r.voters, 0);
  const electorate = results.reduce((sum, r) => sum + r.electorate, 0);
  return share(voters, electorate);
}

/* -------------------------------------------------------------------------- */

export interface MunicipalRow extends MunicipalList {
  share: number;
  /** Reached the 5 % threshold. */
  eligible: boolean;
}

export interface MunicipalView {
  rows: MunicipalRow[];
  blankShare: number;
  threshold: number;
  turnout: number;
  /** Lists under the threshold. */
  belowThreshold: number;
  dhondt: DhondtResult;
}

/**
 * The table and quotients of a council elected by D'Hondt ("lists"). Shares
 * are of valid votes; for "council" (concejo abierto) the shares hold too,
 * since each voter casts one vote for the mayoralty. For "open" the lists'
 * figures are not ballots, so the page prints no shares (see `councilSystem`).
 */
export function municipalView(result: MunicipalResult): MunicipalView {
  const threshold = thresholdVotes(result.validVotes);
  const rows = result.lists.map((list) => ({
    ...list,
    share: share(list.votes, result.validVotes),
    eligible: list.votes >= threshold,
  }));
  return {
    rows,
    blankShare: share(result.blankVotes, result.validVotes),
    threshold,
    turnout: turnout(result),
    belowThreshold: rows.filter((row) => !row.eligible).length,
    dhondt: dhondt(result.lists, result.seats, result.validVotes),
  };
}

/** Catalonia without the vote from abroad: the sum of its municipalities. */
export function residents(catalonia: CataloniaRegional): RegionalVotes {
  const { total, abroad } = catalonia;
  const votes: Record<string, number> = {};
  for (const [code, n] of Object.entries(total.votes)) votes[code] = n - (abroad.votes[code] ?? 0);
  return {
    electorate: total.electorate - abroad.electorate,
    voters: total.voters - abroad.voters,
    nullVotes: total.nullVotes - abroad.nullVotes,
    blankVotes: total.blankVotes - abroad.blankVotes,
    listVotes: total.listVotes - abroad.listVotes,
    validVotes: total.validVotes - abroad.validVotes,
    votes,
  };
}

export interface RegionalRow {
  code: string;
  short: string;
  name: string;
  votes: number;
  share: number;
  cataloniaShare: number;
  /** Seats the list won in Catalonia as a whole. */
  cataloniaSeats: number;
}

export interface RegionalView {
  rows: RegionalRow[];
  others: { votes: number; share: number; cataloniaShare: number; lists: number };
  blank: { votes: number; share: number; cataloniaShare: number };
  turnout: number;
  cataloniaTurnout: number;
  /** Official turnout including the vote from abroad. */
  cataloniaTurnoutWithAbroad: number;
}

/**
 * One municipality's Congress or Parliament vote beside Catalonia's. Lists
 * that won seats in Catalonia get a row each; the rest are summed into one.
 */
export function regionalView(local: RegionalVotes, catalonia: CataloniaRegional, labels: Record<string, ListLabel>): RegionalView {
  const region = residents(catalonia);
  const seated = Object.keys(catalonia.seats);
  const label = (code: string): ListLabel => labels[code] ?? { short: code, name: "" };
  const rows = seated
    .map((code) => ({
      code,
      ...label(code),
      votes: local.votes[code] ?? 0,
      share: share(local.votes[code] ?? 0, local.validVotes),
      cataloniaShare: share(region.votes[code] ?? 0, region.validVotes),
      cataloniaSeats: catalonia.seats[code] ?? 0,
    }))
    .sort((a, b) => b.votes - a.votes || b.cataloniaShare - a.cataloniaShare);
  const otherCodes = Object.keys(local.votes).filter((code) => !seated.includes(code));
  const otherVotes = otherCodes.reduce((sum, code) => sum + (local.votes[code] ?? 0), 0);
  const otherRegion = Object.keys(region.votes)
    .filter((code) => !seated.includes(code))
    .reduce((sum, code) => sum + (region.votes[code] ?? 0), 0);
  return {
    rows,
    others: {
      votes: otherVotes,
      share: share(otherVotes, local.validVotes),
      cataloniaShare: share(otherRegion, region.validVotes),
      lists: otherCodes.filter((code) => (local.votes[code] ?? 0) > 0).length,
    },
    blank: {
      votes: local.blankVotes,
      share: share(local.blankVotes, local.validVotes),
      cataloniaShare: share(region.blankVotes, region.validVotes),
    },
    turnout: turnout(local),
    cataloniaTurnout: turnout(region),
    cataloniaTurnoutWithAbroad: turnout(catalonia.total),
  };
}

/* -------------------------------------------------------------------------- */

export interface GeneralView {
  /** Every candidacy on the town's ballot, most votes first; names as the Ministry's file writes them. */
  rows: RegionalRow[];
  blank: { votes: number; share: number; cataloniaShare: number };
  /** The candidacies with the most votes (more than one only on a tie). */
  leaders: RegionalRow[];
  turnout: number;
  /** Catalonia without the vote from abroad, like the 2023 and 2024 comparisons. */
  cataloniaTurnout: number;
  cataloniaTurnoutWithAbroad: number;
  /** Seats Catalonia elects (sum of the file's Catalonia row). */
  cataloniaSeats: number;
}

/**
 * One municipality's 29N vote beside Catalonia's, from the imported Interior
 * file. A candidacy's Catalonia share is that of its regional code, under
 * which the file adds up the party's candidacies in the four provinces.
 */
export function generalView(local: RegionalVotes, general: General2026): GeneralView {
  const region = general.catalonia;
  const rows = Object.entries(local.votes)
    .map(([code, votes]) => {
      const list = general.lists[code] ?? { short: code, name: "", regional: code };
      return {
        code,
        short: list.short,
        name: list.name,
        votes,
        share: share(votes, local.validVotes),
        cataloniaShare: share(region.votes[list.regional] ?? 0, region.validVotes),
        cataloniaSeats: general.cataloniaSeats[list.regional] ?? 0,
      };
    })
    .sort((a, b) => b.votes - a.votes || b.cataloniaShare - a.cataloniaShare || a.code.localeCompare(b.code));
  const most = rows[0]?.votes ?? 0;
  return {
    rows,
    blank: { votes: local.blankVotes, share: share(local.blankVotes, local.validVotes), cataloniaShare: share(region.blankVotes, region.validVotes) },
    leaders: most > 0 ? rows.filter((row) => row.votes === most) : [],
    turnout: turnout(local),
    cataloniaTurnout: turnout(region),
    cataloniaTurnoutWithAbroad: turnout(general.cataloniaTotal),
    cataloniaSeats: Object.values(general.cataloniaSeats).reduce((a, b) => a + b, 0),
  };
}
