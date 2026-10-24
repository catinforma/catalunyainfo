import type { Locale } from "@/lib/i18n/config";
import { link } from "@/lib/content/features/shared";

import {
  b2Related,
  callout,
  faq,
  h2,
  keyFacts,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Two day trips south of Barcelona by train: Sitges and Tarragona.
 *
 * Re-checked on 24 Oct 2026 for the page-1 push (Search Console: "barcelona
 * sitges tren", "tren sitges", "barcelona to sitges train" at positions
 * 15-26). Every train figure comes from the official Rodalies journey planner
 * (serveisgrs.rodalies.gencat.cat, the API behind rodalies.gencat.cat/horaris)
 * and Renfe's Cercanías planner for 27 Oct, 31 Oct and 1 Nov 2026, on the R2
 * timetable of 1 Sep 2026 and the R15 timetable of 13 Oct 2026:
 *
 * - Sants -> Sitges 31 or 37 min, at :06 :15 :36 :45; first 5:45, last 0:06.
 *   Passeig de Gràcia 38-44 min, Estació de França 49-55 min.
 * - Sitges -> Barcelona 35-41 min to Sants; first 4:51, last 22:22 every day.
 * - Fare: Sitges is in zone 4 of the Rodalies Barcelona zone map (Dec 2025);
 *   the "Només Rodalies" fare page gives 4 zones = 5,50 € single, return =
 *   double, Bonotren 10 viatges 4 zones = 35,80 €, monthly pass 20 €. The
 *   planner itself prices Sants -> Sitges at 5,50 €.
 * - Tarragona: R14-R17 from Sants at :03 and :33, 69 min (76 from Passeig de
 *   Gràcia, 87 from França), back at :26 and :56 in 71 min; 8,60 € single.
 *
 * Sights from museusdesitges.cat, sitgesanytime.com and tarragona.cat, all
 * read on 24 Oct 2026. The Tarragona open days changed since the first
 * version: the UNESCO-anniversary free days are 14, 15 and 28 November, and
 * the sites are closed on Sunday 29 November (general election).
 */

const VERIFIED = "2026-10-24";

const SITGES_SOURCES: B2Source[] = [
  { name: "Cercador d'horaris de Rodalies", url: "https://rodalies.gencat.cat/ca/horaris/", publisher: "Rodalies de Catalunya" },
  { name: "Horaris R2 (Rodalies de Catalunya)", url: "https://rodalies.gencat.cat/web/.content/02_Horaris/horaris/R2.pdf", publisher: "Rodalies de Catalunya" },
  { name: "Tarifes: només Rodalies (servei de rodalia de Barcelona)", url: "https://rodalies.gencat.cat/ca/tarifes/servei_rodalia_barcelona/nomes_rodalies/", publisher: "Rodalies de Catalunya" },
  { name: "Mapa de zones del servei de rodalia de Barcelona", url: "https://rodalies.gencat.cat/web/.content/00_home/04_mapes/mapa_rodalia_barcelona.pdf", publisher: "Rodalies de Catalunya" },
  { name: "Museus de Sitges — horaris", url: "https://museusdesitges.cat/ca/horaris", publisher: "Consorci del Patrimoni de Sitges" },
  { name: "Museus de Sitges — tarifes", url: "https://museusdesitges.cat/ca/tarifes", publisher: "Consorci del Patrimoni de Sitges" },
  { name: "Oficines de turisme de Sitges", url: "https://www.sitgesanytime.com/planifica/oficines-de-turisme/", publisher: "Ajuntament de Sitges" },
];

const TARRAGONA_SOURCES: B2Source[] = [
  { name: "Cercador d'horaris de Rodalies", url: "https://rodalies.gencat.cat/ca/horaris/", publisher: "Rodalies de Catalunya" },
  { name: "Horaris R15 (Rodalies de Catalunya)", url: "https://rodalies.gencat.cat/web/.content/02_Horaris/horaris/R15.pdf", publisher: "Rodalies de Catalunya" },
  { name: "Museu d'Història de Tarragona — preus", url: "https://www.tarragona.cat/patrimoni/museu-historia/visites/preus-i-venda-dentrades", publisher: "Ajuntament de Tarragona" },
  { name: "Museu d'Història de Tarragona — horaris", url: "https://www.tarragona.cat/patrimoni/museu-historia/visites/horaris", publisher: "Ajuntament de Tarragona" },
  { name: "Museu Arqueològic de Tàrraco", url: "https://www.mnat.cat/museu-arqueologic-de-tarraco/", publisher: "Museu Nacional Arqueològic de Tarragona" },
];

type Meta = { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string };

/* ========================================================================== */
/* Sitges                                                                     */
/* ========================================================================== */

const SITGES_META: Record<Locale, Meta> = {
  ca: {
    path: "escapades/sitges-des-de-barcelona-tren",
    title: "Tren de Barcelona a Sitges: horaris, preu, últim tren i què veure",
    seoTitle: "Tren de Barcelona a Sitges: horaris, preu i últim tren",
    seoDescription:
      "R2 Sud des de Sants, Passeig de Gràcia i França: 4 trens per hora, 31-37 min i 5,50 € el senzill. L'últim tren de tornada surt a les 22:22.",
    excerpt: "Horaris del tren de Barcelona a Sitges, quant costa el bitllet, l'últim tren de tornada i què veure a Sitges en un dia, amb dades oficials.",
  },
  es: {
    path: "escapadas/sitges-desde-barcelona-tren",
    title: "Tren de Barcelona a Sitges: horarios, precio, último tren y qué ver",
    seoTitle: "Tren de Barcelona a Sitges: horarios, precio y último tren",
    seoDescription:
      "R2 Sud desde Sants, Passeig de Gràcia y França: 4 trenes por hora, 31-37 min y 5,50 € el sencillo. El último tren de vuelta sale a las 22:22.",
    excerpt: "Horarios del tren de Barcelona a Sitges, cuánto cuesta el billete, el último tren de vuelta y qué ver en Sitges en un día, con datos oficiales.",
  },
  en: {
    path: "day-trips/sitges-from-barcelona-by-train",
    title: "Barcelona to Sitges by train: timetable, fares, last train and what to see",
    seoTitle: "Barcelona to Sitges train: times, fares and last train",
    seoDescription:
      "The R2 Sud from Sants, Passeig de Gràcia and França: 4 trains an hour, 31-37 min, €5.50 single. The last train back from Sitges leaves at 22:22.",
    excerpt: "Barcelona to Sitges train times, what the ticket costs, the last train back and what to see in Sitges in a day, from official sources.",
  },
};

type SitgesT = {
  lead: string;
  factsTitle: string; facts: { label: string; value: string }[];
  tableCaption: string; headers: string[]; rows: string[][]; tableNote: string;
  timesTitle: string; times: string[];
  fareTitle: string; fare: string[];
  stationsTitle: string; stations: string[];
  museumsTitle: string; museums: string[]; townTitle: string; town: string[];
  planTitle: string; plan: string[]; faq: { question: string; answer: string }[]; note: string;
  more: string;
};

const SITGES_COPY: Record<Locale, SitgesT> = {
  en: {
    lead: "The train from Barcelona to Sitges is the **Rodalies R2 Sud**. It leaves from Sants, Passeig de Gràcia and Estació de França about **four times an hour**, takes **31 to 37 minutes from Sants** and costs **€5.50 single** (€11 return). The **last train back** leaves Sitges at **22:22**, every day of the week.",
    factsTitle: "Barcelona–Sitges train at a glance",
    facts: [
      { label: "Line", value: "Rodalies R2 Sud (direction Sant Vicenç de Calders / Vilanova)" },
      { label: "Journey", value: "31–37 min from Sants" },
      { label: "Trains", value: "4 an hour in the daytime, every 30 min after 22:00" },
      { label: "Fare", value: "€5.50 single, €11 return (4 zones)" },
      { label: "Last train back", value: "22:22 from Sitges" },
    ],
    tableCaption: "Barcelona to Sitges on the R2 Sud",
    headers: ["From", "Journey time", "First train", "Last train", "Back from Sitges"],
    rows: [
      ["Barcelona-Sants", "31–37 min", "5:45", "0:06", "35–41 min"],
      ["Passeig de Gràcia", "38–44 min", "5:39", "0:00", "41–47 min"],
      ["Estació de França", "49–55 min", "5:28", "23:49", "52–58 min"],
    ],
    tableNote: "Official Rodalies journey planner for 27 and 31 October and 1 November 2026 (R2 timetable of 1 September 2026). The last train from Sitges to all three stations leaves at 22:22.",
    timesTitle: "Barcelona to Sitges train times",
    times: [
      "From Sants, trains to Sitges leave at **:06, :15, :36 and :45** past each hour from 6:36 to 21:45. The :06 and :36 trains are semi-fast (31 minutes); the :15 and :45 call at every station (37 minutes). After 22:06 there is one every half hour until the last at 0:06; the first of the day leaves at 5:45. Saturdays, Sundays and holidays follow the same pattern, minus a couple of early-morning trains.",
      "Coming back, there are also four trains an hour from Sitges to Barcelona, at about :15, :29, :45 and :59 until mid-afternoon and :15, :27, :45 and :57 from 15:45. The first leaves at 4:51 and **the last at 22:22**: there are later trains from Barcelona to Sitges, but none back after that, so plan dinner around it.",
    ],
    fareTitle: "How much is the train to Sitges?",
    fare: [
      "Sitges is in **zone 4** of the Rodalies Barcelona fare map, so a trip from any Barcelona station costs **€5.50 single** and **€11 return** (a return is simply two singles). A single is valid for two hours after you validate it.",
      "If you go often: a **Bonotren 10-trip** ticket for 4 zones costs €35.80, is valid for a year and can be shared by people making the same journey; Rodalies' **€20 monthly pass** gives unlimited travel on a Renfe&Tu card and is on sale until 31 December 2026. Children under 4 travel free if they do not take a seat, and the Targeta Daurada (over-60s and some disability cards) takes 40% off singles and returns.",
      "Buy at the machines in the station or in the Renfe or Rodalies app before boarding.",
    ],
    stationsTitle: "Stations: where to catch it and where it leaves you",
    stations: [
      "In Barcelona the R2 Sud stops at **Estació de França, Passeig de Gràcia and Sants**; Sants is the quickest. Not every R2 train goes that far: some end at Castelldefels, so check that Sitges is on the departure board.",
      "Only the R2 Sud stops at Sitges. The regional trains R15, R16 and R17 also leave Sants southbound and stop at Vilanova i la Geltrú, but run through Sitges without stopping. Sitges station is in town: the tourist office is right next to it at Plaça Eduard Maristany 2, and the old town and the beach are downhill from there.",
    ],
    museumsTitle: "Cau Ferrat and Maricel",
    museums: [
      "The **Museu del Cau Ferrat**, the painter Santiago Rusiñol's home and studio, and the **Museu de Maricel** next door share one ticket: **€12** (€8 reduced), or €17 adding the Fundació Stämpfli. Under-17s go free, and everyone gets in free on the **first Wednesday of each month**.",
      "From November to March they open Tuesday to Sunday 10:00–17:00; from April to October, 10:00–19:00. Both close on Mondays, on 25 and 26 December and on 1 and 6 January, and open only 10:00–14:00 on 24 and 31 December.",
    ],
    townTitle: "The town",
    town: [
      "The parish church of Sant Bartomeu i Santa Tecla stands on the headland between the Platja de la Fragata and the old town, and the museums are on Carrer de Fonollar just behind it. In winter the tourist office by the station opens Monday to Saturday 10:00–14:00 and 15:00–18:00, and Sundays and holidays 10:00–14:00.",
    ],
    planTitle: "A day in Sitges",
    plan: [
      "**Morning:** a semi-fast train from Sants (:06 or :36), then down to the seafront and the church.",
      "**Midday:** Cau Ferrat and Maricel (closed Mondays).",
      "**Afternoon:** beach or the promenade, and a train back before 22:22.",
    ],
    faq: [
      { question: "How long is the train from Barcelona to Sitges?", answer: "31 to 37 minutes from Barcelona-Sants, 38 to 44 from Passeig de Gràcia and 49 to 55 from Estació de França, on the R2 Sud." },
      { question: "How much is the train from Barcelona to Sitges?", answer: "€5.50 single and €11 return: Sitges is in zone 4 of the Rodalies Barcelona fare map." },
      { question: "When is the last train from Sitges to Barcelona?", answer: "22:22, every day, on the timetable in force since 1 September 2026. The last train from Sants to Sitges leaves later, at 0:06." },
      { question: "How often do trains run from Barcelona to Sitges?", answer: "Four an hour during the day (at :06, :15, :36 and :45 from Sants), and every half hour after 22:00." },
      { question: "Which station does the Sitges train leave from?", answer: "Sants, Passeig de Gràcia or Estació de França, on the R2 Sud. The regional trains from Sants do not stop at Sitges." },
      { question: "Are the Sitges museums free?", answer: "On the first Wednesday of every month, and always for under-17s. Otherwise the Cau Ferrat and Maricel ticket costs €12." },
    ],
    note: "Rodalies can change services for works or incidents: check the Rodalies app on the day.",
    more: `More train trips from Barcelona: ${link("trains", "en", "12 day trips from Barcelona by train")}.`,
  },
  es: {
    lead: "El tren de Barcelona a Sitges es la **R2 Sud de Rodalies**. Sale de Sants, Passeig de Gràcia y Estació de França unas **cuatro veces por hora**, tarda **de 31 a 37 minutos desde Sants** y el billete cuesta **5,50 € el sencillo** (11 € ida y vuelta). El **último tren de vuelta** sale de Sitges a las **22:22**, todos los días de la semana.",
    factsTitle: "El tren Barcelona–Sitges, en resumen",
    facts: [
      { label: "Línea", value: "Rodalies R2 Sud (dirección Sant Vicenç de Calders / Vilanova)" },
      { label: "Duración", value: "31–37 min desde Sants" },
      { label: "Frecuencia", value: "4 trenes por hora de día, cada 30 min a partir de las 22:00" },
      { label: "Precio", value: "5,50 € sencillo, 11 € ida y vuelta (4 zonas)" },
      { label: "Último tren de vuelta", value: "22:22 desde Sitges" },
    ],
    tableCaption: "De Barcelona a Sitges en la R2 Sud",
    headers: ["Desde", "Duración", "Primer tren", "Último tren", "Vuelta desde Sitges"],
    rows: [
      ["Barcelona-Sants", "31–37 min", "5:45", "0:06", "35–41 min"],
      ["Passeig de Gràcia", "38–44 min", "5:39", "0:00", "41–47 min"],
      ["Estació de França", "49–55 min", "5:28", "23:49", "52–58 min"],
    ],
    tableNote: "Planificador oficial de Rodalies para el 27 y el 31 de octubre y el 1 de noviembre de 2026 (horario de la R2 del 1 de septiembre de 2026). El último tren de Sitges hacia las tres estaciones sale a las 22:22.",
    timesTitle: "Horarios del tren de Barcelona a Sitges",
    times: [
      "Desde Sants salen trenes a Sitges a los minutos **:06, :15, :36 y :45** de cada hora, de 6:36 a 21:45. Los de :06 y :36 son semidirectos (31 minutos); los de :15 y :45 paran en todas las estaciones (37 minutos). A partir de las 22:06 hay uno cada media hora hasta el último, a las 0:06; el primero del día sale a las 5:45. Sábados, domingos y festivos siguen el mismo patrón, con algún tren menos a primera hora.",
      "De vuelta también hay cuatro trenes por hora de Sitges a Barcelona, hacia :15, :29, :45 y :59 hasta media tarde y :15, :27, :45 y :57 a partir de las 15:45. El primero sale a las 4:51 y **el último a las 22:22**: de Barcelona a Sitges hay trenes más tarde, pero de vuelta ya no, así que organiza la cena en función de eso.",
    ],
    fareTitle: "¿Cuánto cuesta el tren a Sitges?",
    fare: [
      "Sitges está en la **zona 4** del mapa de tarifas de Rodalies de Barcelona, así que un viaje desde cualquier estación de Barcelona cuesta **5,50 € el sencillo** y **11 € ida y vuelta** (la ida y vuelta es el doble del sencillo). El sencillo vale durante las dos horas siguientes a la validación.",
      "Si vas a menudo: el **Bonotren 10 viajes** de 4 zonas cuesta 35,80 €, vale un año y lo pueden usar varias personas con el mismo origen y destino; el **abono mensual de Rodalies de 20 €** da viajes ilimitados en la tarjeta Renfe&Tu y se vende hasta el 31 de diciembre de 2026. Los menores de 4 años viajan gratis si no ocupan asiento, y la Tarjeta Dorada (mayores de 60 y algunas discapacidades) descuenta un 40 % en sencillos e idas y vueltas.",
      "Compra en las máquinas de la estación o en la app de Renfe o de Rodalies antes de subir.",
    ],
    stationsTitle: "Estaciones: dónde coger el tren y dónde te deja",
    stations: [
      "En Barcelona la R2 Sud para en **Estació de França, Passeig de Gràcia y Sants**; desde Sants es más rápido. No todos los trenes R2 llegan tan lejos: algunos terminan en Castelldefels, así que comprueba que Sitges aparece en el panel de salidas.",
      "Solo la R2 Sud para en Sitges. Los regionales R15, R16 y R17 también salen de Sants hacia el sur y paran en Vilanova i la Geltrú, pero pasan por Sitges sin parar. La estación de Sitges está en el pueblo: la oficina de turismo está justo al lado, en la plaza Eduard Maristany, 2, y el casco antiguo y la playa quedan cuesta abajo.",
    ],
    museumsTitle: "Cau Ferrat y Maricel",
    museums: [
      "El **Museu del Cau Ferrat**, la casa-taller del pintor Santiago Rusiñol, y el **Museu de Maricel**, al lado, comparten entrada: **12 €** (8 € reducida), o 17 € con la Fundació Stämpfli. Los menores de 17 entran gratis, y todo el mundo el **primer miércoles de cada mes**.",
      "De noviembre a marzo abren de martes a domingo de 10:00 a 17:00; de abril a octubre, de 10:00 a 19:00. Los dos cierran los lunes, el 25 y el 26 de diciembre y el 1 y el 6 de enero, y el 24 y el 31 de diciembre abren solo de 10:00 a 14:00.",
    ],
    townTitle: "El pueblo",
    town: [
      "La iglesia parroquial de Sant Bartomeu i Santa Tecla se alza en el promontorio entre la playa de la Fragata y el casco antiguo, y los museos están en la calle Fonollar, justo detrás. En invierno la oficina de turismo de la estación abre de lunes a sábado de 10:00 a 14:00 y de 15:00 a 18:00, y domingos y festivos de 10:00 a 14:00.",
    ],
    planTitle: "Un día en Sitges",
    plan: [
      "**Mañana:** un semidirecto desde Sants (a :06 o :36) y bajada al paseo marítimo y la iglesia.",
      "**Mediodía:** Cau Ferrat y Maricel (cerrados los lunes).",
      "**Tarde:** playa o paseo, y tren de vuelta antes de las 22:22.",
    ],
    faq: [
      { question: "¿Cuánto tarda el tren de Barcelona a Sitges?", answer: "De 31 a 37 minutos desde Barcelona-Sants, de 38 a 44 desde Passeig de Gràcia y de 49 a 55 desde Estació de França, en la R2 Sud." },
      { question: "¿Cuánto cuesta el tren de Barcelona a Sitges?", answer: "5,50 € el sencillo y 11 € ida y vuelta: Sitges está en la zona 4 del mapa de tarifas de Rodalies de Barcelona." },
      { question: "¿A qué hora sale el último tren de Sitges a Barcelona?", answer: "A las 22:22, todos los días, según el horario vigente desde el 1 de septiembre de 2026. El último de Sants a Sitges sale más tarde, a las 0:06." },
      { question: "¿Cada cuánto pasa el tren de Barcelona a Sitges?", answer: "Cuatro por hora durante el día (a :06, :15, :36 y :45 desde Sants) y cada media hora a partir de las 22:00." },
      { question: "¿Desde qué estación sale el tren a Sitges?", answer: "Desde Sants, Passeig de Gràcia o Estació de França, en la R2 Sud. Los regionales que salen de Sants no paran en Sitges." },
      { question: "¿Los museos de Sitges son gratis?", answer: "El primer miércoles de cada mes, y siempre para menores de 17. Si no, la entrada al Cau Ferrat y Maricel cuesta 12 €." },
    ],
    note: "Rodalies puede cambiar el servicio por obras o incidencias: mira la app de Rodalies el mismo día.",
    more: `Más escapadas en tren desde Barcelona: ${link("trains", "es", "12 escapadas por Cataluña que puedes hacer en tren")}.`,
  },
  ca: {
    lead: "El tren de Barcelona a Sitges és l'**R2 Sud de Rodalies**. Surt de Sants, Passeig de Gràcia i l'Estació de França unes **quatre vegades per hora**, triga **de 31 a 37 minuts des de Sants** i el bitllet costa **5,50 € el senzill** (11 € anada i tornada). L'**últim tren de tornada** surt de Sitges a les **22:22**, tots els dies de la setmana.",
    factsTitle: "El tren Barcelona–Sitges, en resum",
    facts: [
      { label: "Línia", value: "Rodalies R2 Sud (direcció Sant Vicenç de Calders / Vilanova)" },
      { label: "Durada", value: "31–37 min des de Sants" },
      { label: "Freqüència", value: "4 trens per hora de dia, cada 30 min a partir de les 22:00" },
      { label: "Preu", value: "5,50 € senzill, 11 € anada i tornada (4 zones)" },
      { label: "Últim tren de tornada", value: "22:22 des de Sitges" },
    ],
    tableCaption: "De Barcelona a Sitges amb l'R2 Sud",
    headers: ["Des de", "Durada", "Primer tren", "Últim tren", "Tornada des de Sitges"],
    rows: [
      ["Barcelona-Sants", "31–37 min", "5:45", "0:06", "35–41 min"],
      ["Passeig de Gràcia", "38–44 min", "5:39", "0:00", "41–47 min"],
      ["Estació de França", "49–55 min", "5:28", "23:49", "52–58 min"],
    ],
    tableNote: "Cercador oficial de Rodalies per al 27 i el 31 d'octubre i l'1 de novembre de 2026 (horari de l'R2 de l'1 de setembre de 2026). L'últim tren de Sitges cap a les tres estacions surt a les 22:22.",
    timesTitle: "Horaris del tren de Barcelona a Sitges",
    times: [
      "Des de Sants surten trens cap a Sitges als minuts **:06, :15, :36 i :45** de cada hora, de 6:36 a 21:45. Els de :06 i :36 són semidirectes (31 minuts); els de :15 i :45 paren a totes les estacions (37 minuts). A partir de les 22:06 n'hi ha un cada mitja hora fins a l'últim, a les 0:06; el primer del dia surt a les 5:45. Dissabtes, diumenges i festius segueixen el mateix patró, amb algun tren menys a primera hora.",
      "De tornada també hi ha quatre trens per hora de Sitges a Barcelona, cap a :15, :29, :45 i :59 fins a mitja tarda i :15, :27, :45 i :57 a partir de les 15:45. El primer surt a les 4:51 i **l'últim a les 22:22**: de Barcelona a Sitges hi ha trens més tard, però de tornada ja no, així que organitza el sopar en funció d'això.",
    ],
    fareTitle: "Quant costa el tren a Sitges?",
    fare: [
      "Sitges és a la **zona 4** del mapa de tarifes de Rodalies de Barcelona, així que un viatge des de qualsevol estació de Barcelona costa **5,50 € el senzill** i **11 € anada i tornada** (l'anada i tornada és el doble del senzill). El senzill val durant les dues hores següents a la validació.",
      "Si hi vas sovint: el **Bonotren 10 viatges** de 4 zones costa 35,80 €, val un any i el poden fer servir diverses persones amb el mateix origen i destinació; l'**abonament mensual de Rodalies de 20 €** dona viatges il·limitats a la targeta Renfe&Tu i es ven fins al 31 de desembre de 2026. Els menors de 4 anys viatgen gratis si no ocupen seient, i la Targeta Daurada (majors de 60 i algunes discapacitats) descompta un 40 % en senzills i anades i tornades.",
      "Compra a les màquines de l'estació o a l'app de Renfe o de Rodalies abans de pujar.",
    ],
    stationsTitle: "Estacions: on agafar el tren i on et deixa",
    stations: [
      "A Barcelona l'R2 Sud para a l'**Estació de França, Passeig de Gràcia i Sants**; des de Sants és més ràpid. No tots els trens R2 arriben tan lluny: alguns acaben a Castelldefels, així que comprova que Sitges surt al panell de sortides.",
      "Només l'R2 Sud para a Sitges. Els regionals R15, R16 i R17 també surten de Sants cap al sud i paren a Vilanova i la Geltrú, però passen per Sitges sense parar. L'estació de Sitges és al poble: l'oficina de turisme és just al costat, a la plaça Eduard Maristany, 2, i el nucli antic i la platja queden baixada avall.",
    ],
    museumsTitle: "Cau Ferrat i Maricel",
    museums: [
      "El **Museu del Cau Ferrat**, la casa-taller del pintor Santiago Rusiñol, i el **Museu de Maricel**, al costat, comparteixen entrada: **12 €** (8 € reduïda), o 17 € amb la Fundació Stämpfli. Els menors de 17 hi entren gratis, i tothom el **primer dimecres de cada mes**.",
      "De novembre a març obren de dimarts a diumenge de 10:00 a 17:00; d'abril a octubre, de 10:00 a 19:00. Tots dos tanquen els dilluns, el 25 i el 26 de desembre i l'1 i el 6 de gener, i el 24 i el 31 de desembre obren només de 10:00 a 14:00.",
    ],
    townTitle: "El poble",
    town: [
      "L'església parroquial de Sant Bartomeu i Santa Tecla s'alça al promontori entre la platja de la Fragata i el nucli antic, i els museus són al carrer de Fonollar, just al darrere. A l'hivern l'oficina de turisme de l'estació obre de dilluns a dissabte de 10:00 a 14:00 i de 15:00 a 18:00, i diumenges i festius de 10:00 a 14:00.",
    ],
    planTitle: "Un dia a Sitges",
    plan: [
      "**Matí:** un semidirecte des de Sants (a :06 o :36) i baixada al passeig marítim i l'església.",
      "**Migdia:** Cau Ferrat i Maricel (tancats els dilluns).",
      "**Tarda:** platja o passeig, i tren de tornada abans de les 22:22.",
    ],
    faq: [
      { question: "Quant triga el tren de Barcelona a Sitges?", answer: "De 31 a 37 minuts des de Barcelona-Sants, de 38 a 44 des de Passeig de Gràcia i de 49 a 55 des de l'Estació de França, amb l'R2 Sud." },
      { question: "Quant costa el tren de Barcelona a Sitges?", answer: "5,50 € el senzill i 11 € anada i tornada: Sitges és a la zona 4 del mapa de tarifes de Rodalies de Barcelona." },
      { question: "A quina hora surt l'últim tren de Sitges a Barcelona?", answer: "A les 22:22, cada dia, segons l'horari vigent des de l'1 de setembre de 2026. L'últim de Sants a Sitges surt més tard, a les 0:06." },
      { question: "Cada quant passa el tren de Barcelona a Sitges?", answer: "Quatre per hora durant el dia (a :06, :15, :36 i :45 des de Sants) i cada mitja hora a partir de les 22:00." },
      { question: "Des de quina estació surt el tren a Sitges?", answer: "Des de Sants, Passeig de Gràcia o l'Estació de França, amb l'R2 Sud. Els regionals que surten de Sants no paren a Sitges." },
      { question: "Els museus de Sitges són gratis?", answer: "El primer dimecres de cada mes, i sempre per als menors de 17. Si no, l'entrada al Cau Ferrat i Maricel costa 12 €." },
    ],
    note: "Rodalies pot canviar el servei per obres o incidències: mira l'app de Rodalies el mateix dia.",
    more: `Més escapades en tren des de Barcelona: ${link("trains", "ca", "12 escapades per Catalunya que pots fer en tren")}.`,
  },
};

function sitgesBody(locale: Locale) {
  const t = SITGES_COPY[locale];
  return [
    lead(t.lead),
    keyFacts(t.factsTitle, t.facts),
    table(t.tableCaption, t.headers, t.rows, t.tableNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.timesTitle, ...t.times),
    ...h2(t.fareTitle, ...t.fare),
    ...h2(t.stationsTitle, ...t.stations),
    ...h2(t.museumsTitle, ...t.museums),
    ...h2(t.townTitle, ...t.town),
    ...h2(t.planTitle),
    list(...t.plan),
    faq(t.faq),
    ...paras(t.more),
    ...b2Related(["tarragona", "girona", "figueres", "montserratFree"], locale),
  ];
}

export const SITGES: B2Article = {
  key: "sitges",
  entryKey: "daytrip-sitges-from-barcelona",
  categoryKey: "coast",
  sources: SITGES_SOURCES,
  heroKey: "sitges-platja-fragata-esglesia",
  heroAlt: {
    ca: "La platja de la Fragata de Sitges amb palmeres i l'església de Sant Bartomeu i Santa Tecla al fons",
    es: "La playa de la Fragata de Sitges con palmeras y la iglesia de Sant Bartomeu i Santa Tecla al fondo",
    en: "Sitges' Platja de la Fragata with palm trees and the church of Sant Bartomeu i Santa Tecla behind",
  },
  heroCaption: {
    ca: "La platja de la Fragata i l'església, a poca distància a peu de l'estació.",
    es: "La playa de la Fragata y la iglesia, a poca distancia a pie de la estación.",
    en: "Platja de la Fragata and the church, a short walk from the station.",
  },
  secondaryKey: "sitges-cau-ferrat-facana",
  secondaryAlt: {
    ca: "La façana del Cau Ferrat al carrer de Fonollar de Sitges",
    es: "La fachada del Cau Ferrat en la calle Fonollar de Sitges",
    en: "The front of the Cau Ferrat on Carrer de Fonollar in Sitges",
  },
  secondaryCaption: {
    ca: "El Cau Ferrat, casa-taller de Santiago Rusiñol.",
    es: "El Cau Ferrat, casa-taller de Santiago Rusiñol.",
    en: "The Cau Ferrat, Santiago Rusiñol's home and studio.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T22:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...SITGES_META[locale], blocks: sitgesBody(locale) }]),
  ) as B2Article["editions"],
};

/* ========================================================================== */
/* Tarragona                                                                  */
/* ========================================================================== */

const TARRAGONA_META: Record<Locale, Meta> = {
  ca: {
    path: "escapades/tarragona-des-de-barcelona-tren",
    title: "Tarragona des de Barcelona en tren: horaris, preu i la Tàrraco romana en un dia",
    seoTitle: "Tarragona des de Barcelona en tren: horaris, preu i Tàrraco",
    seoDescription:
      "Regionals de Sants a Tarragona en 69 minuts, dos per hora, 8,60 € el senzill. Entrada conjunta als cinc recintes romans per 15 €, horaris i dies gratis.",
    excerpt: "Com anar a Tarragona en tren des de Barcelona i veure la Tàrraco romana en un dia: horaris, preu del bitllet, entrada conjunta i dies de portes obertes.",
  },
  es: {
    path: "escapadas/tarragona-desde-barcelona-tren",
    title: "Tarragona desde Barcelona en tren: horarios, precio y la Tarraco romana en un día",
    seoTitle: "Tren Barcelona–Tarragona: horarios, precio y Tarraco en un día",
    seoDescription:
      "Regionales de Sants a Tarragona en 69 minutos, dos por hora, 8,60 € el sencillo. Entrada conjunta a los cinco recintos romanos: 15 €. Horarios y días gratis.",
    excerpt: "Cómo ir a Tarragona en tren desde Barcelona y ver la Tarraco romana en un día: horarios, precio del billete, entrada conjunta y jornadas de puertas abiertas.",
  },
  en: {
    path: "day-trips/tarragona-from-barcelona-by-train",
    title: "Tarragona from Barcelona by train: times, fares and Roman Tarraco in a day",
    seoTitle: "Barcelona to Tarragona train: times, fares, Roman sites",
    seoDescription:
      "Regional trains from Sants reach Tarragona in 69 minutes, twice an hour, €8.60 single. A €15 combined ticket covers all five Roman sites. Hours, free days.",
    excerpt: "How to reach Tarragona by train from Barcelona and see Roman Tarraco in a day: train times, fares, the combined ticket and free open days.",
  },
};

type TarragonaT = {
  lead: string; trainTitle: string; train: string[];
  trainCaption: string; trainHeaders: string[]; trainRows: string[][]; trainNote: string;
  sitesTitle: string; sites: string[];
  tableCaption: string; headers: string[]; rows: string[][]; tableNote: string;
  freeTitle: string; free: string; mnatTitle: string; mnat: string;
  planTitle: string; plan: string[]; faq: { question: string; answer: string }[]; note: string;
};

const TARRAGONA_COPY: Record<Locale, TarragonaT> = {
  en: {
    lead: "The train from Barcelona to Tarragona takes **69 minutes from Sants**, with a regional train at **:03 and :33 past the hour** and a **€8.60 single**. Tarragona was Tarraco, capital of Roman Hispania Citerior: its amphitheatre, circus, walls and forum are a UNESCO World Heritage site, and a **€15 combined ticket** opens all five Roman sites.",
    trainTitle: "Barcelona to Tarragona train times",
    train: [
      "The regional lines **R14, R15, R16 and R17** all run from Estació de França, Passeig de Gràcia and Sants to Tarragona station, in the city by the sea. On weekdays there are 32 trains from Sants, from 6:03 to 22:03; on Saturdays about 26. Back, trains leave Tarragona at about :26 and :56 past the hour, the last at 22:26 on weekdays and 21:56 at weekends.",
      "Do not confuse it with **Camp de Tarragona**, the high-speed station outside the city. The commuter R2 Sud ends at Sant Vicenç de Calders and does not reach Tarragona. Buy at the machine or in the Renfe app: the regional single from Barcelona costs €8.60.",
    ],
    trainCaption: "Barcelona to Tarragona by regional train",
    trainHeaders: ["From", "Journey", "Departures", "Single fare"],
    trainRows: [
      ["Barcelona-Sants", "69 min", ":03 and :33, 6:03–22:03", "€8.60"],
      ["Passeig de Gràcia", "76 min", "7 minutes before Sants", "€8.60"],
      ["Estació de França", "87 min", "18 minutes before Sants", "€8.60"],
      ["Back from Tarragona to Sants", "71 min", ":26 and :56, last 22:26 (21:56 at weekends)", "€8.60"],
    ],
    trainNote: "Official Rodalies journey planner for 27 and 31 October and 1 November 2026 (R15 timetable of 13 October 2026). A few hours have only one train.",
    sitesTitle: "The Roman sites and the combined ticket",
    sites: [
      "The city's history museum runs five Roman sites: the **Amphitheatre**, the **Circus with the Praetorium**, the **Archaeological Promenade** along the walls, the **Colonial Forum** and **Casa Canals**. A single site costs **€5**; the **combined ticket for all five costs €15**. Under-12s go free; ages 12 to 17, students and retired people pay half; a large family pays one ticket for everyone.",
    ],
    tableCaption: "Opening hours from 27 October to 31 March",
    headers: ["Site", "Tuesday to Friday", "Saturday", "Sunday and holidays"],
    rows: [
      ["Amphitheatre, Archaeological Promenade, Colonial Forum", "9:00–18:30", "9:30–18:30", "9:30–14:30"],
      ["Circus–Praetorium, Casa Canals", "9:00–20:00", "9:30–20:00", "9:30–14:30"],
    ],
    tableNote: "All closed on Mondays except scheduled holidays. Last entry 30 minutes before closing. Closed on 29 November, 24, 25, 26 and 31 December and 1 and 6 January; mornings only on 8 December.",
    freeTitle: "Free days",
    free: "The Roman sites are free on the **last Tuesday of every month**, and on **14, 15 and 28 November** for the anniversary of the UNESCO listing. The Roman aqueduct (Pont del Diable), outside the centre, is always free.",
    mnatTitle: "The archaeological museum",
    mnat: "The Museu Nacional Arqueològic de Tarragona on Plaça del Rei is **closed for renovation**; the museum plans to reopen it in the last quarter of 2026. Check mnat.cat before planning around it.",
    planTitle: "A day in Tarragona",
    plan: [
      "**Morning:** train to Tarragona and up to the Amphitheatre, above the beach.",
      "**Midday:** the Circus and Praetorium, then lunch in the Part Alta, the old town.",
      "**Afternoon:** the Archaeological Promenade along the Roman walls; in winter it closes at 18:30.",
    ],
    faq: [
      { question: "How long is the train from Barcelona to Tarragona?", answer: "69 minutes from Barcelona-Sants on the regional trains R14 to R17, 76 from Passeig de Gràcia and 87 from Estació de França." },
      { question: "How much is the train from Barcelona to Tarragona?", answer: "€8.60 single on the regional trains, according to the official Rodalies planner in October 2026." },
      { question: "Is there a combined ticket for Tarragona's Roman sites?", answer: "Yes: €15 for all five (Amphitheatre, Circus–Praetorium, Archaeological Promenade, Colonial Forum and Casa Canals), or €5 for one. Under-12s free." },
      { question: "When are Tarragona's Roman sites free?", answer: "On the last Tuesday of every month, and on 14, 15 and 28 November 2026 for the UNESCO anniversary." },
      { question: "Is the Tarragona archaeological museum open?", answer: "Not as of October 2026: it is closed for renovation, with reopening planned for the last quarter of 2026." },
    ],
    note: "Train times and site hours change by season: check Rodalies and the city museum before you go.",
  },
  es: {
    lead: "El tren de Barcelona a Tarragona tarda **69 minutos desde Sants**, con un regional a **los minutos :03 y :33 de cada hora** y un **sencillo de 8,60 €**. Tarragona fue Tarraco, capital de la Hispania Citerior romana: su anfiteatro, circo, murallas y foro son Patrimonio Mundial de la UNESCO, y una **entrada conjunta de 15 €** abre los cinco recintos romanos.",
    trainTitle: "Horarios del tren de Barcelona a Tarragona",
    train: [
      "Las líneas regionales **R14, R15, R16 y R17** van de Estació de França, Passeig de Gràcia y Sants a la estación de Tarragona, en la ciudad, junto al mar. Los laborables hay 32 trenes desde Sants, de 6:03 a 22:03; los sábados, unos 26. De vuelta salen de Tarragona hacia las :26 y las :56 de cada hora, el último a las 22:26 los laborables y a las 21:56 los fines de semana.",
      "No la confundas con **Camp de Tarragona**, la estación de alta velocidad fuera de la ciudad. La R2 Sud termina en Sant Vicenç de Calders y no llega a Tarragona. Compra en la máquina o en la app de Renfe: el sencillo regional desde Barcelona cuesta 8,60 €.",
    ],
    trainCaption: "De Barcelona a Tarragona en tren regional",
    trainHeaders: ["Desde", "Duración", "Salidas", "Sencillo"],
    trainRows: [
      ["Barcelona-Sants", "69 min", ":03 y :33, de 6:03 a 22:03", "8,60 €"],
      ["Passeig de Gràcia", "76 min", "7 minutos antes que de Sants", "8,60 €"],
      ["Estació de França", "87 min", "18 minutos antes que de Sants", "8,60 €"],
      ["Vuelta de Tarragona a Sants", "71 min", ":26 y :56, último 22:26 (21:56 fines de semana)", "8,60 €"],
    ],
    trainNote: "Planificador oficial de Rodalies para el 27 y el 31 de octubre y el 1 de noviembre de 2026 (horario de la R15 del 13 de octubre de 2026). Algunas horas tienen un solo tren.",
    sitesTitle: "Los recintos romanos y la entrada conjunta",
    sites: [
      "El museo de historia de la ciudad gestiona cinco recintos romanos: el **Anfiteatro**, el **Circo con el Pretorio**, el **Paseo Arqueológico** junto a las murallas, el **Foro de la Colonia** y la **Casa Canals**. Un recinto cuesta **5 €**; la **entrada conjunta a los cinco, 15 €**. Los menores de 12 entran gratis; de 12 a 17 años, estudiantes y jubilados pagan la mitad; una familia numerosa paga una sola entrada para todos.",
    ],
    tableCaption: "Horario del 27 de octubre al 31 de marzo",
    headers: ["Recinto", "Martes a viernes", "Sábado", "Domingo y festivos"],
    rows: [
      ["Anfiteatro, Paseo Arqueológico, Foro de la Colonia", "9:00–18:30", "9:30–18:30", "9:30–14:30"],
      ["Circo–Pretorio, Casa Canals", "9:00–20:00", "9:30–20:00", "9:30–14:30"],
    ],
    tableNote: "Todos cierran los lunes salvo festivos programados. Último acceso 30 minutos antes del cierre. Cerrados el 29 de noviembre, el 24, 25, 26 y 31 de diciembre y el 1 y 6 de enero; el 8 de diciembre, solo por la mañana.",
    freeTitle: "Días gratis",
    free: "Los recintos romanos son gratuitos el **último martes de cada mes** y el **14, 15 y 28 de noviembre** por el aniversario de la declaración de la UNESCO. El acueducto romano (Pont del Diable), fuera del centro, es siempre gratuito.",
    mnatTitle: "El museo arqueológico",
    mnat: "El Museu Nacional Arqueològic de Tarragona de la plaza del Rei está **cerrado por renovación**; el museo prevé reabrirlo en el último trimestre de 2026. Consulta mnat.cat antes de contar con él.",
    planTitle: "Un día en Tarragona",
    plan: [
      "**Mañana:** tren a Tarragona y subida al Anfiteatro, sobre la playa.",
      "**Mediodía:** el Circo y el Pretorio, y comida en la Part Alta, el casco antiguo.",
      "**Tarde:** el Paseo Arqueológico junto a las murallas romanas; en invierno cierra a las 18:30.",
    ],
    faq: [
      { question: "¿Cuánto tarda el tren de Barcelona a Tarragona?", answer: "69 minutos desde Barcelona-Sants en los regionales R14 a R17, 76 desde Passeig de Gràcia y 87 desde Estació de França." },
      { question: "¿Cuánto cuesta el tren de Barcelona a Tarragona?", answer: "8,60 € el sencillo en los regionales, según el planificador oficial de Rodalies en octubre de 2026." },
      { question: "¿Hay entrada conjunta para los recintos romanos de Tarragona?", answer: "Sí: 15 € los cinco (Anfiteatro, Circo–Pretorio, Paseo Arqueológico, Foro de la Colonia y Casa Canals), o 5 € uno. Menores de 12, gratis." },
      { question: "¿Cuándo son gratis los recintos romanos de Tarragona?", answer: "El último martes de cada mes, y el 14, 15 y 28 de noviembre de 2026 por el aniversario de la UNESCO." },
      { question: "¿Está abierto el museo arqueológico de Tarragona?", answer: "No a octubre de 2026: está cerrado por renovación y prevé reabrir en el último trimestre de 2026." },
    ],
    note: "Los horarios de tren y de los recintos cambian según la temporada: compruébalo en Rodalies y en el museo antes de ir.",
  },
  ca: {
    lead: "El tren de Barcelona a Tarragona triga **69 minuts des de Sants**, amb un regional **als minuts :03 i :33 de cada hora** i un **senzill de 8,60 €**. Tarragona va ser Tàrraco, capital de la Hispània Citerior romana: l'amfiteatre, el circ, les muralles i el fòrum són Patrimoni Mundial de la UNESCO, i una **entrada conjunta de 15 €** obre els cinc recintes romans.",
    trainTitle: "Horaris del tren de Barcelona a Tarragona",
    train: [
      "Les línies regionals **R14, R15, R16 i R17** van de l'Estació de França, Passeig de Gràcia i Sants a l'estació de Tarragona, a la ciutat, arran de mar. Els feiners hi ha 32 trens des de Sants, de 6:03 a 22:03; els dissabtes, uns 26. De tornada surten de Tarragona cap a les :26 i les :56 de cada hora, l'últim a les 22:26 els feiners i a les 21:56 els caps de setmana.",
      "No la confonguis amb **Camp de Tarragona**, l'estació d'alta velocitat fora de la ciutat. L'R2 Sud acaba a Sant Vicenç de Calders i no arriba a Tarragona. Compra a la màquina o a l'app de Renfe: el senzill regional des de Barcelona costa 8,60 €.",
    ],
    trainCaption: "De Barcelona a Tarragona en tren regional",
    trainHeaders: ["Des de", "Durada", "Sortides", "Senzill"],
    trainRows: [
      ["Barcelona-Sants", "69 min", ":03 i :33, de 6:03 a 22:03", "8,60 €"],
      ["Passeig de Gràcia", "76 min", "7 minuts abans que de Sants", "8,60 €"],
      ["Estació de França", "87 min", "18 minuts abans que de Sants", "8,60 €"],
      ["Tornada de Tarragona a Sants", "71 min", ":26 i :56, últim 22:26 (21:56 caps de setmana)", "8,60 €"],
    ],
    trainNote: "Cercador oficial de Rodalies per al 27 i el 31 d'octubre i l'1 de novembre de 2026 (horari de l'R15 del 13 d'octubre de 2026). Algunes hores només tenen un tren.",
    sitesTitle: "Els recintes romans i l'entrada conjunta",
    sites: [
      "El museu d'història de la ciutat gestiona cinc recintes romans: l'**Amfiteatre**, el **Circ amb el Pretori**, el **Passeig Arqueològic** de les muralles, el **Fòrum de la Colònia** i la **Casa Canals**. Un recinte costa **5 €**; l'**entrada conjunta als cinc, 15 €**. Els menors de 12 hi entren gratis; de 12 a 17 anys, estudiants i jubilats paguen la meitat; una família nombrosa paga una sola entrada per a tothom.",
    ],
    tableCaption: "Horari del 27 d'octubre al 31 de març",
    headers: ["Recinte", "Dimarts a divendres", "Dissabte", "Diumenge i festius"],
    rows: [
      ["Amfiteatre, Passeig Arqueològic, Fòrum de la Colònia", "9:00–18:30", "9:30–18:30", "9:30–14:30"],
      ["Circ–Pretori, Casa Canals", "9:00–20:00", "9:30–20:00", "9:30–14:30"],
    ],
    tableNote: "Tots tanquen els dilluns llevat de festius programats. Últim accés 30 minuts abans del tancament. Tancats el 29 de novembre, el 24, 25, 26 i 31 de desembre i l'1 i 6 de gener; el 8 de desembre, només al matí.",
    freeTitle: "Dies gratis",
    free: "Els recintes romans són gratuïts l'**últim dimarts de cada mes** i el **14, 15 i 28 de novembre** per l'aniversari de la declaració de la UNESCO. L'aqüeducte romà (Pont del Diable), fora del centre, és sempre gratuït.",
    mnatTitle: "El museu arqueològic",
    mnat: "El Museu Nacional Arqueològic de Tarragona de la plaça del Rei és **tancat per renovació**; el museu preveu reobrir-lo l'últim trimestre del 2026. Consulta mnat.cat abans de comptar-hi.",
    planTitle: "Un dia a Tarragona",
    plan: [
      "**Matí:** tren a Tarragona i pujada a l'Amfiteatre, sobre la platja.",
      "**Migdia:** el Circ i el Pretori, i dinar a la Part Alta, el nucli antic.",
      "**Tarda:** el Passeig Arqueològic de les muralles romanes; a l'hivern tanca a les 18:30.",
    ],
    faq: [
      { question: "Quant triga el tren de Barcelona a Tarragona?", answer: "69 minuts des de Barcelona-Sants amb els regionals R14 a R17, 76 des de Passeig de Gràcia i 87 des de l'Estació de França." },
      { question: "Quant costa el tren de Barcelona a Tarragona?", answer: "8,60 € el senzill als regionals, segons el cercador oficial de Rodalies a l'octubre del 2026." },
      { question: "Hi ha entrada conjunta per als recintes romans de Tarragona?", answer: "Sí: 15 € els cinc (Amfiteatre, Circ–Pretori, Passeig Arqueològic, Fòrum de la Colònia i Casa Canals), o 5 € un. Menors de 12, gratis." },
      { question: "Quan són gratis els recintes romans de Tarragona?", answer: "L'últim dimarts de cada mes, i el 14, 15 i 28 de novembre de 2026 per l'aniversari de la UNESCO." },
      { question: "És obert el museu arqueològic de Tarragona?", answer: "No a octubre del 2026: és tancat per renovació i preveu reobrir l'últim trimestre del 2026." },
    ],
    note: "Els horaris de tren i dels recintes canvien segons la temporada: comprova-ho a Rodalies i al museu abans d'anar-hi.",
  },
};

function tarragonaBody(locale: Locale) {
  const t = TARRAGONA_COPY[locale];
  return [
    lead(t.lead),
    table(t.trainCaption, t.trainHeaders, t.trainRows, t.trainNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.trainTitle, ...t.train),
    ...h2(t.sitesTitle, ...t.sites),
    table(t.tableCaption, t.headers, t.rows, t.tableNote),
    ...h2(t.freeTitle, t.free),
    ...h2(t.mnatTitle, t.mnat),
    ...h2(t.planTitle),
    list(...t.plan),
    faq(t.faq),
    ...b2Related(["portaventura", "sitges", "figueres", "girona"], locale),
  ];
}

export const TARRAGONA: B2Article = {
  key: "tarragona",
  entryKey: "daytrip-tarragona-from-barcelona",
  categoryKey: "cities",
  sources: TARRAGONA_SOURCES,
  heroKey: "tarragona-amfiteatre-roma",
  heroAlt: {
    ca: "L'amfiteatre romà de Tarragona amb el mar i la platja a la dreta",
    es: "El anfiteatro romano de Tarragona con el mar y la playa a la derecha",
    en: "Tarragona's Roman amphitheatre with the sea and beach on the right",
  },
  heroCaption: {
    ca: "L'amfiteatre de Tàrraco, arran de mar.",
    es: "El anfiteatro de Tarraco, junto al mar.",
    en: "The amphitheatre of Tarraco, by the sea.",
  },
  secondaryKey: "tarragona-passeig-arqueologic-torre",
  secondaryAlt: {
    ca: "Una torre de la muralla romana al Passeig Arqueològic de Tarragona",
    es: "Una torre de la muralla romana en el Paseo Arqueológico de Tarragona",
    en: "A tower of the Roman wall on Tarragona's Archaeological Promenade",
  },
  secondaryCaption: {
    ca: "El Passeig Arqueològic resegueix la muralla romana.",
    es: "El Paseo Arqueológico sigue la muralla romana.",
    en: "The Archaeological Promenade follows the Roman wall.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T22:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...TARRAGONA_META[locale], blocks: tarragonaBody(locale) }]),
  ) as B2Article["editions"],
};

export { SITGES_META, TARRAGONA_META };
