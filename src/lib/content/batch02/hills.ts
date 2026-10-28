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
 *
 * Montjuïc re-checked 26 Oct 2026 (research_notes/rank-all/review-4-bcn-sights.md):
 * the fountain page still showed only "De l'1 al 31 d'octubre … Dijous,
 * divendres i dissabte … De 21.00 a 22.00 hores … 21.00 i 21.30 hores" and no
 * November schedule, so the copy says that October ended and points to the
 * calendar instead of stating show days past 31 October.
 */

const VERIFIED = "2026-10-26";

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
      "The fountain's music-and-light shows run on set evenings that change with the season. Until 31 October 2026 the shows ran Thursday, Friday and Saturday from 21:00 to 22:00, with choreographies at 21:00 and 21:30. On 26 October the City Council had not published show days for November onwards: check its calendar before you go. In early 2026 there were no shows from January to March, and they resumed in April.",
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
      { question: "When is the Magic Fountain show?", answer: "Until 31 October 2026 the shows ran Thursday, Friday and Saturday from 21:00 to 22:00, with choreographies at 21:00 and 21:30. On 26 October the City Council had not published show days for November onwards: check its calendar before you go." },
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
      "Los espectáculos de música y luz de la fuente se hacen ciertas tardes que cambian según la temporada. Hasta el 31 de octubre de 2026 los espectáculos fueron jueves, viernes y sábado de 21:00 a 22:00, con coreografías a las 21:00 y a las 21:30. El 26 de octubre el Ayuntamiento aún no había publicado los días a partir de noviembre: consulta su calendario antes de ir. A principios de 2026 no hubo espectáculos de enero a marzo, y volvieron en abril.",
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
      { question: "¿Cuándo es el espectáculo de la Fuente Mágica?", answer: "Hasta el 31 de octubre de 2026 los espectáculos fueron jueves, viernes y sábado de 21:00 a 22:00, con coreografías a las 21:00 y a las 21:30. El 26 de octubre el Ayuntamiento aún no había publicado los días a partir de noviembre: consulta su calendario antes de ir." },
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
      "Els espectacles de música i llum de la font es fan certs vespres que canvien segons la temporada. Fins al 31 d'octubre de 2026 els espectacles van ser dijous, divendres i dissabte de 21:00 a 22:00, amb coreografies a les 21:00 i a les 21:30. El 26 d'octubre l'Ajuntament encara no havia publicat els dies a partir del novembre: consulta'n el calendari abans d'anar-hi. A principis del 2026 no hi va haver espectacles de gener a març, i van tornar a l'abril.",
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
      { question: "Quan és l'espectacle de la Font Màgica?", answer: "Fins al 31 d'octubre de 2026 els espectacles van ser dijous, divendres i dissabte de 21:00 a 22:00, amb coreografies a les 21:00 i a les 21:30. El 26 d'octubre l'Ajuntament encara no havia publicat els dies a partir del novembre: consulta'n el calendari abans d'anar-hi." },
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
    ...b2Related(["tibidabo", "hours", "museums", "cards", "transport"], locale),
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

// Re-checked 23 Oct 2026 on tibidabo.cat (fares, hours, how to get there)
// and TMB (Tramvia Blau still closed, no reopening date): funicular fares,
// box-office discounts and parking added (research_notes/page1/castanyada_outings.md).
// Re-checked 26 Oct 2026 (research_notes/rank-all/review-4-bcn-sights.md):
// Sagrat Cor lift €8.50 and monthly hours from tibidabo.salesianos.edu/horaris/
// ("Ascensor: 8,5 € per persona"; Nov-Feb 10:30-17:45, Mar and Oct
// 10:30-18:45; no ticket office at the church). The park's calendar states
// only "Desembre: caps de setmana i 7, 8, 21, 22, 23, 24, 28, 29 i 30 de
// desembre" and lists only the Panoramic Area as closed on 25-26 December, so
// the park-closure claim went; the approximate park and Panoramic Area hours
// went too, because the page shows only today's hours. Montjuïc keeps its own
// date.
// Re-checked 28 Oct 2026 on tibidabo.cat (schedules and rates pages) and TMB
// (Tramvia Blau). Fixed: the €3.95 funicular fare is for over-60s ("+60
// years"), not over-65s. Added: the opening-days table by month (the
// schedules page's own rules), rides from 11:00 and ticket-office times, the
// Cuca de Llum's 10:00-14:00 on 25 and 26 December and 1 January, the top car
// park's address, booking and day rate from 3 h 15 min, the two TibiBus lines.
// Per-day closing times are not printed: the calendar shows one day at a time
// and could not be re-read in full today.
const TIBIDABO_VERIFIED = "2026-10-28";
const TIBIDABO_CALENDAR = "https://www.tibidabo.cat/ca/planifica-la-visita/horaris";

const TIBIDABO_SOURCES: B2Source[] = [
  { name: "Tibidabo — com arribar-hi", url: "https://www.tibidabo.cat/ca/planifica-la-visita/com-arribar", publisher: "Parc d'Atraccions Tibidabo (BSM)" },
  { name: "Tibidabo — tarifes", url: "https://www.tibidabo.cat/ca/planifica-la-visita/tarifes", publisher: "Parc d'Atraccions Tibidabo (BSM)" },
  { name: "Tibidabo — horaris", url: TIBIDABO_CALENDAR, publisher: "Parc d'Atraccions Tibidabo (BSM)" },
  { name: "Cuca de Llum", url: "https://tibidabo.cat/en/funicular/cuca-de-llum", publisher: "Parc d'Atraccions Tibidabo (BSM)" },
  { name: "Tramvia Blau", url: "https://www.tmb.cat/ca/barcelona/altres-transports-tmb/tramvia-blau-tibidabo", publisher: "TMB" },
  { name: "Temple del Sagrat Cor — visites", url: "https://tibidabo.salesianos.edu/visites/", publisher: "Salesians" },
  { name: "Temple del Sagrat Cor — horaris", url: "https://tibidabo.salesianos.edu/horaris/", publisher: "Salesians" },
];

const TIBIDABO_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/tibidabo-parc-atraccions-com-arribar",
    title: "Tibidabo: parc d'atraccions, Sagrat Cor i com arribar-hi",
    seoTitle: "Tibidabo: entrades, calendari i com pujar-hi en funicular",
    seoDescription:
      "El parc del Tibidabo obre els caps de setmana a la tardor (39 €). Com pujar-hi: FGC, bus 196 i la Cuca de Llum; el Tramvia Blau és tancat per obres.",
    excerpt: "Quan obre el parc del Tibidabo, quant costa, com s'hi puja ara que el Tramvia Blau és tancat i què hi ha al Sagrat Cor, amb dades oficials.",
  },
  es: {
    path: "guias/tibidabo-parque-atracciones-como-llegar",
    title: "Tibidabo: precio de la entrada, horario del parque, funicular y cómo llegar",
    seoTitle: "Tibidabo 2026: precio de la entrada, horario y cómo llegar",
    seoDescription:
      "El parque del Tibidabo abre los fines de semana en otoño (39 €). Cómo subir: FGC, bus 196 y la Cuca de Llum; el Tramvia Blau está cerrado por obras.",
    excerpt: "Cuándo abre el parque del Tibidabo, cuánto cuesta, cómo se sube ahora que el Tramvia Blau está cerrado y qué hay en el Sagrado Corazón, con datos oficiales.",
  },
  en: {
    path: "guides/tibidabo-amusement-park-how-to-get-there",
    title: "Tibidabo amusement park: ticket prices, opening hours, funicular and how to get there",
    seoTitle: "Tibidabo tickets and prices 2026, hours and how to get there",
    seoDescription:
      "Tibidabo tickets from €39 (funicular included), autumn opening days, Cuca de Llum fares, FGC + bus 196, discounts and parking. Tramvia Blau closed.",
    excerpt: "When Tibidabo amusement park opens, what it costs, how to get up now the Tramvia Blau is closed, and the Sagrat Cor church at the top, from official sources.",
  },
};

type TT = {
  lead: string; openTitle: string; open: string[];
  daysCaption: string; daysHeaders: string[]; daysRows: string[][]; daysNote: string;
  priceCaption: string; priceHeaders: string[]; priceRows: string[][]; priceNote: string;
  funicularTitle: string; funicular: string[];
  discountsTitle: string; discounts: string[];
  parkingTitle: string; parking: string[];
  getTitle: string; get: string[];
  churchTitle: string; church: string[];
  faq: { question: string; answer: string }[]; note: string;
};

const TIBIDABO_COPY: Record<Locale, TT> = {
  en: {
    lead: "A Tibidabo amusement-park ticket costs **€39** (over 120 cm) and includes the **Cuca de Llum** funicular; in autumn the full park opens on **weekends and public holidays only**. To get up, take the FGC L7 to Avinguda Tibidabo, then **bus 196** (the Tramvia Blau is closed for works) to Plaça Doctor Andreu and the funicular.",
    openTitle: "Tibidabo opening hours and days",
    open: [
      `In October and November 2026 the full park opens on **weekends and public holidays**. On weekdays it is closed, but the **Panoramic Area** at the top, with the oldest rides, stays open. [The official calendar gives each day's hours](${TIBIDABO_CALENDAR}).`,
      "The rides open at **11:00**. Ticket offices open at 10:00 at the Tibidabo Store, the Vall d'Hebron car park and the funicular's lower station, at 10:30 in Plaça del Tibidabo and at 11:00 at the top car park. Closing time changes from day to day, so check the calendar for yours.",
    ],
    daysCaption: "Tibidabo opening days, autumn and winter",
    daysHeaders: ["Month", "Amusement park", "Panoramic Area"],
    daysRows: [
      ["October and November", "Weekends and public holidays", "Every day"],
      ["December", "Weekends and 7, 8, 21, 22, 23, 24, 28, 29 and 30 December", "Every day except 25 and 26 December"],
      ["January", "2, 3, 4 and 5 January", "2, 3, 4 and 5 January"],
      ["February", "No opening days listed", "Weekends"],
    ],
    daysNote: "From the schedules page on tibidabo.cat, checked on 28 October 2026. The park reserves the right to change its timetables.",
    priceCaption: "Tibidabo tickets",
    priceHeaders: ["Ticket", "Over 120 cm", "90–120 cm", "Over 60"],
    priceRows: [
      ["Amusement park", "€39", "€15.50", "€11.70"],
      ["Emblematic rides pass (Panoramic Area)", "€21.50", "€11.80", "€9.10"],
    ],
    priceNote: "Under 90 cm free. Single rides €4. All tickets include the Cuca de Llum funicular and the TibiBus shuttles. From tibidabo.cat, 23 October 2026.",
    discountsTitle: "Discounts on the €39 ticket",
    discounts: [
      "At the box office, not online, the park takes 20% off with the Barcelona Card (€31.20) or an ISIC card, 35% off with a Zoo de Barcelona ticket (€25.35), two for one with the Carnet Jove, and €31.20 with a large-family or single-parent card; the Barcelona Card Family gets in free. Most of these discounts run until 5 January 2027.",
    ],
    funicularTitle: "Tibidabo funicular (Cuca de Llum): fares and times",
    funicular: [
      "On its own the funicular costs **€13.50** return, **€6.75** for children aged 4 to 12, large or single-parent families and Gaudir Més holders, and **€3.95** for over-60s (with ID or passport), disabled visitors, school groups (booked ahead) and Targeta Rosa holders; under-4s ride free. The reduced fares are sold only at the funicular ticket offices. It is included in every park ticket.",
      "On park days it runs from 10:30 until 30 minutes after the park closes, at least every 15 minutes; on days when only the Panoramic Area is open, from 11:00 until 15 minutes after closing. On 25 and 26 December and 1 January, when the park is closed, the funicular runs from 10:00 to 14:00.",
    ],
    parkingTitle: "Driving to Tibidabo: where to park",
    parking: [
      "The park's car park at the summit (Camí de Vallvidrera al Tibidabo, 49) charges €0.092 a minute, or €18 for the day from 3 hours 15 minutes, and has to be booked at least 24 hours ahead. A cheaper option is the Vall d'Hebron car park (€4.20 a day), from which the free TibiBus T2B runs up on park days.",
    ],
    getTitle: "Getting up",
    get: [
      "**FGC train** (line L7) from Plaça Catalunya to Avinguda Tibidabo, then up to Plaça Doctor Andreu.",
      "The **Tramvia Blau** heritage tram is **closed for modernisation works**; TMB runs **bus 196** instead, daily from 7:30 to 22:00.",
      "From Plaça Doctor Andreu, the **Cuca de Llum** funicular climbs to the top in four minutes: €13.50 return on its own, or included with a park ticket.",
      "On park days, free **TibiBus** shuttles for ticket holders leave from Plaça Kennedy (Av. Tibidabo) and from the Vall d'Hebron car park.",
    ],
    churchTitle: "Sagrat Cor",
    church: [
      "The church's lift to the second and third terraces, with an audio guide, costs €8.50. From November to February the basilica, terrace and lift open 10:30–17:45 (October and March 10:30–18:45); the crypt opens 9:00–20:00. There is no ticket office at the church: buy online in advance.",
    ],
    faq: [
      { question: "Is Tibidabo amusement park open on weekdays?", answer: "Not in autumn: the full park opens on weekends and holidays, while the Panoramic Area also opens on weekdays." },
      { question: "What are Tibidabo amusement park's opening hours?", answer: "Rides open at 11:00; closing time changes from day to day and is on the park's calendar. In October and November the full park opens at weekends and on public holidays." },
      { question: "How much is a Tibidabo ticket?", answer: "€39 for visitors over 120 cm, €15.50 for 90–120 cm, €11.70 for over-60s; under 90 cm free. The panoramic-area pass costs €21.50." },
      { question: "How much is the Tibidabo funicular?", answer: "€13.50 return on its own (€6.75 reduced, €3.95 for over-60s); it is included in every park ticket." },
      { question: "What is the TibiBus?", answer: "The park's free shuttle buses: the T2C from Plaça Kennedy (Av. Tibidabo), for anyone with a park, emblematic-rides or funicular ticket, and, on park days, the T2B from the Vall d'Hebron car park." },
      { question: "Is there a discount with the Barcelona Card?", answer: "Yes, 20% off at the box office (€31.20); the Barcelona Card Family gets in free." },
      { question: "Is the Tramvia Blau running?", answer: "No, it is closed for modernisation works; bus 196 covers the route." },
      { question: "How do I get to Tibidabo by public transport?", answer: "FGC to Avinguda Tibidabo, bus 196 to Plaça Doctor Andreu, then the Cuca de Llum funicular to the top." },
    ],
    note: "Opening days change through the year: check the official calendar for your date.",
  },
  es: {
    lead: "La entrada al parque de atracciones del Tibidabo cuesta **39 €** (más de 120 cm) e incluye el funicular **Cuca de Llum**; en otoño el parque completo abre **solo fines de semana y festivos**. Para subir, FGC L7 hasta Avinguda Tibidabo, **bus 196** (el Tramvia Blau está cerrado por obras) hasta la plaza Doctor Andreu y funicular.",
    openTitle: "Horario del Tibidabo y días de apertura",
    open: [
      `En octubre y noviembre de 2026 el parque completo abre **fines de semana y festivos**. Entre semana está cerrado, pero la **Zona Panorámica** de arriba, con las atracciones más antiguas, sigue abierta. [El calendario oficial da el horario de cada día](${TIBIDABO_CALENDAR}).`,
      "Las atracciones abren a las **11:00**. Las taquillas abren a las 10:00 en la Tibidabo Store, el aparcamiento de la Vall d'Hebron y la estación inferior del funicular, a las 10:30 en la plaza del Tibidabo y a las 11:00 en el aparcamiento de la cima. La hora de cierre cambia cada día: consúltala en el calendario.",
    ],
    daysCaption: "Días de apertura del Tibidabo, otoño e invierno",
    daysHeaders: ["Mes", "Parque de atracciones", "Zona Panorámica"],
    daysRows: [
      ["Octubre y noviembre", "Fines de semana y festivos", "Todos los días"],
      ["Diciembre", "Fines de semana y 7, 8, 21, 22, 23, 24, 28, 29 y 30 de diciembre", "Todos los días salvo el 25 y el 26"],
      ["Enero", "2, 3, 4 y 5 de enero", "2, 3, 4 y 5 de enero"],
      ["Febrero", "Sin días de apertura publicados", "Fines de semana"],
    ],
    daysNote: "De la página de horarios de tibidabo.cat, comprobada el 28 de octubre de 2026. El parque se reserva el derecho a cambiar los horarios.",
    priceCaption: "Entradas del Tibidabo",
    priceHeaders: ["Entrada", "Más de 120 cm", "90–120 cm", "Mayores de 60"],
    priceRows: [
      ["Parque de atracciones", "39 €", "15,50 €", "11,70 €"],
      ["Pase de atracciones emblemáticas (Zona Panorámica)", "21,50 €", "11,80 €", "9,10 €"],
    ],
    priceNote: "Menos de 90 cm, gratis. Atracción suelta, 4 €. Todas las entradas incluyen el funicular Cuca de Llum y los TibiBus. De tibidabo.cat, 23 de octubre de 2026.",
    discountsTitle: "Descuentos sobre la entrada de 39 €",
    discounts: [
      "En taquilla, no en línea, el parque descuenta un 20 % con la Barcelona Card (31,20 €) o el carnet ISIC, un 35 % con una entrada del Zoo de Barcelona (25,35 €), dos por uno con el Carnet Jove y deja la entrada en 31,20 € con el carnet de familia numerosa o monoparental; con la Barcelona Card Family se entra gratis. La mayoría de estos descuentos valen hasta el 5 de enero de 2027.",
    ],
    funicularTitle: "Funicular del Tibidabo (Cuca de Llum): precio y horario",
    funicular: [
      "Solo, el funicular cuesta **13,50 €** ida y vuelta, **6,75 €** para niños de 4 a 12 años, familias numerosas o monoparentales y titulares de Gaudir Més, y **3,95 €** para mayores de 60 (con DNI o pasaporte), personas con discapacidad, grupos escolares (con reserva previa) y titulares de la Targeta Rosa; los menores de 4 años no pagan. Las tarifas reducidas solo se venden en las taquillas del funicular. Está incluido en todas las entradas del parque.",
      "Los días de parque funciona de 10:30 hasta 30 minutos después del cierre, como mínimo cada 15 minutos; los días en que solo abre la Zona Panorámica, de 11:00 hasta 15 minutos después del cierre. El 25 y el 26 de diciembre y el 1 de enero, con el parque cerrado, el funicular funciona de 10:00 a 14:00.",
    ],
    parkingTitle: "Cómo llegar al Tibidabo en coche y dónde aparcar",
    parking: [
      "El aparcamiento del parque, en la cima (Camí de Vallvidrera al Tibidabo, 49), cuesta 0,092 € el minuto, o 18 € el día a partir de 3 horas y 15 minutos, y hay que reservarlo con 24 horas como mínimo. Más barato es el aparcamiento de la Vall d'Hebron (4,20 € el día), desde donde sube el TibiBus T2B gratuito los días de parque.",
    ],
    getTitle: "Cómo subir",
    get: [
      "**Tren de FGC** (línea L7) de plaza Catalunya a Avinguda Tibidabo, y después hasta la plaza Doctor Andreu.",
      "El **Tramvia Blau** está **cerrado por obras de modernización**; TMB lo sustituye con el **bus 196**, cada día de 7:30 a 22:00.",
      "Desde la plaza Doctor Andreu, el funicular **Cuca de Llum** sube a la cima en cuatro minutos: 13,50 € ida y vuelta por separado, o incluido con la entrada al parque.",
      "Los días de parque, los **TibiBus** gratuitos para quien tiene entrada salen de la plaza Kennedy (av. Tibidabo) y del aparcamiento de la Vall d'Hebron.",
    ],
    churchTitle: "Sagrado Corazón",
    church: [
      "El ascensor del templo a las terrazas segunda y tercera, con audioguía, cuesta 8,50 €. De noviembre a febrero la basílica, la terraza y el ascensor abren de 10:30 a 17:45 (octubre y marzo, de 10:30 a 18:45); la cripta, de 9:00 a 20:00. El templo no tiene taquilla: hay que comprar en línea con antelación.",
    ],
    faq: [
      { question: "¿Abre el Tibidabo entre semana?", answer: "No en otoño: el parque completo abre fines de semana y festivos, y la Zona Panorámica también entre semana." },
      { question: "¿Cuál es el horario del Tibidabo?", answer: "Las atracciones abren a las 11:00; la hora de cierre cambia cada día y está en el calendario del parque. En octubre y noviembre el parque completo abre fines de semana y festivos." },
      { question: "¿Cuánto vale la entrada al Tibidabo?", answer: "39 € más de 120 cm, 15,50 € de 90 a 120 cm, 11,70 € mayores de 60; menos de 90 cm, gratis. El pase de la Zona Panorámica cuesta 21,50 €." },
      { question: "¿Cuánto cuesta el funicular del Tibidabo?", answer: "13,50 € ida y vuelta por separado (6,75 € reducido, 3,95 € mayores de 60); está incluido en todas las entradas del parque." },
      { question: "¿Cuál es el horario del funicular del Tibidabo?", answer: "Los días de parque, de 10:30 hasta 30 minutos después del cierre; los días de Zona Panorámica, de 11:00 hasta 15 minutos después. El 25 y el 26 de diciembre y el 1 de enero, de 10:00 a 14:00." },
      { question: "¿Qué es el TibiBus?", answer: "Las lanzaderas gratuitas del parque: el T2C desde la plaza Kennedy (av. Tibidabo), para quien tiene entrada, pase o billete del funicular, y, los días de parque, el T2B desde el aparcamiento de la Vall d'Hebron." },
      { question: "¿Hay descuento con la Barcelona Card?", answer: "Sí, un 20 % en taquilla (31,20 €); con la Barcelona Card Family se entra gratis." },
      { question: "¿Funciona el Tramvia Blau?", answer: "No, está cerrado por obras de modernización; el bus 196 cubre el recorrido." },
      { question: "¿Cómo se llega al Tibidabo en transporte público?", answer: "FGC hasta Avinguda Tibidabo, bus 196 hasta la plaza Doctor Andreu y el funicular Cuca de Llum hasta arriba." },
    ],
    note: "Los días de apertura cambian a lo largo del año: consulta el calendario oficial para tu fecha.",
  },
  ca: {
    lead: "L'entrada al parc d'atraccions del Tibidabo costa **39 €** (més de 120 cm) i inclou el funicular **Cuca de Llum**; a la tardor el parc complet obre **només caps de setmana i festius**. Per pujar-hi, FGC L7 fins a Avinguda Tibidabo, **bus 196** (el Tramvia Blau és tancat per obres) fins a la plaça Doctor Andreu i funicular.",
    openTitle: "Horari del Tibidabo i dies d'obertura",
    open: [
      `L'octubre i el novembre de 2026 el parc complet obre **caps de setmana i festius**. Entre setmana és tancat, però la **Zona Panoràmica** de dalt, amb les atraccions més antigues, continua oberta. [El calendari oficial dona l'horari de cada dia](${TIBIDABO_CALENDAR}).`,
      "Les atraccions obren a les **11:00**. Les taquilles obren a les 10:00 a la Tibidabo Store, l'aparcament de la Vall d'Hebron i l'estació inferior del funicular, a les 10:30 a la plaça del Tibidabo i a les 11:00 a l'aparcament del cim. L'hora de tancament canvia cada dia: consulta-la al calendari.",
    ],
    daysCaption: "Dies d'obertura del Tibidabo, tardor i hivern",
    daysHeaders: ["Mes", "Parc d'atraccions", "Zona Panoràmica"],
    daysRows: [
      ["Octubre i novembre", "Caps de setmana i festius", "Cada dia"],
      ["Desembre", "Caps de setmana i 7, 8, 21, 22, 23, 24, 28, 29 i 30 de desembre", "Cada dia excepte el 25 i el 26"],
      ["Gener", "2, 3, 4 i 5 de gener", "2, 3, 4 i 5 de gener"],
      ["Febrer", "Sense dies d'obertura publicats", "Caps de setmana"],
    ],
    daysNote: "De la pàgina d'horaris de tibidabo.cat, comprovada el 28 d'octubre de 2026. El parc es reserva el dret de canviar els horaris.",
    priceCaption: "Entrades del Tibidabo",
    priceHeaders: ["Entrada", "Més de 120 cm", "90–120 cm", "Majors de 60"],
    priceRows: [
      ["Parc d'atraccions", "39 €", "15,50 €", "11,70 €"],
      ["Passi d'atraccions emblemàtiques (Zona Panoràmica)", "21,50 €", "11,80 €", "9,10 €"],
    ],
    priceNote: "Menys de 90 cm, gratis. Atracció solta, 4 €. Totes les entrades inclouen el funicular Cuca de Llum i els TibiBus. De tibidabo.cat, 23 d'octubre de 2026.",
    discountsTitle: "Descomptes sobre l'entrada de 39 €",
    discounts: [
      "A la taquilla, no en línia, el parc descompta un 20 % amb la Barcelona Card (31,20 €) o el carnet ISIC, un 35 % amb una entrada del Zoo de Barcelona (25,35 €), dos per un amb el Carnet Jove i deixa l'entrada en 31,20 € amb el carnet de família nombrosa o monoparental; amb la Barcelona Card Family s'hi entra gratis. La majoria d'aquests descomptes valen fins al 5 de gener de 2027.",
    ],
    funicularTitle: "Funicular del Tibidabo (Cuca de Llum): preu i horari",
    funicular: [
      "Sol, el funicular costa **13,50 €** anada i tornada, **6,75 €** per a infants de 4 a 12 anys, famílies nombroses o monoparentals i titulars de Gaudir Més, i **3,95 €** per a majors de 60 (amb DNI o passaport), persones amb discapacitat, grups escolars (amb reserva prèvia) i titulars de la Targeta Rosa; els menors de 4 anys no paguen. Les tarifes reduïdes només es venen a les taquilles del funicular. És inclòs a totes les entrades del parc.",
      "Els dies de parc funciona de 10:30 fins a 30 minuts després del tancament, com a mínim cada 15 minuts; els dies que només obre la Zona Panoràmica, d'11:00 fins a 15 minuts després del tancament. El 25 i el 26 de desembre i l'1 de gener, amb el parc tancat, el funicular funciona de 10:00 a 14:00.",
    ],
    parkingTitle: "Com arribar al Tibidabo en cotxe i on aparcar",
    parking: [
      "L'aparcament del parc, al cim (Camí de Vallvidrera al Tibidabo, 49), costa 0,092 € el minut, o 18 € el dia a partir de 3 hores i 15 minuts, i cal reservar-lo amb 24 hores com a mínim. Més barat és l'aparcament de la Vall d'Hebron (4,20 € el dia), des d'on puja el TibiBus T2B gratuït els dies de parc.",
    ],
    getTitle: "Com pujar-hi",
    get: [
      "**Tren de FGC** (línia L7) de plaça Catalunya a Avinguda Tibidabo, i després fins a la plaça Doctor Andreu.",
      "El **Tramvia Blau** és **tancat per obres de modernització**; TMB el substitueix amb el **bus 196**, cada dia de 7:30 a 22:00.",
      "Des de la plaça Doctor Andreu, el funicular **Cuca de Llum** puja al cim en quatre minuts: 13,50 € anada i tornada per separat, o inclòs amb l'entrada al parc.",
      "Els dies de parc, els **TibiBus** gratuïts per a qui té entrada surten de la plaça Kennedy (av. Tibidabo) i de l'aparcament de la Vall d'Hebron.",
    ],
    churchTitle: "Sagrat Cor",
    church: [
      "L'ascensor del temple a les terrasses segona i tercera, amb audioguia, costa 8,50 €. De novembre a febrer la basílica, la terrassa i l'ascensor obren de 10:30 a 17:45 (octubre i març, de 10:30 a 18:45); la cripta, de 9:00 a 20:00. El temple no té taquilla: cal comprar en línia amb antelació.",
    ],
    faq: [
      { question: "Obre el Tibidabo entre setmana?", answer: "No a la tardor: el parc complet obre caps de setmana i festius, i la Zona Panoràmica també entre setmana." },
      { question: "Quant costa l'entrada al Tibidabo?", answer: "39 € més de 120 cm, 15,50 € de 90 a 120 cm, 11,70 € majors de 60; menys de 90 cm, gratis. El passi de la Zona Panoràmica costa 21,50 €." },
      { question: "Quant costa el funicular del Tibidabo?", answer: "13,50 € anada i tornada per separat (6,75 € reduït, 3,95 € majors de 60); és inclòs a totes les entrades del parc." },
      { question: "Hi ha descompte amb la Barcelona Card?", answer: "Sí, un 20 % a la taquilla (31,20 €); amb la Barcelona Card Family s'hi entra gratis." },
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
    callout("official", verifiedLine(locale, TIBIDABO_VERIFIED), t.note),
    ...h2(t.openTitle, ...t.open),
    table(t.daysCaption, t.daysHeaders, t.daysRows, t.daysNote),
    table(t.priceCaption, t.priceHeaders, t.priceRows, t.priceNote),
    ...h2(t.discountsTitle, ...t.discounts),
    ...h2(t.getTitle),
    list(...t.get),
    ...h2(t.funicularTitle, ...t.funicular),
    ...h2(t.parkingTitle, ...t.parking),
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
  verifiedAt: TIBIDABO_VERIFIED,
  publishedAt: "2026-10-13T00:30:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [locale, { ...TIBIDABO_META[locale], blocks: tibidaboBody(locale) }]),
  ) as B2Article["editions"],
};

export { MONTJUIC_META, TIBIDABO_META };
