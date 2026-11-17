"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics/events";
import type { Locale } from "@/lib/i18n/config";

/**
 * `internal_search` for the server-rendered results page: the length of the
 * query and the number of results, never the query itself (GA4's
 * `view_search_results` already carries the term). What it adds is the count,
 * so searches that find nothing can be told apart. Renders nothing.
 */
export function SearchAnalytics({ locale, termLength, resultsCount }: { locale: Locale; termLength: number; resultsCount: number }) {
  useEffect(() => {
    if (termLength === 0) return;
    track({ name: "internal_search", params: { search_term_length: termLength, results_count: resultsCount, locale } });
  }, [locale, termLength, resultsCount]);
  return null;
}
