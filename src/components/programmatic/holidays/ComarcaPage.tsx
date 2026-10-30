import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getMessages } from "@/lib/i18n";
import { comarcaCopy, comarcaH1, dateQuestion, displayName, hubCopy } from "@/lib/programmatic/holidays/copy";
import { byComarca, sharedDates, type ComarcaGroup } from "@/lib/programmatic/holidays/data";
import { LOCAL_DATE_PAGES } from "@/lib/programmatic/holidays/dates";
import { dayMonth, weekdayDayMonth } from "@/lib/programmatic/holidays/format";
import { esName, joinList } from "@/lib/programmatic/holidays/names";
import { DATE_PAGES, comarcaPath, datePath, hubPath, municipalityPath, type MuniLocale } from "@/lib/programmatic/holidays/paths";

import { GuideLinks, Sources } from "./parts";

/** Nuclei named per row of the table; a town with more sends the reader to its own page. */
const NUCLEI_PER_ROW = 3;
/** Shared days listed under the table. */
const SHARED_SHOWN = 5;

export function comarcaCrumbs(g: ComarcaGroup, locale: MuniLocale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: hubCopy(locale).breadcrumb, href: hubPath(locale) },
    { label: g.comarca, href: comarcaPath(locale, g.slug) },
  ];
}

/**
 * One comarca: each of its municipalities with its two local days (or its
 * nuclei's), straight from the snapshot, in a table; the days several towns
 * share; who chose their own shop-opening days; who has no days at all.
 */
export function ComarcaPage({ g, locale }: { g: ComarcaGroup; locale: MuniLocale }) {
  const t = comarcaCopy(g, locale);
  const shared = sharedDates(g).slice(0, SHARED_SHOWN);
  const others = byComarca().filter((o) => o.slug !== g.slug);
  const nucleusName = (name: string) => (locale === "es" ? esName(name) : name);
  const days = (dates: string[]) => joinList(dates.map((d) => dayMonth(d, locale)), locale);

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={comarcaCrumbs(g, locale)} locale={locale} />
          <h1 className="ci-measure">{comarcaH1(g, locale)}</h1>
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <p className="ci-lead">{t.lead}</p>
          {t.nucleiOnly ? <p>{t.nucleiOnly}</p> : null}
          {t.excluded ? <p>{t.excluded}</p> : null}

          <h2 id="municipis">{t.tableTitle}</h2>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table">
              <caption className="pb-2 text-left text-sm text-[var(--color-muted)]">{t.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.cols.town}</th>
                  <th scope="col">{t.cols.days}</th>
                </tr>
              </thead>
              <tbody>
                {g.municipalities.map((m) => {
                  const shown = m.nuclei.slice(0, NUCLEI_PER_ROW);
                  const more = m.nuclei.length - shown.length;
                  return (
                    <tr key={m.slug}>
                      <th scope="row" className="font-normal">
                        <Link href={municipalityPath(locale, m.slug)}>{displayName(m, locale)}</Link>
                      </th>
                      <td>
                        {m.local.length > 0 ? (
                          joinList(
                            m.local.map((d) => weekdayDayMonth(d, locale)),
                            locale,
                          )
                        ) : (
                          <span>{t.byNucleus}</span>
                        )}
                        {shown.length > 0 ? (
                          <small className="block">
                            {m.local.length > 0 ? `${t.cols.nuclei}: ` : ""}
                            {shown.map((n) => `${nucleusName(n.name)} (${days(n.dates)})`).join("; ")}
                            {more > 0 ? `; ${t.moreNuclei(more)}` : ""}
                          </small>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {t.sharedLead && shared.length > 0 ? (
            <>
              <h2 id="dies">{t.sharedTitle}</h2>
              <p>{t.sharedLead}</p>
              <ul>
                {shared.map((s) => {
                  const page = LOCAL_DATE_PAGES[s.date];
                  return (
                    <li key={s.date}>
                      {t.sharedItem(s.date, s.towns.length)}
                      {page ? (
                        <>
                          {" · "}
                          <Link href={datePath(locale, page)}>{dateQuestion(page, locale)}</Link>
                        </>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}

          <h2 id="botigues">{t.shopsTitle}</h2>
          <p>{t.shops}</p>

          <h2 id="festius-2027">{t.nextTitle}</h2>
          <p>{t.next}</p>
        </div>

        <section className="mt-12" aria-labelledby="ci-hol-comarques">
          <h2 id="ci-hol-comarques">{t.othersTitle}</h2>
          <p className="mt-4 text-sm">
            {others.map((o, index) => (
              <span key={o.slug}>
                {index > 0 ? " · " : ""}
                <Link href={comarcaPath(locale, o.slug)}>{o.comarca}</Link>
              </span>
            ))}
          </p>
          <p className="mt-4 text-sm">
            <Link href={hubPath(locale)}>{t.hubLink}</Link>
          </p>
        </section>

        <section className="mt-12" aria-labelledby="ci-hol-dates">
          <h2 id="ci-hol-dates">{t.datesTitle}</h2>
          <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
            {DATE_PAGES.map((d) => (
              <li key={d}>
                <Link href={datePath(locale, d)}>{dateQuestion(d, locale)}</Link>
              </li>
            ))}
          </ul>
        </section>

        <GuideLinks keys={["holidayToday", "workCalendar", "localHolidays", "shops", "school", "decemberBridge"]} locale={locale} title={t.guidesTitle} />

        <Sources keys={["localOrder", "amendment", "openData", "regional2027", "shops", "shopsOrder", "population"]} locale={locale} title={t.sourcesTitle} />
      </div>
    </article>
  );
}
