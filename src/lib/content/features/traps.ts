import type { Block } from "@/lib/content/blocks";
import {
  ARTICLE_PATHS,
  callout,
  h2,
  lead,
  link,
  paras,
  relatedBlocks,
  table,
  type FeatureArticle,
} from "./shared";

/**
 * Article 8 — Barcelona "tourist traps".
 *
 * Editorial and legal line, held throughout: **no business is accused of
 * anything.** "Tourist trap" here means a common planning mistake, an
 * overrated use of limited time, or an avoidable cost — never fraud, and never
 * a named venue. There is no sourced allegation to make, so none is made.
 *
 * The tone rule matters as much: the reader is not an idiot for making these
 * mistakes. Most of them are what the search results tell you to do.
 */

const TURISME_BCN = "https://www.barcelonaturisme.com/";
const TURISME_FAQ = "https://professional.barcelonaturisme.com/es/travel-trade/preguntas-frecuentes";

function ca(): Block[] {
  return [
    lead(
      "Barcelona no enganya ningú. El que passa és que la ciutat concentra molta informació repetida, i seguir-la al peu de la lletra costa temps, diners i, sobretot, la sensació d'haver vist una altra cosa que no fos una cua.",
    ),
    ...paras(
      "Aquesta llista no acusa cap negoci de res. Parla d'errors de planificació habituals —molts dels quals són exactament el que et diu la primera pàgina de resultats— i del que funciona millor en el seu lloc.",
    ),
    table(
      "L'error i l'alternativa",
      ["Error habitual", "Què fer en lloc seu"],
      [
        ["Comprar entrades de grans monuments a webs de revenda", "Comprar només al web oficial de cada monument"],
        ["Arribar al Park Güell sense reserva", "Reservar franja horària abans de sortir de l'hotel"],
        ["Pensar que la Rambla és Barcelona", "Gràcia, Sant Antoni, Poblenou, Sants, el Poble-sec"],
        ["Menjar sempre a l'eix més transitat sense mirar la carta", "Mirar preu i carta abans de seure, i sortir de l'eix"],
        ["Entrar a la Boqueria només a buscar el got viral", "Entendre-la com un mercat, o anar a Sant Antoni o Santa Caterina"],
        ["Fer tot Gaudí en un sol dia", "Repartir-lo i afegir-hi les obres menys massificades"],
        ["Anar només a la Barceloneta en temporada alta", "Bogatell, Nova Icària o Mar Bella segons el que busquis"],
        ["Moure's sempre en taxi pel centre", "Metro, bus i caminar; taxi quan tingui sentit"],
        ["Encadenar quatre visites per dia", "Dues de fermes i marge real entremig"],
        ["No sortir mai del centre", "Una escapada de mig dia o un barri perifèric"],
      ],
    ),
    ...h2(
      "1. Comprar entrades fora dels canals oficials",
      "És l'error que més diners costa. Els grans monuments venen les seves entrades al seu propi web, i qualsevol intermediari hi afegeix un marge o, en el pitjor dels casos, et ven una franja que no existeix.",
      `Turisme de Barcelona recomana expressament reservar amb antelació i fer-ho a través dels webs oficials. Consulta-ho a [barcelonaturisme.com](${TURISME_BCN}).`,
    ),
    ...h2(
      "2. Arribar al Park Güell sense reserva",
      "La zona monumental funciona amb accés regulat per franges horàries. Presentar-s'hi sense reserva en temporada alta és la manera més fiable de perdre el matí.",
      "Reserva la franja abans de sortir, i compta el temps de pujada: el parc és amunt, i la diferència entre arribar-hi descansat o no és considerable.",
    ),
    ...h2(
      "3. Confondre la Rambla amb Barcelona",
      "La Rambla té el seu interès històric, però és un eix, no una ciutat. Si el teu record de Barcelona s'hi acaba, t'has perdut el 95% de la ciutat.",
      "Gràcia té places on la gent encara fa vida de barri. Sant Antoni té un dels mercats més ben recuperats. Poblenou combina fàbriques reconvertides i platja. Sants i el Poble-sec són barris que funcionen de dilluns a divendres.",
    ),
    ...h2(
      "4. Menjar sempre al mateix eix",
      "No cal cap acusació: simplement, en les zones amb més trànsit de visitants, la relació entre el que pagues i el que menges sol ser pitjor.",
      "Dues regles pràctiques: mira la carta i els preus abans de seure, i camina cinc minuts en direcció contrària a la multitud. A Barcelona, cinc minuts sovint és tot el que cal.",
    ),
    ...h2(
      "5. Anar a la Boqueria només a buscar la foto",
      "La Boqueria és un mercat de debò, i el problema no és el mercat: és anar-hi només a comprar un got de fruita a preu de record turístic i marxar.",
      "Si vols mercat de veritat, el de Sant Antoni i el de Santa Caterina funcionen com el que són. I si vas a la Boqueria, vés a primera hora i mira les parades de producte, no les de souvenir comestible.",
    ),
    ...h2(
      "6. Intentar fer tot Gaudí en un dia",
      "Sagrada Família, Pedrera, Casa Batlló i Park Güell en una jornada és possible sobre el paper i esgotador a la pràctica, amb cues i desplaçaments enmig.",
      `Reparteix-ho en dos dies i afegeix-hi obres menys massificades: ${link("gaudi", "ca", "n'hi ha vuit que gairebé ningú visita")}, entre elles la cripta de la Colònia Güell, que és on Gaudí va assajar el que després faria a la Sagrada Família.`,
    ),
    ...h2(
      "7. Anar només a la Barceloneta",
      "És la platja més accessible i, en temporada alta, la més saturada. Barcelona té més façana marítima.",
      "Bogatell i Nova Icària són més tranquil·les i tenen millors serveis; Mar Bella té un ambient diferent. Cap no requereix res més que continuar caminant o agafar el metro dues parades més.",
    ),
    ...h2(
      "8. Moure's sempre en taxi",
      "Al centre de Barcelona, el taxi sovint és més lent que el metro i sempre és més car. La ciutat és compacta i està ben comunicada.",
      "El taxi té sentit amb equipatge, de matinada o amb mobilitat reduïda. La resta del temps, el metro i caminar guanyen.",
    ),
    ...h2(
      "9. Encadenar massa visites per dia",
      "L'error més invisible. Quatre monuments en un dia significa quatre cues, tres desplaçaments i cap estona per seure en una plaça, que és exactament el que després es recorda.",
      "Dues visites fermes i marge real entremig donen un dia millor.",
    ),
    ...h2(
      "10. No sortir mai del centre",
      "Barcelona és una bona base, i en menys d'una hora hi ha ciutats romanes, pobles de costa i patrimoni modernista fora del circuit.",
      `${link("trains", "ca", "Dotze escapades es fan en tren")}, i ${link("montserrat", "ca", "n'hi ha deu més que no són Montserrat")}.`,
    ),
    callout(
      "info",
      "Una recomanació que val per a tot",
      `Reserva amb antelació els monuments més sol·licitats i fes-ho sempre al web oficial. És el consell que repeteix la mateixa oficina de turisme de la ciutat: [preguntes freqüents](${TURISME_FAQ}).`,
    ),
    ...relatedBlocks(["gaudi", "trains", "montserrat", "rainy", "surprising"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "Barcelona no engaña a nadie. Lo que ocurre es que la ciudad concentra mucha información repetida, y seguirla al pie de la letra cuesta tiempo, dinero y, sobre todo, la sensación de haber visto algo más que una cola.",
    ),
    ...paras(
      "Esta lista no acusa a ningún negocio de nada. Habla de errores de planificación habituales —muchos de los cuales son exactamente lo que te dice la primera página de resultados— y de lo que funciona mejor en su lugar.",
    ),
    table(
      "El error y la alternativa",
      ["Error habitual", "Qué hacer en su lugar"],
      [
        ["Comprar entradas de grandes monumentos en webs de reventa", "Comprar solo en la web oficial de cada monumento"],
        ["Llegar al Park Güell sin reserva", "Reservar franja horaria antes de salir del hotel"],
        ["Pensar que la Rambla es Barcelona", "Gràcia, Sant Antoni, Poblenou, Sants, el Poble-sec"],
        ["Comer siempre en el eje más transitado sin mirar la carta", "Mirar precio y carta antes de sentarse, y salir del eje"],
        ["Entrar a la Boqueria solo a por el vaso viral", "Entenderla como mercado, o ir a Sant Antoni o Santa Caterina"],
        ["Hacer todo Gaudí en un solo día", "Repartirlo y añadir las obras menos masificadas"],
        ["Ir solo a la Barceloneta en temporada alta", "Bogatell, Nova Icària o Mar Bella según lo que busques"],
        ["Moverse siempre en taxi por el centro", "Metro, bus y caminar; taxi cuando tenga sentido"],
        ["Encadenar cuatro visitas al día", "Dos firmes y margen real entre ellas"],
        ["No salir nunca del centro", "Una escapada de medio día o un barrio periférico"],
      ],
    ),
    ...h2(
      "1. Comprar entradas fuera de los canales oficiales",
      "Es el error que más dinero cuesta. Los grandes monumentos venden sus entradas en su propia web, y cualquier intermediario añade un margen o, en el peor de los casos, te vende una franja que no existe.",
      `Turisme de Barcelona recomienda expresamente reservar con antelación y hacerlo a través de las webs oficiales: [barcelonaturisme.com](${TURISME_BCN}).`,
    ),
    ...h2(
      "2. Llegar al Park Güell sin reserva",
      "La zona monumental funciona con acceso regulado por franjas horarias. Presentarse sin reserva en temporada alta es la forma más fiable de perder la mañana.",
      "Reserva la franja antes de salir y cuenta el tiempo de subida: el parque está arriba.",
    ),
    ...h2(
      "3. Confundir la Rambla con Barcelona",
      "La Rambla tiene su interés histórico, pero es un eje, no una ciudad. Si tu recuerdo de Barcelona termina ahí, te has perdido el 95% de la ciudad.",
      "Gràcia tiene plazas donde la gente sigue haciendo vida de barrio. Sant Antoni tiene uno de los mercados mejor recuperados. Poblenou combina fábricas reconvertidas y playa. Sants y el Poble-sec funcionan de lunes a viernes.",
    ),
    ...h2(
      "4. Comer siempre en el mismo eje",
      "No hace falta ninguna acusación: simplemente, en las zonas con más tránsito de visitantes la relación entre lo que pagas y lo que comes suele ser peor.",
      "Dos reglas prácticas: mira carta y precios antes de sentarte, y camina cinco minutos en dirección contraria a la multitud. En Barcelona, cinco minutos suelen bastar.",
    ),
    ...h2(
      "5. Ir a la Boqueria solo a por la foto",
      "La Boqueria es un mercado de verdad, y el problema no es el mercado: es ir solo a comprar un vaso de fruta a precio de recuerdo turístico y marcharse.",
      "Si quieres mercado de verdad, el de Sant Antoni y el de Santa Caterina funcionan como lo que son. Y si vas a la Boqueria, ve a primera hora y mira las paradas de producto.",
    ),
    ...h2(
      "6. Intentar hacer todo Gaudí en un día",
      "Sagrada Família, Pedrera, Casa Batlló y Park Güell en una jornada es posible sobre el papel y agotador en la práctica.",
      `Repártelo en dos días y añade obras menos masificadas: ${link("gaudi", "es", "hay ocho que casi nadie visita")}, entre ellas la cripta de la Colònia Güell.`,
    ),
    ...h2(
      "7. Ir solo a la Barceloneta",
      "Es la playa más accesible y, en temporada alta, la más saturada. Barcelona tiene más fachada marítima.",
      "Bogatell y Nova Icària son más tranquilas; Mar Bella tiene otro ambiente. Ninguna requiere más que seguir caminando o coger el metro dos paradas más.",
    ),
    ...h2(
      "8. Moverse siempre en taxi",
      "En el centro de Barcelona el taxi suele ser más lento que el metro y siempre más caro. La ciudad es compacta y está bien comunicada.",
      "El taxi tiene sentido con equipaje, de madrugada o con movilidad reducida.",
    ),
    ...h2(
      "9. Encadenar demasiadas visitas al día",
      "El error más invisible. Cuatro monumentos en un día son cuatro colas, tres desplazamientos y ningún rato para sentarse en una plaza, que es exactamente lo que después se recuerda.",
    ),
    ...h2(
      "10. No salir nunca del centro",
      "Barcelona es una buena base, y en menos de una hora hay ciudades romanas, pueblos de costa y patrimonio modernista fuera del circuito.",
      `${link("trains", "es", "Doce escapadas se hacen en tren")}, y ${link("montserrat", "es", "hay diez más que no son Montserrat")}.`,
    ),
    callout(
      "info",
      "Una recomendación que vale para todo",
      `Reserva con antelación los monumentos más solicitados y hazlo siempre en la web oficial. Es lo que repite la propia oficina de turismo: [preguntas frecuentes](${TURISME_FAQ}).`,
    ),
    ...relatedBlocks(["gaudi", "trains", "montserrat", "rainy", "surprising"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "This is not a list of places out to cheat you. What happens in Barcelona is simpler: the city has an enormous amount of repeated advice attached to it, and following that advice literally costs time, money and — most of all — the feeling of having seen something other than a queue.",
    ),
    ...paras(
      "Nothing here accuses any business of anything. These are common planning mistakes, many of them exactly what the first page of search results tells you to do, and what works better instead.",
    ),
    table(
      "The mistake, and the alternative",
      ["Common mistake", "What to do instead"],
      [
        ["Buying major attraction tickets through resellers", "Buy only from each monument's own official site"],
        ["Turning up at Park Güell without a booking", "Book a time slot before leaving your hotel"],
        ["Assuming La Rambla is Barcelona", "Gràcia, Sant Antoni, Poblenou, Sants, Poble-sec"],
        ["Always eating on the busiest strip without checking", "Check the menu and prices first, and walk off the strip"],
        ["Going to La Boqueria only for the viral fruit cup", "Treat it as a market — or try Sant Antoni or Santa Caterina"],
        ["Doing all of Gaudí in one day", "Spread it over two, and add the quieter works"],
        ["Only ever using Barceloneta beach", "Bogatell, Nova Icària or Mar Bella"],
        ["Taking taxis everywhere in the centre", "Metro, bus and walking; taxis when they make sense"],
        ["Booking four sights a day", "Two firm ones and real time between them"],
        ["Never leaving the city centre", "A half-day trip, or an outer neighbourhood"],
      ],
    ),
    ...h2(
      "1. Buying tickets outside official channels",
      "The mistake that costs the most money. The major monuments sell tickets on their own websites; any intermediary adds a margin, and in the worst case sells you a slot that does not exist.",
      `Barcelona's tourist board specifically recommends booking in advance and doing it through official websites: [barcelonaturisme.com](${TURISME_BCN}).`,
    ),
    ...h2(
      "2. Arriving at Park Güell without a booking",
      "The monumental zone operates on timed entry. Turning up without a reservation in high season is the most reliable way to lose a morning.",
      "Book the slot before you set out, and allow for the climb — the park is uphill, and arriving worn out changes the visit.",
    ),
    ...h2(
      "3. Mistaking La Rambla for Barcelona",
      "La Rambla has genuine history, but it is one street, not a city. If your memory of Barcelona ends there, you missed almost all of it.",
      "Gràcia has squares where people still live neighbourhood life. Sant Antoni has one of the best-restored markets. Poblenou combines converted factories with the beach. Sants and Poble-sec work Monday to Friday.",
    ),
    ...h2(
      "4. Always eating on the same strip",
      "No accusation needed: in the highest-footfall areas, the relationship between what you pay and what you eat is simply usually worse.",
      "Two practical rules: read the menu and prices before sitting down, and walk five minutes against the crowd. In Barcelona, five minutes is usually enough.",
    ),
    ...h2(
      "5. Going to La Boqueria just for the photo",
      "La Boqueria is a real market, and the market is not the problem. Buying one overpriced fruit cup and leaving is.",
      "For a working market, try Sant Antoni or Santa Caterina. And if you do go to La Boqueria, go early and look at the produce stalls rather than the souvenir ones.",
    ),
    ...h2(
      "6. Trying to do all of Gaudí in one day",
      "Sagrada Família, La Pedrera, Casa Batlló and Park Güell in one day is possible on paper and exhausting in practice, with queues and travel in between.",
      `Split it across two days and add the quieter works: ${link("gaudi", "en", "eight of them are barely visited")}, including the Colònia Güell crypt where Gaudí tested what he would later build at the Sagrada Família.`,
    ),
    ...h2(
      "7. Only using Barceloneta beach",
      "It is the most accessible beach and, in high season, the most crowded. Barcelona has far more seafront than that.",
      "Bogatell and Nova Icària are calmer with better facilities; Mar Bella has a different crowd. None of them takes more than a walk or two extra metro stops.",
    ),
    ...h2(
      "8. Taking taxis everywhere",
      "In central Barcelona a taxi is often slower than the metro and always more expensive. The city is compact and well connected.",
      "Taxis make sense with luggage, late at night, or with reduced mobility. The rest of the time, walking and the metro win.",
    ),
    ...h2(
      "9. Booking too much in one day",
      "The most invisible mistake. Four monuments in a day means four queues, three journeys and no time sitting in a square — which is what people actually remember afterwards.",
      "Two firm visits with real time between them make a better day.",
    ),
    ...h2(
      "10. Never leaving the centre",
      "Barcelona is a good base, and within an hour there are Roman cities, coastal towns and modernist heritage well outside the usual circuit.",
      `${link("trains", "en", "Twelve day trips work by train")}, and ${link("montserrat", "en", "ten more are not Montserrat")}.`,
    ),
    callout(
      "info",
      "One recommendation that covers most of this",
      `Book the busiest monuments in advance, and always through the official website. It is what the city's own tourist board repeats: [frequently asked questions](${TURISME_FAQ}).`,
    ),
    ...relatedBlocks(["gaudi", "trains", "montserrat", "rainy", "surprising"], "en"),
  ];
}

export const TRAPS: FeatureArticle = {
  key: "traps",
  entryKey: "feature-barcelona-traps",
  categoryKey: "cities",
  heroKey: "traps-hero",
  secondaryKey: "traps-second",
  heroAlt: {
    ca: "La platja de la Barceloneta, a Barcelona",
    es: "La playa de la Barceloneta, en Barcelona",
    en: "Barceloneta beach, Barcelona",
  },
  heroCaption: {
    ca: "La Barceloneta es la platja mes accessible de Barcelona i, en temporada alta, la mes saturada.",
    es: "La Barceloneta es la playa mas accesible de Barcelona y, en temporada alta, la mas saturada.",
    en: "Barceloneta is Barcelona's most accessible beach and, in high season, its most crowded.",
  },
  secondaryAlt: {
    ca: "El Mercat de Santa Caterina, amb la seva coberta de colors",
    es: "El Mercat de Santa Caterina, con su cubierta de colores",
    en: "Santa Caterina market and its coloured roof",
  },
  secondaryCaption: {
    ca: "El Mercat de Santa Caterina, una alternativa de mercat de barri al centre de Barcelona.",
    es: "El Mercat de Santa Caterina, una alternativa de mercado de barrio en el centro de Barcelona.",
    en: "Santa Caterina market, a working neighbourhood market in central Barcelona.",
  },
  sources: [
    { name: "Turisme de Barcelona", url: TURISME_BCN, publisher: "Turisme de Barcelona" },
    { name: "Turisme de Barcelona — preguntes freqüents", url: TURISME_FAQ, publisher: "Turisme de Barcelona" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.traps.ca,
      title: "Barcelona sense trampes per a turistes: què evitar i què fer en el seu lloc",
      seoTitle: "Barcelona sense trampes: què evitar i què fer",
      seoDescription:
        "Deu errors de planificació habituals a Barcelona i què funciona millor en el seu lloc, sense acusar cap negoci de res.",
      excerpt:
        "Deu errors de planificació habituals a Barcelona —entrades, cues, barris, platges, transport— i què funciona millor en el seu lloc.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.traps.es,
      title: "Barcelona sin trampas para turistas: qué evitar y qué hacer en su lugar",
      seoTitle: "Barcelona sin trampas: qué evitar y qué hacer",
      seoDescription:
        "Diez errores de planificación habituales en Barcelona y qué funciona mejor en su lugar, sin acusar a ningún negocio de nada.",
      excerpt:
        "Diez errores de planificación habituales en Barcelona —entradas, colas, barrios, playas, transporte— y qué funciona mejor.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.traps.en,
      title: "Barcelona tourist traps to avoid — and what to do instead",
      seoTitle: "Barcelona tourist traps, and what to do instead",
      seoDescription:
        "Ten common planning mistakes in Barcelona and what works better instead — tickets, queues, neighbourhoods, beaches and transport.",
      excerpt:
        "Ten common planning mistakes in Barcelona — tickets, queues, neighbourhoods, beaches, transport — and what works better.",
      blocks: en(),
    },
  },
};
