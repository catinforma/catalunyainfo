import type { Locale } from "@/lib/i18n/config";

import type { Ticket, TripProfile } from "./types";

/**
 * Barcelona transport fares, 2026.
 *
 * Every figure below was read off TMB's own fare page on 29 September 2026,
 * and the single, T-casual, T-dia and T-usual fares were re-read on 28 October
 * 2026 on TMB's 2026 fare table ("in force from 15 January 2026"). The Hola
 * Barcelona prices keep their own 12 Oct 2026 date: TMB's pages show only
 * "from 12,50 €" and the shop renders the rest client-side.
 * Press coverage of the January rise reported 12,99 €, 11,95 € and 22,77 €;
 * those were the pre-approval projections, and TMB publishes 13 €, 12 € and
 * 22,80 €. The operator's own page wins.
 *
 * ## The Hola Barcelona prices
 *
 * TMB's tmb.cat page for the card lists durations and coverage but not the
 * fares, so until 12 Oct 2026 the card was compared with no price. The fares
 * are published on TMB's own Hola Barcelona site (holabarcelona.com, its
 * public price list) and match Turisme de Barcelona's shop to the cent:
 * 24 h 12,50 €, 48 h 18,70 €, 72 h 27,30 €, 96 h 35,60 €, 120 h 43,60 €.
 * Full prices; the online discount is not applied here.
 */

const TMB_FARES = "https://www.tmb.cat/ca/tarifes-metro-bus-barcelona";
const TMB_FARE_TABLE = "https://www.tmb.cat/en/barcelona-fares-metro-bus/transport-ticket-fares";

/* -------------------------------------------------------------------------- */
/* Dated fare tables (zones 1-7)                                              */
/* -------------------------------------------------------------------------- */

/** One zone's fares, in euros. */
export interface ZoneFares {
  single: number;
  tCasual: number;
  tDia: number;
  tUsual: number;
  tFamiliar: number;
  tGrup: number;
}

export const ZONE_KEYS = ["1", "2", "3", "4", "5", "6", "7"] as const;
export type ZoneKey = (typeof ZONE_KEYS)[number];

/**
 * One year's ATM fare table, as TMB/ATM publish it. A table is only added
 * here once the operator's own page lists it; the ATM board usually approves
 * the next year's fares in mid-December (2026's: ATM press release of 19 Dec
 * 2025, in force from 15 Jan 2026).
 */
export interface FareTable {
  year: number;
  /** ISO date the fares take effect, as the operator states it. */
  validFrom: string;
  zones: Record<ZoneKey, ZoneFares>;
  /** TMB's airport metro ticket (Aeroport T1/T2), one journey. */
  airportTicket: number;
  sourceUrl: string;
  /** The operator's own words dating the table. */
  quote: string;
  verifiedAt: string;
}

/**
 * 2026: TMB, "2026 transport ticket fares — Prices in force from 15 January
 * 2026", read 28 Oct, 30 Oct and 13 Nov 2026 (every cell unchanged). ATM's
 * T-casual page shows the same row and the ATM home page says "En vigor les
 * tarifes de 2026" (13 Nov 2026). The T-usual carries the 50 % discount of
 * Real Decreto-ley 17/2025, whose aid runs 1 Jan to 31 Dec 2026.
 */
export const FARES_2026: FareTable = {
  year: 2026,
  validFrom: "2026-01-15",
  zones: {
    "1": { single: 2.9, tCasual: 13.0, tDia: 12.0, tUsual: 22.8, tFamiliar: 11.5, tGrup: 91.0 },
    "2": { single: 4.15, tCasual: 25.5, tDia: 18.3, tUsual: 30.55, tFamiliar: 21.75, tGrup: 178.5 },
    "3": { single: 5.4, tCasual: 34.7, tDia: 22.95, tUsual: 42.7, tFamiliar: 30.8, tGrup: 242.9 },
    "4": { single: 6.9, tCasual: 44.65, tDia: 25.65, tUsual: 52.15, tFamiliar: 39.95, tGrup: 312.55 },
    "5": { single: 8.8, tCasual: 51.2, tDia: 28.7, tUsual: 59.6, tFamiliar: 45.65, tGrup: 358.4 },
    "6": { single: 10.25, tCasual: 54.45, tDia: 32.1, tUsual: 63.85, tFamiliar: 47.95, tGrup: 381.15 },
    "7": { single: 11.6, tCasual: 57.6, tDia: 34.7, tUsual: 67.65, tFamiliar: 49.7, tGrup: 403.2 },
  },
  airportTicket: 5.9,
  sourceUrl: TMB_FARE_TABLE,
  quote: "2026 transport ticket fares. Prices in force from 15 January 2026",
  verifiedAt: "2026-11-13",
};

/**
 * 2027: not published. On 13 Nov 2026 neither ATM (press room, latest note
 * 9 Nov 2026; home page "En vigor les tarifes de 2026") nor TMB lists 2027
 * fares, and the State aid of RDL 17/2025 covers "del 1 de enero al 31 de
 * diciembre de 2026", with no 2027 extension on the Ministry's news page.
 *
 * To publish 2027: fill this from the operator's page the day it is out,
 * point CURRENT_FARES at it (one line), move FARES_AS_OF, run the tests. The
 * drift test in tests/transport-fares.test.ts then lists every euro figure in
 * the transport prose that still carries a 2026 fare.
 */
export const FARES_2027: FareTable | null = null;

/** Every published table, oldest first. */
export const FARE_TABLES: FareTable[] = [FARES_2026, ...(FARES_2027 ? [FARES_2027] : [])];

/** The table the pages print. Point it at FARES_2027 only once that is official. */
export const CURRENT_FARES: FareTable = FARES_2026;

/** The table in force on a date, or null before the first one. */
export function fareTableFor(iso: string): FareTable | null {
  return [...FARE_TABLES].reverse().find((table) => table.validFrom <= iso) ?? null;
}

/**
 * Re-check calendar for the 2027 fares. ATM announced the 2026 discounts on
 * 16 Dec and approved the fares on 19 Dec 2025; they took effect on 15 Jan.
 * `FARES_AS_OF` is the last day ATM/TMB were read for a new table; the
 * date-guard test fails once a re-check date passes without a newer reading.
 */
export const FARES_AS_OF = "2026-11-13";
export const FARES_RECHECK = ["2026-12-16", "2027-01-15"] as const;

/** The latest re-check date that has passed since the last reading, or null. */
export function overdueFareRecheck(today: string, asOf: string = FARES_AS_OF): string | null {
  return FARES_RECHECK.filter((date) => date <= today && asOf < date).at(-1) ?? null;
}

const ZONE_1 = CURRENT_FARES.zones["1"];

const TMB_HOLA =
  "https://www.tmb.cat/en/barcelona-fares-metro-bus/tickets-visit-barcelona/barcelona-travel-card-hola-bcn";
const HOLA_PRICES = "https://www.holabarcelona.com/en";
const HOLA_VERIFIED_AT = "2026-10-12";

// 30 Oct and 13 Nov 2026: TMB's 2026 table re-read (single, T-casual, T-dia,
// T-usual, T-familiar, T-grup for zones 1-7 and the €5.90 airport ticket:
// unchanged). The zone-1 fares below are read from CURRENT_FARES.
export const VERIFIED_AT = CURRENT_FARES.verifiedAt;

export const TICKETS: Ticket[] = [
  {
    key: "senzill",
    name: "Bitllet senzill",
    validity: { kind: "single" },
    sharing: "shareable",
    airportIncluded: true,
    fares: [{ zone: "1", price: ZONE_1.single }],
    note: {
      ca: "Un sol trajecte. Només surt a compte si en faràs molt pocs.",
      es: "Un solo trayecto. Solo compensa si vas a hacer muy pocos.",
      en: "One journey. Only worth it if you will make very few.",
    },
    sourceUrl: TMB_FARES,
    verifiedAt: VERIFIED_AT,
  },
  {
    key: "t-casual",
    name: "T-casual",
    validity: { kind: "journeys", journeys: 10 },
    sharing: "personal",
    // The restriction is specific: the L9 Sud metro gates at T1 and T2.
    airportIncluded: false,
    fares: [{ zone: "1", price: ZONE_1.tCasual }],
    note: {
      ca: "Deu viatges, unipersonal. No és vàlid a les estacions de metro Aeroport T1 i T2 de l'L9 Sud.",
      es: "Diez viajes, unipersonal. No es válido en las estaciones de metro Aeroport T1 y T2 de L9 Sud.",
      en: "Ten journeys, single-user. Not valid at the Aeroport T1 and T2 metro stations on L9 Sud.",
    },
    sourceUrl: TMB_FARES,
    verifiedAt: VERIFIED_AT,
  },
  {
    key: "t-dia",
    name: "T-dia",
    validity: { kind: "days", days: 1 },
    sharing: "personal",
    airportIncluded: true,
    fares: [{ zone: "1", price: ZONE_1.tDia }],
    note: {
      ca: "Viatges il·limitats durant 24 hores des de la primera validació. Inclou un trajecte d'anada i un de tornada per l'Aeroport T1 i T2.",
      es: "Viajes ilimitados durante 24 horas desde la primera validación. Incluye un viaje de ida y otro de vuelta por Aeroport T1 y T2.",
      en: "Unlimited travel for 24 hours from first validation. Includes one outbound and one return journey through Aeroport T1 and T2.",
    },
    sourceUrl: TMB_FARES,
    verifiedAt: VERIFIED_AT,
  },
  {
    key: "t-usual",
    name: "T-usual",
    validity: { kind: "days", days: 30 },
    sharing: "personal",
    airportIncluded: true,
    fares: [{ zone: "1", price: ZONE_1.tUsual }],
    note: {
      ca: "Viatges il·limitats durant 30 dies consecutius. Personal i intransferible: cal portar el document identificatiu.",
      es: "Viajes ilimitados durante 30 días consecutivos. Personal e intransferible: hay que llevar el documento identificativo.",
      en: "Unlimited travel for 30 consecutive days. Personal and non-transferable: carry your ID document.",
    },
    sourceUrl: TMB_FARES,
    verifiedAt: VERIFIED_AT,
  },
  {
    key: "hola-barcelona",
    name: "Hola Barcelona Travel Card",
    validity: { kind: "pass", maxDays: 5 },
    sharing: "personal",
    airportIncluded: true,
    fares: [
      { zone: "1", days: 1, price: 12.5 },
      { zone: "1", days: 2, price: 18.7 },
      { zone: "1", days: 3, price: 27.3 },
      { zone: "1", days: 4, price: 35.6 },
      { zone: "1", days: 5, price: 43.6 },
    ],
    note: {
      ca: "Viatges il·limitats durant 24, 48, 72, 96 o 120 hores consecutives. Inclou metro i bus de TMB, NitBus, funicular de Montjuïc, FGC zona 1, tramvia i Rodalies zona 1, i l'anada i tornada en metro amb l'aeroport. El Telefèric de Montjuïc no hi està inclòs.",
      es: "Viajes ilimitados durante 24, 48, 72, 96 o 120 horas consecutivas. Incluye metro y bus de TMB, NitBus, funicular de Montjuïc, FGC zona 1, tranvía y Rodalies zona 1, y el viaje de ida y vuelta en metro con el aeropuerto. El Teleférico de Montjuïc no está incluido.",
      en: "Unlimited travel for 24, 48, 72, 96 or 120 consecutive hours. Covers TMB metro and buses, NitBus, the Montjuïc funicular, FGC zone 1, the tram and Rodalies zone 1, plus one outbound and one return airport metro journey. The Montjuïc Cable Car is not included.",
    },
    sourceUrl: HOLA_PRICES,
    verifiedAt: HOLA_VERIFIED_AT,
  },
];

export const SOURCES = [
  {
    name: "Tarifes de metro i bus de Barcelona",
    url: TMB_FARES,
    publisher: "Transports Metropolitans de Barcelona",
  },
  {
    name: "Hola Barcelona Travel Card",
    url: TMB_HOLA,
    publisher: "Transports Metropolitans de Barcelona",
  },
  {
    name: "Hola Barcelona — prices",
    url: HOLA_PRICES,
    publisher: "Transports Metropolitans de Barcelona",
  },
];

/* -------------------------------------------------------------------------- */
/* Comparison                                                                 */
/* -------------------------------------------------------------------------- */

export interface Priced {
  ticket: Ticket;
  /** Total for the whole party, or null when it cannot be priced. */
  total: number | null;
  /** How many of this ticket the trip needs, per traveller. */
  unitsPerTraveller: number | null;
  /** Set when the ticket does not fit the trip at all. */
  blocked?: "airport" | "no-fare" | "too-long";
}

export function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function fareFor(ticket: Ticket, zone: string): number | null {
  return ticket.fares.find((fare) => fare.zone === zone)?.price ?? null;
}

/**
 * Prices every ticket for a trip.
 *
 * Journeys are counted per traveller because every fare here except the single
 * ticket is personal: four people cannot share one T-casual, and a comparison
 * that divides a ten-journey ticket between them would be wrong in the
 * direction that costs the reader money at a barrier.
 *
 * A ticket that does not fit comes back with `total: null` and a reason. It is
 * never quietly dropped, because "the cheapest option" that happens to be
 * unusable at the airport is exactly the error this page exists to prevent.
 */
export function compareTickets(profile: TripProfile): Priced[] {
  const days = Math.max(1, Math.floor(profile.days));
  const perDay = Math.max(0, Math.floor(profile.journeysPerDay));
  const travellers = Math.max(1, Math.floor(profile.travellers));
  const journeys = days * perDay;

  return TICKETS.map((ticket): Priced => {
    const fare = fareFor(ticket, profile.zone);

    if (ticket.fares.length === 0) {
      return { ticket, total: null, unitsPerTraveller: null, blocked: "no-fare" };
    }
    if (fare === null) {
      return { ticket, total: null, unitsPerTraveller: null, blocked: "no-fare" };
    }
    if (profile.usesAirport && ticket.airportIncluded === false) {
      return { ticket, total: null, unitsPerTraveller: null, blocked: "airport" };
    }

    if (ticket.validity.kind === "single") {
      return {
        ticket,
        unitsPerTraveller: journeys,
        total: round(fare * journeys * travellers),
      };
    }

    if (ticket.validity.kind === "pass") {
      // The shortest length that covers the stay; past the longest, say so
      // rather than chain passes into a price nobody would actually pay.
      const pass = ticket.fares
        .filter((item) => item.zone === profile.zone && (item.days ?? 0) >= days)
        .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))[0];
      if (!pass) return { ticket, total: null, unitsPerTraveller: null, blocked: "too-long" };
      return { ticket, unitsPerTraveller: 1, total: round(pass.price * travellers) };
    }

    if (ticket.validity.kind === "journeys") {
      const units = Math.ceil(journeys / ticket.validity.journeys);
      return { ticket, unitsPerTraveller: units, total: round(fare * units * travellers) };
    }

    // Time-based. A T-dia covers one day; a T-usual covers thirty.
    if (ticket.validity.days >= days) {
      return { ticket, unitsPerTraveller: 1, total: round(fare * travellers) };
    }
    const units = Math.ceil(days / ticket.validity.days);
    return { ticket, unitsPerTraveller: units, total: round(fare * units * travellers) };
  });
}

/** Cheapest priced option, or null when nothing can be priced. */
export function cheapest(priced: Priced[]): Priced | null {
  const usable = priced.filter((item) => item.total !== null);
  if (usable.length === 0) return null;
  return usable.reduce((best, item) => ((item.total ?? 0) < (best.total ?? 0) ? item : best));
}

export const TICKET_NOTE = (ticket: Ticket, locale: Locale): string => ticket.note[locale];
