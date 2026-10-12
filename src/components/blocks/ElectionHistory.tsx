import { shortDate } from "@/lib/content/holidays/calendar";
import { ELECTIONS_SOURCE, loadElectionHistory, type ElectionKind } from "@/lib/content/elections/history";
import { getMessages } from "@/lib/i18n";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";

/**
 * Election results in Catalonia from the Generalitat's open data: the latest
 * election in full (lists that won seats), then every election since 1977 on
 * one line each. Server-rendered so every figure is in the HTML.
 */
export async function ElectionHistory({ locale, kind }: { locale: Locale; kind: ElectionKind }) {
  const t = getMessages(locale).elections;
  const history = await loadElectionHistory(kind);

  if (history.error || history.elections.length === 0) {
    return (
      <section className="ci-elections" aria-label={t.title}>
        <p className="ci-calc-note">
          {t.unavailable}{" "}
          <a href={ELECTIONS_SOURCE.url} rel="noopener" target="_blank">
            {ELECTIONS_SOURCE.name}
          </a>
          .
        </p>
      </section>
    );
  }

  const whole = new Intl.NumberFormat(INTL_LOCALE[locale], { maximumFractionDigits: 0 });
  const one = new Intl.NumberFormat(INTL_LOCALE[locale], { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const dated = (iso: string) => `${shortDate(iso, locale)}${locale === "en" ? " " : " de "}${iso.slice(0, 4)}`;
  const latest = history.elections[0];
  if (!latest) return null;

  return (
    <section className="ci-elections" aria-label={t.title}>
      <h3 className="ci-elections-title">{t.latestTitle.replace("{date}", dated(latest.date))}</h3>
      <p>
        {t.latestSummary
          .replace("{turnout}", one.format(latest.turnout))
          .replace("{voters}", whole.format(latest.voters))
          .replace("{electorate}", whole.format(latest.electorate))
          .replace("{seats}", String(latest.seats))}
      </p>
      <div className="ci-table-scroll">
        <table className="ci-local-table ci-elections-table">
          <thead>
            <tr>
              <th scope="col">{t.colList}</th>
              <th scope="col">{t.colVotes}</th>
              <th scope="col">{t.colShare}</th>
              <th scope="col">{t.colSeats}</th>
            </tr>
          </thead>
          <tbody>
            {latest.lists.map((list) => (
              <tr key={list.short}>
                <th scope="row">
                  {list.short}
                  <small className="ci-reservoirs-place">{list.name}</small>
                </th>
                <td className="ci-numeric">{whole.format(list.votes)}</td>
                <td className="ci-numeric">{one.format(list.share)} %</td>
                <td className="ci-numeric">{list.seats}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="ci-elections-title">{t.historyTitle}</h3>
      <div className="ci-table-scroll">
        <table className="ci-local-table ci-elections-table">
          <thead>
            <tr>
              <th scope="col">{t.colDate}</th>
              <th scope="col">{t.colTurnout}</th>
              <th scope="col">{t.colSeatsByList}</th>
            </tr>
          </thead>
          <tbody>
            {history.elections.map((election) => (
              <tr key={election.id}>
                <th scope="row">{dated(election.date)}</th>
                <td className="ci-numeric">{one.format(election.turnout)} %</td>
                <td>
                  {election.seatsMissing
                    ? `${t.seatsMissing} ${election.lists.map((list) => `${list.short} ${one.format(list.share)} %`).join(" · ")}`
                    : election.lists.map((list) => `${list.short} ${list.seats}`).join(" · ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ci-calc-note">
        {t.sourceLine}{" "}
        <a href={ELECTIONS_SOURCE.url} rel="noopener" target="_blank">
          {ELECTIONS_SOURCE.name}
        </a>{" "}
        ({ELECTIONS_SOURCE.publisher}). {t.computedNote}
      </p>
    </section>
  );
}
