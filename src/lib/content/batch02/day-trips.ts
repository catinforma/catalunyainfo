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
const GIRONA_VERIFIED = "2026-10-24";

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
        "R11 de Rodalies en 1 h 19-1 h 31 des de 8,95 €, o alta velocitat en uns 40 minuts. Trens al dia, últim de tornada i ruta d'un dia pel Barri Vell.",
      excerpt:
        "R11 o alta velocitat: quant triga i quant costa el tren de Barcelona a Girona, i una ruta d'un dia pel Barri Vell, sense cotxe.",
      blocks: [
        lead(
          "Per anar de Barcelona a Girona en tren hi ha dues opcions: la **R11 de Rodalies**, que triga **d'1 h 19 a 1 h 31** des de Sants i costa **8,95 €** el senzill (12 € als trens MD), i l'**alta velocitat de Renfe**, que hi arriba en **uns 40 minuts**. Totes dues paren a l'estació de Girona, i la ciutat es recorre a peu en un dia.",
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
          "Tren de Barcelona a Girona: R11 o alta velocitat",
          "Girona té trens de Rodalies i d'alta velocitat des de Barcelona. La taula compara les dues opcions per a un dia feiner i un dissabte.",
        ),
        table(
          "Tren de Barcelona-Sants a Girona",
          ["Tren", "Durada", "Trens al dia", "Primer i últim des de Sants", "Últim de tornada", "Senzill"],
          [
            ["R11 de Rodalies (MD i regional)", "1 h 19 (MD) – 1 h 31 (regional)", "23 feiners, 15 dissabtes", "5:56 – 21:46 (dissabte des de 6:46)", "21:19 (dissabte 21:23)", "8,95 € regional, 12 € MD"],
            ["Alta velocitat de Renfe (Avant, AVE, Euromed)", "39 – 49 min (alguns directes, 26 min)", "17 feiners, 11 dissabtes", "6:40 – 23:20", "19:52 (dissabte 19:25)", "Segons tren i data"],
          ],
          "Cercador oficial de Rodalies (amb els seus preus) i dades obertes d'horaris de Renfe per al 27 i el 31 d'octubre de 2026.",
        ),
        ...h2(
          "Quin tren agafar",
          "La més econòmica és la línia **R11** de Rodalies, que surt de Barcelona Sants i para a Passeig de Gràcia i al Clot abans de seguir per Granollers fins a Girona i Figueres. Els trens de mitjana distància (MD) fan el trajecte en 1 h 19 i costen 12 €; els regionals, que fan més parades, triguen 1 h 31 i costen 8,95 €. L'**alta velocitat** de Renfe surt de Sants i arriba en uns 40 minuts, però el preu varia segons el tren i la data: mira'l a renfe.com. L'últim tren d'alta velocitat de tornada surt força més d'hora que l'últim R11.",
        ),
        ...h2(
          "Horaris i preus dels monuments",
          "Consultats el 24 d'octubre de 2026.",
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
        ...b2Related(["figueres", "sitges", "tarragona", "montserratFree", "cerdanya"], "ca"),
      ],
    },

    es: {
      path: "escapadas/girona-desde-barcelona-tren",
      title: "Tren de Barcelona a Girona: horarios, precios y qué ver en un día",
      seoTitle: "Tren Barcelona–Girona: horarios, precios, AVE o Rodalies",
      seoDescription:
        "R11 de Rodalies en 1 h 19-1 h 31 desde 8,95 €, o alta velocidad en unos 40 minutos. Trenes al día, último de vuelta y ruta de un día por el Barri Vell.",
      excerpt:
        "R11 o alta velocidad: cuánto tarda y cuánto cuesta el tren de Barcelona a Girona, y una ruta de un día por el Barri Vell, sin coche.",
      blocks: [
        lead(
          "Para ir de Barcelona a Girona en tren hay dos opciones: la **R11 de Rodalies**, que tarda **de 1 h 19 a 1 h 31** desde Sants y cuesta **8,95 €** el sencillo (12 € en los trenes MD), y la **alta velocidad de Renfe**, que llega en **unos 40 minutos**. Las dos paran en la estación de Girona, y la ciudad se recorre a pie en un día.",
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
          "Tren de Barcelona a Girona: R11 o alta velocidad",
          "Girona tiene trenes de Rodalies y de alta velocidad desde Barcelona. La tabla compara las dos opciones para un día laborable y un sábado.",
        ),
        table(
          "Tren de Barcelona-Sants a Girona",
          ["Tren", "Duración", "Trenes al día", "Primero y último desde Sants", "Último de vuelta", "Sencillo"],
          [
            ["R11 de Rodalies (MD y regional)", "1 h 19 (MD) – 1 h 31 (regional)", "23 laborables, 15 sábados", "5:56 – 21:46 (sábado desde 6:46)", "21:19 (sábado 21:23)", "8,95 € regional, 12 € MD"],
            ["Alta velocidad de Renfe (Avant, AVE, Euromed)", "39 – 49 min (algunos directos, 26 min)", "17 laborables, 11 sábados", "6:40 – 23:20", "19:52 (sábado 19:25)", "Según tren y fecha"],
          ],
          "Planificador oficial de Rodalies (con sus precios) y datos abiertos de horarios de Renfe para el 27 y el 31 de octubre de 2026.",
        ),
        ...h2(
          "Qué tren coger",
          "La más económica es la línea **R11** de Rodalies, que sale de Barcelona Sants y para en Passeig de Gràcia y El Clot antes de seguir por Granollers hasta Girona y Figueres. Los trenes de media distancia (MD) hacen el trayecto en 1 h 19 y cuestan 12 €; los regionales, con más paradas, tardan 1 h 31 y cuestan 8,95 €. La **alta velocidad** de Renfe sale de Sants y llega en unos 40 minutos, pero el precio varía según el tren y la fecha: consúltalo en renfe.com. El último tren de alta velocidad de vuelta sale bastante antes que el último R11.",
        ),
        ...h2(
          "Horarios y precios de los monumentos",
          "Consultados el 24 de octubre de 2026.",
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
        ...b2Related(["figueres", "sitges", "tarragona", "montserratFree", "cerdanya"], "es"),
      ],
    },

    en: {
      path: "day-trips/girona-from-barcelona-by-train",
      title: "Barcelona to Girona by train: times, fares and a one-day route",
      seoTitle: "Barcelona to Girona by train: times, fares, AVE or R11",
      seoDescription:
        "The R11 takes 1 h 19-1 h 31 from €8.95; high-speed trains take about 40 minutes. Trains a day, the last train back and a one-day walk round the old town.",
      excerpt:
        "R11 or high-speed: how long the train from Barcelona to Girona takes, what it costs, and a one-day route through the old town without a car.",
      blocks: [
        lead(
          "There are two ways to go from Barcelona to Girona by train: Rodalies line **R11**, which takes **1 h 19 to 1 h 31** from Sants and costs **€8.95** single (€12 on MD trains), and **Renfe's high-speed trains**, which take **about 40 minutes**. Both stop at Girona station, and the city is easy to see on foot in a day.",
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
          "Barcelona to Girona train: R11 or high-speed",
          "Girona has both Rodalies and high-speed trains from Barcelona. The table compares the two for a weekday and a Saturday.",
        ),
        table(
          "Barcelona-Sants to Girona by train",
          ["Train", "Journey", "Trains a day", "First and last from Sants", "Last train back", "Single fare"],
          [
            ["Rodalies R11 (MD and regional)", "1 h 19 (MD) – 1 h 31 (regional)", "23 on weekdays, 15 on Saturdays", "5:56 – 21:46 (Saturday from 6:46)", "21:19 (Saturday 21:23)", "€8.95 regional, €12 MD"],
            ["Renfe high-speed (Avant, AVE, Euromed)", "39 – 49 min (some non-stop, 26 min)", "17 on weekdays, 11 on Saturdays", "6:40 – 23:20", "19:52 (Saturday 19:25)", "Varies by train and date"],
          ],
          "Official Rodalies journey planner (with its fares) and Renfe's open timetable data, for 27 and 31 October 2026.",
        ),
        ...h2(
          "Which train to take",
          "The cheaper is Rodalies line **R11**. It leaves from Barcelona Sants, calls at Passeig de Gràcia and El Clot, and then runs via Granollers to Girona and Figueres. Medium-distance (MD) trains take 1 h 19 and cost €12; regional trains, which make more stops, take 1 h 31 and cost €8.95. Renfe's **high-speed** trains leave from Sants and take about 40 minutes, but the fare depends on the train and the date: check it on renfe.com. The last high-speed train back leaves well before the last R11.",
        ),
        ...h2(
          "Sights: hours and prices",
          "Checked 24 October 2026.",
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
const MONTSERRAT_VERIFIED = "2026-10-24";

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
  pricesTitle: string; pricesCaption: string; pricesHeaders: string[]; pricesRows: string[][]; pricesNote: string;
  combosTitle: string; combos: string[];
  beforeTitle: string; before: string;
  upTitle: string; upIntro: string; up: string[];
  beyond: string;
  faq: { question: string; answer: string }[];
};

const MONTSERRAT_COPY: Record<"ca" | "es" | "en", MontT> = {
  ca: {
    title: "Montserrat per lliure des de Barcelona: horaris del cremallera i l'Aeri, preus i tren R5",
    seoTitle: "Cremallera i Aeri de Montserrat: horaris, preus i tren R5",
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
    ],
    rackTitle: "Horaris del cremallera de Montserrat",
    rack: [
      "El cremallera surt **cada hora** de l'estació de **Monistrol de Montserrat**, on para l'R5, i arriba al monestir en 20 minuts; des de **Monistrol-Vila**, a l'altra banda del poble, n'hi ha més i triga 13. L'R5 que surt de Plaça Espanya al minut :36 enllaça amb el cremallera del minut :48.",
      "De baixada, els trens que surten de Montserrat al quart d'hora enllacen a Monistrol amb l'R5 cap a Barcelona. A l'hivern l'últim tren baixa una hora abans.",
    ],
    rackCaption: "Cremallera de Montserrat, finals d'octubre i novembre de 2026",
    rackHeaders: ["Trajecte", "Sortides", "Durada"],
    rackRows: [
      ["Monistrol de Montserrat (enllaç R5) → Montserrat", "Cada hora a :48, de 7:48 a 18:48", "20 min"],
      ["Montserrat → Monistrol de Montserrat", "Cada hora a :15, de 8:15 a 19:15", "20 min"],
      ["Monistrol-Vila → Montserrat", "Cada 20 min de 8:35 a 19:15 (algunes hores cada 40 min entre setmana)", "13 min"],
      ["Desembre (exemple: 10 de desembre)", "Última pujada 17:48, última baixada 18:15", "—"],
    ],
    rackNote: "Dades obertes d'horaris d'FGC (versió del 23 d'octubre de 2026) per al 27 i el 31 d'octubre, el 8 de novembre i el 10 de desembre. El 25 de desembre l'última pujada és a les 13:48.",
    aeriTitle: "Horaris de l'Aeri de Montserrat",
    aeri: [
      "L'**Aeri** és el telefèric que puja des de la seva pròpia estació de l'R5 (Montserrat-Aeri) fins al monestir. Surt **cada 15 minuts** i el trajecte dura uns **5 minuts**. Els horaris canvien amb la temporada: a l'octubre tanca més tard, i al novembre i desembre tanca abans entre setmana.",
    ],
    aeriCaption: "Aeri de Montserrat, calendari 2026",
    aeriHeaders: ["Període", "Horari"],
    aeriRows: [
      ["Octubre, cada dia", "9:30–19:00"],
      ["Novembre i desembre, feiners", "9:30–17:15"],
      ["Novembre i desembre, caps de setmana i festius", "9:30–18:15"],
      ["25 de desembre", "9:30–14:00"],
    ],
    aeriNote: "Calendari 2026 publicat per l'Aeri de Montserrat, consultat el 24 d'octubre de 2026.",
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
    trainNote: "Dades obertes d'horaris d'FGC per al 27 i el 31 d'octubre i l'1 de novembre de 2026.",
    chooseTitle: "Cremallera o Aeri: quin triar",
    choose: [
      "La pujada en cremallera és progressiva i deixa veure com canvia el paisatge; la de l'Aeri és una vista vertical de cop, en pocs minuts. Costen el mateix d'anada i tornada.",
      "La diferència pràctica és la freqüència: l'Aeri surt cada quart d'hora, mentre que el cremallera des de Monistrol de Montserrat surt un cop per hora, enllaçat amb l'R5. Si no vols esperar, l'Aeri és més flexible; si vols enllaçar sense pensar-hi amb el tren de tornada, el cremallera ja està sincronitzat amb l'R5.",
    ],
    pricesTitle: "Preus del cremallera, l'Aeri i el funicular",
    pricesCaption: "Pujar a Montserrat: preus del 2026",
    pricesHeaders: ["Bitllet", "Adult", "Infant (4–13)", "Més de 65"],
    pricesRows: [
      ["Cremallera, anada / anada i tornada", "9 € / 15 €", "4,50 € / 7,50 €", "8,10 € / 13,50 €"],
      ["Aeri de Montserrat, anada / anada i tornada", "10 € / 15 €", "5,25 € / 7,50 € (menors de 4, gratis)", "8,75 € / 12,50 €"],
      ["Funicular de Sant Joan, anada / anada i tornada", "11,40 € / 17,50 €", "5,70 € / 8,75 €", "10,25 € / 15,75 €"],
      ["Trans Montserrat (des de Plaça Espanya)", "50 €", "—", "—"],
      ["Tot Montserrat (des de Plaça Espanya)", "71,50 €", "—", "—"],
      ["Museu de Montserrat", "12 €", "6 € (de 8 a 16 anys)", "10 €"],
    ],
    pricesNote: "Cremallera i funicular: preus vàlids fins al 31 de desembre de 2026 (Turistren). Aeri: tarifes 2026. Combinats i museu: els seus webs, consultats el 24 d'octubre de 2026.",
    combosTitle: "Trans Montserrat i Tot Montserrat: què inclouen",
    combos: [
      "El **Trans Montserrat** (50 €) inclou el tren d'FGC d'anada i tornada des de Plaça Espanya, el **cremallera o l'Aeri** (hi ha una versió de cada), el funicular de Sant Joan, l'Espai Audiovisual, l'accés a la basílica i al cambril de la Mare de Déu segons aforament i un bitllet de metro de tornada. El **Tot Montserrat** (71,50 €) hi afegeix el Museu de Montserrat i el dinar de bufet. Cap dels dos inclou el cant de l'Escolania.",
      "Si els compres en línia, has de bescanviar el bitllet al Punt d'Acollida de l'estació de Plaça Espanya el mateix dia del viatge. Les persones amb targeta de discapacitat tenen un 50 % de descompte al cremallera i els funiculars, i les famílies nombroses i monoparentals, un 20 % o un 50 %.",
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
      { question: "Quins horaris té el cremallera de Montserrat?", answer: "Surt cada hora de Monistrol de Montserrat, enllaçat amb l'R5, des de primera hora del matí fins al vespre; a l'hivern l'últim baixa una hora abans. La taula d'aquesta pàgina recull les sortides de la tardor del 2026." },
      { question: "Quant costa el cremallera de Montserrat?", answer: "9 € l'anada i 15 € l'anada i tornada per a adults; 4,50 € i 7,50 € per als infants de 4 a 13 anys. Preus vàlids fins al 31 de desembre de 2026." },
      { question: "Quins horaris té l'Aeri de Montserrat?", answer: "Surt cada 15 minuts. Al novembre i el desembre obre al matí i tanca a primera hora del vespre entre setmana i una hora més tard els caps de setmana i festius; la taula té les hores exactes." },
      { question: "Què és millor, el cremallera o l'Aeri?", answer: "Costen el mateix (15 € anada i tornada). L'Aeri surt cada 15 minuts i puja en 5; el cremallera surt cada hora des de Monistrol de Montserrat i puja en 20, amb una pujada més suau." },
      { question: "Com s'hi va de Barcelona a Montserrat en tren?", answer: "Amb l'R5 d'FGC des de Plaça Espanya: 60 minuts fins a l'estació de l'Aeri o 64 fins a Monistrol de Montserrat, on es canvia al cremallera." },
      { question: "Què inclou el Trans Montserrat?", answer: "Per 50 €: tren d'FGC des de Plaça Espanya, cremallera o Aeri, funicular de Sant Joan, Espai Audiovisual, accés a la basílica i metro de tornada." },
    ],
  },
  es: {
    title: "Montserrat por libre desde Barcelona: horarios del cremallera y el Aeri, precios y tren R5",
    seoTitle: "Montserrat por libre: cremallera y Aeri, horarios y precios",
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
    ],
    rackTitle: "Horarios del cremallera de Montserrat",
    rack: [
      "El cremallera sale **cada hora** de la estación de **Monistrol de Montserrat**, donde para la R5, y llega al monasterio en 20 minutos; desde **Monistrol-Vila**, al otro lado del pueblo, hay más y tarda 13. La R5 que sale de Plaça Espanya en el minuto :36 enlaza con el cremallera del minuto :48.",
      "De bajada, los trenes que salen de Montserrat y cuarto enlazan en Monistrol con la R5 hacia Barcelona. En invierno el último baja una hora antes.",
    ],
    rackCaption: "Cremallera de Montserrat, finales de octubre y noviembre de 2026",
    rackHeaders: ["Trayecto", "Salidas", "Duración"],
    rackRows: [
      ["Monistrol de Montserrat (enlace R5) → Montserrat", "Cada hora a :48, de 7:48 a 18:48", "20 min"],
      ["Montserrat → Monistrol de Montserrat", "Cada hora a :15, de 8:15 a 19:15", "20 min"],
      ["Monistrol-Vila → Montserrat", "Cada 20 min de 8:35 a 19:15 (algunas horas cada 40 min entre semana)", "13 min"],
      ["Diciembre (ejemplo: 10 de diciembre)", "Última subida 17:48, última bajada 18:15", "—"],
    ],
    rackNote: "Datos abiertos de horarios de FGC (versión del 23 de octubre de 2026) para el 27 y el 31 de octubre, el 8 de noviembre y el 10 de diciembre. El 25 de diciembre la última subida es a las 13:48.",
    aeriTitle: "Horarios del Aeri (teleférico) de Montserrat",
    aeri: [
      "El **Aeri** es el teleférico que sube desde su propia estación de la R5 (Montserrat-Aeri) hasta el monasterio. Sale **cada 15 minutos** y el trayecto dura unos **5 minutos**. Los horarios cambian con la temporada: en octubre cierra más tarde, y en noviembre y diciembre cierra antes entre semana.",
    ],
    aeriCaption: "Aeri de Montserrat, calendario 2026",
    aeriHeaders: ["Periodo", "Horario"],
    aeriRows: [
      ["Octubre, todos los días", "9:30–19:00"],
      ["Noviembre y diciembre, laborables", "9:30–17:15"],
      ["Noviembre y diciembre, fines de semana y festivos", "9:30–18:15"],
      ["25 de diciembre", "9:30–14:00"],
    ],
    aeriNote: "Calendario 2026 publicado por el Aeri de Montserrat, consultado el 24 de octubre de 2026.",
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
    trainNote: "Datos abiertos de horarios de FGC para el 27 y el 31 de octubre y el 1 de noviembre de 2026.",
    chooseTitle: "Cremallera o teleférico: cuál elegir",
    choose: [
      "La subida en cremallera es progresiva y permite ver cómo cambia el paisaje; la del Aeri es una vista vertical de golpe, en pocos minutos. Cuestan lo mismo ida y vuelta.",
      "La diferencia práctica es la frecuencia: el Aeri sale cada cuarto de hora, mientras que el cremallera desde Monistrol de Montserrat sale una vez por hora, enlazado con la R5. Si no quieres esperar, el Aeri es más flexible; si prefieres enlazar sin pensarlo con el tren de vuelta, el cremallera ya está sincronizado con la R5.",
    ],
    pricesTitle: "Precios del cremallera, el teleférico y el funicular",
    pricesCaption: "Subir a Montserrat: precios de 2026",
    pricesHeaders: ["Billete", "Adulto", "Niño (4–13)", "Mayores de 65"],
    pricesRows: [
      ["Cremallera, ida / ida y vuelta", "9 € / 15 €", "4,50 € / 7,50 €", "8,10 € / 13,50 €"],
      ["Aeri de Montserrat, ida / ida y vuelta", "10 € / 15 €", "5,25 € / 7,50 € (menores de 4, gratis)", "8,75 € / 12,50 €"],
      ["Funicular de Sant Joan, ida / ida y vuelta", "11,40 € / 17,50 €", "5,70 € / 8,75 €", "10,25 € / 15,75 €"],
      ["Trans Montserrat (desde Plaça Espanya)", "50 €", "—", "—"],
      ["Tot Montserrat (desde Plaça Espanya)", "71,50 €", "—", "—"],
      ["Museu de Montserrat", "12 €", "6 € (de 8 a 16 años)", "10 €"],
    ],
    pricesNote: "Cremallera y funicular: precios válidos hasta el 31 de diciembre de 2026 (Turistren). Aeri: tarifas 2026. Combinados y museo: sus webs, consultadas el 24 de octubre de 2026.",
    combosTitle: "Trans Montserrat y Tot Montserrat: qué incluyen",
    combos: [
      "El **Trans Montserrat** (50 €) incluye el tren de FGC de ida y vuelta desde Plaça Espanya, el **cremallera o el Aeri** (hay una versión de cada), el funicular de Sant Joan, el Espai Audiovisual, el acceso a la basílica y al camarín de la Virgen según aforo y un billete de metro de vuelta. El **Tot Montserrat** (71,50 €) añade el Museu de Montserrat y la comida de bufé. Ninguno de los dos incluye el canto de la Escolania.",
      "Si los compras en línea, hay que canjear el billete en el Punt d'Acollida de la estación de Plaça Espanya el mismo día del viaje. Las personas con tarjeta de discapacidad tienen un 50 % de descuento en el cremallera y los funiculares, y las familias numerosas y monoparentales, un 20 % o un 50 %.",
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
      { question: "¿Qué horarios tiene el cremallera de Montserrat?", answer: "Sale cada hora de Monistrol de Montserrat, enlazado con la R5, desde primera hora de la mañana hasta la tarde; en invierno el último baja una hora antes. La tabla de esta página recoge las salidas del otoño de 2026." },
      { question: "¿Cuánto cuesta el cremallera de Montserrat?", answer: "9 € la ida y 15 € la ida y vuelta para adultos; 4,50 € y 7,50 € para niños de 4 a 13 años. Precios válidos hasta el 31 de diciembre de 2026." },
      { question: "¿Cuánto cuesta el teleférico de Montserrat?", answer: "El Aeri cuesta 10 € la ida y 15 € la ida y vuelta para adultos; los niños de 4 a 13 años pagan 5,25 € y 7,50 €, y los menores de 4 no pagan." },
      { question: "¿Qué es mejor, el cremallera o el teleférico?", answer: "Cuestan lo mismo (15 € ida y vuelta). El Aeri sale cada 15 minutos y sube en 5; el cremallera sale cada hora desde Monistrol de Montserrat y sube en 20, con una subida más suave." },
      { question: "¿Cómo llegar a Montserrat en tren desde Barcelona?", answer: "Con la R5 de FGC desde Plaça Espanya: 60 minutos hasta la estación del Aeri o 64 hasta Monistrol de Montserrat, donde se cambia al cremallera." },
      { question: "¿Qué incluye el Trans Montserrat?", answer: "Por 50 €: tren de FGC desde Plaça Espanya, cremallera o Aeri, funicular de Sant Joan, Espai Audiovisual, acceso a la basílica y metro de vuelta." },
    ],
  },
  en: {
    title: "Montserrat without a tour: rack railway and cable car times, fares and the R5 train",
    seoTitle: "Montserrat rack railway or cable car: times and fares",
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
    ],
    rackTitle: "Montserrat rack railway timetable",
    rack: [
      "The rack railway leaves **every hour** from **Monistrol de Montserrat** station, where the R5 stops, and reaches the monastery in 20 minutes; from **Monistrol-Vila**, across the village, trains are more frequent and take 13. The R5 leaving Plaça Espanya at :36 past the hour connects with the rack railway at :48.",
      "Coming down, the trains leaving Montserrat at a quarter past connect at Monistrol with the R5 to Barcelona. In winter the last train down is an hour earlier.",
    ],
    rackCaption: "Montserrat rack railway, late October and November 2026",
    rackHeaders: ["Route", "Departures", "Journey"],
    rackRows: [
      ["Monistrol de Montserrat (R5 connection) → Montserrat", "Hourly at :48, 7:48 to 18:48", "20 min"],
      ["Montserrat → Monistrol de Montserrat", "Hourly at :15, 8:15 to 19:15", "20 min"],
      ["Monistrol-Vila → Montserrat", "Every 20 min, 8:35 to 19:15 (some weekday hours every 40 min)", "13 min"],
      ["December (example: 10 December)", "Last up 17:48, last down 18:15", "—"],
    ],
    rackNote: "FGC's open timetable data (version of 23 October 2026) for 27 and 31 October, 8 November and 10 December. On 25 December the last train up is at 13:48.",
    aeriTitle: "Montserrat cable car (Aeri) opening times",
    aeri: [
      "The **Aeri** is the cable car that climbs from its own R5 station (Montserrat-Aeri) to the monastery. It runs **every 15 minutes** and the ride takes about **5 minutes**. Hours change with the season: in October it stays open later, and in November and December it closes earlier on weekdays.",
    ],
    aeriCaption: "Aeri de Montserrat, 2026 calendar",
    aeriHeaders: ["Period", "Hours"],
    aeriRows: [
      ["October, every day", "9:30–19:00"],
      ["November and December, weekdays", "9:30–17:15"],
      ["November and December, weekends and holidays", "9:30–18:15"],
      ["25 December", "9:30–14:00"],
    ],
    aeriNote: "2026 calendar published by the Aeri de Montserrat, checked on 24 October 2026.",
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
    trainNote: "FGC's open timetable data for 27 and 31 October and 1 November 2026.",
    chooseTitle: "Rack railway or cable car?",
    choose: [
      "The rack railway climbs gradually and lets you watch the landscape change; the cable car gives you the vertical view all at once, in a few minutes. Returns cost the same on both.",
      "The practical difference is frequency: the cable car leaves every quarter of an hour, while the rack railway from Monistrol de Montserrat runs once an hour, timed to the R5. If you do not want to wait, the cable car is more flexible; if you want the connection with the train back taken care of, the rack railway is already timed to the R5.",
    ],
    pricesTitle: "Rack railway, cable car and funicular fares",
    pricesCaption: "Getting up Montserrat: 2026 fares",
    pricesHeaders: ["Ticket", "Adult", "Child (4–13)", "Over 65"],
    pricesRows: [
      ["Rack railway, single / return", "€9 / €15", "€4.50 / €7.50", "€8.10 / €13.50"],
      ["Aeri cable car, single / return", "€10 / €15", "€5.25 / €7.50 (under-4s free)", "€8.75 / €12.50"],
      ["Sant Joan funicular, single / return", "€11.40 / €17.50", "€5.70 / €8.75", "€10.25 / €15.75"],
      ["Trans Montserrat (from Plaça Espanya)", "€50", "—", "—"],
      ["Tot Montserrat (from Plaça Espanya)", "€71.50", "—", "—"],
      ["Museu de Montserrat", "€12", "€6 (ages 8 to 16)", "€10"],
    ],
    pricesNote: "Rack railway and funicular: fares valid until 31 December 2026 (Turistren). Cable car: 2026 fares. Combined tickets and museum: their own sites, checked on 24 October 2026.",
    combosTitle: "Trans Montserrat and Tot Montserrat: what they include",
    combos: [
      "**Trans Montserrat** (€50) includes the return FGC train from Plaça Espanya, the **rack railway or the cable car** (there is a version of each), the Sant Joan funicular, the audiovisual space, access to the basilica and the Black Madonna's chapel subject to capacity, and a return metro ticket. **Tot Montserrat** (€71.50) adds the Museu de Montserrat and a buffet lunch. Neither includes the Escolania choir.",
      "If you buy online, you exchange the e-ticket at the Punt d'Acollida in Plaça Espanya station on the day you travel. Holders of a disability card get 50% off the rack railway and funiculars, and large and single-parent families 20% or 50%.",
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
      { question: "What is the Montserrat rack railway timetable?", answer: "It leaves every hour from Monistrol de Montserrat, timed to the R5, from early morning to early evening; in winter the last train down is an hour earlier. The table on this page lists the autumn 2026 departures." },
      { question: "How much is the Montserrat rack railway?", answer: "€9 single and €15 return for adults; €4.50 and €7.50 for children aged 4 to 13. Fares valid until 31 December 2026." },
      { question: "How much is the Montserrat cable car?", answer: "The Aeri costs €10 single and €15 return for adults; children aged 4 to 13 pay €5.25 and €7.50, and under-4s go free." },
      { question: "Montserrat cable car or rack railway: which is better?", answer: "They cost the same (€15 return). The cable car leaves every 15 minutes and takes 5; the rack railway leaves hourly from Monistrol de Montserrat and takes 20, with a gentler climb." },
      { question: "How do I get from Barcelona to Montserrat by train?", answer: "On FGC's R5 from Plaça Espanya: 60 minutes to the Aeri cable car station or 64 to Monistrol de Montserrat, where you change to the rack railway." },
      { question: "What does Trans Montserrat include?", answer: "For €50: the FGC train from Plaça Espanya, the rack railway or cable car, the Sant Joan funicular, the audiovisual space, basilica access and a return metro ticket." },
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
    ...h2(t.rackTitle, ...t.rack),
    table(t.rackCaption, t.rackHeaders, t.rackRows, t.rackNote),
    ...h2(t.aeriTitle, ...t.aeri),
    table(t.aeriCaption, t.aeriHeaders, t.aeriRows, t.aeriNote),
    ...h2(t.trainTitle, ...t.train),
    table(t.trainCaption, t.trainHeaders, t.trainRows, t.trainNote),
    ...h2(t.chooseTitle, ...t.choose),
    ...h2(t.pricesTitle),
    table(t.pricesCaption, t.pricesHeaders, t.pricesRows, t.pricesNote),
    ...h2(t.combosTitle, ...t.combos),
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
    name: "Bus urbà",
    url: "https://www.puigcerda.cat/ca/serveis/mobilitat/bus-urba/",
    publisher: "Ajuntament de Puigcerdà",
  },
];

// R3 status re-checked against the Rodalies notice on 18 Oct 2026
// (research_notes/audits/p0_data_accuracy.md, P0-4).
const CERDANYA_VERIFIED = "2026-10-18";

const CERDANYA_R3: Record<"ca" | "es" | "en", [title: string, body: string]> = {
  ca: [
    "L'R3, ara mateix",
    "Segons l'avís de Rodalies (actualitzat el 6 de juliol del 2026 i vigent el 18 d'octubre), l'R3 circula amb el 50 % dels trens que tenia abans del 20 de gener i no hi ha trens entre Barcelona i la Garriga. Des del 12 d'agost hi ha també autobusos complementaris entre la Garriga i Puigcerdà. Adif preveia mantenir el tall entre Barcelona i la Garriga fins al gener del 2027. Mira els horaris a rodalies.gencat.cat abans de sortir.",
  ],
  es: [
    "La R3, ahora mismo",
    "Según el aviso de Rodalies (actualizado el 6 de julio de 2026 y vigente el 18 de octubre), la R3 circula con el 50 % de los trenes que tenía antes del 20 de enero y no hay trenes entre Barcelona y La Garriga. Desde el 12 de agosto hay también autobuses complementarios entre La Garriga y Puigcerdà. Adif preveía mantener el corte entre Barcelona y La Garriga hasta enero de 2027. Mira los horarios en rodalies.gencat.cat antes de salir.",
  ],
  en: [
    "The R3 right now",
    "According to Rodalies' notice (last updated 6 July 2026 and still in force on 18 October), the R3 is running 50% of the trains it had before 20 January, and no trains run between Barcelona and La Garriga. Since 12 August there have also been complementary buses between La Garriga and Puigcerdà. Adif planned to keep the Barcelona–La Garriga line closed until January 2027. Check the timetables at rodalies.gencat.cat before you go.",
  ],
};

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
      title: "Cerdanya sense cotxe: què es pot fer realment amb tren i transport públic",
      seoTitle: "Cerdanya sense cotxe: tren R3, busos i què és realista",
      seoDescription:
        "Què es pot visitar de la Cerdanya sense cotxe: la línia R3, els busos regulars, Puigcerdà com a base i el Bus Blanc d'hivern.",
      excerpt:
        "Es pot anar a la Cerdanya sense cotxe, però cal planificar-ho diferent. Què sí és realista i què no.",
      blocks: [
        lead("Anar a la Cerdanya sense cotxe és possible, però cal planificar-la de manera diferent."),
        ...paras(
          "La línia **R3** de Rodalies és la que puja a la Cerdanya per Vic i Ripoll fins a Puigcerdà i la Tor de Querol. **Ara mateix, però, no hi ha trens entre Barcelona i la Garriga** per les obres d'Adif: el tram el cobreixen l'R4 fins a Montcada Bifurcació i autobusos de Rodalies, i els trens de l'R3 circulen entre la Garriga i Puigcerdà/la Tor de Querol amb la meitat de l'oferta habitual i més temps de viatge. També hi ha serveis regulars d'autobús des de Barcelona, la Seu d'Urgell i Lleida, i des de Girona via Olot i Ripoll.",
        ),
        callout("warning", ...CERDANYA_R3.ca),
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
          "Les darreres temporades el Consell Comarcal de la Cerdanya ha ofert el **Bus Blanc** cap a La Molina i Masella els caps de setmana i festius escolars de la temporada de neu. El servei de la temporada 2026-2027 encara no s'ha anunciat: comprova-ho abans de comptar-hi.",
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
        ...h2(
          "Núria, a la mateixa línia",
          "L'R3 que puja a la Cerdanya para també a **Ribes de Freser**, on enllaça amb el cremallera de la Vall de Núria. És de les poques escapades d'alta muntanya que es poden fer de punta a punta sense cotxe: a Núria no s'hi pot pujar per carretera.",
          "Combinar la Cerdanya i Núria en un mateix viatge és possible perquè comparteixen línia; només cal mirar els horaris de tots dos trens el dia que hi vagis.",
        ),
        ...paras(verifiedLine("ca", CERDANYA_VERIFIED)),
        ...b2Related(["nuria", "ripolles", "snow", "girona"], "ca"),
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
          "La línea **R3** de Rodalies es la que sube a la Cerdanya por Vic y Ripoll hasta Puigcerdà y La Tor de Querol. **Ahora mismo, sin embargo, no hay trenes entre Barcelona y La Garriga** por las obras de Adif: el tramo lo cubren la R4 hasta Montcada Bifurcació y autobuses de Rodalies, y los trenes de la R3 circulan entre La Garriga y Puigcerdà/La Tor de Querol con la mitad de la oferta habitual y más tiempo de viaje.",
        ),
        callout("warning", ...CERDANYA_R3.es),
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
          "Las últimas temporadas el Consell Comarcal de la Cerdanya ha ofrecido el **Bus Blanc** hacia La Molina y Masella los fines de semana y festivos escolares de la temporada de nieve. El servicio de la temporada 2026-2027 aún no se ha anunciado: compruébalo antes de contar con él.",
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
        ...h2(
          "Núria, en la misma línea",
          "La R3 que sube a la Cerdanya para también en **Ribes de Freser**, donde enlaza con el cremallera de la Vall de Núria. Es una de las pocas escapadas de alta montaña que se pueden hacer de punta a punta sin coche: a Núria no se puede subir por carretera.",
          "Combinar la Cerdanya y Núria en un mismo viaje es posible porque comparten línea; solo hay que mirar los horarios de los dos trenes el día que vayas.",
        ),
        ...paras(verifiedLine("es", CERDANYA_VERIFIED)),
        ...b2Related(["nuria", "ripolles", "snow", "girona"], "es"),
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
          "Rodalies line **R3** is the railway up to Cerdanya, via Vic and Ripoll to Puigcerdà and La Tor de Querol. **Right now, though, no trains run between Barcelona and La Garriga** because of Adif works: the R4 covers the stretch to Montcada Bifurcació and Rodalies buses the rest, and R3 trains run between La Garriga and Puigcerdà/La Tor de Querol at half the usual frequency and with longer journey times.",
        ),
        callout("warning", ...CERDANYA_R3.en),
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
          "In recent seasons the Cerdanya county council has run the **Bus Blanc** to La Molina and Masella at weekends and during school holidays in the snow season. The 2026-27 service has not been announced yet, so check before relying on it.",
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
        ...h2(
          "Núria, on the same line",
          "The R3 that runs up to Cerdanya also stops at **Ribes de Freser**, where it connects with the Vall de Núria rack railway. It is one of the few high-mountain trips you can do end to end without a car: there is no road up to Núria.",
          "Combining Cerdanya and Núria on one trip works because they share the line; just check both timetables for the day you travel.",
        ),
        ...paras(verifiedLine("en", CERDANYA_VERIFIED)),
        ...b2Related(["nuria", "ripolles", "snow", "girona"], "en"),
      ],
    },
  },
};
