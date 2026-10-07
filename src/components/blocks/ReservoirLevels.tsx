import { shortDate } from "@/lib/content/holidays/calendar";
import { RESERVOIR_SOURCE, TER_LLOBREGAT, loadReservoirs } from "@/lib/content/reservoirs/levels";
import { getMessages } from "@/lib/i18n";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";

/**
 * Today's reservoir levels: one headline figure, the Ter-Llobregat system that
 * supplies Barcelona, and a table of every reservoir the ACA publishes.
 *
 * Server-rendered so the figure is in the HTML; the reading date is printed
 * next to it, because a percentage without a date is how the pages this one
 * competes with go wrong.
 */
export async function ReservoirLevels({ locale }: { locale: Locale }) {
  const t = getMessages(locale).reservoirs;
  const report = await loadReservoirs();

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
            date: shortDate(report.date, locale),
          })}{" "}
          {totalCompare && compareDate
            ? fill(t.change, {
                pp: signed(total.percent - totalCompare.percent),
                date: shortDate(compareDate, locale),
              })
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
            </tr>
          </thead>
          <tbody>
            {report.reservoirs.map((r) => (
              <tr key={r.name}>
                <th scope="row">
                  {r.name}
                  {ter.has(r.name) ? <small> · Ter-Llobregat</small> : null}
                  {r.place ? <small className="ci-reservoirs-place">{r.place}</small> : null}
                </th>
                <td className="ci-numeric">{one.format(r.percent)} %</td>
                <td className="ci-numeric">{one.format(r.volume)}</td>
                <td className="ci-numeric">{one.format(r.capacity)}</td>
                {compareDate ? (
                  <td className="ci-numeric">{r.change === null ? "—" : signed(r.change)}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ci-calc-note">
        {t.capNote} {t.sourceLine}{" "}
        <a href={RESERVOIR_SOURCE.url} rel="noopener" target="_blank">
          {RESERVOIR_SOURCE.name}
        </a>{" "}
        ({RESERVOIR_SOURCE.publisher}).
      </p>
    </section>
  );
}
