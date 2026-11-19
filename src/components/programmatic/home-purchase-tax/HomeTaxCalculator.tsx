"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { CALC_COPY, EXAMPLE, TAX_NAME, benefitRate, euros, pct, rateText, readHash, wholeEuros, writeHash, type HtLocale } from "@/lib/programmatic/home-purchase-tax/copy";
import { calculate, type TaxLine } from "@/lib/programmatic/home-purchase-tax/engine";
import type { Community, HomeType, HtClientData, HtInput } from "@/lib/programmatic/home-purchase-tax/types";
import { parseAmount } from "@/lib/programmatic/rent-update/engine";
import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";

/**
 * Community + price + new/second-hand + the buyer's profile → the tax, the
 * rate applied, its article, and the conditions of a reduced rate the
 * calculator cannot check. Server-rendered on EXAMPLE (copy.ts), so it
 * answers without JavaScript; the URL hash keeps a calculation shareable.
 *
 * The page sends only what the first render needs: the community names for
 * the <select> (`options`, sorted on the server) and the example's community
 * (`initial`). Every community's rates (clientCommunities(), without the
 * law's quotes) are fetched from `dataUrl` once, on the first focus, tap or
 * change, or at once when the URL carries a calculation; until they arrive,
 * a community other than the example shows a loading line. As props they
 * were ~160 KB of every edition's RSC payload.
 */

type Load = "idle" | "loading" | "ready" | "error";

function lineName(l: TaxLine, c: Community, locale: HtLocale): string {
  if (l.tax === "vat") return TAX_NAME[c.newHome.name === "IGIC" ? "igic" : c.newHome.name === "IPSI" ? "ipsi" : "vat"][locale];
  return TAX_NAME[l.tax][locale];
}

/** Who to ask when a figure is not verified: the IPSI is the city's, the rest the community's agency. */
function agencyFor(l: TaxLine, c: Community): { name: string; url: string } {
  return l.tax === "vat" && c.newHome.agency ? c.newHome.agency : c.taxAgency;
}

export function HomeTaxCalculator({
  locale,
  options,
  initial,
  dataUrl,
}: {
  locale: HtLocale;
  options: readonly { id: string; name: string }[];
  initial: Community;
  dataUrl: string;
}) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [input, setInput] = useState<HtInput>(EXAMPLE);
  const [priceText, setPriceText] = useState(String(EXAMPLE.price));
  const [ageText, setAgeText] = useState(String(EXAMPLE.age));
  const [touched, setTouched] = useState(false);
  const [all, setAll] = useState<readonly Community[] | null>(null);
  const [load, setLoad] = useState<Load>("idle");
  const started = useRef(false);

  const fetchData = useCallback(() => {
    if (started.current) return;
    started.current = true;
    setLoad("loading");
    fetch(dataUrl, { headers: { accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: HtClientData) => {
        if (data?.schema !== 1 || !Array.isArray(data.communities) || data.communities.length === 0) throw new Error("no data");
        setAll(data.communities);
        setLoad("ready");
      })
      .catch(() => {
        // The next interaction tries again.
        started.current = false;
        setLoad("error");
      });
  }, [dataUrl]);

  // The hash is only known in the browser: read it after mount, never during render.
  useEffect(() => {
    const fromHash = () => {
      // Only a calculator hash ("#c=…"): an in-page anchor such as "#itp-cataluna" must not reset the inputs.
      if (!/^#(?:.*&)?c=/.test(window.location.hash)) return;
      const next = readHash(window.location.hash, EXAMPLE, options.map((c) => c.id));
      fetchData();
      setInput(next);
      setPriceText(String(next.price));
      setAgeText(String(next.age));
      setTouched(true);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [options, fetchData]);

  const update = (patch: Partial<HtInput>) => {
    fetchData();
    const next = { ...input, ...patch };
    setInput(next);
    setTouched(true);
    if (Number.isFinite(next.price) && Number.isFinite(next.age)) window.history.replaceState(null, "", writeHash(next));
  };

  // Until every community has arrived, only the example's can be computed.
  const r = all || input.community === initial.id ? calculate(input, all ?? [initial]) : null;

  // First result change by the visitor, once per session (lib/analytics/calculator-use.ts).
  const calcUse = useCalculatorUse("home-purchase-tax", locale, r);

  return (
    <section className="ci-calc" {...calcUse} onFocusCapture={fetchData} onPointerDownCapture={fetchData} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="ci-calc-title">
        {t.title}
      </h2>
      <p className="ci-calc-intro">{t.intro}</p>
      <noscript>
        <p className="ci-calc-note">{t.noscript}</p>
      </noscript>

      <div className="ci-calc-inputs">
        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-c`}>{t.community}</label>
          <select id={`${id}-c`} className="ci-field" value={input.community} onChange={(e) => update({ community: e.target.value })}>
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-p`}>{t.price}</label>
          <span className="ci-calc-number">
            <input
              id={`${id}-p`}
              className="ci-field"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={priceText}
              aria-describedby={`${id}-p-hint`}
              onChange={(e) => {
                setPriceText(e.target.value);
                update({ price: parseAmount(e.target.value) });
              }}
            />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-p-hint`} className="ci-calc-note">
            {t.priceHint}
          </span>
        </p>
        <fieldset className="ci-calc-row">
          <legend className="text-sm font-medium">{t.type}</legend>
          <div className="flex flex-col gap-2">
            {(["second-hand", "new"] as HomeType[]).map((k) => (
              <label key={k} className="flex items-start gap-2 font-normal">
                <input type="radio" className="mt-1" name={`${id}-t`} value={k} checked={input.type === k} onChange={() => update({ type: k })} />
                <span>
                  {t.types[k]}
                  <span className="block text-sm text-[var(--color-muted)]">{t.typeHints[k]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="ci-calc-row ci-calc-wide">
          <legend className="text-sm font-medium">{t.profile}</legend>
          <div className="ci-calc-inputs">
            <p className="ci-calc-row">
              <label htmlFor={`${id}-e`}>{t.age}</label>
              <input
                id={`${id}-e`}
                className="ci-field"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={ageText}
                onChange={(e) => {
                  setAgeText(e.target.value);
                  update({ age: e.target.value.trim() === "" ? Number.NaN : Number(e.target.value.trim()) });
                }}
              />
            </p>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-d`}>{t.disability}</label>
              <select id={`${id}-d`} className="ci-field" value={String(input.disability)} onChange={(e) => update({ disability: e.target.value === "65" ? 65 : e.target.value === "33" ? 33 : 0 })}>
                {(["0", "33", "65"] as const).map((k) => (
                  <option key={k} value={k}>
                    {t.disabilityOptions[k]}
                  </option>
                ))}
              </select>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {(
              [
                ["habitual", t.habitual],
                ["firstHome", t.firstHome],
                ["largeFamily", t.largeFamily],
                ["protected", t.protected],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex items-start gap-2 font-normal">
                <input type="checkbox" className="mt-1" checked={input[k]} onChange={(e) => update({ [k]: e.target.checked } as Partial<HtInput>)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div aria-live="polite">
        {r === null ? (
          <p className="ci-calc-note">{load === "error" ? t.loadError : t.loading}</p>
        ) : r.status === "invalid" ? (
          <p role="alert">{t.invalid[r.reason]}</p>
        ) : (
          <>
            {touched ? null : <p className="ci-calc-note">{t.example}</p>}
            <h3 className="ci-calc-title mt-4">
              {t.results}: {wholeEuros(input.price, locale)}, {r.community.name[locale]}
            </h3>
            <dl className="ci-calc-results">
              {r.lines.map((l) => (
                <div key={l.tax}>
                  <dt>
                    {lineName(l, r.community, locale)}
                    {l.rate && l.effectiveRate !== null ? <span className="block text-[var(--color-muted)]">{t.rateApplied(rateText(l.rate, locale), pct(l.effectiveRate, locale))}</span> : null}
                  </dt>
                  <dd className="ci-numeric">{l.amount === null ? t.unverified(agencyFor(l, r.community).name) : euros(l.amount, locale)}</dd>
                </div>
              ))}
              <div className="ci-calc-total">
                <dt>{r.total === null ? t.totalUnverified : t.total}</dt>
                <dd className="ci-numeric">{r.total === null ? "—" : euros(r.total, locale)}</dd>
              </div>
            </dl>
            {r.lines.map((l) =>
              l.amount === null ? (
                <p key={`u-${l.tax}`} className="ci-calc-note">
                  <a href={agencyFor(l, r.community).url} rel="noopener" target="_blank">
                    {agencyFor(l, r.community).name}
                  </a>
                </p>
              ) : (
                <p key={`b-${l.tax}`} className="ci-calc-note">
                  {l.benefit ? t.reduced(l.benefit.label[locale]) : t.generalRate} {l.generalAmount !== null ? t.general(euros(l.generalAmount, locale)) : null} {t.basis}: {l.tax === "vat" ? l.article : `${l.article}, ${r.community.law?.short ?? ""}`}.
                </p>
              ),
            )}
            {r.extras.length > 0 ? (
              <div className="ci-calc-note">
                <p className="m-0">{t.extra}</p>
                <ul className="m-0">
                  {r.extras.map((x) => (
                    <li key={x.es}>{x[locale]}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {r.manual.length > 0 ? (
              <div className="ci-calc-note">
                <p className="m-0">{t.manual}</p>
                <ul className="m-0">
                  {r.manual.map((b) => (
                    <li key={b.id}>
                      {benefitRate(b, locale)}: {b.label[locale]} ({b.article})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {input.type === "new" ? <p className="ci-calc-note">{t.mortgage}</p> : null}
            <p className="ci-calc-note">{t.fees}</p>
          </>
        )}
      </div>
    </section>
  );
}
