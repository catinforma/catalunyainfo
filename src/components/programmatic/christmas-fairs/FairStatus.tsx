"use client";

import { useEffect, useState } from "react";

import { dayMonth, onDate, rangeText, untilDate, weekday } from "@/lib/programmatic/christmas-fairs/format";
import type { FairsLocale } from "@/lib/programmatic/christmas-fairs/paths";
import { fill, seasonStatus, todayInMadrid, type DatedFair, type SeasonStatus, type StatusLabels } from "@/lib/programmatic/christmas-fairs/today";

/**
 * "Is it on today? When is the next one?", answered in the browser from the
 * dates embedded in the page. The server render (and no-JS) shows the
 * fallback, which points at the full list below; once mounted, the component
 * reads the clock in Europe/Madrid. The static HTML never depends on the day.
 */

export function FairStatus({ fairs, locale, labels, showTown }: { fairs: DatedFair[]; locale: FairsLocale; labels: StatusLabels; showTown: boolean }) {
  const [status, setStatus] = useState<{ today: string; value: SeasonStatus | null } | null>(null);

  useEffect(() => {
    const today = todayInMadrid(new Date());
    // One state update after mount: the server render stays date-free.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus({ today, value: seasonStatus(today, fairs) });
  }, [fairs]);

  if (!status || !status.value) {
    return (
      <div className="ci-today" aria-live="polite">
        <p className="ci-today-date m-0">{labels.fallback}</p>
      </div>
    );
  }

  const { value } = status;
  const where = (f: DatedFair) => (showTown ? `${f.n} (${f.t})` : f.n);
  const inText = (days: number) => (days === 1 ? labels.tomorrow : fill(labels.inDays, { n: days }));
  const when = (iso: string) => `${weekday(iso, locale)} ${dayMonth(iso, locale)}`;

  let answer: string;
  let isOn = false;
  if (value.state === "open") {
    isOn = true;
    const f = value.open[0]!;
    answer =
      value.open.length === 1
        ? fill(labels.openOne, { n: f.n, t: f.t, until: untilDate(f.e, locale) })
        : fill(labels.openMany, { count: value.open.length });
  } else if (value.state === "upcoming") {
    answer = fill(labels.upcoming, { n: value.next.n, t: value.next.t, when: when(value.next.s), in: inText(value.nextIn) });
  } else {
    answer = fill(labels.over, { last: onDate(value.lastDay, locale) });
  }

  return (
    <div className="ci-today" aria-live="polite">
      <p className={`ci-today-answer ${isOn ? "is-holiday" : "is-not"}`}>{answer}</p>
      {value.state === "open" && value.open.length > 1 ? (
        <ul className="mt-3">
          {value.open.map((f) => (
            <li key={f.id}>
              {where(f)}: {rangeText(f.s, f.e, locale, { weekdays: false, year: false })}
            </li>
          ))}
        </ul>
      ) : null}
      {value.state === "open" && value.next ? (
        <dl className="ci-today-facts">
          <div>
            <dt>{labels.next}</dt>
            <dd>
              {where(value.next)}: {when(value.next.s)} ({inText(value.nextIn ?? 0)})
            </dd>
          </div>
        </dl>
      ) : null}
      <p className="ci-today-date">{labels.timezone}</p>
    </div>
  );
}
