import Link from "next/link";

import { renderInline } from "@/lib/content/inline";
import type { Locale } from "@/lib/i18n/config";
import { esName } from "@/lib/programmatic/holidays/names";
import { CHRISTMAS_COPY, LIST_COPY, TRANSFORMATION, dayHeading, itemRange, stamp } from "@/lib/programmatic/weekend/agenda-copy";
import { buildView, type AgendaItem, type AgendaSourceId, type DayBucket, type SourceView } from "@/lib/programmatic/weekend/agenda-list";
import { BCN_SOURCE, GENCAT_SOURCE } from "@/lib/programmatic/weekend/agenda-upstream";
import type { ChristmasTownLink } from "@/lib/programmatic/weekend/christmas-weekend";
import { fairsHubPath } from "@/lib/programmatic/christmas-fairs/paths";

/**
 * This weekend's activities, server-rendered: by day, then by type, each
 * group capped, with the official page of every activity. Shared by the
 * Catalan, Spanish and English weekend pages. Nothing here reads the clock:
 * the route passes the window and the render date.
 */

const townLabel = (name: string, locale: Locale) => (locale === "es" ? esName(name) : name);

/** The Ajuntament's page in the reader's language (Guia Barcelona has ca, es and en). */
function itemUrl(item: AgendaItem, locale: Locale): string {
  return item.source === "bcn" ? item.url.replace("/ca/detall/", `/${locale}/detall/`) : item.url;
}

function officialAgenda(source: AgendaSourceId, locale: Locale): string {
  return source === "bcn" ? BCN_SOURCE.guide[locale] : GENCAT_SOURCE.url;
}

function Item({ item, locale, showTown, multi }: { item: AgendaItem; locale: Locale; showTown: boolean; multi: boolean }) {
  const t = LIST_COPY[locale];
  const venue = item.venue ? (item.moreVenues > 0 ? `${item.venue} ${t.moreVenues(item.moreVenues)}` : item.venue) : "";
  const where = showTown ? townLabel(item.town, locale) : item.district;
  const meta = [venue, where && where !== venue ? where : "", multi ? itemRange(item.start, item.end, locale) : "", item.time ?? ""].filter(Boolean);
  return (
    <li className="ci-agenda-item">
      <p className="ci-agenda-title">
        <a href={itemUrl(item, locale)} rel="noopener" target="_blank">
          {item.title}
        </a>
        {item.free ? <span className="ci-agenda-free">{t.free}</span> : null}
      </p>
      {meta.length > 0 ? <p className="ci-agenda-meta">{meta.join(" · ")}</p> : null}
      {item.price ? <p className="ci-agenda-meta">{item.price}</p> : null}
    </li>
  );
}

function Bucket({ bucket, locale, idPrefix, showTown, more }: { bucket: DayBucket; locale: Locale; idPrefix: string; showTown: boolean; more: { href: string; name: string } }) {
  const t = LIST_COPY[locale];
  const multi = bucket.key === "multi";
  const id = `${idPrefix}-${multi ? "diversos" : bucket.key}`;
  return (
    <section aria-labelledby={id}>
      <h3 id={id}>{multi ? t.multiHeading : dayHeading(bucket.key, locale)}</h3>
      {multi ? <p className="ci-agenda-note">{t.multiNote}</p> : null}
      {bucket.groups.map((group) => (
        <div key={group.type}>
          <h4 className="ci-agenda-group">
            {t.types[group.type]}
            <span className="ci-agenda-count">{group.total}</span>
          </h4>
          <ul className="ci-agenda-list">
            {group.items.map((item) => (
              <Item key={item.id} item={item} locale={locale} showTown={showTown} multi={multi} />
            ))}
          </ul>
          {group.total > group.items.length ? (
            <p className="ci-agenda-more">
              <a href={more.href} rel="noopener" target="_blank">
                {t.more(group.total - group.items.length, more.name)}
              </a>
            </p>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export interface AgendaListProps {
  locale: Locale;
  /** The H2's id; day sections use it as a prefix. */
  id: string;
  window: { from: string; to: string; long: boolean };
  today: string;
  items: readonly AgendaItem[];
  /** The reads behind `items`, for the status line and the attribution. */
  sources: { source: AgendaSourceId; view: SourceView }[];
  /** Whose agenda the "more" links open. */
  more: AgendaSourceId;
  /** Print each activity's municipality (Catalonia-wide lists); else its Barcelona district. */
  showTown: boolean;
  heading?: string;
}

export function AgendaList({ locale, id, window, today, items, sources, more, showTown, heading }: AgendaListProps) {
  const t = LIST_COPY[locale];
  const title = heading ?? (window.long ? t.headingLong : t.heading);
  const available = sources.filter((s) => s.view.read);
  const moreLink = { href: officialAgenda(more, locale), name: t.sourceName[more] };
  const fallback = (
    <a href={moreLink.href} rel="noopener" target="_blank">
      {t.sourceName[more].replace(/^(l'|la |the )/i, "")}
    </a>
  );

  if (available.length === 0) {
    return (
      <>
        <h2 id={id}>{title}</h2>
        <p>
          {t.unavailable} {fallback}.
        </p>
      </>
    );
  }

  const view = buildView(items, window, today);
  const held = available.find((s) => s.view.status === "kept" || s.view.status === "snapshot");
  const newest = available.map((s) => s.view.read!.fetchedAt).sort().at(-1)!;

  return (
    <>
      <h2 id={id}>{title}</h2>
      {held ? <p className="ci-agenda-note">{t.held(stamp(held.view.read!.fetchedAt, locale))}</p> : null}
      {view.counts.all === 0 ? (
        <p>
          {t.empty} {fallback}.
        </p>
      ) : (
        <>
          <p className="ci-agenda-summary">{t.summary(view.counts)}</p>
          {t.languageNote ? <p className="ci-agenda-note">{t.languageNote}</p> : null}
          <p className="ci-agenda-note">
            {[...view.days, ...(view.multi ? [view.multi] : [])].map((b, i) => (
              <span key={b.key}>
                {i > 0 ? " · " : ""}
                <a href={`#${id}-${b.key === "multi" ? "diversos" : b.key}`}>{b.key === "multi" ? t.multiHeading : dayHeading(b.key, locale)}</a> ({b.total})
              </span>
            ))}
          </p>
          {view.days.map((bucket) => (
            <Bucket key={bucket.key} bucket={bucket} locale={locale} idPrefix={id} showTown={showTown} more={moreLink} />
          ))}
          {view.multi ? <Bucket bucket={view.multi} locale={locale} idPrefix={id} showTown={showTown} more={moreLink} /> : null}
        </>
      )}
      <p className="ci-agenda-note">
        {t.readAt(stamp(newest, locale))}{" "}
        {sources.map((s, i) => (
          <span key={s.source}>
            {i > 0 ? " · " : `${t.allAgenda}: `}
            <a href={officialAgenda(s.source, locale)} rel="noopener" target="_blank">
              {s.source === "bcn" ? "Guia Barcelona" : GENCAT_SOURCE.name}
            </a>
          </span>
        ))}
      </p>
    </>
  );
}

/** The licence lines the two sources ask for, with the publisher's last update. */
export function AgendaSources({ locale, sources }: { locale: Locale; sources: { source: AgendaSourceId; view: SourceView }[] }) {
  const t = LIST_COPY[locale];
  const shown = sources.filter((s) => s.view.read);
  if (shown.length === 0) return null;
  return (
    <section className="mt-10" aria-labelledby="ci-weekend-agenda-sources">
      <h2 id="ci-weekend-agenda-sources" className="font-sans text-base font-semibold">
        {t.sourcesHeading}
      </h2>
      <ul className="ci-sources mt-3">
        {shown.map((s) => {
          const read = s.view.read!;
          const updated = stamp(read.updated ?? read.fetchedAt, locale);
          return (
            <li key={s.source}>
              <span>
                {renderInline(t.attribution[s.source](updated))}{" "}
                <a href={s.source === "bcn" ? BCN_SOURCE.attributionUrl : GENCAT_SOURCE.dataUrl} rel="noopener" target="_blank">
                  {s.source === "bcn" ? "Open Data BCN" : "analisi.transparenciacatalunya.cat"}
                </a>
                {" · "}
                <a href={s.source === "bcn" ? BCN_SOURCE.licenceUrl : GENCAT_SOURCE.licenceUrl} rel="noopener license" target="_blank">
                  {s.source === "bcn" ? BCN_SOURCE.licence : locale === "en" ? "licence" : locale === "es" ? "licencia" : "llicència"}
                </a>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-[var(--color-muted)]">{TRANSFORMATION[locale]}</p>
    </section>
  );
}

/** The Christmas fairs open this weekend, linking our town pages. */
export function ChristmasThisWeekend({ locale, towns, id }: { locale: Locale; towns: readonly ChristmasTownLink[]; id: string }) {
  if (towns.length === 0) return null;
  const t = CHRISTMAS_COPY[locale];
  return (
    <>
      <h2 id={id}>{t.heading}</h2>
      <ul className="ci-agenda-list mt-3">
        {towns.slice(0, 16).map((town) => (
          <li key={town.ine} className="ci-agenda-item">
            <p className="ci-agenda-title">
              <Link href={town.href}>{townLabel(town.town, locale)}</Link>
            </p>
            <p className="ci-agenda-meta">{town.fairs.map((f) => `${f.name} (${itemRange(f.start, f.end, locale)})`).join(" · ")}</p>
          </li>
        ))}
      </ul>
      <p className="ci-agenda-note">
        {t.note} <Link href={fairsHubPath(locale)}>{t.hub}</Link>
      </p>
    </>
  );
}
