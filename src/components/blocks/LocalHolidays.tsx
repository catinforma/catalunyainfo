import { shortDate, todayInCatalonia, WEEKDAY_NAMES, weekdayIndex } from "@/lib/content/holidays/calendar";
import { LOCAL_SOURCE, loadLocalCalendar } from "@/lib/content/holidays/local";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

import { LocalHolidaysFilter } from "./LocalHolidaysFilter";

/**
 * Every municipality's local holidays, as one table.
 *
 * One page rather than nine hundred. A page per municipality would hold two
 * dates and a name each, which is the textbook doorway page, and the exact
 * kind of thing that got version 1 of this site rejected. One complete,
 * searchable table answers "when is the local holiday in X" for every X at
 * once, and is genuinely more useful than any single entry.
 *
 * The whole table is rendered on the server so that every municipality name
 * and date is in the HTML. The filter box is progressive enhancement: it hides
 * rows in the browser and changes nothing a crawler sees.
 */
export async function LocalHolidays({ locale }: { locale: Locale }) {
  const t = getMessages(locale).localHolidays;
  const year = Number(todayInCatalonia().slice(0, 4));
  const calendar = await loadLocalCalendar(year);

  if (calendar.error || calendar.places.length === 0) {
    return (
      <section className="ci-local" aria-label={t.title}>
        <p className="ci-calc-note">
          {t.unavailable}{" "}
          <a href={LOCAL_SOURCE.url} rel="noopener" target="_blank">
            {LOCAL_SOURCE.name}
          </a>
          .
        </p>
      </section>
    );
  }

  const day = (iso: string) => `${shortDate(iso, locale)} (${WEEKDAY_NAMES[locale][weekdayIndex(iso)]})`;

  return (
    <section className="ci-local" aria-label={t.title}>
      <p className="ci-local-summary">
        {t.summary
          .replace("{year}", String(year))
          .replace("{n}", String(calendar.places.length))}
      </p>

      <LocalHolidaysFilter label={t.filterLabel} placeholder={t.filterPlaceholder} empty={t.filterEmpty} />

      {/*
        A plain two-column table, without the stacked-card markup the general
        table block uses. Every attribute here is repeated 1,400 times and
        then again in the server-component payload, so the per-row markup is
        kept to what the reader and the filter actually need.
      */}
      <table className="ci-local-table">
        <thead>
          <tr>
            <th scope="col">{t.colPlace}</th>
            <th scope="col">{t.colDates}</th>
          </tr>
        </thead>
        <tbody>
          {calendar.places.map((place) => (
            <tr key={place.key} data-place={place.name.toLowerCase()}>
              <td>
                {place.name}
                {place.isNucleus ? <small> {t.nucleus}</small> : null}
              </td>
              <td>{place.dates.map(day).join(" · ")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="ci-calc-note">
        {t.sourceLine}{" "}
        <a href={LOCAL_SOURCE.url} rel="noopener" target="_blank">
          {LOCAL_SOURCE.name}
        </a>{" "}
        ({LOCAL_SOURCE.publisher}). {t.nextYearNote.replace("{next}", String(year + 1))}
      </p>
    </section>
  );
}
