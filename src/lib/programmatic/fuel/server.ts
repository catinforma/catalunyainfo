import "server-only";

import type { LivePayload } from "./live";
import { loadCatalonia } from "./upstream";

/**
 * The Ministry's price list, read by the fuel routes at render.
 *
 * Until 13 Nov 2026 every fuel page was static and its HTML carried a price
 * skeleton filled with zeros ("0,000 €/l", "00/00/0000") until JavaScript ran:
 * that is what crawlers and no-JS readers saw. The routes now regenerate every
 * half hour and print the ten cheapest stations per product with the
 * Ministry's own timestamp; the browser reads the list again after mount.
 *
 * One list serves ~150 pages, and the upstream answer is ~1.5 MB and takes up
 * to ~7 s, so it is read once per process every ten minutes at most (a
 * failure is retried after a minute), through the data cache rather than
 * `no-store` (a no-store fetch would make the routes dynamic). Same parser and
 * checks as the API route (`upstream.ts`); prices are the Ministry's, never
 * computed.
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const SERVER_REVALIDATE_SECONDS = 1800;

const MEMO_MS = 10 * 60_000;
const FAILURE_MEMO_MS = 60_000;
/** Longer than the API route's 8 s: this runs in a background regeneration, not on a reader's request. */
const SERVER_TIMEOUT_MS = 25_000;

let memo: { at: number; ok: boolean; value: Promise<LivePayload | null> } | null = null;

const cachedFetch: typeof fetch = (input, init) => {
  const { cache: _ignored, signal: _signal, ...rest } = init ?? {};
  return fetch(input, { ...rest, signal: AbortSignal.timeout(SERVER_TIMEOUT_MS), next: { revalidate: SERVER_REVALIDATE_SECONDS } } as RequestInit);
};

export function loadServerPrices(now: number = Date.now()): Promise<LivePayload | null> {
  if (memo && now - memo.at < (memo.ok ? MEMO_MS : FAILURE_MEMO_MS)) return memo.value;
  const entry = { at: now, ok: true, value: Promise.resolve<LivePayload | null>(null) };
  entry.value = loadCatalonia(cachedFetch).then((result) => {
    entry.ok = result.ok;
    return result.ok ? result.payload : null;
  });
  memo = entry;
  return entry.value;
}
