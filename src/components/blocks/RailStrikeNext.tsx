import { todayInCatalonia } from "@/lib/content/holidays/calendar";
import { railStrikeNextLines } from "@/lib/content/batch02/rail-strike-next";
import type { Locale } from "@/lib/i18n/config";

/**
 * "Is there a Renfe or Rodalies strike now? The next train strike", worked out
 * from the rail strikes in the strike data (`batch02/rail-strike-next.ts`).
 *
 * Server-rendered so the answer is in the HTML, like ParkingToday and
 * ShopsToday. `railStrikeNext` is in DAY_DEPENDENT_BLOCKS, so the nightly cron
 * rebuilds the page; the date it names is the day it was rendered, and the
 * "read on" date is the last re-read of the sources, never today's.
 */
export function RailStrikeNext({ locale, now }: { locale: Locale; now?: Date }) {
  const lines = railStrikeNextLines(todayInCatalonia(now), locale);
  const internal = (href: string) => href.startsWith("/");
  // Green (the holiday block's "yes" colour) only when there is no strike to plan around; plain when one is on or coming.
  return (
    <section className="ci-today" aria-live="off">
      <p className={`ci-today-answer ${lines.kind === "none" && !lines.stale ? "is-holiday" : "is-not"}`}>{lines.headline}</p>
      <p className="ci-today-date">{lines.detail}</p>
      <dl className="ci-today-facts">
        {lines.facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      {lines.page ? (
        <p className="ci-today-note">
          <a href={lines.page.href}>{lines.page.label}</a>
        </p>
      ) : null}
      <ul className="ci-today-dates">
        {lines.links.map((link) => (
          <li key={link.href}>
            {internal(link.href) ? (
              <a href={link.href}>{link.label}</a>
            ) : (
              <a href={link.href} rel="noopener" target="_blank">
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
      <p className="ci-today-note">{lines.note}</p>
    </section>
  );
}
