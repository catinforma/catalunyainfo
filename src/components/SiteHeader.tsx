import Link from "next/link";

import { getMessages } from "@/lib/i18n";
import { SECTION_KEYS, sectionPath, type SectionKey } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SearchBox } from "./SearchBox";

/** Sections that appear in the primary navigation, in editorial order. */
const PRIMARY: SectionKey[] = ["destinations", "guides", "events", "routes", "news"];

export function SiteHeader({
  locale,
  translations,
  activeSection,
  /** Hides the header search on the homepage, where the hero already has one. */
  showSearch = true,
}: {
  locale: Locale;
  translations: Partial<Record<Locale, string>>;
  activeSection?: SectionKey | null;
  showSearch?: boolean;
}) {
  const t = getMessages(locale);

  return (
    <header className="ci-header">
      <div className="ci-shell flex items-center gap-4 py-3">
        <Link href={`/${locale}/`} className="ci-wordmark">
          Catalunya<span>Info</span>
        </Link>

        <nav
          aria-label={t.common.menu}
          className="ml-auto hidden items-center gap-5 md:flex"
        >
          {PRIMARY.map((key) => (
            <Link
              key={key}
              href={sectionPath(key, locale)}
              className="ci-nav-link"
              aria-current={activeSection === key ? "page" : undefined}
            >
              {t.nav[key]}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          {showSearch ? (
            <div className="hidden lg:block">
              <SearchBox locale={locale} />
            </div>
          ) : null}
          <LanguageSwitcher
            locale={locale}
            translations={translations}
            label={t.common.changeLanguage}
          />
        </div>
      </div>

      {/* Small screens get the full section list as a scrollable rail rather
          than a hamburger: five links fit, and a visible nav beats a hidden
          one for both discovery and crawling. */}
      <nav
        aria-label={t.common.menu}
        className="ci-shell flex gap-4 overflow-x-auto border-t border-[var(--color-rule)] py-2 md:hidden"
      >
        {SECTION_KEYS.filter((k) => PRIMARY.includes(k)).map((key) => (
          <Link
            key={key}
            href={sectionPath(key, locale)}
            className="ci-nav-link whitespace-nowrap"
            aria-current={activeSection === key ? "page" : undefined}
          >
            {t.nav[key]}
          </Link>
        ))}
      </nav>
    </header>
  );
}
