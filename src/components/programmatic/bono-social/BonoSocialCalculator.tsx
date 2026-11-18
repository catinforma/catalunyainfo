"use client";

import { useId, useState } from "react";

import { useCalculatorUse } from "@/lib/analytics/use-calculator-use";
import { parseAmount } from "@/lib/programmatic/employment/paths";
import { CALC_COPY, CATEGORY_LABEL, ROUTE_LABEL, SPECIAL_LABEL, TARIFF_LABEL, kwh, money, rate, times, type BsLocale } from "@/lib/programmatic/bono-social/copy";
import { SPECIAL_IDS, check, type BonoInput, type SpecialId, type Tariff } from "@/lib/programmatic/bono-social/engine";

/**
 * The bono social eléctrico checker: who lives at home, the household's
 * yearly income, the situations of RD 897/2017 art. 3 (large family, minimum
 * pension, IMV, the special circumstances), social services and the tariff;
 * out come the category, the 2026 and the permanent discount, the income
 * limits and the kWh with the discount. Server-rendered on the page's
 * default household, so it answers without JavaScript.
 */

const AND: Record<BsLocale, string> = { es: " y ", ca: " i ", en: " and " };
const TARIFFS: Tariff[] = ["pvpc", "free", "unsure"];

export function BonoSocialCalculator({ locale, initial }: { locale: BsLocale; initial: BonoInput }) {
  const t = CALC_COPY[locale];
  const id = useId();
  const [adults, setAdults] = useState(String(initial.adults));
  const [minors, setMinors] = useState(String(initial.minors));
  const [income, setIncome] = useState(initial.income === null ? "" : String(initial.income));
  const [largeFamily, setLargeFamily] = useState(initial.largeFamily);
  const [minimumPension, setMinimumPension] = useState(initial.minimumPension);
  const [imv, setImv] = useState(initial.imv);
  const [special, setSpecial] = useState<SpecialId[]>([...initial.special]);
  const [socialServices, setSocialServices] = useState(initial.socialServices);
  const [tariff, setTariff] = useState<Tariff>(initial.tariff);

  const count = (text: string) => (text.trim() === "" ? Number.NaN : Number(text.trim()));
  const result = check({
    adults: count(adults),
    minors: count(minors),
    income: income.trim() === "" ? null : parseAmount(income),
    largeFamily,
    minimumPension,
    imv,
    special,
    socialServices,
    tariff,
  });

  // First result change by the visitor, once per session (lib/analytics/calculator-use.ts).
  const calcUse = useCalculatorUse("bono-social", locale, result);

  const toggleSpecial = (s: SpecialId, on: boolean) => setSpecial((list) => (on ? [...list.filter((x) => x !== s), s] : list.filter((x) => x !== s)));
  const flags: [string, boolean, (v: boolean) => void][] = [
    [t.largeFamily, largeFamily, setLargeFamily],
    [t.minimumPension, minimumPension, setMinimumPension],
    [t.imv, imv, setImv],
    [t.socialServices, socialServices, setSocialServices],
  ];

  return (
    <section className="ci-calc" {...calcUse} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="ci-calc-title">
        {t.title}
      </h2>
      <p className="ci-calc-intro">{t.intro}</p>
      <noscript>
        <p className="ci-calc-note">{t.noscript}</p>
      </noscript>

      <div className="ci-calc-inputs">
        <p className="ci-calc-row">
          <label htmlFor={`${id}-adults`}>{t.adults}</label>
          <span className="ci-calc-number">
            <input id={`${id}-adults`} className="ci-field" type="text" inputMode="numeric" autoComplete="off" aria-describedby={`${id}-adults-hint`} value={adults} onChange={(e) => setAdults(e.target.value)} />
          </span>
          <span id={`${id}-adults-hint`} className="ci-calc-note">
            {t.adultsHint}
          </span>
        </p>
        <p className="ci-calc-row">
          <label htmlFor={`${id}-minors`}>{t.minors}</label>
          <span className="ci-calc-number">
            <input id={`${id}-minors`} className="ci-field" type="text" inputMode="numeric" autoComplete="off" value={minors} onChange={(e) => setMinors(e.target.value)} />
          </span>
        </p>
        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-income`}>{t.income}</label>
          <span className="ci-calc-number">
            <input id={`${id}-income`} className="ci-field" type="text" inputMode="decimal" autoComplete="off" aria-describedby={`${id}-income-hint`} value={income} onChange={(e) => setIncome(e.target.value)} />
            <span className="ci-calc-suffix">€</span>
          </span>
          <span id={`${id}-income-hint`} className="ci-calc-note">
            {t.incomeHint}
          </span>
        </p>

        <fieldset className="ci-calc-row ci-calc-wide">
          <legend className="text-sm font-medium">{t.situation}</legend>
          <div className="flex flex-col gap-2">
            {flags.map(([label, value, set]) => (
              <label key={label} className="flex items-start gap-2 font-normal">
                <input type="checkbox" className="mt-1" checked={value} onChange={(e) => set(e.target.checked)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="ci-calc-row ci-calc-wide">
          <legend className="text-sm font-medium">{t.specialLegend}</legend>
          <span className="ci-calc-note">{t.specialHint}</span>
          <div className="flex flex-col gap-2">
            {SPECIAL_IDS.map((s) => (
              <label key={s} className="flex items-start gap-2 font-normal">
                <input type="checkbox" className="mt-1" checked={special.includes(s)} onChange={(e) => toggleSpecial(s, e.target.checked)} />
                <span>{SPECIAL_LABEL[s][locale]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-tariff`}>{t.tariff}</label>
          <select id={`${id}-tariff`} className="ci-field" value={tariff} onChange={(e) => setTariff(e.target.value as Tariff)} aria-describedby={`${id}-tariff-hint`}>
            {TARIFFS.map((k) => (
              <option key={k} value={k}>
                {TARIFF_LABEL[k][locale]}
              </option>
            ))}
          </select>
          <span id={`${id}-tariff-hint`} className="ci-calc-note">
            {t.tariffHint}
          </span>
        </p>
      </div>

      <div aria-live="polite">
        {result.status === "invalid" ? (
          <p role="alert">{t.invalid[result.reason]}</p>
        ) : (
          <>
            <dl className="ci-calc-results">
              <div className="ci-calc-total">
                <dt>{t.result}</dt>
                <dd>{CATEGORY_LABEL[result.category][locale]}</dd>
              </div>
              {result.discount2026 !== null && result.discountPermanent !== null ? (
                <>
                  <div>
                    <dt>{t.discount2026}</dt>
                    <dd>{rate(result.discount2026, locale)}</dd>
                  </div>
                  <div>
                    <dt>{t.discount2027}</dt>
                    <dd>{rate(result.discountPermanent, locale)}</dd>
                  </div>
                  <div>
                    <dt>{t.cap}</dt>
                    <dd>{t.capValue(kwh(result.cap.yearly, locale), kwh(result.cap.monthly, locale))}</dd>
                  </div>
                </>
              ) : null}
              <div>
                <dt>{t.limitVulnerable}</dt>
                <dd>{money(result.thresholds.vulnerable, locale)}</dd>
              </div>
              <div>
                <dt>{t.limitSevere}</dt>
                <dd>{money(result.thresholds.severe, locale)}</dd>
              </div>
            </dl>
            {result.category === "none" ? (
              <p className="ci-calc-note">{t.notEligible(money(result.thresholds.vulnerable, locale))}</p>
            ) : (
              <p className="ci-calc-note">{t.qualifiesBy(result.routes.map((r) => ROUTE_LABEL[r][locale]).join(AND[locale]))}</p>
            )}
            <p className="ci-calc-note">{t.multiplier(times(result.thresholds.multiplier, locale))}</p>
            {result.severityUnknown ? <p className="ci-calc-note">{t.severityUnknown}</p> : null}
            {result.category === "exclusion" ? <p className="ci-calc-note">{t.exclusion}</p> : null}
            {result.socialServicesIgnored ? <p className="ci-calc-note">{t.socialServicesIgnored}</p> : null}
            {result.category !== "none" ? <p className="ci-calc-note">{result.needsPvpc ? (tariff === "unsure" ? t.needsPvpcUnsure : t.needsPvpc) : t.onPvpc}</p> : null}
          </>
        )}
      </div>
    </section>
  );
}
