import type { Locale } from "@/lib/i18n/config";

import type { Parade } from "./reis";
import type { B2Key } from "./shared";

/**
 * Cavalcada de Reis in 16 more towns of Catalonia: the compact rows behind
 * the towns table and town sections of the Three Kings parade page
 * (reis.ts). The eight towns the page covered first (Girona, Lleida,
 * Tarragona, Reus, Sabadell, Mataró, Badalona, Igualada) keep their richer
 * entries in reis.ts `TOWNS`; Barcelona lives there too.
 *
 * Why here and not on a hub of its own (5 Nov 2026): the Spanish edition of
 * the Reis page already ranks at about position 5 for the generic queries
 * ("cabalgata de reyes 2027", "cuando es la cabalgata de reyes 2027") as well
 * as for Barcelona's, and its title already says "y Cataluña". A second page
 * titled "Cabalgatas de Reyes 2027 en Cataluña" would compete with it for
 * exactly those words. The per-town searches ("cabalgata reyes 2027 <town>
 * horario recorrido", 2-5 January) are answered by a section per town on the
 * same URL, so every link and signal stays on one page. If a town's own
 * demand turns out large in January, split it off then.
 *
 * Every row is the 5 January 2026 parade (the last edition) as the council's
 * own site gave it, read on REIS_TOWNS_AS_OF; the URL and the quote are next
 * to each row, and the fact pack is
 * research_notes/x10/reis-transport-nadal-2026.md. Newspapers, local TV and
 * radio, aggregators and social media were used only to find the council's
 * page, never as the source. On that day no council had published its 2027
 * times or route.
 *
 * HOW TO UPDATE (by 22 December 2026, when a test starts failing, and again
 * from 2 January 2027):
 *  - Read each town's `watch` page. If the 2027 parade is out, fill `y2027`
 *    with what the council's own page says (date, time, and whatever of
 *    start, route, end and arrival it gives), its URL and the read date.
 *    reis.ts paradeProblems() refuses any host that is not the council's.
 *  - Move REIS_TOWNS_AS_OF to the day every row was re-read (it is printed
 *    as the check date of the whole table), and reis.ts REIS_AS_OF with it.
 *  - Run the tests, deploy, publish `?only=reis-2027`.
 *  - `y2026` stays as it is: it is printed with its year, never as 2027's.
 */

/** The day every row below was last read on the councils' own sites. */
export const REIS_TOWNS_AS_OF = "2026-11-05";

/**
 * The re-read checkpoints: from each of these days on, REIS_TOWNS_AS_OF (and
 * REIS_AS_OF) must be on or after it. Councils publish their routes in the
 * last ten days of December (Mataró 22 Dec 2025, Reus 15 Dec 2025) and
 * Barcelona on 2 January.
 */
export const REIS_REREAD_BY = ["2026-12-22", "2027-01-02"] as const;

/** The 2026 parade as the council gave it. Place names stay as the council writes them (Catalan). */
export interface TownParade2026 {
  /** Always 5 January 2026. */
  date: string;
  /** Start of the parade, "18:00". */
  time: string;
  /** Where it set off (left out when no council page still gives it; the row's `startText` then says so). */
  start?: string;
  /** Streets in order between the start and the end, when the council lists them. */
  route?: readonly string[];
  /** Where it ended. */
  end?: string;
  /** Expected time at the end, "21:00". */
  endTime?: string;
  /** The Kings' arrival before the parade, when the council gives it. */
  arrival?: { time?: string; place: string };
  /** The council's own page that says it. */
  url: string;
  /** A second council page for part of the row, when `url` does not give it all. */
  alsoUrl?: string;
  /** The day the council published `url`, when the page shows it. */
  published?: string;
  /** The day that page was read, ISO. */
  read: string;
}

export interface ReisTown {
  key: string;
  /** The town's name as printed in every language. */
  name: string;
  /** The council's hosts: every URL of the row must be on one of them. */
  hosts: RegExp;
  /** Where the council will publish the 2027 parade (news, Christmas site or the yearly parade page). */
  watch: string;
  /** Last year's parade, from the council's own page, always printed with "2026". */
  y2026: TownParade2026;
  /** This year's, or `null` while the council has not published it. */
  y2027: Parade | null;
  /** Something official about 2027 already out (a call for participants, the date), never a time. */
  news2027?: { published: string; url: string; text: Record<Locale, string>; confirmsDate?: true };
  /** One or two sentences of what else the council said about 2026, in each language. */
  notes?: Record<Locale, string>;
  /** The start as one short phrase, when "time, start" would mislead. */
  startText?: Record<Locale, string>;
  /** The arrival as one short phrase, when the council gives no time and place pair. */
  arrivalText?: Record<Locale, string>;
  /** The route is the one the council announced beforehand (it may have changed on the day). */
  announcedRoute?: true;
  /** Our guide to the town, when there is one. */
  guide?: B2Key;
}

const READ = "2026-11-05";

export const REIS_TOWNS: readonly ReisTown[] = [
  /* ---------------------------------------------------------------- Vallès */
  {
    key: "terrassa",
    name: "Terrassa",
    hosts: /(^|\.)terrassa\.cat$/,
    watch: "https://terrassanadal.terrassa.cat/benvingut-xiu-xiu/",
    // The council's Christmas site (www.terrassa.cat answers with a bot challenge; the Christmas site shows a
    // maintenance notice, so it was read through its own WordPress API and iCal export). The page is reused
    // every year and prints no year; it says "Dilluns 5 de gener" and the event's iCal starts 20260105T180000.
    // "Hora: 16.45 h – Arribada dels Reis d'Orient en helicòpter", "Lloc: Parc de les Nacions Unides";
    // "Sortida: 18 h – carrer de Vallhonrat amb Rambla d'Ègara"; route as below; "Arribada: 19.45 h
    // (aproximadament) – Escenari al Raval de Montserrat – Atri de l'Ajuntament". Event created 2 Dec 2025.
    y2026: {
      date: "2026-01-05",
      time: "18:00",
      start: "carrer de Vallhonrat amb rambla d'Ègara",
      route: ["rambla d'Ègara", "passeig del 22 de Juliol", "carrer del Nord", "carrer de la Societat", "plaça de la Creu Gran", "carrer de la Creu Gran", "carrer de Sant Antoni", "plaça del Doctor Robert", "passeig del Comte d'Ègara", "carrer de la Font Vella", "plaça Vella", "carrer de Gavatxons", "plaça de la Font Trobada"],
      end: "Raval de Montserrat",
      endTime: "19:45",
      arrival: { time: "16:45", place: "Parc de les Nacions Unides" },
      url: "https://terrassanadal.terrassa.cat/benvingut-xiu-xiu/",
      alsoUrl: "https://terrassanadal.terrassa.cat/esdeveniment/cavalcada-dels-reis-dorient/",
      published: "2025-12-02",
      read: READ,
    },
    y2027: null,
    notes: {
      ca: "Van arribar en helicòpter i van acabar a l'escenari del Raval de Montserrat, a l'atri de l'Ajuntament. Hi havia un espai per a persones amb mobilitat reduïda i un tram blau, sense soroll ni llums intensos, al passeig del 22 de Juliol, davant de l'Escola El Vapor.",
      es: "Llegaron en helicóptero y terminaron en el escenario del Raval de Montserrat, en el atrio del Ayuntamiento. Había un espacio para personas con movilidad reducida y un tramo azul, sin ruido ni luces intensas, en el passeig del 22 de Juliol, frente a la Escola El Vapor.",
      en: "They came by helicopter and finished on the stage on Raval de Montserrat, at the town hall. There was an area for people with reduced mobility and a quiet 'blue stretch' on Passeig del 22 de Juliol, opposite the Escola El Vapor.",
    },
  },
  {
    key: "sant-cugat",
    name: "Sant Cugat del Vallès",
    hosts: /(^|\.)santcugat\.cat$/,
    watch: "https://premsa.santcugat.cat/",
    // Press room, 2 Dec 2025: "17 h: Arribada de Ses Majestats per l'avinguda de Gràcia 17.10 h: Inici de la
    // cavalcada des de l'avinguda de Gràcia – Rambla Ribatallada (contra direcció) – c. d'Àngel Guimerà – c. Villà –
    // c. de Valldoreix – c. de Sant Bonaventura – Rambla del Celler (contra direcció) – c. Puig i Cadafalch – Rambla
    // del celler – av. de Cerdanyola – c. de la Torre – plaça d'Octavià." "19.10 h: Lliurament de la Clau de la
    // Ciutat ... a la plaça d'Octavià". The council's tourism page (visit.santcugat.cat, 12 Dec 2025) says the
    // parade left "a les 17.00 h", adds "c. de la Creu" and puts the quiet stretch elsewhere: the press note is
    // used, and the quiet stretch is left out.
    y2026: {
      date: "2026-01-05",
      time: "17:10",
      start: "avinguda de Gràcia",
      route: ["rambla de Ribatallada", "carrer d'Àngel Guimerà", "carrer de Villà", "carrer de Valldoreix", "carrer de Sant Bonaventura", "rambla del Celler", "carrer de Puig i Cadafalch", "rambla del Celler", "avinguda de Cerdanyola", "carrer de la Torre"],
      end: "plaça d'Octavià",
      endTime: "19:10",
      arrival: { time: "17:00", place: "avinguda de Gràcia" },
      url: "https://premsa.santcugat.cat/ajuntament/torna-el-nadal-mes-tradicional-amb-mes-de-300-activitats-i-novetats-en-la-cavalcada-amb-un-nou-recorregut-que-siniciara-a-lav-de-gracia/",
      published: "2025-12-02",
      read: READ,
    },
    y2027: null,
    announcedRoute: true,
    notes: {
      ca: "El 2026 la cavalcada estrenava recorregut. Els Reis venien des de l'Arrabassada i, a les 19:10, van rebre la clau de la ciutat a la plaça d'Octavià, on a les 20:00 recollien les cartes.",
      es: "En 2026 la cabalgata estrenaba recorrido. Los Reyes venían desde la Arrabassada y, a las 19:10, recibieron la llave de la ciudad en la plaza d'Octavià, donde a las 20:00 recogían las cartas.",
      en: "In 2026 the parade had a new route. The Kings came down from the Arrabassada road and received the key to the city at 19:10 in Plaça d'Octavià, where they collected children's letters from 20:00.",
    },
  },
  {
    key: "rubi",
    name: "Rubí",
    hosts: /(^|\.)rubi\.cat$/,
    watch: "https://www.rubi.cat/ca/actualitat/noticies",
    // News, 5 Jan 2026: "facin entrada a l'Escardívol al voltant de les 18 h"; "Al voltant de les 18.30 h ...
    // pujaran a les seves carrosses"; "La cavalcada sortirà del carrer de Cadmo i passarà pel carrer de Rafael de
    // Casanova, plaça de Catalunya, ... carrer de Montserrat i plaça del Doctor Guardiet, on finalitzaran el
    // recorregut entrant a l'església de San Pere". Traffic notice of 23 Dec 2025: "A les 18.30 h, inici de la
    // Cavalcada". The full route came out on the day itself.
    y2026: {
      date: "2026-01-05",
      time: "18:30",
      start: "carrer de Cadmo",
      route: ["carrer de Rafael de Casanova", "plaça de Catalunya", "passeig de Francesc Macià", "avinguda de Barcelona", "rambleta de Joan Miró", "passeig de les Torres", "avinguda de Can Cabanyes", "passeig del Ferrocarril", "carrer de Monturiol", "carrer de la Mare de Déu de Fàtima", "carrer del Tres d'Abril", "carretera de Sant Cugat", "carrer de Joan Maragall", "carrer de Bartrina", "carrer de Lluís Ribas", "carrer de Cervantes", "avinguda de Barcelona", "passeig de Francesc Macià", "carrer de Montserrat"],
      end: "plaça del Doctor Guardiet",
      arrival: { time: "18:00", place: "l'Escardívol" },
      url: "https://www.rubi.cat/ca/actualitat/noticies/rubi-ho-te-tot-a-punt-per-rebre-ses-majestats-els-reis-d2019orient-a-l2019escardivol",
      published: "2026-01-05",
      read: READ,
    },
    y2027: null,
    startText: {
      ca: "Cap a les 18:30, carrer de Cadmo",
      es: "Hacia las 18:30, calle de Cadmo",
      en: "About 18:30, Carrer de Cadmo",
    },
    notes: {
      ca: "La cavalcada acabava amb l'entrada dels Reis a l'església de Sant Pere. Hi havia un tram reservat d'especial accessibilitat a la rambleta de Joan Miró, davant de Rubí Forma. L'Ajuntament va publicar el programa de Nadal el 14 de novembre i el recorregut complet, el mateix 5 de gener.",
      es: "La cabalgata terminaba con la entrada de los Reyes en la iglesia de Sant Pere. Había un tramo reservado de especial accesibilidad en la rambleta de Joan Miró, frente a Rubí Forma. El Ayuntamiento publicó el programa de Navidad el 14 de noviembre y el recorrido completo, el mismo 5 de enero.",
      en: "The parade ended with the Kings entering the church of Sant Pere. There was a reserved accessible stretch on Rambleta de Joan Miró, opposite Rubí Forma. The council published the Christmas programme on 14 November and the full route on 5 January itself.",
    },
  },
  {
    key: "granollers",
    name: "Granollers",
    hosts: /(^|\.)granollers\.cat$/,
    watch: "https://www.granollers.cat/nadal/cavalcada",
    // Christmas site (reused every year; "Dilluns 5 de gener" = 2026): "Dilluns 5 de gener, 17.30 h. Carrer de
    // Lluís Companys." Route as below, "pl. Corona (aprox. 18.30 h)", "pl. Constitució (aprox. 19.30 h)", floats
    // only "fins al carrer Sant Josep"; "20 h a la Plaça de la Porxada". Same text in the programme PDF (20 Nov
    // 2025). The quiet stretch is left out: the 20 Nov 2025 press note puts it elsewhere.
    y2026: {
      date: "2026-01-05",
      time: "17:30",
      start: "carrer de Lluís Companys",
      route: ["carrer del Camp de les Moreres", "carrer de Fernao Magallanes", "carrer de Francesc Macià", "carrer d'Alfons IV", "plaça de la Corona", "carrer d'Anselm Clavé", "plaça de Maluquer i Salvador", "plaça de Perpinyà", "carrer de Joan Prim", "carrer de Ramon Llull", "carrer de Rafael Casanova", "carrer de Torras i Bages", "plaça de la Constitució", "carrer de Roger de Flor", "carrer de Sant Josep", "plaça de l'Església"],
      end: "plaça de la Porxada",
      endTime: "20:00",
      url: "https://www.granollers.cat/nadal/cavalcada",
      alsoUrl: "https://www.granollers.cat/sites/default/files/aaff_nadal2025_programa_17nov_ok_sense_creus.pdf",
      published: "2025-11-20",
      read: READ,
    },
    y2027: null,
    notes: {
      ca: "Les carrosses arribaven fins al carrer de Sant Josep; l'últim tram els Reis el feien a peu, i a les 20:00 rebien els infants a la plaça de la Porxada. L'horari previst marcava la plaça de la Corona cap a les 18:30 i la de la Constitució cap a les 19:30.",
      es: "Las carrozas llegaban hasta la calle de Sant Josep; el último tramo los Reyes lo hacían a pie, y a las 20:00 recibían a los niños en la plaza de la Porxada. El horario previsto marcaba la plaza de la Corona hacia las 18:30 y la de la Constitució hacia las 19:30.",
      en: "The floats went as far as Carrer de Sant Josep; the Kings walked the last stretch and met children in Plaça de la Porxada at 20:00. The timetable had the parade at Plaça de la Corona at about 18:30 and Plaça de la Constitució at about 19:30.",
    },
  },
  {
    key: "mollet",
    name: "Mollet del Vallès",
    hosts: /(^|\.)molletvalles\.cat$/,
    watch: "https://www.molletvalles.cat/ca/serveis/cultura/calendari-festiu/nadal-i-reis-1",
    // News, 29 Dec 2025: "arribaran un any més a l'estació de Mollet-Sant Fost a les 18.07 h i allà pujaran a les
    // carrosses"; "carrer de Berenguer III, avinguda Llibertat, Plaça Major, avinguda Burgos, avinguda Jaume I i
    // finalitzarà a l'avinguda Gaudí". Agenda: "18.07 h Sortida de l'estació de tren de Mollet-Sant Fost";
    // "Rebuda institucional ... (aprox. 19.30 h), a la pl. Major". The two quiet-stretch descriptions differ: left out.
    y2026: {
      date: "2026-01-05",
      time: "18:07",
      start: "estació de Mollet-Sant Fost",
      route: ["carrer de Berenguer III", "avinguda de la Llibertat", "plaça Major", "avinguda de Burgos", "avinguda de Jaume I"],
      end: "avinguda de Gaudí",
      url: "https://www.molletvalles.cat/ca/actualitat/noticies/cavalcada-de-reis-2026-a-mollet",
      alsoUrl: "https://www.molletvalles.cat/ca/actualitat/agenda/cavalcada-de-ssmm-els-reis-de-lorient",
      published: "2025-12-29",
      read: READ,
    },
    y2027: null,
    notes: {
      ca: "Els Reis van arribar en tren a l'estació de Mollet-Sant Fost i allà van pujar a les carrosses. Cap a les 19:30 hi havia la rebuda institucional a la plaça Major. Hi havia un espai reservat a l'avinguda de la Llibertat amb el carrer de Lluís Duran, al costat de la parada de taxis.",
      es: "Los Reyes llegaron en tren a la estación de Mollet-Sant Fost y allí subieron a las carrozas. Hacia las 19:30 había la recepción institucional en la plaza Major. Había un espacio reservado en la avenida de la Llibertat con la calle de Lluís Duran, junto a la parada de taxis.",
      en: "The Kings came by train to Mollet-Sant Fost station and boarded their floats there. The official welcome was in Plaça Major at about 19:30. There was a reserved area on Avinguda de la Llibertat at Carrer de Lluís Duran, next to the taxi rank.",
    },
  },
  /* ------------------------------------------------- Barcelonès and Llobregat */
  {
    key: "hospitalet",
    name: "L'Hospitalet de Llobregat",
    hosts: /(^|\.)l-h\.cat$/,
    watch: "https://www.l-h.cat/",
    // Christmas programme 2025-26 (PDF, p. 11, file of 18 Nov 2025): "Dilluns, 5 de gener de 2026"; "Inici del
    // recorregut a les 17.30 h des de la plaça de l'Escorça."; "Recorregut: carrer de Santa Eulàlia - carrer
    // d'Enric Prat de la Riba - carrer Major - plaça de l'Ajuntament". Christmas microsite (no year; its sibling
    // pages are 2025-26's): "17 h plaça de Francesc Macià i Llussà: els Reis seran rebuts per les autoritats
    // locals."; "19.30 h plaça de l'Ajuntament: espectacle i lliurament de la clau de la ciutat". The microsite
    // spells "Escorsa" and leaves out carrer Major: the dated PDF is followed.
    y2026: {
      date: "2026-01-05",
      time: "17:30",
      start: "plaça de l'Escorça",
      route: ["carrer de Santa Eulàlia", "carrer d'Enric Prat de la Riba", "carrer Major"],
      end: "plaça de l'Ajuntament",
      endTime: "19:30",
      arrival: { time: "17:00", place: "plaça de Francesc Macià i Llussà" },
      url: "https://l-h.cat/webs/especials/nadal/2025/docs/PROGRAMA_nadal_2025.pdf",
      alsoUrl: "https://www.l-h.cat/webs/especials/nadal/2026/3306035_1.aspx?id=1",
      published: "2025-11-18",
      read: READ,
    },
    y2027: null,
    announcedRoute: true,
    notes: {
      ca: "Les autoritats van rebre els Reis a les 17:00 a la plaça de Francesc Macià i Llussà, i a les 19:30 hi havia l'espectacle i el lliurament de la clau de la ciutat a la plaça de l'Ajuntament. Hi havia un tram de baixos estímuls al carrer d'Enric Prat de la Riba, entre els carrers del Canigó i de Batllori.",
      es: "Las autoridades recibieron a los Reyes a las 17:00 en la plaza de Francesc Macià i Llussà, y a las 19:30 había el espectáculo y la entrega de la llave de la ciudad en la plaza del Ajuntament. Había un tramo de bajos estímulos en la calle d'Enric Prat de la Riba, entre las calles del Canigó y de Batllori.",
      en: "Local officials welcomed the Kings at 17:00 in Plaça de Francesc Macià i Llussà, and at 19:30 there was a show and the handing over of the key to the city in Plaça de l'Ajuntament. There was a low-stimulus stretch on Carrer d'Enric Prat de la Riba, between Carrer del Canigó and Carrer de Batllori.",
    },
  },
  {
    key: "cornella",
    name: "Cornellà de Llobregat",
    hosts: /(^|\.)cornella\.cat$/,
    watch: "https://www.cornella.cat/ca/viure-a-cornella/cornella-humana/cultura/cultura-popular/nadal",
    // News, 29 Dec 2025 ("dilluns 05 gener 2026"): "L'arribada tindrà lloc de nou a l'avinguda de la Fama, entre
    // els carrers Tirso de Molina i l'avinguda del Maresme, a les 18 hores."; "18.35 h. Inici cavalcada a l'av. del
    // Maresme (entre avinguda de la Fama i carrer de Sant Ferran)"; route as below; "20.00 h. Ajuntament de
    // Cornellà. Parlaments"; "21.50 h. Final a la plaça de Sant Ildefons". Start and end were on the council's
    // Christmas page from 5 Dec 2025.
    y2026: {
      date: "2026-01-05",
      time: "18:35",
      start: "avinguda del Maresme",
      route: ["carrer de Sant Ferran", "carretera de l'Hospitalet", "carrer de Rubió i Ors", "carretera de Sant Joan Despí", "carrer de Mercè Rodoreda", "avinguda de Can Corts", "carretera d'Esplugues", "carrer de la Miranda", "plaça de Catalunya", "avinguda de Sant Ildefons", "avinguda de la República Argentina"],
      end: "plaça de Sant Ildefons",
      endTime: "21:50",
      arrival: { time: "18:00", place: "avinguda de la Fama" },
      url: "https://www.cornella.cat/ca/actualitat/noticies/tot-a-punt-per-al-5-de-gener-amb-larribada-dels-reis-a-cornella",
      alsoUrl: "https://www.cornella.cat/ca/viure-a-cornella/cornella-humana/cultura/cultura-popular/nadal/nadal-2025-i-reis-2026",
      published: "2025-12-29",
      read: READ,
    },
    y2027: null,
    notes: {
      ca: "Com arriben els Reis és un secret fins al moment. A les 20:00 la cavalcada parava a l'Ajuntament per als parlaments. A la carretera de Sant Joan Despí, entre el carrer de Rubió i Ors i el de Mercè Rodoreda, circulava sense música, i hi havia espais reservats per a persones amb discapacitat a l'arribada i als parlaments.",
      es: "Cómo llegan los Reyes es un secreto hasta el momento. A las 20:00 la cabalgata paraba en el Ayuntamiento para los parlamentos. En la carretera de Sant Joan Despí, entre la calle de Rubió i Ors y la de Mercè Rodoreda, circulaba sin música, y había espacios reservados para personas con discapacidad en la llegada y en los parlamentos.",
      en: "How the Kings arrive is kept secret until the moment itself. At 20:00 the parade stopped at the town hall for speeches. On Carretera de Sant Joan Despí, between Carrer de Rubió i Ors and Carrer de Mercè Rodoreda, it ran without music, and there were reserved areas for disabled people at the arrival and at the speeches.",
    },
  },
  {
    key: "sant-boi",
    name: "Sant Boi de Llobregat",
    hosts: /(^|\.)santboi\.cat$/,
    watch: "https://www.santboi.cat/nadal",
    // Viure Sant Boi, Dec 2025-Jan 2026, p. 7 (PDF of 9 Dec 2025): "5 DE GENER / De 17 a 21 h / ... Cavalcada de
    // Reis / Recorregut per la ciutat"; "Carrers sense música: avinguda Onze de Setembre entre ronda Sant Ramon i
    // Jaume Balmes i carrer de Picasso (entre carrer Girona i plaça dels Salesians)." The traffic page that gave
    // the start point is gone (404) and has no archived copy: the start point is left out.
    y2026: {
      date: "2026-01-05",
      time: "17:00",
      endTime: "21:00",
      url: "https://santboi.cat/Documents/VIURESB/2025/VSBdesembre25.pdf",
      published: "2025-12-09",
      read: READ,
    },
    y2027: null,
    startText: {
      ca: "De 17:00 a 21:00, pels carrers de la ciutat",
      es: "De 17:00 a 21:00, por las calles de la ciudad",
      en: "17:00 to 21:00, through the town",
    },
    news2027: {
      published: "2026-07-07",
      url: "https://tramits.santboi.cat/Ciutadania/DetallTramit.aspx?idioma=ca-es&IdTramit=1496",
      text: {
        ca: "L'Ajuntament ja prepara la del 2027: al juliol va convocar set subvencions per construir les carrosses de la Cavalcada de Reis 2027.",
        es: "El Ayuntamiento ya prepara la de 2027: en julio convocó siete subvenciones para construir las carrozas de la Cabalgata de Reyes 2027.",
        en: "The council is already preparing 2027's: in July it offered seven grants to build floats for the 2027 parade.",
      },
    },
    notes: {
      ca: "La web de l'Ajuntament ja no conserva el punt de sortida ni el recorregut. Hi havia trams sense música a l'avinguda de l'Onze de Setembre, entre la ronda de Sant Ramon i Jaume Balmes, i al carrer de Picasso, entre el carrer de Girona i la plaça dels Salesians.",
      es: "La web del Ayuntamiento ya no conserva el punto de salida ni el recorrido. Había tramos sin música en la avenida de l'Onze de Setembre, entre la ronda de Sant Ramon y Jaume Balmes, y en la calle de Picasso, entre la calle de Girona y la plaza dels Salesians.",
      en: "The council's website no longer keeps the starting point or the route. There were stretches without music on Avinguda de l'Onze de Setembre, between Ronda de Sant Ramon and Jaume Balmes, and on Carrer de Picasso, between Carrer de Girona and Plaça dels Salesians.",
    },
  },
  {
    key: "el-prat",
    name: "El Prat de Llobregat",
    hosts: /(^|\.)elprat\.cat$/,
    watch: "https://www.elprat.cat/canal-harshafa/larribada-dels-reis-mags-dorient",
    // News, 2 Jan 2026: "La Recepció Reial serà a les 17 h, a la pl. Catalunya."; "La desfilada començarà a les
    // 18.30 h a Sant Cosme i avançarà fins a la plaça de la Vila, on es preveu que arribi a les 20.30 h.";
    // "Recorregut: inici al c. del Riu Xúquer. A continuació, c. de la serra del Cadí, av. de Pompeu Fabra, av. del
    // Remolar, c. de Lleida, ctra. de la Marina, av. de la Verge de Montserrat, c. de Frederic Soler, c. de Ferran
    // Puig, fins arribar a la pl. de la Vila."
    y2026: {
      date: "2026-01-05",
      time: "18:30",
      start: "carrer del Riu Xúquer, Sant Cosme",
      route: ["carrer de la Serra del Cadí", "avinguda de Pompeu Fabra", "avinguda del Remolar", "carrer de Lleida", "carretera de la Marina", "avinguda de la Verge de Montserrat", "carrer de Frederic Soler", "carrer de Ferran Puig"],
      end: "plaça de la Vila",
      endTime: "20:30",
      arrival: { time: "17:00", place: "plaça de Catalunya" },
      url: "https://www.elprat.cat/actualitat/noticies/tot-punt-larriba-dels-reis-dorient",
      published: "2026-01-02",
      read: READ,
    },
    y2027: null,
    news2027: {
      published: "2026-11-02",
      url: "https://www.elprat.cat/actualitat/noticies/tagradaria-ser-patge-reial-ja-pots-presentar-la-teva-candidatura",
      text: {
        ca: "L'Ajuntament ja prepara la del 2027: els infants d'11 a 14 anys que vulguin ser patges reials poden presentar la candidatura del 2 al 30 de novembre, i el sorteig és el 15 de desembre.",
        es: "El Ayuntamiento ya prepara la de 2027: los niños de 11 a 14 años que quieran ser pajes reales pueden presentar su candidatura del 2 al 30 de noviembre, y el sorteo es el 15 de diciembre.",
        en: "The council is already preparing 2027's: children aged 11 to 14 who want to be royal pages can apply from 2 to 30 November, and the draw is on 15 December.",
      },
    },
    notes: {
      ca: "Els Reis van tenir la recepció reial a les 17:00 a la plaça de Catalunya. El tram de la plaça de Blanes fins a la carretera de la Marina estava adaptat per a persones amb sensibilitats auditives i sensorials.",
      es: "Los Reyes tuvieron la recepción real a las 17:00 en la plaza de Catalunya. El tramo de la plaza de Blanes hasta la carretera de la Marina estaba adaptado para personas con sensibilidades auditivas y sensoriales.",
      en: "The Kings' royal reception was at 17:00 in Plaça de Catalunya. The stretch from Plaça de Blanes to Carretera de la Marina was adapted for people with hearing and sensory sensitivities.",
    },
  },
  {
    key: "castelldefels",
    name: "Castelldefels",
    hosts: /(^|\.)castelldefels\.org$/,
    watch: "https://www.castelldefels.org/ca/serveis/cultura/festes/agenda-festes/reis-i-carters-reials",
    // Council agenda ("Dilluns, 05/01/2026 de 18:00 a 20:00"): "18 h Sortida del Castell de Castelldefels"; "Av.
    // Manuel Girona, Pl. Joan XXIII, Av. Manuel Girona, Plaça Colom, Plaça de Pau Casals, Av. Constitució, C. Dr
    // Ferran, C. Arcadi Balaguer i Pl. Església... prevista sobre les 20 h aproximadament". Midday arrival on
    // horseback on the beach: news of 2 Jan 2026 (no exact time).
    y2026: {
      date: "2026-01-05",
      time: "18:00",
      start: "Castell de Castelldefels",
      route: ["avinguda de Manuel Girona", "plaça de Joan XXIII", "avinguda de Manuel Girona", "plaça de Colom", "plaça de Pau Casals", "avinguda de la Constitució", "carrer del Doctor Ferran", "carrer d'Arcadi Balaguer"],
      end: "plaça de l'Església",
      endTime: "20:00",
      url: "https://www.castelldefels.org/ca/actualitat/agenda/reis-2026-cavalcada-tarda-festivitat-reis-2026",
      alsoUrl: "https://www.castelldefels.org/ca/actualitat/elcastell/noticies/reis-mags-arriben-dilluns-a-la-platja-de-castelldefels",
      published: "2026-01-02",
      read: READ,
    },
    y2027: null,
    arrivalText: {
      ca: "Al migdia, a cavall, per la platja",
      es: "A mediodía, a caballo, por la playa",
      en: "At midday, on horseback along the beach",
    },
    news2027: {
      published: "2026-10-26",
      confirmsDate: true,
      url: "https://www.castelldefels.org/ca/actualitat/elcastell/noticies/vols-participar-en-la-cavalcada-de-reis-2027-ja-pots-inscriuret",
      text: {
        ca: "L'Ajuntament ja ha confirmat que la cavalcada serà el 5 de gener de 2027: les inscripcions per participar-hi es van tancar el 9 de novembre i el sorteig és el 16.",
        es: "El Ayuntamiento ya ha confirmado que la cabalgata será el 5 de enero de 2027: las inscripciones para participar se cerraron el 9 de noviembre y el sorteo es el 16.",
        en: "The council has already confirmed the parade for 5 January 2027: applications to take part closed on 9 November and the draw is on the 16th.",
      },
    },
    notes: {
      ca: "Al migdia els Reis van arribar a cavall per la sorra de la platja, des de l'avinguda de la República Argentina. A l'avinguda de la Constitució, entre els carrers de Juan de la Cierva i d'Isaac Peral, hi havia un tram de baixos estímuls amb un espai de calma.",
      es: "A mediodía los Reyes llegaron a caballo por la arena de la playa, desde la avenida de la República Argentina. En la avenida de la Constitució, entre las calles de Juan de la Cierva y de Isaac Peral, había un tramo de bajos estímulos con un espacio de calma.",
      en: "At midday the Kings rode in on horseback along the sand from Avinguda de la República Argentina. On Avinguda de la Constitució, between Carrer de Juan de la Cierva and Carrer d'Isaac Peral, there was a low-stimulus stretch with a calm area.",
    },
  },
  /* -------------------------------------------- Central Catalonia and Girona */
  {
    key: "manresa",
    name: "Manresa",
    hosts: /(^|\.)manresa\.cat$/,
    watch: "https://web.manresa.cat/web/noticies",
    // News, 2 Jan 2026: "a partir de les 18.15 h i fins a les 21 h"; "Sortida des del Pont Vell (Ctra. C-1411z)";
    // route as below; "Finalització a la plaça Major"; "s'habilitarà un tram tranquil al carrer Infants". News of
    // 17 Dec 2025: "El dilluns 5 de gener a un quart de 7 de la tarda, Melcior, Gaspar i Baltasar arribaran pel Pont
    // Vell" (it ended the parade at plaça Europa; the 2 Jan list, with the traffic changes, is followed).
    y2026: {
      date: "2026-01-05",
      time: "18:15",
      start: "Pont Vell",
      route: ["carrer de Sant Marc", "via de Sant Ignasi", "avinguda de Bertrand i Serra", "carretera del Pont de Vilomara", "plaça de Bonavista", "passeig de Pere III", "muralla de Sant Domènec", "muralla del Carme", "carretera de Vic", "carrer dels Infants", "plaça dels Infants", "carrer del Joc de la Pilota", "carrer de Sobrerroca"],
      end: "plaça Major",
      endTime: "21:00",
      url: "https://web.manresa.cat/web/noticies/13601",
      alsoUrl: "https://web.manresa.cat/web/noticies/13589",
      published: "2026-01-02",
      read: READ,
    },
    y2027: null,
    notes: {
      ca: "Els Reis van entrar a la ciutat pel Pont Vell. Hi havia un tram tranquil al carrer dels Infants i un espai reservat a la plaça Major, amb interpretació en llengua de signes.",
      es: "Los Reyes entraron en la ciudad por el Pont Vell. Había un tramo tranquilo en la calle dels Infants y un espacio reservado en la plaza Major, con interpretación en lengua de signos.",
      en: "The Kings entered the city over the Pont Vell (the old bridge). There was a quiet stretch on Carrer dels Infants and a reserved area in Plaça Major, with sign-language interpretation.",
    },
  },
  {
    key: "vic",
    name: "Vic",
    hosts: /(^|\.)vic\.cat$/,
    watch: "https://www.vic.cat/ajuntament/comunicacio-i-protocol/noticies",
    // Christmas programme 2025-26 (PDF; 5 Jan marked "DLL", Monday): "arribarà a la ciutat a les 6 de la tarda pel
    // Pg. de la Generalitat"; "A 2/4 de 9 del vespre la Cavalcada entrarà a la Plaça Major"; route as below, also in
    // the mobility note of 2 Jan 2026. The council's yearless "cavalcada de reis" page describes the 2025 edition
    // (its weekdays are 2024's): not used.
    y2026: {
      date: "2026-01-05",
      time: "18:00",
      start: "passeig de la Generalitat",
      route: ["parc de Jaume Balmes", "carrer d'Anselm Clavé", "carrer de la Soledat", "carrer de l'Hospital d'en Cloquer", "carrer del Molí d'en Saborit", "carrer de Francesc M. Masferrer", "carrer del Bisbe Torras i Bages", "plaça de Santa Teresa", "rambla del Passeig", "plaça de Santa Clara", "rambla del Carme", "rambla de les Davallades", "rambla de l'Hospital", "carrer del Doctor Junyent", "carrer de Mossèn Josep Gudiol", "plaça de l'Estació", "carrer de Jacint Verdaguer"],
      end: "plaça Major",
      endTime: "20:30",
      url: "https://www.vic.cat/fitxers/ajv-fulleto-digital.pdf",
      alsoUrl: "https://www.vic.cat/ajuntament/comunicacio-i-protocol/noticies/canvis-en-la-mobilitat-a-vic-amb-motiu-de-la-cavalcada-de-reis-1",
      published: "2025-12-12",
      read: READ,
    },
    y2027: null,
    news2027: {
      published: "2026-10-19",
      url: "https://www.vic.cat/ajuntament/comunicacio-i-protocol/noticies/ja-estan-obertes-les-inscripcions-per-a-participar-a-la-cavalcada-de-reis-2027",
      text: {
        ca: "L'Ajuntament ja prepara la del 2027: les inscripcions per participar-hi estan obertes del 19 d'octubre al 30 de desembre de 2026.",
        es: "El Ayuntamiento ya prepara la de 2027: las inscripciones para participar están abiertas del 19 de octubre al 30 de diciembre de 2026.",
        en: "The council is already preparing 2027's: applications to take part are open from 19 October to 30 December 2026.",
      },
    },
    notes: {
      ca: "Cap a dos quarts de nou del vespre la cavalcada entrava a la plaça Major, on l'alcalde rebia els Reis. Hi havia dos trams inclusius: un espai de calma al carrer del Molí d'en Saborit i primera fila per a persones amb mobilitat reduïda a la plaça de Santa Teresa.",
      es: "Hacia las ocho y media de la tarde la cabalgata entraba en la plaza Major, donde el alcalde recibía a los Reyes. Había dos tramos inclusivos: un espacio de calma en la calle del Molí d'en Saborit y primera fila para personas con movilidad reducida en la plaza de Santa Teresa.",
      en: "At about 20:30 the parade entered Plaça Major, where the mayor welcomed the Kings. There were two inclusive stretches: a calm area on Carrer del Molí d'en Saborit and a front row for people with reduced mobility in Plaça de Santa Teresa.",
    },
  },
  {
    key: "figueres",
    name: "Figueres",
    hosts: /(^|\.)figueres\.cat$/,
    watch: "https://www.figueres.cat/actualitat/nadal-a-figueres-1/cavalcada-de-reis",
    guide: "figueres",
    // Council page (created 29 Dec 2025; "dilluns 5 de gener" only fits 2026, and its mobility page says "5 de
    // gener de 2026"): "sortida a les set del vespre al carrer Borrassà (Creu de la Mà) i arribada dels Reis Mags a
    // la plaça de l'Ajuntament, a quarts de nou". The route is left out: the mobility page lists plaça Catalunya
    // where the information page has carrer Castelló.
    y2026: {
      date: "2026-01-05",
      time: "19:00",
      start: "carrer Borrassà, Creu de la Mà",
      end: "plaça de l'Ajuntament",
      url: "https://www.figueres.cat/actualitat/nadal-a-figueres-1/cavalcada-de-reis/informacio",
      alsoUrl: "https://www.figueres.cat/actualitat/nadal-a-figueres-1/cavalcada-de-reis/afectacions-de-mobilitat",
      published: "2025-12-29",
      read: READ,
    },
    y2027: null,
    notes: {
      ca: "La cavalcada baixava per la Rambla, i els Reis feien a peu la Rambla de dalt i el carrer de Girona fins a la plaça de l'Ajuntament, on arribaven a quarts de nou del vespre, rebien la clau i parlaven des del balcó. Hi havia una grada adaptada a la Rambla, amb inscripció prèvia, i una zona de baixos estímuls a la plaça del Gra.",
      es: "La cabalgata bajaba por la Rambla, y los Reyes hacían a pie la parte alta de la Rambla y la calle de Girona hasta la plaza del Ajuntament, adonde llegaban sobre las ocho y media de la tarde, recibían la llave y hablaban desde el balcón. Había una grada adaptada en la Rambla, con inscripción previa, y una zona de bajos estímulos en la plaza del Gra.",
      en: "The parade came down the Rambla, and the Kings walked the top of the Rambla and Carrer de Girona to Plaça de l'Ajuntament, arriving at about half past eight, receiving the key and speaking from the balcony. There was an adapted stand on the Rambla, by prior registration, and a low-stimulus area in Plaça del Gra.",
    },
  },
];

/** Towns we tried and could not read on the council's own site: the page says why they are missing. */
export const REIS_TOWNS_LEFT_OUT: readonly { name: string; watch: string; reason: Record<Locale, string> }[] = [
  {
    // gramenet.cat (read through a translation proxy) keeps only a video on its 2025-26 parade page; the news
    // archive has no parade article for Dec 2025-Jan 2026. Only the date is on a council page (a 2025 contract
    // for "la cavalcada de reis del 5 de gener de 2026"). The 2025 edition's details are not printed as 2026's.
    name: "Santa Coloma de Gramenet",
    watch: "https://ajuntamentinforma.gramenet.cat/les-noticies/",
    reason: {
      ca: "Santa Coloma de Gramenet no hi és perquè la web de l'Ajuntament ja no conserva l'horari ni el recorregut del 2026.",
      es: "Santa Coloma de Gramenet no está porque la web del Ayuntamiento ya no conserva el horario ni el recorrido de 2026.",
      en: "Santa Coloma de Gramenet is missing because its council's website no longer keeps the 2026 times or route.",
    },
  },
  {
    // www.viladecans.cat answered every request (plain, browser user agent, translation and reader proxies)
    // with a bot challenge, and has no archived copy. Search snippets are not a source.
    name: "Viladecans",
    watch: "https://www.viladecans.cat/es/navidad-y-reyes",
    reason: {
      ca: "Viladecans tampoc, perquè la seva web no s'ha pogut consultar.",
      es: "Viladecans tampoco, porque su web no se ha podido consultar.",
      en: "Nor is Viladecans, whose website could not be read.",
    },
  },
  {
    // vilanova.cat/cavalcada_de_reis gives a time and a route ("El dia 5 de gener, a les 18.30h surten del Castell")
    // but no year or weekday, and no dated council page of Dec 2025-Jan 2026 confirms it: it cannot be labelled 2026.
    name: "Vilanova i la Geltrú",
    watch: "https://www.vilanova.cat/cavalcada_de_reis",
    reason: {
      ca: "I Vilanova i la Geltrú només publica una pàgina de la cavalcada sense data, de manera que no podem dir que sigui la del 2026.",
      es: "Y Vilanova i la Geltrú solo publica una página de la cabalgata sin fecha, así que no podemos decir que sea la de 2026.",
      en: "And Vilanova i la Geltrú only publishes an undated parade page, so we cannot say it describes 2026.",
    },
  },
];

/** Why a row cannot be printed, or nothing when it can (the 2027 slot is checked by reis.ts paradeProblems()). */
export function townRowProblems(town: ReisTown): string[] {
  const problems: string[] = [];
  const p = town.y2026;
  const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (p.date !== "2026-01-05") problems.push(`${town.name}: the 2026 row is dated ${p.date}`);
  if (!hhmm.test(p.time)) problems.push(`${town.name}: time ${p.time} is not HH:MM`);
  if (p.start === undefined && !town.startText) problems.push(`${town.name}: no start and no startText`);
  if (town.startText && !town.startText.ca.includes(p.time.replace(/^0/, ""))) problems.push(`${town.name}: startText does not carry the start time`);
  if (p.endTime !== undefined && !hhmm.test(p.endTime)) problems.push(`${town.name}: end time ${p.endTime} is not HH:MM`);
  if (p.arrival?.time !== undefined && !hhmm.test(p.arrival.time)) problems.push(`${town.name}: arrival time ${p.arrival.time} is not HH:MM`);
  for (const name of [p.start, p.end, p.arrival?.place, ...(p.route ?? [])]) {
    if (name !== undefined && !name.trim()) problems.push(`${town.name}: an empty place name`);
  }
  if (p.published !== undefined && (!iso.test(p.published) || p.published > p.date)) problems.push(`${town.name}: published ${p.published} is not a day before the parade`);
  if (!iso.test(p.read) || p.read > REIS_TOWNS_AS_OF) problems.push(`${town.name}: read ${p.read} is not a day on or before REIS_TOWNS_AS_OF`);
  const urls = [p.url, ...(p.alsoUrl ? [p.alsoUrl] : []), town.watch, ...(town.news2027 ? [town.news2027.url] : [])];
  for (const href of urls) {
    try {
      const url = new URL(href);
      if (url.protocol !== "https:") problems.push(`${href} is not https`);
      if (!town.hosts.test(url.host)) problems.push(`${town.name}: ${url.host} is not the council's own site`);
      if (/[?&]utm_/.test(href)) problems.push(`${href} carries tracking`);
    } catch {
      problems.push(`${town.name}: ${href} is not a URL`);
    }
  }
  if (town.news2027 && town.news2027.published > REIS_TOWNS_AS_OF) problems.push(`${town.name}: 2027 news after REIS_TOWNS_AS_OF`);
  return problems;
}

/** The last checkpoint `today` has reached, or null before the first. */
export function rereadDue(today: string): string | null {
  const passed = REIS_REREAD_BY.filter((day) => today >= day);
  return passed.length ? passed[passed.length - 1]! : null;
}
