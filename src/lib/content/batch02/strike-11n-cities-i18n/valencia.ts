import type { CityTr } from "../strike-11n-cities-model";

const LIST = "https://habitatge.gva.es/es/web/dg-trabajo/vagues-serveis-minims";
const RES =
  "https://habitatge.gva.es/documents/21189/165429228/RESOL_HUELGA+GRAL+11nov26+firmado.pdf/e8132fe4-1128-4d8d-8545-0a5baac22c6b?t=1793978491151";
const AENA_RES = "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf";
const CCOO_PV = "https://www.pv.ccoo.es/noticia:770384";
const EMT = "https://www.emtvalencia.es/";

/** Valencia, in Catalan and English (10 Nov 2026): the Spanish facts of strike-11n-cities-data.ts, same links and figures. */
export const ca: CityTr = {
  titleTransport: "metro i EMT",
  transportShort: "metro, tramvia i EMT",
  authority: `la Generalitat Valenciana, en una resolució que té a la seva [llista de serveis mínims](${LIST})`,
  authorityShort: "la Generalitat Valenciana",
  bulletin: "el DOGV",
  cercanias: "Cercanías Valencia",
  airport: "València",
  airNotes: [
    `A l'aeroport de València, el 75% dels vols amb les Balears, les Canàries, Ceuta i Melilla i de les rutes amb obligació de servei públic; el 59% dels internacionals i dels peninsulars l'alternativa dels quals en transport públic triga 5 hores o més, i el 32% dels peninsulars amb alternativa de menys de 5 hores, per a cada ruta i companyia, segons la [resolució del Ministeri de Transports](${AENA_RES}).`,
    "Si el vol uneix dos aeroports espanyols amb percentatges diferents, s'aplica el més alt, i el resultat s'arrodoneix a l'alça.",
  ],
  msSummary: `Metrovalencia (metro i tramvia), al 80% del servei programat; autobusos metropolitans de l'ATMV, al 70% i, en hora punta, al 80%; als hospitals, els serveis d'un diumenge, i als centres de salut, els d'un dissabte, segons [la resolució de la Generalitat Valenciana del 6 de novembre](${RES})`,
  msNotes: [
    `**Publicats el 6 de novembre.** La [resolució de la consellera d'Habitatge, Ocupació, Joventut i Igualtat](${RES}), que la Generalitat té a la seva [llista de vagues i serveis mínims](${LIST}), fixa en un sol text els de FGV (metro, tramvia i TRAM), els autobusos metropolitans i interurbans, la sanitat, les escoles públiques i l'administració de la Generalitat.`,
    "**No cobreix els autobusos urbans municipals:** els de l'EMT de València i els de l'autobús urbà d'Alacant no estaven publicats el 10 de novembre.",
  ],
  railNotes: [],
  school:
    "**Al calendari, sí que és dia lectiu.** La [resolució del calendari escolar 2026-2027](https://dogv.gva.es/datos/2026/06/18/pdf/2026_20810_es.pdf) fixa les classes del 9 de setembre de 2026 al 18 de juny de 2027 i, a la tardor, només el 9 i el 12 d'octubre i el 8 de desembre com a festius no lectius; les festes locals de València el 2026 són el 22 de gener i el 13 d'abril ([DOGV del 14 de novembre de 2025](https://dogv.gva.es/datos/2025/11/14/pdf/2025_46326_es.pdf)). Però cada ajuntament podia proposar «fins a un màxim de tres dies no lectius de caràcter local a efectes escolars»: confirma-ho amb l'escola.",
  schoolShort: "Dia lectiu al calendari de la Comunitat; confirma amb l'escola els seus dies no lectius locals",
  demos: [
    `**CCOO PV:** manifestació a les 18.00 h amb sortida del carrer de Xàtiva («València. C/ Xàtiva»), segons [CCOO del País Valencià](${CCOO_PV}), que [crida a aturar l'11N](https://www.pv.ccoo.es/noticia:771136).`,
  ],
  demoShort: "CCOO PV, a les 18.00 h, des del carrer de Xàtiva",
  demoWhere: `Estigueu atents a [CCOO PV](${CCOO_PV}) per si canvia l'hora o el lloc.`,
  callNotes: [],
  services: {
    metrovalencia: {
      name: "Metrovalencia (metro i tramvia, FGV)",
      setBy: "Generalitat Valenciana",
      pending: `Els fixa la Generalitat Valenciana (Conselleria d'Habitatge, Ocupació, Joventut i Igualtat) per resolució, que publica a la seva [llista de vagues i serveis mínims](${LIST}).`,
      where: "Els avisos, a [metrovalencia.es](https://www.metrovalencia.es/)",
      text: `El 80% del servei programat de trens i tramvies, segons [la resolució de la Generalitat Valenciana](${RES}).`,
      question: "Hi ha metro a València l'11 de novembre?",
    },
    atmv: {
      name: "Autobusos metropolitans (ATMV)",
      setBy: "Generalitat Valenciana",
      pending: `Els fixa la Generalitat Valenciana (Conselleria d'Habitatge, Ocupació, Joventut i Igualtat) per resolució, que publica a la seva [llista de vagues i serveis mínims](${LIST}).`,
      where: `La resolució, a la [llista de la Generalitat](${LIST})`,
      text: `El 70% dels serveis i, en hora punta (de 6.30 a 9.00, de 13.30 a 15.30 i de 18.30 a 21.00 h), el 80%, segons [la resolució de la Generalitat Valenciana](${RES}).`,
    },
    emt: {
      name: "Autobusos de l'EMT de València",
      setBy: "Per confirmar",
      pending: `Encara no els ha publicat ningú: ni la [llista de serveis mínims de la Generalitat](${LIST}) ni l'[EMT de València](${EMT}).`,
      where: `Les alteracions del servei, a [emtvalencia.es](${EMT})`,
      text: null,
      question: "Hi ha autobusos de l'EMT a València l'11 de novembre?",
    },
    interurbanos: {
      name: "Autobusos interurbans",
      setBy: "Generalitat Valenciana",
      pending: `Els fixa la Generalitat Valenciana (Conselleria d'Habitatge, Ocupació, Joventut i Igualtat) per resolució, que publica a la seva [llista de vagues i serveis mínims](${LIST}).`,
      where: `La resolució, a la [llista de la Generalitat](${LIST}); la teva línia, al web del seu operador`,
      text: `El 55% dels serveis en hora punta (de 6.00 a 9.00 i de 17.00 a 19.00 h) i el 40% la resta del dia; el 80% dels que van a aeroports, ports i estacions de tren en zones turístiques, i el 50% del transport escolar i del transport a centres de treball, segons [la resolució de la Generalitat Valenciana](${RES}).`,
    },
    salud: {
      name: "Hospitals i centres de salut públics",
      setBy: "Generalitat Valenciana",
      pending: `Els fixa la Generalitat Valenciana (Conselleria d'Habitatge, Ocupació, Joventut i Igualtat) per resolució, que publica a la seva [llista de vagues i serveis mínims](${LIST}).`,
      where: `Per a la teva cita, el teu hospital o centre de salut; la resolució, a la [llista de la Generalitat](${LIST})`,
      text: `Als hospitals, els serveis d'un diumenge a plantes, urgències i quiròfans d'urgències, i els d'un dia laborable normal a diàlisi, radioteràpia, UCI, trasplantaments, hospital de dia i oncologia, amb el 25% de les consultes externes preferents; als centres de salut i consultoris, els serveis d'un dissabte, i els punts d'atenció continuada, amb el seu servei normal, segons [la resolució de la Generalitat Valenciana](${RES}).`,
    },
    colegios: {
      name: "Escoles i instituts públics",
      setBy: "Generalitat Valenciana",
      pending: `Els fixa la Generalitat Valenciana (Conselleria d'Habitatge, Ocupació, Joventut i Igualtat) per resolució, que publica a la seva [llista de vagues i serveis mínims](${LIST}).`,
      where: `L'escola informa les famílies; la resolució, a la [llista de la Generalitat](${LIST})`,
      text: `Una persona de l'equip directiu a cada centre; a infantil i primària, a més, un docent per etapa i com a mínim un per cada quatre unitats; a secundària, batxillerat i FP, un per etapa i com a mínim un per cada deu unitats; als menjadors escolars, el 60% del personal, segons [la resolució de la Generalitat Valenciana](${RES}).`,
    },
    administracion: {
      name: "Administració de la Generalitat",
      setBy: "Generalitat Valenciana",
      pending: `Els fixa la Generalitat Valenciana (Conselleria d'Habitatge, Ocupació, Joventut i Igualtat) per resolució, que publica a la seva [llista de vagues i serveis mínims](${LIST}).`,
      where: `La resolució, a la [llista de la Generalitat](${LIST})`,
      text: `Una persona a cada servei de registre general, segons [la resolució de la Generalitat Valenciana](${RES}).`,
    },
  },
};

export const en: CityTr = {
  titleTransport: "metro and EMT",
  transportShort: "metro, tram and EMT",
  authority: `the Valencian regional government (Generalitat Valenciana), in a resolution it lists on its [minimum services page](${LIST})`,
  authorityShort: "the Valencian regional government (Generalitat Valenciana)",
  bulletin: "the DOGV",
  cercanias: "Cercanías Valencia",
  airport: "Valencia",
  airNotes: [
    `At Valencia airport, 75% of flights to and from the Balearic Islands, the Canary Islands, Ceuta and Melilla and on public service obligation routes; 59% of international flights and of mainland flights whose public transport alternative takes 5 hours or more, and 32% of mainland flights with an alternative of under 5 hours, for each route and airline, according to the [Ministry of Transport resolution](${AENA_RES}).`,
    "If a flight links two Spanish airports with different percentages, the higher one applies, and the result is rounded up.",
  ],
  msSummary: `Metrovalencia (metro and tram) at 80% of scheduled service; ATMV metropolitan buses at 70% and, at peak times, 80%; in hospitals, a Sunday service, and in health centres, a Saturday service, according to [the Generalitat Valenciana's resolution of 6 November](${RES})`,
  msNotes: [
    `**Published on 6 November.** The [resolution of the regional minister for Housing, Employment, Youth and Equality](${RES}), which the Generalitat lists on its [strikes and minimum services page](${LIST}), sets out in a single text those for FGV (metro, tram and TRAM), metropolitan and interurban buses, healthcare, state schools and the Generalitat's administration.`,
    "**It does not cover municipal city buses:** those for Valencia's EMT and for Alicante's city buses had not been published as of 10 November.",
  ],
  railNotes: [],
  school:
    "**On the calendar, it is a school day.** The [2026-2027 school calendar resolution](https://dogv.gva.es/datos/2026/06/18/pdf/2026_20810_es.pdf) sets classes from 9 September 2026 to 18 June 2027 and, in the autumn, only 9 and 12 October and 8 December as non-teaching holidays; Valencia's local holidays in 2026 are 22 January and 13 April ([DOGV of 14 November 2025](https://dogv.gva.es/datos/2025/11/14/pdf/2025_46326_es.pdf)). But each town council could propose \"up to a maximum of three local non-teaching days for school purposes\": check with the school.",
  schoolShort: "A school day on the Valencian Community calendar; check with the school for its local non-teaching days",
  demos: [
    `**CCOO PV:** march at 18.00 starting from Calle de Xàtiva (\"València. C/ Xàtiva\"), according to [CCOO del País Valencià](${CCOO_PV}), which is [calling on people to stop on 11N](https://www.pv.ccoo.es/noticia:771136).`,
  ],
  demoShort: "CCOO PV, at 18.00, from Calle de Xàtiva",
  demoWhere: `Keep an eye on [CCOO PV](${CCOO_PV}) in case the time or place changes.`,
  callNotes: [],
  services: {
    metrovalencia: {
      name: "Metrovalencia (metro and tram, FGV)",
      setBy: "Generalitat Valenciana",
      pending: `They are set by the Generalitat Valenciana (Regional Ministry of Housing, Employment, Youth and Equality) by resolution, which it publishes on its [list of strikes and minimum services](${LIST}).`,
      where: "Notices on [metrovalencia.es](https://www.metrovalencia.es/)",
      text: `80% of scheduled train and tram services, according to [the Generalitat Valenciana's resolution](${RES}).`,
      question: "Is the Valencia metro running on 11 November?",
    },
    atmv: {
      name: "Metropolitan buses (ATMV)",
      setBy: "Generalitat Valenciana",
      pending: `They are set by the Generalitat Valenciana (Regional Ministry of Housing, Employment, Youth and Equality) by resolution, which it publishes on its [list of strikes and minimum services](${LIST}).`,
      where: `The resolution, on the [Generalitat's list](${LIST})`,
      text: `70% of services and, at peak times (6.30 to 9.00, 13.30 to 15.30 and 18.30 to 21.00), 80%, according to [the Generalitat Valenciana's resolution](${RES}).`,
    },
    emt: {
      name: "EMT buses in Valencia",
      setBy: "To be confirmed",
      pending: `Nobody has published them yet: neither the [Generalitat's list of minimum services](${LIST}) nor [Valencia's EMT](${EMT}).`,
      where: `Service changes on [emtvalencia.es](${EMT})`,
      text: null,
      question: "Are EMT buses running in Valencia on 11 November?",
    },
    interurbanos: {
      name: "Interurban buses",
      setBy: "Generalitat Valenciana",
      pending: `They are set by the Generalitat Valenciana (Regional Ministry of Housing, Employment, Youth and Equality) by resolution, which it publishes on its [list of strikes and minimum services](${LIST}).`,
      where: `The resolution, on the [Generalitat's list](${LIST}); your line, on its operator's website`,
      text: `55% of services at peak times (6.00 to 9.00 and 17.00 to 19.00) and 40% the rest of the day; 80% of those serving airports, ports and railway stations in tourist areas, and 50% of school transport and of transport to workplaces, according to [the Generalitat Valenciana's resolution](${RES}).`,
    },
    salud: {
      name: "Public hospitals and health centres",
      setBy: "Generalitat Valenciana",
      pending: `They are set by the Generalitat Valenciana (Regional Ministry of Housing, Employment, Youth and Equality) by resolution, which it publishes on its [list of strikes and minimum services](${LIST}).`,
      where: `For your appointment, your hospital or health centre; the resolution, on the [Generalitat's list](${LIST})`,
      text: `In hospitals, a Sunday service on wards, in A&E and in emergency operating theatres, and a normal weekday service in dialysis, radiotherapy, ICU, transplants, day hospital and oncology, with 25% of priority outpatient appointments; in health centres and local clinics, a Saturday service, and continuous care points with their normal service, according to [the Generalitat Valenciana's resolution](${RES}).`,
    },
    colegios: {
      name: "State primary and secondary schools",
      setBy: "Generalitat Valenciana",
      pending: `They are set by the Generalitat Valenciana (Regional Ministry of Housing, Employment, Youth and Equality) by resolution, which it publishes on its [list of strikes and minimum services](${LIST}).`,
      where: `The school informs families; the resolution, on the [Generalitat's list](${LIST})`,
      text: `One member of the management team in each school; in nursery and primary, also one teacher per stage and at least one per four class groups; in secondary, bachillerato and vocational training (FP), one per stage and at least one per ten class groups; in school canteens, 60% of staff, according to [the Generalitat Valenciana's resolution](${RES}).`,
    },
    administracion: {
      name: "Generalitat administration",
      setBy: "Generalitat Valenciana",
      pending: `They are set by the Generalitat Valenciana (Regional Ministry of Housing, Employment, Youth and Equality) by resolution, which it publishes on its [list of strikes and minimum services](${LIST}).`,
      where: `The resolution, on the [Generalitat's list](${LIST})`,
      text: `One person in each general registry office, according to [the Generalitat Valenciana's resolution](${RES}).`,
    },
  },
};
