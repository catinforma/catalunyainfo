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
 * Article 3 — medieval villages.
 *
 * Two honesty problems this article has to solve. First, Montblanc and Castelló
 * d'Empúries are historic towns rather than villages, and the text says so
 * instead of quietly stretching the word. Second, opening arrangements at small
 * municipal monuments change constantly and are the least reliable thing to
 * publish, so no opening hours or prices appear anywhere — only the official
 * tourism office to check them against.
 */

const PERATALLADA = "https://www.visitperatallada.cat/";
const PALS = "https://www.visitpals.com/";
const RUPIT = "https://www.rupitpruit.cat/turisme";
const GUIMERA = "https://www.guimera.info/";
const CASTELLO = "https://castelloempuriabrava.com/";
const PATRIMONI = "https://patrimoni.gencat.cat/";

const HOURS_NOTE = {
  ca: "Cap d'aquestes visites té horaris fixos tot l'any. Els monuments municipals petits obren segons temporada i disponibilitat: comprova-ho a l'oficina de turisme del municipi abans de sortir.",
  es: "Ninguna de estas visitas tiene horarios fijos todo el año. Los monumentos municipales pequeños abren según temporada y disponibilidad: compruébalo en la oficina de turismo del municipio antes de salir.",
  en: "None of these sites keeps the same hours all year. Small municipal monuments open by season and availability, so check with the local tourist office before setting out.",
};

function ca(): Block[] {
  return [
    lead(
      "Catalunya conserva una xarxa extraordinària de nuclis medievals. Alguns són famosos per un pont; altres, per les muralles, pels castells, o simplement per una trama de carrers que encara permet llegir com era la vila set segles enrere.",
    ),
    ...paras(
      "Aquesta selecció cobreix l'Empordà, la Garrotxa, el Collsacabra, la Conca de Barberà, l'Urgell, la Ribera d'Ebre i el Priorat. Dos apunts d'honestedat: Montblanc i Castelló d'Empúries són **viles històriques**, no pobles petits, i s'inclouen perquè responen a la mateixa cerca; i Siurana i Miravet valen tant pel paisatge com pel patrimoni.",
    ),
    table(
      "Els 10 nuclis, d'un cop d'ull",
      ["Nucli", "Comarca", "El que el fa diferent"],
      [
        ["Besalú", "Garrotxa", "Pont fortificat i patrimoni jueu"],
        ["Peratallada", "Baix Empordà", "Conjunt de pedra excepcionalment conservat"],
        ["Pals", "Baix Empordà", "Torre de les Hores i vistes sobre la plana"],
        ["Montblanc", "Conca de Barberà", "Una de les grans muralles de Catalunya"],
        ["Guimerà", "Urgell", "Carrers esglaonats sota el castell"],
        ["Rupit", "Osona / Collsacabra", "Pedra, pont penjant i paisatge"],
        ["Santa Pau", "Garrotxa", "Plaça porticada dins la zona volcànica"],
        ["Castelló d'Empúries", "Alt Empordà", "Antiga capital comtal amb basílica"],
        ["Miravet", "Ribera d'Ebre", "Castell templer sobre l'Ebre"],
        ["Siurana", "Priorat", "Nucli sobre els cingles"],
      ],
    ),
    ...h2(
      "1. Besalú",
      "El pont medieval sobre el Fluvià és la imatge més coneguda de Besalú, i també la trampa: molta gent hi va, fa la fotografia i se'n torna.",
      "El valor real continua dins del nucli. Besalú conserva una estructura urbana medieval llegible, esglésies romàniques i un patrimoni jueu excepcional, amb el mikvé —el bany ritual— com a element més singular. És un dels pocs llocs de la península on es pot entendre físicament com s'organitzava una comunitat jueva medieval.",
    ),
    ...h2(
      "2. Peratallada",
      "Un dels conjunts medievals més ben conservats de l'Empordà i, probablement, el que millor transmet la sensació d'entrar en una altra època.",
      "La pedra domina carrers, arcs, muralles i places. El nucli és petit i es recorre en poc temps, però compensa anar-hi amb calma i fora de les hores punta dels caps de setmana, quan els carrers estrets es col·lapsen.",
      `Informació de visita: [visitperatallada.cat](${PERATALLADA}).`,
    ),
    ...h2(
      "3. Pals",
      "El barri antic de Pals —el Pedró— conserva muralles, carrers empedrats, la Torre de les Hores i mirador sobre la plana empordanesa fins al mar.",
      "És una de les combinacions més equilibrades de patrimoni i paisatge de tot l'Empordà, i es complementa molt bé amb Peratallada en una mateixa jornada: són a poca distància l'un de l'altre.",
      `Informació de visita: [visitpals.com](${PALS}).`,
    ),
    ...h2(
      "4. Montblanc",
      "La gran singularitat de Montblanc és la muralla. No un tram conservat, sinó un perímetre fortificat que encara envolta bona part del nucli.",
      "Més que una postal, és una vila medieval viva, amb carrers, esglésies i un centre històric prou gran per omplir una visita completa. Si només tens un dia i vols monumentalitat medieval, aquesta és l'opció.",
    ),
    ...h2(
      "5. Guimerà",
      "Els carrers de Guimerà pugen en pendent cap a les restes del castell, a la Vall del Corb. La trama esglaonada i laberíntica fa que sigui un dels pobles que millor transmeten l'estructura urbana medieval real: estret, vertical, adaptat al terreny.",
      "Guimerà celebra un mercat medieval de llarga tradició. Consulta les dates de l'edició de l'any a la web municipal abans de planificar-hi la visita.",
      `Informació: [guimera.info](${GUIMERA}).`,
    ),
    ...h2(
      "6. Rupit",
      "Rupit uneix arquitectura de pedra, carrers estrets, el pont penjant sobre el riu i el paisatge del Collsacabra.",
      "És molt visitat els caps de setmana, de manera que matinar canvia completament l'experiència. A primera hora, el poble és un altre.",
      `Informació: [rupitpruit.cat](${RUPIT}).`,
    ),
    ...h2(
      "7. Santa Pau",
      "Al cor de la Garrotxa volcànica, Santa Pau combina una plaça porticada, castell i carrers històrics amb un dels paisatges naturals més singulars de Catalunya.",
      "És la parada que millor es combina amb una excursió pel parc natural: patrimoni al matí, volcans i fageda a la tarda.",
    ),
    ...h2(
      "8. Castelló d'Empúries",
      "Antiga capital del comtat d'Empúries, i el recordatori que l'Empordà medieval era molt més que petits pobles de pedra.",
      "Conserva el call jueu, restes de muralla, carrers estrets i la monumental basílica de Santa Maria, coneguda com la catedral de l'Empordà. És una visita especialment útil per entendre l'escala del poder comtal català.",
      `Informació: [castelloempuriabrava.com](${CASTELLO}).`,
    ),
    ...h2(
      "9. Miravet",
      "Miravet està dominat pel castell templer sobre l'Ebre, una de les fortaleses més impressionants del país per situació.",
      "El nucli vell s'adapta al pendent sota la fortalesa i permet combinar història templera amb un paisatge fluvial completament diferent del de l'Empordà. El pas de barca sobre l'Ebre hi afegeix una de les experiències més singulars de la zona.",
    ),
    ...h2(
      "10. Siurana",
      "La seva situació sobre els cingles és gairebé tan important com el nucli històric. Siurana combina restes medievals, l'església romànica de Santa Maria i una de les panoràmiques més recognoscibles del Priorat.",
      "Va ser un dels últims reductes andalusins de Catalunya, cosa que explica per què és on és: no s'hi arriba per casualitat.",
    ),
    callout("warning", "Horaris i visites", HOURS_NOTE.ca),
    ...h2(
      "Si només en pots triar tres",
      "Per arquitectura medieval concentrada: Peratallada.",
      "Per monumentalitat: Montblanc.",
      "Per paisatge: Siurana o Miravet.",
      "Per una primera ruta a l'Empordà en un sol dia: Pals i Peratallada, que són a prop.",
      `Si busques patrimoni encara menys transitat, ${link("surprising", "ca", "tenim quinze llocs que la majoria de visitants no coneixen")}. I per arribar-hi sense cotxe, ${link("trains", "ca", "aquestes dotze escapades es fan en tren")}.`,
    ),
    ...paras(
      `La fitxa patrimonial de bona part d'aquests conjunts es pot consultar al catàleg de [Patrimoni Cultural de la Generalitat](${PATRIMONI}).`,
    ),
    ...relatedBlocks(["surprising", "montserrat", "trains", "castanyada", "rainy"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "Puentes fortificados, murallas completas, antiguas capitales condales y pueblos levantados sobre precipicios: Cataluña tiene una de las colecciones de núcleos medievales más variadas de la península.",
    ),
    ...paras(
      "Esta selección cubre el Empordà, la Garrotxa, el Collsacabra, la Conca de Barberà, el Urgell, la Ribera d'Ebre y el Priorat. Dos apuntes de honestidad: Montblanc y Castelló d'Empúries son **villas históricas**, no pueblos pequeños, y se incluyen porque responden a la misma búsqueda; y Siurana y Miravet valen tanto por el paisaje como por el patrimonio.",
    ),
    table(
      "Los 10 núcleos, de un vistazo",
      ["Núcleo", "Comarca", "Qué lo hace distinto"],
      [
        ["Besalú", "Garrotxa", "Puente fortificado y patrimonio judío"],
        ["Peratallada", "Baix Empordà", "Conjunto de piedra excepcionalmente conservado"],
        ["Pals", "Baix Empordà", "Torre de les Hores y vistas sobre la llanura"],
        ["Montblanc", "Conca de Barberà", "Una de las grandes murallas de Cataluña"],
        ["Guimerà", "Urgell", "Calles escalonadas bajo el castillo"],
        ["Rupit", "Osona / Collsacabra", "Piedra, puente colgante y paisaje"],
        ["Santa Pau", "Garrotxa", "Plaza porticada en la zona volcánica"],
        ["Castelló d'Empúries", "Alt Empordà", "Antigua capital condal con basílica"],
        ["Miravet", "Ribera d'Ebre", "Castillo templario sobre el Ebro"],
        ["Siurana", "Priorat", "Núcleo sobre los riscos"],
      ],
    ),
    ...h2(
      "1. Besalú",
      "El puente medieval sobre el Fluvià es la imagen más conocida de Besalú y también su trampa: mucha gente llega, hace la foto y se marcha.",
      "El valor real sigue dentro del núcleo. Besalú conserva una estructura urbana medieval legible, iglesias románicas y un patrimonio judío excepcional, con el mikvé —el baño ritual— como elemento más singular.",
    ),
    ...h2(
      "2. Peratallada",
      "Uno de los conjuntos medievales mejor conservados del Empordà y, probablemente, el que mejor transmite la sensación de entrar en otra época.",
      "La piedra domina calles, arcos, murallas y plazas. El núcleo es pequeño, pero compensa visitarlo con calma y fuera de las horas punta del fin de semana.",
      `Información de visita: [visitperatallada.cat](${PERATALLADA}).`,
    ),
    ...h2(
      "3. Pals",
      "El casco antiguo de Pals conserva murallas, calles empedradas, la Torre de les Hores y un mirador sobre la llanura ampurdanesa hasta el mar.",
      "Se complementa muy bien con Peratallada en una misma jornada: están cerca.",
      `Información de visita: [visitpals.com](${PALS}).`,
    ),
    ...h2(
      "4. Montblanc",
      "La gran singularidad de Montblanc es su muralla. No un tramo conservado, sino un perímetro fortificado que todavía rodea buena parte del núcleo.",
      "Es una villa medieval viva, con calles, iglesias y un centro histórico lo bastante grande para llenar una visita completa.",
    ),
    ...h2(
      "5. Guimerà",
      "Las calles de Guimerà suben en pendiente hacia los restos del castillo, en la Vall del Corb. Su trama escalonada y laberíntica transmite la estructura urbana medieval real: estrecha, vertical, adaptada al terreno.",
      "Guimerà celebra un mercado medieval de larga tradición. Consulta las fechas de la edición del año en la web municipal.",
      `Información: [guimera.info](${GUIMERA}).`,
    ),
    ...h2(
      "6. Rupit",
      "Rupit une arquitectura de piedra, calles estrechas, el puente colgante sobre el río y el paisaje del Collsacabra.",
      "Está muy visitado los fines de semana, así que madrugar cambia por completo la experiencia.",
      `Información: [rupitpruit.cat](${RUPIT}).`,
    ),
    ...h2(
      "7. Santa Pau",
      "En el corazón de la Garrotxa volcánica, Santa Pau combina una plaza porticada, castillo y calles históricas con uno de los paisajes naturales más singulares de Cataluña.",
      "Es la parada que mejor se combina con una excursión por el parque natural.",
    ),
    ...h2(
      "8. Castelló d'Empúries",
      "Antigua capital del condado de Empúries, y el recordatorio de que el Empordà medieval era mucho más que pequeños pueblos de piedra.",
      "Conserva el call judío, restos de muralla, calles estrechas y la monumental basílica de Santa Maria, conocida como la catedral del Empordà.",
      `Información: [castelloempuriabrava.com](${CASTELLO}).`,
    ),
    ...h2(
      "9. Miravet",
      "Miravet está dominado por el castillo templario sobre el Ebro, una de las fortalezas más impresionantes del país por situación.",
      "El casco viejo se adapta a la pendiente bajo la fortaleza. El paso de barca sobre el Ebro añade una de las experiencias más singulares de la zona.",
    ),
    ...h2(
      "10. Siurana",
      "Su situación sobre los riscos es casi tan importante como el núcleo histórico. Siurana combina restos medievales, la iglesia románica de Santa Maria y una de las panorámicas más reconocibles del Priorat.",
      "Fue uno de los últimos reductos andalusíes de Cataluña, lo que explica su emplazamiento: no se llega por casualidad.",
    ),
    callout("warning", "Horarios y visitas", HOURS_NOTE.es),
    ...h2(
      "Si solo puedes elegir tres",
      "Arquitectura medieval concentrada: Peratallada.",
      "Monumentalidad: Montblanc.",
      "Paisaje: Siurana o Miravet.",
      "Primera ruta por el Empordà en un día: Pals y Peratallada.",
      `Si buscas patrimonio aún menos transitado, ${link("surprising", "es", "tenemos quince lugares que la mayoría de visitantes no conoce")}. Y para llegar sin coche, ${link("trains", "es", "estas doce escapadas se hacen en tren")}.`,
    ),
    ...relatedBlocks(["surprising", "montserrat", "trains", "castanyada", "rainy"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "Catalonia's medieval heritage is not concentrated in one region. Stone villages near the coast, fully walled towns inland and dramatic hilltop settlements make it possible to build an entire trip around the Middle Ages.",
    ),
    ...paras(
      "A note on Catalan geography before the list. The **Empordà** is the coastal plain in the north-east, near Girona. **La Garrotxa** is the volcanic region inland from it. The **Priorat** is wine country in the south, and the **Ribera d'Ebre** follows the river Ebro. A **call** is a medieval Jewish quarter — several of these towns preserve one.",
    ),
    ...paras(
      "Two honest qualifications: Montblanc and Castelló d'Empúries are historic **towns** rather than small villages, and are included because they answer the same question; and Siurana and Miravet are worth the journey as much for the setting as for the buildings.",
    ),
    table(
      "The 10 at a glance",
      ["Place", "Region", "What sets it apart"],
      [
        ["Besalú", "Garrotxa", "Fortified bridge and Jewish heritage"],
        ["Peratallada", "Baix Empordà", "Exceptionally preserved stone village"],
        ["Pals", "Baix Empordà", "Clock tower and views over the plain"],
        ["Montblanc", "Conca de Barberà", "One of Catalonia's great town walls"],
        ["Guimerà", "Urgell", "Stepped streets below a castle"],
        ["Rupit", "Collsacabra", "Stone houses, suspension bridge, landscape"],
        ["Santa Pau", "Garrotxa", "Arcaded square in volcanic country"],
        ["Castelló d'Empúries", "Alt Empordà", "Former county capital with a great basilica"],
        ["Miravet", "Ribera d'Ebre", "Templar castle above the Ebro"],
        ["Siurana", "Priorat", "Village on a clifftop"],
      ],
    ),
    ...h2(
      "1. Besalú",
      "The medieval bridge over the Fluvià is Besalú's famous image, and also its trap: many visitors arrive, photograph it and leave.",
      "The real interest is inside the town — a legible medieval street plan, Romanesque churches and exceptional Jewish heritage including the mikveh, a ritual bath. It is one of very few places in Spain where the physical organisation of a medieval Jewish community can still be read on the ground.",
    ),
    ...h2(
      "2. Peratallada",
      "One of the best-preserved medieval settlements in the Empordà, and probably the one that most convincingly feels like stepping into another century.",
      "Stone dominates the streets, arches, walls and squares. The village is small, so go early or late: narrow lanes and weekend crowds do not mix.",
      `Visitor information: [visitperatallada.cat](${PERATALLADA}).`,
    ),
    ...h2(
      "3. Pals",
      "The old quarter of Pals keeps its walls, cobbled streets, the Torre de les Hores clock tower and a viewpoint across the Empordà plain to the sea.",
      "It pairs naturally with Peratallada in a single day — they are close together.",
      `Visitor information: [visitpals.com](${PALS}).`,
    ),
    ...h2(
      "4. Montblanc",
      "Montblanc's distinction is its wall: not a surviving fragment but a fortified perimeter that still encircles much of the town.",
      "This is a living medieval town with churches, streets and a centre large enough to fill a full day. If you want medieval scale rather than a picturesque corner, choose this one.",
    ),
    ...h2(
      "5. Guimerà",
      "Guimerà's streets climb steeply towards the ruins of its castle. The stepped, labyrinthine layout conveys the reality of a medieval hill settlement better than almost anywhere: narrow, vertical, shaped entirely by the terrain.",
      "The town holds a long-running medieval market. Check this year's dates on the municipal website before planning around it.",
      `Information: [guimera.info](${GUIMERA}).`,
    ),
    ...h2(
      "6. Rupit",
      "Rupit combines stone architecture, narrow lanes, a suspension footbridge over the river and the cliffs of the Collsacabra.",
      "It is busy at weekends, so arriving early genuinely changes the experience.",
      `Information: [rupitpruit.cat](${RUPIT}).`,
    ),
    ...h2(
      "7. Santa Pau",
      "In the heart of volcanic Garrotxa, Santa Pau combines an arcaded square, a castle and historic streets with one of Catalonia's most unusual landscapes.",
      "It is the best of these to combine with a walk in the natural park: heritage in the morning, volcanic cones and beech forest in the afternoon.",
    ),
    ...h2(
      "8. Castelló d'Empúries",
      "The former capital of the counts of Empúries, and a reminder that the medieval Empordà was far more than small stone villages.",
      "It preserves its Jewish quarter, sections of wall, narrow streets and the monumental basilica of Santa Maria — known locally as the cathedral of the Empordà.",
      `Information: [castelloempuriabrava.com](${CASTELLO}).`,
    ),
    ...h2(
      "9. Miravet",
      "Miravet is dominated by its Templar castle above the Ebro, one of the most dramatically sited fortresses in the country.",
      "The old village climbs the slope beneath it, and a traditional cable ferry still crosses the river — one of the most distinctive things you can do in the region.",
    ),
    ...h2(
      "10. Siurana",
      "The clifftop setting matters as much as the village itself. Siurana combines medieval remains, the Romanesque church of Santa Maria and one of the most recognisable views in the Priorat.",
      "It was one of the last Andalusi strongholds in Catalonia, which explains the position: nobody arrives here by accident.",
    ),
    callout("warning", "Opening hours", HOURS_NOTE.en),
    ...h2(
      "If you can only pick three",
      "For concentrated medieval architecture: Peratallada.",
      "For scale: Montblanc.",
      "For landscape: Siurana or Miravet.",
      "For a first day in the Empordà: Pals and Peratallada together.",
      `For heritage even fewer people reach, ${link("surprising", "en", "we have fifteen places most visitors miss")}. To get there without a car, ${link("trains", "en", "these twelve trips are all doable by train")}.`,
    ),
    ...relatedBlocks(["surprising", "montserrat", "trains", "rainy", "castanyada"], "en"),
  ];
}

export const MEDIEVAL: FeatureArticle = {
  key: "medieval",
  entryKey: "feature-medieval-villages",
  categoryKey: "villages",
  heroKey: "pobles-medievals-catalunya-carrers-pedra",
  secondaryKey: "vila-medieval-catalunya-muralles",
  heroAlt: {
    ca: "Carrers de pedra d'un nucli medieval català",
    es: "Calles de piedra de un núcleo medieval catalán",
    en: "Stone streets of a Catalan medieval village",
  },
  heroCaption: {
    ca: "Imatge representativa d'un nucli medieval català; no correspon a cap poble concret. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de un núcleo medieval catalán; no corresponde a ningún pueblo concreto. Ilustración generada con inteligencia artificial.",
    en: "Representative image of a Catalan medieval village; it does not depict any specific place. Illustration generated with artificial intelligence.",
  },
  secondaryAlt: {
    ca: "Carrer empedrat d'una vila medieval catalana",
    es: "Calle empedrada de una villa medieval catalana",
    en: "Cobbled street in a Catalan medieval town",
  },
  secondaryCaption: {
    ca: "Imatge representativa d'un carrer medieval; no correspon a cap vila concreta. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de una calle medieval; no corresponde a ninguna villa concreta. Ilustración generada con inteligencia artificial.",
    en: "Representative image of a medieval street; it does not depict any specific town. Illustration generated with artificial intelligence.",
  },
  sources: [
    { name: "Patrimoni Cultural de Catalunya", url: PATRIMONI, publisher: "Generalitat de Catalunya" },
    { name: "Turisme de Peratallada", url: PERATALLADA, publisher: "Ajuntament de Forallac" },
    { name: "Visit Pals", url: PALS, publisher: "Ajuntament de Pals" },
    { name: "Turisme de Rupit i Pruit", url: RUPIT, publisher: "Ajuntament de Rupit i Pruit" },
    { name: "Guimerà", url: GUIMERA, publisher: "Ajuntament de Guimerà" },
    { name: "Castelló d'Empúries — turisme", url: CASTELLO, publisher: "Ajuntament de Castelló d'Empúries" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.medieval.ca,
      title: "10 pobles medievals de Catalunya que has de visitar almenys una vegada",
      seoTitle: "10 pobles medievals de Catalunya imprescindibles",
      seoDescription:
        "Deu nuclis medievals de Catalunya, de l'Empordà al Priorat: què conserva cadascun, com es combinen i què cal comprovar abans d'anar-hi.",
      excerpt:
        "De Besalú a Siurana: deu nuclis medievals, què conserva cadascun i quins es poden combinar en una mateixa jornada.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.medieval.es,
      title: "10 pueblos medievales de Cataluña que tienes que visitar al menos una vez",
      seoTitle: "10 pueblos medievales de Cataluña imprescindibles",
      seoDescription:
        "Diez núcleos medievales de Cataluña, del Empordà al Priorat: qué conserva cada uno, cómo combinarlos y qué comprobar antes de ir.",
      excerpt:
        "De Besalú a Siurana: diez núcleos medievales, qué conserva cada uno y cuáles se combinan en una misma jornada.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.medieval.en,
      title: "10 medieval villages in Catalonia worth leaving Barcelona for",
      seoTitle: "10 best medieval villages in Catalonia",
      seoDescription:
        "Ten medieval villages and towns across Catalonia, from the Empordà to the Priorat, with what survives in each and how to combine them.",
      excerpt:
        "From Besalú to Siurana: ten medieval places, what survives in each, and which ones pair naturally in a single day.",
      blocks: en(),
    },
  },
};
