import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { CivilRead, RoadsRead, WarningsSnapshot, WarningsView, WeatherRead } from "./types";
import { readCivil, readRoads, readWeather, type FetchLike } from "./upstream";
import { buildView, mergeKept } from "./view";

/**
 * The official warnings, read by the three warnings routes and the
 * /api/warnings/now/ endpoint at render.
 *
 * The routes regenerate every five minutes (the `revalidate` literal in each
 * page.tsx must equal SERVER_REVALIDATE_SECONDS; a test checks it). One read
 * of the three sources serves every page: the promise is memoised per process
 * (four minutes, one after a failure) and each request goes through Next's
 * data cache with the same revalidate and its own timeout, so a regeneration
 * storm is still one request per source. The time printed is each source's
 * HTTP answer time, which the data cache keeps with the body.
 *
 * Fallback: each source's last good read is kept in memory and, best effort,
 * in a JSON file outside the release directory (WARNINGS_SNAPSHOT_FILE,
 * default /srv/catalunyainfo/shared/cache/warnings-last-good.json on the
 * VPS). view.ts decides whether a held read may still be shown (and it is
 * then printed with its own time). There is no committed snapshot of
 * warnings on purpose: a list of warnings from the repository would be old by
 * definition. What is committed is the guidance around them (copy.ts) and the
 * plan glossary (names.ts), so a page with no source still explains where to
 * look.
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const SERVER_REVALIDATE_SECONDS = 300;

const MEMO_MS = 4 * 60_000;
const FAILURE_MEMO_MS = 60_000;
const REQUEST_TIMEOUT_MS = 12_000;

const DEFAULT_SNAPSHOT_FILE = "/srv/catalunyainfo/shared/cache/warnings-last-good.json";

const EMPTY: WarningsSnapshot = { weather: null, roads: null, civil: null };

let memo: { at: number; ok: boolean; value: Promise<WarningsSnapshot> } | null = null;
let lastGood: WarningsSnapshot | null = null;

const cachedFetch: FetchLike = (url, init) =>
  fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), next: { revalidate: SERVER_REVALIDATE_SECONDS } } as RequestInit);

function snapshotFile(): string {
  return process.env.WARNINGS_SNAPSHOT_FILE || DEFAULT_SNAPSHOT_FILE;
}

const isIso = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));

/** A kept file, checked source by source; anything malformed is dropped. */
export function readSnapshot(json: unknown): WarningsSnapshot {
  if (!json || typeof json !== "object") return EMPTY;
  const s = json as Partial<Record<keyof WarningsSnapshot, unknown>>;
  const weather = s.weather as Partial<WeatherRead> | null | undefined;
  const roads = s.roads as Partial<RoadsRead> | null | undefined;
  const civil = s.civil as Partial<CivilRead> | null | undefined;
  return {
    weather:
      weather && isIso(weather.issued) && isIso(weather.answeredAt) && Array.isArray(weather.warnings)
        ? {
            issued: weather.issued,
            answeredAt: weather.answeredAt,
            unread: typeof weather.unread === "number" ? weather.unread : 0,
            warnings: weather.warnings.filter((w) => w && typeof w.id === "string" && isIso(w.onset) && isIso(w.expires) && typeof w.zone === "string"),
          }
        : null,
    roads:
      roads && isIso(roads.published) && isIso(roads.answeredAt) && Array.isArray(roads.incidents)
        ? { published: roads.published, answeredAt: roads.answeredAt, incidents: roads.incidents.filter((i) => i && typeof i.id === "string" && typeof i.road === "string" && isIso(i.since)) }
        : null,
    civil:
      civil && isIso(civil.answeredAt) && Array.isArray(civil.plans)
        ? { updated: isIso(civil.updated) ? civil.updated : null, answeredAt: civil.answeredAt, plans: civil.plans.filter((p) => p && typeof p.phase === "string") }
        : null,
  };
}

async function loadKept(): Promise<WarningsSnapshot> {
  if (lastGood) return lastGood;
  try {
    lastGood = readSnapshot(JSON.parse(await readFile(snapshotFile(), "utf8")));
  } catch {
    lastGood = EMPTY;
  }
  return lastGood;
}

async function keep(live: WarningsSnapshot): Promise<void> {
  const merged = mergeKept(live, await loadKept());
  lastGood = merged;
  try {
    const file = snapshotFile();
    await mkdir(dirname(file), { recursive: true });
    const tmp = join(dirname(file), `.warnings-${process.pid}.tmp`);
    await writeFile(tmp, JSON.stringify(merged));
    await rename(tmp, file);
  } catch {
    // Read-only or missing directory (dev, CI): memory only.
  }
}

const quietly = <T,>(promise: Promise<T | null>): Promise<T | null> => promise.catch(() => null);

/** The three reads, each independent; `fetcher` is an argument for tests. */
export async function readAll(fetcher: FetchLike, now: number): Promise<WarningsSnapshot> {
  const [weather, roads, civil] = await Promise.all([quietly(readWeather(fetcher, now)), quietly(readRoads(fetcher, now)), quietly(readCivil(fetcher, now))]);
  return { weather, roads, civil };
}

function loadLive(now: number): Promise<WarningsSnapshot> {
  if (memo && now - memo.at < (memo.ok ? MEMO_MS : FAILURE_MEMO_MS)) return memo.value;
  const entry = { at: now, ok: true, value: Promise.resolve(EMPTY) };
  entry.value = readAll(cachedFetch, now).then(async (live) => {
    entry.ok = Boolean(live.weather && live.roads && live.civil);
    if (live.weather || live.roads || live.civil) await keep(live);
    return live;
  });
  memo = entry;
  return entry.value;
}

/** What the warnings pages print now. Never throws. */
export async function loadWarnings(now: number = Date.now()): Promise<WarningsView> {
  try {
    const live = await loadLive(now);
    return buildView(live, await loadKept(), now);
  } catch {
    return buildView(EMPTY, lastGood ?? EMPTY, now);
  }
}
