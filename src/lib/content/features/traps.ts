import type { Block } from "@/lib/content/blocks";
import {
  ARTICLE_PATHS,
  callout,
  h2,
  lead,
  link,
  list,
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
 * overrated use of limited time, or an avoidable cost — never wrongdoing, and
 * never a named venue. There is no sourced allegation to make, so none is made.
 *
 * The tone rule matters as much: the reader is not an idiot for making these
 * mistakes. Most of them are what the search results tell you to do.
 *
 * Re-checked on 24 October 2026:
 * - Turisme de Barcelona's FAQ: prior booking "imprescindible" for Park Güell
 *   and the Sagrada Família, book "a través de las páginas web oficiales",
 *   cheaper in advance.
 * - Park Güell ticket page: timed entry, 30 minutes' grace after the time on
 *   the ticket.
 * - La Boqueria: Monday to Saturday, 8:00 to 20:30 (Ajuntament de Barcelona
 *   listing). The Sunday exceptions printed there are last season's, so they
 *   are not repeated.
 * No ticket prices are printed: the monuments' own price pages could not be
 * read reliably today, and a wrong price is worse than a link.
 */

const TURISME_BCN = "https://www.barcelonaturisme.com/";
const TURISME_FAQ = "https://professional.barcelonaturisme.com/es/travel-trade/preguntas-frecuentes";
const PARK_GUELL = "https://parkguell.barcelona/en/buy-tickets";
const BOQUERIA = "https://ajuntament.barcelona.cat/memoriademocratica/en/detail/mercat-boqueria-sant-josep_92086009447";

const OFFICIAL_SITES = [
  "**Sagrada Família:** [sagradafamilia.org](https://sagradafamilia.org/)",
  "**Park Güell:** [parkguell.barcelona](https://parkguell.barcelona/)",
  "**Casa Batlló:** [casabatllo.es](https://www.casabatllo.es/)",
  "**La Pedrera:** [lapedrera.com](https://www.lapedrera.com/)",
];

const faq = (items: { question: string; answer: string }[]): Block =>
  ({ type: "faq", items }) as Block;

function ca(): Block[] {
  return [
    lead(
      "Les trampes per a turistes més habituals a Barcelona no són llocs concrets: són errors de planificació. Comprar entrades a revenedors en lloc del web oficial, presentar-se al Park Güell sense reserva, creure que la Rambla és Barcelona, menjar a l'eix més transitat sense mirar preus i anar a la Boqueria només per la foto. A la taula tens cada error i què fer en lloc seu.",
    ),
    ...paras(
      "Aquesta llista no acusa cap negoci de res. Parla d'errors habituals —molts dels quals són exactament el que et diu la primera pàgina de resultats— i del que funciona millor.",
    ),
    table(
      "Les 10 trampes per a turistes a Barcelona i l'alternativa",
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
      "És l'error que més diners costa. Els grans monuments venen les entrades al seu propi web, i qualsevol intermediari hi afegeix un marge o, en el pitjor dels casos, et ven una franja que no existeix.",
      `Turisme de Barcelona ho diu clar a les seves preguntes freqüents: «Te recomendamos reservar a través de las páginas web oficiales», i afegeix que el preu és més econòmic si reserves per avançat. Font: [Turisme de Barcelona](${TURISME_FAQ}).`,
    ),
    ...h2("Els webs oficials dels monuments més buscats"),
    list(...OFFICIAL_SITES),
    ...paras(
      "Si un web que no és cap d'aquests et ven l'entrada, no és el canal oficial: compara-ho abans de pagar.",
    ),
    ...h2(
      "2. Arribar al Park Güell sense reserva",
      "Turisme de Barcelona diu que per al Park Güell i la Sagrada Família «es imprescindible hacer una reserva previa para poder acceder». L'entrada al Park Güell és amb hora assignada: segons el web del parc, tens 30 minuts després de l'hora de l'entrada per accedir-hi.",
      `Reserva la franja abans de sortir, a [parkguell.barcelona](${PARK_GUELL}), i compta el temps de pujada: el parc és amunt, i la diferència entre arribar-hi descansat o no és considerable.`,
    ),
    ...h2(
      "3. Confondre la Rambla amb Barcelona",
      "La Rambla té el seu interès històric, però és un eix, no una ciutat. Si el teu record de Barcelona s'hi acaba, t'has perdut gairebé tota la ciutat.",
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
      `Si vols mercat de veritat, el de Sant Antoni i el de Santa Caterina funcionen com el que són. I si vas a la Boqueria, vés a primera hora i mira les parades de producte, no les de souvenir comestible. Obre **de dilluns a dissabte, de 8.00 a 20.30**, segons l'[Ajuntament de Barcelona](${BOQUERIA}); el diumenge no és dia d'obertura habitual.`,
    ),
    ...h2(
      "6. Intentar fer tot Gaudí en un dia",
      "Sagrada Família, Pedrera, Casa Batlló i Park Güell en una jornada és possible sobre el paper i esgotador a la pràctica, amb cues i desplaçaments enmig.",
      `Reparteix-ho en dos dies i afegeix-hi obres menys massificades: ${link("gaudi", "ca", "n'hi ha vuit que gairebé ningú visita")}, entre elles la cripta de la Colònia Güell, que és on Gaudí va assajar el que després faria a la Sagrada Família.`,
    ),
    ...h2(
      "7. Anar només a la Barceloneta",
      "És la platja més accessible i, en temporada alta, la més saturada. Barcelona té més façana marítima.",
      "Bogatell i Nova Icària acostumen a ser més tranquil·les; Mar Bella té un ambient diferent. Cap no requereix res més que continuar caminant o agafar el metro unes parades més.",
    ),
    ...h2(
      "8. Moure's sempre en taxi",
      "Al centre de Barcelona, el taxi sovint és més lent que el metro i gairebé sempre més car. La ciutat és compacta i està ben comunicada.",
      "El taxi té sentit amb equipatge, de matinada o amb mobilitat reduïda. La resta del temps, el metro i caminar guanyen.",
    ),
    ...h2(
      "9. Encadenar massa visites per dia",
      "L'error més invisible. Quatre monuments en un dia significa quatre cues, tres desplaçaments i cap estona per seure en una plaça, que és exactament el que després es recorda.",
      `Dues visites fermes i marge real entremig donen un dia millor. I si plou, ${link("rainy", "ca", "aquí tens plans per a dies de pluja")}.`,
    ),
    ...h2(
      "10. No sortir mai del centre",
      "Barcelona és una bona base, i a menys d'una hora hi ha ciutats romanes, pobles de costa i patrimoni modernista fora del circuit.",
      `${link("trains", "ca", "Dotze escapades es fan en tren")}, i ${link("montserrat", "ca", "n'hi ha deu més que no són Montserrat")}.`,
    ),
    faq([
      {
        question: "Quines són les trampes per a turistes més habituals a Barcelona?",
        answer:
          "Més que llocs, errors: comprar entrades a revenedors, anar al Park Güell sense reserva, quedar-se a la Rambla, menjar a l'eix més transitat sense mirar preus i voler veure tot Gaudí en un dia.",
      },
      {
        question: "Cal reservar per anar al Park Güell?",
        answer:
          "Sí. Turisme de Barcelona diu que la reserva prèvia és imprescindible per al Park Güell i la Sagrada Família, i l'entrada al parc és amb hora assignada, amb 30 minuts de marge per accedir-hi.",
      },
      {
        question: "On compro les entrades de la Sagrada Família i el Park Güell?",
        answer:
          "Al web oficial de cada monument (sagradafamilia.org i parkguell.barcelona). Turisme de Barcelona recomana reservar-hi per avançat, i diu que així el preu és més econòmic.",
      },
      {
        question: "La Boqueria obre el diumenge?",
        answer:
          "No com a norma: l'horari de l'Ajuntament és de dilluns a dissabte, de 8.00 a 20.30.",
      },
    ]),
    callout(
      "info",
      "Una recomanació que val per a tot",
      `Reserva amb antelació els monuments més sol·licitats i fes-ho sempre al web oficial. És el consell que repeteix l'oficina de turisme de la ciutat: [preguntes freqüents](${TURISME_FAQ}). Comprovat el 24 d'octubre de 2026.`,
    ),
    ...relatedBlocks(["gaudi", "trains", "montserrat", "rainy", "surprising"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "Las trampas para turistas más habituales en Barcelona no son sitios concretos: son errores de planificación. Comprar entradas en webs de reventa en lugar de la web oficial, presentarse en el Park Güell sin reserva, creer que la Rambla es Barcelona, comer en el eje más transitado sin mirar precios e ir a la Boqueria solo por la foto. En la tabla tienes cada error y qué hacer en su lugar.",
    ),
    ...paras(
      "Esta lista no acusa a ningún negocio de nada. Habla de errores habituales —muchos de los cuales son exactamente lo que te dice la primera página de resultados— y de lo que funciona mejor.",
    ),
    table(
      "Las 10 trampas para turistas en Barcelona y la alternativa",
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
      `Turisme de Barcelona lo dice claro en sus preguntas frecuentes: «Te recomendamos reservar a través de las páginas web oficiales», y añade que «el precio es más económico al reservar por adelantado». Fuente: [Turisme de Barcelona](${TURISME_FAQ}).`,
    ),
    ...h2("Las webs oficiales de los monumentos más buscados"),
    list(...OFFICIAL_SITES),
    ...paras(
      "Si una web que no es ninguna de estas te vende la entrada, no es el canal oficial: compáralo antes de pagar.",
    ),
    ...h2(
      "2. Llegar al Park Güell sin reserva",
      "Turisme de Barcelona dice que para el Park Güell y la Sagrada Família «es imprescindible hacer una reserva previa para poder acceder». La entrada al Park Güell es con hora asignada: según la web del parque, tienes 30 minutos después de la hora de tu entrada para acceder.",
      `Reserva la franja antes de salir, en [parkguell.barcelona](${PARK_GUELL}), y cuenta el tiempo de subida: el parque está arriba.`,
    ),
    ...h2(
      "3. Confundir la Rambla con Barcelona",
      "La Rambla tiene su interés histórico, pero es un eje, no una ciudad. Si tu recuerdo de Barcelona termina ahí, te has perdido casi toda la ciudad.",
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
      `Si quieres mercado de verdad, el de Sant Antoni y el de Santa Caterina funcionan como lo que son. Y si vas a la Boqueria, ve a primera hora y mira los puestos de producto. Abre **de lunes a sábado, de 8:00 a 20:30**, según el [Ayuntamiento de Barcelona](${BOQUERIA}); el domingo no es día de apertura habitual.`,
    ),
    ...h2(
      "6. Intentar hacer todo Gaudí en un día",
      "Sagrada Família, Pedrera, Casa Batlló y Park Güell en una jornada es posible sobre el papel y agotador en la práctica.",
      `Repártelo en dos días y añade obras menos masificadas: ${link("gaudi", "es", "hay ocho que casi nadie visita")}, entre ellas la cripta de la Colònia Güell.`,
    ),
    ...h2(
      "7. Ir solo a la Barceloneta",
      "Es la playa más accesible y, en temporada alta, la más saturada. Barcelona tiene más fachada marítima.",
      "Bogatell y Nova Icària suelen estar más tranquilas; Mar Bella tiene otro ambiente. Ninguna requiere más que seguir caminando o coger el metro unas paradas más.",
    ),
    ...h2(
      "8. Moverse siempre en taxi",
      "En el centro de Barcelona el taxi suele ser más lento que el metro y casi siempre más caro. La ciudad es compacta y está bien comunicada.",
      "El taxi tiene sentido con equipaje, de madrugada o con movilidad reducida.",
    ),
    ...h2(
      "9. Encadenar demasiadas visitas al día",
      "El error más invisible. Cuatro monumentos en un día son cuatro colas, tres desplazamientos y ningún rato para sentarse en una plaza, que es exactamente lo que después se recuerda.",
      `Dos visitas firmes y margen real entre ellas dan un día mejor. Y si llueve, ${link("rainy", "es", "aquí tienes planes para días de lluvia")}.`,
    ),
    ...h2(
      "10. No salir nunca del centro",
      "Barcelona es una buena base, y a menos de una hora hay ciudades romanas, pueblos de costa y patrimonio modernista fuera del circuito.",
      `${link("trains", "es", "Doce escapadas se hacen en tren")}, y ${link("montserrat", "es", "hay diez más que no son Montserrat")}.`,
    ),
    faq([
      {
        question: "¿Cuáles son las trampas para turistas más habituales en Barcelona?",
        answer:
          "Más que sitios, errores: comprar entradas en webs de reventa, ir al Park Güell sin reserva, quedarse en la Rambla, comer en el eje más transitado sin mirar precios y querer ver todo Gaudí en un día.",
      },
      {
        question: "¿Hay que reservar para ir al Park Güell?",
        answer:
          "Sí. Turisme de Barcelona dice que la reserva previa es imprescindible para el Park Güell y la Sagrada Família, y la entrada al parque es con hora asignada, con 30 minutos de margen para acceder.",
      },
      {
        question: "¿Dónde compro las entradas de la Sagrada Família y el Park Güell?",
        answer:
          "En la web oficial de cada monumento (sagradafamilia.org y parkguell.barcelona). Turisme de Barcelona recomienda reservar ahí por adelantado y dice que así el precio es más económico.",
      },
      {
        question: "¿La Boqueria abre los domingos?",
        answer: "No como norma: el horario del Ayuntamiento es de lunes a sábado, de 8:00 a 20:30.",
      },
    ]),
    callout(
      "info",
      "Una recomendación que vale para todo",
      `Reserva con antelación los monumentos más solicitados y hazlo siempre en la web oficial. Es lo que repite la propia oficina de turismo: [preguntas frecuentes](${TURISME_FAQ}). Comprobado el 24 de octubre de 2026.`,
    ),
    ...relatedBlocks(["gaudi", "trains", "montserrat", "rainy", "surprising"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "Barcelona's most common tourist traps are not particular places: they are planning mistakes. Buying tickets from resellers instead of the official site, turning up at Park Güell without a booking, assuming La Rambla is Barcelona, eating on the busiest strip without checking prices, and visiting La Boqueria only for the photo. The table gives each mistake and what to do instead.",
    ),
    ...paras(
      "Nothing here accuses any business of anything. These are common mistakes, many of them exactly what the first page of search results tells you to do, and what works better.",
    ),
    table(
      "10 Barcelona tourist traps, and the alternative",
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
      `Barcelona's tourist board says it plainly in its FAQ: it recommends booking through the official websites, and notes that booking ahead is cheaper. Source: [Turisme de Barcelona](${TURISME_FAQ}).`,
    ),
    ...h2("The official websites of the most-visited sights"),
    list(...OFFICIAL_SITES),
    ...paras(
      "If a site that is none of these is selling you the ticket, it is not the official channel: compare before you pay.",
    ),
    ...h2(
      "2. Arriving at Park Güell without a booking",
      "Turisme de Barcelona says advance booking is essential to get into Park Güell and the Sagrada Família. Park Güell tickets carry an entry time, and according to the park's own site you have 30 minutes after that time to get in.",
      `Book the slot before you set out, at [parkguell.barcelona](${PARK_GUELL}), and allow for the climb — the park is uphill, and arriving worn out changes the visit.`,
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
      `For a working market, try Sant Antoni or Santa Caterina. And if you do go to La Boqueria, go early and look at the produce stalls rather than the souvenir ones. It opens **Monday to Saturday, 8:00 to 20:30**, according to [Barcelona City Council](${BOQUERIA}); Sunday is not a regular opening day.`,
    ),
    ...h2(
      "6. Trying to do all of Gaudí in one day",
      "Sagrada Família, La Pedrera, Casa Batlló and Park Güell in one day is possible on paper and exhausting in practice, with queues and travel in between.",
      `Split it across two days and add the quieter works: ${link("gaudi", "en", "eight of them are barely visited")}, including the Colònia Güell crypt where Gaudí tested what he would later build at the Sagrada Família.`,
    ),
    ...h2(
      "7. Only using Barceloneta beach",
      "It is the most accessible beach and, in high season, the most crowded. Barcelona has far more seafront than that.",
      "Bogatell and Nova Icària tend to be calmer; Mar Bella has a different crowd. None of them takes more than a walk or a few extra metro stops.",
    ),
    ...h2(
      "8. Taking taxis everywhere",
      "In central Barcelona a taxi is often slower than the metro and almost always more expensive. The city is compact and well connected.",
      "Taxis make sense with luggage, late at night, or with reduced mobility. The rest of the time, walking and the metro win.",
    ),
    ...h2(
      "9. Booking too much in one day",
      "The most invisible mistake. Four monuments in a day means four queues, three journeys and no time sitting in a square — which is what people actually remember afterwards.",
      `Two firm visits with real time between them make a better day. If it rains, ${link("rainy", "en", "here are rainy-day plans")}.`,
    ),
    ...h2(
      "10. Never leaving the centre",
      "Barcelona is a good base, and within an hour there are Roman cities, coastal towns and modernist heritage well outside the usual circuit.",
      `${link("trains", "en", "Twelve day trips work by train")}, and ${link("montserrat", "en", "ten more are not Montserrat")}.`,
    ),
    faq([
      {
        question: "What are the most common tourist traps in Barcelona?",
        answer:
          "Mistakes more than places: buying tickets from resellers, going to Park Güell without a booking, never leaving La Rambla, eating on the busiest strip without checking prices, and trying to see all of Gaudí in one day.",
      },
      {
        question: "Do I need to book Park Güell in advance?",
        answer:
          "Yes. Turisme de Barcelona says advance booking is essential for Park Güell and the Sagrada Família. Park Güell tickets have an entry time, with 30 minutes' grace to get in.",
      },
      {
        question: "Where should I buy Sagrada Família and Park Güell tickets?",
        answer:
          "On each monument's official website (sagradafamilia.org and parkguell.barcelona). The tourist board recommends booking there in advance and says it is cheaper that way.",
      },
      {
        question: "Is La Boqueria open on Sundays?",
        answer: "Not as a rule: the City Council lists it as open Monday to Saturday, 8:00 to 20:30.",
      },
    ]),
    callout(
      "info",
      "One recommendation that covers most of this",
      `Book the busiest monuments in advance, and always through the official website. It is what the city's own tourist board repeats: [frequently asked questions](${TURISME_FAQ}). Checked on 24 October 2026.`,
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
    { name: "Turisme de Barcelona — preguntes freqüents", url: TURISME_FAQ, publisher: "Turisme de Barcelona" },
    { name: "Turisme de Barcelona", url: TURISME_BCN, publisher: "Turisme de Barcelona" },
    { name: "Park Güell — entrades", url: PARK_GUELL, publisher: "Park Güell" },
    { name: "Mercat de la Boqueria (Sant Josep)", url: BOQUERIA, publisher: "Ajuntament de Barcelona" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.traps.ca,
      title: "Trampes per a turistes a Barcelona: què evitar i què fer en lloc seu",
      seoTitle: "Trampes per a turistes a Barcelona i què fer en lloc seu",
      seoDescription:
        "Les 10 trampes per a turistes més habituals a Barcelona (entrades, Park Güell, Rambla, Boqueria, platges, taxi) i què funciona millor, amb els webs oficials.",
      excerpt:
        "Deu errors habituals a Barcelona —entrades, cues, barris, platges, transport— i què funciona millor en el seu lloc, amb els webs oficials dels monuments.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.traps.es,
      title: "Trampas para turistas en Barcelona: qué evitar y qué hacer en su lugar",
      seoTitle: "Trampas para turistas en Barcelona y qué hacer en su lugar",
      seoDescription:
        "Las 10 trampas para turistas más habituales en Barcelona (entradas, Park Güell, Rambla, Boqueria, playas, taxi) y qué funciona mejor, con las webs oficiales.",
      excerpt:
        "Diez errores habituales en Barcelona —entradas, colas, barrios, playas, transporte— y qué funciona mejor, con las webs oficiales de los monumentos.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.traps.en,
      title: "Barcelona tourist traps to avoid — and what to do instead",
      seoTitle: "Barcelona tourist traps to avoid, and what to do instead",
      seoDescription:
        "The 10 most common Barcelona tourist traps — tickets, Park Güell, La Rambla, La Boqueria, beaches, taxis — and what works better, with the official sites.",
      excerpt:
        "Ten common mistakes in Barcelona — tickets, queues, neighbourhoods, beaches, transport — and what works better, with the monuments' official websites.",
      blocks: en(),
    },
  },
};
