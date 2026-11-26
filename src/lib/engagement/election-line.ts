import { B2_TITLES, b2href, type B2Key } from "@/lib/content/batch02/shared";
import { slugifyAnchor } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { electionPhase, type ElectionDayPhase } from "@/lib/programmatic/elections/election-day";
import { hubPath } from "@/lib/programmatic/elections/paths";

import { CATALONIA_STRIKE_KEYS, SPAIN_STRIKE_KEYS, STRIKE_11N_SPAIN_KEY_PREFIX, b2KeyForHref, votingWhereStep } from "./next-step";
import type { NextStepLink } from "./next-step-core";

/**
 * "Elecciones generales del 29N" one-line box (26 Nov 2026, batch 5A): the
 * pages most people land on this week (the 26N strike pages, 72 % of last
 * week's clicks; huelga-hoy-cataluna; the December bridge guide; the 7 Dec
 * date pages) had no link to the election pages, which hold the highest CTR
 * on the site this week (/es/elecciones/ 9.9 %, /ca/eleccions/ 4.9 %,
 * GSC 13-26 Nov) and answer what those readers ask next ("where do I vote?").
 *
 * Rules:
 *  - Links only. The one fact is the polling hours, 9:00-20:00 (LOREG
 *    art. 84.1, as pinned in programmatic/elections/election-day.ts and used
 *    by the weekend note, programmatic/weekend/election-note.ts).
 *  - Up to polling time: the town finder (the hub: every town page lists its
 *    polling places), the how-to-vote guide's "where do I vote" section and,
 *    on holiday pages, the shops guide's "Sunday 29, election day" section.
 *    From the close of the polls (29 Nov 20:00, phase `count`) to 7 Dec: the
 *    results by town and the election-night guide. From 8 Dec (phase `over`):
 *    nothing. Phases by the render clock (the content pages revalidate daily,
 *    the date pages at each deploy), so the wording before the vote is
 *    written to read correctly on the Monday too.
 *  - Rendered by the templates (EntryArticle, holidays/DatePage), never stored
 *    in a body. Clicks: `related_content_click`, `link_context: "election_line"`.
 *  - REREAD_BY 2026-12-08: tests/election-line.test.ts fails from then until
 *    this module and its two call sites are removed.
 */

export const ELECTION_LINE_REMOVE_BY = "2026-12-08";

export interface ElectionLine {
  text: string;
  links: NextStepLink[];
}

/** The December holiday guide (puente-diciembre-cataluna) also gets the shops link; the strike pages do not. */
const HOLIDAY_KEYS: readonly B2Key[] = ["decemberBridge"];

/** The shops guide's "Sunday 29 November, election day" H2 (lib/content/batch02/shops.ts electionTitle). */
export const SHOPS_29N_HEADING: Record<Locale, string> = {
  ca: "Diumenge 29 de novembre, dia d'eleccions: quines botigues obren",
  es: "Domingo 29 de noviembre, día de elecciones: qué tiendas abren",
  en: "Sunday 29 November, election day: which shops open",
};

const SHOPS_29N_LABEL: Record<Locale, string> = {
  ca: "Botigues obertes el diumenge 29",
  es: "Tiendas abiertas el domingo 29",
  en: "Shops open on Sunday 29",
};

const COPY: Record<Locale, { before: string; after: string; finder: string; results: string }> = {
  ca: {
    before: "Eleccions generals del diumenge 29 de novembre, col·legis oberts de 9.00 a 20.00 h:",
    after: "Eleccions generals del 29 de novembre:",
    finder: "on votar al teu municipi de Catalunya",
    results: "resultats per municipi de Catalunya",
  },
  es: {
    before: "Elecciones generales del domingo 29 de noviembre, colegios abiertos de 9.00 a 20.00 h:",
    after: "Elecciones generales del 29 de noviembre:",
    finder: "dónde votar en tu municipio de Cataluña",
    results: "resultados por municipio de Cataluña",
  },
  en: {
    before: "General election on Sunday 29 November, polling stations open 9:00 to 20:00:",
    after: "General election of 29 November:",
    finder: "where to vote in your Catalan town",
    results: "results by Catalan town",
  },
};

function voted(phase: ElectionDayPhase): boolean {
  return phase === "count" || phase === "after";
}

/** The line for a phase; null once the layer is over. `shops` adds the shops guide's 29 Nov section (before the vote only). */
export function electionLineFor(locale: Locale, phase: ElectionDayPhase, opts: { shops?: boolean } = {}): ElectionLine | null {
  if (phase === "over") return null;
  const t = COPY[locale];
  if (voted(phase)) {
    return {
      text: t.after,
      links: [
        { href: hubPath(locale), label: t.results },
        { href: b2href("electionNight", locale), label: B2_TITLES.electionNight[locale] },
      ],
    };
  }
  const where = votingWhereStep(locale);
  return {
    text: t.before,
    links: [
      { href: hubPath(locale), label: t.finder },
      { href: where.href, label: B2_TITLES.voting[locale] },
      ...(opts.shops ? [{ href: `${b2href("shops", locale)}#${slugifyAnchor(SHOPS_29N_HEADING[locale])}`, label: SHOPS_29N_LABEL[locale] }] : []),
    ],
  };
}

/** Which content pages carry it: the strike pages (not the 11N pages for the rest of Spain) and the December bridge guide. */
export function electionLineScope(entry: { href: string; key?: string | null }): "strike" | "holiday" | null {
  if (entry.key?.startsWith(STRIKE_11N_SPAIN_KEY_PREFIX)) return null;
  const key = b2KeyForHref(entry.href);
  if (!key) return null;
  if (CATALONIA_STRIKE_KEYS.includes(key) || SPAIN_STRIKE_KEYS.includes(key)) return "strike";
  if (HOLIDAY_KEYS.includes(key)) return "holiday";
  return null;
}

/** A content page's line at render time. */
export function entryElectionLine(entry: { href: string; key?: string | null; locale: Locale }, now: Date = new Date()): ElectionLine | null {
  const scope = electionLineScope(entry);
  if (!scope) return null;
  return electionLineFor(entry.locale, electionPhase(now), { shops: scope === "holiday" });
}

/** "Is <date> a holiday?" pages from 27 Nov to 8 Dec 2026 (the election weekend and the December bridge). */
export function dateElectionLine(iso: string, locale: Locale, now: Date = new Date()): ElectionLine | null {
  if (iso < "2026-11-27" || iso > ELECTION_LINE_REMOVE_BY) return null;
  return electionLineFor(locale, electionPhase(now), { shops: true });
}
