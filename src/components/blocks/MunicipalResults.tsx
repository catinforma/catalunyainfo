"use client";

import { useId, useState } from "react";

import type { ElectionHistory, MunicipalityOption } from "@/lib/content/elections/history";

export interface MunicipalCopy {
  label: string;
  placeholder: string;
  notFound: string;
  loading: string;
  failed: string;
  latestTitle: string;
  summary: string;
  openLists: string;
  colList: string;
  colVotes: string;
  colShare: string;
  colSeats: string;
  historyTitle: string;
  colDate: string;
  colTurnout: string;
  colSeatsByList: string;
}

const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

/**
 * Municipal results for any municipality in Catalonia.
 *
 * The first municipality (Barcelona) arrives server-rendered, so the results
 * are in the HTML for crawlers and for readers without scripts. Picking
 * another one fetches it from /api/elections/municipal, which relays the
 * Generalitat's open data with a day's cache.
 */
export function MunicipalResults({
  t,
  intlLocale,
  municipalities,
  initial,
  initialName,
  monthNames,
}: {
  t: MunicipalCopy;
  intlLocale: string;
  municipalities: MunicipalityOption[];
  initial: ElectionHistory;
  initialName: string;
  monthNames: string[];
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [name, setName] = useState(initialName);
  const [history, setHistory] = useState<ElectionHistory>(initial);
  const [state, setState] = useState<"idle" | "loading" | "failed" | "notFound">("idle");

  const whole = new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 0 });
  const one = new Intl.NumberFormat(intlLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const dated = (iso: string) => {
    const month = monthNames[Number(iso.slice(5, 7)) - 1] ?? "";
    return `${month} ${iso.slice(0, 4)}`;
  };

  async function pick(value: string) {
    setQuery(value);
    const match = municipalities.find((m) => fold(m.name) === fold(value));
    if (!match) {
      setState(value.trim().length > 2 ? "notFound" : "idle");
      return;
    }
    setState("loading");
    try {
      const response = await fetch(`/api/elections/municipal/?code=${match.code}`);
      if (!response.ok) throw new Error(String(response.status));
      const data = (await response.json()) as ElectionHistory;
      if (data.error || data.elections.length === 0) throw new Error("empty");
      setHistory(data);
      setName(match.name);
      setState("idle");
    } catch {
      setState("failed");
    }
  }

  const latest = history.elections[0];
  // Councils of five or fewer: open lists, so "votes" are candidate-vote sums.
  const openLists = latest ? latest.seats <= 5 : false;

  return (
    <div>
      <div className="ci-local-filter">
        <label htmlFor={`${listId}-input`}>{t.label}</label>
        <input
          id={`${listId}-input`}
          className="ci-field"
          type="search"
          list={`${listId}-list`}
          autoComplete="off"
          placeholder={t.placeholder}
          value={query}
          onChange={(event) => void pick(event.target.value)}
        />
        <datalist id={`${listId}-list`}>
          {municipalities.map((m) => (
            <option key={m.code} value={m.name} />
          ))}
        </datalist>
        {state === "loading" ? <p className="ci-calc-note">{t.loading}</p> : null}
        {state === "failed" ? <p className="ci-calc-note">{t.failed}</p> : null}
        {state === "notFound" ? <p className="ci-calc-note">{t.notFound}</p> : null}
      </div>

      {latest ? (
        <div aria-live="polite">
          <h3 className="ci-elections-title">
            {t.latestTitle.replace("{place}", name).replace("{date}", dated(latest.date))}
          </h3>
          <p>
            {t.summary
              .replace("{turnout}", one.format(latest.turnout))
              .replace("{voters}", whole.format(latest.voters))
              .replace("{electorate}", whole.format(latest.electorate))
              .replace("{seats}", String(latest.seats))}
          </p>
          {openLists ? <p className="ci-calc-note">{t.openLists}</p> : null}
          <div className="ci-table-scroll">
            <table className="ci-local-table ci-elections-table">
              <thead>
                <tr>
                  <th scope="col">{t.colList}</th>
                  {openLists ? null : <th scope="col">{t.colVotes}</th>}
                  {openLists ? null : <th scope="col">{t.colShare}</th>}
                  <th scope="col">{t.colSeats}</th>
                </tr>
              </thead>
              <tbody>
                {latest.lists.map((list) => (
                  <tr key={list.short + list.name}>
                    <th scope="row">
                      {list.short}
                      {list.name && list.name !== list.short ? (
                        <small className="ci-reservoirs-place">{list.name}</small>
                      ) : null}
                    </th>
                    {openLists ? null : <td className="ci-numeric">{whole.format(list.votes)}</td>}
                    {openLists ? null : <td className="ci-numeric">{one.format(list.share)} %</td>}
                    <td className="ci-numeric">{list.seats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="ci-elections-title">{t.historyTitle.replace("{place}", name)}</h3>
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
                    <td>{election.lists.map((list) => `${list.short} ${list.seats}`).join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
