"use client";

import { rememberLocale } from "@/lib/analytics/consent-store";
import { HTML_LANG, LOCALES, LOCALE_LABEL, LOCALE_SHORT, type Locale } from "@/lib/i18n/config";

/**
 * Real anchors, one per available language edition.
 *
 * They carry `hreflang` so the relationship is machine-readable, and they are
 * crawlable links rather than a JavaScript switcher — the previous site swapped
 * content client-side, which is precisely what kept Google from seeing it.
 *
 * A language the current page has no translation for is rendered as a link to
 * that language's home page, never as a link to a page in the wrong language.
 */
export function LanguageSwitcher({
  locale,
  translations,
  label,
}: {
  locale: Locale;
  /** Site-relative href per locale, e.g. `{ ca: "/ca/montserrat/" }`. */
  translations: Partial<Record<Locale, string>>;
  label: string;
}) {
  return (
    <nav aria-label={label} className="flex items-center gap-1">
      {LOCALES.map((l) => {
        const href = translations[l] ?? `/${l}/`;
        const current = l === locale;
        return (
          <a
            key={l}
            href={href}
            hrefLang={HTML_LANG[l]}
            lang={HTML_LANG[l]}
            aria-current={current ? "true" : undefined}
            onClick={() => rememberLocale(l)}
            title={LOCALE_LABEL[l]}
            className={[
              "rounded-xs px-1.5 py-0.5 text-xs no-underline",
              current
                ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]",
            ].join(" ")}
          >
            {LOCALE_SHORT[l]}
          </a>
        );
      })}
    </nav>
  );
}
