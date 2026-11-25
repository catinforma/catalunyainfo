"use client";

import { useEffect, useRef } from "react";

import { nextStepViewEvent, watchNextStepView } from "@/lib/analytics/step-view";

/**
 * Renders an empty marker inside the "keep it" block (components/ReturnStep.tsx)
 * and reports `next_step_view` once, when the block is on screen. It reads the
 * block's own `data-ci-position` and `data-ci-family`, like the click listener.
 */
export function NextStepView({ locale }: { locale: string }) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const block = marker.current?.parentElement;
    if (!block) return;
    const event = nextStepViewEvent(block.dataset.ciPosition, block.dataset.ciFamily, locale);
    return event ? watchNextStepView(block, event) : undefined;
  }, [locale]);
  return <span ref={marker} hidden />;
}
