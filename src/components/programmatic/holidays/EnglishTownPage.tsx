import { AdSlot } from "@/components/AdSlot";
import Link from "next/link";
import { renderInline } from "@/lib/content/inline";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ContinueReading } from "@/components/ContinueReading";
import { NextStep } from "@/components/NextStep";
import { PlacePhoto } from "@/components/PlacePhoto";
import { townPhoto } from "@/lib/content/place-photos";
import { TownHub } from "@/components/TownHub";
import { ShareBar, crumbPath } from "@/components/share/ShareBar";
import { WidgetPlaceLink } from "@/components/programmatic/embed-2027/WidgetLink";
import { LeavePlaceLink } from "@/components/programmatic/leave-2027/LeaveLink";
import { WorkingDaysPlaceLink } from "@/components/programmatic/working-days/WorkingDaysLink";
import { CalendarSubscribe } from "@/components/programmatic/ics/CalendarSubscribe";
import { getMessages } from "@/lib/i18n";
import { townOnward } from "@/lib/engagement/continue-templates";
import { townNextStep } from "@/lib/engagement/next-step-towns";
import { townHub } from "@/lib/engagement/town-hub";
import { familyLastChecked } from "@/lib/programmatic/christmas-fairs/data";
import { NEXT, YEAR, councilApproved2027, localThrough, nextYearFor, regionalThrough, statusDays, yearRows } from "@/lib/programmatic/holidays/data";
import { englishTowns, isLargestTown } from "@/lib/programmatic/holidays/english";
import { enName, englishHubCopy, englishTownCopy, englishTownFaq, englishTownH1, townDateAnswers } from "@/lib/programmatic/holidays/english-copy";
import { workCalendarLine } from "@/lib/programmatic/holidays/copy";
import { dayMonth, longDate, weekdayDayMonth } from "@/lib/programmatic/holidays/format";
import { GUIDES, OFFICIAL, type GuideKey } from "@/lib/programmatic/holidays/links";
import { joinList } from "@/lib/programmatic/holidays/names";
import { datePath, hubPath, municipalityPath } from "@/lib/programmatic/holidays/paths";
import { town2027Line } from "@/lib/programmatic/holidays/first-screen";
import { dateQuestion } from "@/lib/programmatic/holidays/question";
import { town2027DateLink, town2027Days } from "@/lib/programmatic/holidays/town-2027";
import { isLowDemandPath } from "@/lib/seo/low-demand";
import type { SnapshotMunicipality } from "@/lib/programmatic/holidays/types";

import { EnglishChristmasShops } from "./ChristmasShops";
import { TownShopsLine } from "./TownShopsLine";
import { HolidayStatus, type StatusLabels } from "./HolidayStatus";
import { CouncilSourceLine, DateList, GuideLinks, HolidayTable, Sources, Town2027FirstLine, TownQuickLinks } from "./parts";

/**
 * `/en/holidays/<slug>/`: one town of the English selection. Server-rendered
 * from the snapshot; the only part that knows today's date is the status box,
 * which fills in after mount in the browser. The shop line under the H1
 * (shops-line.ts) is date-free: dated days, past ones dropped at render.
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
  const council = next ? null : councilApproved2027(m.slug);
  const t = englishTownCopy(m, next);
  const name = enName(m);
  const faq = englishTownFaq(m, next);
  const answers = townDateAnswers(m);
  // 2027: one line on the first screen and one date-page link in the section (lib/programmatic/holidays/town-2027.ts).
  const days2027 = town2027Days(m, next, council);
  const dateLink = town2027DateLink(m, "en", days2027);
  const dateLink2027 = dateLink && !isLowDemandPath(datePath("en", dateLink.date)) ? dateLink : null;
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
  // The seasonal link at the foot (lib/engagement/continue-templates.ts), which never repeats a link of the next-step box,
  // the town hub or the guides list. Clock-free like the rest of the page: dated by the day the fairs were last read.
  const onward = townOnward({
    slug: m.slug,
    locale: "en",
    step: townNextStep(m.slug, name, "en", crumbPath(englishTownCrumbs(m))),
    hub: townHub(m.slug, "en", "holidays", familyLastChecked()),
    guides,
    today: familyLastChecked(),
  });

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={englishTownCrumbs(m)} locale="en" />
          <p className="ci-label mb-3 max-md:hidden">{m.comarca}</p>
          <h1 className="ci-measure">{englishTownH1(m)}</h1>
          <ShareBar locale="en" path={crumbPath(englishTownCrumbs(m))} title={englishTownH1(m)} contentType="holidays_town" />
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          {/* The shop answer for the next Sunday or holiday (lib/programmatic/holidays/shops-line.ts, 24 Nov 2026). */}
          <TownShopsLine m={m} locale="en" tight />
          {/* 2027 on the first screen (first-screen.ts town2027Line, 27 Nov 2026), above the 2026 table. */}
          <Town2027FirstLine line={town2027Line(m, "en", days2027)} anchor="holidays-2027" />
          {/* Dates first (12 Nov 2026, answer-first layout; docs/SEO_EXPERIMENTS.md): the list is the answer. */}
          <h2 id="holidays-2026">{t.tableTitle}</h2>
          <HolidayTable rows={yearRows(m, YEAR, "en")} locale="en" caption={t.tableCaption} />

          <p className="ci-lead">
            {t.lead} {t.source}
          </p>
          <TownQuickLinks place={name} locale="en" />
          {/* The next useful step (lib/engagement/next-step-towns.ts): the 2027 planner for this town, then its Christmas fair
              (no date passed: the fair counts by the day the fairs were last read, so this page stays clock-free). */}
          <NextStep step={townNextStep(m.slug, name, "en", crumbPath(englishTownCrumbs(m)))} locale="en" />
          {/* The 2027 days that sat here (t.nextLead) are on the first screen now (Town2027FirstLine). */}
          {t.nucleiLead ? <p>{t.nucleiLead}</p> : null}
          {t.correction ? <p className="ci-callout ci-callout-official">{t.correction}</p> : null}

          <AdSlot kind="top" locale="en" path={crumbPath(englishTownCrumbs(m))} />
          <h2 id="today">{t.statusTitle}</h2>
          <HolidayStatus
            place={name}
            days={statusDays(m, "en")}
            coverage={{ regionalThrough: regionalThrough(), localThrough: localThrough() }}
            locale="en"
            labels={STATUS_LABELS}
          />

          {/* The town's licensed photograph (lib/content/place-photos.ts), after the dates and the today box; lazy-loaded. */}
          <PlacePhoto photo={townPhoto(m.slug, "en")} locale="en" />

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
          {t.councilSource ? <CouncilSourceLine source={t.councilSource} /> : null}
          {/* Before the DOGC order: the council's own days, if it has approved them, marked pending. */}
          <HolidayTable rows={yearRows(m, NEXT, "en", { council: true })} locale="en" caption={t.nextCaption} />
          {next ? null : (
            <p>
              <a href={OFFICIAL.treballCalendar2027} rel="noopener" target="_blank">
                Work calendar on the Department of Enterprise and Labour website (in Catalan)
              </a>
              {" · "}
              <a href={OFFICIAL.dogc} rel="noopener" target="_blank">
                DOGC, the official gazette
              </a>
            </p>
          )}
          {/* One of the town's 2027 days that has a date page: who else is off (town-2027.ts town2027DateLink). */}
          {dateLink2027 ? (
            <p>
              {dateLink2027.lead} <Link href={datePath("en", dateLink2027.date)}>{dateQuestion(dateLink2027.date, "en")}</Link>
            </p>
          ) : null}
          {/* The 2027 leave planner, with this town picked. */}
          <LeavePlaceLink locale="en" placeId={m.slug} place={name} />
          {/* The working-days calculator, with this place picked. */}
          <WorkingDaysPlaceLink locale="en" placeId={m.slug} place={name} />
          {/* The Catalonia-wide 2027 calendar, month by month (13 Nov 2026). */}
          <p>{renderInline(workCalendarLine("en"))}</p>
          {/* The embeddable 2027 calendar, with this town picked. */}
          <WidgetPlaceLink locale="en" place={{ kind: "town", m }} />
          {/* The town's confirmed holidays as a calendar feed (.ics). */}
          <CalendarSubscribe locale="en" place={{ kind: "town", m }} />

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

          {/* Christmas shop opening, day by day (24 Nov 2026; the same data as the ca/es section). */}
          <EnglishChristmasShops m={m} />

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

          {/* The town's other English pages (lib/engagement/town-hub.ts). Clock-free like the rest of the page:
              dated by the day the fairs were last read, as the next-step box is. */}
          <TownHub hub={townHub(m.slug, "en", "holidays", familyLastChecked())} />
          {/* 27 Nov 2026 (batch 8U, lib/engagement/continue-templates.ts): the page for the days ahead that no box above links. */}
          <ContinueReading data={onward} locale="en" className="my-6" />
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
          extra={council ? [council.source] : []}
        />
        <ShareBar locale="en" path={crumbPath(englishTownCrumbs(m))} title={englishTownH1(m)} contentType="holidays_town" variant="full" />
      </div>
    </article>
  );
}
