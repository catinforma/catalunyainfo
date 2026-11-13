import type { Locale } from "@/lib/i18n/config";

/**
 * The tourist tax rate table — the single source of every figure on the page.
 *
 * The article's tables and the calculator both read from here, so a rate can
 * never be right in one place and stale in the other. Nothing numeric is
 * written in the prose.
 *
 * Verified against the Agència Tributària de Catalunya's tariff page, Llei
 * 2/2026 (DOGC 9621) and Barcelona's Ordenança fiscal 2.2 (BOPB 2-2-2026) on
 * 18 October 2026 (research_notes/audits/p0_data_accuracy.md). Re-read on the
 * ATC tariff page on 30 October 2026: every Barcelona and rest-of-Catalonia
 * figure unchanged, Barcelona's €6 and €7 steps listed by the ATC too; the
 * seven municipal surcharges and the special rate were added below.
 *
 * ## Barcelona from April 2027
 *
 * The Generalitat's Barcelona rate is open-ended ("a partir de l'1 d'abril de
 * 2026"); only the city's surcharge steps up, by the ordinance's transitional
 * provision: €5 to 31 March 2027, €6 to 31 March 2028, €7 to 31 March 2029,
 * then the article 2.2 figure of €8 (the legal maximum). An earlier version of
 * this file called the €6 a misread figure; it is the ordinance's own number.
 *
 * ## Other municipalities
 *
 * Seven municipalities have charged their own surcharge since 1 October 2026
 * (Castelldefels, Esplugues, L'Hospitalet, El Prat, Sabadell, Sant Cugat,
 * Sant Just Desvern). The calculator's "rest of Catalonia" scope is the
 * regional rate only, i.e. a municipality without a surcharge; the page says
 * so and names the seven.
 */

export type Scope = "barcelona" | "rest-of-catalonia";

export type AccommodationType =
  | "hotel-5"
  | "hotel-4"
  | "tourist-dwelling"
  | "hostel"
  | "other"
  | "cruise-over-12h"
  | "cruise-under-12h";

export interface RatePeriod {
  scope: Scope;
  /** Inclusive ISO date. */
  from: string;
  /** Inclusive ISO date, or null while open-ended. */
  until: string | null;
  /** Regional IEET rate per liable person per stay unit, in euros. */
  regional: Record<AccommodationType, number>;
  /**
   * Municipal surcharge per person per stay unit, in euros.
   *
   * `null` means "no verified surcharge for this scope and period" — which is
   * not the same as zero, and the interface has to say so. Municipalities
   * outside Barcelona may levy one for stays from 1 October 2026, and we do
   * not know which have.
   */
  surcharge: number | null;
  sourceUrl: string;
  verifiedAt: string;
}

/** The law caps the taxable stay at seven units per person, per continuous stay. */
export const MAX_STAY_UNITS = 7;

/** Age at or below which a guest is exempt. */
export const EXEMPT_AGE_AT_OR_BELOW = 16;

/** Earliest date a municipality other than Barcelona may charge a surcharge. */
export const MUNICIPAL_SURCHARGE_FROM = "2026-10-01";

const ATC_RATES = "https://atc.gencat.cat/ca/tributs/ieet/quota-tributaria";

const BARCELONA_REGIONAL: Record<AccommodationType, number> = {
  "hotel-5": 7.0,
  "hotel-4": 3.4,
  "tourist-dwelling": 4.5,
  hostel: 1.0,
  other: 2.0,
  "cruise-over-12h": 4.0,
  "cruise-under-12h": 6.0,
};

const BCN_ORDINANCE =
  "https://ajuntament.barcelona.cat/hisenda/sites/default/files/normativa/2026-02/2.2-ordenanca-recarrec-turistic.pdf";

/** Barcelona: same regional rate, surcharge stepping up each 1 April (Ordenança fiscal 2.2). */
const BARCELONA_STEPS: [from: string, until: string | null, surcharge: number][] = [
  ["2026-04-01", "2027-03-31", 5.0],
  ["2027-04-01", "2028-03-31", 6.0],
  ["2028-04-01", "2029-03-31", 7.0],
  ["2029-04-01", null, 8.0],
];

export const RATE_PERIODS: RatePeriod[] = [
  ...BARCELONA_STEPS.map(([from, until, surcharge]): RatePeriod => ({
    scope: "barcelona",
    from,
    until,
    regional: BARCELONA_REGIONAL,
    surcharge,
    sourceUrl: surcharge === 5.0 ? ATC_RATES : BCN_ORDINANCE,
    verifiedAt: "2026-11-13",
  })),
  {
    scope: "rest-of-catalonia",
    from: "2026-04-01",
    until: "2027-03-31",
    regional: {
      "hotel-5": 4.5,
      "hotel-4": 1.8,
      "tourist-dwelling": 1.75,
      hostel: 0.8,
      other: 0.9,
      "cruise-over-12h": 3.0,
      "cruise-under-12h": 4.5,
    },
    // Regional rate only: what applies in a municipality without a surcharge
    // (seven municipalities have one since 1 Oct 2026; the page names them).
    surcharge: null,
    sourceUrl: ATC_RATES,
    verifiedAt: "2026-11-13",
  },
  {
    scope: "rest-of-catalonia",
    from: "2027-04-01",
    until: null,
    regional: {
      "hotel-5": 6.0,
      "hotel-4": 2.4,
      "tourist-dwelling": 2.5,
      hostel: 1.0,
      other: 1.2,
      "cruise-over-12h": 4.0,
      "cruise-under-12h": 6.0,
    },
    surcharge: null,
    sourceUrl: ATC_RATES,
    verifiedAt: "2026-11-13",
  },
];

/** Order used in every table and dropdown, so they always read the same. */
export const ACCOMMODATION_ORDER: AccommodationType[] = [
  "hotel-5",
  "hotel-4",
  "tourist-dwelling",
  "hostel",
  "other",
  "cruise-over-12h",
  "cruise-under-12h",
];

export const ACCOMMODATION_LABEL: Record<AccommodationType, Record<Locale, string>> = {
  "hotel-5": {
    ca: "Hotel de 5 estrelles, gran luxe i equivalents",
    es: "Hotel de 5 estrellas, gran lujo y equivalentes",
    en: "Five-star hotel, grand luxury and equivalent",
  },
  "hotel-4": {
    ca: "Hotel de 4 estrelles i 4 superior",
    es: "Hotel de 4 estrellas y 4 superior",
    en: "Four-star and four-star superior hotel",
  },
  "tourist-dwelling": {
    ca: "Habitatge d'ús turístic",
    es: "Vivienda de uso turístico",
    en: "Licensed tourist dwelling",
  },
  hostel: {
    ca: "Alberg de joventut",
    es: "Albergue de juventud",
    en: "Youth hostel",
  },
  other: {
    ca: "Resta d'establiments i càmpings",
    es: "Resto de establecimientos y campings",
    en: "Other accommodation and campsites",
  },
  "cruise-over-12h": {
    ca: "Creuer, escala de més de 12 hores",
    es: "Crucero, escala de más de 12 horas",
    en: "Cruise ship, call of more than 12 hours",
  },
  "cruise-under-12h": {
    ca: "Creuer, escala de 12 hores o menys",
    es: "Crucero, escala de 12 horas o menos",
    en: "Cruise ship, call of 12 hours or less",
  },
};

export const SCOPE_LABEL: Record<Scope, Record<Locale, string>> = {
  barcelona: { ca: "Barcelona", es: "Barcelona", en: "Barcelona" },
  "rest-of-catalonia": {
    // Regional rate only: the seven municipalities with a surcharge since
    // 1 Oct 2026 are named in the article, not priced here.
    ca: "Resta de Catalunya (municipi sense recàrrec)",
    es: "Resto de Cataluña (municipio sin recargo)",
    en: "Rest of Catalonia (no municipal surcharge)",
  },
};

/* -------------------------------------------------------------------------- */
/* Lookup and calculation                                                     */
/* -------------------------------------------------------------------------- */

function within(period: RatePeriod, iso: string): boolean {
  if (iso < period.from) return false;
  return period.until === null || iso <= period.until;
}

/** The period covering a date, or null when none is verified for it. */
export function periodFor(scope: Scope, iso: string): RatePeriod | null {
  return RATE_PERIODS.find((period) => period.scope === scope && within(period, iso)) ?? null;
}

export interface TaxInput {
  scope: Scope;
  /** ISO date of the stay. Rates change on 1 April. */
  date: string;
  accommodation: AccommodationType;
  /** Guests who are not exempt. */
  liableGuests: number;
  nights: number;
}

export interface TaxResult {
  /** Null when no verified rate covers the requested date. */
  regional: number | null;
  surcharge: number | null;
  perPersonPerUnit: number | null;
  taxableUnits: number;
  liableGuests: number;
  total: number | null;
  /** True when the stay is longer than the law counts. */
  capped: boolean;
  period: RatePeriod | null;
}

/**
 * `(regional + surcharge) × liable guests × min(nights, 7)`.
 *
 * Returns nulls rather than a number when the date falls outside every
 * verified period. A tax figure that is quietly wrong is worse than no figure:
 * somebody budgets against it.
 */
export function calculateTax(input: TaxInput): TaxResult {
  const period = periodFor(input.scope, input.date);
  const nights = Math.max(0, Math.floor(input.nights));
  const guests = Math.max(0, Math.floor(input.liableGuests));
  const taxableUnits = Math.min(nights, MAX_STAY_UNITS);

  if (!period) {
    return {
      regional: null,
      surcharge: null,
      perPersonPerUnit: null,
      taxableUnits,
      liableGuests: guests,
      total: null,
      capped: nights > MAX_STAY_UNITS,
      period: null,
    };
  }

  const regional = period.regional[input.accommodation];
  const surcharge = period.surcharge;
  const perPersonPerUnit = round(regional + (surcharge ?? 0));

  return {
    regional,
    surcharge,
    perPersonPerUnit,
    taxableUnits,
    liableGuests: guests,
    total: round(perPersonPerUnit * guests * taxableUnits),
    capped: nights > MAX_STAY_UNITS,
    period,
  };
}

/** Two decimals, without the floating-point tail. */
export function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export const SOURCES = [
  {
    name: "Impost sobre les estades en establiments turístics — quota tributària i tarifes",
    url: ATC_RATES,
    publisher: "Agència Tributària de Catalunya",
  },
  {
    name: "Increment de tarifes, recàrrec de Barcelona i recàrrec per a la resta de municipis (Llei 2/2026)",
    url: "https://atc.gencat.cat/ca/agencia/noticies/detall-noticia/20260310-ieet-tarifes",
    publisher: "Agència Tributària de Catalunya",
  },
  {
    name: "Impost sobre les estades en establiments turístics",
    url: "https://atc.gencat.cat/ca/tributs/ieet/",
    publisher: "Agència Tributària de Catalunya",
  },
  {
    name: "Impost sobre les estades en establiments turístics — meritació (creuers)",
    url: "https://atc.gencat.cat/ca/tributs/ieet/meritacio/",
    publisher: "Agència Tributària de Catalunya",
  },
  {
    name: "Ordenança fiscal núm. 2.2 — recàrrec sobre l'impost sobre les estades en establiments turístics",
    url: "https://ajuntament.barcelona.cat/hisenda/sites/default/files/normativa/2026-02/2.2-ordenanca-recarrec-turistic.pdf",
    publisher: "Ajuntament de Barcelona",
  },
];

/* -------------------------------------------------------------------------- */
/* Municipal surcharges outside Barcelona                                      */
/* -------------------------------------------------------------------------- */

/**
 * The seven municipal surcharges in force since 1 October 2026, as the ATC's
 * tariff page lists them (read 30 Oct 2026, section "Recàrrecs d'altres
 * municipis"). Amounts are per person and stay unit, on top of the regional
 * rate, for 1 Oct 2026 to 31 Mar 2027. `null` = the ATC table has no row for
 * that category in that municipality (Esplugues lists only three categories).
 *
 * Esplugues is transcribed as printed (tourist dwelling 0,90 €, other
 * establishments 1,75 €), even though it reads like the other towns' two
 * values swapped: the ATC page is the source, and the page says so.
 *
 * ## From 1 April 2027 (re-read 13 Nov 2026)
 *
 * The same ATC table now has a second column, "Recàrrec de l'Ajuntament a
 * partir de l'01.04.2027", for six of the seven: the four-star, tourist
 * dwelling, hostel and "other" surcharges rise (the five-star stays 4,00 €).
 * Transcribed as printed, including Castelldefels' tourist dwelling at 2,40 €
 * (the others 2,50 €) and Esplugues' 1,20 € / 2,50 €. Sant Just Desvern has
 * one open-ended column, "a partir de l'01.10.2026": `from2027` is null and
 * its first amounts carry on.
 *
 * Castelldefels and El Prat also list a cruise-ship surcharge (CR1 more than
 * 12 hours / CR2 12 hours or less): 3,00 / 4,00 € to 31 Mar 2027, then
 * 4,00 / 4,00 €.
 */
type MunicipalCategory = "hotel-5" | "hotel-4" | "tourist-dwelling" | "hostel" | "other";

export interface CruiseAmounts {
  over12h: number;
  upTo12h: number;
}

export interface MunicipalSurcharge {
  municipality: string;
  /** 1 Oct 2026 to 31 Mar 2027 (open-ended when `from2027` is null). */
  amounts: Partial<Record<MunicipalCategory, number | null>>;
  /** From 1 Apr 2027; null when the ATC lists a single open-ended column. */
  from2027: Partial<Record<MunicipalCategory, number | null>> | null;
  cruise?: { now: CruiseAmounts; from2027: CruiseAmounts };
}

const STD_2026 = { "hotel-5": 4.0, "hotel-4": 1.8, "tourist-dwelling": 1.75, hostel: 0.8, other: 0.9 };
const STD_2027 = { "hotel-5": 4.0, "hotel-4": 2.4, "tourist-dwelling": 2.5, hostel: 1.0, other: 1.2 };
const CRUISE_SURCHARGE = { now: { over12h: 3.0, upTo12h: 4.0 }, from2027: { over12h: 4.0, upTo12h: 4.0 } };

export const MUNICIPAL_SURCHARGES: MunicipalSurcharge[] = [
  {
    municipality: "Castelldefels",
    amounts: STD_2026,
    from2027: { ...STD_2027, "tourist-dwelling": 2.4 },
    cruise: CRUISE_SURCHARGE,
  },
  {
    municipality: "Esplugues de Llobregat",
    amounts: { "hotel-5": null, "hotel-4": 1.8, "tourist-dwelling": 0.9, hostel: null, other: 1.75 },
    from2027: { "hotel-5": null, "hotel-4": 2.4, "tourist-dwelling": 1.2, hostel: null, other: 2.5 },
  },
  { municipality: "L'Hospitalet de Llobregat", amounts: STD_2026, from2027: STD_2027 },
  { municipality: "El Prat de Llobregat", amounts: STD_2026, from2027: STD_2027, cruise: CRUISE_SURCHARGE },
  { municipality: "Sabadell", amounts: STD_2026, from2027: STD_2027 },
  { municipality: "Sant Cugat del Vallès", amounts: STD_2026, from2027: STD_2027 },
  { municipality: "Sant Just Desvern", amounts: STD_2026, from2027: null },
];

/** A municipality's surcharges from 1 April 2027 (its open-ended amounts when it lists no 2027 column). */
export function municipalAmounts2027(m: MunicipalSurcharge): Partial<Record<MunicipalCategory, number | null>> {
  return m.from2027 ?? m.amounts;
}

/* -------------------------------------------------------------------------- */
/* Cruise passengers                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Cruise rules, ATC "Meritació" page (read 13 Nov 2026): "pel que fa a les
 * estades en embarcacions de creuers, l'impost es merita, per als
 * contribuents que es troben en trànsit, en el moment en què el vaixell fa
 * escala en algun port de Catalunya. La persona que embarca en un port de
 * Catalunya iniciant així el seu viatge, o aquella que hi desembarca perquè
 * aquest port és la destinació final del seu viatge, no merita l'impost."
 * The rate depends on whether the call lasts more than 12 hours (CR1/CR3) or
 * 12 hours or less (CR2/CR4); the ship counts as moored "des del moment en
 * què es llança el primer cap ... fins al moment en què el vaixell afluixa
 * l'última amarra" ("Fet imposable i exempcions"). The rates themselves are
 * the cruise rows of RATE_PERIODS.
 */
export const ATC_ACCRUAL = "https://atc.gencat.cat/ca/tributs/ieet/meritacio/";

/** The categories the municipal table shows, in page order. */
export const MUNICIPAL_COLUMNS = ["hotel-5", "hotel-4", "tourist-dwelling", "hostel", "other"] as const;

/**
 * Special rate (from 1 Apr 2026) for establishments inside a "centre
 * recreatiu turístic" located in the areas where gaming is allowed (ATC tariff
 * page, "Tarifa especial", read 30 Oct 2026).
 */
export const SPECIAL_RATE = { "hotel-5": 10.0, "hotel-4": 7.0, other: 5.0 } as const;

// 13 Nov 2026: ATC tariff, taxable-event and accrual pages re-read; Barcelona
// Ordenança fiscal 2.2 (BOPB 2-2-2026) re-read, no 2027 modification on the
// Ajuntament's tax page; no IEET news from the ATC since 30 Sep 2026.
export const LAST_VERIFIED = "2026-11-13";
// New municipal surcharges approved this autumn; then again before 1 Apr 2027.
export const NEXT_REVIEW = "2026-12-01";
/** By this date the 1 April 2027 figures are re-read on the ATC page (date-guard test). */
export const RECHECK_BEFORE_APRIL_2027 = "2027-03-01";
