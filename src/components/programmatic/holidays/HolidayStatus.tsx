"use client";

import { useEffect, useState } from "react";

import { dayMonthYear, longDate, weekdayName, type DateLocale } from "@/lib/programmatic/holidays/format";
import { statusFor, todayInMadrid, type Coverage, type DayAnswer, type DayInfo, type Status } from "@/lib/programmatic/holidays/status";

/**
 * "Is today a holiday here?", answered in the browser.
 *
 * The page around it is static and carries no date of its own, so the answer
 * cannot come from the server without making every page day-dependent. The
 * first render (server and no-JS) shows the fallback text; once mounted, the
 * component reads the clock in Europe/Madrid and fills in today, tomorrow and
 * the next holiday from the dates embedded in the page.
 */

export interface StatusLabels {
  /** "{place}" is replaced by the place name; "{year}" by a year. */
  fallback: string;
  todayHoliday: string;
  todayWorking: string;
  todayWeekend: string;
  todayLocalUnknown: string;
  todayUnknown: string;
  tomorrow: string;
  next: string;
  yes: string;
  no: string;
  localUnknownShort: string;
  unknownShort: string;
  inDays: string;
  inOneDay: string;
  mayBeEarlier: string;
  none: string;
  timezone: string;
}

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function shortAnswer(answer: DayAnswer, labels: StatusLabels): string {
  switch (answer.state) {
    case "holiday":
      return `${labels.yes}: ${answer.holiday.n}`;
    case "working":
      return labels.no;
    case "local-unknown":
      return fill(labels.localUnknownShort, { year: answer.date.slice(0, 4) });
    default:
      return labels.unknownShort;
  }
}

export function HolidayStatus({
  place,
  days,
  coverage,
  locale,
  labels,
}: {
  place: string;
  days: DayInfo[];
  coverage: Coverage;
  locale: DateLocale;
  labels: StatusLabels;
}) {
  const [status, setStatus] = useState<{ today: string; value: Status } | null>(null);

  useEffect(() => {
    const today = todayInMadrid(new Date());
    // One state update after mount: the server render stays date-free.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus({ today, value: statusFor(today, days, coverage) });
  }, [days, coverage]);

  if (!status) {
    return (
      <div className="ci-today" aria-live="polite">
        <p className="ci-today-note m-0">{fill(labels.fallback, { place })}</p>
      </div>
    );
  }

  const { today, value } = status;
  const weekend = [0, 6].includes(new Date(`${today}T12:00:00Z`).getUTCDay());
  const answerText = (() => {
    switch (value.today.state) {
      case "holiday":
        return fill(labels.todayHoliday, { place, name: value.today.holiday.n });
      case "working":
        return fill(weekend ? labels.todayWeekend : labels.todayWorking, { place, weekday: weekdayName(today, locale) });
      case "local-unknown":
        return fill(labels.todayLocalUnknown, { place, year: today.slice(0, 4) });
      default:
        return fill(labels.todayUnknown, { year: today.slice(0, 4) });
    }
  })();

  const next = value.next;
  return (
    <div className="ci-today" aria-live="polite">
      <p className={`ci-today-answer ${value.today.state === "holiday" ? "is-holiday" : "is-not"}`}>{answerText}</p>
      <p className="ci-today-date">{longDate(today, locale)}</p>
      <dl className="ci-today-facts">
        <div>
          <dt>{labels.tomorrow}</dt>
          <dd>{shortAnswer(value.tomorrow, labels)}</dd>
        </div>
        <div>
          <dt>{labels.next}</dt>
          <dd>
            {next
              ? `${next.holiday.n}: ${weekdayName(next.holiday.d, locale)} ${dayMonthYear(next.holiday.d, locale)} (${
                  next.inDays === 1 ? labels.inOneDay : fill(labels.inDays, { n: next.inDays })
                })`
              : labels.none}
          </dd>
        </div>
      </dl>
      {next && value.nextMayBeEarlier ? (
        <p className="ci-today-note">{fill(labels.mayBeEarlier, { place, year: next.holiday.d.slice(0, 4) })}</p>
      ) : null}
      <p className="ci-today-note">{labels.timezone}</p>
    </div>
  );
}
