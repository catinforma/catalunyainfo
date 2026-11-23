import { isLowDemandPath } from "@/lib/seo/low-demand";

/**
 * Which automatic "Contenido relacionado" cards a page may get (the fill of
 * repository.ts `relatedFill`; hand-picked relations are never filtered).
 *
 * Why (live crawl of 23 Nov 2026, docs/SEO_EXPERIMENTS.md): the fill ranks
 * by text, then category, then entry type, and strike pages are most of the
 * guides, so evergreen pages handed their related cards to strike pages: the
 * Barcelona parking guide to four (the Catalan strikes hub and the 11N pages
 * for Palma, Bilbao and Valladolid), "Lugares sorprendentes de Cataluña" to
 * the 11N Las Palmas and Bilbao pages, the Núria rack railway to three rail
 * strike pages. Most of those targets are past events and the 11N city pages
 * are noindex (lib/seo/low-demand.ts, the owner's decision): links that carry
 * the reader nowhere useful and pass nothing on to an indexed page.
 *
 * Two rules:
 *  1. Never a page that is out of the index (low-demand.ts, date pages past
 *     their grace days): every card should lead to a page Google keeps.
 *  2. A page that is not about a strike gets no strike page from the fill.
 *     Strike pages still fill with each other (they are a cluster), and any
 *     page can still hand-pick one.
 */

/** A strike page's last path segment: "huelga-…", "vaga-…", "…-strike-…", "huelgas-espana", "vagues-espanya", "strikes-spain". */
export const STRIKE_SLUG = /(^|-)(huelgas?|vagues?|vaga|strikes?)(-|$)/i;

/** The last segment of a site path ("/es/guias/huelga-hoy-cataluna/" → "huelga-hoy-cataluna"). */
function lastSegment(path: string): string {
  const parts = path.replace(/[?#].*$/, "").split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export function isStrikePath(path: string): boolean {
  return STRIKE_SLUG.test(lastSegment(path));
}

/** May the fill of the page at `ownPath` show a card for `candidateHref`? */
export function relatedFillAllowed(ownPath: string, candidateHref: string, today?: string): boolean {
  if (isLowDemandPath(candidateHref, today)) return false;
  if (isStrikePath(candidateHref) && !isStrikePath(ownPath)) return false;
  return true;
}

/** Extra rows the fill asks the database for, so the filter still leaves `count` cards. */
export const RELATED_FILL_HEADROOM = 12;
