"use client";

import type { LocalHolidayRow, ShopRow } from "@/lib/content/packed-rows";

/**
 * The <tbody> of the two big place tables, rendered from compact props:
 * LocalHolidays (~1,400 municipalities and nuclei) and ShopsChristmas (947
 * municipalities).
 *
 * A server component's output reaches the browser twice: as HTML, and again,
 * element by element, in the RSC payload React hydrates from (~200 bytes a
 * row for these tables, more than the row's HTML). Rendered here, the HTML is
 * byte for byte the one the server component produced, every name and date
 * still in it for crawlers and readers without JavaScript, while the payload
 * carries each name once and each day label as an index into `days`
 * (lib/content/packed-rows.ts), about 30 bytes a row.
 *
 * The rows never change after hydration: LocalHolidaysFilter hides them
 * through the DOM, as it did with the server-rendered ones.
 */

export function LocalHolidayRows({ rows, days, nucleus }: { rows: readonly LocalHolidayRow[]; days: readonly string[]; nucleus: string }) {
  return (
    <tbody>
      {rows.map(([name, isNucleus, ...dates], i) => (
        <tr key={i}>
          <td>
            {name}
            {isNucleus ? <small> {nucleus}</small> : null}
          </td>
          <td>{dates.map((d) => days[d]).join(" · ")}</td>
        </tr>
      ))}
    </tbody>
  );
}

export function ShopRows({ rows, days, notOn }: { rows: readonly ShopRow[]; days: readonly string[]; notOn: string }) {
  return (
    <tbody>
      {rows.map(([town, open, swapped], i) => (
        <tr key={i}>
          <td>{town}</td>
          <td>
            {days[open]}
            {swapped !== undefined ? (
              <strong>
                {" "}
                ({notOn} {days[swapped]})
              </strong>
            ) : null}
          </td>
        </tr>
      ))}
    </tbody>
  );
}
