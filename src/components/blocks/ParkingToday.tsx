import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { parkingTodayLines } from "@/lib/content/batch02/parking-today";
import type { Locale } from "@/lib/i18n/config";

/**
 * "Do I pay for the blue or green zone in Barcelona today?", worked out from
 * AREA's published hours in `batch02/parking-today.ts`.
 *
 * Server-rendered so the answer is in the HTML, like ShopsToday and
 * MetroTonight. `parkingToday` is in DAY_DEPENDENT_BLOCKS, so the nightly cron
 * rebuilds the page; every sentence names its date.
 */
export function ParkingToday({ locale, now }: { locale: Locale; now?: Date }) {
  const lines = parkingTodayLines(todayInCatalonia(now), locale);
  // The "is-holiday" colour (green) marks a Sunday, when the general hours charge nothing; any other day uses the plain colour.
  return (
    <section className="ci-today" aria-live="off">
      <p className={`ci-today-answer ${lines.free ? "is-holiday" : "is-not"}`}>{lines.headline}</p>
      <dl className="ci-today-facts">
        {lines.facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      <p className="ci-today-note">{lines.note}</p>
    </section>
  );
}
