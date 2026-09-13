import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * Shown only where an empty section is genuinely informative — a search with no
 * hits, or a hub the reader navigated to directly.
 *
 * Section shells are NOT rendered with this on the homepage: a section with no
 * content simply does not appear there, so the page never reads as a stack of
 * unfinished placeholders.
 */
export function EmptyState({
  locale,
  title,
  body,
}: {
  locale: Locale;
  title?: string;
  body?: string;
}) {
  const t = getMessages(locale);
  return (
    <div className="ci-empty">
      <p className="font-sans text-base text-[var(--color-ink)]">
        {title ?? t.empty.sectionTitle}
      </p>
      <p className="mx-auto mt-2 max-w-prose text-sm">{body ?? t.empty.sectionBody}</p>
    </div>
  );
}
