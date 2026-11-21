import "server-only";

import { freshness } from "./live";
import { loadSpain, type SpainPayload } from "./spain-upstream";

/**
 * The Ministry's national list, read by the Spain fuel routes and the sitemap
 * at render (21 Nov 2026). Same pattern as `server.ts` for Catalonia: one
 * memoised read per process, shared by every page (a promise, so concurrent
 * regenerations wait for the same request: single flight), a short memo after
 * a failure, a long timeout because this runs in a background regeneration.
 *
 * What differs, and why:
 *  - the answer is 12.3 MB (21 Nov 2026), over the data cache's 2 MB limit,
 *    so the fetch has no cache option (`spain-upstream.ts`) and the memo is
 *    the only cache;
 *  - the memo lasts the routes' whole revalidate period (30 min, the
 *    Ministry's own refresh interval) instead of ten minutes: a regenerating
 *    page then never waits on the Ministry more than once per half hour, and
 *    the origin reads ~50 lists a day (~600 MB), not ~150.
 *
 * At ~65 pages/s at peak, Cloudflare serves the HTML; the origin regenerates
 * each page at most every half hour (ISR), and every regeneration within the
 * memo reads this one list.
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const SPAIN_REVALIDATE_SECONDS = 1800;

const MEMO_MS = SPAIN_REVALIDATE_SECONDS * 1000;
const FAILURE_MEMO_MS = 60_000;
const SERVER_TIMEOUT_MS = 25_000;

let memo: { at: number; ok: boolean; value: Promise<SpainPayload | null> } | null = null;

/** Never throws; null when the Ministry did not answer with a usable list. */
export function loadSpainPrices(now: number = Date.now(), fetchImpl: typeof fetch = fetch): Promise<SpainPayload | null> {
  if (memo && now - memo.at < (memo.ok ? MEMO_MS : FAILURE_MEMO_MS)) return memo.value;
  const entry = { at: now, ok: true, value: Promise.resolve<SpainPayload | null>(null) };
  entry.value = loadSpain(fetchImpl, SERVER_TIMEOUT_MS).then((result) => {
    entry.ok = result.ok;
    return result.ok ? result.payload : null;
  });
  memo = entry;
  return entry.value;
}

/** Tests only: forget the memoised list. */
export function resetSpainMemo(): void {
  memo = null;
}

/**
 * For the sitemap: the Ministry's time (ISO) of the list the pages print now,
 * or null when there is none under a day old. The same memoised read as the
 * pages: no extra request.
 */
export async function loadSpainReadingTime(now: number = Date.now()): Promise<string | null> {
  const payload = await loadSpainPrices(now);
  if (!payload || freshness(payload.updated, now) === "stale") return null;
  return payload.updated;
}
