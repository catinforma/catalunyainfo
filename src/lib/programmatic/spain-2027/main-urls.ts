import type { Region } from "@/lib/programmatic/holidays/boe-2027";
import { GUIDES } from "@/lib/programmatic/holidays/links";

/**
 * One main URL per search intent and language (24 Nov 2026,
 * docs/SEO_EXPERIMENTS.md, "calendario laboral 2027: the hubs answer more,
 * and every page links the main one").
 *
 * - Spain ("calendario laboral 2027", "festivos 2027 [España]"): the hub of
 *   this family, in each language. The day pages link it in their
 *   breadcrumb and footer.
 * - Catalonia ("calendario laboral 2027 cataluña", "festivos 2027
 *   cataluña"): the guide (`GUIDES.workCalendar`), which carries the towns,
 *   the bridges and the month by month. Search Console, 20 Oct-23 Nov 2026:
 *   the guide is the page Google shows for "calendario laboral 2027
 *   catalunya" (position 10) and "calendari laboral 2027 catalunya" (11.3).
 *   The family's lists and the hubs link it with the head anchor.
 *   The community page under /2027/ keeps its title, H1, description and
 *   first lines: it went live on 7 Nov, and they are not touched inside the
 *   28-day window (to 5 Dec). Retitling it as "Catalonia compared with the
 *   rest of Spain" is a candidate for after that date, with data.
 * - Every other community: its page under /2027/. Every city: its own page.
 *
 * No redirect: no two of these pages print the same content.
 * `tests/calendar-2027-main-urls.test.ts` holds the rules.
 */

export type MainLocale = "ca" | "es" | "en";

/** "calendario laboral 2027 [España]", "festivos 2027 [España]". */
export const SPAIN_MAIN: Record<MainLocale, string> = {
  ca: "/ca/festius/2027/",
  es: "/es/festivos/2027/",
  en: "/en/holidays/2027/",
};

/**
 * "puentes 2027 [España]": the Spain-wide long-weekends page. The Catalonia
 * guides (`GUIDES.bridges2027`, `GUIDES.workCalendar`) link it with these
 * words (25 Nov 2026); it links the Catalonia bridges guide back. Different
 * readers, so no merge and no redirect. `tests/owner-links.test.ts` ties the
 * paths to `spainBridgesPath()` and `editionBridgesPath()`.
 */
export const SPAIN_BRIDGES: Record<MainLocale, string> = {
  ca: "/ca/festius/2027/ponts/",
  es: "/es/festivos/2027/puentes/",
  en: "/en/holidays/2027/long-weekends/",
};

/** Communities whose calendar has its main page outside this family, and the anchor every link to it carries. */
const ELSEWHERE: Partial<Record<Region, { paths: Record<MainLocale, string>; anchor: Record<MainLocale, string> }>> = {
  CT: {
    paths: GUIDES.workCalendar,
    anchor: {
      ca: "calendari laboral 2027 de Catalunya",
      es: "calendario laboral 2027 de Cataluña",
      en: "Catalonia public holidays 2027",
    },
  },
};

/** The main page of a community's calendar when it is not its page under /2027/; null for the other eighteen. */
export function mainElsewhere(region: Region, locale: MainLocale): { href: string; anchor: string } | null {
  const main = ELSEWHERE[region];
  return main ? { href: main.paths[locale], anchor: main.anchor[locale] } : null;
}

/** The regions `mainElsewhere` answers for. */
export function regionsWithMainElsewhere(): Region[] {
  return Object.keys(ELSEWHERE) as Region[];
}
