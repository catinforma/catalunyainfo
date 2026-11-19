import type { Locale } from "@/lib/i18n/config";

import { b2link, type B2Key } from "./shared";
import { STRIKE_DAY_PAGES } from "./strikes";

/**
 * 19 Nov 2026: the line a strike guide prints right under its answer when the
 * entry it covers has a one-day page of its own (23 Nov: SEMAF at Renfe with
 * the rest of Spain's trains, Correos and the doctors; 26 Nov: the education
 * strike with the rest of that day; strike-days-2326n.ts), until that day has
 * passed. The anchors carry the searched words ("huelga renfe 23 noviembre",
 * "vaga 26 novembre"). Kept out of strike-guides.ts, which restates no fact
 * about the strikes themselves (tests/strike-guides.test.ts).
 */
const ENTRY_DAY_PAGE: Partial<Record<string, B2Key>> = { "vaga-renfe-2026-11-23": "strike23n", "vaga-educacio-2026-11-26": "strike26n" };

const LINES: Record<Locale, Partial<Record<B2Key, string>>> = {
  ca: {
    strike23n: `**Fora de Catalunya i tot el dilluns 23:** Cercanías de Madrid i la resta de nuclis, AVE i Mitja Distància, la vaga de Correus i la de metges: ${b2link("strike23n", "ca", "Vaga de Renfe del 23 de novembre a tot Espanya: AVE, Cercanías i la resta del dia")}.`,
    strike26n: `**Tot el dijous 26:** la vaga de metges, Correus a Madrid i les aturades a les escoles de Madrid, amb la de l'educació a Catalunya: ${b2link("strike26n", "ca", "Vaga 26 de novembre de 2026: educació, metges, Correus i Madrid")}.`,
  },
  es: {
    strike23n: `**Fuera de Cataluña y todo el lunes 23:** Cercanías de Madrid y demás núcleos, AVE y Media Distancia, la huelga de Correos y la de médicos: ${b2link("strike23n", "es", "Huelga de Renfe del 23 de noviembre en toda España: AVE, Cercanías y el resto del día")}.`,
    strike26n: `**Todo el jueves 26:** la huelga de médicos, Correos en Madrid y los paros en los colegios de Madrid, con la de la educación en Cataluña: ${b2link("strike26n", "es", "Huelga 26 de noviembre de 2026: educación, médicos, Correos y Madrid")}.`,
  },
  en: {
    strike23n: `**Outside Catalonia, and the rest of Monday 23:** Cercanías in Madrid and other cities, AVE and Media Distancia, the Correos strike and the doctors' strike: ${b2link("strike23n", "en", "Renfe strike on 23 November across Spain: AVE, Cercanías and the rest of the day")}.`,
    strike26n: `**All of Thursday 26:** the doctors' strike, Correos in Madrid and Madrid's school stoppages, with Catalonia's education strike: ${b2link("strike26n", "en", "Strikes on 26 November 2026: education, doctors, Correos and Madrid")}.`,
  },
};

/** The guide's line for its entry's day page on `asOf`, or undefined (no page, or its day has passed). */
export function entryDayPageLine(entryId: string, locale: Locale, asOf: string): string | undefined {
  const key = ENTRY_DAY_PAGE[entryId];
  const page = key ? STRIKE_DAY_PAGES.find((p) => p.key === key) : undefined;
  if (!key || !page || page.day < asOf) return undefined;
  return LINES[locale][key];
}
