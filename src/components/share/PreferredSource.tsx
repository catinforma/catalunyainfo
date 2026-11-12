import type { Locale } from "@/lib/i18n/config";

/**
 * "Add us on Google": Google Search's Preferred Sources deeplink.
 *
 * Format from Google's documentation (read 12 Nov 2026,
 * https://developers.google.com/search/docs/appearance/preferred-sources,
 * "Deeplink implementation"): `https://www.google.com/preferences/source?q=`
 * followed by the publication's domain name. Checked with curl the same day
 * (HTTP 200; the tool then asks the reader to sign in to Google).
 *
 * A plain link, not Google's `publisher.js` button: no third-party script, so
 * the CSP and the consent model are untouched, and it opens only when tapped.
 */
export const PREFERRED_SOURCE_URL = "https://www.google.com/preferences/source?q=catalunyainfo.com";

export const PREFERRED_SOURCE_LABEL: Record<Locale, string> = {
  ca: "Afegeix-nos com a font preferida a Google",
  es: "Añádenos como fuente preferida en Google",
  en: "Add us as a preferred source on Google",
};

export function PreferredSource({ locale }: { locale: Locale }) {
  return (
    <a href={PREFERRED_SOURCE_URL} rel="noopener" target="_blank" className="ci-preferred-source">
      <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" focusable="false">
        <path
          fill="currentColor"
          d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z"
        />
      </svg>
      {PREFERRED_SOURCE_LABEL[locale]}
    </a>
  );
}
