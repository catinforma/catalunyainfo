import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  b2link,
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
 * Christmas markets in Catalonia (roadmap P08, backlog #21).
 *
 * Built from research_notes/christmas_markets_2026.md. On 20 October 2026 no
 * major organiser had published its 2026 dates, and most do so between late
 * October and late November. The page is therefore useful without them: what
 * each market is, where it is held when an official page says so, who runs it
 * and where its dates will appear. A date goes in only when its organiser
 * publishes it - last year's dates reprinted as this year's are exactly the
 * error that costs a reader a wasted trip.
 *
 * Deliberately absent until verified: any 2026 date or opening hour for the
 * big markets, Santa Llúcia's bus lines (organiser page is years old), and any
 * venue for Sabadell, Terrassa, Tarragona, Reus, Sitges or Tortosa, which move
 * or are only known from secondary sites.
 *
 * Perennial URL, no year in the slug: the same page serves every December.
 */

const VERIFIED = "2026-10-20";

const SOURCES: B2Source[] = [
  { name: "Fira de Santa Llúcia", url: "https://www.barcelona.cat/culturapopular/ca/festes-i-tradicions/fires/fira-de-santa-llucia", publisher: "Ajuntament de Barcelona" },
  { name: "Fira de Nadal de la Sagrada Família", url: "https://www.barcelona.cat/culturapopular/ca/festes-i-tradicions/fires/fira-de-nadal-de-la-sagrada-familia", publisher: "Ajuntament de Barcelona" },
  { name: "Nadal a Barcelona", url: "https://www.barcelona.cat/nadal/ca", publisher: "Ajuntament de Barcelona" },
  { name: "Fira de Santa Llúcia", url: "https://firadesantallucia.cat/", publisher: "Associació Fira de Santa Llúcia" },
  { name: "Mercat de Nadal", url: "https://www.figueres.cat/figueres/fires-i-mercats/mercat-de-nadal-1", publisher: "Ajuntament de Figueres" },
  { name: "Mercat de Nadal", url: "https://comercmercatsconsum.paeria.cat/comerc-i-mercats/mercats-ambulants/mercat-de-nadal", publisher: "Paeria de Lleida" },
  { name: "Fira de Santa Llúcia", url: "https://web.manresa.cat/web/menu/9216-fira-de-santa-llucia", publisher: "Ajuntament de Manresa" },
  { name: "Fires de Nadal", url: "https://www.granollers.cat/nadal/fires-de-nadal", publisher: "Ajuntament de Granollers" },
  { name: "Mercat Medieval Vic 2026", url: "https://www.vic.cat/ciutat/agenda/mercat-medieval-vic-2026", publisher: "Ajuntament de Vic" },
  { name: "Mercat de Nadal 2026", url: "https://www.santamargaridaielsmonjos.cat/actualitat/noticies/2026/10/13/mercat-nadal-2026", publisher: "Ajuntament de Santa Margarida i els Monjos" },
  { name: "Fira de Nadal 2026", url: "https://altafulla.cat/noticies/l-ajuntament-d-altafulla-obre-les-inscripcions-per-participar-en-la-fira-de-nadal-2026_1589", publisher: "Ajuntament d'Altafulla" },
  { name: "4a Fira de Nadal Vila Claus", url: "https://www.vilamajor.cat/actualitat/noticies/ja-es-poden-sollicitar-parades-per-a-la-4a-fira-de-nadal-vila-claus-2026.html", publisher: "Ajuntament de Sant Pere de Vilamajor" },
  { name: "Mercat de Nadal", url: "https://www.lesmasiesdevoltrega.cat/actualitat/noticies/obertes-les-inscripcions-per-participar-en-el-mercat-de-nadal-de-les-masies-de-voltrega.html", publisher: "Ajuntament de les Masies de Voltregà" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "tradicions/mercats-de-nadal-catalunya",
    title: "Mercats i fires de Nadal a Catalunya: on són i quan obren",
    seoTitle: "Mercats de Nadal a Catalunya: on són i quan obren",
    seoDescription:
      "La Fira de Santa Llúcia, la de la Sagrada Família i els mercats de Nadal de Girona, Figueres, Lleida i més: on són i quines dates ha confirmat cada organització.",
    excerpt:
      "Els mercats de Nadal de Catalunya, on es fan i quines dates han confirmat oficialment els organitzadors. Sense dates de l'any passat.",
  },
  es: {
    path: "tradiciones/mercados-navidad-cataluna",
    title: "Mercados y ferias de Navidad en Cataluña: dónde están y cuándo abren",
    seoTitle: "Mercados de Navidad en Cataluña: dónde y cuándo abren",
    seoDescription:
      "La Fira de Santa Llúcia, la de la Sagrada Família y los mercados de Navidad de Girona, Figueres, Lleida y más: dónde están y qué fechas ha confirmado cada organizador.",
    excerpt:
      "Los mercados de Navidad de Cataluña, dónde se hacen y qué fechas han confirmado oficialmente sus organizadores. Sin fechas del año pasado.",
  },
  en: {
    path: "traditions/christmas-markets-catalonia",
    title: "Christmas markets in Catalonia: where they are and when they open",
    seoTitle: "Christmas markets in Barcelona and Catalonia: where and when",
    seoDescription:
      "Barcelona's Fira de Santa Llúcia and Sagrada Família fair, and the Christmas markets of Girona, Figueres, Lleida and more: where they are and which dates are confirmed.",
    excerpt:
      "Catalonia's Christmas markets, where they are held and which dates their organisers have officially confirmed. No reprinted dates from last year.",
  },
};

const PENDING: Record<Locale, string> = {
  ca: "Pendent de confirmar",
  es: "Pendiente de confirmar",
  en: "Not yet confirmed",
};

/** [market, town, where (only when an official page states it)]. */
const MARKETS: Record<Locale, [string, string, string][]> = {
  ca: [
    ["Fira de Santa Llúcia", "Barcelona", "Davant de la Catedral"],
    ["Fira de Nadal de la Sagrada Família", "Barcelona", "Plaça de la Sagrada Família"],
    ["Mercat de Nadal", "Girona", "Plaça de la Independència"],
    ["Mercat de Nadal", "Figueres", "La Rambla"],
    ["Mercat de Nadal", "Lleida", "Plaça de la Catedral i voltants"],
    ["Fira de Santa Llúcia", "Manresa", "—"],
    ["Fires de Nadal", "Granollers", "—"],
    ["Fira de Santa Llúcia", "Sabadell", "—"],
    ["Fira de Santa Llúcia", "Terrassa", "—"],
    ["Fira de Nadal", "Tarragona", "—"],
    ["Mercat de Nadal", "Reus", "—"],
    ["Fira de Nadal", "Tortosa", "—"],
  ],
  es: [
    ["Fira de Santa Llúcia", "Barcelona", "Frente a la Catedral"],
    ["Fira de Nadal de la Sagrada Família", "Barcelona", "Plaza de la Sagrada Família"],
    ["Mercat de Nadal", "Girona", "Plaza de la Independència"],
    ["Mercat de Nadal", "Figueres", "La Rambla"],
    ["Mercat de Nadal", "Lleida", "Plaza de la Catedral y alrededores"],
    ["Fira de Santa Llúcia", "Manresa", "—"],
    ["Ferias de Navidad", "Granollers", "—"],
    ["Fira de Santa Llúcia", "Sabadell", "—"],
    ["Fira de Santa Llúcia", "Terrassa", "—"],
    ["Fira de Nadal", "Tarragona", "—"],
    ["Mercat de Nadal", "Reus", "—"],
    ["Fira de Nadal", "Tortosa", "—"],
  ],
  en: [
    ["Fira de Santa Llúcia", "Barcelona", "In front of the Cathedral"],
    ["Sagrada Família Christmas Fair", "Barcelona", "Plaça de la Sagrada Família"],
    ["Christmas market", "Girona", "Plaça de la Independència"],
    ["Christmas market", "Figueres", "La Rambla"],
    ["Christmas market", "Lleida", "Plaça de la Catedral and around"],
    ["Fira de Santa Llúcia", "Manresa", "—"],
    ["Christmas fairs", "Granollers", "—"],
    ["Fira de Santa Llúcia", "Sabadell", "—"],
    ["Fira de Santa Llúcia", "Terrassa", "—"],
    ["Christmas fair", "Tarragona", "—"],
    ["Christmas market", "Reus", "—"],
    ["Christmas fair", "Tortosa", "—"],
  ],
};

const HEADERS: Record<Locale, string[]> = {
  ca: ["Mercat", "Població", "On", "Dates del 2026"],
  es: ["Mercado", "Población", "Dónde", "Fechas de 2026"],
  en: ["Market", "Town", "Where", "2026 dates"],
};

function marketTable(locale: Locale) {
  const caption: Record<Locale, string> = {
    ca: "Els grans mercats de Nadal i l'estat de les dates",
    es: "Los grandes mercados de Navidad y el estado de las fechas",
    en: "The main Christmas markets and the state of their dates",
  };
  const note: Record<Locale, string> = {
    ca: "«On» només quan una pàgina oficial ho diu; algunes fires canvien d'emplaçament cada any. Comprovat el 20 d'octubre de 2026.",
    es: "«Dónde» solo cuando una página oficial lo dice; algunas ferias cambian de emplazamiento cada año. Comprobado el 20 de octubre de 2026.",
    en: "\"Where\" only when an official page says so; some fairs move from year to year. Checked on 20 October 2026.",
  };
  return table(
    caption[locale],
    HEADERS[locale],
    MARKETS[locale].map(([market, town, where]) => [market, town, where, PENDING[locale]]),
    note[locale],
  );
}

function body(locale: Locale) {
  if (locale === "ca") {
    return [
      lead(
        "Catalunya té mercats de Nadal a gairebé totes les ciutats, i els dos més antics són a Barcelona: la **Fira de Santa Llúcia**, que es fa davant de la Catedral des del **1786**, i la **Fira de Nadal de la Sagrada Família**, des del **1962**.",
      ),
      callout(
        "info",
        "Les dates d'enguany",
        "A 20 d'octubre de 2026, cap dels grans mercats ha publicat encara les dates oficials. Els organitzadors les solen anunciar entre finals d'octubre i finals de novembre, i aquí les afegim el dia que surten. No hi trobaràs les de l'any passat presentades com si fossin les d'aquest.",
      ),
      marketTable("ca"),
      ...h2(
        "Barcelona: la Fira de Santa Llúcia",
        "Segons l'Ajuntament de Barcelona, «des del 1786 es fa, al davant de la Catedral, la Fira de Santa Llúcia, una de les més populars de la ciutat». S'hi instal·la a final de novembre o principi de desembre, **sempre abans del dia 13, Santa Llúcia**, i s'hi manté durant els dies de Nadal.",
        "És la fira on Barcelona compra el pessebre: figures, molsa, avets i herbes, i també artesania i regals. L'organitza l'Associació Fira de Santa Llúcia, que publica les dates i els horaris al seu web.",
      ),
      ...h2(
        "Barcelona: la Fira de Nadal de la Sagrada Família",
        "Es fa a la plaça de la Sagrada Família des del 1962 i l'Ajuntament la defineix com «el mercat nadalenc més tradicional de l'Eixample». Té quatre sectors: arbres i plantes, pessebres i decoració, alimentació i regals.",
        "Segons l'Ajuntament, comença a la darreria de novembre o principi de desembre i es pot visitar fins als dies de Nadal; l'any passat va obrir una setmana abans que la de Santa Llúcia. L'Ajuntament diu que actualitzarà el seu web de Nadal cap al novembre.",
      ),
      ...h2(
        "Girona, Figueres i Lleida",
        `**Girona** fa el seu Mercat de Nadal a la plaça de la Independència, segons l'agenda municipal; si hi vas des de Barcelona, mira ${b2link("girona", "ca", "com anar a Girona en tren")}.`,
        `**Figueres** el fa a la Rambla, amb casetes de fusta, avets, plantes i productes agroalimentaris; el web municipal diu «Dates a determinar per 2026». Per combinar-ho amb el museu, ${b2link("figueres", "ca", "Figueres i el Teatre-Museu Dalí")}.`,
        "**Lleida** instal·la el Mercat de Nadal a la plaça de la Catedral i voltants, i l'any passat en va publicar el calendari el mateix dia que obria.",
      ),
      ...h2(
        "Manresa, Granollers, Sabadell i Terrassa",
        "**Manresa** fa la Fira de Santa Llúcia, que l'Ajuntament presenta com el lloc on trobar «els elements imprescindibles per preparar Nadal, fer el pessebre i aconseguir regals singulars». **Granollers** organitza diverses fires de Nadal, entre elles una de pessebres i ornamentació.",
        "**Sabadell** i **Terrassa** també fan la seva Fira de Santa Llúcia, a més d'una fira d'artesans. Totes dues han canviat d'emplaçament en anys diferents, de manera que no en diem el lloc fins que l'Ajuntament el confirmi.",
      ),
      ...h2(
        "Tarragona, Reus i Tortosa",
        `**Tarragona** té la Fira de Nadal i la d'Artesania, **Reus** el Mercat de Nadal i un d'artesania, i **Tortosa** la Fira de Nadal. Les tres ciutats van anunciar les dates de l'any passat a la segona quinzena de novembre. Si hi vas en tren, ${b2link("tarragona", "ca", "Tarragona des de Barcelona")}.`,
      ),
      ...h2(
        "Fires més petites que ja tenen data",
        "Algunes fires municipals ja han publicat les dates del 2026:",
      ),
      list(
        "**Santa Margarida i els Monjos** (Alt Penedès): Mercat de Nadal, del 27 al 29 de novembre.",
        "**Altafulla** (Tarragonès): Fira de Nadal, l'11, el 12 i el 13 de desembre, a les places de l'Església i del Pou.",
        "**Sant Pere de Vilamajor** (Vallès Oriental): Fira de Nadal Vila Claus, el 12 i el 13 de desembre, al parc de la Rectoria.",
        "**Les Masies de Voltregà** (Osona): Mercat de Nadal, el 18, el 19 i el 20 de desembre.",
      ),
      ...paras(
        "També al desembre, però no és un mercat de Nadal: el **Mercat Medieval de Vic** ocupa el centre històric de la ciutat a partir del 5 de desembre, fins al 8, segons l'agenda de l'Ajuntament de Vic.",
      ),
      ...h2(
        "Abans d'anar-hi",
        `Els organitzadors canvien dates i emplaçaments d'un any a l'altre: comprova-ho al seu web el dia que hi vagis. Si vas a comprar un diumenge o festiu de desembre, mira ${b2link("shops", "ca", "quins dies poden obrir les botigues")}, i per als ponts, ${b2link("workCalendar", "ca", "el calendari de festius")}.`,
      ),
      faq([
        {
          question: "Quan comença la Fira de Santa Llúcia?",
          answer:
            "Segons l'Ajuntament de Barcelona, s'instal·la a final de novembre o principi de desembre, sempre abans del 13 de desembre, i dura fins als dies de Nadal. Les dates del 2026 encara no s'han publicat.",
        },
        {
          question: "On es fa la Fira de Santa Llúcia?",
          answer: "Davant de la Catedral de Barcelona, on es fa des del 1786.",
        },
        {
          question: "Quins mercats de Nadal tenen ja dates per al 2026?",
          answer:
            "A 20 d'octubre, cap dels grans. Sí que en tenen algunes fires municipals: Santa Margarida i els Monjos (27-29 de novembre), Altafulla (11-13 de desembre), Sant Pere de Vilamajor (12-13 de desembre) i les Masies de Voltregà (18-20 de desembre).",
        },
      ]),
      ...paras(verifiedLine("ca", VERIFIED)),
      ...b2Related(["shops", "barcelonaHub", "girona", "figueres", "workCalendar"], "ca"),
    ];
  }

  if (locale === "es") {
    return [
      lead(
        "Cataluña tiene mercados de Navidad en casi todas las ciudades, y los dos más antiguos están en Barcelona: la **Fira de Santa Llúcia**, que se celebra frente a la Catedral desde **1786**, y la **Fira de Nadal de la Sagrada Família**, desde **1962**.",
      ),
      callout(
        "info",
        "Las fechas de este año",
        "A 20 de octubre de 2026, ninguno de los grandes mercados ha publicado todavía sus fechas oficiales. Los organizadores suelen anunciarlas entre finales de octubre y finales de noviembre, y aquí las añadimos el día que salen. No encontrarás las del año pasado presentadas como si fueran las de este.",
      ),
      marketTable("es"),
      ...h2(
        "Barcelona: la Fira de Santa Llúcia",
        "Según el Ayuntamiento de Barcelona, desde 1786 se celebra frente a la Catedral y es una de las ferias más populares de la ciudad. Se instala a finales de noviembre o principios de diciembre, **siempre antes del día 13, Santa Llúcia**, y se mantiene durante los días de Navidad.",
        "Es la feria donde Barcelona compra el belén: figuras, musgo, abetos y hierbas, y también artesanía y regalos. La organiza la Associació Fira de Santa Llúcia, que publica las fechas y los horarios en su web.",
      ),
      ...h2(
        "Barcelona: la Fira de Nadal de la Sagrada Família",
        "Se celebra en la plaza de la Sagrada Família desde 1962 y el Ayuntamiento la define como el mercado navideño más tradicional del Eixample. Tiene cuatro sectores: árboles y plantas, belenes y decoración, alimentación y regalos.",
        "Según el Ayuntamiento, empieza a finales de noviembre o principios de diciembre y se puede visitar hasta los días de Navidad; el año pasado abrió una semana antes que la de Santa Llúcia. El Ayuntamiento dice que actualizará su web de Navidad hacia noviembre.",
      ),
      ...h2(
        "Girona, Figueres y Lleida",
        `**Girona** celebra su Mercat de Nadal en la plaza de la Independència, según la agenda municipal; si vas desde Barcelona, mira ${b2link("girona", "es", "cómo ir a Girona en tren")}.`,
        `**Figueres** lo hace en la Rambla, con casetas de madera, abetos, plantas y productos agroalimentarios; la web municipal dice «Dates a determinar per 2026». Para combinarlo con el museo, ${b2link("figueres", "es", "Figueres y el Teatro-Museo Dalí")}.`,
        "**Lleida** instala el Mercat de Nadal en la plaza de la Catedral y alrededores, y el año pasado publicó el calendario el mismo día que abría.",
      ),
      ...h2(
        "Manresa, Granollers, Sabadell y Terrassa",
        "**Manresa** celebra la Fira de Santa Llúcia, que el Ayuntamiento presenta como el lugar donde encontrar lo imprescindible para preparar la Navidad, montar el belén y encontrar regalos singulares. **Granollers** organiza varias ferias de Navidad, entre ellas una de belenes y ornamentación.",
        "**Sabadell** y **Terrassa** también hacen su Fira de Santa Llúcia, además de una feria de artesanos. Las dos han cambiado de emplazamiento en años distintos, así que no damos el lugar hasta que el Ayuntamiento lo confirme.",
      ),
      ...h2(
        "Tarragona, Reus y Tortosa",
        `**Tarragona** tiene la Fira de Nadal y la de Artesanía, **Reus** el Mercat de Nadal y uno de artesanía, y **Tortosa** la Fira de Nadal. Las tres ciudades anunciaron las fechas del año pasado en la segunda quincena de noviembre. Si vas en tren, ${b2link("tarragona", "es", "Tarragona desde Barcelona")}.`,
      ),
      ...h2(
        "Ferias más pequeñas que ya tienen fecha",
        "Algunas ferias municipales ya han publicado sus fechas de 2026:",
      ),
      list(
        "**Santa Margarida i els Monjos** (Alt Penedès): Mercat de Nadal, del 27 al 29 de noviembre.",
        "**Altafulla** (Tarragonès): Fira de Nadal, el 11, el 12 y el 13 de diciembre, en las plazas de l'Església y del Pou.",
        "**Sant Pere de Vilamajor** (Vallès Oriental): Fira de Nadal Vila Claus, el 12 y el 13 de diciembre, en el parque de la Rectoria.",
        "**Les Masies de Voltregà** (Osona): Mercat de Nadal, el 18, el 19 y el 20 de diciembre.",
      ),
      ...paras(
        "También en diciembre, pero no es un mercado de Navidad: el **Mercat Medieval de Vic** ocupa el centro histórico de la ciudad a partir del 5 de diciembre, hasta el 8, según la agenda del Ayuntamiento de Vic.",
      ),
      ...h2(
        "Antes de ir",
        `Los organizadores cambian fechas y emplazamientos de un año a otro: compruébalo en su web el día que vayas. Si vas a comprar un domingo o festivo de diciembre, mira ${b2link("shops", "es", "qué días pueden abrir las tiendas")}, y para los puentes, ${b2link("workCalendar", "es", "el calendario de festivos")}.`,
      ),
      faq([
        {
          question: "¿Cuándo empieza la Fira de Santa Llúcia?",
          answer:
            "Según el Ayuntamiento de Barcelona, se instala a finales de noviembre o principios de diciembre, siempre antes del 13 de diciembre, y dura hasta los días de Navidad. Las fechas de 2026 aún no se han publicado.",
        },
        {
          question: "¿Dónde se celebra la Fira de Santa Llúcia?",
          answer: "Frente a la Catedral de Barcelona, donde se celebra desde 1786.",
        },
        {
          question: "¿Qué mercados de Navidad tienen ya fechas para 2026?",
          answer:
            "A 20 de octubre, ninguno de los grandes. Sí las tienen algunas ferias municipales: Santa Margarida i els Monjos (27-29 de noviembre), Altafulla (11-13 de diciembre), Sant Pere de Vilamajor (12-13 de diciembre) y les Masies de Voltregà (18-20 de diciembre).",
        },
      ]),
      ...paras(verifiedLine("es", VERIFIED)),
      ...b2Related(["shops", "barcelonaHub", "girona", "figueres", "workCalendar"], "es"),
    ];
  }

  return [
    lead(
      "Catalonia has Christmas markets in almost every town, and the two oldest are in Barcelona: the **Fira de Santa Llúcia**, held in front of the Cathedral since **1786**, and the **Sagrada Família Christmas Fair**, since **1962**.",
    ),
    callout(
      "info",
      "This year's dates",
      "As of 20 October 2026, none of the main markets has published its official dates. Organisers usually announce them between late October and late November, and we add each one the day it is published. You will not find last year's dates presented as this year's.",
    ),
    marketTable("en"),
    ...h2(
      "Barcelona: the Fira de Santa Llúcia",
      "According to Barcelona City Council, the fair has been held in front of the Cathedral since 1786 and is one of the most popular in the city. It sets up at the end of November or the start of December, **always before 13 December, Santa Llúcia's day**, and stays through the Christmas days.",
      "It is where Barcelona buys its nativity scene: figures, moss, fir trees and greenery, as well as crafts and gifts. It is run by the Associació Fira de Santa Llúcia, which publishes the dates and opening hours on its website.",
    ),
    ...h2(
      "Barcelona: the Sagrada Família Christmas Fair",
      "Held on Plaça de la Sagrada Família since 1962, it is described by the City Council as the most traditional Christmas market in the Eixample. It has four sections: trees and plants, nativity scenes and decorations, food, and gifts.",
      "According to the City Council, it starts at the end of November or early December and runs until the Christmas days; last year it opened a week before Santa Llúcia. The City Council says it will update its Christmas website around November.",
    ),
    ...h2(
      "Girona, Figueres and Lleida",
      `**Girona** holds its Christmas market on Plaça de la Independència, according to the city's events listing; from Barcelona, see ${b2link("girona", "en", "Girona by train")}.`,
      `**Figueres** holds it on La Rambla, in wooden huts selling Christmas items, food, plants and fir trees; the council's page says the 2026 dates are still to be set. To combine it with the museum, see ${b2link("figueres", "en", "Figueres and the Dalí Theatre-Museum")}.`,
      "**Lleida** sets up its Christmas market on Plaça de la Catedral and the streets around it, and last year published the calendar on the day it opened.",
    ),
    ...h2(
      "Manresa, Granollers, Sabadell and Terrassa",
      "**Manresa** holds a Fira de Santa Llúcia, which the council describes as the place to find what you need to prepare for Christmas, build the nativity scene and find unusual gifts. **Granollers** runs several Christmas fairs, including one for nativity scenes and decorations.",
      "**Sabadell** and **Terrassa** also hold a Fira de Santa Llúcia, plus a craft fair. Both have moved venue in different years, so we will give the location once the council confirms it.",
    ),
    ...h2(
      "Tarragona, Reus and Tortosa",
      `**Tarragona** has its Christmas fair and craft fair, **Reus** a Christmas market and a craft market, and **Tortosa** a Christmas fair. All three announced last year's dates in the second half of November. By train, see ${b2link("tarragona", "en", "Tarragona from Barcelona")}.`,
    ),
    ...h2(
      "Smaller fairs with confirmed dates",
      "Some municipal fairs have already published their 2026 dates:",
    ),
    list(
      "**Santa Margarida i els Monjos** (Alt Penedès): Christmas market, 27 to 29 November.",
      "**Altafulla** (Tarragonès): Christmas fair, 11, 12 and 13 December, on the squares of l'Església and del Pou.",
      "**Sant Pere de Vilamajor** (Vallès Oriental): Vila Claus Christmas fair, 12 and 13 December, in the Rectoria park.",
      "**Les Masies de Voltregà** (Osona): Christmas market, 18, 19 and 20 December.",
    ),
    ...paras(
      "Also in December, though not a Christmas market: **Vic's Medieval Market** fills the historic centre from 5 December until the 8th, according to Vic City Council's events listing.",
    ),
    ...h2(
      "Before you go",
      `Organisers change dates and venues from year to year, so check their website for your day. If you plan to shop on a December Sunday or holiday, see ${b2link("shops", "en", "which days shops may open")}, and for long weekends, ${b2link("workCalendar", "en", "the public holiday calendar")}.`,
    ),
    faq([
      {
        question: "When does the Fira de Santa Llúcia start?",
        answer:
          "According to Barcelona City Council, it sets up at the end of November or early December, always before 13 December, and runs until the Christmas days. The 2026 dates have not been published yet.",
      },
      {
        question: "Where is the Fira de Santa Llúcia?",
        answer: "In front of Barcelona Cathedral, where it has been held since 1786.",
      },
      {
        question: "Which Christmas markets have confirmed 2026 dates?",
        answer:
          "As of 20 October, none of the main ones. Some municipal fairs have: Santa Margarida i els Monjos (27-29 November), Altafulla (11-13 December), Sant Pere de Vilamajor (12-13 December) and Les Masies de Voltregà (18-20 December).",
      },
    ]),
    ...paras(verifiedLine("en", VERIFIED)),
    ...b2Related(["shops", "barcelonaHub", "girona", "figueres", "workCalendar"], "en"),
  ];
}

export const CHRISTMAS: B2Article = {
  key: "christmas",
  entryKey: "guide-christmas-markets-catalonia",
  categoryKey: "festivals",
  sources: SOURCES,
  heroKey: "mercats-nadal-santa-llucia-nit",
  heroAlt: {
    ca: "Parades de la Fira de Santa Llúcia il·luminades de nit davant la Catedral de Barcelona",
    es: "Puestos de la Fira de Santa Llúcia iluminados de noche ante la catedral de Barcelona",
    en: "Fira de Santa Llúcia stalls lit up at night by Barcelona Cathedral",
  },
  heroCaption: {
    ca: "La Fira de Santa Llúcia, davant de la Catedral de Barcelona.",
    es: "La Fira de Santa Llúcia, frente a la Catedral de Barcelona.",
    en: "The Fira de Santa Llúcia, in front of Barcelona Cathedral.",
  },
  secondaryKey: "mercats-nadal-santa-llucia-figures",
  secondaryAlt: {
    ca: "Prestatges amb figures de pessebre i escenaris de molsa en una parada de la Fira de Santa Llúcia",
    es: "Estanterías con figuras de belén y escenarios de musgo en un puesto de la Fira de Santa Llúcia",
    en: "Shelves of nativity figures and moss scenery on a Fira de Santa Llúcia stall",
  },
  secondaryCaption: {
    ca: "Figures de pessebre a la Fira de Santa Llúcia.",
    es: "Figuras de belén en la Fira de Santa Llúcia.",
    en: "Nativity figures at the Fira de Santa Llúcia.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-11-10T09:00:00+01:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};
