import type { Metadata } from "next";

import "./globals.css";
import { fontClassNames } from "@/lib/fonts";
import { DEFAULT_LOCALE, HTML_LANG } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n";

/**
 * Rendered for URLs that match no route group at all, so it has to bring its
 * own `<html>`. Always noindex.
 */
export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  const t = getMessages(DEFAULT_LOCALE);

  return (
    <html lang={HTML_LANG[DEFAULT_LOCALE]} className={fontClassNames}>
      <body>
        <main className="ci-shell-narrow py-24 text-center">
          <p className="ci-label">404</p>
          <h1 className="mt-2">{t.notFound.title}</h1>
          <p className="mx-auto mt-4 max-w-prose text-[var(--color-muted)]">
            {t.notFound.body}
          </p>
          <p className="mt-8">
            <a href={`/${DEFAULT_LOCALE}/`} className="ci-btn ci-btn-primary">
              {t.common.backToHome}
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
