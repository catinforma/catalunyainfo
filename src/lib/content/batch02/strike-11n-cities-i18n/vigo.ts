import type { CityTr } from "../strike-11n-cities-model";

const DOG = "https://www.xunta.gal/diario-oficial-galicia";
const ORDE_PRESIDENCIA = "https://www.xunta.gal/dog/Publicados/2026/20261109/AnuncioG0759-051126-0001_gl.html";
const ORDE_SANIDADE = "https://www.xunta.gal/dog/Publicados/2026/20261110/AnuncioC3K1-061126-0002_gl.html";
const BUS_GAL_MS = "https://www.bus.gal/gl/descargas/servizos_minimos";
const UGT_CARTEL =
  "https://www.ugtgalicia.org/sites/www.ugtgalicia.org/files/Dise%C3%B1o%20sin%20t%C3%ADtulo%20%281%29.pdf";
const CIG_MOBILIZACIONS =
  "https://www.cig.gal/nova/a-cig-convoca-17-mobilizacions-para-a-folga-xeral-do-11-de-novembro.html";
const CIG_CONVOCATORIA =
  "https://www.cig.gal/nova/a-cig-rexistra-a-convocatoria-de-folga-xeral-en-galiza-para-o-11-de-novembro-para-frear-a-deterioracion-das-condicions-de-vida.html";
const AIR_RESOLUCION =
  "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf";
const CALENDARIO = "https://www.xunta.gal/dog/Publicados/2026/20260615/AnuncioG0761-050626-0001_gl.pdf";
const FESTAS = "https://www.xunta.gal/dog/Publicados/2025/20251030/AnuncioG0767-221025-0001_gl.pdf";
const TSXG =
  "https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Tribunales-Superiores-de-Justicia/TSJ-Galicia/Oficina-de-Comunicacion/Archivo-de-notas-de-prensa/Un-Juzgado-de-Vigo-considera-contrarios-al-ordenamiento-juridico-los-servicios-minimos-de-Vitrasa-decretados-por-el-Ayuntamiento-en-noviembre-de-2021";

/** Vigo, in Catalan and English (10 Nov 2026): the Spanish facts of strike-11n-cities-data.ts, same links and figures. */
export const ca: CityTr = {
  titleTransport: "Vitrasa",
  transportShort: "Vitrasa i autobusos interurbans",
  authority: `la Xunta de Galícia, en dues ordres publicades al [DOG](${DOG}) el 9 i el 10 de novembre, excepte els de Vitrasa, que fixa l'Ajuntament de Vigo per decret de l'Alcaldia`,
  authorityShort: "la Xunta de Galícia (DOG) i, per a Vitrasa, l'Ajuntament de Vigo",
  bulletin: "el DOG",
  cercanias: null,
  airport: "Vigo",
  airNotes: [
    `A l'aeroport de Vigo, el 80% dels vols amb les Illes Balears, les Canàries, Ceuta i Melilla i de les rutes amb obligació de servei públic; el 57% dels internacionals i dels peninsulars l'alternativa en transport públic dels quals triga 5 hores o més, i el 32% dels peninsulars amb una alternativa de menys de 5 hores, per a cada ruta i companyia, segons la [resolució del Ministeri de Transports](${AIR_RESOLUCION}).`,
    "Si el vol uneix dos aeroports espanyols amb percentatges diferents, s'aplica el més alt, i el resultat s'arrodoneix a l'alça.",
  ],
  msSummary: `autobusos interurbans, amb els serveis mínims que la Xunta publica a [bus.gal](${BUS_GAL_MS}); als hospitals, el 100% de les urgències, i als centres de salut, només l'atenció urgent; les escoles obren, amb un membre de l'equip directiu i un subaltern, segons les [ordres de la Xunta](${ORDE_PRESIDENCIA}) publicades al DOG el 9 i el 10 de novembre`,
  msNotes: [
    `**Publicats el 9 i el 10 de novembre.** L'[Ordre del 6 de novembre de 2026](${ORDE_PRESIDENCIA}) de la Conselleria de Presidència, Justícia i Esports (DOG núm. 214, del 9 de novembre) fixa els del personal de la Xunta, les escoles i els autobusos interurbans, entre d'altres, i l'[ordre de la Conselleria de Sanitat](${ORDE_SANIDADE}) (DOG núm. 215, del 10 de novembre), els de la sanitat. Cap de les dues no cobreix l'autobús urbà.`,
  ],
  railNotes: [],
  school: `**Sí, és dia lectiu.** El calendari escolar 2026-2027 de Galícia ([Ordre del 4 de juny de 2026](${CALENDARIO})) fixa les classes del 9 de setembre de 2026 al 21 de juny de 2027 i no inclou l'11 de novembre entre els dies no lectius; les festes locals de Vigo el 2026 són el 28 de març i el 17 d'agost ([DOG del 30 d'octubre de 2025](${FESTAS})).`,
  schoolShort: "Sí, és dia lectiu",
  demos: [
    `**Al matí, CCOO i UGT:** manifestació conjunta a les 11.30 h, amb sortida de Vía Norte a la cruïlla amb la rúa Urzaiz, fins a la Praza da Estrela, segons el [cartell de mobilitzacions d'UGT Galicia](${UGT_CARTEL}).`,
    `**CIG:** a les 12.00 h al «Cruzamento da Drobada», segons la [CIG](${CIG_MOBILIZACIONS}).`,
    `**A la tarda:** «Manifestación Unitaria de Sindicatos e Colectivos Sociais» a les 18.00 h, de la Praza de España a la Praza de Compostela, segons el [mateix cartell d'UGT Galicia](${UGT_CARTEL}).`,
  ],
  demoShort:
    "CCOO i UGT, a les 11.30 h, de Vía Norte (cruïlla amb Urzaiz) a la Praza da Estrela; CIG, a les 12.00 h, Cruzamento da Drobada; a la tarda, a les 18.00 h, de la Praza de España a la Praza de Compostela",
  demoWhere: `Segueix [UGT Galicia](${UGT_CARTEL}) i la [CIG](${CIG_MOBILIZACIONS}).`,
  callNotes: [
    `**A Galícia, la CIG convoca la seva pròpia vaga general** el mateix dia: «La CIG ha registrat aquest matí la convocatòria de vaga general a tota Galícia per a l'11 de novembre vinent» ([CIG](${CIG_CONVOCATORIA})).`,
  ],
  services: {
    vitrasa: {
      name: "Vitrasa (autobús urbà)",
      setBy: "Ajuntament de Vigo",
      pending: `Els fixa l'Ajuntament de Vigo per decret de l'Alcaldia, com en la vaga de Vitrasa de novembre de 2021, segons el [Tribunal Superior de Justícia de Galícia](${TSXG}); el 10 de novembre no havíem trobat cap decret per a l'11N.`,
      where: "Els [avisos de Vitrasa](https://www.vitrasa.es/avisos)",
      text: null,
      question: "Hi ha Vitrasa l'11 de novembre?",
    },
    interurbanos: {
      name: "Autobusos interurbans de la Xunta",
      setBy: "Xunta de Galícia",
      pending: `Els fixa la Xunta de Galícia (Conselleria de Presidència) per ordre, que es publica al [DOG](${DOG}).`,
      where: "Els [avisos de bus.gal](https://www.bus.gal/gl/avisos)",
      text: `Els que la Xunta publica, línia per línia, a [bus.gal](${BUS_GAL_MS}); el transport escolar, a l'entrada de 7.30 a 10.30 h i a la sortida de 13.30 a 19.00 h, en els itineraris d'ensenyament obligatori de més de 4 km, segons [l'ordre de la Xunta del 6 de novembre](${ORDE_PRESIDENCIA}).`,
    },
    salud: {
      name: "Hospitals i centres de salut (Sergas)",
      setBy: "Xunta de Galícia (Sanitat)",
      pending: `Els fixa la Xunta de Galícia (Conselleria de Sanitat) per ordre, que es publica al [DOG](${DOG}).`,
      where: `Per a la teva cita, el teu hospital o centre de salut; l'ordre, al [DOG](${DOG})`,
      text: `El 100% de les urgències, el 061 i els punts d'atenció continuada (PAC), i de l'UCI, la diàlisi, els tractaments oncològics i els trasplantaments; a les consultes, només els casos urgents i preferents; als centres de salut, només l'atenció urgent o que no es pugui ajornar, amb entre un i quatre metges segons la mida del centre i un pediatre, segons l'[ordre de la Conselleria de Sanitat del 6 de novembre](${ORDE_SANIDADE}).`,
    },
    colegios: {
      name: "Escoles i instituts públics",
      setBy: "Xunta de Galícia",
      pending: `Els fixa la Xunta de Galícia (Conselleria de Presidència) per ordre, que es publica al [DOG](${DOG}).`,
      where: `L'escola informa les famílies; l'ordre, al [DOG](${DOG})`,
      text: `Els centres obren en el seu horari habitual, amb el director o un membre de l'equip directiu i un subaltern, i una persona de cuina on el menjador és de gestió directa; els mateixos, als centres privats i concertats, segons [l'ordre de la Xunta del 6 de novembre](${ORDE_PRESIDENCIA}).`,
    },
    administracion: {
      name: "Administració de la Xunta",
      setBy: "Xunta de Galícia",
      pending: `Els fixa la Xunta de Galícia (Conselleria de Presidència) per ordre, que es publica al [DOG](${DOG}).`,
      where: `L'ordre, al [DOG](${DOG})`,
      text: `A Vigo, un funcionari a l'Oficina de Registre i Informació al matí i un altre a la tarda, segons [l'ordre de la Xunta del 6 de novembre](${ORDE_PRESIDENCIA}).`,
    },
  },
};

export const en: CityTr = {
  titleTransport: "Vitrasa",
  transportShort: "Vitrasa and intercity buses",
  authority: `the Xunta de Galicia, in two orders published in the [DOG](${DOG}) on 9 and 10 November, except for Vitrasa's, which Vigo City Council sets by mayoral decree`,
  authorityShort: "the Xunta de Galicia (DOG) and, for Vitrasa, Vigo City Council",
  bulletin: "the DOG",
  cercanias: null,
  airport: "Vigo",
  airNotes: [
    `At Vigo airport, 80% of flights to and from the Balearic Islands, the Canary Islands, Ceuta and Melilla and on public service obligation routes; 57% of international flights and of mainland flights whose public transport alternative takes 5 hours or more, and 32% of mainland flights with an alternative of less than 5 hours, for each route and airline, according to the [Ministry of Transport resolution](${AIR_RESOLUCION}).`,
    "If the flight links two Spanish airports with different percentages, the higher one applies, and the result is rounded up.",
  ],
  msSummary: `intercity buses, with the minimum services the Xunta publishes on [bus.gal](${BUS_GAL_MS}); in hospitals, 100% of emergency care, and in health centres, urgent care only; schools open, with one member of the management team and one caretaker, according to the [Xunta's orders](${ORDE_PRESIDENCIA}) published in the DOG on 9 and 10 November`,
  msNotes: [
    `**Published on 9 and 10 November.** The [Order of 6 November 2026](${ORDE_PRESIDENCIA}) of the Department of the Presidency, Justice and Sport (DOG no. 214, of 9 November) sets those for Xunta staff, schools and intercity buses, among others, and the [Department of Health's order](${ORDE_SANIDADE}) (DOG no. 215, of 10 November) those for healthcare. Neither covers city buses.`,
  ],
  railNotes: [],
  school: `**Yes, it is a school day.** Galicia's 2026-2027 school calendar ([Order of 4 June 2026](${CALENDARIO})) sets classes from 9 September 2026 to 21 June 2027 and does not list 11 November among the non-school days; Vigo's local holidays in 2026 are 28 March and 17 August ([DOG of 30 October 2025](${FESTAS})).`,
  schoolShort: "Yes, it is a school day",
  demos: [
    `**In the morning, CCOO and UGT:** a joint march at 11.30, setting off from Vía Norte at its junction with Rúa Urzaiz, to Praza da Estrela, according to [UGT Galicia's protest poster](${UGT_CARTEL}).`,
    `**CIG:** at 12.00 at “Cruzamento da Drobada”, according to the [CIG](${CIG_MOBILIZACIONS}).`,
    `**In the afternoon:** “Manifestación Unitaria de Sindicatos e Colectivos Sociais” at 18.00, from Praza de España to Praza de Compostela, according to the [same UGT Galicia poster](${UGT_CARTEL}).`,
  ],
  demoShort:
    "CCOO and UGT, at 11.30, from Vía Norte (junction with Urzaiz) to Praza da Estrela; CIG, at 12.00, Cruzamento da Drobada; in the afternoon, at 18.00, from Praza de España to Praza de Compostela",
  demoWhere: `Keep an eye on [UGT Galicia](${UGT_CARTEL}) and the [CIG](${CIG_MOBILIZACIONS}).`,
  callNotes: [
    `**In Galicia, the CIG is calling its own general strike** on the same day: “This morning the CIG registered the call for a general strike throughout Galicia for the coming 11 November” ([CIG](${CIG_CONVOCATORIA})).`,
  ],
  services: {
    vitrasa: {
      name: "Vitrasa (city buses)",
      setBy: "Vigo City Council",
      pending: `Vigo City Council sets them by mayoral decree, as in the Vitrasa strike of November 2021, according to the [High Court of Justice of Galicia](${TSXG}); as of 10 November we had not found any decree for 11N.`,
      where: "[Vitrasa's notices](https://www.vitrasa.es/avisos)",
      text: null,
      question: "Is Vitrasa running on 11 November?",
    },
    interurbanos: {
      name: "Xunta intercity buses",
      setBy: "Xunta de Galicia",
      pending: `The Xunta de Galicia (Department of the Presidency) sets them by order, published in the [DOG](${DOG}).`,
      where: "[bus.gal notices](https://www.bus.gal/gl/avisos)",
      text: `Those the Xunta publishes, line by line, on [bus.gal](${BUS_GAL_MS}); school transport, for arrival from 7.30 to 10.30 and for departure from 13.30 to 19.00, on compulsory-education routes of more than 4 km, according to [the Xunta's order of 6 November](${ORDE_PRESIDENCIA}).`,
    },
    salud: {
      name: "Hospitals and health centres (Sergas)",
      setBy: "Xunta de Galicia (Health)",
      pending: `The Xunta de Galicia (Department of Health) sets them by order, published in the [DOG](${DOG}).`,
      where: `For your appointment, your hospital or health centre; the order, in the [DOG](${DOG})`,
      text: `100% of emergency care, the 061 service and the continuous care points (PAC), and of the ICU, dialysis, cancer treatment and transplants; in outpatient clinics, only urgent and priority cases; in health centres, only urgent care or care that cannot be postponed, with between one and four doctors depending on the size of the centre and one paediatrician, according to the [Department of Health's order of 6 November](${ORDE_SANIDADE}).`,
    },
    colegios: {
      name: "State primary and secondary schools",
      setBy: "Xunta de Galicia",
      pending: `The Xunta de Galicia (Department of the Presidency) sets them by order, published in the [DOG](${DOG}).`,
      where: `The school informs families; the order, in the [DOG](${DOG})`,
      text: `Schools open at their usual hours, with the head teacher or a member of the management team and one caretaker, and one kitchen worker where the canteen is run directly; the same in private and grant-aided schools, according to [the Xunta's order of 6 November](${ORDE_PRESIDENCIA}).`,
    },
    administracion: {
      name: "Xunta administration",
      setBy: "Xunta de Galicia",
      pending: `The Xunta de Galicia (Department of the Presidency) sets them by order, published in the [DOG](${DOG}).`,
      where: `The order, in the [DOG](${DOG})`,
      text: `In Vigo, one civil servant at the Registry and Information Office in the morning and another in the afternoon, according to [the Xunta's order of 6 November](${ORDE_PRESIDENCIA}).`,
    },
  },
};
