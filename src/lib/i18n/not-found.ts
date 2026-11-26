import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n";
import { sectionPath } from "@/lib/i18n/routes";
import { MENU_LABELS, MENU_PATHS } from "@/lib/nav/menu";

/**
 * The 404 page's language and its way out (app/(public)/[locale]/not-found.tsx).
 *
 * Next renders not-found without props, so the page reads the `[locale]` root
 * param (next/root-params) and passes it through here. Anything that is not
 * one of our locales - a missing param, a build-time render of the generic
 * `/_not-found` - falls back to the default edition rather than throwing: a
 * 404 must never itself fail to render.
 *
 * Before 27 Nov 2026 the page was always in Catalan, also on /es/ and /en/
 * URLs, and had no header (design pass round 2, docs/SEO_EXPERIMENTS.md).
 */
export function notFoundLocale(raw: unknown): Locale {
  return typeof raw === "string" && isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export interface NotFoundLink {
  key: "home" | "guides" | "holidays" | "calculators" | "strikes";
  label: string;
  href: string;
}

/**
 * Where a lost visitor most likely wanted to go, in the visitor's language:
 * the home page and the hubs that carry the traffic (same targets as the
 * header menu, lib/nav/menu.ts). Search is offered as a form above the list.
 */
export function notFoundLinks(locale: Locale): NotFoundLink[] {
  const t = getMessages(locale);
  return [
    { key: "home", label: t.common.backToHome, href: `/${locale}/` },
    { key: "guides", label: t.nav.guides, href: sectionPath("guides", locale) },
    { key: "holidays", label: MENU_LABELS.holidays[locale], href: MENU_PATHS.holidays[locale] },
    { key: "calculators", label: MENU_LABELS.calculators[locale], href: MENU_PATHS.calculators[locale] },
    { key: "strikes", label: MENU_LABELS.strikes[locale], href: MENU_PATHS.strikes[locale] },
  ];
}
