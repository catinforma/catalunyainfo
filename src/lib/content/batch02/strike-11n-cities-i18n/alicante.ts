import type { CityTr } from "../strike-11n-cities-model";

const LIST = "https://habitatge.gva.es/es/web/dg-trabajo/vagues-serveis-minims";
const RESOL =
  "https://habitatge.gva.es/documents/21189/165429228/RESOL_HUELGA+GRAL+11nov26+firmado.pdf/e8132fe4-1128-4d8d-8545-0a5baac22c6b?t=1793978491151";
const AIR = "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf";
const CAL = "https://dogv.gva.es/datos/2026/06/18/pdf/2026_20810_es.pdf";
const FIESTAS = "https://dogv.gva.es/datos/2025/11/14/pdf/2025_46326_es.pdf";
const CCOO_DEMO = "https://www.pv.ccoo.es/noticia:770384";
const CCOO_CALL = "https://www.pv.ccoo.es/noticia:771136";

const CA_PENDING_GVA = `Els fixa la Generalitat Valenciana (Conselleria d'Habitatge, Ocupació, Joventut i Igualtat) per resolució, que publica a la seva [llista de vagues i serveis mínims](${LIST}).`;
const EN_PENDING_GVA = `Set by the Generalitat Valenciana (Regional Ministry of Housing, Employment, Youth and Equality) by resolution, which it publishes on its [list of strikes and minimum services](${LIST}).`;

/** Alicante, in Catalan and English (10 Nov 2026): the Spanish facts of strike-11n-cities-data.ts, same links and figures. */
export const ca: CityTr = {
  titleTransport: "TRAM i bus",
  transportShort: "TRAM i autobusos",
  authority: `la Generalitat Valenciana, en una resolució que té a la seva [llista de serveis mínims](${LIST})`,
  authorityShort: "la Generalitat Valenciana",
  bulletin: "el DOGV",
  cercanias: "Cercanías Murcia/Alicante",
  airport: "Alacant-Elx Miguel Hernández",
  airNotes: [
    `A l'aeroport d'Alacant-Elx Miguel Hernández, el 74% dels vols amb les Balears, les Canàries, Ceuta i Melilla i de les rutes amb obligació de servei públic; el 54% dels internacionals i dels peninsulars l'alternativa dels quals en transport públic triga 5 hores o més, i el 31% dels peninsulars amb alternativa de menys de 5 hores, per a cada ruta i companyia, segons la [resolució del Ministeri de Transports](${AIR}).`,
    "Si el vol uneix dos aeroports espanyols amb percentatges diferents, s'aplica el més alt, i el resultat s'arrodoneix a l'alça.",
  ],
  msSummary: `TRAM d'Alacant, al 80% del servei programat; autobusos interurbans, al 55% en hora punta i al 40% la resta del dia; als hospitals, els serveis d'un diumenge, i als centres de salut, els d'un dissabte, segons [la resolució de la Generalitat Valenciana del 6 de novembre](${RESOL})`,
  msNotes: [
    `**Publicats el 6 de novembre.** La [resolució de la consellera d'Habitatge, Ocupació, Joventut i Igualtat](${RESOL}), que la Generalitat té a la seva [llista de vagues i serveis mínims](${LIST}), fixa en un sol text els de FGV (metro, tramvia i TRAM), els autobusos metropolitans i interurbans, la sanitat, les escoles públiques i l'administració de la Generalitat.`,
    "**No cobreix els autobusos urbans municipals:** els de l'EMT de València i els de l'autobús urbà d'Alacant no estaven publicats el 10 de novembre.",
  ],
  railNotes: [],
  school: `**Al calendari, sí que és dia lectiu.** La [resolució del calendari escolar 2026-2027](${CAL}) fixa les classes del 9 de setembre de 2026 al 18 de juny de 2027 i, a la tardor, només el 9 i el 12 d'octubre i el 8 de desembre com a festius no lectius; les festes locals d'Alacant el 2026 són el 16 d'abril (Santa Faç) i el 23 de juny (Fogueres de Sant Joan) ([DOGV del 14 de novembre de 2025](${FIESTAS})). Però cada ajuntament podia proposar «fins a un màxim de tres dies no lectius de caràcter local a efectes escolars»: confirma-ho amb l'escola.`,
  schoolShort: "Dia lectiu al calendari de la Comunitat; confirma amb l'escola els seus dies no lectius locals",
  demos: [
    `**CCOO PV:** concentració a les 18.00 h a les Escales Jorge Juan («Alacant. Escales Jorge Juan»), segons [CCOO del País Valencià](${CCOO_DEMO}), que [crida a aturar l'11N](${CCOO_CALL}).`,
  ],
  demoShort: "CCOO PV, a les 18.00 h, a les Escales Jorge Juan",
  demoWhere: `Atents a [CCOO PV](${CCOO_DEMO}) per si canvia l'hora o el lloc.`,
  callNotes: [],
  services: {
    tram: {
      name: "TRAM d'Alacant (FGV)",
      setBy: "Generalitat Valenciana",
      pending: CA_PENDING_GVA,
      where: "Els avisos, a [tramalacant.es](https://www.tramalacant.es/)",
      text: `El 80% del servei programat de trens i tramvies, segons [la resolució de la Generalitat Valenciana](${RESOL}).`,
      question: "Hi ha TRAM a Alacant l'11 de novembre?",
    },
    bus: {
      name: "Autobús urbà d'Alacant",
      setBy: "Per confirmar",
      pending: `Encara no els ha publicat ningú a la [llista de serveis mínims de la Generalitat](${LIST}).`,
      where: `La resolució, quan surti, a la [llista de la Generalitat](${LIST})`,
      text: null,
    },
    interurbanos: {
      name: "Autobusos interurbans",
      setBy: "Generalitat Valenciana",
      pending: CA_PENDING_GVA,
      where: `La resolució, a la [llista de la Generalitat](${LIST}); la teva línia, al web del seu operador`,
      text: `El 55% dels serveis en hora punta (de 6.00 a 9.00 i de 17.00 a 19.00 h) i el 40% la resta del dia; el 80% dels que van a aeroports, ports i estacions de tren en zones turístiques, i el 50% del transport escolar i del transport a centres de treball, segons [la resolució de la Generalitat Valenciana](${RESOL}).`,
    },
    salud: {
      name: "Hospitals i centres de salut públics",
      setBy: "Generalitat Valenciana",
      pending: CA_PENDING_GVA,
      where: `Per a la teva cita, el teu hospital o centre de salut; la resolució, a la [llista de la Generalitat](${LIST})`,
      text: `Als hospitals, els serveis d'un diumenge a les plantes, les urgències i els quiròfans d'urgències, i els d'un dia laborable normal a diàlisi, radioteràpia, UCI, trasplantaments, hospital de dia i oncologia, amb el 25% de les consultes externes preferents; als centres de salut i consultoris, els serveis d'un dissabte, i els punts d'atenció continuada, amb el seu servei normal, segons [la resolució de la Generalitat Valenciana](${RESOL}).`,
    },
    colegios: {
      name: "Escoles i instituts públics",
      setBy: "Generalitat Valenciana",
      pending: CA_PENDING_GVA,
      where: `L'escola informa les famílies; la resolució, a la [llista de la Generalitat](${LIST})`,
      text: `Una persona de l'equip directiu a cada centre; a infantil i primària, a més, un docent per etapa i com a mínim un per cada quatre unitats; a secundària, batxillerat i FP, un per etapa i com a mínim un per cada deu unitats; als menjadors escolars, el 60% del personal, segons [la resolució de la Generalitat Valenciana](${RESOL}).`,
    },
    administracion: {
      name: "Administració de la Generalitat",
      setBy: "Generalitat Valenciana",
      pending: CA_PENDING_GVA,
      where: `La resolució, a la [llista de la Generalitat](${LIST})`,
      text: `Una persona a cada servei de registre general, segons [la resolució de la Generalitat Valenciana](${RESOL}).`,
    },
  },
};

export const en: CityTr = {
  titleTransport: "TRAM and bus",
  transportShort: "TRAM and buses",
  authority: `the Valencian regional government (Generalitat Valenciana), in a resolution posted on its [list of minimum services](${LIST})`,
  authorityShort: "the Valencian regional government (Generalitat Valenciana)",
  bulletin: "the DOGV",
  cercanias: "Cercanías Murcia/Alicante",
  airport: "Alicante-Elche Miguel Hernández",
  airNotes: [
    `At Alicante-Elche Miguel Hernández airport, 74% of flights to and from the Balearic Islands, the Canary Islands, Ceuta and Melilla and of routes under a public service obligation; 54% of international flights and of mainland flights whose public transport alternative takes 5 hours or more, and 31% of mainland flights with an alternative of under 5 hours, for each route and airline, according to the [Ministry of Transport resolution](${AIR}).`,
    "If the flight links two Spanish airports with different percentages, the higher one applies, and the result is rounded up.",
  ],
  msSummary: `TRAM d'Alacant at 80% of its scheduled service; intercity buses at 55% at peak times and 40% the rest of the day; hospitals on a Sunday service and health centres on a Saturday service, according to [the Generalitat Valenciana's resolution of 6 November](${RESOL})`,
  msNotes: [
    `**Published on 6 November.** The [resolution of the Regional Minister for Housing, Employment, Youth and Equality](${RESOL}), which the Generalitat lists on its [strikes and minimum services page](${LIST}), sets in a single text those for FGV (metro, tram and TRAM), metropolitan and intercity buses, healthcare, state schools and the Generalitat's administration.`,
    "**It does not cover municipal city buses:** those of EMT València and of Alicante's city bus had not been published as of 10 November.",
  ],
  railNotes: [],
  school: `**In the calendar, it is a school day.** The [2026-2027 school calendar resolution](${CAL}) sets classes from 9 September 2026 to 18 June 2027 and, in the autumn, only 9 and 12 October and 8 December as non-school holidays; Alicante's local holidays in 2026 are 16 April (Santa Faz) and 23 June (Fogueres de Sant Joan) ([DOGV of 14 November 2025](${FIESTAS})). But each town council could propose "up to a maximum of three local non-school days for school purposes": check with the school.`,
  schoolShort: "A school day in the Valencian Community's calendar; check with the school for its local non-school days",
  demos: [
    `**CCOO PV:** rally at 18.00 at the Escales Jorge Juan ("Alacant. Escales Jorge Juan"), according to [CCOO del País Valencià](${CCOO_DEMO}), which [is calling for a stoppage on 11N](${CCOO_CALL}).`,
  ],
  demoShort: "CCOO PV, at 18.00, at the Escales Jorge Juan",
  demoWhere: `Keep an eye on [CCOO PV](${CCOO_DEMO}) in case the time or place changes.`,
  callNotes: [],
  services: {
    tram: {
      name: "TRAM d'Alacant (FGV)",
      setBy: "Generalitat Valenciana",
      pending: EN_PENDING_GVA,
      where: "Service notices, at [tramalacant.es](https://www.tramalacant.es/)",
      text: `80% of scheduled train and tram services, according to [the Generalitat Valenciana's resolution](${RESOL}).`,
      question: "Is the TRAM running in Alicante on 11 November?",
    },
    bus: {
      name: "Alicante city bus",
      setBy: "To be confirmed",
      pending: `Nobody has published them yet on the [Generalitat's minimum services list](${LIST}).`,
      where: `The resolution, when it comes out, on the [Generalitat's list](${LIST})`,
      text: null,
    },
    interurbanos: {
      name: "Intercity buses",
      setBy: "Generalitat Valenciana",
      pending: EN_PENDING_GVA,
      where: `The resolution, on the [Generalitat's list](${LIST}); your route, on its operator's website`,
      text: `55% of services at peak times (from 6.00 to 9.00 and from 17.00 to 19.00) and 40% the rest of the day; 80% of those serving airports, ports and railway stations in tourist areas, and 50% of school transport and of transport to workplaces, according to [the Generalitat Valenciana's resolution](${RESOL}).`,
    },
    salud: {
      name: "Public hospitals and health centres",
      setBy: "Generalitat Valenciana",
      pending: EN_PENDING_GVA,
      where: `For your appointment, your hospital or health centre; the resolution, on the [Generalitat's list](${LIST})`,
      text: `In hospitals, a Sunday service on wards, in A&E and in emergency operating theatres, and a normal weekday service in dialysis, radiotherapy, ICU, transplants, day hospital and oncology, with 25% of priority outpatient appointments; in health centres and local surgeries, a Saturday service, and the out-of-hours care points with their normal service, according to [the Generalitat Valenciana's resolution](${RESOL}).`,
    },
    colegios: {
      name: "State primary and secondary schools",
      setBy: "Generalitat Valenciana",
      pending: EN_PENDING_GVA,
      where: `The school informs families; the resolution, on the [Generalitat's list](${LIST})`,
      text: `One member of the management team at each school; in nursery and primary, also one teacher per stage and at least one for every four classes; in secondary, bachillerato and vocational training (FP), one per stage and at least one for every ten classes; in school canteens, 60% of staff, according to [the Generalitat Valenciana's resolution](${RESOL}).`,
    },
    administracion: {
      name: "Generalitat administration",
      setBy: "Generalitat Valenciana",
      pending: EN_PENDING_GVA,
      where: `The resolution, on the [Generalitat's list](${LIST})`,
      text: `One person in each general registry office, according to [the Generalitat Valenciana's resolution](${RESOL}).`,
    },
  },
};
