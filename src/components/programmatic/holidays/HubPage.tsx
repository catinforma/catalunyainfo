import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getMessages } from "@/lib/i18n";
import { dateQuestion, displayName, hubCopy } from "@/lib/programmatic/holidays/copy";
import { byComarca } from "@/lib/programmatic/holidays/data";
import { dayMonth } from "@/lib/programmatic/holidays/format";
import { GUIDES } from "@/lib/programmatic/holidays/links";
import { joinList } from "@/lib/programmatic/holidays/names";
import { DATE_PAGES, comarcaAnchor, datePath, hubPath, municipalityPath, type MuniLocale } from "@/lib/programmatic/holidays/paths";

import { GuideLinks, Sources } from "./parts";

export function hubCrumbs(locale: MuniLocale): Crumb[] {
  const t = hubCopy(locale);
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: t.breadcrumb, href: hubPath(locale) },
  ];
}

/** The index of the family: every municipality page, grouped by comarca, with its two days. */
export function HubPage({ locale }: { locale: MuniLocale }) {
  const t = hubCopy(locale);
  const groups = byComarca();

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={hubCrumbs(locale)} locale={locale} />
          <h1 className="ci-measure">{t.h1}</h1>
          <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{t.lead}</p>
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <p>
            {t.population} {t.next}
          </p>
          {t.excludedNote ? <p>{t.excludedNote}</p> : null}
          <p>
            <Link href={GUIDES.localHolidays[locale]}>{t.allMunicipalities}</Link>
          </p>
        </div>

        {/* The dated questions first: with 300 towns below, they would sit a long scroll away. */}
        <section className="mt-10" aria-labelledby="ci-hol-dates">
          <h2 id="ci-hol-dates">{t.datesTitle}</h2>
          <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
            {DATE_PAGES.map((d) => (
              <li key={d}>
                <Link href={datePath(locale, d)}>{dateQuestion(d, locale)}</Link>
              </li>
            ))}
          </ul>
        </section>

        {/* A jump list to each comarca's section. */}
        <p className="mt-10 text-sm">
          <span className="font-semibold">{t.jump}</span>{" "}
          {groups.map((group, index) => (
            <span key={group.comarca}>
              {index > 0 ? " · " : ""}
              <a href={`#${comarcaAnchor(group.comarca)}`}>{group.comarca}</a>
            </span>
          ))}
        </p>

        <nav className="mt-8" aria-label={t.h1}>
          {groups.map((group) => (
            <section key={group.comarca} className="mt-8" aria-labelledby={comarcaAnchor(group.comarca)}>
              <h2 id={comarcaAnchor(group.comarca)} className="text-lg">
                {group.comarca}
              </h2>
              <ul className="mt-3 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {group.municipalities.map((m) => (
                  <li key={m.slug}>
                    <Link href={municipalityPath(locale, m.slug)}>{displayName(m, locale)}</Link>
                    <span className="block text-xs text-[var(--color-muted)]">
                      {m.local.length > 0
                        ? joinList(m.local.map((d) => dayMonth(d, locale)), locale)
                        : locale === "ca"
                          ? "Dies diferents per nucli"
                          : "Días distintos por núcleo"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <GuideLinks keys={["holidayToday", "workCalendar", "localHolidays", "shops", "school", "decemberBridge"]} locale={locale} title={t.guidesTitle} />

        <Sources keys={["localOrder", "amendment", "openData", "regional2026", "regional2027", "population"]} locale={locale} title={t.sourcesTitle} />
      </div>
    </article>
  );
}
