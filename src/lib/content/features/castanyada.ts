import type { Block } from "@/lib/content/blocks";
import {
  ARTICLE_PATHS,
  callout,
  h2,
  keyFacts,
  lead,
  link,
  paras,
  relatedBlocks,
  table,
  type FeatureArticle,
} from "./shared";

/**
 * Article 6 — the Castanyada.
 *
 * Honest framing is the whole job here. Only a few of these places hold an
 * actual chestnut fair; the rest are towns where the autumn and All Saints
 * tradition is unusually visible. Presenting all twelve as "Fira de la
 * Castanya" would be the easy, wrong version.
 *
 * Verified dates: Viladrau's 31st chestnut fair on 24-25 October 2026, and its
 * Ball de les Bruixes held each 31 October. Everything else carries the period
 * and the official link, because municipal programmes for late October are
 * published late and change.
 */

const VILADRAU_FIRA = "https://viladrau.cat/ca/turisme/festes/fira-de-la-castanya";
const VILADRAU_BALL = "https://viladrau.cat/ca/turisme/festes/el-ball-de-les-bruixes-de-viladrau";
const FIRES = "https://firescatalanes.cat/";

const PROGRAMME_NOTE = {
  ca: "Els programes municipals de finals d'octubre es publiquen tard i canvien. Fora de Viladrau, aquí no fixem dates: comprova-les al web de cada ajuntament la mateixa setmana.",
  es: "Los programas municipales de finales de octubre se publican tarde y cambian. Fuera de Viladrau, aquí no fijamos fechas: compruébalas en la web de cada ayuntamiento esa misma semana.",
  en: "Late-October municipal programmes are published late and change. Outside Viladrau we do not fix dates here: check each town hall's site in the same week.",
};

function ca(): Block[] {
  return [
    lead(
      "La Castanyada no és una decoració de tardor ni només una paperina de castanyes. A Catalunya està lligada a Tots Sants, als panellets, als moniatos, a la figura de la castanyera i a una xarxa de fires que cada tardor converteixen pobles sencers en mercats de producte local.",
    ),
    keyFacts("Què és, en curt", [
      { label: "Quan", value: "Últims caps de setmana d'octubre i 31 d'octubre – 1 de novembre" },
      { label: "Què es menja", value: "Castanyes torrades, panellets, moniatos" },
      { label: "Què es beu", value: "Moscatell" },
      { label: "La figura", value: "La castanyera, que ven castanyes al carrer" },
      { label: "El context", value: "Tots Sants, i la visita als cementiris" },
      { label: "Fira de referència", value: "Viladrau, 24 i 25 d'octubre de 2026" },
    ]),
    ...h2(
      "Què és exactament la Castanyada",
      "És la celebració catalana associada a la vigília i el dia de Tots Sants. La part gastronòmica —castanyes torrades, panellets de massapà i pinyons, moniatos rostits, moscatell— és la més visible, però històricament va lligada al record dels difunts i a la visita als cementiris de l'1 de novembre.",
      "La castanyera és el personatge que ho concentra tot: una dona gran, abrigada, que torra castanyes en un fogó al carrer. Durant l'octubre apareix a escoles, mercats i places de mig país.",
      "Als Països Catalans hi ha variants: al País Valencià se celebra un dia abans, per Sant Dionís, amb el mocadorà. La lògica de fons és la mateixa: fruita seca i dolços de temporada al final de la collita.",
    ),
    callout("info", "Castanyada o Halloween?", "No cal plantejar-ho com una incompatibilitat: avui conviuen a la majoria de municipis. En molts pobles la festa de la castanyada es fa a l'escola al matí i la nit de Tots Sants té elements dels dos calendaris. Els programes municipals solen incloure-hi tant una cosa com l'altra."),
    callout("warning", "Sobre els programes", PROGRAMME_NOTE.ca),
    table(
      "On es viu amb més intensitat",
      ["Lloc", "Comarca", "Què hi trobaràs"],
      [
        ["Viladrau", "Osona", "Fira de la Castanya (24–25 oct. 2026) i Ball de les Bruixes (31 oct.)"],
        ["Vilanova de Prades", "Conca de Barberà", "Mercat i festa de la castanyada"],
        ["Arbúcies", "Selva", "Fira de Tardor amb castanyada tradicional"],
        ["Gósol", "Berguedà", "Fira de Tots Sants de muntanya"],
        ["Bagà", "Berguedà", "Fira de Tots Sants"],
        ["Pratdip", "Baix Camp", "Pratdip Llegendari, entorn de Tots Sants"],
        ["Cardona", "Bages", "Fira de la Llenega i bosc de tardor"],
        ["Monistrol de Montserrat", "Bages", "Fira de la Coca i el Mató"],
        ["Oliana", "Alt Urgell", "Fira de Tots Sants"],
        ["Amer", "Selva", "Fira de Sant Martí, amb torradors de castanyes"],
        ["Barcelona", "Barcelonès", "Castanyeres al carrer, pastisseries i mercats"],
        ["Montseny (conjunt)", "Osona / Vallès / Selva", "El massís castanyer per excel·lència"],
      ],
      "Només algunes d'aquestes cites són estrictament una «fira de la castanya». La resta són llocs on la tradició de tardor i Tots Sants es viu de manera especialment visible.",
    ),
    ...h2(
      "Viladrau, la referència",
      "Si només pots anar a un lloc, és aquest. L'Ajuntament de Viladrau confirma que la **31a Fira de la Castanya se celebra el cap de setmana del 24 i 25 d'octubre de 2026**.",
      "Viladrau és al cor del Montseny, el gran massís castanyer català, i la fira omple el poble de parades de producte, tastos i activitats. Compta que hi haurà molta gent: matinar hi val molt la pena.",
      `A més, cada **31 d'octubre** s'hi celebra el Ball de les Bruixes, vinculat des del 1997 als actes de la fira. Informació oficial: [la fira](${VILADRAU_FIRA}) i [el ball](${VILADRAU_BALL}).`,
    ),
    ...h2(
      "Les fires de Tots Sants del Prepirineu",
      "Gósol, Bagà i Oliana mantenen fires de Tots Sants que responen a una lògica anterior al turisme: eren els mercats on es tancava la temporada abans de l'hivern.",
      "Això es nota en el que s'hi ven —producte, bestiar, eines, artesania— i en el públic, que continua sent majoritàriament local. Si busques una experiència menys orientada al visitant, són aquestes.",
    ),
    ...h2(
      "Bosc i taula: Cardona i Arbúcies",
      "Cardona combina la Fira de la Llenega amb activitats de bosc de tardor, de manera que la castanya hi conviu amb els bolets i amb el paisatge.",
      `Arbúcies, al peu del Montseny, encaixa la castanyada dins la seva fira de tardor. Totes dues es complementen amb ${link("foodfairs", "ca", "la resta de fires gastronòmiques de la temporada")}.`,
    ),
    ...h2(
      "Pratdip i Vilanova de Prades: la tardor amb un altre accent",
      "Pratdip converteix l'entorn de Tots Sants en una proposta de llegenda i territori, amb el dip —la bèstia mitològica local— com a fil conductor.",
      "Vilanova de Prades, a la Conca de Barberà, manté un mercat i una festa de castanyada de dimensions petites i caràcter molt local.",
    ),
    ...h2(
      "Monistrol de Montserrat i Amer",
      "A Monistrol, la Fira de la Coca i el Mató recupera el dolç que històricament es menjava pujant a Montserrat, a l'entorn de Tots Sants.",
      "A Amer, la Fira de Sant Martí manté la tradició dels torradors de castanyes ja entrat el novembre: és la manera de fer durar la temporada dues setmanes més.",
    ),
    ...h2(
      "Barcelona: la castanyada urbana",
      "A Barcelona no hi ha una única festa central de la castanyada, i seria fals presentar-la com si n'hi hagués. El que hi ha és una tradició de carrer: castanyeres amb el seu fogó a les cantonades, pastisseries amb panellets des de mitjan octubre, i activitats de barri i mercats municipals.",
      "És la versió quotidiana de la tradició, i té el seu propi valor: no cal sortir de la ciutat per menjar panellets fets el mateix dia.",
    ),
    ...h2(
      "Què menjar, i quan",
      "**Castanyes torrades**, calentes, en paperina. **Panellets**, de massapà amb pinyons, coco, cafè o ametlla. **Moniatos** rostits. I **moscatell** per acompanyar-ho.",
      "Els panellets es troben a les pastisseries des de mitjan octubre. Les castanyeres apareixen al carrer a mesura que refresca.",
      `El moment fort és entre els últims caps de setmana d'octubre i l'1 de novembre. Si vols encadenar-hi paisatge, ${link("autumn", "ca", "els colors de tardor")} estan en bona part del país just en aquestes setmanes.`,
    ),
    ...paras(`Calendari general de fires: [firescatalanes.cat](${FIRES}).`),
    ...relatedBlocks(["foodfairs", "autumn", "mushrooms", "medieval", "weekend"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "La Castanyada no es una decoración de otoño ni solo un cucurucho de castañas. En Cataluña está ligada a Todos los Santos, a los panellets, a los boniatos, a la figura de la castanyera y a una red de ferias que cada otoño convierten pueblos enteros en mercados de producto local.",
    ),
    keyFacts("Qué es, en corto", [
      { label: "Cuándo", value: "Últimos fines de semana de octubre y 31 de octubre – 1 de noviembre" },
      { label: "Qué se come", value: "Castañas asadas, panellets, boniatos" },
      { label: "Qué se bebe", value: "Moscatel" },
      { label: "La figura", value: "La castanyera, que asa castañas en la calle" },
      { label: "El contexto", value: "Todos los Santos y la visita a los cementerios" },
      { label: "Feria de referencia", value: "Viladrau, 24 y 25 de octubre de 2026" },
    ]),
    ...h2(
      "Qué es exactamente la Castanyada",
      "Es la celebración catalana asociada a la víspera y el día de Todos los Santos. La parte gastronómica —castañas asadas, panellets de mazapán y piñones, boniatos, moscatel— es la más visible, pero históricamente va ligada al recuerdo de los difuntos y a la visita a los cementerios del 1 de noviembre.",
      "La castanyera lo concentra todo: una mujer mayor, abrigada, que asa castañas en un hornillo en la calle. Durante octubre aparece en escuelas, mercados y plazas de medio país.",
      "Hay variantes: en el País Valenciano se celebra un día antes, por Sant Dionís, con la mocadorà. La lógica de fondo es la misma: fruto seco y dulces de temporada al final de la cosecha.",
    ),
    callout("info", "¿Castanyada o Halloween?", "No hace falta plantearlo como incompatibilidad: hoy conviven en la mayoría de municipios. En muchos pueblos la castanyada se celebra en la escuela por la mañana y la noche de Todos los Santos mezcla elementos de ambos calendarios."),
    callout("warning", "Sobre los programas", PROGRAMME_NOTE.es),
    table(
      "Dónde se vive con más intensidad",
      ["Lugar", "Comarca", "Qué encontrarás"],
      [
        ["Viladrau", "Osona", "Fira de la Castanya (24–25 oct. 2026) y Ball de les Bruixes (31 oct.)"],
        ["Vilanova de Prades", "Conca de Barberà", "Mercado y fiesta de la castañada"],
        ["Arbúcies", "Selva", "Feria de otoño con castañada tradicional"],
        ["Gósol", "Berguedà", "Feria de Todos los Santos de montaña"],
        ["Bagà", "Berguedà", "Feria de Todos los Santos"],
        ["Pratdip", "Baix Camp", "Pratdip Llegendari, entorno de Todos los Santos"],
        ["Cardona", "Bages", "Fira de la Llenega y bosque de otoño"],
        ["Monistrol de Montserrat", "Bages", "Fira de la Coca i el Mató"],
        ["Oliana", "Alt Urgell", "Feria de Todos los Santos"],
        ["Amer", "Selva", "Fira de Sant Martí, con asadores de castañas"],
        ["Barcelona", "Barcelonès", "Castañeras en la calle, pastelerías y mercados"],
        ["Montseny (conjunto)", "Osona / Vallès / Selva", "El macizo castañero por excelencia"],
      ],
      "Solo algunas de estas citas son estrictamente una «feria de la castaña». El resto son lugares donde la tradición de otoño y Todos los Santos se vive de forma especialmente visible.",
    ),
    ...h2(
      "Viladrau, la referencia",
      "Si solo puedes ir a un sitio, es este. El Ayuntamiento de Viladrau confirma que la **31ª Fira de la Castanya se celebra el fin de semana del 24 y 25 de octubre de 2026**.",
      "Viladrau está en el corazón del Montseny, el gran macizo castañero catalán, y la feria llena el pueblo de paradas de producto, catas y actividades. Habrá mucha gente: madrugar compensa.",
      `Además, cada **31 de octubre** se celebra el Ball de les Bruixes, vinculado desde 1997 a los actos de la feria. Información oficial: [la feria](${VILADRAU_FIRA}) y [el baile](${VILADRAU_BALL}).`,
    ),
    ...h2(
      "Las ferias de Todos los Santos del Prepirineo",
      "Gósol, Bagà y Oliana mantienen ferias de Todos los Santos que responden a una lógica anterior al turismo: eran los mercados donde se cerraba la temporada antes del invierno.",
      "Se nota en lo que se vende y en el público, que sigue siendo mayoritariamente local. Si buscas algo menos orientado al visitante, son estas.",
    ),
    ...h2(
      "Bosque y mesa: Cardona y Arbúcies",
      "Cardona combina la Fira de la Llenega con actividades de bosque de otoño, de modo que la castaña convive con las setas y con el paisaje.",
      `Arbúcies, al pie del Montseny, encaja la castañada dentro de su feria de otoño. Ambas se complementan con ${link("foodfairs", "es", "el resto de ferias gastronómicas de la temporada")}.`,
    ),
    ...h2(
      "Pratdip, Vilanova de Prades, Monistrol y Amer",
      "Pratdip convierte el entorno de Todos los Santos en una propuesta de leyenda y territorio, con el dip —la bestia mitológica local— como hilo conductor. Vilanova de Prades mantiene un mercado y una fiesta de castañada pequeños y muy locales.",
      "En Monistrol, la Fira de la Coca i el Mató recupera el dulce que históricamente se comía subiendo a Montserrat. En Amer, la Fira de Sant Martí mantiene la tradición de los asadores de castañas ya entrado noviembre.",
    ),
    ...h2(
      "Barcelona: la castañada urbana",
      "En Barcelona no hay una única fiesta central de la castañada, y sería falso presentarla como si la hubiera. Lo que hay es una tradición de calle: castañeras con su hornillo en las esquinas, pastelerías con panellets desde mediados de octubre, y actividades de barrio y mercados municipales.",
      "Es la versión cotidiana de la tradición, y tiene su propio valor.",
    ),
    ...h2(
      "Qué comer, y cuándo",
      "**Castañas asadas**, calientes, en cucurucho. **Panellets**, de mazapán con piñones, coco, café o almendra. **Boniatos** asados. Y **moscatel** para acompañar.",
      "Los panellets están en las pastelerías desde mediados de octubre. Las castañeras aparecen en la calle a medida que refresca.",
      `El momento fuerte va de los últimos fines de semana de octubre al 1 de noviembre. Si quieres encadenar paisaje, ${link("autumn", "es", "los colores de otoño")} llegan a buena parte del país justo esas semanas.`,
    ),
    ...paras(`Calendario general de ferias: [firescatalanes.cat](${FIRES}).`),
    ...relatedBlocks(["foodfairs", "autumn", "mushrooms", "medieval", "weekend"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "The Castanyada is not autumn decoration, and not simply a paper cone of roasted chestnuts. In Catalonia it is tied to All Saints, to marzipan panellets, to roast sweet potato, to the figure of the castanyera, and to a network of fairs that turn whole villages into markets of local produce each autumn.",
    ),
    keyFacts("The short version", [
      { label: "When", value: "Late-October weekends, and 31 October – 1 November" },
      { label: "What you eat", value: "Roast chestnuts, panellets, sweet potato" },
      { label: "What you drink", value: "Moscatell, a sweet muscat wine" },
      { label: "The figure", value: "The castanyera, who roasts chestnuts in the street" },
      { label: "The context", value: "All Saints, and visits to the cemeteries" },
      { label: "The reference fair", value: "Viladrau, 24–25 October 2026" },
    ]),
    ...h2(
      "What the Castanyada actually is",
      "It is the Catalan celebration attached to All Saints' Eve and All Saints' Day. The food is the visible part — roast chestnuts, **panellets** (small marzipan sweets, most classically rolled in pine nuts), roast sweet potato and sweet muscat wine — but historically it belongs to the remembrance of the dead and the visits to cemeteries on 1 November.",
      "The **castanyera** ties it together: an older woman, well wrapped up, roasting chestnuts on a brazier in the street. Through October she appears at schools, markets and squares across the country.",
      "It is not Halloween with chestnuts. It is an older harvest-and-remembrance tradition that happens to fall on the same nights.",
    ),
    callout(
      "info",
      "Castanyada or Halloween?",
      "There is no need to frame this as a conflict: the two now coexist in most towns. In many places the Castanyada is celebrated at school in the morning, and All Saints' night mixes elements of both calendars. Municipal programmes usually include both.",
    ),
    callout("warning", "About the programmes", PROGRAMME_NOTE.en),
    table(
      "Where the tradition is most visible",
      ["Place", "Region", "What you will find"],
      [
        ["Viladrau", "Osona", "Chestnut Fair (24–25 Oct 2026) and Ball de les Bruixes (31 Oct)"],
        ["Vilanova de Prades", "Conca de Barberà", "Small local chestnut market and festival"],
        ["Arbúcies", "La Selva", "Autumn fair with a traditional castanyada"],
        ["Gósol", "Berguedà", "Mountain All Saints fair"],
        ["Bagà", "Berguedà", "All Saints fair"],
        ["Pratdip", "Baix Camp", "Pratdip Llegendari, around All Saints"],
        ["Cardona", "Bages", "Mushroom fair and autumn-forest activities"],
        ["Monistrol de Montserrat", "Bages", "Coca i Mató fair"],
        ["Oliana", "Alt Urgell", "All Saints fair"],
        ["Amer", "La Selva", "Sant Martí fair, with chestnut roasters"],
        ["Barcelona", "Barcelonès", "Street chestnut sellers, bakeries and markets"],
        ["The Montseny massif", "Osona / Vallès / Selva", "Catalonia's chestnut country"],
      ],
      "Only some of these are strictly a chestnut fair. The rest are places where the autumn and All Saints tradition is unusually visible.",
    ),
    ...h2(
      "Viladrau, the one to pick",
      "If you can only go to one, go here. Viladrau town council confirms that the **31st Chestnut Fair takes place on the weekend of 24–25 October 2026**.",
      "Viladrau sits in the heart of the Montseny, Catalonia's great chestnut massif, and the fair fills the village with produce stalls, tastings and activities. Expect crowds; arriving early genuinely helps.",
      `Viladrau also holds its Ball de les Bruixes — Witches' Dance — each **31 October**, linked to the fair's programme since 1997. Official information: [the fair](${VILADRAU_FIRA}) and [the dance](${VILADRAU_BALL}).`,
    ),
    ...h2(
      "The pre-Pyrenean All Saints fairs",
      "Gósol, Bagà and Oliana keep All Saints fairs that predate tourism entirely: these were the markets that closed the season before winter.",
      "It shows in what is sold and in who attends — still mostly local. If you want something not shaped around visitors, choose one of these.",
    ),
    ...h2(
      "Forest and table: Cardona and Arbúcies",
      "Cardona pairs its mushroom fair with autumn-forest activities, so chestnuts share the weekend with wild mushrooms and the landscape.",
      `Arbúcies, at the foot of the Montseny, folds the castanyada into its autumn fair. Both connect with ${link("foodfairs", "en", "the wider season of Catalan food fairs")}.`,
    ),
    ...h2(
      "Barcelona: the everyday version",
      "Barcelona has no single central Castanyada festival, and it would be false to present one. What it has is a street tradition: chestnut sellers with braziers on corners, bakeries selling panellets from mid-October, neighbourhood events and municipal markets.",
      "That is worth something in itself — you do not need to leave the city to eat panellets made that morning.",
    ),
    ...h2(
      "What to eat, and when",
      "**Roast chestnuts**, hot, in a paper cone. **Panellets**, marzipan sweets with pine nuts, coconut, coffee or almond. **Roast sweet potato**. And **moscatell** alongside.",
      "Panellets appear in bakeries from mid-October. The street chestnut sellers arrive as the weather turns.",
      `The peak runs from the last weekends of October to 1 November. If you want landscape with it, ${link("autumn", "en", "autumn colour")} reaches much of the country in exactly those weeks.`,
    ),
    ...paras(`General fair calendar: [firescatalanes.cat](${FIRES}).`),
    ...relatedBlocks(["foodfairs", "autumn", "mushrooms", "medieval", "weekend"], "en"),
  ];
}

export const CASTANYADA: FeatureArticle = {
  key: "castanyada",
  entryKey: "feature-castanyada",
  categoryKey: "festivals",
  heroKey: "castanyada-catalunya-castanyes-foc",
  secondaryKey: "fira-castanya-viladrau-tardor",
  heroAlt: {
    ca: "Castanyes torrant-se al foc durant la castanyada",
    es: "Castañas asándose al fuego durante la castañada",
    en: "Chestnuts roasting over a fire during the Castanyada",
  },
  heroCaption: {
    ca: "Imatge representativa de la tradició de la castanyada. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de la tradición de la castañada. Ilustración generada con inteligencia artificial.",
    en: "Representative image of the Castanyada tradition. Illustration generated with artificial intelligence.",
  },
  secondaryAlt: {
    ca: "Parades d'una fira de la castanya a la tardor",
    es: "Paradas de una feria de la castaña en otoño",
    en: "Stalls at an autumn chestnut fair",
  },
  secondaryCaption: {
    ca: "Imatge representativa d'una fira de la castanya; no correspon a cap edició concreta. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de una feria de la castaña; no corresponde a ninguna edición concreta. Ilustración generada con inteligencia artificial.",
    en: "Representative image of a chestnut fair; it does not depict any specific edition. Illustration generated with artificial intelligence.",
  },
  sources: [
    { name: "Fira de la Castanya de Viladrau", url: VILADRAU_FIRA, publisher: "Ajuntament de Viladrau" },
    { name: "El Ball de les Bruixes de Viladrau", url: VILADRAU_BALL, publisher: "Ajuntament de Viladrau" },
    { name: "Fires Catalanes", url: FIRES, publisher: "Fires Catalanes" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.castanyada.ca,
      title: "La Castanyada: 12 pobles i fires on viure-la de veritat",
      seoTitle: "La Castanyada a Catalunya: on viure-la de veritat",
      seoDescription:
        "Què és la Castanyada, què s'hi menja i dotze llocs de Catalunya on la tradició de tardor i Tots Sants es viu de veritat.",
      excerpt:
        "Castanyes, panellets, moniatos i Tots Sants. Què és la Castanyada i dotze llocs on es viu de debò, amb la fira de Viladrau com a referència.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.castanyada.es,
      title: "La Castanyada: 12 pueblos y ferias donde vivirla de verdad",
      seoTitle: "La Castanyada en Cataluña: dónde vivirla de verdad",
      seoDescription:
        "Qué es la Castanyada, qué se come y doce lugares de Cataluña donde la tradición de otoño y Todos los Santos se vive de verdad.",
      excerpt:
        "Castañas, panellets, boniatos y Todos los Santos. Qué es la Castanyada y doce lugares donde se vive de verdad.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.castanyada.en,
      title: "Where to experience Catalonia's Castanyada tradition",
      seoTitle: "The Castanyada: Catalonia's chestnut tradition",
      seoDescription:
        "What the Castanyada is, what you eat, and twelve places in Catalonia where the autumn and All Saints tradition is genuinely lived.",
      excerpt:
        "Chestnuts, panellets, sweet potato and All Saints. What the Castanyada is, and twelve places where it is genuinely lived.",
      blocks: en(),
    },
  },
};
