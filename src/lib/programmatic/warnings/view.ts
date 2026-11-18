import { levelRank, LEVEL_ORDER } from "./names";
import type { CivilRead, RoadIncident, RoadsRead, SourceState, WarningLevel, WarningsSnapshot, WarningsView, WeatherRead, WeatherWarning } from "./types";

/**
 * What the warnings page may print at `now`, from this regeneration's reads
 * and the last good ones. Pure.
 *
 * Rules (never show old data as current):
 *  - AEMET builds its Catalonia feed several times a day (its guide: today's
 *    warnings 07:30–09:00, D+1/D+2 10:30–11:30, review 17:00–19:00, D+3 at
 *    23:50), so a feed built more than WEATHER_MAX_ISSUE_AGE_MS ago is not
 *    trusted.
 *  - SCT's feed moves every ~15 minutes; older than ROADS_MAX_FEED_AGE_MS it
 *    is not trusted.
 *  - Protecció Civil's dataset changes only when a plan does: its age is
 *    printed, not judged.
 *  - A held read (the source did not answer this time) is used only while
 *    younger than KEEP_MAX_AGE_MS and is printed with its own time.
 *  - An AEMET warning is shown until the end time AEMET gave it, never after.
 */

export const WEATHER_MAX_ISSUE_AGE_MS = 18 * 3600_000;
export const ROADS_MAX_FEED_AGE_MS = 60 * 60_000;
export const KEEP_MAX_AGE_MS = { weather: 3 * 3600_000, roads: 45 * 60_000, civil: 3 * 3600_000 } as const;

const age = (iso: string, now: number) => now - Date.parse(iso);

function state<T extends { answeredAt: string }>(live: T | null, kept: T | null, usable: (read: T) => boolean, keepMs: number, now: number): SourceState<T> {
  if (live && usable(live)) return { kind: "live", read: live };
  if (kept && usable(kept) && age(kept.answeredAt, now) <= keepMs) return { kind: "kept", read: kept };
  return { kind: "none" };
}

export function buildView(live: WarningsSnapshot, kept: WarningsSnapshot, now: number): WarningsView {
  return {
    now,
    weather: state<WeatherRead>(live.weather, kept.weather, (r) => age(r.issued, now) <= WEATHER_MAX_ISSUE_AGE_MS, KEEP_MAX_AGE_MS.weather, now),
    roads: state<RoadsRead>(live.roads, kept.roads, (r) => age(r.published, now) <= ROADS_MAX_FEED_AGE_MS, KEEP_MAX_AGE_MS.roads, now),
    civil: state<CivilRead>(live.civil, kept.civil, () => true, KEEP_MAX_AGE_MS.civil, now),
  };
}

/** The newest good read of each source, for the kept file. */
export function mergeKept(live: WarningsSnapshot, kept: WarningsSnapshot): WarningsSnapshot {
  return { weather: live.weather ?? kept.weather, roads: live.roads ?? kept.roads, civil: live.civil ?? kept.civil };
}

/* -------------------------------------------------------------------------- */
/* Weather                                                                    */
/* -------------------------------------------------------------------------- */

function byConcern(a: WeatherWarning, b: WeatherWarning): number {
  return levelRank(b.level) - levelRank(a.level) || Date.parse(a.onset) - Date.parse(b.onset) || a.zoneCode.localeCompare(b.zoneCode) || a.phenomenon.localeCompare(b.phenomenon);
}

export interface WeatherSplit {
  /** Started and not yet over at `now`. */
  inForce: WeatherWarning[];
  /** Starting later (AEMET covers today and the next two days). */
  upcoming: WeatherWarning[];
}

/** Warnings not yet over at `now`, worst first, then by start. */
export function splitWarnings(warnings: WeatherWarning[], now: number): WeatherSplit {
  const open = warnings.filter((w) => Date.parse(w.expires) > now).sort(byConcern);
  return {
    inForce: open.filter((w) => Date.parse(w.onset) <= now),
    upcoming: open.filter((w) => Date.parse(w.onset) > now).sort((a, b) => Date.parse(a.onset) - Date.parse(b.onset) || byConcern(a, b)),
  };
}

export function maxLevel(warnings: WeatherWarning[]): WarningLevel | null {
  return LEVEL_ORDER.find((level) => warnings.some((w) => w.level === level)) ?? null;
}

/** Distinct phenomena in the order they first appear. */
export function phenomena(warnings: WeatherWarning[]): { code: string; es: string }[] {
  const seen = new Map<string, string>();
  for (const w of warnings) if (!seen.has(w.phenomenon)) seen.set(w.phenomenon, w.phenomenonEs);
  return [...seen].map(([code, es]) => ({ code, es }));
}

/* -------------------------------------------------------------------------- */
/* Roads                                                                      */
/* -------------------------------------------------------------------------- */

export const WORKS_TYPE = "Obres";

export interface RoadGroups {
  /** Everything that is not roadworks: queues, accidents, weather, mountain passes… */
  traffic: RoadIncident[];
  /** Roadworks with the carriageway closed ("Calçada tallada…"). */
  closures: RoadIncident[];
  /** Other roadworks (lane restrictions). */
  works: RoadIncident[];
}

/** "A-2" < "AP-7" < "B-10" < "C-25": by letters, then the number. */
function byRoad(a: RoadIncident, b: RoadIncident): number {
  return a.road.localeCompare(b.road, "ca", { numeric: true }) || parseFloat(a.km) - parseFloat(b.km) || a.id.localeCompare(b.id);
}

export function groupRoads(incidents: RoadIncident[]): RoadGroups {
  const isWorks = (i: RoadIncident) => i.type === WORKS_TYPE;
  const closed = (i: RoadIncident) => /tallada/i.test(i.description);
  return {
    traffic: incidents.filter((i) => !isWorks(i)).sort(byRoad),
    closures: incidents.filter((i) => isWorks(i) && closed(i)).sort(byRoad),
    works: incidents.filter((i) => isWorks(i) && !closed(i)).sort(byRoad),
  };
}
