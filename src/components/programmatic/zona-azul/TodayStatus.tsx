"use client";

import { useEffect, useState } from "react";

import { madridClock, type HolidayEntry } from "@/lib/programmatic/zona-azul/logic";
import { TODAY_LABELS, todayView, type TodayView } from "@/lib/programmatic/zona-azul/today";
import type { PaidRule, ZaLocale } from "@/lib/programmatic/zona-azul/types";

/**
 * "Is the blue zone paid today, and until what time?", answered in the
 * browser. The page is static and must not carry the day it was
 * rendered: the server render (and a reader without JavaScript) gets the
 * general rule, which is true every day; once mounted, the component reads
 * the clock in Europe/Madrid and works the answer out from the rule and the
 * city's public holidays, both embedded in the page. It then looks again
 * every minute, so a tab left open does not keep saying "paid until 14:00"
 * at 14:05.
 *
 * `data-nosnippet`: a crawler that runs the script would otherwise quote the
 * answer of the day it crawled.
 */
export function TodayStatus({
  locale,
  city,
  rule,
  holidays,
  localYears,
  through,
  fallback,
}: {
  locale: ZaLocale;
  city: string;
  rule: PaidRule;
  holidays: HolidayEntry[];
  localYears: number[];
  through: string;
  /** The general rule, shown before the script runs. */
  fallback: string;
}) {
  const [view, setView] = useState<TodayView | null>(null);

  useEffect(() => {
    const read = () => todayView({ locale, city, rule, holidays, localYears, through }, madridClock(new Date()));
    // One state update after mount: the server render stays date-free.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView(read());
    const timer = window.setInterval(() => setView(read()), 60_000);
    return () => window.clearInterval(timer);
  }, [locale, city, rule, holidays, localYears, through]);

  const labels = TODAY_LABELS[locale];

  if (!view) {
    /* The skeleton reserves the height of the answer so nothing below moves
       when it arrives; the fallback is laid over it. */
    return (
      <div className="ci-today" aria-live="polite" data-nosnippet="">
        <div className="ci-live-pending">
          <div className="ci-live-skeleton" aria-hidden="true">
            <p className="ci-today-answer is-not">
              {" "}
              <br className="sm:hidden" />
              {" "}
            </p>
            <p className="ci-today-date">{" "}</p>
            <dl className="ci-today-facts">
              {[labels.now, labels.tomorrow, labels.nextHoliday].map((label) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>
                    {" "}
                    <br />
                    {" "}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="ci-today-note">
              {" "}
              <br />
              {" "}
            </p>
          </div>
          <p className="ci-today-date ci-live-placeholder">{fallback}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ci-today" aria-live="polite" data-nosnippet="">
      <p className={`ci-today-answer ${view.free ? "is-holiday" : "is-not"}`}>{view.answer}</p>
      <p className="ci-today-date">{view.date}</p>
      <dl className="ci-today-facts">
        {view.facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      {view.notes.map((note) => (
        <p key={note} className="ci-today-note">
          {note}
        </p>
      ))}
    </div>
  );
}
