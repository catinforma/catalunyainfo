"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";

import { MAX_AMOUNT, UNITS, countWorkingDays, deadline, type Calendar, type Reason, type RuleSet, type Unit } from "@/lib/programmatic/working-days/engine";
import {
  CALC_COPY,
  dateText,
  itemHolidays,
  itemInfo,
  itemPage,
  joinWords,
  shortDate,
  type WdData,
  type WdItem,
  type WdLocale,
} from "@/lib/programmatic/working-days/copy";

/**
 * The working-days calculator. Server-rendered with `initial` (the page's
 * example: 10 administrative días hábiles from 30 November 2026) so the
 * answer is in the HTML without JavaScript; in the browser every change
 * recomputes in place (engine.ts, under a millisecond) and is written to the
 * URL hash, so a result can be shared.
 */

type Mode = "deadline" | "count";

export interface WdState {
  mode: Mode;
  rules: RuleSet;
  place: string;
  /** Administrative mode: the body's place, when it is elsewhere (art. 30.6). "" = the same. */
  place2: string;
  saturdays: boolean;
  notified: string;
  amount: string;
  unit: Unit;
  from: string;
  to: string;
  includeFrom: boolean;
}

const RULES: readonly RuleSet[] = ["admin", "judicial", "general"];
const MODES: readonly Mode[] = ["deadline", "count"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function readHash(hash: string, known: (v: string) => boolean): Partial<WdState> {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const out: Partial<WdState> = {};
  const m = p.get("m");
  if (m && (MODES as readonly string[]).includes(m)) out.mode = m as Mode;
  const r = p.get("r");
  if (r && (RULES as readonly string[]).includes(r)) out.rules = r as RuleSet;
  const place = p.get("p");
  if (place && known(place)) out.place = place;
  const place2 = p.get("p2");
  if (place2 && known(place2)) out.place2 = place2;
  if (p.has("s")) out.saturdays = p.get("s") === "1";
  for (const [key, field] of [["n", "notified"], ["f", "from"], ["t", "to"]] as const) {
    const v = p.get(key);
    if (v && DATE.test(v)) out[field] = v;
  }
  const a = p.get("a");
  if (a && /^\d{1,3}$/.test(a)) out.amount = a;
  const u = p.get("u");
  if (u === "working" || u === "calendar" || u === "months") out.unit = u;
  if (p.has("i")) out.includeFrom = p.get("i") === "1";
  return out;
}

function writeHash(s: WdState): string {
  const p = new URLSearchParams();
  p.set("m", s.mode);
  p.set("r", s.rules);
  p.set("p", s.place);
  if (s.rules === "admin" && s.place2) p.set("p2", s.place2);
  if (s.rules === "general" && s.saturdays) p.set("s", "1");
  if (s.mode === "deadline") {
    p.set("n", s.notified);
    p.set("a", s.amount);
    p.set("u", s.unit);
  } else {
    p.set("f", s.from);
    p.set("t", s.to);
    if (!s.includeFrom) p.set("i", "0");
  }
  return `#${p.toString().replace(/%2F/g, "/")}`;
}

function SkippedList({ days, locale, reasonText }: { days: { date: string; reason: Reason }[]; locale: WdLocale; reasonText: Record<Reason, string> }) {
  return (
    <ul className="mt-2">
      {days.map((d) => (
        <li key={d.date}>
          {dateText(d.date, locale)}: {reasonText[d.reason]}
        </li>
      ))}
    </ul>
  );
}

export function WorkingDaysCalculator({ locale, data, initial }: { locale: WdLocale; data: WdData; initial: WdState }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const items = useMemo(() => {
    const map = new Map<string, { item: WdItem; group: string }>();
    for (const g of data.groups) for (const item of g.items) map.set(item[0], { item, group: g.label });
    return map;
  }, [data]);
  const [s, setS] = useState<WdState>(initial);
  const [otherOpen, setOtherOpen] = useState(Boolean(initial.place2));

  // The hash is only known in the browser: read it after mount, never during render.
  useEffect(() => {
    const fromHash = () => {
      const h = readHash(window.location.hash, (v) => items.has(v));
      setS((prev) => ({ ...prev, ...h }));
      if (h.place2) setOtherOpen(true);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [items]);

  function update(next: Partial<WdState>) {
    const merged = { ...s, ...next };
    if (!UNITS[merged.rules].includes(merged.unit)) merged.unit = "working";
    setS(merged);
    window.history.replaceState(null, "", writeHash(merged));
  }

  const entry = items.get(s.place) ?? items.get(initial.place)!;
  const second = s.rules === "admin" && otherOpen && s.place2 ? (items.get(s.place2) ?? null) : null;
  const holidays = new Set([...itemHolidays(data, entry.item), ...(second ? itemHolidays(data, second.item) : [])]);
  const cal: Calendar = { holidays, from: "2026-01-01", to: "2027-12-31" };
  const rules = { rules: s.rules, saturdays: s.saturdays };
  const amount = Number(s.amount);
  const due = s.mode === "deadline" ? deadline(s.notified, amount, s.unit, cal, rules) : null;
  const span = s.mode === "count" ? countWorkingDays(s.from, s.to, cal, rules, s.includeFrom) : null;
  const failed = due && !due.ok ? due : span && !span.ok ? span : null;

  const info = itemInfo(entry.item);
  const whole = info.kind === "e" || info.kind === "r";
  const placeLabel = whole && info.kind === "r" ? entry.group : entry.item[1];
  const placeOptions = data.groups.map((g) => (
    <optgroup key={g.label} label={g.label}>
      {g.items.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </optgroup>
  ));
  const list = [...itemHolidays(data, entry.item)];

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
        <fieldset className="ci-calc-row ci-calc-wide">
          <legend className="text-sm font-medium">{t.mode}</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {MODES.map((m) => (
              <label key={m} className="flex items-center gap-2 font-normal">
                <input type="radio" name={`${id}-mode`} value={m} checked={s.mode === m} onChange={() => update({ mode: m })} />
                <span>{t.modes[m]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="ci-calc-row ci-calc-wide">
          <legend className="text-sm font-medium">{t.rules}</legend>
          <div className="flex flex-col gap-2">
            {RULES.map((r) => (
              <label key={r} className="flex items-start gap-2 font-normal">
                <input type="radio" className="mt-1" name={`${id}-rules`} value={r} checked={s.rules === r} onChange={() => update({ rules: r })} />
                <span>
                  {t.rulesName[r]}
                  <span className="block text-sm text-[var(--color-muted)]">{t.rulesHelp[r]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-place`}>{t.place}</label>
          <select id={`${id}-place`} className="ci-field" value={entry.item[0]} onChange={(e) => update({ place: e.target.value })} aria-describedby={`${id}-place-help`}>
            {placeOptions}
          </select>
          <span id={`${id}-place-help`} className="ci-calc-note">
            {t.placeHelp[s.rules]}
          </span>
        </p>
        {s.rules === "admin" ? (
          <div className="ci-calc-row ci-calc-wide">
            <label className="flex items-start gap-2 font-normal">
              <input type="checkbox" className="mt-1" checked={otherOpen} onChange={(e) => {
                  setOtherOpen(e.target.checked);
                  if (!e.target.checked) update({ place2: "" });
                }} />
              <span>{t.otherPlace}</span>
            </label>
            {otherOpen ? (
              <>
                <label htmlFor={`${id}-place2`}>{t.secondPlace}</label>
                <select id={`${id}-place2`} className="ci-field" value={s.place2} onChange={(e) => update({ place2: e.target.value })} aria-describedby={`${id}-place2-help`}>
                  <option value="">{t.secondPlaceNone}</option>
                  {placeOptions}
                </select>
                <span id={`${id}-place2-help`} className="ci-calc-note">
                  {t.secondPlaceHelp}
                </span>
              </>
            ) : null}
          </div>
        ) : null}
        {s.rules === "general" ? (
          <div className="ci-calc-row ci-calc-wide">
            <label className="flex items-start gap-2 font-normal">
              <input type="checkbox" className="mt-1" checked={s.saturdays} onChange={(e) => update({ saturdays: e.target.checked })} />
              <span>{t.saturdays}</span>
            </label>
          </div>
        ) : null}

        {s.mode === "deadline" ? (
          <>
            <p className="ci-calc-row ci-calc-wide">
              <label htmlFor={`${id}-notified`}>{t.notified}</label>
              <input id={`${id}-notified`} type="date" className="ci-field" min="2025-12-31" max="2027-12-30" value={s.notified} onChange={(e) => update({ notified: e.target.value })} aria-describedby={`${id}-notified-help`} />
              <span id={`${id}-notified-help`} className="ci-calc-note">
                {t.notifiedHelp}
              </span>
            </p>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-amount`}>{t.amount}</label>
              <input
                id={`${id}-amount`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className="ci-field"
                value={s.amount}
                onChange={(e) => update({ amount: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                aria-describedby={`${id}-amount-help`}
              />
              <span id={`${id}-amount-help`} className="ci-calc-note">
                {t.maxText(MAX_AMOUNT[s.unit])}
              </span>
            </p>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-unit`}>{t.unit}</label>
              <select id={`${id}-unit`} className="ci-field" value={s.unit} onChange={(e) => update({ unit: e.target.value as Unit })}>
                {UNITS[s.rules].map((u) => (
                  <option key={u} value={u}>
                    {t.unitName[u]}
                  </option>
                ))}
              </select>
            </p>
            {s.rules === "judicial" ? <p className="ci-calc-note ci-calc-wide">{t.judicialUnitNote}</p> : null}
          </>
        ) : (
          <>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-from`}>{t.from}</label>
              <input id={`${id}-from`} type="date" className="ci-field" min="2026-01-01" max="2027-12-31" value={s.from} onChange={(e) => update({ from: e.target.value })} />
            </p>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-to`}>{t.to}</label>
              <input id={`${id}-to`} type="date" className="ci-field" min="2026-01-01" max="2027-12-31" value={s.to} onChange={(e) => update({ to: e.target.value })} />
            </p>
            <div className="ci-calc-row ci-calc-wide">
              <label className="flex items-start gap-2 font-normal">
                <input type="checkbox" className="mt-1" checked={s.includeFrom} onChange={(e) => update({ includeFrom: e.target.checked })} />
                <span>{t.includeFrom}</span>
              </label>
            </div>
          </>
        )}
      </div>

      <div aria-live="polite">
        {failed ? (
          <p className="ci-calc-note" role="status">
            {t.errors[failed.error]}
          </p>
        ) : due?.ok ? (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{t.lastDay}</dt>
                <dd>{dateText(due.last, locale)}</dd>
              </div>
              <div>
                <dt>{t.firstDay}</dt>
                <dd>{dateText(due.first, locale)}</dd>
              </div>
              <div>
                <dt>{t.workingInside}</dt>
                <dd className="ci-numeric">{due.working}</dd>
              </div>
              <div>
                <dt>{t.calendarInside}</dt>
                <dd className="ci-numeric">{due.calendar}</dd>
              </div>
            </dl>
            {due.movedOver.length ? (
              <p className="ci-calc-note">
                {t.movedLine(
                  shortDate(due.nominal, locale),
                  joinWords([...new Set(due.movedOver.map((d) => t.reason[d.reason]))], locale),
                )}
              </p>
            ) : null}
            {due.graceDay ? <p className="ci-calc-note">{t.grace(dateText(due.graceDay, locale))}</p> : null}
            {due.skipped.length ? (
              <details className="mt-3">
                <summary>{t.skippedTitle(due.skipped.length)}</summary>
                <SkippedList days={due.skipped} locale={locale} reasonText={t.reason} />
              </details>
            ) : null}
          </>
        ) : span?.ok ? (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{t.workingCount}</dt>
                <dd className="ci-numeric">{span.working}</dd>
              </div>
              <div>
                <dt>{t.calendarCount}</dt>
                <dd className="ci-numeric">{span.calendar}</dd>
              </div>
              <div>
                <dt>{t.nonWorkingCount}</dt>
                <dd className="ci-numeric">{span.skipped.length}</dd>
              </div>
            </dl>
            {span.skipped.length ? (
              <details className="mt-3">
                <summary>{t.skippedTitle(span.skipped.length)}</summary>
                <SkippedList days={span.skipped} locale={locale} reasonText={t.reason} />
              </details>
            ) : null}
          </>
        ) : null}
      </div>

      <h3 className="mt-6 text-base">{t.countedTitle}</h3>
      <ul className="text-sm">
        {t.counted(info, placeLabel).map((line) => (
          <li key={line}>{line}</li>
        ))}
        {second ? <li>{t.secondPlaceHelp}</li> : null}
      </ul>
      <details className="mt-2 text-sm">
        <summary>{t.holidaysTitle(list.length)}</summary>
        <ul className="mt-2">
          {list.map((d) => (
            <li key={d}>{dateText(d, locale)}</li>
          ))}
        </ul>
      </details>
      <p className="mt-3 text-sm">
        <Link href={itemPage(data, entry.item)}>{t.placePage(placeLabel)}</Link>
      </p>
      <p className="ci-calc-note">{t.disclaimer}</p>
    </section>
  );
}
