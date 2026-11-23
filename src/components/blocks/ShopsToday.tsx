import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { SHOPS_TODAY_AFTER, shopsTodayLines } from "@/lib/content/batch02/shops-today";
import type { Locale } from "@/lib/i18n/config";

/**
 * "Can shops open today in Barcelona? And this Sunday?", worked out from the
 * official calendars in `batch02/shops-today.ts`.
 *
 * Server-rendered so the answer is in the HTML, like HolidayToday and
 * MetroTonight: the queries are "tiendas abiertas hoy en barcelona" and "este
 * domingo abren las tiendas". `shopsToday` is in DAY_DEPENDENT_BLOCKS, so the
 * nightly cron rebuilds the page; every sentence names its date.
 */
export function ShopsToday({ locale, now }: { locale: Locale; now?: Date }) {
  const lines = shopsTodayLines(todayInCatalonia(now), locale);
  if (!lines) {
    return (
      <section className="ci-today" aria-live="off">
        <p className="ci-today-note">{SHOPS_TODAY_AFTER[locale]}</p>
      </section>
    );
  }
  // Green (the holiday block's "yes" colour) when shops may open on a Sunday or holiday; plain otherwise.
  const open = lines.todayKind === "open" || lines.todayKind === "pending2027";
  return (
    <section className="ci-today" aria-live="off">
      <p className={`ci-today-answer ${open ? "is-holiday" : "is-not"}`}>{lines.today}</p>
      {lines.catalonia ? <p className="ci-today-date">{lines.catalonia}</p> : null}
      <dl className="ci-today-facts">
        <div>
          <dt>{lines.sundayLabel}</dt>
          <dd>{lines.sundayValue}</dd>
        </div>
        <div>
          <dt>{lines.nextLabel}</dt>
          <dd>{lines.nextValue}</dd>
        </div>
      </dl>
      <p className="ci-today-note">{lines.note}</p>
    </section>
  );
}
