import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { renderInline } from "@/lib/content/inline";
import { getMessages } from "@/lib/i18n";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";
import { HUB_VISIBLE, hubCopy } from "@/lib/programmatic/elections/hub";
import {
  byComarca,
  comarcaAnchor,
  comarcaPath,
  electionPath,
  hubMeta,
  hubPath,
  hubTranslations,
  isComarcaLocale,
  latestDataDate,
  placeName,
} from "@/lib/programmatic/elections/pages";
import { electionHubDataset } from "@/lib/programmatic/elections/structured";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";

/**
 * The family's index: every municipality page in this language, by comarca.
 * Since tranche 3 (947 towns) each comarca shows its largest towns and folds
 * the rest; its comarca page has them all, with their 2023 result, in a table.
 */
export function ElectionsHubPage({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const meta = hubMeta(locale);
  const copy = hubCopy(locale);
  const groups = byComarca(locale);
  const whole = new Intl.NumberFormat(INTL_LOCALE[locale], { maximumFractionDigits: 0 });
  const crumbs: Crumb[] = [
    { label: t.common.home, href: `/${locale}/` },
    { label: meta.h1, href: hubPath(locale) },
  ];

  return (
    <>
      <SiteHeader locale={locale} translations={hubTranslations()} activeSection={null} />
      <main id="main">
        <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
          <div className="ci-shell py-5 md:py-8 lg:py-12">
            <Breadcrumbs items={crumbs} locale={locale} />
            <h1 className="ci-measure">{meta.h1}</h1>
            <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{renderInline(copy.lead)}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-muted)]">
              <span className="ci-verified">
                <span className="ci-verified-dot" aria-hidden="true" />
                <time dateTime={latestDataDate()}>{copy.readLine}</time>
              </span>
            </div>
          </div>
        </header>

        <div className="ci-shell py-10">
          <div className="ci-prose">
            {copy.intro.map((text) => (
              <p key={text}>{renderInline(text)}</p>
            ))}

            <h2 id="comarques">{copy.listTitle}</h2>
            <nav aria-label={copy.jumpLabel} className="text-sm">
              <ul className="mt-1 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
                {groups.map((group) => (
                  <li key={group.comarca} className="!mt-0">
                    <a href={`#${comarcaAnchor(group.comarca)}`}>{group.comarca}</a>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="text-sm text-[var(--color-muted)]">{copy.listNote}</p>
            {/* 947 towns on one page: the largest of each comarca shown, the rest folded; styles sit on the lists to keep the HTML small. */}
            {groups.map((group) => {
              const visible = group.municipalities.slice(0, HUB_VISIBLE);
              const rest = group.municipalities.slice(HUB_VISIBLE);
              return (
                <section key={group.comarca} aria-labelledby={comarcaAnchor(group.comarca)}>
                  <h3 id={comarcaAnchor(group.comarca)}>{group.comarca}</h3>
                  {copy.table && isComarcaLocale(locale) ? (
                    <p className="!mt-1 text-sm">
                      <span className="text-[var(--color-muted)]">{copy.towns(group.municipalities.length)} · </span>
                      <Link href={comarcaPath(locale, group.slug)}>{copy.table(group.comarca)}</Link>
                    </p>
                  ) : null}
                  <ul className="mt-1 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 [&>li]:!mt-0 [&_span]:text-xs [&_span]:text-[var(--color-muted)]">
                    {visible.map((m) => (
                      <li key={m.slug}>
                        <Link href={electionPath(locale, m.slug)}>{placeName(m, locale)}</Link> <span>{whole.format(m.population)}</span>
                      </li>
                    ))}
                  </ul>
                  {rest.length > 0 ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">{copy.more(rest.length)}</summary>
                      <ul className="mt-2 list-none columns-2 gap-x-6 p-0 text-sm sm:columns-3 [&>li]:!mt-0 [&>li]:break-inside-avoid [&>li]:py-0.5">
                        {rest.map((m) => (
                          <li key={m.slug}>
                            <Link href={electionPath(locale, m.slug)}>{placeName(m, locale)}</Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </section>
              );
            })}

            <h2 id="guia">{copy.guideTitle}</h2>
            {copy.guide.map((text) => (
              <p key={text}>{renderInline(text)}</p>
            ))}

            <h2 id="fonts">{copy.sourcesTitle}</h2>
            <ul>
              {copy.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} rel="noopener nofollow" target="_blank">
                    {source.name}
                  </a>{" "}
                  <span className="text-[var(--color-muted)]">— {source.publisher}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs), electionHubDataset(locale)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
