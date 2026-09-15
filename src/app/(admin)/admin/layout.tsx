import type { Metadata } from "next";
import Link from "next/link";

import "../../globals.css";
import { fontClassNames } from "@/lib/fonts";
import { getSessionUser } from "@/lib/auth/session";
import { signOut } from "@/lib/admin/actions";
import { isDatabaseConfigured } from "@/lib/db/client";

/**
 * Second root layout, for the backoffice.
 *
 * It is a separate tree from the public site so the admin never shares a
 * bundle, a font payload or a layout with pages that have to stay fast. It is
 * noindex at three levels: this metadata, the `X-Robots-Tag` set by the
 * middleware, and a `Disallow` in robots.txt.
 */
export const metadata: Metadata = {
  title: { default: "CatalunyaInfo CMS", template: "%s · CatalunyaInfo CMS" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const dbReady = isDatabaseConfigured();

  return (
    <html lang="ca" className={fontClassNames}>
      <body>
        {user ? (
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell flex flex-wrap items-center gap-4 py-3">
              <Link href="/admin" className="ci-wordmark text-lg">
                Catalunya<span>Info</span>
              </Link>
              <span className="ci-label">CMS</span>

              <nav aria-label="CMS" className="flex flex-wrap gap-4 text-sm">
                <Link href="/admin/content">Contingut</Link>
                <Link href="/admin/media">Imatges</Link>
                <Link href="/admin/messages">Missatges</Link>
                <Link href="/admin/redirects">Redireccions</Link>
              </nav>

              <div className="ml-auto flex items-center gap-3 text-xs text-[var(--color-muted)]">
                <span>
                  {user.name} · {user.role}
                </span>
                <form action={signOut}>
                  <button type="submit" className="ci-btn ci-btn-quiet">
                    Surt
                  </button>
                </form>
              </div>
            </div>
          </header>
        ) : null}

        {!dbReady ? (
          <div className="ci-shell pt-4">
            <p className="ci-demo-banner">
              DATABASE_URL is not set. Copy .env.example to .env.local and point it at a
              Postgres database, then run <code>npm run db:push</code>.
            </p>
          </div>
        ) : null}

        {children}
      </body>
    </html>
  );
}
