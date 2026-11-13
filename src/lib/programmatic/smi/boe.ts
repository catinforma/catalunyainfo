import "server-only";

import { madridDay } from "@/lib/programmatic/rent-update/ine";

import { findSmiDecree, parseSmiDecree, type BoeHit, type LiveBoe } from "./engine";
import { TARGET_YEAR } from "./rules";

/**
 * Has the BOE published the 2027 SMI decree? Asked on every regeneration of
 * the SMI pages (hourly, the routes' `revalidate`), so the page changes the
 * morning the BOE prints it, before anyone edits rules.ts:
 *
 *  1. the BOE's legislation search (open data, JSON) for the decree's title,
 *     which lists a decree the morning it is published (RD 126/2026 was
 *     listed at 10:25 UTC on its publication day);
 *  2. if it is not there, today's BOE summary (published ~07:30 Madrid);
 *  3. when found, the decree's XML, from which engine.ts reads the amounts
 *     with sanity checks. If they do not parse, the page links the decree
 *     and prints no figure.
 *
 * Every request has a timeout; any failure leaves the page on what rules.ts
 * says (the draft), never on a guess.
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const BOE_REVALIDATE_SECONDS = 3600;
const TIMEOUT_MS = 8_000;
const API = "https://www.boe.es/datosabiertos/api";

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

/** The BOE legislation search for the year's decree title. */
export function searchUrl(year: number = TARGET_YEAR): string {
  const query = { query: { query_string: { query: `titulo:"salario mínimo interprofesional para ${year}"` } } };
  return `${API}/legislacion-consolidada?query=${encodeURIComponent(JSON.stringify(query))}&limit=10`;
}

/** One day's BOE summary. */
export function summaryUrl(day: string): string {
  return `${API}/boe/sumario/${day.replaceAll("-", "")}`;
}

/** The XML of one BOE document. */
export function xmlUrl(boeId: string): string {
  return `https://www.boe.es/diario_boe/xml.php?id=${boeId}`;
}

async function get(fetchImpl: Fetcher, url: string, accept: string): Promise<Response> {
  const response = await fetchImpl(url, {
    headers: { accept, "user-agent": "CatalunyaInfo (+https://www.catalunyainfo.com)" },
    next: { revalidate: BOE_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  } as RequestInit);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

async function findHit(fetchImpl: Fetcher, today: string): Promise<{ checked: boolean; hit: BoeHit | null }> {
  let checked = false;
  try {
    const hit = findSmiDecree(await (await get(fetchImpl, searchUrl(), "application/json")).json(), TARGET_YEAR);
    checked = true;
    if (hit) return { checked, hit };
  } catch {
    /* the summary below may still answer */
  }
  try {
    // Weekends and holidays have no BOE: a 404 here is normal.
    const hit = findSmiDecree(await (await get(fetchImpl, summaryUrl(today), "application/json")).json(), TARGET_YEAR, today);
    return { checked: true, hit };
  } catch {
    return { checked, hit: null };
  }
}

export async function loadSmiBoe(now: Date = new Date(), fetchImpl: Fetcher = fetch): Promise<LiveBoe & { today: string }> {
  const today = madridDay(now);
  const { checked, hit } = await findHit(fetchImpl, today);
  if (!hit) return { checked, hit: null, parsed: null, today };
  try {
    const xml = await (await get(fetchImpl, xmlUrl(hit.boeId), "application/xml")).text();
    return { checked, hit, parsed: parseSmiDecree(xml, TARGET_YEAR), today };
  } catch {
    return { checked, hit, parsed: null, today };
  }
}
