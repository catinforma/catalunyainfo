"use client";

import { useMemo, useState } from "react";

import { TICKETS, cheapest, compareTickets } from "@/lib/content/transport-cards/rates";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * Which Barcelona transport ticket fits a given trip.
 *
 * Carries no configuration from the database: fares live in
 * `transport-cards/rates.ts`, read from TMB's own page and version-controlled,
 * so a fare cannot be edited through the CMS.
 *
 * Three behaviours are deliberate, and all three are about not misleading
 * somebody standing at a barrier:
 *
 *  - **Every ticket is priced per traveller.** All of these except the single
 *    ticket are personal; four people cannot share one T-casual. Dividing a
 *    ten-journey ticket between a family is the error that costs money at the
 *    gate.
 *  - **A ticket that does not fit is shown as unusable, with the reason** —
 *    never hidden and never silently beaten on price. The T-casual is cheap
 *    and is not valid through the L9 Sud airport gates; showing it as the
 *    winner to somebody arriving from the airport would be worse than useless.
 *  - **The Hola Barcelona card is listed without a price.** TMB publishes its
 *    coverage but not its fare, and the prices circulating elsewhere are
 *    resellers'. It appears with what it includes and an explicit "not priced
 *    here" rather than with a number nobody has verified.
 *
 * There is no universal winner and the component never claims one: it prints
 * the cheapest *for the trip described*, with the caveats attached.
 */

const ZONE = "1";

export function TransportPassSelector({ locale }: { locale: Locale }) {
  const t = getMessages(locale).transportPasses;

  const [days, setDays] = useState("3");
  const [journeysPerDay, setJourneysPerDay] = useState("4");
  const [travellers, setTravellers] = useState("2");
  const [usesAirport, setUsesAirport] = useState(false);

  const priced = useMemo(
    () =>
      compareTickets({
        days: Number(days) || 1,
        journeysPerDay: Number(journeysPerDay) || 0,
        travellers: Number(travellers) || 1,
        zone: ZONE,
        usesAirport,
      }),
    [days, journeysPerDay, travellers, usesAirport],
  );

  const best = cheapest(priced);
  const money = (value: number) =>
    value.toLocaleString(locale, { style: "currency", currency: "EUR" });

  const id = "tp";

  return (
    <section className="ci-calc" aria-label={t.title}>
      <h3 className="ci-calc-title">{t.title}</h3>
      <p className="ci-calc-intro">{t.intro}</p>

      <div className="ci-calc-inputs">
        <p className="ci-calc-row">
          <label htmlFor={`${id}-days`}>{t.days}</label>
          <input
            id={`${id}-days`}
            className="ci-field"
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            value={days}
            onChange={(event) => setDays(event.target.value)}
          />
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-journeys`}>{t.journeysPerDay}</label>
          <input
            id={`${id}-journeys`}
            className="ci-field"
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={journeysPerDay}
            onChange={(event) => setJourneysPerDay(event.target.value)}
          />
        </p>

        <p className="ci-calc-row">
          <label htmlFor={`${id}-travellers`}>{t.travellers}</label>
          <input
            id={`${id}-travellers`}
            className="ci-field"
            type="number"
            inputMode="numeric"
            min={1}
            max={10}
            value={travellers}
            onChange={(event) => setTravellers(event.target.value)}
          />
        </p>

        <p className="ci-calc-row ci-calc-wide">
          <label htmlFor={`${id}-airport`}>{t.airport}</label>
          <input
            id={`${id}-airport`}
            type="checkbox"
            checked={usesAirport}
            onChange={(event) => setUsesAirport(event.target.checked)}
          />
        </p>
      </div>

      <table className="ci-table" role="table">
        <thead>
          <tr role="row">
            <th scope="col">{t.ticket}</th>
            <th scope="col">{t.needed}</th>
            <th scope="col">{t.total}</th>
          </tr>
        </thead>
        <tbody>
          {priced.map((item) => {
            const isBest = best?.ticket.key === item.ticket.key;
            return (
              <tr key={item.ticket.key} role="row" aria-current={isBest ? "true" : undefined}>
                <td data-label={t.ticket}>
                  <strong>{item.ticket.name}</strong>
                  <br />
                  <span className="ci-calc-note">{item.ticket.note[locale]}</span>
                </td>
                <td data-label={t.needed}>
                  {item.unitsPerTraveller === null
                    ? "—"
                    : `${item.unitsPerTraveller} × ${travellers}`}
                </td>
                <td data-label={t.total} className="ci-numeric">
                  {item.total === null ? (
                    <span>
                      {item.blocked === "airport"
                        ? t.blockedAirport
                        : item.blocked === "no-fare"
                          ? t.blockedNoFare
                          : "—"}
                    </span>
                  ) : (
                    <>
                      {money(item.total)}
                      {isBest ? ` ${t.cheapestTag}` : ""}
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="ci-calc-note">{t.personalNote}</p>
      <p className="ci-calc-note">
        {t.sourceLine}{" "}
        <a href={TICKETS[0]?.sourceUrl} rel="noopener" target="_blank">
          TMB
        </a>
        . {t.verified.replace("{date}", TICKETS[0]?.verifiedAt ?? "")}
      </p>
      <p className="ci-calc-note">{t.disclaimer}</p>
    </section>
  );
}
