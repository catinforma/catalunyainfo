import { useCallback, useEffect, useMemo, useRef } from "react";

import { CALCULATOR_USE_START, armCalculatorUse, commitCalculatorResult, reportCalculatorUse, resultSignature, type CalculatorUseState } from "./calculator-use";
import type { CalculatorUseId } from "./events";

export interface CalculatorUseHandlers {
  onChangeCapture: () => void;
  onClickCapture: () => void;
}

/**
 * Reports `calculator_use` the first time the visitor's own input changes
 * `result` (calculator-use.ts has the rules). Spread the returned handlers on
 * the calculator's root element:
 *
 *   const use = useCalculatorUse("net-salary", locale, r);
 *   <section className="ci-calc" {...use}>
 *
 * Capture-phase handlers run before the input's own onChange, so the baseline
 * is the result the visitor was looking at, not the one their change produces.
 * Nothing is sent without analytics consent (track() is a no-op then).
 */
export function useCalculatorUse(calculatorId: CalculatorUseId, locale: string, result: unknown): CalculatorUseHandlers {
  const signature = resultSignature(result);
  const state = useRef<CalculatorUseState>(CALCULATOR_USE_START);

  useEffect(() => {
    const step = commitCalculatorResult(state.current, signature);
    state.current = step.state;
    if (step.report && reportCalculatorUse(calculatorId, locale)) state.current = { ...state.current, done: true };
  }, [calculatorId, locale, signature]);

  const arm = useCallback(() => {
    state.current = armCalculatorUse(state.current);
  }, []);

  return useMemo(() => ({ onChangeCapture: arm, onClickCapture: arm }), [arm]);
}
