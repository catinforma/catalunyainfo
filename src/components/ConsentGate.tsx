"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { CONSENT_VERSION, type ConsentState } from "@/lib/analytics/consent";
import {
  readConsentCookie,
  readServerSnapshot,
  recordConsent,
  snapshotToState,
  subscribeConsent,
} from "@/lib/analytics/consent-store";
import type { Messages } from "@/lib/i18n";
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
// Strings arrive as props from the server component that renders this one.
// Importing getMessages here shipped all three languages' dictionaries
// (~17 KB) to every page, because this component is on every page.
export interface ConsentCopy {
  consent: Messages["consent"];
  legalLabel: string;
}

export function ConsentGate({ locale, t }: { locale: Locale; t: ConsentCopy }) {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  const snapshot = useSyncExternalStore(
    subscribeConsent,
    readConsentCookie,
    readServerSnapshot,
  );
  const state = snapshotToState(snapshot);
  const [expanded, setExpanded] = useState(false);

  // While the card is up the page behind it must not scroll under the scrim
  // (body.ci-consent-open in globals.css).
  const showingBanner = state === null;
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showingBanner) return;
    document.body.classList.add("ci-consent-open");
    // A modal dialog takes focus, so keyboard and screen-reader users land in it.
    dialogRef.current?.focus({ preventScroll: true });
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
        /* A centred card over a dimmed page, on phones and desktops alike (owner,
           6 Nov 2026: the bottom bar was easy to scroll past, and an unanswered
           banner counts as "no"). Legal: accept and reject keep the same weight
           and are one click each (AEPD cookie guide); the scrim does not answer
           for the visitor, only the buttons do; a consent dialog is exempt from
           Google's intrusive-interstitial rule. */
        <div className="ci-consent-scrim" role="presentation">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ci-consent-title"
          className="ci-consent-card"
          tabIndex={-1}
          ref={dialogRef}
        >
          <div>
            <h2 id="ci-consent-title" className="font-sans text-lg font-semibold">
              {t.consent.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {t.consent.body}{" "}
              <a href={legalPath("cookies", locale)}>{t.legalLabel}</a>
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

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="ci-btn ci-btn-primary"
                onClick={() => decide(true, false)}
              >
                {t.consent.accept}
              </button>
              {/* Same weight as "accept": the AEPD's cookie guide requires
                  rejecting to be as easy and as visible as accepting. */}
              <button
                type="button"
                className="ci-btn ci-btn-primary"
                onClick={() => decide(false, false)}
              >
                {t.consent.reject}
              </button>
              <button
                type="button"
                className="ci-btn ci-btn-quiet col-span-2 justify-self-center px-1 py-1 text-sm underline"
                aria-expanded={expanded}
                onClick={() => setExpanded((v) => !v)}
              >
                {t.consent.manage}
              </button>
            </div>
          </div>
        </div>
        </div>
      ) : null}
    </>
  );
}
