"use client";

import { useEffect, useMemo, useState } from "react";

import type { LiveLabels } from "@/lib/programmatic/fuel/copy";
import { FUELS, freshness, rank, type Freshness, type Fuel, type LivePayload, type StationFilter } from "@/lib/programmatic/fuel/live";

/**
 * Today's prices, in the browser.
 *
 * The page around it is static and carries no price: prices change every half
 * hour and a cached page would show yesterday's as today's. The first render
 * (server and no-JS) says where the prices come from and links the Ministry's
 * own map; once mounted, the component reads `/api/fuel/catalonia/` (one
 * CDN-cached response for every page), keeps the stations of this page and
 * shows the ten cheapest for the chosen product with the Ministry's timestamp.
 * A list older than four hours is shown under a warning, one older than a day
 * not at all.
 */

type State = { kind: "loading" } | { kind: "failed" } | { kind: "ready"; payload: LivePayload; fresh: Freshness };

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** "28/10/2026 11:36:05" -> { date: "28/10/2026", time: "11:36" }. */
function splitFecha(fecha: string): { date: string; time: string } {
  const [date = fecha, time = ""] = fecha.split(" ");
  return { date, time: time.slice(0, 5) };
}

export function FuelPrices({
  filter,
  placeOf,
  showTown,
  locale,
  labels,
  geoportalUrl,
}: {
  filter: StationFilter;
  /** "de Manresa" / "de la provincia de Girona": completes the median line. */
  placeOf: string;
  /** Show the municipality column (off on a single-town page). */
  showTown: boolean;
  locale: "ca" | "es";
  labels: LiveLabels;
  geoportalUrl: string;
}) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [fuel, setFuel] = useState<Fuel>("e95");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // One state update after mount: the server render stays price-free.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    fetch("/api/fuel/catalonia/")
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        const payload = (await response.json()) as LivePayload;
        if (!Array.isArray(payload.stations)) throw new Error("shape");
        if (!cancelled) setState({ kind: "ready", payload, fresh: freshness(payload.updated, Date.now()) });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "failed" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rankings = useMemo(() => {
    if (state.kind !== "ready") return null;
    return Object.fromEntries(FUELS.map((f) => [f, rank(state.payload.stations, filter, f)])) as Record<Fuel, ReturnType<typeof rank>>;
  }, [state, filter]);

  const geoportal = (
    <a href={geoportalUrl} rel="noopener nofollow" target="_blank">
      {labels.geoportal}
    </a>
  );
  const withGeoportal = (text: string) => {
    const [before, after] = text.split(labels.geoportal);
    return after === undefined ? (
      <>
        {text} {geoportal}
      </>
    ) : (
      <>
        {before}
        {geoportal}
        {after}
      </>
    );
  };

  if (!mounted) {
    return (
      <div className="ci-today" aria-live="polite">
        <p className="m-0">{withGeoportal(labels.fallback)}</p>
      </div>
    );
  }
  if (state.kind === "loading") {
    return (
      <div className="ci-today" aria-live="polite" aria-busy="true">
        <p className="m-0">{labels.loading}</p>
      </div>
    );
  }
  if (state.kind === "failed") {
    return (
      <div className="ci-today" aria-live="polite">
        <p className="ci-callout ci-callout-warning m-0">{withGeoportal(labels.failed)}</p>
      </div>
    );
  }

  const { payload, fresh } = state;
  const { date, time } = splitFecha(payload.fecha);
  const when = time ? `${date} ${time}` : date;
  if (fresh === "stale" || !rankings) {
    return (
      <div className="ci-today" aria-live="polite">
        <p className="ci-callout ci-callout-warning m-0">{withGeoportal(fill(labels.stale, { when }))}</p>
      </div>
    );
  }

  const price = new Intl.NumberFormat(locale === "es" ? "es-ES" : "ca-ES", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const available = FUELS.filter((f) => rankings[f].count > 0);
  const current = rankings[available.includes(fuel) ? fuel : (available[0] ?? fuel)];

  return (
    <div className="ci-today" aria-live="polite">
      <p className="m-0 text-sm text-[var(--color-ink-soft)]">
        <time dateTime={payload.updated ?? undefined}>{fill(labels.updated, { time, date })}</time>
      </p>
      {fresh === "old" ? <p className="ci-callout ci-callout-warning mt-3">{withGeoportal(fill(labels.old, { when }))}</p> : null}

      <div role="group" aria-label={labels.picker} className="mt-4 flex flex-wrap gap-2">
        {available.map((f) => (
          <button
            key={f}
            type="button"
            className={`ci-btn ${f === current.fuel ? "ci-btn-primary" : "ci-btn-quiet"} !px-3 !py-1.5 text-sm`}
            aria-pressed={f === current.fuel}
            onClick={() => setFuel(f)}
          >
            {labels.fuelNames[f]}
          </button>
        ))}
      </div>

      {current.count === 0 || current.median === null ? (
        <p className="mt-4">{fill(labels.none, { place: placeOf })}</p>
      ) : (
        <>
          <p className="mt-4 mb-0">
            {fill(labels.median, { count: current.count, place: placeOf, price: `${price.format(current.median)} ${labels.perLitre}` })}
          </p>
          <div className="ci-table-scroll mt-3">
            <table className="ci-local-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">
                {fill(labels.caption, { n: current.cheapest.length, fuel: labels.fuelNames[current.fuel] })}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{labels.cols.rank}</th>
                  <th scope="col">{labels.cols.station}</th>
                  {showTown ? <th scope="col">{labels.cols.town}</th> : null}
                  <th scope="col" className="text-right">
                    {labels.cols.price}
                  </th>
                  <th scope="col">
                    <span className="sr-only">{labels.cols.map}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {current.cheapest.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{s.b}</strong>
                      <br />
                      <small>{s.a}</small>
                    </td>
                    {showTown ? <td>{locale === "es" ? s.t.charAt(0).toUpperCase() + s.t.slice(1) : s.t}</td> : null}
                    <td className="text-right font-semibold whitespace-nowrap tabular-nums">{price.format(s[current.fuel]!)}</td>
                    <td>
                      {s.lat !== undefined && s.lon !== undefined ? (
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lon}#map=17/${s.lat}/${s.lon}`}
                          rel="noopener nofollow"
                          target="_blank"
                          aria-label={`${labels.map}: ${s.b}, ${s.a}`}
                        >
                          {labels.cols.map}
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
