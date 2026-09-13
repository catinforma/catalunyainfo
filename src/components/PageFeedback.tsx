"use client";

import { useState } from "react";

import { track } from "@/lib/analytics/events";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * "Was this useful?"
 *
 * Two jobs: it gives readers a way to flag a page that has gone stale, and it
 * gives the desk a real quality signal that is not a pageview. The answer is
 * stored against the path only — no identifier, no session, no free-text field
 * that could collect personal data by accident.
 */
export function PageFeedback({
  locale,
  path,
  contentType,
}: {
  locale: Locale;
  path: string;
  contentType: string;
}) {
  const t = getMessages(locale);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function answer(isUseful: boolean) {
    if (sent || pending) return;
    setPending(true);
    track({
      name: "useful_feedback",
      params: { is_useful: isUseful, content_type: contentType, locale },
    });
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, locale, isUseful }),
      });
    } catch {
      // A failed write must not turn into an error the reader has to handle.
    }
    setSent(true);
    setPending(false);
  }

  if (sent) {
    return (
      <p aria-live="polite" className="text-sm text-[var(--color-moss)]">
        {t.feedback.thanks}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-rule)] pt-6">
      <p className="text-sm">{t.feedback.question}</p>
      <button
        type="button"
        className="ci-btn ci-btn-quiet"
        disabled={pending}
        onClick={() => answer(true)}
      >
        {t.feedback.yes}
      </button>
      <button
        type="button"
        className="ci-btn ci-btn-quiet"
        disabled={pending}
        onClick={() => answer(false)}
      >
        {t.feedback.no}
      </button>
    </div>
  );
}
