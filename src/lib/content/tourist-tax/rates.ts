import type { Locale } from "@/lib/i18n/config";

/**
 * The tourist tax rate table — the single source of every figure on the page.
 *
 * The article's tables and the calculator both read from here, so a rate can
 * never be right in one place and stale in the other. Nothing numeric is
 * written in the prose.
 *
 * Verified against the Agència Tributària de Catalunya's own tariff page on
 * 24 September 2026, figure by figure.
 *
 * ## What is deliberately absent
 *
 * The editorial package supplied a Barcelona surcharge of €6 from 1 April
 * 2027 and a combined table built on it. **That could not be verified.** The
 * ATC confirms the rest-of-Catalonia rates rising on that date — five-star
 * goes to €6.00 — and the €6 attributed to Barcelona's surcharge looks like
 * the same figure read off the wrong row. The law lets Barcelona set a
 * surcharge of up to €8 by ordinance; what it will be from April 2027 is not
 * something this file is willing to assert.
 *
 * So there is no Barcelona period after 31 March 2027 here. The calculator
 * refuses a date it has no verified rate for rather than guessing, and the
 * article says the surcharge is set by ordinance and may change.
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

export const RATE_PERIODS: RatePeriod[] = [
  {
    scope: "barcelona",
    from: "2026-04-01",
    until: "2027-03-31",
    regional: {
      "hotel-5": 7.0,
      "hotel-4": 3.4,
      "tourist-dwelling": 4.5,
      hostel: 1.0,
      other: 2.0,
      "cruise-over-12h": 4.0,
      "cruise-under-12h": 6.0,
    },
    surcharge: 5.0,
    sourceUrl: ATC_RATES,
    verifiedAt: "2026-09-24",
  },
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
    // Municipalities may levy one from 1 October 2026. None is verified here.
    surcharge: null,
    sourceUrl: ATC_RATES,
    verifiedAt: "2026-09-24",
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
    verifiedAt: "2026-09-24",
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
    ca: "Resta de Catalunya",
    es: "Resto de Cataluña",
    en: "Rest of Catalonia",
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
];

export const LAST_VERIFIED = "2026-09-24";
export const NEXT_REVIEW = "2026-10-01";
