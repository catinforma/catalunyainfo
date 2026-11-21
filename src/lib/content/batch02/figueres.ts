import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  callout,
  faq,
  h2,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Figueres and the Dalí Theatre-Museum from Barcelona.
 *
 * Re-checked on 24 Oct 2026 for the page-1 push (queries "como ir al museo
 * dali desde barcelona", "figueres museum tickets", "barcelona to dali museum
 * train"):
 *
 * - Museum hours, prices, free categories and the exceptional Monday
 *   openings from salvador-dali.org (visit page and FAQ). The exceptional
 *   list (30 Mar, 6 Apr, 25 May, 12 Oct, 9 Nov, 7 Dec) falls on Mondays only
 *   in 2026, so it is the 2026 list: 9 Nov and 7 Dec are the ones left.
 * - R11: official Rodalies journey planner (API behind rodalies.gencat.cat/
 *   horaris) for 27 and 31 Oct and 1 Nov 2026, with its fares (12,80 EUR on
 *   regional trains, 17,10 EUR on MD trains).
 * - High-speed to Figueres-Vilafant: Renfe's open-data GTFS for long distance
 *   and high speed (ssl.renfe.com/gtransit/Fichero_AV_LD), same dates.
 * - Figueres-Vilafant 1.5 km from the centre with a shuttle bus and taxis,
 *   and the tourist office, from visitfigueres.cat (Ajuntament).
 * - Portlligat and Púbol winter closures from their salvador-dali.org pages.
 *
 * Left out: high-speed fares (Renfe prices them by train and date) and
 * walking times (no official figure). The old line about Púbol being 5 km
 * from Flaçà station was dropped: no official page read today states it.
 */

// 28 Oct 2026 (page-1 push, research_notes/page1-28oct/figueres_girona.md):
// the Foundation now gives the walk from Figueres-Vilafant ("about 15
// minutes by taxi or approximately 25 minutes on foot"), the bus (2 h to
// 2 h 30), the car (about 140 km, 1 h 40 on the AP-7) and the Dalí + La
// Pedrera combined ticket (44.50 EUR, 30 EUR Catalonia residents). The
// 10:30 opening runs 1 Oct-22 Mar, not "November to March"; high-speed
// trains take 42-65 min, so "about an hour", not "under an hour". Púbol
// closes at 17:00 from 2 Nov. R11 and Renfe GTFS re-read the same day.
const VERIFIED = "2026-11-21";

const SOURCES: B2Source[] = [
  { name: "Dalí Theatre-Museum — visit", url: "https://www.salvador-dali.org/en/visit/dali-theatre-museum/", publisher: "Fundació Gala-Salvador Dalí" },
  { name: "Dalí Museums — FAQs", url: "https://www.salvador-dali.org/en/visit/faqs/", publisher: "Fundació Gala-Salvador Dalí" },
  { name: "Combined ticket: Dalí Theatre-Museum + La Pedrera (and how to get to Figueres)", url: "https://www.salvador-dali.org/en/visit/dali-theatre-museum/combined-ticket-dali-theatre-museum-la-pedrera/", publisher: "Fundació Gala-Salvador Dalí" },
  { name: "Salvador Dalí House-Museum, Portlligat", url: "https://www.salvador-dali.org/en/visit/salvador-dali-house-museum/", publisher: "Fundació Gala-Salvador Dalí" },
  { name: "Gala Dalí Castle, Púbol", url: "https://www.salvador-dali.org/en/visit/gala-dali-castle/", publisher: "Fundació Gala-Salvador Dalí" },
  { name: "Cercador d'horaris de Rodalies", url: "https://rodalies.gencat.cat/ca/horaris/", publisher: "Rodalies de Catalunya" },
  { name: "R11 line (Rodalies regional services)", url: "https://rodalies.gencat.cat/en/sobre-rodalies/linies-i-estacions/servei_regionals/r11/index.html", publisher: "Rodalies de Catalunya" },
  { name: "Horarios Renfe (datos abiertos, alta velocidad y larga distancia)", url: "https://data.renfe.com/dataset/horarios-de-alta-velocidad-larga-distancia-y-media-distancia", publisher: "Renfe" },
  { name: "How to get to Figueres", url: "https://visitfigueres.cat/en/useful-information/how-to-get-here/", publisher: "Ajuntament de Figueres" },
  { name: "Tourist information office", url: "https://visitfigueres.cat/en/useful-information/tourist-information-office/", publisher: "Ajuntament de Figueres" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "escapades/figueres-museu-dali-des-de-barcelona",
    title: "Com anar al Museu Dalí de Figueres des de Barcelona: tren, entrades i horari",
    seoTitle: "Com anar al Museu Dalí des de Barcelona: tren, preu, horari",
    seoDescription:
      "El Teatre-Museu Dalí és a Figueres: 2 h amb l'R11 (12,80 €) o 1 h amb alta velocitat i 25 min a peu. Entrades des de 18,50 €; obre de dimarts a diumenge.",
    excerpt: "Com arribar al Teatre-Museu Dalí de Figueres des de Barcelona en tren, quant costa l'entrada, quan obre i qui hi entra gratis.",
  },
  es: {
    path: "escapadas/figueres-museo-dali-desde-barcelona",
    title: "Cómo ir al Museo Dalí de Figueres desde Barcelona: tren, entradas y horario",
    seoTitle: "Cómo ir al Museo Dalí desde Barcelona: tren, precio, horario",
    seoDescription:
      "El Teatro-Museo Dalí está en Figueres: 2 h en el R11 (12,80 €) o 1 h en alta velocidad y 25 min a pie. Entradas desde 18,50 €; abre de martes a domingo.",
    excerpt: "Cómo llegar al Teatro-Museo Dalí de Figueres desde Barcelona en tren, cuánto cuesta la entrada, cuándo abre y quién entra gratis.",
  },
  en: {
    path: "day-trips/figueres-dali-museum-from-barcelona",
    title: "Barcelona to the Dalí Museum in Figueres: train, tickets and opening hours",
    seoTitle: "Barcelona to Dalí Museum, Figueres: train, tickets, hours",
    seoDescription:
      "The Dalí Theatre-Museum is in Figueres: 2 h on the R11 (€12.80) or 1 h by high-speed train plus a 25-min walk. Tickets from €18.50; open Tuesday to Sunday.",
    excerpt: "How to get to the Dalí Theatre-Museum in Figueres from Barcelona by train, what a ticket costs, when it opens and who goes free.",
  },
};

type T = {
  lead: string;
  tableCaption: string; headers: string[]; rows: string[][]; tableNote: string;
  trainTitle: string; train: string[];
  museumTitle: string; museum: string[];
  hoursTitle: string; hours: string[];
  hoursCaption: string; hoursHeaders: string[]; hoursRows: string[][]; hoursNote: string;
  otherWaysTitle: string; otherWays: string[];
  moreTitle: string; more: string[];
  planTitle: string; plan: string[];
  faq: { question: string; answer: string }[];
  note: string;
};

const COPY: Record<Locale, T> = {
  en: {
    lead: "The Dalí Theatre-Museum, which Salvador Dalí designed himself, is not in Barcelona but in his home town, **Figueres**. From Barcelona you can take the **R11 regional train** to Figueres station in the town centre (about **2 hours**, **€12.80** single) or a **high-speed train** to Figueres-Vilafant, 1.5 km out, in **about an hour**; from there the museum is about **25 minutes on foot** or 15 by taxi, according to the Dalí Foundation. Tickets start **from €18.50**, and from 1 October to 22 March the museum opens **Tuesday to Sunday, 10:30 to 18:00**.",
    tableCaption: "Barcelona to Figueres by train",
    headers: ["Train", "Arrives at", "Journey from Sants", "Trains a day", "Single fare"],
    rows: [
      ["R11 regional (from Sants and Passeig de Gràcia)", "Figueres, in the town centre", "1 h 50 – 2 h 18", "21 on weekdays, 14 on Saturdays", "€12.80 (€17.10 on MD trains)"],
      ["Renfe high-speed (Avant, AVE)", "Figueres-Vilafant, 1.5 km from the centre", "53 min – 1 h 05", "15 Monday to Thursday, 13 on Fridays, 9 on Saturdays", "Varies by train and date"],
    ],
    tableNote: "R11 and fares from the official Rodalies planner for 24 and 28 November 2026; high-speed from Renfe's open timetable data for 24, 27 and 28 November (the Dalí Foundation also gives 55 minutes to an hour). Read on 21 November 2026.",
    trainTitle: "Which train to the Dalí Museum",
    train: [
      "The **R11** is slower but lands you in town. On weekdays the first leaves Sants at 5:56 and the last at 20:46 (6:46 to 20:16 on Saturdays); trains from Passeig de Gràcia leave a few minutes after Sants. The last R11 back leaves Figueres at 20:46 on weekdays.",
      "**High-speed** trains halve the journey but stop at Figueres-Vilafant, a kilometre and a half from the centre: the Dalí Foundation puts the museum about 25 minutes away on foot or 15 by taxi, and a shuttle bus into town meets each train. Useful morning trains leave Sants at 8:05, 8:14 and 9:32; the last one back leaves Figueres-Vilafant at 19:35 on weekdays and 19:08 on Saturdays.",
    ],
    museumTitle: "Dalí Museum tickets and prices",
    museum: [
      "General admission starts **from €18.50** and reduced from €15.00 (students over 18, ages 9 to 17, Carnet Jove holders, over-65s, visitors with a 33% disability and one companion, large and single-parent families). Children up to 8 go free. A guided tour costs €26.50 (€23 reduced).",
      "Free admission also covers visitors with a 50% disability and one companion, Friends of the Dalí Museums, press and ICOM card holders. Groups of 25 or more pay €14 online and €16 at the ticket office.",
      "Booking online is advisable but not compulsory; keep the reservation code to show at the entrance. There is **no free first Sunday**: the museum is free for everyone on **6 January**.",
      "The Foundation also sells a **combined ticket with La Pedrera** in Barcelona: €44.50, or €30 for Catalonia residents, free under 12; the museum visit is on the date and time you book.",
    ],
    hoursTitle: "Dalí Museum opening hours",
    hours: [
      "Last entry is 45 minutes before closing, and the rooms close 15 minutes before closing time. The museum is **closed on Mondays** outside July and August; the next exception is Monday 7 December 2026.",
    ],
    hoursCaption: "Dalí Theatre-Museum opening hours",
    hoursHeaders: ["Period", "Days", "Hours"],
    hoursRows: [
      ["1 October – 31 December", "Tuesday to Sunday", "10:30–18:00 (24 Dec until 15:00; closed 25 Dec)"],
      ["1 January – 22 March", "Tuesday to Sunday", "10:30–18:00 (closed 1 Jan; free 6 Jan)"],
      ["23 March – 31 May", "Tuesday to Sunday", "9:30–18:00"],
      ["1 – 30 June", "Tuesday to Sunday", "10:30–18:00"],
      ["1 July – 31 August", "Every day", "9:00–20:00"],
      ["1 – 30 September", "Tuesday to Sunday", "9:30–18:00"],
    ],
    hoursNote: "From the Dalí Foundation's official visit page, read on 21 November 2026.",
    otherWaysTitle: "By bus or car to the Dalí Museum",
    otherWays: [
      "According to the Dalí Foundation, several companies run daily coaches from Barcelona to Figueres, taking **2 to 2 hours 30 minutes**; the bus station is next to the town-centre railway station. By car it is about **140 km**, around **1 hour 40 minutes** on the AP-7 towards Girona and Figueres, with public car parks near the museum.",
    ],
    moreTitle: "Also run by the Dalí Foundation",
    more: [
      "**Portlligat house (Cadaqués):** the house where Dalí lived, visited only in small groups with a booked date and time; €15.50 online for house and olive grove outside July and August. Closed from 7 January to 11 February.",
      "**Púbol castle:** Gala's castle, €10 online. Closed from 7 January to 27 February; from 2 November it closes at 17:00.",
    ],
    planTitle: "A day in Figueres",
    plan: [
      "**Morning:** an early R11 or a high-speed train; aim to be at the museum by late morning.",
      "**Midday:** the Theatre-Museum, then lunch in town.",
      "**Afternoon:** the Rambla and the tourist office on Plaça de l'Escorxador, a few metres from the museum (Monday to Saturday 9:30–18:00, Sunday 10:00–15:00 in autumn and winter), then the train back.",
    ],
    faq: [
      { question: "How do I get from Barcelona to the Dalí Museum?", answer: "By the R11 regional train from Sants or Passeig de Gràcia to Figueres station (about 2 hours, €12.80), or by high-speed train to Figueres-Vilafant (53 minutes to 1 h 05) and the shuttle bus into town." },
      { question: "Is the Dalí Museum in Barcelona?", answer: "No. The Dalí Theatre-Museum is in Figueres, Dalí's home town, about 140 km north of Barcelona. The Foundation's other two museums are the Portlligat house in Cadaqués and Púbol castle." },
      { question: "How do I get from Figueres-Vilafant station to the Dalí Museum?", answer: "About 25 minutes on foot or 15 by taxi, according to the Dalí Foundation; a shuttle bus into town also meets each high-speed train." },
      { question: "How much is a ticket to the Dalí Museum in Figueres?", answer: "General admission from €18.50 and reduced from €15.00 on the official site; children up to 8 free; guided tour €26.50." },
      { question: "Is the Dalí Museum open on Mondays?", answer: "Not from September to June, except a few holiday Mondays: the next is 7 December 2026. In July and August it opens every day." },
      { question: "Is the Dalí Museum ever free?", answer: "Yes, for everyone on 6 January. There is no free first Sunday." },
    ],
    note: "Museum hours and train timetables change: check the Dalí Foundation and Renfe before you travel.",
  },
  es: {
    lead: "El Teatro-Museo Dalí, que diseñó el propio Salvador Dalí, no está en Barcelona sino en su ciudad natal, **Figueres**. Desde Barcelona puedes ir en el **regional R11** hasta la estación de Figueres, en el centro (unas **2 horas**, **12,80 €** el sencillo), o en **alta velocidad** hasta Figueres-Vilafant, a 1,5 km, en **alrededor de una hora**; desde allí el museo queda a unos **25 minutos a pie** o 15 en taxi, según la Fundació Dalí. Las entradas van **desde 18,50 €** y del 1 de octubre al 22 de marzo el museo abre **de martes a domingo, de 10:30 a 18:00**.",
    tableCaption: "De Barcelona a Figueres en tren",
    headers: ["Tren", "Llega a", "Duración desde Sants", "Trenes al día", "Sencillo"],
    rows: [
      ["Regional R11 (desde Sants y Passeig de Gràcia)", "Figueres, en el centro", "1 h 50 – 2 h 18", "21 laborables, 14 los sábados", "12,80 € (17,10 € en los MD)"],
      ["Alta velocidad de Renfe (Avant, AVE)", "Figueres-Vilafant, a 1,5 km del centro", "53 min – 1 h 05", "15 de lunes a jueves, 13 los viernes, 9 los sábados", "Según tren y fecha"],
    ],
    tableNote: "R11 y precios según el planificador oficial de Rodalies para el 24 y el 28 de noviembre de 2026; alta velocidad según los datos abiertos de horarios de Renfe para el 24, el 27 y el 28 de noviembre (la Fundació Dalí da también de 55 minutos a una hora). Consultado el 21 de noviembre de 2026.",
    trainTitle: "Qué tren coger al Museo Dalí",
    train: [
      "El **R11** es más lento pero te deja en el centro. Los laborables el primero sale de Sants a las 5:56 y el último a las 20:46 (de 6:46 a 20:16 los sábados); desde Passeig de Gràcia salen unos minutos después que desde Sants. El último R11 de vuelta sale de Figueres a las 20:46 los laborables.",
      "La **alta velocidad** reduce el viaje a la mitad pero para en Figueres-Vilafant, a un kilómetro y medio del centro: según la Fundació Dalí, el museo queda a unos 25 minutos a pie o 15 en taxi, y un autobús lanzadera al centro espera cada tren. Por la mañana salen de Sants a las 8:05, 8:14 y 9:32; el último de vuelta sale de Figueres-Vilafant a las 19:35 los laborables y a las 19:08 los sábados.",
    ],
    museumTitle: "Entradas y precio del Museo Dalí",
    museum: [
      "La entrada general cuesta **desde 18,50 €** y la reducida desde 15,00 € (estudiantes mayores de 18, de 9 a 17 años, Carnet Jove, mayores de 65, personas con discapacidad del 33 % y acompañante, familias numerosas y monoparentales). Los niños hasta 8 años entran gratis. La visita guiada cuesta 26,50 € (23 € reducida).",
      "También entran gratis las personas con una discapacidad del 50 % y su acompañante, los Amigos de los Museos Dalí, la prensa acreditada y los titulares del carné ICOM. Los grupos de 25 personas o más pagan 14 € en línea y 16 € en taquilla.",
      "Comprar en línea es aconsejable pero no obligatorio; guarda el código de reserva para enseñarlo en la entrada. **No hay primer domingo gratuito**: el museo es gratis para todo el mundo el **6 de enero**.",
      "La Fundació vende también una **entrada combinada con La Pedrera** de Barcelona: 44,50 €, o 30 € para residentes en Cataluña, gratis para menores de 12; la visita al museo es el día y la hora que reserves.",
    ],
    hoursTitle: "Horario del Museo Dalí",
    hours: [
      "La última entrada es 45 minutos antes del cierre, y las salas cierran 15 minutos antes de la hora de cierre. El museo **cierra los lunes** fuera de julio y agosto; la próxima excepción es el lunes 7 de diciembre de 2026.",
    ],
    hoursCaption: "Horario del Teatro-Museo Dalí",
    hoursHeaders: ["Periodo", "Días", "Horario"],
    hoursRows: [
      ["1 de octubre – 31 de diciembre", "Martes a domingo", "10:30–18:00 (24 dic hasta las 15:00; cerrado el 25 dic)"],
      ["1 de enero – 22 de marzo", "Martes a domingo", "10:30–18:00 (cerrado el 1 ene; gratis el 6 ene)"],
      ["23 de marzo – 31 de mayo", "Martes a domingo", "9:30–18:00"],
      ["1 – 30 de junio", "Martes a domingo", "10:30–18:00"],
      ["1 de julio – 31 de agosto", "Todos los días", "9:00–20:00"],
      ["1 – 30 de septiembre", "Martes a domingo", "9:30–18:00"],
    ],
    hoursNote: "Según la página oficial de visita de la Fundació Dalí, consultada el 21 de noviembre de 2026.",
    otherWaysTitle: "Cómo ir al Museo Dalí en autobús o en coche",
    otherWays: [
      "Según la Fundació Dalí, varias compañías hacen el trayecto diario en autobús de Barcelona a Figueres, en **2 horas a 2 horas y media**; la estación de autobuses está junto a la estación de tren del centro. En coche son unos **140 km**, alrededor de **1 hora y 40 minutos** por la AP-7 en dirección a Girona y Figueres, con aparcamientos públicos cerca del museo.",
    ],
    moreTitle: "También de la Fundació Dalí",
    more: [
      "**Casa de Portlligat (Cadaqués):** la casa donde vivió Dalí, que solo se visita en grupos pequeños con fecha y hora reservadas; 15,50 € en línea casa y olivar fuera de julio y agosto. Cerrada del 7 de enero al 11 de febrero.",
      "**Castillo de Púbol:** el castillo de Gala, 10 € en línea. Cerrado del 7 de enero al 27 de febrero; desde el 2 de noviembre cierra a las 17:00.",
    ],
    planTitle: "Un día en Figueres",
    plan: [
      "**Mañana:** un R11 temprano o un tren de alta velocidad; intenta estar en el museo a media mañana.",
      "**Mediodía:** el Teatro-Museo y comida en la ciudad.",
      "**Tarde:** la Rambla y la oficina de turismo de la plaza de l'Escorxador, a pocos metros del museo (de lunes a sábado de 9:30 a 18:00 y domingos de 10:00 a 15:00 en otoño e invierno), y tren de vuelta.",
    ],
    faq: [
      { question: "¿Cómo ir de Barcelona al Museo Dalí?", answer: "En el regional R11 desde Sants o Passeig de Gràcia hasta la estación de Figueres (unas 2 horas, 12,80 €), o en alta velocidad hasta Figueres-Vilafant (de 53 minutos a 1 h 05) y lanzadera al centro." },
      { question: "¿El Museo Dalí está en Barcelona?", answer: "No. El Teatro-Museo Dalí está en Figueres, la ciudad natal de Dalí, a unos 140 km al norte de Barcelona. Los otros dos museos de la Fundació son la Casa de Portlligat, en Cadaqués, y el Castillo de Púbol." },
      { question: "¿Cómo se va de la estación de Figueres-Vilafant al Museo Dalí?", answer: "A pie en unos 25 minutos o en taxi en unos 15, según la Fundació Dalí; también hay un autobús lanzadera al centro que espera cada tren de alta velocidad." },
      { question: "¿Cuánto cuesta la entrada combinada del Museo Dalí y La Pedrera?", answer: "44,50 €, o 30 € para residentes en Cataluña; los menores de 12 años no pagan. La vende la Fundació Dalí." },
      { question: "¿Cuánto cuesta la entrada al Museo Dalí de Figueres?", answer: "Entrada general desde 18,50 € y reducida desde 15,00 € en la web oficial; niños hasta 8 años, gratis; visita guiada, 26,50 €." },
      { question: "¿Abre el Museo Dalí los lunes?", answer: "No de septiembre a junio, salvo algunos lunes festivos: el próximo, el 7 de diciembre de 2026. En julio y agosto abre todos los días." },
      { question: "¿El Museo Dalí es gratis algún día?", answer: "Sí, para todo el mundo el 6 de enero. No hay primer domingo gratuito." },
    ],
    note: "Los horarios del museo y de los trenes cambian: compruébalo en la Fundació Dalí y en Renfe antes de viajar.",
  },
  ca: {
    lead: "El Teatre-Museu Dalí, que va dissenyar el mateix Salvador Dalí, no és a Barcelona sinó a la seva ciutat natal, **Figueres**. Des de Barcelona hi pots anar amb el **regional R11** fins a l'estació de Figueres, al centre (unes **2 hores**, **12,80 €** el senzill), o amb **alta velocitat** fins a Figueres-Vilafant, a 1,5 km, en **al voltant d'una hora**; d'allà el museu queda a uns **25 minuts a peu** o 15 en taxi, segons la Fundació Dalí. Les entrades van **des de 18,50 €** i de l'1 d'octubre al 22 de març el museu obre **de dimarts a diumenge, de 10:30 a 18:00**.",
    tableCaption: "De Barcelona a Figueres en tren",
    headers: ["Tren", "Arriba a", "Durada des de Sants", "Trens al dia", "Senzill"],
    rows: [
      ["Regional R11 (des de Sants i Passeig de Gràcia)", "Figueres, al centre", "1 h 50 – 2 h 18", "21 feiners, 14 els dissabtes", "12,80 € (17,10 € als MD)"],
      ["Alta velocitat de Renfe (Avant, AVE)", "Figueres-Vilafant, a 1,5 km del centre", "53 min – 1 h 05", "15 de dilluns a dijous, 13 els divendres, 9 els dissabtes", "Segons tren i data"],
    ],
    tableNote: "R11 i preus segons el cercador oficial de Rodalies per al 24 i el 28 de novembre de 2026; alta velocitat segons les dades obertes d'horaris de Renfe per al 24, el 27 i el 28 de novembre (la Fundació Dalí també en dona de 55 minuts a una hora). Consultat el 21 de novembre de 2026.",
    trainTitle: "Quin tren agafar al Museu Dalí",
    train: [
      "L'**R11** és més lent però et deixa al centre. Els feiners el primer surt de Sants a les 5:56 i l'últim a les 20:46 (de 6:46 a 20:16 els dissabtes); des de Passeig de Gràcia surten uns minuts després que des de Sants. L'últim R11 de tornada surt de Figueres a les 20:46 els feiners.",
      "L'**alta velocitat** redueix el viatge a la meitat però para a Figueres-Vilafant, a un quilòmetre i mig del centre: segons la Fundació Dalí, el museu queda a uns 25 minuts a peu o 15 en taxi, i un autobús llançadora al centre espera cada tren. Al matí surten de Sants a les 8:05, 8:14 i 9:32; l'últim de tornada surt de Figueres-Vilafant a les 19:35 els feiners i a les 19:08 els dissabtes.",
    ],
    museumTitle: "Entrades i preu del Museu Dalí",
    museum: [
      "L'entrada general costa **des de 18,50 €** i la reduïda des de 15,00 € (estudiants majors de 18, de 9 a 17 anys, Carnet Jove, majors de 65, persones amb discapacitat del 33 % i acompanyant, famílies nombroses i monoparentals). Els infants fins a 8 anys hi entren gratis. La visita guiada costa 26,50 € (23 € reduïda).",
      "També hi entren gratis les persones amb una discapacitat del 50 % i el seu acompanyant, els Amics dels Museus Dalí, la premsa acreditada i els titulars del carnet ICOM. Els grups de 25 persones o més paguen 14 € en línia i 16 € a taquilla.",
      "Comprar en línia és aconsellable però no obligatori; guarda el codi de reserva per ensenyar-lo a l'entrada. **No hi ha primer diumenge gratuït**: el museu és gratis per a tothom el **6 de gener**.",
      "La Fundació ven també una **entrada combinada amb La Pedrera** de Barcelona: 44,50 €, o 30 € per als residents a Catalunya, gratis per als menors de 12; la visita al museu és el dia i l'hora que reservis.",
    ],
    hoursTitle: "Horari del Museu Dalí",
    hours: [
      "L'última entrada és 45 minuts abans del tancament, i les sales tanquen 15 minuts abans de l'hora de tancament. El museu **tanca els dilluns** fora de juliol i agost; la pròxima excepció és el dilluns 7 de desembre de 2026.",
    ],
    hoursCaption: "Horari del Teatre-Museu Dalí",
    hoursHeaders: ["Període", "Dies", "Horari"],
    hoursRows: [
      ["1 d'octubre – 31 de desembre", "Dimarts a diumenge", "10:30–18:00 (24 des fins a les 15:00; tancat el 25 des)"],
      ["1 de gener – 22 de març", "Dimarts a diumenge", "10:30–18:00 (tancat l'1 gen; gratis el 6 gen)"],
      ["23 de març – 31 de maig", "Dimarts a diumenge", "9:30–18:00"],
      ["1 – 30 de juny", "Dimarts a diumenge", "10:30–18:00"],
      ["1 de juliol – 31 d'agost", "Cada dia", "9:00–20:00"],
      ["1 – 30 de setembre", "Dimarts a diumenge", "9:30–18:00"],
    ],
    hoursNote: "Segons la pàgina oficial de visita de la Fundació Dalí, consultada el 21 de novembre de 2026.",
    otherWaysTitle: "Com anar al Museu Dalí en autobús o en cotxe",
    otherWays: [
      "Segons la Fundació Dalí, diverses companyies fan el trajecte diari en autobús de Barcelona a Figueres, en **2 hores a 2 hores i mitja**; l'estació d'autobusos és al costat de l'estació de tren del centre. En cotxe són uns **140 km**, al voltant d'**1 hora i 40 minuts** per l'AP-7 en direcció a Girona i Figueres, amb aparcaments públics a prop del museu.",
    ],
    moreTitle: "També de la Fundació Dalí",
    more: [
      "**Casa de Portlligat (Cadaqués):** la casa on va viure Dalí, que només es visita en grups petits amb data i hora reservades; 15,50 € en línia casa i oliverar fora de juliol i agost. Tancada del 7 de gener a l'11 de febrer.",
      "**Castell de Púbol:** el castell de Gala, 10 € en línia. Tancat del 7 de gener al 27 de febrer; des del 2 de novembre tanca a les 17:00.",
    ],
    planTitle: "Un dia a Figueres",
    plan: [
      "**Matí:** un R11 d'hora o un tren d'alta velocitat; intenta ser al museu a mig matí.",
      "**Migdia:** el Teatre-Museu i dinar a la ciutat.",
      "**Tarda:** la Rambla i l'oficina de turisme de la plaça de l'Escorxador, a pocs metres del museu (de dilluns a dissabte de 9:30 a 18:00 i diumenges de 10:00 a 15:00 a la tardor i l'hivern), i tren de tornada.",
    ],
    faq: [
      { question: "Com anar de Barcelona al Museu Dalí?", answer: "Amb el regional R11 des de Sants o Passeig de Gràcia fins a l'estació de Figueres (unes 2 hores, 12,80 €), o amb alta velocitat fins a Figueres-Vilafant (de 53 minuts a 1 h 05) i llançadora al centre." },
      { question: "El Museu Dalí és a Barcelona?", answer: "No. El Teatre-Museu Dalí és a Figueres, la ciutat natal de Dalí, a uns 140 km al nord de Barcelona. Els altres dos museus de la Fundació són la Casa de Portlligat, a Cadaqués, i el Castell de Púbol." },
      { question: "Com s'hi va de l'estació de Figueres-Vilafant al Museu Dalí?", answer: "A peu en uns 25 minuts o en taxi en uns 15, segons la Fundació Dalí; també hi ha un autobús llançadora al centre que espera cada tren d'alta velocitat." },
      { question: "Quant costa l'entrada al Museu Dalí de Figueres?", answer: "Entrada general des de 18,50 € i reduïda des de 15,00 € al web oficial; infants fins a 8 anys, gratis; visita guiada, 26,50 €." },
      { question: "Obre el Museu Dalí els dilluns?", answer: "No de setembre a juny, llevat d'alguns dilluns festius: el pròxim, el 7 de desembre de 2026. Al juliol i l'agost obre cada dia." },
      { question: "El Museu Dalí és gratis algun dia?", answer: "Sí, per a tothom el 6 de gener. No hi ha primer diumenge gratuït." },
    ],
    note: "Els horaris del museu i dels trens canvien: comprova-ho a la Fundació Dalí i a Renfe abans de viatjar.",
  },
};

// 21 Nov 2026 (day-trips cluster push; ES queries "precio entradas museo dali
// figueres", "museo dali figueres entradas precio", "precio museo dali"; EN
// "figueres vilafant to dali museum", "barcelona to dali museum train"). Read
// that day on salvador-dali.org: visit page (prices and hours unchanged; its
// exceptional-opening list "5 January, 30 March, 6 April, 25 May, 12 October,
// 9 November, 7 December" is the 2026 Mondays), FAQ ("It generally takes
// between one and a half and two hours to see the whole museum"; "always
// advisable to book"; ticket desk "subject to the museum's capacity"; no
// rucksacks worn on the back, pushchairs or objects over 35 x 35 x 25 cm;
// left-luggage office; wheelchair users and visitors with reduced mobility
// free with a companion), combined-ticket page (44.5 / residents 30 / under
// 12 free; high-speed "between 55 minutes and 1 hour"), Portlligat (15.50
// online / 17.00 ticket office; July-August 18.50 / 20.50; reduced 12 / 14)
// and Púbol (10 online / 12 desk; reduced 7 / 9). Trains: Rodalies planner
// API for 24 and 28 Nov (R11 21 weekday / 14 Saturday trains, 1 h 50 - 2 h 18,
// 12.80 / 17.10 EUR, last back 20:46 / 20:49); Renfe GTFS (Fichero_AV_LD) for
// 23, 24, 27 and 28 Nov and 4 Dec: 15 high-speed departures Monday to
// Thursday (13 on Fridays), 9 on Saturdays, 53 to 65 minutes to
// Figueres-Vilafant; last back 19:35 weekdays, 19:08 Saturdays. Renfe's GTFS
// also lists a 21:46 regional to Figueres that the Rodalies planner does not:
// the planner's figures are kept.
type FigX = {
  pricesCaption: string; pricesHeaders: string[]; pricesRows: string[][]; pricesNote: string;
  visit: string;
  faq: { question: string; answer: string }[];
};

const FIG_21NOV: Record<Locale, FigX> = {
  en: {
    pricesCaption: "Dalí Theatre-Museum and the Foundation's other museums: 2026 ticket prices",
    pricesHeaders: ["Ticket", "Price", "Who or what"],
    pricesRows: [
      ["Dalí Theatre-Museum, general", "From €18.50", "Adults"],
      ["Dalí Theatre-Museum, reduced", "From €15.00", "Students over 18, ages 9 to 17, Carnet Jove, over 65, 33% disability and a companion, large and single-parent families"],
      ["Dalí Theatre-Museum, free", "€0", "Children up to 8; visitors with a 50% disability, reduced mobility or a wheelchair, each with a companion; Friends of the Dalí Museums; press; ICOM"],
      ["Free day for everyone", "6 January", "At the artist's request; there is no free first Sunday"],
      ["Guided tour", "€26.50 (reduced €23.00)", "Dalí Theatre-Museum"],
      ["Groups of 25 or more", "€14 online, €16 at the ticket office", "Per person"],
      ["Dalí Theatre-Museum + La Pedrera (Barcelona)", "€44.50 (Catalonia residents €30)", "Under-12s free"],
      ["Portlligat house and olive grove, Cadaqués", "€15.50 online, €17 at the ticket office (July and August €18.50 / €20.50)", "Booked date and time only; reduced €12 / €14"],
      ["Gala Dalí Castle, Púbol", "€10 online, €12 at the ticket desk", "Reduced €7 / €9"],
    ],
    pricesNote: "Fundació Gala-Salvador Dalí: visit pages, FAQ and the combined-ticket page, read on 21 November 2026.",
    visit: "Allow **one and a half to two hours** inside: that is the Dalí Foundation's own estimate for the whole Theatre-Museum. Bags are checked at the door, and rucksacks worn on the back, pushchairs, luggage and anything larger than 35 × 35 × 25 cm cannot go in; there is a left-luggage office. Visitors with reduced mobility use the entrance in Plaça Gala-Dalí; tell the admission staff in advance.",
    faq: [
      { question: "How long does a visit to the Dalí Museum take?", answer: "The Dalí Foundation says it generally takes one and a half to two hours to see the whole Theatre-Museum. Add about an hour each way by high-speed train from Barcelona, or two by R11." },
      { question: "Can I take a backpack into the Dalí Museum?", answer: "Not on your back: rucksacks worn on the back, pushchairs, luggage and anything larger than 35 × 35 × 25 cm are not allowed in. Bags are inspected at the entrance and there is a left-luggage office." },
      { question: "Do I need to book Dalí Museum tickets in advance?", answer: "The Foundation advises it. There is a ticket desk at the entrance, but entry depends on the museum's capacity. The Portlligat house can only be visited with a booked date and time." },
    ],
  },
  es: {
    pricesCaption: "Teatro-Museo Dalí y los otros museos de la Fundació: precios de las entradas en 2026",
    pricesHeaders: ["Entrada", "Precio", "Quién o qué"],
    pricesRows: [
      ["Teatro-Museo Dalí, general", "Desde 18,50 €", "Adultos"],
      ["Teatro-Museo Dalí, reducida", "Desde 15,00 €", "Estudiantes mayores de 18, de 9 a 17 años, Carnet Jove, mayores de 65, discapacidad del 33 % y acompañante, familias numerosas y monoparentales"],
      ["Teatro-Museo Dalí, gratis", "0 €", "Niños hasta 8 años; personas con discapacidad del 50 %, movilidad reducida o en silla de ruedas, cada una con un acompañante; Amigos de los Museos Dalí; prensa; ICOM"],
      ["Día gratis para todos", "6 de enero", "Por deseo del artista; no hay primer domingo gratuito"],
      ["Visita guiada", "26,50 € (reducida 23,00 €)", "Teatro-Museo Dalí"],
      ["Grupos de 25 o más", "14 € en línea, 16 € en taquilla", "Por persona"],
      ["Teatro-Museo Dalí + La Pedrera (Barcelona)", "44,50 € (residentes en Cataluña, 30 €)", "Menores de 12, gratis"],
      ["Casa y olivar de Portlligat, Cadaqués", "15,50 € en línea, 17 € en taquilla (julio y agosto, 18,50 € / 20,50 €)", "Solo con fecha y hora reservadas; reducida 12 € / 14 €"],
      ["Castillo Gala Dalí, Púbol", "10 € en línea, 12 € en taquilla", "Reducida 7 € / 9 €"],
    ],
    pricesNote: "Fundació Gala-Salvador Dalí: páginas de visita, preguntas frecuentes y entrada combinada, consultadas el 21 de noviembre de 2026.",
    visit: "Calcula **de hora y media a dos horas** dentro: es la estimación de la propia Fundació Dalí para ver todo el Teatro-Museo. En la entrada se revisan los bolsos, y no se puede entrar con mochilas a la espalda, carritos, maletas ni objetos de más de 35 × 35 × 25 cm; hay consigna. Las personas con movilidad reducida entran por la plaza Gala-Dalí; avisa antes al personal de acceso.",
    faq: [
      { question: "¿Cuánto dura la visita al Museo Dalí?", answer: "Según la Fundació Dalí, ver todo el Teatro-Museo suele llevar de hora y media a dos horas. Suma una hora por trayecto en alta velocidad desde Barcelona, o dos en el R11." },
      { question: "¿Se puede entrar con mochila al Museo Dalí?", answer: "A la espalda, no: no se admiten mochilas a la espalda, carritos, maletas ni objetos de más de 35 × 35 × 25 cm. Los bolsos se revisan en la entrada y hay consigna." },
      { question: "¿Hay que reservar la entrada del Museo Dalí?", answer: "La Fundació lo aconseja. Hay taquilla en la entrada, pero el acceso depende del aforo del museo. La Casa de Portlligat solo se visita con fecha y hora reservadas." },
    ],
  },
  ca: {
    pricesCaption: "Teatre-Museu Dalí i els altres museus de la Fundació: preus de les entrades el 2026",
    pricesHeaders: ["Entrada", "Preu", "Qui o què"],
    pricesRows: [
      ["Teatre-Museu Dalí, general", "Des de 18,50 €", "Adults"],
      ["Teatre-Museu Dalí, reduïda", "Des de 15,00 €", "Estudiants majors de 18, de 9 a 17 anys, Carnet Jove, majors de 65, discapacitat del 33 % i acompanyant, famílies nombroses i monoparentals"],
      ["Teatre-Museu Dalí, gratis", "0 €", "Infants fins a 8 anys; persones amb discapacitat del 50 %, mobilitat reduïda o en cadira de rodes, cadascuna amb un acompanyant; Amics dels Museus Dalí; premsa; ICOM"],
      ["Dia gratis per a tothom", "6 de gener", "Per desig de l'artista; no hi ha primer diumenge gratuït"],
      ["Visita guiada", "26,50 € (reduïda 23,00 €)", "Teatre-Museu Dalí"],
      ["Grups de 25 o més", "14 € en línia, 16 € a taquilla", "Per persona"],
      ["Teatre-Museu Dalí + La Pedrera (Barcelona)", "44,50 € (residents a Catalunya, 30 €)", "Menors de 12, gratis"],
      ["Casa i oliverar de Portlligat, Cadaqués", "15,50 € en línia, 17 € a taquilla (juliol i agost, 18,50 € / 20,50 €)", "Només amb data i hora reservades; reduïda 12 € / 14 €"],
      ["Castell Gala Dalí, Púbol", "10 € en línia, 12 € a taquilla", "Reduïda 7 € / 9 €"],
    ],
    pricesNote: "Fundació Gala-Salvador Dalí: pàgines de visita, preguntes freqüents i entrada combinada, consultades el 21 de novembre de 2026.",
    visit: "Calcula **d'una hora i mitja a dues hores** a dins: és l'estimació de la mateixa Fundació Dalí per veure tot el Teatre-Museu. A l'entrada es revisen les bosses, i no s'hi pot entrar amb motxilles a l'esquena, cotxets, maletes ni objectes de més de 35 × 35 × 25 cm; hi ha consigna. Les persones amb mobilitat reduïda entren per la plaça Gala-Dalí; avisa abans el personal d'accés.",
    faq: [
      { question: "Quant dura la visita al Museu Dalí?", answer: "Segons la Fundació Dalí, veure tot el Teatre-Museu sol portar d'una hora i mitja a dues hores. Suma-hi una hora per trajecte amb alta velocitat des de Barcelona, o dues amb l'R11." },
      { question: "Es pot entrar amb motxilla al Museu Dalí?", answer: "A l'esquena, no: no s'hi admeten motxilles a l'esquena, cotxets, maletes ni objectes de més de 35 × 35 × 25 cm. Les bosses es revisen a l'entrada i hi ha consigna." },
      { question: "Cal reservar l'entrada del Museu Dalí?", answer: "La Fundació ho aconsella. Hi ha taquilla a l'entrada, però l'accés depèn de l'aforament del museu. La Casa de Portlligat només es visita amb data i hora reservades." },
    ],
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  const x = FIG_21NOV[locale];
  return [
    lead(t.lead),
    table(t.tableCaption, t.headers, t.rows, t.tableNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.trainTitle, ...t.train),
    // 21 Nov 2026: the price table first, for "precio entradas museo dali figueres".
    ...h2(t.museumTitle),
    table(x.pricesCaption, x.pricesHeaders, x.pricesRows, x.pricesNote),
    ...paras(...t.museum, x.visit),
    ...h2(t.hoursTitle, ...t.hours),
    table(t.hoursCaption, t.hoursHeaders, t.hoursRows, t.hoursNote),
    ...h2(t.otherWaysTitle, ...t.otherWays),
    ...h2(t.moreTitle),
    list(...t.more),
    ...h2(t.planTitle),
    list(...t.plan),
    faq([...t.faq, ...x.faq]),
    ...b2Related(["girona", "montserratFree", "sitges", "tarragona", "museums", "christmas"], locale),
  ];
}

export const FIGUERES: B2Article = {
  key: "figueres",
  entryKey: "daytrip-figueres-dali-from-barcelona",
  categoryKey: "culture",
  sources: SOURCES,
  heroKey: "figueres-torre-galatea-cupula",
  heroAlt: {
    ca: "La Torre Galatea amb els ous gegants i la cúpula de vidre del Teatre-Museu Dalí",
    es: "La Torre Galatea con los huevos gigantes y la cúpula de cristal del Teatro-Museo Dalí",
    en: "Torre Galatea with its giant eggs and the glass dome of the Dalí Theatre-Museum",
  },
  heroCaption: {
    ca: "La Torre Galatea i la cúpula del museu, a Figueres.",
    es: "La Torre Galatea y la cúpula del museo, en Figueres.",
    en: "Torre Galatea and the museum's dome in Figueres.",
  },
  secondaryKey: "figueres-teatre-museu-dali-facana",
  secondaryAlt: {
    ca: "La façana del Teatre-Museu Dalí amb les escultures a la cornisa",
    es: "La fachada del Teatro-Museo Dalí con las esculturas en la cornisa",
    en: "The front of the Dalí Theatre-Museum with sculptures along the cornice",
  },
  secondaryCaption: {
    ca: "L'entrada del Teatre-Museu, sobre l'antic teatre municipal.",
    es: "La entrada del Teatro-Museo, sobre el antiguo teatro municipal.",
    en: "The museum entrance, built on the old municipal theatre.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T23:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as FIGUERES_META };
