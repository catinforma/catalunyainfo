"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";

import { CATALONIA_ID, PLANNER_COPY, dayText, listDays, rangeText, ratioText, shortDay, type LeaveLocale } from "@/lib/programmatic/leave-2027/copy";
import { MAX_LEAVE, leaveAdvice } from "@/lib/programmatic/leave-2027/optimizer";
import type { PlannerData, PlannerItem } from "@/lib/programmatic/leave-2027/places";

/**
 * The 2027 leave planner: place, days of leave, two options, and the plan.
 * Server-rendered with `initial` (Barcelona, 5 days) so the page answers
 * without JavaScript; in the browser every change recomputes in place
 * (`optimizer.ts`, a few milliseconds) and is written to the URL hash
 * ("#p=sabadell&d=5", what the town pages link with), so a plan can be shared.
 */

interface State {
  place: string;
  leave: number;
  saturdays: boolean;
  council: boolean;
}

/** The leave to book: each day up to three, else the block's first and last working day. */
function takeText(take: readonly string[], locale: LeaveLocale): string {
  if (take.length <= 3) return listDays(take, locale);
  return PLANNER_COPY[locale].takeBlock(take.length, rangeText(take[0]!, take.at(-1)!, locale));
}

function unpack(text: string, year: number): string[] {
  return text ? text.split(",").map((d) => `${year}-${d.slice(0, 2)}-${d.slice(2)}`) : [];
}

function readHash(hash: string, known: (place: string) => boolean): Partial<State> {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const out: Partial<State> = {};
  const place = params.get("p");
  if (place && known(place)) out.place = place;
  const leave = Number(params.get("d"));
  if (Number.isInteger(leave) && leave >= 1 && leave <= MAX_LEAVE) out.leave = leave;
  if (params.has("s")) out.saturdays = params.get("s") === "1";
  if (params.has("c")) out.council = params.get("c") === "1";
  return out;
}

function writeHash(s: State, initial: State): string {
  const params = new URLSearchParams();
  params.set("p", s.place);
  if (s.leave !== initial.leave || s.place !== initial.place) params.set("d", String(s.leave));
  if (s.saturdays) params.set("s", "1");
  if (s.council) params.set("c", "1");
  // Keep the slash of "andalucia/sevilla" readable.
  return `#${params.toString().replace(/%2F/g, "/")}`;
}

export function LeavePlanner({ locale, data, initialPlace, initialLeave }: { locale: LeaveLocale; data: PlannerData; initialPlace: string; initialLeave: number }) {
  const t = PLANNER_COPY[locale];
  const id = useId();
  const { items, groupOf } = useMemo(() => {
    const map = new Map<string, PlannerItem>();
    const groups = new Map<string, string>();
    for (const g of data.groups) {
      for (const item of g.items) {
        map.set(item[0], item);
        groups.set(item[0], g.label);
      }
    }
    return { items: map, groupOf: groups };
  }, [data]);
  const initial: State = { place: initialPlace, leave: initialLeave, saturdays: false, council: false };
  const [state, setState] = useState<State>(initial);

  // The hash is only known in the browser: read it after mount, never during render.
  useEffect(() => {
    const fromHash = () => setState((s) => ({ ...s, ...readHash(window.location.hash, (p) => items.has(p)) }));
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [items]);

  function update(next: Partial<State>) {
    const merged = { ...state, ...next };
    setState(merged);
    window.history.replaceState(null, "", writeHash(merged, initial));
  }

  const item = items.get(state.place) ?? items.get(initialPlace)!;
  const [, label, ownPage, base, extra, councilDays, status] = item;
  // places.ts `itemPage`: "" = this language's town page, "*" = the Catalan one.
  const page = ownPage === "*" ? `/ca/festius/${item[0]}/` : ownPage || `${data.townPrefix}${item[0]}/`;
  const hasCouncil = status === "c" && councilDays.length > 0;
  const withCouncil = hasCouncil && state.council;
  // The React Compiler memoises these (a few milliseconds each, recomputed only when an input changes).
  const holidays = [...new Set([...unpack(data.bases[base] ?? "", data.year), ...unpack(extra, data.year), ...(withCouncil ? unpack(councilDays, data.year) : [])])].sort();
  const { plan, longest } = leaveAdvice({ year: data.year, holidays, leave: state.leave, workSaturdays: state.saturdays });
  const onWorkingDay = holidays.filter((d) => {
    const w = new Date(`${d}T12:00:00Z`).getUTCDay();
    return w !== 0 && (state.saturdays || w !== 6);
  });
  // A whole community or Catalonia reads as its name in the sentences ("El pla per a Catalunya").
  const whole = item[0] === CATALONIA_ID || item[0].endsWith("/all");
  const placeLabel = whole ? (groupOf.get(item[0]) ?? label) : label;
  const longestDiffers = longest && !plan.breaks.some((b) => b.from === longest.from && b.to === longest.to);

  return (
    <section className="ci-calc" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="ci-calc-title">
        {t.title}
      </h2>
      <p className="ci-calc-intro">{t.intro}</p>
      <noscript>
        <p className="ci-calc-note">{t.noscript}</p>
      </noscript>

      <div className="ci-calc-inputs">
        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-place`}>{t.place}</label>
          <select id={`${id}-place`} className="ci-field" value={item[0]} onChange={(e) => update({ place: e.target.value, council: false })}>
            {data.groups.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.items.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-leave`}>{t.leave}</label>
          <select id={`${id}-leave`} className="ci-field" value={state.leave} onChange={(e) => update({ leave: Number(e.target.value) })}>
            {Array.from({ length: MAX_LEAVE }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {t.leaveOption(n)}
              </option>
            ))}
          </select>
        </p>
        <div className="ci-calc-row">
          <label className="flex items-start gap-2 font-normal">
            <input type="checkbox" className="mt-1" checked={state.saturdays} onChange={(e) => update({ saturdays: e.target.checked })} />
            <span>{t.saturdays}</span>
          </label>
          {hasCouncil ? (
            <label className="flex items-start gap-2 font-normal">
              <input type="checkbox" className="mt-1" checked={state.council} onChange={(e) => update({ council: e.target.checked })} />
              <span>{t.council(unpack(councilDays, data.year).map((d) => shortDay(d, locale)).join(locale === "en" ? " and " : locale === "es" ? " y " : " i "))}</span>
            </label>
          ) : null}
        </div>
      </div>

      <div>
        {/* Only the totals are announced on a change; the plan below is there to read. */}
        <dl className="ci-calc-results" aria-live="polite">
          <div className="ci-calc-total">
            <dt>{t.daysOff}</dt>
            <dd className="ci-numeric">{plan.daysOff}</dd>
          </div>
          <div>
            <dt>{t.leaveUsed}</dt>
            <dd className="ci-numeric">{plan.used}</dd>
          </div>
          <div>
            <dt>{t.ratio}</dt>
            <dd className="ci-numeric">{ratioText(plan.ratio, locale)}</dd>
          </div>
          <div>
            <dt>{t.holidaysCounted}</dt>
            <dd className="ci-numeric">{onWorkingDay.length}</dd>
          </div>
        </dl>
        <p className="ci-calc-note">{withCouncil ? t.councilCounted(placeLabel) : t.status[status](placeLabel)}</p>
        {state.saturdays ? <p className="ci-calc-note">{t.saturdaysOn}</p> : null}

        <h3 className="mt-6">{t.planTitle(placeLabel, state.leave)}</h3>
        {plan.breaks.length === 0 ? (
          <p>{t.noBreaks}</p>
        ) : (
          <ol className="mt-2 space-y-3 pl-5">
            {plan.breaks.map((b) => (
              <li key={`${b.from}-${b.to}`}>
                <strong>{t.breakLine(rangeText(b.from, b.to, locale), b.days)}</strong>
                <br />
                {t.take}: {takeText(b.take, locale)} ({t.leaveOption(b.take.length)}).{" "}
                {b.holidays.length ? (
                  <>
                    {t.holidays}: {b.holidays.map((h) => shortDay(h, locale)).join(", ")}.{" "}
                  </>
                ) : null}
                <span className="text-[var(--color-muted)]">{t.perDay(ratioText(b.ratio, locale))}.</span>
              </li>
            ))}
          </ol>
        )}
        {plan.used < plan.leave && plan.breaks.length > 0 ? <p>{t.unused(plan.leave - plan.used)}</p> : null}

        {longestDiffers && longest ? (
          <>
            <h3 className="mt-6">{t.longestTitle}</h3>
            <p>{t.longestLine(state.leave, rangeText(longest.from, longest.to, locale), longest.days, takeText(longest.take, locale))}</p>
          </>
        ) : null}

        <details className="mt-4">
          <summary>{t.listTitle(holidays.length)}</summary>
          <ul className="mt-2">
            {holidays.map((d) => (
              <li key={d}>{dayText(d, locale)}</li>
            ))}
          </ul>
        </details>
        <p className="mt-4">
          <Link href={page}>{t.page(placeLabel)}</Link>
        </p>
      </div>
    </section>
  );
}
