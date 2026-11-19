"use client";

/**
 * The <tbody> of the page's INE tables (AverageSalaryPage's Grid), rendered
 * from compact props: each row is [label, 1 if bold, ...cell texts].
 *
 * The page has 17 tables and ~1,300 figure cells. As server-component
 * elements every cell travelled twice, as HTML and again in the RSC payload
 * with its data-label and classes (~130 bytes a cell there). Rendered here
 * the HTML is the same, byte for byte, and the payload carries the column
 * labels once and each cell as its text.
 */

export type GridRow = [label: string, strong: 0 | 1, ...cells: string[]];

export function GridRows({ cols, rows }: { cols: readonly string[]; rows: readonly GridRow[] }) {
  return (
    <tbody>
      {rows.map(([label, strong, ...cells], i) => (
        <tr key={i}>
          <th scope="row" className={strong ? "font-semibold" : "font-normal"}>
            {label}
          </th>
          {cells.map((c, j) => (
            <td key={j} data-label={cols[j]} className="whitespace-nowrap text-right tabular-nums">
              {c}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
