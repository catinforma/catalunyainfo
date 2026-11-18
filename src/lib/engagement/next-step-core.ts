import { B2_TITLES, b2href, type B2Key } from "@/lib/content/batch02/shared";
import type { Locale } from "@/lib/i18n/config";

/**
 * The "next useful step" box's shape and its one rule (dedupe, never the page
 * itself, at most NEXT_STEP_MAX_LINKS). Data-free, so the calculators and the
 * town pages use it without loading the strike and election modules that
 * next-step.ts reads. The families and the why are in next-step.ts.
 */

export type NextStepFamily = "strikes" | "elections" | "holidays" | "christmas" | "calculators" | "barcelona";

export interface NextStepLink {
  href: string;
  label: string;
  /** A short line under the link (the day of a strike whose title has none; a calculator's question). */
  note?: string;
}

export interface NextStep {
  family: NextStepFamily;
  links: NextStepLink[];
}

export const NEXT_STEP_MAX_LINKS = 3;

export const NEXT_STEP_TITLE: Record<Locale, string> = {
  ca: "Següent pas útil",
  es: "Siguiente paso útil",
  en: "Next useful step",
};

/** The path without the hash, for "is this the page itself?" and "is this link twice?". */
export const pathOnly = (href: string): string => href.split("#")[0]!;

/** Drops the page itself and repeats, keeps the first `max` (2 unless a family says 3); null when nothing is left. */
export function nextStep(family: NextStepFamily, links: (NextStepLink | null | undefined)[], self: string, max = 2): NextStep | null {
  const seen = new Set<string>([pathOnly(self)]);
  const kept: NextStepLink[] = [];
  for (const link of links) {
    if (!link) continue;
    const path = pathOnly(link.href);
    if (seen.has(path)) continue;
    seen.add(path);
    kept.push(link);
    if (kept.length >= Math.min(max, NEXT_STEP_MAX_LINKS)) break;
  }
  return kept.length > 0 ? { family, links: kept } : null;
}

/** A guide of the registry, under its own title. */
export const b2Step = (key: B2Key, locale: Locale): NextStepLink => ({ href: b2href(key, locale), label: B2_TITLES[key][locale] });
