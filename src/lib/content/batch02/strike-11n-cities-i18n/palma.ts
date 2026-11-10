import type { CityTr } from "../strike-11n-cities-model";

const BOIB = "https://www.caib.es/eboibfront/es";
const ACORD = "https://www.caib.es/eboibfront/es/2026/12356/721966/acuerdo-del-consejo-de-gobierno-de-6-de-noviembre-";
const RES_EMT = "https://www.caib.es/eboibfront/es/2026/12360/722067/determinacion-de-los-servicios-minimos-para-la-con";
const MIN_TR = "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf";
const UGT = "https://www.ugtbalears.com/";

/** Palma, in Catalan and English (10 Nov 2026): the Spanish facts of strike-11n-cities-data.ts, same links and figures. */
export const ca: CityTr = {
  titleTransport: "EMT, metro i tren",
  transportShort: "EMT, metro, tren i autobusos TIB",
  authority: `el Govern de les Illes Balears, en un acord del Consell de Govern publicat al [BOIB](${BOIB}), excepte els de l'EMT, que fixa l'Ajuntament de Palma`,
  authorityShort: "el Govern balear (BOIB) i, per a l'EMT, l'Ajuntament de Palma",
  bulletin: "el BOIB",
  cercanias: null,
  airport: "Palma de Mallorca",
  airNotes: [
    `A l'aeroport de Palma de Mallorca, el 75% dels vols nacionals i el 53% dels internacionals, per a cada ruta i companyia, segons la [resolució del Ministeri de Transports](${MIN_TR}).`,
    "Si el vol uneix dos aeroports espanyols amb percentatges diferents, s'aplica el més alt, i el resultat s'arrodoneix a l'alça.",
  ],
  msSummary: `EMT, al 30% a la majoria de línies, al 40% en sis i al 100% a les de l'Hospital Son Llàtzer; metro i tren, al 80%, amb menys servei de 10.00 a 12.00 i de 17.00 a 19.00 h; autobusos TIB, com un diumenge o festiu, segons [l'acord del Govern balear del 6 de novembre](${ACORD}) i la [resolució de l'Ajuntament de Palma](${RES_EMT})`,
  msNotes: [
    `**Publicats el 7 i el 10 de novembre.** L'[Acord del Consell de Govern de 6 de novembre de 2026](${ACORD}) (BOIB núm. 142, del 7 de novembre) fixa en un sol text els del metro i els trens de SFM, els autobusos interurbans, la sanitat, les escoles i l'administració del Govern. Els de l'EMT els va fixar l'Ajuntament de Palma en una [resolució](${RES_EMT}) que va sortir al BOIB extraordinari núm. 144, el 10 de novembre.`,
  ],
  railNotes: [],
  school: null,
  schoolShort: "Per confirmar: no hem pogut comprovar al calendari escolar balear si l'11 de novembre és lectiu; pregunta-ho a l'escola",
  demos: [],
  demoShort: null,
  demoWhere: `Atents a la web d'[UGT Illes Balears](${UGT}): tan bon punt els convocants publiquin l'hora i el lloc, els posarem aquí.`,
  callNotes: [
    `**A les Illes Balears**, UGT Illes Balears va informar el 29 d'octubre que havia registrat la convocatòria a la Conselleria de Presidència juntament amb CCOO, STEI, CGT, CNT, SATI, el Sindicat de Llogateres i la Plataforma d'Afectats per la Hipoteca ([UGT Illes Balears](${UGT})).`,
  ],
  services: {
    emt: {
      name: "Autobusos de l'EMT de Palma",
      setBy: "Ajuntament de Palma",
      pending: `Els fixa l'Ajuntament de Palma, que els publica al [BOIB](${BOIB}).`,
      where: "Els avisos, a [emtpalma.cat](https://www.emtpalma.cat/es)",
      text: `Línies 27 i 28 (Hospital Son Llàtzer), el 100%; línia 33 (Son Espases), 8 dels 15 serveis programats; línies 6, 20, 29, 34, 36 i 39, el 40%; la resta de línies, el 30%, segons la [resolució de l'Ajuntament de Palma publicada al BOIB del 10 de novembre](${RES_EMT}).`,
      question: "Hi ha autobusos de l'EMT a Palma l'11 de novembre?",
    },
    sfm: {
      name: "Metro i tren de Mallorca (SFM)",
      setBy: "Govern de les Illes Balears",
      pending: `Els fixa el Govern de les Illes Balears per acord del Consell de Govern, que es publica al [BOIB](${BOIB}).`,
      where: "Les [notícies de SFM](https://www.trensfm.com/es/comunicacion/noticias)",
      text: `Metro: el 50% dels serveis d'un dia feiner de 10.00 a 12.00 i de 17.00 a 19.00 h, i el 80% a les altres franges. Tren (Palma-Inca-Manacor-Sa Pobla): els serveis d'un cap de setmana o festiu de 10.00 a 12.00 i de 17.00 a 19.00 h, i el 80% la resta del dia, segons [l'acord del Govern balear](${ACORD}).`,
      question: "Hi ha metro i tren a Mallorca l'11 de novembre?",
    },
    tib: {
      name: "Autobusos interurbans TIB",
      setBy: "Govern de les Illes Balears",
      pending: `Els fixa el Govern de les Illes Balears per acord del Consell de Govern, que es publica al [BOIB](${BOIB}).`,
      where: "Els [avisos del TIB](https://www.tib.org/es/avisos)",
      text: `Els serveis d'un diumenge o festiu; el transport escolar, al 100%, segons [l'acord del Govern balear](${ACORD}).`,
    },
    salud: {
      name: "Hospitals i centres de salut (IB-Salut)",
      setBy: "Govern de les Illes Balears",
      pending: `Els fixa el Govern de les Illes Balears per acord del Consell de Govern, que es publica al [BOIB](${BOIB}).`,
      where: `Per a la teva cita, el teu hospital o centre de salut; l'acord, al [BOIB](${BOIB})`,
      text: `Urgències, amb normalitat; el 100% a oncologia, diàlisi, hospital de dia, farmàcia hospitalària i trasplantaments; els centres de salut, oberts amb dos metges, un pediatre i dues infermeres de 8.00 a 15.00 h, i amb un metge i una infermera de 15.00 a 20.00 h, segons [l'acord del Govern balear](${ACORD}).`,
    },
    colegios: {
      name: "Escoles i instituts",
      setBy: "Govern de les Illes Balears",
      pending: `Els fixa el Govern de les Illes Balears per acord del Consell de Govern, que es publica al [BOIB](${BOIB}).`,
      where: `L'escola informa les famílies; l'acord, al [BOIB](${BOIB})`,
      text: `Els centres obren tot l'horari escolar, amb el director i el secretari, un docent per cada 3 unitats de segon cicle d'infantil i un per cada 4 unitats de primària, segons [l'acord del Govern balear](${ACORD}).`,
    },
    administracion: {
      name: "Administració del Govern balear",
      setBy: "Govern de les Illes Balears",
      pending: `Els fixa el Govern de les Illes Balears per acord del Consell de Govern, que es publica al [BOIB](${BOIB}).`,
      where: `L'acord, al [BOIB](${BOIB})`,
      text: `Un funcionari al registre general de cada conselleria, segons [l'acord del Govern balear](${ACORD}).`,
    },
  },
};

export const en: CityTr = {
  titleTransport: "EMT, metro and train",
  transportShort: "EMT, metro, train and TIB buses",
  authority: `the Government of the Balearic Islands, in a Governing Council agreement published in the [BOIB](${BOIB}), except those for the EMT, which are set by Palma City Council`,
  authorityShort: "the Balearic government (BOIB) and, for the EMT, Palma City Council",
  bulletin: "the BOIB",
  cercanias: null,
  airport: "Palma de Mallorca",
  airNotes: [
    `At Palma de Mallorca airport, 75% of domestic flights and 53% of international flights, for each route and airline, according to the [Ministry of Transport resolution](${MIN_TR}).`,
    "If the flight connects two Spanish airports with different percentages, the higher one applies, and the result is rounded up.",
  ],
  msSummary: `EMT, at 30% on most routes, 40% on six and 100% on the Hospital Son Llàtzer routes; metro and train, at 80%, with less service from 10.00 to 12.00 and from 17.00 to 19.00; TIB buses, as on a Sunday or public holiday, according to [the Balearic government's agreement of 6 November](${ACORD}) and [Palma City Council's resolution](${RES_EMT})`,
  msNotes: [
    `**Published on 7 and 10 November.** The [Governing Council Agreement of 6 November 2026](${ACORD}) (BOIB no. 142, 7 November) sets in a single text those for the metro and SFM trains, intercity buses, healthcare, schools and the regional government's administration. Those for the EMT were set by Palma City Council in a [resolution](${RES_EMT}) that appeared in BOIB extraordinary issue no. 144 on 10 November.`,
  ],
  railNotes: [],
  school: null,
  schoolShort: "To be confirmed: we have not been able to check in the Balearic school calendar whether 11 November is a school day; ask the school",
  demos: [],
  demoShort: null,
  demoWhere: `Keep an eye on the [UGT Illes Balears](${UGT}) website: as soon as the organisers publish the time and place, we will post them here.`,
  callNotes: [
    `**In the Balearic Islands**, UGT Illes Balears reported on 29 October that it had registered the strike call with the Conselleria de Presidència together with CCOO, STEI, CGT, CNT, SATI, the Sindicat de Llogateres and the Plataforma de Afectados por la Hipoteca ([UGT Illes Balears](${UGT})).`,
  ],
  services: {
    emt: {
      name: "Palma EMT buses",
      setBy: "Palma City Council",
      pending: `They are set by Palma City Council, which publishes them in the [BOIB](${BOIB}).`,
      where: "Notices on [emtpalma.cat](https://www.emtpalma.cat/es)",
      text: `Routes 27 and 28 (Hospital Son Llàtzer), 100%; route 33 (Son Espases), 8 of the 15 scheduled services; routes 6, 20, 29, 34, 36 and 39, 40%; all other routes, 30%, according to [Palma City Council's resolution published in the BOIB of 10 November](${RES_EMT}).`,
      question: "Are EMT buses running in Palma on 11 November?",
    },
    sfm: {
      name: "Mallorca metro and train (SFM)",
      setBy: "Government of the Balearic Islands",
      pending: `They are set by the Government of the Balearic Islands by Governing Council agreement, published in the [BOIB](${BOIB}).`,
      where: "[SFM news](https://www.trensfm.com/es/comunicacion/noticias)",
      text: `Metro: 50% of weekday services from 10.00 to 12.00 and from 17.00 to 19.00, and 80% at other times. Train (Palma-Inca-Manacor-Sa Pobla): weekend or public holiday services from 10.00 to 12.00 and from 17.00 to 19.00, and 80% the rest of the day, according to [the Balearic government's agreement](${ACORD}).`,
      question: "Are the metro and trains running in Mallorca on 11 November?",
    },
    tib: {
      name: "TIB intercity buses",
      setBy: "Government of the Balearic Islands",
      pending: `They are set by the Government of the Balearic Islands by Governing Council agreement, published in the [BOIB](${BOIB}).`,
      where: "[TIB notices](https://www.tib.org/es/avisos)",
      text: `Sunday or public holiday services; school transport at 100%, according to [the Balearic government's agreement](${ACORD}).`,
    },
    salud: {
      name: "Hospitals and health centres (IB-Salut)",
      setBy: "Government of the Balearic Islands",
      pending: `They are set by the Government of the Balearic Islands by Governing Council agreement, published in the [BOIB](${BOIB}).`,
      where: `For your appointment, your hospital or health centre; the agreement, in the [BOIB](${BOIB})`,
      text: `Emergency care as normal; 100% in oncology, dialysis, day hospital, hospital pharmacy and transplants; health centres open with two doctors, a paediatrician and two nurses from 8.00 to 15.00, and with a doctor and a nurse from 15.00 to 20.00, according to [the Balearic government's agreement](${ACORD}).`,
    },
    colegios: {
      name: "Primary and secondary schools",
      setBy: "Government of the Balearic Islands",
      pending: `They are set by the Government of the Balearic Islands by Governing Council agreement, published in the [BOIB](${BOIB}).`,
      where: `The school informs families; the agreement, in the [BOIB](${BOIB})`,
      text: `Schools open for the whole school day, with the head teacher and the secretary, one teacher for every 3 classes in the second cycle of infant education and one for every 4 primary classes, according to [the Balearic government's agreement](${ACORD}).`,
    },
    administracion: {
      name: "Balearic government administration",
      setBy: "Government of the Balearic Islands",
      pending: `They are set by the Government of the Balearic Islands by Governing Council agreement, published in the [BOIB](${BOIB}).`,
      where: `The agreement, in the [BOIB](${BOIB})`,
      text: `One civil servant at the general registry of each regional department, according to [the Balearic government's agreement](${ACORD}).`,
    },
  },
};
