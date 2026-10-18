"use client";

import { useSyncExternalStore } from "react";

import {
  readConsentCookie,
  readServerSnapshot,
  reopenConsent,
  snapshotToState,
  subscribeConsent,
} from "@/lib/analytics/consent-store";

/**
 * "Cookie settings", in the footer.
 *
 * Withdrawing consent has to be as easy as granting it, and the banner hides
 * itself the moment it is answered — so this is the route back. It renders
 * only once a decision exists, because while the banner is still on screen a
 * second control that reopens it would do nothing.
 */
// Strings arrive as props from the server component that renders this one.
// Importing getMessages here shipped all three languages' dictionaries
// (~17 KB) to every page, because this component is on every page.
export function ConsentSettingsButton({ label }: { label: string }) {

  const snapshot = useSyncExternalStore(subscribeConsent, readConsentCookie, readServerSnapshot);
  const state = snapshotToState(snapshot);

  // `undefined` on the server and the first paint, `null` while undecided.
  if (state === undefined || state === null) return null;

  return (
    <button type="button" className="ci-consent-reopen" onClick={() => reopenConsent()}>
      {label}
    </button>
  );
}
