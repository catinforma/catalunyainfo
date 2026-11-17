import { track, type AnalyticsEvent, type CalculatorUseId } from "./events";

/**
 * `calculator_use`: the first time a visitor's own input changes a
 * calculator's result, once per tab session per calculator.
 *
 * "Their own input" matters. Calculators render a default example on the
 * server and some restore a shared result from the URL hash after mount;
 * neither is a use. So the result is only compared once the visitor has
 * interacted with the calculator (a change or a click inside it), and the
 * baseline is the result they were looking at when they did.
 *
 * The state machine is pure so it can be tested without React; the hook in
 * use-calculator-use.ts drives it.
 */

export interface CalculatorUseState {
  /** The visitor has interacted with the calculator. */
  armed: boolean;
  /** The result on screen at the first interaction. */
  baseline: string;
  /** The result of the last committed render. */
  committed: string;
  /** Reported (or found already reported this session): nothing more to do. */
  done: boolean;
}

export const CALCULATOR_USE_START: CalculatorUseState = { armed: false, baseline: "", committed: "", done: false };

/** First interaction: remember what was on screen. Later ones change nothing. */
export function armCalculatorUse(state: CalculatorUseState): CalculatorUseState {
  return state.armed ? state : { ...state, armed: true, baseline: state.committed };
}

/** A render committed `signature`: should `calculator_use` be reported now? */
export function commitCalculatorResult(state: CalculatorUseState, signature: string): { state: CalculatorUseState; report: boolean } {
  const report = state.armed && !state.done && signature !== state.baseline;
  return { state: { ...state, committed: signature }, report };
}

/**
 * A stable string for a result. Results are small plain objects, so JSON is
 * enough; anything JSON cannot represent falls back to String().
 */
export function resultSignature(result: unknown): string {
  try {
    return JSON.stringify(result) ?? String(result);
  } catch {
    return String(result);
  }
}

/* -------------------------------------------- Once per tab session --- */

export const CALCULATOR_SESSION_KEY = "ci_calc_used";

type SessionLike = Pick<Storage, "getItem" | "setItem">;

/** Fallback when sessionStorage is blocked: once per page load instead. */
const memory = new Set<string>();

function sessionStore(): SessionLike | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function readReported(storage: SessionLike | null): Set<string> {
  const ids = new Set(memory);
  if (!storage) return ids;
  try {
    const raw = storage.getItem(CALCULATOR_SESSION_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    if (Array.isArray(list)) for (const x of list) if (typeof x === "string") ids.add(x);
  } catch {
    // Unreadable: the in-memory set is all we know.
  }
  return ids;
}

function writeReported(storage: SessionLike | null, ids: Set<string>): void {
  try {
    if (!storage) throw new Error("no sessionStorage");
    storage.setItem(CALCULATOR_SESSION_KEY, JSON.stringify([...ids]));
  } catch {
    // Blocked or full: the in-memory set still stops repeats on this page.
    for (const id of ids) memory.add(id);
  }
}

/**
 * Sends `calculator_use` unless this tab already did for this calculator.
 * Returns true when nothing more needs doing (sent now, or sent before);
 * false when it could not be sent (no consent yet), so a later change in the
 * same session can still count once the visitor accepts measurement.
 */
export function reportCalculatorUse(
  calculatorId: CalculatorUseId,
  locale: string,
  send: (event: AnalyticsEvent) => boolean = track,
  storage: SessionLike | null = sessionStore(),
): boolean {
  const reported = readReported(storage);
  if (reported.has(calculatorId)) return true;
  const sent = send({ name: "calculator_use", params: { calculator_id: calculatorId, locale } });
  if (!sent) return false;
  reported.add(calculatorId);
  writeReported(storage, reported);
  return true;
}
