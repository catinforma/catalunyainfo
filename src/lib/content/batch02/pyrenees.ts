import { link } from "@/lib/content/features/shared";

import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  h3,
  keyFacts,
  lead,
  paras,
  table,
  verifiedLine,
  type B2Article,
} from "./shared";

/**
 * The Pyrenees cluster: the Ripollès hub and Setcases as its first satellite.
 * The snow guide lives in snow-trips.ts since 13 Nov 2026 (re-exported below).
 *
 * The Ripollès page is a destination hub, not a listicle — it exists to be the
 * parent of Setcases, Camprodon, Vall de Núria and the rest as those are
 * written, and it is built so that adding one is a link and not a rewrite.
 * Search sends it people looking for Ripoll itself, so the town comes first:
 * the monastery's hours and prices, and the R3 trains that reach it.
 *
 * The snow guide is the one place on the site most likely to be read as a
 * promise, so it says twice, in the lead and in a callout, that it is not a
 * snow report. Whether there is snow on a given day is a question for the
 * operator on that day, and the page never answers it.
 *
 * Re-checked on 24 Oct 2026:
 * - Monastery of Ripoll hours and prices (monestirderipoll.cat) and the
 *   Ethnographic Museum's hours and tariffs (museuderipoll.org).
 * - R3: the Rodalies notice (updated 06.07.2026) and the train timetable sheet
 *   "a partir del 06.07", version updated 16/09/2026. Counts and first/last
 *   trains were read off that sheet; only rows marked as R3 trains (not
 *   buses, not weekday-only) were used.
 * - Idescat EMEX for Ripoll (10,812 inhabitants in 2025, 691 m) and Setcases
 *   (196 inhabitants in 2025, 1,265 m).
 * - The park's information-centre list and Setcases' interpretive routes.
 * - PIRINEU365 activity and transport pages for the six FGC resorts, Guils
 *   for Tot Nòrdic, TEISA's line list.
 *
 * Removed because they could not be re-checked today: the Sant Joan de les
 * Abadesses entry price (its site did not answer), the "three free car parks"
 * line on the Núria rack railway (not on the operator's page; the Núria guide
 * carries its own), and the opening calendar of the Ulldeter centre (published
 * only as a colour-coded PDF).
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
  { name: "Tarifes", url: "https://www.museuderipoll.org/tarifes/", publisher: "Museu Etnogràfic de Ripoll" },
  { name: "Ripoll, el municipi en xifres", url: "https://www.idescat.cat/emex/?id=171479", publisher: "Idescat" },
  { name: "Ruta del Ferro i del Carbó", url: "https://www.viesverdes.cat/rutes_vies_verdes/ruta-del-ferro-i-del-carbo/", publisher: "Vies Verdes de Girona" },
  { name: "Cremallera de Núria", url: "https://turistren.cat/trens/cremallera-de-nuria/", publisher: "FGC Turistren" },
  { name: "Com arribar", url: "https://ripollesturisme.cat/planifica-la-teva-visita/com-arribar/", publisher: "Ripollès Turisme" },
  { name: "Horaris", url: "https://www.teisa-bus.com/ca/horaris", publisher: "TEISA" },
  { name: "R3: avís de servei", url: "https://rodalies.gencat.cat/ca/detalls/article/02_02_PAT_R3", publisher: "Rodalies de Catalunya" },
  {
    name: "R3: horaris de tren fins a la Tor de Querol a partir del 06.07",
    url: "https://rodalies.gencat.cat/web/.content/01_Actualitat/2026/02_02_PAT_R3/R3-Horaris-tren-fins-La-Tor-de-Querol-a-partir-06.07_V7.pdf",
    publisher: "Rodalies de Catalunya",
  },
];

const RIPOLLES_VERIFIED = "2026-10-28";

const RIPOLL_HOURS: Record<"ca" | "es" | "en", string[][]> = {
  ca: [
    ["Horari d'hivern (29 de setembre – 31 de març)", "10.00–13.30 i 15.30–18.00"],
    ["Horari d'estiu (28 de març – 27 de setembre de 2026)", "10.00–14.00 i 16.00–19.00"],
    ["Diumenges i alguns festius", "10.00–14.00"],
    ["24 i 31 de desembre, 5 de gener", "10.00–14.00"],
    ["25 i 26 de desembre, 1 i 6 de gener", "Tancat"],
    ["Visita guiada", "Dissabtes i diumenges a les 12.00"],
  ],
  es: [
    ["Horario de invierno (29 de septiembre – 31 de marzo)", "10:00–13:30 y 15:30–18:00"],
    ["Horario de verano (28 de marzo – 27 de septiembre de 2026)", "10:00–14:00 y 16:00–19:00"],
    ["Domingos y algunos festivos", "10:00–14:00"],
    ["24 y 31 de diciembre, 5 de enero", "10:00–14:00"],
    ["25 y 26 de diciembre, 1 y 6 de enero", "Cerrado"],
    ["Visita guiada", "Sábados y domingos a las 12:00"],
  ],
  en: [
    ["Winter (29 September – 31 March)", "10:00–13:30 and 15:30–18:00"],
    ["Summer (28 March – 27 September 2026)", "10:00–14:00 and 16:00–19:00"],
    ["Sundays and some holidays", "10:00–14:00"],
    ["24 and 31 December, 5 January", "10:00–14:00"],
    ["25 and 26 December, 1 and 6 January", "Closed"],
    ["Guided tour", "Saturdays and Sundays at 12:00"],
  ],
};

const RIPOLL_PRICES: Record<"ca" | "es" | "en", string[][]> = {
  ca: [
    ["Entrada general", "7,50 €"],
    ["Majors de 65 anys, joves fins a 25 anys, aturats, famílies nombroses o monoparentals", "5,50 €"],
    ["De 5 a 18 anys", "3,50 €"],
    ["Menors de 5 anys i residents a Ripoll", "Gratuït"],
  ],
  es: [
    ["Entrada general", "7,50 €"],
    ["Mayores de 65, jóvenes hasta 25 años, parados, familias numerosas o monoparentales", "5,50 €"],
    ["De 5 a 18 años", "3,50 €"],
    ["Menores de 5 años y residentes en Ripoll", "Gratis"],
  ],
  en: [
    ["General admission", "€7.50"],
    ["Over-65s, young people up to 25, unemployed, large or single-parent families", "€5.50"],
    ["Ages 5 to 18", "€3.50"],
    ["Under-5s and Ripoll residents", "Free"],
  ],
};

const RIPOLL_TRAINS: Record<"ca" | "es" | "en", string[][]> = {
  ca: [
    ["Trens de la Garriga a Ripoll", "13 al dia; el primer surt a les 6.46 (arriba a Ripoll a les 8.10) i l'últim a les 18.46 (arriba a les 20.10)"],
    ["Trens de Ripoll a la Garriga", "15 al dia; el primer surt a les 6.15 i l'últim a les 18.41 (arriba a la Garriga a les 20.06)"],
    ["Durada la Garriga – Ripoll", "Entre 1 h 19 min i 1 h 28 min"],
    ["Barcelona – la Garriga", "Sense trens: bus directe de Rodalies a la Garriga o a Vic"],
  ],
  es: [
    ["Trenes de La Garriga a Ripoll", "13 al día; el primero sale a las 6:46 (llega a Ripoll a las 8:10) y el último a las 18:46 (llega a las 20:10)"],
    ["Trenes de Ripoll a La Garriga", "15 al día; el primero sale a las 6:15 y el último a las 18:41 (llega a La Garriga a las 20:06)"],
    ["Duración La Garriga – Ripoll", "Entre 1 h 19 min y 1 h 28 min"],
    ["Barcelona – La Garriga", "Sin trenes: bus directo de Rodalies a La Garriga o a Vic"],
  ],
  en: [
    ["Trains from La Garriga to Ripoll", "13 a day; the first leaves at 6:46 (arrives in Ripoll 8:10), the last at 18:46 (arrives 20:10)"],
    ["Trains from Ripoll to La Garriga", "15 a day; the first leaves at 6:15, the last at 18:41 (arrives in La Garriga 20:06)"],
    ["La Garriga – Ripoll journey", "Between 1 h 19 min and 1 h 28 min"],
    ["Barcelona – La Garriga", "No trains: Rodalies direct bus to La Garriga or Vic"],
  ],
};

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
      title: "Ripoll i la comarca del Ripollès: què veure, el monestir, pobles bonics i com arribar-hi",
      seoTitle: "Ripoll i el Ripollès: què veure a la comarca i pobles",
      seoDescription:
        "Què veure a Ripoll i al Ripollès: horari i preu del monestir de Santa Maria, trens R3, Sant Joan de les Abadesses, Camprodon, Beget, Setcases i Núria.",
      excerpt:
        "Ripoll i el seu monestir, i la resta de la comarca: Sant Joan, Camprodon, Beget, Setcases i Núria. Horaris, preus i trens consultats a les fonts oficials.",
      blocks: [
        lead(
          "**Ripoll**, la capital del Ripollès (10.812 habitants, a 691 m), és la porta de la comarca, i el seu gran monument és el **monestir de Santa Maria de Ripoll**: en horari d'hivern obre de 10 a 13.30 h i de 15.30 a 18 h, i l'entrada general costa 7,50 €. S'hi arriba en tren amb l'**R3** i, des d'aquí, el Ripollès s'obre cap a Sant Joan de les Abadesses, la vall de Camprodon, Setcases i la Vall de Núria.",
        ),
        keyFacts("Ripoll i el Ripollès en dades", [
          { label: "Població de Ripoll", value: "10.812 habitants (Idescat, 2025)" },
          { label: "Altitud de Ripoll", value: "691 m" },
          { label: "Comarca del Ripollès", value: "19 municipis, 956,6 km², 25.914 habitants" },
          { label: "Monestir de Ripoll", value: "Entrada general 7,50 €" },
          { label: "Tren", value: "R3: 13 trens al dia de la Garriga a Ripoll" },
          { label: "Última verificació", value: "28 d'octubre de 2026" },
        ]),
        ...h2(
          "La comarca del Ripollès",
          "El Ripollès és una comarca de la província de Girona, al Pirineu: **19 municipis**, **956,6 km²** i **25.914 habitants** (Idescat, 2025), amb **Ripoll** com a capital. Ocupa les capçaleres del Ter i del Freser, de les valls de Camprodon i de Ribes fins als cims de Vallter i Núria, i té des de pobles de pedra d'alta muntanya fins a dos dels grans monestirs romànics de Catalunya.",
        ),
        table(
          "Pobles bonics a prop de Ripoll",
          ["Poble", "Per què anar-hi"],
          [
            ["Sant Joan de les Abadesses", "L'altre gran monestir de la comarca, fundat el 887, amb el Santíssim Misteri; s'hi arriba des de Ripoll per la via verda"],
            ["Camprodon", "El pont Nou de finals del segle XII; Isaac Albéniz hi va néixer el 1860"],
            ["Beget", "L'església romànica de Sant Cristòfol i la Majestat, un Crist del segle XII"],
            ["Setcases", "Cases de pedra a 1.265 m, a l'alta vall del Ter, i la porta de Vallter"],
            ["Queralbs", "L'última parada del cremallera on s'arriba amb cotxe i l'inici del Camí Vell de Núria"],
            ["Ribes de Freser", "D'on surt el cremallera de la Vall de Núria, al costat de l'estació de l'R3"],
          ],
          "Tots són municipis del Ripollès segons l'Idescat, excepte Beget, que pertany a Camprodon.",
        ),
        ...h2(
          "Què veure a Ripoll: el monestir de Santa Maria",
          "El monestir de Santa Maria de Ripoll és el motiu principal per aturar-se a la vila. La basílica la va consagrar l'abat Oliba el 1032, i la portalada del segle XII és, segons Ripollès Turisme, candidata a Patrimoni de la Humanitat. Del saqueig i l'incendi de 1835 es van salvar 231 volums de la biblioteca, que avui es conserven a l'Arxiu de la Corona d'Aragó.",
          "Les entrades es venen fins a 30 minuts abans de tancar, i el monestir recomana reservar la visita guiada al 972 70 42 03.",
        ),
        table("Horari del monestir de Ripoll", ["Període", "Horari"], RIPOLL_HOURS.ca, "Font: Monestir de Santa Maria de Ripoll. Consultat el 28 d'octubre de 2026. Els diumenges i festius, convé confirmar-ho per telèfon."),
        table("Preu de l'entrada al monestir de Ripoll", ["Entrada", "Preu"], RIPOLL_PRICES.ca, "Hi ha venda d'entrades en línia. Preus consultats el 28/10/2026."),
        ...h3(
          "El Museu Etnogràfic de Ripoll",
          "Al costat, a la mateixa plaça de l'Abat Oliba, el Museu Etnogràfic explica la comarca a través dels pastors, la farga i les armes de foc ripolleses. De setembre a juny obre de dimarts a dissabte de 10 a 13.30 h i de 16 a 18 h, i els diumenges i festius de 10 a 14 h; al juliol i l'agost tanca a les 19 h. Tanca els dilluns. Entrada general 4 €, reduïda 3 €; gratuït per als menors de 12 anys i l'últim diumenge de mes.",
        ),
        ...h2("Com arribar a Ripoll en tren (R3)"),
        ...paras(
          "Ripoll té estació de l'**R3**, però per les obres d'Adif no hi ha trens entre Barcelona i la Garriga: aquest tram es fa amb els autobusos directes de Rodalies fins a la Garriga o Vic, i des de la Garriga l'R3 puja cap a Ripoll i Puigcerdà amb la meitat dels trens d'abans del 20 de gener.",
        ),
        table("Trens R3 entre la Garriga i Ripoll", ["", "Horari"], RIPOLL_TRAINS.ca, "Horari de tren vigent des del 6 de juliol de 2026 (full actualitzat el 16/09/2026), cada dia. Consultat el 28/10/2026: comprova'l a rodalies.gencat.cat el dia que viatgis."),
        ...paras(
          "En autobús, TEISA uneix Barcelona amb Ripoll i Camprodon passant per Vic, i també hi té línies des de Girona i Olot. En cotxe, des de Barcelona per la C-17 (direcció Vic–Puigcerdà), i des de Girona per l'A-26 cap a Olot i la N-260 cap a Ripoll.",
        ),
        ...h2(
          "Sant Joan de les Abadesses",
          "L'altre gran monestir de la comarca el va fundar Guifré el Pelós el 887 com el primer monestir femení dels comtats catalans, i l'església actual es va consagrar el 1150. A dins hi ha el Santíssim Misteri, un davallament de la creu del segle XIII tallat en fusta.",
        ),
        ...h2(
          "Sense cotxe: la via verda del Ferro i del Carbó",
          "Entre Ripoll i Sant Joan de les Abadesses, l'antiga via del tren és una via verda asfaltada, amb un pendent suau de l'1 % i classificada com a accessible i de dificultat mínima. Puja de 682 m a Ripoll a 775 m a Sant Joan, i en total la ruta arriba als 18 km fins a Ogassa i Sant Pau de Segúries. Des de Sant Joan, la via temàtica de l'Alt Ter continua 21,76 km riu amunt per Camprodon fins a Vilallonga de Ter.",
        ),
        ...h2(
          "La vall de Camprodon i Beget",
          `A Camprodon, el pont Nou de finals del segle XII és la imatge de la vila. Isaac Albéniz hi va néixer el 1860. A Beget, l'església romànica de Sant Cristòfol guarda la Majestat, un Crist del segle XII d'uns dos metres. Setcases té ${b2link("setcases", "ca", "guia pròpia")}.`,
        ),
        ...h2(
          "Vall de Núria",
          `El cremallera surt de Ribes-Enllaç, para a Ribes-Vila i Queralbs, i en 40 minuts puja 1.000 metres en 12,5 km. Circula tot l'any, però a partir de començaments de novembre FGC en redueix el servei, i l'operador indica que la compra en línia és obligatòria. Tota la resta és a ${b2link("nuria", "ca", "la nostra guia de Núria")}.`,
        ),
        ...h2(
          "Informació del parc natural",
          "El Parc Natural de les Capçaleres del Ter i del Freser té quatre centres d'informació: a Queralbs, a l'estació del cremallera de Núria, a Setcases i a Ulldeter, a la base de Vallter. Els horaris no són els mateixos a tots: el parc atén al 667 116 811.",
        ),
        ...h2(
          "Setcases i Vallter",
          "Setcases és una de les portes del Parc Natural de les Capçaleres del Ter i del Freser i connecta directament amb l'entorn de Vallter.",
          `N'hem escrit una guia a part: ${b2link("setcases", "ca", "què veure a Setcases")}. A l'hivern, mira ${b2link("ski", "ca", "les estacions d'esquí de Catalunya")} o ${b2link("snow", "ca", "on veure neu sense esquiar")}.`,
        ),
        ...h2("Quants dies?"),
        table(
          "Com repartir els dies al Ripollès",
          ["Temps", "Què hi cap"],
          [
            ["1 dia", "Ripoll i Sant Joan de les Abadesses, o una sola vall"],
            ["2 dies", "Combina patrimoni i muntanya"],
            ["3 dies", "Ripoll, Vall de Ribes/Núria i vall de Camprodon"],
          ],
          "Una recomanació editorial sobre com repartir la visita, no una promesa de temps de conducció.",
        ),
        ...paras(
          `Si hi vas a la temporada de bolets, tenim el ${link("mushrooms", "ca", "part setmanal de condicions")}.`,
        ),
        faq([
          { question: "Què veure a Ripoll?", answer: "El monestir de Santa Maria, amb la portalada romànica del segle XII, i el Museu Etnogràfic, a la mateixa plaça. Amb una tarda més, la via verda fins a Sant Joan de les Abadesses." },
          { question: "Quant costa entrar al monestir de Ripoll?", answer: "L'entrada general costa 7,50 €; 5,50 € per a majors de 65 anys i joves fins a 25; 3,50 € de 5 a 18 anys; gratuït per a menors de 5 anys i residents (preus consultats el 28/10/2026)." },
          { question: "Com s'arriba a Ripoll en tren des de Barcelona?", answer: "Amb l'R3. Mentre durin les obres, de Barcelona a la Garriga o Vic es va amb el bus directe de Rodalies i d'allà amb el tren; de la Garriga a Ripoll hi ha 13 trens al dia." },
          { question: "Quina altitud té Ripoll?", answer: "691 metres, segons l'Idescat." },
          { question: "Quina és la capital del Ripollès i quants municipis té?", answer: "La capital és Ripoll. La comarca té 19 municipis, 956,6 km² i 25.914 habitants, segons l'Idescat (2025)." },
          { question: "Quins pobles bonics hi ha a prop de Ripoll?", answer: "Sant Joan de les Abadesses, Camprodon, Beget, Setcases, Queralbs i Ribes de Freser, d'on surt el cremallera de Núria." },
        ]),
        ...paras(verifiedLine("ca", RIPOLLES_VERIFIED)),
        ...b2Related(["nuria", "setcases", "ski", "snow", "cerdanya"], "ca"),
      ],
    },

    es: {
      path: "destinos/ripolles",
      title: "Ripoll y la comarca del Ripollès: qué ver, el monasterio, pueblos bonitos y cómo llegar",
      seoTitle: "Ripoll y la comarca del Ripollès: qué ver y pueblos",
      seoDescription:
        "Qué ver en Ripoll y el Ripollès: horario y precio del monasterio de Santa Maria, trenes R3, Sant Joan de les Abadesses, Camprodon, Beget, Setcases y Núria.",
      excerpt:
        "Ripoll y su monasterio, y el resto de la comarca: Sant Joan, Camprodon, Beget, Setcases y Núria. Horarios, precios y trenes consultados en las fuentes oficiales.",
      blocks: [
        lead(
          "**Ripoll**, capital del Ripollès (10.812 habitantes, a 691 m), es la puerta de la comarca, y su gran monumento es el **monasterio de Santa Maria de Ripoll**: en horario de invierno abre de 10 a 13:30 y de 15:30 a 18 h, y la entrada general cuesta 7,50 €. Se llega en tren con la **R3** y, desde aquí, el Ripollès se abre hacia Sant Joan de les Abadesses, el valle de Camprodon, Setcases y la Vall de Núria.",
        ),
        keyFacts("Ripoll y el Ripollès en datos", [
          { label: "Población de Ripoll", value: "10.812 habitantes (Idescat, 2025)" },
          { label: "Altitud de Ripoll", value: "691 m" },
          { label: "Comarca del Ripollès", value: "19 municipios, 956,6 km², 25.914 habitantes" },
          { label: "Monasterio de Ripoll", value: "Entrada general 7,50 €" },
          { label: "Tren", value: "R3: 13 trenes al día de La Garriga a Ripoll" },
          { label: "Última verificación", value: "28 de octubre de 2026" },
        ]),
        ...h2(
          "La comarca del Ripollès",
          "El Ripollès es una comarca de la provincia de Girona, en el Pirineo: **19 municipios**, **956,6 km²** y **25.914 habitantes** (Idescat, 2025), con **Ripoll** como capital. Ocupa las cabeceras del Ter y del Freser, de los valles de Camprodon y de Ribes hasta las cumbres de Vallter y Núria, y tiene desde pueblos de piedra de alta montaña hasta dos de los grandes monasterios románicos de Cataluña.",
        ),
        table(
          "Pueblos bonitos cerca de Ripoll",
          ["Pueblo", "Por qué ir"],
          [
            ["Sant Joan de les Abadesses", "El otro gran monasterio de la comarca, fundado en 887, con el Santíssim Misteri; se llega desde Ripoll por la vía verde"],
            ["Camprodon", "El Pont Nou de finales del siglo XII; Isaac Albéniz nació allí en 1860"],
            ["Beget", "La iglesia románica de Sant Cristòfol y la Majestat, un Cristo del siglo XII"],
            ["Setcases", "Casas de piedra a 1.265 m, en el alto valle del Ter, y la puerta de Vallter"],
            ["Queralbs", "La última parada del cremallera a la que se llega en coche y el inicio del Camí Vell de Núria"],
            ["Ribes de Freser", "De donde sale el cremallera de la Vall de Núria, junto a la estación de la R3"],
          ],
          "Todos son municipios del Ripollès según el Idescat, salvo Beget, que pertenece a Camprodon.",
        ),
        ...h2(
          "Qué ver en Ripoll: el monasterio de Santa Maria",
          "El monasterio de Santa Maria de Ripoll es la razón principal para parar en la villa. El abad Oliba consagró la basílica en 1032, y la portada del siglo XII es, según Ripollès Turisme, candidata a Patrimonio de la Humanidad. Del saqueo y el incendio de 1835 se salvaron 231 volúmenes de la biblioteca, que hoy se conservan en el Archivo de la Corona de Aragón.",
          "Las entradas se venden hasta 30 minutos antes del cierre, y el monasterio recomienda reservar la visita guiada en el 972 70 42 03.",
        ),
        table("Horario del monasterio de Ripoll", ["Periodo", "Horario"], RIPOLL_HOURS.es, "Fuente: Monestir de Santa Maria de Ripoll. Consultado el 28 de octubre de 2026. Domingos y festivos, conviene confirmarlo por teléfono."),
        table("Precio de la entrada al monasterio de Ripoll", ["Entrada", "Precio"], RIPOLL_PRICES.es, "Hay venta de entradas online. Precios consultados el 28/10/2026."),
        ...h3(
          "El Museu Etnogràfic de Ripoll",
          "Al lado, en la misma plaza del Abat Oliba, el Museu Etnogràfic explica la comarca a través de los pastores, la forja y las armas de fuego ripollesas. De septiembre a junio abre de martes a sábado de 10 a 13:30 y de 16 a 18 h, y domingos y festivos de 10 a 14 h; en julio y agosto cierra a las 19 h. Cierra los lunes. Entrada general 4 €, reducida 3 €; gratis para menores de 12 años y el último domingo de mes.",
        ),
        ...h2("Cómo llegar a Ripoll en tren (R3)"),
        ...paras(
          "Ripoll tiene estación de la **R3**, pero por las obras de Adif no hay trenes entre Barcelona y La Garriga: ese tramo se hace con los autobuses directos de Rodalies hasta La Garriga o Vic, y desde La Garriga la R3 sube hacia Ripoll y Puigcerdà con la mitad de los trenes que había antes del 20 de enero.",
        ),
        table("Trenes R3 entre La Garriga y Ripoll", ["", "Horario"], RIPOLL_TRAINS.es, "Horario de tren vigente desde el 6 de julio de 2026 (hoja actualizada el 16/09/2026), todos los días. Consultado el 28/10/2026: compruébalo en rodalies.gencat.cat el día que viajes."),
        ...paras(
          "En autobús, TEISA une Barcelona con Ripoll y Camprodon pasando por Vic, y tiene líneas desde Girona y Olot. En coche, desde Barcelona por la C-17 (dirección Vic–Puigcerdà), y desde Girona por la A-26 hacia Olot y la N-260 hacia Ripoll.",
        ),
        ...h2(
          "Sant Joan de les Abadesses",
          "El otro gran monasterio de la comarca lo fundó Guifré el Pelós en 887 como el primer monasterio femenino de los condados catalanes, y la iglesia actual se consagró en 1150. Dentro está el Santíssim Misteri, un descendimiento de la cruz del siglo XIII tallado en madera.",
        ),
        ...h2(
          "Sin coche: la vía verde del Hierro y del Carbón",
          "Entre Ripoll y Sant Joan de les Abadesses, el antiguo trazado del tren es una vía verde asfaltada, con una pendiente suave del 1 % y clasificada como accesible y de dificultad mínima. Sube de 682 m en Ripoll a 775 m en Sant Joan, y en total la ruta suma 18 km hasta Ogassa y Sant Pau de Segúries. Desde Sant Joan, la vía temática del Alt Ter sigue 21,76 km río arriba por Camprodon hasta Vilallonga de Ter.",
        ),
        ...h2(
          "El valle de Camprodon y Beget",
          `En Camprodon, el Pont Nou de finales del siglo XII es la imagen de la villa. Isaac Albéniz nació allí en 1860. En Beget, la iglesia románica de Sant Cristòfol guarda la Majestat, un Cristo del siglo XII de unos dos metros. Setcases tiene ${b2link("setcases", "es", "guía propia")}.`,
        ),
        ...h2(
          "Vall de Núria",
          `El cremallera sale de Ribes-Enllaç, para en Ribes-Vila y Queralbs, y en 40 minutos sube 1.000 metros en 12,5 km. Circula todo el año, pero a partir de principios de noviembre FGC reduce el servicio, y el operador indica que la compra online es obligatoria. Todo lo demás está en ${b2link("nuria", "es", "nuestra guía de Núria")}.`,
        ),
        ...h2(
          "Información del parque natural",
          "El Parc Natural de les Capçaleres del Ter i del Freser tiene cuatro centros de información: en Queralbs, en la estación del cremallera de Núria, en Setcases y en Ulldeter, en la base de Vallter. Los horarios no son iguales en todos: el parque atiende en el 667 116 811.",
        ),
        ...h2(
          "Setcases y Vallter",
          `Setcases es una de las puertas del parque natural: ${b2link("setcases", "es", "qué ver en Setcases")}. En invierno, mira ${b2link("ski", "es", "las estaciones de esquí de Cataluña")} o ${b2link("snow", "es", "dónde ver nieve sin esquiar")}.`,
        ),
        ...h2("Cuántos días"),
        table(
          "Cómo repartir los días",
          ["Tiempo", "Qué cabe"],
          [
            ["1 día", "Ripoll y Sant Joan de les Abadesses, o un solo valle"],
            ["2 días", "Patrimonio y montaña"],
            ["3 días", "Ripoll, Vall de Ribes/Núria y valle de Camprodon"],
          ],
          "Recomendación editorial, no una promesa de tiempos de conducción.",
        ),
        ...paras(
          `En temporada de setas, el ${link("mushrooms", "es", "parte semanal de condiciones")}.`,
        ),
        faq([
          { question: "¿Qué ver en Ripoll?", answer: "El monasterio de Santa Maria, con la portada románica del siglo XII, y el Museu Etnogràfic, en la misma plaza. Con una tarde más, la vía verde hasta Sant Joan de les Abadesses." },
          { question: "¿Cuánto cuesta entrar al monasterio de Ripoll?", answer: "La entrada general cuesta 7,50 €; 5,50 € para mayores de 65 y jóvenes hasta 25; 3,50 € de 5 a 18 años; gratis para menores de 5 y residentes (precios consultados el 28/10/2026)." },
          { question: "¿Cómo se llega a Ripoll en tren desde Barcelona?", answer: "Con la R3. Mientras duren las obras, de Barcelona a La Garriga o Vic se va en el bus directo de Rodalies y de allí en tren; de La Garriga a Ripoll hay 13 trenes al día." },
          { question: "¿Dónde está Ripoll?", answer: "En la provincia de Girona, en el Pirineo catalán: es la capital de la comarca del Ripollès, a 691 metros de altitud." },
          { question: "¿Cuántos municipios tiene la comarca del Ripollès?", answer: "19, con Ripoll como capital: 956,6 km² y 25.914 habitantes, según el Idescat (2025)." },
          { question: "¿Qué pueblos bonitos hay cerca de Ripoll?", answer: "Sant Joan de les Abadesses, Camprodon, Beget, Setcases, Queralbs y Ribes de Freser, de donde sale el cremallera de Núria." },
        ]),
        ...paras(verifiedLine("es", RIPOLLES_VERIFIED)),
        ...b2Related(["nuria", "setcases", "ski", "snow", "cerdanya"], "es"),
      ],
    },

    en: {
      path: "destinations/ripolles",
      title: "Ripoll and the Ripollès: what to see, the monastery, villages and trains",
      seoTitle: "Ripoll, Spain: monastery, Ripollès villages and trains",
      seoDescription:
        "Ripoll and the Ripollès in Catalonia: the monastery's hours and prices, R3 trains, Sant Joan de les Abadesses, Camprodon, Beget, Setcases and Núria.",
      excerpt:
        "Ripoll and its monastery, then the rest of the area: Sant Joan, Camprodon, Beget, Setcases and Núria. Hours, prices and trains checked against official sources.",
      blocks: [
        lead(
          "**Ripoll**, the capital of the Ripollès area of Catalonia (10,812 people, 691 m up), is the gateway to the district, and its great monument is the **monastery of Santa Maria de Ripoll**: in winter it opens 10:00–13:30 and 15:30–18:00, and general admission is €7.50. The **R3** train serves the town, and from here the Ripollès opens out towards Sant Joan de les Abadesses, the Camprodon valley, Setcases and Vall de Núria.",
        ),
        keyFacts("Ripoll and the Ripollès at a glance", [
          { label: "Ripoll population", value: "10,812 (Idescat, 2025)" },
          { label: "Ripoll altitude", value: "691 m" },
          { label: "Ripollès district", value: "19 municipalities, 956.6 km², 25,914 people" },
          { label: "Monastery of Ripoll", value: "General admission €7.50" },
          { label: "Train", value: "R3: 13 trains a day from La Garriga to Ripoll" },
          { label: "Last verified", value: "28 October 2026" },
        ]),
        ...h2(
          "The Ripollès district",
          "The Ripollès is a district (comarca) of the province of Girona, in the Pyrenees: **19 municipalities**, **956.6 km²** and **25,914 people** (Idescat, 2025), with **Ripoll** as its capital. It covers the headwaters of the Ter and the Freser, from the Camprodon and Ribes valleys up to the peaks of Vallter and Núria, and runs from high-mountain stone villages to two of Catalonia's great Romanesque monasteries.",
        ),
        table(
          "Pretty villages near Ripoll",
          ["Village", "Why go"],
          [
            ["Sant Joan de les Abadesses", "The district's other great monastery, founded in 887, with the Santíssim Misteri; the greenway runs there from Ripoll"],
            ["Camprodon", "The late 12th-century Pont Nou; Isaac Albéniz was born here in 1860"],
            ["Beget", "The Romanesque church of Sant Cristòfol and its Majestat, a 12th-century Christ"],
            ["Setcases", "Stone houses at 1,265 m in the upper Ter valley, and the gateway to Vallter"],
            ["Queralbs", "The last rack-railway stop you can drive to, and the start of the old path to Núria"],
            ["Ribes de Freser", "Where the Vall de Núria rack railway starts, next to the R3 station"],
          ],
          "All are Ripollès municipalities according to Idescat, except Beget, which belongs to Camprodon.",
        ),
        ...h2(
          "What to see in Ripoll: the monastery of Santa Maria",
          "The monastery of Santa Maria de Ripoll is the main reason to stop in the town. Abbot Oliba consecrated the basilica in 1032. According to Ripollès Turisme, the 12th-century carved doorway is a candidate for UNESCO World Heritage status. When the monastery was sacked and burned in 1835, 231 volumes from its library were saved; they are now kept in the Archive of the Crown of Aragon.",
          "Ticket sales stop 30 minutes before closing, and the monastery recommends booking the guided tour on +34 972 70 42 03.",
        ),
        table("Monastery of Ripoll opening hours", ["Period", "Hours"], RIPOLL_HOURS.en, "Source: Monastery of Santa Maria de Ripoll. Checked 28 October 2026. On Sundays and holidays, phone to confirm."),
        table("Monastery of Ripoll ticket prices", ["Ticket", "Price"], RIPOLL_PRICES.en, "Tickets are also sold online. Prices checked 28/10/2026."),
        ...h3(
          "The Ripoll Ethnographic Museum",
          "Next door, on the same Plaça de l'Abat Oliba, the Ethnographic Museum tells the area's story through shepherding, the iron forge and the town's firearms trade. From September to June it opens Tuesday to Saturday 10:00–13:30 and 16:00–18:00, and Sundays and holidays 10:00–14:00; in July and August it closes at 19:00. Closed on Mondays. General admission €4, reduced €3; free for under-12s and on the last Sunday of each month.",
        ),
        ...h2("Getting to Ripoll by train (R3)"),
        ...paras(
          "Ripoll is on the **R3** line, but because of Adif works no trains run between Barcelona and La Garriga: that stretch is covered by Rodalies direct buses to La Garriga or Vic, and from La Garriga R3 trains run up to Ripoll and Puigcerdà at half the frequency they had before 20 January.",
        ),
        table("R3 trains between La Garriga and Ripoll", ["", "Times"], RIPOLL_TRAINS.en, "Train timetable in force since 6 July 2026 (sheet updated 16/09/2026), daily. Checked 28/10/2026: confirm on rodalies.gencat.cat for your travel date."),
        ...paras(
          "By bus, TEISA links Barcelona with Ripoll and Camprodon via Vic, and also runs lines from Girona and Olot. By car, take the C-17 from Barcelona (towards Vic and Puigcerdà); from Girona, the A-26 towards Olot and then the N-260 to Ripoll.",
        ),
        ...h2(
          "Sant Joan de les Abadesses",
          "Wilfred the Hairy (Guifré el Pelós) founded the area's other great monastery in 887, the first convent for women in the Catalan counties. The present church was consecrated in 1150. Inside is the Santíssim Misteri, a 13th-century wooden Descent from the Cross.",
        ),
        ...h2(
          "Without a car: the Iron and Coal greenway",
          "Between Ripoll and Sant Joan de les Abadesses, the old railway line is now an asphalt greenway with a gentle 1% gradient, rated accessible and of minimal difficulty. It climbs from 682 m at Ripoll to 775 m at Sant Joan, and the full route runs 18 km to Ogassa and Sant Pau de Segúries. From Sant Joan, the Alt Ter route continues 21.76 km up the river through Camprodon to Vilallonga de Ter.",
        ),
        ...h2(
          "The Camprodon valley and Beget",
          `In Camprodon, the late-12th-century Pont Nou bridge is the town's signature view, and the composer Isaac Albéniz was born here in 1860. In Beget, the Romanesque church of Sant Cristòfol holds the Majestat, a 12th-century robed Christ about two metres tall. Setcases has ${b2link("setcases", "en", "its own guide")}.`,
        ),
        ...h2(
          "Vall de Núria",
          `The rack railway leaves from Ribes-Enllaç and calls at Ribes-Vila and Queralbs. It climbs 1,000 metres over 12.5 km in 40 minutes. It runs all year, but FGC reduces the service from early November, and the operator says tickets must be bought online. Everything else is in ${b2link("nuria", "en", "our Núria guide")}.`,
        ),
        ...h2(
          "Natural park information",
          "Capçaleres del Ter i del Freser Natural Park has four information centres: in Queralbs, at Núria's rack-railway station, in Setcases and at Ulldeter, at the foot of Vallter. Opening hours differ between them; the park answers on +34 667 116 811.",
        ),
        ...h2(
          "Setcases and Vallter",
          `Setcases is one of the gateways to the natural park: ${b2link("setcases", "en", "what to see in Setcases")}. In winter, see ${b2link("ski", "en", "Catalonia's ski resorts")} or ${b2link("snow", "en", "where to see snow without skiing")}.`,
        ),
        ...h2("How many days"),
        table(
          "Splitting the time",
          ["Time", "What fits"],
          [
            ["1 day", "Ripoll and Sant Joan de les Abadesses, or one valley"],
            ["2 days", "Heritage plus mountains"],
            ["3 days", "Ripoll, Vall de Ribes/Núria and the Camprodon valley"],
          ],
          "An editorial recommendation, not a promise about driving times.",
        ),
        ...paras(
          `In mushroom season, see the ${link("mushrooms", "en", "weekly conditions report")}.`,
        ),
        faq([
          { question: "What is there to see in Ripoll?", answer: "The monastery of Santa Maria, with its 12th-century Romanesque doorway, and the Ethnographic Museum on the same square. With an extra afternoon, the greenway to Sant Joan de les Abadesses." },
          { question: "How much does the monastery of Ripoll cost?", answer: "General admission is €7.50; €5.50 for over-65s and under-26s; €3.50 for ages 5 to 18; free for under-5s and residents (checked 28/10/2026)." },
          { question: "How do you get to Ripoll from Barcelona by train?", answer: "On the R3. While the works last, take the Rodalies direct bus from Barcelona to La Garriga or Vic and the train from there; 13 trains a day run from La Garriga to Ripoll." },
          { question: "Where is Ripoll, Spain?", answer: "In the Catalan Pyrenees, in the province of Girona: it is the capital of the Ripollès district, at 691 metres." },
          { question: "Which villages are worth seeing near Ripoll?", answer: "Sant Joan de les Abadesses, Camprodon, Beget, Setcases, Queralbs and Ribes de Freser, where the Núria rack railway starts." },
        ]),
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
    url: "https://ripollesturisme.cat/municipi/setcases/",
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
  { name: "Vallter — tarifes", url: "https://pirineu365.cat/vallter/estacio/tarifes/", publisher: "FGC (PIRINEU365)" },
  { name: "Vallter — plànol de pistes", url: "https://pirineu365.cat/vallter/estacio/planol-de-pistes/", publisher: "FGC (PIRINEU365)" },
  // Opening line in the ski paragraph: "Calendari de l'estació", 1-3 Dec 2026
  // closed, open from 4 Dec, last day 4 Apr 2027 (read 30 and 31 Oct 2026).
  { name: "Vallter — informació pràctica (calendari de l'estació 2026-27)", url: "https://pirineu365.cat/vallter/estacio/informacio-practica/", publisher: "FGC (PIRINEU365)" },
  { name: "R3: avís de servei", url: "https://rodalies.gencat.cat/ca/detalls/article/02_02_PAT_R3", publisher: "Rodalies de Catalunya" },
  { name: "Setcases, el municipi en xifres", url: "https://www.idescat.cat/emex/?id=171925", publisher: "Idescat" },
];

const SETCASES_VERIFIED = "2026-10-28";

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
      title: "Què veure i què fer a Setcases i els voltants: el poble, els miradors, les rutes i Vallter",
      seoTitle: "Què veure a Setcases i voltants: què fer en un dia",
      seoDescription:
        "Què veure a Setcases i als voltants: el nucli de pedra, Sant Miquel, la Creueta, els miradors, les rutes del parc natural, Vallter i com arribar-hi.",
      excerpt:
        "Un poble d'alta muntanya a 1.265 m i una de les portes del parc natural: nucli, la Creueta, miradors, rutes i Vallter.",
      blocks: [
        lead(
          "Què veure a Setcases: el nucli de cases de pedra i l'església de Sant Miquel, amb el retaule barroc; el passeig de deu minuts a **la Creueta**; quatre miradors (el Forat de l'Olla, el Collet de Xuriguera, la Baidana i el balcó de la Costa Brava, a Vallter), i les rutes del Parc Natural de les Capçaleres del Ter i del Freser. El poble és a **1.265 m**, a l'alta vall del Ter, i és la porta de **Vallter**.",
        ),
        keyFacts("Dades clau", [
          { label: "Comarca", value: "Ripollès" },
          { label: "Parc natural", value: "Capçaleres del Ter i del Freser" },
          { label: "Altitud", value: "1.265 m (Idescat)" },
          { label: "Població", value: "196 habitants (Idescat, 2025)" },
          { label: "Passeig de la Creueta", value: "Uns 300 m i uns 50 m de desnivell, uns 10 minuts" },
          { label: "Última verificació", value: "28 d'octubre de 2026" },
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
          "Font: itineraris interpretatius del Parc Natural (dificultat segons el mètode SENDIF). Consultat el 24 d'octubre de 2026.",
        ),
        ...paras(
          "Amb nens, l'Ajuntament recomana el camí dels Socarrats i dels Beduïs i el camí de les cabanyes i la fageda (1 h 15 min, més 45 minuts de tornada per carretera). Tots dos són per a infants a partir de 8 anys, no són aptes per a cotxets i es poden fer tot l'any excepte quan hi ha neu. Per caminar pel teu compte, l'Ajuntament també recomana l'app Natura Local, amb rutes autoguiades pel municipi.",
        ),
        ...h2(
          "Amb nens, a més",
          "El poble té zona d'esbarjo i parc infantil, i a l'estiu, la Platgeta. A Vallter, el telecadira també funciona a l'estiu. Segons l'Ajuntament, la pujada dura uns 20 minuts i els dies clars s'hi veuen el cap de Creus i el golf de Roses. Des de dalt es pot caminar fins al naixement del Ter. El 2026, la temporada d'estiu de Vallter va anar de l'1 de juliol al 30 d'agost; consulta les dates de cada any a l'operador.",
        ),
        ...h2(
          "Què veure als voltants de Setcases",
          "**Vallter i el circ d'Ulldeter.** Prop de Vallter, a 2.393 m, hi ha les restes del primer refugi d'Ulldeter, inaugurat el 25 de juliol de 1909. Ripollès Turisme el presenta com el primer refugi de muntanya de l'Estat. Avui està en ruïnes, amb una placa commemorativa.",
          `**Camprodon i Beget.** Riu avall hi ha Camprodon, amb el pont Nou del segle XII, i més enllà, Beget i la seva Majestat romànica. Els expliquem a ${b2link("ripolles", "ca", "la guia del Ripollès")}, amb Ripoll i Sant Joan de les Abadesses.`,
        ),
        ...h2(
          "Setcases a l'hivern: Vallter i la neu",
          `Vallter té 14,15 km de pistes entre 2.000 i 2.535 m, i el forfet de dia d'adult, a la seva pàgina de tarifes, és de 30 € en temporada baixa i 36,50 € en temporada alta. També hi ha raquetes de neu i pista de trineus. El calendari de l'estació marca l'obertura de la temporada 2026-27 el divendres 4 de desembre i el darrer dia, el 4 d'abril de 2027, sempre que hi hagi neu: comparem totes les estacions a ${b2link("ski", "ca", "les estacions d'esquí de Catalunya")}, i si no esquies, mira ${b2link("snow", "ca", "on veure neu sense esquiar")}.`,
        ),
        callout(
          "warning",
          "Abans d'anar-hi",
          "No donem per fet que Vallter estigui obert ni que hi hagi neu. Comprova la meteorologia, els accessos, l'estat de l'estació i els avisos del parc natural per a la teva data. El darrer tram de la carretera és d'alta muntanya.",
        ),
        ...h2(
          "Centres d'informació del parc natural",
          "Setcases aporta el 23 % de la superfície del Parc Natural de les Capçaleres del Ter i del Freser. El centre d'informació del poble és a l'aparcament de la Closa d'en Xola, a la carretera de Vallter (GIV-5264), i des de la primavera de 2025 n'hi ha un altre a Ulldeter, a la base de l'estació de Vallter (pla de Morens, a 1.960 m). Els horaris canvien segons el centre: abans d'anar-hi, truca al 667 116 811.",
        ),
        ...h2(
          "Com arribar a Setcases en transport públic",
          "El tren no arriba a Setcases. TEISA opera la línia d'autobús Setcases – Camprodon – Ripoll – Campdevànol, però la majoria d'expedicions comencen i acaben a Camprodon, i només unes poques pugen fins a Setcases. A l'hivern, TEISA també publica un bus d'esquí Girona – Olot – Camprodon – Setcases – Vallter els caps de setmana i festius de gener a març. Mira l'horari vigent al web de TEISA abans de sortir.",
          "Ripoll té estació de la R3, però els trens circulen només entre la Garriga i Puigcerdà, amb menys freqüència. Entre Barcelona i la Garriga o Vic, Rodalies hi posa un servei per carretera. Consulta l'avís de Rodalies per al dia que viatges.",
        ),
        faq([
          { question: "Què veure a Setcases en un dia?", answer: "El nucli i l'església de Sant Miquel al matí, el passeig a la Creueta, i a la tarda un mirador o una ruta curta com el camí dels Socarrats i dels Beduïs. Si hi ha temps, Vallter i el circ d'Ulldeter." },
          { question: "Quina altitud té Setcases?", answer: "1.265 metres, segons l'Idescat." },
          { question: "Què fer a Setcases?", answer: "Caminar: la Creueta (uns 10 minuts), el camí dels Socarrats i dels Beduïs (1 h 30 min, per a infants a partir de 8 anys) o el circ d'Ulldeter; pujar als miradors; a l'estiu, la Platgeta i el telecadira de Vallter, i a l'hivern, raquetes, trineu o esquí a Vallter." },
          { question: "Com s'arriba a Setcases sense cotxe?", answer: "Amb l'autobús de TEISA des de Ripoll o Camprodon, tot i que pocs serveis pugen fins a Setcases. A l'hivern hi ha un bus d'esquí de TEISA fins a Vallter els caps de setmana de gener a març." },
        ]),
        ...paras(verifiedLine("ca", SETCASES_VERIFIED)),
        ...b2Related(["ripolles", "ski", "snow"], "ca"),
      ],
    },

    es: {
      path: "destinos/setcases",
      title: "Qué ver y qué hacer en Setcases y alrededores: el pueblo, los miradores, las rutas y Vallter",
      seoTitle: "Qué ver en Setcases y alrededores: qué hacer en un día",
      seoDescription:
        "Qué ver en Setcases y alrededores: el casco de piedra, Sant Miquel, la Creueta, los miradores, las rutas del parque natural, Vallter y cómo llegar.",
      excerpt:
        "Pueblo de alta montaña a 1.265 m y puerta del parque natural: casco urbano, la Creueta, miradores, rutas y Vallter.",
      blocks: [
        lead(
          "Qué ver en Setcases: el casco de casas de piedra y la iglesia de Sant Miquel, con su retablo barroco; el paseo de diez minutos a **la Creueta**; cuatro miradores (el Forat de l'Olla, el Collet de Xuriguera, la Baidana y el balcón de la Costa Brava, en Vallter), y las rutas del Parc Natural de les Capçaleres del Ter i del Freser. El pueblo está a **1.265 m**, en el alto valle del Ter, y es la puerta de **Vallter**.",
        ),
        keyFacts("Datos clave", [
          { label: "Comarca", value: "Ripollès (Girona)" },
          { label: "Parque natural", value: "Capçaleres del Ter i del Freser" },
          { label: "Altitud", value: "1.265 m (Idescat)" },
          { label: "Población", value: "196 habitantes (Idescat, 2025)" },
          { label: "Paseo de la Creueta", value: "Unos 300 m y unos 50 m de desnivel, unos 10 minutos" },
          { label: "Última verificación", value: "28 de octubre de 2026" },
        ]),
        ...h2(
          "Por la mañana: el casco antiguo",
          "Pasea por las calles del pueblo, de casas de piedra restauradas, y dedica tiempo al patrimonio y a la arquitectura tradicional de alta montaña.",
        ),
        ...h2(
          "La Creueta",
          "Es un paseo corto de poco más de **300 metros** y unos **50 metros de desnivel**, de unos diez minutos, con una de las mejores vistas del pueblo.",
        ),
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
          "Rutas y excursiones desde Setcases",
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
          "Fuente: itinerarios interpretativos del Parque Natural (dificultad según el método SENDIF). Consultado el 24 de octubre de 2026.",
        ),
        ...paras(
          "Con niños, el Ayuntamiento recomienda el camino dels Socarrats i dels Beduïs y el camino de las cabañas y el hayedo (1 h 15 min, más 45 minutos de vuelta por carretera). Los dos son para niños a partir de 8 años, no son aptos para cochecitos y se pueden hacer todo el año salvo con nieve. Para caminar por tu cuenta, el Ayuntamiento también recomienda la app Natura Local, con rutas autoguiadas.",
        ),
        ...h2(
          "Con niños: la Platgeta y el telesilla",
          "El pueblo tiene zona de recreo y parque infantil, y en verano, la Platgeta. En Vallter, el telesilla también funciona en verano. Según el Ayuntamiento, la subida dura unos 20 minutos y los días claros se ven el cabo de Creus y el golfo de Roses. Desde arriba se puede caminar hasta el nacimiento del Ter. En 2026, la temporada de verano de Vallter fue del 1 de julio al 30 de agosto; consulta las fechas de cada año con el operador.",
        ),
        ...h2(
          "Qué ver en los alrededores de Setcases",
          "**Vallter y el circo de Ulldeter.** Cerca de Vallter, a 2.393 m, quedan los restos del primer refugio de Ulldeter, inaugurado el 25 de julio de 1909. Ripollès Turisme lo presenta como el primer refugio de montaña del Estado. Hoy está en ruinas, con una placa conmemorativa.",
          `**Camprodon y Beget.** Río abajo está Camprodon, con el Pont Nou del siglo XII, y más allá, Beget y su Majestat románica. Los contamos en ${b2link("ripolles", "es", "la guía del Ripollès")}, junto con Ripoll y Sant Joan de les Abadesses.`,
        ),
        ...h2(
          "Setcases en invierno: Vallter y la nieve",
          `Vallter tiene 14,15 km de pistas entre 2.000 y 2.535 m, y el forfait de día de adulto, en su página de tarifas, es de 30 € en temporada baja y 36,50 € en temporada alta. También hay raquetas de nieve y pista de trineos. El calendario de la estación marca la apertura de la temporada 2026-27 el viernes 4 de diciembre y el último día, el 4 de abril de 2027, siempre que haya nieve: comparamos todas las estaciones en ${b2link("ski", "es", "las estaciones de esquí de Cataluña")}, y si no esquías, mira ${b2link("snow", "es", "dónde ver nieve sin esquiar")}.`,
        ),
        callout(
          "warning",
          "Antes de ir",
          "No afirmamos que Vallter esté abierto ni que haya nieve. Comprueba la meteorología, los accesos y el estado de la estación para la fecha concreta. El último tramo de la carretera es de alta montaña.",
        ),
        ...h2(
          "Centros de información del parque natural",
          "Setcases aporta el 23 % de la superficie del Parc Natural de les Capçaleres del Ter i del Freser. El centro de información del pueblo está en el aparcamiento de la Closa d'en Xola, en la carretera de Vallter (GIV-5264), y desde la primavera de 2025 hay otro en Ulldeter, en la base de la estación de Vallter (pla de Morens, a 1.960 m). Los horarios varían según el centro: antes de ir, llama al 667 116 811.",
        ),
        ...h2(
          "Cómo llegar a Setcases en transporte público",
          "El tren no llega a Setcases. TEISA opera la línea de autobús Setcases – Camprodon – Ripoll – Campdevànol, pero la mayoría de las expediciones empiezan y terminan en Camprodon, y solo unas pocas suben hasta Setcases. En invierno, TEISA también publica un bus de esquí Girona – Olot – Camprodon – Setcases – Vallter los fines de semana y festivos de enero a marzo. Mira el horario vigente en la web de TEISA antes de salir.",
          "Ripoll tiene estación de la R3, pero los trenes solo circulan entre La Garriga y Puigcerdà, con menos frecuencia. Entre Barcelona y La Garriga o Vic, Rodalies pone un servicio por carretera. Consulta el aviso de Rodalies para el día del viaje.",
        ),
        faq([
          { question: "¿Qué ver en Setcases en un día?", answer: "El casco y la iglesia de Sant Miquel por la mañana, el paseo a la Creueta, y por la tarde un mirador o una ruta corta como el camí dels Socarrats i dels Beduïs. Si hay tiempo, Vallter y el circo de Ulldeter." },
          { question: "¿Qué altitud tiene Setcases?", answer: "1.265 metros, según el Idescat." },
          { question: "¿Qué hacer en Setcases?", answer: "Caminar: la Creueta (unos 10 minutos), el camí dels Socarrats i dels Beduïs (1 h 30 min, para niños a partir de 8 años) o el circo de Ulldeter; subir a los miradores; en verano, la Platgeta y el telesilla de Vallter, y en invierno, raquetas, trineo o esquí en Vallter." },
          { question: "¿Qué hay en los alrededores de Setcases?", answer: "Vallter 2000 y el circo de Ulldeter, con el nacimiento del Ter, y valle abajo Camprodon y Beget." },
          { question: "¿Cómo se llega a Setcases sin coche?", answer: "Con el autobús de TEISA desde Ripoll o Camprodon, aunque pocos servicios suben hasta Setcases. En invierno hay un bus de esquí de TEISA hasta Vallter los fines de semana de enero a marzo." },
        ]),
        ...paras(verifiedLine("es", SETCASES_VERIFIED)),
        ...b2Related(["ripolles", "ski", "snow"], "es"),
      ],
    },

    en: {
      path: "destinations/setcases",
      title: "Setcases, Catalonia: what to see, walks, Vallter and how to get there",
      seoTitle: "Setcases, Spain: what to see and do, walks and Vallter",
      seoDescription:
        "What to see in Setcases, a Pyrenean village at 1,265 m: the stone village, Sant Miquel, La Creueta, lookouts, natural park walks, Vallter and buses.",
      excerpt:
        "A high-mountain village at 1,265 m and a gateway to the natural park: village, viewpoint, lookouts, walks and Vallter.",
      blocks: [
        lead(
          "What to see in Setcases: the stone village and the church of Sant Miquel with its baroque altarpiece; the ten-minute walk up to **La Creueta**; four lookouts (Forat de l'Olla, Collet de Xuriguera, La Baidana and the Costa Brava balcony at Vallter); and the walks of Capçaleres del Ter i del Freser Natural Park. The village sits at **1,265 m** in the upper Ter valley and is the gateway to **Vallter**.",
        ),
        keyFacts("Key facts", [
          { label: "Comarca", value: "Ripollès (Girona)" },
          { label: "Natural park", value: "Capçaleres del Ter i del Freser" },
          { label: "Altitude", value: "1,265 m (Idescat)" },
          { label: "Population", value: "196 (Idescat, 2025)" },
          { label: "La Creueta walk", value: "About 300 m and 50 m of ascent, roughly 10 minutes" },
          { label: "Last verified", value: "28 October 2026" },
        ]),
        ...h2(
          "The village",
          "Start with the streets themselves: restored stone houses and narrow lanes that keep the feel of a high Pyrenean village.",
        ),
        ...h2(
          "La Creueta",
          "The walk is only a little over **300 metres** long with roughly **50 metres** of elevation gain, about ten minutes, for one of the best views over the village.",
        ),
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
          "Walks from Setcases",
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
          "Source: the natural park's interpretive routes (difficulty graded with the SENDIF method). Checked 24 October 2026.",
        ),
        ...paras(
          "With children, the council suggests the Socarrats and Beduïs path, or the path through the huts and the beech wood (1 h 15 min plus 45 minutes back by road). Both are recommended from age 8, neither suits a pushchair, and both can be walked all year except when there is snow. For self-guided walks, the council also recommends the Natura Local app.",
        ),
        ...h2(
          "More for families",
          "The village has a playground and leisure area, and in summer a spot known as La Platgeta. At Vallter the chairlift also runs in summer. The council describes a ride of about 20 minutes, with views on clear days as far as Cap de Creus and the Bay of Roses. From the top you can walk to the source of the Ter. In 2026 Vallter's summer season ran from 1 July to 30 August, so check each year's dates with the operator.",
        ),
        ...h2(
          "Around Setcases",
          "**Vallter and the Ulldeter cirque.** Near Vallter, at 2,393 m, are the remains of the first Ulldeter refuge, opened on 25 July 1909. Ripollès Turisme describes it as the first mountain refuge in Spain. Today it is a ruin with a commemorative plaque.",
          `**Camprodon and Beget.** Downriver is Camprodon, with its 12th-century Pont Nou, and beyond it Beget and its Romanesque Majestat. Both are in ${b2link("ripolles", "en", "our Ripollès guide")}, with Ripoll and Sant Joan de les Abadesses.`,
        ),
        ...h2(
          "Setcases in winter: Vallter and the snow",
          `Vallter has 14.15 km of runs between 2,000 and 2,535 m, and its rates page lists an adult day pass at €30 in low season and €36.50 in high season. There are snowshoe outings and a sledging run too. The resort's calendar shows the 2026-27 season opening on Friday 4 December and ending on 4 April 2027, snow permitting: we compare every resort in ${b2link("ski", "en", "Catalonia's ski resorts")}, and if you do not ski, see ${b2link("snow", "en", "where to see snow without skiing")}.`,
        ),
        callout(
          "warning",
          "Before you go",
          "Always check mountain and road conditions before continuing towards Vallter: the last stretch is high-mountain road. We do not claim the resort is open or that there is snow.",
        ),
        ...h2(
          "Natural park information centres",
          "Setcases holds 23% of the area of Capçaleres del Ter i del Freser Natural Park. The village information centre is at the Closa d'en Xola car park on the Vallter road (GIV-5264), and since spring 2025 there has been a second one at Ulldeter, at the foot of Vallter (Pla de Morens, 1,960 m). Opening hours differ between centres, so call +34 667 116 811 before you go.",
        ),
        ...h2(
          "Getting to Setcases by public transport",
          "The train does not reach Setcases. TEISA runs a Setcases – Camprodon – Ripoll – Campdevànol bus, but most journeys start and end in Camprodon and only a few go up to Setcases. In winter TEISA also publishes a ski bus Girona – Olot – Camprodon – Setcases – Vallter at weekends and on holidays from January to March. Check the current timetable on TEISA's website first.",
          "Ripoll is on the R3 rail line, but R3 trains run only between La Garriga and Puigcerdà, with a reduced service, and Rodalies operates a road service between Barcelona and La Garriga or Vic. Check the Rodalies notice for your travel date.",
        ),
        faq([
          { question: "What is there to see in Setcases?", answer: "The stone village and the church of Sant Miquel, the short walk to La Creueta, four lookouts, and the natural park's walks, including the Ulldeter cirque near Vallter." },
          { question: "How high is Setcases?", answer: "1,265 metres, according to Idescat." },
          { question: "What is there to do in Setcases?", answer: "Walk: La Creueta (about 10 minutes), the Socarrats i Beduïs loop (1 h 30 min, for children aged 8 and up) or the Ulldeter cirque; drive up to the lookouts; in summer, the Platgeta and the Vallter chairlift, and in winter, snowshoeing, sledging or skiing at Vallter." },
          { question: "How do you get to Setcases without a car?", answer: "By TEISA bus from Ripoll or Camprodon, although few services go all the way up. In winter a TEISA ski bus runs to Vallter at weekends from January to March." },
        ]),
        ...paras(verifiedLine("en", SETCASES_VERIFIED)),
        ...b2Related(["ripolles", "ski", "snow"], "en"),
      ],
    },
  },
};

/* ========================================================================== */
/* 10 — Snow without skiing                                                   */
/* ========================================================================== */

// 13 Nov 2026: moved to snow-trips.ts and upgraded in place (by train, the R3
// cuts, chains and 3PMSF tyres, the avalanche bulletin). Re-exported so the
// existing imports keep working.
export { SNOW } from "./snow-trips";
