import type { Block } from "@/lib/content/blocks";
import {
  ARTICLE_PATHS,
  h2,
  lead,
  link,
  paras,
  relatedBlocks,
  table,
  type FeatureArticle,
} from "./shared";

/**
 * Article 7 — day trips that are not Montserrat.
 *
 * The premise is not that Montserrat is overrated. It is that "day trip from
 * Barcelona" has collapsed into one answer, and the ten below are genuinely
 * different kinds of day. Each entry states plainly whether it works by public
 * transport or really wants a car, because that is the detail that decides
 * whether a reader's day works.
 */

const RODALIES = "https://rodalies.gencat.cat/ca/horaris/tots-els-horaris/";
const PATRIMONI = "https://patrimoni.gencat.cat/";
const CARDONA = "https://cardonaturisme.cat/";

function ca(): Block[] {
  return [
    lead(
      "Montserrat és excel·lent i mereix la fama que té. El problema és un altre: «escapada des de Barcelona» s'ha reduït gairebé a una sola resposta, i hi ha deu jornades molt diferents a menys d'una hora i mitja de la ciutat.",
    ),
    ...paras(
      "Aquesta llista barreja destinacions que es fan còmodament en transport públic i altres on el cotxe o l'autobús marquen la diferència. Ho indiquem a cada cas, perquè és el que decideix si el dia funciona o s'omple d'esperes.",
    ),
    table(
      "Les 10 escapades",
      ["Destinació", "Com s'hi va millor", "Quin dia és"],
      [
        ["Colònia Güell", "Tren (FGC)", "Arquitectura i història industrial"],
        ["Terrassa", "Tren", "Modernisme i patrimoni industrial"],
        ["Vic", "Tren (R3)", "Ciutat històrica i mercat"],
        ["Cardona", "Cotxe o bus", "Castell i muntanya de sal"],
        ["Mataró", "Tren (R1)", "Mar i Gaudí primerenc"],
        ["Sant Cugat del Vallès", "Tren (FGC)", "Monestir i mitja jornada fàcil"],
        ["Vilafranca del Penedès", "Tren (R4)", "Cultura del vi"],
        ["Montblanc", "Tren o cotxe", "Vila emmurallada"],
        ["Rupit i el Collsacabra", "Cotxe", "Poble de pedra i paisatge"],
        ["Vilanova i la Geltrú", "Tren (R2 Sud)", "Platja i museu del ferrocarril"],
      ],
    ),
    ...h2(
      "1. Colònia Güell",
      "A Santa Coloma de Cervelló, la colònia industrial que Eusebi Güell va fer construir és una de les escapades més ben resoltes que hi ha des de Barcelona: s'hi arriba en tren, és compacta, i té la cripta de Gaudí com a peça central.",
      `És la millor manera d'entendre alhora l'arquitectura de Gaudí i el model de colònia tèxtil catalana. ${link("gaudi", "ca", "En parlem amb detall aquí")}.`,
      "S'hi va bé en transport públic.",
    ),
    ...h2(
      "2. Terrassa",
      "El conjunt monumental de les esglésies de Sant Pere és patrimoni visigòtic i romànic de primer nivell, i el MNACTEC ocupa una fàbrica modernista espectacular.",
      "Afegeix-hi la Masia Freixa i tens una jornada completa que, a més, funciona amb mal temps.",
      "S'hi va bé en tren.",
    ),
    ...h2(
      "3. Vic",
      "Una ciutat amb vida pròpia i molt menys turisme internacional que altres destinacions d'aquesta llista. La Plaça Major, el centre històric, la catedral i el Museu d'Art Medieval s'encadenen a peu.",
      "Si coincideix amb dia de mercat, la visita canvia completament de caràcter.",
      "S'hi va bé en tren (R3).",
    ),
    ...h2(
      "4. Cardona",
      "El castell sobre el turó i la Muntanya de Sal fan de Cardona una de les escapades més singulars de Catalunya: una mina de sal visitable sota una fortalesa medieval.",
      `És també on se celebra la fira de bolets de tardor. ${link("foodfairs", "ca", "La tenim a la guia de fires gastronòmiques")}.`,
      `Aquí el cotxe o l'autobús marquen la diferència: no hi ha connexió ferroviària directa còmoda. Informació: [cardonaturisme.cat](${CARDONA}).`,
    ),
    ...h2(
      "5. Mataró",
      "Mar, centre urbà i la Nau Gaudí, una de les primeres obres construïdes de l'arquitecte, a poca distància de l'estació.",
      "És l'escapada més curta de la llista i funciona molt bé com a mitja jornada.",
      "S'hi va bé en tren (R1).",
    ),
    ...h2(
      "6. Sant Cugat del Vallès",
      "El monestir de Sant Cugat té un dels claustres romànics més notables de Catalunya, i és a pocs minuts de Barcelona amb FGC.",
      "És la millor opció quan tens mitja tarda i no vols perdre-la en desplaçaments.",
      "S'hi va bé en transport públic.",
    ),
    ...h2(
      "7. Vilafranca del Penedès",
      "Capital del Penedès i seu del VINSEUM. La combinació de centre històric compacte i cultura del vi la fa especialment fàcil de resoldre en un dia.",
      "S'hi va bé en tren (R4).",
    ),
    ...h2(
      "8. Montblanc",
      "La vila emmurallada més completa de Catalunya. Si el que et crida de Montserrat és la monumentalitat, aquesta és una alternativa d'un altre ordre: medieval, urbana i recorrible a peu.",
      `Encaixa amb ${link("medieval", "ca", "la nostra ruta de pobles medievals")}.`,
      "Es pot fer en tren, però el cotxe dona més marge per combinar-hi Poblet o Santes Creus.",
    ),
    ...h2(
      "9. Rupit i el Collsacabra",
      "Pedra, cingles, pont penjant i un dels paisatges més característics de la Catalunya interior. És l'escapada més «de natura» de la llista.",
      "Aquí el cotxe és clarament recomanable: el transport públic hi arriba, però amb poca freqüència.",
    ),
    ...h2(
      "10. Vilanova i la Geltrú",
      "Platja, rambla i el Museu del Ferrocarril just al costat de l'estació. És la manera de tenir mar sense la concentració de visitants de Sitges.",
      "S'hi va bé en tren (R2 Sud).",
    ),
    ...h2(
      "Com triar en funció del dia que vols",
      "Si vols arquitectura: Colònia Güell o Terrassa.",
      "Si vols una ciutat viva: Vic.",
      "Si vols alguna cosa que no s'assembli a res: Cardona.",
      "Si vols mar: Mataró o Vilanova i la Geltrú.",
      "Si vols Edat Mitjana: Montblanc.",
      "Si vols paisatge: Rupit.",
      `Totes les que es fan en tren surten desenvolupades a ${link("trains", "ca", "la nostra guia d'escapades sense cotxe")}, amb les línies i el que cal comprovar abans de sortir. Horaris: [rodalies.gencat.cat](${RODALIES}).`,
    ),
    ...relatedBlocks(["trains", "medieval", "surprising", "gaudi", "rainy"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "Montserrat es excelente y merece la fama que tiene. El problema es otro: «escapada desde Barcelona» se ha reducido casi a una sola respuesta, y hay diez jornadas muy distintas a menos de hora y media de la ciudad.",
    ),
    ...paras(
      "Esta lista mezcla destinos que se hacen cómodamente en transporte público y otros donde el coche o el autobús marcan la diferencia. Lo indicamos en cada caso, porque es lo que decide si el día funciona o se llena de esperas.",
    ),
    table(
      "Las 10 escapadas",
      ["Destino", "Cómo se llega mejor", "Qué día es"],
      [
        ["Colònia Güell", "Tren (FGC)", "Arquitectura e historia industrial"],
        ["Terrassa", "Tren", "Modernismo y patrimonio industrial"],
        ["Vic", "Tren (R3)", "Ciudad histórica y mercado"],
        ["Cardona", "Coche o bus", "Castillo y montaña de sal"],
        ["Mataró", "Tren (R1)", "Mar y Gaudí temprano"],
        ["Sant Cugat del Vallès", "Tren (FGC)", "Monasterio y media jornada fácil"],
        ["Vilafranca del Penedès", "Tren (R4)", "Cultura del vino"],
        ["Montblanc", "Tren o coche", "Villa amurallada"],
        ["Rupit y el Collsacabra", "Coche", "Pueblo de piedra y paisaje"],
        ["Vilanova i la Geltrú", "Tren (R2 Sud)", "Playa y museo del ferrocarril"],
      ],
    ),
    ...h2(
      "1. Colònia Güell",
      "En Santa Coloma de Cervelló, la colonia industrial que Eusebi Güell mandó construir es una de las escapadas mejor resueltas desde Barcelona: se llega en tren, es compacta y tiene la cripta de Gaudí como pieza central.",
      `Es la mejor forma de entender a la vez la arquitectura de Gaudí y el modelo de colonia textil catalana. ${link("gaudi", "es", "Hablamos de ella en detalle aquí")}.`,
    ),
    ...h2(
      "2. Terrassa",
      "El conjunto monumental de las iglesias de Sant Pere es patrimonio visigótico y románico de primer nivel, y el MNACTEC ocupa una fábrica modernista espectacular. Con la Masia Freixa tienes una jornada completa que además funciona con mal tiempo.",
    ),
    ...h2(
      "3. Vic",
      "Una ciudad con vida propia y mucho menos turismo internacional. Plaça Major, casco histórico, catedral y Museu d'Art Medieval se encadenan a pie. Si coincide con día de mercado, la visita cambia por completo.",
    ),
    ...h2(
      "4. Cardona",
      "El castillo sobre el cerro y la Montaña de Sal hacen de Cardona una de las escapadas más singulares de Cataluña: una mina de sal visitable bajo una fortaleza medieval.",
      `Aquí el coche o el autobús marcan la diferencia: no hay conexión ferroviaria directa cómoda. Información: [cardonaturisme.cat](${CARDONA}).`,
    ),
    ...h2(
      "5. Mataró",
      "Mar, centro urbano y la Nau Gaudí, una de las primeras obras construidas del arquitecto, cerca de la estación. Es la escapada más corta de la lista y funciona como media jornada.",
    ),
    ...h2(
      "6. Sant Cugat del Vallès",
      "El monasterio de Sant Cugat tiene uno de los claustros románicos más notables de Cataluña, a pocos minutos de Barcelona con FGC. La mejor opción cuando tienes media tarde.",
    ),
    ...h2(
      "7. Vilafranca del Penedès",
      "Capital del Penedès y sede del VINSEUM. Centro histórico compacto y cultura del vino: fácil de resolver en un día.",
    ),
    ...h2(
      "8. Montblanc",
      "La villa amurallada más completa de Cataluña. Si lo que te atrae de Montserrat es la monumentalidad, esta es una alternativa de otro orden.",
      `Encaja con ${link("medieval", "es", "nuestra ruta de pueblos medievales")}. Se puede hacer en tren, pero el coche da más margen para combinarlo con Poblet o Santes Creus.`,
    ),
    ...h2(
      "9. Rupit y el Collsacabra",
      "Piedra, riscos, puente colgante y uno de los paisajes más característicos de la Cataluña interior. Es la escapada más de naturaleza de la lista.",
      "Aquí el coche es claramente recomendable.",
    ),
    ...h2(
      "10. Vilanova i la Geltrú",
      "Playa, rambla y el Museo del Ferrocarril junto a la estación. La forma de tener mar sin la concentración de visitantes de Sitges.",
    ),
    ...h2(
      "Cómo elegir según el día que quieres",
      "Arquitectura: Colònia Güell o Terrassa. Ciudad viva: Vic. Algo que no se parece a nada: Cardona. Mar: Mataró o Vilanova. Edad Media: Montblanc. Paisaje: Rupit.",
      `Todas las que se hacen en tren están desarrolladas en ${link("trains", "es", "nuestra guía de escapadas sin coche")}. Horarios: [rodalies.gencat.cat](${RODALIES}).`,
    ),
    ...relatedBlocks(["trains", "medieval", "surprising", "gaudi", "rainy"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "Montserrat deserves its reputation. The problem is different: \"day trip from Barcelona\" has collapsed into a single answer, when there are ten genuinely different days out within about ninety minutes of the city.",
    ),
    ...paras(
      "This list mixes places that work comfortably on public transport with places where a car or a bus makes a real difference. Each entry says which — that is what decides whether your day works or turns into waiting.",
    ),
    table(
      "The 10 trips",
      ["Destination", "Best way to get there", "What kind of day"],
      [
        ["Colònia Güell", "Train (FGC)", "Architecture and industrial history"],
        ["Terrassa", "Train", "Modernisme and industrial heritage"],
        ["Vic", "Train (R3)", "Historic city and market town"],
        ["Cardona", "Car or bus", "Castle and salt mountain"],
        ["Mataró", "Train (R1)", "Sea and early Gaudí"],
        ["Sant Cugat del Vallès", "Train (FGC)", "Monastery, easy half-day"],
        ["Vilafranca del Penedès", "Train (R4)", "Wine culture"],
        ["Montblanc", "Train or car", "Walled medieval town"],
        ["Rupit and the Collsacabra", "Car", "Stone village and landscape"],
        ["Vilanova i la Geltrú", "Train (R2 Sud)", "Beach and railway museum"],
      ],
    ),
    ...h2(
      "1. Colònia Güell",
      "In Santa Coloma de Cervelló, the industrial village Eusebi Güell had built is one of the most neatly solved trips from Barcelona: reachable by train, compact, and centred on Gaudí's crypt.",
      `It is the best way to understand Gaudí's engineering and the Catalan textile-colony model at the same time. ${link("gaudi", "en", "We cover it in detail here")}.`,
      "Easy on public transport.",
    ),
    ...h2(
      "2. Terrassa",
      "The Sant Pere churches are first-rate Visigothic and Romanesque heritage, and MNACTEC occupies a spectacular modernist factory. Add the Masia Freixa and you have a full day that also works in bad weather.",
      "Easy by train.",
    ),
    ...h2(
      "3. Vic",
      "A working Catalan city with far fewer international visitors. The enormous main square, the historic centre, the cathedral and the medieval art museum all connect on foot.",
      "If your visit lands on a market day, it becomes a different trip entirely.",
      "Easy by train (R3).",
    ),
    ...h2(
      "4. Cardona",
      "A castle on a hill and a salt mountain you can go inside: Cardona is one of the strangest and best days out in Catalonia. The salt mine sits beneath a medieval fortress.",
      `Here a car or bus makes the real difference — there is no convenient direct rail link. Information: [cardonaturisme.cat](${CARDONA}).`,
    ),
    ...h2(
      "5. Mataró",
      "Sea, town centre, and the Nau Gaudí — one of the architect's first completed buildings — a short walk from the station. The shortest trip here, and a good half-day.",
      "Easy by train (R1).",
    ),
    ...h2(
      "6. Sant Cugat del Vallès",
      "The monastery has one of Catalonia's finest Romanesque cloisters, minutes from Barcelona on the FGC line. The right choice when you have half an afternoon and do not want to spend it travelling.",
    ),
    ...h2(
      "7. Vilafranca del Penedès",
      "The capital of the Penedès wine region and home to VINSEUM. A compact historic centre plus wine culture makes it easy to resolve in a day.",
      "Easy by train (R4).",
    ),
    ...h2(
      "8. Montblanc",
      "The most complete walled town in Catalonia. If what draws you to Montserrat is scale, this is scale of an entirely different kind: medieval, urban, and walkable.",
      `It fits with ${link("medieval", "en", "our medieval villages route")}. Reachable by train, though a car gives you room to add the Poblet or Santes Creus monasteries.`,
    ),
    ...h2(
      "9. Rupit and the Collsacabra",
      "Stone houses, cliffs, a suspension footbridge and one of the most characteristic landscapes of inland Catalonia. The most nature-led trip on this list.",
      "A car is clearly advisable here.",
    ),
    ...h2(
      "10. Vilanova i la Geltrú",
      "A beach, a promenade and the railway museum beside the station — the way to get the sea without Sitges's crowds.",
      "Easy by train (R2 Sud).",
    ),
    ...h2(
      "Choosing by the kind of day you want",
      "Architecture: Colònia Güell or Terrassa. A living city: Vic. Something unlike anywhere else: Cardona. The sea: Mataró or Vilanova. The Middle Ages: Montblanc. Landscape: Rupit.",
      `Every trip here that works by rail is covered in ${link("trains", "en", "our car-free day trips guide")}, with lines and what to check before you leave. Timetables: [rodalies.gencat.cat](${RODALIES}).`,
    ),
    ...paras(`Heritage records for most of these sites: [patrimoni.gencat.cat](${PATRIMONI}).`),
    ...relatedBlocks(["trains", "medieval", "surprising", "gaudi", "rainy"], "en"),
  ];
}

export const MONTSERRAT: FeatureArticle = {
  key: "montserrat",
  entryKey: "feature-beyond-montserrat",
  categoryKey: "cities",
  heroKey: "escapades-barcelona-mes-enlla-montserrat",
  secondaryKey: "cardona-vic-escapades-catalunya",
  heroAlt: {
    ca: "Paisatge d'una escapada des de Barcelona més enllà de Montserrat",
    es: "Paisaje de una escapada desde Barcelona más allá de Montserrat",
    en: "Landscape on a Barcelona day trip beyond Montserrat",
  },
  heroCaption: {
    ca: "Imatge representativa d'una escapada per l'interior de Catalunya. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de una escapada por el interior de Cataluña. Ilustración generada con inteligencia artificial.",
    en: "Representative image of a day trip in inland Catalonia. Illustration generated with artificial intelligence.",
  },
  secondaryAlt: {
    ca: "Vila catalana d'interior amb patrimoni històric",
    es: "Villa catalana de interior con patrimonio histórico",
    en: "An inland Catalan town with historic heritage",
  },
  secondaryCaption: {
    ca: "Imatge representativa d'una vila catalana d'interior. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de una villa catalana de interior. Ilustración generada con inteligencia artificial.",
    en: "Representative image of an inland Catalan town. Illustration generated with artificial intelligence.",
  },
  sources: [
    { name: "Horaris de Rodalies de Catalunya", url: RODALIES, publisher: "Generalitat de Catalunya" },
    { name: "Patrimoni Cultural de Catalunya", url: PATRIMONI, publisher: "Generalitat de Catalunya" },
    { name: "Cardona Turisme", url: CARDONA, publisher: "Ajuntament de Cardona" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.montserrat.ca,
      title: "Més enllà de Montserrat: 10 escapades des de Barcelona que valen molt la pena",
      seoTitle: "10 escapades des de Barcelona que no són Montserrat",
      seoDescription:
        "Deu escapades des de Barcelona que no són Montserrat, amb el mitjà de transport que funciona millor per a cadascuna.",
      excerpt:
        "Deu jornades molt diferents a menys d'hora i mitja de Barcelona, amb la manera d'arribar-hi que realment funciona per a cadascuna.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.montserrat.es,
      title: "Más allá de Montserrat: 10 escapadas desde Barcelona que realmente merecen la pena",
      seoTitle: "10 escapadas desde Barcelona que no son Montserrat",
      seoDescription:
        "Diez escapadas desde Barcelona que no son Montserrat, con el medio de transporte que funciona mejor para cada una.",
      excerpt:
        "Diez jornadas muy distintas a menos de hora y media de Barcelona, con la forma de llegar que realmente funciona en cada caso.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.montserrat.en,
      title: "Beyond Montserrat: 10 Barcelona day trips most visitors overlook",
      seoTitle: "Beyond Montserrat: 10 Barcelona day trips",
      seoDescription:
        "Ten day trips from Barcelona that are not Montserrat, each with the way of getting there that actually works.",
      excerpt:
        "Ten genuinely different days out within ninety minutes of Barcelona, each with the transport that actually works.",
      blocks: en(),
    },
  },
};
