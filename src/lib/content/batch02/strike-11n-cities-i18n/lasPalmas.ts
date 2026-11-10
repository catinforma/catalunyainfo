import type { CityTr } from "../strike-11n-cities-model";

const BOC = "https://www.gobiernodecanarias.org/boc/";
const BOC224 = "https://www.gobiernodecanarias.org/boc/2026/224/";
const GUAGUAS = "https://www.guaguas.com/huelga";
const MIN_TR = "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf";
const HUELGA_2024 =
  "https://www.laspalmasgc.es/es/ayuntamiento/prensa-y-comunicacion/notas-de-prensa/nota-de-prensa/Guaguas-Municipales-despliega-este-jueves-28-y-viernes-29-los-servicios-minimos-decretados-para-la-huelga-nacional-de-transportes/";
const CCOO = "https://canarias.ccoo.es/";

/** Las Palmas de Gran Canaria, in Catalan and English (10 Nov 2026): the Spanish facts of strike-11n-cities-data.ts, same links and figures. */
export const ca: CityTr = {
  titleTransport: "guagues",
  transportShort: "guagues urbanes i interurbanes",
  authority: `el Govern de Canàries, en ordres publicades al [BOC](${BOC}) del 10 de novembre, excepte els de les guagues, que fixa l'Autoridad Única del Transporte de Gran Canaria`,
  authorityShort: "el Govern de Canàries (BOC) i, per a les guagues, l'Autoridad Única del Transporte de Gran Canaria",
  bulletin: "el BOC",
  cercanias: null,
  airport: "Gran Canària",
  airNotes: [
    `A l'aeroport de Gran Canària, el 72% dels vols nacionals i el 56% dels internacionals, per a cada ruta i companyia, segons la [resolució del Ministeri de Transports](${MIN_TR}).`,
    "Si el vol uneix dos aeroports espanyols amb percentatges diferents, s'aplica el més alt, i el resultat s'arrodoneix a l'alça.",
  ],
  msSummary: `Guaguas Municipales, amb el servei d'un dia festiu i totes les línies actives; als hospitals, els serveis d'un diumenge o festiu, i el transport escolar, al 100%, segons [Guaguas Municipales](${GUAGUAS}) i les ordres del Govern de Canàries publicades al [BOC del 10 de novembre](${BOC224})`,
  msNotes: [
    `**Publicats el 10 de novembre.** El [BOC núm. 224](${BOC224}) recull les ordres del Govern de Canàries per a l'11N, una per conselleria: entre elles, les del Servicio Canario de la Salud, el personal dels centres educatius i el transport escolar.`,
    `**Guagues:** l'Autoridad Única del Transporte de Gran Canaria ha decretat per a les guagues municipals el servei d'un dia festiu, segons [Guaguas Municipales](${GUAGUAS}). De les guagues interurbanes de Global no n'havíem trobat res publicat el 10 de novembre.`,
  ],
  railNotes: [],
  school: "**No és festiu, i és dia lectiu tret que la teva escola l'hagi triat com a dia de lliure disposició.** El [calendari escolar 2026-2027 de Canàries](https://www.gobiernodecanarias.org/boc/2026/061/1025.html) només té al novembre el festiu del dia 2, però els consells escolars de cada centre podien fixar «fins a un màxim de quatre dies no lectius»: confirma-ho amb l'escola.",
  schoolShort: "No és festiu; confirma amb l'escola els seus dies de lliure disposició",
  demos: [],
  demoShort: null,
  demoWhere: `Atents a la web de [CCOO Canarias](${CCOO}): tan bon punt els convocants publiquin l'hora i el lloc, els posarem aquí.`,
  callNotes: [],
  services: {
    guaguas: {
      name: "Guaguas Municipales",
      setBy: "Autoridad Única del Transporte de Gran Canaria",
      pending: `Els fixa l'Autoridad Única del Transporte de Gran Canaria per resolució, com en la [vaga del transport de novembre de 2024](${HUELGA_2024}).`,
      where: `L'horari de cada línia, a la [pàgina de serveis mínims de Guaguas Municipales](${GUAGUAS})`,
      text: `El servei d'un dia festiu: continuen actives totes les línies habituals, també les tres nocturnes, per resolució de l'Autoridad Única del Transporte de Gran Canaria, segons [Guaguas Municipales](${GUAGUAS}), que publica l'horari de cada línia.`,
      question: "Hi ha guagues a Las Palmas de Gran Canària l'11 de novembre?",
    },
    global: {
      name: "Guagues interurbanes (Global)",
      setBy: "Autoridad Única del Transporte de Gran Canaria",
      pending: `Els fixa l'Autoridad Única del Transporte de Gran Canaria per resolució, com en la [vaga del transport de novembre de 2024](${HUELGA_2024}).`,
      where: "La resolució, quan surti, l'anunciarà l'[Ajuntament](https://www.laspalmasgc.es/es/ayuntamiento/prensa-y-comunicacion/notas-de-prensa/) amb les de Guaguas Municipales",
      text: null,
    },
    salud: {
      name: "Hospitals i centres de salut (Servicio Canario de la Salud)",
      setBy: "Govern de Canàries",
      pending: `Els fixa el Govern de Canàries per ordre, que es publica al [BOC](${BOC}).`,
      where: `Per a la teva cita, el teu hospital o centre de salut; l'ordre, al [BOC](${BOC})`,
      text: "El 100% de l'assistència urgent; als hospitals, en general, els serveis d'un diumenge o festiu, i el 100% a oncologia, radioteràpia, diàlisi, hospital de dia i farmàcia hospitalària; als centres de salut, un professional de cada categoria, que atén sobretot les urgències, i les urgències extrahospitalàries, al 100%, segons l'[Ordre de 6 de novembre de 2026](https://www.gobiernodecanarias.org/boc/2026/224/3879.html).",
    },
    colegios: {
      name: "Escoles i instituts",
      setBy: "Govern de Canàries",
      pending: `Els fixa el Govern de Canàries per ordre, que es publica al [BOC](${BOC}).`,
      where: `L'escola informa les famílies; l'ordre, al [BOC](${BOC})`,
      text: "A les escoles d'infantil i primària, un càrrec directiu i un docent per cada 8 grups (un en les de fins a 8 grups); als instituts, un càrrec directiu i un docent per cada 10 grups, segons l'[ordre de la Conselleria d'Educació](https://www.gobiernodecanarias.org/boc/2026/224/3869.html); el transport escolar, al 100%, segons l'[ordre del transport escolar](https://www.gobiernodecanarias.org/boc/2026/224/3870.html).",
    },
    administracion: {
      name: "Administració del Govern de Canàries",
      setBy: "Govern de Canàries",
      pending: `Els fixa el Govern de Canàries per ordre, que es publica al [BOC](${BOC}).`,
      where: `Les ordres, al [BOC](${BOC})`,
      text: `Els de cada conselleria, en la seva pròpia ordre: són al [BOC núm. 224, del 10 de novembre](${BOC224}).`,
    },
  },
};

export const en: CityTr = {
  titleTransport: "bus",
  transportShort: "city and intercity buses (guaguas)",
  authority: `the Canary Islands government, in orders published in the [BOC](${BOC}) of 10 November, except those for buses, which are set by the Autoridad Única del Transporte de Gran Canaria`,
  authorityShort: "the Canary Islands government (BOC) and, for buses, the Autoridad Única del Transporte de Gran Canaria",
  bulletin: "the BOC",
  cercanias: null,
  airport: "Gran Canaria",
  airNotes: [
    `At Gran Canaria airport, 72% of domestic flights and 56% of international flights, for each route and airline, according to the [Ministry of Transport resolution](${MIN_TR}).`,
    "If the flight connects two Spanish airports with different percentages, the higher one applies, and the result is rounded up.",
  ],
  msSummary: `Guaguas Municipales, with a public holiday service and all routes running; in hospitals, Sunday or public holiday services; and school transport at 100%, according to [Guaguas Municipales](${GUAGUAS}) and the Canary Islands government's orders published in the [BOC of 10 November](${BOC224})`,
  msNotes: [
    `**Published on 10 November.** [BOC no. 224](${BOC224}) carries the Canary Islands government's orders for 11N, one per regional department: among them, those for the Servicio Canario de la Salud, school staff and school transport.`,
    `**Buses:** the Autoridad Única del Transporte de Gran Canaria has ordered a public holiday service for the city buses, according to [Guaguas Municipales](${GUAGUAS}). For Global's intercity buses, we had found nothing published as of 10 November.`,
  ],
  railNotes: [],
  school: "**It is not a public holiday, and it is a school day unless your school has chosen it as a discretionary day off.** The [Canary Islands 2026-2027 school calendar](https://www.gobiernodecanarias.org/boc/2026/061/1025.html) has only the holiday on the 2nd in November, but each school's governing council could set \"up to a maximum of four non-teaching days\": check with the school.",
  schoolShort: "Not a public holiday; check with the school for its discretionary days off",
  demos: [],
  demoShort: null,
  demoWhere: `Keep an eye on the [CCOO Canarias](${CCOO}) website: as soon as the organisers publish the time and place, we will post them here.`,
  callNotes: [],
  services: {
    guaguas: {
      name: "Guaguas Municipales",
      setBy: "Autoridad Única del Transporte de Gran Canaria",
      pending: `They are set by the Autoridad Única del Transporte de Gran Canaria by resolution, as in the [November 2024 transport strike](${HUELGA_2024}).`,
      where: `Each route's timetable, on the [Guaguas Municipales minimum services page](${GUAGUAS})`,
      text: `A public holiday service: all the usual routes keep running, including the three night routes, by resolution of the Autoridad Única del Transporte de Gran Canaria, according to [Guaguas Municipales](${GUAGUAS}), which publishes each route's timetable.`,
      question: "Are buses (guaguas) running in Las Palmas de Gran Canaria on 11 November?",
    },
    global: {
      name: "Intercity buses (Global)",
      setBy: "Autoridad Única del Transporte de Gran Canaria",
      pending: `They are set by the Autoridad Única del Transporte de Gran Canaria by resolution, as in the [November 2024 transport strike](${HUELGA_2024}).`,
      where: "When it comes out, the resolution will be announced by the [City Council](https://www.laspalmasgc.es/es/ayuntamiento/prensa-y-comunicacion/notas-de-prensa/) together with those for Guaguas Municipales",
      text: null,
    },
    salud: {
      name: "Hospitals and health centres (Servicio Canario de la Salud)",
      setBy: "Canary Islands government",
      pending: `They are set by the Canary Islands government by order, published in the [BOC](${BOC}).`,
      where: `For your appointment, your hospital or health centre; the order, in the [BOC](${BOC})`,
      text: "100% of emergency care; in hospitals, in general, Sunday or public holiday services, and 100% in oncology, radiotherapy, dialysis, day hospital and hospital pharmacy; in health centres, one professional of each category, mainly handling emergencies; and out-of-hospital emergency services at 100%, according to the [Order of 6 November 2026](https://www.gobiernodecanarias.org/boc/2026/224/3879.html).",
    },
    colegios: {
      name: "Primary and secondary schools",
      setBy: "Canary Islands government",
      pending: `They are set by the Canary Islands government by order, published in the [BOC](${BOC}).`,
      where: `The school informs families; the order, in the [BOC](${BOC})`,
      text: "In infant and primary schools, one member of the management team and one teacher for every 8 groups (one in schools with up to 8 groups); in secondary schools, one member of the management team and one teacher for every 10 groups, according to the [Department of Education order](https://www.gobiernodecanarias.org/boc/2026/224/3869.html); school transport at 100%, according to the [school transport order](https://www.gobiernodecanarias.org/boc/2026/224/3870.html).",
    },
    administracion: {
      name: "Canary Islands government administration",
      setBy: "Canary Islands government",
      pending: `They are set by the Canary Islands government by order, published in the [BOC](${BOC}).`,
      where: `The orders, in the [BOC](${BOC})`,
      text: `Each regional department's, in its own order: they are in [BOC no. 224 of 10 November](${BOC224}).`,
    },
  },
};
