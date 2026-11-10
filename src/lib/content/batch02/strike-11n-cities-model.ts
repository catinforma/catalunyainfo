import type { B2Source } from "./shared";
import type { Strike11nCityRef } from "./strike-11n-city-paths";

/**
 * The data model of the 11N city pages (`strike-11n-cities.ts`), in a module
 * of its own so that the facts (`strike-11n-cities-data.ts`), which the strike
 * watch edits, and the page builder share it without importing each other.
 */

/** pending: nothing published yet. published: `text` says what the order or notice sets. */
export type CityMsStatus = "pending" | "published";

/** One minimum-services slot: filled in by the strike watch when the order or notice is out. */
export interface MsSlot {
  status: CityMsStatus;
  /** Only when published: what is set, the figure and the link to the order or notice inline (Spanish). */
  text: string | null;
  /** Only when published: the order or the operator's notice (added to the page's sources). */
  source: B2Source | null;
}

export type CityServiceGroup = "transport" | "health" | "schools" | "administration";

/** A service whose minimum services the regional (or local) government sets. */
export interface CityService extends MsSlot {
  /** Unique within the city: "metro", "emt", "salud"... */
  id: string;
  group: CityServiceGroup;
  /** "Metro de Madrid" */
  name: string;
  /** Short, for the table: "Comunidad de Madrid". */
  setBy: string;
  /**
   * While pending, after "Aún no publicados (consultado el …).": who sets them
   * and where the order will appear, with the link (Markdown).
   */
  pending: string;
  /** Where to check on the day: the operator's or the service's own notices (Markdown, with links). */
  where: string;
  /** A FAQ question in the searched words, for the services people ask about: "¿Hay metro en Madrid el 11 de noviembre?". */
  question?: string;
  /** Other facts about this service on 11N, read on an official page (Markdown, with the link): printed under its minimum services. */
  notes?: string[];
}

/** State-level services, the same on every city page. */
export type StateServiceKey = "rail" | "air";

export interface StateService extends MsSlot {
  key: StateServiceKey;
  /** While pending, after "Aún no publicados (consultado el …).": who sets them and where (Markdown). */
  pending: string;
  /** Short, for the table. */
  setBy: string;
}

export interface Strike11nCity extends Strike11nCityRef {
  /** For the SEO title, the services people search: "metro y EMT". */
  titleTransport: string;
  /** For the lead: "metro, EMT y autobuses interurbanos". */
  transportShort: string;
  /**
   * Who sets the regional minimum services and where they appear, for the
   * lead (Markdown, one clause): "la Comunidad de Madrid, por orden que se
   * publica en el [BOCM](...)".
   */
  authority: string;
  /** Plain text, for the key facts: "la Comunidad de Madrid (BOCM)". */
  authorityShort: string;
  /** The regional bulletin, plain, with the article: "el BOCM". */
  bulletin: string;
  /** The city's Cercanías network, or null when it has none: "Cercanías Madrid". */
  cercanias: string | null;
  /** The airport, as Aena names it: "Adolfo Suárez Madrid-Barajas". */
  airport: string;
  /**
   * Once the Ministry's air resolution is out: this airport's own figures in
   * it, with the link (Markdown, full sentences). The first one is the answer
   * of the flights row and of the flights section.
   */
  airNotes?: string[];
  services: CityService[];
  /**
   * Once the regional order is out: the lead's one-line answer, with its
   * figures and the link (Markdown, lower case, no final stop): "metro al 80%
   * en hora punta…, según [el acuerdo…](…)". Null while nothing is published.
   */
  msSummary: string | null;
  /**
   * What the regional government has said or done about 11N so far, and how it
   * did it last time (Markdown, with links): printed under the minimum-services
   * heading. Never a past figure.
   */
  msNotes: string[];
  /** Notices about this city's trains on 11N, read on Renfe's own pages (Markdown, with the link). */
  railNotes: string[];
  /** Is Wednesday 11 November a school day: one paragraph with the calendar linked, or null when not verified. */
  school: string | null;
  /** Plain text, for the key facts. */
  schoolShort: string;
  /** Demonstrations exactly as the organisers published them (time and place, Markdown with the link); empty when none. */
  demos: string[];
  /** Plain text, for the key facts, when `demos` is not empty. */
  demoShort: string | null;
  /** Where the organisers will announce them (Markdown, with links). */
  demoWhere: string;
  /** Extra lines on who calls the strike here, from the unions' own sites (Markdown). */
  callNotes: string[];
  /** Fixed sources the page cites: bulletin, government pages, operators, unions. */
  sources: B2Source[];
}

/* -------------------------------------------------------------------------- */
/* Catalan and English editions (10 Nov 2026)                                 */
/* -------------------------------------------------------------------------- */

/**
 * One service's words in Catalan or English. The status and the source stay
 * in the Spanish data (`strike-11n-cities-data.ts`), the one file of facts;
 * `text` is the published order's sentence in this language and must carry the
 * same links and the same figures as the Spanish one (a test compares them).
 */
export interface CityServiceTr {
  name: string;
  setBy: string;
  pending: string;
  where: string;
  /** Only when the Spanish slot is published; null otherwise. */
  text: string | null;
  question?: string;
  notes?: string[];
}

/**
 * A city's words in Catalan or English (`strike-11n-cities-i18n/<key>.ts`):
 * every text field of Strike11nCity, same links, same figures, same order of
 * list items. Services are keyed by their Spanish `id`.
 */
export interface CityTr {
  titleTransport: string;
  transportShort: string;
  authority: string;
  authorityShort: string;
  bulletin: string;
  cercanias: string | null;
  airport: string;
  airNotes?: string[];
  msSummary: string | null;
  msNotes: string[];
  railNotes: string[];
  school: string | null;
  schoolShort: string;
  demos: string[];
  demoShort: string | null;
  demoWhere: string;
  callNotes: string[];
  services: Record<string, CityServiceTr>;
}

/** A State slot's words in Catalan or English. */
export interface StateServiceTr {
  text: string | null;
  pending: string;
  setBy: string;
}
