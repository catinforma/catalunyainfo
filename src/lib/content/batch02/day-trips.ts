import { link } from "@/lib/content/features/shared";

import {
  b2Related,
  b2link,
  callout,
  faq,
  h2,
  h3,
  lead,
  list,
  paras,
  table,
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
    url: "https://www.girona.cat/turisme/cat/monuments.php",
    publisher: "Ajuntament de Girona — Turisme",
  },
  {
    name: "Cerca d'horaris i bitllets",
    url: "https://www.renfe.com/es/es",
    publisher: "Renfe",
  },
  { name: "R11: horaris", url: "https://rodalies.gencat.cat/web/.content/02_Horaris/horaris/R11.pdf", publisher: "Rodalies de Catalunya" },
  { name: "Visita", url: "https://gironaepiscopal.cat/visita/", publisher: "Girona Episcopal" },
  { name: "Museu d'Història dels Jueus: informació", url: "https://www.girona.cat/call/cat/info.php", publisher: "Ajuntament de Girona" },
  { name: "Planifica la visita", url: "https://www.mac.cat/ca/Visita-ns-Portada/Girona-Portada-Seu/Planifica-la-visita-Girona", publisher: "Museu d'Arqueologia de Catalunya" },
  { name: "Banys Àrabs", url: "https://www.girona.cat/turisme/cat/monuments_banysarabs.php", publisher: "Ajuntament de Girona — Turisme" },
];

const GIRONA_VERIFIED = "2026-10-20";

export const GIRONA: B2Article = {
  key: "girona",
  entryKey: "daytrip-girona-from-barcelona",
  categoryKey: "coast",
  sources: GIRONA_SOURCES,
  heroKey: "b2-girona-cases-onyar",
  secondaryKey: "b2-girona-banys-arabs",
  secondaryAlt: {
    ca: "Interior dels Banys Àrabs de Girona",
    es: "Interior de los Baños Árabes de Girona",
    en: "Inside the Arab Baths of Girona",
  },
  secondaryCaption: {
    ca: "Els Banys Àrabs queden al sector nord del Barri Vell, just després de la Catedral.",
    es: "Los Baños Árabes quedan en el sector norte del Barri Vell, justo después de la Catedral.",
    en: "The Arab Baths sit in the northern old town, right after the Cathedral.",
  },
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
          "Aquí només donem durades aproximades, amb la data de l'horari d'on surten. Els horaris de sortida i els preus canvien diverses vegades l'any: mira'ls a l'operador per al dia concret.",
        ),
        ...h2(
          "Quin tren agafar",
          "Des de Barcelona hi ha dues opcions. La més econòmica és la línia **R11** de Rodalies, que surt de Barcelona Sants i para a Passeig de Gràcia i al Clot abans de seguir per Granollers fins a Girona i Figueres. Segons l'horari de Rodalies actualitzat el 4 de juliol de 2026, els trens de mitjana distància (MD) tarden aproximadament 1 h 20 min de Sants a Girona, i els regionals (R), que fan més parades, al voltant d'1 h 30 min. L'altra opció és l'alta velocitat de Renfe. Girona Turisme situa l'estació de Renfe a la plaça d'Espanya i l'estació d'alta velocitat i d'autobusos a la plaça de Joan Brossa.",
        ),
        ...h2(
          "Horaris i preus dels monuments",
          "Consultats el 20 d'octubre de 2026.",
        ),
        table(
          "",
          ["Lloc", "Horari", "Entrada general"],
          [
            ["Catedral + basílica de Sant Feliu + Museu d'Art (entrada Girona Episcopal, vàlida 48 h)", "Catedral: dl–ds 10–18 h, dg 12–18 h. Sant Feliu: dg 13–18 h", "12 €"],
            ["Banys Àrabs", "març–oct.: dl–ds 10–18 h, dg 10–14 h · nov.–febr.: dl–dv 10–14 h, ds 10–17.30 h, dg 10–14 h", "3 € (reduïda 1 €)"],
            ["Museu d'Història dels Jueus (Call)", "set.–juny: dt–ds 10–18 h; dg, dl i festius 10–14 h · jul.–ag.: dt–ds 10–19 h", "6 € (reduïda 3 €)"],
            ["Sant Pere de Galligants (MAC Girona)", "dt–ds 10–18 h (maig–set. fins a les 19 h), dg 10–14 h; tancat dilluns", "6 € (reduïda 4 €)"],
            ["Passeig de la Muralla", "set.–maig 8–21 h · juny–ag. 8–23 h", "—"],
          ],
        ),
        ...paras(
          "La Catedral tanca el 25 de desembre, l'1 i el 6 de gener i el diumenge de Pasqua, i no s'hi pot fer la visita cultural a la nau durant les celebracions. El carnet GironaMuseus dona un 50 % de descompte en sis museus de la ciutat.",
        ),
        ...h2(
          "Què és gratuït",
          "El primer diumenge de cada mes, el Museu d'Història dels Jueus i Sant Pere de Galligants són gratuïts, i també ho són sempre per als menors de 16 anys. El MAC també obre de franc el 23 d'abril. Passejar pel Call, les cases de l'Onyar i la Rambla no costa res.",
        ),
        ...h2(
          "Accessibilitat",
          "Girona Turisme avisa que les muralles no són accessibles perquè tenen trams d'escales, i que el Call té pendents molt pronunciats i moltes escales. El recorregut més practicable és el carrer de la Força, de plataforma única i amb un pendent d'entre el 8 % i el 12 %. A Sant Pere de Galligants, el monestir, l'església i el claustre són accessibles, però els lavabos no estan adaptats. L'Oficina de Turisme disposa de maquetes en 3D dels principals monuments per a persones amb discapacitat visual.",
        ),
        ...h2(
          "Oficina de Turisme",
          "És a la Rambla de la Llibertat, 1, al final de la ruta. D'abril a octubre obre de dilluns a divendres de 9 a 20 h, dissabtes de 9 a 14 h i de 15 a 19 h, i diumenges i festius de 9 a 14 h. De novembre a març, entre setmana tanca a les 19 h.",
        ),
        ...paras(
          `Si t'agraden les escapades sense cotxe, tenim ${link("trains", "ca", "dotze escapades per Catalunya que pots fer en tren")} i ${b2link("montserratFree", "ca", "com anar a Montserrat per lliure")}.`,
        ),
        ...paras(verifiedLine("ca", GIRONA_VERIFIED)),
        ...b2Related(["sitges", "tarragona", "montserratFree", "cerdanya"], "ca"),
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
          "Aquí solo damos duraciones aproximadas, con la fecha del horario del que salen. Los horarios de salida y los precios cambian varias veces al año: consúltalos en el operador para la fecha concreta.",
        ),
        ...h2(
          "Qué tren coger",
          "Desde Barcelona hay dos opciones. La más económica es la línea **R11** de Rodalies, que sale de Barcelona Sants y para en Passeig de Gràcia y El Clot antes de seguir por Granollers hasta Girona y Figueres. Según el horario de Rodalies actualizado el 4 de julio de 2026, los trenes de media distancia (MD) tardan aproximadamente 1 h 20 min de Sants a Girona, y los regionales (R), con más paradas, en torno a 1 h 30 min. La otra opción es la alta velocidad de Renfe. Girona Turisme sitúa la estación de Renfe en la plaza de España y la estación de alta velocidad y autobuses en la plaza de Joan Brossa.",
        ),
        ...h2(
          "Horarios y precios de los monumentos",
          "Consultados el 20 de octubre de 2026.",
        ),
        table(
          "",
          ["Lugar", "Horario", "Entrada general"],
          [
            ["Catedral + basílica de Sant Feliu + Museu d'Art (entrada Girona Episcopal, válida 48 h)", "Catedral: lu–sá 10–18 h, do 12–18 h. Sant Feliu: do 13–18 h", "12 €"],
            ["Baños Árabes", "mar.–oct.: lu–sá 10–18 h, do 10–14 h · nov.–feb.: lu–vi 10–14 h, sá 10–17.30 h, do 10–14 h", "3 € (reducida 1 €)"],
            ["Museu d'Història dels Jueus (Call)", "sep.–jun.: ma–sá 10–18 h; do, lu y festivos 10–14 h · jul.–ago.: ma–sá 10–19 h", "6 € (reducida 3 €)"],
            ["Sant Pere de Galligants (MAC Girona)", "ma–sá 10–18 h (may.–sep. hasta las 19 h), do 10–14 h; cerrado lunes", "6 € (reducida 4 €)"],
            ["Paseo de la Muralla", "sep.–may. 8–21 h · jun.–ago. 8–23 h", "—"],
          ],
        ),
        ...paras(
          "La Catedral cierra el 25 de diciembre, el 1 y 6 de enero y el domingo de Pascua, y no se puede hacer la visita cultural a la nave durante los oficios. El carnet GironaMuseus da un 50 % de descuento en seis museos de la ciudad.",
        ),
        ...h2(
          "Qué es gratis",
          "El primer domingo de cada mes, el Museu d'Història dels Jueus y Sant Pere de Galligants son gratuitos, y siempre lo son para menores de 16 años. El MAC también abre gratis el 23 de abril. Pasear por el Call, las casas del Onyar y la Rambla no cuesta nada.",
        ),
        ...h2(
          "Accesibilidad",
          "Girona Turisme avisa de que las murallas no son accesibles porque tienen tramos de escaleras, y de que el Call tiene pendientes muy pronunciadas y muchas escaleras. El recorrido más practicable es la calle de la Força, de plataforma única y con una pendiente de entre el 8 % y el 12 %. En Sant Pere de Galligants, el monasterio, la iglesia y el claustro son accesibles, pero los aseos no están adaptados. La Oficina de Turismo dispone de maquetas en 3D de los principales monumentos para personas con discapacidad visual.",
        ),
        ...h2(
          "Oficina de Turismo",
          "Está en la Rambla de la Llibertat, 1, al final de la ruta. De abril a octubre abre de lunes a viernes de 9 a 20 h, los sábados de 9 a 14 h y de 15 a 19 h, y los domingos y festivos de 9 a 14 h. De noviembre a marzo, entre semana cierra a las 19 h.",
        ),
        ...paras(
          `Más escapadas sin coche: ${link("trains", "es", "doce escapadas en tren")} y ${b2link("montserratFree", "es", "Montserrat por libre")}.`,
        ),
        ...paras(verifiedLine("es", GIRONA_VERIFIED)),
        ...b2Related(["sitges", "tarragona", "montserratFree", "cerdanya"], "es"),
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
          "This page gives approximate journey times only, with the date of the timetable they come from. Departure times and fares change several times a year: check them with the operator for your day.",
        ),
        ...h2(
          "Which train to take",
          "There are two ways to get here from Barcelona. The cheaper is Rodalies line **R11**. It leaves from Barcelona Sants, calls at Passeig de Gràcia and El Clot, and then runs via Granollers to Girona and Figueres. On the Rodalies timetable updated 4 July 2026, medium-distance (MD) trains take about 1 h 20 min from Sants to Girona, and regional (R) trains, which make more stops, about 1 h 30 min. The other option is Renfe's high-speed service. Girona's tourist office places the Renfe station on Plaça d'Espanya and the high-speed and bus station on Plaça de Joan Brossa.",
        ),
        ...h2(
          "Sights: hours and prices",
          "Checked 20 October 2026.",
        ),
        table(
          "",
          ["Sight", "Hours", "General admission"],
          [
            ["Cathedral + Sant Feliu basilica + Art Museum (Girona Episcopal ticket, valid 48 h)", "Cathedral: Mon–Sat 10:00–18:00, Sun 12:00–18:00. Sant Feliu: Sun 13:00–18:00", "€12"],
            ["Arab Baths", "Mar–Oct: Mon–Sat 10:00–18:00, Sun 10:00–14:00 · Nov–Feb: Mon–Fri 10:00–14:00, Sat 10:00–17:30, Sun 10:00–14:00", "€3 (reduced €1)"],
            ["Museum of Jewish History (Call)", "Sep–Jun: Tue–Sat 10:00–18:00; Sun, Mon and holidays 10:00–14:00 · Jul–Aug: Tue–Sat 10:00–19:00", "€6 (reduced €3)"],
            ["Sant Pere de Galligants (MAC Girona)", "Tue–Sat 10:00–18:00 (May–Sep until 19:00), Sun 10:00–14:00; closed Mondays", "€6 (reduced €4)"],
            ["City walls walk", "Sep–May 08:00–21:00 · Jun–Aug 08:00–23:00", "—"],
          ],
        ),
        ...paras(
          "The Cathedral is closed on 25 December, 1 and 6 January and Easter Sunday. You cannot tour the nave during services. A GironaMuseus card gives 50% off at six of the city's museums.",
        ),
        ...h2(
          "What's free",
          "On the first Sunday of every month, the Museum of Jewish History and Sant Pere de Galligants are free. Both are always free for under-16s, and the MAC is also free on 23 April. Walking through the Call, past the Onyar houses and along the Rambla costs nothing.",
        ),
        ...h2(
          "Accessibility",
          "Girona's tourist office warns that the walls are not accessible because of their flights of steps, and that the Call has steep slopes and many steps. The most manageable route is Carrer de la Força, a level-surface street with gradients of 8–12%. At Sant Pere de Galligants, the monastery, church and cloister are step-free, but the toilets are not adapted. The tourist office has 3D models of the main monuments for blind and partially sighted visitors.",
        ),
        ...h2(
          "Tourist office",
          "The tourist office is at Rambla de la Llibertat 1, at the end of the route. From April to October it opens Monday to Friday 9 am to 8 pm, Saturday 9 am to 2 pm and 3 pm to 7 pm, and Sundays and holidays 9 am to 2 pm. From November to March it closes at 7 pm on weekdays.",
        ),
        ...paras(
          `More car-free trips: ${link("trains", "en", "twelve day trips by train")} and ${b2link("montserratFree", "en", "Montserrat without a tour")}.`,
        ),
        ...paras(verifiedLine("en", GIRONA_VERIFIED)),
        ...b2Related(["sitges", "tarragona", "montserratFree", "cerdanya"], "en"),
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
    name: "Montserrat — visita",
    url: "https://www.montserratvisita.com/en/entrada-turistica",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Xarxa FGC — línia Llobregat-Anoia",
    url: "https://www.fgc.cat/xarxa-fgc/l-llobregat-anoia/monistrol-de-montserrat-tren/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
];

const MONTSERRAT_VERIFIED = "2026-10-12";

export const MONTSERRAT_FREE: B2Article = {
  key: "montserratFree",
  entryKey: "daytrip-montserrat-without-tour",
  categoryKey: "mountain",
  sources: MONTSERRAT_SOURCES,
  heroKey: "b2-montserrat-cremallera",
  secondaryKey: "b2-montserrat-monestir",
  secondaryAlt: {
    ca: "El monestir de Santa Maria de Montserrat sota les agulles de roca",
    es: "El monasterio de Santa Maria de Montserrat bajo las agujas de roca",
    en: "The monastery of Santa Maria de Montserrat beneath the rock pinnacles",
  },
  secondaryCaption: {
    ca: "El recinte del santuari és on arriben tant el cremallera com l'aeri.",
    es: "El recinto del santuario es adonde llegan tanto el cremallera como el Aeri.",
    en: "Both the rack railway and the cable car arrive at the sanctuary precinct.",
  },
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
        "Com anar a Montserrat pel teu compte des de Barcelona: R5 des de Plaça Espanya i cremallera o aeri (15 € anada i tornada). Preus del 2026 i què ha canviat.",
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
        ...h2(
          "Preus del 2026",
          "L'R5 triga uns **60 minuts** de Plaça Espanya a l'estació de l'Aeri i **64** a Monistrol de Montserrat, on es canvia al cremallera; els caps de setmana i festius hi ha un tren cada hora.",
        ),
        table(
          "Pujar a Montserrat: preus d'adult del 2026",
          ["Bitllet", "Preu"],
          [
            ["Cremallera (des de Monistrol)", "9 € anada, 15 € anada i tornada"],
            ["Aeri de Montserrat", "10 € anada, 15 € anada i tornada"],
            ["Funicular de Sant Joan", "11,40 € anada, 17,50 € anada i tornada"],
            ["Trans Montserrat (tren, cremallera o aeri, funicular de Sant Joan, espai audiovisual, basílica i metro)", "50 €"],
            ["Tot Montserrat (el mateix, més museu i dinar de bufet)", "71,50 €"],
            ["Museu de Montserrat", "12 € (6 € de 8 a 16 anys)"],
          ],
          "Preus del cremallera vàlids fins al 31 de desembre de 2026, segons FGC; aeri, funicular i museu segons els seus webs, comprovats el 12 d'octubre de 2026.",
        ),
        callout(
          "warning",
          "Abans d'anar-hi",
          "El **funicular de la Santa Cova** està fora de servei per manteniment fins a nou avís (s'hi pot baixar a peu). La **basílica** demana entrada de pagament als turistes no residents; els residents a la UE hi entren gratis però han de reservar en línia l'accés al cambril de la Moreneta. La targeta T-mobilitat no val al cremallera.",
        ),
        ...h2("Què fer a dalt?"),
        ...paras("Una primera visita pot combinar:"),
        list(
          "el recinte del santuari;",
          "la basílica;",
          "l'entorn de la Moreneta, segons el tipus d'entrada;",
          "el museu, si t'interessa;",
          "el funicular de Sant Joan (el de la Santa Cova és tancat), segons el temps;",
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
        "Cómo ir a Montserrat por tu cuenta desde Barcelona: R5 desde Plaça Espanya y cremallera o Aeri (15 € ida y vuelta). Precios de 2026 y qué ha cambiado.",
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
        ...h2(
          "Precios de 2026",
          "La R5 tarda unos **60 minutos** de Plaça Espanya a la estación del Aeri y **64** a Monistrol de Montserrat, donde se cambia al cremallera; los fines de semana y festivos hay un tren cada hora.",
        ),
        table(
          "Subir a Montserrat: precios de adulto de 2026",
          ["Billete", "Precio"],
          [
            ["Cremallera (desde Monistrol)", "9 € ida, 15 € ida y vuelta"],
            ["Aeri de Montserrat", "10 € ida, 15 € ida y vuelta"],
            ["Funicular de Sant Joan", "11,40 € ida, 17,50 € ida y vuelta"],
            ["Trans Montserrat (tren, cremallera o Aeri, funicular de Sant Joan, espacio audiovisual, basílica y metro)", "50 €"],
            ["Tot Montserrat (lo mismo, más museo y comida de bufé)", "71,50 €"],
            ["Museu de Montserrat", "12 € (6 € de 8 a 16 años)"],
          ],
          "Precios del cremallera válidos hasta el 31 de diciembre de 2026, según FGC; Aeri, funicular y museo según sus webs, comprobados el 12 de octubre de 2026.",
        ),
        callout(
          "warning",
          "Antes de ir",
          "El **funicular de la Santa Cova** está fuera de servicio por mantenimiento hasta nuevo aviso (se puede bajar a pie). La **basílica** pide entrada de pago a los turistas no residentes; los residentes en la UE entran gratis pero deben reservar en línea el acceso al camarín de la Moreneta. La tarjeta T-mobilitat no vale en el cremallera.",
        ),
        ...h2("Qué hacer arriba"),
        ...paras("Una primera visita puede combinar:"),
        list(
          "el recinto del santuario;",
          "la basílica;",
          "el entorno de la Moreneta, según el tipo de entrada;",
          "el museo, si te interesa;",
          "el funicular de Sant Joan (el de la Santa Cova está cerrado), según el tiempo;",
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
        "How to reach Montserrat independently from Barcelona: the R5 from Plaça Espanya, then the rack railway or cable car (€15 return). 2026 fares and what changed.",
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
        ...h2(
          "2026 fares",
          "The R5 takes about **60 minutes** from Plaça Espanya to the Aeri station and **64** to Monistrol de Montserrat, where you change to the rack railway; at weekends and on holidays there is a train every hour.",
        ),
        table(
          "Getting up Montserrat: adult fares in 2026",
          ["Ticket", "Price"],
          [
            ["Rack railway (from Monistrol)", "€9 single, €15 return"],
            ["Aeri cable car", "€10 single, €15 return"],
            ["Sant Joan funicular", "€11.40 single, €17.50 return"],
            ["Trans Montserrat (train, rack railway or cable car, Sant Joan funicular, audiovisual space, basilica and metro)", "€50"],
            ["Tot Montserrat (the same, plus museum and buffet lunch)", "€71.50"],
            ["Museu de Montserrat", "€12 (€6 ages 8 to 16)"],
          ],
          "Rack-railway fares valid until 31 December 2026, per FGC; cable car, funicular and museum from their own sites, checked on 12 October 2026.",
        ),
        callout(
          "warning",
          "Before you go",
          "The **Santa Cova funicular** is out of service for maintenance until further notice (you can walk down). The **basilica** now charges non-resident tourists for entry; EU residents go in free but must book online to visit the Black Madonna. The T-mobilitat card is not valid on the rack railway.",
        ),
        ...h2("What to do up there"),
        ...paras("A first visit can combine:"),
        list(
          "the sanctuary precinct;",
          "the basilica;",
          "the Moreneta, depending on your ticket;",
          "the museum, if it interests you;",
          "the Sant Joan funicular (the Santa Cova one is closed), depending on time;",
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
    name: "Transports",
    url: "https://cerdanya.org/informacio-util/transports/",
    publisher: "Turisme Cerdanya",
  },
  {
    name: "R3: Modificació del servei entre L'Hospitalet de Llobregat i Puigcerdà",
    url: "https://rodalies.gencat.cat/ca/detalls/article/02_02_PAT_R3",
    publisher: "Rodalies de Catalunya",
  },
  {
    name: "R3: servei alternatiu per carretera entre la Garriga i Puigcerdà",
    url: "https://rodalies.gencat.cat/ca/detalls/article/08_12_Reforc_R3",
    publisher: "Rodalies de Catalunya",
  },
  {
    name: "R3: horaris de tren fins a la Tor de Querol a partir del 06.07",
    url: "https://rodalies.gencat.cat/web/.content/01_Actualitat/2026/02_02_PAT_R3/R3-Horaris-tren-fins-La-Tor-de-Querol-a-partir-06.07_V7.pdf",
    publisher: "Rodalies de Catalunya",
  },
  {
    name: "Bus urbà",
    url: "https://www.puigcerda.cat/ca/serveis/mobilitat/bus-urba/",
    publisher: "Ajuntament de Puigcerdà",
  },
  {
    name: "Bus Blanc — horaris 2025-2026",
    url: "https://cerdanya.org/wp-content/uploads/2026/02/Bus-Blanc-2026.pdf",
    publisher: "Turisme Cerdanya",
  },
  {
    name: "La Molina — informació pràctica i transport",
    url: "https://pirineu365.cat/lamolina/estacio/informacio-tecnica/",
    publisher: "FGC (PIRINEU365)",
  },
];

// R3 notice and train timetable re-checked on 24 Oct 2026: notice updated
// 06.07.2026 (plus a Balenyà-Els Hostalets stop change from 22/10), train
// sheet "a partir del 06.07" V7, last updated 16/09/2026. The two tables
// below list only the rows that sheet marks as R3 trains running through
// to Puigcerdà; none of them carries the weekday-only shading. The old
// "Adif planned to keep the cut until January 2027" line is gone: the
// notice no longer says it.
const CERDANYA_VERIFIED = "2026-10-24";

const CERDANYA_R3: Record<"ca" | "es" | "en", [title: string, body: string]> = {
  ca: [
    "L'R3, ara mateix",
    "Segons l'avís de Rodalies (actualitzat el 6 de juliol de 2026 i vigent el 24 d'octubre), l'R3 circula amb el 50 % dels trens que tenia abans del 20 de gener i no hi ha trens entre Barcelona i la Garriga: entre l'Hospitalet i Fabra i Puig o Montcada Bifurcació hi ha l'R4, i fins a la Garriga o Vic, autobusos directes de Rodalies. Des del 12 d'agost hi ha també autobusos complementaris entre la Garriga i Puigcerdà. Mira els horaris a rodalies.gencat.cat abans de sortir.",
  ],
  es: [
    "La R3, ahora mismo",
    "Según el aviso de Rodalies (actualizado el 6 de julio de 2026 y vigente el 24 de octubre), la R3 circula con el 50 % de los trenes que tenía antes del 20 de enero y no hay trenes entre Barcelona y La Garriga: entre L'Hospitalet y Fabra i Puig o Montcada Bifurcació está la R4, y hasta La Garriga o Vic, autobuses directos de Rodalies. Desde el 12 de agosto hay también autobuses complementarios entre La Garriga y Puigcerdà. Mira los horarios en rodalies.gencat.cat antes de salir.",
  ],
  en: [
    "The R3 right now",
    "According to Rodalies' notice (last updated 6 July 2026 and still in force on 24 October), the R3 is running 50% of the trains it had before 20 January, and no trains run between Barcelona and La Garriga: the R4 covers L'Hospitalet to Fabra i Puig or Montcada Bifurcació, and Rodalies direct buses run to La Garriga or Vic. Since 12 August there have also been complementary buses between La Garriga and Puigcerdà. Check the timetables at rodalies.gencat.cat before you go.",
  ],
};

/** Through trains only, from the Rodalies sheet valid since 6 July 2026. */
const CERDANYA_UP: string[][] = [
  ["6:46", "8:10", "8:29", "9:00", "9:21", "—"],
  ["10:16", "11:40", "12:01", "12:32", "12:54", "13:00"],
  ["13:16", "14:40", "14:59", "15:32", "15:54", "16:00"],
  ["16:16", "17:40", "17:59", "18:32", "18:54", "19:00"],
];

const CERDANYA_DOWN: string[][] = [
  ["—", "5:53", "6:17", "6:51", "7:12", "8:36"],
  ["—", "7:51", "8:15", "8:49", "9:11", "10:36"],
  ["—", "10:22", "10:46", "11:20", "11:41", "13:06"],
  ["14:14", "14:21", "14:45", "15:19", "15:41", "17:06"],
  ["17:13", "17:20", "17:44", "18:19", "18:41", "20:06"],
];

const CERDANYA_TT: Record<"ca" | "es" | "en", { up: [string, string[]]; down: [string, string[]]; note: string }> = {
  ca: {
    up: ["Trens R3 de pujada: la Garriga → Puigcerdà (cada dia)", ["La Garriga", "Ripoll", "Ribes de Freser", "La Molina", "Puigcerdà", "La Tor de Querol"]],
    down: ["Trens R3 de baixada: Puigcerdà → la Garriga (cada dia)", ["La Tor de Querol", "Puigcerdà", "La Molina", "Ribes de Freser", "Ripoll", "La Garriga"]],
    note: "Font: Rodalies, horari de tren R3 vigent des del 6 de juliol de 2026 (full actualitzat el 16/09/2026). Només els trens que fan tot el recorregut; la resta acaba a Ripoll o a Ribes. Consultat el 24/10/2026: pot canviar, comprova'l el dia que viatgis.",
  },
  es: {
    up: ["Trenes R3 de subida: La Garriga → Puigcerdà (todos los días)", ["La Garriga", "Ripoll", "Ribes de Freser", "La Molina", "Puigcerdà", "La Tor de Querol"]],
    down: ["Trenes R3 de bajada: Puigcerdà → La Garriga (todos los días)", ["La Tor de Querol", "Puigcerdà", "La Molina", "Ribes de Freser", "Ripoll", "La Garriga"]],
    note: "Fuente: Rodalies, horario de tren R3 vigente desde el 6 de julio de 2026 (hoja actualizada el 16/09/2026). Solo los trenes que hacen todo el recorrido; el resto termina en Ripoll o en Ribes. Consultado el 24/10/2026: puede cambiar, compruébalo el día que viajes.",
  },
  en: {
    up: ["R3 trains up: La Garriga → Puigcerdà (daily)", ["La Garriga", "Ripoll", "Ribes de Freser", "La Molina", "Puigcerdà", "La Tor de Querol"]],
    down: ["R3 trains down: Puigcerdà → La Garriga (daily)", ["La Tor de Querol", "Puigcerdà", "La Molina", "Ribes de Freser", "Ripoll", "La Garriga"]],
    note: "Source: Rodalies, R3 train timetable in force since 6 July 2026 (sheet updated 16/09/2026). Only trains that run the whole way; the rest terminate at Ripoll or Ribes. Checked 24/10/2026: it can change, so confirm on the day you travel.",
  },
};

function cerdanyaTimetable(locale: "ca" | "es" | "en") {
  const t = CERDANYA_TT[locale];
  return [table(t.up[0], t.up[1], CERDANYA_UP, t.note), table(t.down[0], t.down[1], CERDANYA_DOWN, t.note)];
}

export const CERDANYA: B2Article = {
  key: "cerdanya",
  entryKey: "guide-cerdanya-without-car",
  categoryKey: "mountain",
  sources: CERDANYA_SOURCES,
  heroKey: "b2-cerdanya-puigcerda",
  secondaryKey: "b2-cerdanya-estany",
  secondaryAlt: {
    ca: "L'estany de Puigcerdà, a la Cerdanya",
    es: "El estanque de Puigcerdà, en la Cerdanya",
    en: "The lake at Puigcerdà, in Cerdanya",
  },
  secondaryCaption: {
    ca: "L'estany queda a pocs minuts a peu de l'estació, part de l'atractiu d'anar-hi sense cotxe.",
    es: "El estanque está a pocos minutos a pie de la estación, parte del atractivo de ir sin coche.",
    en: "The lake is a few minutes' walk from the station, which is part of the car-free appeal.",
  },
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
      title: "Cerdanya sense cotxe: horaris del tren R3 a Puigcerdà, busos i què és realista",
      seoTitle: "Cerdanya sense cotxe: horaris R3 a Puigcerdà i busos",
      seoDescription:
        "Cerdanya sense cotxe: horaris dels trens R3 directes a la Molina i Puigcerdà, com fer el tram Barcelona–la Garriga, el bus urbà i el Bus Blanc d'hivern.",
      excerpt:
        "Els trens R3 que arriben a Puigcerdà, com sortir de Barcelona mentre duren les obres, i què és realista sense cotxe.",
      blocks: [
        lead(
          "Sí, es pot anar a la Cerdanya sense cotxe: amb la línia **R3**, que puja per Vic i Ripoll fins a la Molina, Puigcerdà i la Tor de Querol. Mentre duren les obres no hi ha trens entre Barcelona i la Garriga (el tram es fa amb autobusos de Rodalies), i de la Garriga a Puigcerdà hi ha **quatre trens directes al dia**, amb un trajecte d'entre 2 h 35 min i 2 h 46 min. Un cop allà, Puigcerdà és la base més pràctica.",
        ),
        callout("warning", ...CERDANYA_R3.ca),
        ...h2("Horaris de l'R3 a la Molina i Puigcerdà"),
        ...cerdanyaTimetable("ca"),
        ...paras(
          "La resta de trens de l'R3 acaben a Ripoll o a Ribes de Freser, i entre la Garriga i Puigcerdà també circulen els autobusos complementaris de Rodalies. També hi ha línies regulars d'autobús des de Barcelona, la Seu d'Urgell i Lleida (ALSA) i des de Girona per Olot i Ripoll (TEISA).",
        ),
        ...h2(
          "Puigcerdà és la base més fàcil",
          "Puigcerdà té estació de tren i un bus urbà de proximitat que funciona cada dia i fa un recorregut circular des de la plaça Barcelona per l'Hospital de Cerdanya, la plaça de l'Estació i el passeig Josep Pla. El bitllet senzill costa 1,50 € i l'abonament de 10 viatges, 9 €, a l'Oficina de Turisme.",
          "Per a una escapada sense vehicle, és més pràctic dormir en un nucli amb transport que intentar replicar una ruta de cotxe.",
        ),
        ...h2(
          "La Molina en tren",
          "La Molina té estació pròpia a l'R3, i des de l'estació un autobús intern puja fins al peu de pistes. El web de l'estació anuncia també el **Ski Tren**, que es compra a Renfe/Rodalies i combina el tren d'anada i tornada, el bus intern i el forfet d'un dia.",
        ),
        ...h2(
          "Temporada de neu: el Bus Blanc",
          "El Consell Comarcal de la Cerdanya ofereix el **Bus Blanc** cap a la Molina i Masella, amb dues rutes: una per Llívia, Puigcerdà i Urtx, i l'altra per Martinet, Bellver i Alp. La temporada 2025-26 va començar el cap de setmana del 6 de desembre de 2025 i circulava tots els caps de setmana i festius escolars, excepte el dia de Nadal, a 2 €. El servei de la temporada 2026-2027 encara no s'ha publicat: comprova-ho abans de comptar-hi.",
          `Per triar estació, mira ${b2link("ski", "ca", "les estacions d'esquí de Catalunya")}.`,
        ),
        callout(
          "warning",
          "Què no et prometrem",
          "No direm que «tota la Cerdanya es pot visitar fàcilment sense cotxe». Molts pobles, rutes i espais naturals hi tenen connexions limitades. La utilitat d'aquesta guia és precisament explicar què sí és realista.",
        ),
        ...paras(
          `Si vols més escapades ferroviàries, mira ${link("trains", "ca", "dotze escapades en tren")}, i si el destí és el Pirineu oriental, ${b2link("ripolles", "ca", "la guia del Ripollès")}.`,
        ),
        ...h2(
          "Núria, a la mateixa línia",
          "L'R3 que puja a la Cerdanya para també a **Ribes de Freser**, on enllaça amb el cremallera de la Vall de Núria. És de les poques escapades d'alta muntanya que es poden fer de punta a punta sense cotxe: a Núria no s'hi pot pujar per carretera.",
          "Combinar la Cerdanya i Núria en un mateix viatge és possible perquè comparteixen línia; només cal mirar els horaris de tots dos trens el dia que hi vagis.",
        ),
        faq([
          { question: "Quants trens hi ha de la Garriga a Puigcerdà?", answer: "Quatre trens directes al dia de pujada i cinc de baixada, segons l'horari vigent des del 6 de juliol de 2026. La resta de trens de l'R3 acaben a Ripoll o a Ribes de Freser." },
          { question: "Es pot anar en tren de Barcelona a Puigcerdà?", answer: "No directament mentre duren les obres: de Barcelona a la Garriga hi ha autobusos de Rodalies, i de la Garriga a Puigcerdà, el tren R3." },
          { question: "Quant dura el trajecte de la Garriga a Puigcerdà?", answer: "Entre 2 h 35 min i 2 h 46 min, segons el tren." },
          { question: "Hi ha bus a les pistes des de Puigcerdà?", answer: "La temporada 2025-26, el Bus Blanc va unir la Cerdanya amb la Molina i Masella els caps de setmana i festius escolars, a 2 €. El de 2026-27 encara no s'ha publicat." },
        ]),
        ...paras(verifiedLine("ca", CERDANYA_VERIFIED)),
        ...b2Related(["nuria", "ski", "ripolles", "snow", "girona"], "ca"),
      ],
    },

    es: {
      path: "guias/cerdana-sin-coche",
      title: "Cerdanya sin coche: horarios del tren R3 a Puigcerdà, autobuses y qué es realista",
      seoTitle: "Cerdanya sin coche: horarios del tren R3 a Puigcerdà",
      seoDescription:
        "Cerdanya sin coche: horarios de los trenes R3 directos a La Molina y Puigcerdà, cómo hacer el tramo Barcelona–La Garriga, el bus urbano y el Bus Blanc.",
      excerpt:
        "Los trenes R3 que llegan a Puigcerdà, cómo salir de Barcelona mientras duran las obras y qué es realista sin coche.",
      blocks: [
        lead(
          "Sí, se puede ir a la Cerdanya sin coche: con la línea **R3**, que sube por Vic y Ripoll hasta La Molina, Puigcerdà y La Tor de Querol. Mientras duran las obras no hay trenes entre Barcelona y La Garriga (el tramo se hace en autobuses de Rodalies), y de La Garriga a Puigcerdà hay **cuatro trenes directos al día**, con un trayecto de entre 2 h 35 min y 2 h 46 min. Una vez allí, Puigcerdà es la base más práctica.",
        ),
        callout("warning", ...CERDANYA_R3.es),
        ...h2("Horarios de la R3 a La Molina y Puigcerdà"),
        ...cerdanyaTimetable("es"),
        ...paras(
          "El resto de trenes de la R3 terminan en Ripoll o en Ribes de Freser, y entre La Garriga y Puigcerdà también circulan los autobuses complementarios de Rodalies. Hay además líneas regulares de autobús desde Barcelona, La Seu d'Urgell y Lleida (ALSA) y desde Girona por Olot y Ripoll (TEISA).",
        ),
        ...h2(
          "Puigcerdà, la base más sencilla",
          "Puigcerdà tiene estación de tren y un bus urbano de proximidad que funciona todos los días y hace un recorrido circular desde la plaza Barcelona por el Hospital de Cerdanya, la plaza de la Estación y el paseo Josep Pla. El billete sencillo cuesta 1,50 € y el abono de 10 viajes, 9 €, en la Oficina de Turismo.",
          "Es más realista dormir en un núcleo con transporte que intentar replicar una ruta pensada para coche.",
        ),
        ...h2(
          "La Molina en tren",
          "La Molina tiene estación propia en la R3, y desde la estación un autobús interno sube hasta el pie de pistas. La web de la estación anuncia también el **Ski Tren**, que se compra en Renfe/Rodalies y combina el tren de ida y vuelta, el bus interno y el forfait de un día.",
        ),
        ...h2(
          "Temporada de nieve: el Bus Blanc",
          "El Consell Comarcal de la Cerdanya ofrece el **Bus Blanc** hacia La Molina y Masella, con dos rutas: una por Llívia, Puigcerdà y Urtx, y otra por Martinet, Bellver y Alp. La temporada 2025-26 empezó el fin de semana del 6 de diciembre de 2025 y circulaba todos los fines de semana y festivos escolares, salvo el día de Navidad, a 2 €. El servicio de la temporada 2026-2027 aún no se ha publicado: compruébalo antes de contar con él.",
          `Para elegir estación, mira ${b2link("ski", "es", "las estaciones de esquí de Cataluña")}.`,
        ),
        callout(
          "warning",
          "Lo que no prometemos",
          "No presentamos toda la comarca como fácilmente accesible sin coche. Muchos pueblos y espacios naturales tienen conexiones limitadas.",
        ),
        ...paras(
          `Más escapadas ferroviarias: ${link("trains", "es", "doce escapadas en tren")}. Y si vas al Pirineo oriental, ${b2link("ripolles", "es", "la guía del Ripollès")}.`,
        ),
        ...h2(
          "Núria, en la misma línea",
          "La R3 que sube a la Cerdanya para también en **Ribes de Freser**, donde enlaza con el cremallera de la Vall de Núria. Es una de las pocas escapadas de alta montaña que se pueden hacer de punta a punta sin coche: a Núria no se puede subir por carretera.",
          "Combinar la Cerdanya y Núria en un mismo viaje es posible porque comparten línea; solo hay que mirar los horarios de los dos trenes el día que vayas.",
        ),
        faq([
          { question: "¿Cuántos trenes hay de La Garriga a Puigcerdà?", answer: "Cuatro trenes directos al día de subida y cinco de bajada, según el horario vigente desde el 6 de julio de 2026. El resto de trenes de la R3 terminan en Ripoll o en Ribes de Freser." },
          { question: "¿Se puede ir en tren de Barcelona a Puigcerdà?", answer: "No directamente mientras duran las obras: de Barcelona a La Garriga hay autobuses de Rodalies, y de La Garriga a Puigcerdà, el tren R3." },
          { question: "¿Cuánto dura el trayecto de La Garriga a Puigcerdà?", answer: "Entre 2 h 35 min y 2 h 46 min, según el tren." },
          { question: "¿Hay autobús a las pistas desde Puigcerdà?", answer: "En la temporada 2025-26, el Bus Blanc unió la Cerdanya con La Molina y Masella los fines de semana y festivos escolares, a 2 €. El de 2026-27 aún no se ha publicado." },
        ]),
        ...paras(verifiedLine("es", CERDANYA_VERIFIED)),
        ...b2Related(["nuria", "ski", "ripolles", "snow", "girona"], "es"),
      ],
    },

    en: {
      path: "guides/cerdanya-without-a-car",
      title: "Cerdanya without a car: R3 train times to Puigcerdà, buses and what is realistic",
      seoTitle: "Cerdanya without a car: R3 train times to Puigcerdà",
      seoDescription:
        "Cerdanya without a car: times of the through R3 trains to La Molina and Puigcerdà, the Barcelona–La Garriga bus link, the town bus and the Bus Blanc.",
      excerpt:
        "The R3 trains that reach Puigcerdà, how to leave Barcelona while the works last, and what is realistic without a car.",
      blocks: [
        lead(
          "Yes, you can reach Cerdanya without a car: on Rodalies line **R3**, which climbs via Vic and Ripoll to La Molina, Puigcerdà and La Tor de Querol. While the works last there are no trains between Barcelona and La Garriga (that stretch is by Rodalies bus), and **four through trains a day** run from La Garriga to Puigcerdà, taking between 2 h 35 min and 2 h 46 min. Once there, Puigcerdà is the practical base.",
        ),
        callout("warning", ...CERDANYA_R3.en),
        ...h2("R3 train times to La Molina and Puigcerdà"),
        ...cerdanyaTimetable("en"),
        ...paras(
          "Other R3 trains terminate at Ripoll or Ribes de Freser, and Rodalies also runs complementary buses between La Garriga and Puigcerdà. Regular coaches link the area with Barcelona, La Seu d'Urgell and Lleida (ALSA) and with Girona via Olot and Ripoll (TEISA).",
        ),
        ...h2(
          "Puigcerdà is the practical base",
          "Puigcerdà has a railway station and a small town bus that runs every day on a loop from Plaça Barcelona via the Cerdanya hospital, the station square and Passeig Josep Pla. A single ticket is €1.50 and a 10-trip pass €9, sold at the tourist office.",
          "Sleeping somewhere with transport beats trying to reproduce a driving itinerary.",
        ),
        ...h2(
          "La Molina by train",
          "La Molina has its own R3 station, and a resort shuttle bus runs from the station up to the slopes. The resort's website also lists the **Ski Tren**, sold by Renfe/Rodalies, which bundles the return train, the shuttle and a one-day lift pass.",
        ),
        ...h2(
          "Snow season: the Bus Blanc",
          "The Cerdanya county council runs the **Bus Blanc** to La Molina and Masella on two routes: one via Llívia, Puigcerdà and Urtx, the other via Martinet, Bellver and Alp. In 2025-26 it started on the weekend of 6 December 2025 and ran every weekend and school holiday except Christmas Day, for €2. The 2026-27 service has not been published yet, so check before relying on it.",
          `To pick a resort, see ${b2link("ski", "en", "Catalonia's ski resorts compared")}.`,
        ),
        callout(
          "warning",
          "What this guide will not claim",
          "The value here is honesty: some villages and mountain areas remain difficult without private transport. We will not pretend the whole comarca is easy car-free.",
        ),
        ...paras(
          `More rail trips: ${link("trains", "en", "twelve day trips by train")}. Heading further east? ${b2link("ripolles", "en", "the Ripollès guide")}.`,
        ),
        ...h2(
          "Núria, on the same line",
          "The R3 that runs up to Cerdanya also stops at **Ribes de Freser**, where it connects with the Vall de Núria rack railway. It is one of the few high-mountain trips you can do end to end without a car: there is no road up to Núria.",
          "Combining Cerdanya and Núria on one trip works because they share the line; just check both timetables for the day you travel.",
        ),
        faq([
          { question: "How many trains run from La Garriga to Puigcerdà?", answer: "Four through trains a day up and five down, on the timetable in force since 6 July 2026. Other R3 trains terminate at Ripoll or Ribes de Freser." },
          { question: "Can you take the train from Barcelona to Puigcerdà?", answer: "Not directly while the works last: Rodalies buses run from Barcelona to La Garriga, and the R3 train from La Garriga to Puigcerdà." },
          { question: "How long is the R3 from La Garriga to Puigcerdà?", answer: "Between 2 h 35 min and 2 h 46 min, depending on the train." },
          { question: "Is there a bus to the slopes from Puigcerdà?", answer: "In 2025-26 the Bus Blanc linked Cerdanya with La Molina and Masella at weekends and in school holidays, for €2. The 2026-27 service has not been published yet." },
        ]),
        ...paras(verifiedLine("en", CERDANYA_VERIFIED)),
        ...b2Related(["nuria", "ski", "ripolles", "snow", "girona"], "en"),
      ],
    },
  },
};
