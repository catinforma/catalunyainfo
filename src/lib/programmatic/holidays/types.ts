/**
 * Shape of `snapshot.json`, the committed data behind the holiday pages.
 *
 * Written only by `scripts/holidays-snapshot.ts`; read at render time without
 * any network or database access. `tests/holiday-engine.test.ts` checks it.
 */

export interface SourceRef {
  /** Official title, as published. */
  name: string;
  /** "DOGC núm. 9565, de 17.12.2025" or the dataset id. */
  ref: string;
  url: string;
}

export interface NucleusDays {
  /** As the gazette writes it, article first: "els Reguers". */
  name: string;
  dates: string[];
}

export interface SnapshotMunicipality {
  /** ASCII of the name, stable: the URL segment. */
  slug: string;
  /** INE municipality code, five digits. */
  ine: string;
  /** Official name, article first: "l'Hospitalet de Llobregat". */
  name: string;
  /** Name as the local-holiday order prints it (matching key for the next order). */
  dogcName: string;
  comarca: string;
  population: number;
  /** 1 = most populous among the municipalities on this list. */
  rank: number;
  /** The two (rarely one) local holidays of the municipality itself; empty if only its nuclei have days. */
  local: string[];
  /** Villages within the municipality with days of their own. */
  nuclei: NucleusDays[];
  /** Set when the open data disagrees with the DOGC (the DOGC is used). */
  correction: { openData: string[]; by: string } | null;
  /** The ten Sundays and holidays when shops may open this year. */
  shops: string[];
  /** True when the council is listed by name in the shop-opening resolution. */
  shopsOwnList: boolean;
}

export interface DatePlace {
  name: string;
  /** Municipality the nucleus belongs to; null when the place is the municipality. */
  parent: string | null;
  /** Slug of the municipality page, when it has one. */
  slug: string | null;
}

/**
 * `local-2027.json`: next year's local days, written by `prepare2027` the day
 * the DOGC order appears. `order: null` means "not published yet".
 */
export interface NextYearLocal {
  order: SourceRef | null;
  readOn: string | null;
  municipalities: Record<string, { local: string[]; nuclei: NucleusDays[] }>;
}

export interface HolidaySnapshot {
  schema: 1;
  /** The day the sources below were read. The only date the pages print. */
  readOn: string;
  year: number;
  sources: {
    localOrder: SourceRef;
    localAmendments: SourceRef[];
    localOpenData: SourceRef & { rowsUpdatedAt: string; rows: number };
    regional: Record<string, SourceRef>;
    shops: SourceRef;
    shopsOrder: SourceRef;
    population: SourceRef & { year: number };
    comarques: SourceRef;
  };
  municipalities: SnapshotMunicipality[];
  /** More populous than the last listed, left out because the order gives them no local days. */
  excluded: { name: string; ine: string; population: number; comarca: string; reason: "no-proposal" }[];
  /** Places with a local holiday on dates the date pages talk about. */
  localByDate: Record<string, DatePlace[]>;
  /**
   * Councils whose own shop-opening list (Resolució EMT/4342/2025) includes a
   * date the date pages talk about. Only dates outside the default list are
   * keys: on those, these are the only places where shops may open.
   */
  shopsByDate: Record<string, DatePlace[]>;
}
