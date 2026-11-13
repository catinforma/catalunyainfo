import type { EmbedPlace } from "@/lib/programmatic/embed-2027/places";
import { subscribeBlock, type FeedLocale } from "@/lib/programmatic/ics/feeds";

/**
 * "Add to your calendar" on a town or city page: the place's .ics feed as a
 * webcal:// subscription, as Google Calendar's add-by-URL link, and as a plain
 * download (lib/programmatic/ics/feeds.ts holds the words and URLs). Plain
 * links, no script. rel="nofollow": the feeds are for calendar apps, not for
 * crawlers (they are noindex too).
 */
export function CalendarSubscribe({ locale, place }: { locale: FeedLocale; place: EmbedPlace }) {
  const b = subscribeBlock(locale, place);
  const id = "afegeix-calendari";
  return (
    <aside className="ci-subscribe" aria-labelledby={id}>
      <p className="ci-subscribe-title" id={id}>
        {b.title}
      </p>
      <p className="ci-subscribe-text">{b.lead}</p>
      <ul className="ci-subscribe-links">
        {b.links.map((l) => (
          <li key={l.href}>
            <a href={l.href} rel="nofollow" {...(l.type ? { type: l.type } : {})}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="ci-subscribe-url">
        {b.urlLabel} <code>{b.url}</code>
      </p>
    </aside>
  );
}
