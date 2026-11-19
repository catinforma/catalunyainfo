import { COMMUNITY_DATA } from "./communities-data";
import type { Community, HtClientData, HtLocale } from "./types";

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

/**
 * Where the calculator fetches clientCommunities() from on its first
 * interaction (app/data/impuestos-compra-vivienda.json/route.ts). The page
 * itself carries only the example's community and the list of names: passed
 * as props, the 21 territories' rates and conditions in three languages were
 * ~160 KB of the page's RSC payload that most readers never use.
 */
export const HT_DATA_PATH = "/data/impuestos-compra-vivienda.json";

export function htClientData(): HtClientData {
  return { schema: 1, communities: clientCommunities() };
}

/** The calculator's <select>: id and name in the page's language, sorted on the server (the browser's collation may differ). */
export function communityOptions(locale: HtLocale): { id: string; name: string }[] {
  return COMMUNITIES.map((c) => ({ id: c.id, name: c.name[locale] })).sort((a, b) => a.name.localeCompare(b.name, locale));
}

/** One community as the browser gets it (the calculator's first render: the example's). */
export function clientCommunity(id: string): Community {
  const found = clientCommunities().find((c) => c.id === id);
  if (!found) throw new Error(`no home-purchase-tax community "${id}"`);
  return found;
}

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
