import Link from "next/link";

import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { localizeRegion } from "@/lib/content/school-spain/i18n";
import { hubPanel, regionPanel } from "@/lib/content/school-spain/panel";
import { regionBySlug } from "@/lib/content/school-spain/regions";
import type { Locale } from "@/lib/i18n/config";

/**
 * The school calendar of one Spanish community, or (`region="espana"`) all of
 * them side by side: what the order says about today and tomorrow, the next
 * break, then the year's dates.
 *
 * Server-rendered, computed in Europe/Madrid; the nightly cron rebuilds the
 * page just after midnight (`spainSchoolCalendar` is in DAY_DEPENDENT_BLOCKS).
 * In the page's language; the words are in school-spain/panel.ts.
 */
export function SpainSchoolCalendar({ region, locale = "es" }: { region: string; locale?: Locale }) {
  const today = todayInCatalonia();
  if (region === "espana") return <Hub locale={locale} today={today} />;
  const r = regionBySlug(region);
  if (!r) return null;
  return <Region panel={regionPanel(localizeRegion(r, locale), today)} />;
}

function Region({ panel }: { panel: ReturnType<typeof regionPanel> }) {
  return (
    <section className="ci-school" aria-label={panel.label}>
      <div className="ci-reservoirs-head">
        <p className="ci-reservoirs-figure">{panel.today}</p>
        <p>{panel.tomorrow}</p>
        {panel.nextOff ? <p>{panel.nextOff}</p> : null}
        {panel.nextLine ? <p>{panel.nextLine}</p> : null}
        <p className="ci-calc-note">{panel.note}</p>
      </div>

      <div className="ci-table-scroll">
        <table className="ci-local-table ci-school-table">
          <caption>{panel.caption}</caption>
          <thead>
            <tr>
              <th scope="col">{panel.headers[0]}</th>
              <th scope="col">{panel.headers[1]}</th>
            </tr>
          </thead>
          <tbody>
            {panel.rows.map(([label, value]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ci-calc-note">
        {panel.sourceLabel}{" "}
        <a href={panel.sourceUrl} rel="noopener" target="_blank">
          {panel.sourceName}
        </a>{" "}
        ({panel.sourceWhere}).
      </p>
    </section>
  );
}

function Hub({ locale, today }: { locale: Locale; today: string }) {
  const panel = hubPanel(locale, today);
  return (
    <section className="ci-school" aria-label={panel.label}>
      {panel.lead ? (
        <div className="ci-reservoirs-head">
          <p className="ci-reservoirs-figure">{panel.lead}</p>
          <p className="ci-calc-note">{panel.leadNote}</p>
        </div>
      ) : null}

      <div className="ci-table-scroll">
        <table className="ci-local-table ci-school-table">
          <caption>{panel.caption}</caption>
          <thead>
            <tr>
              {panel.headers.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {panel.rows.map((row) => (
              <tr key={row.key}>
                <th scope="row">
                  {row.href ? <Link href={row.href}>{row.name}</Link> : row.name}
                  {row.suffix}
                </th>
                {row.cells.length === 1 ? (
                  <td colSpan={panel.headers.length - 1}>{row.cells[0]}</td>
                ) : (
                  row.cells.map((cell, i) => <td key={i}>{cell}</td>)
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ci-calc-note">{panel.footnote}</p>
    </section>
  );
}
