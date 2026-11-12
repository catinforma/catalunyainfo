import type { Locale } from "@/lib/i18n/config";

/**
 * Results night, 29 November 2026: the ONE switch for the official results
 * site, read by the town pages, the elections hubs, the election-night guide,
 * the general-election results guide and the sitewide strip (13 Nov 2026,
 * docs/SEO_EXPERIMENTS.md, "13 Nov 2026 — 29N results night").
 *
 * Who publishes what (LOREG, BOE consolidated text, read 13 Nov 2026):
 *  - on the night, the Government gives "información provisional sobre los
 *    resultados" from a copy of each table's count sheet (art. 98.2): the
 *    Ministerio del Interior's provisional count. Voting ends at 20:00
 *    (art. 88.1; Canary Islands 21:00 peninsular time);
 *  - the official result comes from the general count of the provincial
 *    boards (4-7 Dec, JEC 29N calendar) and is published in the BOE;
 *  - the Generalitat runs no count of its own for a general election.
 *
 * How to switch it on, when (and only when) Interior names its public
 * results site in an official note or on its own election site:
 *  1. set ELECTION_NIGHT_RESULTS_URL to the address exactly as the note gives
 *     it, and ELECTION_NIGHT_RESULTS_SOURCE to the note itself (lamoncloa.gob.es,
 *     interior.gob.es or 29neleccionesgenerales.es; a test holds both);
 *  2. curl the address and grep it for "resultados" before committing;
 *  3. npm test, deploy, then publish the guides that print it:
 *     `election-night election-results voting`.
 * Never guessed from earlier elections' domains, never scraped, no figure
 * copied from it: pages link to it, nothing more.
 *
 * Checked 13 Nov 2026: 29neleccionesgenerales.es (home page: no results
 * page or link; its menu has calendars, how to vote, polling-station and
 * candidacy pages only) and infoelectoral.interior.gob.es (403 to scripts
 * that day). Interior's 21 Oct note on the "dispositivo de recepción de
 * resultados" describes a repository for accredited media only, not a public
 * site.
 */
export const ELECTION_NIGHT_RESULTS_URL: string | null = null;

/** The official note or page that names the results site; required once the URL is set. */
export const ELECTION_NIGHT_RESULTS_SOURCE: string | null = null;

/** When the official sites were last read for it. */
export const RESULTS_SITE_CHECKED = "2026-11-13";

/** Hosts an announcement may come from (the results site itself may be on another domain). */
export const RESULTS_ANNOUNCEMENT_HOSTS = ["lamoncloa.gob.es", "interior.gob.es", "29neleccionesgenerales.es"] as const;

const CHECKED_LABEL: Record<Locale, string> = {
  ca: "13 de novembre de 2026",
  es: "13 de noviembre de 2026",
  en: "13 November 2026",
};

/**
 * One paragraph, true on any day from now to the BOE publication (static
 * pages are built once per deploy): when the night's figures come out, who
 * publishes them, that they are provisional, and when they become official.
 * Markdown; the link is there only once the switch above is set.
 */
export function resultsNightLine(locale: Locale, url: string | null = ELECTION_NIGHT_RESULTS_URL): string {
  if (locale === "ca") {
    return url
      ? `**Resultats del 29N:** la votació acaba a les 20:00 (a les Canàries, a les 21:00 hora peninsular) i el Ministeri de l'Interior publica l'escrutini provisional aquella mateixa nit, a mesura que es compten les meses, al seu [web oficial de resultats](${url}). Són provisionals: els oficials surten de l'escrutini general de les juntes electorals provincials, del 4 al 7 de desembre, i es publiquen al BOE.`
      : `**Resultats del 29N:** la votació acaba a les 20:00 (a les Canàries, a les 21:00 hora peninsular) i el Ministeri de l'Interior publica l'escrutini provisional aquella mateixa nit, a mesura que es compten les meses. Encara no ha anunciat el web on el publicarà (comprovat el ${CHECKED_LABEL.ca}); hi enllaçarem el web oficial quan ho faci. Els resultats oficials surten de l'escrutini general de les juntes electorals provincials, del 4 al 7 de desembre, i es publiquen al BOE.`;
  }
  if (locale === "es") {
    return url
      ? `**Resultados del 29N:** la votación termina a las 20:00 (en Canarias, a las 21:00 hora peninsular) y el Ministerio del Interior publica el escrutinio provisional esa misma noche, a medida que se cuentan las mesas, en su [web oficial de resultados](${url}). Son provisionales: los oficiales salen del escrutinio general de las juntas electorales provinciales, del 4 al 7 de diciembre, y se publican en el BOE.`
      : `**Resultados del 29N:** la votación termina a las 20:00 (en Canarias, a las 21:00 hora peninsular) y el Ministerio del Interior publica el escrutinio provisional esa misma noche, a medida que se cuentan las mesas. Aún no ha anunciado la web donde lo publicará (comprobado el ${CHECKED_LABEL.es}); enlazaremos la web oficial cuando lo haga. Los resultados oficiales salen del escrutinio general de las juntas electorales provinciales, del 4 al 7 de diciembre, y se publican en el BOE.`;
  }
  return url
    ? `**Results of 29 November:** voting ends at 20:00 (21:00 peninsular time in the Canary Islands) and the Spanish Ministry of the Interior publishes the provisional count the same night, as tables are counted, on its [official results site](${url}). These figures are provisional: the official result comes from the provincial electoral boards' general count, 4 to 7 December, and is published in the BOE.`
    : `**Results of 29 November:** voting ends at 20:00 (21:00 peninsular time in the Canary Islands) and the Spanish Ministry of the Interior publishes the provisional count the same night, as tables are counted. It has not yet announced the website it will use (checked on ${CHECKED_LABEL.en}); we will link the official site once it does. The official result comes from the provincial electoral boards' general count, 4 to 7 December, and is published in the BOE.`;
}

/** Is `url` on one of the hosts an announcement may come from? */
export function isAnnouncementHost(url: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return false;
  }
  return RESULTS_ANNOUNCEMENT_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}
