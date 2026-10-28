import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LinkList, Paragraphs, Sources } from "@/components/programmatic/rodalies/parts";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { renderInline } from "@/lib/content/inline";
import { getMessages } from "@/lib/i18n";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";
import { METEOCAT_MAP_URL, hubCopy } from "@/lib/programmatic/mountain/copy";
import { SNAPSHOT } from "@/lib/programmatic/mountain/data";
import { HUB_CRUMB } from "@/lib/programmatic/mountain/pages";
import { hubPath, hubTranslations } from "@/lib/programmatic/mountain/paths";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";

import { MountainLive } from "./MountainLive";

export function hubCrumbs(locale: Locale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: HUB_CRUMB[locale], href: hubPath(locale) },
  ];
}

/** The family's index: every station's latest validated readings, every place, and the places below the threshold. */
export function HubPage({ locale }: { locale: Locale }) {
  const t = hubCopy(locale);
  const crumbs = hubCrumbs(locale);

  return (
    <>
      <SiteHeader locale={locale} translations={hubTranslations()} activeSection={null} />
      <main id="main">
        <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
          <div className="ci-shell py-5 md:py-8 lg:py-12">
            <Breadcrumbs items={crumbs} locale={locale} />
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
          <div className="ci-prose">
            <h2 id="lectures">{t.liveTitle}</h2>
            <p className="text-sm text-[var(--color-muted)]">{t.liveNote}</p>
            <MountainLive
              locale={locale}
              intlLocale={INTL_LOCALE[locale]}
              mode="hub"
              stations={t.liveStations}
              meteocatUrl={METEOCAT_MAP_URL}
              forecastUrl={null}
            />

            {t.groups.map((group, i) =>
              group.entries.length > 0 ? (
                <section key={group.title} aria-labelledby={`ci-mountain-group-${i}`}>
                  <h2 id={`ci-mountain-group-${i}`}>{group.title}</h2>
                  <ul>
                    {group.entries.map((entry) => (
                      <li key={entry.name}>
                        {entry.href ? <Link href={entry.href}>{entry.name}</Link> : <strong>{entry.name}</strong>}: {entry.text}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null,
            )}

            {t.below.length > 0 ? (
              <section aria-labelledby="ci-mountain-below">
                <h2 id="ci-mountain-below">{t.belowTitle}</h2>
                <p>{t.belowNote}</p>
                <ul>
                  {t.below.map((entry) => (
                    <li key={entry.name}>
                      <strong>{entry.name}</strong>: {renderInline(entry.text)}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <h2 id="llegir">{t.howTitle}</h2>
            <Paragraphs items={t.how} />

            <h2 id="oficial">{t.officialTitle}</h2>
            <Paragraphs items={t.official} />

            <LinkList title={t.relatedTitle} id="ci-mountain-related" links={t.related} />

            <Sources title={t.sourcesTitle} note={t.sourcesNote} items={t.sources} />
          </div>
        </div>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
