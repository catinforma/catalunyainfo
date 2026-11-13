"use client";

import { useEffect, useId, useState } from "react";

import { CALC_COPY, fillFigures, money, parseAmount, percent, readHash, writeHash, type NetLocale } from "@/lib/programmatic/net-salary/copy";
import { calculateNetSalary, type AgeBand, type Contract, type Disability, type FamilySituation, type SalaryInput } from "@/lib/programmatic/net-salary/engine";
import { REGIONS, regionById } from "@/lib/programmatic/net-salary/regions";
import { FORAL_LINKS } from "@/lib/programmatic/net-salary/rules-2026";

/**
 * The net salary calculator. Server-rendered with the page's default example
 * (30,000 € in Catalonia, single, no children), so the result is in the HTML
 * without JavaScript; in the browser every change recomputes in place
 * (`engine.ts`, well under a millisecond) and is written to the URL hash, so
 * a result can be shared.
 */

const MAX_CHILDREN = 10;

export function NetSalaryCalculator({ locale, initial }: { locale: NetLocale; initial: SalaryInput }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [input, setInput] = useState<SalaryInput>(initial);
  const [grossText, setGrossText] = useState(() => String(initial.gross));

  // The hash is only known in the browser: read it after mount, never during render.
  useEffect(() => {
    const fromHash = () => {
      if (!window.location.hash) return;
      const next = readHash(window.location.hash, initial, (r) => Boolean(regionById(r)));
      setInput(next);
      setGrossText(String(next.gross));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [initial]);

  function update(patch: Partial<SalaryInput>) {
    const next = { ...input, ...patch };
    if (next.childrenUnder3 > next.children) next.childrenUnder3 = next.children;
    setInput(next);
    window.history.replaceState(null, "", writeHash(next));
  }

  const r = calculateNetSalary(input);
  const region = regionById(input.region);
  const foral = region?.regime === "foral" ? FORAL_LINKS[region.id as keyof typeof FORAL_LINKS] : null;
  const p = r.input.payments;
  const f = (s: string) => fillFigures(s, locale);

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
        <p className="ci-calc-row">
          <label htmlFor={`${id}-gross`}>{t.gross}</label>
          <span className="ci-calc-number">
            <input
              id={`${id}-gross`}
              className="ci-field"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={grossText}
              aria-describedby={`${id}-gross-hint`}
              onChange={(e) => {
                setGrossText(e.target.value);
                update({ gross: parseAmount(e.target.value) });
              }}
            />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-gross-hint`} className="ci-calc-note">
            {t.grossHint}
          </span>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-payments`}>{t.payments}</label>
          <select id={`${id}-payments`} className="ci-field" value={input.payments} onChange={(e) => update({ payments: Number(e.target.value) === 12 ? 12 : 14 })}>
            {([14, 12] as const).map((n) => (
              <option key={n} value={n}>
                {t.paymentsOption(n)}
              </option>
            ))}
          </select>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-region`}>{t.region}</label>
          <select id={`${id}-region`} className="ci-field" value={input.region} onChange={(e) => update({ region: e.target.value })}>
            {REGIONS.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.names[locale]}
              </option>
            ))}
          </select>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-age`}>{t.age}</label>
          <select id={`${id}-age`} className="ci-field" value={input.age} onChange={(e) => update({ age: e.target.value as AgeBand })}>
            {(Object.keys(t.ageOptions) as AgeBand[]).map((a) => (
              <option key={a} value={a}>
                {t.ageOptions[a]}
              </option>
            ))}
          </select>
        </p>

        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-family`}>{t.family}</label>
          <select id={`${id}-family`} className="ci-field" value={input.family} onChange={(e) => update({ family: Number(e.target.value) as FamilySituation, ...(e.target.value === "1" ? { childrenWhole: true } : {}) })}>
            {([1, 2, 3] as const).map((s) => (
              <option key={s} value={s}>
                {t.familyOptions[s]}
              </option>
            ))}
          </select>
          {input.family === 1 && input.children === 0 ? <span className="ci-calc-note">{t.family1NeedsChild}</span> : null}
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-children`}>{t.children}</label>
          <select id={`${id}-children`} className="ci-field" value={input.children} onChange={(e) => update({ children: Number(e.target.value) })}>
            {Array.from({ length: MAX_CHILDREN + 1 }, (_, n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-under3`}>{t.childrenUnder3}</label>
          <select id={`${id}-under3`} className="ci-field" value={input.childrenUnder3} disabled={input.children === 0} onChange={(e) => update({ childrenUnder3: Number(e.target.value) })}>
            {Array.from({ length: input.children + 1 }, (_, n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </p>

        {input.children > 0 ? (
          <div className="ci-calc-row ci-calc-wide">
            <label className="flex items-start gap-2 font-normal">
              <input type="checkbox" className="mt-1" checked={input.childrenWhole} onChange={(e) => update({ childrenWhole: e.target.checked })} />
              <span>{t.childrenWhole}</span>
            </label>
          </div>
        ) : null}

        <p className="ci-calc-row">
          <label htmlFor={`${id}-disability`}>{t.disability}</label>
          <select id={`${id}-disability`} className="ci-field" value={input.disability} onChange={(e) => update({ disability: e.target.value as Disability })}>
            {(Object.keys(t.disabilityOptions) as Disability[]).map((d) => (
              <option key={d} value={d}>
                {t.disabilityOptions[d]}
              </option>
            ))}
          </select>
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-contract`}>{t.contract}</label>
          <select id={`${id}-contract`} className="ci-field" value={input.contract} onChange={(e) => update({ contract: e.target.value as Contract })}>
            {(Object.keys(t.contractOptions) as Contract[]).map((c) => (
              <option key={c} value={c}>
                {t.contractOptions[c]}
              </option>
            ))}
          </select>
        </p>

        <fieldset className="ci-calc-row ci-calc-wide m-0 border-0 p-0">
          <legend className="mb-1 text-sm font-medium">{t.more}</legend>
          <label className="flex items-start gap-2 font-normal">
            <input type="checkbox" className="mt-1" checked={Boolean(input.mobility)} onChange={(e) => update({ mobility: e.target.checked })} />
            <span>{t.mobility}</span>
          </label>
          <label className="flex items-start gap-2 font-normal">
            <input type="checkbox" className="mt-1" checked={Boolean(input.housingLoan)} onChange={(e) => update({ housingLoan: e.target.checked })} />
            <span>{f(t.housingLoan)}</span>
          </label>
        </fieldset>
      </div>

      <div aria-live="polite">
        {foral ? (
          <div className="ci-calc-results">
            <p className="ci-calc-note text-sm">{t.foral}</p>
            <ul className="ci-calc-note">
              {foral.map((l) => (
                <li key={l.url}>
                  <a href={l.url} rel="noopener" target="_blank">
                    {l.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <h3 className="ci-calc-title mt-4">{t.results}</h3>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{t.netPayment(p)}</dt>
                <dd className="ci-numeric">{money(r.net.perPayment, locale)}</dd>
              </div>
              {r.net.extraPayment !== null ? (
                <div>
                  <dt>{t.extraPayment}</dt>
                  <dd className="ci-numeric">{money(r.net.extraPayment, locale)}</dd>
                </div>
              ) : null}
              <div>
                <dt>{t.netAnnual}</dt>
                <dd className="ci-numeric">{money(r.net.annual, locale)}</dd>
              </div>
              <div>
                <dt>{t.grossAnnual}</dt>
                <dd className="ci-numeric">{money(r.input.gross, locale)}</dd>
              </div>
              <div>
                <dt>{t.ss}</dt>
                <dd className="ci-numeric">− {money(r.ss.annual, locale)}</dd>
              </div>
              {r.ss.lines.map((l) => (
                <div key={l.key} className="ps-4 text-[var(--color-muted)]">
                  <dt>
                    {t.ssLines[l.key]}
                    {l.rate !== null ? ` (${percent(l.rate, locale)})` : ""}
                  </dt>
                  <dd className="ci-numeric">{money(l.annual, locale)}</dd>
                </div>
              ))}
              <div>
                <dt>
                  {t.irpf} ({percent(r.irpf.rate, locale)})
                </dt>
                <dd className="ci-numeric">− {money(r.irpf.annual, locale)}</dd>
              </div>
              <div>
                <dt>{t.effective}</dt>
                <dd className="ci-numeric">{percent(r.effectiveRate, locale)}</dd>
              </div>
            </dl>
            {r.irpf.exempt ? <p className="ci-calc-note">{t.exempt}</p> : null}
            {r.irpf.limited ? <p className="ci-calc-note">{t.limited}</p> : null}
            {r.irpf.minimumRateApplied ? <p className="ci-calc-note">{t.minimumRate}</p> : null}
            {r.irpf.reducedByCeuta ? <p className="ci-calc-note">{t.ceuta}</p> : null}
            {r.ss.capped ? <p className="ci-calc-note">{f(t.capped)}</p> : null}
            {r.ss.belowMinimum ? <p className="ci-calc-note">{f(t.belowMinimum)}</p> : null}
          </>
        )}
      </div>
      <p className="ci-calc-note">{t.share}</p>
      <p className="ci-calc-note">{t.disclaimer}</p>
    </section>
  );
}
