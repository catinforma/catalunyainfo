"use client";

import Link from "next/link";
import { Fragment, useEffect, useState, type ReactNode } from "react";

import { freshness, type LivePayload as FuelPayload } from "@/lib/programmatic/fuel/live";
import { addDays, capitalize, dayMonth, longDate, weekdayDayMonth, weekdayName } from "@/lib/programmatic/holidays/format";
import { todayInMadrid } from "@/lib/programmatic/holidays/status";
import {
  LEVELS_ENDPOINT,
  formatDate as formatReadingDate,
  formatNumber,
  mergeReadings,
  parsePayload as parseLevels,
  readingAge,
  type Reading,
} from "@/lib/programmatic/reservoirs/live";
import { liveLabels } from "@/lib/programmatic/rodalies/labels";
import { ALERTS_ENDPOINT, liveView, parsePayload as parseAlerts } from "@/lib/programmatic/rodalies/live";
import type { AlertsPayload, LineId } from "@/lib/programmatic/rodalies/types";
import { TODAY_LABELS } from "@/lib/programmatic/today/labels";
import {
  FUEL_ENDPOINT,
  fill,
  formatRange,
  fuelMedians,
  holidayDay,
  inSeason,
  joinList,
  nextBridge,
  nextLongWeekend,
  nextRegional,
  nextStrike,
  noticeSummary,
  reservoirTotal,
  strikesListStale,
  strikesOn,
  weekendFor,
  type HolidayData,
  type HolidayDay,
  type LocalPlace,
  type TodayLocale,
  type TodayStrike,
} from "@/lib/programmatic/today/logic";

/**
 * The daily answers of "Avui a Catalunya", computed in the browser.
 *
 * Every island renders its server fallback (`children`: a dated fact or a
 * pointer to the source) on the server and on the first client render, so
 * the cached HTML never says what today is. After mount it reads the date in
 * Europe/Madrid (and again every minute, so a page left open past midnight
 * moves on) and, for the live items, one CDN-cached endpoint each.
 */

/** Today in Catalonia, after mount only; null during the server render and hydration. */
function useMadridToday(): string | null {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    const read = () => setToday(todayInMadrid(new Date()));
    // One state update after mount (and one a minute): the server render stays date-free.
    read();
    const timer = window.setInterval(read, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return today;
}

/** One fetch per endpoint per page view, shared by every island that needs it. */
const pending = new Map<string, Promise<unknown>>();
function loadJson(url: string): Promise<unknown> {
  let request = pending.get(url);
  if (!request) {
    request = fetch(url, { headers: { accept: "application/json" } }).then((response) => {
      if (!response.ok && response.status !== 503) throw new Error(String(response.status));
      return response.json() as Promise<unknown>;
    });
    pending.set(url, request);
  }
  return request;
}

type Loaded<T> = { kind: "idle" } | { kind: "loading" } | { kind: "done"; value: T; now: Date };

function useEndpoint<T>(url: string, parse: (json: unknown) => T | null): Loaded<T | null> {
  const [state, setState] = useState<Loaded<T | null>>({ kind: "idle" });
  useEffect(() => {
    let active = true;
    // The request and the clock run after mount only: the server render stays timeless.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ kind: "loading" });
    loadJson(url)
      .then((json) => parse(json))
      .catch(() => null)
      .then((value) => {
        if (active) setState({ kind: "done", value, now: new Date() });
      });
    return () => {
      active = false;
    };
  }, [url, parse]);
  return state;
}

function Answer({ children, tone = "neutral" }: { children: ReactNode; tone?: "yes" | "no" | "neutral" | "warn" }) {
  return <p className={`ci-brief-answer is-${tone}`}>{children}</p>;
}

function Loading({ text }: { text: string }) {
  return (
    <p className="ci-brief-answer is-neutral" aria-busy="true">
      {text}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* Date                                                                       */
/* -------------------------------------------------------------------------- */

export function TodayDate({ locale, children }: { locale: TodayLocale; children: ReactNode }) {
  const today = useMadridToday();
  const t = TODAY_LABELS[locale];
  if (!today) return <>{children}</>;
  return (
    <p className="ci-brief-date" aria-live="polite">
      <time dateTime={today}>{fill(t.today, { date: longDate(today, locale) })}</time> <span className="ci-brief-tz">{t.timezone}</span>
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* Holidays                                                                   */
/* -------------------------------------------------------------------------- */

const SHOWN_PLACES = 8;

function placeName(place: LocalPlace): string {
  return place.p ? `${place.n} (${place.p})` : place.n;
}

function PlaceLinks({ places, locale }: { places: LocalPlace[]; locale: TodayLocale }) {
  const shown = places.slice(0, SHOWN_PLACES);
  const rest = places.length - shown.length;
  return (
    <>
      {shown.map((place, index) => (
        <Fragment key={`${place.n}-${place.p ?? ""}`}>
          {index > 0 ? ", " : " "}
          {place.h ? <Link href={place.h}>{placeName(place)}</Link> : placeName(place)}
        </Fragment>
      ))}
      {rest > 0 ? ` ${fill(TODAY_LABELS[locale].holiday.more, { n: rest })}` : ""}
    </>
  );
}

function tomorrowText(day: HolidayDay, locale: TodayLocale): string {
  const h = TODAY_LABELS[locale].holiday;
  const year = day.date.slice(0, 4);
  if (!day.regionalKnown) return fill(h.tomorrowUnknown, { year });
  if (day.regional) return fill(h.tomorrowRegional, { name: day.regional.n });
  if (day.local.length > 0) {
    const names = day.local.slice(0, 3).map(placeName);
    const rest = day.local.length - names.length;
    return fill(h.tomorrowLocal, { list: rest > 0 ? `${names.join(", ")} ${fill(h.more, { n: rest })}` : joinList(names, locale) });
  }
  if (!day.localKnown) return fill(h.tomorrowLocalUnknown, { year });
  return h.tomorrowNone;
}

function DatePageLink({ iso, data, locale }: { iso: string; data: Pick<HolidayData, "datePages">; locale: TodayLocale }) {
  const page = data.datePages[iso];
  if (!page) return null;
  return <Link href={page.href}>{fill(TODAY_LABELS[locale].holiday.datePage, { day: dayMonth(iso, locale) })}</Link>;
}

export function HolidayToday({ locale, data, children }: { locale: TodayLocale; data: HolidayData; children: ReactNode }) {
  const today = useMadridToday();
  if (!today) return <>{children}</>;
  const h = TODAY_LABELS[locale].holiday;
  const day = holidayDay(today, data);
  const tomorrow = holidayDay(addDays(today, 1), data);
  const year = today.slice(0, 4);

  let answer: ReactNode;
  let tone: "yes" | "no" | "neutral" = "no";
  if (!day.regionalKnown) {
    answer = fill(h.unknown, { year });
    tone = "neutral";
  } else if (day.regional) {
    answer = `${fill(h.regional, { name: day.regional.n })}${day.regional.xa ? ` ${h.exceptAran}` : ""}`;
    tone = "yes";
  } else if (day.aranOnly) {
    answer = fill(h.aranOnly, { name: day.aranOnly.n });
    tone = "yes";
  } else if (day.weekend) {
    answer = fill(h.weekend, { weekday: weekdayName(today, locale) });
  } else {
    answer = h.working;
  }

  let local: ReactNode;
  if (!day.localKnown) local = fill(h.localUnknown, { year });
  else if (day.local.length === 0) local = fill(h.localNone, { towns: data.towns });
  else
    local = (
      <>
        {h.localSome}
        <PlaceLinks places={day.local} locale={locale} />.
      </>
    );

  return (
    <div aria-live="polite">
      <Answer tone={tone}>{answer}</Answer>
      <p className="ci-brief-line">
        {local} <DatePageLink iso={today} data={data} locale={locale} />
      </p>
      <dl className="ci-brief-facts">
        <div>
          <dt>{h.tomorrow}</dt>
          <dd>
            {capitalize(tomorrowText(tomorrow, locale))}. <DatePageLink iso={tomorrow.date} data={data} locale={locale} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Strikes                                                                    */
/* -------------------------------------------------------------------------- */

function StrikeLinks({ strikes, locale }: { strikes: TodayStrike[]; locale: TodayLocale }) {
  return (
    <>
      {strikes.map((strike, index) => (
        <Fragment key={strike.id}>
          {index > 0 ? (index === strikes.length - 1 ? (locale === "ca" ? " i " : locale === "es" ? " y " : " and ") : ", ") : null}
          <Link href={strike.href}>{strike.title}</Link>
        </Fragment>
      ))}
    </>
  );
}

export function StrikesToday({
  locale,
  strikes,
  asOf,
  asOfText,
  children,
}: {
  locale: TodayLocale;
  strikes: TodayStrike[];
  asOf: string;
  /** "el 30 d'octubre de 2026": the list's date as the page prints it. */
  asOfText: string;
  children: ReactNode;
}) {
  const today = useMadridToday();
  if (!today) return <>{children}</>;
  const s = TODAY_LABELS[locale].strikes;
  const now = strikesOn(today, strikes);
  const tomorrow = strikesOn(addDays(today, 1), strikes);
  const next = nextStrike(addDays(today, 1), strikes);
  const [before, after] = s.today.split("{title}");

  return (
    <div aria-live="polite">
      {now.length > 0 ? (
        <>
          <Answer tone="yes">
            {before}
            <StrikeLinks strikes={now} locale={locale} />
            {after}
          </Answer>
          {now.map((strike) => (
            <p key={strike.id} className="ci-brief-line">
              {strike.ms}.
            </p>
          ))}
        </>
      ) : (
        <Answer tone="no">{s.todayNone}</Answer>
      )}
      <dl className="ci-brief-facts">
        <div>
          <dt>{s.tomorrow}</dt>
          <dd>
            {tomorrow.length > 0 ? (
              <>
                <StrikeLinks strikes={tomorrow} locale={locale} />. {tomorrow.map((strike) => `${strike.ms}.`).join(" ")}
              </>
            ) : (
              `${capitalize(s.tomorrowNone)}.`
            )}
          </dd>
        </div>
        <div>
          <dt>{s.next}</dt>
          <dd>
            {next ? (
              <>
                <Link href={next.strike.href}>{capitalize(next.strike.title)}</Link>, {weekdayDayMonth(next.date, locale)}.
              </>
            ) : (
              `${capitalize(s.nextNone)}.`
            )}
          </dd>
        </div>
      </dl>
      <p className="ci-brief-note">
        {fill(s.asOf, { date: asOfText })}
        {strikesListStale(today, asOf) ? ` ${s.stale}` : ""}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Rodalies                                                                   */
/* -------------------------------------------------------------------------- */

export function RodaliesToday({
  locale,
  lineNames,
  lineHrefs,
  children,
}: {
  locale: TodayLocale;
  lineNames: Record<string, string>;
  lineHrefs: Partial<Record<LineId, string>>;
  children: ReactNode;
}) {
  const state = useEndpoint<AlertsPayload>(ALERTS_ENDPOINT, parseAlerts);
  const r = TODAY_LABELS[locale].rodalies;
  if (state.kind === "idle") return <>{children}</>;
  if (state.kind === "loading") return <Loading text={r.loading} />;
  const shared = liveLabels(locale, null);
  const view = liveView(state.value, state.now, null);
  if (view.kind !== "ok") return <Answer tone="warn">{view.kind === "stale" ? shared.stale : shared.failed}</Answer>;
  const summary = noticeSummary(view.alerts);
  const source = shared.sourceNames[view.source];
  const sourceLine = view.minutes < 1 ? fill(shared.sourceNow, { source }) : fill(shared.sourceAgo, { source, n: view.minutes });
  return (
    <div aria-live="polite">
      <Answer tone={summary.count > 0 ? "yes" : "no"}>{summary.count === 0 ? r.none : summary.count === 1 ? r.one : fill(r.many, { n: summary.count })}</Answer>
      {summary.lines.length > 0 ? (
        <p className="ci-brief-line">
          {summary.everyLine ? (
            r.everyLine
          ) : (
            <>
              {r.lines}{" "}
              {summary.lines.map((id, index) => (
                <Fragment key={id}>
                  {index > 0 ? ", " : null}
                  {lineHrefs[id] ? <Link href={lineHrefs[id]!}>{lineNames[id] ?? id}</Link> : (lineNames[id] ?? id)}
                </Fragment>
              ))}
              .
            </>
          )}
        </p>
      ) : null}
      <p className="ci-brief-note">{sourceLine}.</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reservoirs                                                                 */
/* -------------------------------------------------------------------------- */

export function ReservoirsToday({ locale, own, children }: { locale: TodayLocale; own: Reading[]; children: ReactNode }) {
  const state = useEndpoint(LEVELS_ENDPOINT, parseLevels);
  const t = TODAY_LABELS[locale].reservoirs;
  if (state.kind === "idle") return <>{children}</>;
  if (state.kind === "loading") return <Loading text={t.loading} />;
  const merged = mergeReadings(state.value, own);
  const live = reservoirTotal(merged.readings);
  const total = live ?? reservoirTotal(own);
  if (!total) return <>{children}</>;
  const pct = `${formatNumber(total.percent, locale)}${locale === "en" ? "%" : " %"}`;
  const age = readingAge(total.date, state.now);
  const when = age === "today" ? t.today : age === "yesterday" ? t.yesterday : fill(t.on, { date: formatReadingDate(total.date, locale) });
  return (
    <div aria-live="polite">
      <Answer>
        {fill(t.total, { pct })} <span className="ci-brief-when">({when})</span>
      </Answer>
      {age === "stale" ? <p className="ci-brief-line">{fill(t.stale, { date: formatReadingDate(total.date, locale) })}</p> : null}
      {!live || merged.live === 0 ? <p className="ci-brief-note">{t.snapshot}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Fuel                                                                       */
/* -------------------------------------------------------------------------- */

function parseFuel(json: unknown): FuelPayload | null {
  const p = json as Partial<FuelPayload> | null;
  if (!p || typeof p !== "object" || typeof p.fecha !== "string" || !Array.isArray(p.stations)) return null;
  return p as FuelPayload;
}

export function FuelToday({ locale, children }: { locale: TodayLocale; children: ReactNode }) {
  const state = useEndpoint(FUEL_ENDPOINT, parseFuel);
  const t = TODAY_LABELS[locale].fuel;
  if (state.kind === "idle") return <>{children}</>;
  if (state.kind === "loading") return <Loading text={t.loading} />;
  const payload = state.value;
  if (!payload) return <Answer tone="warn">{t.failed}</Answer>;
  const [date = payload.fecha, clock = ""] = payload.fecha.split(" ");
  const time = clock.slice(0, 5);
  const fresh = freshness(payload.updated, state.now.getTime());
  if (fresh === "stale") return <Answer tone="warn">{fill(t.stale, { when: time ? `${date} ${time}` : date })}</Answer>;
  const medians = fuelMedians(payload.stations);
  const intl = locale === "en" ? "en-GB" : `${locale}-ES`;
  const number = new Intl.NumberFormat(intl, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const price = (value: number | null) => (value === null ? "—" : locale === "en" ? `€${number.format(value)}/l` : `${number.format(value)} €/l`);
  const count = Math.max(medians.e95.count, medians.goa.count);
  if (count === 0) return <Answer tone="warn">{t.failed}</Answer>;
  return (
    <div aria-live="polite">
      <Answer>
        {t.e95}: {price(medians.e95.median)} · {t.goa}: {price(medians.goa.median)}
      </Answer>
      <p className="ci-brief-note">
        <time dateTime={payload.updated ?? undefined}>{fill(t.median, { n: new Intl.NumberFormat(intl).format(count), date, time })}</time>
      </p>
      {fresh === "old" ? <p className="ci-brief-line">{fill(t.old, { date, time })}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Weekend                                                                    */
/* -------------------------------------------------------------------------- */

export function WeekendToday({
  locale,
  data,
  children,
}: {
  locale: TodayLocale;
  data: Pick<HolidayData, "regional" | "datePages">;
  children: ReactNode;
}) {
  const today = useMadridToday();
  if (!today) return <>{children}</>;
  const w = TODAY_LABELS[locale].weekend;
  const span = weekendFor(today, data);
  const inside = data.regional.filter((d) => !d.ao && d.d >= span.from && d.d <= span.to).map((d) => d.n);
  const range = formatRange(span.from, span.to, locale);
  const next = nextRegional(today, data);
  const long = nextLongWeekend(today, data);
  const bridge = nextBridge(today, data);
  const showBridge = bridge && (!long || bridge.from < long.from);

  return (
    <div aria-live="polite">
      <Answer>{span.long ? fill(w.long, { range, names: joinList(inside, locale) }) : capitalize(fill(w.current, { range }))}</Answer>
      <dl className="ci-brief-facts">
        <div>
          <dt>{w.nextHoliday}</dt>
          <dd>
            {next
              ? `${capitalize(
                  next.inDays === 1
                    ? fill(w.inOneDay, { name: next.day.n })
                    : fill(w.nextHolidayValue, { name: next.day.n, date: weekdayDayMonth(next.day.d, locale), n: next.inDays }),
                )}.`
              : `${capitalize(w.none)}.`}
          </dd>
        </div>
        {showBridge && bridge ? (
          <div>
            <dt>{w.bridge}</dt>
            <dd>
              {capitalize(
                fill(w.bridgeValue, {
                  name: bridge.holidays[0]?.n ?? "",
                  weekday: weekdayName(bridge.holidays[0]?.d ?? bridge.to, locale),
                  bridge: weekdayDayMonth(bridge.bridge ?? bridge.from, locale),
                  range: formatRange(bridge.from, bridge.to, locale),
                }),
              )}
              . {bridge.bridge ? <DatePageLink iso={bridge.bridge} data={data} locale={locale} /> : null}
            </dd>
          </div>
        ) : null}
        <div>
          <dt>{w.nextLong}</dt>
          <dd>
            {long ? `${capitalize(formatRange(long.from, long.to, locale))} (${joinList(long.holidays.map((d) => d.n), locale)}).` : `${capitalize(w.none)}.`}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Snow                                                                       */
/* -------------------------------------------------------------------------- */

export function SnowToday({ locale, season, children }: { locale: TodayLocale; season: { from: string; to: string }; children: ReactNode }) {
  const today = useMadridToday();
  if (!today) return <>{children}</>;
  const t = TODAY_LABELS[locale].snow;
  if (inSeason(today, season.from, season.to)) return <Answer>{t.inSeason}</Answer>;
  return <Answer tone="neutral">{fill(t.outSeason, { from: dayMonth(`2026-${season.from}`, locale), to: dayMonth(`2027-${season.to}`, locale) })}</Answer>;
}
