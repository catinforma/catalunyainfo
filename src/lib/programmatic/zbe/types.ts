import type { Region } from "@/lib/programmatic/holidays/boe-2027";

export type ZbeLocale = "ca" | "es" | "en";
export const ZBE_LOCALES: readonly ZbeLocale[] = ["es", "ca", "en"];
export type L10n = Record<ZbeLocale, string>;

/** The DGT environmental labels, cleanest first; "none" is a vehicle with no label. */
export type Label = "0" | "ECO" | "C" | "B" | "none";
export const LABELS: readonly Label[] = ["0", "ECO", "C", "B", "none"];

/**
 * When a restriction applies. "working-weekdays": Monday to Friday except
 * public holidays. "every-day": every day of the year, holidays included.
 * `from`/`to` are local time; "00:00"–"24:00" is the whole day.
 */
export interface Schedule {
  days: "working-weekdays" | "every-day";
  from: string;
  to: string;
}

/** An official page a fact was read on. */
export interface ZbeSource {
  url: string;
  title: string;
  publisher: string;
}

/**
 * Where a statement comes from: the index of the page in the city's
 * `sources` and the words of that page, verbatim and in its language, that
 * say it. The quote is the audit trail (it is checked against the saved copy
 * of the page before a city ships); the page prints the source and the date.
 */
export interface Proof {
  source: number;
  quote: string;
}

/** One access restriction of a zone, as the council states it. */
export interface Restriction extends Proof {
  labels: Label[];
  /** The vehicles it covers, in words. */
  vehicles: L10n;
  schedule: Schedule;
  /** Day it took effect. */
  since: string;
  /**
   * A condition that decides whether the restriction reaches a given vehicle
   * (only non-residents, only above a weight, only in pollution episodes).
   * With one, the answer for these labels is "depends", never yes or no.
   * The text is a full sentence and carries the hours where the council
   * gives them: the table prints it as the answer.
   */
  condition?: L10n;
  /**
   * For a restriction without a condition: who may still drive in during the
   * hours (authorised residents, a number of days a year), as a clause that
   * follows "No, …". Each point is also a sourced fact further down.
   */
  unless?: L10n;
}

export type FactKind = "area" | "since" | "next" | "occasional" | "residents" | "foreign" | "parking" | "exempt" | "control" | "fine";

/** One sourced statement of the page, written out in the three languages. */
export interface Fact extends Proof {
  kind: FactKind;
  text: L10n;
}

export interface ZbeCity {
  slug: string;
  name: L10n;
  /** BOE column of the city's community: national and regional holidays come from it. */
  region: Region;
  catalonia: boolean;
  /** Slug of the municipality in the Catalan holiday family, for its local holidays. */
  holidaySlug?: string;
  /** File of the DGT directory and, where a file holds several zones, the zone id. */
  dgtFile: string;
  dgtZoneId?: string;
  zoneName: L10n;
  /** Who runs the zone, as it signs its page. */
  authority: string;
  /** Day every source below was last read. */
  checked: string;
  /** Fines are being issued (false: a declared warning period with no fines). */
  fines: boolean;
  restrictions: Restriction[];
  /** The labels the council says can drive in freely, with its words. */
  allowed: Proof & { labels: Label[] };
  facts: Fact[];
  /** Official map or street list of the perimeter. */
  mapUrl: string;
  officialUrl: string;
  sources: ZbeSource[];
  /** Where the DGT file and the council's page differ; null when they agree on hours, labels and start. */
  dgtDifference: L10n | null;
  /** What the council's pages do not state and this page therefore does not print. */
  notPublished: L10n[];
  /** A guide of this site that goes deeper on one point (Barcelona: foreign plates). */
  guide?: { key: "zbe"; text: L10n };
}

export type AnswerKind = "yes" | "no" | "depends";

export interface LabelAnswer {
  label: Label;
  kind: AnswerKind;
  /** The restrictions that reach the label. */
  restrictions: Restriction[];
}
