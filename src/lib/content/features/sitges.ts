import type { Block } from "@/lib/content/blocks";
import {
  ARTICLE_PATHS,
  callout,
  h2,
  keyFacts,
  lead,
  link,
  list,
  paras,
  relatedBlocks,
  type FeatureArticle,
} from "./shared";

/**
 * Article 4 — the Sitges Film Festival, for a first-timer.
 *
 * Evergreen URL with no year in it, so the guide is rewritten in place each
 * autumn rather than leaving a trail of dated pages that rank against each
 * other. The dates and edition number are verified against the festival's own
 * rules page: 59th edition, 8-18 October 2026.
 *
 * The screening schedule is NOT published at the time of writing, and this
 * article says so instead of inventing a grid. That is the single most likely
 * way a festival guide misleads someone into missing a film.
 */

const FESTIVAL = "https://sitgesfilmfestival.com/";
const RULES = "https://sitgesfilmfestival.com/en/edition/rules-regulations";
const VENUES = "https://sitgesfilmfestival.com/en/festival/venues";
const RODALIES = "https://rodalies.gencat.cat/ca/horaris/tots-els-horaris/";

function ca(): Block[] {
  return [
    lead(
      "Del 8 al 18 d'octubre de 2026, Sitges torna a convertir-se en un dels centres mundials del cinema fantàstic. És la 59a edició.",
    ),
    ...paras(
      "Anar-hi per primera vegada pot ser confús: diverses sales repartides per la vila, sessions des de primera hora del matí, activitats paral·leles, cues, abonaments, estrenes i una població que durant deu dies funciona a un ritme completament diferent.",
      "Aquesta guia està pensada per evitar els errors més habituals del primer any.",
    ),
    keyFacts("Dades essencials", [
      { label: "Edició", value: "59a" },
      { label: "Dates", value: "8–18 d'octubre de 2026" },
      { label: "On", value: "Sitges (Garraf)" },
      { label: "Com arribar-hi", value: "Rodalies R2 Sud des de Barcelona" },
      { label: "Graella completa", value: "Pendent de publicació a 17 de setembre" },
      { label: "Entrades", value: "Només pels canals oficials del Festival" },
    ]),
    callout(
      "warning",
      "El programa complet encara no hi és",
      "A 17 de setembre de 2026, la web oficial encara indica que el calendari complet de sessions es publicarà properament. Desconfia de qualsevol graella d'horaris que circuli abans que el Festival la publiqui, i no compris res fora dels canals oficials.",
    ),
    ...h2(
      "Què se sap ja de l'edició 2026",
      "El Festival ha anunciat que la pel·lícula inaugural serà **Found Alive**, de Carlota Pereda, protagonitzada per Chloë Grace Moretz.",
      "La clausura anunciada és **Wicker**, amb Olivia Colman i Alexander Skarsgård.",
      "Entre els noms que el Festival ha anunciat per a homenatges, premis i activitats d'aquesta edició hi ha Peter Jackson, Danny DeVito, Amy Irving, Robert Eggers, Yuen Woo-ping, Takashi Shimizu, Rick Baker, Kevin Bacon, Kyra Sedgwick, Meiko Kaji i Adrienne Barbeau.",
      "Un matís que estalvia decepcions: un anunci de premi o homenatge no equival sempre a presència física garantida en una data concreta. Comprova-ho a la web oficial abans de planificar un dia sencer al voltant d'una persona.",
    ),
    ...h2("Com funcionen les sales"),
    ...paras(
      "Les seus no estan totes al mateix lloc, i això és el que més descol·loca el primer any. Aquestes són les principals:",
    ),
    list(
      "**Auditori del Meliá Sitges** — la sala gran i el centre neuràlgic del Festival.",
      "**Sala Tramuntana** — també dins l'entorn del Meliá.",
      "**Sala Llevant / Brigadoon** — la secció dedicada al cinema de culte, alternatiu i més radical.",
      "**Cinema Prado** — una de les sales històriques de la vila, molt estimada pels habituals.",
      "**Escorxador – Centre Cultural** — espai cultural integrat al circuit oficial.",
      "**Miramar – Centre Cultural** — segona seu cultural municipal.",
      "**Meeting** — espai exterior de trobada amb activitats, música, projeccions i podcasts.",
      "**Fanshop** i **Foodtastic** — botiga oficial i zona de food trucks vora el mar.",
    ),
    ...paras(`Llistat i ubicacions oficials: [sitgesfilmfestival.com](${VENUES}).`),
    ...h2(
      "Primer consell: no intentis veure-ho tot",
      "L'error més comú del primer any és construir una agenda impossible. Sitges funciona molt millor si tries unes quantes prioritats i deixes espai per al que hi ha entremig.",
    ),
    list(
      "Desplaçaments a peu entre sales.",
      "Cues, que en les sessions més esperades comencen bastant abans.",
      "Menjar, que a mig festival és més complicat del que sembla.",
      "Activitats paral·leles i trobades inesperades.",
    ),
    ...h2(
      "Entrades i abonaments",
      "El Festival ven abonaments, packs i entrades individuals. Els formats i els preus canvien cada any, i alguns abonaments s'exhaureixen setmanes abans de començar.",
      "No publicarem aquí disponibilitat concreta, perquè canvia d'un dia per l'altre. Mira-ho a la web oficial el mateix dia que decideixis comprar, i compra només allà.",
    ),
    ...h2(
      "Com arribar-hi des de Barcelona",
      "El tren és una de les opcions més pràctiques. Sitges té estació de Rodalies, a la línia R2 Sud, i el centre es recorre a peu.",
      "La planificació del **retorn** és el que més sovint es descuida: les sessions de nit acaben tard i l'últim tren no espera ningú. Comprova l'horari de tornada abans de comprar una entrada de sessió nocturna, i no et refiïs d'horaris d'edicions anteriors.",
      `Horaris oficials: [rodalies.gencat.cat](${RODALIES}). Si vols fer-ne una escapada de dia, ${link("trains", "ca", "Sitges també encapçala la nostra llista d'escapades en tren")}.`,
    ),
    ...h2(
      "Val la pena anar-hi sense entrada?",
      "Sí, però amb una expectativa diferent. Durant el Festival, Sitges té ambient de carrer, espais paral·lels, Fanshop, Meeting i activitats obertes.",
      "Si l'objectiu és veure cinema, reserva sessions. Si l'objectiu és viure l'ambient, es pot gaudir bona part del dia sense passar-lo dins d'una sala.",
    ),
    ...h2("L'estratègia que recomanem per a un primer any"),
    { type: "steps", title: "Set passos", items: [
      { title: "Tria una jornada", text: "Millor un dia ben aprofitat que quatre a mitges." },
      { title: "Selecciona dues o tres pel·lícules prioritàries", text: "Deixa la resta com a opcional." },
      { title: "Reserva marge entre sales", text: "No encadenis sessions en seus diferents sense aire enmig." },
      { title: "Consulta les ubicacions abans d'arribar", text: "Les seus no són totes al mateix punt de la vila." },
      { title: "Compra només pels canals oficials", text: "És l'única manera de saber què estàs comprant." },
      { title: "Ignora captures antigues del programa", text: "Una graella d'un altre any no et serveix de res." },
      { title: "Revisa la web oficial el mateix matí", text: "Els canvis d'última hora existeixen." },
    ] } as Block,
    ...paras(
      `Web oficial del Festival: [sitgesfilmfestival.com](${FESTIVAL}). Dates i bases de l'edició: [rules & regulations](${RULES}).`,
    ),
    ...relatedBlocks(["trains", "weekend", "foodfairs", "castanyada", "traps"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "Del 8 al 18 de octubre de 2026, Sitges vuelve a convertirse en uno de los centros mundiales del cine fantástico. Es la 59ª edición.",
    ),
    ...paras(
      "Ir por primera vez puede ser confuso: varias salas repartidas por la localidad, sesiones desde primera hora, actividades paralelas, colas, abonos, estrenos y un pueblo que durante diez días funciona a un ritmo completamente distinto.",
      "Esta guía está pensada para evitar los errores más habituales del primer año.",
    ),
    keyFacts("Datos esenciales", [
      { label: "Edición", value: "59ª" },
      { label: "Fechas", value: "8–18 de octubre de 2026" },
      { label: "Dónde", value: "Sitges (Garraf)" },
      { label: "Cómo llegar", value: "Rodalies R2 Sud desde Barcelona" },
      { label: "Programación completa", value: "Pendiente de publicar a 17 de septiembre" },
      { label: "Entradas", value: "Solo por los canales oficiales del Festival" },
    ]),
    callout(
      "warning",
      "La programación completa todavía no está",
      "A 17 de septiembre de 2026 la web oficial sigue indicando que el calendario completo de sesiones se publicará próximamente. Desconfía de cualquier parrilla de horarios que circule antes de que el Festival la publique, y no compres fuera de los canales oficiales.",
    ),
    ...h2(
      "Qué se sabe ya de la edición 2026",
      "El Festival ha anunciado que la película inaugural será **Found Alive**, de Carlota Pereda, protagonizada por Chloë Grace Moretz.",
      "La clausura anunciada es **Wicker**, con Olivia Colman y Alexander Skarsgård.",
      "Entre los nombres anunciados por el Festival para homenajes, premios y actividades de esta edición figuran Peter Jackson, Danny DeVito, Amy Irving, Robert Eggers, Yuen Woo-ping, Takashi Shimizu, Rick Baker, Kevin Bacon, Kyra Sedgwick, Meiko Kaji y Adrienne Barbeau.",
      "Un matiz que ahorra decepciones: el anuncio de un premio u homenaje no equivale siempre a presencia física garantizada en una fecha concreta. Confírmalo en la web oficial antes de planificar un día entero alrededor de alguien.",
    ),
    ...h2("Cómo funcionan las salas"),
    ...paras("Las sedes no están todas en el mismo sitio, y eso es lo que más descoloca el primer año:"),
    list(
      "**Auditorio del Meliá Sitges** — la sala grande y el centro neurálgico del Festival.",
      "**Sala Tramuntana** — también dentro del entorno del Meliá.",
      "**Sala Llevant / Brigadoon** — la sección dedicada al cine de culto y más radical.",
      "**Cinema Prado** — una de las salas históricas de la localidad.",
      "**Escorxador – Centre Cultural** — espacio cultural integrado en el circuito oficial.",
      "**Miramar – Centre Cultural** — segunda sede cultural municipal.",
      "**Meeting** — espacio exterior de encuentro con actividades, música, proyecciones y podcasts.",
      "**Fanshop** y **Foodtastic** — tienda oficial y zona de food trucks junto al mar.",
    ),
    ...paras(`Listado y ubicaciones oficiales: [sitgesfilmfestival.com](${VENUES}).`),
    ...h2(
      "Primer consejo: no intentes verlo todo",
      "El error más común del primer año es construir una agenda imposible. Sitges funciona mucho mejor eligiendo unas pocas prioridades y dejando espacio para lo que hay entremedias: desplazamientos a pie, colas, comer y actividades paralelas.",
    ),
    ...h2(
      "Entradas y abonos",
      "El Festival vende abonos, packs y entradas individuales. Los formatos y precios cambian cada año, y algunos abonos se agotan semanas antes de empezar.",
      "No publicamos aquí disponibilidad concreta porque cambia de un día para otro. Míralo en la web oficial el mismo día que decidas comprar, y compra solo ahí.",
    ),
    ...h2(
      "Cómo llegar desde Barcelona",
      "El tren es una de las opciones más prácticas. Sitges tiene estación de Rodalies, en la línea R2 Sud, y el centro se recorre a pie.",
      "Lo que más se descuida es la **vuelta**: las sesiones nocturnas terminan tarde y el último tren no espera. Comprueba el horario de regreso antes de comprar una entrada de noche, y no te fíes de horarios de ediciones anteriores.",
      `Horarios oficiales: [rodalies.gencat.cat](${RODALIES}). Si quieres convertirlo en escapada de día, ${link("trains", "es", "Sitges también encabeza nuestra lista de escapadas en tren")}.`,
    ),
    ...h2(
      "¿Merece la pena ir sin entrada?",
      "Sí, pero con otra expectativa. Durante el Festival, Sitges tiene ambiente de calle, espacios paralelos, Fanshop, Meeting y actividades abiertas.",
      "Si el objetivo es ver cine, reserva sesiones. Si el objetivo es el ambiente, se puede disfrutar buena parte del día sin pasarlo dentro de una sala.",
    ),
    ...h2(
      "La estrategia para un primer año",
      "Elige una jornada y aprovéchala bien. Selecciona dos o tres películas prioritarias y deja el resto como opcional. Reserva margen entre salas. Consulta las ubicaciones antes de llegar. Compra solo por canales oficiales. Ignora capturas antiguas del programa y revisa la web oficial esa misma mañana.",
    ),
    ...paras(
      `Web oficial: [sitgesfilmfestival.com](${FESTIVAL}). Fechas y bases de la edición: [rules & regulations](${RULES}).`,
    ),
    ...relatedBlocks(["trains", "weekend", "foodfairs", "castanyada", "traps"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "From 8 to 18 October 2026, Sitges becomes one of the world's major centres for fantastic cinema. This is the 59th edition.",
    ),
    ...paras(
      "If you are staying in Barcelona and have never been to a film festival in Spain, the practical details matter more than the line-up. Venues are scattered around a small seaside town, screenings start early, queues form, and passes work differently from single tickets.",
    ),
    keyFacts("The essentials", [
      { label: "Edition", value: "59th" },
      { label: "Dates", value: "8–18 October 2026" },
      { label: "Where", value: "Sitges, on the coast south of Barcelona" },
      { label: "Getting there", value: "Rodalies line R2 Sud from Barcelona" },
      { label: "Full schedule", value: "Not yet published as of 17 September" },
      { label: "Tickets", value: "Official festival channels only" },
    ]),
    callout(
      "warning",
      "The full schedule is not out yet",
      "As of 17 September 2026, the official site still lists the complete screening calendar as coming soon. Treat any timetable circulating before the festival publishes its own as unreliable, and buy only through official channels.",
    ),
    ...h2(
      "What has been announced",
      "The opening film is **Found Alive**, directed by Carlota Pereda and starring Chloë Grace Moretz.",
      "The announced closing film is **Wicker**, with Olivia Colman and Alexander Skarsgård.",
      "Names announced by the festival for awards, tributes and activities this year include Peter Jackson, Danny DeVito, Amy Irving, Robert Eggers, Yuen Woo-ping, Takashi Shimizu, Rick Baker, Kevin Bacon, Kyra Sedgwick, Meiko Kaji and Adrienne Barbeau.",
      "One caveat worth knowing: an announced award or tribute does not always mean a guaranteed appearance on a specific date. Check the official site before building a whole day around one person.",
    ),
    ...h2("The venues"),
    ...paras(
      "They are not all in one place, which is what catches out first-timers. The main ones:",
    ),
    list(
      "**Meliá Sitges Auditorium** — the main screen and the festival's hub.",
      "**Sala Tramuntana** — also within the Meliá complex.",
      "**Sala Llevant / Brigadoon** — the cult, alternative and more extreme strand.",
      "**Cinema Prado** — one of the town's historic cinemas, and a regulars' favourite.",
      "**Escorxador Cultural Centre** and **Miramar Cultural Centre** — municipal venues in the official circuit.",
      "**Meeting** — an open-air gathering space with activities, music, screenings and podcasts.",
      "**Fanshop** and **Foodtastic** — the official store and a food-truck area by the sea.",
    ),
    ...paras(`Official venue list: [sitgesfilmfestival.com](${VENUES}).`),
    ...h2(
      "Do not try to see everything",
      "The classic first-year mistake is an impossible schedule. Sitges works far better when you pick a few priorities and leave room for walking between venues, queueing, eating and the things you did not plan.",
    ),
    ...h2(
      "Passes and tickets",
      "The festival sells accreditations, packs and single tickets. Formats and prices change each year, and some passes sell out weeks in advance.",
      "We do not publish availability here because it changes daily. Check the official site on the day you decide to buy — and buy only there.",
    ),
    ...h2(
      "Getting there from Barcelona",
      "Commuter rail is the practical option. Sitges is on Rodalies line R2 Sud, and the town centre is walkable from the station.",
      "The **return** is what people forget. Late screenings finish late and the last train does not wait. Check return times before booking an evening screening, and do not rely on special timetables from previous editions.",
      `Official timetables: [rodalies.gencat.cat](${RODALIES}). Sitges also tops ${link("trains", "en", "our list of day trips by train")} if you want to visit outside festival season.`,
    ),
    ...h2(
      "Is it worth going without a ticket?",
      "Yes, with different expectations. During the festival the town has a street atmosphere, open venues, the Fanshop, the Meeting space and public activities.",
      "If you want to watch films, book screenings. If you want the atmosphere, much of the day can be enjoyed outside a cinema.",
    ),
    ...paras(
      `Official site: [sitgesfilmfestival.com](${FESTIVAL}). Dates and regulations: [rules & regulations](${RULES}).`,
    ),
    ...relatedBlocks(["trains", "weekend", "foodfairs", "castanyada", "traps"], "en"),
  ];
}

export const SITGES: FeatureArticle = {
  key: "sitges",
  entryKey: "feature-sitges-festival",
  categoryKey: "festivals",
  heroKey: "festival-sitges-2026-cinema-fantastic",
  secondaryKey: "sitges-festival-cinema-nit",
  heroAlt: {
    ca: "Ambient de festival de cinema fantàstic a Sitges",
    es: "Ambiente de festival de cine fantástico en Sitges",
    en: "Fantastic film festival atmosphere in Sitges",
  },
  heroCaption: {
    ca: "Imatge representativa de l'ambient del festival. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa del ambiente del festival. Ilustración generada con inteligencia artificial.",
    en: "Representative image of the festival atmosphere. Illustration generated with artificial intelligence.",
  },
  secondaryAlt: {
    ca: "Sitges de nit durant el festival de cinema",
    es: "Sitges de noche durante el festival de cine",
    en: "Sitges at night during the film festival",
  },
  secondaryCaption: {
    ca: "Imatge representativa de Sitges de nit. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de Sitges de noche. Ilustración generada con inteligencia artificial.",
    en: "Representative image of Sitges at night. Illustration generated with artificial intelligence.",
  },
  sources: [
    { name: "Sitges Film Festival — bases i dates de l'edició", url: RULES, publisher: "Sitges Film Festival" },
    { name: "Sitges Film Festival — seus", url: VENUES, publisher: "Sitges Film Festival" },
    { name: "Sitges Film Festival", url: FESTIVAL, publisher: "Sitges Film Festival" },
    { name: "Horaris de Rodalies de Catalunya", url: RODALIES, publisher: "Generalitat de Catalunya" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.sitges.ca,
      title: "Festival de Sitges 2026: la guia definitiva per viure'l per primera vegada",
      seoTitle: "Festival de Sitges 2026: guia per anar-hi per primera vegada",
      seoDescription:
        "59a edició del Festival de Sitges, del 8 al 18 d'octubre de 2026: sales, entrades, com arribar-hi en tren i què s'ha anunciat.",
      excerpt:
        "59a edició, del 8 al 18 d'octubre de 2026. Sales, entrades, com arribar-hi en tren i què està confirmat i què no.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.sitges.es,
      title: "Festival de Sitges 2026: la guía definitiva para vivirlo por primera vez",
      seoTitle: "Festival de Sitges 2026: guía para ir por primera vez",
      seoDescription:
        "59ª edición del Festival de Sitges, del 8 al 18 de octubre de 2026: salas, entradas, cómo llegar en tren y qué se ha anunciado.",
      excerpt:
        "59ª edición, del 8 al 18 de octubre de 2026. Salas, entradas, cómo llegar en tren y qué está confirmado y qué no.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.sitges.en,
      title: "Sitges Film Festival 2026: the ultimate first-timer's guide",
      seoTitle: "Sitges Film Festival 2026: a first-timer's guide",
      seoDescription:
        "The 59th Sitges Film Festival runs 8–18 October 2026. Venues, passes, getting there by train, and what has actually been announced.",
      excerpt:
        "The 59th edition runs 8–18 October 2026. Venues, passes, getting there by train, and what is confirmed versus what is not.",
      blocks: en(),
    },
  },
};
