import type { B2Key } from "@/lib/content/batch02/shared";

import type { PlaceKind } from "./types";

/**
 * The places of the family, and what was verified about each on the
 * operators' own pages and the Generalitat's (28 Oct 2026).
 *
 * The list: the alpine and cross-country resorts that ACEM's own pages name
 * (acem-cat.com no longer resolves; its pages, reached from Baqueira's
 * footer, date from 2018) plus Port del Comte, which sells 2026-27 season
 * passes on its site, and the seven Tot Nòrdic stations (guils.com: "una de
 * les 7 estacions d'esquí nòrdic de Catalunya"). Tuixent-La Vansa is left
 * out of this tranche: the ICGC nomenclator has no toponym for its ski area
 * to measure distances from.
 *
 * Which Meteocat station stands for a place is NOT written here: the
 * snapshot script computes it from the ICGC toponym below and Meteocat's
 * station metadata, with the threshold in prepare.ts. A place whose stations
 * all fail it keeps a line on the hub and gets no page.
 */

export interface OfficialLink {
  kind: "snow" | "webcams" | "site" | "access";
  label: { ca: string; es: string; en: string };
  url: string;
}

export interface PlaceDef {
  slug: string;
  kind: PlaceKind;
  /** As written mid-sentence: ca "la Molina", es "La Molina". */
  name: { ca: string; es: string; en: string };
  /** The place with its preposition, for titles: "a la Molina", "en La Molina". */
  inPlace: { ca: string; es: string };
  /** The official toponym used as the reference point (ICGC nomenclator), with its municipal code. */
  icgc: { name: string; municipalityCode: string; query?: string };
  /** Lowest and highest point of the ski area, as the operator publishes it; null for summits and lakes, or when unpublished. */
  altitude: { min: number; max: number; source: string } | null;
  /** Official pages: snow report, webcams, the operator's site, access. */
  links: OfficialLink[];
  /** Getting there, as the official page states it (short), with that page. */
  access: { ca: string; es: string; source: string } | null;
  /** A verified fact particular to the place, worth saying on its page. */
  note: { ca: string; es: string; source: string } | null;
  /** In AEMET's "Pirineo Catalán" mountain forecast area and the ICGC avalanche bulletin. */
  pyrenees: boolean;
  /** Existing guides worth reading next. */
  guides: B2Key[];
}

const label = (ca: string, es: string, en: string) => ({ ca, es, en });

/** The six FGC resorts share a URL pattern on PIRINEU365 (checked one by one on 28 Oct 2026). */
function fgc(resort: string, name: string): OfficialLink[] {
  return [
    { kind: "snow", label: label(`Infoneu ${name} (PIRINEU365)`, `Infoneu ${name} (PIRINEU365)`, `${name} Infoneu (PIRINEU365)`), url: `https://pirineu365.cat/${resort}/en-directe/infoneu/` },
    { kind: "webcams", label: label(`Càmeres web ${/^[AEIOUÀÈÉÍÒÓÚ]/.test(name) ? "d'" : "de "}${name}`, `Webcams de ${name}`, `${name} webcams`), url: `https://pirineu365.cat/${resort}/en-directe/webcams/` },
  ];
}

const NO_NOTE = null;

export const PLACE_DEFS: readonly PlaceDef[] = [
  /* ------------------------------ Alpine resorts ------------------------------ */
  {
    slug: "baqueira-beret",
    kind: "resort",
    name: label("Baqueira Beret", "Baqueira Beret", "Baqueira Beret"),
    inPlace: { ca: "a Baqueira Beret", es: "en Baqueira Beret" },
    icgc: { name: "Estació d'esquí de Baqueira - Beret", municipalityCode: "250254", query: "Estació d'esquí de Baqueira-Beret" },
    altitude: { min: 1500, max: 2610, source: "https://www.baqueira.es/es/datos-tecnicos" },
    links: [
      { kind: "snow", label: label("Estat de l'estació (Baqueira Beret)", "Estado de la estación (Baqueira Beret)", "Resort status (Baqueira Beret)"), url: "https://www.baqueira.es/es/estado-de-la-estacion" },
      { kind: "webcams", label: label("Càmeres web de Baqueira Beret", "Webcams de Baqueira Beret", "Baqueira Beret webcams"), url: "https://www.baqueira.es/es/webcams" },
      { kind: "site", label: label("Dades tècniques de Baqueira Beret", "Datos técnicos de Baqueira Beret", "Baqueira Beret technical data"), url: "https://www.baqueira.es/es/datos-tecnicos" },
    ],
    access: {
      ca: "autobusos d'ALSA fins a Vielha i, des d'allà, el bus local línia VA fins a Baqueira",
      es: "autobuses de ALSA hasta Vielha y, desde allí, el autobús local línea VA hasta Baqueira",
      source: "https://www.baqueira.es/es/como-llegar",
    },
    note: {
      ca: "Baqueira Beret té quatre sectors: Baqueira, Beret, Bonaigua i Baciver. L'estació del Meteocat que la representa és al port de la Bonaigua, segons les dades del Meteocat, a l'est del domini: descriu millor aquell extrem que Beret o Baqueira 1500.",
      es: "Baqueira Beret tiene cuatro sectores: Baqueira, Beret, Bonaigua y Baciver. La estación de Meteocat que la representa está en el puerto de la Bonaigua, según los datos de Meteocat, al este del dominio: describe mejor ese extremo que Beret o Baqueira 1500.",
      source: "https://www.baqueira.es/es/datos-tecnicos",
    },
    pyrenees: true,
    guides: ["ski", "snowNow", "snow"],
  },
  {
    slug: "la-molina",
    kind: "resort",
    name: label("la Molina", "La Molina", "La Molina"),
    inPlace: { ca: "a la Molina", es: "en La Molina" },
    icgc: { name: "Estació d'esquí de la Molina", municipalityCode: "170062" },
    altitude: { min: 1667, max: 2537, source: "https://pirineu365.cat/lamolina/estacio/planol-pistes-fitxa-tecnica/" },
    links: [
      ...fgc("lamolina", "La Molina"),
      { kind: "site", label: label("Fitxa tècnica de la Molina", "Ficha técnica de La Molina", "La Molina technical sheet"), url: "https://pirineu365.cat/lamolina/estacio/planol-pistes-fitxa-tecnica/" },
    ],
    access: {
      ca: "tren R3 fins a l'estació de la Molina i bus intern de l'estació de Renfe fins a Pista Llarga; FGC hi avisa de les obres de desdoblament de l'R3",
      es: "tren R3 hasta la estación de La Molina y bus interno desde la estación de Renfe hasta Pista Llarga; FGC avisa de las obras de desdoblamiento de la R3",
      source: "https://pirineu365.cat/lamolina/estacio/informacio-tecnica/",
    },
    note: NO_NOTE,
    pyrenees: true,
    guides: ["ski", "cerdanya", "snowNow", "snow"],
  },
  {
    slug: "masella",
    kind: "resort",
    name: label("Masella", "Masella", "Masella"),
    inPlace: { ca: "a Masella", es: "en Masella" },
    icgc: { name: "Estació d'esquí de Masella", municipalityCode: "170062" },
    altitude: { min: 1600, max: 2535, source: "https://www.masella.com/ca/paginas/fitxa-tecnica" },
    links: [
      { kind: "snow", label: label("Info neu de Masella", "Info nieve de Masella", "Masella snow report"), url: "https://www.masella.com/ca/infoneu" },
      { kind: "webcams", label: label("Càmeres web de Masella", "Webcams de Masella", "Masella webcams"), url: "https://www.masella.com/ca/webcam" },
      { kind: "site", label: label("Fitxa tècnica de Masella", "Ficha técnica de Masella", "Masella technical sheet"), url: "https://www.masella.com/ca/paginas/fitxa-tecnica" },
    ],
    access: {
      ca: "el Ski Bus la Molina + Masella de Sagalés, que FGC anuncia a la pàgina de la Molina",
      es: "el Ski Bus La Molina + Masella de Sagalés, que FGC anuncia en la página de La Molina",
      source: "https://pirineu365.cat/lamolina/estacio/informacio-tecnica/",
    },
    note: NO_NOTE,
    pyrenees: true,
    guides: ["ski", "cerdanya", "snowNow", "snow"],
  },
  {
    slug: "boi-taull",
    kind: "resort",
    name: label("Boí Taüll", "Boí Taüll", "Boí Taüll"),
    inPlace: { ca: "a Boí Taüll", es: "en Boí Taüll" },
    icgc: { name: "Estació d'esquí de Boí-Taüll", municipalityCode: "250432", query: "Estació d'esquí de Boí Taüll" },
    altitude: { min: 2040, max: 2751, source: "https://pirineu365.cat/boitaull/estacio/planol-pistes/" },
    links: [...fgc("boitaull", "Boí Taüll")],
    access: {
      ca: "el Bus de la Neu des de Vilaller fins a peu de pistes (FGC el publica amb calendari provisional)",
      es: "el Bus de la Neu desde Vilaller hasta pie de pistas (FGC lo publica con calendario provisional)",
      source: "https://pirineu365.cat/boitaull/estacio/informacio-practica/",
    },
    note: NO_NOTE,
    pyrenees: true,
    guides: ["ski", "snowNow", "snow"],
  },
  {
    slug: "espot",
    kind: "resort",
    name: label("Espot Esquí", "Espot Esquí", "Espot Esquí"),
    inPlace: { ca: "a Espot Esquí", es: "en Espot Esquí" },
    icgc: { name: "Estació d'esquí d'Espot Esquí", municipalityCode: "250827", query: "Estació d'esquí d'Espot" },
    altitude: { min: 1500, max: 2500, source: "https://pirineu365.cat/espotesqui/estacio/planol-de-pistes/" },
    links: [...fgc("espotesqui", "Espot Esquí")],
    access: {
      ca: "l'ALSA Ski Bus (el 28 d'octubre de 2026 la pàgina encara mostrava les dates de la temporada 2025-26)",
      es: "el ALSA Ski Bus (el 28 de octubre de 2026 la página aún mostraba las fechas de la temporada 2025-26)",
      source: "https://pirineu365.cat/espotesqui/estacio/informacio-practica/",
    },
    note: NO_NOTE,
    pyrenees: true,
    guides: ["ski", "snowNow", "snow"],
  },
  {
    slug: "port-aine",
    kind: "resort",
    name: label("Port Ainé", "Port Ainé", "Port Ainé"),
    inPlace: { ca: "a Port Ainé", es: "en Port Ainé" },
    icgc: { name: "Estació d'esquí de Port-Ainé", municipalityCode: "251832" },
    altitude: { min: 1650, max: 2440, source: "https://pirineu365.cat/portaine/estacio/planol-pistes/" },
    links: [...fgc("portaine", "Port Ainé")],
    access: {
      ca: "l'ALSA Ski Bus i el Taxi de la Neu des de Sort",
      es: "el ALSA Ski Bus y el Taxi de la Neu desde Sort",
      source: "https://pirineu365.cat/portaine/estacio/informacio-practica/",
    },
    note: NO_NOTE,
    pyrenees: true,
    guides: ["ski", "snowNow", "snow"],
  },
  {
    slug: "vallter",
    kind: "resort",
    name: label("Vallter", "Vallter", "Vallter"),
    inPlace: { ca: "a Vallter", es: "en Vallter" },
    icgc: { name: "Estació d'esquí de Vallter 2000", municipalityCode: "171925" },
    altitude: { min: 2000, max: 2535, source: "https://pirineu365.cat/vallter/estacio/planol-de-pistes/" },
    links: [...fgc("vallter", "Vallter")],
    access: null,
    note: NO_NOTE,
    pyrenees: true,
    guides: ["ski", "setcases", "ripolles", "snowNow", "snow"],
  },
  {
    slug: "vall-de-nuria",
    kind: "resort",
    name: label("la Vall de Núria", "la Vall de Núria", "Vall de Núria"),
    inPlace: { ca: "a la Vall de Núria", es: "en la Vall de Núria" },
    icgc: { name: "Estació de Muntanya Vall de Núria", municipalityCode: "170433" },
    altitude: { min: 1964, max: 2252, source: "https://pirineu365.cat/valldenuria/estacio/planol-de-pistes/" },
    links: [...fgc("valldenuria", "Vall de Núria")],
    access: {
      ca: "l'R3 fins a Ribes-Enllaç i el Cremallera de Núria, l'únic transport per arribar-hi",
      es: "la R3 hasta Ribes-Enllaç y el Cremallera de Núria, el único transporte para llegar",
      source: "https://pirineu365.cat/valldenuria/estacio/planol-de-pistes/",
    },
    note: NO_NOTE,
    pyrenees: true,
    guides: ["nuria", "ski", "ripolles", "snowNow", "snow"],
  },
  {
    slug: "port-del-comte",
    kind: "resort",
    name: label("Port del Comte", "Port del Comte", "Port del Comte"),
    inPlace: { ca: "a Port del Comte", es: "en Port del Comte" },
    icgc: { name: "Estació d'esquí de Port del Comte", municipalityCode: "251636", query: "Estació d'esquí del Port del Comte" },
    // Not published as a range on its pages on 28 Oct 2026.
    altitude: null,
    links: [
      { kind: "snow", label: label("Estat de les pistes de Port del Comte", "Estado de las pistas de Port del Comte", "Port del Comte runs status"), url: "https://portdelcomte.net/pistes/" },
      { kind: "webcams", label: label("Càmeres web i meteo de Port del Comte", "Webcams y meteo de Port del Comte", "Port del Comte webcams"), url: "https://portdelcomte.net/webcams-i-meteo/" },
    ],
    access: {
      ca: "segons les preguntes freqüents de l'estació, no hi ha transport públic fins a les pistes",
      es: "según las preguntas frecuentes de la estación, no hay transporte público hasta las pistas",
      source: "https://portdelcomte.net/preguntes-frequents/",
    },
    note: NO_NOTE,
    pyrenees: true,
    guides: ["ski", "snowNow", "snow"],
  },
  {
    slug: "tavascan",
    kind: "resort",
    name: label("Tavascan", "Tavascan", "Tavascan"),
    inPlace: { ca: "a Tavascan", es: "en Tavascan" },
    icgc: { name: "Estació d'esquí de Tavascan", municipalityCode: "251235" },
    altitude: { min: 1750, max: 2250, source: "https://www.tavascan365.com/estacio-de-muntanya-de-tavascan/" },
    links: [
      { kind: "snow", label: label("Butlletí informatiu de Tavascan", "Boletín informativo de Tavascan", "Tavascan bulletin"), url: "https://www.tavascan365.com/estacio-de-muntanya-de-tavascan/butlleti-informatiu/" },
      { kind: "webcams", label: label("Càmeres de les estacions de Tot Nòrdic", "Webcams de las estaciones de Tot Nòrdic", "Tot Nòrdic webcams"), url: "https://www.totnordic.com/webcams-de-les-estacions-de-tot-nordic/" },
      { kind: "site", label: label("Estació de muntanya de Tavascan", "Estación de montaña de Tavascan", "Tavascan mountain resort"), url: "https://www.tavascan365.com/estacio-de-muntanya-de-tavascan/" },
    ],
    access: null,
    note: {
      ca: "Les pistes d'esquí alpí i el telecadira de Tavascan no van obrir la temporada 2025-2026, i el 28 d'octubre de 2026 el seu web encara no deia què farà aquest hivern. El circuit d'esquí nòrdic és entre 1.750 i 2.200 m.",
      es: "Las pistas de esquí alpino y el telesilla de Tavascan no abrieron la temporada 2025-2026, y el 28 de octubre de 2026 su web aún no decía qué hará este invierno. El circuito de esquí nórdico está entre 1.750 y 2.200 m.",
      source: "https://www.tavascan365.com/estacio-de-muntanya-de-tavascan/",
    },
    pyrenees: true,
    guides: ["ski", "snowNow", "snow"],
  },

  /* ------------------------------ Cross-country ------------------------------- */
  {
    slug: "guils-fontanera",
    kind: "nordic",
    name: label("Guils Fontanera", "Guils Fontanera", "Guils Fontanera"),
    inPlace: { ca: "a Guils Fontanera", es: "en Guils Fontanera" },
    icgc: { name: "Estació d'esquí de fons de Guils-Fontanera", municipalityCode: "170828", query: "Guils Fontanera" },
    altitude: { min: 1905, max: 2000, source: "https://www.guils.com/esqui-fons/" },
    links: [
      { kind: "snow", label: label("Estat de pistes de Guils Fontanera", "Estado de pistas de Guils Fontanera", "Guils Fontanera trail status"), url: "https://www.guils.com/estat-de-pistes/" },
      { kind: "webcams", label: label("Càmera web de Guils Fontanera", "Webcam de Guils Fontanera", "Guils Fontanera webcam"), url: "https://www.guils.com/webcam/" },
    ],
    access: {
      ca: "tren R3 fins a Puigcerdà o autobús d'ALSA Barcelona–Llívia, i taxi fins a l'estació",
      es: "tren R3 hasta Puigcerdà o autobús de ALSA Barcelona–Llívia, y taxi hasta la estación",
      source: "https://www.guils.com/prepara-la-teva-visita/",
    },
    note: NO_NOTE,
    pyrenees: true,
    guides: ["ski", "cerdanya", "snowNow", "snow"],
  },
  {
    slug: "lles",
    kind: "nordic",
    name: label("Lles", "Lles", "Lles"),
    inPlace: { ca: "a Lles", es: "en Lles" },
    icgc: { name: "Estació d'esquí de fons de Lles de Cerdanya", municipalityCode: "251272" },
    altitude: null,
    links: [{ kind: "webcams", label: label("Càmeres web de Lles", "Webcams de Lles", "Lles webcams"), url: "https://lles.net/webcams/" }],
    access: null,
    note: NO_NOTE,
    pyrenees: true,
    guides: ["ski", "snowNow"],
  },
  {
    slug: "aransa",
    kind: "nordic",
    name: label("Aransa", "Aransa", "Aransa"),
    inPlace: { ca: "a Aransa", es: "en Aransa" },
    icgc: { name: "Estació d'esquí de fons d'Arànser", municipalityCode: "251272" },
    altitude: null,
    links: [{ kind: "site", label: label("Web d'Aransa", "Web de Aransa", "Aransa website"), url: "https://www.aransaesqui.cat/" }],
    access: null,
    note: NO_NOTE,
    pyrenees: true,
    guides: ["ski", "snowNow"],
  },
  {
    slug: "sant-joan-de-l-erm",
    kind: "nordic",
    name: label("Sant Joan de l'Erm", "Sant Joan de l'Erm", "Sant Joan de l'Erm"),
    inPlace: { ca: "a Sant Joan de l'Erm", es: "en Sant Joan de l'Erm" },
    icgc: { name: "Estació d'esquí de fons de Sant Joan de l'Erm", municipalityCode: "251403" },
    altitude: null,
    links: [{ kind: "snow", label: label("Butlletí de neu de Sant Joan de l'Erm", "Boletín de nieve de Sant Joan de l'Erm", "Sant Joan de l'Erm snow bulletin"), url: "https://www.santjoandelerm.org/butlleti-de-neu/" }],
    access: null,
    note: NO_NOTE,
    pyrenees: true,
    guides: ["ski", "snowNow"],
  },
  {
    slug: "viros-vallferrera",
    kind: "nordic",
    name: label("Virós-Vallferrera", "Virós-Vallferrera", "Virós-Vallferrera"),
    inPlace: { ca: "a Virós-Vallferrera", es: "en Virós-Vallferrera" },
    icgc: { name: "Estació d'esquí de fons de Virós-Vallferrera", municipalityCode: "250175" },
    // Its pages give the refuge (1.700 m) and circuits "a cotes de 2.200 metres", not a range.
    altitude: null,
    links: [
      { kind: "snow", label: label("Comunicat de neu de Virós-Vallferrera", "Comunicado de nieve de Virós-Vallferrera", "Virós-Vallferrera snow notice"), url: "https://www.virosvallferrera.cat/services/comunicat-de-neu/" },
      { kind: "webcams", label: label("Càmera web de Virós-Vallferrera", "Webcam de Virós-Vallferrera", "Virós-Vallferrera webcam"), url: "https://www.virosvallferrera.cat/services/webcam/" },
    ],
    access: null,
    note: NO_NOTE,
    pyrenees: true,
    guides: ["ski", "snowNow", "snow"],
  },

  /* ------------------------------ Summits, lakes, passes ---------------------- */
  {
    slug: "port-de-la-bonaigua",
    kind: "area",
    name: label("el port de la Bonaigua", "el puerto de la Bonaigua", "Bonaigua Pass"),
    inPlace: { ca: "al port de la Bonaigua", es: "en el puerto de la Bonaigua" },
    icgc: { name: "Port de la Bonaigua", municipalityCode: "250241" },
    altitude: null,
    links: [],
    access: null,
    note: NO_NOTE,
    pyrenees: true,
    guides: ["snowNow", "ski", "snow"],
  },
  {
    slug: "lac-redon",
    kind: "area",
    name: label("el Lac Redon", "el Lac Redon", "Lac Redon"),
    inPlace: { ca: "al Lac Redon", es: "en el Lac Redon" },
    icgc: { name: "Lac Redon", municipalityCode: "252430" },
    altitude: null,
    links: [],
    access: null,
    note: NO_NOTE,
    pyrenees: true,
    guides: ["snowNow", "snow"],
  },
  {
    slug: "saloria",
    kind: "area",
    name: label("el pic de Salòria", "el pico de Salòria", "Pic de Salòria"),
    inPlace: { ca: "al pic de Salòria", es: "en el pico de Salòria" },
    icgc: { name: "Pic de Salòria", municipalityCode: "250175" },
    altitude: null,
    links: [],
    access: null,
    note: NO_NOTE,
    pyrenees: true,
    guides: ["snowNow", "snow"],
  },
  {
    slug: "estany-de-malniu",
    kind: "area",
    name: label("l'estany de Malniu", "el estany de Malniu", "Estany de Malniu"),
    inPlace: { ca: "a l'estany de Malniu", es: "en el estany de Malniu" },
    icgc: { name: "Estany de Malniu", municipalityCode: "170998" },
    altitude: null,
    links: [],
    access: null,
    note: NO_NOTE,
    pyrenees: true,
    guides: ["cerdanya", "snowNow", "snow"],
  },
  {
    slug: "prat-d-aguilo",
    kind: "area",
    name: label("Prat d'Aguiló (Cadí)", "Prat d'Aguiló (Cadí)", "Prat d'Aguiló (Cadí)"),
    inPlace: { ca: "a Prat d'Aguiló", es: "en Prat d'Aguiló" },
    icgc: { name: "Refugi de Prats d'Aguiló (Cèsar A. Torras)", municipalityCode: "251399", query: "Refugi de Prats d'Aguiló" },
    altitude: null,
    links: [],
    access: null,
    note: NO_NOTE,
    pyrenees: true,
    guides: ["cerdanya", "snowNow", "snow"],
  },
  {
    slug: "montsec-d-ares",
    kind: "area",
    name: label("el Montsec d'Ares", "el Montsec d'Ares", "Montsec d'Ares"),
    inPlace: { ca: "al Montsec d'Ares", es: "en el Montsec d'Ares" },
    icgc: { name: "Sant Alís", municipalityCode: "251961" },
    altitude: null,
    links: [],
    access: null,
    note: NO_NOTE,
    pyrenees: false,
    guides: ["snowNow"],
  },
  {
    slug: "montseny",
    kind: "area",
    name: label("el Montseny (Turó de l'Home)", "el Montseny (Turó de l'Home)", "Montseny (Turó de l'Home)"),
    inPlace: { ca: "al Montseny", es: "en el Montseny" },
    icgc: { name: "Turó de l'Home", municipalityCode: "080811" },
    altitude: null,
    links: [],
    access: null,
    note: NO_NOTE,
    pyrenees: false,
    guides: ["snow", "snowNow"],
  },
  {
    slug: "els-ports",
    kind: "area",
    name: label("els Ports (el Caro)", "Els Ports (el Caro)", "Els Ports (El Caro)"),
    inPlace: { ca: "als Ports", es: "en Els Ports" },
    icgc: { name: "Caro", municipalityCode: "431331", query: "Caro Roquetes" },
    altitude: null,
    links: [],
    access: null,
    note: NO_NOTE,
    pyrenees: false,
    guides: ["snow", "snowNow"],
  },
];
