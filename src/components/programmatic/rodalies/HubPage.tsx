import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";
import { hubCopy } from "@/lib/programmatic/rodalies/copy";
import { SNAPSHOT } from "@/lib/programmatic/rodalies/data";
import { officialUrl } from "@/lib/programmatic/rodalies/official";
import { hubPath, hubTranslations } from "@/lib/programmatic/rodalies/paths";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";

import { lineHrefs, lineNames } from "./LinePage";
import { Compensation, LinkList, Paragraphs, Sources } from "./parts";
import { RodaliesLive } from "./RodaliesLive";

export function hubCrumbs(locale: Locale): Crumb[] {
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: "Rodalies", href: hubPath(locale) },
  ];
}

/** The family's index: live notices on every line, the lines, and where each goes. */
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
            <h2 id="avisos">{t.liveTitle}</h2>
            <RodaliesLive
              locale={locale}
              intlLocale={INTL_LOCALE[locale]}
              line={null}
              lineNames={lineNames()}
              lineHrefs={lineHrefs(locale)}
              statusUrl={officialUrl.status(locale)}
            />

            {t.visitorTitle ? (
              <>
                <h2 id="visitors">{t.visitorTitle}</h2>
                <Paragraphs items={t.visitor} />
              </>
            ) : null}

            <h2 id="linies">{t.linesTitle}</h2>
            <p className="text-sm text-[var(--color-muted)]">{t.linesNote}</p>
            {t.groups.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <h3>{group.label}</h3>
                <ul>
                  {group.lines.map((line) => (
                    <li key={line.id}>
                      {line.href ? <Link href={line.href}>{line.name}</Link> : <strong>{line.name}</strong>}: {line.journey}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <h2 id="estacions">{t.stationsTitle}</h2>
            <p className="text-sm text-[var(--color-muted)]">{t.stationsNote}</p>
            <div className="ci-table-scroll mt-4">
              <table className="ci-local-table">
                <thead>
                  <tr>
                    <th scope="col">{t.stationHeaders[0]}</th>
                    <th scope="col">{t.stationHeaders[1]}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.stations.map((station) => (
                    <tr key={station.name}>
                      <td>{station.name}</td>
                      <td>{station.lines}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="incidencies">{t.disruptionTitle}</h2>
            <Paragraphs items={t.disruption} />

            <Compensation copy={t.compensation} id="reclamar" />

            <LinkList title={t.relatedTitle} id="ci-rodalies-related" links={t.related} />

            <Sources title={t.sourcesTitle} note={t.sourcesNote} items={t.sources} />
          </div>
        </div>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
