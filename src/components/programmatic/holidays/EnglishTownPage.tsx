import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getMessages } from "@/lib/i18n";
import { NEXT, YEAR, localThrough, nextYearFor, regionalThrough, statusDays, yearRows } from "@/lib/programmatic/holidays/data";
import { englishTowns, isLargestTown } from "@/lib/programmatic/holidays/english";
import { enName, englishHubCopy, englishTownCopy, englishTownFaq, englishTownH1, townDateAnswers } from "@/lib/programmatic/holidays/english-copy";
import { dayMonth, longDate, weekdayDayMonth } from "@/lib/programmatic/holidays/format";
import { GUIDES, OFFICIAL, type GuideKey } from "@/lib/programmatic/holidays/links";
import { joinList } from "@/lib/programmatic/holidays/names";
import { datePath, hubPath, municipalityPath } from "@/lib/programmatic/holidays/paths";
import type { SnapshotMunicipality } from "@/lib/programmatic/holidays/types";

import { HolidayStatus, type StatusLabels } from "./HolidayStatus";
import { DateList, GuideLinks, HolidayTable, Sources } from "./parts";

/**
 * `/en/holidays/<slug>/`: one town of the English selection. Server-rendered
 * from the snapshot; the only part that knows today's date is the status box,
 * which fills in after mount in the browser.
 */

const STATUS_LABELS: StatusLabels = {
  fallback: "Every public holiday in {place} is in the table below. With JavaScript on, this box shows whether today or tomorrow is a holiday here and when the next one is.",
  todayHoliday: "Yes: today is a public holiday in {place} ({name}).",
  todayWorking: "No: today is not a public holiday in {place}.",
  todayWeekend: "Today is not a public holiday in {place}, but it is a {weekday}.",
  todayLocalUnknown: "Today is not a holiday anywhere in Catalonia; the local holidays for {year} have not been published yet.",
  todayUnknown: "The public holidays for {year} have not been published yet.",
  tomorrow: "Tomorrow",
  next: "Next holiday",
  yes: "Yes",
  no: "Not a holiday",
  localUnknownShort: "Not across Catalonia; {year} local holidays not yet published",
  unknownShort: "Calendar not yet published",
  inDays: "in {n} days",
  inOneDay: "tomorrow",
  mayBeEarlier: "The local holidays for {year} have not been published yet, so there may be one sooner.",
  none: "No holiday published after that",
  timezone: "Worked out in Catalan time (Europe/Madrid).",
};

/** Home > Public holidays > the town. English has no comarca pages. */
export function englishTownCrumbs(m: SnapshotMunicipality): Crumb[] {
  return [
    { label: getMessages("en").common.home, href: "/en/" },
    { label: englishHubCopy().breadcrumb, href: hubPath("en") },
    { label: enName(m), href: municipalityPath("en", m.slug) },
  ];
}

export function EnglishTownPage({ m }: { m: SnapshotMunicipality }) {
  const next = nextYearFor(m.slug);
  const t = englishTownCopy(m, next);
  const name = enName(m);
  const faq = englishTownFaq(m, next);
  const answers = townDateAnswers(m);
  const others = englishTowns().filter((o) => o.slug !== m.slug);
  const guides: GuideKey[] = [
    "holidayToday",
    "workCalendar",
    "localHolidays",
    "shops",
    ...(t.metro ? (["metroHours"] as const) : []),
    "strikes",
    "decemberBridge",
    "school",
  ];

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={englishTownCrumbs(m)} locale="en" />
          <p className="ci-label mb-3 max-md:hidden">{m.comarca}</p>
          <h1 className="ci-measure">{englishTownH1(m)}</h1>
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <p className="ci-lead">
            {t.lead} {t.source}
          </p>
          {t.nucleiLead ? <p>{t.nucleiLead}</p> : null}
          {t.correction ? <p className="ci-callout ci-callout-official">{t.correction}</p> : null}

          <h2 id="today">{t.statusTitle}</h2>
          <HolidayStatus
            place={name}
            days={statusDays(m, "en")}
            coverage={{ regionalThrough: regionalThrough(), localThrough: localThrough() }}
            locale="en"
            labels={STATUS_LABELS}
          />

          <h2 id="holidays-2026">{t.tableTitle}</h2>
          <HolidayTable rows={yearRows(m, YEAR, "en")} locale="en" caption={t.tableCaption} />

          {m.nuclei.length > 0 ? (
            <>
              <h2 id="villages">{t.nucleiTitle}</h2>
              <div className="ci-table-scroll mt-4">
                <table className="ci-local-table">
                  <thead>
                    <tr>
                      <th scope="col">{t.nucleiCols.place}</th>
                      <th scope="col">{t.nucleiCols.days}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.nuclei.map((n) => (
                      <tr key={n.name}>
                        <td>{n.name}</td>
                        <td>{joinList(n.dates.map((d) => weekdayDayMonth(d, "en")), "en")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          <h2 id="holidays-2027">{t.nextTitle}</h2>
          {t.next.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <HolidayTable rows={yearRows(m, NEXT, "en")} locale="en" caption={t.nextCaption} />
          {next ? null : (
            <p>
              <a href={OFFICIAL.treballCalendar} rel="noopener" target="_blank">
                Work calendar on the Department of Enterprise and Labour website (in Catalan)
              </a>
              {" · "}
              <a href={OFFICIAL.dogc} rel="noopener" target="_blank">
                DOGC, the official gazette
              </a>
            </p>
          )}

          <h2 id="dates">{t.datesTitle}</h2>
          <p>{t.datesLead}</p>
          <div className="ci-table-scroll mt-4">
            <table className="ci-local-table">
              <thead>
                <tr>
                  <th scope="col">{t.dateCols.date}</th>
                  <th scope="col">{t.dateCols.answer}</th>
                  <th scope="col">{t.dateCols.shops}</th>
                </tr>
              </thead>
              <tbody>
                {answers.map((a) => (
                  <tr key={a.iso}>
                    <th scope="row" className="whitespace-nowrap font-normal">
                      <Link href={datePath("en", a.iso)}>
                        <time dateTime={a.iso}>{longDate(a.iso, "en")}</time>
                      </Link>
                    </th>
                    <td>
                      {a.state === "no" ? a.answer : <strong>{a.answer}</strong>}
                      {a.strike ? (
                        <>
                          {" "}
                          {t.strikeNote} <Link href={GUIDES.strikes.en}>{t.strikeLink}</Link>.
                        </>
                      ) : null}
                    </td>
                    <td>{a.shops}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {t.strikesLine.before}
            <Link href={GUIDES.strikes.en}>{t.strikesLine.label}</Link>
            {t.strikesLine.after}
          </p>

          <h2 id="what-closes">{t.closesTitle}</h2>
          <h3>{t.shops.title}</h3>
          <p>{t.shops.lead}</p>
          <DateList dates={m.shops} locale="en" />
          {t.shops.local.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {t.shops.rules.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p>
            <Link href={GUIDES.shops.en}>{t.shops.guide}</Link>
          </p>
          <h3>{t.schools.title}</h3>
          <p>{t.schools.text}</p>
          <h3>{t.work.title}</h3>
          <p>{t.work.text}</p>
          {t.metro ? (
            <>
              <h3>{t.metro.title}</h3>
              <p>
                {t.metro.text} <Link href={GUIDES.metroHours.en}>{t.metro.label}</Link>.
              </p>
            </>
          ) : null}

          <h2 id="faq">{t.faqTitle}</h2>
          {faq.map((item) => (
            <div key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>

        <section className="mt-12" aria-labelledby="ci-hol-siblings">
          <h2 id="ci-hol-siblings">{t.othersTitle}</h2>
          {[
            { label: t.largestLabel, towns: others.filter((o) => isLargestTown(o)) },
            { label: t.resortsLabel, towns: others.filter((o) => !isLargestTown(o)) },
          ].map((group) =>
            group.towns.length > 0 ? (
              <div key={group.label}>
                <h3 className="mt-6 text-lg">{group.label}</h3>
                <ul className="mt-3 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3 [&_small]:block [&_small]:text-xs [&_small]:text-[var(--color-muted)]">
                  {group.towns.map((o) => (
                    <li key={o.slug}>
                      <Link href={municipalityPath("en", o.slug)}>{enName(o)}</Link>
                      <small>{o.local.length > 0 ? joinList(o.local.map((d) => dayMonth(d, "en")), "en") : o.comarca}</small>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
          <p className="mt-6 text-sm">
            <Link href={hubPath("en")}>{t.hubLink}</Link>
            {" · "}
            {t.otherEditions}{" "}
            <Link href={municipalityPath("ca", m.slug)} hrefLang="ca">
              {name} in Catalan
            </Link>
            {", "}
            <Link href={municipalityPath("es", m.slug)} hrefLang="es">
              in Spanish
            </Link>
            .
          </p>
        </section>

        <GuideLinks keys={guides} locale="en" title={t.guidesTitle} />

        <Sources
          keys={["localOrder", "amendment", "openData", "regional2026", "regional2027", "shops", "shopsOrder", "school", "retailLaw", "population"]}
          locale="en"
          title={t.sourcesTitle}
        />
      </div>
    </article>
  );
}
