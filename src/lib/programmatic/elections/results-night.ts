import type { Locale } from "@/lib/i18n/config";

import type { ElectionDayPhase } from "./election-day";

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
 *
 * Checked again 18 Nov 2026 (curl + grep "resultado"): 29neleccionesgenerales.es
 * home page, its "Enlaces de interés" page (links to infoelectoral, INE,
 * JEC, BOE, Correos, Congreso, Senado, mivotocuenta.es; no results site) and
 * its sitemap.xml (6 URLs, all lastmod 2026-11-03): no results page, link or
 * announcement. lamoncloa.gob.es timed out from this server and
 * interior.gob.es / infoelectoral.interior.gob.es answered 403 (bot
 * challenge), so Interior's press notes were not read that day: re-read them
 * from a browser on or after 26 Nov (the test below fails until then).
 *
 * Checked 24 Nov 2026, 19:58 and 20:09 UTC (curl): 29neleccionesgenerales.es
 * home page and /es/sitemap.xml answered 200 (no results page, link or note;
 * sitemap newest lastmod 2026-11-03); lamoncloa.gob.es's Interior press list
 * answered 200 (newest notes: police operation 24 Nov, basic guide 20 Oct, postal
 * and abroad voting; none about results or the media repository);
 * interior.gob.es and infoelectoral.interior.gob.es answered 403 (bot
 * challenge) every time, so their notes were still not read: the 26 Nov
 * re-read from a browser stays due. RESULTS_SITE_CHECKED is that 24 Nov read
 * (the sites it could read), not a read of Interior's own notes.
 * resultados.29neleccionesgenerales.es answers 401 (Basic auth): not public,
 * not announced, not linked.
 * The election-day layer (election-day.ts) prints this switch as a button
 * from 20:00 on 29 Nov.
 */
export const ELECTION_NIGHT_RESULTS_URL: string | null = null;

/** The official note or page that names the results site; required once the URL is set. */
export const ELECTION_NIGHT_RESULTS_SOURCE: string | null = null;

/** When the official sites were last read for it. */
export const RESULTS_SITE_CHECKED = "2026-11-24";

/** Hosts an announcement may come from (the results site itself may be on another domain). */
export const RESULTS_ANNOUNCEMENT_HOSTS = ["lamoncloa.gob.es", "interior.gob.es", "29neleccionesgenerales.es"] as const;

const MONTHS: Record<Locale, string[]> = {
  ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

/** An ISO date (YYYY-MM-DD) as the page writes it: "18 de novembre de 2026", "18 de noviembre de 2026", "18 November 2026". */
export function checkedDay(locale: Locale, iso: string): string {
  const day = Number(iso.slice(8, 10));
  const month = MONTHS[locale][Number(iso.slice(5, 7)) - 1];
  const year = iso.slice(0, 4);
  return locale === "en" ? `${day} ${month} ${year}` : `${day} de ${month} de ${year}`;
}

/**
 * Where a reader goes while no results site is announced. What was actually
 * read, with the dates (curl from this server):
 *  - 24 Nov 2026, 19:58 and 20:09 UTC: 29neleccionesgenerales.es, Interior's
 *    election site, HTTP 200 on the home page and on /es/sitemap.xml (324 URLs,
 *    newest lastmod 2026-11-03); its "Enlaces de interés" page lists
 *    Infoelectoral (https://infoelectoral.interior.gob.es/), the INE, the JEC and the BOE;
 *    no results page, link or note in any of them. A later read by the
 *    reviewer got HTTP 403 (CloudFront) from the same address, so the site
 *    answers scripts intermittently: re-read it from a browser;
 *  - same day: Infoelectoral answered 403 (Cloudflare challenge) every time,
 *    so nothing on it was read; the address is the one Interior's own site links.
 * The links say what they are (the election site, the data portal): neither is
 * presented as the results site.
 */
export const OFFICIAL_ELECTION_SITE = "https://29neleccionesgenerales.es/";
export const INFOELECTORAL = "https://infoelectoral.interior.gob.es/";

/**
 * "Results site: pending", when it was last looked for, and the official
 * places to look meanwhile: ONE line per language, present tense. `tail` is an
 * optional Markdown sentence appended (the page's own guide link).
 */
export function pendingSiteLine(locale: Locale, tail = "", checked: string = checkedDay(locale, RESULTS_SITE_CHECKED)): string {
  const end = tail ? ` ${tail}` : "";
  if (locale === "ca") {
    return `**Web oficial de resultats: pendent d'anunci** (comprovat el ${checked}). Mentrestant, la informació oficial és al [web de les eleccions del Ministeri de l'Interior](${OFFICIAL_ELECTION_SITE}) i a [Infoelectoral](${INFOELECTORAL}), el seu portal de dades electorals.${end}`;
  }
  if (locale === "es") {
    return `**Web oficial de resultados: pendiente de anuncio** (comprobado el ${checked}). Mientras tanto, la información oficial está en la [web de las elecciones del Ministerio del Interior](${OFFICIAL_ELECTION_SITE}) y en [Infoelectoral](${INFOELECTORAL}), su portal de datos electorales.${end}`;
  }
  return `**Official results site: pending announcement** (checked on ${checked}). Meanwhile the official information is on the [Interior Ministry's election site](${OFFICIAL_ELECTION_SITE}) and on [Infoelectoral](${INFOELECTORAL}), its election-data portal.${end}`;
}

/**
 * The general count as the law dates it, for the lines printed after the
 * night. LOREG, BOE consolidated text (BOE-A-1985-11672, read 24 Nov 2026):
 *  - art. 103.1: "El escrutinio general se realiza el quinto día siguiente al de
 *    la votación, por la Junta Electoral que corresponda" (the fifth day after
 *    Sunday 29 Nov is Friday 4 Dec);
 *  - art. 107.2: "El escrutinio deberá concluir no más tarde del octavo día
 *    posterior al de las elecciones" (Monday 7 Dec);
 *  - art. 108.4: once the claims period is over, or the Central Electoral Board
 *    has ruled on them, the boards proclaim the elected members "dentro del día
 *    siguiente";
 *  - art. 108.6: the Central Electoral Board "en el periodo de cuarenta días,
 *    procederá a la publicación en el «Boletín Oficial del Estado» los
 *    resultados generales y por circunscripciones";
 *  - art. 98.2: a copy of each table's count sheet goes to the person the
 *    Administration designates, "a los solos efectos de facilitar la información
 *    provisional sobre los resultados de la elección que ha de proporcionar el
 *    Gobierno".
 * The ticket that queued this said the count starts "from the third day"; the
 * text says the fifth (the JEC calendar's 4-7 Dec is the same reading).
 */

/**
 * One paragraph per phase, Markdown. Up to and including the night it is true
 * on any day before the vote: when the night's figures come out, who publishes
 * them, that they are provisional, and when they become official; the link is
 * there only once the switch above is set. From Mon 30 Nov ("after") it is in
 * the past tense about the night and says the final result is pending; from
 * Tue 8 Dec ("over") the count is past too, with no promise, no figure and no
 * link that claims to show results. No claim depends on a data import: the
 * pages that print it add their own "results will appear here" line only while
 * the 29N file is not in.
 */
export function resultsNightLine(locale: Locale, url: string | null = ELECTION_NIGHT_RESULTS_URL, phase: ElectionDayPhase = "before"): string {
  if (phase === "after") return afterLine(locale, url);
  if (phase === "over") return overLine(locale);
  if (locale === "ca") {
    return url
      ? `**Resultats del 29N:** la votació acaba a les 20:00 (a les Canàries, a les 21:00 hora peninsular) i el Ministeri de l'Interior publica l'escrutini provisional aquella mateixa nit, a mesura que es compten les meses, al seu [web oficial de resultats](${url}). Són provisionals: els oficials surten de l'escrutini general de les juntes electorals provincials, del 4 al 7 de desembre, i es publiquen al BOE.`
      : `**Resultats del 29N:** la votació acaba a les 20:00 (a les Canàries, a les 21:00 hora peninsular) i el Ministeri de l'Interior publica l'escrutini provisional aquella mateixa nit, a mesura que es compten les meses. Encara no ha anunciat el web on el publicarà (comprovat el ${checkedDay("ca", RESULTS_SITE_CHECKED)}); hi enllaçarem el web oficial quan ho faci. Els resultats oficials surten de l'escrutini general de les juntes electorals provincials, del 4 al 7 de desembre, i es publiquen al BOE.`;
  }
  if (locale === "es") {
    return url
      ? `**Resultados del 29N:** la votación termina a las 20:00 (en Canarias, a las 21:00 hora peninsular) y el Ministerio del Interior publica el escrutinio provisional esa misma noche, a medida que se cuentan las mesas, en su [web oficial de resultados](${url}). Son provisionales: los oficiales salen del escrutinio general de las juntas electorales provinciales, del 4 al 7 de diciembre, y se publican en el BOE.`
      : `**Resultados del 29N:** la votación termina a las 20:00 (en Canarias, a las 21:00 hora peninsular) y el Ministerio del Interior publica el escrutinio provisional esa misma noche, a medida que se cuentan las mesas. Aún no ha anunciado la web donde lo publicará (comprobado el ${checkedDay("es", RESULTS_SITE_CHECKED)}); enlazaremos la web oficial cuando lo haga. Los resultados oficiales salen del escrutinio general de las juntas electorales provinciales, del 4 al 7 de diciembre, y se publican en el BOE.`;
  }
  return url
    ? `**Results of 29 November:** voting ends at 20:00 (21:00 peninsular time in the Canary Islands) and the Spanish Ministry of the Interior publishes the provisional count the same night, as tables are counted, on its [official results site](${url}). These figures are provisional: the official result comes from the provincial electoral boards' general count, 4 to 7 December, and is published in the BOE.`
    : `**Results of 29 November:** voting ends at 20:00 (21:00 peninsular time in the Canary Islands) and the Spanish Ministry of the Interior publishes the provisional count the same night, as tables are counted. It has not yet announced the website it will use (checked on ${checkedDay("en", RESULTS_SITE_CHECKED)}); we will link the official site once it does. The official result comes from the provincial electoral boards' general count, 4 to 7 December, and is published in the BOE.`;
}

/** 30 Nov to 7 Dec: the night's figures were provisional; the official result is the general count's and is pending. */
function afterLine(locale: Locale, url: string | null): string {
  if (locale === "ca") {
    return `**Resultats del 29N:** els de la nit electoral eren provisionals: el Govern els dona a partir de les còpies de les actes de les meses, abans de l'escrutini general (LOREG, article 98.2)${url ? `; el Ministeri de l'Interior els publica al seu [web oficial de resultats](${url})` : ""}. El resultat oficial és el de l'escrutini general de les juntes electorals provincials, que es fa el cinquè dia després de la votació, el divendres 4 de desembre, i ha d'acabar com a molt tard el dilluns 7 (articles 103 i 107); després es proclamen els electes i la Junta Electoral Central publica al BOE els resultats, en un termini de quaranta dies (article 108). **Resultat oficial definitiu: pendent.**`;
  }
  if (locale === "es") {
    return `**Resultados del 29N:** los de la noche electoral eran provisionales: el Gobierno los da a partir de las copias de las actas de las mesas, antes del escrutinio general (LOREG, artículo 98.2)${url ? `; el Ministerio del Interior los publica en su [web oficial de resultados](${url})` : ""}. El resultado oficial es el del escrutinio general de las juntas electorales provinciales, que se hace el quinto día siguiente a la votación, el viernes 4 de diciembre, y debe concluir a más tardar el lunes 7 (artículos 103 y 107); después se proclaman los electos y la Junta Electoral Central publica en el BOE los resultados, en el plazo de cuarenta días (artículo 108). **Resultado oficial definitivo: pendiente.**`;
  }
  return `**Results of 29 November:** the election-night figures were provisional: the Government gives them from copies of the polling tables' count sheets, before the general count (electoral law, article 98.2)${url ? `; the Interior Ministry publishes them on its [official results site](${url})` : ""}. The official result is the general count of the provincial electoral boards, held on the fifth day after the vote, Friday 4 December, and due to finish no later than Monday 7 December (articles 103 and 107); then the elected members are proclaimed and the Central Electoral Board publishes the results in the BOE within forty days (article 108). **Final official result: pending.**`;
}

/** From 8 Dec: all past; the stopgap official links say what they are (the election site, the data portal), not "results". */
function overLine(locale: Locale): string {
  if (locale === "ca") {
    return `**Resultats del 29N:** la votació va ser el diumenge 29 de novembre de 2026. Els resultats de la nit electoral eren provisionals; l'oficial és el de l'escrutini general de les juntes electorals provincials, que havia de començar el 4 de desembre i acabar com a molt tard el 7 (LOREG, articles 103 i 107), i que la Junta Electoral Central publica al BOE en un termini de quaranta dies (article 108). La informació oficial és al [web de les eleccions del Ministeri de l'Interior](${OFFICIAL_ELECTION_SITE}) i a [Infoelectoral](${INFOELECTORAL}), el seu portal de dades electorals.`;
  }
  if (locale === "es") {
    return `**Resultados del 29N:** la votación fue el domingo 29 de noviembre de 2026. Los resultados de la noche electoral eran provisionales; el oficial es el del escrutinio general de las juntas electorales provinciales, que debía empezar el 4 de diciembre y concluir a más tardar el 7 (LOREG, artículos 103 y 107), y que la Junta Electoral Central publica en el BOE en el plazo de cuarenta días (artículo 108). La información oficial está en la [web de las elecciones del Ministerio del Interior](${OFFICIAL_ELECTION_SITE}) y en [Infoelectoral](${INFOELECTORAL}), su portal de datos electorales.`;
  }
  return `**Results of 29 November:** voting took place on Sunday 29 November 2026. The election-night figures were provisional; the official result is the general count of the provincial electoral boards, which was due to begin on 4 December and to finish no later than 7 December (electoral law, articles 103 and 107), and which the Central Electoral Board publishes in the BOE within forty days (article 108). The official information is on the [Interior Ministry's election site](${OFFICIAL_ELECTION_SITE}) and on [Infoelectoral](${INFOELECTORAL}), its election-data portal.`;
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
