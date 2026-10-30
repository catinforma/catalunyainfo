/**
 * Dataset markup for the election-results pages (Google Dataset Search).
 *
 * Votes, turnout and calls are the Generalitat's open data on the
 * transparency portal (ntc4-rnwr, irrv-2mfc, tgns-3xuy; the mayor comes from
 * 2v2p-vu4h), all under the Generalitat's open-data licence and signed by the
 * publisher recorded in the snapshot. The coverage runs from the 2023 local
 * election to the 2024 Parliament election, the three the page tabulates.
 * Name and description are the page's own H1 and meta description.
 */

import type { Locale } from "@/lib/i18n/config";
import { GENCAT_OPEN_DATA_LICENCE, datasetSchema } from "@/lib/seo/jsonld";

import { electionDescription, hubMeta, placeName } from "./pages";
import { electionPath, hubPath } from "./paths";
import { SNAPSHOT } from "./snapshot";
import type { Municipality } from "./types";

const CATALONIA: Record<Locale, string> = { ca: "Catalunya", es: "Cataluña", en: "Catalonia" };

function common() {
  const { votes, turnout, elections, mayors } = SNAPSHOT.sources;
  const dates = Object.values(SNAPSHOT.elections).map((e) => e.date).sort();
  return {
    creator: votes.publisher,
    license: GENCAT_OPEN_DATA_LICENCE,
    isBasedOn: [votes.url, turnout.url, elections.url, mayors.url],
    temporalCoverage: `${dates[0]}/${dates[dates.length - 1]}`,
    dateModified: SNAPSHOT.readAt,
  };
}

/** `name` is the page's H1, built with the rest of the page model. */
export function electionDataset(m: Municipality, locale: Locale, name: string) {
  return datasetSchema({
    path: electionPath(locale, m.slug),
    name,
    description: electionDescription(locale, m),
    locale,
    ...common(),
    spatialCoverage: `${placeName(m, locale)}, ${CATALONIA[locale]}`,
  });
}

export function electionHubDataset(locale: Locale) {
  const meta = hubMeta(locale);
  return datasetSchema({
    path: hubPath(locale),
    name: meta.h1,
    description: meta.description,
    locale,
    ...common(),
    spatialCoverage: CATALONIA[locale],
  });
}
