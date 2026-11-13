/**
 * The two REE requests behind the PVPC pages. No Next imports, so tests can
 * drive them with a fake `fetch`.
 *
 *   REData   https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real
 *            ?start_date=<yesterday>T00:00&end_date=<tomorrow>T23:59&time_trunc=hour
 *            Open, no token; dates are Madrid wall clock. One request covers
 *            yesterday, today and (once published) tomorrow, ~27 KB.
 *   e·sios   https://api.esios.ree.es/archives/70/download_json?locale=es&date=<date>
 *            The daily PVPC file, open, no token; read for the Ceuta and
 *            Melilla column only. Optional: the pages work without it.
 *
 * Both answered from the VPS on 13 Nov 2026 (samples in tests/fixtures/pvpc).
 *
 * Reuse: REE's legal notice (§5.1) allows publishing its data on a website
 * for information, citing Red Eléctrica as the source, without altering it
 * and with the date of the latest update. The pages print all three.
 */

import { parseEsiosArchive, parseRedata, withCym, type PvpcDay } from "./parse";
import { addDays } from "./time";
import type { PvpcSnapshot } from "./view";

export const REDATA_ENDPOINT = "https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real";
export const ESIOS_ARCHIVE_ENDPOINT = "https://api.esios.ree.es/archives/70/download_json";

/** Public pages of the same data, for readers. */
export const REE_PVPC_PAGE = "https://www.ree.es/es/operacion/sistema-electrico/pvpc";
export const ESIOS_PVPC_PAGE = "https://www.esios.ree.es/es/pvpc";

const USER_AGENT = "CatalunyaInfo (+https://www.catalunyainfo.com)";

export function redataUrl(today: string): string {
  const qs = new URLSearchParams({
    start_date: `${addDays(today, -1)}T00:00`,
    end_date: `${addDays(today, 1)}T23:59`,
    time_trunc: "hour",
  });
  return `${REDATA_ENDPOINT}?${qs.toString()}`;
}

export function esiosUrl(date: string): string {
  return `${ESIOS_ARCHIVE_ENDPOINT}?locale=es&date=${date}`;
}

/** The upstream's own `Date` header (when it answered), else `now`. */
export function answeredAt(response: Pick<Response, "headers">, now: number): string {
  const header = Date.parse(response.headers.get("date") ?? "");
  return new Date(Number.isFinite(header) ? header : now).toISOString();
}

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

const HEADERS = { accept: "application/json", "user-agent": USER_AGENT };

async function readJson(fetchImpl: FetchLike, url: string): Promise<{ json: unknown; response: Response } | null> {
  try {
    const response = await fetchImpl(url, { headers: HEADERS });
    if (!response.ok) return null;
    return { json: (await response.json()) as unknown, response };
  } catch {
    return null;
  }
}

/**
 * REE's PVPC for yesterday, today and tomorrow (once published), with the
 * Ceuta/Melilla column where e·sios has the day. Null when REData did not give
 * a usable answer. Never throws.
 */
export async function loadPvpc(fetchImpl: FetchLike, today: string, now: number): Promise<PvpcSnapshot | null> {
  const main = await readJson(fetchImpl, redataUrl(today));
  if (!main) return null;
  const series = parseRedata(main.json);
  if (!series) return null;
  const wanted = new Set([today, addDays(today, 1)]);
  const days: PvpcDay[] = await Promise.all(
    series.days.map(async (day) => {
      if (!wanted.has(day.date)) return day;
      const archive = await readJson(fetchImpl, esiosUrl(day.date));
      return withCym(day, archive ? parseEsiosArchive(archive.json, day.date) : null);
    }),
  );
  return { fetchedAt: answeredAt(main.response, now), updated: series.updated, days };
}
