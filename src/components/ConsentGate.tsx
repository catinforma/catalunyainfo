"use client";

import Script from "next/script";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { CONSENT_VERSION, type ConsentState } from "@/lib/analytics/consent";
import {
  readConsentCookie,
  readServerSnapshot,
  recordConsent,
  snapshotToState,
  subscribeConsent,
} from "@/lib/analytics/consent-store";
import { getMessages } from "@/lib/i18n";
import { legalPath } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/config";

/**
 * Consent, then measurement — in that order.
 *
 * On a first visit nothing third-party is requested at all: the GA4 tag is not
 * inserted until the visitor grants measurement consent. That keeps the first
 * page view free of third-party requests, which is also the single biggest
 * lever on the LCP of a content page.
 *
 * Consent Mode v2 defaults are set at the top of the same script that
 * initialises the tag, so `gtag('consent','default',…)` always runs before the
 * first `config` command, as Google requires.
 *
 * We deliberately do not use Google Tag Manager. See docs/ANALYTICS.md: with
 * one destination and a typed event contract, GTM would add a container to
 * download, a second place where tags can change without review, and no
 * capability we need. The decision is revisited if a second destination
 * appears.
 */
export function ConsentGate({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  const snapshot = useSyncExternalStore(
    subscribeConsent,
    readConsentCookie,
    readServerSnapshot,
  );
  const state = snapshotToState(snapshot);
  const [expanded, setExpanded] = useState(false);

  // The banner is fixed to the bottom of the viewport, so while it is up it
  // covers the last couple of hundred pixels of the document - which on a phone
  // is where a form's submit button ends up. Reserve the space for as long as
  // the banner is there.
  const showingBanner = state === null;
  useEffect(() => {
    if (!showingBanner) return;
    document.body.classList.add("ci-consent-open");
    return () => document.body.classList.remove("ci-consent-open");
  }, [showingBanner]);

  const decide = useCallback((analytics: boolean, ads: boolean) => {
    recordConsent({
      version: CONSENT_VERSION,
      analytics,
      ads,
      decidedAt: Date.now(),
    } satisfies ConsentState);
  }, []);

  // No measurement id configured means no non-essential cookie is ever set, so
  // there is nothing to ask permission for. Render nothing at all.
  if (!measurementId) return null;

  // Not known yet: render nothing rather than flash a banner at a visitor who
  // has already answered.
  if (state === undefined) return null;

  const analyticsGranted = state?.analytics === true;

  return (
    <>
      {analyticsGranted ? (
        <>
          <Script
            id="ci-ga4-lib"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          />
          <Script id="ci-ga4-init" strategy="afterInteractive">
            {[
              "window.dataLayer=window.dataLayer||[];",
              "function gtag(){dataLayer.push(arguments);}",
              "window.gtag=gtag;",
              "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted'});",
              "gtag('consent','update',{analytics_storage:'granted'});",
              "gtag('js',new Date());",
              `gtag('config','${measurementId}',{anonymize_ip:true,send_page_view:true});`,
            ].join("")}
          </Script>
        </>
      ) : null}

      {state === null ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="ci-consent-title"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-rule-strong)] bg-[var(--color-surface)] shadow-[var(--shadow-pop)]"
        >
          <div className="ci-shell py-4">
            <h2 id="ci-consent-title" className="font-sans text-base font-semibold">
              {t.consent.title}
            </h2>
            <p className="ci-measure mt-1 text-sm text-[var(--color-muted)]">
              {t.consent.body}{" "}
              <a href={legalPath("cookies", locale)}>{t.nav.legal}</a>
            </p>

            {expanded ? (
              <dl className="ci-facts mt-4 max-w-xl">
                <dt>{t.consent.necessary}</dt>
                <dd className="text-[var(--color-muted)]">{t.consent.necessaryNote}</dd>
                <dt>{t.consent.analytics}</dt>
                <dd className="text-[var(--color-muted)]">{t.consent.analyticsNote}</dd>
                <dt>{t.consent.ads}</dt>
                <dd className="text-[var(--color-muted)]">{t.consent.adsNote}</dd>
              </dl>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="ci-btn ci-btn-primary"
                onClick={() => decide(true, false)}
              >
                {t.consent.accept}
              </button>
              <button
                type="button"
                className="ci-btn ci-btn-quiet"
                onClick={() => decide(false, false)}
              >
                {t.consent.reject}
              </button>
              <button
                type="button"
                className="ci-btn ci-btn-quiet"
                aria-expanded={expanded}
                onClick={() => setExpanded((v) => !v)}
              >
                {t.consent.manage}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
