import type { Locale } from "@/lib/i18n/config";

import { b2link } from "./shared";

/**
 * The how-to-vote guide from Monday 30 November 2026 (24 Nov 2026,
 * docs/SEO_EXPERIMENTS.md, "24 Nov 2026 — 29N guides after the vote"): the
 * vote is held, so the sections that tell a reader what to do by which date
 * ("where do I vote", hours and ID, paid time off, postal-vote deadlines, the
 * overseas vote) give way to one past-tense paragraph, the "next elections"
 * section looks to the municipal elections, and the FAQ drops the questions
 * that only made sense before the vote. `voting.ts` wraps each stretch in an
 * `electionPhased` block (election-after.ts explains the mechanism); the
 * municipal date and the 30 December declaration deadline for EU citizens are
 * the guide's own, unchanged. Every fact below is already in the guide's `pre`
 * text and its sources; nothing is new, only the tense.
 */

const LOREG = "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672";
const LOREG_85 = `${LOREG}#aochentaycinco`;
const LOREG_42 = `${LOREG}#acuarentaydos`;

export interface VotingAfter {
  /**
   * The one clause of the lead that the vote makes false ("the next election is the general election on 29 Nov"):
   * `leadFrom` is the lead's own text, `leadTo` the wording from 30 Nov (a factual correction, logged in
   * docs/SEO_EXPERIMENTS.md; title, description and the rest of the lead are untouched).
   */
  leadFrom: string;
  leadTo: string;
  /** Callout under the lead: the vote is held, where the count is explained, what is next. */
  calloutTitle: string;
  callout: string;
  nextTitle: string;
  nextLead: string;
  nextCaption: string;
  nextRows: string[][];
  nextNote: string;
  ranTitle: string;
  ran: string;
  /** FAQ entries of the guide to keep as they are, by position. */
  faqKeep: number[];
  /** FAQ answers rewritten, by position (the question stays). */
  faqReplace: Record<number, string>;
}

export const VOTING_AFTER: Record<Locale, VotingAfter> = {
  ca: {
    leadFrom: "Les properes eleccions a Catalunya són les **generals del diumenge 29 de novembre de 2026**, per escollir el Congrés i el Senat, convocades pel Reial decret 806/2026 (BOE del 6 d'octubre); les següents, les municipals, estan previstes per al 23 de maig de 2027.",
    leadTo: "Les últimes eleccions a Catalunya van ser les **generals del diumenge 29 de novembre de 2026**, per escollir el Congrés i el Senat, convocades pel Reial decret 806/2026 (BOE del 6 d'octubre); les properes, les municipals, estan previstes per al 23 de maig de 2027.",
    calloutTitle: "Les eleccions del 29 de novembre ja s'han fet",
    callout: `Les eleccions generals van ser el diumenge 29 de novembre de 2026, de 9 a 20 h, i tots els terminis de la votació han passat. Aquesta guia conserva el calendari i les regles d'aquell procés. El recompte i com es publiquen els resultats: ${b2link("electionNight", "ca", "a quina hora surten i com és l'escrutini")}. Les properes eleccions que fixa la llei són les municipals del 23 de maig de 2027.`,
    nextTitle: "Properes eleccions a Catalunya",
    nextLead: `Les eleccions generals del 29 de novembre de 2026 (Congrés i Senat) ja s'han celebrat. Les següents són les **municipals, previstes per al diumenge 23 de maig de 2027**: la llei les fixa el quart diumenge de maig, i el decret de convocatòria s'expedeix 55 dies abans i es publica al BOE l'endemà, el 29 i el 30 de març de 2027 ([LOREG, article 42.3](${LOREG_42})).`,
    nextCaption: "Eleccions a Catalunya: la darrera i les properes",
    nextRows: [
      ["Eleccions generals (Congrés i Senat)", "Diumenge 29 de novembre de 2026", "Celebrades (Reial decret 806/2026)"],
      ["Eleccions municipals", "Diumenge 23 de maig de 2027 (previstes)", "La llei les fixa el quart diumenge de maig; el decret s'ha de publicar al BOE el 30 de març de 2027"],
      ["Parlament de Catalunya", "Sense data", "Les últimes van ser el 12 de maig de 2024 i la legislatura s'acaba als quatre anys, el 12 de maig de 2028, si no s'avança (Estatut, art. 66)"],
    ],
    nextNote: "El 29 de novembre només es van escollir el Congrés i el Senat: aquell dia no hi havia eleccions autonòmiques ni municipals.",
    ranTitle: "Com va anar la votació del 29 de novembre",
    ran: `Es va votar de 9:00 a 20:00 a la mesa de cada elector, amb el DNI, el passaport o el carnet de conduir originals amb fotografia ([LOREG, article 85](${LOREG_85})); també es va admetre l'app MiDNI. El vot per correu es podia demanar a Correus fins al 19 de novembre i lliurar-lo fins al 26 de novembre a les 14:00 (Acord 418/2026 de la Junta Electoral Central); els detalls són a ${b2link("postalVote", "ca", "la guia del vot per correu")}. Els assalariats tenien dret a fins a quatre hores retribuïdes per votar (Reial decret 605/1999, article 13; a Catalunya, Ordre EMT/232/2026). Els residents a l'estranger (CERA) podien enviar el vot al consolat fins al 24 de novembre o votar a l'urna del 21 al 26.`,
    faqKeep: [8, 9, 10, 11],
    faqReplace: {
      0: "Les municipals, previstes per al 23 de maig de 2027: la llei les fixa el quart diumenge de maig i el seu decret s'ha de publicar el 30 de març de 2027. Les eleccions generals del 29 de novembre de 2026 (Congrés i Senat) ja s'han celebrat.",
      1: "Les últimes van ser el 12 de maig de 2024, i la legislatura s'acaba quan es compleixen quatre anys de les eleccions, el 12 de maig de 2028 (Estatut d'Autonomia, article 66), tret que el president de la Generalitat dissolgui abans el Parlament o no hi hagi investidura.",
      13: "El dissabte 28 de novembre, el dia abans de la votació. La campanya va acabar a les 24:00 del divendres 27 (Reial decret 806/2026) i a partir d'aleshores no es podia difondre propaganda electoral ni fer actes de campanya (LOREG, article 53). Les enquestes no es podien publicar del 24 al 28 de novembre.",
    },
  },
  es: {
    leadFrom: "Las próximas elecciones en Cataluña son las **generales del domingo 29 de noviembre de 2026**, que eligen el Congreso y el Senado en toda España con las mismas reglas en todas partes; las siguientes, las municipales, están previstas para el 23 de mayo de 2027, y no hay elecciones al Parlament convocadas.",
    leadTo: "Las últimas elecciones en Cataluña fueron las **generales del domingo 29 de noviembre de 2026**, que eligieron el Congreso y el Senado en toda España con las mismas reglas en todas partes; las próximas, las municipales, están previstas para el 23 de mayo de 2027.",
    calloutTitle: "Las elecciones del 29 de noviembre ya se han celebrado",
    callout: `Las elecciones generales fueron el domingo 29 de noviembre de 2026, de 9 a 20 h, y todos los plazos de la votación han pasado. Esta guía conserva el calendario y las reglas de aquel proceso. El recuento y cómo se publican los resultados: ${b2link("electionNight", "es", "a qué hora salen y cómo es el escrutinio")}. Las próximas elecciones que fija la ley son las municipales del 23 de mayo de 2027.`,
    nextTitle: "Próximas elecciones en Cataluña",
    nextLead: `Las elecciones generales del 29 de noviembre de 2026 (Congreso y Senado) ya se han celebrado. Las siguientes son las **municipales, previstas para el domingo 23 de mayo de 2027**: la ley las fija el cuarto domingo de mayo, y el decreto de convocatoria se expide 55 días antes y se publica al día siguiente en el BOE, el 29 y el 30 de marzo de 2027 ([LOREG, artículo 42.3](${LOREG_42})).`,
    nextCaption: "Elecciones en Cataluña: la última y las próximas",
    nextRows: [
      ["Generales (Congreso y Senado)", "Domingo 29 de noviembre de 2026", "Celebradas (Real Decreto 806/2026)"],
      ["Municipales", "Domingo 23 de mayo de 2027 (previstas)", "La ley las fija el cuarto domingo de mayo; el decreto debe publicarse en el BOE el 30 de marzo de 2027"],
      ["Parlament de Catalunya", "Sin fecha", "Las últimas fueron el 12 de mayo de 2024 y la legislatura acaba a los cuatro años, el 12 de mayo de 2028, si no se adelanta (Estatut, art. 66)"],
    ],
    nextNote: "El 29 de noviembre solo se eligieron el Congreso y el Senado: ese día no hubo elecciones autonómicas ni municipales.",
    ranTitle: "Cómo fue la votación del 29 de noviembre",
    ran: `Se votó de 9:00 a 20:00 en la mesa de cada elector, con el DNI, el pasaporte o el carné de conducir originales con fotografía ([LOREG, artículo 85](${LOREG_85})); también se admitió la app MiDNI. El voto por correo se podía pedir en Correos hasta el 19 de noviembre y entregar hasta el 26 de noviembre a las 14:00 (Acuerdo 418/2026 de la Junta Electoral Central); los detalles están en ${b2link("postalVote", "es", "la guía del voto por correo")}. Los trabajadores por cuenta ajena tenían derecho a hasta cuatro horas retribuidas para votar (Real Decreto 605/1999, artículo 13; en Cataluña, Ordre EMT/232/2026). Los residentes en el extranjero (CERA) podían enviar el voto al consulado hasta el 24 de noviembre o votar en urna del 21 al 26.`,
    faqKeep: [8, 9, 10, 11],
    faqReplace: {
      0: "Las municipales, previstas para el 23 de mayo de 2027: la ley las fija el cuarto domingo de mayo y su decreto debe publicarse el 30 de marzo de 2027. Las elecciones generales del 29 de noviembre de 2026 (Congreso y Senado) ya se han celebrado.",
      1: "Las últimas fueron el 12 de mayo de 2024, y la legislatura termina cuando se cumplen cuatro años de las elecciones, el 12 de mayo de 2028 (Estatuto de Autonomía, artículo 66), salvo que el presidente de la Generalitat disuelva antes el Parlament o no haya investidura.",
      13: "El sábado 28 de noviembre, el día antes de la votación. La campaña terminó a las 24:00 del viernes 27 (Real Decreto 806/2026) y desde entonces no se podía difundir propaganda electoral ni hacer actos de campaña (LOREG, artículo 53). Las encuestas no se podían publicar del 24 al 28 de noviembre.",
    },
  },
  en: {
    leadFrom: "Spain's general election is on **Sunday 29 November 2026**, polling stations are open from **9:00 to 20:00**,",
    leadTo: "Spain's general election was held on **Sunday 29 November 2026**, with polling stations open from **9:00 to 20:00**,",
    calloutTitle: "The 29 November election has been held",
    callout: `Spain's general election was held on Sunday 29 November 2026, 9:00 to 20:00, and every voting deadline has passed. This guide keeps the calendar and the rules of that vote. How the count works and when results are official: ${b2link("electionNight", "en", "when the results come out and how the count works")}. The next elections the law sets are the municipal elections of 23 May 2027.`,
    nextTitle: "Next elections in Catalonia",
    nextLead: `The general election of 29 November 2026 (Congress and Senate) has been held. The next are the **municipal elections, expected on Sunday 23 May 2027**: the electoral law sets them on the fourth Sunday of May, and the decree calling them is issued 55 days before and published in the BOE the next day, on 29 and 30 March 2027 ([LOREG, article 42.3](${LOREG_42})).`,
    nextCaption: "Elections in Catalonia: the latest and the next",
    nextRows: [
      ["General election (Congress and Senate)", "Sunday 29 November 2026", "Held (Royal Decree 806/2026)"],
      ["Municipal elections", "Sunday 23 May 2027 (expected)", "Set by law for the fourth Sunday of May; the decree is due in the BOE on 30 March 2027"],
      ["Parliament of Catalonia", "No date", "The last one was on 12 May 2024, and the term ends four years after it, on 12 May 2028, unless brought forward (Statute of Autonomy, art. 66)"],
    ],
    nextNote: "On 29 November only the Congress and the Senate were elected: there was no Catalan or local election that day.",
    ranTitle: "How the 29 November vote ran",
    ran: `Voting ran from 9:00 to 20:00 at each voter's own polling table, with an original DNI, passport or driving licence with a photo ([electoral law, article 85](${LOREG_85})); the MiDNI app was accepted too. A postal vote could be requested at Correos until 19 November and handed in until 26 November at 14:00 (Central Electoral Board, Agreement 418/2026); the details are in ${b2link("postalVote", "en", "the postal vote guide")}. Employees were entitled to up to four paid hours to vote (Royal Decree 605/1999, article 13; in Catalonia, Ordre EMT/232/2026). Spaniards on the overseas roll (CERA) could post their vote to the consulate by 24 November or vote there in person from 21 to 26 November.`,
    faqKeep: [2, 3, 14, 15],
    faqReplace: {
      0: "On Sunday 29 November 2026, with polling stations open from 9:00 to 20:00. It was called by Royal Decree 806/2026, published in the BOE on 6 October; the campaign ran from 13 to 27 November and Saturday 28 November was the day of reflection. The decree sets the first sitting of the new Congress and Senate for 23 December.",
      1: "The vote has taken place. It ran from 9:00 to 20:00 at each voter's own polling table, with an original DNI, passport or driving licence with a photo (electoral law, article 85.1). Postal votes could be requested until 19 November and handed in at Correos until 26 November, 14:00.",
      5: "The municipal elections, expected on 23 May 2027, the fourth Sunday of May as the electoral law sets; their decree is due on 30 March 2027. The general election of 29 November 2026 (Congress and Senate) has already been held.",
      6: "The last Catalan election was on 12 May 2024, and the parliament's term ends four years after the vote, on 12 May 2028 (Statute of Autonomy, article 66), unless the President of the Generalitat dissolves it earlier or no president is invested.",
      17: "Saturday 28 November, the day before polling day. The campaign ended at midnight on Friday 27 November (Royal Decree 806/2026), and after that no campaign material could be spread and no campaign event held (LOREG, article 53). Polls could not be published from 24 to 28 November.",
    },
  },
};
