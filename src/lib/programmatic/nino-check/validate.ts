import type { NinoDraw } from "./engine";
import { DRAW_DATE, NINO_YEAR, type NinoProgramme } from "./programme";

/**
 * The snapshot scripts/gordo-snapshot.py writes with `--game nino` on 6
 * January from SELAE's draw record (or an extracciones.txt a person copied
 * from SELAE's official list), and the rules the site applies again when it
 * loads one.
 */
export interface NinoSnapshot {
  schema: 1;
  game: "nino";
  testData: boolean;
  year: number;
  drawDate: string;
  drawId: string;
  readAt: string;
  numbers: NinoDraw;
  sources: { results: string; officialList: string | null };
}

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

const LISTS = [
  ["x5", 5],
  ["x4", 4],
  ["x3", 3],
  ["x2", 2],
  ["x1", 1],
] as const;

/**
 * What is wrong with a snapshot; empty when it can be rendered. `null` is
 * valid. With a programme, the counts must fit it (never more extractions of
 * a kind than it lists; none of a kind it does not have).
 */
export function snapshotProblems(input: unknown, programme: NinoProgramme | null = null): string[] {
  if (input === null) return [];
  if (typeof input !== "object" || Array.isArray(input)) return ["the snapshot is not an object"];
  const s = input as Partial<NinoSnapshot>;
  const p: string[] = [];
  if (s.schema !== 1) p.push("schema must be 1");
  if (s.game !== "nino") p.push('game must be "nino"');
  if (typeof s.year !== "number" || s.drawDate !== `${s.year}-01-06`) p.push("drawDate must be 6 January of the snapshot's year");
  if (typeof s.testData !== "boolean") p.push("testData must be true or false");
  if (!/^\d{6,12}$/.test(String(s.drawId ?? ""))) p.push("drawId missing");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/.test(String(s.readAt ?? ""))) p.push("readAt must be an ISO timestamp with offset");
  if (!official(s.sources?.results)) p.push("sources.results is not on an official SELAE host");
  if (s.sources?.officialList != null && !official(s.sources.officialList)) p.push("sources.officialList is not on an official SELAE host");
  const n = s.numbers;
  if (!n || typeof n !== "object") return [...p, "numbers missing"];
  const fives: string[] = [];
  for (const key of ["first", "second", "third"] as const) {
    const v = n[key];
    if (v === null) continue;
    if (!/^\d{5}$/.test(String(v))) p.push(`${key}: "${v}" is not five digits`);
    else fives.push(v);
  }
  if (!n.first) p.push("the snapshot has no first prize");
  for (const [key, digits] of LISTS) {
    const v = n[key];
    if (!Array.isArray(v)) {
      p.push(`${key} must be a list`);
      continue;
    }
    for (const x of v) if (!new RegExp(`^\\d{${digits}}$`).test(String(x))) p.push(`${key}: "${x}" is not ${digits} digits`);
    if (key === "x5") fives.push(...v);
    if (programme) {
      const c = programme.categories.find((cat) => cat.kind === "extraction" && cat.digits === digits);
      const max = c && c.kind === "extraction" ? c.extractions : 0;
      if (v.length > max) p.push(`${key}: ${v.length} extractions, the programme has ${max}`);
    }
  }
  if (programme) for (const key of ["second", "third"] as const) if (n[key] && !programme.categories.some((c) => c.id === key)) p.push(`${key}: the programme has no ${key} prize`);
  if (new Set(fives).size !== fives.length) p.push("a five-digit number appears twice");
  if (s.testData === false && s.year !== NINO_YEAR) p.push(`year ${s.year} is not the programme's (${NINO_YEAR})`);
  if (s.testData === false && s.drawDate !== DRAW_DATE) p.push(`drawDate ${s.drawDate} is not ${DRAW_DATE}`);
  return p;
}

export function loadSnapshot(input: unknown, programme: NinoProgramme | null, { allowTestData = false }: { allowTestData?: boolean } = {}): NinoSnapshot | null {
  const problems = snapshotProblems(input, programme);
  if (problems.length) throw new Error(`nino snapshot refused: ${problems.join("; ")}`);
  if (input === null) return null;
  const snapshot = input as NinoSnapshot;
  if (snapshot.testData && !allowTestData) throw new Error("nino snapshot refused: it is test data");
  return snapshot;
}
