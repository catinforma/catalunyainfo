import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getMessages } from "@/lib/i18n";
import { HUB_VISIBLE, dateQuestion, displayName, hubCopy } from "@/lib/programmatic/holidays/copy";
import { SNAPSHOT, byComarca } from "@/lib/programmatic/holidays/data";
import { dayMonth } from "@/lib/programmatic/holidays/format";
import { esName, joinList } from "@/lib/programmatic/holidays/names";
import { DATE_PAGES, comarcaAnchor, comarcaPath, datePath, hubPath, municipalityPath, type MuniLocale } from "@/lib/programmatic/holidays/paths";

import { GuideLinks, Sources } from "./parts";

export function hubCrumbs(locale: MuniLocale): Crumb[] {
  const t = hubCopy(locale);
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: t.breadcrumb, href: hubPath(locale) },
  ];
}

/**
 * The index of the family: every municipality page, grouped by comarca.
 * Since tranche 3 a comarca can hold 68 towns (Alt Empordà), so each section
 * shows its largest towns with their two days and folds the rest into a list
 * of names; the comarca page has all of them with their days in a table.
 */
export function HubPage({ locale }: { locale: MuniLocale }) {
  const t = hubCopy(locale);
  const groups = byComarca();
  const show = (name: string) => (locale === "es" ? esName(name) : name);

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
        </div>

        {/* The dated questions first: with every town below, they would sit a long scroll away. */}
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
          {groups.map((group) => {
            const visible = group.municipalities.slice(0, HUB_VISIBLE);
            const rest = group.municipalities.slice(HUB_VISIBLE);
            return (
              <section key={group.comarca} className="mt-8" aria-labelledby={comarcaAnchor(group.comarca)}>
                <h2 id={comarcaAnchor(group.comarca)} className="text-lg">
                  {group.comarca}
                </h2>
                <p className="mt-1 text-sm">
                  <span className="text-[var(--color-muted)]">{t.towns(group.municipalities.length)} · </span>
                  <Link href={comarcaPath(locale, group.slug)}>{t.table(group.comarca, group.municipalities.length)}</Link>
                </p>
                <ul className="mt-3 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((m) => (
                    <li key={m.slug}>
                      <Link href={municipalityPath(locale, m.slug)}>{displayName(m, locale)}</Link>
                      <span className="block text-xs text-[var(--color-muted)]">
                        {m.local.length > 0 ? joinList(m.local.map((d) => dayMonth(d, locale)), locale) : t.byNucleus}
                      </span>
                    </li>
                  ))}
                </ul>
                {rest.length > 0 ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm">{t.more(rest.length)}</summary>
                    <ul className="mt-2 list-none columns-2 gap-x-6 p-0 text-sm sm:columns-3 lg:columns-4">
                      {rest.map((m) => (
                        <li key={m.slug} className="break-inside-avoid py-0.5">
                          <Link href={municipalityPath(locale, m.slug)}>{displayName(m, locale)}</Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </section>
            );
          })}
        </nav>

        {SNAPSHOT.excluded.length > 0 ? (
          <section className="mt-12" aria-labelledby="ci-hol-excluded">
            <h2 id="ci-hol-excluded">{t.excludedTitle}</h2>
            <p className="ci-measure mt-3">{t.excludedLead}</p>
            <ul className="mt-3 list-none columns-1 gap-x-6 p-0 text-sm sm:columns-2 lg:columns-3">
              {[...SNAPSHOT.excluded]
                .sort((a, b) => a.name.localeCompare(b.name, "ca"))
                .map((e) => (
                  <li key={e.ine} className="break-inside-avoid py-0.5">
                    {show(e.name)} <span className="text-[var(--color-muted)]">({e.comarca})</span>
                  </li>
                ))}
            </ul>
          </section>
        ) : null}

        <GuideLinks keys={["holidayToday", "workCalendar", "localHolidays", "shops", "school", "decemberBridge"]} locale={locale} title={t.guidesTitle} />

        <Sources keys={["localOrder", "amendment", "openData", "regional2026", "regional2027", "population"]} locale={locale} title={t.sourcesTitle} />
      </div>
    </article>
  );
}
