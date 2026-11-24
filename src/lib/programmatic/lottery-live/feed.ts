import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

/**
 * The runtime data feed of the three lottery checkers: the official numbers
 * as a JSON file on the server's disk, read at request time, so the numbers
 * of the draw go out WITHOUT a deploy (a deploy takes ~9 min and purges the
 * whole CDN; docs/HIGH_TRAFFIC_RUNBOOK.md rule 1: none on 22 Dec 07:00-15:00).
 *
 * The file is the same snapshot scripts/gordo-snapshot.py `build` writes into
 * the repository (gordo/, grossa-check/, nino-check/ snapshot.json), only
 * written with `--out` to LIVE_DIR instead. It passes the same validator the
 * committed snapshot passes (official hosts only, five-digit strings with
 * their leading zeros, counts that follow the programme, no test data), so a
 * hand-typed or truncated file never reaches a reader.
 *
 * Rules, in order:
 *  - no file: the committed snapshot (null until the day, the final numbers
 *    once the post-draw deploy has baked them in);
 *  - a file that fails validation, or that holds FEWER numbers than the one
 *    already served (a draw only grows), is refused: the last good one stays
 *    and `warning` says why. To correct a wrong number or take the feed down,
 *    delete the file first (a missing file resets the state), then write the
 *    right one;
 *  - the richer of file and committed snapshot is served (equal: the newer
 *    `readAt`), so deploying the final snapshot later never goes backwards.
 *
 * Nothing here fetches from SELAE or Loteries de Catalunya: a person (or the
 * owner's PC fetch, docs/GORDO_NAVIDAD_RUNBOOK.md) puts the file there.
 */

/**
 * Default directory on the VPS. Deliberately NOT under shared/ (root-owned,
 * holds the env file): /srv/catalunyainfo/live is owned by the deploy user, so
 * writing a file needs no root; the service only reads it.
 */
export const DEFAULT_LIVE_DIR = "/srv/catalunyainfo/live/lottery";

/**
 * Who checked on the VPS, and when, that the live directory exists, is
 * readable by the service and answers (docs/GORDO_NAVIDAD_RUNBOOK.md "Live
 * feed, one-off setup": `curl` of /data/loteria-navidad.json shows
 * `"feed":"committed"`, `s-maxage=30`, a Cloudflare HIT on the second
 * request). Null until someone does: tests/lottery-live.test.ts fails from
 * LIVE_FEED_CHECK_BY, four days before the draw.
 */
export const LIVE_FEED_CHECKED: { read: string; how: string } | null = null;
export const LIVE_FEED_CHECK_BY = "2026-12-18";

export function liveDir(): string {
  return process.env.LOTTERY_LIVE_DIR || DEFAULT_LIVE_DIR;
}

export type FeedWarning = "invalid" | "regressed" | "unreadable" | null;

export interface FeedRead<S> {
  snapshot: S | null;
  /** Where `snapshot` came from. */
  origin: "live" | "committed" | "none";
  /** Why a newer file was not used; null when the served snapshot is the newest file. */
  warning: FeedWarning;
}

export interface FeedSpec<S> {
  /** File name inside the live directory ("navidad.json"). */
  file: string;
  /** The game's loadSnapshot: throws on a problem, returns null for `null`. */
  load: (json: unknown) => S | null;
  /** How many official numbers it holds: a draw only grows. */
  richness: (s: S) => number;
  /** ISO read time. */
  readAt: (s: S) => string;
  /** The snapshot compiled into the build. */
  committed: S | null;
}

export interface FeedDeps {
  dir?: () => string;
  readFile?: (path: string) => Promise<string>;
  stat?: (path: string) => Promise<{ mtimeMs: number; size: number; ctimeMs?: number }>;
}

const pickBetter = <S>(spec: FeedSpec<S>, live: S | null): { snapshot: S | null; origin: FeedRead<S>["origin"] } => {
  const c = spec.committed;
  if (live && c) {
    const a = spec.richness(live);
    const b = spec.richness(c);
    if (a !== b) return a > b ? { snapshot: live, origin: "live" } : { snapshot: c, origin: "committed" };
    return Date.parse(spec.readAt(live)) >= Date.parse(spec.readAt(c)) ? { snapshot: live, origin: "live" } : { snapshot: c, origin: "committed" };
  }
  if (live) return { snapshot: live, origin: "live" };
  if (c) return { snapshot: c, origin: "committed" };
  return { snapshot: null, origin: "none" };
};

/** One feed. Keeps its state per process (one Node process serves the site). */
export function createFeed<S>(spec: FeedSpec<S>, deps: FeedDeps = {}) {
  const dirOf = deps.dir ?? liveDir;
  const read = deps.readFile ?? ((p: string) => readFile(p, "utf8"));
  const statOf = deps.stat ?? ((p: string) => stat(p));

  let good: S | null = null;
  let seen: string | null = null; // "mtime:ctime:size" of the file last READ AND PARSED (never of one that could not be read)
  let warning: FeedWarning = null;

  async function load(): Promise<FeedRead<S>> {
    const path = join(dirOf(), spec.file);
    let key: string;
    try {
      const st = await statOf(path);
      // ctime too: a chmod or a `cp -p` over the file changes it without touching mtime or size.
      key = `${st.mtimeMs}:${st.ctimeMs ?? 0}:${st.size}`;
    } catch (e) {
      if ((e as NodeJS.ErrnoException)?.code === "ENOENT") {
        // File removed (or never there): reset, serve the committed snapshot.
        good = null;
        seen = null;
        warning = null;
        const { snapshot, origin } = pickBetter(spec, null);
        return { snapshot, origin, warning: null };
      }
      // Cannot even look (permissions, I/O): keep what we hold.
      const { snapshot, origin } = pickBetter(spec, good);
      return { snapshot, origin, warning: "unreadable" };
    }
    if (key !== seen) {
      let text: string | null = null;
      try {
        text = await read(path);
      } catch {
        // EACCES (mode 600), a file replaced between stat and read, I/O: not "invalid".
        // `seen` stays as it was, so the next request reads again and a chmod takes
        // effect at once, without a restart. Keep what we hold.
        warning = "unreadable";
      }
      if (text !== null) {
        seen = key;
        try {
          const next = spec.load(JSON.parse(text));
          if (next === null) {
            warning = null; // a file holding null: same as no numbers yet
          } else if (good && spec.richness(next) < spec.richness(good)) {
            warning = "regressed";
          } else {
            good = next;
            warning = null;
          }
        } catch {
          warning = "invalid";
        }
      }
    }
    const { snapshot, origin } = pickBetter(spec, good);
    return { snapshot, origin, warning };
  }

  return { read: load };
}
