import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";
import { INFOELECTORAL, OFFICIAL_ELECTION_SITE } from "@/lib/programmatic/elections/results-night";

/**
 * What the 29N election guides say from Monday 30 November 2026 (24 Nov 2026,
 * docs/SEO_EXPERIMENTS.md, "24 Nov 2026 — 29N guides after the vote"): the
 * night is past, the figures are provisional, the general count is the law's
 * schedule and the BOE publishes within forty days.
 *
 * The guides wrap the stretches that change in an `electionPhased` block
 * (blocks.ts): `pre` is the text they always had, `after` and `over` come from
 * here. The page picks one from the render time (content/election-phased.ts), so
 * nobody edits anything on 30 Nov; the nightly cron's 00:05 pass re-renders the
 * pages (day-dependent.ts). `after` runs from 30 Nov to 7 Dec, `over` from 8 Dec.
 *
 * Every fact is one the guides already carried, re-read on LOREG's consolidated
 * text (BOE-A-1985-11672, read 24 Nov 2026, quotes in Spanish):
 *  - art. 98.2: "Se expedirá asimismo una copia del acta de escrutinio a la
 *    persona designada por la Administración para recibirla, y a los solos
 *    efectos de facilitar la información provisional sobre los resultados de la
 *    elección que ha de proporcionar el Gobierno";
 *  - art. 103.1: "El escrutinio general se realiza el quinto día siguiente al de
 *    la votación" (Fri 4 Dec);
 *  - art. 107.2: "El escrutinio deberá concluir no más tarde del octavo día
 *    posterior al de las elecciones" (Mon 7 Dec);
 *  - art. 108.4 and 108.6: the boards proclaim the elected after the one-day
 *    claim period, and the Junta Electoral Central, "en el periodo de cuarenta
 *    días", publishes "los resultados generales y por circunscripciones" in the
 *    BOE.
 * The count is always written as the law's schedule ("is due to", "was due
 * to"), never as something this site saw happen. No figure, no party, no poll.
 * The official links are named for what they are: the Interior Ministry's
 * election site and Infoelectoral, its election-data portal; a "results site"
 * only when the switch in results-night.ts is set.
 *
 * Not re-read for this change: the JEC calendar PDF (403 to scripts on 24 Nov)
 * and Interior's own sites (403 on 24 Nov). So the `after` and `over` copy gives
 * no proclamation dates (the 8-16 Dec window is the JEC calendar's, read 24 Oct,
 * and stays in the `pre` text only): it states art. 108.4's rule and art.
 * 108.6's "en el periodo de cuarenta días", which carries no anchor date.
 * Events of the night are written as the law's rule (art. 98.2), not as seen.
 */

export type AfterPhase = "after" | "over";

/** An `electionPhased` block: `pre` until polling day, `after` from 30 Nov, `over` (else `after`) from 8 Dec. */
export function phased(pre: Block[], after: Block[], over?: Block[]): Block {
  return { type: "electionPhased", pre, after, ...(over ? { over } : {}) } as Block;
}

const LOREG = "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672";
export const LOREG_AFTER = {
  provisional: `${LOREG}#anoventayocho`,
  general: `${LOREG}#acientotres`,
  end: `${LOREG}#acientosiete`,
  proclamation: `${LOREG}#acientoocho`,
} as const;

/** Where the official information is, labelled as what each address is. */
function sites(locale: Locale): string {
  if (locale === "ca") {
    return `el [web de les eleccions del Ministeri de l'Interior](${OFFICIAL_ELECTION_SITE}) i [Infoelectoral](${INFOELECTORAL}), el seu portal de dades electorals`;
  }
  if (locale === "es") {
    return `la [web de las elecciones del Ministerio del Interior](${OFFICIAL_ELECTION_SITE}) e [Infoelectoral](${INFOELECTORAL}), su portal de datos electorales`;
  }
  return `the [Interior Ministry's election site](${OFFICIAL_ELECTION_SITE}) and [Infoelectoral](${INFOELECTORAL}), its election-data portal`;
}

/** "The results site is X", only once the switch is set. */
function resultsSite(locale: Locale, url: string | null): string {
  if (!url) return "";
  if (locale === "ca") return ` El web oficial de resultats del Ministeri de l'Interior és [aquest](${url}).`;
  if (locale === "es") return ` La web oficial de resultados del Ministerio del Interior es [esta](${url}).`;
  return ` The Interior Ministry's official results site is [this one](${url}).`;
}

/* -------------------------------------------------------------------------- */
/* The election-night guide                                                   */
/* -------------------------------------------------------------------------- */

interface NightAfter {
  statusTitle: string;
  status: (phase: AfterPhase, url: string | null) => string;
  clockCaption: string;
  clockRows: string[][];
  clockNote: string;
  where: (url: string | null) => string[];
  final0: string;
  /** The two closing paragraphs of "when official", without a promise to add data later (`hist` and `hub` are links). */
  finalRest: (a: { hist: string; hub: string; pages: number }) => string[];
  polls0: string;
  /** Replacement FAQ answers by position (the questions stay as they are). */
  faq: Record<number, (url: string | null) => string>;
}

const A = LOREG_AFTER;

export const NIGHT_AFTER: Record<Locale, NightAfter> = {
  ca: {
    statusTitle: "Després del 29 de novembre: escrutini provisional i resultat oficial",
    status: (phase, url) =>
      `La votació del diumenge 29 de novembre va acabar a les 20:00 (a les Canàries, a les 21:00 hora peninsular). Les xifres de la nit electoral són l'**escrutini provisional**: el Govern el facilita a partir d'una còpia de les actes de les meses ([LOREG, article 98.2](${A.provisional})) i no inclou el vot de l'estranger (CERA). El resultat oficial és el de l'**escrutini general** de les juntes electorals provincials, que ${
        phase === "after"
          ? `segons la llei comença el 4 de desembre ([article 103](${A.general})) i acaba, com a molt tard, el 7 de desembre ([article 107](${A.end}))`
          : `segons la llei havia de començar el 4 de desembre ([article 103](${A.general})) i acabar, com a molt tard, el 7 de desembre ([article 107](${A.end}))`
      }. Després es resolen les reclamacions i es proclamen els electes ([article 108.4](${A.proclamation})), i la Junta Electoral Central publica els resultats oficials al BOE en quaranta dies ([article 108.6](${A.proclamation})). La informació oficial és a ${sites("ca")}.${resultsSite("ca", url)}`,
    clockCaption: "Què va passar la nit del 29 de novembre i què fixa la llei per als dies següents",
    clockRows: [
      ["29 de novembre, 9.00", "Va començar la votació. Els col·legis obren abans perquè la mesa es constitueixi, però es votava a partir de les 9.00."],
      ["29 de novembre, 20.00", "Va acabar la votació a la península, les Balears, Ceuta i Melilla. Cada mesa compta els vots i el president n'anuncia el resultat en veu alta (LOREG, article 97.2)."],
      ["29 de novembre, 21.00 (hora peninsular)", "Van tancar els col·legis de les Canàries. Al 2023, Interior va començar a publicar resultats a aquesta hora."],
      ["Nit del 29 al 30", "La llei encarrega al Govern facilitar la informació provisional a partir d'una còpia de les actes de les meses (LOREG, article 98.2)."],
      ["Del 4 al 7 de desembre", "Escrutini general de les juntes electorals provincials, amb el vot de l'estranger (CERA): la llei el fixa a partir del 4 i fins al 7 com a molt tard."],
      ["Després de l'escrutini general", "Es resolen les reclamacions i les juntes electorals proclamen els electes (LOREG, article 108.4)."],
      ["En quaranta dies", "La Junta Electoral Central publica els resultats oficials al BOE (LOREG, article 108.6)."],
    ],
    clockNote: "Fonts: LOREG, calendari de la Junta Electoral Central i Ministeri de l'Interior.",
    where: (url) => [
      `Les xifres provisionals les dona el **Ministeri de l'Interior**, a partir de les actes de les meses ([LOREG, article 98.2](${A.provisional})).${resultsSite("ca", url)}`,
      `La informació oficial de les eleccions és a ${sites("ca")}. La Generalitat no publica un recompte propi de les eleccions generals: les seves dades obertes arriben més tard.`,
    ],
    final0: `La llei fixa l'escrutini general «el quinto día siguiente al de la votación» ([LOREG, article 103](${A.general})): el divendres 4 de desembre, i el fa la junta electoral de cada província: revisa les actes i hi afegeix el vot CERA. Ha d'acabar, com a molt tard, el 7 de desembre ([article 107](${A.end})). Després es resolen les reclamacions i les juntes electorals proclamen els electes ([article 108.4](${A.proclamation})). La Junta Electoral Central publica els resultats al BOE en quaranta dies ([article 108.6](${A.proclamation})). Interior ho resumeix així: els resultats oficials són els que es publiquen al BOE.`,
    finalRest: ({ hist, hub, pages }) => [
      `Les dades definitives, en format obert, les publica Interior a Infoelectoral (llicència CC BY 4.0). Els resultats de les eleccions generals a Catalunya, des del 1977, són a ${hist}.`,
      `Per als ${pages} municipis de Catalunya, les [pàgines de resultats electorals per municipi](${hub}) mostren el resultat del 29N quan Interior publica el fitxer oficial per municipis, al costat de les municipals del 2023.`,
    ],
    polls0: "Del **24 al 28 de novembre** va estar prohibit publicar, difondre o reproduir enquestes electorals per qualsevol mitjà. La campanya va anar del 13 al 27 de novembre, i el 28 va ser la jornada de reflexió.",
    faq: {
      0: () => "La votació va acabar a les 20.00 i a les Canàries a les 21.00 (hora peninsular). Al 2023, Interior va començar a publicar resultats a les 21.00. L'escrutini provisional de la nit no és el resultat oficial: aquest surt de l'escrutini general de les juntes electorals, que la llei situa entre el 4 i el 7 de desembre, i es publica al BOE.",
      1: (url) => `El Ministeri de l'Interior facilita l'escrutini provisional (LOREG, article 98.2).${resultsSite("ca", url)} La informació oficial és a ${sites("ca")}. Desconfia de les xifres que no diuen quin percentatge de meses s'ha escrutat.`,
      2: () => "El diumenge 29 de novembre de 2026, de 9 a 20 h: es van escollir el Congrés i el Senat. La campanya va anar del 13 al 27 de novembre i el dissabte 28 va ser la jornada de reflexió. Les properes eleccions que fixa la llei són les municipals del 23 de maig de 2027.",
    },
  },
  es: {
    statusTitle: "Después del 29 de noviembre: escrutinio provisional y resultado oficial",
    status: (phase, url) =>
      `La votación del domingo 29 de noviembre terminó a las 20:00 (en Canarias, a las 21:00 hora peninsular). Las cifras de la noche electoral son el **escrutinio provisional**: el Gobierno lo facilita a partir de una copia de las actas de las mesas ([LOREG, artículo 98.2](${A.provisional})) y no incluye el voto del extranjero (CERA). El resultado oficial es el del **escrutinio general** de las juntas electorales provinciales, que ${
        phase === "after"
          ? `según la ley empieza el 4 de diciembre ([artículo 103](${A.general})) y termina, como muy tarde, el 7 de diciembre ([artículo 107](${A.end}))`
          : `según la ley debía empezar el 4 de diciembre ([artículo 103](${A.general})) y terminar, como muy tarde, el 7 de diciembre ([artículo 107](${A.end}))`
      }. Después se resuelven las reclamaciones y se proclama a los electos ([artículo 108.4](${A.proclamation})), y la Junta Electoral Central publica los resultados oficiales en el BOE en cuarenta días ([artículo 108.6](${A.proclamation})). La información oficial está en ${sites("es")}.${resultsSite("es", url)}`,
    clockCaption: "Qué pasó la noche del 29 de noviembre y qué fija la ley para los días siguientes",
    clockRows: [
      ["29 de noviembre, 9:00", "Empezó la votación. Los colegios abren antes para que se constituya la mesa, pero se votaba a partir de las 9:00."],
      ["29 de noviembre, 20:00", "Terminó la votación en la península, Baleares, Ceuta y Melilla. Cada mesa cuenta los votos y el presidente anuncia el resultado en voz alta (LOREG, artículo 97.2)."],
      ["29 de noviembre, 21:00 (hora peninsular)", "Cerraron los colegios de Canarias. En 2023, Interior empezó a publicar resultados a esa hora."],
      ["Noche del 29 al 30", "La ley encarga al Gobierno facilitar la información provisional a partir de una copia de las actas de las mesas (LOREG, artículo 98.2)."],
      ["Del 4 al 7 de diciembre", "Escrutinio general de las juntas electorales provinciales, con el voto del extranjero (CERA): la ley lo fija a partir del 4 y hasta el 7 como muy tarde."],
      ["Después del escrutinio general", "Se resuelven las reclamaciones y las juntas electorales proclaman a los electos (LOREG, artículo 108.4)."],
      ["En cuarenta días", "La Junta Electoral Central publica los resultados oficiales en el BOE (LOREG, artículo 108.6)."],
    ],
    clockNote: "Fuentes: LOREG, calendario de la Junta Electoral Central y Ministerio del Interior.",
    where: (url) => [
      `Las cifras provisionales las da el **Ministerio del Interior**, a partir de las actas de las mesas ([LOREG, artículo 98.2](${A.provisional})).${resultsSite("es", url)}`,
      `La información oficial de las elecciones está en ${sites("es")}. La Generalitat no publica un recuento propio de las elecciones generales: sus datos abiertos llegan más tarde.`,
    ],
    final0: `La ley fija el escrutinio general «el quinto día siguiente al de la votación» ([LOREG, artículo 103](${A.general})): el viernes 4 de diciembre, y lo hace la junta electoral de cada provincia: revisa las actas y añade el voto CERA. Debe concluir, como muy tarde, el 7 de diciembre ([artículo 107](${A.end})). Después se resuelven las reclamaciones y las juntas electorales proclaman a los electos ([artículo 108.4](${A.proclamation})). La Junta Electoral Central publica los resultados en el BOE en cuarenta días ([artículo 108.6](${A.proclamation})). Interior lo resume así: los resultados oficiales son los que se publican en el BOE.`,
    finalRest: ({ hist, hub, pages }) => [
      `Los datos definitivos, en formato abierto, los publica Interior en Infoelectoral (licencia CC BY 4.0). Los resultados de las elecciones generales en Cataluña, desde 1977, están en ${hist}.`,
      `Para los ${pages} municipios de Cataluña, las [páginas de resultados electorales por municipio](${hub}) muestran el resultado del 29N cuando Interior publica el fichero oficial por municipios, junto a las municipales de 2023.`,
    ],
    polls0: "Del **24 al 28 de noviembre** estuvo prohibido publicar, difundir o reproducir encuestas electorales por cualquier medio. La campaña fue del 13 al 27 de noviembre y el 28 fue la jornada de reflexión.",
    faq: {
      0: () => "La votación terminó a las 20:00 y en Canarias a las 21:00 (hora peninsular). En 2023, Interior empezó a publicar resultados a las 21:00. El escrutinio provisional de la noche no es el resultado oficial: este sale del escrutinio general de las juntas electorales, que la ley sitúa entre el 4 y el 7 de diciembre, y se publica en el BOE.",
      1: (url) => `El Ministerio del Interior facilita el escrutinio provisional (LOREG, artículo 98.2).${resultsSite("es", url)} La información oficial está en ${sites("es")}. Desconfía de las cifras que no dicen qué porcentaje de mesas se ha escrutado.`,
      2: () => "El domingo 29 de noviembre de 2026, de 9 a 20 h: se eligieron el Congreso y el Senado. La campaña fue del 13 al 27 de noviembre y el sábado 28 fue la jornada de reflexión. Las próximas elecciones que fija la ley son las municipales del 23 de mayo de 2027.",
    },
  },
  en: {
    statusTitle: "After 29 November: provisional count and official result",
    status: (phase, url) =>
      `Voting on Sunday 29 November ended at 20:00 (21:00 peninsular time in the Canary Islands). The figures of election night are the **provisional count**: the Government provides it from a copy of each table's count sheet ([electoral law, article 98.2](${A.provisional})) and it leaves out the votes from abroad (CERA). The official result is the **general count** of the provincial electoral boards, which ${
        phase === "after"
          ? `the law schedules to begin on 4 December ([article 103](${A.general})) and to finish no later than 7 December ([article 107](${A.end}))`
          : `the law scheduled to begin on 4 December ([article 103](${A.general})) and to finish no later than 7 December ([article 107](${A.end}))`
      }. The boards then settle claims and proclaim the elected ([article 108.4](${A.proclamation})), and the Central Electoral Board publishes the official results in the BOE within forty days ([article 108.6](${A.proclamation})). Official information is on ${sites("en")}.${resultsSite("en", url)}`,
    clockCaption: "What happened on the night of 29 November and what the law sets for the days after",
    clockRows: [
      ["29 November, 9:00", "Voting began. Polling stations open earlier so the table can be set up, but voting started at 9:00."],
      ["29 November, 20:00", "Voting ended on the mainland, the Balearic Islands, Ceuta and Melilla. Each table counts its votes and the president announces the result aloud (electoral law, article 97.2)."],
      ["29 November, 21:00 (mainland time)", "Polling stations in the Canary Islands closed. In 2023 the Interior Ministry started publishing results at this time."],
      ["Night of 29 to 30 November", "The law has the Government provide the provisional information from a copy of the tables' count sheets (electoral law, article 98.2)."],
      ["4 to 7 December", "General count by the provincial electoral boards, with the votes from abroad (CERA): the law sets it to begin on the 4th and to finish by the 7th at the latest."],
      ["After the general count", "Claims are settled and the boards proclaim the elected (electoral law, article 108.4)."],
      ["Within forty days", "The Central Electoral Board publishes the official results in the BOE (electoral law, article 108.6)."],
    ],
    clockNote: "Sources: electoral law (LOREG), Central Electoral Board calendar and Interior Ministry.",
    where: (url) => [
      `The provisional figures come from the **Interior Ministry**, from the tables' count sheets ([electoral law, article 98.2](${A.provisional})).${resultsSite("en", url)}`,
      `Official information about the election is on ${sites("en")}. The Generalitat runs no count of its own for a general election: its open data arrives later.`,
    ],
    final0: `The law sets the general count for "el quinto día siguiente al de la votación", the fifth day after the vote ([electoral law, article 103](${A.general})): Friday 4 December, run by each province's electoral board, which checks the count sheets and adds the CERA votes. It must finish no later than 7 December ([article 107](${A.end})). The boards then settle claims and proclaim the elected ([article 108.4](${A.proclamation})). The Central Electoral Board publishes the results in the BOE within forty days ([article 108.6](${A.proclamation})). The Interior Ministry sums it up: the official results are the ones published in the BOE.`,
    finalRest: ({ hist, hub, pages }) => [
      `The final data, as open data, is published by the ministry on Infoelectoral (CC BY 4.0 licence). Results of every general election in Catalonia since 1977 are on ${hist}.`,
      `For ${pages} towns, the largest and the main resorts, the [election results by town](${hub}) show the 29 November result once the Interior Ministry publishes its official results file by municipality, beside the 2023 local election.`,
    ],
    polls0: "From **24 to 28 November** it was illegal to publish, broadcast or reproduce election polls in any medium. The campaign ran from 13 to 27 November, and 28 November was the day of reflection.",
    faq: {
      0: () => "Voting ended at 20:00 (21:00 mainland time in the Canary Islands). In 2023 the Interior Ministry started publishing results at 21:00. The provisional count of the night is not the official result: that comes from the electoral boards' general count, which the law places between 4 and 7 December, and is published in the BOE.",
      1: (url) => `The Interior Ministry provides the provisional count (electoral law, article 98.2).${resultsSite("en", url)} Official information is on ${sites("en")}. Be wary of figures that do not say what share of polling tables has been counted.`,
      2: () => "On Sunday 29 November 2026, from 9:00 to 20:00: Spain elected the Congress and the Senate. The campaign ran from 13 to 27 November and Saturday 28 November was the day of reflection. The next elections the law sets are the municipal elections of 23 May 2027.",
      3: () => "Voting ran from 9:00 to 20:00 on Sunday 29 November 2026; anyone inside the polling place or at its door at 20:00 could still vote.",
    },
  },
};

/* -------------------------------------------------------------------------- */
/* The Congress-results guide                                                 */
/* -------------------------------------------------------------------------- */

/**
 * The 29N paragraph under the lead from 30 Nov (same slot as `resultsNightLine`,
 * results-night.ts). `tail` is the guide's own link sentence.
 */
export function resultsAfterLine(locale: Locale, phase: AfterPhase, url: string | null, tail: string): string {
  if (locale === "ca") {
    return `**Resultats del 29N:** la votació va acabar a les 20:00 (a les Canàries, a les 21:00 hora peninsular) i la llei encarrega al Govern facilitar la informació provisional la nit electoral, a partir d'una còpia de les actes de les meses ([LOREG, article 98.2](${A.provisional})). Són resultats provisionals: l'escrutini general de les juntes electorals provincials ${
      phase === "after" ? "segons la llei comença el 4 de desembre i acaba, com a molt tard, el 7" : "segons la llei havia de començar el 4 de desembre i acabar, com a molt tard, el 7"
    }; després es proclamen els electes i la Junta Electoral Central publica els resultats oficials al BOE en quaranta dies ([LOREG, article 108.6](${A.proclamation})). La informació oficial és a ${sites("ca")}.${resultsSite("ca", url)} ${tail}`;
  }
  if (locale === "es") {
    return `**Resultados del 29N:** la votación terminó a las 20:00 (en Canarias, a las 21:00 hora peninsular) y la ley encarga al Gobierno facilitar la información provisional la noche electoral, a partir de una copia de las actas de las mesas ([LOREG, artículo 98.2](${A.provisional})). Son resultados provisionales: el escrutinio general de las juntas electorales provinciales ${
      phase === "after" ? "según la ley empieza el 4 de diciembre y termina, como muy tarde, el 7" : "según la ley debía empezar el 4 de diciembre y terminar, como muy tarde, el 7"
    }; después se proclama a los electos y la Junta Electoral Central publica los resultados oficiales en el BOE en cuarenta días ([LOREG, artículo 108.6](${A.proclamation})). La información oficial está en ${sites("es")}.${resultsSite("es", url)} ${tail}`;
  }
  return `**Results of 29 November:** voting ended at 20:00 (21:00 peninsular time in the Canary Islands) and the law has the Government provide the provisional information on the night, from a copy of the tables' count sheets ([electoral law, article 98.2](${A.provisional})). These figures are provisional: the provincial electoral boards' general count ${
    phase === "after" ? "is scheduled by law to begin on 4 December and to finish no later than 7 December" : "was scheduled by law to begin on 4 December and to finish no later than 7 December"
  }; the elected are then proclaimed and the Central Electoral Board publishes the official results in the BOE within forty days ([electoral law, article 108.6](${A.proclamation})). Official information is on ${sites("en")}.${resultsSite("en", url)} ${tail}`;
}

/** The "next election" section of the Congress guide once the 29N vote is past. */
export const CONGRESS_NEXT_AFTER: Record<Locale, { title: string; text: string }> = {
  ca: {
    title: "Les eleccions generals del 29 de novembre de 2026",
    text: "Les eleccions generals van ser el diumenge 29 de novembre de 2026. Els resultats surten a les taules d'aquesta pàgina quan la Generalitat els incorpora a les seves dades obertes; l'escrutini provisional oficial de la nit electoral el facilita el Govern, a través del Ministeri de l'Interior.",
  },
  es: {
    title: "Las elecciones generales del 29 de noviembre de 2026",
    text: "Las elecciones generales fueron el domingo 29 de noviembre de 2026. Sus resultados salen en las tablas de esta página cuando la Generalitat los incorpora a sus datos abiertos; el escrutinio provisional oficial de la noche electoral lo facilita el Gobierno, a través del Ministerio del Interior.",
  },
  en: {
    title: "The 29 November 2026 general election",
    text: "The general election was held on Sunday 29 November 2026. Its results appear in this page's tables once the Generalitat adds them to its open data; the official provisional count on election night is provided by the Government through the Ministry of the Interior.",
  },
};
