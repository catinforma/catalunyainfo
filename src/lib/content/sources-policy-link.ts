import type { Locale } from "@/lib/i18n/config";
import { legalPath } from "@/lib/i18n/routes";

/**
 * The line under a page's source list that links to the "how we work with
 * sources" page (/ca/fonts/, /es/fuentes/, /en/sources/). Batch 7C, 27 Nov
 * 2026: the source lists of the site (.ci-sources) cited official sources but
 * none said how we pick and check them; the method page was reachable only
 * from the footer. One line, same words everywhere, so readers and engines
 * find the method stated next to every source list.
 */
const LABEL: Record<Locale, string> = {
  ca: "Com triem i comprovem les fonts",
  es: "Cómo elegimos y comprobamos las fuentes",
  en: "How we choose and check sources",
};

export function sourcesPolicyLink(locale: Locale): { href: string; label: string } {
  return { href: legalPath("sources", locale), label: LABEL[locale] };
}
