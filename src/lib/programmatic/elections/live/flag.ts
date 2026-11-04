/**
 * Feature flag for the election-night provisional results (PROTOTYPE).
 *
 * Off unless the environment says exactly `ELECTION_LIVE_RESULTS=on`. Nothing
 * in production reads it yet: no page, route or script imports this module
 * apart from the tests. When the feature is wired (docs/elections-live-results.md,
 * "Wiring"), the town pages render the live block only when this returns true
 * AND the clock is inside the night window (`render.ts`).
 */

export const LIVE_RESULTS_FLAG = "ELECTION_LIVE_RESULTS";

export function liveResultsEnabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  return env[LIVE_RESULTS_FLAG] === "on";
}
