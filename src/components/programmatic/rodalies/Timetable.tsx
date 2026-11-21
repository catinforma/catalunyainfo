import Link from "next/link";

import { renderInline } from "@/lib/content/inline";
import type { HubTimetable, TimetableView } from "@/lib/programmatic/rodalies/timetable-copy";

/**
 * The timetable summary (Renfe's GTFS, committed snapshot), server-rendered:
 * one table per direction with the first and last train from the main
 * stations and, below, trains per hour by time band (or every departure on
 * the sparse regional lines), then the journey times and the notes that say
 * for which days the figures hold.
 */

const ROW_HEADER = "font-semibold text-[0.88rem] text-[var(--color-ink)]";
const GROUP_HEADER = "pt-4 font-sans text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]";

export function TimetableSection({ view }: { view: TimetableView }) {
  return (
    <section aria-labelledby={view.id}>
      <h2 id={view.id}>{view.title}</h2>
      <p>{renderInline(view.intro)}</p>
      {view.directions.map((direction) => {
        const span = direction.headers.length;
        return (
          <section key={direction.title} aria-label={direction.title}>
            <h3>{direction.title}</h3>
            <div className="ci-table-scroll mt-3">
              <table className="ci-local-table">
                <thead>
                  <tr>
                    {direction.headers.map((header, i) => (
                      <th key={header} scope="col">
                        {header}
                        {i > 0 ? <small className="block font-normal">{direction.dates[i - 1]}</small> : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="colgroup" colSpan={span} className={GROUP_HEADER}>
                      {direction.firstLastCaption}
                    </th>
                  </tr>
                  {direction.stations.map((station) => (
                    <tr key={station.name}>
                      <th scope="row" className={ROW_HEADER}>
                        {station.name}
                      </th>
                      {station.cells.map((cell, i) => (
                        <td key={i} className="whitespace-nowrap">
                          {cell.times}
                          {cell.trains ? <small className="block">{cell.trains}</small> : null}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                {direction.frequency ? (
                  <tbody>
                    <tr>
                      <th scope="colgroup" colSpan={span} className={GROUP_HEADER}>
                        {direction.frequency.caption}
                      </th>
                    </tr>
                    {direction.frequency.rows.map((row) => (
                      <tr key={row.label}>
                        <th scope="row" className={ROW_HEADER}>
                          {row.label}
                        </th>
                        {row.cells.map((cell, i) => (
                          <td key={i}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                ) : null}
                {direction.listed ? (
                  <tbody>
                    <tr>
                      <th scope="colgroup" colSpan={span} className={GROUP_HEADER}>
                        {direction.listed.caption}
                      </th>
                    </tr>
                    {direction.listed.rows.map((row) => (
                      <tr key={row.label}>
                        <th scope="row" className={ROW_HEADER}>
                          {row.label}
                        </th>
                        <td colSpan={span - 1}>{row.times}</td>
                      </tr>
                    ))}
                  </tbody>
                ) : null}
              </table>
            </div>
            {direction.journeys ? <p className="mt-3 text-sm">{renderInline(direction.journeys)}</p> : null}
          </section>
        );
      })}
      {view.notes.map((note) => (
        <p key={note} className="text-sm">
          {renderInline(note)}
        </p>
      ))}
      <p className="text-xs text-[var(--color-muted)]">{renderInline(view.attribution)}</p>
    </section>
  );
}

/** The hub's table: one row per line, linking each line's timetable. */
export function HubTimetableSection({ table, id }: { table: HubTimetable; id: string }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{table.title}</h2>
      <p className="text-sm text-[var(--color-muted)]">{renderInline(table.note)}</p>
      <div className="ci-table-scroll mt-4">
        <table className="ci-local-table">
          <thead>
            <tr>
              {table.headers.map((header) => (
                <th key={header} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.id}>
                <td className="whitespace-nowrap font-semibold">
                  <Link href={row.href}>{row.label}</Link>
                </td>
                <td>{row.station}</td>
                <td className="whitespace-nowrap">{row.times}</td>
                <td>{row.peak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[var(--color-muted)]">{renderInline(table.attribution)}</p>
    </section>
  );
}
