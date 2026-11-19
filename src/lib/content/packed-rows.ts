/**
 * Compact rows for the big place tables (components/blocks/PlaceRows.tsx):
 * repeated labels are stored once in a `days` list and rows point at them by
 * index, so a 1,400-row table costs the RSC payload ~30 bytes a row instead
 * of ~200 as server-rendered elements. Pure, no React (tests/rsc-payload.test.ts
 * checks the rendered HTML still holds every row).
 */

/** [name, 1 if a nucleus with its own days, ...indexes of its day labels]. */
export type LocalHolidayRow = [name: string, isNucleus: 0 | 1, ...days: number[]];

/** [town, index of its opening days, index of the days it swapped out (absent if none)]. */
export type ShopRow = [town: string, open: number, swapped?: number];

/** A list of distinct strings and the index of each, in first-seen order. */
export class LabelList {
  readonly labels: string[] = [];
  private readonly index = new Map<string, number>();

  of(label: string): number {
    let i = this.index.get(label);
    if (i === undefined) {
      i = this.labels.length;
      this.labels.push(label);
      this.index.set(label, i);
    }
    return i;
  }
}
