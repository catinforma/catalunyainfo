import type { CityTr } from "../strike-11n-cities-model";

const BOA = "https://www.boa.aragon.es/";
const BOA_OBJ = "https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=";
const ECE = `${BOA_OBJ}1474145980606&type=pdf`;
const ECU = `${BOA_OBJ}1474153060606&type=pdf`;
const SAN = `${BOA_OBJ}1474149020606&type=pdf`;
const HAP = `${BOA_OBJ}1474131840505&type=pdf`;
const CALENDARIO = `${BOA_OBJ}1392479120808`;
const FIESTAS = `${BOA_OBJ}1421874360606`;
const TRANVIA_MS =
  "https://www.tranviasdezaragoza.es/servicios-minimos-del-tranvia-de-zaragoza-para-la-huelga-general-del-11-de-noviembre/";
const PAROS = "https://www.tranviasdezaragoza.es/informacion-de-servicio-paros-parciales-y-servicios-minimos/";
const MITMA = "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf";
const HUELGA_2021 = "https://www.zaragoza.es/sede/servicio/noticia/301261";
const NOTICIAS_AYTO = "https://www.zaragoza.es/sede/servicio/noticia/";

const caPendingAyto = `Els fixa l'Ajuntament de Saragossa per decret: així ho va fer en la [vaga general del 8 de març de 2021](${HUELGA_2021}), i ho va anunciar a les seves [notícies](${NOTICIAS_AYTO}).`;
const enPendingAyto = `Zaragoza City Council sets them by decree: it did so in the [general strike of 8 March 2021](${HUELGA_2021}), and announced it in its [news](${NOTICIAS_AYTO}).`;

/** Zaragoza, in Catalan and English (10 Nov 2026): the Spanish facts of strike-11n-cities-data.ts, same links and figures. */
export const ca: CityTr = {
  titleTransport: `tramvia i bus`,
  transportShort: `tramvia i autobusos urbans i metropolitans`,
  authority: `el Govern d'Aragó, en ordres publicades al [BOA](${BOA}) del 10 de novembre, excepte els de l'autobús urbà i el tramvia, que fixa l'Ajuntament de Saragossa per decret`,
  authorityShort: `el Govern d'Aragó (BOA) i, per al bus urbà i el tramvia, l'Ajuntament`,
  bulletin: `el BOA`,
  cercanias: `Cercanías Zaragoza`,
  airport: `Saragossa`,
  airNotes: [
    `A l'aeroport de Saragossa, el 75% dels vols amb les Illes Balears, les Canàries, Ceuta i Melilla i de les rutes amb obligació de servei públic; el 58% dels internacionals i dels peninsulars amb una alternativa en transport públic de 5 hores o més, i el 32% dels peninsulars amb una alternativa de menys de 5 hores, per a cada ruta i companyia, segons la [resolució del Ministeri de Transports](${MITMA}).`,
    `Si el vol uneix dos aeroports espanyols amb percentatges diferents, s'aplica el més alt, i el resultat s'arrodoneix a l'alça.`,
  ],
  msSummary: `tramvia, entre el 50% i el 80% del servei segons l'hora; a les escoles públiques, una persona de l'equip directiu i el 25% del professorat, i el transport escolar, al 100%, segons [Tranvías de Zaragoza](${TRANVIA_MS}) i les ordres del Govern d'Aragó publicades al [BOA](${BOA}) del 10 de novembre`,
  msNotes: [
    `**Publicats el 10 de novembre.** El BOA núm. 217 inclou les ordres del Govern d'Aragó per a l'11N: l'[ECE/1627/2026](${ECE}) (empreses privades, amb els autobusos interurbans i el transport escolar), l'[ECU/1631/2026](${ECU}) (escoles públiques), la [SAN/1629/2026](${SAN}) (centres del Servicio Aragonés de Salud) i l'[HAP/1621/2026](${HAP}) (administració).`,
    `**Tramvia i autobús urbà:** els del tramvia els ha decretat l'Ajuntament de Saragossa, segons [Tranvías de Zaragoza](${TRANVIA_MS}); els de l'autobús urbà no els havíem trobat publicats el 10 de novembre.`,
  ],
  railNotes: [],
  school: `**Sí, és dia lectiu.** El calendari escolar d'Aragó per al 2026-2027 ([Resolució de 29 d'abril de 2025](${CALENDARIO})) fixa l'inici de les classes el dimarts 8 de setembre de 2026 i el final el 18 de juny de 2027, i l'11 de novembre no és dia no lectiu. Les festes locals de Saragossa el 2026 són el 29 de gener i el 5 de març ([BOA del 20 de novembre de 2025](${FIESTAS})).`,
  schoolShort: `Sí, és dia lectiu`,
  demos: [],
  demoShort: null,
  demoWhere: `Estigueu atents a les webs de [CCOO Aragón](https://aragon.ccoo.es/) i [UGT Aragón](https://ugtaragon.es/): tan bon punt publiquin l'hora i el lloc, els posarem aquí.`,
  callNotes: [],
  services: {
    bus: {
      name: `Autobús urbà (Avanza Zaragoza)`,
      setBy: `Ajuntament de Saragossa`,
      pending: caPendingAyto,
      where: `Les [alteracions del servei d'Avanza](https://zaragoza.avanzagrupo.com/alteraciones-del-servicio/)`,
      text: null,
      question: `Hi ha autobusos a Saragossa l'11 de novembre?`,
    },
    tranvia: {
      name: `Tramvia de Saragossa`,
      setBy: `Ajuntament de Saragossa`,
      pending: caPendingAyto,
      where: `Les [notícies de Tranvías de Zaragoza](https://www.tranviasdezaragoza.es/noticias/)`,
      text: `A la línia 1, el 60% del servei de 5.00 a 7.20 h; el 80% de 7.20 a 9.30 h; el 70% de 9.30 a 13.40 h; el 80% de 13.40 a 15.15 h; el 70% de 15.15 a 22.00 h, i el 50% de 22.00 a 0.00 h: són els que ha decretat l'Ajuntament de Saragossa, segons [Tranvías de Zaragoza](${TRANVIA_MS}).`,
      question: `Hi ha tramvia a Saragossa l'11 de novembre?`,
      notes: [
        `**Compte: el tramvia té, a més, aturades parcials pròpies.** Al seu [calendari d'aturades parcials de la línia 1](${PAROS}), Tranvías de Zaragoza anuncia per a l'11 de novembre una aturada de 13.00 a 15.00 h amb serveis mínims del 90%. És un calendari d'aturades del mateix tramvia que va començar el 19 d'octubre, no els serveis mínims de la vaga general.`,
      ],
    },
    ctaz: {
      name: `Autobusos interurbans i metropolitans (línies del Govern d'Aragó)`,
      setBy: `Govern d'Aragó`,
      pending: `Els fixa el Govern d'Aragó (ocupació) per ordre, que es publica al [BOA](${BOA}).`,
      where: `Les [notícies del Consorcio de Transportes del Área de Zaragoza](https://www.ctaz.es/noticias-ctaz/)`,
      text: `A les línies regulars del Govern d'Aragó, una expedició completa (anada i tornada) a les rutes que en tenen fins a 3; 2 a les que en tenen de 4 a 6, i el 40% de les expedicions a les que en tenen 7 o més, segons l'[Ordre ECE/1627/2026](${ECE}).`,
    },
    salud: {
      name: `Hospitals i centres de salut (Salud)`,
      setBy: `Govern d'Aragó (Sanitat)`,
      pending: `Els fixa el Govern d'Aragó (Departament de Sanitat) per ordre, que es publica al [BOA](${BOA}).`,
      where: `Per a la teva cita, el teu hospital o centre de salut; l'ordre, al [BOA](${BOA})`,
      text: `El personal que fixa, centre per centre, l'annex de l'[Ordre SAN/1629/2026](${SAN}), per garantir «l'atenció urgent i no demorable»; l'ordre no dona un percentatge general.`,
    },
    colegios: {
      name: `Escoles i instituts públics`,
      setBy: `Govern d'Aragó (Educació)`,
      pending: `Els fixa el Govern d'Aragó (Departament d'Educació) per ordre, que es publica al [BOA](${BOA}).`,
      where: `L'escola informa les famílies; l'ordre, al [BOA](${BOA})`,
      text: `A cada centre, una persona de l'equip directiu i el 25% del personal docent, i una persona de cuina on hi ha menjador, segons l'[Ordre ECU/1631/2026](${ECU}); el transport escolar, al 100% a les rutes d'entrada entre les 7.00 i les 10.00 h i a les de sortida de 13.30 a 19.00 h, segons l'[Ordre ECE/1627/2026](${ECE}).`,
    },
    administracion: {
      name: `Administració del Govern d'Aragó`,
      setBy: `Govern d'Aragó`,
      pending: `Els fixa el Govern d'Aragó (cada departament) per ordre, que es publica al [BOA](${BOA}).`,
      where: `Les ordres, al [BOA](${BOA})`,
      text: `El personal que fixa, departament per departament, l'[Ordre HAP/1621/2026](${HAP}), amb una persona als registres.`,
    },
  },
};

export const en: CityTr = {
  titleTransport: `tram and bus`,
  transportShort: `tram and city and metropolitan buses`,
  authority: `the Government of Aragon, in orders published in the [BOA](${BOA}) on 10 November, except for city buses and the tram, which Zaragoza City Council sets by decree`,
  authorityShort: `the Government of Aragon (BOA) and, for city buses and the tram, the City Council`,
  bulletin: `the BOA`,
  cercanias: `Cercanías Zaragoza`,
  airport: `Zaragoza`,
  airNotes: [
    `At Zaragoza airport, 75% of flights to and from the Balearic Islands, the Canary Islands, Ceuta and Melilla and of routes under a public service obligation; 58% of international flights and of mainland flights whose public transport alternative takes 5 hours or more, and 32% of mainland flights with an alternative of under 5 hours, for each route and airline, according to the [Ministry of Transport resolution](${MITMA}).`,
    `If the flight links two Spanish airports with different percentages, the higher one applies, and the result is rounded up.`,
  ],
  msSummary: `tram, between 50% and 80% of service depending on the time of day; in state schools, one member of the management team and 25% of teaching staff, and school transport at 100%, according to [Tranvías de Zaragoza](${TRANVIA_MS}) and the Government of Aragon orders published in the [BOA](${BOA}) on 10 November`,
  msNotes: [
    `**Published on 10 November.** BOA no. 217 carries the Government of Aragon's orders for 11N: [ECE/1627/2026](${ECE}) (private companies, including interurban buses and school transport), [ECU/1631/2026](${ECU}) (state schools), [SAN/1629/2026](${SAN}) (Servicio Aragonés de Salud centres) and [HAP/1621/2026](${HAP}) (administration).`,
    `**Tram and city bus:** the tram's have been decreed by Zaragoza City Council, according to [Tranvías de Zaragoza](${TRANVIA_MS}); we had not found the city bus ones published as of 10 November.`,
  ],
  railNotes: [],
  school: `**Yes, it is a school day.** Aragon's 2026-2027 school calendar ([Resolution of 29 April 2025](${CALENDARIO})) sets the start of classes on Tuesday 8 September 2026 and the end on 18 June 2027, and 11 November is not a non-school day. Zaragoza's local holidays in 2026 are 29 January and 5 March ([BOA of 20 November 2025](${FIESTAS})).`,
  schoolShort: `Yes, it is a school day`,
  demos: [],
  demoShort: null,
  demoWhere: `Keep an eye on the [CCOO Aragón](https://aragon.ccoo.es/) and [UGT Aragón](https://ugtaragon.es/) websites: as soon as they publish the time and place, we will post them here.`,
  callNotes: [],
  services: {
    bus: {
      name: `City bus (Avanza Zaragoza)`,
      setBy: `Zaragoza City Council`,
      pending: enPendingAyto,
      where: `[Avanza service changes](https://zaragoza.avanzagrupo.com/alteraciones-del-servicio/)`,
      text: null,
      question: `Are buses running in Zaragoza on 11 November?`,
    },
    tranvia: {
      name: `Zaragoza tram`,
      setBy: `Zaragoza City Council`,
      pending: enPendingAyto,
      where: `[Tranvías de Zaragoza news](https://www.tranviasdezaragoza.es/noticias/)`,
      text: `On line 1, 60% of service from 5.00 to 7.20; 80% from 7.20 to 9.30; 70% from 9.30 to 13.40; 80% from 13.40 to 15.15; 70% from 15.15 to 22.00, and 50% from 22.00 to 0.00: these are the ones decreed by Zaragoza City Council, according to [Tranvías de Zaragoza](${TRANVIA_MS}).`,
      question: `Is the Zaragoza tram running on 11 November?`,
      notes: [
        `**Note: the tram also has its own partial stoppages.** In its [calendar of partial stoppages on line 1](${PAROS}), Tranvías de Zaragoza announces a stoppage from 13.00 to 15.00 on 11 November with 90% minimum services. It is the tram's own stoppage calendar, which began on 19 October, not the general strike's minimum services.`,
      ],
    },
    ctaz: {
      name: `Interurban and metropolitan buses (Government of Aragon lines)`,
      setBy: `Government of Aragon`,
      pending: `They are set by the Government of Aragon (employment) by order, published in the [BOA](${BOA}).`,
      where: `[News from the Consorcio de Transportes del Área de Zaragoza](https://www.ctaz.es/noticias-ctaz/)`,
      text: `On the Government of Aragon's regular lines, one full journey (outward and return) on routes that have up to 3; 2 on those with 4 to 6, and 40% of journeys on those with 7 or more, according to [Order ECE/1627/2026](${ECE}).`,
    },
    salud: {
      name: `Hospitals and health centres (Salud)`,
      setBy: `Government of Aragon (Health)`,
      pending: `They are set by the Government of Aragon (Department of Health) by order, published in the [BOA](${BOA}).`,
      where: `For your appointment, your hospital or health centre; the order, in the [BOA](${BOA})`,
      text: `The staff set out, centre by centre, in the annex to [Order SAN/1629/2026](${SAN}), to guarantee "urgent care that cannot be postponed"; the order gives no overall percentage.`,
    },
    colegios: {
      name: `State schools`,
      setBy: `Government of Aragon (Education)`,
      pending: `They are set by the Government of Aragon (Department of Education) by order, published in the [BOA](${BOA}).`,
      where: `The school informs families; the order, in the [BOA](${BOA})`,
      text: `In each school, one member of the management team and 25% of teaching staff, and one kitchen worker where there is a canteen, according to [Order ECU/1631/2026](${ECU}); school transport at 100% on routes to school between 7.00 and 10.00 and on routes home from 13.30 to 19.00, according to [Order ECE/1627/2026](${ECE}).`,
    },
    administracion: {
      name: `Government of Aragon administration`,
      setBy: `Government of Aragon`,
      pending: `They are set by the Government of Aragon (each department) by order, published in the [BOA](${BOA}).`,
      where: `The orders, in the [BOA](${BOA})`,
      text: `The staff set, department by department, by [Order HAP/1621/2026](${HAP}), with one person in the registry offices.`,
    },
  },
};
