/**
 * Where the in-article units go (components/AdsRuntime.tsx measures the page
 * and asks this; it has no DOM access, so the rules are testable).
 *
 * Owner, 24 Nov 2026: more ads, even if they annoy. The limits that stay:
 * - at most MAX_UNITS_PER_PAGE units in all (server top slot, in-article,
 *   end, desktop sidebar);
 * - a unit every ~2 screens in the article, never closer than 0.75 of a
 *   screen of text to any other unit;
 * - only before an H2 that is a direct child of the article body, so never
 *   inside a table, a list or a block, and never before the sources heading
 *   (the caller passes only the headings above it);
 * - the first one after the first section and past half a screen, so the
 *   answer is read first.
 */

export const MAX_UNITS_PER_PAGE = 5;
/** Least text between a unit and the next one, in screens. */
export const MIN_GAP_SCREENS = 0.75;
/** Target distance between two in-article units, top to top, in screens. */
export const PITCH_SCREENS = 2;
/** Height a placed unit takes (min-height 280 + its margins), in px. */
export const UNIT_HEIGHT = 360;

export interface UnitBox {
  top: number;
  bottom: number;
}

/**
 * Indexes (into `headings`, their tops in px before any unit is inserted) of
 * the H2s that get an in-article unit in front of them.
 *
 * @param headings top of each candidate H2, in page order, sources excluded
 * @param units units already on the page (server slot, end unit), same frame
 * @param budget how many more units the page may take
 */
export function planInArticle({
  headings,
  units,
  viewport,
  budget,
}: {
  headings: readonly number[];
  units: readonly UnitBox[];
  viewport: number;
  budget: number;
}): number[] {
  const chosen: number[] = [];
  const need = MIN_GAP_SCREENS * viewport;
  // Content between two in-article units so that their tops are ~2 screens apart.
  const pitch = Math.max(need, PITCH_SCREENS * viewport - UNIT_HEIGHT);
  let lastTop = -Infinity;
  // The first unit goes after the first section (the second H2), never above it.
  for (let i = 1; i < headings.length && chosen.length < budget; i++) {
    const top = headings[i]!;
    // Units already inserted above push this heading down by their height.
    const shown = top + chosen.length * UNIT_HEIGHT;
    if (shown <= viewport * 0.5) continue;
    if (top - lastTop < pitch) continue;
    const clear = units.every((u) => (u.top >= top ? u.top - top >= need : top - u.bottom >= need));
    if (!clear) continue;
    chosen.push(i);
    lastTop = top;
  }
  return chosen;
}

/** Units the page can still take after the ones it already has. */
export function unitBudget(alreadyOnPage: number): number {
  return Math.max(0, MAX_UNITS_PER_PAGE - alreadyOnPage);
}
