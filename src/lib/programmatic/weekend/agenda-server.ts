import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { weekendWindow, type WeekendWindow } from "@/lib/content/weekend/agenda";

import { checkRead, pickRead, type ReadsBySource, type SourceView } from "./agenda-list";
import committedJson from "./agenda-snapshot.json" with { type: "json" };
import { readBcn, readGencat, type FetchLike } from "./agenda-upstream";
import { SNAPSHOT } from "./data";

/**
 * This weekend's two official agendas, read by the weekend routes at render.
 *
 * The routes regenerate every hour (the `revalidate` literal in each page.tsx
 * must equal SERVER_REVALIDATE_SECONDS; a test checks it), and the window is
 * computed on each render from the Madrid date (`weekendWindow`: Monday to
 * Thursday the coming weekend, Friday to Sunday the current one, with a
 * holiday Friday or Monday included). One read per source serves every page:
 * the promise is memoised per process and per window (50 minutes, two after a
 * failure), and each request goes through Next's data cache with the same
 * revalidate and its own timeout.
 *
 * Fallback, in order, and only ever for the same weekend: the last good read
 * kept in memory and, best effort, in a file outside the release directory
 * (WEEKEND_AGENDA_SNAPSHOT_FILE, default
 * /srv/catalunyainfo/shared/cache/weekend-agenda-last-good.json on the VPS);
 * then the committed snapshot (`agenda-snapshot.json`, written by
 * `npm run weekend:agenda-snapshot`). A read of another weekend is never shown:
 * a past weekend's list presented as this one's is the failure these pages
 * were rebuilt to avoid. With nothing for this weekend the page says the
 * agenda could not be read and links the official one.
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const SERVER_REVALIDATE_SECONDS = 3600;

const MEMO_MS = 50 * 60_000;
const FAILURE_MEMO_MS = 2 * 60_000;
const REQUEST_TIMEOUT_MS = 15_000;

const DEFAULT_KEPT_FILE = "/srv/catalunyainfo/shared/cache/weekend-agenda-last-good.json";

export type { ReadStatus, SourceView } from "./agenda-list";

export interface WeekendAgendas {
  window: WeekendWindow;
  /** Madrid date of the render. */
  today: string;
  gencat: SourceView;
  bcn: SourceView;
}

type Kept = ReadsBySource;

const cachedFetch: FetchLike = (url, init) =>
  fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), next: { revalidate: SERVER_REVALIDATE_SECONDS } } as RequestInit);

const COMMITTED: Kept = (() => {
  const raw = committedJson as unknown as { reads?: unknown[] };
  const out: Kept = {};
  for (const r of raw.reads ?? []) {
    const read = checkRead(r);
    if (read) out[read.source] = read;
  }
  return out;
})();

let memo: { key: string; at: number; ok: boolean; value: Promise<Kept> } | null = null;
let kept: Kept | null = null;

function keptFile(): string {
  return process.env.WEEKEND_AGENDA_SNAPSHOT_FILE || DEFAULT_KEPT_FILE;
}

async function loadKept(): Promise<Kept> {
  if (kept) return kept;
  try {
    const json = JSON.parse(await readFile(keptFile(), "utf8")) as Record<string, unknown>;
    const out: Kept = {};
    for (const source of ["gencat", "bcn"] as const) {
      const read = checkRead(json[source]);
      if (read) out[source] = read;
    }
    kept = out;
  } catch {
    kept = {};
  }
  return kept;
}

async function keep(live: Kept): Promise<void> {
  const merged: Kept = { ...(await loadKept()), ...live };
  kept = merged;
  try {
    const file = keptFile();
    await mkdir(dirname(file), { recursive: true });
    const tmp = join(dirname(file), `.weekend-agenda-${process.pid}.tmp`);
    await writeFile(tmp, JSON.stringify(merged));
    await rename(tmp, file);
  } catch {
    // Read-only or missing directory (dev, CI): memory only.
  }
}

const quietly = <T,>(promise: Promise<T | null>): Promise<T | null> => promise.catch(() => null);

/** Both reads, each independent; `fetcher` is an argument for tests. */
export async function readBoth(fetcher: FetchLike, window: WeekendWindow, now: number): Promise<Kept> {
  const [gencat, bcn] = await Promise.all([quietly(readGencat(fetcher, window, SNAPSHOT, now)), quietly(readBcn(fetcher, window, now))]);
  const out: Kept = {};
  if (gencat) out.gencat = gencat;
  if (bcn) out.bcn = bcn;
  return out;
}

function loadLive(window: WeekendWindow, now: number): Promise<Kept> {
  const key = `${window.from}|${window.to}`;
  if (memo && memo.key === key && now - memo.at < (memo.ok ? MEMO_MS : FAILURE_MEMO_MS)) return memo.value;
  const entry = { key, at: now, ok: true, value: Promise.resolve<Kept>({}) };
  entry.value = readBoth(cachedFetch, window, now).then(async (live) => {
    entry.ok = Boolean(live.gencat && live.bcn);
    if (live.gencat || live.bcn) await keep(live);
    return live;
  });
  memo = entry;
  return entry.value;
}

/** What the weekend pages print now. Never throws. */
export async function loadWeekendAgendas(now: number = Date.now()): Promise<WeekendAgendas> {
  const today = todayInCatalonia(new Date(now));
  const window = weekendWindow(today);
  let live: Kept = {};
  try {
    live = await loadLive(window, now);
  } catch {
    live = {};
  }
  const held = await loadKept().catch(() => ({}) as Kept);
  return { window, today, gencat: pickRead("gencat", window, live, held, COMMITTED), bcn: pickRead("bcn", window, live, held, COMMITTED) };
}
