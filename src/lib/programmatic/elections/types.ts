/**
 * Shapes of the election-results snapshot (`snapshot.ts`), written by
 * `scripts/elections-snapshot.ts`. Counts only: every percentage on the page
 * is computed from these numbers at render time (see `results.ts`).
 */

export type ElectionKey = "municipal" | "congress" | "parliament";

/** The three elections every page carries, by their ids in the Generalitat's data. */
export const ELECTION_IDS: Record<ElectionKey, string> = {
  municipal: "M20231",
  congress: "G20231",
  parliament: "A20241",
};

export interface Counts {
  /** `cens_electoral`: people on the electoral roll for this election. */
  electorate: number;
  /** `votants` */
  voters: number;
  /** `vots_nuls` */
  nullVotes: number;
  /** `vots_blancs` */
  blankVotes: number;
  /** `vots_candidatures`: votes for lists, blank votes excluded. */
  listVotes: number;
  /** `vots_valids` = list votes + blank votes. */
  validVotes: number;
}

/** One list in a municipal election, names exactly as the source writes them. */
export interface MunicipalList {
  /** `candidatura_codi` */
  code: string;
  /** `candidatura_sigles` */
  short: string;
  /** `candidatura_denominacio` */
  name: string;
  votes: number;
  /** Councillors won (`escons`). */
  seats: number;
}

export interface MunicipalResult extends Counts {
  /** Size of the council (`escons` in the turnout table). */
  seats: number;
  /** `padro`: the population the council size was set from. */
  censusPopulation: number;
  lists: MunicipalList[];
}

/** Congress or Parliament votes in one territory, by list code. */
export interface RegionalVotes extends Counts {
  votes: Record<string, number>;
}

export interface ListLabel {
  short: string;
  name: string;
}

export interface ElectionMeta {
  id: string;
  /** `nom_eleccio`, as published. */
  name: string;
  /** ISO date. */
  date: string;
  /** Lists that stood, by code (Congress and Parliament only). */
  lists?: Record<string, ListLabel>;
}

export interface CataloniaRegional {
  /** The Catalonia row, which includes the vote from abroad. */
  total: RegionalVotes;
  /** Seats won in Catalonia, by list code. */
  seats: Record<string, number>;
  /**
   * The four "Residents Absents" rows (CERA: voters registered abroad), which
   * are counted per province and belong to no municipality.
   */
  abroad: RegionalVotes;
}

export interface Mayor {
  /** As the Generalitat's register of local authorities writes it. */
  name: string;
  /** The register's party label, shown only when it matches a 2023 list exactly. */
  party: string;
  /** ISO date the mayor took office. */
  since: string;
}

export interface Municipality {
  /** Five-digit INE code without the check digit, as the election data uses it. */
  code: string;
  /** Six-digit Idescat code (with the check digit). */
  idescat: string;
  slug: string;
  /** Official name in display order: "l'Hospitalet de Llobregat". */
  name: string;
  comarca: string;
  province: string;
  /** Population on 1 January of `sources.population.period`. */
  population: number;
  /** Null when the two official registers disagree or say nothing. */
  mayor: Mayor | null;
  municipal: MunicipalResult;
  congress: RegionalVotes;
  parliament: RegionalVotes;
  /**
   * Congress, 29 Nov 2026, from the Interior Ministry's official file by
   * municipality (`npm run elections:29n -- import`). Votes by the file's own
   * candidacy code. Absent until that file is published and imported.
   */
  g2026?: RegionalVotes;
}

/** A candidacy as the Interior Ministry's file 03 writes it (names verbatim). */
export interface InteriorList extends ListLabel {
  /**
   * "Código de la candidatura cabecera de acumulación a nivel autonómico":
   * the code under which the file adds up a party's provincial candidacies
   * across Catalonia (PP stood as 000048 in Barcelona and 000056 elsewhere in 2023).
   */
  regional: string;
}

/** The imported 29N file: where it came from and Catalonia's totals. */
export interface General2026 {
  /** Polling date as file 02 gives it, ISO. */
  date: string;
  source: {
    name: string;
    publisher: string;
    /** The archive's official name, built from its own members: "02202611_MUNI.zip". */
    file: string;
    /** Latest modification date of the archive's data files, ISO: the file's date. */
    fileDate: string;
    /** SHA-256 of the archive as imported. */
    sha256: string;
    /** Madrid date of the import, ISO. */
    importedAt: string;
  };
  /** Every candidacy in Catalonia's rows, by code. */
  lists: Record<string, InteriorList>;
  /**
   * Catalonia without the vote from abroad: the sum of its municipalities, by
   * regional code. Same basis as the 2023 and 2024 comparisons on the page.
   */
  catalonia: RegionalVotes;
  /** The file's own Catalonia row (vote from abroad included), by regional code. */
  cataloniaTotal: RegionalVotes;
  /** Seats won in Catalonia, by regional code (file 08's Catalonia row). */
  cataloniaSeats: Record<string, number>;
}

export interface SourceRef {
  name: string;
  publisher: string;
  url: string;
  /** The dataset's own last-update date, ISO. */
  updated: string;
}

export interface ElectionsSnapshot {
  /** ISO date the script read every source. */
  readAt: string;
  sources: {
    population: SourceRef & { period: string };
    votes: SourceRef;
    turnout: SourceRef;
    elections: SourceRef;
    entities: SourceRef;
    mayors: SourceRef;
  };
  elections: Record<ElectionKey, ElectionMeta>;
  catalonia: {
    municipal: Counts;
    congress: CataloniaRegional;
    parliament: CataloniaRegional;
  };
  /** Sorted by population, largest first. */
  municipalities: Municipality[];
  /** The 29 Nov 2026 general election, once the Interior Ministry's file is imported. */
  general2026?: General2026;
}
