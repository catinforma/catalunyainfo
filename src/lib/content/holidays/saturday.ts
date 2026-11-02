import type { Locale } from "@/lib/i18n/config";

/**
 * "Is a holiday that falls on a Saturday made up for?" The 2027 long weekends
 * page and the date pages of the three 2027 Saturday holidays (1 May, 11
 * September, 25 December) say they add no day off to a Monday-to-Friday week.
 * A reader pointed out that some workers get another day for them; this is
 * the one place that says what is known, hedged, so every page says the same.
 *
 * No law says so in general. Estatuto de los Trabajadores art. 37.2 (BOE
 * consolidated text, read 2 Nov 2026) gives up to fourteen paid,
 * non-recoverable holidays a year and moves to Monday only those that fall on
 * a Sunday; it says nothing of Saturdays. What exists is case law:
 *
 *  - Audiencia Nacional, Sala de lo Social, sentencia 88/2026 of 19 May 2026
 *    (Roj: SAN 1912/2026, ECLI:ES:AN:2026:1912, conflicto colectivo
 *    134/2026), read on CENDOJ on 2 Nov 2026. Its operative part declares
 *    unlawful the contact-centre sector's practice of not compensating
 *    holidays "cuando la prestación de servicios efectiva se produce de lunes
 *    a viernes o de lunes a sábado y el festivo coincide con sábado, estando
 *    ahí fijado su descanso semanal", recognises "un día adicional de descanso
 *    efectivo" and adds "Dicha compensación habrá de disfrutarse en un
 *    periodo no superior a 14 días". The judgment itself says it is not final
 *    ("no es firme") and can be appealed to the Supreme Court.
 *  - Its commentary in the BOE's Revista de Jurisprudencia Laboral 6/2026
 *    (Elena Lasaosa Irigoyen). Careful: that article prints the ECLI as
 *    "ECLI:ES:AN:2026:191" in its text and "ECLI:ES:TS:2026:1912" in its
 *    header; CENDOJ gives ECLI:ES:AN:2026:191 to an unrelated asylum case of
 *    16 January 2026. The judgment's ECLI is CENDOJ's, ECLI:ES:AN:2026:1912.
 *
 * The Supreme Court rulings the judgment builds on (Sitel Ibérica 2024,
 * Espasa Calpe 2024, Zara 2025) are about shift workers and staff who work
 * weekends, not Monday-to-Friday staff; a CENDOJ search on 2 Nov 2026 found no
 * Supreme Court ruling on Saturday holidays since. Later Audiencia Nacional
 * judgments have gone both ways, sector by sector. Hence the hedge: it depends
 * on the collective agreement and the working pattern.
 *
 * Information, not legal advice: the copy sends readers to their agreement,
 * their union or a labour adviser.
 */

/** When the judgment and its commentary were read. */
export const SATURDAY_RULING_READ = "2026-11-02";

export const SATURDAY_RULING = {
  court: "Audiencia Nacional, Sala de lo Social",
  number: "88/2026",
  date: "2026-05-19",
  ecli: "ECLI:ES:AN:2026:1912",
  roj: "SAN 1912/2026",
  /** CENDOJ's own document link (the search result's "openDocument" URL). */
  url: "https://www.poderjudicial.es/search/AN/openDocument/9a24f982c42af441a0a8778d75e36f0d/20260601",
  /** "en un periodo no superior a 14 días" (operative part, point 2). */
  takeWithinDays: 14,
} as const;

export const SATURDAY_COMMENTARY_URL = "https://www.boe.es/biblioteca_juridica/anuarios_derecho/articulo.php?id=ANU-L-2026-00000003480";

/**
 * The two sources, in the shape both families use: `publisher` for the
 * articles' source rows, `ref` for the date pages' list. Names stay under the
 * 240 characters of `sources.name`.
 */
export const SATURDAY_SOURCES: readonly { name: string; url: string; publisher: string; ref: string }[] = [
  {
    name: `Sentencia ${SATURDAY_RULING.number} de la Audiencia Nacional (Sala de lo Social), de 19 de mayo de 2026, sobre los festivos que coinciden con el sábado de descanso — ${SATURDAY_RULING.ecli}`,
    url: SATURDAY_RULING.url,
    publisher: "Centro de Documentación Judicial (CENDOJ), Consejo General del Poder Judicial",
    ref: `CENDOJ, Roj: ${SATURDAY_RULING.roj}`,
  },
  {
    name: "Elena Lasaosa Irigoyen, «Cuando el festivo laboral coincide con el sábado de descanso semanal, la empresa debe compensar el solapamiento con un día de libranza», Revista de Jurisprudencia Laboral 6/2026",
    url: SATURDAY_COMMENTARY_URL,
    publisher: "Boletín Oficial del Estado",
    ref: "BOE, Revista de Jurisprudencia Laboral, núm. 6/2026",
  },
];

/** The FAQ entry's anchor on the long weekends page, which the work calendar guide links to. */
export const SATURDAY_FAQ_ID: Record<Locale, string> = {
  ca: "compensacio-festiu-dissabte",
  es: "compensacion-festivo-sabado",
  en: "saturday-holiday-compensation",
};

/** The question, in the words people search it in. */
export function saturdayQuestion(locale: Locale): string {
  return {
    ca: "Si treballes de dilluns a divendres, et compensen el festiu que cau en dissabte?",
    es: "¿Se compensa el festivo que cae en sábado?",
    en: "Is a Saturday holiday made up for?",
  }[locale];
}

/** The answer: the judgment, who it covers, and that it is no general rule. */
export function saturdayAnswer(locale: Locale): string {
  const n = SATURDAY_RULING.takeWithinDays;
  return {
    ca: `No sempre: depèn del teu conveni i de com tens organitzada la jornada. L'Audiencia Nacional, en una sentència del 19 de maig de 2026, va reconèixer a qui treballa de dilluns a divendres al sector del contact center un dia més de descans per cada festiu que cau en dissabte, que s'ha de gaudir dins dels ${n} dies següents. Val per a aquell sector: el Tribunal Suprem no ha fixat cap regla per a tothom. Mira el teu conveni, o pregunta-ho al sindicat o a un assessor laboral.`,
    es: `No siempre: depende de tu convenio y de cómo tengas organizada la jornada. La Audiencia Nacional, en una sentencia del 19 de mayo de 2026, reconoció a quien trabaja de lunes a viernes en el sector del contact center un día más de descanso por cada festivo que cae en sábado, que debe disfrutarse en los ${n} días siguientes. Vale para ese sector: el Tribunal Supremo no ha fijado una regla para todos. Mira tu convenio o pregúntalo a tu sindicato o a un asesor laboral.`,
    en: `Not always: it depends on your collective agreement and how your working week is organised. In a judgment of 19 May 2026, Spain's National High Court (Audiencia Nacional) gave Monday-to-Friday staff in the contact-centre sector an extra day of rest for each holiday that falls on a Saturday, to be taken within the next ${n} days. It applies to that sector: the Supreme Court has set no rule for everyone. Check your collective agreement, or ask your union or a labour adviser.`,
  }[locale];
}

/**
 * The plain sentence next to the "lost on a Saturday" row or answer: one
 * holiday (a date page) or several (the long weekends page).
 */
export function saturdayNote(locale: Locale, count: "one" | "many"): string {
  const one = count === "one";
  return {
    ca: `Si treballes de dilluns a divendres, pot ser que ${one ? "te'l" : "te'ls"} compensin amb un altre dia lliure: l'Audiencia Nacional ho va reconèixer el maig del 2026 al sector del contact center, però no és una regla general i depèn del teu conveni.`,
    es: `Si trabajas de lunes a viernes, puede que ${one ? "te lo" : "te los"} compensen con otro día libre: la Audiencia Nacional lo reconoció en mayo de 2026 en el sector del contact center, pero no es una regla general y depende de tu convenio.`,
    en: `If you work Monday to Friday, you may get another day off for ${one ? "it" : "them"}: Spain's National High Court recognised this for the contact-centre sector in May 2026, but it is not a general rule and depends on your collective agreement.`,
  }[locale];
}
