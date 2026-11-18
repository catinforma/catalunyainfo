import type { WarningLevel, WarningsView } from "./types";
import { groupRoads } from "./view";

/**
 * The compact answer behind /api/warnings/now/, for the "Avui a Catalunya"
 * island. Pure and browser-safe (no server imports): the route builds it, the
 * island parses it. Every AEMET warning not yet over is sent with its own
 * start and end, so the browser decides what is in force at its own clock.
 */

export interface BriefWarning {
  /** level */
  l: WarningLevel;
  /** phenomenon code and AEMET's Spanish name */
  p: string;
  pe: string;
  /** zone, as AEMET writes it */
  z: string;
  /** onset, expires (ISO) */
  o: string;
  e: string;
}

export interface WarningsBrief {
  /** When the server built the answer (ISO). */
  readAt: string;
  weather: { issued: string; answeredAt: string; kept: boolean; warnings: BriefWarning[]; unread: number } | null;
  civil: { updated: string | null; answeredAt: string; kept: boolean; plans: { acronym: string; phase: string }[] } | null;
  roads: { published: string; answeredAt: string; kept: boolean; traffic: number; closures: number; works: number } | null;
}

export function briefPayload(view: WarningsView): WarningsBrief {
  const now = view.now;
  return {
    readAt: new Date(now).toISOString(),
    weather:
      view.weather.kind === "none"
        ? null
        : {
            issued: view.weather.read.issued,
            answeredAt: view.weather.read.answeredAt,
            kept: view.weather.kind === "kept",
            unread: view.weather.read.unread,
            warnings: view.weather.read.warnings
              .filter((w) => Date.parse(w.expires) > now)
              .map((w) => ({ l: w.level, p: w.phenomenon, pe: w.phenomenonEs, z: w.zone, o: w.onset, e: w.expires })),
          },
    civil:
      view.civil.kind === "none"
        ? null
        : {
            updated: view.civil.read.updated,
            answeredAt: view.civil.read.answeredAt,
            kept: view.civil.kind === "kept",
            plans: view.civil.read.plans.map((p) => ({ acronym: p.acronym || p.name, phase: p.phase })),
          },
    roads:
      view.roads.kind === "none"
        ? null
        : (() => {
            const g = groupRoads(view.roads.read.incidents);
            return {
              published: view.roads.read.published,
              answeredAt: view.roads.read.answeredAt,
              kept: view.roads.kind === "kept",
              traffic: g.traffic.length,
              closures: g.closures.length,
              works: g.works.length,
            };
          })(),
  };
}

const LEVELS = new Set<WarningLevel>(["yellow", "orange", "red"]);
const isIso = (v: unknown): v is string => typeof v === "string" && Number.isFinite(Date.parse(v));

/** The island's parser: anything malformed is null (the island then links the page). */
export function parseBrief(json: unknown): WarningsBrief | null {
  if (!json || typeof json !== "object") return null;
  const b = json as Partial<WarningsBrief>;
  if (!isIso(b.readAt)) return null;
  const weather =
    b.weather && isIso(b.weather.issued) && Array.isArray(b.weather.warnings)
      ? {
          ...b.weather,
          warnings: b.weather.warnings.filter((w) => w && LEVELS.has(w.l) && typeof w.p === "string" && typeof w.pe === "string" && typeof w.z === "string" && isIso(w.o) && isIso(w.e)),
        }
      : null;
  const civil = b.civil && Array.isArray(b.civil.plans) ? b.civil : null;
  const roads = b.roads && typeof b.roads.traffic === "number" && typeof b.roads.closures === "number" ? b.roads : null;
  return { readAt: b.readAt, weather, civil, roads };
}

/** A brief older than this (a stuck cache) is not shown as current. */
export const BRIEF_MAX_AGE_MS = 30 * 60_000;
