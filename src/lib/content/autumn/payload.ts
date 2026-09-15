import type { Locale } from "@/lib/i18n/config";

/**
 * Autumn colour guide for Catalonia.
 *
 * The editorial premise is timing, not a list of pretty woods: colour starts in
 * the high Pyrenees in the second half of September and works downhill for
 * weeks, so choosing the date matters as much as choosing the forest.
 *
 * Two rules run through the text:
 *
 *  1. **Windows, never peak dates.** Where a park or tourist board publishes a
 *     period, it is quoted and attributed. Where none exists - La Fageda d'en
 *     Jordà, Montseny - the guide says so and offers editorial orientation
 *     instead of inventing a forecast.
 *  2. **Nothing is at its peak today.** Published 15 September 2026, when it is
 *     still early almost everywhere.
 */

export interface Zone {
  id: string;
  /** Area name, per language. */
  name: Record<Locale, string>;
  /** Timing window as published, or editorial orientation. */
  window: Record<Locale, string>;
  /** What stands out there. */
  highlight: Record<Locale, string>;
  /** Whether a park or tourist board publishes this window. */
  official: boolean;
  heading: Record<Locale, string>;
  /** Line printed under the heading when a window is officially published. */
  windowNote?: Record<Locale, string>;
  body: Record<Locale, string[]>;
  /** Image key placed after this section, when one exists. */
  imageKey?: string;
}

export const ZONES: Zone[] = [
  {
    id: "alta-muntanya",
    name: {
      ca: "Alta muntanya del Pirineu",
      es: "Alta montaña del Pirineo",
      en: "High Pyrenees",
    },
    window: {
      ca: "2a meitat de setembre – octubre",
      es: "2.ª mitad de septiembre – octubre",
      en: "Second half of September – October",
    },
    highlight: {
      ca: "Primers canvis de color",
      es: "Primeros cambios de color",
      en: "The first colour of the season",
    },
    official: true,
    heading: { ca: "", es: "", en: "" },
    body: { ca: [], es: [], en: [] },
  },
  {
    id: "viros",
    name: { ca: "Bosc de Virós", es: "Bosc de Virós", en: "Bosc de Virós" },
    window: {
      ca: "1a quinzena d'octubre",
      es: "1.ª quincena de octubre",
      en: "First half of October",
    },
    highlight: {
      ca: "Fageda, bedolls, trèmols",
      es: "Hayedo, abedules, álamos temblones",
      en: "Beech, birch and aspen",
    },
    official: true,
    heading: {
      ca: "1. Bosc de Virós: un dels primers grans objectius",
      es: "1. Bosc de Virós",
      en: "1. Bosc de Virós",
    },
    windowNote: {
      ca: "Finestra oficial: primera quinzena d'octubre per a la fageda",
      es: "Ventana oficial: primera mitad de octubre para el hayedo",
      en: "Official timing: first half of October for the beech forest",
    },
    body: {
      ca: [
        "Al Parc Natural de l'Alt Pirineu, el Bosc de Virós és un dels indrets amb un calendari més ben definit. És l'única fageda del Pallars Sobirà i a la tardor combina els tons ataronjats dels faigs amb els grocs i vermells d'altres caducifolis i els verds dels pins i avets.",
        "El Parc situa el millor moment de la fageda a la **primera quinzena d'octubre**. A les parts més baixes del bosc, especialment al Camí Ral, el color acostuma a arribar més tard, durant la segona quinzena.",
        "Això converteix Virós en una de les millors opcions si vols començar la temporada de colors relativament aviat.",
      ],
      es: [
        "El Bosc de Virós contiene el único hayedo del Pallars Sobirà. Durante el otoño, los tonos naranjas de las hayas contrastan con los amarillos y rojizos de otros caducifolios y con los verdes de pinos y abetos.",
        "El propio parque sitúa la mejor época del hayedo en la **primera quincena de octubre**. En las partes inferiores del bosque, el cambio suele llegar algo más tarde.",
      ],
      en: [
        "Bosc de Virós contains the only beech forest in Pallars Sobirà. In autumn, the darker orange of the beeches contrasts with yellows and reds from other deciduous trees and the deep greens of pine and fir.",
        "The natural park specifically identifies the **first half of October** as the best period for its beech forest. Lower sections generally change later.",
      ],
    },
  },
  {
    id: "cardos",
    name: {
      ca: "Esterri de Cardós",
      es: "Esterri de Cardós",
      en: "Esterri de Cardós",
    },
    window: {
      ca: "2a quinzena d'octubre",
      es: "2.ª quincena de octubre",
      en: "Second half of October",
    },
    highlight: {
      ca: "Bedolls, freixes, cirerers",
      es: "Abedules, fresnos, cerezos",
      en: "Birch, ash and cherry",
    },
    official: true,
    heading: {
      ca: "2. Esterri de Cardós i la Mata d'Arrós",
      es: "2. Esterri de Cardós y la Mata d'Arrós",
      en: "2. Esterri de Cardós and Mata d'Arrós",
    },
    windowNote: {
      ca: "Finestra oficial: segona quinzena d'octubre",
      es: "Ventana oficial: segunda mitad de octubre",
      en: "Official timing: second half of October",
    },
    body: {
      ca: [
        "La Vall de Cardós ofereix un paisatge molt diferent. Aquí destaquen especialment els bedolls, els pollancres, els trèmols, els cirerers, els freixes i els roures.",
        "La Mata d'Arrós, un dels bedollars més extensos del Parc Natural de l'Alt Pirineu, pot convertir-se en una gran massa groga que contrasta amb els prats i les muntanyes. El parc situa la millor època general durant la **segona quinzena d'octubre**.",
        "L'Itinerari de la Molina i el Mirador del Cap de la Roca són dues de les propostes oficials per observar aquest paisatge.",
      ],
      es: [
        "Abedules, chopos, álamos temblones, cerezos, fresnos y robles convierten el valle en uno de los paisajes cromáticamente más variados del Alt Pirineu.",
        "La Mata d'Arrós destaca por uno de los abedulares más extensos del parque. La referencia oficial sitúa su mejor época durante la **segunda quincena de octubre**.",
      ],
      en: [
        "This valley offers a particularly varied mix of birch, poplar, aspen, cherry, ash and oak.",
        "Mata d'Arrós contains one of the largest birch woods in the park. Official guidance places the main colour period in the **second half of October**.",
      ],
    },
  },
  {
    id: "bonabe",
    name: { ca: "Vall de Bonabé", es: "Vall de Bonabé", en: "Bonabé Valley" },
    window: { ca: "Octubre", es: "Octubre", en: "October" },
    highlight: {
      ca: "Paisatge pirinenc i caducifolis",
      es: "Paisaje pirenaico y caducifolios",
      en: "Pyrenean scenery and deciduous woodland",
    },
    official: true,
    heading: { ca: "3. Vall de Bonabé", es: "3. Vall de Bonabé", en: "3. Bonabé Valley" },
    body: {
      ca: [
        "La Vall de Bonabé, a les Valls d'Àneu, és una altra de les grans opcions del Parc Natural de l'Alt Pirineu. La zona entre el refugi del Fornet i les bordes de Perosa combina paisatge d'alta muntanya, boscos i una gran varietat cromàtica.",
        "No fixem una data exacta de màxim perquè el parc no en dona una d'única per a aquesta vall. La millor estratègia és seguir l'evolució de l'octubre i aprofitar el període en què el canvi ja ha baixat de les cotes més altes.",
      ],
      es: [
        "La Vall de Bonabé, en las Valls d'Àneu, es otra de las recomendaciones oficiales del Parc Natural de l'Alt Pirineu para disfrutar de los colores de otoño. El sector entre el refugi del Fornet y las bordas de Perosa permite combinar bosque y paisaje pirenaico.",
        "No existe una fecha oficial única de máximo color, por lo que conviene seguir la evolución durante octubre.",
      ],
      en: [
        "Bonabé Valley in the Valls d'Àneu is another area recommended by the Alt Pirineu Natural Park for autumn colour. The landscape between Fornet refuge and the Bordes de Perosa combines Pyrenean scenery and deciduous woodland.",
        "There is no official single peak date, so October conditions should be followed rather than planning around one fixed weekend.",
      ],
    },
  },
  {
    id: "aiguestortes",
    name: { ca: "Aigüestortes", es: "Aigüestortes", en: "Aigüestortes" },
    window: {
      ca: "Mitjan octubre",
      es: "Mediados de octubre",
      en: "Mid-October",
    },
    highlight: {
      ca: "Boscos de muntanya i alta muntanya",
      es: "Bosques de montaña y alta montaña",
      en: "Mountain woodland and high peaks",
    },
    official: true,
    heading: {
      ca: "4. Aigüestortes i Estany de Sant Maurici",
      es: "4. Aigüestortes i Estany de Sant Maurici",
      en: "4. Aigüestortes i Estany de Sant Maurici",
    },
    body: {
      ca: [
        "Aigüestortes és un dels grans escenaris de tardor de Catalunya. El mateix Parc Nacional ha programat per al **17 d'octubre de 2026** una activitat anomenada «Tardor de colors», dedicada precisament al moment en què el paisatge es transforma abans de l'arribada dels primers freds.",
        "Això no significa que el 17 d'octubre sigui el «dia màxim» de tot el Parc. Aigüestortes té enormes diferències d'altitud, orientació i vegetació. Però mitjan octubre és una referència especialment interessant per començar a seguir de prop els seus boscos.",
      ],
      es: [
        "El Parc Nacional d'Aigüestortes i Estany de Sant Maurici organiza el **17 de octubre de 2026** una actividad llamada precisamente «Tardor de colors».",
        "Es una referencia útil para entender cuándo empieza a resultar especialmente interesante seguir el paisaje otoñal del parque. No significa que todo Aigüestortes alcance su máximo exactamente ese día: la enorme variedad de altitudes y orientaciones provoca diferencias importantes dentro del mismo espacio natural.",
      ],
      en: [
        "Catalonia's only national park is an obvious autumn destination. The park itself is holding an official **«Tardor de colors» — Autumn Colours — activity on 17 October 2026**.",
        "That makes mid-October a useful reference point. It should not be read as an exact peak date for the entire national park, which covers large variations in elevation and aspect.",
      ],
    },
    imageKey: "colors-tardor-catalunya-vall-pirinenca",
  },
  {
    id: "sant-joan",
    name: { ca: "Vall de Sant Joan", es: "Vall de Sant Joan", en: "Sant Joan Valley" },
    window: {
      ca: "2a quinzena d'octubre – 1a de novembre",
      es: "2.ª quincena de octubre – 1.ª de noviembre",
      en: "Second half of October – first half of November",
    },
    highlight: {
      ca: "Mosaic de caducifolis",
      es: "Mosaico de caducifolios",
      en: "A mosaic of deciduous trees",
    },
    official: true,
    heading: {
      ca: "5. Vall de Sant Joan: una tardor que arriba més tard",
      es: "5. Vall de Sant Joan",
      en: "5. Sant Joan Valley",
    },
    windowNote: {
      ca: "Finestra oficial: segona quinzena d'octubre i primera quinzena de novembre",
      es: "Ventana oficial: segunda mitad de octubre y primera mitad de noviembre",
      en: "Official timing: second half of October to first half of November",
    },
    body: {
      ca: [
        "Al sector de l'Alt Urgell del Parc Natural de l'Alt Pirineu, la Vall de Sant Joan es transforma amb cirerers, pollancres, trèmols, bedolls i roures. El parc situa el millor període entre la **segona quinzena d'octubre i la primera quinzena de novembre**.",
        "Pobles com Ars, Civís, Sant Joan Fumat i Asnurri queden envoltats d'aquest mosaic de colors. És una opció especialment interessant per a qui no pot escapar-se durant les primeres setmanes d'octubre.",
      ],
      es: [
        "Este valle del Alt Urgell combina cerezos, chopos, álamos temblones, abedules y robles alrededor de pequeños núcleos como Ars, Civís, Sant Joan Fumat y Asnurri.",
        "El parque sitúa su periodo más interesante entre la **segunda quincena de octubre y la primera de noviembre**.",
      ],
      en: [
        "In this part of the Alt Urgell, cherry trees, poplars, aspens, birches and oaks surround small mountain villages including Ars, Civís, Sant Joan Fumat and Asnurri.",
        "The natural park places its best autumn period between the **second half of October and the first half of November**.",
      ],
    },
  },
  {
    id: "aran",
    name: {
      ca: "Val d'Aran / Salenques",
      es: "Val d'Aran / Salenques",
      en: "Val d'Aran / Salenques",
    },
    window: {
      ca: "Finals d'octubre – principis de novembre",
      es: "Finales de octubre – principios de noviembre",
      en: "Late October – early November",
    },
    highlight: {
      ca: "Faigs, avets i muntanya",
      es: "Hayas, abetos y montaña",
      en: "Beech, fir and mountain scenery",
    },
    official: true,
    heading: {
      ca: "6. Val d'Aran: un dels grans finals de temporada",
      es: "6. Val d'Aran",
      en: "6. Val d'Aran",
    },
    body: {
      ca: [
        "La Val d'Aran té alguns dels boscos caducifolis més espectaculars dels Pirineus catalans. Torisme Val d'Aran descriu la tardor amb tons vermellosos, granes, ocres i daurats als seus faigs, roures i altres caducifolis. Entre els boscos interessants hi ha Conangles i diversos sectors de les valls araneses.",
        "**Vall de Salenques.** Torisme Val d'Aran situa explícitament **finals d'octubre i principis de novembre** com el millor moment per apreciar l'explosió de grocs intensos, vermells i marrons càlids.",
        "La ruta segueix el riu entre faigs i avets centenaris i permet entendre perfectament per què la tardor aranesa pot continuar sent espectacular quan altres sectors més alts ja han perdut bona part de la fulla.",
      ],
      es: [
        "La Val d'Aran es uno de los grandes destinos otoñales del Pirineo catalán. Sus bosques combinan hayas, robles y otras especies caducifolias con abetos y paisaje de alta montaña.",
        "**Salenques.** Aquí sí existe una referencia especialmente precisa: Torisme Val d'Aran señala **finales de octubre y principios de noviembre** como el mejor momento para apreciar la explosión de colores amarillos, rojos y marrones cálidos en el valle de Salenques.",
      ],
      en: [
        "Val d'Aran is one of the strongest autumn destinations in the Catalan Pyrenees. Beeches, oaks and other deciduous trees combine with fir forests and mountain scenery.",
        "**Salenques Valley.** This is one of the places with particularly clear official timing: the Val d'Aran tourism board identifies **late October and early November** as the best period to see Salenques' intense yellows, reds and warm browns.",
        "Its trail follows the river through centuries-old beech and fir forest.",
      ],
    },
    imageKey: "colors-tardor-catalunya-cami-bosc-humit",
  },
  {
    id: "fageda",
    name: { ca: "Fageda d'en Jordà", es: "Fageda d'en Jordà", en: "La Fageda d'en Jordà" },
    window: {
      ca: "Finals d'octubre – novembre (orientatiu)",
      es: "Finales de octubre – noviembre (orientativo)",
      en: "Late October – November (guidance, not official)",
    },
    highlight: {
      ca: "Faigs daurats i rogencs",
      es: "Hayas doradas y rojizas",
      en: "Beech in gold and red",
    },
    official: false,
    heading: {
      ca: "7. La Fageda d'en Jordà",
      es: "7. Fageda d'en Jordà",
      en: "7. La Fageda d'en Jordà",
    },
    body: {
      ca: [
        "Pocs boscos estan tan associats a la tardor catalana com la Fageda d'en Jordà. El Parc Natural de la Zona Volcànica de la Garrotxa destaca precisament la tardor per la gamma de colors **rogencs i daurats** que adopten les fulles abans de caure.",
        "La fageda creix sobre la colada de lava del Croscat i el relleu ondulat dels tossols li dona un paisatge molt particular.",
        "Aquí no publicarem una data exacta de màxim color per al 2026 perquè no existeix una predicció oficial prou precisa. Com a orientació editorial, **finals d'octubre i novembre** són el període que més sentit té vigilar.",
        "A més, la Fageda concentra molts visitants durant els caps de setmana de tardor, de manera que és especialment recomanable evitar les hores centrals si es busca una visita tranquil·la.",
      ],
      es: [
        "El Parc Natural de la Zona Volcànica de la Garrotxa destaca el otoño como una de las estaciones más atractivas para visitar la Fageda d'en Jordà debido a sus tonos rojizos y dorados. El hayedo crece directamente sobre la antigua colada de lava del Croscat.",
        "No existe una predicción oficial que permita fijar ahora el día exacto de máximo color en 2026. Como referencia orientativa, conviene empezar a vigilar especialmente **finales de octubre y noviembre**.",
        "Los fines de semana de otoño son además uno de los periodos con mayor concentración de visitantes de la zona.",
      ],
      en: [
        "La Fageda d'en Jordà is probably Catalonia's most famous autumn woodland. The official natural park describes autumn as particularly attractive because the beech leaves turn through red and gold before falling.",
        "The forest grows on the Croscat volcano's old lava flow, creating its distinctive rolling terrain.",
        "There is no reliable official prediction for the exact 2026 peak. As a planning guide, **late October into November** is the period worth watching most closely. Autumn weekends can also be particularly busy here.",
      ],
    },
    imageKey: "colors-tardor-catalunya-fageda-daurada",
  },
  {
    id: "montseny",
    name: { ca: "Montseny", es: "Montseny", en: "Montseny" },
    window: {
      ca: "Finals d'octubre – novembre (orientatiu)",
      es: "Finales de octubre – noviembre (orientativo)",
      en: "Late October – November (guidance, not official)",
    },
    highlight: {
      ca: "Fagedes, castanyers i rouredes",
      es: "Hayedos, castaños y robledales",
      en: "Beech, chestnut and oak",
    },
    official: false,
    heading: {
      ca: "8. Montseny: fagedes, castanyers i tardor prop de Barcelona",
      es: "8. Montseny",
      en: "8. Montseny",
    },
    body: {
      ca: [
        "El Montseny és una de les grans opcions per veure la tardor sense arribar fins al Pirineu. La diversitat d'altituds permet trobar fagedes, castanyers, rouredes i boscos mixtos amb evolucions diferents.",
        "La programació del Parc Natural del Montseny per al 2026 ja inclou activitats de tardor, com «La fageda de Collformic» l'11 d'octubre i propostes vinculades als castanyers durant el mes. Això confirma l'interès tardorenc del massís, però no equival a una previsió exacta del moment de màxim color.",
        "Com a orientació, **finals d'octubre i novembre** solen ser el període més interessant per vigilar les fagedes i castanyedes de cota inferior.",
      ],
      es: [
        "El Montseny permite encontrar hayas, castaños, robles y bosques mixtos relativamente cerca de Barcelona. Su programa de actividades de 2026 incluye propuestas específicamente relacionadas con las hayas y el otoño durante octubre.",
        "Las diferencias de altitud hacen que el color avance de forma desigual por el macizo. Como orientación general, finales de octubre y noviembre son fechas especialmente interesantes para seguir las zonas de menor altitud.",
      ],
      en: [
        "Montseny is one of the easiest major autumn areas to reach from Barcelona. Its altitude range supports beech, chestnut, oak and mixed woodland that changes at different times.",
        "The natural park's 2026 programme includes October walks specifically focused on beech woods and autumn. For lower forest areas, late October and November are generally the period to monitor most closely rather than September.",
      ],
    },
    imageKey: "colors-tardor-catalunya-carretera-bosc",
  },
];

/** Images, with alt and caption per language. */
export const IMAGES = [
  {
    key: "colors-tardor-catalunya-panoramica-valle-boira",
    isHero: true,
    alt: {
      ca: "Boscos de Catalunya amb colors de tardor i boira entre les muntanyes",
      es: "Bosques de Cataluña con colores de otoño y niebla entre las montañas",
      en: "Autumn forests in Catalonia with morning mist across the mountains",
    },
    caption: {
      ca: "Imatge representativa d'un paisatge de muntanya en plena tardor. Il·lustració generada amb intel·ligència artificial.",
      es: "Imagen representativa de un paisaje de montaña en pleno otoño. Ilustración generada con inteligencia artificial.",
      en: "Representative image of a mountain landscape in autumn. Illustration generated with artificial intelligence.",
    },
  },
  {
    key: "colors-tardor-catalunya-vall-pirinenca",
    alt: {
      ca: "Vall del Pirineu amb els boscos tenyits de groc i taronja a la tardor",
      es: "Valle del Pirineo con bosques amarillos y naranjas en otoño",
      en: "Pyrenean valley covered in yellow and orange autumn forest",
    },
    caption: {
      ca: "Imatge representativa d'una vall pirinenca a la tardor. Il·lustració generada amb intel·ligència artificial.",
      es: "Imagen representativa de un valle pirenaico en otoño. Ilustración generada con inteligencia artificial.",
      en: "Representative image of a Pyrenean valley in autumn. Illustration generated with artificial intelligence.",
    },
  },
  {
    key: "colors-tardor-catalunya-fageda-daurada",
    alt: {
      ca: "Fageda amb les fulles daurades durant el canvi de color de tardor",
      es: "Hayedo con las hojas doradas durante el cambio de color otoñal",
      en: "Beech forest with golden leaves during the autumn colour change",
    },
    caption: {
      ca: "Imatge representativa d'una fageda en ple canvi de color tardorenc. Il·lustració generada amb intel·ligència artificial.",
      es: "Imagen representativa de un hayedo en pleno cambio de color otoñal. Ilustración generada con inteligencia artificial.",
      en: "Representative image of a beech forest during peak autumn colour. Illustration generated with artificial intelligence.",
    },
  },
  {
    key: "colors-tardor-catalunya-cami-bosc-humit",
    alt: {
      ca: "Sender entre faigs i fulles de tardor en un bosc de muntanya",
      es: "Sendero entre hayas y hojas de otoño en un bosque de montaña",
      en: "Trail through beech trees and autumn leaves in a mountain forest",
    },
    caption: {
      ca: "Imatge representativa d'un sender de muntanya a la tardor. Il·lustració generada amb intel·ligència artificial.",
      es: "Imagen representativa de un sendero de montaña en otoño. Ilustración generada con inteligencia artificial.",
      en: "Representative image of a mountain trail in autumn. Illustration generated with artificial intelligence.",
    },
  },
  {
    key: "colors-tardor-catalunya-carretera-bosc",
    alt: {
      ca: "Carretera de muntanya envoltada de boscos amb colors de tardor",
      es: "Carretera de montaña rodeada de bosques con colores de otoño",
      en: "Mountain road surrounded by autumn-coloured woodland",
    },
    caption: {
      ca: "Imatge representativa d'una carretera de muntanya a la tardor. Il·lustració generada amb intel·ligència artificial.",
      es: "Imagen representativa de una carretera de montaña en otoño. Ilustración generada con inteligencia artificial.",
      en: "Representative image of a mountain road in autumn. Illustration generated with artificial intelligence.",
    },
  },
];

export const SOURCES = [
  {
    name: {
      ca: "Colors de tardor — Parc Natural de l'Alt Pirineu",
      es: "Colores de otoño — Parc Natural de l'Alt Pirineu",
      en: "Autumn colours — Alt Pirineu Natural Park",
    },
    url: "https://parcsnaturals.gencat.cat/es/xarxa-de-parcs/alt-pirineu/gaudeix-del-parc/guia-de-visita/activitats-natura/colors-tardor/",
    publisher: "Generalitat de Catalunya",
  },
  {
    name: {
      ca: "Boscos singulars i flora — Alt Pirineu",
      es: "Bosques singulares y flora — Alt Pirineu",
      en: "Notable forests and flora — Alt Pirineu",
    },
    url: "https://parcsnaturals.gencat.cat/en/xarxa-de-parcs/alt-pirineu/gaudeix-del-parc/guia-de-visita/activitats-natura/boscos-singulars-i-flora/",
    publisher: "Generalitat de Catalunya",
  },
  {
    name: {
      ca: "Tardor de colors, 17 d'octubre de 2026 — Aigüestortes",
      es: "Tardor de colors, 17 de octubre de 2026 — Aigüestortes",
      en: "Tardor de colors, 17 October 2026 — Aigüestortes",
    },
    url: "https://parcsnaturals.gencat.cat/ca/detalls/Activitat_Agenda/20261017_tardor_de_colors",
    publisher: "Parcs Naturals de Catalunya",
  },
  {
    name: {
      ca: "Parc Nacional d'Aigüestortes i Estany de Sant Maurici",
      es: "Parc Nacional d'Aigüestortes i Estany de Sant Maurici",
      en: "Aigüestortes i Estany de Sant Maurici National Park",
    },
    url: "https://parcsnaturals.gencat.cat/ca/xarxa-de-parcs/aiguestortes/inici/",
    publisher: "Generalitat de Catalunya",
  },
  {
    name: {
      ca: "Vall de Salenques — Torisme Val d'Aran",
      es: "Valle de Salenques — Torisme Val d'Aran",
      en: "Salenques Valley — Val d'Aran tourism board",
    },
    url: "https://www.visitvaldaran.com/ca/item/trekking-magico-valle-salenques/",
    publisher: "Torisme Val d'Aran",
  },
  {
    name: {
      ca: "L'encant de la tardor a la Val d'Aran",
      es: "El encanto del otoño en la Val d'Aran",
      en: "Autumn in Val d'Aran",
    },
    url: "https://www.visitvaldaran.com/ca/lencant-de-la-tardor-a-la-val-daran/",
    publisher: "Torisme Val d'Aran",
  },
  {
    name: {
      ca: "Itinerari de la Fageda d'en Jordà — Zona Volcànica de la Garrotxa",
      es: "Itinerario de la Fageda d'en Jordà — Zona Volcànica de la Garrotxa",
      en: "Fageda d'en Jordà trail — Garrotxa Volcanic Zone",
    },
    url: "https://parcsnaturals.gencat.cat/ca/xarxa-de-parcs/garrotxa/gaudeix-del-parc/equipaments-i-itineraris/itineraris/num2/",
    publisher: "Generalitat de Catalunya",
  },
  {
    name: {
      ca: "Parcs Naturals — Diputació de Barcelona (Montseny)",
      es: "Parcs Naturals — Diputació de Barcelona (Montseny)",
      en: "Natural parks — Barcelona Provincial Council (Montseny)",
    },
    url: "https://parcs.diba.cat/",
    publisher: "Diputació de Barcelona",
  },
  {
    name: {
      ca: "Butlletí climàtic estacional — estiu 2026",
      es: "Boletín climático estacional — verano 2026",
      en: "Seasonal climate bulletin — summer 2026",
    },
    url: "https://www.meteo.cat/wpweb/climatologia/butlletins-i-episodis-meteorologics/butlleti-estacional/",
    publisher: "Servei Meteorològic de Catalunya",
  },
];

export interface Copy {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  intro: string[];
  statusTitle: string;
  status: string[];
  directAnswerTitle: string;
  directAnswer: string;
  keyFactsTitle: string;
  keyFacts: { label: string; value: string }[];
  tableCaption: string;
  tableHeaders: string[];
  tableNote: string;
  descentHeading: string;
  descent: string[];
  byDateHeading: string;
  byDate: { when: string; what: string }[];
  whyHeading: string;
  why: string[];
  yearHeading: string;
  year: string[];
  quickHeading: string;
  quick: string[];
  relatedLine: string;
}

export const COPY: Record<Locale, Copy> = {
  ca: {
    path: "natura/colors-tardor-catalunya",
    title: "Colors de tardor 2026: on veure els boscos de Catalunya al millor moment",
    seoTitle: "Colors de tardor a Catalunya 2026: on i quan veure'ls",
    seoDescription:
      "Quan arriben els colors de tardor a Catalunya? Guia 2026 amb els millors boscos, dates orientatives i zones del Pirineu, Garrotxa i Montseny.",
    excerpt:
      "Quan arriben els colors de tardor a cada bosc de Catalunya. Finestres orientatives del Pirineu a la Garrotxa i el Montseny, amb les dates que publiquen els parcs naturals.",
    intro: [
      "La tardor no arriba a tots els boscos de Catalunya alhora.",
      "Mentre a les cotes més altes del Pirineu les primeres fulles poden començar a canviar de color durant la segona meitat de setembre, alguns dels boscos més coneguts de la Garrotxa o el Montseny encara poden necessitar moltes setmanes abans d'arribar als seus grocs, ocres i vermells més intensos.",
      "Per això, si l'objectiu és trobar **el millor moment de color**, importa gairebé tant escollir bé la data com el lloc.",
      "El 2026 hi ha, a més, un factor especial: l'estiu ha estat el més càlid registrat a Catalunya i sec a la major part del territori segons Meteocat. Això pot fer que l'evolució sigui especialment irregular i obliga a interpretar qualsevol calendari com una orientació, no com una garantia.",
    ],
    statusTitle: "Com està la tardor ara?",
    status: [
      "**15 de setembre de 2026: encara és aviat a la major part de Catalunya.**",
      "Els primers canvis poden començar a aparèixer durant la segona meitat de setembre als sectors més alts del Pirineu.",
      "Per trobar grans extensions de bosc en grocs, ocres i vermells, l'octubre continuarà sent el mes clau en bona part de l'alta muntanya, mentre que alguns boscos de cotes més baixes poden arribar al millor moment entre finals d'octubre i novembre.",
    ],
    directAnswerTitle: "En resum",
    directAnswer:
      "Els colors de tardor comencen habitualment durant la segona meitat de setembre a les zones més altes del Pirineu i avancen progressivament cap a cotes més baixes. El Parc Natural de l'Alt Pirineu situa alguns dels millors moments entre la primera quinzena d'octubre i mitjan novembre segons la vall i l'altitud. Per a la Fageda d'en Jordà, el Montseny o sectors baixos, acostuma a tenir més sentit mirar cap a finals d'octubre i novembre que no pas al setembre.",
    keyFactsTitle: "Dades clau",
    keyFacts: [
      { label: "Primers canvis", value: "Segona meitat de setembre a l'alta muntanya" },
      { label: "Mes clau", value: "Octubre" },
      { label: "Zones tardanes", value: "Cotes mitjanes i baixes fins a novembre" },
      { label: "Any", value: "2026, després de l'estiu més càlid registrat" },
      { label: "Important", value: "Les dates són orientatives i depenen del temps" },
      { label: "Actualitzat", value: "Setembre de 2026" },
    ],
    tableCaption: "Calendari orientatiu per zones",
    tableHeaders: ["Zona", "Millor finestra orientativa", "Què hi destaca"],
    tableNote:
      "Les finestres del Bosc de Virós, Esterri de Cardós, la Vall de Sant Joan i Salenques les publiquen el parc natural o l'oficina de turisme. Les de la Fageda d'en Jordà i el Montseny són orientació editorial: no hi ha previsió oficial.",
    descentHeading: "La tardor baixa de la muntanya",
    descent: [
      "El Parc Natural de l'Alt Pirineu ofereix una de les explicacions més útils per entendre el procés.",
      "Els primers colors comencen normalment durant la **segona meitat de setembre** a l'estatge subalpí i avancen després cap a cotes inferiors. A les zones més baixes, els màxims acostumen a arribar durant la **segona quinzena d'octubre i fins a mitjan novembre**.",
      "Això explica per què una excursió perfecta a principis d'octubre en un sector alt pot ser massa aviat per a un bosc situat molt més avall. No existeix, per tant, «el cap de setmana perfecte» per a tot Catalunya.",
    ],
    byDateHeading: "Quin lloc triaria segons la data?",
    byDate: [
      {
        when: "Finals de setembre",
        what: "No buscaria encara una gran explosió general de color. Miraria sobretot sectors alts del Pirineu, on els primers canvis poden començar a ser visibles.",
      },
      {
        when: "Primera quinzena d'octubre",
        what: "El Bosc de Virós és una de les opcions amb millor suport oficial. També és moment de començar a seguir molt de prop Aigüestortes i altres sectors pirinencs.",
      },
      {
        when: "Segona quinzena d'octubre",
        what: "Aquí s'obre probablement la finestra més potent. Esterri de Cardós, Aigüestortes, diverses valls pirinenques, l'Aran i progressivament boscos de menor altitud poden coincidir en moments molt interessants.",
      },
      {
        when: "Finals d'octubre i principis de novembre",
        what: "Salenques és una aposta especialment ben documentada. També és el període a vigilar per a la Fageda d'en Jordà, el Montseny i altres boscos que acostumen a arribar més tard.",
      },
      {
        when: "Primera quinzena de novembre",
        what: "Encara poden existir zones espectaculars de cota baixa o mitjana. La Vall de Sant Joan, per exemple, té una finestra oficial que arriba fins a la primera quinzena de novembre.",
      },
    ],
    whyHeading: "Per què les dates canvien cada any?",
    why: [
      "El canvi de color no segueix un calendari exacte. La temperatura, les primeres fredorades, la disponibilitat d'aigua, el vent, l'altitud, l'orientació i l'espècie dels arbres poden avançar o retardar el procés.",
      "Un episodi de vent fort també pot fer caure molta fulla en molt poc temps.",
      "Per això aquesta guia utilitza **finestres temporals**, no dates de màxim garantides.",
    ],
    yearHeading: "2026 pot ser especialment irregular",
    year: [
      "Aquest any cal afegir un factor important: Meteocat ha confirmat que l'estiu de 2026 ha estat el més càlid registrat a Catalunya i sec a la major part del país.",
      "Això pot provocar diferències importants entre boscos, exposicions i altituds. CatalunyaInfo actualitzarà aquesta guia a mesura que avanci la tardor.",
    ],
    quickHeading: "El calendari ràpid",
    quick: [
      "**Alta muntanya:** comença a mirar a partir de la segona meitat de setembre.",
      "**Pirineu:** octubre és el mes clau.",
      "**Valls pirinenques i boscos de cota mitjana:** segona quinzena d'octubre.",
      "**Garrotxa, Montseny i alguns boscos més baixos:** finals d'octubre i novembre.",
      "I sobretot: comprova sempre l'estat real del bosc abans de fer un viatge llarg només pels colors.",
    ],
    relatedLine:
      "Si l'escapada de tardor també inclou bosc i cistella, tenim el [part setmanal de condicions per als bolets](/ca/natura/bolets-catalunya-condicions/), amb pluja acumulada i zones per comarca.",
  },
  es: {
    path: "naturaleza/colores-otono-cataluna",
    title: "Colores de otoño 2026: dónde ver los bosques de Cataluña en su mejor momento",
    seoTitle: "Colores de otoño en Cataluña 2026: dónde y cuándo verlos",
    seoDescription:
      "Guía 2026 para ver los colores de otoño en Cataluña: mejores bosques y fechas orientativas desde el Pirineo hasta la Garrotxa y el Montseny.",
    excerpt:
      "Cuándo llegan los colores de otoño a cada bosque de Cataluña. Ventanas orientativas del Pirineo a la Garrotxa y el Montseny, con las fechas que publican los parques naturales.",
    intro: [
      "El otoño no llega a todos los bosques de Cataluña a la vez.",
      "Mientras las zonas más altas del Pirineo pueden empezar a mostrar cambios durante la segunda mitad de septiembre, bosques como la Fageda d'en Jordà o algunas zonas del Montseny pueden necesitar varias semanas más para alcanzar sus tonos dorados, cobrizos y rojizos.",
      "Por eso, para encontrar **los mejores colores de otoño**, elegir bien la fecha es casi tan importante como elegir el lugar.",
      "Además, 2026 llega con una circunstancia especial: Meteocat ha confirmado que el verano ha sido el más cálido registrado en Cataluña y seco en la mayor parte del territorio. Eso puede hacer que la evolución del color sea especialmente irregular.",
    ],
    statusTitle: "¿Cómo está el otoño ahora mismo?",
    status: [
      "**15 de septiembre de 2026: todavía es pronto en la mayor parte de Cataluña.**",
      "Los primeros cambios pueden empezar a aparecer durante la segunda mitad de septiembre en los sectores más altos del Pirineo.",
      "Para encontrar grandes extensiones de bosque en amarillos, ocres y rojizos, octubre seguirá siendo el mes clave en buena parte de la montaña, mientras algunos bosques de cotas inferiores pueden alcanzar su mejor momento entre finales de octubre y noviembre.",
    ],
    directAnswerTitle: "En resumen",
    directAnswer:
      "Los colores de otoño empiezan habitualmente durante la segunda mitad de septiembre en las zonas más altas del Pirineo y avanzan progresivamente hacia cotas inferiores. El Parc Natural de l'Alt Pirineu sitúa algunos de sus mejores momentos entre la primera quincena de octubre y mediados de noviembre según el valle y la altitud. Para la Fageda d'en Jordà, el Montseny o sectores más bajos suele tener más sentido mirar hacia finales de octubre y noviembre que hacia septiembre.",
    keyFactsTitle: "Datos clave",
    keyFacts: [
      { label: "Primeros cambios", value: "Segunda mitad de septiembre en alta montaña" },
      { label: "Mes clave", value: "Octubre" },
      { label: "Zonas tardías", value: "Cotas medias y bajas hasta noviembre" },
      { label: "Año", value: "2026, después del verano más cálido registrado" },
      { label: "Importante", value: "Las fechas son orientativas y dependen del tiempo" },
      { label: "Actualizado", value: "Septiembre de 2026" },
    ],
    tableCaption: "Calendario orientativo por zonas",
    tableHeaders: ["Zona", "Mejor ventana orientativa", "Qué destaca"],
    tableNote:
      "Las ventanas del Bosc de Virós, Esterri de Cardós, la Vall de Sant Joan y Salenques las publican el parque natural o la oficina de turismo. Las de la Fageda d'en Jordà y el Montseny son orientación editorial: no existe previsión oficial.",
    descentHeading: "El otoño desciende progresivamente desde la montaña",
    descent: [
      "El Parc Natural de l'Alt Pirineu explica que los colores de otoño suelen empezar durante la **segunda mitad de septiembre** en el piso subalpino.",
      "Después avanzan hacia cotas inferiores. En las zonas más bajas del parque, los máximos suelen concentrarse entre la **segunda mitad de octubre y mediados de noviembre**.",
      "Por eso no existe un único fin de semana perfecto para toda Cataluña.",
    ],
    byDateHeading: "Qué bosque elegir según la fecha",
    byDate: [
      {
        when: "Finales de septiembre",
        what: "Buscar los primeros cambios en las zonas más altas del Pirineo. No esperar todavía el máximo general.",
      },
      {
        when: "Primera mitad de octubre",
        what: "Bosc de Virós es una de las apuestas con un calendario oficial más claro. También conviene empezar a seguir Aigüestortes.",
      },
      {
        when: "Segunda mitad de octubre",
        what: "Es probablemente la ventana con más posibilidades de encontrar varias zonas interesantes simultáneamente. Esterri de Cardós, Aigüestortes y numerosos valles pirenaicos entran en escena.",
      },
      {
        when: "Finales de octubre y principios de noviembre",
        what: "Salenques entra en su periodo oficialmente recomendado. También cobra sentido seguir muy de cerca la Fageda d'en Jordà y el Montseny.",
      },
      {
        when: "Primera mitad de noviembre",
        what: "Algunas zonas de menor altitud todavía pueden conservar un color excelente. La Vall de Sant Joan cuenta oficialmente con una ventana que llega hasta esta época.",
      },
    ],
    whyHeading: "Por qué nunca hay una fecha exacta",
    why: [
      "El cambio de color depende del frío, la humedad, la lluvia, el viento, la altitud, la orientación y la especie.",
      "Una tormenta de viento puede eliminar en pocas horas buena parte de unas hojas que el día anterior estaban en perfecto estado.",
      "Por eso esta guía utiliza ventanas temporales y no promete un máximo exacto.",
    ],
    yearHeading: "Una temporada 2026 diferente",
    year: [
      "El verano más cálido registrado en Cataluña y la sequedad acumulada pueden provocar una evolución más irregular de lo habitual.",
      "CatalunyaInfo actualizará esta guía conforme avance la temporada.",
    ],
    quickHeading: "El calendario rápido",
    quick: [
      "**Alta montaña:** empieza a mirar a partir de la segunda mitad de septiembre.",
      "**Pirineo:** octubre es el mes clave.",
      "**Valles pirenaicos y bosques de cota media:** segunda quincena de octubre.",
      "**Garrotxa, Montseny y algunos bosques más bajos:** finales de octubre y noviembre.",
      "Y sobre todo: comprueba siempre el estado real del bosque antes de hacer un viaje largo solo por los colores.",
    ],
    relatedLine:
      "Si la escapada de otoño también incluye bosque y cesta, tenemos el [parte semanal de condiciones para las setas](/es/naturaleza/setas-cataluna-condiciones/), con lluvia acumulada y zonas por comarca.",
  },
  en: {
    path: "nature/fall-colors-catalonia",
    title: "Catalonia fall colors 2026: where and when to see them at their best",
    seoTitle: "Catalonia fall colors 2026: best places and timing",
    seoDescription:
      "A 2026 guide to fall colors in Catalonia, with the best forests and expected timing from the Pyrenees to La Garrotxa and Montseny.",
    excerpt:
      "When autumn colour reaches each part of Catalonia. Timing windows from the Pyrenees to La Garrotxa and Montseny, using the dates the natural parks publish.",
    intro: [
      "Autumn does not arrive everywhere in Catalonia at the same time.",
      "Higher parts of the Pyrenees can begin changing during the second half of September, while famous lower forests such as La Fageda d'en Jordà or parts of Montseny may need several more weeks before reaching their strongest gold, copper and red tones.",
      "If your goal is to see **Catalonia's best fall colours**, timing can be almost as important as choosing the destination.",
      "2026 also has an important complication: Catalonia's meteorological service has confirmed that summer 2026 was the hottest on record and dry across most of the region. That could make this year's progression unusually uneven.",
    ],
    statusTitle: "What do the forests look like right now?",
    status: [
      "**September 15, 2026: it is still early across most of Catalonia.**",
      "The first autumn changes can begin during the second half of September in higher parts of the Pyrenees.",
      "October is generally the key month for broad areas of mountain woodland, while some lower forests can reach their strongest colours from late October into November.",
    ],
    directAnswerTitle: "In short",
    directAnswer:
      "Fall colours usually begin during the second half of September in the higher Pyrenees before gradually moving to lower elevations. Official guidance from the Alt Pirineu Natural Park places some of its best colour periods between early October and mid-November depending on the valley and elevation. Lower forests such as La Fageda d'en Jordà and Montseny generally make more sense later in the season than in September.",
    keyFactsTitle: "Key facts",
    keyFacts: [
      { label: "First colour", value: "Second half of September at higher elevations" },
      { label: "Key month", value: "October" },
      { label: "Later areas", value: "Medium and lower elevations into November" },
      { label: "2026 context", value: "Following Catalonia's hottest summer on record" },
      { label: "Important", value: "Timing is approximate and weather-dependent" },
      { label: "Updated", value: "September 2026" },
    ],
    tableCaption: "Approximate timing by area",
    tableHeaders: ["Area", "Best approximate window", "What stands out"],
    tableNote:
      "The windows for Bosc de Virós, Esterri de Cardós, Sant Joan Valley and Salenques are published by the natural park or the tourism board. Those for La Fageda d'en Jordà and Montseny are editorial guidance: no official forecast exists.",
    descentHeading: "Fall moves gradually down the mountains",
    descent: [
      "Official guidance from the Alt Pirineu Natural Park provides one of the clearest explanations of Catalonia's autumn progression.",
      "Colours usually begin during the **second half of September** in higher subalpine areas. The change then gradually moves toward lower elevations, and in lower parts of the park peak colour commonly falls between the **second half of October and mid-November**.",
      "That is why there is no single best weekend for the whole of Catalonia.",
    ],
    byDateHeading: "Where should you go by date?",
    byDate: [
      {
        when: "Late September",
        what: "Look to higher sections of the Pyrenees for the first changes. Do not expect widespread peak colour yet.",
      },
      {
        when: "Early October",
        what: "Bosc de Virós has one of the clearest official early-season windows. Aigüestortes also becomes increasingly interesting.",
      },
      {
        when: "Second half of October",
        what: "This is likely to offer the broadest choice. Esterri de Cardós, Aigüestortes and many Pyrenean valleys can all become strong options.",
      },
      {
        when: "Late October and early November",
        what: "Salenques reaches its officially recommended period. This is also when La Fageda d'en Jordà and Montseny become increasingly relevant.",
      },
      {
        when: "Early November",
        what: "Some medium and lower elevation forests can still look excellent. Sant Joan Valley's official colour window extends into the first half of November.",
      },
    ],
    whyHeading: "Why peak dates change every year",
    why: [
      "Autumn colour depends on temperature, rainfall, water stress, wind, elevation, slope orientation and tree species.",
      "Strong wind can also strip leaves rapidly even when colours looked perfect only a day earlier.",
      "For that reason, this guide uses **time windows rather than guaranteed peak dates**.",
    ],
    yearHeading: "Why 2026 may behave differently",
    year: [
      "Summer 2026 was the hottest ever recorded in Catalonia and dry across most of the territory, which makes a perfectly normal progression less certain.",
      "CatalunyaInfo will update this guide as autumn develops.",
    ],
    quickHeading: "The quick calendar",
    quick: [
      "**High mountains:** start looking from the second half of September.",
      "**Pyrenees:** October is the key month.",
      "**Pyrenean valleys and mid-elevation forest:** second half of October.",
      "**La Garrotxa, Montseny and lower forests:** late October and November.",
      "And above all: check the real state of the forest before making a long trip for the colours alone.",
    ],
    relatedLine:
      "If the autumn trip also involves a basket, we publish a [weekly report on mushroom conditions](/en/nature/mushroom-season-catalonia/) with recent rainfall by area.",
  },
};
