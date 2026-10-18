"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A search box over the server-rendered local-holiday table.
 *
 * It hides rows in the browser and does nothing else: the table it filters is
 * complete in the HTML, so a crawler, a screen reader with scripts off and a
 * reader who never types anything all see every municipality.
 */
export function LocalHolidaysFilter({
  label,
  placeholder,
  empty,
}: {
  label: string;
  placeholder: string;
  empty: string;
}) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;
    const needle = query
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
    let shown = 0;
    // Rows carry no data attribute any more (it doubled every name in the
    // HTML); the place name is the first cell's text.
    section.querySelectorAll<HTMLTableRowElement>("tbody tr").forEach((row) => {
      const name = (row.cells[0]?.textContent ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      const match = needle === "" || name.includes(needle);
      row.hidden = !match;
      if (match) shown += 1;
    });
    setVisible(needle === "" ? null : shown);
  }, [query]);

  return (
    <div ref={ref} className="ci-local-filter">
      <label htmlFor="local-filter">{label}</label>
      <input
        id="local-filter"
        className="ci-field"
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {visible === 0 ? <p className="ci-calc-note">{empty}</p> : null}
    </div>
  );
}
