import "server-only";

import { MAX_SOURCE_AGE_MS, buildAlertsResponse, type Fetcher } from "./alerts";
import { alertsForLine } from "./live";
import type { AlertsOk, LineId } from "./types";

/**
 * The Rodalies notices, read when a page is rendered, for its server HTML.
 *
 * Until 13 Nov 2026 the /rodalies/ pages were static and their HTML said only
 * "notices load with JavaScript": crawlers and no-JS readers never saw a
 * notice. The routes now regenerate every five minutes and print the notices
 * read at render time, under the time they were read (the source's own
 * answer time, which the data cache keeps with the response), and the browser
 * reads them again after mount. Same sources, same checks and same 15-minute
 * rule as the route handler (`alerts.ts`); a failed or stale read gives null
 * and the page keeps its old fallback text.
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const SERVER_REVALIDATE_SECONDS = 300;

/**
 * `fetch` with the data cache instead of `no-store` (a no-store fetch would
 * make the page dynamic), recording when the upstream answered.
 */
function cachedFetcher(answered: { at: string | null }): Fetcher {
  return async (url, init) => {
    const { cache: _ignored, ...rest } = init ?? {};
    const response = await fetch(url, { ...rest, next: { revalidate: SERVER_REVALIDATE_SECONDS } } as RequestInit);
    const header = Date.parse(response.headers.get("date") ?? "");
    if (Number.isFinite(header)) answered.at = new Date(header).toISOString();
    return response;
  };
}

/** Pure: the payload as of the upstream's answer time, refused if that is older than the handler allows. */
export function asOfAnswer(body: AlertsOk, answeredAt: string | null, now: Date, maxAgeMs: number): AlertsOk | null {
  const at = answeredAt ?? body.fetchedAt;
  const age = now.getTime() - Date.parse(at);
  if (!Number.isFinite(age) || age > maxAgeMs) return null;
  return { ...body, fetchedAt: at };
}

export async function loadServerAlerts(now: Date = new Date()): Promise<AlertsOk | null> {
  const answered = { at: null as string | null };
  const { body } = await buildAlertsResponse(cachedFetcher(answered), now);
  if (!body.ok) return null;
  // The Renfe feed carries its own timestamp, which the handler already checked.
  return asOfAnswer(body, body.sourceUpdatedAt ?? answered.at, now, MAX_SOURCE_AGE_MS);
}

/** Only the notices a line page shows, so its props stay small. */
export function forLine(payload: AlertsOk | null, line: LineId): AlertsOk | null {
  return payload ? { ...payload, alerts: alertsForLine(payload.alerts, line) } : null;
}
