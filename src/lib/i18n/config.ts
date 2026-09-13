/** Supported content + interface locales. Order matters: first = default. */
export const LOCALES = ["ca", "es", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ca";

/**
 * The locale advertised as `x-default`.
 *
 * `x-default` is for users whose language does not match any of ours. Those
 * users are, by definition, neither Catalan nor Spanish speakers, so the
 * English edition is the sensible landing point. The Catalan edition remains
 * the default for bare `/` requests coming from ca/es browsers.
 */
export const X_DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** BCP-47 tags used in <html lang>, hreflang and Open Graph. */
export const HTML_LANG: Record<Locale, string> = {
  ca: "ca",
  es: "es",
  en: "en",
};

export const OG_LOCALE: Record<Locale, string> = {
  ca: "ca_ES",
  es: "es_ES",
  en: "en_GB",
};

export const LOCALE_LABEL: Record<Locale, string> = {
  ca: "Català",
  es: "Castellano",
  en: "English",
};

/** Short label used inside the compact language switcher. */
export const LOCALE_SHORT: Record<Locale, string> = {
  ca: "CA",
  es: "ES",
  en: "EN",
};

/** `Intl` locale used for dates and numbers. */
export const INTL_LOCALE: Record<Locale, string> = {
  ca: "ca-ES",
  es: "es-ES",
  en: "en-GB",
};
