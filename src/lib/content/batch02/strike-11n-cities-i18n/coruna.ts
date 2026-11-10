import type { CityTr } from "../strike-11n-cities-model";

const DOG = "https://www.xunta.gal/diario-oficial-galicia";
const ORDE = "https://www.xunta.gal/dog/Publicados/2026/20261109/AnuncioG0759-051126-0001_gl.html";
const SANIDADE = "https://www.xunta.gal/dog/Publicados/2026/20261110/AnuncioC3K1-061126-0002_gl.html";
const BUSGAL = "https://www.bus.gal/gl/descargas/servizos_minimos";
const MITMA = "https://www.transportes.gob.es/recursos_mfom/paginabasica/recursos/53_26-11-11-resolucion_huelga_general_vi.pdf";
const UGT = "https://www.ugtgalicia.org/sites/www.ugtgalicia.org/files/Dise%C3%B1o%20sin%20t%C3%ADtulo%20%281%29.pdf";
const CIG_DEMOS = "https://www.cig.gal/nova/a-cig-convoca-17-mobilizacions-para-a-folga-xeral-do-11-de-novembro.html";
const CIG_CALL =
  "https://www.cig.gal/nova/a-cig-rexistra-a-convocatoria-de-folga-xeral-en-galiza-para-o-11-de-novembro-para-frear-a-deterioracion-das-condicions-de-vida.html";
const TRANVIAS = "https://tranviascoruna.com/noticias/";

/** A Coruña, in Catalan and English (10 Nov 2026): the Spanish facts of strike-11n-cities-data.ts, same links and figures. */
export const ca: CityTr = {
  titleTransport: `autobusos`,
  transportShort: `autobús urbà i interurbans`,
  authority: `la Xunta de Galícia, en dues ordres publicades al [DOG](${DOG}) el 9 i el 10 de novembre; els de l'autobús urbà, per confirmar`,
  authorityShort: `la Xunta de Galícia (DOG)`,
  bulletin: `el DOG`,
  cercanias: null,
  airport: `A Coruña`,
  airNotes: [
    `A l'aeroport d'A Coruña, el 81% dels vols amb les Balears, les Canàries, Ceuta i Melilla i de les rutes amb obligació de servei públic; el 57% dels internacionals i dels peninsulars l'alternativa dels quals en transport públic triga 5 hores o més, i el 32% dels peninsulars amb una alternativa de menys de 5 hores, per a cada ruta i companyia, segons la [resolució del Ministeri de Transports](${MITMA}).`,
    `Si el vol uneix dos aeroports espanyols amb percentatges diferents, s'aplica el més alt, i el resultat s'arrodoneix a l'alça.`,
  ],
  msSummary: `autobusos interurbans, amb els serveis mínims que la Xunta publica a [bus.gal](${BUSGAL}); als hospitals, el 100% de les urgències, i als centres de salut, només l'atenció urgent; les escoles obren, amb un membre de l'equip directiu i un conserge, segons les [ordres de la Xunta](${ORDE}) publicades al DOG el 9 i el 10 de novembre`,
  msNotes: [
    `**Publicats el 9 i el 10 de novembre.** L'[Orde do 6 de novembro de 2026](${ORDE}) de la Consellería de Presidencia, Xustiza e Deportes (DOG núm. 214, del 9 de novembre) fixa els del personal de la Xunta, les escoles i els autobusos interurbans, entre d'altres, i l'[ordre de la Consellería de Sanidade](${SANIDADE}) (DOG núm. 215, del 10 de novembre), els de la sanitat. Cap de les dues no cobreix l'autobús urbà.`,
  ],
  railNotes: [],
  school: `**Sí, és dia lectiu.** El calendari escolar 2026-2027 de Galícia ([Orde do 4 de xuño de 2026](https://www.xunta.gal/dog/Publicados/2026/20260615/AnuncioG0761-050626-0001_gl.pdf)) fixa les classes del 9 de setembre de 2026 al 21 de juny de 2027 i no inclou l'11 de novembre entre els dies no lectius; les festes locals d'A Coruña el 2026 són el 17 de febrer (dimarts de Carnaval) i el 7 d'octubre (festivitat del Roser) ([DOG del 30 d'octubre de 2025](https://www.xunta.gal/dog/Publicados/2025/20251030/AnuncioG0767-221025-0001_gl.pdf)).`,
  schoolShort: `Sí, és dia lectiu`,
  demos: [
    `**Al matí, CCOO i UGT:** manifestació conjunta a les 12.00 h, de la Praza de A Palloza a la Delegación do Goberno, segons el [cartell de mobilitzacions d'UGT Galicia](${UGT}).`,
    `**CIG:** a les 12.00 h a la Praza de Vigo, segons la [CIG](${CIG_DEMOS}).`,
    `**A la tarda:** «Manifestació Unitària de Sindicats i Col·lectius Socials» a les 18.00 h, de la cruïlla de la Ronda de Outeiro amb l'avinguda de Fisterra a la Praza das Cigarreiras, segons el [mateix cartell d'UGT Galicia](${UGT}).`,
  ],
  demoShort: `CCOO i UGT, a les 12.00 h, d'A Palloza a la Delegación do Goberno; CIG, a les 12.00 h, Praza de Vigo; a la tarda, a les 18.00 h, de la Ronda de Outeiro a la Praza das Cigarreiras`,
  demoWhere: `Estigues atent a [UGT Galicia](${UGT}) i a la [CIG](${CIG_DEMOS}).`,
  callNotes: [
    `**A Galícia, la CIG convoca la seva pròpia vaga general** el mateix dia: «La CIG ha registrat aquest matí la convocatòria de vaga general a tota Galícia per al proper 11 de novembre» ([CIG](${CIG_CALL})).`,
  ],
  services: {
    bus: {
      name: `Autobús urbà (Compañía de Tranvías)`,
      setBy: `Per confirmar`,
      pending: `No hem trobat qui els fixa ni cap decret: ni l'[Ajuntament](https://www.coruna.gal/web/es/actualidad) ni la [Compañía de Tranvías](${TRANVIAS}) no els havien publicat el 10 de novembre.`,
      where: `Les [notícies de la Compañía de Tranvías](${TRANVIAS})`,
      text: null,
      question: `Hi ha autobusos a A Coruña l'11 de novembre?`,
    },
    interurbanos: {
      name: `Autobusos interurbans de la Xunta`,
      setBy: `Xunta de Galícia`,
      pending: `Els fixa la Xunta de Galícia (Consellería de Presidencia) per ordre, que es publica al [DOG](${DOG}).`,
      where: `Els [avisos de bus.gal](https://www.bus.gal/gl/avisos)`,
      text: `Els que la Xunta publica, línia per línia, a [bus.gal](${BUSGAL}); el transport escolar, a l'entrada de 7.30 a 10.30 h i a la sortida de 13.30 a 19.00 h, en els itineraris d'ensenyament obligatori de més de 4 km, segons [l'ordre de la Xunta del 6 de novembre](${ORDE}).`,
    },
    salud: {
      name: `Hospitals i centres de salut (Sergas)`,
      setBy: `Xunta de Galícia (Sanidade)`,
      pending: `Els fixa la Xunta de Galícia (Consellería de Sanidade) per ordre, que es publica al [DOG](${DOG}).`,
      where: `Per a la teva cita, el teu hospital o centre de salut; l'ordre, al [DOG](${DOG})`,
      text: `El 100% de les urgències, el 061 i els punts d'atenció continuada (PAC), i de l'UCI, la diàlisi, els tractaments oncològics i els trasplantaments; a les consultes, només el que és urgent i preferent; als centres de salut, només l'atenció urgent o que no es pugui ajornar, amb entre un i quatre metges segons la mida del centre i un pediatre, segons l'[ordre de la Consellería de Sanidade del 6 de novembre](${SANIDADE}).`,
    },
    colegios: {
      name: `Escoles i instituts públics`,
      setBy: `Xunta de Galícia`,
      pending: `Els fixa la Xunta de Galícia (Consellería de Presidencia) per ordre, que es publica al [DOG](${DOG}).`,
      where: `L'escola informa les famílies; l'ordre, al [DOG](${DOG})`,
      text: `Els centres obren en el seu horari habitual, amb el director o un membre de l'equip directiu i un conserge, i una persona de cuina on el menjador és de gestió directa; els mateixos, als centres privats i concertats, segons [l'ordre de la Xunta del 6 de novembre](${ORDE}).`,
    },
    administracion: {
      name: `Administració de la Xunta`,
      setBy: `Xunta de Galícia`,
      pending: `Els fixa la Xunta de Galícia (Consellería de Presidencia) per ordre, que es publica al [DOG](${DOG}).`,
      where: `L'ordre, al [DOG](${DOG})`,
      text: `A A Coruña, dos funcionaris al matí i un a la tarda a l'Oficina de Rexistro e Atención á Cidadanía de l'Edificio Administrativo, segons [l'ordre de la Xunta del 6 de novembre](${ORDE}).`,
    },
  },
};

export const en: CityTr = {
  titleTransport: `bus`,
  transportShort: `city and intercity buses`,
  authority: `the Xunta de Galicia (Galician regional government), in two orders published in the [DOG](${DOG}) on 9 and 10 November; those for the city bus are yet to be confirmed`,
  authorityShort: `the Xunta de Galicia (DOG)`,
  bulletin: `the DOG`,
  cercanias: null,
  airport: `A Coruña`,
  airNotes: [
    `At A Coruña airport, 81% of flights to and from the Balearic Islands, the Canary Islands, Ceuta and Melilla and of public service obligation routes; 57% of international flights and of mainland flights whose public transport alternative takes 5 hours or more, and 32% of mainland flights with an alternative of less than 5 hours, for each route and airline, according to the [Ministry of Transport resolution](${MITMA}).`,
    `If the flight links two Spanish airports with different percentages, the higher one applies, and the result is rounded up.`,
  ],
  msSummary: `intercity buses, with the minimum services the Xunta publishes on [bus.gal](${BUSGAL}); in hospitals, 100% of emergency care, and in health centres, urgent care only; schools open, with one member of the management team and one caretaker, according to the [Xunta's orders](${ORDE}) published in the DOG on 9 and 10 November`,
  msNotes: [
    `**Published on 9 and 10 November.** The [Orde do 6 de novembro de 2026](${ORDE}) of the Consellería de Presidencia, Xustiza e Deportes (DOG no. 214, of 9 November) sets those for Xunta staff, schools and intercity buses, among others, and the [Consellería de Sanidade order](${SANIDADE}) (DOG no. 215, of 10 November) those for healthcare. Neither of them covers the city bus.`,
  ],
  railNotes: [],
  school: `**Yes, it is a school day.** Galicia's 2026-2027 school calendar ([Orde do 4 de xuño de 2026](https://www.xunta.gal/dog/Publicados/2026/20260615/AnuncioG0761-050626-0001_gl.pdf)) sets classes from 9 September 2026 to 21 June 2027 and does not list 11 November among the non-teaching days; A Coruña's local holidays in 2026 are 17 February (Shrove Tuesday) and 7 October (Feast of the Rosary) ([DOG of 30 October 2025](https://www.xunta.gal/dog/Publicados/2025/20251030/AnuncioG0767-221025-0001_gl.pdf)).`,
  schoolShort: `Yes, it is a school day`,
  demos: [
    `**In the morning, CCOO and UGT:** joint demonstration at 12.00, from Praza de A Palloza to the Delegación do Goberno, according to [UGT Galicia's demonstrations poster](${UGT}).`,
    `**CIG:** at 12.00 in Praza de Vigo, according to the [CIG](${CIG_DEMOS}).`,
    `**In the evening:** "Joint Demonstration of Trade Unions and Social Groups" at 18.00, from the junction of Ronda de Outeiro and Avenida de Fisterra to Praza das Cigarreiras, according to the [same UGT Galicia poster](${UGT}).`,
  ],
  demoShort: `CCOO and UGT, at 12.00, from A Palloza to the Delegación do Goberno; CIG, at 12.00, Praza de Vigo; in the evening, at 18.00, from Ronda de Outeiro to Praza das Cigarreiras`,
  demoWhere: `Keep an eye on [UGT Galicia](${UGT}) and the [CIG](${CIG_DEMOS}).`,
  callNotes: [
    `**In Galicia, the CIG has called its own general strike** on the same day: "This morning the CIG registered the call for a general strike throughout Galicia for this coming 11 November" ([CIG](${CIG_CALL})).`,
  ],
  services: {
    bus: {
      name: `City bus (Compañía de Tranvías)`,
      setBy: `To be confirmed`,
      pending: `We have not found who sets them or any decree: neither the [city council](https://www.coruna.gal/web/es/actualidad) nor the [Compañía de Tranvías](${TRANVIAS}) had published them on 10 November.`,
      where: `The [Compañía de Tranvías news page](${TRANVIAS})`,
      text: null,
      question: `Are buses running in A Coruña on 11 November?`,
    },
    interurbanos: {
      name: `Xunta intercity buses`,
      setBy: `Xunta de Galicia`,
      pending: `They are set by the Xunta de Galicia (Consellería de Presidencia) by order, published in the [DOG](${DOG}).`,
      where: `The [bus.gal service notices](https://www.bus.gal/gl/avisos)`,
      text: `Those the Xunta publishes, line by line, on [bus.gal](${BUSGAL}); school transport, for arrival from 7.30 to 10.30 and for departure from 13.30 to 19.00, on compulsory-education routes of more than 4 km, according to [the Xunta's order of 6 November](${ORDE}).`,
    },
    salud: {
      name: `Hospitals and health centres (Sergas)`,
      setBy: `Xunta de Galicia (Sanidade)`,
      pending: `They are set by the Xunta de Galicia (Consellería de Sanidade) by order, published in the [DOG](${DOG}).`,
      where: `For your appointment, your hospital or health centre; the order, in the [DOG](${DOG})`,
      text: `100% of emergency departments, the 061 service and the out-of-hours care points (PAC), and of intensive care, dialysis, cancer treatment and transplants; in outpatient clinics, only urgent and priority cases; in health centres, only care that is urgent or cannot be postponed, with between one and four doctors depending on the size of the centre and one paediatrician, according to the [Consellería de Sanidade order of 6 November](${SANIDADE}).`,
    },
    colegios: {
      name: `State primary and secondary schools`,
      setBy: `Xunta de Galicia`,
      pending: `They are set by the Xunta de Galicia (Consellería de Presidencia) by order, published in the [DOG](${DOG}).`,
      where: `The school informs families; the order, in the [DOG](${DOG})`,
      text: `Schools open at their usual hours, with the head teacher or a member of the management team and one caretaker, plus one kitchen worker where the canteen is run directly; the same in private and state-funded private schools, according to [the Xunta's order of 6 November](${ORDE}).`,
    },
    administracion: {
      name: `Xunta administration`,
      setBy: `Xunta de Galicia`,
      pending: `They are set by the Xunta de Galicia (Consellería de Presidencia) by order, published in the [DOG](${DOG}).`,
      where: `The order, in the [DOG](${DOG})`,
      text: `In A Coruña, two civil servants in the morning and one in the afternoon at the Oficina de Rexistro e Atención á Cidadanía in the Edificio Administrativo, according to [the Xunta's order of 6 November](${ORDE}).`,
    },
  },
};
