import Link from "next/link";
import { locale as localeParam } from "next/root-params";

import { SearchBox } from "@/components/SearchBox";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { notFoundLinks, notFoundLocale } from "@/lib/i18n/not-found";

/**
 * A real 404: the status code is 404, Next adds `noindex` to any 404 response,
 * and the page offers a way forward instead of a dead end.
 *
 * Next renders this without props. The language comes from the `[locale]`
 * root param (next/root-params, stable since Next 16.3: read on the server, no
 * header read, so the routes that call notFound() stay static), so /es/... is
 * answered in Spanish and /en/... in English. Until 27 Nov 2026 the page was
 * always in Catalan and had no header or footer (design pass round 2).
 *
 * The header's language links point at each edition's home page (there is no
 * translation of a page that does not exist). Search is a plain GET form, and
 * the links are the hubs of the header menu (lib/i18n/not-found.ts); none of
 * them prefetches, like the footer, so a 404 costs no extra RSC requests.
 */
export default async function LocaleNotFound() {
  // Not wrapped in try/catch: during prerendering Next may signal through a
  // thrown error, which must reach it. A missing value falls back to "ca".
  const locale = notFoundLocale(await localeParam());
  const t = getMessages(locale);
  const links = notFoundLinks(locale);

  return (
    <>
      <SiteHeader locale={locale} translations={{}} />

      <main id="main" className="ci-shell-narrow py-12 sm:py-16">
        <p className="ci-label">404</p>
        <h1 className="mt-2">{t.notFound.title}</h1>
        <p className="mt-4 max-w-prose text-[var(--color-muted)]">{t.notFound.body}</p>

        <div className="mt-8 max-w-xl">
          <SearchBox locale={locale} size="hero" />
        </div>

        <section className="mt-10" aria-labelledby="ci-404-links">
          <h2 id="ci-404-links" className="ci-label mb-2">
            {t.notFound.linksTitle}
          </h2>
          <ul className="grid list-none gap-x-6 p-0 sm:grid-cols-2">
            {links.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className="inline-flex min-h-11 items-center font-semibold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
