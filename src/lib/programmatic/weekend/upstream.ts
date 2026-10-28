/**
 * Server side of the live weekend list: one request to the Generalitat's
 * cultural agenda for the whole of Catalonia and the current weekend, reduced
 * to the compact list the zone pages filter in the browser. Used by
 * `app/api/weekend/agenda/route.ts` only.
 *
 * Cost: one upstream request (a few hundred rows) per cache miss. The route's
 * answer is cached by the CDN for 30 minutes, so this runs about twice an hour
 * per region with traffic, and never writes to ISR.
 */

import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { weekendWindow } from "@/lib/content/weekend/agenda";

import { agendaUrl, buildLookup, compactEvents, municipalityNames } from "./compact";
import { SNAPSHOT } from "./data";
import type { WeekendPayload } from "./live";

const UPSTREAM_TIMEOUT_MS = 15_000;

/** Cache headers: 30 minutes at the CDN, 30 more of stale-while-revalidate. */
export const SUCCESS_CACHE = "public, s-maxage=1800, stale-while-revalidate=1800";
/** A failure is cached for a minute, so an outage does not turn every page view into an upstream call. */
export const FAILURE_CACHE = "public, s-maxage=60";

const LOOKUP = buildLookup(SNAPSHOT);
const NAMES = municipalityNames(SNAPSHOT);

export type LoadResult = { ok: true; payload: WeekendPayload } | { ok: false; error: string };

/**
 * This weekend's list for the whole of Catalonia; never throws. The window is
 * the Catalonia page's own (`weekendWindow`), computed from `now` in
 * Europe/Madrid, and travels with the list so the browser can refuse a list
 * whose weekend is over.
 */
export async function loadWeekendPayload(fetchImpl: typeof fetch = fetch, now: Date = new Date()): Promise<LoadResult> {
  const window = weekendWindow(todayInCatalonia(now));
  try {
    const response = await fetchImpl(agendaUrl(window), {
      headers: { accept: "application/json", "user-agent": "CatalunyaInfo (+https://www.catalunyainfo.com)" },
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
    const rows = (await response.json()) as unknown;
    if (!Array.isArray(rows)) return { ok: false, error: "unusable answer" };
    const events = compactEvents(rows as Record<string, string | undefined>[], window, LOOKUP, NAMES);
    return { ok: true, payload: { window, fetchedAt: now.toISOString(), events } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.name : "error" };
  }
}
