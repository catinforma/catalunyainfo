"use client";

import { useState } from "react";

/**
 * The worked-example table of the inheritance tax comparison, sortable by
 * territory or by tax to pay. The server renders it in its default order
 * (cheapest first, the territories without every rule last), so the table is
 * complete without JavaScript; the buttons only reorder the rows. Rows arrive
 * as plain strings plus the numbers to sort by.
 */

export interface ExampleTableRow {
  id: string;
  name: string;
  /** Sort keys: the tax to pay (null: not computed, always last) and the table order. */
  toPay: number | null;
  order: number;
  /** Rendered cells after the name, already formatted. */
  cells: string[];
  /** A link for the name (the territory's own calculator), if any. */
  href?: string;
}

type Sort = "pay-asc" | "pay-desc" | "name";

export function SortableExample({ cols, rows, labels }: { cols: readonly string[]; rows: readonly ExampleTableRow[]; labels: { sortBy: string; cheapest: string; dearest: string; byName: string } }) {
  const [sort, setSort] = useState<Sort>("pay-asc");
  const sorted = [...rows].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "es");
    if (a.toPay === null || b.toPay === null) return a.toPay === null ? (b.toPay === null ? a.order - b.order : 1) : -1;
    return sort === "pay-asc" ? a.toPay - b.toPay || a.order - b.order : b.toPay - a.toPay || a.order - b.order;
  });
  const button = (s: Sort, text: string) => (
    <button type="button" className={`ci-btn ${sort === s ? "ci-btn-primary" : "ci-btn-quiet"} !px-3 !py-1.5 text-sm`} aria-pressed={sort === s} onClick={() => setSort(s)}>
      {text}
    </button>
  );
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm" role="group" aria-label={labels.sortBy}>
        <span>{labels.sortBy}:</span>
        {button("pay-asc", labels.cheapest)}
        {button("pay-desc", labels.dearest)}
        {button("name", labels.byName)}
      </div>
      <div className="ci-table-scroll mt-2">
        <table className="ci-local-table ci-stack-table">
          <thead>
            <tr>
              {cols.map((c, i) => (
                <th key={c} scope="col" aria-sort={i === 0 && sort === "name" ? "ascending" : i === cols.length - 1 && sort !== "name" ? (sort === "pay-asc" ? "ascending" : "descending") : undefined}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id}>
                <th scope="row" className="font-normal" data-label={cols[0]}>
                  {r.href ? <a href={r.href}>{r.name}</a> : r.name}
                </th>
                {r.cells.map((c, j) => (
                  <td key={j} data-label={cols[j + 1]} className={j === r.cells.length - 1 ? "font-semibold tabular-nums" : "tabular-nums"}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
