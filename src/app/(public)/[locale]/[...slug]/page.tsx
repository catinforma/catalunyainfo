import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { EmptyState } from "@/components/EmptyState";
import { EntryCard } from "@/components/EntryCard";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { EntryArticle } from "@/components/pages/EntryArticle";
import {
  allIndexablePaths,
  findRedirect,
  getAuthorBySlug,
  getMediaByIds,
  hrefFor,
  listAuthors,
  listBySection,
  mediaIdsInBody,
  relatedIdsInBody,
  resolvePath,
  summariesByEntryIds,
} from "@/lib/content/repository";
import type { EntryDetail, MediaView, SourceView } from "@/lib/content/types";
import { getMessages } from "@/lib/i18n";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";
import {
  SECTION_KEYS,
  type SectionKey,
  legalFromSegment,
  sectionFromSegment,
  sectionPath,
} from "@/lib/i18n/routes";
import {
  articleSchema,
  breadcrumbSchema,
  eventSchema,
  faqSchema,
  graph,
  howToSchema,
  placeSchema,
} from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { isProduction } from "@/lib/site";

/**
 * The single public resolver.
 *
 * Every URL under `/{locale}/` that is not the home page or internal search
 * lands here and is dispatched in a fixed order:
 *
 *   1. a section hub          `/ca/destinacions/`
 *   2. the author index       `/ca/autors/`
 *   3. an author profile      `/ca/autors/nom-cognom/`
 *   4. the topic index        `/ca/temes/`
 *   5. a content page         anything matching `entry_translations.path`
 *   6. an editor-managed redirect
 *   7. a real 404
 *
 * Keeping resolution in one place is what makes fully localised slugs possible
 * (`/ca/montserrat/com-arribar-hi/` and `/en/montserrat/how-to-get-there/` are
 * the same entry) without a folder per URL shape.
 */

/** Content is regenerated at most every 5 minutes, and on demand on publish. */
export const revalidate = 300;
export const dynamicParams = true;

const SECTIONS_WITH_HUBS: SectionKey[] = [
  "news",
  "guides",
  "destinations",
  "events",
  "routes",
];

export async function generateStaticParams() {
  // Hubs and the author index always exist, so they are prerendered for every
  // locale even on a build with no database attached.
  const systemParams = LOCALES.flatMap((locale) => [
    ...SECTIONS_WITH_HUBS.map((key) => ({
      locale,
      slug: sectionPath(key, locale).split("/").filter(Boolean).slice(1),
    })),
    { locale, slug: sectionPath("authors", locale).split("/").filter(Boolean).slice(1) },
    { locale, slug: sectionPath("topics", locale).split("/").filter(Boolean).slice(1) },
  ]);

  const contentParams = (await allIndexablePaths()).map((row) => ({
    locale: row.locale,
    slug: row.path.split("/").filter(Boolean),
  }));

  return [...systemParams, ...contentParams];
}

type Resolution =
  | { kind: "hub"; section: SectionKey }
  | { kind: "authors" }
  | { kind: "author"; slug: string }
  | { kind: "topics" }
  | { kind: "entry"; entry: EntryDetail }
  | { kind: "none" };

async function resolve(locale: Locale, slug: string[]): Promise<Resolution> {
  const [first, second, ...rest] = slug;
  const section = sectionFromSegment(locale, first);

  if (section && slug.length === 1) {
    if (SECTIONS_WITH_HUBS.includes(section)) return { kind: "hub", section };
    if (section === "authors") return { kind: "authors" };
    if (section === "topics") return { kind: "topics" };
  }

  if (section === "authors" && second && rest.length === 0) {
    return { kind: "author", slug: second };
  }

  // `legal` is not special-cased: every legal page is a `page` entry whose
  // path is the localised legal path, so it resolves through the database like
  // any other content and can be edited in the CMS.
  const path = slug.join("/");
  const entry = await resolvePath(locale, path);
  if (entry && !(entry.isDemo && isProduction())) return { kind: "entry", entry };

  return { kind: "none" };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale);
  const resolution = await resolve(locale, slug);

  switch (resolution.kind) {
    case "hub": {
      const key = resolution.section;
      return buildMetadata({
        locale,
        path: sectionPath(key, locale),
        title: t.nav[key],
        translations: Object.fromEntries(
          LOCALES.map((l) => [l, sectionPath(key, l)]),
        ) as Partial<Record<Locale, string>>,
      });
    }

    case "authors":
      return buildMetadata({
        locale,
        path: sectionPath("authors", locale),
        title: t.nav.authors,
        translations: Object.fromEntries(
          LOCALES.map((l) => [l, sectionPath("authors", l)]),
        ) as Partial<Record<Locale, string>>,
      });

    case "topics":
      return buildMetadata({
        locale,
        path: sectionPath("topics", locale),
        title: t.nav.topics,
        translations: Object.fromEntries(
          LOCALES.map((l) => [l, sectionPath("topics", l)]),
        ) as Partial<Record<Locale, string>>,
      });

    case "author": {
      const found = await getAuthorBySlug(locale, resolution.slug);
      if (!found) return { robots: { index: false, follow: false } };
      return buildMetadata({
        locale,
        path: `${sectionPath("authors", locale)}${found.author.slug}/`,
        title: found.author.name,
        description: found.author.bio,
        image: found.author.avatar
          ? { url: found.author.avatar.url, alt: found.author.name }
          : null,
      });
    }

    case "entry": {
      const entry = resolution.entry;
      const image = entry.og ?? entry.hero;
      return buildMetadata({
        locale,
        path: entry.href,
        title: entry.seoTitle ?? entry.title,
        description: entry.seoDescription ?? entry.excerpt,
        translations: entry.translations,
        canonicalOverride: entry.canonicalUrl,
        // Demo fixtures and drafts are never indexable, wherever they render.
        noindex: entry.noindex || entry.isDemo || entry.status !== "published",
        type: entry.type === "news" || entry.type === "article" ? "article" : "website",
        publishedTime: entry.publishedAt,
        modifiedTime: entry.updatedAt,
        authors: entry.author ? [entry.author.name] : undefined,
        image: image
          ? {
              url: image.url,
              width: image.width,
              height: image.height,
              alt: image.alt || entry.title,
            }
          : null,
      });
    }

    default:
      return { robots: { index: false, follow: false } };
  }
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale);
  const resolution = await resolve(locale, slug);

  if (resolution.kind === "none") {
    // Nothing matched. Before answering 404, check the editor-managed redirect
    // table: a slug that changed after publication must not break its links.
    const match = await findRedirect(`/${locale}/${slug.join("/")}/`);
    if (match?.kind === "permanent" && match.toPath) permanentRedirect(match.toPath);
    if (match?.kind === "temporary" && match.toPath) redirect(match.toPath);
    notFound();
  }

  const header = (
    <SiteHeader
      locale={locale}
      translations={translationsFor(resolution, locale)}
      activeSection={activeSection(resolution, locale)}
    />
  );

  if (resolution.kind === "hub") {
    const key = resolution.section;
    const items = await listBySection(locale, key, { limit: 24 });
    const crumbs: Crumb[] = [
      { label: t.common.home, href: `/${locale}/` },
      { label: t.nav[key], href: sectionPath(key, locale) },
    ];

    return (
      <>
        {header}
        <main id="main" className="ci-shell py-10">
          <Breadcrumbs items={crumbs} locale={locale} />
          <h1>{t.nav[key]}</h1>

          <div className="mt-8">
            {items.length > 0 ? (
              <div className="ci-grid">
                {items.map((item, index) => (
                  <EntryCard
                    key={item.translationId}
                    entry={item}
                    locale={locale}
                    priority={index === 0}
                    headingLevel={2}
                  />
                ))}
              </div>
            ) : (
              <EmptyState locale={locale} />
            )}
          </div>
        </main>
        <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
        <SiteFooter locale={locale} />
      </>
    );
  }

  if (resolution.kind === "authors") {
    const authors = await listAuthors(locale);
    const crumbs: Crumb[] = [
      { label: t.common.home, href: `/${locale}/` },
      { label: t.nav.authors, href: sectionPath("authors", locale) },
    ];

    return (
      <>
        {header}
        <main id="main" className="ci-shell py-10">
          <Breadcrumbs items={crumbs} locale={locale} />
          <h1>{t.nav.authors}</h1>

          {authors.length > 0 ? (
            <ul className="ci-grid mt-8 list-none p-0">
              {authors.map((author) => (
                <li key={author.id}>
                  <h2 className="ci-card-title">
                    <Link href={`${sectionPath("authors", locale)}${author.slug}/`}>
                      {author.name}
                    </Link>
                  </h2>
                  {author.jobTitle ? (
                    <p className="text-sm text-[var(--color-muted)]">{author.jobTitle}</p>
                  ) : null}
                  {author.bio ? <p className="mt-2 text-sm">{author.bio}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8">
              <EmptyState locale={locale} />
            </div>
          )}
        </main>
        <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
        <SiteFooter locale={locale} />
      </>
    );
  }

  if (resolution.kind === "topics") {
    const crumbs: Crumb[] = [
      { label: t.common.home, href: `/${locale}/` },
      { label: t.nav.topics, href: sectionPath("topics", locale) },
    ];
    return (
      <>
        {header}
        <main id="main" className="ci-shell py-10">
          <Breadcrumbs items={crumbs} locale={locale} />
          <h1>{t.nav.topics}</h1>
          <div className="mt-8">
            <EmptyState locale={locale} />
          </div>
        </main>
        <SiteFooter locale={locale} />
      </>
    );
  }

  if (resolution.kind === "author") {
    const found = await getAuthorBySlug(locale, resolution.slug);
    if (!found) notFound();
    const crumbs: Crumb[] = [
      { label: t.common.home, href: `/${locale}/` },
      { label: t.nav.authors, href: sectionPath("authors", locale) },
      {
        label: found.author.name,
        href: `${sectionPath("authors", locale)}${found.author.slug}/`,
      },
    ];

    return (
      <>
        {header}
        <main id="main" className="ci-shell py-10">
          <Breadcrumbs items={crumbs} locale={locale} />
          <h1>{found.author.name}</h1>
          {found.author.jobTitle ? (
            <p className="ci-label mt-2">{found.author.jobTitle}</p>
          ) : null}
          {found.author.bio ? (
            <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">
              {found.author.bio}
            </p>
          ) : null}
          {found.author.expertise ? (
            <p className="ci-measure mt-3 text-sm text-[var(--color-muted)]">
              {found.author.expertise}
            </p>
          ) : null}

          {found.entries.length > 0 ? (
            <div className="ci-grid mt-10">
              {found.entries.map((item) => (
                <EntryCard
                  key={item.translationId}
                  entry={item}
                  locale={locale}
                  headingLevel={2}
                />
              ))}
            </div>
          ) : null}
        </main>
        <JsonLd
          json={graph([
            breadcrumbSchema(crumbs),
            {
              "@type": "Person",
              name: found.author.name,
              ...(found.author.jobTitle ? { jobTitle: found.author.jobTitle } : {}),
              ...(found.author.bio ? { description: found.author.bio } : {}),
              ...(Object.values(found.author.links).length > 0
                ? { sameAs: Object.values(found.author.links) }
                : {}),
            },
          ])}
        />
        <SiteFooter locale={locale} />
      </>
    );
  }

  // ---- A content page -------------------------------------------------------
  const entry = resolution.entry;

  const [mediaMap, relatedMap] = await Promise.all([
    getMediaByIds(mediaIdsInBody(entry.body), locale),
    summariesByEntryIds(locale, relatedIdsInBody(entry.body)).then(
      (items) => new Map(items.map((i) => [i.entryId, i])),
    ),
  ]);

  const sourceMap = new Map<string, SourceView>(entry.sources.map((s) => [s.id, s]));
  const heroAndOg: [string, MediaView][] = [];
  if (entry.hero) heroAndOg.push([entry.hero.id, entry.hero]);
  for (const [id, value] of heroAndOg) mediaMap.set(id, value);

  const crumbs: Crumb[] = [
    { label: t.common.home, href: `/${locale}/` },
    ...entry.breadcrumbs,
    { label: entry.title, href: entry.href },
  ];

  const structured = graph([
    breadcrumbSchema(crumbs),
    entry.type === "event" ? eventSchema(entry) : null,
    entry.type === "destination" || entry.type === "place" ? placeSchema(entry) : null,
    entry.type === "page" ? null : articleSchema(entry),
    faqSchema(entry.body),
    howToSchema(entry),
  ]);

  return (
    <>
      {header}
      <main id="main">
        {entry.isDemo ? (
          <div className="ci-shell pt-4">
            <p className="ci-demo-banner">
              Demo fixture. Not real content, never served in production.
            </p>
          </div>
        ) : null}

        <EntryArticle
          entry={entry}
          crumbs={crumbs}
          context={{ locale, media: mediaMap, related: relatedMap, sources: sourceMap }}
        />
      </main>
      <JsonLd json={structured} />
      <SiteFooter locale={locale} />
    </>
  );
}

function translationsFor(
  resolution: Resolution,
  locale: Locale,
): Partial<Record<Locale, string>> {
  switch (resolution.kind) {
    case "entry":
      return resolution.entry.translations;
    case "hub":
      return Object.fromEntries(
        LOCALES.map((l) => [l, sectionPath(resolution.section, l)]),
      ) as Partial<Record<Locale, string>>;
    case "authors":
    case "author":
      return Object.fromEntries(
        LOCALES.map((l) => [l, sectionPath("authors", l)]),
      ) as Partial<Record<Locale, string>>;
    case "topics":
      return Object.fromEntries(
        LOCALES.map((l) => [l, sectionPath("topics", l)]),
      ) as Partial<Record<Locale, string>>;
    default:
      return { [locale]: `/${locale}/` };
  }
}

function activeSection(resolution: Resolution, locale: Locale): SectionKey | null {
  if (resolution.kind === "hub") return resolution.section;
  if (resolution.kind === "authors" || resolution.kind === "author") return "authors";
  if (resolution.kind === "topics") return "topics";
  if (resolution.kind === "entry") {
    const first = resolution.entry.path.split("/")[0];
    const section = sectionFromSegment(locale, first);
    if (section && SECTION_KEYS.includes(section)) return section;
    if (legalFromSegment(locale, resolution.entry.path.split("/")[1])) return "legal";
  }
  return null;
}

export { hrefFor };
