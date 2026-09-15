import type { Locale } from "@/lib/i18n/config";

/**
 * Weekly mycological report: conditions for mushroom fruiting in Catalonia.
 *
 * Written by the editorial team. Two rules run through the whole text and are
 * worth stating once here, because they are what separates this page from the
 * "10 best spots" articles it competes with:
 *
 *  1. **Favourable conditions are not mushrooms.** Every rating compares
 *     rainfall, temperature and forest context. None of it is an observation of
 *     mushrooms, and the page says so wherever a reader might assume otherwise.
 *  2. **No exact locations.** Ratings are by comarca or broad sector. Publishing
 *     coordinates of productive woodland would concentrate pressure on it, and
 *     much Catalan forest is privately owned, mushrooms included.
 *
 * Figures are Meteocat station readings verified on 2026-09-13. A station
 * reading describes that station, not every hectare of its comarca.
 */

/** Condition levels. Deliberately qualitative: we have no probability to quote. */
export type Level = "very" | "favourable" | "interesting" | "patchy" | "low";

export const LEVEL_LABEL: Record<Level, Record<Locale, string>> = {
  very: { ca: "Molt favorables", es: "Muy favorables", en: "Very favourable" },
  favourable: { ca: "Favorables", es: "Favorables", en: "Favourable" },
  interesting: { ca: "Interessants", es: "Interesantes", en: "Interesting" },
  patchy: { ca: "Encara irregulars", es: "Todavía irregulares", en: "Still patchy" },
  low: { ca: "Poc favorables", es: "Poco favorables", en: "Less favourable" },
};

export interface Zone {
  id: string;
  level: Level;
  name: Record<Locale, string>;
  /** The headline figure, already formatted per language. */
  figure: Record<Locale, string>;
  /** One line of editorial reading. */
  reading: Record<Locale, string>;
  /** Section heading and prose for the body. */
  heading: Record<Locale, string>;
  body: Record<Locale, string[]>;
}

export const ZONES: Zone[] = [
  {
    id: "ripolles",
    level: "very",
    name: { ca: "Ripollès / Alt Ter", es: "Ripollès / Alt Ter", en: "Ripollès / upper Ter" },
    figure: {
      ca: "81,5 mm a Sant Joan de les Abadesses",
      es: "81,5 mm en Sant Joan de les Abadesses",
      en: "81.5 mm at Sant Joan de les Abadesses",
    },
    reading: {
      ca: "Millor conjunt actual de variables",
      es: "Mejor conjunto actual de variables",
      en: "Best current combination of factors",
    },
    heading: {
      ca: "1. Ripollès i Alt Ter: les millors condicions relatives",
      es: "1. Ripollès y Alt Ter: las mejores condiciones relativas",
      en: "1. Ripollès and the upper Ter valley",
    },
    body: {
      ca: [
        "El Ripollès és ara mateix el sector que destaca més clarament en les dades. Meteocat registra durant el setembre **81,5 mm** a Sant Joan de les Abadesses, **58,2 mm** a Sant Pau de Segúries i **37,4 mm** a Molló-Fabert.",
        "Sant Joan de les Abadesses encapçala actualment el resum mensual de precipitació de les estacions automàtiques de Meteocat. A més, l'altitud i les temperatures nocturnes més baixes juguen a favor d'aquest sector respecte a les zones més càlides del país.",
        "La previsió apunta encara a calor durant l'inici de setmana, però també a una baixada de temperatura i possibles xàfecs entre dimecres i dijous, cosa que pot ajudar a mantenir o recuperar humitat al sòl.",
        "Això no significa que tots els boscos del Ripollès tinguin bolets.",
      ],
      es: [
        "El Ripollès es el territorio que más destaca actualmente. Meteocat registra este mes **81,5 mm** en Sant Joan de les Abadesses, **58,2 mm** en Sant Pau de Segúries y **37,4 mm** en Molló-Fabert.",
        "Sant Joan de les Abadesses encabeza ahora mismo el resumen mensual de precipitaciones de Meteocat. A esto se suma la altitud y unas noches más frescas que en buena parte del resto de Cataluña.",
        "La previsión indica todavía calor al inicio de semana, seguido de un descenso térmico y posibilidad de chubascos a mitad de semana. Son factores interesantes, aunque no permiten garantizar la presencia de setas.",
      ],
      en: [
        "The Ripollès currently stands out most clearly. September rainfall recorded by Meteocat includes **81.5 mm** at Sant Joan de les Abadesses, **58.2 mm** at Sant Pau de Segúries and **37.4 mm** at Molló-Fabert.",
        "Sant Joan de les Abadesses currently leads Meteocat's monthly rainfall summary. Higher elevation and cooler nights also give the area an advantage over warmer parts of Catalonia.",
        "The beginning of the week is expected to remain warm, before temperatures fall and showers become possible around midweek. These factors may help soil moisture, but they do not guarantee mushrooms.",
      ],
    },
  },
  {
    id: "bergueda",
    level: "favourable",
    name: { ca: "Nord del Berguedà", es: "Norte del Berguedà", en: "Northern Berguedà" },
    figure: {
      ca: "65,2 mm a la Quar · 58,0 mm a Castellar de n'Hug",
      es: "65,2 mm en La Quar · 58,0 mm en Castellar de n'Hug",
      en: "65.2 mm at La Quar · 58.0 mm at Castellar de n'Hug",
    },
    reading: {
      ca: "Bona evolució, però temporada encara inicial",
      es: "Buena evolución, pero temporada aún inicial",
      en: "Improving, but the season is still early",
    },
    heading: {
      ca: "2. Nord del Berguedà: una de les zones a seguir",
      es: "2. Norte del Berguedà: una zona a vigilar",
      en: "2. Northern Berguedà",
    },
    body: {
      ca: [
        "El Berguedà presenta alguns dels registres més destacats de Catalunya aquest setembre: la Quar acumula **65,2 mm** i Castellar de n'Hug arriba als **58,0 mm**. Són valors importants després d'un estiu especialment complicat.",
        "El Mercat del Bolet de Cal Rosal ja ha començat la temporada, però les informacions de camp publicades el 12 de setembre descrivien encara una producció baixa i molt localitzada.",
        "El Berguedà és, per tant, una de les zones amb més potencial de millora, però encara no es pot parlar d'una temporada plenament activa.",
      ],
      es: [
        "La Quar acumula **65,2 mm** en septiembre y Castellar de n'Hug **58,0 mm**. Estas cantidades sitúan varios sectores del Berguedà entre los territorios con mejores condiciones relativas.",
        "Sin embargo, la realidad sobre el terreno continúa siendo irregular. Las primeras informaciones de la temporada hablaban todavía de producciones pequeñas y localizadas.",
      ],
      en: [
        "September rainfall has reached **65.2 mm at La Quar** and **58.0 mm at Castellar de n'Hug**. That puts parts of northern Berguedà among the strongest areas on current weather data.",
        "Field reports at the start of the season, however, still describe mushroom production as sparse and highly localised.",
      ],
    },
  },
  {
    id: "garrotxa",
    level: "favourable",
    name: { ca: "Garrotxa / Vall d'en Bas", es: "Garrotxa / Vall d'en Bas", en: "Garrotxa / Vall d'en Bas" },
    figure: {
      ca: "55,1 mm a Olot · 47,8 mm a la Vall d'en Bas",
      es: "55,1 mm en Olot · 47,8 mm en la Vall d'en Bas",
      en: "55.1 mm at Olot · 47.8 mm at Vall d'en Bas",
    },
    reading: {
      ca: "Humitat i bosc favorable",
      es: "Humedad y bosque favorable",
      en: "Humid forest, favourable ground",
    },
    heading: {
      ca: "3. Garrotxa i Vall d'en Bas: bon punt de partida",
      es: "3. Garrotxa y Vall d'en Bas",
      en: "3. Garrotxa and Vall d'en Bas",
    },
    body: {
      ca: [
        "Olot acumula **55,1 mm** durant el setembre i la Vall d'en Bas arriba als **47,8 mm**.",
        "Els seus boscos habitualment humits, combinats amb la precipitació recent, situen la comarca entre les zones més interessants aquesta setmana. La clau serà que no s'encadeni un nou període llarg de calor i vent sec.",
      ],
      es: [
        "Olot acumula **55,1 mm** y la Vall d'en Bas **47,8 mm** durante septiembre.",
        "La combinación de lluvia reciente y bosques habitualmente húmedos hace que la Garrotxa sea uno de los territorios a seguir. El mantenimiento de la humedad durante los próximos días será clave.",
      ],
      en: [
        "Olot has recorded **55.1 mm** of rain in September and Vall d'en Bas **47.8 mm**.",
        "Recent rainfall combined with naturally humid forest environments makes this one of the areas worth watching. Whether moisture persists during the coming days will matter.",
      ],
    },
  },
  {
    id: "osona",
    level: "interesting",
    name: { ca: "Osona / Collsacabra", es: "Osona / Collsacabra", en: "Osona / Collsacabra" },
    figure: { ca: "52,9 mm a Vic", es: "52,9 mm en Vic", en: "52.9 mm at Vic" },
    reading: {
      ca: "Més irregular entre sectors",
      es: "Más irregular entre sectores",
      en: "More uneven between sectors",
    },
    heading: {
      ca: "4. Osona i Collsacabra: interessants però irregulars",
      es: "4. Osona y Collsacabra",
      en: "4. Osona and Collsacabra",
    },
    body: {
      ca: [
        "Vic acumula **52,9 mm** aquest setembre. És una xifra destacable, però les condicions poden variar molt entre la plana, els boscos més elevats i les zones del Collsacabra.",
        "Per això no és prudent classificar tota la comarca al mateix nivell que el Ripollès. Els sectors frescos i humits són els que cal seguir més de prop.",
      ],
      es: [
        "Vic acumula **52,9 mm** durante septiembre. Es una cifra importante, pero la situación puede cambiar mucho entre la Plana de Vic y las zonas boscosas de mayor altitud.",
        "Los sectores más frescos y húmedos son los que parten con mayor ventaja.",
      ],
      en: [
        "Vic has recorded **52.9 mm** so far this September. That is substantial, but conditions differ considerably between the Vic plain and cooler, higher forest areas.",
        "The latter are more interesting at this point in the season.",
      ],
    },
  },
  {
    id: "pirineu",
    level: "patchy",
    name: {
      ca: "Cerdanya / Alt Urgell / Pallars",
      es: "Cerdanya / Alt Urgell / Pallars",
      en: "Cerdanya / Alt Urgell / Pallars",
    },
    figure: {
      ca: "Temperatures nocturnes baixes",
      es: "Temperaturas nocturnas bajas",
      en: "Cool nights, high elevation",
    },
    reading: {
      ca: "Depèn molt de la pluja local",
      es: "Depende mucho de la lluvia local",
      en: "Depends heavily on local rainfall",
    },
    heading: {
      ca: "5. Cerdanya, Alt Urgell i Pallars: potencial molt local",
      es: "5. Cerdanya, Alt Urgell y Pallars",
      en: "5. Cerdanya, Alt Urgell and the Pallars",
    },
    body: {
      ca: [
        "Les zones altes del Pirineu tenen un avantatge evident pel que fa a temperatures nocturnes i altitud, però la precipitació ha estat molt irregular.",
        "Això pot provocar diferències enormes entre valls pròximes: és possible trobar sectors amb bones condicions al costat de boscos encara massa secs. No generalitzem a escala de comarca.",
      ],
      es: [
        "La altitud y las temperaturas nocturnas más bajas juegan a favor. El problema es una distribución de la lluvia muy irregular.",
        "Dos valles próximos pueden presentar condiciones muy diferentes, así que no sería correcto clasificar toda la zona como favorable.",
      ],
      en: [
        "Higher elevations and cool nights are positive factors. Rainfall, however, has been uneven.",
        "Two neighbouring valleys may currently have very different soil moisture conditions, so it would be misleading to label the whole region as favourable.",
      ],
    },
  },
  {
    id: "montseny",
    level: "patchy",
    name: { ca: "Montseny / Prelitoral", es: "Montseny / Prelitoral", en: "Montseny / pre-coastal ranges" },
    figure: {
      ca: "51,7 mm a l'Observatori Fabra · 48,1 mm a Castellbisbal",
      es: "51,7 mm en el Observatori Fabra · 48,1 mm en Castellbisbal",
      en: "51.7 mm at the Fabra Observatory · 48.1 mm at Castellbisbal",
    },
    reading: {
      ca: "Encara aviat en general",
      es: "Todavía pronto en general",
      en: "Generally still early",
    },
    heading: {
      ca: "6. Montseny i prelitoral: encara és aviat",
      es: "6. Montseny y prelitoral",
      en: "6. Montseny and the pre-coastal ranges",
    },
    body: {
      ca: [
        "Alguns punts del prelitoral han rebut quantitats importants de precipitació durant setembre: l'Observatori Fabra acumula **51,7 mm** i Castellbisbal **48,1 mm**.",
        "Aquestes dades no s'han d'interpretar com una activació general de la temporada boletaire a tot el prelitoral. A mitjan setembre, les zones de muntanya del Pirineu i Prepirineu acostumen a disposar d'un context tèrmic més favorable.",
        "El Montseny i altres serralades prelitorals poden guanyar protagonisme més endavant si les pluges continuen.",
      ],
      es: [
        "Algunos puntos han recibido cantidades importantes de agua: el Observatori Fabra registra **51,7 mm** en septiembre y Castellbisbal **48,1 mm**.",
        "Pero esto no significa que el conjunto del prelitoral esté ya en plena temporada. En esta época del año, Pirineo y Prepirineo suelen contar con una ventaja térmica.",
      ],
      en: [
        "Some areas around Barcelona and the pre-coastal ranges have seen substantial September rain: **51.7 mm** at the Fabra Observatory and **48.1 mm** at Castellbisbal.",
        "That does not mean mushroom season is fully active across the pre-coastal mountains. At this stage of September, higher Pyrenean and pre-Pyrenean areas generally have a temperature advantage.",
      ],
    },
  },
  {
    id: "ponent",
    level: "low",
    name: {
      ca: "Ponent / litoral / sud",
      es: "Poniente / litoral / sur",
      en: "Western, coastal and southern Catalonia",
    },
    figure: {
      ca: "Estiu molt sec en àmplies zones",
      es: "Verano muy seco en amplias zonas",
      en: "A very dry summer across large areas",
    },
    reading: {
      ca: "Esperar nous episodis de pluja",
      es: "Esperar nuevos episodios de lluvia",
      en: "Waiting on further rain",
    },
    heading: {
      ca: "7. Ponent, litoral i sud: paciència",
      es: "7. Poniente, litoral y sur",
      en: "7. Western, coastal and southern Catalonia",
    },
    body: {
      ca: [
        "L'estiu ha estat especialment sec en moltes d'aquestes zones. Un episodi puntual de pluja pot millorar la situació localment, però ara mateix no hi ha prou base per situar-les entre les zones prioritàries.",
        "Aquest mapa pot canviar ràpidament amb les primeres pluges generals de tardor.",
      ],
      es: [
        "El verano ha sido especialmente seco en buena parte del oeste y sur de Cataluña. Nuevos episodios de lluvia pueden modificar rápidamente esta situación.",
        "Por ahora no son las zonas que presentan el mejor conjunto de variables.",
      ],
      en: [
        "Large areas of western and southern Catalonia experienced a particularly dry summer. Future autumn rain could change the situation quickly.",
        "For now, these regions do not show the same combination of favourable factors as the northern mountain areas.",
      ],
    },
  },
];

export const SOURCES = [
  {
    name: { ca: "Dades meteorològiques de Meteocat", es: "Datos meteorológicos de Meteocat", en: "Meteocat weather-station data" },
    url: "https://m.meteo.cat/resum-dades",
    publisher: "Servei Meteorològic de Catalunya",
  },
  {
    name: { ca: "Butlletí climàtic estacional — estiu 2026", es: "Boletín climático estacional — verano 2026", en: "Seasonal climate bulletin — summer 2026" },
    url: "https://www.meteo.cat/wpweb/climatologia/butlletins-i-episodis-meteorologics/butlleti-estacional/",
    publisher: "Servei Meteorològic de Catalunya",
  },
  {
    name: { ca: "Butlletí climàtic mensual", es: "Boletín climático mensual", en: "Monthly climate bulletin" },
    url: "https://www.meteo.cat/wpweb/climatologia/butlletins-i-episodis-meteorologics/butlleti-mensual/",
    publisher: "Servei Meteorològic de Catalunya",
  },
  {
    name: { ca: "Manual d'itineraris de gestió micològica a Catalunya", es: "Manual de itinerarios de gestión micológica en Cataluña", en: "Handbook of mycological management itineraries in Catalonia" },
    url: "https://ctfc.cat/docs/Manual_itineraris_de_gestio_micologica_a_Catalunya.pdf",
    publisher: "Centre de Ciència i Tecnologia Forestal de Catalunya",
  },
  {
    name: { ca: "Intoxicacions per bolets", es: "Intoxicaciones por setas", en: "Mushroom poisoning" },
    url: "https://canalsalut.gencat.cat/ca/detalls/article/Intoxicacions_per_bolets",
    publisher: "Canal Salut — Generalitat de Catalunya",
  },
  {
    name: { ca: "Regulació d'activitats al Parc Natural del Cadí-Moixeró", es: "Regulación de actividades en el Parc Natural del Cadí-Moixeró", en: "Activity rules, Cadí-Moixeró Natural Park" },
    url: "https://parcsnaturals.gencat.cat/ca/xarxa-de-parcs/cadi/gaudeix-del-parc/consells/regulacio-dactivitats/",
    publisher: "Parcs Naturals de Catalunya",
  },
  {
    name: { ca: "Preguntes freqüents — Aigüestortes i Estany de Sant Maurici", es: "Preguntas frecuentes — Aigüestortes i Estany de Sant Maurici", en: "FAQ — Aigüestortes i Estany de Sant Maurici National Park" },
    url: "https://parcsnaturals.gencat.cat/ca/xarxa-de-parcs/aiguestortes/preguntes-frequents/",
    publisher: "Parcs Naturals de Catalunya",
  },
  {
    name: { ca: "La temporada de bolets comença amb retard", es: "La temporada de setas empieza con retraso", en: "Mushroom season starts late (ACN report)" },
    url: "https://www.vilaweb.cat/noticies/la-temporada-de-bolets-comenca-amb-retard-per-la-calor-i-la-manca-de-pluja/",
    publisher: "VilaWeb / ACN",
    type: "press" as const,
  },
  {
    name: { ca: "Temporada de bolets — Generalitat", es: "Temporada de setas — Generalitat", en: "Mushroom season — Government of Catalonia" },
    url: "https://tramits.gencat.cat/en/actualitat/reportatges/temporada-de-bolets/index.html",
    publisher: "Generalitat de Catalunya",
  },
];

export interface Copy {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  intro: string[];
  directAnswerTitle: string;
  directAnswer: string;
  keyFactsTitle: string;
  keyFacts: { label: string; value: string }[];
  tableCaption: string;
  tableHeaders: string[];
  ratingDisclaimerTitle: string;
  ratingDisclaimer: string;
  lateHeading: string;
  late: string[];
  whyHeading: string;
  why: string[];
  whyList: string[];
  noSpotsHeading: string;
  noSpots: string[];
  safetyHeading: string;
  safety: string[];
  safetyCalloutTitle: string;
  safetyCallout: string;
  summaryHeading: string;
  summary: string[];
}

export const COPY: Record<Locale, Copy> = {
  ca: {
    path: "natura/bolets-catalunya-condicions",
    title: "Temporada de bolets 2026: on hi ha millors condicions aquesta setmana?",
    seoTitle: "Bolets a Catalunya 2026: les millors zones aquesta setmana",
    seoDescription:
      "Analitzem pluja, temperatura i humitat per saber quines zones de Catalunya tenen millors condicions per als bolets aquesta setmana.",
    excerpt:
      "Analitzem pluja, temperatura i context forestal per saber quines zones de Catalunya tenen ara mateix les millors condicions per als bolets. Dades de Meteocat verificades el 13 de setembre de 2026.",
    intro: [
      "La temporada de bolets 2026 encara no ha arrencat amb força a tot Catalunya, però les pluges de setembre comencen a dibuixar diferències importants entre territoris.",
      "Les dades meteorològiques situen ara mateix alguns sectors del **Ripollès, el nord del Berguedà i la Garrotxa** en una posició millor que la resta del país. En canvi, en moltes zones de Ponent, el litoral i el sud encara és aviat.",
      "Aquesta guia no és un mapa de bolets trobats. Analitza **condicions favorables per a la fructificació** a partir de precipitació, temperatura i context forestal. No hi ha cap garantia que un bosc concret tingui bolets.",
    ],
    directAnswerTitle: "En resum",
    directAnswer:
      "Les millors condicions relatives per als bolets aquesta setmana es concentren al Ripollès, el nord del Berguedà i la Garrotxa. Sant Joan de les Abadesses acumula 81,5 mm de pluja durant el setembre, mentre que la Quar, Sant Pau de Segúries, Castellar de n'Hug i Olot també superen els 55 mm. Això no garanteix que hi hagi bolets: la temporada 2026 continua endarrerida i irregular després d'un estiu excepcionalment càlid i sec.",
    keyFactsTitle: "Dades clau",
    keyFacts: [
      { label: "Situació", value: "Temporada encara endarrerida" },
      { label: "Millors condicions", value: "Ripollès" },
      { label: "Segon grup", value: "Nord del Berguedà i Garrotxa" },
      { label: "Precipitació destacada", value: "Sant Joan de les Abadesses — 81,5 mm al setembre" },
      { label: "Període analitzat", value: "14–20 de setembre de 2026" },
      { label: "Última verificació", value: "13 de setembre de 2026" },
    ],
    tableCaption: "Condicions generals per als bolets aquesta setmana",
    tableHeaders: ["Zona", "Condicions", "Dada destacada", "Lectura"],
    ratingDisclaimerTitle: "Com llegir aquesta valoració",
    ratingDisclaimer:
      "Aquesta valoració compara condicions meteorològiques i forestals generals. No representa observacions de bolets ni garanteix que n'hi hagi.",
    lateHeading: "La temporada de bolets 2026 va amb retard",
    late: [
      "Abans d'interpretar les pluges de setembre cal tenir en compte com venim de l'estiu.",
      "El Servei Meteorològic de Catalunya ha qualificat l'estiu de 2026 com **el més càlid registrat a Catalunya**, per davant dels estius de 2003 i 2022. Ha estat sec a la major part del territori i molt sec en àmplies zones de Ponent i del terç sud.",
      "A més, més del 80% del país ha registrat anomalies tèrmiques estivals iguals o superiors als +3 °C. Aquest context ha deixat molts boscos amb dèficit hídric.",
      "El 12 de setembre, Juan Martínez de Aragón, investigador del Centre de Ciència i Tecnologia Forestal de Catalunya, explicava que l'abundància de bolets continuava sent baixa a bona part del país i que el bosc necessitava recuperar-se després de la calor i la manca d'aigua.",
      "Per això, veure una bona acumulació de pluja no significa necessàriament trobar una boletada immediata.",
    ],
    whyHeading: "Per què no n'hi ha prou que plogui?",
    why: [
      "Una tempesta no fa aparèixer automàticament bolets l'endemà. La fructificació depèn d'una combinació complexa de factors:",
    ],
    whyList: [
      "disponibilitat d'aigua al sòl",
      "temperatura",
      "humitat",
      "vent",
      "tipus de bosc",
      "espècie",
      "altitud",
      "distribució temporal de les pluges",
    ],
    noSpotsHeading: "Aquest mapa no revela boscos secrets",
    noSpots: [
      "CatalunyaInfo treballa a escala de comarca o gran sector geogràfic. No publicarem coordenades exactes de boscos productius.",
      "A més de protegir espais sensibles davant la massificació, cal recordar que molts boscos són de propietat privada. Els propietaris també ho són dels recursos forestals, inclosos els bolets. Quan una finca prohibeix la recol·lecció mitjançant senyalització, cal respectar-la.",
      "També hi ha espais protegits amb normes específiques. Al Parc Nacional d'Aigüestortes i Estany de Sant Maurici, per exemple, la recol·lecció de bolets no està permesa dins del Parc Nacional i només es contempla en determinades zones perifèriques de protecció.",
    ],
    safetyHeading: "Si no el pots identificar amb certesa, no te'l mengis",
    safety: [
      "Aquest és el consell més important de tota la guia.",
      "Canal Salut indica que cal consumir únicament bolets d'espècies que es puguin identificar amb absoluta certesa.",
      "No existeixen regles casolanes fiables per saber si un bolet és tòxic. Ni l'all, ni la plata, ni els cargols, ni el color permeten determinar-ne la toxicitat.",
      "Algunes intoxicacions poden ser molt greus i els primers símptomes poden aparèixer moltes hores després. Si apareixen símptomes després de consumir bolets, cal buscar assistència sanitària immediatament.",
    ],
    safetyCalloutTitle: "Davant del dubte",
    safetyCallout:
      "No te'l mengis. Consulta sempre les recomanacions oficials de [Canal Salut](https://canalsalut.gencat.cat/ca/detalls/article/Intoxicacions_per_bolets).",
    summaryHeading: "En resum: on hi ha millors condicions aquesta setmana?",
    summary: [
      "Si ordenem Catalunya segons les condicions meteorològiques observades actualment: **1. Ripollès / Alt Ter**, **2. Nord del Berguedà**, **3. Garrotxa / Vall d'en Bas**.",
      "Osona i Collsacabra formen un segon grup interessant. La Cerdanya, l'Alt Urgell i el Pallars tenen potencial, però les condicions són molt més locals. I encara és aviat per a bona part del prelitoral, Ponent i el sud.",
      "La temporada 2026 encara està despertant. CatalunyaInfo actualitzarà aquesta guia a mesura que canviïn les pluges i les temperatures.",
      "I si la sortida al bosc és tant per caminar com per buscar, mira també quan arriben els [colors de tardor a cada zona de Catalunya](/ca/natura/colors-tardor-catalunya/).",
    ],
  },
  es: {
    path: "naturaleza/setas-cataluna-condiciones",
    title: "Temporada de setas 2026 en Cataluña: dónde están las mejores condiciones esta semana",
    seoTitle: "Setas en Cataluña 2026: mejores zonas esta semana",
    seoDescription:
      "Analizamos lluvia, temperatura y humedad para localizar las zonas de Cataluña con mejores condiciones para las setas esta semana.",
    excerpt:
      "Analizamos lluvia, temperatura y contexto forestal para saber qué zonas de Cataluña tienen ahora mismo las mejores condiciones para las setas. Datos de Meteocat verificados el 13 de septiembre de 2026.",
    intro: [
      "La temporada de setas de 2026 todavía no ha arrancado con fuerza en toda Cataluña, pero las lluvias de septiembre empiezan a marcar diferencias importantes.",
      "Los datos actuales sitúan al **Ripollès, el norte del Berguedà y la Garrotxa** como los territorios con mejor combinación relativa de precipitación, ambiente forestal y temperaturas.",
      "Esta guía no es un mapa de setas encontradas. Analiza **condiciones meteorológicas favorables para la fructificación**. No existe ninguna garantía de que haya setas en un bosque concreto.",
    ],
    directAnswerTitle: "En resumen",
    directAnswer:
      "Las mejores condiciones relativas para las setas esta semana se concentran en el Ripollès, el norte del Berguedà y la Garrotxa. Sant Joan de les Abadesses acumula 81,5 mm de lluvia en septiembre, mientras La Quar, Sant Pau de Segúries, Castellar de n'Hug y Olot también superan los 55 mm. Esto no garantiza que haya setas: la temporada de 2026 continúa retrasada e irregular después de un verano excepcionalmente cálido y seco.",
    keyFactsTitle: "Datos clave",
    keyFacts: [
      { label: "Situación", value: "Temporada todavía retrasada" },
      { label: "Mejores condiciones", value: "Ripollès" },
      { label: "Segundo grupo", value: "Norte del Berguedà y Garrotxa" },
      { label: "Precipitación destacada", value: "Sant Joan de les Abadesses — 81,5 mm en septiembre" },
      { label: "Periodo analizado", value: "14–20 de septiembre de 2026" },
      { label: "Última verificación", value: "13 de septiembre de 2026" },
    ],
    tableCaption: "Condiciones generales para las setas esta semana",
    tableHeaders: ["Zona", "Condiciones", "Dato destacado", "Lectura"],
    ratingDisclaimerTitle: "Cómo leer esta valoración",
    ratingDisclaimer:
      "Esta valoración compara condiciones meteorológicas y forestales generales. No representa observaciones de setas ni garantiza su presencia.",
    lateHeading: "La temporada de 2026 empieza con retraso",
    late: [
      "El contexto del verano es fundamental.",
      "Meteocat ha confirmado que el verano de 2026 ha sido **el más cálido registrado en Cataluña**, por delante de 2003 y 2022. Ha sido seco en la mayor parte del territorio y especialmente seco en amplias zonas del oeste y del sur.",
      "Además, más del 80% de Cataluña registró anomalías térmicas estivales iguales o superiores a +3 °C. Los bosques llegan, por tanto, a septiembre después de un periodo de fuerte estrés térmico.",
      "El 12 de septiembre, Juan Martínez de Aragón, investigador del Centre de Ciència i Tecnologia Forestal de Catalunya, explicaba que la presencia de setas todavía era muy baja en muchos puntos y que el bosque necesitaba recuperarse.",
      "Las lluvias recientes mejoran las perspectivas, pero no provocan una fructificación inmediata.",
    ],
    whyHeading: "¿Por qué no basta con que llueva?",
    why: [
      "Las setas no aparecen automáticamente después de una tormenta. La fructificación depende de la combinación de varios factores:",
    ],
    whyList: [
      "agua disponible en el suelo",
      "temperaturas",
      "humedad",
      "viento",
      "altitud",
      "tipo de bosque",
      "especie",
      "distribución temporal de las lluvias",
    ],
    noSpotsHeading: "No publicaremos coordenadas de bosques productivos",
    noSpots: [
      "CatalunyaInfo trabaja a escala de comarca o gran zona. No se publican localizaciones exactas de puntos de recogida.",
      "Además, muchos bosques catalanes son privados. La normativa recuerda que el propietario del bosque también es propietario de sus recursos, incluidas las setas, y hay que respetar siempre la señalización.",
      "Los espacios naturales protegidos pueden tener restricciones específicas. En el Parque Nacional de Aigüestortes i Estany de Sant Maurici, por ejemplo, la recolección no está permitida dentro del Parque Nacional y solo se contempla en determinadas zonas periféricas de protección.",
    ],
    safetyHeading: "Si no estás completamente seguro, no te la comas",
    safety: [
      "Canal Salut es muy claro: solo deben consumirse setas cuya especie pueda identificarse con absoluta certeza.",
      "No existen trucos caseros fiables para determinar si una seta es tóxica. Ni el ajo, ni la plata, ni los caracoles, ni el color permiten determinar la toxicidad.",
      "Algunas intoxicaciones pueden ser muy graves y los primeros síntomas pueden aparecer muchas horas después. Si aparecen síntomas tras consumir setas, hay que buscar asistencia sanitaria de inmediato.",
    ],
    safetyCalloutTitle: "Ante la duda",
    safetyCallout:
      "Descártala. Consulta siempre las recomendaciones oficiales de [Canal Salut](https://canalsalut.gencat.cat/ca/detalls/article/Intoxicacions_per_bolets).",
    summaryHeading: "Las mejores condiciones esta semana",
    summary: [
      "El ranking actual de CatalunyaInfo es: **1. Ripollès / Alt Ter**, **2. Norte del Berguedà**, **3. Garrotxa / Vall d'en Bas**.",
      "Osona y Collsacabra presentan condiciones interesantes. La temporada de 2026, sin embargo, continúa siendo temprana, retrasada e irregular.",
      "Actualizaremos esta guía cuando cambien las lluvias y las temperaturas.",
      "Y si la salida al bosque es tanto para caminar como para buscar, consulta también cuándo llegan los [colores de otoño a cada zona de Cataluña](/es/naturaleza/colores-otono-cataluna/).",
    ],
  },
  en: {
    path: "nature/mushroom-season-catalonia",
    title: "Mushroom season in Catalonia 2026: where conditions are best right now",
    seoTitle: "Mushroom season in Catalonia: best conditions right now",
    seoDescription:
      "Rainfall, temperatures and forest conditions show which parts of Catalonia currently have the best conditions for mushroom season.",
    excerpt:
      "Rainfall, temperature and forest conditions across Catalonia, and what they mean for the 2026 mushroom season. Meteocat data verified on 13 September 2026.",
    intro: [
      "Catalonia's 2026 mushroom season is off to a slow start, but September rainfall is beginning to create meaningful differences between regions.",
      "Current weather data points to the **Ripollès, northern Berguedà and Garrotxa** as the areas with the best relative combination of recent rainfall, cooler mountain conditions and forest environment.",
      "This is not a map showing confirmed mushroom finds. It is an analysis of **conditions that may support mushroom fruiting**. Finding mushrooms is never guaranteed.",
    ],
    directAnswerTitle: "In short",
    directAnswer:
      "The best relative conditions for mushrooms in Catalonia this week are currently in the Ripollès, northern Berguedà and Garrotxa areas. Sant Joan de les Abadesses has recorded 81.5 mm of rain so far in September, while several nearby mountain stations have exceeded 55 mm. That does not guarantee mushrooms are present: the 2026 season remains late and patchy after an exceptionally hot and dry summer.",
    keyFactsTitle: "Key facts",
    keyFacts: [
      { label: "Season status", value: "Still running late" },
      { label: "Best conditions", value: "Ripollès" },
      { label: "Next best areas", value: "Northern Berguedà and Garrotxa" },
      { label: "Notable rainfall", value: "Sant Joan de les Abadesses — 81.5 mm in September" },
      { label: "Period covered", value: "September 14–20, 2026" },
      { label: "Last verified", value: "September 13, 2026" },
    ],
    tableCaption: "General conditions for mushrooms this week",
    tableHeaders: ["Area", "Conditions", "Key figure", "Reading"],
    ratingDisclaimerTitle: "How to read this rating",
    ratingDisclaimer:
      "This rating compares broad weather and forest conditions. It is not based on confirmed mushroom sightings and does not guarantee mushrooms will be present.",
    lateHeading: "Why the 2026 season is running late",
    late: [
      "The summer of 2026 was the hottest ever recorded in Catalonia, according to the Catalan Meteorological Service, ahead of 2003 and 2022.",
      "Much of the territory was dry, with particularly severe rainfall deficits in parts of western and southern Catalonia. More than 80% of the region recorded summer temperature anomalies of at least +3 °C.",
      "Forests therefore entered September after a period of considerable heat and water stress.",
      "On 12 September, researcher Juan Martínez de Aragón from the Forest Science and Technology Centre of Catalonia said mushroom abundance remained very low in much of the country.",
      "Recent rain has improved the outlook, but mushroom fruiting does not happen immediately after a storm.",
    ],
    whyHeading: "Why one rainy day is not enough",
    why: [
      "Mushrooms do not simply appear the morning after heavy rain. Fruiting depends on a combination of factors:",
    ],
    whyList: [
      "soil water availability",
      "temperature",
      "humidity",
      "wind",
      "elevation",
      "forest type",
      "mushroom species",
      "timing of rainfall",
    ],
    noSpotsHeading: "Why we do not publish exact mushroom locations",
    noSpots: [
      "This guide works at county and broad regional level. It does not provide coordinates for productive forest sites, which helps avoid unnecessary pressure on specific woodland areas.",
      "It is also important to remember that many Catalan forests are privately owned. Landowners retain rights over forest resources, including mushrooms, and signs restricting collection must be respected.",
      "Protected natural areas may also have specific rules. In the Aigüestortes i Estany de Sant Maurici National Park, for example, mushroom picking is not permitted inside the national park and is only considered in certain peripheral protection zones.",
    ],
    safetyHeading: "Never eat a mushroom you cannot identify with certainty",
    safety: [
      "Catalonia's official public-health advice is straightforward: only eat mushrooms belonging to species you can identify with complete certainty.",
      "There are no reliable household tricks for deciding whether a wild mushroom is poisonous. Garlic, silver, snails and colour tell you nothing about toxicity.",
      "Some mushroom poisonings can be extremely serious, and the first symptoms may appear many hours later. Anyone who develops symptoms after eating wild mushrooms should seek medical help immediately.",
    ],
    safetyCalloutTitle: "If you are unsure",
    safetyCallout:
      "Do not eat it. Always check the official guidance from [Canal Salut](https://canalsalut.gencat.cat/ca/detalls/article/Intoxicacions_per_bolets).",
    summaryHeading: "Where are conditions best this week?",
    summary: [
      "Based on the current weather picture, CatalunyaInfo's ranking is: **1. Ripollès / upper Ter**, **2. Northern Berguedà**, **3. Garrotxa / Vall d'en Bas**.",
      "Osona and Collsacabra form a second group worth watching. The 2026 season remains early, delayed and highly uneven.",
      "This guide will be updated as rainfall and temperatures change.",
      "If the trip into the forest is as much about walking as about foraging, see also when [fall colors reach each part of Catalonia](/en/nature/fall-colors-catalonia/).",
    ],
  },
};

/** Alt text and caption for the lead image, per language. */
export const HERO = {
  key: "bolets-catalunya-2026-bosc-humit",
  alt: {
    ca: "Bolets en un bosc humit de muntanya durant la temporada de tardor a Catalunya",
    es: "Setas en un bosque húmedo de montaña durante la temporada de otoño en Cataluña",
    en: "Wild mushrooms in a damp mountain forest during autumn in Catalonia",
  },
  caption: {
    ca: "Bosc de muntanya a la tardor. Il·lustració generada amb intel·ligència artificial.",
    es: "Bosque de montaña en otoño. Ilustración generada con inteligencia artificial.",
    en: "Mountain forest in autumn. Illustration generated with artificial intelligence.",
  },
};
