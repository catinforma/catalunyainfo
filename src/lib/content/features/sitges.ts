import type { Block } from "@/lib/content/blocks";
import { b2link } from "@/lib/content/batch02/shared";
import {
  ARTICLE_PATHS,
  h2,
  keyFacts,
  lead,
  link,
  list,
  paras,
  relatedBlocks,
  table,
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
 * The guide never invents a screening grid: that is the single most likely way
 * a festival guide makes somebody miss a film.
 *
 * Updated 1 October 2026. Until then this said the schedule was not published,
 * which had become false: the line-up is out and the official site's session
 * finder is live, filterable by day, venue and section. Search Console shows
 * `sitges film festival 2026 schedule` as the top query reaching this page, at
 * position 7.7 with no clicks - the page was ranking for exactly the question
 * it had stopped answering correctly.
 *
 * Updated 26 October 2026 (research_notes/rank-all/review-7-features.md): the
 * 59th edition ended on 18 October, so the page is now "2026 results + the
 * next edition + the evergreen first-timer guide". The session-grid callout
 * and the pre-festival "announced names" section are gone; the palmarès table
 * is copied from the festival's own news of 17 October 2026. The festival had
 * not announced the next edition's dates on 26 October. When it does, rewrite
 * the titles and the lead to the new year in one change. Titles untouched
 * here: demand is near zero until then, so a title change would be unreadable.
 */

const FESTIVAL = "https://sitgesfilmfestival.com/";
const PALMARES = "https://sitgesfilmfestival.com/ca/noticies/sanguine-marion-corroller-millor-pellicula-sitges-2026";
const RULES = "https://sitgesfilmfestival.com/en/edition/rules-regulations";
const VENUES = "https://sitgesfilmfestival.com/en/festival/venues";
const RODALIES = "https://rodalies.gencat.cat/ca/horaris/tots-els-horaris/";

function ca(): Block[] {
  return [
    lead(
      "La 59a edició del Festival de Sitges es va fer del 8 al 18 d'octubre de 2026, i el premi a la Millor Pel·lícula va ser per a **Sanguine**, de Marion Le Corroller. El Festival encara no ha anunciat les dates de la pròxima edició (comprovat el 26 d'octubre de 2026); quan les publiqui, les posarem aquí.",
    ),
    ...paras(
      "Anar-hi per primera vegada pot ser confús: diverses sales repartides per la vila, sessions des de primera hora del matí, activitats paral·leles, cues, abonaments, estrenes i una població que durant deu dies funciona a un ritme completament diferent.",
      "Aquesta guia està pensada per evitar els errors més habituals del primer any.",
    ),
    keyFacts("Dades essencials", [
      { label: "Edició", value: "59a" },
      { label: "Dates 2026", value: "8–18 d'octubre" },
      { label: "Millor pel·lícula 2026", value: "Sanguine (Marion Le Corroller)" },
      { label: "Pròxima edició", value: "Dates per anunciar" },
      { label: "On", value: "Sitges (Garraf)" },
      { label: "Com arribar-hi", value: "Rodalies R2 Sud des de Barcelona" },
      { label: "Entrades", value: "Només pels canals oficials del Festival" },
    ]),
    ...h2("Palmarès 2026"),
    table(
      "Premis de la 59a edició del Festival de Sitges (2026)",
      ["Premi", "Pel·lícula / persona"],
      [
        ["Millor Pel·lícula (Secció Oficial Fantàstic)", "Sanguine, de Marion Le Corroller"],
        ["Premi Especial del Jurat", "Drag, de Greg Yagolnitzer i Raviv Ullman"],
        ["Millor Direcció", "Joko Anwar, per Ghost in the Cell"],
        ["Millor Interpretació Femenina", "Jasmine Trinca, per The Spiral"],
        ["Millor Interpretació Masculina", "Benoît Magimel, per Historias de la noche (The Birthday Party)"],
        ["Premi Citizen Kane al Director Revelació", "Leviticus, d'Adrian Chiarella"],
        ["Gran Premi del Públic", "Wildwood, de Travis Knight"],
        ["Noves Visions, Millor Pel·lícula", "Hen, de Nico Scheepers"],
        ["Òrbita, Millor Pel·lícula", "Gummy, de Javi Prada"],
        ["Méliès d'Argent, Millor Pel·lícula", "The Spiral, de Paolo Strippoli"],
      ],
      "Font: Sitges Film Festival, palmarès publicat el 17 d'octubre de 2026.",
    ),
    ...paras(
      "Els premis honorífics van ser per a Danny DeVito, Meiko Kaji i Takashi Shimizu (16 d'octubre) i Amy Irving, Gran Premi Honorífic (18 d'octubre).",
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
    ...paras(`Llistat i ubicacions oficials de les seus, Sala Llevant inclosa: [sitgesfilmfestival.com](${VENUES}).`),
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
      `Horaris oficials: [rodalies.gencat.cat](${RODALIES}). Freqüència, preu i hora de l'últim tren de tornada, a ${b2link("sitges", "ca", "la guia del tren de Barcelona a Sitges")}. Si vols fer-ne una escapada de dia, ${link("trains", "ca", "Sitges també encapçala la nostra llista d'escapades en tren")}.`,
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
      `Web oficial del Festival: [sitgesfilmfestival.com](${FESTIVAL}). Dates i bases de l'edició 2026: [rules & regulations](${RULES}).`,
    ),
    ...relatedBlocks(["trains", "weekend", "foodfairs", "castanyada", "traps"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "La 59ª edición del Festival de Sitges se celebró del 8 al 18 de octubre de 2026, y el premio a la Mejor Película fue para **Sanguine**, de Marion Le Corroller. El Festival aún no ha anunciado las fechas de la próxima edición (comprobado el 26 de octubre de 2026); cuando las publique, las pondremos aquí.",
    ),
    ...paras(
      "Ir por primera vez puede ser confuso: varias salas repartidas por la localidad, sesiones desde primera hora, actividades paralelas, colas, abonos, estrenos y un pueblo que durante diez días funciona a un ritmo completamente distinto.",
      "Esta guía está pensada para evitar los errores más habituales del primer año.",
    ),
    keyFacts("Datos esenciales", [
      { label: "Edición", value: "59ª" },
      { label: "Fechas 2026", value: "8–18 de octubre" },
      { label: "Mejor película 2026", value: "Sanguine (Marion Le Corroller)" },
      { label: "Próxima edición", value: "Fechas por anunciar" },
      { label: "Dónde", value: "Sitges (Garraf)" },
      { label: "Cómo llegar", value: "Rodalies R2 Sud desde Barcelona" },
      { label: "Entradas", value: "Solo por los canales oficiales del Festival" },
    ]),
    ...h2("Palmarés 2026"),
    table(
      "Premios de la 59ª edición del Festival de Sitges (2026)",
      ["Premio", "Película / persona"],
      [
        ["Mejor Película (Sección Oficial Fantàstic)", "Sanguine, de Marion Le Corroller"],
        ["Premio Especial del Jurado", "Drag, de Greg Yagolnitzer y Raviv Ullman"],
        ["Mejor Dirección", "Joko Anwar, por Ghost in the Cell"],
        ["Mejor Interpretación Femenina", "Jasmine Trinca, por The Spiral"],
        ["Mejor Interpretación Masculina", "Benoît Magimel, por Historias de la noche (The Birthday Party)"],
        ["Premio Citizen Kane al Director Revelación", "Leviticus, de Adrian Chiarella"],
        ["Gran Premio del Público", "Wildwood, de Travis Knight"],
        ["Noves Visions, Mejor Película", "Hen, de Nico Scheepers"],
        ["Òrbita, Mejor Película", "Gummy, de Javi Prada"],
        ["Méliès d'Argent, Mejor Película", "The Spiral, de Paolo Strippoli"],
      ],
      "Fuente: Sitges Film Festival, palmarés publicado el 17 de octubre de 2026.",
    ),
    ...paras(
      "Los premios honoríficos fueron para Danny DeVito, Meiko Kaji y Takashi Shimizu (16 de octubre) y Amy Irving, Gran Premio Honorífico (18 de octubre).",
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
    ...paras(`Listado y ubicaciones oficiales de las sedes, Sala Llevant incluida: [sitgesfilmfestival.com](${VENUES}).`),
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
      `Horarios oficiales: [rodalies.gencat.cat](${RODALIES}). Frecuencia, precio y hora del último tren de vuelta, en ${b2link("sitges", "es", "la guía del tren de Barcelona a Sitges")}. Si quieres convertirlo en escapada de día, ${link("trains", "es", "Sitges también encabeza nuestra lista de escapadas en tren")}.`,
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
      `Web oficial: [sitgesfilmfestival.com](${FESTIVAL}). Fechas y bases de la edición 2026: [rules & regulations](${RULES}).`,
    ),
    ...relatedBlocks(["trains", "weekend", "foodfairs", "castanyada", "traps"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "The 59th Sitges Film Festival ran from 8 to 18 October 2026, and Best Film went to **Sanguine**, by Marion Le Corroller. The festival has not yet announced the dates of its next edition (checked 26 October 2026); we will add them here when it does.",
    ),
    ...paras(
      "If you are staying in Barcelona and have never been to a film festival in Spain, the practical details matter more than the line-up. Venues are scattered around a small seaside town, screenings start early, queues form, and passes work differently from single tickets.",
    ),
    keyFacts("The essentials", [
      { label: "Edition", value: "59th" },
      { label: "Dates 2026", value: "8–18 October" },
      { label: "Best Film 2026", value: "Sanguine (Marion Le Corroller)" },
      { label: "Next edition", value: "Dates not yet announced" },
      { label: "Where", value: "Sitges, on the coast south of Barcelona" },
      { label: "Getting there", value: "Rodalies line R2 Sud from Barcelona" },
      { label: "Tickets", value: "Official festival channels only" },
    ]),
    ...h2("2026 winners"),
    table(
      "Awards of the 59th Sitges Film Festival (2026)",
      ["Award", "Film / person"],
      [
        ["Best Film (Official Fantàstic Section)", "Sanguine, by Marion Le Corroller"],
        ["Special Jury Prize", "Drag, by Greg Yagolnitzer and Raviv Ullman"],
        ["Best Director", "Joko Anwar, for Ghost in the Cell"],
        ["Best Actress", "Jasmine Trinca, for The Spiral"],
        ["Best Actor", "Benoît Magimel, for Historias de la noche (The Birthday Party)"],
        ["Citizen Kane Award for Best New Director", "Leviticus, by Adrian Chiarella"],
        ["Grand Audience Award", "Wildwood, by Travis Knight"],
        ["Noves Visions, Best Film", "Hen, by Nico Scheepers"],
        ["Òrbita, Best Film", "Gummy, by Javi Prada"],
        ["Méliès d'Argent, Best Film", "The Spiral, by Paolo Strippoli"],
      ],
      "Source: Sitges Film Festival, winners announced on 17 October 2026.",
    ),
    ...paras(
      "Honorary awards went to Danny DeVito, Meiko Kaji and Takashi Shimizu (16 October) and to Amy Irving, the Grand Honorary Award (18 October).",
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
    ...paras(`Official venue list and locations, including the Sala Llevant: [sitgesfilmfestival.com](${VENUES}).`),
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
      `Official timetables: [rodalies.gencat.cat](${RODALIES}). Frequency, fares and the time of the last train back are in ${b2link("sitges", "en", "our Barcelona to Sitges train guide")}. Sitges also tops ${link("trains", "en", "our list of day trips by train")} if you want to visit outside festival season.`,
    ),
    ...h2(
      "Is it worth going without a ticket?",
      "Yes, with different expectations. During the festival the town has a street atmosphere, open venues, the Fanshop, the Meeting space and public activities.",
      "If you want to watch films, book screenings. If you want the atmosphere, much of the day can be enjoyed outside a cinema.",
    ),
    ...paras(
      `Official site: [sitgesfilmfestival.com](${FESTIVAL}). 2026 dates and regulations: [rules & regulations](${RULES}).`,
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
    ca: "Passeig marítim de Sitges amb la senyalització del festival",
    es: "Paseo marítimo de Sitges con la señalización del festival",
    en: "The Sitges seafront promenade with festival banners",
  },
  secondaryCaption: {
    ca: "Imatge representativa del passeig de Sitges durant el festival. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa del paseo de Sitges durante el festival. Ilustración generada con inteligencia artificial.",
    en: "Representative image of the Sitges promenade during the festival. Illustration generated with artificial intelligence.",
  },
  sources: [
    { name: "Sitges Film Festival — bases i dates de l'edició", url: RULES, publisher: "Sitges Film Festival" },
    { name: "Sitges Film Festival — seus", url: VENUES, publisher: "Sitges Film Festival" },
    { name: "Sitges Film Festival", url: FESTIVAL, publisher: "Sitges Film Festival" },
    { name: "Sitges Film Festival — palmarès 2026", url: PALMARES, publisher: "Sitges Film Festival" },
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
      seoTitle: "Sitges Film Festival 2026: dates, venues and tickets",
      seoDescription:
        "Sitges Film Festival 2026 runs 8-18 October, the 59th edition. Dates, venues, how passes work, getting there by train, and what is confirmed so far.",
      excerpt:
        "The 59th edition runs 8–18 October 2026. Venues, passes, getting there by train, and what is confirmed versus what is not.",
      blocks: en(),
    },
  },
};
