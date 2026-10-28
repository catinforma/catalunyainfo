import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { Faq, LinkList, Paragraphs, Sources } from "@/components/programmatic/rodalies/parts";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { Block } from "@/lib/content/blocks";
import { getMessages } from "@/lib/i18n";
import { INTL_LOCALE } from "@/lib/i18n/config";
import { placeCopy } from "@/lib/programmatic/mountain/copy";
import { SNAPSHOT, type Place } from "@/lib/programmatic/mountain/data";
import { HUB_CRUMB } from "@/lib/programmatic/mountain/pages";
import { hubPath, placePath, placeTranslations, type PlaceLocale } from "@/lib/programmatic/mountain/paths";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/seo/jsonld";

import { MountainLive } from "./MountainLive";

export function placeCrumbs(place: Place, locale: PlaceLocale): Crumb[] {
  const name = place.name[locale];
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: HUB_CRUMB[locale], href: hubPath(locale) },
    { label: name.charAt(0).toUpperCase() + name.slice(1), href: placePath(locale, place.slug) },
  ];
}

/**
 * One place's page. Everything in the server HTML comes from the committed
 * snapshot and the verified official links: no database, no fetch, no clock,
 * no reading. The readings are the browser's (MountainLive).
 */
export function PlacePage({ place, locale }: { place: Place; locale: PlaceLocale }) {
  const t = placeCopy(place, locale);
  const crumbs = placeCrumbs(place, locale);
  const faqBlock = { type: "faq", items: t.faq } as Block;
  const toc = [
    { id: "lectures", label: t.liveTitle },
    { id: "estacio", label: t.stationTitle },
    { id: "previsio", label: t.forecastTitle },
    ...(t.slopesTitle ? [{ id: "pistes", label: t.slopesTitle }] : []),
    { id: "seguretat", label: t.safetyTitle },
  ];

  return (
    <>
      <SiteHeader locale={locale} translations={placeTranslations(place.slug)} activeSection={null} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <p className="ci-label mb-3 max-md:hidden">{t.kicker}</p>
              <h1 className="ci-measure">{t.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{t.lead}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
                <span className="ci-verified">
                  <span className="ci-verified-dot" aria-hidden="true" />
                  <time dateTime={SNAPSHOT.readOn}>{t.readLine}</time>
                </span>
              </div>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-article-layout">
              <div className="ci-prose">
                <h2 id="lectures">{t.liveTitle}</h2>
                <MountainLive
                  locale={locale}
                  intlLocale={INTL_LOCALE[locale]}
                  mode="place"
                  stations={t.liveStations}
                  meteocatUrl={t.meteocatUrl}
                  forecastUrl={t.forecastUrl}
                />

                <section className="ci-margin-block" aria-label={crumbs[2]!.label}>
                  <dl className="ci-facts">
                    {t.facts.map((fact, i) => (
                      <div key={`${fact.label}-${i}`} className="contents">
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <h2 id="estacio">{t.stationTitle}</h2>
                <Paragraphs items={t.station} />

                <h2 id="previsio">{t.forecastTitle}</h2>
                <Paragraphs items={t.forecast} />

                {t.slopesTitle ? (
                  <>
                    <h2 id="pistes">{t.slopesTitle}</h2>
                    <Paragraphs items={t.slopes} />
                  </>
                ) : null}

                <h2 id="seguretat">{t.safetyTitle}</h2>
                <Paragraphs items={t.safety} />

                <Faq title={t.faqTitle} items={t.faq} />

                <nav aria-labelledby="ci-mountain-siblings">
                  <h2 id="ci-mountain-siblings">{t.siblingsTitle}</h2>
                  <ul>
                    {t.siblings.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href}>{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3">
                    <Link href={t.hubLink.href}>{t.hubLink.label}</Link>
                  </p>
                </nav>

                <LinkList title={t.relatedTitle} id="ci-mountain-related" links={t.related} />

                <Sources title={t.sourcesTitle} note={t.sourcesNote} items={t.sources} />
              </div>

              <div className="ci-article-aside hidden lg:block">
                <nav aria-labelledby="ci-toc">
                  <h2 id="ci-toc" className="ci-label mb-2 font-sans">
                    {getMessages(locale).meta.inThisPage}
                  </h2>
                  <ol className="m-0 list-none border-l border-[var(--color-rule)] p-0 text-sm">
                    {toc.map((item) => (
                      <li key={item.id} className="pl-3">
                        <a href={`#${item.id}`} className="block py-1 no-underline">
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), faqSchema([faqBlock])])} />
      <SiteFooter locale={locale} />
    </>
  );
}
