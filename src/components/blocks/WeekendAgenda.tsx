import { longDate, shortDate } from "@/lib/content/holidays/calendar";
import {
  AGENDA_SOURCE,
  loadWeekendAgenda,
  type AgendaCategory,
  type AgendaEvent,
} from "@/lib/content/weekend/agenda";
import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * This weekend's activities, from the Generalitat's open-data cultural agenda.
 *
 * An async server component on purpose. The list has to be in the HTML for the
 * page to rank for "what to do this weekend", and it has to be the *current*
 * weekend, which is what the dated page it replaces got wrong for three weeks.
 * The fetch is cached for six hours; the route itself revalidates every five
 * minutes, so the window rolls over on Monday without anyone touching it.
 *
 * Grouped by kind of plan rather than listed by date, because that is how
 * people decide: "something for the kids", "something free", "a fair". The
 * free activities get their own section at the top for the same reason.
 *
 * Activity names are shown as the organiser published them, which is usually
 * in Catalan; they are proper names and translating them would make them
 * unfindable on the organiser's own site.
 */

const GROUP_ORDER: AgendaCategory[] = [
  "fairs",
  "festivals",
  "family",
  "music",
  "theatre",
  "dance",
  "routes",
  "exhibitions",
  "other",
];

/** Enough to be useful, few enough that the page stays a guide, not a dump. */
const PER_GROUP = 12;
const FREE_LIMIT = 15;

function dateRange(event: AgendaEvent, locale: Locale): string {
  if (event.start === event.end) return shortDate(event.start, locale);
  return `${shortDate(event.start, locale)} – ${shortDate(event.end, locale)}`;
}

function EventItem({ event, locale }: { event: AgendaEvent; locale: Locale }) {
  const t = getMessages(locale).weekendAgenda;
  const place = [event.venue, event.municipality].filter(Boolean).join(", ");
  return (
    <li className="ci-agenda-item">
      <p className="ci-agenda-title">
        {event.url ? (
          <a href={event.url} rel="noopener nofollow" target="_blank">
            {event.title}
          </a>
        ) : (
          event.title
        )}
        {event.free ? <span className="ci-agenda-free">{t.free}</span> : null}
      </p>
      <p className="ci-agenda-meta">
        {place}
        {place ? " · " : ""}
        {dateRange(event, locale)}
      </p>
    </li>
  );
}

export async function WeekendAgenda({ locale }: { locale: Locale }) {
  const t = getMessages(locale).weekendAgenda;
  const { window, events, error } = await loadWeekendAgenda();

  const heading = window.long ? t.titleLong : t.title;
  const range = `${longDate(window.from, locale)} – ${longDate(window.to, locale)}`;

  if (error || events.length === 0) {
    return (
      <section className="ci-agenda" aria-label={heading}>
        <h3 className="ci-agenda-heading">{heading}</h3>
        <p className="ci-agenda-range">{range}</p>
        <p className="ci-agenda-note">
          {t.unavailable}{" "}
          <a href={AGENDA_SOURCE.url} rel="noopener" target="_blank">
            {AGENDA_SOURCE.name}
          </a>
          .
        </p>
      </section>
    );
  }

  const free = events.filter((event) => event.free).slice(0, FREE_LIMIT);
  const groups = GROUP_ORDER.map((category) => ({
    category,
    items: events.filter((event) => event.category === category).slice(0, PER_GROUP),
    total: events.filter((event) => event.category === category).length,
  })).filter((group) => group.items.length > 0);

  const municipalities = new Set(events.map((event) => event.municipality)).size;

  return (
    <section className="ci-agenda" aria-label={heading}>
      <h3 className="ci-agenda-heading">{heading}</h3>
      <p className="ci-agenda-range">{range}</p>
      <p className="ci-agenda-summary">
        {t.summary
          .replace("{count}", String(events.length))
          .replace("{places}", String(municipalities))
          .replace("{free}", String(events.filter((event) => event.free).length))}
      </p>

      {free.length > 0 ? (
        <>
          <h4 className="ci-agenda-group">{t.freeTitle}</h4>
          <ul className="ci-agenda-list">
            {free.map((event) => (
              <EventItem key={`free-${event.id}`} event={event} locale={locale} />
            ))}
          </ul>
        </>
      ) : null}

      {groups.map((group) => (
        <div key={group.category}>
          <h4 className="ci-agenda-group">
            {t.categories[group.category]}
            <span className="ci-agenda-count">{group.total}</span>
          </h4>
          <ul className="ci-agenda-list">
            {group.items.map((event) => (
              <EventItem key={`${group.category}-${event.id}`} event={event} locale={locale} />
            ))}
          </ul>
          {group.total > group.items.length ? (
            <p className="ci-agenda-more">
              {t.more.replace("{n}", String(group.total - group.items.length))}
            </p>
          ) : null}
        </div>
      ))}

      <p className="ci-agenda-note">
        {t.sourceLine}{" "}
        <a href={AGENDA_SOURCE.url} rel="noopener" target="_blank">
          {AGENDA_SOURCE.name}
        </a>{" "}
        ({AGENDA_SOURCE.publisher}). {t.checkLine}
      </p>
    </section>
  );
}
