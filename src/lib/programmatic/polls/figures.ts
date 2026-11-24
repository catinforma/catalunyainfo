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
 *
 * Read on 18 Nov 2026 (curl, browser User-Agent):
 *  - CIS: cis.es home, "Últimos datos": "12 nov 2026 · Avance de resultados
 *    del estudio 3584 'Preelectoral elecciones generales 2026'" (newest item;
 *    nothing later). Its page (CIS_3584_PAGE, "Madrid, 12 noviembre 2026")
 *    links the vote-estimate PDF (CIS_3584_ESTIMATE: national vote estimate,
 *    then "ESTIMACIÓN DE ESCAÑOS POR PROVINCIAS"; no vote estimate for
 *    Catalonia) and the frequencies PDF (CIS_3584_FREQ: "FICHA TÉCNICA" pp.
 *    1-2, Cuadro 1 provincial samples and errors, Cuadro 2 Cataluña 5.596 /
 *    ±1,3; Catalonia section p. 176, Pregunta 3R "No sabe todavía 18,9",
 *    "N.C. 2,5", N = 5.596). Province rows below read in the PDF and checked
 *    against the "Estimación de Voto" sheet of the Excel (3584-multi_A-xlsx).
 *    No separate questionnaire file yet (cues3584 URLs answer 410); the
 *    frequencies PDF carries the full text of every question. Address: cis.es
 *    contact page, "C/ Montalbán, 8 28014 Madrid".
 *  - CEO: "Darrers estudis" lists Òmnibus 2026-2, Òmnibus 2026-1, BOP 2a
 *    onada 2026 and 1a onada (news: 13 Nov and 6 Nov Òmnibus, 14 Oct BOP).
 *    REO1169 dossier p. 142 re-read: every BOP figure below unchanged.
 *    Both Òmnibus questionnaires (REO1171/REO1172) ask only past vote, no
 *    vote intention. REO register (analisi.transparenciacatalunya.cat,
 *    m5mb-xt5e) newest entry REO 1172 (13 Nov). No 3rd BOP wave or CEO
 *    pre-electoral survey announced.
 */

/** ISO date the CIS and CEO catalogues were last read for this file. */
export const POLLS_CHECKED_ON = "2026-11-18";

const CEO_DOCS = "https://documents.dadesobertes.gencat.cat/ceo/docs";
const CEO_LATEST = "https://web.gencat.cat/ca/generalitat/dades-indicadors/centre-estudis-opinio/darrers-estudis";
const CIS_3584_PAGE = "https://www.cis.es/es/w/avance-de-resultados-del-estudio-3584-preelectoral-elecciones-generales-2026-";
const CIS_3584_ESTIMATE = "https://www.cis.es/documents/d/guest/3584_estimacion-pdf";
const CIS_3584_FREQ = "https://www.cis.es/documents/d/guest/es3584mar_A-pdf";

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
    // 18 Nov 2026: dossier p. 142 re-read, every figure as above.
    checkedOn: "2026-11-18",
  },
  {
    id: "cis-3584",
    status: "published",
    org: "cis",
    name: {
      ca: "Preelectoral de les eleccions generals 2026 (avanç de resultats)",
      es: "Preelectoral elecciones generales 2026 (avance de resultados)",
      en: "2026 general election pre-electoral survey (advance results)",
    },
    study: "Estudio n.º 3584",
    publishedOn: "2026-11-12",
    scope: {
      ca: "Estimació d'escons al Congrés dels Diputats a cadascuna de les quatre províncies catalanes, en forquilla. Per a Catalunya, l'avanç de resultats no dona cap estimació de vot en percentatge: només la del conjunt d'Espanya, a l'informe enllaçat.",
      es: "Estimación de escaños al Congreso de los Diputados en cada una de las cuatro provincias catalanas, en horquilla. Para Cataluña, el avance de resultados no da ninguna estimación de voto en porcentaje: solo la del conjunto de España, en el informe enlazado.",
      en: "Seat estimate for the Congress of Deputies in each of Catalonia's four provinces, as a range. For Catalonia the advance results give no vote-share estimate: only the one for Spain as a whole, in the linked report.",
    },
    tables: [
      {
        caption: {
          ca: "Estimació d'escons al Congrés per províncies a Catalunya (CIS, preelectoral 2026)",
          es: "Estimación de escaños al Congreso por provincias en Cataluña (CIS, preelectoral de 2026)",
          en: "Congress seat estimate by province in Catalonia (CIS, 2026 pre-electoral survey)",
        },
        columns: ["barcelona", "girona", "lleida", "tarragona"],
        // "ESTIMACIÓN DE ESCAÑOS POR PROVINCIAS" (CIS_3584_ESTIMATE, read 18 Nov 2026), rows Barcelona, Girona, Lleida and Tarragona,
        // in the order of the table's columns. Every other column is [0-0] in all four provinces.
        rows: [
          { party: "PSOE", provinces: { barcelona: [11, 13], girona: [2, 3], lleida: [1, 2], tarragona: [3, 4] } },
          { party: "PP", provinces: { barcelona: [3, 4], girona: [0, 1], lleida: [0, 0], tarragona: [0, 1] } },
          { party: "VOX", provinces: { barcelona: [4, 5], girona: [0, 1], lleida: [0, 1], tarragona: [1, 1] } },
          { party: "Frente Amplio", provinces: { barcelona: [2, 3], girona: [0, 0], lleida: [0, 0], tarragona: [0, 0] } },
          { party: "ERC-Podemos", provinces: { barcelona: [7, 9], girona: [1, 2], lleida: [1, 2], tarragona: [1, 2] } },
          { party: "Junts", provinces: { barcelona: [1, 3], girona: [0, 1], lleida: [0, 1], tarragona: [0, 0] } },
        ],
        note: {
          ca: "Forquilles d'escons de la taula «Estimación de escaños por provincias» de l'informe d'estimació de vot del CIS: els percentils 5 i 95 de les seves simulacions, és a dir, el 90 % central dels escenaris («no es un intervalo de confianza ni un error de muestreo»). El CIS adverteix que les forquilles de cada província no es poden sumar. Candidatures en l'ordre de les columnes de la font; les altres candidatures d'aquella taula hi tenen 0–0 a les quatre províncies catalanes. Sobre ERC-Podemos, el CIS precisa: «Aunque ERC y Podemos no concurren formalmente en coalición electoral, ambas formaciones realizan una campaña conjunta en Cataluña». A les preguntes de vot, el CIS anomena l'opció de Frente Amplio a Catalunya «Comuns-FA».",
          es: "Horquillas de escaños de la tabla «Estimación de escaños por provincias» del informe de estimación de voto del CIS: los percentiles 5 y 95 de sus simulaciones, es decir, el 90 % central de los escenarios («no es un intervalo de confianza ni un error de muestreo»). El CIS advierte de que las horquillas de cada provincia no se pueden sumar. Candidaturas en el orden de las columnas de la fuente; las demás candidaturas de esa tabla tienen 0–0 en las cuatro provincias catalanas. Sobre ERC-Podemos, el CIS precisa: «Aunque ERC y Podemos no concurren formalmente en coalición electoral, ambas formaciones realizan una campaña conjunta en Cataluña». En las preguntas de voto, el CIS llama a la opción de Frente Amplio en Cataluña «Comuns-FA».",
          en: "Seat ranges from the table \"Estimación de escaños por provincias\" in the CIS vote-estimate report: the 5th and 95th percentiles of its simulations, that is, the central 90% of scenarios (\"no es un intervalo de confianza ni un error de muestreo\": not a confidence interval or a sampling error). The CIS warns that the provincial ranges cannot be added up. Lists in the order of the source's columns; every other list in that table has 0–0 in all four Catalan provinces. On ERC-Podemos, the CIS notes: \"Aunque ERC y Podemos no concurren formalmente en coalición electoral, ambas formaciones realizan una campaña conjunta en Cataluña\" (although ERC and Podemos are not formally standing as a coalition, they are running a joint campaign in Catalonia). In its voting questions, the CIS calls the Frente Amplio option in Catalonia \"Comuns-FA\".",
        },
      },
    ],
    sheet: {
      organisation: {
        ca: "Centre d'Investigacions Sociològiques (CIS): C/ Montalbán, 8, 28014 Madrid.",
        es: "Centro de Investigaciones Sociológicas (CIS): C/ Montalbán, 8, 28014 Madrid.",
        en: "Centro de Investigaciones Sociológicas (CIS): C/ Montalbán, 8, 28014 Madrid.",
      },
      client: {
        ca: "El mateix CIS: la fitxa tècnica no esmenta cap altre promotor.",
        es: "El propio CIS: la ficha técnica no menciona ningún otro promotor.",
        en: "The CIS itself: the technical sheet names no other sponsor.",
      },
      universe: {
        ca: "Població espanyola de tots dos sexes de 18 anys i més amb dret a vot a les eleccions generals i resident a Espanya.",
        es: "Población española de ambos sexos de 18 años y más con derecho a voto en elecciones generales y residente en España.",
        en: "Spanish population of both sexes aged 18 and over, entitled to vote in general elections and living in Spain.",
      },
      sample: {
        ca: "45.074 entrevistes a tot Espanya (45.000 de dissenyades). A Catalunya, 5.596: Barcelona 3.662, Girona 691, Lleida 501 i Tarragona 742.",
        es: "45.074 entrevistas en toda España (45.000 diseñadas). En Cataluña, 5.596: Barcelona 3.662, Girona 691, Lleida 501 y Tarragona 742.",
        en: "45,074 interviews across Spain (45,000 planned). In Catalonia, 5,596: Barcelona 3,662, Girona 691, Lleida 501 and Tarragona 742.",
      },
      margin: {
        ca: "±0,5 % per al conjunt de la mostra i ±1,3 % per a Catalunya (Barcelona ±1,7 %, Girona ±3,8 %, Lleida ±4,5 % i Tarragona ±3,7 %), amb un nivell de confiança del 95,5 % (dues sigmes), P = Q i en el supòsit de mostreig aleatori simple.",
        es: "±0,5 % para el conjunto de la muestra y ±1,3 % para Cataluña (Barcelona ±1,7 %, Girona ±3,8 %, Lleida ±4,5 % y Tarragona ±3,7 %), con un nivel de confianza del 95,5 % (dos sigmas), P = Q y en el supuesto de muestreo aleatorio simple.",
        en: "±0.5% for the whole sample and ±1.3% for Catalonia (Barcelona ±1.7%, Girona ±3.8%, Lleida ±4.5%, Tarragona ±3.7%), at a 95.5% confidence level (two sigma), P = Q, assuming simple random sampling.",
      },
      sampling: {
        ca: "Afixació no proporcional: partint d'un repartiment proporcional per províncies, totes arriben com a mínim a 300 entrevistes (50 a Ceuta i Melilla), amb quotes proporcionals de mida d'hàbitat, sexe i edat. Selecció aleatòria de telèfons fixos (14,6 %) i mòbils (85,4 %), i de les persones per quotes de sexe i edat. Estrats: les 50 províncies i les 2 ciutats autònomes creuades amb 7 trams de mida d'hàbitat; 4.190 municipis. Resultats ponderats per sexe, edat, regió, nivell d'estudis i mida d'hàbitat.",
        es: "Afijación no proporcional: partiendo de una distribución proporcional por provincias, todas alcanzan un mínimo de 300 entrevistas (50 en Ceuta y Melilla), con cuotas proporcionales de tamaño de hábitat, sexo y edad. Selección aleatoria de teléfonos fijos (14,6 %) y móviles (85,4 %), y de las personas por cuotas de sexo y edad. Estratos: las 50 provincias y las 2 ciudades autónomas cruzadas con 7 tramos de tamaño de hábitat; 4.190 municipios. Resultados ponderados por sexo, edad, región, nivel de estudios y tamaño de hábitat.",
        en: "Non-proportional allocation: starting from a proportional split by province, every province reaches at least 300 interviews (50 in Ceuta and Melilla), with proportional quotas of municipality size, sex and age. Random selection of landline (14.6%) and mobile (85.4%) numbers, and of respondents by sex and age quotas. Strata: the 50 provinces and 2 autonomous cities crossed with 7 municipality-size bands; 4,190 municipalities. Results weighted by sex, age, region, education and municipality size.",
      },
      mode: {
        ca: "Telefònica, assistida per ordinador (CATI).",
        es: "Telefónica, asistida por ordenador (CATI).",
        en: "By telephone, computer-assisted (CATI).",
      },
      fieldwork: { from: "2026-10-07", to: "2026-10-30" },
      questions: {
        ca: "Pregunta 3R, de vot directe: «En las próximas elecciones generales del 29 de noviembre, ¿a qué partido votaría Ud.?» (resposta espontània). A Catalunya (5.596 entrevistes), no sap encara: 18,9 %; no contesta: 2,5 % (el CIS ho dona en percentatge). La fitxa tècnica i el text íntegre de totes les preguntes són al document de freqüències de l'avanç de resultats, enllaçat com a qüestionari: el CIS encara no ha publicat el qüestionari a part.",
        es: "Pregunta 3R, de voto directo: «En las próximas elecciones generales del 29 de noviembre, ¿a qué partido votaría Ud.?» (respuesta espontánea). En Cataluña (5.596 entrevistas), no sabe todavía: 18,9 %; no contesta: 2,5 % (el CIS lo da en porcentaje). La ficha técnica y el texto íntegro de todas las preguntas están en el documento de frecuencias del avance de resultados, enlazado como cuestionario: el CIS aún no ha publicado el cuestionario aparte.",
        en: "Question 3R, direct vote: «En las próximas elecciones generales del 29 de noviembre, ¿a qué partido votaría Ud.?» (in the general election of 29 November, which party would you vote for? Unprompted answer). In Catalonia (5,596 interviews), don't know yet: 18.9%; no answer: 2.5% (the CIS gives these as percentages). The technical sheet and the full text of every question are in the advance results' frequencies document, linked as the questionnaire: the CIS has not yet published the questionnaire separately.",
      },
    },
    links: {
      results: CIS_3584_ESTIMATE,
      questionnaire: CIS_3584_FREQ,
      page: CIS_3584_PAGE,
    },
    checkedOn: "2026-11-18",
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
    // 18 Nov 2026: no date announced. 20 Nov 2026: re-read, still none ("Darrers estudis" lists Òmnibus 2026-2 and 2026-1,
    // BOP 2a and 1a onada; REO register newest entry REO 1172, Òmnibus 2026-2). 24 Nov 2026: "Darrers estudis" re-read,
    // the same four studies. The blackout (24 Nov 00:00 to 29 Nov 21:00) hides this page's figures and no poll may be
    // published in it, so the next re-read is the day after polling day.
    recheckBy: "2026-11-30",
    note: {
      ca: "La fitxa tècnica del baròmetre preveu tres onades el 2026. El CEO no ha anunciat la data de la tercera. Els seus darrers estudis són dues enquestes Òmnibus (6 i 13 de novembre), que no pregunten la intenció de vot, i el registre d'estudis d'opinió no inclou cap enquesta preelectoral del CEO per al 29N.",
      es: "La ficha técnica del barómetro prevé tres oleadas en 2026. El CEO no ha anunciado la fecha de la tercera. Sus últimos estudios son dos encuestas Òmnibus (6 y 13 de noviembre), que no preguntan la intención de voto, y el registro de estudios de opinión no incluye ninguna encuesta preelectoral del CEO para el 29N.",
      en: "The barometer's technical sheet plans three waves in 2026. The CEO has not announced a date for the third. Its latest studies are two Òmnibus surveys (6 and 13 November), which do not ask about voting intention, and the register of opinion studies lists no CEO pre-electoral survey for 29 November.",
    },
    page: CEO_LATEST,
    checkedOn: "2026-11-24",
  },
];
