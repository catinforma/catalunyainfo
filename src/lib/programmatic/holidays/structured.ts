/**
 * Dataset markup for the holiday pages (Google Dataset Search).
 *
 * The figures are the Generalitat's: the local-holiday order in the DOGC and
 * its open-data twin on the transparency portal (b4eh-r8up, signed
 * "Departament d'Empresa i Treball", licence: the Generalitat's open-data
 * licence). Name and description are the page's own H1 and meta description,
 * so the markup says nothing the page does not.
 */

import { GENCAT_OPEN_DATA_LICENCE, datasetSchema } from "@/lib/seo/jsonld";

import { comarcaDescription, comarcaH1, displayName, hubCopy, municipalityDescription, municipalityH1 } from "./copy";
import { NEXT, SNAPSHOT, YEAR, nextYearFor, type ComarcaGroup } from "./data";
import { enName, englishHubCopy, englishTownDescription, englishTownH1 } from "./english-copy";
import { comarcaPath, hubPath, municipalityPath, type MuniLocale } from "./paths";
import type { SnapshotMunicipality } from "./types";

export const HOLIDAY_DATA_CREATOR = "Generalitat de Catalunya. Departament d'Empresa i Treball";

const CATALONIA: Record<MuniLocale, string> = { ca: "Catalunya", es: "Cataluña" };

function basedOn(): string[] {
  return [SNAPSHOT.sources.localOpenData.url, SNAPSHOT.sources.localOrder.url];
}

/** The calendar years the page lists: this year, and next year once its order is out. */
function coverage(slug: string | null): string {
  const next = slug ? nextYearFor(slug) : null;
  return next ? `${YEAR}/${NEXT}` : String(YEAR);
}

export function municipalityDataset(m: SnapshotMunicipality, locale: MuniLocale) {
  return datasetSchema({
    path: municipalityPath(locale, m.slug),
    name: municipalityH1(m, locale),
    description: municipalityDescription(m, locale),
    locale,
    creator: HOLIDAY_DATA_CREATOR,
    license: GENCAT_OPEN_DATA_LICENCE,
    isBasedOn: basedOn(),
    spatialCoverage: `${displayName(m, locale)}, ${CATALONIA[locale]}`,
    temporalCoverage: coverage(m.slug),
    dateModified: SNAPSHOT.readOn,
  });
}

/** A comarca page: its towns' days, in a table (tranche 3). */
export function comarcaDataset(g: ComarcaGroup, locale: MuniLocale) {
  return datasetSchema({
    path: comarcaPath(locale, g.slug),
    name: comarcaH1(g, locale),
    description: comarcaDescription(g, locale),
    locale,
    creator: HOLIDAY_DATA_CREATOR,
    license: GENCAT_OPEN_DATA_LICENCE,
    isBasedOn: basedOn(),
    spatialCoverage: `${g.comarca}, ${CATALONIA[locale]}`,
    temporalCoverage: String(YEAR),
    dateModified: SNAPSHOT.readOn,
  });
}

/* English: the selected towns and the hub (30 Oct 2026). Same dataset, same fields. */

export function englishTownDataset(m: SnapshotMunicipality) {
  return datasetSchema({
    path: municipalityPath("en", m.slug),
    name: englishTownH1(m),
    description: englishTownDescription(m),
    locale: "en",
    creator: HOLIDAY_DATA_CREATOR,
    license: GENCAT_OPEN_DATA_LICENCE,
    isBasedOn: basedOn(),
    spatialCoverage: `${enName(m)}, Catalonia`,
    temporalCoverage: coverage(m.slug),
    dateModified: SNAPSHOT.readOn,
  });
}

export function englishHubDataset() {
  const t = englishHubCopy();
  return datasetSchema({
    path: hubPath("en"),
    name: t.h1,
    description: t.description,
    locale: "en",
    creator: HOLIDAY_DATA_CREATOR,
    license: GENCAT_OPEN_DATA_LICENCE,
    isBasedOn: basedOn(),
    spatialCoverage: "Catalonia",
    temporalCoverage: String(YEAR),
    dateModified: SNAPSHOT.readOn,
  });
}

export function holidayHubDataset(locale: MuniLocale) {
  const t = hubCopy(locale);
  return datasetSchema({
    path: hubPath(locale),
    name: t.h1,
    description: t.description,
    locale,
    creator: HOLIDAY_DATA_CREATOR,
    license: GENCAT_OPEN_DATA_LICENCE,
    isBasedOn: basedOn(),
    spatialCoverage: CATALONIA[locale],
    temporalCoverage: String(YEAR),
    dateModified: SNAPSHOT.readOn,
  });
}
