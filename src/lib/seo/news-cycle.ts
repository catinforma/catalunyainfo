import type { EntryDetail } from "@/lib/content/types";

/**
 * Guides that report a dated news event, marked up as NewsArticle.
 *
 * schema.org's NewsArticle is "an article whose content reports news, or
 * provides background context and supporting materials for understanding the
 * news". These pages do exactly that, each for one event on a fixed date:
 * the strikes of November 2026 (minimum-services orders, what runs) and the
 * 29 November 2026 general election (how to vote, postal vote, polling-station
 * duty, candidates, election night). They stay in the Guides section; only the
 * type in their markup changes. Everything else (evergreen guides, travel,
 * calendars) remains Article.
 *
 * Keyed by `entries.key`, which the publisher sets from each spec's
 * `entryKey`; tests/discover-news.test.ts checks every key here still exists.
 * Remove an event's keys once it is history (the results pages that replace
 * them are reference, not news).
 */
export const NEWS_CYCLE_ENTRY_KEYS: ReadonlySet<string> = new Set([
  // Strikes, November 2026.
  "guide-strikes-catalonia-today",
  "guide-general-strike-11-november-2026",
  "guide-strike-renfe-november-2026",
  "guide-strike-education-november-2026",
  // General election, 29 November 2026.
  "guide-how-to-vote-catalonia",
  "guide-postal-vote",
  "guide-polling-station-duty",
  "guide-general-election-candidates-catalonia",
  "guide-election-night-results-spain",
]);

export function isNewsArticle(entry: Pick<EntryDetail, "type" | "key">): boolean {
  return entry.type === "news" || Boolean(entry.key && NEWS_CYCLE_ENTRY_KEYS.has(entry.key));
}
