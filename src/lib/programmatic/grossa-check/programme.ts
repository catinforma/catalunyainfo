/**
 * The prize rules the La Grossa de Cap d'Any checker ("Comprovar La Grossa de
 * Cap d'Any 2026") applies: which tickets win, how much, and how prizes of
 * one draw combine. Client-safe and data-free: the checker in the browser,
 * the page, the build script's checks and the tests read it.
 *
 * ## Source: DOGC núm. 9640 (8.4.2026), Annex 3, read on 19 Nov 2026
 *
 * Anunci pel qual es fa públic l'Acord del Consell d'Administració de
 * Loteries de Catalunya, SAU, de 10 de desembre de 2025, sobre les
 * característiques dels sortejos de La Loteria Passiva 2n semestre 2026
 * (documentId 1041354), read through the DOGC document API
 * (portaldogc.gencat.cat/eadop-rest/api/dogc/documentDOGC). Annex 3 is La
 * Grossa de Cap d'Any: draw on 31 Dec 2026, numbers 00000-99999, 35 series,
 * 10 € a ticket, eight extractions. Point 7 gives each extraction's table
 * (the five digits, the last four, three and two, and for the first prize
 * the last one) and the prize for the numbers just before and after; point 8
 * says how they combine: within one extraction a ticket gets only the
 * highest category it matches (8.2), and across extractions it collects the
 * highest of each (8.3). QUOTE below, verbatim.
 *
 * Applied to 100,000 numbers, those rules pay 615,875 € per series of
 * 1,000,000 €: the 61.59 % "percentatge teòric destinat a premis" of point 6
 * (test). The lottery guide (src/lib/content/batch02/grossa.ts, PRIZES) and
 * the prize tax calculator print the same figures; the tests keep them in step.
 *
 * ## Not in the DOGC
 *
 * The wrap of the neighbour prizes (the number after 99999 is 00000, the one
 * before 00000 is 99999) is from Loteries de Catalunya's game page, read on
 * 30 Oct 2026 for the lottery guide (that site answers 403 to the server since
 * 13 Nov). Only a winning 00000 or 99999 depends on it.
 *
 * The 90-day claim period is the passive lottery's own rule, Resolució
 * ECO/425/2022, annex, 3.f (DOGC núm. 8614), read on 19 Nov 2026.
 *
 * For 2027: a new DOGC agreement (second half of 2027), a new YEAR, new tests.
 */

export const GROSSA_YEAR = 2026;
/** DOGC 9640, annex 3, 2: "La data de realització del sorteig és el 31 de desembre de 2026." */
export const DRAW_DATE = "2026-12-31";

export const NUMBER_COUNT = 100_000;
/** DOGC 9640, annex 3, 4: "El preu del bitllet és de deu (10) euros." */
export const TICKET_PRICE = 10;
/** DOGC 9640, annex 3, 3: "s'emeten trenta-cinc (35) sèries de cada número". */
export const SERIES = 35;
/** DOGC 9640, annex 3, 6: "seixanta-u amb cinquanta-nou per cent (61,59%)". */
export const PRIZE_SHARE = 0.6159;

/** When the DOGC annex was read for this module. */
export const DOGC_READ = "2026-11-19";
/** When Loteries de Catalunya's game page (the neighbour wrap) was last read. */
export const GAME_PAGE_READ = "2026-10-30";

export const SOURCES = {
  dogc: {
    name: "Anunci pel qual es fa públic l'Acord del Consell d'Administració de Loteries de Catalunya, SAU, de 10 de desembre de 2025, sobre les característiques dels sortejos de La Loteria Passiva 2n semestre 2026 (annex 3, La Grossa de Cap d'Any)",
    url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=1041354",
    publisher: "DOGC",
    ref: "DOGC núm. 9640, 8.4.2026",
    read: DOGC_READ,
  },
  eco425: {
    name: "Resolució ECO/425/2022, de 22 de febrer, per la qual s'autoritza la comercialització, la gestió i l'explotació del joc en funcionament de la loteria passiva",
    url: "https://dogc.gencat.cat/ca/document-del-dogc/?documentId=921178",
    publisher: "DOGC",
    ref: "DOGC núm. 8614, 25.2.2022",
    read: DOGC_READ,
  },
  game: {
    name: "La Grossa de Cap d'Any: el joc, els premis i el sorteig",
    url: "https://www.loteriesdecatalunya.cat/jocs/grossa/",
    publisher: "Loteries de Catalunya",
    ref: "pàgina del joc",
    read: GAME_PAGE_READ,
  },
  results: {
    name: "Resultats de La Grossa",
    url: "https://www.loteriesdecatalunya.cat/resultats/grossa/",
    publisher: "Loteries de Catalunya",
    ref: "resultats i comprovador",
    read: GAME_PAGE_READ,
  },
  press: {
    name: "Notes de premsa de Loteries de Catalunya",
    url: "https://www.loteriesdecatalunya.info/ca/sobre-loteries/publicitat/premsa/",
    publisher: "Loteries de Catalunya",
    ref: "notes de premsa (2024 i 2025: números premiats el 31 de desembre)",
    read: DOGC_READ,
  },
} as const;

/** DOGC 9640, annex 3, and ECO/425/2022, verbatim (Catalan). */
export const QUOTE = {
  fifth:
    "Els tres cinquens premis corresponen als bitllets, les xifres dels quals coincideixin amb la primera, segona i tercera extraccions del sorteig, respectivament, i estiguin disposades en el mateix ordre, d'acord amb el quadre següent:",
  first: "El primer premi correspon als bitllets, les xifres dels quals coincideixin amb la vuitena extracció del sorteig i estiguin disposades en el mateix ordre, d'acord amb el quadre següent:",
  neighboursFirst: "S'estableixen premis de dos mil (2.000) euros per bitllet als números anterior i posterior del que sigui guanyador d'aquest premi.",
  repeated: "Si algun dels números de cinc (5) xifres extret resulta repetit, li correspon el premi més alt i es realitzaran una o més extraccions noves per determinar el número o números guanyadors del premi corresponent.",
  highestPerExtraction: "Als números guanyadors de cada extracció els correspon el premi de major import dins les categories establertes per a aquesta extracció.",
  acrossExtractions:
    "Si coincideixen en el mateix ordre les quatre (4), tres (3) o dues (2) últimes xifres de diversos números extrets, els encertants tenen dret a cobrar l'import de la categoria més alta de cada extracció, en funció de les xifres encertades.",
  share: "El percentatge teòric destinat a premis és del seixanta-u amb cinquanta-nou per cent (61,59%) de l'import de l'emissió.",
  expiry: "El dret del jugador a cobrar un premi caduca als noranta (90) dies naturals comptats a partir de la data de celebració del sorteig corresponent",
} as const;

/* -------------------------------------------------------------------------- */
/* The eight extractions                                                      */
/* -------------------------------------------------------------------------- */

export type PrizeKey = "first" | "second" | "third" | "fourth" | "fifth";

/** How a ticket matches one extraction: the whole number, a neighbour, or its last 4, 3, 2 or 1 digits. */
export type Tier = "five" | "neighbour" | "last4" | "last3" | "last2" | "last1";

export interface Extraction {
  /** 1 to 8, in draw order. */
  n: number;
  prize: PrizeKey;
  /** Euros per 10 € ticket for each tier; last1 only for the first prize. */
  pays: Partial<Record<Tier, number>>;
}

/** DOGC 9640, annex 3, 7.1-7.5 ("Premi per bitllet"). */
const FIFTH = { five: 5_000, neighbour: 150, last4: 75, last3: 25, last2: 10 };
const FOURTH = { five: 10_000, neighbour: 200, last4: 100, last3: 30, last2: 15 };
const THIRD = { five: 30_000, neighbour: 500, last4: 200, last3: 35, last2: 20 };
const SECOND = { five: 65_000, neighbour: 650, last4: 300, last3: 75, last2: 25 };
const FIRST = { five: 200_000, neighbour: 2_000, last4: 1_000, last3: 250, last2: 35, last1: 10 };

/** The eight extractions in draw order: three fifths, two fourths, the third, the second, the first (La Grossa). */
export const EXTRACTIONS: readonly Extraction[] = [
  { n: 1, prize: "fifth", pays: FIFTH },
  { n: 2, prize: "fifth", pays: FIFTH },
  { n: 3, prize: "fifth", pays: FIFTH },
  { n: 4, prize: "fourth", pays: FOURTH },
  { n: 5, prize: "fourth", pays: FOURTH },
  { n: 6, prize: "third", pays: THIRD },
  { n: 7, prize: "second", pays: SECOND },
  { n: 8, prize: "first", pays: FIRST },
];

export const PRIZE_ORDER: readonly PrizeKey[] = ["first", "second", "third", "fourth", "fifth"];
export const TIER_ORDER: readonly Tier[] = ["five", "neighbour", "last4", "last3", "last2", "last1"];

/** How many numbers each prize draws: 1, 1, 1, 2, 3. */
export const DRAWN: Record<PrizeKey, number> = { first: 1, second: 1, third: 1, fourth: 2, fifth: 3 };
export const DRAWN_TOTAL = EXTRACTIONS.length;

/** One extraction of this prize (all extractions of a prize pay the same). */
export function extractionOf(prize: PrizeKey): Extraction {
  return EXTRACTIONS.find((e) => e.prize === prize)!;
}

/**
 * How many of the 100,000 numbers win each tier of one extraction, with 8.2
 * (one prize per extraction, the highest): the number itself, its two
 * neighbours, then 9 more with the same last four digits, 90 with the last
 * three, 900 with the last two and, for the first prize, 9,000 with the last one.
 */
export const TIER_COUNT: Record<Tier, number> = { five: 1, neighbour: 2, last4: 9, last3: 90, last2: 900, last1: 9_000 };

/** Euros one series pays under these rules (the tests compare it with the DOGC's 61.59 %). */
export function eurosPerSeries(): number {
  return EXTRACTIONS.reduce((sum, e) => sum + TIER_ORDER.reduce((s, t) => s + (e.pays[t] ?? 0) * TIER_COUNT[t], 0), 0);
}
