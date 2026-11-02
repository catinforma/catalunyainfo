/**
 * Dataset markup for the holiday pages (Google Dataset Search).
 *
 * The figures are the Generalitat's: the local-holiday order in the DOGC and
 * its open-data twin on the transparency portal (b4eh-r8up, signed
 * "Departament d'Empresa i Treball", licence: the Generalitat's open-data
 * licence). Name and description are the page's own H1 and meta description,
 * so the markup says nothing the page does not.
 */

import { GENCAT_OPEN_DATA_LICENCE, datasetSchema, faqSchema } from "@/lib/seo/jsonld";

import { BOE_2027 } from "./boe-2027";
import { comarcaDescription, comarcaH1, displayName, hubCopy, municipalityDescription, municipalityH1 } from "./copy";
import { NEXT, SNAPSHOT, YEAR, councilApproved2027, nextYearFor, type ComarcaGroup } from "./data";
import { dateContent } from "./dates";
import { enName, englishHubCopy, englishTownDescription, englishTownH1 } from "./english-copy";
import type { DateLocale } from "./format";
import { comarcaPath, datePath, hubPath, municipalityPath, type DatePage, type MuniLocale } from "./paths";
import { dateQuestion } from "./question";
import type { SnapshotMunicipality } from "./types";

export const HOLIDAY_DATA_CREATOR = "Generalitat de Catalunya. Departament d'Empresa i Treball";

const CATALONIA: Record<MuniLocale, string> = { ca: "Catalunya", es: "Cataluña" };

/** The Generalitat's two sources, plus the council's own page when the town page gives next year's days from it. */
function basedOn(slug: string | null = null): string[] {
  const council = slug ? councilApproved2027(slug) : null;
  return [SNAPSHOT.sources.localOpenData.url, SNAPSHOT.sources.localOrder.url, ...(council ? [council.source.url] : [])];
}

/** The calendar years the page lists: this year, and next year once its order is out or the council has approved its days. */
function coverage(slug: string | null): string {
  const next = slug ? nextYearFor(slug) ?? councilApproved2027(slug) : null;
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
    isBasedOn: basedOn(m.slug),
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
    isBasedOn: basedOn(m.slug),
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

/**
 * A 2027 date page (tranche 4): the H1 and the meta description, based on the
 * texts the answer comes from (Ordre EMT/52/2026, the BOE's 2027 list, the
 * shop and school orders, and each council or the DOGC local order). Null for
 * the earlier date pages, which carry breadcrumbs only.
 */
export function dateDataset(iso: DatePage, locale: DateLocale) {
  const content = dateContent(iso, locale);
  if (!content.basedOn?.length) return null;
  return datasetSchema({
    path: datePath(locale, iso),
    name: dateQuestion(iso, locale),
    description: content.description,
    locale,
    creator: HOLIDAY_DATA_CREATOR,
    license: GENCAT_OPEN_DATA_LICENCE,
    isBasedOn: content.basedOn,
    spatialCoverage: { ca: "Catalunya", es: "Cataluña", en: "Catalonia" }[locale],
    temporalCoverage: iso,
    dateModified: [SNAPSHOT.readOn, BOE_2027.readOn].sort().at(-1),
  });
}

/** The page's questions and the answers it prints (tranche 4), as FAQPage; null for the earlier date pages. */
export function dateFaq(iso: DatePage, locale: DateLocale) {
  const items = dateContent(iso, locale).faq;
  return items?.length ? faqSchema([{ type: "faq", items }]) : null;
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
