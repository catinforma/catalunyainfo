/**
 * Browser-side handles on Google's ad and consent globals.
 *
 * `googlefc` (Privacy & messaging, Google's consent tool) and `adsbygoogle`
 * are queues: they may be pushed to before Google's script has loaded, and
 * Google requires `googlefc` to exist on the window before the ad script runs
 * (developers.google.com/funding-choices/fc-api-docs).
 */

/** googlefc.ConsentModePurposeStatusEnum: UNKNOWN 0, GRANTED 1, DENIED 2, NOT_APPLICABLE 3, NOT_CONFIGURED 4. */
export const CONSENT_MODE_GRANTED = 1;

export interface ConsentModeValues {
  adStoragePurposeConsentStatus: number;
  adUserDataPurposeConsentStatus: number;
  adPersonalizationPurposeConsentStatus: number;
  analyticsStoragePurposeConsentStatus: number;
}

type FcCallback = Record<string, () => void> | (() => void);

interface GoogleFc {
  callbackQueue: FcCallback[] | { push: (cb: FcCallback) => void };
  getGoogleConsentModeValues?: () => ConsentModeValues;
  showRevocationMessage?: () => void;
}

interface TcData {
  eventStatus?: string;
}

type AdsQueue = { push: (x: object) => void; pauseAdRequests?: 0 | 1 };

declare global {
  interface Window {
    googlefc?: GoogleFc;
    adsbygoogle?: AdsQueue | object[];
    __tcfapi?: (command: string, version: number, cb: (data: TcData, success: boolean) => void) => void;
    __ciAdsScript?: boolean;
    __ciAdsActive?: boolean;
  }
}

/** Google's consent-tool queue, created if Google's script has not run yet. */
export function fcQueue(): { push: (cb: FcCallback) => void } {
  window.googlefc = window.googlefc || ({ callbackQueue: [] } as GoogleFc);
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  return window.googlefc.callbackQueue as { push: (cb: FcCallback) => void };
}

/** The AdSense queue, created if the script has not run yet. */
export function adsQueue(): AdsQueue {
  window.adsbygoogle = window.adsbygoogle || [];
  return window.adsbygoogle as AdsQueue;
}

/** Consent Mode signals from Google's consent tool; anything but GRANTED is denied. */
export function readConsentMode(): Record<string, "granted" | "denied"> | null {
  const v = window.googlefc?.getGoogleConsentModeValues?.();
  if (!v) return null;
  const m = (s: number) => (s === CONSENT_MODE_GRANTED ? "granted" : "denied");
  return {
    ad_storage: m(v.adStoragePurposeConsentStatus),
    ad_user_data: m(v.adUserDataPurposeConsentStatus),
    ad_personalization: m(v.adPersonalizationPurposeConsentStatus),
    analytics_storage: m(v.analyticsStoragePurposeConsentStatus),
  };
}

/** Calls `onChange` whenever Google's consent tool has (new) answers. */
export function watchConsentMode(onChange: () => void): void {
  const q = fcQueue();
  q.push({ CONSENT_MODE_DATA_READY: onChange });
  q.push({
    CONSENT_API_READY: () => {
      window.__tcfapi?.("addEventListener", 2.2, (data, success) => {
        if (!success) return;
        if (data?.eventStatus === "useractioncomplete" || data?.eventStatus === "tcloaded") {
          onChange();
          // Consent Mode values can trail the TCF event by a moment.
          window.setTimeout(onChange, 800);
        }
      });
    },
  });
}

/** Opens Google's consent message again (footer "cookie settings"). */
export function showConsentAgain(): void {
  if (window.googlefc?.showRevocationMessage) {
    window.googlefc.showRevocationMessage();
    return;
  }
  fcQueue().push({ CONSENT_API_READY: () => window.googlefc?.showRevocationMessage?.() });
}
