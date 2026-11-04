/**
 * Which page URLs an ingest run must refresh (PROTOTYPE, wired to nothing).
 *
 * Literal paths only (`/ca/eleccions/sabadell/`), never a route pattern, so a
 * revalidation touches exactly the towns whose figures changed. All three
 * town routes declare `dynamicParams = true` (asserted in
 * tests/election-live.test.ts): revalidatePath on a `dynamicParams = false`
 * route answers 404 on the self-hosted server (NoFallbackError), which is the
 * lesson recorded in ops/vps/README.md.
 */

import { SNAPSHOT } from "../snapshot";
import { electionTranslations } from "../pages";
import type { Municipality } from "../types";

const BY_CODE: ReadonlyMap<string, Municipality> = new Map(SNAPSHOT.municipalities.map((m) => [m.code, m]));

/** Every language edition of the given towns, by INE code; unknown codes are reported, not guessed. */
export function livePaths(codes: Iterable<string>): { paths: string[]; unknown: string[] } {
  const paths: string[] = [];
  const unknown: string[] = [];
  for (const code of codes) {
    const m = BY_CODE.get(code);
    if (!m) {
      unknown.push(code);
      continue;
    }
    paths.push(...Object.values(electionTranslations(m)));
  }
  return { paths: [...new Set(paths)].sort(), unknown };
}
