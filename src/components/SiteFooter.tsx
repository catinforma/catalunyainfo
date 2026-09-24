import Link from "next/link";

import { ConsentSettingsButton } from "@/components/ConsentSettingsButton";
import { hasAnyAuthors, hasAnyTags, nonEmptySections } from "@/lib/content/repository";
import { getMessages } from "@/lib/i18n";
import { LEGAL_KEYS, legalPath, sectionPath } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";

/** Sections the footer may list. Empty ones are dropped, like in the header. */
const FOOTER_SECTIONS = ["destinations", "guides", "events", "routes", "news"] as const;

/** Legal and editorial-trust pages, which AdSense and readers both look for. */
const FOOTER_LEGAL = LEGAL_KEYS;

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const year = new Date().getUTCFullYear();
  const filled = await nonEmptySections(locale, FOOTER_SECTIONS);
  const [hasTopics, hasAuthors] = await Promise.all([hasAnyTags(locale), hasAnyAuthors()]);
  const sections = filled.size > 0 ? FOOTER_SECTIONS.filter((k) => filled.has(k)) : FOOTER_SECTIONS;

  return (
    <footer className="ci-footer">
      <div className="ci-shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href={`/${locale}/`} className="ci-wordmark">
            Catalunya<span>Info</span>
          </Link>
          <p className="ci-measure mt-3 text-sm text-[var(--color-muted)]">
            {t.footer.editorialNote}
          </p>
        </div>

        <nav aria-labelledby="ci-foot-sections">
          <h2 id="ci-foot-sections" className="ci-label mb-3 font-sans">
            {t.common.home}
          </h2>
          <ul className="flex list-none flex-col gap-2 p-0 text-sm">
            {sections.map((key) => (
              <li key={key}>
                <Link href={sectionPath(key, locale)}>{t.nav[key]}</Link>
              </li>
            ))}
            {/* Topics and authors are linked only once they have something
                to list. Both are out of the sitemap for the same reason, and
                a link from every page to an empty index is the other half of
                that problem. */}
            {hasTopics ? (
              <li>
                <Link href={sectionPath("topics", locale)}>{t.nav.topics}</Link>
              </li>
            ) : null}
          </ul>
        </nav>

        <nav aria-labelledby="ci-foot-about">
          <h2 id="ci-foot-about" className="ci-label mb-3 font-sans">
            {t.nav.about}
          </h2>
          <ul className="flex list-none flex-col gap-2 p-0 text-sm">
            <li>
              <Link href={sectionPath("about", locale)}>{t.nav.about}</Link>
            </li>
            {hasAuthors ? (
              <li>
                <Link href={sectionPath("authors", locale)}>{t.nav.authors}</Link>
              </li>
            ) : null}
            <li>
              <Link href={sectionPath("contact", locale)}>{t.nav.contact}</Link>
            </li>
            <li>
              <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="ci-foot-legal">
          <h2 id="ci-foot-legal" className="ci-label mb-3 font-sans">
            {t.nav.legal}
          </h2>
          <ul className="flex list-none flex-col gap-2 p-0 text-sm">
            {FOOTER_LEGAL.map((key) => (
              <li key={key}>
                <Link href={legalPath(key, locale)}>{legalLabel(key, locale)}</Link>
              </li>
            ))}
            <li>
              <ConsentSettingsButton locale={locale} />
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-[var(--color-rule)]">
        <div className="ci-shell flex flex-wrap items-center justify-between gap-3 py-4 text-xs text-[var(--color-muted)]">
          <p>
            © {year} {SITE.name}. {t.footer.rights}
          </p>
          <p className="ci-numeric">{SITE.productionOrigin.replace("https://", "")}</p>
        </div>
      </div>
    </footer>
  );
}

/** Human label for a legal page, taken from the localised slug. */
function legalLabel(key: (typeof LEGAL_KEYS)[number], locale: Locale): string {
  const labels: Record<(typeof LEGAL_KEYS)[number], Record<Locale, string>> = {
    "legal-notice": { ca: "Avís legal", es: "Aviso legal", en: "Legal notice" },
    privacy: { ca: "Privacitat", es: "Privacidad", en: "Privacy" },
    cookies: { ca: "Galetes", es: "Cookies", en: "Cookies" },
    "editorial-policy": {
      ca: "Política editorial",
      es: "Política editorial",
      en: "Editorial policy",
    },
    corrections: { ca: "Correccions", es: "Correcciones", en: "Corrections" },
    sources: { ca: "Ús de fonts", es: "Uso de fuentes", en: "Use of sources" },
    accessibility: { ca: "Accessibilitat", es: "Accesibilidad", en: "Accessibility" },
  };
  return labels[key][locale];
}

export { legalLabel };
