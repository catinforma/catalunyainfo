import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EntryCard } from "@/components/EntryCard";
import { SearchBox } from "@/components/SearchBox";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getHomeData } from "@/lib/content/repository";
import type { EntrySummary } from "@/lib/content/types";
import { getMessages } from "@/lib/i18n";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { type SectionKey, sectionPath } from "@/lib/i18n/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatDate, isoDate } from "@/lib/format";

/**
 * Revalidated every 10 minutes, and on demand whenever an editor publishes.
 * The homepage is the most-hit URL on the site, so it is served from the CDN
 * as static HTML and never blocks on the database.
 */
export const revalidate = 600;

function homeTranslations(): Partial<Record<Locale, string>> {
  return Object.fromEntries(LOCALES.map((l) => [l, `/${l}/`])) as Record<Locale, string>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);

  return buildMetadata({
    locale,
    path: `/${locale}/`,
    title: `CatalunyaInfo — ${t.home.tagline}`,
    description: t.home.intro,
    translations: homeTranslations(),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const data = await getHomeData(locale);

  const sections: { key: SectionKey; items: EntrySummary[] }[] = [
    { key: "destinations", items: data.destinations },
    { key: "guides", items: data.guides },
    { key: "events", items: data.events },
    { key: "routes", items: data.routes },
    { key: "news", items: data.news },
  ];

  const populated = sections.filter((s) => s.items.length > 0);
  const lead = data.featured[0] ?? data.guides[0] ?? data.destinations[0] ?? null;

  return (
    <>
      <SiteHeader locale={locale} translations={homeTranslations()} showSearch={false} />

      <main id="main">
        {/* The hero opens with the question, not with a stock photograph.
            The product's job is to answer something specific, so the search
            field is the largest object on the page. */}
        <section className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
          <div className="ci-shell grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-20">
            <div>
              <h1 className="ci-measure">{t.home.tagline}</h1>
              <p className="ci-measure mt-5 text-lg text-[var(--color-ink-soft)]">
                {t.home.intro}
              </p>
              <div className="mt-8 max-w-xl">
                <SearchBox locale={locale} size="hero" />
              </div>
            </div>

            {/* The lead item sits beside the question rather than above it: it
                is an example of an answer, not the headline of a newspaper. */}
            {lead ? (
              <aside aria-label={t.meta.relatedContent} className="lg:pt-9">
                <EntryCard entry={lead} locale={locale} priority headingLevel={2} />
              </aside>
            ) : null}
          </div>
        </section>

        {populated.map(({ key, items }) => (
          <section key={key} className="ci-shell py-12">
            <div className="ci-section-head">
              <h2>{t.nav[key]}</h2>
              <Link href={sectionPath(key, locale)} className="text-sm">
                {t.common.seeAll}
              </Link>
            </div>

            {key === "events" ? (
              <EventList items={data.events} locale={locale} />
            ) : (
              <div className="ci-grid">
                {items.map((item) => (
                  <EntryCard key={item.translationId} entry={item} locale={locale} />
                ))}
              </div>
            )}
          </section>
        ))}

        {/* No published content yet. Rather than render five empty section
            shells, the page states what it covers and where to go. Nothing is
            fabricated to fill space. */}
        {populated.length === 0 ? (
          <section className="ci-shell py-12">
            <div className="ci-section-head">
              <h2>{t.common.home}</h2>
            </div>
            <ul className="ci-grid list-none p-0">
              {(["destinations", "guides", "events", "routes", "news"] as SectionKey[]).map(
                (key) => (
                  <li key={key}>
                    <h3 className="ci-card-title">
                      <Link href={sectionPath(key, locale)}>{t.nav[key]}</Link>
                    </h3>
                  </li>
                ),
              )}
            </ul>
          </section>
        ) : null}
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}

function EventList({
  items,
  locale,
}: {
  items: (EntrySummary & { startsAt: Date })[];
  locale: Locale;
}) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map((item) => (
        <li
          key={item.translationId}
          className="grid gap-1 border-b border-[var(--color-rule)] py-3 sm:grid-cols-[9rem_1fr] sm:gap-4"
        >
          <time
            dateTime={isoDate(item.startsAt)}
            className="ci-numeric text-sm text-[var(--color-contour)]"
          >
            {formatDate(item.startsAt, locale, "short")}
          </time>
          <div>
            <h3 className="ci-card-title text-base">
              <Link href={item.href}>{item.title}</Link>
            </h3>
            {item.excerpt ? (
              <p className="mt-1 text-sm text-[var(--color-muted)]">{item.excerpt}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
