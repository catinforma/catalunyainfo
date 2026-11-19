"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { CALC_COPY as TAX_COPY, TAX_NAME, rateText } from "@/lib/programmatic/home-purchase-tax/copy";
import type { TaxLine } from "@/lib/programmatic/home-purchase-tax/engine";
import type { Community, HomeType, HtClientData } from "@/lib/programmatic/home-purchase-tax/types";
import { CALC_COPY, EXAMPLE, euros, pct, readHash, taxDetailHref, wholeEuros, writeHash, type PcLocale } from "@/lib/programmatic/purchase-costs/copy";
import { OWNERS, calculate, type Owners, type PcInput } from "@/lib/programmatic/purchase-costs/engine";
import { parseAmount } from "@/lib/programmatic/rent-update/engine";

/**
 * Price + region + new/second-hand + the deed's folios and copies + who buys
 * and who pays the deed + mortgage + protected housing → the notary's and
 * the Registry's fees from their official scales, their IVA, the purchase
 * taxes (the home-purchase tax engine), and who pays each. Server-rendered on
 * EXAMPLE, so it answers without JavaScript; the URL hash keeps a calculation
 * shareable.
 *
 * Like the tax calculator, the page sends only the region names and the
 * example's region; every region's tax data comes from `dataUrl` (the tax
 * calculator's own JSON) on the first focus, tap or change.
 */

type Load = "idle" | "loading" | "ready" | "error";

function taxLineName(l: TaxLine, c: Community, locale: PcLocale): string {
  if (l.tax === "vat") return TAX_NAME[c.newHome.name === "IGIC" ? "igic" : c.newHome.name === "IPSI" ? "ipsi" : "vat"][locale];
  return TAX_NAME[l.tax][locale];
}

function Row({ label, note, payer, amount }: { label: string; note?: string | null; payer?: string | null; amount: string }) {
  return (
    <div>
      <dt>
        {label}
        {note ? <span className="block text-[var(--color-muted)]">{note}</span> : null}
        {payer ? <span className="block text-sm font-medium">{payer}</span> : null}
      </dt>
      <dd className="ci-numeric">{amount}</dd>
    </div>
  );
}

export function PurchaseCostsCalculator({
  locale,
  options,
  initial,
  dataUrl,
}: {
  locale: PcLocale;
  options: readonly { id: string; name: string }[];
  initial: Community;
  dataUrl: string;
}) {
  const t = CALC_COPY[locale];
  const tt = TAX_COPY[locale];
  const id = useId();
  const [input, setInput] = useState<PcInput>(EXAMPLE);
  const [priceText, setPriceText] = useState(String(EXAMPLE.price));
  const [ageText, setAgeText] = useState(String(EXAMPLE.age));
  const [foliosText, setFoliosText] = useState(String(EXAMPLE.folios));
  const [copiesText, setCopiesText] = useState(String(EXAMPLE.simpleCopies));
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
      // Only a calculator hash ("#c=…"): an in-page anchor such as "#notaria" must not reset the inputs.
      if (!/^#(?:.*&)?c=/.test(window.location.hash)) return;
      const next = readHash(window.location.hash, EXAMPLE, options.map((c) => c.id));
      fetchData();
      setInput(next);
      setPriceText(String(next.price));
      setAgeText(String(next.age));
      setFoliosText(String(next.folios));
      setCopiesText(String(next.simpleCopies));
      setTouched(true);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [options, fetchData]);

  const update = (patch: Partial<PcInput>) => {
    fetchData();
    const next = { ...input, ...patch };
    setInput(next);
    setTouched(true);
    if ([next.price, next.age, next.folios, next.simpleCopies].every(Number.isFinite)) window.history.replaceState(null, "", writeHash(next));
  };
  const intText = (text: string) => (text.trim() === "" ? Number.NaN : Number(text.trim()));

  // Until every region has arrived, only the example's can be computed.
  const r = all || input.community === initial.id ? calculate(input, all ?? [initial]) : null;
  const calcUse = useCalculatorUse("home-purchase-costs", locale, r);
  const E = (n: number) => euros(n, locale);
  const half = locale === "en" ? "50% off (protected housing)" : locale === "ca" ? "−50 % (habitatge protegit)" : "−50 % (vivienda protegida)";

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
          <label htmlFor={`${id}-c`}>{tt.community}</label>
          <select id={`${id}-c`} className="ci-field" value={input.community} onChange={(e) => update({ community: e.target.value })}>
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-p`}>{tt.price}</label>
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
            {tt.priceHint}
          </span>
        </p>
        <fieldset className="ci-calc-row">
          <legend className="text-sm font-medium">{tt.type}</legend>
          <div className="flex flex-col gap-2">
            {(["second-hand", "new"] as HomeType[]).map((k) => (
              <label key={k} className="flex items-start gap-2 font-normal">
                <input type="radio" className="mt-1" name={`${id}-t`} value={k} checked={input.type === k} onChange={() => update({ type: k })} />
                <span>
                  {tt.types[k]}
                  <span className="block text-sm text-[var(--color-muted)]">{tt.typeHints[k]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-f`}>{t.folios}</label>
          <input
            id={`${id}-f`}
            className="ci-field"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={foliosText}
            aria-describedby={`${id}-f-hint`}
            onChange={(e) => {
              setFoliosText(e.target.value);
              update({ folios: intText(e.target.value) });
            }}
          />
          <span id={`${id}-f-hint`} className="ci-calc-note">
            {t.foliosHint}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-s`}>{t.simpleCopies}</label>
          <input
            id={`${id}-s`}
            className="ci-field"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={copiesText}
            aria-describedby={`${id}-s-hint`}
            onChange={(e) => {
              setCopiesText(e.target.value);
              update({ simpleCopies: intText(e.target.value) });
            }}
          />
          <span id={`${id}-s-hint`} className="ci-calc-note">
            {t.simpleCopiesHint}
          </span>
        </p>
        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-w`}>{t.owners}</label>
          <select id={`${id}-w`} className="ci-field" value={String(input.owners)} aria-describedby={`${id}-w-hint`} onChange={(e) => update({ owners: Number(e.target.value) as Owners })}>
            {OWNERS.map((n) => (
              <option key={n} value={n}>
                {t.ownersOption(n)}
              </option>
            ))}
          </select>
          <span id={`${id}-w-hint`} className="ci-calc-note">
            {t.ownersHint}
          </span>
        </p>
        <fieldset className="ci-calc-row ci-calc-wide">
          <legend className="text-sm font-medium">{t.deedPayer}</legend>
          <div className="flex flex-col gap-2">
            {(["law", "buyer"] as const).map((k) => (
              <label key={k} className="flex items-start gap-2 font-normal">
                <input type="radio" className="mt-1" name={`${id}-bd`} value={k} checked={input.buyerPaysDeed === (k === "buyer")} onChange={() => update({ buyerPaysDeed: k === "buyer" })} />
                <span>{t.deedPayerOptions[k]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="ci-calc-row ci-calc-wide flex flex-col gap-2">
          <label className="flex items-start gap-2 font-normal">
            <input type="checkbox" className="mt-1" checked={input.mortgage} onChange={(e) => update({ mortgage: e.target.checked })} />
            <span>{t.mortgage}</span>
          </label>
          <label className="flex items-start gap-2 font-normal">
            <input type="checkbox" className="mt-1" checked={input.protected} onChange={(e) => update({ protected: e.target.checked })} />
            <span>{tt.protected}</span>
          </label>
          {input.protected && input.type === "new" ? (
            <div className="ml-6 flex flex-col gap-2">
              <span className="ci-calc-note">{t.vpoHint}</span>
              <label className="flex items-start gap-2 font-normal">
                <input type="checkbox" className="mt-1" checked={input.onlyHome} onChange={(e) => update({ onlyHome: e.target.checked })} />
                <span>{t.vpoOnly}</span>
              </label>
              <label className="flex items-start gap-2 font-normal">
                <input type="checkbox" className="mt-1" checked={input.smallHome} onChange={(e) => update({ smallHome: e.target.checked })} />
                <span>{t.vpoSmall}</span>
              </label>
            </div>
          ) : null}
        </div>

        <details className="ci-calc-row ci-calc-wide">
          <summary className="text-sm font-medium">{t.profileSummary}</summary>
          <div className="ci-calc-inputs mt-2">
            <p className="ci-calc-row">
              <label htmlFor={`${id}-e`}>{tt.age}</label>
              <input
                id={`${id}-e`}
                className="ci-field"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={ageText}
                onChange={(e) => {
                  setAgeText(e.target.value);
                  update({ age: intText(e.target.value) });
                }}
              />
            </p>
            <p className="ci-calc-row">
              <label htmlFor={`${id}-d`}>{tt.disability}</label>
              <select id={`${id}-d`} className="ci-field" value={String(input.disability)} onChange={(e) => update({ disability: e.target.value === "65" ? 65 : e.target.value === "33" ? 33 : 0 })}>
                {(["0", "33", "65"] as const).map((k) => (
                  <option key={k} value={k}>
                    {tt.disabilityOptions[k]}
                  </option>
                ))}
              </select>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {(
              [
                ["habitual", tt.habitual],
                ["firstHome", tt.firstHome],
                ["largeFamily", tt.largeFamily],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex items-start gap-2 font-normal">
                <input type="checkbox" className="mt-1" checked={input[k]} onChange={(e) => update({ [k]: e.target.checked } as Partial<PcInput>)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </details>
      </div>

      <div aria-live="polite">
        {r === null ? (
          <p className="ci-calc-note">{load === "error" ? t.loadError : t.loading}</p>
        ) : r.status === "invalid" ? (
          <p role="alert">{t.invalid[r.reason]}</p>
        ) : (
          <>
            {touched ? null : <p className="ci-calc-note">{t.example}</p>}
            <h3 className="ci-calc-title mt-4">{t.results(wholeEuros(input.price, locale), r.community.name[locale])}</h3>

            <h4 className="mt-4 text-base">{t.notary}</h4>
            <dl className="ci-calc-results">
              {r.fees.notary.fixed !== null ? (
                <Row label={t.notaryFixed} payer={t.payerBuyer} amount={E(r.fees.notary.fixed)} />
              ) : (
                <>
                  <Row
                    label={t.deed}
                    note={t.deedSteps(E(r.fees.notary.scale), r.fees.notary.cutPct ? half : null, E(r.fees.notary.rebate), E(r.fees.notary.matrixFolios))}
                    payer={input.buyerPaysDeed ? t.payerBuyer : t.payerSeller}
                    amount={E(r.fees.notary.deed)}
                  />
                  <Row label={t.firstCopy} note={t.firstCopyNote(input.folios, r.fees.regime === "vpo-first")} payer={t.payerBuyer} amount={E(r.fees.notary.firstCopy)} />
                  {input.simpleCopies > 0 ? <Row label={t.simpleCopiesLine(input.simpleCopies)} payer={t.payerBuyer} amount={E(r.fees.notary.simpleCopies)} /> : null}
                </>
              )}
            </dl>

            <h4 className="mt-4 text-base">{t.registry}</h4>
            <dl className="ci-calc-results">
              {r.fees.registry.fixed !== null ? (
                <Row label={t.registryFixed} payer={t.payerBuyer} amount={E(r.fees.registry.fixed)} />
              ) : (
                <>
                  <Row label={t.presentation} payer={t.payerBuyer} amount={E(r.fees.registry.presentation)} />
                  <Row
                    label={t.registration}
                    note={t.registrationSteps(
                      E(r.fees.registry.scale),
                      r.fees.registry.owners > 1 ? `${r.fees.registry.owners} × ${E(r.fees.registry.shareBase)}` : null,
                      r.fees.registry.cutPct ? half : null,
                      E(r.fees.registry.rebate),
                      E(r.fees.registry.homeSaleCut),
                    )}
                    payer={t.payerBuyer}
                    amount={E(r.fees.registry.registration)}
                  />
                </>
              )}
            </dl>

            <dl className="ci-calc-results mt-4">
              {r.fees.vat ? <Row label={t.vat(pct(r.fees.vat.rate, locale))} payer={t.payerBuyer} amount={E(r.fees.vat.buyer)} /> : null}
              {r.taxes.status === "ok"
                ? r.taxes.lines.map((l) => (
                    <Row
                      key={l.tax}
                      label={taxLineName(l, r.community, locale)}
                      note={l.rate && l.effectiveRate !== null ? tt.rateApplied(rateText(l.rate, locale), pct(l.effectiveRate, locale)) : null}
                      payer={t.payerBuyer}
                      amount={l.amount === null ? t.taxUnverified : E(l.amount)}
                    />
                  ))
                : null}
              <div className="ci-calc-total">
                <dt>{r.buyerTotal === null ? t.buyerTotalNone : t.buyerTotal}</dt>
                <dd className="ci-numeric">{r.buyerTotal === null ? "—" : E(r.buyerTotal)}</dd>
              </div>
            </dl>
            {r.taxes.status === "invalid" ? <p role="alert">{t.taxInvalid}</p> : null}
            {r.fees.vat ? null : <p className="ci-calc-note">{t.vatNone}</p>}
            <p className="ci-calc-note">{input.buyerPaysDeed || r.fees.notary.fixed !== null ? t.sellerNone : t.sellerPays(E(r.sellerFees))}</p>
            <p className="ci-calc-note">
              {t.taxes}: <a href={taxDetailHref(input, locale)}>{t.taxDetail}</a>.
            </p>
            {r.fees.notary.fixed !== null ? <p className="ci-calc-note">{t.fixedNote}</p> : null}
            {input.mortgage ? (
              <div className="ci-calc-note">
                <p className="m-0">{t.mortgageTitle}</p>
                <ul className="m-0">
                  {t.mortgageItems.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="ci-calc-note">
              <p className="m-0">{t.notIncluded}</p>
              <ul className="m-0">
                {t.notIncludedItems.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <p className="ci-calc-note">{t.foliosNote}</p>
            <p className="ci-calc-note">{t.invoice}</p>
          </>
        )}
      </div>
    </section>
  );
}
