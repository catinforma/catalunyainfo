import type { Locale } from "@/lib/i18n/config";
import { SNAPSHOT } from "@/lib/programmatic/holidays/data";
import { nameKey } from "@/lib/programmatic/holidays/dogc";
import { esName } from "@/lib/programmatic/holidays/names";

import { TOWNS_NOV_DEC } from "./shops";
import { windowDaysFromDiff } from "./shops-christmas";

/**
 * Every municipality of Catalonia with its shop opening days from 29 November
 * to 31 December 2026, for the shops guide's searchable table (the
 * `shopsChristmas` block).
 *
 * The 947 names are the holiday snapshot's 917 municipalities with a page plus
 * the 30 the local-holiday order leaves without days (`excluded`): together,
 * every council in Catalonia. The days are the default of Resolució
 * EMT/4342/2025 unless the town is in TOWNS_NOV_DEC, which a test holds to the
 * DOGC text (tests/batch02.test.ts) and to the snapshot (tests/shops-christmas.test.ts).
 */

/** Councils the resolution lists by name (counted in the DOGC text on 5 Nov 2026; a test re-counts them). */
export const RESOLUTION_COUNCILS = 77;

export interface ChristmasTownRow {
  /** Official name, article first ("l'Hospitalet de Llobregat"). */
  name: string;
  /** Opening days in the window, ISO. */
  open: string[];
  /** Default days the council swapped away, ISO. */
  swapped: string[];
}

/** Sort key: the name without its leading article, so "l'Hospitalet" sits under H. */
function sortKey(name: string): string {
  return name.replace(/^(el|la|els|les|es)\s+/i, "").replace(/^l'/i, "");
}

export function christmasTownRows(): ChristmasTownRow[] {
  const diffs = new Map(TOWNS_NOV_DEC.map((t) => [nameKey(t.town), t]));
  const names = [...SNAPSHOT.municipalities.map((m) => m.name), ...SNAPSHOT.excluded.map((e) => e.name)];
  return names
    .map((name) => ({ name, ...windowDaysFromDiff(diffs.get(nameKey(name))) }))
    .sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name), "ca"));
}

/** The name as the table prints it: Spanish and English capitalise the article. */
export function townLabel(name: string, locale: Locale): string {
  return locale === "ca" ? name : esName(name);
}
