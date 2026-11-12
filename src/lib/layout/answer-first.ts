import type { Block } from "@/lib/content/blocks";
import { READ_NEXT, VERIFIED_LABEL } from "@/lib/content/batch02/shared";
import { NEXT_DATES_ID, OTHER_CITIES_TITLE } from "@/lib/content/batch02/strike-11n";
import type { Locale } from "@/lib/i18n/config";

/**
 * The answer-first article layout (12 Nov 2026, owner-approved; benchmark in
 * research_notes/x10/composition-benchmark-nov2026.md, logged in
 * docs/SEO_EXPERIMENTS.md).
 *
 * On these pages the template (components/pages/EntryArticle.tsx) shows, in
 * this order: title, byline + date + share, a summary of the page's own
 * "at a glance" facts (or its lead when it has none), the photo, then the
 * body. The boxes that used to sit between the answer and the first section
 * ("Próximas huelgas y fechas", the "Última verificación" note, "Lee también",
 * the other-cities box) move to the end of the body. Nothing is rewritten or
 * dropped: blocks are only reordered, and facts beyond the first few are
 * collapsed in a <details>.
 *
 * The reorder happens at render time from the stored body, so turning a page
 * on or off needs a deploy only, never a republish.
 *
 * THE SWITCH: add entry keys (or key prefixes for a family) below. Measure the
 * first group for 7 days (review 19 Nov 2026) before extending it.
 */
export const ANSWER_FIRST_ENTRY_KEYS: readonly string[] = [
  // Strikes
  "guide-general-strike-11-november-2026", // strike-11n (ca/es/en)
  "guide-general-strike-11-november-2026-spain", // the Spain-wide 11N page
  "guide-strikes-catalonia-today", // strikes hub (Catalonia)
  "guide-strikes-spain", // strikes hub (Spain)
  "guide-strike-renfe-november-2026", // Renfe / rail strike guide
  // Holidays
  "guide-public-holidays-catalonia", // calendari laboral (2027 work calendar)
  "guide-is-today-a-holiday-catalonia", // és festiu avui
  "guide-bridges-2027-catalonia", // ponts 2027
  "guide-december-bridge-catalonia", // pont de desembre 2026
  "guide-december-bridge-spain", // puente de diciembre 2026 en España
];

/** Families switched on by key prefix: the 11N city pages (…-2026-sevilla, -madrid, …). */
export const ANSWER_FIRST_KEY_PREFIXES: readonly string[] = ["guide-general-strike-11-november-2026-"];

export function answerFirstEnabled(key: string | null | undefined): boolean {
  if (!key) return false;
  return ANSWER_FIRST_ENTRY_KEYS.includes(key) || ANSWER_FIRST_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export type KeyFactItem = { label: string; value: string; sourceId?: string };

export type AnswerSummary =
  | { kind: "keyFacts"; title: string | null; shown: KeyFactItem[]; more: KeyFactItem[] }
  | { kind: "lead"; block: Block };

export interface AnswerFirstLayout {
  summary: AnswerSummary | null;
  /** The body without the summary and without the boxes moved to the end. */
  body: Block[];
  /** The moved boxes, in their original order, for after the body. */
  end: Block[];
}

/** "Más datos (4)": the collapsed rest of the facts. */
export const MORE_FACTS_LABEL: Record<Locale, (n: number) => string> = {
  ca: (n) => `Més dades (${n})`,
  es: (n) => `Más datos (${n})`,
  en: (n) => `More facts (${n})`,
};

/** Bullets in the summary: 3 to 5, as many as fit about 360 characters of text. */
const MIN_SHOWN = 3;
const MAX_SHOWN = 5;
const CHAR_BUDGET = 360;

export function splitFacts(items: KeyFactItem[]): { shown: KeyFactItem[]; more: KeyFactItem[] } {
  let used = 0;
  let n = 0;
  for (const item of items) {
    const size = item.label.length + item.value.length;
    if (n >= MAX_SHOWN || (n >= MIN_SHOWN && used + size > CHAR_BUDGET)) break;
    used += size;
    n += 1;
  }
  return { shown: items.slice(0, n), more: items.slice(n) };
}

function isHeading(block: Block, level?: number): block is Extract<Block, { type: "heading" }> {
  return block.type === "heading" && (level === undefined || block.level === level);
}

function calloutTitle(block: Block): string | null {
  return block.type === "callout" ? (block.title ?? "") : null;
}

/** Boxes that support the page but do not answer it (QRG §5.2.2: "shown lower on the page"). */
function isMovableBox(block: Block, locale: Locale): boolean {
  const title = calloutTitle(block);
  if (title === null) return false;
  if (title.startsWith(VERIFIED_LABEL[locale])) return true; // "Última verificación…" (the chip stays by the byline)
  if (title === OTHER_CITIES_TITLE) return true; // "En otras ciudades" (11N, es)
  return false;
}

function isReadNext(block: Block, locale: Locale): boolean {
  return block.type === "callout" && block.tone === "tip" && block.title === READ_NEXT[locale];
}

function isNextDatesHeading(block: Block, locale: Locale): boolean {
  return isHeading(block, 2) && block.id === NEXT_DATES_ID[locale];
}

/**
 * Splits a stored body into summary, body and end. Pure; tests/answer-first.test.ts.
 *
 * - The "preamble" is everything before the first H2 that stays in place.
 * - Summary: the first keyFacts block of the preamble; without one, the lead
 *   paragraph when it opens the body.
 * - Moved to the end: "Próximas huelgas y fechas" (its H2 and the list after
 *   it) and the verification / other-cities callouts of the preamble, and the
 *   "Lee también" box wherever it is.
 */
export function answerFirstLayout(body: readonly Block[], locale: Locale): AnswerFirstLayout {
  const end: Block[] = [];
  const kept: Block[] = [];
  let inPreamble = true;

  for (let i = 0; i < body.length; i += 1) {
    const block = body[i]!;
    if (isNextDatesHeading(block, locale)) {
      end.push(block);
      const next = body[i + 1];
      if (next && next.type === "list") {
        end.push(next);
        i += 1;
      }
      continue;
    }
    if (isReadNext(block, locale)) {
      end.push(block);
      continue;
    }
    if (isHeading(block, 2)) inPreamble = false;
    if (inPreamble && isMovableBox(block, locale)) {
      end.push(block);
      continue;
    }
    kept.push(block);
  }

  const firstH2 = kept.findIndex((block) => isHeading(block, 2));
  const preambleEnd = firstH2 < 0 ? kept.length : firstH2;
  const factsAt = kept.slice(0, preambleEnd).findIndex((block) => block.type === "keyFacts");

  let summary: AnswerSummary | null = null;
  if (factsAt >= 0) {
    const facts = kept[factsAt] as Extract<Block, { type: "keyFacts" }>;
    const { shown, more } = splitFacts(facts.items);
    summary = { kind: "keyFacts", title: facts.title ?? null, shown, more };
    kept.splice(factsAt, 1);
  } else if (kept[0]?.type === "paragraph" && kept[0].lead) {
    summary = { kind: "lead", block: kept[0] };
    kept.splice(0, 1);
  }

  return { summary, body: kept, end };
}
