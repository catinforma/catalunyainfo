import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { isCompleteDay } from "./parse";
import { madridDate } from "./time";
import { loadPvpc, type FetchLike } from "./upstream";
import { buildView, mergeDays, pruneDays, type PvpcSnapshot, type PvpcView } from "./view";

/**
 * REE's PVPC, read by the six PVPC routes at render.
 *
 * The routes regenerate every 15 minutes (the `revalidate` literal in each
 * page.tsx must equal SERVER_REVALIDATE_SECONDS; a test checks it). One read
 * serves all six pages and their metadata: the promise is memoised per
 * process for five minutes (a failure for one), and the requests go through
 * Next's data cache with the same revalidate, so a regeneration storm is still
 * one request to REE. Each request has its own timeout.
 *
 * Fallback: every good answer is kept in memory and, best effort, in a JSON
 * file outside the release directory (PVPC_SNAPSHOT_FILE, default
 * /srv/catalunyainfo/shared/cache/pvpc-last-good.json on the VPS), so a
 * restart while REE is down still has the last prices. A kept day is REE's
 * exact price for its date and is printed with that date; it is never shown
 * as today's unless it is today's (view.ts). Nothing is ever computed or
 * filled in: no answer and no kept day means the page says the price could
 * not be read and links to REE.
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const SERVER_REVALIDATE_SECONDS = 900;

const MEMO_MS = 5 * 60_000;
const FAILURE_MEMO_MS = 60_000;
/** Each REE request. The first TLS connect from the VPS has taken 5–11 s (13 Nov 2026); later ones reuse the connection (<0.5 s). */
const REQUEST_TIMEOUT_MS = 20_000;

const DEFAULT_SNAPSHOT_FILE = "/srv/catalunyainfo/shared/cache/pvpc-last-good.json";

let memo: { at: number; ok: boolean; settled: boolean; value: Promise<PvpcSnapshot | null> } | null = null;
let lastGood: PvpcSnapshot | null = null;

const cachedFetch: FetchLike = (url, init) =>
  fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), next: { revalidate: SERVER_REVALIDATE_SECONDS } } as RequestInit);

function snapshotFile(): string {
  return process.env.PVPC_SNAPSHOT_FILE || DEFAULT_SNAPSHOT_FILE;
}

/** A kept snapshot, re-validated day by day as if it had just come from REE. */
export function readSnapshot(json: unknown): PvpcSnapshot | null {
  if (!json || typeof json !== "object") return null;
  const s = json as Partial<PvpcSnapshot>;
  if (typeof s.fetchedAt !== "string" || !Number.isFinite(Date.parse(s.fetchedAt)) || !Array.isArray(s.days)) return null;
  const days = s.days.filter((d) => d && typeof d === "object" && typeof d.date === "string" && Array.isArray(d.hours) && isCompleteDay(d));
  if (days.length === 0) return null;
  return { fetchedAt: s.fetchedAt, updated: typeof s.updated === "string" ? s.updated : null, days };
}

async function loadKept(): Promise<PvpcSnapshot | null> {
  if (lastGood) return lastGood;
  try {
    lastGood = readSnapshot(JSON.parse(await readFile(snapshotFile(), "utf8")));
  } catch {
    lastGood = null;
  }
  return lastGood;
}

async function keep(live: PvpcSnapshot, now: number): Promise<void> {
  const kept = await loadKept();
  const days = pruneDays(mergeDays(live.days, kept?.days ?? []), now);
  if (days.length === 0) return;
  lastGood = { fetchedAt: live.fetchedAt, updated: live.updated, days };
  try {
    const file = snapshotFile();
    await mkdir(dirname(file), { recursive: true });
    const tmp = join(dirname(file), `.pvpc-${process.pid}.tmp`);
    await writeFile(tmp, JSON.stringify(lastGood));
    await rename(tmp, file);
  } catch {
    // Read-only or missing directory (dev, CI): memory only.
  }
}

function loadLive(now: number): { value: Promise<PvpcSnapshot | null>; settled: boolean } {
  if (memo && now - memo.at < (memo.ok ? MEMO_MS : FAILURE_MEMO_MS)) return memo;
  const entry = { at: now, ok: true, settled: false, value: Promise.resolve<PvpcSnapshot | null>(null) };
  entry.value = loadPvpc(cachedFetch, madridDate(now), now)
    .then(async (result) => {
      entry.ok = Boolean(result && result.days.length > 0);
      if (result && result.days.length > 0) await keep(result, now);
      return result;
    })
    .finally(() => {
      entry.settled = true;
    });
  memo = entry;
  return entry;
}

/**
 * What the PVPC pages print now. Never throws.
 *
 * `allowStale` (the /api/pvpc/today/ route, on a reader's request): when a
 * new read of REE is still running and earlier prices are held, answer with
 * those at once instead of waiting for REE; the read completes in the
 * background for the next caller. The pages, rendered in a background
 * regeneration, always wait for the fresh read.
 */
export async function loadServerPvpc(now: number = Date.now(), options: { allowStale?: boolean } = {}): Promise<PvpcView> {
  try {
    const live = loadLive(now);
    if (options.allowStale && !live.settled) {
      const kept = await loadKept();
      if (kept) {
        live.value.catch(() => null);
        return buildView(null, kept, now);
      }
    }
    return buildView(await live.value, await loadKept(), now);
  } catch {
    return buildView(null, lastGood, now);
  }
}
