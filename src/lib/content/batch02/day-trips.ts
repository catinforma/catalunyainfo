import { link } from "@/lib/content/features/shared";

import {
  b2Related,
  b2link,
  callout,
  h2,
  h3,
  lead,
  list,
  paras,
  verifiedLine,
  type B2Article,
} from "./shared";

/**
 * Day trips from Barcelona: Girona by train, Montserrat without a tour, and
 * Cerdanya without a car.
 *
 * ## What is deliberately missing from all three
 *
 * **Timetables and fares.** Renfe, FGC and the bus operators change both, and
 * a travel page that hard-codes a departure time is wrong within months and
 * silently costs somebody a connection. Every one of these says what the
 * service is and sends the reader to the operator for the day they travel.
 *
 * The Montserrat piece also drops two figures the editorial package supplied.
 * The rack railway's height gain was given as "more than 600 metres"; the
 * line climbs from Monistrol de Montserrat to the monastery, which is closer
 * to 540, and no operator page states 600. The service frequencies were given
 * as roughly every 20 minutes for the rack railway and every 15 for the cable
 * car; neither operator publishes a fixed headway, because both vary by
 * season. What is verified — about five kilometres, about fifteen minutes, and
 * a five-minute cable-car ascent — is published; the rest is not.
 */

/* ========================================================================== */
/* 04 — Girona                                                                */
/* ========================================================================== */

const GIRONA_SOURCES = [
  {
    name: "Girona, què visitar",
    url: "https://www.girona.cat/turisme/cat/quevisitar.php",
    publisher: "Ajuntament de Girona — Turisme",
  },
  {
    name: "Cerca d'horaris i bitllets",
    url: "https://www.renfe.com/es/es",
    publisher: "Renfe",
  },
];

const GIRONA_VERIFIED = "2026-09-29";

export const GIRONA: B2Article = {
  key: "girona",
  entryKey: "daytrip-girona-from-barcelona",
  categoryKey: "coast",
  sources: GIRONA_SOURCES,
  heroKey: "b2-girona-cases-onyar",
  heroAlt: {
    ca: "Les cases de colors sobre el riu Onyar, a Girona",
    es: "Las casas de colores sobre el río Onyar, en Girona",
    en: "The colourful houses above the Onyar river in Girona",
  },
  heroCaption: {
    ca: "Les cases de l'Onyar són el primer que es veu en creuar cap al Barri Vell.",
    es: "Las casas del Onyar son lo primero que se ve al cruzar hacia el Barri Vell.",
    en: "The Onyar houses are the first thing you see crossing into the old town.",
  },
  verifiedAt: GIRONA_VERIFIED,
  publishedAt: "2026-09-29T11:30:00+02:00",
  editions: {
    ca: {
      path: "escapades/girona-des-de-barcelona-tren",
      title: "Girona des de Barcelona en tren: què veure en una escapada d'un dia",
      seoTitle: "Girona des de Barcelona en tren: ruta d'un dia",
      seoDescription:
        "Ruta d'un dia per Girona des de Barcelona en tren: cases de l'Onyar, Call jueu, Catedral, Banys Àrabs i muralles.",
      excerpt:
        "L'estació és al centre i hi ha línia convencional i alta velocitat. Una ruta d'un dia pel Barri Vell, sense cotxe.",
      blocks: [
        lead(
          "Girona és una de les escapades més fàcils de fer des de Barcelona sense cotxe perquè l'estació és al centre de la ciutat i disposa tant de línia convencional com d'alta velocitat.",
        ),
        ...paras("No cal intentar veure-ho tot."),
        ...paras(
          "Una jornada ben plantejada pot concentrar-se en la ciutat històrica, que conserva més de **2.000 anys d'història** entre la Força Vella i l'eixample medieval.",
        ),
        ...h2("Ruta d'un dia"),
        ...h3(
          "1. Cases de l'Onyar",
          "Comença travessant el riu i entrant progressivament al Barri Vell.",
        ),
        ...h3("2. Call jueu", "Recorre els carrers estrets de l'antic barri jueu."),
        ...h3("3. Catedral", "Continua cap a l'entorn monumental de la Catedral."),
        ...h3(
          "4. Banys Àrabs i Sant Pere de Galligants",
          "Són dos dels punts patrimonials més destacats del sector nord del Barri Vell.",
        ),
        ...h3(
          "5. Muralles",
          "Si tens temps i la meteorologia acompanya, incorpora una passejada pel recorregut de muralles.",
        ),
        ...h3(
          "6. Rambla de la Llibertat i centre",
          "Acaba de nou a la part baixa del nucli antic abans de tornar cap a l'estació.",
        ),
        ...paras(
          "L'Oficina de Turisme de Girona identifica entre els grans elements històrics la Catedral, Sant Pere de Galligants, els Banys Àrabs, la basílica de Sant Feliu, el Call i les muralles.",
        ),
        ...h2(
          "El tren",
          "Consulta sempre horari i preu a Renfe abans de viatjar. Girona té serveis convencionals, regionals, nacionals i d'alta velocitat.",
        ),
        callout(
          "info",
          "Per què no publiquem horaris",
          "Els horaris i els preus ferroviaris canvien diverses vegades l'any. Una pàgina que els fixa és falsa al cap de pocs mesos, i qui se la creu perd un tren. Mira-ho a l'operador per al dia concret.",
        ),
        ...paras(
          `Si t'agraden les escapades sense cotxe, tenim ${link("trains", "ca", "dotze escapades per Catalunya que pots fer en tren")} i ${b2link("montserratFree", "ca", "com anar a Montserrat per lliure")}.`,
        ),
        ...paras(verifiedLine("ca", GIRONA_VERIFIED)),
        ...b2Related(["montserratFree", "cerdanya", "ripolles"], "ca"),
      ],
    },

    es: {
      path: "escapadas/girona-desde-barcelona-tren",
      title: "Girona desde Barcelona en tren: itinerario para una escapada de un día",
      seoTitle: "Girona desde Barcelona en tren: ruta de un día",
      seoDescription:
        "Itinerario de un día por Girona desde Barcelona en tren: casas del Onyar, Call judío, Catedral, Baños Árabes y murallas.",
      excerpt:
        "La estación está en pleno centro y hay línea convencional y alta velocidad. Un día basta para el Barri Vell.",
      blocks: [
        lead(
          "La estación de Girona está en pleno centro y forma parte tanto de la red convencional como de la línea de alta velocidad.",
        ),
        ...paras("Un día permite recorrer lo esencial del Barri Vell sin necesidad de coche."),
        ...h2("Itinerario recomendado"),
        list(
          "**Casas del Onyar** — cruza el río y entra al Barri Vell.",
          "**Call judío** — las calles estrechas del antiguo barrio judío.",
          "**Catedral** — el entorno monumental.",
          "**Baños Árabes**",
          "**Sant Pere de Galligants**",
          "**Murallas** — si el tiempo acompaña.",
          "**Rambla de la Llibertat** — vuelta al centro antes de la estación.",
        ),
        ...paras(
          "El centro histórico permite recorrer más de dos mil años de historia y reúne algunos de los principales monumentos de la ciudad.",
          "La Oficina de Turismo de Girona identifica entre los grandes elementos históricos la Catedral, Sant Pere de Galligants, los Baños Árabes, la basílica de Sant Feliu, el Call y las murallas.",
        ),
        ...h2(
          "Cómo repartir el día",
          "No hace falta intentar verlo todo. Una jornada bien planteada se concentra en la ciudad histórica: se cruza el Onyar, se entra al Barri Vell y se sube progresivamente hacia la Catedral.",
          "Los Baños Árabes y Sant Pere de Galligants quedan en el sector norte del casco antiguo, de modo que encajan de forma natural después de la Catedral.",
          "Si queda tiempo y el tiempo acompaña, el recorrido por las murallas es el mejor cierre antes de bajar de nuevo hacia la Rambla de la Llibertat y la estación.",
        ),
        ...h2("El tren"),
        callout(
          "info",
          "Por qué no publicamos horarios",
          "Los horarios y precios ferroviarios cambian varias veces al año. Consúltalos en Renfe para la fecha concreta en lugar de fiarte de un horario copiado en un blog.",
        ),
        ...paras(
          `Más escapadas sin coche: ${link("trains", "es", "doce escapadas en tren")} y ${b2link("montserratFree", "es", "Montserrat por libre")}.`,
        ),
        ...paras(verifiedLine("es", GIRONA_VERIFIED)),
        ...b2Related(["montserratFree", "cerdanya", "ripolles"], "es"),
      ],
    },

    en: {
      path: "day-trips/girona-from-barcelona-by-train",
      title: "Girona from Barcelona by train: an easy independent day trip",
      seoTitle: "Girona from Barcelona by train: a one-day route",
      seoDescription:
        "A practical one-day route through Girona from Barcelona by train: Onyar houses, Jewish Quarter, Cathedral, Arab Baths and the city walls.",
      excerpt:
        "The station is in the centre and served by conventional and high-speed rail. One day covers the old town.",
      blocks: [
        lead(
          "Girona is particularly suited to an independent day trip because its railway station is in the city centre and is served by both conventional and high-speed rail.",
        ),
        ...h2("A practical route"),
        list(
          "**Onyar houses** — cross the river into the old town.",
          "**Jewish Quarter**",
          "**Cathedral**",
          "**Arab Baths**",
          "**Sant Pere de Galligants**",
          "**City walls** — if the weather allows.",
          "**Rambla de la Llibertat** — back towards the station.",
        ),
        ...paras(
          "Girona's historic centre spans more than two thousand years and includes Roman, medieval and later layers of the city.",
          "Girona's tourist office lists the Cathedral, Sant Pere de Galligants, the Arab Baths, the basilica of Sant Feliu, the Jewish Quarter and the city walls among the major historic sites.",
        ),
        ...h2(
          "How to pace the day",
          "There is no need to try to see everything. A well-planned day concentrates on the historic city: cross the Onyar, walk into the Barri Vell, and climb gradually towards the Cathedral.",
          "The Arab Baths and Sant Pere de Galligants sit in the northern part of the old town, so they follow the Cathedral naturally.",
          "If you have time and the weather holds, the walk along the city walls is the best way to finish before dropping back down to the Rambla de la Llibertat and the station.",
        ),
        ...h2("Trains"),
        callout(
          "info",
          "Why there are no times on this page",
          "Check current train times and fares with Renfe rather than relying on static travel-blog schedules. They change several times a year.",
        ),
        ...paras(
          `More car-free trips: ${link("trains", "en", "twelve day trips by train")} and ${b2link("montserratFree", "en", "Montserrat without a tour")}.`,
        ),
        ...paras(verifiedLine("en", GIRONA_VERIFIED)),
        ...b2Related(["montserratFree", "cerdanya", "ripolles"], "en"),
      ],
    },
  },
};

/* ========================================================================== */
/* 05 — Montserrat without a tour                                             */
/* ========================================================================== */

const MONTSERRAT_SOURCES = [
  {
    name: "Cremallera de Montserrat",
    url: "https://www.cremallerademontserrat.cat/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Aeri de Montserrat",
    url: "https://www.aeridemontserrat.com/",
    publisher: "Aeri de Montserrat",
  },
  {
    name: "Xarxa FGC — línia Llobregat-Anoia",
    url: "https://www.fgc.cat/xarxa-fgc/l-llobregat-anoia/monistrol-de-montserrat-tren/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
];

const MONTSERRAT_VERIFIED = "2026-09-29";

export const MONTSERRAT_FREE: B2Article = {
  key: "montserratFree",
  entryKey: "daytrip-montserrat-without-tour",
  categoryKey: "mountain",
  sources: MONTSERRAT_SOURCES,
  heroKey: "b2-montserrat-cremallera",
  heroAlt: {
    ca: "Dos trens del cremallera de Montserrat a l'estació de Monistrol-Vila",
    es: "Dos trenes del cremallera de Montserrat en la estación de Monistrol-Vila",
    en: "Two Montserrat rack-railway trains at Monistrol-Vila station",
  },
  heroCaption: {
    ca: "El cremallera enllaça a Monistrol i puja a la muntanya en uns quinze minuts.",
    es: "El cremallera enlaza en Monistrol y sube a la montaña en unos quince minutos.",
    en: "The rack railway connects at Monistrol and climbs the mountain in about fifteen minutes.",
  },
  verifiedAt: MONTSERRAT_VERIFIED,
  publishedAt: "2026-09-29T11:40:00+02:00",
  editions: {
    ca: {
      path: "escapades/montserrat-per-lliure-des-barcelona",
      title:
        "Montserrat per lliure des de Barcelona: tren, cremallera o aeri i com organitzar el dia",
      seoTitle: "Montserrat per lliure: tren, cremallera o aeri",
      seoDescription:
        "Com anar a Montserrat pel teu compte des de Barcelona: tren FGC des de Plaça Espanya i l'elecció entre cremallera i aeri.",
      excerpt:
        "No cal excursió organitzada. Tren des de Plaça Espanya i després cremallera o aeri, segons el que prefereixis.",
      blocks: [
        lead("No és necessari contractar una excursió organitzada per visitar Montserrat."),
        ...paras(
          "Des de Plaça Espanya surten trens d'FGC de la línia R5 cap a la muntanya. Després s'ha d'escollir entre **cremallera** i **aeri** per completar l'ascens.",
        ),
        ...h2(
          "Cremallera",
          "L'enllaç es fa a **Monistrol de Montserrat**.",
          "El cremallera recorre uns cinc quilòmetres i el trajecte dura aproximadament **15 minuts**.",
        ),
        ...h2(
          "Aeri",
          "L'aeri completa l'ascens en uns **cinc minuts**.",
          "La decisió no és tant «quin és millor» com quina experiència prefereixes: la pujada en cremallera és progressiva i la de l'aeri és una vista vertical de cop.",
        ),
        callout(
          "warning",
          "Freqüències i horaris",
          "Ni el cremallera ni l'aeri publiquen una freqüència fixa tot l'any: varia per temporada i per dia. Consulta l'horari de la teva data als operadors abans de sortir.",
        ),
        ...h2("Què fer a dalt?"),
        ...paras("Una primera visita pot combinar:"),
        list(
          "el recinte del santuari;",
          "la basílica;",
          "l'entorn de la Moreneta, segons el tipus d'entrada;",
          "el museu, si t'interessa;",
          "Santa Cova o Sant Joan, segons el temps i el servei;",
          "una caminada curta si la meteorologia és adequada.",
        ),
        ...paras(
          "FGC ofereix productes combinats com TransMontserrat i TotMontserrat, que agrupen el transport i alguns serveis de dalt.",
          "Els horaris, serveis i preus poden variar segons la temporada; abans de sortir, revisa sempre els operadors oficials.",
        ),
        ...paras(
          `Si busques alternatives menys concorregudes, tenim ${link("montserrat", "ca", "deu escapades des de Barcelona que no són Montserrat")}.`,
        ),
        ...paras(verifiedLine("ca", MONTSERRAT_VERIFIED)),
        ...b2Related(["girona", "cerdanya", "transport"], "ca"),
      ],
    },

    es: {
      path: "escapadas/montserrat-por-libre-desde-barcelona",
      title: "Montserrat por libre desde Barcelona: tren, cremallera o teleférico",
      seoTitle: "Montserrat por libre: tren, cremallera o teleférico",
      seoDescription:
        "Cómo ir a Montserrat por tu cuenta desde Barcelona: tren FGC desde Plaça Espanya y la elección entre cremallera y Aeri.",
      excerpt:
        "No hace falta excursión organizada. Tren desde Plaça Espanya y después cremallera o Aeri.",
      blocks: [
        lead(
          "Desde Plaça Espanya, la línea R5 de FGC conecta Barcelona con las estaciones donde se enlaza con el cremallera o el Aeri de Montserrat.",
        ),
        ...h2(
          "Cremallera",
          "El **cremallera** recorre unos cinco kilómetros desde Monistrol y el trayecto dura unos **15 minutos**.",
        ),
        ...h2("Aeri", "El **Aeri** completa la subida en unos **cinco minutos**."),
        callout(
          "warning",
          "Frecuencias y horarios",
          "Ninguno de los dos publica una frecuencia fija todo el año: varía por temporada. Consulta el horario de tu fecha en los operadores.",
        ),
        ...h2(
          "Cremallera o Aeri: cómo elegir",
          "La decisión no es tanto cuál es mejor como qué experiencia prefieres. La subida en cremallera es progresiva y permite ver cómo cambia el paisaje; la del Aeri es una vista vertical de golpe, en pocos minutos.",
          "También influye desde dónde llegas: el cremallera enlaza en Monistrol de Montserrat y el Aeri tiene su propia parada en la línea.",
        ),
        ...h2("Qué hacer arriba"),
        ...paras("Una primera visita puede combinar:"),
        list(
          "el recinto del santuario;",
          "la basílica;",
          "el entorno de la Moreneta, según el tipo de entrada;",
          "el museo, si te interesa;",
          "Santa Cova o Sant Joan, según el tiempo y el servicio;",
          "un paseo corto si la meteorología acompaña.",
        ),
        ...paras(
          "FGC ofrece productos combinados como TransMontserrat y TotMontserrat, que agrupan el transporte y algunos servicios de arriba.",
          "Los horarios, servicios y precios pueden variar según la temporada; antes de salir, revisa siempre los operadores oficiales.",
        ),
        ...paras(
          `Si buscas alternativas menos concurridas: ${link("montserrat", "es", "diez escapadas que no son Montserrat")}.`,
        ),
        ...paras(verifiedLine("es", MONTSERRAT_VERIFIED)),
        ...b2Related(["girona", "cerdanya", "transport"], "es"),
      ],
    },

    en: {
      path: "day-trips/montserrat-without-a-tour-from-barcelona",
      title: "Montserrat without a tour: how to get there independently from Barcelona",
      seoTitle: "Montserrat without a tour: train, rack railway or cable car",
      seoDescription:
        "How to reach Montserrat independently from Barcelona: the FGC R5 from Plaça Espanya, then the rack railway or the Aeri cable car.",
      excerpt:
        "No organised tour needed. Train from Plaça Espanya, then the rack railway or the cable car.",
      blocks: [
        lead("You do not need an organised tour to visit Montserrat."),
        ...paras(
          "FGC's R5 service runs from Barcelona Plaça Espanya towards the mountain, where you can connect with either the **rack railway** or the **Aeri cable car**.",
        ),
        ...h2(
          "Rack railway",
          "The rack railway climbs about five kilometres from Monistrol and the journey takes roughly **15 minutes**.",
        ),
        ...h2("Cable car", "The cable-car ascent takes roughly **five minutes**."),
        callout(
          "warning",
          "Frequencies and timetables",
          "Neither operator publishes a fixed year-round headway; both vary by season. Check the timetable for your date before you set out.",
        ),
        ...h2(
          "Rack railway or cable car?",
          "The useful question is not simply which is better, but which ascent you would rather experience. The rack railway climbs gradually and lets you watch the landscape change; the cable car gives you the vertical view all at once, in a few minutes.",
          "Where you join also matters: the rack railway connects at Monistrol de Montserrat, and the cable car has its own stop on the line.",
        ),
        ...h2("What to do up there"),
        ...paras("A first visit can combine:"),
        list(
          "the sanctuary precinct;",
          "the basilica;",
          "the Moreneta, depending on your ticket;",
          "the museum, if it interests you;",
          "Santa Cova or Sant Joan, depending on time and service;",
          "a short walk if the weather allows.",
        ),
        ...paras(
          "Combined products such as TransMontserrat and TotMontserrat are available through FGC, bundling the transport with some of the services on the mountain.",
          "Timetables, services and prices vary by season, so check the operators before you set out.",
        ),
        ...paras(
          `For quieter alternatives: ${link("montserrat", "en", "ten Barcelona day trips that are not Montserrat")}.`,
        ),
        ...paras(verifiedLine("en", MONTSERRAT_VERIFIED)),
        ...b2Related(["girona", "cerdanya", "transport"], "en"),
      ],
    },
  },
};

/* ========================================================================== */
/* 08 — Cerdanya without a car                                                */
/* ========================================================================== */

const CERDANYA_SOURCES = [
  {
    name: "Com arribar a la Cerdanya",
    url: "https://www.turismecerdanya.com/",
    publisher: "Turisme Cerdanya",
  },
  {
    name: "Rodalies de Catalunya — línia R3",
    url: "https://rodalies.gencat.cat/ca/inici/",
    publisher: "Rodalies de Catalunya",
  },
];

const CERDANYA_VERIFIED = "2026-09-29";

export const CERDANYA: B2Article = {
  key: "cerdanya",
  entryKey: "guide-cerdanya-without-car",
  categoryKey: "mountain",
  sources: CERDANYA_SOURCES,
  heroKey: "b2-cerdanya-puigcerda",
  heroAlt: {
    ca: "Vista de Puigcerdà, a la Cerdanya",
    es: "Vista de Puigcerdà, en la Cerdanya",
    en: "A view of Puigcerdà, in Cerdanya",
  },
  heroCaption: {
    ca: "Puigcerdà té estació de tren i servei urbà: és la base més pràctica sense cotxe.",
    es: "Puigcerdà tiene estación de tren y servicio urbano: es la base más práctica sin coche.",
    en: "Puigcerdà has a station and a local bus network, which makes it the practical car-free base.",
  },
  verifiedAt: CERDANYA_VERIFIED,
  publishedAt: "2026-09-29T11:50:00+02:00",
  editions: {
    ca: {
      path: "guies/cerdanya-sense-cotxe",
      title: "Cerdanya sense cotxe: què es pot fer realment amb tren i transport públic",
      seoTitle: "Cerdanya sense cotxe: tren R3, busos i què és realista",
      seoDescription:
        "Què es pot visitar de la Cerdanya sense cotxe: la línia R3, els busos regulars, Puigcerdà com a base i el Bus Blanc d'hivern.",
      excerpt:
        "Es pot anar a la Cerdanya sense cotxe, però cal planificar-ho diferent. Què sí és realista i què no.",
      blocks: [
        lead("Anar a la Cerdanya sense cotxe és possible, però cal planificar-la de manera diferent."),
        ...paras(
          "La línia **R3** connecta Barcelona amb la Cerdanya passant per Vic i Ripoll, i alguns serveis continuen fins a la Tor de Querol. També hi ha serveis regulars d'autobús des de Barcelona, la Seu d'Urgell i Lleida, i des de Girona via Olot i Ripoll.",
        ),
        ...h2(
          "Puigcerdà és la base més fàcil",
          "Puigcerdà disposa d'estació ferroviària i servei urbà de proximitat que connecta el centre amb diferents equipaments.",
          "Per a una escapada sense vehicle, és més pràctic dormir en un nucli amb transport que intentar replicar una ruta de cotxe.",
        ),
        ...h2(
          "La Molina",
          "L'R3 també permet plantejar una escapada ferroviària vinculada a La Molina segons el servei vigent.",
        ),
        ...h2(
          "Temporada de neu",
          "Turisme Cerdanya informa també del **Bus Blanc**, que durant la temporada de neu dona servei cap a La Molina i Masella.",
          "Els horaris canvien cada temporada: comprova'ls abans de comptar-hi.",
        ),
        callout(
          "warning",
          "Què no et prometrem",
          "No direm que «tota la Cerdanya es pot visitar fàcilment sense cotxe». Molts pobles, rutes i espais naturals hi tenen connexions limitades. La utilitat d'aquesta guia és precisament explicar què sí és realista.",
        ),
        ...paras(
          `Si vols més escapades ferroviàries, mira ${link("trains", "ca", "dotze escapades en tren")}, i si el destí és el Pirineu oriental, ${b2link("ripolles", "ca", "la guia del Ripollès")}.`,
        ),
        ...paras(verifiedLine("ca", CERDANYA_VERIFIED)),
        ...b2Related(["ripolles", "snow", "girona"], "ca"),
      ],
    },

    es: {
      path: "guias/cerdana-sin-coche",
      title: "Cerdanya sin coche: qué puedes visitar realmente en transporte público",
      seoTitle: "Cerdanya sin coche: tren R3, buses y qué es realista",
      seoDescription:
        "Qué se puede visitar de la Cerdanya sin coche: línea R3, autobuses regulares, Puigcerdà como base y el Bus Blanc de invierno.",
      excerpt:
        "Se puede ir a la Cerdanya sin coche, pero hay que planificarlo distinto. Qué es realista y qué no.",
      blocks: [
        lead(
          "La **R3** conecta Barcelona con Cerdanya pasando por Vic y Ripoll, y algunos trenes continúan hasta La Tor de Querol.",
        ),
        ...paras(
          "Los autobuses regulares conectan la comarca con Barcelona, Lleida y la Seu d'Urgell, y existen conexiones desde Girona vía Olot y Ripoll.",
        ),
        ...h2(
          "Puigcerdà, la base más sencilla",
          "Puigcerdà es la base más práctica para una estancia sin vehículo porque tiene estación de tren y una red urbana de proximidad.",
          "Es más realista dormir en un núcleo con transporte que intentar replicar una ruta pensada para coche.",
        ),
        ...h2(
          "La Molina en tren",
          "La R3 permite plantear una escapada ferroviaria vinculada a La Molina según el servicio vigente, sin depender del coche para llegar a la comarca.",
        ),
        ...h2(
          "Temporada de nieve",
          "Durante la temporada de nieve existe además el **Bus Blanc** hacia La Molina y Masella, sujeto a horarios de temporada.",
          "Los horarios cambian cada temporada, así que conviene comprobarlos antes de contar con ellos para volver.",
        ),
        callout(
          "warning",
          "Lo que no prometemos",
          "No presentamos toda la comarca como fácilmente accesible sin coche. Muchos pueblos y espacios naturales tienen conexiones limitadas.",
        ),
        ...paras(
          `Más escapadas ferroviarias: ${link("trains", "es", "doce escapadas en tren")}. Y si vas al Pirineo oriental, ${b2link("ripolles", "es", "la guía del Ripollès")}.`,
        ),
        ...paras(verifiedLine("es", CERDANYA_VERIFIED)),
        ...b2Related(["ripolles", "snow", "girona"], "es"),
      ],
    },

    en: {
      path: "guides/cerdanya-without-a-car",
      title: "Cerdanya without a car: what you can realistically visit by public transport",
      seoTitle: "Cerdanya without a car: the R3 train, buses and limits",
      seoDescription:
        "What you can reach in Cerdanya without a car: the R3 line, regular buses, Puigcerdà as a base and the winter Bus Blanc.",
      excerpt:
        "Cerdanya without a car is possible, but it needs different planning. What is realistic, and what is not.",
      blocks: [
        lead(
          "Renfe's **R3** connects Barcelona with Cerdanya via Vic and Ripoll, with some services continuing to La Tor de Querol.",
        ),
        ...paras(
          "Regular buses also connect the region with Barcelona, Lleida, La Seu d'Urgell and Girona.",
        ),
        ...h2(
          "Puigcerdà is the practical base",
          "Puigcerdà is the most practical base for many car-free visitors because it has rail access and a local urban bus network.",
          "Sleeping somewhere with transport beats trying to reproduce a driving itinerary.",
        ),
        ...h2(
          "La Molina by train",
          "The R3 makes a rail-based trip towards La Molina possible depending on the service running, so reaching the region need not depend on a car.",
        ),
        ...h2(
          "Snow season",
          "During the snow season the region also promotes the **Bus Blanc** connection to La Molina and Masella.",
          "Timetables change each season, so check them before relying on one for the journey back.",
        ),
        callout(
          "warning",
          "What this guide will not claim",
          "The value here is honesty: some villages and mountain areas remain difficult without private transport. We will not pretend the whole comarca is easy car-free.",
        ),
        ...paras(
          `More rail trips: ${link("trains", "en", "twelve day trips by train")}. Heading further east? ${b2link("ripolles", "en", "the Ripollès guide")}.`,
        ),
        ...paras(verifiedLine("en", CERDANYA_VERIFIED)),
        ...b2Related(["ripolles", "snow", "girona"], "en"),
      ],
    },
  },
};
