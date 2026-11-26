import type { Locale } from "@/lib/i18n/config";
import { electionPhase } from "@/lib/programmatic/elections/election-day";

/**
 * The shops guide's search snippet from Monday 30 Nov 2026 (27 Nov 2026,
 * ci-numero1, docs/SEO_EXPERIMENTS.md). FACTUAL TENSE CORRECTION inside the
 * measurement windows (ES/EN title 11 Nov, CA title 18 Nov): the stored CA
 * title and the three descriptions open with "Sunday 29 November (election
 * day)", a day that is over from the 30th, at the start of the December
 * shopping Sundays. From the `after` phase of the 29N layer (30 Nov 00:00
 * Madrid, programmatic/elections/election-day.ts) the polling day is dropped
 * and nothing else changes: the same December days (Ordre EMT/77/2025 art. 1
 * and 6; Resolució EMT/4342/2025, Barcelona "6, 8, 13, 20 i 27 de desembre"),
 * the same closing days (Llei 18/2017 art. 36.2.d) and the same count of 30
 * towns (TOWNS_NOV_DEC). Same precedent as the postal-vote guide's
 * closed-phase title (26 Nov 2026).
 *
 * The guide carries the day-dependent `shopsToday` block, so the nightly cron
 * re-renders it at 00:05 and the head is printed from the render clock, like
 * the school calendar's live title (content/live-title.ts). Null = the stored
 * strings, as today. ES and EN titles name no date and stay as stored.
 */
export const SHOPS_SNIPPET_AFTER: Record<Locale, { title: string | null; description: string }> = {
  ca: {
    title: "Botigues obertes a Barcelona: diumenges de desembre",
    description: "Al desembre, sí que poden obrir a Barcelona i Catalunya el 6, 8, 13, 20 i 27; 25 i 26, no. 30 municipis canvien.",
  },
  es: {
    title: null,
    description: "En diciembre, 6, 8, 13, 20 y 27: pueden abrir; 25 y 26, no. Tabla fecha a fecha y los 30 municipios que cambian.",
  },
  en: {
    title: null,
    description: "Shops may open on 6, 8, 13, 20 and 27 December, not on 25-26. Date-by-date table and the 30 towns that differ.",
  },
};

/** From 8 Dec 2026 this module has served its purpose: the head re-reads the snippet (tests/shops-key-facts-27nov.test.ts). */
export const SHOPS_SNIPPET_REREAD_BY = "2026-12-09";

function afterVote(now: Date): boolean {
  const phase = electionPhase(now);
  return phase === "after" || phase === "over";
}

export function liveShopsTitle(locale: Locale, now: Date = new Date()): string | null {
  return afterVote(now) ? SHOPS_SNIPPET_AFTER[locale].title : null;
}

export function liveShopsDescription(locale: Locale, now: Date = new Date()): string | null {
  return afterVote(now) ? SHOPS_SNIPPET_AFTER[locale].description : null;
}
