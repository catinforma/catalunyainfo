/**
 * Shapes of the Christmas fairs family.
 *
 * One committed file, `snapshot.json`, written only by
 * `scripts/christmas-fairs-snapshot.ts` from two official open datasets:
 *
 *   - the fairs calendar (`vm32-przc`, Departament d'Empresa i Treball): the
 *     fairs registered for the season whose name says Christmas (`classify.ts`),
 *     with the place and the organiser's website exactly as registered;
 *   - the cultural agenda (`rhpv-yr4f`, Departament de Cultura): its fairs and
 *     markets whose title says Christmas (none on 30 Oct 2026; organisers add
 *     them through November, which is why the snapshot is rebuilt weekly).
 *
 * A third, hand-kept list, `organisers.ts`, adds what an organiser has
 * published on its own official page and the open data does not carry (or
 * carries with other dates): each entry with its URL, the date it was read and
 * the sentence that gives the dates. Pages merge the two in `data.ts`.
 */

import type { SnapshotSource } from "@/lib/programmatic/weekend/types";

export type { SnapshotSource };

/** Where a fair's dates come from. */
export type FairSource = "fairs" | "agenda" | "organiser";

export interface SnapshotChristmasFair {
  /** "vm32:<id_activitats_firals>" or "agenda:<codi>". */
  id: string;
  source: Exclude<FairSource, "organiser">;
  /** As the organiser registered it (Catalan): a proper name, shown in every language. */
  name: string;
  /** The calendar's Spanish rendering (`nom_castellano`), when it has one. */
  nameEs: string | null;
  /** INE code of the municipality, five digits. */
  ine: string;
  /** ISO dates. */
  start: string;
  end: string;
  /** `ubicaci` (fairs) or `espai` (agenda), as written; null when empty. */
  place: string | null;
  /** Organiser's website (fairs) or the activity's page (agenda), https; null when missing. */
  web: string | null;
  /**
   * True when the calendar's website did not lead to the organiser when the
   * snapshot was built, and `web` is the council's own site instead
   * (`WEB_REPLACEMENTS` in rows.ts).
   */
  webReplaced: boolean;
  /** `organitzador_firal`, as registered. */
  organiser: string | null;
  /** `any_primera_edici`: the year of the first edition, when the calendar gives one. */
  since: number | null;
  /** `dates_a_confirmar` = "Sí". Such a fair is listed but does not give its town a page. */
  toConfirm: boolean;
}

export interface ChristmasSnapshot {
  /** Day the sources were read (Europe/Madrid): the "last checked" date the pages print. */
  readOn: string;
  /** The season the snapshot covers: fairs overlapping [from, to]. */
  season: { from: string; to: string };
  sources: { fairs: SnapshotSource; agenda: SnapshotSource };
  /** What the script measured, for the record and the report. */
  measured: {
    /** Rows in the fairs calendar, of any kind and date. */
    fairRows: number;
    /** Of those, with a Christmas name, any date. */
    fairChristmas: number;
    /** Agenda rows read for the season (any kind). */
    agendaRows: number;
    /** Of those, Christmas fairs or markets. */
    agendaChristmas: number;
  };
  /** Season fairs from the two datasets, in date order. */
  fairs: SnapshotChristmasFair[];
}

/** An organiser's own announcement, read by hand on its official page. */
export interface OrganiserFair {
  /** "org:<town-slug>-<short>": stable, used as the React key and in tests. */
  id: string;
  ine: string;
  /** As the organiser writes it. */
  name: string;
  start: string;
  end: string;
  /** As the organiser writes it; null when the page names no place. */
  place: string | null;
  url: string;
  publisher: string;
  /** Day the page was read (Europe/Madrid). */
  readOn: string;
  /** The sentence that gives the dates, verbatim. */
  quote: string;
  /** The calendar's fair this announcement corrects (its snapshot id), when the dates differ. */
  replaces?: string;
}

/** A market people search for whose dates for this season are not published yet. */
export interface PendingMarket {
  id: string;
  ine: string;
  name: string;
  url: string;
  publisher: string;
  readOn: string;
  /** What the official page shows today, per locale (one short sentence). */
  shows: { ca: string; es: string; en: string };
}

/** One fair as the pages show it: a calendar or agenda row, or an organiser's announcement. */
export interface Fair {
  id: string;
  source: FairSource;
  name: string;
  nameEs: string | null;
  ine: string;
  start: string;
  end: string;
  place: string | null;
  web: string | null;
  webReplaced: boolean;
  organiser: string | null;
  since: number | null;
  toConfirm: boolean;
  /** Set when the dates come from (or were checked on) an organiser's page. */
  checked: { url: string; publisher: string; readOn: string; quote: string } | null;
  /** The calendar's dates, when an organiser's page gives others (the page's are shown). */
  datasetDates: { start: string; end: string } | null;
}
