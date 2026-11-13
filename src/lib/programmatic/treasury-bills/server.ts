import "server-only";

import { madridDay } from "@/lib/programmatic/rent-update/ine";

import { CALENDAR_2027 } from "./calendar";
import { LETRAS_SNAPSHOT } from "./data";
import { LATEST_RESULTS_URL, TERMS, latestByTerm, mergeResults, parseResultsPage, type AuctionResult, type Term } from "./results";

/**
 * The Letras results in the server HTML of the three pages, read from the
 * Tesoro Público's "Resultado de últimas subastas" table at each
 * regeneration (routes revalidate every 3 hours, so a Tuesday auction shows
 * the same day), merged over the committed snapshot. A term whose live
 * column fails the parser's checks, or is older than the snapshot's, keeps
 * the snapshot's result; the page then prints the snapshot's date. While
 * the 2027 calendar is not typed in (calendar.ts), the Tesoro's home page
 * is also read for a link to its 2027 calendar PDF, which the page links
 * without printing any date from it.
 */

/** Matches the routes' `revalidate` (a literal there, as Next requires). */
export const SERVER_REVALIDATE_SECONDS = 10_800;
const TIMEOUT_MS = 10_000;
export const TESORO_HOME = "https://www.tesoro.es/";

export type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface LetrasData {
  /** Every known result, newest first (snapshot + live). */
  results: AuctionResult[];
  /** Terms whose latest result came from tesoro.es in this render. */
  live: Record<Term, boolean>;
  snapshotAsOf: string;
  /** A link to the Tesoro's 2027 calendar PDF found on its home page, while calendar.ts has no 2027 rows. */
  calendar2027Pdf: string | null;
  /** The Madrid day the page was rendered. */
  today: string;
}

async function getText(fetchImpl: Fetcher, url: string): Promise<string> {
  const response = await fetchImpl(url, {
    headers: { accept: "text/html", "user-agent": "CatalunyaInfo (+https://www.catalunyainfo.com)" },
    next: { revalidate: SERVER_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  } as RequestInit);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

/** The 2027 calendar PDF link on the Tesoro's home page ("/documents/d/tesoro/calendario-tesoro-publico-2027…"), absolute, or null. */
export function findCalendar2027(html: string): string | null {
  const m = /["'](?:https:\/\/www\.tesoro\.es)?(\/documents\/d\/tesoro\/calendario-tesoro-publico-2027[^"'\s<>]*)["']/i.exec(html);
  return m ? `https://www.tesoro.es${m[1]}` : null;
}

export async function loadLetrasData(now: Date = new Date(), fetchImpl: Fetcher = fetch): Promise<LetrasData> {
  const today = madridDay(now);
  const own = LETRAS_SNAPSHOT;
  const none = Object.fromEntries(TERMS.map((t) => [t, false])) as Record<Term, boolean>;

  const [fresh, calendar2027Pdf] = await Promise.all([
    getText(fetchImpl, LATEST_RESULTS_URL)
      .then((html) => parseResultsPage(html, LATEST_RESULTS_URL).results)
      .catch(() => [] as AuctionResult[]),
    CALENDAR_2027
      ? Promise.resolve(null)
      : getText(fetchImpl, TESORO_HOME)
          .then(findCalendar2027)
          .catch(() => null),
  ]);

  const mine = latestByTerm(own.results);
  const live = { ...none };
  // Never a result dated after today (a clock or page error), never one older than the snapshot's.
  const accepted = fresh.filter((r) => r.auction <= today && (!mine[r.term] || r.auction >= mine[r.term]!.auction));
  for (const r of accepted) live[r.term] = true;
  return { results: mergeResults(own.results, accepted), live, snapshotAsOf: own.asOf, calendar2027Pdf, today };
}
