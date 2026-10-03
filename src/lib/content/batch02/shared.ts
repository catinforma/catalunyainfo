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
  | "snow";

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
