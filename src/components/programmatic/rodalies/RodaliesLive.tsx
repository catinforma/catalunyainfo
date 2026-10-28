"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { liveLabels, type LiveLabels } from "@/lib/programmatic/rodalies/labels";
import { ALERTS_ENDPOINT, alertText, fill, liveView, noticeDay, parsePayload } from "@/lib/programmatic/rodalies/live";
import type { AlertsPayload, CompactAlert, LineId } from "@/lib/programmatic/rodalies/types";

/**
 * The live notices, fetched in the browser from /api/rodalies/alerts/.
 *
 * The server renders `fallback` only: it never says whether a line has
 * notices, so the cached HTML cannot go stale. After mount the component
 * asks our endpoint (CDN-cached for two minutes), checks the answer, and
 * shows the notices, "none", or a failure. An answer older than 15 minutes
 * is shown as a failure, never as current. The official status page is
 * linked in every state.
 */

type State = { kind: "idle" } | { kind: "loading" } | { kind: "done"; payload: AlertsPayload | null };

export interface RodaliesLiveProps {
  locale: "ca" | "es" | "en";
  intlLocale: string;
  /** The line of a line page; null on the hub (every notice is shown). */
  line: LineId | null;
  lineNames: Record<string, string>;
  /** Links for the line names under each notice (none in English). */
  lineHrefs: Partial<Record<LineId, string>>;
  statusUrl: string;
}

/** Our endpoint's answer, checked; null on any failure (never "no notices"). */
async function fetchPayload(): Promise<AlertsPayload | null> {
  try {
    const response = await fetch(ALERTS_ENDPOINT, { headers: { accept: "application/json" } });
    return parsePayload(await response.json());
  } catch {
    return null;
  }
}

export function RodaliesLive({ locale, intlLocale, line, lineNames, lineHrefs, statusUrl }: RodaliesLiveProps) {
  // Built here, in the browser bundle, so only `fallback` reaches the server HTML.
  const labels = liveLabels(locale, line ? (lineNames[line] ?? line) : null);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [now, setNow] = useState<Date | null>(null);

  const show = useCallback((payload: AlertsPayload | null) => {
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

  const official = (
    <p className="ci-today-note">
      <a href={statusUrl} rel="noopener" target="_blank">
        {labels.official}
      </a>
    </p>
  );

  if (state.kind !== "done" || !now) {
    return (
      <div className="ci-today" aria-live="polite" aria-busy={state.kind === "loading"}>
        <p className="m-0">{state.kind === "loading" ? labels.loading : <Fallback text={labels.fallback} />}</p>
        {official}
      </div>
    );
  }

  const view = liveView(state.payload, now, line);
  if (view.kind !== "ok") {
    return (
      <div className="ci-today" aria-live="polite">
        <p className="ci-today-answer is-not">{view.kind === "stale" ? labels.stale : labels.failed}</p>
        {official}
        <p className="ci-today-note">
          <button type="button" className="underline" onClick={reload}>
            {labels.refresh}
          </button>
        </p>
      </div>
    );
  }

  const source = labels.sourceNames[view.source];
  const sourceLine = view.minutes < 1 ? fill(labels.sourceNow, { source }) : fill(labels.sourceAgo, { source, n: view.minutes });

  return (
    <div className="ci-today" aria-live="polite">
      {view.alerts.length === 0 ? (
        <>
          <p className="ci-today-answer is-not">{fill(labels.none, { line: line ? (lineNames[line] ?? line) : "" })}</p>
          <p className="ci-today-note">{labels.noneNote}</p>
        </>
      ) : (
        <ul className="m-0 list-none p-0">
          {view.alerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              labels={labels}
              locale={locale}
              intlLocale={intlLocale}
              now={now}
              line={line}
              lineNames={lineNames}
              lineHrefs={lineHrefs}
            />
          ))}
        </ul>
      )}
      <p className="ci-today-note">
        {sourceLine}. {labels.attribution[view.source]}
        {labels.languageNote ? ` ${labels.languageNote}` : ""}
      </p>
      {official}
    </div>
  );
}

/** The fallback carries one markdown link to the official page; render it as a link. */
function Fallback({ text }: { text: string }) {
  const match = /^(.*)\[([^\]]+)\]\((https:\/\/[^)\s]+)\)(.*)$/.exec(text);
  if (!match) return <>{text}</>;
  return (
    <>
      {match[1]}
      <a href={match[3]} rel="noopener" target="_blank">
        {match[2]}
      </a>
      {match[4]}
    </>
  );
}

function AlertItem({
  alert,
  labels,
  locale,
  intlLocale,
  now,
  line,
  lineNames,
  lineHrefs,
}: {
  alert: CompactAlert;
  labels: LiveLabels;
  locale: "ca" | "es" | "en";
  intlLocale: string;
  now: Date;
  line: LineId | null;
  lineNames: Record<string, string>;
  lineHrefs: Partial<Record<LineId, string>>;
}) {
  const time = alert.time ?? "";
  const day = noticeDay(alert.date, now);
  let when: string | null = null;
  if (alert.date && alert.time) {
    if (day === "today") when = fill(labels.publishedToday, { time });
    else if (day === "yesterday") when = fill(labels.publishedYesterday, { time });
    else {
      const date = new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "numeric", timeZone: "UTC" }).format(new Date(`${alert.date}T12:00:00Z`));
      when = fill(labels.publishedOn, { time, date });
    }
  }
  const everyLine = alert.lines.length >= Object.keys(lineNames).length;
  // On a line page, list the other lines a notice names; on the hub, all of them.
  const shown = line ? alert.lines.filter((l) => l !== line) : alert.lines;

  return (
    <li className="ci-callout ci-callout-warning !mt-3 first:!mt-0">
      <p className="m-0 whitespace-pre-line">{alertText(alert, locale)}</p>
      {alert.stations.length > 0 ? <p className="ci-today-note !mt-1">{fill(labels.stations, { list: alert.stations.join(", ") })}</p> : null}
      <p className="ci-today-note !mt-1">
        {when ? `${when}. ` : ""}
        {everyLine ? (
          labels.allLines
        ) : alert.lines.length === 0 ? (
          labels.noLine
        ) : shown.length > 0 ? (
          <>
            {fill(labels.alsoLines, { lines: "" })}
            {shown.map((id, i) => (
              <span key={id}>
                {i > 0 ? ", " : ""}
                {lineHrefs[id] ? <Link href={lineHrefs[id]!}>{lineNames[id] ?? id}</Link> : (lineNames[id] ?? id)}
              </span>
            ))}
          </>
        ) : null}
      </p>
    </li>
  );
}
