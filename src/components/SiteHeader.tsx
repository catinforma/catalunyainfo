import Link from "next/link";

import { getMessages } from "@/lib/i18n";
import { sectionPath, type SectionKey } from "@/lib/i18n/routes";
import type { Locale } from "@/lib/i18n/config";
import { nonEmptySections } from "@/lib/content/repository";
import { MENU_BUTTON_LABEL, MORE_LABEL, moreItems, primaryItems } from "@/lib/nav/menu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NewsAlerts } from "./NewsAlerts";
import { SearchBox } from "./SearchBox";
import { Wordmark } from "@/components/Wordmark";
import { MenuDisclosure } from "@/components/nav/MenuDisclosure";
import { ShareIcon } from "@/components/share/icons";

/** Sections that may appear in the primary navigation, in editorial order. */
const PRIMARY: SectionKey[] = ["destinations", "guides", "events", "routes", "news"];
/** Sections shown in the desktop bar; the rest go in its "More" group. */
const BAR_SECTIONS: SectionKey[] = ["guides", "destinations", "events"];

interface NavLink {
  key: string;
  label: string;
  href: string;
  current: boolean;
}

/**
 * A menu entry that leads to an empty page is worse than no menu entry: it
 * promises something the site does not have, and it is the first thing a
 * quality review notices. So the section links are built from what is actually
 * published - which also means a section reappears on its own the day its
 * first entry goes live, with nothing to remember to switch back on.
 *
 * If the database cannot answer, `nonEmptySections` returns an empty set and we
 * fall back to showing everything: a degraded read must not silently delete the
 * site's navigation.
 *
 * Before the sections come the topical hubs that carry the traffic (strikes,
 * holidays, elections: lib/nav/menu.ts, chosen from Search Console data).
 * From lg up they sit in a visible bar with a "More" group; below lg one
 * menu button opens the whole list.
 */
export async function SiteHeader({
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
  const filled = await nonEmptySections(locale, PRIMARY);
  const sections = filled.size > 0 ? PRIMARY.filter((key) => filled.has(key)) : PRIMARY;
  const here = translations[locale];

  const topical: NavLink[] = primaryItems(locale).map((item) => ({ ...item, current: item.href === here }));
  const more: NavLink[] = moreItems(locale).map((item) => ({ ...item, current: item.href === here }));
  // One current entry at most: on the strikes hub, "Strikes" rather than its section, "Guides".
  const onTopicalHub = [...topical, ...more].some((link) => link.current);
  const sectionLinks: NavLink[] = sections.map((key) => ({
    key,
    label: t.nav[key],
    href: sectionPath(key, locale),
    current: !onTopicalHub && activeSection === key,
  }));
  const bar = [...topical, ...sectionLinks.filter((s) => BAR_SECTIONS.includes(s.key as SectionKey))];
  const barMore = [...sectionLinks.filter((s) => !BAR_SECTIONS.includes(s.key as SectionKey)), ...more];
  const phone = [...topical, ...sectionLinks];

  return (
    <>
      <header className="ci-header">
        <div className="ci-shell flex items-center gap-4 py-3">
          <Wordmark href={`/${locale}/`} />

          <nav aria-label={t.common.menu} className="ml-auto hidden items-center gap-5 lg:flex">
            {bar.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="ci-nav-link whitespace-nowrap"
                aria-current={link.current ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <MenuDisclosure
              panelId="ci-menu-more"
              className="ci-menu ci-menu-more"
              summaryClassName="ci-nav-link"
              panelClassName="ci-menu-dropdown"
              summary={
                <>
                  {MORE_LABEL[locale]}
                  <ShareIcon name="caret" />
                </>
              }
            >
              <ul>
                {barMore.map((link) => (
                  <li key={link.key}>
                    <Link href={link.href} aria-current={link.current ? "page" : undefined}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </MenuDisclosure>
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:ml-0">
            {showSearch ? (
              <div className="hidden xl:block">
                <SearchBox locale={locale} />
              </div>
            ) : null}
            <LanguageSwitcher
              locale={locale}
              translations={translations}
              label={t.common.changeLanguage}
            />
            {/* Below lg: one button for the whole menu. A <details>, so it
                opens without JavaScript (components/nav/MenuDisclosure.tsx). */}
            <MenuDisclosure
              panelId="ci-menu-panel"
              className="ci-menu lg:hidden"
              summaryClassName="ci-menu-button"
              panelClassName="ci-menu-panel"
              summary={
                <>
                  <ShareIcon name="menu" className="ci-icon ci-menu-when-closed" />
                  <ShareIcon name="close" className="ci-icon ci-menu-when-open" />
                  <span className="ci-visually-hidden">{MENU_BUTTON_LABEL[locale]}</span>
                </>
              }
            >
              <nav aria-label={t.common.menu} className="ci-shell">
                <ul className="ci-menu-list">
                  {phone.map((link) => (
                    <li key={link.key}>
                      <Link href={link.href} aria-current={link.current ? "page" : undefined}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {more.map((link, i) => (
                    <li key={link.key} className={i === 0 ? "ci-menu-sep" : undefined}>
                      <Link href={link.href} aria-current={link.current ? "page" : undefined}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </MenuDisclosure>
          </div>
        </div>
      </header>
      {/* The news of the moment, in this page's language (lib/alerts/news-alerts.ts).
          Outside the sticky header, so it scrolls away with the page. */}
      <NewsAlerts locale={locale} currentPath={translations[locale]} />
    </>
  );
}
