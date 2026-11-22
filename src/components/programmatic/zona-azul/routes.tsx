import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { cityView, hubView, type Faq } from "@/lib/programmatic/zona-azul/copy";
import { zaCityPath, zaCityTranslations, zaHubPath, zaHubTranslations } from "@/lib/programmatic/zona-azul/paths";
import type { City, ZaLocale } from "@/lib/programmatic/zona-azul/types";
import { breadcrumbSchema, graph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

import { CityPage, cityCrumbs, hubCrumbs } from "./CityPage";
import { HubPage } from "./HubPage";

/**
 * The bodies of the six route files of the family (a hub and a city page in
 * each of the three languages). The wrappers under `app/` only resolve the
 * parameters and declare the cache: static, since nothing in the server
 * render depends on the date (the "today" answer is worked out in the
 * browser) and the data only changes with a deploy.
 */

export const NOT_FOUND_METADATA: Metadata = { robots: { index: false, follow: false } };

/** FAQ markup for exactly the questions printed on the page. */
function faqNode(faq: Faq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };
}

export function zaHubMetadata(locale: ZaLocale): Metadata {
  const v = hubView(locale);
  return buildMetadata({ locale, path: zaHubPath(locale), title: v.title, description: v.description, translations: zaHubTranslations() });
}

export function zaCityMetadata(locale: ZaLocale, city: City): Metadata {
  const v = cityView(city, locale);
  return buildMetadata({ locale, path: zaCityPath(locale, city.slug), title: v.title, description: v.description, translations: zaCityTranslations(city.slug) });
}

export function ZaHubRoute({ locale }: { locale: ZaLocale }) {
  return (
    <>
      <SiteHeader locale={locale} translations={zaHubTranslations()} activeSection={null} />
      <main id="main">
        <HubPage locale={locale} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(hubCrumbs(locale)), faqNode(hubView(locale).faq)])} />
      <SiteFooter locale={locale} />
    </>
  );
}

export function ZaCityRoute({ locale, city }: { locale: ZaLocale; city: City }) {
  return (
    <>
      <SiteHeader locale={locale} translations={zaCityTranslations(city.slug)} activeSection={null} />
      <main id="main">
        <CityPage city={city} locale={locale} />
      </main>
      <JsonLd json={graph([breadcrumbSchema(cityCrumbs(city, locale)), faqNode(cityView(city, locale).faq)])} />
      <SiteFooter locale={locale} />
    </>
  );
}
