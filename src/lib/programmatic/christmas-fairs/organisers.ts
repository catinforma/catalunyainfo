import type { OrganiserFair, PendingMarket } from "./types";

/**
 * What organisers have published on their own official pages and the open
 * data does not carry, or carries with other dates. Kept by hand: every entry
 * was read on its page on the date given, and `quote` is the sentence that
 * gives the dates, as the page writes it. Add an entry only from the
 * organiser's own page (council, organising association); never from a
 * listing site or the press.
 *
 * When the big markets publish (Santa Llúcia, Girona…), move them from
 * PENDING_MARKETS to ORGANISER_FAIRS: their town gets a page with the next
 * deploy, and an English one if it is in `EN_TOWNS` (paths.ts).
 *
 * Read on 30 Oct 2026:
 *   - the Generalitat's fairs calendar (updated 25 Sep 2026) gives Canyelles
 *     28-29 Nov; the council gives 21-22 Nov, which the pages show;
 *   - eight more councils have announced Christmas markets the calendar does
 *     not list (their calls for stallholders, all with 2026 in the text or the
 *     page date);
 *   - Figueres' call for stallholders (page valid 1 Oct - 2 Nov 2026, last
 *     modified 1 Oct 2026, in its metadata) says the market "es celebrarà" on
 *     the Rambla from 27 November to 24 December, while its standing page
 *     still says "Dates a determinar per 2026": the call is the newer page;
 *   - Vic's agenda lists the Fira d'Artesania de Nadal 2026 (5 Dec - 4 Jan).
 */
export const ORGANISER_FAIRS: readonly OrganiserFair[] = [
  {
    id: "org:canyelles-santa-llucia",
    ine: "08043",
    name: "24a Fira de Santa Llúcia",
    start: "2026-11-21",
    end: "2026-11-22",
    place: null,
    url: "https://www.canyelles.cat/promocio-economica-i-turisme/la-fira-de-santa-llucia",
    publisher: "Ajuntament de Canyelles",
    readOn: "2026-10-30",
    quote: "La 24a edició de la Fira de Santa Llúcia se celebra el 21 i 22 de novembre de 2026.",
    replaces: "vm32:24033377",
  },
  {
    id: "org:sant-antoni-de-vilamajor-un-nadal-com-cal",
    ine: "08198",
    name: "1a Fira «Un Nadal com cal»",
    start: "2026-11-28",
    end: "2026-11-29",
    place: "Plaça de la Vila",
    url: "https://www.santantonidevilamajor.cat/actualitat/noticies/busquem-artesanses-i-creadorses-per-omplir-de-magia-la-1a-fira-un-nadal-com-cal-de-sant-antoni-de-vilamajor.html",
    publisher: "Ajuntament de Sant Antoni de Vilamajor",
    readOn: "2026-10-30",
    quote: "Dates: dissabte 28 i diumenge 29 de novembre de 2026.",
  },
  {
    id: "org:figueres-mercat-de-nadal",
    ine: "17066",
    name: "Mercat de Nadal",
    start: "2026-11-27",
    end: "2026-12-24",
    place: "La Rambla",
    url: "https://www.figueres.cat/tramits/convocatories/mercatnadal26",
    publisher: "Ajuntament de Figueres",
    readOn: "2026-10-30",
    quote: "L’Ajuntament de Figueres organitza el Mercat de Nadal, que es celebrarà a la Rambla de la ciutat del 27 de novembre al 24 de desembre.",
  },
  {
    id: "org:vic-artesania-de-nadal",
    ine: "08298",
    name: "Fira d'Artesania de Nadal",
    start: "2026-12-05",
    end: "2027-01-04",
    place: "Plaça Major",
    url: "https://www.vic.cat/ciutat/agenda/fira-d-artesania-de-nadal-2026",
    publisher: "Ajuntament de Vic",
    readOn: "2026-10-30",
    quote: "FIRA D'ARTESANIA DE NADAL 2026 … On? Plaça Major Quan? 05/12/2026 a 00:00 fins a 04/01/2027 a 00:00",
  },
  {
    id: "org:garriguella-mercat-de-nadal",
    ine: "17077",
    name: "6è Mercat de Nadal de Garriguella",
    start: "2026-12-08",
    end: "2026-12-08",
    place: "Plaça de l'Església",
    url: "https://garriguella.cat/obertes-les-inscripcions-per-participar-en-el-6e-mercat-de-nadal-de-garriguella/",
    publisher: "Ajuntament de Garriguella",
    readOn: "2026-10-30",
    quote: "L’Ajuntament de Garriguella obre el termini d’inscripcions per participar al 6è Mercat de Nadal de Garriguella, que se celebrarà dimarts 8 de desembre, de 9.00 h a 14.00 h, a la Plaça de l’Església.",
  },
  {
    id: "org:altafulla-fira-de-nadal",
    ine: "43012",
    name: "Fira de Nadal",
    start: "2026-12-11",
    end: "2026-12-13",
    place: "Places de l'Església i del Pou",
    url: "https://altafulla.cat/noticies/l-ajuntament-d-altafulla-obre-les-inscripcions-per-participar-en-la-fira-de-nadal-2026_1589",
    publisher: "Ajuntament d'Altafulla",
    readOn: "2026-10-30",
    quote: "L’Ajuntament d’Altafulla ha obert el període d’inscripcions per participar com a expositor a la Fira de Nadal 2026, que se celebrarà els dies 11, 12 i 13 de desembre a les places de l’Església i del Pou.",
  },
  {
    id: "org:sant-pere-de-vilamajor-vila-claus",
    ine: "08234",
    name: "4a Fira de Nadal Vila Claus",
    start: "2026-12-12",
    end: "2026-12-13",
    place: "Parc de la Rectoria",
    url: "https://www.vilamajor.cat/actualitat/noticies/ja-es-poden-sollicitar-parades-per-a-la-4a-fira-de-nadal-vila-claus-2026.html",
    publisher: "Ajuntament de Sant Pere de Vilamajor",
    readOn: "2026-10-30",
    quote:
      "Ja es poden presentar les sol·licituds per participar amb una parada a la 4a Fira de Nadal Vila Claus de Sant Pere de Vilamajor, que aquest any se celebrarà durant dos dies, el dissabte 12 i el diumenge 13 de desembre de 2026, al parc de la Rectoria.",
  },
  {
    id: "org:roquetes-fira-de-nadal",
    ine: "43133",
    name: "32a Fira de Nadal de Roquetes",
    start: "2026-12-12",
    end: "2026-12-13",
    place: "Passeig Ramon Bosch i Rosell i Plaça dels Països Catalans",
    url: "https://roquetes.cat/web/obertes-les-inscripcions-per-participar-a-la-32a-fira-de-nadal-de-roquetes-%F0%9F%8E%84/",
    publisher: "Ajuntament de Roquetes",
    readOn: "2026-10-30",
    quote: "La fira se celebrarà els dies 12 i 13 de desembre de 2026, al Passeig Ramon Bosch i Rosell i la Plaça dels Països Catalans.",
  },
  {
    id: "org:cubelles-fira-de-nadal",
    ine: "08074",
    name: "Fira de Nadal de Cubelles",
    start: "2026-12-18",
    end: "2026-12-20",
    place: null,
    url: "https://www.cubelles.cat/cubelles-facil/promocio-economica/cubelles-recupera-la-fira-de-nadal-amb-un-format-renovat-inspirat-en-els-mercats-nadalencs-tradicionals.html",
    publisher: "Ajuntament de Cubelles",
    readOn: "2026-10-30",
    quote: "La fira se celebrarà del 18 al 20 de desembre i incorporarà les tradicionals casetes nadalenques, amb una oferta centrada en l'artesania, el comerç de proximitat i les activitats familiars.",
  },
  {
    id: "org:les-masies-de-voltrega-mercat-de-nadal",
    ine: "08117",
    name: "Mercat de Nadal de les Masies de Voltregà",
    start: "2026-12-18",
    end: "2026-12-20",
    place: null,
    url: "https://www.lesmasiesdevoltrega.cat/actualitat/noticies/obertes-les-inscripcions-per-participar-en-el-mercat-de-nadal-de-les-masies-de-voltrega.html",
    publisher: "Ajuntament de les Masies de Voltregà",
    readOn: "2026-10-30",
    quote:
      "L’Ajuntament de les Masies de Voltregà obre les inscripcions per a les persones artesanes, comerços, projectes i iniciatives que vulguin participar com a expositors al Mercat de Nadal de les Masies de Voltregà, que se celebrarà els dies 18, 19 i 20 de desembre de 2026.",
  },
];

/**
 * The big markets people search for whose 2026 dates are not published yet,
 * each with the official page that will carry them (all read on 30 Oct 2026).
 * The hub lists them as "not published yet"; none of them has a town page
 * until its dates are out.
 */
export const PENDING_MARKETS: readonly PendingMarket[] = [
  {
    id: "pending:barcelona-santa-llucia",
    ine: "08019",
    name: "Fira de Santa Llúcia",
    url: "https://firadesantallucia.cat/",
    publisher: "Associació Fira de Santa Llúcia",
    readOn: "2026-10-30",
    shows: {
      ca: "El web de l'organització encara mostra l'edició del 2025 (del 28 de novembre al 23 de desembre, amb el peu «© 2025»).",
      es: "La web de la organización aún muestra la edición de 2025 (del 28 de noviembre al 23 de diciembre, con el pie «© 2025»).",
      en: "The organiser's website still shows the 2025 edition (28 November to 23 December, footer \"© 2025\").",
    },
  },
  {
    id: "pending:barcelona-sagrada-familia",
    ine: "08019",
    name: "Fira de Nadal de la Sagrada Família",
    url: "https://www.barcelona.cat/culturapopular/ca/festes-i-tradicions/fires/fira-de-nadal-de-la-sagrada-familia",
    publisher: "Ajuntament de Barcelona",
    readOn: "2026-10-30",
    shows: {
      ca: "L'Ajuntament només diu que comença a la darreria de novembre o principi de desembre, a la plaça de la Sagrada Família.",
      es: "El Ayuntamiento solo dice que empieza a finales de noviembre o principios de diciembre, en la plaza de la Sagrada Família.",
      en: "The City Council only says it opens in late November or early December, on Plaça de la Sagrada Família.",
    },
  },
  {
    id: "pending:girona-mercat-de-nadal",
    ine: "17079",
    name: "Mercat de Nadal",
    url: "https://web.girona.cat/comerc/firesimercatsalcarrer",
    publisher: "Ajuntament de Girona",
    readOn: "2026-10-30",
    shows: {
      ca: "L'Ajuntament dona la norma, sense any: «De l'últim cap de setmana de novembre al 5 de gener», a la plaça de la Independència.",
      es: "El Ayuntamiento da la norma, sin año: «De l'últim cap de setmana de novembre al 5 de gener» (del último fin de semana de noviembre al 5 de enero), en la plaza de la Independència.",
      en: "The City Council gives the rule, with no year: from the last weekend of November to 5 January, on Plaça de la Independència.",
    },
  },
  {
    id: "pending:lleida-mercat-de-nadal",
    ine: "25120",
    name: "Mercat de Nadal",
    url: "https://comercmercatsconsum.paeria.cat/comerc-i-mercats/mercats-ambulants/mercat-de-nadal",
    publisher: "Paeria de Lleida",
    readOn: "2026-10-30",
    shows: {
      ca: "La Paeria només enllaça el calendari dels mercats de Nadal 2025-2026, a la plaça de la Catedral i voltants.",
      es: "La Paeria solo enlaza el calendario de los mercados de Navidad 2025-2026, en la plaza de la Catedral y alrededores.",
      en: "The city only links the 2025-2026 Christmas market calendar, on Plaça de la Catedral and around it.",
    },
  },
  {
    id: "pending:tarragona-fira-de-nadal",
    ine: "43148",
    name: "Fires de Nadal i d'Artesania",
    url: "https://www.tarragona.cat/la-ciutat/nadal-a-tarragona/",
    publisher: "Ajuntament de Tarragona",
    readOn: "2026-10-30",
    shows: {
      ca: "La pàgina de Nadal de l'Ajuntament encara no dona dates per a les fires del 2026.",
      es: "La página de Navidad del Ayuntamiento aún no da fechas para las ferias de 2026.",
      en: "The council's Christmas page gives no dates for the 2026 fairs yet.",
    },
  },
  {
    id: "pending:sitges-nadal",
    ine: "08270",
    name: "Nadal a Sitges",
    url: "https://www.sitges.cat/serveis/nadal-a-sitges",
    publisher: "Ajuntament de Sitges",
    readOn: "2026-10-30",
    shows: {
      ca: "La pàgina de Nadal de l'Ajuntament encara no anuncia cap fira ni mercat del 2026.",
      es: "La página de Navidad del Ayuntamiento aún no anuncia ninguna feria ni mercado de 2026.",
      en: "The council's Christmas page announces no 2026 fair or market yet.",
    },
  },
  {
    id: "pending:granollers-fires-de-nadal",
    ine: "08096",
    name: "Fires de Nadal",
    url: "https://www.granollers.cat/nadal/fires-de-nadal",
    publisher: "Ajuntament de Granollers",
    readOn: "2026-10-30",
    shows: {
      ca: "La pàgina de l'Ajuntament encara és la de l'edició 2025-2026.",
      es: "La página del Ayuntamiento aún es la de la edición 2025-2026.",
      en: "The council's page still shows the 2025-2026 edition.",
    },
  },
];
