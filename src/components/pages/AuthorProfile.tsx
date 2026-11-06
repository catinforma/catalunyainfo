import { BlockRenderer, type BlockContext } from "@/components/blocks/BlockRenderer";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { EntryCard } from "@/components/EntryCard";
import { SITE_AUTHOR_LATEST_HEADING, SITE_AUTHOR_ROLE, siteAuthorBlocks } from "@/lib/content/author";
import { OWNER } from "@/lib/content/pages/institutional";
import type { EntrySummary } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/config";

/**
 * The founder's author page (`/ca/autors/marti-aguilera/`), where every byline
 * links. Its text is the about page's, word for word (siteAuthorBlocks): who
 * he is and his profiles, what the site publishes, the editorial method with
 * the policy and sources links, the AI disclosure and how to report an error.
 * Between them, the pieces he signs, most recently updated first.
 */
export function AuthorProfile({
  locale,
  crumbs,
  latest,
}: {
  locale: Locale;
  crumbs: Crumb[];
  latest: EntrySummary[];
}) {
  const blocks = siteAuthorBlocks(locale);
  const context: BlockContext = { locale, media: new Map(), related: new Map(), sources: new Map() };

  return (
    <main id="main" className="ci-shell py-10">
      <Breadcrumbs items={crumbs} locale={locale} />
      <h1>{OWNER.name}</h1>
      <p className="ci-label mt-2">{SITE_AUTHOR_ROLE[locale]}</p>

      <div className="ci-measure mt-6">
        <BlockRenderer body={blocks.intro} context={context} />
      </div>

      {latest.length > 0 ? (
        <section className="mt-12" aria-labelledby="author-latest-heading">
          <h2 id="author-latest-heading">{SITE_AUTHOR_LATEST_HEADING[locale]}</h2>
          <div className="ci-grid mt-6">
            {latest.map((item) => (
              <EntryCard key={item.translationId} entry={item} locale={locale} headingLevel={3} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="ci-measure mt-12">
        <BlockRenderer body={blocks.method} context={context} />
      </div>
    </main>
  );
}
