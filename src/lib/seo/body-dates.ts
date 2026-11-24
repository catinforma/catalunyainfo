import type { MetadataRoute } from "next";

import BODY_DATES from "./body-dates.json" with { type: "json" };

/**
 * Sitemap `lastmod`: the moment a page's content really last changed.
 *
 * Google, "Build and submit a sitemap" (Search Central, read 21 Nov 2026):
 * "Google uses the <lastmod> value if it's consistently and verifiably
 * accurate", and it "should reflect the date and time of the last significant
 * update to the page. For example, an update to the main content, the
 * structured data, or links on the page is generally considered significant,
 * however an update to the copyright date is not."
 *
 * Every URL takes the latest of:
 *
 *  - its data date: when the figures it prints were read (the live reading,
 *    the snapshot's read day, the verification of the rules), which each
 *    family's own sitemap function already gives;
 *  - its body date (this file): when the code and data files that render the
 *    family's pages last changed what they render. Written per family into
 *    body-dates.json by scripts/body-dates.ts, from normalised source (a
 *    comment or a re-indent moves nothing), and stamped with the deploy's time
 *    by the build, so it is the moment the change went live;
 *  - for database articles, the last publish that changed what a reader sees
 *    (`entries.updated_at`, written only then by publish-article.ts), today
 *    for a page carrying a day-dependent block, and the body date of any
 *    code-data block it carries (the local holidays table, the shops table…).
 *
 * Never the build time for everything, never a frozen constant.
 */

interface BodyDatesFile {
  version: number;
  families: Record<string, { date: string; fingerprint: string; files: number }>;
}

const FILE = BODY_DATES as BodyDatesFile;

/**
 * Content blocks that render data from the code base rather than from the
 * article's own body (src/components/blocks/BlockRenderer.tsx), and the
 * component that renders each. Day-dependent blocks (day-dependent.ts) are
 * dated today anyway and are not listed; blocks whose numbers sit in the
 * block itself (calculator, calendar, conditionsMap) change the article's
 * stored body, which the publish date already covers.
 */
export const DATA_BLOCK_COMPONENTS = {
  touristTax: "src/components/blocks/TouristTaxCalculator.tsx",
  transportPasses: "src/components/blocks/TransportPassSelector.tsx",
  localHolidays: "src/components/blocks/LocalHolidays.tsx",
  shopsChristmas: "src/components/blocks/ShopsChristmas.tsx",
  municipalElections: "src/components/blocks/MunicipalElections.tsx",
  electionHistory: "src/components/blocks/ElectionHistory.tsx",
} as const;

export type DataBlockType = keyof typeof DATA_BLOCK_COMPONENTS;
export const DATA_BLOCK_TYPES = Object.keys(DATA_BLOCK_COMPONENTS) as DataBlockType[];

/** The body-dates key of a content block. */
export function blockBodyKey(type: string): string {
  return `block:${type}`;
}

/** Matches one block of that type in a body's jsonb text form (as DAY_DEPENDENT_PATTERN does). */
export function dataBlockPattern(type: DataBlockType): string {
  return `"type":\\s*"${type}"`;
}

/** When the family's body last changed, or null when the family has no record. */
export function bodyDate(key: string, file: BodyDatesFile = FILE): Date | null {
  const record = file.families[key];
  if (!record) return null;
  const date = new Date(record.date);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** The latest of the given dates; null when none is valid. */
export function latestDate(...dates: ReadonlyArray<Date | string | null | undefined>): Date | null {
  let newest: Date | null = null;
  for (const value of dates) {
    if (value === null || value === undefined) continue;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) continue;
    if (newest === null || date > newest) newest = date;
  }
  return newest;
}

/**
 * A family's sitemap entries with `lastModified` raised to its body date (and
 * to `floor`, when given: the start of an election-day phase, say). An entry
 * already newer keeps its own date.
 */
export function dated(
  key: string,
  entries: MetadataRoute.Sitemap,
  { floor = null, file = FILE }: { floor?: Date | null; file?: BodyDatesFile } = {},
): MetadataRoute.Sitemap {
  const body = bodyDate(key, file);
  return entries.map((entry) => {
    const lastModified = latestDate(entry.lastModified, body, floor);
    return lastModified ? { ...entry, lastModified } : entry;
  });
}

export interface ContentDates {
  /** dateModified: the verified-content update (lib/seo/article-dates.ts). */
  updatedAt: Date;
  /** The last publish that changed what a reader sees (entries.updated_at). */
  contentChangedAt: Date | null;
  dayDependent: boolean;
  /**
   * The start of the election-day phase the page is in, for a page carrying an
   * `electionPhased` block (day-dependent.ts): its text changes then, not every
   * night. Null otherwise.
   */
  phaseStart?: Date | null;
  /** The code-data blocks the body carries. */
  dataBlocks: readonly string[];
}

/** `lastmod` of a database article: see the rules at the top of this file. */
export function contentLastModified(row: ContentDates, startOfToday: Date, file: BodyDatesFile = FILE): Date {
  return (
    latestDate(
      row.updatedAt,
      row.contentChangedAt,
      row.dayDependent ? startOfToday : null,
      row.phaseStart,
      ...row.dataBlocks.map((type) => bodyDate(blockBodyKey(type), file)),
    ) ?? row.updatedAt
  );
}
