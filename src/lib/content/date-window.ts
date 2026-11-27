import { parseBody, type Block, type Body } from "@/lib/content/blocks";

type DateWindow = Extract<Block, { type: "dateWindow" }>;

/** True while `now` is inside the window: from `from` (inclusive) until `until` (exclusive). */
export function windowOpen(block: Pick<DateWindow, "from" | "until">, now: Date = new Date()): boolean {
  const t = now.getTime();
  return t >= Date.parse(block.from) && t < Date.parse(block.until);
}

/**
 * The body as it reads at `now` (27 Nov 2026): every `dateWindow` block
 * replaced by the blocks of its `on` variant inside the window, by its `off`
 * variant (or nothing) outside it. See `dateWindowBlock` in blocks.ts.
 */
export function resolveDateWindows(body: Body, now: Date = new Date()): Body {
  if (!body.some((block) => block.type === "dateWindow")) return body;
  const out: Block[] = [];
  for (const block of body) {
    if (block.type !== "dateWindow") {
      out.push(block);
      continue;
    }
    out.push(...parseBody(windowOpen(block, now) ? block.on : (block.off ?? [])));
  }
  return out;
}
