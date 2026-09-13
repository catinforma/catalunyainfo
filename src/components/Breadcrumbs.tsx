import Link from "next/link";

import { getMessages } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

export interface Crumb {
  label: string;
  href: string;
}

/**
 * Rendered in the initial HTML, always. The matching BreadcrumbList JSON-LD is
 * emitted by the page, built from this same array so the two can never drift.
 */
export function Breadcrumbs({ items, locale }: { items: Crumb[]; locale: Locale }) {
  const t = getMessages(locale);
  if (items.length === 0) return null;

  return (
    <nav aria-label={t.common.breadcrumb} className="mb-5 text-xs text-[var(--color-muted)]">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-[var(--color-ink-soft)]">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="text-[var(--color-faint)]">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
