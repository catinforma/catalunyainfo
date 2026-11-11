import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getMessages } from "@/lib/i18n";
import { widgetCopy } from "@/lib/programmatic/embed-2027/copy";
import { pickerGroups, widgetEditions, widgetPagePath, type EmbedLocale } from "@/lib/programmatic/embed-2027/places";
import { hubPath } from "@/lib/programmatic/holidays/paths";
import { HUB } from "@/lib/programmatic/spain-2027/copy";
import { HUB_INTL } from "@/lib/programmatic/spain-2027/copy-intl";
import { editionHubPath } from "@/lib/programmatic/spain-2027/editions";
import { spainHubPath } from "@/lib/programmatic/spain-2027/paths";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteOrigin } from "@/lib/site";

import { EmbedBuilder } from "./EmbedBuilder";

/**
 * "Posa el calendari laboral 2027 al teu web": the picker, a live preview of
 * the widget (/embed/…, lib/programmatic/embed-2027/) and the code to paste,
 * with a plain link for sites that allow no iframe. Linked from the three
 * 2027 hubs and from every town and city page.
 */

const LOCAL_HUB: Record<EmbedLocale, string> = {
  ca: "Festius locals de tots els municipis de Catalunya",
  es: "Festivos locales de todos los municipios de Cataluña",
  en: "Catalonia public holidays and local holidays",
};

function spainHub(locale: EmbedLocale): { href: string; label: string } {
  return locale === "es" ? { href: spainHubPath(), label: HUB.breadcrumb } : { href: editionHubPath(locale), label: HUB_INTL[locale].breadcrumb };
}

export function widgetCrumbs(locale: EmbedLocale): Crumb[] {
  const hub = spainHub(locale);
  return [
    { label: getMessages(locale).common.home, href: `/${locale}/` },
    { label: hub.label, href: hub.href },
    { label: widgetCopy(locale).breadcrumb, href: widgetPagePath(locale) },
  ];
}

export function widgetMetadata(locale: EmbedLocale): Metadata {
  const t = widgetCopy(locale);
  return buildMetadata({ locale, path: widgetPagePath(locale), title: t.title, description: t.description, translations: widgetEditions() });
}

export function WidgetRoute({ locale }: { locale: EmbedLocale }) {
  const t = widgetCopy(locale);
  const crumbs = widgetCrumbs(locale);
  const hub = spainHub(locale);
  return (
    <>
      <SiteHeader locale={locale} translations={widgetEditions()} />
      <main id="main">
        <article>
          <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
            <div className="ci-shell py-5 md:py-8 lg:py-12">
              <Breadcrumbs items={crumbs} locale={locale} />
              <h1 className="ci-measure">{t.h1}</h1>
              <p className="ci-measure mt-4 text-lg text-[var(--color-ink-soft)]">{t.lead}</p>
            </div>
          </header>

          <div className="ci-shell py-10">
            <div className="ci-prose">
              <EmbedBuilder
                groups={pickerGroups(locale)}
                initial="barcelona"
                origin={siteOrigin()}
                labels={{
                  picker: t.picker,
                  previewTitle: t.previewTitle,
                  codeTitle: t.codeTitle,
                  codeHelp: t.codeHelp,
                  copy: t.copy,
                  copied: t.copied,
                  linkTitle: t.linkTitle,
                  linkHelp: t.linkHelp,
                  snippetTitle: t.snippetTitle,
                }}
              />

              <h2>{t.showsTitle}</h2>
              <ul>
                {t.shows.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p>{t.updates}</p>

              <h2>{t.termsTitle}</h2>
              {t.terms.map((line) => (
                <p key={line}>{line}</p>
              ))}

              <h2>{t.moreTitle}</h2>
              <ul>
                <li>
                  <Link href={hub.href}>{hub.label}</Link>
                </li>
                <li>
                  <Link href={hubPath(locale)}>{LOCAL_HUB[locale]}</Link>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </main>
      <JsonLd json={graph([breadcrumbSchema(crumbs)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
