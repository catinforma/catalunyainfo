import { provinceByCode } from "./provinces";
import type { GordoPrizeKey, GordoSnapshot } from "./types";

/**
 * The rules scripts/gordo-snapshot.py applies before it writes a snapshot,
 * applied again when the site loads one: a hand-edited or truncated file can
 * never reach a page.
 */

/** Key, how many numbers the programme draws, euros per 20 € décimo (SELAE, 2026 programme). */
export const PRIZE_RULES: readonly { key: GordoPrizeKey; count: number; perDecimo: number }[] = [
  { key: "first", count: 1, perDecimo: 400_000 },
  { key: "second", count: 1, perDecimo: 125_000 },
  { key: "third", count: 1, perDecimo: 50_000 },
  { key: "fourth", count: 2, perDecimo: 20_000 },
  { key: "fifth", count: 8, perDecimo: 6_000 },
];

export const OFFICIAL_HOSTS = ["www.loteriasyapuestas.es", "www.selae.es"];

function official(url: unknown): boolean {
  if (typeof url !== "string") return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && OFFICIAL_HOSTS.includes(u.host);
  } catch {
    return false;
  }
}

/** What is wrong with a snapshot; empty when it can be rendered. `null` (no snapshot yet) is valid. */
export function snapshotProblems(input: unknown): string[] {
  if (input === null) return [];
  if (typeof input !== "object" || Array.isArray(input)) return ["the snapshot is not an object"];
  const s = input as Partial<GordoSnapshot>;
  const p: string[] = [];
  if (s.schema !== 1) p.push("schema must be 1");
  if (typeof s.year !== "number" || s.drawDate !== `${s.year}-12-22`) p.push("drawDate must be 22 December of the snapshot's year");
  if (typeof s.testData !== "boolean") p.push("testData must be true or false");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/.test(String(s.readAt ?? ""))) p.push("readAt must be an ISO timestamp with offset");
  if (!official(s.sources?.results)) p.push("sources.results is not on an official SELAE host");
  if (s.sources?.officialList != null && !official(s.sources.officialList)) p.push("sources.officialList is not on an official SELAE host");
  const prizes = Array.isArray(s.prizes) ? s.prizes : [];
  if (prizes.map((x) => x?.key).join() !== PRIZE_RULES.map((r) => r.key).join()) {
    p.push("prizes must be first, second, third, fourth, fifth in that order");
    return p;
  }
  const seen = new Set<string>();
  PRIZE_RULES.forEach((rule, i) => {
    const prize = prizes[i]!;
    const numbers = Array.isArray(prize.numbers) ? prize.numbers : [];
    if (numbers.length > rule.count) p.push(`${rule.key}: more than ${rule.count} numbers`);
    for (const n of numbers) {
      if (!/^\d{5}$/.test(String(n))) p.push(`${rule.key}: "${n}" is not five digits`);
      if (seen.has(n)) p.push(`${n} appears twice`);
      seen.add(n);
    }
    if (prize.perDecimo !== rule.perDecimo) p.push(`${rule.key}: perDecimo must be ${rule.perDecimo}`);
    if (prize.outlets == null) return;
    if (numbers.length === 0) p.push(`${rule.key}: points of sale without a number`);
    if (!official(prize.page)) p.push(`${rule.key}: page is not on an official SELAE host`);
    for (const o of prize.outlets) {
      if (o.channel === "web") continue;
      if (o.channel !== "outlet") {
        p.push(`${rule.key}: unknown channel ${String(o.channel)}`);
        continue;
      }
      if (!o.province || !provinceByCode(o.province)) p.push(`${rule.key}: province ${String(o.province)} is not an INE province code`);
      if (!o.locality?.trim() || !o.address?.trim()) p.push(`${rule.key}: a point of sale without locality or address`);
      const m = o.municipality;
      if (m) {
        if (!/^\d{5}$/.test(m.ine) || m.ine.slice(0, 2) !== o.province) p.push(`${rule.key}: municipality ${m.ine} is not in province ${String(o.province)}`);
        if (!m.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(m.slug)) p.push(`${rule.key}: municipality ${m.ine} has no name or a bad slug`);
      }
    }
  });
  if ((prizes[0]?.numbers ?? []).length === 0) p.push("the snapshot has no Gordo");
  // One slug per municipality and province: the URL must name one place.
  const slugs = new Map<string, string>();
  for (const prize of prizes) {
    for (const o of prize.outlets ?? []) {
      if (!o.municipality) continue;
      const key = `${o.province}/${o.municipality.slug}`;
      const other = slugs.get(key);
      if (other && other !== o.municipality.ine) p.push(`${key} names two municipalities (${other}, ${o.municipality.ine})`);
      slugs.set(key, o.municipality.ine);
    }
  }
  return p;
}

/**
 * The snapshot the pages render, or null when there is none. Throws on a
 * snapshot that breaks a rule, and on test data unless a test asks for it.
 */
export function loadSnapshot(input: unknown, { allowTestData = false }: { allowTestData?: boolean } = {}): GordoSnapshot | null {
  const problems = snapshotProblems(input);
  if (problems.length) throw new Error(`gordo snapshot refused: ${problems.join("; ")}`);
  if (input === null) return null;
  const snapshot = input as GordoSnapshot;
  if (snapshot.testData && !allowTestData) throw new Error("gordo snapshot refused: it is test data");
  return snapshot;
}
