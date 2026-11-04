/**
 * Checks and file shapes for the election-night ingest (PROTOTYPE, wired to
 * nothing; see docs/elections-live-results.md). Pure: snapshots in, problems
 * and file contents out. The ingest script does the I/O: it writes the
 * per-town files only when `checkSnapshot` and `checkProgress` return no
 * problems, and otherwise keeps the last good set on disk untouched.
 */

import type { LiveCount, LiveSnapshot, LiveTownFile } from "./types";

const sum = (values: Iterable<number>): number => {
  let total = 0;
  for (const v of values) total += v;
  return total;
};

const isCount = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0;

/** Problems with one territory's figures on their own. */
export function checkCount(where: string, c: LiveCount): string[] {
  const problems: string[] = [];
  for (const [field, value] of Object.entries({ electorate: c.electorate, voters: c.voters, blankVotes: c.blankVotes, nullVotes: c.nullVotes })) {
    if (!isCount(value)) problems.push(`${where}: ${field} is not a whole number (${String(value)})`);
  }
  for (const list of c.lists) if (!isCount(list.votes)) problems.push(`${where}: list ${list.code} has votes ${String(list.votes)}`);
  if (problems.length) return problems;
  if (!(c.countedPct >= 0 && c.countedPct <= 100)) problems.push(`${where}: counted ${c.countedPct} % is outside 0-100`);
  if (c.stations && (c.stations.counted > c.stations.total || c.stations.total <= 0)) {
    problems.push(`${where}: ${c.stations.counted} of ${c.stations.total} polling stations counted`);
  }
  if (c.voters > c.electorate) problems.push(`${where}: ${c.voters} voters for ${c.electorate} electors`);
  // Voters = valid (lists + blank) + null: true by definition in Interior's results.
  const cast = sum(c.lists.map((l) => l.votes)) + c.blankVotes + c.nullVotes;
  if (cast !== c.voters) problems.push(`${where}: lists + blank + null = ${cast}, voters = ${c.voters}`);
  const codes = new Set<string>();
  for (const list of c.lists) {
    if (codes.has(list.code)) problems.push(`${where}: list code ${list.code} appears twice`);
    codes.add(list.code);
  }
  if (c.seats) for (const code of Object.keys(c.seats)) if (!codes.has(code)) problems.push(`${where}: seats for unknown list ${code}`);
  return problems;
}

export interface SnapshotExpectation {
  electionDate: string;
  chamber: LiveSnapshot["chamber"];
  /** Every municipality that must be present (all 947 for the real feed). */
  towns: readonly string[];
  /** Deputies per province (RD 806/2026 annex: Barcelona 32, Girona 6, Lleida 4, Tarragona 6); checked only when the source gives seats. */
  provinceSeats?: Readonly<Record<string, number>>;
}

/** Problems with a snapshot on its own: shape, completeness, arithmetic. Empty means it may be written. */
export function checkSnapshot(s: LiveSnapshot, expect: SnapshotExpectation): string[] {
  const problems: string[] = [];
  if (s.version !== 1) problems.push(`unknown snapshot version ${String(s.version)}`);
  if (s.electionDate !== expect.electionDate) problems.push(`election date ${s.electionDate}, expected ${expect.electionDate}`);
  if (s.chamber !== expect.chamber) problems.push(`chamber ${s.chamber}, expected ${expect.chamber}`);
  if (!Number.isFinite(Date.parse(s.sourceUpdatedAt))) problems.push(`unreadable source timestamp "${s.sourceUpdatedAt}"`);
  for (const code of expect.towns) if (!s.towns[code]) problems.push(`municipality ${code} missing`);
  for (const [code, town] of Object.entries(s.towns)) {
    if (!/^\d{5}$/.test(code) || town.code !== code) problems.push(`municipality key ${code} does not match its code ${town.code}`);
    problems.push(...checkCount(`municipality ${code} ${town.name}`, town));
    if (!s.provinces[code.slice(0, 2)]) problems.push(`municipality ${code}: province ${code.slice(0, 2)} missing`);
  }
  for (const [code, province] of Object.entries(s.provinces)) {
    problems.push(...checkCount(`province ${code} ${province.name}`, province));
    const expected = expect.provinceSeats?.[code];
    if (province.seats && expected !== undefined) {
      const total = sum(Object.values(province.seats));
      if (total > expected) problems.push(`province ${code}: ${total} seats, the province elects ${expected}`);
    }
  }
  // The towns of a province can never hold more votes for a list than the province itself.
  const byProvince = new Map<string, Map<string, number>>();
  for (const town of Object.values(s.towns)) {
    const totals = byProvince.get(town.code.slice(0, 2)) ?? new Map<string, number>();
    for (const list of town.lists) totals.set(list.code, (totals.get(list.code) ?? 0) + list.votes);
    byProvince.set(town.code.slice(0, 2), totals);
  }
  for (const [code, totals] of byProvince) {
    const province = s.provinces[code];
    if (!province) continue;
    const own = new Map(province.lists.map((l) => [l.code, l.votes]));
    for (const [list, votes] of totals) {
      if (votes > (own.get(list) ?? 0)) problems.push(`province ${code}: its towns give list ${list} ${votes} votes, the province row ${own.get(list) ?? 0}`);
    }
  }
  return problems;
}

/**
 * Problems moving from the last snapshot written to this one. The count only
 * moves forward on the night: a timestamp or a counted share going backwards
 * means a stale cache, a replayed file or a different election, and the
 * update is refused (the last good files stay on disk).
 */
export function checkProgress(previous: LiveSnapshot | null, next: LiveSnapshot): string[] {
  if (!previous) return [];
  const problems: string[] = [];
  if (previous.electionDate !== next.electionDate || previous.chamber !== next.chamber) {
    problems.push(`election changed from ${previous.chamber} ${previous.electionDate} to ${next.chamber} ${next.electionDate}`);
  }
  if (Date.parse(next.sourceUpdatedAt) < Date.parse(previous.sourceUpdatedAt)) {
    problems.push(`source timestamp went back from ${previous.sourceUpdatedAt} to ${next.sourceUpdatedAt}`);
  }
  const territories: [string, Record<string, LiveCount>, Record<string, LiveCount>][] = [
    ["municipality", previous.towns, next.towns],
    ["province", previous.provinces, next.provinces],
  ];
  for (const [kind, before, after] of territories) {
    // Sorted: INE codes such as "25243" are integer-like keys, which JavaScript enumerates before the rest.
    for (const code of Object.keys(before).sort()) {
      const was = before[code]!;
      const now = after[code];
      if (!now) {
        problems.push(`${kind} ${code} disappeared`);
        continue;
      }
      if (now.countedPct < was.countedPct) problems.push(`${kind} ${code}: counted went back from ${was.countedPct} % to ${now.countedPct} %`);
      if (was.stations && now.stations && now.stations.counted < was.stations.counted) {
        problems.push(`${kind} ${code}: counted polling stations went back from ${was.stations.counted} to ${now.stations.counted}`);
      }
    }
  }
  return problems;
}

/** Stable text of a territory's figures, to tell whether it changed. */
const fingerprint = (c: LiveCount): string => JSON.stringify([c.countedPct, c.stations, c.electorate, c.voters, c.blankVotes, c.nullVotes, c.lists.map((l) => [l.code, l.votes]), c.seats]);

/**
 * Municipalities whose page must be refreshed: their own figures changed, or
 * their province's (the seats block). Sorted, so logs and revalidation
 * batches are deterministic.
 */
export function changedTowns(previous: LiveSnapshot | null, next: LiveSnapshot): string[] {
  const changed: string[] = [];
  for (const [code, town] of Object.entries(next.towns)) {
    const was = previous?.towns[code];
    const province = next.provinces[code.slice(0, 2)];
    const wasProvince = previous?.provinces[code.slice(0, 2)];
    const townChanged = !was || fingerprint(was) !== fingerprint(town);
    const provinceChanged = !!province && (!wasProvince || fingerprint(wasProvince) !== fingerprint(province));
    if (townChanged || provinceChanged) changed.push(code);
  }
  return changed.sort();
}

/** The per-town file for one municipality of a snapshot. */
export function townFile(s: LiveSnapshot, code: string): LiveTownFile | null {
  const town = s.towns[code];
  if (!town) return null;
  return {
    version: 1,
    chamber: s.chamber,
    electionDate: s.electionDate,
    sourceUpdatedAt: s.sourceUpdatedAt,
    fetchedAt: s.fetchedAt,
    provisional: s.provisional,
    source: s.source,
    town,
    province: s.provinces[code.slice(0, 2)] ?? null,
  };
}

/** A town file as written to disk and served: compact JSON, one line, newline-terminated. */
export const serializeTownFile = (file: LiveTownFile): string => `${JSON.stringify(file)}\n`;

/**
 * Read back a town file, or null when it is missing, truncated or not ours.
 * The page must never throw on a bad file: it falls back to "awaiting".
 */
export function parseTownFile(text: string | null): LiveTownFile | null {
  if (!text) return null;
  try {
    const value = JSON.parse(text) as Partial<LiveTownFile> | null;
    if (!value || value.version !== 1 || typeof value.electionDate !== "string" || typeof value.sourceUpdatedAt !== "string" || !value.town || !Array.isArray(value.town.lists)) return null;
    return value as LiveTownFile;
  } catch {
    return null;
  }
}
