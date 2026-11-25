import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { ANALYTICS_EVENTS, RETURN_FAMILIES, RETURN_POSITIONS } from "../src/lib/analytics/events.ts";
import { nextStepViewEvent, watchNextStepView } from "../src/lib/analytics/step-view.ts";
import { returnStepForEntry } from "../src/lib/engagement/return-step.ts";
import { B2_PATHS } from "../src/lib/content/batch02/shared.ts";

/** next_step_view (25 Nov 2026): the denominator of the "keep it" block's click rate. */

const read = (rel: string) => readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");

function fakeObserver() {
  let cb: (e: { isIntersecting: boolean }[]) => void = () => {};
  let disconnected = 0;
  const factory = (c: typeof cb) => {
    cb = c;
    return { observe() {}, disconnect: () => void disconnected++ };
  };
  return { factory, fire: (isIntersecting: boolean) => cb([{ isIntersecting }]), disconnected: () => disconnected };
}

function withGtag<T>(fn: (calls: unknown[][]) => T): T {
  const g = globalThis as { window?: unknown };
  const saved = g.window;
  const calls: unknown[][] = [];
  g.window = { gtag: (...a: unknown[]) => calls.push(a) };
  try {
    return fn(calls);
  } finally {
    if (saved === undefined) delete g.window;
    else g.window = saved;
  }
}

test("the event carries only closed params", () => {
  assert.ok(ANALYTICS_EVENTS.includes("next_step_view"));
  for (const position of RETURN_POSITIONS)
    for (const family of RETURN_FAMILIES) {
      const e = nextStepViewEvent(position, family, "ca")!;
      assert.deepEqual(Object.keys(e.params).sort(), ["block_position", "locale", "step_family"]);
    }
  assert.equal(nextStepViewEvent("elsewhere", "strikes", "ca"), null);
  assert.equal(nextStepViewEvent("after_answer", "news", "ca"), null);
  assert.equal(nextStepViewEvent(null, undefined, "ca"), null);
});

test("it fires once per page view, however often the block re-enters the viewport", () => {
  withGtag((calls) => {
    const o = fakeObserver();
    watchNextStepView({} as Element, nextStepViewEvent("after_answer", "strikes", "es")!, o.factory);
    o.fire(false);
    assert.equal(calls.length, 0, "not on screen yet");
    o.fire(true);
    o.fire(true);
    o.fire(true);
    assert.deepEqual(calls, [["event", "next_step_view", { block_position: "after_answer", step_family: "strikes", locale: "es" }]]);
    assert.equal(o.disconnected(), 1);
  });
});

test("it sends nothing without consent (no gtag)", () => {
  const g = globalThis as { window?: unknown };
  const saved = g.window;
  delete g.window;
  try {
    const o = fakeObserver();
    watchNextStepView({} as Element, nextStepViewEvent("after_intro", "elections", "ca")!, o.factory);
    o.fire(true);
    assert.equal(o.disconnected(), 1);
  } finally {
    if (saved !== undefined) g.window = saved;
  }
});

test("the block mounts the tracker and its internal links carry no utm", () => {
  assert.match(read("src/components/ReturnStep.tsx"), /<NextStepView/);
  assert.match(read("src/components/NextStepView.tsx"), /watchNextStepView/);
  for (const key of Object.keys(B2_PATHS)) void key;
  for (const locale of ["ca", "es", "en"] as const) {
    const step = returnStepForEntry({ href: `/${locale}/${B2_PATHS.strikes[locale]}/`, key: null, locale }, "2026-11-25");
    for (const l of step?.links ?? []) assert.doesNotMatch(l.href, /utm_|\?/, l.href);
  }
});
