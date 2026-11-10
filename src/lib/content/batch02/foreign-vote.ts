import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import { MUNICIPAL_RESULTS } from "./municipal-results";
import {
  b2link,
  b2Related,
  callout,
  faq,
  h2,
  languageLinks,
  lead,
  list,
  paras,
  steps,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Foreign residents' vote in the local elections of 23 May 2027: who can vote
 * (EU citizens; nationals of the 13 countries with an agreement), what to do
 * and by when. Year-free URLs (guies/vot-estrangers-eleccions-municipals,
 * guias/voto-extranjeros-elecciones-municipales,
 * guides/can-foreigners-vote-spain-local-elections): 2031 reuses them.
 *
 * English leads (the readers are residents from abroad); the Spanish and
 * Catalan editions are written for their own readers, not translated.
 *
 * FOREIGN_VOTE_AS_OF 2026-11-10. Fact base:
 * research_notes/x10/municipales-2027-extranjeros-factpack.md. Every fact
 * below was read that day at the address given (curl, browser User-Agent),
 * and nothing else is printed:
 *
 *  - INE, "Formación del censo electoral de extranjeros residentes en España
 *    para las elecciones municipales 2027" (www.ine.es/dyngs/CEL/index.htm?cid=383,
 *    English at /dyngs/CEL/en/): EU citizens "podrán votar en las elecciones
 *    municipales de 23 de mayo de 2027 si están incluidos en el censo
 *    electoral vigente de esas elecciones y son mayores de edad el día de la
 *    votación"; padrón registration and the declaration are required; online
 *    with Cl@ve ("Este acceso es permanente"), or with the letter's CTT
 *    ("solo estará disponible desde el 1 de octubre hasta el 30 de diciembre
 *    de 2026"), by post "sin necesidad de franqueo", or at the town hall with
 *    the "modelo DFA"; "las inscripciones en los padrones municipales y las
 *    declaraciones formales deberán realizarse no más tarde del día 30 de
 *    diciembre de 2026"; letters go "únicamente a quienes la OCE no se haya
 *    dirigido con ocasión de elecciones municipales anteriores".
 *  - INE press note of 30 Sep 2026 (www.ine.es/dyngs/Prensa/es/EM2027CEREUE.htm):
 *    "El plazo ... finaliza el 30 de diciembre de 2026"; those who declared
 *    before "mantienen su condición de electores sin necesidad de cumplimentar
 *    una nueva declaración ... hasta que soliciten su exclusión o dejen de
 *    residir en España"; 345.312 EU voters on the roll, 515.363 letters; the
 *    form "está también disponible en la Sede electrónica del INE"; people not
 *    on the padrón register and declare at the town hall; information at town
 *    halls, OCE provincial offices and 900 343 232. Province tables: Barcelona
 *    34.244 voters / 81.050 letters, Girona 12.983 / 8.074, Lleida 3.673 /
 *    5.589, Tarragona 7.433 / 9.901 (Catalonia 58.333 / 104.614, our sum).
 *  - INE e-office procedure sheets (sede.ine.gob.es; its certificate chain is
 *    incomplete for curl, so read with -k and cross-checked with the links
 *    printed on www.ine.es): /tramite/manifestacion_voluntad_voto/ (Cl@ve;
 *    needs the padrón entry sent to the INE and a NIE received from the
 *    Registro Central de Extranjeros; municipal, European or both; "la
 *    inscripción ... tiene carácter permanente"); /tramite/manifestacionVotoUECTT/
 *    (CTT, to 30 Dec 2026); /tramite/censo_electoral/ ("Consulta de
 *    inscripción en el Censo Electoral", Cl@ve); the DFA form PDF (200; its
 *    content was not read: no PDF tools on the box).
 *  - BOE-A-2026-3802 (OCE resolution of 5 Feb 2026, BOE 18 Feb): the three
 *    routes for EU citizens. The pack had it as "not checked"; checked.
 *  - Orden EHA/2264/2010 (BOE-A-2010-13463, consolidated): art. 1, agreements
 *    in force with Bolivia, Cabo Verde, Colombia, Corea, Chile, Ecuador,
 *    Islandia, Noruega, Nueva Zelanda, Paraguay, Perú, Reino Unido and Trinidad
 *    y Tobago; conditions (18, padrón, residence authorisation, the residence
 *    time of each agreement); 1.4, 17-year-olds who are 18 on polling day;
 *    art. 3, "entre el 1 de diciembre del año anterior ... y el 15 de enero de
 *    ese año, ambos inclusive"; art. 4, refusals notified with reasons within
 *    fifteen days; art. 5, "válidas exclusivamente para las elecciones
 *    municipales para las que se realicen las solicitudes".
 *  - OCE resolution of 10 Nov 2022 (BOE-A-2022-18872): how to apply (letter
 *    back by post with the NIE, no stamp; online at https://sede.ine.gob.es
 *    with Cl@ve or NIE + CTT; a letter without CTT goes back with a photocopy
 *    of the TIE or a police residence certificate; in person at the town hall
 *    with the TIE and a photocopy); EEA nationals, and UK nationals on the
 *    padrón before 1 Jan 2021, may also show their national ID or passport;
 *    late requests "serán desestimadas"; annex: five years before the
 *    application (Bolivia, Cabo Verde, Colombia, Corea, Chile, Ecuador,
 *    Islandia, Paraguay, Perú, Trinidad y Tobago), Norway "más de tres años",
 *    UK three years before the application.
 *  - INE, www.ine.es/dyngs/CEL/index.htm?cid=47: the same 13 countries; the
 *    agreements roll "se forma con motivo de cada elección municipal".
 *  - LOREG (BOE-A-1985-11672, consolidated): art. 2 (general elections:
 *    Spaniards); 39.2, 39.3, 39.5, 39.6 and 39.7 (roll lookup for eight days
 *    from the sixth day after the call, claims, three days, polling card);
 *    art. 40 (appeal in five days); 42.3 (decree on the 55th day before the
 *    fourth Sunday of May, BOE the next day); art. 176.
 *
 * Deliberately not printed:
 *  - New Zealand's residence requirement. The owner's fact pack found the
 *    sources in disagreement, so the page says only that the agreement is in
 *    force (INE) and sends the reader to the OCE.
 *  - Norway's "on polling day" reference date: only a city council sheet said
 *    it. The BOE annex says "más de tres años" and no more; so does the page.
 *  - A direct link to the online application for agreement countries: on
 *    10 Nov 2026 the INE e-office listed none (the pack's link,
 *    /manifestacionVotoPermanente/presentacion, is the EU Cl@ve procedure).
 *    The page gives https://sede.ine.gob.es, the address the BOE names, and a
 *    test fails from 1 Dec 2026 until someone looks again.
 *  - The 2027 decree and calendar: not published. 29 and 30 March and the
 *    5-12 April lookup are the law applied to 23 May 2027, marked "to be
 *    confirmed".
 *  - Whether an EU citizen who declares after 30 Dec can still get onto the
 *    2027 roll by a claim: no source read says so.
 */

/** Last verified. Moving it past a deadline switches the copy (see foreignVotePhase). */
export const FOREIGN_VOTE_AS_OF = "2026-11-10";

export const MUNICIPALS_2027 = {
  election: "2027-05-23",
  cttFrom: "2026-10-01",
  /** EU citizens: padrón registration and declaration (INE). */
  euBy: "2026-12-30",
  /** Agreement countries: Orden EHA/2264/2010, art. 3. */
  agreementFrom: "2026-12-01",
  agreementBy: "2027-01-15",
  /** LOREG 42.3: issued on the 55th day before polling day, BOE the next day. To be confirmed. */
  decree: "2027-03-29",
  decreeBoe: "2027-03-30",
  /** LOREG 39.2: eight days from the sixth day after the call. To be confirmed. */
  rollFrom: "2027-04-05",
  rollTo: "2027-04-12",
} as const;

/**
 * before: the agreement window has not opened; open: both are open;
 * euClosed: only the agreement window is open; closed: both have closed.
 */
export type ForeignVotePhase = "before" | "open" | "euClosed" | "closed";

export function foreignVotePhase(asOf: string): ForeignVotePhase {
  if (asOf < MUNICIPALS_2027.agreementFrom) return "before";
  if (asOf <= MUNICIPALS_2027.euBy) return "open";
  if (asOf <= MUNICIPALS_2027.agreementBy) return "euClosed";
  return "closed";
}

export const FOREIGN_VOTE_URL = {
  ine2027: "https://www.ine.es/dyngs/CEL/index.htm?cid=383",
  ine2027En: "https://www.ine.es/dyngs/CEL/en/index.htm?cid=383",
  ineAgreements: "https://www.ine.es/dyngs/CEL/index.htm?cid=47",
  inePress: "https://www.ine.es/dyngs/Prensa/es/EM2027CEREUE.htm",
  euClave: "https://sede.ine.gob.es/tramite/manifestacion_voluntad_voto/",
  euCtt: "https://sede.ine.gob.es/tramite/manifestacionVotoUECTT/",
  dfaForm: "https://sede.ine.gob.es/manifestacionVotoPermanente/impresoDFA/cere.dfa_1_30ene26.pdf",
  rollLookup: "https://sede.ine.gob.es/tramite/censo_electoral/",
  /**
   * Agreement countries apply here (BOE-A-2022-18872 names this address). No
   * procedure of their own was listed on 10 Nov 2026: replace this with the
   * direct link when the INE opens it.
   */
  agreementOnline: "https://sede.ine.gob.es/",
  boeEu: "https://www.boe.es/buscar/doc.php?id=BOE-A-2026-3802",
  boeOrder: "https://www.boe.es/buscar/act.php?id=BOE-A-2010-13463",
  boeAgreements: "https://www.boe.es/buscar/doc.php?id=BOE-A-2022-18872",
  loreg: "https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672",
} as const;

const U = FOREIGN_VOTE_URL;

const SOURCES: B2Source[] = [
  { name: "Formación del censo electoral de extranjeros residentes en España para las elecciones municipales 2027", url: U.ine2027, publisher: "INE — Oficina del Censo Electoral" },
  { name: "Nota de prensa: elecciones municipales de 23 de mayo de 2027, ciudadanos de la Unión Europea (30 de septiembre de 2026)", url: U.inePress, publisher: "INE — Oficina del Censo Electoral" },
  { name: "Censo electoral: países con acuerdos para las elecciones municipales (CERE Acuerdos)", url: U.ineAgreements, publisher: "INE — Oficina del Censo Electoral" },
  { name: "Manifestación de voluntad de ejercer en España el derecho de sufragio activo de los ciudadanos de la UE (trámite con Cl@ve)", url: U.euClave, publisher: "INE — Sede Electrónica" },
  { name: "Manifestación de voluntad de voto de ciudadanos de la UE con clave de tramitación telemática (CTT)", url: U.euCtt, publisher: "INE — Sede Electrónica" },
  { name: "Consulta de inscripción en el Censo Electoral", url: U.rollLookup, publisher: "INE — Sede Electrónica" },
  { name: "Resolución de 5 de febrero de 2026, de la Oficina del Censo Electoral: inscripción de los ciudadanos de otros países de la Unión Europea residentes en España", url: U.boeEu, publisher: "Boletín Oficial del Estado" },
  { name: "Orden EHA/2264/2010, de 20 de julio: censo electoral de residentes en España nacionales de países con acuerdos para las elecciones municipales (texto consolidado)", url: U.boeOrder, publisher: "Boletín Oficial del Estado" },
  { name: "Resolución de 10 de noviembre de 2022, de la Oficina del Censo Electoral: procedimientos y requisitos de los acuerdos para las elecciones municipales", url: U.boeAgreements, publisher: "Boletín Oficial del Estado" },
  { name: "Ley Orgánica 5/1985, del Régimen Electoral General, artículos 2, 39, 40, 42 y 176 (texto consolidado)", url: U.loreg, publisher: "Boletín Oficial del Estado" },
];

const a = (label: string, url: string) => `[${label}](${url})`;

type Step = { title: string; text: string };

type PhaseCopy = {
  seoTitle: string;
  seoDescription: string;
  lead: string;
  euStep: Step;
  agreementStep: Step;
  deadlineAnswer: string;
};

type Copy = {
  path: string;
  title: string;
  excerpt: string;
  phases: Record<ForeignVotePhase, PhaseCopy>;
  stepsTitle: string;
  padronStep: Step;
  checkStep: Step;
  voteStep: Step;
  note: string;
  whoTitle: string;
  whoCaption: string;
  whoHeaders: string[];
  whoRows: string[][];
  whoNote: string;
  euTitle: string;
  eu: string[];
  euWays: string[];
  euAfter: string[];
  agreementTitle: string;
  agreement: string[];
  conditions: string[];
  agreementMid: string[];
  agreementWays: string[];
  agreementAfter: string[];
  yearsTitle: string;
  yearsCaption: string;
  yearsHeaders: string[];
  yearsRows: string[][];
  yearsNote: string;
  calTitle: string;
  calCaption: string;
  calHeaders: string[];
  calRows: string[][];
  calNote: string;
  rollTitle: string;
  roll: string[];
  scopeTitle: string;
  scope: string[];
  deadlineQuestion: string;
  faq: { question: string; answer: string }[];
};

/* -------------------------------------------------------------------------- */
/* English (lead edition)                                                     */
/* -------------------------------------------------------------------------- */

const EN_EU_OPEN: Step = {
  title: "EU citizens: declare by Wednesday 30 December 2026",
  text: `Online with Cl@ve on the ${a("INE e-office", U.euClave)}, with the code (CTT) printed in the INE's letter on ${a("this other form", U.euCtt)}, by posting the letter back (no stamp needed) or at your town hall. Declared for an earlier election? You are already on the roll and need do nothing.`,
};
const EN_EU_CLOSED: Step = {
  title: "EU citizens: the deadline was 30 December 2026",
  text: `If you declared by then, or for an earlier election, you are on the roll for 23 May 2027. The ${a("Cl@ve procedure", U.euClave)} stays open all year, but the INE's deadline for these elections has passed.`,
};
const EN_AGREEMENT_WAYS = `Send back the letter from the Electoral Census Office, apply on the ${a("INE e-office", U.agreementOnline)} with Cl@ve or the letter's code, or go to your town hall with your residence card (TIE) and a photocopy. You must apply even if you voted in 2023.`;
const EN_AGREEMENT_OPEN: Step = {
  title: "UK, Norway and the other agreement countries: apply by Friday 15 January 2027",
  text: `The window opened on 1 December 2026 and closes on 15 January 2027, that day included. ${EN_AGREEMENT_WAYS}`,
};

const EN: Copy = {
  path: "guides/can-foreigners-vote-spain-local-elections",
  title: "Can foreigners vote in Spain's local elections of 23 May 2027? EU citizens, British, Norwegians and the other agreement countries",
  excerpt: "EU citizens and nationals of 13 countries with an agreement, the UK and Norway among them, can vote in Spain's local elections of 23 May 2027. What to do and by when.",
  phases: {
    before: {
      seoTitle: "Can I vote in Spain in 2027? EU by 30 Dec, UK by 15 Jan",
      seoDescription: "EU citizens can vote in Spain's local elections of 23 May 2027 if they declare by 30 December 2026. UK, Norway and 11 more countries: apply 1 Dec-15 Jan.",
      lead: "**Yes, if you are an EU citizen or a national of one of the 13 countries with a voting agreement**, the UK and Norway among them, and you are on the padrón (the residents' register) of the town where you live. Spain's next local elections are on **Sunday 23 May 2027**. EU citizens must declare that they want to vote **by Wednesday 30 December 2026**, once only: if you declared for an earlier election, you are already on the roll. Nationals of the agreement countries must apply **between Tuesday 1 December 2026 and Friday 15 January 2027**, and again for every election. Nobody is added automatically, and a late request does not get you onto the roll for 2027.",
      euStep: EN_EU_OPEN,
      agreementStep: {
        title: "UK, Norway and the other agreement countries: apply from Tuesday 1 December",
        text: `The window runs from 1 December 2026 to Friday 15 January 2027, both days included. ${EN_AGREEMENT_WAYS}`,
      },
      deadlineAnswer: "For EU citizens, Wednesday 30 December 2026: it is the last day both to register on the padrón and to declare your wish to vote. For nationals of the 13 agreement countries (the UK and Norway among them), applications open on Tuesday 1 December 2026 and close on Friday 15 January 2027. Both dates come from the INE and the BOE. Neither depends on the decree calling the election, which has not been published yet.",
    },
    open: {
      seoTitle: "Can I vote in Spain in 2027? EU by 30 Dec, UK by 15 Jan",
      seoDescription: "EU citizens: declare by 30 December 2026 to vote in Spain's local elections of 23 May 2027. UK, Norway and 11 more countries: apply now, until 15 January.",
      lead: "**Yes, if you are an EU citizen or a national of one of the 13 countries with a voting agreement**, the UK and Norway among them, and you are on the padrón (the residents' register) of the town where you live. Spain's next local elections are on **Sunday 23 May 2027**. EU citizens must declare that they want to vote **by Wednesday 30 December 2026**, once only: if you declared for an earlier election, you are already on the roll. Nationals of the agreement countries can apply now and **until Friday 15 January 2027**, and must do so again for every election. Nobody is added automatically, and a late request does not get you onto the roll for 2027.",
      euStep: EN_EU_OPEN,
      agreementStep: EN_AGREEMENT_OPEN,
      deadlineAnswer: "For EU citizens, Wednesday 30 December 2026: it is the last day both to register on the padrón and to declare your wish to vote. For nationals of the 13 agreement countries (the UK and Norway among them), applications opened on 1 December 2026 and close on Friday 15 January 2027. Both dates come from the INE and the BOE. Neither depends on the decree calling the election, which has not been published yet.",
    },
    euClosed: {
      seoTitle: "Can I vote in Spain in 2027? UK, Norway: apply by 15 Jan",
      seoDescription: "British, Norwegian and 11 more nationalities can apply until 15 January 2027 to vote in Spain's local elections of 23 May. The EU deadline was 30 December.",
      lead: "**Yes, if you get onto the electoral roll in time.** Nationals of the 13 countries with a voting agreement, the UK and Norway among them, can still apply **until Friday 15 January 2027** to vote in Spain's local elections of **Sunday 23 May 2027**, and must do so even if they voted in 2023. For EU citizens the deadline was 30 December 2026: if you declared by then, or for an earlier election, you are on the roll. Either way you must be on the padrón (the residents' register) of the town where you live. Nobody is added automatically, and a late request does not get you onto the roll for 2027.",
      euStep: EN_EU_CLOSED,
      agreementStep: EN_AGREEMENT_OPEN,
      deadlineAnswer: "For nationals of the 13 agreement countries (the UK and Norway among them), Friday 15 January 2027, that day included; applications opened on 1 December 2026. For EU citizens the deadline was 30 December 2026. Both dates come from the INE and the BOE.",
    },
    closed: {
      seoTitle: "Can I vote in Spain on 23 May 2027? Registration is closed",
      seoDescription: "Foreign residents vote in Spain's local elections of 23 May 2027 only if they registered in time: EU citizens by 30 Dec, agreement countries by 15 January.",
      lead: "**Only if you registered in time.** Both deadlines for foreign residents to get onto the roll for Spain's local elections of **Sunday 23 May 2027** have passed: 30 December 2026 for EU citizens and 15 January 2027 for nationals of the 13 countries with a voting agreement, the UK and Norway among them. EU citizens who declared for an earlier election stay on the roll without doing anything. Agreement-country nationals who did not apply in the window cannot vote this time: their registration lasts one election only. If you did register, check your entry with Cl@ve on the INE e-office.",
      euStep: EN_EU_CLOSED,
      agreementStep: {
        title: "Agreement countries: the window closed on 15 January 2027",
        text: "Applications ran from 1 December 2026 to 15 January 2027. The Electoral Census Office rejects any request made outside those dates, including a later claim against the roll.",
      },
      deadlineAnswer: "Both have passed. EU citizens had until 30 December 2026 to register on the padrón and declare their wish to vote; nationals of the 13 agreement countries (the UK and Norway among them) could apply from 1 December 2026 to 15 January 2027. An EU citizen's entry is permanent, so one made for an earlier election still counts; agreement-country nationals will have to apply again before the next local elections.",
    },
  },
  stepsTitle: "What to do, in order",
  padronStep: {
    title: "Make sure you are on the padrón",
    text: "You vote in the town where you are registered as a resident (empadronado). If you are not on the padrón, go to your town hall first: for EU citizens, the INE only counts registrations made by 30 December 2026.",
  },
  checkStep: {
    title: "Check that you are on the roll",
    text: `With Cl@ve, the INE's ${a("electoral roll lookup", U.rollLookup)} shows your entry. For information without Cl@ve, ask your town hall or the Electoral Census Office in your province, or call 900 343 232.`,
  },
  voteStep: {
    title: "Vote on Sunday 23 May 2027",
    text: "The Electoral Census Office sends every voter a polling card with their polling station. The decree calling the election, which sets the official calendar, has not been published yet.",
  },
  note: `Everything on this page comes from the Electoral Census Office (part of the INE, Spain's statistics office) and from the BOE, the official gazette, as read on 10 November 2026. The decree calling the 2027 elections has not been published: the dates that depend on it are marked "to be confirmed". The INE has ${a("its own page in English", U.ine2027En)} for EU citizens.`,
  whoTitle: "Who can vote, at a glance",
  whoCaption: "Foreign residents and the local elections of 23 May 2027",
  whoHeaders: ["Nationality", "Can you vote?", "What you must do", "Deadline"],
  whoRows: [
    ["Another EU country", "Yes, if you are 18 on polling day and on the padrón", "Declare your wish to vote, once", "30 December 2026"],
    ["United Kingdom", "Yes, with a residence authorisation and 3 years of legal residence", "Apply for this election", "1 December 2026 – 15 January 2027"],
    ["Norway", "Yes, with a residence permit and more than 3 years of legal residence", "Apply for this election", "1 December 2026 – 15 January 2027"],
    ["Bolivia, Cabo Verde, Chile, Colombia, Ecuador, Iceland, Korea, Paraguay, Peru, Trinidad and Tobago", "Yes, with a residence authorisation and 5 years of legal residence", "Apply for this election", "1 December 2026 – 15 January 2027"],
    ["New Zealand", "It has an agreement in force; confirm the conditions with the Electoral Census Office", "Apply for this election", "1 December 2026 – 15 January 2027"],
    ["Any other country", "No", "—", "—"],
  ],
  whoNote: "Sources: INE (Electoral Census Office), Orden EHA/2264/2010 and the Electoral Census Office's resolution of 10 November 2022, checked on 10 November 2026.",
  euTitle: "EU citizens: one declaration, by 30 December 2026",
  eu: [
    "If you hold the nationality of another EU country, live in Spain and will be 18 or older on polling day, you can vote in the local elections of 23 May 2027. The INE asks for two things: that you are on the padrón of your town, and that you have told the Electoral Census Office (Oficina del Censo Electoral, OCE) that you want to vote in Spain. Its deadline for both is **30 December 2026**.",
    "**The declaration is made once.** According to the INE, people who declared for an earlier election keep their place on the roll \"with no need to fill in a new declaration\", until they ask to be taken off or stop living in Spain. If you declared in order to vote in the local elections of 2023 or 2019, you have nothing to do.",
    "There are four ways to declare:",
  ],
  euWays: [
    `**Online with Cl@ve**, at any time of the year: ${a("declaration of the wish to vote, INE e-office", U.euClave)} (in Spanish). It works if your town hall has sent your padrón registration to the INE, you can identify yourself with Cl@ve and the INE has received your NIE from the central register of foreigners.`,
    `**Online with the letter's code**, if the OCE wrote to you and you have no Cl@ve: ${a("access with the CTT code", U.euCtt)}, open from 1 October to 30 December 2026.`,
    "**By post:** fill in and sign the declaration printed in the letter and send it to the OCE's office in your province. It needs no stamp.",
    `**At your town hall:** fill in the declaration form (modelo DFA) they have there. You can also ${a("download the form from the INE", U.dfaForm)} (PDF) and take it filled in.`,
  ],
  euAfter: [
    "**No letter?** The OCE wrote only to EU citizens it had not contacted for earlier local elections and who had never declared. If you received a letter years ago and let it pass, there will not be another: use Cl@ve or go to the town hall.",
    "**Not on the padrón yet?** Go to your town hall, register and make the declaration there on the same visit.",
    `The numbers show how many people have not done it. On 30 September 2026 the INE counted 345,312 EU citizens on the roll for local elections, and the OCE was writing to another 515,363 who had never declared. In Catalonia, 58,333 were on the roll and 104,614 letters went out: Barcelona 34,244 and 81,050, Girona 12,983 and 8,074, Tarragona 7,433 and 9,901, Lleida 3,673 and 5,589 (${a("INE press note", U.inePress)}, in Spanish).`,
    "The same procedure covers European Parliament elections: you choose municipal elections, European ones or both.",
  ],
  agreementTitle: "UK, Norway and the other agreement countries: apply between 1 December and 15 January",
  agreement: [
    `Spain has agreements in force with 13 countries whose nationals can vote in its local elections, as Spaniards can in theirs: Bolivia, Cabo Verde, Chile, Colombia, Ecuador, Iceland, Korea, New Zealand, Norway, Paraguay, Peru, Trinidad and Tobago and the United Kingdom (${a("INE list", U.ineAgreements)}, in Spanish). To apply you must:`,
  ],
  conditions: [
    "be 18 on polling day (if you are 17 when you apply and turn 18 by then, you can apply too);",
    "be on the padrón of the town where you live;",
    "hold a residence authorisation in Spain;",
    "have lived in Spain legally for as long as your country's agreement requires (see the table below).",
  ],
  agreementMid: [
    "**You apply for each election.** The roll for these voters is drawn up again every time, and the order that governs it says an entry is valid \"only for the municipal elections for which the application is made\". Having voted in May 2023 does not carry over to 2027.",
    "**The window is 1 December 2026 to 15 January 2027**, both days included. The OCE's resolution leaves no room for lateness: requests made outside the window, even as a later claim against the roll, are rejected.",
    "How to apply, according to that resolution:",
  ],
  agreementWays: [
    "**If the OCE writes to you:** write your NIE on the letter, sign it and post it to the OCE's office in your province. It needs no stamp. By 10 November 2026 the INE had not announced its mailing for 2027.",
    `**Online:** on the ${a("INE e-office", U.agreementOnline)}, with Cl@ve, or with your NIE and the code (CTT) printed in the letter. On 10 November 2026 the e-office did not list this procedure yet; we will add the direct link when the INE opens it.`,
    "**A letter with no code** means the OCE could check everything except that your residence permit is still valid. Sign it and post it with a photocopy of your valid TIE or a residence certificate from the police.",
    "**At your town hall, in person,** letter or no letter, if you believe you meet the conditions: show your TIE (foreigner's identity card) and hand in a photocopy. The town hall has the form.",
  ],
  agreementAfter: [
    "**Which ID.** Nationals of other EEA states (among the agreement countries, Norway and Iceland) and British nationals who were on the padrón before 1 January 2021 can identify themselves with their national identity card or passport as well as with the TIE.",
    "The OCE checks your years of legal residence against the central register of foreigners. If it cannot, you prove them with a residence certificate issued by the police.",
    "If your application is refused, the OCE must tell you why within fifteen days of receiving it.",
  ],
  yearsTitle: "Years of residence each agreement asks for",
  yearsCaption: "Legal, uninterrupted residence in Spain required to vote in local elections",
  yearsHeaders: ["Country", "Residence required", "Counted"],
  yearsRows: [
    ["United Kingdom", "At least 3 years", "Up to the day you apply"],
    ["Norway", "More than 3 years", "The BOE text gives no reference date"],
    ["Bolivia, Cabo Verde, Chile, Colombia, Ecuador, Iceland, Korea, Paraguay, Peru, Trinidad and Tobago", "At least 5 years", "Up to the day you apply"],
    ["New Zealand", "We do not print a figure", "Confirm it with the Electoral Census Office (900 343 232) or your town hall"],
  ],
  yearsNote: "Source: annex to the Electoral Census Office's resolution of 10 November 2022 (BOE-A-2022-18872). Every agreement also requires a residence authorisation and registration on the padrón.",
  calTitle: "Key dates",
  calCaption: "Foreign residents' calendar for the local elections of 23 May 2027",
  calHeaders: ["When", "What"],
  calRows: [
    ["1 October 2026", "EU citizens: online access with the letter's code (CTT) opens"],
    ["Tuesday 1 December 2026", "Agreement countries: applications open"],
    ["Wednesday 30 December 2026", "EU citizens: last day to register on the padrón and declare; access with the CTT code closes"],
    ["Friday 15 January 2027", "Agreement countries: last day to apply"],
    ["Monday 29 March 2027 (to be confirmed)", "Decree calling the elections; in the BOE on Tuesday 30 March"],
    ["5 to 12 April 2027 (to be confirmed)", "Roll lookup at town halls, and claims"],
    ["Sunday 23 May 2027", "Polling day"],
  ],
  calNote: "The first four dates are the INE's and the BOE's. The March and April dates are the electoral law (articles 42.3 and 39.2) applied to 23 May 2027: the decree has not been published.",
  rollTitle: "Checking the roll, and what to do if you are missing",
  roll: [
    "By law the decree calling local elections is issued on the 55th day before the fourth Sunday of May and printed in the BOE the next day: for 2027, Monday 29 and Tuesday 30 March. It has not been published yet, so treat those dates as to be confirmed.",
    "Once the election is called, town halls must offer a lookup of the roll for eight days, starting on the sixth day after the call. If the decree appears on 30 March, that is 5 to 12 April 2027.",
    "In those eight days anyone can file a claim with the OCE's provincial office, directly or through the town hall, about mistakes in their details or about being left off the roll despite having the right to be on it. The OCE decides within three days, and its decision can be appealed to the administrative court within five days of being notified.",
    "A claim does not reopen the deadline for agreement countries: the OCE rejects requests that were not made between 1 December and 15 January.",
  ],
  scopeTitle: "What this vote covers, and what it does not",
  scope: [
    "The right is to vote in municipal elections, for the council of the town where you live. The general election of 29 November 2026 is for Spanish citizens only. EU citizens can also vote in Spain in European Parliament elections, with the same declaration.",
  ],
  deadlineQuestion: "What is the deadline for foreigners to register for Spain's 2027 local elections?",
  faq: [
    { question: "I am British and live in Spain. Can I vote in the 2027 local elections?", answer: "Yes, if you hold a residence authorisation, are on the padrón of your town and have lived in Spain legally and without interruption for at least the three years before you apply. You must apply between 1 December 2026 and 15 January 2027, even if you voted in 2023, because the registration lasts for one election only. If you were on the padrón before 1 January 2021 you can identify yourself with your British passport as well as with the TIE." },
    { question: "I am an EU citizen and voted in the 2023 local elections. Do I have to register again?", answer: "No. According to the INE, EU citizens who declared their wish to vote for an earlier election stay on the roll without a new declaration, until they ask to be removed or stop living in Spain. With Cl@ve you can check your entry on the INE e-office." },
    { question: "I did not get a letter from the INE. Can I still register?", answer: "Yes. The letter only makes it easier. EU citizens can declare online with Cl@ve or at their town hall with the DFA form, by 30 December 2026. Nationals of agreement countries who believe they meet the conditions can apply at their town hall with their TIE and a photocopy, between 1 December 2026 and 15 January 2027." },
    { question: "I do not have Cl@ve. How do I register?", answer: "EU citizens: with the code (CTT) printed in the letter from the Electoral Census Office, by posting the letter back, or at the town hall. Agreement countries: with the NIE and the letter's code on the INE e-office, by post, or in person at the town hall." },
    { question: "Can foreign residents vote in the general election of 29 November 2026?", answer: "No. Only Spanish citizens vote in a general election (electoral law, article 2). Foreign residents' vote is for municipal elections, and EU citizens also have it for European Parliament elections." },
    { question: "I turn 18 before the election. Can I register?", answer: "EU citizens must be 18 on polling day, 23 May 2027. For the agreement countries, the order says that people who are 17 when they apply can do so if they will be 18 on polling day and meet the other conditions." },
    { question: "My country is on neither list. Can I vote?", answer: "No. Electoral law (article 176) gives the municipal vote to EU citizens and to nationals of countries that let Spaniards vote in theirs under a treaty. The list in force has 13 countries: Bolivia, Cabo Verde, Chile, Colombia, Ecuador, Iceland, Korea, New Zealand, Norway, Paraguay, Peru, Trinidad and Tobago and the United Kingdom." },
    { question: "I am from New Zealand. What do I need?", answer: "New Zealand is on the list of countries with an agreement in force, so the window from 1 December 2026 to 15 January 2027 applies to you. We do not print its residence requirement: confirm it with the Electoral Census Office (900 343 232) or at your town hall before you apply." },
    { question: "Have the 2027 local elections been called?", answer: "Not yet. The law sets them on the fourth Sunday of May, 23 May 2027, the date the INE already uses, and the decree is due on 29 March 2027, in the BOE on 30 March. The registration deadlines for foreign residents come earlier and do not wait for it." },
  ],
};

/* -------------------------------------------------------------------------- */
/* Castellano                                                                 */
/* -------------------------------------------------------------------------- */

const ES_EU_OPEN: Step = {
  title: "Ciudadanos de la UE: declara tu voluntad de votar hasta el miércoles 30 de diciembre de 2026",
  text: `Por internet con Cl@ve en la ${a("sede electrónica del INE", U.euClave)}, con la clave (CTT) de la carta del INE en ${a("este otro acceso", U.euCtt)}, devolviendo la carta por correo (sin sello) o en tu ayuntamiento. Si ya lo declaraste para unas elecciones anteriores, sigues en el censo y no tienes que hacer nada.`,
};
const ES_EU_CLOSED: Step = {
  title: "Ciudadanos de la UE: el plazo terminó el 30 de diciembre de 2026",
  text: `Si lo declaraste hasta ese día, o para unas elecciones anteriores, estás en el censo del 23 de mayo de 2027. El ${a("trámite con Cl@ve", U.euClave)} sigue abierto todo el año, pero el plazo del INE para estas elecciones ya pasó.`,
};
const ES_AGREEMENT_WAYS = `Devuelve la carta de la Oficina del Censo Electoral, hazlo en la ${a("sede electrónica del INE", U.agreementOnline)} con Cl@ve o con la clave de la carta, o ve a tu ayuntamiento con la tarjeta de identidad de extranjero (TIE) y una fotocopia. Hay que solicitarlo aunque votaras en 2023.`;
const ES_AGREEMENT_OPEN: Step = {
  title: "Países con acuerdo: solicita la inscripción hasta el viernes 15 de enero de 2027",
  text: `El plazo se abrió el 1 de diciembre de 2026 y termina el 15 de enero de 2027, ese día incluido. ${ES_AGREEMENT_WAYS}`,
};

const ES: Copy = {
  path: "guias/voto-extranjeros-elecciones-municipales",
  title: "Voto de los extranjeros en las elecciones municipales del 23 de mayo de 2027: quién puede votar, plazos y cómo inscribirse",
  excerpt: "Los ciudadanos de la UE y los nacionales de 13 países con acuerdo (Colombia, Ecuador, Perú o Reino Unido, entre ellos) pueden votar en las municipales del 23 de mayo de 2027. Plazos y trámite.",
  phases: {
    before: {
      seoTitle: "Voto de extranjeros en las municipales 2027: 30 dic y 15 ene",
      seoDescription: "Ciudadanos de la UE: declara tu voto hasta el 30 de diciembre de 2026. Colombia, Ecuador, Perú, Reino Unido y 9 países más: solicitud del 1 dic al 15 ene.",
      lead: "**Sí, si eres ciudadano de la Unión Europea o de uno de los 13 países con acuerdo de voto** (Colombia, Ecuador, Perú, Bolivia, Chile, Paraguay, Reino Unido o Noruega, entre otros) y estás empadronado en el municipio donde vives. Las próximas elecciones municipales son el **domingo 23 de mayo de 2027**. Los ciudadanos de la UE deben manifestar su voluntad de votar **hasta el miércoles 30 de diciembre de 2026**, una sola vez: quien ya lo hizo para unas elecciones anteriores sigue en el censo. Los nacionales de países con acuerdo deben solicitar la inscripción **entre el martes 1 de diciembre de 2026 y el viernes 15 de enero de 2027**, y de nuevo en cada elección. Nadie queda inscrito de oficio, y una solicitud fuera de plazo no sirve para 2027.",
      euStep: ES_EU_OPEN,
      agreementStep: {
        title: "Países con acuerdo: solicita la inscripción desde el martes 1 de diciembre",
        text: `El plazo va del 1 de diciembre de 2026 al viernes 15 de enero de 2027, ambos incluidos. ${ES_AGREEMENT_WAYS}`,
      },
      deadlineAnswer: "Para los ciudadanos de la UE, el miércoles 30 de diciembre de 2026: es el último día tanto para empadronarse como para manifestar la voluntad de votar. Para los nacionales de los 13 países con acuerdo (Colombia, Ecuador, Perú o Reino Unido, entre ellos), el plazo se abre el martes 1 de diciembre de 2026 y termina el viernes 15 de enero de 2027. Las dos fechas son del INE y del BOE, y ninguna depende del decreto de convocatoria, que aún no se ha publicado.",
    },
    open: {
      seoTitle: "Voto de extranjeros en las municipales 2027: 30 dic y 15 ene",
      seoDescription: "Ciudadanos de la UE: declara tu voto hasta el 30 de diciembre. Colombia, Ecuador, Perú, Reino Unido y 9 países más: plazo abierto hasta el 15 de enero.",
      lead: "**Sí, si eres ciudadano de la Unión Europea o de uno de los 13 países con acuerdo de voto** (Colombia, Ecuador, Perú, Bolivia, Chile, Paraguay, Reino Unido o Noruega, entre otros) y estás empadronado en el municipio donde vives. Las próximas elecciones municipales son el **domingo 23 de mayo de 2027**. Los ciudadanos de la UE deben manifestar su voluntad de votar **hasta el miércoles 30 de diciembre de 2026**, una sola vez: quien ya lo hizo para unas elecciones anteriores sigue en el censo. Los nacionales de países con acuerdo ya pueden solicitar la inscripción, **hasta el viernes 15 de enero de 2027**, y deben hacerlo de nuevo en cada elección. Nadie queda inscrito de oficio, y una solicitud fuera de plazo no sirve para 2027.",
      euStep: ES_EU_OPEN,
      agreementStep: ES_AGREEMENT_OPEN,
      deadlineAnswer: "Para los ciudadanos de la UE, el miércoles 30 de diciembre de 2026: es el último día tanto para empadronarse como para manifestar la voluntad de votar. Para los nacionales de los 13 países con acuerdo (Colombia, Ecuador, Perú o Reino Unido, entre ellos), el plazo se abrió el 1 de diciembre de 2026 y termina el viernes 15 de enero de 2027. Las dos fechas son del INE y del BOE, y ninguna depende del decreto de convocatoria, que aún no se ha publicado.",
    },
    euClosed: {
      seoTitle: "Voto de extranjeros en las municipales 2027: hasta el 15 ene",
      seoDescription: "Colombia, Ecuador, Perú, Reino Unido y 9 países más: solicita votar en las municipales de 2027 hasta el 15 de enero. El plazo de la UE acabó el 30 de dic.",
      lead: "**Sí, si entras en el censo electoral a tiempo.** Los nacionales de los 13 países con acuerdo de voto (Colombia, Ecuador, Perú, Bolivia, Chile, Paraguay, Reino Unido o Noruega, entre otros) pueden solicitar la inscripción **hasta el viernes 15 de enero de 2027** para votar en las municipales del **domingo 23 de mayo de 2027**, y deben hacerlo aunque votaran en 2023. Para los ciudadanos de la UE el plazo terminó el 30 de diciembre de 2026: quien manifestó su voluntad de votar hasta ese día, o para unas elecciones anteriores, está en el censo. En los dos casos hay que estar empadronado en el municipio donde se vive. Nadie queda inscrito de oficio, y una solicitud fuera de plazo no sirve para 2027.",
      euStep: ES_EU_CLOSED,
      agreementStep: ES_AGREEMENT_OPEN,
      deadlineAnswer: "Para los nacionales de los 13 países con acuerdo (Colombia, Ecuador, Perú o Reino Unido, entre ellos), el viernes 15 de enero de 2027, ese día incluido; el plazo se abrió el 1 de diciembre de 2026. Para los ciudadanos de la UE el plazo terminó el 30 de diciembre de 2026. Las dos fechas son del INE y del BOE.",
    },
    closed: {
      seoTitle: "Voto de extranjeros en las municipales 2027: plazos cerrados",
      seoDescription: "Los extranjeros votan el 23 de mayo de 2027 solo si se inscribieron a tiempo: la UE hasta el 30 de diciembre y los países con acuerdo hasta el 15 de enero.",
      lead: "**Solo si te inscribiste a tiempo.** Los dos plazos para que los residentes extranjeros entren en el censo de las municipales del **domingo 23 de mayo de 2027** ya han terminado: el 30 de diciembre de 2026 para los ciudadanos de la UE y el 15 de enero de 2027 para los nacionales de los 13 países con acuerdo de voto (Colombia, Ecuador, Perú o Reino Unido, entre ellos). Los ciudadanos de la UE que manifestaron su voluntad de votar para unas elecciones anteriores siguen en el censo sin hacer nada. Quien sea de un país con acuerdo y no lo solicitó en plazo no puede votar esta vez: su inscripción vale para una sola elección. Si te inscribiste, comprueba tus datos con Cl@ve en la sede electrónica del INE.",
      euStep: ES_EU_CLOSED,
      agreementStep: {
        title: "Países con acuerdo: el plazo terminó el 15 de enero de 2027",
        text: "Las solicitudes se presentaron del 1 de diciembre de 2026 al 15 de enero de 2027. La Oficina del Censo Electoral desestima las que llegan fuera de esas fechas, también si se presentan después como reclamación al censo.",
      },
      deadlineAnswer: "Los dos han terminado. Los ciudadanos de la UE tenían hasta el 30 de diciembre de 2026 para empadronarse y manifestar su voluntad de votar; los nacionales de los 13 países con acuerdo (Colombia, Ecuador, Perú o Reino Unido, entre ellos) pudieron solicitarlo del 1 de diciembre de 2026 al 15 de enero de 2027. La inscripción de un ciudadano de la UE es permanente, así que la hecha para unas elecciones anteriores sigue valiendo; los nacionales de países con acuerdo tendrán que solicitarla otra vez antes de las siguientes municipales.",
    },
  },
  stepsTitle: "Qué hacer, por orden",
  padronStep: {
    title: "Comprueba que estás empadronado",
    text: "Se vota en el municipio donde figuras en el padrón. Si no estás empadronado, ve primero a tu ayuntamiento: para los ciudadanos de la UE, el INE solo tiene en cuenta los empadronamientos hechos hasta el 30 de diciembre de 2026.",
  },
  checkStep: {
    title: "Comprueba que estás en el censo",
    text: `Con Cl@ve, la ${a("consulta de inscripción en el censo electoral", U.rollLookup)} del INE muestra tus datos. Para informarte sin Cl@ve, pregunta en tu ayuntamiento o en la delegación provincial de la Oficina del Censo Electoral, o llama al 900 343 232.`,
  },
  voteStep: {
    title: "Vota el domingo 23 de mayo de 2027",
    text: "La Oficina del Censo Electoral envía a cada elector una tarjeta censal con su mesa y su colegio. El decreto de convocatoria, que fija el calendario oficial, aún no se ha publicado.",
  },
  note: `Todo lo que hay en esta página sale de la Oficina del Censo Electoral (INE) y del BOE, leídos el 10 de noviembre de 2026. El decreto de convocatoria de las elecciones de 2027 aún no se ha publicado: las fechas que dependen de él van marcadas como «por confirmar». La página del INE para estas elecciones es ${a("esta", U.ine2027)}.`,
  whoTitle: "Quién puede votar, de un vistazo",
  whoCaption: "Residentes extranjeros y elecciones municipales del 23 de mayo de 2027",
  whoHeaders: ["Nacionalidad", "¿Puedes votar?", "Qué debes hacer", "Plazo"],
  whoRows: [
    ["Otro país de la UE", "Sí, con 18 años el día de la votación y empadronado", "Manifestar tu voluntad de votar, una sola vez", "30 de diciembre de 2026"],
    ["Bolivia, Cabo Verde, Chile, Colombia, Corea, Ecuador, Islandia, Paraguay, Perú, Trinidad y Tobago", "Sí, con autorización de residencia y 5 años de residencia legal", "Solicitar la inscripción para estas elecciones", "1 de diciembre de 2026 – 15 de enero de 2027"],
    ["Reino Unido", "Sí, con autorización de residencia y 3 años de residencia legal", "Solicitar la inscripción para estas elecciones", "1 de diciembre de 2026 – 15 de enero de 2027"],
    ["Noruega", "Sí, con permiso de residencia y más de 3 años de residencia legal", "Solicitar la inscripción para estas elecciones", "1 de diciembre de 2026 – 15 de enero de 2027"],
    ["Nueva Zelanda", "Tiene acuerdo en vigor; confirma las condiciones en la Oficina del Censo Electoral", "Solicitar la inscripción para estas elecciones", "1 de diciembre de 2026 – 15 de enero de 2027"],
    ["Cualquier otro país", "No", "—", "—"],
  ],
  whoNote: "Fuentes: INE (Oficina del Censo Electoral), Orden EHA/2264/2010 y Resolución de la Oficina del Censo Electoral de 10 de noviembre de 2022, consultadas el 10 de noviembre de 2026.",
  euTitle: "Ciudadanos de la UE: una sola declaración, hasta el 30 de diciembre de 2026",
  eu: [
    "Si tienes la nacionalidad de otro país de la Unión Europea, vives en España y el día de la votación tienes 18 años o más, puedes votar en las municipales del 23 de mayo de 2027. El INE pide dos cosas: estar empadronado en tu municipio y haber manifestado a la Oficina del Censo Electoral (OCE) tu voluntad de votar en España. El plazo para las dos es el **30 de diciembre de 2026**.",
    "**La declaración se hace una sola vez.** Según el INE, quienes la hicieron para unas elecciones anteriores mantienen su condición de electores «sin necesidad de cumplimentar una nueva declaración», hasta que pidan su exclusión o dejen de residir en España. Si la hiciste para votar en las municipales de 2023 o de 2019, no tienes que hacer nada.",
    "Hay cuatro maneras de hacerla:",
  ],
  euWays: [
    `**Por internet con Cl@ve**, en cualquier momento del año: ${a("manifestación de voluntad de voto, sede electrónica del INE", U.euClave)}. Funciona si tu ayuntamiento ha enviado tu empadronamiento al INE, puedes identificarte con Cl@ve y el INE ha recibido tu NIE del Registro Central de Extranjeros.`,
    `**Por internet con la clave de la carta**, si la OCE te ha escrito y no tienes Cl@ve: ${a("acceso con la clave CTT", U.euCtt)}, abierto del 1 de octubre al 30 de diciembre de 2026.`,
    "**Por correo:** rellena y firma la declaración que viene en la carta y envíala a la delegación provincial de la OCE. No necesita sello.",
    `**En tu ayuntamiento:** rellena el impreso de declaración (modelo DFA) que tienen allí. También puedes ${a("descargar el impreso del INE", U.dfaForm)} (PDF) y llevarlo cumplimentado.`,
  ],
  euAfter: [
    "**¿No te ha llegado la carta?** La OCE solo ha escrito a los ciudadanos de la UE a los que no se dirigió en municipales anteriores y que nunca habían manifestado su voluntad de votar. Si recibiste una carta hace años y la dejaste pasar, no llegará otra: usa Cl@ve o ve al ayuntamiento.",
    "**¿Aún no estás empadronado?** Ve a tu ayuntamiento, empadrónate y haz la declaración allí, en la misma visita.",
    `Las cifras dan una idea de cuánta gente no lo ha hecho. El 30 de septiembre de 2026 el INE contaba 345.312 ciudadanos de la UE en el censo de las municipales, y la OCE escribía a otros 515.363 que nunca se habían inscrito. En Cataluña había 58.333 inscritos y salieron 104.614 cartas: Barcelona, 34.244 y 81.050; Girona, 12.983 y 8.074; Tarragona, 7.433 y 9.901; Lleida, 3.673 y 5.589 (${a("nota de prensa del INE", U.inePress)}).`,
    "El mismo trámite sirve para las elecciones al Parlamento Europeo: eliges municipales, europeas o las dos.",
  ],
  agreementTitle: "Colombia, Ecuador, Perú, Reino Unido y los demás países con acuerdo: del 1 de diciembre al 15 de enero",
  agreement: [
    `España tiene acuerdos en vigor con 13 países cuyos nacionales pueden votar en las municipales, igual que los españoles en las suyas: Bolivia, Cabo Verde, Chile, Colombia, Corea, Ecuador, Islandia, Noruega, Nueva Zelanda, Paraguay, Perú, Reino Unido y Trinidad y Tobago (${a("relación del INE", U.ineAgreements)}). Para solicitar la inscripción debes:`,
  ],
  conditions: [
    "tener 18 años el día de la votación (si tienes 17 al solicitarlo y los cumples antes, también puedes pedirlo);",
    "estar empadronado en el municipio donde vives;",
    "tener autorización de residencia en España;",
    "haber residido legalmente en España el tiempo que exige el acuerdo de tu país (lo tienes en la tabla de más abajo).",
  ],
  agreementMid: [
    "**Se solicita en cada elección.** El censo de estos electores se forma de nuevo cada vez, y la orden que lo regula dice que las inscripciones son válidas «exclusivamente para las elecciones municipales para las que se realicen las solicitudes». Haber votado en mayo de 2023 no sirve para 2027.",
    "**El plazo va del 1 de diciembre de 2026 al 15 de enero de 2027**, ambos incluidos. La resolución de la OCE no deja margen: las solicitudes fuera de plazo se desestiman, también si se presentan después como reclamación al censo.",
    "Cómo solicitarlo, según esa resolución:",
  ],
  agreementWays: [
    "**Si la OCE te escribe:** anota tu NIE en la carta, fírmala y envíala por correo a la delegación provincial de la OCE. No necesita sello. A 10 de noviembre de 2026 el INE no había anunciado el envío para 2027.",
    `**Por internet:** en la ${a("sede electrónica del INE", U.agreementOnline)}, con Cl@ve o con el NIE y la clave (CTT) impresa en la carta. A 10 de noviembre de 2026 la sede aún no mostraba este trámite; añadiremos el enlace directo cuando el INE lo abra.`,
    "**Una carta sin clave** quiere decir que la OCE ha podido comprobarlo todo menos la vigencia de tu permiso de residencia. Fírmala y envíala con una fotocopia de la TIE en vigor o un certificado de residencia de la Comisaría de Policía.",
    "**En tu ayuntamiento, en persona,** con carta o sin ella, si crees que cumples las condiciones: identifícate con la TIE y entrega una fotocopia. El impreso lo tiene el ayuntamiento.",
  ],
  agreementAfter: [
    "**Con qué documento.** Los nacionales de otros Estados del Espacio Económico Europeo (de los países con acuerdo, Noruega e Islandia) y los británicos empadronados antes del 1 de enero de 2021 pueden identificarse, además de con la TIE, con el documento de identidad o el pasaporte de su país.",
    "La OCE comprueba los años de residencia legal en el Registro Central de Extranjeros. Si no puede, se acreditan con un certificado de residencia de la Comisaría de Policía.",
    "Si deniega la solicitud, la OCE debe notificártelo, con el motivo, en los quince días siguientes a recibirla.",
  ],
  yearsTitle: "Años de residencia que pide cada acuerdo",
  yearsCaption: "Residencia legal e ininterrumpida en España exigida para votar en las municipales",
  yearsHeaders: ["País", "Residencia exigida", "Cómo se cuenta"],
  yearsRows: [
    ["Bolivia, Cabo Verde, Chile, Colombia, Corea, Ecuador, Islandia, Paraguay, Perú, Trinidad y Tobago", "Al menos 5 años", "Hasta el día de la solicitud"],
    ["Reino Unido", "Al menos 3 años", "Hasta el día de la solicitud"],
    ["Noruega", "Más de 3 años", "El texto del BOE no da fecha de referencia"],
    ["Nueva Zelanda", "No damos cifra", "Confírmala en la Oficina del Censo Electoral (900 343 232) o en tu ayuntamiento"],
  ],
  yearsNote: "Fuente: anexo de la Resolución de la Oficina del Censo Electoral de 10 de noviembre de 2022 (BOE-A-2022-18872). Todos los acuerdos exigen además autorización de residencia y estar empadronado.",
  calTitle: "Fechas clave",
  calCaption: "Calendario de los residentes extranjeros para las municipales del 23 de mayo de 2027",
  calHeaders: ["Cuándo", "Qué"],
  calRows: [
    ["1 de octubre de 2026", "UE: se abre el acceso por internet con la clave (CTT) de la carta"],
    ["Martes 1 de diciembre de 2026", "Países con acuerdo: se abre el plazo de solicitud"],
    ["Miércoles 30 de diciembre de 2026", "UE: último día para empadronarse y manifestar la voluntad de votar; se cierra el acceso con CTT"],
    ["Viernes 15 de enero de 2027", "Países con acuerdo: último día para solicitar la inscripción"],
    ["Lunes 29 de marzo de 2027 (por confirmar)", "Decreto de convocatoria; en el BOE el martes 30 de marzo"],
    ["Del 5 al 12 de abril de 2027 (por confirmar)", "Consulta del censo en los ayuntamientos y reclamaciones"],
    ["Domingo 23 de mayo de 2027", "Día de la votación"],
  ],
  calNote: "Las cuatro primeras fechas son del INE y del BOE. Las de marzo y abril salen de aplicar la ley electoral (artículos 42.3 y 39.2) al 23 de mayo de 2027: el decreto aún no se ha publicado.",
  rollTitle: "Consultar el censo, y qué hacer si no apareces",
  roll: [
    "Por ley, el decreto de convocatoria de las municipales se expide el día 55 antes del cuarto domingo de mayo y se publica en el BOE al día siguiente: en 2027, el lunes 29 y el martes 30 de marzo. Aún no se ha publicado, así que esas fechas están por confirmar.",
    "Una vez convocadas las elecciones, los ayuntamientos deben mantener un servicio de consulta del censo durante ocho días, a partir del sexto día posterior a la convocatoria. Si el decreto sale el 30 de marzo, será del 5 al 12 de abril de 2027.",
    "En esos ocho días cualquier persona puede reclamar ante la delegación provincial de la OCE, directamente o a través del ayuntamiento, por errores en sus datos o por no figurar en el censo teniendo derecho a ello. La OCE resuelve en tres días, y contra su resolución cabe recurso ante el juez de lo contencioso-administrativo en los cinco días siguientes a la notificación.",
    "La reclamación no reabre el plazo de los países con acuerdo: la OCE desestima las solicitudes que no se presentaron entre el 1 de diciembre y el 15 de enero.",
  ],
  scopeTitle: "Para qué elecciones sirve, y para cuáles no",
  scope: [
    "El derecho es a votar en las elecciones municipales, para el ayuntamiento del municipio donde vives. En las generales del 29 de noviembre de 2026 solo votan los ciudadanos españoles. Los ciudadanos de la UE pueden votar además en España en las elecciones al Parlamento Europeo, con la misma declaración.",
  ],
  deadlineQuestion: "¿Hasta cuándo pueden inscribirse los extranjeros para votar en las municipales de 2027?",
  faq: [
    { question: "Soy colombiano, ecuatoriano o peruano y vivo en España. ¿Puedo votar en las municipales de 2027?", answer: "Sí, si tienes autorización de residencia, estás empadronado y has residido en España de forma legal e ininterrumpida al menos los cinco años anteriores a la solicitud. Debes solicitar la inscripción entre el 1 de diciembre de 2026 y el 15 de enero de 2027, aunque votaras en 2023, porque la inscripción vale para una sola elección. Lo mismo se aplica a Bolivia, Cabo Verde, Chile, Corea, Islandia, Paraguay y Trinidad y Tobago." },
    { question: "Soy británico y resido en España. ¿Puedo votar?", answer: "Sí, con autorización de residencia, empadronado y con al menos tres años de residencia legal e ininterrumpida antes de la solicitud, que se presenta entre el 1 de diciembre de 2026 y el 15 de enero de 2027. Si te empadronaste antes del 1 de enero de 2021 puedes identificarte con el pasaporte británico además de con la TIE." },
    { question: "Soy ciudadano de la UE y ya voté en las municipales de 2023. ¿Tengo que inscribirme otra vez?", answer: "No. Según el INE, los ciudadanos de la UE que manifestaron su voluntad de votar para unas elecciones anteriores siguen en el censo sin una nueva declaración, hasta que pidan su exclusión o dejen de residir en España. Con Cl@ve puedes comprobar tu inscripción en la sede electrónica del INE." },
    { question: "No me ha llegado la carta del INE. ¿Puedo inscribirme igualmente?", answer: "Sí. La carta solo facilita el trámite. Los ciudadanos de la UE pueden hacer la declaración por internet con Cl@ve o en su ayuntamiento con el modelo DFA, hasta el 30 de diciembre de 2026. Los nacionales de países con acuerdo que crean que cumplen las condiciones pueden solicitarlo en su ayuntamiento con la TIE y una fotocopia, entre el 1 de diciembre de 2026 y el 15 de enero de 2027." },
    { question: "No tengo Cl@ve. ¿Cómo lo hago?", answer: "Ciudadanos de la UE: con la clave (CTT) impresa en la carta de la Oficina del Censo Electoral, devolviendo la carta por correo o en el ayuntamiento. Países con acuerdo: con el NIE y la clave de la carta en la sede electrónica del INE, por correo o en persona en el ayuntamiento." },
    { question: "¿Pueden votar los extranjeros en las elecciones generales del 29 de noviembre de 2026?", answer: "No. En las generales solo votan los ciudadanos españoles (ley electoral, artículo 2). El voto de los residentes extranjeros es para las municipales, y los ciudadanos de la UE lo tienen también en las elecciones al Parlamento Europeo." },
    { question: "Cumplo 18 años antes de las elecciones. ¿Puedo inscribirme?", answer: "Los ciudadanos de la UE deben tener 18 años el día de la votación, el 23 de mayo de 2027. En los países con acuerdo, la orden permite solicitarlo a quien tenga 17 años al presentar la solicitud, si el día de la votación ha cumplido los 18 y reúne el resto de condiciones." },
    { question: "Mi país no está en ninguna de las dos listas. ¿Puedo votar?", answer: "No. La ley electoral (artículo 176) reconoce el voto en las municipales a los ciudadanos de la UE y a los nacionales de países que permiten votar a los españoles en las suyas en virtud de un tratado. La relación en vigor tiene 13 países: Bolivia, Cabo Verde, Chile, Colombia, Corea, Ecuador, Islandia, Noruega, Nueva Zelanda, Paraguay, Perú, Reino Unido y Trinidad y Tobago." },
    { question: "Soy de Nueva Zelanda. ¿Qué necesito?", answer: "Nueva Zelanda figura en la relación de países con acuerdo en vigor, así que te corresponde el plazo del 1 de diciembre de 2026 al 15 de enero de 2027. No publicamos su requisito de residencia: confírmalo en la Oficina del Censo Electoral (900 343 232) o en tu ayuntamiento antes de solicitarlo." },
    { question: "¿Ya están convocadas las municipales de 2027?", answer: "Todavía no. La ley las fija el cuarto domingo de mayo, el 23 de mayo de 2027, la fecha que ya usa el INE, y el decreto corresponde al 29 de marzo de 2027, con publicación en el BOE el día 30. Los plazos de inscripción de los residentes extranjeros son anteriores y no dependen de él." },
  ],
};

/* -------------------------------------------------------------------------- */
/* Català                                                                     */
/* -------------------------------------------------------------------------- */

const CA_EU_OPEN: Step = {
  title: "Ciutadans de la UE: declara la voluntat de votar fins al dimecres 30 de desembre del 2026",
  text: `Per internet amb Cl@ve a la ${a("seu electrònica de l'INE", U.euClave)}, amb la clau (CTT) de la carta de l'INE en ${a("aquest altre accés", U.euCtt)}, tornant la carta per correu (sense segell) o al teu ajuntament. Si ja ho vas declarar per a unes eleccions anteriors, continues al cens i no has de fer res.`,
};
const CA_EU_CLOSED: Step = {
  title: "Ciutadans de la UE: el termini es va acabar el 30 de desembre del 2026",
  text: `Si ho vas declarar fins aquell dia, o per a unes eleccions anteriors, ets al cens del 23 de maig del 2027. El ${a("tràmit amb Cl@ve", U.euClave)} continua obert tot l'any, però el termini de l'INE per a aquestes eleccions ja ha passat.`,
};
const CA_AGREEMENT_WAYS = `Torna la carta de l'Oficina del Cens Electoral, fes-ho a la ${a("seu electrònica de l'INE", U.agreementOnline)} amb Cl@ve o amb la clau de la carta, o ves al teu ajuntament amb la targeta d'identitat d'estranger (TIE) i una fotocòpia. Cal sol·licitar-ho encara que votessis el 2023.`;
const CA_AGREEMENT_OPEN: Step = {
  title: "Països amb acord: sol·licita la inscripció fins al divendres 15 de gener del 2027",
  text: `El termini es va obrir l'1 de desembre del 2026 i s'acaba el 15 de gener del 2027, aquell dia inclòs. ${CA_AGREEMENT_WAYS}`,
};

const CA: Copy = {
  path: "guies/vot-estrangers-eleccions-municipals",
  title: "Vot dels estrangers a les eleccions municipals del 23 de maig del 2027: qui pot votar, terminis i com inscriure-s'hi",
  excerpt: "Els ciutadans de la UE i els nacionals de 13 països amb acord (Colòmbia, l'Equador, el Perú o el Regne Unit, entre d'altres) poden votar a les municipals del 23 de maig del 2027. Terminis i tràmit.",
  phases: {
    before: {
      seoTitle: "Vot d'estrangers a les municipals 2027: 30 des i 15 gen",
      seoDescription: "Ciutadans de la UE: declara el vot fins al 30 de desembre del 2026. Colòmbia, Equador, Perú, Regne Unit i 9 països més: sol·licitud de l'1 des al 15 gen.",
      lead: "**Sí, si ets ciutadà de la Unió Europea o d'un dels 13 països amb acord de vot** (Colòmbia, l'Equador, el Perú, Bolívia, Xile, el Paraguai, el Regne Unit o Noruega, entre d'altres) i estàs empadronat al municipi on vius. Les pròximes eleccions municipals són el **diumenge 23 de maig del 2027**. Els ciutadans de la UE han de manifestar la voluntat de votar **fins al dimecres 30 de desembre del 2026**, una sola vegada: qui ja ho va fer per a unes eleccions anteriors continua al cens. Els nacionals de països amb acord han de sol·licitar la inscripció **entre el dimarts 1 de desembre del 2026 i el divendres 15 de gener del 2027**, i de nou a cada elecció. Ningú no queda inscrit d'ofici, i una sol·licitud fora de termini no serveix per al 2027.",
      euStep: CA_EU_OPEN,
      agreementStep: {
        title: "Països amb acord: sol·licita la inscripció a partir del dimarts 1 de desembre",
        text: `El termini va de l'1 de desembre del 2026 al divendres 15 de gener del 2027, tots dos inclosos. ${CA_AGREEMENT_WAYS}`,
      },
      deadlineAnswer: "Per als ciutadans de la UE, el dimecres 30 de desembre del 2026: és l'últim dia tant per empadronar-se com per manifestar la voluntat de votar. Per als nacionals dels 13 països amb acord (Colòmbia, l'Equador, el Perú o el Regne Unit, entre d'altres), el termini s'obre el dimarts 1 de desembre del 2026 i s'acaba el divendres 15 de gener del 2027. Totes dues dates són de l'INE i del BOE, i cap depèn del decret de convocatòria, que encara no s'ha publicat.",
    },
    open: {
      seoTitle: "Vot d'estrangers a les municipals 2027: 30 des i 15 gen",
      seoDescription: "Ciutadans de la UE: declara el vot fins al 30 de desembre del 2026. Colòmbia, Equador, Perú, Regne Unit i 9 països més: termini obert fins al 15 de gener.",
      lead: "**Sí, si ets ciutadà de la Unió Europea o d'un dels 13 països amb acord de vot** (Colòmbia, l'Equador, el Perú, Bolívia, Xile, el Paraguai, el Regne Unit o Noruega, entre d'altres) i estàs empadronat al municipi on vius. Les pròximes eleccions municipals són el **diumenge 23 de maig del 2027**. Els ciutadans de la UE han de manifestar la voluntat de votar **fins al dimecres 30 de desembre del 2026**, una sola vegada: qui ja ho va fer per a unes eleccions anteriors continua al cens. Els nacionals de països amb acord ja poden sol·licitar la inscripció, **fins al divendres 15 de gener del 2027**, i ho han de fer de nou a cada elecció. Ningú no queda inscrit d'ofici, i una sol·licitud fora de termini no serveix per al 2027.",
      euStep: CA_EU_OPEN,
      agreementStep: CA_AGREEMENT_OPEN,
      deadlineAnswer: "Per als ciutadans de la UE, el dimecres 30 de desembre del 2026: és l'últim dia tant per empadronar-se com per manifestar la voluntat de votar. Per als nacionals dels 13 països amb acord (Colòmbia, l'Equador, el Perú o el Regne Unit, entre d'altres), el termini es va obrir l'1 de desembre del 2026 i s'acaba el divendres 15 de gener del 2027. Totes dues dates són de l'INE i del BOE, i cap depèn del decret de convocatòria, que encara no s'ha publicat.",
    },
    euClosed: {
      seoTitle: "Vot d'estrangers a les municipals 2027: fins al 15 de gener",
      seoDescription: "Colòmbia, Equador, Perú, Regne Unit i 9 països més: sol·licita votar a les municipals del 2027 fins al 15 de gener. El termini de la UE era el 30 des.",
      lead: "**Sí, si entres al cens electoral a temps.** Els nacionals dels 13 països amb acord de vot (Colòmbia, l'Equador, el Perú, Bolívia, Xile, el Paraguai, el Regne Unit o Noruega, entre d'altres) poden sol·licitar la inscripció **fins al divendres 15 de gener del 2027** per votar a les municipals del **diumenge 23 de maig del 2027**, i ho han de fer encara que votessin el 2023. Per als ciutadans de la UE el termini es va acabar el 30 de desembre del 2026: qui va manifestar la voluntat de votar fins aquell dia, o per a unes eleccions anteriors, és al cens. En tots dos casos cal estar empadronat al municipi on es viu. Ningú no queda inscrit d'ofici, i una sol·licitud fora de termini no serveix per al 2027.",
      euStep: CA_EU_CLOSED,
      agreementStep: CA_AGREEMENT_OPEN,
      deadlineAnswer: "Per als nacionals dels 13 països amb acord (Colòmbia, l'Equador, el Perú o el Regne Unit, entre d'altres), el divendres 15 de gener del 2027, aquell dia inclòs; el termini es va obrir l'1 de desembre del 2026. Per als ciutadans de la UE el termini es va acabar el 30 de desembre del 2026. Totes dues dates són de l'INE i del BOE.",
    },
    closed: {
      seoTitle: "Vot d'estrangers a les municipals 2027: terminis tancats",
      seoDescription: "Els estrangers voten el 23 de maig del 2027 només si es van inscriure a temps: la UE fins al 30 de desembre i els països amb acord fins al 15 de gener.",
      lead: "**Només si et vas inscriure a temps.** Els dos terminis perquè els residents estrangers entrin al cens de les municipals del **diumenge 23 de maig del 2027** ja s'han acabat: el 30 de desembre del 2026 per als ciutadans de la UE i el 15 de gener del 2027 per als nacionals dels 13 països amb acord de vot (Colòmbia, l'Equador, el Perú o el Regne Unit, entre d'altres). Els ciutadans de la UE que van manifestar la voluntat de votar per a unes eleccions anteriors continuen al cens sense fer res. Qui sigui d'un país amb acord i no ho va sol·licitar dins del termini no pot votar aquesta vegada: la seva inscripció val per a una sola elecció. Si et vas inscriure, comprova les teves dades amb Cl@ve a la seu electrònica de l'INE.",
      euStep: CA_EU_CLOSED,
      agreementStep: {
        title: "Països amb acord: el termini es va acabar el 15 de gener del 2027",
        text: "Les sol·licituds es van presentar de l'1 de desembre del 2026 al 15 de gener del 2027. L'Oficina del Cens Electoral desestima les que arriben fora d'aquestes dates, també si es presenten després com a reclamació al cens.",
      },
      deadlineAnswer: "Tots dos s'han acabat. Els ciutadans de la UE tenien fins al 30 de desembre del 2026 per empadronar-se i manifestar la voluntat de votar; els nacionals dels 13 països amb acord (Colòmbia, l'Equador, el Perú o el Regne Unit, entre d'altres) ho van poder sol·licitar de l'1 de desembre del 2026 al 15 de gener del 2027. La inscripció d'un ciutadà de la UE és permanent, de manera que la feta per a unes eleccions anteriors continua valent; els nacionals de països amb acord l'hauran de sol·licitar una altra vegada abans de les municipals següents.",
    },
  },
  stepsTitle: "Què has de fer, per ordre",
  padronStep: {
    title: "Comprova que estàs empadronat",
    text: "Es vota al municipi on consta que vius, segons el padró. Si no estàs empadronat, ves primer al teu ajuntament: per als ciutadans de la UE, l'INE només té en compte els empadronaments fets fins al 30 de desembre del 2026.",
  },
  checkStep: {
    title: "Comprova que ets al cens",
    text: `Amb Cl@ve, la ${a("consulta d'inscripció al cens electoral", U.rollLookup)} de l'INE mostra les teves dades. Per informar-te'n sense Cl@ve, pregunta al teu ajuntament o a la delegació provincial de l'Oficina del Cens Electoral, o truca al 900 343 232.`,
  },
  voteStep: {
    title: "Vota el diumenge 23 de maig del 2027",
    text: "L'Oficina del Cens Electoral envia a cada elector una targeta censal amb la mesa i el col·legi. El decret de convocatòria, que fixa el calendari oficial, encara no s'ha publicat.",
  },
  note: `Tot el que hi ha en aquesta pàgina surt de l'Oficina del Cens Electoral (INE) i del BOE, llegits el 10 de novembre de 2026. El decret de convocatòria de les eleccions del 2027 encara no s'ha publicat: les dates que en depenen van marcades com a «per confirmar». La pàgina de l'INE per a aquestes eleccions és ${a("aquesta", U.ine2027)}.`,
  whoTitle: "Qui pot votar, d'un cop d'ull",
  whoCaption: "Residents estrangers i eleccions municipals del 23 de maig del 2027",
  whoHeaders: ["Nacionalitat", "Pots votar?", "Què has de fer", "Termini"],
  whoRows: [
    ["Un altre país de la UE", "Sí, amb 18 anys el dia de la votació i empadronat", "Manifestar la voluntat de votar, una sola vegada", "30 de desembre del 2026"],
    ["Bolívia, Cap Verd, Colòmbia, Corea, Equador, Islàndia, Paraguai, Perú, Trinitat i Tobago, Xile", "Sí, amb autorització de residència i 5 anys de residència legal", "Sol·licitar la inscripció per a aquestes eleccions", "1 de desembre del 2026 – 15 de gener del 2027"],
    ["Regne Unit", "Sí, amb autorització de residència i 3 anys de residència legal", "Sol·licitar la inscripció per a aquestes eleccions", "1 de desembre del 2026 – 15 de gener del 2027"],
    ["Noruega", "Sí, amb permís de residència i més de 3 anys de residència legal", "Sol·licitar la inscripció per a aquestes eleccions", "1 de desembre del 2026 – 15 de gener del 2027"],
    ["Nova Zelanda", "Té acord en vigor; confirma les condicions a l'Oficina del Cens Electoral", "Sol·licitar la inscripció per a aquestes eleccions", "1 de desembre del 2026 – 15 de gener del 2027"],
    ["Qualsevol altre país", "No", "—", "—"],
  ],
  whoNote: "Fonts: INE (Oficina del Cens Electoral), Ordre EHA/2264/2010 i Resolució de l'Oficina del Cens Electoral de 10 de novembre de 2022, consultades el 10 de novembre de 2026.",
  euTitle: "Ciutadans de la UE: una sola declaració, fins al 30 de desembre del 2026",
  eu: [
    "Si tens la nacionalitat d'un altre país de la Unió Europea, vius a Espanya i el dia de la votació tens 18 anys o més, pots votar a les municipals del 23 de maig del 2027. L'INE demana dues coses: estar empadronat al teu municipi i haver manifestat a l'Oficina del Cens Electoral (OCE) la voluntat de votar a Espanya. El termini per a totes dues és el **30 de desembre del 2026**.",
    "**La declaració es fa una sola vegada.** Segons l'INE, els qui la van fer per a unes eleccions anteriors mantenen la condició d'electors sense haver d'omplir una nova declaració, fins que demanin l'exclusió o deixin de residir a Espanya. Si la vas fer per votar a les municipals del 2023 o del 2019, no has de fer res.",
    "Hi ha quatre maneres de fer-la:",
  ],
  euWays: [
    `**Per internet amb Cl@ve**, en qualsevol moment de l'any: ${a("manifestació de voluntat de vot, seu electrònica de l'INE", U.euClave)}. Funciona si el teu ajuntament ha enviat el teu empadronament a l'INE, et pots identificar amb Cl@ve i l'INE ha rebut el teu NIE del Registre Central d'Estrangers.`,
    `**Per internet amb la clau de la carta**, si l'OCE t'ha escrit i no tens Cl@ve: ${a("accés amb la clau CTT", U.euCtt)}, obert de l'1 d'octubre al 30 de desembre del 2026.`,
    "**Per correu:** omple i signa la declaració que ve a la carta i envia-la a la delegació provincial de l'OCE. No necessita segell.",
    `**Al teu ajuntament:** omple l'imprès de declaració (model DFA) que hi tenen. També pots ${a("descarregar l'imprès de l'INE", U.dfaForm)} (PDF) i portar-lo emplenat.`,
  ],
  euAfter: [
    "**No t'ha arribat la carta?** L'OCE només ha escrit als ciutadans de la UE als quals no es va adreçar en municipals anteriors i que no havien manifestat mai la voluntat de votar. Si vas rebre una carta fa anys i la vas deixar passar, no n'arribarà cap altra: fes servir Cl@ve o ves a l'ajuntament.",
    "**Encara no estàs empadronat?** Ves al teu ajuntament, empadrona-t'hi i fes la declaració allà mateix, en la mateixa visita.",
    `Les xifres donen una idea de quanta gent no ho ha fet. El 30 de setembre del 2026 l'INE comptava 345.312 ciutadans de la UE al cens de les municipals, i l'OCE escrivia a 515.363 més que no s'hi havien inscrit mai. A Catalunya n'hi havia 58.333 d'inscrits i van sortir 104.614 cartes: Barcelona, 34.244 i 81.050; Girona, 12.983 i 8.074; Tarragona, 7.433 i 9.901; Lleida, 3.673 i 5.589 (${a("nota de premsa de l'INE", U.inePress)}).`,
    "El mateix tràmit serveix per a les eleccions al Parlament Europeu: tries municipals, europees o totes dues.",
  ],
  agreementTitle: "Colòmbia, l'Equador, el Perú, el Regne Unit i la resta de països amb acord: de l'1 de desembre al 15 de gener",
  agreement: [
    `Espanya té acords en vigor amb 13 països els nacionals dels quals poden votar a les municipals, igual que els espanyols a les seves: Bolívia, Cap Verd, Colòmbia, Corea, l'Equador, Islàndia, Noruega, Nova Zelanda, el Paraguai, el Perú, el Regne Unit, Trinitat i Tobago i Xile (${a("relació de l'INE", U.ineAgreements)}). Per sol·licitar la inscripció cal:`,
  ],
  conditions: [
    "tenir 18 anys el dia de la votació (si en tens 17 quan ho sol·licites i els fas abans, també ho pots demanar);",
    "estar empadronat al municipi on vius;",
    "tenir autorització de residència a Espanya;",
    "haver residit legalment a Espanya el temps que exigeix l'acord del teu país (el tens a la taula de més avall).",
  ],
  agreementMid: [
    "**Se sol·licita a cada elecció.** El cens d'aquests electors es forma de nou cada vegada, i l'ordre que el regula diu que les inscripcions són vàlides només per a les eleccions municipals per a les quals es fan les sol·licituds. Haver votat el maig del 2023 no serveix per al 2027.",
    "**El termini va de l'1 de desembre del 2026 al 15 de gener del 2027**, tots dos inclosos. La resolució de l'OCE no deixa marge: les sol·licituds fora de termini es desestimen, també si es presenten després com a reclamació al cens.",
    "Com sol·licitar-ho, segons aquesta resolució:",
  ],
  agreementWays: [
    "**Si l'OCE t'escriu:** anota el teu NIE a la carta, signa-la i envia-la per correu a la delegació provincial de l'OCE. No necessita segell. El 10 de novembre de 2026 l'INE no havia anunciat l'enviament per al 2027.",
    `**Per internet:** a la ${a("seu electrònica de l'INE", U.agreementOnline)}, amb Cl@ve o amb el NIE i la clau (CTT) impresa a la carta. El 10 de novembre de 2026 la seu encara no mostrava aquest tràmit; hi afegirem l'enllaç directe quan l'INE l'obri.`,
    "**Una carta sense clau** vol dir que l'OCE ho ha pogut comprovar tot excepte la vigència del teu permís de residència. Signa-la i envia-la amb una fotocòpia de la TIE en vigor o un certificat de residència de la Comissaria de Policia.",
    "**Al teu ajuntament, en persona,** amb carta o sense, si creus que compleixes les condicions: identifica't amb la TIE i lliura'n una fotocòpia. L'imprès el té l'ajuntament.",
  ],
  agreementAfter: [
    "**Amb quin document.** Els nacionals d'altres estats de l'Espai Econòmic Europeu (dels països amb acord, Noruega i Islàndia) i els britànics empadronats abans de l'1 de gener del 2021 es poden identificar amb la TIE o bé amb el document d'identitat o el passaport del seu país.",
    "L'OCE comprova els anys de residència legal al Registre Central d'Estrangers. Si no pot, s'acrediten amb un certificat de residència de la Comissaria de Policia.",
    "Si denega la sol·licitud, l'OCE t'ho ha de notificar, amb el motiu, en els quinze dies següents a la recepció.",
  ],
  yearsTitle: "Anys de residència que demana cada acord",
  yearsCaption: "Residència legal i ininterrompuda a Espanya exigida per votar a les municipals",
  yearsHeaders: ["País", "Residència exigida", "Com es compta"],
  yearsRows: [
    ["Bolívia, Cap Verd, Colòmbia, Corea, Equador, Islàndia, Paraguai, Perú, Trinitat i Tobago, Xile", "Almenys 5 anys", "Fins al dia de la sol·licitud"],
    ["Regne Unit", "Almenys 3 anys", "Fins al dia de la sol·licitud"],
    ["Noruega", "Més de 3 anys", "El text del BOE no dona data de referència"],
    ["Nova Zelanda", "No en donem cap xifra", "Confirma-la a l'Oficina del Cens Electoral (900 343 232) o al teu ajuntament"],
  ],
  yearsNote: "Font: annex de la Resolució de l'Oficina del Cens Electoral de 10 de novembre de 2022 (BOE-A-2022-18872). Tots els acords exigeixen a més autorització de residència i estar empadronat.",
  calTitle: "Dates clau",
  calCaption: "Calendari dels residents estrangers per a les municipals del 23 de maig del 2027",
  calHeaders: ["Quan", "Què"],
  calRows: [
    ["1 d'octubre del 2026", "UE: s'obre l'accés per internet amb la clau (CTT) de la carta"],
    ["Dimarts 1 de desembre del 2026", "Països amb acord: s'obre el termini de sol·licitud"],
    ["Dimecres 30 de desembre del 2026", "UE: últim dia per empadronar-se i manifestar la voluntat de votar; es tanca l'accés amb CTT"],
    ["Divendres 15 de gener del 2027", "Països amb acord: últim dia per sol·licitar la inscripció"],
    ["Dilluns 29 de març del 2027 (per confirmar)", "Decret de convocatòria; al BOE el dimarts 30 de març"],
    ["Del 5 al 12 d'abril del 2027 (per confirmar)", "Consulta del cens als ajuntaments i reclamacions"],
    ["Diumenge 23 de maig del 2027", "Dia de la votació"],
  ],
  calNote: "Les quatre primeres dates són de l'INE i del BOE. Les de març i abril surten d'aplicar la llei electoral (articles 42.3 i 39.2) al 23 de maig del 2027: el decret encara no s'ha publicat.",
  rollTitle: "Consultar el cens, i què fer si no hi surts",
  roll: [
    "Per llei, el decret de convocatòria de les municipals s'expedeix el dia 55 abans del quart diumenge de maig i es publica al BOE l'endemà: el 2027, el dilluns 29 i el dimarts 30 de març. Encara no s'ha publicat, de manera que aquestes dates estan per confirmar.",
    "Un cop convocades les eleccions, els ajuntaments han de mantenir un servei de consulta del cens durant vuit dies, a partir del sisè dia posterior a la convocatòria. Si el decret surt el 30 de març, serà del 5 al 12 d'abril del 2027.",
    "En aquests vuit dies qualsevol persona pot reclamar davant la delegació provincial de l'OCE, directament o a través de l'ajuntament, per errors en les seves dades o perquè no figura al cens tot i tenir-hi dret. L'OCE resol en tres dies, i contra la seva resolució es pot recórrer davant el jutge contenciós administratiu en els cinc dies següents a la notificació.",
    "La reclamació no reobre el termini dels països amb acord: l'OCE desestima les sol·licituds que no es van presentar entre l'1 de desembre i el 15 de gener.",
  ],
  scopeTitle: "Per a quines eleccions serveix, i per a quines no",
  scope: [
    "El dret és a votar a les eleccions municipals, per a l'ajuntament del municipi on vius. A les generals del 29 de novembre del 2026 només voten els ciutadans espanyols. Els ciutadans de la UE poden votar a més a Espanya a les eleccions al Parlament Europeu, amb la mateixa declaració.",
  ],
  deadlineQuestion: "Fins quan es poden inscriure els estrangers per votar a les municipals del 2027?",
  faq: [
    { question: "Soc colombià, equatorià o peruà i visc a Catalunya. Puc votar a les municipals del 2027?", answer: "Sí, si tens autorització de residència, estàs empadronat i has residit a Espanya de manera legal i ininterrompuda almenys els cinc anys anteriors a la sol·licitud. Has de sol·licitar la inscripció entre l'1 de desembre del 2026 i el 15 de gener del 2027, encara que votessis el 2023, perquè la inscripció val per a una sola elecció. El mateix s'aplica a Bolívia, Cap Verd, Corea, Islàndia, el Paraguai, Trinitat i Tobago i Xile." },
    { question: "Soc britànic i resideixo a Catalunya. Puc votar?", answer: "Sí, amb autorització de residència, empadronat i amb almenys tres anys de residència legal i ininterrompuda abans de la sol·licitud, que es presenta entre l'1 de desembre del 2026 i el 15 de gener del 2027. Si et vas empadronar abans de l'1 de gener del 2021 et pots identificar amb la TIE o bé amb el passaport britànic." },
    { question: "Soc ciutadà de la UE i ja vaig votar a les municipals del 2023. M'he de tornar a inscriure?", answer: "No. Segons l'INE, els ciutadans de la UE que van manifestar la voluntat de votar per a unes eleccions anteriors continuen al cens sense cap nova declaració, fins que demanin l'exclusió o deixin de residir a Espanya. Amb Cl@ve pots comprovar la teva inscripció a la seu electrònica de l'INE." },
    { question: "No m'ha arribat la carta de l'INE. M'hi puc inscriure igualment?", answer: "Sí. La carta només facilita el tràmit. Els ciutadans de la UE poden fer la declaració per internet amb Cl@ve o al seu ajuntament amb el model DFA, fins al 30 de desembre del 2026. Els nacionals de països amb acord que creguin que compleixen les condicions ho poden sol·licitar al seu ajuntament amb la TIE i una fotocòpia, entre l'1 de desembre del 2026 i el 15 de gener del 2027." },
    { question: "No tinc Cl@ve. Com ho faig?", answer: "Ciutadans de la UE: amb la clau (CTT) impresa a la carta de l'Oficina del Cens Electoral, tornant la carta per correu o a l'ajuntament. Països amb acord: amb el NIE i la clau de la carta a la seu electrònica de l'INE, per correu o en persona a l'ajuntament." },
    { question: "Poden votar els estrangers a les eleccions generals del 29 de novembre del 2026?", answer: "No. A les generals només voten els ciutadans espanyols (llei electoral, article 2). El vot dels residents estrangers és per a les municipals, i els ciutadans de la UE el tenen també a les eleccions al Parlament Europeu." },
    { question: "Faig 18 anys abans de les eleccions. M'hi puc inscriure?", answer: "Els ciutadans de la UE han de tenir 18 anys el dia de la votació, el 23 de maig del 2027. Als països amb acord, l'ordre permet sol·licitar-ho a qui tingui 17 anys en presentar la sol·licitud, si el dia de la votació ja n'ha fet 18 i compleix la resta de condicions." },
    { question: "El meu país no és a cap de les dues llistes. Puc votar?", answer: "No. La llei electoral (article 176) reconeix el vot a les municipals als ciutadans de la UE i als nacionals de països que permeten votar als espanyols a les seves en virtut d'un tractat. La relació en vigor té 13 països: Bolívia, Cap Verd, Colòmbia, Corea, l'Equador, Islàndia, Noruega, Nova Zelanda, el Paraguai, el Perú, el Regne Unit, Trinitat i Tobago i Xile." },
    { question: "Soc de Nova Zelanda. Què necessito?", answer: "Nova Zelanda figura a la relació de països amb acord en vigor, de manera que et correspon el termini de l'1 de desembre del 2026 al 15 de gener del 2027. No publiquem el seu requisit de residència: confirma'l a l'Oficina del Cens Electoral (900 343 232) o al teu ajuntament abans de sol·licitar-ho." },
    { question: "Ja estan convocades les municipals del 2027?", answer: "Encara no. La llei les fixa el quart diumenge de maig, el 23 de maig del 2027, la data que ja fa servir l'INE, i el decret correspon al 29 de març del 2027, amb publicació al BOE el dia 30. Els terminis d'inscripció dels residents estrangers són anteriors i no en depenen." },
  ],
};

/* -------------------------------------------------------------------------- */
/* Assembly                                                                   */
/* -------------------------------------------------------------------------- */

const COPY: Record<Locale, Copy> = { ca: CA, es: ES, en: EN };

/** Same-language links to the two election pages this guide hangs from. */
const RELATED_LINE: Record<Locale, (voting: string, results: string) => string> = {
  ca: (voting, results) => `Com es vota el dia de les eleccions, pas a pas, ho expliquem a ${voting}; què es va votar a Catalunya la darrera vegada, a ${results}.`,
  es: (voting, results) => `Cómo se vota el día de las elecciones, paso a paso, lo explicamos en ${voting}; qué se votó en Cataluña la última vez, en ${results}.`,
  en: (voting, results) => `How voting works on the day, step by step, is in ${voting}; how Catalonia voted last time is in ${results}.`,
};
const VOTING_LABEL: Record<Locale, string> = {
  ca: "la guia per votar a Espanya",
  es: "la guía para votar en España",
  en: "our guide to voting in Spain",
};
const RESULTS_LABEL: Record<Locale, string> = {
  ca: "els resultats de les municipals del 2023",
  es: "los resultados de las municipales de 2023",
  en: "the 2023 local election results",
};

function body(locale: Locale, phase: ForeignVotePhase): Block[] {
  const t = COPY[locale];
  const p = t.phases[phase];
  return [
    lead(p.lead),
    steps(t.stepsTitle, [t.padronStep, p.euStep, p.agreementStep, t.checkStep, t.voteStep]),
    languageLinks(),
    callout("official", verifiedLine(locale, FOREIGN_VOTE_AS_OF), t.note),
    ...h2(t.whoTitle),
    table(t.whoCaption, t.whoHeaders, t.whoRows, t.whoNote),
    ...h2(t.euTitle, ...t.eu),
    list(...t.euWays),
    ...paras(...t.euAfter),
    ...h2(t.agreementTitle, ...t.agreement),
    list(...t.conditions),
    ...paras(...t.agreementMid),
    list(...t.agreementWays),
    ...paras(...t.agreementAfter),
    ...h2(t.yearsTitle),
    table(t.yearsCaption, t.yearsHeaders, t.yearsRows, t.yearsNote),
    ...h2(t.calTitle),
    table(t.calCaption, t.calHeaders, t.calRows, t.calNote),
    ...h2(t.rollTitle, ...t.roll),
    ...h2(t.scopeTitle, ...t.scope),
    ...paras(
      RELATED_LINE[locale](
        b2link("voting", locale, VOTING_LABEL[locale]),
        b2link("municipalResults", locale, RESULTS_LABEL[locale]),
      ),
    ),
    faq([{ question: t.deadlineQuestion, answer: p.deadlineAnswer }, ...t.faq]),
    ...b2Related(["municipalResults", "voting", "electionNight"], locale),
  ];
}

/**
 * The guide as it reads on `asOf` (Europe/Madrid, yyyy-mm-dd). The default is
 * the day it was last verified; tests build the later phases explicitly.
 */
export function buildForeignVote(asOf: string = FOREIGN_VOTE_AS_OF): B2Article {
  const phase = foreignVotePhase(asOf);
  return {
    key: "foreignVote",
    entryKey: "guide-foreign-residents-vote-municipal-elections",
    categoryKey: "public-services",
    sources: SOURCES,
    // Barcelona city hall on election night: already in the manifest
    // (CC BY-SA 3.0) and used by the 2023 results page. No new image.
    heroKey: MUNICIPAL_RESULTS.heroKey,
    heroAlt: MUNICIPAL_RESULTS.heroAlt,
    heroCaption: MUNICIPAL_RESULTS.heroCaption,
    verifiedAt: FOREIGN_VOTE_AS_OF,
    publishedAt: "2026-11-10T12:00:00+01:00",
    editions: Object.fromEntries(
      (["ca", "es", "en"] as Locale[]).map((locale) => {
        const t = COPY[locale];
        const p = t.phases[phase];
        return [
          locale,
          {
            path: t.path,
            title: t.title,
            seoTitle: p.seoTitle,
            seoDescription: p.seoDescription,
            excerpt: t.excerpt,
            blocks: body(locale, phase),
          },
        ];
      }),
    ) as B2Article["editions"],
  };
}

export const FOREIGN_VOTE = buildForeignVote();

export const FOREIGN_VOTE_PATHS: Record<Locale, string> = {
  ca: COPY.ca.path,
  es: COPY.es.path,
  en: COPY.en.path,
};

