/**
 * Dry-run adapter (PROTOTYPE): the Interior Ministry's official results file
 * by municipality (FICHEROS.doc format, parsed by `../../interior.ts`) as a
 * LiveSnapshot, so the whole night pipeline (checks, per-town files, render
 * model) can be rehearsed on real 2023 figures. It is NOT the night format:
 * that file is the general count, published weeks later, so every town comes
 * out 100 % counted and `provisional: false`.
 *
 * Seats: file 08 gives them per province; towns get none.
 */

import { CATALONIA_REGION, CATALAN_PROVINCES, countsOf, type AreaRow, type MunicipalityRow, type ParsedElection } from "../../interior";
import type { LiveCount, LiveListVotes, LiveSnapshot, LiveSource } from "../types";

export const INTERIOR_FINAL_ADAPTER = "interior-final-muni";

function lists(parsed: ParsedElection, votes: Record<string, number>): LiveListVotes[] {
  return Object.entries(votes).map(([code, n]) => {
    const c = parsed.candidacies.get(code);
    return { code, short: c?.short ?? code, name: c?.name ?? "", votes: n };
  });
}

function count(parsed: ParsedElection, code: string, name: string, row: MunicipalityRow | AreaRow, seats: Record<string, number> | null): LiveCount {
  const c = countsOf(row);
  return {
    code,
    name,
    stations: { counted: row.stations, total: row.stations },
    countedPct: 100,
    electorate: c.electorate,
    voters: c.voters,
    blankVotes: c.blankVotes,
    nullVotes: c.nullVotes,
    lists: lists(parsed, row.votes),
    seats,
  };
}

/**
 * The requested Catalan towns and the four provinces of a parsed file.
 * `sourceUpdatedAt` is the file's own date (the latest modification date of
 * its members), `fetchedAt` the moment the replay read it.
 */
export function fromInteriorFinal(
  parsed: ParsedElection,
  towns: readonly string[],
  meta: { source: LiveSource; sourceUpdatedAt: string; fetchedAt: string },
): LiveSnapshot {
  const out: LiveSnapshot = {
    version: 1,
    chamber: "congress",
    electionDate: parsed.date,
    sourceUpdatedAt: meta.sourceUpdatedAt,
    fetchedAt: meta.fetchedAt,
    provisional: false,
    source: meta.source,
    towns: {},
    provinces: {},
  };
  for (const code of towns) {
    const m = parsed.municipalities.get(code);
    if (!m || m.region !== CATALONIA_REGION) continue;
    out.towns[code] = count(parsed, code, m.name, m, null);
  }
  for (const province of CATALAN_PROVINCES) {
    const row = parsed.areas?.find((a) => a.region === CATALONIA_REGION && a.province === province && a.constituency === "9");
    if (!row) continue;
    out.provinces[province] = count(parsed, province, row.name, row, { ...row.seatsByList });
  }
  return out;
}
