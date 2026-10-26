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
  | "portaventura"
  | "zooAquarium"
  | "markets"
  | "barcelonaHub"
  | "clockChange"
  | "nuria"
  | "beaches"
  | "mesa"
  | "municipalResults"
  | "climate"
  | "shops"
  | "electionNight"
  | "touristTax"
  | "workCalendar"
  | "holidayToday"
  | "christmas"
  | "pessebres"
  | "christmasBarcelona"
  | "newYear"
  | "snowNow"
  | "candidates"
  | "calcots";

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
  climate: {
    ca: "guies/temps-barcelona-mes-a-mes",
    es: "guias/tiempo-barcelona-mes-a-mes",
    en: "guides/barcelona-weather-by-month",
  },
  shops: {
    ca: "guies/botigues-obertes-festius-catalunya",
    es: "guias/tiendas-abiertas-festivos-cataluna",
    en: "guides/shops-open-sundays-holidays-catalonia",
  },
  electionNight: {
    ca: "guies/nit-electoral-resultats-escrutini",
    es: "guias/noche-electoral-resultados-escrutinio",
    en: "guides/spain-election-night-results",
  },
  municipalResults: {
    ca: "guies/resultats-eleccions-municipals-catalunya",
    es: "guias/resultados-elecciones-municipales-cataluna",
    en: "guides/local-election-results-catalonia",
  },
  mesa: {
    ca: "guies/membre-mesa-electoral",
    es: "guias/miembro-mesa-electoral",
    en: "guides/polling-station-duty-spain",
  },
  beaches: {
    ca: "guies/platges-barcelona",
    es: "guias/playas-barcelona",
    en: "guides/barcelona-beaches",
  },
  nuria: {
    ca: "escapades/vall-de-nuria-cremallera",
    es: "escapadas/vall-de-nuria-cremallera",
    en: "day-trips/vall-de-nuria-rack-railway",
  },
  clockChange: {
    ca: "guies/canvi-hora-catalunya",
    es: "guias/cambio-hora-espana",
    en: "guides/clock-change-spain",
  },
  barcelonaHub: {
    ca: "guies/barcelona-guia-practica",
    es: "guias/barcelona-guia-practica",
    en: "guides/barcelona-practical-guide",
  },
  zooAquarium: {
    ca: "guies/zoo-aquarium-barcelona",
    es: "guias/zoo-aquarium-barcelona",
    en: "guides/barcelona-zoo-aquarium-tickets",
  },
  markets: {
    ca: "guies/mercat-boqueria-mercats-barcelona",
    es: "guias/mercado-boqueria-mercados-barcelona",
    en: "guides/la-boqueria-barcelona-markets",
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
  christmas: {
    ca: "tradicions/mercats-de-nadal-catalunya",
    es: "tradiciones/mercados-navidad-cataluna",
    en: "traditions/christmas-markets-catalonia",
  },
  christmasBarcelona: {
    ca: "guies/nadal-a-barcelona",
    es: "guias/navidad-en-barcelona",
    en: "guides/christmas-in-barcelona",
  },
  newYear: {
    ca: "guies/cap-d-any-barcelona",
    es: "guias/nochevieja-barcelona",
    en: "guides/new-years-eve-barcelona",
  },
  workCalendar: {
    ca: "guies/calendari-laboral-catalunya",
    es: "guias/calendario-laboral-cataluna",
    en: "guides/catalonia-public-holidays",
  },
  holidayToday: {
    ca: "guies/es-festiu-avui-catalunya",
    es: "guias/es-festivo-hoy-cataluna",
    en: "guides/is-today-a-holiday-in-catalonia",
  },
  touristTax: {
    ca: "guies/taxa-turistica-barcelona-catalunya",
    es: "guias/tasa-turistica-barcelona-cataluna",
    en: "guides/barcelona-catalonia-tourist-tax",
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
  pessebres: {
    ca: "tradicions/pessebres-vivents-catalunya",
    es: "tradiciones/belenes-vivientes-cataluna",
    en: "traditions/living-nativity-scenes-catalonia",
  },
  snowNow: {
    ca: "guies/neu-pirineu-avui",
    es: "guias/nieve-pirineo-hoy",
    en: "guides/snow-pyrenees-today",
  },
  candidates: {
    ca: "guies/candidats-eleccions-generals-catalunya",
    es: "guias/candidatos-elecciones-generales-cataluna",
    en: "guides/spain-general-election-candidates-catalonia",
  },
  calcots: {
    ca: "tradicions/calcotada-valls-temporada-calcots",
    es: "tradiciones/calcotada-valls-temporada-calcots",
    en: "traditions/calcotada-valls-calcot-season",
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
  climate: {
    ca: "El temps a Barcelona mes a mes",
    es: "El tiempo en Barcelona mes a mes",
    en: "Barcelona weather by month",
  },
  shops: {
    ca: "Botigues obertes en diumenges i festius",
    es: "Tiendas abiertas en domingos y festivos",
    en: "Shops open on Sundays and holidays",
  },
  electionNight: {
    ca: "Nit electoral: hora dels resultats i escrutini",
    es: "Noche electoral: hora de los resultados y escrutinio",
    en: "Election night: results times and the count",
  },
  municipalResults: {
    ca: "Resultats de les eleccions municipals",
    es: "Resultados de las elecciones municipales",
    en: "Local election results in Catalonia",
  },
  mesa: {
    ca: "Membre de mesa electoral: què fer",
    es: "Miembro de mesa electoral: qué hacer",
    en: "Polling-station duty in Spain",
  },
  beaches: {
    ca: "Platges de Barcelona",
    es: "Playas de Barcelona",
    en: "Barcelona beaches",
  },
  nuria: {
    ca: "Vall de Núria: el cremallera i com arribar-hi",
    es: "Vall de Núria: el cremallera y cómo llegar",
    en: "Vall de Núria by rack railway",
  },
  clockChange: {
    ca: "Canvi d'hora: quan és el pròxim",
    es: "Cambio de hora: cuándo es el próximo",
    en: "Clock change in Spain",
  },
  barcelonaHub: {
    ca: "Barcelona: guia pràctica",
    es: "Barcelona: guía práctica",
    en: "Barcelona practical guide",
  },
  zooAquarium: {
    ca: "Zoo i Aquàrium de Barcelona",
    es: "Zoo y Aquarium de Barcelona",
    en: "Barcelona Zoo and Aquarium",
  },
  markets: {
    ca: "La Boqueria i els mercats de Barcelona",
    es: "La Boqueria y los mercados de Barcelona",
    en: "La Boqueria and Barcelona's markets",
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
  christmas: {
    ca: "Mercats i fires de Nadal a Catalunya",
    es: "Mercados y ferias de Navidad en Cataluña",
    en: "Christmas markets in Catalonia",
  },
  christmasBarcelona: {
    ca: "Nadal a Barcelona: llums, pessebre i què obre",
    es: "Navidad en Barcelona: luces, belén y qué abre",
    en: "Christmas in Barcelona: lights, nativity and what's open",
  },
  newYear: {
    ca: "Cap d'Any a Barcelona: la festa de Montjuïc i el metro",
    es: "Nochevieja en Barcelona: la fiesta de Montjuïc y el metro",
    en: "New Year's Eve in Barcelona: the Montjuïc show and the metro",
  },
  workCalendar: {
    ca: "Calendari laboral 2027 a Catalunya: festius i ponts",
    es: "Calendario laboral 2027 en Cataluña: festivos y puentes",
    en: "Catalonia public holidays 2027",
  },
  holidayToday: {
    ca: "És festiu avui a Catalunya?",
    es: "¿Es festivo hoy en Cataluña?",
    en: "Is today a public holiday in Catalonia?",
  },
  touristTax: {
    ca: "Taxa turística a Barcelona i Catalunya: quant es paga",
    es: "Tasa turística en Barcelona y Cataluña: cuánto se paga",
    en: "Tourist tax in Barcelona and Catalonia: what you pay",
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
  pessebres: {
    ca: "Pessebres vivents a Catalunya: calendari",
    es: "Belenes vivientes en Cataluña: calendario",
    en: "Living nativity scenes in Catalonia",
  },
  snowNow: {
    ca: "Hi ha neu al Pirineu avui?",
    es: "¿Hay nieve en el Pirineo hoy?",
    en: "Is there snow in the Pyrenees today?",
  },
  candidates: {
    ca: "Candidats a les eleccions generals a Catalunya",
    es: "Candidatos a las elecciones generales en Cataluña",
    en: "General election candidates in Catalonia",
  },
  calcots: {
    ca: "Calçots i Calçotada de Valls 2027: temporada i data",
    es: "Calçots y Calçotada de Valls 2027: temporada y fecha",
    en: "Calçot season and the Valls Calçotada 2027",
  },
};

export const RELATED_HEADING: Record<Locale, string> = {
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
      : `${Number(day)} ${locale === "ca" && /^[ao]/.test(monthName) ? "d'" : "de "}${monthName} de ${year}`;
  // Plain text: the callout renders its title without inline markdown.
  return `${label[locale]}: ${date}.`;
}

const READ_NEXT: Record<Locale, string> = {
  ca: "Llegeix també",
  es: "Lee también",
  en: "Read next",
};

/**
 * Puts the first two "Keep reading" links in a box early in the article.
 *
 * GA4 (28 days to 17 Oct 2026): 1.33 pages per session — readers finish the
 * answer and leave, because the only onward links sit below the FAQ where
 * few scroll. The box repeats links that are already in the related rail, so
 * it adds no new target; it only moves the next step to where people are.
 * Short articles (fewer than three sections) are left alone.
 */
export function withReadNext(blocks: Block[], locale: Locale): Block[] {
  const relatedAt = blocks.findIndex(
    (block) => block.type === "heading" && (block as { text?: string }).text === RELATED_HEADING[locale],
  );
  const list = blocks[relatedAt + 1] as { type?: string; items?: string[] } | undefined;
  if (relatedAt < 0 || list?.type !== "list" || !list.items?.length) return blocks;

  const sections = blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block, index }) => index < relatedAt && block.type === "heading" && (block as { level?: number }).level === 2)
    .map(({ index }) => index);
  if (sections.length < 3) return blocks;

  // Before the second section, not the middle: GA4 shows only 11.5% of
  // mobile page views reach 90% depth, so a mid-page box is already past
  // most readers (UX audit, 17 Oct 2026).
  const at = sections[1] ?? sections[0]!;
  const box = { type: "callout", tone: "tip", title: READ_NEXT[locale], text: list.items.slice(0, 2).join(" · ") } as Block;
  return [...blocks.slice(0, at), box, ...blocks.slice(at)];
}
