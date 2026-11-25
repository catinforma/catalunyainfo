import { parseBody, type Block, type Body } from "@/lib/content/blocks";
import { electionPhase, electionPhaseStart, type ElectionDayPhase } from "@/lib/programmatic/elections/election-day";

/**
 * Which variant of an `electionPhased` block a phase of the election-day layer
 * (programmatic/elections/election-day.ts) reads.
 *
 *   before, eve, polling, count   pre    the page as it was written
 *   after (30 Nov - 7 Dec)        after
 *   over (from 8 Dec)             over, else after
 *
 * "count" (29 Nov from 20:00) deliberately reads `pre`: these pages are only
 * re-rendered at 00:05, so a variant written for the evening would still be
 * printed at 23:00 and the next morning's first visitors.
 */
export function electionVariant(phase: ElectionDayPhase): "pre" | "after" | "over" {
  if (phase === "after") return "after";
  if (phase === "over") return "over";
  return "pre";
}

/**
 * Thu 26 Nov 2026, 14:00 Madrid (CET, UTC+1): the last moment to hand the postal vote in at Correos
 * (JEC Acuerdo 418/2026; Correos: "hasta el 26 de noviembre de 2026 a las 14:00h"). A block with a
 * `handin` variant reads it from here until the `after` phase starts; blocks without one read `pre`
 * as before. The pages are ISR: the text changes on the first render after this instant, so the
 * page must be re-rendered (publish `vot-correu`) once it has passed; the nightly 00:05 pass would
 * only do it for 27 Nov.
 */
export const HANDIN_CLOSES = new Date("2026-11-26T14:00:00+01:00");

/**
 * Thu 26 Nov 2026, 08:00 Madrid: 72 hours before the tables are set up (LOREG art. 27.4: an impediment is reported "al
 * menos setenta y dos horas antes del acto"; later, "de manera inmediata y, en todo caso, antes de la hora de
 * constitución de la mesa"). A block with a `late` variant reads it from here. Equal to MESA_72H in mesa-duty.ts
 * (a test holds both; this file must not import that one, it carries the 947-town JEZ file).
 */
export const MESA_NOTICE_CLOSES = new Date("2026-11-26T08:00:00+01:00");

/** Sun 29 Nov 2026, 08:00 Madrid: the tables are set up (LOREG art. 80.1). A block with a `held` variant reads it from here until `after`. Equal to MESA_HELD_FROM. */
export const MESA_TABLES_SET = new Date("2026-11-29T08:00:00+01:00");

/**
 * Which variant of a block a render at `now` reads: from the pre-vote phases, the latest of `late` (26 Nov 08:00),
 * `handin` (26 Nov 14:00) and `held` (29 Nov 08:00) that has passed and that the block has, else `pre`.
 */
function preVariant(block: Extract<Block, { type: "electionPhased" }>, now: Date): typeof block.pre {
  const t = now.getTime();
  if (block.held && t >= MESA_TABLES_SET.getTime()) return block.held;
  if (block.handin && t >= HANDIN_CLOSES.getTime()) return block.handin;
  if (block.late && t >= MESA_NOTICE_CLOSES.getTime()) return block.late;
  return block.pre;
}

/** The body as it reads at `now`: every `electionPhased` block replaced by the blocks of its variant. */
export function resolveElectionPhased(body: Body, now: Date = new Date()): Body {
  if (!body.some((block) => block.type === "electionPhased")) return body;
  const variant = electionVariant(electionPhase(now));
  const out: Block[] = [];
  for (const block of body) {
    if (block.type !== "electionPhased") {
      out.push(block);
      continue;
    }
    const picked = variant === "over" ? (block.over ?? block.after) : variant === "pre" ? preVariant(block, now) : block.after;
    out.push(...parseBody(picked));
  }
  return out;
}

/**
 * When the text of a page with an `electionPhased` block last changed because of the date: the start of the
 * `after` phase (30 Nov 00:00 Madrid) or of `over` (8 Dec 00:00), and null before. The eve, polling-day and
 * count starts of the election-day layer change nothing on these pages (they read `pre` until 30 Nov), so
 * the sitemap must not date them then.
 */
export function guidePhaseStart(now: Date = new Date()): Date | null {
  return electionVariant(electionPhase(now)) === "pre" ? null : electionPhaseStart(now);
}
