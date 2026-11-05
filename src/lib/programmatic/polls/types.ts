/**
 * Shapes of the official-poll data (types only, no values). The values live
 * in `figures.ts`, which only `data.ts` may import.
 */

import type { ProvinceKey } from "@/lib/content/candidates/boe";
import type { Locale } from "@/lib/i18n/config";

export type Localized = Record<Locale, string>;

/** The only two pollsters this page shows: both public bodies. */
export type PollOrg = "cis" | "ceo";

/** A single figure or a range, exactly as the source prints it (decimals kept). */
export type Figure = number | readonly [number, number];

export interface EstimateRow {
  /** The party or coalition as the source names it. Rows keep the source's order. */
  party: string;
  /** Estimated share of the valid vote, % (one decimal, as printed). */
  vote?: Figure | null;
  /** The source's confidence interval for the vote estimate, % (printed as given, often whole numbers). */
  voteCi?: Figure | null;
  /** Estimated seats in Catalonia (48 deputies). */
  seats?: Figure | null;
  /** Estimated seats per province, when the source gives them. */
  provinces?: Partial<Record<ProvinceKey, Figure | null>>;
}

export type EstimateColumn = "vote" | "voteCi" | "seats" | ProvinceKey;

export interface EstimateTable {
  caption: Localized;
  /** Which columns the source gives, in display order. */
  columns: readonly EstimateColumn[];
  rows: readonly EstimateRow[];
  /** The source's own caveats (other parties, blank vote, ranges), with the page or table cited. */
  note: Localized;
}

/**
 * The specifications LOREG art. 69.1 requires with every published poll:
 * name and address of who ran it and who commissioned it (a); sampling
 * system, sample size, margin of error, level of representativeness,
 * selection procedure and fieldwork dates (b); the full text of the questions
 * and the number of people who did not answer each one (c: the question and
 * its non-response here, the full questionnaire linked).
 */
export interface TechnicalSheet {
  organisation: Localized;
  client: Localized;
  universe: Localized;
  sample: Localized;
  margin: Localized;
  sampling: Localized;
  mode: Localized;
  fieldwork: { from: string; to: string };
  /** Which questions the estimate is built from, and where their full text is. */
  questions: Localized;
}

export interface PollLinks {
  results: string;
  questionnaire?: string;
  sheet?: string;
  data?: string;
  page?: string;
}

export interface PublishedPoll {
  id: string;
  status: "published";
  org: PollOrg;
  name: Localized;
  /** "Estudio n.º 3xxx" (CIS) / "REO xxxx" (CEO). */
  study: string;
  /** ISO date of publication. */
  publishedOn: string;
  /** What the estimate is of (Congress, Catalonia; per province or not). */
  scope: Localized;
  tables: readonly EstimateTable[];
  sheet: TechnicalSheet;
  links: PollLinks;
  /** ISO date the figures were read on the official page. */
  checkedOn: string;
}

export interface ExpectedPoll {
  id: string;
  status: "expected";
  org: PollOrg;
  name: Localized;
  /** ISO date an official page announces, or null when none does. */
  expectedOn: string | null;
  /** When the slot must be re-checked even without an announced date (staleness test). */
  recheckBy: string;
  note: Localized;
  page: string;
  checkedOn: string;
}

export type Poll = PublishedPoll | ExpectedPoll;
