"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics/events";
import type { Locale } from "@/lib/i18n/config";

/**
 * `internal_search` for the server-rendered results page: the length of the
 * query and the number of results, never the query itself (GA4's
 * `view_search_results` already carries the term). What it adds is the count,
 * so searches that find nothing can be told apart (also sent as
 * `search_no_results`, locale only). Renders nothing.
 */
export function SearchAnalytics({ locale, termLength, resultsCount }: { locale: Locale; termLength: number; resultsCount: number }) {
  useEffect(() => {
    if (termLength === 0) return;
    track({ name: "internal_search", params: { search_term_length: termLength, results_count: resultsCount, locale } });
    // A count of searches that found nothing, with no text: its own event so it can be marked and read without a filter.
    if (resultsCount === 0) track({ name: "search_no_results", params: { locale } });
  }, [locale, termLength, resultsCount]);
  return null;
}
