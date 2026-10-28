"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { READING_LABELS } from "@/lib/programmatic/reservoirs/labels";
import {
  LEVELS_ENDPOINT,
  fill,
  formatChange,
  formatDate,
  formatNumber,
  indicatorVolume,
  mergeReadings,
  parsePayload,
  readingAge,
  type BlockLocale,
  type Reading,
} from "@/lib/programmatic/reservoirs/live";
import type { Indicator } from "@/lib/programmatic/reservoirs/official";
import type { LivePayload, ReservoirSlug } from "@/lib/programmatic/reservoirs/types";

/**
 * Today's reading, in the browser.
 *
 * The server HTML (and a browser without JavaScript) shows the page's own
 * reading from the committed snapshot, always with its date: it is a real
 * ACA figure, never presented as today's. After mount, one request to
 * /api/reservoirs/levels/ (CDN-cached for an hour, shared by every block on
 * the page) brings the ACA's latest reading; the block then says how old it
 * is by Madrid's calendar. A failed or malformed answer keeps the page's own
 * reading and says so.
 */

let pending: Promise<LivePayload | null> | null = null;

function loadOnce(): Promise<LivePayload | null> {
  pending ??= fetch(LEVELS_ENDPOINT, { headers: { accept: "application/json" } })
    .then((response) => response.json() as Promise<unknown>)
    .then(parsePayload)
    .catch(() => null);
  return pending;
}

type Live = { payload: LivePayload | null; now: Date } | null;

function useLive(): Live {
  const [live, setLive] = useState<Live>(null);
  useEffect(() => {
    // The fetch and the clock run after mount only: the server render stays timeless.
    let active = true;
    void loadOnce().then((payload) => {
      if (active) setLive({ payload, now: new Date() });
    });
    return () => {
      active = false;
    };
  }, []);
  return live;
}

/** "Dada de l'ACA d'avui, 29/10/2026." or the page's own / failure line. */
function statusLine(locale: BlockLocale, own: Reading, shown: Reading, isLive: boolean, live: Live): string {
  const L = READING_LABELS[locale];
  if (!live) return fill(L.own, { date: formatDate(own.date, locale) });
  if (!isLive) return fill(L.failed, { date: formatDate(own.date, locale) });
  return fill(L.live[readingAge(shown.date, live.now)], { date: formatDate(shown.date, locale) });
}

export interface ReservoirReadingProps {
  locale: BlockLocale;
  slug: ReservoirSlug;
  /** The snapshot's reading of every reservoir (this one included). */
  own: Reading[];
  capacity: number;
  officialUrl: string;
}

export function ReservoirReading({ locale, slug, own, capacity, officialUrl }: ReservoirReadingProps) {
  const L = READING_LABELS[locale];
  const live = useLive();
  const mine = own.find((r) => r.slug === slug)!;
  const merged = live ? mergeReadings(live.payload, own) : { readings: own, live: 0 };
  const shown = merged.readings.find((r) => r.slug === slug) ?? mine;
  const isLive = Boolean(live && live.payload?.ok && shown !== mine);
  const pct = formatNumber(shown.percent, locale);

  return (
    <section className="ci-reservoirs" aria-live="polite">
      <div className="ci-reservoirs-head">
        <p className="ci-reservoirs-figure">{fill(L.full, { pct })}</p>
        <div className="ci-reservoirs-bar" aria-hidden="true">
          <span style={{ width: `${Math.min(100, shown.percent)}%` }} />
        </div>
        <p>{fill(L.volume, { vol: formatNumber(shown.volume, locale, 2), cap: formatNumber(capacity, locale, 2) })}</p>
        {shown.level !== null ? <p>{fill(L.level, { level: formatNumber(shown.level, locale, 2) })}</p> : null}
        {isLive && typeof shown.change === "number" && shown.changeFrom ? (
          <p>{fill(L.change, { pp: formatChange(shown.change, locale), date: formatDate(shown.changeFrom, locale) })}</p>
        ) : null}
        <p className="ci-calc-note">{statusLine(locale, mine, shown, isLive, live)}</p>
      </div>
      <p className="ci-calc-note">
        {L.source}{" "}
        <a href={officialUrl} rel="noopener" target="_blank">
          {L.official}
        </a>
      </p>
    </section>
  );
}

export interface IndicatorVolumesProps {
  locale: BlockLocale;
  own: Reading[];
  indicators: Pick<Indicator, "key" | "reservoirs">[];
}

/** The added reserves of the drought indicators this reservoir counts in, from the same readings. */
export function IndicatorVolumes({ locale, own, indicators }: IndicatorVolumesProps) {
  const L = READING_LABELS[locale];
  const live = useLive();
  const readings = live ? mergeReadings(live.payload, own).readings : own;
  const lines = indicators.map((ind) => ({ key: ind.key, sum: indicatorVolume(readings, ind.reservoirs) }));
  return (
    <div className="ci-margin-block" aria-live="polite">
      <p className="ci-label !mt-0">{L.indicatorsTitle}</p>
      <ul className="m-0 mt-2 list-none p-0 text-sm">
        {lines.map((line) => (
          <li key={line.key}>
            {line.sum
              ? fill(L.indicator, { name: L.indicatorNames[line.key], vol: formatNumber(line.sum.volume, locale), date: formatDate(line.sum.date, locale) })
              : `${L.indicatorNames[line.key]}: ${L.indicatorMissing}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface ReservoirTableRow {
  slug: ReservoirSlug;
  name: string;
  href: string;
  river: string;
  capacity: number;
}

export interface ReservoirTableProps {
  locale: BlockLocale;
  rows: ReservoirTableRow[];
  own: Reading[];
  /** The snapshot's latest reading date. */
  ownDate: string;
  officialUrl: string;
}

/** The hub's table: static facts from the server, the percentage and its date refreshed in the browser. */
export function ReservoirTable({ locale, rows, own, ownDate, officialUrl }: ReservoirTableProps) {
  const L = READING_LABELS[locale];
  const live = useLive();
  const merged = live ? mergeReadings(live.payload, own) : { readings: own, live: 0 };
  const status = !live ? fill(L.tableOwn, { date: formatDate(ownDate, locale) }) : merged.live > 0 ? L.tableLive : fill(L.tableFailed, { date: formatDate(ownDate, locale) });

  return (
    <section className="ci-reservoirs" aria-live="polite">
      <p className="ci-calc-note">{status}</p>
      <div className="ci-table-scroll">
        <table className="ci-local-table ci-reservoirs-table">
          <thead>
            <tr>
              <th scope="col">{L.cols.name}</th>
              <th scope="col">{L.cols.river}</th>
              <th scope="col">{L.cols.capacity}</th>
              <th scope="col">{L.cols.full}</th>
              <th scope="col">{L.cols.date}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const reading = merged.readings.find((r) => r.slug === row.slug);
              return (
                <tr key={row.slug}>
                  <th scope="row">
                    <Link href={row.href}>{row.name}</Link>
                  </th>
                  <td>{row.river}</td>
                  <td className="ci-numeric">{formatNumber(row.capacity, locale, 2)}</td>
                  <td className="ci-numeric">{reading ? `${formatNumber(reading.percent, locale)}${locale === "en" ? "%" : " %"}` : "—"}</td>
                  <td className="ci-numeric">{reading ? formatDate(reading.date, locale) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="ci-calc-note">
        {L.source}{" "}
        <a href={officialUrl} rel="noopener" target="_blank">
          {L.official}
        </a>
      </p>
    </section>
  );
}
