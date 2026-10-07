import { link } from "@/lib/content/features/shared";

import {
  b2Related,
  b2link,
  callout,
  h2,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
} from "./shared";

/**
 * The Pyrenees cluster: the Ripollès hub, Setcases as its first satellite, and
 * the snow guide.
 *
 * The Ripollès page is a destination hub, not a listicle — it exists to be the
 * parent of Setcases, Camprodon, Vall de Núria and the rest as those are
 * written, and it is built so that adding one is a link and not a rewrite.
 *
 * The snow guide is the one place on the site most likely to be read as a
 * promise, so it says twice, in the lead and in a callout, that it is not a
 * snow report. Whether there is snow on a given day is a question for the
 * operator on that day, and the page never answers it.
 */

/* ========================================================================== */
/* 06 — Ripollès hub                                                          */
/* ========================================================================== */

const RIPOLLES_SOURCES = [
  {
    name: "Què veure al Ripollès",
    url: "https://ripollesturisme.cat/",
    publisher: "Ripollès Turisme",
  },
  {
    name: "Parc Natural de les Capçaleres del Ter i del Freser",
    url: "https://parcsnaturals.gencat.cat/ca/capcaleres-ter-freser/",
    publisher: "Generalitat de Catalunya",
  },
];

const RIPOLLES_VERIFIED = "2026-09-29";

export const RIPOLLES: B2Article = {
  key: "ripolles",
  entryKey: "destination-ripolles",
  categoryKey: "mountain",
  sources: RIPOLLES_SOURCES,
  heroKey: "b2-ripolles-monestir",
  secondaryKey: "b2-ripolles-nuria-cremallera",
  secondaryAlt: {
    ca: "El cremallera arribant al santuari de la Vall de Núria",
    es: "El cremallera llegando al santuario de la Vall de Núria",
    en: "The rack railway arriving at the Vall de Núria sanctuary",
  },
  secondaryCaption: {
    ca: "A la Vall de Núria no hi arriba cap carretera: el cremallera és l'accés.",
    es: "A la Vall de Núria no llega ninguna carretera: el cremallera es el acceso.",
    en: "No road reaches Vall de Núria; the rack railway is the way in.",
  },
  heroAlt: {
    ca: "Portalada del monestir de Santa Maria de Ripoll",
    es: "Portada del monasterio de Santa Maria de Ripoll",
    en: "The doorway of the monastery of Santa Maria de Ripoll",
  },
  heroCaption: {
    ca: "El conjunt monàstic de Ripoll és la porta d'entrada al patrimoni de la comarca.",
    es: "El conjunto monástico de Ripoll es la puerta de entrada al patrimonio de la comarca.",
    en: "Ripoll's monastic complex is the gateway to the area's heritage.",
  },
  verifiedAt: RIPOLLES_VERIFIED,
  publishedAt: "2026-09-29T12:00:00+02:00",
  editions: {
    ca: {
      path: "destinacions/ripolles",
      title: "El Ripollès: què veure, pobles, natura i escapades per descobrir la comarca",
      seoTitle: "El Ripollès: què veure, pobles i escapades",
      seoDescription:
        "Guia del Ripollès: el monestir de Ripoll, la Vall de Núria, la vall de Camprodon, Setcases i Beget, i com repartir els dies.",
      excerpt:
        "Patrimoni romànic, pobles pirinencs i alta muntanya. Com dividir la comarca per no intentar veure-ho tot en un dia.",
      blocks: [
        lead(
          "El Ripollès combina patrimoni romànic, pobles pirinencs i alguns dels grans paisatges de muntanya del nord de Catalunya.",
        ),
        ...paras("És massa divers per reduir-lo a una excursió d'un sol lloc."),
        ...paras(
          "Ripollès Turisme destaca entre els imprescindibles el conjunt monàstic de **Ripoll**, la **Vall de Núria**, **Beget** i el Parc Natural de les Capçaleres del Ter i del Freser.",
        ),
        ...h2(
          "Ripoll",
          "El conjunt monàstic és una de les grans portes d'entrada al patrimoni de la comarca.",
        ),
        ...h2(
          "Vall de Núria",
          "L'accés amb cremallera forma part de l'experiència. L'oferta de muntanya existeix durant tot l'any.",
        ),
        ...h2(
          "Vall de Camprodon",
          "Camprodon pot funcionar com a base per combinar nuclis de la vall, patrimoni i paisatge.",
        ),
        ...h2(
          "Setcases i Vallter",
          "Setcases és una de les portes del Parc Natural de les Capçaleres del Ter i del Freser i connecta directament amb l'entorn de Vallter.",
          `N'hem escrit una guia a part: ${b2link("setcases", "ca", "què veure a Setcases en un dia")}.`,
        ),
        ...h2(
          "Beget",
          "És un dels nuclis patrimonials més singulars de la comarca i conserva arquitectura medieval de pedra.",
        ),
        ...h2("Quants dies?"),
        table(
          "Com repartir els dies al Ripollès",
          ["Temps", "Què hi cap"],
          [
            ["1 dia", "Concentra't en una vall o zona"],
            ["2 dies", "Combina patrimoni i muntanya"],
            ["3 dies", "Ripoll, Vall de Ribes/Núria i vall de Camprodon"],
          ],
          "Una recomanació editorial sobre com repartir la visita, no una promesa de temps de conducció.",
        ),
        ...paras(
          `Si hi vas a la temporada de bolets, tenim el ${link("mushrooms", "ca", "part setmanal de condicions")}, i a l'hivern, ${b2link("snow", "ca", "on veure neu sense esquiar")}.`,
        ),
        ...paras(verifiedLine("ca", RIPOLLES_VERIFIED)),
        ...b2Related(["setcases", "snow", "cerdanya"], "ca"),
      ],
    },

    es: {
      path: "destinos/ripolles",
      title: "El Ripollès: qué ver, pueblos, naturaleza y escapadas por la comarca",
      seoTitle: "El Ripollès: qué ver, pueblos y escapadas",
      seoDescription:
        "Guía del Ripollès: monasterio de Ripoll, Vall de Núria, valle de Camprodon, Setcases y Beget, y cómo repartir los días.",
      excerpt:
        "Patrimonio románico, pueblos pirenaicos y alta montaña. Cómo dividir la comarca en varios núcleos.",
      blocks: [
        lead("El Ripollès reúne patrimonio románico, pueblos pirenaicos y alta montaña."),
        ...paras(
          "Entre los lugares que destaca el organismo turístico comarcal se encuentran el Monasterio de Ripoll, la Vall de Núria, Beget y el Parc Natural de les Capçaleres del Ter i del Freser.",
        ),
        ...h2(
          "Tres núcleos, no una excursión",
          "La mejor forma de entender la comarca es dividirla: **Ripoll y patrimonio**, **Vall de Ribes y Núria**, y **Vall de Camprodon, Setcases y Vallter**.",
        ),
        ...h2(
          "Ripoll",
          "El conjunto monástico es la gran puerta de entrada al patrimonio de la comarca y el punto donde más fácil resulta entender su historia medieval.",
        ),
        ...h2(
          "Vall de Núria",
          "El acceso en cremallera forma parte de la experiencia: no hay carretera hasta el santuario.",
          "La oferta de montaña existe durante todo el año, no solo en temporada de nieve.",
        ),
        ...h2(
          "Vall de Camprodon, Setcases y Vallter",
          `Setcases es una de las puertas del parque natural. ${b2link("setcases", "es", "Guía de Setcases")}.`,
        ),
        ...h2(
          "Vall de Camprodon",
          "Camprodon puede funcionar como base para combinar los núcleos del valle, el patrimonio y el paisaje sin cambiar de alojamiento cada noche.",
        ),
        ...h2(
          "Beget",
          "Uno de los núcleos patrimoniales más singulares de la comarca, con arquitectura medieval de piedra.",
        ),
        ...h2("Cuántos días"),
        table(
          "Cómo repartir los días",
          ["Tiempo", "Qué cabe"],
          [
            ["1 día", "Una sola vall o zona"],
            ["2 días", "Patrimonio y montaña"],
            ["3 días", "Ripoll, Vall de Ribes/Núria y valle de Camprodon"],
          ],
          "Recomendación editorial, no una promesa de tiempos de conducción.",
        ),
        ...paras(
          `En temporada de setas, el ${link("mushrooms", "es", "parte semanal de condiciones")}. En invierno, ${b2link("snow", "es", "dónde ver nieve sin esquiar")}.`,
        ),
        ...paras(verifiedLine("es", RIPOLLES_VERIFIED)),
        ...b2Related(["setcases", "snow", "cerdanya"], "es"),
      ],
    },

    en: {
      path: "destinations/ripolles",
      title: "Ripollès travel guide: villages, mountains and places worth exploring",
      seoTitle: "Ripollès travel guide: villages and mountains",
      seoDescription:
        "A guide to Ripollès: Ripoll's monastery, Vall de Núria, the Camprodon valley, Setcases and Beget, and how to split your days.",
      excerpt:
        "Romanesque heritage, Pyrenean villages and high mountains. How to divide the area instead of rushing it.",
      blocks: [
        lead(
          "Ripollès combines Romanesque heritage, Pyrenean villages and high-mountain landscapes.",
        ),
        ...paras(
          "The official tourism organisation highlights places including Ripoll's monastic complex, Vall de Núria, Beget and Capçaleres del Ter i del Freser Natural Park.",
        ),
        ...h2(
          "Three clusters, not one day trip",
          "Rather than treating the area as a single excursion, divide it into **Ripoll and heritage**, **Vall de Ribes and Núria**, and **Vall de Camprodon, Setcases and Vallter**.",
        ),
        ...h2(
          "Ripoll",
          "The monastic complex is the main gateway to the area's heritage and the easiest place to get a grip on its medieval history.",
        ),
        ...h2(
          "Vall de Núria",
          "The rack-railway approach is part of the experience: there is no road to the sanctuary.",
          "There is mountain activity all year, not only in the snow season.",
        ),
        ...h2(
          "Vall de Camprodon",
          "Camprodon works well as a base for combining the valley's villages, its heritage and its landscape without changing accommodation every night.",
        ),
        ...h2(
          "Setcases and Vallter",
          `Setcases is one of the gateways to the natural park. ${b2link("setcases", "en", "Our Setcases guide")}.`,
        ),
        ...h2("Beget", "One of the most distinctive heritage villages in the comarca."),
        ...h2("How many days"),
        table(
          "Splitting the time",
          ["Time", "What fits"],
          [
            ["1 day", "One valley or area"],
            ["2 days", "Heritage plus mountains"],
            ["3 days", "Ripoll, Vall de Ribes/Núria and the Camprodon valley"],
          ],
          "An editorial recommendation, not a promise about driving times.",
        ),
        ...paras(
          `In mushroom season, see the ${link("mushrooms", "en", "weekly conditions report")}. In winter, ${b2link("snow", "en", "where to see snow without skiing")}.`,
        ),
        ...paras(verifiedLine("en", RIPOLLES_VERIFIED)),
        ...b2Related(["setcases", "snow", "cerdanya"], "en"),
      ],
    },
  },
};

/* ========================================================================== */
/* 07 — Setcases                                                              */
/* ========================================================================== */

const SETCASES_SOURCES = [
  {
    name: "Setcases",
    url: "https://ripollesturisme.cat/en/municipi/setcases/",
    publisher: "Ripollès Turisme",
  },
  {
    name: "Parc Natural de les Capçaleres del Ter i del Freser",
    url: "https://parcsnaturals.gencat.cat/ca/capcaleres-ter-freser/",
    publisher: "Generalitat de Catalunya",
  },
];

const SETCASES_VERIFIED = "2026-09-29";

export const SETCASES: B2Article = {
  key: "setcases",
  entryKey: "destination-setcases",
  categoryKey: "villages",
  sources: SETCASES_SOURCES,
  heroKey: "b2-setcases-poble",
  secondaryKey: "b2-setcases-vallter",
  secondaryAlt: {
    ca: "L'entorn de muntanya de Vallter, a l'alta vall del Ter",
    es: "El entorno de montaña de Vallter, en el alto valle del Ter",
    en: "The mountain setting of Vallter, in the upper Ter valley",
  },
  secondaryCaption: {
    ca: "Setcases és la porta natural cap a Vallter i l'alta vall del Ter.",
    es: "Setcases es la puerta natural hacia Vallter y el alto valle del Ter.",
    en: "Setcases is the natural gateway towards Vallter and the upper Ter valley.",
  },
  heroAlt: {
    ca: "El nucli de pedra de Setcases, al Ripollès",
    es: "El núcleo de piedra de Setcases, en el Ripollès",
    en: "The stone village of Setcases, in Ripollès",
  },
  heroCaption: {
    ca: "Setcases és una de les portes del Parc Natural de les Capçaleres del Ter i del Freser.",
    es: "Setcases es una de las puertas del Parc Natural de les Capçaleres del Ter i del Freser.",
    en: "Setcases is one of the gateways to Capçaleres del Ter i del Freser Natural Park.",
  },
  verifiedAt: SETCASES_VERIFIED,
  publishedAt: "2026-09-29T12:10:00+02:00",
  editions: {
    ca: {
      path: "destinacions/setcases",
      title: "Setcases: què veure en un dia i què fer als voltants",
      seoTitle: "Setcases: què veure en un dia al Pirineu",
      seoDescription:
        "Què veure a Setcases en un dia: el nucli de pedra, el mirador de la Creueta, els miradors del municipi i l'entorn de Vallter.",
      excerpt:
        "Un poble d'alta muntanya i una de les portes del parc natural. Nucli, la Creueta, miradors i Vallter.",
      blocks: [
        lead(
          "Setcases conserva carrers i cases de pedra pròpies d'un nucli d'alta muntanya i és una de les portes d'accés al Parc Natural de les Capçaleres del Ter i del Freser.",
        ),
        ...paras("No necessita una llista de vint «atraccions». La gràcia és combinar el poble amb l'entorn."),
        keyFacts("Dades clau", [
          { label: "Comarca", value: "Ripollès" },
          { label: "Parc natural", value: "Capçaleres del Ter i del Freser" },
          { label: "Passeig de la Creueta", value: "Uns 300 m i uns 50 m de desnivell, uns 10 minuts" },
          { label: "Última verificació", value: "29 de setembre de 2026" },
        ]),
        ...h2(
          "Al matí: el nucli",
          "Passeja pels carrers del poble i dedica temps al patrimoni i a l'arquitectura tradicional.",
        ),
        ...h2(
          "La Creueta",
          "Ripollès Turisme proposa un petit passeig d'uns deu minuts, de poc més de **300 metres** i uns **50 metres de desnivell**, per obtenir una bona perspectiva del poble.",
        ),
        ...h2("Miradors"),
        ...paras("El municipi identifica diversos miradors:"),
        list(
          "el Forat de l'Olla;",
          "el Collet de Xuriguera;",
          "la Baidana;",
          "el balcó de la Costa Brava.",
        ),
        ...h2(
          "Vallter",
          "Setcases és la porta natural cap a Vallter i l'alta vall del Ter.",
          "A l'estiu hi ha propostes de senderisme i muntanya; a l'hivern, l'activitat depèn de les condicions de neu i de l'operativa de l'estació.",
        ),
        callout(
          "warning",
          "Abans d'anar-hi",
          "No donem per fet que Vallter estigui obert ni que hi hagi neu. Comprova la meteorologia, els accessos, l'estat de l'estació i els avisos del parc natural per a la teva data.",
        ),
        ...paras(
          `Setcases forma part d'una comarca que dona per a molt més: ${b2link("ripolles", "ca", "la guia del Ripollès")}.`,
        ),
        ...h2(
          "Com arribar-hi",
          "El tren no arriba a Setcases. L'estació més propera de la línia R3 és **Ripoll**, i des d'allà cal pujar la vall del Ter per carretera, passant per Camprodon.",
          "A l'hivern, abans de continuar cap a Vallter, comprova l'estat de la carretera: el tram final és d'alta muntanya i pot quedar afectat per la neu.",
          "Si vas a passar el dia, Camprodon és la població de la vall amb més serveis i pot fer de base per dinar o dormir.",
        ),
        ...paras(verifiedLine("ca", SETCASES_VERIFIED)),
        ...b2Related(["ripolles", "snow"], "ca"),
      ],
    },

    es: {
      path: "destinos/setcases",
      title: "Setcases: qué ver en un día y qué hacer en los alrededores",
      seoTitle: "Setcases: qué ver en un día en el Pirineo",
      seoDescription:
        "Qué ver en Setcases en un día: el casco de piedra, el mirador de la Creueta, los miradores del municipio y el entorno de Vallter.",
      excerpt:
        "Pueblo de alta montaña y puerta del parque natural. Casco urbano, la Creueta, miradores y Vallter.",
      blocks: [
        lead(
          "Setcases es un pueblo de alta montaña con calles y casas de piedra y una de las puertas del Parc Natural de les Capçaleres del Ter i del Freser.",
        ),
        ...paras(
          "Una visita funciona mejor combinando **casco urbano → La Creueta → miradores → entorno de Vallter**, según la época del año.",
        ),
        keyFacts("Datos clave", [
          { label: "Comarca", value: "Ripollès" },
          { label: "Parque natural", value: "Capçaleres del Ter i del Freser" },
          { label: "Paseo de la Creueta", value: "Unos 300 m y unos 50 m de desnivel, unos 10 minutos" },
          { label: "Última verificación", value: "29 de septiembre de 2026" },
        ]),
        ...h2(
          "La Creueta",
          "Es un paseo corto de poco más de **300 metros** y unos **50 metros de desnivel**, de unos diez minutos, con una buena perspectiva del pueblo.",
        ),
        ...h2("Miradores"),
        list("el Forat de l'Olla;", "el Collet de Xuriguera;", "la Baidana;", "el balcón de la Costa Brava."),
        ...h2(
          "Vallter",
          "Setcases es la puerta natural hacia Vallter y el alto valle del Ter.",
        ),
        callout(
          "warning",
          "Antes de ir",
          "No afirmamos que Vallter esté abierto ni que haya nieve. Comprueba la meteorología, los accesos y el estado de la estación para la fecha concreta.",
        ),
        ...paras(`${b2link("ripolles", "es", "La guía del Ripollès")} sitúa Setcases en su comarca.`),
        ...h2(
          "Cómo llegar",
          "El tren no llega a Setcases. La estación más cercana de la línea R3 es **Ripoll**, y desde allí hay que subir el valle del Ter por carretera, pasando por Camprodon.",
          "En invierno, antes de seguir hacia Vallter, comprueba el estado de la carretera: el tramo final es de alta montaña y puede verse afectado por la nieve.",
          "Si vas a pasar el día, Camprodon es la población del valle con más servicios y puede servir de base para comer o dormir.",
        ),
        ...paras(verifiedLine("es", SETCASES_VERIFIED)),
        ...b2Related(["ripolles", "snow"], "es"),
      ],
    },

    en: {
      path: "destinations/setcases",
      title: "Setcases: what to see in a day in this Pyrenean village",
      seoTitle: "Setcases: what to see in a day in the Pyrenees",
      seoDescription:
        "What to see in Setcases in a day: the stone village, the La Creueta viewpoint walk, the local lookouts and the Vallter area.",
      excerpt:
        "A high-mountain village of stone houses and a gateway to the natural park. Village, viewpoint, lookouts, Vallter.",
      blocks: [
        lead(
          "Setcases is a high-mountain village of stone houses and narrow streets and one of the gateways to Capçaleres del Ter i del Freser Natural Park.",
        ),
        ...paras(
          "A useful day combines the village itself with a short viewpoint walk and, when conditions allow, the Vallter area.",
        ),
        keyFacts("Key facts", [
          { label: "Comarca", value: "Ripollès" },
          { label: "Natural park", value: "Capçaleres del Ter i del Freser" },
          { label: "La Creueta walk", value: "About 300 m and 50 m of ascent, roughly 10 minutes" },
          { label: "Last verified", value: "29 September 2026" },
        ]),
        ...h2(
          "La Creueta",
          "The walk is only a little over **300 metres** long with roughly **50 metres** of elevation gain, about ten minutes, for one of the best views over the village.",
        ),
        ...h2("Lookouts"),
        list("Forat de l'Olla;", "Collet de Xuriguera;", "La Baidana;", "the Costa Brava balcony."),
        ...h2(
          "Vallter",
          "Setcases is the natural gateway towards Vallter and the upper Ter valley. Summer brings walking and mountain activities; winter depends on snow conditions and what the resort is running.",
        ),
        callout(
          "warning",
          "Before you go",
          "Always check mountain and road conditions before continuing towards Vallter. We do not claim the resort is open or that there is snow.",
        ),
        ...paras(`${b2link("ripolles", "en", "The Ripollès guide")} places Setcases in its region.`),
        ...h2(
          "Getting there",
          "The train does not reach Setcases. The nearest R3 station is **Ripoll**; from there the road climbs the Ter valley through Camprodon.",
          "In winter, check road conditions before continuing to Vallter: the last stretch is high-mountain road and can be affected by snow.",
          "For a day visit, Camprodon is the town in the valley with the most services and works as a base for lunch or a night.",
        ),
        ...paras(verifiedLine("en", SETCASES_VERIFIED)),
        ...b2Related(["ripolles", "snow"], "en"),
      ],
    },
  },
};

/* ========================================================================== */
/* 10 — Snow without skiing                                                   */
/* ========================================================================== */

const SNOW_SOURCES = [
  {
    name: "FGC Turisme — estacions de muntanya",
    url: "https://www.fgc.cat/turisme/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Pirineu365",
    url: "https://www.fgc.cat/gabinet/fgc-impulsa-pirineu365-que-agrupa-les-sis-estacions-desqui-i-muntanya-sota-una-unica-visio-estrategica-per-gaudir-de-la-muntanya-tot-lany/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
];

const SNOW_VERIFIED = "2026-09-29";

export const SNOW: B2Article = {
  key: "snow",
  entryKey: "guide-snow-without-skiing",
  categoryKey: "mountain",
  sources: SNOW_SOURCES,
  heroKey: "b2-neu-vall-de-nuria",
  secondaryKey: "b2-neu-la-molina",
  secondaryAlt: {
    ca: "Les muntanyes al voltant de La Molina",
    es: "Las montañas alrededor de La Molina",
    en: "The mountains around La Molina",
  },
  secondaryCaption: {
    ca: "Fotografia d'arxiu de l'entorn de La Molina. No mostra les condicions d'avui.",
    es: "Fotografía de archivo del entorno de La Molina. No muestra las condiciones de hoy.",
    en: "An archive photograph of the La Molina area. It does not show today's conditions.",
  },
  heroAlt: {
    ca: "Activitats d'hivern al parc lúdic de la Vall de Núria",
    es: "Actividades de invierno en el parque lúdico de la Vall de Núria",
    en: "Winter activities at the Vall de Núria leisure park",
  },
  heroCaption: {
    ca: "Fotografia d'arxiu del parc lúdic de Núria. No indica les condicions d'avui: consulta l'estació.",
    es: "Fotografía de archivo del parque lúdico de Núria. No indica las condiciones de hoy: consulta la estación.",
    en: "An archive photograph of the Núria leisure park. It does not show today's conditions: check with the resort.",
  },
  verifiedAt: SNOW_VERIFIED,
  publishedAt: "2026-09-29T12:20:00+02:00",
  editions: {
    ca: {
      path: "guies/on-veure-neu-catalunya-sense-esquiar",
      title: "On veure neu a Catalunya sense esquiar: 6 escapades als Pirineus",
      seoTitle: "Veure neu a Catalunya sense esquiar: 6 escapades",
      seoDescription:
        "Les sis destinacions de muntanya d'FGC al Pirineu català i com plantejar-hi una escapada d'hivern sense esquiar.",
      excerpt:
        "No cal esquiar per a una escapada de neu. Les sis destinacions de muntanya d'FGC i com triar-ne una.",
      blocks: [
        lead("No cal esquiar per gaudir d'una escapada de neu."),
        ...paras(
          "FGC gestiona sis destinacions de muntanya al Pirineu català: **La Molina, Vall de Núria, Vallter, Espot, Port Ainé i Boí Taüll**. A l'hivern, l'oferta va més enllà de l'esquí alpí i inclou activitats com raquetes i propostes lúdiques, segons l'estació i les condicions.",
        ),
        callout(
          "warning",
          "Això no és un part de neu",
          "Aquesta guia explica **on plantejar una escapada hivernal**. No prediu les condicions d'una data concreta: això només ho pot dir l'estació aquell dia. Abans de sortir cal comprovar l'estat de l'estació, la meteorologia, les carreteres i quines activitats estan obertes.",
        ),
        ...h2(
          "Vall de Núria",
          "És especialment interessant per a una escapada paisatgística perquè l'accés forma part de l'experiència i el destí manté activitat durant tot l'any.",
        ),
        ...h2(
          "La Molina",
          "Pot combinar neu amb altres serveis i activitats de muntanya segons la temporada.",
        ),
        ...h2(
          "Vallter",
          `És una porta d'alta muntanya del Ripollès, dins l'entorn de ${b2link("setcases", "ca", "Setcases")} i les Capçaleres del Ter i del Freser.`,
        ),
        ...h2("Espot", "Permet combinar l'ambient de neu amb una escapada al Pallars Sobirà."),
        ...h2(
          "Port Ainé",
          "Un altre punt del Pallars per plantejar una jornada hivernal sense que esquiar hagi de ser necessàriament l'activitat principal.",
        ),
        ...h2("Boí Taüll", "Permet incorporar la neu dins d'una escapada a l'Alta Ribagorça."),
        ...h2("Important: no garantim neu"),
        ...paras("Abans de sortir cal comprovar:"),
        list(
          "l'estat de l'estació;",
          "la meteorologia;",
          "les carreteres;",
          "la neu;",
          "quines activitats estan obertes.",
        ),
        callout(
          "info",
          "Sobre les fotografies",
          "No fem servir mai la fotografia d'una nevada antiga per donar a entendre que avui hi ha neu. Les imatges d'aquesta pàgina il·lustren el paisatge, no les condicions d'avui.",
        ),
        ...paras(
          `Si hi vols anar sense cotxe, mira ${b2link("cerdanya", "ca", "què es pot fer a la Cerdanya amb transport públic")}.`,
        ),
        ...h2(
          "Com arribar a cada destinació",
          "Abans de triar, convé saber quines es poden fer sense cotxe. Només dues tenen connexió ferroviària directa:",
        ),
        table(
          "Com arribar a cada destinació",
          ["Destinació", "Comarca", "Sense cotxe"],
          [
            ["La Molina", "Cerdanya", "Tren R3 fins a l'estació de La Molina; Bus Blanc en temporada de neu"],
            ["Vall de Núria", "Ripollès", "Tren R3 fins a Ribes de Freser i cremallera fins a Núria. No s'hi pot pujar amb cotxe"],
            ["Vallter", "Ripollès", "Sense connexió directa verificada"],
            ["Espot", "Pallars Sobirà", "Sense connexió directa verificada"],
            ["Port Ainé", "Pallars Sobirà", "Sense connexió directa verificada"],
            ["Boí Taüll", "Alta Ribagorça", "Sense connexió directa verificada"],
          ],
          "«Sense connexió directa verificada» vol dir que no n'hem pogut confirmar cap a les fonts oficials, no que no n'hi hagi cap. Consulta-ho a l'operador abans de sortir.",
        ),
        ...paras(
          "Núria és el cas més clar d'escapada de neu sense cotxe: l'aparcament gratuït de l'estació de Ribes-Enllaç és on es deixa el vehicle si s'hi arriba conduint, i des d'allà el cremallera para a Ribes-Vila, Queralbs i Núria.",
        ),
        ...paras(verifiedLine("ca", SNOW_VERIFIED)),
        ...b2Related(["cerdanya", "ripolles", "setcases"], "ca"),
      ],
    },

    es: {
      path: "guias/donde-ver-nieve-cataluna-sin-esquiar",
      title: "Dónde ver nieve en Cataluña sin esquiar: 6 escapadas a los Pirineos",
      seoTitle: "Ver nieve en Cataluña sin esquiar: 6 escapadas",
      seoDescription:
        "Los seis destinos de montaña de FGC en el Pirineo catalán y cómo plantear una escapada de invierno sin esquiar.",
      excerpt:
        "No hace falta esquiar. Los seis destinos de montaña de FGC y cómo elegir uno.",
      blocks: [
        lead(
          "FGC gestiona seis destinos de montaña: **La Molina, Vall de Núria, Vallter, Espot, Port Ainé y Boí Taüll**.",
        ),
        ...paras(
          "La oferta invernal de la red incluye actividades más allá del esquí alpino, como raquetas y propuestas lúdicas según cada destino y las condiciones.",
        ),
        callout(
          "warning",
          "Esto no es un parte de nieve",
          "Esta guía no predice las condiciones de una fecha concreta: eso solo lo puede decir la estación ese día. Antes de desplazarte hay que revisar las condiciones oficiales de la estación, la meteorología y los accesos.",
        ),
        ...h2("Vall de Núria", "El acceso forma parte de la experiencia y el destino mantiene actividad todo el año."),
        ...h2("La Molina", "Combina nieve con otros servicios y actividades según la temporada."),
        ...h2("Vallter", `Puerta de alta montaña del Ripollès, en el entorno de ${b2link("setcases", "es", "Setcases")}.`),
        ...h2("Espot", "Ambiente de nieve y escapada al Pallars Sobirà."),
        ...h2("Port Ainé", "Otro punto del Pallars para una jornada invernal sin esquiar."),
        ...h2("Boí Taüll", "Nieve dentro de una escapada a la Alta Ribagorça."),
        ...h2("Antes de salir"),
        list("estado de la estación;", "meteorología;", "carreteras;", "nieve;", "actividades abiertas."),
        callout(
          "info",
          "Sobre las fotografías",
          "Nunca usamos la foto de una nevada antigua para dar a entender que hoy hay nieve.",
        ),
        ...paras(
          `Sin coche: ${b2link("cerdanya", "es", "qué se puede hacer en la Cerdanya en transporte público")}.`,
        ),
        ...h2(
          "Cómo llegar a cada destino",
          "Antes de elegir, conviene saber cuáles se pueden hacer sin coche. Solo dos tienen conexión ferroviaria directa:",
        ),
        table(
          "Cómo llegar a cada destino",
          ["Destino", "Comarca", "Sin coche"],
          [
            ["La Molina", "Cerdanya", "Tren R3 hasta la estación de La Molina; Bus Blanc en temporada de nieve"],
            ["Vall de Núria", "Ripollès", "Tren R3 hasta Ribes de Freser y cremallera hasta Núria. No se puede subir en coche"],
            ["Vallter", "Ripollès", "Sin conexión directa verificada"],
            ["Espot", "Pallars Sobirà", "Sin conexión directa verificada"],
            ["Port Ainé", "Pallars Sobirà", "Sin conexión directa verificada"],
            ["Boí Taüll", "Alta Ribagorça", "Sin conexión directa verificada"],
          ],
          "«Sin conexión directa verificada» significa que no hemos podido confirmar ninguna en las fuentes oficiales, no que no exista. Consúltalo con el operador antes de salir.",
        ),
        ...paras(
          "Núria es el caso más claro de escapada de nieve sin coche: el aparcamiento gratuito de la estación de Ribes-Enllaç es donde se deja el vehículo si se llega conduciendo, y desde allí el cremallera para en Ribes-Vila, Queralbs y Núria.",
        ),
        ...paras(verifiedLine("es", SNOW_VERIFIED)),
        ...b2Related(["cerdanya", "ripolles", "setcases"], "es"),
      ],
    },

    en: {
      path: "guides/where-to-see-snow-catalonia-without-skiing",
      title: "Where to see snow in Catalonia without skiing: 6 Pyrenees escapes",
      seoTitle: "See snow in Catalonia without skiing: 6 escapes",
      seoDescription:
        "The six FGC mountain destinations in the Catalan Pyrenees and how to plan a winter trip that is not about skiing.",
      excerpt:
        "You do not need to ski. The six FGC mountain destinations and how to choose one.",
      blocks: [
        lead(
          "FGC operates six mountain destinations in the Catalan Pyrenees: **La Molina, Vall de Núria, Vallter, Espot, Port Ainé and Boí Taüll**.",
        ),
        ...paras(
          "Their winter offer extends beyond alpine skiing, with activities such as snowshoeing and family leisure depending on the resort and conditions.",
        ),
        callout(
          "warning",
          "This is not a live snow report",
          "This page is about where to plan a winter trip. It does not predict conditions on a given date: only the resort can tell you that on the day.",
        ),
        ...h2("Vall de Núria", "The approach is part of the experience, and the destination stays open year-round."),
        ...h2("La Molina", "Snow alongside other mountain services, depending on the season."),
        ...h2("Vallter", `A high-mountain gateway in Ripollès, near ${b2link("setcases", "en", "Setcases")}.`),
        ...h2("Espot", "Snow atmosphere combined with a trip into Pallars Sobirà."),
        ...h2("Port Ainé", "Another Pallars option for a winter day that is not centred on skiing."),
        ...h2("Boí Taüll", "Snow as part of a trip to Alta Ribagorça."),
        ...h2("Always check before travelling"),
        list(
          "current snow conditions;",
          "road access;",
          "weather;",
          "activity status.",
        ),
        callout(
          "info",
          "About the photographs",
          "We never use a photograph of an old snowfall to imply there is snow today.",
        ),
        ...paras(
          `Travelling without a car? ${b2link("cerdanya", "en", "What you can reach in Cerdanya by public transport")}.`,
        ),
        ...h2(
          "Getting to each destination",
          "Before choosing, it helps to know which can be done without a car. Only two have a direct rail connection:",
        ),
        table(
          "Getting to each destination",
          ["Destination", "Comarca", "Without a car"],
          [
            ["La Molina", "Cerdanya", "R3 train to La Molina station; Bus Blanc in the snow season"],
            ["Vall de Núria", "Ripollès", "R3 train to Ribes de Freser, then the rack railway to Núria. There is no road up"],
            ["Vallter", "Ripollès", "No verified direct connection"],
            ["Espot", "Pallars Sobirà", "No verified direct connection"],
            ["Port Ainé", "Pallars Sobirà", "No verified direct connection"],
            ["Boí Taüll", "Alta Ribagorça", "No verified direct connection"],
          ],
          "\"No verified direct connection\" means we could not confirm one in official sources, not that none exists. Check with the operator before you travel.",
        ),
        ...paras(
          "Núria is the clearest car-free snow trip: drivers leave the car at the free car park at Ribes-Enllaç station, and the rack railway calls at Ribes-Vila, Queralbs and Núria.",
        ),
        ...paras(verifiedLine("en", SNOW_VERIFIED)),
        ...b2Related(["cerdanya", "ripolles", "setcases"], "en"),
      ],
    },
  },
};
