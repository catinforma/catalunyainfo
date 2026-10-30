/**
 * The English selection of towns: where English-speaking readers are.
 *
 * The 11 most populous municipalities (the four provincial capitals among
 * them), then the 19 with the most places in the Registre de Turisme de
 * Catalunya (dataset `t2h3-cgys`: hotels, campsites, rural tourism, tourist
 * flats and homes), read 29 Oct 2026 with `scripts/elections-snapshot.ts
 * --tourism`. Fixed here, not recomputed: the register changes daily and URLs
 * must not come and go with it.
 *
 * Defined once for every family with per-town pages in English (elections
 * since 29 Oct 2026, holidays since 30 Oct 2026), and kept apart from both
 * snapshots so either family can apply it without loading the other's data.
 */

export const EN_LARGEST = 11;

export const EN_RESORTS: readonly string[] = [
  "salou",
  "lloret-de-mar",
  "castell-d-aro-platja-d-aro-i-s-agaro",
  "torroella-de-montgri",
  "cambrils",
  "blanes",
  "tossa-de-mar",
  "calella",
  "sitges",
  "castello-d-empuries",
  "santa-susanna",
  "mont-roig-del-camp",
  "calonge-i-sant-antoni",
  "roses",
  "malgrat-de-mar",
  "vila-seca",
  "l-ametlla-de-mar",
  "pineda-de-mar",
  "l-escala",
];

/** Where the English set's resorts come from (see `EN_RESORTS`). */
export const TOURISM_REGISTER = {
  name: "Establiments d'allotjament turístic inscrits al Registre de Turisme de Catalunya",
  publisher: "Generalitat de Catalunya, Departament d'Empresa i Treball",
  url: "https://analisi.transparenciacatalunya.cat/d/t2h3-cgys",
};

/**
 * The selection out of a list of municipalities ordered largest first: its
 * first `EN_LARGEST` plus `EN_RESORTS`, in the list's order. The head of the
 * list must have no gaps (the elections family passes the 300 most populous;
 * the holiday family adds the councils it has no page for), or a missing
 * large town would pull the twelfth one in.
 */
export function englishSelection<T extends { slug: string }>(byPopulation: readonly T[]): T[] {
  const chosen = new Set([...byPopulation.slice(0, EN_LARGEST).map((m) => m.slug), ...EN_RESORTS]);
  return byPopulation.filter((m) => chosen.has(m.slug));
}
