import {
  CALENDAR_VERIFIED_AT,
  COVERED_YEARS,
  HOLIDAY_SOURCE,
  addDays,
  allHolidays,
  aranSubstitutionFor,
  daysBetween,
  holidayOn,
  isCovered,
  nextHolidayAfter,
  longDate,
  shortDate,
  todayInCatalonia,
  weekdayIndex,
  WEEKDAY_NAMES,
} from "@/lib/content/holidays/calendar";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * Is today a public holiday in Catalonia?
 *
 * ## Why this is a server component
 *
 * The answer has to be in the HTML. Search Console shows 166 distinct queries
 * of the shape *is the 30th a holiday* / *is Monday a holiday* / *is it a
 * holiday today* in a single week, and a page that renders the answer in the
 * browser gives Google an empty box. The route revalidates every five minutes,
 * so the server-rendered answer is never stale by more than that.
 *
 * ## Why the timezone is explicit
 *
 * A page whose entire job is to say what day it is must not be a day out. The
 * date comes from `Europe/Madrid`, not the server clock: between midnight and
 * 02:00 local, a UTC server still thinks it is yesterday, and that is exactly
 * when somebody asks whether tomorrow is a holiday.
 *
 * ## What it refuses to answer
 *
 * Only the years an order has actually been published for. Catalonia's
 * calendar is approved one year at a time, so a question about 2028 gets "we
 * do not know yet" rather than a guess, and local holidays are named as a gap
 * rather than silently ignored: two of every municipality's days are decided by
 * the municipality, and a page that said "not a holiday" without mentioning
 * that would be wrong twice a year in every town.
 */

export function HolidayToday({ locale, now }: { locale: Locale; now?: Date }) {
  const t = getMessages(locale).holidayToday;

  const today = todayInCatalonia(now);
  const tomorrow = addDays(today, 1);

  const todayHoliday = holidayOn(today);
  const tomorrowHoliday = holidayOn(tomorrow);
  const next = nextHolidayAfter(today);
  const weekend = weekdayIndex(today) === 0 || weekdayIndex(today) === 6;

  const upcoming = allHolidays().filter((holiday) => holiday.date >= today);

  return (
    <section className="ci-today" aria-label={t.title}>
      {/* The answer, as a sentence, before anything else on the page. */}
      <p className={`ci-today-answer ${todayHoliday ? "is-holiday" : "is-not"}`}>
        {todayHoliday ? t.yes : t.no}
      </p>
      <p className="ci-today-date">
        {longDate(today, locale)}
        {todayHoliday ? ` — ${todayHoliday.name[locale]}` : ""}
      </p>

      {!todayHoliday && weekend ? <p className="ci-today-note">{t.weekendNote}</p> : null}

      <dl className="ci-today-facts">
        <div>
          <dt>{t.tomorrow}</dt>
          <dd>
            {tomorrowHoliday
              ? `${t.yesShort} — ${tomorrowHoliday.name[locale]}, ${shortDate(tomorrow, locale)}`
              : isCovered(tomorrow)
                ? t.noShort
                : t.unknownShort}
          </dd>
        </div>
        <div>
          <dt>{t.nextHoliday}</dt>
          <dd>
            {next
              ? `${next.name[locale]} — ${longDate(next.date, locale)} (${t.inDays.replace(
                  "{n}",
                  String(daysBetween(today, next.date)),
                )})`
              : t.unknownShort}
          </dd>
        </div>
      </dl>

      <h3 className="ci-today-subtitle">{t.upcomingTitle}</h3>
      <table className="ci-table" role="table">
        <thead>
          <tr role="row">
            <th scope="col">{t.colDate}</th>
            <th scope="col">{t.colWeekday}</th>
            <th scope="col">{t.colName}</th>
          </tr>
        </thead>
        <tbody>
          {upcoming.map((holiday) => {
            const aran = aranSubstitutionFor(holiday.date);
            return (
              <tr key={holiday.date} role="row" aria-current={holiday.date === today ? "date" : undefined}>
                <td data-label={t.colDate}>
                  {shortDate(holiday.date, locale)} {holiday.date.slice(0, 4)}
                </td>
                <td data-label={t.colWeekday}>{WEEKDAY_NAMES[locale][weekdayIndex(holiday.date)]}</td>
                <td data-label={t.colName}>
                  {holiday.name[locale]}
                  {aran ? (
                    <>
                      <br />
                      <span className="ci-today-aran">
                        {t.aranNote
                          .replace("{replaced}", holiday.name[locale])
                          .replace("{name}", aran.name[locale])
                          .replace("{date}", shortDate(aran.date, locale))}
                      </span>
                    </>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="ci-today-note">{t.localNote}</p>
      <p className="ci-today-note">
        {t.coverageNote.replace("{years}", COVERED_YEARS.join(", "))}
      </p>
      <p className="ci-today-note">
        {t.sourceLine}{" "}
        <a href={HOLIDAY_SOURCE.url} rel="noopener" target="_blank">
          {HOLIDAY_SOURCE.publisher}
        </a>
        . {t.verified.replace("{date}", CALENDAR_VERIFIED_AT)}
      </p>
    </section>
  );
}
