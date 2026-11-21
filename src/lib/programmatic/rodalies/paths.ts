import type { Locale } from "@/lib/i18n/config";

import { LINE_IDS, type LineId } from "./types";

/**
 * URLs of the Rodalies family. Kept apart from the snapshot so that the guides
 * linking here do not pull the data into their bundle.
 *
 *   /ca/rodalies/            hub (ca, es, en)
 *   /ca/rodalies/r2-sud/     one line (ca, es, en)
 *
 * One folder, `app/(public)/[locale]/rodalies`, serves the three languages:
 * the segment is the same word in all of them. Until 21 Nov 2026 a line page
 * answered ca and es only (the English edition was the hub); with the
 * timetable summary every line page exists in the three languages (owner
 * rule: every page in ca, es and en). The `[...slug]` catch-all never sees these.
 */

export const SEGMENT = "rodalies";

export type LineLocale = Locale;
export const LINE_LOCALES: readonly LineLocale[] = ["ca", "es", "en"];
export const HUB_LOCALES: readonly Locale[] = ["ca", "es", "en"];

export function isLineLocale(value: string): value is LineLocale {
  return (LINE_LOCALES as readonly string[]).includes(value);
}

/** "r2-nord", "r2-sud", "rg1", "r11"… */
export function lineSlug(id: LineId): string {
  if (id === "R2N") return "r2-nord";
  if (id === "R2S") return "r2-sud";
  return id.toLowerCase();
}

export function lineFromSlug(slug: string): LineId | null {
  return LINE_IDS.find((id) => lineSlug(id) === slug) ?? null;
}

export const hubPath = (locale: Locale): string => `/${locale}/${SEGMENT}/`;

export const linePath = (locale: LineLocale, id: LineId): string => `/${locale}/${SEGMENT}/${lineSlug(id)}/`;

export function hubTranslations(): Record<Locale, string> {
  return { ca: hubPath("ca"), es: hubPath("es"), en: hubPath("en") };
}

export function lineTranslations(id: LineId): Record<LineLocale, string> {
  return { ca: linePath("ca", id), es: linePath("es", id), en: linePath("en", id) };
}
