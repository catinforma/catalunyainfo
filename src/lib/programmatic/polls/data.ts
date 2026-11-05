import "server-only";

import { POLLS, POLLS_CHECKED_ON } from "./figures";
import type { Poll } from "./types";
import { BLACKOUT_END, BLACKOUT_START, isPollBlackout } from "./window";

/**
 * The single gate between the poll figures and anything rendered.
 *
 * `figures.ts` is imported here and nowhere else in `src/` (a test scans
 * every module), and this module exports nothing but this function, so a
 * figure can only reach the HTML, the RSC payload, metadata or JSON-LD
 * through `pollsPageData(now)`. Inside the LOREG 69.7 window it returns an
 * object with no poll in it at all (not a flag the view could ignore), and an
 * invalid clock counts as inside (`isPollBlackout` fails closed).
 *
 * The caller passes the request-time clock: the page reads it after
 * `await connection()`, in a route that is `force-dynamic`.
 */
export type PollsPageData =
  | { state: "blackout"; returnsAt: string }
  | { state: "open"; polls: readonly Poll[]; checkedOn: string; blackoutStartsAt: string };

export function pollsPageData(now: Date): PollsPageData {
  if (isPollBlackout(now)) return { state: "blackout", returnsAt: BLACKOUT_END.toISOString() };
  return { state: "open", polls: POLLS, checkedOn: POLLS_CHECKED_ON, blackoutStartsAt: BLACKOUT_START.toISOString() };
}
