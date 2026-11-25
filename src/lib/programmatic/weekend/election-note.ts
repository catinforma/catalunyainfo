/**
 * "Sunday 29 Nov is election day": the one-line notice the weekend pages
 * carry in their header when the weekend window contains polling day of the
 * 2026 general election (Real Decreto 806/2026; hours 9:00-20:00, LOREG
 * art. 84.1, as pinned in programmatic/elections/election-day.ts). Pure:
 * the route passes the window. REREAD_BY 2026-12-01: the window moves on by
 * itself on Monday 30 Nov, so nothing needs removing.
 */

import type { WeekendLocale } from "@/lib/programmatic/weekend/zones";
import { ELECTION_DAY } from "@/lib/programmatic/elections/election-day";
import { hubPath } from "@/lib/programmatic/elections/paths";

export interface ElectionWeekendNote {
  text: string;
  linkLabel: string;
  href: string;
}

const COPY: Record<WeekendLocale | "en", { text: string; linkLabel: string }> = {
  ca: {
    text: "El diumenge 29 de novembre són les eleccions generals: els col·legis electorals són oberts de 9.00 a 20.00 h, i convé comptar-hi si penses anar a una fira o a un acte.",
    linkLabel: "Eleccions generals: on i com votar",
  },
  es: {
    text: "El domingo 29 de noviembre son las elecciones generales: los colegios electorales abren de 9.00 a 20.00 h, y conviene tenerlo en cuenta si piensas ir a una feria o a un acto.",
    linkLabel: "Elecciones generales: dónde y cómo votar",
  },
  en: {
    text: "Sunday 29 November is general election day: polling stations are open from 9:00 to 20:00, so plan around it if you are heading to a fair or an event.",
    linkLabel: "General election: where and how to vote",
  },
};

export function electionWeekendNote(window: { from: string; to: string }, locale: WeekendLocale | "en"): ElectionWeekendNote | null {
  if (window.from > ELECTION_DAY.day || window.to < ELECTION_DAY.day) return null;
  return { ...COPY[locale], href: hubPath(locale) };
}
