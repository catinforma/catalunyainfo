import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";
import { sourcesPolicyLink } from "@/lib/content/sources-policy-link";

/** Placed right after a `.ci-sources` list: the method behind the sources. */
export function SourcesPolicyLink({ locale, className = "mt-2" }: { locale: Locale; className?: string }) {
  const { href, label } = sourcesPolicyLink(locale);
  return (
    <p className={`${className} text-xs text-[var(--color-muted)]`}>
      <Link prefetch={false} href={href}>
        {label}
      </Link>
    </p>
  );
}
