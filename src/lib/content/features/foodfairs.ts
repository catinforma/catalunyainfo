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
 * Article 5 — autumn food fairs.
 *
 * This is the article where it would be easiest to publish something false.
 * Small municipal fairs move by a week between years, and the aggregators
 * disagree with each other and with the town halls. Checking a handful of them
 * produced three different dates for the same fair in Cardona.
 *
 * So the rule here is strict: **an exact date appears only where the organiser
 * publishes it and we read it ourselves.** Everything else gets the period the
 * official source actually states, plus its link. A reader who has to click
 * once has lost five seconds; a reader who drives two hours on our invented
 * date has lost a day.
 */

const FIRES = "https://firescatalanes.cat/fires/categoria/gastronomica-i-alimentacio/";
const VILADRAU = "https://viladrau.cat/ca/turisme/festes/fira-de-la-castanya";
const GANDESA = "https://gandesa.cat/festa-del-vi-2/";
const CARDONA = "https://www.cardonaturisme.cat/fires_festes/fira-de-la-llenega/";
const BRUNYOLA = "https://www.brunyola.cat/";

const DATE_WARNING = {
  ca: "Les dates de les fires petites es mouen d'un any a l'altre i els agregadors sovint es contradiuen. Aquí només donem una data exacta quan l'organitzador la publica. Per a la resta, indiquem el període que diu la font oficial i hi enllacem: confirma-ho abans de fer quilòmetres.",
  es: "Las fechas de las ferias pequeñas se mueven de un año a otro y los agregadores a menudo se contradicen. Aquí solo damos una fecha exacta cuando el organizador la publica. Para el resto indicamos el periodo que dice la fuente oficial y enlazamos: confírmalo antes de hacer kilómetros.",
  en: "Small local fairs shift by a week or more between years, and listing sites frequently contradict each other. We give an exact date only where the organiser publishes one. Otherwise we give the period the official source states, and link it: check before driving.",
};

function ca(): Block[] {
  return [
    lead(
      "La tardor gastronòmica catalana no és una sola festa: és una successió de caps de setmana dedicats al formatge, el porc, la cervesa, les galetes, l'avellana, les castanyes, els bolets, el vi i l'oli nou.",
    ),
    ...paras(
      "Cada fira té el seu producte, la seva escala i el seu públic. N'hi ha que omplen un poble sencer i n'hi ha que caben en una plaça. El que segueix és una selecció per producte i per zona, amb el que cal saber abans d'anar-hi.",
    ),
    callout("warning", "Sobre les dates", DATE_WARNING.ca),
    table(
      "Les fires, per producte",
      ["Fira", "Municipi", "Producte", "Quan"],
      [
        ["Fira Europea del Formatge", "Ripoll", "Formatges artesans", "Finals de setembre"],
        ["Porc i Cervesa", "Manlleu", "Porc i cervesa artesana", "Tardor"],
        ["Fira de la Galeta", "Camprodon", "Galetes i producte del Ripollès", "Tardor"],
        ["Fira de l'Avellana", "Brunyola", "Avellana", "Tardor"],
        ["Cavatast", "Sant Sadurní d'Anoia", "Cava", "Tardor"],
        ["Fira de la Castanya", "Viladrau", "Castanya", "**24 i 25 d'octubre de 2026**"],
        ["Fira de la Llenega i el Bosc de Tardor", "Cardona", "Bolets", "Finals d'octubre"],
        ["Festa del Vi", "Gandesa", "Vi de la Terra Alta", "Primer cap de setmana de novembre"],
        ["Fira de la Coca i el Mató", "Monistrol de Montserrat", "Coca i mató", "Entorn de Tots Sants"],
        ["Fira de l'Oli Verd", "Maials", "Oli d'oliva verge nou", "Novembre"],
      ],
      "Només la data de Viladrau està verificada a la font oficial en el moment de publicar. Comprova la resta abans de sortir.",
    ),
    ...h2(
      "Fira Europea del Formatge — Ripoll",
      "És una de les cites més importants del calendari formatger del sud d'Europa i concentra elaboradors artesans de diversos països al centre de Ripoll.",
      "Interessa tant si vols comprar com si vols tastar i entendre: hi ha tastos, concursos i mostres que expliquen d'on surt cada formatge. Val la pena combinar-la amb la visita al monestir de Santa Maria de Ripoll.",
    ),
    ...h2(
      "Porc i Cervesa — Manlleu",
      "Un aparellament que a Osona té tot el sentit: producte porcí de la comarca i cervesa artesana catalana, en un format de fira de carrer molt orientat al tast.",
      "És de les propostes més familiars i informals de la llista.",
    ),
    ...h2(
      "Fira de la Galeta — Camprodon",
      "Camprodon és sinònim de galeta, i la fira gira al voltant d'aquest producte i de la resta de la despensa del Ripollès: embotits, formatges i dolç de muntanya.",
      "Bona excusa per pujar a la vall en plena tardor, quan el paisatge ja ha canviat de color.",
    ),
    ...h2(
      "Fira de l'Avellana — Brunyola",
      "L'avellana té a la Selva una de les seves zones productores històriques, i aquesta fira és de les poques que la posen al centre.",
      `És una fira petita i de poble, amb el que això implica de bo i de logísticament limitat. Informació: [brunyola.cat](${BRUNYOLA}).`,
    ),
    ...h2(
      "Cavatast — Sant Sadurní d'Anoia",
      "La mostra de cava de la capital del cava: desenes de referències de diverses cases en un format de tast amb tiquets.",
      `Si hi vas, val la pena arribar-hi en tren. ${link("trains", "ca", "Sant Sadurní és una de les escapades ferroviàries de la nostra llista")}, i el cava i el cotxe no es porten bé.`,
    ),
    ...h2(
      "Fira de la Castanya — Viladrau",
      "**24 i 25 d'octubre de 2026**, en la seva 31a edició, segons l'Ajuntament de Viladrau. És la referència de la castanya al Montseny i una de les fires de tardor més conegudes de Catalunya.",
      `Viladrau afegeix, cada 31 d'octubre, el Ball de les Bruixes, vinculat a la mateixa tradició. Informació oficial: [viladrau.cat](${VILADRAU}).`,
      `Si el que busques és la tradició sencera —castanyes, panellets i Tots Sants— ${link("castanyada", "ca", "hi dediquem un article complet")}.`,
    ),
    ...h2(
      "Fira de la Llenega i el Bosc de Tardor — Cardona",
      "La llenega és el bolet protagonista, però la fira s'ha anat ampliant cap a un format de «bosc de tardor» amb activitats de natura, rutes i tallers a banda de la part gastronòmica.",
      `Es combina molt bé amb la visita a la Muntanya de Sal i al castell. Comprova la data a [cardonaturisme.cat](${CARDONA}), perquè aquesta és precisament una de les fires on els calendaris no oficials es contradiuen.`,
      `Si vas a buscar-ne pel teu compte, mira abans ${link("mushrooms", "ca", "el nostre part setmanal de condicions")}.`,
    ),
    ...h2(
      "Festa del Vi — Gandesa",
      "La Terra Alta té una identitat vinícola pròpia, amb la garnatxa blanca com a gran bandera, i Gandesa n'és la capital.",
      `L'Ajuntament indica que la festa se celebra **el primer cap de setmana de novembre**. Consulta el programa i les dates exactes de l'any a [gandesa.cat](${GANDESA}).`,
    ),
    ...h2(
      "Fira de la Coca i el Mató — Monistrol de Montserrat",
      "La coca i el mató és el dolç que històricament es menja en pujar a Montserrat, i Monistrol li dedica una fira a l'entorn de Tots Sants.",
      `És una parada natural si estàs fent ${link("montserrat", "ca", "una escapada per la zona")}.`,
    ),
    ...h2(
      "Fira de l'Oli Verd — Maials",
      "L'oli verd és el primer oli de la collita, embotellat sense filtrar i amb un amargor i un picant molt marcats. Maials, al Segrià, li dedica una fira al novembre.",
      "És una de les millors maneres d'entendre per què l'oli nou no és el mateix producte que l'oli que es compra la resta de l'any.",
    ),
    ...h2(
      "Com triar",
      "Per menjar i comprar producte: Ripoll i Maials.",
      "Per beure amb criteri: Sant Sadurní i Gandesa.",
      "Per anar-hi amb criatures: Manlleu, Camprodon i Viladrau.",
      "Per combinar bosc i taula: Cardona.",
      `Calendari general de fires catalanes: [firescatalanes.cat](${FIRES}). I si el cap de setmana encara està obert, ${link("weekend", "ca", "la nostra agenda setmanal")} recull la resta de propostes.`,
    ),
    ...relatedBlocks(["castanyada", "mushrooms", "autumn", "weekend", "trains"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "El otoño gastronómico catalán no es una sola fiesta: es una sucesión de fines de semana dedicados al queso, el cerdo, la cerveza, las galletas, la avellana, las castañas, las setas, el vino y el aceite nuevo.",
    ),
    ...paras(
      "Cada feria tiene su producto, su escala y su público. Las hay que llenan un pueblo entero y las hay que caben en una plaza. Esto es una selección por producto y por zona, con lo que conviene saber antes de ir.",
    ),
    callout("warning", "Sobre las fechas", DATE_WARNING.es),
    table(
      "Las ferias, por producto",
      ["Feria", "Municipio", "Producto", "Cuándo"],
      [
        ["Fira Europea del Formatge", "Ripoll", "Quesos artesanos", "Finales de septiembre"],
        ["Porc i Cervesa", "Manlleu", "Cerdo y cerveza artesana", "Otoño"],
        ["Fira de la Galeta", "Camprodon", "Galletas y producto del Ripollès", "Otoño"],
        ["Fira de l'Avellana", "Brunyola", "Avellana", "Otoño"],
        ["Cavatast", "Sant Sadurní d'Anoia", "Cava", "Otoño"],
        ["Fira de la Castanya", "Viladrau", "Castaña", "**24 y 25 de octubre de 2026**"],
        ["Fira de la Llenega i el Bosc de Tardor", "Cardona", "Setas", "Finales de octubre"],
        ["Festa del Vi", "Gandesa", "Vino de la Terra Alta", "Primer fin de semana de noviembre"],
        ["Fira de la Coca i el Mató", "Monistrol de Montserrat", "Coca y mató", "Entorno de Todos los Santos"],
        ["Fira de l'Oli Verd", "Maials", "Aceite de oliva virgen nuevo", "Noviembre"],
      ],
      "Solo la fecha de Viladrau está verificada en la fuente oficial al publicar. Comprueba el resto antes de salir.",
    ),
    ...h2(
      "Fira Europea del Formatge — Ripoll",
      "Una de las citas más importantes del calendario quesero del sur de Europa, con elaboradores artesanos de varios países en el centro de Ripoll.",
      "Interesa tanto si quieres comprar como si quieres catar y entender: hay catas, concursos y muestras. Se combina bien con el monasterio de Santa Maria de Ripoll.",
    ),
    ...h2(
      "Porc i Cervesa — Manlleu",
      "Un maridaje que en Osona tiene todo el sentido: producto porcino de la comarca y cerveza artesana catalana, en formato de feria de calle muy orientada a la degustación.",
    ),
    ...h2(
      "Fira de la Galeta — Camprodon",
      "Camprodon es sinónimo de galleta, y la feria gira en torno a ese producto y al resto de la despensa del Ripollès: embutidos, quesos y dulce de montaña.",
      "Buena excusa para subir al valle en pleno otoño.",
    ),
    ...h2(
      "Fira de l'Avellana — Brunyola",
      "La avellana tiene en La Selva una de sus zonas productoras históricas, y esta es de las pocas ferias que la ponen en el centro.",
      `Feria pequeña y de pueblo, con lo bueno y lo limitado que eso implica. Información: [brunyola.cat](${BRUNYOLA}).`,
    ),
    ...h2(
      "Cavatast — Sant Sadurní d'Anoia",
      "La muestra de cava de la capital del cava: decenas de referencias de varias casas en formato de cata con tickets.",
      `Conviene llegar en tren: ${link("trains", "es", "Sant Sadurní está en nuestra lista de escapadas ferroviarias")}, y el cava y el coche no se llevan bien.`,
    ),
    ...h2(
      "Fira de la Castanya — Viladrau",
      "**24 y 25 de octubre de 2026**, en su 31ª edición, según el Ayuntamiento de Viladrau. Es la referencia de la castaña en el Montseny.",
      `Viladrau añade, cada 31 de octubre, el Ball de les Bruixes. Información oficial: [viladrau.cat](${VILADRAU}).`,
      `Si buscas la tradición completa —castañas, panellets y Todos los Santos— ${link("castanyada", "es", "le dedicamos un artículo entero")}.`,
    ),
    ...h2(
      "Fira de la Llenega i el Bosc de Tardor — Cardona",
      "La llenega es la seta protagonista, pero la feria se ha ampliado hacia un formato de «bosque de otoño» con actividades de naturaleza, rutas y talleres.",
      `Se combina muy bien con la Montaña de Sal y el castillo. Comprueba la fecha en [cardonaturisme.cat](${CARDONA}): es justamente una de las ferias donde los calendarios no oficiales se contradicen.`,
      `Si vas a buscarlas por tu cuenta, mira antes ${link("mushrooms", "es", "nuestro parte semanal de condiciones")}.`,
    ),
    ...h2(
      "Festa del Vi — Gandesa",
      "La Terra Alta tiene identidad vinícola propia, con la garnacha blanca como gran bandera, y Gandesa es su capital.",
      `El Ayuntamiento indica que se celebra **el primer fin de semana de noviembre**. Consulta programa y fechas exactas en [gandesa.cat](${GANDESA}).`,
    ),
    ...h2(
      "Fira de la Coca i el Mató — Monistrol de Montserrat",
      "La coca con mató es el dulce que históricamente se come al subir a Montserrat, y Monistrol le dedica una feria en el entorno de Todos los Santos.",
      `Parada natural si estás haciendo ${link("montserrat", "es", "una escapada por la zona")}.`,
    ),
    ...h2(
      "Fira de l'Oli Verd — Maials",
      "El aceite verde es el primer aceite de la cosecha, embotellado sin filtrar y con un amargor y un picante muy marcados. Maials, en el Segrià, le dedica una feria en noviembre.",
      "Es de las mejores formas de entender por qué el aceite nuevo no es el mismo producto que el del resto del año.",
    ),
    ...h2(
      "Cómo elegir",
      "Para comer y comprar producto: Ripoll y Maials.",
      "Para beber con criterio: Sant Sadurní y Gandesa.",
      "Para ir con niños: Manlleu, Camprodon y Viladrau.",
      "Para combinar bosque y mesa: Cardona.",
      `Calendario general de ferias catalanas: [firescatalanes.cat](${FIRES}).`,
    ),
    ...relatedBlocks(["castanyada", "mushrooms", "autumn", "weekend", "trains"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "Catalan autumn is not one food festival. It is a run of weekends dedicated to cheese, pork, craft beer, biscuits, hazelnuts, chestnuts, wild mushrooms, wine and the first oil of the olive harvest.",
    ),
    ...paras(
      "Each fair has its product, its scale and its crowd. Some fill an entire town; some fit in one square. What follows is a selection by product and region, with what you need to know before going.",
    ),
    callout("warning", "About the dates", DATE_WARNING.en),
    table(
      "The fairs, by product",
      ["Fair", "Town", "Product", "When"],
      [
        ["European Cheese Fair", "Ripoll", "Artisan cheese", "Late September"],
        ["Porc i Cervesa", "Manlleu", "Pork and craft beer", "Autumn"],
        ["Fira de la Galeta", "Camprodon", "Biscuits and mountain produce", "Autumn"],
        ["Hazelnut Fair", "Brunyola", "Hazelnuts", "Autumn"],
        ["Cavatast", "Sant Sadurní d'Anoia", "Cava", "Autumn"],
        ["Chestnut Fair", "Viladrau", "Chestnuts", "**24–25 October 2026**"],
        ["Fira de la Llenega", "Cardona", "Wild mushrooms", "Late October"],
        ["Festa del Vi", "Gandesa", "Terra Alta wine", "First weekend of November"],
        ["Coca i Mató Fair", "Monistrol de Montserrat", "Coca i mató", "Around All Saints"],
        ["Oli Verd Fair", "Maials", "New unfiltered olive oil", "November"],
      ],
      "Only the Viladrau date was verified against the official source at the time of publishing. Check the others before travelling.",
    ),
    callout(
      "info",
      "Four Catalan words worth knowing",
      "**Coca i mató**: a flat sweet pastry eaten with fresh unsalted curd cheese, traditionally on the way up to Montserrat. **Llenega**: a wild mushroom prized in central Catalonia. **Oli verd**: the first, unfiltered oil of the olive harvest — intensely green, bitter and peppery. **Clotxa**: a hollowed-out loaf filled with grilled vegetables, salt cod and garlic, eaten in the southern inland regions.",
    ),
    ...h2(
      "European Cheese Fair — Ripoll",
      "One of the most significant artisan cheese gatherings in southern Europe, with producers from several countries filling central Ripoll. There are tastings and competitions as well as stalls, so it works whether you want to buy or to learn.",
      "Combine it with the Romanesque monastery of Santa Maria de Ripoll.",
    ),
    ...h2(
      "Porc i Cervesa — Manlleu",
      "Local pork and Catalan craft beer, in an informal street-fair format built around tasting. One of the most family-friendly on this list.",
    ),
    ...h2(
      "Fira de la Galeta — Camprodon",
      "Camprodon is synonymous with biscuits in Catalonia, and the fair covers the wider Ripollès larder too: cured meats, cheeses and mountain baking.",
      "A good reason to go up the valley when the autumn colour has arrived.",
    ),
    ...h2(
      "Hazelnut Fair — Brunyola",
      "La Selva is one of Catalonia's historic hazelnut-growing areas, and this is one of very few fairs that puts the nut at the centre.",
      `A small village fair, with everything that implies. Information: [brunyola.cat](${BRUNYOLA}).`,
    ),
    ...h2(
      "Cavatast — Sant Sadurní d'Anoia",
      "The cava showcase in the cava capital: dozens of labels from multiple houses, tasted with a ticket system.",
      `Arrive by train — ${link("trains", "en", "Sant Sadurní is on our list of rail day trips")}, and cava and driving do not mix.`,
    ),
    ...h2(
      "Chestnut Fair — Viladrau",
      "**24–25 October 2026**, the 31st edition, according to Viladrau town council. This is the reference chestnut fair of the Montseny massif.",
      `Viladrau also holds its Ball de les Bruixes — Witches' Dance — each 31 October. Official information: [viladrau.cat](${VILADRAU}).`,
      `For the wider tradition of chestnuts, panellets and All Saints, ${link("castanyada", "en", "we have a full guide")}.`,
    ),
    ...h2(
      "Fira de la Llenega — Cardona",
      "The llenega mushroom is the headline, but the fair has broadened into an autumn-forest format with nature activities, guided routes and workshops.",
      `It combines well with Cardona's salt mountain and castle. Check the date at [cardonaturisme.cat](${CARDONA}) — this is precisely one of the fairs where unofficial calendars disagree.`,
      `If you are foraging yourself, read ${link("mushrooms", "en", "our weekly conditions report")} first.`,
    ),
    ...h2(
      "Festa del Vi — Gandesa",
      "The Terra Alta has a wine identity of its own, built on white grenache, and Gandesa is its capital.",
      `The town council states the festival is held on **the first weekend of November**. Check the programme at [gandesa.cat](${GANDESA}).`,
    ),
    ...h2(
      "Coca i Mató Fair — Monistrol de Montserrat",
      "Coca i mató is the sweet historically eaten on the way up to Montserrat, and Monistrol devotes a fair to it around All Saints.",
      `A natural stop if you are ${link("montserrat", "en", "exploring that area")}.`,
    ),
    ...h2(
      "Oli Verd Fair — Maials",
      "Green oil is the very first pressing of the harvest, bottled unfiltered, startlingly bitter and peppery. Maials, in the Segrià, devotes a November fair to it.",
      "It is one of the best ways to understand why new oil is a different product from the oil sold the rest of the year.",
    ),
    ...h2(
      "How to choose",
      "To eat and buy produce: Ripoll and Maials.",
      "To drink with some guidance: Sant Sadurní and Gandesa.",
      "With children: Manlleu, Camprodon and Viladrau.",
      "To combine forest and table: Cardona.",
      `General Catalan fair calendar: [firescatalanes.cat](${FIRES}).`,
    ),
    ...relatedBlocks(["castanyada", "mushrooms", "autumn", "weekend", "trains"], "en"),
  ];
}

export const FOODFAIRS: FeatureArticle = {
  key: "foodfairs",
  entryKey: "feature-autumn-food-fairs",
  categoryKey: "food",
  heroKey: "fires-gastronomiques-catalunya-tardor",
  secondaryKey: "productes-tardor-catalunya-formatge-castanyes-vi",
  heroAlt: {
    ca: "Parades d'una fira gastronòmica de tardor a Catalunya",
    es: "Paradas de una feria gastronómica de otoño en Cataluña",
    en: "Stalls at an autumn food fair in Catalonia",
  },
  heroCaption: {
    ca: "Imatge representativa d'una fira gastronòmica de tardor. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de una feria gastronómica de otoño. Ilustración generada con inteligencia artificial.",
    en: "Representative image of an autumn food fair. Illustration generated with artificial intelligence.",
  },
  secondaryAlt: {
    ca: "Formatge, castanyes i vi, productes de la tardor catalana",
    es: "Queso, castañas y vino, productos del otoño catalán",
    en: "Cheese, chestnuts and wine — Catalan autumn produce",
  },
  secondaryCaption: {
    ca: "Imatge representativa de producte de tardor català. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de producto de otoño catalán. Ilustración generada con inteligencia artificial.",
    en: "Representative image of Catalan autumn produce. Illustration generated with artificial intelligence.",
  },
  sources: [
    { name: "Fira de la Castanya de Viladrau", url: VILADRAU, publisher: "Ajuntament de Viladrau" },
    { name: "Festa del Vi de Gandesa", url: GANDESA, publisher: "Ajuntament de Gandesa" },
    { name: "Fira de la Llenega — Cardona Turisme", url: CARDONA, publisher: "Cardona Turisme" },
    { name: "Ajuntament de Brunyola i Sant Martí Sapresa", url: BRUNYOLA, publisher: "Ajuntament de Brunyola" },
    { name: "Fires gastronòmiques de Catalunya", url: FIRES, publisher: "Fires Catalanes" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.foodfairs.ca,
      title: "Les fires gastronòmiques de Catalunya que no et pots perdre aquesta tardor",
      seoTitle: "Fires gastronòmiques de tardor a Catalunya",
      seoDescription:
        "Formatge, bolets, castanyes, cava, vi i oli nou: les fires gastronòmiques de la tardor catalana, amb el que cal comprovar abans d'anar-hi.",
      excerpt:
        "Formatge a Ripoll, bolets a Cardona, castanyes a Viladrau, oli nou a Maials: la tardor gastronòmica catalana, fira per fira.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.foodfairs.es,
      title: "Las ferias gastronómicas de Cataluña que no te puedes perder este otoño",
      seoTitle: "Ferias gastronómicas de otoño en Cataluña",
      seoDescription:
        "Queso, setas, castañas, cava, vino y aceite nuevo: las ferias gastronómicas del otoño catalán y qué comprobar antes de ir.",
      excerpt:
        "Queso en Ripoll, setas en Cardona, castañas en Viladrau, aceite nuevo en Maials: el otoño gastronómico catalán, feria a feria.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.foodfairs.en,
      title: "Catalonia's best food festivals this autumn",
      seoTitle: "Catalonia's autumn food festivals",
      seoDescription:
        "Cheese, wild mushrooms, chestnuts, cava, wine and new olive oil: the autumn food fairs of Catalonia, and what to check before you go.",
      excerpt:
        "Cheese in Ripoll, mushrooms in Cardona, chestnuts in Viladrau, new oil in Maials: the Catalan autumn, one fair at a time.",
      blocks: en(),
    },
  },
};
