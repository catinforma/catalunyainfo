/**
 * Server side of the live reading: one request to the ACA's daily series
 * (`gn9e-3qhr`, last 14 days, about 130 rows) per CDN miss, reduced to one
 * reading per reservoir. Used by `app/api/reservoirs/levels/route.ts` only.
 *
 * The fetch is `no-store`: nothing goes to the data cache or ISR. The
 * response carries its own Cache-Control, so the CDN serves it for an hour
 * (the ACA publishes once a day, late morning).
 */

import { liveReadings, shiftDays, type AcaRow } from "./prepare";
import type { LiveFailed, LiveOk, LivePayload } from "./types";

export const ACA_DAILY_ENDPOINT = "https://analisi.transparenciacatalunya.cat/resource/gn9e-3qhr.json";

/** An hour at the CDN, two more of stale-while-revalidate. */
export const OK_CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=7200";
/** A failure for a minute, so an outage does not turn every view into an upstream call. */
export const FAILED_CACHE_CONTROL = "public, s-maxage=60";

/** Fewer reservoirs than this is a broken answer (the series has nine). */
export const MIN_RESERVOIRS = 7;

const TIMEOUT_MS = 8_000;

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

function madridDate(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(instant);
}

export function liveQueryUrl(now: Date): string {
  const since = shiftDays(madridDate(now), -14);
  const params = new URLSearchParams({
    $where: `dia >= '${since}T00:00:00.000'`,
    $order: "dia DESC",
    $limit: "500",
  });
  return `${ACA_DAILY_ENDPOINT}?${params.toString()}`;
}

/** The whole answer for the browser, with status and cache header. Never throws. */
export async function buildLevelsResponse(
  fetchImpl: Fetcher,
  now: Date,
): Promise<{ status: number; headers: Record<string, string>; body: LivePayload }> {
  const fetchedAt = now.toISOString();
  const failed = (): { status: number; headers: Record<string, string>; body: LiveFailed } => ({
    status: 503,
    headers: { "cache-control": FAILED_CACHE_CONTROL },
    body: { ok: false, error: "unavailable", fetchedAt },
  });
  try {
    const response = await fetchImpl(liveQueryUrl(now), {
      headers: { accept: "application/json", "user-agent": "CatalunyaInfo (+https://www.catalunyainfo.com)" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return failed();
    const rows = (await response.json()) as unknown;
    if (!Array.isArray(rows)) return failed();
    const readings = liveReadings(rows as AcaRow[]);
    if (readings.length < MIN_RESERVOIRS) return failed();
    const body: LiveOk = { ok: true, fetchedAt, readings };
    return { status: 200, headers: { "cache-control": OK_CACHE_CONTROL }, body };
  } catch {
    return failed();
  }
}
