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
 *
 * Re-checked on 24 October 2026 against the managing bodies' own pages
 * (patrimoni.gencat.cat collection pages, Cardona Turisme):
 * - Sant Pere de Rodes church "aixecada entre els segles X i XI" (it was
 *   "segle X" before, which the record does not say); 7 EUR, free on the last
 *   Tuesday of the month, October to June.
 * - Casserres: begun 1005, church consecrated 1050, "meandre molt pronunciat
 *   del riu Ter". The claim that it is surrounded by water since the Sau
 *   reservoir was built is not in the record and was removed. Seasonal hours
 *   and 5 EUR.
 * - Ullastret: "l'assentament iber més gran descobert fins ara a Catalunya";
 *   winter hours and 7 EUR.
 * - Vallbona: founded in the 12th century and still a female Cistercian
 *   house; "continuously inhabited since" is not on the monastery's page and
 *   was removed.
 * - Molí d'Espígol: visits by prior booking only.
 * - Claramunt: 10th-century frontier castle; 6 EUR.
 * - Corbera: destroyed in the Battle of the Ebre (1938); 3 EUR self-guided.
 * - Jardins Artigas: designed by Gaudí in 1905, per the Patrimoni record.
 * - Escaladei: founded 1163, the first charterhouse in the peninsula; 7 EUR.
 * - Cardona salt mountain: guided, Tuesday to Sunday, 12.75 EUR adult.
 * Hours are given only where the record states them; elsewhere the reader is
 * sent to the managing body.
 */

const PATRIMONI = "https://patrimoni.gencat.cat/";
const COL = "https://patrimoni.gencat.cat/ca/coleccio/";
const RODES = `${COL}monestir-de-sant-pere-de-rodes`;
const ESCALADEI = `${COL}cartoixa-descaladei`;
const CASSERRES = `${COL}monestir-de-sant-pere-de-casserres`;
const ULLASTRET = `${COL}ciutat-iberica-dullastret`;
const CLARAMUNT = `${COL}castell-de-claramunt`;
const CORBERA = `${COL}poble-vell-de-corbera-debre`;
const ESPIGOL = `${COL}moli-despigol`;
const ARTIGAS = `${COL}jardins-artigas`;
const CARDONA_SAL = "https://cardonaturisme.cat/activitats/visita-muntanya-sal/";
const VALLBONA = "https://www.monestirvallbona.cat/";

type Row = [string, string, string];

/** [place, ticket, hours or how to visit] per locale, from the official pages. */
const PRACTICAL: Record<"ca" | "es" | "en", Row[]> = {
  ca: [
    ["Muntanya de Sal (Cardona)", "12,75 € adults", "Visita guiada, de dimarts a diumenge"],
    ["Sant Pere de Casserres", "5 €", "Fins al 30 de desembre: dc-ds 11-16.30 h, dg 11-15 h; tancat al gener"],
    ["Poble Vell de Corbera d'Ebre", "3 € (visita lliure)", "Horaris a poblevell.cat"],
    ["Ciutat ibèrica d'Ullastret", "7 € (amb museu i audioguia)", "D'octubre a maig, dt-dg 10-18 h; dilluns tancat"],
    ["Molí d'Espígol (Tornabous)", "—", "Només amb reserva prèvia"],
    ["Castell de Claramunt", "6 €", "Gratuït l'últim dimecres de mes, d'octubre a juny"],
    ["Sant Pere de Rodes", "7 €", "Gratuït l'últim dimarts de mes, d'octubre a juny"],
    ["Cartoixa d'Escaladei", "7 €", "Gratuït l'últim dimarts de mes, d'octubre a juny"],
    ["Castellfollit de la Roca", "Lliure", "És un poble: s'hi entra a peu"],
  ],
  es: [
    ["Montaña de Sal (Cardona)", "12,75 € adultos", "Visita guiada, de martes a domingo"],
    ["Sant Pere de Casserres", "5 €", "Hasta el 30 de diciembre: mi-sá 11-16:30, do 11-15; cerrado en enero"],
    ["Poble Vell de Corbera d'Ebre", "3 € (visita libre)", "Horarios en poblevell.cat"],
    ["Ciudad ibérica de Ullastret", "7 € (con museo y audioguía)", "De octubre a mayo, ma-do 10-18; lunes cerrado"],
    ["Molí d'Espígol (Tornabous)", "—", "Solo con reserva previa"],
    ["Castell de Claramunt", "6 €", "Gratis el último miércoles de mes, de octubre a junio"],
    ["Sant Pere de Rodes", "7 €", "Gratis el último martes de mes, de octubre a junio"],
    ["Cartoixa d'Escaladei", "7 €", "Gratis el último martes de mes, de octubre a junio"],
    ["Castellfollit de la Roca", "Libre", "Es un pueblo: se entra a pie"],
  ],
  en: [
    ["Cardona Salt Mountain", "€12.75 adults", "Guided visit, Tuesday to Sunday"],
    ["Sant Pere de Casserres", "€5", "Until 30 December: Wed-Sat 11:00-16:30, Sun 11:00-15:00; closed in January"],
    ["Old village of Corbera d'Ebre", "€3 (self-guided)", "Hours at poblevell.cat"],
    ["Ullastret Iberian city", "€7 (with museum and audio guide)", "October to May, Tue-Sun 10:00-18:00; closed Mondays"],
    ["Molí d'Espígol (Tornabous)", "—", "By prior booking only"],
    ["Claramunt castle", "€6", "Free on the last Wednesday of the month, October to June"],
    ["Sant Pere de Rodes", "€7", "Free on the last Tuesday of the month, October to June"],
    ["Escaladei charterhouse", "€7", "Free on the last Tuesday of the month, October to June"],
    ["Castellfollit de la Roca", "Free", "It is a village: you walk in"],
  ],
};

const PRACTICAL_COPY = {
  ca: {
    title: "Preus i horaris: el que diu cada monument",
    caption: "Entrada general i horari dels llocs que el publiquen",
    headers: ["Lloc", "Entrada general", "Horari o com visitar-lo"],
    note: "Comprovat el 24 d'octubre de 2026 a la fitxa oficial de cada lloc (Patrimoni Cultural i Cardona Turisme). Gairebé tots demanen cotxe des de Barcelona.",
  },
  es: {
    title: "Precios y horarios: lo que dice cada monumento",
    caption: "Entrada general y horario de los lugares que lo publican",
    headers: ["Lugar", "Entrada general", "Horario o cómo visitarlo"],
    note: "Comprobado el 24 de octubre de 2026 en la ficha oficial de cada lugar (Patrimoni Cultural y Cardona Turisme). Casi todos piden coche desde Barcelona.",
  },
  en: {
    title: "Prices and opening times: what each site says",
    caption: "General admission and hours for the sites that publish them",
    headers: ["Place", "General admission", "Hours or how to visit"],
    note: "Checked on 24 October 2026 against each site's official listing (Patrimoni Cultural and Cardona Turisme). Almost all of them need a car from Barcelona.",
  },
};

function practical(locale: "ca" | "es" | "en"): Block[] {
  const c = PRACTICAL_COPY[locale];
  return [...h2(c.title), table(c.caption, c.headers, PRACTICAL[locale], c.note)];
}

function ca(): Block[] {
  return [
    lead(
      "Els llocs més sorprenents de Catalunya que queden fora del circuit habitual: la **Muntanya de Sal de Cardona**, el monestir de **Sant Pere de Casserres** en un meandre del Ter, la **ciutat ibèrica d'Ullastret**, les petjades de dinosaure de **Fumanya**, el poble sobre la cinglera de **Castellfollit de la Roca**, **Sant Pere de Rodes** sobre el Cap de Creus i la **Cartoixa d'Escaladei**, entre d'altres. Aquí tens els quinze, amb preus i horaris oficials.",
    ),
    ...paras(
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
    ...practical("ca"),
    ...h2(
      "1. Muntanya de Sal de Cardona",
      "Un aflorament de sal gemma de dimensions excepcionals, explotat des de l'antiguitat i visitable per dins. Els colors i les formes de les galeries no s'assemblen a cap altra cosa del país.",
      "A sobre hi ha el castell de Cardona i la col·legiata de Sant Vicenç. La combinació de fortalesa medieval i mina és el que fa que aquesta visita no tingui equivalent.",
      `La visita és guiada, de dimarts a diumenge, i l'entrada d'adult costa 12,75 €; cal arribar 30 minuts abans i el casc és obligatori ([Cardona Turisme](${CARDONA_SAL})). Com arribar-hi des de Barcelona, a ${link("montserrat", "ca", "les escapades més enllà de Montserrat")}.`,
    ),
    ...h2(
      "2. Sant Pere de Casserres",
      "El monestir benedictí s'aixeca en un meandre molt pronunciat del Ter. Es va començar a construir l'any 1005 i l'església es va consagrar el 1050, segons Patrimoni Cultural.",
      `És romànic del segle XI en un emplaçament que costa de creure fins que s'hi arriba. Fins al 30 de desembre obre de dimecres a dissabte d'11 a 16.30 h i diumenge d'11 a 15 h; al gener tanca ([fitxa oficial](${CASSERRES})).`,
    ),
    ...h2(
      "3. Castell i Col·legiata de Mur",
      "Al Pallars Jussà, el conjunt de Mur reuneix un castell del segle XI i una col·legiata romànica en un turó aïllat amb una panoràmica enorme sobre la Conca de Tremp.",
      "És un dels llocs on millor s'entén què volia dir «frontera» a la Catalunya alt-medieval.",
    ),
    ...h2(
      "4. Poble Vell de Corbera d'Ebre",
      "El nucli antic, a primera línia del front republicà, va quedar destruït pels bombardeigs durant la batalla de l'Ebre, el 1938, i s'ha conservat en ruïnes deliberadament, com a espai de memòria.",
      `No és una visita còmoda ni pretén ser-ho. És una de les més necessàries del país. La visita lliure costa 3 € ([fitxa oficial](${CORBERA})).`,
    ),
    ...h2(
      "5. Monestir de Vallbona de les Monges",
      "Un dels tres grans monestirs cistercencs catalans, amb Poblet i Santes Creus, i l'únic femení. Fundat al segle XII, continua sent un cenobi cistercenc de monges.",
      `El claustre, amb galeries d'èpoques diferents, és el que més sorprèn. Horaris de visita: [monestirvallbona.cat](${VALLBONA}).`,
    ),
    ...h2(
      "6. Ciutat ibèrica d'Ullastret",
      "Segons Patrimoni Cultural, és l'assentament ibèric més gran descobert fins ara a Catalunya, capital del territori dels indigets. Muralles, carrers, cisternes i sitges permeten entendre com era una ciutat ibèrica abans de l'arribada de Roma.",
      `És a pocs minuts dels pobles medievals de l'Empordà: es combinen molt bé en un mateix dia (${link("medieval", "ca", "pobles medievals de Catalunya")}). D'octubre a maig obre de dimarts a diumenge de 10 a 18 h; l'entrada, amb museu i audioguia, costa 7 € ([fitxa oficial](${ULLASTRET})).`,
    ),
    ...h2(
      "7. Molí d'Espígol",
      "A Tornabous, un poblat ibèric dels ilergets on l'urbanisme es llegeix sorprenentment bé sobre el terreny: carrers, cases, sistema defensiu.",
      `És la parada que converteix una visita a la plana de Lleida en una altra cosa. Només es visita amb reserva prèvia ([fitxa oficial](${ESPIGOL})).`,
    ),
    ...h2(
      "8. Castell de Claramunt",
      "A l'Anoia, una fortalesa del segle X que formava part de la xarxa de castells de frontera entre el comtat de Barcelona i al-Àndalus, restaurada i visitable, amb un domini visual enorme sobre la comarca.",
      `És dels castells catalans on més fàcil resulta entendre la funció militar de l'edifici. Entrada, 6 €; gratuïta l'últim dimecres de cada mes, d'octubre a juny ([fitxa oficial](${CLARAMUNT})).`,
    ),
    ...h2(
      "9. Fumanya",
      "Al Berguedà, una antiga explotació a cel obert va deixar al descobert una paret gairebé vertical amb centenars de petjades de dinosaures del Cretaci.",
      "És un dels jaciments d'icnites més importants d'Europa, i el context miner li dona una lectura doble.",
    ),
    ...h2(
      "10. Jardins Artigas",
      "A la Pobla de Lillet, al costat del riu Llobregat, un jardí de pedra amb ponts i grutes que Gaudí va dissenyar el 1905 per a l'industrial Joan Artigas, segons Patrimoni Cultural.",
      `Els horaris els publica l'Ajuntament de la Pobla de Lillet ([fitxa oficial](${ARTIGAS})). És una parada natural si segueixes ${link("gaudi", "ca", "la seva obra menys coneguda")}.`,
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
      "Un gran monestir benedictí penjat sobre el Cap de Creus, amb una església aixecada entre els segles X i XI i una panoràmica que arriba fins al golf de Roses.",
      `És dels pocs llocs on el romànic i el paisatge marítim es donen alhora. Entrada, 7 €; gratuïta l'últim dimarts de cada mes, d'octubre a juny ([fitxa oficial](${RODES})).`,
    ),
    ...h2(
      "15. Cartoixa d'Escaladei",
      "Fundada el 1163, va ser la primera de totes les cartoixes de la península Ibèrica, i la influència dels seus monjos va donar nom a tota la comarca: el Priorat.",
      `Les ruïnes són extenses i s'hi ha reconstruït una cel·la, que és el que permet entendre com vivien realment els cartoixans. Entrada, 7 €; gratuïta l'últim dimarts de cada mes, d'octubre a juny ([fitxa oficial](${ESCALADEI})).`,
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
      "Los lugares más sorprendentes de Cataluña fuera del circuito habitual: la **Montaña de Sal de Cardona**, el monasterio de **Sant Pere de Casserres** en un meandro del Ter, la **ciudad ibérica de Ullastret**, las huellas de dinosaurio de **Fumanya**, el pueblo sobre el risco de **Castellfollit de la Roca**, **Sant Pere de Rodes** sobre el Cap de Creus y la **Cartoixa d'Escaladei**, entre otros. Aquí tienes los quince, con precios y horarios oficiales.",
    ),
    ...paras(
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
    ...practical("es"),
    ...h2(
      "1. Montaña de Sal de Cardona",
      "Un afloramiento de sal gema de dimensiones excepcionales, explotado desde la antigüedad y visitable por dentro. Los colores y las formas de las galerías no se parecen a nada más del país.",
      "Encima está el castillo de Cardona y la colegiata de Sant Vicenç. La combinación de fortaleza medieval y mina no tiene equivalente.",
      `La visita es guiada, de martes a domingo, y la entrada de adulto cuesta 12,75 €; hay que llegar 30 minutos antes y el casco es obligatorio ([Cardona Turisme](${CARDONA_SAL})). Cómo llegar desde Barcelona, en ${link("montserrat", "es", "las escapadas más allá de Montserrat")}.`,
    ),
    ...h2(
      "2. Sant Pere de Casserres",
      "El monasterio benedictino se levanta en un meandro muy pronunciado del Ter. Se empezó a construir en 1005 y la iglesia se consagró en 1050, según Patrimoni Cultural.",
      `Románico del siglo XI en un emplazamiento que cuesta creer hasta que se llega. Hasta el 30 de diciembre abre de miércoles a sábado de 11:00 a 16:30 y el domingo de 11:00 a 15:00; en enero cierra ([ficha oficial](${CASSERRES})).`,
    ),
    ...h2(
      "3. Castillo y Colegiata de Mur",
      "En el Pallars Jussà, el conjunto de Mur reúne un castillo del siglo XI y una colegiata románica en un cerro aislado con una panorámica enorme sobre la Conca de Tremp.",
    ),
    ...h2(
      "4. Poble Vell de Corbera d'Ebre",
      "El casco antiguo, en primera línea del frente republicano, quedó destruido por los bombardeos durante la batalla del Ebro, en 1938, y se ha conservado en ruinas deliberadamente, como espacio de memoria.",
      `No es una visita cómoda ni pretende serlo. Es de las más necesarias del país. La visita libre cuesta 3 € ([ficha oficial](${CORBERA})).`,
    ),
    ...h2(
      "5. Monasterio de Vallbona de les Monges",
      "Uno de los tres grandes monasterios cistercienses catalanes, junto a Poblet y Santes Creus, y el único femenino. Fundado en el siglo XII, sigue siendo un cenobio cisterciense de monjas.",
      `Horarios de visita: [monestirvallbona.cat](${VALLBONA}).`,
    ),
    ...h2(
      "6. Ciudad ibérica de Ullastret",
      "Según Patrimoni Cultural, es el asentamiento ibérico más grande descubierto hasta ahora en Cataluña, capital del territorio de los indigetes. Murallas, calles, cisternas y silos permiten entender cómo era una ciudad ibérica antes de Roma.",
      `Está a pocos minutos de los ${link("medieval", "es", "pueblos medievales del Empordà")}: se combinan bien en un mismo día. De octubre a mayo abre de martes a domingo de 10:00 a 18:00; la entrada, con museo y audioguía, cuesta 7 € ([ficha oficial](${ULLASTRET})).`,
    ),
    ...h2(
      "7. Molí d'Espígol",
      "En Tornabous, un poblado ibérico de los ilergetes donde el urbanismo se lee sorprendentemente bien sobre el terreno.",
      `Solo se visita con reserva previa ([ficha oficial](${ESPIGOL})).`,
    ),
    ...h2(
      "8. Castell de Claramunt",
      "En la Anoia, una fortaleza del siglo X que formaba parte de la red de castillos de frontera entre el condado de Barcelona y al-Ándalus, restaurada y visitable, con un dominio visual enorme sobre la comarca.",
      `Entrada, 6 €; gratis el último miércoles de cada mes, de octubre a junio ([ficha oficial](${CLARAMUNT})).`,
    ),
    ...h2(
      "9. Fumanya",
      "En el Berguedà, una antigua explotación a cielo abierto dejó al descubierto una pared casi vertical con centenares de huellas de dinosaurios del Cretácico.",
      "Es uno de los yacimientos de icnitas más importantes de Europa.",
    ),
    ...h2(
      "10. Jardins Artigas",
      "En La Pobla de Lillet, junto al Llobregat, un jardín de piedra con puentes y grutas que Gaudí diseñó en 1905 para el industrial Joan Artigas, según Patrimoni Cultural.",
      `Los horarios los publica el Ayuntamiento de La Pobla de Lillet ([ficha oficial](${ARTIGAS})). Parada natural si sigues ${link("gaudi", "es", "su obra menos conocida")}.`,
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
      "Un gran monasterio benedictino colgado sobre el Cap de Creus, con una iglesia levantada entre los siglos X y XI y una panorámica que llega hasta el golfo de Roses.",
      `Entrada, 7 €; gratis el último martes de cada mes, de octubre a junio ([ficha oficial](${RODES})).`,
    ),
    ...h2(
      "15. Cartoixa d'Escaladei",
      "Fundada en 1163, fue la primera de todas las cartujas de la península Ibérica, y la influencia de sus monjes dio nombre a toda la comarca: el Priorat.",
      `Las ruinas son extensas y se ha reconstruido una celda, que es lo que permite entender cómo vivían realmente los cartujos. Entrada, 7 €; gratis el último martes de cada mes, de octubre a junio ([ficha oficial](${ESCALADEI})).`,
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
      "The best hidden places in Catalonia, outside the usual circuit: **Cardona's Salt Mountain**, the monastery of **Sant Pere de Casserres** in a bend of the river Ter, the **Iberian city of Ullastret**, the dinosaur tracks of **Fumanya**, the clifftop village of **Castellfollit de la Roca**, **Sant Pere de Rodes** above Cap de Creus and the **Escaladei charterhouse**, among others. Here are all fifteen, with official prices and opening times.",
    ),
    ...paras(
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
    ...practical("en"),
    ...h2(
      "1. Cardona Salt Mountain",
      "An exceptionally large outcrop of rock salt, mined since antiquity and open to visit inside. The colours and shapes of the galleries resemble nothing else in the country.",
      "Above it stand Cardona castle and the collegiate church of Sant Vicenç. That combination of medieval fortress and mine has no equivalent here.",
      `Visits are guided, Tuesday to Sunday, and adult tickets cost €12.75; arrive 30 minutes early, and helmets are compulsory ([Cardona Turisme](${CARDONA_SAL})). For getting there from Barcelona, see ${link("montserrat", "en", "our day trips beyond Montserrat")}.`,
    ),
    ...h2(
      "2. Sant Pere de Casserres",
      "A Benedictine monastery standing in a very tight meander of the river Ter. Building began in 1005 and the church was consecrated in 1050, according to the Catalan heritage agency.",
      `The setting is hard to believe until you arrive. Until 30 December it opens Wednesday to Saturday 11:00 to 16:30 and Sunday 11:00 to 15:00; it closes in January ([official listing](${CASSERRES})).`,
    ),
    ...h2(
      "3. Mur castle and collegiate church",
      "In the Pallars Jussà, an 11th-century castle and a Romanesque collegiate church share an isolated hill with an enormous view over the Tremp basin.",
      "Few places make the meaning of 'frontier' in early medieval Catalonia so physically obvious.",
    ),
    ...h2(
      "4. The old village of Corbera d'Ebre",
      "The old centre, on the Republican front line, was destroyed by bombing during the Battle of the Ebro in 1938 and has deliberately been left in ruins as a memorial.",
      `It is not a comfortable visit and does not try to be. It is one of the most necessary in the country. A self-guided visit costs €3 ([official listing](${CORBERA})).`,
    ),
    ...h2(
      "5. Vallbona de les Monges",
      "One of Catalonia's three great Cistercian monasteries alongside Poblet and Santes Creus, and the only one for women. Founded in the 12th century, it is still a Cistercian convent.",
      `The cloister, built across several periods, is the part that surprises most. Visiting hours: [monestirvallbona.cat](${VALLBONA}).`,
    ),
    ...h2(
      "6. Ullastret Iberian city",
      "According to the Catalan heritage agency, the largest Iberian settlement discovered so far in Catalonia, and the capital of the Indiketes. Walls, streets, cisterns and grain silos make it possible to understand a pre-Roman Iberian city.",
      `It is minutes from the ${link("medieval", "en", "medieval villages of the Empordà")}, so the two combine easily in a day. From October to May it opens Tuesday to Sunday, 10:00 to 18:00; the €7 ticket includes the museum and an audio guide ([official listing](${ULLASTRET})).`,
    ),
    ...h2(
      "7. Molí d'Espígol",
      "An Iberian town of the Ilergetes at Tornabous, where the town planning reads unusually clearly on the ground: streets, houses, defensive system.",
      `Visits are by prior booking only ([official listing](${ESPIGOL})).`,
    ),
    ...h2(
      "8. Claramunt castle",
      "In the Anoia, a 10th-century fortress from the chain of frontier castles between the County of Barcelona and al-Andalus, restored and open to visit, with commanding views. One of the Catalan castles where the military logic of the building is easiest to read.",
      `Admission €6; free on the last Wednesday of each month from October to June ([official listing](${CLARAMUNT})).`,
    ),
    ...h2(
      "9. Fumanya",
      "In the Berguedà, open-cast mining exposed a near-vertical rock face carrying hundreds of Cretaceous dinosaur footprints.",
      "It is one of Europe's most important trackway sites, and the mining context gives it a second reading.",
    ),
    ...h2(
      "10. Artigas Gardens",
      "At La Pobla de Lillet, beside the river Llobregat, a stone garden with bridges and grottoes that Gaudí designed in 1905 for the industrialist Joan Artigas, according to the Catalan heritage agency.",
      `Opening times are published by La Pobla de Lillet town council ([official listing](${ARTIGAS})). A natural stop if you are following ${link("gaudi", "en", "his lesser-known work")}.`,
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
      "A large Benedictine monastery hung above Cap de Creus, with a church built between the 10th and 11th centuries and a view reaching the gulf of Roses.",
      `One of very few places where Romanesque architecture and Mediterranean landscape arrive together. Admission €7; free on the last Tuesday of each month from October to June ([official listing](${RODES})).`,
    ),
    ...h2(
      "15. Escaladei charterhouse",
      "Founded in 1163, it was the first of all the charterhouses later built across the Iberian peninsula, and its monks' influence gave the whole region its name: the Priorat.",
      `The ruins are extensive, and a monk's cell has been reconstructed, which is what makes the Carthusian way of life legible. Admission €7; free on the last Tuesday of each month from October to June ([official listing](${ESCALADEI})).`,
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
  heroKey: "surprising-hero",
  secondaryKey: "surprising-second",
  heroAlt: {
    ca: "Castellfollit de la Roca, sobre la cinglera basaltica",
    es: "Castellfollit de la Roca, sobre el risco basaltico",
    en: "Castellfollit de la Roca on its basalt cliff",
  },
  heroCaption: {
    ca: "Castellfollit de la Roca, aixecat al capdamunt d'una cinglera de basalt a la Garrotxa.",
    es: "Castellfollit de la Roca, levantado sobre un risco de basalto en la Garrotxa.",
    en: "Castellfollit de la Roca, built on top of a basalt cliff in the Garrotxa.",
  },
  secondaryAlt: {
    ca: "El monestir de Sant Pere de Rodes, a l'Alt Emporda",
    es: "El monasterio de Sant Pere de Rodes, en el Alt Emporda",
    en: "Sant Pere de Rodes monastery, in the Alt Emporda",
  },
  secondaryCaption: {
    ca: "Sant Pere de Rodes, sobre el Cap de Creus.",
    es: "Sant Pere de Rodes, sobre el Cap de Creus.",
    en: "Sant Pere de Rodes, above Cap de Creus.",
  },
  sources: [
    { name: "Patrimoni Cultural de Catalunya", url: PATRIMONI, publisher: "Generalitat de Catalunya" },
    { name: "Monestir de Sant Pere de Rodes", url: RODES, publisher: "Patrimoni Cultural de Catalunya" },
    { name: "Cartoixa d'Escaladei", url: ESCALADEI, publisher: "Patrimoni Cultural de Catalunya" },
    { name: "Monestir de Sant Pere de Casserres", url: CASSERRES, publisher: "Patrimoni Cultural de Catalunya" },
    { name: "Ciutat ibèrica d'Ullastret", url: ULLASTRET, publisher: "Patrimoni Cultural de Catalunya" },
    { name: "Castell de Claramunt", url: CLARAMUNT, publisher: "Patrimoni Cultural de Catalunya" },
    { name: "Poble Vell de Corbera d'Ebre", url: CORBERA, publisher: "Patrimoni Cultural de Catalunya" },
    { name: "Molí d'Espígol", url: ESPIGOL, publisher: "Patrimoni Cultural de Catalunya" },
    { name: "Jardins Artigas", url: ARTIGAS, publisher: "Patrimoni Cultural de Catalunya" },
    { name: "Visita a la Muntanya de Sal", url: CARDONA_SAL, publisher: "Cardona Turisme" },
    { name: "Monestir de Vallbona de les Monges", url: VALLBONA, publisher: "Monestir de Vallbona" },
  ],
  editions: {
    ca: {
      path: ARTICLE_PATHS.surprising.ca,
      title: "15 llocs sorprenents de Catalunya que molts encara no coneixen",
      seoTitle: "15 llocs sorprenents de Catalunya poc coneguts",
      seoDescription:
        "Llocs sorprenents de Catalunya fora del circuit: la Muntanya de Sal, Casserres, Ullastret, Fumanya, Castellfollit i més, amb preus i horaris oficials.",
      excerpt:
        "Mines de sal, monestirs en meandres, jaciments ibèrics i petjades de dinosaure: quinze llocs que queden fora del circuit habitual.",
      blocks: ca(),
    },
    es: {
      path: ARTICLE_PATHS.surprising.es,
      title: "15 lugares sorprendentes de Cataluña que muchos todavía no conocen",
      seoTitle: "15 lugares sorprendentes y bonitos de Cataluña",
      seoDescription:
        "Lugares sorprendentes y bonitos de Cataluña fuera del circuito: Montaña de Sal, Casserres, Ullastret, Fumanya, Castellfollit y más, con precios y horarios.",
      excerpt:
        "Minas de sal, monasterios en meandros, yacimientos ibéricos y huellas de dinosaurio: quince lugares fuera del circuito habitual.",
      blocks: es(),
    },
    en: {
      path: ARTICLE_PATHS.surprising.en,
      title: "15 hidden places in Catalonia most visitors still miss",
      seoTitle: "15 hidden places in Catalonia most visitors miss",
      seoDescription:
        "Hidden places in Catalonia off the usual circuit: Cardona's Salt Mountain, Casserres, Ullastret, Fumanya, Castellfollit and more, with official prices and hours.",
      excerpt:
        "Salt mines, monasteries in river meanders, Iberian cities and dinosaur footprints: fifteen places outside the usual circuit.",
      blocks: en(),
    },
  },
};
