import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  callout,
  faq,
  h2,
  lead,
  list,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Two day trips south of Barcelona by train: Sitges and Tarragona.
 *
 * Train facts from the official Rodalies timetables (R2 of 1 Sep 2026, R15 of
 * 10 Jul 2026); journey times are ranges read off those grids, and the copy
 * says so. Sights from museusdesitges.cat, sitgesanytime.com (Ajuntament de
 * Sitges), tarragona.cat (Museu d'Història de Tarragona) and mnat.cat, checked
 * on 12 Oct 2026 (research_notes/blog-batch-03/sitges_tarragona.md).
 *
 * No train fares: the Rodalies-only single for three zones is on a page
 * stamped 2017, and the Barcelona–Tarragona distance needed for the regional
 * fare table is not published. The copy sends readers to the ticket machine.
 */

const VERIFIED = "2026-10-12";

const SITGES_SOURCES: B2Source[] = [
  { name: "Horaris R2 (Rodalies de Catalunya)", url: "https://rodalies.gencat.cat/web/.content/02_Horaris/horaris/R2.pdf", publisher: "Rodalies de Catalunya" },
  { name: "Museus de Sitges — horaris", url: "https://museusdesitges.cat/ca/horaris", publisher: "Consorci del Patrimoni de Sitges" },
  { name: "Museus de Sitges — tarifes", url: "https://museusdesitges.cat/ca/tarifes", publisher: "Consorci del Patrimoni de Sitges" },
  { name: "Oficines de turisme de Sitges", url: "https://www.sitgesanytime.com/planifica/oficines-de-turisme/", publisher: "Ajuntament de Sitges" },
];

const TARRAGONA_SOURCES: B2Source[] = [
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
    title: "Sitges des de Barcelona en tren: com anar-hi i què veure en un dia",
    seoTitle: "Sitges des de Barcelona en tren: horaris i què veure",
    seoDescription:
      "L'R2 Sud porta de Sants a Sitges en 32-38 minuts, quatre trens per hora. Cau Ferrat i Maricel (12 €), quan és gratis i com organitzar el dia.",
    excerpt: "Com arribar a Sitges en tren des de Barcelona, quant es triga, què veure i quan entrar gratis als museus, amb dades oficials.",
  },
  es: {
    path: "escapadas/sitges-desde-barcelona-tren",
    title: "Sitges desde Barcelona en tren: cómo ir y qué ver en un día",
    seoTitle: "Sitges desde Barcelona en tren: horarios y qué ver",
    seoDescription:
      "La R2 Sud lleva de Sants a Sitges en 32-38 minutos, cuatro trenes por hora. Cau Ferrat y Maricel (12 €), cuándo es gratis y cómo organizar el día.",
    excerpt: "Cómo llegar a Sitges en tren desde Barcelona, cuánto se tarda, qué ver y cuándo entrar gratis a los museos, con datos oficiales.",
  },
  en: {
    path: "day-trips/sitges-from-barcelona-by-train",
    title: "Sitges from Barcelona by train: getting there and a day's sightseeing",
    seoTitle: "Sitges from Barcelona by train: times and what to see",
    seoDescription:
      "The R2 Sud takes 32-38 minutes from Sants to Sitges, four trains an hour. Cau Ferrat and Maricel museums (€12), free days, and how to plan the day.",
    excerpt: "How to get to Sitges by train from Barcelona, how long it takes, what to see and when the museums are free, from official sources.",
  },
};

type SitgesT = {
  lead: string; tableCaption: string; headers: string[]; rows: string[][]; tableNote: string;
  trainTitle: string; train: string[]; ticketTitle: string; ticket: string;
  museumsTitle: string; museums: string[]; townTitle: string; town: string[];
  planTitle: string; plan: string[]; faq: { question: string; answer: string }[]; note: string;
};

const SITGES_COPY: Record<Locale, SitgesT> = {
  en: {
    lead: "Sitges is the easiest seaside day out from Barcelona: **direct trains on the R2 Sud** from Sants, Passeig de Gràcia and Estació de França, about four an hour, and a walkable old town between two beaches with Santiago Rusiñol's Cau Ferrat museum at its tip.",
    tableCaption: "Barcelona to Sitges on the R2 Sud",
    headers: ["From", "Journey time", "Return to the same station"],
    rows: [
      ["Barcelona-Sants", "32–38 min", "37–43 min"],
      ["Passeig de Gràcia", "39–45 min", "42–48 min"],
      ["Estació de França", "50–56 min", "52–58 min"],
    ],
    tableNote: "Ranges read from the official R2 timetable of 1 September 2026; stopping trains take the longer time, semi-fast ones the shorter.",
    trainTitle: "Trains",
    train: [
      "On weekdays there are **four trains an hour** from Sants to Sitges from 6:00 to 21:00, and two an hour later in the evening; weekends follow the same pattern. The first leaves Sants at 5:45 and the last at 0:06. The **last train back** from Sitges leaves at **22:22**, every day, so plan dinner around it.",
      "Only the R2 Sud stops at Sitges: the regional trains (R14 to R17) that also leave Sants southbound run straight through. Rodalies notes that timetables can change, so check the app on the day.",
    ],
    ticketTitle: "Tickets",
    ticket: "Buy a Rodalies ticket to Sitges at the machine or in the Renfe app before boarding, and check the zones it covers there. We do not quote the single fare: the only official Rodalies page that lists it is dated 2017.",
    museumsTitle: "Cau Ferrat and Maricel",
    museums: [
      "The **Museu del Cau Ferrat**, the painter Santiago Rusiñol's home and studio, and the **Museu de Maricel** next door share one ticket: **€12**, or €17 adding the Fundació Stämpfli. Under-17s go free, and everyone gets in free on the **first Wednesday of each month**.",
      "From April to October they open Tuesday to Sunday 10:00–19:00; from November to March, 10:00–17:00. Both close on Mondays.",
    ],
    townTitle: "The town",
    town: [
      "The parish church of Sant Bartomeu i Santa Tecla stands on the headland between the Platja de la Fragata and the old town, and the museums are on Carrer de Fonollar just behind it. The tourist office is on Plaça Eduard Maristany, right next to the station.",
    ],
    planTitle: "A day in Sitges",
    plan: [
      "**Morning:** train from Sants, walk down to the seafront and the church.",
      "**Midday:** Cau Ferrat and Maricel (closed Mondays).",
      "**Afternoon:** beach or the promenade, and a train back before 22:22.",
    ],
    faq: [
      { question: "How long is the train from Barcelona to Sitges?", answer: "32 to 38 minutes from Barcelona-Sants on the R2 Sud, according to the official timetable." },
      { question: "When is the last train from Sitges to Barcelona?", answer: "22:22, every day, on the timetable of 1 September 2026." },
      { question: "Are the Sitges museums free?", answer: "On the first Wednesday of every month, and always for under-17s. Otherwise the Cau Ferrat and Maricel ticket costs €12." },
    ],
    note: "Train times and museum hours change: check Rodalies and the museum before you go.",
  },
  es: {
    lead: "Sitges es la escapada a la costa más fácil desde Barcelona: **trenes directos de la R2 Sud** desde Sants, Passeig de Gràcia y Estació de França, unos cuatro por hora, y un casco antiguo para recorrer a pie entre dos playas, con el museo del Cau Ferrat de Santiago Rusiñol en la punta.",
    tableCaption: "De Barcelona a Sitges en la R2 Sud",
    headers: ["Desde", "Duración", "Vuelta a la misma estación"],
    rows: [
      ["Barcelona-Sants", "32–38 min", "37–43 min"],
      ["Passeig de Gràcia", "39–45 min", "42–48 min"],
      ["Estació de França", "50–56 min", "52–58 min"],
    ],
    tableNote: "Intervalos leídos del horario oficial de la R2 del 1 de septiembre de 2026; los trenes que paran en todas las estaciones tardan más y los semidirectos, menos.",
    trainTitle: "Trenes",
    train: [
      "Los laborables hay **cuatro trenes por hora** de Sants a Sitges de 6:00 a 21:00, y dos por hora más tarde; los fines de semana siguen el mismo patrón. El primero sale de Sants a las 5:45 y el último a las 0:06. El **último tren de vuelta** sale de Sitges a las **22:22**, todos los días: organiza la cena en función de eso.",
      "Solo la R2 Sud para en Sitges: los regionales (R14 a R17) que también salen de Sants hacia el sur pasan sin parar. Rodalies avisa de que los horarios pueden cambiar, así que mira la app el mismo día.",
    ],
    ticketTitle: "Billetes",
    ticket: "Compra un billete de Rodalies a Sitges en la máquina o en la app de Renfe antes de subir, y comprueba allí las zonas que cubre. No damos el precio del sencillo: la única página oficial de Rodalies que lo muestra es de 2017.",
    museumsTitle: "Cau Ferrat y Maricel",
    museums: [
      "El **Museu del Cau Ferrat**, la casa-taller del pintor Santiago Rusiñol, y el **Museu de Maricel**, al lado, comparten entrada: **12 €**, o 17 € con la Fundació Stämpfli. Los menores de 17 entran gratis, y todo el mundo el **primer miércoles de cada mes**.",
      "De abril a octubre abren de martes a domingo de 10:00 a 19:00; de noviembre a marzo, de 10:00 a 17:00. Los dos cierran los lunes.",
    ],
    townTitle: "El pueblo",
    town: [
      "La iglesia parroquial de Sant Bartomeu i Santa Tecla se alza en el promontorio entre la playa de la Fragata y el casco antiguo, y los museos están en la calle Fonollar, justo detrás. La oficina de turismo está en la plaza Eduard Maristany, al lado de la estación.",
    ],
    planTitle: "Un día en Sitges",
    plan: [
      "**Mañana:** tren desde Sants y bajada al paseo marítimo y la iglesia.",
      "**Mediodía:** Cau Ferrat y Maricel (cerrados los lunes).",
      "**Tarde:** playa o paseo, y tren de vuelta antes de las 22:22.",
    ],
    faq: [
      { question: "¿Cuánto tarda el tren de Barcelona a Sitges?", answer: "Entre 32 y 38 minutos desde Barcelona-Sants en la R2 Sud, según el horario oficial." },
      { question: "¿A qué hora sale el último tren de Sitges a Barcelona?", answer: "A las 22:22, todos los días, según el horario del 1 de septiembre de 2026." },
      { question: "¿Los museos de Sitges son gratis?", answer: "El primer miércoles de cada mes, y siempre para menores de 17. Si no, la entrada al Cau Ferrat y Maricel cuesta 12 €." },
    ],
    note: "Los horarios de tren y de museos cambian: compruébalo en Rodalies y en el museo antes de ir.",
  },
  ca: {
    lead: "Sitges és l'escapada a la costa més fàcil des de Barcelona: **trens directes de l'R2 Sud** des de Sants, Passeig de Gràcia i l'Estació de França, uns quatre per hora, i un nucli antic per recórrer a peu entre dues platges, amb el museu del Cau Ferrat de Santiago Rusiñol a la punta.",
    tableCaption: "De Barcelona a Sitges amb l'R2 Sud",
    headers: ["Des de", "Durada", "Tornada a la mateixa estació"],
    rows: [
      ["Barcelona-Sants", "32–38 min", "37–43 min"],
      ["Passeig de Gràcia", "39–45 min", "42–48 min"],
      ["Estació de França", "50–56 min", "52–58 min"],
    ],
    tableNote: "Intervals llegits de l'horari oficial de l'R2 de l'1 de setembre de 2026; els trens que paren a totes les estacions triguen més i els semidirectes, menys.",
    trainTitle: "Trens",
    train: [
      "Els feiners hi ha **quatre trens per hora** de Sants a Sitges de 6:00 a 21:00, i dos per hora més tard; els caps de setmana segueixen el mateix patró. El primer surt de Sants a les 5:45 i l'últim a les 0:06. L'**últim tren de tornada** surt de Sitges a les **22:22**, cada dia: organitza el sopar en funció d'això.",
      "Només l'R2 Sud para a Sitges: els regionals (R14 a R17) que també surten de Sants cap al sud hi passen sense parar. Rodalies avisa que els horaris poden canviar, així que mira l'app el mateix dia.",
    ],
    ticketTitle: "Bitllets",
    ticket: "Compra un bitllet de Rodalies a Sitges a la màquina o a l'app de Renfe abans de pujar, i comprova-hi les zones que cobreix. No en donem el preu del senzill: l'única pàgina oficial de Rodalies que el mostra és del 2017.",
    museumsTitle: "Cau Ferrat i Maricel",
    museums: [
      "El **Museu del Cau Ferrat**, la casa-taller del pintor Santiago Rusiñol, i el **Museu de Maricel**, al costat, comparteixen entrada: **12 €**, o 17 € amb la Fundació Stämpfli. Els menors de 17 hi entren gratis, i tothom el **primer dimecres de cada mes**.",
      "D'abril a octubre obren de dimarts a diumenge de 10:00 a 19:00; de novembre a març, de 10:00 a 17:00. Tots dos tanquen els dilluns.",
    ],
    townTitle: "El poble",
    town: [
      "L'església parroquial de Sant Bartomeu i Santa Tecla s'alça al promontori entre la platja de la Fragata i el nucli antic, i els museus són al carrer de Fonollar, just al darrere. L'oficina de turisme és a la plaça Eduard Maristany, al costat de l'estació.",
    ],
    planTitle: "Un dia a Sitges",
    plan: [
      "**Matí:** tren des de Sants i baixada al passeig marítim i l'església.",
      "**Migdia:** Cau Ferrat i Maricel (tancats els dilluns).",
      "**Tarda:** platja o passeig, i tren de tornada abans de les 22:22.",
    ],
    faq: [
      { question: "Quant triga el tren de Barcelona a Sitges?", answer: "Entre 32 i 38 minuts des de Barcelona-Sants amb l'R2 Sud, segons l'horari oficial." },
      { question: "A quina hora surt l'últim tren de Sitges a Barcelona?", answer: "A les 22:22, cada dia, segons l'horari de l'1 de setembre de 2026." },
      { question: "Els museus de Sitges són gratis?", answer: "El primer dimecres de cada mes, i sempre per als menors de 17. Si no, l'entrada al Cau Ferrat i Maricel costa 12 €." },
    ],
    note: "Els horaris de tren i de museus canvien: comprova-ho a Rodalies i al museu abans d'anar-hi.",
  },
};

function sitgesBody(locale: Locale) {
  const t = SITGES_COPY[locale];
  return [
    lead(t.lead),
    table(t.tableCaption, t.headers, t.rows, t.tableNote),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.trainTitle, ...t.train),
    ...h2(t.ticketTitle, t.ticket),
    ...h2(t.museumsTitle, ...t.museums),
    ...h2(t.townTitle, ...t.town),
    ...h2(t.planTitle),
    list(...t.plan),
    faq(t.faq),
    ...b2Related(["tarragona", "girona", "montserratFree"], locale),
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
    title: "Tarragona des de Barcelona en tren: la Tàrraco romana en un dia",
    seoTitle: "Tarragona des de Barcelona en tren: Tàrraco en un dia",
    seoDescription:
      "Tren regional de Sants a Tarragona en 71 minuts, cada mitja hora. Entrada als espais romans (5 € o 15 € tots cinc), horaris d'hivern i dies gratuïts.",
    excerpt: "Com anar a Tarragona en tren des de Barcelona i veure la Tàrraco romana en un dia: trens, entrades, horaris i dies de portes obertes.",
  },
  es: {
    path: "escapadas/tarragona-desde-barcelona-tren",
    title: "Tarragona desde Barcelona en tren: la Tarraco romana en un día",
    seoTitle: "Tarragona desde Barcelona en tren: Tarraco en un día",
    seoDescription:
      "Tren regional de Sants a Tarragona en 71 minutos, cada media hora. Entrada a los recintos romanos (5 € o 15 € los cinco), horario de invierno y días gratis.",
    excerpt: "Cómo ir a Tarragona en tren desde Barcelona y ver la Tarraco romana en un día: trenes, entradas, horarios y jornadas de puertas abiertas.",
  },
  en: {
    path: "day-trips/tarragona-from-barcelona-by-train",
    title: "Tarragona from Barcelona by train: Roman Tarraco in a day",
    seoTitle: "Tarragona from Barcelona by train: Roman Tarraco in a day",
    seoDescription:
      "Regional trains from Sants reach Tarragona in 71 minutes, every half hour. Roman sites €5 each or €15 for all five, winter hours and free days.",
    excerpt: "How to reach Tarragona by train from Barcelona and see Roman Tarraco in a day: trains, tickets, opening hours and free open days.",
  },
};

type TarragonaT = {
  lead: string; trainTitle: string; train: string[]; sitesTitle: string; sites: string[];
  tableCaption: string; headers: string[]; rows: string[][]; tableNote: string;
  freeTitle: string; free: string; mnatTitle: string; mnat: string;
  planTitle: string; plan: string[]; faq: { question: string; answer: string }[]; note: string;
};

const TARRAGONA_COPY: Record<Locale, TarragonaT> = {
  en: {
    lead: "Tarragona was Tarraco, the capital of Roman Hispania Citerior, and its amphitheatre, circus, walls and forum are a UNESCO World Heritage site. Regional trains from Barcelona-Sants get there in **71 minutes**, roughly **every half hour**.",
    trainTitle: "Trains",
    train: [
      "Regional lines **R14, R15, R16 and R17** run from Estació de França, Passeig de Gràcia and Sants to Tarragona station, which is in the city by the sea; on the official timetable every train takes 71 minutes from Sants, 78 from Passeig de Gràcia and 89 from França. Departures from Sants are at about :03 and :33 past the hour, roughly from 6:03 to 22:03, with the last trains back around 22:26; some run only on weekdays or weekends, so check the day's timetable.",
      "Do not confuse it with **Camp de Tarragona**, the high-speed station outside the city. The commuter R2 Sud ends at Sant Vicenç de Calders and does not reach Tarragona. Fares on this line are distance-based: buy at the machine or in the Renfe app.",
    ],
    sitesTitle: "The Roman sites",
    sites: [
      "The city's history museum runs five Roman sites: the **Amphitheatre**, the **Circus with the Praetorium**, the **Archaeological Promenade** along the walls, the **Colonial Forum** and **Casa Canals**. A single site costs **€5**; a joint ticket for all five costs **€15**. Under-12s go free; ages 12 to 17, students and retired people pay half.",
    ],
    tableCaption: "Opening hours from 27 October to 31 March",
    headers: ["Site", "Tuesday to Friday", "Saturday", "Sunday and holidays"],
    rows: [
      ["Amphitheatre, Archaeological Promenade, Colonial Forum", "9:00–18:30", "9:30–18:30", "9:30–14:30"],
      ["Circus–Praetorium, Casa Canals", "9:00–20:00", "9:30–20:00", "9:30–14:30"],
    ],
    tableNote: "All closed on Mondays. Last entry 30 minutes before closing. From 1 April to 26 October they open Tuesday to Saturday 9:00–20:45.",
    freeTitle: "Free days",
    free: "The Roman sites are free on the **last Tuesday of every month**, and the city has also announced free entry on 28 and 29 November for the anniversary of the UNESCO listing. The Roman aqueduct (Pont del Diable), outside the centre, is always free.",
    mnatTitle: "The archaeological museum",
    mnat: "The Museu Nacional Arqueològic de Tarragona on Plaça del Rei is **closed for renovation**; the museum plans to reopen it in the last quarter of 2026. Check mnat.cat before planning around it.",
    planTitle: "A day in Tarragona",
    plan: [
      "**Morning:** train to Tarragona and up to the Amphitheatre, above the beach.",
      "**Midday:** the Circus and Praetorium, then lunch in the Part Alta, the old town.",
      "**Afternoon:** the Archaeological Promenade along the Roman walls; in winter it closes at 18:30.",
    ],
    faq: [
      { question: "How long is the train from Barcelona to Tarragona?", answer: "71 minutes from Barcelona-Sants on the regional trains R14 to R17, according to the official timetable." },
      { question: "How much does it cost to see the Roman sites in Tarragona?", answer: "€5 for one site or €15 for all five; under-12s free, and everyone free on the last Tuesday of the month." },
      { question: "Is the Tarragona archaeological museum open?", answer: "Not as of October 2026: it is closed for renovation, with reopening planned for the last quarter of 2026." },
    ],
    note: "Train times and site hours change by season: check Rodalies and the city museum before you go.",
  },
  es: {
    lead: "Tarragona fue Tarraco, la capital de la Hispania Citerior romana, y su anfiteatro, circo, murallas y foro son Patrimonio Mundial de la UNESCO. Los regionales desde Barcelona-Sants llegan en **71 minutos**, aproximadamente **cada media hora**.",
    trainTitle: "Trenes",
    train: [
      "Las líneas regionales **R14, R15, R16 y R17** van de Estació de França, Passeig de Gràcia y Sants a la estación de Tarragona, en la ciudad, junto al mar; según el horario oficial todos los trenes tardan 71 minutos desde Sants, 78 desde Passeig de Gràcia y 89 desde França. Salen de Sants hacia las :03 y las :33 de cada hora, aproximadamente de 6:03 a 22:03, y los últimos de vuelta, hacia las 22:26; algunos solo circulan laborables o fines de semana, así que consulta el horario del día.",
      "No la confundas con **Camp de Tarragona**, la estación de alta velocidad fuera de la ciudad. La R2 Sud termina en Sant Vicenç de Calders y no llega a Tarragona. Las tarifas de esta línea van por distancia: compra en la máquina o en la app de Renfe.",
    ],
    sitesTitle: "Los recintos romanos",
    sites: [
      "El museo de historia de la ciudad gestiona cinco recintos romanos: el **Anfiteatro**, el **Circo con el Pretorio**, el **Paseo Arqueológico** junto a las murallas, el **Foro de la Colonia** y la **Casa Canals**. Un recinto cuesta **5 €**; la entrada conjunta a los cinco, **15 €**. Los menores de 12 entran gratis; de 12 a 17 años, estudiantes y jubilados pagan la mitad.",
    ],
    tableCaption: "Horario del 27 de octubre al 31 de marzo",
    headers: ["Recinto", "Martes a viernes", "Sábado", "Domingo y festivos"],
    rows: [
      ["Anfiteatro, Paseo Arqueológico, Foro de la Colonia", "9:00–18:30", "9:30–18:30", "9:30–14:30"],
      ["Circo–Pretorio, Casa Canals", "9:00–20:00", "9:30–20:00", "9:30–14:30"],
    ],
    tableNote: "Todos cierran los lunes. Último acceso 30 minutos antes del cierre. Del 1 de abril al 26 de octubre abren de martes a sábado de 9:00 a 20:45.",
    freeTitle: "Días gratis",
    free: "Los recintos romanos son gratuitos el **último martes de cada mes**, y la ciudad ha anunciado también entrada libre el 28 y el 29 de noviembre por el aniversario de la declaración de la UNESCO. El acueducto romano (Pont del Diable), fuera del centro, es siempre gratuito.",
    mnatTitle: "El museo arqueológico",
    mnat: "El Museu Nacional Arqueològic de Tarragona de la plaza del Rei está **cerrado por renovación**; el museo prevé reabrirlo en el último trimestre de 2026. Consulta mnat.cat antes de contar con él.",
    planTitle: "Un día en Tarragona",
    plan: [
      "**Mañana:** tren a Tarragona y subida al Anfiteatro, sobre la playa.",
      "**Mediodía:** el Circo y el Pretorio, y comida en la Part Alta, el casco antiguo.",
      "**Tarde:** el Paseo Arqueológico junto a las murallas romanas; en invierno cierra a las 18:30.",
    ],
    faq: [
      { question: "¿Cuánto tarda el tren de Barcelona a Tarragona?", answer: "71 minutos desde Barcelona-Sants en los regionales R14 a R17, según el horario oficial." },
      { question: "¿Cuánto cuesta ver los recintos romanos de Tarragona?", answer: "5 € un recinto o 15 € los cinco; los menores de 12 gratis, y todo el mundo gratis el último martes de cada mes." },
      { question: "¿Está abierto el museo arqueológico de Tarragona?", answer: "No a octubre de 2026: está cerrado por renovación y prevé reabrir en el último trimestre de 2026." },
    ],
    note: "Los horarios de tren y de los recintos cambian según la temporada: compruébalo en Rodalies y en el museo antes de ir.",
  },
  ca: {
    lead: "Tarragona va ser Tàrraco, la capital de la Hispània Citerior romana, i el seu amfiteatre, circ, muralles i fòrum són Patrimoni Mundial de la UNESCO. Els regionals des de Barcelona-Sants hi arriben en **71 minuts**, aproximadament **cada mitja hora**.",
    trainTitle: "Trens",
    train: [
      "Les línies regionals **R14, R15, R16 i R17** van de l'Estació de França, Passeig de Gràcia i Sants a l'estació de Tarragona, a la ciutat, arran de mar; segons l'horari oficial tots els trens triguen 71 minuts des de Sants, 78 des de Passeig de Gràcia i 89 des de França. Surten de Sants cap a les :03 i les :33 de cada hora, aproximadament de 6:03 a 22:03, i els últims de tornada, cap a les 22:26; alguns només circulen feiners o caps de setmana, així que consulta l'horari del dia.",
      "No la confonguis amb **Camp de Tarragona**, l'estació d'alta velocitat fora de la ciutat. L'R2 Sud acaba a Sant Vicenç de Calders i no arriba a Tarragona. Les tarifes d'aquesta línia van per distància: compra a la màquina o a l'app de Renfe.",
    ],
    sitesTitle: "Els recintes romans",
    sites: [
      "El museu d'història de la ciutat gestiona cinc recintes romans: l'**Amfiteatre**, el **Circ amb el Pretori**, el **Passeig Arqueològic** de les muralles, el **Fòrum de la Colònia** i la **Casa Canals**. Un recinte costa **5 €**; l'entrada conjunta als cinc, **15 €**. Els menors de 12 hi entren gratis; de 12 a 17 anys, estudiants i jubilats paguen la meitat.",
    ],
    tableCaption: "Horari del 27 d'octubre al 31 de març",
    headers: ["Recinte", "Dimarts a divendres", "Dissabte", "Diumenge i festius"],
    rows: [
      ["Amfiteatre, Passeig Arqueològic, Fòrum de la Colònia", "9:00–18:30", "9:30–18:30", "9:30–14:30"],
      ["Circ–Pretori, Casa Canals", "9:00–20:00", "9:30–20:00", "9:30–14:30"],
    ],
    tableNote: "Tots tanquen els dilluns. Últim accés 30 minuts abans del tancament. De l'1 d'abril al 26 d'octubre obren de dimarts a dissabte de 9:00 a 20:45.",
    freeTitle: "Dies gratis",
    free: "Els recintes romans són gratuïts l'**últim dimarts de cada mes**, i la ciutat ha anunciat també entrada lliure el 28 i el 29 de novembre per l'aniversari de la declaració de la UNESCO. L'aqüeducte romà (Pont del Diable), fora del centre, és sempre gratuït.",
    mnatTitle: "El museu arqueològic",
    mnat: "El Museu Nacional Arqueològic de Tarragona de la plaça del Rei és **tancat per renovació**; el museu preveu reobrir-lo l'últim trimestre del 2026. Consulta mnat.cat abans de comptar-hi.",
    planTitle: "Un dia a Tarragona",
    plan: [
      "**Matí:** tren a Tarragona i pujada a l'Amfiteatre, sobre la platja.",
      "**Migdia:** el Circ i el Pretori, i dinar a la Part Alta, el nucli antic.",
      "**Tarda:** el Passeig Arqueològic de les muralles romanes; a l'hivern tanca a les 18:30.",
    ],
    faq: [
      { question: "Quant triga el tren de Barcelona a Tarragona?", answer: "71 minuts des de Barcelona-Sants amb els regionals R14 a R17, segons l'horari oficial." },
      { question: "Quant costa veure els recintes romans de Tarragona?", answer: "5 € un recinte o 15 € tots cinc; els menors de 12 gratis, i tothom gratis l'últim dimarts de cada mes." },
      { question: "És obert el museu arqueològic de Tarragona?", answer: "No a octubre del 2026: és tancat per renovació i preveu reobrir l'últim trimestre del 2026." },
    ],
    note: "Els horaris de tren i dels recintes canvien segons la temporada: comprova-ho a Rodalies i al museu abans d'anar-hi.",
  },
};

function tarragonaBody(locale: Locale) {
  const t = TARRAGONA_COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.trainTitle, ...t.train),
    ...h2(t.sitesTitle, ...t.sites),
    table(t.tableCaption, t.headers, t.rows, t.tableNote),
    ...h2(t.freeTitle, t.free),
    ...h2(t.mnatTitle, t.mnat),
    ...h2(t.planTitle),
    list(...t.plan),
    faq(t.faq),
    ...b2Related(["sitges", "figueres", "girona", "montserratFree"], locale),
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
