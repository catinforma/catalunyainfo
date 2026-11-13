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
 * ## Timetables and fares
 *
 * The first version printed none: a departure time copied into an article
 * goes stale. Search Console showed the pages were wanted for exactly that
 * ("cremallera de montserrat horarios", "tren barcelona girona"), so since
 * 24 Oct 2026 Girona and Montserrat carry dated tables read from the
 * operators' own data (Rodalies planner, Renfe and FGC open GTFS, the Aeri
 * calendar). The rule that survives, enforced by batch02.test.ts: clock times
 * live only inside tables, each with the dates it was read for, never in the
 * running text or the FAQ.
 *
 * The Montserrat piece also drops figures the editorial package supplied.
 * The rack railway's height gain was given as "more than 600 metres"; the
 * line climbs from Monistrol de Montserrat to the monastery, which is closer
 * to 540, and no operator page states 600. The cable car's every-15-minutes
 * headway is now on the Aeri's own timetable page and is printed; the rack
 * railway's hourly service from Monistrol de Montserrat comes from FGC's
 * timetable data and its own site ("Trains run every hour").
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
  { name: "Cercador d'horaris de Rodalies", url: "https://rodalies.gencat.cat/ca/horaris/", publisher: "Rodalies de Catalunya" },
  { name: "Horarios de alta velocidad, larga y media distancia (datos abiertos)", url: "https://data.renfe.com/dataset/horarios-de-alta-velocidad-larga-distancia-y-media-distancia", publisher: "Renfe" },
  { name: "R11: horaris", url: "https://rodalies.gencat.cat/web/.content/02_Horaris/horaris/R11.pdf", publisher: "Rodalies de Catalunya" },
  { name: "Visita", url: "https://gironaepiscopal.cat/visita/", publisher: "Girona Episcopal" },
  { name: "Museu d'Història dels Jueus: informació", url: "https://www.girona.cat/call/cat/info.php", publisher: "Ajuntament de Girona" },
  { name: "Planifica la visita", url: "https://www.mac.cat/ca/Visita-ns-Portada/Girona-Portada-Seu/Planifica-la-visita-Girona", publisher: "Museu d'Arqueologia de Catalunya" },
  { name: "Banys Àrabs", url: "https://www.girona.cat/turisme/cat/monuments_banysarabs.php", publisher: "Ajuntament de Girona — Turisme" },
];

// Trains and every row of the sights table re-checked on 24 Oct 2026: R11
// from the official Rodalies planner (serveisgrs.rodalies.gencat.cat, with
// fares), high-speed from Renfe's open GTFS (Fichero_AV_LD), sights from the
// sources below. Clock times stay inside tables (see batch02.test.ts).
// 26 Oct 2026: R11 journey range re-read from the same planner for 27, 28
// and 31 Oct: durations 1 h 19, 1 h 25, 1 h 31 and 1 h 41 (the 7:16 from
// Sants), so the range runs to 1 h 41, not 1 h 31. The seoDescription still
// was corrected to 1 h 41 on 26 Oct as a factual fix (allowed inside a freeze).
// 28 Oct 2026 (research_notes/page1-28oct/figueres_girona.md): R11, Renfe
// GTFS and every sight re-read; nothing contradicted. The train section now
// follows the lead (the queries are "tren barcelona girona", "renfe
// barcelona girona"). Added Renfe's planner "precio desde" for 3 Nov (Avant
// 17.40, AVE 36.50 EUR) and its child rule, the MAC's other free days, and
// a caveat on the two Sunday timetables the bishopric's page prints.
const GIRONA_VERIFIED = "2026-10-28";

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
      title: "Tren de Barcelona a Girona: horaris, preus i què veure en un dia",
      seoTitle: "Tren de Barcelona a Girona: horaris, preus, AVE o Rodalies",
      seoDescription:
        "R11 de Rodalies en 1 h 19-1 h 41 des de 8,95 €, o alta velocitat en uns 40 minuts. Trens al dia, últim de tornada i ruta d'un dia pel Barri Vell.",
      excerpt:
        "R11 o alta velocitat: quant triga i quant costa el tren de Barcelona a Girona, i una ruta d'un dia pel Barri Vell, sense cotxe.",
      blocks: [
        lead(
          "Per anar de Barcelona a Girona en tren hi ha dues opcions: la **R11 de Rodalies**, que triga **d'1 h 19 a 1 h 41 (la majoria, 1 h 19 o 1 h 31)** des de Sants i costa **8,95 €** el senzill (12 € als trens MD), i l'**alta velocitat de Renfe**, que hi arriba en **uns 40 minuts**. Totes dues paren a l'estació de Girona, i la ciutat es recorre a peu en un dia.",
        ),
        ...h2(
          "Tren de Barcelona a Girona: R11 o alta velocitat",
          "Girona té trens de Rodalies i d'alta velocitat des de Barcelona. La taula compara les dues opcions per a un dia feiner i un dissabte.",
        ),
        table(
          "Tren de Barcelona-Sants a Girona",
          ["Tren", "Durada", "Trens al dia", "Primer i últim des de Sants", "Últim de tornada", "Senzill"],
          [
            ["R11 de Rodalies (MD i regional)", "d'1 h 19 a 1 h 41 (la majoria, 1 h 19 o 1 h 31)", "23 feiners, 15 dissabtes", "5:56 – 21:46 (dissabte des de 6:46)", "21:19 (dissabte 21:23)", "8,95 € regional, 12 € MD"],
            ["Alta velocitat de Renfe (Avant, AVE, Euromed)", "39 – 49 min (alguns directes, 26 min)", "17 feiners, 11 dissabtes", "6:40 – 23:20", "19:52 (dissabte 19:25)", "Des de 17,40 € (Avant) i 36,50 € (AVE), a renfe.com per al 3 de novembre"],
          ],
          "Cercador oficial de Rodalies (amb els seus preus) i dades obertes d'horaris de Renfe per al 27 i el 31 d'octubre de 2026.",
        ),
        ...h2(
          "Quin tren agafar",
          "La més econòmica és la línia **R11** de Rodalies, que surt de Barcelona Sants i para a Passeig de Gràcia i al Clot abans de seguir per Granollers fins a Girona i Figueres. Els trens de mitjana distància (MD) fan el trajecte en 1 h 19 i costen 12 €; els regionals, que fan més parades, triguen 1 h 31 i costen 8,95 €. L'**alta velocitat** de Renfe surt de Sants i arriba en uns 40 minuts, però el preu varia segons el tren i la data: el 28 d'octubre, el cercador de Renfe donava preus des de 17,40 € en Avant i 36,50 € en AVE per al 3 de novembre. Els infants de 4 a 13 anys tenen un 40 % de descompte sobre la tarifa base i els menors de 4 viatgen gratis si no ocupen seient. L'últim tren d'alta velocitat de tornada surt força més d'hora que l'últim R11.",
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
          "Horaris i preus dels monuments",
          "Consultats el 28 d'octubre de 2026.",
        ),
        table(
          "",
          ["Lloc", "Horari", "Entrada general"],
          [
            ["Catedral + basílica de Sant Feliu + Museu d'Art (entrada Girona Episcopal, vàlida 48 h)", "Catedral: dl–ds 10–18 h, dg 12–18 h. Sant Feliu: dl–ds 10–18 h, dg 13–18 h", "12 €"],
            ["Banys Àrabs", "març–oct.: dl–ds 10–18 h, dg 10–14 h · nov.–febr.: dl–dv 10–14 h, ds 10–17.30 h, dg 10–14 h", "3 € (reduïda 1 €)"],
            ["Museu d'Història dels Jueus (Call)", "set.–juny: dt–ds 10–18 h; dg, dl i festius 10–14 h · jul.–ag.: dt–ds 10–19 h", "6 € (reduïda 3 €)"],
            ["Sant Pere de Galligants (MAC Girona)", "dt–ds 10–18 h (maig–set. fins a les 19 h), dg 10–14 h; tancat dilluns", "6 € (reduïda 4 €)"],
            ["Passeig de la Muralla", "set.–maig 8–21 h · juny–ag. 8–23 h", "—"],
          ],
        ),
        ...paras(
          "La Catedral tanca el 25 de desembre, l'1 i el 6 de gener i el diumenge de Pasqua, i no s'hi pot fer la visita cultural a la nau durant les celebracions. El carnet GironaMuseus dona un 50 % de descompte en sis museus de la ciutat. Els diumenges, comprova l'horari de la Catedral i Sant Feliu el mateix dia: la web del bisbat en dona dos de diferents.",
        ),
        ...h2(
          "Què és gratuït",
          "El primer diumenge de cada mes, el Museu d'Història dels Jueus i Sant Pere de Galligants són gratuïts, i també ho són sempre per als menors de 16 anys. El MAC també obre de franc el 23 d'abril, el 18 de maig, l'11 de setembre i el 29 d'octubre (festa local). Passejar pel Call, les cases de l'Onyar i la Rambla no costa res.",
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
        ...b2Related(["figueres", "sitges", "tarragona", "montserratFree", "cerdanya"], "ca"),
      ],
    },

    es: {
      path: "escapadas/girona-desde-barcelona-tren",
      title: "Tren de Barcelona a Girona: horarios, precios y qué ver en un día",
      seoTitle: "Tren Barcelona–Girona: horarios, precios, AVE o Rodalies",
      seoDescription:
        "R11 de Rodalies en 1 h 19-1 h 41 desde 8,95 €, o alta velocidad en unos 40 minutos. Trenes al día, último de vuelta y ruta de un día por el Barri Vell.",
      excerpt:
        "R11 o alta velocidad: cuánto tarda y cuánto cuesta el tren de Barcelona a Girona, y una ruta de un día por el Barri Vell, sin coche.",
      blocks: [
        lead(
          "Para ir de Barcelona a Girona en tren hay dos opciones: la **R11 de Rodalies**, que tarda **de 1 h 19 a 1 h 41 (la mayoría, 1 h 19 o 1 h 31)** desde Sants y cuesta **8,95 €** el sencillo (12 € en los trenes MD), y la **alta velocidad de Renfe**, que llega en **unos 40 minutos**. Las dos paran en la estación de Girona, y la ciudad se recorre a pie en un día.",
        ),
        ...h2(
          "Tren de Barcelona a Girona: R11 o alta velocidad",
          "Girona tiene trenes de Rodalies y de alta velocidad desde Barcelona. La tabla compara las dos opciones para un día laborable y un sábado.",
        ),
        table(
          "Tren de Barcelona-Sants a Girona",
          ["Tren", "Duración", "Trenes al día", "Primero y último desde Sants", "Último de vuelta", "Sencillo"],
          [
            ["R11 de Rodalies (MD y regional)", "de 1 h 19 a 1 h 41 (la mayoría, 1 h 19 o 1 h 31)", "23 laborables, 15 sábados", "5:56 – 21:46 (sábado desde 6:46)", "21:19 (sábado 21:23)", "8,95 € regional, 12 € MD"],
            ["Alta velocidad de Renfe (Avant, AVE, Euromed)", "39 – 49 min (algunos directos, 26 min)", "17 laborables, 11 sábados", "6:40 – 23:20", "19:52 (sábado 19:25)", "Desde 17,40 € (Avant) y 36,50 € (AVE), en renfe.com para el 3 de noviembre"],
          ],
          "Planificador oficial de Rodalies (con sus precios) y datos abiertos de horarios de Renfe para el 27 y el 31 de octubre de 2026.",
        ),
        ...h2(
          "Qué tren coger",
          "La más económica es la línea **R11** de Rodalies, que sale de Barcelona Sants y para en Passeig de Gràcia y El Clot antes de seguir por Granollers hasta Girona y Figueres. Los trenes de media distancia (MD) hacen el trayecto en 1 h 19 y cuestan 12 €; los regionales, con más paradas, tardan 1 h 31 y cuestan 8,95 €. La **alta velocidad** de Renfe sale de Sants y llega en unos 40 minutos, pero el precio varía según el tren y la fecha: el 28 de octubre, el buscador de Renfe daba precios desde 17,40 € en Avant y 36,50 € en AVE para el 3 de noviembre. Los niños de 4 a 13 años tienen un 40 % de descuento sobre la tarifa base y los menores de 4 viajan gratis si no ocupan asiento. El último tren de alta velocidad de vuelta sale bastante antes que el último R11.",
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
        ...h2(
          "Horarios y precios de los monumentos",
          "Consultados el 28 de octubre de 2026.",
        ),
        table(
          "",
          ["Lugar", "Horario", "Entrada general"],
          [
            ["Catedral + basílica de Sant Feliu + Museu d'Art (entrada Girona Episcopal, válida 48 h)", "Catedral: lu–sá 10–18 h, do 12–18 h. Sant Feliu: lu–sá 10–18 h, do 13–18 h", "12 €"],
            ["Baños Árabes", "mar.–oct.: lu–sá 10–18 h, do 10–14 h · nov.–feb.: lu–vi 10–14 h, sá 10–17.30 h, do 10–14 h", "3 € (reducida 1 €)"],
            ["Museu d'Història dels Jueus (Call)", "sep.–jun.: ma–sá 10–18 h; do, lu y festivos 10–14 h · jul.–ago.: ma–sá 10–19 h", "6 € (reducida 3 €)"],
            ["Sant Pere de Galligants (MAC Girona)", "ma–sá 10–18 h (may.–sep. hasta las 19 h), do 10–14 h; cerrado lunes", "6 € (reducida 4 €)"],
            ["Paseo de la Muralla", "sep.–may. 8–21 h · jun.–ago. 8–23 h", "—"],
          ],
        ),
        ...paras(
          "La Catedral cierra el 25 de diciembre, el 1 y 6 de enero y el domingo de Pascua, y no se puede hacer la visita cultural a la nave durante los oficios. El carnet GironaMuseus da un 50 % de descuento en seis museos de la ciudad. Los domingos, comprueba el horario de la Catedral y Sant Feliu el mismo día: la web del obispado da dos distintos.",
        ),
        ...h2(
          "Qué es gratis",
          "El primer domingo de cada mes, el Museu d'Història dels Jueus y Sant Pere de Galligants son gratuitos, y siempre lo son para menores de 16 años. El MAC también abre gratis el 23 de abril, el 18 de mayo, el 11 de septiembre y el 29 de octubre (fiesta local). Pasear por el Call, las casas del Onyar y la Rambla no cuesta nada.",
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
        ...b2Related(["figueres", "sitges", "tarragona", "montserratFree", "cerdanya"], "es"),
      ],
    },

    en: {
      path: "day-trips/girona-from-barcelona-by-train",
      title: "Barcelona to Girona by train: times, fares and a one-day route",
      seoTitle: "Barcelona to Girona by train: times, fares, AVE or R11",
      seoDescription:
        "The R11 takes 1 h 19-1 h 41 from €8.95; high-speed trains take about 40 minutes. Trains a day, the last train back and a one-day walk round the old town.",
      excerpt:
        "R11 or high-speed: how long the train from Barcelona to Girona takes, what it costs, and a one-day route through the old town without a car.",
      blocks: [
        lead(
          "There are two ways to go from Barcelona to Girona by train: Rodalies line **R11**, which takes **1 h 19 to 1 h 41 (most take 1 h 19 or 1 h 31)** from Sants and costs **€8.95** single (€12 on MD trains), and **Renfe's high-speed trains**, which take **about 40 minutes**. Both stop at Girona station, and the city is easy to see on foot in a day.",
        ),
        ...h2(
          "Barcelona to Girona train: R11 or high-speed",
          "Girona has both Rodalies and high-speed trains from Barcelona. The table compares the two for a weekday and a Saturday.",
        ),
        table(
          "Barcelona-Sants to Girona by train",
          ["Train", "Journey", "Trains a day", "First and last from Sants", "Last train back", "Single fare"],
          [
            ["Rodalies R11 (MD and regional)", "1 h 19 to 1 h 41 (most take 1 h 19 or 1 h 31)", "23 on weekdays, 15 on Saturdays", "5:56 – 21:46 (Saturday from 6:46)", "21:19 (Saturday 21:23)", "€8.95 regional, €12 MD"],
            ["Renfe high-speed (Avant, AVE, Euromed)", "39 – 49 min (some non-stop, 26 min)", "17 on weekdays, 11 on Saturdays", "6:40 – 23:20", "19:52 (Saturday 19:25)", "From €17.40 (Avant) and €36.50 (AVE) on renfe.com for 3 November"],
          ],
          "Official Rodalies journey planner (with its fares) and Renfe's open timetable data, for 27 and 31 October 2026.",
        ),
        ...h2(
          "Which train to take",
          "The cheaper is Rodalies line **R11**. It leaves from Barcelona Sants, calls at Passeig de Gràcia and El Clot, and then runs via Granollers to Girona and Figueres. Medium-distance (MD) trains take 1 h 19 and cost €12; regional trains, which make more stops, take 1 h 31 and cost €8.95. Renfe's **high-speed** trains leave from Sants and take about 40 minutes, but the fare depends on the train and the date: on 28 October Renfe's planner showed fares from €17.40 on Avant and €36.50 on AVE for 3 November. Children aged 4 to 13 get 40% off the base fare, and under-4s travel free without a seat. The last high-speed train back leaves well before the last R11.",
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
        ...h2(
          "Sights: hours and prices",
          "Checked 28 October 2026.",
        ),
        table(
          "",
          ["Sight", "Hours", "General admission"],
          [
            ["Cathedral + Sant Feliu basilica + Art Museum (Girona Episcopal ticket, valid 48 h)", "Cathedral: Mon–Sat 10:00–18:00, Sun 12:00–18:00. Sant Feliu: Mon–Sat 10:00–18:00, Sun 13:00–18:00", "€12"],
            ["Arab Baths", "Mar–Oct: Mon–Sat 10:00–18:00, Sun 10:00–14:00 · Nov–Feb: Mon–Fri 10:00–14:00, Sat 10:00–17:30, Sun 10:00–14:00", "€3 (reduced €1)"],
            ["Museum of Jewish History (Call)", "Sep–Jun: Tue–Sat 10:00–18:00; Sun, Mon and holidays 10:00–14:00 · Jul–Aug: Tue–Sat 10:00–19:00", "€6 (reduced €3)"],
            ["Sant Pere de Galligants (MAC Girona)", "Tue–Sat 10:00–18:00 (May–Sep until 19:00), Sun 10:00–14:00; closed Mondays", "€6 (reduced €4)"],
            ["City walls walk", "Sep–May 08:00–21:00 · Jun–Aug 08:00–23:00", "—"],
          ],
        ),
        ...paras(
          "The Cathedral is closed on 25 December, 1 and 6 January and Easter Sunday. You cannot tour the nave during services. A GironaMuseus card gives 50% off at six of the city's museums. On Sundays, check the Cathedral and Sant Feliu hours on the day: the bishopric's page gives two different ones.",
        ),
        ...h2(
          "What's free",
          "On the first Sunday of every month, the Museum of Jewish History and Sant Pere de Galligants are free. Both are always free for under-16s, and the MAC is also free on 23 April, 18 May, 11 September and 29 October (the city's local holiday). Walking through the Call, past the Onyar houses and along the Rambla costs nothing.",
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
        ...b2Related(["figueres", "sitges", "tarragona", "montserratFree", "cerdanya"], "en"),
      ],
    },
  },
};

/* ========================================================================== */
/* 05 — Montserrat without a tour                                             */
/* ========================================================================== */

const MONTSERRAT_SOURCES = [
  {
    name: "Cremallera i funiculars de Montserrat: tarifes",
    url: "https://turistren.cat/trens/cremallera-i-funiculars-de-montserrat/",
    publisher: "Turistren (FGC)",
  },
  {
    name: "Cremallera de Montserrat",
    url: "https://www.cremallerademontserrat.cat/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Horaris FGC (dades obertes GTFS)",
    url: "https://www.fgc.cat/google/google_transit.zip",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Aeri de Montserrat: horaris i tarifes",
    url: "https://aeridemontserrat.com/horaris-i-tarifes/",
    publisher: "Aeri de Montserrat",
  },
  {
    name: "Aeri de Montserrat: calendari 2026",
    url: "https://aeridemontserrat.com/calendari/?lang=ca&Y=2026&m=11",
    publisher: "Aeri de Montserrat",
  },
  {
    name: "Aeri de Montserrat: calendari de desembre del 2026",
    url: "https://aeridemontserrat.com/calendari/?lang=ca&Y=2026&m=12",
    publisher: "Aeri de Montserrat",
  },
  {
    name: "Aeri de Montserrat: característiques tècniques",
    url: "https://aeridemontserrat.com/caracteristiques-tecniques/",
    publisher: "Aeri de Montserrat",
  },
  {
    name: "Aeri de Montserrat: com arribar-hi",
    url: "https://aeridemontserrat.com/com-arribar-hi/",
    publisher: "Aeri de Montserrat",
  },
  {
    name: "Cremallera de Montserrat (English)",
    url: "https://www.cremallerademontserrat.cat/en/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Monistrol de Montserrat (tren): estació",
    url: "https://www.fgc.cat/xarxa-fgc/l-llobregat-anoia/monistrol-de-montserrat-tren/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Montserrat-Aeri: estació",
    url: "https://www.fgc.cat/xarxa-fgc/l-llobregat-anoia/montserrat-aeri/",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Montserrat: by road",
    url: "https://www.montserratvisita.com/en/how-to-get-there/by-road",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Montserrat: cable car",
    url: "https://www.montserratvisita.com/en/how-to-get-there/cable-car",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Montserrat: cremallera and train",
    url: "https://www.montserratvisita.com/en/how-to-get-there/cremallera-train",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Montserrat: opening hours",
    url: "https://www.montserratvisita.com/en/practical-information/opening-hours",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Montserrat: frequently asked questions",
    url: "https://www.montserratvisita.com/en/practical-information/faqs",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Trans Montserrat (cremallera, des de Pl. Espanya)",
    url: "https://vol.cremallerademontserrat.cat/trans-montserrat-cremallera-placa-espanya",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Tot Montserrat (cremallera, des de Pl. Espanya)",
    url: "https://vol.cremallerademontserrat.cat/tot-montserrat-cremallera-placa-espanya",
    publisher: "Ferrocarrils de la Generalitat de Catalunya",
  },
  {
    name: "Montserrat — entrada turística",
    url: "https://www.montserratvisita.com/en/entrada-turistica",
    publisher: "Abadia de Montserrat",
  },
  {
    name: "Museu de Montserrat — horaris i preus",
    url: "https://www.museudemontserrat.cat/en/visit/hours-and-admission",
    publisher: "Museu de Montserrat",
  },
];

// Re-checked on 24 Oct 2026 for the page-1 push (queries "cremallera de
// montserrat horarios", "montserrat rack railway", "aeri montserrat
// horaris", "trans montserrat"). R5 and cremallera times from FGC's GTFS
// (feed_version 2026-10-23) for 27 and 31 Oct, 8 Nov, 10 and 25 Dec 2026;
// Aeri hours from its 2026 day-by-day calendar; fares from Turistren (valid
// to 31 Dec 2026), the Aeri's 2026 fare table and FGC's ticket shop. The
// "about five kilometres" figure was dropped: no page read today states it.
// Every clock time sits inside a table (batch02.test.ts enforces it).
// 26 Oct 2026: cremallera re-read from FGC's GTFS (feed_version
// 2026-10-25T15:22:41+01:00, route MM) for 28 Oct, 2, 4 and 7 Nov, 8, 10,
// 25 and 28 Dec. Service 6350da927176 (weekdays 2 Nov–24 Dec except 7–8 Dec)
// ends an hour earlier: last up 17:48, last down 18:15, last from
// Monistrol-Vila 18:15. Weekends, 7–8 Dec and 28–31 Dec keep 18:48 / 19:15.
// 28 Oct 2026 (page-1 push, research_notes/page1-28oct/portaventura_montserrat.md):
// cremallera and R5 re-read from FGC's GTFS (feed_version 2026-10-27, ends
// 31 Dec 2026), unchanged; Aeri calendar re-read day by day: 1 Nov keeps the
// October hours and 7 Dec the holiday ones, so the table names both. Museum
// "10 EUR" is for "students, seniors and groups" with no age. No free
// cremallera exists; what is free (dogs, Aeri under-4s, Monistrol-Vila
// parking) is said instead. Weekday R50 trains skip Montserrat-Aeri (GTFS).
// 13 Nov 2026 (cable car vs rack railway vs car/coach upgrade,
// research_notes/evergreen-demand-nov2026.md item 9): FGC GTFS re-read
// (feed_version 2026-11-10, ends 31 Dec 2026) for 18 and 21 Nov, 10 and 25 Dec:
// every R5 and cremallera figure above unchanged. Aeri calendar re-read for
// November and December (unchanged; January 2027 not yet published). Turistren
// and Aeri fares unchanged (valid to 31 Dec 2026). Trans Montserrat 50 and Tot
// Montserrat 71.5 read from the FGC shop's "price". New: comparison and
// "by situation" tables; FGC places Monistrol de Montserrat and Montserrat-Aeri
// in "ZONA 4Z" (hence the 4-zone train + rack railway fare, €28.80 return);
// Aeri: 50 km and «35 minuts aproximadament en cotxe», 544 m drop, 1,350 m,
// «2, amb capacitat per a 32 persones cadascuna», no accessibility statement;
// cremallerademontserrat.cat: «Trains and rack railway are accessible for
// people with reduced mobility»; FGC Monistrol station lists «Ascensor»;
// Montserrat Visita: paid car park at the top «at rates laid down annually»,
// «Free parking» at the Aeri station, 900 free spaces at Monistrol-Vila, the
// sanctuary hours table, the Escolania (weekdays at 1 pm, breaks), the :15
// connection. Its Autocars Julià coach (9.15 am, €6.25) is named but its time
// and fare are not printed: the operator's site did not answer and the same
// Montserrat Visita pages carry stale FGC times ("08.26 am"). Montserrat
// Visita's "more than 600 metres" and "15 minutes" for the cremallera are not
// used (FGC's timetable gives 20 minutes from Monistrol de Montserrat).
const MONTSERRAT_VERIFIED = "2026-11-13";
/** Fares are valid to 31 Dec 2026 and the Aeri calendar ends then: re-read both before this date (a test fails after it). */
export const MONTSERRAT_REREAD_BY = "2027-01-01";

type MontT = {
  title: string; seoTitle: string; seoDescription: string; excerpt: string;
  lead: string;
  factsTitle: string; facts: { label: string; value: string }[];
  rackTitle: string; rack: string[];
  rackCaption: string; rackHeaders: string[]; rackRows: string[][]; rackNote: string;
  aeriTitle: string; aeri: string[];
  aeriCaption: string; aeriHeaders: string[]; aeriRows: string[][]; aeriNote: string;
  trainTitle: string; train: string[];
  trainCaption: string; trainHeaders: string[]; trainRows: string[][]; trainNote: string;
  chooseTitle: string; choose: string[];
  compareCaption: string; compareHeaders: string[]; compareRows: string[][]; compareNote: string;
  bestTitle: string; bestCaption: string; bestHeaders: string[]; bestRows: string[][];
  mixTitle: string; mix: string[];
  accessTitle: string; access: string[];
  hoursTitle: string; hoursCaption: string; hoursHeaders: string[]; hoursRows: string[][]; hoursNote: string;
  pricesTitle: string; pricesCaption: string; pricesHeaders: string[]; pricesRows: string[][]; pricesNote: string;
  combosTitle: string; combos: string[];
  beforeTitle: string; before: string;
  upTitle: string; upIntro: string; up: string[];
  beyond: string;
  faq: { question: string; answer: string }[];
};

const MONTSERRAT_COPY: Record<"ca" | "es" | "en", MontT> = {
  ca: {
    title: "Montserrat per lliure des de Barcelona: horaris del cremallera i l'Aeri 2026, preus i tren R5",
    seoTitle: "Cremallera i Aeri de Montserrat 2026: horaris i preus",
    seoDescription:
      "R5 des de Plaça Espanya i cremallera (cada hora, 15 € anada i tornada) o Aeri (cada 15 minuts, 15 €). Horaris de tardor i Trans Montserrat a 50 €.",
    excerpt:
      "Com anar a Montserrat pel teu compte: horaris del tren R5, del cremallera i de l'Aeri, preus del 2026 i bitllets combinats.",
    lead: "Per anar a Montserrat per lliure, agafa l'**R5 d'FGC a Plaça Espanya**: en **60 minuts** arriba a l'estació de l'**Aeri** i en **64** a **Monistrol de Montserrat**, on enllaça el **cremallera**, que surt **cada hora** i puja en 20 minuts. El cremallera costa **15 € anada i tornada** i l'Aeri, que surt **cada 15 minuts** i puja en 5, també **15 €**. El bitllet **Trans Montserrat** (50 €) ho inclou tot des de Barcelona.",
    factsTitle: "Montserrat sense excursió, en resum",
    facts: [
      { label: "Tren des de Barcelona", value: "R5 d'FGC des de Plaça Espanya: 60 min fins a l'Aeri, 64 fins a Monistrol de Montserrat" },
      { label: "Cremallera", value: "Cada hora des de Monistrol de Montserrat, 20 min; 9 € anada, 15 € anada i tornada" },
      { label: "Aeri (telefèric)", value: "Cada 15 min, 5 min de trajecte; 10 € anada, 15 € anada i tornada" },
      { label: "Tot inclòs", value: "Trans Montserrat 50 €: tren, cremallera o Aeri, funicular de Sant Joan i metro" },
      { label: "En cotxe", value: "Uns 50 km; aparcament gratuït a les estacions de l'Aeri i de Monistrol-Vila, de pagament a dalt" },
    ],
    rackTitle: "Horaris del cremallera de Montserrat",
    rack: [
      "El cremallera surt **cada hora** de l'estació de **Monistrol de Montserrat**, on para l'R5, i arriba al monestir en 20 minuts; des de **Monistrol-Vila**, a l'altra banda del poble, n'hi ha més i triga 13. L'R5 que surt de Plaça Espanya al minut :36 enllaça amb el cremallera del minut :48.",
      "De baixada, els trens que surten de Montserrat al quart d'hora enllacen a Monistrol amb l'R5 cap a Barcelona. Del 2 de novembre al 24 de desembre, els dies feiners l'últim tren puja i baixa una hora abans que els caps de setmana: mira la taula.",
      "Si hi vas en tren, baixa a **Monistrol de Montserrat**: l'R5 no para a Monistrol-Vila. **Monistrol-Vila** és l'estació del poble, amb aparcament gratuït per als usuaris del cremallera, per a qui hi arriba amb cotxe.",
    ],
    rackCaption: "Cremallera de Montserrat, del 26 d'octubre al 31 de desembre de 2026",
    rackHeaders: ["Trajecte", "Caps de setmana i festius (i fins al 30 d'octubre)", "Feiners del 2 de novembre al 24 de desembre", "Durada"],
    rackRows: [
      ["Monistrol de Montserrat (enllaç R5) → Montserrat", "Cada hora a :48, de 7:48 a 18:48", "Cada hora a :48, de 7:48 a 17:48", "20 min"],
      ["Montserrat → Monistrol de Montserrat", "Cada hora a :15, de 8:15 a 19:15", "Cada hora a :15, de 8:15 a 18:15", "20 min"],
      ["Monistrol-Vila → Montserrat", "Cada 20 min, de 8:35 a 19:15 (fins al 30 d'octubre, algunes hores cada 40 min)", "A :15 i :55, fins a les 18:15", "13 min"],
      ["25 de desembre", "Última pujada 13:48 (14:15 des de Monistrol-Vila)", "—", "—"],
    ],
    rackNote: "Dades obertes d'horaris d'FGC (versió del 27 d'octubre de 2026) per al 28 d'octubre, el 4 i el 7 de novembre i el 10, el 25 i el 28 de desembre. El 7 i el 8 de desembre i del 28 al 31 de desembre s'aplica l'horari de cap de setmana.",
    aeriTitle: "Horaris de l'Aeri de Montserrat",
    aeri: [
      "L'**Aeri** és el telefèric que puja des de la seva pròpia estació de l'R5 (Montserrat-Aeri) fins al monestir. Surt **cada 15 minuts** i el trajecte dura uns **5 minuts**. Els horaris canvien amb la temporada: a l'octubre tanca més tard, i al novembre i desembre tanca abans entre setmana.",
    ],
    aeriCaption: "Aeri de Montserrat, calendari 2026",
    aeriHeaders: ["Període", "Horari"],
    aeriRows: [
      ["Octubre i l'1 de novembre", "9:30–19:00"],
      ["Novembre i desembre, feiners (excepte el 7 de desembre)", "9:30–17:15"],
      ["Novembre i desembre, caps de setmana i festius, i el 7 de desembre", "9:30–18:15"],
      ["25 de desembre", "9:30–14:00"],
    ],
    aeriNote: "Calendari 2026 publicat per l'Aeri de Montserrat, consultat el 28 d'octubre de 2026.",
    trainTitle: "Tren R5 de Plaça Espanya a Montserrat",
    train: [
      "L'R5 d'FGC (direcció Manresa) surt de Plaça Espanya i para a **Montserrat-Aeri**, per a l'Aeri, i a **Monistrol de Montserrat**, per al cremallera. Els feiners hi ha uns 30 trens al dia i els caps de setmana un cada hora. La T-mobilitat no val per al cremallera ni els funiculars, que no formen part de la xarxa integrada.",
    ],
    trainCaption: "R5 entre Plaça Espanya i Montserrat",
    trainHeaders: ["Trajecte", "Dies", "Sortides", "Durada"],
    trainRows: [
      ["Plaça Espanya → Monistrol de Montserrat / Aeri", "Feiners", "De 5:16 a 22:30, un o dos per hora", "64 min (60 fins a l'Aeri)"],
      ["Plaça Espanya → Monistrol de Montserrat / Aeri", "Caps de setmana i festius", "Cada hora a :36, de 5:36 a 21:36, i a les 22:30", "64 min (60 fins a l'Aeri)"],
      ["Monistrol de Montserrat → Plaça Espanya", "Cada dia", "Cada hora a :41 (feiners també a :01 o :21), l'últim a les 22:41", "64 min"],
      ["Montserrat-Aeri → Plaça Espanya", "Cada dia", "Feiners, un o dos per hora; caps de setmana, cada hora a :45; l'últim a les 22:45", "60 min"],
    ],
    trainNote: "Dades obertes d'horaris d'FGC (versió del 27 d'octubre de 2026) per al 29 d'octubre i el 4 i el 7 de novembre de 2026. Alguns trens R50 dels dies feiners no paren a Montserrat-Aeri: si vas a l'Aeri, comprova que el teu tren hi pari.",
    chooseTitle: "Aeri, cremallera, cotxe o autocar: comparativa",
    choose: [
      "La pujada en cremallera és progressiva i deixa veure com canvia el paisatge; la de l'Aeri és una vista vertical de cop: la cabina salva 544 metres de desnivell en 1.350 metres de cable, amb pendents de fins al 45 %. Costen el mateix d'anada i tornada.",
      "La diferència pràctica és la freqüència: l'Aeri surt cada quart d'hora, mentre que el cremallera des de Monistrol de Montserrat surt un cop per hora, enllaçat amb l'R5. Si no vols esperar, l'Aeri és més flexible; si vols enllaçar sense pensar-hi amb el tren de tornada, el cremallera ja està sincronitzat amb l'R5.",
    ],
    compareCaption: "De Barcelona al monestir de Montserrat: les quatre opcions",
    compareHeaders: ["Opció", "Des de Barcelona", "Enllaç per pujar", "Temps total", "Bitllets combinats", "Preu adult (2026)"],
    compareRows: [
      ["Aeri (telefèric)", "R5 d'FGC des de Plaça Espanya fins a Montserrat-Aeri (60 min)", "Cabina cada 15 min, 5 min de trajecte; no va sincronitzada amb el tren", "De 65 a 80 min (60 de tren, fins a 15 d'espera i 5 de cabina)", "Trans Montserrat versió Aeri (50 €) o Tot Montserrat (71,50 €)", "Aeri 10 € anada, 15 € anada i tornada, més el tren (zona 4)"],
      ["Cremallera", "R5 d'FGC des de Plaça Espanya fins a Monistrol de Montserrat (64 min)", "Cada hora a :48, enllaçat amb l'R5 que arriba a :40; 20 min", "1 h 32 min (sortida de Plaça Espanya a :36, arribada a :08)", "Tren + cremallera anada i tornada, 4 zones (28,80 €); Trans Montserrat (50 €); Tot Montserrat (71,50 €)", "Cremallera 9 € anada, 15 € anada i tornada"],
      ["Cotxe", "Uns 50 km, uns 35 min fins a l'estació de l'Aeri", "Aparcament gratuït a l'estació de l'Aeri i a Monistrol-Vila (900 places, cremallera cada 20 min els caps de setmana); o pujar en cotxe fins a dalt", "35 min fins a baix, més l'Aeri o el cremallera", "—", "Aparcament de dalt de pagament (tarifa fixada cada any), amb places limitades"],
      ["Autocar", "Autocars Julià, des del carrer Viriat, al costat de l'estació de Sants", "Directe al monestir", "Consulta-ho a l'operador", "—", "Consulta-ho a l'operador"],
    ],
    compareNote: "Horaris i preus del tren i el cremallera: dades obertes d'FGC (versió del 10 de novembre de 2026) i Turistren (preus vàlids fins al 31 de desembre de 2026). Aeri: tarifes 2026 i calendari. Cotxe: Aeri de Montserrat i Montserrat Visita. Autocar: Montserrat Visita, que en dona horari i preu que no hem pogut confirmar amb l'operador. Consultat el 13 de novembre de 2026.",
    bestTitle: "Quin et convé, segons el cas",
    bestCaption: "La millor opció per pujar a Montserrat, segons la situació",
    bestHeaders: ["Si…", "Agafa", "Per què"],
    bestRows: [
      ["No vols esperar", "Aeri", "Surt cada 15 minuts; el cremallera des de Monistrol de Montserrat, un cop per hora"],
      ["No vols pensar en l'enllaç de tornada", "Cremallera", "Els trens que surten de Montserrat al quart d'hora enllacen amb l'R5 cap a Barcelona"],
      ["Vas amb cadira de rodes o cotxet", "Cremallera", "FGC indica que els trens i el cremallera són accessibles per a persones amb mobilitat reduïda; l'Aeri no publica informació d'accessibilitat"],
      ["Tens vertigen", "Cremallera", "L'Aeri és una cabina penjada que puja amb pendents de fins al 45 %"],
      ["Hi vas en cotxe", "Aparca a baix", "L'aparcament de dalt té places limitades i és de pagament; a l'estació de l'Aeri i a Monistrol-Vila és gratuït"],
      ["Vols el museu i dinar", "Tot Montserrat", "Per 71,50 € inclou el transport des de Barcelona, el funicular de Sant Joan, el museu i el bufet"],
      ["Vols pujar per una banda i baixar per l'altra", "Dos bitllets senzills", "10 € l'Aeri i 9 € el cremallera, 19 € en total, en lloc dels 15 € d'anada i tornada"],
    ],
    mixTitle: "Pujar en Aeri i baixar en cremallera",
    mix: [
      "Es pot fer, però els bitllets d'anada i tornada no són intercanviables: compra un bitllet senzill de cada un (19 € per adult). Els combinats Trans Montserrat i Tot Montserrat es venen en versió cremallera o en versió Aeri, i tries una de les dues quan el compres a Plaça Espanya.",
      "Recorda que l'R5 para en una estació diferent per a cada un: **Montserrat-Aeri** per a l'Aeri i **Monistrol de Montserrat** per al cremallera, quatre minuts més amunt de la línia.",
    ],
    accessTitle: "Accessibilitat, gossos i cotxets",
    access: [
      "FGC indica que els trens i el cremallera de Montserrat són accessibles per a persones amb mobilitat reduïda, i l'estació de Monistrol de Montserrat té ascensor. Les persones amb carnet de discapacitat tenen un 50 % de descompte al cremallera i als funiculars, amb les mateixes condicions per a l'acompanyant.",
      "L'Aeri no publica informació d'accessibilitat al seu web: té dues cabines de 32 places cadascuna. Si vas amb cadira de rodes, pregunta-ho abans al +34 93 835 0005 o tria el cremallera.",
      "Els gossos viatgen gratis tant a l'Aeri com al cremallera, lligats i amb morrió (al cremallera en venen a la taquilla per 5 € si no en portes).",
    ],
    hoursTitle: "Horaris a dalt: basílica, Mare de Déu i museu",
    hoursCaption: "Horaris del santuari de Montserrat",
    hoursHeaders: ["Lloc", "Horari"],
    hoursRows: [
      ["Basílica", "7:00–20:00"],
      ["Cambril de la Mare de Déu", "8:00–10:30 i 12:00–18:25"],
      ["Santa Cova (a peu; el funicular és tancat)", "Feiners 10:30–16:00; caps de setmana i festius 10:30–16:30"],
      ["Museu de Montserrat", "10:00–17:45"],
      ["Espai Audiovisual", "Feiners 9:00–17:45; caps de setmana i festius 9:00–18:45"],
      ["Escolania", "Canta de dilluns a divendres a les 13:00 (no després de Sant Joan fins a final d'agost, després de Nadal ni per Setmana Santa)"],
    ],
    hoursNote: "Horaris publicats per Montserrat Visita (Abadia de Montserrat), consultats el 13 de novembre de 2026. Poden variar per les celebracions religioses.",
    pricesTitle: "Preus del cremallera, l'Aeri i el funicular",
    pricesCaption: "Pujar a Montserrat: preus del 2026",
    pricesHeaders: ["Bitllet", "Adult", "Infant (4–13)", "Més de 65"],
    pricesRows: [
      ["Cremallera, anada / anada i tornada", "9 € / 15 €", "4,50 € / 7,50 €", "8,10 € / 13,50 €"],
      ["Aeri de Montserrat, anada / anada i tornada", "10 € / 15 €", "5,25 € / 7,50 € (menors de 4, gratis)", "8,75 € / 12,50 €"],
      ["Funicular de Sant Joan, anada / anada i tornada", "11,40 € / 17,50 €", "5,70 € / 8,75 €", "10,25 € / 15,75 €"],
      ["Trans Montserrat (des de Plaça Espanya)", "50 €", "—", "—"],
      ["Tot Montserrat (des de Plaça Espanya)", "71,50 €", "—", "—"],
      ["Museu de Montserrat", "12 €", "6 € (de 8 a 16 anys)", "10 € (sèniors i estudiants)"],
    ],
    pricesNote: "Cremallera i funicular: preus vàlids fins al 31 de desembre de 2026 (Turistren). Aeri: tarifes 2026. Combinats i museu: els seus webs, consultats el 28 d'octubre de 2026.",
    combosTitle: "Trans Montserrat i Tot Montserrat: què inclouen",
    combos: [
      "El **Trans Montserrat** (50 €) inclou el tren d'FGC d'anada i tornada des de Plaça Espanya, el **cremallera o l'Aeri** (hi ha una versió de cada), el funicular de Sant Joan, l'Espai Audiovisual, l'accés a la basílica i al cambril de la Mare de Déu segons aforament i un bitllet de metro de tornada. El **Tot Montserrat** (71,50 €) hi afegeix el Museu de Montserrat i el dinar de bufet. Cap dels dos inclou el cant de l'Escolania.",
      "Són bitllets sense data: valen per a qualsevol dia fins al pròxim canvi de tarifes i es poden cancel·lar gratis dins dels 15 dies posteriors a la compra; els funiculars s'han de fer servir el dia que arribes al monestir, i no es poden reservar: s'hi accedeix fent cua. Si els compres en línia, has de bescanviar el bitllet al Punt d'Acollida de l'estació de Plaça Espanya (de dilluns a diumenge, de 8 a 14 h) el mateix dia del viatge. Les persones amb targeta de discapacitat tenen un 50 % de descompte al cremallera i els funiculars, i les famílies nombroses i monoparentals, un 20 % o un 50 %.",
    ],
    beforeTitle: "Abans d'anar-hi",
    before: "El **funicular de la Santa Cova** està fora de servei per manteniment fins a nou avís (s'hi pot baixar a peu). Els turistes no residents paguen entrada per accedir al santuari (basílica i cambril); els residents a Catalunya, a la resta d'Espanya i a la UE en queden exempts, però han de reservar al web de l'Abadia per venerar la Mare de Déu.",
    upTitle: "Què fer a dalt",
    upIntro: "Una primera visita pot combinar:",
    up: [
      "el recinte del santuari;",
      "la basílica;",
      "l'entorn de la Moreneta, segons el tipus d'entrada;",
      "el museu, si t'interessa;",
      "el funicular de Sant Joan (el de la Santa Cova és tancat), segons el temps;",
      "una caminada curta si la meteorologia és adequada.",
    ],
    beyond: `Aquesta guia explica com pujar a Montserrat pel teu compte. Si el que busques és una altra escapada, menys concorreguda, tenim ${link("montserrat", "ca", "deu escapades des de Barcelona que no són Montserrat")}.`,
    faq: [
      { question: "Quins horaris té el cremallera de Montserrat?", answer: "Surt cada hora de Monistrol de Montserrat, enllaçat amb l'R5. Del 2 de novembre al 24 de desembre, els dies feiners l'últim tren puja i baixa una hora abans que els caps de setmana; la taula d'aquesta pàgina té les hores." },
      { question: "Quant costa el cremallera de Montserrat?", answer: "9 € l'anada i 15 € l'anada i tornada per a adults; 4,50 € i 7,50 € per als infants de 4 a 13 anys. Preus vàlids fins al 31 de desembre de 2026." },
      { question: "Quins horaris té l'Aeri de Montserrat?", answer: "Surt cada 15 minuts. Al novembre i el desembre obre al matí i tanca a primera hora del vespre entre setmana i una hora més tard els caps de setmana i festius; la taula té les hores exactes." },
      { question: "Què és millor, el cremallera o l'Aeri?", answer: "Costen el mateix (15 € anada i tornada). L'Aeri surt cada 15 minuts i puja en 5; el cremallera surt cada hora des de Monistrol de Montserrat i puja en 20, amb una pujada més suau." },
      { question: "Com s'hi va de Barcelona a Montserrat en tren?", answer: "Amb l'R5 d'FGC des de Plaça Espanya: 60 minuts fins a l'estació de l'Aeri o 64 fins a Monistrol de Montserrat, on es canvia al cremallera." },
      { question: "Què inclou el Trans Montserrat?", answer: "Per 50 €: tren d'FGC des de Plaça Espanya, cremallera o Aeri, funicular de Sant Joan, Espai Audiovisual, accés a la basílica i metro de tornada." },
      { question: "El cremallera de Montserrat és gratis per a algú?", answer: "No hi ha bitllet gratuït ni cap promoció vigent: paguen tots els viatgers a partir de 4 anys. Els gossos hi viatgen gratis, lligats i amb morrió, i l'aparcament de Monistrol-Vila és gratuït per als usuaris del cremallera. A l'Aeri, els menors de 4 anys no paguen. La T-mobilitat no hi és vàlida." },
      { question: "A quina estació he de baixar per agafar el cremallera?", answer: "A Monistrol de Montserrat, on para l'R5. Monistrol-Vila és l'altra estació del cremallera, al poble, amb aparcament gratuït per a qui hi va amb cotxe." },
      { question: "Puc pujar en Aeri i baixar en cremallera?", answer: "Sí, però els bitllets d'anada i tornada no són intercanviables: compra un senzill de cada un, 10 € l'Aeri i 9 € el cremallera. Els combinats Trans Montserrat i Tot Montserrat inclouen només un dels dos, que tries en comprar-los." },
      { question: "Quant es triga de Barcelona a Montserrat?", answer: "Amb el cremallera, una hora i mitja: 64 minuts d'R5 fins a Monistrol de Montserrat, l'enllaç i 20 minuts de pujada. Amb l'Aeri, una hora de tren més l'espera (com a màxim un quart d'hora) i 5 minuts de cabina." },
      { question: "L'Aeri de Montserrat és accessible amb cadira de rodes?", answer: "L'Aeri no en publica informació: pregunta-ho abans per telèfon. FGC sí que indica que els trens i el cremallera són accessibles per a persones amb mobilitat reduïda." },
      { question: "Es pot anar a Montserrat en cotxe?", answer: "Sí. Són uns 50 km des de Barcelona. Pots aparcar gratis a l'estació de l'Aeri o a Monistrol-Vila i pujar en Aeri o en cremallera, o pujar fins al monestir, on l'aparcament és de pagament i té places limitades." },
      { question: "Hi ha autobús de Barcelona a Montserrat?", answer: "Montserrat Visita, el web de l'Abadia, indica un autocar d'Autocars Julià que surt del carrer Viriat, al costat de l'estació de Sants. No n'hem pogut confirmar l'horari ni el preu amb l'operador: consulta-ho abans d'anar-hi." },
    ],
  },
  es: {
    title: "Montserrat por libre desde Barcelona: horarios del cremallera y el teleférico, precios y tren R5 de FGC",
    seoTitle: "Cremallera y teleférico de Montserrat: horarios y precios",
    seoDescription:
      "R5 desde Plaça Espanya y cremallera (cada hora, 15 € ida y vuelta) o Aeri (cada 15 minutos, 15 €). Horarios de otoño y Trans Montserrat a 50 €.",
    excerpt:
      "Cómo ir a Montserrat por tu cuenta: horarios del tren R5, del cremallera y del Aeri, precios de 2026 y billetes combinados.",
    lead: "Para ir a Montserrat por libre, coge la **R5 de FGC en Plaça Espanya**: en **60 minutos** llega a la estación del **Aeri** y en **64** a **Monistrol de Montserrat**, donde enlaza el **cremallera**, que sale **cada hora** y sube en 20 minutos. El cremallera cuesta **15 € ida y vuelta** y el Aeri, el teleférico, que sale **cada 15 minutos** y sube en 5, también **15 €**. El billete **Trans Montserrat** (50 €) lo incluye todo desde Barcelona.",
    factsTitle: "Montserrat sin excursión, en resumen",
    facts: [
      { label: "Tren desde Barcelona", value: "R5 de FGC desde Plaça Espanya: 60 min hasta el Aeri, 64 hasta Monistrol de Montserrat" },
      { label: "Cremallera", value: "Cada hora desde Monistrol de Montserrat, 20 min; 9 € ida, 15 € ida y vuelta" },
      { label: "Aeri (teleférico)", value: "Cada 15 min, 5 min de trayecto; 10 € ida, 15 € ida y vuelta" },
      { label: "Todo incluido", value: "Trans Montserrat 50 €: tren, cremallera o Aeri, funicular de Sant Joan y metro" },
      { label: "En coche", value: "Unos 50 km; aparcamiento gratuito en las estaciones del Aeri y de Monistrol-Vila, de pago arriba" },
    ],
    rackTitle: "Horarios del cremallera de Montserrat",
    rack: [
      "El cremallera sale **cada hora** de la estación de **Monistrol de Montserrat**, donde para la R5, y llega al monasterio en 20 minutos; desde **Monistrol-Vila**, al otro lado del pueblo, hay más y tarda 13. La R5 que sale de Plaça Espanya en el minuto :36 enlaza con el cremallera del minuto :48.",
      "De bajada, los trenes que salen de Montserrat y cuarto enlazan en Monistrol con la R5 hacia Barcelona. Del 2 de noviembre al 24 de diciembre, los laborables el último tren sube y baja una hora antes que los fines de semana: mira la tabla.",
      "Si vas en tren, bájate en **Monistrol de Montserrat**: la R5 no para en Monistrol-Vila. **Monistrol-Vila** es la estación del pueblo, con aparcamiento gratuito para los usuarios del cremallera, para quien llega en coche.",
    ],
    rackCaption: "Cremallera de Montserrat, del 26 de octubre al 31 de diciembre de 2026",
    rackHeaders: ["Trayecto", "Fines de semana y festivos (y hasta el 30 de octubre)", "Laborables del 2 de noviembre al 24 de diciembre", "Duración"],
    rackRows: [
      ["Monistrol de Montserrat (enlace R5) → Montserrat", "Cada hora a :48, de 7:48 a 18:48", "Cada hora a :48, de 7:48 a 17:48", "20 min"],
      ["Montserrat → Monistrol de Montserrat", "Cada hora a :15, de 8:15 a 19:15", "Cada hora a :15, de 8:15 a 18:15", "20 min"],
      ["Monistrol-Vila → Montserrat", "Cada 20 min, de 8:35 a 19:15 (hasta el 30 de octubre, algunas horas cada 40 min)", "A :15 y :55, hasta las 18:15", "13 min"],
      ["25 de diciembre", "Última subida 13:48 (14:15 desde Monistrol-Vila)", "—", "—"],
    ],
    rackNote: "Datos abiertos de horarios de FGC (versión del 27 de octubre de 2026) para el 28 de octubre, el 4 y el 7 de noviembre y el 10, el 25 y el 28 de diciembre. El 7 y el 8 de diciembre y del 28 al 31 de diciembre rige el horario de fin de semana.",
    aeriTitle: "Horarios del teleférico de Montserrat (Aeri)",
    aeri: [
      "El **Aeri** es el teleférico que sube desde su propia estación de la R5 (Montserrat-Aeri) hasta el monasterio. Sale **cada 15 minutos** y el trayecto dura unos **5 minutos**. Los horarios cambian con la temporada: en octubre cierra más tarde, y en noviembre y diciembre cierra antes entre semana.",
    ],
    aeriCaption: "Aeri de Montserrat, calendario 2026",
    aeriHeaders: ["Periodo", "Horario"],
    aeriRows: [
      ["Octubre y el 1 de noviembre", "9:30–19:00"],
      ["Noviembre y diciembre, laborables (salvo el 7 de diciembre)", "9:30–17:15"],
      ["Noviembre y diciembre, fines de semana y festivos, y el 7 de diciembre", "9:30–18:15"],
      ["25 de diciembre", "9:30–14:00"],
    ],
    aeriNote: "Calendario 2026 publicado por el Aeri de Montserrat, consultado el 28 de octubre de 2026.",
    trainTitle: "Tren R5 de Plaça Espanya a Montserrat",
    train: [
      "La R5 de FGC (dirección Manresa) sale de Plaça Espanya y para en **Montserrat-Aeri**, para el Aeri, y en **Monistrol de Montserrat**, para el cremallera. Los laborables hay unos 30 trenes al día y los fines de semana uno cada hora. La T-mobilitat no vale para el cremallera ni los funiculares, que no forman parte de la red integrada.",
    ],
    trainCaption: "R5 entre Plaça Espanya y Montserrat",
    trainHeaders: ["Trayecto", "Días", "Salidas", "Duración"],
    trainRows: [
      ["Plaça Espanya → Monistrol de Montserrat / Aeri", "Laborables", "De 5:16 a 22:30, uno o dos por hora", "64 min (60 hasta el Aeri)"],
      ["Plaça Espanya → Monistrol de Montserrat / Aeri", "Fines de semana y festivos", "Cada hora a :36, de 5:36 a 21:36, y a las 22:30", "64 min (60 hasta el Aeri)"],
      ["Monistrol de Montserrat → Plaça Espanya", "Todos los días", "Cada hora a :41 (laborables también a :01 o :21), el último a las 22:41", "64 min"],
      ["Montserrat-Aeri → Plaça Espanya", "Todos los días", "Laborables, uno o dos por hora; fines de semana, cada hora a :45; el último a las 22:45", "60 min"],
    ],
    trainNote: "Datos abiertos de horarios de FGC (versión del 27 de octubre de 2026) para el 29 de octubre y el 4 y el 7 de noviembre de 2026. Algunos trenes R50 de los laborables no paran en Montserrat-Aeri: si vas al teleférico, comprueba que tu tren pare allí.",
    chooseTitle: "Teleférico, cremallera, coche o autocar: comparativa",
    choose: [
      "La subida en cremallera es progresiva y permite ver cómo cambia el paisaje; la del Aeri es una vista vertical de golpe: la cabina salva 544 metros de desnivel en 1.350 metros de cable, con pendientes de hasta el 45 %. Cuestan lo mismo ida y vuelta.",
      "La diferencia práctica es la frecuencia: el Aeri sale cada cuarto de hora, mientras que el cremallera desde Monistrol de Montserrat sale una vez por hora, enlazado con la R5. Si no quieres esperar, el Aeri es más flexible; si prefieres enlazar sin pensarlo con el tren de vuelta, el cremallera ya está sincronizado con la R5.",
    ],
    compareCaption: "De Barcelona al monasterio de Montserrat: las cuatro opciones",
    compareHeaders: ["Opción", "Desde Barcelona", "Enlace para subir", "Tiempo total", "Billetes combinados", "Precio adulto (2026)"],
    compareRows: [
      ["Aeri (teleférico)", "R5 de FGC desde Plaça Espanya hasta Montserrat-Aeri (60 min)", "Cabina cada 15 min, 5 min de trayecto; no va sincronizada con el tren", "De 65 a 80 min (60 de tren, hasta 15 de espera y 5 de cabina)", "Trans Montserrat versión Aeri (50 €) o Tot Montserrat (71,50 €)", "Aeri 10 € ida, 15 € ida y vuelta, más el tren (zona 4)"],
      ["Cremallera", "R5 de FGC desde Plaça Espanya hasta Monistrol de Montserrat (64 min)", "Cada hora a :48, enlazado con la R5 que llega a :40; 20 min", "1 h 32 min (salida de Plaça Espanya a :36, llegada a :08)", "Tren + cremallera ida y vuelta, 4 zonas (28,80 €); Trans Montserrat (50 €); Tot Montserrat (71,50 €)", "Cremallera 9 € ida, 15 € ida y vuelta"],
      ["Coche", "Unos 50 km, unos 35 min hasta la estación del Aeri", "Aparcamiento gratuito en la estación del Aeri y en Monistrol-Vila (900 plazas, cremallera cada 20 min los fines de semana); o subir en coche hasta arriba", "35 min hasta abajo, más el Aeri o el cremallera", "—", "Aparcamiento de arriba de pago (tarifa fijada cada año), con plazas limitadas"],
      ["Autocar", "Autocares Julià, desde la calle Viriat, junto a la estación de Sants", "Directo al monasterio", "Consúltalo con el operador", "—", "Consúltalo con el operador"],
    ],
    compareNote: "Horarios y precios del tren y el cremallera: datos abiertos de FGC (versión del 10 de noviembre de 2026) y Turistren (precios válidos hasta el 31 de diciembre de 2026). Aeri: tarifas 2026 y calendario. Coche: Aeri de Montserrat y Montserrat Visita. Autocar: Montserrat Visita, que da un horario y un precio que no hemos podido confirmar con el operador. Consultado el 13 de noviembre de 2026.",
    bestTitle: "Cuál te conviene, según el caso",
    bestCaption: "La mejor opción para subir a Montserrat, según la situación",
    bestHeaders: ["Si…", "Coge", "Por qué"],
    bestRows: [
      ["No quieres esperar", "Aeri", "Sale cada 15 minutos; el cremallera desde Monistrol de Montserrat, una vez por hora"],
      ["No quieres pensar en el enlace de vuelta", "Cremallera", "Los trenes que salen de Montserrat y cuarto enlazan con la R5 hacia Barcelona"],
      ["Vas con silla de ruedas o carrito", "Cremallera", "FGC indica que los trenes y el cremallera son accesibles para personas con movilidad reducida; el Aeri no publica información de accesibilidad"],
      ["Tienes vértigo", "Cremallera", "El Aeri es una cabina colgada que sube con pendientes de hasta el 45 %"],
      ["Vas en coche", "Aparca abajo", "El aparcamiento de arriba tiene plazas limitadas y es de pago; en la estación del Aeri y en Monistrol-Vila es gratuito"],
      ["Quieres el museo y comer", "Tot Montserrat", "Por 71,50 € incluye el transporte desde Barcelona, el funicular de Sant Joan, el museo y el bufé"],
      ["Quieres subir por un lado y bajar por el otro", "Dos billetes sencillos", "10 € el Aeri y 9 € el cremallera, 19 € en total, en lugar de los 15 € de ida y vuelta"],
    ],
    mixTitle: "Subir en teleférico y bajar en cremallera",
    mix: [
      "Se puede, pero los billetes de ida y vuelta no son intercambiables: compra un billete sencillo de cada uno (19 € por adulto). Los combinados Trans Montserrat y Tot Montserrat se venden en versión cremallera o en versión Aeri, y eliges una de las dos al comprarlo en Plaça Espanya.",
      "Recuerda que la R5 para en una estación distinta para cada uno: **Montserrat-Aeri** para el teleférico y **Monistrol de Montserrat** para el cremallera, cuatro minutos más arriba en la línea.",
    ],
    accessTitle: "Accesibilidad, perros y carritos",
    access: [
      "FGC indica que los trenes y el cremallera de Montserrat son accesibles para personas con movilidad reducida, y la estación de Monistrol de Montserrat tiene ascensor. Las personas con tarjeta de discapacidad tienen un 50 % de descuento en el cremallera y los funiculares, con las mismas condiciones para el acompañante.",
      "El Aeri no publica información de accesibilidad en su web: tiene dos cabinas de 32 plazas cada una. Si vas en silla de ruedas, pregúntalo antes en el +34 93 835 0005 o elige el cremallera.",
      "Los perros viajan gratis tanto en el Aeri como en el cremallera, atados y con bozal (en el cremallera venden uno en la taquilla por 5 € si no lo llevas).",
    ],
    hoursTitle: "Horarios arriba: basílica, Virgen y museo",
    hoursCaption: "Horarios del santuario de Montserrat",
    hoursHeaders: ["Lugar", "Horario"],
    hoursRows: [
      ["Basílica", "7:00–20:00"],
      ["Camarín de la Virgen", "8:00–10:30 y 12:00–18:25"],
      ["Santa Cova (a pie; el funicular está cerrado)", "Laborables 10:30–16:00; fines de semana y festivos 10:30–16:30"],
      ["Museu de Montserrat", "10:00–17:45"],
      ["Espai Audiovisual", "Laborables 9:00–17:45; fines de semana y festivos 9:00–18:45"],
      ["Escolania", "Canta de lunes a viernes a las 13:00 (no después de Sant Joan hasta finales de agosto, después de Navidad ni en Semana Santa)"],
    ],
    hoursNote: "Horarios publicados por Montserrat Visita (Abadía de Montserrat), consultados el 13 de noviembre de 2026. Pueden variar por las celebraciones religiosas.",
    pricesTitle: "Precios del cremallera, el teleférico y el funicular",
    pricesCaption: "Subir a Montserrat: precios de 2026",
    pricesHeaders: ["Billete", "Adulto", "Niño (4–13)", "Mayores de 65"],
    pricesRows: [
      ["Cremallera, ida / ida y vuelta", "9 € / 15 €", "4,50 € / 7,50 €", "8,10 € / 13,50 €"],
      ["Aeri de Montserrat, ida / ida y vuelta", "10 € / 15 €", "5,25 € / 7,50 € (menores de 4, gratis)", "8,75 € / 12,50 €"],
      ["Funicular de Sant Joan, ida / ida y vuelta", "11,40 € / 17,50 €", "5,70 € / 8,75 €", "10,25 € / 15,75 €"],
      ["Trans Montserrat (desde Plaça Espanya)", "50 €", "—", "—"],
      ["Tot Montserrat (desde Plaça Espanya)", "71,50 €", "—", "—"],
      ["Museu de Montserrat", "12 €", "6 € (de 8 a 16 años)", "10 € (sénior y estudiantes)"],
    ],
    pricesNote: "Cremallera y funicular: precios válidos hasta el 31 de diciembre de 2026 (Turistren). Aeri: tarifas 2026. Combinados y museo: sus webs, consultadas el 28 de octubre de 2026.",
    combosTitle: "Trans Montserrat y Tot Montserrat: qué incluyen",
    combos: [
      "El **Trans Montserrat** (50 €) incluye el tren de FGC de ida y vuelta desde Plaça Espanya, el **cremallera o el Aeri** (hay una versión de cada), el funicular de Sant Joan, el Espai Audiovisual, el acceso a la basílica y al camarín de la Virgen según aforo y un billete de metro de vuelta. El **Tot Montserrat** (71,50 €) añade el Museu de Montserrat y la comida de bufé. Ninguno de los dos incluye el canto de la Escolania.",
      "Son billetes sin fecha: valen para cualquier día hasta el próximo cambio de tarifas y se pueden cancelar gratis en los 15 días siguientes a la compra; los funiculares hay que usarlos el día que llegas al monasterio, y no se pueden reservar: se accede haciendo cola. Si los compras en línea, hay que canjear el billete en el Punt d'Acollida de la estación de Plaça Espanya (de lunes a domingo, de 8 a 14 h) el mismo día del viaje. Las personas con tarjeta de discapacidad tienen un 50 % de descuento en el cremallera y los funiculares, y las familias numerosas y monoparentales, un 20 % o un 50 %.",
    ],
    beforeTitle: "Antes de ir",
    before: "El **funicular de la Santa Cova** está fuera de servicio por mantenimiento hasta nuevo aviso (se puede bajar a pie). Los turistas no residentes pagan entrada para acceder al santuario (basílica y camarín); los residentes en Cataluña, el resto de España y la UE están exentos, pero deben reservar en la web de la Abadía para venerar a la Virgen.",
    upTitle: "Qué hacer arriba",
    upIntro: "Una primera visita puede combinar:",
    up: [
      "el recinto del santuario;",
      "la basílica;",
      "el entorno de la Moreneta, según el tipo de entrada;",
      "el museo, si te interesa;",
      "el funicular de Sant Joan (el de la Santa Cova está cerrado), según el tiempo;",
      "un paseo corto si la meteorología acompaña.",
    ],
    beyond: `Esta guía explica cómo subir a Montserrat por tu cuenta. Si lo que buscas es otra escapada, menos concurrida, tenemos ${link("montserrat", "es", "diez escapadas desde Barcelona que no son Montserrat")}.`,
    faq: [
      { question: "¿Qué horarios tiene el cremallera de Montserrat?", answer: "Sale cada hora de Monistrol de Montserrat, enlazado con la R5. Del 2 de noviembre al 24 de diciembre, los laborables el último tren sube y baja una hora antes que los fines de semana; la tabla de esta página tiene las horas." },
      { question: "¿Cuánto cuesta el cremallera de Montserrat?", answer: "9 € la ida y 15 € la ida y vuelta para adultos; 4,50 € y 7,50 € para niños de 4 a 13 años. Precios válidos hasta el 31 de diciembre de 2026." },
      { question: "¿Cuánto cuesta el teleférico de Montserrat?", answer: "El Aeri cuesta 10 € la ida y 15 € la ida y vuelta para adultos; los niños de 4 a 13 años pagan 5,25 € y 7,50 €, y los menores de 4 no pagan." },
      { question: "¿Qué es mejor, el cremallera o el teleférico?", answer: "Cuestan lo mismo (15 € ida y vuelta). El Aeri sale cada 15 minutos y sube en 5; el cremallera sale cada hora desde Monistrol de Montserrat y sube en 20, con una subida más suave." },
      { question: "¿Cómo llegar a Montserrat en tren desde Barcelona?", answer: "Con la R5 de FGC desde Plaça Espanya: 60 minutos hasta la estación del Aeri o 64 hasta Monistrol de Montserrat, donde se cambia al cremallera." },
      { question: "¿Qué incluye el Trans Montserrat?", answer: "Por 50 €: tren de FGC desde Plaça Espanya, cremallera o Aeri, funicular de Sant Joan, Espai Audiovisual, acceso a la basílica y metro de vuelta." },
      { question: "¿Es gratis el cremallera de Montserrat para alguien?", answer: "No hay billete gratuito ni ninguna promoción vigente: pagan todos los viajeros desde los 4 años. Los perros viajan gratis, atados y con bozal, y el aparcamiento de Monistrol-Vila es gratuito para los usuarios del cremallera. En el teleférico (Aeri), los menores de 4 años no pagan. La T-mobilitat no es válida." },
      { question: "¿En qué estación hay que bajar para coger el cremallera?", answer: "En Monistrol de Montserrat, donde para la R5. Monistrol-Vila es la otra estación del cremallera, en el pueblo, con aparcamiento gratuito para quien va en coche." },
      { question: "¿Puedo subir en teleférico y bajar en cremallera?", answer: "Sí, pero los billetes de ida y vuelta no son intercambiables: compra un sencillo de cada uno, 10 € el Aeri y 9 € el cremallera. Los combinados Trans Montserrat y Tot Montserrat incluyen solo uno de los dos, que eliges al comprarlos." },
      { question: "¿Cuánto se tarda de Barcelona a Montserrat?", answer: "Con el cremallera, hora y media: 64 minutos de R5 hasta Monistrol de Montserrat, el enlace y 20 minutos de subida. Con el teleférico, una hora de tren más la espera (como mucho un cuarto de hora) y 5 minutos de cabina." },
      { question: "¿El teleférico de Montserrat es accesible en silla de ruedas?", answer: "El Aeri no publica información al respecto: pregúntalo antes por teléfono. FGC sí indica que los trenes y el cremallera son accesibles para personas con movilidad reducida." },
      { question: "¿Se puede ir a Montserrat en coche?", answer: "Sí. Son unos 50 km desde Barcelona. Puedes aparcar gratis en la estación del Aeri o en Monistrol-Vila y subir en teleférico o en cremallera, o subir hasta el monasterio, donde el aparcamiento es de pago y tiene plazas limitadas." },
      { question: "¿Hay autobús de Barcelona a Montserrat?", answer: "Montserrat Visita, la web de la Abadía, indica un autocar de Autocares Julià que sale de la calle Viriat, junto a la estación de Sants. No hemos podido confirmar su horario ni su precio con el operador: consúltalo antes de ir." },
    ],
  },
  en: {
    title: "Montserrat without a tour: rack railway and cable car times, fares and the R5 train",
    seoTitle: "Montserrat cable car or rack railway: 2026 times and fares",
    seoDescription:
      "The R5 from Plaça Espanya, then the rack railway (hourly, €15 return) or the Aeri cable car (every 15 min, €15). Autumn times; Trans Montserrat €50.",
    excerpt:
      "How to reach Montserrat on your own: R5 train, rack railway and cable car timetables, 2026 fares and the combined tickets.",
    lead: "To visit Montserrat without a tour, take FGC's **R5 from Plaça Espanya**: it reaches the **Aeri cable car** station in **60 minutes** and **Monistrol de Montserrat** in **64**, where the **rack railway** leaves **every hour** and climbs in 20 minutes. The rack railway costs **€15 return**, and the cable car, which runs **every 15 minutes** and takes 5, also **€15**. The **Trans Montserrat** ticket (€50) covers everything from Barcelona.",
    factsTitle: "Montserrat without a tour at a glance",
    facts: [
      { label: "Train from Barcelona", value: "FGC R5 from Plaça Espanya: 60 min to the Aeri, 64 to Monistrol de Montserrat" },
      { label: "Rack railway (Cremallera)", value: "Hourly from Monistrol de Montserrat, 20 min; €9 single, €15 return" },
      { label: "Cable car (Aeri)", value: "Every 15 min, 5-minute ride; €10 single, €15 return" },
      { label: "All-in ticket", value: "Trans Montserrat €50: train, rack railway or cable car, Sant Joan funicular and metro" },
      { label: "By car", value: "About 50 km; free parking at the Aeri and Monistrol-Vila stations, paid at the top" },
    ],
    rackTitle: "Montserrat rack railway timetable",
    rack: [
      "The rack railway leaves **every hour** from **Monistrol de Montserrat** station, where the R5 stops, and reaches the monastery in 20 minutes; from **Monistrol-Vila**, across the village, trains are more frequent and take 13. The R5 leaving Plaça Espanya at :36 past the hour connects with the rack railway at :48.",
      "Coming down, the trains leaving Montserrat at a quarter past connect at Monistrol with the R5 to Barcelona. From 2 November to 24 December, on weekdays the last trains up and down run an hour earlier than at weekends: see the table.",
      "Coming by train, get off at **Monistrol de Montserrat**: the R5 does not stop at Monistrol-Vila. **Monistrol-Vila** is the village station, with free parking for rack-railway passengers, for those arriving by car.",
    ],
    rackCaption: "Montserrat rack railway, 26 October to 31 December 2026",
    rackHeaders: ["Route", "Weekends and holidays (and until 30 October)", "Weekdays, 2 November to 24 December", "Journey"],
    rackRows: [
      ["Monistrol de Montserrat (R5 connection) → Montserrat", "Hourly at :48, 7:48 to 18:48", "Hourly at :48, 7:48 to 17:48", "20 min"],
      ["Montserrat → Monistrol de Montserrat", "Hourly at :15, 8:15 to 19:15", "Hourly at :15, 8:15 to 18:15", "20 min"],
      ["Monistrol-Vila → Montserrat", "Every 20 min, 8:35 to 19:15 (until 30 October, some hours every 40 min)", "At :15 and :55, until 18:15", "13 min"],
      ["25 December", "Last train up 13:48 (14:15 from Monistrol-Vila)", "—", "—"],
    ],
    rackNote: "FGC's open timetable data (version of 27 October 2026) for 28 October, 4 and 7 November and 10, 25 and 28 December. On 7 and 8 December and from 28 to 31 December the weekend timetable applies.",
    aeriTitle: "Montserrat cable car (Aeri) opening times",
    aeri: [
      "The **Aeri** is the cable car that climbs from its own R5 station (Montserrat-Aeri) to the monastery. It runs **every 15 minutes** and the ride takes about **5 minutes**. Hours change with the season: in October it stays open later, and in November and December it closes earlier on weekdays.",
    ],
    aeriCaption: "Aeri de Montserrat, 2026 calendar",
    aeriHeaders: ["Period", "Hours"],
    aeriRows: [
      ["October and 1 November", "9:30–19:00"],
      ["November and December, weekdays (except 7 December)", "9:30–17:15"],
      ["November and December, weekends and holidays, and 7 December", "9:30–18:15"],
      ["25 December", "9:30–14:00"],
    ],
    aeriNote: "2026 calendar published by the Aeri de Montserrat, checked on 28 October 2026.",
    trainTitle: "R5 train from Plaça Espanya to Montserrat",
    train: [
      "FGC's R5 (towards Manresa) leaves from Plaça Espanya and stops at **Montserrat-Aeri**, for the cable car, and at **Monistrol de Montserrat**, for the rack railway. On weekdays there are about 30 trains a day; at weekends one an hour. The T-mobilitat card is not valid on the rack railway or the funiculars, which are outside the integrated fare network.",
    ],
    trainCaption: "R5 between Plaça Espanya and Montserrat",
    trainHeaders: ["Route", "Days", "Departures", "Journey"],
    trainRows: [
      ["Plaça Espanya → Monistrol de Montserrat / Aeri", "Weekdays", "5:16 to 22:30, one or two an hour", "64 min (60 to the Aeri)"],
      ["Plaça Espanya → Monistrol de Montserrat / Aeri", "Weekends and holidays", "Hourly at :36, 5:36 to 21:36, and at 22:30", "64 min (60 to the Aeri)"],
      ["Monistrol de Montserrat → Plaça Espanya", "Every day", "Hourly at :41 (weekdays also at :01 or :21), last at 22:41", "64 min"],
      ["Montserrat-Aeri → Plaça Espanya", "Every day", "Weekdays one or two an hour; weekends hourly at :45; last at 22:45", "60 min"],
    ],
    trainNote: "FGC's open timetable data (version of 27 October 2026) for 29 October and 4 and 7 November 2026. Some weekday R50 trains do not stop at Montserrat-Aeri: if you are going to the cable car, check that yours does.",
    chooseTitle: "Cable car vs rack railway vs car or coach",
    choose: [
      "The rack railway climbs gradually and lets you watch the landscape change; the cable car gives you the vertical view all at once: the cabin climbs 544 metres on 1,350 metres of cable, on gradients of up to 45%. Returns cost the same on both.",
      "The practical difference is frequency: the cable car leaves every quarter of an hour, while the rack railway from Monistrol de Montserrat runs once an hour, timed to the R5. If you do not want to wait, the cable car is more flexible; if you want the connection with the train back taken care of, the rack railway is already timed to the R5.",
    ],
    compareCaption: "Barcelona to Montserrat monastery: the four ways",
    compareHeaders: ["Option", "From Barcelona", "Connection up", "Total time", "Combined tickets", "Adult fare (2026)"],
    compareRows: [
      ["Cable car (Aeri)", "FGC R5 from Plaça Espanya to Montserrat-Aeri (60 min)", "A cabin every 15 min, 5-minute ride; not timed to the train", "65 to 80 min (60 on the train, up to 15 waiting, 5 in the cabin)", "Trans Montserrat, cable-car version (€50), or Tot Montserrat (€71.50)", "Aeri €10 single, €15 return, plus the train (zone 4)"],
      ["Rack railway (Cremallera)", "FGC R5 from Plaça Espanya to Monistrol de Montserrat (64 min)", "Hourly at :48, timed to the R5 arriving at :40; 20 min", "1 h 32 min (leave Plaça Espanya at :36, arrive at :08)", "Train + rack railway return, 4 zones (€28.80); Trans Montserrat (€50); Tot Montserrat (€71.50)", "Rack railway €9 single, €15 return"],
      ["Car", "About 50 km, about 35 min to the cable-car station", "Free parking at the Aeri station and at Monistrol-Vila (900 spaces, rack railway every 20 min at weekends); or drive up to the top", "35 min to the bottom, plus the cable car or rack railway", "—", "Paid car park at the top (rate set each year), with limited spaces"],
      ["Coach", "Autocars Julià, from carrer Viriat beside Sants station", "Straight to the monastery", "Check with the operator", "—", "Check with the operator"],
    ],
    compareNote: "Train and rack railway times and fares: FGC open timetable data (version of 10 November 2026) and Turistren (fares valid until 31 December 2026). Cable car: 2026 fares and calendar. Car: Aeri de Montserrat and Montserrat Visita. Coach: Montserrat Visita, which gives a time and fare we could not confirm with the operator. Checked on 13 November 2026.",
    bestTitle: "Which to choose, by situation",
    bestCaption: "The best way up Montserrat for your situation",
    bestHeaders: ["If…", "Take", "Why"],
    bestRows: [
      ["You do not want to wait", "Cable car", "It leaves every 15 minutes; the rack railway from Monistrol de Montserrat, once an hour"],
      ["You want the connection back taken care of", "Rack railway", "The trains leaving Montserrat at a quarter past the hour connect with the R5 to Barcelona"],
      ["You use a wheelchair or have a pushchair", "Rack railway", "FGC says its trains and the rack railway are accessible for people with reduced mobility; the Aeri publishes no accessibility information"],
      ["You are afraid of heights", "Rack railway", "The Aeri is a hanging cabin climbing gradients of up to 45%"],
      ["You are driving", "Park at the bottom", "The car park at the top is paid and has limited spaces; at the Aeri station and Monistrol-Vila parking is free"],
      ["You want the museum and lunch", "Tot Montserrat", "For €71.50 it covers transport from Barcelona, the Sant Joan funicular, the museum and the buffet"],
      ["You want to go up one way and down the other", "Two singles", "€10 for the cable car and €9 for the rack railway, €19 in all, instead of €15 for a return"],
    ],
    mixTitle: "Up by cable car, down by rack railway",
    mix: [
      "You can, but returns are not interchangeable: buy a single on each (€19 for an adult). The Trans Montserrat and Tot Montserrat combined tickets come in a rack-railway version and a cable-car version, and you choose one when you buy it at Plaça Espanya.",
      "Remember that the R5 stops at a different station for each: **Montserrat-Aeri** for the cable car and **Monistrol de Montserrat** for the rack railway, four minutes further up the line.",
    ],
    accessTitle: "Accessibility, dogs and pushchairs",
    access: [
      "FGC says the trains and the Montserrat rack railway are accessible for people with reduced mobility, and Monistrol de Montserrat station has a lift. Holders of a disability card get 50% off the rack railway and the funiculars, on the same terms for a companion.",
      "The Aeri publishes no accessibility information on its website: it has two cabins for 32 people each. If you use a wheelchair, ask first on +34 93 835 0005 or take the rack railway.",
      "Dogs travel free on both the cable car and the rack railway, on a lead and muzzled (the rack railway ticket office sells a muzzle for €5 if you have none).",
    ],
    hoursTitle: "Opening hours at the top: basilica, Black Madonna and museum",
    hoursCaption: "Montserrat sanctuary opening hours",
    hoursHeaders: ["Place", "Hours"],
    hoursRows: [
      ["Basilica", "7:00–20:00"],
      ["Throne of Our Lady (the Black Madonna)", "8:00–10:30 and 12:00–18:25"],
      ["Santa Cova (on foot; the funicular is closed)", "Weekdays 10:30–16:00; weekends and holidays 10:30–16:30"],
      ["Museu de Montserrat", "10:00–17:45"],
      ["Audiovisual Space", "Weekdays 9:00–17:45; weekends and holidays 9:00–18:45"],
      ["Escolania boys' choir", "Sings Monday to Friday at 13:00 (not from Sant Joan, 24 June, to the end of August, after Christmas or in Holy Week)"],
    ],
    hoursNote: "Hours published by Montserrat Visita (the Abbey of Montserrat), read on 13 November 2026. They can change for religious services.",
    pricesTitle: "Rack railway, cable car and funicular fares",
    pricesCaption: "Getting up Montserrat: 2026 fares",
    pricesHeaders: ["Ticket", "Adult", "Child (4–13)", "Over 65"],
    pricesRows: [
      ["Rack railway, single / return", "€9 / €15", "€4.50 / €7.50", "€8.10 / €13.50"],
      ["Aeri cable car, single / return", "€10 / €15", "€5.25 / €7.50 (under-4s free)", "€8.75 / €12.50"],
      ["Sant Joan funicular, single / return", "€11.40 / €17.50", "€5.70 / €8.75", "€10.25 / €15.75"],
      ["Trans Montserrat (from Plaça Espanya)", "€50", "—", "—"],
      ["Tot Montserrat (from Plaça Espanya)", "€71.50", "—", "—"],
      ["Museu de Montserrat", "€12", "€6 (ages 8 to 16)", "€10 (seniors and students)"],
    ],
    pricesNote: "Rack railway and funicular: fares valid until 31 December 2026 (Turistren). Cable car: 2026 fares. Combined tickets and museum: their own sites, checked on 28 October 2026.",
    combosTitle: "Trans Montserrat and Tot Montserrat: what they include",
    combos: [
      "**Trans Montserrat** (€50) includes the return FGC train from Plaça Espanya, the **rack railway or the cable car** (there is a version of each), the Sant Joan funicular, the audiovisual space, access to the basilica and the Black Madonna's chapel subject to capacity, and a return metro ticket. **Tot Montserrat** (€71.50) adds the Museu de Montserrat and a buffet lunch. Neither includes the Escolania choir.",
      "They are open-dated: valid on any day until the next fare change, with free cancellation within 15 days of purchase; the funiculars must be used on the day you reach the monastery, and they cannot be booked: you queue. If you buy online, you exchange the e-ticket at the Punt d'Acollida in Plaça Espanya station (Monday to Sunday, 8 am to 2 pm) on the day you travel. Holders of a disability card get 50% off the rack railway and funiculars, and large and single-parent families 20% or 50%.",
    ],
    beforeTitle: "Before you go",
    before: "The **Santa Cova funicular** is out of service for maintenance until further notice (you can walk down). Non-resident tourists pay to enter the sanctuary (basilica and chapel); residents of Catalonia, the rest of Spain and the EU are exempt but must book on the Abbey's website to visit the Black Madonna.",
    upTitle: "What to do up there",
    upIntro: "A first visit can combine:",
    up: [
      "the sanctuary precinct;",
      "the basilica;",
      "the Moreneta, depending on your ticket;",
      "the museum, if it interests you;",
      "the Sant Joan funicular (the Santa Cova one is closed), depending on time;",
      "a short walk if the weather allows.",
    ],
    beyond: `This guide is about getting up Montserrat on your own. If you would rather go somewhere quieter, here are ${link("montserrat", "en", "ten Barcelona day trips that are not Montserrat")}.`,
    faq: [
      { question: "What is the Montserrat rack railway timetable?", answer: "It leaves every hour from Monistrol de Montserrat, timed to the R5. From 2 November to 24 December, on weekdays the last trains up and down run an hour earlier than at weekends; the table on this page has the times." },
      { question: "How much is the Montserrat rack railway?", answer: "€9 single and €15 return for adults; €4.50 and €7.50 for children aged 4 to 13. Fares valid until 31 December 2026." },
      { question: "How much is the Montserrat cable car?", answer: "The Aeri costs €10 single and €15 return for adults; children aged 4 to 13 pay €5.25 and €7.50, and under-4s go free." },
      { question: "Montserrat cable car or rack railway: which is better?", answer: "They cost the same (€15 return). The cable car leaves every 15 minutes and takes 5; the rack railway leaves hourly from Monistrol de Montserrat and takes 20, with a gentler climb." },
      { question: "How do I get from Barcelona to Montserrat by train?", answer: "On FGC's R5 from Plaça Espanya: 60 minutes to the Aeri cable car station or 64 to Monistrol de Montserrat, where you change to the rack railway." },
      { question: "What does Trans Montserrat include?", answer: "For €50: the FGC train from Plaça Espanya, the rack railway or cable car, the Sant Joan funicular, the audiovisual space, basilica access and a return metro ticket." },
      { question: "Can you go to Montserrat without a tour?", answer: "Yes. Take FGC's R5 from Plaça Espanya and the rack railway or the cable car up; the Trans Montserrat ticket covers both legs and the Sant Joan funicular for €50." },
      { question: "Which station is Monistrol-Vila?", answer: "The rack railway's village station in Monistrol de Montserrat, with free parking for passengers arriving by car. The R5 does not stop there: by train, get off at Monistrol de Montserrat." },
      { question: "Is the Montserrat rack railway free for anyone?", answer: "There is no free ticket or current promotion: everyone from age 4 pays. Dogs travel free on a lead and muzzled, Monistrol-Vila parking is free for passengers, and under-4s ride the cable car free. The T-mobilitat card is not valid." },
      { question: "Can I go up by cable car and come down by rack railway?", answer: "Yes, but returns are not interchangeable: buy a single on each, €10 for the cable car and €9 for the rack railway. The Trans Montserrat and Tot Montserrat combined tickets include only one of the two, which you choose when you buy." },
      { question: "How long does it take from Barcelona to Montserrat?", answer: "By rack railway, about an hour and a half: 64 minutes on the R5 to Monistrol de Montserrat, the connection and a 20-minute climb. By cable car, an hour on the train plus the wait (a quarter of an hour at most) and a 5-minute ride." },
      { question: "Is the Montserrat cable car wheelchair accessible?", answer: "The Aeri publishes no information on it, so phone before you go. FGC does say its trains and the rack railway are accessible for people with reduced mobility." },
      { question: "Can I drive to Montserrat?", answer: "Yes. It is about 50 km from Barcelona. You can park free at the cable-car station or at Monistrol-Vila and ride up, or drive to the monastery, where parking is paid and spaces are limited." },
      { question: "Is there a bus from Barcelona to Montserrat?", answer: "Montserrat Visita, the Abbey's website, lists an Autocars Julià coach leaving from carrer Viriat, beside Sants station. We could not confirm its timetable or fare with the operator, so check before you go." },
    ],
  },
};

const MONTSERRAT_PATHS = {
  ca: "escapades/montserrat-per-lliure-des-barcelona",
  es: "escapadas/montserrat-por-libre-desde-barcelona",
  en: "day-trips/montserrat-without-a-tour-from-barcelona",
} as const;

function montserratBody(locale: "ca" | "es" | "en") {
  const t = MONTSERRAT_COPY[locale];
  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    callout("official", verifiedLine(locale, MONTSERRAT_VERIFIED), t.before),
    // 13 Nov 2026: the comparison the English queries ask for comes first.
    ...h2(t.chooseTitle, ...t.choose),
    table(t.compareCaption, t.compareHeaders, t.compareRows, t.compareNote),
    ...h3(t.bestTitle),
    table(t.bestCaption, t.bestHeaders, t.bestRows),
    ...h3(t.mixTitle, ...t.mix),
    ...h2(t.rackTitle, ...t.rack),
    table(t.rackCaption, t.rackHeaders, t.rackRows, t.rackNote),
    ...h2(t.aeriTitle, ...t.aeri),
    table(t.aeriCaption, t.aeriHeaders, t.aeriRows, t.aeriNote),
    ...h2(t.trainTitle, ...t.train),
    table(t.trainCaption, t.trainHeaders, t.trainRows, t.trainNote),
    ...h2(t.pricesTitle),
    table(t.pricesCaption, t.pricesHeaders, t.pricesRows, t.pricesNote),
    ...h2(t.combosTitle, ...t.combos),
    ...h2(t.accessTitle, ...t.access),
    ...h2(t.hoursTitle),
    table(t.hoursCaption, t.hoursHeaders, t.hoursRows, t.hoursNote),
    ...h2(t.upTitle, t.upIntro),
    list(...t.up),
    ...paras(t.beyond),
    faq(t.faq),
    ...paras(verifiedLine(locale, MONTSERRAT_VERIFIED)),
    ...b2Related(["girona", "cerdanya", "transport"], locale),
  ];
}

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
    ca: "Des de Monistrol-Vila, el cremallera puja al monestir en 13 minuts.",
    es: "Desde Monistrol-Vila, el cremallera sube al monasterio en 13 minutos.",
    en: "From Monistrol-Vila, the rack railway climbs to the monastery in 13 minutes.",
  },
  verifiedAt: MONTSERRAT_VERIFIED,
  publishedAt: "2026-09-29T11:40:00+02:00",
  editions: {
    ca: { path: MONTSERRAT_PATHS.ca, title: MONTSERRAT_COPY.ca.title, seoTitle: MONTSERRAT_COPY.ca.seoTitle, seoDescription: MONTSERRAT_COPY.ca.seoDescription, excerpt: MONTSERRAT_COPY.ca.excerpt, blocks: montserratBody("ca") },
    es: { path: MONTSERRAT_PATHS.es, title: MONTSERRAT_COPY.es.title, seoTitle: MONTSERRAT_COPY.es.seoTitle, seoDescription: MONTSERRAT_COPY.es.seoDescription, excerpt: MONTSERRAT_COPY.es.excerpt, blocks: montserratBody("es") },
    en: { path: MONTSERRAT_PATHS.en, title: MONTSERRAT_COPY.en.title, seoTitle: MONTSERRAT_COPY.en.seoTitle, seoDescription: MONTSERRAT_COPY.en.seoDescription, excerpt: MONTSERRAT_COPY.en.excerpt, blocks: montserratBody("en") },
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
  { name: "Cercador d'horaris de Rodalies", url: "https://rodalies.gencat.cat/ca/horaris/", publisher: "Rodalies de Catalunya" },
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

// R3 notice and train timetable re-checked on 26 Oct 2026: notice updated
// 06.07.2026 (plus a Balenyà-Els Hostalets stop change from 22/10), train
// sheet "a partir del 06.07" V7, last updated 16/09/2026. The two tables
// below list the rows that sheet marks as R3 trains running through to
// Puigcerdà; none of them carries the weekday-only shading. Until 26 Oct the
// up table missed the 18:16 from La Garriga (Puigcerdà 20:51) and the page
// said four trains up: the sheet, R3.pdf and the official planner
// (serveisgrs.rodalies.gencat.cat/api/timetables, La Garriga 77102 →
// Puigcerdà 77309, for 28 and 31 Oct and 4 Nov) all give five each way,
// single fare "REG" 9.70 €. The old "Adif planned to keep the cut until
// January 2027" line is gone: the notice no longer says it.
const CERDANYA_VERIFIED = "2026-10-26";

const CERDANYA_R3: Record<"ca" | "es" | "en", [title: string, body: string]> = {
  ca: [
    "L'R3, ara mateix",
    "Segons l'avís de Rodalies (actualitzat el 6 de juliol de 2026 i vigent el 26 d'octubre), l'R3 circula amb el 50 % dels trens que tenia abans del 20 de gener i no hi ha trens entre Barcelona i la Garriga: entre l'Hospitalet i Fabra i Puig o Montcada Bifurcació hi ha l'R4, i fins a la Garriga o Vic, autobusos directes de Rodalies. Des del 12 d'agost hi ha també autobusos complementaris entre la Garriga i Puigcerdà. Mira els horaris a rodalies.gencat.cat abans de sortir.",
  ],
  es: [
    "La R3, ahora mismo",
    "Según el aviso de Rodalies (actualizado el 6 de julio de 2026 y vigente el 26 de octubre), la R3 circula con el 50 % de los trenes que tenía antes del 20 de enero y no hay trenes entre Barcelona y La Garriga: entre L'Hospitalet y Fabra i Puig o Montcada Bifurcació está la R4, y hasta La Garriga o Vic, autobuses directos de Rodalies. Desde el 12 de agosto hay también autobuses complementarios entre La Garriga y Puigcerdà. Mira los horarios en rodalies.gencat.cat antes de salir.",
  ],
  en: [
    "The R3 right now",
    "According to Rodalies' notice (last updated 6 July 2026 and still in force on 26 October), the R3 is running 50% of the trains it had before 20 January, and no trains run between Barcelona and La Garriga: the R4 covers L'Hospitalet to Fabra i Puig or Montcada Bifurcació, and Rodalies direct buses run to La Garriga or Vic. Since 12 August there have also been complementary buses between La Garriga and Puigcerdà. Check the timetables at rodalies.gencat.cat before you go.",
  ],
};

/** Through trains only, from the Rodalies sheet valid since 6 July 2026. */
const CERDANYA_UP: string[][] = [
  ["6:46", "8:10", "8:29", "9:00", "9:21", "—"],
  ["10:16", "11:40", "12:01", "12:32", "12:54", "13:00"],
  ["13:16", "14:40", "14:59", "15:32", "15:54", "16:00"],
  ["16:16", "17:40", "17:59", "18:32", "18:54", "19:00"],
  ["18:16", "19:40", "19:59", "20:30", "20:51", "—"],
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
    note: "Font: Rodalies, horari de tren R3 vigent des del 6 de juliol de 2026 (full actualitzat el 16/09/2026). Només els trens que fan tot el recorregut; la resta acaba a Ripoll o a Ribes. Consultat el 26/10/2026: pot canviar, comprova'l el dia que viatgis.",
  },
  es: {
    up: ["Trenes R3 de subida: La Garriga → Puigcerdà (todos los días)", ["La Garriga", "Ripoll", "Ribes de Freser", "La Molina", "Puigcerdà", "La Tor de Querol"]],
    down: ["Trenes R3 de bajada: Puigcerdà → La Garriga (todos los días)", ["La Tor de Querol", "Puigcerdà", "La Molina", "Ribes de Freser", "Ripoll", "La Garriga"]],
    note: "Fuente: Rodalies, horario de tren R3 vigente desde el 6 de julio de 2026 (hoja actualizada el 16/09/2026). Solo los trenes que hacen todo el recorrido; el resto termina en Ripoll o en Ribes. Consultado el 26/10/2026: puede cambiar, compruébalo el día que viajes.",
  },
  en: {
    up: ["R3 trains up: La Garriga → Puigcerdà (daily)", ["La Garriga", "Ripoll", "Ribes de Freser", "La Molina", "Puigcerdà", "La Tor de Querol"]],
    down: ["R3 trains down: Puigcerdà → La Garriga (daily)", ["La Tor de Querol", "Puigcerdà", "La Molina", "Ribes de Freser", "Ripoll", "La Garriga"]],
    note: "Source: Rodalies, R3 train timetable in force since 6 July 2026 (sheet updated 16/09/2026). Only trains that run the whole way; the rest terminate at Ripoll or Ribes. Checked 26/10/2026: it can change, so confirm on the day you travel.",
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
          "Sí, es pot anar a la Cerdanya sense cotxe: amb la línia **R3**, que puja per Vic i Ripoll fins a la Molina, Puigcerdà i la Tor de Querol. Mentre duren les obres no hi ha trens entre Barcelona i la Garriga (el tram es fa amb autobusos de Rodalies), i de la Garriga a Puigcerdà hi ha **cinc trens directes al dia en cada sentit**, amb un trajecte d'entre 2 h 35 min i 2 h 46 min. Un cop allà, Puigcerdà és la base més pràctica.",
        ),
        callout("warning", ...CERDANYA_R3.ca),
        ...h2("Horaris de l'R3 a la Molina i Puigcerdà"),
        ...cerdanyaTimetable("ca"),
        ...paras(
          "El bitllet senzill de la Garriga a Puigcerdà costa 9,70 €. La resta de trens de l'R3 acaben a Ripoll o a Ribes de Freser, i entre la Garriga i Puigcerdà també circulen els autobusos complementaris de Rodalies. També hi ha línies regulars d'autobús des de Barcelona, la Seu d'Urgell i Lleida (ALSA) i des de Girona per Olot i Ripoll (TEISA).",
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
          { question: "Quants trens hi ha de la Garriga a Puigcerdà?", answer: "Cinc trens directes al dia en cada sentit, també els caps de setmana, segons l'horari vigent des del 6 de juliol de 2026. La resta de trens de l'R3 acaben a Ripoll o a Ribes de Freser." },
          { question: "Es pot anar en tren de Barcelona a Puigcerdà?", answer: "No directament mentre duren les obres: de Barcelona a la Garriga hi ha autobusos de Rodalies, i de la Garriga a Puigcerdà, el tren R3." },
          { question: "Quant dura el trajecte de la Garriga a Puigcerdà?", answer: "Entre 2 h 35 min i 2 h 46 min, segons el tren." },
          { question: "Hi ha bus a les pistes des de Puigcerdà?", answer: "La temporada 2025-26, el Bus Blanc va unir la Cerdanya amb la Molina i Masella els caps de setmana i festius escolars, a 2 €. El de 2026-27 encara no s'ha publicat." },
        ]),
        ...paras(verifiedLine("ca", CERDANYA_VERIFIED)),
        ...b2Related(["nuria", "ski", "andorra", "ripolles", "snow", "girona"], "ca"),
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
          "Sí, se puede ir a la Cerdanya sin coche: con la línea **R3**, que sube por Vic y Ripoll hasta La Molina, Puigcerdà y La Tor de Querol. Mientras duran las obras no hay trenes entre Barcelona y La Garriga (el tramo se hace en autobuses de Rodalies), y de La Garriga a Puigcerdà hay **cinco trenes directos al día en cada sentido**, con un trayecto de entre 2 h 35 min y 2 h 46 min. Una vez allí, Puigcerdà es la base más práctica.",
        ),
        callout("warning", ...CERDANYA_R3.es),
        ...h2("Horarios de la R3 a La Molina y Puigcerdà"),
        ...cerdanyaTimetable("es"),
        ...paras(
          "El billete sencillo de La Garriga a Puigcerdà cuesta 9,70 €. El resto de trenes de la R3 terminan en Ripoll o en Ribes de Freser, y entre La Garriga y Puigcerdà también circulan los autobuses complementarios de Rodalies. Hay además líneas regulares de autobús desde Barcelona, La Seu d'Urgell y Lleida (ALSA) y desde Girona por Olot y Ripoll (TEISA).",
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
          { question: "¿Cuántos trenes hay de La Garriga a Puigcerdà?", answer: "Cinco trenes directos al día en cada sentido, también los fines de semana, según el horario vigente desde el 6 de julio de 2026. El resto de trenes de la R3 terminan en Ripoll o en Ribes de Freser." },
          { question: "¿Se puede ir en tren de Barcelona a Puigcerdà?", answer: "No directamente mientras duran las obras: de Barcelona a La Garriga hay autobuses de Rodalies, y de La Garriga a Puigcerdà, el tren R3." },
          { question: "¿Cuánto dura el trayecto de La Garriga a Puigcerdà?", answer: "Entre 2 h 35 min y 2 h 46 min, según el tren." },
          { question: "¿Hay autobús a las pistas desde Puigcerdà?", answer: "En la temporada 2025-26, el Bus Blanc unió la Cerdanya con La Molina y Masella los fines de semana y festivos escolares, a 2 €. El de 2026-27 aún no se ha publicado." },
        ]),
        ...paras(verifiedLine("es", CERDANYA_VERIFIED)),
        ...b2Related(["nuria", "ski", "andorra", "ripolles", "snow", "girona"], "es"),
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
          "Yes, you can reach Cerdanya without a car: on Rodalies line **R3**, which climbs via Vic and Ripoll to La Molina, Puigcerdà and La Tor de Querol. While the works last there are no trains between Barcelona and La Garriga (that stretch is by Rodalies bus), and **five through trains a day each way** run between La Garriga and Puigcerdà, taking between 2 h 35 min and 2 h 46 min. Once there, Puigcerdà is the practical base.",
        ),
        callout("warning", ...CERDANYA_R3.en),
        ...h2("R3 train times to La Molina and Puigcerdà"),
        ...cerdanyaTimetable("en"),
        ...paras(
          "A single from La Garriga to Puigcerdà costs €9.70. Other R3 trains terminate at Ripoll or Ribes de Freser, and Rodalies also runs complementary buses between La Garriga and Puigcerdà. Regular coaches link the area with Barcelona, La Seu d'Urgell and Lleida (ALSA) and with Girona via Olot and Ripoll (TEISA).",
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
          { question: "How many trains run from La Garriga to Puigcerdà?", answer: "Five through trains a day each way, weekends included, on the timetable in force since 6 July 2026. Other R3 trains terminate at Ripoll or Ribes de Freser." },
          { question: "Can you take the train from Barcelona to Puigcerdà?", answer: "Not directly while the works last: Rodalies buses run from Barcelona to La Garriga, and the R3 train from La Garriga to Puigcerdà." },
          { question: "How long is the R3 from La Garriga to Puigcerdà?", answer: "Between 2 h 35 min and 2 h 46 min, depending on the train." },
          { question: "Is there a bus to the slopes from Puigcerdà?", answer: "In 2025-26 the Bus Blanc linked Cerdanya with La Molina and Masella at weekends and in school holidays, for €2. The 2026-27 service has not been published yet." },
        ]),
        ...paras(verifiedLine("en", CERDANYA_VERIFIED)),
        ...b2Related(["nuria", "ski", "andorra", "ripolles", "snow", "girona"], "en"),
      ],
    },
  },
};
