import { createElement } from "react";

import { ElectionResultsPage } from "@/components/programmatic/ElectionResultsPage";
import type { Locale } from "@/lib/i18n/config";
import { resolveElectionPage } from "@/lib/programmatic/elections/pages";

/**
 * Pages whose route resolves a record before rendering: the payload test
 * passes plain JSON props, so these wrappers do the route's lookup.
 */
export function ElectionTown({ locale, slug }: { locale: Locale; slug: string }) {
  const municipality = resolveElectionPage(locale, locale, slug);
  if (!municipality) throw new Error(`no election page ${locale}/${slug}`);
  return createElement(ElectionResultsPage, { locale, municipality });
}
