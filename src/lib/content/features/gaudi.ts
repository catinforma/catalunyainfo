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
 * Article 2 — the lesser-known Gaudí.
 *
 * The one fact here that can mislead a reader into a wasted journey is access,
 * so every site is labelled: interior visit, exterior only, or conditional. The
 * Pavellons de la Finca Güell are currently closed for works — verified against
 * Patrimoni Cultural, which states "Actualment el monument està tancat per
 * obres" — and the article says so rather than listing them as a visit.
 */

const PATRIMONI_GAUDI = "https://patrimoni.gencat.cat/ca/coleccio/antoni-gaudi";
const PATRIMONI_PAVELLONS = "https://patrimoni.gencat.cat/ca/coleccio/pavellons-de-la-finca-guell";
const BELLESGUARD = "https://bellesguardgaudi.com/";
const CASA_VICENS = "https://casavicens.org/";
const NAU_GAUDI = "https://visitmataro.cat/ca/nau-gaudi-col-star-leccio-bassat";

const ACCESS_NOTE = {
  ca: "Els horaris i les condicions de visita canvien. Comprova sempre la web oficial de cada espai el mateix dia, especialment fora de temporada alta.",
  es: "Los horarios y las condiciones de visita cambian. Comprueba siempre la web oficial de cada espacio el mismo día, especialmente fuera de temporada alta.",
  en: "Opening hours and visiting conditions change. Always check each site's official website on the day, particularly outside the high season.",
};

function ca(): Block[] {
  return [
    lead(
      "Gaudí és molt més que la Sagrada Família, la Pedrera i el Park Güell. Part de l'interès de seguir la seva obra és veure com va experimentar abans i durant els seus projectes més famosos: naus industrials, cases sorprenentment sòbries, portes monumentals i una cripta on va provar solucions que després apareixerien a la Sagrada Família.",
    ),
    ...paras(
      "Aquestes vuit obres estan repartides entre Barcelona, el Baix Llobregat i el Maresme. Algunes es visiten per dins, altres només des del carrer, i una està tancada per obres ara mateix. Ho indiquem a cada cas, perquè és exactament la informació que evita un viatge inútil.",
    ),
    table(
      "Com es visita cada obra",
      ["Obra", "On", "Accés"],
      [
        ["Torre Bellesguard", "Barcelona", "Visita interior"],
        ["Casa Vicens", "Barcelona (Gràcia)", "Visita interior"],
        ["Palau Güell", "Barcelona (Raval)", "Visita interior"],
        ["Cripta de la Colònia Güell", "Santa Coloma de Cervelló", "Visita interior"],
        ["Nau Gaudí", "Mataró", "Visita interior, com a espai d'art"],
        ["Casa Calvet", "Barcelona (Eixample)", "Exterior; l'interior no és una visita turística ordinària"],
        ["Pavellons de la Finca Güell", "Barcelona (Pedralbes)", "**Tancat per obres**; exterior visible"],
        ["Portal de la Finca Miralles", "Barcelona (Sarrià)", "Exterior, al carrer"],
      ],
      "Verificat a Patrimoni Cultural de la Generalitat i a les webs oficials de cada espai. Confirma-ho abans d'anar-hi.",
    ),
    ...h2(
      "1. Torre Bellesguard",
      "Bellesguard és probablement la gran candidata a «Gaudí desconegut» dins de Barcelona. La casa barreja el llenguatge modernista amb formes d'inspiració gòtica, en un lloc carregat d'història catalana: s'aixeca on hi havia la residència de Martí l'Humà.",
      "A diferència dels grans monuments de l'Eixample, aquí l'experiència és molt més tranquil·la. El recinte ofereix visites i audioguia.",
      `Informació i entrades: [bellesguardgaudi.com](${BELLESGUARD}).`,
    ),
    ...h2(
      "2. Casa Vicens",
      "Ja no és una obra secreta, però continua quedant fora de molts primers itineraris. És la primera casa que Gaudí va construir a Barcelona i permet veure un arquitecte molt anterior a la iconografia orgànica de la Pedrera.",
      "Ceràmica, geometria i influències orientals la converteixen en una visita especialment útil per entendre la seva evolució: qui hi arriba esperant les formes ondulants dels anys posteriors se'n va amb una idea molt més completa.",
      `Informació i entrades: [casavicens.org](${CASA_VICENS}).`,
    ),
    ...h2(
      "3. Palau Güell",
      "A tocar de la Rambla, i tot i així molts visitants hi passen literalment pel costat. El Palau Güell mostra la relació de Gaudí amb Eusebi Güell abans dels projectes que farien famosos tots dos.",
      "Els espais interiors, les cavallerisses i els característics elements escultòrics de la coberta expliquen un Gaudí molt diferent del Park Güell. És, a més, una de les seves obres declarades Patrimoni Mundial.",
    ),
    ...h2(
      "4. Cripta de la Colònia Güell",
      "A Santa Coloma de Cervelló hi ha un dels llocs més importants per entendre l'experimentació estructural de Gaudí. La cripta formava part d'un projecte d'església que no es va completar mai.",
      "Columnes inclinades, maó, pedra i geometries complexes anticipen recursos que Gaudí desenvoluparia després a escala molt més gran. És on va assajar, físicament, allò que la Sagrada Família acabaria fent monumental.",
      "És una de les millors escapades arquitectòniques fora del centre de Barcelona, i es combina bé amb la visita a la colònia industrial que l'envolta.",
    ),
    ...h2(
      "5. Nau Gaudí, Mataró",
      "A Mataró es conserva una de les primeres obres construïdes de l'arquitecte, feta per a la cooperativa Obrera Mataronense quan Gaudí encara era molt jove.",
      "Actualment la Nau Gaudí funciona com a espai museístic de la Col·lecció Bassat, de manera que la visita combina arquitectura primerenca i art contemporani.",
      `És a poca distància de l'estació, cosa que la converteix en una de les parades naturals de ${link("trains", "ca", "les escapades en tren")}. Informació: [visitmataro.cat](${NAU_GAUDI}).`,
    ),
    ...h2(
      "6. Casa Calvet",
      "Casa Calvet és útil precisament perquè no sembla el Gaudí que molta gent espera. Patrimoni Cultural la descriu com la primera de les tres cases que va construir a l'Eixample.",
      "La façana és comparativament sòbria, tot i que conté detalls que anuncien el llenguatge posterior de l'arquitecte. Tracta-la com una parada exterior: no és un museu, i l'edifici té usos privats.",
    ),
    ...h2(
      "7. Pavellons de la Finca Güell",
      "Aquí va començar una de les relacions de mecenatge decisives de la carrera de Gaudí. La gran reixa de ferro en forma de drac és l'element més famós del conjunt, i una de les peces de forja més reconeixibles de tot el modernisme.",
      "**Important: Patrimoni Cultural indica que actualment el monument està tancat per obres.** Es pot contemplar l'exterior i la reixa del drac des del carrer, però no comptis amb una visita interior. Comprova la data de reobertura abans de planificar-hi res.",
      `Estat actual: [patrimoni.gencat.cat](${PATRIMONI_PAVELLONS}).`,
    ),
    ...h2(
      "8. Portal i tanca de la Finca Miralles",
      "Una obra petita que molta gent creua sense identificar. El portal ondulant i la tanca són un recordatori que la creativitat de Gaudí no depenia de la mida de l'encàrrec.",
      "És una parada breu, exterior i gratuïta, útil per completar una ruta menys òbvia per Barcelona.",
    ),
    callout("info", "Abans d'anar-hi", ACCESS_NOTE.ca),
    ...h2(
      "Una ruta per entendre Gaudí millor",
      "Els grans icones mostren el Gaudí consagrat. Aquestes obres permeten entendre el procés.",
      "Mataró ensenya els seus inicis. Casa Vicens, les primeres cerques. Bellesguard i Casa Calvet, dos camins molt diferents dins d'una mateixa dècada. La Colònia Güell, el seu laboratori estructural.",
      `Aquest contrast és precisament el que fa interessant la ruta. I si vols evitar els errors habituals de planificació a Barcelona, ${link("traps", "ca", "aquí n'hi ha deu amb alternativa")}.`,
    ),
    ...relatedBlocks(["traps", "trains", "montserrat", "rainy", "surprising"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "La Sagrada Família, el Park Güell y la Pedrera no cuentan toda la historia de Antoni Gaudí. Para entender su evolución hay que buscar también sus obras industriales, casas más discretas, puertas monumentales y experimentos estructurales.",
    ),
    ...paras(
      "Estas ocho obras están repartidas entre Barcelona, el Baix Llobregat y el Maresme. Algunas se visitan por dentro, otras solo desde la calle, y una está cerrada por obras ahora mismo. Lo indicamos en cada caso, porque es exactamente el dato que evita un viaje inútil.",
    ),
    table(
      "Cómo se visita cada obra",
      ["Obra", "Dónde", "Acceso"],
      [
        ["Torre Bellesguard", "Barcelona", "Visita interior"],
        ["Casa Vicens", "Barcelona (Gràcia)", "Visita interior"],
        ["Palau Güell", "Barcelona (Raval)", "Visita interior"],
        ["Cripta de la Colònia Güell", "Santa Coloma de Cervelló", "Visita interior"],
        ["Nau Gaudí", "Mataró", "Visita interior, como espacio de arte"],
        ["Casa Calvet", "Barcelona (Eixample)", "Exterior; el interior no es una visita turística ordinaria"],
        ["Pavellons de la Finca Güell", "Barcelona (Pedralbes)", "**Cerrado por obras**; exterior visible"],
        ["Portal de la Finca Miralles", "Barcelona (Sarrià)", "Exterior, en la calle"],
      ],
      "Verificado en Patrimoni Cultural de la Generalitat y en las webs oficiales de cada espacio. Confírmalo antes de ir.",
    ),
    ...h2(
      "1. Torre Bellesguard",
      "Una de sus obras más complejas y menos masificadas. Combina modernismo, referencias góticas e historia de Cataluña: se levanta donde estuvo la residencia de Martín el Humano.",
      "A diferencia de los grandes monumentos del Eixample, aquí la experiencia es mucho más tranquila. El recinto ofrece visitas y audioguía.",
      `Información y entradas: [bellesguardgaudi.com](${BELLESGUARD}).`,
    ),
    ...h2(
      "2. Casa Vicens",
      "La primera casa que Gaudí construyó en Barcelona y una de las formas más claras de ver lo distinta que era su obra inicial.",
      "Cerámica, geometría e influencias orientales: quien llega esperando las formas ondulantes de los años posteriores se marcha con una idea mucho más completa del arquitecto.",
      `Información y entradas: [casavicens.org](${CASA_VICENS}).`,
    ),
    ...h2(
      "3. Palau Güell",
      "A pocos pasos de la Rambla y, aun así, ignorado por muchos visitantes que concentran su ruta en el Eixample.",
      "Los espacios interiores, las caballerizas y las chimeneas escultóricas de la azotea muestran un Gaudí muy distinto al del Park Güell. Es además una de sus obras declaradas Patrimonio Mundial.",
    ),
    ...h2(
      "4. Cripta de la Colònia Güell",
      "En Santa Coloma de Cervelló está uno de los grandes laboratorios arquitectónicos de Gaudí. La cripta formaba parte de un proyecto de iglesia que nunca se completó.",
      "Columnas inclinadas, ladrillo, piedra y geometrías complejas anticipan recursos que después desarrollaría a mucha mayor escala. Es donde ensayó físicamente lo que la Sagrada Família acabaría haciendo monumental.",
      "Se combina bien con la visita a la colonia industrial que la rodea.",
    ),
    ...h2(
      "5. Nau Gaudí, Mataró",
      "Una de las primeras construcciones conservadas del arquitecto, hecha para la cooperativa Obrera Mataronense cuando Gaudí era muy joven.",
      "Hoy funciona como espacio museístico de la Col·lecció Bassat, de modo que la visita combina arquitectura temprana y arte contemporáneo.",
      `Está a poca distancia de la estación, lo que la convierte en una parada natural de ${link("trains", "es", "las escapadas en tren")}. Información: [visitmataro.cat](${NAU_GAUDI}).`,
    ),
    ...h2(
      "6. Casa Calvet",
      "El Gaudí más sobrio. Patrimoni Cultural la describe como la primera de las tres casas que construyó en el Eixample.",
      "Su fachada es comparativamente contenida, pero contiene detalles que anuncian su lenguaje posterior. Trátala como una parada exterior: no es un museo y el edificio tiene usos privados.",
    ),
    ...h2(
      "7. Pavellons de la Finca Güell",
      "Aquí empezó una de las relaciones de mecenazgo decisivas de su carrera. La gran reja de hierro en forma de dragón es el elemento más famoso del conjunto.",
      "**Importante: Patrimoni Cultural indica que actualmente el monumento está cerrado por obras.** Puede contemplarse el exterior y la reja desde la calle, pero no cuentes con una visita interior.",
      `Estado actual: [patrimoni.gencat.cat](${PATRIMONI_PAVELLONS}).`,
    ),
    ...h2(
      "8. Portal de la Finca Miralles",
      "Una pieza pequeña, pública y fácil de pasar por alto. El portal ondulante y la valla recuerdan que la creatividad de Gaudí no dependía del tamaño del encargo.",
      "Parada breve, exterior y gratuita.",
    ),
    callout("info", "Antes de ir", ACCESS_NOTE.es),
    ...h2(
      "Por qué merece la pena salir de la ruta habitual",
      "Ver únicamente las grandes obras produce una imagen incompleta de Gaudí.",
      "Mataró enseña sus inicios. Casa Vicens, sus primeras búsquedas. Bellesguard y Casa Calvet, dos caminos muy distintos. La Colònia Güell, su laboratorio estructural.",
      `Si además quieres evitar los errores de planificación más habituales en Barcelona, ${link("traps", "es", "aquí hay diez con su alternativa")}.`,
    ),
    ...relatedBlocks(["traps", "trains", "montserrat", "rainy", "surprising"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "Gaudí's story is much larger than the Sagrada Família, Park Güell and Casa Batlló. Some of the best places to understand how he developed are quieter houses, an industrial building in Mataró, a crypt outside Barcelona and small commissions most first-time visitors walk straight past.",
    ),
    ...paras(
      "These eight works are spread across Barcelona, the Baix Llobregat and the Maresme coast. Some can be visited inside, some only from the street, and one is closed for restoration right now. Each entry says which — that is the detail that prevents a wasted journey.",
    ),
    table(
      "How you can visit each site",
      ["Site", "Where", "Access"],
      [
        ["Torre Bellesguard", "Barcelona", "Interior visit"],
        ["Casa Vicens", "Barcelona (Gràcia)", "Interior visit"],
        ["Palau Güell", "Barcelona (Raval)", "Interior visit"],
        ["Colònia Güell Crypt", "Santa Coloma de Cervelló", "Interior visit"],
        ["Nau Gaudí", "Mataró", "Interior, as an art space"],
        ["Casa Calvet", "Barcelona (Eixample)", "Exterior; the interior is not an ordinary tourist visit"],
        ["Pavellons de la Finca Güell", "Barcelona (Pedralbes)", "**Closed for works**; exterior visible"],
        ["Finca Miralles gate", "Barcelona (Sarrià)", "Exterior, on the street"],
      ],
      "Checked against Catalonia's heritage service and each site's official website. Confirm before travelling.",
    ),
    ...h2(
      "1. Torre Bellesguard",
      "A remarkably complex house mixing Gaudí's modernist language with Gothic references and Catalan history — it stands where the residence of King Martin the Humane once was.",
      "Unlike the great Eixample monuments, the experience here is calm. The site runs visits with an audio guide.",
      `Details and tickets: [bellesguardgaudi.com](${BELLESGUARD}).`,
    ),
    ...h2(
      "2. Casa Vicens",
      "Gaudí's first house in Barcelona, and one of the clearest ways to see how different his early work looked.",
      "Ceramic tile, strict geometry and Orientalist influence. Anyone who arrives expecting the flowing forms of his later years leaves with a far more complete picture.",
      `Details and tickets: [casavicens.org](${CASA_VICENS}).`,
    ),
    ...h2(
      "3. Palau Güell",
      "A few steps off La Rambla and still surprisingly easy to overlook.",
      "The interiors, the stables and the sculpted rooftop chimneys show a very different architect from the one at Park Güell. It is also one of his UNESCO World Heritage buildings.",
    ),
    ...h2(
      "4. Colònia Güell Crypt",
      "In Santa Coloma de Cervelló, outside Barcelona, stands one of Gaudí's most important structural laboratories. The crypt was part of a church that was never finished.",
      "Leaning columns, brick, stone and complex geometry anticipate techniques he would later use at much greater scale. This is where he physically tested what the Sagrada Família would eventually make monumental.",
      "It pairs well with the surrounding industrial workers' colony.",
    ),
    ...h2(
      "5. Nau Gaudí, Mataró",
      "One of his earliest surviving works, built for the Obrera Mataronense cooperative when Gaudí was still very young.",
      "It now operates as an art space housing the Bassat Collection, so the visit combines early architecture with contemporary art.",
      `It is a short walk from the station, which makes it a natural stop on ${link("trains", "en", "a car-free day trip")}. Details: [visitmataro.cat](${NAU_GAUDI}).`,
    ),
    ...h2(
      "6. Casa Calvet",
      "A much more restrained Gaudí façade in the Eixample, useful precisely because it challenges expectations. Catalonia's heritage service describes it as the first of the three houses he built there.",
      "Treat it as an exterior stop: it is not a museum and the building is in private use.",
    ),
    ...h2(
      "7. Pavellons de la Finca Güell",
      "This is where one of the defining patronage relationships of Gaudí's career began. The wrought-iron dragon gate is among the most recognisable pieces of ironwork in all of Modernisme.",
      "**Important: Catalonia's heritage service states that the monument is currently closed for restoration works.** The exterior and the dragon gate remain visible from the street, but do not plan on going inside.",
      `Current status: [patrimoni.gencat.cat](${PATRIMONI_PAVELLONS}).`,
    ),
    ...h2(
      "8. Finca Miralles gate",
      "A small, playful piece of Gaudí architecture that needs only a short stop — and a reminder that his invention did not depend on the size of the commission.",
      "Free, on the street, no ticket.",
    ),
    callout("info", "Before you go", ACCESS_NOTE.en),
    ...h2(
      "Why these sites matter",
      "The famous buildings show Gaudí at his most celebrated. These smaller works show how he got there.",
      `Mataró shows the beginning. Casa Vicens shows the first experiments. Bellesguard and Casa Calvet show two very different directions. The Colònia Güell shows the engineering. If you are also planning the rest of a Barcelona trip, ${link("traps", "en", "here are ten common mistakes and what to do instead")}.`,
    ),
    ...relatedBlocks(["traps", "trains", "montserrat", "rainy", "surprising"], "en"),
  ];
}

export const GAUDI: FeatureArticle = {
  key: "gaudi",
  entryKey: "feature-gaudi-lesser-known",
  categoryKey: "culture",
  heroKey: "gaudi-hero",
  secondaryKey: "gaudi-second",
  heroAlt: {
    ca: "Cripta de la Colonia Guell, a Santa Coloma de Cervello",
    es: "Cripta de la Colonia Guell, en Santa Coloma de Cervello",
    en: "The Colonia Guell crypt at Santa Coloma de Cervello",
  },
  heroCaption: {
    ca: "La cripta de la Colonia Guell, on Gaudi va assajar solucions estructurals que despres va fer servir a la Sagrada Familia.",
    es: "La cripta de la Colonia Guell, donde Gaudi ensayo soluciones estructurales que despues uso en la Sagrada Familia.",
    en: "The Colonia Guell crypt, where Gaudi tested structural ideas he later used at the Sagrada Familia.",
  },
  secondaryAlt: {
    ca: "Casa Vicens, al barri de Gracia de Barcelona",
    es: "Casa Vicens, en el barrio de Gracia de Barcelona",
    en: "Casa Vicens in Barcelona's Gracia district",
  },
  secondaryCaption: {
    ca: "Casa Vicens, la primera casa que Gaudi va construir a Barcelona.",
    es: "Casa Vicens, la primera casa que Gaudi construyo en Barcelona.",
    en: "Casa Vicens, the first house Gaudi built in Barcelona.",
  },
  sources: [
    { name: "Antoni Gaudí — Patrimoni Cultural", url: PATRIMONI_GAUDI, publisher: "Generalitat de Catalunya" },
    { name: "Pavellons de la Finca Güell — Patrimoni Cultural", url: PATRIMONI_PAVELLONS, publisher: "Generalitat de Catalunya" },
    { name: "Torre Bellesguard", url: BELLESGUARD, publisher: "Torre Bellesguard" },
    { name: "Casa Vicens", url: CASA_VICENS, publisher: "Casa Vicens" },
    { name: "Nau Gaudí — Col·lecció Bassat", url: NAU_GAUDI, publisher: "Ajuntament de Mataró" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.gaudi.ca,
      title: "La Catalunya de Gaudí que gairebé ningú visita: 8 obres més enllà dels grans icones",
      seoTitle: "8 obres de Gaudí menys conegudes que val la pena visitar",
      seoDescription:
        "Vuit obres de Gaudí fora del circuit habitual, amb l'estat de visita de cadascuna: interior, exterior o tancada per obres.",
      excerpt:
        "Vuit obres de Gaudí fora del circuit habitual, amb l'estat real de visita de cadascuna: quines es veuen per dins, quines només des del carrer i quina està tancada.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.gaudi.es,
      title: "La Cataluña de Gaudí que casi nadie visita: 8 obras más allá de los grandes iconos",
      seoTitle: "8 obras menos conocidas de Gaudí que merece la pena visitar",
      seoDescription:
        "Ocho obras de Gaudí fuera del circuito habitual, con el estado de visita de cada una: interior, exterior o cerrada por obras.",
      excerpt:
        "Ocho obras de Gaudí fuera del circuito habitual, con el estado real de visita de cada una: cuáles se ven por dentro, cuáles solo desde la calle y cuál está cerrada.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.gaudi.en,
      title: "8 Gaudí sites most Barcelona visitors never see",
      seoTitle: "8 lesser-known Gaudí sites worth visiting",
      seoDescription:
        "Eight Gaudí works beyond the famous ones, each with its real visiting status: interior visit, exterior only, or closed for restoration.",
      excerpt:
        "Eight Gaudí works beyond the famous ones, each labelled with how you can actually visit it — inside, from the street, or not at all right now.",
      blocks: en(),
    },
  },
};
