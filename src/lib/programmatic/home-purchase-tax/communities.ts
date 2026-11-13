import { COMMUNITY_DATA } from "./communities-data";
import type { Community } from "./types";

/**
 * Every territory with its own ITP/AJD rates: the 15 common-regime
 * communities, the Canary Islands (IGIC on new homes), Ceuta and Melilla
 * (state rates with the 50 % bonificación, IPSI on new homes), Navarre and the
 * three Basque territories (their own foral norms).
 *
 * The figures and the words of each law live in communities-data.ts, built
 * from fact packs read in the official consolidated texts (BOE, regional
 * bulletins, the Diputaciones' tax sites) on COMMUNITIES_AS_OF. A territory
 * whose law could not be read is `status: "unverified"`: no figure, only its
 * tax agency's link.
 */

export { COMMUNITIES_AS_OF, COMMUNITIES_REREAD_BY } from "./as-of";

export const COMMUNITIES: readonly Community[] = COMMUNITY_DATA;

/** The data the browser needs: the same rates and conditions, without the law's quotes. */
export function clientCommunities(): Community[] {
  return COMMUNITIES.map((c) => ({
    ...c,
    law: c.law ? { ...c.law, title: "" } : null,
    amendments: [],
    itp: c.itp ? { ...c.itp, quote: "" } : null,
    ajd: c.ajd ? { ...c.ajd, quote: "" } : null,
    benefits: c.benefits.map((b) => ({ ...b, quote: "" })),
    newHome: { ...c.newHome, quote: "", law: null },
    notes: [],
  }));
}
