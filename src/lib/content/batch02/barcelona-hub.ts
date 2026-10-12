import type { Locale } from "@/lib/i18n/config";

import { b2link, h2, lead, list, paras, verifiedLine, type B2Article, type B2Key } from "./shared";

/**
 * Barcelona practical guide: the hub over every Barcelona visitor guide.
 *
 * It holds no new facts. Each line restates a figure already verified in the
 * guide it links to (same date), so the hub cannot drift from its children:
 * when a child changes, the line here is the only other place to update, and
 * the registry keeps every link pointing at a published URL.
 */

const VERIFIED = "2026-10-12";

type Group = { title: string; items: [B2Key, string, string][] };

const GROUPS: Record<Locale, { lead: string; intro: string; groups: Group[]; outro: string }> = {
  en: {
    lead: "Everything practical for a visit to Barcelona in one place: how to arrive, how to get around, what the big sights cost and when they are free, and the best day trips by train. Every figure comes from the operator or the City Council and is dated in the guide it links to.",
    intro: "Start with the section you need.",
    groups: [
      {
        title: "Arriving",
        items: [
          ["airport", "Airport to the city centre", "Aerobús €7.75, airport metro €5.90, the R2 Nord train from T2, or a taxi with a €21 minimum."],
          ["cruiseport", "Cruise port to the city", "Cruise Bus shuttle €3.50 from the Moll Adossat; only the WTC terminal is walkable."],
        ],
      },
      {
        title: "Getting around",
        items: [
          ["transport", "Which transport pass to buy", "T-casual €13 for ten journeys, T-dia €12, Hola Barcelona from €12.50, with a selector."],
          ["cards", "Barcelona Card or Hola Barcelona", "When the Barcelona Card's museums pay back its higher price."],
          ["hours", "Metro and night bus hours", "Metro to midnight on weeknights, 2:00 on Fridays, all night on Saturdays; NitBus after."],
          ["parking", "Street parking prices", "Blue zone €1.15–3.75 an hour, green zone €1.40–4.25, by environmental label."],
          ["zbe", "Low-emission zone with a foreign car", "Registering a foreign vehicle before driving into the zone."],
        ],
      },
      {
        title: "Seeing the city",
        items: [
          ["monuments", "Gaudí monument tickets", "Sagrada Família from €26, Park Güell €18, Casa Batlló from €29, La Pedrera €29."],
          ["museums", "Free museums", "Sunday afternoons, first Sundays and each museum's own free slots, and where to book."],
          ["campnou", "Spotify Camp Nou", "The Barça museum from €28, match tickets and the stadium works."],
          ["montjuic", "Montjuïc", "Magic Fountain show days, the cable cars, the funicular and the castle."],
          ["tibidabo", "Tibidabo", "Park opening days, tickets from €39, and getting up now the Tramvia Blau is closed."],
          ["markets", "La Boqueria and the markets", "Monday to Saturday hours and the Friday-Saturday tour-group rule."],
          ["zooAquarium", "Zoo and Aquarium", "Zoo €23, Aquarium €30, the same online and at the door."],
        ],
      },
      {
        title: "Day trips",
        items: [
          ["montserratFree", "Montserrat without a tour", "R5 train, then rack railway or cable car at €15 return."],
          ["sitges", "Sitges by train", "32–38 minutes from Sants on the R2 Sud."],
          ["girona", "Girona by train", "Regional or high-speed from Barcelona."],
          ["tarragona", "Tarragona by train", "71 minutes from Sants; Roman sites €5 each or €15 for five."],
          ["figueres", "Figueres and the Dalí Museum", "R11 or high-speed; tickets from €18.50, closed Mondays in winter."],
          ["portaventura", "PortAventura", "Open daily until 6 January; only the R17 and RT2 stop at the park."],
          ["andorra", "Andorra by bus", "About three hours, from €33, and what you can bring back."],
        ],
      },
    ],
    outro: "Prices and hours change through the year. Each guide states when its figures were last checked against the official source.",
  },
  es: {
    lead: "Todo lo práctico para visitar Barcelona en un solo sitio: cómo llegar, cómo moverse, cuánto cuestan los grandes monumentos y cuándo son gratis, y las mejores excursiones en tren. Cada cifra sale del operador o del Ayuntamiento y está fechada en la guía que enlaza.",
    intro: "Empieza por el apartado que necesites.",
    groups: [
      {
        title: "Llegar",
        items: [
          ["airport", "Del aeropuerto al centro", "Aerobús 7,75 €, metro del aeropuerto 5,90 €, tren R2 Nord desde la T2 o taxi con un mínimo de 21 €."],
          ["cruiseport", "Del puerto de cruceros a la ciudad", "Lanzadera Cruise Bus 3,50 € desde el Moll Adossat; solo la terminal WTC está a distancia de ir a pie."],
        ],
      },
      {
        title: "Moverse",
        items: [
          ["transport", "Qué tarjeta de transporte comprar", "T-casual 13 € diez viajes, T-dia 12 €, Hola Barcelona desde 12,50 €, con un selector."],
          ["cards", "Barcelona Card o Hola Barcelona", "Cuándo los museos de la Barcelona Card compensan su precio más alto."],
          ["hours", "Horario del metro y del NitBus", "Metro hasta medianoche entre semana, hasta las 2:00 el viernes, toda la noche el sábado; después, NitBus."],
          ["parking", "Precio del aparcamiento en la calle", "Zona azul de 1,15 a 3,75 € la hora, zona verde de 1,40 a 4,25 €, según el distintivo."],
          ["zbe", "ZBE con un coche extranjero", "Registrar un vehículo extranjero antes de entrar en la zona."],
        ],
      },
      {
        title: "Ver la ciudad",
        items: [
          ["monuments", "Entradas de Gaudí", "Sagrada Familia desde 26 €, Park Güell 18 €, Casa Batlló desde 29 €, La Pedrera 29 €."],
          ["museums", "Museos gratis", "Domingos por la tarde, primeros domingos y las franjas gratuitas de cada museo, y dónde reservar."],
          ["campnou", "Spotify Camp Nou", "El museo del Barça desde 28 €, las entradas de partido y las obras del estadio."],
          ["montjuic", "Montjuïc", "Días de la Fuente Mágica, los teleféricos, el funicular y el castillo."],
          ["tibidabo", "Tibidabo", "Días de apertura del parque, entradas desde 39 € y cómo subir con el Tramvia Blau cerrado."],
          ["markets", "La Boqueria y los mercados", "Horario de lunes a sábado y la norma de los grupos turísticos de viernes y sábado."],
          ["zooAquarium", "Zoo y Aquarium", "Zoo 23 €, Aquarium 30 €, mismo precio en línea y en taquilla."],
        ],
      },
      {
        title: "Excursiones",
        items: [
          ["montserratFree", "Montserrat por libre", "Tren R5 y después cremallera o teleférico a 15 € ida y vuelta."],
          ["sitges", "Sitges en tren", "De 32 a 38 minutos desde Sants en la R2 Sud."],
          ["girona", "Girona en tren", "Regional o alta velocidad desde Barcelona."],
          ["tarragona", "Tarragona en tren", "71 minutos desde Sants; recintos romanos 5 € cada uno o 15 € los cinco."],
          ["figueres", "Figueres y el Museo Dalí", "R11 o alta velocidad; entradas desde 18,50 €, cerrado los lunes en invierno."],
          ["portaventura", "PortAventura", "Abierto cada día hasta el 6 de enero; solo la R17 y la RT2 paran en el parque."],
          ["andorra", "Andorra en autobús", "Unas tres horas, desde 33 €, y lo que puedes traer de vuelta."],
        ],
      },
    ],
    outro: "Los precios y horarios cambian a lo largo del año. Cada guía indica cuándo se comprobaron sus cifras con la fuente oficial.",
  },
  ca: {
    lead: "Tot el que és pràctic per visitar Barcelona en un sol lloc: com arribar-hi, com moure's, quant costen els grans monuments i quan són gratis, i les millors excursions en tren. Cada xifra surt de l'operador o de l'Ajuntament i està datada a la guia que enllaça.",
    intro: "Comença per l'apartat que necessitis.",
    groups: [
      {
        title: "Arribar",
        items: [
          ["airport", "De l'aeroport al centre", "Aerobús 7,75 €, metro de l'aeroport 5,90 €, tren R2 Nord des de la T2 o taxi amb un mínim de 21 €."],
          ["cruiseport", "Del port de creuers a la ciutat", "Llançadora Cruise Bus 3,50 € des del Moll Adossat; només la terminal WTC és a distància d'anar-hi a peu."],
        ],
      },
      {
        title: "Moure's",
        items: [
          ["transport", "Quina targeta de transport comprar", "T-casual 13 € deu viatges, T-dia 12 €, Hola Barcelona des de 12,50 €, amb un selector."],
          ["cards", "Barcelona Card o Hola Barcelona", "Quan els museus de la Barcelona Card compensen el seu preu més alt."],
          ["hours", "Horari del metro i del NitBus", "Metro fins a mitjanit entre setmana, fins a les 2:00 el divendres, tota la nit el dissabte; després, NitBus."],
          ["parking", "Preu de l'aparcament al carrer", "Zona blava d'1,15 a 3,75 € l'hora, zona verda d'1,40 a 4,25 €, segons el distintiu."],
          ["zbe", "ZBE amb un cotxe estranger", "Registrar un vehicle estranger abans d'entrar a la zona."],
        ],
      },
      {
        title: "Veure la ciutat",
        items: [
          ["monuments", "Entrades de Gaudí", "Sagrada Família des de 26 €, Park Güell 18 €, Casa Batlló des de 29 €, la Pedrera 29 €."],
          ["museums", "Museus gratis", "Diumenges a la tarda, primers diumenges i les franges gratuïtes de cada museu, i on reservar."],
          ["campnou", "Spotify Camp Nou", "El museu del Barça des de 28 €, les entrades de partit i les obres de l'estadi."],
          ["montjuic", "Montjuïc", "Dies de la Font Màgica, els telefèrics, el funicular i el castell."],
          ["tibidabo", "Tibidabo", "Dies d'obertura del parc, entrades des de 39 € i com pujar-hi amb el Tramvia Blau tancat."],
          ["markets", "La Boqueria i els mercats", "Horari de dilluns a dissabte i la norma dels grups turístics de divendres i dissabte."],
          ["zooAquarium", "Zoo i Aquàrium", "Zoo 23 €, Aquàrium 30 €, mateix preu en línia i a taquilla."],
        ],
      },
      {
        title: "Excursions",
        items: [
          ["montserratFree", "Montserrat per lliure", "Tren R5 i després cremallera o aeri a 15 € anada i tornada."],
          ["sitges", "Sitges en tren", "De 32 a 38 minuts des de Sants amb l'R2 Sud."],
          ["girona", "Girona en tren", "Regional o alta velocitat des de Barcelona."],
          ["tarragona", "Tarragona en tren", "71 minuts des de Sants; recintes romans 5 € cadascun o 15 € tots cinc."],
          ["figueres", "Figueres i el Museu Dalí", "R11 o alta velocitat; entrades des de 18,50 €, tancat els dilluns a l'hivern."],
          ["portaventura", "PortAventura", "Obert cada dia fins al 6 de gener; només l'R17 i l'RT2 paren al parc."],
          ["andorra", "Andorra en autobús", "Unes tres hores, des de 33 €, i el que pots tornar a portar."],
        ],
      },
    ],
    outro: "Els preus i els horaris canvien al llarg de l'any. Cada guia indica quan es van comprovar les seves xifres amb la font oficial.",
  },
};

const META = {
  ca: {
    path: "guies/barcelona-guia-practica",
    title: "Barcelona: guia pràctica per a la teva visita",
    seoTitle: "Barcelona: guia pràctica (transport, entrades, excursions)",
    seoDescription:
      "Com arribar a Barcelona i moure-t'hi, quant costen la Sagrada Família, el Park Güell i els museus, quan són gratis i excursions en tren, amb dades oficials.",
    excerpt: "Totes les guies pràctiques de Barcelona en un sol lloc: arribar, moure's, monuments, museus gratis i excursions en tren.",
  },
  es: {
    path: "guias/barcelona-guia-practica",
    title: "Barcelona: guía práctica para tu visita",
    seoTitle: "Barcelona: guía práctica (transporte, entradas, excursiones)",
    seoDescription:
      "Cómo llegar a Barcelona y moverte, cuánto cuestan la Sagrada Familia, el Park Güell y los museos, cuándo son gratis y excursiones en tren. Datos oficiales.",
    excerpt: "Todas las guías prácticas de Barcelona en un solo sitio: llegar, moverse, monumentos, museos gratis y excursiones en tren.",
  },
  en: {
    path: "guides/barcelona-practical-guide",
    title: "Barcelona practical guide for visitors",
    seoTitle: "Barcelona practical guide: transport, tickets, day trips",
    seoDescription:
      "Getting to and around Barcelona, what the Sagrada Família, Park Güell and museums cost and when they are free, and day trips by train. Official data.",
    excerpt: "Every Barcelona practical guide in one place: arriving, getting around, sights, free museums and day trips by train.",
  },
} as const;

function body(locale: Locale) {
  const g = GROUPS[locale];
  return [
    lead(g.lead),
    ...paras(g.intro),
    ...g.groups.flatMap((group) => [
      ...h2(group.title),
      list(...group.items.map(([key, label, summary]) => `${b2link(key, locale, label)}: ${summary}`)),
    ]),
    ...paras(g.outro, verifiedLine(locale, VERIFIED)),
  ];
}

export const BARCELONA_HUB: B2Article = {
  key: "barcelonaHub",
  entryKey: "guide-barcelona-practical-hub",
  categoryKey: "cities",
  sources: [
    { name: "Barcelona City Council", url: "https://www.barcelona.cat/", publisher: "Ajuntament de Barcelona" },
    { name: "TMB", url: "https://www.tmb.cat/", publisher: "Transports Metropolitans de Barcelona" },
  ],
  heroKey: "barcelona-hub-vista-carmel",
  heroAlt: {
    ca: "Vista de Barcelona des dels Bunkers del Carmel, amb la ciutat fins al mar",
    es: "Vista de Barcelona desde los Bunkers del Carmel, con la ciudad hasta el mar",
    en: "Barcelona seen from the Bunkers del Carmel, over the city to the sea",
  },
  heroCaption: {
    ca: "Barcelona des dels Bunkers del Carmel.",
    es: "Barcelona desde los Bunkers del Carmel.",
    en: "Barcelona from the Bunkers del Carmel.",
  },
  secondaryKey: "barcelona-hub-passeig-gracia",
  secondaryAlt: {
    ca: "El passeig de Gràcia amb taxis i, al fons, la Casa Milà",
    es: "El paseo de Gràcia con taxis y, al fondo, la Casa Milà",
    en: "Passeig de Gràcia with taxis and Casa Milà in the background",
  },
  secondaryCaption: {
    ca: "El passeig de Gràcia.",
    es: "El paseo de Gràcia.",
    en: "Passeig de Gràcia.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T02:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as BARCELONA_HUB_META };
