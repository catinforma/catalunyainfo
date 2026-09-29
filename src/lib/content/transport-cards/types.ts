import type { Locale } from "@/lib/i18n/config";

/**
 * Barcelona transport tickets: the shape of the comparison, with no figures in
 * it.
 *
 * T-casual against T-dia against the Hola Barcelona travel card is a question
 * with a numeric answer that depends on four things — how many journeys, over
 * how many days, in which fare zones, and whether the airport is involved —
 * and every published comparison of it that we could find gets at least one of
 * those wrong, usually the airport surcharge.
 *
 * So the model exists before the content does, and it is built the same way as
 * `tourist-tax/rates.ts`, for the same reason: the tables and the selector
 * both read one source, no figure is typed twice, and a fare rise is a one-line
 * edit that reaches three languages.
 *
 * **There are deliberately no fares in this file.** Fares change on 1 January,
 * they come from ATM's own tariff publication, and inventing a plausible one
 * to make the types compile would be exactly the failure this whole project is
 * organised against. The editorial package supplies them, verified, with the
 * source URL and the date they were checked.
 *
 * Two things the model makes structurally impossible:
 *
 *  - A ticket without a `validity` cannot exist, so a comparison cannot
 *    silently put a journey-count ticket and a time-limited one in the same
 *    column without saying which is which. That is the single most common
 *    error in the published comparisons.
 *  - A fare without `sourceUrl` and `verifiedAt` cannot exist.
 */

/** What you are actually buying. The distinction the comparisons get wrong. */
export type Validity =
  /** A fixed number of journeys, used up whenever you like. */
  | { kind: "journeys"; journeys: number }
  /** Unlimited travel for a number of consecutive days. */
  | { kind: "days"; days: number }
  /** One journey. */
  | { kind: "single" };

/** Whether a ticket may be shared between travellers on the same trip. */
export type Sharing = "personal" | "shareable";

export interface TicketFare {
  /** Fare zones the price covers, as ATM labels them: "1", "1-2", … */
  zone: string;
  /** Price in euros. Supplied by the editorial package, never inferred. */
  price: number;
}

export interface Ticket {
  key: string;
  /** Commercial name, identical in all three languages. */
  name: string;
  validity: Validity;
  sharing: Sharing;
  /**
   * Whether the airport metro stations are included at no extra charge.
   *
   * Tri-state on purpose: `null` means we have not verified it for this
   * ticket, and the renderer must say so rather than printing "no".
   */
  airportIncluded: boolean | null;
  fares: TicketFare[];
  /** Short note per locale: who it suits, and the catch. */
  note: Record<Locale, string>;
  sourceUrl: string;
  /** ISO date this ticket's fares were last checked against the source. */
  verifiedAt: string;
}

/**
 * A traveller's situation, which is what the selector asks for.
 *
 * Deliberately the four inputs that change the answer and no others: adding a
 * fifth would imply a precision the fare table does not have.
 */
export interface TripProfile {
  /** Journeys per day, one way. */
  journeysPerDay: number;
  days: number;
  zone: string;
  /** Whether an airport metro trip is part of it. */
  usesAirport: boolean;
  /** People travelling together, for the shareable tickets. */
  travellers: number;
}

export interface TicketOutcome {
  ticket: Ticket;
  /** Null when no verified fare covers the requested zone. */
  total: number | null;
  /** How many of that ticket the trip needs. */
  unitsNeeded: number | null;
  /** Why it cannot be priced, when it cannot. */
  unavailableReason?: string;
}

/**
 * The verified fares live in `rates.ts`, alongside the comparison arithmetic.
 * This file stays the model alone, so the shape can be reasoned about without
 * scrolling past a fare table.
 */
