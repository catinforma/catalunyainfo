"use client";

import { useCallback, useEffect, useState } from "react";

import { liveLabels, type LiveLabels } from "@/lib/programmatic/mountain/labels";
import {
  OBSERVATIONS_ENDPOINT,
  compass,
  fill,
  hoursSince,
  kmh,
  liveView,
  number,
  parsePayload,
  readingTime,
  type Measures,
  type StationView,
} from "@/lib/programmatic/mountain/live";
import type { ObservationsPayload } from "@/lib/programmatic/mountain/types";

/**
 * Meteocat's latest validated readings, fetched in the browser from
 * /api/mountain/weather/ (CDN-cached for 30 minutes).
 *
 * The server renders `fallback` only: it never states a temperature, a wind
 * or a snow depth, so the cached HTML cannot go stale. After mount the
 * component reads our endpoint, checks the answer and shows each value with
 * its own reading time, only when that reading is under 48 hours old by the
 * browser's clock. A failure says so and links Meteocat; the station's own
 * page on meteo.cat is linked in every state.
 */

export interface LiveStation {
  code: string;
  /** "la Tosa d'Alp (2.478 m)". */
  label: string;
  /** "a 3,4 km de l'estació d'esquí", or the places it stands for on the hub. */
  detail: string;
  measures: Measures;
  url: string;
}

type State = { kind: "idle" } | { kind: "loading" } | { kind: "done"; payload: ObservationsPayload | null };

export interface MountainLiveProps {
  locale: "ca" | "es" | "en";
  intlLocale: string;
  mode: "place" | "hub";
  stations: LiveStation[];
  /** Meteocat link for the fallback and failure text. */
  meteocatUrl: string;
  /** AEMET's mountain forecast page, when the place is in its Pirineo Catalán area. */
  forecastUrl: string | null;
}

async function fetchPayload(): Promise<ObservationsPayload | null> {
  try {
    const response = await fetch(OBSERVATIONS_ENDPOINT, { headers: { accept: "application/json" } });
    return parsePayload(await response.json());
  } catch {
    return null;
  }
}

export function MountainLive({ locale, intlLocale, mode, stations, meteocatUrl, forecastUrl }: MountainLiveProps) {
  const labels = liveLabels(locale);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [now, setNow] = useState<Date | null>(null);

  const show = useCallback((payload: ObservationsPayload | null) => {
    setNow(new Date());
    setState({ kind: "done", payload });
  }, []);

  const reload = useCallback(() => {
    setState({ kind: "loading" });
    void fetchPayload().then(show);
  }, [show]);

  useEffect(() => {
    // The fetch and the clock run after mount only: the server render stays timeless.
    let active = true;
    void fetchPayload().then((payload) => {
      if (active) show(payload);
    });
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [show]);

  const meteocat = (
    <a href={meteocatUrl} rel="noopener" target="_blank">
      {labels.fallbackLink}
    </a>
  );

  if (state.kind !== "done" || !now) {
    const [before, after] = labels.fallback.split("{link}");
    return (
      <div className="ci-today" aria-live="polite" aria-busy={state.kind === "loading"}>
        <p className="m-0">
          {state.kind === "loading" ? (
            labels.loading
          ) : (
            <>
              {before}
              {meteocat}
              {after}
            </>
          )}
        </p>
      </div>
    );
  }

  const view = liveView(state.payload, now, stations);
  if (view.kind === "failed") {
    return (
      <div className="ci-today" aria-live="polite">
        <p className="ci-today-answer is-not">{labels.failed}</p>
        <p className="ci-today-note">{meteocat}</p>
        <p className="ci-today-note">
          <button type="button" className="underline" onClick={reload}>
            {labels.refresh}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="ci-today" aria-live="polite">
      {mode === "hub" ? (
        <HubTable stations={stations} views={view.stations} labels={labels} locale={locale} intlLocale={intlLocale} now={now} />
      ) : (
        stations.map((station) => (
          <StationCard
            key={station.code}
            station={station}
            view={view.stations[station.code]!}
            labels={labels}
            locale={locale}
            intlLocale={intlLocale}
            now={now}
          />
        ))
      )}
      {view.forecast && forecastUrl ? (
        <div className="mt-4">
          <p className="ci-label m-0">{labels.forecastTitle}</p>
          <p className="m-0 mt-1 whitespace-pre-line">{view.forecast.text}</p>
          <p className="ci-today-note !mt-1">
            {view.forecast.attribution} ·{" "}
            <a href={forecastUrl} rel="noopener" target="_blank">
              {labels.forecastLink}
            </a>
          </p>
        </div>
      ) : null}
      <p className="ci-today-note">{labels.source}</p>
    </div>
  );
}

type Format = { labels: LiveLabels; locale: "ca" | "es" | "en"; intlLocale: string; now: Date };

function when(at: string, { labels, intlLocale, now }: Format): string {
  const h = hoursSince(at, now);
  const time = readingTime(at, intlLocale);
  return h < 1 ? fill(labels.readAtNow, { time }) : fill(labels.readAt, { time, h });
}

function temperatureText(view: StationView, f: Format): string | null {
  return view.temperature ? `${number(view.temperature.value, f.intlLocale)} °C` : null;
}

function windText(view: StationView, f: Format): string | null {
  const w = view.wind;
  if (!w) return null;
  const parts = [fill(f.labels.windSpeed, { ms: number(w.speed, f.intlLocale), kmh: kmh(w.speed) })];
  if (w.direction !== null) parts.push(fill(f.labels.windDirection, { dir: compass(w.direction, f.locale) }));
  if (w.gust !== null) parts.push(fill(f.labels.gust, { ms: number(w.gust, f.intlLocale), kmh: kmh(w.gust) }));
  return parts.join(", ");
}

function snowText(view: StationView, f: Format): string | null {
  const s = view.snow;
  if (!s) return null;
  if (s.change24h === null || s.change24h === 0) return `${s.cm} cm`;
  const n = `${s.change24h > 0 ? "+" : "−"}${Math.abs(s.change24h)}`;
  return `${s.cm} cm (${fill(f.labels.snowChange, { n })})`;
}

function StationCard({ station, view, ...f }: { station: LiveStation; view: StationView } & Format) {
  const rows: { label: string; value: string | null; at: string | null }[] = [];
  if (station.measures.temperature) rows.push({ label: f.labels.temperature, value: temperatureText(view, f), at: view.temperature?.at ?? null });
  if (station.measures.wind) rows.push({ label: fill(f.labels.wind, { h: station.measures.wind }), value: windText(view, f), at: view.wind?.at ?? null });
  if (station.measures.snow) rows.push({ label: f.labels.snow, value: snowText(view, f), at: view.snow?.at ?? null });

  return (
    <section className="mt-4 first:mt-0" aria-label={station.label}>
      <p className="m-0 font-semibold">
        {station.label} <span className="font-normal text-[var(--color-muted)]">· {station.detail}</span>
      </p>
      {view.empty ? (
        <p className="ci-today-answer is-not !mt-1">{f.labels.empty}</p>
      ) : (
        <dl className="ci-facts !mt-2">
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt>{row.label}</dt>
              <dd>
                {row.value ?? f.labels.missing}
                {row.value && row.at ? <span className="block text-xs text-[var(--color-muted)]">{when(row.at, f)}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className="ci-today-note !mt-1">
        <a href={station.url} rel="noopener" target="_blank">
          {f.labels.stationLink}
        </a>
      </p>
    </section>
  );
}

function Cell({ measured, value, at, f }: { measured: boolean; value: string | null; at: string | null; f: Format }) {
  if (!measured) return <td className="text-[var(--color-muted)]">{f.labels.notMeasured}</td>;
  if (!value || !at) return <td className="text-[var(--color-muted)]">{f.labels.none}</td>;
  return (
    <td>
      {value}
      <span className="block text-xs text-[var(--color-muted)]">{readingTime(at, f.intlLocale)}</span>
    </td>
  );
}

function HubTable({ stations, views, ...f }: { stations: LiveStation[]; views: Record<string, StationView> } & Format) {
  return (
    <div className="ci-table-scroll">
      <table className="ci-local-table">
        <thead>
          <tr>
            <th scope="col">{f.labels.headers.station}</th>
            <th scope="col">{f.labels.headers.temperature}</th>
            <th scope="col">{f.labels.headers.wind}</th>
            <th scope="col">{f.labels.headers.snow}</th>
          </tr>
        </thead>
        <tbody>
          {stations.map((station) => {
            const view = views[station.code]!;
            return (
              <tr key={station.code}>
                <td>
                  <a href={station.url} rel="noopener" target="_blank">
                    {station.label}
                  </a>
                  <span className="block text-xs text-[var(--color-muted)]">{station.detail}</span>
                </td>
                <Cell measured={station.measures.temperature} value={temperatureText(view, f)} at={view.temperature?.at ?? null} f={f} />
                <Cell measured={station.measures.wind !== null} value={windText(view, f)} at={view.wind?.at ?? null} f={f} />
                <Cell measured={station.measures.snow} value={snowText(view, f)} at={view.snow?.at ?? null} f={f} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
