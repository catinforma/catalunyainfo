import Link from "next/link";

import { shortDate } from "@/lib/content/holidays/calendar";
import { RESERVOIR_SOURCE, TER_LLOBREGAT, loadReservoirs, loadReservoirsYearAgo } from "@/lib/content/reservoirs/levels";
import { getMessages } from "@/lib/i18n";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";
import { liveStamp } from "@/lib/programmatic/live-stamp";
import { reservoirPath } from "@/lib/programmatic/reservoirs/paths";
import { slugOfName } from "@/lib/programmatic/reservoirs/types";

/**
 * Today's reservoir levels: one headline figure, the Ter-Llobregat system that
 * supplies Barcelona, and a table of every reservoir the ACA publishes.
 *
 * Server-rendered so the figure is in the HTML; the reading date is printed
 * next to it, because a percentage without a date is how the pages this one
 * competes with go wrong. The same day a year earlier comes from the same
 * series by the same rules (no comparison when the ACA has no clean day), and
 * each row links to that reservoir's own page.
 */
export async function ReservoirLevels({ locale }: { locale: Locale }) {
  const t = getMessages(locale).reservoirs;
  const report = await loadReservoirs();
  const yearAgo = report.error || !report.date ? null : await loadReservoirsYearAgo(report.date);
  const lastYear = yearAgo && !yearAgo.error && yearAgo.reservoirs.length > 0 ? yearAgo : null;
  const lastYearOf = new Map((lastYear?.reservoirs ?? []).map((r) => [r.name, r]));
  const checked = report.fetchedAt ? liveStamp(report.fetchedAt, locale) : null;

  if (report.error || report.reservoirs.length === 0) {
    return (
      <section className="ci-reservoirs" aria-label={t.title}>
        <p className="ci-calc-note">
          {t.unavailable}{" "}
          <a href={RESERVOIR_SOURCE.url} rel="noopener" target="_blank">
            {RESERVOIR_SOURCE.name}
          </a>
          .
        </p>
      </section>
    );
  }

  const one = new Intl.NumberFormat(INTL_LOCALE[locale], { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const whole = new Intl.NumberFormat(INTL_LOCALE[locale], { maximumFractionDigits: 0 });
  const signed = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : "±"}${one.format(Math.abs(value))}`;
  const fill = (template: string, values: Record<string, string>) =>
    Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, value), template);

  const { total, terLlobregat, totalCompare, compareDate } = report;
  const ter = new Set<string>(TER_LLOBREGAT);

  return (
    <section className="ci-reservoirs" aria-label={t.title}>
      <div className="ci-reservoirs-head">
        <p className="ci-reservoirs-figure">
          {fill(t.headline, { pct: one.format(total.percent) })}
        </p>
        <div className="ci-reservoirs-bar" aria-hidden="true">
          <span style={{ width: `${Math.min(100, total.percent)}%` }} />
        </div>
        <p>
          {fill(t.detail, {
            vol: whole.format(total.volume),
            cap: whole.format(total.capacity),
            // With the year: "embalses hoy" pages that print a day without one
            // are the stale ones searchers have learnt to distrust.
            date: `${shortDate(report.date, locale)}${locale === "en" ? " " : " de "}${report.date.slice(0, 4)}`,
          })}{" "}
          {totalCompare && compareDate
            ? fill(t.change, {
                pp: signed(total.percent - totalCompare.percent),
                date: shortDate(compareDate, locale),
              })
            : null}
          {lastYear
            ? ` ${fill(t.yearAgo, {
                date: `${shortDate(lastYear.date, locale)}${locale === "en" ? " " : " de "}${lastYear.date.slice(0, 4)}`,
                pct: one.format(lastYear.total.percent),
                pp: signed(total.percent - lastYear.total.percent),
              })}`
            : null}
        </p>
        <p>
          <strong>
            {fill(t.terLine, {
              pct: one.format(terLlobregat.percent),
              vol: whole.format(terLlobregat.volume),
              cap: whole.format(terLlobregat.capacity),
            })}
          </strong>
        </p>
      </div>

      <div className="ci-table-scroll">
        <table className="ci-local-table ci-reservoirs-table">
          <thead>
            <tr>
              <th scope="col">{t.colName}</th>
              <th scope="col">{t.colPct}</th>
              <th scope="col">{t.colVol}</th>
              <th scope="col">{t.colCap}</th>
              {compareDate ? <th scope="col">{t.colChange}</th> : null}
              {lastYear ? <th scope="col">{t.colYear}</th> : null}
            </tr>
          </thead>
          <tbody>
            {report.reservoirs.map((r) => {
              const slug = slugOfName(r.name);
              const before = lastYearOf.get(r.name);
              return (
              <tr key={r.name}>
                <th scope="row">
                  {slug ? (
                    <Link href={reservoirPath(locale, slug)} aria-label={fill(t.rowLink, { name: r.name })}>
                      {r.name}
                    </Link>
                  ) : (
                    r.name
                  )}
                  {ter.has(r.name) ? <small> · Ter-Llobregat</small> : null}
                  {r.place ? <small className="ci-reservoirs-place">{r.place}</small> : null}
                </th>
                <td className="ci-numeric">{one.format(r.percent)} %</td>
                <td className="ci-numeric">{one.format(r.volume)}</td>
                <td className="ci-numeric">{one.format(r.capacity)}</td>
                {compareDate ? (
                  <td className="ci-numeric">{r.change === null ? "—" : signed(r.change)}</td>
                ) : null}
                {lastYear ? <td className="ci-numeric">{before ? `${one.format(before.percent)}${locale === "en" ? "%" : " %"}` : "—"}</td> : null}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="ci-calc-note">
        {t.capNote} {t.sourceLine}{" "}
        <a href={RESERVOIR_SOURCE.url} rel="noopener" target="_blank">
          {RESERVOIR_SOURCE.name}
        </a>{" "}
        ({RESERVOIR_SOURCE.publisher}).
        {checked ? (
          <>
            {" "}
            <time dateTime={report.fetchedAt ?? undefined}>{fill(t.checked, { date: checked.date, time: checked.time })}</time>
          </>
        ) : null}
      </p>
    </section>
  );
}
