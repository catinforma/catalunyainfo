import { christmasDays, compactDays, type ChristmasAnswer } from "@/lib/content/batch02/shops-christmas";

import { showChristmasShops } from "./christmas-shops";
import type { DateLocale } from "./format";
import type { SnapshotMunicipality } from "./types";

/**
 * The shop answer for the Christmas season, first thing in the body of a town
 * holiday page (24 Nov 2026, reworked the same day after review).
 *
 * Why. Search Console, 28 Oct-23 Nov 2026: the shops family went from CTR
 * 4.5 % to 0.84 % while impressions rose from 6k to 15k a week ("cuando abren
 * las tiendas los domingos" 255 impressions at position 9, no clicks). The
 * town pages had the answer only in a table further down; this puts it under
 * the H1, in one short paragraph, with a link to that table.
 *
 * Facts. Nothing new: the rows of the "Obertura comercial a Nadal" table
 * itself (`christmasDays`, shops-christmas.ts: the town's own 2026 opening
 * days, the default days its council swapped, its local holidays, the retail
 * law's closing days and Sunday 3 January 2027), grouped. The table and this
 * line read the same function, and a test compares them for every town with a
 * page (917).
 *
 * Clock. DATE-FREE: it never says "today" or "this Sunday". It lists dated
 * days, so it stays true on a page that is not rebuilt for days; at render
 * time it drops the days already past (a deploy or a first request rebuilds
 * the page), exactly as the table does. It follows the table's window
 * (`showChristmasShops`: until Reis, 6 Jan 2027), so the link target exists
 * whenever the line does, and no nightly rebuild is needed.
 */

export interface TownShopsLine {
  /** "Botigues amb horari general fins a Reis:", printed in bold. */
  lead: string;
  /** The dated clauses, joined. */
  text: string;
  /** The link to the Christmas table of the same page. */
  link: { href: string; label: string };
  /** The days the line mentions, per answer (the test compares them with the table). */
  days: { iso: string; answer: ChristmasAnswer }[];
}

export function townShopsLineText(l: TownShopsLine): string {
  return `${l.lead} ${l.text} ${l.link.label}`;
}

const LEAD: Record<DateLocale, string> = {
  ca: "Botigues amb horari general fins a Reis:",
  es: "Tiendas con horario general hasta Reyes:",
  en: "Shops on the general timetable until Epiphany:",
};

const LINK: Record<DateLocale, { href: string; label: string }> = {
  ca: { href: "#botigues-nadal", label: "Taula d'obertura de Nadal" },
  es: { href: "#botigues-nadal", label: "Tabla de apertura en Navidad" },
  en: { href: "#christmas-shops", label: "Christmas opening table" },
};

const WORDS = {
  ca: {
    open: (list: string) => `poden obrir ${list}`,
    pendingWith: (list: string) => `, i el ${list} si l'Ajuntament no l'ha canviat`,
    pendingAlone: (list: string) => `poden obrir el ${list} si l'Ajuntament no l'ha canviat`,
    swapped: (list: string) => `no ${list} (canviat per l'Ajuntament)`,
    localClosed: (list: string) => `no ${list} (festa local sense obertura)`,
    law: (list: string) => `tancat per llei: ${list}`,
  },
  es: {
    open: (list: string) => `pueden abrir ${list}`,
    pendingWith: (list: string) => `, y el ${list} si el Ayuntamiento no lo ha cambiado`,
    pendingAlone: (list: string) => `pueden abrir el ${list} si el Ayuntamiento no lo ha cambiado`,
    swapped: (list: string) => `no ${list} (cambiado por el Ayuntamiento)`,
    localClosed: (list: string) => `no ${list} (fiesta local sin apertura)`,
    law: (list: string) => `cerrado por ley: ${list}`,
  },
  en: {
    open: (list: string) => `may open ${list}`,
    pendingWith: (list: string) => `, and ${list} unless the council has swapped it`,
    pendingAlone: (list: string) => `may open ${list} unless the council has swapped it`,
    swapped: (list: string) => `not ${list} (swapped by the council)`,
    localClosed: (list: string) => `not ${list} (local holiday, not an opening day)`,
    law: (list: string) => `closed by law: ${list}`,
  },
} as const;

/**
 * The season's line for one town and edition, or null once the table is gone
 * (after Reis) or when no day is left. `today` only drops the days already
 * past at render time; the words never refer to it.
 */
export function townShopsLine(m: SnapshotMunicipality, locale: DateLocale, today: string): TownShopsLine | null {
  if (!showChristmasShops(today)) return null;
  const days = christmasDays(m).filter((d) => d.iso >= today);
  if (days.length === 0) return null;
  const of = (...answers: ChristmasAnswer[]) => days.filter((d) => answers.includes(d.answer)).map((d) => d.iso);
  const w = WORDS[locale];
  const open = of("open");
  const pending = of("pending2027");
  const swapped = of("swapped");
  const localClosed = of("localClosed");
  const law = of("lawClosed");
  const pendingList = pending.length ? compactDays(pending, locale) : "";

  const clauses: string[] = [];
  if (open.length) clauses.push(w.open(compactDays(open, locale)) + (pending.length ? w.pendingWith(pendingList) : ""));
  else if (pending.length) clauses.push(w.pendingAlone(pendingList));
  if (swapped.length) clauses.push(w.swapped(compactDays(swapped, locale)));
  if (localClosed.length) clauses.push(w.localClosed(compactDays(localClosed, locale)));
  if (law.length) clauses.push(w.law(compactDays(law, locale)));

  return {
    lead: LEAD[locale],
    text: clauses.join("; ").replace(/\.?$/, "."),
    link: LINK[locale],
    days: days.map((d) => ({ iso: d.iso, answer: d.answer })),
  };
}
