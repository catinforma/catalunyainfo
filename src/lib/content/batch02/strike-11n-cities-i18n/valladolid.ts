import type { CityTr } from "../strike-11n-cities-model";

const BOCYL = "https://bocyl.jcyl.es/";
const A154 = "https://bocyl.jcyl.es/boletines/2026/11/06/pdf/BOCYL-D-06112026-215-31.pdf";
const A155 = "https://bocyl.jcyl.es/boletines/2026/11/06/pdf/BOCYL-D-06112026-215-32.pdf";
const MITMA = "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf";
const CCOO =
  "https://castillayleon.ccoo.es/noticia:770501--Ana_Fernandez_de_los_Muros_augura_un_11N_historico_frente_a_la_precariedad_laboral_y_el_problema_de_la_vivienda&opc_id=61952cfe7ba2f6fbe0db539f6f403dbc";
const FIESTAS =
  "https://trabajoyprevencion.jcyl.es/web/jcyl/binarios/635/169/08%20BOP%20FIESTAS%20LOCALES%20VALLADOLID%2026,0.pdf?blobheader=application%2Fpdf%3Bcharset%3DUTF-8&blobnocache=true";

/** Valladolid, in Catalan and English (10 Nov 2026): the Spanish facts of strike-11n-cities-data.ts, same links and figures. */
export const ca: CityTr = {
  titleTransport: `AUVASA`,
  transportShort: `autobusos urbans i metropolitans`,
  authority: `la Junta de Castella i Lleó, en acords publicats al [BOCYL](${BOCYL}) del 6 de novembre, llevat dels d'AUVASA, que no ha publicat ningú`,
  authorityShort: `la Junta de Castella i Lleó (BOCYL)`,
  bulletin: `el BOCYL`,
  cercanias: null,
  airport: `Valladolid`,
  airNotes: [
    `A l'aeroport de Valladolid, el 57% dels vols amb les Balears, les Canàries, Ceuta i Melilla i de les rutes amb obligació de servei públic; el 64% dels internacionals i dels peninsulars l'alternativa dels quals en transport públic triga 5 hores o més, i el 32% dels peninsulars amb una alternativa de menys de 5 hores, per a cada ruta i companyia, segons la [resolució del Ministeri de Transports](${MITMA}).`,
    `Si el vol uneix dos aeroports espanyols amb percentatges diferents, s'aplica el més alt, i el resultat s'arrodoneix a l'alça.`,
  ],
  msSummary: `autobusos metropolitans de la Junta, al 50% de les expedicions de 7 a 10, de 13.30 a 16.00 i de 18 a 21 h; a escoles i centres de salut, els mínims dels acords de la Junta publicats el 6 de novembre ([transport](${A155}) i [Administració](${A154})). Els d'AUVASA, encara no`,
  msNotes: [
    `**Publicats el 6 de novembre.** La Junta de Castella i Lleó va aprovar el 5 de novembre quatre acords de serveis mínims, que el BOCYL núm. 215 va publicar l'endemà: l'[Acord 154/2026](${A154}) (Administració de la Comunitat, incloses les escoles i la sanitat públiques), l'[Acord 155/2026](${A155}) (ens públics, transport i ensenyament privat) i dos més per a les universitats i les empreses privades que treballen per a la Junta.`,
  ],
  railNotes: [],
  school: `**Sí, és dia lectiu.** El calendari escolar 2026-2027 de Castella i Lleó ([Orden EDU/478/2026](https://bocyl.jcyl.es/boletines/2026/05/28/pdf/BOCYL-D-28052026-101-28.pdf)) no té més festius a la tardor que «el 2 de novembre i el 7 i 8 de desembre», a més de les festes locals, que a Valladolid són el 13 de maig i el 8 de setembre ([festes locals del 2026 a la província](${FIESTAS})).`,
  schoolShort: `Sí, és dia lectiu. Les escoles obren amb el director, el cap d'estudis i un conserge per torn`,
  demos: [],
  demoShort: null,
  demoWhere: `CCOO de Castella i Lleó només diu que «es convocaran grans manifestacions» ([CCOO CyL](${CCOO})). Tan bon punt els convocants publiquin l'hora i el lloc, els posarem aquí.`,
  callNotes: [],
  services: {
    auvasa: {
      name: `Autobusos urbans (AUVASA)`,
      setBy: `Ajuntament de Valladolid`,
      pending: `L'acord de transport de la Junta només cobreix els autobusos de titularitat autonòmica. A la [vaga del sector del 2024](https://www.auvasa.es/servicios-minimos-en-auvasa-con-motivo-de-la-huelga-del-sector-de-conduccion/) els va fixar l'Ajuntament de Valladolid; per a l'11N, ni l'Ajuntament ni AUVASA no els havien publicat.`,
      where: `Els [avisos d'AUVASA](https://www.auvasa.es/avisos)`,
      text: null,
      question: `Hi ha autobusos d'AUVASA l'11 de novembre?`,
    },
    metropolitanos: {
      name: `Autobusos metropolitans i interurbans`,
      setBy: `Junta de Castella i Lleó`,
      pending: `Els fixa la Junta de Castella i Lleó per acord, publicat al [BOCYL](${BOCYL}).`,
      where: `La [pàgina del transport metropolità de Valladolid](https://carreterasytransportes.jcyl.es/web/es/viajeros/transporte-metropolitano-valladolid.html)`,
      text: `En els serveis de rodalia (a menys de 10 km de la capital), el 50% de les expedicions de 7 a 10, de 13.30 a 16.00 i de 18 a 21 h; a la resta, d'1 a 3 viatges d'anada i tornada per franja segons les expedicions de cada línia, i el 10% fora d'aquestes franges; el transport escolar, al 100%, segons l'[Acord 155/2026 de la Junta](${A155}).`,
    },
    salud: {
      name: `Hospitals i centres de salut (Sacyl)`,
      setBy: `Junta de Castella i Lleó`,
      pending: `Els fixa la Junta de Castella i Lleó per acord, publicat al [BOCYL](${BOCYL}).`,
      where: `Per a la teva cita, el teu hospital o centre de salut; les taules de cada centre, a [l'Acord 154/2026 de la Junta](${A154})`,
      text: `Amb caràcter general, l'atenció urgent amb el personal d'un dia festiu; als hospitals, el 100% de l'assistència en oncologia, diàlisi, hospital de dia i farmàcia hospitalària; a l'atenció primària es manté la jornada de matí i la urgència la cobreixen els equips d'atenció primària i els serveis d'urgències, segons [l'Acord 154/2026 de la Junta](${A154}).`,
    },
    colegios: {
      name: `Escoles i instituts públics`,
      setBy: `Junta de Castella i Lleó`,
      pending: `Els fixa la Junta de Castella i Lleó per acord, publicat al [BOCYL](${BOCYL}).`,
      where: `L'escola informa les famílies; l'annex d'Educació, a [l'Acord 154/2026 de la Junta](${A154})`,
      text: `Cada centre obre amb el director i el cap d'estudis (o el secretari) i almenys un conserge per torn, i el personal de menjador, residència i suport a l'alumnat amb necessitats especials que fixa l'annex, segons [l'Acord 154/2026 de la Junta](${A154}).`,
    },
    administracion: {
      name: `Administració de la Junta de Castella i Lleó`,
      setBy: `Junta de Castella i Lleó`,
      pending: `Els fixa la Junta de Castella i Lleó per acord, publicat al [BOCYL](${BOCYL}).`,
      where: `Els annexos de cada conselleria, a [l'Acord 154/2026 de la Junta](${A154})`,
      text: `Obertura, tancament i seguretat dels edificis i atenció d'incidències urgents i tràmits inajornables, amb el personal que en fixen els annexos, segons [l'Acord 154/2026 de la Junta](${A154}).`,
    },
  },
};

export const en: CityTr = {
  titleTransport: `AUVASA`,
  transportShort: `city and metropolitan buses`,
  authority: `the Castile and León regional government (Junta de Castilla y León), in agreements published in the [BOCYL](${BOCYL}) on 6 November, except those for AUVASA, which nobody has published`,
  authorityShort: `the Castile and León regional government (BOCYL)`,
  bulletin: `the BOCYL`,
  cercanias: null,
  airport: `Valladolid`,
  airNotes: [
    `At Valladolid airport, 57% of flights to and from the Balearic Islands, the Canary Islands, Ceuta and Melilla and of public service obligation routes; 64% of international flights and of mainland flights whose public transport alternative takes 5 hours or more, and 32% of mainland flights with an alternative of less than 5 hours, for each route and airline, according to the [Ministry of Transport resolution](${MITMA}).`,
    `If the flight links two Spanish airports with different percentages, the higher one applies, and the result is rounded up.`,
  ],
  msSummary: `the regional government's metropolitan buses, at 50% of journeys from 7 to 10, from 13.30 to 16.00 and from 18 to 21; in schools and health centres, the minimums in the regional government's agreements published on 6 November ([transport](${A155}) and [administration](${A154})). AUVASA's, not yet`,
  msNotes: [
    `**Published on 6 November.** On 5 November the Castile and León regional government approved four minimum services agreements, which BOCYL no. 215 published the following day: [Agreement 154/2026](${A154}) (the regional administration, including state schools and public healthcare), [Agreement 155/2026](${A155}) (public bodies, transport and private education) and two more for the universities and the private companies that work for the regional government.`,
  ],
  railNotes: [],
  school: `**Yes, it is a school day.** The 2026-2027 school calendar for Castile and León ([Orden EDU/478/2026](https://bocyl.jcyl.es/boletines/2026/05/28/pdf/BOCYL-D-28052026-101-28.pdf)) has no autumn holidays other than "2 November and 7 and 8 December", apart from the local holidays, which in Valladolid are 13 May and 8 September ([2026 local holidays in the province](${FIESTAS})).`,
  schoolShort: `Yes, it is a school day. Schools open with the head teacher, the head of studies and one caretaker per shift`,
  demos: [],
  demoShort: null,
  demoWhere: `CCOO Castilla y León only says that "major demonstrations will be called" ([CCOO CyL](${CCOO})). As soon as the organisers publish the time and place, we will add them here.`,
  callNotes: [],
  services: {
    auvasa: {
      name: `City buses (AUVASA)`,
      setBy: `Valladolid City Council`,
      pending: `The regional government's transport agreement only covers buses owned by the region. In the [2024 sector strike](https://www.auvasa.es/servicios-minimos-en-auvasa-con-motivo-de-la-huelga-del-sector-de-conduccion/) they were set by Valladolid City Council; for 11 November, neither the council nor AUVASA had published them.`,
      where: `[AUVASA's service notices](https://www.auvasa.es/avisos)`,
      text: null,
      question: `Are AUVASA buses running on 11 November?`,
    },
    metropolitanos: {
      name: `Metropolitan and intercity buses`,
      setBy: `Castile and León regional government`,
      pending: `They are set by the Castile and León regional government by agreement, published in the [BOCYL](${BOCYL}).`,
      where: `The [Valladolid metropolitan transport page](https://carreterasytransportes.jcyl.es/web/es/viajeros/transporte-metropolitano-valladolid.html)`,
      text: `On short-distance services (less than 10 km from the capital), 50% of journeys from 7 to 10, from 13.30 to 16.00 and from 18 to 21; on the rest, 1 to 3 return trips per time band depending on each line's number of journeys, and 10% outside those bands; school transport, at 100%, according to the regional government's [Agreement 155/2026](${A155}).`,
    },
    salud: {
      name: `Hospitals and health centres (Sacyl)`,
      setBy: `Castile and León regional government`,
      pending: `They are set by the Castile and León regional government by agreement, published in the [BOCYL](${BOCYL}).`,
      where: `For your appointment, your hospital or health centre; each centre's tables, in [the regional government's Agreement 154/2026](${A154})`,
      text: `As a general rule, urgent care with public holiday staffing; in hospitals, 100% of care in oncology, dialysis, day hospital and hospital pharmacy; in primary care the morning shift is maintained and urgent cases are covered by the primary care teams and the emergency services, according to [the regional government's Agreement 154/2026](${A154}).`,
    },
    colegios: {
      name: `State primary and secondary schools`,
      setBy: `Castile and León regional government`,
      pending: `They are set by the Castile and León regional government by agreement, published in the [BOCYL](${BOCYL}).`,
      where: `The school informs families; the Education annex, in [the regional government's Agreement 154/2026](${A154})`,
      text: `Each school opens with the head teacher and the head of studies (or the school secretary) and at least one caretaker per shift, plus the canteen, boarding and special educational needs support staff set out in the annex, according to [the regional government's Agreement 154/2026](${A154}).`,
    },
    administracion: {
      name: `Castile and León regional administration`,
      setBy: `Castile and León regional government`,
      pending: `They are set by the Castile and León regional government by agreement, published in the [BOCYL](${BOCYL}).`,
      where: `Each department's annexes, in [the regional government's Agreement 154/2026](${A154})`,
      text: `Opening, closing and security of buildings and handling of urgent incidents and procedures that cannot be postponed, with the staff set out in its annexes, according to [the regional government's Agreement 154/2026](${A154}).`,
    },
  },
};
