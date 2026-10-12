import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  callout,
  faq,
  h2,
  lead,
  list,
  paras,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Ski resorts in Catalonia, season 2026-2027.
 *
 * Stable facts (kilometres, altitude, how to get there without a car, where
 * to read the snow report) from each resort's own site, checked on 12 Oct
 * 2026; the fact pack is research_notes/blog-batch-03/ski.md.
 *
 * Prices are where most ski pages go wrong, so this one states only what is
 * officially labelled 2026-27: Baqueira's dates and season pass, Port del
 * Comte's day and season passes. The FGC resorts (now PIRINEU365) show day
 * prices with no season label, and La Molina's is explicitly 2025-26, so
 * the guide sends readers to the tariff page instead of quoting them.
 */

const VERIFIED = "2026-10-12";

const SOURCES: B2Source[] = [
  { name: "Baqueira Beret — BaqueiraPASS and season dates", url: "https://www.baqueira.es/forfaits-baqueirapass", publisher: "Baqueira Beret" },
  { name: "Baqueira Beret — technical data", url: "https://www.baqueira.es/datos-tecnicos-baqueira-beret", publisher: "Baqueira Beret" },
  { name: "PIRINEU365 (FGC resorts)", url: "https://pirineu365.cat/", publisher: "Ferrocarrils de la Generalitat de Catalunya" },
  { name: "La Molina — technical sheet", url: "https://pirineu365.cat/lamolina/estacio/planol-pistes-fitxa-tecnica/", publisher: "FGC" },
  { name: "Masella — technical sheet", url: "https://www.masella.com/ca/paginas/fitxa-tecnica", publisher: "Masella" },
  { name: "Port del Comte — rates", url: "https://portdelcomte.net/tarifes-generals/", publisher: "Port del Comte" },
  { name: "Tavascan — mountain resort", url: "https://www.tavascan365.com/estacio-de-muntanya-de-tavascan/", publisher: "Tavascan" },
];

const META: Record<Locale, { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string }> = {
  ca: {
    path: "guies/estacions-esqui-catalunya",
    title: "Estacions d'esquí de Catalunya: quilòmetres, com arribar-hi i temporada 2026-2027",
    seoTitle: "Estacions d'esquí de Catalunya: temporada 2026-2027",
    seoDescription:
      "Les estacions d'esquí de Catalunya amb quilòmetres, altitud, com arribar-hi en tren o bus, on mirar l'estat de la neu i què hi ha publicat de la temporada 2026-27.",
    excerpt:
      "Baqueira, la Molina, Masella, Boí Taüll i la resta: mida, altitud, com arribar-hi sense cotxe i què han publicat ja de la temporada 2026-2027.",
  },
  es: {
    path: "guias/estaciones-esqui-cataluna",
    title: "Estaciones de esquí de Cataluña: kilómetros, cómo llegar y temporada 2026-2027",
    seoTitle: "Estaciones de esquí de Cataluña: temporada 2026-2027",
    seoDescription:
      "Estaciones de esquí de Cataluña: kilómetros, altitud, cómo llegar en tren o bus, dónde ver el estado de la nieve y qué se sabe de la temporada 2026-27.",
    excerpt:
      "Baqueira, La Molina, Masella, Boí Taüll y el resto: tamaño, altitud, cómo llegar sin coche y qué han publicado ya de la temporada 2026-2027.",
  },
  en: {
    path: "guides/ski-resorts-catalonia",
    title: "Ski resorts in Catalonia: size, how to get there and the 2026-2027 season",
    seoTitle: "Ski resorts in Catalonia: 2026-2027 season guide",
    seoDescription:
      "Catalonia's ski resorts with kilometres, altitude, how to get there by train or bus, where to check snow conditions, and what is published for 2026-27.",
    excerpt:
      "Baqueira, La Molina, Masella, Boí Taüll and the rest: size, altitude, how to get there without a car, and what has been announced for 2026-2027.",
  },
};

const ROWS: string[][] = [
  ["Baqueira Beret", "Val d'Aran", "169", "1.500–2.610"],
  ["Masella", "Cerdanya", "74", "1.600–2.535"],
  ["La Molina", "Cerdanya", "71", "1.667–2.537"],
  ["Boí Taüll", "Alta Ribagorça", "45", "2.040–2.751"],
  ["Port Ainé", "Pallars Sobirà", "26,7", "1.650–2.440"],
  ["Espot", "Pallars Sobirà", "25", "1.500–2.500"],
  ["Vallter", "Ripollès", "14,15", "2.000–2.535"],
  ["Vall de Núria", "Ripollès", "7,7", "1.964–2.252"],
];

function rows(locale: Locale): string[][] {
  if (locale !== "en") return ROWS;
  return ROWS.map(([a, b, km, alt]) => [a!, b!, km!.replace(",", "."), alt!.replace(/\./g, ",")]);
}

type T = {
  lead: string;
  tableCaption: string;
  headers: string[];
  tableNote: string;
  seasonTitle: string;
  season: string[];
  pricesTitle: string;
  prices: string[];
  getTitle: string;
  get: string[];
  smallTitle: string;
  small: string[];
  nordicTitle: string;
  nordic: string[];
  snowTitle: string;
  snow: string[];
  pickTitle: string;
  pick: string[];
  faq: { question: string; answer: string }[];
  verifiedNote: string;
};

const COPY: Record<Locale, T> = {
  ca: {
    lead: "Catalunya té una desena d'estacions d'esquí alpí, de les 169 km de Baqueira Beret a les pistes de la Vall de Núria, on només s'hi arriba en cremallera. Aquí hi ha la mida i l'altitud de cadascuna, com arribar-hi sense cotxe, on mirar l'estat de la neu i què han publicat oficialment de la temporada 2026-2027.",
    tableCaption: "Estacions d'esquí alpí de Catalunya",
    headers: ["Estació", "Comarca", "Km esquiables", "Altitud (m)"],
    tableNote: "Dades de les fitxes tècniques oficials de cada estació. Port del Comte i Tavascan no publiquen els quilòmetres a la seva fitxa.",
    seasonTitle: "La temporada 2026-2027: què hi ha publicat",
    season: [
      "**Baqueira Beret** és l'única que ha anunciat dates: preveu obrir el **28 de novembre de 2026** i tancar el **4 d'abril de 2027**, si la neu ho permet. Les estacions de FGC, Masella i Port del Comte encara no han fixat el dia d'obertura; normalment depèn de la neu i del fred per fabricar-ne.",
      "Les sis estacions de Ferrocarrils de la Generalitat (la Molina, Vall de Núria, Vallter, Espot, Port Ainé i Boí Taüll) ara es presenten juntes amb la marca **PIRINEU365**, i els seus webs antics hi redirigeixen.",
    ],
    pricesTitle: "Preus: només els que ja són de 2026-2027",
    prices: [
      "A **Port del Comte** el forfet de dia d'adult de la temporada 2026-27 és de **44 €** en temporada alta i **38 €** en temporada baixa, i el de temporada, **695 €**.",
      "A **Baqueira Beret** el forfet de temporada d'adult 2026-27 costa **1.300 €** fins a l'1 de novembre i **1.400 €** després. El preu del forfet de dia 2026-27 encara no és públic.",
      "Les estacions de FGC mostren preus de dia sense indicar la temporada, i el de la Molina és explícitament de la 2025-26. Per això no els copiem aquí: consulta la pàgina de tarifes de cada estació a pirineu365.cat abans de comprar. Comprar a la taquilla sol ser més car que en línia.",
    ],
    getTitle: "Com arribar-hi sense cotxe",
    get: [
      "**La Molina:** l'**Ski Tren** de FGC combina el tren R3 fins a l'estació de la Molina, el bus intern i el forfet; també hi ha Ski Bus des de Barcelona, Sabadell, Terrassa i Manresa.",
      "**Vall de Núria:** R3 fins a Ribes Enllaç i el **Cremallera**; no hi ha accés per carretera.",
      "**Espot i Port Ainé:** l'Ski Bus d'ALSA des de Lleida i Balaguer, i el Taxi de la Neu des de la parada de bus de Sort.",
      "**Boí Taüll:** el **Bus de la Neu**, a 1 €, els caps de setmana i festius des de Vilaller, passant pel Pont de Suert i els pobles de la vall.",
      "**Baqueira Beret:** bus d'ALSA fins a Vielha des de Barcelona o Lleida, i la línia local VA fins a l'estació.",
    ],
    smallTitle: "Les petites i les que tornen",
    small: [
      "**Port del Comte**, al Solsonès, és la més propera a la Catalunya central. **Tavascan** no va obrir les pistes alpines la temporada 2025-26 i, a 12 d'octubre de 2026, no ha anunciat què farà aquest hivern.",
    ],
    nordicTitle: "Esquí nòrdic",
    nordic: [
      "Les estacions de fons de la Mancomunitat (Guils Fontanera, Aransa, Lles, Tuixent-La Vansa, Sant Joan de l'Erm, Tavascan i Virós-Vallferrera) comparteixen el forfet de temporada **Tot Nòrdic**: 175 € per a adults la temporada 2026-27, amb un 25 % de descompte fins al 15 de novembre.",
    ],
    snowTitle: "On mirar l'estat de la neu",
    snow: [
      "Cada estació publica cada dia les pistes obertes, el gruix de neu i les remuntadores en marxa: Baqueira a baqueira.es/estado-estacion, les de FGC a la secció «En directe» de pirineu365.cat, Masella i Port del Comte a la seva portada. Mira-ho el mateix matí: a principi i final de temporada canvia d'un dia per l'altre.",
    ],
    pickTitle: "Quina triar",
    pick: [
      "**Molts quilòmetres:** Baqueira Beret (169 km) o el domini Alp2500, la Molina i Masella junts (145 km).",
      "**Sense cotxe des de Barcelona:** la Molina amb l'Ski Tren, o la Vall de Núria amb el Cremallera.",
      "**Aprendre o anar amb nens petits:** la Vall de Núria i Vallter són petites i fàcils de controlar.",
    ],
    faq: [
      { question: "Quan obren les estacions d'esquí a Catalunya el 2026?", answer: "Baqueira Beret preveu obrir el 28 de novembre de 2026. La resta no ha anunciat data a 12 d'octubre de 2026; depèn de la neu." },
      { question: "Quina és l'estació d'esquí més gran de Catalunya?", answer: "Baqueira Beret, amb 169 km de pistes marcades segons la seva fitxa tècnica." },
      { question: "Es pot anar a esquiar en tren des de Barcelona?", answer: "Sí: a la Molina amb l'Ski Tren (R3 + bus + forfet) i a la Vall de Núria amb l'R3 i el Cremallera." },
    ],
    verifiedNote: "Les dates i els preus d'esquí canvien cada temporada: comprova'ls al web de l'estació.",
  },
  es: {
    lead: "Cataluña tiene una decena de estaciones de esquí alpino, de los 169 km de Baqueira Beret a las pistas de la Vall de Núria, a las que solo se llega en cremallera. Aquí está el tamaño y la altitud de cada una, cómo llegar sin coche, dónde mirar el estado de la nieve y qué han publicado oficialmente de la temporada 2026-2027.",
    tableCaption: "Estaciones de esquí alpino de Cataluña",
    headers: ["Estación", "Comarca", "Km esquiables", "Altitud (m)"],
    tableNote: "Datos de las fichas técnicas oficiales de cada estación. Port del Comte y Tavascan no publican los kilómetros en su ficha.",
    seasonTitle: "La temporada 2026-2027: qué se ha publicado",
    season: [
      "**Baqueira Beret** es la única que ha anunciado fechas: prevé abrir el **28 de noviembre de 2026** y cerrar el **4 de abril de 2027**, si la nieve lo permite. Las estaciones de FGC, Masella y Port del Comte aún no han fijado el día de apertura; normalmente depende de la nieve y del frío para fabricarla.",
      "Las seis estaciones de Ferrocarrils de la Generalitat (La Molina, Vall de Núria, Vallter, Espot, Port Ainé y Boí Taüll) se presentan ahora juntas con la marca **PIRINEU365**, y sus webs antiguas redirigen allí.",
    ],
    pricesTitle: "Precios: solo los que ya son de 2026-2027",
    prices: [
      "En **Port del Comte** el forfait de día de adulto de la temporada 2026-27 es de **44 €** en temporada alta y **38 €** en temporada baja, y el de temporada, **695 €**.",
      "En **Baqueira Beret** el forfait de temporada de adulto 2026-27 cuesta **1.300 €** hasta el 1 de noviembre y **1.400 €** después. El precio del forfait de día 2026-27 aún no es público.",
      "Las estaciones de FGC muestran precios de día sin indicar la temporada, y el de La Molina es explícitamente de la 2025-26. Por eso no los copiamos aquí: consulta la página de tarifas de cada estación en pirineu365.cat antes de comprar. Comprar en taquilla suele ser más caro que en línea.",
    ],
    getTitle: "Cómo llegar sin coche",
    get: [
      "**La Molina:** el **Ski Tren** de FGC combina el tren R3 hasta la estación de La Molina, el bus interno y el forfait; también hay Ski Bus desde Barcelona, Sabadell, Terrassa y Manresa.",
      "**Vall de Núria:** R3 hasta Ribes Enllaç y el **Cremallera**; no hay acceso por carretera.",
      "**Espot y Port Ainé:** el Ski Bus de ALSA desde Lleida y Balaguer, y el Taxi de la Neu desde la parada de bus de Sort.",
      "**Boí Taüll:** el **Bus de la Neu**, a 1 €, los fines de semana y festivos desde Vilaller, pasando por El Pont de Suert y los pueblos del valle.",
      "**Baqueira Beret:** bus de ALSA hasta Vielha desde Barcelona o Lleida, y la línea local VA hasta la estación.",
    ],
    smallTitle: "Las pequeñas y las que vuelven",
    small: [
      "**Port del Comte**, en el Solsonès, es la más cercana a la Cataluña central. **Tavascan** no abrió las pistas alpinas la temporada 2025-26 y, a 12 de octubre de 2026, no ha anunciado qué hará este invierno.",
    ],
    nordicTitle: "Esquí nórdico",
    nordic: [
      "Las estaciones de fondo de la Mancomunitat (Guils Fontanera, Aransa, Lles, Tuixent-La Vansa, Sant Joan de l'Erm, Tavascan y Virós-Vallferrera) comparten el forfait de temporada **Tot Nòrdic**: 175 € para adultos la temporada 2026-27, con un 25 % de descuento hasta el 15 de noviembre.",
    ],
    snowTitle: "Dónde mirar el estado de la nieve",
    snow: [
      "Cada estación publica a diario las pistas abiertas, el espesor de nieve y los remontes en marcha: Baqueira en baqueira.es/estado-estacion, las de FGC en la sección «En directe» de pirineu365.cat, Masella y Port del Comte en su portada. Míralo la misma mañana: a principio y final de temporada cambia de un día para otro.",
    ],
    pickTitle: "Cuál elegir",
    pick: [
      "**Muchos kilómetros:** Baqueira Beret (169 km) o el dominio Alp2500, La Molina y Masella juntas (145 km).",
      "**Sin coche desde Barcelona:** La Molina con el Ski Tren, o la Vall de Núria con el Cremallera.",
      "**Aprender o ir con niños pequeños:** la Vall de Núria y Vallter son pequeñas y fáciles de controlar.",
    ],
    faq: [
      { question: "¿Cuándo abren las estaciones de esquí en Cataluña en 2026?", answer: "Baqueira Beret prevé abrir el 28 de noviembre de 2026. El resto no ha anunciado fecha a 12 de octubre de 2026; depende de la nieve." },
      { question: "¿Cuál es la estación de esquí más grande de Cataluña?", answer: "Baqueira Beret, con 169 km de pistas balizadas según su ficha técnica." },
      { question: "¿Se puede ir a esquiar en tren desde Barcelona?", answer: "Sí: a La Molina con el Ski Tren (R3 + bus + forfait) y a la Vall de Núria con el R3 y el Cremallera." },
    ],
    verifiedNote: "Las fechas y los precios de esquí cambian cada temporada: compruébalos en la web de la estación.",
  },
  en: {
    lead: "Catalonia has about ten alpine ski resorts, from Baqueira Beret's 169 km to the slopes of Vall de Núria, reachable only by rack railway. Here is each resort's size and altitude, how to get there without a car, where to check the snow, and what has been officially announced for the 2026-2027 season.",
    tableCaption: "Alpine ski resorts in Catalonia",
    headers: ["Resort", "Area", "Skiable km", "Altitude (m)"],
    tableNote: "From each resort's official technical sheet. Port del Comte and Tavascan do not publish their kilometres.",
    seasonTitle: "The 2026-2027 season: what has been announced",
    season: [
      "**Baqueira Beret** is the only one with dates so far: it plans to open on **28 November 2026** and close on **4 April 2027**, snow permitting. The FGC resorts, Masella and Port del Comte have not set an opening day; it usually depends on snowfall and on cold enough nights to make snow.",
      "The six resorts run by the Catalan railway company FGC (La Molina, Vall de Núria, Vallter, Espot, Port Ainé and Boí Taüll) now trade together as **PIRINEU365**, and their old websites redirect there.",
    ],
    pricesTitle: "Prices: only those already set for 2026-2027",
    prices: [
      "At **Port del Comte** an adult day pass for 2026-27 costs **€44** in high season and **€38** in low season; the season pass is **€695**.",
      "At **Baqueira Beret** the 2026-27 adult season pass costs **€1,300** until 1 November and **€1,400** after. The 2026-27 day-pass price is not public yet.",
      "The FGC resorts show day prices with no season label, and La Molina's is explicitly the 2025-26 price, so we do not copy them here: check each resort's rates page on pirineu365.cat before you buy. The ticket office is usually dearer than buying online.",
    ],
    getTitle: "Getting there without a car",
    get: [
      "**La Molina:** FGC's **Ski Tren** bundles the R3 train to La Molina station, the shuttle bus and the lift pass; there is also a Ski Bus from Barcelona, Sabadell, Terrassa and Manresa.",
      "**Vall de Núria:** the R3 to Ribes Enllaç, then the **rack railway**; there is no road access.",
      "**Espot and Port Ainé:** the ALSA Ski Bus from Lleida and Balaguer, and the 'Taxi de la Neu' from the bus stop at Sort.",
      "**Boí Taüll:** the **Bus de la Neu**, €1, on weekends and holidays from Vilaller via El Pont de Suert and the valley villages.",
      "**Baqueira Beret:** ALSA coaches to Vielha from Barcelona or Lleida, then local bus line VA to the resort.",
    ],
    smallTitle: "The small ones, and one in doubt",
    small: [
      "**Port del Comte**, in the Solsonès, is the closest to central Catalonia. **Tavascan** did not open its alpine slopes in 2025-26 and, as of 12 October 2026, has not said what it will do this winter.",
    ],
    nordicTitle: "Cross-country skiing",
    nordic: [
      "The cross-country stations of the Mancomunitat (Guils Fontanera, Aransa, Lles, Tuixent-La Vansa, Sant Joan de l'Erm, Tavascan and Virós-Vallferrera) share the **Tot Nòrdic** season pass: €175 for adults in 2026-27, 25% off until 15 November.",
    ],
    snowTitle: "Where to check the snow",
    snow: [
      "Each resort posts open runs, snow depth and running lifts daily: Baqueira at baqueira.es/estado-estacion, the FGC resorts in the 'En directe' section of pirineu365.cat, Masella and Port del Comte on their home pages. Check on the morning itself: at the start and end of the season it changes from one day to the next.",
    ],
    pickTitle: "Which to choose",
    pick: [
      "**The most kilometres:** Baqueira Beret (169 km), or the Alp2500 area, La Molina and Masella together (145 km).",
      "**No car, from Barcelona:** La Molina with the Ski Tren, or Vall de Núria with the rack railway.",
      "**Learning, or with small children:** Vall de Núria and Vallter are small and easy to keep track of.",
    ],
    faq: [
      { question: "When do ski resorts open in Catalonia in 2026?", answer: "Baqueira Beret plans to open on 28 November 2026. The others had not announced a date as of 12 October 2026; it depends on the snow." },
      { question: "What is the biggest ski resort in Catalonia?", answer: "Baqueira Beret, with 169 km of marked runs according to its technical sheet." },
      { question: "Can you go skiing by train from Barcelona?", answer: "Yes: to La Molina with the Ski Tren (R3 + bus + lift pass) and to Vall de Núria with the R3 and the rack railway." },
    ],
    verifiedNote: "Ski dates and prices change every season: check them on the resort's website.",
  },
};

function body(locale: Locale) {
  const t = COPY[locale];
  return [
    lead(t.lead),
    table(t.tableCaption, t.headers, rows(locale), t.tableNote),
    callout("official", verifiedLine(locale, VERIFIED), t.verifiedNote),
    ...h2(t.seasonTitle, ...t.season),
    ...h2(t.pricesTitle, ...t.prices),
    ...h2(t.getTitle),
    list(...t.get),
    ...h2(t.smallTitle, ...t.small),
    ...h2(t.nordicTitle, ...t.nordic),
    ...h2(t.snowTitle, ...t.snow),
    ...h2(t.pickTitle),
    list(...t.pick),
    ...paras(),
    faq(t.faq),
    ...b2Related(["snow", "andorra", "cerdanya", "ripolles"], locale),
  ];
}

export const SKI: B2Article = {
  key: "ski",
  entryKey: "guide-ski-resorts-catalonia",
  categoryKey: "mountain",
  sources: SOURCES,
  heroKey: "esqui-baqueira-beret-mar-de-nuvols",
  heroAlt: {
    ca: "Pistes nevades de Baqueira Beret sobre un mar de núvols, amb les muntanyes de l'Aran al fons",
    es: "Pistas nevadas de Baqueira Beret sobre un mar de nubes, con las montañas de Arán al fondo",
    en: "Snowy slopes at Baqueira Beret above a sea of cloud, with the Aran mountains behind",
  },
  heroCaption: {
    ca: "Baqueira Beret preveu obrir el 28 de novembre de 2026.",
    es: "Baqueira Beret prevé abrir el 28 de noviembre de 2026.",
    en: "Baqueira Beret plans to open on 28 November 2026.",
  },
  secondaryKey: "esqui-la-molina-pista",
  secondaryAlt: {
    ca: "Una pista de la Molina entre boscos, vista des del poble",
    es: "Una pista de La Molina entre bosques, vista desde el pueblo",
    en: "A run at La Molina between pine forests, seen from the village",
  },
  secondaryCaption: {
    ca: "La Molina, a la Cerdanya: s'hi arriba en tren amb l'R3.",
    es: "La Molina, en la Cerdanya: se llega en tren con el R3.",
    en: "La Molina in the Cerdanya, reachable by train on the R3.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T18:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...META[locale], blocks: body(locale) }]),
  ) as B2Article["editions"],
};

export { META as SKI_META };
