import type { CityTr } from "../strike-11n-cities-model";

const ACUERDO = "https://www.bocm.es/bocm-20261106-36";
const BOCM = "https://www.bocm.es/";
const AENA_RES = "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf";
const CRTM = "https://www.crtm.es/comunicacion/actualidad-del-servicio/avisos/";
const CCOO = "https://madrid.ccoo.es/huelgageneral11m";
const UGT = "https://madridugt.org/";

/** Madrid, in Catalan and English (10 Nov 2026): the Spanish facts of strike-11n-cities-data.ts, same links and figures. */
export const ca: CityTr = {
  titleTransport: "metro i EMT",
  transportShort: "metro, EMT i autobusos interurbans",
  authority: `la Comunitat de Madrid, en un acord del Consell de Govern publicat al [BOCM](${BOCM})`,
  authorityShort: "la Comunitat de Madrid (BOCM)",
  bulletin: "el BOCM",
  cercanias: "Cercanías Madrid",
  airport: "Adolfo Suárez Madrid-Barajas",
  airNotes: [
    `A l'aeroport Adolfo Suárez Madrid-Barajas, el 78% dels vols amb les Balears, les Canàries, Ceuta i Melilla i de les rutes amb obligació de servei públic; el 57% dels internacionals i dels peninsulars l'alternativa dels quals en transport públic triga 5 hores o més, i el 32% dels peninsulars amb alternativa de menys de 5 hores, per a cada ruta i companyia, segons la [resolució del Ministeri de Transports](${AENA_RES}).`,
    "Si el vol uneix dos aeroports espanyols amb percentatges diferents, s'aplica el més alt, i el resultat s'arrodoneix a l'alça.",
  ],
  msSummary: `metro al 80% en hora punta i al 50% la resta del dia; EMT, al 50% (40% a les línies que coincideixen amb el metro); autobusos interurbans, al 50% fins a les 9.30 h i al 45% després, segons [l'acord de la Comunitat publicat el 6 de novembre](${ACUERDO})`,
  msNotes: [
    `**Publicats el 6 de novembre.** L'[Acord del 4 de novembre de 2026, del Consell de Govern](${ACUERDO}) (BOCM núm. 267) fixa en un sol text els serveis mínims de l'Administració regional, les escoles, la sanitat, el metro, l'EMT, els autobusos interurbans i els metros lleugers, i «produirà efectes el mateix dia de la seva publicació». Les taules de trens del metro i les línies de l'EMT de cada xarxa les concretarà una ordre de la conselleria competent.`,
  ],
  railNotes: [
    "**Línia C-9:** Renfe avisa que, «amb motiu de les vagues convocades per als dies 10, 11 i 12 de novembre, se suspèn el servei alternatiu de transport per autobús a la línia C-9» ([Cercanías Madrid](https://www.renfe.com/es/es/cercanias/cercanias-madrid)).",
  ],
  school:
    "**Sí, és dia lectiu.** Al calendari escolar 2026-2027 de la Comunitat de Madrid ([Ordre 2034/2026](https://www.bocm.es/bocm-20260604-13)), les classes d'infantil, primària i educació especial van del 7 de setembre de 2026 al 18 de juny de 2027, i al novembre només és festiu el dia 2, a més de les festes locals. Les de la ciutat de Madrid el 2026 són el 15 de maig i el 9 de novembre ([BOCM del 12 de desembre de 2025](https://www.bocm.es/bocm-20251212-34)): el dilluns 9 no hi ha classe; el dimecres 11, sí.",
  schoolShort: "És dia lectiu. Les escoles obren amb el director, el cap d'estudis i els mínims que fixa la Comunitat de Madrid",
  demos: [
    "**UGT:** concentració a les 12.00 h a Cibeles i manifestació a les 18.00 h d'Atocha a la plaça d'Espanya, segons [UGT (sector de la neteja de Madrid)](https://www.ugtlimpiezamadrid.es/2026/11/iel-11-de-noviembre-movilizate.html).",
    `Estigueu atents a [CCOO de Madrid](${CCOO}) i [UGT Madrid](${UGT}) per si convoquen altres marxes.`,
  ],
  demoShort: "UGT: concentració a les 12.00 h a Cibeles; manifestació a les 18.00 h d'Atocha a la plaça d'Espanya",
  demoWhere: `Estigueu atents als webs de [CCOO de Madrid](${CCOO}) i [UGT Madrid](${UGT}): tan aviat com publiquin l'hora i el lloc, els posarem aquí.`,
  callNotes: [],
  services: {
    metro: {
      name: "Metro de Madrid",
      setBy: "Comunitat de Madrid",
      pending: `La Comunitat de Madrid els fixa en el seu [acord de serveis mínims](${ACUERDO}), publicat al [BOCM](${BOCM}).`,
      where: `Els avisos, a [metromadrid.es](https://www.metromadrid.es/es) i als [avisos del Consorci Regional de Transports](${CRTM})`,
      text: `El 80% dels trens en hora punta (de 7.30 a 9.30, de 14.00 a 16.00 i de 18.00 a 20.00 h) i el 50% la resta del dia, segons [l'acord de la Comunitat de Madrid](${ACUERDO}). Les taules de trens, per ordre de la conselleria competent.`,
      question: "Hi ha metro a Madrid l'11 de novembre?",
    },
    emt: {
      name: "Autobusos de l'EMT",
      setBy: "Comunitat de Madrid",
      pending: `La Comunitat de Madrid els fixa en el seu [acord de serveis mínims](${ACUERDO}), publicat al [BOCM](${BOCM}).`,
      where: "Les [incidències de l'EMT](https://www.emtmadrid.es/EMTBUS/Incidencias?lang=es-ES)",
      text: `El 50% dels serveis durant tot el dia a la xarxa específica de l'EMT i el 40% a la xarxa que coincideix amb el metro, segons [l'acord de la Comunitat de Madrid](${ACUERDO}). Quines línies van a cada xarxa, per ordre de la conselleria competent.`,
      question: "Hi ha autobusos de l'EMT a Madrid l'11 de novembre?",
    },
    interurbanos: {
      name: "Autobusos interurbans i metros lleugers",
      setBy: "Comunitat de Madrid",
      pending: `La Comunitat de Madrid els fixa en el seu [acord de serveis mínims](${ACUERDO}), publicat al [BOCM](${BOCM}).`,
      where: `Els [avisos del Consorci Regional de Transports](${CRTM})`,
      text: `Interurbans: el 50% dels serveis des de l'inici fins a les 9.30 h i el 45% la resta del dia. Metros lleugers i tramvia de Parla: el 50% en hora punta i el 45% la resta. Transport escolar, el 60%. Segons [l'acord de la Comunitat de Madrid](${ACUERDO}).`,
    },
    salud: {
      name: "Hospitals i centres de salut públics",
      setBy: "Comunitat de Madrid",
      pending: `La Comunitat de Madrid els fixa en el seu [acord de serveis mínims](${ACUERDO}), publicat al [BOCM](${BOCM}).`,
      where: `Per a la teva cita, el teu hospital o centre de salut; el text complet, al [BOCM](${BOCM})`,
      text: `Als hospitals, el personal de dissabtes, diumenges i festius i el de guàrdia, amb mínims addicionals en unitats com urgències, diàlisi, cures crítiques o oncologia; als centres de salut, d'1 a 2 metges de família, 1 pediatre, 1 o 2 infermeres i 1 auxiliar administratiu per torn, en funció de la mida del centre, segons [l'acord de la Comunitat de Madrid](${ACUERDO}).`,
    },
    colegios: {
      name: "Escoles i instituts",
      setBy: "Comunitat de Madrid",
      pending: `La Comunitat de Madrid els fixa en el seu [acord de serveis mínims](${ACUERDO}), publicat al [BOCM](${BOCM}).`,
      where: `L'escola informa les famílies; el text complet, al [BOCM](${BOCM})`,
      text: `A cada centre, el director i el cap d'estudis i, a més, 1 mestre per cada 50 alumnes a infantil i primària i 1 professor per cada 90 alumnes a ESO i FP bàsica, segons [l'acord de la Comunitat de Madrid](${ACUERDO}).`,
    },
    administracion: {
      name: "Administració de la Comunitat de Madrid",
      setBy: "Comunitat de Madrid",
      pending: `La Comunitat de Madrid els fixa en el seu [acord de serveis mínims](${ACUERDO}), publicat al [BOCM](${BOCM}).`,
      where: "Els [acords del Consell de Govern](https://www.comunidad.madrid/acuerdos-consejo-gobierno)",
      text: `A l'Oficina Central de Atención al Ciudadano (Carrera de San Jerónimo, 13), 3 treballadors al matí i 3 a la tarda, segons [l'acord de la Comunitat de Madrid](${ACUERDO}).`,
    },
  },
};

export const en: CityTr = {
  titleTransport: "metro and EMT",
  transportShort: "metro, EMT and interurban buses",
  authority: `the Community of Madrid, in a Governing Council agreement published in the [BOCM](${BOCM})`,
  authorityShort: "the Community of Madrid (BOCM)",
  bulletin: "the BOCM",
  cercanias: "Cercanías Madrid",
  airport: "Adolfo Suárez Madrid-Barajas",
  airNotes: [
    `At Adolfo Suárez Madrid-Barajas airport, 78% of flights to and from the Balearic Islands, the Canary Islands, Ceuta and Melilla and on public service obligation routes; 57% of international flights and of mainland flights whose public transport alternative takes 5 hours or more, and 32% of mainland flights with an alternative of under 5 hours, for each route and airline, according to the [Ministry of Transport resolution](${AENA_RES}).`,
    "If a flight links two Spanish airports with different percentages, the higher one applies, and the result is rounded up.",
  ],
  msSummary: `metro at 80% at peak times and 50% the rest of the day; EMT at 50% (40% on the lines that overlap with the metro); interurban buses at 50% until 9.30 and 45% afterwards, according to [the Community's agreement published on 6 November](${ACUERDO})`,
  msNotes: [
    `**Published on 6 November.** The [Governing Council Agreement of 4 November 2026](${ACUERDO}) (BOCM no. 267) sets out in a single text the minimum services for the regional administration, schools, healthcare, the metro, the EMT, interurban buses and light metro lines, and \"shall take effect on the day of its publication\". The metro train schedules and the EMT lines in each network will be set out in an order from the relevant regional ministry.`,
  ],
  railNotes: [
    "**Line C-9:** Renfe warns that, \"due to the strikes called for 10, 11 and 12 November, the alternative bus transport service on line C-9 is suspended\" ([Cercanías Madrid](https://www.renfe.com/es/es/cercanias/cercanias-madrid)).",
  ],
  school:
    "**Yes, it is a school day.** In the Community of Madrid's 2026-2027 school calendar ([Order 2034/2026](https://www.bocm.es/bocm-20260604-13)), nursery, primary and special education classes run from 7 September 2026 to 18 June 2027, and in November only the 2nd is a holiday, plus local holidays. The City of Madrid's local holidays in 2026 are 15 May and 9 November ([BOCM of 12 December 2025](https://www.bocm.es/bocm-20251212-34)): there are no classes on Monday the 9th; on Wednesday the 11th, there are.",
  schoolShort: "It is a school day. Schools open with the head teacher, the director of studies and the minimum staff set by the Community of Madrid",
  demos: [
    "**UGT:** rally at 12.00 at Cibeles and march at 18.00 from Atocha to Plaza de España, according to [UGT (Madrid cleaning sector)](https://www.ugtlimpiezamadrid.es/2026/11/iel-11-de-noviembre-movilizate.html).",
    `Keep an eye on [CCOO de Madrid](${CCOO}) and [UGT Madrid](${UGT}) in case they call other marches.`,
  ],
  demoShort: "UGT: rally at 12.00 at Cibeles; march at 18.00 from Atocha to Plaza de España",
  demoWhere: `Keep an eye on the [CCOO de Madrid](${CCOO}) and [UGT Madrid](${UGT}) websites: as soon as they publish the time and place, we will post them here.`,
  callNotes: [],
  services: {
    metro: {
      name: "Metro de Madrid",
      setBy: "Community of Madrid",
      pending: `The Community of Madrid sets them in its [minimum services agreement](${ACUERDO}), published in the [BOCM](${BOCM}).`,
      where: `Notices on [metromadrid.es](https://www.metromadrid.es/es) and in the [Consorcio Regional de Transportes service notices](${CRTM})`,
      text: `80% of trains at peak times (7.30 to 9.30, 14.00 to 16.00 and 18.00 to 20.00) and 50% the rest of the day, according to [the Community of Madrid's agreement](${ACUERDO}). Train schedules to be set by order of the relevant regional ministry.`,
      question: "Is the Madrid metro running on 11 November?",
    },
    emt: {
      name: "EMT buses",
      setBy: "Community of Madrid",
      pending: `The Community of Madrid sets them in its [minimum services agreement](${ACUERDO}), published in the [BOCM](${BOCM}).`,
      where: "[EMT service disruptions](https://www.emtmadrid.es/EMTBUS/Incidencias?lang=es-ES)",
      text: `50% of services throughout the day on the EMT's own network and 40% on the network that overlaps with the metro, according to [the Community of Madrid's agreement](${ACUERDO}). Which lines belong to each network, by order of the relevant regional ministry.`,
      question: "Are EMT buses running in Madrid on 11 November?",
    },
    interurbanos: {
      name: "Interurban buses and light metro",
      setBy: "Community of Madrid",
      pending: `The Community of Madrid sets them in its [minimum services agreement](${ACUERDO}), published in the [BOCM](${BOCM}).`,
      where: `The [Consorcio Regional de Transportes service notices](${CRTM})`,
      text: `Interurban buses: 50% of services from the start of service until 9.30 and 45% the rest of the day. Light metro and the Parla tram: 50% at peak times and 45% the rest of the day. School transport: 60%. According to [the Community of Madrid's agreement](${ACUERDO}).`,
    },
    salud: {
      name: "Public hospitals and health centres",
      setBy: "Community of Madrid",
      pending: `The Community of Madrid sets them in its [minimum services agreement](${ACUERDO}), published in the [BOCM](${BOCM}).`,
      where: `For your appointment, your hospital or health centre; the full text, in the [BOCM](${BOCM})`,
      text: `In hospitals, Saturday, Sunday and public holiday staffing plus on-call staff, with additional minimums in units such as A&E, dialysis, critical care or oncology; in health centres, 1 to 2 family doctors, 1 paediatrician, 1 or 2 nurses and 1 administrative assistant per shift, depending on the size of the centre, according to [the Community of Madrid's agreement](${ACUERDO}).`,
    },
    colegios: {
      name: "Primary and secondary schools",
      setBy: "Community of Madrid",
      pending: `The Community of Madrid sets them in its [minimum services agreement](${ACUERDO}), published in the [BOCM](${BOCM}).`,
      where: `The school informs families; the full text, in the [BOCM](${BOCM})`,
      text: `In each school, the head teacher and the director of studies, plus 1 teacher per 50 pupils in nursery and primary and 1 teacher per 90 pupils in ESO and basic vocational training (FP básica), according to [the Community of Madrid's agreement](${ACUERDO}).`,
    },
    administracion: {
      name: "Community of Madrid administration",
      setBy: "Community of Madrid",
      pending: `The Community of Madrid sets them in its [minimum services agreement](${ACUERDO}), published in the [BOCM](${BOCM}).`,
      where: "The [Governing Council agreements](https://www.comunidad.madrid/acuerdos-consejo-gobierno)",
      text: `At the Oficina Central de Atención al Ciudadano (Carrera de San Jerónimo, 13), 3 staff in the morning and 3 in the afternoon, according to [the Community of Madrid's agreement](${ACUERDO}).`,
    },
  },
};
