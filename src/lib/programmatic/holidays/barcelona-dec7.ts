import { municipalities, municipalityBySlug } from "./data";
import { dayMonth, type DateLocale } from "./format";

/**
 * "¿Es festivo el 7 de diciembre en Barcelona?" (26 Nov 2026,
 * docs/SEO_EXPERIMENTS.md): ~150 impressions on the bridge guide and ~145
 * on the 7 December date page in 28 days, at positions 5-8 and no click.
 * Both pages said it only inside a longer paragraph. This is the one-line
 * answer, computed from the holiday snapshot (never typed), so the bridge
 * guide, its key facts and the date page say the same thing.
 *
 * Read 26 Nov 2026 (curl + grep, DOGC PDFs):
 *  - Ordre EMT/208/2025 (DOGC 9565, 17.12.2025), local holidays 2026:
 *    "Barcelona, 25 de maig i 24 de setembre." and "Sant Boi de Llobregat,
 *    20 de maig i 7 de desembre."
 *  - Ordre EMT/66/2025 (DOGC 9406, 6.5.2025), art. 1: "8 de desembre,
 *    dimarts"; neither 6 nor 7 December is in the list.
 *  - Resolució EMT/4342/2025 (DOGC 9551, 27.11.2025), Barcelona: "6, 8,
 *    13, 20 i 27 de desembre." (no 7th; Sant Boi's list has "6, 7, 8, 13,
 *    20 i 27 de desembre.").
 */
export const DEC7_2026 = "2026-12-07";
export const DEC8_2026 = "2026-12-08";

export interface BarcelonaDec7 {
  /** Whether 7 December 2026 is a local holiday in Barcelona (false in 2026). */
  holiday: boolean;
  /** Barcelona's two local holidays of 2026, ISO. */
  local: string[];
  /** Whether 7 December is one of Barcelona's ten shop-opening days. */
  shopsDay: boolean;
}

export function barcelonaDec7(): BarcelonaDec7 {
  const m = municipalityBySlug("barcelona");
  if (!m) throw new Error("holiday snapshot has no Barcelona");
  return { holiday: m.local.includes(DEC7_2026), local: [...m.local].sort(), shopsDay: m.shops.includes(DEC7_2026) };
}

/** The question, as searchers type it. */
export function barcelonaDec7Question(locale: DateLocale): string {
  return {
    ca: "El 7 de desembre de 2026 és festiu a Barcelona?",
    es: "¿Es festivo el 7 de diciembre de 2026 en Barcelona?",
    en: "Is 7 December 2026 a holiday in Barcelona?",
  }[locale];
}

/**
 * The answer without the leading "No.": Barcelona, a working day; its two
 * local days; the 8th is the holiday. Throws if the snapshot ever makes the
 * 7th a local holiday in Barcelona, so the sentence cannot go wrong silently.
 */
export function barcelonaDec7Sentence(locale: DateLocale): string {
  const bcn = barcelonaDec7();
  if (bcn.holiday || bcn.local.length !== 2) throw new Error("Barcelona's 2026 local days changed: rewrite barcelonaDec7Sentence");
  const [a, b] = bcn.local as [string, string];
  const both = locale === "en" ? `${dayMonth(a, locale)} and ${dayMonth(b, locale)}` : `${dayMonth(a, locale)} ${locale === "ca" ? "i el" : "y el"} ${dayMonth(b, locale)}`;
  return {
    ca: `A Barcelona, el dilluns 7 de desembre de 2026 és un dia feiner: les seves dues festes locals del 2026 són el ${both} (Ordre EMT/208/2025). El festiu del pont és el dimarts 8, a tot Catalunya.`,
    es: `En Barcelona, el lunes 7 de diciembre de 2026 es laborable: sus dos fiestas locales de 2026 son el ${both} (Orden EMT/208/2025). El festivo del puente es el martes 8, en toda Cataluña.`,
    en: `In Barcelona, Monday 7 December 2026 is a working day: the city's two local holidays in 2026 are ${both} (Order EMT/208/2025). The bridge's holiday is Tuesday the 8th, across Catalonia.`,
  }[locale];
}

/** The FAQ answer: "No." and the sentence. */
export function barcelonaDec7Answer(locale: DateLocale): string {
  return `No. ${barcelonaDec7Sentence(locale)}`;
}

/**
 * Municipalities whose own local holiday is Monday 7 December 2026 (nuclei
 * left out), largest first; and those of them where it is also a shop-opening
 * day (only Sant Boi de Llobregat in Resolució EMT/4342/2025, read 26 Nov).
 */
export function dec7LocalTowns(): { towns: string[]; shopsOpen: string[] } {
  const towns = municipalities()
    .filter((m) => m.local.includes(DEC7_2026))
    .sort((a, b) => a.rank - b.rank);
  return { towns: towns.map((m) => m.name), shopsOpen: towns.filter((m) => m.shops.includes(DEC7_2026)).map((m) => m.name) };
}
