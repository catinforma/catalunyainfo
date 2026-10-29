import { displayName } from "./copy";
import { SNAPSHOT } from "./data";
import { municipalityPath, type MuniLocale } from "./paths";

/** How many municipalities have a page of their own (100 in tranche 1, 300 since tranche 2). */
export function townPageCount(): number {
  return SNAPSHOT.municipalities.length;
}

/**
 * Markdown links to the holiday pages of the largest municipalities, biggest
 * first, for the guides that send local questions on to the town pages. The
 * first eleven by population include the four provincial capitals.
 */
export function largestTownLinks(locale: MuniLocale, count = 11): string[] {
  return [...SNAPSHOT.municipalities]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, count)
    .map((m) => `[${displayName(m, locale)}](${municipalityPath(locale, m.slug)})`);
}
