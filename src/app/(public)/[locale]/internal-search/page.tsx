import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/EmptyState";
import { EntryCard } from "@/components/EntryCard";
import { SearchBox } from "@/components/SearchBox";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { searchEntries } from "@/lib/content/repository";
import { getMessages, interpolate } from "@/lib/i18n";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import { sectionPath } from "@/lib/i18n/routes";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * Internal search results.
 *
 * Served at the localised URL (`/ca/cerca/`, `/es/buscar/`, `/en/search/`) via
 * a rewrite. Always `noindex`: search result pages are the classic source of
 * thin, near-duplicate URLs, and Google asks publishers not to let them into
 * the index.
 */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
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
    path: sectionPath("search", locale),
    title: t.common.search,
    noindex: true,
  });
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { q } = await searchParams;
  const query = (q ?? "").trim().slice(0, 120);
  const t = getMessages(locale);

  const results = query.length >= 2 ? await searchEntries(locale, query) : [];

  const translations = Object.fromEntries(
    LOCALES.map((l) => [l, sectionPath("search", l)]),
  ) as Partial<Record<Locale, string>>;

  return (
    <>
      <SiteHeader
        locale={locale}
        translations={translations}
        activeSection="search"
        showSearch={false}
      />

      <main id="main" className="ci-shell py-10">
        <h1>{t.common.search}</h1>

        <div className="mt-6 max-w-xl">
          <SearchBox locale={locale} size="hero" defaultValue={query} autoFocus={!query} />
        </div>

        {query.length >= 2 ? (
          <section className="mt-10">
            <p className="ci-label mb-6" aria-live="polite">
              {results.length} — {query}
            </p>

            {results.length > 0 ? (
              <div className="ci-grid">
                {results.map((entry) => (
                  <EntryCard key={entry.translationId} entry={entry} locale={locale} />
                ))}
              </div>
            ) : (
              <EmptyState
                locale={locale}
                title={interpolate(t.empty.searchNoResults, { query })}
                body={t.empty.searchTry}
              />
            )}
          </section>
        ) : null}
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
