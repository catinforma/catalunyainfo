/**
 * The regulated price of bottled butane: every figure as the BOE prints it.
 * No logic here (rules.ts) and no words (copy.ts). Fact pack:
 * research_notes/butano-precio-nov2026.md (gitignored), checked 13 Nov 2026.
 *
 * TO ENTER A NEW REVISION (17 Nov 2026, then 19 Jan 2027, …): when the BOE
 * publishes the Resolución of the Dirección General de Política Energética y
 * Minas (so far always the Monday before the third Tuesday), add ONE line at
 * the end of REVISIONS with its effective date, BOE id, signing date,
 * publication date and the pre-tax price exactly as printed in its
 * "Segundo" (c€/kg, four decimals). tests/butane.test.ts fails from the day
 * after each scheduled revision until it is here, or listed in
 * NO_RESOLUTION if the BOE publishes none (as in 2020, RDL 8/2020).
 * Never enter a price before the BOE prints it.
 */

export interface Revision {
  /** "Desde las cero horas del día …": the day the price applies from (always a Tuesday). */
  effective: string;
  /** BOE id of the resolution: BOE-A-YYYY-N. */
  boe: string;
  /** "Resolución de <signed>". */
  signed: string;
  /** Day it appeared in the BOE. */
  published: string;
  /** "Segundo. Precio máximo de venta antes de impuestos", c€/kg, exactly as printed. */
  centsPerKg: string;
}

const r = (effective: string, boe: string, signed: string, published: string, centsPerKg: string): Revision => ({ effective, boe, signed, published, centsPerKg });

/** Oldest first. Each line read from the resolution's text on boe.es (diario_boe/xml.php?id=…) on 13 Nov 2026. */
export const REVISIONS: readonly Revision[] = [
  r("2024-01-16", "BOE-A-2024-715", "2024-01-11", "2024-01-15", "103,5612"),
  r("2024-03-19", "BOE-A-2024-5273", "2024-03-12", "2024-03-18", "108,7393"),
  r("2024-05-21", "BOE-A-2024-10075", "2024-05-14", "2024-05-20", "105,2417"),
  r("2024-07-16", "BOE-A-2024-14391", "2024-07-09", "2024-07-15", "99,9796"),
  r("2024-09-17", "BOE-A-2024-18471", "2024-09-09", "2024-09-16", "103,8418"),
  r("2024-11-19", "BOE-A-2024-23950", "2024-11-07", "2024-11-18", "108,3428"),
  r("2025-01-21", "BOE-A-2025-879", "2025-01-15", "2025-01-20", "108,5778"),
  r("2025-03-18", "BOE-A-2025-5189", "2025-03-11", "2025-03-17", "115,3287"),
  r("2025-05-20", "BOE-A-2025-9811", "2025-05-12", "2025-05-19", "117,5357"),
  r("2025-07-15", "BOE-A-2025-14457", "2025-07-08", "2025-07-14", "111,6589"),
  r("2025-09-16", "BOE-A-2025-18189", "2025-09-08", "2025-09-15", "106,0760"),
  r("2025-11-18", "BOE-A-2025-23213", "2025-11-06", "2025-11-17", "100,7722"),
  r("2026-01-20", "BOE-A-2026-1077", "2026-01-12", "2026-01-19", "101,5583"),
  r("2026-03-17", "BOE-A-2026-6094", "2026-03-05", "2026-03-16", "106,6362"),
  r("2026-05-19", "BOE-A-2026-10669", "2026-05-12", "2026-05-18", "111,9680"),
  r("2026-07-21", "BOE-A-2026-15740", "2026-07-09", "2026-07-20", "117,5664"),
  r("2026-09-15", "BOE-A-2026-19115", "2026-09-08", "2026-09-14", "123,4447"),
  // 17 Nov 2026: add the line here when the BOE publishes it (expected Monday 16 Nov).
];

/**
 * A scheduled revision day on which the BOE published no resolution, with
 * the norm that explains it. Empty since 2024.
 */
export const NO_RESOLUTION: readonly { date: string; basis: string }[] = [];

/** From the resolution of 18 Mar 2025 (Orden TED/211/2025) the system covers commercial butane only; before, bottled LPG (butane and propane). */
export const BUTANE_ONLY_FROM = "2025-03-18";

/** The first revision of the table where the ±5 % step applies to the same product (the March 2025 change came with TED/211/2025's new formula). */
export const FIVE_PERCENT_CHECK_FROM = "2025-05-20";

/** Orden IET/389/2015 art. 3.1: at most ±5 % on the pre-tax price from one bimonth to the next. */
export const MAX_STEP = 0.05;

/** The bottle the page prices: 12.5 kg, the usual household butane bottle. */
export const BOTTLE_KG = 12.5;

/**
 * Real Decreto-ley 25/2026, art. 3: until 30 Jun 2027 the pre-tax price
 * cannot exceed that of the Resolución de 12 de mayo de 2022 (BOE-A-2022-7878,
 * "127,7838 c€/Kg"). The preamble gives it as 19,55 € per 12.5 kg bottle on
 * the peninsula.
 */
export const CEILING = {
  centsPerKg: "127,7838",
  until: "2027-06-30",
  bottleEurPeninsula: "19,55",
  resolution2022: "BOE-A-2022-7878",
} as const;

/**
 * The pending gap the September 2026 resolution carries to the next revision
 * ("el valor del desajuste para la próxima revisión bimestral de precios será
 * de +15,8822 cts.€/Kg"). Quoted, never turned into a forecast.
 */
export const PENDING_ADJUSTMENT = { boe: "BOE-A-2026-19115", centsPerKg: "+15,8822" } as const;

/**
 * Taxes on the bottle in the Peninsula and the Balearic Islands, by period:
 * the hydrocarbons tax (Ley 38/1992 art. 50, epígrafe 1.8, GLP for non-fuel
 * uses, €/tonne) and VAT. Only dates inside a period get a price with taxes;
 * tests/butane.test.ts fails from the first day not covered.
 *
 *  - Oct 2026: 15 €/t (RDL 25/2026 art. 13).
 *  - Nov 2026: 15 €/t, since the INE's September CPI for "Hidrocarburos
 *    licuados" rose 10.2 % year on year, not more than 15 % (art. 14).
 *  - Dec 2026: 0 €/t, since October's rose 16.1 % (art. 15; INE, 13 Nov 2026).
 *  - VAT 21 % (Ley 37/1992 art. 90): RDL 25/2026 arts. 18–19 cut it only for
 *    electricity, natural gas, pellets, briquettes and firewood.
 */
export interface TaxPeriod {
  from: string;
  to: string;
  hydrocarbonsEurPerTonne: number;
  vatPercent: number;
  /** Article that sets the hydrocarbons rate for the period. */
  article: string;
}

export const TAX_PERIODS: readonly TaxPeriod[] = [
  { from: "2026-10-01", to: "2026-10-31", hydrocarbonsEurPerTonne: 15, vatPercent: 21, article: "13" },
  { from: "2026-11-01", to: "2026-11-30", hydrocarbonsEurPerTonne: 15, vatPercent: 21, article: "14" },
  { from: "2026-12-01", to: "2026-12-31", hydrocarbonsEurPerTonne: 0, vatPercent: 21, article: "15" },
];

/** The INE figures that set November's and December's rate (series IPC291846, annual change). */
export const INE_LPG_CPI = { series: "IPC291846", september2026: "10,2", october2026: "16,1", read: "2026-11-13" } as const;

/**
 * Operators obliged to deliver bottles to the home (Resolución de la DGPEM
 * de 3 de junio de 2026, BOE-A-2026-13564). `orderUrl` only where the
 * operator's own page was checked on 13 Nov 2026; no affiliate links.
 */
export const OPERATORS = [
  { area: "peninsula-baleares", name: "Repsol Butano, SA", orderUrl: "https://pidetubombona.repsol.es/" },
  { area: "canarias", name: "Disa Gas, SA", orderUrl: "https://www.disagrupo.es/gas/gas_cocina_bombonas.aspx" },
  { area: "ceuta-melilla", name: "Gasib Sociedad Ibérica de Gas Licuado, SL", orderUrl: null },
] as const;

export const OPERATORS_BOE = "BOE-A-2026-13564";

/** The day every figure above was last read from its source. */
export const BUTANE_CHECKED = "2026-11-13";

export const URLS = {
  boeTxt: (id: string) => `https://www.boe.es/diario_boe/txt.php?id=${id}`,
  order389: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-2495",
  ted211: "https://www.boe.es/buscar/doc.php?id=BOE-A-2025-4410",
  rdl25: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-20265",
  rdl15_2018: "https://www.boe.es/buscar/act.php?id=BOE-A-2018-13593",
  vatLaw: "https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740",
  ineCpiTable: "https://www.ine.es/jaxiT3/Tabla.htm?t=76128",
  bonoSocial: "https://www.bonosocial.gob.es/",
  repsolBottle: "https://www.repsol.es/particulares/hogar/bombona-butano-propano/butano-12-5-kg/",
} as const;
