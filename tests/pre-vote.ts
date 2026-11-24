import { parseBody, type Block } from "../src/lib/content/blocks.ts";
import { resolveElectionPhased } from "../src/lib/content/election-phased.ts";

/**
 * The 29N guides as they read before the vote (24 Nov 2026): the election-night,
 * Congress-results and how-to-vote guides store `electionPhased` blocks, and the
 * tests written for the pre-vote wording read them through here, at a fixed day
 * before polling day, so they do not move when the calendar does. The tests of
 * the wording from 30 Nov are in election-guides-after.test.ts.
 */
export const PRE_VOTE_DAY = new Date("2026-11-24T12:00:00Z");

export function preVote(blocks: unknown[]): Block[] {
  return resolveElectionPhased(parseBody(blocks), PRE_VOTE_DAY);
}
