"use client";

import { useMemo, useState } from "react";

import type { Block } from "@/lib/content/blocks";
import { renderInline } from "@/lib/content/inline";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * A calculator driven entirely by its payload.
 *
 * The evaluation model is fixed: a result is a sum of terms, and a term is a
 * product of factors. That is enough for a capped per-person-per-night tax, a
 * cost-per-journey comparison, or a party-size fare — and it is small enough
 * that no expression parser is needed. The CMS stores untrusted JSON; a
 * payload that could carry formulas could carry code.
 *
 * Rates live in the payload, where they arrive sourced and dated with the
 * editorial package. This component does arithmetic and nothing else.
 */

type CalculatorBlock = Extract<Block, { type: "calculator" }>;
type Factor = CalculatorBlock["outputs"][number]["terms"][number]["factors"][number];

function clamp(value: number, min?: number, max?: number): number {
  let out = value;
  if (typeof min === "number") out = Math.max(min, out);
  if (typeof max === "number") out = Math.min(max, out);
  return out;
}

export function Calculator({ block, locale }: { block: CalculatorBlock; locale: Locale }) {
  const t = getMessages(locale);

  const [state, setState] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const input of block.inputs) {
      initial[input.id] =
        input.kind === "number" ? String(input.value) : (input.options[0]?.value ?? "");
    }
    return initial;
  });

  /** Numeric value of an input, and the amount on a select's chosen option. */
  const resolve = useMemo(() => {
    const numbers = new Map<string, number>();
    const amounts = new Map<string, number>();

    for (const input of block.inputs) {
      const raw = state[input.id];
      if (input.kind === "number") {
        const parsed = Number(raw);
        numbers.set(input.id, Number.isFinite(parsed) ? parsed : 0);
      } else {
        const chosen = input.options.find((option) => option.value === raw) ?? input.options[0];
        amounts.set(input.id, chosen?.amount ?? 0);
        numbers.set(input.id, chosen?.amount ?? 0);
      }
    }
    return { numbers, amounts };
  }, [block.inputs, state]);

  function factorValue(factor: Factor): number {
    if ("value" in factor) return factor.value;
    if ("optionAmount" in factor) return resolve.amounts.get(factor.optionAmount) ?? 0;
    return clamp(resolve.numbers.get(factor.input) ?? 0, factor.min, factor.max);
  }

  const results = block.outputs.map((output) => {
    const total = output.terms.reduce(
      (sum, term) => sum + term.factors.reduce((product, f) => product * factorValue(f), 1),
      0,
    );
    return {
      label: output.label,
      emphasis: output.emphasis,
      text: `${total.toLocaleString(locale, {
        minimumFractionDigits: output.decimals,
        maximumFractionDigits: output.decimals,
      })} ${output.unit}`.trim(),
    };
  });

  return (
    <section className="ci-calc" aria-label={block.title}>
      <h3 className="ci-calc-title">{block.title}</h3>
      {block.intro ? <p className="ci-calc-intro">{renderInline(block.intro)}</p> : null}

      <div className="ci-calc-inputs">
        {block.inputs.map((input) => (
          <p key={input.id} className="ci-calc-row">
            <label htmlFor={`calc-${input.id}`}>{input.label}</label>
            {input.kind === "number" ? (
              <span className="ci-calc-number">
                <input
                  id={`calc-${input.id}`}
                  className="ci-field"
                  type="number"
                  inputMode="numeric"
                  min={input.min}
                  max={input.max}
                  step={input.step}
                  value={state[input.id] ?? ""}
                  onChange={(event) =>
                    setState((previous) => ({ ...previous, [input.id]: event.target.value }))
                  }
                />
                {input.suffix ? <span className="ci-calc-suffix">{input.suffix}</span> : null}
              </span>
            ) : (
              <select
                id={`calc-${input.id}`}
                className="ci-field"
                value={state[input.id] ?? ""}
                onChange={(event) =>
                  setState((previous) => ({ ...previous, [input.id]: event.target.value }))
                }
              >
                {input.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </p>
        ))}
      </div>

      {/* Announced politely: the figure updates on every keystroke, and an
          assertive region would interrupt a screen reader mid-word. */}
      <dl className="ci-calc-results" aria-live="polite">
        {results.map((result) => (
          <div key={result.label} className={result.emphasis ? "ci-calc-total" : undefined}>
            <dt>{result.label}</dt>
            <dd className="ci-numeric">{result.text}</dd>
          </div>
        ))}
      </dl>

      <p className="ci-calc-note">{renderInline(block.note)}</p>
      <p className="ci-calc-note">{t.calculator.disclaimer}</p>
    </section>
  );
}
