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
}

/**
 * D'Hondt as LOREG art. 163.1 describes it: lists under the threshold are left
 * out; each remaining list's votes are divided by 1, 2, 3... and the seats go
 * to the largest quotients. A tie goes to the list with more votes in total
 * (art. 163.1.d); a tie in that too is decided by lot, which this function
 * cannot reproduce, so the tests only rely on it where no such tie exists.
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
  return { seats: result, last: won[won.length - 1] ?? null, nextOut: quotients[seats] ?? null };
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
