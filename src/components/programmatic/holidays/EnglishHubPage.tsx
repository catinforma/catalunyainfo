import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getMessages } from "@/lib/i18n";
import { hubPath as electionsHubPath } from "@/lib/programmatic/elections/paths";
import { dateQuestion } from "@/lib/programmatic/holidays/copy";
import { NEXT, YEAR, regionalDays, type HolidayRow } from "@/lib/programmatic/holidays/data";
import { englishTowns, isLargestTown } from "@/lib/programmatic/holidays/english";
import { enName, englishHubCopy } from "@/lib/programmatic/holidays/english-copy";
import { weekdayDayMonth } from "@/lib/programmatic/holidays/format";
import { joinList } from "@/lib/programmatic/holidays/names";
import { DATE_PAGES, datePath, hubPath, municipalityPath } from "@/lib/programmatic/holidays/paths";
import type { SnapshotMunicipality } from "@/lib/programmatic/holidays/types";

import { GuideLinks, HolidayTable, Sources } from "./parts";

/**
 * `/en/holidays/`: Catalonia's bank holidays for this year and next, and the
 * local holidays of the English towns (the 11 largest and the resorts), each
 * linked to its page. The Catalan and Spanish hubs list every town.
 */

export function englishHubCrumbs(): Crumb[] {
  return [
    { label: getMessages("en").common.home, href: "/en/" },
    { label: englishHubCopy().breadcrumb, href: hubPath("en") },
  ];
}

function regionalRows(year: number): HolidayRow[] {
  return regionalDays(year).map((d) => ({ date: d.date, kind: "catalonia" as const, name: d.name.en }));
}

function TownTable({ towns, cols }: { towns: SnapshotMunicipality[]; cols: { town: string; comarca: string; days: string } }) {
  return (
    <div className="ci-table-scroll mt-4">
      <table className="ci-local-table">
        <thead>
          <tr>
            <th scope="col">{cols.town}</th>
            <th scope="col">{cols.days}</th>
            <th scope="col">{cols.comarca}</th>
          </tr>
        </thead>
        <tbody>
          {towns.map((m) => (
            <tr key={m.slug}>
              <th scope="row" className="font-normal">
                <Link href={municipalityPath("en", m.slug)}>{enName(m)}</Link>
              </th>
              <td>
                {joinList(m.local.map((d) => weekdayDayMonth(d, "en")), "en")}
                {m.nuclei.length > 0 ? <small className="block text-[var(--color-muted)]">Own days in {joinList(m.nuclei.map((n) => n.name), "en")}</small> : null}
              </td>
              <td>{m.comarca}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EnglishHubPage() {
  const t = englishHubCopy();
  const towns = englishTowns();
  const largest = towns.filter((m) => isLargestTown(m));
  const resorts = [...towns.filter((m) => !isLargestTown(m))].sort((a, b) => enName(a).localeCompare(enName(b), "en"));

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-5 md:py-8 lg:py-12">
          <Breadcrumbs items={englishHubCrumbs()} locale="en" />
          <h1 className="ci-measure">{t.h1}</h1>
          <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{t.lead}</p>
        </div>
      </header>

      <div className="ci-shell py-10">
        <div className="ci-prose">
          <h2 id="catalonia-2026">{t.regionalTitle(YEAR)}</h2>
          <HolidayTable rows={regionalRows(YEAR)} locale="en" caption={t.regionalCaption(YEAR)} />
          <h2 id="catalonia-2027">{t.regionalTitle(NEXT)}</h2>
          <HolidayTable rows={regionalRows(NEXT)} locale="en" caption={t.regionalCaption(NEXT)} />
          {t.aran ? <p>{t.aran}</p> : null}

          <h2 id="towns">{t.townsTitle}</h2>
          <p>{t.townsLead}</p>
          <h3 id="largest">{t.largestTitle}</h3>
          <TownTable towns={largest} cols={t.cols} />
          <h3 id="resorts">{t.resortsTitle}</h3>
          <TownTable towns={resorts} cols={t.cols} />
          {t.withoutDays ? <p>{t.withoutDays}</p> : null}
          <p>
            {t.selection.before}
            <a href={t.selection.href} rel="noopener" target="_blank">
              {t.selection.label}
            </a>
            {t.selection.after}
            <Link href={electionsHubPath("en")}>{t.selection.electionsLabel}</Link>.
          </p>
          <p>
            {t.editions}{" "}
            <Link href={hubPath("ca")} hrefLang="ca">
              in Catalan
            </Link>
            {", "}
            <Link href={hubPath("es")} hrefLang="es">
              in Spanish
            </Link>
            . {t.next}
          </p>
        </div>

        <section className="mt-12" aria-labelledby="ci-hol-dates">
          <h2 id="ci-hol-dates">{t.datesTitle}</h2>
          <ul className="mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
            {DATE_PAGES.map((d) => (
              <li key={d}>
                <Link href={datePath("en", d)}>{dateQuestion(d, "en")}</Link>
              </li>
            ))}
          </ul>
        </section>

        <GuideLinks keys={["holidayToday", "workCalendar", "localHolidays", "shops", "metroHours", "strikes", "decemberBridge", "school"]} locale="en" title={t.guidesTitle} />

        <Sources keys={["localOrder", "amendment", "openData", "regional2026", "regional2027", "population"]} locale="en" title={t.sourcesTitle} />
      </div>
    </article>
  );
}
