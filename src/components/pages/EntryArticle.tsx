import Image from "next/image";
import Link from "next/link";

import { BlockRenderer, type BlockContext } from "@/components/blocks/BlockRenderer";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { EntryCard } from "@/components/EntryCard";
import { VerifiedStamp } from "@/components/VerifiedStamp";
import { PageFeedback } from "@/components/PageFeedback";
import { tableOfContents } from "@/lib/content/blocks";
import type { EntryDetail } from "@/lib/content/types";
import { formatDate, formatDistance, formatDuration, isoDate } from "@/lib/format";
import { getMessages, interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { sectionPath } from "@/lib/i18n/routes";

/**
 * The content page.
 *
 * Layout follows the map-margin idea: prose in the main column, and a
 * marginalia rail carrying the facts a reader came for — coordinates, the
 * official source, the distance, the last verification. On narrow screens the
 * rail moves directly under the H1, because on a phone the practical answer
 * should arrive before the prose, not after it.
 *
 * Everything below is rendered on the server. The initial HTML carries the H1,
 * the standfirst, the full body, the breadcrumbs and every internal link.
 */
export function EntryArticle({
  entry,
  context,
  crumbs,
}: {
  entry: EntryDetail;
  context: BlockContext;
  crumbs: Crumb[];
}) {
  const locale = entry.locale;
  const t = getMessages(locale);
  const toc = tableOfContents(entry.body);
  const published = entry.publishedAt;

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="ci-shell py-8 lg:py-12">
          <Breadcrumbs items={crumbs} locale={locale} />

          {entry.category ? (
            <p className="ci-label mb-3">
              <Link href={sectionPath(sectionForType(entry.type), locale)}>
                {entry.category.name}
              </Link>
            </p>
          ) : null}

          <h1 className="ci-measure">{entry.title}</h1>

          {entry.excerpt ? (
            <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">
              {entry.excerpt}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
            {entry.author ? (
              <span>
                {t.meta.by}{" "}
                <Link href={`${sectionPath("authors", locale)}${entry.author.slug}/`}>
                  {entry.author.name}
                </Link>
              </span>
            ) : null}
            {published ? (
              <span>
                {t.meta.publishedOn}{" "}
                <time dateTime={isoDate(published)}>{formatDate(published, locale)}</time>
              </span>
            ) : null}
            {entry.updatedAt && (!published || entry.updatedAt > published) ? (
              <span>
                {t.meta.updatedOn}{" "}
                <time dateTime={isoDate(entry.updatedAt)}>
                  {formatDate(entry.updatedAt, locale)}
                </time>
              </span>
            ) : null}
            <span>{interpolate(t.meta.readingTime, { minutes: entry.readingMinutes })}</span>
            {entry.lastVerifiedAt ? (
              <VerifiedStamp date={entry.lastVerifiedAt} locale={locale} />
            ) : null}
          </div>
        </div>
      </header>

      {entry.hero ? (
        <figure className="m-0 border-b border-[var(--color-rule)]">
          <Image
            src={entry.hero.url}
            alt={entry.hero.alt}
            width={entry.hero.width ?? 1920}
            height={entry.hero.height ?? 1080}
            sizes="100vw"
            priority
            placeholder={entry.hero.blurDataUrl ? "blur" : "empty"}
            blurDataURL={entry.hero.blurDataUrl ?? undefined}
            className="max-h-[32rem] w-full object-cover"
            style={{
              objectPosition: `${entry.hero.focalX * 100}% ${entry.hero.focalY * 100}%`,
            }}
          />
          {entry.hero.caption || entry.hero.credit ? (
            <figcaption className="ci-shell py-2 text-xs text-[var(--color-muted)]">
              {entry.hero.caption}
              {entry.hero.credit ? (
                <span className="ml-2 text-[var(--color-faint)]">
                  {entry.hero.creditUrl ? (
                    <a href={entry.hero.creditUrl} rel="noopener nofollow" target="_blank">
                      {entry.hero.credit}
                    </a>
                  ) : (
                    entry.hero.credit
                  )}
                </span>
              ) : null}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      <div className="ci-shell py-10">
        <div className="ci-article-layout">
          <div>
            {/* Marginalia on mobile: the practical answer before the prose. */}
            <div className="mb-8 lg:hidden">
              <FactsRail entry={entry} />
            </div>

            <BlockRenderer body={entry.body} context={context} />

            {entry.sources.length > 0 ? (
              <section className="ci-measure mt-12">
                <h2 id="ci-sources-heading" className="font-sans text-base font-semibold">
                  {t.meta.sources}
                </h2>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {t.meta.sourcesNote}
                </p>
                <ol className="ci-sources mt-3">
                  {entry.sources.map((source) => (
                    <li key={source.id}>
                      <span>
                        {source.url ? (
                          <a href={source.url} rel="noopener nofollow" target="_blank">
                            {source.name}
                          </a>
                        ) : (
                          source.name
                        )}
                        {source.publisher ? (
                          <span className="text-[var(--color-muted)]"> — {source.publisher}</span>
                        ) : null}
                        {source.accessedAt ? (
                          <span className="ml-1 text-xs text-[var(--color-faint)]">
                            <time dateTime={isoDate(source.accessedAt)}>
                              {formatDate(source.accessedAt, locale, "short")}
                            </time>
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {entry.tags.length > 0 ? (
              <nav aria-label={t.meta.tags} className="ci-measure mt-10">
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0 text-xs">
                  {entry.tags.map((tag) => (
                    <li key={tag.id}>
                      <Link
                        href={`${sectionPath("topics", locale)}${tag.slug}/`}
                        className="inline-block rounded-[var(--radius-sm)] border border-[var(--color-rule-strong)] px-2 py-1 no-underline"
                      >
                        {tag.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <div className="ci-measure mt-10">
              <PageFeedback locale={locale} path={entry.href} contentType={entry.type} />
            </div>

            {entry.author?.bio ? (
              <aside className="ci-measure mt-10 border-t border-[var(--color-rule)] pt-6">
                <div className="flex gap-4">
                  {entry.author.avatar ? (
                    <Image
                      src={entry.author.avatar.url}
                      alt={entry.author.avatar.alt || entry.author.name}
                      width={64}
                      height={64}
                      className="size-16 rounded-full object-cover"
                    />
                  ) : null}
                  <div>
                    <p className="font-semibold">
                      <Link href={`${sectionPath("authors", locale)}${entry.author.slug}/`}>
                  {entry.author.name}
                </Link>
                    </p>
                    {entry.author.jobTitle ? (
                      <p className="text-xs text-[var(--color-muted)]">
                        {entry.author.jobTitle}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                      {entry.author.bio}
                    </p>
                  </div>
                </div>
              </aside>
            ) : null}
          </div>

          <aside className="ci-article-aside hidden lg:block">
            <FactsRail entry={entry} />

            {toc.length > 2 ? (
              <nav aria-labelledby="ci-toc" className="mt-6">
                <h2 id="ci-toc" className="ci-label mb-2 font-sans">
                  {t.meta.inThisPage}
                </h2>
                <ol className="m-0 list-none border-l border-[var(--color-rule)] p-0 text-sm">
                  {toc.map((item) => (
                    <li
                      key={item.id}
                      className={item.level === 3 ? "border-l-0 pl-6" : "pl-3"}
                    >
                      <a href={`#${item.id}`} className="block py-1 no-underline">
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}
          </aside>
        </div>

        {entry.related.length > 0 ? (
          <section className="mt-16">
            <div className="ci-section-head">
              <h2>{t.meta.relatedContent}</h2>
            </div>
            <div className="ci-grid">
              {entry.related.slice(0, 4).map((item) => (
                <EntryCard key={item.translationId} entry={item} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}

/**
 * The title block. Only fields we actually hold are rendered — an empty rail is
 * better than a rail full of dashes.
 */
function FactsRail({ entry }: { entry: EntryDetail }) {
  const locale = entry.locale;
  const t = getMessages(locale);
  const facts: { label: string; value: React.ReactNode }[] = [];

  const p = entry.place;
  if (p) {
    if (p.municipality) facts.push({ label: labelFor("municipality", locale), value: p.municipality });
    if (p.comarca) facts.push({ label: labelFor("comarca", locale), value: p.comarca });
    if (p.latitude !== null && p.longitude !== null) {
      facts.push({
        label: labelFor("coordinates", locale),
        value: `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`,
      });
    }
    if (p.officialUrl) {
      facts.push({
        label: labelFor("official", locale),
        value: (
          <a href={p.officialUrl} rel="noopener nofollow" target="_blank">
            {new URL(p.officialUrl).hostname.replace(/^www\./, "")}
          </a>
        ),
      });
    }
  }

  const r = entry.route;
  if (r) {
    if (r.distanceMetres)
      facts.push({ label: labelFor("distance", locale), value: formatDistance(r.distanceMetres, locale) });
    if (r.ascentMetres)
      facts.push({ label: labelFor("ascent", locale), value: `${r.ascentMetres} m` });
    if (r.durationMinutes)
      facts.push({ label: labelFor("duration", locale), value: formatDuration(r.durationMinutes, locale) });
    if (r.difficulty)
      facts.push({ label: labelFor("difficulty", locale), value: `${r.difficulty}/5` });
  }

  const e = entry.event;
  if (e) {
    facts.push({
      label: labelFor("starts", locale),
      value: (
        <time dateTime={isoDate(e.startsAt)}>{formatDate(e.startsAt, locale)}</time>
      ),
    });
    if (e.endsAt)
      facts.push({
        label: labelFor("ends", locale),
        value: <time dateTime={isoDate(e.endsAt)}>{formatDate(e.endsAt, locale)}</time>,
      });
    if (e.venueName) facts.push({ label: labelFor("venue", locale), value: e.venueName });
  }

  if (facts.length === 0 && !entry.lastVerifiedAt) return null;

  return (
    <div className="ci-margin-block">
      {facts.length > 0 ? (
        <dl className="ci-facts">
          {facts.map((fact, i) => (
            <div key={i} className="contents">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {entry.lastVerifiedAt ? (
        <div className={facts.length > 0 ? "mt-4" : undefined}>
          <VerifiedStamp date={entry.lastVerifiedAt} locale={locale} />
        </div>
      ) : null}

      {entry.sources.length > 0 ? (
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          <a href="#ci-sources-heading">{t.meta.sources}</a> ({entry.sources.length})
        </p>
      ) : null}
    </div>
  );
}

type FactKey =
  | "municipality"
  | "comarca"
  | "coordinates"
  | "official"
  | "distance"
  | "ascent"
  | "duration"
  | "difficulty"
  | "starts"
  | "ends"
  | "venue";

const FACT_LABELS: Record<FactKey, Record<Locale, string>> = {
  municipality: { ca: "Municipi", es: "Municipio", en: "Municipality" },
  comarca: { ca: "Comarca", es: "Comarca", en: "Comarca" },
  coordinates: { ca: "Coordenades", es: "Coordenadas", en: "Coordinates" },
  official: { ca: "Font oficial", es: "Fuente oficial", en: "Official source" },
  distance: { ca: "Distància", es: "Distancia", en: "Distance" },
  ascent: { ca: "Desnivell", es: "Desnivel", en: "Ascent" },
  duration: { ca: "Durada", es: "Duración", en: "Duration" },
  difficulty: { ca: "Dificultat", es: "Dificultad", en: "Difficulty" },
  starts: { ca: "Comença", es: "Empieza", en: "Starts" },
  ends: { ca: "Acaba", es: "Termina", en: "Ends" },
  venue: { ca: "Lloc", es: "Lugar", en: "Venue" },
};

function labelFor(key: FactKey, locale: Locale): string {
  return FACT_LABELS[key][locale];
}

function sectionForType(type: EntryDetail["type"]) {
  switch (type) {
    case "news":
      return "news" as const;
    case "destination":
    case "place":
      return "destinations" as const;
    case "event":
      return "events" as const;
    case "route":
      return "routes" as const;
    default:
      return "guides" as const;
  }
}

export { sectionForType };
