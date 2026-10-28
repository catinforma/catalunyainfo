"use client";

import { useEffect, useMemo, useState } from "react";

import type { LiveLabels } from "@/lib/programmatic/weekend/copy";
import {
  AGENDA_ENDPOINT,
  dayLabel,
  fill,
  parsePayload,
  payloadIsCurrent,
  zoneView,
  type Category,
  type EventGroup,
  type LiveEvent,
  type WeekendPayload,
} from "@/lib/programmatic/weekend/live";
import type { ZoneFilter } from "@/lib/programmatic/weekend/zones";

/**
 * This weekend's activities in one zone, in the browser.
 *
 * The page around it is static: its HTML changes only when the weekend does
 * (the nightly cron rebuilds it then), so it cannot carry a list that the
 * Generalitat updates every day. The first render (server and no-JS) says
 * where the activities come from and links the official agenda; once mounted,
 * the component reads `/api/weekend/agenda/` (one CDN-cached answer for every
 * zone), keeps this zone's activities and groups them by kind. A list whose
 * weekend is over (the CDN can hold Sunday's answer for a few minutes after
 * midnight) is never shown as this weekend's.
 *
 * Doorway guardrail, per weekend: with fewer than MIN_EVENTS activities here
 * (the fairs calendar's fairs count too), the component says so and also
 * lists the wider area's, or links the Catalonia page when there is none.
 */

type State = { kind: "loading" } | { kind: "failed" } | { kind: "stale" } | { kind: "ready"; payload: WeekendPayload };

/** Enough to be useful, few enough that the page stays a guide, not a dump. */
const PER_GROUP = 12;

export interface WeekendLiveProps {
  locale: "ca" | "es";
  labels: LiveLabels;
  filter: ZoneFilter;
  wider: ZoneFilter | null;
  /** "a Girona" / "en la Costa Brava". */
  where: string;
  /** "de tota la província de Girona"; null when there is no wider zone. */
  widerText: string | null;
  capital: { ine: string; name: string } | null;
  /** Fairs of the official calendar in this zone and window (listed by the server). */
  fairs: number;
  category?: Category;
  /** False on the hub: no "only N activities" message. */
  guard?: boolean;
  agendaUrl: string;
  cataloniaHref: string;
}

function Item({ event, locale, free }: { event: LiveEvent; locale: "ca" | "es"; free: string }) {
  const place = [event.v, event.m].filter(Boolean).join(", ");
  return (
    <li className="ci-agenda-item">
      <p className="ci-agenda-title">
        {event.u ? (
          <a href={event.u} rel="noopener nofollow" target="_blank">
            {event.t}
          </a>
        ) : (
          event.t
        )}
        {event.f ? <span className="ci-agenda-free">{free}</span> : null}
      </p>
      <p className="ci-agenda-meta">
        {place}
        {place ? " · " : ""}
        {dayLabel(event.s, event.e, locale)}
      </p>
    </li>
  );
}

function Groups({ groups, labels, locale, capital, agendaUrl }: { groups: EventGroup[]; labels: LiveLabels; locale: "ca" | "es"; capital: string | null; agendaUrl: string }) {
  return (
    <>
      {groups.map((group) => (
        <div key={group.key}>
          <h3 className="ci-agenda-group">
            {group.key === "capital" ? fill(labels.capital, { capital: capital ?? "" }) : labels.categories[group.key]}
            <span className="ci-agenda-count">{group.events.length}</span>
          </h3>
          <ul className="ci-agenda-list">
            {group.events.slice(0, PER_GROUP).map((event) => (
              <Item key={`${group.key}-${event.id}`} event={event} locale={locale} free={labels.free} />
            ))}
          </ul>
          {group.events.length > PER_GROUP ? (
            <p className="ci-agenda-more">
              <a href={agendaUrl} rel="noopener" target="_blank">
                {fill(labels.more, { n: group.events.length - PER_GROUP })}
              </a>
            </p>
          ) : null}
        </div>
      ))}
    </>
  );
}

export function WeekendLive(props: WeekendLiveProps) {
  const { locale, labels, filter, wider, where, widerText, capital, fairs, category, guard = true, agendaUrl, cataloniaHref } = props;
  const [state, setState] = useState<State>({ kind: "loading" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // One state update after mount: the server render stays list-free.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    fetch(AGENDA_ENDPOINT, { headers: { accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        const payload = parsePayload(await response.json());
        if (!payload) throw new Error("shape");
        if (!cancelled) setState(payloadIsCurrent(payload, new Date()) ? { kind: "ready", payload } : { kind: "stale" });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "failed" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const view = useMemo(
    () => (state.kind === "ready" ? zoneView(state.payload, { filter, wider, fairs, capital: capital?.ine, category }) : null),
    [state, filter, wider, fairs, capital, category],
  );

  const official = (
    <a href={agendaUrl} rel="noopener" target="_blank">
      {labels.official}
    </a>
  );

  if (!mounted) {
    return (
      <div className="ci-agenda" aria-live="polite">
        <p className="ci-agenda-note !mt-0">
          {labels.fallback} {official}.
        </p>
      </div>
    );
  }
  if (state.kind === "loading") {
    return (
      <div className="ci-agenda" aria-live="polite" aria-busy="true">
        <p className="ci-agenda-note !mt-0">{labels.loading}</p>
      </div>
    );
  }
  if (state.kind === "failed" || state.kind === "stale" || !view) {
    return (
      <div className="ci-agenda" aria-live="polite">
        <p className="ci-callout ci-callout-warning m-0">
          {state.kind === "stale" ? labels.stale : labels.failed} {official}.
        </p>
      </div>
    );
  }

  const { payload } = state;
  const count = view.zoneEvents.length;
  const freeCount = view.zoneEvents.filter((e) => e.f).length;
  const showShort = guard && view.short;

  return (
    <div className="ci-agenda" aria-live="polite">
      <p className="ci-agenda-range !mt-0">{dayLabel(payload.window.from, payload.window.to, locale)}</p>
      {count > 0 ? <p className="ci-agenda-summary">{fill(labels.summary, { count, where, free: freeCount })}</p> : null}
      {showShort ? (
        <p className="ci-callout ci-callout-info mt-3">
          {widerText && view.widerEvents ? (
            fill(labels.short, { count, where, wider: widerText })
          ) : (
            <>
              {fill(labels.shortCatalonia, { count, where })} <a href={cataloniaHref}>{labels.catalonia}</a>
            </>
          )}
        </p>
      ) : null}
      {count === 0 && !showShort ? <p className="ci-agenda-note">{fill(labels.none, { where })}</p> : null}

      <Groups groups={view.groups} labels={labels} locale={locale} capital={capital?.name ?? null} agendaUrl={agendaUrl} />

      {showShort && widerText && view.widerEvents && view.widerEvents.length > 0 ? (
        <>
          <h3 className="ci-agenda-heading mt-6">{fill(labels.widerHeading, { wider: widerText })}</h3>
          <Groups groups={view.widerGroups} labels={labels} locale={locale} capital={null} agendaUrl={agendaUrl} />
        </>
      ) : null}

      <p className="ci-agenda-note">
        {labels.check} {official}.
      </p>
    </div>
  );
}
