import Link from "next/link";

import { getMessages } from "@/lib/i18n";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

/**
 * A real 404: the status code is 404, the page is noindex via the middleware
 * header, and it offers a way forward instead of a dead end.
 *
 * Next renders this without the locale param, so it falls back to the default
 * language rather than guessing.
 */
export default function LocaleNotFound() {
  const locale = DEFAULT_LOCALE;
  const t = getMessages(locale);

  return (
    <main id="main" className="ci-shell-narrow py-24 text-center">
      <p className="ci-label">404</p>
      <h1 className="mt-2">{t.notFound.title}</h1>
      <p className="mx-auto mt-4 max-w-prose text-[var(--color-muted)]">{t.notFound.body}</p>
      <p className="mt-8">
        <Link href={`/${locale}/`} className="ci-btn ci-btn-primary">
          {t.common.backToHome}
        </Link>
      </p>
    </main>
  );
}
