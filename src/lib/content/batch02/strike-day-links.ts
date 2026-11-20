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
// 20 Nov 2026: the 23rd's Renfe entry left strikes.ts (SEMAF called it off); the Renfe guide links the 23N page from its call-off
// (STRIKES_CALLED_OFF), with the rest of that day.
const ENTRY_DAY_PAGE: Partial<Record<string, B2Key>> = { "vaga-renfe-2026-11-23-desconvocada": "strike23n", "vaga-educacio-2026-11-26": "strike26n" };

const LINES: Record<Locale, Partial<Record<B2Key, string>>> = {
  ca: {
    strike23n: `**Tot el dilluns 23:** sense vaga de trens, però amb la vaga de Correus a Madrid i a cinc províncies andaluses i la de metges: ${b2link("strike23n", "ca", "Vaga de Renfe del 23 de novembre, desconvocada: què hi ha aquell dia a tot Espanya")}.`,
    strike26n: `**Tot el dijous 26:** la vaga de metges, Correus a Madrid i les aturades a les escoles de Madrid, amb la de l'educació a Catalunya: ${b2link("strike26n", "ca", "Vaga 26 de novembre de 2026: educació, metges, Correus i Madrid")}.`,
  },
  es: {
    strike23n: `**Todo el lunes 23:** sin huelga de trenes, pero con la huelga de Correos en Madrid y en cinco provincias andaluzas y la de médicos: ${b2link("strike23n", "es", "Huelga de Renfe del 23 de noviembre, desconvocada: qué hay ese día en toda España")}.`,
    strike26n: `**Todo el jueves 26:** la huelga de médicos, Correos en Madrid y los paros en los colegios de Madrid, con la de la educación en Cataluña: ${b2link("strike26n", "es", "Huelga 26 de noviembre de 2026: educación, médicos, Correos y Madrid")}.`,
  },
  en: {
    strike23n: `**All of Monday 23:** no rail strike, but Correos strikes in Madrid and five Andalusian provinces, and so do doctors: ${b2link("strike23n", "en", "Renfe strike on 23 November called off: what is on that day across Spain")}.`,
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
