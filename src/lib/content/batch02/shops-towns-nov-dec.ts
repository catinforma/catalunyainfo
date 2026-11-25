/**
 * The towns whose 2026 shop opening days differ from the default, in one
 * module with no imports so the Catalan shops guide (shops.ts) and the
 * Spain-wide December guide (shops-spain-december.ts) read the same table and
 * cannot disagree about 8 December (25 Nov 2026: the Spain guide said "No" for
 * Catalonia on the 8th while the Catalan guide said yes for Barcelona).
 *
 * Source: Resolució EMT/4342/2025, de 20 de novembre (DOGC núm. 9551,
 * 27.11.2025), PDF re-read on 25 Nov 2026. Its preamble: "els deu dies festius
 * amb obertura comercial autoritzada per a l'any 2026, per als municipis que no
 * consten en aquesta Resolució, són el 4 i l'11 de gener, el 15 d'agost, el
 * 12 d'octubre, el 29 de novembre, i el 6, el 8, el 13, el 20 i el 27 de
 * desembre". Barcelona's own entry: "4 i 11 de gener. 15 d'agost. 12 d'octubre.
 * 29 de novembre. 6, 8, 13, 20 i 27 de desembre."
 */

/**
 * Every municipality in Resolució EMT/4342/2025 whose shop opening days from
 * 1 November to 31 December 2026 differ from the default (29 Nov; 6, 8, 13,
 * 20 and 27 Dec): `closed` = default days it does not open, `extra` = days it
 * adds. Transcribed from the DOGC text on 30 Oct 2026.
 */
export const TOWNS_NOV_DEC: { town: string; closed: string[]; extra: string[] }[] = [
  { town: "L'Ametlla del Vallès", closed: [], extra: ["2026-11-01"] },
  { town: "Argentona", closed: ["2026-12-08"], extra: [] },
  { town: "Artés", closed: ["2026-12-08"], extra: [] },
  { town: "Badalona", closed: ["2026-12-08"], extra: [] },
  { town: "Caldes de Montbui", closed: ["2026-12-08"], extra: [] },
  { town: "Cardedeu", closed: ["2026-12-08"], extra: [] },
  { town: "Cassà de la Selva", closed: ["2026-12-08"], extra: [] },
  { town: "Celrà", closed: ["2026-12-08"], extra: [] },
  { town: "Centelles", closed: ["2026-12-08"], extra: ["2026-12-31"] },
  { town: "Gavà", closed: ["2026-12-08"], extra: ["2026-12-14"] },
  { town: "Gironella", closed: ["2026-11-29", "2026-12-27"], extra: [] },
  { town: "Manlleu", closed: ["2026-12-08"], extra: [] },
  { town: "Manresa", closed: ["2026-12-08"], extra: [] },
  { town: "Martorell", closed: ["2026-11-29"], extra: [] },
  { town: "Mollet del Vallès", closed: ["2026-12-08"], extra: ["2026-11-01"] },
  { town: "Montcada i Reixac", closed: ["2026-12-08"], extra: [] },
  { town: "Olèrdola", closed: ["2026-12-08"], extra: [] },
  { town: "Olot", closed: ["2026-12-13"], extra: [] },
  { town: "Riells i Viabrea", closed: ["2026-12-06"], extra: ["2026-11-09"] },
  { town: "Sallent", closed: ["2026-12-08"], extra: [] },
  { town: "Salt", closed: ["2026-11-29"], extra: [] },
  { town: "Sant Andreu de la Barca", closed: [], extra: ["2026-11-30"] },
  { town: "Sant Boi de Llobregat", closed: [], extra: ["2026-12-07"] },
  { town: "Sant Esteve Sesrovires", closed: ["2026-12-08"], extra: [] },
  { town: "Sant Jordi Desvalls", closed: ["2026-12-08"], extra: [] },
  { town: "Sant Vicenç de Castellet", closed: ["2026-12-08"], extra: [] },
  { town: "Santa Coloma de Gramenet", closed: ["2026-12-08"], extra: [] },
  { town: "La Selva del Camp", closed: ["2026-12-08"], extra: [] },
  { town: "Terrassa", closed: ["2026-12-06"], extra: [] },
  { town: "Ulldecona", closed: ["2026-12-08"], extra: [] },
];

/** The towns of TOWNS_NOV_DEC that do not open on a default day. */
export const closedOn = (iso: string): string[] => TOWNS_NOV_DEC.filter((t) => t.closed.includes(iso)).map((t) => t.town);

/** The towns of TOWNS_NOV_DEC that add a day which is not an opening day elsewhere. */
export const extraOn = (iso: string): string[] => TOWNS_NOV_DEC.filter((t) => t.extra.includes(iso)).map((t) => t.town);

/**
 * The H2 over the Catalan guide's town search (the `shopsChristmas` block).
 * Kept here, with no imports, so the Spain guide can link to the search by
 * anchor (`slugifyAnchor` of this text) without importing the guide; the guide
 * reads its heading from here, so the two cannot drift apart.
 */
export const SELECTOR_TITLE = {
  ca: "Botigues obertes per Nadal al teu municipi",
  es: "Tiendas abiertas en Navidad en tu municipio",
  en: "Shops open at Christmas in your town",
} as const;
