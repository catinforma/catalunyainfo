import Image from "next/image";
import Link from "next/link";

import { getMessages, interpolate } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { formatDate, isoDate } from "@/lib/format";
import type { EntrySummary } from "@/lib/content/types";

/**
 * The list unit.
 *
 * Deliberately not a boxed card with a shadow: it is an image, a title and the
 * two facts that decide whether the page is worth opening — what kind of thing
 * it is, and when it was last touched.
 *
 * `priority` should be set on the first card above the fold only; everything
 * else lazy-loads so the LCP image is not competing for bandwidth.
 */
export function EntryCard({
  entry,
  locale,
  priority = false,
  headingLevel = 3,
  showImage = true,
}: {
  entry: EntrySummary;
  locale: Locale;
  priority?: boolean;
  headingLevel?: 2 | 3 | 4;
  showImage?: boolean;
}) {
  const t = getMessages(locale);
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const date = entry.publishedAt ?? entry.updatedAt;

  return (
    <article className="ci-card relative">
      {showImage && entry.hero ? (
        <div className="ci-card-media">
          <Image
            src={entry.hero.url}
            alt={entry.hero.alt}
            width={entry.hero.width ?? 1200}
            height={entry.hero.height ?? 800}
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 92vw"
            placeholder={entry.hero.blurDataUrl ? "blur" : "empty"}
            blurDataURL={entry.hero.blurDataUrl ?? undefined}
            priority={priority}
            style={{ objectPosition: `${entry.hero.focalX * 100}% ${entry.hero.focalY * 100}%` }}
          />
        </div>
      ) : null}

      <Heading className="ci-card-title">
        <Link href={entry.href} className="ci-card-link">
          {entry.title}
        </Link>
      </Heading>

      {entry.excerpt ? (
        <p className="text-sm text-[var(--color-muted)]">{entry.excerpt}</p>
      ) : null}

      <p className="ci-card-meta">
        {entry.category ? <span>{entry.category.name}</span> : null}
        <time dateTime={isoDate(date)}>{formatDate(date, locale, "short")}</time>
        <span>{interpolate(t.meta.readingTime, { minutes: entry.readingMinutes })}</span>
      </p>

      {/* Visual affordance only. The whole card is already one link via
          `.ci-card-link::after`, so this is a span rather than a second anchor:
          two links to the same place would be a duplicate stop for anyone using
          a screen reader or the keyboard. */}
      <span className="ci-card-more" aria-hidden="true">
        {t.common.readMore}
      </span>
    </article>
  );
}
