/**
 * Dataset markup for the reservoir pages (Google Dataset Search).
 *
 * Levels are the ACA's daily series on the Generalitat's transparency portal
 * (gn9e-3qhr, history vjx7-6kcp), under the Generalitat's open-data licence.
 * The creator is written the way the licence asks the data to be cited (the
 * «…» in the snapshot's `terms`), falling back to the publisher. Name and
 * description are the page's own H1 and meta description. No `dateModified`:
 * the browser refreshes the reading, so the date in the HTML is not the last.
 */

import type { Locale } from "@/lib/i18n/config";
import { GENCAT_OPEN_DATA_LICENCE, datasetSchema } from "@/lib/seo/jsonld";

import { hubCopy, reservoirDescription, reservoirH1 } from "./copy";
import { SNAPSHOT } from "./data";
import { reservoirHubPath, reservoirPath } from "./paths";
import type { SnapshotReservoir } from "./types";

const CATALONIA: Record<Locale, string> = { ca: "Catalunya", es: "Cataluña", en: "Catalonia" };

/** «Generalitat de Catalunya. Departament de … Agència Catalana de l'Aigua», as the terms ask. */
export function reservoirCreator(): string {
  const daily = SNAPSHOT.sources.daily;
  const cited = /«([^»]+)»/.exec(daily.terms ?? "");
  return cited?.[1]?.trim() || daily.publisher;
}

function common() {
  return {
    creator: reservoirCreator(),
    license: GENCAT_OPEN_DATA_LICENCE,
    isBasedOn: [SNAPSHOT.sources.daily.url, SNAPSHOT.sources.history.url],
  };
}

export function reservoirDataset(r: SnapshotReservoir, locale: Locale) {
  return datasetSchema({
    path: reservoirPath(locale, r.slug),
    name: reservoirH1(r, locale),
    description: reservoirDescription(r, locale),
    locale,
    ...common(),
    spatialCoverage: `${r.name.charAt(0).toUpperCase()}${r.name.slice(1)}, ${CATALONIA[locale]}`,
  });
}

export function reservoirHubDataset(locale: Locale) {
  const t = hubCopy(locale);
  return datasetSchema({
    path: reservoirHubPath(locale),
    name: t.h1,
    description: t.description,
    locale,
    ...common(),
    spatialCoverage: CATALONIA[locale],
  });
}
