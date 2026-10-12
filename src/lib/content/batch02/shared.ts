import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

/**
 * Editorial batch 02: Barcelona practical, day trips, Ripollès and winter.
 *
 * Same discipline as `features/shared.ts` and for the same reason — every
 * internal link is built from a registry, so a link can only point at a URL
 * this repository actually publishes. Cross-links written by hand across nine
 * articles in three languages is exactly where dead internal links come from.
 *
 * The registry also encodes the cluster structure the package asked for:
 * Barcelona Practical links across itself, the day trips link to each other
 * and to the car-free guide, and the Ripollès hub is the parent of Setcases.
 */

export type B2Key =
  | "transport"
  | "zbe"
  | "parking"
  | "girona"
  | "montserratFree"
  | "ripolles"
  | "setcases"
  | "cerdanya"
  | "snow"
  | "airport"
  | "monuments"
  | "ski"
  | "museums"
  | "cards"
  | "campnou"
  | "hours"
  | "sitges"
  | "tarragona"
  | "voting"
  | "congressResults"
  | "parliamentResults"
  | "figueres"
  | "andorra"
  | "montjuic"
  | "tibidabo"
  | "cruiseport"
  | "portaventura";

/** Path after the locale prefix, no leading or trailing slash. */
export const B2_PATHS: Record<B2Key, Record<Locale, string>> = {
  transport: {
    ca: "guies/targetes-transport-barcelona",
    es: "guias/tarjetas-transporte-barcelona",
    en: "guides/barcelona-transport-passes",
  },
  zbe: {
    ca: "guies/zbe-barcelona-vehicles-estrangers",
    es: "guias/zbe-barcelona-vehiculos-extranjeros",
    en: "guides/barcelona-low-emission-zone-foreign-cars",
  },
  parking: {
    ca: "guies/aparcar-barcelona-zona-blava-verda",
    es: "guias/aparcar-barcelona-zona-azul-verde",
    en: "guides/parking-in-barcelona-blue-green-zones",
  },
  girona: {
    ca: "escapades/girona-des-de-barcelona-tren",
    es: "escapadas/girona-desde-barcelona-tren",
    en: "day-trips/girona-from-barcelona-by-train",
  },
  montserratFree: {
    ca: "escapades/montserrat-per-lliure-des-barcelona",
    es: "escapadas/montserrat-por-libre-desde-barcelona",
    en: "day-trips/montserrat-without-a-tour-from-barcelona",
  },
  ripolles: {
    ca: "destinacions/ripolles",
    es: "destinos/ripolles",
    en: "destinations/ripolles",
  },
  setcases: {
    ca: "destinacions/setcases",
    es: "destinos/setcases",
    en: "destinations/setcases",
  },
  cerdanya: {
    ca: "guies/cerdanya-sense-cotxe",
    es: "guias/cerdana-sin-coche",
    en: "guides/cerdanya-without-a-car",
  },
  congressResults: {
    ca: "guies/resultats-eleccions-generals-catalunya",
    es: "guias/resultados-elecciones-generales-cataluna",
    en: "guides/general-election-results-catalonia",
  },
  parliamentResults: {
    ca: "guies/resultats-eleccions-parlament-catalunya",
    es: "guias/resultados-elecciones-parlament-cataluna",
    en: "guides/catalan-parliament-election-results",
  },
  voting: {
    ca: "guies/com-votar-eleccions-catalunya",
    es: "guias/como-votar-elecciones-cataluna",
    en: "guides/how-to-vote-catalonia",
  },
  cruiseport: {
    ca: "guies/port-creuers-barcelona-centre",
    es: "guias/puerto-cruceros-barcelona-centro",
    en: "guides/barcelona-cruise-port-to-city-centre",
  },
  portaventura: {
    ca: "escapades/portaventura-des-de-barcelona",
    es: "escapadas/portaventura-desde-barcelona",
    en: "day-trips/portaventura-from-barcelona",
  },
  montjuic: {
    ca: "guies/montjuic-font-magica-teleferic",
    es: "guias/montjuic-fuente-magica-teleferico",
    en: "guides/montjuic-magic-fountain-cable-car",
  },
  tibidabo: {
    ca: "guies/tibidabo-parc-atraccions-com-arribar",
    es: "guias/tibidabo-parque-atracciones-como-llegar",
    en: "guides/tibidabo-amusement-park-how-to-get-there",
  },
  andorra: {
    ca: "escapades/andorra-des-de-barcelona-autobus",
    es: "escapadas/andorra-desde-barcelona-autobus",
    en: "day-trips/andorra-from-barcelona-by-bus",
  },
  figueres: {
    ca: "escapades/figueres-museu-dali-des-de-barcelona",
    es: "escapadas/figueres-museo-dali-desde-barcelona",
    en: "day-trips/figueres-dali-museum-from-barcelona",
  },
  sitges: {
    ca: "escapades/sitges-des-de-barcelona-tren",
    es: "escapadas/sitges-desde-barcelona-tren",
    en: "day-trips/sitges-from-barcelona-by-train",
  },
  tarragona: {
    ca: "escapades/tarragona-des-de-barcelona-tren",
    es: "escapadas/tarragona-desde-barcelona-tren",
    en: "day-trips/tarragona-from-barcelona-by-train",
  },
  hours: {
    ca: "guies/horaris-metro-barcelona",
    es: "guias/horarios-metro-barcelona",
    en: "guides/barcelona-metro-hours",
  },
  campnou: {
    ca: "guies/spotify-camp-nou-museu-visita",
    es: "guias/spotify-camp-nou-museo-visita",
    en: "guides/spotify-camp-nou-tour-museum",
  },
  cards: {
    ca: "guies/barcelona-card-o-hola-barcelona",
    es: "guias/barcelona-card-o-hola-barcelona",
    en: "guides/barcelona-card-vs-hola-barcelona",
  },
  museums: {
    ca: "guies/museus-gratis-barcelona",
    es: "guias/museos-gratis-barcelona",
    en: "guides/free-museums-barcelona",
  },
  ski: {
    ca: "guies/estacions-esqui-catalunya",
    es: "guias/estaciones-esqui-cataluna",
    en: "guides/ski-resorts-catalonia",
  },
  monuments: {
    ca: "guies/entrades-sagrada-familia-park-guell-casa-batllo",
    es: "guias/entradas-sagrada-familia-park-guell-casa-batllo",
    en: "guides/sagrada-familia-park-guell-casa-batllo-tickets",
  },
  airport: {
    ca: "guies/aeroport-barcelona-centre",
    es: "guias/aeropuerto-barcelona-centro",
    en: "guides/barcelona-airport-to-city-centre",
  },
  snow: {
    ca: "guies/on-veure-neu-catalunya-sense-esquiar",
    es: "guias/donde-ver-nieve-cataluna-sin-esquiar",
    en: "guides/where-to-see-snow-catalonia-without-skiing",
  },
};

export function b2href(key: B2Key, locale: Locale): string {
  return `/${locale}/${B2_PATHS[key][locale]}/`;
}

export function b2link(key: B2Key, locale: Locale, label: string): string {
  return `[${label}](${b2href(key, locale)})`;
}

/** Titles for the related rail at the foot of each article. */
export const B2_TITLES: Record<B2Key, Record<Locale, string>> = {
  transport: {
    ca: "Quina targeta de transport et convé a Barcelona",
    es: "Qué tarjeta de transporte te conviene en Barcelona",
    en: "Which Barcelona transport pass to buy",
  },
  zbe: {
    ca: "ZBE de Barcelona amb vehicle estranger",
    es: "ZBE de Barcelona con coche extranjero",
    en: "Barcelona low-emission zone for foreign cars",
  },
  parking: {
    ca: "Aparcar a Barcelona: zona blava i zona verda",
    es: "Aparcar en Barcelona: zona azul y zona verde",
    en: "Parking in Barcelona: blue and green zones",
  },
  girona: {
    ca: "Girona des de Barcelona en tren",
    es: "Girona desde Barcelona en tren",
    en: "Girona from Barcelona by train",
  },
  montserratFree: {
    ca: "Montserrat per lliure des de Barcelona",
    es: "Montserrat por libre desde Barcelona",
    en: "Montserrat without a tour",
  },
  ripolles: {
    ca: "El Ripollès: què veure a la comarca",
    es: "El Ripollès: qué ver en la comarca",
    en: "Ripollès travel guide",
  },
  setcases: {
    ca: "Setcases: què veure en un dia",
    es: "Setcases: qué ver en un día",
    en: "Setcases: what to see in a day",
  },
  cerdanya: {
    ca: "Cerdanya sense cotxe",
    es: "Cerdanya sin coche",
    en: "Cerdanya without a car",
  },
  congressResults: {
    ca: "Resultats de les eleccions generals a Catalunya",
    es: "Resultados de las elecciones generales en Cataluña",
    en: "General election results in Catalonia",
  },
  parliamentResults: {
    ca: "Resultats de les eleccions al Parlament",
    es: "Resultados de las elecciones al Parlament",
    en: "Catalan Parliament election results",
  },
  voting: {
    ca: "Com votar a Catalunya",
    es: "Cómo votar en Cataluña",
    en: "How to vote in Catalonia",
  },
  cruiseport: {
    ca: "Del port de creuers al centre de Barcelona",
    es: "Del puerto de cruceros al centro de Barcelona",
    en: "Barcelona cruise port to the city centre",
  },
  portaventura: {
    ca: "PortAventura des de Barcelona",
    es: "PortAventura desde Barcelona",
    en: "PortAventura from Barcelona",
  },
  montjuic: {
    ca: "Montjuïc: Font Màgica, telefèric i castell",
    es: "Montjuïc: Fuente Mágica, teleférico y castillo",
    en: "Montjuïc: Magic Fountain, cable car and castle",
  },
  tibidabo: {
    ca: "Tibidabo: parc d'atraccions i com arribar-hi",
    es: "Tibidabo: parque de atracciones y cómo llegar",
    en: "Tibidabo: amusement park and how to get there",
  },
  andorra: {
    ca: "Andorra des de Barcelona en autobús",
    es: "Andorra desde Barcelona en autobús",
    en: "Andorra from Barcelona by bus",
  },
  figueres: {
    ca: "Figueres i el Museu Dalí des de Barcelona",
    es: "Figueres y el Museo Dalí desde Barcelona",
    en: "Figueres and the Dalí Museum from Barcelona",
  },
  sitges: {
    ca: "Sitges des de Barcelona en tren",
    es: "Sitges desde Barcelona en tren",
    en: "Sitges from Barcelona by train",
  },
  tarragona: {
    ca: "Tarragona des de Barcelona en tren",
    es: "Tarragona desde Barcelona en tren",
    en: "Tarragona from Barcelona by train",
  },
  hours: {
    ca: "Horari del metro de Barcelona i NitBus",
    es: "Horario del metro de Barcelona y NitBus",
    en: "Barcelona metro hours and night buses",
  },
  campnou: {
    ca: "Spotify Camp Nou: museu, entrades i com arribar-hi",
    es: "Spotify Camp Nou: museo, entradas y cómo llegar",
    en: "Spotify Camp Nou: tour, tickets and getting there",
  },
  cards: {
    ca: "Barcelona Card o Hola Barcelona",
    es: "Barcelona Card o Hola Barcelona",
    en: "Barcelona Card or Hola Barcelona",
  },
  museums: {
    ca: "Museus gratis a Barcelona",
    es: "Museos gratis en Barcelona",
    en: "Free museums in Barcelona",
  },
  ski: {
    ca: "Estacions d'esquí de Catalunya",
    es: "Estaciones de esquí de Cataluña",
    en: "Ski resorts in Catalonia",
  },
  monuments: {
    ca: "Entrades de la Sagrada Família, el Park Güell i la Casa Batlló",
    es: "Entradas de la Sagrada Familia, el Park Güell y la Casa Batlló",
    en: "Sagrada Família, Park Güell and Casa Batlló tickets",
  },
  airport: {
    ca: "De l'aeroport al centre de Barcelona",
    es: "Del aeropuerto al centro de Barcelona",
    en: "Barcelona airport to the city centre",
  },
  snow: {
    ca: "On veure neu sense esquiar",
    es: "Dónde ver nieve sin esquiar",
    en: "Where to see snow without skiing",
  },
};

const RELATED_HEADING: Record<Locale, string> = {
  ca: "Continua llegint",
  es: "Sigue leyendo",
  en: "Keep reading",
};

export function b2Related(keys: B2Key[], locale: Locale): Block[] {
  return [
    { type: "heading", level: 2, text: RELATED_HEADING[locale] },
    {
      type: "list",
      ordered: false,
      items: keys.map((key) => b2link(key, locale, B2_TITLES[key][locale])),
    },
  ] as Block[];
}

/* -------------------------------------------------------------------------- */
/* Block helpers                                                              */
/* -------------------------------------------------------------------------- */

export function lead(text: string): Block {
  return { type: "paragraph", lead: true, text } as Block;
}

export function paras(...texts: string[]): Block[] {
  return texts.map((text) => ({ type: "paragraph", text }) as Block);
}

export function h2(heading: string, ...texts: string[]): Block[] {
  return [{ type: "heading", level: 2, text: heading } as Block, ...paras(...texts)];
}

export function h3(heading: string, ...texts: string[]): Block[] {
  return [{ type: "heading", level: 3, text: heading } as Block, ...paras(...texts)];
}

export function callout(
  tone: "info" | "tip" | "warning" | "official",
  title: string,
  text: string,
): Block {
  return { type: "callout", tone, title, text } as Block;
}

export function list(...items: string[]): Block {
  return { type: "list", ordered: false, items } as Block;
}

export function table(
  caption: string,
  headers: string[],
  rows: string[][],
  note?: string,
): Block {
  return {
    type: "table",
    caption,
    headers,
    rows,
    stickyColumn: 0,
    ...(note ? { note } : {}),
  } as Block;
}

export function keyFacts(title: string, items: { label: string; value: string }[]): Block {
  return { type: "keyFacts", title, items } as Block;
}

export function steps(title: string, items: { title: string; text: string }[]): Block {
  return { type: "steps", title, items } as Block;
}

export function faq(items: { question: string; answer: string }[]): Block {
  return { type: "faq", items } as Block;
}

/* -------------------------------------------------------------------------- */
/* Article shape                                                              */
/* -------------------------------------------------------------------------- */

export interface B2Source {
  name: string;
  url: string;
  publisher?: string | null;
}

export interface B2Edition {
  path: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  blocks: Block[];
}

export interface B2Article {
  key: B2Key;
  entryKey: string;
  categoryKey: string;
  /** Image key in the manifest, when the file exists. */
  heroKey?: string;
  heroAlt?: Record<Locale, string>;
  heroCaption?: Record<Locale, string>;
  /**
   * A second, different photograph for part-way down the article.
   *
   * It must not be the hero. The first version of this batch spliced the hero
   * into the body as well, so every page showed the same picture twice - once
   * in the header the template renders, once again six blocks later.
   */
  secondaryKey?: string;
  secondaryAlt?: Record<Locale, string>;
  secondaryCaption?: Record<Locale, string>;
  sources: B2Source[];
  /** ISO date the variable data was last checked against the sources. */
  verifiedAt: string;
  publishedAt: string;
  editions: Record<Locale, B2Edition>;
}

/** "Última verificació" line, printed where a reader will actually see it. */
export function verifiedLine(locale: Locale, isoDate: string): string {
  const label: Record<Locale, string> = {
    ca: "Última verificació de les dades d'aquesta pàgina",
    es: "Última verificación de los datos de esta página",
    en: "Data on this page last verified",
  };
  const [year, month, day] = isoDate.split("-");
  const months: Record<Locale, string[]> = {
    ca: ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
    es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  };
  const monthName = months[locale][Number(month) - 1] ?? month ?? "";
  const date =
    locale === "en"
      ? `${Number(day)} ${monthName} ${year}`
      : `${Number(day)} de ${monthName} de ${year}`;
  return `**${label[locale]}:** ${date}.`;
}
