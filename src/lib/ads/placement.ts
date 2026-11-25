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
 *
 * Calculators (owner, 25 Nov 2026: "a les calculadores hi ha molt espai
 * lliure en ordinador, posali mes anuncis"): on desktop their text column
 * (38rem) leaves ~600 px empty on the right, so one or two sticky 300-px
 * rail units go there (CALCULATOR_RAIL_*, .ci-rail* in globals.css). They are
 * out of the text flow, so they never push or cover the calculator or the
 * text, and the page cap is 6 instead of 5 while they are on.
 */

export const MAX_UNITS_PER_PAGE = 5;
/** The cap on a desktop calculator page that carries the right rail. */
export const MAX_UNITS_WITH_RAIL = 6;
/** Rail width in px (the 300x600 "ci-lateral" creative). */
export const RAIL_WIDTH = 300;
/** The rail unit's own label line, padding and rule (px), above its creative. */
export const RAIL_CHROME = 36;
/** Text column height (px) from which a calculator gets one rail unit, and two. */
export const RAIL_MIN_TEXT = 1200;
export const RAIL_TWO_MIN_TEXT = 3200;
/** Viewport width (px) from which the rail fits beside the 38rem column (matches .ci-rail in globals.css, 68.75rem). */
export const RAIL_MIN_VIEWPORT = 1100;
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
export function unitBudget(alreadyOnPage: number, max: number = MAX_UNITS_PER_PAGE): number {
  return Math.max(0, max - alreadyOnPage);
}

/** A calculator tool page (not the hub): /es/calculadoras/<slug>/, /ca/calculadores/<slug>/, /en/calculators/<slug>/. */
export function isCalculatorToolPath(path: string): boolean {
  const clean = path.split(/[?#]/)[0] || "/";
  return /^\/(es\/calculadoras|ca\/calculadores|en\/calculators)\/[^/]+\/?$/.test(clean);
}

/** How many right-rail units a calculator page of this text height gets (0, 1 or 2). */
export function railCount(textHeight: number): 0 | 1 | 2 {
  if (textHeight >= RAIL_TWO_MIN_TEXT) return 2;
  if (textHeight >= RAIL_MIN_TEXT) return 1;
  return 0;
}

/** Height of a rail unit: the 600 px creative, or what the screen leaves under the sticky header (96 px), the unit's label and padding (RAIL_CHROME) and a 24 px margin; null if under 250 px. */
export function railUnitHeight(viewport: number): number | null {
  const room = Math.min(600, viewport - 96 - 24 - RAIL_CHROME);
  return room >= 250 ? room : null;
}
