import type { Block } from "@/lib/content/blocks";
import type { Locale } from "@/lib/i18n/config";

import {
  b2link,
  b2Related,
  callout,
  faq,
  h2,
  lead,
  verifiedLine,
  type B2Article,
  type B2Source,
} from "./shared";

/**
 * Election results in Catalonia since 1977: Congress and the Parliament of
 * Catalonia, each on one page that reads the Generalitat's open data live
 * (see `elections/history.ts`), so the tables gain the 29 November 2026
 * general election once the Generalitat publishes it, with no edit here.
 *
 * The prose states only what the data itself shows or what the BOE says;
 * percentages in the tables are computed from the counts. No commentary on
 * parties: the pages are a record, not an analysis.
 */

const VERIFIED = "2026-10-12";

/** Where the 29 November 2026 count is explained (Congress page only). */
const NIGHT: Record<Locale, string> = {
  ca: `Per als resultats del **29 de novembre de 2026**, la nit electoral, mira ${b2link("electionNight", "ca", "a quina hora surten i com és l'escrutini provisional")}.`,
  es: `Para los resultados del **29 de noviembre de 2026**, la noche electoral, mira ${b2link("electionNight", "es", "a qué hora salen y cómo es el escrutinio provisional")}.`,
  en: `For the results of **29 November 2026** on election night, see ${b2link("electionNight", "en", "when they come out and how the provisional count works")}.`,
};

const DATA_SOURCES: B2Source[] = [
  { name: "Processos electorals — vots", url: "https://analisi.transparenciacatalunya.cat/d/ntc4-rnwr", publisher: "Generalitat de Catalunya. Departament de la Presidència" },
  { name: "Processos electorals — participació", url: "https://analisi.transparenciacatalunya.cat/d/irrv-2mfc", publisher: "Generalitat de Catalunya. Departament de la Presidència" },
  { name: "Processos electorals — convocatòries", url: "https://analisi.transparenciacatalunya.cat/d/tgns-3xuy", publisher: "Generalitat de Catalunya. Departament de la Presidència" },
];

type Meta = { path: string; title: string; seoTitle: string; seoDescription: string; excerpt: string };
type T = {
  lead: string;
  readTitle: string;
  read: string[];
  nextTitle: string;
  next: string;
  faq: { question: string; answer: string }[];
  note: string;
};

function body(kind: "congress" | "parliament", t: T, locale: Locale): Block[] {
  return [
    lead(t.lead),
    ...(kind === "congress" ? [{ type: "paragraph", text: NIGHT[locale] } as Block] : []),
    callout("official", verifiedLine(locale, VERIFIED), t.note),
    { type: "electionHistory", kind } as Block,
    ...h2(t.readTitle, ...t.read),
    ...h2(t.nextTitle, t.next),
    faq(t.faq),
    ...b2Related(kind === "congress" ? ["electionNight", "voting", "mesa", "parliamentResults", "municipalResults"] : ["voting", "mesa", "congressResults", "municipalResults"], locale),
  ];
}

/* ========================================================================== */
/* Congress                                                                   */
/* ========================================================================== */

const CONGRESS_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/resultats-eleccions-generals-catalunya",
    title: "Resultats de les eleccions generals a Catalunya des del 1977",
    seoTitle: "Resultats eleccions generals a Catalunya des del 1977",
    seoDescription:
      "Vots, percentatge i escons de cada candidatura a Catalunya a les eleccions al Congrés des del 1977, i la participació, amb dades obertes oficials.",
    excerpt: "Tots els resultats de les eleccions al Congrés a Catalunya des del 1977: vots, escons i participació, llegits de les dades oficials.",
  },
  es: {
    path: "guias/resultados-elecciones-generales-cataluna",
    title: "Resultados de las elecciones generales en Cataluña desde 1977",
    seoTitle: "Resultados elecciones generales en Cataluña desde 1977",
    seoDescription:
      "Votos, porcentaje y escaños de cada candidatura en Cataluña en las elecciones al Congreso desde 1977, y la participación, con datos abiertos oficiales.",
    excerpt: "Todos los resultados de las elecciones al Congreso en Cataluña desde 1977: votos, escaños y participación, leídos de los datos oficiales.",
  },
  en: {
    path: "guides/general-election-results-catalonia",
    title: "General election results in Catalonia since 1977",
    seoTitle: "Spanish general election results in Catalonia since 1977",
    seoDescription:
      "Votes, share and seats for every list in Catalonia at every Congress election since 1977, and turnout, from the Generalitat's open election data.",
    excerpt: "Every Congress election result in Catalonia since 1977: votes, seats and turnout, read from the official data.",
  },
};

const CONGRESS_COPY: Record<Locale, T> = {
  en: {
    lead: "Every general election since 1977, as it went in Catalonia: votes and seats for each list that won a seat, and turnout. The tables read the Generalitat's open election data directly, so they update when new results are published.",
    readTitle: "How to read the tables",
    read: [
      "Catalonia votes as four provinces, and seats are won province by province, which is why a list can take more seats than another with fewer votes across Catalonia. Today Catalonia elects 48 of the 350 deputies: Barcelona 32, Girona 6, Tarragona 6 and Lleida 4. In earlier elections the total was 46 or 47.",
      "Turnout is voters over the electorate, and each list's share is its votes over the valid votes; both are computed from the counts rather than copied from the source.",
    ],
    nextTitle: "The next one: 29 November 2026",
    next: "The next general election is on Sunday 29 November 2026. Its results will appear here once the Generalitat adds them to its open data; the official provisional count on election night is published by the Ministry of the Interior.",
    faq: [
      { question: "How many deputies does Catalonia elect?", answer: "48 of the 350 in the Congress of Deputies: Barcelona 32, Girona 6, Tarragona 6 and Lleida 4." },
      { question: "What was the turnout in Catalonia in the 2023 general election?", answer: "About 62.7%, computed from the Generalitat's data: voters over the electorate." },
      { question: "Where do these results come from?", answer: "From the Generalitat de Catalunya's open election data, which covers every election in Catalonia since 1977." },
    ],
    note: "The tables are read live from the Generalitat's open data.",
  },
  es: {
    lead: "Todas las elecciones generales desde 1977 tal como fueron en Cataluña: votos y escaños de cada candidatura que obtuvo representación, y la participación. Las tablas leen directamente los datos electorales abiertos de la Generalitat, así que se actualizan cuando se publican nuevos resultados.",
    readTitle: "Cómo leer las tablas",
    read: [
      "Cataluña vota en cuatro provincias y los escaños se reparten provincia a provincia, por eso una candidatura puede sacar más escaños que otra con menos votos en toda Cataluña. Hoy Cataluña elige 48 de los 350 diputados: Barcelona 32, Girona 6, Tarragona 6 y Lleida 4. En elecciones anteriores el total fue 46 o 47.",
      "La participación es votantes sobre censo, y el porcentaje de cada candidatura, sus votos sobre los votos válidos; los dos se calculan a partir de los recuentos, no se copian de la fuente.",
    ],
    nextTitle: "Las próximas: 29 de noviembre de 2026",
    next: "Las próximas elecciones generales son el domingo 29 de noviembre de 2026. Sus resultados aparecerán aquí cuando la Generalitat los incorpore a sus datos abiertos; el escrutinio provisional oficial de la noche electoral lo publica el Ministerio del Interior.",
    faq: [
      { question: "¿Cuántos diputados elige Cataluña?", answer: "48 de los 350 del Congreso de los Diputados: Barcelona 32, Girona 6, Tarragona 6 y Lleida 4." },
      { question: "¿Qué participación hubo en Cataluña en las generales de 2023?", answer: "Alrededor del 62,7 %, calculada con los datos de la Generalitat: votantes sobre censo." },
      { question: "¿De dónde salen estos resultados?", answer: "De los datos electorales abiertos de la Generalitat de Catalunya, que cubren todas las elecciones en Cataluña desde 1977." },
    ],
    note: "Las tablas se leen en directo de los datos abiertos de la Generalitat.",
  },
  ca: {
    lead: "Totes les eleccions generals des del 1977 tal com van anar a Catalunya: vots i escons de cada candidatura que va obtenir representació, i la participació. Les taules llegeixen directament les dades electorals obertes de la Generalitat, així que s'actualitzen quan es publiquen resultats nous.",
    readTitle: "Com llegir les taules",
    read: [
      "Catalunya vota en quatre províncies i els escons es reparteixen província a província, per això una candidatura pot treure més escons que una altra amb menys vots a tot Catalunya. Avui Catalunya escull 48 dels 350 diputats: Barcelona 32, Girona 6, Tarragona 6 i Lleida 4. En eleccions anteriors el total va ser 46 o 47.",
      "La participació és votants sobre cens, i el percentatge de cada candidatura, els seus vots sobre els vots vàlids; tots dos es calculen a partir dels recomptes, no es copien de la font.",
    ],
    nextTitle: "Les properes: 29 de novembre de 2026",
    next: "Les properes eleccions generals són el diumenge 29 de novembre de 2026. Els resultats apareixeran aquí quan la Generalitat els incorpori a les seves dades obertes; l'escrutini provisional oficial de la nit electoral el publica el Ministeri de l'Interior.",
    faq: [
      { question: "Quants diputats escull Catalunya?", answer: "48 dels 350 del Congrés dels Diputats: Barcelona 32, Girona 6, Tarragona 6 i Lleida 4." },
      { question: "Quina participació hi va haver a Catalunya a les generals del 2023?", answer: "Al voltant del 62,7 %, calculada amb les dades de la Generalitat: votants sobre cens." },
      { question: "D'on surten aquests resultats?", answer: "De les dades electorals obertes de la Generalitat de Catalunya, que cobreixen totes les eleccions a Catalunya des del 1977." },
    ],
    note: "Les taules es llegeixen en directe de les dades obertes de la Generalitat.",
  },
};

export const CONGRESS_RESULTS: B2Article = {
  key: "congressResults",
  entryKey: "guide-general-election-results-catalonia",
  categoryKey: "public-services",
  sources: [
    ...DATA_SOURCES,
    { name: "Real Decreto 806/2026 (convocatoria y escaños por provincia)", url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742", publisher: "Boletín Oficial del Estado" },
  ],
  heroKey: "congres-hemicicle-sostre",
  heroAlt: {
    ca: "El sostre pintat de l'hemicicle del Congrés dels Diputats",
    es: "El techo pintado del hemiciclo del Congreso de los Diputados",
    en: "The painted ceiling of the Congress of Deputies chamber",
  },
  heroCaption: {
    ca: "L'hemicicle del Congrés, on Catalunya té 48 dels 350 escons.",
    es: "El hemiciclo del Congreso, donde Cataluña tiene 48 de los 350 escaños.",
    en: "The Congress chamber, where Catalonia holds 48 of the 350 seats.",
  },
  secondaryKey: "senat-palau-passadis",
  secondaryAlt: {
    ca: "Un passadís del Palau del Senat a Madrid",
    es: "Un pasillo del Palacio del Senado en Madrid",
    en: "A corridor in the Senate palace in Madrid",
  },
  secondaryCaption: {
    ca: "El Senat: cada província catalana n'escull quatre senadors.",
    es: "El Senado: cada provincia catalana elige cuatro senadores.",
    en: "The Senate: each Catalan province elects four senators.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T23:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [
      locale,
      { ...CONGRESS_META[locale], blocks: body("congress", CONGRESS_COPY[locale], locale) },
    ]),
  ) as B2Article["editions"],
};

/* ========================================================================== */
/* Parliament of Catalonia                                                    */
/* ========================================================================== */

const PARLIAMENT_META: Record<Locale, Meta> = {
  ca: {
    path: "guies/resultats-eleccions-parlament-catalunya",
    title: "Resultats de les eleccions al Parlament de Catalunya des del 1980",
    seoTitle: "Resultats eleccions al Parlament de Catalunya des del 1980",
    seoDescription:
      "Vots, percentatge i escons de cada candidatura a les eleccions al Parlament de Catalunya des del 1980, i la participació, amb dades obertes oficials.",
    excerpt: "Tots els resultats de les eleccions al Parlament de Catalunya des del 1980: vots, escons i participació, llegits de les dades oficials.",
  },
  es: {
    path: "guias/resultados-elecciones-parlament-cataluna",
    title: "Resultados de las elecciones al Parlament de Catalunya desde 1980",
    seoTitle: "Resultados elecciones al Parlament de Catalunya desde 1980",
    seoDescription:
      "Votos, porcentaje y escaños de cada candidatura en las elecciones al Parlament de Catalunya desde 1980, y la participación, con datos abiertos oficiales.",
    excerpt: "Todos los resultados de las elecciones al Parlament de Catalunya desde 1980: votos, escaños y participación, leídos de los datos oficiales.",
  },
  en: {
    path: "guides/catalan-parliament-election-results",
    title: "Catalan Parliament election results since 1980",
    seoTitle: "Catalan Parliament election results since 1980",
    seoDescription:
      "Votes, share and seats for every list at every election to the Parliament of Catalonia since 1980, and turnout, from the Generalitat's open election data.",
    excerpt: "Every Parliament of Catalonia election result since 1980: votes, seats and turnout, read from the official data.",
  },
};

const PARLIAMENT_COPY: Record<Locale, T> = {
  en: {
    lead: "Every election to the Parliament of Catalonia since the first one in 1980: votes and seats for each list that won a seat, and turnout. The tables read the Generalitat's open election data directly.",
    readTitle: "How to read the tables",
    read: [
      "The Parliament has 135 seats, elected in four constituencies, the provinces, so seats follow the vote province by province rather than across Catalonia as a whole.",
      "Turnout is voters over the electorate, and each list's share is its votes over the valid votes; both are computed from the counts.",
    ],
    nextTitle: "The next one",
    next: "The last election was on 12 May 2024. A Parliament is elected for four years under the Statute of Autonomy, unless the President dissolves it early; no election has been called.",
    faq: [
      { question: "How many seats does the Parliament of Catalonia have?", answer: "135, elected in the four provinces." },
      { question: "When was the last Catalan election?", answer: "On 12 May 2024." },
      { question: "When is the next Catalan election?", answer: "None has been called. The term is four years from May 2024 unless the President calls an early election." },
    ],
    note: "The tables are read live from the Generalitat's open data.",
  },
  es: {
    lead: "Todas las elecciones al Parlament de Catalunya desde las primeras, en 1980: votos y escaños de cada candidatura que obtuvo representación, y la participación. Las tablas leen directamente los datos electorales abiertos de la Generalitat.",
    readTitle: "Cómo leer las tablas",
    read: [
      "El Parlament tiene 135 escaños, elegidos en cuatro circunscripciones, las provincias, así que los escaños siguen el voto provincia a provincia y no en el conjunto de Cataluña.",
      "La participación es votantes sobre censo, y el porcentaje de cada candidatura, sus votos sobre los votos válidos; los dos se calculan a partir de los recuentos.",
    ],
    nextTitle: "Las próximas",
    next: "Las últimas elecciones fueron el 12 de mayo de 2024. Según el Estatuto de Autonomía, el Parlament se elige por cuatro años, salvo disolución anticipada por el presidente o la presidenta; no hay elecciones convocadas.",
    faq: [
      { question: "¿Cuántos escaños tiene el Parlament de Catalunya?", answer: "135, elegidos en las cuatro provincias." },
      { question: "¿Cuándo fueron las últimas elecciones catalanas?", answer: "El 12 de mayo de 2024." },
      { question: "¿Cuándo son las próximas elecciones catalanas?", answer: "No hay ninguna convocada. La legislatura dura cuatro años desde mayo de 2024, salvo adelanto electoral." },
    ],
    note: "Las tablas se leen en directo de los datos abiertos de la Generalitat.",
  },
  ca: {
    lead: "Totes les eleccions al Parlament de Catalunya des de les primeres, el 1980: vots i escons de cada candidatura que va obtenir representació, i la participació. Les taules llegeixen directament les dades electorals obertes de la Generalitat.",
    readTitle: "Com llegir les taules",
    read: [
      "El Parlament té 135 escons, escollits en quatre circumscripcions, les províncies, així que els escons segueixen el vot província a província i no al conjunt de Catalunya.",
      "La participació és votants sobre cens, i el percentatge de cada candidatura, els seus vots sobre els vots vàlids; tots dos es calculen a partir dels recomptes.",
    ],
    nextTitle: "Les properes",
    next: "Les últimes eleccions van ser el 12 de maig de 2024. Segons l'Estatut d'Autonomia, el Parlament s'escull per quatre anys, llevat de dissolució anticipada pel president o la presidenta; no hi ha eleccions convocades.",
    faq: [
      { question: "Quants escons té el Parlament de Catalunya?", answer: "135, escollits a les quatre províncies." },
      { question: "Quan van ser les últimes eleccions catalanes?", answer: "El 12 de maig de 2024." },
      { question: "Quan són les properes eleccions catalanes?", answer: "No n'hi ha cap de convocada. La legislatura dura quatre anys des del maig del 2024, llevat d'avançament electoral." },
    ],
    note: "Les taules es llegeixen en directe de les dades obertes de la Generalitat.",
  },
};

export const PARLIAMENT_RESULTS: B2Article = {
  key: "parliamentResults",
  entryKey: "guide-catalan-parliament-election-results",
  categoryKey: "public-services",
  sources: [
    ...DATA_SOURCES,
    { name: "Estatut d'Autonomia de Catalunya (arts. 56 i 66)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2006-13087", publisher: "Boletín Oficial del Estado" },
  ],
  heroKey: "parlament-sala-de-plens",
  heroAlt: {
    ca: "La Sala de Plens del Parlament de Catalunya, amb els escons vermells i les làmpades",
    es: "La Sala de Plenos del Parlament de Catalunya, con los escaños rojos y las lámparas",
    en: "The plenary chamber of the Parliament of Catalonia, with its red seats and chandeliers",
  },
  heroCaption: {
    ca: "La Sala de Plens: 135 escons.",
    es: "La Sala de Plenos: 135 escaños.",
    en: "The plenary chamber: 135 seats.",
  },
  secondaryKey: "parlament-palau-ciutadella",
  secondaryAlt: {
    ca: "La façana del Palau del Parlament al parc de la Ciutadella de Barcelona",
    es: "La fachada del Palacio del Parlament en el parque de la Ciutadella de Barcelona",
    en: "The front of the Parliament building in Barcelona's Parc de la Ciutadella",
  },
  secondaryCaption: {
    ca: "El Palau del Parlament, al parc de la Ciutadella.",
    es: "El Palacio del Parlament, en el parque de la Ciutadella.",
    en: "The Parliament building in the Parc de la Ciutadella.",
  },
  verifiedAt: VERIFIED,
  publishedAt: "2026-10-12T23:00:00+02:00",
  editions: Object.fromEntries(
    (["ca", "es", "en"] as Locale[]).map((locale) => [
      locale,
      { ...PARLIAMENT_META[locale], blocks: body("parliament", PARLIAMENT_COPY[locale], locale) },
    ]),
  ) as B2Article["editions"],
};

export { CONGRESS_META, PARLIAMENT_META };
