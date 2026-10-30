/**
 * Corrections to the fairs calendar (`vm32-przc`): the organiser wins.
 *
 * The weekend pages list the Generalitat's fairs calendar as the snapshot
 * stores it. When an organiser's own official page (the council, the
 * organising association) gives other dates for the same fair, the pages show
 * the organiser's dates and say which dates the calendar gives, the way the
 * holiday pages let the DOGC order win over the open data. The snapshot itself
 * is never edited: the correction is applied when the pages read it, so a
 * rebuilt snapshot keeps it, and once the calendar agrees the correction is a
 * no-op (the note disappears because the dates no longer differ).
 *
 * Sources, in order:
 *   1. the Christmas fairs family's organiser list (`christmas-fairs/
 *      organisers.ts`): every entry with `replaces: "vm32:<id>"` was read on
 *      the organiser's page and corrects that calendar row. Reused here so the
 *      two families cannot disagree;
 *   2. `EXTRA`, below, for fairs outside the Christmas season. Add an entry
 *      only from the organiser's own page, with the day it was read and the
 *      sentence that gives the dates; never from a listing site or the press.
 *
 * Read on 30 Oct 2026: Canyelles' council page says "La 24a edició de la Fira
 * de Santa Llúcia se celebra el 21 i 22 de novembre de 2026"; the calendar
 * (updated 25 Sep 2026) gives 28-29 Nov (row 24033377).
 */

import { ORGANISER_FAIRS } from "@/lib/programmatic/christmas-fairs/organisers";

import type { FairCorrection, SnapshotFair } from "./types";

/** A correction keyed by the calendar row it replaces (`id_activitats_firals`). */
export interface CalendarCorrection {
  /** `id_activitats_firals` of the calendar row. */
  id: string;
  start: string;
  end: string;
  url: string;
  publisher: string;
  /** Day the organiser's page was read (Europe/Madrid). */
  readOn: string;
  /** The sentence that gives the dates, verbatim. */
  quote: string;
}

/** Corrections for fairs the Christmas family does not cover. None on 30 Oct 2026. */
const EXTRA: readonly CalendarCorrection[] = [];

const FROM_CHRISTMAS: CalendarCorrection[] = ORGANISER_FAIRS.filter((o) => o.replaces?.startsWith("vm32:")).map((o) => ({
  id: o.replaces!.slice("vm32:".length),
  start: o.start,
  end: o.end,
  url: o.url,
  publisher: o.publisher,
  readOn: o.readOn,
  quote: o.quote,
}));

export const FAIR_CORRECTIONS: readonly CalendarCorrection[] = [...FROM_CHRISTMAS, ...EXTRA];

/** The snapshot script's order (scripts/weekend-snapshot.ts). */
const byStart = (a: SnapshotFair, b: SnapshotFair) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end) || a.name.localeCompare(b.name, "ca");

/**
 * The calendar's fairs with the organisers' corrections applied, re-sorted by
 * date (a corrected fair can move ahead of others). A corrected row takes the
 * organiser's dates and page, and keeps the calendar's dates in `corrected`
 * so the page can say what the calendar gives. Rows the correction moves to
 * before `readOn` drop out, like any past fair. Pure.
 */
export function applyFairCorrections(fairs: readonly SnapshotFair[], corrections: readonly CalendarCorrection[], readOn: string): SnapshotFair[] {
  const byId = new Map(corrections.map((c) => [c.id, c]));
  return fairs
    .map((f): SnapshotFair => {
      const c = byId.get(f.id);
      if (!c || (c.start === f.start && c.end === f.end)) return f;
      const corrected: FairCorrection = { start: f.start, end: f.end, url: c.url, publisher: c.publisher, readOn: c.readOn, quote: c.quote };
      return { ...f, start: c.start, end: c.end, web: c.url, toConfirm: false, corrected };
    })
    .filter((f) => f.end >= readOn)
    .sort(byStart);
}
