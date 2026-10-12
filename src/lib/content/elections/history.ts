/**
 * Election results in Catalonia since 1977, read from the Generalitat's open
 * data ("Processos electorals", Subdirecció General de Processos Electorals).
 *
 * Three datasets, all at Catalonia level (`id_nivell_territorial = 'CA'`):
 *   - tgns-3xuy: the list of elections, with ids and dates
 *   - irrv-2mfc: electorate, voters and valid votes per election
 *   - ntc4-rnwr: votes and seats per list
 * Election ids are a type letter plus year plus sequence: G = Congress,
 * A = Parliament of Catalonia (`G20192` is the November 2019 general).
 *
 * Percentages are always computed here from the counts. The source's own
 * percentage fields are not used: in the municipal tables at least one is
 * wrong (Barcelona 2023 abstention given as 65.03 % when the counts give
 * 39.4 %), and a computed figure cannot disagree with the numbers beside it.
 *
 * Licence: Generalitat open-data licence; the source and its last-update date
 * must be cited, which the component does.
 */

const BASE = "https://analisi.transparenciacatalunya.cat/resource";

export const ELECTIONS_SOURCE = {
  name: "Processos electorals (convocatòries, participació i vots)",
  url: "https://analisi.transparenciacatalunya.cat/d/ntc4-rnwr",
  publisher: "Generalitat de Catalunya. Departament de la Presidència — dades obertes",
};

/** Results do not change after they are final; a day is plenty. */
const REVALIDATE_SECONDS = 86_400;

export type ElectionKind = "congress" | "parliament";

const PREFIX: Record<ElectionKind, string> = { congress: "G", parliament: "A" };

export interface ListResult {
  short: string;
  name: string;
  votes: number;
  seats: number;
  /** Share of valid votes, computed. */
  share: number;
}

export interface ElectionResult {
  id: string;
  /** ISO date. */
  date: string;
  electorate: number;
  voters: number;
  validVotes: number;
  /** Voters over electorate, computed. */
  turnout: number;
  seats: number;
  /** Lists that won seats, by votes; the rest are dropped. */
  lists: ListResult[];
  /**
   * True when the dataset carries no seat figures for this election (the
   * April 2019 general, as of Oct 2026). `lists` then holds the six most
   * voted lists with `seats` 0, and the component says so instead of
   * showing zeros as if they were results.
   */
  seatsMissing: boolean;
}

export interface ElectionHistory {
  kind: ElectionKind;
  elections: ElectionResult[];
  error: string | null;
}

interface ElectionRow {
  id_eleccio?: string;
  data_eleccio?: string;
}
interface TurnoutRow {
  id_eleccio?: string;
  cens_electoral?: string;
  votants?: string;
  vots_valids?: string;
  escons?: string;
}
interface VoteRow {
  id_eleccio?: string;
  candidatura_sigles?: string;
  candidatura_denominacio?: string;
  vots?: string;
  escons?: string;
}

const num = (value: string | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Pure: joins the three tables. Tested without the network. */
export function buildHistory(
  kind: ElectionKind,
  elections: ElectionRow[],
  turnout: TurnoutRow[],
  votes: VoteRow[],
): ElectionHistory {
  const byTurnout = new Map(turnout.map((row) => [row.id_eleccio ?? "", row]));
  const results: ElectionResult[] = [];

  for (const election of elections) {
    const id = election.id_eleccio ?? "";
    const date = (election.data_eleccio ?? "").slice(0, 10);
    const t = byTurnout.get(id);
    if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !t) continue;

    const electorate = num(t.cens_electoral);
    const voters = num(t.votants);
    const validVotes = num(t.vots_valids);
    if (electorate <= 0 || validVotes <= 0) continue;

    const all = votes
      .filter((row) => row.id_eleccio === id)
      .map((row) => ({
        short: (row.candidatura_sigles ?? "").trim(),
        name: (row.candidatura_denominacio ?? "").trim(),
        votes: num(row.vots),
        seats: num(row.escons),
        share: (num(row.vots) / validVotes) * 100,
      }))
      .sort((a, b) => b.votes - a.votes);
    const seated = all.filter((list) => list.seats > 0);
    const seatsMissing = seated.length === 0;
    const lists = seatsMissing ? all.slice(0, 6) : seated;

    results.push({
      id,
      date,
      electorate,
      voters,
      validVotes,
      turnout: (voters / electorate) * 100,
      seats: num(t.escons),
      lists,
      seatsMissing,
    });
  }

  results.sort((a, b) => b.date.localeCompare(a.date));
  return { kind, elections: results, error: results.length === 0 ? "no elections" : null };
}

async function query<T>(dataset: string, params: string): Promise<T[]> {
  const response = await fetch(`${BASE}/${dataset}.json?${params}`, {
    headers: { accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(20_000),
  } as RequestInit);
  if (!response.ok) throw new Error(`${dataset} ${response.status}`);
  return (await response.json()) as T[];
}

export async function loadElectionHistory(kind: ElectionKind): Promise<ElectionHistory> {
  const prefix = PREFIX[kind];
  const where = (extra = "") =>
    encodeURIComponent(`starts_with(id_eleccio,'${prefix}')${extra}`);
  try {
    const [elections, turnout, votes] = await Promise.all([
      query<ElectionRow>("tgns-3xuy", `$where=${where()}&$select=id_eleccio,data_eleccio&$limit=200`),
      query<TurnoutRow>(
        "irrv-2mfc",
        `$where=${where(" AND id_nivell_territorial='CA'")}&$select=id_eleccio,cens_electoral,votants,vots_valids,escons&$limit=200`,
      ),
      query<VoteRow>(
        "ntc4-rnwr",
        `$where=${where(" AND id_nivell_territorial='CA'")}&$select=id_eleccio,candidatura_sigles,candidatura_denominacio,vots,escons&$limit=5000`,
      ),
    ]);
    return buildHistory(kind, elections, turnout, votes);
  } catch (error) {
    return { kind, elections: [], error: error instanceof Error ? error.message : "unreachable" };
  }
}
