import { addDays, todayInCatalonia } from "@/lib/content/holidays/calendar";
import { loadLocalCalendar } from "@/lib/content/holidays/local";
import { metroLines } from "@/lib/content/metro/tonight";
import type { Locale } from "@/lib/i18n/config";

/**
 * Today's and tomorrow's metro hours, worked out from TMB's rules.
 *
 * Server-rendered so the answer is in the HTML: "a qué hora cierra el metro
 * hoy" and "today metro closing time" were among the guide's queries at
 * positions 10-12 (Search Console, 28 days to 22 Oct 2026). The nightly cron
 * revalidates the page, so the date is never a day out.
 *
 * Barcelona's own two local days make their eve a 2:00 night too; they come
 * from the Generalitat's open data, and if that read fails the block falls
 * back to the Catalonia-wide calendar alone rather than failing.
 */

const BARCELONA = "08019";

export async function MetroTonight({ locale, now }: { locale: Locale; now?: Date }) {
  const today = todayInCatalonia(now);
  const years = [...new Set([today, addDays(today, 2)].map((iso) => Number(iso.slice(0, 4))))];
  const calendars = await Promise.all(years.map((year) => loadLocalCalendar(year)));
  const local = calendars.flatMap((calendar) =>
    calendar.places.filter((place) => place.key.startsWith(BARCELONA) && !place.isNucleus).flatMap((place) => place.dates),
  );
  const lines = metroLines(today, locale, local);

  return (
    <section className="ci-today" aria-live="off">
      <p className="ci-today-answer is-not">{lines.today}</p>
      <p className="ci-today-date">{lines.tomorrow}</p>
      <p className="ci-today-note">{lines.caveat}</p>
    </section>
  );
}
