import "server-only";

import type { Poll } from "./types";

/**
 * THE poll figures. Import this file from `data.ts` only (a test fails
 * otherwise): `pollsPageData(now)` is what keeps every figure out of the
 * HTML, metadata, JSON-LD and RSC payload during the LOREG 69.7 blackout.
 *
 * Official sources only: the CIS (cis.es) and the CEO (Generalitat). Never a
 * private pollster, a media poll or an aggregator. Parties in the source's
 * order, figures exactly as printed (decimals kept). Fact pack:
 * research_notes/x10/enquestes-29n.md.
 *
 * Read on 5 Nov 2026:
 *  - CEO, Baròmetre d'Opinió Política 2a onada 2026, REO 1169 (14 Oct 2026):
 *    Congrés estimate for Catalonia, dossier p. 142 "Detall de l'estimació de
 *    vot al Congrés dels Diputats" (rows in that table's order; the logos read
 *    against the 23J-2023 column: 34,5 PSC, 11,2 Junts, 13,2 ERC, 13,4 PP,
 *    7,8 Vox, 14,0 Sumar, 2,8 CUP, Podemos blank). No provincial breakdown.
 *    Sample, margin, sampling and fieldwork: dossier p. 3 and the technical
 *    sheet; P45 non-response: statistical tables p. 31 (No ho sap 200, No
 *    contesta 100 of 2,000). CEO address: Generalitat directory, codInf 14372.
 *  - CIS: barometer of October 2026 (study 3582) is national only, so nothing
 *    from it here. Pre-electoral study 3584 in fieldwork (JEC Acuerdos
 *    267/2026, session 15 Oct; 288/2026, 22 Oct), no publication date. It
 *    must come out by 23 Nov. In 2023 the pre-electoral (3411) carried seat
 *    estimates per province: when 3584 is out, add its Catalan provinces as
 *    a table with columns barcelona/girona/lleida/tarragona.
 */

/** ISO date the CIS and CEO catalogues were last read for this file. */
export const POLLS_CHECKED_ON = "2026-11-05";

const CEO_DOCS = "https://documents.dadesobertes.gencat.cat/ceo/docs";
const CEO_LATEST = "https://web.gencat.cat/ca/generalitat/dades-indicadors/centre-estudis-opinio/darrers-estudis";
const JEC_3584 =
  "https://www.juntaelectoralcentral.es/cs/jec/doctrina/acuerdos?anyosesion=2026&esinstruccion=false&idacuerdoinstruccion=154402&idsesion=1116&template=Doctrina/JEC_Detalle";

export const POLLS: readonly Poll[] = [
  {
    id: "ceo-bop-2-2026",
    status: "published",
    org: "ceo",
    name: {
      ca: "Baròmetre d'Opinió Política, 2a onada 2026",
      es: "Barómetro de Opinión Política, 2.ª oleada de 2026",
      en: "Political Opinion Barometer, 2nd wave 2026",
    },
    study: "REO 1169",
    publishedOn: "2026-10-14",
    scope: {
      ca: "Estimació de vot i d'escons al Congrés dels Diputats per al conjunt de Catalunya. El CEO no en publica el detall per províncies.",
      es: "Estimación de voto y de escaños al Congreso de los Diputados para el conjunto de Cataluña. El CEO no publica el detalle por provincias.",
      en: "Vote and seat estimate for the Congress of Deputies for Catalonia as a whole. The CEO does not publish a breakdown by province.",
    },
    tables: [
      {
        caption: {
          ca: "Estimació de vot i escons al Congrés a Catalunya (CEO, 2a onada 2026)",
          es: "Estimación de voto y escaños al Congreso en Cataluña (CEO, 2.ª oleada de 2026)",
          en: "Congress vote and seat estimate for Catalonia (CEO, 2nd wave 2026)",
        },
        columns: ["vote", "voteCi", "seats"],
        rows: [
          { party: "PSC", vote: 29.6, voteCi: [29, 31], seats: [18, 19] },
          { party: "Junts", vote: 10.3, voteCi: [10, 12], seats: [4, 5] },
          { party: "ERC", vote: 19.0, voteCi: [17, 20], seats: [10, 11] },
          { party: "PP", vote: 13.1, voteCi: [12, 14], seats: [6, 7] },
          { party: "Vox", vote: 12.2, voteCi: [11, 13], seats: [5, 6] },
          { party: "Sumar", vote: 6.0, voteCi: [5, 7], seats: [2, 3] },
          { party: "CUP", vote: 2.8, voteCi: [2, 3], seats: [0, 1] },
          { party: "Podemos", vote: 2.5, voteCi: [1, 3], seats: [0, 0] },
        ],
        note: {
          ca: "Vot: percentatge sobre vot vàlid, amb l'interval de confiança del 95 % que dona el CEO. Escons: interval de confiança del 95 %. Candidatures en l'ordre de la taula «Detall de l'estimació de vot al Congrés dels Diputats» (dossier de premsa, p. 142). El CEO reparteix els escons per circumscripció, suposant una distribució del vot entre províncies semblant a la de les eleccions anteriors, però només en publica el total de Catalunya.",
          es: "Voto: porcentaje sobre voto válido, con el intervalo de confianza del 95 % que da el CEO. Escaños: intervalo de confianza del 95 %. Candidaturas en el orden de la tabla «Detall de l'estimació de vot al Congrés dels Diputats» (dosier de prensa, p. 142). El CEO reparte los escaños por circunscripción, suponiendo una distribución del voto entre provincias parecida a la de las elecciones anteriores, pero solo publica el total de Cataluña.",
          en: "Vote: share of the valid vote, with the CEO's 95% confidence interval. Seats: 95% confidence interval. Lists in the order of the table \"Detall de l'estimació de vot al Congrés dels Diputats\" (press dossier, p. 142). The CEO allocates seats by province, assuming the vote splits between provinces much as at the previous election, but publishes only the Catalonia total.",
        },
      },
    ],
    sheet: {
      organisation: {
        ca: "Centre d'Estudis d'Opinió (CEO), Generalitat de Catalunya: C. de Pau Claris, 138, 08009 Barcelona. Treball de camp: GESOP, Gabinet d'Estudis Socials i Opinió Pública, SL.",
        es: "Centre d'Estudis d'Opinió (CEO), Generalitat de Catalunya: C. de Pau Claris, 138, 08009 Barcelona. Trabajo de campo: GESOP, Gabinet d'Estudis Socials i Opinió Pública, SL.",
        en: "Centre d'Estudis d'Opinió (CEO), Generalitat de Catalunya: C. de Pau Claris, 138, 08009 Barcelona. Fieldwork: GESOP, Gabinet d'Estudis Socials i Opinió Pública, SL.",
      },
      client: {
        ca: "El mateix CEO, promotor de l'estudi.",
        es: "El propio CEO, promotor del estudio.",
        en: "The CEO itself, which commissioned the study.",
      },
      universe: {
        ca: "Població amb ciutadania espanyola de 18 anys i més resident a Catalunya.",
        es: "Población con ciudadanía española de 18 años o más residente en Cataluña.",
        en: "Spanish citizens aged 18 and over living in Catalonia.",
      },
      sample: {
        ca: "2.000 entrevistes: Barcelona 1.504, Girona 175, Lleida 119 i Tarragona 202.",
        es: "2.000 entrevistas: Barcelona 1.504, Girona 175, Lleida 119 y Tarragona 202.",
        en: "2,000 interviews: Barcelona 1,504, Girona 175, Lleida 119 and Tarragona 202.",
      },
      margin: {
        ca: "±2,19 % per al conjunt de la mostra, amb un nivell de confiança del 95 % i p = q = 0,5.",
        es: "±2,19 % para el conjunto de la muestra, con un nivel de confianza del 95 % y p = q = 0,5.",
        en: "±2.19% for the whole sample, at a 95% confidence level with p = q = 0.5.",
      },
      sampling: {
        ca: "Polietàpic: 236 seccions censals triades per mostreig aleatori estratificat (6 estrats per similitud electoral), rutes aleatòries dins de cada secció i quotes encreuades de sexe, edat i lloc de naixement. El 21 % de les entrevistes es van fer en seccions substitutes triades pel CEO.",
        es: "Polietápico: 236 secciones censales elegidas por muestreo aleatorio estratificado (6 estratos por similitud electoral), rutas aleatorias dentro de cada sección y cuotas cruzadas de sexo, edad y lugar de nacimiento. El 21 % de las entrevistas se hicieron en secciones sustitutas elegidas por el CEO.",
        en: "Multi-stage: 236 census sections drawn by stratified random sampling (6 strata by electoral similarity), random routes within each section and crossed quotas of sex, age and place of birth. 21% of the interviews were held in substitute sections chosen by the CEO.",
      },
      mode: {
        ca: "Presencial, al domicili (CAPI).",
        es: "Presencial, en el domicilio (CAPI).",
        en: "Face to face, at home (CAPI).",
      },
      fieldwork: { from: "2026-09-01", to: "2026-10-05" },
      questions: {
        ca: "Pregunta 45: «Si demà se celebressin eleccions al Congrés dels Diputats, a quin partit o coalició votaria?». No ho sap: 200 persones; no contesta: 100 (de 2.000). El text íntegre de totes les preguntes és al qüestionari oficial.",
        es: "Pregunta 45 (original en catalán): «Si demà se celebressin eleccions al Congrés dels Diputats, a quin partit o coalició votaria?». No sabe: 200 personas; no contesta: 100 (de 2.000). El texto íntegro de todas las preguntas está en el cuestionario oficial.",
        en: "Question 45 (original in Catalan): «Si demà se celebressin eleccions al Congrés dels Diputats, a quin partit o coalició votaria?» (if there were a general election to the Congress tomorrow, which party or coalition would you vote for?). Don't know: 200 people; no answer: 100 (of 2,000). The full text of every question is in the official questionnaire.",
      },
    },
    links: {
      results: `${CEO_DOCS}/REO1169_dossier_de_premsa.pdf`,
      questionnaire: `${CEO_DOCS}/REO1169_questionari.pdf`,
      sheet: `${CEO_DOCS}/REO1169_fitxa_tecnica.pdf`,
      data: `${CEO_DOCS}/REO1169_microdades_anonimitzades.csv`,
      page: CEO_LATEST,
    },
    checkedOn: "2026-11-05",
  },
  {
    id: "cis-3584",
    status: "expected",
    org: "cis",
    name: {
      ca: "Estudi 3584, preelectoral de les eleccions generals 2026",
      es: "Estudio 3584, preelectoral elecciones generales 2026",
      en: "Study 3584, 2026 general election pre-electoral survey",
    },
    expectedOn: null,
    recheckBy: "2026-11-17",
    note: {
      ca: `La Junta Electoral Central en va registrar l'inici en la sessió del 15 d'octubre ([acord 267/2026](${JEC_3584})), i el 22 d'octubre el CIS va dir que encara no podia fixar quan acabaria el treball de camp. Si surt abans de la votació, ha de ser com a molt tard el 23 de novembre: del 24 al 28 la llei prohibeix difondre enquestes. A les generals del 2023, l'estudi preelectoral del CIS va incloure una estimació d'escons per a cada província. El baròmetre d'octubre del CIS (estudi 3582) només dona estimació per al conjunt d'Espanya.`,
      es: `La Junta Electoral Central registró su inicio en la sesión del 15 de octubre ([acuerdo 267/2026](${JEC_3584})), y el 22 de octubre el CIS dijo que aún no podía fijar cuándo terminaría el trabajo de campo. Si sale antes de la votación, tiene que ser como muy tarde el 23 de noviembre: del 24 al 28 la ley prohíbe difundir encuestas. En las generales de 2023, el estudio preelectoral del CIS incluyó una estimación de escaños para cada provincia. El barómetro de octubre del CIS (estudio 3582) solo da estimación para el conjunto de España.`,
      en: `The Junta Electoral Central recorded its start at its session of 15 October ([agreement 267/2026](${JEC_3584})), and on 22 October the CIS said it could not yet say when fieldwork would end. If it comes out before the vote, it has to be by 23 November at the latest: the law bans publishing polls from 24 to 28 November. At the 2023 general election, the CIS pre-electoral study included a seat estimate for each province. The CIS October barometer (study 3582) gives an estimate for Spain as a whole only.`,
    },
    page: "https://www.cis.es/",
    checkedOn: "2026-11-05",
  },
  {
    id: "ceo-bop-3-2026",
    status: "expected",
    org: "ceo",
    name: {
      ca: "Baròmetre d'Opinió Política, 3a onada 2026, o una enquesta preelectoral",
      es: "Barómetro de Opinión Política, 3.ª oleada de 2026, o una encuesta preelectoral",
      en: "Political Opinion Barometer, 3rd wave 2026, or a pre-electoral survey",
    },
    expectedOn: null,
    recheckBy: "2026-11-17",
    note: {
      ca: "La fitxa tècnica del baròmetre preveu tres onades el 2026. El CEO no ha anunciat la data de la tercera, i el registre d'estudis d'opinió no inclou cap enquesta preelectoral del CEO per al 29N.",
      es: "La ficha técnica del barómetro prevé tres oleadas en 2026. El CEO no ha anunciado la fecha de la tercera, y el registro de estudios de opinión no incluye ninguna encuesta preelectoral del CEO para el 29N.",
      en: "The barometer's technical sheet plans three waves in 2026. The CEO has not announced a date for the third, and the register of opinion studies lists no CEO pre-electoral survey for 29 November.",
    },
    page: CEO_LATEST,
    checkedOn: "2026-11-05",
  },
];
