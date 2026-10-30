import { EN_LARGEST, englishSelection } from "@/lib/programmatic/elections/english";

import { SNAPSHOT } from "./data";
import { slugify } from "./slug";
import type { HolidaySnapshot, SnapshotMunicipality } from "./types";

/**
 * Which towns have an English page (`/en/holidays/<slug>/`): the elections
 * family's English selection (`englishSelection`, the 11 largest and the 19
 * resorts), applied here to every municipality of Catalonia by population,
 * the councils the order gives no days included, so the 11 largest are the
 * same 11 both families count.
 *
 * A selected town the order gives no local days to ("proposta no formulada":
 * Malgrat de Mar in 2026) has no page in any language; the English hub names
 * it and says why.
 */

interface Candidate {
  slug: string;
  name: string;
  population: number;
  page: SnapshotMunicipality | null;
}

const BY_POPULATION: Candidate[] = [
  ...SNAPSHOT.municipalities.map((m) => ({ slug: m.slug, name: m.name, population: m.population, page: m })),
  ...SNAPSHOT.excluded.map((e) => ({ slug: slugify(e.name), name: e.name, population: e.population, page: null })),
].sort((a, b) => b.population - a.population || a.slug.localeCompare(b.slug));

const SELECTION = englishSelection(BY_POPULATION);

/** The English towns with a page, largest first. */
const TOWNS: SnapshotMunicipality[] = SELECTION.flatMap((c) => (c.page ? [c.page] : []));
const SLUGS = new Set(TOWNS.map((m) => m.slug));

export function englishTowns(): SnapshotMunicipality[] {
  return TOWNS;
}

export function hasEnglishPage(slug: string): boolean {
  return SLUGS.has(slug);
}

export function englishTownBySlug(slug: string): SnapshotMunicipality | null {
  return SLUGS.has(slug) ? (TOWNS.find((m) => m.slug === slug) ?? null) : null;
}

/** Every slug the selection names, page or not (the test compares it with the elections family's). */
export function englishSelectionSlugs(): string[] {
  return SELECTION.map((c) => c.slug);
}

/** Selected towns without local days in the order, so without a page. */
export function englishWithoutDays(): HolidaySnapshot["excluded"] {
  const excluded = new Set(SELECTION.filter((c) => !c.page).map((c) => c.slug));
  return SNAPSHOT.excluded.filter((e) => excluded.has(slugify(e.name)));
}

const LARGEST = new Set(BY_POPULATION.slice(0, EN_LARGEST).map((c) => c.slug));

/** One of the `EN_LARGEST` most populous; the other English towns are the resorts. */
export function isLargestTown(m: Pick<SnapshotMunicipality, "slug">): boolean {
  return LARGEST.has(m.slug);
}
