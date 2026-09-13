/**
 * Consent state.
 *
 * Stored in a first-party cookie so the server can read it too, and mapped
 * onto Google Consent Mode v2 signals. Measurement is denied until the visitor
 * says otherwise: nothing is sent on the first page view of a new visitor.
 */

export const CONSENT_COOKIE = "ci_consent";
export const CONSENT_VERSION = 1;

export interface ConsentState {
  version: number;
  /** Audience measurement (GA4). */
  analytics: boolean;
  /** Advertising. Kept in the model so the banner does not have to change
   *  later, but no ad code exists in this build. */
  ads: boolean;
  /** Epoch milliseconds, so we can re-ask when the policy changes. */
  decidedAt: number;
}

export const DENY_ALL: ConsentState = {
  version: CONSENT_VERSION,
  analytics: false,
  ads: false,
  decidedAt: 0,
};

export function parseConsent(raw: string | undefined | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentState>;
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      version: CONSENT_VERSION,
      analytics: parsed.analytics === true,
      ads: parsed.ads === true,
      decidedAt: typeof parsed.decidedAt === "number" ? parsed.decidedAt : 0,
    };
  } catch {
    return null;
  }
}

export function serialiseConsent(state: ConsentState): string {
  return encodeURIComponent(JSON.stringify(state));
}

/** Google Consent Mode v2 payload for a given state. */
export function consentModeSignals(state: ConsentState): Record<string, "granted" | "denied"> {
  return {
    ad_storage: state.ads ? "granted" : "denied",
    ad_user_data: state.ads ? "granted" : "denied",
    ad_personalization: state.ads ? "granted" : "denied",
    analytics_storage: state.analytics ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  };
}
