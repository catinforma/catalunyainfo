import { ANDALUCIA, CATALUNA, CEUTA, MADRID, MELILLA, VALENCIA } from "./data/built";
import { ARAGON, ASTURIAS, BALEARES, CANARIAS, CANTABRIA, CASTILLA_LA_MANCHA, CASTILLA_Y_LEON, EXTREMADURA, GALICIA, LA_RIOJA, MURCIA } from "./data/common";
import { ALAVA, BIZKAIA, GIPUZKOA, NAVARRA } from "./data/foral";
import { exampleResult, type ExampleResult } from "./engine";
import type { Territory, TerritoryId } from "./types";

/**
 * Every territory of the comparison, in the order the tables print them: the
 * fifteen common-regime communities (INE order, Valencia by its Spanish
 * name), Ceuta and Melilla, then the four foral territories.
 */
export const TERRITORIES: readonly Territory[] = [
  ANDALUCIA,
  ARAGON,
  ASTURIAS,
  BALEARES,
  CANARIAS,
  CANTABRIA,
  CASTILLA_LA_MANCHA,
  CASTILLA_Y_LEON,
  CATALUNA,
  VALENCIA,
  EXTREMADURA,
  GALICIA,
  MADRID,
  MURCIA,
  LA_RIOJA,
  CEUTA,
  MELILLA,
  ALAVA,
  BIZKAIA,
  GIPUZKOA,
  NAVARRA,
];

export const TERRITORY_IDS: readonly TerritoryId[] = TERRITORIES.map((t) => t.id);

export function territory(id: TerritoryId): Territory {
  const t = TERRITORIES.find((x) => x.id === id);
  if (!t) throw new Error(`inheritance-compare: no territory ${id}`);
  return t;
}

export interface ExampleRow {
  territory: Territory;
  /** Null when a rule the example needs is pending. */
  result: ExampleResult | null;
}

/** The worked example in every territory, cheapest first (table order on a tie); the pending ones last, in table order. */
export function exampleRows(): ExampleRow[] {
  const rows = TERRITORIES.map((t) => ({ territory: t, result: exampleResult(t.example) }));
  const done = rows.filter((r) => r.result).sort((a, b) => a.result!.toPay - b.result!.toPay || TERRITORIES.indexOf(a.territory) - TERRITORIES.indexOf(b.territory));
  return [...done, ...rows.filter((r) => !r.result)];
}
