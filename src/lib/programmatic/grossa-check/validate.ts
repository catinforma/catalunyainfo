import { DRAWN, GROSSA_YEAR, PRIZE_ORDER, type PrizeKey } from "./programme";

/**
 * The snapshot scripts/gordo-snapshot.py writes with `--game grossa` on 31
 * December from Loteries de Catalunya's own pages (the numbers press release
 * on loteriesdecatalunya.info, the results page, or a numbers.txt a person
 * copied from them), and the rules the site applies again when it loads one:
 * a hand-edited or truncated file never reaches a page.
 */
export interface GrossaSnapshot {
  schema: 1;
  game: "grossa";
  /** True only for test fixtures: the site refuses to render them. */
  testData: boolean;
  year: number;
  drawDate: string;
  /** When the official pages were read (ISO with offset). */
  readAt: string;
  numbers: { first: string | null; second: string | null; third: string | null; fourth: string[]; fifth: string[] };
  sources: { results: string; press: string | null };
}

export const OFFICIAL_HOSTS = ["www.loteriesdecatalunya.cat", "www.loteriesdecatalunya.info", "api.loteriesdecatalunya.cat"];

/** La Grossa de Cap d'Any 2025 (Loteries de Catalunya, 31 Dec 2025): the same as RESULTS_2025 in the guide (test). Never this year's. */
export const LAST_YEAR = ["01379", "92574", "73762", "29181", "15376", "34006", "20005", "68675"] as const;

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
  const s = input as Partial<GrossaSnapshot>;
  const p: string[] = [];
  if (s.schema !== 1) p.push("schema must be 1");
  if (s.game !== "grossa") p.push('game must be "grossa"');
  if (typeof s.year !== "number" || s.drawDate !== `${s.year}-12-31`) p.push("drawDate must be 31 December of the snapshot's year");
  if (typeof s.testData !== "boolean") p.push("testData must be true or false");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/.test(String(s.readAt ?? ""))) p.push("readAt must be an ISO timestamp with offset");
  if (!official(s.sources?.results)) p.push("sources.results is not on an official Loteries de Catalunya host");
  if (s.sources?.press != null && !official(s.sources.press)) p.push("sources.press is not on an official Loteries de Catalunya host");
  const n = s.numbers;
  if (!n || typeof n !== "object") return [...p, "numbers missing"];
  const all: string[] = [];
  for (const key of PRIZE_ORDER) {
    const raw = (n as Record<PrizeKey, unknown>)[key];
    const list = key === "fourth" || key === "fifth" ? (Array.isArray(raw) ? raw : null) : raw === null ? [] : [raw];
    if (list === null) {
      p.push(`${key} must be a list`);
      continue;
    }
    if (list.length > DRAWN[key]) p.push(`${key}: more than ${DRAWN[key]} numbers`);
    for (const x of list) {
      if (!/^\d{5}$/.test(String(x))) p.push(`${key}: "${x}" is not five digits`);
      all.push(String(x));
    }
  }
  if (new Set(all).size !== all.length) p.push("a number appears twice: the eight winning numbers are always different (DOGC 9640, annex 3, 8.1)");
  if (!all.length) p.push("no winning number yet: nothing to publish");
  const old = all.filter((x) => (LAST_YEAR as readonly string[]).includes(x));
  if (old.length >= 3 || (n.first && n.first === LAST_YEAR[0])) p.push("these look like the 2025 numbers");
  if (s.testData === false && s.year !== GROSSA_YEAR) p.push(`year ${s.year} is not the programme's (${GROSSA_YEAR})`);
  return p;
}

export function loadSnapshot(input: unknown, { allowTestData = false }: { allowTestData?: boolean } = {}): GrossaSnapshot | null {
  const problems = snapshotProblems(input);
  if (problems.length) throw new Error(`grossa snapshot refused: ${problems.join("; ")}`);
  if (input === null) return null;
  const snapshot = input as GrossaSnapshot;
  if (snapshot.testData && !allowTestData) throw new Error("grossa snapshot refused: it is test data");
  return snapshot;
}
