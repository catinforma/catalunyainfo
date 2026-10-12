import type { Locale } from "@/lib/i18n/config";

import {
  b2Related,
  callout,
  faq,
  h2,
  lead,
  list,
  table,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Barcelona's two hills: Montjuïc and Tibidabo.
 *
 * Montjuïc: Magic Fountain from barcelona.cat, cable car from its operator
 * and the City Council, funicular from TMB, Port cable car from its operator,
 * castle from the City Council. Tibidabo: park calendar, prices and Cuca de
 * Llum from tibidabo.cat, Tramvia Blau and bus 196 from TMB, FGC station,
 * Sagrat Cor from the Salesians' site. All checked on 12 Oct 2026
 * (research_notes/blog-batch-03/montjuic.md and tibidabo.md).
 *
 * Seasonal timetables are given by month where the operator publishes them
 * and otherwise pointed to: the fountain's November-December show days and
 * Tibidabo's 2027 calendar were not out yet.
 */

const VERIFIED = "2026-10-12";

type Meta = { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string };

/* ========================================================================== */
/* Montjuïc                                                                   */
/* ========================================================================== */

const MONTJUIC_SOURCES: B2Source[] = [
  { name: "Font Màgica — horaris", url: "https://www.barcelona.cat/ca/que-pots-fer-a-bcn/font-magica/horaris-de-la-font-magica", publisher: "Ajuntament de Barcelona" },
  { name: "Telefèric de Montjuïc", url: "https://www.telefericdemontjuic.cat/ca", publisher: "Telefèric de Montjuïc (TMB)" },
  { name: "Funicular de Montjuïc", url: "https://www.tmb.cat/ca/barcelona/altres-transports-tmb/funicular-montjuic", publisher: "TMB" },
  { name: "Telefèric del Port", url: "https://www.telefericodebarcelona.com/", publisher: "Teleférico de Barcelona" },
  { name: "Castell de Montjuïc — informació pràctica", url: "https://ajuntament.barcelona.cat/castelldemontjuic/ca/la-visita/informacio-practica", publisher: "Ajuntament de Barcelona" },
];

const MONTJUIC_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/montjuic-font-magica-teleferic",
    title: "Montjuïc: Font Màgica, telefèric, funicular i castell",
    seoTitle: "Montjuïc: Font Màgica, telefèric i castell (preus)",
    seoDescription:
      "Quan hi ha espectacle a la Font Màgica, preus del telefèric de Montjuïc (17,10 € en línia) i del Port, el funicular amb bitllet de metro i el castell.",
    excerpt: "Com pujar a Montjuïc i què hi ha a dalt: la Font Màgica, el telefèric, el funicular, el telefèric del Port i el castell, amb preus i horaris oficials.",
  },
  es: {
    path: "guias/montjuic-fuente-magica-teleferico",
    title: "Montjuïc: Fuente Mágica, teleférico, funicular y castillo",
    seoTitle: "Montjuïc: Fuente Mágica, teleférico y castillo (precios)",
    seoDescription:
      "Cuándo hay espectáculo en la Fuente Mágica, precios del teleférico de Montjuïc (17,10 € en línea) y del Puerto, el funicular con billete de metro y el castillo.",
    excerpt: "Cómo subir a Montjuïc y qué hay arriba: la Fuente Mágica, el teleférico, el funicular, el teleférico del Puerto y el castillo, con precios y horarios oficiales.",
  },
  en: {
    path: "guides/montjuic-magic-fountain-cable-car",
    title: "Montjuïc: Magic Fountain, cable car, funicular and castle",
    seoTitle: "Montjuïc: Magic Fountain times, cable car and castle",
    seoDescription:
      "When the Magic Fountain show runs, Montjuïc cable car prices (€17.10 online) and the Port cable car, the funicular on a metro ticket, and the castle.",
    excerpt: "How to get up Montjuïc and what is at the top: the Magic Fountain, the cable cars, the funicular and the castle, with official prices and hours.",
  },
};

type MT = {
  lead: string; fountainTitle: string; fountain: string[];
  upCaption: string; upHeaders: string[]; upRows: string[][]; upNote: string;
  upTitle: string; up: string[];
  castleTitle: string; castle: string[];
  faq: { question: string; answer: string }[]; note: string;
};

const MONTJUIC_COPY: Record<Locale, MT> = {
  en: {
    lead: "Montjuïc rises straight above Plaça d'Espanya: the **Magic Fountain** at its foot, the **castle** at the top, and four ways up in between, two of them on an ordinary metro ticket.",
    fountainTitle: "The Magic Fountain",
    fountain: [
      "The fountain's music-and-light shows run on set evenings that change with the season. In October 2026 they are on **Thursday, Friday and Saturday from 21:00 to 22:00**, in two half-hour sessions. The City Council publishes each month's show days on its calendar; in early 2026 there were no shows from January to March, and they resumed in April.",
      "The fountain has run on groundwater since 2010, and it reopened renovated in September 2025.",
    ],
    upCaption: "Ways up Montjuïc",
    upHeaders: ["How", "From", "Price", "Hours (winter)"],
    upRows: [
      ["Funicular", "Paral·lel metro (L2, L3)", "Metro ticket (€2.90 single) or a pass", "From 7:30 weekdays, 9:00 weekends"],
      ["Telefèric de Montjuïc (cable car)", "Top of the funicular to the castle", "€17.10 return online, €19 at the desk; €12 single", "10:00–18:00 from November"],
      ["Telefèric del Port (harbour cable car)", "Barceloneta tower to Montjuïc", "€12.50 single, €20 return", "11:00–17:30 from 31 October"],
      ["Bus 150", "Plaça d'Espanya to the castle", "Metro ticket", "About 20 minutes"],
    ],
    upNote: "From TMB, the cable-car operators and the City Council, checked on 12 October 2026. The Montjuïc cable car closes for annual maintenance (in 2026, 2 February to 1 March); the Port cable car closes 13–15 October 2026.",
    upTitle: "Which way up",
    up: [
      "The **funicular** is the bargain: it takes integrated tickets and passes such as Hola Barcelona, and climbs in two minutes. The **Montjuïc cable car** continues from its top station to the castle; children aged 4 to 12 pay €11.70 return online and under-4s ride free. The **Port cable car** is the scenic option across the harbour from Barceloneta.",
      "When the cable car or funicular is closed, the city points to **bus 150** from Plaça d'Espanya.",
    ],
    castleTitle: "Montjuïc Castle",
    castle: [
      "The castle costs **€12** (€8 reduced; under-16s free) and is **free on Sunday afternoons from 15:00 and all day on the first Sunday** of the month. It opens 10:00–20:00 until 31 October and 10:00–18:00 from 1 November; ticket offices close half an hour earlier.",
    ],
    faq: [
      { question: "When is the Magic Fountain show?", answer: "In October 2026, Thursday to Saturday from 21:00 to 22:00. Show days change each month: check the City Council's calendar." },
      { question: "How much is the Montjuïc cable car?", answer: "€17.10 return online or €19 at the desk, €12 single; children 4–12 €11.70 return online. Checked on 12 October 2026." },
      { question: "Can I use a metro ticket on the Montjuïc funicular?", answer: "Yes: the funicular is part of the integrated network and takes the single ticket and passes." },
      { question: "Is Montjuïc Castle free?", answer: "On Sunday afternoons from 15:00 and all day on the first Sunday of the month; otherwise €12." },
    ],
    note: "Show days and seasonal hours change: check the official calendars before you go.",
  },
  es: {
    lead: "Montjuïc se levanta justo sobre la plaza de Espanya: la **Fuente Mágica** al pie, el **castillo** arriba, y cuatro maneras de subir, dos de ellas con un billete de metro normal.",
    fountainTitle: "La Fuente Mágica",
    fountain: [
      "Los espectáculos de música y luz de la fuente se hacen ciertas tardes que cambian según la temporada. En octubre de 2026 son **de jueves a sábado de 21:00 a 22:00**, en dos pases de media hora. El Ayuntamiento publica los días de cada mes en su calendario; a principios de 2026 no hubo espectáculos de enero a marzo, y volvieron en abril.",
      "La fuente funciona con agua freática desde 2010 y reabrió renovada en septiembre de 2025.",
    ],
    upCaption: "Maneras de subir a Montjuïc",
    upHeaders: ["Cómo", "Desde", "Precio", "Horario (invierno)"],
    upRows: [
      ["Funicular", "Metro Paral·lel (L2, L3)", "Billete de metro (2,90 € sencillo) o abono", "Desde las 7:30 laborables, 9:00 fines de semana"],
      ["Teleférico de Montjuïc", "Final del funicular hasta el castillo", "17,10 € ida y vuelta en línea, 19 € en taquilla; 12 € ida", "10:00–18:00 desde noviembre"],
      ["Teleférico del Puerto", "Torre de Barceloneta a Montjuïc", "12,50 € ida, 20 € ida y vuelta", "11:00–17:30 desde el 31 de octubre"],
      ["Bus 150", "Plaza de Espanya hasta el castillo", "Billete de metro", "Unos 20 minutos"],
    ],
    upNote: "De TMB, los operadores de los teleféricos y el Ayuntamiento, comprobado el 12 de octubre de 2026. El teleférico de Montjuïc cierra por mantenimiento anual (en 2026, del 2 de febrero al 1 de marzo); el del Puerto cierra del 13 al 15 de octubre de 2026.",
    upTitle: "Por dónde subir",
    up: [
      "El **funicular** es lo más barato: acepta los títulos integrados y abonos como la Hola Barcelona, y sube en dos minutos. El **teleférico de Montjuïc** sigue desde su estación superior hasta el castillo; los niños de 4 a 12 años pagan 11,70 € ida y vuelta en línea y los menores de 4 no pagan. El **teleférico del Puerto** es la opción panorámica sobre el puerto desde la Barceloneta.",
      "Cuando el teleférico o el funicular están cerrados, el Ayuntamiento indica el **bus 150** desde la plaza de Espanya.",
    ],
    castleTitle: "El castillo de Montjuïc",
    castle: [
      "El castillo cuesta **12 €** (8 € reducida; menores de 16 gratis) y es **gratis los domingos a partir de las 15:00 y todo el primer domingo** de cada mes. Abre de 10:00 a 20:00 hasta el 31 de octubre y de 10:00 a 18:00 desde el 1 de noviembre; las taquillas cierran media hora antes.",
    ],
    faq: [
      { question: "¿Cuándo es el espectáculo de la Fuente Mágica?", answer: "En octubre de 2026, de jueves a sábado de 21:00 a 22:00. Los días cambian cada mes: consulta el calendario del Ayuntamiento." },
      { question: "¿Cuánto cuesta el teleférico de Montjuïc?", answer: "17,10 € ida y vuelta en línea o 19 € en taquilla, 12 € ida; niños de 4 a 12 años, 11,70 € ida y vuelta en línea. Comprobado el 12 de octubre de 2026." },
      { question: "¿Se puede usar el billete de metro en el funicular de Montjuïc?", answer: "Sí: el funicular forma parte de la red integrada y acepta el billete sencillo y los abonos." },
      { question: "¿El castillo de Montjuïc es gratis?", answer: "Los domingos desde las 15:00 y todo el primer domingo de cada mes; si no, 12 €." },
    ],
    note: "Los días de espectáculo y los horarios de temporada cambian: consulta los calendarios oficiales antes de ir.",
  },
  ca: {
    lead: "Montjuïc s'aixeca just sobre la plaça d'Espanya: la **Font Màgica** al peu, el **castell** a dalt, i quatre maneres de pujar-hi, dues amb un bitllet de metro normal.",
    fountainTitle: "La Font Màgica",
    fountain: [
      "Els espectacles de música i llum de la font es fan certs vespres que canvien segons la temporada. L'octubre de 2026 són **de dijous a dissabte de 21:00 a 22:00**, en dos passis de mitja hora. L'Ajuntament publica els dies de cada mes al seu calendari; a principis del 2026 no hi va haver espectacles de gener a març, i van tornar a l'abril.",
      "La font funciona amb aigua freàtica des del 2010 i va reobrir renovada el setembre de 2025.",
    ],
    upCaption: "Maneres de pujar a Montjuïc",
    upHeaders: ["Com", "Des d'on", "Preu", "Horari (hivern)"],
    upRows: [
      ["Funicular", "Metro Paral·lel (L2, L3)", "Bitllet de metro (2,90 € senzill) o abonament", "Des de les 7:30 feiners, 9:00 caps de setmana"],
      ["Telefèric de Montjuïc", "Final del funicular fins al castell", "17,10 € anada i tornada en línia, 19 € a taquilla; 12 € anada", "10:00–18:00 des del novembre"],
      ["Telefèric del Port", "Torre de la Barceloneta a Montjuïc", "12,50 € anada, 20 € anada i tornada", "11:00–17:30 des del 31 d'octubre"],
      ["Bus 150", "Plaça d'Espanya fins al castell", "Bitllet de metro", "Uns 20 minuts"],
    ],
    upNote: "De TMB, els operadors dels telefèrics i l'Ajuntament, comprovat el 12 d'octubre de 2026. El telefèric de Montjuïc tanca per manteniment anual (el 2026, del 2 de febrer a l'1 de març); el del Port tanca del 13 al 15 d'octubre de 2026.",
    upTitle: "Per on pujar",
    up: [
      "El **funicular** és el més barat: accepta els títols integrats i abonaments com la Hola Barcelona, i puja en dos minuts. El **telefèric de Montjuïc** continua des de l'estació superior fins al castell; els infants de 4 a 12 anys paguen 11,70 € anada i tornada en línia i els menors de 4 no paguen. El **telefèric del Port** és l'opció panoràmica sobre el port des de la Barceloneta.",
      "Quan el telefèric o el funicular són tancats, l'Ajuntament indica el **bus 150** des de la plaça d'Espanya.",
    ],
    castleTitle: "El castell de Montjuïc",
    castle: [
      "El castell costa **12 €** (8 € reduïda; menors de 16 gratis) i és **gratis els diumenges a partir de les 15:00 i tot el primer diumenge** de cada mes. Obre de 10:00 a 20:00 fins al 31 d'octubre i de 10:00 a 18:00 des de l'1 de novembre; les taquilles tanquen mitja hora abans.",
    ],
    faq: [
      { question: "Quan és l'espectacle de la Font Màgica?", answer: "L'octubre de 2026, de dijous a dissabte de 21:00 a 22:00. Els dies canvien cada mes: consulta el calendari de l'Ajuntament." },
      { question: "Quant costa el telefèric de Montjuïc?", answer: "17,10 € anada i tornada en línia o 19 € a taquilla, 12 € anada; infants de 4 a 12 anys, 11,70 € anada i tornada en línia. Comprovat el 12 d'octubre de 2026." },
      { question: "Es pot fer servir el bitllet de metro al funicular de Montjuïc?", answer: "Sí: el funicular forma part de la xarxa integrada i accepta el bitllet senzill i els abonaments." },
      { question: "El castell de Montjuïc és gratis?", answer: "Els diumenges a partir de les 15:00 i tot el primer diumenge de cada mes; si no, 12 €." },
    ],
    note: "Els dies d'espectacle i els horaris de temporada canvien: consulta els calendaris oficials abans d'anar-hi.",
  },
};

function montjuicBody(locale: Locale) {
  const t = MONTJUIC_COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.fountainTitle, ...t.fountain),
    table(t.upCaption, t.upHeaders, t.upRows, t.upNote),
    ...h2(t.upTitle, ...t.up),
    ...h2(t.castleTitle, ...t.castle),
    faq(t.faq),
    ...b2Related(["tibidabo", "museums", "cards", "transport"], locale),
  ];
}

export const MONTJUIC: B2Article = {
  key: "montjuic",
  entryKey: "guide-montjuic-fountain-cable-car",
  categoryKey: "cities",
  sources: MONTJUIC_SOURCES,
  heroKey: "montjuic-font-magica-nit",
  heroAlt: {
    ca: "La Font Màgica de Montjuïc il·luminada de nit amb públic al voltant i les torres de la plaça d'Espanya al fons",
    es: "La Fuente Mágica de Montjuïc iluminada de noche con público alrededor y las torres de la plaza de Espanya al fondo",
    en: "The Magic Fountain of Montjuïc lit up at night, with crowds around it and the Plaça d'Espanya towers behind",
  },
  heroCaption: {
    ca: "La Font Màgica, al peu de Montjuïc.",
    es: "La Fuente Mágica, al pie de Montjuïc.",
    en: "The Magic Fountain at the foot of Montjuïc.",
  },
  secondaryKey: "montjuic-teleferic-cabina",
  secondaryAlt: {
    ca: "Una cabina del telefèric de Montjuïc arribant a l'estació inferior",
    es: "Una cabina del teleférico de Montjuïc llegando a la estación inferior",
    en: "A Montjuïc cable-car cabin arriving at the lower station",
  },
  secondaryCaption: {
    ca: "El telefèric de Montjuïc puja fins al castell.",
    es: "El teleférico de Montjuïc sube hasta el castillo.",
    en: "The Montjuïc cable car runs up to the castle.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T00:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...MONTJUIC_META[locale], blocks: montjuicBody(locale) }]),
  ) as B2Article["editions"],
};

/* ========================================================================== */
/* Tibidabo                                                                   */
/* ========================================================================== */

const TIBIDABO_SOURCES: B2Source[] = [
  { name: "Tibidabo — tarifes", url: "https://www.tibidabo.cat/ca/planifica-la-visita/tarifes", publisher: "Parc d'Atraccions Tibidabo (BSM)" },
  { name: "Tibidabo — horaris", url: "https://www.tibidabo.cat/ca/planifica-la-visita/horaris", publisher: "Parc d'Atraccions Tibidabo (BSM)" },
  { name: "Cuca de Llum", url: "https://tibidabo.cat/en/funicular/cuca-de-llum", publisher: "Parc d'Atraccions Tibidabo (BSM)" },
  { name: "Tramvia Blau", url: "https://www.tmb.cat/ca/barcelona/altres-transports-tmb/tramvia-blau-tibidabo", publisher: "TMB" },
  { name: "Temple del Sagrat Cor — visites", url: "https://tibidabo.salesianos.edu/visites/", publisher: "Salesians" },
];

const TIBIDABO_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/tibidabo-parc-atraccions-com-arribar",
    title: "Tibidabo: parc d'atraccions, Sagrat Cor i com arribar-hi",
    seoTitle: "Tibidabo: horaris, preus i com arribar-hi",
    seoDescription:
      "El parc del Tibidabo obre els caps de setmana a la tardor (39 €). Com pujar-hi: FGC, bus 196 i la Cuca de Llum; el Tramvia Blau és tancat per obres.",
    excerpt: "Quan obre el parc del Tibidabo, quant costa, com s'hi puja ara que el Tramvia Blau és tancat i què hi ha al Sagrat Cor, amb dades oficials.",
  },
  es: {
    path: "guias/tibidabo-parque-atracciones-como-llegar",
    title: "Tibidabo: parque de atracciones, Sagrado Corazón y cómo llegar",
    seoTitle: "Tibidabo: horarios, precios y cómo llegar",
    seoDescription:
      "El parque del Tibidabo abre los fines de semana en otoño (39 €). Cómo subir: FGC, bus 196 y la Cuca de Llum; el Tramvia Blau está cerrado por obras.",
    excerpt: "Cuándo abre el parque del Tibidabo, cuánto cuesta, cómo se sube ahora que el Tramvia Blau está cerrado y qué hay en el Sagrado Corazón, con datos oficiales.",
  },
  en: {
    path: "guides/tibidabo-amusement-park-how-to-get-there",
    title: "Tibidabo: amusement park, Sagrat Cor and how to get there",
    seoTitle: "Tibidabo: opening days, prices and how to get there",
    seoDescription:
      "Tibidabo park opens at weekends in autumn (€39). Getting up: FGC, bus 196 and the Cuca de Llum funicular; the Tramvia Blau tram is closed for works.",
    excerpt: "When Tibidabo amusement park opens, what it costs, how to get up now the Tramvia Blau is closed, and the Sagrat Cor church at the top, from official sources.",
  },
};

type TT = {
  lead: string; openTitle: string; open: string[];
  priceCaption: string; priceHeaders: string[]; priceRows: string[][]; priceNote: string;
  getTitle: string; get: string[];
  churchTitle: string; church: string[];
  faq: { question: string; answer: string }[]; note: string;
};

const TIBIDABO_COPY: Record<Locale, TT> = {
  en: {
    lead: "Tibidabo is the summit of the Collserola ridge above Barcelona, with a century-old **amusement park** and the **Sagrat Cor** church on top. Outside summer the park opens on **weekends and holidays only**, so check the calendar before you go.",
    openTitle: "When it opens",
    open: [
      "In October and November 2026 the full park opens on **weekends and public holidays**, roughly from 11:00 until 19:00 or 21:00 depending on the day. On weekdays it is closed, but the **Panoramic Area** at the top, with the oldest rides, stays open (11:00–18:00 in October, 11:00–17:00 in November).",
      "In December the park opens at weekends and on 7, 8, 21–24 and 28–30 December, closes on 25–26 December and 1 January, and opens again 2–5 January before its winter break. The official calendar lists the exact hours for each day.",
    ],
    priceCaption: "Tibidabo tickets",
    priceHeaders: ["Ticket", "Over 120 cm", "90–120 cm", "Over 60"],
    priceRows: [
      ["Amusement park", "€39", "€15.50", "€11.70"],
      ["Emblematic rides pass (Panoramic Area)", "€21.50", "€11.80", "€9.10"],
    ],
    priceNote: "Under 90 cm free. Single rides €4. All tickets include the Cuca de Llum funicular and the TibiBus shuttles. From tibidabo.cat, 12 October 2026.",
    getTitle: "Getting up",
    get: [
      "**FGC train** (line L7) from Plaça Catalunya to Avinguda Tibidabo, then up to Plaça Doctor Andreu.",
      "The **Tramvia Blau** heritage tram is **closed for modernisation works**; TMB runs **bus 196** instead, daily from 7:30 to 22:00.",
      "From Plaça Doctor Andreu, the **Cuca de Llum** funicular climbs to the top in four minutes: €13.50 return on its own, or included with a park ticket.",
      "On park days, free **TibiBus** shuttles for ticket holders leave from Plaça Kennedy (Av. Tibidabo) and from the Vall d'Hebron car park.",
    ],
    churchTitle: "Sagrat Cor",
    church: [
      "The church's lift to the upper terraces, with an audio guide, costs €8; in October the basilica, terrace and lift open 10:30–18:45 and the crypt 9:00–20:00. The church says only tickets bought on its own website are valid.",
    ],
    faq: [
      { question: "Is Tibidabo amusement park open on weekdays?", answer: "Not in autumn: the full park opens on weekends and holidays, while the Panoramic Area also opens on weekdays." },
      { question: "How much is a Tibidabo ticket?", answer: "€39 for visitors over 120 cm, €15.50 for 90–120 cm, €11.70 for over-60s; under 90 cm free. The panoramic-area pass costs €21.50." },
      { question: "Is the Tramvia Blau running?", answer: "No, it is closed for modernisation works; bus 196 covers the route." },
      { question: "How do I get to Tibidabo by public transport?", answer: "FGC to Avinguda Tibidabo, bus 196 to Plaça Doctor Andreu, then the Cuca de Llum funicular to the top." },
    ],
    note: "Opening days change through the year: check the official calendar for your date.",
  },
  es: {
    lead: "El Tibidabo es la cima de la sierra de Collserola sobre Barcelona, con un **parque de atracciones** centenario y el templo del **Sagrado Corazón** arriba. Fuera del verano el parque abre **solo fines de semana y festivos**, así que mira el calendario antes de ir.",
    openTitle: "Cuándo abre",
    open: [
      "En octubre y noviembre de 2026 el parque completo abre **fines de semana y festivos**, aproximadamente de 11:00 a 19:00 o 21:00 según el día. Entre semana está cerrado, pero la **Zona Panorámica** de arriba, con las atracciones más antiguas, sigue abierta (de 11:00 a 18:00 en octubre, de 11:00 a 17:00 en noviembre).",
      "En diciembre el parque abre los fines de semana y el 7, 8, 21–24 y 28–30 de diciembre, cierra el 25 y 26 de diciembre y el 1 de enero, y vuelve a abrir del 2 al 5 de enero antes del parón de invierno. El calendario oficial da el horario exacto de cada día.",
    ],
    priceCaption: "Entradas del Tibidabo",
    priceHeaders: ["Entrada", "Más de 120 cm", "90–120 cm", "Mayores de 60"],
    priceRows: [
      ["Parque de atracciones", "39 €", "15,50 €", "11,70 €"],
      ["Pase de atracciones emblemáticas (Zona Panorámica)", "21,50 €", "11,80 €", "9,10 €"],
    ],
    priceNote: "Menos de 90 cm, gratis. Atracción suelta, 4 €. Todas las entradas incluyen el funicular Cuca de Llum y los TibiBus. De tibidabo.cat, 12 de octubre de 2026.",
    getTitle: "Cómo subir",
    get: [
      "**Tren de FGC** (línea L7) de plaza Catalunya a Avinguda Tibidabo, y después hasta la plaza Doctor Andreu.",
      "El **Tramvia Blau** está **cerrado por obras de modernización**; TMB lo sustituye con el **bus 196**, cada día de 7:30 a 22:00.",
      "Desde la plaza Doctor Andreu, el funicular **Cuca de Llum** sube a la cima en cuatro minutos: 13,50 € ida y vuelta por separado, o incluido con la entrada al parque.",
      "Los días de parque, los **TibiBus** gratuitos para quien tiene entrada salen de la plaza Kennedy (av. Tibidabo) y del aparcamiento de la Vall d'Hebron.",
    ],
    churchTitle: "Sagrado Corazón",
    church: [
      "El ascensor del templo a las terrazas superiores, con audioguía, cuesta 8 €; en octubre la basílica, la terraza y el ascensor abren de 10:30 a 18:45 y la cripta de 9:00 a 20:00. El templo advierte que solo valen las entradas compradas en su web.",
    ],
    faq: [
      { question: "¿Abre el Tibidabo entre semana?", answer: "No en otoño: el parque completo abre fines de semana y festivos, y la Zona Panorámica también entre semana." },
      { question: "¿Cuánto cuesta la entrada al Tibidabo?", answer: "39 € más de 120 cm, 15,50 € de 90 a 120 cm, 11,70 € mayores de 60; menos de 90 cm, gratis. El pase de la Zona Panorámica cuesta 21,50 €." },
      { question: "¿Funciona el Tramvia Blau?", answer: "No, está cerrado por obras de modernización; el bus 196 cubre el recorrido." },
      { question: "¿Cómo se llega al Tibidabo en transporte público?", answer: "FGC hasta Avinguda Tibidabo, bus 196 hasta la plaza Doctor Andreu y el funicular Cuca de Llum hasta arriba." },
    ],
    note: "Los días de apertura cambian a lo largo del año: consulta el calendario oficial para tu fecha.",
  },
  ca: {
    lead: "El Tibidabo és el cim de la serra de Collserola sobre Barcelona, amb un **parc d'atraccions** centenari i el temple del **Sagrat Cor** a dalt. Fora de l'estiu el parc obre **només caps de setmana i festius**, així que mira el calendari abans d'anar-hi.",
    openTitle: "Quan obre",
    open: [
      "L'octubre i el novembre de 2026 el parc complet obre **caps de setmana i festius**, aproximadament d'11:00 a 19:00 o 21:00 segons el dia. Entre setmana és tancat, però la **Zona Panoràmica** de dalt, amb les atraccions més antigues, continua oberta (d'11:00 a 18:00 a l'octubre, d'11:00 a 17:00 al novembre).",
      "Al desembre el parc obre els caps de setmana i el 7, 8, 21–24 i 28–30 de desembre, tanca el 25 i 26 de desembre i l'1 de gener, i torna a obrir del 2 al 5 de gener abans de l'aturada d'hivern. El calendari oficial dona l'horari exacte de cada dia.",
    ],
    priceCaption: "Entrades del Tibidabo",
    priceHeaders: ["Entrada", "Més de 120 cm", "90–120 cm", "Majors de 60"],
    priceRows: [
      ["Parc d'atraccions", "39 €", "15,50 €", "11,70 €"],
      ["Passi d'atraccions emblemàtiques (Zona Panoràmica)", "21,50 €", "11,80 €", "9,10 €"],
    ],
    priceNote: "Menys de 90 cm, gratis. Atracció solta, 4 €. Totes les entrades inclouen el funicular Cuca de Llum i els TibiBus. De tibidabo.cat, 12 d'octubre de 2026.",
    getTitle: "Com pujar-hi",
    get: [
      "**Tren de FGC** (línia L7) de plaça Catalunya a Avinguda Tibidabo, i després fins a la plaça Doctor Andreu.",
      "El **Tramvia Blau** és **tancat per obres de modernització**; TMB el substitueix amb el **bus 196**, cada dia de 7:30 a 22:00.",
      "Des de la plaça Doctor Andreu, el funicular **Cuca de Llum** puja al cim en quatre minuts: 13,50 € anada i tornada per separat, o inclòs amb l'entrada al parc.",
      "Els dies de parc, els **TibiBus** gratuïts per a qui té entrada surten de la plaça Kennedy (av. Tibidabo) i de l'aparcament de la Vall d'Hebron.",
    ],
    churchTitle: "Sagrat Cor",
    church: [
      "L'ascensor del temple a les terrasses superiors, amb audioguia, costa 8 €; a l'octubre la basílica, la terrassa i l'ascensor obren de 10:30 a 18:45 i la cripta de 9:00 a 20:00. El temple avisa que només valen les entrades comprades al seu web.",
    ],
    faq: [
      { question: "Obre el Tibidabo entre setmana?", answer: "No a la tardor: el parc complet obre caps de setmana i festius, i la Zona Panoràmica també entre setmana." },
      { question: "Quant costa l'entrada al Tibidabo?", answer: "39 € més de 120 cm, 15,50 € de 90 a 120 cm, 11,70 € majors de 60; menys de 90 cm, gratis. El passi de la Zona Panoràmica costa 21,50 €." },
      { question: "Funciona el Tramvia Blau?", answer: "No, és tancat per obres de modernització; el bus 196 cobreix el recorregut." },
      { question: "Com s'hi arriba al Tibidabo en transport públic?", answer: "FGC fins a Avinguda Tibidabo, bus 196 fins a la plaça Doctor Andreu i el funicular Cuca de Llum fins a dalt." },
    ],
    note: "Els dies d'obertura canvien al llarg de l'any: consulta el calendari oficial per a la teva data.",
  },
};

function tibidaboBody(locale: Locale) {
  const t = TIBIDABO_COPY[locale];
  return [
    lead(t.lead),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    ...h2(t.openTitle, ...t.open),
    table(t.priceCaption, t.priceHeaders, t.priceRows, t.priceNote),
    ...h2(t.getTitle),
    list(...t.get),
    ...h2(t.churchTitle, ...t.church),
    faq(t.faq),
    ...b2Related(["montjuic", "museums", "transport"], locale),
  ];
}

export const TIBIDABO: B2Article = {
  key: "tibidabo",
  entryKey: "guide-tibidabo-park-how-to-get-there",
  categoryKey: "cities",
  sources: TIBIDABO_SOURCES,
  heroKey: "tibidabo-parc-nit-sagrat-cor",
  heroAlt: {
    ca: "La sínia i les atraccions del Tibidabo il·luminades al capvespre, amb el Sagrat Cor al fons",
    es: "La noria y las atracciones del Tibidabo iluminadas al atardecer, con el Sagrado Corazón al fondo",
    en: "Tibidabo's Ferris wheel and rides lit up at dusk, with the Sagrat Cor behind",
  },
  heroCaption: {
    ca: "La Zona Panoràmica del Tibidabo i el Sagrat Cor.",
    es: "La Zona Panorámica del Tibidabo y el Sagrado Corazón.",
    en: "Tibidabo's Panoramic Area and the Sagrat Cor.",
  },
  secondaryKey: "tibidabo-sagrat-cor-muntanya",
  secondaryAlt: {
    ca: "El Sagrat Cor i una torre del parc al cim del Tibidabo, entre el bosc",
    es: "El Sagrado Corazón y una torre del parque en la cima del Tibidabo, entre el bosque",
    en: "The Sagrat Cor and a park tower on the forested summit of Tibidabo",
  },
  secondaryCaption: {
    ca: "El cim del Tibidabo, a la serra de Collserola.",
    es: "La cima del Tibidabo, en la sierra de Collserola.",
    en: "The summit of Tibidabo on the Collserola ridge.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-13T00:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...TIBIDABO_META[locale], blocks: tibidaboBody(locale) }]),
  ) as B2Article["editions"],
};

export { MONTJUIC_META, TIBIDABO_META };
