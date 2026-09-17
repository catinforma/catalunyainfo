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
 * Article 9 — fifteen places most visitors miss.
 *
 * Deliberately not called "secret". Every one of these is known locally, most
 * are managed heritage sites with opening hours, and several are on the
 * Generalitat's own heritage route. What is true is that they sit outside the
 * circuit most international visitors follow, which is a different and honest
 * claim.
 *
 * La Mussara was dropped in favour of the Escaladei charterhouse: access to
 * the abandoned village is awkward and unmanaged, and sending readers there is
 * not the same kind of recommendation as sending them to a monument with a
 * ticket desk.
 */

const PATRIMONI = "https://patrimoni.gencat.cat/";

function ca(): Block[] {
  return [
    lead(
      "Cap d'aquests llocs és un secret. Gairebé tots són coneguts a la seva comarca i molts tenen entrada, horari i personal. El que passa és que queden fora del circuit que segueix la majoria de visitants, i això els converteix en una de les millors maneres de veure Catalunya sense fer cua.",
    ),
    table(
      "Els 15 llocs",
      ["Lloc", "Comarca", "Per què sorprèn"],
      [
        ["Muntanya de Sal", "Bages (Cardona)", "Una mina de sal sota un castell"],
        ["Sant Pere de Casserres", "Osona", "Monestir romànic en un meandre del Ter"],
        ["Castell i Col·legiata de Mur", "Pallars Jussà", "Conjunt romànic aïllat amb vistes immenses"],
        ["Poble Vell de Corbera d'Ebre", "Terra Alta", "Poble en ruïnes conservat com a memòria"],
        ["Vallbona de les Monges", "Urgell", "Monestir cistercenc habitat des del segle XII"],
        ["Ciutat ibèrica d'Ullastret", "Baix Empordà", "El jaciment ibèric més gran de Catalunya"],
        ["Molí d'Espígol", "Urgell (Tornabous)", "Urbanisme ibèric llegible sobre el terreny"],
        ["Castell de Claramunt", "Anoia", "Fortalesa de frontera restaurada"],
        ["Fumanya", "Berguedà", "Petjades de dinosaure en una paret vertical"],
        ["Jardins Artigas", "Berguedà (La Pobla de Lillet)", "Jardí d'inspiració gaudiniana"],
        ["Coves Meravelles", "Baix Ebre (Benifallet)", "Formacions càrstiques a l'Ebre"],
        ["Estany d'Ivars i Vila-sana", "Pla d'Urgell", "Un llac recuperat després de mig segle sec"],
        ["Castellfollit de la Roca", "Garrotxa", "Poble sobre una cinglera basàltica"],
        ["Sant Pere de Rodes", "Alt Empordà", "Monestir sobre el Cap de Creus"],
        ["Cartoixa d'Escaladei", "Priorat", "La cartoixa que va donar nom al Priorat"],
      ],
    ),
    ...h2(
      "1. Muntanya de Sal de Cardona",
      "Un aflorament de sal gemma de dimensions excepcionals, explotat des de l'antiguitat i visitable per dins. Els colors i les formes de les galeries no s'assemblen a cap altra cosa del país.",
      "A sobre hi ha el castell de Cardona i la col·legiata de Sant Vicenç. La combinació de fortalesa medieval i mina és el que fa que aquesta visita no tingui equivalent.",
    ),
    ...h2(
      "2. Sant Pere de Casserres",
      "El monestir benedictí s'aixeca en un meandre tancat del Ter, envoltat d'aigua per gairebé tots costats des que es va construir el pantà de Sau.",
      "És romànic del segle XI en un emplaçament que costa de creure fins que s'hi arriba.",
    ),
    ...h2(
      "3. Castell i Col·legiata de Mur",
      "Al Pallars Jussà, el conjunt de Mur reuneix un castell del segle XI i una col·legiata romànica en un turó aïllat amb una panoràmica enorme sobre la Conca de Tremp.",
      "És un dels llocs on millor s'entén què volia dir «frontera» a la Catalunya alt-medieval.",
    ),
    ...h2(
      "4. Poble Vell de Corbera d'Ebre",
      "El nucli antic va quedar destruït durant la batalla de l'Ebre i s'ha conservat en ruïnes deliberadament, com a espai de memòria.",
      "No és una visita còmoda ni pretén ser-ho. És una de les més necessàries del país.",
    ),
    ...h2(
      "5. Monestir de Vallbona de les Monges",
      "Un dels tres grans monestirs cistercencs catalans, amb Poblet i Santes Creus, i l'únic femení. Està habitat de manera continuada des del segle XII.",
      "El claustre, amb galeries de èpoques diferents, és el que més sorprèn.",
    ),
    ...h2(
      "6. Ciutat ibèrica d'Ullastret",
      "El poblat ibèric més gran excavat de Catalunya. Muralles, carrers, cisternes i sitges permeten entendre com era una ciutat indigeta abans de l'arribada de Roma.",
      "És, a més, a pocs minuts dels pobles medievals de l'Empordà: es combinen molt bé en un mateix dia.",
    ),
    ...h2(
      "7. Molí d'Espígol",
      "A Tornabous, un altre jaciment ibèric on l'urbanisme es llegeix sorprenentment bé sobre el terreny: carrers, cases, sistema defensiu.",
      "És la parada que converteix una visita a la plana de Lleida en una altra cosa.",
    ),
    ...h2(
      "8. Castell de Claramunt",
      "A l'Anoia, una fortalesa de frontera de grans dimensions restaurada i visitable, amb un domini visual enorme sobre la comarca.",
      "És dels castells catalans on més fàcil resulta entendre la funció militar de l'edifici.",
    ),
    ...h2(
      "9. Fumanya",
      "Al Berguedà, una antiga explotació a cel obert va deixar al descobert una paret gairebé vertical amb centenars de petjades de dinosaures del Cretaci.",
      "És un dels jaciments d'icnites més importants d'Europa, i el context miner li dona una lectura doble.",
    ),
    ...h2(
      "10. Jardins Artigas",
      "A la Pobla de Lillet, un jardí construït amb pedra local que combina ponts, grutes i formes d'inspiració gaudiniana al costat del riu Llobregat.",
      `Es documenta la intervenció de Gaudí a la zona durant la seva estada al Berguedà. És una parada natural si segueixes ${link("gaudi", "ca", "la seva obra menys coneguda")}.`,
    ),
    ...h2(
      "11. Coves Meravelles de Benifallet",
      "A la riba de l'Ebre, un conjunt de cavitats amb formacions càrstiques molt desenvolupades.",
      "Comprova sempre les condicions d'obertura abans d'anar-hi: les visites a coves poden suspendre's per pluges intenses o per avisos de seguretat.",
    ),
    ...h2(
      "12. Estany d'Ivars i Vila-sana",
      "Va ser dessecat el 1951 i es va recuperar a partir del 2005. Avui és un dels millors punts d'observació d'ocells de la plana de Lleida.",
      "El que sorprèn no és només el paisatge: és que un estany desaparegut es pogués tornar a omplir.",
    ),
    ...h2(
      "13. Castellfollit de la Roca",
      "El poble s'aixeca al capdamunt d'una cinglera basàltica de desenes de metres, formada per antigues colades de lava.",
      "La imatge des de baix és coneguda; el que gairebé ningú fa és pujar al poble i caminar-hi.",
    ),
    ...h2(
      "14. Sant Pere de Rodes",
      "Un gran monestir benedictí penjat sobre el Cap de Creus, amb una església del segle X i una panoràmica que arriba fins al golf de Roses.",
      "És dels pocs llocs on el romànic i el paisatge marítim es donen alhora.",
    ),
    ...h2(
      "15. Cartoixa d'Escaladei",
      "La primera cartoixa de la península Ibèrica, fundada al segle XII, és literalment l'origen del nom del Priorat.",
      "Les ruïnes són extenses i s'hi ha reconstruït una cel·la sencera, que és el que permet entendre com vivien realment els cartoixans: en solitud, amb un jardí propi.",
    ),
    callout(
      "warning",
      "Comprova abans de sortir",
      "Molts d'aquests llocs són monuments gestionats amb horaris de temporada, i alguns tanquen dies feiners a l'hivern. Les coves, a més, poden suspendre visites per condicions meteorològiques. Consulta sempre la fitxa oficial el mateix dia.",
    ),
    ...paras(
      `La majoria d'aquests conjunts tenen fitxa al catàleg de [Patrimoni Cultural de la Generalitat](${PATRIMONI}), que és la millor font per comprovar estat i accés.`,
      `Si vols una ruta més convencional però igualment fora del circuit, ${link("medieval", "ca", "aquí hi ha deu pobles medievals")}.`,
    ),
    ...relatedBlocks(["medieval", "montserrat", "rainy", "trains", "gaudi"], "ca"),
  ];
}

function es(): Block[] {
  return [
    lead(
      "Ninguno de estos lugares es un secreto. Casi todos son conocidos en su comarca y muchos tienen entrada, horario y personal. Lo que ocurre es que quedan fuera del circuito que sigue la mayoría de visitantes, y eso los convierte en una de las mejores formas de ver Cataluña sin hacer cola.",
    ),
    table(
      "Los 15 lugares",
      ["Lugar", "Comarca", "Por qué sorprende"],
      [
        ["Montaña de Sal", "Bages (Cardona)", "Una mina de sal bajo un castillo"],
        ["Sant Pere de Casserres", "Osona", "Monasterio románico en un meandro del Ter"],
        ["Castillo y Colegiata de Mur", "Pallars Jussà", "Conjunto románico aislado con vistas inmensas"],
        ["Poble Vell de Corbera d'Ebre", "Terra Alta", "Pueblo en ruinas conservado como memoria"],
        ["Vallbona de les Monges", "Urgell", "Monasterio cisterciense habitado desde el siglo XII"],
        ["Ciudad ibérica de Ullastret", "Baix Empordà", "El yacimiento ibérico más grande de Cataluña"],
        ["Molí d'Espígol", "Urgell (Tornabous)", "Urbanismo ibérico legible sobre el terreno"],
        ["Castell de Claramunt", "Anoia", "Fortaleza de frontera restaurada"],
        ["Fumanya", "Berguedà", "Huellas de dinosaurio en una pared vertical"],
        ["Jardins Artigas", "Berguedà (La Pobla de Lillet)", "Jardín de inspiración gaudiniana"],
        ["Coves Meravelles", "Baix Ebre (Benifallet)", "Formaciones cársticas junto al Ebro"],
        ["Estany d'Ivars i Vila-sana", "Pla d'Urgell", "Un lago recuperado tras medio siglo seco"],
        ["Castellfollit de la Roca", "Garrotxa", "Pueblo sobre un risco basáltico"],
        ["Sant Pere de Rodes", "Alt Empordà", "Monasterio sobre el Cap de Creus"],
        ["Cartoixa d'Escaladei", "Priorat", "La cartuja que dio nombre al Priorat"],
      ],
    ),
    ...h2(
      "1. Montaña de Sal de Cardona",
      "Un afloramiento de sal gema de dimensiones excepcionales, explotado desde la antigüedad y visitable por dentro. Los colores y las formas de las galerías no se parecen a nada más del país.",
      "Encima está el castillo de Cardona y la colegiata de Sant Vicenç. La combinación de fortaleza medieval y mina no tiene equivalente.",
    ),
    ...h2(
      "2. Sant Pere de Casserres",
      "El monasterio benedictino se levanta en un meandro cerrado del Ter, rodeado de agua por casi todos lados desde la construcción del pantano de Sau.",
      "Románico del siglo XI en un emplazamiento que cuesta creer hasta que se llega.",
    ),
    ...h2(
      "3. Castillo y Colegiata de Mur",
      "En el Pallars Jussà, el conjunto de Mur reúne un castillo del siglo XI y una colegiata románica en un cerro aislado con una panorámica enorme sobre la Conca de Tremp.",
    ),
    ...h2(
      "4. Poble Vell de Corbera d'Ebre",
      "El casco antiguo quedó destruido durante la batalla del Ebro y se ha conservado en ruinas deliberadamente, como espacio de memoria.",
      "No es una visita cómoda ni pretende serlo. Es de las más necesarias del país.",
    ),
    ...h2(
      "5. Monasterio de Vallbona de les Monges",
      "Uno de los tres grandes monasterios cistercienses catalanes, junto a Poblet y Santes Creus, y el único femenino. Habitado de forma continuada desde el siglo XII.",
    ),
    ...h2(
      "6. Ciudad ibérica de Ullastret",
      "El poblado ibérico más grande excavado de Cataluña. Murallas, calles, cisternas y silos permiten entender cómo era una ciudad indigete antes de Roma.",
      "Está a pocos minutos de los pueblos medievales del Empordà: se combinan bien en un mismo día.",
    ),
    ...h2(
      "7. Molí d'Espígol",
      "En Tornabous, otro yacimiento ibérico donde el urbanismo se lee sorprendentemente bien sobre el terreno.",
    ),
    ...h2(
      "8. Castell de Claramunt",
      "En la Anoia, una fortaleza de frontera de gran tamaño, restaurada y visitable, con un dominio visual enorme sobre la comarca.",
    ),
    ...h2(
      "9. Fumanya",
      "En el Berguedà, una antigua explotación a cielo abierto dejó al descubierto una pared casi vertical con centenares de huellas de dinosaurios del Cretácico.",
      "Es uno de los yacimientos de icnitas más importantes de Europa.",
    ),
    ...h2(
      "10. Jardins Artigas",
      "En La Pobla de Lillet, un jardín construido con piedra local que combina puentes, grutas y formas de inspiración gaudiniana junto al Llobregat.",
      `Parada natural si sigues ${link("gaudi", "es", "su obra menos conocida")}.`,
    ),
    ...h2(
      "11. Coves Meravelles de Benifallet",
      "En la ribera del Ebro, un conjunto de cavidades con formaciones cársticas muy desarrolladas.",
      "Comprueba siempre las condiciones de apertura: las visitas a cuevas pueden suspenderse por lluvias intensas o avisos de seguridad.",
    ),
    ...h2(
      "12. Estany d'Ivars i Vila-sana",
      "Fue desecado en 1951 y se recuperó a partir de 2005. Hoy es uno de los mejores puntos de observación de aves de la llanura de Lleida.",
    ),
    ...h2(
      "13. Castellfollit de la Roca",
      "El pueblo se levanta sobre un risco basáltico de decenas de metros, formado por antiguas coladas de lava.",
      "La imagen desde abajo es conocida; lo que casi nadie hace es subir al pueblo y caminarlo.",
    ),
    ...h2(
      "14. Sant Pere de Rodes",
      "Un gran monasterio benedictino colgado sobre el Cap de Creus, con una iglesia del siglo X y una panorámica que llega hasta el golfo de Roses.",
    ),
    ...h2(
      "15. Cartoixa d'Escaladei",
      "La primera cartuja de la península Ibérica, fundada en el siglo XII, es literalmente el origen del nombre del Priorat.",
      "Las ruinas son extensas y se ha reconstruido una celda entera, que es lo que permite entender cómo vivían realmente los cartujos.",
    ),
    callout(
      "warning",
      "Comprueba antes de salir",
      "Muchos de estos lugares son monumentos gestionados con horarios de temporada, y algunos cierran entre semana en invierno. Las cuevas pueden suspender visitas por meteorología. Consulta la ficha oficial el mismo día.",
    ),
    ...paras(
      `La mayoría tienen ficha en el catálogo de [Patrimoni Cultural de la Generalitat](${PATRIMONI}).`,
      `Si quieres una ruta más convencional pero igualmente fuera del circuito, ${link("medieval", "es", "aquí hay diez pueblos medievales")}.`,
    ),
    ...relatedBlocks(["medieval", "montserrat", "rainy", "trains", "gaudi"], "es"),
  ];
}

function en(): Block[] {
  return [
    lead(
      "None of these places is a secret. Almost all are well known in their own region, and most are managed heritage sites with tickets, opening hours and staff. What is true is that they sit outside the circuit most international visitors follow — which makes them one of the best ways to see Catalonia without queueing.",
    ),
    ...paras(
      "Catalan geography, briefly: the **Priorat** and **Terra Alta** are inland wine regions in the south; the **Berguedà** and **Pallars** are pre-Pyrenean; the **Empordà** is the coastal plain in the north-east; the **Garrotxa** is volcanic country inland from it.",
    ),
    table(
      "The 15 places",
      ["Place", "Region", "Why it surprises"],
      [
        ["Cardona Salt Mountain", "Bages", "A salt mine beneath a castle"],
        ["Sant Pere de Casserres", "Osona", "Romanesque monastery in a river meander"],
        ["Mur castle and collegiate church", "Pallars Jussà", "Isolated Romanesque site with vast views"],
        ["Old village of Corbera d'Ebre", "Terra Alta", "A ruined village kept as a memorial"],
        ["Vallbona de les Monges", "Urgell", "Cistercian monastery inhabited since the 12th century"],
        ["Ullastret Iberian city", "Baix Empordà", "Catalonia's largest excavated Iberian settlement"],
        ["Molí d'Espígol", "Urgell", "Iberian town planning still legible on the ground"],
        ["Claramunt castle", "Anoia", "A restored frontier fortress"],
        ["Fumanya", "Berguedà", "Dinosaur footprints on a vertical wall"],
        ["Artigas Gardens", "Berguedà", "A garden in the Gaudí idiom"],
        ["Benifallet caves", "Baix Ebre", "Karst formations beside the Ebro"],
        ["Ivars and Vila-sana lake", "Pla d'Urgell", "A lake refilled after half a century dry"],
        ["Castellfollit de la Roca", "Garrotxa", "A village on top of a basalt cliff"],
        ["Sant Pere de Rodes", "Alt Empordà", "A monastery above Cap de Creus"],
        ["Escaladei charterhouse", "Priorat", "The monastery that gave the Priorat its name"],
      ],
    ),
    ...h2(
      "1. Cardona Salt Mountain",
      "An exceptionally large outcrop of rock salt, mined since antiquity and open to visit inside. The colours and shapes of the galleries resemble nothing else in the country.",
      "Above it stand Cardona castle and the collegiate church of Sant Vicenç. That combination of medieval fortress and working mine has no equivalent here.",
    ),
    ...h2(
      "2. Sant Pere de Casserres",
      "An 11th-century Benedictine monastery standing in a tight meander of the river Ter, surrounded by water on almost every side since the Sau reservoir was built.",
      "The setting is hard to believe until you arrive.",
    ),
    ...h2(
      "3. Mur castle and collegiate church",
      "In the Pallars Jussà, an 11th-century castle and a Romanesque collegiate church share an isolated hill with an enormous view over the Tremp basin.",
      "Few places make the meaning of 'frontier' in early medieval Catalonia so physically obvious.",
    ),
    ...h2(
      "4. The old village of Corbera d'Ebre",
      "The old centre was destroyed during the Battle of the Ebro in 1938 and has deliberately been left in ruins as a memorial.",
      "It is not a comfortable visit and does not try to be. It is one of the most necessary in the country.",
    ),
    ...h2(
      "5. Vallbona de les Monges",
      "One of Catalonia's three great Cistercian monasteries alongside Poblet and Santes Creus, and the only one for women. It has been continuously inhabited since the 12th century.",
      "The cloister, built across several periods, is the part that surprises most.",
    ),
    ...h2(
      "6. Ullastret Iberian city",
      "The largest excavated Iberian settlement in Catalonia. Walls, streets, cisterns and grain silos make it possible to understand a pre-Roman Iberian city.",
      "It is minutes from the medieval villages of the Empordà, so the two combine easily in a day.",
    ),
    ...h2(
      "7. Molí d'Espígol",
      "Another Iberian site, at Tornabous, where the town planning reads unusually clearly on the ground: streets, houses, defensive system.",
    ),
    ...h2(
      "8. Claramunt castle",
      "In the Anoia, a large restored frontier fortress with commanding views. One of the Catalan castles where the military logic of the building is easiest to read.",
    ),
    ...h2(
      "9. Fumanya",
      "In the Berguedà, open-cast mining exposed a near-vertical rock face carrying hundreds of Cretaceous dinosaur footprints.",
      "It is one of Europe's most important trackway sites, and the mining context gives it a second reading.",
    ),
    ...h2(
      "10. Artigas Gardens",
      "At La Pobla de Lillet, a garden of local stone with bridges, grottoes and forms in the Gaudí idiom, beside the river Llobregat.",
      `A natural stop if you are following ${link("gaudi", "en", "his lesser-known work")}.`,
    ),
    ...h2(
      "11. Benifallet caves",
      "On the bank of the Ebro, a set of caves with strongly developed karst formations.",
      "Always check opening conditions: cave visits can be suspended after heavy rain or on safety advice.",
    ),
    ...h2(
      "12. Ivars and Vila-sana lake",
      "Drained in 1951 and refilled from 2005 onwards. It is now one of the best birdwatching sites on the Lleida plain.",
      "What surprises is not only the landscape but the fact that a vanished lake could be brought back at all.",
    ),
    ...h2(
      "13. Castellfollit de la Roca",
      "The village stands on top of a basalt cliff tens of metres high, formed by ancient lava flows.",
      "The view from below is well known. What almost nobody does is go up into the village and walk it.",
    ),
    ...h2(
      "14. Sant Pere de Rodes",
      "A large Benedictine monastery hung above Cap de Creus, with a 10th-century church and a view reaching the gulf of Roses.",
      "One of very few places where Romanesque architecture and Mediterranean landscape arrive together.",
    ),
    ...h2(
      "15. Escaladei charterhouse",
      "The first Carthusian monastery on the Iberian peninsula, founded in the 12th century, and literally the origin of the name Priorat.",
      "The ruins are extensive, and one complete cell has been reconstructed — which is what makes the Carthusian way of life, solitary and with a private garden, finally legible.",
    ),
    callout(
      "warning",
      "Check before you travel",
      "Many of these are managed monuments with seasonal hours, and some close on weekdays in winter. Cave visits can be suspended for weather. Check the official listing on the day.",
    ),
    ...paras(
      `Most of these sites have a record in the [Catalan heritage catalogue](${PATRIMONI}), which is the best place to check status and access.`,
      `For a more conventional route that is still off the circuit, ${link("medieval", "en", "here are ten medieval villages")}.`,
    ),
    ...relatedBlocks(["medieval", "montserrat", "rainy", "trains", "gaudi"], "en"),
  ];
}

export const SURPRISING: FeatureArticle = {
  key: "surprising",
  entryKey: "feature-surprising-places",
  categoryKey: "outdoors",
  heroKey: "llocs-sorprenents-catalunya-paisatge",
  secondaryKey: "catalunya-amagada-patrimoni",
  heroAlt: {
    ca: "Paisatge singular de l'interior de Catalunya",
    es: "Paisaje singular del interior de Cataluña",
    en: "A striking inland Catalan landscape",
  },
  heroCaption: {
    ca: "Imatge representativa d'un paisatge de l'interior de Catalunya. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de un paisaje del interior de Cataluña. Ilustración generada con inteligencia artificial.",
    en: "Representative image of an inland Catalan landscape. Illustration generated with artificial intelligence.",
  },
  secondaryAlt: {
    ca: "Patrimoni històric poc visitat de Catalunya",
    es: "Patrimonio histórico poco visitado de Cataluña",
    en: "Little-visited historic heritage in Catalonia",
  },
  secondaryCaption: {
    ca: "Imatge representativa de patrimoni històric català; no correspon a cap monument concret. Il·lustració generada amb intel·ligència artificial.",
    es: "Imagen representativa de patrimonio histórico catalán; no corresponde a ningún monumento concreto. Ilustración generada con inteligencia artificial.",
    en: "Representative image of Catalan historic heritage; it does not depict any specific monument. Illustration generated with artificial intelligence.",
  },
  sources: [
    { name: "Patrimoni Cultural de Catalunya", url: PATRIMONI, publisher: "Generalitat de Catalunya" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.surprising.ca,
      title: "15 llocs sorprenents de Catalunya que molts encara no coneixen",
      seoTitle: "15 llocs sorprenents de Catalunya",
      seoDescription:
        "Quinze llocs de Catalunya fora del circuit habitual: mines, monestirs, jaciments ibèrics, petjades de dinosaure i pobles sobre cingleres.",
      excerpt:
        "Mines de sal, monestirs en meandres, jaciments ibèrics i petjades de dinosaure: quinze llocs que queden fora del circuit habitual.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.surprising.es,
      title: "15 lugares sorprendentes de Cataluña que muchos todavía no conocen",
      seoTitle: "15 lugares sorprendentes de Cataluña",
      seoDescription:
        "Quince lugares de Cataluña fuera del circuito habitual: minas, monasterios, yacimientos ibéricos, huellas de dinosaurio y pueblos sobre riscos.",
      excerpt:
        "Minas de sal, monasterios en meandros, yacimientos ibéricos y huellas de dinosaurio: quince lugares fuera del circuito habitual.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.surprising.en,
      title: "15 incredible places in Catalonia most tourists still miss",
      seoTitle: "15 places in Catalonia most visitors miss",
      seoDescription:
        "Fifteen places in Catalonia outside the usual circuit: salt mines, isolated monasteries, Iberian cities, dinosaur tracks and clifftop villages.",
      excerpt:
        "Salt mines, monasteries in river meanders, Iberian cities and dinosaur footprints: fifteen places outside the usual circuit.",
      blocks: en(),
    },
  },
};
