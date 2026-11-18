import { gunzipSync } from "node:zlib";

import { capFileName, parseAemetIndex, parseCap, parseCivilRows, parseSctRss, untar } from "./parse";
import type { CivilRead, RoadsRead, WeatherRead, WeatherWarning } from "./types";

/**
 * The three official reads behind the warnings page, each on its own: one
 * source failing never hides the other two. Every read returns null rather
 * than a partial list presented as complete. The fetch function is an
 * argument (server.ts passes one with the data cache and a timeout; tests
 * pass fixtures).
 *
 * Checked 18 Nov 2026 from the VPS, all keyless:
 *  - AEMET Meteoalerta RSS for Catalonia (area 69), offered for subscription
 *    at aemet.es/es/rss_info/avisos/cat; the items link CAP 1.2 files and the
 *    tar.gz "Estado completo de avisos para Cataluña" (CloudFront, max-age 60).
 *  - SCT incidents RSS, the access point of open-data entry `uyam-bs37`
 *    ("Incidències viàries en temps real a Catalunya", update "Contínua";
 *    Last-Modified moved every ~15 minutes on 18 Nov).
 *  - Protecció Civil, Socrata dataset `wj9c-j6vf` (update "Variable").
 */

export const AEMET_RSS_URL = "https://www.aemet.es/documentos_d/eltiempo/prediccion/avisos/rss/CAP_AFAC69_RSS.xml";
export const SCT_RSS_URL = "https://www.gencat.cat/transit/opendata/incidenciesRSS.xml";
export const CIVIL_URL = "https://analisi.transparenciacatalunya.cat/resource/wj9c-j6vf.json";

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** CAP files fetched one by one when the bundle is missing or lacks some (a storm can list dozens). */
const MAX_SINGLE_CAPS = 80;
const SINGLE_CONCURRENCY = 6;

/** When the source's server answered (HTTP Date, which the data cache keeps with the body), else now. */
export function answeredAt(response: Response, now: number): string {
  const header = Date.parse(response.headers.get("date") ?? "");
  return new Date(Number.isFinite(header) ? header : now).toISOString();
}

async function text(fetcher: FetchLike, url: string, accept: string): Promise<{ body: string; response: Response } | null> {
  const response = await fetcher(url, { headers: { accept } });
  if (!response.ok) return null;
  return { body: await response.text(), response };
}

async function bundleFiles(fetcher: FetchLike, url: string): Promise<Map<string, string> | null> {
  try {
    const response = await fetcher(url, { headers: { accept: "application/gzip, application/x-gzip, application/octet-stream" } });
    if (!response.ok) return null;
    return untar(new Uint8Array(gunzipSync(Buffer.from(await response.arrayBuffer()))));
  } catch {
    return null;
  }
}

/** Runs `task` over `items`, `limit` at a time; any rejection rejects the whole. */
async function pool<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index] as T);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * AEMET's warnings for Catalonia: the RSS index, then the CAP files it lists,
 * from the bundle (one request) or one by one for any the bundle lacks.
 * `unread` counts listed warnings whose CAP file did not parse: the page says
 * so instead of hiding them. A list where nothing parsed is a failure (null).
 */
export async function readWeather(fetcher: FetchLike, now: number): Promise<WeatherRead | null> {
  const rss = await text(fetcher, AEMET_RSS_URL, "application/rss+xml, application/xml");
  if (!rss) return null;
  const index = parseAemetIndex(rss.body);
  if (!index) return null;
  const base = { issued: index.issued, answeredAt: answeredAt(rss.response, now) };
  if (index.capUrls.length === 0) return { ...base, warnings: [], unread: 0 };

  const files = index.bundleUrl ? await bundleFiles(fetcher, index.bundleUrl) : null;
  const missing = index.capUrls.filter((url) => !files?.has(capFileName(url)));
  if (missing.length > MAX_SINGLE_CAPS) return null;
  const singles = new Map<string, string>();
  const fetched = await pool(missing, SINGLE_CONCURRENCY, async (url) => {
    const one = await text(fetcher, url, "application/xml");
    return one ? ([capFileName(url), one.body] as const) : null;
  });
  for (const entry of fetched) {
    if (!entry) return null;
    singles.set(entry[0], entry[1]);
  }

  const warnings: WeatherWarning[] = [];
  const seen = new Set<string>();
  let unread = 0;
  for (const url of index.capUrls) {
    const name = capFileName(url);
    const warning = parseCap(files?.get(name) ?? singles.get(name) ?? "");
    if (!warning) {
      unread += 1;
      continue;
    }
    if (seen.has(warning.id)) continue;
    seen.add(warning.id);
    warnings.push(warning);
  }
  if (warnings.length === 0) return null;
  return { ...base, warnings, unread };
}

/** SCT's incidents in force. */
export async function readRoads(fetcher: FetchLike, now: number): Promise<RoadsRead | null> {
  const rss = await text(fetcher, SCT_RSS_URL, "application/rss+xml, application/xml");
  if (!rss) return null;
  const feed = parseSctRss(rss.body);
  if (!feed) return null;
  return { published: feed.published, answeredAt: answeredAt(rss.response, now), incidents: feed.incidents };
}

/** Protecció Civil's plans in pre-alert, alert or emergency (an empty list means none). */
export async function readCivil(fetcher: FetchLike, now: number): Promise<CivilRead | null> {
  const response = await fetcher(CIVIL_URL, { headers: { accept: "application/json" } });
  if (!response.ok) return null;
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return null;
  }
  const plans = parseCivilRows(json);
  if (!plans) return null;
  const lastModified = Date.parse(response.headers.get("x-soda2-truth-last-modified") ?? response.headers.get("last-modified") ?? "");
  return {
    updated: Number.isFinite(lastModified) ? new Date(lastModified).toISOString() : null,
    answeredAt: answeredAt(response, now),
    plans,
  };
}
