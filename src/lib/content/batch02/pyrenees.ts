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
    url: "https://parcsnaturals.gencat.cat/ca/xarxa-de-parcs/ter-freser/",
    publisher: "Generalitat de Catalunya",
  },
  { name: "Horaris i preus d'entrada", url: "https://www.monestirderipoll.cat/horaris-i-preus-dentrades/", publisher: "Monestir de Ripoll" },
  { name: "Horaris", url: "https://www.museuderipoll.org/horaris/", publisher: "Museu Etnogràfic de Ripoll" },
  { name: "Ruta del Ferro i del Carbó", url: "https://www.viesverdes.cat/rutes_vies_verdes/ruta-del-ferro-i-del-carbo/", publisher: "Vies Verdes de Girona" },
  { name: "Cremallera de Núria", url: "https://turistren.cat/trens/cremallera-de-nuria/", publisher: "FGC Turistren" },
  { name: "Com arribar", url: "https://ripollesturisme.cat/planifica-la-teva-visita/com-arribar/", publisher: "Ripollès Turisme" },
  { name: "R3: avís de servei", url: "https://rodalies.gencat.cat/ca/detalls/article/02_02_PAT_R3", publisher: "Rodalies de Catalunya" },
];

const RIPOLLES_VERIFIED = "2026-10-20";

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
          "Ripoll: el monestir i el museu",
          "Amplia la secció «Ripoll».",
          "El monestir de Santa Maria de Ripoll és el motiu principal per aturar-se a la vila. La basílica la va consagrar l'abat Oliba el 1032, i la portalada del segle XII és, segons Ripollès Turisme, candidata a Patrimoni de la Humanitat. Del saqueig i l'incendi de 1835 es van salvar 231 volums de la biblioteca, que avui es conserven a l'Arxiu de la Corona d'Aragó.",
          "Horari 2026: d'estiu (28 de març – 27 de setembre), de 10 a 14 h i de 16 a 19 h; d'hivern, de 10 a 13.30 h i de 15.30 a 18 h. Diumenges i alguns festius, de 10 a 14 h. Tanca el 25 i 26 de desembre i l'1 i el 6 de gener. Les entrades es venen fins a 30 minuts abans de tancar, i hi ha visita guiada dissabtes i diumenges a les 12 h. Entrada general: 7,50 €; menors de 5 a 18 anys, 3,50 €; menors de 5 anys, gratuït *(preus consultats el 20/10/2026)*.",
          "Al costat, el Museu Etnogràfic de Ripoll explica la comarca a través dels pastors, la farga i les armes de foc ripolleses. Obre de dimarts a dissabte i diumenge al matí, tanca els dilluns, i l'entrada general és de 4 €. És gratuït l'últim diumenge de mes i per als menors de 12 anys.",
        ),
        ...h2(
          "Sant Joan de les Abadesses",
          "L'altre gran monestir de la comarca el va fundar Guifré el Pelós el 887 com el primer monestir femení dels comtats catalans, i l'església actual es va consagrar el 1150. A dins hi ha el Santíssim Misteri, un davallament de la creu del segle XIII tallat en fusta. Entrada general: 5 € (consultat el 20/10/2026).",
        ),
        ...h2(
          "Sense cotxe: la via verda del Ferro i del Carbó",
          "Entre Ripoll i Sant Joan de les Abadesses, l'antiga via del tren és una via verda asfaltada, amb un pendent suau de l'1 % i classificada com a accessible i de dificultat mínima. Puja de 682 m a Ripoll a 775 m a Sant Joan, i en total la ruta arriba als 18 km fins a Ogassa i Sant Pau de Segúries. Des de Sant Joan, la via temàtica de l'Alt Ter continua 21,76 km riu amunt per Camprodon fins a Vilallonga de Ter.",
        ),
        ...h2(
          "La vall de Camprodon i Beget",
          "A Camprodon, el pont Nou de finals del segle XII és la imatge de la vila. Isaac Albéniz hi va néixer el 1860. A Beget, l'església romànica de Sant Cristòfol guarda la Majestat, un Crist del segle XII d'uns dos metres. Setcases té ${b2link(\"setcases\", \"ca\", \"guia pròpia\")}.",
        ),
        ...h2(
          "Vall de Núria",
          "Amplia la secció.",
          "El cremallera surt de Ribes-Enllaç, para a Ribes-Vila i Queralbs, i en 40 minuts puja 1.000 metres en 12,5 km. Circula tot l'any, però a partir de començaments de novembre FGC en redueix el servei. L'operador indica que la compra en línia és obligatòria, i hi ha tres aparcaments gratuïts a les estacions d'accés. Tota la resta és a ${b2link(\"nuria\", \"ca\", \"la nostra guia de Núria\")}.",
        ),
        ...h2(
          "Com arribar al Ripollès",
          "En cotxe, des de Barcelona per la C-17 (direcció Vic–Puigcerdà), i des de Girona per l'A-26 cap a Olot i la N-260 cap a Ripoll. En autobús, TEISA uneix Barcelona amb Ripoll i Camprodon passant per Vic, i també té línies des de Girona i Olot. En tren, la R3 arriba a Ripoll i a Ribes-Enllaç, però des del 7 de juliol de 2026 només circula entre la Garriga i Puigcerdà, i entre Barcelona i la Garriga o Vic hi ha un servei de Rodalies per carretera. Comprova l'avís vigent abans de viatjar.",
        ),
        ...h2(
          "Informació del parc natural",
          "El Parc Natural de les Capçaleres del Ter i del Freser té quatre centres d'informació: a Queralbs, a l'estació del cremallera de Núria, a Setcases i a Ulldeter. Els horaris no són els mateixos a tots.",
        ),
        ...h2(
          "Setcases i Vallter",
          "Setcases és una de les portes del Parc Natural de les Capçaleres del Ter i del Freser i connecta directament amb l'entorn de Vallter.",
          `N'hem escrit una guia a part: ${b2link("setcases", "ca", "què veure a Setcases en un dia")}.`,
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
        ...b2Related(["nuria", "setcases", "ski", "snow", "cerdanya"], "ca"),
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
          "Ripoll: el monasterio y el museo",
          "El monasterio de Santa Maria de Ripoll es la razón principal para parar en la villa. El abad Oliba consagró la basílica en 1032, y la portada del siglo XII es, según Ripollès Turisme, candidata a Patrimonio de la Humanidad. Del saqueo y el incendio de 1835 se salvaron 231 volúmenes de la biblioteca, que hoy se conservan en el Archivo de la Corona de Aragón.",
          "Horario 2026: de verano (28 de marzo – 27 de septiembre), de 10 a 14 h y de 16 a 19 h; de invierno, de 10 a 13.30 h y de 15.30 a 18 h. Domingos y algunos festivos, de 10 a 14 h. Cierra el 25 y 26 de diciembre y el 1 y 6 de enero. Las entradas se venden hasta 30 minutos antes del cierre, y hay visita guiada sábados y domingos a las 12 h. Entrada general: 7,50 €; de 5 a 18 años, 3,50 €; menores de 5, gratis *(precios consultados el 20/10/2026)*.",
          "Al lado, el Museu Etnogràfic de Ripoll explica la comarca a través de los pastores, la forja y las armas de fuego ripollesas. Abre de martes a sábado y el domingo por la mañana, cierra los lunes, y la entrada general cuesta 4 €. Es gratis el último domingo de mes y para menores de 12 años.",
        ),
        ...h2(
          "Sant Joan de les Abadesses",
          "El otro gran monasterio de la comarca lo fundó Guifré el Pelós en 887 como el primer monasterio femenino de los condados catalanes, y la iglesia actual se consagró en 1150. Dentro está el Santíssim Misteri, un descendimiento de la cruz del siglo XIII tallado en madera. Entrada general: 5 € (consultado el 20/10/2026).",
        ),
        ...h2(
          "Sin coche: la vía verde del Hierro y del Carbón",
          "Entre Ripoll y Sant Joan de les Abadesses, el antiguo trazado del tren es una vía verde asfaltada, con una pendiente suave del 1 % y clasificada como accesible y de dificultad mínima. Sube de 682 m en Ripoll a 775 m en Sant Joan, y en total la ruta suma 18 km hasta Ogassa y Sant Pau de Segúries. Desde Sant Joan, la vía temática del Alt Ter sigue 21,76 km río arriba por Camprodon hasta Vilallonga de Ter.",
        ),
        ...h2(
          "El valle de Camprodon y Beget",
          "En Camprodon, el Pont Nou de finales del siglo XII es la imagen de la villa. Isaac Albéniz nació allí en 1860. En Beget, la iglesia románica de Sant Cristòfol guarda la Majestat, un Cristo del siglo XII de unos dos metros. Setcases tiene ${b2link(\"setcases\", \"es\", \"guía propia\")}.",
        ),
        ...h2(
          "Vall de Núria",
          "El cremallera sale de Ribes-Enllaç, para en Ribes-Vila y Queralbs, y en 40 minutos sube 1.000 metros en 12,5 km. Circula todo el año, pero a partir de principios de noviembre FGC reduce el servicio. El operador indica que la compra online es obligatoria, y hay tres aparcamientos gratuitos en las estaciones de acceso. Todo lo demás está en ${b2link(\"nuria\", \"es\", \"nuestra guía de Núria\")}.",
        ),
        ...h2(
          "Cómo llegar al Ripollès",
          "En coche, desde Barcelona por la C-17 (dirección Vic–Puigcerdà), y desde Girona por la A-26 hacia Olot y la N-260 hacia Ripoll. En autobús, TEISA une Barcelona con Ripoll y Camprodon pasando por Vic, y tiene líneas desde Girona y Olot. En tren, la R3 llega a Ripoll y a Ribes-Enllaç, pero desde el 7 de julio de 2026 solo circula entre La Garriga y Puigcerdà, y entre Barcelona y La Garriga o Vic hay un servicio de Rodalies por carretera. Comprueba el aviso vigente antes de viajar.",
        ),
        ...h2(
          "Información del parque natural",
          "El Parc Natural de les Capçaleres del Ter i del Freser tiene cuatro centros de información: en Queralbs, en la estación del cremallera de Núria, en Setcases y en Ulldeter. Los horarios no son iguales en todos.",
        ),
        ...h2(
          "Vall de Camprodon, Setcases y Vallter",
          `Setcases es una de las puertas del parque natural. ${b2link("setcases", "es", "Guía de Setcases")}.`,
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
        ...b2Related(["nuria", "setcases", "ski", "snow", "cerdanya"], "es"),
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
          "Ripoll: the monastery and the museum",
          "The monastery of Santa Maria de Ripoll is the main reason to stop in the town. Abbot Oliba consecrated the basilica in 1032. According to Ripollès Turisme, the 12th-century carved doorway is a candidate for UNESCO World Heritage status. When the monastery was sacked and burned in 1835, 231 volumes from its library were saved; they are now kept in the Archive of the Crown of Aragon.",
          "Opening hours in 2026: in summer (28 March – 27 September), 10:00–14:00 and 16:00–19:00; in winter, 10:00–13:30 and 15:30–18:00. On Sundays and some public holidays it opens 10:00–14:00. It is closed on 25–26 December and 1 and 6 January. Ticket sales stop 30 minutes before closing, and there is a guided tour at 12:00 on Saturdays and Sundays. Admission: €7.50 general; €3.50 for ages 5–18; free under 5 *(prices checked 20 Oct 2026)*.",
          "Next door, the Ripoll Ethnographic Museum tells the area's story through shepherding, the iron forge and the town's firearms trade. It opens Tuesday to Saturday and on Sunday mornings, is closed on Mondays, and charges €4 general admission. Entry is free on the last Sunday of each month and for under-12s.",
        ),
        ...h2(
          "Sant Joan de les Abadesses",
          "Wilfred the Hairy (Guifré el Pelós) founded the area's other great monastery in 887, the first convent for women in the Catalan counties. The present church was consecrated in 1150. Inside is the Santíssim Misteri, a 13th-century wooden Descent from the Cross. Admission: €5 general (checked 20 Oct 2026).",
        ),
        ...h2(
          "Without a car: the Iron and Coal greenway",
          "Between Ripoll and Sant Joan de les Abadesses, the old railway line is now an asphalt greenway with a gentle 1% gradient, rated accessible and of minimal difficulty. It climbs from 682 m at Ripoll to 775 m at Sant Joan, and the full route runs 18 km to Ogassa and Sant Pau de Segúries. From Sant Joan, the Alt Ter route continues 21.76 km up the river through Camprodon to Vilallonga de Ter.",
        ),
        ...h2(
          "The Camprodon valley and Beget",
          "In Camprodon, the late-12th-century Pont Nou bridge is the town's signature view, and the composer Isaac Albéniz was born here in 1860. In Beget, the Romanesque church of Sant Cristòfol holds the Majestat, a 12th-century robed Christ about two metres tall. Setcases has ${b2link(\"setcases\", \"en\", \"its own guide\")}.",
        ),
        ...h2(
          "Vall de Núria",
          "The rack railway leaves from Ribes-Enllaç and calls at Ribes-Vila and Queralbs. It climbs 1,000 metres over 12.5 km in 40 minutes. It runs all year, but FGC reduces the service from early November. The operator says tickets must be bought online, and there are three free car parks at the access stations. Everything else is in ${b2link(\"nuria\", \"en\", \"our Núria guide\")}.",
        ),
        ...h2(
          "Getting to Ripollès",
          "By car, take the C-17 from Barcelona (towards Vic and Puigcerdà). From Girona, take the A-26 towards Olot and then the N-260 to Ripoll. By bus, TEISA links Barcelona with Ripoll and Camprodon via Vic, and also runs lines from Girona and Olot. By rail, the R3 serves Ripoll and Ribes-Enllaç. Since 7 July 2026, however, trains have run only between La Garriga and Puigcerdà, with a Rodalies road service between Barcelona and La Garriga or Vic. Check the current notice before you travel.",
        ),
        ...h2(
          "Natural park information",
          "Capçaleres del Ter i del Freser Natural Park has four information centres: in Queralbs, at Núria's rack-railway station, in Setcases and at Ulldeter. Opening hours differ between them.",
        ),
        ...h2(
          "Setcases and Vallter",
          `Setcases is one of the gateways to the natural park. ${b2link("setcases", "en", "Our Setcases guide")}.`,
        ),
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
        ...b2Related(["nuria", "setcases", "ski", "snow", "cerdanya"], "en"),
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
    url: "https://parcsnaturals.gencat.cat/ca/xarxa-de-parcs/ter-freser/",
    publisher: "Generalitat de Catalunya",
  },
  { name: "Descobreix Setcases", url: "https://setcases.cat/coneix/descobreix-setcases/", publisher: "Ajuntament de Setcases" },
  {
    name: "Itineraris interpretatius del parc natural",
    url: "https://parcsnaturals.gencat.cat/ca/xarxa-de-parcs/ter-freser/gaudeix-del-parc/equipaments-i-itineraris/itineraris/itineraris-interpretatius-del-parc-natural/",
    publisher: "Parcs Naturals de Catalunya",
  },
  {
    name: "Oficines d'informació del parc natural",
    url: "https://parcsnaturals.gencat.cat/ca/xarxa-de-parcs/ter-freser/gaudeix-del-parc/equipaments-i-itineraris/equipaments/oficines-dinformacio/",
    publisher: "Parcs Naturals de Catalunya",
  },
  { name: "Horaris", url: "https://www.teisa-bus.com/ca/horaris", publisher: "TEISA" },
  { name: "R3: avís de servei", url: "https://rodalies.gencat.cat/ca/detalls/article/02_02_PAT_R3", publisher: "Rodalies de Catalunya" },
  { name: "Setcases, el municipi en xifres", url: "https://www.idescat.cat/emex/?id=171925", publisher: "Idescat" },
];

const SETCASES_VERIFIED = "2026-10-20";

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
          { label: "Altitud", value: "1.265 m (Idescat)" },
          { label: "Última verificació", value: "20 d'octubre de 2026" },
        ]),
        ...h2(
          "Al matí: el nucli",
          "Passeja pels carrers del poble i dedica temps al patrimoni i a l'arquitectura tradicional.",
        ),
        ...h2(
          "La Creueta",
          "Ripollès Turisme proposa un petit passeig d'uns deu minuts, de poc més de **300 metres** i uns **50 metres de desnivell**, per obtenir una bona perspectiva del poble.",
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
          "L'església de Sant Miquel",
          "L'església parroquial, dedicada a Sant Miquel Arcàngel, és de finals del segle XVII i es va aixecar damunt d'un temple romànic del segle XII, del qual encara queden restes a la base del campanar. El 1728 un incendi va enfonsar el teulat i l'antiga volta de fusta, i la reconstrucció es va acabar el 1729. A dins hi ha la peça que més val la pena: el retaule barroc de l'altar major, presidit per Sant Miquel. Va ser un dels pocs que es van salvar de la Guerra Civil i es va restaurar el 1983. L'Ajuntament ofereix un tour virtual de l'església al seu web.",
        ),
        ...h2(
          "Un passeig per la història del poble",
          "Pel nucli hi ha plaques que expliquen la vida d'abans: els molins, les fargues i les mines, els traginers, la transhumància, els antics hostals de la plaça Major. L'Ajuntament en publica la ruta en un fitxer descarregable, i és la manera més senzilla d'omplir un matí sense cotxe. El nom del poble també té la seva història. Segons Ripollès Turisme, un pastor i els seus set fills van baixar de la muntanya fugint de la neu, i cadascun s'hi va construir una cabana.",
        ),
        ...h2(
          "On són els miradors",
          "El Forat de l'Olla és a uns 5 km del poble en direcció a Vallter, amb vistes sobre el Ter i el Gra de Fajol, i el Collet de Xuriguera és just al costat, mirant a la vall del Carlat. La Baidana queda a uns 6 km, a la pista forestal que uneix Setcases amb Espinavell. El balcó de la Costa Brava és a 2.535 m, davant de la cafeteria Les Marmotes de Vallter, i s'hi pot pujar a peu per les pistes o amb el telecadira.",
        ),
        ...h2(
          "Passejades i excursions des del poble",
        ),
        table(
          "",
          ["Itinerari", "Distància", "Desnivell +", "Temps", "Dificultat"],
          [
            ["Camí dels Socarrats i dels Beduïs (circular)", "3,85 km", "350 m", "1 h 30 min", "Moderada"],
            ["Circ d'Ulldeter", "4,5 km", "345 m", "1 h 25 min", "Moderada"],
            ["Collada Fonda – Costabona – Balmeta", "8,2 km", "659 m", "3 h 45 min", "Exigent"],
            ["Carboner – Baidana – Cabanes – Setcases", "8,5 km", "710 m", "5 h", "Exigent"],
          ],
          "Font: itineraris interpretatius del Parc Natural (dificultat segons el mètode SENDIF). Consultat el 20 d'octubre de 2026.",
        ),
        ...paras(
          "Amb nens, l'Ajuntament recomana el camí dels Socarrats i dels Beduïs i el camí de les cabanyes i la fageda (1 h 15 min, més 45 minuts de tornada per carretera). Tots dos són per a infants a partir de 8 anys, no són aptes per a cotxets i es poden fer tot l'any excepte quan hi ha neu. Per caminar pel teu compte, l'Ajuntament també recomana l'app Natura Local, amb rutes autoguiades pel municipi.",
        ),
        ...h2(
          "Amb nens, a més",
          "El poble té zona d'esbarjo i parc infantil, i a l'estiu, la Platgeta. A Vallter, el telecadira també funciona a l'estiu. Segons l'Ajuntament, la pujada dura uns 20 minuts i els dies clars s'hi veuen el cap de Creus i el golf de Roses. Des de dalt es pot caminar fins al naixement del Ter. El 2026, la temporada d'estiu de Vallter va anar de l'1 de juliol al 30 d'agost; consulta les dates de cada any a l'operador.",
        ),
        ...h2(
          "El refugi d'Ulldeter",
          "Prop de Vallter, a 2.393 m, hi ha les restes del primer refugi d'Ulldeter, inaugurat el 25 de juliol de 1909. Ripollès Turisme el presenta com el primer refugi de muntanya de l'Estat. Avui està en ruïnes, amb una placa commemorativa.",
        ),
        ...h2(
          "Centres d'informació del parc natural",
          "Setcases aporta el 23 % de la superfície del Parc Natural de les Capçaleres del Ter i del Freser. El centre d'informació del poble és a l'aparcament de la Closa d'en Xola, a la carretera de Vallter (GIV-5264). A dalt, al pla de Morens, hi ha un segon centre al costat de l'aparcament superior de Vallter. Obre els caps de setmana de maig a finals d'octubre, els ponts i cada dia del 25 de juliol al 7 de setembre, és accessible per a persones amb mobilitat reduïda i tanca a l'hivern. Els horaris canvien segons el centre: abans d'anar-hi, truca al 667 116 811.",
        ),
        ...h2(
          "Com arribar-hi en transport públic",
          "El tren no arriba a Setcases. TEISA opera la línia d'autobús Setcases – Camprodon – Ripoll – Campdevànol, però la majoria d'expedicions comencen i acaben a Camprodon, i només unes poques pugen fins a Setcases. Mira l'horari vigent al web de TEISA abans de sortir. Ripoll té estació de la R3, però des del 7 de juliol de 2026 els trens circulen només entre la Garriga i Puigcerdà, amb menys freqüència. Entre Barcelona i la Garriga o Vic, Rodalies hi posa un servei per carretera. Consulta l'avís de Rodalies per al dia que viatges. A l'hivern, abans de pujar a Vallter, comprova l'estat de la carretera: el darrer tram és d'alta muntanya.",
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
          { label: "Altitud", value: "1.265 m (Idescat)" },
          { label: "Última verificación", value: "20 de octubre de 2026" },
        ]),
        ...h2(
          "La Creueta",
          "Es un paseo corto de poco más de **300 metros** y unos **50 metros de desnivel**, de unos diez minutos, con una buena perspectiva del pueblo.",
        ),
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
          "La iglesia de Sant Miquel",
          "La iglesia parroquial, dedicada a San Miguel Arcángel, es de finales del siglo XVII y se levantó sobre un templo románico del siglo XII, del que aún quedan restos en la base del campanario. En 1728 un incendio hundió el tejado y la antigua bóveda de madera, y la reconstrucción terminó en 1729. Dentro está lo mejor: el retablo barroco del altar mayor, presidido por San Miguel. Fue uno de los pocos que se salvaron de la Guerra Civil y se restauró en 1983. El Ayuntamiento ofrece un tour virtual de la iglesia en su web.",
        ),
        ...h2(
          "Un paseo por la historia del pueblo",
          "Repartidas por el casco hay placas que cuentan la vida de antes: los molinos, las forjas y las minas, los arrieros, la trashumancia, las antiguas posadas de la plaza Mayor. El Ayuntamiento publica la ruta en un archivo descargable. El nombre del pueblo tiene leyenda: según Ripollès Turisme, un pastor y sus siete hijos bajaron de la montaña huyendo de la nieve, y cada hijo se construyó una cabaña.",
        ),
        ...h2(
          "Dónde están los miradores",
          "El Forat de l'Olla está a unos 5 km del pueblo en dirección a Vallter, con vistas sobre el Ter y el Gra de Fajol, y el Collet de Xuriguera queda justo al lado, mirando al valle del Carlat. La Baidana está a unos 6 km, en la pista forestal que une Setcases con Espinavell. El balcón de la Costa Brava está a 2.535 m, frente a la cafetería Les Marmotes de Vallter, y se llega a pie por las pistas o en telesilla.",
        ),
        ...h2(
          "Paseos y excursiones desde el pueblo",
        ),
        table(
          "",
          ["Itinerario", "Distancia", "Desnivel +", "Tiempo", "Dificultad"],
          [
            ["Camí dels Socarrats i dels Beduïs (circular)", "3,85 km", "350 m", "1 h 30 min", "Moderada"],
            ["Circo de Ulldeter", "4,5 km", "345 m", "1 h 25 min", "Moderada"],
            ["Collada Fonda – Costabona – Balmeta", "8,2 km", "659 m", "3 h 45 min", "Exigente"],
            ["Carboner – Baidana – Cabanes – Setcases", "8,5 km", "710 m", "5 h", "Exigente"],
          ],
          "Fuente: itinerarios interpretativos del Parque Natural (dificultad según el método SENDIF). Consultado el 20 de octubre de 2026.",
        ),
        ...paras(
          "Con niños, el Ayuntamiento recomienda el camino dels Socarrats i dels Beduïs y el camino de las cabañas y el hayedo (1 h 15 min, más 45 minutos de vuelta por carretera). Los dos son para niños a partir de 8 años, no son aptos para cochecitos y se pueden hacer todo el año salvo con nieve. Para caminar por tu cuenta, el Ayuntamiento también recomienda la app Natura Local, con rutas autoguiadas.",
        ),
        ...h2(
          "Con niños, además",
          "El pueblo tiene zona de recreo y parque infantil, y en verano, la Platgeta. En Vallter, el telesilla también funciona en verano. Según el Ayuntamiento, la subida dura unos 20 minutos y los días claros se ven el cabo de Creus y el golfo de Roses. Desde arriba se puede caminar hasta el nacimiento del Ter. En 2026, la temporada de verano de Vallter fue del 1 de julio al 30 de agosto; consulta las fechas de cada año con el operador.",
        ),
        ...h2(
          "El refugio de Ulldeter",
          "Cerca de Vallter, a 2.393 m, quedan los restos del primer refugio de Ulldeter, inaugurado el 25 de julio de 1909. Ripollès Turisme lo presenta como el primer refugio de montaña del Estado. Hoy está en ruinas, con una placa conmemorativa.",
        ),
        ...h2(
          "Centros de información del parque natural",
          "Setcases aporta el 23 % de la superficie del Parc Natural de les Capçaleres del Ter i del Freser. El centro de información del pueblo está en el aparcamiento de la Closa d'en Xola, en la carretera de Vallter (GIV-5264). Arriba, en el pla de Morens, hay un segundo centro junto al aparcamiento superior de Vallter. Abre los fines de semana de mayo a finales de octubre, los puentes y a diario del 25 de julio al 7 de septiembre, es accesible para personas con movilidad reducida y cierra en invierno. Los horarios varían según el centro: antes de ir, llama al 667 116 811.",
        ),
        ...h2(
          "Cómo llegar en transporte público",
          "El tren no llega a Setcases. TEISA opera la línea de autobús Setcases – Camprodon – Ripoll – Campdevànol, pero la mayoría de las expediciones empiezan y terminan en Camprodon, y solo unas pocas suben hasta Setcases. Mira el horario vigente en la web de TEISA antes de salir. Ripoll tiene estación de la R3, pero desde el 7 de julio de 2026 los trenes solo circulan entre La Garriga y Puigcerdà, con menos frecuencia. Entre Barcelona y La Garriga o Vic, Rodalies pone un servicio por carretera. Consulta el aviso de Rodalies para el día del viaje. En invierno, antes de subir a Vallter, comprueba el estado de la carretera: el último tramo es de alta montaña.",
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
          { label: "Altitude", value: "1,265 m (Idescat)" },
          { label: "Last verified", value: "20 October 2026" },
        ]),
        ...h2(
          "La Creueta",
          "The walk is only a little over **300 metres** long with roughly **50 metres** of elevation gain, about ten minutes, for one of the best views over the village.",
        ),
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
          "The church of Sant Miquel",
          "The parish church, dedicated to Saint Michael the Archangel, dates from the late 17th century. It was built over a 12th-century Romanesque church, and remains of the older building survive at the base of the bell tower. A fire in 1728 brought down the roof and the original timber vault, and the rebuilding was finished in 1729. The highlight is inside: the baroque main altarpiece with Saint Michael at its centre. It was one of the few altarpieces to survive the Civil War, and it was restored in 1983. The town council's website has a virtual tour of the church.",
        ),
        ...h2(
          "A walk through the village's history",
          "Plaques around the village explain how people lived here: the mills, the forges and mines, the muleteers, transhumance, the old inns on the main square. The council publishes the route as a download. Even the name has a story. Ripollès Turisme tells of a shepherd and his seven sons who came down from the mountain to escape the snow, and of the hut that each son built.",
        ),
        ...h2(
          "Where the lookouts are",
          "Forat de l'Olla is about 5 km from the village on the road towards Vallter, looking over the Ter and Gra de Fajol. Collet de Xuriguera is right beside it, facing the Carlat valley. La Baidana is about 6 km out, on the forest track between Setcases and Espinavell. The Costa Brava balcony stands at 2,535 m, in front of the Les Marmotes café at Vallter. You can reach it on foot up the slopes or by chairlift.",
        ),
        ...h2(
          "Walks from the village",
        ),
        table(
          "",
          ["Route", "Distance", "Ascent", "Time", "Difficulty"],
          [
            ["Socarrats and Beduïs path (loop)", "3.85 km", "350 m", "1 h 30 min", "Moderate"],
            ["Ulldeter cirque", "4.5 km", "345 m", "1 h 25 min", "Moderate"],
            ["Collada Fonda – Costabona – Balmeta", "8.2 km", "659 m", "3 h 45 min", "Demanding"],
            ["Carboner – Baidana – Cabanes – Setcases", "8.5 km", "710 m", "5 h", "Demanding"],
          ],
          "Source: the natural park's interpretive routes (difficulty graded with the SENDIF method). Checked 20 October 2026.",
        ),
        ...paras(
          "With children, the council suggests the Socarrats and Beduïs path, or the path through the huts and the beech wood (1 h 15 min plus 45 minutes back by road). Both are recommended from age 8, neither suits a pushchair, and both can be walked all year except when there is snow. For self-guided walks, the council also recommends the Natura Local app.",
        ),
        ...h2(
          "More for families",
          "The village has a playground and leisure area, and in summer a spot known as La Platgeta. At Vallter the chairlift also runs in summer. The council describes a ride of about 20 minutes, with views on clear days as far as Cap de Creus and the Bay of Roses. From the top you can walk to the source of the Ter. In 2026 Vallter's summer season ran from 1 July to 30 August, so check each year's dates with the operator.",
        ),
        ...h2(
          "The Ulldeter refuge",
          "Near Vallter, at 2,393 m, are the remains of the first Ulldeter refuge, opened on 25 July 1909. Ripollès Turisme describes it as the first mountain refuge in Spain. Today it is a ruin with a commemorative plaque.",
        ),
        ...h2(
          "Natural park information centres",
          "Setcases holds 23% of the area of Capçaleres del Ter i del Freser Natural Park. The village information centre is at the Closa d'en Xola car park on the Vallter road (GIV-5264). A second centre stands higher up on the Pla de Morens, next to Vallter's upper car park. It opens at weekends from May to late October, on long weekends, and daily from 25 July to 7 September. It is accessible to visitors with reduced mobility and closes in winter. Opening hours differ between centres, so call +34 667 116 811 before you go.",
        ),
        ...h2(
          "Getting there by public transport",
          "The train does not reach Setcases. TEISA runs a Setcases – Camprodon – Ripoll – Campdevànol bus, but most journeys start and end in Camprodon and only a few go up to Setcases, so check the current timetable on TEISA's website first. Ripoll is on the R3 rail line. Since 7 July 2026, however, R3 trains have run only between La Garriga and Puigcerdà, with a reduced service, and Rodalies operates a replacement road service between Barcelona and La Garriga or Vic. Check the Rodalies notice for your travel date. In winter, check road conditions before driving up to Vallter: the last stretch is high-mountain road.",
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
        ...b2Related(["ski", "nuria", "cerdanya", "ripolles", "setcases"], "ca"),
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
        ...b2Related(["ski", "nuria", "cerdanya", "ripolles", "setcases"], "es"),
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
        ...b2Related(["ski", "nuria", "cerdanya", "ripolles", "setcases"], "en"),
      ],
    },
  },
};
