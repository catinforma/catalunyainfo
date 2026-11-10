import type { CityTr } from "../strike-11n-cities-model";

const BOJA = "https://www.juntadeandalucia.es/eboja.html";
const ORDEN_SANIDAD = "https://www.juntadeandalucia.es/boja/2026/216/31";
const RES_2025 = "https://www.juntadeandalucia.es/eboja/2025/197/BOJA25-197-00011-13546-01_00327143.pdf";
const MITMA = "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf";
const CCOO_AND =
  "https://andalucia.ccoo.es/noticia:770740--CCOO_de_Andalucia_hace_un_llamamiento_a_la_clase_trabajadora_y_a_la_ciudadania_a_que_se_sume_a_la_huelga_y_a_las_movilizaciones_convocadas_el_11N&opc_id=3b47924008abebb0a1b9cb703fffef0c";
const CALENDARIO =
  "https://www.juntadeandalucia.es/educacion/portales/documents/2854624/4501041/RESOLUCION%20CALENDARIO%20ESCOLAR%202026_27%20MALAGA.pdf/6f0af8f4-b17b-3b67-2797-e53eb85376e9?version=1.0";
const FIESTAS = "https://www.juntadeandalucia.es/boja/2025/197/BOJA25-197-00016-13517-01_00327114.pdf";
const INQUILINAS = "https://inquilinatomalaga.org/2026/11/05/el-comite-de-huelga-llama-a-la-movilizacion-en-malaga-para-el-11n/";
const HUELGA_CCOO = "https://huelga.ccoo.es/";

const caPending = `Els fixa la Junta d'Andalusia: en l'última vaga general, amb una [resolució de la Direcció General de Treball](${RES_2025}) que cobria també el transport urbà. Sortiran al [BOJA](${BOJA}).`;
const enPending = `They are set by the Junta de Andalucía: in the last general strike, with a [resolution of the Directorate-General for Labour](${RES_2025}) that also covered urban transport. They will be published in the [BOJA](${BOJA}).`;

/** Málaga, in Catalan and English (10 Nov 2026): the Spanish facts of strike-11n-cities-data.ts, same links and figures. */
export const ca: CityTr = {
  titleTransport: `metro i EMT`,
  transportShort: `metro, EMT i autobusos metropolitans`,
  authority: `la Junta d'Andalusia, per resolucions i ordres que es publiquen al [BOJA](${BOJA})`,
  authorityShort: `la Junta d'Andalusia (BOJA)`,
  bulletin: `el BOJA`,
  cercanias: `Cercanías Málaga`,
  airport: `Màlaga-Costa del Sol`,
  airNotes: [
    `A l'aeroport de Màlaga-Costa del Sol, el 75% dels vols amb les Illes Balears, les Canàries, Ceuta i Melilla i de les rutes amb obligació de servei públic; el 57% dels internacionals i dels peninsulars amb una alternativa en transport públic de 5 hores o més, i el 32% dels peninsulars amb una alternativa de menys de 5 hores, per a cada ruta i companyia, segons la [resolució del Ministeri de Transports](${MITMA}).`,
    `Si el vol uneix dos aeroports espanyols amb percentatges diferents, s'aplica el més alt, i el resultat s'arrodoneix a l'alça.`,
  ],
  msSummary: `als hospitals, l'activitat d'un diumenge o festiu, i als centres de salut, només l'atenció urgent, segons l'[ordre de la Junta d'Andalusia publicada al BOJA del 9 de novembre](${ORDEN_SANIDAD})`,
  msNotes: [
    `**La de la sanitat, publicada el 9 de novembre.** El BOJA núm. 216 inclou l'[Ordre de 3 de novembre de 2026](${ORDEN_SANIDAD}), amb els serveis mínims de la sanitat pública i privada. Ni aquest butlletí ni el del 10 de novembre inclouen els del transport urbà ni els de les escoles.`,
    `En la vaga general del 15 d'octubre de 2025, la Junta va fixar els serveis mínims amb una [resolució de la Direcció General de Treball](${RES_2025}) que cobria, entre altres, el transport urbà de viatgers i les escoles i els instituts, signada el 8 d'octubre i publicada al BOJA del 14, la vigília; l'ordre de la sanitat pública i les de cada conselleria van sortir el mateix dia de la vaga.`,
    `**Compte: regeixen des de la signatura.** Aquella resolució deia que «entrarà en vigor el dia de la seva signatura, sens perjudici de la seva publicació posterior al Butlletí Oficial de la Junta d'Andalusia»: els serveis mínims es poden aplicar abans de sortir al [BOJA](${BOJA}).`,
  ],
  railNotes: [],
  school: `**Sí, és dia lectiu.** La [resolució del calendari escolar 2026-2027 de la província de Màlaga](${CALENDARIO}) no inclou l'11 de novembre entre els dies no lectius, i les festes locals de Màlaga el 2026 són el 19 d'agost i el 8 de setembre ([BOJA del 14 d'octubre de 2025](${FIESTAS})).`,
  schoolShort: `Sí, és dia lectiu`,
  demos: [
    `**Comitè de Vaga de Màlaga:** manifestació a les 18.00 h amb sortida des de la plaça del General Torrijos, al costat de la Fuente de las Tres Gracias, segons el [Sindicato de Inquilinas de Málaga](${INQUILINAS}).`,
    `Estigueu atents a [CCOO d'Andalusia](${CCOO_AND}) i a la [web de la vaga de CCOO](${HUELGA_CCOO}) per si es convoquen altres marxes.`,
  ],
  demoShort: `A les 18.00 h, des de la plaça del General Torrijos (Fuente de las Tres Gracias)`,
  demoWhere: `CCOO diu que «l'11 N CCOO convocarà manifestacions arreu de l'Estat» ([huelga.ccoo.es](${HUELGA_CCOO})); estigueu atents també a [CCOO d'Andalusia](${CCOO_AND}). Tan bon punt publiquin l'hora i el lloc, els posarem aquí.`,
  callNotes: [
    `**A Andalusia**, CCOO d'Andalusia va registrar la convocatòria el 22 d'octubre «juntament amb el Sindicato de Inquilinas; UGT d'Andalusia; SAT; USTEA; CGT i CNT» ([CCOO d'Andalusia](${CCOO_AND})).`,
  ],
  services: {
    metro: {
      name: `Metro de Málaga`,
      setBy: `Junta d'Andalusia`,
      pending: caPending,
      where: `Les [notes de Metro de Málaga](https://metromalaga.es/notas-de-prensa/)`,
      text: null,
      question: `Hi ha metro a Màlaga l'11 de novembre?`,
    },
    emt: {
      name: `Autobusos de l'EMT de Màlaga`,
      setBy: `Junta d'Andalusia`,
      pending: caPending,
      where: `Les [notícies de l'EMT](https://www.emtmalaga.es/noticias)`,
      text: null,
      question: `Hi ha autobusos de l'EMT a Màlaga l'11 de novembre?`,
    },
    consorcio: {
      name: `Autobusos metropolitans`,
      setBy: `Junta d'Andalusia`,
      pending: caPending,
      where: `Les notícies del [Consorcio de Transportes del Área de Málaga](https://siu.ctmam.ctan.es/es/noticias.php)`,
      text: null,
    },
    salud: {
      name: `Hospitals i centres de salut (SAS)`,
      setBy: `Junta d'Andalusia`,
      pending: `Els fixa la Junta d'Andalusia per ordre de la seva conselleria de Sanitat, que es publica al [BOJA](${BOJA}).`,
      where: `Per a la teva cita, el teu hospital o centre de salut; l'ordre, al [BOJA](${BOJA})`,
      text: `Als hospitals, el 100% de l'activitat d'un diumenge o festiu, amb les urgències com en un cap de setmana, i garantides la radioteràpia, la quimioteràpia, la cirurgia oncològica i la diàlisi; als centres de salut, només l'atenció urgent: amb un metge als que no tenen servei d'urgències (SUAP) i, als que en tenen, al SUAP, com en un cap de setmana, segons l'[Ordre de 3 de novembre de 2026 de la Junta d'Andalusia](${ORDEN_SANIDAD}).`,
    },
    colegios: {
      name: `Escoles i instituts`,
      setBy: `Junta d'Andalusia`,
      pending: `Els fixa la Junta d'Andalusia per resolució i ordres que es publiquen al [BOJA](${BOJA}).`,
      where: `L'escola informa les famílies; la resolució, al [BOJA](${BOJA})`,
      text: null,
    },
    administracion: {
      name: `Administració de la Junta d'Andalusia`,
      setBy: `Junta d'Andalusia`,
      pending: `Els fixa cada conselleria de la Junta per ordre, que es publica al [BOJA](${BOJA}).`,
      where: `Les ordres, al [BOJA](${BOJA})`,
      text: null,
    },
  },
};

export const en: CityTr = {
  titleTransport: `metro and EMT`,
  transportShort: `metro, EMT and metropolitan buses`,
  authority: `the Junta de Andalucía (Andalusian regional government), through resolutions and orders published in the [BOJA](${BOJA})`,
  authorityShort: `the Junta de Andalucía (BOJA)`,
  bulletin: `the BOJA`,
  cercanias: `Cercanías Málaga`,
  airport: `Málaga-Costa del Sol`,
  airNotes: [
    `At Málaga-Costa del Sol airport, 75% of flights to and from the Balearic Islands, the Canary Islands, Ceuta and Melilla and of routes under a public service obligation; 57% of international flights and of mainland flights whose public transport alternative takes 5 hours or more, and 32% of mainland flights with an alternative of under 5 hours, for each route and airline, according to the [Ministry of Transport resolution](${MITMA}).`,
    `If the flight links two Spanish airports with different percentages, the higher one applies, and the result is rounded up.`,
  ],
  msSummary: `in hospitals, the activity of a Sunday or public holiday, and in health centres, urgent care only, according to the [Junta de Andalucía order published in the BOJA on 9 November](${ORDEN_SANIDAD})`,
  msNotes: [
    `**The healthcare order, published on 9 November.** BOJA no. 216 carries the [Order of 3 November 2026](${ORDEN_SANIDAD}), with the minimum services for public and private healthcare. Neither that bulletin nor the 10 November one includes those for urban transport or for schools.`,
    `In the general strike of 15 October 2025, the Junta set the minimum services with a [resolution of the Directorate-General for Labour](${RES_2025}) that covered, among other things, urban passenger transport and primary and secondary schools, signed on 8 October and published in the BOJA on the 14th, the day before; the public healthcare order and those of each regional ministry came out on the day of the strike itself.`,
    `**Note: they apply from the date of signature.** That resolution said that it "will enter into force on the day it is signed, without prejudice to its subsequent publication in the Official Bulletin of the Junta de Andalucía": minimum services can apply before they appear in the [BOJA](${BOJA}).`,
  ],
  railNotes: [],
  school: `**Yes, it is a school day.** The [2026-2027 school calendar resolution for the province of Málaga](${CALENDARIO}) does not list 11 November among the non-school days, and Málaga's local holidays in 2026 are 19 August and 8 September ([BOJA of 14 October 2025](${FIESTAS})).`,
  schoolShort: `Yes, it is a school day`,
  demos: [
    `**Málaga Strike Committee:** march at 18.00 setting off from Plaza del General Torrijos, next to the Fuente de las Tres Gracias, according to the [Sindicato de Inquilinas de Málaga](${INQUILINAS}).`,
    `Keep an eye on [CCOO de Andalucía](${CCOO_AND}) and the [CCOO strike website](${HUELGA_CCOO}) in case other marches are called.`,
  ],
  demoShort: `At 18.00, from Plaza del General Torrijos (Fuente de las Tres Gracias)`,
  demoWhere: `CCOO says that "on 11 N CCOO will call demonstrations throughout the country" ([huelga.ccoo.es](${HUELGA_CCOO})); keep an eye on [CCOO de Andalucía](${CCOO_AND}) too. As soon as they publish the time and place, we will post them here.`,
  callNotes: [
    `**In Andalusia**, CCOO de Andalucía registered the strike call on 22 October "together with the Sindicato de Inquilinas; UGT de Andalucía; SAT; USTEA; CGT and CNT" ([CCOO de Andalucía](${CCOO_AND})).`,
  ],
  services: {
    metro: {
      name: `Metro de Málaga`,
      setBy: `Junta de Andalucía`,
      pending: enPending,
      where: `[Metro de Málaga's press releases](https://metromalaga.es/notas-de-prensa/)`,
      text: null,
      question: `Is the Málaga metro running on 11 November?`,
    },
    emt: {
      name: `EMT Málaga buses`,
      setBy: `Junta de Andalucía`,
      pending: enPending,
      where: `[EMT news](https://www.emtmalaga.es/noticias)`,
      text: null,
      question: `Are EMT buses running in Málaga on 11 November?`,
    },
    consorcio: {
      name: `Metropolitan buses`,
      setBy: `Junta de Andalucía`,
      pending: enPending,
      where: `News from the [Consorcio de Transportes del Área de Málaga](https://siu.ctmam.ctan.es/es/noticias.php)`,
      text: null,
    },
    salud: {
      name: `Hospitals and health centres (SAS)`,
      setBy: `Junta de Andalucía`,
      pending: `They are set by the Junta de Andalucía through an order of its regional health ministry, published in the [BOJA](${BOJA}).`,
      where: `For your appointment, your hospital or health centre; the order, in the [BOJA](${BOJA})`,
      text: `In hospitals, 100% of the activity of a Sunday or public holiday, with A&E as at a weekend, and radiotherapy, chemotherapy, cancer surgery and dialysis guaranteed; in health centres, urgent care only: with a doctor in those without an emergency service (SUAP) and, in those that have one, in the SUAP, as at a weekend, according to the [Junta de Andalucía's Order of 3 November 2026](${ORDEN_SANIDAD}).`,
    },
    colegios: {
      name: `Primary and secondary schools`,
      setBy: `Junta de Andalucía`,
      pending: `They are set by the Junta de Andalucía through a resolution and orders published in the [BOJA](${BOJA}).`,
      where: `The school informs families; the resolution, in the [BOJA](${BOJA})`,
      text: null,
    },
    administracion: {
      name: `Junta de Andalucía administration`,
      setBy: `Junta de Andalucía`,
      pending: `Each regional ministry of the Junta sets them by order, published in the [BOJA](${BOJA}).`,
      where: `The orders, in the [BOJA](${BOJA})`,
      text: null,
    },
  },
};
