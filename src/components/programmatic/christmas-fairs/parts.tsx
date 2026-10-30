import Link from "next/link";

import { renderInline } from "@/lib/content/inline";
import { attribution, fairShortName, guidance, labels, townName } from "@/lib/programmatic/christmas-fairs/copy";
import { comarcaOf, hasEnglish, SNAPSHOT, townByIne } from "@/lib/programmatic/christmas-fairs/data";
import { capitalize, fullDate, rangeText, shortRange } from "@/lib/programmatic/christmas-fairs/format";
import { townPath, type FairsLocale } from "@/lib/programmatic/christmas-fairs/paths";
import type { DatedFair } from "@/lib/programmatic/christmas-fairs/today";
import type { Fair, PendingMarket } from "@/lib/programmatic/christmas-fairs/types";
import { municipality } from "@/lib/programmatic/weekend/data";

/** Shared, server-rendered pieces of the Christmas fair pages. Nothing here reads the clock. */

/** The dates the browser's "today" box works from, embedded in the HTML. */
export function datedFairs(fairs: readonly Fair[], locale: FairsLocale): DatedFair[] {
  return fairs.map((f) => ({ id: f.id, s: f.start, e: f.end, n: fairShortName(f, "ca"), t: townName(municipality(f.ine)?.name ?? "", locale) }));
}

/** One fair, in full: what a town page is about. */
export function FairCard({ fair, locale }: { fair: Fair; locale: FairsLocale }) {
  const t = labels(locale);
  const source =
    fair.source === "organiser" || (fair.checked && fair.datasetDates)
      ? t.fromOrganiser(fair.checked!.publisher, fullDate(fair.checked!.readOn, locale))
      : fair.source === "agenda"
        ? t.fromAgenda
        : t.fromCalendar;
  return (
    <section className="ci-agenda mt-6" aria-label={fair.name}>
      <h3 className="ci-agenda-heading">{fair.name}</h3>
      {locale === "es" && fair.nameEs && fair.nameEs !== fair.name ? <p className="ci-agenda-range">{fair.nameEs}</p> : null}
      <p className="ci-agenda-summary">
        <time dateTime={fair.start}>{capitalize(rangeText(fair.start, fair.end, locale))}</time>
      </p>
      <ul className="mt-3">
        {fair.place ? (
          <li>
            <strong>{t.place}:</strong> {fair.place}
          </li>
        ) : null}
        {fair.organiser ? (
          <li>
            <strong>{t.organiser}:</strong> {fair.organiser}
          </li>
        ) : null}
        {fair.since ? (
          <li>
            <strong>{t.since}:</strong> {fair.since}
          </li>
        ) : null}
        {fair.web ? (
          <li>
            <a href={fair.web} rel="noopener nofollow" target="_blank">
              {fair.webReplaced ? t.councilWebsite : t.website}
            </a>
          </li>
        ) : null}
      </ul>
      <p className="ci-agenda-meta">
        {source}
        {fair.datasetDates ? ` ${t.corrected(rangeText(fair.datasetDates.start, fair.datasetDates.end, locale, { weekdays: false }))}` : ""}
        {fair.toConfirm ? ` ${t.toConfirm}` : ""}
      </p>
      {fair.checked && fair.source === "organiser" ? (
        <blockquote className="mt-2 text-sm text-[var(--color-ink-soft)]" lang="ca">
          «{fair.checked.quote}»{" "}
          <a href={fair.checked.url} rel="noopener nofollow" target="_blank">
            {fair.checked.publisher}
          </a>
        </blockquote>
      ) : null}
    </section>
  );
}

/** Fairs in date order, one line each, each linked to its town's page where that page exists in this locale. */
export function FairRows({ fairs, locale }: { fairs: readonly Fair[]; locale: FairsLocale }) {
  return (
    <ul className="ci-agenda-list mt-3">
      {fairs.map((f) => {
        const town = townByIne(f.ine);
        const m = municipality(f.ine);
        const name = townName(m?.name ?? "", locale);
        const linked = town && (locale !== "en" || hasEnglish(town));
        return (
          <li key={f.id} className="ci-agenda-item">
            <p className="ci-agenda-title">
              {linked ? <Link href={townPath(locale, town.slug)}>{f.name}</Link> : f.web ? (
                <a href={f.web} rel="noopener nofollow" target="_blank">
                  {f.name}
                </a>
              ) : (
                f.name
              )}
            </p>
            <p className="ci-agenda-meta">
              {name} ({m ? comarcaOf(m) : ""}) · <time dateTime={f.start}>{shortRange(f.start, f.end, locale)}</time>
              {f.place ? ` · ${f.place}` : ""}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function PendingList({ markets, locale }: { markets: readonly PendingMarket[]; locale: FairsLocale }) {
  if (markets.length === 0) return null;
  return (
    <ul>
      {markets.map((p) => (
        <li key={p.id}>
          <strong>{p.name}</strong> ({townName(municipality(p.ine)?.name ?? "", locale)}): {p.shows[locale]}{" "}
          <a href={p.url} rel="noopener nofollow" target="_blank">
            {p.publisher}
          </a>
          {locale === "en" ? `, checked ${fullDate(p.readOn, locale)}.` : locale === "es" ? `, revisado el ${fullDate(p.readOn, locale)}.` : `, revisat el ${fullDate(p.readOn, locale)}.`}
        </li>
      ))}
    </ul>
  );
}

export function Guidance({ locale }: { locale: FairsLocale }) {
  const t = labels(locale);
  return (
    <section aria-labelledby="ci-xmas-guide">
      <h2 id="ci-xmas-guide">{t.howToRead}</h2>
      {guidance(locale, SNAPSHOT.sources.fairs.url, SNAPSHOT.sources.agenda.url).map((text) => (
        <p key={text}>{renderInline(text)}</p>
      ))}
    </section>
  );
}

/** The two datasets, every organiser page the list uses, and the day the data was read. */
export function Sources({ locale, fairs }: { locale: FairsLocale; fairs: readonly Fair[] }) {
  const t = labels(locale);
  const { fairs: calendar, agenda } = SNAPSHOT.sources;
  const date = (iso: string | null) => (iso ? fullDate(iso, locale) : "");
  const organisers = [...new Map(fairs.filter((f) => f.checked).map((f) => [f.checked!.url, f.checked!])).values()];
  const updated = locale === "en" ? "updated" : locale === "es" ? "actualizado el" : "actualitzat el";
  const read = locale === "en" ? "read on" : locale === "es" ? "leída el" : "llegit el";
  return (
    <section className="mt-12" aria-labelledby="ci-xmas-sources">
      <h2 id="ci-xmas-sources" className="font-sans text-base font-semibold">
        {t.sources}
      </h2>
      <p className="mt-1 text-sm">{renderInline(attribution(locale, { fairs: date(calendar.updated), agenda: date(agenda.updated) }))}</p>
      <ol className="ci-sources mt-3">
        {[calendar, agenda].map((source) => (
          <li key={source.url}>
            <span>
              <a href={source.url} rel="noopener nofollow" target="_blank">
                {source.name}
              </a>
              <span className="text-[var(--color-muted)]">
                {" "}
                — {source.publisher}
                {source.updated ? `, ${updated} ${date(source.updated)}` : ""}
              </span>
            </span>
          </li>
        ))}
        {organisers.map((o) => (
          <li key={o.url}>
            <span>
              <a href={o.url} rel="noopener nofollow" target="_blank">
                {o.publisher}
              </a>
              <span className="text-[var(--color-muted)]">
                {" "}
                — {read} {date(o.readOn)}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-[var(--color-muted)]">{t.readOn(date(SNAPSHOT.readOn))}</p>
    </section>
  );
}
