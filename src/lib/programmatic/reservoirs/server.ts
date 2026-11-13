import "server-only";

import { answeredAt, loadReservoirs, loadReservoirsYearAgo, type ReservoirReport } from "@/lib/content/reservoirs/levels";

import { RESERVOIR_DATA, snapshotReadings } from "./data";
import type { Reading } from "./live";
import { liveReadings, type AcaRow } from "./prepare";
import { MIN_RESERVOIRS, liveQueryUrl } from "./upstream";
import { slugOfName, type ReservoirSlug } from "./types";

/**
 * The latest ACA reading, in the server HTML of the reservoir pages.
 *
 * Until 13 Nov 2026 these pages were static and printed the committed
 * snapshot's reading (28 Oct): crawlers and readers without JavaScript saw a
 * figure two weeks old under "nivel hoy", and only the browser fetched the
 * current one. Self-hosted there is no ISR-write budget to protect, so the
 * routes now regenerate every three hours (the ACA publishes once a day) and
 * render the same reading the browser block would fetch, with its date and the
 * time the ACA's portal answered. The block still refreshes after mount.
 *
 * Every figure is the ACA's own row, validated as the route handler validates
 * it; a failure falls back to the snapshot's reading, which is printed with
 * its own date (never as today's).
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const SERVER_REVALIDATE_SECONDS = 10_800;

export interface ServerReservoirs {
  /** One reading per reservoir: the ACA's latest when it answered, else the snapshot's. */
  readings: Reading[];
  /** True when at least one reading came from the ACA in this render. */
  live: boolean;
  /** When the ACA's portal answered (ISO), null on failure. */
  fetchedAt: string | null;
  /** The newest reading date among `readings`. */
  latestDate: string;
  /** Each reservoir's clean reading a year before the latest date, when the ACA has one. */
  yearAgo: Partial<Record<ReservoirSlug, { date: string; percent: number; volume: number }>>;
}

async function fetchLatest(now: Date): Promise<{ rows: AcaRow[]; fetchedAt: string } | null> {
  try {
    const response = await fetch(liveQueryUrl(now), {
      headers: { accept: "application/json", "user-agent": "CatalunyaInfo (+https://www.catalunyainfo.com)" },
      next: { revalidate: SERVER_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(10_000),
    } as RequestInit);
    if (!response.ok) return null;
    const rows = (await response.json()) as unknown;
    return Array.isArray(rows) ? { rows: rows as AcaRow[], fetchedAt: answeredAt(response, now) } : null;
  } catch {
    return null;
  }
}

/** Per reservoir, the newer of the ACA's reading and the snapshot's. Pure. */
export function freshReadings(server: Reading[] | null): { readings: Reading[]; live: boolean } {
  const own: Reading[] = snapshotReadings();
  if (!server || server.length < MIN_RESERVOIRS) return { readings: own, live: false };
  const bySlug = new Map(server.map((r) => [r.slug, r]));
  let live = false;
  const readings = own.map((mine) => {
    const today = bySlug.get(mine.slug);
    if (today && today.date >= mine.date) {
      live = true;
      return today;
    }
    return mine;
  });
  return { readings, live };
}

/** The year-ago report reduced to readings by slug. Pure. */
export function yearAgoBySlug(report: ReservoirReport): ServerReservoirs["yearAgo"] {
  if (report.error || !report.date) return {};
  const out: ServerReservoirs["yearAgo"] = {};
  for (const r of report.reservoirs) {
    const slug = slugOfName(r.name);
    if (slug) out[slug] = { date: report.date, percent: r.percent, volume: r.volume };
  }
  return out;
}

/**
 * The overall percentage exactly as the guide computes and prints it (same
 * request, shared through the data cache), so hub and guide never disagree.
 */
export async function loadTotalPercent(): Promise<number | null> {
  const report = await loadReservoirs();
  return report.error || report.reservoirs.length === 0 ? null : report.total.percent;
}

export async function loadServerReservoirs(now: Date = new Date()): Promise<ServerReservoirs> {
  const latest = await fetchLatest(now);
  const { readings, live } = freshReadings(latest ? liveReadings(latest.rows) : null);
  const latestDate = readings.reduce((max, r) => (r.date > max ? r.date : max), RESERVOIR_DATA[0]?.trend.latest.date ?? "");
  const yearAgo = live ? yearAgoBySlug(await loadReservoirsYearAgo(latestDate, now)) : {};
  return { readings, live, fetchedAt: live ? (latest?.fetchedAt ?? null) : null, latestDate, yearAgo };
}
