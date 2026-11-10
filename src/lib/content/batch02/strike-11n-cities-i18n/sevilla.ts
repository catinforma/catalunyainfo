import type { CityTr } from "../strike-11n-cities-model";

const BOJA = "https://www.juntadeandalucia.es/eboja.html";
const ORDEN = "https://www.juntadeandalucia.es/boja/2026/216/31";
const RES_2025 = "https://www.juntadeandalucia.es/eboja/2025/197/BOJA25-197-00011-13546-01_00327143.pdf";
const AIR = "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf";
const CAL =
  "https://www.juntadeandalucia.es/educacion/portales/documents/1176698/3340178/RESOL%20CALEND%2026_27%28F%29.pdf/8c2fd440-3e04-a1c5-d497-2170af36e265?version=1.0";
const FIESTAS = "https://www.juntadeandalucia.es/boja/2025/197/BOJA25-197-00016-13517-01_00327114.pdf";
const CCOO_AND =
  "https://andalucia.ccoo.es/noticia:770740--CCOO_de_Andalucia_hace_un_llamamiento_a_la_clase_trabajadora_y_a_la_ciudadania_a_que_se_sume_a_la_huelga_y_a_las_movilizaciones_convocadas_el_11N&opc_id=3b47924008abebb0a1b9cb703fffef0c";

const CA_PENDING_TRANSPORT = `Els fixa la Junta d'Andalusia: a la darrera vaga general, amb una [resolució de la Direcció General de Treball](${RES_2025}) que també cobria el transport urbà. Sortiran al [BOJA](${BOJA}).`;
const EN_PENDING_TRANSPORT = `Set by the Junta de Andalucía: in the last general strike, through a [resolution of the Directorate-General for Labour](${RES_2025}) that also covered urban transport. They will appear in the [BOJA](${BOJA}).`;

/** Seville, in Catalan and English (10 Nov 2026): the Spanish facts of strike-11n-cities-data.ts, same links and figures. */
export const ca: CityTr = {
  titleTransport: "metro i Tussam",
  transportShort: "metro, Tussam i autobusos metropolitans",
  authority: `la Junta d'Andalusia, per resolucions i ordres que es publiquen al [BOJA](${BOJA})`,
  authorityShort: "la Junta d'Andalusia (BOJA)",
  bulletin: "el BOJA",
  cercanias: "Cercanías Sevilla",
  airport: "Sevilla",
  airNotes: [
    `A l'aeroport de Sevilla, el 76% dels vols amb les Balears, les Canàries, Ceuta i Melilla i de les rutes amb obligació de servei públic; el 57% dels internacionals i dels peninsulars l'alternativa dels quals en transport públic triga 5 hores o més, i el 35% dels peninsulars amb alternativa de menys de 5 hores, per a cada ruta i companyia, segons la [resolució del Ministeri de Transports](${AIR}).`,
    "Si el vol uneix dos aeroports espanyols amb percentatges diferents, s'aplica el més alt, i el resultat s'arrodoneix a l'alça.",
  ],
  msSummary: `als hospitals, l'activitat d'un diumenge o festiu, i als centres de salut, només l'atenció urgent, segons l'[ordre de la Junta d'Andalusia publicada al BOJA del 9 de novembre](${ORDEN})`,
  msNotes: [
    `**La de sanitat, publicada el 9 de novembre.** El BOJA núm. 216 inclou l'[Ordre de 3 de novembre de 2026](${ORDEN}), amb els serveis mínims de la sanitat pública i privada. Ni aquest butlletí ni el del 10 de novembre inclouen els del transport urbà ni els de les escoles.`,
    `A la vaga general del 15 d'octubre de 2025, la Junta va fixar els serveis mínims amb una [resolució de la Direcció General de Treball](${RES_2025}) que cobria, entre d'altres, el transport urbà de viatgers i les escoles i instituts, signada el 8 d'octubre i publicada al BOJA del 14, la vigília; l'ordre de la sanitat pública i les de cada conselleria van sortir el mateix dia de la vaga.`,
    `**Compte: són vigents des de la signatura.** Aquella resolució deia que «entrarà en vigor el dia de la seva signatura, sens perjudici de la seva publicació posterior al Butlletí Oficial de la Junta d'Andalusia»: els serveis mínims es poden aplicar abans de sortir al [BOJA](${BOJA}).`,
  ],
  railNotes: [],
  school: `**Al calendari, sí que és dia lectiu.** La [resolució del calendari escolar 2026-2027 de la província de Sevilla](${CAL}) no té l'11 de novembre entre els dies no lectius, i les festes locals de Sevilla el 2026 són el 22 d'abril i el 4 de juny ([BOJA del 14 d'octubre de 2025](${FIESTAS})). Però cada consell escolar municipal podia acordar «fins a dos dies de lliure disposició» abans del 15 d'octubre, i no hem trobat els de Sevilla: confirma-ho amb l'escola.`,
  schoolShort: "Dia lectiu al calendari provincial; confirma amb l'escola els seus dies de lliure disposició",
  demos: [],
  demoShort: null,
  demoWhere: `CCOO diu que «l'11 N CCOO convocarà manifestacions arreu de l'Estat» ([huelga.ccoo.es](https://huelga.ccoo.es/)); atents també a [CCOO d'Andalusia](${CCOO_AND}). Tan bon punt publiquin l'hora i el lloc, els posarem aquí.`,
  callNotes: [
    `**A Andalusia**, CCOO d'Andalusia va registrar la convocatòria el 22 d'octubre «juntament amb el Sindicato de Inquilinas; UGT d'Andalusia; SAT; USTEA; CGT i CNT» ([CCOO d'Andalusia](${CCOO_AND})).`,
  ],
  services: {
    metro: {
      name: "Metro de Sevilla",
      setBy: "Junta d'Andalusia",
      pending: CA_PENDING_TRANSPORT,
      where: "Els avisos, a [metro-sevilla.es](https://www.metro-sevilla.es/)",
      text: null,
      question: "Hi ha metro a Sevilla l'11 de novembre?",
    },
    tussam: {
      name: "Tussam (autobusos i tramvia Metrocentro)",
      setBy: "Junta d'Andalusia",
      pending: CA_PENDING_TRANSPORT,
      where: "Els avisos, a [tussam.es](https://www.tussam.es/)",
      text: null,
      question: "Hi ha autobusos de Tussam l'11 de novembre?",
    },
    consorcio: {
      name: "Autobusos metropolitans",
      setBy: "Junta d'Andalusia",
      pending: CA_PENDING_TRANSPORT,
      where: "Les notícies del [Consorcio de Transportes del Área de Sevilla](https://siu.ctas.ctan.es/es/noticias.php)",
      text: null,
    },
    salud: {
      name: "Hospitals i centres de salut (SAS)",
      setBy: "Junta d'Andalusia",
      pending: `Els fixa la Junta d'Andalusia per ordre de la seva conselleria de Sanitat, que es publica al [BOJA](${BOJA}).`,
      where: `Per a la teva cita, el teu hospital o centre de salut; l'ordre, al [BOJA](${BOJA})`,
      text: `Als hospitals, el 100% de l'activitat d'un diumenge o festiu, amb les urgències com un cap de setmana, i garantides la radioteràpia, la quimioteràpia, la cirurgia oncològica i la diàlisi; als centres de salut, només l'atenció urgent: amb un metge als que no tenen servei d'urgències (SUAP) i, als que en tenen, al SUAP, com un cap de setmana, segons l'[Ordre de 3 de novembre de 2026 de la Junta d'Andalusia](${ORDEN}).`,
    },
    colegios: {
      name: "Escoles i instituts",
      setBy: "Junta d'Andalusia",
      pending: `Els fixa la Junta d'Andalusia per resolució i ordres que es publiquen al [BOJA](${BOJA}).`,
      where: `L'escola informa les famílies; la resolució, al [BOJA](${BOJA})`,
      text: null,
    },
    administracion: {
      name: "Administració de la Junta d'Andalusia",
      setBy: "Junta d'Andalusia",
      pending: `Els fixa cada conselleria de la Junta per ordre, que es publica al [BOJA](${BOJA}).`,
      where: `Les ordres, al [BOJA](${BOJA})`,
      text: null,
    },
  },
};

export const en: CityTr = {
  titleTransport: "metro and Tussam",
  transportShort: "metro, Tussam and metropolitan buses",
  authority: `the Junta de Andalucía (Andalusian regional government), through resolutions and orders published in the [BOJA](${BOJA})`,
  authorityShort: "the Junta de Andalucía (BOJA)",
  bulletin: "the BOJA",
  cercanias: "Cercanías Sevilla",
  airport: "Seville",
  airNotes: [
    `At Seville airport, 76% of flights to and from the Balearic Islands, the Canary Islands, Ceuta and Melilla and of routes under a public service obligation; 57% of international flights and of mainland flights whose public transport alternative takes 5 hours or more, and 35% of mainland flights with an alternative of under 5 hours, for each route and airline, according to the [Ministry of Transport resolution](${AIR}).`,
    "If the flight links two Spanish airports with different percentages, the higher one applies, and the result is rounded up.",
  ],
  msSummary: `in hospitals, the activity of a Sunday or public holiday, and in health centres, urgent care only, according to the [Junta de Andalucía order published in the BOJA on 9 November](${ORDEN})`,
  msNotes: [
    `**The health order, published on 9 November.** BOJA no. 216 carries the [Order of 3 November 2026](${ORDEN}), with the minimum services for public and private healthcare. Neither that bulletin nor the one of 10 November includes those for urban transport or for schools.`,
    `In the general strike of 15 October 2025, the Junta set the minimum services through a [resolution of the Directorate-General for Labour](${RES_2025}) that covered, among others, urban passenger transport and primary and secondary schools; it was signed on 8 October and published in the BOJA on the 14th, the day before. The public healthcare order and those of each regional ministry came out on the day of the strike itself.`,
    `**Note: they apply from signature.** That resolution said that it "will enter into force on the day it is signed, without prejudice to its subsequent publication in the Official Gazette of the Junta de Andalucía": minimum services can apply before they appear in the [BOJA](${BOJA}).`,
  ],
  railNotes: [],
  school: `**In the calendar, it is a school day.** The [2026-2027 school calendar resolution for the province of Seville](${CAL}) does not include 11 November among the non-school days, and Seville's local holidays in 2026 are 22 April and 4 June ([BOJA of 14 October 2025](${FIESTAS})). But each municipal school council could agree "up to two discretionary days" before 15 October, and we have not found Seville's: check with the school.`,
  schoolShort: "A school day in the provincial calendar; check with the school for its discretionary days",
  demos: [],
  demoShort: null,
  demoWhere: `CCOO says that "on 11 N CCOO will call demonstrations throughout the whole State" ([huelga.ccoo.es](https://huelga.ccoo.es/)); also keep an eye on [CCOO de Andalucía](${CCOO_AND}). As soon as they publish the time and place, we will add them here.`,
  callNotes: [
    `**In Andalusia**, CCOO de Andalucía registered the strike call on 22 October "together with the Sindicato de Inquilinas; UGT de Andalucía; SAT; USTEA; CGT and CNT" ([CCOO de Andalucía](${CCOO_AND})).`,
  ],
  services: {
    metro: {
      name: "Metro de Sevilla",
      setBy: "Junta de Andalucía",
      pending: EN_PENDING_TRANSPORT,
      where: "Service notices, at [metro-sevilla.es](https://www.metro-sevilla.es/)",
      text: null,
      question: "Is the Seville metro running on 11 November?",
    },
    tussam: {
      name: "Tussam (buses and Metrocentro tram)",
      setBy: "Junta de Andalucía",
      pending: EN_PENDING_TRANSPORT,
      where: "Service notices, at [tussam.es](https://www.tussam.es/)",
      text: null,
      question: "Are Tussam buses running on 11 November?",
    },
    consorcio: {
      name: "Metropolitan buses",
      setBy: "Junta de Andalucía",
      pending: EN_PENDING_TRANSPORT,
      where: "News from the [Consorcio de Transportes del Área de Sevilla](https://siu.ctas.ctan.es/es/noticias.php)",
      text: null,
    },
    salud: {
      name: "Hospitals and health centres (SAS)",
      setBy: "Junta de Andalucía",
      pending: `Set by the Junta de Andalucía through an order of its regional health ministry, published in the [BOJA](${BOJA}).`,
      where: `For your appointment, your hospital or health centre; the order, in the [BOJA](${BOJA})`,
      text: `In hospitals, 100% of the activity of a Sunday or public holiday, with A&E as at a weekend, and radiotherapy, chemotherapy, cancer surgery and dialysis guaranteed; in health centres, urgent care only: with one doctor in those without an urgent care service (SUAP) and, in those that have one, in the SUAP, as at a weekend, according to the [Junta de Andalucía Order of 3 November 2026](${ORDEN}).`,
    },
    colegios: {
      name: "Primary and secondary schools",
      setBy: "Junta de Andalucía",
      pending: `Set by the Junta de Andalucía by resolution and orders published in the [BOJA](${BOJA}).`,
      where: `The school informs families; the resolution, in the [BOJA](${BOJA})`,
      text: null,
    },
    administracion: {
      name: "Junta de Andalucía administration",
      setBy: "Junta de Andalucía",
      pending: `Set by each regional ministry of the Junta by order, published in the [BOJA](${BOJA}).`,
      where: `The orders, in the [BOJA](${BOJA})`,
      text: null,
    },
  },
};
