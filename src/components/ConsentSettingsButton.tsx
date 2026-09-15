"use client";

import { useSyncExternalStore } from "react";

import {
  readConsentCookie,
  readServerSnapshot,
  reopenConsent,
  snapshotToState,
  subscribeConsent,
} from "@/lib/analytics/consent-store";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * "Cookie settings", in the footer.
 *
 * Withdrawing consent has to be as easy as granting it, and the banner hides
 * itself the moment it is answered — so this is the route back. It renders
 * only once a decision exists, because while the banner is still on screen a
 * second control that reopens it would do nothing.
 */
export function ConsentSettingsButton({ locale }: { locale: Locale }) {
  const t = getMessages(locale);

  const snapshot = useSyncExternalStore(subscribeConsent, readConsentCookie, readServerSnapshot);
  const state = snapshotToState(snapshot);

  // `undefined` on the server and the first paint, `null` while undecided.
  if (state === undefined || state === null) return null;

  return (
    <button type="button" className="ci-consent-reopen" onClick={() => reopenConsent()}>
      {t.consent.title}
    </button>
  );
}
